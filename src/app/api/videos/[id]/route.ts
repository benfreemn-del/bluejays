import { NextResponse } from "next/server";

import { generateProspectVideo, getProspectVideoUrl } from "@/lib/video-generator";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

// GET — return the ready video URL for a prospect (or null if not generated yet).
// Safe to call from the public preview page; it only exposes the public video URL.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const videoUrl = await getProspectVideoUrl(id);
    return NextResponse.json({ videoUrl: videoUrl || null });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to read video status";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

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
