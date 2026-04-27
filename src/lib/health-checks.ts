/**
 * Vendor health checks (Hormozi review item #4).
 *
 * Pings every external dependency we rely on and returns per-vendor
 * status. The watchdog cron calls this daily and SMSes Ben on
 * persistent failures so we hear about vendor outages within hours
 * instead of weeks.
 *
 * Each check:
 *  - MUST be cheap (free or sub-cent) and idempotent
 *  - MUST handle missing env vars gracefully (returns 'skipped', not 'fail')
 *  - MUST timeout fast (5s max) so a slow vendor doesn't stall the cron
 *
 * Vendors monitored:
 *   - supabase, stripe, sendgrid, anthropic, openai, twilio,
 *     lob, namecheap, meta_ads, google_ads
 *
 * Mock-mode safe: vendors with no credentials are skipped silently.
 */

import { isSupabaseConfigured, supabase } from "./supabase";
import { isMetaAdsConfigured, getMetaAdsClient } from "./meta-ads-client";
import { isGoogleAdsConfigured, getGoogleAdsClient } from "./google-ads-client";

export type VendorStatus = "ok" | "fail" | "skipped";

export interface VendorCheck {
  vendor: string;
  status: VendorStatus;
  /** Round-trip latency in ms, when status='ok' */
  latencyMs?: number;
  /** Reason for skip ('no_credentials') or fail (HTTP / error message) */
  detail?: string;
}

const TIMEOUT_MS = 5000;

/**
 * Wrap a promise with a timeout. Resolves to the original result OR
 * rejects with a 'timeout' error after timeoutMs.
 */
function withTimeout<T>(p: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`timeout after ${timeoutMs}ms`)), timeoutMs),
    ),
  ]);
}

async function timed(fn: () => Promise<void>): Promise<{ latencyMs: number; error?: string }> {
  const t0 = Date.now();
  try {
    await fn();
    return { latencyMs: Date.now() - t0 };
  } catch (err) {
    return {
      latencyMs: Date.now() - t0,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

// ─── Per-vendor checks ───────────────────────────────────────────

async function checkSupabase(): Promise<VendorCheck> {
  if (!isSupabaseConfigured()) {
    return { vendor: "supabase", status: "skipped", detail: "no_credentials" };
  }
  const r = await timed(async () => {
    // Supabase query builder is PromiseLike, not Promise — wrap so withTimeout's
    // Promise<T> signature is satisfied.
    await withTimeout(
      Promise.resolve(
        supabase.from("prospects").select("id", { count: "exact", head: true }).limit(1),
      ),
      TIMEOUT_MS,
    );
  });
  return r.error
    ? { vendor: "supabase", status: "fail", detail: r.error, latencyMs: r.latencyMs }
    : { vendor: "supabase", status: "ok", latencyMs: r.latencyMs };
}

async function checkStripe(): Promise<VendorCheck> {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) return { vendor: "stripe", status: "skipped", detail: "no_credentials" };

  const r = await timed(async () => {
    const res = await withTimeout(
      fetch("https://api.stripe.com/v1/balance", {
        headers: { Authorization: `Bearer ${key}` },
      }),
      TIMEOUT_MS,
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  });
  return r.error
    ? { vendor: "stripe", status: "fail", detail: r.error, latencyMs: r.latencyMs }
    : { vendor: "stripe", status: "ok", latencyMs: r.latencyMs };
}

async function checkSendGrid(): Promise<VendorCheck> {
  const key = process.env.SENDGRID_API_KEY?.trim();
  if (!key) return { vendor: "sendgrid", status: "skipped", detail: "no_credentials" };

  const r = await timed(async () => {
    const res = await withTimeout(
      fetch("https://api.sendgrid.com/v3/user/profile", {
        headers: { Authorization: `Bearer ${key}` },
      }),
      TIMEOUT_MS,
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  });
  return r.error
    ? { vendor: "sendgrid", status: "fail", detail: r.error, latencyMs: r.latencyMs }
    : { vendor: "sendgrid", status: "ok", latencyMs: r.latencyMs };
}

async function checkAnthropic(): Promise<VendorCheck> {
  const key = process.env.ANTHROPIC_API_KEY?.trim();
  if (!key) return { vendor: "anthropic", status: "skipped", detail: "no_credentials" };

  // Cheapest possible call: 1-token completion. Anthropic has no
  // dedicated /ping endpoint; the messages API requires a real
  // request. We use max_tokens=1 to minimize cost (~$0.00003).
  const r = await timed(async () => {
    const res = await withTimeout(
      fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": key,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 1,
          messages: [{ role: "user", content: "ping" }],
        }),
      }),
      TIMEOUT_MS,
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  });
  return r.error
    ? { vendor: "anthropic", status: "fail", detail: r.error, latencyMs: r.latencyMs }
    : { vendor: "anthropic", status: "ok", latencyMs: r.latencyMs };
}

async function checkOpenAI(): Promise<VendorCheck> {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) return { vendor: "openai", status: "skipped", detail: "no_credentials" };

  // GET /v1/models is auth-validated and free.
  const r = await timed(async () => {
    const res = await withTimeout(
      fetch("https://api.openai.com/v1/models", {
        headers: { Authorization: `Bearer ${key}` },
      }),
      TIMEOUT_MS,
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  });
  return r.error
    ? { vendor: "openai", status: "fail", detail: r.error, latencyMs: r.latencyMs }
    : { vendor: "openai", status: "ok", latencyMs: r.latencyMs };
}

async function checkTwilio(): Promise<VendorCheck> {
  const sid = process.env.TWILIO_ACCOUNT_SID?.trim();
  const token = process.env.TWILIO_AUTH_TOKEN?.trim();
  if (!sid || !token) {
    return { vendor: "twilio", status: "skipped", detail: "no_credentials" };
  }
  const auth = Buffer.from(`${sid}:${token}`).toString("base64");
  const r = await timed(async () => {
    const res = await withTimeout(
      fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}.json`, {
        headers: { Authorization: `Basic ${auth}` },
      }),
      TIMEOUT_MS,
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  });
  return r.error
    ? { vendor: "twilio", status: "fail", detail: r.error, latencyMs: r.latencyMs }
    : { vendor: "twilio", status: "ok", latencyMs: r.latencyMs };
}

async function checkLob(): Promise<VendorCheck> {
  const key = process.env.LOB_API_KEY?.trim();
  if (!key) return { vendor: "lob", status: "skipped", detail: "no_credentials" };

  const auth = Buffer.from(`${key}:`).toString("base64");
  const r = await timed(async () => {
    const res = await withTimeout(
      fetch("https://api.lob.com/v1/postcards?limit=1", {
        headers: { Authorization: `Basic ${auth}` },
      }),
      TIMEOUT_MS,
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  });
  return r.error
    ? { vendor: "lob", status: "fail", detail: r.error, latencyMs: r.latencyMs }
    : { vendor: "lob", status: "ok", latencyMs: r.latencyMs };
}

async function checkNamecheap(): Promise<VendorCheck> {
  const apiUser = process.env.NAMECHEAP_API_USER?.trim();
  const apiKey = process.env.NAMECHEAP_API_KEY?.trim();
  const username = process.env.NAMECHEAP_USERNAME?.trim();
  const clientIp = process.env.NAMECHEAP_CLIENT_IP?.trim();
  if (!apiUser || !apiKey || !username || !clientIp) {
    return { vendor: "namecheap", status: "skipped", detail: "no_credentials" };
  }
  const sandbox = process.env.NAMECHEAP_SANDBOX === "true";
  const base = sandbox
    ? "https://api.sandbox.namecheap.com/xml.response"
    : "https://api.namecheap.com/xml.response";
  const url = `${base}?ApiUser=${apiUser}&ApiKey=${apiKey}&UserName=${username}&Command=namecheap.users.getBalances&ClientIp=${clientIp}`;

  const r = await timed(async () => {
    const res = await withTimeout(fetch(url), TIMEOUT_MS);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const xml = await res.text();
    if (xml.includes('Status="ERROR"')) throw new Error("Namecheap API ERROR status");
  });
  return r.error
    ? { vendor: "namecheap", status: "fail", detail: r.error, latencyMs: r.latencyMs }
    : { vendor: "namecheap", status: "ok", latencyMs: r.latencyMs };
}

async function checkMetaAds(): Promise<VendorCheck> {
  if (!isMetaAdsConfigured()) {
    return { vendor: "meta_ads", status: "skipped", detail: "no_credentials" };
  }
  const r = await timed(async () => {
    await withTimeout(getMetaAdsClient().ping(), TIMEOUT_MS);
  });
  return r.error
    ? { vendor: "meta_ads", status: "fail", detail: r.error, latencyMs: r.latencyMs }
    : { vendor: "meta_ads", status: "ok", latencyMs: r.latencyMs };
}

async function checkGoogleAds(): Promise<VendorCheck> {
  if (!isGoogleAdsConfigured()) {
    return { vendor: "google_ads", status: "skipped", detail: "no_credentials" };
  }
  const r = await timed(async () => {
    await withTimeout(getGoogleAdsClient().ping(), TIMEOUT_MS);
  });
  return r.error
    ? { vendor: "google_ads", status: "fail", detail: r.error, latencyMs: r.latencyMs }
    : { vendor: "google_ads", status: "ok", latencyMs: r.latencyMs };
}

/**
 * Run all vendor health checks in parallel. Returns aggregate result.
 * Failures don't propagate — every check returns its own status row.
 */
export async function runAllHealthChecks(): Promise<{
  ranAt: string;
  durationMs: number;
  checks: VendorCheck[];
  okCount: number;
  failCount: number;
  skippedCount: number;
  allOk: boolean;
}> {
  const startedAt = Date.now();

  const checks = await Promise.all([
    checkSupabase(),
    checkStripe(),
    checkSendGrid(),
    checkAnthropic(),
    checkOpenAI(),
    checkTwilio(),
    checkLob(),
    checkNamecheap(),
    checkMetaAds(),
    checkGoogleAds(),
  ]);

  const okCount = checks.filter((c) => c.status === "ok").length;
  const failCount = checks.filter((c) => c.status === "fail").length;
  const skippedCount = checks.filter((c) => c.status === "skipped").length;

  return {
    ranAt: new Date().toISOString(),
    durationMs: Date.now() - startedAt,
    checks,
    okCount,
    failCount,
    skippedCount,
    allOk: failCount === 0,
  };
}
