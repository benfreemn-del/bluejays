/**
 * Best-effort business-hours intelligence for the partner workspace.
 *
 * Two layers:
 *   1. Time-zone-aware "current local time" at the prospect's state.
 *      Always reliable — uses Intl.DateTimeFormat with hardcoded
 *      state→timezone table.
 *   2. Optional hours parsing — if scraped_data.hours has Google Places
 *      style text ("Monday: 9:00 AM – 5:00 PM\n..."), we parse it and
 *      can give a definitive open/closed answer. Otherwise we fall back
 *      to a "likely open" heuristic (8am–7pm Mon–Sat).
 *
 * Honest labeling: the UI shows "Likely open" / "Likely closed" when
 * we're inferring from heuristic, and "Open now" / "Closed now" only
 * when we parsed actual hours.
 */

// US state code → IANA timezone. DC + territories included.
// Indiana / Kentucky / Tennessee straddle two zones — picked the
// most-populated zone for those.
const TZ_BY_STATE: Record<string, string> = {
  AL: "America/Chicago",
  AK: "America/Anchorage",
  AZ: "America/Phoenix",
  AR: "America/Chicago",
  CA: "America/Los_Angeles",
  CO: "America/Denver",
  CT: "America/New_York",
  DC: "America/New_York",
  DE: "America/New_York",
  FL: "America/New_York",
  GA: "America/New_York",
  HI: "Pacific/Honolulu",
  IA: "America/Chicago",
  ID: "America/Boise",
  IL: "America/Chicago",
  IN: "America/Indiana/Indianapolis",
  KS: "America/Chicago",
  KY: "America/New_York",
  LA: "America/Chicago",
  MA: "America/New_York",
  MD: "America/New_York",
  ME: "America/New_York",
  MI: "America/New_York",
  MN: "America/Chicago",
  MO: "America/Chicago",
  MS: "America/Chicago",
  MT: "America/Denver",
  NC: "America/New_York",
  ND: "America/Chicago",
  NE: "America/Chicago",
  NH: "America/New_York",
  NJ: "America/New_York",
  NM: "America/Denver",
  NV: "America/Los_Angeles",
  NY: "America/New_York",
  OH: "America/New_York",
  OK: "America/Chicago",
  OR: "America/Los_Angeles",
  PA: "America/New_York",
  RI: "America/New_York",
  SC: "America/New_York",
  SD: "America/Chicago",
  TN: "America/Chicago",
  TX: "America/Chicago",
  UT: "America/Denver",
  VA: "America/New_York",
  VT: "America/New_York",
  WA: "America/Los_Angeles",
  WI: "America/Chicago",
  WV: "America/New_York",
  WY: "America/Denver",
};

// IANA → spoken abbreviation (best-effort, ignores DST nuance —
// the displayed abbr is decorative, the actual time is computed
// correctly via Intl).
function tzAbbrFor(tz: string): string {
  if (tz.includes("Los_Angeles")) return "PT";
  if (tz.includes("Phoenix")) return "AZ";
  if (tz.includes("Denver") || tz.includes("Boise")) return "MT";
  if (tz.includes("Chicago")) return "CT";
  if (tz.includes("New_York") || tz.includes("Indianapolis")) return "ET";
  if (tz.includes("Anchorage")) return "AK";
  if (tz.includes("Honolulu")) return "HI";
  return "";
}

export type ProspectClock = {
  /** Display string, e.g. "2:14 PM PT" */
  display: string;
  /** Hour 0-23 in the prospect's local zone */
  hour24: number;
  /** Day-of-week name e.g. "Mon" */
  weekday: string;
  /** Day-of-week index 0=Sun..6=Sat */
  weekdayIdx: number;
  /** IANA timezone used */
  tz: string;
  /** Whether we had to default to ET because state was unknown */
  isFallbackTz: boolean;
};

/**
 * Compute the current local time at the prospect's state.
 * Always returns a value — falls back to ET when state is unknown.
 */
export function getProspectClock(state: string | null | undefined): ProspectClock {
  const code = (state || "").trim().toUpperCase().slice(0, 2);
  const tz = TZ_BY_STATE[code] || "America/New_York";
  const isFallbackTz = !TZ_BY_STATE[code];

  const now = new Date();
  // Display time
  const displayParts = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).formatToParts(now);
  const hour = displayParts.find((p) => p.type === "hour")?.value || "12";
  const minute = displayParts.find((p) => p.type === "minute")?.value || "00";
  const dayPeriod = displayParts.find((p) => p.type === "dayPeriod")?.value || "AM";

  // hour24 + weekday from a separate format call
  const hour24Str = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hour: "2-digit",
    hour12: false,
  }).format(now);
  // Intl can return "24" for midnight in some browsers — clamp.
  const hour24 = (parseInt(hour24Str, 10) || 0) % 24;
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    weekday: "short",
  }).format(now);
  const weekdayIdxMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  const weekdayIdx = weekdayIdxMap[weekday] ?? 1;

  return {
    display: `${hour}:${minute} ${dayPeriod}${tzAbbrFor(tz) ? ` ${tzAbbrFor(tz)}` : ""}`,
    hour24,
    weekday,
    weekdayIdx,
    tz,
    isFallbackTz,
  };
}

export type OpenStatus = {
  /** "open" | "closed" — overall verdict for the rendering badge */
  state: "open" | "closed";
  /** Whether we had ACTUAL parsed hours (vs heuristic) */
  precise: boolean;
  /** Short label e.g. "Likely open" or "Open now" or "Closed (opens 8 AM)" */
  label: string;
  /** Caller hint shown under the badge (one short sentence) */
  hint?: string;
};

/**
 * Heuristic: "are we within normal small-biz call hours?"
 * Mon–Fri 8am–7pm, Sat 9am–3pm, Sun closed.
 *
 * Used when scraped_data.hours isn't parseable. Labeled as "Likely
 * open / closed" so we never overclaim.
 */
export function getHeuristicOpenStatus(clock: ProspectClock): OpenStatus {
  const { hour24, weekdayIdx } = clock;
  // Sunday: assume closed
  if (weekdayIdx === 0) {
    return {
      state: "closed",
      precise: false,
      label: "Likely closed",
      hint: "It's Sunday at the prospect — most service businesses are off.",
    };
  }
  // Saturday: half day
  if (weekdayIdx === 6) {
    if (hour24 >= 9 && hour24 < 15) {
      return {
        state: "open",
        precise: false,
        label: "Likely open",
        hint: "Saturday business hours — call now or text the audit.",
      };
    }
    return {
      state: "closed",
      precise: false,
      label: "Likely closed",
      hint: "Saturday off-hours — voicemail likely.",
    };
  }
  // Mon–Fri: 8am–7pm
  if (hour24 >= 8 && hour24 < 19) {
    return {
      state: "open",
      precise: false,
      label: "Likely open",
    };
  }
  if (hour24 < 8) {
    return {
      state: "closed",
      precise: false,
      label: "Likely closed",
      hint: `Too early — opens around 8 AM at the prospect.`,
    };
  }
  return {
    state: "closed",
    precise: false,
    label: "Likely closed",
    hint: "After hours — voicemail almost certain.",
  };
}

// ─── Hours parser (Google Places–style format) ───
//
// Recognized format:
//   "Monday: 9:00 AM – 5:00 PM\nTuesday: ...\nSunday: Closed"
// Variants accepted:
//   - en-dash, hyphen, or "to" between times
//   - 12-hour or 24-hour times
//   - "Closed" / "Open 24 hours" per day
//
// Returns null if we can't confidently parse — caller falls back to
// the heuristic.

type DayHours = { open: number; close: number } | "closed" | "24h";

const DAY_NAMES: Record<string, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

function parseTimeToHour24(raw: string): number | null {
  const s = raw.trim().toLowerCase().replace(/\s+/g, "");
  // "9", "9:30", "9am", "9:30am", "9:30pm", "21:00"
  const m = s.match(/^(\d{1,2})(?::(\d{2}))?(am|pm)?$/);
  if (!m) return null;
  let h = parseInt(m[1], 10);
  const min = m[2] ? parseInt(m[2], 10) : 0;
  const period = m[3];
  if (period === "pm" && h < 12) h += 12;
  if (period === "am" && h === 12) h = 0;
  if (h > 23 || min > 59) return null;
  return h + min / 60;
}

export function parseHoursText(raw: string | null | undefined): Record<number, DayHours> | null {
  if (!raw || typeof raw !== "string") return null;
  const text = raw.trim();
  if (!text) return null;

  // Quick shortcut: "24/7" or "open 24 hours" anywhere → all days 24h
  if (/24\s*\/\s*7|open\s+24\s+hours/i.test(text)) {
    const all: Record<number, DayHours> = {};
    for (let i = 0; i < 7; i++) all[i] = "24h";
    return all;
  }

  const result: Record<number, DayHours> = {};
  const lines = text.split(/[\n;]+/);
  let parsedAny = false;

  for (const lineRaw of lines) {
    const line = lineRaw.trim();
    if (!line) continue;
    // "Monday: 9 AM – 5 PM" — pull day name first
    const dayMatch = line.match(/^([A-Za-z]+)[:\s\-]/);
    if (!dayMatch) continue;
    const dayKey = dayMatch[1].toLowerCase();
    if (!(dayKey in DAY_NAMES)) continue;
    const dayIdx = DAY_NAMES[dayKey];
    const rest = line.slice(dayMatch[0].length).trim();

    if (/closed/i.test(rest)) {
      result[dayIdx] = "closed";
      parsedAny = true;
      continue;
    }
    if (/24\s*hours|open\s*24/i.test(rest)) {
      result[dayIdx] = "24h";
      parsedAny = true;
      continue;
    }
    // Range: "9:00 AM – 5:00 PM" / "9-5" / "9 AM to 5 PM"
    const rangeMatch = rest.match(/([0-9:apm\s]+)\s*(?:–|—|-|to)\s*([0-9:apm\s]+)/i);
    if (!rangeMatch) continue;
    const open = parseTimeToHour24(rangeMatch[1]);
    const close = parseTimeToHour24(rangeMatch[2]);
    if (open == null || close == null) continue;
    result[dayIdx] = { open, close };
    parsedAny = true;
  }

  if (!parsedAny) return null;
  // Fill missing days as closed (Google often omits closed days)
  for (let i = 0; i < 7; i++) {
    if (!(i in result)) result[i] = "closed";
  }
  return result;
}

/**
 * Compute open/closed using parsed hours if available, otherwise
 * fall back to the heuristic. Always returns a status.
 */
export function getOpenStatus(
  clock: ProspectClock,
  rawHours: string | null | undefined,
): OpenStatus {
  const parsed = parseHoursText(rawHours);
  if (!parsed) return getHeuristicOpenStatus(clock);
  const today = parsed[clock.weekdayIdx];
  if (!today || today === "closed") {
    return {
      state: "closed",
      precise: true,
      label: "Closed today",
      hint: "Listed as closed for today — voicemail or callback.",
    };
  }
  if (today === "24h") {
    return {
      state: "open",
      precise: true,
      label: "Open 24 hours",
    };
  }
  const hour = clock.hour24;
  if (hour >= today.open && hour < today.close) {
    // Build a "closes at X" hint
    const closesAt = formatHour12(today.close);
    return {
      state: "open",
      precise: true,
      label: "Open now",
      hint: `Closes ${closesAt}.`,
    };
  }
  // Closed — find next opening
  if (hour < today.open) {
    return {
      state: "closed",
      precise: true,
      label: "Closed now",
      hint: `Opens ${formatHour12(today.open)}.`,
    };
  }
  return {
    state: "closed",
    precise: true,
    label: "Closed for the day",
    hint: "Try voicemail + send the audit by text.",
  };
}

function formatHour12(h: number): string {
  const hour = Math.floor(h);
  const min = Math.round((h - hour) * 60);
  const period = hour >= 12 ? "PM" : "AM";
  const display = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return min === 0 ? `${display} ${period}` : `${display}:${String(min).padStart(2, "0")} ${period}`;
}
