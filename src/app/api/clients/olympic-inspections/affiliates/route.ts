import { NextRequest, NextResponse } from "next/server";
import { ownerFromCookie } from "@/lib/client-auth";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

/**
 * GET /api/clients/olympic-inspections/affiliates
 *
 * Owner-only. Returns scouted partner candidates (auto-discovered by
 * the weekly oit-partner-scout cron) for rendering on the Affiliates
 * Map alongside the hand-curated seed list.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SLUG = "olympic-inspections";

const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  Sequim: { lat: 48.0789, lng: -123.0926 },
  "Port Angeles": { lat: 48.1186, lng: -123.43 },
  "Port Townsend": { lat: 48.117, lng: -122.76 },
  Bremerton: { lat: 47.567, lng: -122.63 },
  Silverdale: { lat: 47.644, lng: -122.694 },
  Forks: { lat: 47.95, lng: -124.385 },
  Shelton: { lat: 47.215, lng: -123.103 },
};

export async function GET(req: NextRequest) {
  const cookie = req.cookies.get("client-portal-session")?.value;
  const owner = await ownerFromCookie(cookie);
  if (!owner || owner.client_slug !== SLUG) {
    return NextResponse.json(
      { ok: false, error: "unauthorized" },
      { status: 401 },
    );
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: true, affiliates: [] });
  }
  const { data, error } = await getSupabase()
    .from("client_affiliates")
    .select(
      "id, org_name, role, city, state, phone, website, fit_score, status, source, last_contacted_at",
    )
    .eq("client_slug", SLUG)
    .order("fit_score", { ascending: false })
    .limit(500);
  if (error) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 },
    );
  }
  // Project city → lat/lng so the map can render scouted rows
  // without a per-row geocode roundtrip.
  const projected = (data ?? []).map((r) => {
    const coords = (r.city && CITY_COORDS[r.city]) || null;
    // Stable per-row jitter so multi-pin cities don't stack.
    let seed = 0;
    const id: string = (r.id as string) || "x";
    for (const c of id) {
      seed = (seed * 31 + c.charCodeAt(0)) >>> 0;
    }
    const jitterLat = ((seed % 100) - 50) / 5000;
    const jitterLng = (((seed >> 8) % 100) - 50) / 5000;
    return {
      ...r,
      lat: coords ? coords.lat + jitterLat : null,
      lng: coords ? coords.lng + jitterLng : null,
    };
  });
  return NextResponse.json({ ok: true, affiliates: projected });
}
