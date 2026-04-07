import { NextResponse } from "next/server";
import { getAllProspects } from "@/lib/store";
import { getSystemCostEstimate } from "@/lib/cost-tracker";
import { getEmailHistory } from "@/lib/email-sender";
import { getSmsHistory } from "@/lib/sms";

export async function GET() {
  const prospects = await getAllProspects();

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
  });
}
