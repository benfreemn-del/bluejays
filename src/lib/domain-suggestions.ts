/**
 * Domain Suggestion Variants
 * --------------------------
 * Pure helpers that turn a business name into 6 candidate domain
 * variants ordered most-natural-first. Used by the onboarding flow
 * to auto-suggest domains the moment Step 1 loads (Q6A) — we check
 * availability for all 6 and surface the first 3 available (Q7C).
 *
 * NO API calls in this file. Just string transformation. The caller
 * (`/api/domain-suggestions/[id]`) does the registrar lookups.
 */

// Combining-diacritical-marks range (U+0300–U+036F). Hex escapes used
// instead of literal Unicode chars so the file survives re-encoding.
const DIACRITIC_RX = /[̀-ͯ]/g;

/** Lowercase + strip diacritics + remove non-alphanumeric. */
function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(DIACRITIC_RX, "")
    .replace(/[^a-z0-9]+/g, "");
}

/** Lowercase + strip diacritics + dashes between words. */
function dashed(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(DIACRITIC_RX, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Generate up to 6 unique domain candidates from a business name.
 * Ordered: literal slug first (highest preference), fallbacks after.
 *
 * Examples (input "Mountain View Landscaping"):
 *   1. mountainviewlandscaping.com   ← canonical
 *   2. getmountainviewlandscaping.com ← service-business common
 *   3. mountainviewlandscapingco.com  ← suffix
 *   4. mountainviewlandscaping.co     ← .co TLD
 *   5. mountain-view-landscaping.com  ← dashed (only multi-word)
 *   6. mountainviewlandscaping.net    ← .net fallback
 *
 * Single-word business names (e.g. "Hectorlandscaping") skip the
 * dashed variant since there's nothing to dash.
 */
export function generateDomainVariants(businessName: string): string[] {
  const slug = slugify(businessName);
  if (!slug) return [];

  const dash = dashed(businessName);
  const isMultiWord = dash !== slug && dash.includes("-");

  const candidates = [
    `${slug}.com`,
    `get${slug}.com`,
    `${slug}co.com`,
    `${slug}.co`,
    isMultiWord ? `${dash}.com` : null,
    `${slug}.net`,
  ].filter((v): v is string => Boolean(v));

  // Dedupe (e.g., 1-letter slug edge cases) while preserving order.
  return Array.from(new Set(candidates));
}
