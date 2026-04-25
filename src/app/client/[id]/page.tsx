/**
 * /client/[id] — Read-only customer portal.
 *
 * Auth model: the prospect's UUID in the URL IS the credential ("URL-as-secret",
 * same pattern as a magic link). UUIDs are 128-bit and not enumerable; we
 * gain practical access control by keeping the URL out of public discovery
 * (sitemap, robots, search index). This is documented in CLAUDE.md "Public-
 * Facing Surface Rules" alongside the existing /preview/[id] and /claim/[id]
 * routes.
 *
 * What the customer sees:
 *   - Header: site URL + "Need help? Email Ben" link
 *   - Tab 1: Leads — contact form submissions + missed-call entries
 *   - Tab 2: Reviews — every review submitted via the funnel
 *   - Tab 3: Renewal — next $100/yr charge date + recent invoices
 *
 * Mock-mode safe: when Supabase isn't configured the metrics helpers return
 * empty arrays, which the empty-state UI handles gracefully.
 *
 * Stripe-down safe: renewal lookup is in try/catch — page renders even if
 * the Stripe API call fails. Customer sees "Contact Ben for renewal info"
 * instead of a broken page.
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProspect } from "@/lib/store";
import {
  listRecentLeads,
  listRecentMissedCalls,
  listRecentReviews,
  listRecentAppointments,
} from "@/lib/customer-metrics";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { getBillingPortalUrl } from "@/lib/email-templates";
import ClientPortal, { type RenewalInfo, type RecentInvoice } from "./ClientPortal";

export const dynamic = "force-dynamic";

// We never want a customer's portal indexed.
export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
  title: "Your BlueJays Portal",
};

const BASE_URL = "https://bluejayportfolio.com";
const CONTACT_EMAIL =
  process.env.FROM_EMAIL || "bluejaycontactme@gmail.com";

async function getRenewalInfo(
  mgmtSubscriptionId: string | undefined,
): Promise<RenewalInfo> {
  // Empty-state default — page must render even if Stripe is down or the
  // customer doesn't yet have a deferred mgmt sub on file.
  const fallback: RenewalInfo = {
    nextChargeDate: null,
    nextChargeAmount: null,
    status: null,
    portalUrl: getBillingPortalUrl(),
    recentInvoices: [],
    error: null,
  };

  if (!mgmtSubscriptionId || !isStripeConfigured()) {
    return fallback;
  }

  try {
    const stripe = getStripe();
    const sub = await stripe.subscriptions.retrieve(mgmtSubscriptionId);

    // current_period_end exists on every active subscription. Stripe's TS
    // types lag; cast explicitly (same pattern as billing/check-upcoming-renewals).
    const periodEndUnix = (sub as unknown as { current_period_end?: number })
      .current_period_end;
    const nextChargeDate = periodEndUnix
      ? new Date(periodEndUnix * 1000).toISOString()
      : null;

    // Pull last 3 invoices for the recent payments section. Best-effort —
    // an empty list is fine, never a hard failure.
    const recentInvoices: RecentInvoice[] = [];
    try {
      const invoices = await stripe.invoices.list({
        subscription: mgmtSubscriptionId,
        limit: 3,
      });
      for (const inv of invoices.data) {
        recentInvoices.push({
          id: inv.id || "",
          amountPaidCents: inv.amount_paid ?? 0,
          status: inv.status || "unknown",
          paidAtIso: inv.status_transitions?.paid_at
            ? new Date(inv.status_transitions.paid_at * 1000).toISOString()
            : null,
          hostedInvoiceUrl: inv.hosted_invoice_url || null,
        });
      }
    } catch {
      // Non-fatal — the renewal-date section still renders.
    }

    // Try to compute the recurring amount from the first item's price.
    const firstItem = sub.items?.data?.[0];
    const amount = firstItem?.price?.unit_amount ?? null;

    return {
      nextChargeDate,
      nextChargeAmount: amount,
      status: sub.status,
      portalUrl: getBillingPortalUrl(),
      recentInvoices,
      error: null,
    };
  } catch (err) {
    console.error("[client portal] Stripe lookup failed", err);
    return { ...fallback, error: "stripe_unavailable" };
  }
}

export default async function ClientPortalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const prospect = await getProspect(id);
  if (!prospect) {
    notFound();
  }

  const liveSiteUrl =
    prospect.generatedSiteUrl || `${BASE_URL}/preview/${prospect.id}`;

  const [leads, missedCalls, reviews, appointments, renewal] = await Promise.all([
    listRecentLeads(id, 50),
    listRecentMissedCalls(id, 50),
    listRecentReviews(id, 50),
    listRecentAppointments(id, 50),
    getRenewalInfo(prospect.mgmtSubscriptionId),
  ]);

  return (
    <ClientPortal
      businessName={prospect.businessName}
      liveSiteUrl={liveSiteUrl}
      contactEmail={CONTACT_EMAIL}
      leads={leads}
      missedCalls={missedCalls}
      reviews={reviews}
      appointments={appointments}
      renewal={renewal}
      pricingTier={(prospect as { pricingTier?: string }).pricingTier || "standard"}
    />
  );
}
