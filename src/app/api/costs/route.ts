import { NextResponse } from "next/server";
import { getAllProspects } from "@/lib/store";
import { getSystemCostEstimate } from "@/lib/cost-tracker";
import { getCostData } from "@/lib/cost-logger";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

/**
 * GET /api/costs
 *
 * Returns cost data for the spending dashboard. Attempts to pull real cost
 * data from the system_costs table first. Falls back to the legacy
 * estimate-based system if real data is unavailable or empty.
 *
 * PERF NOTE (2026-04-29 fix):
 * The original implementation iterated `for (const p of prospects)` and
 * called `getEmailHistory(p.id)` + `getSmsHistory(p.id)` in series — that
 * was 2 round-trips per prospect, scaling to 30+ second response times
 * once the CRM grew past ~500 prospects. Replaced with a single COUNT
 * query per table. Total queries: 4 (prospects + email count + sms count
 * + system_costs aggregation), all O(1) regardless of prospect volume.
 */
export async function GET() {
  const prospects = await getAllProspects();

  // Try to get real cost data from system_costs table
  const realCosts = await getCostData();
  const hasRealData = realCosts.thisMonth.total > 0;

  // Fast path: COUNT instead of fetching every prospect's full
  // email/sms history. With 1000 prospects + 30 emails each, the
  // previous loop fired 2000 round-trips. This fires 2.
  let totalEmails = 0;
  let totalSms = 0;
  if (isSupabaseConfigured()) {
    try {
      const [emailRes, smsRes] = await Promise.all([
        supabase
          .from("emails")
          .select("*", { count: "exact", head: true }),
        supabase
          .from("sms_messages")
          .select("*", { count: "exact", head: true }),
      ]);
      totalEmails = emailRes.count ?? 0;
      totalSms = smsRes.count ?? 0;
    } catch (err) {
      // Non-fatal — leave at 0 and let estimate fall back gracefully.
      console.error("[/api/costs] count query failed:", err);
    }
  }

  const systemCost = getSystemCostEstimate(prospects.length, totalEmails, totalSms);
  const paid = prospects.filter((p) => p.status === "paid").length;

  return NextResponse.json({
    // Legacy fields (for backward compatibility with existing spending page)
    ...systemCost,
    paidCustomers: paid,
    revenue: paid * 997,
    profit: paid * 997 - systemCost.totalEstimatedCost,

    // Real cost data from system_costs table
    realCosts: hasRealData ? realCosts : null,

    // Summary: prefer real data when available
    actualSpend: hasRealData ? {
      today: realCosts.today,
      thisWeek: realCosts.thisWeek,
      thisMonth: realCosts.thisMonth,
      perLeadAverage: realCosts.perLeadAverage,
      topCostLeads: realCosts.topCostLeads,
      projectedMonthly: realCosts.projectedMonthly,
    } : null,
  });
}
