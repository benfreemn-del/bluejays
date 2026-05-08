import { NextRequest } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { nextTurn, type VoiceTurn } from "@/lib/voice-agent";
import { sendOwnerAlert } from "@/lib/alerts";

/**
 * POST /api/voice/turn
 *
 * Called by Twilio's <Gather> after each caller utterance. Pulls the
 * SpeechResult, runs Claude to produce the next reply, returns TwiML
 * that either continues the conversation, books, transfers, or
 * routes to voicemail.
 *
 * Conversation state lives in voice_call_logs.transcript (jsonb
 * array of {role, text, t}). Each turn appends to the array.
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 30;

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://bluejayportfolio.com";
const BOOKING_URL = process.env.BEN_BOOKING_URL || `${SITE_URL}/schedule`;
const TRANSFER_NUMBER = process.env.OWNER_PHONE_NUMBER || "";
const TWILIO_FROM_NUMBER = process.env.TWILIO_PHONE_NUMBER || "";

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

async function sendBookingSms(toNumber: string, callerSaid: string) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const tok = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !tok || !TWILIO_FROM_NUMBER || !toNumber) return false;

  const body = `Hi! Ben's AI receptionist here — got your call. Here's the booking link to grab a 15-min slot with Ben: ${BOOKING_URL}\n\nQuick context I noted: ${callerSaid.slice(0, 120)}\n\nReply HELP for anything else. Reply STOP to opt out.`;

  try {
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization:
            "Basic " + Buffer.from(`${sid}:${tok}`).toString("base64"),
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          From: TWILIO_FROM_NUMBER,
          To: toNumber,
          Body: body,
        }).toString(),
      },
    );
    return res.ok;
  } catch (err) {
    console.error("[voice/turn] booking SMS failed:", err);
    return false;
  }
}

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const callSid = String(form.get("CallSid") || "");
  const speechResult = String(form.get("SpeechResult") || "").trim();
  const callerNumber = String(form.get("From") || "");

  // No transcript? Re-prompt + extend the gather window.
  if (!speechResult) {
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna-Neural">Sorry, I didn't catch that. Could you say it again?</Say>
  <Gather input="speech" speechTimeout="auto" speechModel="experimental_conversations" action="${SITE_URL}/api/voice/turn" method="POST" />
  <Say voice="Polly.Joanna-Neural">Please leave a message after the tone.</Say>
  <Record maxLength="120" action="${SITE_URL}/api/voice/voicemail" method="POST" />
</Response>`;
    return new Response(twiml, { headers: { "Content-Type": "text/xml" } });
  }

  // Pull transcript history from the call log
  let history: VoiceTurn[] = [];
  if (callSid && isSupabaseConfigured()) {
    const { data: row } = await supabase
      .from("voice_call_logs")
      .select("transcript")
      .eq("twilio_call_sid", callSid)
      .maybeSingle();
    if (row && Array.isArray((row as { transcript?: VoiceTurn[] }).transcript)) {
      history = (row as { transcript: VoiceTurn[] }).transcript;
    }
  }

  // Run Claude
  const action = await nextTurn(history, speechResult);

  // Append both turns to the transcript and persist
  const now = new Date().toISOString();
  const updatedTranscript: VoiceTurn[] = [
    ...history,
    { role: "caller", text: speechResult, t: now },
    { role: "ai", text: action.reply, t: new Date().toISOString() },
  ];

  if (callSid && isSupabaseConfigured()) {
    await supabase
      .from("voice_call_logs")
      .update({
        transcript: updatedTranscript,
        total_turns: updatedTranscript.length,
        ...(action.type !== "continue" ? { intent: action.type, ended_at: now } : {}),
      })
      .eq("twilio_call_sid", callSid);
  }

  // Build TwiML based on action
  const replySsml = `<Say voice="Polly.Joanna-Neural">${escapeXml(action.reply)}</Say>`;

  switch (action.type) {
    case "book": {
      const sent = callerNumber
        ? await sendBookingSms(callerNumber, action.reasonForBooking)
        : false;
      if (callSid && sent && isSupabaseConfigured()) {
        await supabase
          .from("voice_call_logs")
          .update({ booking_link_sent: true })
          .eq("twilio_call_sid", callSid);
      }
      // Alert Ben of a booked-intent call
      void sendOwnerAlert(
        `📞 AI receptionist: caller wants to book\nFrom: ${callerNumber}\nReason: ${action.reasonForBooking}\nSMS sent: ${sent ? "yes" : "no"}`,
      ).catch(() => {});
      const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  ${replySsml}
  <Say voice="Polly.Joanna-Neural">Talk soon. Bye!</Say>
  <Hangup />
</Response>`;
      return new Response(twiml, { headers: { "Content-Type": "text/xml" } });
    }
    case "transfer": {
      const dialTo = TRANSFER_NUMBER
        ? `<Dial timeout="20">${escapeXml(TRANSFER_NUMBER)}</Dial>`
        : `<Say voice="Polly.Joanna-Neural">Ben isn't available right now — please leave a message after the tone.</Say><Record maxLength="120" action="${SITE_URL}/api/voice/voicemail" method="POST" />`;
      void sendOwnerAlert(
        `📞 AI receptionist: transfer attempt\nFrom: ${callerNumber}`,
      ).catch(() => {});
      const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  ${replySsml}
  ${dialTo}
</Response>`;
      return new Response(twiml, { headers: { "Content-Type": "text/xml" } });
    }
    case "voicemail":
    case "wrong-number": {
      const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  ${replySsml}
  <Record maxLength="120" action="${SITE_URL}/api/voice/voicemail" method="POST" />
</Response>`;
      return new Response(twiml, { headers: { "Content-Type": "text/xml" } });
    }
    case "continue":
    default: {
      const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  ${replySsml}
  <Gather input="speech" speechTimeout="auto" speechModel="experimental_conversations" action="${SITE_URL}/api/voice/turn" method="POST" />
  <Say voice="Polly.Joanna-Neural">If you're still there, please leave a message after the tone.</Say>
  <Record maxLength="120" action="${SITE_URL}/api/voice/voicemail" method="POST" />
</Response>`;
      return new Response(twiml, { headers: { "Content-Type": "text/xml" } });
    }
  }
}
