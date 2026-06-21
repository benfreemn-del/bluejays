import { NextRequest, NextResponse } from "next/server";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import {
  applyInventoryForOrder,
  recomputeCustomerRollups,
} from "@/lib/client-shop";
import { verifyWebhookSignature } from "@/lib/square";

/**
 * POST /api/clients/kr-ranches/square-webhook
 *
 * Public — no owner auth. Verified instead by Square's HMAC signature.
 * Handles payment.created / payment.updated events: when a payment COMPLETES,
 * flip the matching order to paid, decrement inventory, and recompute the
 * customer rollups. Idempotent — re-deliveries of an already-paid order no-op.
 *
 * Always returns 200 for any successfully-parsed webhook (so Square doesn't
 * retry-storm) EXCEPT a hard 401 on signature failure when a key is set.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SLUG = "kr-ranches";
const NOTIFICATION_URL =
  "https://bluejayportfolio.com/api/clients/kr-ranches/square-webhook";

export async function POST(req: NextRequest) {
  // Read the raw body for signature verification (must be the exact bytes).
  const raw = await req.text();
  const sig = req.headers.get("x-square-hmacsha256-signature");
  const keyConfigured = !!process.env.SQUARE_WEBHOOK_SIGNATURE_KEY;

  // Signature gate. If a key is configured and verification fails → 401.
  // If no key is configured, accept in a degraded mode so dev works.
  if (keyConfigured) {
    if (!verifyWebhookSignature(sig, raw, NOTIFICATION_URL)) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }
  } else {
    console.warn(
      "[kr-square-webhook] SQUARE_WEBHOOK_SIGNATURE_KEY not set — accepting unverified webhook (degraded mode)",
    );
  }

  let body: {
    type?: string;
    data?: { object?: { payment?: Record<string, unknown> } };
  };
  try {
    body = JSON.parse(raw);
  } catch {
    // Malformed — don't make Square retry forever.
    return NextResponse.json({ ok: false }, { status: 200 });
  }

  try {
    const type = body.type;
    if (type !== "payment.created" && type !== "payment.updated") {
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    const payment = body.data?.object?.payment as
      | {
          id?: string;
          status?: string;
          order_id?: string;
        }
      | undefined;

    if (
      !payment ||
      payment.status !== "COMPLETED" ||
      !payment.order_id ||
      !isSupabaseConfigured()
    ) {
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    const supa = getSupabase();

    // Find the order by Square order id, scoped to this client.
    const { data: order } = await supa
      .from("client_orders")
      .select("id, status, payment_status, customer_id")
      .eq("square_order_id", payment.order_id)
      .eq("client_slug", SLUG)
      .maybeSingle();

    if (!order) {
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    // Idempotent — already paid, do nothing further.
    if (order.payment_status === "paid") {
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    // Flip to paid. Bump "new" → "confirmed"; leave any other status as-is.
    await supa
      .from("client_orders")
      .update({
        payment_status: "paid",
        payment_method: "square",
        square_payment_id: payment.id ?? null,
        status: order.status === "new" ? "confirmed" : order.status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", order.id);

    // Decrement inventory for the order's tracked items.
    const { data: orderItems } = await supa
      .from("client_order_items")
      .select("menu_item_id, quantity")
      .eq("order_id", order.id);

    if (orderItems && orderItems.length > 0) {
      await applyInventoryForOrder(
        SLUG,
        orderItems.map((i) => ({
          menu_item_id: i.menu_item_id,
          quantity: i.quantity,
        })),
      );
    }

    // Refresh denormalized customer rollups (lifetime spend, counts, dates).
    await recomputeCustomerRollups(order.customer_id);

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("[kr-square-webhook] processing error:", err);
    // Successfully parsed but failed mid-processing — return 200 to avoid a
    // retry storm; the order remains recoverable by the owner.
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
