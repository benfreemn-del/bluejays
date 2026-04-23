import { NextResponse } from "next/server";
import { getAllProspects } from "@/lib/store";
import { generateProspectVideo, getProspectVideoUrl, listProspectVideoStatuses } from "@/lib/video-generator";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * GET /api/videos/batch
 *
 * Returns a status summary of all prospects: which have videos, which are missing.
 */
export async function GET() {
  const statuses = await listProspectVideoStatuses();
  const ready = statuses.filter((s) => s.videoStatus === "ready").length;
  const missing = statuses.filter((s) => s.videoStatus === "not_started").length;
  const generating = statuses.filter((s) => s.videoStatus === "generating").length;
  const failed = statuses.filter((s) => s.videoStatus === "failed").length;

  return NextResponse.json({
    total: statuses.length,
    ready,
    missing,
    generating,
    failed,
    statuses,
  });
}

/**
 * POST /api/videos/batch
 *
 * Generates videos for active prospects that don't have one yet.
 * Videos are expensive to generate (CPU + TTS + storage) so this runs
 * conservatively — default limit of 5 per call.
 *
 * Body (all optional):
 *   { ids?: string[]; force?: boolean; limit?: number }
 */
export async function POST(request: Request) {
  let body: { ids?: string[]; force?: boolean; limit?: number } = {};
  try {
    body = await request.json();
  } catch {
    // all optional
  }

  const { ids, force = false, limit = 5 } = body;

  const prospects = await getAllProspects();
  const activeStatuses = [
    "approved", "ready_to_review", "pending-review",
    "contacted", "email_opened", "link_clicked",
    "interested", "responded",
  ];

  const targets = prospects.filter((p) => {
    if (ids?.length) return ids.includes(p.id);
    return (
      activeStatuses.includes(p.status) &&
      p.generatedSiteUrl // must have a preview to record
    );
  });

  const toGenerate: typeof targets = [];
  for (const p of targets) {
    if (toGenerate.length >= limit) break;
    if (!force) {
      const existingUrl = await getProspectVideoUrl(p.id).catch(() => null);
      if (existingUrl) continue; // already has a video
    }
    toGenerate.push(p);
  }

  const results: {
    id: string;
    business: string;
    status: "generated" | "skipped" | "failed";
    videoUrl?: string;
    reason?: string;
  }[] = [];

  for (const prospect of toGenerate) {
    try {
      const result = await generateProspectVideo(prospect.id);
      results.push({
        id: prospect.id,
        business: prospect.businessName,
        status: "generated",
        videoUrl: result.videoUrl,
      });
      console.log(`[Videos/Batch] Generated video for ${prospect.businessName}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      results.push({
        id: prospect.id,
        business: prospect.businessName,
        status: "failed",
        reason: msg,
      });
      console.error(`[Videos/Batch] Failed for ${prospect.id}:`, msg);
    }
  }

  const generated = results.filter((r) => r.status === "generated").length;
  const failed = results.filter((r) => r.status === "failed").length;

  return NextResponse.json({
    generated,
    failed,
    total: toGenerate.length,
    results,
  });
}
