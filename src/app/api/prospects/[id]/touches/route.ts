/**
 * /api/prospects/[id]/touches
 *
 * POST — record a single touch
 * GET  — fetch the timeline for one prospect (newest first)
 *
 * Operator-only — protected by middleware. UUID validation runs BEFORE
 * any DB read per Owner Portal Rule 4a.
 *
 * Pattern: bluejays/docs/playbooks/lead-interaction-system-master-plan.md
 */

import { NextRequest, NextResponse } from "next/server";
import { logTouch, listTouches, type LogTouchInput } from "@/lib/prospect-touches";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const KIND_VALUES = new Set([
  "call",
  "voicemail",
  "text",
  "email",
  "dm",
  "in_person",
  "note",
]);
const DIRECTION_VALUES = new Set(["outbound", "inbound"]);
const OUTCOME_VALUES = new Set([
  "connected",
  "no_answer",
  "left_voicemail",
  "declined",
  "replied",
  "no_reply",
  "sent",
  "received",
  "meeting_booked",
  "meeting_held",
  "meeting_no_show",
]);
const CLOSER_VALUES = new Set([
  "clarify",
  "label",
  "overview",
  "sell",
  "explain",
  "reinforce",
  "none",
]);
const NEXT_KIND_VALUES = new Set([
  "call",
  "text",
  "email",
  "meeting",
  "followup_note",
]);

type Body = {
  kind?: string;
  direction?: string;
  outcome?: string;
  closer_stage?: string;
  damaging_admission_fired?: boolean;
  next_touch_kind?: string;
  next_touch_at?: string;
  next_touch_note?: string;
  notes?: string;
  by_user?: string;
  external_id?: string;
  duration_seconds?: number;
  occurred_at?: string;
};

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

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  // Validate kind (required)
  if (!body.kind || !KIND_VALUES.has(body.kind)) {
    return NextResponse.json(
      {
        ok: false,
        error: `kind required, must be one of: ${[...KIND_VALUES].join(", ")}`,
      },
      { status: 400 },
    );
  }

  // Validate optional enums
  if (body.direction && !DIRECTION_VALUES.has(body.direction)) {
    return NextResponse.json(
      { ok: false, error: "Invalid direction" },
      { status: 400 },
    );
  }
  if (body.outcome && !OUTCOME_VALUES.has(body.outcome)) {
    return NextResponse.json(
      { ok: false, error: "Invalid outcome" },
      { status: 400 },
    );
  }
  if (body.closer_stage && !CLOSER_VALUES.has(body.closer_stage)) {
    return NextResponse.json(
      { ok: false, error: "Invalid closer_stage" },
      { status: 400 },
    );
  }
  if (body.next_touch_kind && !NEXT_KIND_VALUES.has(body.next_touch_kind)) {
    return NextResponse.json(
      { ok: false, error: "Invalid next_touch_kind" },
      { status: 400 },
    );
  }

  const input: LogTouchInput = {
    prospectId: id,
    kind: body.kind as LogTouchInput["kind"],
    direction: body.direction as LogTouchInput["direction"] | undefined,
    outcome: body.outcome as LogTouchInput["outcome"] | undefined,
    closer_stage: body.closer_stage as LogTouchInput["closer_stage"] | undefined,
    damaging_admission_fired: body.damaging_admission_fired,
    next_touch_kind: body.next_touch_kind as LogTouchInput["next_touch_kind"] | undefined,
    next_touch_at: body.next_touch_at,
    next_touch_note: body.next_touch_note,
    notes: body.notes,
    by_user: body.by_user,
    external_id: body.external_id,
    duration_seconds: body.duration_seconds,
    occurred_at: body.occurred_at,
  };

  const row = await logTouch(input);
  if (!row) {
    return NextResponse.json(
      { ok: false, error: "Failed to log touch" },
      { status: 500 },
    );
  }
  return NextResponse.json({ ok: true, touch: row });
}

export async function GET(
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
  const limitParam = request.nextUrl.searchParams.get("limit");
  const limit = limitParam ? Math.min(parseInt(limitParam, 10) || 50, 200) : 50;
  const touches = await listTouches(id, limit);
  return NextResponse.json({ ok: true, touches });
}
