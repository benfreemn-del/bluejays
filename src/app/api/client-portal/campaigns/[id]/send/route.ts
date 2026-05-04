import { NextRequest, NextResponse } from "next/server";
import { CLIENT_PORTAL_COOKIE, ownerFromCookie } from "@/lib/client-auth";
import { sendCampaign } from "@/lib/client-campaigns";

/**
 * POST /api/client-portal/campaigns/[id]/send
 *
 * Fan out the campaign — materialize recipients, render merge tags,
 * insert client_email_sends rows, hit SendGrid per-row, update
 * aggregates. Sequential for now (low volume).
 *
 * Only callable while the campaign is in `draft` or `scheduled` status.
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!UUID_RE.test(id)) {
    return NextResponse.json({ ok: false, error: "Invalid id" }, { status: 400 });
  }
  const cookie = req.cookies.get(CLIENT_PORTAL_COOKIE)?.value;
  const owner = await ownerFromCookie(cookie);
  if (!owner) {
    return NextResponse.json({ ok: false, error: "Not signed in" }, { status: 401 });
  }
  try {
    const result = await sendCampaign({
      id,
      clientSlug: owner.client_slug,
      fromName: owner.client_slug === "zenith-sports" ? "TEKKY" : "BlueJays",
    });
    return NextResponse.json({ ...result, ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown";
    return NextResponse.json(
      { ok: false, error: msg },
      { status: msg.includes("not found") || msg.includes("already") ? 400 : 500 },
    );
  }
}
