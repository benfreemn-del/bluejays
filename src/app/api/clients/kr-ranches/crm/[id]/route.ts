import { NextRequest, NextResponse } from "next/server";
import { ownerFromCookie } from "@/lib/client-auth";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { type Customer, type Order, type OrderItem } from "@/lib/client-shop";

/**
 * Owner-authed single-customer ops for KR Ranches.
 *
 * GET    → customer + their orders (each with line items), newest first
 * PATCH  → update name/phone/email/address/tags/notes
 * DELETE → delete customer (orders.customer_id auto-nulls via FK)
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
  const { data: customerRow, error } = await supa
    .from("client_customers")
    .select("*")
    .eq("id", id)
    .eq("client_slug", SLUG)
    .maybeSingle();

  if (error) {
    console.error("[kr-ranches/crm/[id] GET] error:", error.message);
    return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
  }
  if (!customerRow) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  const { data: orderRows, error: ordersError } = await supa
    .from("client_orders")
    .select("*")
    .eq("client_slug", SLUG)
    .eq("customer_id", id)
    .order("ordered_at", { ascending: false });

  if (ordersError) {
    console.error("[kr-ranches/crm/[id] GET] orders error:", ordersError.message);
    return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
  }

  const orders = (orderRows ?? []) as unknown as Order[];

  // Attach line items per order.
  if (orders.length > 0) {
    const orderIds = orders.map((o) => o.id);
    const { data: itemRows, error: itemsError } = await supa
      .from("client_order_items")
      .select("*")
      .in("order_id", orderIds)
      .order("created_at", { ascending: true });
    if (itemsError) {
      console.error("[kr-ranches/crm/[id] GET] items error:", itemsError.message);
      return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
    }
    const itemsByOrder = new Map<string, OrderItem[]>();
    for (const it of (itemRows ?? []) as unknown as OrderItem[]) {
      const arr = itemsByOrder.get(it.order_id) ?? [];
      arr.push(it);
      itemsByOrder.set(it.order_id, arr);
    }
    for (const o of orders) {
      o.items = itemsByOrder.get(o.id) ?? [];
    }
  }

  return NextResponse.json({
    ok: true,
    customer: customerRow as unknown as Customer,
    orders,
  });
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
    name?: string;
    phone?: string | null;
    email?: string | null;
    address?: string | null;
    tags?: string[];
    notes?: string | null;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: true, mock: true });
  }

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (body.name !== undefined) update.name = String(body.name).trim();
  if (body.phone !== undefined) update.phone = body.phone ? String(body.phone).trim() || null : null;
  if (body.email !== undefined)
    update.email = body.email ? String(body.email).trim().toLowerCase() || null : null;
  if (body.address !== undefined)
    update.address = body.address ? String(body.address).trim() || null : null;
  if (body.notes !== undefined) update.notes = body.notes ? String(body.notes).trim() : null;
  if (Array.isArray(body.tags)) {
    update.tags = body.tags
      .filter((t): t is string => typeof t === "string")
      .map((t) => t.trim())
      .filter(Boolean);
  }

  const { error } = await getSupabase()
    .from("client_customers")
    .update(update)
    .eq("id", id)
    .eq("client_slug", SLUG);

  if (error) {
    console.error("[kr-ranches/crm/[id] PATCH] error:", error.message);
    return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
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

  const { error } = await getSupabase()
    .from("client_customers")
    .delete()
    .eq("id", id)
    .eq("client_slug", SLUG);

  if (error) {
    console.error("[kr-ranches/crm/[id] DELETE] error:", error.message);
    return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
