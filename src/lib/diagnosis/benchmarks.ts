/**
 * Industry benchmark library — v1 covers the 4 industries Ben is
 * actively pitching (per N1 = A locked 2026-05-12).
 *
 * When a prospect doesn't know a metric, the diagnosis tool offers
 * (a) the industry benchmark below (flagged ⚠ "industry estimate")
 * or (b) a reverse-engineering qualifier (see qualifier-flows.ts).
 *
 * Sources:
 *  · Landscaping — Lawn & Landscape industry surveys + Hormozi $100M
 *    Leads chapter on local-service economics
 *  · Electrician — NECA benchmark studies + ServiceTitan internal data
 *  · Contractor (general) — JBKnowledge ConTech reports + Houzz Pro
 *  · Small e-comm — Shopify Plus + Klaviyo published benchmarks
 *
 * Every benchmark is a SAFE-MIDDLE estimate, not the best-in-class.
 * The point is "good-enough placeholder so we can derive other
 * metrics," NOT "this is true for your business."
 */

import type { MetricInputs } from "./metrics-calc";

export type Industry =
  | "landscaping"
  | "electrician"
  | "contractor"
  | "small_ecomm"
  | "other";

export type Benchmark = {
  value: number;
  note: string; // 1-line context shown next to the ⚠ flag
};

export type IndustryBenchmarks = {
  // Each metric is optional — some industries don't have published data
  monthly_revenue?: Benchmark;
  active_customers?: Benchmark;
  average_order_value?: Benchmark;
  gross_margin_pct?: Benchmark;
  churn_monthly_pct?: Benchmark;
  customer_acquisition_cost?: Benchmark;
};

export const INDUSTRY_LABELS: Record<Industry, string> = {
  landscaping: "Landscaping / Lawn Care",
  electrician: "Electrician",
  contractor: "General Contractor / Trades",
  small_ecomm: "Small E-commerce (<$1M/yr)",
  other: "Other",
};

/**
 * Per-industry benchmarks. Numbers represent a typical owner-operator
 * shop doing $200K–$1M/yr revenue — Ben's actual ICP.
 */
export const BENCHMARKS: Record<Industry, IndustryBenchmarks> = {
  landscaping: {
    average_order_value: {
      value: 65,
      note: "Typical maintenance visit $50–80 (weekly mow + edge + blow)",
    },
    gross_margin_pct: {
      value: 45,
      note: "After labor + fuel + equipment depreciation",
    },
    churn_monthly_pct: {
      value: 4,
      note: "Seasonal customers churn winter; year-round avg ~4%/mo",
    },
    customer_acquisition_cost: {
      value: 95,
      note: "Door hangers + Google Ads + word-of-mouth blended",
    },
  },

  electrician: {
    average_order_value: {
      value: 450,
      note: "Service call avg $300–600 (residential repair work)",
    },
    gross_margin_pct: {
      value: 55,
      note: "Lower labor intensity than landscaping; higher parts margin",
    },
    churn_monthly_pct: {
      value: 8,
      note: "Most customers one-off; repeat work concentrated in commercial accounts",
    },
    customer_acquisition_cost: {
      value: 165,
      note: "Google LSAs + Angi/HomeAdvisor leads + truck branding",
    },
  },

  contractor: {
    average_order_value: {
      value: 8500,
      note: "Mid-size project (kitchen reno, deck, bath); high variance",
    },
    gross_margin_pct: {
      value: 25,
      note: "Materials-heavy; labor subbed; thin margins on jobs > $10K",
    },
    churn_monthly_pct: {
      value: 12,
      note: "Mostly one-time projects; lifetime value comes from referrals",
    },
    customer_acquisition_cost: {
      value: 425,
      note: "Houzz/Angi referrals + showroom + sales-rep hours per deal",
    },
  },

  small_ecomm: {
    average_order_value: {
      value: 75,
      note: "DTC range $40–100 for sub-$1M shops",
    },
    gross_margin_pct: {
      value: 40,
      note: "COGS + shipping + payment fees on physical goods",
    },
    churn_monthly_pct: {
      value: 6,
      note: "Subscription products only; one-time-purchase products use repeat-rate instead",
    },
    customer_acquisition_cost: {
      value: 35,
      note: "Meta + Google + email blended (Shopify Plus median)",
    },
  },

  other: {
    // No benchmarks for "other" — Ben enters everything manually
    // or uses reverse-engineering flows
  },
};

/**
 * Look up a single benchmark.
 */
export function getBenchmark(
  industry: Industry,
  metric: keyof MetricInputs
): Benchmark | null {
  const industryBenchmarks = BENCHMARKS[industry];
  if (!industryBenchmarks) return null;
  return industryBenchmarks[metric] ?? null;
}

/**
 * Apply industry benchmarks to fill in missing inputs.
 * Returns a NEW inputs object — does not mutate.
 *
 * Used by the UI when the user clicks "Use industry estimate" — we
 * fill the field, mark it in `estimates` JSONB, and recompute derived.
 */
export function applyBenchmark(
  inputs: MetricInputs,
  industry: Industry,
  metric: keyof MetricInputs
): { inputs: MetricInputs; applied: boolean; benchmark: Benchmark | null } {
  const benchmark = getBenchmark(industry, metric);
  if (!benchmark) {
    return { inputs, applied: false, benchmark: null };
  }
  return {
    inputs: { ...inputs, [metric]: benchmark.value },
    applied: true,
    benchmark,
  };
}
