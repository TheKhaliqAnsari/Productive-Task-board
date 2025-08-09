import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import dbModule from "@/lib/db";
import authModule from "@/lib/auth";
import { randomUUID } from "crypto";

export const runtime = "nodejs";

const { getDB, saveDB, getTasksByBoardId } = dbModule;
const { verifyToken, getUserFromToken } = authModule;

function isValidUUID(id) {
  return typeof id === "string" && /^[0-9a-fA-F-]{36}$/.test(id);
}
function isValidISODate(s) {
  if (typeof s !== "string" || !s) return false;
  const d = new Date(s);
  return !isNaN(d.getTime());
}

function getAuthUser() {
  const token = cookies().get("token")?.value || null;
  if (!token) return null;
  const decoded = verifyToken(token);
  if (!decoded) return null;
  return getUserFromToken(token);
}

export async function GET(_request, { params }) {
  const user = getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const segments = Array.isArray(params?.route) ? params.route : [];
  const boardId = segments[0];
  if (!boardId || !isValidUUID(boardId)) return NextResponse.json({ error: "Invalid board id" }, { status: 400 });

  const db = getDB();
  const board = db.boards.find((b) => b.id === boardId);
  if (!board) return NextResponse.json({ error: "Board not found" }, { status: 404 });
  if (board.userId !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const tasks = getTasksByBoardId(boardId);
  return NextResponse.json({ tasks }, { status: 200 });
}

export async function POST(request) {
  const user = getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }); }

  const boardId = String(body?.boardId ?? "").trim();
  const title = String(body?.title ?? "").trim();
  const description = typeof body?.description === "string" ? body.description.trim() : undefined;
  let dueDate = typeof body?.dueDate === "string" ? body.dueDate.trim() : undefined;

  if (!boardId || !isValidUUID(boardId)) return NextResponse.json({ error: "Invalid board id" }, { status: 400 });
  if (!title) return NextResponse.json({ error: "title is required" }, { status: 400 });
  if (dueDate && !isValidISODate(dueDate)) return NextResponse.json({ error: "Invalid dueDate" }, { status: 400 });

  const db = getDB();
  const board = db.boards.find((b) => b.id === boardId);
  if (!board) return NextResponse.json({ error: "Board not found" }, { status: 404 });
  if (board.userId !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const now = new Date().toISOString();
  const task = { id: randomUUID(), boardId, title, description, status: "pending", dueDate, createdAt: now };
  db.tasks.push(task);
  saveDB(db);
  return NextResponse.json({ task }, { status: 201 });
}

export async function PUT(request, { params }) {
  const user = getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const segments = Array.isArray(params?.route) ? params.route : [];
  const id = segments[0];
  if (!id || !isValidUUID(id)) return NextResponse.json({ error: "Invalid task id" }, { status: 400 });

  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }); }

  const db = getDB();
  const task = db.tasks.find((t) => t.id === id);
  if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });
  const board = db.boards.find((b) => b.id === task.boardId);
  if (!board || board.userId !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  if (typeof body.title === "string") task.title = body.title.trim();
  if (typeof body.description === "string") task.description = body.description.trim();
  if (typeof body.status === "string") {
    const s = body.status.trim();
    if (s !== "pending" && s !== "completed") return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    task.status = s;
  }
  if (typeof body.dueDate === "string" || body.dueDate === null) {
    if (typeof body.dueDate === "string" && body.dueDate && !isValidISODate(body.dueDate)) return NextResponse.json({ error: "Invalid dueDate" }, { status: 400 });
    task.dueDate = body.dueDate || undefined;
  }

  saveDB(db);
  return NextResponse.json({ task }, { status: 200 });
}

export async function DELETE(request, { params }) {
  const user = getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const segments = Array.isArray(params?.route) ? params.route : [];
  const id = segments[0];
  if (!id || !isValidUUID(id)) return NextResponse.json({ error: "Invalid task id" }, { status: 400 });

  const db = getDB();
  const index = db.tasks.findIndex((t) => t.id === id);
  if (index === -1) return NextResponse.json({ error: "Task not found" }, { status: 404 });
  const task = db.tasks[index];
  const board = db.boards.find((b) => b.id === task.boardId);
  if (!board || board.userId !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  db.tasks.splice(index, 1);
  saveDB(db);
  return NextResponse.json({ message: "Task deleted" }, { status: 200 });
}

export async function PATCH(request, { params }) {
  const user = getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const segments = Array.isArray(params?.route) ? params.route : [];
  if (segments[0] !== "reorder") return NextResponse.json({ error: "Not found" }, { status: 404 });

  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }); }

  const ids = Array.isArray(body?.ids) ? body.ids.map(String) : null;
  if (!ids || ids.length === 0) return NextResponse.json({ error: "ids array is required" }, { status: 400 });
  if (!ids.every(isValidUUID)) return NextResponse.json({ error: "Invalid task id in ids" }, { status: 400 });

  const db = getDB();
  const involvedBoardIds = new Set();
  for (const id of ids) {
    const t = db.tasks.find((x) => x.id === id);
    if (!t) continue;
    involvedBoardIds.add(t.boardId);
  }
  for (const bId of involvedBoardIds) {
    const b = db.boards.find((x) => x.id === bId);
    if (!b || b.userId !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const idSet = new Set(ids);
  const listed = db.tasks.filter((t) => idSet.has(t.id));
  const unlisted = db.tasks.filter((t) => !idSet.has(t.id));
  const reordered = ids.map((id) => listed.find((t) => t.id === id)).filter(Boolean);
  db.tasks = [...reordered, ...unlisted];
  saveDB(db);

  return NextResponse.json({ message: "Reordered" }, { status: 200 });
} 