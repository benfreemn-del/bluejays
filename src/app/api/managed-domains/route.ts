/**
 * GET  /api/managed-domains  — every managed domain (Command center).
 * POST /api/managed-domains  — add a domain (manual entry for client-owned /
 *                              non-Namecheap domains).
 *
 * Auth-gated via middleware (admin-only — added to PROTECTED_PATHS).
 */

import { NextRequest, NextResponse } from "next/server";
import {
  listManagedDomains,
  createManagedDomain,
  type CreateManagedDomainInput,
} from "@/lib/managed-domains";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const domains = await listManagedDomains();
    return NextResponse.json({ ok: true, domains });
  } catch (err) {
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const domain = typeof body.domain === "string" ? body.domain.trim().toLowerCase() : "";
  const ownerLabel = typeof body.ownerLabel === "string" ? body.ownerLabel.trim() : "";
  if (!domain || !domain.includes(".")) {
    return NextResponse.json({ ok: false, error: "A valid domain is required" }, { status: 400 });
  }
  if (!ownerLabel) {
    return NextResponse.json({ ok: false, error: "ownerLabel is required" }, { status: 400 });
  }

  const input: CreateManagedDomainInput = {
    domain,
    ownerLabel,
    clientSlug: typeof body.clientSlug === "string" && body.clientSlug ? body.clientSlug : null,
    kind: body.kind === "business" ? "business" : "client",
    registrar: typeof body.registrar === "string" && body.registrar ? body.registrar : null,
    hosting: typeof body.hosting === "string" && body.hosting ? body.hosting : null,
    expiresAt: typeof body.expiresAt === "string" && body.expiresAt ? body.expiresAt : null,
    expirySource: typeof body.expiresAt === "string" && body.expiresAt ? "manual" : null,
    mailboxes: Array.isArray(body.mailboxes)
      ? (body.mailboxes as unknown[]).filter((m): m is string => typeof m === "string")
      : [],
    notes: typeof body.notes === "string" && body.notes ? body.notes : null,
  };

  try {
    const created = await createManagedDomain(input);
    return NextResponse.json({ ok: true, domain: created });
  } catch (err) {
    const msg = (err as Error).message;
    // Unique-violation on the domain column → friendly 409.
    if (/duplicate key|unique/i.test(msg)) {
      return NextResponse.json({ ok: false, error: `${domain} is already tracked` }, { status: 409 });
    }
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
