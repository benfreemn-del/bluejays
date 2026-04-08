import { NextResponse } from "next/server";
import { getProspect } from "@/lib/store";
import { getEngagementScore, formatEngagementSummary } from "@/lib/engagement-tracker";

/**
 * GET /api/engagement/[id]
 *
 * Returns the engagement score and smart-trigger flags for a prospect.
 * Used by the claim page, preview page, and compare page to determine
 * which conditional modules (social proof, urgency, comparison) to show.
 *
 * This is the backbone of the smart-trigger system — modules are only
 * deployed when engagement thresholds are met.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const prospect = await getProspect(id);
  if (!prospect) {
    return NextResponse.json({ error: "Prospect not found" }, { status: 404 });
  }

  const engagement = await getEngagementScore(prospect);

  console.log(
    `[Engagement] ${prospect.businessName}: ${formatEngagementSummary(engagement)}`
  );

  return NextResponse.json({
    prospectId: id,
    score: engagement.score,
    level: engagement.level,
    triggers: engagement.triggers,
    signals: engagement.signals,
    summary: formatEngagementSummary(engagement),
  });
}
