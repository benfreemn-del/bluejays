import { NextRequest, NextResponse } from "next/server";
import { getProspect, updateProspect } from "@/lib/store";
import { logTouch } from "@/lib/prospect-touches";

/**
 * POST /api/prospects/[id]/follow-up
 *
 * Madie's 📌 Working button. Parks a lead she's actively pursuing into
 * status='following_up' — a visible "I'm working this through my 3-touch
 * cadence" section (surfaced under the "Following Up" chip in the
 * LeadPicker). Unlike nurture (which HIDES), following_up stays visible.
 *
 * A daily sweep (/api/leads/sweep-following-up) auto-moves these to
 * 'nurturing' after 3 outreach touches + 14 days of silence, matching
 * Madie's "3 touches then get them out of my sight" rule.
 *
 * Body (optional): { undo?: boolean } — flip back out of following_up
 *   (returns the lead to the plain pipeline as 'contacted' since Madie
 *   was already working it).
 */

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!UUID_RE.test(id)) {
    return NextResponse.json(
      { ok: false, error: "Invalid prospect id" },
      { status: 400 },
    );
  }

  let undo = false;
  try {
    const body = await request.json();
    undo = body?.undo === true;
  } catch {
    // body optional
  }

  const prospect = await getProspect(id);
  if (!prospect) {
    return NextResponse.json(
      { ok: false, error: "Prospect not found" },
      { status: 404 },
    );
  }

  if (undo) {
    // Un-park: return to the plain pipeline. 'contacted' is safe — by
    // definition Madie was working this lead while it was in following_up.
    await updateProspect(id, { status: "contacted" }, { source: "follow_up_undo" });
    return NextResponse.json({ ok: true, prospectId: id, status: "contacted" });
  }

  await updateProspect(
    id,
    { status: "following_up" },
    { source: "follow_up" },
  );

  void logTouch({
    prospectId: id,
    kind: "note",
    direction: "outbound",
    by_user: "madie",
    notes: "Moved to Following Up (actively pursuing)",
  }).catch((err) => console.error("[follow-up] touch log failed:", err));

  return NextResponse.json({
    ok: true,
    prospectId: id,
    status: "following_up",
  });
}
