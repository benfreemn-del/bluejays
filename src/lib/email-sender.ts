import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { supabase, isSupabaseConfigured } from "./supabase";

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || "bluejaycontactme@gmail.com";
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
      content: [{ type: "text/html", value: body.replace(/\n/g, "<br>") }],
    }),
  });
  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown error");
    console.error(`SendGrid error (${response.status}): ${errorText}`);
  }
  return response.ok;
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
    console.log(`  📧 Sending email via SendGrid to ${to}...`);
    const success = await sendViaSendGrid(to, subject, body);
    if (!success) {
      throw new Error("SendGrid API failed");
    }
  } else {
    console.log(`  📧 [MOCK] Email to ${to}: "${subject}"`);
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
