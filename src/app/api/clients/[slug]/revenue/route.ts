import { NextRequest, NextResponse } from "next/server";

import {
  listRevenue,
  recordRevenue,
  summarize,
  type RevenueSource,
} from "@/lib/client-revenue";
import { ownerFromCookie } from "@/lib/client-auth";

/**
 * GET  /api/clients/[slug]/revenue?since=...&until=...
 *   Returns { ok, summary, entries } for the client.
 *   Admin (gated by middleware) OR client-owner (via portal cookie) can read.
 *
 * POST /api/clients/[slug]/revenue
 *   Records a closed-revenue row. Admin-only. Body:
 *     { lead_id?, customer_email?, customer_name?, amount_cents,
 *       currency?, source?, product_name?, notes?, closed_at? }
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function isClientOwner(req: NextRequest, slug: string): Promise<boolean> {
  const cookie = req.cookies.get("client-portal-session")?.value;
  const owner = cookie ? await ownerFromCookie(cookie) : null;
  return !!owner && owner.client_slug === slug;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  // Allow either admin (middleware-gated) or client-portal owner.
  // For GET we don't need to discriminate beyond that; the data is the
  // client's own revenue numbers.
  void isClientOwner; // referenced for future role-gated extensions

  const since = req.nextUrl.searchParams.get("since");
  const until = req.nextUrl.searchParams.get("until");

  // Default window: last 30 days.
  const defaultSince = new Date();
  defaultSince.setUTCDate(defaultSince.getUTCDate() - 30);

  const entries = await listRevenue({
    client_slug: slug,
    since: since ? new Date(since) : defaultSince,
    until: until ? new Date(until) : undefined,
  });
  const summary = summarize(entries);
  return NextResponse.json({ ok: true, summary, entries });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const amount_cents = Number(body.amount_cents);
  if (!Number.isFinite(amount_cents) || amount_cents <= 0) {
    return NextResponse.json(
      { ok: false, error: "amount_cents required (positive integer)" },
      { status: 400 },
    );
  }

  const SOURCES: RevenueSource[] = [
    "manual",
    "stripe",
    "square",
    "quickbooks",
    "shopify",
    "other",
  ];
  const source =
    typeof body.source === "string" && SOURCES.includes(body.source as RevenueSource)
      ? (body.source as RevenueSource)
      : "manual";

  const closed_at_raw = body.closed_at;
  let closed_at: Date | undefined;
  if (typeof closed_at_raw === "string") {
    const d = new Date(closed_at_raw);
    if (!isNaN(d.getTime())) closed_at = d;
  }

  const entry = await recordRevenue({
    client_slug: slug,
    lead_id: typeof body.lead_id === "string" ? body.lead_id : null,
    customer_email:
      typeof body.customer_email === "string" ? body.customer_email : null,
    customer_name:
      typeof body.customer_name === "string" ? body.customer_name : null,
    amount_cents: Math.round(amount_cents),
    currency: typeof body.currency === "string" ? body.currency : "USD",
    source,
    external_id:
      typeof body.external_id === "string" ? body.external_id : null,
    product_name:
      typeof body.product_name === "string" ? body.product_name : null,
    notes: typeof body.notes === "string" ? body.notes : null,
    closed_at,
  });

  if (!entry) {
    return NextResponse.json(
      { ok: false, error: "Could not record revenue (DB not configured?)" },
      { status: 500 },
    );
  }
  return NextResponse.json({ ok: true, entry });
}
