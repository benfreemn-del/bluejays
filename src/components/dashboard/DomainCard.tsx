"use client";

import { useState } from "react";
import type { Prospect } from "@/lib/types";
import { PRICING } from "@/lib/types";

interface DomainCardProps {
  prospect: Prospect;
  onChange: () => void;
}

/**
 * Lead-detail page card for registering + flipping a domain live.
 *
 * States (by prospect):
 *   - No domain assigned → form to assign
 *   - Domain assigned, not live → summary + "Mark Live" + "Unassign"
 *   - Domain assigned + live → green-glowing status + net-profit math
 *
 * Backing endpoint: /api/prospects/[id]/domain
 *   POST  (first-time assign)
 *   PATCH (edit cost / flip live / change registrar / rename domain)
 *   DELETE (unassign entirely)
 */
export default function DomainCard({ prospect, onChange }: DomainCardProps) {
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [domain, setDomain] = useState(prospect.assignedDomain || "");
  const [costUsd, setCostUsd] = useState<string>(
    prospect.domainCostUsd != null ? String(prospect.domainCostUsd) : "12.98"
  );
  const [registrar, setRegistrar] = useState(
    prospect.domainRegistrar || "namecheap"
  );
  const [markLive, setMarkLive] = useState(false);

  const hasDomain = !!prospect.assignedDomain;
  const isLive = !!prospect.siteLiveAt;
  const yearly = PRICING.yearlyManagement; // $100
  const cost = prospect.domainCostUsd ?? 0;
  const netProfit = Math.max(0, yearly - cost);

  async function submitAssign() {
    setErrorMsg(null);
    const numericCost = parseFloat(costUsd);
    if (!domain.trim()) return setErrorMsg("Enter a domain like example.com");
    if (isNaN(numericCost) || numericCost < 0)
      return setErrorMsg("Cost must be a non-negative number");

    setBusy(true);
    try {
      const res = await fetch(`/api/prospects/${prospect.id}/domain`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain: domain.trim(),
          costUsd: numericCost,
          registrar: registrar.trim() || undefined,
          markLive,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Save failed" }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      setMode("view");
      onChange();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  async function patch(body: Record<string, unknown>) {
    setErrorMsg(null);
    setBusy(true);
    try {
      const res = await fetch(`/api/prospects/${prospect.id}/domain`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Save failed" }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      onChange();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  async function unassign() {
    if (!confirm(`Unassign ${prospect.assignedDomain}? This clears the domain, cost, and live status.`)) return;
    setErrorMsg(null);
    setBusy(true);
    try {
      const res = await fetch(`/api/prospects/${prospect.id}/domain`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Delete failed" }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      setDomain("");
      setCostUsd("12.98");
      setRegistrar("namecheap");
      setMarkLive(false);
      setMode("view");
      onChange();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  // ───────── VIEW MODE — no domain yet ─────────
  if (!hasDomain && mode === "view") {
    return (
      <div className="p-4 rounded-xl bg-surface border border-border">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-sm">Domain & Hosting</h3>
          <span className="text-xs text-muted">Not assigned</span>
        </div>
        <p className="text-xs text-muted mb-3">
          Register a domain for this client. Cost is deducted from the $100/yr
          management fee for net-profit tracking.
        </p>
        <button
          onClick={() => setMode("edit")}
          className="w-full h-9 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors"
        >
          Assign a Domain
        </button>
      </div>
    );
  }

  // ───────── EDIT MODE — new assignment form ─────────
  if (!hasDomain && mode === "edit") {
    return (
      <div className="p-4 rounded-xl bg-surface border border-border">
        <h3 className="font-semibold text-sm mb-3">Assign Domain</h3>
        <div className="space-y-2">
          <input
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="meyerelectric.com"
            disabled={busy}
            className="w-full h-9 px-3 rounded-lg bg-surface-light border border-border text-foreground text-sm"
          />
          <div className="flex gap-2">
            <div className="flex-1">
              <div className="text-xs text-muted mb-1">Annual cost (USD)</div>
              <input
                type="number"
                step="0.01"
                min="0"
                value={costUsd}
                onChange={(e) => setCostUsd(e.target.value)}
                disabled={busy}
                className="w-full h-9 px-3 rounded-lg bg-surface-light border border-border text-foreground text-sm"
              />
            </div>
            <div className="flex-1">
              <div className="text-xs text-muted mb-1">Registrar</div>
              <select
                value={registrar}
                onChange={(e) => setRegistrar(e.target.value)}
                disabled={busy}
                className="w-full h-9 px-3 rounded-lg bg-surface-light border border-border text-foreground text-sm"
              >
                <option value="namecheap">Namecheap</option>
                <option value="porkbun">Porkbun</option>
                <option value="cloudflare">Cloudflare</option>
                <option value="google">Google / Squarespace</option>
                <option value="godaddy">GoDaddy</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <label className="flex items-center gap-2 text-xs text-muted cursor-pointer">
            <input
              type="checkbox"
              checked={markLive}
              onChange={(e) => setMarkLive(e.target.checked)}
              disabled={busy}
              className="accent-emerald-500"
            />
            Mark site as live now (DNS already pointed at our server)
          </label>
          {errorMsg && (
            <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded px-2 py-1">
              {errorMsg}
            </div>
          )}
          <div className="flex gap-2">
            <button
              onClick={() => {
                setMode("view");
                setErrorMsg(null);
              }}
              disabled={busy}
              className="flex-1 h-9 rounded-lg border border-border text-sm hover:bg-surface-light transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={submitAssign}
              disabled={busy}
              className="flex-1 h-9 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors disabled:opacity-50"
            >
              {busy ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ───────── VIEW MODE — domain already assigned ─────────
  return (
    <div className="p-4 rounded-xl bg-surface border border-border">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm">Domain & Hosting</h3>
        {isLive ? (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.4)]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.9)]" />
            LIVE
          </span>
        ) : (
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
            Pending DNS
          </span>
        )}
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted text-xs">Domain</span>
          <a
            href={`https://${prospect.assignedDomain}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs text-emerald-300 hover:text-emerald-200 underline underline-offset-2"
          >
            {prospect.assignedDomain}
          </a>
        </div>
        {prospect.domainRegistrar && (
          <div className="flex items-center justify-between">
            <span className="text-muted text-xs">Registrar</span>
            <span className="text-xs">{prospect.domainRegistrar}</span>
          </div>
        )}
        {prospect.domainRegisteredAt && (
          <div className="flex items-center justify-between">
            <span className="text-muted text-xs">Registered</span>
            <span className="text-xs">
              {new Date(prospect.domainRegisteredAt).toLocaleDateString()}
            </span>
          </div>
        )}
        {prospect.siteLiveAt && (
          <div className="flex items-center justify-between">
            <span className="text-muted text-xs">Went live</span>
            <span className="text-xs">
              {new Date(prospect.siteLiveAt).toLocaleDateString()}
            </span>
          </div>
        )}

        {/* Net profit math */}
        <div className="border-t border-border pt-2 mt-2 space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted">Annual revenue</span>
            <span className="text-emerald-400">+${yearly.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted">Domain cost</span>
            <span className="text-red-400">−${cost.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between font-semibold pt-1 border-t border-border">
            <span className="text-xs">Net recurring profit</span>
            <span className="text-sm text-emerald-300">
              ${netProfit.toFixed(2)}/yr
            </span>
          </div>
        </div>

        {errorMsg && (
          <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded px-2 py-1 mt-2">
            {errorMsg}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          {!isLive ? (
            <button
              onClick={() => patch({ markLive: true })}
              disabled={busy}
              className="flex-1 h-8 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors disabled:opacity-50"
            >
              {busy ? "…" : "Mark Site Live"}
            </button>
          ) : (
            <button
              onClick={() => patch({ markLive: false })}
              disabled={busy}
              className="flex-1 h-8 rounded-lg border border-border text-xs hover:bg-surface-light transition-colors disabled:opacity-50"
            >
              {busy ? "…" : "Unmark Live"}
            </button>
          )}
          <button
            onClick={unassign}
            disabled={busy}
            className="h-8 px-3 rounded-lg border border-red-500/40 text-xs text-red-300 hover:bg-red-500/10 transition-colors disabled:opacity-50"
          >
            Unassign
          </button>
        </div>
      </div>
    </div>
  );
}
