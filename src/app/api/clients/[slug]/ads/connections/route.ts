import { NextRequest, NextResponse } from "next/server";
import { ownerFromCookie } from "@/lib/client-auth";
import {
  listAdAccounts,
  getProvisioningStatus,
  type AdPlatformOAuth,
} from "@/lib/ad-oauth";

/**
 * GET /api/clients/[slug]/ads/connections
 *
 * Returns the tenant's ad-platform connection state. Drives the
 * Connect / Connected / Reconnect button states on the AdsTab
 * platform cards.
 */

const PLATFORMS: AdPlatformOAuth[] = ["google_ads", "meta_ads", "lob"];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const cookie = request.cookies.get("client-portal-session")?.value;
  const owner = await ownerFromCookie(cookie);
  if (!owner || owner.client_slug !== slug) {
    return NextResponse.json(
      { ok: false, error: "unauthorized" },
      { status: 401 },
    );
  }

  const accounts = await listAdAccounts(slug);
  const provisioning = PLATFORMS.map((p) => getProvisioningStatus(p));

  return NextResponse.json({
    ok: true,
    accounts,
    provisioning,
  });
}
