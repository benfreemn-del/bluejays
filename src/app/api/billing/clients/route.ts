import { NextResponse } from "next/server";
import { getAllProspects } from "@/lib/store";
import { getStripe } from "@/lib/stripe";

export interface ClientBillingInfo {
  id: string;
  businessName: string;
  ownerName?: string;
  email?: string;
  phone?: string;
  city: string;
  state: string;
  category: string;
  paidAt?: string;
  pricingTier?: string;
  previewUrl?: string;
  stripeCustomerId?: string;
  mgmtSubscriptionId?: string;
  subscriptionStatus?: string;
  // Fetched live from Stripe
  cardBrand?: string;
  cardLast4?: string;
  cardExpMonth?: number;
  cardExpYear?: number;
  nextBillingDate?: string;
  nextBillingAmount?: number;
  trialEndsAt?: string;
  stripeError?: string;
}

export async function GET() {
  const all = await getAllProspects();
  const paid = all.filter((p) => p.status === "paid");

  const stripe = (() => {
    try { return getStripe(); } catch { return null; }
  })();

  const results: ClientBillingInfo[] = await Promise.all(
    paid.map(async (p): Promise<ClientBillingInfo> => {
      const base: ClientBillingInfo = {
        id: p.id,
        businessName: p.businessName,
        ownerName: p.ownerName,
        email: p.email,
        phone: p.phone,
        city: p.city,
        state: p.state,
        category: p.category,
        paidAt: p.paidAt,
        pricingTier: p.pricingTier ?? "standard",
        previewUrl: p.generatedSiteUrl,
        stripeCustomerId: p.stripeCustomerId,
        mgmtSubscriptionId: p.mgmtSubscriptionId,
        subscriptionStatus: p.subscriptionStatus,
      };

      if (!stripe) {
        base.stripeError = "Stripe not configured";
        return base;
      }

      // Fetch card on file from customer's default payment method
      if (p.stripeCustomerId) {
        try {
          const customer = await stripe.customers.retrieve(p.stripeCustomerId, {
            expand: ["default_source", "invoice_settings.default_payment_method"],
          }) as import("stripe").default.Customer;

          const pm = customer.invoice_settings?.default_payment_method;
          if (pm && typeof pm !== "string" && pm.card) {
            base.cardBrand = pm.card.brand;
            base.cardLast4 = pm.card.last4;
            base.cardExpMonth = pm.card.exp_month;
            base.cardExpYear = pm.card.exp_year;
          }
        } catch {
          // ignore — card data is optional
        }
      }

      // Fetch subscription details for next billing date
      if (p.mgmtSubscriptionId) {
        try {
          const sub = await stripe.subscriptions.retrieve(p.mgmtSubscriptionId);
          base.subscriptionStatus = sub.status;
          base.nextBillingDate = new Date(sub.current_period_end * 1000).toISOString();
          base.nextBillingAmount = sub.items.data[0]?.price?.unit_amount
            ? sub.items.data[0].price.unit_amount / 100
            : 100;
          if (sub.trial_end) {
            base.trialEndsAt = new Date(sub.trial_end * 1000).toISOString();
            // If still in trial, next billing is trial end
            if (sub.status === "trialing") {
              base.nextBillingDate = base.trialEndsAt;
            }
          }
        } catch {
          // ignore
        }
      }

      return base;
    })
  );

  // Sort by paidAt descending (most recent first)
  results.sort((a, b) => {
    if (!a.paidAt) return 1;
    if (!b.paidAt) return -1;
    return new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime();
  });

  return NextResponse.json(results);
}
