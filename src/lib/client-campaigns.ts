/**
 * client-campaigns — read/write + send pipeline for the owner portal
 * Campaigns tab.
 *
 * Owners blast email campaigns to filtered subsets of their leads.
 * Each campaign creates one row in client_email_campaigns + N rows in
 * client_email_sends (one per recipient).
 *
 * Send pipeline:
 *   1. Owner clicks "Send now" → POST /campaigns/{id}/send
 *   2. We materialize the recipient list (filter client_leads by
 *      audience + status + dismissed=false)
 *   3. For each recipient, render subject+body with merge tags
 *   4. Insert client_email_sends row (status=queued)
 *   5. Call sendEmailTo() (SendGrid) per row
 *   6. Update each row to status=sent + sendgrid_message_id, OR
 *      status=failed + error
 *   7. Bump campaign aggregates (recipient_count, send_count)
 *
 * Tracking pipeline (already wired elsewhere):
 *   - Open: /api/o/{sendId} pixel inserts opened_at on the row
 *   - Click: links rewritten to /api/o/c/{sendId}?u=... → click_at
 *   - Reply: existing inbound email handler matches by from-address
 *     → reply_at on the most recent send row for that lead
 */

import { sendEmailTo } from "./alerts";
import type { ClientLead } from "./client-leads";
import { listClientLeads } from "./client-leads";
import { getSupabase } from "./supabase";

export type CampaignStatus =
  | "draft"
  | "scheduled"
  | "sending"
  | "sent"
  | "cancelled";

export type Campaign = {
  id: string;
  client_slug: string;
  name: string;
  subject: string;
  body: string;
  audience_filter: string[];
  lead_status_filter: string[];
  status: CampaignStatus;
  scheduled_for: string | null;
  sent_at: string | null;
  recipient_count: number;
  send_count: number;
  open_count: number;
  click_count: number;
  reply_count: number;
  bounce_count: number;
  created_by_owner_id: string | null;
  created_at: string;
  updated_at: string;
};

export type CampaignSend = {
  id: string;
  campaign_id: string;
  lead_id: string;
  client_slug: string;
  to_email: string;
  rendered_subject: string;
  rendered_body: string;
  status:
    | "queued"
    | "sent"
    | "delivered"
    | "opened"
    | "clicked"
    | "replied"
    | "bounced"
    | "failed";
  sendgrid_message_id: string | null;
  error: string | null;
  sent_at: string | null;
  opened_at: string | null;
  clicked_at: string | null;
  replied_at: string | null;
  created_at: string;
};

/* ─────────────────────────── CRUD ─────────────────────────── */

export async function listCampaigns(clientSlug: string): Promise<Campaign[]> {
  const { data, error } = await getSupabase()
    .from("client_email_campaigns")
    .select("*")
    .eq("client_slug", clientSlug)
    .order("created_at", { ascending: false });
  if (error) throw new Error(`listCampaigns: ${error.message}`);
  return (data ?? []) as Campaign[];
}

export async function getCampaign(args: {
  id: string;
  clientSlug: string;
}): Promise<{ campaign: Campaign; sends: CampaignSend[] } | null> {
  const sb = getSupabase();
  const { data: c, error } = await sb
    .from("client_email_campaigns")
    .select("*")
    .eq("id", args.id)
    .eq("client_slug", args.clientSlug)
    .maybeSingle();
  if (error) throw new Error(`getCampaign: ${error.message}`);
  if (!c) return null;
  const { data: sends } = await sb
    .from("client_email_sends")
    .select("*")
    .eq("campaign_id", args.id)
    .order("created_at", { ascending: false });
  return { campaign: c as Campaign, sends: (sends ?? []) as CampaignSend[] };
}

export async function createCampaign(args: {
  clientSlug: string;
  ownerId: string | null;
  patch: Partial<
    Pick<
      Campaign,
      | "name"
      | "subject"
      | "body"
      | "audience_filter"
      | "lead_status_filter"
      | "scheduled_for"
    >
  >;
}): Promise<Campaign> {
  if (!args.patch.name || !args.patch.subject || !args.patch.body) {
    throw new Error("name + subject + body required");
  }
  const { data, error } = await getSupabase()
    .from("client_email_campaigns")
    .insert([
      {
        client_slug: args.clientSlug,
        created_by_owner_id: args.ownerId,
        status: "draft",
        ...args.patch,
      },
    ])
    .select("*")
    .single();
  if (error) throw new Error(`createCampaign: ${error.message}`);
  return data as Campaign;
}

export async function updateCampaign(args: {
  id: string;
  clientSlug: string;
  patch: Partial<Campaign>;
}): Promise<Campaign> {
  const sb = getSupabase();
  const { data: existing } = await sb
    .from("client_email_campaigns")
    .select("id, client_slug, status")
    .eq("id", args.id)
    .maybeSingle();
  if (!existing || existing.client_slug !== args.clientSlug) {
    throw new Error("Campaign not found in your account");
  }
  if (existing.status === "sent" || existing.status === "sending") {
    throw new Error("Campaign already sent — can't edit");
  }
  const allowed = [
    "name",
    "subject",
    "body",
    "audience_filter",
    "lead_status_filter",
    "scheduled_for",
    "status",
  ] as const;
  const patch: Record<string, unknown> = {};
  for (const k of allowed) {
    if (k in args.patch) patch[k] = (args.patch as Record<string, unknown>)[k];
  }
  const { data, error } = await sb
    .from("client_email_campaigns")
    .update(patch)
    .eq("id", args.id)
    .select("*")
    .single();
  if (error) throw new Error(`updateCampaign: ${error.message}`);
  return data as Campaign;
}

export async function deleteCampaign(args: {
  id: string;
  clientSlug: string;
}): Promise<void> {
  const sb = getSupabase();
  const { data: existing } = await sb
    .from("client_email_campaigns")
    .select("id, client_slug, status")
    .eq("id", args.id)
    .maybeSingle();
  if (!existing || existing.client_slug !== args.clientSlug) {
    throw new Error("Campaign not found in your account");
  }
  if (existing.status === "sending" || existing.status === "sent") {
    throw new Error("Can't delete a sent campaign — cancel it instead");
  }
  const { error } = await sb
    .from("client_email_campaigns")
    .delete()
    .eq("id", args.id);
  if (error) throw new Error(`deleteCampaign: ${error.message}`);
}

/* ─────────────────────── recipient list ─────────────────────── */

/**
 * Materialize the recipient list for a campaign. Applies the campaign's
 * audience + status filters, always excludes dismissed leads + leads
 * with no email.
 */
export async function listCampaignRecipients(
  campaign: Pick<
    Campaign,
    "client_slug" | "audience_filter" | "lead_status_filter"
  >,
): Promise<ClientLead[]> {
  const all = await listClientLeads(campaign.client_slug, { limit: 1000 });
  return all.filter((lead) => {
    if (!lead.email) return false;
    if (
      campaign.audience_filter.length > 0 &&
      !campaign.audience_filter.includes(lead.audience_segment ?? "unknown")
    ) {
      return false;
    }
    if (
      campaign.lead_status_filter.length > 0 &&
      !campaign.lead_status_filter.includes(lead.funnel_status)
    ) {
      return false;
    }
    return true;
  });
}

/* ─────────────────────── merge tags ─────────────────────── */

/**
 * Substitute merge tags in a subject or body string.
 *   {{first_name}}  → first word of lead.name (or "there" fallback)
 *   {{audience}}    → human-readable audience
 *   {{intent}}      → lead.intent or "your message"
 */
export function renderTemplate(template: string, lead: ClientLead): string {
  const firstName = lead.name?.trim().split(/\s+/)[0] ?? "there";
  const audMap: Record<string, string> = {
    parent: "parent",
    coach: "coach",
    player: "player",
    club: "club",
    unknown: "friend",
  };
  const audience = audMap[lead.audience_segment ?? "unknown"] ?? "friend";
  const intent = lead.intent ?? "your message";
  return template
    .replace(/\{\{\s*first_name\s*\}\}/gi, firstName)
    .replace(/\{\{\s*audience\s*\}\}/gi, audience)
    .replace(/\{\{\s*intent\s*\}\}/gi, intent);
}

/* ─────────────────────── send pipeline ─────────────────────── */

export async function sendCampaign(args: {
  id: string;
  clientSlug: string;
  fromName: string;
}): Promise<{ ok: boolean; recipientCount: number; sent: number; failed: number }> {
  const sb = getSupabase();
  // Re-fetch the campaign + verify ownership + status
  const { data: c, error: getErr } = await sb
    .from("client_email_campaigns")
    .select("*")
    .eq("id", args.id)
    .eq("client_slug", args.clientSlug)
    .maybeSingle();
  if (getErr) throw new Error(`sendCampaign read: ${getErr.message}`);
  if (!c) throw new Error("Campaign not found");
  const campaign = c as Campaign;
  if (campaign.status !== "draft" && campaign.status !== "scheduled") {
    throw new Error(`Campaign already ${campaign.status} — can't re-send`);
  }

  // Materialize recipients
  const recipients = await listCampaignRecipients(campaign);
  if (recipients.length === 0) {
    // Mark as sent with 0 recipients so it shows up correctly in the UI
    await sb
      .from("client_email_campaigns")
      .update({
        status: "sent",
        sent_at: new Date().toISOString(),
        recipient_count: 0,
      })
      .eq("id", campaign.id);
    return { ok: true, recipientCount: 0, sent: 0, failed: 0 };
  }

  // Flip status → sending
  await sb
    .from("client_email_campaigns")
    .update({ status: "sending", recipient_count: recipients.length })
    .eq("id", campaign.id);

  // Materialize the send rows first (so we can recover from a crash
  // mid-fan-out and resume later). Status stays 'queued' until each
  // SendGrid POST completes.
  const sendRows = recipients.map((lead) => ({
    campaign_id: campaign.id,
    lead_id: lead.id,
    client_slug: campaign.client_slug,
    to_email: lead.email!,
    rendered_subject: renderTemplate(campaign.subject, lead),
    rendered_body: renderTemplate(campaign.body, lead),
    status: "queued" as const,
  }));
  const { data: insertedSends, error: insErr } = await sb
    .from("client_email_sends")
    .insert(sendRows)
    .select("*");
  if (insErr) {
    await sb
      .from("client_email_campaigns")
      .update({ status: "draft" })
      .eq("id", campaign.id);
    throw new Error(`sendCampaign insert: ${insErr.message}`);
  }

  // Fan out — sequential to keep SendGrid happy at low volume; we can
  // batch later if needed.
  let sent = 0;
  let failed = 0;
  for (const row of (insertedSends ?? []) as CampaignSend[]) {
    const ok = await sendEmailTo({
      to: row.to_email,
      subject: row.rendered_subject,
      body: row.rendered_body,
      fromName: args.fromName,
      clientSlug: args.clientSlug,
    }).catch((e) => {
      console.error("[sendCampaign] send failed:", e);
      return false;
    });
    await sb
      .from("client_email_sends")
      .update({
        status: ok ? "sent" : "failed",
        sent_at: ok ? new Date().toISOString() : null,
        error: ok ? null : "SendGrid send returned non-OK",
      })
      .eq("id", row.id);
    if (ok) sent++;
    else failed++;
  }

  // Final aggregates + status
  await sb
    .from("client_email_campaigns")
    .update({
      status: "sent",
      sent_at: new Date().toISOString(),
      send_count: sent,
      bounce_count: failed, // we treat failed as bounce until SendGrid webhooks land
    })
    .eq("id", campaign.id);

  return {
    ok: true,
    recipientCount: recipients.length,
    sent,
    failed,
  };
}
