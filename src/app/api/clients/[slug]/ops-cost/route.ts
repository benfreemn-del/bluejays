import { NextRequest, NextResponse } from "next/server";
import { ownerFromCookie } from "@/lib/client-auth";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

/**
 * GET /api/clients/[slug]/ops-cost
 *
 * Per-tenant view of BlueJays' actual ops-cost-to-serve over the last
 * 30 days. Sums every system_costs row tagged with this client_slug
 * (Twilio SMS, SendGrid email, Google Places scout, etc.).
 *
 * Auth: client-portal cookie scoped to slug. Each owner only sees
 * their own ops cost — never another tenant's, never global. The
 * Budget tab uses this to render a "your BlueJays ops cost" card next
 * to the owner's self-tracked budget items.
 *
 * Strategic item from audit follow-up: cost attribution rollout
 * phase 2 — the data is being captured by phase 1; this endpoint
 * surfaces it back to the owner.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface OpsCostRow {
  service: string;
  cost_usd: number;
  created_at: string;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const cookie = req.cookies.get("client-portal-session")?.value;
  const owner = cookie ? await ownerFromCookie(cookie) : null;
  if (!owner || owner.client_slug !== slug) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      ok: true,
      thirtyDayUsd: 0,
      byService: {} as Record<string, number>,
      rowCount: 0,
      hasData: false,
    });
  }

  const since = new Date();
  since.setDate(since.getDate() - 30);

  const { data, error } = await getSupabase()
    .from("system_costs")
    .select("service, cost_usd, created_at")
    .eq("client_slug", slug)
    .eq("status", "success")
    .gte("created_at", since.toISOString())
    .limit(50000);

  if (error) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 },
    );
  }

  const rows = (data ?? []) as OpsCostRow[];
  const byService: Record<string, number> = {};
  let total = 0;
  for (const r of rows) {
    const cost = Number(r.cost_usd) || 0;
    total += cost;
    byService[r.service] = (byService[r.service] || 0) + cost;
  }

  return NextResponse.json({
    ok: true,
    thirtyDayUsd: Math.round(total * 100) / 100,
    byService: Object.fromEntries(
      Object.entries(byService).map(([k, v]) => [k, Math.round(v * 100) / 100]),
    ),
    rowCount: rows.length,
    hasData: rows.length > 0,
  });
}
