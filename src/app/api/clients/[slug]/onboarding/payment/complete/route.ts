import { NextRequest, NextResponse } from "next/server";
import { ownerFromCookie } from "@/lib/client-auth";
import { retrieveSetupSession } from "@/lib/stripe";
import { saveStep } from "@/lib/client-onboarding";

/**
 * GET /api/clients/[slug]/onboarding/payment/complete?session_id=…
 *
 * Stripe redirects the customer back here after they've added a card
 * via the SETUP-mode Checkout Session. We retrieve the session,
 * extract the setup_intent + payment_method (last4, brand), and save
 * the safe summary onto onboarding.step_payment.
 *
 * Mock-safe: when STRIPE_SECRET_KEY is unset (session_id starts with
 * "mock_setup_"), we record a synthetic success row so the wizard
 * advances even without Stripe credentials.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const cookie = req.cookies.get("client-portal-session")?.value;
  const owner = cookie ? await ownerFromCookie(cookie) : null;
  if (!owner || owner.client_slug !== slug) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const sessionId = new URL(req.url).searchParams.get("session_id");
  if (!sessionId) {
    return NextResponse.json({ ok: false, error: "session_id required" }, { status: 400 });
  }

  try {
    let last4: string | null = null;
    let brand: string | null = null;
    let setupIntentId: string | null = null;
    let customerId: string | null = null;

    if (sessionId.startsWith("mock_setup_")) {
      // Local-dev path: pretend we captured a card.
      last4 = "4242";
      brand = "Visa (mock)";
      setupIntentId = `seti_mock_${Date.now()}`;
    } else {
      const summary = await retrieveSetupSession(sessionId);
      last4 = summary.last4;
      brand = summary.brand;
      setupIntentId = summary.setupIntentId;
      customerId = summary.customerId;
    }

    if (!setupIntentId) {
      return NextResponse.json(
        { ok: false, error: "Stripe session did not return a setup_intent" },
        { status: 409 },
      );
    }

    await saveStep(slug, {
      step: "payment",
      data: {
        stripe_setup_intent_id: setupIntentId,
        stripe_customer_id: customerId ?? undefined,
        card_last4: last4 ?? undefined,
        card_brand: brand ?? undefined,
        pending_manual_capture: false,
      },
    });

    return NextResponse.json({
      ok: true,
      last4,
      brand,
      setupIntentId,
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
