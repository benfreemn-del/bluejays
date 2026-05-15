import { NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

/**
 * GET /api/dashboard/calculator-stats
 *
 * Powers the Overview tile that surfaces /cut-my-agency calculator
 * activity. Reads from `calculator_runs` (created 2026-05-16 per
 * Hormozi backend review item A1).
 *
 * Returns rolling-7-day totals + conversion rate + avg savings est +
 * top industries. Cheap query — 7 days of rows is small.
 *
 * Auth: covered by /api middleware (admin-password cookie).
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Row = {
  industry: string | null;
  savings_cents: number | null;
  converted_to_lead: boolean;
  ran_at: string;
};

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      ok: true,
      runsThisWeek: 0,
      conversionsThisWeek: 0,
      conversionRate: 0,
      avgSavingsCents: 0,
      topIndustries: [],
      configured: false,
    });
  }

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from("calculator_runs")
    .select("industry, savings_cents, converted_to_lead, ran_at")
    .gte("ran_at", sevenDaysAgo);

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  const rows = (data || []) as Row[];
  const runsThisWeek = rows.length;
  const conversionsThisWeek = rows.filter((r) => r.converted_to_lead).length;
  const conversionRate = runsThisWeek > 0 ? conversionsThisWeek / runsThisWeek : 0;

  const savingsValues = rows
    .map((r) => r.savings_cents)
    .filter((v): v is number => typeof v === "number" && v > 0);
  const avgSavingsCents =
    savingsValues.length > 0
      ? Math.round(savingsValues.reduce((s, v) => s + v, 0) / savingsValues.length)
      : 0;

  // Industry breakdown — top 3
  const industryCounts = new Map<string, number>();
  for (const r of rows) {
    if (!r.industry) continue;
    industryCounts.set(r.industry, (industryCounts.get(r.industry) || 0) + 1);
  }
  const topIndustries = Array.from(industryCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([industry, count]) => ({ industry, count }));

  return NextResponse.json({
    ok: true,
    runsThisWeek,
    conversionsThisWeek,
    conversionRate,
    avgSavingsCents,
    topIndustries,
    configured: true,
  });
}
