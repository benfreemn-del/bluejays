/**
 * Attribution capture — survives navigation + sessions.
 *
 * Problem this fixes:
 *   The audit form (and every other lead form) used to read
 *   utm_source / utm_campaign from `window.location.search` AT SUBMIT
 *   TIME. That fails the moment a visitor:
 *     - lands on /audit?utm_source=google
 *     - clicks an internal link to /, /how-it-works, etc.
 *     - comes back and submits → the URL is now /audit (no params)
 *   We were storing UTMs on 0 / 1699 prospects since April. Useless.
 *
 *   Also: Google Ads auto-tagging adds `gclid` (not utm_*), Meta uses
 *   `fbclid`, Microsoft uses `msclkid`, TikTok uses `ttclid`. Most
 *   advertisers never manually tag UTMs — they rely on auto-tagging.
 *   Capturing only utm_* loses the bulk of paid traffic attribution.
 *
 * The fix:
 *   - On every page load, scan the URL for known attribution params
 *     (utm_*, gclid, fbclid, msclkid, ttclid) + capture document.referrer
 *   - Stash to localStorage with a 30-day TTL (matches Google Ads
 *     default conversion window)
 *   - First-touch wins by default — so if someone clicks a Google ad
 *     today, browses for a week, then submits the form via direct
 *     navigation, we still attribute correctly to Google.
 *   - Fresh URL params override the stored value (last-touch behavior
 *     within the same session, controlled via OVERWRITE_ON_FRESH_PARAMS)
 *
 * Usage:
 *   AttributionCapture component (in layout.tsx) calls captureFromUrl()
 *   on mount + every route change.
 *   Lead forms call getStoredAttribution() at submit time.
 */

const STORAGE_KEY = "bj_attribution_v1";
const TTL_DAYS = 30;
// First-touch wins (typical attribution model for cold-traffic lead gen).
// Set to true if you want last-click behavior.
const OVERWRITE_ON_FRESH_PARAMS = false;

const TRACKED_PARAMS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "gclid",      // Google Ads auto-tag
  "fbclid",     // Meta / Facebook
  "msclkid",    // Microsoft / Bing Ads
  "ttclid",     // TikTok Ads
  "li_fat_id",  // LinkedIn
] as const;

type TrackedParam = (typeof TRACKED_PARAMS)[number];

export type Attribution = Partial<Record<TrackedParam, string>> & {
  /** Where the visitor came from (document.referrer at first capture) */
  referrer?: string;
  /** Landing page on first capture */
  landingPath?: string;
  /** ISO timestamp of first capture */
  firstSeenAt?: string;
  /** ISO timestamp of latest update */
  updatedAt?: string;
};

/** Read stored attribution. Returns {} if missing or expired. */
export function getStoredAttribution(): Attribution {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Attribution;
    // Expire after TTL_DAYS
    if (parsed.firstSeenAt) {
      const ageMs = Date.now() - new Date(parsed.firstSeenAt).getTime();
      if (ageMs > TTL_DAYS * 86_400_000) {
        window.localStorage.removeItem(STORAGE_KEY);
        return {};
      }
    }
    return parsed;
  } catch {
    return {};
  }
}

/** Capture attribution from the current URL + referrer. Idempotent. */
export function captureFromUrl(): Attribution {
  if (typeof window === "undefined") return {};
  let fresh: Attribution = {};
  try {
    const params = new URLSearchParams(window.location.search);
    for (const key of TRACKED_PARAMS) {
      const v = params.get(key);
      if (v) (fresh as Record<string, string>)[key] = v;
    }
  } catch {
    return getStoredAttribution();
  }

  const stored = getStoredAttribution();
  const hasFresh = Object.keys(fresh).length > 0;
  const hasStored = Object.keys(stored).some((k) =>
    (TRACKED_PARAMS as readonly string[]).includes(k),
  );

  // Decision tree:
  //   no fresh, no stored → write a "direct" baseline so we have firstSeenAt
  //   no fresh, stored    → keep stored (do nothing)
  //   fresh, no stored    → write fresh as first-touch
  //   fresh, stored       → first-touch wins (default), unless OVERWRITE flag
  let next: Attribution;
  if (!hasFresh && hasStored) {
    return stored;
  } else if (hasFresh && !hasStored) {
    next = {
      ...fresh,
      referrer: safeReferrer(),
      landingPath: window.location.pathname,
      firstSeenAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  } else if (hasFresh && hasStored) {
    if (OVERWRITE_ON_FRESH_PARAMS) {
      next = {
        ...stored,
        ...fresh,
        updatedAt: new Date().toISOString(),
      };
    } else {
      // First-touch wins — keep stored attribution params, just bump updatedAt
      next = { ...stored, updatedAt: new Date().toISOString() };
    }
  } else if (!hasStored) {
    // No fresh, no stored — record a "direct" baseline so we have a
    // firstSeenAt timestamp on the lead even if no source can be inferred.
    next = {
      referrer: safeReferrer(),
      landingPath: window.location.pathname,
      firstSeenAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  } else {
    return stored;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // localStorage disabled (private mode) — return next anyway, callers
    // can still use it for the current submission
  }
  return next;
}

function safeReferrer(): string {
  try {
    const ref = document.referrer || "";
    // Strip our own domain — internal nav isn't a "source"
    if (ref.includes(window.location.hostname)) return "";
    return ref.slice(0, 500); // cap length to avoid bloat
  } catch {
    return "";
  }
}

/**
 * Flatten attribution → simple key/value record suitable for storing
 * in `prospects.scraped_data` JSONB. Drops empty values to keep the
 * blob clean.
 */
export function attributionToRecord(attr: Attribution): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(attr)) {
    if (typeof v === "string" && v.trim()) {
      out[k] = v.trim();
    }
  }
  return out;
}

/**
 * Convenience: capture + return as a flat record ready to send to the
 * server. Use this on form submit handlers.
 */
export function getAttributionForSubmit(): Record<string, string> {
  // Re-capture in case the user is on a fresh URL with new params
  const attr = captureFromUrl();
  return attributionToRecord(attr);
}
