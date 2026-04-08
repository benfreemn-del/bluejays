import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { supabase, isSupabaseConfigured } from "./supabase";
import { logCost, COST_RATES } from "./cost-logger";

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
// Hardcoded — this must match the verified sender identity in SendGrid
const FROM_EMAIL = "bluejaycontactme@gmail.com";
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
  body: string
): Promise<boolean> {
  const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SENDGRID_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: FROM_EMAIL, name: "BlueJays" },
      subject,
      content: [{ type: "text/plain", value: body }],
    }),
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
      await supabase.from("emails").insert({
        id: email.id,
        prospect_id: email.prospectId,
        to: email.to,
        from: email.from,
        subject: email.subject,
        body: email.body,
        sequence: email.sequence,
        sent_at: email.sentAt,
        method: email.method,
      });
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
  const email: SentEmail = {
    id: uuidv4(),
    prospectId,
    to,
    from: FROM_EMAIL,
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
    const success = await sendViaSendGrid(to, cleanSubject || subject, cleanBody || body);
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
      to: row.to as string,
      from: row.from as string,
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
