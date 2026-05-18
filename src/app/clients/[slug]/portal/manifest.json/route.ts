import { NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

/**
 * Per-client PWA manifest. Served at:
 *   /clients/[slug]/portal/manifest.json
 *
 * Adding it lets owners "Add to Home Screen" on iOS/Android and gives
 * the portal a real app icon, splash screen, and standalone window
 * (no browser chrome). The portal is daily-active for owners — the
 * install converts them from "I'll open Chrome later" to "icon on
 * my home screen, tap to check leads."
 *
 * Per CLAUDE.md "Mobile-First Portal Rules" (locked 2026-05-18).
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  // Try to pull the client's brand name; fall back to slug.
  let name = slug;
  if (isSupabaseConfigured()) {
    const { data } = await supabase
      .from("clients")
      .select("display_name")
      .eq("slug", slug)
      .limit(1)
      .maybeSingle();
    if (data?.display_name) name = data.display_name as string;
  }

  // Icons: use the favicon as the home-screen icon for now. Per-client
  // custom icons can layer on top via a client_brand_assets table later.
  const manifest = {
    name: `${name} · BlueJays`,
    short_name: name.length > 12 ? slug : name,
    description: `Owner portal for ${name} — leads, funnels, weekly reports, and the AI ops layer.`,
    start_url: `/clients/${slug}/portal`,
    scope: `/clients/${slug}/portal`,
    display: "standalone",
    orientation: "portrait",
    background_color: "#020617",
    theme_color: "#0ea5e9",
    icons: [
      { src: "/favicon.ico", sizes: "256x256", type: "image/x-icon" },
      { src: "/og-image.png", sizes: "1200x630", type: "image/png" },
    ],
  };

  return new NextResponse(JSON.stringify(manifest), {
    headers: {
      "Content-Type": "application/manifest+json; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
