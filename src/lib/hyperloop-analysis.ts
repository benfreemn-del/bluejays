/**
 * Hyperloop — statistical analysis of variant performance.
 *
 * Deterministic math (Rule 59) — no AI in this file. The cron uses
 * these results to decide which variants to retire as losers, which
 * to promote as winners, and which to seed the Claude generator with.
 *
 * Approach: Wilson 95% confidence interval lower bound on conversion
 * rate per variant. Compared against the cohort's pooled baseline
 * conversion rate. This handles small-sample uncertainty well — a
 * variant with 100/2 (2% CR) doesn't get crowned over one with 5000/100
 * (2% CR) just because they share the point estimate.
 *
 * Why not full Bayesian Monte Carlo: at small variant counts (< 20 per
 * kind) and SMB-scale impression volumes (≤ 10k/wk per variant), Wilson
 * + cohort-baseline gives near-identical results to a Beta posterior
 * + Monte Carlo, with a 100× speedup and zero floating-point edge cases.
 */

export type VariantStatus = "active" | "paused" | "winner" | "loser" | "archived";

export interface VariantMetrics {
  id: string;
  kind: string;
  variantName: string;
  status: VariantStatus;
  impressions: number;
  clicks: number;
  conversions: number;
  costUsd: number;
}

export interface VariantAnalysis {
  id: string;
  kind: string;
  conversionRate: number;
  wilsonLowerBound: number;       // 95% lower bound on CR
  wilsonUpperBound: number;       // 95% upper bound on CR
  cpaUsd: number | null;          // null when 0 conversions
  verdict: "winner" | "loser" | "testing" | "insufficient_data";
  reason: string;
}

const Z_95 = 1.96;
// Below these floors a variant is "still testing" — too little signal
// to call winner or loser yet.
const MIN_IMPRESSIONS_FOR_VERDICT = 500;
const MIN_IMPRESSIONS_FOR_LOSER_HEURISTIC = 1000;

/**
 * Wilson score 95% CI for a Bernoulli proportion. Returns [lower, upper]
 * bounds on the true conversion rate given `successes`/`trials`.
 */
function wilsonCI(successes: number, trials: number): [number, number] {
  if (trials <= 0) return [0, 0];
  const p = successes / trials;
  const z2 = Z_95 * Z_95;
  const denom = 1 + z2 / trials;
  const center = (p + z2 / (2 * trials)) / denom;
  const margin = (Z_95 * Math.sqrt((p * (1 - p)) / trials + z2 / (4 * trials * trials))) / denom;
  return [Math.max(0, center - margin), Math.min(1, center + margin)];
}

/**
 * Pooled (cohort) conversion rate across all variants of the same kind.
 * Used as the baseline a variant has to BEAT to qualify as a winner.
 */
function cohortBaselineCR(variants: VariantMetrics[]): number {
  const totals = variants.reduce(
    (acc, v) => ({ i: acc.i + v.impressions, c: acc.c + v.conversions }),
    { i: 0, c: 0 },
  );
  return totals.i > 0 ? totals.c / totals.i : 0;
}

/**
 * Pooled CPA across all variants. Loser threshold uses 2× this.
 */
function cohortBaselineCPA(variants: VariantMetrics[]): number {
  const totals = variants.reduce(
    (acc, v) => ({ cost: acc.cost + v.costUsd, conv: acc.conv + v.conversions }),
    { cost: 0, conv: 0 },
  );
  return totals.conv > 0 ? totals.cost / totals.conv : 0;
}

/**
 * Score every variant in a single kind. Verdicts:
 *   - winner: Wilson lower bound > cohort baseline (95% confident this
 *     variant beats the average) AND impressions ≥ MIN_FOR_VERDICT
 *   - loser: high impressions + 0 conversions, OR Wilson upper bound <
 *     cohort baseline (95% confident WORSE than average), OR CPA > 2×
 *     cohort baseline. Either condition + ≥ MIN_FOR_LOSER_HEURISTIC.
 *   - testing: in between — keep running
 *   - insufficient_data: < MIN_FOR_VERDICT impressions
 */
export function analyzeKind(variants: VariantMetrics[]): VariantAnalysis[] {
  const baselineCR = cohortBaselineCR(variants);
  const baselineCPA = cohortBaselineCPA(variants);

  return variants.map((v) => {
    const cr = v.impressions > 0 ? v.conversions / v.impressions : 0;
    const [lo, hi] = wilsonCI(v.conversions, v.impressions);
    const cpa = v.conversions > 0 ? v.costUsd / v.conversions : null;

    let verdict: VariantAnalysis["verdict"];
    let reason: string;

    if (v.impressions < MIN_IMPRESSIONS_FOR_VERDICT) {
      verdict = "insufficient_data";
      reason = `Only ${v.impressions} impressions, need ${MIN_IMPRESSIONS_FOR_VERDICT}+ to call`;
    } else if (
      v.impressions >= MIN_IMPRESSIONS_FOR_LOSER_HEURISTIC &&
      v.conversions === 0
    ) {
      verdict = "loser";
      reason = `${v.impressions} impressions, zero conversions`;
    } else if (
      cpa !== null &&
      baselineCPA > 0 &&
      cpa > baselineCPA * 2 &&
      v.impressions >= MIN_IMPRESSIONS_FOR_LOSER_HEURISTIC
    ) {
      verdict = "loser";
      reason = `CPA ${cpa.toFixed(2)} > 2× cohort baseline ${baselineCPA.toFixed(2)}`;
    } else if (hi < baselineCR && v.impressions >= MIN_IMPRESSIONS_FOR_LOSER_HEURISTIC) {
      verdict = "loser";
      reason = `Wilson upper ${hi.toFixed(4)} < cohort baseline ${baselineCR.toFixed(4)}`;
    } else if (lo > baselineCR && baselineCR > 0) {
      verdict = "winner";
      reason = `Wilson lower ${lo.toFixed(4)} > cohort baseline ${baselineCR.toFixed(4)}`;
    } else {
      verdict = "testing";
      reason = `CR ${cr.toFixed(4)} in noise band of cohort ${baselineCR.toFixed(4)}`;
    }

    return {
      id: v.id,
      kind: v.kind,
      conversionRate: cr,
      wilsonLowerBound: lo,
      wilsonUpperBound: hi,
      cpaUsd: cpa,
      verdict,
      reason,
    };
  });
}

/**
 * Group variants by kind, run analyzeKind on each group, return a flat
 * map from variant ID → analysis. Caller decides what to do with each
 * verdict (retire losers, surface winners to AI, etc.).
 */
export function analyzeAll(variants: VariantMetrics[]): Map<string, VariantAnalysis> {
  const byKind = new Map<string, VariantMetrics[]>();
  for (const v of variants) {
    const list = byKind.get(v.kind) ?? [];
    list.push(v);
    byKind.set(v.kind, list);
  }

  const result = new Map<string, VariantAnalysis>();
  for (const [, group] of byKind) {
    for (const a of analyzeKind(group)) {
      result.set(a.id, a);
    }
  }
  return result;
}
