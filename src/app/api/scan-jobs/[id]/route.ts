import { NextRequest, NextResponse } from "next/server";
import { ownerFromCookie } from "@/lib/client-auth";
import { getScanJob } from "@/lib/scan-jobs";

/**
 * GET /api/scan-jobs/[id]
 *
 * Poll a scan job for progress. Owner-cookie-gated — owners can only
 * read jobs scoped to their own slug. The UI hits this every ~1.5s
 * while a scan is running so the progress bar stays live without a
 * persistent connection / SSE.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const cookie = req.cookies.get("client-portal-session")?.value;
  const owner = cookie ? await ownerFromCookie(cookie) : null;
  if (!owner) {
    return NextResponse.json(
      { ok: false, error: "unauthorized" },
      { status: 401 },
    );
  }
  const job = await getScanJob(id);
  if (!job) {
    return NextResponse.json(
      { ok: false, error: "job not found" },
      { status: 404 },
    );
  }
  if (job.client_slug !== owner.client_slug) {
    return NextResponse.json(
      { ok: false, error: "forbidden" },
      { status: 403 },
    );
  }
  return NextResponse.json({ ok: true, job });
}
