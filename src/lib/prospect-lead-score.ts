/**
 * Prospect lead-score — Joel's "lead scoring at opt-in" framework.
 *
 * Composite 0-100 fit score + recommended tier + recommended owner.
 * Computed at intake (audit form submission) and re-computed on status
 * changes that surface new info (BANT form, audit completion, etc).
 *
 * Powers:
 *   - /dashboard/queue priority ordering (highest fit first)
 *   - Workflow auto-routing (Phase 2): high-fit → Ben, low-fit → Madie
 *   - Auto-fire damaging admission (Phase 2): low fit_score → Day-0 disqual
 *
 * Migration: supabase/migrations/20260518_prospect_touches.sql (same file)
 */

import { supabase, isSupabaseConfigured } from "./supabase";

// ── Types ──────────────────────────────────────────────────────────

export type RecommendedTier =
  | "fullsystem"
  | "standard"
  | "custom"
  | "free"
  | "disqualify";

export type RecommendedOwner = "madie" | "ben" | "ai-only" | "disqualify";

export type ProspectLeadScore = {
  prospect_id: string;
  fit_score: number;
  audit_score: number | null;
  bant_score: number | null;
  icp_score: number | null;
  contact_certainty: number | null;
  recommended_tier: RecommendedTier | null;
  recommended_owner: RecommendedOwner | null;
  rationale: string | null;
  scored_at: string;
  updated_at: string;
};

export type ScoreInputs = {
  prospectId: string;
  auditScore?: number;       // 0-100 from the AI audit result
  bantScore?: number;        // 0-100 from BANT form (budget/authority/need/timeline)
  icpScore?: number;         // 0-100 ICP fit (mfg / DTC / author bonus)
  contactCertainty?: number; // 0-100 — valid email + phone + business name
  rationale?: string;
};

// ── Composite score logic ──────────────────────────────────────────

/**
 * Compute the composite fit_score from sub-scores using BlueJays-specific
 * weights. Tunable as we learn from closed deals (Phase 3).
 *
 * Current weights (sum to 1.0):
 *   - audit_score      0.35  (the audit reveals real fundamental problems)
 *   - bant_score       0.30  (budget + authority = closes vs no closes)
 *   - icp_score        0.20  (ICP fit predicts retention quality)
 *   - contact_certainty 0.15 (without it, you can't even reach them)
 */
export function computeFitScore(
  audit?: number,
  bant?: number,
  icp?: number,
  contact?: number,
): number {
  // Default missing sub-scores to 50 (neutral) so a single missing piece
  // doesn't crater the composite
  const a = audit ?? 50;
  const b = bant ?? 50;
  const i = icp ?? 50;
  const c = contact ?? 50;
  const composite = a * 0.35 + b * 0.3 + i * 0.2 + c * 0.15;
  return Math.max(0, Math.min(100, Math.round(composite)));
}

/**
 * Map a fit_score → recommended tier. Tunable based on BlueJays close
 * patterns; current cut points are conservative.
 *
 * Logic:
 *   - 85+ → fullsystem ($10k AI System) — perfect ICP, BANT, audit
 *   - 65-84 → standard ($997 site) — good fit, mid-budget
 *   - 45-64 → custom ($100/yr bespoke) — niche fit, value-conscious
 *   - 25-44 → free ($30 friends/family) — low-budget but salvageable
 *   - <25 → disqualify — don't waste Madie's time
 */
export function recommendTier(fitScore: number): RecommendedTier {
  if (fitScore >= 85) return "fullsystem";
  if (fitScore >= 65) return "standard";
  if (fitScore >= 45) return "custom";
  if (fitScore >= 25) return "free";
  return "disqualify";
}

/**
 * Map a fit_score → recommended owner.
 *
 * Hormozi "workflows not roles" — auto-routing on intake:
 *   - 80+ → ben (high-value, closer handles)
 *   - 40-79 → madie (mid-value, setter qualifies)
 *   - 20-39 → ai-only (automated nurture, no human touch yet)
 *   - <20 → disqualify (don't enter the funnel)
 */
export function recommendOwner(fitScore: number): RecommendedOwner {
  if (fitScore >= 80) return "ben";
  if (fitScore >= 40) return "madie";
  if (fitScore >= 20) return "ai-only";
  return "disqualify";
}

// ── Operations ─────────────────────────────────────────────────────

/**
 * Compute + upsert a score row for a prospect. Returns the persisted row.
 * Idempotent — re-running overwrites the prior score with current values.
 */
export async function scoreProspect(
  inputs: ScoreInputs,
): Promise<ProspectLeadScore | null> {
  if (!isSupabaseConfigured()) return null;

  const fit = computeFitScore(
    inputs.auditScore,
    inputs.bantScore,
    inputs.icpScore,
    inputs.contactCertainty,
  );
  const tier = recommendTier(fit);
  const owner = recommendOwner(fit);

  const { data, error } = await supabase
    .from("prospect_lead_score")
    .upsert(
      {
        prospect_id: inputs.prospectId,
        fit_score: fit,
        audit_score: inputs.auditScore ?? null,
        bant_score: inputs.bantScore ?? null,
        icp_score: inputs.icpScore ?? null,
        contact_certainty: inputs.contactCertainty ?? null,
        recommended_tier: tier,
        recommended_owner: owner,
        rationale: inputs.rationale ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "prospect_id" },
    )
    .select("*")
    .single();

  if (error) {
    console.error("[scoreProspect] upsert failed:", error.message);
    return null;
  }
  return data as ProspectLeadScore;
}

/**
 * Fetch the current score for a prospect (NULL if not yet scored).
 */
export async function getProspectScore(
  prospectId: string,
): Promise<ProspectLeadScore | null> {
  if (!isSupabaseConfigured()) return null;
  const { data } = await supabase
    .from("prospect_lead_score")
    .select("*")
    .eq("prospect_id", prospectId)
    .maybeSingle();
  return (data as ProspectLeadScore) || null;
}

/**
 * Top-N highest-fit prospects (for the operator queue view). Optional
 * filter by recommended_owner so Madie sees her queue, Ben sees his.
 */
export async function topProspectsByScore(
  limit: number = 50,
  owner?: RecommendedOwner,
): Promise<ProspectLeadScore[]> {
  if (!isSupabaseConfigured()) return [];
  let q = supabase
    .from("prospect_lead_score")
    .select("*")
    .order("fit_score", { ascending: false })
    .limit(limit);
  if (owner) q = q.eq("recommended_owner", owner);
  const { data, error } = await q;
  if (error) {
    console.error("[topProspectsByScore] query failed:", error.message);
    return [];
  }
  return (data || []) as ProspectLeadScore[];
}
