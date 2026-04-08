import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import type { Prospect } from "./types";
import { supabase, isSupabaseConfigured } from "./supabase";
import { logCost, COST_RATES } from "./cost-logger";

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;
const SMS_DIR = path.join(process.cwd(), "data", "sms");

export interface SentSms {
  id: string;
  prospectId: string;
  to: string;
  from: string;
  body: string;
  sequence: number;
  sentAt: string;
  method: "twilio" | "mock";
  messageSid?: string;
}

function ensureSmsDir() {
  if (!fs.existsSync(SMS_DIR)) fs.mkdirSync(SMS_DIR, { recursive: true });
}

async function sendViaTwilio(to: string, body: string): Promise<{ ok: boolean; sid?: string }> {
  const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: "Basic " + Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      To: to,
      From: TWILIO_PHONE_NUMBER!,
      Body: body,
    }),
  });
  if (!response.ok) return { ok: false };
  const data = await response.json();
  return { ok: true, sid: data.sid };
}

async function logSms(sms: SentSms) {
  // Log to Supabase if configured (production)
  if (isSupabaseConfigured()) {
    try {
      await supabase.from("sms_messages").insert({
        id: sms.id,
        prospect_id: sms.prospectId,
        to_number: sms.to,
        from_number: sms.from,
        body: sms.body,
        sequence: sms.sequence,
        sent_at: sms.sentAt,
        method: sms.method,
        message_sid: sms.messageSid || null,
      });
    } catch {
      // Table might not exist yet — fall through to file logging
    }
    return;
  }

  // Skip file writes on Vercel (read-only filesystem)
  if (process.env.VERCEL) {
    console.log(`  SMS logged (skipped file write on Vercel): seq ${sms.sequence} to ${sms.to}`);
    return;
  }

  ensureSmsDir();
  const filePath = path.join(SMS_DIR, `${sms.prospectId}.json`);
  let messages: SentSms[] = [];
  if (fs.existsSync(filePath)) {
    messages = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  }
  messages.push(sms);
  fs.writeFileSync(filePath, JSON.stringify(messages, null, 2));
}

export async function sendSms(
  prospectId: string,
  to: string,
  body: string,
  sequence: number
): Promise<SentSms> {
  const sms: SentSms = {
    id: uuidv4(),
    prospectId,
    to,
    from: TWILIO_PHONE_NUMBER || "+10000000000",
    body,
    sequence,
    sentAt: new Date().toISOString(),
    method: TWILIO_ACCOUNT_SID ? "twilio" : "mock",
  };

  if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_PHONE_NUMBER) {
    console.log(`  Sending SMS via Twilio to ${to}...`);
    const result = await sendViaTwilio(to, body);
    if (!result.ok) throw new Error("Twilio SMS failed");
    sms.messageSid = result.sid;

    // Log the cost of this SMS send
    await logCost({
      prospectId,
      service: "twilio_sms",
      action: `sms_sequence_${sequence}`,
      costUsd: COST_RATES.twilio_sms,
      metadata: { messageSid: result.sid, to },
    });
  } else {
    console.log(`  [MOCK] SMS to ${to}: "${body.substring(0, 60)}..."`);
  }

  await logSms(sms);
  return sms;
}

export async function getSmsHistory(prospectId: string): Promise<SentSms[]> {
  // Read from Supabase if configured (production)
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from("sms_messages")
        .select("*")
        .eq("prospect_id", prospectId)
        .order("sent_at", { ascending: true });
      if (error || !data) return [];
      return data.map((row: Record<string, unknown>) => ({
        id: row.id as string,
        prospectId: row.prospect_id as string,
        to: row.to_number as string,
        from: row.from_number as string,
        body: row.body as string,
        sequence: row.sequence as number,
        sentAt: row.sent_at as string,
        method: row.method as "twilio" | "mock",
        messageSid: row.message_sid as string | undefined,
      }));
    } catch {
      // Table might not exist yet
      return [];
    }
  }

  // Skip file reads on Vercel if no Supabase
  if (process.env.VERCEL) {
    return [];
  }

  ensureSmsDir();
  const filePath = path.join(SMS_DIR, `${prospectId}.json`);
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

export function isTwilioConfigured(): boolean {
  return !!(TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_PHONE_NUMBER);
}

// --- SMS Templates ---

export function getInitialSms(prospect: Prospect, previewUrl: string): string {
  const name = prospect.ownerName?.split(" ")[0] || "there";
  return `Hey ${name}! This is BlueJays. We built a free custom website for ${prospect.businessName} — check it out: ${previewUrl} Let us know what you think!`;
}

export function getFollowUpSms1(prospect: Prospect, previewUrl: string): string {
  const name = prospect.ownerName?.split(" ")[0] || "there";
  return `Hi ${name}, just following up on the website we built for ${prospect.businessName}. Have you had a chance to look? ${previewUrl}`;
}

export function getFollowUpSms2(prospect: Prospect, previewUrl: string): string {
  const name = prospect.ownerName?.split(" ")[0] || "there";
  return `Last message from us ${name} — your free ${prospect.businessName} website is still live at ${previewUrl}. Claim it before we move on! No pressure either way.`;
}
