import { NextRequest, NextResponse } from "next/server";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import {
  upsertCustomerByContact,
  seasonOf,
  type Fulfillment,
} from "@/lib/client-shop";
import { isSquareConfigured, createPaymentLink } from "@/lib/square";

/**
 * POST /api/clients/kr-ranches/checkout
 *
 * Public — no owner auth, CORS enabled (the static KR site posts here from a
 * different origin). Builds a server-priced order from the KR catalog, inserts
 * an unpaid client_orders row, mints a Square hosted payment link, and returns
 * the checkout URL. The square-webhook route flips the order to paid.
 *
 * Server-side price lookup is mandatory — client-supplied prices are never
 * trusted; every line item must resolve to a buyable client_menu_items row.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SLUG = "kr-ranches";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const FULFILLMENTS: Fulfillment[] = ["pickup", "delivery", "shipped"];

type CheckoutItem = {
  menu_item_id?: string;
  name?: string;
  quantity: number;
};

type CheckoutBody = {
  items?: CheckoutItem[];
  customer?: { name?: string; phone?: string; email?: string };
  fulfillment?: string;
};

type ResolvedItem = {
  menu_item_id: string;
  name: string;
  unit_price_cents: number;
  unit_label: string | null;
  quantity: number;
  line_total_cents: number;
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function POST(req: NextRequest) {
  let body: CheckoutBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid_request" },
      { status: 400, headers: CORS },
    );
  }

  // 1. Validate shape.
  const items = Array.isArray(body.items) ? body.items : [];
  const customerName = (body.customer?.name || "").trim();
  const validItems =
    items.length > 0 &&
    items.every((it) => Number.isFinite(it.quantity) && it.quantity > 0);
  if (!validItems || !customerName) {
    return NextResponse.json(
      { ok: false, error: "invalid_request" },
      { status: 400, headers: CORS },
    );
  }

  // 2. Checkout requires Square — fall back to call/contact-form if unset.
  if (!isSquareConfigured()) {
    return NextResponse.json(
      { ok: false, error: "checkout_unavailable" },
      { status: 503, headers: CORS },
    );
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { ok: false, error: "checkout_unavailable" },
      { status: 503, headers: CORS },
    );
  }

  const supa = getSupabase();

  // 3. Server-side price lookup — every item must map to a buyable catalog row.
  const resolved: ResolvedItem[] = [];
  for (const it of items) {
    if (!it.menu_item_id) {
      return NextResponse.json(
        { ok: false, error: "invalid_request" },
        { status: 400, headers: CORS },
      );
    }
    const { data: row, error } = await supa
      .from("client_menu_items")
      .select("id, name, price_cents, unit_label, buyable")
      .eq("id", it.menu_item_id)
      .eq("client_slug", SLUG)
      .maybeSingle();

    if (error || !row || row.buyable !== true || row.price_cents == null) {
      return NextResponse.json(
        { ok: false, error: "invalid_request" },
        { status: 400, headers: CORS },
      );
    }

    const quantity = Math.floor(it.quantity);
    const unitPrice = Number(row.price_cents);
    resolved.push({
      menu_item_id: row.id,
      name: row.name,
      unit_price_cents: unitPrice,
      unit_label: row.unit_label ?? null,
      quantity,
      line_total_cents: unitPrice * quantity,
    });
  }

  // 4. Totals.
  const subtotalCents = resolved.reduce((s, r) => s + r.line_total_cents, 0);
  const totalCents = subtotalCents;

  // 5. Find-or-create customer (may be null in mock — proceed without link).
  const customer = await upsertCustomerByContact(SLUG, {
    name: customerName,
    phone: body.customer?.phone,
    email: body.customer?.email,
  });

  // 6. Insert the order row.
  const fulfillment: Fulfillment = FULFILLMENTS.includes(
    body.fulfillment as Fulfillment,
  )
    ? (body.fulfillment as Fulfillment)
    : "pickup";
  const nowIso = new Date().toISOString();

  const { data: order, error: orderErr } = await supa
    .from("client_orders")
    .insert({
      client_slug: SLUG,
      customer_id: customer?.id ?? null,
      customer_name: customerName,
      customer_phone: body.customer?.phone?.trim() || null,
      customer_email: body.customer?.email?.trim().toLowerCase() || null,
      status: "new",
      payment_status: "unpaid",
      fulfillment,
      source: "website",
      subtotal_cents: subtotalCents,
      total_cents: totalCents,
      ordered_at: nowIso,
      season: seasonOf(nowIso),
    })
    .select("id, order_number")
    .single();

  if (orderErr || !order) {
    console.error("[kr-checkout] order insert error:", orderErr?.message);
    return NextResponse.json(
      { ok: false, error: "checkout_failed" },
      { status: 502, headers: CORS },
    );
  }

  // 7. Insert resolved line items.
  const { error: itemsErr } = await supa.from("client_order_items").insert(
    resolved.map((r) => ({
      order_id: order.id,
      menu_item_id: r.menu_item_id,
      name: r.name,
      unit_price_cents: r.unit_price_cents,
      unit_label: r.unit_label,
      quantity: r.quantity,
      line_total_cents: r.line_total_cents,
    })),
  );
  if (itemsErr) {
    console.error("[kr-checkout] order items insert error:", itemsErr.message);
    // Order row already exists so the owner sees the attempt — continue.
  }

  // 8. Redirect URL for the Square thank-you bounce.
  const redirectUrl = `https://bluejayportfolio.com/sites/kr-ranches/thank-you.html?order=${order.order_number}`;

  // 9. Mint the Square payment link.
  let result;
  try {
    result = await createPaymentLink({
      lineItems: resolved.map((r) => ({
        name: r.name,
        quantity: r.quantity,
        priceCents: r.unit_price_cents,
      })),
      referenceId: order.id,
      redirectUrl,
      note: "KR Ranches online order",
      buyerEmail: body.customer?.email?.trim().toLowerCase() || undefined,
    });
  } catch (err) {
    console.error("[kr-checkout] createPaymentLink failed:", err);
    // Leave the order row in place (status new / unpaid) so the owner still
    // sees the attempted order.
    return NextResponse.json(
      { ok: false, error: "checkout_failed" },
      { status: 502, headers: CORS },
    );
  }

  // 10. Link the Square ids back to the order.
  const { error: updateErr } = await supa
    .from("client_orders")
    .update({
      square_order_id: result.orderId,
      square_link_id: result.paymentLinkId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", order.id);
  if (updateErr) {
    console.error("[kr-checkout] order update error:", updateErr.message);
    // Non-fatal — webhook matches on square_order_id, so log and continue.
  }

  // 11. Return the hosted checkout URL.
  return NextResponse.json({ ok: true, url: result.url }, { headers: CORS });
}
