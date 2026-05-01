import { NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

/**
 * GET /api/prospects/:id/latest-audit
 *
 * Returns the most recent ready-state site_audit for this prospect,
 * pulling the overallScore out of audit_content JSON so the
 * /lead/[id] header and /dashboard/script call workspace can render
 * a "Audit: 72/100 ↗" pill without doing the JSON parse client-side.
 *
 * Returns { audit: null } if there's no completed audit yet — both
 * surfaces gracefully hide the pill in that case.
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type AuditRow = {
  id: string;
  generated_at: string | null;
  audit_content: { overallScore?: number } | null;
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: true, audit: null });
  }

  const { data, error } = await supabase
    .from("site_audits")
    .select("id, generated_at, audit_content")
    .eq("prospect_id", id)
    .eq("status", "ready")
    .order("generated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("[latest-audit] query failed:", error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  if (!data) return NextResponse.json({ ok: true, audit: null });

  const row = data as AuditRow;
  const score = row.audit_content?.overallScore ?? null;

  return NextResponse.json({
    ok: true,
    audit: {
      id: row.id,
      score,
      generatedAt: row.generated_at,
      url: `/audit/${row.id}`,
    },
  });
}
