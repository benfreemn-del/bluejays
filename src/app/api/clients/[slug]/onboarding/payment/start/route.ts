import { NextRequest, NextResponse } from "next/server";
import { ownerFromCookie } from "@/lib/client-auth";
import { createSetupCheckoutSession } from "@/lib/stripe";
import { getOrCreateOnboarding } from "@/lib/client-onboarding";

/**
 * POST /api/clients/[slug]/onboarding/payment/start
 *
 * Creates a Stripe Checkout Session in SETUP mode (no charge — captures
 * a card on file for later pass-through billing of Twilio/Lob/ads).
 *
 * Returns { url } the browser redirects to. Stripe sends them back to
 * /clients/[slug]/onboarding?step=payment&setup=ok&session_id=… which
 * the callback route reads to record last4 + setup_intent_id on the
 * onboarding step_payment column.
 *
 * Auth: client-portal cookie.
 * Mock-safe: when STRIPE_SECRET_KEY is unset, returns a fake URL that
 * loops straight back to the wizard with ?mock=ok so local dev can
 * exercise the full success path.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const cookie = req.cookies.get("client-portal-session")?.value;
  const owner = cookie ? await ownerFromCookie(cookie) : null;
  if (!owner || owner.client_slug !== slug) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const row = await getOrCreateOnboarding(slug);
  // Reuse the stripe_customer_id we may have already saved on a prior
  // attempt, otherwise create a fresh one.
  const existing = (row.step_payment ?? null) as {
    stripe_customer_id?: string;
  } | null;

  const successPath = `/clients/${slug}/onboarding?step=payment&setup=ok`;
  const cancelPath = `/clients/${slug}/onboarding?step=payment&setup=cancelled`;

  try {
    const session = await createSetupCheckoutSession({
      clientSlug: slug,
      email: owner.email,
      businessName: owner.name ?? slug,
      successPath,
      cancelPath,
      existingCustomerId: existing?.stripe_customer_id,
    });
    return NextResponse.json({ ok: true, url: session.url });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
