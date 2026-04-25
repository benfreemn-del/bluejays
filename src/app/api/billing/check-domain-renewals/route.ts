import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { getRegistrar, RegistrarError } from "@/lib/domain-registrar";
import {
  getDomainsExpiringWithin,
  updateDomain,
  type DomainRow,
} from "@/lib/domain-store";
import { getProspect } from "@/lib/store";
import { logCost } from "@/lib/cost-logger";
import { sendEmail } from "@/lib/email-sender";
import {
  getDomainRenewalChargedEmail,
  getDomainRenewalPausedEmail,
} from "@/lib/email-templates";
import { sendOwnerAlert } from "@/lib/alerts";
import { isSupabaseConfigured } from "@/lib/supabase";
import type { Prospect } from "@/lib/types";

/**
 * Domain renewal cron — the single biggest revenue-protection lever at
 * 5,000 sites. Runs daily at 18:00 UTC (10am PT) per CLAUDE.md rule 30.
 *
 * Architecture (per CLAUDE.md rule 32 "Renewal alignment with Stripe"):
 *   We MUST charge the customer's Stripe sub BEFORE auto-renewing the
 *   domain at the registrar. A $11 domain renewal we pay for a customer
 *   whose card just failed is straight $11 of margin loss. Stripe-first.
 *
 * For each domain whose `next_renewal_at <= now()` and `status='registered'`:
 *   1. Look up the prospect's mgmtSubscriptionId (set by the Stripe webhook
 *      when the deferred mgmt sub was created on Day 0).
 *   2. Stripe.subscriptions.retrieve(subId) → check `status` + `latest_invoice.status`.
 *   3. Branch:
 *      a. paid/active     → registrar.renew(domain, 1) + log $11 cost +
 *                           bump expires_at, next_renewal_at by 1 year.
 *                           Send "renewed" email to customer.
 *      b. past_due        → set status='renewal_paused', send card-failed
 *                           email to customer, SMS Ben.
 *      c. canceled        → set status='cancelled', send 30-day grace
 *                           period email, SMS Ben.
 *      d. registrar fails → keep status='registered', set last_error,
 *                           SMS Ben (don't retry blindly — manual ops).
 *
 * Throttle: Namecheap rate limit ~50/min. Hand-rolled 30/min throttle
 * with a 2-second sleep between renewals so we sit comfortably under the
 * cap even in 100-domain batches.
 *
 * Mock mode: if STRIPE_SECRET_KEY OR registrar env vars are absent, the
 * route runs end-to-end with deterministic mock responses. End-to-end safe.
 *
 * Failure recovery: see /api/domains/[id]/retry-renewal for the per-domain
 * retry endpoint operators use after a customer updates their card.
 */

interface RenewalSummary {
  checked: number;
  renewed: number;
  paused: number;
  cancelled: number;
  failed: number;
  errors: Array<{ domainId: string; domain: string; error: string }>;
  mockMode: boolean;
}

/** Sleep N ms — used for the 30/min Namecheap throttle. */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const PAGE_SIZE = 100; // process up to 100 due-for-renewal domains per run
const THROTTLE_MS = 2000; // 2 seconds between calls = 30/min ceiling

export async function GET(request: NextRequest) {
  // Vercel cron invokes via GET — accept and delegate to POST.
  return POST(request);
}

export async function POST(request: NextRequest) {
  // CRON_SECRET auth — Vercel cron sends a recognisable user agent + the
  // bearer token; allow either path so manual /admin/run-cron triggers
  // also work.
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    const userAgent = request.headers.get("user-agent") || "";
    if (!userAgent.toLowerCase().includes("vercel")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const stripeOk = isStripeConfigured();
  const registrarConfigured = !!process.env.NAMECHEAP_API_KEY;
  const supabaseOk = isSupabaseConfigured();
  const mockMode = !stripeOk || !registrarConfigured;

  if (!supabaseOk) {
    console.log(
      "[DomainRenewals] Supabase not configured — cannot read domains. No-op.",
    );
    return NextResponse.json({
      ok: true,
      mockMode: true,
      reason: "supabase_not_configured",
      checked: 0,
      renewed: 0,
      paused: 0,
      failed: 0,
      errors: [],
    });
  }

  const summary: RenewalSummary = {
    checked: 0,
    renewed: 0,
    paused: 0,
    cancelled: 0,
    failed: 0,
    errors: [],
    mockMode,
  };

  try {
    // `getDomainsExpiringWithin(0)` returns rows whose next_renewal_at is
    // already in the past or today. That's the cron's working set.
    const dueRaw = await getDomainsExpiringWithin(0);
    // Page in chunks of 100 — at scale we may have 5K registered, but
    // realistically only a small slice is renewing on any given day.
    const due = dueRaw.slice(0, PAGE_SIZE);

    console.log(
      `[DomainRenewals] Found ${due.length} domain(s) due for renewal ` +
        `(of ${dueRaw.length} total in the next-renewal window). ` +
        `mockMode=${mockMode}`,
    );

    const stripe = stripeOk ? getStripe() : null;

    for (const domain of due) {
      summary.checked += 1;
      try {
        await processDomainRenewal({
          domain,
          stripe,
          summary,
          mockMode,
        });
      } catch (err) {
        // Catch-all so one busted row never kills the batch.
        const msg = err instanceof Error ? err.message : String(err);
        console.error(
          `[DomainRenewals] Unhandled error processing ${domain.domain}:`,
          err,
        );
        summary.errors.push({
          domainId: domain.id,
          domain: domain.domain,
          error: msg.slice(0, 300),
        });
        summary.failed += 1;
        await updateDomain(domain.id, { lastError: msg.slice(0, 500) }).catch(
          () => {},
        );
      }

      // Hand-rolled 30/min throttle — Namecheap caps around 50/min and we
      // don't want to brush against the limit on bigger renewal days.
      await sleep(THROTTLE_MS);
    }

    console.log(
      `[DomainRenewals] Run complete. checked=${summary.checked} ` +
        `renewed=${summary.renewed} paused=${summary.paused} ` +
        `cancelled=${summary.cancelled} failed=${summary.failed}`,
    );

    return NextResponse.json({ ok: true, ...summary });
  } catch (err) {
    console.error("[DomainRenewals] Top-level crash:", err);
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : String(err),
        ...summary,
      },
      { status: 500 },
    );
  }
}

interface ProcessArgs {
  domain: DomainRow;
  stripe: Stripe | null;
  summary: RenewalSummary;
  mockMode: boolean;
}

/**
 * Per-domain branch logic. Exported so /api/domains/[id]/retry-renewal can
 * invoke the exact same flow on a single domain after the operator updates
 * the customer's card.
 */
export async function processDomainRenewal(args: ProcessArgs): Promise<void> {
  const { domain, stripe, summary, mockMode } = args;

  const prospect = await getProspect(domain.prospectId);
  if (!prospect) {
    console.warn(
      `[DomainRenewals] Prospect ${domain.prospectId} missing for domain ${domain.domain} — skipping.`,
    );
    summary.failed += 1;
    summary.errors.push({
      domainId: domain.id,
      domain: domain.domain,
      error: "prospect_not_found",
    });
    await updateDomain(domain.id, {
      lastError: "Prospect not found at renewal time",
    });
    return;
  }

  // Look up Stripe sub status. If the prospect has no mgmtSubscriptionId,
  // we can't safely charge before renewing — pause and alert Ben.
  const subStatus = await checkStripeSubStatus({
    stripe,
    prospect,
    mockMode,
  });

  if (subStatus === "active") {
    await renewWithRegistrar({ domain, prospect, summary, mockMode });
    return;
  }

  if (subStatus === "past_due") {
    await pauseRenewal({ domain, prospect, summary });
    return;
  }

  if (subStatus === "canceled") {
    await cancelDomain({ domain, prospect, summary });
    return;
  }

  // Unknown / sub_missing — treat conservatively as paused so we never pay
  // $11 for a customer we can't confirm has paid us.
  await pauseRenewal({
    domain,
    prospect,
    summary,
    reason: "sub_missing_or_unknown",
  });
}

type SubStatus = "active" | "past_due" | "canceled" | "unknown";

async function checkStripeSubStatus(args: {
  stripe: Stripe | null;
  prospect: Prospect;
  mockMode: boolean;
}): Promise<SubStatus> {
  const { stripe, prospect, mockMode } = args;

  // Mock mode: deterministic — pretend every customer is active. End-to-end
  // pipeline tests hit the renewal happy-path, which is what we want.
  if (mockMode || !stripe) {
    return "active";
  }

  const subId = prospect.mgmtSubscriptionId;
  if (!subId) {
    console.warn(
      `[DomainRenewals] Prospect ${prospect.id} (${prospect.businessName}) has no mgmtSubscriptionId — pausing renewal.`,
    );
    return "unknown";
  }

  try {
    const sub = await stripe.subscriptions.retrieve(subId, {
      expand: ["latest_invoice"],
    });

    // Cancelled subs come back with status="canceled".
    if (sub.status === "canceled" || sub.status === "incomplete_expired") {
      return "canceled";
    }
    if (sub.status === "past_due" || sub.status === "unpaid") {
      return "past_due";
    }

    // active + trialing both count as "we expect Stripe to bill them
    // successfully on the next cycle" — but we ALSO check the latest
    // invoice if Stripe expanded it. If the most recent invoice is
    // already failing, treat as past_due even if the sub status hasn't
    // flipped yet (Stripe takes a beat to update sub-level status after
    // an invoice failure).
    const inv = sub.latest_invoice as Stripe.Invoice | null;
    if (inv && typeof inv === "object") {
      const invStatus = inv.status;
      if (invStatus === "uncollectible" || invStatus === "void") {
        return "past_due";
      }
    }

    return "active";
  } catch (err) {
    // If Stripe returns a 404 / not found, treat as cancelled (the sub was
    // deleted out from under us). Other Stripe errors → unknown so we pause
    // rather than blindly pay.
    const msg = err instanceof Error ? err.message : String(err);
    if (/no such subscription|resource_missing/i.test(msg)) {
      return "canceled";
    }
    console.error(
      `[DomainRenewals] Stripe lookup failed for sub ${subId} (${prospect.businessName}):`,
      err,
    );
    return "unknown";
  }
}

async function renewWithRegistrar(args: {
  domain: DomainRow;
  prospect: Prospect;
  summary: RenewalSummary;
  mockMode: boolean;
}): Promise<void> {
  const { domain, prospect, summary, mockMode } = args;
  const registrar = getRegistrar();

  try {
    const result = await registrar.renew(domain.domain, 1);

    // Bump expires_at by 1 year (use registrar's authoritative
    // newExpiresAt when available).
    const newExpiresAt = result.newExpiresAt;
    const newNextRenewalAt = new Date(
      newExpiresAt.getTime() - 30 * 24 * 60 * 60 * 1000,
    );

    await updateDomain(domain.id, {
      status: "registered",
      expiresAt: newExpiresAt,
      nextRenewalAt: newNextRenewalAt,
      lastError: null,
      metadata: {
        ...domain.metadata,
        last_renewal_at: new Date().toISOString(),
        last_renewal_order_id: result.orderId,
      },
    });

    // Cost log — pass through registrar's actual charged amount when
    // returned, otherwise fall back to the domain's cost_per_year.
    const costUsd =
      result.costUsd ??
      domain.costPerYearUsd ??
      11.0;
    await logCost({
      prospectId: prospect.id,
      service: "domain_renewal",
      action: `${registrar.name}.renew:${domain.domain}`,
      costUsd,
      metadata: {
        registrar: registrar.name,
        years: 1,
        order_id: result.orderId,
        domain_id: domain.id,
      },
    });

    summary.renewed += 1;

    // Confirmation email — only send if the customer email exists and
    // we're not in mock mode (mock-mode runs are dev/CI noise).
    if (!mockMode && prospect.email) {
      const tpl = getDomainRenewalChargedEmail(
        prospect,
        domain.domain,
        newExpiresAt.toISOString(),
      );
      await sendEmail(
        prospect.id,
        prospect.email,
        tpl.subject,
        tpl.body,
        tpl.sequence,
      ).catch((err) => {
        // Don't fail the renewal because the receipt email bounced.
        console.warn(
          `[DomainRenewals] Renewal-charged email failed for ${prospect.email}:`,
          err,
        );
      });
    }

    console.log(
      `[DomainRenewals] Renewed ${domain.domain} for ${prospect.businessName} ` +
        `→ next renewal ${newNextRenewalAt.toISOString().slice(0, 10)}`,
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const code = err instanceof RegistrarError ? err.code : "registrar_unknown";

    await updateDomain(domain.id, {
      lastError: `[${code}] ${msg}`.slice(0, 500),
    });

    summary.failed += 1;
    summary.errors.push({
      domainId: domain.id,
      domain: domain.domain,
      error: `${code}: ${msg}`.slice(0, 300),
    });

    // SMS Ben — registrar failures need eyes-on, never a blind retry.
    await sendOwnerAlert(
      `Domain renewal FAILED for ${prospect.businessName} (${domain.domain}) — ${msg.slice(0, 120)}. Manual intervention needed.`,
    ).catch(() => {});

    console.error(
      `[DomainRenewals] Registrar renew failed for ${domain.domain}:`,
      err,
    );
  }
}

async function pauseRenewal(args: {
  domain: DomainRow;
  prospect: Prospect;
  summary: RenewalSummary;
  reason?: string;
}): Promise<void> {
  const { domain, prospect, summary, reason } = args;
  const expiresAtIso = domain.expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  await updateDomain(domain.id, {
    status: "renewal_paused",
    lastError: reason
      ? `Renewal paused: ${reason}`
      : "Renewal paused: customer Stripe sub past_due",
    metadata: {
      ...domain.metadata,
      paused_at: new Date().toISOString(),
      pause_reason: reason || "stripe_past_due",
    },
  });

  summary.paused += 1;

  // Email customer (unless we don't have one on file).
  if (prospect.email) {
    const tpl = getDomainRenewalPausedEmail(
      prospect,
      domain.domain,
      expiresAtIso,
    );
    await sendEmail(
      prospect.id,
      prospect.email,
      tpl.subject,
      tpl.body,
      tpl.sequence,
    ).catch((err) => {
      console.warn(
        `[DomainRenewals] Renewal-paused email failed for ${prospect.email}:`,
        err,
      );
    });
  }

  // SMS Ben so he can intervene if the customer doesn't update their card.
  const dashboardUrl = `https://bluejayportfolio.com/lead/${prospect.id}`;
  await sendOwnerAlert(
    `Domain renewal paused for ${prospect.businessName} (${domain.domain}) — past_due Stripe sub. ${dashboardUrl}`,
  ).catch(() => {});

  console.log(
    `[DomainRenewals] Paused ${domain.domain} for ${prospect.businessName} (reason: ${reason || "stripe_past_due"})`,
  );
}

async function cancelDomain(args: {
  domain: DomainRow;
  prospect: Prospect;
  summary: RenewalSummary;
}): Promise<void> {
  const { domain, prospect, summary } = args;

  await updateDomain(domain.id, {
    status: "cancelled",
    lastError: "Customer Stripe subscription was cancelled",
    metadata: {
      ...domain.metadata,
      cancelled_at: new Date().toISOString(),
      cancel_reason: "stripe_subscription_cancelled",
    },
  });

  summary.cancelled += 1;

  // Email customer the 30-day grace-period notice using the paused
  // template (same shape — "your renewal didn't go through, here's
  // when the domain expires").
  if (prospect.email && domain.expiresAt) {
    const tpl = getDomainRenewalPausedEmail(
      prospect,
      domain.domain,
      domain.expiresAt,
    );
    await sendEmail(
      prospect.id,
      prospect.email,
      tpl.subject,
      tpl.body,
      tpl.sequence,
    ).catch((err) => {
      console.warn(
        `[DomainRenewals] Cancel-grace email failed for ${prospect.email}:`,
        err,
      );
    });
  }

  const dashboardUrl = `https://bluejayportfolio.com/lead/${prospect.id}`;
  await sendOwnerAlert(
    `Domain renewal cancelled for ${prospect.businessName} (${domain.domain}) — Stripe sub cancelled. ${dashboardUrl}`,
  ).catch(() => {});

  console.log(
    `[DomainRenewals] Cancelled ${domain.domain} for ${prospect.businessName}`,
  );
}
