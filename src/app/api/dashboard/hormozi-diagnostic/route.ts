import { NextRequest, NextResponse } from "next/server";
import { diagnose, type DiagnosticInput } from "@/lib/hormozi-agent";
import { getSupabase } from "@/lib/supabase";

/**
 * POST /api/dashboard/hormozi-diagnostic
 *
 * Runs a Hormozi-style diagnosis on a prospect's business and stores
 * the result. BlueJays-internal — no auth wrapper here yet, lives
 * under /dashboard/* which is owner/sales-gated upstream.
 *
 * Body:
 *   {
 *     businessText: string,         // required — free-text dump
 *     businessName?: string,
 *     category?: string,
 *     monthlyRevenue?: string,
 *     leadSources?: string,
 *     currentOffer?: string,
 *     pricing?: string,
 *     topComplaint?: string,
 *     prospectId?: string
 *   }
 *
 * GET /api/dashboard/hormozi-diagnostic?prospectId=…
 *   Returns the 10 most recent diagnoses (optionally filtered to one
 *   prospect) so the UI can show recent runs.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: Partial<DiagnosticInput>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
  if (!body.businessText || typeof body.businessText !== "string" || body.businessText.trim().length < 20) {
    return NextResponse.json(
      { ok: false, error: "businessText is required (minimum 20 chars)" },
      { status: 400 },
    );
  }

  try {
    const result = await diagnose(body as DiagnosticInput);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    const msg = (err as Error).message;
    console.error("[hormozi-diagnostic] error:", msg);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const prospectId = new URL(req.url).searchParams.get("prospectId");
  const sb = getSupabase();
  let q = sb
    .from("hormozi_diagnostics")
    .select("id, prospect_id, business_input, diagnosis, model, cost_usd, duration_ms, created_at")
    .order("created_at", { ascending: false })
    .limit(10);
  if (prospectId) q = q.eq("prospect_id", prospectId);
  const { data, error } = await q;
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, runs: data ?? [] });
}
