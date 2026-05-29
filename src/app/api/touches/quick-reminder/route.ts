/**
 * POST /api/touches/quick-reminder
 *
 * One-shot endpoint for the <TodaysChecklist /> "Add reminder" inline
 * form. Creates a single prospect_touches row of kind="note" with
 * next_touch_at set so it shows up on tomorrow's (or today's) checklist.
 *
 * Body:
 *   {
 *     prospectId: string,         // required
 *     nextTouchAt: string,        // required ISO timestamp
 *     nextTouchKind?: string,     // call/text/email/meeting/followup_note
 *     nextTouchNote?: string,     // short reason ("call back about pricing")
 *     byUser?: string,            // defaults to cookie role → 'madie' | 'ben'
 *   }
 *
 * Returns: { ok, touch } on success.
 */

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { logTouch } from "@/lib/prospect-touches";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const NEXT_KIND_VALUES = new Set([
  "call",
  "text",
  "email",
  "meeting",
  "followup_note",
]);

type Body = {
  prospectId?: string;
  nextTouchAt?: string;
  nextTouchKind?: string;
  nextTouchNote?: string;
  byUser?: string;
};

export async function POST(request: NextRequest) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  if (!body.prospectId || !UUID_RE.test(body.prospectId)) {
    return NextResponse.json(
      { ok: false, error: "prospectId required (UUID)" },
      { status: 400 },
    );
  }

  if (!body.nextTouchAt) {
    return NextResponse.json(
      { ok: false, error: "nextTouchAt required (ISO timestamp)" },
      { status: 400 },
    );
  }
  const t = Date.parse(body.nextTouchAt);
  if (isNaN(t)) {
    return NextResponse.json(
      { ok: false, error: "nextTouchAt must be a valid ISO timestamp" },
      { status: 400 },
    );
  }

  if (body.nextTouchKind && !NEXT_KIND_VALUES.has(body.nextTouchKind)) {
    return NextResponse.json(
      {
        ok: false,
        error: `Invalid nextTouchKind. Must be one of: ${[...NEXT_KIND_VALUES].join(", ")}`,
      },
      { status: 400 },
    );
  }

  // Derive caller identity from the bj_role cookie when not explicitly
  // passed. Sales role → 'madie', everyone else → 'ben'. Matches the
  // same attribution pattern as /dashboard/script and CallWorkspace.
  const cookieStore = await cookies();
  const role = cookieStore.get("bj_role")?.value;
  const byUser = body.byUser || (role === "sales" ? "madie" : "ben");

  const row = await logTouch({
    prospectId: body.prospectId,
    kind: "note",
    direction: "outbound",
    next_touch_kind: body.nextTouchKind as
      | "call"
      | "text"
      | "email"
      | "meeting"
      | "followup_note"
      | undefined,
    next_touch_at: body.nextTouchAt,
    next_touch_note: body.nextTouchNote,
    notes: body.nextTouchNote
      ? `Reminder set: ${body.nextTouchNote}`
      : "Reminder set",
    by_user: byUser,
  });

  if (!row) {
    return NextResponse.json(
      { ok: false, error: "Failed to log reminder" },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, touch: row });
}
