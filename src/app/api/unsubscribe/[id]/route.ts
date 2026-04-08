import { NextResponse } from "next/server";
import { getProspect, updateProspect } from "@/lib/store";

/**
 * POST /api/unsubscribe/[id]
 *
 * Public endpoint — no auth required.
 * Called when a prospect clicks the unsubscribe link from their email.
 *
 * Updates the prospect's status to "unsubscribed" and pauses all funnel outreach.
 * This immediately stops:
 * - Automated email sequences
 * - SMS follow-ups
 * - Voicemail drops
 * - Any scheduled funnel steps
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json(
      { error: "Missing prospect ID" },
      { status: 400 }
    );
  }

  try {
    const prospect = await getProspect(id);

    if (!prospect) {
      // Still return success — don't reveal whether the ID exists
      return NextResponse.json({
        success: true,
        message: "You have been unsubscribed.",
      });
    }

    // Already unsubscribed — no-op but still confirm
    if (prospect.status === "unsubscribed") {
      return NextResponse.json({
        success: true,
        message: "You have already been unsubscribed.",
        alreadyUnsubscribed: true,
      });
    }

    // Update prospect: set status to unsubscribed and pause funnel
    await updateProspect(id, {
      status: "unsubscribed",
      funnelPaused: true,
    });

    console.log(
      `[Unsubscribe] ${prospect.businessName} (${id}) has been unsubscribed.`
    );

    return NextResponse.json({
      success: true,
      message: "You have been unsubscribed. All outreach has been stopped.",
      businessName: prospect.businessName,
    });
  } catch (error) {
    console.error(`[Unsubscribe] Error: ${(error as Error).message}`);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

/**
 * GET /api/unsubscribe/[id]
 *
 * Returns the unsubscribe status for a prospect.
 * Used by the unsubscribe page to check current state.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ valid: false });
  }

  try {
    const prospect = await getProspect(id);

    if (!prospect) {
      return NextResponse.json({ valid: true, alreadyUnsubscribed: false });
    }

    return NextResponse.json({
      valid: true,
      alreadyUnsubscribed: prospect.status === "unsubscribed",
      businessName: prospect.businessName,
    });
  } catch {
    return NextResponse.json({ valid: true, alreadyUnsubscribed: false });
  }
}
