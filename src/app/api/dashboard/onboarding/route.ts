import { NextResponse } from "next/server";
import { listOnboardingForOperator } from "@/lib/client-onboarding";

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
    const rows = await listOnboardingForOperator();
    return NextResponse.json({ ok: true, rows });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: (e as Error).message },
      { status: 500 },
    );
  }
}
