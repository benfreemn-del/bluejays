import { NextRequest, NextResponse } from "next/server";
import { CLIENT_PORTAL_COOKIE, ownerFromCookie } from "@/lib/client-auth";
import { getClientLead, updateClientLead } from "@/lib/client-leads";
import { getSupabase } from "@/lib/supabase";

/**
 * POST /api/client-portal/leads/[id]/log-contact
 *   body: { channel: 'email'|'sms'|'call', note?: string }
 *
 * Records a manual owner touch in client_lead_messages so the
 * "Contacted" stat in the portal counts it and the weekly report
 * credits it. Also bumps last_contact_at on the lead and flips
 * funnel_status → 'responded' if the lead was sitting at not_enrolled
 * (the owner has now made first contact, the funnel runner shouldn't
 * second-guess them).
 *
 * This is the bluejays-style "I just texted Phil — log it" pattern.
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const VALID_CHANNELS = ["email", "sms", "call"] as const;
type Channel = (typeof VALID_CHANNELS)[number];

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!UUID_RE.test(id)) {
    return NextResponse.json({ ok: false, error: "Invalid lead id" }, { status: 400 });
  }
  const cookie = req.cookies.get(CLIENT_PORTAL_COOKIE)?.value;
  const owner = await ownerFromCookie(cookie);
  if (!owner) {
    return NextResponse.json({ ok: false, error: "Not signed in" }, { status: 401 });
  }
  const lead = await getClientLead(id);
  if (!lead || lead.client_slug !== owner.client_slug) {
    return NextResponse.json({ ok: false, error: "Lead not found" }, { status: 404 });
  }
  let body: { channel?: Channel; note?: string } = {};
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
  if (!body.channel || !VALID_CHANNELS.includes(body.channel)) {
    return NextResponse.json({ ok: false, error: "channel required" }, { status: 400 });
  }

  const toAddress =
    body.channel === "email"
      ? lead.email ?? null
      : body.channel === "sms" || body.channel === "call"
        ? lead.phone ?? null
        : null;

  try {
    const sb = getSupabase();
    const { error: insErr } = await sb.from("client_lead_messages").insert([
      {
        lead_id: lead.id,
        client_slug: lead.client_slug,
        funnel_step: null,
        channel: body.channel,
        direction: "outbound",
        to_address: toAddress,
        from_address: owner.email,
        subject: body.channel === "email" ? "(manual log)" : null,
        body: body.note?.slice(0, 2000) ?? `[manually logged ${body.channel}]`,
        template_id: "manual.owner-log",
        status: "sent",
        provider: "manual",
        logged_by_owner_id: owner.id,
      },
    ]);
    if (insErr) throw new Error(insErr.message);

    // Bump last_contact_at + nudge status if it's still cold.
    const patch: Parameters<typeof updateClientLead>[1] = {
      last_contact_at: new Date().toISOString(),
    };
    if (lead.funnel_status === "not_enrolled") {
      patch.funnel_status = "responded";
    }
    const updated = await updateClientLead(lead.id, patch);

    return NextResponse.json({ ok: true, lead: updated });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "unknown" },
      { status: 500 },
    );
  }
}
