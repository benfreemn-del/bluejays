const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

export interface CheckoutSession {
  id: string;
  url: string;
}

export async function createCheckoutSession(
  prospectId: string,
  businessName: string,
  email: string
): Promise<CheckoutSession> {
  if (!STRIPE_SECRET_KEY) {
    // Mock mode — return fake checkout URL
    console.log(`  💳 [MOCK] Checkout for ${businessName} (${email})`);
    return {
      id: `mock_session_${prospectId}`,
      url: `/onboarding/${prospectId}?mock=true`,
    };
  }

  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      "payment_method_types[]": "card",
      "line_items[0][price_data][currency]": "usd",
      "line_items[0][price_data][product_data][name]":
        `Custom Website — ${businessName}`,
      "line_items[0][price_data][product_data][description]":
        "Premium custom website design, hosting setup, and deployment",
      "line_items[0][price_data][unit_amount]": "99700", // $997.00
      "line_items[0][quantity]": "1",
      mode: "payment",
      customer_email: email,
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/onboarding/${prospectId}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/preview/${prospectId}`,
      "metadata[prospect_id]": prospectId,
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(`Stripe error: ${err.error?.message || "Unknown"}`);
  }

  const session = await response.json();
  return { id: session.id, url: session.url };
}

export function isStripeConfigured(): boolean {
  return !!STRIPE_SECRET_KEY;
}
