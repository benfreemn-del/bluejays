import { NextRequest, NextResponse } from "next/server";
import { ownerFromCookie } from "@/lib/client-auth";
import { getAuthUrl, type AdPlatformOAuth } from "@/lib/ad-oauth";
import {
  getCalendarAuthUrl,
  type CalendarProvider,
} from "@/lib/calendar";

/**
 * GET /api/oauth/{platform}/start
 *
 * Unified OAuth init for ad accounts AND calendar providers. Verifies
 * the caller's portal cookie, then redirects to the right provider's
 * OAuth consent screen with a signed `state` parameter.
 *
 * Ad platforms: google_ads | meta_ads | lob (Lob = API key, not OAuth)
 * Calendar providers: google_calendar | calendly | cal_com (Cal.com = API key)
 */

const AD_PLATFORMS = new Set<AdPlatformOAuth>(["google_ads", "meta_ads", "lob"]);
const CALENDAR_PROVIDERS = new Set<CalendarProvider>([
  "google_calendar",
  "calendly",
  "cal_com",
]);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ platform: string }> },
) {
  const { platform } = await params;
  const isAd = AD_PLATFORMS.has(platform as AdPlatformOAuth);
  const isCal = CALENDAR_PROVIDERS.has(platform as CalendarProvider);
  if (!isAd && !isCal) {
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
  const result = isAd
    ? getAuthUrl(owner.client_slug, platform as AdPlatformOAuth)
    : getCalendarAuthUrl(owner.client_slug, platform as CalendarProvider);
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 422 });
  }
  return NextResponse.redirect(result.url);
}
