import { getSupabase } from "./supabase";

/**
 * hyperloop-decisions — append-only log helper.
 *
 * Call recordDecision() from the hyperloop runner whenever a verdict
 * actually changes a variant's status / budget. The UI at
 * /dashboard/hyperloop/history reads from this table.
 *
 * Fire-and-forget — never blocks the runner. Failures are logged but
 * don't throw.
 */

export type DecisionKind =
  | "promote_winner"
  | "pause_loser"
  | "dethrone"
  | "seed_variant"
  | "allocate_budget";

export interface RecordDecisionArgs {
  clientSlug: string;
  decisionKind: DecisionKind;
  variantId?: string;
  variantName?: string;
  cohortKind?: string;
  beforeState?: Record<string, unknown>;
  afterState?: Record<string, unknown>;
  reason: string;
  triggeredBy?: "cron" | "manual" | "operator";
}

export async function recordDecision(args: RecordDecisionArgs): Promise<void> {
  try {
    await getSupabase().from("hyperloop_decisions").insert({
      client_slug: args.clientSlug,
      decision_kind: args.decisionKind,
      variant_id: args.variantId ?? null,
      variant_name: args.variantName ?? null,
      cohort_kind: args.cohortKind ?? null,
      before_state: args.beforeState ?? null,
      after_state: args.afterState ?? null,
      reason: args.reason,
      triggered_by: args.triggeredBy ?? "cron",
    });
  } catch (e) {
    console.error("[hyperloop-decisions] insert failed:", (e as Error).message);
  }
}

export interface DecisionRow {
  id: string;
  client_slug: string;
  decision_kind: DecisionKind;
  variant_id: string | null;
  variant_name: string | null;
  cohort_kind: string | null;
  before_state: Record<string, unknown> | null;
  after_state: Record<string, unknown> | null;
  reason: string;
  triggered_by: string;
  created_at: string;
}

export async function listDecisions(opts?: {
  clientSlug?: string;
  limit?: number;
}): Promise<DecisionRow[]> {
  const sb = getSupabase();
  let q = sb
    .from("hyperloop_decisions")
    .select(
      "id, client_slug, decision_kind, variant_id, variant_name, cohort_kind, before_state, after_state, reason, triggered_by, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(opts?.limit ?? 100);
  if (opts?.clientSlug) q = q.eq("client_slug", opts.clientSlug);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data ?? []) as DecisionRow[];
}
