import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

/**
 * Phase 1 demand-capture endpoint for the multi-ESP integration feature.
 *
 * POST — record a "I want this provider" click from a per-client portal.
 *        Body: { client_slug, provider }. Upserts on (client_slug, provider)
 *        and increments request_count so re-clicks register as a demand
 *        signal (not a no-op).
 *
 * GET — fetch the list of providers a given client has already requested.
 *       Query: ?slug=<client_slug>. Used by the EspConnectSection on
 *       mount so previously-requested cards render in the "✓ Requested"
 *       state.
 *
 * Auth: covered by /api middleware (admin-password cookie) — the per-
 * client portal pages already gate access, so the slug in the body
 * matches the gated slug at the page level. No cross-tenant leak path.
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const VALID_PROVIDERS = new Set([
  "mailchimp",
  "klaviyo",
  "convertkit",
  "activecampaign",
  "hubspot",
]);

export async function POST(req: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { ok: false, error: "Supabase not configured" },
      { status: 500 },
    );
  }

  let body: { client_slug?: unknown; provider?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON" },
      { status: 400 },
    );
  }

  const client_slug =
    typeof body.client_slug === "string" ? body.client_slug.trim() : "";
  const provider =
    typeof body.provider === "string" ? body.provider.trim().toLowerCase() : "";

  if (!client_slug) {
    return NextResponse.json(
      { ok: false, error: "client_slug required" },
      { status: 400 },
    );
  }
  if (!VALID_PROVIDERS.has(provider)) {
    return NextResponse.json(
      {
        ok: false,
        error: `invalid provider — must be one of: ${[...VALID_PROVIDERS].join(", ")}`,
      },
      { status: 400 },
    );
  }

  // Upsert — increment request_count if the (client, provider) pair
  // already exists. Avoids dedup work in the dashboard view; a hot
  // request signal is visible as a high count, not a row duplicate.
  const { data: existing } = await supabase
    .from("client_esp_interest")
    .select("id, request_count")
    .eq("client_slug", client_slug)
    .eq("provider", provider)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("client_esp_interest")
      .update({
        request_count: (existing.request_count ?? 1) + 1,
        requested_at: new Date().toISOString(),
      })
      .eq("id", existing.id);
    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 },
      );
    }
  } else {
    const { error } = await supabase
      .from("client_esp_interest")
      .insert({ client_slug, provider });
    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({ ok: true });
}

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");
  if (!slug) {
    return NextResponse.json(
      { ok: false, error: "slug required" },
      { status: 400 },
    );
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: true, requested: [] });
  }

  const { data, error } = await supabase
    .from("client_esp_interest")
    .select("provider, request_count, requested_at")
    .eq("client_slug", slug);

  if (error) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, requested: data || [] });
}
