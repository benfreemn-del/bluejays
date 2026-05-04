import { NextRequest, NextResponse } from "next/server";
import {
  clientMRR,
  listClientSubscriptions,
  TIERS,
  upsertSubscription,
  type SubscriptionService,
} from "@/lib/client-subscriptions";

/**
 * GET /api/client-subscriptions?client=zenith-sports
 *   List subscriptions + current MRR + the full tier menu (for the
 *   subscription panel UI).
 *
 * POST /api/client-subscriptions
 *   Body: { client_slug, service, tier, status?, managed_by? }
 *   Upsert (cancels existing active sub for the same service first).
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const client = searchParams.get("client");
  if (!client) {
    return NextResponse.json(
      { ok: false, error: "client param required" },
      { status: 400 },
    );
  }
  try {
    const [subs, mrr] = await Promise.all([
      listClientSubscriptions(client),
      clientMRR(client),
    ]);
    return NextResponse.json({
      ok: true,
      subscriptions: subs,
      mrr,
      tiers: TIERS,
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "unknown" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  let body: {
    client_slug?: string;
    service?: SubscriptionService;
    tier?: string;
    status?: "trialing" | "active" | "paused" | "cancelled" | "past_due";
    managed_by?: "bluejays" | "client";
    notes?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
  if (!body.client_slug || !body.service || !body.tier) {
    return NextResponse.json(
      { ok: false, error: "client_slug + service + tier required" },
      { status: 400 },
    );
  }
  try {
    const result = await upsertSubscription({
      client_slug: body.client_slug,
      service: body.service,
      tier: body.tier,
      status: body.status,
      managed_by: body.managed_by,
      notes: body.notes,
    });
    return NextResponse.json({ ok: true, subscription: result });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "unknown" },
      { status: 500 },
    );
  }
}
