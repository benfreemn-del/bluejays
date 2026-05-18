/**
 * Client work-log helpers.
 *
 * Reads + writes against the `client_work_log` table. Every row is one
 * action BlueJays took on behalf of a $10k AI System client (ad launch,
 * copy revision, audience tweak, bug fix, etc.). Feeds:
 *   - Friday auto-digest email ("what got built this week")
 *   - /clients/[slug]/portal "What we built" section
 *   - /dashboard/clients/[slug] admin quick-add panel
 *
 * Mock-mode safe: returns empty arrays / no-ops when Supabase isn't
 * configured so the dashboard never hard-fails.
 *
 * Migration: supabase/migrations/20260518_client_work_log.sql
 */

import { supabase, isSupabaseConfigured } from "./supabase";

export type WorkLogKind =
  | "ad_launched"
  | "copy_revised"
  | "audience_added"
  | "integration_wired"
  | "funnel_step_updated"
  | "bug_fixed"
  | "feature_shipped"
  | "automation_built"
  | "content_published"
  | "report_delivered"
  | "meeting"
  | "other";

export const WORK_LOG_KINDS: { kind: WorkLogKind; label: string; emoji: string }[] = [
  { kind: "ad_launched", label: "Ad launched", emoji: "💸" },
  { kind: "copy_revised", label: "Copy revised", emoji: "✏️" },
  { kind: "audience_added", label: "Audience added", emoji: "🎯" },
  { kind: "integration_wired", label: "Integration wired", emoji: "🔌" },
  { kind: "funnel_step_updated", label: "Funnel step updated", emoji: "🪜" },
  { kind: "automation_built", label: "Automation built", emoji: "🤖" },
  { kind: "content_published", label: "Content published", emoji: "📣" },
  { kind: "feature_shipped", label: "Feature shipped", emoji: "🚀" },
  { kind: "bug_fixed", label: "Bug fixed", emoji: "🐞" },
  { kind: "report_delivered", label: "Report delivered", emoji: "📊" },
  { kind: "meeting", label: "Meeting / call", emoji: "📞" },
  { kind: "other", label: "Other", emoji: "•" },
];

export type WorkLogLink = { label: string; url: string };

export type WorkLogEntry = {
  id: string;
  client_slug: string;
  kind: WorkLogKind;
  title: string;
  details: string | null;
  links: WorkLogLink[];
  hours_spent: number | null;
  created_by: string;
  visible_to_client: boolean;
  created_at: string;
};

export function kindMeta(kind: string): { label: string; emoji: string } {
  const hit = WORK_LOG_KINDS.find((k) => k.kind === kind);
  return hit ? { label: hit.label, emoji: hit.emoji } : { label: kind, emoji: "•" };
}

export async function createWorkLogEntry(input: {
  client_slug: string;
  kind: WorkLogKind;
  title: string;
  details?: string | null;
  links?: WorkLogLink[];
  hours_spent?: number | null;
  created_by?: string;
  visible_to_client?: boolean;
}): Promise<WorkLogEntry | null> {
  if (!isSupabaseConfigured()) return null;
  const row = {
    client_slug: input.client_slug,
    kind: input.kind,
    title: input.title,
    details: input.details ?? null,
    links: input.links ?? [],
    hours_spent: input.hours_spent ?? null,
    created_by: input.created_by ?? "ben",
    visible_to_client: input.visible_to_client ?? true,
  };
  const { data, error } = await supabase
    .from("client_work_log")
    .insert(row)
    .select("*")
    .single();
  if (error || !data) return null;
  return data as WorkLogEntry;
}

export async function listWorkLogEntries(opts: {
  client_slug: string;
  since?: Date;
  until?: Date;
  visibleOnly?: boolean;
  limit?: number;
}): Promise<WorkLogEntry[]> {
  if (!isSupabaseConfigured()) return [];
  let q = supabase
    .from("client_work_log")
    .select("*")
    .eq("client_slug", opts.client_slug)
    .order("created_at", { ascending: false })
    .limit(opts.limit ?? 200);
  if (opts.since) q = q.gte("created_at", opts.since.toISOString());
  if (opts.until) q = q.lt("created_at", opts.until.toISOString());
  if (opts.visibleOnly) q = q.eq("visible_to_client", true);
  const { data, error } = await q;
  if (error || !data) return [];
  return data as WorkLogEntry[];
}

export async function deleteWorkLogEntry(id: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const { error } = await supabase.from("client_work_log").delete().eq("id", id);
  return !error;
}

/**
 * Returns the most recent Friday at 17:00 UTC (= 9am PT during PDT).
 * Used as the canonical "week-ending" date for the digest cron so
 * idempotency keys are deterministic.
 */
export function lastFriday(now: Date = new Date()): Date {
  const d = new Date(now);
  // Find the most recent Friday (day 5). If today IS Friday and it's
  // already past 17:00 UTC, use today; otherwise use last Friday.
  const dayOfWeek = d.getUTCDay();
  let daysBack = (dayOfWeek - 5 + 7) % 7;
  if (daysBack === 0 && d.getUTCHours() < 17) daysBack = 7;
  d.setUTCDate(d.getUTCDate() - daysBack);
  d.setUTCHours(17, 0, 0, 0);
  return d;
}

/**
 * Returns the week-ending date (UTC midnight Friday) for a given moment.
 * Used as the `week_ending` key on `client_work_log_digests`.
 */
export function weekEndingISO(reference: Date = new Date()): string {
  const friday = lastFriday(reference);
  return friday.toISOString().slice(0, 10); // YYYY-MM-DD
}

export async function digestAlreadySent(
  client_slug: string,
  week_ending: string,
): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const { data } = await supabase
    .from("client_work_log_digests")
    .select("id")
    .eq("client_slug", client_slug)
    .eq("week_ending", week_ending)
    .maybeSingle();
  return !!data;
}

export async function recordDigestSend(input: {
  client_slug: string;
  week_ending: string;
  entry_count: number;
  recipient_email: string | null;
}): Promise<void> {
  if (!isSupabaseConfigured()) return;
  await supabase.from("client_work_log_digests").insert(input);
}
