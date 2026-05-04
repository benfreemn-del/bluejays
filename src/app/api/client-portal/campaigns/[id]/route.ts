import { NextRequest, NextResponse } from "next/server";
import { CLIENT_PORTAL_COOKIE, ownerFromCookie } from "@/lib/client-auth";
import {
  deleteCampaign,
  getCampaign,
  listCampaignRecipients,
  updateCampaign,
} from "@/lib/client-campaigns";

/**
 * GET    /api/client-portal/campaigns/[id] → campaign + sends + recipient preview
 * PATCH  /api/client-portal/campaigns/[id] → edit (only while status=draft|scheduled)
 * DELETE /api/client-portal/campaigns/[id] → remove (only while status=draft|cancelled)
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(
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
    const result = await getCampaign({ id, clientSlug: owner.client_slug });
    if (!result) {
      return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    }
    // Compute live recipient count (different from saved recipient_count
    // if leads have been added/removed/dismissed since the campaign was
    // last saved)
    const liveRecipients = await listCampaignRecipients(result.campaign);
    return NextResponse.json({
      ok: true,
      campaign: result.campaign,
      sends: result.sends,
      live_recipient_count: liveRecipients.length,
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "unknown" },
      { status: 500 },
    );
  }
}

export async function PATCH(
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
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
  try {
    const campaign = await updateCampaign({
      id,
      clientSlug: owner.client_slug,
      patch: body as Parameters<typeof updateCampaign>[0]["patch"],
    });
    return NextResponse.json({ ok: true, campaign });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown";
    return NextResponse.json(
      { ok: false, error: msg },
      { status: msg.includes("not found") || msg.includes("already sent") ? 400 : 500 },
    );
  }
}

export async function DELETE(
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
    await deleteCampaign({ id, clientSlug: owner.client_slug });
    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown";
    return NextResponse.json(
      { ok: false, error: msg },
      { status: msg.includes("not found") ? 404 : 400 },
    );
  }
}
