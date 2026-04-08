import { NextResponse } from "next/server";
import { getProspect } from "@/lib/store";
import {
  generateCompetitorAnalysis,
  shouldDeployComparison,
} from "@/lib/competitor-analysis";
import { getEngagementScore } from "@/lib/engagement-tracker";

/**
 * GET /api/compare/[id]
 *
 * Returns the full competitor analysis for a prospect.
 * This is a smart-trigger module — the response includes a `shouldDeploy`
 * flag that the AI agent and frontend use to decide whether to show
 * the comparison to this specific prospect.
 *
 * The comparison always generates data (for preview/testing), but the
 * `shouldDeploy` flag indicates whether the prospect's engagement level
 * warrants showing it.
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

  // Generate the full analysis
  const analysis = generateCompetitorAnalysis(prospect);

  // Check engagement to determine if comparison should be deployed
  const engagement = await getEngagementScore(prospect);
  const deploy = shouldDeployComparison(
    prospect,
    engagement.score,
    engagement.triggers
  );

  return NextResponse.json({
    ...analysis,
    shouldDeploy: deploy,
    engagementScore: engagement.score,
    engagementLevel: engagement.level,
  });
}
