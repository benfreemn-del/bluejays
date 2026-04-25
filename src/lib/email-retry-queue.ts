/**
 * email-retry-queue.ts — Wave-2 LTV protection.
 *
 * Backs the welcome-email retry, renewal-reminder retry, and any other
 * transactional email that the pipeline can't afford to silently drop.
 *
 * The Stripe webhook used to call `sendEmail()` and rely on a try/catch to
 * log + swallow the error. If SendGrid threw a 429 / transient outage on
 * the exact second of payment, the customer never got their welcome email
 * because `welcomeEmailSentAt` is only set on success (correctly — but the
 * retry pipe was missing). This module fills that gap.
 *
 * Cron `/api/billing/retry-failed-sends` drains the queue daily with
 * exponential backoff (1h → 4h → 24h between attempts). After 3 failures,
 * the row is marked `failed` and Ben gets an SMS so he can intervene
 * manually.
 *
 * Mock-mode policy: when Supabase is not configured (dev w/o env vars),
 * queue + drain become no-ops. The send still happens via the live
 * `sendEmail()` call; the retry queue is just absent. No crashes.
 */

import { supabase, isSupabaseConfigured } from "./supabase";
import { sendEmail } from "./email-sender";
import { sendOwnerAlert } from "./alerts";

export type EmailRetryType =
  | "welcome"
  | "handoff"
  | "renewal_30"
  | "renewal_7"
  | "payment_failed"
  | "payment_failed_urgent"
  | "monthly_report"
  | "referral"
  // Upsell SKU welcome emails — fire from the Stripe webhook on
  // `checkout.session.completed` events with `metadata.sku`. See
  // `handleUpsellSession()` in `/api/webhooks/stripe/route.ts` and
  // CLAUDE.md "Upsell SKUs".
  | "upsell_review_blast"
  | "upsell_extra_pages"
  | "upsell_gbp_setup"
  | "upsell_monthly_updates";

export type EmailRetryStatus = "pending" | "succeeded" | "failed";

export interface EmailRetryPayload {
  to: string;
  subject: string;
  body: string;
  sequence: number;
}

export interface EmailRetryRow {
  id: string;
  prospectId: string;
  emailType: EmailRetryType;
  attempts: number;
  lastAttemptAt: string | null;
  lastError: string | null;
  status: EmailRetryStatus;
  nextAttemptAt: string;
  payload: EmailRetryPayload | null;
  createdAt: string;
  updatedAt: string;
}

/** Backoff between retries: 1h, 4h, 24h. After 3rd failure → status=failed. */
const BACKOFF_HOURS = [1, 4, 24] as const;
export const MAX_RETRY_ATTEMPTS = 3;

function mapRow(row: Record<string, unknown>): EmailRetryRow {
  return {
    id: row.id as string,
    prospectId: row.prospect_id as string,
    emailType: row.email_type as EmailRetryType,
    attempts: Number(row.attempts || 0),
    lastAttemptAt: (row.last_attempt_at as string | null) || null,
    lastError: (row.last_error as string | null) || null,
    status: (row.status as EmailRetryStatus) || "pending",
    nextAttemptAt: (row.next_attempt_at as string) || new Date().toISOString(),
    payload: (row.payload as EmailRetryPayload | null) || null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

/**
 * Queue a failed email send for retry. Idempotent at-the-DB-level only via
 * the (prospect_id, email_type, status='pending') natural key — callers
 * should check for an existing pending row before queueing if they want
 * strict no-duplicate semantics.
 */
export async function queueEmailRetry(args: {
  prospectId: string;
  emailType: EmailRetryType;
  payload: EmailRetryPayload;
  initialError: string;
}): Promise<EmailRetryRow | null> {
  if (!isSupabaseConfigured()) {
    console.log(
      `[email-retry-queue] Supabase not configured — skipping queue ` +
        `(prospect=${args.prospectId}, type=${args.emailType})`,
    );
    return null;
  }

  // First pending row blocks duplicates — caller can pass `force: true`
  // by passing a unique combo (e.g. include date in emailType) when retry
  // intent is genuinely new.
  try {
    const { data: existing } = await supabase
      .from("email_retry_queue")
      .select("*")
      .eq("prospect_id", args.prospectId)
      .eq("email_type", args.emailType)
      .eq("status", "pending")
      .limit(1);

    if (existing && existing.length > 0) {
      console.log(
        `[email-retry-queue] Already pending (prospect=${args.prospectId}, ` +
          `type=${args.emailType}) — skipping new enqueue.`,
      );
      return mapRow(existing[0] as Record<string, unknown>);
    }

    const nextAttemptAt = new Date(Date.now() + BACKOFF_HOURS[0] * 60 * 60 * 1000).toISOString();
    const { data, error } = await supabase
      .from("email_retry_queue")
      .insert({
        prospect_id: args.prospectId,
        email_type: args.emailType,
        attempts: 0,
        last_error: args.initialError,
        status: "pending",
        next_attempt_at: nextAttemptAt,
        payload: args.payload,
      })
      .select()
      .single();

    if (error || !data) {
      console.error("[email-retry-queue] Failed to insert retry row:", error);
      return null;
    }
    return mapRow(data as Record<string, unknown>);
  } catch (err) {
    console.error("[email-retry-queue] queueEmailRetry threw:", err);
    return null;
  }
}

/** Pull all due rows (status=pending, next_attempt_at <= now). */
export async function getDueRetries(): Promise<EmailRetryRow[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const nowIso = new Date().toISOString();
    const { data, error } = await supabase
      .from("email_retry_queue")
      .select("*")
      .eq("status", "pending")
      .lte("next_attempt_at", nowIso)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return (data || []).map((row) => mapRow(row as Record<string, unknown>));
  } catch (err) {
    console.error("[email-retry-queue] getDueRetries failed:", err);
    return [];
  }
}

async function markSuccess(rowId: string): Promise<void> {
  if (!isSupabaseConfigured()) return;
  await supabase
    .from("email_retry_queue")
    .update({
      status: "succeeded",
      last_attempt_at: new Date().toISOString(),
      last_error: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", rowId);
}

async function markFailureOrExhaust(
  row: EmailRetryRow,
  errorMsg: string,
): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const newAttempts = row.attempts + 1;
  const exhausted = newAttempts >= MAX_RETRY_ATTEMPTS;
  const backoffHours = BACKOFF_HOURS[Math.min(newAttempts, BACKOFF_HOURS.length - 1)];
  const nextAttemptAt = exhausted
    ? null
    : new Date(Date.now() + backoffHours * 60 * 60 * 1000).toISOString();

  await supabase
    .from("email_retry_queue")
    .update({
      attempts: newAttempts,
      status: exhausted ? "failed" : "pending",
      last_attempt_at: new Date().toISOString(),
      last_error: errorMsg.slice(0, 500),
      next_attempt_at: nextAttemptAt,
      updated_at: new Date().toISOString(),
    })
    .eq("id", row.id);

  if (exhausted) {
    // SMS Ben so he can manually intervene. Errors here shouldn't crash the cron.
    await sendOwnerAlert(
      `Email retry exhausted: ${row.emailType} for prospect ${row.prospectId}\n` +
        `Last error: ${errorMsg.slice(0, 120)}\n` +
        `Manually resend from /dashboard.`,
    ).catch(() => {});
  }
}

/**
 * Drain due rows. Returns a summary tuple for the cron's response body.
 *
 * Each row's payload is replayed via `sendEmail()`. On success → mark
 * succeeded. On failure → bump attempts, schedule next retry (or mark
 * failed + alert Ben after the 3rd attempt).
 */
export async function drainDueRetries(): Promise<{
  attempted: number;
  succeeded: number;
  failed: number;
  exhausted: number;
}> {
  const rows = await getDueRetries();
  let succeeded = 0;
  let failed = 0;
  let exhausted = 0;

  for (const row of rows) {
    if (!row.payload) {
      // Malformed row — mark exhausted so we don't re-attempt forever.
      await markFailureOrExhaust(row, "Missing payload");
      exhausted += 1;
      continue;
    }
    try {
      await sendEmail(
        row.prospectId,
        row.payload.to,
        row.payload.subject,
        row.payload.body,
        row.payload.sequence,
      );
      await markSuccess(row.id);
      succeeded += 1;
      console.log(
        `[email-retry-queue] Retry succeeded: ${row.emailType} → ${row.payload.to}`,
      );
    } catch (err) {
      failed += 1;
      const willExhaust = row.attempts + 1 >= MAX_RETRY_ATTEMPTS;
      if (willExhaust) exhausted += 1;
      const msg = err instanceof Error ? err.message : String(err);
      await markFailureOrExhaust(row, msg);
      console.warn(
        `[email-retry-queue] Retry failed (attempt ${row.attempts + 1}/${MAX_RETRY_ATTEMPTS}): ` +
          `${row.emailType} → ${row.payload.to}: ${msg}`,
      );
    }
  }

  return { attempted: rows.length, succeeded, failed, exhausted };
}
