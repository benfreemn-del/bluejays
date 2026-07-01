/**
 * PATCH  /api/managed-domains/[id] — edit a managed domain row.
 * DELETE /api/managed-domains/[id] — stop tracking a domain.
 *
 * Auth-gated via middleware (admin-only).
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getManagedDomain,
  updateManagedDomain,
  deleteManagedDomain,
  type UpdateManagedDomainPatch,
} from "@/lib/managed-domains";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const ALLOWED_KEYS: Array<keyof UpdateManagedDomainPatch> = [
  "ownerLabel",
  "clientSlug",
  "kind",
  "registrar",
  "autoManaged",
  "status",
  "registeredAt",
  "expiresAt",
  "hosting",
  "mailboxes",
  "notes",
];

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!UUID_RE.test(id)) {
    return NextResponse.json({ ok: false, error: "Invalid domain id" }, { status: 400 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const patch: UpdateManagedDomainPatch = {};
  for (const key of ALLOWED_KEYS) {
    if (key in body) {
      if (key === "mailboxes") {
        patch.mailboxes = Array.isArray(body.mailboxes)
          ? (body.mailboxes as unknown[]).filter((m): m is string => typeof m === "string")
          : [];
      } else if (key === "expiresAt" || key === "registeredAt") {
        const v = body[key];
        (patch as Record<string, unknown>)[key] = v === null || v === "" ? null : String(v);
        // A manually-edited expiry is a manual source.
        if (key === "expiresAt") patch.expirySource = v ? "manual" : null;
      } else {
        (patch as Record<string, unknown>)[key] = body[key];
      }
    }
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ ok: false, error: "No editable fields supplied" }, { status: 400 });
  }

  try {
    const existing = await getManagedDomain(id);
    if (!existing) return NextResponse.json({ ok: false, error: "Domain not found" }, { status: 404 });
    const updated = await updateManagedDomain(id, patch);
    return NextResponse.json({ ok: true, domain: updated });
  } catch (err) {
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!UUID_RE.test(id)) {
    return NextResponse.json({ ok: false, error: "Invalid domain id" }, { status: 400 });
  }
  try {
    const existing = await getManagedDomain(id);
    if (!existing) return NextResponse.json({ ok: false, error: "Domain not found" }, { status: 404 });
    await deleteManagedDomain(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 500 });
  }
}
