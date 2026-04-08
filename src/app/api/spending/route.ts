import { NextResponse } from "next/server";
import { getAllProspects } from "@/lib/store";
import { getSystemCostEstimate } from "@/lib/cost-tracker";
import { getEmailHistory } from "@/lib/email-sender";
import { getSmsHistory } from "@/lib/sms";
import { getCostData } from "@/lib/cost-logger";

/**
 * GET /api/spending
 *
 * Alias for /api/costs — returns cost and spending data for the dashboard.
 */
export async function GET() {
  const prospects = await getAllProspects();

  const realCosts = await getCostData();
  const hasRealData = realCosts.thisMonth.total > 0;

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
    ...systemCost,
    paidCustomers: paid,
    revenue: paid * 997,
    profit: paid * 997 - systemCost.totalEstimatedCost,
    realCosts: hasRealData ? realCosts : null,
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
