/**
 * POST /api/managed-domains/sync-namecheap
 *
 * Pulls the FULL domain list (with expiry dates) from our Namecheap account
 * via namecheap.domains.getList and reconciles it into `managed_domains`:
 *   - tracked domain found in the account → update expiry + flag auto_managed
 *   - untracked domain found in the account → auto-add it as "Unassigned
 *     (Namecheap)" so Ben can tag its owner (nothing Ben registered slips)
 *
 * Read-only against the registrar (no charges). Falls back to the deterministic
 * mock list when Namecheap env vars are absent, so the button works in dev.
 *
 * Auth-gated via middleware (admin-only).
 */

import { NextResponse } from "next/server";
import { getRegistrar } from "@/lib/domain-registrar";
import {
  applyExpiryToManagedDomain,
  getManagedDomainByName,
  createManagedDomain,
} from "@/lib/managed-domains";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST() {
  const registrar = getRegistrar();
  if (typeof registrar.listDomains !== "function") {
    return NextResponse.json(
      { ok: false, error: `Registrar "${registrar.name}" does not support listing domains` },
      { status: 501 }
    );
  }

  let updated = 0;
  let added = 0;
  const errors: string[] = [];

  try {
    const account = await registrar.listDomains();
    for (const d of account) {
      try {
        const patch = {
          expiresAt: d.expiresAt ? d.expiresAt.toISOString() : null,
          registeredAt: d.registeredAt ? d.registeredAt.toISOString() : null,
          registrar: "namecheap",
          autoManaged: true,
          expirySource: "namecheap" as const,
        };
        const existing = await getManagedDomainByName(d.domain);
        if (existing) {
          await applyExpiryToManagedDomain(d.domain, patch);
          updated += 1;
        } else {
          await createManagedDomain({
            domain: d.domain,
            ownerLabel: "Unassigned (Namecheap)",
            kind: "business",
            registrar: "namecheap",
            autoManaged: true,
            expiresAt: patch.expiresAt,
            registeredAt: patch.registeredAt,
            expirySource: "namecheap",
            notes: "Auto-discovered from Namecheap account — assign an owner.",
          });
          added += 1;
        }
      } catch (perDomainErr) {
        errors.push(`${d.domain}: ${(perDomainErr as Error).message}`);
      }
    }

    return NextResponse.json({
      ok: true,
      registrar: registrar.name,
      total: account.length,
      updated,
      added,
      errors,
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: (err as Error).message, updated, added },
      { status: 500 }
    );
  }
}
