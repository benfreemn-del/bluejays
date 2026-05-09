"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/**
 * /dashboard/cold-traffic
 *
 * Validation dashboard for the May 2026 cold-paid-traffic experiment
 * (Hormozi rule: validate before scale). Per-variant funnel split
 * (A=control · B=Hormozi-diagnostic · C=5-clog) so Ben can see which
 * hook is earning conversions and at what CAC.
 *
 * Ben enters Meta ad spend manually (Meta Marketing API not wired yet)
 * via the input field at top — dashboard recomputes CAC + ROAS live.
 *
 * Reads /api/cold-traffic. No auto-refresh — Ben hits Reload when he
 * wants the latest. (Cold-traffic data moves slowly; the 60s refresh
 * pattern from MadieProductivity isn't useful here.)
 */

type FunnelBucket = {
  leads: number;
  audit_complete: number;
  claim_clicked: number;
  purchased: number;
  revenueCents: number;
};

type ColdTrafficData = {
  campaignTag: string;
  windowDays: number;
  adSpendUsd: number;
  totals: FunnelBucket;
  byVariant: Record<string, FunnelBucket>;
  cac: number | null;
  costPerLead: number | null;
  roas: number | null;
  recent: Array<{
    id: string;
    businessName: string;
    email: string;
    status: string;
    variant: string;
    utmContent: string;
    createdAt: string;
  }>;
  asOf: string;
};

const VARIANT_LABEL: Record<string, string> = {
  A: "A · Control",
  B: "B · Hormozi diagnostic",
  C: "C · 5-clog reframe",
  Unknown: "Unknown",
};

const VARIANT_TONE: Record<string, string> = {
  A: "border-slate-700 bg-slate-800/40 text-slate-200",
  B: "border-violet-500/40 bg-violet-500/[0.06] text-violet-200",
  C: "border-emerald-500/40 bg-emerald-500/[0.06] text-emerald-200",
  Unknown: "border-slate-700 bg-slate-900/40 text-slate-400",
};

export default function ColdTrafficPage() {
  const [data, setData] = useState<ColdTrafficData | null>(null);
  const [loading, setLoading] = useState(true);
  const [adSpend, setAdSpend] = useState<string>("0");

  const load = async (spend: number) => {
    setLoading(true);
    try {
      const r = await fetch(`/api/cold-traffic?spend_usd=${spend}`, {
        credentials: "include",
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const j = (await r.json()) as ColdTrafficData;
      setData(j);
    } catch (err) {
      console.warn("[cold-traffic]", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load(0);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-20 backdrop-blur bg-slate-950/85 border-b border-slate-800">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-3 flex items-center gap-3">
          <Link
            href="/dashboard"
            className="text-slate-400 hover:text-white text-sm flex items-center gap-1"
          >
            ← Dash
          </Link>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight flex-1">
            Cold-Traffic Validation · {data?.campaignTag ?? "—"}
          </h1>
          <span className="text-[11px] tracking-wider uppercase font-bold text-slate-500">
            Last {data?.windowDays ?? 30} days
          </span>
        </div>
        <p className="mx-auto max-w-6xl px-4 sm:px-6 pb-3 text-[11px] text-slate-500 leading-snug">
          Per the 30-day Hormozi validation rule. Filters prospects by
          UTM <code className="text-slate-300">utm_campaign={data?.campaignTag ?? "cold-validation-2026-05"}</code>{" "}
          + splits by hero variant (audit_variant). Enter your Meta-side ad
          spend below to compute CAC + ROAS.
        </p>
      </header>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-6 pb-32 space-y-6">
        {/* Spend input */}
        <section className="rounded-xl border border-amber-500/30 bg-amber-500/[0.04] p-4 flex items-center gap-3 flex-wrap">
          <label className="text-[11px] uppercase tracking-wider font-bold text-amber-300">
            Meta ad spend (USD, last 30d)
          </label>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">$</span>
            <input
              type="number"
              value={adSpend}
              onChange={(e) => setAdSpend(e.target.value)}
              onBlur={() => void load(parseFloat(adSpend) || 0)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void load(parseFloat(adSpend) || 0);
              }}
              className="w-28 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm text-white tabular-nums focus:outline-none focus:border-amber-500/50"
              placeholder="0"
              step="10"
            />
            <button
              type="button"
              onClick={() => void load(parseFloat(adSpend) || 0)}
              className="text-[11px] uppercase tracking-wider font-bold rounded px-3 py-1.5 bg-amber-500 text-amber-950 hover:bg-amber-400"
            >
              Recompute
            </button>
          </div>
          <p className="text-[11px] text-slate-500 leading-snug flex-1 min-w-[200px]">
            Manual entry until Meta Marketing API is wired. Pull from Meta
            Ads Manager → Reports → Spend, last 30 days.
          </p>
        </section>

        {loading && (
          <div className="text-center text-slate-500 py-10">Loading…</div>
        )}

        {!loading && data && (
          <>
            {/* Hero stats */}
            <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <Stat label="Leads" value={String(data.totals.leads)} tone="violet" />
              <Stat label="Audit done" value={String(data.totals.audit_complete)} tone="sky" />
              <Stat label="Claim clicked" value={String(data.totals.claim_clicked)} tone="amber" />
              <Stat
                label="Purchased"
                value={String(data.totals.purchased)}
                tone={data.totals.purchased > 0 ? "emerald" : "slate"}
              />
              <Stat
                label="Cost / lead"
                value={data.costPerLead != null ? `$${data.costPerLead.toFixed(2)}` : "—"}
                tone="slate"
              />
              <Stat
                label="CAC"
                value={data.cac != null ? `$${data.cac.toFixed(0)}` : "—"}
                tone={
                  data.cac == null
                    ? "slate"
                    : data.cac <= 50
                      ? "emerald"
                      : data.cac <= 150
                        ? "amber"
                        : "rose"
                }
                subtitle={
                  data.cac != null
                    ? data.cac <= 50
                      ? "Validated · scale"
                      : data.cac <= 150
                        ? "Iterate funnel"
                        : "Audience or offer wrong"
                    : "Need spend + closes"
                }
              />
            </section>

            {/* ROAS callout */}
            {data.adSpendUsd > 0 && (
              <section className="rounded-xl border border-violet-500/30 bg-gradient-to-br from-violet-950/40 via-slate-900/50 to-slate-900/40 p-4 flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.22em] font-bold text-violet-300 mb-0.5">
                    Return on ad spend
                  </p>
                  <p className="text-2xl font-black tabular-nums text-white">
                    {data.roas != null ? `${data.roas.toFixed(2)}×` : "—"}
                  </p>
                </div>
                <div className="text-right text-[11px] text-slate-400">
                  ${(data.totals.revenueCents / 100).toFixed(0)} revenue ·
                  ${data.adSpendUsd.toFixed(0)} spend
                </div>
              </section>
            )}

            {/* Per-variant funnel split */}
            <section>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">
                Per-variant funnel
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {(["A", "B", "C", "Unknown"] as const).map((v) => {
                  const bucket = data.byVariant[v];
                  if (!bucket || (v === "Unknown" && bucket.leads === 0)) return null;
                  const tone = VARIANT_TONE[v];
                  const auditPct =
                    bucket.leads === 0
                      ? 0
                      : Math.round((bucket.audit_complete / bucket.leads) * 100);
                  const claimPct =
                    bucket.leads === 0
                      ? 0
                      : Math.round((bucket.claim_clicked / bucket.leads) * 100);
                  const buyPct =
                    bucket.leads === 0
                      ? 0
                      : Math.round((bucket.purchased / bucket.leads) * 100);
                  return (
                    <div key={v} className={`rounded-xl border ${tone} p-4`}>
                      <p className="text-[11px] uppercase tracking-wider font-bold mb-3">
                        {VARIANT_LABEL[v]}
                      </p>
                      <FunnelRow label="Leads" value={bucket.leads} pct={100} highlight />
                      <FunnelRow
                        label="Audit complete"
                        value={bucket.audit_complete}
                        pct={auditPct}
                      />
                      <FunnelRow
                        label="Claim clicked"
                        value={bucket.claim_clicked}
                        pct={claimPct}
                      />
                      <FunnelRow
                        label="Purchased"
                        value={bucket.purchased}
                        pct={buyPct}
                        highlight
                      />
                      {bucket.revenueCents > 0 && (
                        <p className="text-[11px] mt-2 pt-2 border-t border-white/[0.08]">
                          Revenue:{" "}
                          <span className="font-bold tabular-nums">
                            ${(bucket.revenueCents / 100).toFixed(0)}
                          </span>
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Recent leads */}
            {data.recent.length > 0 && (
              <section>
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Recent cold leads · last 30
                </h2>
                <div className="rounded-xl border border-white/[0.06] bg-slate-900/30 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-900/80 text-[10px] uppercase tracking-wider text-slate-500">
                      <tr>
                        <th className="text-left px-4 py-2 font-semibold">Business</th>
                        <th className="text-left px-4 py-2 font-semibold">Status</th>
                        <th className="text-left px-4 py-2 font-semibold">Variant</th>
                        <th className="text-left px-4 py-2 font-semibold">Hook</th>
                        <th className="text-right px-4 py-2 font-semibold">When</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      {data.recent.map((r) => (
                        <tr key={r.id} className="hover:bg-slate-900/60">
                          <td className="px-4 py-2 truncate max-w-xs">
                            <p className="font-semibold text-white truncate">
                              {r.businessName}
                            </p>
                            <p className="text-[11px] text-slate-500 truncate">
                              {r.email}
                            </p>
                          </td>
                          <td className="px-4 py-2 text-slate-300">{r.status}</td>
                          <td className="px-4 py-2">
                            <span
                              className={`inline-flex items-center text-[10px] uppercase tracking-wider font-bold rounded border px-1.5 py-0.5 ${VARIANT_TONE[r.variant.toUpperCase()] ?? VARIANT_TONE.Unknown}`}
                            >
                              {r.variant}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-[11px] text-slate-500 truncate max-w-xs">
                            {r.utmContent}
                          </td>
                          <td className="px-4 py-2 text-right text-[11px] text-slate-500 whitespace-nowrap">
                            {timeAgo(r.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {data.totals.leads === 0 && (
              <section className="rounded-xl border border-amber-500/30 bg-amber-500/[0.06] p-5 text-sm text-amber-200">
                No cold-traffic leads logged yet. Once Meta ads start firing
                with the campaign tag{" "}
                <code className="text-amber-100">{data.campaignTag}</code>,
                submissions will populate this view automatically. See{" "}
                <code className="text-amber-100">
                  docs/templates/cold-traffic-ad-creatives.md
                </code>{" "}
                for the 3 ad creatives + UTM URLs.
              </section>
            )}

            <p className="text-[10px] text-slate-600">
              Data as of {new Date(data.asOf).toLocaleString()} · campaign{" "}
              <code>{data.campaignTag}</code>
            </p>
          </>
        )}
      </main>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
  subtitle,
}: {
  label: string;
  value: string;
  tone: "violet" | "sky" | "amber" | "emerald" | "rose" | "slate";
  subtitle?: string;
}) {
  const cls =
    tone === "violet"
      ? "border-violet-500/30 bg-violet-500/[0.06] text-violet-200"
      : tone === "sky"
        ? "border-sky-500/30 bg-sky-500/[0.06] text-sky-200"
        : tone === "amber"
          ? "border-amber-500/30 bg-amber-500/[0.06] text-amber-200"
          : tone === "emerald"
            ? "border-emerald-500/30 bg-emerald-500/[0.06] text-emerald-200"
            : tone === "rose"
              ? "border-rose-500/30 bg-rose-500/[0.06] text-rose-200"
              : "border-slate-700 bg-slate-800/40 text-slate-300";
  return (
    <div className={`rounded-lg border ${cls} px-3 py-2`}>
      <p className="text-[10px] uppercase tracking-wider font-bold opacity-80 truncate">
        {label}
      </p>
      <p className="text-2xl font-black tabular-nums mt-0.5">{value}</p>
      {subtitle && (
        <p className="text-[10px] opacity-60 mt-0.5 truncate">{subtitle}</p>
      )}
    </div>
  );
}

function FunnelRow({
  label,
  value,
  pct,
  highlight,
}: {
  label: string;
  value: number;
  pct: number;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-2 py-1">
      <span
        className={`text-xs ${highlight ? "font-bold text-white" : "text-slate-400"}`}
      >
        {label}
      </span>
      <span className="flex items-baseline gap-1.5">
        <span
          className={`tabular-nums font-bold ${highlight ? "text-base" : "text-sm"}`}
        >
          {value}
        </span>
        <span className="text-[10px] tabular-nums opacity-60">{pct}%</span>
      </span>
    </div>
  );
}

function timeAgo(iso: string): string {
  const ts = Date.parse(iso);
  if (!ts) return "—";
  const seconds = Math.floor((Date.now() - ts) / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}
