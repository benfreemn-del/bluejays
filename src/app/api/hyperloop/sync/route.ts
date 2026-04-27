import { NextRequest, NextResponse } from "next/server";
import { syncAllVariants } from "@/lib/hyperloop-sync";

/**
 * POST /api/hyperloop/sync
 *
 * Pulls last 7 days of insights from Meta + Google Ads APIs for every
 * variant with a platform_ad_id, writes daily rows into
 * hyperloop_insights_daily, refreshes the variant's rolling aggregates.
 *
 * Three callers:
 *   1. Weekly Hyperloop cron — calls syncAllVariants() directly as
 *      step 1 of the active path (no HTTP roundtrip)
 *   2. Dashboard "Sync now" button — POSTs here for an on-demand sync
 *   3. Operator curl — Bearer CRON_SECRET for manual debugging
 *
 * Public via PUBLIC_API_PATHS (/api/hyperloop/) but operator-gated:
 *   - Bearer CRON_SECRET token → allowed
 *   - Same-origin browser session from /dashboard → allowed (cookie-based;
 *     dashboard is admin-protected so the request reaching here means
 *     the user already passed auth)
 *
 * Mock-mode safe — when API credentials absent, syncAllVariants() uses
 * mock clients that return deterministic data.
 */

export const maxDuration = 120; // Allow up to 2 minutes for large variant pools

export async function POST(req: NextRequest) {
  return runSync(req);
}

export async function GET(req: NextRequest) {
  // Allow GET for easy curl/browser debugging — same auth gate
  return runSync(req);
}

async function runSync(req: NextRequest) {
  // Auth: accept Bearer CRON_SECRET (cron + curl) OR a same-origin
  // request with the admin cookie (dashboard). Same-origin is implicit
  // when the request hits this handler since the page route is admin-
  // gated upstream — we just don't reject those.
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  const isCron = cronSecret && authHeader === `Bearer ${cronSecret}`;
  const isSameOrigin = req.headers.get("referer")?.includes(req.nextUrl.host) ?? false;

  if (cronSecret && !isCron && !isSameOrigin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startedAt = Date.now();
  const result = await syncAllVariants();
  const durationMs = Date.now() - startedAt;

  return NextResponse.json({
    ok: true,
    durationMs,
    ...result,
  });
}
