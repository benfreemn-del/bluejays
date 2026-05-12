import { NextRequest, NextResponse } from "next/server";
import {
  listUsers,
  createUser,
  updateUser,
  currentUserFromCookies,
} from "@/lib/bluejays-auth";

/**
 * GET    /api/dashboard/team             — list every BlueJays user
 * POST   /api/dashboard/team             — create one (owner-only)
 * PATCH  /api/dashboard/team             — update one (owner-only)
 *
 * Owner-only writes: enforced by checking the bj_role cookie. Legacy
 * env-password sessions don't have a user row but `bj_role` is set
 * to "owner" — they pass.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isOwner(req: NextRequest): boolean {
  const role = req.cookies.get("bj_role")?.value;
  // If a DB user is present, also require role=owner; else fall back to
  // role cookie alone (legacy env-password Ben).
  return role === "owner";
}

export async function GET() {
  try {
    const users = await listUsers();
    return NextResponse.json({
      ok: true,
      users: users.map((u) => ({
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role,
        active: u.active,
        has_password: !!u.password_hash,
        last_login_at: u.last_login_at,
        created_at: u.created_at,
      })),
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!isOwner(req)) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }
  let body: { email?: string; name?: string; role?: "owner" | "sales"; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid JSON" }, { status: 400 });
  }
  if (!body.email || !body.name || !body.role) {
    return NextResponse.json({ ok: false, error: "email, name, role required" }, { status: 400 });
  }
  try {
    const user = await createUser({
      email: body.email,
      name: body.name,
      role: body.role,
      password: body.password,
    });
    return NextResponse.json({ ok: true, user });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  if (!isOwner(req)) {
    // Allow a user to update THEIR OWN password if they're logged in.
    const currentUser = await currentUserFromCookies(req.cookies);
    const body = await req.clone().json().catch(() => ({}));
    if (!currentUser || currentUser.id !== body.id || !body.password) {
      return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
    }
    try {
      const user = await updateUser(body.id, { password: body.password });
      return NextResponse.json({ ok: true, user });
    } catch (e) {
      return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
    }
  }
  let body: {
    id?: string;
    name?: string;
    role?: "owner" | "sales";
    active?: boolean;
    password?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid JSON" }, { status: 400 });
  }
  if (!body.id) {
    return NextResponse.json({ ok: false, error: "id required" }, { status: 400 });
  }
  try {
    const user = await updateUser(body.id, body);
    return NextResponse.json({ ok: true, user });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
