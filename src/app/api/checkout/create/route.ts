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
 * Request body: { prospectId: string }
 * Response: { url: string } — redirect the client to this Stripe Checkout URL
 */
export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
  const { allowed } = rateLimit(`checkout:${ip}`, 10, 60 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json({ error: "Too many checkout attempts. Please try again later." }, { status: 429 });
  }

  try {
    const body = await request.json();
    const { prospectId, plan } = body;
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

    // Update status to 'claimed' if not already past that stage
    const prePaymentStatuses = [
      "scouted", "scraped", "generated", "pending-review",
      "ready_to_review", "qc_failed", "approved", "deployed",
      "contacted", "engaged", "link_clicked", "responded",
      "interested",
    ];
    if (prePaymentStatuses.includes(prospect.status)) {
      await updateProspect(prospectId, { status: "claimed" });
    }

    const email = prospect.email || "";
    const pricingTier = (prospect.pricingTier as "standard" | "free" | "custom") || "standard";
    const session = await createCheckoutSession(
      prospectId,
      prospect.businessName,
      email,
      pricingTier,
      paymentPlan
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
