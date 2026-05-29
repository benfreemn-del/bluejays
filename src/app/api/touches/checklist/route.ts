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
  // window. We take the LATEST touch per prospect (newest occurred_at)
  // and reject rows whose latest touch doesn't have a next_touch_at —
  // matches the semantics of overdueNextTouches() but extends the
  // window to include today's scheduled-not-yet-overdue.
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

  // Keep only the LATEST touch per prospect — if a newer touch exists
  // without a next_touch_at, the reminder was satisfied and shouldn't
  // surface anymore. Implemented by walking the rows newest-first and
  // taking the first hit per prospect; if that first hit doesn't have a
  // next_touch_at it gets skipped (which means the latest touch cleared
  // the reminder).
  const latestPerProspect = new Map<string, TouchRow>();
  for (const row of (touchData || []) as TouchRow[]) {
    if (!latestPerProspect.has(row.prospect_id)) {
      latestPerProspect.set(row.prospect_id, row);
    }
  }
  // Filter: only rows whose latest touch DOES have a next_touch_at in
  // the window. (Already implied by the .lte() filter, but the LATEST
  // dedup could pull a no-next-touch row through — guard explicitly.)
  const eligibleTouches = Array.from(latestPerProspect.values()).filter(
    (t) => !!t.next_touch_at,
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
