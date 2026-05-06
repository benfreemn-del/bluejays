import { NextRequest, NextResponse } from "next/server";
import {
  createClientTeamMember,
  listClientTeamMembers,
  type NewClientTeamMember,
} from "@/lib/client-team-members";
import { CLIENT_PORTAL_COOKIE, ownerFromCookie } from "@/lib/client-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET  /api/client-team-members?client=<slug>
 *      Returns the roster. Public to signed-in client owners +
 *      admin-cookie holders so the assignee dropdown can populate.
 *
 * POST /api/client-team-members
 *      Add a new teammate. Requires either admin-cookie (Ben) OR a
 *      signed-in client owner adding to their OWN client_slug.
 */

async function isAuthorizedForSlug(
  req: NextRequest,
  slug: string,
): Promise<boolean> {
  const cookie = req.cookies.get(CLIENT_PORTAL_COOKIE)?.value;
  if (cookie) {
    const owner = await ownerFromCookie(cookie);
    if (owner && owner.client_slug === slug) return true;
  }
  // Admin-side dashboard cookie. The middleware already gates this
  // route under /api/* if the dashboard cookie path applies; we
  // fall through to true for non-portal callers.
  const adminSession = req.cookies.get("bluejays-session")?.value;
  if (adminSession) return true;
  return false;
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const slug = (url.searchParams.get("client") || "").trim();
  if (!slug) {
    return NextResponse.json(
      { ok: false, error: "Missing ?client=<slug>" },
      { status: 400 },
    );
  }
  if (!(await isAuthorizedForSlug(req, slug))) {
    return NextResponse.json(
      { ok: false, error: "Not authorized for this client" },
      { status: 403 },
    );
  }
  try {
    const members = await listClientTeamMembers(slug);
    return NextResponse.json({ ok: true, members });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "unknown" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
  const slug = String(body.client_slug || "").trim();
  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim().toLowerCase();
  if (!slug || !name || !email) {
    return NextResponse.json(
      { ok: false, error: "client_slug, name, and email are required" },
      { status: 400 },
    );
  }
  if (!(await isAuthorizedForSlug(req, slug))) {
    return NextResponse.json(
      { ok: false, error: "Not authorized for this client" },
      { status: 403 },
    );
  }
  const payload: NewClientTeamMember = {
    client_slug: slug,
    name,
    email,
    is_bluejays_team: Boolean(body.is_bluejays_team),
    is_primary: Boolean(body.is_primary),
    sort_order:
      typeof body.sort_order === "number" ? body.sort_order : undefined,
  };
  try {
    const created = await createClientTeamMember(payload);
    return NextResponse.json({ ok: true, member: created });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "unknown" },
      { status: 500 },
    );
  }
}
