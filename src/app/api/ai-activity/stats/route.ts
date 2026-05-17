/**
 * GET /api/ai-activity/stats
 *
 * Returns the FullStats payload backing /dashboard/ai-activity and
 * `bj ai stats`. Auth: same Bearer-token check as /api/ai-skills/run
 * (CRON_SECRET or ADMIN_PASSWORD).
 *
 * Query params:
 *   ?hours=24    — window for service rollup, caps, top calls (default 24)
 *   ?days=14     — window for daily-burn trend chart (default 14)
 *
 * Always 200 on auth success; body always has shape consistent with
 * FullStats so the dashboard / CLI never need to handle "weird empty
 * states" — empty arrays + zeros if Supabase isn't configured.
 *
 * In PUBLIC_API_PATHS via the prefix-match for /api/ai-activity/.
 */

import { NextRequest, NextResponse } from "next/server";
import { getFullStats } from "@/lib/ai-activity/aggregate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function authorize(req: NextRequest): boolean {
  const auth = req.headers.get("authorization") || "";
  const bearer = auth.toLowerCase().startsWith("bearer ")
    ? auth.slice(7).trim()
    : "";
  const adminToken = process.env.ADMIN_PASSWORD || "";
  const cronSecret = process.env.CRON_SECRET || "";
  if (cronSecret && bearer === cronSecret) return true;
  if (adminToken && bearer === adminToken) return true;
  return false;
}

export async function GET(request: NextRequest) {
  if (!authorize(request)) {
    return NextResponse.json(
      { ok: false, error: "missing or invalid bearer token" },
      { status: 401 },
    );
  }

  const hoursRaw = request.nextUrl.searchParams.get("hours");
  const daysRaw = request.nextUrl.searchParams.get("days");
  const hours = Math.max(1, Math.min(720, Number(hoursRaw) || 24));
  const days = Math.max(1, Math.min(90, Number(daysRaw) || 14));

  const stats = await getFullStats(hours, days);
  return NextResponse.json({ ok: true, stats });
}
