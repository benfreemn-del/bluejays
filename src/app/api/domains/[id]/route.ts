/**
 * GET    /api/domains/[id] — return single domain row
 * PATCH  /api/domains/[id] — update mutable fields
 *
 * Patchable fields: status, registrarOrderId, registeredAt, expiresAt,
 * nextRenewalAt, costInitialUsd, costPerYearUsd, vercelProjectId,
 * vercelDomainAddedAt, dnsConfiguredAt, lastError, metadata.
 *
 * Auth-gated via middleware (admin-only).
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getDomain,
  updateDomain,
  type UpdateDomainPatch,
} from "@/lib/domain-store";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const row = await getDomain(id);
    if (!row) return NextResponse.json({ error: "Domain not found" }, { status: 404 });
    return NextResponse.json({ domain: row });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

const ALLOWED_KEYS: Array<keyof UpdateDomainPatch> = [
  "status",
  "registrarOrderId",
  "registeredAt",
  "expiresAt",
  "nextRenewalAt",
  "costInitialUsd",
  "costPerYearUsd",
  "vercelProjectId",
  "vercelDomainAddedAt",
  "dnsConfiguredAt",
  "lastError",
  "metadata",
];

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const patch: UpdateDomainPatch = {};
  for (const key of ALLOWED_KEYS) {
    if (key in body) {
      // The store helper validates field types when it builds the SQL update.
      (patch as Record<string, unknown>)[key] = body[key];
    }
  }
  if (Object.keys(patch).length === 0) {
    return NextResponse.json(
      { error: "No patchable fields supplied" },
      { status: 400 }
    );
  }

  try {
    const existing = await getDomain(id);
    if (!existing) {
      return NextResponse.json({ error: "Domain not found" }, { status: 404 });
    }
    const updated = await updateDomain(id, patch);
    return NextResponse.json({ domain: updated });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
