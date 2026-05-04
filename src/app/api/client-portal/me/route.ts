import { NextRequest, NextResponse } from "next/server";
import {
  CLIENT_PORTAL_COOKIE,
  ownerFromCookie,
} from "@/lib/client-auth";

/**
 * GET /api/client-portal/me
 * Returns the logged-in owner (without password_hash) so the portal UI
 * can render their name + scope queries to their client_slug.
 *
 * Used by /clients/[slug]/portal client-side to fetch identity on load.
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const cookie = req.cookies.get(CLIENT_PORTAL_COOKIE)?.value;
  const owner = await ownerFromCookie(cookie);
  if (!owner) {
    return NextResponse.json(
      { ok: false, error: "Not signed in" },
      { status: 401 },
    );
  }
  // Strip the hash before returning.
  const { password_hash: _drop, ...safe } = owner;
  void _drop;
  return NextResponse.json({ ok: true, owner: safe });
}
