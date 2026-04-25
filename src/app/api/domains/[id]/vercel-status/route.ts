/**
 * GET /api/domains/[id]/vercel-status
 *
 * Returns Vercel's view of the domain — verified flag, production URL,
 * and any DNS records the customer still needs to set. Used by the
 * dashboard UI to render "verified ✓" / "needs DNS" inline next to a
 * domain row.
 *
 * Pre-existing domain row must be present; otherwise 404. The row does
 * NOT need vercel_domain_added_at to be set — calling this on a row that
 * never made it past the registrar step still returns whatever Vercel
 * knows (typically a 404 caught and surfaced as `notFoundOnVercel: true`).
 *
 * Auth-gated via middleware.
 */

import { NextRequest, NextResponse } from "next/server";
import { getDomain } from "@/lib/domain-store";
import {
  getDomainStatus,
  isVercelConfigured,
  VercelError,
} from "@/lib/vercel-api";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const row = await getDomain(id).catch(() => null);
  if (!row) {
    return NextResponse.json({ error: "Domain not found" }, { status: 404 });
  }

  try {
    const status = await getDomainStatus(row.domain);
    return NextResponse.json({
      domain: row.domain,
      verified: status.verified,
      productionUrl: status.productionUrl ?? null,
      verification: status.verification,
      live: isVercelConfigured(),
      vercelProjectId: row.vercelProjectId,
      vercelDomainAddedAt: row.vercelDomainAddedAt,
    });
  } catch (err) {
    if (err instanceof VercelError && err.status === 404) {
      return NextResponse.json({
        domain: row.domain,
        verified: false,
        productionUrl: null,
        verification: [],
        live: isVercelConfigured(),
        vercelProjectId: row.vercelProjectId,
        vercelDomainAddedAt: row.vercelDomainAddedAt,
        notFoundOnVercel: true,
      });
    }
    return NextResponse.json(
      {
        error:
          err instanceof VercelError
            ? `${err.code}: ${err.message}`
            : (err as Error).message,
        code: err instanceof VercelError ? err.code : "unknown",
        status: err instanceof VercelError ? err.status : 0,
      },
      { status: 500 }
    );
  }
}
