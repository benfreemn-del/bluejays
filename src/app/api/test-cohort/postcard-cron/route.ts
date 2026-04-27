import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { getProspect, updateProspect } from "@/lib/store";
import { sendPostcard } from "@/lib/postcard-sender";
import { logHeartbeat } from "@/lib/cron-heartbeat";

/**
 * Daily cron: send Lob postcards to test-cohort prospects who have
 * crossed Day 7 of their funnel enrollment and haven't received one yet.
 *
 * Per CLAUDE.md "Test Group Wave 1" spec:
 *  - Channel mix for Wave 1: email + voicemail + Lob postcard at Day 7
 *  - Gated to test-cohort prospects only (via `test_cohort_id IS NOT NULL`)
 *  - Force-sends regardless of the standard postcard tier-gate (the
 *    cohort selection already filtered for top-quality prospects)
 *  - Mock-safe: when LOB_API_KEY is absent, sendPostcard logs + no-ops
 *
 * Schedule: 17:00 UTC daily (9am PT — sits between funnel cron @16 UTC
 * and retry-failed-sends @17 UTC; same window as other US-business-hour
 * outbound per Rule 30).
 *
 * Auth: Vercel cron passes Bearer CRON_SECRET. Route also accepts the
 * same secret for manual triggers.
 */
export async function POST(request?: NextRequest) {
  if (request) {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  if (!isSupabaseConfigured()) {
    await logHeartbeat("test_cohort_postcard", { reason: "supabase_not_configured" }, "skipped");
    return NextResponse.json({
      message: "Supabase not configured — cron is a no-op in dev",
      sent: 0,
    });
  }

  console.log("[test-cohort/postcard-cron] Looking for cohort prospects past Day 7…");

  // Find every cohort prospect that hasn't received a postcard yet.
  const { data: rows, error } = await supabase
    .from("prospects")
    .select("id, business_name, status")
    .not("test_cohort_id", "is", null)
    .is("cohort_postcard_sent_at", null)
    .not("status", "in", "(paid,dismissed,unsubscribed,bounced)");

  if (error) {
    console.error("[test-cohort/postcard-cron] Query failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const candidates = rows || [];
  if (candidates.length === 0) {
    return NextResponse.json({
      message: "No cohort prospects need a postcard right now.",
      sent: 0,
    });
  }

  // Cross-check enrolledAt — only fire postcard for prospects past Day 7.
  const ids = candidates.map((r) => r.id as string);
  const { data: enrollRows } = await supabase
    .from("funnel_enrollments")
    .select("prospect_id, enrolled_at")
    .in("prospect_id", ids);
  const enrollMap = new Map<string, string>();
  for (const er of enrollRows || []) {
    enrollMap.set(er.prospect_id as string, er.enrolled_at as string);
  }

  const now = Date.now();
  const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
  const eligible = candidates.filter((c) => {
    const enrolledAt = enrollMap.get(c.id as string);
    if (!enrolledAt) return false;
    return now - new Date(enrolledAt).getTime() >= SEVEN_DAYS_MS;
  });

  if (eligible.length === 0) {
    return NextResponse.json({
      message: `${candidates.length} cohort prospects untagged but none past Day 7 yet.`,
      sent: 0,
      candidatesPending: candidates.length,
    });
  }

  console.log(
    `[test-cohort/postcard-cron] ${eligible.length}/${candidates.length} eligible to send today`,
  );

  let sent = 0;
  let skipped = 0;
  let failed = 0;
  const results: Array<{
    id: string;
    businessName: string;
    sent: boolean;
    skipped?: string;
    error?: string;
  }> = [];

  for (const c of eligible) {
    const id = c.id as string;
    const prospect = await getProspect(id);
    if (!prospect) {
      failed++;
      continue;
    }

    try {
      // forceTier:true bypasses the rating/review tier gate — the cohort
      // selection already filtered for top quality, so the standard tier
      // protection is redundant here.
      const result = await sendPostcard(prospect, { forceTier: true });
      if (result.sent) {
        sent++;
        await updateProspect(id, {
          cohortPostcardSentAt: new Date().toISOString(),
        });
        results.push({
          id,
          businessName: prospect.businessName,
          sent: true,
        });
      } else {
        skipped++;
        results.push({
          id,
          businessName: prospect.businessName,
          sent: false,
          skipped: result.skipped || "unknown",
          error: result.error,
        });
      }
    } catch (err) {
      failed++;
      results.push({
        id,
        businessName: prospect.businessName,
        sent: false,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  console.log(
    `[test-cohort/postcard-cron] Done: ${sent} sent, ${skipped} skipped, ${failed} failed`,
  );

  await logHeartbeat("test_cohort_postcard", {
    sent,
    skipped,
    failed,
    eligible: eligible.length,
  });

  return NextResponse.json({
    message: `Postcard cron: ${sent} sent, ${skipped} skipped, ${failed} failed`,
    sent,
    skipped,
    failed,
    eligible: eligible.length,
    results,
  });
}

/** GET delegates to POST for Vercel cron compatibility. */
export async function GET(request: NextRequest) {
  return POST(request);
}
