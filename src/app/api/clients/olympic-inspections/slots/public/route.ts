import { NextResponse } from "next/server";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { fetchIcalBusyWindows, overlapsAnyBusy } from "@/lib/ical-feed";

/**
 * GET /api/clients/olympic-inspections/slots/public
 *
 * Public, no auth. Returns available booking slots from now → next 60 days
 * for customers to pick from on the static site. Slug-scoped to OIT.
 *
 * If Luke has connected an Apple/iCal feed (provider='ical' in
 * client_calendar_accounts), busy windows from that feed are pulled
 * and filtered out — slots overlapping a busy event won't be offered
 * to customers. Booking site stays in sync with the owner's actual
 * availability without him touching the manual-slots admin.
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

  const sb = getSupabase();
  const [{ data: slotsData, error }, { data: icalRow }] = await Promise.all([
    sb
      .from("client_booking_slots")
      .select("id, start_at, end_at, label")
      .eq("client_slug", SLUG)
      .eq("status", "available")
      .gte("start_at", now)
      .lte("start_at", horizon)
      .order("start_at", { ascending: true })
      .limit(200),
    sb
      .from("client_calendar_accounts")
      .select("external_account_id, status")
      .eq("client_slug", SLUG)
      .eq("provider", "ical")
      .eq("status", "active")
      .maybeSingle(),
  ]);

  if (error) {
    console.error("[oit-slots-public] error:", error.message);
    return NextResponse.json(
      { ok: false, slots: [] },
      { status: 500, headers: CORS },
    );
  }

  let slots = slotsData ?? [];

  // Apple/iCal busy-time filter: pull the published feed, drop any
  // available slot that overlaps a calendar event. Fails open — if the
  // feed is unreachable we still serve the manual slots so the booking
  // page never goes blank.
  const icalUrl = icalRow?.external_account_id ?? null;
  if (icalUrl && slots.length > 0) {
    const busy = await fetchIcalBusyWindows(icalUrl, now, horizon);
    if (busy.length > 0) {
      slots = slots.filter(
        (s) =>
          !overlapsAnyBusy(
            s.start_at as string,
            s.end_at as string,
            busy,
          ),
      );
    }
  }

  return NextResponse.json(
    { ok: true, slots, icalConnected: !!icalUrl },
    { headers: CORS },
  );
}
