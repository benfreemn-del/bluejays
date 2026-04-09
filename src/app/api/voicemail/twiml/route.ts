import { NextRequest, NextResponse } from "next/server";
import { getVoicemailTwiml } from "@/lib/voicemail";

/**
 * TwiML endpoint — Twilio calls this to get the voicemail script.
 * Returns XML that tells Twilio what to play when voicemail is detected.
 *
 * Query params:
 *   businessName — prospect's business name
 *   stage        — "initial" (Day 2) | "followUp" (Day 18); defaults to "initial"
 */
export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const businessName = request.nextUrl.searchParams.get("businessName") || "your business";
  const stageParam = request.nextUrl.searchParams.get("stage") || "initial";
  const stage: "initial" | "followUp" = stageParam === "followUp" ? "followUp" : "initial";
  const answeredBy = formData.get("AnsweredBy") as string || "";

  let twiml: string;

  if (answeredBy === "human") {
    // Human answered — hang up (we only want voicemail drops)
    twiml = `<?xml version="1.0" encoding="UTF-8"?><Response><Hangup/></Response>`;
  } else {
    // Machine/voicemail — play the correct pre-recorded MP3
    twiml = getVoicemailTwiml(businessName, undefined, stage);
  }

  return new NextResponse(twiml, {
    headers: { "Content-Type": "text/xml" },
  });
}

// Also handle GET for initial call setup
export async function GET(request: NextRequest) {
  const businessName = request.nextUrl.searchParams.get("businessName") || "your business";
  const stageParam = request.nextUrl.searchParams.get("stage") || "initial";
  const stage: "initial" | "followUp" = stageParam === "followUp" ? "followUp" : "initial";
  const twiml = getVoicemailTwiml(businessName, undefined, stage);

  return new NextResponse(twiml, {
    headers: { "Content-Type": "text/xml" },
  });
}
