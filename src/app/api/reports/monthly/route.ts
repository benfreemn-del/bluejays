import { NextResponse } from "next/server";
import { getAllProspects, updateProspect } from "@/lib/store";
import { sendEmail } from "@/lib/email-sender";
import { getMonthlyReportEmail } from "@/lib/email-templates";
import {
  getCustomerMonthMetrics,
  getPreviousMonthWindow,
} from "@/lib/customer-metrics";
import { logHeartbeat } from "@/lib/cron-heartbeat";

/**
 * GET /api/reports/monthly
 *
 * Cron job (1st of each month at 9am Pacific) — sends monthly site
 * performance update emails to all paid/claimed clients.
 *
 * As of 2026-04-24 the email body uses REAL per-customer metrics from
 * `getCustomerMonthMetrics()` — leads from contact_form_submissions,
 * 5-star reviews from client_reviews, appointments from schedule_bookings,
 * and missed-calls auto-recovered (when the missed_call_logs table lands).
 * If a customer has zero activity that month, the email template
 * automatically renders the "encouragement" version instead.
 *
 * Also serves as a renewal reminder 30 days before the $100/yr charge.
 */

// Hardcoded per CLAUDE.md Rule 16 — Vercel had stale NEXT_PUBLIC_BASE_URL.
const BASE_URL = "https://bluejayportfolio.com";

function getMonthName(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function daysSince(isoDate: string): number {
  return Math.floor((Date.now() - new Date(isoDate).getTime()) / (1000 * 60 * 60 * 24));
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dryRun = searchParams.get("dry") === "true";
  const forceId = searchParams.get("id"); // send to a specific prospect for testing

  const now = new Date();
  // Cron fires on the 1st of the month, but the activity window is the
  // *previous* full month (e.g. May 1 cron → April 1-30 metrics).
  const { start: monthStart, end: monthEnd, label: previousMonthLabel } =
    getPreviousMonthWindow(now);
  const monthName = previousMonthLabel || getMonthName(now);

  const prospects = await getAllProspects();

  // Target: paid or claimed clients who have an email
  // Skip if we already sent this month (lastReportSentAt within 20 days)
  const eligible = prospects.filter((p) => {
    if (forceId && p.id !== forceId) return false;
    if (!["paid", "claimed"].includes(p.status)) return false;
    if (!p.email) return false;
    if (!p.paidAt) return false;

    if (p.lastReportSentAt) {
      const daysSinceLastReport = daysSince(p.lastReportSentAt);
      if (daysSinceLastReport < 20) return false; // already sent this month
    }

    return true;
  });

  const results: {
    id: string;
    business: string;
    email: string;
    daysLive: number;
    sent: boolean;
    metrics?: {
      leads: number;
      missedCallsRecovered: number;
      fiveStarReviews: number;
      appointments: number;
    };
  }[] = [];

  for (const prospect of eligible) {
    const daysLive = daysSince(prospect.paidAt!);
    const liveUrl = prospect.generatedSiteUrl || `${BASE_URL}/preview/${prospect.id}`;

    // Fetch REAL per-customer metrics for the previous month. Wrapped in
    // try/catch so a single bad query never blocks the whole batch run.
    let metrics = {
      leads: 0,
      missedCallsRecovered: 0,
      fiveStarReviews: 0,
      appointments: 0,
    };
    try {
      const m = await getCustomerMonthMetrics(prospect.id, monthStart, monthEnd);
      metrics = {
        leads: m.leads,
        missedCallsRecovered: m.missedCallsRecovered,
        fiveStarReviews: m.fiveStarReviews,
        appointments: m.appointments,
      };
    } catch (err) {
      console.error(`[Monthly Report] Metrics fetch failed for ${prospect.id}:`, err);
    }

    const template = getMonthlyReportEmail(prospect, liveUrl, monthName, daysLive, metrics);

    let sent = false;
    if (!dryRun && prospect.email) {
      try {
        await sendEmail(
          prospect.id,
          prospect.email,
          template.subject,
          template.body,
          0,
        );
        await updateProspect(prospect.id, {
          lastReportSentAt: new Date().toISOString(),
        });
        sent = true;
        console.log(`[Monthly Report] Sent to ${prospect.businessName} (${prospect.email})`);
      } catch (err) {
        console.error(`[Monthly Report] Failed for ${prospect.id}:`, err);
      }
    }

    results.push({
      id: prospect.id,
      business: prospect.businessName,
      email: prospect.email!,
      daysLive,
      sent: dryRun ? false : sent,
      metrics,
    });
  }

  await logHeartbeat("reports_monthly", {
    month: monthName,
    eligible: eligible.length,
    sent: results.filter((r) => r.sent).length,
    dryRun,
  });

  return NextResponse.json({
    month: monthName,
    eligible: eligible.length,
    sent: results.filter((r) => r.sent).length,
    dryRun,
    results,
  });
}
