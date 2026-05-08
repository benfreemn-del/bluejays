import { NextRequest } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { sendOwnerAlert } from "@/lib/alerts";

/**
 * POST /api/voice/voicemail
 *
 * Twilio fires this when <Record> finishes (caller hung up or
 * maxLength elapsed). Stamps the recording URL on the call log
 * and alerts Ben.
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const callSid = String(form.get("CallSid") || "");
  const recordingUrl = String(form.get("RecordingUrl") || "");
  const fromNumber = String(form.get("From") || "");

  if (callSid && isSupabaseConfigured()) {
    await supabase
      .from("voice_call_logs")
      .update({
        voicemail_url: recordingUrl ? `${recordingUrl}.mp3` : null,
        ended_at: new Date().toISOString(),
        intent: "voicemail",
      })
      .eq("twilio_call_sid", callSid);
  }

  void sendOwnerAlert(
    `📞 New voicemail\nFrom: ${fromNumber}\nListen: ${recordingUrl}.mp3`,
  ).catch(() => {});

  // Polite wrap-up TwiML
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna-Neural">Got it. Ben will call you back. Have a good one.</Say>
  <Hangup />
</Response>`;

  return new Response(twiml, { headers: { "Content-Type": "text/xml" } });
}
