"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { CohortStats } from "@/lib/test-cohort";

const TARGET_PAID = 1; // 1% of 50 = 0.5, so success bar is 1 sale.
const BUDGET_CAP = 500; // upper bound, in $.
const TARGET_DAYS = 30;

function fmtUsd(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(n);
}

function daysSince(iso: string | null): number | null {
  if (!iso) return null;
  const ms = Date.now() - new Date(iso).getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

const STAGE_COLORS: Record<string, string> = {
  paid: "bg-emerald-600",
  approved: "bg-sky-600",
  contacted: "bg-violet-600",
  responded: "bg-amber-600",
  interested: "bg-amber-500",
  claimed: "bg-emerald-500",
  dismissed: "bg-slate-600",
  unsubscribed: "bg-rose-700",
  bounced: "bg-rose-800",
};

export default function TestGroupDashboard({
  initialStats,
  cohortId,
}: {
  initialStats: CohortStats;
  cohortId: string;
}) {
  const [stats, setStats] = useState<CohortStats>(initialStats);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    try {
      const res = await fetch(`/api/test-cohort/${cohortId}`, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: CohortStats = await res.json();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setRefreshing(false);
    }
  }, [cohortId]);

  // Auto-refresh every 60s.
  useEffect(() => {
    const interval = setInterval(refresh, 60000);
    return () => clearInterval(interval);
  }, [refresh]);

  const successPct = useMemo(
    () => (stats.totalEnrolled === 0 ? 0 : (stats.paid / stats.totalEnrolled) * 100),
    [stats.paid, stats.totalEnrolled],
  );
  const budgetUsedPct = useMemo(
    () => Math.min((stats.totalCostUsd / BUDGET_CAP) * 100, 100),
    [stats.totalCostUsd],
  );
  const projectedRoi = useMemo(() => {
    const revenue = stats.paid * 997;
    return revenue - stats.totalCostUsd;
  }, [stats.paid, stats.totalCostUsd]);

  // Action queue: top 10 by quality score that DON'T have a Loom yet.
  const loomQueue = useMemo(
    () =>
      stats.prospects
        .filter((p) => !p.loomVideoUrl && p.status !== "paid" && p.status !== "dismissed")
        .slice(0, 10),
    [stats.prospects],
  );

  // Action queue: prospects past Day 7 enrollment that haven't received a postcard yet.
  const postcardQueue = useMemo(
    () =>
      stats.prospects.filter((p) => {
        if (p.cohortPostcardSentAt) return false;
        if (!p.enrolledAt) return false;
        const dayssin = daysSince(p.enrolledAt);
        return dayssin !== null && dayssin >= 7 && p.status !== "paid" && p.status !== "dismissed";
      }),
    [stats.prospects],
  );

  return (
    <main className="mx-auto max-w-7xl p-6 text-slate-100">
      <header className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">
            Test Cohort
          </p>
          <h1 className="text-2xl font-semibold">{cohortId}</h1>
          <p className="text-sm text-slate-400 mt-1">
            Wave 1 full-stack outreach test · {stats.totalEnrolled} prospects enrolled
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="text-sm text-sky-400 hover:underline"
          >
            ← Dashboard
          </Link>
          <button
            onClick={refresh}
            disabled={refreshing}
            className="rounded-md bg-slate-800 px-3 py-1.5 text-sm hover:bg-slate-700 disabled:opacity-50"
          >
            {refreshing ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </header>

      {error && (
        <div className="mb-4 rounded-md bg-rose-900/40 border border-rose-700 px-4 py-2 text-sm text-rose-200">
          Refresh failed: {error}
        </div>
      )}

      {/* Hero metric tiles */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Tile
          label="Paid Conversions"
          value={`${stats.paid} / ${TARGET_PAID}+`}
          sublabel={`${successPct.toFixed(1)}% conversion`}
          accent={stats.paid >= TARGET_PAID ? "emerald" : "amber"}
        />
        <Tile
          label="Spent"
          value={fmtUsd(stats.totalCostUsd)}
          sublabel={`of ${fmtUsd(BUDGET_CAP)} cap (${budgetUsedPct.toFixed(0)}%)`}
          accent={budgetUsedPct > 80 ? "amber" : "slate"}
        />
        <Tile
          label="Projected ROI"
          value={fmtUsd(projectedRoi)}
          sublabel={`${stats.paid} sales × $997`}
          accent={projectedRoi > 0 ? "emerald" : "slate"}
        />
        <Tile
          label="Cost Per Acquisition"
          value={
            stats.paid > 0 ? fmtUsd(stats.totalCostUsd / stats.paid) : "—"
          }
          sublabel="(spent / paid)"
          accent="slate"
        />
      </section>

      {/* Channel + funnel breakdown */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card title="Email Funnel">
          <Stat label="Sent" value={stats.emailsSent} />
          <Stat
            label="Opened"
            value={stats.emailsOpened}
            sub={
              stats.emailsSent > 0
                ? `${((stats.emailsOpened / stats.emailsSent) * 100).toFixed(1)}% open rate`
                : ""
            }
          />
          <Stat
            label="Clicked"
            value={stats.emailsClicked}
            sub={
              stats.emailsOpened > 0
                ? `${((stats.emailsClicked / stats.emailsOpened) * 100).toFixed(1)}% CTR`
                : ""
            }
          />
          <Stat label="Replied" value={stats.emailsReplied} />
        </Card>

        <Card title="Other Channels">
          <Stat
            label="Postcards Sent"
            value={stats.postcardsSent}
            sub={
              postcardQueue.length > 0
                ? `${postcardQueue.length} ready to send`
                : ""
            }
          />
          <Stat
            label="Looms Recorded"
            value={`${stats.loomsRecorded} / 10`}
            sub={
              loomQueue.length > 0
                ? `${loomQueue.length} in queue`
                : ""
            }
          />
          <Stat label="Voicemails Dropped" value={stats.voicemailsDropped} />
          <Stat
            label="SMS Sent"
            value={0}
            sub="OFF (waiting on A2P 10DLC)"
          />
        </Card>
      </section>

      {/* Status + category + state breakdowns */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card title="By Status">
          {Object.entries(stats.byStatus).map(([k, v]) => (
            <div key={k} className="flex items-center justify-between py-1">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-block h-2 w-2 rounded-full ${STAGE_COLORS[k] || "bg-slate-500"}`}
                />
                <span className="text-sm">{k}</span>
              </div>
              <span className="text-sm font-mono">{v}</span>
            </div>
          ))}
        </Card>
        <Card title="By Category">
          {Object.entries(stats.byCategory)
            .sort((a, b) => b[1] - a[1])
            .map(([k, v]) => (
              <div key={k} className="flex items-center justify-between py-1">
                <span className="text-sm">{k}</span>
                <span className="text-sm font-mono">{v}</span>
              </div>
            ))}
        </Card>
        <Card title="By State">
          {Object.entries(stats.byState).map(([k, v]) => (
            <div key={k} className="flex items-center justify-between py-1">
              <span className="text-sm">{k}</span>
              <span className="text-sm font-mono">{v}</span>
            </div>
          ))}
        </Card>
      </section>

      {/* Action queues */}
      {(loomQueue.length > 0 || postcardQueue.length > 0) && (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {loomQueue.length > 0 && (
            <Card title={`🎬 Loom Queue (top ${loomQueue.length} to record)`}>
              <p className="text-xs text-slate-400 mb-3">
                Record a 60-90 sec Loom walkthrough of each preview. Paste the URL into the prospect's <code>loom_video_url</code> field.
              </p>
              <ul className="space-y-1">
                {loomQueue.map((p) => (
                  <li key={p.id} className="flex items-center justify-between text-sm py-1 border-b border-slate-800/50">
                    <Link
                      href={`/lead/${p.id}`}
                      className="text-sky-400 hover:underline"
                    >
                      {p.businessName}
                    </Link>
                    <span className="text-xs text-slate-500">
                      {p.category} · score {p.qualityScore.toFixed(1)}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
          {postcardQueue.length > 0 && (
            <Card title={`📮 Postcard Queue (${postcardQueue.length} ready)`}>
              <p className="text-xs text-slate-400 mb-3">
                These prospects have crossed Day 7 of enrollment and are queued for the next postcard cron tick (gated on <code>LOB_API_KEY</code>).
              </p>
              <ul className="space-y-1">
                {postcardQueue.slice(0, 15).map((p) => (
                  <li key={p.id} className="flex items-center justify-between text-sm py-1 border-b border-slate-800/50">
                    <Link
                      href={`/lead/${p.id}`}
                      className="text-sky-400 hover:underline"
                    >
                      {p.businessName}
                    </Link>
                    <span className="text-xs text-slate-500">
                      Day {daysSince(p.enrolledAt)}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </section>
      )}

      {/* Per-prospect firehose table */}
      <section className="rounded-lg border border-slate-800 bg-slate-900/30 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
            All Cohort Prospects
          </h2>
          <span className="text-xs text-slate-500">{stats.prospects.length} rows</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-900/60 text-xs uppercase text-slate-400">
              <tr>
                <th className="text-left px-4 py-2">Business</th>
                <th className="text-left px-3 py-2">Category</th>
                <th className="text-left px-3 py-2">Loc</th>
                <th className="text-left px-3 py-2">Status</th>
                <th className="text-left px-3 py-2">Day</th>
                <th className="text-left px-3 py-2">Postcard</th>
                <th className="text-left px-3 py-2">Loom</th>
                <th className="text-left px-3 py-2">Score</th>
              </tr>
            </thead>
            <tbody>
              {stats.prospects.map((p) => (
                <tr key={p.id} className="border-t border-slate-800/60 hover:bg-slate-900/40">
                  <td className="px-4 py-2">
                    <Link href={`/lead/${p.id}`} className="text-sky-400 hover:underline">
                      {p.businessName}
                    </Link>
                  </td>
                  <td className="px-3 py-2 text-slate-400">{p.category}</td>
                  <td className="px-3 py-2 text-slate-400">
                    {p.city}{p.state ? `, ${p.state}` : ""}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                        STAGE_COLORS[p.status] || "bg-slate-700"
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-slate-400 font-mono">
                    {p.enrolledAt ? `${daysSince(p.enrolledAt)}d` : "—"}
                  </td>
                  <td className="px-3 py-2">
                    {p.cohortPostcardSentAt ? (
                      <span className="text-emerald-400 text-xs">✓ {daysSince(p.cohortPostcardSentAt)}d ago</span>
                    ) : (
                      <span className="text-slate-600 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {p.loomVideoUrl ? (
                      <a
                        href={p.loomVideoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sky-400 text-xs hover:underline"
                      >
                        ✓ link
                      </a>
                    ) : (
                      <span className="text-slate-600 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-slate-500 font-mono text-xs">
                    {p.qualityScore.toFixed(1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <footer className="mt-6 pt-4 border-t border-slate-800 text-xs text-slate-500">
        Auto-refreshes every 60s · Targets: ≥{TARGET_PAID} paid / ${BUDGET_CAP} budget / {TARGET_DAYS} days
      </footer>
    </main>
  );
}

function Tile({
  label,
  value,
  sublabel,
  accent,
}: {
  label: string;
  value: string;
  sublabel?: string;
  accent: "emerald" | "amber" | "slate";
}) {
  const accentClass =
    accent === "emerald"
      ? "border-emerald-700 bg-emerald-950/40"
      : accent === "amber"
        ? "border-amber-700 bg-amber-950/40"
        : "border-slate-800 bg-slate-900/30";
  return (
    <div className={`rounded-lg border ${accentClass} p-4`}>
      <p className="text-xs text-slate-400 uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-semibold mt-1">{value}</p>
      {sublabel && <p className="text-xs text-slate-500 mt-1">{sublabel}</p>}
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/30 p-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
        {title}
      </h3>
      {children}
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: number | string; sub?: string }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm text-slate-300">{label}</span>
      <div className="text-right">
        <span className="text-sm font-mono">{value}</span>
        {sub && <p className="text-xs text-slate-500">{sub}</p>}
      </div>
    </div>
  );
}
