import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { getProspect } from "@/lib/store";
import { getStripe } from "@/lib/stripe";
import { getUpsellDefinition, isUpsellSku, type UpsellSku } from "@/lib/upsells";

/**
 * POST /api/checkout/upsell
 *
 * Creates a Stripe Checkout Session for one of the 4 upsell SKUs:
 *   - review_blast      ($99 one-time)
 *   - extra_pages       ($400 one-time)
 *   - gbp_setup         ($150 one-time)
 *   - monthly_updates   ($50/month subscription)
 *
 * Request body: { prospectId, sku, successUrl?, cancelUrl? }
 * Response: { url } — redirect the browser to this Stripe Checkout URL.
 *
 * Eligibility:
 *   - prospect must exist
 *   - prospect.status must === "paid" (no upsells before the base purchase)
 *
 * Pricing strategy (mirrors the existing $997 / $349 / $100-sub flows):
 *   1. If the SKU's `STRIPE_PRICE_*` env var is set, use that pre-created
 *      price ID (cleanest: one Stripe Product + Price per SKU).
 *   2. Otherwise build inline `price_data` so the system works in mock-mode
 *      and immediately on first deploy — the env var is a polish step.
 *
 * Mock mode: when STRIPE_SECRET_KEY is missing, returns a fake checkout URL
 * pointing back at the upsells page so local dev / CI flows keep working.
 *
 * Metadata: `prospectId` + `sku` + `businessName` + `mode` are written so
 * the webhook handler in `/api/webhooks/stripe` can detect upsell sessions
 * and log them to the `upsells` table without conflating with the base
 * $997 / $349 setup flows.
 */
export async function POST(request: NextRequest) {
  // Rule 52 kill-switch — same as /api/checkout/create. When flipped off,
  // upsell checkouts also stop so customers don't get half-completed
  // transactions on add-on purchases either.
  if (process.env.STRIPE_LIVE_ENABLED === "false") {
    return NextResponse.json(
      {
        error:
          "Upsells are temporarily unavailable. Please email bluejaycontactme@gmail.com.",
      },
      { status: 503 },
    );
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
  const { allowed } = rateLimit(`upsell:${ip}`, 10, 60 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many checkout attempts. Please try again later." },
      { status: 429 },
    );
  }

  try {
    const body = await request.json();
    const { prospectId, sku, successUrl, cancelUrl } = body as {
      prospectId?: string;
      sku?: string;
      successUrl?: string;
      cancelUrl?: string;
    };

    if (!prospectId) {
      return NextResponse.json({ error: "Missing prospectId" }, { status: 400 });
    }
    if (!sku || !isUpsellSku(sku)) {
      return NextResponse.json({ error: "Unknown SKU" }, { status: 400 });
    }

    const prospect = await getProspect(prospectId);
    if (!prospect) {
      return NextResponse.json({ error: "Prospect not found" }, { status: 404 });
    }

    // Gate at the checkout endpoint — only paid customers can buy upsells.
    if (prospect.status !== "paid") {
      return NextResponse.json(
        {
          error: "Upsells are only available after your initial purchase.",
        },
        { status: 403 },
      );
    }

    const definition = getUpsellDefinition(sku as UpsellSku);

    // Hardcoded baseUrl per CLAUDE.md "Stripe Payment Rules" — Vercel's
    // NEXT_PUBLIC_BASE_URL has historically been set to a stale preview URL
    // and Stripe rejects the success/cancel URL with "Not a valid URL".
    const baseUrl = "https://bluejayportfolio.com";
    const fallbackSuccess = `${baseUrl}/upsells/${prospectId}?upsell=success&sku=${sku}`;
    const fallbackCancel = `${baseUrl}/upsells/${prospectId}?upsell=cancelled&sku=${sku}`;

    // Mock mode — let local dev / CI exercise the redirect flow without a
    // real Stripe key. Mirrors the existing $997 mock branch in
    // src/lib/stripe.ts createCheckoutSession.
    if (!process.env.STRIPE_SECRET_KEY) {
      console.log(
        `  [MOCK] Upsell Checkout for ${prospect.businessName} sku=${sku} (${definition.priceLabel})`,
      );
      return NextResponse.json({
        url: successUrl || fallbackSuccess,
        sessionId: `mock_upsell_${prospectId}_${sku}`,
        mock: true,
      });
    }

    const stripe = getStripe();

    // Resolve to a pre-created Stripe Price ID if the env var is set;
    // otherwise build inline price_data so the SKU works on day 0 even
    // before Ben creates Products in the Stripe Dashboard.
    const presetPriceId = process.env[definition.envVar];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const lineItem: any = presetPriceId
      ? { price: presetPriceId, quantity: 1 }
      : {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${definition.displayName} — ${prospect.businessName}`,
              description: definition.productDescription,
            },
            unit_amount: definition.priceCents,
            ...(definition.mode === "subscription"
              ? { recurring: { interval: definition.interval || "month" } }
              : {}),
          },
          quantity: 1,
        };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sessionParams: any = {
      mode: definition.mode,
      line_items: [lineItem],
      success_url: successUrl || fallbackSuccess,
      cancel_url: cancelUrl || fallbackCancel,
      metadata: {
        prospectId,
        businessName: prospect.businessName,
        sku,
        upsell: "true",
      },
      // For one-time payments, lock to card. Stripe auto-decides for subs.
      ...(definition.mode === "payment" ? { payment_method_types: ["card"] } : {}),
    };

    if (definition.mode === "subscription") {
      // Mirror metadata onto the subscription so the
      // `customer.subscription.deleted` webhook can route the cancellation
      // back to this upsell row instead of touching the management sub.
      sessionParams.subscription_data = {
        metadata: {
          prospectId,
          businessName: prospect.businessName,
          sku,
          upsell: "true",
        },
      };
    }

    if (prospect.email) sessionParams.customer_email = prospect.email;
    if (prospect.stripeCustomerId) sessionParams.customer = prospect.stripeCustomerId;

    const session = await stripe.checkout.sessions.create(sessionParams);

    return NextResponse.json({
      url: session.url,
      sessionId: session.id,
    });
  } catch (err) {
    const error = err as Error & { statusCode?: number };
    console.error("[Checkout/Upsell] Failed:", error.message);
    return NextResponse.json(
      {
        error: "Failed to create upsell checkout session",
        detail: error.message || "Unknown error",
      },
      { status: error.statusCode || 500 },
    );
  }
}
