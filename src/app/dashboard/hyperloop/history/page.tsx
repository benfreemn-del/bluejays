"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

/**
 * /dashboard/hyperloop/history — append-only timeline of every
 * winner / loser / dethrone / budget-reallocation decision.
 *
 * Filters: by client_slug (URL query) + by decision kind.
 * Pulls from /api/dashboard/hyperloop-history.
 */

type DecisionKind =
  | "promote_winner"
  | "pause_loser"
  | "dethrone"
  | "seed_variant"
  | "allocate_budget";

interface Row {
  id: string;
  client_slug: string;
  decision_kind: DecisionKind;
  variant_id: string | null;
  variant_name: string | null;
  cohort_kind: string | null;
  reason: string;
  triggered_by: string;
  created_at: string;
}

const KIND_META: Record<DecisionKind, { label: string; tone: string }> = {
  promote_winner: { label: "Promoted winner", tone: "bg-emerald-500/15 text-emerald-300 border-emerald-500/40" },
  pause_loser: { label: "Paused loser", tone: "bg-rose-500/15 text-rose-300 border-rose-500/40" },
  dethrone: { label: "Dethroned", tone: "bg-amber-500/15 text-amber-300 border-amber-500/40" },
  seed_variant: { label: "Seeded variant", tone: "bg-sky-500/15 text-sky-300 border-sky-500/40" },
  allocate_budget: { label: "Reallocated budget", tone: "bg-violet-500/15 text-violet-300 border-violet-500/40" },
};

export default function HyperloopHistoryPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [kindFilter, setKindFilter] = useState<DecisionKind | "all">("all");
  const [clientFilter, setClientFilter] = useState<string>("all");

  async function load() {
    setLoading(true);
    try {
      const r = await fetch("/api/dashboard/hyperloop-history?limit=200");
      const j = await r.json();
      if (j.ok) setRows(j.rows);
      else setErr(j.error);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);

  const clients = Array.from(new Set(rows.map((r) => r.client_slug))).sort();
  const filtered = rows.filter(
    (r) =>
      (kindFilter === "all" || r.decision_kind === kindFilter) &&
      (clientFilter === "all" || r.client_slug === clientFilter),
  );

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-4xl px-6 py-10">
        <header className="mb-6 flex items-end justify-between flex-wrap gap-3">
          <div>
            <Link href="/dashboard/hyperloop" className="text-xs text-slate-500 hover:text-white">
              ← Hyperloop
            </Link>
            <h1 className="text-3xl font-bold mt-1">Decision history</h1>
            <p className="text-sm text-slate-400 mt-1 max-w-xl">
              Append-only log of every winner promoted, loser killed, and
              budget reallocation across every tenant. Sorted newest first.
            </p>
          </div>
          <button
            onClick={load}
            className="text-xs rounded-md border border-white/10 hover:bg-slate-900 px-3 py-1.5"
          >
            {loading ? "Refreshing…" : "Refresh"}
          </button>
        </header>

        <div className="mb-4 flex items-center gap-3 flex-wrap">
          <select
            value={kindFilter}
            onChange={(e) => setKindFilter(e.target.value as DecisionKind | "all")}
            className="text-xs rounded-md border border-white/10 bg-slate-950 px-3 py-1.5"
          >
            <option value="all">All decisions</option>
            {(Object.keys(KIND_META) as DecisionKind[]).map((k) => (
              <option key={k} value={k}>
                {KIND_META[k].label}
              </option>
            ))}
          </select>
          {clients.length > 1 && (
            <select
              value={clientFilter}
              onChange={(e) => setClientFilter(e.target.value)}
              className="text-xs rounded-md border border-white/10 bg-slate-950 px-3 py-1.5"
            >
              <option value="all">All tenants</option>
              {clients.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}
          <span className="text-xs text-slate-500">
            {filtered.length} / {rows.length}
          </span>
        </div>

        {err && <p className="text-sm text-rose-400 mb-3">{err}</p>}

        {!loading && filtered.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-8 text-center text-slate-500 text-sm">
            No decisions logged yet. The hyperloop runner writes here on
            each promote / pause / budget reallocation.
          </div>
        )}

        <ol className="space-y-2">
          {filtered.map((r) => {
            const m = KIND_META[r.decision_kind];
            return (
              <li
                key={r.id}
                className="rounded-xl border border-white/10 bg-slate-900/60 px-5 py-3"
              >
                <div className="flex items-center gap-3 flex-wrap">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider rounded-full border px-2 py-0.5 ${m.tone}`}
                  >
                    {m.label}
                  </span>
                  <span className="text-xs text-slate-500">{r.client_slug}</span>
                  {r.cohort_kind && (
                    <span className="text-xs text-slate-500">· {r.cohort_kind}</span>
                  )}
                  <span className="ml-auto text-[10px] text-slate-600 tabular-nums">
                    {new Date(r.created_at).toLocaleString()} · {r.triggered_by}
                  </span>
                </div>
                {r.variant_name && (
                  <p className="text-sm text-white font-medium mt-1">{r.variant_name}</p>
                )}
                <p className="text-sm text-slate-300 mt-1">{r.reason}</p>
              </li>
            );
          })}
        </ol>
      </div>
    </main>
  );
}
