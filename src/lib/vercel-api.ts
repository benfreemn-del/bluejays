/**
 * Vercel REST API Client
 * ----------------------
 * Minimal wrapper around the Vercel Project Domains API. Used by the
 * domain registration pipeline to attach a freshly-registered domain to
 * the Vercel project that serves customer preview/production sites — so
 * after Namecheap finishes the registration AND we set the nameservers
 * to ns1/ns2.vercel-dns.com, traffic to the domain resolves to the
 * project-rendered preview.
 *
 * Required env vars to flip from mock → live:
 *   VERCEL_API_TOKEN   — personal/team token from https://vercel.com/account/tokens
 *   VERCEL_PROJECT_ID  — the project id that serves prospect previews
 *                        (probably the BlueJays main project)
 *   VERCEL_TEAM_ID     — optional; only needed if Ben is on a team plan
 *                        (the API requires teamId as a query param when
 *                        operating on team-owned projects)
 *
 * If VERCEL_API_TOKEN is missing we drop into a deterministic mock
 * mirroring the pattern used in `domain-registrar.ts` so the pipeline
 * can be exercised end-to-end in dev without burning real config on a
 * real project.
 *
 * API docs:
 *   POST   /v10/projects/{idOrName}/domains
 *   GET    /v9/projects/{idOrName}/domains/{domain}
 *   DELETE /v9/projects/{idOrName}/domains/{domain}
 *
 * Cost logging: every method invokes logCost() with service
 * "vercel_domain". Vercel's domain-add is free (we own the registration
 * via Namecheap), so costUsd is always $0 — but we log every call for
 * the audit trail (so the spending dashboard tracks ops volume even if
 * it doesn't tally cost).
 *
 * Errors are wrapped in a typed VercelError carrying the Vercel error
 * code, HTTP status, and the raw response body slice for debugging.
 */

import { logCost } from "./cost-logger";

// ──────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────

/** DNS verification record the customer must set on their authoritative DNS. */
export interface VercelVerificationRecord {
  type: string; // "TXT" | "CNAME" | "A" etc.
  domain: string;
  value: string;
  reason?: string;
}

export interface VercelDomainResult {
  /** The domain Vercel registered to the project (echo of input, normalized). */
  domain: string;
  /** When false, customer must set the DNS records in `verification` before
   *  Vercel will start serving traffic. When true, Vercel already verified
   *  it (e.g. nameservers already point at vercel-dns). */
  verified: boolean;
  /** When the domain was added (Vercel's clock — ms since epoch from API,
   *  converted to Date here). */
  createdAt: Date | null;
  /** DNS verification records the customer has to set, if any. */
  verification: VercelVerificationRecord[];
  /** Raw response body for the metadata column. */
  raw?: unknown;
}

export interface VercelDomainStatus {
  domain: string;
  verified: boolean;
  /** The production preview URL for the project, when assigned. */
  productionUrl?: string;
  /** Pending DNS records the customer still needs to set. */
  verification: VercelVerificationRecord[];
  /** Raw response body. */
  raw?: unknown;
}

/** Typed error class — every Vercel call throws this on failure. */
export class VercelError extends Error {
  code: string;
  status: number;
  details?: unknown;
  constructor(code: string, status: number, message: string, details?: unknown) {
    super(message);
    this.name = "VercelError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

// ──────────────────────────────────────────────────────────────────────────
// Env / fetch helpers
// ──────────────────────────────────────────────────────────────────────────

interface VercelEnv {
  apiToken: string;
  projectId: string;
  teamId?: string;
}

function readVercelEnv(): VercelEnv | null {
  const apiToken = process.env.VERCEL_API_TOKEN;
  const projectId = process.env.VERCEL_PROJECT_ID;
  if (!apiToken || !projectId) return null;
  return {
    apiToken,
    projectId,
    teamId: process.env.VERCEL_TEAM_ID || undefined,
  };
}

function buildVercelUrl(
  env: VercelEnv,
  path: string,
  query: Record<string, string> = {}
): string {
  const usp = new URLSearchParams(query);
  if (env.teamId) usp.set("teamId", env.teamId);
  const qs = usp.toString();
  return `https://api.vercel.com${path}${qs ? `?${qs}` : ""}`;
}

interface VercelApiErrorBody {
  error?: { code?: string; message?: string };
}

async function vercelFetch(
  env: VercelEnv,
  method: "GET" | "POST" | "DELETE",
  path: string,
  body?: Record<string, unknown>
): Promise<unknown> {
  const url = buildVercelUrl(env, path);
  const init: RequestInit = {
    method,
    headers: {
      Authorization: `Bearer ${env.apiToken}`,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  };
  const res = await fetch(url, init);
  const text = await res.text();
  let json: unknown = null;
  if (text) {
    try {
      json = JSON.parse(text);
    } catch {
      // Non-JSON response — keep raw text for the error
    }
  }
  if (!res.ok) {
    const errBody = (json as VercelApiErrorBody | null) || null;
    throw new VercelError(
      errBody?.error?.code || `vercel_http_${res.status}`,
      res.status,
      errBody?.error?.message || `Vercel HTTP ${res.status}`,
      { path, method, body: text.slice(0, 1500) }
    );
  }
  return json;
}

function normalizeDomain(domain: string): string {
  let d = (domain || "").trim().toLowerCase();
  if (d.startsWith("http://")) d = d.slice(7);
  if (d.startsWith("https://")) d = d.slice(8);
  if (d.startsWith("www.")) d = d.slice(4);
  d = d.replace(/\/.*$/, "");
  return d;
}

function deterministicHash(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i += 1) {
    h = (h * 31 + input.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

// ──────────────────────────────────────────────────────────────────────────
// Verification record extraction
// ──────────────────────────────────────────────────────────────────────────

interface VercelDomainResponse {
  name?: string;
  verified?: boolean;
  createdAt?: number;
  verification?: Array<{
    type?: string;
    domain?: string;
    value?: string;
    reason?: string;
  }>;
}

function extractVerification(raw: VercelDomainResponse | null): VercelVerificationRecord[] {
  const list = raw?.verification;
  if (!Array.isArray(list)) return [];
  return list
    .filter((v): v is { type: string; domain: string; value: string; reason?: string } =>
      typeof v?.type === "string" &&
      typeof v?.domain === "string" &&
      typeof v?.value === "string"
    )
    .map((v) => ({
      type: v.type,
      domain: v.domain,
      value: v.value,
      reason: v.reason,
    }));
}

// ──────────────────────────────────────────────────────────────────────────
// Public API
// ──────────────────────────────────────────────────────────────────────────

/**
 * Add a domain to the Vercel project. Returns verification records the
 * customer must set on their DNS — UNLESS `verified` is true, in which
 * case Vercel was able to confirm ownership immediately (typical when
 * the domain's nameservers were already set to ns1/ns2.vercel-dns.com
 * before this call, which is exactly the flow we use after registering
 * via Namecheap).
 */
export async function addDomainToProject(domain: string): Promise<VercelDomainResult> {
  const normalized = normalizeDomain(domain);
  const env = readVercelEnv();

  // Mock branch — deterministic, no network. Mirrors the pattern in
  // domain-registrar.ts so dev / tests can exercise the full pipeline.
  if (!env) {
    const hash = deterministicHash(normalized);
    // Pretend ~half the time the customer already pointed nameservers,
    // half the time we need DNS verification.
    const verified = hash % 2 === 0;
    const result: VercelDomainResult = {
      domain: normalized,
      verified,
      createdAt: new Date(),
      verification: verified
        ? []
        : [
            {
              type: "TXT",
              domain: `_vercel.${normalized}`,
              value: `vc-domain-verify=${normalized},${hash.toString(36)}`,
              reason: "domain_verification_pending",
            },
          ],
      raw: { mock: true, domain: normalized, verified },
    };
    await logCost({
      service: "vercel_domain",
      action: `mock.addDomainToProject:${normalized}`,
      costUsd: 0,
      metadata: { client: "mock", verified, domain: normalized },
    });
    return result;
  }

  try {
    const raw = (await vercelFetch(env, "POST", `/v10/projects/${env.projectId}/domains`, {
      name: normalized,
    })) as VercelDomainResponse | null;

    const verified = !!raw?.verified;
    const createdAtMs = typeof raw?.createdAt === "number" ? raw.createdAt : null;
    const result: VercelDomainResult = {
      domain: normalized,
      verified,
      createdAt: createdAtMs ? new Date(createdAtMs) : null,
      verification: extractVerification(raw),
      raw,
    };
    await logCost({
      service: "vercel_domain",
      action: `addDomainToProject:${normalized}`,
      costUsd: 0,
      metadata: {
        client: "live",
        verified,
        projectId: env.projectId,
        teamId: env.teamId || null,
      },
    });
    return result;
  } catch (err) {
    if (err instanceof VercelError) throw err;
    throw new VercelError(
      "vercel_unknown",
      0,
      (err as Error).message || "Unknown Vercel error",
      err
    );
  }
}

/**
 * Look up the verification + assignment status for a domain on the
 * project. Used by the dashboard to render "verified ✓" / "needs DNS".
 */
export async function getDomainStatus(domain: string): Promise<VercelDomainStatus> {
  const normalized = normalizeDomain(domain);
  const env = readVercelEnv();

  if (!env) {
    const hash = deterministicHash(normalized);
    const verified = hash % 3 !== 0;
    const result: VercelDomainStatus = {
      domain: normalized,
      verified,
      productionUrl: verified ? `https://${normalized}` : undefined,
      verification: verified
        ? []
        : [
            {
              type: "TXT",
              domain: `_vercel.${normalized}`,
              value: `vc-domain-verify=${normalized},${hash.toString(36)}`,
              reason: "domain_verification_pending",
            },
          ],
      raw: { mock: true, domain: normalized, verified },
    };
    await logCost({
      service: "vercel_domain",
      action: `mock.getDomainStatus:${normalized}`,
      costUsd: 0,
      metadata: { client: "mock", verified, domain: normalized },
    });
    return result;
  }

  try {
    const raw = (await vercelFetch(
      env,
      "GET",
      `/v9/projects/${env.projectId}/domains/${encodeURIComponent(normalized)}`
    )) as VercelDomainResponse | null;
    const verified = !!raw?.verified;
    const result: VercelDomainStatus = {
      domain: normalized,
      verified,
      productionUrl: verified ? `https://${normalized}` : undefined,
      verification: extractVerification(raw),
      raw,
    };
    await logCost({
      service: "vercel_domain",
      action: `getDomainStatus:${normalized}`,
      costUsd: 0,
      metadata: {
        client: "live",
        verified,
        projectId: env.projectId,
      },
    });
    return result;
  } catch (err) {
    if (err instanceof VercelError) throw err;
    throw new VercelError(
      "vercel_unknown",
      0,
      (err as Error).message || "Unknown Vercel error",
      err
    );
  }
}

/**
 * Remove a domain from the project — used on rollback when the
 * registrar succeeded but a downstream step failed and we want to
 * reset cleanly. Idempotent: a 404 from Vercel is treated as success.
 */
export async function removeDomainFromProject(domain: string): Promise<void> {
  const normalized = normalizeDomain(domain);
  const env = readVercelEnv();

  if (!env) {
    await logCost({
      service: "vercel_domain",
      action: `mock.removeDomainFromProject:${normalized}`,
      costUsd: 0,
      metadata: { client: "mock", domain: normalized },
    });
    return;
  }

  try {
    await vercelFetch(
      env,
      "DELETE",
      `/v9/projects/${env.projectId}/domains/${encodeURIComponent(normalized)}`
    );
    await logCost({
      service: "vercel_domain",
      action: `removeDomainFromProject:${normalized}`,
      costUsd: 0,
      metadata: { client: "live", projectId: env.projectId },
    });
  } catch (err) {
    if (err instanceof VercelError && err.status === 404) {
      // Already gone — treat as success for idempotent rollback.
      await logCost({
        service: "vercel_domain",
        action: `removeDomainFromProject:${normalized}:not_found`,
        costUsd: 0,
        metadata: { client: "live", projectId: env.projectId, status: 404 },
      });
      return;
    }
    if (err instanceof VercelError) throw err;
    throw new VercelError(
      "vercel_unknown",
      0,
      (err as Error).message || "Unknown Vercel error",
      err
    );
  }
}

/**
 * True when the live Vercel client is in use (env vars set). Surfacing
 * this lets the register route decide whether to log the verification
 * records as "real DNS instructions" or "mock DNS instructions" in the
 * domain row's metadata.
 */
export function isVercelConfigured(): boolean {
  return readVercelEnv() !== null;
}

/** Vercel's nameservers — set on the registrar after register completes
 *  so DNS for the domain is delegated to Vercel for the lifetime of the
 *  customer's site. Exported so the register route stays the single
 *  caller of `setNameservers()` and the constant lives in one place. */
export const VERCEL_NAMESERVERS = ["ns1.vercel-dns.com", "ns2.vercel-dns.com"];
