import { NextRequest, NextResponse } from "next/server";
import { runDailyFunnel, enrollInFunnel } from "@/lib/funnel-manager";
import { runAutoResumeCheck } from "@/lib/followup-scheduler";
import { sendDailyDigest } from "@/lib/alerts";
import { getWarmingStatus } from "@/lib/domain-warming";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { updateProspect } from "@/lib/store";
import { logHeartbeat } from "@/lib/cron-heartbeat";

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
export async function POST(request?: NextRequest) {
  // When called via direct POST (not from our own GET handler), enforce the
  // same CRON_SECRET gate. GET already validates before delegating to POST.
  if (request) {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }
  console.log("\n[Funnel] Running funnel processor...\n");

  // Step 0: Auto-enroll approved prospects to fill today's warming capacity.
  // Per CLAUDE.md Rule 47, the cron MUST top up the funnel from the approved
  // pool BEFORE running the processor — otherwise sender-reputation runway
  // gets wasted while approved prospects sit idle. Enroll up to (combined
  // warming limit across both domains) MINUS (already-enrolled-not-yet-paused)
  // approved prospects so the day's pitch volume tracks capacity.
  let autoEnrollResult: {
    requested: number;
    enrolled: number;
    skipped: number;
    capacity: number;
    activeBefore: number;
  } = { requested: 0, enrolled: 0, skipped: 0, capacity: 0, activeBefore: 0 };

  try {
    if (isSupabaseConfigured()) {
      // Combined warming capacity across both sender domains
      const warmingForCap = await getWarmingStatus();
      const totalCapacity = (warmingForCap.domains || []).reduce(
        (sum, d) => sum + (d.enabled ? (d.limitToday || 0) : 0),
        warmingForCap.domains && warmingForCap.domains.length > 0
          ? 0
          : warmingForCap.enabled
            ? (warmingForCap.limitToday || 0)
            : 0
      );

      // Existing active (not-paused, not-completed) enrollments — these will
      // consume capacity today via the regular funnel processor.
      const { data: enrollRows } = await supabase
        .from("funnel_enrollments")
        .select("prospect_id,paused,completed_at")
        .limit(10000);
      const enrolledIds = new Set((enrollRows || []).map((r) => r.prospect_id as string));
      const activeEnrollments = (enrollRows || []).filter(
        (r) => !r.paused && !r.completed_at
      ).length;

      // Headroom = capacity - active enrollments. If active >= capacity, do nothing.
      const headroom = Math.max(0, totalCapacity - activeEnrollments);
      autoEnrollResult.capacity = totalCapacity;
      autoEnrollResult.activeBefore = activeEnrollments;
      autoEnrollResult.requested = headroom;

      if (headroom > 0) {
        // Pull the oldest approved-with-email prospects that aren't already enrolled.
        // Per CLAUDE.md Rule 49, manually-managed prospects (gifted sites,
        // custom builds, friends/family, hand-picked closes) MUST be excluded
        // from cold-outreach auto-enroll — they get the warm pitch from Ben
        // directly, not the templated funnel.
        const { data: candidates } = await supabase
          .from("prospects")
          .select("id, business_name, email, updated_at")
          .eq("status", "approved")
          .eq("manually_managed", false)
          .not("email", "is", null)
          .order("updated_at", { ascending: true })
          .limit(500);

        const pick = (candidates || [])
          .filter((p) => !enrolledIds.has(p.id as string))
          .slice(0, headroom);

        for (const p of pick) {
          const id = p.id as string;
          try {
            // Tag email-only — A2P 10DLC still pending, never SMS scouted prospects
            await updateProspect(id, {
              outreachChannel: "email-only",
              needsSmsFollowup: true,
            });
            const enroll = await enrollInFunnel(id);
            if (enroll.success) autoEnrollResult.enrolled++;
            else autoEnrollResult.skipped++;
          } catch (err) {
            console.error(`[Funnel] Auto-enroll failed for ${id}:`, err);
            autoEnrollResult.skipped++;
          }
        }

        if (autoEnrollResult.enrolled > 0) {
          console.log(
            `[Funnel] Auto-enrolled ${autoEnrollResult.enrolled}/${headroom} approved prospects (capacity ${totalCapacity}, active ${activeEnrollments})`
          );
        }
      }
    }
  } catch (err) {
    console.error("[Funnel] Auto-enroll step failed (continuing to processor):", err);
  }

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

  await logHeartbeat("funnel_run", {
    delivered: result.sent.length,
    queued: result.queued.length,
    paused: result.paused.length,
    autoResumed: autoResumeResult.resumed.length,
    autoEnrolled: autoEnrollResult.enrolled,
    autoEnrollSkipped: autoEnrollResult.skipped,
    capacity: autoEnrollResult.capacity,
  });

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
  // Vercel cron auth check. When CRON_SECRET is set in env, Vercel auto-adds
  // `Authorization: Bearer <secret>` to cron invocations. If the env var is
  // unset locally (dev), we skip this check so local tests still work.
  // IMPORTANT: This is a public-API route (see PUBLIC_API_PATHS in middleware),
  // so the CRON_SECRET is the ONLY gate preventing strangers from running the
  // funnel. Do not loosen.
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
