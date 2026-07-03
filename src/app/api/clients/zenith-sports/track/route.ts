import { NextRequest, NextResponse } from "next/server";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

/**
 * /api/clients/zenith-sports/track
 *
 * Public POST — first-party page-view beacon fired from every page of
 * the live Zenith Shopify storefront (snippets/tracking-zenith.liquid).
 * One row per view into client_page_views, keyed by client_slug + path,
 * so the owner stats page can show per-URL view counts.
 *
 * The beacon sends text/plain (navigator.sendBeacon with an
 * application/json Blob triggers a CORS preflight sendBeacon can't
 * perform — text/plain keeps it a simple request), so the body is
 * read as text and JSON.parsed manually.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SLUG = "zenith-sports";
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const BOT_RE =
  /bot|crawl|spider|slurp|headless|lighthouse|pingdom|uptime|facebookexternalhit|preview|scanner/i;

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function POST(req: NextRequest) {
  const ua = req.headers.get("user-agent") || "";
  if (BOT_RE.test(ua)) {
    return new NextResponse(null, { status: 204, headers: CORS });
  }

  let path = "";
  let referrer = "";
  try {
    const raw = await req.text();
    const parsed = JSON.parse(raw) as { path?: string; referrer?: string };
    path = typeof parsed.path === "string" ? parsed.path : "";
    referrer = typeof parsed.referrer === "string" ? parsed.referrer : "";
  } catch {
    return new NextResponse(null, { status: 204, headers: CORS });
  }

  if (!path.startsWith("/") || path.length > 300) {
    return new NextResponse(null, { status: 204, headers: CORS });
  }

  if (isSupabaseConfigured()) {
    try {
      await getSupabase().from("client_page_views").insert({
        client_slug: SLUG,
        path,
        referrer: referrer.slice(0, 300) || null,
        user_agent: ua.slice(0, 300) || null,
      });
    } catch (err) {
      console.error("[zenith track] insert failed:", err);
    }
  }

  return new NextResponse(null, { status: 204, headers: CORS });
}
