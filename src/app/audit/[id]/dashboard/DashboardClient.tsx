"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type {
  MockBackendData,
  Lead,
  Funnel,
  FunnelStep,
} from "@/lib/mock-backend/generator";

type TabId = "overview" | "leads" | "map" | "funnels";

const TABS: { id: TabId; label: string; emoji: string }[] = [
  { id: "overview", label: "Overview", emoji: "📊" },
  { id: "leads", label: "Leads", emoji: "📥" },
  { id: "map", label: "Map", emoji: "📍" },
  { id: "funnels", label: "Funnels", emoji: "🎯" },
];

const STATUS_TONES: Record<string, string> = {
  new: "bg-sky-500/15 text-sky-300 border-sky-500/30",
  contacted: "bg-violet-500/15 text-violet-300 border-violet-500/30",
  quote_sent: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  follow_up: "bg-slate-500/15 text-slate-300 border-slate-500/30",
  won: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  lost: "bg-rose-500/15 text-rose-300 border-rose-500/30",
};

const STATUS_LABELS: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  quote_sent: "Quote sent",
  follow_up: "Follow up",
  won: "Won",
  lost: "Lost",
};

const PASSWORD = "1212";
const PASSWORD_COOKIE = "bj_demo_unlocked";

export default function DashboardClient({
  data,
  auditId,
  prospectId,
}: {
  data: MockBackendData;
  auditId: string;
  prospectId: string;
}) {
  const [unlocked, setUnlocked] = useState(false);
  const [tab, setTab] = useState<TabId>("overview");

  useEffect(() => {
    if (typeof document !== "undefined" && document.cookie.includes(`${PASSWORD_COOKIE}=1`)) {
      setUnlocked(true);
    }
  }, []);

  const handleUnlock = (input: string) => {
    if (input.trim() === PASSWORD) {
      document.cookie = `${PASSWORD_COOKIE}=1; path=/; max-age=86400; samesite=lax`;
      setUnlocked(true);
      return true;
    }
    return false;
  };

  if (!unlocked) {
    return <PasswordGate businessName={data.business.name} onUnlock={handleUnlock} />;
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <Header data={data} auditId={auditId} prospectId={prospectId} />
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6">
        <Tabs current={tab} onChange={setTab} accent={data.business.accentHex} />
        <div className="mt-6">
          {tab === "overview" && <OverviewTab data={data} />}
          {tab === "leads" && <LeadsTab data={data} />}
          {tab === "map" && <MapTab data={data} />}
          {tab === "funnels" && <FunnelsTab data={data} />}
        </div>
      </div>
      <Footer prospectId={prospectId} />
    </main>
  );
}

function PasswordGate({
  businessName,
  onUnlock,
}: {
  businessName: string;
  onUnlock: (input: string) => boolean;
}) {
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-6">
      <div className="max-w-sm w-full text-center">
        <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500 font-bold mb-3">
          BlueJays · Demo
        </p>
        <h1 className="text-2xl font-bold text-white mb-2">
          {businessName} — AI System Preview
        </h1>
        <p className="text-sm text-slate-400 mb-6">
          A live preview of the dashboard you&apos;d log into. Type the demo
          code to unlock.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const ok = onUnlock(value);
            if (!ok) setError(true);
          }}
          className="space-y-3"
        >
          <input
            inputMode="numeric"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setError(false);
            }}
            placeholder="Demo code"
            className={`w-full text-center text-2xl font-mono tracking-[0.4em] px-4 py-3 rounded-lg bg-slate-900 text-white placeholder:text-slate-700 border ${
              error ? "border-rose-500" : "border-slate-800 focus:border-slate-500"
            } focus:outline-none`}
            autoFocus
          />
          {error && (
            <p className="text-xs text-rose-400">
              Try again. Hint: it&apos;s the same 4 digits everywhere.
            </p>
          )}
          <button
            type="submit"
            className="w-full px-4 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm"
          >
            Unlock dashboard
          </button>
        </form>
        <p className="text-[11px] text-slate-600 mt-6">
          This is a preview — every number is mock, but the dashboard is exactly
          what Ben builds for paying clients.
        </p>
      </div>
    </main>
  );
}

function Header({
  data,
  auditId,
  prospectId,
}: {
  data: MockBackendData;
  auditId: string;
  prospectId: string;
}) {
  return (
    <header className="border-b border-slate-800 bg-slate-900/40 backdrop-blur sticky top-0 z-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500 font-bold">
            {data.business.categoryLabel}
          </p>
          <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
            {data.business.name}{" "}
            <span className="text-slate-500 font-normal">· {data.business.city}, {data.business.state}</span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/audit/${auditId}`}
            className="text-[11px] text-slate-400 hover:text-white font-semibold whitespace-nowrap"
          >
            ← Back to audit
          </Link>
          <Link
            href={`/schedule/${prospectId}?type=fullsystem&source=mock-dashboard`}
            className="hidden sm:inline-flex items-center px-3 py-1.5 rounded-md text-xs font-bold text-slate-950 whitespace-nowrap"
            style={{ background: data.business.accentHex }}
          >
            Make this real →
          </Link>
        </div>
      </div>
    </header>
  );
}

function Tabs({
  current,
  onChange,
  accent,
}: {
  current: TabId;
  onChange: (t: TabId) => void;
  accent: string;
}) {
  return (
    <nav className="flex gap-1 sm:gap-2 overflow-x-auto border-b border-slate-800 -mx-1 px-1">
      {TABS.map((t) => {
        const active = current === t.id;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            className={`px-4 py-2.5 text-sm font-semibold whitespace-nowrap border-b-2 -mb-px transition ${
              active
                ? "text-white"
                : "border-transparent text-slate-500 hover:text-slate-300"
            }`}
            style={active ? { borderColor: accent, color: "white" } : undefined}
          >
            <span className="mr-1.5">{t.emoji}</span>
            {t.label}
          </button>
        );
      })}
    </nav>
  );
}

function Stat({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
      <p className="text-[10px] tracking-[0.22em] uppercase font-bold text-slate-500">
        {label}
      </p>
      <p
        className="mt-1 text-2xl font-black tabular-nums"
        style={{ color: accent || "white" }}
      >
        {value}
      </p>
      {sub && <p className="text-[11px] text-slate-500 mt-0.5">{sub}</p>}
    </div>
  );
}

function OverviewTab({ data }: { data: MockBackendData }) {
  const { overview, leads, business } = data;
  const recentLeads = leads.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Stat label="Leads / month" value={String(overview.leadsThisMonth)} accent={business.accentHex} />
        <Stat label="Closed" value={String(overview.closedThisMonth)} accent="#10b981" />
        <Stat label="Close rate" value={`${overview.closeRatePct}%`} />
        <Stat label="Pipeline value" value={`$${(overview.pipelineValueUsd / 1000).toFixed(1)}k`} />
        <Stat label="Avg ticket" value={`$${overview.avgTicketUsd.toLocaleString()}`} />
        <Stat label="Active affiliates" value={String(overview.activeAffiliates)} />
      </div>

      <section className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-white">
            Top 5 hottest leads right now
          </h2>
          <p className="text-[11px] text-slate-500">
            Scored by AI · refreshed daily
          </p>
        </div>
        <ul className="divide-y divide-slate-800">
          {recentLeads.map((lead) => (
            <li
              key={lead.id}
              className="py-2.5 flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {lead.contactName}
                  {lead.businessName && (
                    <span className="text-slate-500 font-normal">
                      {" "}· {lead.businessName}
                    </span>
                  )}
                </p>
                <p className="text-[11px] text-slate-500 truncate">
                  {lead.signals.slice(0, 2).join(" · ") || lead.source}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <ScorePill score={lead.score} accent={business.accentHex} />
                <span className="text-xs font-mono text-slate-400 tabular-nums">
                  ${(lead.estimatedValue / 1000).toFixed(1)}k
                </span>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
        <h2 className="text-sm font-bold text-white mb-2">What you&apos;re looking at</h2>
        <p className="text-sm text-slate-300 leading-relaxed">
          This is the live operator dashboard for the BlueJays AI Marketing System —
          the same surface our paying clients log into every morning.
          The numbers below are mock data shaped to {business.name}&apos;s industry.
          The interface, the funnels, the lead-scoring logic, the affiliate
          tracking — all of that ships as part of the $10,000 AI System.
        </p>
      </section>
    </div>
  );
}

function ScorePill({ score, accent }: { score: number; accent: string }) {
  const tone =
    score >= 80
      ? { bg: "rgba(16, 185, 129, 0.15)", color: "#34d399", border: "rgba(16, 185, 129, 0.3)" }
      : score >= 60
        ? { bg: `${accent}26`, color: accent, border: `${accent}66` }
        : { bg: "rgba(100, 116, 139, 0.15)", color: "#94a3b8", border: "rgba(100, 116, 139, 0.3)" };
  return (
    <span
      className="text-[11px] font-bold tabular-nums px-2 py-0.5 rounded-full border"
      style={{ backgroundColor: tone.bg, color: tone.color, borderColor: tone.border }}
    >
      {score}
    </span>
  );
}

function LeadsTab({ data }: { data: MockBackendData }) {
  const { leads, business } = data;
  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/40">
      <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between">
        <h2 className="text-sm font-bold text-white">Leads</h2>
        <p className="text-[11px] text-slate-500">{leads.length} in last 30 days</p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-[10px] uppercase tracking-[0.16em] font-bold text-slate-500 bg-slate-950/40">
              <th className="px-3 py-2 text-left">Contact</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-right">Score</th>
              <th className="px-3 py-2 text-right">Est. value</th>
              <th className="px-3 py-2 text-left">Signals</th>
              <th className="px-3 py-2 text-right">Source</th>
              <th className="px-3 py-2 text-right">Age</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr
                key={lead.id}
                className="border-t border-slate-800 hover:bg-slate-800/40 transition-colors"
              >
                <td className="px-3 py-2.5">
                  <p className="font-semibold text-white">{lead.contactName}</p>
                  {lead.businessName && (
                    <p className="text-[11px] text-slate-500">{lead.businessName}</p>
                  )}
                </td>
                <td className="px-3 py-2.5">
                  <span
                    className={`inline-flex items-center text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full border ${
                      STATUS_TONES[lead.status]
                    }`}
                  >
                    {STATUS_LABELS[lead.status]}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-right">
                  <ScorePill score={lead.score} accent={business.accentHex} />
                </td>
                <td className="px-3 py-2.5 text-right font-mono tabular-nums text-slate-300">
                  ${(lead.estimatedValue / 1000).toFixed(1)}k
                </td>
                <td className="px-3 py-2.5 text-[11px] text-slate-400">
                  {lead.signals.length ? lead.signals.slice(0, 2).join(" · ") : "—"}
                </td>
                <td className="px-3 py-2.5 text-right text-[11px] text-slate-500">
                  {lead.source}
                </td>
                <td className="px-3 py-2.5 text-right text-[11px] text-slate-500">
                  {lead.createdAtDaysAgo === 0 ? "today" : `${lead.createdAtDaysAgo}d`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function MapTab({ data }: { data: MockBackendData }) {
  const { map, business } = data;
  const maxLeads = Math.max(...map.markers.map((m) => m.leadCount));
  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-white">Service area</h2>
        <p className="text-[11px] text-slate-500">{business.city}, {business.state} + nearby</p>
      </div>
      <div className="relative aspect-[2/1] rounded-lg overflow-hidden bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800">
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, rgba(148,163,184,0.06) 0, rgba(148,163,184,0.06) 1px, transparent 1px, transparent 22px), repeating-linear-gradient(-45deg, rgba(148,163,184,0.06) 0, rgba(148,163,184,0.06) 1px, transparent 1px, transparent 22px)",
        }} />
        {map.markers.map((m, i) => {
          const xPct = 12 + (i * 17) + (m.isHome ? 0 : 3);
          const yPct = 28 + (i * 11) + (m.isHome ? -5 : 0);
          const size = 12 + (m.leadCount / maxLeads) * 36;
          return (
            <div
              key={m.city}
              className="absolute flex flex-col items-center"
              style={{ left: `${xPct}%`, top: `${yPct}%`, transform: "translate(-50%, -50%)" }}
            >
              <div
                className="rounded-full animate-pulse"
                style={{
                  width: size,
                  height: size,
                  backgroundColor: m.isHome ? business.accentHex : "rgba(148, 163, 184, 0.4)",
                  boxShadow: m.isHome ? `0 0 24px ${business.accentHex}66` : undefined,
                }}
              />
              <span className="mt-1 text-[10px] font-bold text-white whitespace-nowrap">
                {m.city} <span className="text-slate-400 font-normal">· {m.leadCount}</span>
              </span>
            </div>
          );
        })}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {map.markers.map((m) => (
          <div
            key={m.city}
            className="rounded-lg border border-slate-800 bg-slate-950/40 px-3 py-2"
          >
            <p className="text-[10px] tracking-[0.18em] uppercase font-bold text-slate-500">
              {m.isHome ? "Home" : "Nearby"}
            </p>
            <p className="text-sm font-bold text-white truncate">{m.city}</p>
            <p className="text-[11px] text-slate-400">{m.leadCount} leads</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function FunnelsTab({ data }: { data: MockBackendData }) {
  return (
    <section className="space-y-4">
      {data.funnels.map((funnel) => (
        <FunnelCard key={funnel.id} funnel={funnel} accent={data.business.accentHex} />
      ))}
    </section>
  );
}

function FunnelCard({ funnel, accent }: { funnel: Funnel; accent: string }) {
  return (
    <article className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <h3 className="text-base font-bold text-white">{funnel.name}</h3>
          <p className="text-[11px] text-slate-500">{funnel.audience}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span
            className={`inline-flex items-center text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full border ${
              funnel.status === "running"
                ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                : "bg-slate-500/15 text-slate-300 border-slate-500/30"
            }`}
          >
            {funnel.status === "running" ? "● Live" : "Paused"}
          </span>
          <span className="text-[11px] text-slate-400 font-mono tabular-nums">
            {funnel.weeklyLeads}/wk → {funnel.weeklyCloses} closed
          </span>
        </div>
      </div>
      <ol className="space-y-2">
        {funnel.steps.map((step, i) => (
          <FunnelStepRow key={i} step={step} prev={funnel.steps[i - 1]} accent={accent} />
        ))}
      </ol>
    </article>
  );
}

function FunnelStepRow({
  step,
  prev,
  accent,
}: {
  step: FunnelStep;
  prev?: FunnelStep;
  accent: string;
}) {
  const drop = prev ? prev.reachPct - step.reachPct : 0;
  return (
    <li className="flex items-center gap-3">
      <div className="flex-1">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-slate-300 font-semibold">{step.label}</span>
          <span className="text-white font-bold tabular-nums">{step.reachPct}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{
              width: `${step.reachPct}%`,
              background: `linear-gradient(90deg, ${accent} 0%, ${accent}aa 100%)`,
            }}
          />
        </div>
      </div>
      <div className="w-16 text-right">
        {drop > 0 && (
          <span className="inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 tabular-nums">
            −{drop}pp
          </span>
        )}
      </div>
    </li>
  );
}

function Footer({ prospectId }: { prospectId: string }) {
  return (
    <footer className="border-t border-slate-800 bg-slate-950">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <p>
          Mock data. Every number resets on reload. Want this with REAL leads
          for your business?
        </p>
        <Link
          href={`/schedule/${prospectId}?type=fullsystem&source=mock-dashboard-footer`}
          className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white whitespace-nowrap"
        >
          Talk to Ben →
        </Link>
      </div>
    </footer>
  );
}
