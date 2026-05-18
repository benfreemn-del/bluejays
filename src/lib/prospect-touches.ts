/**
 * Prospect touches — every recorded interaction with a lead.
 *
 * Replaces the prior `prospects.admin_notes` text-blob append pattern with
 * a structured per-row table so we can:
 *   - Show a timeline per prospect (TouchTimeline component)
 *   - Compute the 60-second SLA (Annie's reception-funnel rule)
 *   - Surface "Madie already touched this 12 min ago" warnings
 *   - Auto-credit Madie's commission in Phase 3 by attributing closes to touches
 *
 * Migration: supabase/migrations/20260518_prospect_touches.sql
 * Pattern: see CLAUDE.md "Lead Interaction System" + bluejays/docs/playbooks/
 *   lead-interaction-system-master-plan.md
 */

import { supabase, isSupabaseConfigured } from "./supabase";

// ── Types ──────────────────────────────────────────────────────────

export type TouchKind =
  | "call"
  | "voicemail"
  | "text"
  | "email"
  | "dm"
  | "in_person"
  | "note";

export type TouchDirection = "outbound" | "inbound";

export type TouchOutcome =
  | "connected"
  | "no_answer"
  | "left_voicemail"
  | "declined"
  | "replied"
  | "no_reply"
  | "sent"
  | "received"
  | "meeting_booked"
  | "meeting_held"
  | "meeting_no_show";

export type CloserStage =
  | "clarify"
  | "label"
  | "overview"
  | "sell"
  | "explain"
  | "reinforce"
  | "none";

export type TouchUser =
  | "ben"
  | "madie"
  | "auto-funnel"
  | "auto-ai"
  | "auto-import";

export type NextTouchKind = "call" | "text" | "email" | "meeting" | "followup_note";

export type ProspectTouch = {
  id: string;
  prospect_id: string;
  kind: TouchKind;
  direction: TouchDirection;
  outcome: TouchOutcome | null;
  closer_stage: CloserStage | null;
  damaging_admission_fired: boolean;
  next_touch_kind: NextTouchKind | null;
  next_touch_at: string | null;
  next_touch_note: string | null;
  notes: string | null;
  by_user: string;
  external_id: string | null;
  duration_seconds: number | null;
  occurred_at: string;
  created_at: string;
};

// ── Inputs ─────────────────────────────────────────────────────────

export type LogTouchInput = {
  prospectId: string;
  kind: TouchKind;
  direction?: TouchDirection;
  outcome?: TouchOutcome;
  closer_stage?: CloserStage;
  damaging_admission_fired?: boolean;
  next_touch_kind?: NextTouchKind;
  next_touch_at?: string;
  next_touch_note?: string;
  notes?: string;
  by_user?: string;
  external_id?: string;
  duration_seconds?: number;
  occurred_at?: string;
};

// ── Constants ──────────────────────────────────────────────────────

const NOTE_MAX_LENGTH = 2000;
const NEXT_TOUCH_NOTE_MAX = 500;

// ── Operations ─────────────────────────────────────────────────────

/**
 * Record a single touch. Returns the persisted row.
 * Mock-mode safe: returns null when Supabase isn't configured.
 *
 * Side effects:
 *   - Updates prospects.last_contacted_at to MAX(occurred_at) so legacy
 *     surfaces (BluejaysFunnelsTab SLA chip) stay accurate
 *   - Truncates notes / next_touch_note to safe lengths
 */
export async function logTouch(
  input: LogTouchInput,
): Promise<ProspectTouch | null> {
  if (!isSupabaseConfigured()) return null;
  if (!input.prospectId || !input.kind) {
    throw new Error("logTouch: prospectId + kind required");
  }

  const occurredAt = input.occurred_at || new Date().toISOString();
  const notes = input.notes?.slice(0, NOTE_MAX_LENGTH) || null;
  const nextTouchNote =
    input.next_touch_note?.slice(0, NEXT_TOUCH_NOTE_MAX) || null;

  const { data: row, error } = await supabase
    .from("prospect_touches")
    .insert({
      prospect_id: input.prospectId,
      kind: input.kind,
      direction: input.direction || "outbound",
      outcome: input.outcome || null,
      closer_stage: input.closer_stage || null,
      damaging_admission_fired: !!input.damaging_admission_fired,
      next_touch_kind: input.next_touch_kind || null,
      next_touch_at: input.next_touch_at || null,
      next_touch_note: nextTouchNote,
      notes,
      by_user: input.by_user || "ben",
      external_id: input.external_id || null,
      duration_seconds: input.duration_seconds || null,
      occurred_at: occurredAt,
    })
    .select("*")
    .single();

  if (error) {
    console.error("[logTouch] insert failed:", error.message);
    return null;
  }

  // Legacy compat: keep prospects.last_contacted_at fresh so the existing
  // BluejaysFunnelsTab 2-min SLA chip stays accurate
  try {
    await supabase
      .from("prospects")
      .update({ last_contacted_at: occurredAt })
      .eq("id", input.prospectId)
      .lte("last_contacted_at", occurredAt);
  } catch {
    // best-effort; touch insert succeeded which is what matters
  }

  return row as ProspectTouch;
}

/**
 * Get the timeline for one prospect, newest first.
 */
export async function listTouches(
  prospectId: string,
  limit: number = 50,
): Promise<ProspectTouch[]> {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await supabase
    .from("prospect_touches")
    .select("*")
    .eq("prospect_id", prospectId)
    .order("occurred_at", { ascending: false })
    .limit(Math.max(1, Math.min(limit, 500)));
  if (error) {
    console.error("[listTouches] query failed:", error.message);
    return [];
  }
  return (data || []) as ProspectTouch[];
}

/**
 * "What did each operator do today?" — for the dashboard touches-today
 * view.
 */
export async function touchesToday(): Promise<ProspectTouch[]> {
  if (!isSupabaseConfigured()) return [];
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from("prospect_touches")
    .select("*")
    .gte("occurred_at", since)
    .order("occurred_at", { ascending: false });
  if (error) {
    console.error("[touchesToday] query failed:", error.message);
    return [];
  }
  return (data || []) as ProspectTouch[];
}

/**
 * Leads with an overdue next-touch (scheduled in the past, still not
 * logged forward). Powers /dashboard/queue + NextTouchBadge red flag.
 */
export async function overdueNextTouches(): Promise<ProspectTouch[]> {
  if (!isSupabaseConfigured()) return [];
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("prospect_touches")
    .select("*")
    .lt("next_touch_at", now)
    .not("next_touch_at", "is", null)
    .order("next_touch_at", { ascending: true })
    .limit(200);
  if (error) {
    console.error("[overdueNextTouches] query failed:", error.message);
    return [];
  }
  // Filter: only the LATEST touch per prospect counts — if a newer touch
  // exists, the overdue is no longer overdue.
  const seen = new Set<string>();
  const result: ProspectTouch[] = [];
  for (const row of (data || []) as ProspectTouch[]) {
    if (!seen.has(row.prospect_id)) {
      seen.add(row.prospect_id);
      result.push(row);
    }
  }
  return result;
}

/**
 * Annie 60-second SLA rolling-24-hour rate.
 * "Of audit-lead intakes in the last 24h, what % got touched within 60s?"
 */
export async function sla60SecondHitRate(): Promise<{
  total: number;
  hits: number;
  rate_pct: number;
}> {
  if (!isSupabaseConfigured()) return { total: 0, hits: 0, rate_pct: 0 };
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  // Get audit_lead intakes in the last 24h
  const { data: intakes } = await supabase
    .from("prospects")
    .select("id, created_at")
    .eq("status", "audit_lead")
    .gte("created_at", since);

  const rows = (intakes || []) as Array<{ id: string; created_at: string }>;
  if (rows.length === 0) return { total: 0, hits: 0, rate_pct: 0 };

  // For each intake, check if there's an outbound touch within 60s of creation
  let hits = 0;
  for (const intake of rows) {
    const intakeTime = new Date(intake.created_at).getTime();
    const sixtyAfter = new Date(intakeTime + 60 * 1000).toISOString();
    const { data: touches } = await supabase
      .from("prospect_touches")
      .select("id")
      .eq("prospect_id", intake.id)
      .eq("direction", "outbound")
      .gte("occurred_at", intake.created_at)
      .lte("occurred_at", sixtyAfter)
      .limit(1);
    if ((touches || []).length > 0) hits++;
  }

  return {
    total: rows.length,
    hits,
    rate_pct: Math.round((100 * hits) / rows.length),
  };
}

/**
 * Most recent touch (any kind) for a prospect — used to display "Madie
 * already touched this 12 min ago" badge.
 */
export async function lastTouchForProspect(
  prospectId: string,
): Promise<ProspectTouch | null> {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase
    .from("prospect_touches")
    .select("*")
    .eq("prospect_id", prospectId)
    .order("occurred_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) {
    return null;
  }
  return (data as ProspectTouch) || null;
}
