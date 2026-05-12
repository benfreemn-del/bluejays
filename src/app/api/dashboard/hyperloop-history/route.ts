import { NextRequest, NextResponse } from "next/server";
import { listDecisions } from "@/lib/hyperloop-decisions";

/**
 * GET /api/dashboard/hyperloop-history?client=…&limit=…
 *
 * Returns recent hyperloop_decisions rows for the operator timeline.
 * Owner-only via /api/dashboard middleware prefix.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const clientSlug = url.searchParams.get("client") ?? undefined;
  const limit = Math.min(500, Math.max(1, Number(url.searchParams.get("limit") ?? "100")));
  try {
    const rows = await listDecisions({ clientSlug, limit });
    return NextResponse.json({ ok: true, rows });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
