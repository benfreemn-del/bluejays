import { NextRequest, NextResponse } from "next/server";
import { CLIENT_PORTAL_COOKIE, ownerFromCookie } from "@/lib/client-auth";
import { listClientSubscriptions } from "@/lib/client-subscriptions";

/**
 * GET /api/client-portal/subscriptions
 * Returns the logged-in owner's client_slug subscriptions (read-only).
 * Owners can SEE their plan but can't change tiers from here — they
 * email Ben to upgrade/downgrade. Keeps billing flow human.
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const cookie = req.cookies.get(CLIENT_PORTAL_COOKIE)?.value;
  const owner = await ownerFromCookie(cookie);
  if (!owner) {
    return NextResponse.json(
      { ok: false, error: "Not signed in" },
      { status: 401 },
    );
  }
  try {
    const subs = await listClientSubscriptions(owner.client_slug);
    return NextResponse.json({ ok: true, subscriptions: subs });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "unknown" },
      { status: 500 },
    );
  }
}
