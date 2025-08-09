"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/components/Toast";
import { motion } from "framer-motion";
import { DndContext, closestCorners, PointerSensor, useSensor, useSensors, DragOverlay } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const COLUMNS = [
  { key: "pending", label: "Pending" },
  { key: "completed", label: "Completed" },
];

function groupTasks(tasks) {
  return {
    pending: tasks.filter((t) => t.status === "pending"),
    completed: tasks.filter((t) => t.status === "completed"),
  };
}

function daysUntil(dateIso) {
  if (!dateIso) return null;
  const due = new Date(dateIso);
  const now = new Date();
  const ms = due.getTime() - now.getTime();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

function SortableTaskCard({ task, onToggle, onDelete, onInlineSave, view }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.8 : 1, cursor: "grab" };
  const dueIn = daysUntil(task.dueDate);

  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");

  async function handleSave(e) {
    e.preventDefault();
    const t = title.trim();
    if (!t) return;
    await onInlineSave(task.id, { title: t, description: description.trim() || undefined });
    setIsEditing(false);
  }

  return (
    <motion.div ref={setNodeRef} style={style} whileHover={{ scale: 1.01 }} className="rounded-xl border border-gray-800 bg-gray-900 p-4 shadow-sm" {...attributes} {...listeners}>
      <div className={`${view === "grid" ? "flex flex-col gap-3" : "flex items-start justify-between"}`}>
        <div className="flex items-start gap-3">
          <div>
            {isEditing ? (
              <form onSubmit={handleSave} className="space-y-2">
                <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-md border border-gray-700 bg-gray-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="w-full rounded-md border border-gray-700 bg-gray-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <div className="flex gap-2 text-sm">
                  <button type="submit" className="px-3 py-1 rounded-md bg-blue-500 hover:bg-blue-600 text-white">Save</button>
                  <button type="button" onClick={() => { setIsEditing(false); setTitle(task.title); setDescription(task.description ?? ""); }} className="px-3 py-1 rounded-md border border-gray-700">Cancel</button>
                </div>
              </form>
            ) : (
              <>
                <h3 className="text-base font-semibold text-gray-100">{task.title}</h3>
                {task.description && (
                  <p className="text-sm text-gray-300 mt-1">{task.description}</p>
                )}
                <div className="text-xs text-gray-400 mt-1">
                  {task.dueDate && (
                    <span>
                      Due {new Date(task.dueDate).toLocaleDateString()} {" "}
                      {typeof dueIn === "number" && (
                        <em className={dueIn < 0 ? "text-red-500" : "text-gray-400"}>
                          ({dueIn < 0 ? `${Math.abs(dueIn)}d overdue` : `${dueIn}d left`})
                        </em>
                      )}
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isEditing && (
            <>
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="checkbox" checked={task.status === "completed"} onChange={(e) => onToggle(task.id, e.target.checked)} />
                <span>{task.status === "completed" ? "Completed" : "Pending"}</span>
              </label>
              <button onClick={() => setIsEditing(true)} className="px-3 py-1 rounded-md border border-gray-700 text-sm">Edit</button>
              <button onClick={() => onDelete(task.id)} className="px-3 py-1 rounded-md bg-red-500 hover:bg-red-600 text-white text-sm">Delete</button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function BoardPage() {
  const router = useRouter();
  const params = useParams();
  const { addToast } = useToast();

  const boardId = useMemo(() => String(params?.boardId || ""), [params]);

  const [user, setUser] = useState(null);
  const [board, setBoard] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [view, setView] = useState("list");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    async function bootstrap() {
      if (!boardId) return;
      setLoading(true);
      setError("");
      try {
        const meRes = await fetch("/api/auth/me", { cache: "no-store" });
        const me = await meRes.json().catch(() => ({ user: null }));
        if (!me?.user) { router.replace("/login"); return; }
        setUser(me.user);

        const bRes = await fetch("/api/boards", { cache: "no-store" });
        const bData = await bRes.json().catch(() => ({ boards: [] }));
        const current = (bData.boards || []).find((b) => b.id === boardId);
        if (!current) { setError("Board not found"); return; }
        setBoard(current);

        const tRes = await fetch(`/api/tasks/${boardId}`, { cache: "no-store" });
        if (!tRes.ok) { const tErr = await tRes.json().catch(() => ({})); setError(tErr?.error || "Failed to load tasks"); }
        else { const tData = await tRes.json().catch(() => ({ tasks: [] })); setTasks(Array.isArray(tData.tasks) ? tData.tasks : []); }
      } catch { setError("Network error. Please try again."); }
      finally { setLoading(false); }
    }
    bootstrap();
  }, [router, boardId]);

  async function renameBoard() {
    if (!board) return;
    const name = prompt("Rename board", board.name)?.trim();
    if (!name) return;
    try {
      const res = await fetch(`/api/boards/${board.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { const m = data?.error || "Failed to rename board"; setError(m); addToast({ type: "error", message: m }); return; }
      setBoard(data.board);
      addToast({ type: "success", message: "Board renamed" });
    } catch { const m = "Network error. Please try again."; setError(m); addToast({ type: "error", message: m }); }
  }

  async function createTask(e) {
    e.preventDefault();
    setError("");
    const t = title.trim();
    if (!t) { const m = "Title is required"; setError(m); addToast({ type: "error", message: m }); return; }
    try {
      const res = await fetch("/api/tasks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ boardId, title: t, description: description.trim() || undefined, dueDate: dueDate ? new Date(dueDate).toISOString() : undefined }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { const m = data?.error || "Failed to create task"; setError(m); addToast({ type: "error", message: m }); return; }
      setTasks((prev) => [data.task, ...prev]);
      setTitle(""); setDescription(""); setDueDate("");
      addToast({ type: "success", message: "Task created" });
    } catch { const m = "Network error. Please try again."; setError(m); addToast({ type: "error", message: m }); }
  }

  async function inlineSaveTask(id, patch) {
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(patch) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { const m = data?.error || "Failed to update task"; setError(m); addToast({ type: "error", message: m }); return; }
      setTasks((prev) => prev.map((t) => (t.id === id ? data.task : t)));
      addToast({ type: "success", message: "Task updated" });
    } catch { const m = "Network error. Please try again."; setError(m); addToast({ type: "error", message: m }); }
  }

  async function toggleStatus(id, checked) {
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: checked ? "completed" : "pending" }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { const m = data?.error || "Failed to update task"; setError(m); addToast({ type: "error", message: m }); return; }
      setTasks((prev) => prev.map((t) => (t.id === id ? data.task : t)));
    } catch { const m = "Network error. Please try again."; setError(m); addToast({ type: "error", message: m }); }
  }

  async function deleteTask(id) {
    if (!confirm("Delete this task?")) return;
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { const m = data?.error || "Failed to delete task"; setError(m); addToast({ type: "error", message: m }); return; }
      setTasks((prev) => prev.filter((t) => t.id !== id));
      addToast({ type: "success", message: "Task deleted" });
    } catch { const m = "Network error. Please try again."; setError(m); addToast({ type: "error", message: m }); }
  }

  function findContainer(id) {
    const grouped = groupTasks(tasks);
    for (const col of COLUMNS) {
      if (grouped[col.key].some((t) => t.id === id)) return col.key;
    }
    return null;
  }

  function onDragStart(event) {
    setActiveId(event.active.id);
  }

  async function onDragEnd(event) {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const activeCol = findContainer(active.id);
    let overCol = findContainer(over.id);

    // If dropping into a column container, infer from dataset
    if (!overCol && over?.data?.current?.columnKey) {
      overCol = over.data.current.columnKey;
    }

    if (!activeCol || !overCol) return;

    setTasks((prev) => {
      const grouped = groupTasks(prev);
      const from = grouped[activeCol];
      const to = grouped[overCol];

      const activeIndex = from.findIndex((t) => t.id === active.id);
      const overIndex = overCol === activeCol
        ? from.findIndex((t) => t.id === over.id)
        : to.findIndex((t) => t.id === over.id);

      const activeTask = from[activeIndex];
      // Remove from source
      const newFrom = [...from];
      newFrom.splice(activeIndex, 1);

      let newTo;
      if (overCol === activeCol) {
        newTo = arrayMove(from, activeIndex, overIndex);
      } else {
        newTo = [...to];
        const insertAt = overIndex >= 0 ? overIndex : newTo.length;
        newTo.splice(insertAt, 0, { ...activeTask, status: overCol });
      }

      const next = prev.map((t) => {
        if (t.id === active.id) return { ...t, status: overCol };
        return t;
      });

      // Merge back grouped lists into linear order (preserve existing order across columns)
      const merged = [
        ...next.filter((t) => t.status === "pending"),
        ...next.filter((t) => t.status === "completed"),
      ];

      // Persist status change
      fetch(`/api/tasks/${active.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: overCol }) }).catch(() => {});

      // Persist new global order
      fetch("/api/tasks/reorder", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids: merged.map((t) => t.id) }) }).catch(() => {});

      return merged;
    });
  }

  const grouped = groupTasks(tasks);

  if (!boardId) return null;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <header className="border-b border-gray-800">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-sm text-blue-400 hover:underline">← Back</Link>
            <h1 className="text-xl font-bold">{board ? board.name : "Board"}</h1>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={renameBoard} className="px-3 py-1 rounded-md bg-blue-500 hover:bg-blue-600 text-white text-sm">Rename Board</button>
            <button onClick={() => setView(view === "list" ? "grid" : "list")} className="px-3 py-1 rounded-md border border-gray-700 text-sm">
              {view === "list" ? "Grid view" : "List view"}
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {!loading && !board ? (
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-6 text-center">
            <p className="mb-4">Board not found.</p>
            <Link href="/dashboard" className="px-4 py-2 inline-flex rounded-md bg-blue-500 hover:bg-blue-600 text-white">Go to Dashboard</Link>
          </div>
        ) : (
          <>
            <section className="mb-6">
              <form onSubmit={createTask} className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Task title" className="md:col-span-1 rounded-md border border-gray-700 bg-gray-950 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description (optional)" className="md:col-span-2 rounded-md border border-gray-700 bg-gray-950 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="md:col-span-1 rounded-md border border-gray-700 bg-gray-950 px-3 py-2" />
                <div className="md:col-span-4">
                  <motion.button whileTap={{ scale: 0.98 }} type="submit" className="inline-flex items-center justify-center rounded-md bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-2">Add Task</motion.button>
                </div>
              </form>
              {error && (<p className="mt-3 text-sm text-red-500" role="alert">{error}</p>)}
            </section>

            {loading ? (
              <p>Loading...</p>
            ) : (
              <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={onDragStart} onDragEnd={onDragEnd}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {COLUMNS.map((col) => (
                      <div key={col.key} className="rounded-xl border border-gray-800 bg-gray-900">
                        <div className="px-3 py-2 border-b border-gray-800 flex items-center justify-between">
                          <h3 className="text-sm font-semibold text-white/90">{col.label}</h3>
                          <span className="text-xs text-white/50">{grouped[col.key].length}</span>
                        </div>
                        <SortableContext items={grouped[col.key].map((t) => t.id)} strategy={verticalListSortingStrategy}>
                          <div
                            className="p-3 min-h-[120px] space-y-3"
                            data-column-key={col.key}
                            // Pass column key in droppable data for over detection
                            {...{}}
                          >
                            {grouped[col.key].map((t) => (
                              <SortableTaskCard key={t.id} task={t} onToggle={toggleStatus} onDelete={deleteTask} onInlineSave={inlineSaveTask} view="list" />
                            ))}
                            {grouped[col.key].length === 0 && (
                              <p className="text-xs text-white/40">Drop tasks here</p>
                            )}
                          </div>
                        </SortableContext>
                      </div>
                    ))}
                  </div>
                </DndContext>
              </motion.section>
            )}
          </>
        )}
      </main>
    </div>
  );
} 