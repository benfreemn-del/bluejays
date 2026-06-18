import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/clients/mt-view-landscaping/ops/geocode?address=...&city=...
 *
 * Turns a street address into map coordinates so the operator never has to
 * type latitude/longitude by hand. Tries Google Geocoding first (same key the
 * scout pipeline already uses), then falls back to the free OpenStreetMap /
 * Nominatim geocoder so it still works with no key configured.
 *
 * Always returns 200 with { ok: boolean }. ok:false means "couldn't find it —
 * let the operator type coordinates manually," never a hard error the form has
 * to handle.
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type GeoResult = { ok: true; lat: number; lng: number; label: string } | { ok: false };

async function viaGoogle(query: string): Promise<GeoResult | null> {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) return null;
  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${key}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.status === "OK" && data.results?.[0]?.geometry?.location) {
      const loc = data.results[0].geometry.location;
      return { ok: true, lat: Number(loc.lat), lng: Number(loc.lng), label: data.results[0].formatted_address ?? query };
    }
    // ZERO_RESULTS / etc. — let the caller fall through to Nominatim
    return null;
  } catch {
    return null;
  }
}

async function viaNominatim(query: string): Promise<GeoResult | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=us&q=${encodeURIComponent(query)}`;
    const res = await fetch(url, {
      // Nominatim's usage policy requires an identifying User-Agent.
      headers: { "User-Agent": "BlueJays-MtView-Ops/1.0 (bluejaycontactme@gmail.com)" },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as Array<{ lat: string; lon: string; display_name: string }>;
    if (Array.isArray(data) && data[0]?.lat && data[0]?.lon) {
      return { ok: true, lat: Number(data[0].lat), lng: Number(data[0].lon), label: data[0].display_name };
    }
    return null;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const address = (req.nextUrl.searchParams.get("address") ?? "").trim();
  const city = (req.nextUrl.searchParams.get("city") ?? "").trim();

  // Need at least a street address OR a city to have any chance.
  if (!address && !city) {
    return NextResponse.json({ ok: false });
  }

  // Bias toward WA — Mt View works King/Pierce/Snohomish/Kittitas counties —
  // and always append the country so a bare "570 Wilderness Peak Dr" resolves.
  const parts = [address, city, !/\bWA\b/i.test(city) ? "WA" : "", "USA"].filter(Boolean);
  const query = parts.join(", ");

  const result = (await viaGoogle(query)) ?? (await viaNominatim(query));
  if (result?.ok) {
    return NextResponse.json(result);
  }
  return NextResponse.json({ ok: false });
}
