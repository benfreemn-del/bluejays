/**
 * /dashboard/ai-activity — Ben-only AI spend + activity dashboard.
 *
 * Backed by getFullStats() from src/lib/ai-activity/aggregate.ts.
 * Same data the `bj ai stats` CLI consumes, just rendered visually
 * instead of as terminal text.
 *
 * Sections:
 *   1. Headline tiles (today's burn, breakdown, call count)
 *   2. 14-day trend (inline SVG bar chart — no dep)
 *   3. By-service table (top 15)
 *   4. Skill caps status (with progress bars)
 *   5. Top 10 most-expensive calls today
 *
 * Server component — fetches on every load. Use ?hours= and ?days=
 * query params to change window. Gated by middleware (route is under
 * /dashboard so admin session required).
 */

import { getFullStats } from "@/lib/ai-activity/aggregate";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "AI Activity — BlueJays Dashboard",
  robots: { index: false, follow: false },
};

const fmt = (n: number) =>
  n.toLocaleString("en-US", {
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  });
const fmtBig = (n: number) =>
  n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
const fmtInt = (n: number) =>
  n.toLocaleString("en-US", { maximumFractionDigits: 0 });

type Search = { hours?: string; days?: string };

export default async function AiActivityPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const sp = await searchParams;
  const hours = Math.max(1, Math.min(720, Number(sp.hours) || 24));
  const days = Math.max(1, Math.min(90, Number(sp.days) || 14));

  const stats = await getFullStats(hours, days);
  const t = stats.totals;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10 bg-slate-900/40">
        <div className="mx-auto max-w-6xl px-6 py-5 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="text-sm text-slate-400 hover:text-white transition-colors"
          >
            ← Dashboard
          </Link>
          <h1 className="text-base font-semibold text-white">AI Activity</h1>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>window:</span>
            {[6, 24, 72, 168, 720].map((h) => (
              <Link
                key={h}
                href={`?hours=${h}&days=${days}`}
                className={`px-2 py-1 rounded ${
                  hours === h
                    ? "bg-sky-500/20 text-sky-200 border border-sky-500/40"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {h === 6 ? "6h" : h === 24 ? "24h" : h === 72 ? "3d" : h === 168 ? "7d" : "30d"}
              </Link>
            ))}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-8 space-y-8">
        {/* ── Headline tiles ───────────────────────────────────── */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Tile
            label="Total spend"
            value={`$${fmtBig(t.grandTotalUsd)}`}
            sub={`${fmtInt(t.callCount)} calls · last ${hours}h`}
            accent="amber"
          />
          <Tile
            label="🤖 AI compute"
            value={`$${fmtBig(t.aiComputeUsd)}`}
            sub={t.grandTotalUsd > 0 ? `${((t.aiComputeUsd / t.grandTotalUsd) * 100).toFixed(0)}% of spend` : "—"}
            accent="sky"
          />
          <Tile
            label="🔧 Infrastructure"
            value={`$${fmtBig(t.infrastructureUsd)}`}
            sub={t.grandTotalUsd > 0 ? `${((t.infrastructureUsd / t.grandTotalUsd) * 100).toFixed(0)}% of spend` : "—"}
            accent="emerald"
          />
          <Tile
            label="bj ai runs"
            value={fmtInt(
              stats.skillStats.successful +
                stats.skillStats.failed +
                stats.skillStats.noWork,
            )}
            sub={`${stats.skillStats.successful} ok · ${stats.skillStats.failed} failed · ${stats.skillStats.noWork} no-work`}
            accent="violet"
          />
        </section>

        {/* ── Trend chart ─────────────────────────────────────── */}
        <section className="rounded-2xl border border-white/10 bg-slate-900/40 p-6">
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="text-base font-semibold text-white">
              {days}-day burn trend
            </h2>
            <span className="text-xs text-slate-500">
              total ${fmtBig(stats.trend.reduce((s, d) => s + d.costUsd, 0))}
              {" · "}
              avg $
              {fmtBig(
                stats.trend.length > 0
                  ? stats.trend.reduce((s, d) => s + d.costUsd, 0) /
                      stats.trend.length
                  : 0,
              )}
              /day
            </span>
          </div>
          <TrendChart trend={stats.trend} />
        </section>

        {/* ── By-service table ────────────────────────────────── */}
        <section className="rounded-2xl border border-white/10 bg-slate-900/40 overflow-hidden">
          <div className="px-6 py-4 border-b border-white/10">
            <h2 className="text-base font-semibold text-white">
              By service · last {hours}h
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {stats.byService.length} services with activity
            </p>
          </div>
          {stats.byService.length === 0 ? (
            <p className="px-6 py-8 text-center text-slate-500 text-sm">
              No costs logged in this window.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-2 font-medium">Service</th>
                  <th className="px-6 py-2 font-medium text-right">Calls</th>
                  <th className="px-6 py-2 font-medium text-right">Spend</th>
                  <th className="px-6 py-2 font-medium text-right">%</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {stats.byService.slice(0, 15).map((row) => {
                  const tag =
                    row.category === "ai_compute"
                      ? "🤖"
                      : row.category === "infrastructure"
                        ? "🔧"
                        : "·";
                  const pct =
                    t.grandTotalUsd > 0
                      ? (row.costUsd / t.grandTotalUsd) * 100
                      : 0;
                  return (
                    <tr key={row.service} className="hover:bg-white/[0.02]">
                      <td className="px-6 py-3">
                        <span className="mr-2 opacity-70">{tag}</span>
                        <span className="text-white font-medium">{row.label}</span>
                        <span className="text-slate-600 text-xs ml-2 font-mono">
                          {row.service}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-right text-slate-400 tabular-nums">
                        {fmtInt(row.callCount)}
                      </td>
                      <td className="px-6 py-3 text-right text-white tabular-nums">
                        ${fmt(row.costUsd)}
                      </td>
                      <td className="px-6 py-3 text-right text-slate-500 tabular-nums">
                        {pct.toFixed(1)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </section>

        {/* ── Skill caps status ───────────────────────────────── */}
        {stats.caps.length > 0 && (
          <section className="rounded-2xl border border-white/10 bg-slate-900/40 overflow-hidden">
            <div className="px-6 py-4 border-b border-white/10">
              <h2 className="text-base font-semibold text-white">
                bj ai skill caps · today
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Daily $-cap per skill (resets midnight UTC). Cap hits = how
                many runs were refused today.
              </p>
            </div>
            <div className="px-6 py-4 space-y-3">
              {stats.caps.map((c) => {
                const barColor =
                  c.pct >= 90
                    ? "bg-rose-500"
                    : c.pct >= 60
                      ? "bg-amber-500"
                      : "bg-emerald-500";
                return (
                  <div key={c.skill}>
                    <div className="flex items-baseline justify-between text-xs mb-1">
                      <span className="text-white font-mono">{c.skill}</span>
                      <span className="text-slate-400">
                        ${fmt(c.spentTodayUsd)} / ${fmtBig(c.dailyCapUsd)}
                        {c.capHitsToday > 0 && (
                          <span className="ml-2 text-rose-300">
                            ⚠ {c.capHitsToday} cap hits
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${barColor} transition-all duration-700 ease-out`}
                        style={{ width: `${Math.min(100, c.pct)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── Top calls table ─────────────────────────────────── */}
        {stats.topCalls.length > 0 && (
          <section className="rounded-2xl border border-white/10 bg-slate-900/40 overflow-hidden">
            <div className="px-6 py-4 border-b border-white/10">
              <h2 className="text-base font-semibold text-white">
                Most expensive calls · last {hours}h
              </h2>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-2 font-medium">When</th>
                  <th className="px-6 py-2 font-medium">Service</th>
                  <th className="px-6 py-2 font-medium">Action</th>
                  <th className="px-6 py-2 font-medium text-right">Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {stats.topCalls.map((call, i) => (
                  <tr key={i} className="hover:bg-white/[0.02]">
                    <td className="px-6 py-2.5 text-slate-400 font-mono text-xs">
                      {new Date(call.createdAt).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-6 py-2.5 text-white">{call.service}</td>
                    <td className="px-6 py-2.5 text-slate-400 text-xs">
                      {call.action || "—"}
                    </td>
                    <td className="px-6 py-2.5 text-right text-white tabular-nums">
                      ${fmt(call.costUsd)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        <p className="text-center text-xs text-slate-600 pt-4">
          Generated {new Date(stats.generatedAt).toLocaleString()} · CLI
          equivalent: <code className="font-mono text-slate-500">bj ai stats</code>
        </p>
      </div>
    </main>
  );
}

// ── Components ────────────────────────────────────────────────────

function Tile({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub: string;
  accent: "amber" | "sky" | "emerald" | "violet";
}) {
  const ringColor = {
    amber: "border-amber-500/20 bg-amber-500/[0.04]",
    sky: "border-sky-500/20 bg-sky-500/[0.04]",
    emerald: "border-emerald-500/20 bg-emerald-500/[0.04]",
    violet: "border-violet-500/20 bg-violet-500/[0.04]",
  }[accent];
  const textColor = {
    amber: "text-amber-300",
    sky: "text-sky-300",
    emerald: "text-emerald-300",
    violet: "text-violet-300",
  }[accent];
  return (
    <div className={`rounded-2xl border ${ringColor} p-5`}>
      <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2">
        {label}
      </p>
      <p className={`text-3xl font-black tabular-nums ${textColor}`}>{value}</p>
      <p className="text-xs text-slate-500 mt-2">{sub}</p>
    </div>
  );
}

function TrendChart({
  trend,
}: {
  trend: { date: string; costUsd: number }[];
}) {
  if (trend.length === 0) {
    return (
      <p className="text-sm text-slate-500 text-center py-8">
        No trend data in window.
      </p>
    );
  }
  const max = Math.max(...trend.map((d) => d.costUsd), 0.0001);
  return (
    <div className="space-y-1.5">
      <div className="flex items-end gap-1 h-32">
        {trend.map((d) => {
          const heightPct = (d.costUsd / max) * 100;
          return (
            <div
              key={d.date}
              className="flex-1 flex flex-col items-center justify-end h-full group relative"
            >
              <div
                className="w-full bg-gradient-to-t from-sky-600 to-sky-400 rounded-t-sm transition-all hover:from-sky-500 hover:to-sky-300"
                style={{ height: `${Math.max(2, heightPct)}%` }}
                title={`${d.date} — $${fmt(d.costUsd)}`}
              />
              <div className="hidden group-hover:block absolute -top-8 bg-slate-800 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap">
                ${fmt(d.costUsd)}
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex items-end gap-1">
        {trend.map((d, i) => {
          // Show date label only for ~5 evenly-spaced days to avoid crowding
          const showLabel =
            trend.length <= 7 ||
            i === 0 ||
            i === trend.length - 1 ||
            i === Math.floor(trend.length / 2) ||
            i === Math.floor(trend.length / 4) ||
            i === Math.floor((trend.length * 3) / 4);
          return (
            <div
              key={d.date}
              className="flex-1 text-[10px] text-slate-600 font-mono text-center"
            >
              {showLabel ? d.date.slice(5) : ""}
            </div>
          );
        })}
      </div>
    </div>
  );
}
