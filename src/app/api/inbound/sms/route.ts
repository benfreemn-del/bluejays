import { NextRequest, NextResponse } from "next/server";
import { getProspectByPhone, getAllProspects } from "@/lib/store";
import { processIncomingMessage } from "@/lib/ai-responder";
import { sendSms } from "@/lib/sms";
import { alertProspectResponded, alertAngryResponse, alertCustomRequest } from "@/lib/alerts";

/**
 * POST /api/inbound/sms
 *
 * Twilio incoming SMS webhook handler.
 * Receives incoming SMS messages, matches the sender to a prospect by phone number,
 * generates an AI response, and sends a reply via SMS.
 *
 * This route MUST be publicly accessible (excluded from middleware auth).
 *
 * Twilio sends application/x-www-form-urlencoded with fields:
 * - From: sender phone number (e.g., "+12065551234")
 * - To: your Twilio number
 * - Body: SMS message text
 * - MessageSid: unique message identifier
 * - NumMedia: number of media attachments
 * - AccountSid: Twilio account SID
 */

export async function POST(request: NextRequest) {
  try {
    // Parse the incoming form data from Twilio
    const formData = await request.formData();

    const fromPhone = formData.get("From") as string || "";
    const body = formData.get("Body") as string || "";
    const messageSid = formData.get("MessageSid") as string || "";

    if (!fromPhone || !body) {
      console.log("[Inbound SMS] Missing From or Body — ignoring");
      return twimlResponse("");
    }

    console.log(`[Inbound SMS] Received from ${fromPhone}: "${body.substring(0, 80)}"`);

    // Match sender to a prospect by phone number
    let prospect = await getProspectByPhone(fromPhone);

    // If no match, try fuzzy matching
    if (!prospect) {
      const normalized = fromPhone.replace(/\D/g, "");
      const allProspects = await getAllProspects();
      prospect = allProspects.find((p) => {
        if (!p.phone) return false;
        const pNorm = p.phone.replace(/\D/g, "");
        return pNorm === normalized || pNorm.endsWith(normalized.slice(-10)) || normalized.endsWith(pNorm.slice(-10));
      });
    }

    if (!prospect) {
      console.log(`[Inbound SMS] No matching prospect for ${fromPhone} — ignoring`);
      return twimlResponse("");
    }

    // Don't process if already unsubscribed
    if (prospect.status === "unsubscribed") {
      console.log(`[Inbound SMS] Prospect ${prospect.businessName} is unsubscribed — ignoring`);
      return twimlResponse("");
    }

    // Process through AI responder
    const aiResponse = await processIncomingMessage(prospect, {
      from: fromPhone,
      body,
      channel: "sms",
    });

    // Send AI-generated reply via SMS if appropriate
    if (aiResponse.shouldReply && aiResponse.reply) {
      try {
        // Truncate reply to SMS-friendly length (320 chars = ~2 segments)
        const smsReply = aiResponse.reply.length > 320
          ? aiResponse.reply.substring(0, 317) + "..."
          : aiResponse.reply;

        await sendSms(
          prospect.id,
          fromPhone,
          smsReply,
          99 // sequence 99 = AI reply
        );
        console.log(`[Inbound SMS] AI reply sent to ${fromPhone}`);
      } catch (err) {
        console.error(`[Inbound SMS] Failed to send reply: ${(err as Error).message}`);
      }
    }

    // Trigger alerts based on intent
    if (aiResponse.intent === "interested" || aiResponse.escalate) {
      await alertProspectResponded(prospect, body);
    }
    if (aiResponse.intent === "angry") {
      await alertAngryResponse(prospect, body);
    }
    if (aiResponse.intent === "custom_request") {
      await alertCustomRequest(prospect, body);
    }

    // Return TwiML response (empty = no immediate Twilio reply, we handle it ourselves)
    return twimlResponse("");
  } catch (err) {
    console.error("[Inbound SMS] Error:", err);
    // Return empty TwiML to avoid Twilio errors
    return twimlResponse("");
  }
}

/**
 * Return a TwiML XML response.
 * Twilio expects TwiML format for SMS webhook responses.
 */
function twimlResponse(message: string): NextResponse {
  const twiml = message
    ? `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${escapeXml(message)}</Message></Response>`
    : `<?xml version="1.0" encoding="UTF-8"?><Response></Response>`;

  return new NextResponse(twiml, {
    status: 200,
    headers: {
      "Content-Type": "text/xml",
    },
  });
}

/**
 * Escape special XML characters.
 */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
