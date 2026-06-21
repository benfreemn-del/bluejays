import { NextRequest, NextResponse } from "next/server";
import { ownerFromCookie } from "@/lib/client-auth";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { type Order, type OrderItem, seasonOf } from "@/lib/client-shop";

/**
 * Owner-authed dashboard stats for KR Ranches. Aggregates non-cancelled
 * orders + their items + customers into totals, per-season + per-month
 * revenue, top items, and top customers.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SLUG = "kr-ranches";

const SEASONS = ["spring", "summer", "fall", "winter"] as const;
type Season = (typeof SEASONS)[number];

async function requireOwner(req: NextRequest) {
  const cookie = req.cookies.get("client-portal-session")?.value;
  if (!cookie) return null;
  const owner = await ownerFromCookie(cookie);
  if (!owner || owner.client_slug !== SLUG) return null;
  return owner;
}

function emptyShape() {
  return {
    ok: true as const,
    totals: {
      orders: 0,
      revenue_cents: 0,
      customers: 0,
      unpaid_count: 0,
      unpaid_cents: 0,
      new_count: 0,
      ready_count: 0,
    },
    bySeason: SEASONS.map((season) => ({ season, orders: 0, revenue_cents: 0 })),
    byMonth: lastTwelveMonths().map((month) => ({ month, orders: 0, revenue_cents: 0 })),
    topItems: [] as { name: string; qty: number; revenue_cents: number }[],
    topCustomers: [] as {
      id: string;
      name: string;
      total_spent_cents: number;
      order_count: number;
    }[],
  };
}

/** Last 12 calendar months as "YYYY-MM", oldest → newest (incl. current). */
function lastTwelveMonths(): string[] {
  const out: string[] = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    out.push(`${yyyy}-${mm}`);
  }
  return out;
}

export async function GET(req: NextRequest) {
  const owner = await requireOwner(req);
  if (!owner) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json(emptyShape());
  }

  const supa = getSupabase();

  // All non-cancelled orders for the slug.
  const { data: orderRows, error: ordersError } = await supa
    .from("client_orders")
    .select("*")
    .eq("client_slug", SLUG)
    .neq("status", "cancelled");
  if (ordersError) {
    console.error("[kr-ranches/stats GET] orders error:", ordersError.message);
    return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
  }
  const orders = (orderRows ?? []) as unknown as Order[];

  // Items for those orders (for topItems).
  let items: OrderItem[] = [];
  if (orders.length > 0) {
    const orderIds = orders.map((o) => o.id);
    const { data: itemRows, error: itemsError } = await supa
      .from("client_order_items")
      .select("*")
      .in("order_id", orderIds);
    if (itemsError) {
      console.error("[kr-ranches/stats GET] items error:", itemsError.message);
      return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
    }
    items = (itemRows ?? []) as unknown as OrderItem[];
  }

  // Customer count.
  const { count: customerCount, error: custError } = await supa
    .from("client_customers")
    .select("*", { count: "exact", head: true })
    .eq("client_slug", SLUG);
  if (custError) {
    console.error("[kr-ranches/stats GET] customers count error:", custError.message);
    return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
  }

  // Top customers by lifetime spend.
  const { data: topCustomerRows, error: topCustError } = await supa
    .from("client_customers")
    .select("id, name, total_spent_cents, order_count")
    .eq("client_slug", SLUG)
    .order("total_spent_cents", { ascending: false })
    .limit(8);
  if (topCustError) {
    console.error("[kr-ranches/stats GET] top customers error:", topCustError.message);
    return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
  }

  /* ── Aggregate in JS ── */

  const isRevenue = (o: Order) => o.payment_status === "paid" || o.payment_status === "deposit";

  let revenueCents = 0;
  let unpaidCount = 0;
  let unpaidCents = 0;
  let newCount = 0;
  let readyCount = 0;

  const seasonAgg: Record<Season, { orders: number; revenue_cents: number }> = {
    spring: { orders: 0, revenue_cents: 0 },
    summer: { orders: 0, revenue_cents: 0 },
    fall: { orders: 0, revenue_cents: 0 },
    winter: { orders: 0, revenue_cents: 0 },
  };

  const monthAgg = new Map<string, { orders: number; revenue_cents: number }>();
  for (const m of lastTwelveMonths()) monthAgg.set(m, { orders: 0, revenue_cents: 0 });

  for (const o of orders) {
    const rev = isRevenue(o) ? o.total_cents || 0 : 0;
    revenueCents += rev;

    if (o.payment_status === "unpaid") {
      unpaidCount += 1;
      unpaidCents += o.total_cents || 0;
    }
    if (o.status === "new") newCount += 1;
    if (o.status === "ready") readyCount += 1;

    // Season bucket.
    const season = (
      o.season && (SEASONS as readonly string[]).includes(o.season)
        ? o.season
        : seasonOf(o.ordered_at)
    ) as Season;
    seasonAgg[season].orders += 1;
    seasonAgg[season].revenue_cents += rev;

    // Month bucket (YYYY-MM from ordered_at). Only count within the window.
    if (o.ordered_at) {
      const month = o.ordered_at.slice(0, 7);
      const bucket = monthAgg.get(month);
      if (bucket) {
        bucket.orders += 1;
        bucket.revenue_cents += rev;
      }
    }
  }

  // Top items by revenue (summed across all order items).
  const itemAgg = new Map<string, { name: string; qty: number; revenue_cents: number }>();
  for (const it of items) {
    const key = it.name;
    const existing = itemAgg.get(key) ?? { name: it.name, qty: 0, revenue_cents: 0 };
    existing.qty += it.quantity || 0;
    existing.revenue_cents += it.line_total_cents || 0;
    itemAgg.set(key, existing);
  }
  const topItems = Array.from(itemAgg.values())
    .sort((a, b) => b.revenue_cents - a.revenue_cents)
    .slice(0, 8);

  const bySeason = SEASONS.map((season) => ({
    season,
    orders: seasonAgg[season].orders,
    revenue_cents: seasonAgg[season].revenue_cents,
  }));

  const byMonth = lastTwelveMonths().map((month) => {
    const b = monthAgg.get(month)!;
    return { month, orders: b.orders, revenue_cents: b.revenue_cents };
  });

  const topCustomers = (
    (topCustomerRows ?? []) as {
      id: string;
      name: string;
      total_spent_cents: number;
      order_count: number;
    }[]
  ).map((c) => ({
    id: c.id,
    name: c.name,
    total_spent_cents: c.total_spent_cents || 0,
    order_count: c.order_count || 0,
  }));

  return NextResponse.json({
    ok: true,
    totals: {
      orders: orders.length,
      revenue_cents: revenueCents,
      customers: customerCount ?? 0,
      unpaid_count: unpaidCount,
      unpaid_cents: unpaidCents,
      new_count: newCount,
      ready_count: readyCount,
    },
    bySeason,
    byMonth,
    topItems,
    topCustomers,
  });
}
