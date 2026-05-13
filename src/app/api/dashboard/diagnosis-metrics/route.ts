import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getSupabase } from "@/lib/supabase";
import {
  computeDerivedMetrics,
  type MetricInputs,
} from "@/lib/diagnosis/metrics-calc";
import type {
  DiagnosisEstimateSource,
  DiagnosisIndustry,
  DiagnosisMetricKey,
  DiagnosisMetricsRow,
} from "@/lib/types";

/**
 * /api/dashboard/diagnosis-metrics
 *
 * Owner-side CRUD for the per-prospect financial profile that powers
 * the Diagnosis Tool. Sits inside /dashboard/* so middleware-gated.
 *
 * GET ?prospectId=<uuid>      → load row for that prospect (or null)
 * GET ?token=<magic_token>    → load row by magic-link token (internal)
 *
 * POST { prospect_id, ...inputs, estimates?, qualifier_answers? }
 *   → upsert row, recompute derived, return updated row
 *
 * POST + action='generate_magic_link' → mint a 7-day token + return URL
 *
 * The client-facing /diagnosis/[token] page uses a SEPARATE public API
 * route (see /api/diagnosis/[token]/route.ts) that only allows updates
 * via a valid token + only exposes safe fields.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const VALID_INDUSTRIES: DiagnosisIndustry[] = [
  "landscaping",
  "electrician",
  "contractor",
  "small_ecomm",
  "other",
];

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

const SUPABASE_TABLE = "diagnosis_metrics";

// ──────────────────────────── GET ────────────────────────────

export async function GET(req: NextRequest) {
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json(
      { ok: false, error: "Supabase not configured" },
      { status: 503 },
    );
  }

  const url = new URL(req.url);
  const prospectId = url.searchParams.get("prospectId");
  const token = url.searchParams.get("token");

  if (!prospectId && !token) {
    return NextResponse.json(
      { ok: false, error: "prospectId or token required" },
      { status: 400 },
    );
  }

  if (prospectId && !UUID_RE.test(prospectId)) {
    return NextResponse.json(
      { ok: false, error: "Invalid prospectId" },
      { status: 400 },
    );
  }

  let query = supabase.from(SUPABASE_TABLE).select("*").limit(1);
  if (prospectId) query = query.eq("prospect_id", prospectId);
  if (token) query = query.eq("magic_token", token);

  const { data, error } = await query.maybeSingle();
  if (error) {
    console.error("[diagnosis-metrics GET]", error);
    return NextResponse.json(
      { ok: false, error: "Database read failed" },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, row: data ?? null });
}

// ──────────────────────────── POST ────────────────────────────

type PostBody = {
  action?: "save" | "generate_magic_link";
  prospect_id?: string | null;
  industry?: DiagnosisIndustry | null;
  monthly_revenue?: number | null;
  active_customers?: number | null;
  average_order_value?: number | null;
  gross_margin_pct?: number | null;
  churn_monthly_pct?: number | null;
  customer_acquisition_cost?: number | null;
  estimates?: Partial<Record<DiagnosisMetricKey, DiagnosisEstimateSource>>;
  qualifier_answers?: Record<string, number | null>;
};

export async function POST(req: NextRequest) {
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json(
      { ok: false, error: "Supabase not configured" },
      { status: 503 },
    );
  }

  let body: PostBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON" },
      { status: 400 },
    );
  }

  const action = body.action ?? "save";

  // ─── Action: generate_magic_link ─────────────────────────────
  if (action === "generate_magic_link") {
    if (!body.prospect_id || !UUID_RE.test(body.prospect_id)) {
      return NextResponse.json(
        { ok: false, error: "Valid prospect_id required" },
        { status: 400 },
      );
    }

    // Ensure a row exists for this prospect
    const { data: existing } = await supabase
      .from(SUPABASE_TABLE)
      .select("id, magic_token")
      .eq("prospect_id", body.prospect_id)
      .maybeSingle();

    const token = crypto.randomBytes(24).toString("base64url");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    if (existing) {
      await supabase
        .from(SUPABASE_TABLE)
        .update({
          magic_token: token,
          magic_token_expires_at: expiresAt.toISOString(),
        })
        .eq("id", existing.id);
    } else {
      await supabase.from(SUPABASE_TABLE).insert({
        prospect_id: body.prospect_id,
        magic_token: token,
        magic_token_expires_at: expiresAt.toISOString(),
      });
    }

    return NextResponse.json({
      ok: true,
      token,
      url: `/diagnosis/${token}`,
      expires_at: expiresAt.toISOString(),
    });
  }

  // ─── Action: save (default) ──────────────────────────────────
  if (!body.prospect_id || !UUID_RE.test(body.prospect_id)) {
    return NextResponse.json(
      { ok: false, error: "Valid prospect_id required" },
      { status: 400 },
    );
  }
  if (
    body.industry !== null &&
    body.industry !== undefined &&
    !VALID_INDUSTRIES.includes(body.industry)
  ) {
    return NextResponse.json(
      { ok: false, error: "Invalid industry" },
      { status: 400 },
    );
  }

  // Validate estimates source values
  if (body.estimates) {
    for (const [key, src] of Object.entries(body.estimates)) {
      if (!METRIC_KEYS.includes(key as DiagnosisMetricKey)) {
        return NextResponse.json(
          { ok: false, error: `Unknown metric in estimates: ${key}` },
          { status: 400 },
        );
      }
      if (src && !VALID_ESTIMATE_SOURCES.includes(src)) {
        return NextResponse.json(
          { ok: false, error: `Invalid estimate source for ${key}: ${src}` },
          { status: 400 },
        );
      }
    }
  }

  // Sanitize numerics: convert strings to numbers, clamp percent fields
  const inputs: MetricInputs = {
    monthly_revenue: toNum(body.monthly_revenue),
    active_customers: toIntOrNull(body.active_customers),
    average_order_value: toNum(body.average_order_value),
    gross_margin_pct: clampPercent(toNum(body.gross_margin_pct)),
    churn_monthly_pct: clampPercent(toNum(body.churn_monthly_pct)),
    customer_acquisition_cost: toNum(body.customer_acquisition_cost),
  };

  const derived = computeDerivedMetrics(inputs);

  // Upsert (insert if missing, update if exists — keyed by prospect_id unique)
  const payload = {
    prospect_id: body.prospect_id,
    industry: body.industry ?? null,
    ...inputs,
    estimates: body.estimates ?? {},
    qualifier_answers: body.qualifier_answers ?? {},
    derived,
  };

  const { data, error } = await supabase
    .from(SUPABASE_TABLE)
    .upsert(payload, { onConflict: "prospect_id" })
    .select("*")
    .single();

  if (error) {
    console.error("[diagnosis-metrics POST save]", error);
    return NextResponse.json(
      { ok: false, error: "Database write failed", detail: error.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, row: data as DiagnosisMetricsRow });
}

// ──────────────────────────── helpers ────────────────────────────

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
