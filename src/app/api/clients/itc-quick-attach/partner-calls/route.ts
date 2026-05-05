import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { getCurrentPartner } from "@/lib/partner-auth";

/**
 * /api/clients/itc-quick-attach/partner-calls
 *
 * Per-client partner call log. Multi-tenant version of
 * /api/partners/work/log-call. Writes to client_partner_calls
 * (migration 20260505_client_partner_calls.sql) with audience +
 * payout tracking fields.
 *
 * POST  body: {
 *   leadId?, audience, outcome, notes?,
 *   estimatedPayoutCents?, configLinkSent?, brochureSent?
 * }
 * GET   query: ?range=today|week|recent
 */

const CLIENT_SLUG = "itc-quick-attach";

const ALLOWED_OUTCOMES = new Set([
  "no_answer",
  "voicemail",
  "wrong_number",
  "answered_call_scheduled",
  "answered_config_sent",
  "answered_brochure_sent",
  "answered_callback",
  "answered_not_interested",
  "do_not_call",
]);

const ALLOWED_AUDIENCES = new Set([
  "dealer",
  "tym",
  "forester",
  "hunter",
  "hobbyist",
  "community",
]);

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const PAYOUT_CAP_CENTS = 100_000;

type Range = "today" | "week" | "recent";

function startOfTodayIso(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function startOfWeekIso(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = day === 0 ? 6 : day - 1;
  d.setDate(d.getDate() - diff);
  return d.toISOString();
}

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: false, error: "Supabase not configured" }, { status: 503 });
  }
  const partner = await getCurrentPartner();
  if (!partner) {
    return NextResponse.json({ ok: false, error: "Not logged in" }, { status: 401 });
  }

  // Component sends snake_case (matches DB column names). Accept both
  // for safety so a future caller using camelCase doesn't silently fail.
  let body: {
    leadId?: string;
    lead_id?: string;
    audience?: string;
    outcome?: string;
    notes?: string;
    estimatedPayoutCents?: number;
    estimated_payout_cents?: number;
    configLinkSent?: boolean;
    config_link_sent?: boolean;
    brochureSent?: boolean;
    brochure_sent?: boolean;
  } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const audience = (body.audience || "").trim();
  const outcome = (body.outcome || "").trim();
  if (!audience || !ALLOWED_AUDIENCES.has(audience)) {
    return NextResponse.json({ ok: false, error: "Unknown audience" }, { status: 400 });
  }
  if (!outcome || !ALLOWED_OUTCOMES.has(outcome)) {
    return NextResponse.json({ ok: false, error: "Unknown outcome" }, { status: 400 });
  }

  const leadId = ((body.lead_id ?? body.leadId) || "").trim();
  const leadIdValue = leadId && UUID_RE.test(leadId) ? leadId : null;

  const rawPayout = body.estimated_payout_cents ?? body.estimatedPayoutCents;
  const payoutNumber = Number.isFinite(rawPayout) ? Number(rawPayout) : 0;
  const estimatedPayoutCents = Math.max(0, Math.min(PAYOUT_CAP_CENTS, Math.round(payoutNumber)));

  const nowIso = new Date().toISOString();
  const configLinkSent = body.config_link_sent ?? body.configLinkSent;
  const brochureSent = body.brochure_sent ?? body.brochureSent;
  const configLinkSentAt = configLinkSent ? nowIso : null;
  const brochureSentAt = brochureSent ? nowIso : null;

  const { data: inserted, error } = await supabase
    .from("client_partner_calls")
    .insert({
      client_slug: CLIENT_SLUG,
      partner_id: partner.id,
      lead_id: leadIdValue,
      audience,
      outcome,
      notes: (body.notes || "").trim().slice(0, 1000) || null,
      estimated_payout_cents: estimatedPayoutCents,
      config_link_sent_at: configLinkSentAt,
      brochure_sent_at: brochureSentAt,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[itc partner-calls] insert failed:", error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  if (outcome === "do_not_call" && leadIdValue) {
    try {
      await supabase
        .from("client_leads")
        .update({ funnel_status: "dismissed" })
        .eq("id", leadIdValue)
        .eq("client_slug", CLIENT_SLUG);
    } catch (err) {
      console.warn("[itc partner-calls] DNC lead-flag failed:", err);
    }
  }

  return NextResponse.json({ ok: true, id: inserted?.id });
}

export async function GET(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: false, error: "Supabase not configured" }, { status: 503 });
  }
  const partner = await getCurrentPartner();
  if (!partner) {
    return NextResponse.json({ ok: false, error: "Not logged in" }, { status: 401 });
  }

  const url = new URL(request.url);
  const range = (url.searchParams.get("range") || "today") as Range;
  if (range !== "today" && range !== "week" && range !== "recent") {
    return NextResponse.json({ ok: false, error: "Invalid range" }, { status: 400 });
  }

  const todayStart = startOfTodayIso();
  const weekStart = startOfWeekIso();

  const [todayRes, weekRes, recentRes] = await Promise.all([
    supabase
      .from("client_partner_calls")
      .select("id,outcome,audience,estimated_payout_cents,called_at")
      .eq("client_slug", CLIENT_SLUG)
      .eq("partner_id", partner.id)
      .gte("called_at", todayStart),
    supabase
      .from("client_partner_calls")
      .select("id,outcome,audience,estimated_payout_cents,called_at")
      .eq("client_slug", CLIENT_SLUG)
      .eq("partner_id", partner.id)
      .gte("called_at", weekStart),
    range === "recent"
      ? supabase
          .from("client_partner_calls")
          .select("*")
          .eq("client_slug", CLIENT_SLUG)
          .eq("partner_id", partner.id)
          .order("called_at", { ascending: false })
          .limit(20)
      : Promise.resolve({ data: [], error: null } as { data: unknown[]; error: null }),
  ]);

  if (todayRes.error || weekRes.error || recentRes.error) {
    console.error("[itc partner-calls] GET failed:", todayRes.error || weekRes.error || recentRes.error);
    return NextResponse.json({ ok: false, error: "Query failed" }, { status: 500 });
  }

  const todayCalls = todayRes.data || [];
  const weekCalls = weekRes.data || [];
  const todayPayoutCents = todayCalls.reduce(
    (s, c) => s + (c.estimated_payout_cents || 0),
    0,
  );
  const weekPayoutCents = weekCalls.reduce(
    (s, c) => s + (c.estimated_payout_cents || 0),
    0,
  );

  const stats = {
    today_count: todayCalls.length,
    week_count: weekCalls.length,
    today_payout_cents: todayPayoutCents,
    week_payout_cents: weekPayoutCents,
    payout_cents: range === "week" ? weekPayoutCents : todayPayoutCents,
  };

  // Map raw DB rows (snake_case) → camelCase for the component which
  // reads `estimatedPayoutCents`, `calledAt`, etc. Keeps the client
  // from having to know about column-name conventions.
  const mapCall = (row: Record<string, unknown>) => ({
    id: row.id as string,
    audience: (row.audience as string) || null,
    outcome: row.outcome as string,
    notes: (row.notes as string) || null,
    estimatedPayoutCents: (row.estimated_payout_cents as number) || 0,
    calledAt: row.called_at as string,
    leadId: (row.lead_id as string) || null,
    payoutStatus: (row.payout_status as string) || "estimated",
    configLinkSentAt: (row.config_link_sent_at as string) || null,
    brochureSentAt: (row.brochure_sent_at as string) || null,
  });

  if (range === "today") {
    return NextResponse.json({ ok: true, calls: todayCalls.map(mapCall), stats });
  }
  if (range === "week") {
    return NextResponse.json({ ok: true, calls: weekCalls.map(mapCall), stats });
  }
  return NextResponse.json({
    ok: true,
    calls: ((recentRes.data || []) as Record<string, unknown>[]).map(mapCall),
    stats,
  });
}
