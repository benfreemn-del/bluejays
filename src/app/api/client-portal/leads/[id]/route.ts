import { NextRequest, NextResponse } from "next/server";
import { CLIENT_PORTAL_COOKIE, ownerFromCookie } from "@/lib/client-auth";
import { getClientLead, updateClientLead } from "@/lib/client-leads";

/**
 * PATCH /api/client-portal/leads/[id]
 *
 * Owner-scoped lead update. Whitelists patchable fields and verifies
 * the lead belongs to the owner's client_slug before applying. Same
 * security model as /api/client-leads/[id] but enforces ownership
 * via the portal session, not the admin cookie.
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!UUID_RE.test(id)) {
    return NextResponse.json({ ok: false, error: "Invalid lead id" }, { status: 400 });
  }
  const cookie = req.cookies.get(CLIENT_PORTAL_COOKIE)?.value;
  const owner = await ownerFromCookie(cookie);
  if (!owner) {
    return NextResponse.json(
      { ok: false, error: "Not signed in" },
      { status: 401 },
    );
  }

  // Verify the lead is one this owner can touch.
  const lead = await getClientLead(id);
  if (!lead || lead.client_slug !== owner.client_slug) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
  // Owners can only update notes + status (not audience or step).
  const allowed = ["funnel_status", "notes"];
  const patch: Record<string, unknown> = {};
  for (const k of allowed) {
    if (k in body) patch[k] = body[k];
  }
  try {
    const updated = await updateClientLead(
      id,
      patch as Parameters<typeof updateClientLead>[1],
    );
    return NextResponse.json({ ok: true, lead: updated });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "unknown" },
      { status: 500 },
    );
  }
}
