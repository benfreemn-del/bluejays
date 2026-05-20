/**
 * /api/cron/owner-notification-digest
 *
 * Drains owner_notification_queue and sends one email/SMS digest per
 * client whose pref is non-instant. Runs twice — once daily for "daily"
 * cadence, once weekly for "weekly" email cadence.
 *
 * Schedule via vercel.json:
 *   - 12:00 UTC daily — handles daily email + daily SMS
 *   - 13:00 UTC Monday — handles weekly email (SMS has no weekly mode)
 *
 * Mode is passed via ?mode=daily|weekly. Default is daily.
 *
 * Idempotency: marks each drained row's sent_at timestamp before
 * sending the digest. Stamps last_email_digest_at / last_sms_digest_at
 * on the pref row so dashboards can show "last sent".
 */

import { NextResponse } from "next/server";
import {
  getAllOwnerNotificationPrefs,
  listPendingQueue,
  markQueueSent,
  stampDigestSent,
} from "@/lib/owner-notification-prefs";
import { isSupabaseConfigured } from "@/lib/supabase";

const OWNER_PHONE = process.env.OWNER_PHONE_NUMBER;
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = "alerts@bluejayportfolio.com";
const REPLY_TO = "bluejaycontactme@gmail.com";
const OWNER_EMAIL = process.env.OWNER_EMAIL || "ben@bluejayportfolio.com";

async function sendDigestEmail(args: {
  subject: string;
  textBody: string;
  htmlBody: string;
}): Promise<boolean> {
  if (!SENDGRID_API_KEY) {
    console.log(`  📧 [digest - would email]: ${args.subject}`);
    return false;
  }
  const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SENDGRID_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: OWNER_EMAIL }] }],
      from: { email: FROM_EMAIL, name: "BlueJays Digest" },
      reply_to: { email: REPLY_TO, name: "BlueJays" },
      subject: args.subject,
      content: [
        { type: "text/plain", value: args.textBody },
        { type: "text/html", value: args.htmlBody },
      ],
    }),
  });
  if (!response.ok) {
    console.error(
      "[owner-notification-digest] SendGrid returned",
      response.status,
      await response.text(),
    );
  }
  return response.ok;
}

async function sendDigestSms(body: string): Promise<boolean> {
  if (
    !OWNER_PHONE ||
    !TWILIO_ACCOUNT_SID ||
    !TWILIO_AUTH_TOKEN ||
    !TWILIO_PHONE_NUMBER
  ) {
    console.log(`  📱 [digest - would text]: ${body}`);
    return false;
  }
  const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization:
        "Basic " +
        Buffer.from(
          `${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`,
        ).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      To: OWNER_PHONE,
      From: TWILIO_PHONE_NUMBER,
      Body: body.slice(0, 1500),
    }),
  });
  return response.ok;
}

function htmlEscape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br/>");
}

export async function GET(req: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: false, error: "Supabase not configured" });
  }

  const url = new URL(req.url);
  const mode = (url.searchParams.get("mode") ?? "daily") as "daily" | "weekly";
  const targetEmailFreq = mode === "weekly" ? "weekly" : "daily";

  const allPrefs = await getAllOwnerNotificationPrefs();
  const emailClients = allPrefs.filter(
    (p) => p.emailFrequency === targetEmailFreq,
  );
  const smsClients =
    mode === "daily" ? allPrefs.filter((p) => p.smsFrequency === "daily") : [];

  let emailDigestsSent = 0;
  let smsDigestsSent = 0;
  let emailItemsDrained = 0;
  let smsItemsDrained = 0;

  for (const pref of emailClients) {
    const pending = await listPendingQueue("email", pref.clientSlug);
    if (pending.length === 0) continue;

    const subject = `📬 ${pref.clientSlug} — ${pending.length} update${pending.length === 1 ? "" : "s"} (${mode})`;
    const textBody = pending
      .map(
        (row, i) =>
          `${i + 1}. ${row.subject ?? "(no subject)"}\n${row.body}\n` +
          `   queued: ${new Date(row.queued_at).toLocaleString()}`,
      )
      .join("\n\n---\n\n");
    const htmlBody = `<div style="font-family:-apple-system,sans-serif;font-size:15px;line-height:1.55;color:#1f2937">
      <h2 style="margin:0 0 16px;font-size:18px">${htmlEscape(pref.clientSlug)} — ${pending.length} update${pending.length === 1 ? "" : "s"}</h2>
      ${pending
        .map(
          (row) => `<div style="margin-bottom:20px;padding:12px;border-left:3px solid #3b82f6;background:#f8fafc">
            <div style="font-weight:600;margin-bottom:4px">${htmlEscape(row.subject ?? "(no subject)")}</div>
            <div>${htmlEscape(row.body)}</div>
            <div style="margin-top:6px;font-size:12px;color:#64748b">queued: ${new Date(row.queued_at).toLocaleString()}</div>
          </div>`,
        )
        .join("")}
      <p style="margin-top:24px;font-size:13px;color:#64748b">Adjust this client's notification cadence at <a href="https://bluejayportfolio.com/dashboard/notifications">/dashboard/notifications</a>.</p>
    </div>`;

    const ok = await sendDigestEmail({ subject, textBody, htmlBody });
    if (ok) {
      await markQueueSent(pending.map((r) => r.id));
      await stampDigestSent({ clientSlug: pref.clientSlug, channel: "email" });
      emailDigestsSent += 1;
      emailItemsDrained += pending.length;
    }
  }

  for (const pref of smsClients) {
    const pending = await listPendingQueue("sms", pref.clientSlug);
    if (pending.length === 0) continue;

    const lines = pending.map(
      (row, i) => `${i + 1}. ${row.body.slice(0, 140)}`,
    );
    const header = `📱 ${pref.clientSlug} — ${pending.length} update${pending.length === 1 ? "" : "s"}:\n`;
    const body = header + lines.join("\n");

    const ok = await sendDigestSms(body);
    if (ok) {
      await markQueueSent(pending.map((r) => r.id));
      await stampDigestSent({ clientSlug: pref.clientSlug, channel: "sms" });
      smsDigestsSent += 1;
      smsItemsDrained += pending.length;
    }
  }

  return NextResponse.json({
    ok: true,
    mode,
    emailDigestsSent,
    smsDigestsSent,
    emailItemsDrained,
    smsItemsDrained,
  });
}
