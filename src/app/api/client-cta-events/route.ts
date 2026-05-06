import { NextRequest, NextResponse } from "next/server";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/client-cta-events
 *   Body: { client_slug, experiment_id, variant_id, event ('impression' | 'click'),
 *           session_id, url? }
 *
 * GET  /api/client-cta-events?client=<slug>&experiment=<id>
 *   Returns aggregated counts per variant for the requested experiment.
 */

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: true, mock: true });
  }
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
  const slug = String(body.client_slug || "").trim();
  const experiment = String(body.experiment_id || "").trim();
  const variant = String(body.variant_id || "").trim();
  const event = String(body.event || "").trim();
  const session = String(body.session_id || "").trim();
  if (!slug || !experiment || !variant || !event || !session) {
    return NextResponse.json(
      { ok: false, error: "Missing required field" },
      { status: 400 },
    );
  }
  if (event !== "impression" && event !== "click") {
    return NextResponse.json(
      { ok: false, error: "event must be 'impression' or 'click'" },
      { status: 400 },
    );
  }
  try {
    await getSupabase()
      .from("client_cta_events")
      .insert([
        {
          client_slug: slug,
          experiment_id: experiment,
          variant_id: variant,
          event,
          session_id: session,
          url: (body.url as string) || null,
        },
      ]);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "unknown" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const slug = (url.searchParams.get("client") || "").trim();
  const experiment = (url.searchParams.get("experiment") || "").trim();
  if (!slug || !experiment) {
    return NextResponse.json(
      { ok: false, error: "Missing ?client= or ?experiment=" },
      { status: 400 },
    );
  }
  try {
    const { data, error } = await getSupabase()
      .from("client_cta_events")
      .select("variant_id, event")
      .eq("client_slug", slug)
      .eq("experiment_id", experiment);
    if (error) throw new Error(error.message);
    const totals: Record<
      string,
      { impressions: number; clicks: number }
    > = {};
    for (const r of (data ?? []) as { variant_id: string; event: string }[]) {
      if (!totals[r.variant_id]) totals[r.variant_id] = { impressions: 0, clicks: 0 };
      if (r.event === "impression") totals[r.variant_id]!.impressions += 1;
      if (r.event === "click") totals[r.variant_id]!.clicks += 1;
    }
    return NextResponse.json({ ok: true, totals });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "unknown" },
      { status: 500 },
    );
  }
}
