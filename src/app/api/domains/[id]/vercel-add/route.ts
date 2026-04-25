/**
 * POST /api/domains/[id]/vercel-add
 *
 * Retry adding an existing `domains` row to the Vercel project. Useful
 * when /api/domains/register succeeded with Namecheap but the Vercel
 * follow-up step failed (network blip, env vars not yet set, project
 * domain cap reached, etc.). Idempotent — if the domain is already
 * verified on the project, this just refreshes
 * vercel_domain_added_at + vercelVerification metadata.
 *
 * Preconditions:
 *   - row exists
 *   - row.status === 'registered' (we have a real registrar order)
 *   - row.vercel_domain_added_at IS NULL (otherwise it's already done)
 *
 * On success: patches vercel_project_id + vercel_domain_added_at + clears
 * last_error.
 * On failure: persists error to last_error, returns 500 with the typed code.
 *
 * Auth-gated via middleware.
 */

import { NextRequest, NextResponse } from "next/server";
import { getDomain, updateDomain } from "@/lib/domain-store";
import {
  addDomainToProject,
  isVercelConfigured,
  VercelError,
} from "@/lib/vercel-api";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const row = await getDomain(id).catch(() => null);
  if (!row) {
    return NextResponse.json({ error: "Domain not found" }, { status: 404 });
  }
  if (row.status !== "registered") {
    return NextResponse.json(
      {
        error:
          "Domain row must be status='registered' to retry the Vercel add step",
        currentStatus: row.status,
      },
      { status: 409 }
    );
  }
  if (row.vercelDomainAddedAt) {
    return NextResponse.json(
      {
        error: "Domain has already been added to a Vercel project",
        vercelDomainAddedAt: row.vercelDomainAddedAt,
        vercelProjectId: row.vercelProjectId,
      },
      { status: 409 }
    );
  }

  try {
    const result = await addDomainToProject(row.domain);
    const vercelProjectId = process.env.VERCEL_PROJECT_ID || "mock_project";
    const updated = await updateDomain(id, {
      vercelProjectId,
      vercelDomainAddedAt: new Date(),
      lastError: null,
      metadata: {
        ...(row.metadata || {}),
        vercelVerification: {
          verified: result.verified,
          records: result.verification,
          capturedAt: new Date().toISOString(),
          live: isVercelConfigured(),
          retried: true,
        },
      },
    });
    return NextResponse.json({
      domain: updated,
      vercel: {
        verified: result.verified,
        verification: result.verification,
      },
    });
  } catch (err) {
    const message =
      err instanceof VercelError
        ? `${err.code}: ${err.message}`
        : (err as Error).message || "Unknown Vercel error";
    try {
      await updateDomain(id, {
        lastError: `vercel_add: ${message}`,
        metadata: {
          ...(row.metadata || {}),
          vercelVerification: {
            error: message,
            capturedAt: new Date().toISOString(),
            live: isVercelConfigured(),
            retried: true,
          },
        },
      });
    } catch {
      // best-effort — don't mask the original error
    }
    return NextResponse.json(
      {
        error: message,
        code: err instanceof VercelError ? err.code : "unknown",
        status: err instanceof VercelError ? err.status : 0,
      },
      { status: 500 }
    );
  }
}
