/**
 * POST /api/managed-domains/[id]/refresh-expiry
 *
 * Looks up the domain's expiry via public RDAP (works for ANY registrar, incl.
 * client-owned / Wix / GoDaddy domains we don't control) and writes it back.
 * This is how non-Namecheap domains still get a color-coded expiry + swept into
 * the reminder digest.
 *
 * Auth-gated via middleware (admin-only).
 */

import { NextRequest, NextResponse } from "next/server";
import { getManagedDomain, updateManagedDomain } from "@/lib/managed-domains";
import { lookupExpiryViaRdap } from "@/lib/rdap-expiry";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!UUID_RE.test(id)) {
    return NextResponse.json({ ok: false, error: "Invalid domain id" }, { status: 400 });
  }

  try {
    const row = await getManagedDomain(id);
    if (!row) return NextResponse.json({ ok: false, error: "Domain not found" }, { status: 404 });

    const result = await lookupExpiryViaRdap(row.domain);
    if (!result.ok || !result.expiresAt) {
      // Stamp the attempt so the UI can show "checked, no RDAP data".
      await updateManagedDomain(id, { expiryCheckedAt: new Date().toISOString() });
      return NextResponse.json({
        ok: false,
        error: result.error || "RDAP returned no expiration date for this domain",
      });
    }

    const updated = await updateManagedDomain(id, {
      expiresAt: result.expiresAt,
      ...(result.registeredAt ? { registeredAt: result.registeredAt } : {}),
      ...(result.registrar && !row.registrar ? { registrar: result.registrar } : {}),
      expirySource: "rdap",
      expiryCheckedAt: new Date().toISOString(),
    });
    return NextResponse.json({ ok: true, domain: updated });
  } catch (err) {
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 500 });
  }
}
