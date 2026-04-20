/**
 * Stripe Integration — Payment processing for BlueJays.
 *
 * Uses the official Stripe npm package for type-safe API interactions.
 * Supports the $997 one-time setup fee via Stripe Checkout.
 * If STRIPE_PRICE_SETUP_ID is configured, uses that; otherwise creates
 * a dynamic one-time price inline.
 *
 * Optionally supports a $100/year management subscription if
 * STRIPE_PRICE_MGMT_ID is configured.
 *
 * Environment variables required:
 *   STRIPE_SECRET_KEY       - Stripe secret API key
 *   STRIPE_WEBHOOK_SECRET   - Webhook endpoint signing secret
 *
 * Optional environment variables:
 *   STRIPE_PUBLISHABLE_KEY  - Stripe publishable key (for client-side)
 *   STRIPE_PRICE_SETUP_ID   - Price ID for the $997 one-time setup
 *   STRIPE_PRICE_MGMT_ID    - Price ID for the $100/year management subscription
 */

import Stripe from "stripe";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

let _stripe: Stripe | null = null;

/**
 * Get the Stripe client instance (lazy-initialized).
 */
export function getStripe(): Stripe {
  if (!_stripe) {
    if (!STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }
    _stripe = new Stripe(STRIPE_SECRET_KEY);
  }
  return _stripe;
}

export interface CheckoutSession {
  id: string;
  url: string;
}

/**
 * Create a Stripe Checkout Session for the $997 one-time setup fee.
 *
 * Strategy:
 * 1. If STRIPE_PRICE_SETUP_ID is set, use that pre-created price.
 * 2. Otherwise, create an inline one-time price_data for $997.
 * 3. If STRIPE_PRICE_MGMT_ID is also set, add the recurring subscription
 *    line item and use "subscription" mode.
 * 4. If only the one-time fee is present, use "payment" mode.
 *
 * After successful payment, the prospect is redirected to /onboarding/[id].
 * On cancellation, they return to /claim/[id]?payment=cancelled.
 */
export async function createCheckoutSession(
  prospectId: string,
  businessName: string,
  email: string,
  pricingTier: "standard" | "free" | "custom" = "standard",
  paymentPlan: "full" | "installment" = "full"
): Promise<CheckoutSession> {
  if (!STRIPE_SECRET_KEY) {
    // Mock mode — return fake checkout URL for development
    console.log(`  [MOCK] Stripe Checkout for ${businessName} (${email}) [tier=${pricingTier}]`);
    return {
      id: `mock_session_${prospectId}`,
      url: `/onboarding/${prospectId}?mock=true`,
    };
  }

  const stripe = getStripe();
  // Hardcoded — CLAUDE.md pattern: Vercel had NEXT_PUBLIC_BASE_URL set to an
  // invalid/old value, causing Stripe to reject success_url/cancel_url with
  // "Not a valid URL". Same fix as FROM_EMAIL in email-sender.ts.
  const baseUrl = "https://bluejayportfolio.com";

  // ─── CUSTOM TIER — $100/yr subscription, no trial, starts immediately ───
  //
  // For bespoke-built sites (not V2-template-generated). First $100 hits at
  // checkout, then auto-renews annually forever. This subscription IS the
  // management fee — the webhook handler skips creating a second deferred
  // mgmt sub for custom-tier prospects (see /api/webhooks/stripe/route.ts).
  //
  // Uses STRIPE_PRICE_CUSTOM_ID env var (recommended) or falls back to
  // inline price_data. See CLAUDE.md "Custom Pricing Tier Rules".
  if (pricingTier === "custom") {
    const customPriceId = process.env.STRIPE_PRICE_CUSTOM_ID;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const customLineItem: any = customPriceId
      ? { price: customPriceId, quantity: 1 }
      : {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Custom Website — ${businessName}`,
              description:
                "Bespoke custom-built website — $100 annual subscription (design, hosting, ongoing maintenance, and support)",
            },
            unit_amount: 10000, // $100
            recurring: { interval: "year" as const, interval_count: 1 },
          },
          quantity: 1,
        };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const customSessionParams: any = {
      mode: "subscription",
      line_items: [customLineItem],
      success_url: `${baseUrl}/onboarding/${prospectId}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/claim/${prospectId}?payment=cancelled`,
      metadata: { prospectId, businessName, pricingTier: "custom", paymentPlan: "custom-annual" },
      subscription_data: {
        metadata: { prospectId, businessName, pricingTier: "custom", type: "custom_annual" },
      },
    };

    if (email) customSessionParams.customer_email = email;

    try {
      const session = await stripe.checkout.sessions.create(customSessionParams);
      return { id: session.id, url: session.url! };
    } catch (stripeError) {
      console.error("[Stripe] Custom-tier checkout session creation failed:", stripeError);
      throw stripeError;
    }
  }

  const setupPriceId = process.env.STRIPE_PRICE_SETUP_ID;
  const mgmtPriceId = process.env.STRIPE_PRICE_MGMT_ID;

  // Build line items — use configured Price IDs if available, otherwise use inline pricing
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lineItems: any[] = [];

  // Determine setup amount based on pricing tier and payment plan
  const isFreeTier = pricingTier === "free";
  const isInstallment = paymentPlan === "installment" && !isFreeTier;

  if (isInstallment) {
    // 3 monthly payments of $349 ($1,047 total — slight premium for flexibility).
    // The subscription auto-cancels via `cancel_at` (set below) so Stripe only
    // charges exactly 3 times: today, +~30 days, +~60 days.
    lineItems.push({
      price_data: {
        currency: "usd",
        product_data: {
          name: `Custom Website — ${businessName}`,
          description: "Premium custom website — 3 monthly payments of $349 (auto-ends after payment 3)",
        },
        unit_amount: 34900, // $349
        recurring: { interval: "month" as const, interval_count: 1 },
      },
      quantity: 1,
    });
  } else {
    const setupAmountCents = isFreeTier ? 3000 : 99700; // $30 or $997
    const setupDescription = isFreeTier
      ? "Website setup — domain and server costs"
      : "Premium custom website design, hosting setup, and deployment";

    if (setupPriceId && !isFreeTier) {
      lineItems.push({ price: setupPriceId, quantity: 1 });
    } else {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: `Custom Website — ${businessName}`,
            description: setupDescription,
          },
          unit_amount: setupAmountCents,
        },
        quantity: 1,
      });
    }
  }

  // --- $100/year management subscription is ALWAYS deferred to year-1 ---
  // We intentionally do NOT attach the mgmt line item to the checkout session,
  // because a Stripe subscription item charges immediately — which would hit
  // the customer for $997 + $100 on day 0. Instead, the webhook handler
  // (checkout.session.completed for full-pay, customer.subscription.deleted
  // for installment) calls createDeferredManagementSubscription() after
  // payment, which creates the $100/yr sub with a 1-year trial so the first
  // charge lands exactly at their year-1 anniversary.
  //
  // Keep the `mgmtPriceId` env var readable so createDeferredManagementSubscription
  // can reuse the same pre-created Stripe Price — but don't attach it here.
  void mgmtPriceId;

  // Determine session mode:
  // - "subscription" if installment (the only recurring line item here)
  // - "payment" for one-time full-pay
  const mode: "subscription" | "payment" = isInstallment ? "subscription" : "payment";

  // Build session params
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sessionParams: any = {
    mode,
    line_items: lineItems,
    success_url: `${baseUrl}/onboarding/${prospectId}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/claim/${prospectId}?payment=cancelled`,
    metadata: { prospectId, businessName, pricingTier, paymentPlan },
  };

  // Installment metadata flows to the Stripe Subscription object so the
  // webhook handler can (a) patch the subscription with `cancel_at` right
  // after creation — Stripe's checkout.sessions.create doesn't accept
  // subscription_data.cancel_at directly — and (b) later spin up the
  // deferred $100/yr mgmt subscription after payment 3.
  if (isInstallment) {
    sessionParams.subscription_data = {
      metadata: {
        prospectId,
        paymentPlan: "installment-3x349",
        expectedPayments: "3",
      },
    };
  }

  // Only set customer_email if we have one
  if (email) {
    sessionParams.customer_email = email;
  }

  // For one-time "payment" mode, we can optionally set payment_method_types.
  // For "subscription" mode, Stripe auto-determines payment methods.
  if (mode === "payment") {
    sessionParams.payment_method_types = ["card"];
  }

  try {
    const session = await stripe.checkout.sessions.create(sessionParams);

    return {
      id: session.id,
      url: session.url!,
    };
  } catch (stripeError) {
    // Log the full Stripe error for debugging
    console.error("[Stripe] Checkout session creation failed:", stripeError);
    throw stripeError;
  }
}

/**
 * Verify a Stripe webhook signature and parse the event.
 */
export function constructWebhookEvent(
  body: string,
  signature: string
): Stripe.Event {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new Error("STRIPE_WEBHOOK_SECRET is not configured");
  }

  return stripe.webhooks.constructEvent(body, signature, webhookSecret);
}

/**
 * Check if Stripe is configured with the required environment variables.
 */
export function isStripeConfigured(): boolean {
  return !!STRIPE_SECRET_KEY;
}
