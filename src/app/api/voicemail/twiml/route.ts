import { NextRequest, NextResponse } from "next/server";
import { getVoicemailTwiml } from "@/lib/voicemail";

/**
 * TwiML endpoint — Twilio calls this to get the voicemail script.
 * Returns XML that tells Twilio what to play when voicemail is detected.
 */
export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const businessName = request.nextUrl.searchParams.get("businessName") || "your business";
  const answeredBy = formData.get("AnsweredBy") as string || "";

  let twiml: string;

  if (answeredBy === "human") {
    // Human answered — hang up (we only want voicemail drops)
    twiml = `<?xml version="1.0" encoding="UTF-8"?><Response><Hangup/></Response>`;
  } else {
    // Machine/voicemail — play our message
    twiml = getVoicemailTwiml(businessName);
  }

  return new NextResponse(twiml, {
    headers: { "Content-Type": "text/xml" },
  });
}

// Also handle GET for initial call setup
export async function GET(request: NextRequest) {
  const businessName = request.nextUrl.searchParams.get("businessName") || "your business";
  const twiml = getVoicemailTwiml(businessName);

  return new NextResponse(twiml, {
    headers: { "Content-Type": "text/xml" },
  });
}
