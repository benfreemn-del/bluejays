import { NextResponse } from "next/server";
import { getProspect } from "@/lib/store";
import { getAllDmSequence, getInstagramSearchUrl } from "@/lib/instagram-dm";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const prospect = await getProspect(id);
  if (!prospect) {
    return NextResponse.json(
      { error: "Prospect not found" },
      { status: 404 }
    );
  }

  if (!prospect.generatedSiteUrl) {
    return NextResponse.json(
      { error: "No preview site generated yet" },
      { status: 400 }
    );
  }

  const dms = getAllDmSequence(prospect);
  const searchUrl = getInstagramSearchUrl(prospect.businessName);
  const instagramHandle =
    prospect.scrapedData?.socialLinks?.instagram || null;

  return NextResponse.json({
    businessName: prospect.businessName,
    instagramHandle,
    instagramSearchUrl: searchUrl,
    instagramProfileUrl: instagramHandle || null,
    dms,
  });
}
