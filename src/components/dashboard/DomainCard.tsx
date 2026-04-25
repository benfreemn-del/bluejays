"use client";

import { useCallback, useEffect, useState } from "react";
import type { Prospect } from "@/lib/types";

/**
 * DomainCard — buy + track a real domain for a prospect.
 *
 * Wires the dashboard against the new domain backend at:
 *   POST /api/domains/check        — availability + price
 *   POST /api/domains/register     — { prospectId, domain, years } → row
 *   GET  /api/domains/list         — ?prospectId=X
 *   POST /api/domains/[id]/vercel-add      — (may 404, handle gracefully)
 *   GET  /api/domains/[id]/vercel-status   — (may 404, handle gracefully)
 *
 * States:
 *   1. Loading
 *   2. No domain row    → input + "Check availability" → register flow
 *   3. Registered       → details + Vercel verification + DNS hints
 *   4. Failed           → last_error + "Retry registration"
 *
 * Style notes:
 *   Mounts inside ProspectDetail (dark theme: bg-surface / border-border /
 *   text-muted). Mirrors the section layout of the surrounding cards.
 */

interface DomainCardProps {
  prospectId: string;
  prospect: Prospect;
}

interface DomainRow {
  id: string;
  prospectId: string;
  domain: string;
  status: "pending" | "registered" | "failed" | "expired" | "cancelled";
  registrar: string;
  registrarOrderId: string | null;
  registeredAt: string | null;
  expiresAt: string | null;
  nextRenewalAt: string | null;
  costInitialUsd: number | null;
  costPerYearUsd: number | null;
  vercelProjectId: string | null;
  vercelDomainAddedAt: string | null;
  dnsConfiguredAt: string | null;
  lastError: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

interface VercelStatus {
  verified: boolean;
  message?: string;
  records?: Array<{ type: string; name: string; value: string }>;
}

interface CheckResponse {
  domain: string;
  available: boolean;
  price: number | null;
  registrar: string;
}

function sanitizeBusinessName(name: string): string {
  return (name || "")
    .toLowerCase()
    .replace(/\b(llc|inc|co|corp|ltd|company|services|group|the)\b/g, "")
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 40);
}

function suggestDomain(prospect: Prospect): string {
  const slug = sanitizeBusinessName(prospect.businessName) || "business";
  return `${slug}.com`;
}

function suggestAlternatives(prospect: Prospect): string[] {
  const slug = sanitizeBusinessName(prospect.businessName) || "business";
  const citySlug = (prospect.city || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 20);
  return [
    `${slug}-co.com`,
    `try${slug}.com`,
    citySlug ? `${slug}${citySlug}.com` : `${slug}biz.com`,
  ];
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString();
  } catch {
    return iso;
  }
}

async function safeJson<T = Record<string, unknown>>(res: Response): Promise<T> {
  try {
    return (await res.json()) as T;
  } catch {
    return { error: `HTTP ${res.status}` } as unknown as T;
  }
}

export default function DomainCard({ prospectId, prospect }: DomainCardProps) {
  const [loading, setLoading] = useState(true);
  const [domainRow, setDomainRow] = useState<DomainRow | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [authError, setAuthError] = useState(false);

  // No-domain-yet form state
  const [domainInput, setDomainInput] = useState<string>(suggestDomain(prospect));
  const [checkBusy, setCheckBusy] = useState(false);
  const [checkResult, setCheckResult] = useState<CheckResponse | null>(null);
  const [registerBusy, setRegisterBusy] = useState(false);

  // Vercel status (only when registered)
  const [vercelStatus, setVercelStatus] = useState<VercelStatus | null>(null);
  const [vercelLoading, setVercelLoading] = useState(false);
  const [vercelEndpointMissing, setVercelEndpointMissing] = useState(false);
  const [retryBusy, setRetryBusy] = useState(false);

  const isPaid = prospect.status === "paid";

  const loadDomain = useCallback(async () => {
    setLoading(true);
    setError(null);
    setAuthError(false);
    try {
      const res = await fetch(
        `/api/domains/list?prospectId=${encodeURIComponent(prospectId)}`,
        { credentials: "include" }
      );
      if (res.status === 401) {
        setAuthError(true);
        setLoading(false);
        return;
      }
      if (!res.ok) {
        const body = await safeJson<{ error?: string }>(res);
        throw new Error(body.error || `Failed to load domains (HTTP ${res.status})`);
      }
      const data = (await res.json()) as { domains: DomainRow[] };
      const list = data.domains || [];
      // Prefer registered, then pending, then most-recent failed.
      const registered = list.find((d) => d.status === "registered");
      const pending = list.find((d) => d.status === "pending");
      const failed = list.find((d) => d.status === "failed");
      const picked = registered || pending || failed || list[0] || null;
      setDomainRow(picked);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error loading domains");
    } finally {
      setLoading(false);
    }
  }, [prospectId]);

  useEffect(() => {
    loadDomain();
  }, [loadDomain]);

  const loadVercelStatus = useCallback(
    async (id: string) => {
      if (vercelEndpointMissing) return;
      setVercelLoading(true);
      try {
        const res = await fetch(`/api/domains/${id}/vercel-status`, {
          credentials: "include",
        });
        if (res.status === 404) {
          // Endpoint not implemented yet — gracefully hide.
          setVercelEndpointMissing(true);
          setVercelStatus(null);
          return;
        }
        if (!res.ok) {
          // Non-404 errors: don't kill the panel, just clear.
          setVercelStatus(null);
          return;
        }
        const data = (await res.json()) as VercelStatus;
        setVercelStatus(data);
      } catch {
        setVercelStatus(null);
      } finally {
        setVercelLoading(false);
      }
    },
    [vercelEndpointMissing]
  );

  useEffect(() => {
    if (domainRow && domainRow.status === "registered") {
      loadVercelStatus(domainRow.id);
    }
  }, [domainRow, loadVercelStatus]);

  async function handleCheck() {
    setError(null);
    setCheckResult(null);
    const trimmed = domainInput.trim().toLowerCase();
    if (!trimmed || !/^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(trimmed)) {
      setError("Enter a valid domain like example.com");
      return;
    }
    setCheckBusy(true);
    try {
      const res = await fetch("/api/domains/check", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: trimmed }),
      });
      if (res.status === 401) {
        setAuthError(true);
        return;
      }
      const body = await safeJson<CheckResponse & { error?: string }>(res);
      if (!res.ok) {
        throw new Error(body.error || `HTTP ${res.status}`);
      }
      setCheckResult(body);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error checking domain");
    } finally {
      setCheckBusy(false);
    }
  }

  async function handleRegister(domainToRegister: string) {
    setError(null);
    if (!isPaid) {
      setError("Customer must be paid before registering a domain");
      return;
    }
    setRegisterBusy(true);
    try {
      const res = await fetch("/api/domains/register", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prospectId,
          domain: domainToRegister,
          years: 1,
        }),
      });
      if (res.status === 401) {
        setAuthError(true);
        return;
      }
      const body = await safeJson<{ domain?: DomainRow; error?: string }>(res);
      if (!res.ok) {
        throw new Error(body.error || `HTTP ${res.status}`);
      }
      if (body.domain) {
        setDomainRow(body.domain);
        setCheckResult(null);
      } else {
        // Fall back to a fresh load.
        await loadDomain();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error registering domain");
    } finally {
      setRegisterBusy(false);
    }
  }

  async function handleRetryVercel() {
    if (!domainRow) return;
    setRetryBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/domains/${domainRow.id}/vercel-add`, {
        method: "POST",
        credentials: "include",
      });
      if (res.status === 404) {
        setVercelEndpointMissing(true);
        setError("Vercel-add endpoint not deployed yet.");
        return;
      }
      if (res.status === 401) {
        setAuthError(true);
        return;
      }
      const body = await safeJson<{ error?: string }>(res);
      if (!res.ok) {
        throw new Error(body.error || `HTTP ${res.status}`);
      }
      // Re-load both rows.
      await loadDomain();
      await loadVercelStatus(domainRow.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error retrying Vercel add");
    } finally {
      setRetryBusy(false);
    }
  }

  // ───────── Auth error ─────────
  if (authError) {
    return (
      <section
        aria-label="Domain & Hosting"
        className="p-4 rounded-xl bg-surface-light border border-border"
      >
        <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-2">
          Domain
        </h3>
        <p className="text-xs text-rose-400">
          Session expired.{" "}
          <a
            href="/login"
            className="underline hover:text-rose-300"
          >
            Re-authenticate
          </a>
          .
        </p>
      </section>
    );
  }

  // ───────── Loading ─────────
  if (loading) {
    return (
      <section
        aria-label="Domain & Hosting"
        aria-busy="true"
        className="p-4 rounded-xl bg-surface-light border border-border"
      >
        <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">
          Domain
        </h3>
        <div className="flex items-center gap-2 text-xs text-muted">
          <span className="w-3 h-3 rounded-full border-2 border-muted/30 border-t-muted animate-spin" />
          Loading domain status…
        </div>
      </section>
    );
  }

  // ───────── State 1: No domain yet ─────────
  if (!domainRow) {
    const alternatives = !checkResult || checkResult.available ? [] : suggestAlternatives(prospect);

    return (
      <section
        aria-label="Domain & Hosting"
        className="p-4 rounded-xl bg-surface-light border border-border"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-muted uppercase tracking-wider">
            Domain
          </h3>
          <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
            Not registered
          </span>
        </div>

        {!isPaid && (
          <div className="mb-3 p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
            Customer must be paid before registering a domain.
          </div>
        )}

        <label
          htmlFor={`domain-input-${prospectId}`}
          className="block text-[11px] font-medium text-muted mb-1"
        >
          Suggested domain
        </label>
        <div className="flex gap-2 mb-2">
          <input
            id={`domain-input-${prospectId}`}
            type="text"
            value={domainInput}
            onChange={(e) => {
              setDomainInput(e.target.value);
              setCheckResult(null);
            }}
            disabled={checkBusy || registerBusy}
            placeholder="example.com"
            aria-label="Domain to register"
            className="flex-1 h-9 px-3 rounded-lg bg-surface border border-border text-foreground text-sm font-mono focus:outline-none focus:border-blue-electric/60"
          />
          <button
            onClick={handleCheck}
            disabled={checkBusy || registerBusy || !domainInput.trim()}
            className="h-9 px-3 rounded-lg bg-blue-electric/10 text-blue-electric text-xs font-medium hover:bg-blue-electric/20 transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            {checkBusy ? "Checking…" : "Check availability"}
          </button>
        </div>

        {checkResult && checkResult.available && (
          <div className="mt-3 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
            <p className="text-xs text-emerald-300 mb-2">
              <span className="font-semibold">{checkResult.domain}</span> is available
              {checkResult.price != null ? ` — $${checkResult.price.toFixed(2)}/yr` : ""}.
            </p>
            <button
              onClick={() => handleRegister(checkResult.domain)}
              disabled={registerBusy || !isPaid}
              title={!isPaid ? "Customer must be paid before registering a domain" : undefined}
              className="w-full h-9 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-semibold hover:bg-emerald-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {registerBusy
                ? "Registering…"
                : `Register ${checkResult.domain}${checkResult.price != null ? ` for $${checkResult.price.toFixed(2)}` : ""}`}
            </button>
          </div>
        )}

        {checkResult && !checkResult.available && (
          <div className="mt-3 p-3 rounded-lg bg-rose-500/5 border border-rose-500/20">
            <p className="text-xs text-rose-300 mb-2">
              <span className="font-semibold">{checkResult.domain}</span> is taken. Try one of these:
            </p>
            <div className="space-y-1">
              {alternatives.map((alt) => (
                <button
                  key={alt}
                  onClick={() => {
                    setDomainInput(alt);
                    setCheckResult(null);
                  }}
                  className="w-full text-left text-xs font-mono px-2 py-1.5 rounded bg-surface hover:bg-surface-light border border-border text-foreground transition-colors"
                >
                  {alt}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && (
          <p className="mt-2 text-xs text-rose-400" role="alert">
            {error}
          </p>
        )}
      </section>
    );
  }

  // ───────── State 3: Failed ─────────
  if (domainRow.status === "failed") {
    return (
      <section
        aria-label="Domain & Hosting"
        className="p-4 rounded-xl bg-surface-light border border-border"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-muted uppercase tracking-wider">
            Domain
          </h3>
          <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30">
            Registration failed
          </span>
        </div>
        <p className="text-sm font-mono text-foreground mb-2">{domainRow.domain}</p>
        {domainRow.lastError && (
          <pre className="text-xs text-rose-300/90 bg-rose-500/5 border border-rose-500/20 rounded p-2 max-h-32 overflow-y-auto whitespace-pre-wrap mb-3">
            {domainRow.lastError}
          </pre>
        )}
        <button
          onClick={() => handleRegister(domainRow.domain)}
          disabled={registerBusy || !isPaid}
          title={!isPaid ? "Customer must be paid before registering a domain" : undefined}
          className="w-full h-9 rounded-lg bg-amber-500/20 text-amber-300 text-xs font-semibold hover:bg-amber-500/30 transition-colors disabled:opacity-50"
        >
          {registerBusy ? "Retrying…" : "Retry registration"}
        </button>
        {error && (
          <p className="mt-2 text-xs text-rose-400" role="alert">
            {error}
          </p>
        )}
      </section>
    );
  }

  // ───────── State 2: Registered (or pending) ─────────
  const isPending = domainRow.status === "pending";
  const verified = !!vercelStatus?.verified;

  return (
    <section
      aria-label="Domain & Hosting"
      aria-busy={vercelLoading || retryBusy}
      className="p-4 rounded-xl bg-surface-light border border-border"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-muted uppercase tracking-wider">
          Domain
        </h3>
        {isPending ? (
          <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
            Pending
          </span>
        ) : (
          <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            Registered
          </span>
        )}
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted text-xs">Domain</span>
          <a
            href={`https://${domainRow.domain}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs text-blue-electric hover:underline"
          >
            {domainRow.domain}
          </a>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted text-xs">Registrar</span>
          <span className="text-xs">{domainRow.registrar}</span>
        </div>
        {domainRow.registeredAt && (
          <div className="flex items-center justify-between">
            <span className="text-muted text-xs">Registered</span>
            <span className="text-xs">{formatDate(domainRow.registeredAt)}</span>
          </div>
        )}
        {domainRow.expiresAt && (
          <div className="flex items-center justify-between">
            <span className="text-muted text-xs">Expires</span>
            <span className="text-xs">{formatDate(domainRow.expiresAt)}</span>
          </div>
        )}
        {domainRow.nextRenewalAt && (
          <div className="flex items-center justify-between">
            <span className="text-muted text-xs">Next renewal</span>
            <span className="text-xs">{formatDate(domainRow.nextRenewalAt)}</span>
          </div>
        )}
        {domainRow.costPerYearUsd != null && (
          <div className="flex items-center justify-between">
            <span className="text-muted text-xs">Cost</span>
            <span className="text-xs">${domainRow.costPerYearUsd.toFixed(2)}/yr</span>
          </div>
        )}
      </div>

      {/* Vercel status */}
      {!vercelEndpointMissing && (
        <div className="mt-4 pt-3 border-t border-border space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-muted uppercase tracking-wider">
              Vercel
            </span>
            {vercelLoading ? (
              <span className="text-[10px] text-muted">Checking…</span>
            ) : verified ? (
              <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Verified
              </span>
            ) : (
              <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                Unverified
              </span>
            )}
          </div>

          {vercelStatus?.message && (
            <p className="text-[11px] text-muted">{vercelStatus.message}</p>
          )}

          {/* DNS records to set when unverified */}
          {!verified && vercelStatus?.records && vercelStatus.records.length > 0 && (
            <div className="space-y-1">
              <p className="text-[11px] text-muted">Add these DNS records:</p>
              <div className="bg-surface border border-border rounded-md p-2 space-y-1 text-[11px] font-mono overflow-x-auto">
                {vercelStatus.records.map((rec, i) => (
                  <div key={i} className="flex gap-2 whitespace-nowrap">
                    <span className="text-muted w-10 shrink-0">{rec.type}</span>
                    <span className="text-foreground/80 w-28 shrink-0 truncate">
                      {rec.name}
                    </span>
                    <span className="text-blue-electric truncate">{rec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Fall back to metadata.vercelVerification if provided by registrar */}
          {!verified && !vercelStatus?.records && (() => {
            const meta = domainRow.metadata as Record<string, unknown>;
            const verification = meta?.vercelVerification as
              | Array<{ type: string; name: string; value: string }>
              | undefined;
            if (Array.isArray(verification) && verification.length > 0) {
              return (
                <div className="space-y-1">
                  <p className="text-[11px] text-muted">Add these DNS records:</p>
                  <div className="bg-surface border border-border rounded-md p-2 space-y-1 text-[11px] font-mono overflow-x-auto">
                    {verification.map((rec, i) => (
                      <div key={i} className="flex gap-2 whitespace-nowrap">
                        <span className="text-muted w-10 shrink-0">{rec.type}</span>
                        <span className="text-foreground/80 w-28 shrink-0 truncate">
                          {rec.name}
                        </span>
                        <span className="text-blue-electric truncate">{rec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            }
            return null;
          })()}

          <div className="flex gap-2 pt-1">
            <button
              onClick={() => loadVercelStatus(domainRow.id)}
              disabled={vercelLoading}
              className="flex-1 h-8 rounded-lg bg-surface border border-border text-xs hover:bg-surface-light transition-colors disabled:opacity-50"
            >
              {vercelLoading ? "Refreshing…" : "Refresh status"}
            </button>
            {!verified && (
              <button
                onClick={handleRetryVercel}
                disabled={retryBusy}
                className="flex-1 h-8 rounded-lg bg-blue-electric/10 text-blue-electric text-xs font-medium hover:bg-blue-electric/20 transition-colors disabled:opacity-50"
              >
                {retryBusy ? "Retrying…" : "Retry Vercel add"}
              </button>
            )}
          </div>
        </div>
      )}

      {error && (
        <p className="mt-3 text-xs text-rose-400" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
