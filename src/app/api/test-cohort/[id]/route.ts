import { NextRequest, NextResponse } from "next/server";
import { getCohortStats } from "@/lib/test-cohort";

/**
 * GET /api/test-cohort/[id]
 *
 * Returns the full firehose stats for a cohort. Drives the
 * /dashboard/test-group/[id] page.
 *
 * Auth: admin-only via middleware (PROTECTED_PATHS default).
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const stats = await getCohortStats(id);
  if (!stats) {
    return NextResponse.json(
      { error: "Cohort not found or Supabase not configured" },
      { status: 404 },
    );
  }
  return NextResponse.json(stats);
}
