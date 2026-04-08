import { NextResponse } from "next/server";
import { getProspect, updateProspect } from "@/lib/store";
import { generateVslScript } from "@/lib/vsl-generator";

/**
 * POST /api/vsl/generate/[id]
 *
 * Generates a personalized Video Sales Letter script for a prospect.
 * Uses all available prospect data to create a Hook → Agitate → Solution → Proof → CTA script.
 * Stores the generated script in the prospect record (scrapedData.vslScript).
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

  // Generate the VSL script
  const vslScript = generateVslScript(prospect);

  // Store the script in the prospect's scraped data
  const updatedScrapedData = {
    ...(prospect.scrapedData || {}),
    vslScript,
  };

  await updateProspect(id, {
    scrapedData: updatedScrapedData as typeof prospect.scrapedData,
  });

  return NextResponse.json({
    success: true,
    prospectId: id,
    businessName: prospect.businessName,
    vslScript,
  });
}

/**
 * GET /api/vsl/generate/[id]
 *
 * Retrieves a previously generated VSL script for a prospect.
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

  // Check if a VSL script has been generated
  const vslScript = (prospect.scrapedData as unknown as Record<string, unknown>)?.vslScript || null;

  return NextResponse.json({
    prospectId: id,
    businessName: prospect.businessName,
    vslScript,
    hasScript: !!vslScript,
  });
}
