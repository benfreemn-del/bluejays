import { NextResponse } from "next/server";
import { getProspect } from "@/lib/store";
import {
  generatePersonalizedProposal,
  getStoredProposal,
} from "@/lib/proposal-generator";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const url = new URL(request.url);
  const forceRegenerate = url.searchParams.get("refresh") === "true";

  const prospect = await getProspect(id);
  if (!prospect) {
    return NextResponse.json({ error: "Prospect not found" }, { status: 404 });
  }

  try {
    const proposal = forceRegenerate
      ? await generatePersonalizedProposal(id)
      : (await getStoredProposal(id)) || (await generatePersonalizedProposal(id));

    return NextResponse.json({
      proposal,
      generated: true,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to generate proposal",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const prospect = await getProspect(id);
  if (!prospect) {
    return NextResponse.json({ error: "Prospect not found" }, { status: 404 });
  }

  try {
    const proposal = await generatePersonalizedProposal(id);
    return NextResponse.json({ proposal, generated: true });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to generate proposal",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
