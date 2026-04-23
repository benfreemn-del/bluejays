/**
 * POST /api/missed-call/callback
 *
 * Twilio StatusCallback fired after every call completes.
 * When a call is missed (no-answer, busy, or very short duration),
 * we automatically send the caller an SMS with a booking link.
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

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://bluejayportfolio.com";

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

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const callStatus = formData.get("CallStatus") as string;
  const callDuration = formData.get("CallDuration") as string;
  const callerNumber = formData.get("From") as string; // person who called
  const calledNumber = formData.get("To") as string;   // client's Twilio number

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

  // Send from the client's Twilio number so replies go back to them
  const fromNumber = calledNumber || TWILIO_PHONE_NUMBER || "";
  await sendSms(callerNumber, fromNumber, message);

  console.log(`[missed-call] Auto-SMS sent to ${callerNumber} for ${prospect.businessName}`);
  return NextResponse.json({ sent: true, to: callerNumber, businessName: prospect.businessName });
}
