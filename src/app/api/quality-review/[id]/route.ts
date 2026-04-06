import { NextResponse } from "next/server";
import { getProspect, getScrapedData } from "@/lib/store";
import { reviewSiteQuality, formatQualityReport } from "@/lib/quality-review";
import type { GeneratedSiteData } from "@/lib/generator";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const prospect = await getProspect(id);
  if (!prospect) {
    return NextResponse.json({ error: "Prospect not found" }, { status: 404 });
  }

  const siteData = (await getScrapedData(id)) as GeneratedSiteData | null;
  if (!siteData) {
    return NextResponse.json({ error: "No generated site data" }, { status: 400 });
  }

  const report = reviewSiteQuality(prospect, siteData);

  return NextResponse.json({
    ...report,
    formatted: formatQualityReport(report),
  });
}
