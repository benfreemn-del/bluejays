import { NextRequest, NextResponse } from "next/server";
import { getAllProspects, updateProspect } from "@/lib/store";
import { sendEmail } from "@/lib/email-sender";
import { getNpsSurveyEmail } from "@/lib/email-templates";
import { logHeartbeat } from "@/lib/cron-heartbeat";

/**
 * GET /api/nps/send
 *
 * Daily cron — Wave-5b retention.
 *
 * Finds paid prospects who paid 14 days ago AND have not yet
 * received the NPS survey email (`nps_sent_at IS NULL`). Sends the
 * Day-14 survey from `getNpsSurveyEmail()`, then stamps
 * `nps_sent_at = now()` so the cron is idempotent.
 *
 * Why Day 14 (not 7, not 30):
 *   - Day 7 measures honeymoon excitement, not stable opinion.
 *   - Day 30 misses the "honest first impressions" window entirely
 *     and risks the customer forgetting they ever bought it.
 *   - Day 14 hits the sweet spot — long enough that the build
 *     dopamine has worn off, short enough that the experience is
 *     still vivid.
 *
 * Schedule: Vercel cron `0 16 * * *` (16:00 UTC = 8am PT) per
 * CLAUDE.md Rule 30 outbound-marketing window. Co-located with the
 * other 16:00 UTC outbound crons (funnel, renewal-30/7).
 *
 * Mock-mode safe: when SendGrid isn't configured, `sendEmail` falls
 * to console-log mode and the cron still flips `nps_sent_at` so dev
 * dry-runs don't keep re-firing the same prospects.
 *
 * `?dry=true` — preview the eligible set without sending.
 */
export const dynamic = "force-dynamic";

const FOURTEEN_DAYS_MS = 14 * 24 * 60 * 60 * 1000;

export async function GET(request: NextRequest) {
  // Vercel cron auth: when CRON_SECRET is set, require it; otherwise
  // accept the user-agent fingerprint Vercel sends. Same pattern as
  // /api/billing/check-upcoming-renewals.
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    const userAgent = request.headers.get("user-agent") || "";
    if (!userAgent.toLowerCase().includes("vercel")) {
      // Allow ?dry=true probes without auth so Ben can sanity-check
      // the eligible set from the dashboard.
      const { searchParams } = new URL(request.url);
      if (searchParams.get("dry") !== "true") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }
  }

  const { searchParams } = new URL(request.url);
  const dryRun = searchParams.get("dry") === "true";

  const prospects = await getAllProspects();
  const now = Date.now();

  const eligible = prospects.filter((p) => {
    if (p.status !== "paid") return false;
    if (!p.paidAt) return false;
    if (p.npsSentAt) return false; // already sent
    if (!p.email) return false;

    const daysSincePaid = now - new Date(p.paidAt).getTime();
    return daysSincePaid >= FOURTEEN_DAYS_MS;
  });

  const results: {
    id: string;
    business: string;
    sent: boolean;
    error?: string;
  }[] = [];

  for (const prospect of eligible) {
    if (!prospect.email) continue; // type narrowing — already filtered

    const template = getNpsSurveyEmail(prospect);

    if (dryRun) {
      results.push({
        id: prospect.id,
        business: prospect.businessName,
        sent: false,
      });
      continue;
    }

    try {
      await sendEmail(
        prospect.id,
        prospect.email,
        template.subject,
        template.body,
        template.sequence,
      );
      // Stamp sent timestamp BEFORE next iteration so a partial
      // failure mid-loop never re-sends to the same prospect on
      // the next cron run.
      await updateProspect(prospect.id, {
        npsSentAt: new Date().toISOString(),
      });
      results.push({
        id: prospect.id,
        business: prospect.businessName,
        sent: true,
      });
      console.log(
        `[NPS] Day-14 survey sent to ${prospect.businessName} (${prospect.email})`,
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(
        `[NPS] Failed to send Day-14 survey to ${prospect.id}:`,
        err,
      );
      results.push({
        id: prospect.id,
        business: prospect.businessName,
        sent: false,
        error: message,
      });
    }
  }

  await logHeartbeat("nps_send", {
    eligible: eligible.length,
    sent: results.filter((r) => r.sent).length,
    failed: results.filter((r) => r.error).length,
    dryRun,
  });

  return NextResponse.json({
    eligible: eligible.length,
    sent: results.filter((r) => r.sent).length,
    failed: results.filter((r) => r.error).length,
    dryRun,
    results,
  });
}
