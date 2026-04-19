import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { supabase, isSupabaseConfigured } from "./supabase";
import { logCost, COST_RATES } from "./cost-logger";
import { isEmailBounced } from "./email-deliverability";
import { pickSendingDomain, recordEmailSent } from "./domain-warming";

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;

/**
 * Per-domain SendGrid sender identity. `email` + `name` is what the recipient
 * sees in their inbox. `replyTo` overrides where replies route — used when a
 * sender domain doesn't have a fully-functional inbox wired up yet.
 *
 * CRITICAL — DKIM alignment: the From domain MUST match the domain that
 * SendGrid signs the message with (the domain-auth domain). Sending From
 * a @gmail.com address while SendGrid signs with bluejayportfolio.com is a
 * DKIM alignment failure — tanks deliverability + hurts close rate.
 * Domain Authentication in SendGrid covers the From address; no per-sender
 * verification needed beyond that.
 */
const SENDERS: Record<string, { email: string; name: string; replyTo?: string }> = {
  "bluejayportfolio.com": {
    // DKIM-aligned: From @bluejayportfolio.com, SendGrid signs with
    // em7701.bluejayportfolio.com — match. Google Workspace MX (smtp.google.com
    // priority 1) routes inbound replies to the Workspace inbox at
    // ben@bluejayportfolio.com, so no reply-to override is needed.
    email: "ben@bluejayportfolio.com",
    name: "Ben @ BlueJays",
  },
  "bluejaywebs.com": {
    email: "ben@bluejaywebs.com",
    name: "Ben @ BlueJays",
    // No inbox at ben@bluejaywebs.com yet — route replies to the real Gmail
    replyTo: "bluejaycontactme@gmail.com",
  },
};
const FALLBACK_SENDER = SENDERS["bluejayportfolio.com"];

const EMAILS_DIR = path.join(process.cwd(), "data", "emails");

export interface SentEmail {
  id: string;
  prospectId: string;
  to: string;
  from: string;
  subject: string;
  body: string;
  sequence: number;
  sentAt: string;
  method: "sendgrid" | "mock";
}

function ensureEmailDir() {
  if (!fs.existsSync(EMAILS_DIR)) {
    fs.mkdirSync(EMAILS_DIR, { recursive: true });
  }
}

async function sendViaSendGrid(
  to: string,
  subject: string,
  body: string,
  from: { email: string; name: string; replyTo?: string },
): Promise<boolean> {
  const payload: Record<string, unknown> = {
    personalizations: [{ to: [{ email: to }] }],
    from: { email: from.email, name: from.name },
    subject,
    content: [{ type: "text/plain", value: body }],
    // Disable SendGrid's click tracking + open tracking on plain-text sends.
    // In plain-text bodies, click tracking REPLACES the visible URL with a
    // 250-char redirect URL like https://u82955649.ct.sendgrid.net/ls/click?...
    // which looks like spam and ruins the whole point of our /p/[code]
    // short-URL system. We accept the loss of per-send click analytics in
    // exchange for clean URLs that render nicely in the recipient's inbox.
    // Revisit when we move to HTML emails (hidden tracking, best of both).
    tracking_settings: {
      click_tracking: { enable: false, enable_text: false },
      open_tracking: { enable: false },
    },
  };
  if (from.replyTo) {
    payload.reply_to = { email: from.replyTo };
  }

  const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SENDGRID_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown error");
    console.error(`SendGrid error (${response.status}): ${errorText}`);
    // Throw with actual error details so API routes can return them
    throw new Error(`SendGrid ${response.status}: ${errorText.substring(0, 200)}`);
  }
  return true;
}

async function logEmailToFile(email: SentEmail) {
  // Skip Supabase logging for test emails (non-UUID prospect IDs)
  if (isSupabaseConfigured() && email.prospectId.includes("-") && email.prospectId.length > 30) {
    try {
      // The emails table uses to_address/from_address (not `to`/`from` —
      // those are SQL reserved words). This insert was silently failing
      // for the entire life of the table before 2026-04-18 because the
      // columns didn't exist. DON'T RENAME back to `to`/`from` without a
      // schema migration.
      const { error: insertErr } = await supabase.from("emails").insert({
        id: email.id,
        prospect_id: email.prospectId,
        to_address: email.to,
        from_address: email.from,
        subject: email.subject,
        body: email.body,
        sequence: email.sequence,
        sent_at: email.sentAt,
        method: email.method,
      });
      if (insertErr) {
        console.error("Email log to Supabase failed:", insertErr);
      }
    } catch (err) {
      console.error("Email log to Supabase failed:", err);
    }
    return;
  }

  // Skip file logging on Vercel (read-only filesystem)
  if (process.env.VERCEL) {
    console.log(`  Email logged (skipped file write on Vercel): ${email.subject}`);
    return;
  }

  ensureEmailDir();
  const filePath = path.join(EMAILS_DIR, `${email.prospectId}.json`);

  let emails: SentEmail[] = [];
  if (fs.existsSync(filePath)) {
    emails = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  }

  emails.push(email);
  fs.writeFileSync(filePath, JSON.stringify(emails, null, 2));
}

export async function sendEmail(
  prospectId: string,
  to: string,
  subject: string,
  body: string,
  sequence: number
): Promise<SentEmail> {
  // Check if email has hard-bounced — skip sending
  if (isEmailBounced(to)) {
    console.log(`  [Deliverability] Skipping ${to} — hard bounced`);
    throw new Error(`Email ${to} has hard-bounced and was removed`);
  }

  // PARALLEL WARMING: pick whichever domain has capacity today (primary or backup).
  const { domain: sendingDomain, capacity } = await pickSendingDomain();
  if (!capacity.canSend) {
    console.log(`  [Deliverability] All sender domains capped for today (primary+backup both at limit).`);
    throw new Error(`Daily warm-up limit reached across all sender domains. Try again tomorrow.`);
  }
  const fromSender = SENDERS[sendingDomain] || FALLBACK_SENDER;

  const email: SentEmail = {
    id: uuidv4(),
    prospectId,
    to,
    from: fromSender.email,
    subject,
    body,
    sequence,
    sentAt: new Date().toISOString(),
    method: SENDGRID_API_KEY ? "sendgrid" : "mock",
  };

  if (SENDGRID_API_KEY) {
    console.log(`  Sending email via SendGrid to ${to}...`);
    // Strip emojis from subject to avoid encoding issues
    const cleanSubject = subject.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, "").trim();
    // Strip non-ASCII from body to avoid encoding issues
    const cleanBody = body.replace(/[^\x00-\x7F]/g, "").trim();
    const success = await sendViaSendGrid(to, cleanSubject || subject, cleanBody || body, fromSender);
    if (!success) {
      throw new Error(`SendGrid API failed`);
    }

    // Log the cost of this email send
    await logCost({
      prospectId,
      service: "sendgrid_email",
      action: `email_sequence_${sequence}`,
      costUsd: COST_RATES.sendgrid_email,
      metadata: { emailId: email.id, to, subject: cleanSubject || subject },
    });
  } else {
    console.log(`  [MOCK] Email to ${to}: "${subject}"`);
  }

  // Always log for history
  await logEmailToFile(email);

  // Track send against the domain we actually used (parallel warming)
  try {
    await recordEmailSent(sendingDomain);
  } catch {
    // Non-critical — don't block sending
  }

  return email;
}

export async function getEmailHistory(prospectId: string): Promise<SentEmail[]> {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from("emails")
      .select("*")
      .eq("prospect_id", prospectId)
      .order("sent_at", { ascending: true });

    if (error || !data) return [];

    return data.map((row: Record<string, unknown>) => ({
      id: row.id as string,
      prospectId: row.prospect_id as string,
      to: row.to_address as string,
      from: row.from_address as string,
      subject: row.subject as string,
      body: row.body as string,
      sequence: row.sequence as number,
      sentAt: row.sent_at as string,
      method: row.method as "sendgrid" | "mock",
    }));
  }

  ensureEmailDir();
  const filePath = path.join(EMAILS_DIR, `${prospectId}.json`);
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}
