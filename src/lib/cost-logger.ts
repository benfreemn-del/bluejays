/**
 * Cost Logger — Logs real API costs to the Supabase `system_costs` table.
 *
 * Every billable API action (Google Places, Twilio, SendGrid, site generation)
 * should call logCost() after a successful response. This replaces the old
 * estimate-based cost tracking with actual per-action cost records.
 *
 * Table schema (create in Supabase):
 *   system_costs (
 *     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *     created_at TIMESTAMPTZ DEFAULT NOW(),
 *     prospect_id UUID REFERENCES prospects(id) ON DELETE SET NULL,
 *     batch_id UUID REFERENCES batches(id) ON DELETE SET NULL,
 *     service TEXT NOT NULL,
 *     action TEXT NOT NULL,
 *     cost_usd NUMERIC(10,6) NOT NULL,
 *     status TEXT DEFAULT 'success',
 *     metadata JSONB
 *   )
 */

import { supabase, isSupabaseConfigured } from "./supabase";

/** Known cost rates per service action */
export const COST_RATES = {
  // Google APIs
  google_places_detail: 0.017,
  google_places_photo: 0.007,
  google_places_search: 0.032,
  // Twilio
  twilio_sms: 0.0079,
  twilio_voice: 0.015,
  // SendGrid
  sendgrid_email: 0.0006,
  // Manus / AI site generation (template engine)
  site_generation: 0.003,
  manus_site_generation: 0.003,
  // OpenAI GPT-4.1-mini (~$0.40/1M input + $1.60/1M output)
  openai_sales_response: 0.003,      // ~1K input + 1K output tokens
  openai_proposal_generation: 0.004, // ~1K input + 2.2K output tokens
  // Anthropic Claude Sonnet (~$3/1M input + $15/1M output)
  claude_sales_response: 0.003,      // ~1K input + 1K output tokens
  // Perplexity Sonar (~$5/1M tokens)
  perplexity_research: 0.005,        // ~1K tokens per query
  perplexity_pitch: 0.005,
  // Domain registrar (per .com/yr — Namecheap retail; varies by TLD)
  domain_registration: 11.00,
  domain_renewal: 11.00,
} as const;

export type CostService = keyof typeof COST_RATES;

export interface LogCostParams {
  prospectId?: string;
  batchId?: string;
  service: string;
  action: string;
  costUsd: number;
  status?: "success" | "failed";
  metadata?: Record<string, unknown>;
}

/**
 * Log a single cost event to the system_costs table.
 * Fails silently if Supabase is not configured — cost logging should
 * never break the primary operation.
 */
export async function logCost(params: LogCostParams): Promise<void> {
  if (!isSupabaseConfigured()) {
    console.log(
      `  [Cost] ${params.service}/${params.action}: $${params.costUsd.toFixed(6)} (not logged — Supabase not configured)`
    );
    return;
  }

  try {
    const { error } = await supabase.from("system_costs").insert({
      prospect_id: params.prospectId || null,
      batch_id: params.batchId || null,
      service: params.service,
      action: params.action,
      cost_usd: params.costUsd,
      status: params.status ?? "success",
      metadata: params.metadata ?? {},
    });

    if (error) {
      console.error(`  [Cost] Failed to log cost: ${error.message}`);
    }
  } catch (err) {
    // Never let cost logging break the main flow
    console.error(`  [Cost] Error logging cost: ${(err as Error).message}`);
  }
}

/**
 * Query cost data from system_costs for the spending dashboard.
 * Returns aggregated cost data by time period and service.
 */
export async function getCostData(): Promise<{
  today: { total: number; byService: Record<string, number> };
  thisWeek: { total: number; byService: Record<string, number> };
  thisMonth: { total: number; byService: Record<string, number> };
  perLeadAverage: number;
  topCostLeads: Array<{ prospectId: string; businessName: string; totalCost: number }>;
  projectedMonthly: number;
}> {
  const defaultResult = {
    today: { total: 0, byService: {} },
    thisWeek: { total: 0, byService: {} },
    thisMonth: { total: 0, byService: {} },
    perLeadAverage: 0,
    topCostLeads: [],
    projectedMonthly: 0,
  };

  if (!isSupabaseConfigured()) {
    return defaultResult;
  }

  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay()).toISOString();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    // Fetch all costs for this month (covers today, week, and month)
    const { data: monthlyCosts, error: monthlyError } = await supabase
      .from("system_costs")
      .select("service, cost_usd, created_at, prospect_id")
      .gte("created_at", monthStart)
      .eq("status", "success");

    if (monthlyError || !monthlyCosts) return defaultResult;

    // Aggregate by time period
    const today = { total: 0, byService: {} as Record<string, number> };
    const thisWeek = { total: 0, byService: {} as Record<string, number> };
    const thisMonth = { total: 0, byService: {} as Record<string, number> };
    const prospectCosts: Record<string, number> = {};

    for (const row of monthlyCosts) {
      const cost = Number(row.cost_usd);
      const createdAt = row.created_at as string;

      // Monthly
      thisMonth.total += cost;
      thisMonth.byService[row.service] = (thisMonth.byService[row.service] || 0) + cost;

      // Weekly
      if (createdAt >= weekStart) {
        thisWeek.total += cost;
        thisWeek.byService[row.service] = (thisWeek.byService[row.service] || 0) + cost;
      }

      // Daily
      if (createdAt >= todayStart) {
        today.total += cost;
        today.byService[row.service] = (today.byService[row.service] || 0) + cost;
      }

      // Per-prospect accumulation
      if (row.prospect_id) {
        prospectCosts[row.prospect_id] = (prospectCosts[row.prospect_id] || 0) + cost;
      }
    }

    // Calculate per-lead average
    const uniqueProspects = Object.keys(prospectCosts).length;
    const perLeadAverage = uniqueProspects > 0 ? thisMonth.total / uniqueProspects : 0;

    // Get top cost leads (top 10)
    const sortedProspects = Object.entries(prospectCosts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);

    // Fetch business names for top cost leads
    const topCostLeads: Array<{ prospectId: string; businessName: string; totalCost: number }> = [];
    for (const [prospectId, totalCost] of sortedProspects) {
      const { data: prospect } = await supabase
        .from("prospects")
        .select("business_name")
        .eq("id", prospectId)
        .single();
      topCostLeads.push({
        prospectId,
        businessName: prospect?.business_name || "Unknown",
        totalCost: Math.round(totalCost * 1000) / 1000,
      });
    }

    // Project monthly cost based on daily average
    const daysElapsed = Math.max(1, now.getDate());
    const dailyAverage = thisMonth.total / daysElapsed;
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const projectedMonthly = Math.round(dailyAverage * daysInMonth * 100) / 100;

    return {
      today: { total: Math.round(today.total * 100) / 100, byService: today.byService },
      thisWeek: { total: Math.round(thisWeek.total * 100) / 100, byService: thisWeek.byService },
      thisMonth: { total: Math.round(thisMonth.total * 100) / 100, byService: thisMonth.byService },
      perLeadAverage: Math.round(perLeadAverage * 1000) / 1000,
      topCostLeads,
      projectedMonthly,
    };
  } catch (err) {
    console.error(`  [Cost] Error fetching cost data: ${(err as Error).message}`);
    return defaultResult;
  }
}
