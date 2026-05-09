import { NextRequest, NextResponse } from "next/server";
import { ownerFromCookie } from "@/lib/client-auth";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { fetchIcalBusyWindows } from "@/lib/ical-feed";

/**
 * /api/clients/olympic-inspections/calendar/ical
 *
 * Owner-only. Connect / refresh / disconnect a public iCalendar feed
 * (typically Apple Calendar published-share URL, but works with any
 * .ics feed — Outlook, Google's secret-iCal export, etc.).
 *
 * The feed is read-only. We don't store credentials. The URL itself
 * is stored in client_calendar_accounts.external_account_id (per the
 * comment on that column). Booking-slot endpoint filters busy
 * windows from this feed in real time.
 *
 * GET    → current connection state ({ url, status, lastSyncedAt, eventCount })
 * POST   → save URL + verify it parses ({ url })
 * DELETE → disconnect
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SLUG = "olympic-inspections";
const PROVIDER = "ical";

async function requireOwner(req: NextRequest) {
  const cookie = req.cookies.get("client-portal-session")?.value;
  if (!cookie) return null;
  const owner = await ownerFromCookie(cookie);
  if (!owner || owner.client_slug !== SLUG) return null;
  return owner;
}

function normalizeUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  let url = trimmed;
  if (url.startsWith("webcal://")) url = "https://" + url.slice("webcal://".length);
  try {
    const u = new URL(url);
    if (u.protocol !== "https:" && u.protocol !== "http:") return null;
    return u.toString();
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const owner = await requireOwner(req);
  if (!owner) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: true, connected: false });
  }
  const { data } = await getSupabase()
    .from("client_calendar_accounts")
    .select("external_account_id, status, last_synced_at, last_error")
    .eq("client_slug", SLUG)
    .eq("provider", PROVIDER)
    .maybeSingle();
  if (!data) {
    return NextResponse.json({ ok: true, connected: false });
  }
  return NextResponse.json({
    ok: true,
    connected: data.status === "active",
    url: data.external_account_id,
    status: data.status,
    lastSyncedAt: data.last_synced_at,
    lastError: data.last_error,
  });
}

export async function POST(req: NextRequest) {
  const owner = await requireOwner(req);
  if (!owner) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { ok: false, error: "db not configured" },
      { status: 500 },
    );
  }
  const body = (await req.json().catch(() => null)) as { url?: string } | null;
  const url = body?.url ? normalizeUrl(body.url) : null;
  if (!url) {
    return NextResponse.json(
      { ok: false, error: "Invalid URL — paste your Apple Calendar share URL (webcal:// or https://...ics)" },
      { status: 400 },
    );
  }

  // Verify the feed is reachable + parses to >= 0 events. We don't
  // require any events (an empty calendar is valid), but the request
  // must return a body that LOOKS like iCalendar (BEGIN:VCALENDAR).
  let verified = false;
  let firstError: string | null = null;
  try {
    const res = await fetch(url, {
      headers: { Accept: "text/calendar, text/plain" },
      next: { revalidate: 0 },
    });
    if (!res.ok) {
      firstError = `Feed returned HTTP ${res.status}`;
    } else {
      const sample = (await res.text()).slice(0, 1024);
      if (sample.includes("BEGIN:VCALENDAR")) {
        verified = true;
      } else {
        firstError = "URL did not return iCalendar data — make sure you copied the public share URL, not the iCloud sharing page";
      }
    }
  } catch (err) {
    firstError = err instanceof Error ? err.message : String(err);
  }

  // Try a parse-and-count to surface "found N upcoming events" feedback.
  let eventCount = 0;
  if (verified) {
    const now = new Date().toISOString();
    const horizon = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString();
    const busy = await fetchIcalBusyWindows(url, now, horizon);
    eventCount = busy.length;
  }

  if (!verified) {
    return NextResponse.json(
      { ok: false, error: firstError ?? "Could not verify calendar feed" },
      { status: 400 },
    );
  }

  // Upsert (one ical row per slug)
  const sb = getSupabase();
  const { error: upsertErr } = await sb
    .from("client_calendar_accounts")
    .upsert(
      {
        client_slug: SLUG,
        provider: PROVIDER,
        external_account_id: url,
        external_account_email: owner.email ?? null,
        status: "active",
        last_synced_at: new Date().toISOString(),
        last_error: null,
        consecutive_failures: 0,
        scopes: [],
      },
      { onConflict: "client_slug,provider" },
    );
  if (upsertErr) {
    return NextResponse.json(
      { ok: false, error: upsertErr.message },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    connected: true,
    url,
    eventCount,
    message:
      eventCount > 0
        ? `Connected — ${eventCount} upcoming event${eventCount === 1 ? "" : "s"} will block matching booking slots.`
        : "Connected — no upcoming events yet, booking page will reflect new ones automatically.",
  });
}

export async function DELETE(req: NextRequest) {
  const owner = await requireOwner(req);
  if (!owner) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: true });
  }
  await getSupabase()
    .from("client_calendar_accounts")
    .delete()
    .eq("client_slug", SLUG)
    .eq("provider", PROVIDER);
  return NextResponse.json({ ok: true, connected: false });
}
