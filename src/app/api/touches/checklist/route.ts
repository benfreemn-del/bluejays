/**
 * GET /api/touches/checklist
 *
 * "Today's Checklist" — every prospect with a follow-up reminder that's
 * overdue OR scheduled for sometime today. Returns one row per prospect
 * (the LATEST overdue/today touch wins) enriched with prospect summary
 * fields so the UI can render without N+1 fetches.
 *
 * Powers <TodaysChecklist /> mounted on:
 *   - /dashboard/script  (Madie's sales portal — primary surface)
 *   - /dashboard         (Ben's overview)
 *   - /partners/work     (CallWorkspace — per-call focus)
 *
 * Ordering: overdue first (sorted by how overdue), then today's scheduled
 * (sorted by scheduled time ascending). Lets the operator just blow
 * through the list top-to-bottom.
 */

import { NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export type ChecklistRow = {
  touchId: string;
  prospectId: string;
  shortCode: string | null;
  businessName: string;
  ownerName: string | null;
  phone: string | null;
  email: string | null;
  city: string | null;
  state: string | null;
  status: string | null;
  nextTouchAt: string; // ISO
  nextTouchKind: string | null; // "call" | "text" | "email" | "meeting" | "followup_note"
  nextTouchNote: string | null;
  byUser: string | null;
  isOverdue: boolean; // true if nextTouchAt < now
  hoursOverdue: number; // negative when not yet due
};

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: true, rows: [] });
  }

  const now = new Date();
  const nowIso = now.toISOString();
  // End-of-day "today" in the user's locale doesn't matter much here —
  // the operator either sees overdue (red) or today-due (amber). Use
  // local end-of-day (server clock = UTC in prod, but the rendering
  // is timezone-correct in the browser). 24h forward is a safer net.
  const endOfTodayIso = new Date(
    now.getTime() + 24 * 60 * 60 * 1000,
  ).toISOString();

  // Pull every touch with a future-or-past next_touch_at within the
  // window. These are candidate reminders — each one points to "X
  // should happen by this time."
  const { data: touchData, error: touchErr } = await supabase
    .from("prospect_touches")
    .select(
      "id, prospect_id, kind, next_touch_at, next_touch_kind, next_touch_note, by_user, occurred_at",
    )
    .not("next_touch_at", "is", null)
    .lte("next_touch_at", endOfTodayIso)
    .order("occurred_at", { ascending: false })
    .limit(500);

  if (touchErr) {
    console.error("[checklist] touch query failed:", touchErr.message);
    return NextResponse.json({ ok: false, error: touchErr.message }, { status: 500 });
  }

  type TouchRow = {
    id: string;
    prospect_id: string;
    kind: string;
    next_touch_at: string;
    next_touch_kind: string | null;
    next_touch_note: string | null;
    by_user: string | null;
    occurred_at: string;
  };

  const candidates = (touchData || []) as TouchRow[];

  // Bug fix (2026-05-29): mark-done writes a new touch with
  // next_touch_at=NULL to clear the reminder. The query above filters
  // those out at the DB layer (.not next_touch_at is null) so the
  // candidate set never sees the clearing touch — meaning a "Done"
  // click did nothing visible: the original reminder kept showing up.
  //
  // Fix: for every prospect that has a candidate reminder, fetch the
  // ACTUAL latest touch (next_touch_at NULL or not) and drop the
  // prospect from the checklist when the latest touch's
  // occurred_at > the candidate's occurred_at AND that latest touch
  // has no next_touch_at — i.e. a newer touch cleared the reminder.
  if (candidates.length === 0) {
    return NextResponse.json({ ok: true, rows: [] });
  }
  const candidateProspectIds = [...new Set(candidates.map((t) => t.prospect_id))];
  const { data: latestData } = await supabase
    .from("prospect_touches")
    .select("prospect_id, occurred_at, next_touch_at")
    .in("prospect_id", candidateProspectIds)
    .order("occurred_at", { ascending: false });
  const latestByProspect = new Map<
    string,
    { occurred_at: string; next_touch_at: string | null }
  >();
  for (const row of (latestData || []) as Array<{
    prospect_id: string;
    occurred_at: string;
    next_touch_at: string | null;
  }>) {
    if (!latestByProspect.has(row.prospect_id)) {
      latestByProspect.set(row.prospect_id, {
        occurred_at: row.occurred_at,
        next_touch_at: row.next_touch_at,
      });
    }
  }

  // Dedup candidates to latest-per-prospect (within the candidate set
  // those with next_touch_at), then exclude any whose actual latest
  // touch is newer AND has no next_touch_at (= reminder was cleared).
  const latestCandidatePerProspect = new Map<string, TouchRow>();
  for (const row of candidates) {
    if (!latestCandidatePerProspect.has(row.prospect_id)) {
      latestCandidatePerProspect.set(row.prospect_id, row);
    }
  }
  const eligibleTouches = Array.from(latestCandidatePerProspect.values()).filter(
    (t) => {
      const latest = latestByProspect.get(t.prospect_id);
      if (!latest) return true; // shouldn't happen, but fail-open
      // If the actual latest touch is newer than this candidate AND
      // has no next_touch_at, the reminder was cleared (Done clicked
      // OR a newer touch wrote no follow-up).
      if (
        latest.occurred_at > t.occurred_at &&
        latest.next_touch_at == null
      ) {
        return false;
      }
      return true;
    },
  );

  if (eligibleTouches.length === 0) {
    return NextResponse.json({ ok: true, rows: [] });
  }

  // Bulk-fetch prospect summaries for every touch. One IN query.
  const prospectIds = eligibleTouches.map((t) => t.prospect_id);
  const { data: pData } = await supabase
    .from("prospects")
    .select(
      "id, short_code, business_name, owner_name, phone, email, city, state, status",
    )
    .in("id", prospectIds);

  type ProspectRow = {
    id: string;
    short_code: string | null;
    business_name: string | null;
    owner_name: string | null;
    phone: string | null;
    email: string | null;
    city: string | null;
    state: string | null;
    status: string | null;
  };

  const pById = new Map<string, ProspectRow>();
  for (const p of (pData || []) as ProspectRow[]) {
    pById.set(p.id, p);
  }

  const rows: ChecklistRow[] = eligibleTouches.flatMap((t) => {
    const p = pById.get(t.prospect_id);
    if (!p) return []; // orphaned touch — skip
    const nextAt = new Date(t.next_touch_at);
    const diffMs = now.getTime() - nextAt.getTime(); // positive = overdue
    return [
      {
        touchId: t.id,
        prospectId: t.prospect_id,
        shortCode: p.short_code,
        businessName: p.business_name || "(no name)",
        ownerName: p.owner_name,
        phone: p.phone,
        email: p.email,
        city: p.city,
        state: p.state,
        status: p.status,
        nextTouchAt: t.next_touch_at,
        nextTouchKind: t.next_touch_kind,
        nextTouchNote: t.next_touch_note,
        byUser: t.by_user,
        isOverdue: t.next_touch_at < nowIso,
        hoursOverdue: Math.round(diffMs / (1000 * 60 * 60)),
      },
    ];
  });

  // Sort: overdue first (most overdue at top), then today's not-yet-due
  // by scheduled time ascending (so "due in 1h" sits above "due in 4h").
  rows.sort((a, b) => {
    if (a.isOverdue && !b.isOverdue) return -1;
    if (!a.isOverdue && b.isOverdue) return 1;
    if (a.isOverdue && b.isOverdue) {
      // Both overdue — most overdue first
      return b.hoursOverdue - a.hoursOverdue;
    }
    // Both upcoming — soonest first
    return a.nextTouchAt.localeCompare(b.nextTouchAt);
  });

  return NextResponse.json({ ok: true, rows });
}
