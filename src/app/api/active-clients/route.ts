import { NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

/**
 * GET /api/active-clients
 *
 * Returns the list of client_owners slugs + display names so the
 * sales LeadPicker can filter ACTIVE CLIENTS out of Madie's call
 * pool (so she doesn't accidentally cold-call Luke at Olympic
 * Inspections or Philip at Zenith).
 *
 * Owner-auth gated by middleware. Cheap query, no caching needed.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: true, clients: [] });
  }
  const { data, error } = await supabase
    .from("client_owners")
    .select("client_slug, name, email")
    .order("client_slug", { ascending: true });
  if (error) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 },
    );
  }
  return NextResponse.json({
    ok: true,
    clients: (data ?? []).map((r) => ({
      slug: r.client_slug,
      name: r.name,
      email: r.email,
    })),
  });
}
