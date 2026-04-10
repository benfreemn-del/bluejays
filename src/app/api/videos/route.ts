import { NextResponse } from "next/server";

import { listProspectVideoStatuses } from "@/lib/video-generator";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const videos = await listProspectVideoStatuses();
    return NextResponse.json({ videos, total: videos.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load video statuses";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
