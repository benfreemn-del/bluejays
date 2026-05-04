/**
 * client-tracking — per-client analytics & heatmap config.
 *
 * Part of the AI Package: every client gets an opt-in tracking stack
 * that includes:
 *   - Microsoft Clarity (heatmaps, session recordings, dead-clicks) — FREE
 *   - Meta Pixel (ad attribution, retargeting)
 *   - Google Analytics 4 (traffic, conversions)
 *   - Google Ads conversion tag
 *
 * Each is gated behind an env var — if the var is missing the script
 * doesn't render, so a client without Clarity simply gets no script.
 *
 * Env-var convention: CLIENT_<SLUG_UPPER>_<TOOL> where slug uppercase
 * has hyphens replaced with underscores. Examples:
 *   ZENITH_SPORTS_CLARITY_ID
 *   ZENITH_SPORTS_META_PIXEL_ID
 *   ZENITH_SPORTS_GA_MEASUREMENT_ID
 *
 * Why server-side env, not DB: Vercel injects envs at build time so
 * there's no runtime DB call to slow down the first paint, and rotating
 * a key is one Vercel UI flip away with no DB migration.
 */

export type TrackingConfig = {
  clarityId: string | null;
  metaPixelId: string | null;
  metaCapiToken: string | null;
  gaMeasurementId: string | null;
  googleAdsId: string | null;
};

const slugToEnv = (slug: string) =>
  slug.toUpperCase().replace(/-/g, "_");

export function getTrackingConfig(clientSlug: string): TrackingConfig {
  const prefix = slugToEnv(clientSlug);
  return {
    clarityId: process.env[`${prefix}_CLARITY_ID`] || null,
    metaPixelId: process.env[`${prefix}_META_PIXEL_ID`] || null,
    metaCapiToken: process.env[`${prefix}_META_CAPI_TOKEN`] || null,
    gaMeasurementId: process.env[`${prefix}_GA_MEASUREMENT_ID`] || null,
    googleAdsId: process.env[`${prefix}_GOOGLE_ADS_ID`] || null,
  };
}
