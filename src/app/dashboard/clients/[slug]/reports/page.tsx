"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import type { WeeklyReport } from "@/lib/client-reports";

export default function ReportsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [report, setReport] = useState<WeeklyReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const r = await fetch(`/api/client-reports?client=${slug}`);
      const j = (await r.json()) as { ok: boolean; report?: WeeklyReport };
      if (j.ok && j.report) setReport(j.report);
      setLoading(false);
    })();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="text-slate-500">Loading…</div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="text-rose-400">Failed to load report.</div>
      </div>
    );
  }

  return (
    <>
      {/* Tab bar supplied by [slug]/layout via ClientTabsBar — no
          per-page sub-action bar needed (the report itself opens
          with its own week-context line below). */}
      <main className="mx-auto max-w-4xl px-4 sm:px-6 py-6 pb-24 space-y-6">
        <div className="text-[11px] uppercase tracking-wider text-slate-500">
          Week ending {new Date(report.period.end).toDateString()}
        </div>

        <section className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <Stat label="Total leads" value={report.leads.total} />
          <Stat label="New this week" value={report.leads.new_this_week} delta={report.leads.delta_vs_prior_week} />
          <Stat label="Responded" value={report.funnel.responded} suffix={`${report.funnel.response_rate_pct.toFixed(0)}%`} />
          <Stat label="Converted" value={report.funnel.converted} suffix={`${report.funnel.conversion_rate_pct.toFixed(0)}%`} accent="emerald" />
        </section>

        {Object.keys(report.leads.byAudience).length > 0 && (
          <section>
            <h2 className="text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-2">Leads by audience</h2>
            <div className="flex flex-wrap gap-2">
              {Object.entries(report.leads.byAudience).map(([k, v]) => (
                <span key={k} className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded text-sm">
                  <span className="font-bold">{v}</span> <span className="text-slate-500">{k}</span>
                </span>
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-2">Messages this week</h2>
          <div className="grid grid-cols-3 gap-2 mb-2">
            <Stat label="Sent" value={report.messages.sent} accent="blue" />
            <Stat label="Failed" value={report.messages.failed} accent="rose" />
            <Stat label="Skipped" value={report.messages.skipped} accent="amber" />
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(report.messages.by_channel).map(([k, v]) => (
              <span key={k} className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded text-sm">
                <span className="font-bold">{v}</span> <span className="text-slate-500">{k}</span>
              </span>
            ))}
          </div>
        </section>

        {report.ads && (
          <section>
            <h2 className="text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-2">Ads</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <Stat label="Live" value={report.ads.live} accent="emerald" />
              <Stat label="Draft" value={report.ads.draft} />
              <Stat label="Impressions" value={report.ads.impressions.toLocaleString() as unknown as number} />
              <Stat label="CTR" value={`${report.ads.ctr_pct.toFixed(2)}%` as unknown as number} accent="blue" />
            </div>
          </section>
        )}

        {report.affiliates && (
          <section>
            <h2 className="text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-2">Affiliates</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <Stat label="Total" value={report.affiliates.total} />
              <Stat label="Contacted (wk)" value={report.affiliates.contacted_this_week} accent="blue" />
              <Stat label="Onboarded (wk)" value={report.affiliates.onboarded_this_week} accent="emerald" />
            </div>
          </section>
        )}

        {report.highlights.length > 0 && (
          <section>
            <h2 className="text-[11px] uppercase tracking-wider font-bold text-emerald-400 mb-2">Highlights</h2>
            <ul className="space-y-1.5 text-sm">
              {report.highlights.map((h) => (
                <li key={h} className="flex gap-2 text-slate-200">
                  <span className="text-emerald-500">→</span>{h}
                </li>
              ))}
            </ul>
          </section>
        )}

        {report.next_actions.length > 0 && (
          <section>
            <h2 className="text-[11px] uppercase tracking-wider font-bold text-amber-400 mb-2">Suggested next actions</h2>
            <ul className="space-y-1.5 text-sm">
              {report.next_actions.map((a) => (
                <li key={a} className="flex gap-2 text-slate-200">
                  <span className="text-amber-400">→</span>{a}
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </>
  );
}

function Stat({
  label,
  value,
  delta,
  suffix,
  accent = "slate",
}: {
  label: string;
  value: number | string;
  delta?: number;
  suffix?: string;
  accent?: "slate" | "blue" | "emerald" | "amber" | "rose";
}) {
  const colors: Record<string, string> = {
    slate: "bg-slate-900 border-slate-800",
    blue: "bg-blue-950/40 border-blue-500/30",
    emerald: "bg-emerald-950/40 border-emerald-500/30",
    amber: "bg-amber-950/40 border-amber-500/30",
    rose: "bg-rose-950/40 border-rose-500/30",
  };
  return (
    <div className={`rounded-lg border p-3 ${colors[accent]}`}>
      <div className="text-[10px] tracking-wider uppercase font-bold text-slate-400">{label}</div>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="text-2xl font-black tracking-tighter">{value}</span>
        {suffix && <span className="text-xs text-slate-400">{suffix}</span>}
        {delta !== undefined && (
          <span className={`text-[10px] font-bold ${delta >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
            {delta >= 0 ? "+" : ""}{delta}
          </span>
        )}
      </div>
    </div>
  );
}
