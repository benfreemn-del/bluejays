/**
 * POST /api/review-request/send
 *
 * Sends an SMS review request to one of the client's customers.
 * The SMS contains a link to the review funnel page at /review/[prospectId]
 * where the customer rates 1-5 stars. 5 stars → Google. Under 5 → private
 * feedback routed to the business owner's inbox.
 *
 * Body: { prospectId, customerPhone, customerName? }
 */

import { NextRequest, NextResponse } from "next/server";
import { getProspect } from "@/lib/store";

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;
// Hardcoded per CLAUDE.md Rule 16 — Vercel had stale NEXT_PUBLIC_BASE_URL.
const BASE_URL = "https://bluejayportfolio.com";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { prospectId, customerPhone, customerName } = body as {
    prospectId: string;
    customerPhone: string;
    customerName?: string;
  };

  if (!prospectId || !customerPhone) {
    return NextResponse.json({ error: "prospectId and customerPhone are required" }, { status: 400 });
  }

  const prospect = await getProspect(prospectId);
  if (!prospect) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }

  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
    return NextResponse.json({ error: "SMS not configured" }, { status: 503 });
  }

  const reviewUrl = `${BASE_URL}/review/${prospectId}`;
  const greeting = customerName ? `Hi ${customerName.split(" ")[0]}!` : "Hi!";

  const message = [
    `${greeting} This is ${prospect.businessName}.`,
    `We'd love your feedback on your recent experience.`,
    `It only takes 30 seconds: ${reviewUrl}`,
  ].join(" ");

  // Normalize phone number
  const to = customerPhone.replace(/\D/g, "");
  const formatted = to.startsWith("1") ? `+${to}` : `+1${to}`;

  const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
  const response = await fetch(twilioUrl, {
    method: "POST",
    headers: {
      Authorization: "Basic " + Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      To: formatted,
      From: TWILIO_PHONE_NUMBER,
      Body: message,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error("Twilio review request failed:", err);
    return NextResponse.json({ error: "SMS delivery failed" }, { status: 502 });
  }

  const result = await response.json();
  return NextResponse.json({ success: true, messageSid: result.sid, reviewUrl });
}
