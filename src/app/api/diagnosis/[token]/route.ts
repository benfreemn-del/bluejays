import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import {
  computeDerivedMetrics,
  type MetricInputs,
} from "@/lib/diagnosis/metrics-calc";
import type {
  DiagnosisEstimateSource,
  DiagnosisMetricKey,
  DiagnosisMetricsRow,
} from "@/lib/types";

/**
 * Public-facing route for the client magic-link completion view at
 * /diagnosis/[token]. URL-as-secret pattern (CLAUDE.md auth model).
 *
 * GET   /api/diagnosis/[token]              → load row by token (returns safe subset)
 * PATCH /api/diagnosis/[token]  { ...inputs } → update inputs, recompute derived
 *
 * Security guards:
 *  · Token must match diagnosis_metrics.magic_token exactly
 *  · Token must not be expired (magic_token_expires_at >= now())
 *  · Response omits internal fields (qualifier_answers stay; magic_token
 *    is echoed back; prospect_id is omitted — the client doesn't need
 *    to know the internal UUID)
 *  · PATCH only updates the metric inputs + estimates + qualifier_answers
 *    + client_last_opened_at. Cannot mutate prospect_id, industry (set
 *    by admin), or magic_token.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TOKEN_RE = /^[A-Za-z0-9_-]{20,64}$/;
const SUPABASE_TABLE = "diagnosis_metrics";

const VALID_ESTIMATE_SOURCES: DiagnosisEstimateSource[] = [
  "user_entered",
  "industry_default",
  "derived",
  "auto_computed",
];

const METRIC_KEYS: DiagnosisMetricKey[] = [
  "monthly_revenue",
  "active_customers",
  "average_order_value",
  "gross_margin_pct",
  "churn_monthly_pct",
  "customer_acquisition_cost",
];

// ──────────────────────────── helpers ────────────────────────────

function safeRowForClient(row: DiagnosisMetricsRow) {
  // Strip prospect_id + magic_token (already in URL) for client response
  return {
    industry: row.industry,
    monthly_revenue: row.monthly_revenue,
    active_customers: row.active_customers,
    average_order_value: row.average_order_value,
    gross_margin_pct: row.gross_margin_pct,
    churn_monthly_pct: row.churn_monthly_pct,
    customer_acquisition_cost: row.customer_acquisition_cost,
    estimates: row.estimates,
    qualifier_answers: row.qualifier_answers,
    derived: row.derived,
    client_completed_at: row.client_completed_at,
  };
}

function toNum(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = typeof v === "number" ? v : parseFloat(String(v));
  return Number.isFinite(n) ? n : null;
}

function toIntOrNull(v: unknown): number | null {
  const n = toNum(v);
  if (n === null) return null;
  return Math.round(n);
}

function clampPercent(v: number | null): number | null {
  if (v === null) return null;
  return Math.max(0, Math.min(100, v));
}

async function findByToken(token: string) {
  const supabase = getSupabase();
  if (!supabase) return { error: "not_configured" as const };

  const { data, error } = await supabase
    .from(SUPABASE_TABLE)
    .select("*")
    .eq("magic_token", token)
    .maybeSingle();

  if (error) {
    console.error("[diagnosis token lookup]", error);
    return { error: "db_error" as const };
  }
  if (!data) return { error: "not_found" as const };

  const expiresAt = data.magic_token_expires_at
    ? new Date(data.magic_token_expires_at).getTime()
    : null;
  if (expiresAt !== null && expiresAt < Date.now()) {
    return { error: "expired" as const };
  }

  return { row: data as DiagnosisMetricsRow, supabase };
}

// ──────────────────────────── GET ────────────────────────────

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ token: string }> },
) {
  const { token } = await ctx.params;
  if (!TOKEN_RE.test(token)) {
    return NextResponse.json(
      { ok: false, error: "Invalid token shape" },
      { status: 400 },
    );
  }

  const result = await findByToken(token);
  if ("error" in result) {
    const status =
      result.error === "expired"
        ? 410
        : result.error === "not_found"
          ? 404
          : 500;
    return NextResponse.json(
      { ok: false, error: result.error },
      { status },
    );
  }

  // Mark "last opened" so admin can see if client opened the link
  // (fire-and-forget — we don't want to block the response on this update)
  void (async () => {
    try {
      await result.supabase
        .from(SUPABASE_TABLE)
        .update({ client_last_opened_at: new Date().toISOString() })
        .eq("id", result.row.id);
    } catch {
      // intentionally swallowed — non-critical
    }
  })();

  return NextResponse.json({ ok: true, row: safeRowForClient(result.row) });
}

// ──────────────────────────── PATCH ────────────────────────────

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ token: string }> },
) {
  const { token } = await ctx.params;
  if (!TOKEN_RE.test(token)) {
    return NextResponse.json(
      { ok: false, error: "Invalid token shape" },
      { status: 400 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON" },
      { status: 400 },
    );
  }

  const result = await findByToken(token);
  if ("error" in result) {
    const status =
      result.error === "expired"
        ? 410
        : result.error === "not_found"
          ? 404
          : 500;
    return NextResponse.json(
      { ok: false, error: result.error },
      { status },
    );
  }

  const row = result.row;
  const supabase = result.supabase;

  // Merge: start from existing inputs, overlay only sent fields
  const inputs: MetricInputs = {
    monthly_revenue:
      "monthly_revenue" in body
        ? toNum(body.monthly_revenue)
        : row.monthly_revenue,
    active_customers:
      "active_customers" in body
        ? toIntOrNull(body.active_customers)
        : row.active_customers,
    average_order_value:
      "average_order_value" in body
        ? toNum(body.average_order_value)
        : row.average_order_value,
    gross_margin_pct:
      "gross_margin_pct" in body
        ? clampPercent(toNum(body.gross_margin_pct))
        : row.gross_margin_pct,
    churn_monthly_pct:
      "churn_monthly_pct" in body
        ? clampPercent(toNum(body.churn_monthly_pct))
        : row.churn_monthly_pct,
    customer_acquisition_cost:
      "customer_acquisition_cost" in body
        ? toNum(body.customer_acquisition_cost)
        : row.customer_acquisition_cost,
  };

  // Merge estimates (validate each)
  const incomingEstimates =
    (body.estimates as Partial<Record<DiagnosisMetricKey, DiagnosisEstimateSource>>) ?? {};
  const mergedEstimates = { ...row.estimates };
  for (const [k, v] of Object.entries(incomingEstimates)) {
    if (!METRIC_KEYS.includes(k as DiagnosisMetricKey)) continue;
    if (!v || !VALID_ESTIMATE_SOURCES.includes(v)) continue;
    mergedEstimates[k as DiagnosisMetricKey] = v;
  }

  // Merge qualifier_answers (shallow merge — keys we know are numeric)
  const incomingAnswers =
    (body.qualifier_answers as Record<string, number | null>) ?? {};
  const mergedAnswers = { ...row.qualifier_answers };
  for (const [k, v] of Object.entries(incomingAnswers)) {
    mergedAnswers[k] = v === null ? null : toNum(v);
  }

  const derived = computeDerivedMetrics(inputs);

  // Mark complete if client explicitly says they're done
  const completedAt =
    body.action === "mark_complete" ? new Date().toISOString() : undefined;

  const { data, error } = await supabase
    .from(SUPABASE_TABLE)
    .update({
      ...inputs,
      estimates: mergedEstimates,
      qualifier_answers: mergedAnswers,
      derived,
      ...(completedAt ? { client_completed_at: completedAt } : {}),
    })
    .eq("id", row.id)
    .select("*")
    .single();

  if (error) {
    console.error("[diagnosis PATCH]", error);
    return NextResponse.json(
      { ok: false, error: "Database write failed" },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    row: safeRowForClient(data as DiagnosisMetricsRow),
  });
}
