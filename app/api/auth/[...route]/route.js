import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import dbModule from "@/lib/db";
import authModule from "@/lib/auth";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

export const runtime = "nodejs";

const {
  getDB,
  saveDB,
  getUserByUsername,
} = dbModule;

const { generateToken, verifyToken, getUserFromToken } = authModule;

/**
 * Validate registration/login payloads.
 * @param {any} body
 * @returns {{ valid: boolean, username?: string, password?: string, error?: string }}
 */
function validateCredentials(body) {
  if (!body || typeof body !== "object") {
    return { valid: false, error: "Invalid JSON body" };
  }
  const username = String(body.username ?? "").trim();
  const password = String(body.password ?? "").trim();

  if (!username || !password) {
    return { valid: false, error: "Username and password are required" };
  }
  if (username.length < 3) {
    return { valid: false, error: "Username must be at least 3 characters" };
  }
  if (password.length < 6) {
    return { valid: false, error: "Password must be at least 6 characters" };
  }
  return { valid: true, username, password };
}

/**
 * GET /api/auth/me -> return user from JWT
 */
export async function GET() {
  const token = cookies().get("token")?.value || null;
  if (!token) return NextResponse.json({ user: null }, { status: 200 });
  const decoded = verifyToken(token);
  if (!decoded) return NextResponse.json({ user: null }, { status: 200 });
  const user = getUserFromToken(token);
  return NextResponse.json({ user }, { status: 200 });
}

/**
 * Handle POST requests for /api/auth/register, /api/auth/login, /api/auth/logout
 */
export async function POST(request, { params }) {
  const segments = Array.isArray(params?.route) ? params.route : [];
  const action = segments[0] || "";

  // Logout does not require JSON body
  if (action === "logout") {
    const res = NextResponse.json({ message: "Logged out" }, { status: 200 });
    res.cookies.set("token", "", {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
      maxAge: 0,
    });
    return res;
  }

  let body;
  try {
    body = await request.json();
  } catch (_err) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const validation = validateCredentials(body);
  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }
  const { username, password } = validation;

  if (action === "register") {
    const existing = getUserByUsername(username);
    if (existing) {
      return NextResponse.json({ error: "Username already exists" }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = { id: randomUUID(), username, password: hashed };

    const db = getDB();
    db.users.push(user);
    saveDB(db);

    return NextResponse.json({ message: "Registration successful" }, { status: 201 });
  }

  if (action === "login") {
    const user = getUserByUsername(username);
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = generateToken({ id: user.id, username: user.username });

    const res = NextResponse.json(
      { user: { id: user.id, username: user.username } },
      { status: 200 }
    );

    res.cookies.set("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60, // 1 hour
    });

    return res;
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 });
} 