/**
 * client-shop — shared types + helpers for the per-client commerce backend
 * (Customers CRM, Orders, Inventory). Generic + client_slug-keyed so the
 * same engine powers KR Ranches today and any future custom-tier client.
 *
 * Tables (migration 20260620_kr_ranches_orders_crm.sql):
 *   - client_customers
 *   - client_orders
 *   - client_order_items
 *   - client_menu_items (inventory columns added)
 */

import { getSupabase } from "./supabase";

/* ─────────────────────────── TYPES ─────────────────────────── */

export type OrderStatus =
  | "new"
  | "confirmed"
  | "ready"
  | "completed"
  | "cancelled";

export type PaymentStatus = "unpaid" | "deposit" | "paid" | "refunded";
export type Fulfillment = "pickup" | "delivery" | "shipped";
export type OrderSource = "manual" | "website" | "square";

export type Customer = {
  id: string;
  client_slug: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  tags: string[];
  notes: string | null;
  total_spent_cents: number;
  order_count: number;
  first_order_at: string | null;
  last_order_at: string | null;
  created_at: string;
  updated_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  menu_item_id: string | null;
  name: string;
  unit_price_cents: number;
  unit_label: string | null;
  quantity: number;
  line_total_cents: number;
  created_at: string;
};

export type Order = {
  id: string;
  client_slug: string;
  order_number: number;
  customer_id: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  customer_email: string | null;
  status: OrderStatus;
  fulfillment: Fulfillment;
  payment_status: PaymentStatus;
  payment_method: string | null;
  subtotal_cents: number;
  total_cents: number;
  notes: string | null;
  source: OrderSource;
  square_payment_id: string | null;
  square_order_id: string | null;
  square_link_id: string | null;
  ordered_at: string;
  season: string | null;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
};

export type MenuItem = {
  id: string;
  client_slug: string;
  name: string;
  price: string;
  note: string | null;
  status: "available" | "low" | "gone";
  sort_order: number;
  // inventory columns
  quantity: number | null;
  unit_label: string | null;
  low_threshold: number | null;
  price_cents: number | null;
  category: string | null;
  track_inventory: boolean | null;
  buyable: boolean | null;
  square_catalog_id: string | null;
};

/* ─────────────────────────── CONSTANTS ─────────────────────────── */

export const ORDER_STATUSES: OrderStatus[] = [
  "new",
  "confirmed",
  "ready",
  "completed",
  "cancelled",
];

export const PAYMENT_STATUSES: PaymentStatus[] = [
  "unpaid",
  "deposit",
  "paid",
  "refunded",
];

export const FULFILLMENTS: Fulfillment[] = ["pickup", "delivery", "shipped"];

export const MENU_CATEGORIES = [
  "beef",
  "pork",
  "poultry",
  "lamb",
  "eggs",
  "other",
] as const;

/* ─────────────────────────── HELPERS ─────────────────────────── */

/** Northern-hemisphere season from an ISO date string. */
export function seasonOf(iso: string | Date): "spring" | "summer" | "fall" | "winter" {
  const m = (typeof iso === "string" ? new Date(iso) : iso).getMonth(); // 0-11
  if (m <= 1 || m === 11) return "winter"; // Dec, Jan, Feb
  if (m <= 4) return "spring"; // Mar, Apr, May
  if (m <= 7) return "summer"; // Jun, Jul, Aug
  return "fall"; // Sep, Oct, Nov
}

/** "$1,234.50" from integer cents. */
export function fmtMoney(cents: number | null | undefined): string {
  const n = (cents ?? 0) / 100;
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  });
}

/** Parse a free-text price like "$22/lb" or "12.50" into integer cents (or null). */
export function priceTextToCents(text: string | null | undefined): number | null {
  if (!text) return null;
  const m = text.replace(/,/g, "").match(/(\d+(?:\.\d{1,2})?)/);
  if (!m) return null;
  return Math.round(parseFloat(m[1]) * 100);
}

/** Derive the available/low/gone status from quantity + threshold. */
export function statusFromQuantity(
  quantity: number | null | undefined,
  lowThreshold: number | null | undefined,
): "available" | "low" | "gone" {
  const q = quantity ?? 0;
  const t = lowThreshold ?? 3;
  if (q <= 0) return "gone";
  if (q <= t) return "low";
  return "available";
}

/* ─────────────────────────── DB OPS ─────────────────────────── */

/**
 * Recompute a customer's denormalized rollups (total_spent, order_count,
 * first/last order dates) from their non-cancelled orders. Call after any
 * order create/update/delete. Safe no-op if the customer doesn't exist.
 */
export async function recomputeCustomerRollups(
  customerId: string | null,
): Promise<void> {
  if (!customerId) return;
  const supa = getSupabase();
  const { data, error } = await supa
    .from("client_orders")
    .select("total_cents, ordered_at, status, payment_status")
    .eq("customer_id", customerId);
  if (error || !data) return;

  const counted = data.filter((o) => o.status !== "cancelled");
  // Lifetime spend = sum of paid/deposit orders (money actually collected-ish).
  const spent = counted
    .filter((o) => o.payment_status === "paid" || o.payment_status === "deposit")
    .reduce((s, o) => s + (o.total_cents || 0), 0);
  const dates = counted
    .map((o) => o.ordered_at)
    .filter(Boolean)
    .sort();

  await supa
    .from("client_customers")
    .update({
      total_spent_cents: spent,
      order_count: counted.length,
      first_order_at: dates[0] ?? null,
      last_order_at: dates[dates.length - 1] ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", customerId);
}

/**
 * Find-or-create a customer by phone OR email (within a slug). Used when a
 * website order or Square payment comes in without a linked customer id.
 * Updates contact fields if the matched row was missing them.
 */
export async function upsertCustomerByContact(
  clientSlug: string,
  input: { name?: string | null; phone?: string | null; email?: string | null; address?: string | null },
): Promise<Customer | null> {
  const supa = getSupabase();
  const phone = (input.phone || "").trim() || null;
  const email = (input.email || "").trim().toLowerCase() || null;
  const name = (input.name || "").trim() || "Customer";

  // Try match by email first, then phone.
  let existing: Customer | null = null;
  if (email) {
    const { data } = await supa
      .from("client_customers")
      .select("*")
      .eq("client_slug", clientSlug)
      .ilike("email", email)
      .limit(1)
      .maybeSingle();
    existing = (data as Customer) ?? null;
  }
  if (!existing && phone) {
    const { data } = await supa
      .from("client_customers")
      .select("*")
      .eq("client_slug", clientSlug)
      .eq("phone", phone)
      .limit(1)
      .maybeSingle();
    existing = (data as Customer) ?? null;
  }

  if (existing) {
    // Backfill any missing contact info.
    const patch: Record<string, unknown> = {};
    if (!existing.phone && phone) patch.phone = phone;
    if (!existing.email && email) patch.email = email;
    if (!existing.address && input.address) patch.address = input.address.trim();
    if (Object.keys(patch).length) {
      patch.updated_at = new Date().toISOString();
      await supa.from("client_customers").update(patch).eq("id", existing.id);
    }
    return existing;
  }

  const { data, error } = await supa
    .from("client_customers")
    .insert({ client_slug: clientSlug, name, phone, email, address: input.address?.trim() || null })
    .select("*")
    .single();
  if (error) return null;
  return data as Customer;
}

/**
 * Decrement inventory for an order's line items (only items linked to a
 * menu_item_id that has track_inventory=true). Auto-flips status via
 * statusFromQuantity. Best-effort; never throws.
 */
export async function applyInventoryForOrder(
  clientSlug: string,
  items: { menu_item_id: string | null; quantity: number }[],
): Promise<void> {
  const supa = getSupabase();
  for (const it of items) {
    if (!it.menu_item_id) continue;
    try {
      const { data: row } = await supa
        .from("client_menu_items")
        .select("quantity, low_threshold, track_inventory")
        .eq("id", it.menu_item_id)
        .eq("client_slug", clientSlug)
        .maybeSingle();
      if (!row || !row.track_inventory || row.quantity == null) continue;
      const nextQty = Math.max(0, Number(row.quantity) - Number(it.quantity || 0));
      await supa
        .from("client_menu_items")
        .update({
          quantity: nextQty,
          status: statusFromQuantity(nextQty, row.low_threshold),
        })
        .eq("id", it.menu_item_id);
    } catch {
      /* best-effort */
    }
  }
}
