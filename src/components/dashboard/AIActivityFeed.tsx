"use client";

import { useEffect, useState } from "react";

/**
 * AIActivityFeed — cross-client AI activity surface for
 * /dashboard/ai-bots. Replaces the static flowchart visualizer with
 * live data showing every AI skill run + cost attribution over the
 * last 7 days.
 *
 * Per dashboard review #5 — proves "the AI is doing real work" to
 * existing AI System clients (retention asset) and functions as a
 * sales asset for new Pro-tier pitches ("here's what your AI Operator
 * runs every week").
 *
 * Reads /api/ai-activity. Auto-refreshes every 60s.
 */

type ServiceStat = { runs: number; costUsd: number };

type Activity = {
  totalCostUsd: number;
  totalRuns: number;
  failedRuns: number;
  byService: Record<string, ServiceStat>;
  byClient: Record<string, ServiceStat>;
  byDay: Record<string, ServiceStat>;
  recent: Array<{
    id: string;
    service: string;
    serviceLabel: string;
    action: string;
    costUsd: number;
    clientSlug: string | null;
    status: string;
    createdAt: string;
  }>;
};

const CLIENT_DISPLAY_NAMES: Record<string, string> = {
  "zenith-sports": "Zenith / Tekky",
  "itc-quick-attach": "ITC Quick Attach",
  "laser-lakes": "Laser Lakes",
  "olympic-inspections": "Olympic Inspections",
  "_shared": "Cross-client / BlueJays",
};

export default function AIActivityFeed() {
  const [data, setData] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const r = await fetch("/api/ai-activity", { credentials: "include" });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const j = (await r.json()) as Activity;
        if (!cancelled) {
          setData(j);
          setLoading(false);
        }
      } catch (err) {
        console.warn("[AIActivityFeed]", err);
        if (!cancelled) setLoading(false);
      }
    };
    load();
    const t = setInterval(load, 60_000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, []);

  if (loading || !data) {
    return (
      <div className="rounded-xl border border-white/[0.06] bg-slate-900/40 p-4 text-[11px] text-slate-500">
        Loading AI activity…
      </div>
    );
  }

  const services = Object.entries(data.byService).sort(
    (a, b) => b[1].runs - a[1].runs,
  );
  const clients = Object.entries(data.byClient).sort(
    (a, b) => b[1].runs - a[1].runs,
  );
  const days = Object.entries(data.byDay).sort(([a], [b]) =>
    a.localeCompare(b),
  );

  const successRate =
    data.totalRuns === 0
      ? 0
      : Math.round(((data.totalRuns - data.failedRuns) / data.totalRuns) * 100);

  return (
    <div className="space-y-6">
      {/* Hero stats */}
      <section className="rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-950/40 via-slate-900/50 to-slate-900/40 p-6">
        <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-violet-300 mb-2">
          Last 7 days · cross-client AI activity
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Stat
            label="Total runs"
            value={String(data.totalRuns)}
            tone="violet"
          />
          <Stat
            label="Total cost"
            value={`$${data.totalCostUsd.toFixed(2)}`}
            tone="emerald"
          />
          <Stat
            label="Success rate"
            value={`${successRate}%`}
            tone={successRate >= 95 ? "emerald" : successRate >= 80 ? "amber" : "rose"}
          />
          <Stat
            label="Failed runs"
            value={String(data.failedRuns)}
            tone={data.failedRuns === 0 ? "slate" : "rose"}
          />
        </div>
      </section>

      {data.totalRuns === 0 && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/[0.06] p-4 text-sm text-amber-200">
          No AI activity logged in the last 7 days yet. As per-client AI
          Operator skills come online (Drill Drafter is the first — currently
          training), runs will populate this feed automatically. Each call
          logs via{" "}
          <code className="text-amber-300">logCost()</code> with{" "}
          <code className="text-amber-300">client_slug</code> attribution.
        </div>
      )}

      {/* Per-service breakdown */}
      {services.length > 0 && (
        <section>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">
            By service · skill
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {services.map(([service, stat]) => (
              <ServiceCard key={service} service={service} stat={stat} />
            ))}
          </div>
        </section>
      )}

      {/* Per-client breakdown */}
      {clients.length > 0 && (
        <section>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">
            By client
          </h2>
          <div className="rounded-xl border border-white/[0.06] bg-slate-900/40 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-900/80 text-[10px] uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="text-left px-4 py-2 font-semibold">Client</th>
                  <th className="text-right px-4 py-2 font-semibold">Runs</th>
                  <th className="text-right px-4 py-2 font-semibold">Cost</th>
                  <th className="text-right px-4 py-2 font-semibold">% of total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {clients.map(([client, stat]) => {
                  const name =
                    CLIENT_DISPLAY_NAMES[client] ?? client;
                  const pct =
                    data.totalCostUsd === 0
                      ? 0
                      : Math.round((stat.costUsd / data.totalCostUsd) * 100);
                  return (
                    <tr key={client} className="hover:bg-slate-900/60">
                      <td className="px-4 py-2.5">
                        <span className="font-semibold text-white">{name}</span>
                        {client !== "_shared" && (
                          <span className="text-[10px] text-slate-500 ml-2 font-mono">
                            {client}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-slate-300">
                        {stat.runs}
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-slate-300">
                        ${stat.costUsd.toFixed(2)}
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-slate-500">
                        {pct}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Daily sparkline */}
      {days.length > 0 && (
        <section>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">
            Daily volume
          </h2>
          <DailyBars days={days} />
        </section>
      )}

      {/* Recent activity timeline */}
      {data.recent.length > 0 && (
        <section>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">
            Recent runs · last 50
          </h2>
          <div className="rounded-xl border border-white/[0.06] bg-slate-900/40 overflow-hidden">
            <ul className="divide-y divide-white/[0.04]">
              {data.recent.map((r) => (
                <li
                  key={r.id}
                  className="px-4 py-2 flex items-center gap-3 text-sm hover:bg-slate-900/60"
                >
                  <span
                    className={`inline-block w-2 h-2 rounded-full shrink-0 ${
                      r.status === "failed"
                        ? "bg-rose-400"
                        : r.status === "success"
                          ? "bg-emerald-400"
                          : "bg-slate-500"
                    }`}
                  />
                  <span className="text-slate-200 font-medium truncate flex-1 min-w-0">
                    {r.serviceLabel}
                    <span className="text-slate-500 font-normal ml-1.5">
                      · {r.action}
                    </span>
                  </span>
                  {r.clientSlug && (
                    <span className="text-[10px] uppercase tracking-wider font-bold rounded border border-violet-500/30 bg-violet-500/[0.08] text-violet-200 px-1.5 py-0.5 whitespace-nowrap">
                      {CLIENT_DISPLAY_NAMES[r.clientSlug] ?? r.clientSlug}
                    </span>
                  )}
                  <span className="text-[11px] text-slate-500 tabular-nums whitespace-nowrap">
                    ${r.costUsd.toFixed(4)}
                  </span>
                  <span className="text-[10px] text-slate-600 tabular-nums whitespace-nowrap hidden sm:inline">
                    {timeAgo(r.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "violet" | "emerald" | "amber" | "rose" | "slate";
}) {
  const cls =
    tone === "violet"
      ? "border-violet-500/30 bg-violet-500/[0.06] text-violet-200"
      : tone === "emerald"
        ? "border-emerald-500/30 bg-emerald-500/[0.06] text-emerald-200"
        : tone === "amber"
          ? "border-amber-500/30 bg-amber-500/[0.06] text-amber-200"
          : tone === "rose"
            ? "border-rose-500/30 bg-rose-500/[0.06] text-rose-200"
            : "border-slate-700 bg-slate-800/40 text-slate-300";
  return (
    <div className={`rounded-lg border ${cls} px-4 py-2.5`}>
      <p className="text-[10px] uppercase tracking-wider font-bold opacity-80">
        {label}
      </p>
      <p className="text-2xl font-black tabular-nums mt-0.5">{value}</p>
    </div>
  );
}

function ServiceCard({
  service,
  stat,
}: {
  service: string;
  stat: ServiceStat;
}) {
  const label = formatServiceName(service);
  return (
    <div className="rounded-xl border border-white/[0.06] bg-slate-900/30 p-4 flex items-baseline justify-between gap-3">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-white truncate">{label}</p>
        <p className="text-[11px] text-slate-500 font-mono truncate">{service}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-xl font-black tabular-nums text-violet-200">
          {stat.runs}
        </p>
        <p className="text-[11px] text-slate-500 tabular-nums">
          ${stat.costUsd.toFixed(2)}
        </p>
      </div>
    </div>
  );
}

function DailyBars({ days }: { days: Array<[string, ServiceStat]> }) {
  const max = Math.max(1, ...days.map(([, s]) => s.runs));
  return (
    <div className="rounded-xl border border-white/[0.06] bg-slate-900/30 p-4">
      <div className="flex items-end justify-between gap-2 h-32">
        {days.map(([day, stat]) => {
          const heightPct = (stat.runs / max) * 100;
          return (
            <div
              key={day}
              className="flex-1 flex flex-col items-center gap-1 min-w-0"
              title={`${day}: ${stat.runs} runs · $${stat.costUsd.toFixed(2)}`}
            >
              <div className="flex-1 w-full flex flex-col justify-end">
                <div
                  className="w-full bg-gradient-to-t from-violet-600 to-fuchsia-500 rounded-t"
                  style={{ height: `${Math.max(2, heightPct)}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-500 tabular-nums">
                {stat.runs}
              </p>
              <p className="text-[9px] text-slate-600 tabular-nums truncate w-full text-center">
                {day.slice(5)}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function formatServiceName(service: string): string {
  const labels: Record<string, string> = {
    claude_sales_response: "Sales Response · Claude",
    openai_sales_response: "Sales Response · GPT",
    openai_proposal_generation: "Proposal Drafter",
    perplexity_research: "Lead Research",
    perplexity_pitch: "Pitch Research",
  };
  return (
    labels[service] ??
    service
      .split("_")
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join(" ")
  );
}

function timeAgo(iso: string): string {
  const ts = Date.parse(iso);
  if (!ts) return "—";
  const seconds = Math.floor((Date.now() - ts) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
