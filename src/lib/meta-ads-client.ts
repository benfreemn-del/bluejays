/**
 * Meta Ads API client — provider-agnostic interface with real + mock
 * implementations. Same pattern as domain-registrar.ts.
 *
 * Auth model (per Q2A): System User Access Token from Business Manager.
 * Long-lived (60 days), no OAuth refresh dance, scoped to ads_read +
 * ads_management. Stored in env as META_ADS_SYSTEM_TOKEN.
 *
 * To get the token (one-time setup):
 *   1. https://business.facebook.com/settings/system-users
 *   2. Add a new system user named "BlueJays Hyperloop"
 *   3. Click "Generate New Token" → select your app + scopes:
 *      - ads_read           (insights pull, Stage 2)
 *      - ads_management     (ad create/pause/budget, Stage 3)
 *   4. Token expires in 60 days — set a calendar reminder to rotate
 *   5. Vercel env vars:
 *      META_ADS_SYSTEM_TOKEN=EAAxxxxx...
 *      META_ADS_ACCOUNT_ID=act_1234567890         (Q10A: single account)
 *      META_ADS_API_VERSION=v21.0                 (default fallback)
 *
 * Mock mode: when META_ADS_SYSTEM_TOKEN is absent → mockMetaAdsClient
 * returns deterministic responses so dev/CI flow without burning real
 * Meta API calls or requiring credentials. Same fallback semantics as
 * domain-registrar's mockClient.
 *
 * API version: v21.0 (released 2024-12, supported through 2026-12).
 * Bump META_ADS_API_VERSION env var when migrating; client always reads
 * from env so a deploy can pin to a specific version.
 *
 * Rate limits: Meta caps Ads API at ~200 calls/hour per app per
 * account. Hyperloop's weekly sync does ~1 call per active variant per
 * run — well below the cap at our scale, but the client wraps each
 * call in try/catch so a 429 doesn't crash the cron.
 *
 * Cost: every successful call logs $0 via logCost(service='meta_ads')
 * — Meta API is free at our volume; the cost-logger tracks call count
 * for budget visibility.
 */

import { logCost } from "./cost-logger";

const META_BASE_URL = "https://graph.facebook.com";
const DEFAULT_API_VERSION = "v21.0";

// ─── Types ─────────────────────────────────────────────────────────

export interface MetaInsights {
  /** Ad ID this row applies to */
  adId: string;
  /** Date range covered (YYYY-MM-DD) */
  dateStart: string;
  dateEnd: string;
  impressions: number;
  clicks: number;
  /** Custom-event conversions ('Lead' fires from /audit submit) */
  leadConversions: number;
  /** Audit preview-request conversions (from AuditCTAHub Get Preview button) */
  previewConversions: number;
  /** Cost in USD */
  spendUsd: number;
}

export interface CreateAdParams {
  /** Ad set ID this ad belongs to */
  adSetId: string;
  /** Internal name for the ad (Hyperloop uses variant_name) */
  name: string;
  /** Headline (≤30 chars) */
  headline: string;
  /** Primary text (≤90 chars) */
  primaryText: string;
  /** CTA — Meta enum: LEARN_MORE / GET_QUOTE / SIGN_UP / etc */
  cta: string;
  /** Landing page URL */
  destinationUrl: string;
  /** Image URL or hash (Meta uploads separately and returns a hash) */
  imageHash?: string;
  imageUrl?: string;
}

export interface CreateAdResult {
  adId: string;
  adSetId: string;
  status: "ACTIVE" | "PAUSED";
  createdAt: Date;
  raw?: unknown;
}

export interface UpdateBudgetParams {
  /** Ad set ID — Meta tracks budgets at the ad set level */
  adSetId: string;
  /** Daily budget in USD (Meta accepts cents → multiply ×100 internally) */
  dailyBudgetUsd: number;
}

export type MetaAdStatus = "ACTIVE" | "PAUSED" | "DELETED" | "ARCHIVED";

export interface MetaAdsClient {
  /** Pull last-N-days insights for one ad. Daily breakdown when
   * `granularity='daily'` (Q8C — both daily + aggregate). */
  getInsights(args: {
    adId: string;
    daysBack: number;
    granularity?: "daily" | "aggregate";
  }): Promise<MetaInsights[]>;

  /** Create a new ad inside an existing ad set */
  createAd(params: CreateAdParams): Promise<CreateAdResult>;

  /** Pause / unpause / archive an ad */
  setAdStatus(adId: string, status: MetaAdStatus): Promise<void>;

  /** Update the daily budget on an ad set */
  updateAdSetBudget(params: UpdateBudgetParams): Promise<void>;

  /** Health check — used by /api/hyperloop/sync to verify creds before
   * a cron run. Returns ad-account name + currency on success. */
  ping(): Promise<{ accountId: string; accountName: string; currency: string }>;

  /** Total ad-account spend in USD over the last N days. Account-wide,
   * not per-ad — so it includes ALL active campaigns on this Meta ad
   * account, not just Hyperloop-managed ones. Used by the Hyperloop
   * weekly ad-spend cap circuit breaker. */
  getAccountSpendUsd(daysBack: number): Promise<number>;
}

// ─── Real Meta Ads client ─────────────────────────────────────────

class RealMetaAdsClient implements MetaAdsClient {
  private readonly token: string;
  private readonly accountId: string;
  private readonly apiVersion: string;

  constructor(opts: { token: string; accountId: string; apiVersion?: string }) {
    this.token = opts.token;
    this.accountId = opts.accountId.startsWith("act_")
      ? opts.accountId
      : `act_${opts.accountId}`;
    this.apiVersion = opts.apiVersion || DEFAULT_API_VERSION;
  }

  private url(path: string, params?: Record<string, string>): string {
    const base = `${META_BASE_URL}/${this.apiVersion}${path}`;
    const sp = new URLSearchParams({
      access_token: this.token,
      ...(params || {}),
    });
    return `${base}?${sp.toString()}`;
  }

  async ping() {
    const url = this.url(`/${this.accountId}`, { fields: "name,currency,id" });
    const res = await fetch(url);
    if (!res.ok) {
      throw new MetaAdsError(
        `ping failed (HTTP ${res.status})`,
        await safeText(res),
      );
    }
    const json = await res.json();
    await logCost({ service: "meta_ads", action: "ping", costUsd: 0 }).catch(() => {});
    return {
      accountId: String(json.id ?? this.accountId),
      accountName: String(json.name ?? ""),
      currency: String(json.currency ?? "USD"),
    };
  }

  async getAccountSpendUsd(daysBack: number): Promise<number> {
    const today = new Date();
    const start = new Date(today);
    start.setDate(start.getDate() - daysBack);
    const dateStart = start.toISOString().slice(0, 10);
    const dateEnd = today.toISOString().slice(0, 10);

    const params: Record<string, string> = {
      fields: "spend",
      time_range: JSON.stringify({ since: dateStart, until: dateEnd }),
      level: "account",
    };

    const url = this.url(`/${this.accountId}/insights`, params);
    const res = await fetch(url);
    if (!res.ok) {
      throw new MetaAdsError(
        `getAccountSpendUsd failed (HTTP ${res.status})`,
        await safeText(res),
      );
    }
    const json = await res.json();
    await logCost({ service: "meta_ads", action: "getAccountSpend", costUsd: 0 }).catch(() => {});

    // Account-level insights returns one aggregate row when no time_increment
    // is set. Sum 'spend' across rows defensively in case Meta paginates.
    const data = (json.data || []) as Array<{ spend?: string | number }>;
    return data.reduce((sum, r) => sum + parseFloatOr0(r.spend), 0);
  }

  async getInsights(args: {
    adId: string;
    daysBack: number;
    granularity?: "daily" | "aggregate";
  }): Promise<MetaInsights[]> {
    const today = new Date();
    const start = new Date(today);
    start.setDate(start.getDate() - args.daysBack);
    const dateStart = start.toISOString().slice(0, 10);
    const dateEnd = today.toISOString().slice(0, 10);

    const params: Record<string, string> = {
      fields: "impressions,clicks,actions,spend,date_start,date_stop",
      time_range: JSON.stringify({ since: dateStart, until: dateEnd }),
    };
    if (args.granularity === "daily") {
      params.time_increment = "1";
    }

    const url = this.url(`/${args.adId}/insights`, params);
    const res = await fetch(url);
    if (!res.ok) {
      throw new MetaAdsError(
        `getInsights failed for ad ${args.adId} (HTTP ${res.status})`,
        await safeText(res),
      );
    }

    const json = await res.json();
    const data: unknown[] = Array.isArray(json.data) ? json.data : [];

    await logCost({
      service: "meta_ads",
      action: "getInsights",
      costUsd: 0,
      metadata: { adId: args.adId, daysBack: args.daysBack, rows: data.length },
    }).catch(() => {});

    return data.map((row): MetaInsights => {
      const r = row as Record<string, unknown>;
      const actions = Array.isArray(r.actions) ? (r.actions as Array<Record<string, unknown>>) : [];
      const leadActions = actions.find((a) => a.action_type === "lead");
      const previewActions = actions.find(
        (a) => a.action_type === "offsite_conversion.custom.audit_preview_request",
      );
      return {
        adId: args.adId,
        dateStart: String(r.date_start ?? dateStart),
        dateEnd: String(r.date_stop ?? dateEnd),
        impressions: parseIntOr0(r.impressions),
        clicks: parseIntOr0(r.clicks),
        leadConversions: parseIntOr0(leadActions?.value),
        previewConversions: parseIntOr0(previewActions?.value),
        spendUsd: parseFloatOr0(r.spend),
      };
    });
  }

  async createAd(params: CreateAdParams): Promise<CreateAdResult> {
    // POST /{ad-account-id}/ads — see Meta Marketing API docs
    const url = this.url(`/${this.accountId}/ads`);
    const creative = {
      name: `${params.name}-creative`,
      object_story_spec: {
        page_id: process.env.META_ADS_PAGE_ID,
        link_data: {
          message: params.primaryText,
          link: params.destinationUrl,
          name: params.headline,
          call_to_action: { type: params.cta },
          ...(params.imageHash ? { image_hash: params.imageHash } : {}),
        },
      },
    };
    const body = new URLSearchParams({
      name: params.name,
      adset_id: params.adSetId,
      creative: JSON.stringify(creative),
      status: "ACTIVE",
    });

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString() + `&access_token=${this.token}`,
    });
    if (!res.ok) {
      throw new MetaAdsError(
        `createAd failed (HTTP ${res.status})`,
        await safeText(res),
      );
    }
    const json = await res.json();
    await logCost({
      service: "meta_ads",
      action: "createAd",
      costUsd: 0,
      metadata: { adSetId: params.adSetId, name: params.name },
    }).catch(() => {});

    return {
      adId: String(json.id),
      adSetId: params.adSetId,
      status: "ACTIVE",
      createdAt: new Date(),
      raw: json,
    };
  }

  async setAdStatus(adId: string, status: MetaAdStatus): Promise<void> {
    const url = this.url(`/${adId}`);
    const body = new URLSearchParams({ status, access_token: this.token });
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });
    if (!res.ok) {
      throw new MetaAdsError(
        `setAdStatus failed for ad ${adId} (HTTP ${res.status})`,
        await safeText(res),
      );
    }
    await logCost({
      service: "meta_ads",
      action: "setAdStatus",
      costUsd: 0,
      metadata: { adId, status },
    }).catch(() => {});
  }

  async updateAdSetBudget(params: UpdateBudgetParams): Promise<void> {
    // Meta wants budget in cents (integer).
    const cents = Math.round(params.dailyBudgetUsd * 100);
    const url = this.url(`/${params.adSetId}`);
    const body = new URLSearchParams({
      daily_budget: String(cents),
      access_token: this.token,
    });
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });
    if (!res.ok) {
      throw new MetaAdsError(
        `updateAdSetBudget failed for ${params.adSetId} (HTTP ${res.status})`,
        await safeText(res),
      );
    }
    await logCost({
      service: "meta_ads",
      action: "updateAdSetBudget",
      costUsd: 0,
      metadata: { adSetId: params.adSetId, dailyBudgetUsd: params.dailyBudgetUsd },
    }).catch(() => {});
  }
}

// ─── Mock client ──────────────────────────────────────────────────

class MockMetaAdsClient implements MetaAdsClient {
  async ping() {
    return {
      accountId: "act_mock_123",
      accountName: "BlueJays Mock Account",
      currency: "USD",
    };
  }

  async getAccountSpendUsd(_daysBack: number): Promise<number> {
    // Mock-mode: $0 spend per Q6A locked design — cap never breaches in dev/CI.
    return 0;
  }

  async getInsights(args: {
    adId: string;
    daysBack: number;
    granularity?: "daily" | "aggregate";
  }): Promise<MetaInsights[]> {
    // Deterministic mock so tests are stable. Hash adId → pseudo-random
    // but consistent metrics for the same ad.
    const seed = hashString(args.adId);
    const today = new Date();

    if (args.granularity === "daily") {
      // Generate one row per day
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

  async createAd(params: CreateAdParams): Promise<CreateAdResult> {
    return {
      adId: `mock_meta_ad_${Date.now()}_${Math.floor(Math.random() * 1e6)}`,
      adSetId: params.adSetId,
      status: "ACTIVE",
      createdAt: new Date(),
      raw: { mock: true, params },
    };
  }

  async setAdStatus(): Promise<void> {
    // no-op
  }

  async updateAdSetBudget(): Promise<void> {
    // no-op
  }
}

// ─── Errors + helpers ─────────────────────────────────────────────

export class MetaAdsError extends Error {
  details?: string;
  constructor(message: string, details?: string) {
    super(message);
    this.name = "MetaAdsError";
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
): MetaInsights {
  // Deterministic fake metrics — realistic ranges for a $50/day SMB ad
  const impressions = 2000 + (seed % 8000);
  const clicks = Math.floor(impressions * (0.005 + (seed % 50) / 5000));
  const leadConversions = Math.floor(clicks * (0.02 + (seed % 30) / 1000));
  const previewConversions = Math.floor(leadConversions * 0.3);
  const spendUsd = Math.round(impressions * (0.005 + (seed % 20) / 5000) * 100) / 100;
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

let cachedClient: MetaAdsClient | null = null;

export function getMetaAdsClient(): MetaAdsClient {
  if (cachedClient) return cachedClient;

  const token = process.env.META_ADS_SYSTEM_TOKEN?.trim();
  const accountId = process.env.META_ADS_ACCOUNT_ID?.trim();
  const apiVersion = process.env.META_ADS_API_VERSION?.trim() || DEFAULT_API_VERSION;

  if (!token || !accountId) {
    cachedClient = new MockMetaAdsClient();
    return cachedClient;
  }

  cachedClient = new RealMetaAdsClient({ token, accountId, apiVersion });
  return cachedClient;
}

/** Test hook — reset the cached client (useful when env vars change in test) */
export function resetMetaAdsClientCache(): void {
  cachedClient = null;
}

/** Are we running with real credentials? Useful for the dashboard to
 * show a "Live" vs "Mock mode" badge. */
export function isMetaAdsConfigured(): boolean {
  return Boolean(
    process.env.META_ADS_SYSTEM_TOKEN?.trim() &&
      process.env.META_ADS_ACCOUNT_ID?.trim(),
  );
}
