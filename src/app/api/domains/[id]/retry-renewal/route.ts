import { NextRequest, NextResponse } from "next/server";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { getDomain } from "@/lib/domain-store";
import { processDomainRenewal } from "@/app/api/billing/check-domain-renewals/route";

/**
 * Failure-recovery endpoint — re-runs the renewal logic for a single
 * domain. Used after an operator updates the customer's card on file
 * (Stripe sub flips back to active) so the domain in `renewal_paused`
 * can complete its renewal without waiting for tomorrow's cron run.
 *
 * Flow is identical to the daily cron's per-domain branch:
 *   1. Look up Stripe sub status
 *   2. If active → registrar.renew + log cost + bump expires_at
 *   3. If past_due → stay paused (operator hasn't actually fixed it)
 *   4. If cancelled → mark cancelled
 *
 * Auth-gated via middleware (admin-only). Mock-mode safe.
 */

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const stripeOk = isStripeConfigured();
  const registrarConfigured = !!process.env.NAMECHEAP_API_KEY;
  const mockMode = !stripeOk || !registrarConfigured;

  try {
    const domain = await getDomain(id);
    if (!domain) {
      return NextResponse.json({ error: "Domain not found" }, { status: 404 });
    }

    // We allow retry for `renewal_paused`, `failed`, and even `registered`
    // (operator force-retry). Cancelled domains require an explicit
    // un-cancellation by an operator first.
    if (domain.status === "cancelled") {
      return NextResponse.json(
        {
          error:
            "Domain is cancelled — un-cancel via PATCH first, then retry renewal.",
        },
        { status: 409 },
      );
    }

    const stripe = stripeOk ? getStripe() : null;

    const summary = {
      checked: 1,
      renewed: 0,
      paused: 0,
      cancelled: 0,
      failed: 0,
      errors: [] as Array<{ domainId: string; domain: string; error: string }>,
      mockMode,
    };

    await processDomainRenewal({
      domain,
      stripe,
      summary,
      mockMode,
    });

    // Reload the row so the operator sees the post-action state.
    const after = await getDomain(id);

    return NextResponse.json({
      ok: true,
      summary,
      domain: after,
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
