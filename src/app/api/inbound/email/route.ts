import { NextRequest, NextResponse } from "next/server";
import { getProspectByEmail, getAllProspects } from "@/lib/store";
import { processIncomingMessage } from "@/lib/ai-responder";
import { sendEmail } from "@/lib/email-sender";
import { alertProspectResponded, alertAngryResponse, alertCustomRequest, alertObjectionResponse, alertEscalation } from "@/lib/alerts";
import { markProspectReplied } from "@/lib/followup-scheduler";
import { queueDelayedReply, queuePendingReview, isAutoReplyEnabled } from "@/lib/delayed-replies";
import { alertOwner } from "@/lib/alerts";

/**
 * POST /api/inbound/email
 *
 * SendGrid Inbound Parse webhook handler.
 * Receives incoming emails, matches the sender to a prospect,
 * generates an AI response, and sends a reply.
 *
 * This route MUST be publicly accessible (excluded from middleware auth).
 *
 * SendGrid Inbound Parse sends multipart/form-data with fields:
 * - from: sender email (e.g., "John Doe <john@example.com>")
 * - to: recipient email
 * - subject: email subject
 * - text: plain text body
 * - html: HTML body
 * - envelope: JSON string with from/to
 * - headers: raw email headers
 */

export async function POST(request: NextRequest) {
  try {
    // Parse the incoming form data from SendGrid
    const formData = await request.formData();

    const fromRaw = formData.get("from") as string || "";
    const subject = formData.get("subject") as string || "";
    const textBody = formData.get("text") as string || "";
    const htmlBody = formData.get("html") as string || "";
    const envelopeRaw = formData.get("envelope") as string || "";

    // Extract email address from "Name <email>" format
    const fromEmail = extractEmail(fromRaw);
    const body = textBody || stripHtml(htmlBody);

    if (!fromEmail || !body) {
      console.log("[Inbound Email] Missing from or body — ignoring");
      return NextResponse.json({ received: true });
    }

    console.log(`[Inbound Email] Received from ${fromEmail}: "${subject}"`);

    // Try to extract email from envelope as fallback
    let envelopeFrom = "";
    try {
      const envelope = JSON.parse(envelopeRaw);
      envelopeFrom = envelope.from || "";
    } catch {
      // Envelope parsing failed, use fromRaw
    }

    // Match sender to a prospect
    let prospect = await getProspectByEmail(fromEmail);
    if (!prospect && envelopeFrom && envelopeFrom !== fromEmail) {
      prospect = await getProspectByEmail(envelopeFrom);
    }

    // If no exact match, try fuzzy matching on all prospects
    if (!prospect) {
      const allProspects = await getAllProspects();
      prospect = allProspects.find((p) => {
        if (!p.email) return false;
        return p.email.toLowerCase() === fromEmail.toLowerCase();
      });
    }

    if (!prospect) {
      console.log(`[Inbound Email] No matching prospect for ${fromEmail} — ignoring`);
      return NextResponse.json({ received: true, matched: false });
    }

    // Don't process if already unsubscribed
    if (prospect.status === "unsubscribed") {
      console.log(`[Inbound Email] Prospect ${prospect.businessName} is unsubscribed — ignoring`);
      return NextResponse.json({ received: true, unsubscribed: true });
    }

    // Track that the prospect replied (for follow-up scheduler)
    markProspectReplied(prospect.id);

    // Process through AI responder
    const aiResponse = await processIncomingMessage(prospect, {
      from: fromEmail,
      subject,
      body,
      channel: "email",
    });

    // Queue AI-generated reply.
    // - When AI_AUTO_REPLY_ENABLED=false → park in pending_review and SMS Ben.
    // - Otherwise → queueDelayedReply with speed-bypass for high-intent intents.
    if (aiResponse.shouldReply && aiResponse.reply) {
      const replySubject = subject.startsWith("Re:") ? subject : `Re: ${subject}`;
      try {
        if (!isAutoReplyEnabled()) {
          await queuePendingReview(
            prospect.id,
            "email",
            fromEmail,
            aiResponse.reply,
            replySubject,
            { intent: aiResponse.intent }
          );
          console.log(`[Inbound Email] AI auto-reply DISABLED — parked for review (${prospect.businessName})`);
          // Notify Ben so he can review the draft.
          const dashboardUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "https://bluejayportfolio.com"}/dashboard`;
          await alertOwner({
            type: "prospect-responded",
            message: `Inbound from ${prospect.businessName} — AI drafted reply, needs review: ${dashboardUrl}`,
            prospect,
            timestamp: new Date().toISOString(),
          });
        } else {
          await queueDelayedReply(
            prospect.id,
            "email",
            fromEmail,
            aiResponse.reply,
            replySubject,
            { intent: aiResponse.intent }
          );
          console.log(`[Inbound Email] AI reply queued for ${fromEmail} (intent=${aiResponse.intent})`);
        }
      } catch (err) {
        console.error(`[Inbound Email] Failed to queue reply: ${(err as Error).message}`);
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

    return NextResponse.json({
      received: true,
      matched: true,
      prospectId: prospect.id,
      intent: aiResponse.intent,
      replied: aiResponse.shouldReply,
      escalated: aiResponse.escalate,
    });
  } catch (err) {
    console.error("[Inbound Email] Error:", err);
    // Always return 200 to SendGrid so it doesn't retry
    return NextResponse.json({ received: true, error: "Processing failed" });
  }
}

/**
 * Extract email address from "Name <email>" format.
 */
function extractEmail(raw: string): string {
  const match = raw.match(/<([^>]+)>/);
  if (match) return match[1].toLowerCase();
  // If no angle brackets, check if it's already a plain email
  if (raw.includes("@")) return raw.trim().toLowerCase();
  return "";
}

/**
 * Strip HTML tags to get plain text.
 */
function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .trim();
}
