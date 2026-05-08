import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

/**
 * /api/clients/[slug]/hyperloop-history
 *
 * Read-only history of every Hyperloop A/B decision for a client. The
 * data backs HyperloopTransparency.tsx — the portal-side glass-box
 * view that shows clients exactly which ad variants won, which got
 * killed, and which are still being tested.
 *
 * Returns three buckets pulled from client_ad_creatives:
 *   live    — currently running variants (status = 'live')
 *   winners — promoted variants (status = 'live' AND impressions > 100,
 *             OR status = 'archived' but reached 'live' before)
 *   killed  — variants the engine cut (status = 'killed')
 *
 * Black box → glass box. Renewal-stickiness move per the deep-dive
 * review: month-13 client looks at this and remembers what they're
 * paying for.
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;

  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      ok: true,
      live: [],
      winners: [],
      killed: [],
      note: "Supabase not configured (dev/CI)",
    });
  }

  // Pull every creative for this slug — small enough to filter
  // in-memory rather than two separate queries.
  const { data, error } = await supabase
    .from("client_ad_creatives")
    .select(
      "id, audience, platform, ad_set, variant_label, headline, body, cta, status, impressions, clicks, conversions, spend_cents, last_synced_at, updated_at",
    )
    .eq("client_slug", slug)
    .order("updated_at", { ascending: false })
    .limit(200);

  if (error) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 },
    );
  }

  type Row = {
    id: string;
    audience: string;
    platform: string;
    ad_set: string | null;
    variant_label: string | null;
    headline: string;
    body: string;
    cta: string | null;
    status: string;
    impressions: number | null;
    clicks: number | null;
    conversions: number | null;
    spend_cents: number | null;
    last_synced_at: string | null;
    updated_at: string;
  };

  const rows = (data ?? []) as Row[];

  // CTR helper for sorting "best so far"
  const ctr = (r: Row) =>
    r.impressions && r.impressions > 0
      ? (r.clicks ?? 0) / r.impressions
      : 0;

  const live = rows.filter((r) => r.status === "live");
  // Winners = live variants with statistically meaningful traffic, OR
  // archived (promoted then retired) with strong CTR.
  const winners = [...live]
    .filter((r) => (r.impressions ?? 0) >= 100)
    .sort((a, b) => ctr(b) - ctr(a))
    .slice(0, 5);
  const killed = rows.filter((r) => r.status === "killed").slice(0, 10);

  return NextResponse.json({
    ok: true,
    live: live.slice(0, 8),
    winners,
    killed,
    counts: {
      live: live.length,
      winners: winners.length,
      killed: killed.length,
      total: rows.length,
    },
  });
}
