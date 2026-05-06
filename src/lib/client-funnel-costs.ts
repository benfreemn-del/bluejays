/**
 * client-funnel-costs — DB helpers for per-funnel cost attribution.
 *
 * Each row is one cost line for one (client, audience, period). The
 * dashboard sums rows per audience to compute net = revenue - cost
 * and ROI% on the per-funnel ROI cards.
 */

import { getSupabase } from "./supabase";

export type ClientFunnelCost = {
  id: string;
  client_slug: string;
  audience_segment: string | null;
  cost_cents: number;
  period_label: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type NewClientFunnelCost = Pick<
  ClientFunnelCost,
  "client_slug" | "cost_cents"
> &
  Partial<Pick<ClientFunnelCost, "audience_segment" | "period_label" | "notes">>;

export async function listFunnelCosts(
  slug: string,
): Promise<ClientFunnelCost[]> {
  const { data, error } = await getSupabase()
    .from("client_funnel_costs")
    .select("*")
    .eq("client_slug", slug)
    .order("created_at", { ascending: false });
  if (error) throw new Error(`listFunnelCosts: ${error.message}`);
  return (data ?? []) as ClientFunnelCost[];
}

/** Sum costs grouped by audience_segment for a single client. Used by
 *  the per-funnel ROI cards on the leads dashboard. Returns a Map
 *  keyed by audience (or "" for unattributed/overhead). */
export async function sumCostsByAudience(
  slug: string,
): Promise<Record<string, number>> {
  const rows = await listFunnelCosts(slug);
  const out: Record<string, number> = {};
  for (const r of rows) {
    const k = r.audience_segment ?? "";
    out[k] = (out[k] ?? 0) + r.cost_cents;
  }
  return out;
}

export async function createFunnelCost(
  c: NewClientFunnelCost,
): Promise<ClientFunnelCost> {
  const { data, error } = await getSupabase()
    .from("client_funnel_costs")
    .insert([c])
    .select("*")
    .single();
  if (error) throw new Error(`createFunnelCost: ${error.message}`);
  return data as ClientFunnelCost;
}

export async function updateFunnelCost(
  id: string,
  patch: Partial<
    Pick<
      ClientFunnelCost,
      "cost_cents" | "audience_segment" | "period_label" | "notes"
    >
  >,
): Promise<ClientFunnelCost> {
  const { data, error } = await getSupabase()
    .from("client_funnel_costs")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw new Error(`updateFunnelCost: ${error.message}`);
  return data as ClientFunnelCost;
}

export async function deleteFunnelCost(id: string): Promise<void> {
  const { error } = await getSupabase()
    .from("client_funnel_costs")
    .delete()
    .eq("id", id);
  if (error) throw new Error(`deleteFunnelCost: ${error.message}`);
}
