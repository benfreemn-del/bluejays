/**
 * client-budget — read/write helpers for the owner portal Budget tab.
 *
 * Surfaces per-client investment / cost line items. Owners can add
 * custom rows; Ben-seeded rows show up alongside.
 *
 * Monthly total math: one-time items count once in their month;
 * recurring items count every month from charge_date to (ended_on or
 * forever). The portal shows last-12-months trend + current MRR.
 */

import { getSupabase } from "./supabase";

export type BudgetCategory =
  | "site"
  | "ai-system"
  | "ad-spend"
  | "communication"
  | "tools"
  | "marketing"
  | "other"
  | (string & {});

export type BudgetItem = {
  id: string;
  client_slug: string;
  label: string;
  description: string | null;
  amount_cents: number;
  recurring_monthly: boolean;
  charge_date: string;
  ended_on: string | null;
  category: BudgetCategory;
  vendor: string | null;
  created_by_owner_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export async function listBudgetItems(clientSlug: string): Promise<BudgetItem[]> {
  const { data, error } = await getSupabase()
    .from("client_budget_items")
    .select("*")
    .eq("client_slug", clientSlug)
    .order("charge_date", { ascending: false });
  if (error) throw new Error(`listBudgetItems: ${error.message}`);
  return (data ?? []) as BudgetItem[];
}

export async function createBudgetItem(args: {
  clientSlug: string;
  ownerId: string | null;
  patch: Partial<
    Pick<
      BudgetItem,
      | "label"
      | "description"
      | "amount_cents"
      | "recurring_monthly"
      | "charge_date"
      | "ended_on"
      | "category"
      | "vendor"
      | "notes"
    >
  >;
}): Promise<BudgetItem> {
  if (!args.patch.label || typeof args.patch.amount_cents !== "number") {
    throw new Error("label + amount_cents required");
  }
  const { data, error } = await getSupabase()
    .from("client_budget_items")
    .insert([
      {
        client_slug: args.clientSlug,
        created_by_owner_id: args.ownerId,
        ...args.patch,
      },
    ])
    .select("*")
    .single();
  if (error) throw new Error(`createBudgetItem: ${error.message}`);
  return data as BudgetItem;
}

export async function updateBudgetItem(args: {
  id: string;
  clientSlug: string;
  patch: Partial<BudgetItem>;
}): Promise<BudgetItem> {
  // Tenant guard — re-verify the row belongs to this client.
  const { data: existing } = await getSupabase()
    .from("client_budget_items")
    .select("id, client_slug")
    .eq("id", args.id)
    .maybeSingle();
  if (!existing || existing.client_slug !== args.clientSlug) {
    throw new Error("Item not found in your account");
  }
  // Whitelist mutable fields.
  const patch: Record<string, unknown> = {};
  for (const k of [
    "label",
    "description",
    "amount_cents",
    "recurring_monthly",
    "charge_date",
    "ended_on",
    "category",
    "vendor",
    "notes",
  ] as const) {
    if (k in args.patch) patch[k] = args.patch[k];
  }
  const { data, error } = await getSupabase()
    .from("client_budget_items")
    .update(patch)
    .eq("id", args.id)
    .select("*")
    .single();
  if (error) throw new Error(`updateBudgetItem: ${error.message}`);
  return data as BudgetItem;
}

export async function deleteBudgetItem(args: {
  id: string;
  clientSlug: string;
}): Promise<void> {
  const { data: existing } = await getSupabase()
    .from("client_budget_items")
    .select("id, client_slug")
    .eq("id", args.id)
    .maybeSingle();
  if (!existing || existing.client_slug !== args.clientSlug) {
    throw new Error("Item not found in your account");
  }
  const { error } = await getSupabase()
    .from("client_budget_items")
    .delete()
    .eq("id", args.id);
  if (error) throw new Error(`deleteBudgetItem: ${error.message}`);
}

/**
 * Compute summary stats: this-month total, current monthly recurring,
 * last-12-months total, breakdown by category.
 */
export type BudgetSummary = {
  thisMonthCents: number;
  monthlyRecurringCents: number;
  last12MonthsCents: number;
  byCategoryCents: Record<string, number>;
  itemCount: number;
};

export function computeBudgetSummary(items: BudgetItem[]): BudgetSummary {
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const twelveMonthsAgo = new Date(now.getFullYear() - 1, now.getMonth(), 1);

  let thisMonthCents = 0;
  let monthlyRecurringCents = 0;
  let last12MonthsCents = 0;
  const byCategoryCents: Record<string, number> = {};

  for (const it of items) {
    const charge = new Date(it.charge_date);
    const ended = it.ended_on ? new Date(it.ended_on) : null;
    const cat = it.category || "other";

    if (it.recurring_monthly) {
      // Active recurring → counts toward monthly + this month + last 12.
      const isActive = !ended || ended >= now;
      if (isActive) {
        monthlyRecurringCents += it.amount_cents;
        thisMonthCents += it.amount_cents;
      }
      // Last 12 months: count one charge per month it was active.
      const start = charge > twelveMonthsAgo ? charge : twelveMonthsAgo;
      const end = ended && ended < now ? ended : now;
      const months = Math.max(
        0,
        (end.getFullYear() - start.getFullYear()) * 12 +
          (end.getMonth() - start.getMonth()) +
          1,
      );
      last12MonthsCents += it.amount_cents * months;
      byCategoryCents[cat] =
        (byCategoryCents[cat] ?? 0) + it.amount_cents * months;
    } else {
      // One-time → counts in its month only.
      if (charge >= thisMonthStart) thisMonthCents += it.amount_cents;
      if (charge >= twelveMonthsAgo) last12MonthsCents += it.amount_cents;
      byCategoryCents[cat] = (byCategoryCents[cat] ?? 0) + it.amount_cents;
    }
  }

  return {
    thisMonthCents,
    monthlyRecurringCents,
    last12MonthsCents,
    byCategoryCents,
    itemCount: items.length,
  };
}
