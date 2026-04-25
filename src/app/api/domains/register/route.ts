/**
 * POST /api/domains/register
 * Body: { prospectId: string, domain: string, years?: number }
 *
 * Steps:
 *   1. Verify prospect exists and is status === "paid"
 *   2. Verify domain is not already registered to ANY prospect
 *   3. Insert pending row in `domains`
 *   4. Call registrar.register()
 *   5. On success: update row → status='registered', set timestamps,
 *      cost, registrar_order_id, next_renewal_at = expires_at - 30 days
 *   6. On failure: update row → status='failed', last_error
 *   7. Return the domain row
 *
 * Auth-gated via middleware. In dev / when NAMECHEAP env vars are not set
 * the mock registrar is used so this endpoint can be exercised end-to-end
 * without burning real registrations.
 */

import { NextRequest, NextResponse } from "next/server";
import { getProspect } from "@/lib/store";
import {
  getRegistrar,
  normalizeDomain,
  computeNextRenewal,
  RegistrarError,
} from "@/lib/domain-registrar";
import {
  createDomain,
  updateDomain,
  getDomainByName,
} from "@/lib/domain-store";

interface Body {
  prospectId?: string;
  domain?: string;
  years?: number;
}

export async function POST(request: NextRequest) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const prospectId = (body.prospectId || "").trim();
  const domain = normalizeDomain(body.domain || "");
  const years = Math.max(1, Number(body.years) || 1);

  if (!prospectId) {
    return NextResponse.json({ error: "Missing prospectId" }, { status: 400 });
  }
  if (!domain || !/^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(domain)) {
    return NextResponse.json(
      { error: "Invalid or missing 'domain'" },
      { status: 400 }
    );
  }

  // 1. Prospect must exist and must be status "paid"
  const prospect = await getProspect(prospectId);
  if (!prospect) {
    return NextResponse.json({ error: "Prospect not found" }, { status: 404 });
  }
  if (prospect.status !== "paid") {
    return NextResponse.json(
      {
        error:
          "Prospect must be in 'paid' status before a domain can be registered",
        currentStatus: prospect.status,
      },
      { status: 409 }
    );
  }

  // 2. Pre-check uniqueness (the UNIQUE constraint will catch it too,
  // this is just a cleaner error.)
  try {
    const existing = await getDomainByName(domain);
    if (existing) {
      return NextResponse.json(
        {
          error: "Domain already registered",
          existingProspectId: existing.prospectId,
          existingStatus: existing.status,
        },
        { status: 409 }
      );
    }
  } catch (err) {
    return NextResponse.json(
      { error: `Database error: ${(err as Error).message}` },
      { status: 500 }
    );
  }

  // 3. Insert pending row
  const registrar = getRegistrar();
  let pendingId: string;
  try {
    const created = await createDomain({
      prospectId,
      domain,
      registrar: registrar.name,
      metadata: { years },
    });
    pendingId = created.id;
  } catch (err) {
    return NextResponse.json(
      { error: `Failed to insert pending row: ${(err as Error).message}` },
      { status: 500 }
    );
  }

  // 4. Call registrar
  try {
    const result = await registrar.register(domain, { years });
    // 5. Update row on success
    const nextRenewalAt = computeNextRenewal(result.expiresAt, 30);
    const updated = await updateDomain(pendingId, {
      status: "registered",
      registrarOrderId: result.orderId,
      registeredAt: result.registeredAt,
      expiresAt: result.expiresAt,
      nextRenewalAt,
      costInitialUsd: result.costUsd,
      metadata: {
        years,
        registrar: registrar.name,
        registrarRaw: result.raw ?? null,
      },
    });
    return NextResponse.json({ domain: updated });
  } catch (err) {
    // 6. Mark failed
    const message =
      err instanceof RegistrarError
        ? `${err.code}: ${err.message}`
        : (err as Error).message || "Unknown registrar error";
    try {
      await updateDomain(pendingId, {
        status: "failed",
        lastError: message,
      });
    } catch {
      // best effort — don't mask the original error
    }
    return NextResponse.json(
      { error: message, code: err instanceof RegistrarError ? err.code : "unknown" },
      { status: 500 }
    );
  }
}
