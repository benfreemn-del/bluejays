import { NextResponse } from "next/server";
import { getAllProspects } from "@/lib/store";
import { getSystemCostEstimate } from "@/lib/cost-tracker";
import { getEmailHistory } from "@/lib/email-sender";
import { getSmsHistory } from "@/lib/sms";
import { getCostData } from "@/lib/cost-logger";

/**
 * GET /api/costs
 *
 * Returns cost data for the spending dashboard. Attempts to pull real cost
 * data from the system_costs table first. Falls back to the legacy
 * estimate-based system if real data is unavailable or empty.
 */
export async function GET() {
  const prospects = await getAllProspects();

  // Try to get real cost data from system_costs table
  const realCosts = await getCostData();
  const hasRealData = realCosts.thisMonth.total > 0;

  // Always compute legacy estimates as fallback / comparison
  let totalEmails = 0;
  let totalSms = 0;

  for (const p of prospects) {
    const emails = await getEmailHistory(p.id);
    const sms = await getSmsHistory(p.id);
    totalEmails += emails.length;
    totalSms += sms.length;
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
