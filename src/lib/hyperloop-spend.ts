/**
 * Hyperloop weekly ad-spend cap — Rule 63 systemic-gap fix.
 *
 * Closes the gap Agent A (2026-04-26 adversarial review) flagged: the
 * pre-fix $50/wk Anthropic credit cap protected the cheap input but
 * Meta + Google daily ad budgets were unbounded by Hyperloop. A
 * runaway variant rollout could have burned $100/day across both
 * platforms = $700+/wk before anyone noticed.
 *
 * Design (locked 2026-04-27 with Ben):
 *   - Cap: $200/wk default, env var `HYPERLOOP_WEEKLY_AD_SPEND_CAP_USD`
 *   - Window: rolling 7-day (always last 168 hours)
 *   - Source: Meta + Google APIs each Hyperloop tick (real-time)
 *   - Mock-mode: $0 spend (cap never breaches in dev/CI)
 *   - Bypass: env var `HYPERLOOP_BYPASS_SPEND_CAP=true`
 *   - Single combined cap (not split per-platform)
 *   - Recovery: rolling-window auto-resets so cap auto-unpauses
 *
 * Used by:
 *   - /api/hyperloop/run — entry-point circuit breaker (skip + alert if breached)
 *   - /api/hyperloop/spend-status — GET endpoint for the dashboard tile
 *   - /api/watchdog/run — daily double-check (Q11A safety net)
 */

import { getMetaAdsClient, isMetaAdsConfigured } from "./meta-ads-client";
import { getGoogleAdsClient, isGoogleAdsConfigured } from "./google-ads-client";

const DEFAULT_WEEKLY_CAP_USD = 200;
const SPEND_WINDOW_DAYS = 7;

export interface SpendStatus {
  /** Total spend across Meta + Google over the last 7 days, in USD */
  totalSpendUsd: number;
  /** Per-platform breakdown */
  metaSpendUsd: number;
  googleSpendUsd: number;
  /** Cap from env var (or default) */
  capUsd: number;
  /** Whether the cap has been exceeded */
  breached: boolean;
  /** Manual bypass active (HYPERLOOP_BYPASS_SPEND_CAP=true) */
  bypassActive: boolean;
  /** Where the data came from. 'mock' = no API creds (always returns $0).
   *  'live' = real platform APIs. 'partial' = one platform live, one mocked. */
  source: "live" | "mock" | "partial";
  /** Per-platform error if a fetch failed (failure of one platform doesn't
   *  block the other; we proceed with whatever data we got). */
  metaError?: string;
  googleError?: string;
}

/** Read the cap from env var with sane default + numeric validation. */
export function getWeeklyCapUsd(): number {
  const raw = process.env.HYPERLOOP_WEEKLY_AD_SPEND_CAP_USD;
  if (!raw) return DEFAULT_WEEKLY_CAP_USD;
  const parsed = Number.parseFloat(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) return DEFAULT_WEEKLY_CAP_USD;
  return parsed;
}

/** Whether the manual bypass env var is set. Truthy when value is exactly
 *  "true" (case-insensitive) — anything else is treated as not-set. */
export function isBypassActive(): boolean {
  return String(process.env.HYPERLOOP_BYPASS_SPEND_CAP || "").toLowerCase() === "true";
}

/**
 * Pull weekly platform spend across Meta + Google. Always succeeds — a
 * failed platform fetch returns $0 for that platform with the error
 * surfaced via metaError/googleError. Mock-mode returns all-zero.
 */
export async function getWeeklySpendStatus(): Promise<SpendStatus> {
  const capUsd = getWeeklyCapUsd();
  const bypassActive = isBypassActive();

  let metaSpendUsd = 0;
  let googleSpendUsd = 0;
  let metaError: string | undefined;
  let googleError: string | undefined;

  const metaLive = isMetaAdsConfigured();
  const googleLive = isGoogleAdsConfigured();

  // Run both platform calls in parallel — independent failures.
  const [metaResult, googleResult] = await Promise.allSettled([
    metaLive ? getMetaAdsClient().getAccountSpendUsd(SPEND_WINDOW_DAYS) : Promise.resolve(0),
    googleLive ? getGoogleAdsClient().getAccountSpendUsd(SPEND_WINDOW_DAYS) : Promise.resolve(0),
  ]);

  if (metaResult.status === "fulfilled") {
    metaSpendUsd = metaResult.value;
  } else {
    metaError = metaResult.reason instanceof Error ? metaResult.reason.message : String(metaResult.reason);
  }

  if (googleResult.status === "fulfilled") {
    googleSpendUsd = googleResult.value;
  } else {
    googleError = googleResult.reason instanceof Error ? googleResult.reason.message : String(googleResult.reason);
  }

  const totalSpendUsd = Math.round((metaSpendUsd + googleSpendUsd) * 100) / 100;
  const breached = !bypassActive && totalSpendUsd >= capUsd;

  let source: SpendStatus["source"];
  if (!metaLive && !googleLive) source = "mock";
  else if (metaLive && googleLive) source = "live";
  else source = "partial";

  return {
    totalSpendUsd,
    metaSpendUsd: Math.round(metaSpendUsd * 100) / 100,
    googleSpendUsd: Math.round(googleSpendUsd * 100) / 100,
    capUsd,
    breached,
    bypassActive,
    source,
    metaError,
    googleError,
  };
}
