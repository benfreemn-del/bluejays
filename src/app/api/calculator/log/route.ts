import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { rateLimit } from "@/lib/rate-limit";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

/**
 * POST /api/calculator/log
 *
 * Public endpoint — telemetry beacon fired by /cut-my-agency when a
 * user reaches the results screen (before / instead of submitting the
 * lead form). Lets Ben measure the calculator's actual funnel: how
 * many people see their savings number, and what fraction of those
 * convert into leads.
 *
 * Returns { ok, id } so the client can store the row id and link a
 * later /api/cut-my-agency/submit to the same telemetry row.
 *
 * No auth (public surface). Rate-limited 30/IP/hour to absorb a real
 * user retrying inputs while still capping abuse cheaply.
 */

export const runtime = "nodejs";

type LogBody = {
  monthlyRetainer?: number;
  monthsAsClient?: number;
  monthlyAdSpend?: number;
  services?: string[];
  industry?: string;
  timeline?: string;
  goal?: string;
  math?: {
    threeYearAgencyCost?: number;
    savings?: number;
    monthlySavings?: number;
  };
  utm?: Record<string, string>;
};

function hashIp(req: NextRequest): string {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  return createHash("sha256").update(ip).digest("hex").slice(0, 32);
}

function toCents(n: number | undefined): number | null {
  if (typeof n !== "number" || !Number.isFinite(n) || n < 0) return null;
  return Math.round(n * 100);
}

export async function POST(req: NextRequest) {
  const ipHash = hashIp(req);
  const { allowed } = rateLimit(`calc-log:${ipHash}`, 30, 60 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json({ ok: false, error: "Slow down — try again in a few minutes." }, { status: 429 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: false, error: "Telemetry disabled (no DB)." }, { status: 503 });
  }

  let body: LogBody;
  try {
    body = (await req.json()) as LogBody;
  } catch {
    return NextResponse.json({ ok: false, error: "Bad JSON" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("calculator_runs")
    .insert({
      ip_hash: ipHash,
      monthly_retainer_cents: toCents(body.monthlyRetainer),
      months_as_client: typeof body.monthsAsClient === "number" ? body.monthsAsClient : null,
      monthly_ad_spend_cents: toCents(body.monthlyAdSpend),
      services: Array.isArray(body.services) ? body.services.slice(0, 32) : null,
      industry: typeof body.industry === "string" ? body.industry.slice(0, 64) : null,
      timeline: typeof body.timeline === "string" ? body.timeline.slice(0, 64) : null,
      goal: typeof body.goal === "string" ? body.goal.slice(0, 64) : null,
      three_year_agency_cost_cents: toCents(body.math?.threeYearAgencyCost),
      savings_cents: toCents(body.math?.savings),
      monthly_savings_cents: toCents(body.math?.monthlySavings),
      utm_source: body.utm?.utm_source?.slice(0, 128) || null,
      utm_medium: body.utm?.utm_medium?.slice(0, 128) || null,
      utm_campaign: body.utm?.utm_campaign?.slice(0, 128) || null,
      utm_content: body.utm?.utm_content?.slice(0, 128) || null,
      utm_referrer: body.utm?.utm_referrer?.slice(0, 256) || null,
    })
    .select("id")
    .single();

  if (error || !data) {
    return NextResponse.json({ ok: false, error: error?.message || "Insert failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: data.id });
}

/**
 * PATCH /api/calculator/log — called from the lead-form submit handler
 * to mark a run as converted. Body: { id, email }.
 */
export async function PATCH(req: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: false, error: "Telemetry disabled (no DB)." }, { status: 503 });
  }

  let body: { id?: string; email?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Bad JSON" }, { status: 400 });
  }

  if (!body.id || typeof body.id !== "string") {
    return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });
  }

  const { error } = await supabase
    .from("calculator_runs")
    .update({
      converted_to_lead: true,
      converted_email: body.email?.toLowerCase().slice(0, 256) || null,
      converted_at: new Date().toISOString(),
    })
    .eq("id", body.id);

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
