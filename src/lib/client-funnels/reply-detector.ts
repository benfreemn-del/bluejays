/**
 * Reply detection for client_leads.
 *
 * Called by the existing /api/inbound/email and /api/inbound/sms webhooks.
 * If an inbound matches a known client_lead by email/phone, we:
 *   1. Insert a 'replied' row into client_lead_messages (timeline visibility)
 *   2. Flip funnel_status → 'responded' (stops further sends)
 *
 * Both lookups are scoped per-client_slug because the same email could
 * belong to leads of multiple clients (rare but possible).
 *
 * Returns the matched lead (or null) so callers can do client-specific
 * routing (e.g. forward to that client's owner inbox).
 */

import { getSupabase } from "../supabase";
import {
  findClientLeadByContact,
  type ClientLead,
} from "../client-leads";
import { CLIENT_FUNNELS } from "./registry";

export type InboundChannel = "email" | "sms";

export type DetectedReply = {
  lead: ClientLead;
  client_slug: string;
  channel: InboundChannel;
};

/**
 * Try every registered client until we find a lead whose email or phone
 * matches. Returns the first match (most recent by created_at).
 */
export async function detectReply(args: {
  channel: InboundChannel;
  fromAddress: string;
  body: string;
  subject?: string;
}): Promise<DetectedReply | null> {
  const isEmail = args.channel === "email";
  const contact = isEmail
    ? { email: args.fromAddress.toLowerCase().trim() }
    : { phone: args.fromAddress.trim() };

  for (const slug of Object.keys(CLIENT_FUNNELS)) {
    const lead = await findClientLeadByContact(slug, contact);
    if (lead) {
      await recordInboundReply({
        lead,
        channel: args.channel,
        fromAddress: args.fromAddress,
        subject: args.subject,
        body: args.body,
      });
      return { lead, client_slug: slug, channel: args.channel };
    }
  }
  return null;
}

async function recordInboundReply(args: {
  lead: ClientLead;
  channel: InboundChannel;
  fromAddress: string;
  subject?: string;
  body: string;
}): Promise<void> {
  const sb = getSupabase();

  // 1. Log the inbound message in the timeline.
  const { error: insErr } = await sb
    .from("client_lead_messages")
    .insert([
      {
        lead_id: args.lead.id,
        client_slug: args.lead.client_slug,
        channel: args.channel,
        direction: "inbound",
        from_address: args.fromAddress,
        to_address:
          args.channel === "email"
            ? args.lead.email
            : args.lead.phone, // for context — what the reply came TO
        subject: args.subject ?? null,
        body: args.body.slice(0, 8000),
        status: "replied",
      },
    ]);
  if (insErr)
    console.error(`[reply-detector] insert failed:`, insErr.message);

  // 2. Flip funnel_status. The trigger on client_leads stamps responded_at.
  if (args.lead.funnel_status !== "responded") {
    const { error: upErr } = await sb
      .from("client_leads")
      .update({ funnel_status: "responded" })
      .eq("id", args.lead.id);
    if (upErr) console.error(`[reply-detector] status update failed:`, upErr.message);
  }
}
