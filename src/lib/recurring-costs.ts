/**
 * Recurring Costs — fixed monthly infrastructure subscriptions.
 *
 * Complements `cost-logger.ts` (per-action variable costs in `system_costs`)
 * by tracking the FIXED side of the spend equation: Supabase Pro,
 * Vercel Pro, SendGrid plans, etc. Together they let the spending
 * dashboard surface:
 *
 *   Total monthly burn  = recurring + variable
 *   Per-site cost       = burn / paid customers
 *   Margin at $100/yr   = ($100 / 12) - per-site cost   (on the deferred sub)
 *
 * Schema: see supabase/migrations/20260424_recurring_costs.sql
 *
 * Mock-mode safe: every read/write that touches Supabase short-circuits
 * to a sane default when Supabase isn't configured (local dev, CI).
 */

import { supabase, isSupabaseConfigured } from "./supabase";
import { getCostData } from "./cost-logger";
import { getAllProspects } from "./store";

export type RecurringCostCategory =
  | "database"
  | "hosting"
  | "email"
  | "sms"
  | "tools"
  | "other"
  | string; // free-text for forward compat

export interface RecurringCost {
  id: string;
  service: string;
  displayName: string;
  category: RecurringCostCategory;
  monthlyCostUsd: number;
  active: boolean;
  startedOn: string; // ISO date
  endedOn: string | null;
  notes: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

interface RecurringCostDbRow {
  id: string;
  service: string;
  display_name: string;
  category: string;
  monthly_cost_usd: string | number;
  active: boolean;
  started_on: string;
  ended_on: string | null;
  notes: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

function rowToRecurringCost(row: RecurringCostDbRow): RecurringCost {
  return {
    id: row.id,
    service: row.service,
    displayName: row.display_name,
    category: row.category,
    monthlyCostUsd: Number(row.monthly_cost_usd),
    active: row.active,
    startedOn: row.started_on,
    endedOn: row.ended_on,
    notes: row.notes,
    metadata: row.metadata || {},
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ---------------------------------------------------------------------------
// CRUD
// ---------------------------------------------------------------------------

export interface AddRecurringCostInput {
  service: string;
  displayName: string;
  category: RecurringCostCategory;
  monthlyCostUsd: number;
  notes?: string;
  metadata?: Record<string, unknown>;
  startedOn?: string | Date;
}

export async function addRecurringCost(input: AddRecurringCostInput): Promise<RecurringCost> {
  if (!isSupabaseConfigured()) {
    // Mock-mode: synthesize a row so callers don't crash in dev.
    const now = new Date().toISOString();
    return {
      id: "mock-" + input.service,
      service: input.service,
      displayName: input.displayName,
      category: input.category,
      monthlyCostUsd: input.monthlyCostUsd,
      active: true,
      startedOn: typeof input.startedOn === "string"
        ? input.startedOn
        : (input.startedOn instanceof Date ? input.startedOn.toISOString().slice(0, 10) : now.slice(0, 10)),
      endedOn: null,
      notes: input.notes ?? null,
      metadata: input.metadata ?? {},
      createdAt: now,
      updatedAt: now,
    };
  }

  const startedOn = input.startedOn instanceof Date
    ? input.startedOn.toISOString().slice(0, 10)
    : (input.startedOn ?? new Date().toISOString().slice(0, 10));

  const payload = {
    service: input.service,
    display_name: input.displayName,
    category: input.category,
    monthly_cost_usd: input.monthlyCostUsd,
    notes: input.notes ?? null,
    metadata: input.metadata ?? {},
    started_on: startedOn,
    active: true,
  };

  const { data, error } = await supabase
    .from("recurring_costs")
    .insert(payload)
    .select("*")
    .single();
  if (error) throw error;
  return rowToRecurringCost(data as RecurringCostDbRow);
}

export interface UpdateRecurringCostPatch {
  monthlyCostUsd?: number;
  notes?: string | null;
  metadata?: Record<string, unknown>;
  active?: boolean;
  displayName?: string;
  category?: RecurringCostCategory;
}

export async function updateRecurringCost(
  service: string,
  patch: UpdateRecurringCostPatch
): Promise<void> {
  if (!isSupabaseConfigured()) return;

  const update: Record<string, unknown> = {};
  if (patch.monthlyCostUsd !== undefined) update.monthly_cost_usd = patch.monthlyCostUsd;
  if (patch.notes !== undefined) update.notes = patch.notes;
  if (patch.metadata !== undefined) update.metadata = patch.metadata;
  if (patch.active !== undefined) update.active = patch.active;
  if (patch.displayName !== undefined) update.display_name = patch.displayName;
  if (patch.category !== undefined) update.category = patch.category;

  if (Object.keys(update).length === 0) return;

  const { error } = await supabase
    .from("recurring_costs")
    .update(update)
    .eq("service", service);
  if (error) throw error;
}

export async function endRecurringCost(service: string, endedOn?: Date): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const isoDate = (endedOn ?? new Date()).toISOString().slice(0, 10);
  const { error } = await supabase
    .from("recurring_costs")
    .update({
      active: false,
      ended_on: isoDate,
    })
    .eq("service", service);
  if (error) throw error;
}

export async function getActiveRecurringCosts(): Promise<RecurringCost[]> {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await supabase
    .from("recurring_costs")
    .select("*")
    .eq("active", true)
    .order("monthly_cost_usd", { ascending: false });
  if (error) {
    console.error(`  [RecurringCosts] Failed to fetch active rows: ${error.message}`);
    return [];
  }
  return (data || []).map((r) => rowToRecurringCost(r as RecurringCostDbRow));
}

export async function getAllRecurringCosts(): Promise<RecurringCost[]> {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await supabase
    .from("recurring_costs")
    .select("*")
    .order("active", { ascending: false })
    .order("monthly_cost_usd", { ascending: false });
  if (error) {
    console.error(`  [RecurringCosts] Failed to fetch all rows: ${error.message}`);
    return [];
  }
  return (data || []).map((r) => rowToRecurringCost(r as RecurringCostDbRow));
}

// ---------------------------------------------------------------------------
// Aggregates / projections
// ---------------------------------------------------------------------------

export interface MonthlyRecurringTotal {
  total: number;
  byCategory: Record<string, number>;
}

export async function getMonthlyRecurringTotal(): Promise<MonthlyRecurringTotal> {
  const rows = await getActiveRecurringCosts();
  const byCategory: Record<string, number> = {};
  let total = 0;
  for (const r of rows) {
    total += r.monthlyCostUsd;
    byCategory[r.category] = (byCategory[r.category] || 0) + r.monthlyCostUsd;
  }
  return {
    total: Math.round(total * 100) / 100,
    byCategory: Object.fromEntries(
      Object.entries(byCategory).map(([k, v]) => [k, Math.round(v * 100) / 100])
    ),
  };
}

export interface ProjectedMonthlyBurn {
  recurring: number;
  variablePerSite: number;
  variableTotal: number;
  total: number;
  perSiteCost: number;
  marginAtFullPrice: number; // monthly margin/site at $100/yr = $8.33/mo per site
  siteCount: number;
  paidCustomersToday: number;
  variableSampleDays: number;
  notes: string[];
}

/**
 * Project monthly burn at a target site count.
 *
 * Math:
 *   recurring    = sum of active recurring_costs.monthly_cost_usd
 *   variablePerSite = (sum of system_costs over last 30 days) / current paid customer count
 *                     If no paid customers yet, fall back to (sum / total prospects) so the
 *                     number isn't divide-by-zero.
 *   variableTotal = variablePerSite * siteCount
 *   total         = recurring + variableTotal
 *   perSiteCost   = total / siteCount
 *   margin        = ($100 / 12) - perSiteCost     (monthly margin per site on the
 *                                                  deferred $100/yr management sub)
 *
 * The result is a snapshot — change recurring rows or shift variable
 * spend and re-call. Mock-mode safe.
 */
export async function getProjectedMonthlyBurn(siteCount: number): Promise<ProjectedMonthlyBurn> {
  const safeSiteCount = Math.max(1, Math.round(siteCount));
  const notes: string[] = [];

  // 1) Recurring side.
  const { total: recurring } = await getMonthlyRecurringTotal();

  // 2) Variable side from system_costs over the last 30 days.
  let variableMonthlyTotal = 0;
  let variableSampleDays = 30;
  let paidCustomersToday = 0;

  try {
    const costData = await getCostData();
    // getCostData().thisMonth.total is calendar-month — close enough to a
    // 30-day moving average for projection purposes.
    variableMonthlyTotal = costData.thisMonth.total;
  } catch (err) {
    notes.push(`variable cost lookup failed: ${(err as Error).message}`);
  }

  try {
    const prospects = await getAllProspects();
    paidCustomersToday = prospects.filter((p) => p.status === "paid").length;
  } catch {
    // ignore — leave at 0
  }

  // Per-site variable: prefer paid customers; fall back to total
  // prospects so projection isn't garbage when paid count is 0 (warmup
  // phase).
  let variablePerSite = 0;
  if (variableMonthlyTotal > 0) {
    if (paidCustomersToday > 0) {
      variablePerSite = variableMonthlyTotal / paidCustomersToday;
    } else {
      const allProspects = await getAllProspects().catch(() => []);
      const denom = Math.max(1, allProspects.length);
      variablePerSite = variableMonthlyTotal / denom;
      notes.push(
        `no paid customers yet — variable/site estimated against ${denom} total prospects`
      );
    }
  } else {
    notes.push("no system_costs entries this month — variable per-site = 0");
  }

  const variableTotal = variablePerSite * safeSiteCount;
  const total = recurring + variableTotal;
  const perSiteCost = total / safeSiteCount;
  const monthlyRevenuePerSite = 100 / 12; // $8.33 — the $100/yr management sub
  const marginAtFullPrice = monthlyRevenuePerSite - perSiteCost;

  return {
    recurring: Math.round(recurring * 100) / 100,
    variablePerSite: Math.round(variablePerSite * 10000) / 10000,
    variableTotal: Math.round(variableTotal * 100) / 100,
    total: Math.round(total * 100) / 100,
    perSiteCost: Math.round(perSiteCost * 10000) / 10000,
    marginAtFullPrice: Math.round(marginAtFullPrice * 10000) / 10000,
    siteCount: safeSiteCount,
    paidCustomersToday,
    variableSampleDays,
    notes,
  };
}
