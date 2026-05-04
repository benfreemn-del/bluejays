import { NextRequest, NextResponse } from "next/server";
import { CLIENT_PORTAL_COOKIE, ownerFromCookie } from "@/lib/client-auth";
import { createCampaign, listCampaigns } from "@/lib/client-campaigns";

/**
 * GET  /api/client-portal/campaigns → list all campaigns for this client
 * POST /api/client-portal/campaigns → create a new draft campaign
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const cookie = req.cookies.get(CLIENT_PORTAL_COOKIE)?.value;
  const owner = await ownerFromCookie(cookie);
  if (!owner) {
    return NextResponse.json({ ok: false, error: "Not signed in" }, { status: 401 });
  }
  try {
    const campaigns = await listCampaigns(owner.client_slug);
    return NextResponse.json({ ok: true, campaigns });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "unknown" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
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
  if (!body.name || !body.subject || !body.body) {
    return NextResponse.json(
      { ok: false, error: "name + subject + body required" },
      { status: 400 },
    );
  }
  try {
    const campaign = await createCampaign({
      clientSlug: owner.client_slug,
      ownerId: owner.id,
      patch: {
        name: String(body.name).slice(0, 200),
        subject: String(body.subject).slice(0, 250),
        body: String(body.body).slice(0, 20000),
        audience_filter: Array.isArray(body.audience_filter)
          ? (body.audience_filter as unknown[]).filter(
              (v): v is string => typeof v === "string",
            )
          : [],
        lead_status_filter: Array.isArray(body.lead_status_filter)
          ? (body.lead_status_filter as unknown[]).filter(
              (v): v is string => typeof v === "string",
            )
          : [],
      },
    });
    return NextResponse.json({ ok: true, campaign });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "unknown" },
      { status: 500 },
    );
  }
}
