import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

/**
 * GET /api/audit/[id]/status
 *
 * Public polling endpoint — called by the /audit/[id]/processing page
 * every few seconds while the audit generates. Returns minimal data so
 * the page can flip to /audit/[id] when ready.
 *
 * Public via PUBLIC_API_PATHS (URL-as-secret pattern — anyone with the
 * audit UUID can poll, same as the audit display page itself).
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Database not available" },
      { status: 503 },
    );
  }

  const { data, error } = await supabase
    .from("site_audits")
    .select("id, status, generated_at, failed_reason")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ error: "Audit not found" }, { status: 404 });
  }

  return NextResponse.json({
    auditId: data.id,
    status: data.status,
    generatedAt: data.generated_at,
    failedReason: data.failed_reason || null,
  });
}
