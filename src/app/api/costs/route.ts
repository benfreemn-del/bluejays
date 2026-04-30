import { NextResponse } from "next/server";
import { getSystemCostEstimate } from "@/lib/cost-tracker";
import { getCostData } from "@/lib/cost-logger";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

/**
 * GET /api/costs
 *
 * Cost data for the spending dashboard.
 *
 * PERF NOTES (2026-04-29):
 * v1: per-prospect getEmailHistory + getSmsHistory loops → 30+ seconds.
 * v2: COUNT queries on emails + sms_messages → ~14s. Still slow because
 *     getAllProspects() pulls EVERY column for EVERY prospect (incl.
 *     bulky scraped_data JSONB).
 * v3 (this version): replaced getAllProspects() with two count queries
 *     too. The endpoint only needs prospect.length + paid count — never
 *     the actual rows. Total queries: 4 cheap COUNTs in parallel.
 *     Expected: <1s.
 */
export async function GET() {
  // Default response shape used when Supabase isn't configured
  const empty = {
    totalEmailsSent: 0,
    totalSmsSent: 0,
    totalLeads: 0,
    estimatedEmailCost: 0,
    estimatedSmsCost: 0,
    estimatedAiCost: 0,
    estimatedInfraCost: 0,
    totalEstimatedCost: 0,
    costPerLead: 0,
    revenuePerSale: 997,
    breakEvenLeads: 0,
    paidCustomers: 0,
    revenue: 0,
    profit: 0,
    realCosts: null as ReturnType<typeof getCostData> | null,
    actualSpend: null as null | {
      today: { total: number; byService: Record<string, number> };
      thisWeek: { total: number; byService: Record<string, number> };
      thisMonth: { total: number; byService: Record<string, number> };
      perLeadAverage: number;
      topCostLeads: Array<{ prospectId: string; businessName: string; totalCost: number }>;
      projectedMonthly: number;
    },
  };

  if (!isSupabaseConfigured()) return NextResponse.json(empty);

  // Fire all four lookups in parallel — no point waiting serially.
  // Each is a cheap COUNT(head:true) that returns 0 bytes of payload
  // OR an aggregated cost-logger call.
  let totalProspects = 0;
  let paidCount = 0;
  let totalEmails = 0;
  let totalSms = 0;
  let realCosts;
  try {
    const [prospectRes, paidRes, emailRes, smsRes, costRes] = await Promise.all([
      supabase.from("prospects").select("*", { count: "exact", head: true }),
      supabase.from("prospects").select("*", { count: "exact", head: true }).eq("status", "paid"),
      supabase.from("emails").select("*", { count: "exact", head: true }),
      supabase.from("sms_messages").select("*", { count: "exact", head: true }),
      getCostData(),
    ]);
    totalProspects = prospectRes.count ?? 0;
    paidCount = paidRes.count ?? 0;
    totalEmails = emailRes.count ?? 0;
    totalSms = smsRes.count ?? 0;
    realCosts = costRes;
  } catch (err) {
    console.error("[/api/costs] aggregate failed:", err);
    return NextResponse.json(empty);
  }

  const hasRealData = realCosts.thisMonth.total > 0;
  const systemCost = getSystemCostEstimate(totalProspects, totalEmails, totalSms);

  return NextResponse.json({
    // Legacy fields (for backward compatibility with existing spending page)
    ...systemCost,
    paidCustomers: paidCount,
    revenue: paidCount * 997,
    profit: paidCount * 997 - systemCost.totalEstimatedCost,

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
