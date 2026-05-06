import { NextRequest, NextResponse } from "next/server";
import {
  createFunnelCost,
  listFunnelCosts,
  sumCostsByAudience,
} from "@/lib/client-funnel-costs";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET  /api/client-funnel-costs?client=<slug>[&group=audience]
 *      → list rows, OR sum-by-audience map when ?group=audience
 *
 * POST /api/client-funnel-costs
 *      Body: { client_slug, cost_cents, audience_segment?, period_label?, notes? }
 */

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const slug = (url.searchParams.get("client") || "").trim();
  const group = url.searchParams.get("group");
  if (!slug) {
    return NextResponse.json(
      { ok: false, error: "Missing ?client=<slug>" },
      { status: 400 },
    );
  }
  try {
    if (group === "audience") {
      const totals = await sumCostsByAudience(slug);
      return NextResponse.json({ ok: true, totals });
    }
    const costs = await listFunnelCosts(slug);
    return NextResponse.json({ ok: true, costs });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "unknown" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
  const slug = String(body.client_slug || "").trim();
  const cost = body.cost_cents;
  if (!slug || typeof cost !== "number") {
    return NextResponse.json(
      { ok: false, error: "client_slug and cost_cents are required" },
      { status: 400 },
    );
  }
  try {
    const created = await createFunnelCost({
      client_slug: slug,
      cost_cents: cost,
      audience_segment: (body.audience_segment as string) || null,
      period_label: (body.period_label as string) || null,
      notes: (body.notes as string) || null,
    });
    return NextResponse.json({ ok: true, cost: created });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "unknown" },
      { status: 500 },
    );
  }
}
