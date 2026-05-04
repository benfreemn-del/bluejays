import { NextRequest, NextResponse } from "next/server";
import { getClientLead, updateClientLead } from "@/lib/client-leads";

/**
 * GET /api/client-leads/[id] — single lead with full payload
 * PATCH /api/client-leads/[id] — update audience/funnel status/notes
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const lead = await getClientLead(id);
    if (!lead) {
      return NextResponse.json(
        { ok: false, error: "Not found" },
        { status: 404 },
      );
    }
    return NextResponse.json({ ok: true, lead });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "unknown" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
  // Whitelist patchable fields — don't let clients arbitrarily flip
  // created_at or raw_payload from the dashboard.
  const allowed = [
    "audience_segment",
    "funnel_status",
    "funnel_step",
    "notes",
    "last_contact_at",
  ];
  const patch: Record<string, unknown> = {};
  for (const k of allowed) {
    if (k in body) patch[k] = body[k];
  }
  try {
    const updated = await updateClientLead(id, patch);
    return NextResponse.json({ ok: true, lead: updated });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "unknown" },
      { status: 500 },
    );
  }
}
