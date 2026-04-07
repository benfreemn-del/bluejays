import { NextResponse } from "next/server";
import { getAllProspects } from "@/lib/store";

export async function GET() {
  const prospects = await getAllProspects();
  const now = Date.now();

  // Calculate pipeline velocity metrics
  const contacted = prospects.filter((p) => ["contacted", "responded", "paid"].includes(p.status));
  const responded = prospects.filter((p) => ["responded", "paid"].includes(p.status));
  const paid = prospects.filter((p) => p.status === "paid");
  const dismissed = prospects.filter((p) => p.status === "dismissed");

  // Average days per stage
  const avgDaysToContact = calculateAvgDays(prospects, "scouted", "contacted");
  const avgDaysToResponse = calculateAvgDays(prospects, "contacted", "responded");
  const avgDaysToSale = calculateAvgDays(prospects, "responded", "paid");

  // Conversion rates
  const scoutToContact = prospects.length > 0 ? (contacted.length / prospects.length * 100) : 0;
  const contactToResponse = contacted.length > 0 ? (responded.length / contacted.length * 100) : 0;
  const responseToSale = responded.length > 0 ? (paid.length / responded.length * 100) : 0;
  const overallConversion = prospects.length > 0 ? (paid.length / prospects.length * 100) : 0;

  // Funnel stages
  const funnel = [
    { stage: "Scouted", count: prospects.length, color: "#6b7280" },
    { stage: "Generated", count: prospects.filter((p) => p.generatedSiteUrl).length, color: "#eab308" },
    { stage: "Contacted", count: contacted.length, color: "#f97316" },
    { stage: "Responded", count: responded.length, color: "#22c55e" },
    { stage: "Paid", count: paid.length, color: "#f59e0b" },
    { stage: "Dismissed", count: dismissed.length, color: "#ef4444" },
  ];

  // Stuck leads (contacted but no response in 7+ days)
  const stuckLeads = prospects.filter((p) => {
    if (p.status !== "contacted") return false;
    const daysSince = (now - new Date(p.updatedAt).getTime()) / (1000 * 60 * 60 * 24);
    return daysSince > 7;
  }).length;

  return NextResponse.json({
    funnel,
    velocity: {
      avgDaysToContact: Math.round(avgDaysToContact * 10) / 10,
      avgDaysToResponse: Math.round(avgDaysToResponse * 10) / 10,
      avgDaysToSale: Math.round(avgDaysToSale * 10) / 10,
    },
    conversions: {
      scoutToContact: Math.round(scoutToContact * 10) / 10,
      contactToResponse: Math.round(contactToResponse * 10) / 10,
      responseToSale: Math.round(responseToSale * 10) / 10,
      overall: Math.round(overallConversion * 10) / 10,
    },
    stuckLeads,
    totalRevenue: paid.length * 997,
    projectedRevenue: responded.length * 997 * 0.5, // 50% close rate assumption
  });
}

function calculateAvgDays(prospects: { createdAt: string; updatedAt: string; status: string }[], _fromStatus: string, _toStatus: string): number {
  // Simplified: use created vs updated as proxy
  const relevant = prospects.filter((p) => p.status !== "scouted" && p.status !== "dismissed");
  if (relevant.length === 0) return 0;
  const totalDays = relevant.reduce((sum, p) => {
    return sum + (new Date(p.updatedAt).getTime() - new Date(p.createdAt).getTime()) / (1000 * 60 * 60 * 24);
  }, 0);
  return totalDays / relevant.length;
}
