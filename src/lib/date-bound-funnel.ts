/**
 * date-bound-funnel.ts — cadence helper for tenants whose leads carry
 * a fixed future event date that drives the funnel rhythm.
 *
 * Per `docs/MOCK_BACKEND_TEMPLATE_AUDIT.md` roadmap #4 — 9+ categories
 * share this shape: moving / fitness / med-spa / tutoring / wedding-
 * photo / florist-wedding / catering-wedding / event-planning / pet-
 * boarding.
 *
 * Pattern:
 *   · client_leads.event_date is the fixed future date
 *   · client_leads.event_date_kind disambiguates (move / wedding /
 *     camp / sat-test / boarding-checkin / etc.)
 *   · The cadence is keyed to days-remaining buckets (60 / 30 / 14 / 7 / 1)
 *   · Each tenant supplies its own per-bucket message templates, but
 *     the SCHEDULING + URGENCY-SCORE math lives here
 *
 * Why a shared lib not 9 copies:
 *   · Bucket boundaries are universal (same psychology — "2 months
 *     out" / "final week" / etc.)
 *   · Urgency-score math is identical across categories
 *   · Eventually wires into the iteration engine (which message slot
 *     converts? does the 14-day vs. 7-day touchpoint matter?) once
 *     observation data exists
 *
 * Usage from a tenant funnel-runner:
 *   import { getMilestoneForLead, urgencyScoreFromEventDate } from "@/lib/date-bound-funnel";
 *   const milestone = getMilestoneForLead(lead);
 *   const urgencyBoost = urgencyScoreFromEventDate(lead);
 */

export type EventDateMilestone =
  | "60-day"
  | "30-day"
  | "14-day"
  | "7-day"
  | "1-day"
  | "day-of"
  | "post-event"
  | "no-event-date";

export interface DateBoundLead {
  event_date: string | Date | null;
  event_date_kind?: string | null;
}

/**
 * Universal bucket-boundaries the entire system uses. All 9 tenant
 * categories key off these — change here = change everywhere.
 *
 * Why these specific marks: 60/30/14/7/1 maps to the natural human
 * cadence of event-prep ("two months out — start planning" → "two
 * weeks out — final logistics" → "tomorrow"). Empirically holds
 * across weddings, moves, vacations, test prep.
 */
export const MILESTONE_BUCKETS: ReadonlyArray<{
  id: EventDateMilestone;
  /** Inclusive upper bound (days remaining) */
  daysOutMax: number;
  /** Exclusive lower bound — must be > this to land in this bucket */
  daysOutMin: number;
}> = [
  { id: "60-day", daysOutMax: 75, daysOutMin: 35 },
  { id: "30-day", daysOutMax: 35, daysOutMin: 17 },
  { id: "14-day", daysOutMax: 17, daysOutMin: 9 },
  { id: "7-day", daysOutMax: 9, daysOutMin: 2 },
  { id: "1-day", daysOutMax: 2, daysOutMin: 0 },
  { id: "day-of", daysOutMax: 0, daysOutMin: -1 },
  { id: "post-event", daysOutMax: -1, daysOutMin: -90 },
];

/**
 * Days remaining until event_date. Returns null if no date set or
 * date is unparseable. Negative = event already happened (post-event
 * cadence territory).
 */
export function daysUntilEvent(lead: DateBoundLead, now: Date = new Date()): number | null {
  if (!lead.event_date) return null;
  const target =
    lead.event_date instanceof Date ? lead.event_date : new Date(lead.event_date);
  if (isNaN(target.getTime())) return null;
  // Round to whole days at midnight UTC so the bucket math doesn't
  // flicker minute-by-minute across a day boundary.
  const ms = target.getTime() - now.getTime();
  return Math.round(ms / (24 * 60 * 60 * 1000));
}

/**
 * Pick the right milestone bucket for a lead. Returns "no-event-date"
 * if event_date is unset — caller should fall back to a generic cadence.
 *
 * Edge case: leads >75 days out are NOT in any bucket yet — they get
 * the "no-event-date" / generic-welcome flow until they cross the
 * 60-day boundary.
 */
export function getMilestoneForLead(
  lead: DateBoundLead,
  now: Date = new Date(),
): EventDateMilestone {
  const days = daysUntilEvent(lead, now);
  if (days === null) return "no-event-date";
  if (days > 75) return "no-event-date"; // generic flow until close enough
  for (const bucket of MILESTONE_BUCKETS) {
    if (days <= bucket.daysOutMax && days > bucket.daysOutMin) {
      return bucket.id;
    }
  }
  // Way past event (>90 days) — past the post-event window
  return "no-event-date";
}

/**
 * Boost a lead's urgency score based on how close the event is.
 * Linear ramp from 0 (no date / >75 days) to 30 (event today).
 *
 * Plugs into the per-tenant lead-score formula: most categories'
 * formulas already have a `+ 18 if urgency=high` term. Tenants that
 * adopt the date-bound pattern can replace that with this calculation.
 */
export function urgencyScoreFromEventDate(lead: DateBoundLead, now: Date = new Date()): number {
  const days = daysUntilEvent(lead, now);
  if (days === null || days > 75) return 0;
  if (days <= 0) return 30; // day-of / post-event = max urgency
  if (days <= 7) return 25;
  if (days <= 14) return 20;
  if (days <= 30) return 15;
  // 30 < days <= 75
  return 10;
}

/**
 * Should the funnel runner fire a touchpoint for this lead RIGHT NOW?
 * Returns the milestone if a fresh touchpoint is due, null otherwise.
 *
 * Caller pattern:
 *   const fire = shouldFireTouchpoint(lead, lead.last_milestone_sent);
 *   if (fire) {
 *     await sendCampaignFor(lead, fire);
 *     await markMilestoneSent(lead.id, fire);
 *   }
 *
 * Idempotency: tracks the last-sent milestone on the lead so we don't
 * re-send the 30-day touch every cron tick. Caller persists the
 * returned milestone after a successful send.
 */
export function shouldFireTouchpoint(
  lead: DateBoundLead,
  lastMilestoneSent: EventDateMilestone | null,
  now: Date = new Date(),
): EventDateMilestone | null {
  const milestone = getMilestoneForLead(lead, now);
  if (milestone === "no-event-date") return null;
  if (milestone === lastMilestoneSent) return null;
  // Don't auto-fire post-event without explicit caller opt-in
  if (milestone === "post-event") return null;
  return milestone;
}

/**
 * Default per-milestone subject-line templates. Tenants override
 * these in their own lib (see docs/mock-backends/<slug>.md "4 standard
 * funnels" section) but this is a sensible starting point that any
 * date-bound tenant can ship with on day one.
 */
export const DEFAULT_MILESTONE_TEMPLATES: Record<EventDateMilestone, {
  subject: string;
  /** 1-line gist of the message body — full copy is per-tenant */
  bodyHint: string;
}> = {
  "60-day": {
    subject: "Your {{eventKind}} is 60 days out — here's the prep arc",
    bodyHint: "set expectations, share the timeline, surface the long-lead-time decisions",
  },
  "30-day": {
    subject: "30 days to {{eventKind}} — lock in your big decisions",
    bodyHint: "the high-leverage commit-now decisions; book / order / schedule",
  },
  "14-day": {
    subject: "Two weeks to {{eventKind}} — final-prep checklist",
    bodyHint: "logistics + checklist + last-chance for upgrades",
  },
  "7-day": {
    subject: "{{eventKind}} is next week — what to expect",
    bodyHint: "day-of details, point of contact, what to bring",
  },
  "1-day": {
    subject: "Tomorrow's {{eventKind}} — text us with anything",
    bodyHint: "calm reassurance + direct contact + day-of timing",
  },
  "day-of": {
    subject: "Day-of: {{eventKind}}",
    bodyHint: "in-the-moment touchpoint; minimal, supportive",
  },
  "post-event": {
    subject: "How was your {{eventKind}}?",
    bodyHint: "review request + retention nurture for the next event",
  },
  "no-event-date": {
    subject: "Welcome — let's get your {{eventKind}} dialed in",
    bodyHint: "generic welcome until event date is captured",
  },
};
