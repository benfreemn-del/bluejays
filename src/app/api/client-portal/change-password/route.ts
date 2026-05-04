import { NextRequest, NextResponse } from "next/server";
import {
  CLIENT_PORTAL_COOKIE,
  makeSessionCookie,
  ownerFromCookie,
  sha256Password,
} from "@/lib/client-auth";
import { getSupabase } from "@/lib/supabase";

/**
 * POST /api/client-portal/change-password
 * Body: { currentPassword, newPassword }
 *
 * Requires a valid session cookie. After updating, re-issues the
 * session cookie with the new password_hash signature so the user
 * stays logged in.
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const cookie = req.cookies.get(CLIENT_PORTAL_COOKIE)?.value;
  const owner = await ownerFromCookie(cookie);
  if (!owner) {
    return NextResponse.json(
      { ok: false, error: "Not signed in" },
      { status: 401 },
    );
  }

  let body: { currentPassword?: string; newPassword?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
  const cur = (body.currentPassword || "").trim();
  const next = (body.newPassword || "").trim();
  if (!cur || !next) {
    return NextResponse.json(
      { ok: false, error: "Both fields required" },
      { status: 400 },
    );
  }
  if (next.length < 8) {
    return NextResponse.json(
      { ok: false, error: "New password must be at least 8 characters" },
      { status: 400 },
    );
  }
  if (sha256Password(cur) !== owner.password_hash) {
    return NextResponse.json(
      { ok: false, error: "Current password is incorrect" },
      { status: 401 },
    );
  }
  const newHash = sha256Password(next);
  const { error } = await getSupabase()
    .from("client_owners")
    .update({ password_hash: newHash })
    .eq("id", owner.id);
  if (error) {
    return NextResponse.json(
      { ok: false, error: "Could not update password" },
      { status: 500 },
    );
  }

  // Re-sign cookie with the new hash so the user stays logged in.
  const updated = { ...owner, password_hash: newHash };
  const c = makeSessionCookie(updated);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(c.name, c.value, c.options);
  return res;
}
