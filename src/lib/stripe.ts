/**
 * Stripe Integration — Payment processing for BlueJays.
 *
 * Uses the official Stripe npm package for type-safe API interactions.
 * Supports both the $997 one-time setup fee and $100/year management subscription
 * in a single Checkout Session.
 *
 * Environment variables required:
 *   STRIPE_SECRET_KEY       - Stripe secret API key
 *   STRIPE_PUBLISHABLE_KEY  - Stripe publishable key (for client-side)
 *   STRIPE_WEBHOOK_SECRET   - Webhook endpoint signing secret
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
 * Create a Stripe Checkout Session with both the setup fee and management subscription.
 *
 * The session includes:
 * - $997 one-time setup fee (STRIPE_PRICE_SETUP_ID)
 * - $100/year management subscription (STRIPE_PRICE_MGMT_ID)
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
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

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

  if (mgmtPriceId) {
    lineItems.push({ price: mgmtPriceId, quantity: 1 });
  } else {
    lineItems.push({
      price_data: {
        currency: "usd",
        product_data: {
          name: "Annual Site Management",
          description: "Hosting, security updates, and site management for one year",
        },
        unit_amount: 10000, // $100.00
        recurring: { interval: "year" },
      },
      quantity: 1,
    });
  }

  // Determine session mode based on whether we have recurring items
  const hasRecurring = mgmtPriceId || !setupPriceId;
  const mode = hasRecurring ? "subscription" : "payment";

  const session = await stripe.checkout.sessions.create({
    mode: mode as "subscription" | "payment",
    line_items: lineItems,
    success_url: `${baseUrl}/onboarding/${prospectId}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/claim/${prospectId}?payment=cancelled`,
    metadata: { prospectId, businessName },
    customer_email: email || undefined,
    payment_method_types: ["card"],
  });

  return {
    id: session.id,
    url: session.url!,
  };
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
