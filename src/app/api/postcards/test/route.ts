import { NextRequest, NextResponse } from "next/server";
import { sendPostcard } from "@/lib/postcard-sender";
import { getProspect } from "@/lib/store";
import type { Prospect } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * POST /api/postcards/test
 *
 * Fire a single test postcard through Lob. Lob's **test_pub_** keys are
 * free and don't print/mail anything — they return a dashboard URL showing
 * exactly what the rendered postcard would look like. Perfect for Ben to
 * eyeball the HTML front + back before switching to a live `live_pub_` key.
 *
 * Body:
 *   {
 *     prospectId?: string        — use a real prospect's data if provided
 *     to?: {                      — otherwise override address manually
 *       name: string
 *       address_line1: string
 *       address_city: string
 *       address_state: string
 *       address_zip: string
 *     }
 *     forceTier?: boolean         — bypass the 4.5★/20-reviews gate
 *   }
 *
 * Auth: admin Bearer (same as other /api/* admin endpoints)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const prospectId: string | undefined = body.prospectId;
    const forceTier: boolean = body.forceTier === true;

    let prospect: Prospect | null = null;
    if (prospectId) {
      prospect = (await getProspect(prospectId)) ?? null;
      if (!prospect) {
        return NextResponse.json(
          { error: `Prospect ${prospectId} not found` },
          { status: 404 }
        );
      }
    } else {
      // Synthesize a demo prospect so Ben can test Lob rendering before
      // picking a real prospect. Uses a valid-format address so Lob's
      // address-verification doesn't bounce the card preview.
      prospect = {
        id: "00000000-0000-0000-0000-000000000001",
        businessName: "Ridgewood Plumbing",
        ownerName: "Mike Stevens",
        category: "plumber",
        phone: "(555) 123-4567",
        email: null,
        address: "1600 Pennsylvania Avenue NW, Washington, DC 20500",
        city: "Washington",
        state: "DC",
        googleRating: 4.9,
        reviewCount: 47,
        currentWebsite: null,
        status: "approved",
        estimatedRevenueTier: "medium",
        source: "inbound",
        scrapedData: {},
        paymentStatus: undefined,
      } as unknown as Prospect;
    }

    const result = await sendPostcard(prospect, { forceTier });

    return NextResponse.json({
      success: result.sent,
      skipped: result.skipped,
      lobId: result.lobId,
      expectedDelivery: result.expectedDeliveryDate,
      costUsd: result.costUsd,
      error: result.error,
      preview:
        "Check Lob dashboard → Postcards → your latest entry. " +
        "Test-mode postcards show a PDF preview without printing/mailing.",
      prospect: {
        id: prospect.id,
        businessName: prospect.businessName,
        eligibilityGate: forceTier
          ? "bypassed (forceTier=true)"
          : `needs rating ≥ 4.5 AND reviews ≥ 20 (actual: ${prospect.googleRating}★ / ${prospect.reviewCount} reviews)`,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message || "Postcard test failed" },
      { status: 500 }
    );
  }
}
