import { NextResponse } from "next/server";
import { getAllProspects } from "@/lib/store";

// Returns real social proof data for the ticker on preview sites
export async function GET() {
  const prospects = await getAllProspects();
  const generated = prospects.filter((p) => p.generatedSiteUrl).length;
  const paid = prospects.filter((p) => p.status === "paid").length;

  // Group by city for localized social proof
  const cityCounts: Record<string, number> = {};
  for (const p of prospects) {
    const city = p.city || "your area";
    cityCounts[city] = (cityCounts[city] || 0) + 1;
  }

  return NextResponse.json({
    totalGenerated: generated,
    totalPaid: paid,
    cityCounts,
    message: `${generated} businesses upgraded their website this month`,
  });
}
