import { NextResponse } from "next/server";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

/**
 * GET /api/clients/kr-ranches/menu/public
 *
 * PUBLIC endpoint — no auth. Fetched by the static KR site on page load
 * to render the freezer menu dynamically. Returns the same data as the
 * authed endpoint but stripped to the visual fields only.
 *
 * Hardcoded slug = "kr-ranches" (this route is KR-specific). The static
 * site has the items baked in as a fallback so a Supabase outage doesn't
 * break the page.
 *
 * Whitelisted in middleware via PUBLIC_API_PATHS (/api/clients/kr-ranches/menu/public).
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SLUG = "kr-ranches";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Cache-Control": "public, max-age=60, s-maxage=60", // 1-min cache so edits show fast
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { ok: true, items: [], note: "supabase_unconfigured" },
      { headers: CORS_HEADERS },
    );
  }

  try {
    const { data, error } = await getSupabase()
      .from("client_menu_items")
      .select("name, price, note, status, sort_order")
      .eq("client_slug", SLUG)
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("[kr-menu-public] supabase error:", error.message);
      return NextResponse.json(
        { ok: false, error: "fetch_failed", items: [] },
        { status: 500, headers: CORS_HEADERS },
      );
    }

    return NextResponse.json(
      { ok: true, items: data ?? [] },
      { headers: CORS_HEADERS },
    );
  } catch (e) {
    console.error("[kr-menu-public] unexpected:", e);
    return NextResponse.json(
      { ok: false, error: "internal", items: [] },
      { status: 500, headers: CORS_HEADERS },
    );
  }
}
