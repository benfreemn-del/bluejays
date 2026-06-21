import { NextRequest, NextResponse } from "next/server";
import { ownerFromCookie } from "@/lib/client-auth";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import {
  type Order,
  type OrderStatus,
  type PaymentStatus,
  type Fulfillment,
  type OrderSource,
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  FULFILLMENTS,
  seasonOf,
  recomputeCustomerRollups,
  upsertCustomerByContact,
  applyInventoryForOrder,
} from "@/lib/client-shop";

/**
 * Owner-authed Orders list + create for KR Ranches.
 *
 * GET  → filtered, paginated list of orders (no line items, kept light)
 * POST → create an order + its line items, snapshot customer, update rollups
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

export async function GET(req: NextRequest) {
  const owner = await requireOwner(req);
  if (!owner) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: true, orders: [], total: 0 });
  }

  const url = new URL(req.url);
  const status = url.searchParams.get("status");
  const paymentStatus = url.searchParams.get("payment_status");
  const source = url.searchParams.get("source");
  const q = (url.searchParams.get("q") || "").trim();
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");

  const limit = Math.min(
    Math.max(parseInt(url.searchParams.get("limit") || "100", 10) || 100, 1),
    500,
  );
  const offset = Math.max(parseInt(url.searchParams.get("offset") || "0", 10) || 0, 0);

  // Build a query with the shared filters applied.
  const buildQuery = (selectArg: string, opts?: { count?: "exact"; head?: boolean }) => {
    let query = getSupabase()
      .from("client_orders")
      .select(selectArg, opts)
      .eq("client_slug", SLUG);

    if (status) query = query.eq("status", status);
    if (paymentStatus) query = query.eq("payment_status", paymentStatus);
    if (source) query = query.eq("source", source);
    if (from) query = query.gte("ordered_at", from);
    if (to) query = query.lte("ordered_at", to);
    if (q) {
      const safe = q.replace(/[%,()]/g, " ").trim();
      const ors = [
        `customer_name.ilike.%${safe}%`,
        `customer_phone.ilike.%${safe}%`,
        `customer_email.ilike.%${safe}%`,
      ];
      // order_number is a bigint — PostgREST can't ::text-cast inside .or(),
      // so match it by equality only when the query is all digits.
      const digits = safe.replace(/\D/g, "");
      if (digits) ors.push(`order_number.eq.${digits}`);
      query = query.or(ors.join(","));
    }
    return query;
  };

  // Count (with same filters) — uses head:true to avoid pulling rows.
  const { count, error: countError } = await buildQuery("*", { count: "exact", head: true });
  if (countError) {
    console.error("[kr-ranches/orders GET] count error:", countError.message);
    return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
  }

  const { data, error } = await buildQuery("*")
    .order("ordered_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error("[kr-ranches/orders GET] list error:", error.message);
    return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    orders: (data ?? []) as unknown as Order[],
    total: count ?? 0,
  });
}

export async function POST(req: NextRequest) {
  const owner = await requireOwner(req);
  if (!owner) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let body: {
    customer_id?: string | null;
    customer_name?: string;
    customer_phone?: string | null;
    customer_email?: string | null;
    status?: string;
    fulfillment?: string;
    payment_status?: string;
    payment_method?: string | null;
    notes?: string | null;
    ordered_at?: string;
    source?: string;
    items?: IncomingItem[];
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const customerName = (body.customer_name || "").trim();
  if (!customerName) {
    return NextResponse.json({ ok: false, error: "customer_name_required" }, { status: 400 });
  }

  const status = (body.status || "new") as OrderStatus;
  const fulfillment = (body.fulfillment || "pickup") as Fulfillment;
  const paymentStatus = (body.payment_status || "unpaid") as PaymentStatus;
  const source = (body.source || "manual") as OrderSource;

  if (!ORDER_STATUSES.includes(status)) {
    return NextResponse.json({ ok: false, error: "invalid_status" }, { status: 400 });
  }
  if (!PAYMENT_STATUSES.includes(paymentStatus)) {
    return NextResponse.json({ ok: false, error: "invalid_payment_status" }, { status: 400 });
  }
  if (!FULFILLMENTS.includes(fulfillment)) {
    return NextResponse.json({ ok: false, error: "invalid_fulfillment" }, { status: 400 });
  }

  if (body.customer_id && !UUID_RE.test(body.customer_id)) {
    return NextResponse.json({ ok: false, error: "invalid_id" }, { status: 400 });
  }

  const orderedAt = body.ordered_at && !Number.isNaN(Date.parse(body.ordered_at))
    ? body.ordered_at
    : new Date().toISOString();
  const season = seasonOf(orderedAt);

  // Normalize items.
  const rawItems = Array.isArray(body.items) ? body.items : [];
  const items = rawItems.map((it) => {
    const unitPrice = Math.round(Number(it.unit_price_cents) || 0);
    const quantity = Number(it.quantity) || 0;
    return {
      menu_item_id: it.menu_item_id && UUID_RE.test(it.menu_item_id) ? it.menu_item_id : null,
      name: (it.name || "").trim(),
      unit_price_cents: unitPrice,
      unit_label: it.unit_label ? String(it.unit_label).trim() : null,
      quantity,
      line_total_cents: Math.round(unitPrice * quantity),
    };
  });

  const subtotalCents = items.reduce((s, it) => s + it.line_total_cents, 0);
  const totalCents = subtotalCents;

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: true, mock: true });
  }

  const supa = getSupabase();

  // Resolve customer: explicit id wins; otherwise upsert by contact info.
  let customerId: string | null = body.customer_id ?? null;
  let snapName = customerName;
  let snapPhone = body.customer_phone ? String(body.customer_phone).trim() || null : null;
  let snapEmail = body.customer_email ? String(body.customer_email).trim() || null : null;

  if (!customerId && (snapPhone || snapEmail)) {
    const cust = await upsertCustomerByContact(SLUG, {
      name: customerName,
      phone: snapPhone,
      email: snapEmail,
    });
    if (cust) {
      customerId = cust.id;
      snapName = cust.name || customerName;
      snapPhone = cust.phone ?? snapPhone;
      snapEmail = cust.email ?? snapEmail;
    }
  }

  const { data: orderRow, error: insertError } = await supa
    .from("client_orders")
    .insert({
      client_slug: SLUG,
      customer_id: customerId,
      customer_name: snapName,
      customer_phone: snapPhone,
      customer_email: snapEmail,
      status,
      fulfillment,
      payment_status: paymentStatus,
      payment_method: body.payment_method ? String(body.payment_method).trim() : null,
      subtotal_cents: subtotalCents,
      total_cents: totalCents,
      notes: body.notes ? String(body.notes).trim() : null,
      source,
      ordered_at: orderedAt,
      season,
    })
    .select("*")
    .single();

  if (insertError || !orderRow) {
    console.error("[kr-ranches/orders POST] insert order error:", insertError?.message);
    return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
  }

  const order = orderRow as unknown as Order;

  if (items.length > 0) {
    const { error: itemsError } = await supa.from("client_order_items").insert(
      items.map((it) => ({
        order_id: order.id,
        menu_item_id: it.menu_item_id,
        name: it.name,
        unit_price_cents: it.unit_price_cents,
        unit_label: it.unit_label,
        quantity: it.quantity,
        line_total_cents: it.line_total_cents,
      })),
    );
    if (itemsError) {
      console.error("[kr-ranches/orders POST] insert items error:", itemsError.message);
      return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
    }
  }

  if (paymentStatus === "paid" || paymentStatus === "deposit") {
    await applyInventoryForOrder(
      SLUG,
      items.map((it) => ({ menu_item_id: it.menu_item_id, quantity: it.quantity })),
    );
  }

  await recomputeCustomerRollups(customerId);

  return NextResponse.json({ ok: true, order });
}
