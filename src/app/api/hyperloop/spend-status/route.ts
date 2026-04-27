import { NextRequest, NextResponse } from "next/server";
import { getWeeklySpendStatus } from "@/lib/hyperloop-spend";

/**
 * GET /api/hyperloop/spend-status
 *
 * Returns the rolling 7-day platform spend snapshot for the
 * /dashboard/hyperloop spend-cap tile. Same data the Hyperloop cron
 * uses for its circuit-breaker check (Rule 63 weekly cap).
 *
 * Auth: protected by the dashboard middleware (admin-only). Not in
 * PUBLIC_API_PATHS. The Hyperloop cron itself doesn't hit this
 * endpoint — it calls `getWeeklySpendStatus()` directly.
 *
 * Response shape: see `SpendStatus` in `src/lib/hyperloop-spend.ts`.
 */

export const dynamic = "force-dynamic";
// Worst case: Meta + Google each 5s timeout in parallel = ~5s.
export const maxDuration = 30;

export async function GET(_req: NextRequest) {
  const status = await getWeeklySpendStatus();
  return NextResponse.json(status);
}
