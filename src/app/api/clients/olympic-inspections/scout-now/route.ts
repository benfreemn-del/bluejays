import { NextRequest, NextResponse } from "next/server";
import { ownerFromCookie } from "@/lib/client-auth";
import { runPartnerScout } from "@/lib/oit-partner-scout";
import {
  createScanJob,
  updateScanJobProgress,
  finalizeScanJob,
} from "@/lib/scan-jobs";

/**
 * POST /api/clients/olympic-inspections/scout-now
 *
 * Owner-triggered manual partner scout. Creates a scan_jobs row,
 * returns the jobId immediately so the UI can start polling, then
 * runs the scout streaming progress to that row.
 *
 * Cost: ~$3/run (60 queries × $0.05). Idempotent — dedupes against
 * existing client_affiliates rows so re-runs only add new candidates.
 *
 * The function stays alive (maxDuration=300) until the scout finishes;
 * the client polls /api/scan-jobs/[id] every 1.5s for live progress.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

const SLUG = "olympic-inspections";

export async function POST(req: NextRequest) {
  const cookie = req.cookies.get("client-portal-session")?.value;
  const owner = await ownerFromCookie(cookie);
  if (!owner || owner.client_slug !== SLUG) {
    return NextResponse.json(
      { ok: false, error: "unauthorized" },
      { status: 401 },
    );
  }

  // Accept an optional client-generated UUID so the UI can start
  // polling BEFORE this slow POST returns (the scan can take 60+s).
  let preassignedId: string | undefined;
  try {
    const body = (await req.json().catch(() => null)) as { jobId?: string } | null;
    if (body?.jobId && /^[0-9a-f-]{36}$/i.test(body.jobId)) {
      preassignedId = body.jobId;
    }
  } catch {
    /* no body, fine — we'll generate */
  }

  // Create the job row up front — the client uses this id to poll.
  const jobId = await createScanJob({
    clientSlug: SLUG,
    kind: "partner-scout",
    triggeredBy: owner.id,
    preassignedId,
  });
  if (!jobId) {
    return NextResponse.json(
      { ok: false, error: "could not create scan job (db not configured?)" },
      { status: 500 },
    );
  }

  try {
    const result = await runPartnerScout(SLUG, {
      onProgress: (p) =>
        updateScanJobProgress(jobId, {
          pct: p.pct,
          phase: p.phase,
          scanned: p.scanned,
          inserted: p.inserted,
          duplicates: p.duplicates,
          errorsSoFar: p.errorsSoFar,
        }),
    });
    await finalizeScanJob(jobId, "done", {
      scanned: result.scanned,
      inserted: result.inserted,
      duplicates: result.duplicates,
      errors: result.errors,
    });
    return NextResponse.json({ ok: true, jobId, ...result });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[oit/scout-now] failed:", msg);
    await finalizeScanJob(jobId, "failed", { errorMessage: msg });
    return NextResponse.json({ ok: false, jobId, error: msg }, { status: 500 });
  }
}
