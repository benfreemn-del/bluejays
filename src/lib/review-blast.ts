/**
 * Review Blast — submission + dispatch logic.
 *
 * Per CLAUDE.md "Review Blast Wave 1" spec (locked 2026-04-25):
 *  - Customer at /review-blast/[upsellId] pastes up to 50 phone numbers
 *    (one per line, any format) + picks a category template
 *  - Submission is queued in `review_blast_submissions` with
 *    status='pending_a2p' until A2P 10DLC is approved (gated by env
 *    SMS_FUNNEL_DISABLED matching the existing SMS gate)
 *  - Once A2P approved, the daily cron flips eligible rows to
 *    'pending_dispatch' → 'dispatching' → 'sent'
 *  - All 50 SMS land within 1 hour of dispatch start (rate-limited)
 *  - Replies route to the BUSINESS's owner email via the existing
 *    Twilio inbound webhook (replies handler looks up
 *    review_blast_messages by twilio_sid, then forwards to prospect.email)
 *
 * Mock-mode safe: when SUPABASE or TWILIO env vars are absent, falls
 * through to console-log + return so local dev doesn't crash.
 */

import { supabase, isSupabaseConfigured } from "./supabase";
import { sendSms } from "./sms";
import { getProspect } from "./store";
import { renderTemplate, type TemplateKey } from "./review-blast-templates";
import { logCost } from "./cost-logger";
import { sendEmail } from "./email-sender";

/** Hard cap so a typo'd input can't blast 10K phones. */
export const MAX_PHONES_PER_SUBMISSION = 50;

/** Twilio costs ~$0.0079 per SMS in 2026. We charge $99 for 50 SMS = $1.98 raw cost, ~$97 margin. */
const COST_PER_SMS_USD = 0.008;

/**
 * Normalize a phone number to E.164 format. Best-effort — we accept
 * anything the customer pastes (parens, dashes, spaces, leading +,
 * leading country code) and try to produce a `+1XXXXXXXXXX` US number.
 *
 * Returns null when the input clearly isn't a US/CA phone (too few
 * digits, all-zero, etc) so we can surface bad lines to the customer
 * instead of silently dropping them.
 */
export function normalizePhone(raw: string): string | null {
  // Strip everything except digits.
  const digits = (raw || "").replace(/\D/g, "");
  if (digits.length === 0) return null;

  // 10 digits — assume US/CA without country code → prepend +1
  if (digits.length === 10) return `+1${digits}`;
  // 11 digits starting with 1 — already has US country code → +1XXXXXXXXXX
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  // 12 digits — possibly already E.164 with country code typed (e.g.
  // someone pasted "+12065551234" → digits = "12065551234"). Same path.
  if (digits.length >= 10 && digits.length <= 15) {
    // Generic E.164: prepend +
    return `+${digits}`;
  }
  return null;
}

export interface NormalizedPhones {
  valid: string[];
  invalid: string[];
}

/**
 * Parse the freeform textarea content into clean E.164 phone numbers.
 * Returns both the valid list (deduped, capped at MAX_PHONES_PER_SUBMISSION)
 * AND the invalid list so the form can surface "we couldn't parse these"
 * back to the customer.
 */
export function normalizePhoneList(raw: string): NormalizedPhones {
  const lines = (raw || "")
    .split(/[\n,;]+/g) // split on newline / comma / semicolon
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const valid: string[] = [];
  const invalid: string[] = [];
  const seen = new Set<string>();

  for (const line of lines) {
    const e164 = normalizePhone(line);
    if (!e164) {
      invalid.push(line);
      continue;
    }
    if (seen.has(e164)) continue; // dedupe
    seen.add(e164);
    valid.push(e164);
  }

  return {
    valid: valid.slice(0, MAX_PHONES_PER_SUBMISSION),
    invalid,
  };
}

export interface SubmitArgs {
  upsellId: string;
  prospectId: string;
  phoneNumbers: string[]; // already-normalized E.164 strings
  templateKey: TemplateKey;
}

export interface SubmitResult {
  ok: boolean;
  submissionId?: string;
  alreadySubmitted?: boolean;
  error?: string;
}

/**
 * Persist a submission. Returns the row ID. Idempotent on (upsell_id) —
 * if a submission already exists for this upsell, returns
 * {alreadySubmitted: true} rather than creating a duplicate (the
 * customer can only submit once per Review Blast purchase per spec).
 *
 * Initial status = 'pending_a2p' (waiting on A2P approval before any
 * SMS goes out). When A2P flips off, the cron will pick up these rows
 * and move them to 'pending_dispatch' → 'dispatching' → 'sent'.
 */
export async function createSubmission(args: SubmitArgs): Promise<SubmitResult> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Supabase not configured (mock mode)" };
  }

  // Check for existing submission on this upsell_id.
  const { data: existing } = await supabase
    .from("review_blast_submissions")
    .select("id, status")
    .eq("upsell_id", args.upsellId)
    .limit(1)
    .maybeSingle();

  if (existing) {
    return {
      ok: true,
      submissionId: existing.id as string,
      alreadySubmitted: true,
    };
  }

  const { data, error } = await supabase
    .from("review_blast_submissions")
    .insert({
      upsell_id: args.upsellId,
      prospect_id: args.prospectId,
      status: "pending_a2p",
      phone_numbers: args.phoneNumbers,
      template_key: args.templateKey,
      sms_count_target: args.phoneNumbers.length,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { ok: false, error: error?.message || "insert failed" };
  }

  return { ok: true, submissionId: data.id as string };
}

/**
 * Cron-side dispatch loop. Runs once per cron tick. Finds eligible
 * submissions (status='pending_dispatch' OR ('pending_a2p' AND
 * A2P now enabled)) and fires the SMS batch for each.
 *
 * Per spec #7A: all 50 within 1 hour of dispatch start. We don't
 * spread across multiple cron ticks for a single submission — one
 * dispatch call sends the whole batch with a 50ms delay between SMS
 * to stay under Twilio rate limits while still completing in <1 min.
 *
 * Pre-A2P (SMS_FUNNEL_DISABLED=true): skip every submission, leave at
 * 'pending_a2p'. The same env-var guard the rest of the SMS funnel
 * already honors.
 */
export async function dispatchPendingSubmissions(): Promise<{
  processed: number;
  smsSent: number;
  smsFailed: number;
  skipped: string[];
}> {
  const result = { processed: 0, smsSent: 0, smsFailed: 0, skipped: [] as string[] };
  if (!isSupabaseConfigured()) return result;

  // A2P gate — same env-var as the rest of the SMS funnel.
  const a2pBlocked = process.env.SMS_FUNNEL_DISABLED === "true";
  if (a2pBlocked) {
    result.skipped.push("a2p_disabled");
    return result;
  }

  // Pull eligible rows — both 'pending_a2p' (auto-promote now that
  // A2P is open) and 'pending_dispatch' (manually promoted).
  const { data: rows, error } = await supabase
    .from("review_blast_submissions")
    .select("id, upsell_id, prospect_id, phone_numbers, template_key, sms_count_target")
    .in("status", ["pending_a2p", "pending_dispatch"])
    .order("submitted_at", { ascending: true })
    .limit(10); // Process up to 10 submissions per cron tick = up to 500 SMS

  if (error || !rows || rows.length === 0) return result;

  for (const row of rows) {
    const submissionId = row.id as string;
    const prospectId = row.prospect_id as string;
    const phoneNumbers = (row.phone_numbers as string[]) || [];
    const templateKey = row.template_key as TemplateKey;

    // Mark dispatching.
    await supabase
      .from("review_blast_submissions")
      .update({ status: "dispatching", dispatched_at: new Date().toISOString() })
      .eq("id", submissionId);

    const prospect = await getProspect(prospectId);
    if (!prospect) {
      await supabase
        .from("review_blast_submissions")
        .update({
          status: "failed",
          error_message: "Prospect not found at dispatch time",
        })
        .eq("id", submissionId);
      result.processed++;
      continue;
    }

    // Build the review link — uses the existing /review/[id] 5-star
    // filter page already in the codebase.
    const baseUrl = "https://bluejayportfolio.com";
    const reviewLink = `${baseUrl}/review/${prospectId}`;

    let sent = 0;
    let failed = 0;
    for (const toPhone of phoneNumbers) {
      const body = renderTemplate(templateKey, prospect.businessName, reviewLink);

      // Insert per-SMS log row first (audit trail per Rule 43:
      // persist before you touch).
      const { data: logRow } = await supabase
        .from("review_blast_messages")
        .insert({
          submission_id: submissionId,
          to_phone: toPhone,
          body,
        })
        .select("id")
        .single();

      // sendSms returns a SentSms record on success OR throws on failure.
      // sequence=300 reserves the Review Blast SMS series in the
      // existing per-prospect SMS history (cold-outreach uses 0-30,
      // post-purchase uses 100-200, Review Blast = 300).
      try {
        const sms = await sendSms(prospectId, toPhone, body, 300);
        sent++;
        if (logRow) {
          await supabase
            .from("review_blast_messages")
            .update({
              twilio_sid: sms.messageSid || null,
              sent_at: new Date().toISOString(),
              delivery_status: "sent",
            })
            .eq("id", logRow.id);
        }
        await logCost({
          prospectId,
          service: "twilio_sms",
          action: "review_blast_send",
          costUsd: COST_PER_SMS_USD,
          metadata: {
            review_blast_submission_id: submissionId,
            to: toPhone,
          },
        });
      } catch (err) {
        failed++;
        if (logRow) {
          await supabase
            .from("review_blast_messages")
            .update({
              failed_at: new Date().toISOString(),
              delivery_status: "failed",
              error_message: err instanceof Error ? err.message : String(err),
            })
            .eq("id", logRow.id);
        }
      }

      // 50ms delay between SMS to stay under Twilio's 1 msg/sec
      // unthrottled limit. 50 SMS × 50ms = 2.5 sec total — well
      // under the 1-hour spec target.
      await new Promise((r) => setTimeout(r, 50));
    }

    // Mark complete.
    const finalStatus = failed === phoneNumbers.length ? "failed" : "sent";
    await supabase
      .from("review_blast_submissions")
      .update({
        status: finalStatus,
        sms_count_sent: sent,
        sms_count_failed: failed,
        completed_at: new Date().toISOString(),
        error_message:
          failed > 0
            ? `${failed} of ${phoneNumbers.length} SMS failed — see review_blast_messages for per-row errors`
            : null,
      })
      .eq("id", submissionId);

    result.processed++;
    result.smsSent += sent;
    result.smsFailed += failed;
  }

  return result;
}

export interface ReplyHandleResult {
  handled: boolean;
  forwardedTo?: string;
}

/**
 * Per spec #9B: when a customer of one of our customers replies to a
 * Review Blast SMS, route the reply to the BUSINESS's owner email
 * (NOT Ben's). Each business handles their own customer relationship.
 *
 * Detection: query review_blast_messages where to_phone matches the
 * inbound sender AND sent_at is within the last 14 days. If we find
 * a match, this is a Review Blast reply — log it + forward.
 *
 * Returns {handled: true} so the inbound SMS handler can short-circuit
 * before falling through to its normal prospect-by-phone matching
 * (which would never find a prospect for a customer-of-customer phone).
 *
 * STOP/HELP replies don't reach this handler — Twilio intercepts and
 * auto-responds at the carrier level. We only see substantive replies.
 */
export async function tryHandleReviewBlastReply(
  fromPhone: string,
  body: string,
): Promise<ReplyHandleResult> {
  if (!isSupabaseConfigured()) return { handled: false };

  // Look for a sent Review Blast message to this phone within 14 days.
  const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
  const { data: messages } = await supabase
    .from("review_blast_messages")
    .select("id, submission_id, sent_at")
    .eq("to_phone", fromPhone)
    .gte("sent_at", fourteenDaysAgo)
    .order("sent_at", { ascending: false })
    .limit(1);

  if (!messages || messages.length === 0) {
    return { handled: false };
  }

  const messageRow = messages[0];

  // Pull the submission so we can look up the BUSINESS that owns it.
  const { data: submission } = await supabase
    .from("review_blast_submissions")
    .select("prospect_id")
    .eq("id", messageRow.submission_id as string)
    .maybeSingle();

  if (!submission) {
    return { handled: false };
  }

  const prospect = await getProspect(submission.prospect_id as string);
  if (!prospect || !prospect.email) {
    // No business email on file — can't forward. Log it but don't
    // process as a regular inbound (still treat as handled so we
    // don't accidentally process a customer-of-customer reply through
    // our AI responder for the BUSINESS).
    await supabase
      .from("review_blast_messages")
      .update({
        reply_body: body,
        reply_received_at: new Date().toISOString(),
      })
      .eq("id", messageRow.id as string);
    return { handled: true };
  }

  // Forward to the business's email.
  const subject = `New customer reply to your Review Request — ${prospect.businessName}`;
  const emailBody = `Hi ${prospect.ownerName || "there"},

One of your customers replied to the review request SMS we sent on your behalf.

Customer phone: ${fromPhone}

Their message:
"${body}"

Reply to this email to follow up directly with the customer (they expect to hear from ${prospect.businessName}, not us — we're forwarding their reply to you so the conversation stays yours).

— BlueJays
bluejaycontactme@gmail.com
`;

  // sequence=250 reserves the Review Blast reply-forward series.
  // sendEmail returns a SentEmail or throws on failure (per email-sender.ts
  // contract — bounce-suppressed addresses throw, daily warm-up cap throws).
  let forwardedOk = false;
  try {
    await sendEmail(prospect.id, prospect.email, subject, emailBody, 250);
    forwardedOk = true;
  } catch (err) {
    console.error("[review-blast] Forward email failed:", err);
  }

  // Log the reply + forward attempt regardless of email success — gives
  // us an audit trail when a business asks "did anyone reply to my
  // review SMS?".
  await supabase
    .from("review_blast_messages")
    .update({
      reply_body: body,
      reply_received_at: new Date().toISOString(),
      reply_forwarded_at: forwardedOk ? new Date().toISOString() : null,
    })
    .eq("id", messageRow.id as string);

  return { handled: true, forwardedTo: prospect.email };
}
