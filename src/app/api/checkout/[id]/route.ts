import { NextResponse } from "next/server";
import { getProspect, updateProspect } from "@/lib/store";
import { createCheckoutSession } from "@/lib/stripe";

/**
 * POST /api/checkout/[id]
 *
 * Legacy checkout route — kept for backward compatibility.
 * The new preferred route is POST /api/checkout/create with { prospectId } in body.
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const prospect = await getProspect(id);
  if (!prospect) {
    return NextResponse.json(
      { error: "Prospect not found" },
      { status: 404 }
    );
  }

  try {
    // Update status to 'claimed' before checkout
    const prePaymentStatuses = [
      "scouted", "scraped", "generated", "pending-review",
      "approved", "deployed", "contacted", "engaged",
      "link_clicked", "responded", "interested",
    ];
    if (prePaymentStatuses.includes(prospect.status)) {
      await updateProspect(prospect.id, { status: "claimed" });
    }

    const session = await createCheckoutSession(
      prospect.id,
      prospect.businessName,
      prospect.email || ""
    );

    return NextResponse.json({
      checkoutUrl: session.url,
      url: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
