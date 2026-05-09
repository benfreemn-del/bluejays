import { NextRequest, NextResponse } from "next/server";
import { ownerFromCookie } from "@/lib/client-auth";
import { getAuthUrl, type AdPlatformOAuth } from "@/lib/ad-oauth";

/**
 * GET /api/oauth/{platform}/start
 *
 * Owner-portal-initiated OAuth handshake. Verifies the caller's portal
 * cookie matches their client_slug, then redirects to the platform's
 * OAuth consent screen with a signed `state` parameter carrying their
 * slug.
 *
 * Platform = google_ads | meta_ads | lob (Lob doesn't OAuth — returns
 * a clear error pointing at LOB_API_KEY env var).
 */

const VALID_PLATFORMS = new Set<AdPlatformOAuth>(["google_ads", "meta_ads", "lob"]);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ platform: string }> },
) {
  const { platform } = await params;
  if (!VALID_PLATFORMS.has(platform as AdPlatformOAuth)) {
    return NextResponse.json(
      { ok: false, error: "unknown platform" },
      { status: 400 },
    );
  }
  const cookie = request.cookies.get("client-portal-session")?.value;
  const owner = await ownerFromCookie(cookie);
  if (!owner) {
    return NextResponse.json(
      { ok: false, error: "unauthorized" },
      { status: 401 },
    );
  }
  const result = getAuthUrl(owner.client_slug, platform as AdPlatformOAuth);
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 422 });
  }
  return NextResponse.redirect(result.url);
}
