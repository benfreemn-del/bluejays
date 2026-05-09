/**
 * ad-roas-sync.ts — nightly hydration of real ROAS / spend data from
 * Meta Marketing API + Google Ads Reporting API into the
 * client_ad_creatives table.
 *
 * Activates the moment Ben provisions the OAuth apps + sets the env
 * vars (GOOGLE_ADS_CLIENT_ID / GOOGLE_ADS_CLIENT_SECRET /
 * GOOGLE_ADS_DEVELOPER_TOKEN / META_ADS_APP_ID / META_ADS_APP_SECRET).
 * Until then the cron runs and silently no-ops on accounts that have
 * `status != "active"` or where token refresh fails — the iteration
 * engine continues on mock data.
 *
 * Token refresh pattern:
 *   · Refresh token decrypted via pgp_sym from client_ad_accounts
 *   · Exchanged for short-lived access token (in-memory, no storage)
 *   · Used for the day's API calls then discarded
 *
 * Sync pattern:
 *   · Pull yesterday's window (one day at a time = manageable response
 *     size + clear last_synced_at semantics)
 *   · Match by external_id when present, fallback to UTM
 *     content/variant_label when no external_id is set
 *   · Upsert spend_cents / impressions / clicks / conversions /
 *     last_synced_at on the matching client_ad_creatives row
 *
 * Failure handling:
 *   · 401 from platform → mark account `expired`, increment
 *     consecutive_failures, surface via agent_signals
 *   · 429 → log and back off (next run will retry)
 *   · No matching creative row → log warning, skip (operator must map
 *     external_id manually for new creatives shipped without UTM
 *     metadata)
 */

import { supabase, isSupabaseConfigured } from "./supabase";
import { getRefreshToken } from "./ad-oauth";

const GOOGLE_DEV_TOKEN = process.env.GOOGLE_ADS_DEVELOPER_TOKEN || "";

export type AdRoasSyncResult = {
  platform: "google_ads" | "meta_ads";
  clientSlug: string;
  externalAccountId: string;
  ok: boolean;
  rowsTouched: number;
  unmatchedRows: number;
  error?: string;
};

/* ─────────── TOKEN REFRESH ─────────── */

async function refreshGoogleAccessToken(
  refreshToken: string,
): Promise<{ ok: true; accessToken: string } | { ok: false; error: string }> {
  if (
    !process.env.GOOGLE_ADS_CLIENT_ID ||
    !process.env.GOOGLE_ADS_CLIENT_SECRET
  ) {
    return { ok: false, error: "GOOGLE_ADS_CLIENT_ID or _SECRET not set" };
  }
  try {
    const r = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_ADS_CLIENT_ID,
        client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    });
    const j = (await r.json()) as { access_token?: string; error?: string };
    if (!j.access_token) {
      return {
        ok: false,
        error: `Google refresh failed: ${j.error || "no access_token"}`,
      };
    }
    return { ok: true, accessToken: j.access_token };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

async function refreshMetaAccessToken(
  longLivedToken: string,
): Promise<{ ok: true; accessToken: string } | { ok: false; error: string }> {
  // Meta long-lived tokens last ~60 days. We re-extend at sync time
  // to keep the window rolling. If the token is expired the extend
  // call returns 400 and the account gets marked expired downstream.
  if (!process.env.META_ADS_APP_ID || !process.env.META_ADS_APP_SECRET) {
    return { ok: false, error: "META_ADS_APP_ID or _SECRET not set" };
  }
  try {
    const url = `https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${process.env.META_ADS_APP_ID}&client_secret=${process.env.META_ADS_APP_SECRET}&fb_exchange_token=${longLivedToken}`;
    const r = await fetch(url);
    const j = (await r.json()) as {
      access_token?: string;
      error?: { message?: string };
    };
    if (!j.access_token) {
      return {
        ok: false,
        error: `Meta extend failed: ${j.error?.message || "no access_token"}`,
      };
    }
    return { ok: true, accessToken: j.access_token };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

/* ─────────── METRICS FETCH (per platform) ─────────── */

type CreativeMetrics = {
  externalId: string;
  variantLabel?: string;
  spendUsd: number;
  impressions: number;
  clicks: number;
  conversions: number;
};

async function fetchGoogleMetrics(
  accessToken: string,
  customerId: string,
): Promise<CreativeMetrics[]> {
  // GAQL — pull yesterday's spend + impressions + clicks + conversions
  // grouped by ad. customer-id was stripped to digits during OAuth
  // callback. Developer token + login-customer-id are required for
  // managed-account access.
  const query = `
    SELECT
      ad_group_ad.ad.id,
      ad_group_ad.ad.name,
      metrics.cost_micros,
      metrics.impressions,
      metrics.clicks,
      metrics.conversions
    FROM ad_group_ad
    WHERE segments.date DURING YESTERDAY
  `.trim();

  const r = await fetch(
    `https://googleads.googleapis.com/v17/customers/${customerId.replace(/-/g, "")}/googleAds:search`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "developer-token": GOOGLE_DEV_TOKEN,
        "login-customer-id": customerId.replace(/-/g, ""),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    },
  );
  if (r.status === 401) throw new Error("UNAUTHORIZED");
  if (r.status === 429) throw new Error("RATE_LIMITED");
  if (!r.ok) {
    const txt = await r.text();
    throw new Error(`Google Ads API ${r.status}: ${txt.slice(0, 200)}`);
  }
  const j = (await r.json()) as {
    results?: Array<{
      adGroupAd?: { ad?: { id?: string; name?: string } };
      metrics?: {
        costMicros?: string;
        impressions?: string;
        clicks?: string;
        conversions?: number;
      };
    }>;
  };
  return (j.results ?? []).map((row) => ({
    externalId: row.adGroupAd?.ad?.id || "",
    variantLabel: row.adGroupAd?.ad?.name,
    // cost_micros = millionths of a dollar. Convert to USD.
    spendUsd: parseInt(row.metrics?.costMicros || "0", 10) / 1_000_000,
    impressions: parseInt(row.metrics?.impressions || "0", 10),
    clicks: parseInt(row.metrics?.clicks || "0", 10),
    conversions: row.metrics?.conversions ?? 0,
  }));
}

async function fetchMetaMetrics(
  accessToken: string,
  adAccountId: string,
): Promise<CreativeMetrics[]> {
  // Meta Marketing API — yesterday's insights at the ad level. The
  // ad_account_id arrived from OAuth without the act_ prefix; add it
  // here for the API path.
  const acctPath = adAccountId.startsWith("act_")
    ? adAccountId
    : `act_${adAccountId}`;
  const url = `https://graph.facebook.com/v18.0/${acctPath}/insights?level=ad&date_preset=yesterday&fields=ad_id,ad_name,spend,impressions,clicks,actions&access_token=${accessToken}&limit=500`;
  const r = await fetch(url);
  if (r.status === 401) throw new Error("UNAUTHORIZED");
  if (r.status === 429) throw new Error("RATE_LIMITED");
  if (!r.ok) {
    const txt = await r.text();
    throw new Error(`Meta API ${r.status}: ${txt.slice(0, 200)}`);
  }
  const j = (await r.json()) as {
    data?: Array<{
      ad_id?: string;
      ad_name?: string;
      spend?: string;
      impressions?: string;
      clicks?: string;
      actions?: Array<{ action_type?: string; value?: string }>;
    }>;
  };
  return (j.data ?? []).map((row) => {
    // Sum any "purchase" / "lead" / "complete_registration" action
    // counts. Conversions = whatever the operator's pixel events fire.
    const conversions = (row.actions ?? [])
      .filter((a) => /purchase|lead|complete_registration/i.test(a.action_type || ""))
      .reduce((s, a) => s + parseFloat(a.value || "0"), 0);
    return {
      externalId: row.ad_id || "",
      variantLabel: row.ad_name,
      spendUsd: parseFloat(row.spend || "0"),
      impressions: parseInt(row.impressions || "0", 10),
      clicks: parseInt(row.clicks || "0", 10),
      conversions,
    };
  });
}

/* ─────────── DB WRITEBACK ─────────── */

async function writeMetricsToCreatives(
  clientSlug: string,
  metrics: CreativeMetrics[],
): Promise<{ touched: number; unmatched: number }> {
  if (!isSupabaseConfigured() || metrics.length === 0)
    return { touched: 0, unmatched: 0 };
  let touched = 0;
  let unmatched = 0;
  for (const m of metrics) {
    // Match priority: external_id (set by a prior sync) > variant_label
    // (UTM-mapped during seed). External_id is the real source of truth
    // once a creative has been pushed to the platform.
    let matchedId: string | null = null;
    if (m.externalId) {
      const { data } = await supabase
        .from("client_ad_creatives")
        .select("id")
        .eq("client_slug", clientSlug)
        .eq("external_id", m.externalId)
        .maybeSingle();
      matchedId = data?.id ?? null;
    }
    if (!matchedId && m.variantLabel) {
      const { data } = await supabase
        .from("client_ad_creatives")
        .select("id")
        .eq("client_slug", clientSlug)
        .eq("variant_label", m.variantLabel)
        .maybeSingle();
      if (data?.id) {
        matchedId = data.id;
        // Stamp the external_id so future syncs match faster
        await supabase
          .from("client_ad_creatives")
          .update({ external_id: m.externalId })
          .eq("id", data.id);
      }
    }
    if (!matchedId) {
      unmatched += 1;
      continue;
    }
    const { error } = await supabase
      .from("client_ad_creatives")
      .update({
        impressions: m.impressions,
        clicks: m.clicks,
        conversions: Math.round(m.conversions),
        spend_cents: Math.round(m.spendUsd * 100),
        last_synced_at: new Date().toISOString(),
      })
      .eq("id", matchedId);
    if (!error) touched += 1;
  }
  return { touched, unmatched };
}

/* ─────────── ACCOUNT-FAILURE HANDLING ─────────── */

async function markAccountFailed(
  clientSlug: string,
  platform: "google_ads" | "meta_ads",
  error: string,
  isAuth: boolean,
): Promise<void> {
  if (!isSupabaseConfigured()) return;
  // Read current consecutive_failures, then increment
  const { data } = await supabase
    .from("client_ad_accounts")
    .select("consecutive_failures")
    .eq("client_slug", clientSlug)
    .eq("platform", platform)
    .maybeSingle();
  const next = (data?.consecutive_failures ?? 0) + 1;
  await supabase
    .from("client_ad_accounts")
    .update({
      status: isAuth || next >= 3 ? "expired" : "failed",
      consecutive_failures: next,
      last_error: error.slice(0, 500),
    })
    .eq("client_slug", clientSlug)
    .eq("platform", platform);
}

async function markAccountSucceeded(
  clientSlug: string,
  platform: "google_ads" | "meta_ads",
): Promise<void> {
  if (!isSupabaseConfigured()) return;
  await supabase
    .from("client_ad_accounts")
    .update({
      consecutive_failures: 0,
      last_error: null,
      last_used_at: new Date().toISOString(),
    })
    .eq("client_slug", clientSlug)
    .eq("platform", platform);
}

/* ─────────── PUBLIC API ─────────── */

/**
 * Sync ROAS data for a single (slug, platform) pair. Returns a
 * structured result the cron loop can roll up.
 */
export async function syncAdRoasForAccount(
  clientSlug: string,
  platform: "google_ads" | "meta_ads",
  externalAccountId: string,
): Promise<AdRoasSyncResult> {
  const result: AdRoasSyncResult = {
    platform,
    clientSlug,
    externalAccountId,
    ok: false,
    rowsTouched: 0,
    unmatchedRows: 0,
  };
  try {
    const refreshToken = await getRefreshToken(clientSlug, platform);
    if (!refreshToken) {
      result.error = "no refresh token (account not connected)";
      return result;
    }
    const tokenRes =
      platform === "google_ads"
        ? await refreshGoogleAccessToken(refreshToken)
        : await refreshMetaAccessToken(refreshToken);
    if (!tokenRes.ok) {
      result.error = tokenRes.error;
      await markAccountFailed(clientSlug, platform, tokenRes.error, true);
      return result;
    }
    const metrics =
      platform === "google_ads"
        ? await fetchGoogleMetrics(tokenRes.accessToken, externalAccountId)
        : await fetchMetaMetrics(tokenRes.accessToken, externalAccountId);

    const { touched, unmatched } = await writeMetricsToCreatives(
      clientSlug,
      metrics,
    );
    result.rowsTouched = touched;
    result.unmatchedRows = unmatched;
    result.ok = true;
    await markAccountSucceeded(clientSlug, platform);
    return result;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    result.error = msg;
    const isAuth = msg === "UNAUTHORIZED";
    await markAccountFailed(clientSlug, platform, msg, isAuth);
    return result;
  }
}

/**
 * Sync ROAS data across every active connected ad account in the
 * system. Used by the nightly cron. Returns a per-account result
 * array so the cron can log + emit signals.
 */
export async function syncAllAdRoas(): Promise<AdRoasSyncResult[]> {
  if (!isSupabaseConfigured()) return [];
  const { data } = await supabase
    .from("client_ad_accounts")
    .select("client_slug, platform, external_account_id")
    .eq("status", "active")
    .in("platform", ["google_ads", "meta_ads"]);
  const results: AdRoasSyncResult[] = [];
  for (const row of data ?? []) {
    const r = await syncAdRoasForAccount(
      row.client_slug,
      row.platform as "google_ads" | "meta_ads",
      row.external_account_id,
    );
    results.push(r);
  }
  return results;
}
