import { NextResponse } from "next/server";
import { getAllProspects } from "@/lib/store";

export async function GET() {
  const prospects = await getAllProspects();

  // Group by city (county proxy)
  const counties: Record<string, {
    scouted: number;
    contacted: number;
    responded: number;
    paid: number;
    dismissed: number;
    revenue: number;
    conversionRate: number;
    categories: string[];
  }> = {};

  for (const p of prospects) {
    const county = p.city || "Unknown";
    if (!counties[county]) {
      counties[county] = { scouted: 0, contacted: 0, responded: 0, paid: 0, dismissed: 0, revenue: 0, conversionRate: 0, categories: [] };
    }
    counties[county].scouted++;
    if (["contacted", "responded", "paid"].includes(p.status)) counties[county].contacted++;
    if (["responded", "paid"].includes(p.status)) counties[county].responded++;
    if (p.status === "paid") { counties[county].paid++; counties[county].revenue += 997; }
    if (p.status === "dismissed") counties[county].dismissed++;
    if (!counties[county].categories.includes(p.category)) counties[county].categories.push(p.category);
  }

  // Calculate conversion rates and sort by revenue
  const leaderboard = Object.entries(counties)
    .map(([name, data]) => ({
      county: name,
      ...data,
      conversionRate: data.scouted > 0 ? Math.round((data.paid / data.scouted) * 1000) / 10 : 0,
      conquestPercent: data.scouted > 0 ? Math.round(((data.paid + data.contacted + data.responded) / data.scouted) * 100) : 0,
    }))
    .sort((a, b) => b.revenue - a.revenue || b.scouted - a.scouted);

  return NextResponse.json({
    leaderboard,
    totalCounties: leaderboard.length,
    totalRevenue: leaderboard.reduce((sum, c) => sum + c.revenue, 0),
    topCounty: leaderboard[0]?.county || "None yet",
  });
}
