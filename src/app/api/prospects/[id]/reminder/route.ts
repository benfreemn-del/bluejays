import { NextRequest, NextResponse } from "next/server";
import { getProspect } from "@/lib/store";
import { logTouch } from "@/lib/prospect-touches";

/**
 * POST /api/prospects/[id]/reminder
 *
 * Sets a follow-up reminder on a prospect. Madie's calling pattern is
 * "call them back on Thursday 3pm" — this is the API that captures it.
 * Backed by prospect_touches.next_touch_at (existing field).
 *
 * Today's-callbacks pill on /dashboard/script queries:
 *   SELECT * FROM prospect_touches
 *   WHERE next_touch_at::date = CURRENT_DATE
 *
 * Body: {
 *   next_touch_at: ISO timestamp (when to surface)
 *   note?: string (why — "interested, said call Thursday after 2pm")
 * }
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

  let body: { next_touch_at?: string; note?: string } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  if (!body.next_touch_at) {
    return NextResponse.json(
      { ok: false, error: "next_touch_at required (ISO timestamp)" },
      { status: 400 },
    );
  }

  const when = new Date(body.next_touch_at);
  if (Number.isNaN(when.getTime())) {
    return NextResponse.json(
      { ok: false, error: "next_touch_at is not a valid date" },
      { status: 400 },
    );
  }
  if (when.getTime() < Date.now() - 60_000) {
    return NextResponse.json(
      { ok: false, error: "next_touch_at must be in the future" },
      { status: 400 },
    );
  }

  const prospect = await getProspect(id);
  if (!prospect) {
    return NextResponse.json(
      { ok: false, error: "Prospect not found" },
      { status: 404 },
    );
  }

  const note = body.note?.trim().slice(0, 500) || null;

  const row = await logTouch({
    prospectId: id,
    kind: "note",
    direction: "outbound",
    by_user: "madie",
    notes: `Reminder set${note ? ` — ${note}` : ""}`,
    next_touch_kind: "call",
    next_touch_at: when.toISOString(),
    next_touch_note: note || undefined,
  });

  return NextResponse.json({
    ok: true,
    prospectId: id,
    nextTouchAt: when.toISOString(),
    note,
    touchId: row?.id || null,
  });
}
