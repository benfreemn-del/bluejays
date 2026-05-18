import { NextRequest, NextResponse } from "next/server";

import { getConnection, listCampaigns } from "@/lib/amazon-ads";

/**
 * GET /api/clients/[slug]/amazon-ads
 *
 * Returns the connection status + campaigns for an indie author client's
 * Amazon Ads account. Returns null connection when API isn't connected
 * yet — the UI tile renders mock-preview mode in that case.
 *
 * Admin-only via /api/clients/* middleware.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const connection = await getConnection(slug);
  const campaigns = connection?.profile_id ? await listCampaigns(slug) : [];
  return NextResponse.json({ ok: true, connection, campaigns });
}
