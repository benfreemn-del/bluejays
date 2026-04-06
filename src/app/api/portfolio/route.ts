import { NextResponse } from "next/server";
import { getAllProspects } from "@/lib/store";
import { CATEGORY_CONFIG } from "@/lib/types";

export async function GET() {
  const prospects = await getAllProspects();

  // Get all prospects with generated sites (for the portfolio grid)
  const sites = prospects
    .filter((p) => p.generatedSiteUrl)
    .map((p) => ({
      id: p.id,
      name: p.businessName,
      category: CATEGORY_CONFIG[p.category]?.label || p.category,
      href: p.generatedSiteUrl!,
      color: CATEGORY_CONFIG[p.category]?.heroGradient
        .match(/#[0-9a-f]{6}/i)?.[0] || "#1a2744",
      isPaid: p.status === "paid",
    }));

  return NextResponse.json({ sites });
}
