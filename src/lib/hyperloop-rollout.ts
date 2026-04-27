/**
 * Hyperloop Stage 2 Commit C — auto-rollout.
 *
 * After the cron generates new variants via Claude, push them to the
 * platforms (Meta + Google) as live ads, then save the returned ad IDs
 * back into hyperloop_variants.platform_ad_id so the next sync (Commit
 * B) picks up performance data for them.
 *
 * Per Q3A this is fully automatic — no human-approval queue. The
 * kill-switch (Q10B) and weekly cost cap (Q6B) are the safety net.
 *
 * Mock-mode safe: when META_ADS_SYSTEM_TOKEN / GOOGLE_ADS_DEVELOPER_TOKEN
 * absent, the platform clients return mock ad IDs (mock_meta_ad_xxx /
 * mock_google_ad_xxx). Loop self-tests end-to-end without burning
 * real platform calls.
 *
 * Required env vars to roll out to live ad accounts:
 *   META_ADS_ADSET_ID         — Where new Meta ads land. Create one
 *                                Ad Set in your Campaign and copy the ID
 *                                from the Ads Manager URL.
 *   GOOGLE_ADS_ADGROUP_ID     — Where new Google ads land. Same — create
 *                                one Ad Group + copy the resource ID
 *                                (the numeric portion after "/adGroups/").
 *   HYPERLOOP_LANDING_URL     — Optional override for the destination
 *                                URL on every new ad. Defaults to
 *                                https://bluejayportfolio.com/audit.
 *
 * Without those env vars set, rollout SKIPS silently — variants land
 * in the DB without platform_ad_id, the next sync cycle skips them too.
 */

import { getMetaAdsClient, isMetaAdsConfigured } from "./meta-ads-client";
import { getGoogleAdsClient, isGoogleAdsConfigured } from "./google-ads-client";

export interface RolloutResult {
  /** Variant ID we tried to roll out */
  variantId: string;
  /** Variant kind (used to route to the right platform) */
  kind: string;
  /** True if we successfully created the ad on the platform */
  success: boolean;
  /** Platform ad ID returned by Meta/Google (only populated on success) */
  platformAdId?: string;
  /** Reason we skipped (no env vars, unsupported kind, etc.) */
  skipped?: "no_adset_id" | "no_adgroup_id" | "unsupported_kind" | "missing_content";
  /** Error message on failure */
  error?: string;
}

/** Default destination URL for ads — every BlueJays ad pushes prospects
 * to the audit landing page. UTM params get appended so we can track
 * platform-of-origin in the audit submit flow. */
function getLandingUrl(platform: "meta" | "google", variantName: string): string {
  const base = process.env.HYPERLOOP_LANDING_URL?.trim() || "https://bluejayportfolio.com/audit";
  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}utm_source=${platform}&utm_campaign=hyperloop&utm_content=${encodeURIComponent(variantName)}`;
}

/**
 * Roll out a single freshly-generated variant to its platform.
 * Returns RolloutResult with success/skip/error info — caller logs it
 * + stamps platform_ad_id on the variant when success.
 */
export async function rolloutVariant(args: {
  variantId: string;
  kind: string;
  variantName: string;
  content: Record<string, unknown>;
}): Promise<RolloutResult> {
  const { variantId, kind, variantName, content } = args;

  // Route by kind
  if (kind === "ad_copy_meta") {
    return rolloutToMeta({ variantId, variantName, content });
  }
  if (kind === "ad_copy_google") {
    return rolloutToGoogle({ variantId, variantName, content });
  }

  // Other kinds (audit_prompt, email_subject_*, sms_body_pitch,
  // cta_text_*) don't live on Meta/Google. Hyperloop just generates
  // them; Ben (or other parts of the system) plug them into their
  // respective surfaces. Skip silently.
  return { variantId, kind, success: false, skipped: "unsupported_kind" };
}

async function rolloutToMeta(args: {
  variantId: string;
  variantName: string;
  content: Record<string, unknown>;
}): Promise<RolloutResult> {
  const adSetId = process.env.META_ADS_ADSET_ID?.trim();

  // Mock mode: when Meta isn't configured AT ALL, the mock client still
  // returns a fake ad ID even without an ad set ID — useful for dev.
  // Live mode: we MUST have the ad set ID or the createAd call would
  // hit the real API with empty parent. Skip with a clear reason.
  if (isMetaAdsConfigured() && !adSetId) {
    return {
      variantId: args.variantId,
      kind: "ad_copy_meta",
      success: false,
      skipped: "no_adset_id",
    };
  }

  // Variant content shape: { headline, primaryText, cta }
  const headline = String(args.content.headline ?? "").trim();
  const primaryText = String(args.content.primaryText ?? "").trim();
  const cta = String(args.content.cta ?? "LEARN_MORE").trim();

  if (!headline || !primaryText) {
    return {
      variantId: args.variantId,
      kind: "ad_copy_meta",
      success: false,
      skipped: "missing_content",
    };
  }

  try {
    const result = await getMetaAdsClient().createAd({
      adSetId: adSetId || "mock_adset",
      name: args.variantName,
      headline,
      primaryText,
      cta,
      destinationUrl: getLandingUrl("meta", args.variantName),
    });
    return {
      variantId: args.variantId,
      kind: "ad_copy_meta",
      success: true,
      platformAdId: result.adId,
    };
  } catch (err) {
    return {
      variantId: args.variantId,
      kind: "ad_copy_meta",
      success: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

async function rolloutToGoogle(args: {
  variantId: string;
  variantName: string;
  content: Record<string, unknown>;
}): Promise<RolloutResult> {
  const adGroupId = process.env.GOOGLE_ADS_ADGROUP_ID?.trim();

  if (isGoogleAdsConfigured() && !adGroupId) {
    return {
      variantId: args.variantId,
      kind: "ad_copy_google",
      success: false,
      skipped: "no_adgroup_id",
    };
  }

  // Variant content shape: { headlines: [3], descriptions: [2] }
  const headlines = Array.isArray(args.content.headlines)
    ? (args.content.headlines as unknown[]).map((h) => String(h ?? "").trim()).filter(Boolean)
    : [];
  const descriptions = Array.isArray(args.content.descriptions)
    ? (args.content.descriptions as unknown[]).map((d) => String(d ?? "").trim()).filter(Boolean)
    : [];

  if (headlines.length < 3 || descriptions.length < 2) {
    return {
      variantId: args.variantId,
      kind: "ad_copy_google",
      success: false,
      skipped: "missing_content",
    };
  }

  try {
    const result = await getGoogleAdsClient().createAd({
      adGroupId: adGroupId || "mock_adgroup",
      name: args.variantName,
      // Google requires exactly 3-15 headlines and 2-4 descriptions.
      // We trim/cap to the minimum requirements that Hyperloop's
      // generator outputs (3 headlines + 2 descriptions per Q7B).
      headlines: headlines.slice(0, 15),
      descriptions: descriptions.slice(0, 4),
      finalUrl: getLandingUrl("google", args.variantName),
    });
    return {
      variantId: args.variantId,
      kind: "ad_copy_google",
      success: true,
      platformAdId: result.adId,
    };
  } catch (err) {
    return {
      variantId: args.variantId,
      kind: "ad_copy_google",
      success: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/** Roll out a batch of variants in parallel (capped concurrency).
 * Caller handles the platform_ad_id update — this function just
 * returns the rollout results. */
export async function rolloutBatch(
  variants: Array<{
    variantId: string;
    kind: string;
    variantName: string;
    content: Record<string, unknown>;
  }>,
): Promise<RolloutResult[]> {
  // Sequential to stay friendly with platform rate limits. If we ever
  // batch >20 at once, parallelize with a concurrency cap of ~3.
  const results: RolloutResult[] = [];
  for (const v of variants) {
    results.push(await rolloutVariant(v));
  }
  return results;
}

// ─────────────────────────────────────────────────────────────────
// Auto-pause (Stage 2 Commit D, per Q4A)
// When the Bayesian analyzer flips a variant to status='loser', we
// also pause the underlying ad on Meta/Google so it stops spending
// budget. Meta + Google's adset/campaign optimizers auto-rebalance
// the remaining spend across active ads — that's the implicit budget
// rebalancing per Q9A.
// ─────────────────────────────────────────────────────────────────

export interface PauseResult {
  variantId: string;
  kind: string;
  platformAdId: string;
  success: boolean;
  skipped?: "unsupported_kind" | "no_platform_ad_id";
  error?: string;
}

/** Pause a single variant on its platform. Routes by kind. */
export async function pauseVariantOnPlatform(args: {
  variantId: string;
  kind: string;
  platformAdId: string | null;
}): Promise<PauseResult> {
  const { variantId, kind, platformAdId } = args;

  if (!platformAdId) {
    return {
      variantId,
      kind,
      platformAdId: "",
      success: false,
      skipped: "no_platform_ad_id",
    };
  }

  if (kind === "ad_copy_meta") {
    try {
      await getMetaAdsClient().setAdStatus(platformAdId, "PAUSED");
      return { variantId, kind, platformAdId, success: true };
    } catch (err) {
      return {
        variantId,
        kind,
        platformAdId,
        success: false,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }

  if (kind === "ad_copy_google") {
    try {
      await getGoogleAdsClient().setAdStatus(platformAdId, "PAUSED");
      return { variantId, kind, platformAdId, success: true };
    } catch (err) {
      return {
        variantId,
        kind,
        platformAdId,
        success: false,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }

  // Internal kinds (audit_prompt, email_*, etc.) don't have platform
  // ads. The DB status flip is the only "pause" they need.
  return {
    variantId,
    kind,
    platformAdId,
    success: false,
    skipped: "unsupported_kind",
  };
}

/** Batch pause — caller decides which variants to pause. */
export async function pauseBatch(
  variants: Array<{ variantId: string; kind: string; platformAdId: string | null }>,
): Promise<PauseResult[]> {
  const results: PauseResult[] = [];
  for (const v of variants) {
    results.push(await pauseVariantOnPlatform(v));
  }
  return results;
}
