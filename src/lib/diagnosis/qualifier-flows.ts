/**
 * Reverse-engineering qualifier flows (Q4-C locked 2026-05-12).
 *
 * When a prospect doesn't know a metric directly, we ask 1–2 simpler
 * questions whose answers can be combined into the metric we need.
 *
 * Example: most local-service owners don't know their "monthly churn
 * rate" — but they DO know "how many of my customers from last year
 * came back this year." Math: churn = (1 - return_rate) / 12.
 *
 * Each flow is a small set of typed inputs + a `derive()` function
 * that turns the raw answers into the missing metric.
 */

import type { MetricInputs } from "./metrics-calc";

export type QualifierAnswer = number | null;

export type QualifierField = {
  key: string;
  label: string;
  hint?: string;
  unit: "count" | "currency" | "percent" | "months";
  placeholder?: string;
};

export type QualifierFlow = {
  metric: keyof MetricInputs;
  title: string;
  blurb: string; // One-sentence frame so the prospect understands why we're asking
  fields: QualifierField[];
  derive: (answers: Record<string, QualifierAnswer>) => number | null;
};

/**
 * Churn — derive from year-over-year customer retention.
 * Formula: annual_retention = returning / total
 *          annual_churn     = 1 - annual_retention
 *          monthly_churn    = 1 - (annual_retention ^ (1/12))   ← compounding
 * For simplicity & owner-friendliness we use the linear approximation
 * monthly_churn ≈ annual_churn / 12 — close enough at typical rates.
 */
const churnFlow: QualifierFlow = {
  metric: "churn_monthly_pct",
  title: "Let's figure out churn together",
  blurb:
    "Most owners don't know their churn % directly — but you know roughly how many old customers came back. Math handles the rest.",
  fields: [
    {
      key: "customers_last_year",
      label: "Total customers you served last year",
      hint: "Best guess is fine — round numbers work",
      unit: "count",
      placeholder: "120",
    },
    {
      key: "customers_returned_this_year",
      label: "Of those, how many bought from you again this year?",
      hint: "Roughly — this is the most important number",
      unit: "count",
      placeholder: "85",
    },
  ],
  derive: (answers) => {
    const last = answers.customers_last_year;
    const returned = answers.customers_returned_this_year;
    if (last === null || returned === null || last <= 0) return null;
    if (returned > last) return null; // sanity
    const annualRetention = returned / last;
    const annualChurn = 1 - annualRetention;
    const monthlyChurn = annualChurn / 12; // linear approx
    // Return as percent (0–100), capped sanely
    return Math.max(0, Math.min(100, Math.round(monthlyChurn * 100 * 100) / 100));
  },
};

/**
 * CAC — derive from monthly marketing spend + new customers gained.
 */
const cacFlow: QualifierFlow = {
  metric: "customer_acquisition_cost",
  title: "Let's back into CAC",
  blurb:
    "What you spent on getting customers ÷ how many you got = what each one cost. Even a rough number is gold.",
  fields: [
    {
      key: "monthly_marketing_spend",
      label: "Roughly $/month on marketing + ads + lead-gen",
      hint: "Include Google Ads, Facebook, fliers, sponsorships — anything you spend to attract customers. Skip your time, just real $.",
      unit: "currency",
      placeholder: "1500",
    },
    {
      key: "new_customers_per_month",
      label: "New customers per month (not counting repeats)",
      hint: "Roughly — a typical month",
      unit: "count",
      placeholder: "12",
    },
  ],
  derive: (answers) => {
    const spend = answers.monthly_marketing_spend;
    const newCust = answers.new_customers_per_month;
    if (spend === null || newCust === null || newCust <= 0) return null;
    return Math.round((spend / newCust) * 100) / 100;
  },
};

/**
 * AOV — derive from total revenue ÷ transactions.
 */
const aovFlow: QualifierFlow = {
  metric: "average_order_value",
  title: "Let's back into Average Order Value",
  blurb: "Revenue ÷ transactions = what a typical sale is worth.",
  fields: [
    {
      key: "monthly_revenue",
      label: "Roughly $/month in revenue",
      unit: "currency",
      placeholder: "40000",
    },
    {
      key: "transactions_per_month",
      label: "How many transactions/jobs/orders per month?",
      hint: "Each invoice, each job, each transaction counts as one",
      unit: "count",
      placeholder: "65",
    },
  ],
  derive: (answers) => {
    const rev = answers.monthly_revenue;
    const tx = answers.transactions_per_month;
    if (rev === null || tx === null || tx <= 0) return null;
    return Math.round((rev / tx) * 100) / 100;
  },
};

/**
 * Active customers — derive from monthly revenue ÷ AOV (if AOV known).
 */
const activeCustomersFlow: QualifierFlow = {
  metric: "active_customers",
  title: "Let's estimate active customers",
  blurb:
    "If you know monthly revenue and roughly what each customer pays you, we can back into how many active ones you have.",
  fields: [
    {
      key: "monthly_revenue",
      label: "Roughly $/month in revenue",
      unit: "currency",
      placeholder: "40000",
    },
    {
      key: "avg_monthly_revenue_per_customer",
      label: "Typical $/month per customer",
      hint: "What a regular customer spends with you each month",
      unit: "currency",
      placeholder: "65",
    },
  ],
  derive: (answers) => {
    const rev = answers.monthly_revenue;
    const arpu = answers.avg_monthly_revenue_per_customer;
    if (rev === null || arpu === null || arpu <= 0) return null;
    return Math.round(rev / arpu);
  },
};

/**
 * Gross margin — derive from revenue & direct costs.
 */
const grossMarginFlow: QualifierFlow = {
  metric: "gross_margin_pct",
  title: "Let's back into Gross Margin",
  blurb:
    "What you keep after the direct costs of delivering the service. Labor, materials, fuel — but NOT rent or marketing.",
  fields: [
    {
      key: "monthly_revenue",
      label: "Roughly $/month in revenue",
      unit: "currency",
      placeholder: "40000",
    },
    {
      key: "monthly_direct_costs",
      label: "Direct costs to deliver that revenue",
      hint: "Materials + crew labor + fuel + sub-contractors. NOT rent/insurance/owner pay.",
      unit: "currency",
      placeholder: "22000",
    },
  ],
  derive: (answers) => {
    const rev = answers.monthly_revenue;
    const costs = answers.monthly_direct_costs;
    if (rev === null || costs === null || rev <= 0) return null;
    if (costs > rev) return 0; // negative margin clamps to 0
    return Math.round(((rev - costs) / rev) * 100 * 100) / 100;
  },
};

/**
 * Monthly revenue — derive from annual revenue.
 */
const monthlyRevenueFlow: QualifierFlow = {
  metric: "monthly_revenue",
  title: "Let's back into monthly revenue",
  blurb: "If you know annual revenue, divide by 12.",
  fields: [
    {
      key: "annual_revenue",
      label: "Total revenue last year (annual)",
      hint: "Tax-return number is fine — or your best estimate",
      unit: "currency",
      placeholder: "480000",
    },
  ],
  derive: (answers) => {
    const annual = answers.annual_revenue;
    if (annual === null || annual <= 0) return null;
    return Math.round((annual / 12) * 100) / 100;
  },
};

/**
 * All flows keyed by metric.
 */
export const QUALIFIER_FLOWS: Partial<
  Record<keyof MetricInputs, QualifierFlow>
> = {
  monthly_revenue: monthlyRevenueFlow,
  active_customers: activeCustomersFlow,
  average_order_value: aovFlow,
  gross_margin_pct: grossMarginFlow,
  churn_monthly_pct: churnFlow,
  customer_acquisition_cost: cacFlow,
};

/**
 * Get the flow for a metric, or null if none exists.
 */
export function getQualifierFlow(
  metric: keyof MetricInputs
): QualifierFlow | null {
  return QUALIFIER_FLOWS[metric] ?? null;
}
