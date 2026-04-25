import { NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

/**
 * GET /api/loss-reasons/stats
 *
 * Powers the dashboard's LossReasonsPanel tile. Returns:
 *   {
 *     totalLast30Days: number,
 *     byCategory: { price, timing, design, have_one, no_response, other },
 *     topVerbatims: Array<{
 *       id, prospectId, prospectName, category, response, surfacedAt,
 *       actedOnAt | null, confidence
 *     }>
 *   }
 *
 * Mock-mode safe — empty arrays / zero counts when Supabase isn't configured
 * so the panel renders the "no data yet" empty state instead of crashing.
 *
 * See migration `20260424_loss_reasons.sql` and Rule 45 in CLAUDE.md.
 */

const VERBATIM_LIMIT = 10;
const WINDOW_DAYS = 30;

const EMPTY_BY_CATEGORY = {
  price: 0,
  timing: 0,
  design: 0,
  have_one: 0,
  no_response: 0,
  other: 0,
} as const;

interface LossReasonRow {
  id: string;
  prospect_id: string;
  category: string;
  raw_response: string;
  ai_classification: string | null;
  confidence: number | null;
  surfaced_at: string;
  acted_on_at: string | null;
}

interface ProspectShape {
  id: string;
  business_name: string | null;
}

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      totalLast30Days: 0,
      byCategory: { ...EMPTY_BY_CATEGORY },
      topVerbatims: [],
    });
  }

  const cutoff = new Date(Date.now() - WINDOW_DAYS * 24 * 60 * 60 * 1000).toISOString();

  // Fetch all rows from the last 30 days. At expected volume (a few hundred
  // not_interested farewells/month with low probe-response rate) this stays
  // well under PostgREST's default 1000-row cap. If we ever need more,
  // paginate per Rule 2.
  const { data: rows, error } = await supabase
    .from("loss_reasons")
    .select(
      "id, prospect_id, category, raw_response, ai_classification, confidence, surfaced_at, acted_on_at"
    )
    .gte("surfaced_at", cutoff)
    .order("surfaced_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const list = (rows as LossReasonRow[] | null) ?? [];

  // Count by category
  const byCategory: Record<string, number> = { ...EMPTY_BY_CATEGORY };
  for (const r of list) {
    if (Object.prototype.hasOwnProperty.call(byCategory, r.category)) {
      byCategory[r.category] += 1;
    } else {
      byCategory.other += 1;
    }
  }

  // Top verbatims = last 10 by surfaced_at
  const verbatimRows = list.slice(0, VERBATIM_LIMIT);
  const prospectIds = Array.from(new Set(verbatimRows.map((r) => r.prospect_id)));

  const nameById = new Map<string, string>();
  if (prospectIds.length > 0) {
    const { data: prospects } = await supabase
      .from("prospects")
      .select("id, business_name")
      .in("id", prospectIds);
    for (const p of (prospects as ProspectShape[] | null) ?? []) {
      nameById.set(p.id, p.business_name || "Unknown business");
    }
  }

  const topVerbatims = verbatimRows.map((r) => ({
    id: r.id,
    prospectId: r.prospect_id,
    prospectName: nameById.get(r.prospect_id) || "Unknown business",
    category: r.category,
    response: r.raw_response,
    surfacedAt: r.surfaced_at,
    actedOnAt: r.acted_on_at,
    confidence: r.confidence == null ? null : Number(r.confidence),
  }));

  return NextResponse.json({
    totalLast30Days: list.length,
    byCategory,
    topVerbatims,
  });
}
