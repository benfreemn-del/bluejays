/**
 * Amazon Ads (AMS) optimizer — scaffolding.
 *
 * The audit estimated 1 month total to ship the real automation:
 *   - 2 weeks for Amazon Ads API access (LWA + sandbox + ad-api approval)
 *   - 1 week for the optimizer logic itself
 *
 * This module ships the storage + helpers + a mock-mode that lets the
 * UI render plausible "this is what the optimizer will be doing"
 * previews on day one. When Ben gets API access, drop the live client
 * into `amazonAdsClient()` and the rest of the stack works unchanged.
 *
 * Decision rules (locked in audit, not invented here):
 *   - Pause keywords with ACoS > 2× client.target_acos_pct after 30+ clicks
 *   - Bid up keywords with ACoS < 0.5× target after 5+ orders
 *   - Add common negative keywords on auto campaigns weekly
 *   - Surface decisions to client_work_log so they appear in Friday digest
 *
 * Migration: supabase/migrations/20260518_amazon_ads.sql
 */

import { supabase, isSupabaseConfigured } from "./supabase";

export type AmazonConnection = {
  client_slug: string;
  profile_id: string | null;
  marketplace: string;
  scope: string | null;
  last_refresh_at: string | null;
  last_sync_at: string | null;
  last_sync_error: string | null;
  target_acos_pct: number;
};

export type AmazonCampaign = {
  id: string;
  client_slug: string;
  campaign_id: string;
  campaign_name: string;
  campaign_type: "sponsored_products" | "sponsored_brands";
  state: "enabled" | "paused" | "archived";
  daily_budget_cents: number | null;
  total_spend_cents: number;
  total_sales_cents: number;
  spend_7d_cents: number;
  sales_7d_cents: number;
  orders_7d: number;
  acos_7d_pct: number | null;
  last_synced_at: string;
};

export type OptimizerAction =
  | "paused_keyword"
  | "bid_up_keyword"
  | "bid_down_keyword"
  | "added_negative"
  | "expanded_match"
  | "budget_adjusted";

export async function getConnection(
  client_slug: string,
): Promise<AmazonConnection | null> {
  if (!isSupabaseConfigured()) return null;
  const { data } = await supabase
    .from("client_amazon_ads_connections")
    .select(
      "client_slug, profile_id, marketplace, scope, last_refresh_at, last_sync_at, last_sync_error, target_acos_pct",
    )
    .eq("client_slug", client_slug)
    .maybeSingle();
  return (data as AmazonConnection | null) ?? null;
}

export async function listCampaigns(
  client_slug: string,
): Promise<AmazonCampaign[]> {
  if (!isSupabaseConfigured()) return [];
  const { data } = await supabase
    .from("amazon_ads_campaigns")
    .select("*")
    .eq("client_slug", client_slug)
    .order("spend_7d_cents", { ascending: false });
  return (data as AmazonCampaign[] | null) ?? [];
}

/**
 * Returns a plausible preview of what the optimizer WILL be doing once
 * the Amazon Ads API is connected. Renders on the admin dashboard so
 * the value is visible from day one. Real numbers replace these once
 * the first sync completes.
 */
export function getMockOptimizerPreview(targetAcos: number): {
  campaigns: AmazonCampaign[];
  decisions: { action: OptimizerAction; rationale: string }[];
} {
  const now = new Date().toISOString();
  const slug = "preview";
  const campaigns: AmazonCampaign[] = [
    {
      id: "preview-1",
      client_slug: slug,
      campaign_id: "SP-AUTO-1",
      campaign_name: "Auto — Series Keyword Discovery",
      campaign_type: "sponsored_products",
      state: "enabled",
      daily_budget_cents: 1500,
      total_spend_cents: 38420,
      total_sales_cents: 92110,
      spend_7d_cents: 8920,
      sales_7d_cents: 24830,
      orders_7d: 14,
      acos_7d_pct: 35.93,
      last_synced_at: now,
    },
    {
      id: "preview-2",
      client_slug: slug,
      campaign_id: "SP-EXACT-1",
      campaign_name: "Exact — Book 1 Title + Author",
      campaign_type: "sponsored_products",
      state: "enabled",
      daily_budget_cents: 2500,
      total_spend_cents: 76420,
      total_sales_cents: 304100,
      spend_7d_cents: 12100,
      sales_7d_cents: 56210,
      orders_7d: 28,
      acos_7d_pct: 21.53,
      last_synced_at: now,
    },
    {
      id: "preview-3",
      client_slug: slug,
      campaign_id: "SB-BRAND-1",
      campaign_name: "Sponsored Brands — Author Storefront",
      campaign_type: "sponsored_brands",
      state: "enabled",
      daily_budget_cents: 3000,
      total_spend_cents: 41200,
      total_sales_cents: 110900,
      spend_7d_cents: 9210,
      sales_7d_cents: 28400,
      orders_7d: 19,
      acos_7d_pct: 32.43,
      last_synced_at: now,
    },
  ];
  const decisions: { action: OptimizerAction; rationale: string }[] = [
    {
      action: "paused_keyword",
      rationale: `"epic fantasy series" — ACoS ${(targetAcos * 2.3).toFixed(0)}% across 47 clicks, no orders. Above 2× target.`,
    },
    {
      action: "bid_up_keyword",
      rationale: `"[author last name] book 1" — ACoS ${(targetAcos * 0.4).toFixed(0)}%, 8 orders/30d. Bidding up 25% to capture more impression share.`,
    },
    {
      action: "added_negative",
      rationale: `Added "free download" + "free books" as campaign negatives — auto campaign was burning $0.45/click on those with 0 orders.`,
    },
  ];
  return { campaigns, decisions };
}

export function formatAcos(pct: number | null): string {
  if (pct === null) return "—";
  return `${pct.toFixed(1)}%`;
}

export function formatMoney(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: cents >= 10000 ? 0 : 2,
  }).format(cents / 100);
}
