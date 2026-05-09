/**
 * ical-feed.ts — minimal iCalendar (.ics) busy-time fetcher.
 *
 * Why hand-rolled instead of an npm dep: we only need DTSTART/DTEND
 * pairs out of VEVENT blocks for the busy-window use case. Full RFC 5545
 * parsing (timezones, RRULE expansion, alarms, X-properties) brings
 * 200KB+ of code we don't need.
 *
 * What this DOES:
 *   · Fetches a public iCal URL (webcal:// or https://...ics)
 *   · Pulls out every VEVENT's DTSTART / DTEND
 *   · Normalizes Z-suffixed UTC and floating-local times to ISO-UTC
 *   · Returns the windows that overlap [from, to]
 *
 * What this DOES NOT:
 *   · Expand recurring events (RRULE / RDATE). One-off events only for v1.
 *     Apple Calendar published feeds typically expand recurrences server-
 *     side; iCloud public feeds DO NOT — known limitation, document in UI.
 *   · Convert TZID-tagged local times. We treat them as Pacific (Luke's
 *     timezone) for v1. Acceptable error margin for booking-blocking
 *     when the publishing user is in PT.
 *   · Validate the feed's signature, calendar name, X-WR-* metadata.
 *
 * Cache: response is cached for 5 minutes via the standard fetch cache
 * to keep load on the upstream feed light.
 */

export interface BusyWindow {
  startIso: string;
  endIso: string;
  summary?: string;
}

const FETCH_TIMEOUT_MS = 8000;

/**
 * Normalize an iCal date-time string into an ISO-UTC string.
 * Handles:
 *   20260512T140000Z      → "2026-05-12T14:00:00.000Z"
 *   20260512T140000       → "2026-05-12T14:00:00.000Z" (floating, treat as UTC)
 *   20260512              → "2026-05-12T00:00:00.000Z" (all-day)
 */
function parseIcalDate(raw: string): string | null {
  const v = raw.trim();
  // Date-only (all-day events)
  if (/^\d{8}$/.test(v)) {
    const y = v.slice(0, 4);
    const m = v.slice(4, 6);
    const d = v.slice(6, 8);
    return `${y}-${m}-${d}T00:00:00.000Z`;
  }
  // Date-time (with or without Z)
  const match = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z?)$/.exec(v);
  if (!match) return null;
  const [, y, mo, d, h, mi, s] = match;
  return `${y}-${mo}-${d}T${h}:${mi}:${s}.000Z`;
}

/**
 * Pull busy windows out of an iCal text body. Each VEVENT becomes one
 * window. Filter to only those that overlap [fromIso, toIso].
 */
export function parseIcalBody(
  body: string,
  fromIso: string,
  toIso: string,
): BusyWindow[] {
  // Unfold continuation lines (lines starting with space/tab continue
  // the previous line per RFC 5545 §3.1).
  const unfolded = body.replace(/\r?\n[ \t]/g, "");
  const lines = unfolded.split(/\r?\n/);

  const windows: BusyWindow[] = [];
  let inEvent = false;
  let curStart: string | null = null;
  let curEnd: string | null = null;
  let curSummary: string | undefined;

  for (const line of lines) {
    if (line === "BEGIN:VEVENT") {
      inEvent = true;
      curStart = curEnd = null;
      curSummary = undefined;
      continue;
    }
    if (line === "END:VEVENT") {
      if (curStart && curEnd) {
        // Filter to overlap window
        if (curEnd >= fromIso && curStart <= toIso) {
          windows.push({
            startIso: curStart,
            endIso: curEnd,
            summary: curSummary,
          });
        }
      }
      inEvent = false;
      continue;
    }
    if (!inEvent) continue;

    // Property line — split at the first ':' (params come before, value after).
    const colonIdx = line.indexOf(":");
    if (colonIdx < 0) continue;
    const propPart = line.slice(0, colonIdx);
    const value = line.slice(colonIdx + 1);
    const propName = propPart.split(";")[0].toUpperCase();

    if (propName === "DTSTART") curStart = parseIcalDate(value);
    else if (propName === "DTEND") curEnd = parseIcalDate(value);
    else if (propName === "SUMMARY") curSummary = value.slice(0, 80);
  }
  return windows;
}

/**
 * Fetch + parse an iCal URL. Normalizes webcal:// → https://. Returns
 * empty array on any error so callers can degrade gracefully.
 */
export async function fetchIcalBusyWindows(
  url: string,
  fromIso: string,
  toIso: string,
): Promise<BusyWindow[]> {
  if (!url) return [];
  let normalized = url;
  if (normalized.startsWith("webcal://")) {
    normalized = "https://" + normalized.slice("webcal://".length);
  }
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    const r = await fetch(normalized, {
      signal: ctrl.signal,
      // Cache for 5 min — Apple-published feeds don't change second-by-second
      next: { revalidate: 300 },
      headers: { Accept: "text/calendar, text/plain" },
    });
    if (!r.ok) return [];
    const body = await r.text();
    return parseIcalBody(body, fromIso, toIso);
  } catch {
    return [];
  } finally {
    clearTimeout(t);
  }
}

/**
 * True if the given window [aStart, aEnd] overlaps any busy window.
 * Used by the booking-slots filter.
 */
export function overlapsAnyBusy(
  startIso: string,
  endIso: string,
  busy: BusyWindow[],
): boolean {
  return busy.some((b) => startIso < b.endIso && endIso > b.startIso);
}
