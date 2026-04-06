import { NextRequest, NextResponse } from "next/server";
import { getAllProspects, filterProspects } from "@/lib/store";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const category = searchParams.get("category") || undefined;
  const status = searchParams.get("status") || undefined;
  const city = searchParams.get("city") || undefined;

  const prospects =
    category || status || city
      ? await filterProspects({ category, status, city })
      : await getAllProspects();

  return NextResponse.json({ prospects, total: prospects.length });
}
