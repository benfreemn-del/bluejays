import { NextRequest, NextResponse } from "next/server";
import {
  findCohortCandidates,
  commitCohort,
  WAVE1_COHORT_ID,
} from "@/lib/test-cohort";

/**
 * POST /api/test-cohort/select
 *
 * Body: { confirm?: boolean, cohortId?: string, prospectIds?: string[] }
 *
 * Default behavior (no body) = DRY RUN. Returns the picked candidates
 * grouped by category so Ben can review the selection before committing.
 *
 * To commit the selection, POST with `{ confirm: true }`. Tags every
 * picked prospect with `test_cohort_id = WAVE1_COHORT_ID`. Idempotent —
 * re-running with the same cohort ID is safe.
 *
 * To override the auto-pick with a manually-curated list, POST with
 * `{ confirm: true, prospectIds: ["uuid1", "uuid2", ...] }`. Useful
 * when Ben wants to swap one or two of the auto-picks for a hand-picked
 * prospect.
 *
 * Auth: this is admin-only. Gated by middleware.ts (PROTECTED_PATHS
 * default — every /api/* path that isn't in PUBLIC_API_PATHS requires
 * the dashboard session cookie).
 */
export async function POST(request: NextRequest) {
  let body: { confirm?: boolean; cohortId?: string; prospectIds?: string[] } = {};
  try {
    body = await request.json();
  } catch {
    /* empty body = dry-run mode */
  }

  const cohortId = body.cohortId || WAVE1_COHORT_ID;

  // Manually-curated list path — skip the auto-selection entirely.
  if (body.confirm && body.prospectIds && body.prospectIds.length > 0) {
    const result = await commitCohort(body.prospectIds, cohortId);
    return NextResponse.json({
      mode: "manual_commit",
      cohortId,
      tagged: result.tagged,
      failed: result.failed,
      message: `Tagged ${result.tagged}/${body.prospectIds.length} prospects with cohort '${cohortId}'`,
    });
  }

  // Auto-pick path.
  const { byCategory, total, totalAvailable } = await findCohortCandidates();

  if (!body.confirm) {
    // DRY RUN — return the picked list for Ben to review.
    return NextResponse.json({
      mode: "dry_run",
      cohortId,
      pickedCount: total.length,
      totalAvailable,
      byCategory,
      total,
      message: `DRY RUN: picked ${total.length} prospects (${totalAvailable} qualified candidates total). POST { "confirm": true } to commit, or POST { "confirm": true, "prospectIds": [...] } to override.`,
    });
  }

  // COMMIT — tag every picked prospect.
  const result = await commitCohort(
    total.map((p) => p.id),
    cohortId,
  );
  return NextResponse.json({
    mode: "auto_commit",
    cohortId,
    pickedCount: total.length,
    tagged: result.tagged,
    failed: result.failed,
    byCategory,
    message: `COMMITTED: tagged ${result.tagged}/${total.length} prospects with cohort '${cohortId}'`,
  });
}

/**
 * GET /api/test-cohort/select
 * Convenience GET for browsers — same as POST with no body (dry-run).
 */
export async function GET() {
  const { byCategory, total, totalAvailable } = await findCohortCandidates();
  return NextResponse.json({
    mode: "dry_run",
    cohortId: WAVE1_COHORT_ID,
    pickedCount: total.length,
    totalAvailable,
    byCategory,
    total,
    message: `DRY RUN: picked ${total.length} prospects (${totalAvailable} qualified candidates total). POST { "confirm": true } to commit.`,
  });
}
