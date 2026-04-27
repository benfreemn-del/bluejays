/**
 * Hyperloop Stage 2 sync — pull insights from Meta + Google, write
 * daily rows into hyperloop_insights_daily, refresh the variant's
 * rolling-7-day aggregates in hyperloop_variants.
 *
 * Per Q5A this is built into the weekly Hyperloop cron's first step
 * (sync → analyze → generate). Also exposed as /api/hyperloop/sync for
 * the dashboard "Sync now" button + manual curl debugging.
 *
 * Per Q9A errors are partial-update OK: a single ad's API hiccup
 * doesn't roll back other ads' updates. Errors get logged + counted
 * but don't fail the whole sync.
 *
 * Mock-mode safe — when Meta/Google credentials are absent, the client
 * factories return mock implementations that produce deterministic
 * insights data per adId hash. Sync runs end-to-end without burning
 * real API calls.
 */

import { supabase, isSupabaseConfigured } from "./supabase";
import { getMetaAdsClient, isMetaAdsConfigured } from "./meta-ads-client";
import { getGoogleAdsClient, isGoogleAdsConfigured } from "./google-ads-client";

export interface SyncResult {
  /** Total variants we attempted to sync */
  attempted: number;
  /** Variants that actually got their metrics refreshed */
  synced: number;
  /** Variants that errored out (we keep going on partial failures per Q9A) */
  failed: number;
  /** Variants skipped because no platform_ad_id was set yet */
  skipped: number;
  /** How many daily rows we wrote across all platforms */
  dailyRowsWritten: number;
  /** Per-platform breakdown */
  byPlatform: {
    meta: { synced: number; failed: number; configured: boolean };
    google: { synced: number; failed: number; configured: boolean };
  };
  /** First few errors for debugging — capped to avoid log spam */
  errors: Array<{ variantId: string; platform: string; message: string }>;
}

const SYNC_DAYS_BACK = 7;

/**
 * Sync metrics for every variant with a platform_ad_id. Variants
 * without one (Ben hasn't pasted the ad ID yet, or it's an internal
 * variant kind like audit_prompt that doesn't live on a platform) are
 * silently skipped.
 */
export async function syncAllVariants(): Promise<SyncResult> {
  const result: SyncResult = {
    attempted: 0,
    synced: 0,
    failed: 0,
    skipped: 0,
    dailyRowsWritten: 0,
    byPlatform: {
      meta: { synced: 0, failed: 0, configured: isMetaAdsConfigured() },
      google: { synced: 0, failed: 0, configured: isGoogleAdsConfigured() },
    },
    errors: [],
  };

  if (!isSupabaseConfigured()) return result;

  // Pull every variant we might want to sync. We filter to active +
  // winner statuses — paused/loser/archived stay frozen at their last
  // metrics so the dashboard's history is preserved.
  const { data: rows, error } = await supabase
    .from("hyperloop_variants")
    .select("id, kind, variant_name, platform_ad_id, status")
    .in("status", ["active", "winner"]);

  if (error || !rows) {
    return result;
  }

  for (const row of rows) {
    result.attempted++;

    const variantId = row.id as string;
    const kind = row.kind as string;
    const adId = row.platform_ad_id as string | null;

    // Skip variants without a platform mapping (Ben hasn't pasted the
    // ad ID yet, OR the kind is internal — audit_prompt, sms_body_pitch,
    // etc., don't live on Meta/Google).
    if (!adId) {
      result.skipped++;
      continue;
    }

    // Determine which platform from the kind. Stage 2 only handles
    // ad_copy_meta + ad_copy_google; the other kinds map to internal
    // surfaces (email subjects, audit prompts) that don't have ad
    // metrics to sync.
    const platform: "meta" | "google" | null =
      kind === "ad_copy_meta"
        ? "meta"
        : kind === "ad_copy_google"
          ? "google"
          : null;

    if (!platform) {
      result.skipped++;
      continue;
    }

    try {
      const dailyRows =
        platform === "meta"
          ? await getMetaAdsClient().getInsights({
              adId,
              daysBack: SYNC_DAYS_BACK,
              granularity: "daily",
            })
          : await getGoogleAdsClient().getInsights({
              adId,
              daysBack: SYNC_DAYS_BACK,
              granularity: "daily",
            });

      // Upsert daily rows
      const upserts = dailyRows.map((d) => ({
        variant_id: variantId,
        platform,
        date: d.dateStart,
        impressions: d.impressions,
        clicks: d.clicks,
        lead_conversions: d.leadConversions,
        preview_conversions: d.previewConversions,
        spend_usd: d.spendUsd,
        synced_at: new Date().toISOString(),
      }));

      if (upserts.length > 0) {
        const { error: upsertErr } = await supabase
          .from("hyperloop_insights_daily")
          .upsert(upserts, { onConflict: "variant_id,platform,date" });

        if (upsertErr) {
          throw new Error(`upsert daily: ${upsertErr.message}`);
        }
        result.dailyRowsWritten += upserts.length;
      }

      // Refresh the variant's aggregate from the last-7-days daily rows.
      // Per Q6B + Q7B: lead conversions are the primary metric for
      // Bayesian analysis (clicks-to-lead is the funnel gate), preview
      // conversions are tracked separately for visibility but don't
      // count toward the "conversion" total used by the analyzer.
      const totals = upserts.reduce(
        (acc, d) => ({
          impressions: acc.impressions + d.impressions,
          clicks: acc.clicks + d.clicks,
          conversions: acc.conversions + d.lead_conversions,
          cost_usd: acc.cost_usd + d.spend_usd,
        }),
        { impressions: 0, clicks: 0, conversions: 0, cost_usd: 0 },
      );

      await supabase
        .from("hyperloop_variants")
        .update({
          impressions: totals.impressions,
          clicks: totals.clicks,
          conversions: totals.conversions,
          cost_usd: Math.round(totals.cost_usd * 100) / 100,
          last_metrics_synced_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", variantId);

      result.synced++;
      result.byPlatform[platform].synced++;
    } catch (err) {
      result.failed++;
      result.byPlatform[platform].failed++;
      const message = err instanceof Error ? err.message : String(err);
      // Cap error list at 20 to keep response payload sane
      if (result.errors.length < 20) {
        result.errors.push({ variantId, platform, message });
      }
      // Log to console too — operator might check Vercel logs
      console.error(
        `[hyperloop-sync] ${platform} ad ${adId} (variant ${variantId}) failed:`,
        message,
      );
    }
  }

  return result;
}
