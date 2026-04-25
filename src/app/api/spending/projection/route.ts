/**
 * GET /api/spending/projection?siteCount=5000
 *
 * Returns projected monthly burn at the supplied target site count.
 * Used by the 5K-site projection slider on the spending dashboard.
 *
 * Response shape:
 *   {
 *     siteCount, recurring, variablePerSite, variableTotal, total,
 *     perSiteCost, marginAtFullPrice, paidCustomersToday,
 *     variableSampleDays, notes: string[]
 *   }
 *
 * Auth-gated via middleware (admin-only).
 */

import { NextRequest, NextResponse } from "next/server";
import { getProjectedMonthlyBurn } from "@/lib/recurring-costs";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const raw = url.searchParams.get("siteCount");
  const parsed = raw == null ? 100 : Number(raw);

  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 1_000_000) {
    return NextResponse.json(
      { error: "siteCount must be a non-negative number under 1,000,000" },
      { status: 400 }
    );
  }

  try {
    const projection = await getProjectedMonthlyBurn(parsed);
    return NextResponse.json(projection);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
