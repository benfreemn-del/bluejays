import { NextResponse } from "next/server";
import { getProspect, updateProspect } from "@/lib/store";
import { getAllDmSequence, getInstagramSearchUrl } from "@/lib/instagram-dm";
import { getInstagramOutreachData } from "@/lib/instagram-outreach";

/**
 * GET /api/instagram/[id]
 *
 * Returns Instagram outreach data for a prospect including:
 * - Legacy DM sequence (3 messages)
 * - New comprehensive outreach templates (7 funnel-aligned DMs)
 * - Instagram handle and profile/search URLs
 * - DM history
 */
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

  // Legacy DM sequence (backward compatible)
  const dms = getAllDmSequence(prospect);
  const searchUrl = getInstagramSearchUrl(prospect.businessName);
  const instagramHandle =
    prospect.instagramHandle
    || prospect.scrapedData?.socialLinks?.instagram
    || null;

  // New comprehensive outreach data
  const outreachData = getInstagramOutreachData(prospect);

  return NextResponse.json({
    businessName: prospect.businessName,
    instagramHandle,
    instagramSearchUrl: searchUrl,
    instagramProfileUrl: outreachData.instagramProfileUrl,
    dms,
    // New outreach module data
    outreach: outreachData,
  });
}

/**
 * PATCH /api/instagram/[id]
 *
 * Update a prospect's Instagram handle.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const prospect = await getProspect(id);
  if (!prospect) {
    return NextResponse.json(
      { error: "Prospect not found" },
      { status: 404 }
    );
  }

  if (body.instagramHandle !== undefined) {
    const updated = await updateProspect(id, {
      instagramHandle: body.instagramHandle,
    });
    return NextResponse.json({
      success: true,
      instagramHandle: updated?.instagramHandle,
    });
  }

  return NextResponse.json({ error: "No updates provided" }, { status: 400 });
}
