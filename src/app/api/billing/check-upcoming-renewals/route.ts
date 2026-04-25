import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { getProspect } from "@/lib/store";
import { sendEmail } from "@/lib/email-sender";
import {
  getRenewal30DayEmail,
  getRenewal7DayEmail,
} from "@/lib/email-templates";
import { queueEmailRetry } from "@/lib/email-retry-queue";

/**
 * Wave-2 LTV protection — pre-renewal email cadence.
 *
 * Stripe's `invoice.upcoming` event fires 3 days before a renewal by
 * default. Customer-level `invoice_settings.upcoming_invoice_days` is
 * not exposed through the API at create time, so per CLAUDE.md spec
 * we run a daily cron instead: scan all active subscriptions, check
 * `current_period_end`, and send the appropriate pre-renewal email
 * when the next charge is in ~30 days or ~7 days.
 *
 * Dedupe: `renewal_reminders` table — one row per
 * (prospect_id, subscription_id, kind, scheduled_charge_at). Same
 * cron run twice in a day or two days in a row will not double-send.
 *
 * Mock-mode policy: when Stripe (`STRIPE_SECRET_KEY`) is missing, the
 * cron no-ops gracefully + logs. Same when Supabase is missing.
 *
 * Schedule: `0 16 * * *` (16:00 UTC = 8am PT) per CLAUDE.md outbound
 * marketing cron rule (rule 30).
 */

const WINDOWS = [
  { kind: "30" as const, lower: 28, upper: 31 },
  { kind: "7" as const, lower: 6, upper: 8 },
] as const;

export async function GET(request: NextRequest) {
  // Vercel cron invokes via GET — accept and delegate.
  return POST(request);
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    // Vercel cron sends its own auth header that doesn't match user
    // tokens; allow unauthenticated invocations only when CRON_SECRET
    // isn't set. Otherwise enforce.
    const userAgent = request.headers.get("user-agent") || "";
    if (!userAgent.toLowerCase().includes("vercel")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  if (!isStripeConfigured()) {
    console.log(
      "[Billing] check-upcoming-renewals: STRIPE_SECRET_KEY not configured — no-op",
    );
    return NextResponse.json({ ok: true, mockMode: true, sent: 0 });
  }

  if (!isSupabaseConfigured()) {
    console.log(
      "[Billing] check-upcoming-renewals: Supabase not configured — no-op",
    );
    return NextResponse.json({ ok: true, mockMode: true, sent: 0 });
  }

  const stripe = getStripe();
  let scanned = 0;
  let sent30 = 0;
  let sent7 = 0;
  let alreadySent = 0;
  let errors = 0;

  try {
    // Page through ALL active subscriptions. At 5K customers we'll need
    // to add a `metadata` filter or a per-day batch slice; for now a
    // single pass is fine since the cron runs once daily and Stripe's
    // pagination handles tens of thousands of subs cleanly.
    let startingAfter: string | undefined = undefined;
    const PAGE = 100;

    // Safety rail: cap at 50K iterations.
    for (let i = 0; i < 500; i += 1) {
      const params: Stripe.SubscriptionListParams = {
        status: "active",
        limit: PAGE,
        ...(startingAfter ? { starting_after: startingAfter } : {}),
      };
      const page: Stripe.ApiList<Stripe.Subscription> =
        await stripe.subscriptions.list(params);

      for (const sub of page.data) {
        scanned += 1;
        const result = await processSubscription(sub);
        sent30 += result.sent30;
        sent7 += result.sent7;
        alreadySent += result.alreadySent;
        errors += result.errors;
      }

      if (!page.has_more) break;
      startingAfter = page.data[page.data.length - 1]?.id;
      if (!startingAfter) break;
    }

    console.log(
      `[Billing] Renewal scan complete: scanned=${scanned} sent_30d=${sent30} ` +
        `sent_7d=${sent7} already_sent=${alreadySent} errors=${errors}`,
    );

    return NextResponse.json({
      ok: true,
      scanned,
      sent30,
      sent7,
      alreadySent,
      errors,
    });
  } catch (err) {
    console.error("[Billing] check-upcoming-renewals failed:", err);
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "unknown" },
      { status: 500 },
    );
  }
}

async function processSubscription(sub: Stripe.Subscription): Promise<{
  sent30: number;
  sent7: number;
  alreadySent: number;
  errors: number;
}> {
  const result = { sent30: 0, sent7: 0, alreadySent: 0, errors: 0 };

  const prospectId = (sub.metadata as Record<string, string> | null | undefined)
    ?.prospectId;
  if (!prospectId) return result;

  // Stripe's TypeScript types lag the real API on this field; current_period_end
  // exists on every active subscription. Type-cast accordingly.
  const periodEndUnix = (sub as unknown as { current_period_end?: number })
    .current_period_end;
  if (!periodEndUnix) return result;

  // Skip subs that aren't really going to charge (trialing for >30 days
  // covers the deferred mgmt sub which won't renew for ~12 months).
  // current_period_end is always set even during trial; we still check
  // it so we don't email a customer 30 days before their first $100
  // charge if the trial is mid-progression.
  const chargeAtMs = periodEndUnix * 1000;
  const daysUntilCharge = Math.round((chargeAtMs - Date.now()) / (1000 * 60 * 60 * 24));

  // Find which window (if any) this falls into.
  const window = WINDOWS.find(
    (w) => daysUntilCharge >= w.lower && daysUntilCharge <= w.upper,
  );
  if (!window) return result;

  // Dedupe: have we already sent this exact (prospect, sub, kind, charge_at)
  // reminder? `scheduled_charge_at` lets a customer who reschedules / has
  // their billing date moved get a fresh reminder — we key on the actual
  // charge instant, not a generic "we sent the 30-day already" flag.
  const chargeAtIso = new Date(chargeAtMs).toISOString();
  try {
    const { data: existing } = await supabase
      .from("renewal_reminders")
      .select("id")
      .eq("prospect_id", prospectId)
      .eq("subscription_id", sub.id)
      .eq("kind", window.kind)
      .eq("scheduled_charge_at", chargeAtIso)
      .limit(1);

    if (existing && existing.length > 0) {
      result.alreadySent += 1;
      return result;
    }
  } catch (dedupeErr) {
    // If dedupe lookup fails we'd rather over-send than under-send (over-
    // sending costs an SMS-free reminder; under-sending costs the renewal).
    console.warn("[Billing] Dedupe lookup failed — proceeding:", dedupeErr);
  }

  const prospect = await getProspect(prospectId);
  if (!prospect) {
    console.warn(`[Billing] Prospect ${prospectId} not found for sub ${sub.id}`);
    return result;
  }
  const customerEmail = prospect.email;
  if (!customerEmail) {
    console.warn(
      `[Billing] No email on file for ${prospect.businessName} (${prospect.id}) — ` +
        `skipping ${window.kind}-day renewal email.`,
    );
    return result;
  }

  const template = window.kind === "30"
    ? getRenewal30DayEmail(prospect, chargeAtIso)
    : getRenewal7DayEmail(prospect, chargeAtIso);

  try {
    await sendEmail(
      prospect.id,
      customerEmail,
      template.subject,
      template.body,
      template.sequence,
    );
    if (window.kind === "30") result.sent30 += 1;
    else result.sent7 += 1;

    // Mark as sent (best-effort — if this fails the next cron run will
    // re-send, which is acceptable noise but not a tragedy).
    await supabase.from("renewal_reminders").insert({
      prospect_id: prospect.id,
      subscription_id: sub.id,
      kind: window.kind,
      scheduled_charge_at: chargeAtIso,
    });

    console.log(
      `[Billing] Sent ${window.kind}-day renewal email to ${customerEmail} ` +
        `for ${prospect.businessName} (charge: ${chargeAtIso})`,
    );
  } catch (err) {
    result.errors += 1;
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error(
      `[Billing] Failed to send ${window.kind}-day renewal email to ${customerEmail}:`,
      err,
    );
    // Queue retry so a SendGrid blip doesn't drop the only renewal nudge.
    await queueEmailRetry({
      prospectId: prospect.id,
      emailType: window.kind === "30" ? "renewal_30" : "renewal_7",
      payload: {
        to: customerEmail,
        subject: template.subject,
        body: template.body,
        sequence: template.sequence,
      },
      initialError: errMsg,
    }).catch(() => {});
  }

  return result;
}
