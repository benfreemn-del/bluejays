import { NextRequest, NextResponse } from "next/server";
import { CLIENT_PORTAL_COOKIE, ownerFromCookie } from "@/lib/client-auth";
import { listClientLeads } from "@/lib/client-leads";

/**
 * GET /api/client-portal/leads
 * Returns leads for the logged-in owner's client_slug. Cookie-scoped —
 * the portal owner cannot pass a slug to read another client's data.
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
  try {
    const leads = await listClientLeads(owner.client_slug);
    return NextResponse.json({ ok: true, leads });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "unknown" },
      { status: 500 },
    );
  }
}
