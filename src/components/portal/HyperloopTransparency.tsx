"use client";

/**
 * HyperloopTransparency — portal-side glass-box view of every A/B
 * decision the Hyperloop engine has made for this client.
 *
 * Three sections rendered top-to-bottom:
 *
 *   Currently testing — variants with status='live' and recent
 *                       impressions. The engine is still gathering
 *                       data, no winner declared yet.
 *
 *   Promoted (winners) — live variants that crossed the impressions
 *                        threshold + outperformed their cohort.
 *                        These are the ones currently absorbing more
 *                        budget.
 *
 *   Killed (losers)    — variants the engine cut because they
 *                        underperformed. Shown so the client SEES
 *                        the system making decisions vs reading
 *                        about it abstractly.
 *
 * Mounted inside AISkillsTab so it lives next to the bot map + the
 * detailed capability list. Three views, one tab.
 *
 * Why this exists: per the deep-dive review, the AI Package was a
 * black box. Hyperloop ran in the background; clients couldn't see
 * "here's the test it just won, here's the variant that lost." Black
 * box = renewal risk. This makes it visible.
 */

import { useEffect, useState } from "react";

type Variant = {
  id: string;
  audience: string;
  platform: string;
  ad_set: string | null;
  variant_label: string | null;
  headline: string;
  body: string;
  cta: string | null;
  status: string;
  impressions: number | null;
  clicks: number | null;
  conversions: number | null;
  spend_cents: number | null;
  last_synced_at: string | null;
  updated_at: string;
};

type History = {
  live: Variant[];
  winners: Variant[];
  killed: Variant[];
  counts: { live: number; winners: number; killed: number; total: number };
};

function fmtNum(n: number | null | undefined): string {
  if (n == null) return "—";
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

function fmtPct(num: number, den: number): string {
  if (!den) return "—";
  return `${((num / den) * 100).toFixed(1)}%`;
}

export default function HyperloopTransparency({ slug }: { slug: string }) {
  const [data, setData] = useState<History | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/clients/${slug}/hyperloop-history`)
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (cancelled || !j?.ok) return;
        setData({
          live: j.live ?? [],
          winners: j.winners ?? [],
          killed: j.killed ?? [],
          counts: j.counts ?? { live: 0, winners: 0, killed: 0, total: 0 },
        });
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-violet-500/20 bg-slate-900/40 p-6 text-center text-slate-500 text-sm">
        Loading Hyperloop history…
      </div>
    );
  }

  if (!data || data.counts.total === 0) {
    return (
      <div className="rounded-2xl border border-violet-500/20 bg-violet-950/15 p-6">
        <p className="text-[10px] uppercase tracking-[0.22em] text-violet-300 font-bold mb-1">
          Hyperloop A/B engine
        </p>
        <h3 className="text-base font-bold text-white mb-2">
          No tests running yet
        </h3>
        <p className="text-sm text-slate-300 leading-relaxed">
          The engine starts running once your ad variants go live. Every
          headline + body + CTA gets stat-tested with Wilson-CI; winners
          absorb more budget, losers get cut. You&apos;ll see the
          history here once it&apos;s collecting data.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-violet-500/20 bg-slate-900/40 p-5 sm:p-6 space-y-6">
      <div>
        <p className="text-[10px] uppercase tracking-[0.22em] text-violet-300 font-bold mb-1">
          Hyperloop A/B · transparent log
        </p>
        <h3 className="text-base sm:text-lg font-black text-violet-100 mb-1">
          🔬 The AI&apos;s decision log
        </h3>
        <p className="text-sm text-slate-300/80 leading-relaxed max-w-2xl">
          Every ad variant the engine has tested for you. Promoted winners
          eat more budget, killed losers got cut. Black box → glass box.
        </p>
      </div>

      {/* 3-stat header */}
      <div className="grid grid-cols-3 gap-3">
        <Tile label="Currently live" value={data.counts.live} accent="emerald" />
        <Tile label="Promoted winners" value={data.counts.winners} accent="violet" />
        <Tile label="Killed losers" value={data.counts.killed} accent="rose" />
      </div>

      {data.live.length > 0 && (
        <Section title="🟢 Currently testing" tone="emerald">
          <ul className="space-y-2">
            {data.live.map((v) => (
              <VariantCard key={v.id} v={v} />
            ))}
          </ul>
        </Section>
      )}

      {data.winners.length > 0 && (
        <Section title="🏆 Promoted (winners absorbing budget)" tone="violet">
          <ul className="space-y-2">
            {data.winners.map((v) => (
              <VariantCard key={v.id} v={v} winner />
            ))}
          </ul>
        </Section>
      )}

      {data.killed.length > 0 && (
        <Section title="⛔ Killed (cut by the engine)" tone="rose">
          <ul className="space-y-2">
            {data.killed.map((v) => (
              <VariantCard key={v.id} v={v} killed />
            ))}
          </ul>
        </Section>
      )}
    </div>
  );
}

function Tile({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: "emerald" | "violet" | "rose";
}) {
  const cls: Record<string, string> = {
    emerald: "border-emerald-500/30 bg-emerald-950/20 text-emerald-200",
    violet: "border-violet-500/30 bg-violet-950/20 text-violet-200",
    rose: "border-rose-500/30 bg-rose-950/20 text-rose-200",
  };
  return (
    <div className={`rounded-lg border p-3 text-center ${cls[accent]}`}>
      <div className="text-2xl font-black text-white tabular-nums leading-none">
        {value}
      </div>
      <div className="text-[10px] font-bold uppercase tracking-wider mt-1">
        {label}
      </div>
    </div>
  );
}

function Section({
  title,
  tone,
  children,
}: {
  title: string;
  tone: "emerald" | "violet" | "rose";
  children: React.ReactNode;
}) {
  const text: Record<string, string> = {
    emerald: "text-emerald-200",
    violet: "text-violet-200",
    rose: "text-rose-200",
  };
  return (
    <section>
      <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 ${text[tone]}`}>
        {title}
      </h4>
      {children}
    </section>
  );
}

function VariantCard({
  v,
  winner,
  killed,
}: {
  v: Variant;
  winner?: boolean;
  killed?: boolean;
}) {
  const ctr =
    v.impressions && v.impressions > 0
      ? (v.clicks ?? 0) / v.impressions
      : null;
  const ringCls = winner
    ? "border-violet-500/30 bg-violet-950/15"
    : killed
      ? "border-rose-500/20 bg-rose-950/10 opacity-75"
      : "border-slate-800 bg-slate-900/50";

  return (
    <li className={`rounded-lg border ${ringCls} px-3 py-2.5`}>
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
              {v.platform}
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-[10px] uppercase tracking-wider text-slate-500">
              {v.audience} audience
            </span>
            {v.variant_label && (
              <>
                <span className="text-slate-600">·</span>
                <span className="text-[10px] text-violet-300/80">
                  {v.variant_label}
                </span>
              </>
            )}
          </div>
          <p
            className={`text-sm font-semibold leading-tight ${
              killed ? "line-through text-slate-400" : "text-white"
            }`}
          >
            {v.headline}
          </p>
          {v.body && (
            <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
              {v.body}
            </p>
          )}
        </div>
        <div className="shrink-0 text-right">
          <div className="text-[10px] uppercase tracking-wider text-slate-500">
            CTR
          </div>
          <div className="text-sm font-bold text-white tabular-nums">
            {ctr != null ? `${(ctr * 100).toFixed(2)}%` : "—"}
          </div>
          <div className="text-[10px] text-slate-500 tabular-nums mt-0.5">
            {fmtNum(v.impressions)} imps · {fmtPct(v.clicks ?? 0, v.impressions ?? 0)}
          </div>
        </div>
      </div>
    </li>
  );
}
