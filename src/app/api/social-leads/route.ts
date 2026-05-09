import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { captureSocialLead } from "@/lib/social-leads";

/**
 * GET  /api/social-leads?filter=open|all  — list leads
 * POST /api/social-leads                  — capture from dashboard / CLI
 */

const OPEN_STATUSES = ["drafted", "sent"];

export async function GET(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: false, error: "supabase_not_configured" });
  }
  const filter = new URL(request.url).searchParams.get("filter") || "open";
  let q = supabase
    .from("social_leads")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  if (filter === "open") q = q.in("status", OPEN_STATUSES);
  const { data, error } = await q;
  if (error) {
    return NextResponse.json({ ok: false, error: error.message });
  }
  return NextResponse.json({ ok: true, leads: data ?? [] });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const rawBody: string = body.text || body.url || body.body || "";
  if (!rawBody) {
    return NextResponse.json(
      { ok: false, error: "missing text/url" },
      { status: 400 },
    );
  }
  const result = await captureSocialLead({
    rawBody,
    capturedVia: body.capturedVia || "dashboard",
  });
  if (!result) {
    return NextResponse.json({ ok: false, error: "capture_failed" });
  }
  return NextResponse.json({ ok: true, ...result });
}
