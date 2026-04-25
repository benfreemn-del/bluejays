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
 *   6. On registrar failure: update row → status='failed', last_error
 *   7. On registrar success ALSO:
 *      a. Set Namecheap nameservers to ns1/ns2.vercel-dns.com so DNS
 *         is delegated to Vercel
 *      b. Add the domain to the Vercel project so traffic resolves to
 *         the customer's preview/production site
 *      c. Persist vercel_project_id + vercel_domain_added_at on success;
 *         persist last_error (but keep status='registered') on failure
 *         so Ben can retry the Vercel step manually
 *   8. Return the domain row
 *
 * Auth-gated via middleware. In dev / when NAMECHEAP / VERCEL env vars
 * are not set, the mock registrar / mock Vercel client are used so this
 * endpoint can be exercised end-to-end without burning real config.
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
import {
  addDomainToProject,
  VercelError,
  VERCEL_NAMESERVERS,
  isVercelConfigured,
} from "@/lib/vercel-api";

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
  let registerCostUsd = 0;
  try {
    const result = await registrar.register(domain, { years });
    registerCostUsd = result.costUsd;

    // 5. Update row on success (Namecheap leg done)
    const nextRenewalAt = computeNextRenewal(result.expiresAt, 30);
    await updateDomain(pendingId, {
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

  // 7. Vercel integration (separate try/catch — Namecheap leg already
  // succeeded so DO NOT roll back the registration on Vercel failure).
  // Two sub-steps, each best-effort but with errors persisted to
  // domain.last_error so Ben can retry via /api/domains/[id]/vercel-add.

  const metadataPatch: Record<string, unknown> = {
    years,
    registrar: registrar.name,
  };
  let lastErrorAccum: string | null = null;
  let nameserversOk = false;
  let vercelOk = false;

  // 7a. Set nameservers to Vercel's
  try {
    await registrar.setNameservers(domain, VERCEL_NAMESERVERS);
    nameserversOk = true;
    metadataPatch.nameservers = {
      values: VERCEL_NAMESERVERS,
      setAt: new Date().toISOString(),
      registrar: registrar.name,
    };
  } catch (err) {
    const message =
      err instanceof RegistrarError
        ? `${err.code}: ${err.message}`
        : (err as Error).message || "Unknown nameserver error";
    lastErrorAccum = `nameservers: ${message}`;
    metadataPatch.nameservers = {
      values: VERCEL_NAMESERVERS,
      error: message,
      registrar: registrar.name,
    };
  }

  // 7b. Add the domain to the Vercel project
  let vercelDomainAddedAt: Date | null = null;
  let vercelProjectId: string | null = null;
  try {
    const vercelResult = await addDomainToProject(domain);
    vercelOk = true;
    vercelDomainAddedAt = new Date();
    // Always store the project id we used so the row is traceable to
    // the project that serves traffic, even in mock mode.
    vercelProjectId = process.env.VERCEL_PROJECT_ID || "mock_project";
    metadataPatch.vercelVerification = {
      verified: vercelResult.verified,
      records: vercelResult.verification,
      capturedAt: new Date().toISOString(),
      live: isVercelConfigured(),
    };
  } catch (err) {
    const message =
      err instanceof VercelError
        ? `${err.code}: ${err.message}`
        : (err as Error).message || "Unknown Vercel error";
    const composed = `vercel_add: ${message}`;
    lastErrorAccum = lastErrorAccum
      ? `${lastErrorAccum} | ${composed}`
      : composed;
    metadataPatch.vercelVerification = {
      error: message,
      capturedAt: new Date().toISOString(),
      live: isVercelConfigured(),
    };
  }

  // Persist the Vercel-step results. Status stays 'registered' regardless
  // because the registrar leg succeeded — Ben can retry the Vercel step
  // manually via /api/domains/[id]/vercel-add without re-registering.
  try {
    await updateDomain(pendingId, {
      vercelProjectId,
      vercelDomainAddedAt: vercelOk ? vercelDomainAddedAt : null,
      lastError: lastErrorAccum,
      metadata: metadataPatch,
    });
  } catch {
    // best effort — don't mask the original Namecheap success
  }

  // Echo the latest row.
  const updated = await (async () => {
    try {
      const { getDomain } = await import("@/lib/domain-store");
      return await getDomain(pendingId);
    } catch {
      return null;
    }
  })();

  return NextResponse.json({
    domain: updated,
    registerCostUsd,
    vercel: {
      nameservers: { ok: nameserversOk },
      addedToProject: { ok: vercelOk },
      lastError: lastErrorAccum,
    },
  });
}
