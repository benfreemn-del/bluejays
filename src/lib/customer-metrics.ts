/**
 * Per-customer metrics for the monthly report email + /client/[id] portal.
 *
 * Replaces the previous hard-coded "generic tips" body in the monthly
 * report with real numbers Ben actually drove for the customer that
 * month — leads captured, missed calls auto-recovered, 5-star Google
 * reviews funneled in, and appointments booked.
 *
 * All four counts come from existing tables populated by the live
 * customer-features pipeline:
 *
 *   contact_form_submissions   (POST /api/contact-form/[id])
 *   missed_call_logs           (POST /api/missed-call/callback — see note)
 *   client_reviews             (POST /api/review/submit)
 *   schedule_bookings          (POST /api/schedule/book/[id])
 *
 * Notes on the missed-call source:
 *   The Twilio status callback at /api/missed-call/callback persists
 *   a row to `missed_call_logs` BEFORE the auto-SMS dispatches (see
 *   migration 20260424_missed_call_logs.sql + CLAUDE.md Rule 43). The
 *   metrics function counts those rows directly. safeCount still
 *   wraps the query in try/catch so a missing table on a fresh
 *   environment falls back to zero instead of crashing the report.
 *
 * IMPORTANT: All queries are wrapped in try/catch so a missing table
 * returns 0 instead of crashing the whole report run. Mock-mode safe
 * (when Supabase isn't configured we return all zeros, which the email
 * + portal render as "nothing to report this month — your site was up
 * 100%").
 */

import { supabase, isSupabaseConfigured } from "./supabase";

export interface MonthMetrics {
  /** New contact-form submissions in the window. */
  leads: number;
  /** Missed/no-answer calls auto-recovered with a follow-up SMS. */
  missedCallsRecovered: number;
  /** New 5-star reviews submitted via the funnel and routed to Google. */
  fiveStarReviews: number;
  /** All new reviews submitted via the funnel (5-star + private). */
  totalReviews: number;
  /** Appointments booked via /schedule/[id] or /book/[id] in the window. */
  appointments: number;
  /** Convenience flag — true when every count is 0 (encouragement template). */
  zeroActivity: boolean;
}

const ZERO_METRICS: MonthMetrics = {
  leads: 0,
  missedCallsRecovered: 0,
  fiveStarReviews: 0,
  totalReviews: 0,
  appointments: 0,
  zeroActivity: true,
};

/** Safe count helper — returns 0 if the query fails (table missing, RLS, etc.). */
async function safeCount(
  table: string,
  prospectId: string,
  startIso: string,
  endIso: string,
  dateColumn: string,
  extraEq?: { column: string; value: string | number },
): Promise<number> {
  try {
    let q = supabase
      .from(table)
      .select("id", { count: "exact", head: true })
      .eq("prospect_id", prospectId)
      .gte(dateColumn, startIso)
      .lte(dateColumn, endIso);

    if (extraEq) {
      q = q.eq(extraEq.column, extraEq.value);
    }

    const { count, error } = await q;
    if (error) return 0;
    return count || 0;
  } catch {
    return 0;
  }
}

/**
 * Fetch per-customer metrics for a date window.
 *
 * @param prospectId   prospect UUID
 * @param monthStartDate inclusive start (any ISO-parsable string or Date)
 * @param monthEndDate   inclusive end (any ISO-parsable string or Date)
 */
export async function getCustomerMonthMetrics(
  prospectId: string,
  monthStartDate: Date | string,
  monthEndDate: Date | string,
): Promise<MonthMetrics> {
  if (!isSupabaseConfigured()) return ZERO_METRICS;

  const startIso =
    typeof monthStartDate === "string"
      ? monthStartDate
      : monthStartDate.toISOString();
  const endIso =
    typeof monthEndDate === "string" ? monthEndDate : monthEndDate.toISOString();

  const [leads, missedCallsRecovered, fiveStarReviews, totalReviews, appointments] =
    await Promise.all([
      safeCount("contact_form_submissions", prospectId, startIso, endIso, "submitted_at"),
      // missed_call_logs lands via /api/missed-call/callback (see Rule 43).
      // safeCount falls back to 0 if the table is missing on a fresh env.
      safeCount("missed_call_logs", prospectId, startIso, endIso, "occurred_at"),
      safeCount("client_reviews", prospectId, startIso, endIso, "submitted_at", {
        column: "rating",
        value: 5,
      }),
      safeCount("client_reviews", prospectId, startIso, endIso, "submitted_at"),
      safeCount("schedule_bookings", prospectId, startIso, endIso, "created_at"),
    ]);

  const zeroActivity =
    leads + missedCallsRecovered + fiveStarReviews + appointments === 0;

  return {
    leads,
    missedCallsRecovered,
    fiveStarReviews,
    totalReviews,
    appointments,
    zeroActivity,
  };
}

/**
 * Compute the [start, end] window for "the month that just ended" relative
 * to `now`. A monthly cron run on the 1st of May returns
 * [April 1 00:00 UTC, April 30 23:59:59 UTC].
 */
export function getPreviousMonthWindow(now: Date = new Date()): {
  start: Date;
  end: Date;
  label: string;
} {
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth(); // 0-indexed; previous month = month - 1
  const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
  // Day 0 of the *current* month = last day of the previous month
  const end = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
  const label = start.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
  return { start, end, label };
}

/**
 * List recent leads for a customer, newest first, for the portal.
 * Returns [] if Supabase isn't configured or the table doesn't exist.
 */
export interface LeadRow {
  id: string;
  customer_name: string | null;
  customer_phone: string | null;
  customer_email: string | null;
  message: string | null;
  service_requested: string | null;
  submitted_at: string;
}

export async function listRecentLeads(
  prospectId: string,
  limit = 50,
): Promise<LeadRow[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const { data, error } = await supabase
      .from("contact_form_submissions")
      .select(
        "id, customer_name, customer_phone, customer_email, message, service_requested, submitted_at",
      )
      .eq("prospect_id", prospectId)
      .order("submitted_at", { ascending: false })
      .limit(limit);
    if (error || !data) return [];
    return data as LeadRow[];
  } catch {
    return [];
  }
}

/**
 * List missed-call entries for the portal Leads tab. Returns [] if the
 * table doesn't exist yet (table created by migration
 * 20260424_missed_call_logs.sql).
 *
 * Columns match the actual `missed_call_logs` schema — `caller_phone`
 * (NOT `caller_number`), plus `caller_city`/`caller_state` from
 * Twilio's FromCity/FromState webhook fields.
 */
export interface MissedCallRow {
  id: string;
  caller_phone: string | null;
  caller_city: string | null;
  caller_state: string | null;
  call_status: string | null;
  call_duration_seconds: number | null;
  occurred_at: string;
  auto_sms_sent: boolean | null;
  auto_sms_body: string | null;
}

export async function listRecentMissedCalls(
  prospectId: string,
  limit = 20,
): Promise<MissedCallRow[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const { data, error } = await supabase
      .from("missed_call_logs")
      .select(
        "id, caller_phone, caller_city, caller_state, call_status, call_duration_seconds, occurred_at, auto_sms_sent, auto_sms_body",
      )
      .eq("prospect_id", prospectId)
      .order("occurred_at", { ascending: false })
      .limit(limit);
    if (error || !data) return [];
    return data as MissedCallRow[];
  } catch {
    return [];
  }
}

/** List recent reviews for the Reviews tab. */
export interface ReviewRow {
  id: string;
  rating: number;
  feedback: string | null;
  reviewer_name?: string | null;
  submitted_at: string;
}

export async function listRecentReviews(
  prospectId: string,
  limit = 50,
): Promise<ReviewRow[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const { data, error } = await supabase
      .from("client_reviews")
      .select("id, rating, feedback, reviewer_name, submitted_at")
      .eq("prospect_id", prospectId)
      .order("submitted_at", { ascending: false })
      .limit(limit);
    if (error || !data) return [];
    return data as ReviewRow[];
  } catch {
    return [];
  }
}

/** List recent appointments for the Leads tab (bookings count as leads in spirit). */
export interface AppointmentRow {
  id: string;
  contact_name: string | null;
  phone: string | null;
  email: string | null;
  slot_iso: string;
  slot_label: string | null;
  notes: string | null;
  status: string | null;
  created_at: string;
}

export async function listRecentAppointments(
  prospectId: string,
  limit = 50,
): Promise<AppointmentRow[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const { data, error } = await supabase
      .from("schedule_bookings")
      .select(
        "id, contact_name, phone, email, slot_iso, slot_label, notes, status, created_at",
      )
      .eq("prospect_id", prospectId)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error || !data) return [];
    return data as AppointmentRow[];
  } catch {
    return [];
  }
}
