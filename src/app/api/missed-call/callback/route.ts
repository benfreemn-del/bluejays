/**
 * POST /api/missed-call/callback
 *
 * Twilio StatusCallback fired after every call completes.
 * When a call is missed (no-answer, busy, or very short duration),
 * we automatically send the caller an SMS with a booking link AND
 * persist a row to `missed_call_logs` so the customer portal's Leads
 * tab can surface the real number of recovered missed calls.
 *
 * Persistence happens BEFORE the SMS dispatches (CLAUDE.md Rule 43:
 * every customer-facing event handler that fires an automated touch
 * MUST persist a log row first — the persistence is the source of
 * truth for the customer portal + monthly report metrics). Insert
 * is wrapped in try/catch so a Supabase outage never blocks the SMS
 * from reaching the caller (highest-priority side effect).
 *
 * Idempotent on Twilio retries via UNIQUE(twilio_call_sid).
 *
 * Configure in Twilio dashboard:
 *   Voice → Phone Number → Status Callback URL:
 *   https://bluejayportfolio.com/api/missed-call/callback
 *
 * The "To" field in the callback is the client's Twilio number.
 * Map that number → prospect using the client_phone_numbers Supabase table.
 */

import { NextRequest, NextResponse } from "next/server";
import { getAllProspects } from "@/lib/store";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;
// Hardcoded per CLAUDE.md Rule 16 — Vercel had stale NEXT_PUBLIC_BASE_URL.
const BASE_URL = "https://bluejayportfolio.com";

type MissedCallStatus = "no-answer" | "busy" | "failed" | "short-completed";

// A call counts as "missed" if:
// - Status is no-answer, busy, or failed
// - OR status is completed but duration was < 10 seconds (rang out, hung up)
function isMissedCall(callStatus: string, callDuration: string): boolean {
  if (callStatus === "no-answer" || callStatus === "busy" || callStatus === "failed") {
    return true;
  }
  if (callStatus === "completed" && parseInt(callDuration || "0", 10) < 10) {
    return true;
  }
  return false;
}

function classifyMissedStatus(
  callStatus: string,
  durationSeconds: number,
): MissedCallStatus {
  if (callStatus === "no-answer") return "no-answer";
  if (callStatus === "busy") return "busy";
  if (callStatus === "failed") return "failed";
  if (callStatus === "completed" && durationSeconds < 10) return "short-completed";
  // Fallback — should never hit because we gate by isMissedCall first.
  return "failed";
}

async function sendSms(to: string, from: string, body: string): Promise<boolean> {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !from) return false;
  const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: "Basic " + Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ To: to, From: from, Body: body }),
  });
  return response.ok;
}

interface InsertedLog {
  id: string;
}

/**
 * Persist the missed call to `missed_call_logs` BEFORE the SMS fires.
 * Returns the inserted row id (or null if the insert failed/skipped).
 *
 * Wrapped in try/catch so any Supabase failure is logged but never
 * blocks the SMS dispatch — the auto-SMS reaching the caller is the
 * highest-priority side effect.
 *
 * Idempotent: ON CONFLICT (twilio_call_sid) DO NOTHING — Twilio
 * retries the StatusCallback on transient errors, but each call SID
 * is unique so we end up with at most one row per call.
 */
async function persistMissedCallLog(args: {
  prospectId: string;
  callerPhone: string;
  callerCity: string | null;
  callerState: string | null;
  callStatus: MissedCallStatus;
  callDurationSeconds: number;
  twilioCallSid: string;
  autoSmsBody: string;
}): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data, error } = await supabase
      .from("missed_call_logs")
      .upsert(
        {
          prospect_id: args.prospectId,
          caller_phone: args.callerPhone,
          caller_city: args.callerCity,
          caller_state: args.callerState,
          call_status: args.callStatus,
          call_duration_seconds: args.callDurationSeconds,
          twilio_call_sid: args.twilioCallSid,
          auto_sms_sent: false,
          auto_sms_body: args.autoSmsBody,
          occurred_at: new Date().toISOString(),
        },
        { onConflict: "twilio_call_sid", ignoreDuplicates: false },
      )
      .select("id")
      .single<InsertedLog>();
    if (error) {
      console.error("[missed-call] Failed to insert log:", error.message);
      return null;
    }
    return data?.id || null;
  } catch (err) {
    console.error("[missed-call] Insert threw:", err);
    return null;
  }
}

/**
 * After the SMS dispatches successfully, flip auto_sms_sent=true on
 * the previously-inserted log row. Best-effort — a failure here means
 * the portal will show the row as "SMS failed" until the next refresh,
 * which is honest data.
 */
async function markSmsSent(rowId: string): Promise<void> {
  if (!isSupabaseConfigured() || !rowId) return;
  try {
    const { error } = await supabase
      .from("missed_call_logs")
      .update({ auto_sms_sent: true })
      .eq("id", rowId);
    if (error) {
      console.error("[missed-call] Failed to mark SMS sent:", error.message);
    }
  } catch (err) {
    console.error("[missed-call] markSmsSent threw:", err);
  }
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const callStatus = formData.get("CallStatus") as string;
  const callDuration = formData.get("CallDuration") as string;
  const callerNumber = formData.get("From") as string; // person who called
  const calledNumber = formData.get("To") as string;   // client's Twilio number
  const callSid = (formData.get("CallSid") as string) || "";
  // Twilio enriches inbound calls with FromCity / FromState when known
  // (US callers via Twilio carriers, etc). May be empty for international
  // callers or when the carrier doesn't provide geo data — we just
  // persist null in that case.
  const fromCity = (formData.get("FromCity") as string) || null;
  const fromState = (formData.get("FromState") as string) || null;

  if (!callerNumber || !calledNumber) {
    return NextResponse.json({ error: "Missing call data" }, { status: 400 });
  }

  if (!isMissedCall(callStatus, callDuration)) {
    // Call was answered — no auto-text needed
    return NextResponse.json({ skipped: true, reason: "call_was_answered" });
  }

  // Find which prospect owns this Twilio number
  // First check if it matches the main TWILIO_PHONE_NUMBER (Ben's shared number)
  // Then check per-prospect clientPhoneNumber field
  const prospects = await getAllProspects();
  const paidProspects = prospects.filter((p) => p.status === "paid" || p.paidAt);

  // Match by clientPhoneNumber (stored as part of scrapedData or a dedicated field)
  const normalizedCalled = calledNumber.replace(/\D/g, "");
  const prospect = paidProspects.find((p) => {
    const clientNum = (p as { clientPhoneNumber?: string }).clientPhoneNumber;
    if (!clientNum) return false;
    return clientNum.replace(/\D/g, "") === normalizedCalled;
  });

  if (!prospect) {
    console.log(`[missed-call] No paid prospect found for number ${calledNumber}`);
    return NextResponse.json({ skipped: true, reason: "no_prospect_for_number" });
  }

  const bookingUrl = `${BASE_URL}/book/${prospect.id}`;
  const message = [
    `Hi! You just called ${prospect.businessName} and we missed you.`,
    `We're sorry we couldn't answer! You can book a time that works for you here:`,
    bookingUrl,
    `We'll also call you back as soon as we're available.`,
  ].join(" ");

  // PERSIST FIRST (Rule 43) — log row lands before the SMS dispatches.
  // Failures are caught and logged but never block the SMS.
  const durationSeconds = parseInt(callDuration || "0", 10);
  const classified = classifyMissedStatus(callStatus, durationSeconds);
  const logRowId = await persistMissedCallLog({
    prospectId: prospect.id,
    callerPhone: callerNumber,
    callerCity: fromCity,
    callerState: fromState,
    callStatus: classified,
    callDurationSeconds: durationSeconds,
    // Fall back to a stable SID surrogate when Twilio doesn't pass one
    // (shouldn't happen in production but keeps us safe for replays).
    twilioCallSid: callSid || `synthetic_${callerNumber}_${Date.now()}`,
    autoSmsBody: message,
  });

  // Send from the client's Twilio number so replies go back to them
  const fromNumber = calledNumber || TWILIO_PHONE_NUMBER || "";
  const smsOk = await sendSms(callerNumber, fromNumber, message);

  // Mark the log as auto_sms_sent=true after the SMS dispatched OK.
  if (smsOk && logRowId) {
    await markSmsSent(logRowId);
  }

  console.log(
    `[missed-call] ${smsOk ? "Auto-SMS sent" : "Auto-SMS failed"} to ${callerNumber} for ${prospect.businessName}`,
  );
  return NextResponse.json({
    sent: smsOk,
    logged: !!logRowId,
    to: callerNumber,
    businessName: prospect.businessName,
  });
}
