import { NextResponse } from "next/server";
import { getProspect } from "@/lib/store";
import { generatePreview } from "@/lib/generator";

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
    const previewUrl = await generatePreview(prospect);

    return NextResponse.json({
      message: `Preview generated for ${prospect.businessName}`,
      previewUrl,
    });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
