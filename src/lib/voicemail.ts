/**
 * Voicemail Drop System — Twilio-powered ringless voicemail drops.
 *
 * Uses Twilio's programmable voice to call the prospect's number
 * and leave a pre-recorded voicemail when it goes to voicemail.
 *
 * The system uses AMD (Answering Machine Detection) to detect
 * voicemail and plays the pre-recorded message. If a human answers,
 * it hangs up (we only want voicemail drops, not live calls).
 */

import { v4 as uuidv4 } from "uuid";
import { supabase, isSupabaseConfigured } from "./supabase";

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://bluejayportfolio.com";

// Pre-recorded voicemail URL — Ben records this and we host it
// For now, use Twilio's TTS as fallback until Ben uploads his recording
const VOICEMAIL_AUDIO_URL = `${BASE_URL}/api/voicemail/audio`;

export interface VoicemailDrop {
  id: string;
  prospectId: string;
  to: string;
  from: string;
  status: "queued" | "sent" | "delivered" | "failed" | "human-answered";
  sentAt: string;
  duration?: number;
}

/**
 * Drop a voicemail to a prospect's phone.
 * Uses Twilio AMD to detect voicemail, plays pre-recorded message.
 */
export async function dropVoicemail(
  prospectId: string,
  to: string,
  businessName: string
): Promise<VoicemailDrop> {
  const drop: VoicemailDrop = {
    id: uuidv4(),
    prospectId,
    to,
    from: TWILIO_PHONE_NUMBER || "+10000000000",
    status: "queued",
    sentAt: new Date().toISOString(),
  };

  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
    console.log(`  📞 [MOCK] Voicemail drop to ${to} for ${businessName}`);
    drop.status = "sent";
    await logVoicemailDrop(drop);
    return drop;
  }

  try {
    console.log(`  📞 Dropping voicemail to ${to} for ${businessName}...`);

    // Create a Twilio call with AMD (Answering Machine Detection)
    const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Calls.json`;
    const twimlUrl = `${BASE_URL}/api/voicemail/twiml?prospectId=${encodeURIComponent(prospectId)}&businessName=${encodeURIComponent(businessName)}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: "Basic " + Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        To: to,
        From: TWILIO_PHONE_NUMBER,
        Url: twimlUrl, // TwiML that plays the voicemail
        MachineDetection: "DetectMessageEnd", // Wait for beep before playing
        MachineDetectionTimeout: "10",
        AsyncAmd: "true",
        AsyncAmdStatusCallback: `${BASE_URL}/api/voicemail/status?dropId=${drop.id}`,
        Timeout: "20", // Ring for 20 seconds max
      }),
    });

    if (response.ok) {
      const data = await response.json();
      drop.status = "sent";
      console.log(`  ✅ Voicemail call initiated: ${data.sid}`);
    } else {
      const errText = await response.text();
      console.error(`  ❌ Twilio call failed: ${errText}`);
      drop.status = "failed";
    }
  } catch (error) {
    console.error(`  ❌ Voicemail drop error: ${(error as Error).message}`);
    drop.status = "failed";
  }

  await logVoicemailDrop(drop);
  return drop;
}

/**
 * Get the TwiML script for the voicemail.
 * If Ben has uploaded a recording, use that.
 * Otherwise, use Twilio TTS with a natural-sounding script.
 */
export function getVoicemailTwiml(businessName: string): string {
  // Check if a custom recording exists
  const hasRecording = false; // TODO: check if /public/voicemail.mp3 exists

  if (hasRecording) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Pause length="1"/>
  <Play>${BASE_URL}/voicemail.mp3</Play>
</Response>`;
  }

  // Fallback: TTS voicemail (sounds less natural but works)
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Pause length="1"/>
  <Say voice="man" language="en-US">
    Hey, this is Ben from BlueJays. I came across ${businessName} and was really impressed with what you've built.
    So I actually went ahead and put together a custom website for you, completely free. No catch.
    I'll shoot you a text with the link so you can check it out on your phone.
    If you love it, awesome. If not, no worries at all. Have a great day!
  </Say>
</Response>`;
}

/**
 * Generate a personalized TwiML that handles AMD results.
 * - If voicemail: play the message after the beep
 * - If human answers: hang up politely (we only want voicemail)
 */
export function getAmdTwiml(amdResult: string, businessName: string): string {
  if (amdResult === "machine_end_beep" || amdResult === "machine_end_silence") {
    // Voicemail detected — play our message
    return getVoicemailTwiml(businessName);
  }

  // Human answered — hang up (we only want voicemail drops)
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Hangup/>
</Response>`;
}

async function logVoicemailDrop(drop: VoicemailDrop) {
  if (isSupabaseConfigured()) {
    try {
      await supabase.from("voicemail_drops").insert({
        id: drop.id,
        prospect_id: drop.prospectId,
        to_number: drop.to,
        from_number: drop.from,
        status: drop.status,
        sent_at: drop.sentAt,
      });
    } catch {
      // Table might not exist yet
    }
  }
  console.log(`  📞 Voicemail drop logged: ${drop.status}`);
}

export function isTwilioVoiceConfigured(): boolean {
  return !!(TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_PHONE_NUMBER);
}

/**
 * Voicemail script templates for different scenarios
 */
export const VOICEMAIL_SCRIPTS = {
  initial: (businessName: string) =>
    `Hey, this is Ben from BlueJays. I came across ${businessName} and was really impressed with what you've built. So I actually went ahead and put together a custom website for you, completely free. No catch. I'll shoot you a text with the link so you can check it out on your phone. If you love it, awesome. If not, no worries at all. Have a great day!`,

  followUp: (businessName: string) =>
    `Hey, this is Ben again from BlueJays. I left you a message a few days ago about the website I built for ${businessName}. Just wanted to make sure you got the text with the link. Take 30 seconds to check it out when you get a chance. No pressure at all. Talk soon!`,
};
