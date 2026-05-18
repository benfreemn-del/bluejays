import { NextRequest, NextResponse } from "next/server";
import { getProspectByPhone, getAllProspects } from "@/lib/store";
import { processIncomingMessage } from "@/lib/ai-responder";
import { sendSms } from "@/lib/sms";
import { alertProspectResponded, alertAngryResponse, alertCustomRequest, alertObjectionResponse, alertEscalation } from "@/lib/alerts";
import { markProspectReplied } from "@/lib/followup-scheduler";
import { queueDelayedReply, queuePendingReview, isAutoReplyEnabled } from "@/lib/delayed-replies";
import { alertOwner } from "@/lib/alerts";
import { tryHandleReviewBlastReply } from "@/lib/review-blast";
import { detectReply } from "@/lib/client-funnels/reply-detector";
import { captureSocialLead, looksLikeSocialCapture } from "@/lib/social-leads";

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

    // Owner-phone routes — these all gate on `isFromOwner`. Order:
    //   1. Outbox approval (YES/NO <short_code>) — bj ai Day-4
    //   2. Social-lead capture (URL or pasted post text)
    // Anything else from owner falls through to the prospect-lookup
    // path below.
    const ownerPhone = (process.env.OWNER_PHONE_NUMBER || "").trim();
    const isFromOwner = ownerPhone && fromPhone === ownerPhone;

    if (isFromOwner) {
      // 1. Outbox approval / rejection — "YES <code>" or "NO <code>"
      // (case-insensitive, whitespace-tolerant). Short codes are
      // 8-char lowercase alphanumeric per src/lib/outbox.ts.
      const outboxMatch = body
        .trim()
        .toLowerCase()
        .match(/^(yes|no|y|n)\s+([a-z0-9]{8})\b/);
      if (outboxMatch) {
        const verb = outboxMatch[1].startsWith("y") ? "approve" : "reject";
        const code = outboxMatch[2];
        try {
          if (verb === "approve") {
            const { approveOutboxDraft } = await import("@/lib/outbox");
            const result = await approveOutboxDraft(code, "sms");
            if (!result) {
              return twimlResponse(`✗ no draft with code ${code}`);
            }
            if (result.status === "not_pending") {
              return twimlResponse(
                `· draft ${code} already ${result.row.status}`,
              );
            }
            if (!result.ok) {
              return twimlResponse(
                `✗ send failed: ${result.error.slice(0, 120)}`,
              );
            }
            return twimlResponse(`✓ sent ${code} via ${result.row.sent_via}`);
          } else {
            const { rejectOutboxDraft } = await import("@/lib/outbox");
            const row = await rejectOutboxDraft(code);
            if (!row) return twimlResponse(`✗ no draft with code ${code}`);
            return twimlResponse(`✓ rejected ${code}`);
          }
        } catch (err) {
          console.error("[Inbound SMS] outbox approval failed:", err);
          return twimlResponse(`✗ outbox error — check Vercel logs`);
        }
      }
    }

    // Social-lead capture — gated to Ben's phone. When Ben texts a
    // Facebook/X/LinkedIn URL (or pastes post text) from his own
    // phone, we classify the post + draft a personalized opener and
    // SMS it back to him. Same Twilio number; different intent path.
    if (isFromOwner && looksLikeSocialCapture(body)) {
      console.log(`[Inbound SMS] Routing to social-lead capture (from owner)`);
      try {
        const captured = await captureSocialLead({
          rawBody: body,
          capturedVia: "sms",
        });
        if (captured) {
          // Reply with TwiML so Ben gets the draft directly in the
          // same SMS thread — no separate sendSms round-trip needed.
          const reply = [
            `📥 ${captured.intent} · captured`,
            captured.summary ? captured.summary.slice(0, 140) : "",
            ``,
            `DRAFT (copy-paste):`,
            captured.drafted,
            ``,
            `→ /dashboard/social-leads`,
          ]
            .filter(Boolean)
            .join("\n");
          return twimlResponse(reply);
        }
        return twimlResponse(
          "couldn't capture that one — Anthropic API or Supabase env may be off. Check /dashboard/social-leads.",
        );
      } catch (err) {
        console.warn("[Inbound SMS] Social-lead capture failed:", err);
        return twimlResponse(
          "social-lead capture errored — saved nothing. logs in Vercel.",
        );
      }
    }

    // Review-blast reply detection — runs BEFORE prospect lookup
    // because the sender phone is a customer-of-our-customer, not a
    // prospect themselves. If we recently sent a Review Blast SMS to
    // this number, forward the reply to the business's owner email
    // and short-circuit (don't run through the AI responder, which
    // would try to handle this as a sales-funnel reply).
    const reviewBlastReply = await tryHandleReviewBlastReply(fromPhone, body);
    if (reviewBlastReply.handled) {
      console.log(
        `[Inbound SMS] Routed to Review Blast business owner${reviewBlastReply.forwardedTo ? ` (${reviewBlastReply.forwardedTo})` : ""}`,
      );
      return twimlResponse("");
    }

    // First — does this match a client_lead (per-client AI funnel)? If
    // so, mark them responded and bail. The dashboard surfaces the
    // reply for the specific client owner; we don't auto-respond on a
    // client funnel because tone needs to be the client's, not Ben's.
    try {
      const detected = await detectReply({
        channel: "sms",
        fromAddress: fromPhone,
        body,
      });
      if (detected) {
        console.log(
          `[Inbound SMS] Matched client_lead ${detected.lead.id} (${detected.client_slug}) — marked responded.`,
        );
        return twimlResponse("");
      }
    } catch (err) {
      console.error("[Inbound SMS] client-funnel reply detect failed:", err);
    }

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
          // Hardcoded per CLAUDE.md Rule 16 — stale NEXT_PUBLIC_BASE_URL on Vercel.
          const dashboardUrl = `https://bluejayportfolio.com/dashboard#pending-review`;
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
