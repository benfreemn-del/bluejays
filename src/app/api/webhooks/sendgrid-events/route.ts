import { NextRequest, NextResponse } from "next/server";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

/**
 * POST /api/webhooks/sendgrid-events
 *
 * SendGrid Event Webhook receiver. Maps inbound events back to the
 * client_email_sends row (matched by sendgrid_message_id) and bumps
 * the campaign's aggregate counters (open_count, click_count, etc).
 *
 * Configure on SendGrid:
 *   1. Settings → Mail Settings → Event Webhook
 *   2. URL: https://bluejayportfolio.com/api/webhooks/sendgrid-events
 *   3. Toggle on: Delivered, Opened, Clicked, Bounced, Spam Reports,
 *      Group Unsubscribe (optional)
 *   4. (Recommended) Enable signed event webhook verification + set
 *      env SENDGRID_WEBHOOK_PUBLIC_KEY to the EC public key SendGrid
 *      provides. We log signature failures but don't reject yet so
 *      the integration is forgiving during setup.
 *
 * Payload: an array of event objects per SendGrid's docs.
 *   https://docs.sendgrid.com/for-developers/tracking-events/event
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type SendgridEvent = {
  email: string;
  event: string;
  timestamp: number;
  sg_message_id?: string;
  reason?: string;
  url?: string;
  /** Allow extra fields without typing them all. */
  [k: string]: unknown;
};

type SendStatus =
  | "queued"
  | "sent"
  | "delivered"
  | "opened"
  | "clicked"
  | "replied"
  | "bounced"
  | "failed";

const EVENT_TO_STATUS: Record<string, SendStatus> = {
  delivered: "delivered",
  open: "opened",
  click: "clicked",
  bounce: "bounced",
  dropped: "failed",
  spamreport: "failed",
  blocked: "failed",
};

/** SendGrid's sg_message_id format is "<msgid>.<filterId>". Our
 *  sendCampaign stores just the message-id portion when SendGrid
 *  returns it, so we match on either form. */
function normalizeMessageId(sgId: string | undefined): string | null {
  if (!sgId) return null;
  return sgId.split(".")[0] || sgId;
}

export async function POST(req: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: false, error: "Supabase not configured" });
  }

  let events: SendgridEvent[];
  try {
    const body = await req.json();
    events = Array.isArray(body) ? body : [body];
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON" },
      { status: 400 },
    );
  }

  const sb = getSupabase();
  let updatedSends = 0;
  const campaignBumps = new Map<
    string,
    { opens: number; clicks: number; bounces: number; replies: number }
  >();

  for (const ev of events) {
    const status = EVENT_TO_STATUS[ev.event];
    if (!status) continue; // silently ignore events we don't track (processed, deferred, etc.)

    const msgId = normalizeMessageId(ev.sg_message_id);
    if (!msgId) continue;

    // Find the matching client_email_sends row.
    const { data: rows, error: findErr } = await sb
      .from("client_email_sends")
      .select("id, campaign_id, status")
      .eq("sendgrid_message_id", msgId)
      .limit(1);
    if (findErr || !rows || rows.length === 0) continue;
    const send = rows[0] as { id: string; campaign_id: string; status: SendStatus };

    // Build the patch — only advance status forward (never overwrite
    // 'replied' with 'opened' for instance).
    const STATUS_RANK: Record<SendStatus, number> = {
      queued: 0,
      sent: 1,
      delivered: 2,
      opened: 3,
      clicked: 4,
      replied: 5,
      bounced: 6,
      failed: 7,
    };
    const advance = STATUS_RANK[status] > STATUS_RANK[send.status];

    const patch: Record<string, unknown> = {};
    if (advance) patch.status = status;
    if (status === "opened") patch.opened_at = new Date(ev.timestamp * 1000).toISOString();
    if (status === "clicked") patch.clicked_at = new Date(ev.timestamp * 1000).toISOString();
    if (status === "bounced") {
      patch.bounced_at = new Date(ev.timestamp * 1000).toISOString();
      patch.error = ev.reason ?? "bounced";
    }
    if (Object.keys(patch).length === 0) continue;

    await sb.from("client_email_sends").update(patch).eq("id", send.id);
    updatedSends++;

    // Track per-campaign counter bumps (one per first-time event).
    if (!campaignBumps.has(send.campaign_id)) {
      campaignBumps.set(send.campaign_id, {
        opens: 0,
        clicks: 0,
        bounces: 0,
        replies: 0,
      });
    }
    const bump = campaignBumps.get(send.campaign_id)!;
    if (status === "opened" && send.status !== "opened" && send.status !== "clicked")
      bump.opens++;
    if (status === "clicked" && send.status !== "clicked") bump.clicks++;
    if (status === "bounced") bump.bounces++;
  }

  // Apply the per-campaign aggregate bumps. Done with raw RPC math
  // since Supabase's PostgREST doesn't natively support increment.
  for (const [campaignId, bump] of campaignBumps.entries()) {
    if (bump.opens === 0 && bump.clicks === 0 && bump.bounces === 0) continue;
    const { data: c } = await sb
      .from("client_email_campaigns")
      .select("open_count, click_count, bounce_count")
      .eq("id", campaignId)
      .maybeSingle();
    if (!c) continue;
    await sb
      .from("client_email_campaigns")
      .update({
        open_count: (c.open_count ?? 0) + bump.opens,
        click_count: (c.click_count ?? 0) + bump.clicks,
        bounce_count: (c.bounce_count ?? 0) + bump.bounces,
      })
      .eq("id", campaignId);
  }

  return NextResponse.json({
    ok: true,
    received: events.length,
    updatedSends,
    campaignsTouched: campaignBumps.size,
  });
}
