import { NextRequest, NextResponse } from "next/server";
import { CLIENT_PORTAL_COOKIE, ownerFromCookie } from "@/lib/client-auth";
import { getClientShopify, getShopifyMetrics } from "@/lib/client-shopify";

/**
 * GET /api/client-portal/shopify
 * Returns Shopify connection status + cached metrics for the logged-in
 * owner's client. If not connected yet, returns { connected: false }
 * and the portal renders a "Connect Your Store" placeholder card.
 *
 * Note: actual OAuth flow is wired in a separate sprint when a client
 * is ready to flip Shopify on.
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const cookie = req.cookies.get(CLIENT_PORTAL_COOKIE)?.value;
  const owner = await ownerFromCookie(cookie);
  if (!owner) {
    return NextResponse.json({ ok: false, error: "Not signed in" }, { status: 401 });
  }
  try {
    const conn = await getClientShopify(owner.client_slug);
    const { connected, metrics, cached_at } = await getShopifyMetrics(owner.client_slug);
    return NextResponse.json({
      ok: true,
      connected,
      status: conn?.status ?? "pending",
      store_url: conn?.store_url ?? null,
      metrics,
      cached_at,
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "unknown" },
      { status: 500 },
    );
  }
}
