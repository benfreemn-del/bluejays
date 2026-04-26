import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { getProspect, updateProspect } from "@/lib/store";
import { createCheckoutSession } from "@/lib/stripe";

/**
 * POST /api/checkout/create
 *
 * Creates a Stripe Checkout Session for a prospect who has claimed their site.
 * Includes the $997 one-time fee for custom website design, domain registration, and hosting setup, plus the deferred $100/year maintenance subscription for domain renewal, hosting, ongoing maintenance, and support.
 *
 * Request body: { prospectId: string, plan?: string, utm?: { utm_source, utm_medium, utm_campaign, utm_content } }
 * Response: { url: string } — redirect the client to this Stripe Checkout URL
 *
 * UTM params are read by the claim page on mount (from the URL the prospect
 * arrived at) and forwarded here so they land on the Stripe Checkout
 * Session metadata. The `paid` webhook event then ties the conversion
 * back to the touch (email/sms/postcard) that drove the click.
 */
export async function POST(request: NextRequest) {
  // Rule 52 kill-switch: when STRIPE_LIVE_ENABLED=false the entire checkout
  // surface returns 503 so customers see a clean "temporarily unavailable"
  // instead of a half-completed transaction. Default true (so this is a no-op
  // when the env var is absent — Stripe behavior unchanged from pre-Rule-52).
  if (process.env.STRIPE_LIVE_ENABLED === "false") {
    return NextResponse.json(
      {
        error:
          "Checkout is temporarily unavailable. Please email bluejaycontactme@gmail.com and we'll process your order manually.",
      },
      { status: 503 },
    );
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
  const { allowed } = rateLimit(`checkout:${ip}`, 10, 60 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json({ error: "Too many checkout attempts. Please try again later." }, { status: 429 });
  }

  try {
    const body = await request.json();
    const { prospectId, plan, utm } = body as {
      prospectId?: string;
      plan?: string;
      utm?: { utm_source?: string; utm_medium?: string; utm_campaign?: string; utm_content?: string };
    };
    const paymentPlan = plan === "installment" ? "installment" : "full" as const;

    if (!prospectId) {
      return NextResponse.json(
        { error: "Missing prospectId" },
        { status: 400 }
      );
    }

    const prospect = await getProspect(prospectId);
    if (!prospect) {
      return NextResponse.json(
        { error: "Prospect not found" },
        { status: 404 }
      );
    }

    // Update status to 'claimed' if not already past that stage. Also persist
    // the most recent UTM source/campaign on the prospect so the dashboard
    // can group conversions by touch even after the Stripe metadata is gone.
    const prePaymentStatuses = [
      "scouted", "scraped", "generated", "pending-review",
      "ready_to_review", "qc_failed", "approved", "deployed",
      "contacted", "engaged", "link_clicked", "responded",
      "interested",
    ];
    const utmPatch: Record<string, string> = {};
    if (utm?.utm_source) utmPatch.last_utm_source = utm.utm_source;
    if (utm?.utm_medium) utmPatch.last_utm_medium = utm.utm_medium;
    if (utm?.utm_campaign) utmPatch.last_utm_campaign = utm.utm_campaign;
    if (utm?.utm_content) utmPatch.last_utm_content = utm.utm_content;
    if (prePaymentStatuses.includes(prospect.status)) {
      await updateProspect(prospectId, { status: "claimed", ...utmPatch } as never);
    } else if (Object.keys(utmPatch).length > 0) {
      // Past `claimed` already — still capture the latest touch attribution.
      await updateProspect(prospectId, utmPatch as never);
    }

    const email = prospect.email || "";
    const pricingTier = (prospect.pricingTier as "standard" | "free" | "custom") || "standard";

    // Rule 53: at LIVE launch only `standard` tier is self-serve. `free` and
    // `custom` route through Ben directly — friends/family + bespoke
    // relationships get manual handling, not the templated checkout. Override
    // by setting STRIPE_ALLOW_NON_STANDARD_TIERS=true on Vercel if Ben needs
    // to re-open self-serve on those tiers (e.g. for a specific batch).
    if (
      pricingTier !== "standard" &&
      process.env.STRIPE_ALLOW_NON_STANDARD_TIERS !== "true"
    ) {
      return NextResponse.json(
        {
          error:
            "This site is on a non-standard plan. Please email bluejaycontactme@gmail.com and we'll get your order set up directly.",
        },
        { status: 403 },
      );
    }

    const session = await createCheckoutSession(
      prospectId,
      prospect.businessName,
      email,
      pricingTier,
      paymentPlan,
      utm,
    );

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (err) {
    const error = err as Error & { type?: string; code?: string; statusCode?: number };
    console.error("[Checkout] Error creating session:", error.message, error.type, error.code);
    return NextResponse.json(
      {
        error: "Failed to create checkout session",
        detail: error.message || "Unknown error",
      },
      { status: error.statusCode || 500 }
    );
  }
}
