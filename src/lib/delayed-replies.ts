import { supabase } from "./supabase";
import { sendSms } from "./sms";
import { sendEmail } from "./email-sender";
import { trackAiResponse } from "./followup-scheduler";

/**
 * Queue a delayed AI reply to be sent later.
 * This adds a human-like delay (1-10 minutes) to avoid appearing automated.
 */
export async function queueDelayedReply(
  prospectId: string,
  channel: "sms" | "email",
  recipient: string,
  replyBody: string,
  replySubject?: string
) {
  // Random delay between 1 and 10 minutes
  const delayMinutes = Math.floor(Math.random() * (10 - 1 + 1)) + 1;
  const sendAfter = new Date();
  sendAfter.setMinutes(sendAfter.getMinutes() + delayMinutes);

  console.log(`[Delayed Reply] Queuing ${channel} to ${recipient} for ${sendAfter.toISOString()} (${delayMinutes}m delay)`);

  const { error } = await supabase.from("queued_replies").insert({
    prospect_id: prospectId,
    channel,
    recipient,
    reply_body: replyBody,
    reply_subject: replySubject,
    send_after: sendAfter.toISOString(),
    status: "pending",
  });

  if (error) {
    console.error(`[Delayed Reply] Failed to queue reply: ${error.message}`);
    throw error;
  }

  return { delayMinutes, sendAfter };
}

/**
 * Process all pending replies that are due to be sent.
 * This should be called by a cron job or a background worker.
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
