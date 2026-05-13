/**
 * Diagnosis metrics calculator.
 *
 * Pure functions — given the 6 core inputs (some may be null), returns
 * derived metrics + health score. Recomputed on every save so the
 * dashboard read is fast.
 *
 * Health score thresholds based on Hormozi $100M Offers / Leads:
 *   - LTV:CAC ≥ 3   → healthy
 *   - LTV:CAC 1.5–3 → watch
 *   - LTV:CAC < 1.5 → red flag
 *   - Payback ≤ 6mo → healthy contributor (regardless of ratio)
 *   - Churn ≤ 5%/mo → healthy (lifespan ≥ 20 months)
 *   - Churn ≥ 15%/mo → red flag (lifespan ≤ 7 months)
 */

export type MetricInputs = {
  monthly_revenue: number | null;
  active_customers: number | null;
  average_order_value: number | null;
  gross_margin_pct: number | null; // 0–100 (percent, not decimal)
  churn_monthly_pct: number | null; // 0–100 (percent, not decimal)
  customer_acquisition_cost: number | null;
};

export type DerivedMetrics = {
  arpu_monthly: number | null;
  avg_lifespan_months: number | null;
  ltv: number | null;
  ltv_cac_ratio: number | null;
  payback_months: number | null;
  health_score: "healthy" | "watch" | "red_flag" | "insufficient_data";
  health_reasons: string[];
};

/**
 * Compute every derivable metric from the provided inputs.
 * Each output is null if its required inputs are missing.
 */
export function computeDerivedMetrics(inputs: MetricInputs): DerivedMetrics {
  const {
    monthly_revenue,
    active_customers,
    average_order_value,
    gross_margin_pct,
    churn_monthly_pct,
    customer_acquisition_cost,
  } = inputs;

  // ARPU monthly — average revenue per user per month
  // Prefer revenue/customers if both known, else fall back to AOV
  let arpu_monthly: number | null = null;
  if (
    monthly_revenue !== null &&
    active_customers !== null &&
    active_customers > 0
  ) {
    arpu_monthly = round2(monthly_revenue / active_customers);
  } else if (average_order_value !== null) {
    arpu_monthly = round2(average_order_value);
  }

  // Average customer lifespan in months — 1 / churn_rate
  // (Hormozi $100M Leads: lifespan = 1 / monthly churn)
  let avg_lifespan_months: number | null = null;
  if (
    churn_monthly_pct !== null &&
    churn_monthly_pct > 0 &&
    churn_monthly_pct <= 100
  ) {
    avg_lifespan_months = round1(100 / churn_monthly_pct);
  }

  // LTV — value equation: ARPU × lifespan × gross margin
  let ltv: number | null = null;
  if (arpu_monthly !== null && avg_lifespan_months !== null) {
    const grossMarginMultiplier =
      gross_margin_pct !== null ? gross_margin_pct / 100 : 1; // assume 100% if unknown
    ltv = round2(arpu_monthly * avg_lifespan_months * grossMarginMultiplier);
  }

  // LTV:CAC ratio
  let ltv_cac_ratio: number | null = null;
  if (
    ltv !== null &&
    customer_acquisition_cost !== null &&
    customer_acquisition_cost > 0
  ) {
    ltv_cac_ratio = round2(ltv / customer_acquisition_cost);
  }

  // Payback in months — CAC / ARPU (after gross margin)
  let payback_months: number | null = null;
  if (
    customer_acquisition_cost !== null &&
    arpu_monthly !== null &&
    arpu_monthly > 0
  ) {
    const grossMarginMultiplier =
      gross_margin_pct !== null ? gross_margin_pct / 100 : 1;
    const monthlyContribution = arpu_monthly * grossMarginMultiplier;
    if (monthlyContribution > 0) {
      payback_months = round1(customer_acquisition_cost / monthlyContribution);
    }
  }

  // Health score — composite signal
  const { health_score, health_reasons } = scoreHealth({
    ltv_cac_ratio,
    payback_months,
    churn_monthly_pct,
  });

  return {
    arpu_monthly,
    avg_lifespan_months,
    ltv,
    ltv_cac_ratio,
    payback_months,
    health_score,
    health_reasons,
  };
}

function scoreHealth(args: {
  ltv_cac_ratio: number | null;
  payback_months: number | null;
  churn_monthly_pct: number | null;
}): {
  health_score: DerivedMetrics["health_score"];
  health_reasons: string[];
} {
  const reasons: string[] = [];
  const flags: Array<"healthy" | "watch" | "red_flag"> = [];

  // Signal 1: LTV:CAC
  if (args.ltv_cac_ratio !== null) {
    if (args.ltv_cac_ratio >= 3) {
      flags.push("healthy");
      reasons.push(`LTV:CAC ${args.ltv_cac_ratio}× — healthy (≥ 3×)`);
    } else if (args.ltv_cac_ratio >= 1.5) {
      flags.push("watch");
      reasons.push(
        `LTV:CAC ${args.ltv_cac_ratio}× — watch zone (1.5–3× is fragile)`
      );
    } else {
      flags.push("red_flag");
      reasons.push(
        `LTV:CAC ${args.ltv_cac_ratio}× — RED FLAG (< 1.5× means you lose money per customer)`
      );
    }
  }

  // Signal 2: Payback
  if (args.payback_months !== null) {
    if (args.payback_months <= 6) {
      flags.push("healthy");
      reasons.push(
        `${args.payback_months} month payback — healthy (≤ 6 months)`
      );
    } else if (args.payback_months <= 12) {
      flags.push("watch");
      reasons.push(
        `${args.payback_months} month payback — watch (7–12 months means slow growth)`
      );
    } else {
      flags.push("red_flag");
      reasons.push(
        `${args.payback_months} month payback — RED FLAG (cash starvation risk)`
      );
    }
  }

  // Signal 3: Churn (Hormozi: 10%/mo means 10mo lifespan; aim ≤ 5%)
  if (args.churn_monthly_pct !== null) {
    if (args.churn_monthly_pct <= 5) {
      flags.push("healthy");
      reasons.push(
        `${args.churn_monthly_pct}% monthly churn — healthy (lifespan ≥ 20 months)`
      );
    } else if (args.churn_monthly_pct <= 15) {
      flags.push("watch");
      reasons.push(
        `${args.churn_monthly_pct}% monthly churn — watch (lifespan 7–20 months)`
      );
    } else {
      flags.push("red_flag");
      reasons.push(
        `${args.churn_monthly_pct}% monthly churn — RED FLAG (lifespan < 7 months)`
      );
    }
  }

  // Worst signal wins
  if (flags.length === 0) {
    return { health_score: "insufficient_data", health_reasons: [] };
  }
  if (flags.includes("red_flag")) {
    return { health_score: "red_flag", health_reasons: reasons };
  }
  if (flags.includes("watch")) {
    return { health_score: "watch", health_reasons: reasons };
  }
  return { health_score: "healthy", health_reasons: reasons };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

/**
 * Suggested input order — fields that unlock the most derivation
 * come first. Used by the UI to highlight "ask this next."
 */
export const SMART_ENTRY_ORDER: Array<keyof MetricInputs> = [
  "monthly_revenue", // Unlocks ARPU, MRR
  "active_customers", // Unlocks ARPU, churn-derive
  "average_order_value", // Often auto-fillable from revenue ÷ customers
  "gross_margin_pct", // Simple percentage estimate
  "churn_monthly_pct", // Hardest — qualifier flow helps
  "customer_acquisition_cost", // Often known from ad spend
];

/**
 * Which inputs each metric DEPENDS on. Used by the UI to show
 * "this unlocks: LTV, payback" hints.
 */
export const METRIC_UNLOCKS: Record<keyof MetricInputs, string[]> = {
  monthly_revenue: ["ARPU", "MRR"],
  active_customers: ["ARPU"],
  average_order_value: ["LTV (if no revenue+customers)"],
  gross_margin_pct: ["LTV", "Payback"],
  churn_monthly_pct: ["LTV", "Customer Lifespan"],
  customer_acquisition_cost: ["LTV:CAC ratio", "Payback period"],
};

/**
 * Friendly labels for the UI.
 */
export const METRIC_LABELS: Record<keyof MetricInputs, string> = {
  monthly_revenue: "Monthly Revenue",
  active_customers: "Active Customers",
  average_order_value: "Average Order Value (AOV)",
  gross_margin_pct: "Gross Margin %",
  churn_monthly_pct: "Monthly Churn %",
  customer_acquisition_cost: "Customer Acquisition Cost (CAC)",
};

export const METRIC_HINTS: Record<keyof MetricInputs, string> = {
  monthly_revenue: "Total revenue brought in last month (or a typical month)",
  active_customers: "Customers who paid you in the last 90 days",
  average_order_value: "Average $ per transaction / job / month",
  gross_margin_pct:
    "What % of revenue you keep after direct costs (materials, labor)",
  churn_monthly_pct:
    "% of customers who leave each month (or once a year ÷ 12 for service businesses)",
  customer_acquisition_cost:
    "$ spent on marketing/ads ÷ new customers gained — what each customer cost to win",
};

export const METRIC_UNIT: Record<keyof MetricInputs, "currency" | "count" | "percent"> = {
  monthly_revenue: "currency",
  active_customers: "count",
  average_order_value: "currency",
  gross_margin_pct: "percent",
  churn_monthly_pct: "percent",
  customer_acquisition_cost: "currency",
};
