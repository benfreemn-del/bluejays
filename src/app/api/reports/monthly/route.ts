import { NextResponse } from "next/server";
import { getAllProspects, updateProspect } from "@/lib/store";
import { sendEmail } from "@/lib/email-sender";
import { getMonthlyReportEmail } from "@/lib/email-templates";

/**
 * GET /api/reports/monthly
 *
 * Cron job (1st of each month at 9am Pacific) — sends monthly site
 * performance update emails to all paid/claimed clients.
 *
 * For now the email focuses on actionable tips (add site to GBP, social
 * links, ask for reviews) since we don't yet have per-site GA integration.
 * Once GA4 is wired, replace tips with real metrics.
 *
 * Also serves as a renewal reminder 30 days before the $100/yr charge.
 */

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://bluejayportfolio.com";

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
  const monthName = getMonthName(now);

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
  }[] = [];

  for (const prospect of eligible) {
    const daysLive = daysSince(prospect.paidAt!);
    const liveUrl = prospect.generatedSiteUrl || `${BASE_URL}/preview/${prospect.id}`;
    const template = getMonthlyReportEmail(prospect, liveUrl, monthName, daysLive);

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
    });
  }

  return NextResponse.json({
    month: monthName,
    eligible: eligible.length,
    sent: results.filter((r) => r.sent).length,
    dryRun,
    results,
  });
}
