import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import dbModule from "@/lib/db";
import authModule from "@/lib/auth";
import { randomUUID } from "crypto";

export const runtime = "nodejs";

const { getDB, saveDB, getBoardsByUserId } = dbModule;
const { verifyToken, getUserFromToken } = authModule;

function isValidUUID(id) {
  return typeof id === "string" && /^[0-9a-fA-F-]{36}$/.test(id);
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
  const boards = getBoardsByUserId(user.id);
  return NextResponse.json({ boards }, { status: 200 });
}

export async function POST(request, { params }) {
  const user = getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }); }
  const name = String(body?.name ?? "").trim();
  if (!name) return NextResponse.json({ error: "Board name is required" }, { status: 400 });

  const db = getDB();
  const now = new Date().toISOString();
  const board = { id: randomUUID(), userId: user.id, name, createdAt: now };
  db.boards.push(board);
  saveDB(db);
  return NextResponse.json({ board }, { status: 201 });
}

export async function PUT(request, { params }) {
  const user = getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const segments = Array.isArray(params?.route) ? params.route : [];
  const id = segments[0];
  if (!id || !isValidUUID(id)) return NextResponse.json({ error: "Invalid board id" }, { status: 400 });

  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }); }
  const name = String(body?.name ?? "").trim();
  if (!name) return NextResponse.json({ error: "Board name is required" }, { status: 400 });

  const db = getDB();
  const board = db.boards.find((b) => b.id === id);
  if (!board) return NextResponse.json({ error: "Board not found" }, { status: 404 });
  if (board.userId !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  board.name = name;
  saveDB(db);
  return NextResponse.json({ board }, { status: 200 });
}

export async function DELETE(request, { params }) {
  const user = getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const segments = Array.isArray(params?.route) ? params.route : [];
  const id = segments[0];
  if (!id || !isValidUUID(id)) return NextResponse.json({ error: "Invalid board id" }, { status: 400 });

  const db = getDB();
  const boardIndex = db.boards.findIndex((b) => b.id === id);
  if (boardIndex === -1) return NextResponse.json({ error: "Board not found" }, { status: 404 });
  if (db.boards[boardIndex].userId !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const [removed] = db.boards.splice(boardIndex, 1);
  db.tasks = db.tasks.filter((t) => t.boardId !== id);
  saveDB(db);
  return NextResponse.json({ message: "Board deleted", board: removed }, { status: 200 });
} 