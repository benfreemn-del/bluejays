import { NextResponse } from "next/server";
import { generateBrief } from "@/lib/content-engine/briefs";

/**
 * GET /api/content/brief
 *
 * Returns today's content brief (bucket + 3 hook variants + script
 * draft + CTA + tone guards). Internal-only — read by the
 * /dashboard/content morning page.
 *
 * Stateless v1 — every call regenerates from live data. Phase 2 will
 * persist the picked hook to content_briefs so we can train on what
 * Ben actually shipped vs rejected.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const brief = await generateBrief();
    if (!brief) {
      return NextResponse.json(
        {
          ok: false,
          error: "No fresh material in any bucket. Pull from evergreen bank.",
        },
        { status: 200 },
      );
    }
    return NextResponse.json({ ok: true, brief });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[/api/content/brief] failed:", msg);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
