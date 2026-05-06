/**
 * Per-client_lead message senders. Each function:
 *   1. Inserts a row into client_lead_messages (status='queued')
 *   2. Calls the provider (SendGrid / Twilio / Vonage)
 *   3. Updates the row to status='sent' or 'failed'
 *
 * This wrap pattern means a crash mid-send leaves a 'queued' row in the
 * timeline that Ben can see + retry. Better than a missing row + lost
 * accountability.
 *
 * Design note on env vars: SendGrid + Twilio creds are global (BlueJay's
 * SendGrid + Twilio accounts). Per-client SMS uses ZENITH_TWILIO_NUMBER
 * etc. which we pass in via the registry. Once Zenith provisions their
 * own Twilio sub-account we'll add ZENITH_TWILIO_SID + ZENITH_TWILIO_TOKEN
 * and route through that — until then SMS is logged-only (status='skipped').
 */

import type { ClientLead } from "../client-leads";
import { getSupabase } from "../supabase";

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;

type EmailSender = { email: string; name: string; replyTo: string };

/* ──────────────────────────── EMAIL ──────────────────────────── */

export async function sendClientLeadEmail(args: {
  lead: ClientLead;
  stepIndex: number;
  templateId: string;
  /** Optional A/B variant id. Persisted on the message row so the
   *  hyperloop analyzer can break per-template stats out by variant. */
  variantId?: string | null;
  subject: string;
  body: string;
  sender: EmailSender;
}): Promise<void> {
  if (!args.lead.email) throw new Error("sendClientLeadEmail: no recipient");
  const sb = getSupabase();

  // 1. Insert queued row
  const { data: queued, error: qErr } = await sb
    .from("client_lead_messages")
    .insert([
      {
        lead_id: args.lead.id,
        client_slug: args.lead.client_slug,
        funnel_step: args.stepIndex,
        channel: "email",
        direction: "outbound",
        to_address: args.lead.email,
        from_address: args.sender.email,
        subject: args.subject,
        body: args.body,
        template_id: args.templateId,
        variant_id: args.variantId ?? null,
        status: "queued",
        provider: SENDGRID_API_KEY ? "sendgrid" : "mock",
      },
    ])
    .select("id")
    .single();
  if (qErr) throw new Error(`queue insert: ${qErr.message}`);
  const msgId = queued.id;

  // 2. Send via SendGrid (or mock if no key — useful for local dev)
  if (!SENDGRID_API_KEY) {
    await sb
      .from("client_lead_messages")
      .update({ status: "sent" })
      .eq("id", msgId);
    console.log(`  [client-funnel email · MOCK] To ${args.lead.email}: ${args.subject}`);
    return;
  }

  try {
    const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SENDGRID_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: args.lead.email }] }],
        from: { email: args.sender.email, name: args.sender.name },
        reply_to: { email: args.sender.replyTo },
        subject: args.subject,
        content: [{ type: "text/plain", value: args.body }],
        // Categories let us slice analytics in SendGrid by client + template.
        categories: [
          `client:${args.lead.client_slug}`,
          `template:${args.templateId}`,
        ],
        // Custom args travel back on engagement webhooks if we wire them.
        custom_args: {
          client_lead_id: args.lead.id,
          funnel_step: String(args.stepIndex),
          template_id: args.templateId,
        },
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`SendGrid ${res.status}: ${body.slice(0, 200)}`);
    }
    const providerId = res.headers.get("x-message-id") ?? null;
    await sb
      .from("client_lead_messages")
      .update({ status: "sent", provider_id: providerId })
      .eq("id", msgId);
  } catch (err) {
    await sb
      .from("client_lead_messages")
      .update({
        status: "failed",
        error: err instanceof Error ? err.message : "unknown",
      })
      .eq("id", msgId);
    throw err;
  }
}

/* ──────────────────────────── SMS ──────────────────────────── */

export async function sendClientLeadSms(args: {
  lead: ClientLead;
  stepIndex: number;
  templateId: string;
  variantId?: string | null;
  body: string;
  fromNumber: string;
}): Promise<void> {
  if (!args.lead.phone) throw new Error("sendClientLeadSms: no recipient");
  const sb = getSupabase();

  const { data: queued, error: qErr } = await sb
    .from("client_lead_messages")
    .insert([
      {
        lead_id: args.lead.id,
        client_slug: args.lead.client_slug,
        funnel_step: args.stepIndex,
        channel: "sms",
        direction: "outbound",
        to_address: args.lead.phone,
        from_address: args.fromNumber,
        body: args.body,
        template_id: args.templateId,
        variant_id: args.variantId ?? null,
        status: "queued",
        provider: TWILIO_ACCOUNT_SID ? "twilio" : "mock",
      },
    ])
    .select("id")
    .single();
  if (qErr) throw new Error(`queue insert: ${qErr.message}`);
  const msgId = queued.id;

  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
    await sb
      .from("client_lead_messages")
      .update({ status: "sent" })
      .eq("id", msgId);
    console.log(`  [client-funnel sms · MOCK] To ${args.lead.phone}: ${args.body}`);
    return;
  }

  try {
    const auth = Buffer.from(
      `${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`,
    ).toString("base64");
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          From: args.fromNumber,
          To: args.lead.phone,
          Body: args.body,
        }),
      },
    );
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Twilio ${res.status}: ${body.slice(0, 200)}`);
    }
    const data = (await res.json()) as { sid?: string };
    await sb
      .from("client_lead_messages")
      .update({ status: "sent", provider_id: data.sid ?? null })
      .eq("id", msgId);
  } catch (err) {
    await sb
      .from("client_lead_messages")
      .update({
        status: "failed",
        error: err instanceof Error ? err.message : "unknown",
      })
      .eq("id", msgId);
    throw err;
  }
}

/* ──────────────────────────── VOICEMAIL ──────────────────────────── */

/**
 * Voicemail drops are logged-only until Twilio is provisioned AND Philip
 * records the per-audience clips. The log row carries the script hint so
 * Ben can see in the dashboard timeline what *would* have dropped.
 */
export async function logVoicemailDrop(args: {
  lead: ClientLead;
  stepIndex: number;
  templateId: string;
  scriptHint: string;
  mediaUrl?: string;
}): Promise<void> {
  const status = args.mediaUrl ? "queued" : "skipped";
  const error = args.mediaUrl
    ? null
    : "voicemail clip not yet recorded (see client_tasks)";
  await getSupabase()
    .from("client_lead_messages")
    .insert([
      {
        lead_id: args.lead.id,
        client_slug: args.lead.client_slug,
        funnel_step: args.stepIndex,
        channel: "voicemail",
        direction: "outbound",
        to_address: args.lead.phone,
        body: args.scriptHint,
        template_id: args.templateId,
        status,
        error,
      },
    ]);
}
