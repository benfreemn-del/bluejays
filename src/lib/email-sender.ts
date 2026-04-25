import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { supabase, isSupabaseConfigured } from "./supabase";
import { logCost, COST_RATES } from "./cost-logger";
import { isEmailBounced } from "./email-deliverability";
import { pickSendingDomain, recordEmailSent } from "./domain-warming";
import { deriveShortCode } from "./short-urls";

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
  htmlBody?: string,
  prospectId?: string,
): Promise<boolean> {
  // Multipart send: when htmlBody is provided, we send text/plain AND
  // text/html together per SendGrid's spec (text/plain FIRST, text/html
  // SECOND so modern clients render the HTML and fallback clients see
  // the plain text). SendGrid requires content types in this exact order.
  const content: Array<{ type: string; value: string }> = [
    { type: "text/plain", value: body },
  ];
  if (htmlBody && htmlBody.trim()) {
    content.push({ type: "text/html", value: htmlBody });
  }

  const payload: Record<string, unknown> = {
    personalizations: [{ to: [{ email: to }] }],
    from: { email: from.email, name: from.name },
    subject,
    content,
    // Keep click + open tracking off even in multipart: the plain-text
    // fallback still shows a clean URL, and we don't want SendGrid to
    // inject tracking redirects into the HTML anchors either.
    tracking_settings: {
      click_tracking: { enable: false, enable_text: false },
      open_tracking: { enable: false },
    },
  };
  if (from.replyTo) {
    payload.reply_to = { email: from.replyTo };
  }

  // List-Unsubscribe headers (RFC 2369 + RFC 8058) are the #1 Primary-tab
  // signal Gmail looks for from commercial senders. With these set:
  //   • Gmail renders its built-in "Unsubscribe" link near the sender name
  //     (no more need for a noisy CAN-SPAM footer to carry the load)
  //   • Gmail treats the sender as responsible/compliant → better placement
  //   • Users can unsubscribe without marking spam → sender reputation stays clean
  //
  // The header URL must match the in-body footer link so Gmail's classifier
  // sees consistency: both point at the canonical short /u/[code] route.
  // The /u/[code] handler accepts POST with empty body and returns 200 for
  // Gmail's RFC 8058 one-click flow. No mailto leg — we don't have a
  // dedicated unsubscribe inbox wired up.
  if (prospectId) {
    const code = deriveShortCode(prospectId);
    const unsubUrl = `https://bluejayportfolio.com/u/${code}`;
    payload.headers = {
      "List-Unsubscribe": `<${unsubUrl}>`,
      // RFC 8058: Gmail/Apple see this and enable one-click unsubscribe UI.
      // The header value must be exactly `List-Unsubscribe=One-Click`.
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    };
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
  sequence: number,
  htmlBody?: string,
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
    // SendGrid handles UTF-8 plain text natively — don't strip non-ASCII.
    // The previous `.replace(/[^\x00-\x7F]/g, "")` silently removed every
    // ★, em-dash, and curly quote from pitch templates before sending.
    // Pass prospectId through so sendViaSendGrid can set List-Unsubscribe
    // headers scoped to this specific prospect (RFC 8058 one-click).
    const success = await sendViaSendGrid(to, cleanSubject || subject, body, fromSender, htmlBody, prospectId);
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
