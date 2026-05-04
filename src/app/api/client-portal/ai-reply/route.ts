import { NextRequest, NextResponse } from "next/server";
import { CLIENT_PORTAL_COOKIE, ownerFromCookie } from "@/lib/client-auth";
import { getClientLead } from "@/lib/client-leads";
import { hasCapability } from "@/lib/client-subscriptions";
import { draftLeadReply } from "@/lib/client-ai-reply";

/**
 * POST /api/client-portal/ai-reply
 *   body: { lead_id: string, owner_context?: string }
 *
 * Drafts a reply to the given lead using Claude. Gated on the client's
 * Claude subscription tier (capability "claude.reply-draft", available
 * Claude Starter and up). Returns 402 if the client doesn't have an
 * active Claude sub.
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const cookie = req.cookies.get(CLIENT_PORTAL_COOKIE)?.value;
  const owner = await ownerFromCookie(cookie);
  if (!owner) {
    return NextResponse.json({ ok: false, error: "Not signed in" }, { status: 401 });
  }

  let body: { lead_id?: string; owner_context?: string } = {};
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
  if (!body.lead_id) {
    return NextResponse.json({ ok: false, error: "lead_id required" }, { status: 400 });
  }

  // Subscription gate
  const allowed = await hasCapability(owner.client_slug, "claude.reply-draft");
  if (!allowed) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "AI reply drafts require a Claude subscription. Email Ben to enable.",
        upgrade_required: true,
      },
      { status: 402 },
    );
  }

  // Tenant-scoped fetch
  const lead = await getClientLead(body.lead_id);
  if (!lead || lead.client_slug !== owner.client_slug) {
    return NextResponse.json({ ok: false, error: "Lead not found" }, { status: 404 });
  }

  try {
    const draft = await draftLeadReply({
      lead,
      ownerContext: body.owner_context,
    });
    if (!draft) {
      return NextResponse.json(
        { ok: false, error: "Draft service unavailable. Try again shortly." },
        { status: 503 },
      );
    }
    return NextResponse.json({ ok: true, draft });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "unknown" },
      { status: 500 },
    );
  }
}
