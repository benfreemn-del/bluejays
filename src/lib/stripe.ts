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
  email: string
): Promise<CheckoutSession> {
  if (!STRIPE_SECRET_KEY) {
    // Mock mode — return fake checkout URL for development
    console.log(`  [MOCK] Stripe Checkout for ${businessName} (${email})`);
    return {
      id: `mock_session_${prospectId}`,
      url: `/onboarding/${prospectId}?mock=true`,
    };
  }

  const stripe = getStripe();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://bluejayportfolio.com";

  const setupPriceId = process.env.STRIPE_PRICE_SETUP_ID;
  const mgmtPriceId = process.env.STRIPE_PRICE_MGMT_ID;

  // Build line items — use configured Price IDs if available, otherwise use inline pricing
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lineItems: any[] = [];

  if (setupPriceId) {
    lineItems.push({ price: setupPriceId, quantity: 1 });
  } else {
    lineItems.push({
      price_data: {
        currency: "usd",
        product_data: {
          name: `Custom Website — ${businessName}`,
          description: "Premium custom website design, hosting setup, and deployment",
        },
        unit_amount: 99700, // $997.00
      },
      quantity: 1,
    });
  }

  // --- Optional $100/year management subscription ---
  // Only add the recurring item if a pre-created price ID is configured.
  // We do NOT create inline recurring price_data because mixing one-time
  // inline prices with inline recurring prices in "subscription" mode
  // causes Stripe API errors. If the owner wants to add the subscription,
  // they should create the price in Stripe Dashboard and set STRIPE_PRICE_MGMT_ID.
  if (mgmtPriceId) {
    lineItems.push({ price: mgmtPriceId, quantity: 1 });
  }

  // Determine session mode:
  // - "subscription" if we have a recurring line item (mgmtPriceId)
  // - "payment" for one-time only
  const mode: "subscription" | "payment" = mgmtPriceId
    ? "subscription"
    : "payment";

  // Build session params
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sessionParams: any = {
    mode,
    line_items: lineItems,
    success_url: `${baseUrl}/onboarding/${prospectId}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/claim/${prospectId}?payment=cancelled`,
    metadata: { prospectId, businessName },
  };

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
