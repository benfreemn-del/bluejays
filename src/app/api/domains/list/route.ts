/**
 * GET /api/domains/list?prospectId=&status=&expiringWithinDays=
 *
 * Returns: { domains: DomainRow[] }
 *
 * Filters are AND-combined. All optional. Defaults to all domains, newest
 * first. The renewal cron (separate task) uses ?status=registered and
 * ?expiringWithinDays=30 to drive renewals.
 *
 * Auth-gated via middleware (admin-only).
 */

import { NextRequest, NextResponse } from "next/server";
import { listDomains, type DomainStatus, type ListDomainsParams } from "@/lib/domain-store";

const VALID_STATUSES: DomainStatus[] = [
  "pending",
  "registered",
  "failed",
  "expired",
  "cancelled",
];

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const prospectId = url.searchParams.get("prospectId") || undefined;
  const statusRaw = url.searchParams.get("status") || undefined;
  const expiringRaw = url.searchParams.get("expiringWithinDays");

  const params: ListDomainsParams = {};
  if (prospectId) params.prospectId = prospectId;
  if (statusRaw) {
    if (!VALID_STATUSES.includes(statusRaw as DomainStatus)) {
      return NextResponse.json(
        { error: `Invalid status. Allowed: ${VALID_STATUSES.join(", ")}` },
        { status: 400 }
      );
    }
    params.status = statusRaw as DomainStatus;
  }
  if (expiringRaw != null) {
    const n = Number(expiringRaw);
    if (!Number.isFinite(n) || n < 0) {
      return NextResponse.json(
        { error: "expiringWithinDays must be a non-negative number" },
        { status: 400 }
      );
    }
    params.expiringWithinDays = n;
  }

  try {
    const domains = await listDomains(params);
    return NextResponse.json({ domains });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
