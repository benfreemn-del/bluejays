import { NextRequest, NextResponse } from "next/server";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

/**
 * /api/clients/meyer-electric/track
 *
 * Public POST — first-party page-view beacon fired from the Meyer
 * Electric showcase (mounted in the /clients/meyer-electric layout via
 * <MeyerTrackBeacon />). One row per view into client_page_views.
 *
 * Meyer's showcase serves on THREE hostnames (sequimelectrician.com +
 * sequimelectric.com middleware rewrites + the bluejayportfolio.com
 * path), so the beacon sends the hostname and we store it as part of
 * the `path` column ("sequimelectrician.com/") — per-hostname counts
 * fall out of the existing client_page_view_stats() RPC with no schema
 * change.
 *
 * Body arrives as text/plain (navigator.sendBeacon with an
 * application/json Blob triggers a CORS preflight sendBeacon can't
 * perform), so read as text and JSON.parse manually. Same contract as
 * the Zenith beacon.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SLUG = "meyer-electric";
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const BOT_RE =
  /bot|crawl|spider|slurp|headless|lighthouse|pingdom|uptime|facebookexternalhit|preview|scanner/i;

const HOST_RE = /^[a-z0-9.-]{1,100}$/i;

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function POST(req: NextRequest) {
  const ua = req.headers.get("user-agent") || "";
  if (BOT_RE.test(ua)) {
    return new NextResponse(null, { status: 204, headers: CORS });
  }

  let host = "";
  let path = "";
  let referrer = "";
  try {
    const raw = await req.text();
    const parsed = JSON.parse(raw) as {
      host?: string;
      path?: string;
      referrer?: string;
    };
    host = typeof parsed.host === "string" ? parsed.host.toLowerCase() : "";
    path = typeof parsed.path === "string" ? parsed.path : "";
    referrer = typeof parsed.referrer === "string" ? parsed.referrer : "";
  } catch {
    return new NextResponse(null, { status: 204, headers: CORS });
  }

  if (!path.startsWith("/") || path.length > 300 || !HOST_RE.test(host)) {
    return new NextResponse(null, { status: 204, headers: CORS });
  }

  // Collapse the bluejayportfolio path form so counts stay per-domain:
  // "sequimelectrician.com/" · "sequimelectric.com/" ·
  // "bluejayportfolio.com/clients/meyer-electric"
  const storedPath = `${host.replace(/^www\./, "")}${path === "/" ? "/" : path.replace(/\/+$/, "")}`;

  if (isSupabaseConfigured()) {
    try {
      await getSupabase().from("client_page_views").insert({
        client_slug: SLUG,
        path: storedPath.slice(0, 300),
        referrer: referrer.slice(0, 300) || null,
        user_agent: ua.slice(0, 300) || null,
      });
    } catch (err) {
      console.error("[meyer track] insert failed:", err);
    }
  }

  return new NextResponse(null, { status: 204, headers: CORS });
}
