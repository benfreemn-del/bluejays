import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import type { Prospect, SmsMethod, SmsProvider } from "./types";
import { supabase, isSupabaseConfigured } from "./supabase";
import { logCost, COST_RATES } from "./cost-logger";
import { getVonagePhoneNumber, isVonageConfigured, sendViaVonage } from "./vonage-sms";
import { getShortPreviewUrl } from "./short-urls";

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;
const SMS_DIR = path.join(process.cwd(), "data", "sms");

type ResolvedSmsProvider = Exclude<SmsProvider, "auto">;

export interface SentSms {
  id: string;
  prospectId: string;
  to: string;
  from: string;
  body: string;
  sequence: number;
  sentAt: string;
  method: SmsMethod;
  messageSid?: string;
}

interface SmsSendAttemptResult {
  ok: boolean;
  sid?: string;
  error?: string;
}

function ensureSmsDir() {
  if (!fs.existsSync(SMS_DIR)) fs.mkdirSync(SMS_DIR, { recursive: true });
}

function getSmsProviderPreference(): SmsProvider {
  const value = process.env.SMS_PROVIDER?.toLowerCase();
  if (value === "vonage" || value === "twilio" || value === "auto") {
    return value;
  }
  return "auto";
}

function getProviderOrder(): ResolvedSmsProvider[] {
  const preferred = getSmsProviderPreference();

  if (preferred === "vonage") return ["vonage", "twilio"];
  if (preferred === "twilio") return ["twilio", "vonage"];

  // Default: Twilio primary, Vonage backup
  if (isTwilioConfigured()) return ["twilio", "vonage"];
  return ["vonage", "twilio"];
}

async function sendViaTwilio(to: string, body: string): Promise<SmsSendAttemptResult> {
  if (!isTwilioConfigured()) {
    return {
      ok: false,
      error: "Twilio SMS is not configured",
    };
  }

  try {
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

    const rawText = await response.text();
    let data: Record<string, unknown> | null = null;

    try {
      data = rawText ? JSON.parse(rawText) as Record<string, unknown> : null;
    } catch {
      data = null;
    }

    if (!response.ok) {
      const error = (data?.message as string) || `Twilio HTTP ${response.status}: ${rawText || response.statusText}`;
      console.error("[SMS][Twilio] Request failed:", error);
      return { ok: false, error };
    }

    return { ok: true, sid: data?.sid as string | undefined };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Twilio SMS error";
    console.error("[SMS][Twilio] Unexpected error:", error);
    return { ok: false, error: message };
  }
}

async function logSms(sms: SentSms) {
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
      // Table might not exist yet — fall through to file logging.
    }
    return;
  }

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

function buildSmsRecord(params: {
  prospectId: string;
  to: string;
  body: string;
  sequence: number;
  method: SmsMethod;
  from?: string;
  messageSid?: string;
}): SentSms {
  return {
    id: uuidv4(),
    prospectId: params.prospectId,
    to: params.to,
    from: params.from || getVonagePhoneNumber() || TWILIO_PHONE_NUMBER || "+10000000000",
    body: params.body,
    sequence: params.sequence,
    sentAt: new Date().toISOString(),
    method: params.method,
    messageSid: params.messageSid,
  };
}

async function trySendWithProvider(
  provider: ResolvedSmsProvider,
  prospectId: string,
  to: string,
  body: string,
  sequence: number
): Promise<{ success: true; sms: SentSms } | { success: false; error: string }> {
  if (provider === "vonage") {
    if (!isVonageConfigured()) {
      return { success: false, error: "Vonage SMS is not configured" };
    }

    console.log(`  Sending SMS via Vonage to ${to}...`);
    const result = await sendViaVonage(to, body);
    if (!result.ok) {
      return { success: false, error: result.error || "Vonage SMS failed" };
    }

    const sms = buildSmsRecord({
      prospectId,
      to,
      body,
      sequence,
      method: "vonage",
      from: getVonagePhoneNumber(),
      messageSid: result.messageId,
    });

    return { success: true, sms };
  }

  if (!isTwilioConfigured()) {
    return { success: false, error: "Twilio SMS is not configured" };
  }

  console.log(`  Sending SMS via Twilio to ${to}...`);
  const result = await sendViaTwilio(to, body);
  if (!result.ok) {
    return { success: false, error: result.error || "Twilio SMS failed" };
  }

  const sms = buildSmsRecord({
    prospectId,
    to,
    body,
    sequence,
    method: "twilio",
    from: TWILIO_PHONE_NUMBER,
    messageSid: result.sid,
  });

  await logCost({
    prospectId,
    service: "twilio_sms",
    action: `sms_sequence_${sequence}`,
    costUsd: COST_RATES.twilio_sms,
    metadata: { messageSid: result.sid, to },
  });

  return { success: true, sms };
}

export async function sendSms(
  prospectId: string,
  to: string,
  body: string,
  sequence: number
): Promise<SentSms> {
  const providerOrder = getProviderOrder();
  const errors: string[] = [];

  for (const provider of providerOrder) {
    const result = await trySendWithProvider(provider, prospectId, to, body, sequence);
    if (result.success) {
      await logSms(result.sms);
      return result.sms;
    }

    errors.push(`${provider}: ${result.error}`);
    console.warn(`[SMS] ${provider} send failed for ${to}: ${result.error}`);
  }

  if (!isSmsConfigured()) {
    const sms = buildSmsRecord({
      prospectId,
      to,
      body,
      sequence,
      method: "mock",
    });
    console.log(`  [MOCK] SMS to ${to}: "${body.substring(0, 60)}..."`);
    await logSms(sms);
    return sms;
  }

  throw new Error(`SMS delivery failed. Attempts: ${errors.join(" | ")}`);
}

export async function getSmsHistory(prospectId: string): Promise<SentSms[]> {
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
        method: (row.method as SmsMethod) || "mock",
        messageSid: row.message_sid as string | undefined,
      }));
    } catch {
      return [];
    }
  }

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

export function isSmsConfigured(): boolean {
  return isVonageConfigured() || isTwilioConfigured();
}

export function getActiveSmsProviderPreference(): SmsProvider {
  return getSmsProviderPreference();
}

export function getConfiguredSmsProviders(): SmsMethod[] {
  const providers: SmsMethod[] = [];
  if (isVonageConfigured()) providers.push("vonage");
  if (isTwilioConfigured()) providers.push("twilio");
  if (providers.length === 0) providers.push("mock");
  return providers;
}

// --- SMS Templates ---
//
// Rewritten 2026-04-19 to match the email template rules (see CLAUDE.md
// "Outreach Email Template Rules" + "Short URL Rules"). SMS templates
// follow the same principles, adapted for the constraints of the channel:
//   - Short URL via getShortPreviewUrl() — full UUIDs break on mobile
//     line-wrapping and look like spam links in iMessage/Android
//   - ONE link only (the preview). No calendly, no portfolio link.
//   - Zero pricing language, zero scarcity ("goes offline in X weeks"),
//     zero "book a walkthrough" CTA
//   - Personal 1-to-1 voice; mention Ben by name in the initial SMS so
//     it doesn't look like a spam bot
//   - Mention specific time-investment ("spent some time this week") to
//     carry the reciprocity hook from the email template
//   - STOP compliance on every single message (A2P 10DLC requirement)
//   - Under 2 SMS segments (~306 chars total) to keep send cost down
//
// The `previewUrl` and `videoUrl` parameters are kept for backward
// compatibility with existing callers (funnel-manager, outreach/bulk,
// sms/send routes) but we IGNORE whatever they pass and always use the
// canonical short URL. That way we don't have to update every caller and
// the short URL rule is enforced regardless of how the template is invoked.

export function getInitialSms(
  prospect: Prospect,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _previewUrl?: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _videoUrl?: string,
): string {
  const name = prospect.ownerName?.split(" ")[0] || "there";
  const url = getShortPreviewUrl(prospect);
  return `Hey ${name}, Ben from BlueJays — spent some time this week building a website for ${prospect.businessName}: ${url} Take a look when you have a sec. Reply STOP to opt out`;
}

export function getFollowUpSms1(
  prospect: Prospect,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _previewUrl?: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _videoUrl?: string,
): string {
  const firstName = prospect.ownerName?.split(" ")[0]?.trim();
  const url = getShortPreviewUrl(prospect);
  // With a real name: "Mike — circling back..."  (friendly personal).
  // Without one: "Quick nudge — circling back..." (no lowercase "there —"
  // sentence start which reads broken).
  const opener = firstName ? `${firstName} — ` : "Quick nudge — ";
  return `${opener}circling back on the site I built for ${prospect.businessName}: ${url} Curious what you'd change. Reply STOP to opt out`;
}

export function getFollowUpSms2(
  prospect: Prospect,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _previewUrl?: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _videoUrl?: string,
): string {
  const firstName = prospect.ownerName?.split(" ")[0]?.trim();
  const url = getShortPreviewUrl(prospect);
  const opener = firstName ? `${firstName} — last check on that ` : "Last check on that ";
  return `${opener}${prospect.businessName} site: ${url} If timing's off, just say so and I'll stop reaching out. Reply STOP to opt out`;
}

export function getPostVoicemailSms(
  prospect: Prospect,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _previewUrl?: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _videoUrl?: string,
): string {
  const name = prospect.ownerName?.split(" ")[0] || "there";
  const url = getShortPreviewUrl(prospect);
  return `Hey ${name}, just left you a voicemail about the site I built for ${prospect.businessName}: ${url} Reply STOP to opt out`;
}
