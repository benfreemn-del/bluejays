import { NextResponse } from "next/server";
import { getProspect } from "@/lib/store";
import type { Prospect } from "@/lib/types";

/**
 * GET /api/claim/[id] — PUBLIC endpoint for the claim page.
 *
 * Returns ONLY the fields the claim page needs to render. Private fields
 * (phone, email, adminNotes, quality scores, funnel state, etc.) are never
 * exposed here.
 *
 * Registered in middleware.ts as a PUBLIC_API_PATH so real prospects arriving
 * from outreach links can load the claim page without an auth cookie.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const prospect = await getProspect(id);
  if (!prospect) {
    return NextResponse.json({ error: "Prospect not found" }, { status: 404 });
  }

  // Whitelist of claim-safe fields. Anything not in this shape is private.
  const safe: Partial<Prospect> = {
    id: prospect.id,
    businessName: prospect.businessName,
    category: prospect.category,
    city: prospect.city,
    state: prospect.state,
    currentWebsite: prospect.currentWebsite,
    googleRating: prospect.googleRating,
    reviewCount: prospect.reviewCount,
    generatedSiteUrl: prospect.generatedSiteUrl,
    pricingTier: prospect.pricingTier,
    status: prospect.status,
    scrapedData: prospect.scrapedData,
  };

  return NextResponse.json(safe);
}
