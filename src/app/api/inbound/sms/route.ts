import { NextRequest, NextResponse } from "next/server";
import { getProspectByPhone, getAllProspects } from "@/lib/store";
import { processIncomingMessage } from "@/lib/ai-responder";
import { sendSms } from "@/lib/sms";
import { alertProspectResponded, alertAngryResponse, alertCustomRequest, alertObjectionResponse, alertEscalation } from "@/lib/alerts";
import { markProspectReplied } from "@/lib/followup-scheduler";
import { queueDelayedReply, queuePendingReview, isAutoReplyEnabled } from "@/lib/delayed-replies";
import { alertOwner } from "@/lib/alerts";

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
  // Verify Twilio signature in production to prevent spoofed requests
  const signature = request.headers.get("x-twilio-signature");
  if (!signature && process.env.NODE_ENV === "production") {
    return new NextResponse("Missing Twilio signature", { status: 403 });
  }

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

    // Track that the prospect replied (for follow-up scheduler)
    markProspectReplied(prospect.id);

    // Process through AI responder
    const aiResponse = await processIncomingMessage(prospect, {
      from: fromPhone,
      body,
      channel: "sms",
    });

    // Queue AI-generated reply.
    // - When AI_AUTO_REPLY_ENABLED=false → park in pending_review and SMS Ben.
    // - Otherwise → queueDelayedReply with speed-bypass for high-intent intents.
    if (aiResponse.shouldReply && aiResponse.reply) {
      try {
        if (!isAutoReplyEnabled()) {
          await queuePendingReview(
            prospect.id,
            "sms",
            fromPhone,
            aiResponse.reply,
            undefined,
            { intent: aiResponse.intent }
          );
          console.log(`[Inbound SMS] AI auto-reply DISABLED — parked for review (${prospect.businessName})`);
          // Deep link to the Needs Review tile. PendingRepliesPanel mounts at
          // the top of /dashboard so the anchor is informational.
          const dashboardUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "https://bluejayportfolio.com"}/dashboard#pending-review`;
          await alertOwner({
            type: "prospect-responded",
            message: `Inbound from ${prospect.businessName} — AI drafted reply, needs review: ${dashboardUrl}`,
            prospect,
            timestamp: new Date().toISOString(),
          });
        } else {
          await queueDelayedReply(
            prospect.id,
            "sms",
            fromPhone,
            aiResponse.reply,
            undefined,
            { intent: aiResponse.intent }
          );
          console.log(`[Inbound SMS] AI reply queued for ${fromPhone} (intent=${aiResponse.intent})`);
        }
      } catch (err) {
        console.error(`[Inbound SMS] Failed to queue reply: ${(err as Error).message}`);
      }
    }

    // Trigger alerts based on intent and escalation rules
    if (aiResponse.intent === "interested" || aiResponse.escalate) {
      await alertProspectResponded(prospect, body);
    }
    if (aiResponse.intent === "angry") {
      await alertAngryResponse(prospect, body);
    }
    if (aiResponse.intent === "custom_request") {
      await alertCustomRequest(prospect, body);
    }
    if (aiResponse.intent === "objection" && aiResponse.objectionType) {
      await alertObjectionResponse(prospect, aiResponse.objectionType, body);
    }
    // Escalation alerts with urgency levels
    if (aiResponse.escalate && aiResponse.escalateUrgency) {
      await alertEscalation(prospect, aiResponse.escalateReason || "Escalation triggered", aiResponse.escalateUrgency);
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
