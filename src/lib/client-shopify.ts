/**
 * client-shopify — Shopify integration scaffold.
 *
 * Status: PROTOTYPE / SCAFFOLD. No live API calls yet — the functions
 * here all gracefully no-op until a row exists in client_shopify with
 * status='connected' and a valid access_token_encrypted.
 *
 * Activation flow (when client is ready to flip on Shopify):
 *   1. Owner clicks "Connect Shopify" in portal Account tab
 *   2. We redirect to Shopify OAuth using a Shopify Custom App we
 *      create per-client (or a single shared App with per-store grants)
 *   3. Shopify redirects back with an access_token; we encrypt + store
 *   4. updateClientShopifyConnection() flips status='connected'
 *   5. The cron in syncClientShopify() fans out hourly to refresh
 *      cached_metrics for every connected client
 *   6. Portal Insights tab swaps "Connect Shopify" placeholder for
 *      real revenue / AOV / top-product data
 *
 * Scopes we'll need for the AI Package use-case:
 *   read_orders          — revenue, AOV, refunds
 *   read_products        — inventory + best-sellers
 *   read_customers       — repeat-customer rate
 *   read_marketing_events — Shopify Email/Marketing attribution
 */

import { getSupabase } from "./supabase";

export type ShopifyStatus =
  | "pending"
  | "connected"
  | "reauth_required"
  | "disconnected"
  | "error";

export type ClientShopify = {
  id: string;
  client_slug: string;
  store_url: string;
  access_token_encrypted: string | null;
  scopes: string | null;
  status: ShopifyStatus;
  last_sync_at: string | null;
  last_sync_error: string | null;
  cached_metrics: ShopifyMetrics;
  cached_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

/** Cached metrics surfaced in the portal Insights tab. */
export type ShopifyMetrics = {
  /** Revenue, USD cents, last 30 days. */
  revenue_30d_cents?: number;
  /** Revenue, USD cents, this week. */
  revenue_7d_cents?: number;
  /** Average order value, USD cents. */
  aov_cents?: number;
  /** Order count last 30 days. */
  orders_30d?: number;
  /** Order count this week. */
  orders_7d?: number;
  /** Refund count last 30 days. */
  refunds_30d?: number;
  /** Top product (by units sold last 30d). */
  top_product?: { name: string; units: number; revenue_cents: number };
  /** Repeat-customer rate (0-1). */
  repeat_rate?: number;
  /** Connected Shopify Email automations? */
  email_automations_count?: number;
};

/* ───────────── DB OPS ───────────── */

export async function getClientShopify(
  clientSlug: string,
): Promise<ClientShopify | null> {
  const { data, error } = await getSupabase()
    .from("client_shopify")
    .select("*")
    .eq("client_slug", clientSlug)
    .maybeSingle();
  if (error) throw new Error(`getClientShopify: ${error.message}`);
  return (data as ClientShopify | null) ?? null;
}

export async function isShopifyConnected(clientSlug: string): Promise<boolean> {
  const c = await getClientShopify(clientSlug);
  return c?.status === "connected" && !!c?.access_token_encrypted;
}

/**
 * Get cached metrics for the portal Insights tab. Returns an empty
 * object if not connected yet — the UI shows a "Connect Shopify" card
 * in that case.
 */
export async function getShopifyMetrics(
  clientSlug: string,
): Promise<{ connected: boolean; metrics: ShopifyMetrics; cached_at: string | null }> {
  const c = await getClientShopify(clientSlug);
  if (!c || c.status !== "connected") {
    return { connected: false, metrics: {}, cached_at: null };
  }
  return {
    connected: true,
    metrics: c.cached_metrics ?? {},
    cached_at: c.cached_at,
  };
}

/* ───────────── STUBBED FETCH (becomes real on activation) ───────────── */

/**
 * The cron-triggered sync. STUB — when the Shopify Admin API call is
 * wired in, this fetches /admin/api/2024-10/orders.json + /products.json,
 * computes the aggregates, and writes them back to cached_metrics.
 */
export async function syncClientShopify(clientSlug: string): Promise<void> {
  const c = await getClientShopify(clientSlug);
  if (!c || c.status !== "connected" || !c.access_token_encrypted) {
    return; // nothing to do
  }

  // TODO: real Shopify API call when we wire this on. For now, just
  // bump the cached_at so the dashboard shows a recent timestamp.
  // const orders = await fetch(`https://${c.store_url}/admin/api/2024-10/orders.json?status=any&limit=250`, {
  //   headers: { "X-Shopify-Access-Token": decrypt(c.access_token_encrypted) }
  // }).then(r => r.json());
  // const metrics = computeMetrics(orders);

  await getSupabase()
    .from("client_shopify")
    .update({
      last_sync_at: new Date().toISOString(),
      cached_at: new Date().toISOString(),
    })
    .eq("client_slug", clientSlug);
}

/**
 * Initial connection — called by the OAuth callback. For now this is a
 * placeholder so the portal "Connect Shopify" button has somewhere to
 * point. Real OAuth wiring is a separate sprint.
 */
export async function recordShopifyConnection(args: {
  clientSlug: string;
  storeUrl: string;
  accessToken: string;
  scopes: string;
}): Promise<void> {
  await getSupabase()
    .from("client_shopify")
    .upsert(
      {
        client_slug: args.clientSlug,
        store_url: args.storeUrl,
        access_token_encrypted: args.accessToken, // TODO: encrypt
        scopes: args.scopes,
        status: "connected",
      },
      { onConflict: "client_slug" },
    );
}
