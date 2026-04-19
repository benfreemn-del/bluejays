import { NextRequest, NextResponse } from "next/server";
import { runDailyFunnel } from "@/lib/funnel-manager";
import { runAutoResumeCheck } from "@/lib/followup-scheduler";
import { sendDailyDigest } from "@/lib/alerts";
import { getWarmingStatus } from "@/lib/domain-warming";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

// POST: Run the funnel processor — handles due retries first, then next due steps
// Also runs the follow-up scheduler auto-resume check
// This route can be called on a schedule as often as needed.
//
// NOTE — Vercel cron jobs invoke endpoints with a GET request, NOT POST.
// The GET handler below delegates to this same POST runner so the cron
// actually sends emails. Prior to 2026-04-18 the GET handler only returned
// a status snapshot, which silently broke the daily funnel cron for days.
// Do NOT revert GET to a read-only status endpoint — move status queries
// to a separate path if needed.
export async function POST() {
  console.log("\n[Funnel] Running funnel processor...\n");

  // Step 1: Run auto-resume check first (resumes funnels for silent prospects)
  let autoResumeResult = {
    checked: 0,
    resumed: [] as Array<{ prospectId: string; businessName: string; waitedHours: number }>,
    stillWaiting: 0,
    skipped: [] as Array<{ prospectId: string; reason: string }>,
  };

  try {
    autoResumeResult = await runAutoResumeCheck();
    if (autoResumeResult.resumed.length > 0) {
      console.log(`[Follow-Up Scheduler] Auto-resumed ${autoResumeResult.resumed.length} funnels:`);
      for (const resumed of autoResumeResult.resumed) {
        console.log(`  - ${resumed.businessName} (waited ${resumed.waitedHours}h)`);
      }
    }
  } catch (err) {
    console.error("[Follow-Up Scheduler] Auto-resume check failed:", err);
  }

  // Step 2: Run retries + normal funnel sends
  const result = await runDailyFunnel();

  console.log(
    `\n[Funnel] Complete: ${result.sent.length} delivered, ${result.queued.length} queued, ${result.paused.length} paused\n`
  );

  // Step 3: Send Ben the daily digest SMS with plan status
  try {
    const warming = await getWarmingStatus();

    let activeEnrollments: number | undefined;
    let approvedNotEnrolled: number | undefined;
    let pipelineProcessing: number | undefined;
    let prospectsPaid: number | undefined;

    if (isSupabaseConfigured()) {
      const [{ data: enrollRows }, { data: statusRows }] = await Promise.all([
        supabase.from("funnel_enrollments").select("prospect_id,paused,completed_at").limit(10000),
        supabase.from("prospects").select("id,status").limit(10000),
      ]);

      const enrolledIds = new Set((enrollRows || []).map((r) => r.prospect_id));
      activeEnrollments = (enrollRows || []).filter((r) => !r.paused && !r.completed_at).length;
      approvedNotEnrolled = (statusRows || []).filter(
        (r) => r.status === "approved" && !enrolledIds.has(r.id)
      ).length;
      pipelineProcessing = (statusRows || []).filter((r) => r.status === "generated").length;

      const today = new Date().toISOString().slice(0, 10);
      prospectsPaid = (statusRows || []).filter((r) => r.status === "paid").length;
      void today;
    }

    await sendDailyDigest({
      sentToday: result.sent.length,
      queuedToday: result.queued.length,
      pausedToday: result.paused.length,
      repliesToday: autoResumeResult.resumed.length,
      warmingEnabled: warming.enabled,
      warmingDay: warming.warmingDay,
      warmingLimit: warming.limitToday,
      // Pass both sender domains so the digest shows parallel warming state
      domains: warming.domains?.map((d) => ({
        domain: d.domain,
        enabled: d.enabled,
        warmingDay: d.warmingDay,
        limitToday: d.limitToday,
        sentToday: d.sentToday,
      })),
      activeEnrollments,
      approvedNotEnrolled,
      pipelineProcessing,
      prospectsPaid,
    });
  } catch (digestErr) {
    console.error("[Funnel] Daily digest failed:", digestErr);
  }

  return NextResponse.json({
    message: `Funnel run: ${result.sent.length} delivered, ${result.queued.length} queued, ${result.paused.length} paused. Auto-resumed: ${autoResumeResult.resumed.length}.`,
    ...result,
    autoResume: autoResumeResult,
  });
}

// GET: Runs the funnel processor (Vercel cron fires this via GET). Pass
// `?status=1` to get a read-only snapshot instead of running.
//
// Pre-2026-04-18: this was a status-only endpoint that only read a local
// JSON file. Vercel's serverless filesystem is read-only + the JSON file
// didn't exist, so GET returned empty and the cron did nothing. The
// active funnel cron now actually fires sends. See POST comment above.
export async function GET(request: NextRequest) {
  const isStatusOnly = request.nextUrl.searchParams.get("status") === "1";

  if (isStatusOnly) {
    const { FUNNEL_STEPS } = await import("@/lib/funnel-manager");

    // Read live enrollment state from Supabase rather than a local JSON
    // file — Vercel's filesystem is read-only. Falls back to empty list
    // when Supabase isn't configured.
    let enrollmentRows: Array<Record<string, unknown>> = [];
    if (isSupabaseConfigured()) {
      const { data } = await supabase
        .from("funnel_enrollments")
        .select("*")
        .limit(10000);
      enrollmentRows = (data || []) as Array<Record<string, unknown>>;
    }

    return NextResponse.json({
      total: enrollmentRows.length,
      active: enrollmentRows.filter((r) => !r.paused && !r.completed_at).length,
      paused: enrollmentRows.filter((r) => !!r.paused).length,
      completed: enrollmentRows.filter((r) => !!r.completed_at).length,
      steps: FUNNEL_STEPS,
    });
  }

  // Vercel cron path — actually run the funnel.
  return POST();
}
