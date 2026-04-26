import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { getProspect } from "@/lib/store";
import { createCheckoutSession } from "@/lib/stripe";

/**
 * POST /api/checkout/free-tier/[id]
 * GET  /api/checkout/free-tier/[id]
 *
 * Dedicated free-tier checkout endpoint. Bypasses Rule 53's
 * standard-only gate on /api/checkout/create because it KNOWS it's
 * serving the free tier and that's the whole point.
 *
 * The route's existence is itself the gate — Ben sends this URL
 * directly to a vetted free-tier prospect (e.g., OPS / friend / family).
 * Anyone hitting it for a non-free-tier prospect gets a 403, so
 * accidentally exposing the URL doesn't leak free-tier pricing to
 * regular standard-tier prospects.
 *
 * Path: prospect ID is in the URL — no need for ?client_reference_id
 * gymnastics like a Stripe Payment Link would require.
 *
 * Behavior:
 *  - Verifies prospect exists AND prospect.pricingTier === 'free'
 *  - Honors Rule 52 kill-switch (STRIPE_LIVE_ENABLED=false → 503)
 *  - Creates a Stripe Checkout Session via the existing
 *    createCheckoutSession() helper with pricingTier='free'
 *  - Returns { url } — page-side code redirects the customer
 *  - GET also works as a redirect for direct-link sharing — Ben can
 *    text/email the URL and the customer's browser opens straight to
 *    Stripe Checkout. POST returns JSON so a button can wire to it.
 *
 * Uses STRIPE_PRICE_FREE_TIER_SETUP env var when set (Stripe-side
 * price ID for the $30 product) for clean reporting; falls back to
 * inline price_data when unset (mock-mode safe).
 *
 * Webhook handles the post-payment side: marks status=paid,
 * pricing_tier=free, paidAt=now, creates the deferred $100/yr mgmt sub
 * with trial_end=+365d (same path as full-pay $997).
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return handle(request, params);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  // GET is a convenience for direct-link sharing — redirect the
  // customer's browser straight to Stripe Checkout instead of returning
  // JSON. Lets Ben paste the URL into a text/email and the customer
  // taps once, lands on Stripe.
  return handle(request, params, { redirect: true });
}

async function handle(
  request: NextRequest,
  paramsPromise: Promise<{ id: string }>,
  opts: { redirect?: boolean } = {},
) {
  // Rule 52 kill-switch — same as /api/checkout/create.
  if (process.env.STRIPE_LIVE_ENABLED === "false") {
    return NextResponse.json(
      {
        error:
          "Checkout is temporarily unavailable. Please email bluejaycontactme@gmail.com.",
      },
      { status: 503 },
    );
  }

  const { id: prospectId } = await paramsPromise;

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
  const { allowed } = rateLimit(`free-tier-checkout:${ip}`, 10, 60 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many checkout attempts. Please try again later." },
      { status: 429 },
    );
  }

  const prospect = await getProspect(prospectId);
  if (!prospect) {
    return NextResponse.json({ error: "Prospect not found" }, { status: 404 });
  }

  // Hard gate — only free-tier prospects can use this route. If a
  // standard or custom-tier prospect somehow lands here, force them
  // to the appropriate flow.
  if (prospect.pricingTier !== "free") {
    return NextResponse.json(
      {
        error:
          "This prospect is not on the free tier. Use /api/checkout/create for standard-tier checkout, or email bluejaycontactme@gmail.com for custom-tier.",
      },
      { status: 403 },
    );
  }

  if (!prospect.email) {
    return NextResponse.json(
      {
        error:
          "Prospect has no email on file — set the email before generating a checkout link.",
      },
      { status: 400 },
    );
  }

  try {
    const session = await createCheckoutSession(
      prospectId,
      prospect.businessName,
      prospect.email,
      "free",
      "full",
    );

    if (opts.redirect) {
      return NextResponse.redirect(session.url, { status: 302 });
    }
    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (err) {
    const error = err as Error & { type?: string; code?: string; statusCode?: number };
    console.error(
      "[Free-Tier Checkout] Error creating session:",
      error.message,
      error.type,
      error.code,
    );
    return NextResponse.json(
      {
        error: "Failed to create checkout session",
        detail: error.message || "Unknown error",
      },
      { status: error.statusCode || 500 },
    );
  }
}
