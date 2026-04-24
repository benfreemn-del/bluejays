import { NextResponse } from "next/server";
import { getProspect, updateProspect } from "@/lib/store";

/**
 * Domain assignment / hosting control
 *
 * POST   /api/prospects/[id]/domain
 *   body: {
 *     domain:        string;        // "meyerelectric.com" (lowercase, no protocol)
 *     costUsd:       number;        // annual registrar cost, e.g. 12.98
 *     registrar?:    string;        // "namecheap" | "porkbun" | ...
 *     registeredAt?: string;        // ISO timestamp; defaults to now()
 *     markLive?:     boolean;       // also set site_live_at = now()
 *   }
 *   returns: { ok: true, prospect }
 *
 * PATCH  /api/prospects/[id]/domain
 *   body: { markLive?: boolean; costUsd?: number; registrar?: string; domain?: string }
 *   returns: { ok: true, prospect }
 *   — used for later edits (e.g. flipping the site live after DNS
 *     propagates, or updating cost when a renewal price changes)
 *
 * DELETE /api/prospects/[id]/domain
 *   returns: { ok: true, prospect }
 *   — unassigns the domain. Useful if a domain is transferred to
 *     another prospect or Ben wants to reset hosting state.
 */

function normalizeDomain(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/$/, "")
    .replace(/\/.*$/, ""); // strip any path
}

function isValidDomain(d: string): boolean {
  // Basic check: label chars + at least one dot + TLD of 2+ chars
  return /^[a-z0-9]([a-z0-9-]{0,62}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,62}[a-z0-9])?)*\.[a-z]{2,}$/.test(
    d
  );
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const prospect = await getProspect(id);
  if (!prospect) {
    return NextResponse.json({ error: "Prospect not found" }, { status: 404 });
  }

  const body = await request.json().catch(() => ({}));
  const { domain, costUsd, registrar, registeredAt, markLive } = body as {
    domain?: string;
    costUsd?: number;
    registrar?: string;
    registeredAt?: string;
    markLive?: boolean;
  };

  if (!domain || typeof domain !== "string") {
    return NextResponse.json(
      { error: "Missing `domain` (must be a non-empty string like 'example.com')" },
      { status: 400 }
    );
  }

  const normalized = normalizeDomain(domain);
  if (!isValidDomain(normalized)) {
    return NextResponse.json(
      { error: `Invalid domain format: '${normalized}'` },
      { status: 400 }
    );
  }

  if (typeof costUsd !== "number" || !isFinite(costUsd) || costUsd < 0) {
    return NextResponse.json(
      { error: "`costUsd` must be a non-negative number (annual registrar cost, e.g. 12.98)" },
      { status: 400 }
    );
  }

  const updates: Parameters<typeof updateProspect>[1] = {
    assignedDomain: normalized,
    domainCostUsd: Math.round(costUsd * 100) / 100, // round to cents
    domainRegistrar: registrar?.trim() || undefined,
    domainRegisteredAt: registeredAt || new Date().toISOString(),
  };

  if (markLive) {
    updates.siteLiveAt = new Date().toISOString();
  }

  const updated = await updateProspect(id, updates, { source: "domain-assign" });
  if (!updated) {
    return NextResponse.json({ error: "Failed to update prospect" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, prospect: updated });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const prospect = await getProspect(id);
  if (!prospect) {
    return NextResponse.json({ error: "Prospect not found" }, { status: 404 });
  }

  const body = await request.json().catch(() => ({}));
  const { domain, costUsd, registrar, markLive } = body as {
    domain?: string;
    costUsd?: number;
    registrar?: string;
    markLive?: boolean;
  };

  const updates: Parameters<typeof updateProspect>[1] = {};

  if (domain !== undefined) {
    const normalized = normalizeDomain(domain);
    if (normalized && !isValidDomain(normalized)) {
      return NextResponse.json(
        { error: `Invalid domain format: '${normalized}'` },
        { status: 400 }
      );
    }
    updates.assignedDomain = normalized || undefined;
  }

  if (costUsd !== undefined) {
    if (typeof costUsd !== "number" || !isFinite(costUsd) || costUsd < 0) {
      return NextResponse.json(
        { error: "`costUsd` must be a non-negative number" },
        { status: 400 }
      );
    }
    updates.domainCostUsd = Math.round(costUsd * 100) / 100;
  }

  if (registrar !== undefined) {
    updates.domainRegistrar = registrar.trim() || undefined;
  }

  if (markLive === true) {
    updates.siteLiveAt = new Date().toISOString();
  } else if (markLive === false) {
    updates.siteLiveAt = undefined; // unflip
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No updates provided" }, { status: 400 });
  }

  const updated = await updateProspect(id, updates, { source: "domain-patch" });
  if (!updated) {
    return NextResponse.json({ error: "Failed to update prospect" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, prospect: updated });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const prospect = await getProspect(id);
  if (!prospect) {
    return NextResponse.json({ error: "Prospect not found" }, { status: 404 });
  }

  const updated = await updateProspect(
    id,
    {
      assignedDomain: undefined,
      domainCostUsd: undefined,
      domainRegistrar: undefined,
      domainRegisteredAt: undefined,
      siteLiveAt: undefined,
    },
    { source: "domain-delete" }
  );
  if (!updated) {
    return NextResponse.json({ error: "Failed to update prospect" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, prospect: updated });
}
