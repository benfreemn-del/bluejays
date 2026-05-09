import { NextRequest, NextResponse } from "next/server";
import { ownerFromCookie } from "@/lib/client-auth";
import { getCalendarOnboardingState } from "@/lib/calendar";

/**
 * GET /api/clients/[slug]/calendar/onboarding-state
 *
 * Owner-only. Returns whether the tenant needs to see the
 * CalendarSetupBanner (slot-count + connected-account snapshot).
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
  const state = await getCalendarOnboardingState(slug);
  return NextResponse.json({ ok: true, state });
}
