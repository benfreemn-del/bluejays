import { NextResponse } from "next/server";
import {
  listOnboardingForOperator,
  syncOnboardingFromPipeline,
} from "@/lib/client-onboarding";

/**
 * GET /api/dashboard/onboarding
 *
 * Operator-side list of every client_onboarding row. Used by the
 * /dashboard/onboarding page to surface "who is in the middle of
 * signing up, and who's ready to launch."
 *
 * Auth: this lives under /dashboard which is owner-gated upstream by
 * the dashboard middleware.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Pull post-sale clients from the pipeline into onboarding so the
    // operator never has to manually seed a row. Best-effort — a sync
    // failure shouldn't block the list render.
    let seeded: string[] = [];
    try {
      const r = await syncOnboardingFromPipeline();
      seeded = r.seeded;
    } catch (e) {
      console.error("[dashboard/onboarding] sync failed:", (e as Error).message);
    }
    const rows = await listOnboardingForOperator();
    return NextResponse.json({ ok: true, rows, seeded });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: (e as Error).message },
      { status: 500 },
    );
  }
}
