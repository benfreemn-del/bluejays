import { NextResponse } from "next/server";

import { generateProspectVideo } from "@/lib/video-generator";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const result = await generateProspectVideo(id);
    return NextResponse.json({
      message: "Video generated successfully",
      ...result,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Video generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
