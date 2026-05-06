import { NextResponse } from "next/server";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

/**
 * GET /api/clients/olympic-inspections/slots/public
 *
 * Public, no auth. Returns available booking slots from now → next 60 days
 * for customers to pick from on the static site. Slug-scoped to OIT.
 *
 * Whitelisted in middleware (PUBLIC_API_PATHS).
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SLUG = "olympic-inspections";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Cache-Control": "public, max-age=60, s-maxage=60",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { ok: true, slots: [], note: "supabase_unconfigured" },
      { headers: CORS },
    );
  }

  const now = new Date().toISOString();
  const horizon = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await getSupabase()
    .from("client_booking_slots")
    .select("id, start_at, end_at, label")
    .eq("client_slug", SLUG)
    .eq("status", "available")
    .gte("start_at", now)
    .lte("start_at", horizon)
    .order("start_at", { ascending: true })
    .limit(200);

  if (error) {
    console.error("[oit-slots-public] error:", error.message);
    return NextResponse.json(
      { ok: false, slots: [] },
      { status: 500, headers: CORS },
    );
  }

  return NextResponse.json(
    { ok: true, slots: data ?? [] },
    { headers: CORS },
  );
}
