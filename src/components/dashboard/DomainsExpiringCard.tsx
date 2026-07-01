"use client";

/**
 * DomainsExpiringCard — home-overview cockpit tile.
 *
 * Surfaces anything from the Command center (managed_domains) expiring within
 * 60 days so Ben catches lapses from the dashboard home without digging. Links
 * through to /dashboard/command. Empty/healthy states render cleanly.
 */

import { useEffect, useState } from "react";
import Link from "next/link";

type ManagedDomain = {
  id: string;
  ownerLabel: string;
  domain: string;
  expiresAt: string | null;
  autoManaged: boolean;
};

function daysUntil(iso: string | null): number | null {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return null;
  return Math.ceil((t - Date.now()) / 86_400_000);
}

export default function DomainsExpiringCard() {
  const [domains, setDomains] = useState<ManagedDomain[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch("/api/managed-domains", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => {
        if (!alive) return;
        if (j.ok) setDomains(j.domains as ManagedDomain[]);
        else setFailed(true);
      })
      .catch(() => alive && setFailed(true))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  const soon = domains
    .map((d) => ({ ...d, days: daysUntil(d.expiresAt) }))
    .filter((d) => d.days !== null && d.days <= 60)
    .sort((a, b) => (a.days as number) - (b.days as number));

  const totalTracked = domains.length;

  return (
    <div className="rounded-2xl border border-border bg-surface/60 p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-sm font-bold">
          <span>🌐</span> Domains &amp; renewals
          {soon.length > 0 && (
            <span className="rounded-full border border-rose-500/40 bg-rose-500/15 px-2 py-0.5 text-xs font-semibold text-rose-300">
              {soon.length} expiring ≤60d
            </span>
          )}
        </h3>
        <Link href="/dashboard/command" className="text-xs font-semibold text-blue-400 hover:text-blue-300">
          Command →
        </Link>
      </div>

      {loading ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : failed ? (
        <p className="text-sm text-muted">
          Couldn’t load domains.{" "}
          <Link href="/dashboard/command" className="text-blue-400 hover:underline">
            Open Command
          </Link>
        </p>
      ) : soon.length === 0 ? (
        <p className="text-sm text-muted">
          All {totalTracked} tracked domain{totalTracked === 1 ? "" : "s"} healthy — nothing expiring in 60 days. ✅
        </p>
      ) : (
        <ul className="space-y-1.5">
          {soon.slice(0, 6).map((d) => {
            const days = d.days as number;
            const cls =
              days < 0
                ? "text-rose-200"
                : days < 30
                  ? "text-rose-300"
                  : "text-amber-300";
            const when = days < 0 ? `expired ${Math.abs(days)}d ago` : `in ${days}d`;
            return (
              <li key={d.id} className="flex items-center justify-between gap-3 text-sm">
                <span className="min-w-0 truncate">
                  <span className="font-medium text-foreground">{d.domain}</span>
                  <span className="text-muted"> · {d.ownerLabel}</span>
                </span>
                <span className={`shrink-0 font-semibold ${cls}`}>
                  {when}
                  {!d.autoManaged && <span className="ml-1 text-xs text-muted">(manual)</span>}
                </span>
              </li>
            );
          })}
          {soon.length > 6 && (
            <li>
              <Link href="/dashboard/command" className="text-xs text-blue-400 hover:underline">
                +{soon.length - 6} more →
              </Link>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
