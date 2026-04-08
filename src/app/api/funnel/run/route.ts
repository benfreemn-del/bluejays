import { NextResponse } from "next/server";
import { runDailyFunnel } from "@/lib/funnel-manager";
import { runAutoResumeCheck } from "@/lib/followup-scheduler";

// POST: Run the daily funnel — sends next step to all due prospects
// Also runs the follow-up scheduler auto-resume check
// This should be called by a cron job daily
export async function POST() {
  console.log("\n[Funnel] Running daily funnel check...\n");

  // Step 1: Run auto-resume check first (resumes funnels for silent prospects)
  let autoResumeResult = { checked: 0, resumed: [] as Array<{ prospectId: string; businessName: string; waitedHours: number }>, stillWaiting: 0, skipped: [] as Array<{ prospectId: string; reason: string }> };
  try {
    autoResumeResult = await runAutoResumeCheck();
    if (autoResumeResult.resumed.length > 0) {
      console.log(`[Follow-Up Scheduler] Auto-resumed ${autoResumeResult.resumed.length} funnels:`);
      for (const r of autoResumeResult.resumed) {
        console.log(`  - ${r.businessName} (waited ${r.waitedHours}h)`);
      }
    }
  } catch (err) {
    console.error("[Follow-Up Scheduler] Auto-resume check failed:", err);
  }

  // Step 2: Run the daily funnel (sends next step to all due prospects)
  const result = await runDailyFunnel();

  console.log(`\n[Funnel] Complete: ${result.sent.length} messages sent, ${result.paused.length} paused\n`);

  return NextResponse.json({
    message: `Daily funnel: ${result.sent.length} sent, ${result.paused.length} paused. Auto-resumed: ${autoResumeResult.resumed.length}.`,
    ...result,
    autoResume: autoResumeResult,
  });
}

// GET: Check funnel status without sending anything
export async function GET() {
  const { getAllEnrollments, FUNNEL_STEPS } = await import("@/lib/funnel-manager");
  const enrollments = getAllEnrollments();

  return NextResponse.json({
    enrollments: enrollments.map((e) => ({
      ...e,
      currentStepLabel: FUNNEL_STEPS[e.currentStep]?.label || "Complete",
      nextStepLabel: FUNNEL_STEPS[e.currentStep + 1]?.label || "Done",
      nextStepDay: FUNNEL_STEPS[e.currentStep + 1]?.day || null,
    })),
    total: enrollments.length,
    active: enrollments.filter((e) => !e.paused && !e.completedAt).length,
    paused: enrollments.filter((e) => e.paused).length,
    completed: enrollments.filter((e) => e.completedAt).length,
    steps: FUNNEL_STEPS,
  });
}
