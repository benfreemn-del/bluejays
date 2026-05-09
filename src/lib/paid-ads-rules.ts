/**
 * paid-ads-rules.ts — canonical Hormozi 11-rule engine for paid ads.
 *
 * Single source of truth. Imported by:
 *   · AdsTabV2 (renders rules + bucket strategies + per-creative
 *     guardrail locks)
 *   · /api/clients/[slug]/ads/request-change (server-side guardrail
 *     enforcement on Delete + Scale)
 *   · /api/ai/iteration-engine/run (autonomous decision engine that
 *     emits scale / iterate / kill / reskin recommendations to
 *     agent_signals for owner review)
 *
 * The 11 rules are codified from the Hormozi paid-ads framework
 * Ben locked 2026-05-08. Tighten them HERE — every consumer reads
 * from this file so a rule change propagates everywhere.
 */

/* ──────────────────────────── BUCKETS ──────────────────────────── */

export type AllocationBucket = "winners" | "iteration" | "net-new";

/** Hormozi 70/20/10 budget allocation. */
export const BUDGET_ALLOCATION: Record<AllocationBucket, number> = {
  winners: 70,
  iteration: 20,
  "net-new": 10,
};

/* ─────────────────────── METRICS SHAPE ─────────────────────── */

export type CreativeMetricsInput = {
  /** Days since creative went live */
  ageDays: number;
  /** Return on ad spend (revenue / spend) */
  roas: number;
  /** Cumulative spend in USD */
  spendUsd: number;
};

/* ──────────────────── RULES (canonical) ──────────────────── */

export type Rule = {
  /** Stable id — referenced by recommendation rationale */
  id: string;
  /** 1-line summary for the dashboard rules list */
  short: string;
  /** Full rationale + when it applies */
  long: string;
  /** Which Hormozi rule number (1-11) */
  hormoziRule: number;
};

export const PAID_ADS_RULES: Rule[] = [
  {
    id: "no-kill-under-7d",
    hormoziRule: 1,
    short: "Don't kill creatives under 7 days old",
    long: "First 7 days = data-collection window. Algorithm needs ~50 conversions to optimize delivery. Killing early = throwing away the learning. Hard floor — no exceptions.",
  },
  {
    id: "100-versions-before-net-new",
    hormoziRule: 2,
    short: "Winners get 100 reskins before net-new",
    long: "When a creative wins (ROAS 5+, age 7+ days), squeeze it. B&W variant, sepia filter, hook swap, headline swap, music swap, scene cuts. Most creatives have 50-100 reskin permutations before they're truly tapped. Net-new is for when the WELL is dry.",
  },
  {
    id: "70-20-10-allocation",
    hormoziRule: 3,
    short: "Stay close to 70/20/10 budget split",
    long: "70% on proven winners (compound ROI), 20% on active iteration (mid-conviction permutations), 10% on net-new wild swings. Drift over ±10pt = the system rebalances on next iteration cron.",
  },
  {
    id: "80-percent-reskins",
    hormoziRule: 4,
    short: "80% reskin / 20% net-new in iteration bucket",
    long: "Within the 20% iteration budget, 80% of new creatives should be reskins of existing winners. Only 20% are genuine angle changes. Operators flip this ratio and waste creative-hours.",
  },
  {
    id: "top-3-second-hook",
    hormoziRule: 5,
    short: "Mine top 3 seconds for hooks",
    long: "70% of attention drop happens in the first 3 seconds. Watch top-performing reels — extract the literal opening shot + audio, port it to underperformers. Hook transplants are higher-leverage than rewriting the rest.",
  },
  {
    id: "proof-over-promise",
    hormoziRule: 6,
    short: "Proof > promise — show outcomes, not adjectives",
    long: "Customer screenshots > tagline copy. Lab numbers > 'proven results'. Before/after photos > 'transformative'. Proof-led creatives outperform promise-led 3:1 in our cohort. When iteration looks 'okay' — swap promise language for receipts.",
  },
  {
    id: "capacity-check-before-scale",
    hormoziRule: 7,
    short: "Capacity check before any scale recommendation",
    long: "Scaling spend without fulfillment capacity = burn customer experience + reputation. Before 2× spend, confirm the operations side can handle the volume (booking slots, lab turnaround, shipping, etc.). Owner gates this; system flags + waits.",
  },
  {
    id: "retargeting-highest-leverage",
    hormoziRule: 8,
    short: "Retargeting is highest-ROAS lever in any account",
    long: "Almost always positive ROI. Pixel + email-list custom audience + view-content + add-to-cart abandon. If the account isn't running retargeting, that's the FIRST suggestion the engine emits — almost always more impactful than any creative tweak.",
  },
  {
    id: "net-new-cap-10pct",
    hormoziRule: 9,
    short: "Net-new bucket hard-capped at 10%",
    long: "Operators love testing — they over-allocate. Hard rule: never more than 10% of platform spend on creatives <14 days old AND <2× ROAS. Server enforces this; system rejects budget changes that would breach the cap.",
  },
  {
    id: "scale-at-roas-7",
    hormoziRule: 10,
    short: "Scale only at ROAS 7+",
    long: "ROAS 2-5× = iterate, don't scale. ROAS 5-7× = graduate to winners bucket. ROAS 7+ AND capacity-checked = scale (recommend +50% daily budget per pass). Scaling below 7× = risk a regression to mean.",
  },
  {
    id: "kill-at-roas-1-21d-200spend",
    hormoziRule: 11,
    short: "Kill at ROAS <1× AND age 21+ AND spend $200+",
    long: "All three thresholds must be true. ROAS <1 means losing money on the creative. Age 21+ means it had real time. Spend $200+ means we have signal-volume. ANY one of those missing = NOT a kill candidate yet — keep iterating.",
  },
];

/* ──────────────── BUCKET ASSIGNMENT ──────────────── */

/**
 * Deterministic bucket assignment from metrics. Rule order matters —
 * winners requires BOTH high ROAS AND age (Rule 1 + Rule 10), so a
 * 1-day-old creative with one fluky ROAS can't graduate.
 */
export function assignBucket(m: CreativeMetricsInput): AllocationBucket {
  // Winners: real signal + real age
  if (m.roas >= 5 && m.ageDays >= 7) return "winners";
  // Iteration: above water but not yet a winner
  if (m.roas >= 2 && m.ageDays >= 7) return "iteration";
  // Anything fresh stays in net-new for the test window
  if (m.ageDays < 14) return "net-new";
  // Older + sub-2× ROAS goes back to iteration for re-test or eventual kill
  return "iteration";
}

/* ──────────────── GUARDRAIL EVALUATIONS ──────────────── */

export type GuardrailVerdict =
  | { allowed: true }
  | { allowed: false; reason: string; ruleId: string };

/** Rule 1 — kill / delete blocked when age < 7 days. */
export function canDelete(m: CreativeMetricsInput): GuardrailVerdict {
  if (m.ageDays < 7) {
    return {
      allowed: false,
      reason: `Locked by Hormozi Rule 1: don't kill creatives under 7 days old. Currently ${m.ageDays}d old — let it gather data first.`,
      ruleId: "no-kill-under-7d",
    };
  }
  return { allowed: true };
}

/** Rule 10 — scale blocked below 2× ROAS. */
export function canScale(m: CreativeMetricsInput): GuardrailVerdict {
  if (m.roas < 2) {
    return {
      allowed: false,
      reason: `Locked by Hormozi Rule 10: scale requires ROAS ≥ 2×. Currently ${m.roas.toFixed(1)}× — iterate first or run a kill check at 21 days.`,
      ruleId: "scale-at-roas-7",
    };
  }
  return { allowed: true };
}

/** Rule 11 — true kill candidate. ALL three thresholds must apply. */
export function isKillCandidate(m: CreativeMetricsInput): boolean {
  return m.roas < 1 && m.ageDays >= 21 && m.spendUsd >= 200;
}

/* ──────────────── RECOMMENDATION ENGINE ──────────────── */

export type RecommendationAction = "scale" | "iterate" | "kill" | "reskin" | "retarget";

export type Recommendation = {
  creativeId: string;
  action: RecommendationAction;
  rationale: string;
  ruleId: string;
  /** 0-1 — engine's confidence based on signal volume */
  confidence: number;
};

/**
 * Run the iteration engine over a list of creatives + their metrics.
 * Pure function — no DB access. Caller persists the recommendations
 * to agent_signals or wherever appropriate.
 *
 * Engine logic per Hormozi rules:
 *   · Scale → Rule 10 (ROAS 7+, age 7+, capacity-checked externally)
 *   · Iterate → Rule 2 + Rule 4 (winners get reskinned, not net-new'd)
 *   · Kill → Rule 11 (all three thresholds true)
 *   · Reskin → Rule 5 + Rule 6 (high-ROAS that's been static — pump
 *     hooks/proof variants)
 *   · Retarget → Rule 8 (always positive lever; engine emits if no
 *     retargeting creatives present in the account)
 */
export function runIterationEngine(
  creatives: Array<{ id: string; metrics: CreativeMetricsInput }>,
): Recommendation[] {
  const recs: Recommendation[] = [];
  for (const c of creatives) {
    const m = c.metrics;

    // Kill candidates first — clearest signal, gets cleared off the
    // board so subsequent rules don't try to iterate on a dead creative.
    if (isKillCandidate(m)) {
      recs.push({
        creativeId: c.id,
        action: "kill",
        ruleId: "kill-at-roas-1-21d-200spend",
        rationale: `ROAS ${m.roas.toFixed(1)}× over ${m.ageDays}d at $${m.spendUsd.toFixed(0)} spend. All three Rule 11 thresholds met — losing money, real time, real signal.`,
        confidence: 0.9,
      });
      continue;
    }

    // Scale candidates — ROAS 7+ AND age 7+ AND meaningful spend.
    if (m.roas >= 7 && m.ageDays >= 7 && m.spendUsd >= 100) {
      recs.push({
        creativeId: c.id,
        action: "scale",
        ruleId: "scale-at-roas-7",
        rationale: `ROAS ${m.roas.toFixed(1)}× over ${m.ageDays}d at $${m.spendUsd.toFixed(0)} spend. Above the 7× scale threshold — recommend +50% daily budget pending capacity check.`,
        confidence: 0.85,
      });
      continue;
    }

    // Reskin candidates — winners that have been static (age 14+
    // without a graduation event). Per Rule 2, squeeze them harder.
    if (m.roas >= 5 && m.ageDays >= 14) {
      recs.push({
        creativeId: c.id,
        action: "reskin",
        ruleId: "100-versions-before-net-new",
        rationale: `ROAS ${m.roas.toFixed(1)}× and ${m.ageDays}d old. Per Rule 2, winners get 100 reskins before net-new. Suggested permutations: B&W variant, sepia filter, hook-swap from top-3-second mining, proof-led headline swap.`,
        confidence: 0.75,
      });
      continue;
    }

    // Iterate candidates — ROAS 2-5× and old enough to have real signal.
    if (m.roas >= 2 && m.roas < 5 && m.ageDays >= 7) {
      recs.push({
        creativeId: c.id,
        action: "iterate",
        ruleId: "100-versions-before-net-new",
        rationale: `ROAS ${m.roas.toFixed(1)}× over ${m.ageDays}d. Mid-conviction — swap copy on proven outcomes, mine top-3-second hook from your highest-ROAS creative.`,
        confidence: 0.6,
      });
    }
  }
  return recs;
}

/**
 * Account-level recommendation: emit "set up retargeting" if NO
 * retargeting creatives are present. Per Rule 8, this is the highest-
 * ROAS lever in any account — should fire FIRST when missing.
 */
export function checkRetargetingGap(
  hasRetargeting: boolean,
): Recommendation | null {
  if (hasRetargeting) return null;
  return {
    creativeId: "_account",
    action: "retarget",
    ruleId: "retargeting-highest-leverage",
    rationale:
      "No retargeting creatives detected on this account. Per Hormozi Rule 8 — retargeting is the highest-ROAS lever in any account, almost always positive. Recommended: pixel install + email-list custom audience + view-content + add-to-cart abandon segments.",
    confidence: 0.95,
  };
}

/* ──────────────── ALLOCATION DRIFT ──────────────── */

export type AllocationDrift = {
  bucket: AllocationBucket;
  /** Current % of platform spend on this bucket */
  currentPct: number;
  /** Target % per Rule 3 */
  targetPct: number;
  /** currentPct - targetPct (positive = over, negative = under) */
  drift: number;
  /** Drift severity */
  severity: "on-target" | "minor" | "major";
};

/**
 * Compute drift across all 3 buckets. Threshold:
 *   · ≤5pt = on-target
 *   · ≤15pt = minor
 *   · >15pt = major (engine recommends rebalance on next cron)
 */
export function computeAllocationDrift(
  spendByBucket: Record<AllocationBucket, number>,
): AllocationDrift[] {
  const total =
    spendByBucket.winners +
    spendByBucket.iteration +
    spendByBucket["net-new"];
  if (total === 0) return [];
  const buckets: AllocationBucket[] = ["winners", "iteration", "net-new"];
  return buckets.map((b) => {
    const currentPct = Math.round((spendByBucket[b] / total) * 100);
    const targetPct = BUDGET_ALLOCATION[b];
    const drift = currentPct - targetPct;
    const abs = Math.abs(drift);
    const severity: AllocationDrift["severity"] =
      abs <= 5 ? "on-target" : abs <= 15 ? "minor" : "major";
    return { bucket: b, currentPct, targetPct, drift, severity };
  });
}
