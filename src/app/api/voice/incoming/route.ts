import { NextRequest } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

/**
 * POST /api/voice/incoming
 *
 * Twilio webhook on the BlueJays inbound number. Greets the caller +
 * starts the conversation by handing speech-recognition over to the
 * Twilio <Gather> verb, which POSTs the transcript to /api/voice/turn.
 *
 * Wire this URL into your Twilio number's Voice Configuration:
 *   "A CALL COMES IN" → Webhook → https://bluejayportfolio.com/api/voice/incoming
 *
 * No auth header — this is a public Twilio webhook. Twilio's request
 * signature could be verified later (TWILIO_AUTH_TOKEN); for v1 we
 * accept all POSTs since the URL itself is the secret.
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://bluejayportfolio.com";

export async function POST(request: NextRequest) {
  let from: string | null = null;
  let to: string | null = null;
  let callSid: string | null = null;

  try {
    const form = await request.formData();
    callSid = String(form.get("CallSid") || "");
    from = String(form.get("From") || "");
    to = String(form.get("To") || "");
  } catch {
    // Couldn't parse form body — Twilio always POSTs form-urlencoded;
    // just continue with nulls and the call still works.
  }

  // Best-effort log row — fire-and-forget so we don't block on DB
  // for an inbound call.
  if (callSid && isSupabaseConfigured()) {
    void supabase
      .from("voice_call_logs")
      .upsert(
        {
          twilio_call_sid: callSid,
          from_number: from,
          to_number: to,
        },
        { onConflict: "twilio_call_sid" },
      )
      .then(({ error }) => {
        if (error) console.warn("[voice/incoming] log insert failed:", error);
      });
  }

  // Send TwiML response. The <Gather> hands the transcript to
  // /api/voice/turn, which runs the Claude turn logic + emits the
  // next TwiML.
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna-Neural">Hi! Thanks for calling BlueJays. I'm Ben's AI receptionist — what brings you here today?</Say>
  <Gather input="speech" speechTimeout="auto" speechModel="experimental_conversations" action="${SITE_URL}/api/voice/turn" method="POST">
    <Say voice="Polly.Joanna-Neural">Take your time.</Say>
  </Gather>
  <Say voice="Polly.Joanna-Neural">I didn't catch that. Please leave a message after the tone.</Say>
  <Record maxLength="120" action="${SITE_URL}/api/voice/voicemail" method="POST" />
</Response>`;

  return new Response(twiml, {
    headers: { "Content-Type": "text/xml" },
  });
}
