import { NextResponse } from "next/server";
import { runDailyFunnel } from "@/lib/funnel-manager";

// POST: Run the daily funnel — sends next step to all due prospects
// This should be called by a cron job daily
export async function POST() {
  console.log("\n🔄 Running daily funnel check...\n");

  const result = await runDailyFunnel();

  console.log(`\n✅ Funnel complete: ${result.sent.length} messages sent, ${result.paused.length} paused\n`);

  return NextResponse.json({
    message: `Daily funnel: ${result.sent.length} sent, ${result.paused.length} paused`,
    ...result,
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
