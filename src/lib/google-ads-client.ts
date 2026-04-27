/**
 * Google Ads API client — provider-agnostic interface with real + mock
 * implementations. Mirrors meta-ads-client.ts for consistency.
 *
 * Auth model (per Q3A): OAuth 2.0 refresh-token flow + Developer Token.
 * One-time setup, then the refresh token is stored in env and silently
 * exchanged for short-lived access tokens on each call.
 *
 * To set up (one-time, ~30 min):
 *
 *   STEP 1 — Apply for Developer Token (24-72hr Google approval):
 *     1. Go to https://ads.google.com/aw/apicenter
 *     2. Click "Apply for Basic Access"
 *     3. Fill form: business name "BlueJays", use case
 *        "Internal automation tool for our own ad account"
 *     4. Wait for email approval. Copy the developer token.
 *
 *   STEP 2 — OAuth 2.0 client credentials:
 *     1. https://console.cloud.google.com → New Project "bluejays-hyperloop"
 *     2. APIs & Services → Library → enable "Google Ads API"
 *     3. APIs & Services → OAuth consent screen → External, fill basics
 *     4. Credentials → Create Credentials → OAuth client ID → Web app
 *     5. Authorized redirect URI: https://bluejayportfolio.com/oauth/google-ads/callback
 *        (or http://localhost:3000/... for dev)
 *     6. Copy client ID + client secret
 *
 *   STEP 3 — Get refresh token (one-time OAuth dance):
 *     1. Build URL:
 *        https://accounts.google.com/o/oauth2/v2/auth?
 *          client_id={CLIENT_ID}&
 *          redirect_uri={REDIRECT_URI}&
 *          response_type=code&
 *          scope=https://www.googleapis.com/auth/adwords&
 *          access_type=offline&
 *          prompt=consent
 *     2. Visit URL → log in → consent → Google redirects with ?code=...
 *     3. Exchange code for tokens via POST to
 *        https://oauth2.googleapis.com/token with grant_type=authorization_code
 *     4. Response includes refresh_token (the one we want — never expires
 *        unless the user revokes)
 *
 *   STEP 4 — Vercel env vars:
 *     GOOGLE_ADS_DEVELOPER_TOKEN=xxx          (from step 1)
 *     GOOGLE_ADS_CLIENT_ID=xxx.apps.googleusercontent.com  (from step 2)
 *     GOOGLE_ADS_CLIENT_SECRET=xxx             (from step 2)
 *     GOOGLE_ADS_REFRESH_TOKEN=1//xxx          (from step 3)
 *     GOOGLE_ADS_CUSTOMER_ID=4419153997        (your account ID, no dashes)
 *     GOOGLE_ADS_LOGIN_CUSTOMER_ID=xxx         (only needed if using a manager account)
 *
 * Mock mode: when any required env var is missing → mockGoogleAdsClient
 * returns deterministic responses. Same fallback semantics as the
 * meta + domain-registrar clients.
 *
 * Cost: free at our volume; logCost(service='google_ads') tracks calls.
 */

import { logCost } from "./cost-logger";

const GOOGLE_OAUTH_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_ADS_API_VERSION = "v18";
const GOOGLE_ADS_BASE_URL = "https://googleads.googleapis.com";

// ─── Types ─────────────────────────────────────────────────────────

export interface GoogleAdsInsights {
  adId: string;
  dateStart: string;
  dateEnd: string;
  impressions: number;
  clicks: number;
  /** "audit_lead" conversion (gtag fires on form submit) */
  leadConversions: number;
  /** "audit_preview_lead" conversion (gtag fires on preview-request) */
  previewConversions: number;
  /** Cost in account currency, converted to USD if non-USD */
  spendUsd: number;
}

export interface CreateGoogleAdParams {
  adGroupId: string;
  /** Internal Hyperloop variant_name for cross-reference */
  name: string;
  headlines: string[];   // 3 required, ≤30 chars each
  descriptions: string[]; // 2 required, ≤90 chars each
  finalUrl: string;
}

export interface CreateGoogleAdResult {
  adId: string;
  adGroupId: string;
  status: "ENABLED" | "PAUSED";
  createdAt: Date;
  raw?: unknown;
}

export interface UpdateGoogleAdGroupBudgetParams {
  /** Campaign ID (Google tracks budget at the campaign level) */
  campaignId: string;
  dailyBudgetUsd: number;
}

export type GoogleAdStatus = "ENABLED" | "PAUSED" | "REMOVED";

export interface GoogleAdsClient {
  getInsights(args: {
    adId: string;
    daysBack: number;
    granularity?: "daily" | "aggregate";
  }): Promise<GoogleAdsInsights[]>;

  createAd(params: CreateGoogleAdParams): Promise<CreateGoogleAdResult>;

  setAdStatus(adId: string, status: GoogleAdStatus): Promise<void>;

  updateCampaignBudget(params: UpdateGoogleAdGroupBudgetParams): Promise<void>;

  ping(): Promise<{ customerId: string; descriptiveName: string; currencyCode: string }>;
}

// ─── Real Google Ads client ───────────────────────────────────────

class RealGoogleAdsClient implements GoogleAdsClient {
  private readonly developerToken: string;
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly refreshToken: string;
  private readonly customerId: string;
  private readonly loginCustomerId?: string;
  // Cached access token to avoid hitting /token on every API call
  private accessToken: string | null = null;
  private accessTokenExpiresAt: number = 0;

  constructor(opts: {
    developerToken: string;
    clientId: string;
    clientSecret: string;
    refreshToken: string;
    customerId: string;
    loginCustomerId?: string;
  }) {
    this.developerToken = opts.developerToken;
    this.clientId = opts.clientId;
    this.clientSecret = opts.clientSecret;
    this.refreshToken = opts.refreshToken;
    this.customerId = opts.customerId.replace(/-/g, "");
    this.loginCustomerId = opts.loginCustomerId?.replace(/-/g, "");
  }

  private async getAccessToken(): Promise<string> {
    // Refresh if missing or within 5 minutes of expiry
    if (this.accessToken && Date.now() < this.accessTokenExpiresAt - 5 * 60 * 1000) {
      return this.accessToken;
    }

    const body = new URLSearchParams({
      client_id: this.clientId,
      client_secret: this.clientSecret,
      refresh_token: this.refreshToken,
      grant_type: "refresh_token",
    });

    const res = await fetch(GOOGLE_OAUTH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });
    if (!res.ok) {
      throw new GoogleAdsError(
        `OAuth refresh failed (HTTP ${res.status})`,
        await safeText(res),
      );
    }
    const json = await res.json();
    this.accessToken = String(json.access_token);
    this.accessTokenExpiresAt = Date.now() + (json.expires_in ?? 3600) * 1000;
    return this.accessToken;
  }

  private async authedFetch(
    path: string,
    init: RequestInit = {},
  ): Promise<Response> {
    const token = await this.getAccessToken();
    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      "developer-token": this.developerToken,
      "Content-Type": "application/json",
      ...((init.headers ?? {}) as Record<string, string>),
    };
    if (this.loginCustomerId) {
      headers["login-customer-id"] = this.loginCustomerId;
    }
    return fetch(`${GOOGLE_ADS_BASE_URL}${path}`, { ...init, headers });
  }

  async ping(): Promise<{
    customerId: string;
    descriptiveName: string;
    currencyCode: string;
  }> {
    // GAQL query against customer table for our own info
    const query = `SELECT customer.id, customer.descriptive_name, customer.currency_code FROM customer LIMIT 1`;
    const res = await this.authedFetch(
      `/${GOOGLE_ADS_API_VERSION}/customers/${this.customerId}/googleAds:search`,
      {
        method: "POST",
        body: JSON.stringify({ query }),
      },
    );
    if (!res.ok) {
      throw new GoogleAdsError(
        `ping failed (HTTP ${res.status})`,
        await safeText(res),
      );
    }
    const json = await res.json();
    const row = (json.results?.[0]?.customer ?? {}) as Record<string, unknown>;
    await logCost({ service: "google_ads", action: "ping", costUsd: 0 }).catch(() => {});
    return {
      customerId: String(row.id ?? this.customerId),
      descriptiveName: String(row.descriptiveName ?? ""),
      currencyCode: String(row.currencyCode ?? "USD"),
    };
  }

  async getInsights(args: {
    adId: string;
    daysBack: number;
    granularity?: "daily" | "aggregate";
  }): Promise<GoogleAdsInsights[]> {
    const today = new Date();
    const start = new Date(today);
    start.setDate(start.getDate() - args.daysBack);
    const dateStart = start.toISOString().slice(0, 10);
    const dateEnd = today.toISOString().slice(0, 10);

    const segmentationClause = args.granularity === "daily" ? ", segments.date" : "";

    const query = `
      SELECT
        ad_group_ad.ad.id,
        metrics.impressions,
        metrics.clicks,
        metrics.cost_micros,
        metrics.conversions,
        metrics.conversions_by_conversion_date,
        segments.conversion_action_name${segmentationClause}
      FROM ad_group_ad
      WHERE ad_group_ad.ad.id = ${args.adId}
        AND segments.date BETWEEN '${dateStart}' AND '${dateEnd}'
    `.trim();

    const res = await this.authedFetch(
      `/${GOOGLE_ADS_API_VERSION}/customers/${this.customerId}/googleAds:search`,
      {
        method: "POST",
        body: JSON.stringify({ query }),
      },
    );
    if (!res.ok) {
      throw new GoogleAdsError(
        `getInsights failed for ad ${args.adId} (HTTP ${res.status})`,
        await safeText(res),
      );
    }
    const json = await res.json();
    const results: unknown[] = Array.isArray(json.results) ? json.results : [];

    await logCost({
      service: "google_ads",
      action: "getInsights",
      costUsd: 0,
      metadata: { adId: args.adId, daysBack: args.daysBack, rows: results.length },
    }).catch(() => {});

    // Aggregate by date + conversion type
    const byDate = new Map<string, { imp: number; clk: number; cost: number; lead: number; preview: number }>();
    const fallbackKey = `${dateStart}_${dateEnd}`;

    for (const row of results) {
      const r = row as Record<string, unknown>;
      const segments = (r.segments ?? {}) as Record<string, unknown>;
      const metrics = (r.metrics ?? {}) as Record<string, unknown>;
      const date = (segments.date as string) || fallbackKey;
      const convName = String(segments.conversionActionName ?? "");

      const bucket = byDate.get(date) ?? { imp: 0, clk: 0, cost: 0, lead: 0, preview: 0 };
      // Metrics fields can repeat across rows when segmented by
      // conversion_action_name — the same impression/click/spend gets
      // returned per conversion action. Take MAX rather than SUM for
      // those fields to avoid double-counting.
      bucket.imp = Math.max(bucket.imp, parseIntOr0(metrics.impressions));
      bucket.clk = Math.max(bucket.clk, parseIntOr0(metrics.clicks));
      bucket.cost = Math.max(bucket.cost, parseFloatOr0(metrics.costMicros) / 1_000_000);

      const convs = parseFloatOr0(metrics.conversions);
      if (convName === "audit_lead") bucket.lead += convs;
      else if (convName === "audit_preview_lead") bucket.preview += convs;

      byDate.set(date, bucket);
    }

    const dates = Array.from(byDate.keys()).sort();
    return dates.map((d) => {
      const b = byDate.get(d)!;
      const isAggregate = d === fallbackKey;
      return {
        adId: args.adId,
        dateStart: isAggregate ? dateStart : d,
        dateEnd: isAggregate ? dateEnd : d,
        impressions: b.imp,
        clicks: b.clk,
        leadConversions: Math.round(b.lead),
        previewConversions: Math.round(b.preview),
        spendUsd: Math.round(b.cost * 100) / 100,
      };
    });
  }

  async createAd(params: CreateGoogleAdParams): Promise<CreateGoogleAdResult> {
    // Google's create-ad payload: ad_group_ads:mutate with ResponsiveSearchAdInfo
    const operations = [
      {
        create: {
          ad_group: `customers/${this.customerId}/adGroups/${params.adGroupId}`,
          status: "ENABLED",
          ad: {
            final_urls: [params.finalUrl],
            responsive_search_ad: {
              headlines: params.headlines.map((text) => ({ text })),
              descriptions: params.descriptions.map((text) => ({ text })),
            },
          },
        },
      },
    ];

    const res = await this.authedFetch(
      `/${GOOGLE_ADS_API_VERSION}/customers/${this.customerId}/adGroupAds:mutate`,
      {
        method: "POST",
        body: JSON.stringify({ operations }),
      },
    );
    if (!res.ok) {
      throw new GoogleAdsError(
        `createAd failed (HTTP ${res.status})`,
        await safeText(res),
      );
    }
    const json = await res.json();
    const resourceName: string = json.results?.[0]?.resourceName ?? "";
    const adId = resourceName.split("~")[1] ?? resourceName;

    await logCost({
      service: "google_ads",
      action: "createAd",
      costUsd: 0,
      metadata: { adGroupId: params.adGroupId, name: params.name },
    }).catch(() => {});

    return {
      adId,
      adGroupId: params.adGroupId,
      status: "ENABLED",
      createdAt: new Date(),
      raw: json,
    };
  }

  async setAdStatus(adId: string, status: GoogleAdStatus): Promise<void> {
    // Need ad-group-ad resource name to update; format:
    //   customers/{customerId}/adGroupAds/{adGroupId}~{adId}
    // We don't always know the ad_group_id at retire time, so query
    // for it first.
    const lookup = await this.authedFetch(
      `/${GOOGLE_ADS_API_VERSION}/customers/${this.customerId}/googleAds:search`,
      {
        method: "POST",
        body: JSON.stringify({
          query: `SELECT ad_group_ad.resource_name FROM ad_group_ad WHERE ad_group_ad.ad.id = ${adId} LIMIT 1`,
        }),
      },
    );
    if (!lookup.ok) {
      throw new GoogleAdsError(
        `setAdStatus lookup failed for ad ${adId} (HTTP ${lookup.status})`,
        await safeText(lookup),
      );
    }
    const lookupJson = await lookup.json();
    const resourceName: string = lookupJson.results?.[0]?.adGroupAd?.resourceName ?? "";
    if (!resourceName) {
      throw new GoogleAdsError(`setAdStatus: ad ${adId} not found`, "");
    }

    const operations = [
      {
        update: {
          resource_name: resourceName,
          status,
        },
        update_mask: "status",
      },
    ];

    const res = await this.authedFetch(
      `/${GOOGLE_ADS_API_VERSION}/customers/${this.customerId}/adGroupAds:mutate`,
      {
        method: "POST",
        body: JSON.stringify({ operations }),
      },
    );
    if (!res.ok) {
      throw new GoogleAdsError(
        `setAdStatus failed for ad ${adId} (HTTP ${res.status})`,
        await safeText(res),
      );
    }
    await logCost({
      service: "google_ads",
      action: "setAdStatus",
      costUsd: 0,
      metadata: { adId, status },
    }).catch(() => {});
  }

  async updateCampaignBudget(params: UpdateGoogleAdGroupBudgetParams): Promise<void> {
    // Google budgets are a separate resource (CampaignBudget) tied to
    // a campaign. Requires looking up the budget resource first.
    const lookup = await this.authedFetch(
      `/${GOOGLE_ADS_API_VERSION}/customers/${this.customerId}/googleAds:search`,
      {
        method: "POST",
        body: JSON.stringify({
          query: `SELECT campaign.campaign_budget FROM campaign WHERE campaign.id = ${params.campaignId} LIMIT 1`,
        }),
      },
    );
    if (!lookup.ok) {
      throw new GoogleAdsError(
        `updateCampaignBudget lookup failed (HTTP ${lookup.status})`,
        await safeText(lookup),
      );
    }
    const lookupJson = await lookup.json();
    const budgetResourceName: string =
      lookupJson.results?.[0]?.campaign?.campaignBudget ?? "";
    if (!budgetResourceName) {
      throw new GoogleAdsError(
        `Budget resource not found for campaign ${params.campaignId}`,
        "",
      );
    }

    const micros = Math.round(params.dailyBudgetUsd * 1_000_000);
    const operations = [
      {
        update: {
          resource_name: budgetResourceName,
          amount_micros: String(micros),
        },
        update_mask: "amount_micros",
      },
    ];

    const res = await this.authedFetch(
      `/${GOOGLE_ADS_API_VERSION}/customers/${this.customerId}/campaignBudgets:mutate`,
      {
        method: "POST",
        body: JSON.stringify({ operations }),
      },
    );
    if (!res.ok) {
      throw new GoogleAdsError(
        `updateCampaignBudget failed (HTTP ${res.status})`,
        await safeText(res),
      );
    }
    await logCost({
      service: "google_ads",
      action: "updateCampaignBudget",
      costUsd: 0,
      metadata: { campaignId: params.campaignId, dailyBudgetUsd: params.dailyBudgetUsd },
    }).catch(() => {});
  }
}

// ─── Mock client ──────────────────────────────────────────────────

class MockGoogleAdsClient implements GoogleAdsClient {
  async ping() {
    return {
      customerId: "4419153997",
      descriptiveName: "BlueJays Mock Account",
      currencyCode: "USD",
    };
  }

  async getInsights(args: {
    adId: string;
    daysBack: number;
    granularity?: "daily" | "aggregate";
  }): Promise<GoogleAdsInsights[]> {
    const seed = hashString(args.adId);
    const today = new Date();

    if (args.granularity === "daily") {
      return Array.from({ length: args.daysBack }, (_, i) => {
        const day = new Date(today);
        day.setDate(day.getDate() - (args.daysBack - 1 - i));
        const date = day.toISOString().slice(0, 10);
        return mockInsightsRow(args.adId, date, date, seed + i);
      });
    }

    const start = new Date(today);
    start.setDate(start.getDate() - args.daysBack);
    return [
      mockInsightsRow(
        args.adId,
        start.toISOString().slice(0, 10),
        today.toISOString().slice(0, 10),
        seed,
      ),
    ];
  }

  async createAd(params: CreateGoogleAdParams): Promise<CreateGoogleAdResult> {
    return {
      adId: `mock_google_ad_${Date.now()}_${Math.floor(Math.random() * 1e6)}`,
      adGroupId: params.adGroupId,
      status: "ENABLED",
      createdAt: new Date(),
      raw: { mock: true, params },
    };
  }

  async setAdStatus(): Promise<void> {}
  async updateCampaignBudget(): Promise<void> {}
}

// ─── Errors + helpers ─────────────────────────────────────────────

export class GoogleAdsError extends Error {
  details?: string;
  constructor(message: string, details?: string) {
    super(message);
    this.name = "GoogleAdsError";
    this.details = details;
  }
}

async function safeText(res: Response): Promise<string> {
  try {
    return (await res.text()).slice(0, 500);
  } catch {
    return "";
  }
}

function parseIntOr0(v: unknown): number {
  if (v == null) return 0;
  const n = parseInt(String(v), 10);
  return Number.isFinite(n) ? n : 0;
}

function parseFloatOr0(v: unknown): number {
  if (v == null) return 0;
  const n = parseFloat(String(v));
  return Number.isFinite(n) ? n : 0;
}

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) & 0xffffffff;
  return Math.abs(h);
}

function mockInsightsRow(
  adId: string,
  start: string,
  end: string,
  seed: number,
): GoogleAdsInsights {
  // Search ads convert at slightly higher rates than Meta; tune mocks accordingly
  const impressions = 800 + (seed % 4000);
  const clicks = Math.floor(impressions * (0.04 + (seed % 30) / 1000));
  const leadConversions = Math.floor(clicks * (0.04 + (seed % 40) / 1000));
  const previewConversions = Math.floor(leadConversions * 0.25);
  const spendUsd = Math.round(clicks * (0.8 + (seed % 50) / 100) * 100) / 100;
  return {
    adId,
    dateStart: start,
    dateEnd: end,
    impressions,
    clicks,
    leadConversions,
    previewConversions,
    spendUsd,
  };
}

// ─── Factory ──────────────────────────────────────────────────────

let cachedClient: GoogleAdsClient | null = null;

export function getGoogleAdsClient(): GoogleAdsClient {
  if (cachedClient) return cachedClient;

  const developerToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN?.trim();
  const clientId = process.env.GOOGLE_ADS_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_ADS_CLIENT_SECRET?.trim();
  const refreshToken = process.env.GOOGLE_ADS_REFRESH_TOKEN?.trim();
  const customerId = process.env.GOOGLE_ADS_CUSTOMER_ID?.trim();
  const loginCustomerId = process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID?.trim();

  if (
    !developerToken ||
    !clientId ||
    !clientSecret ||
    !refreshToken ||
    !customerId
  ) {
    cachedClient = new MockGoogleAdsClient();
    return cachedClient;
  }

  cachedClient = new RealGoogleAdsClient({
    developerToken,
    clientId,
    clientSecret,
    refreshToken,
    customerId,
    loginCustomerId,
  });
  return cachedClient;
}

export function resetGoogleAdsClientCache(): void {
  cachedClient = null;
}

export function isGoogleAdsConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_ADS_DEVELOPER_TOKEN?.trim() &&
      process.env.GOOGLE_ADS_CLIENT_ID?.trim() &&
      process.env.GOOGLE_ADS_CLIENT_SECRET?.trim() &&
      process.env.GOOGLE_ADS_REFRESH_TOKEN?.trim() &&
      process.env.GOOGLE_ADS_CUSTOMER_ID?.trim(),
  );
}
