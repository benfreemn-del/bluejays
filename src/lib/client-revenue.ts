/**
 * Client revenue attribution helpers.
 *
 * Closes the loop on the funnel: leads in → revenue out. Used by:
 *   - Owner portal Overview tile ("$X closed this period")
 *   - Dashboard client detail ("mark lead won at $X" button)
 *   - Friday work-log digest email (revenue line in the totals block)
 *   - Future: nightly Stripe Connect sync cron
 *
 * Migration: supabase/migrations/20260518_client_revenue.sql
 */

import { supabase, isSupabaseConfigured } from "./supabase";

export type RevenueSource =
  | "manual"
  | "stripe"
  | "square"
  | "quickbooks"
  | "shopify"
  | "other";

export type RevenueAttribution = {
  id: string;
  client_slug: string;
  lead_id: string | null;
  customer_email: string | null;
  customer_name: string | null;
  amount_cents: number;
  currency: string;
  source: RevenueSource;
  external_id: string | null;
  product_name: string | null;
  notes: string | null;
  closed_at: string;
  created_at: string;
};

export type RevenueSummary = {
  closed_count: number;
  total_cents: number;
  currency: string;
  avg_deal_cents: number;
  largest_deal_cents: number;
};

export async function recordRevenue(input: {
  client_slug: string;
  lead_id?: string | null;
  customer_email?: string | null;
  customer_name?: string | null;
  amount_cents: number;
  currency?: string;
  source?: RevenueSource;
  external_id?: string | null;
  product_name?: string | null;
  notes?: string | null;
  closed_at?: Date;
}): Promise<RevenueAttribution | null> {
  if (!isSupabaseConfigured()) return null;
  const row = {
    client_slug: input.client_slug,
    lead_id: input.lead_id ?? null,
    customer_email: input.customer_email ?? null,
    customer_name: input.customer_name ?? null,
    amount_cents: input.amount_cents,
    currency: input.currency ?? "USD",
    source: input.source ?? "manual",
    external_id: input.external_id ?? null,
    product_name: input.product_name ?? null,
    notes: input.notes ?? null,
    closed_at: (input.closed_at ?? new Date()).toISOString(),
  };
  const { data, error } = await supabase
    .from("client_revenue_attributions")
    .insert(row)
    .select("*")
    .single();
  if (error || !data) return null;
  return data as RevenueAttribution;
}

export async function listRevenue(opts: {
  client_slug: string;
  since?: Date;
  until?: Date;
  limit?: number;
}): Promise<RevenueAttribution[]> {
  if (!isSupabaseConfigured()) return [];
  let q = supabase
    .from("client_revenue_attributions")
    .select("*")
    .eq("client_slug", opts.client_slug)
    .order("closed_at", { ascending: false })
    .limit(opts.limit ?? 500);
  if (opts.since) q = q.gte("closed_at", opts.since.toISOString());
  if (opts.until) q = q.lt("closed_at", opts.until.toISOString());
  const { data, error } = await q;
  if (error || !data) return [];
  return data as RevenueAttribution[];
}

export function summarize(rows: RevenueAttribution[]): RevenueSummary {
  if (rows.length === 0) {
    return {
      closed_count: 0,
      total_cents: 0,
      currency: "USD",
      avg_deal_cents: 0,
      largest_deal_cents: 0,
    };
  }
  const total = rows.reduce((sum, r) => sum + r.amount_cents, 0);
  const largest = Math.max(...rows.map((r) => r.amount_cents));
  return {
    closed_count: rows.length,
    total_cents: total,
    currency: rows[0].currency,
    avg_deal_cents: Math.round(total / rows.length),
    largest_deal_cents: largest,
  };
}

export async function deleteRevenue(id: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const { error } = await supabase
    .from("client_revenue_attributions")
    .delete()
    .eq("id", id);
  return !error;
}

export function formatMoney(cents: number, currency = "USD"): string {
  const dollars = cents / 100;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: dollars >= 100 ? 0 : 2,
  }).format(dollars);
}
