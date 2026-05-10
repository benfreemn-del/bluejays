import { NextRequest, NextResponse } from "next/server";
import { fetchActiveAlerts, stormUrgencyScore } from "@/lib/weather-feed";

/**
 * GET /api/weather/alerts/[zip]?industry=<industry>
 *
 * Returns active NWS severe-weather alerts for a ZIP, plus an
 * industry-fit urgency score (0-30) when ?industry= is supplied.
 *
 * Used by:
 *   · per-tenant heatmap overlays (roofing / tree / hvac / plumber)
 *   · lead-score recompute jobs (urgency boost when storm in ZIP)
 *   · operator-dashboard "where to allocate ad spend this week"
 *     recommendations
 *
 * No auth — same shape as /sites/* public assets. Cached 30 min via
 * the underlying weather-feed.ts revalidate hints.
 *
 * Failure mode: returns 200 with empty alerts on any upstream failure.
 * Storm-data unavailability shouldn't break a downstream lead-score
 * pipeline.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ zip: string }> },
) {
  const { zip } = await params;
  const industry = new URL(req.url).searchParams.get("industry") ?? null;

  const alerts = await fetchActiveAlerts(zip);
  const score = industry ? await stormUrgencyScore(zip, industry) : null;

  return NextResponse.json(
    {
      ok: true,
      zip,
      industry,
      alerts,
      urgencyScore: score,
      alertCount: alerts.length,
    },
    {
      headers: {
        "Cache-Control": "public, max-age=900, s-maxage=1800",
      },
    },
  );
}
