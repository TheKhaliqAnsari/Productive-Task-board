"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";
import { useToast } from "@/components/Toast";
import { motion } from "framer-motion";

export default function DashboardPage() {
  const router = useRouter();
  const { addToast } = useToast();

  const [user, setUser] = useState(null);
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [newBoardName, setNewBoardName] = useState("");

  useEffect(() => {
    async function bootstrap() {
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
        if (!bRes.ok) {
          const bErr = await bRes.json().catch(() => ({}));
          setError(bErr?.error || "Failed to load boards");
        } else {
          const bData = await bRes.json().catch(() => ({ boards: [] }));
          setBoards(Array.isArray(bData.boards) ? bData.boards : []);
        }
      } catch (_err) {
        setError("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    bootstrap();
  }, [router]);

  async function handleLogout() {
    try { await fetch("/api/auth/logout", { method: "POST" }); } catch {}
    addToast({ type: "success", message: "Logged out" });
    router.replace("/login");
  }

  async function createBoard(e) {
    e.preventDefault();
    setError("");
    const name = newBoardName.trim();
    if (!name) {
      const msg = "Board name is required";
      setError(msg);
      addToast({ type: "error", message: msg });
      return;
    }
    try {
      const res = await fetch("/api/boards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = data?.error || "Failed to create board";
        setError(msg);
        addToast({ type: "error", message: msg });
        return;
      }
      setBoards((prev) => [data.board, ...prev]);
      setNewBoardName("");
      addToast({ type: "success", message: "Board created" });
    } catch (_err) {
      const msg = "Network error. Please try again.";
      setError(msg);
      addToast({ type: "error", message: msg });
    }
  }

  async function renameBoard(id) {
    const current = boards.find((b) => b.id === id);
    if (!current) return;
    const name = prompt("Rename board", current.name)?.trim();
    if (!name) return;
    setError("");
    try {
      const res = await fetch(`/api/boards/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = data?.error || "Failed to rename board";
        setError(msg);
        addToast({ type: "error", message: msg });
        return;
      }
      setBoards((prev) => prev.map((b) => (b.id === id ? data.board : b)));
      addToast({ type: "success", message: "Board renamed" });
    } catch (_err) {
      const msg = "Network error. Please try again.";
      setError(msg);
      addToast({ type: "error", message: msg });
    }
  }

  async function deleteBoard(id) {
    if (!confirm("Delete this board? This will also delete its tasks.")) return;
    setError("");
    try {
      const res = await fetch(`/api/boards/${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = data?.error || "Failed to delete board";
        setError(msg);
        addToast({ type: "error", message: msg });
        return;
      }
      setBoards((prev) => prev.filter((b) => b.id !== id));
      addToast({ type: "success", message: "Board deleted" });
    } catch (_err) {
      const msg = "Network error. Please try again.";
      setError(msg);
      addToast({ type: "error", message: msg });
    }
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100">
      <header className="border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Dashboard</h1>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {user ? `Signed in as ${user.username}` : ""}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* <ThemeToggle /> */}
            <button onClick={handleLogout} className="px-3 py-1 rounded-md bg-blue-500 hover:bg-blue-600 text-white text-sm">Logout</button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <section className="mb-6">
          <form onSubmit={createBoard} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={newBoardName}
              onChange={(e) => setNewBoardName(e.target.value)}
              placeholder="New board name"
              className="flex-1 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <motion.button whileTap={{ scale: 0.98 }} type="submit" className="inline-flex items-center justify-center rounded-md bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-2">
              Create Board
            </motion.button>
          </form>
          {error && <p className="mt-3 text-sm text-red-600 dark:text-red-400" role="alert">{error}</p>}
        </section>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {boards.map((b) => (
                <motion.div key={b.id} whileHover={{ scale: 1.01 }} className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-lg font-semibold"><a href={`/boards/${b.id}`} className="hover:underline text-blue-600 dark:text-blue-400">{b.name}</a></h2>
                      <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">Created {new Date(b.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="flex gap-2">
                      <a href={`/boards/${b.id}`} className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 text-sm hover:bg-gray-50 dark:hover:bg-gray-700">Open</a>
                      <button onClick={() => renameBoard(b.id)} className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 text-sm hover:bg-gray-50 dark:hover:bg-gray-700">Rename</button>
                      <button onClick={() => deleteBoard(b.id)} className="px-3 py-1 rounded-md bg-red-500 hover:bg-red-600 text-white text-sm">Delete</button>
                    </div>
                  </div>
                </motion.div>
              ))}
              {boards.length === 0 && (
                <p className="text-sm text-gray-600 dark:text-gray-300">No boards yet. Create your first board above.</p>
              )}
            </div>
          </motion.section>
        )}
      </main>
    </div>
  );
} 