import { NextResponse } from "next/server";
import { runDailyFunnel } from "@/lib/funnel-manager";
import { runAutoResumeCheck } from "@/lib/followup-scheduler";

// POST: Run the funnel processor — handles due retries first, then next due steps
// Also runs the follow-up scheduler auto-resume check
// This route can be called on a schedule as often as needed
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

  return NextResponse.json({
    message: `Funnel run: ${result.sent.length} delivered, ${result.queued.length} queued, ${result.paused.length} paused. Auto-resumed: ${autoResumeResult.resumed.length}.`,
    ...result,
    autoResume: autoResumeResult,
  });
}

// GET: Check funnel status without sending anything
export async function GET() {
  const { getAllEnrollments, FUNNEL_STEPS } = await import("@/lib/funnel-manager");
  const enrollments = getAllEnrollments();

  return NextResponse.json({
    enrollments: enrollments.map((enrollment) => ({
      ...enrollment,
      currentStepLabel:
        enrollment.currentStep < 0
          ? "Queued for first delivery"
          : FUNNEL_STEPS[enrollment.currentStep]?.label || "Complete",
      nextStepLabel: FUNNEL_STEPS[enrollment.currentStep + 1]?.label || "Done",
      nextStepDay: FUNNEL_STEPS[enrollment.currentStep + 1]?.day || null,
    })),
    total: enrollments.length,
    active: enrollments.filter((enrollment) => !enrollment.paused && !enrollment.completedAt).length,
    paused: enrollments.filter((enrollment) => enrollment.paused).length,
    completed: enrollments.filter((enrollment) => enrollment.completedAt).length,
    steps: FUNNEL_STEPS,
  });
}
