import { NextRequest, NextResponse } from "next/server";
import { ownerFromCookie } from "@/lib/client-auth";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import {
  type Order,
  type OrderItem,
  type OrderStatus,
  type PaymentStatus,
  type Fulfillment,
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  FULFILLMENTS,
  seasonOf,
  recomputeCustomerRollups,
} from "@/lib/client-shop";

/**
 * Owner-authed single-order ops for KR Ranches.
 *
 * GET    → order + its line items
 * PATCH  → update editable fields; optionally REPLACE line items
 * DELETE → delete order (items cascade) + recompute customer rollups
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SLUG = "kr-ranches";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function requireOwner(req: NextRequest) {
  const cookie = req.cookies.get("client-portal-session")?.value;
  if (!cookie) return null;
  const owner = await ownerFromCookie(cookie);
  if (!owner || owner.client_slug !== SLUG) return null;
  return owner;
}

type IncomingItem = {
  menu_item_id?: string | null;
  name?: string;
  unit_price_cents?: number;
  unit_label?: string | null;
  quantity?: number;
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const owner = await requireOwner(req);
  if (!owner) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  if (!UUID_RE.test(id)) {
    return NextResponse.json({ ok: false, error: "invalid_id" }, { status: 400 });
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  const supa = getSupabase();
  const { data: orderRow, error } = await supa
    .from("client_orders")
    .select("*")
    .eq("id", id)
    .eq("client_slug", SLUG)
    .maybeSingle();

  if (error) {
    console.error("[kr-ranches/orders/[id] GET] error:", error.message);
    return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
  }
  if (!orderRow) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  const { data: itemRows, error: itemsError } = await supa
    .from("client_order_items")
    .select("*")
    .eq("order_id", id)
    .order("created_at", { ascending: true });

  if (itemsError) {
    console.error("[kr-ranches/orders/[id] GET] items error:", itemsError.message);
    return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
  }

  const order: Order = {
    ...(orderRow as unknown as Order),
    items: (itemRows ?? []) as unknown as OrderItem[],
  };
  return NextResponse.json({ ok: true, order });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const owner = await requireOwner(req);
  if (!owner) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  if (!UUID_RE.test(id)) {
    return NextResponse.json({ ok: false, error: "invalid_id" }, { status: 400 });
  }

  let body: {
    status?: string;
    payment_status?: string;
    fulfillment?: string;
    payment_method?: string | null;
    notes?: string | null;
    ordered_at?: string;
    customer_name?: string | null;
    customer_phone?: string | null;
    customer_email?: string | null;
    customer_id?: string | null;
    items?: IncomingItem[];
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  if (body.status !== undefined && !ORDER_STATUSES.includes(body.status as OrderStatus)) {
    return NextResponse.json({ ok: false, error: "invalid_status" }, { status: 400 });
  }
  if (
    body.payment_status !== undefined &&
    !PAYMENT_STATUSES.includes(body.payment_status as PaymentStatus)
  ) {
    return NextResponse.json({ ok: false, error: "invalid_payment_status" }, { status: 400 });
  }
  if (
    body.fulfillment !== undefined &&
    !FULFILLMENTS.includes(body.fulfillment as Fulfillment)
  ) {
    return NextResponse.json({ ok: false, error: "invalid_fulfillment" }, { status: 400 });
  }
  if (body.customer_id && !UUID_RE.test(body.customer_id)) {
    return NextResponse.json({ ok: false, error: "invalid_id" }, { status: 400 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: true, mock: true });
  }

  const supa = getSupabase();

  // Fetch the order first (need customer_id for rollups + ownership check).
  const { data: existing, error: fetchError } = await supa
    .from("client_orders")
    .select("id, customer_id")
    .eq("id", id)
    .eq("client_slug", SLUG)
    .maybeSingle();
  if (fetchError) {
    console.error("[kr-ranches/orders/[id] PATCH] fetch error:", fetchError.message);
    return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
  }
  if (!existing) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (body.status !== undefined) update.status = body.status;
  if (body.payment_status !== undefined) update.payment_status = body.payment_status;
  if (body.fulfillment !== undefined) update.fulfillment = body.fulfillment;
  if (body.payment_method !== undefined)
    update.payment_method = body.payment_method ? String(body.payment_method).trim() : null;
  if (body.notes !== undefined) update.notes = body.notes ? String(body.notes).trim() : null;
  if (body.customer_name !== undefined)
    update.customer_name = body.customer_name ? String(body.customer_name).trim() : null;
  if (body.customer_phone !== undefined)
    update.customer_phone = body.customer_phone ? String(body.customer_phone).trim() : null;
  if (body.customer_email !== undefined)
    update.customer_email = body.customer_email ? String(body.customer_email).trim() : null;
  if (body.customer_id !== undefined) update.customer_id = body.customer_id || null;
  if (body.ordered_at !== undefined && !Number.isNaN(Date.parse(body.ordered_at))) {
    update.ordered_at = body.ordered_at;
    update.season = seasonOf(body.ordered_at);
  }

  // If items array present, REPLACE line items + recompute totals.
  if (Array.isArray(body.items)) {
    const items = body.items.map((it) => {
      const unitPrice = Math.round(Number(it.unit_price_cents) || 0);
      const quantity = Number(it.quantity) || 0;
      return {
        order_id: id,
        menu_item_id: it.menu_item_id && UUID_RE.test(it.menu_item_id) ? it.menu_item_id : null,
        name: (it.name || "").trim(),
        unit_price_cents: unitPrice,
        unit_label: it.unit_label ? String(it.unit_label).trim() : null,
        quantity,
        line_total_cents: Math.round(unitPrice * quantity),
      };
    });

    const { error: delError } = await supa
      .from("client_order_items")
      .delete()
      .eq("order_id", id);
    if (delError) {
      console.error("[kr-ranches/orders/[id] PATCH] delete items error:", delError.message);
      return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
    }

    if (items.length > 0) {
      const { error: insError } = await supa.from("client_order_items").insert(items);
      if (insError) {
        console.error("[kr-ranches/orders/[id] PATCH] insert items error:", insError.message);
        return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
      }
    }

    const subtotalCents = items.reduce((s, it) => s + it.line_total_cents, 0);
    update.subtotal_cents = subtotalCents;
    update.total_cents = subtotalCents;
  }

  const { error: updateError } = await supa
    .from("client_orders")
    .update(update)
    .eq("id", id)
    .eq("client_slug", SLUG);
  if (updateError) {
    console.error("[kr-ranches/orders/[id] PATCH] update error:", updateError.message);
    return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
  }

  // Recompute rollups for the order's customer. If customer_id changed,
  // recompute both old and new so spend/order counts stay correct.
  const oldCustomerId = (existing as { customer_id: string | null }).customer_id;
  const newCustomerId =
    body.customer_id !== undefined ? body.customer_id || null : oldCustomerId;
  await recomputeCustomerRollups(newCustomerId);
  if (oldCustomerId && oldCustomerId !== newCustomerId) {
    await recomputeCustomerRollups(oldCustomerId);
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const owner = await requireOwner(req);
  if (!owner) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  if (!UUID_RE.test(id)) {
    return NextResponse.json({ ok: false, error: "invalid_id" }, { status: 400 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: true, mock: true });
  }

  const supa = getSupabase();

  // Fetch customer_id first so we can recompute rollups after delete.
  const { data: existing, error: fetchError } = await supa
    .from("client_orders")
    .select("customer_id")
    .eq("id", id)
    .eq("client_slug", SLUG)
    .maybeSingle();
  if (fetchError) {
    console.error("[kr-ranches/orders/[id] DELETE] fetch error:", fetchError.message);
    return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
  }
  if (!existing) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  const { error: delError } = await supa
    .from("client_orders")
    .delete()
    .eq("id", id)
    .eq("client_slug", SLUG);
  if (delError) {
    console.error("[kr-ranches/orders/[id] DELETE] delete error:", delError.message);
    return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
  }

  await recomputeCustomerRollups((existing as { customer_id: string | null }).customer_id);

  return NextResponse.json({ ok: true });
}
