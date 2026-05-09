/**
 * agent-signals.ts — event-bus helpers for inter-bot handoffs.
 *
 * Any bot in the BlueJays system can call `emitSignal(...)` when
 * something happens that another bot might want to act on. Subscribers
 * tail with `readUnreadSignals(...)` and ack with `markSignalsRead(...)`.
 *
 * This replaces ad-hoc per-pair direct calls (e.g. watchdog calling
 * sendOwnerAlert directly) so the architecture stays composable as we
 * add more bots. The /dashboard/ai-bots diagram reads from this same
 * model — every `talksTo` edge in that diagram corresponds to a real
 * row in this table when wired.
 *
 * Severity convention:
 *   info     — informational, OK to silently log
 *   notice   — worth surfacing in the next digest, not urgent
 *   warn     — surface in the next digest with attention
 *   urgent   — escalate immediately (out-of-band SMS), don't wait
 */

import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export type AgentSignalSeverity = "info" | "notice" | "warn" | "urgent";

export type AgentSignalEmit = {
  source: string;
  kind: string;
  severity?: AgentSignalSeverity;
  clientSlug?: string;
  prospectId?: string;
  title: string;
  detail?: string;
  metadata?: Record<string, unknown>;
  /** Optional handoff target — which bot id should pick this up */
  target?: string;
};

export type AgentSignal = {
  id: string;
  source: string;
  kind: string;
  severity: AgentSignalSeverity;
  client_slug: string | null;
  prospect_id: string | null;
  title: string;
  detail: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  read_at: string | null;
  read_by: string | null;
  target: string | null;
};

/**
 * Emit a single signal. Soft-no-op when Supabase isn't configured (so
 * dev environments without DB credentials don't crash). Returns the
 * inserted row's id, or null if no-op'd.
 */
export async function emitSignal(s: AgentSignalEmit): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase
    .from("agent_signals")
    .insert({
      source: s.source,
      kind: s.kind,
      severity: s.severity ?? "info",
      client_slug: s.clientSlug ?? null,
      prospect_id: s.prospectId ?? null,
      title: s.title,
      detail: s.detail ?? null,
      metadata: s.metadata ?? {},
      target: s.target ?? null,
    })
    .select("id")
    .single();
  if (error) {
    console.warn("[agent-signals] emit failed:", error.message);
    return null;
  }
  return data?.id ?? null;
}

/**
 * Read unread signals (optionally filtered by source / severity / target).
 * Used by consumers like /api/digest to pull what's pending for them.
 *
 * `minSeverity` filters to >= the given level using the natural order
 * info < notice < warn < urgent.
 */
export async function readUnreadSignals(opts?: {
  source?: string;
  target?: string;
  clientSlug?: string;
  minSeverity?: AgentSignalSeverity;
  limit?: number;
}): Promise<AgentSignal[]> {
  if (!isSupabaseConfigured()) return [];
  let q = supabase
    .from("agent_signals")
    .select("*")
    .is("read_at", null)
    .order("created_at", { ascending: false })
    .limit(opts?.limit ?? 200);
  if (opts?.source) q = q.eq("source", opts.source);
  if (opts?.target) q = q.eq("target", opts.target);
  if (opts?.clientSlug) q = q.eq("client_slug", opts.clientSlug);
  if (opts?.minSeverity) {
    const order: AgentSignalSeverity[] = ["info", "notice", "warn", "urgent"];
    const allowed = order.slice(order.indexOf(opts.minSeverity));
    q = q.in("severity", allowed);
  }
  const { data, error } = await q;
  if (error) {
    console.warn("[agent-signals] read failed:", error.message);
    return [];
  }
  return (data ?? []) as AgentSignal[];
}

/**
 * Mark a batch of signals as read by `consumer`. Use this after a
 * downstream bot has rendered/acted on them so they don't re-fire.
 */
export async function markSignalsRead(
  ids: string[],
  consumer: string,
): Promise<void> {
  if (!isSupabaseConfigured() || ids.length === 0) return;
  const { error } = await supabase
    .from("agent_signals")
    .update({ read_at: new Date().toISOString(), read_by: consumer })
    .in("id", ids);
  if (error) {
    console.warn("[agent-signals] mark-read failed:", error.message);
  }
}
