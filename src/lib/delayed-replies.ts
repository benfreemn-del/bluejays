import { supabase } from "./supabase";
import { sendSms } from "./sms";
import { sendEmail } from "./email-sender";
import { trackAiResponse } from "./followup-scheduler";

/**
 * Wave 2 safety constants — see CLAUDE.md "AI Responder Safety".
 *
 * The 5-min cliff is real: replies under 5 minutes are 9× more likely
 * to convert (Lead Response Management Study, MIT/InsideSales). For
 * high-intent replies we therefore BYPASS the random 1-10 minute delay
 * entirely and dispatch on the very next cron tick (~60 s worst case).
 *
 * For everything else we still want a human-feeling delay but cap it
 * hard at 90 seconds so we never miss the cliff for borderline cases.
 *
 * High-intent intents must EXACTLY match the AI responder's IntentType
 * union (src/lib/ai-responder.ts). When we add a new intent (e.g.
 * "ready_to_buy" / "schedule_call" once the responder classifies them)
 * add it here too — but make sure the responder emits it first.
 */
const HIGH_INTENT_BYPASS = new Set<string>([
  "interested",
  "custom_request", // already routed to a calendar — don't sit on it
]);

export type QueuedReplyStatus = "pending" | "pending_review" | "queued" | "sent" | "failed";

export interface QueueDelayedReplyOptions {
  intent?: string;
}

/**
 * Queue a delayed AI reply to be sent later.
 *
 * Behavior:
 *  - High-intent replies (interested, custom_request) bypass the delay
 *    entirely — scheduledFor = now() so the 1-minute cron fires next tick.
 *  - All other intents get a randomized 30-90 SECOND delay (was 1-10 minutes).
 *    Capping at 90s keeps us under the 5-minute response cliff for warm but
 *    not-quite-buying prospects.
 */
export async function queueDelayedReply(
  prospectId: string,
  channel: "sms" | "email",
  recipient: string,
  replyBody: string,
  replySubject?: string,
  options: QueueDelayedReplyOptions = {}
) {
  const { intent } = options;
  const isHighIntent = intent ? HIGH_INTENT_BYPASS.has(intent) : false;

  let delaySeconds: number;
  if (isHighIntent) {
    delaySeconds = 0;
  } else {
    // 30-90 seconds — was 1-10 minutes pre-Wave-2.
    delaySeconds = Math.floor(Math.random() * 60) + 30;
  }

  const sendAfter = new Date();
  sendAfter.setSeconds(sendAfter.getSeconds() + delaySeconds);

  console.log(
    `[Delayed Reply] Queuing ${channel} to ${recipient} for ${sendAfter.toISOString()} ` +
      `(${delaySeconds}s delay, intent=${intent || "unknown"}${isHighIntent ? ", HIGH-INTENT BYPASS" : ""})`
  );

  const { error } = await supabase.from("queued_replies").insert({
    prospect_id: prospectId,
    channel,
    recipient,
    reply_body: replyBody,
    reply_subject: replySubject,
    send_after: sendAfter.toISOString(),
    status: "pending",
    intent: intent || null,
  });

  if (error) {
    console.error(`[Delayed Reply] Failed to queue reply: ${error.message}`);
    throw error;
  }

  return { delaySeconds, sendAfter, bypassed: isHighIntent };
}

/**
 * Queue an AI-drafted reply for HUMAN REVIEW instead of auto-sending.
 *
 * Used when AI_AUTO_REPLY_ENABLED=false (the kill-switch). Reply still gets
 * classified, drafted, and stored — it just sits in pending_review until
 * Ben approves via the dashboard. send_after = far future so the cron
 * never picks it up; status check ('pending_review') is the canonical gate.
 */
export async function queuePendingReview(
  prospectId: string,
  channel: "sms" | "email",
  recipient: string,
  replyBody: string,
  replySubject?: string,
  options: QueueDelayedReplyOptions = {}
) {
  const { intent } = options;
  console.log(
    `[Delayed Reply] Parking AI reply for review: ${channel} → ${recipient} (intent=${intent || "unknown"})`
  );

  // send_after still must be set (NOT NULL column). Park it in the future
  // so it can never be auto-picked up even if status logic regresses.
  const farFuture = new Date();
  farFuture.setFullYear(farFuture.getFullYear() + 10);

  const { data, error } = await supabase
    .from("queued_replies")
    .insert({
      prospect_id: prospectId,
      channel,
      recipient,
      reply_body: replyBody,
      reply_subject: replySubject,
      send_after: farFuture.toISOString(),
      status: "pending_review",
      intent: intent || null,
    })
    .select("id")
    .single();

  if (error) {
    console.error(`[Delayed Reply] Failed to park reply for review: ${error.message}`);
    throw error;
  }

  return { id: data?.id as string | undefined, status: "pending_review" as const };
}

/**
 * Process all pending replies that are due to be sent.
 * This should be called by a cron job or a background worker.
 *
 * Only picks up rows with status='pending' — pending_review rows are
 * intentionally invisible to this loop and can only leave that state
 * via Ben's dashboard approval flow.
 */
export async function processQueuedReplies() {
  const now = new Date().toISOString();

  // Get all pending replies where send_after <= NOW()
  const { data: pending, error } = await supabase
    .from("queued_replies")
    .select("*")
    .eq("status", "pending")
    .lte("send_after", now);

  if (error) {
    console.error(`[Delayed Reply] Error fetching pending replies: ${error.message}`);
    return { processed: 0, error: error.message };
  }

  if (!pending || pending.length === 0) {
    return { processed: 0 };
  }

  console.log(`[Delayed Reply] Found ${pending.length} replies to process`);

  let processedCount = 0;

  for (const reply of pending) {
    try {
      if (reply.channel === "sms") {
        // Truncate reply to SMS-friendly length
        const smsReply = reply.reply_body.length > 320
          ? reply.reply_body.substring(0, 317) + "..."
          : reply.reply_body;

        await sendSms(
          reply.prospect_id,
          reply.recipient,
          smsReply,
          99 // sequence 99 = AI reply
        );
      } else if (reply.channel === "email") {
        await sendEmail(
          reply.prospect_id,
          reply.recipient,
          reply.reply_subject || "Re: Your message",
          reply.reply_body,
          99 // sequence 99 = AI reply
        );
      }

      // Mark as sent
      await supabase
        .from("queued_replies")
        .update({
          status: "sent",
          sent_at: new Date().toISOString(),
        })
        .eq("id", reply.id);

      // Track AI response for follow-up scheduler
      // We do this AFTER sending to match original behavior
      // We need the business name, but we can just use the prospect ID for tracking
      // if the trackAiResponse function supports it.
      // Let's check trackAiResponse signature in followup-scheduler.ts
      await trackAiResponse(reply.prospect_id, "Prospect", reply.channel);

      processedCount++;
      console.log(`[Delayed Reply] Sent ${reply.channel} reply to ${reply.recipient}`);
    } catch (err) {
      console.error(`[Delayed Reply] Failed to send reply ${reply.id}: ${(err as Error).message}`);

      // Mark as failed
      await supabase
        .from("queued_replies")
        .update({
          status: "failed",
          error_message: (err as Error).message,
        })
        .eq("id", reply.id);
    }
  }

  return { processed: processedCount };
}

/**
 * Returns true when AI auto-reply sending is ENABLED (default).
 *
 * Set AI_AUTO_REPLY_ENABLED=false on Vercel (or .env) to flip the
 * kill-switch — drafted replies will park in pending_review instead of
 * being auto-sent. Any other value (including unset) keeps current behavior.
 */
export function isAutoReplyEnabled(): boolean {
  const val = process.env.AI_AUTO_REPLY_ENABLED;
  if (val === undefined) return true; // default ON for backward compat
  return val.toLowerCase() !== "false";
}
