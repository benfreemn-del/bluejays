/**
 * Booking-slot suggestion engine for the partner call workspace.
 *
 * Goal: when a partner clicks "Send booking link" mid-call, they get
 * a Hormozi-style assumptive close — a SPECIFIC date + time, like
 * "How about tomorrow at 2:15?" — rather than a generic Calendly URL
 * the prospect has to dig through.
 *
 * Why :15/:45 minutes (the "15-minute increment trick"):
 *   - On the hour / half-hour feels like a cattle-call sales slot,
 *     and prospects subconsciously assume it's busy.
 *   - Off-the-hour times feel personal — "we have a slot at 2:15"
 *     reads like Ben actually checked his calendar.
 *   - Show-rates measurably climb when the time isn't a round number.
 *
 * Why 30-min spacing despite 15-min calls:
 *   - Calls are 15 min, but Ben needs 15 min between for notes /
 *     follow-up. 30-min spacing lets two calls run back-to-back
 *     when needed without overlap, while keeping the calendar tidy.
 *
 * Business hours (Ben's):
 *   - Mon-Fri only
 *   - 9:00 AM through 5:00 PM local
 *   - Lunch blackout: 12:00 PM – 1:00 PM
 *   - First valid slot of any day is :15 or :45 past the hour
 *
 * NOTE: this is a heuristic-only engine. It does NOT yet read
 * Ben's actual Google Calendar — that would require Calendly API
 * + CALENDLY_PERSONAL_ACCESS_TOKEN. For now, partners get clean
 * suggested slots that they can confirm verbally on the call,
 * and the prospect picks the final time inside Calendly.
 */

export type BookingSlot = {
  /** ISO timestamp of the slot start (used for sort/key) */
  iso: string;
  /** Date object for the slot start */
  date: Date;
  /** Day-of-week label, e.g. "Tomorrow", "Monday", "Tuesday" */
  dayLabel: string;
  /** Time label e.g. "2:15 PM" */
  timeLabel: string;
  /** Hormozi-style spoken phrase: "tomorrow at 2:15" — what the rep says aloud */
  spoken: string;
  /** True if this is the auto-recommended "best" slot */
  recommended: boolean;
};

const BUSINESS_DAYS = [1, 2, 3, 4, 5]; // Mon-Fri
const DAY_START_HOUR = 9;
const DAY_END_HOUR = 17;
const LUNCH_START_HOUR = 12;
const LUNCH_END_HOUR = 13;

/**
 * Generate the next N suggested 15-minute increment booking slots.
 *
 * @param now      — current time (defaults to Date.now())
 * @param count    — how many slots to return (default 12)
 * @param leadTimeMins — minimum minutes from now before the first slot
 *                       can fall (default 90 — Hormozi: don't book a
 *                       call 5 minutes from now, prospect won't be ready)
 */
export function getSuggestedSlots(
  now: Date = new Date(),
  count = 12,
  leadTimeMins = 90,
): BookingSlot[] {
  const earliest = new Date(now.getTime() + leadTimeMins * 60_000);
  const slots: BookingSlot[] = [];

  // Walk forward day by day, building :15/:45 slots inside business hours
  const cursor = new Date(earliest);
  cursor.setSeconds(0, 0);

  let safety = 0;
  while (slots.length < count && safety < 30) {
    safety += 1;
    const day = cursor.getDay();
    if (BUSINESS_DAYS.includes(day)) {
      // For each business hour 9..16, push :15 then :45
      for (let hour = DAY_START_HOUR; hour < DAY_END_HOUR; hour += 1) {
        // Skip lunch hour entirely (12:15, 12:45)
        if (hour >= LUNCH_START_HOUR && hour < LUNCH_END_HOUR) continue;
        for (const minute of [15, 45]) {
          const slot = new Date(cursor);
          slot.setHours(hour, minute, 0, 0);
          if (slot < earliest) continue;
          slots.push(buildSlot(slot, now));
          if (slots.length >= count) break;
        }
        if (slots.length >= count) break;
      }
    }
    // Advance to start of next day
    cursor.setDate(cursor.getDate() + 1);
    cursor.setHours(0, 0, 0, 0);
  }

  // Mark the FIRST slot as recommended — Hormozi says assume the
  // closest reasonable time. Specificity > optionality.
  if (slots.length > 0) slots[0].recommended = true;

  return slots;
}

/**
 * Build slots for a specific calendar day. Used when the rep needs to
 * navigate to a different day in the modal (e.g. prospect can't do
 * Monday, push to Wednesday). Lead-time logic still applies — if the
 * day IS today, slots that have already passed are filtered out.
 *
 * Returns [] for weekends.
 */
export function getSlotsForDay(
  day: Date,
  now: Date = new Date(),
  leadTimeMins = 90,
): BookingSlot[] {
  const dow = day.getDay();
  if (!BUSINESS_DAYS.includes(dow)) return [];

  const earliest = new Date(now.getTime() + leadTimeMins * 60_000);
  const slots: BookingSlot[] = [];
  for (let hour = DAY_START_HOUR; hour < DAY_END_HOUR; hour += 1) {
    if (hour >= LUNCH_START_HOUR && hour < LUNCH_END_HOUR) continue;
    for (const minute of [15, 45]) {
      const slot = new Date(day);
      slot.setHours(hour, minute, 0, 0);
      if (slot < earliest) continue;
      slots.push(buildSlot(slot, now));
    }
  }
  return slots;
}

/**
 * Returns the next `count` business-day Date objects starting from
 * `start` (or today). Each Date is set to midnight local time so the
 * caller can render it as a tab/pill. Skips weekends.
 *
 * If start is itself a weekend, the first returned day is the
 * following Monday.
 */
export function getNextBusinessDays(
  start: Date = new Date(),
  count = 10,
): Date[] {
  const days: Date[] = [];
  const cursor = new Date(start);
  cursor.setHours(0, 0, 0, 0);
  let safety = 0;
  while (days.length < count && safety < 30) {
    safety += 1;
    if (BUSINESS_DAYS.includes(cursor.getDay())) {
      days.push(new Date(cursor));
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

/**
 * Format a calendar day for the day-tab pill. Returns short weekday
 * + numeric date so the rep can scan: "Mon 5/5", "Tue 5/6". The
 * "Today" / "Tomorrow" markers are still applied to the date that
 * matches.
 */
export function formatDayTab(day: Date, now: Date = new Date()): {
  primary: string; // "Today" / "Tomorrow" / "Mon"
  secondary: string; // "May 5"
} {
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const target = new Date(day);
  target.setHours(0, 0, 0, 0);
  const diffDays = Math.round(
    (target.getTime() - today.getTime()) / 86_400_000,
  );
  let primary: string;
  if (diffDays === 0) primary = "Today";
  else if (diffDays === 1) primary = "Tomorrow";
  else
    primary = day.toLocaleDateString("en-US", { weekday: "short" });
  const secondary = day.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  return { primary, secondary };
}

function buildSlot(slot: Date, now: Date): BookingSlot {
  return {
    iso: slot.toISOString(),
    date: slot,
    dayLabel: dayLabel(slot, now),
    timeLabel: timeLabel(slot),
    spoken: spokenPhrase(slot, now),
    recommended: false,
  };
}

function dayLabel(slot: Date, now: Date): string {
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const slotDay = new Date(slot);
  slotDay.setHours(0, 0, 0, 0);
  const diffDays = Math.round(
    (slotDay.getTime() - today.getTime()) / 86_400_000,
  );
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays < 7) {
    return slot.toLocaleDateString("en-US", { weekday: "long" });
  }
  return slot.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function timeLabel(slot: Date): string {
  return slot
    .toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
    .replace(" ", " "); // non-breaking space so "2:15 PM" wraps as one token
}

function spokenPhrase(slot: Date, now: Date): string {
  const day = dayLabel(slot, now).toLowerCase();
  // "2:15" not "2:15 PM" — the rep adds AM/PM verbally only when needed
  const timeBare = slot
    .toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
    .replace(/\s?[AP]M$/i, "");
  return `${day} at ${timeBare}`;
}

/**
 * Build the SMS body that the rep sends with a specific time.
 * The prospect still picks the actual slot in Calendly — the
 * suggested time just gives them a concrete anchor to say "yes" to.
 */
export function buildBookingSmsBody(args: {
  firstName: string;
  callerFirst: string;
  spoken: string;
  bookingUrl: string;
}): string {
  return `Hey ${args.firstName}, ${args.callerFirst} with BlueJays — locking in ${args.spoken} for the 15-min walkthrough with Ben. Confirm here: ${args.bookingUrl}`;
}
