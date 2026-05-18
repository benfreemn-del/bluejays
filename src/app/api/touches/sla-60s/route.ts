/**
 * GET /api/touches/sla-60s
 *
 * Annie's 60-second SLA rolling 24-hour rate.
 * Returns: { total, hits, rate_pct }
 *
 * Powers the <SLA60SecondChip /> displayed on the operator dashboard.
 *
 * Operator-only — protected by middleware.
 */

import { NextResponse } from "next/server";
import { sla60SecondHitRate } from "@/lib/prospect-touches";

export async function GET() {
  const result = await sla60SecondHitRate();
  return NextResponse.json({ ok: true, ...result });
}
