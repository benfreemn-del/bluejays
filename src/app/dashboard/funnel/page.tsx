"use client";

import { useEffect, useState } from "react";

/**
 * /dashboard/funnel — funnel conversion dashboard
 *
 * The single most important number for ad-spend ROI: of every prospect
 * who submitted an audit, what fraction became paid customers? If this
 * is 0%, every dollar spent on ads is wasted. If it's 5%, you can
 * justify $50 CAC at $997 LTV.
 *
 * Plus: per-fork CTA breakdown so we can see whether buy / schedule /
 * preview is the dominant intent path that actually closes.
 *
 * Protected via /dashboard/ prefix (admin-only).
 */

interface WindowStats {
  label: string;
  audits_submitted: number;
  prospects_with_audit: number;
  paid_conversions: number;
  conversion_rate_pct: number;
  avg_days_to_paid: number | null;
}

interface ForkStats {
  fork: string;
  clicks: number;
  unique_prospects: number;
  paid_conversions: number;
  conversion_rate_pct: number;
}

interface FunnelStatsResponse {
  windows?: WindowStats[];
  byFork?: ForkStats[];
  generatedAt?: string;
}

const FORK_LABEL: Record<string, string> = {
  buy: "🛠️ Fix it now",
  schedule: "📞 Schedule a call",
  preview: "🎨 Get my preview",
};

export default function FunnelDashboard() {
  const [stats, setStats] = useState<FunnelStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/funnel-conversion/stats");
      const json = await res.json();
      setStats(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <header className="mb-8 flex items-start justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">📊 Funnel Conversion</h1>
            <p className="text-slate-400 text-sm max-w-2xl">
              Audit submissions → paid customers. The number that decides
              whether ad spend is ROI-positive.
            </p>
          </div>
          <button
            onClick={load}
            className="text-xs text-slate-400 hover:text-white transition-colors"
          >
            ↻ Refresh
          </button>
        </header>

        {error && (
          <div className="mb-6 rounded-md border border-rose-500/40 bg-rose-500/10 p-4 text-sm text-rose-200">
            {error}
          </div>
        )}

        {loading && !stats ? (
          <p className="text-slate-500 text-sm">Loading…</p>
        ) : !stats ? null : (
          <>
            {/* Audit-to-paid by window */}
            <section className="mb-10">
              <h2 className="text-xl font-bold mb-4">
                Audit → Paid by window
              </h2>
              <div className="grid md:grid-cols-3 gap-4">
                {(stats.windows ?? []).map((w) => (
                  <div
                    key={w.label}
                    className="rounded-xl border border-white/10 bg-slate-900/40 p-5"
                  >
                    <p className="text-xs uppercase tracking-wider text-slate-500 mb-2">
                      Last {w.label}
                    </p>
                    <p className="text-3xl font-bold text-emerald-300">
                      {w.conversion_rate_pct.toFixed(1)}%
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {w.paid_conversions} paid / {w.prospects_with_audit} audited
                    </p>
                    <div className="mt-4 space-y-1 text-xs text-slate-500">
                      <p>
                        Audits submitted:{" "}
                        <span className="text-slate-300">{w.audits_submitted}</span>
                      </p>
                      <p>
                        Avg days to paid:{" "}
                        <span className="text-slate-300">
                          {w.avg_days_to_paid !== null
                            ? `${w.avg_days_to_paid}d`
                            : "—"}
                        </span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs text-slate-500">
                Conversion rate = paid customers ÷ unique prospects who
                submitted at least one audit in the window. Avg days
                measured from earliest audit submission.
              </p>
            </section>

            {/* Per-fork CTA breakdown */}
            <section>
              <h2 className="text-xl font-bold mb-4">
                CTA Hub — fork breakdown (last 30d)
              </h2>
              <div className="rounded-xl border border-white/10 bg-slate-900/40 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-slate-500 uppercase tracking-wider bg-slate-900/60">
                      <th className="px-4 py-3">Fork</th>
                      <th className="px-4 py-3">Clicks</th>
                      <th className="px-4 py-3">Unique prospects</th>
                      <th className="px-4 py-3">Paid</th>
                      <th className="px-4 py-3">CR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(stats.byFork ?? []).map((f) => (
                      <tr key={f.fork} className="border-t border-white/5">
                        <td className="px-4 py-3 font-semibold">
                          {FORK_LABEL[f.fork] || f.fork}
                        </td>
                        <td className="px-4 py-3 text-slate-300">
                          {f.clicks.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-slate-300">
                          {f.unique_prospects.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-emerald-300">
                          {f.paid_conversions.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-emerald-300 font-semibold">
                          {f.conversion_rate_pct.toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-4 text-xs text-slate-500">
                Click events captured via `/api/audit/[id]/cta-click`
                (sendBeacon-fired from the AuditCTAHub component).
                Multiple clicks per prospect ARE counted — unique-prospects
                column is the dedup'd basis for CR math.
              </p>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
