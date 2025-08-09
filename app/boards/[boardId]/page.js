"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import { useToast } from "@/components/Toast";
import { motion } from "framer-motion";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function daysUntil(dateIso) {
  if (!dateIso) return null;
  const due = new Date(dateIso);
  const now = new Date();
  const ms = due.getTime() - now.getTime();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

function SortableTaskCard({ task, onToggle, onDelete, view }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.8 : 1 };
  const dueIn = daysUntil(task.dueDate);

  return (
    <motion.div ref={setNodeRef} style={style} whileHover={{ scale: 1.01 }} className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 shadow-sm">
      <div className={`${view === "grid" ? "flex flex-col gap-3" : "flex items-start justify-between"}`}>
        <div className="flex items-start gap-3">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing px-2 py-1 rounded-md border border-gray-300 dark:border-gray-600 text-xs text-gray-600 dark:text-gray-300"
            aria-label={`Drag task ${task.title}`}
          >
            Drag
          </button>
          <div>
            <h3 className="text-base font-semibold">{task.title}</h3>
            {task.description && (
              <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{task.description}</p>
            )}
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {task.dueDate && (
                <span>
                  Due {new Date(task.dueDate).toLocaleDateString()} {" "}
                  {typeof dueIn === "number" && (
                    <em className={dueIn < 0 ? "text-red-500" : "text-gray-500"}>
                      ({dueIn < 0 ? `${Math.abs(dueIn)}d overdue` : `${dueIn}d left`})
                    </em>
                  )}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" checked={task.status === "completed"} onChange={(e) => onToggle(task.id, e.target.checked)} />
            <span>{task.status === "completed" ? "Completed" : "Pending"}</span>
          </label>
          <button onClick={() => onDelete(task.id)} className="px-3 py-1 rounded-md bg-red-500 hover:bg-red-600 text-white text-sm">Delete</button>
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
  const [view, setView] = useState("list"); // list or grid

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  useEffect(() => {
    async function bootstrap() {
      if (!boardId) return;
      setLoading(true);
      setError("");
      try {
        const meRes = await fetch("/api/auth/me", { cache: "no-store" });
        const me = await meRes.json().catch(() => ({ user: null }));
        if (!me?.user) {
          router.replace("/login");
          return;
        }
        setUser(me.user);

        const bRes = await fetch("/api/boards", { cache: "no-store" });
        const bData = await bRes.json().catch(() => ({ boards: [] }));
        const current = (bData.boards || []).find((b) => b.id === boardId);
        if (!current) {
          setError("Board not found");
          return;
        }
        setBoard(current);

        const tRes = await fetch(`/api/tasks/${boardId}`, { cache: "no-store" });
        if (!tRes.ok) {
          const tErr = await tRes.json().catch(() => ({}));
          setError(tErr?.error || "Failed to load tasks");
        } else {
          const tData = await tRes.json().catch(() => ({ tasks: [] }));
          setTasks(Array.isArray(tData.tasks) ? tData.tasks : []);
        }
      } catch (_err) {
        setError("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
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
      if (!res.ok) { setError(data?.error || "Failed to rename board"); addToast({ type: "error", message: data?.error || "Failed to rename board" }); return; }
      setBoard(data.board);
      addToast({ type: "success", message: "Board renamed" });
    } catch (_err) {
      const msg = "Network error. Please try again.";
      setError(msg);
      addToast({ type: "error", message: msg });
    }
  }

  async function createTask(e) {
    e.preventDefault();
    setError("");
    const t = title.trim();
    if (!t) { const msg = "Title is required"; setError(msg); addToast({ type: "error", message: msg }); return; }
    try {
      const res = await fetch("/api/tasks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ boardId, title: t, description: description.trim() || undefined, dueDate: dueDate ? new Date(dueDate).toISOString() : undefined }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { const msg = data?.error || "Failed to create task"; setError(msg); addToast({ type: "error", message: msg }); return; }
      setTasks((prev) => [data.task, ...prev]);
      setTitle(""); setDescription(""); setDueDate("");
      addToast({ type: "success", message: "Task created" });
    } catch (_err) { const msg = "Network error. Please try again."; setError(msg); addToast({ type: "error", message: msg }); }
  }

  async function toggleStatus(id, checked) {
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: checked ? "completed" : "pending" }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { const msg = data?.error || "Failed to update task"; setError(msg); addToast({ type: "error", message: msg }); return; }
      setTasks((prev) => prev.map((t) => (t.id === id ? data.task : t)));
    } catch (_err) { const msg = "Network error. Please try again."; setError(msg); addToast({ type: "error", message: msg }); }
  }

  async function deleteTask(id) {
    if (!confirm("Delete this task?")) return;
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { const msg = data?.error || "Failed to delete task"; setError(msg); addToast({ type: "error", message: msg }); return; }
      setTasks((prev) => prev.filter((t) => t.id !== id));
      addToast({ type: "success", message: "Task deleted" });
    } catch (_err) { const msg = "Network error. Please try again."; setError(msg); addToast({ type: "error", message: msg }); }
  }

  function onDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setTasks((prev) => {
      const oldIndex = prev.findIndex((t) => t.id === active.id);
      const newIndex = prev.findIndex((t) => t.id === over.id);
      const next = arrayMove(prev, oldIndex, newIndex);
      const ids = next.map((t) => t.id);
      fetch("/api/tasks/reorder", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids }) }).catch(() => {});
      return next;
    });
  }

  if (!boardId) return null;

  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100">
      <header className="border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">← Back</Link>
            <h1 className="text-xl font-bold">{board ? board.name : "Board"}</h1>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button onClick={renameBoard} className="px-3 py-1 rounded-md bg-blue-500 hover:bg-blue-600 text-white text-sm">Rename Board</button>
            <button onClick={() => setView(view === "list" ? "grid" : "list")} className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 text-sm">
              {view === "list" ? "Grid view" : "List view"}
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {!loading && !board ? (
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 text-center">
            <p className="mb-4">Board not found.</p>
            <Link href="/dashboard" className="px-4 py-2 inline-flex rounded-md bg-blue-500 hover:bg-blue-600 text-white">Go to Dashboard</Link>
          </div>
        ) : (
          <>
            <section className="mb-6">
              <form onSubmit={createTask} className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Task title" className="md:col-span-1 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description (optional)" className="md:col-span-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="md:col-span-1 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2" />
                <div className="md:col-span-4">
                  <motion.button whileTap={{ scale: 0.98 }} type="submit" className="inline-flex items-center justify-center rounded-md bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-2">Add Task</motion.button>
                </div>
              </form>
              {error && (<p className="mt-3 text-sm text-red-600 dark:text-red-400" role="alert">{error}</p>)}
            </section>

            {loading ? (
              <p>Loading...</p>
            ) : (
              <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                  <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                    <div className={view === "grid" ? "grid grid-cols-1 md:grid-cols-2 gap-3" : "space-y-3"}>
                      {tasks.map((t) => (
                        <SortableTaskCard key={t.id} task={t} onToggle={toggleStatus} onDelete={deleteTask} view={view} />
                      ))}
                      {tasks.length === 0 && (
                        <p className="text-sm text-gray-600 dark:text-gray-300">No tasks yet. Add one above.</p>
                      )}
                    </div>
                  </SortableContext>
                </DndContext>
              </motion.section>
            )}
          </>
        )}
      </main>
    </div>
  );
} 