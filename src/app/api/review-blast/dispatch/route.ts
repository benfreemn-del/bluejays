import { NextRequest, NextResponse } from "next/server";
import { dispatchPendingSubmissions } from "@/lib/review-blast";
import { logHeartbeat } from "@/lib/cron-heartbeat";

/**
 * Daily cron: dispatch eligible Review Blast submissions.
 *
 * Per CLAUDE.md "Review Blast Wave 1" spec (#7A): all 50 SMS within
 * 1 hour of dispatch start. The cron runs daily — once A2P 10DLC is
 * approved, any pending submissions queued during the wait period
 * automatically dispatch on the next cron tick.
 *
 * Pre-A2P: SMS_FUNNEL_DISABLED gates this — same env var that blocks
 * the rest of the SMS funnel. Submissions stay in 'pending_a2p' status
 * until SMS_FUNNEL_DISABLED is unset (or set to anything other than
 * "true"). The moment it flips, the next cron tick processes the
 * backlog.
 *
 * Schedule: 17:30 UTC daily (9:30am PT — sits AFTER the funnel cron
 * at 16:00 UTC and the postcard cron at 17:00 UTC, so all the regular
 * SMS volume from those flows finishes first per Rule 30 — outbound
 * commercial crons hit US business hours window).
 *
 * Auth: CRON_SECRET via Authorization header — same gate as
 * /api/funnel/run and other Vercel-cron endpoints.
 */
export async function POST(request?: NextRequest) {
  if (request) {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  console.log("[review-blast/dispatch] Running…");
  const result = await dispatchPendingSubmissions();
  console.log(
    `[review-blast/dispatch] Done: ${result.processed} submissions, ${result.smsSent} SMS sent, ${result.smsFailed} SMS failed${result.skipped.length > 0 ? `, skipped: ${result.skipped.join(",")}` : ""}`,
  );

  await logHeartbeat("review_blast_dispatch", {
    processed: result.processed,
    smsSent: result.smsSent,
    smsFailed: result.smsFailed,
    skipped: result.skipped.length,
  });

  return NextResponse.json({
    message: `Review Blast dispatch: ${result.processed} submissions processed, ${result.smsSent} sent, ${result.smsFailed} failed${result.skipped.length > 0 ? `, skipped: ${result.skipped.join(",")}` : ""}`,
    ...result,
  });
}

export async function GET(request: NextRequest) {
  return POST(request);
}
