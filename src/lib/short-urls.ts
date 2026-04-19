import type { Prospect } from "./types";
import crypto from "crypto";

/**
 * Short-URL system for customer-facing links.
 *
 * Every prospect gets a deterministic 8-character short_code derived from
 * md5(id). The code is stored on `prospects.short_code` (see migration
 * 20260419_prospect_short_codes.sql) and routed via `/p/[code]`.
 *
 * Why:
 *   - A full UUID like /preview/02b37937-2980-4101-929e-dfa8dd8aba13 is
 *     85+ chars, wraps weirdly in email clients, looks spammy, and is
 *     impossible to dictate over the phone.
 *   - /p/a1b2c3d4 is ~40 chars, fits on one line, looks trustworthy,
 *     matches modern brand-friendly short-link patterns.
 *
 * Deterministic hashing means the same prospect UUID always produces the
 * same short code, so existing outreach links never break.
 */

const BASE_URL = "https://bluejayportfolio.com";

/**
 * Derive the short_code for a given prospect UUID. Use this as a fallback
 * when `prospect.short_code` isn't populated yet (new prospect before the
 * DB column is backfilled). Matches the migration's md5-based generation
 * exactly.
 */
export function deriveShortCode(prospectId: string): string {
  return crypto.createHash("md5").update(prospectId).digest("hex").slice(0, 8);
}

/**
 * Canonical short preview URL for a prospect.
 *
 * Prefers the persisted short_code from Supabase when available. Falls
 * back to the deterministic md5 derivation so the URL still works if
 * short_code hasn't been populated (e.g. before the migration runs).
 *
 * **Always use this instead of constructing /preview/[id] URLs manually
 * when the URL will be sent to a prospect** (email, SMS, share, etc.).
 */
export function getShortPreviewUrl(prospect: Prospect): string {
  const code = prospect.short_code || deriveShortCode(prospect.id);
  return `${BASE_URL}/p/${code}`;
}

/**
 * Canonical short claim URL for a prospect. Same short code as the preview.
 * The /p/[code] route forwards to /preview/[id] which has the claim CTA on it;
 * if we ever need a direct-to-claim short URL we can add /c/[code].
 */
export function getShortClaimUrl(prospect: Prospect): string {
  const code = prospect.short_code || deriveShortCode(prospect.id);
  return `${BASE_URL}/c/${code}`;
}
