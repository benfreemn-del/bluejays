import { NextResponse } from "next/server";
import { getProspect } from "@/lib/store";
import { simulateFunnel } from "@/lib/funnel-simulator";

/**
 * GET /api/funnel/simulate/[id]
 *
 * Simulates the entire 7-step funnel for a prospect without sending anything.
 * Returns a detailed pass/fail report for each step including:
 * - Email subject/preview
 * - SMS content
 * - Voicemail trigger
 * - Status changes
 * - Validation checks (links, templates, data population)
 */
export async function GET(
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

  const report = simulateFunnel(prospect);

  return NextResponse.json(report);
}
