"use client";

import { useEffect, useMemo, useState } from "react";
import FunnelVisualModal from "@/components/portal/FunnelVisualModal";
import { BLUEJAYS_FUNNELS } from "@/lib/bluejays-funnels";

/**
 * BluejaysFunnelsTab — the BlueJays-internal Funnels surface.
 *
 * Rendered:
 *   1. In-place inside `/dashboard?tab=funnels` (Ben's main admin
 *      dashboard) — same tab-flip pattern as Overview / Leads / Map.
 *   2. At the standalone `/dashboard/funnel` URL for direct linking.
 *
 * Shape mirrors the per-client owner-portal Funnels tab (Zenith,
 * Meyer mock-backend) — same card grid, same shared FunnelVisualModal,
 * same Rule 74 bars + drop-off pills + edit / + Note flow. The only
 * difference is the data: BLUEJAYS_FUNNELS feeds three audience cuts
 * of BlueJays' own sales motion (cold-scouted / inbound-audit /
 * manufacturer-lookalike) instead of a per-client cadence.
 *
 * Edits + notes route through /api/funnel/feedback with
 * slug="bluejays-internal" — Ben's notes-to-self path.
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

// 2-min callback SLA telemetry (116-Funnels chunk 13c).
// Surfaces Madie's response time to hot-lead audit submissions on the
// dashboard so operator discipline is visible, not just hypothetical.
interface CallbackSlaStats {
  label: string;
  audits_with_phone: number;
  called_within_2min: number;
  called_within_15min: number;
  called_at_all: number;
  sla_2min_pct: number;
  sla_15min_pct: number;
  overall_reach_pct: number;
}

// Per-funnel-segment counts wired from real Supabase via funnelSegment
// tag + legacy attribution heuristics. The dashboard card prefers these
// over hardcoded `defaultCounts` in bluejays-funnels.ts when available.
interface SegmentCounts {
  segment: string;
  total: number;
  newCount: number;
  enrolledCount: number;
  wonCount: number;
}

interface FunnelStatsResponse {
  windows?: WindowStats[];
  byFork?: ForkStats[];
  callbackSla?: CallbackSlaStats[];
  bySegment?: SegmentCounts[];
  generatedAt?: string;
}

const FORK_LABEL: Record<string, string> = {
  buy: "🛠️ Fix it now",
  schedule: "📞 Schedule a call",
  preview: "🎨 Get my preview",
};

export default function BluejaysFunnelsTab() {
  const [stats, setStats] = useState<FunnelStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Audience-funnel modal state
  const [openSegment, setOpenSegment] = useState<string | null>(null);
  const [openWithNote, setOpenWithNote] = useState(false);

  const openFunnel = useMemo(
    () => BLUEJAYS_FUNNELS.find((f) => f.segment === openSegment) ?? null,
    [openSegment],
  );

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

  // Lookup map: segment name → real Supabase counts. Empty until
  // /api/funnel-conversion/stats returns. The card render prefers real
  // counts over hardcoded `defaultCounts` baselines when present.
  const segmentCountsMap = useMemo(() => {
    const m = new Map<string, SegmentCounts>();
    for (const s of stats?.bySegment ?? []) m.set(s.segment, s);
    return m;
  }, [stats]);

  // Effective counts per funnel — real when present, defaultCounts
  // otherwise. Hoisted as a helper so card render + aggregate strip
  // stay in sync.
  function effectiveCounts(segment: string): {
    counts: { total: number; newCount: number; enrolledCount: number; wonCount: number };
    isReal: boolean;
  } {
    const real = segmentCountsMap.get(segment);
    if (real) return { counts: real, isReal: true };
    const def =
      BLUEJAYS_FUNNELS.find((f) => f.segment === segment)?.defaultCounts;
    return {
      counts: def ?? { total: 0, newCount: 0, enrolledCount: 0, wonCount: 0 },
      isReal: false,
    };
  }

  // Aggregate-stats strip across all 3 funnels. Uses real counts when
  // present; falls back to defaultCounts so the strip never shows zeros
  // pre-stats-load. The aggregate.isAllReal flag drives the "live data"
  // badge so Ben sees whether the strip is real-data or baseline.
  const aggregate = useMemo(() => {
    let total = 0;
    let won = 0;
    let allReal = true;
    for (const f of BLUEJAYS_FUNNELS) {
      const { counts, isReal } = effectiveCounts(f.segment);
      total += counts.total;
      won += counts.wonCount;
      if (!isReal) allReal = false;
    }
    const blended = total > 0 ? (won / total) * 100 : 0;
    return { total, won, blended, allReal };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [segmentCountsMap]);

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-md border border-rose-500/40 bg-rose-500/10 p-4 text-sm text-rose-200">
          {error}
        </div>
      )}

      {/* AUDIENCE FUNNELS — same shared modal as the per-client portal */}
      <div className="rounded-2xl bg-slate-900/60 border border-white/[0.06] p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-xl font-bold tracking-tight mb-1">
              🎯 Audience funnels
            </h2>
            <p className="text-sm text-slate-400 max-w-md">
              Each card is one audience cut of the BlueJays sales motion.
              Click <span className="text-amber-300 font-bold">View funnel</span>{" "}
              to drill in, edit any step inline, or hit{" "}
              <span className="text-amber-300 font-bold">+</span> to drop
              a note to yourself.
            </p>
            {/* Lead-magnet connection strip — surfaces the /audit
                lead-magnet → primary-funnel relationship at the top
                of the dashboard so it's never invisible. Redesigned
                2026-05-16 with the 116-Funnels + Brunson framework
                stack. */}
            <div className="mt-3 inline-flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/[0.06] px-3 py-1.5 text-[11px]">
              <span className="text-amber-300 font-bold">
                📥 Active lead magnet
              </span>
              <a
                href="/audit"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-200 underline decoration-amber-400/40 hover:decoration-amber-300 font-semibold"
              >
                /audit
              </a>
              <span className="text-slate-500">→</span>
              <span className="text-amber-200/90 font-semibold">
                Inbound Audit → $10k AI System funnel
              </span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-right">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                Pipeline
              </div>
              <div className="text-2xl font-black text-white tabular-nums">
                {aggregate.total.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                Won
              </div>
              <div className="text-2xl font-black text-emerald-300 tabular-nums">
                {aggregate.won}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                Blended
              </div>
              <div className="text-2xl font-black text-amber-300 tabular-nums">
                {aggregate.blended.toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-3">
        {BLUEJAYS_FUNNELS.map((f) => {
          // Prefer real Supabase counts wired via funnelSegment tag +
          // attribution heuristics in /api/funnel-conversion/stats.
          // Falls back to hardcoded defaultCounts baselines until the
          // stats fetch resolves.
          const { counts, isReal } = effectiveCounts(f.segment);
          return (
            <div
              key={f.segment}
              className={`relative rounded-2xl border p-5 pl-6 overflow-hidden transition-shadow ${f.cardClass}`}
            >
              {/* 4px accent stripe on the left edge — matches the modal's
                  per-step accent stripe so cards + modal feel unified
                  across the funnel viz. */}
              <div
                aria-hidden
                className={`absolute left-0 top-0 bottom-0 w-1 ${f.accentText}`}
                style={{ background: "currentColor", opacity: 0.55 }}
              />
              {/* + Note pill */}
              <button
                type="button"
                onClick={() => {
                  setOpenWithNote(true);
                  setOpenSegment(f.segment);
                }}
                className="absolute top-3 right-3 w-7 h-7 rounded-full border border-white/15 bg-slate-900/70 hover:border-amber-400/60 hover:bg-amber-500/10 hover:text-amber-200 text-slate-400 text-base font-bold leading-none flex items-center justify-center transition-colors"
                title="Drop a note to yourself about this funnel"
                aria-label="Drop a note to yourself about this funnel"
              >
                +
              </button>

              {/* Card header */}
              <div className="flex items-start gap-3 mb-3 pr-10">
                <span className="text-2xl">{f.emoji}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white">{f.title}</h3>
                  <p className="text-[11px] text-slate-400 leading-snug mt-0.5">
                    {f.pitch}
                  </p>
                </div>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider ${f.accentText} whitespace-nowrap`}
                >
                  {f.segment}
                </span>
              </div>

              {/* Lead-magnet badge — only renders on funnels with an
                  explicit lead magnet (today: the /audit form on the
                  Inbound Audit funnel). Surfaces the lead-magnet →
                  funnel connection on the card itself so it's never
                  invisible. */}
              {f.leadMagnet && (
                <a
                  href={f.leadMagnet.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`mb-3 flex items-center justify-between gap-2 rounded-lg border border-amber-500/30 bg-amber-500/[0.08] px-2.5 py-1.5 text-[10px] hover:border-amber-400/60 hover:bg-amber-500/[0.12] transition-colors`}
                  title="Open the lead magnet that feeds this funnel"
                >
                  <span className="text-amber-200 font-semibold leading-tight">
                    {f.leadMagnet.label}
                  </span>
                  <span className="text-amber-300/80 text-[11px]">↗</span>
                </a>
              )}

              {/* Touchpoint sequence — D{n} chips */}
              <div className="mb-3">
                <div className="text-[9px] uppercase tracking-[0.22em] text-slate-500 mb-1.5">
                  Touchpoint sequence
                </div>
                <ol
                  className="grid gap-1"
                  style={{
                    gridTemplateColumns: `repeat(${Math.min(f.steps.length, 6)}, minmax(0, 1fr))`,
                  }}
                >
                  {f.steps.map((s, i) => {
                    const glyph =
                      s.channel === "email"
                        ? "✉"
                        : s.channel === "sms"
                          ? "💬"
                          : s.channel === "voicemail"
                            ? "🎙"
                            : s.channel === "call"
                              ? "📞"
                              : s.channel === "ad"
                                ? "💸"
                                : s.channel === "linkedin"
                                  ? "🔗"
                                  : "📮";
                    return (
                      <li
                        key={i}
                        className="relative rounded-md bg-black/30 border border-white/[0.04] px-1.5 py-1.5"
                      >
                        {/* Stage number + day, side-by-side. Matches the
                            modal's "1/2/3..." anchor so the card → modal
                            transition tracks visually. */}
                        <div className="flex items-center gap-1 mb-0.5">
                          <span
                            className={`inline-flex items-center justify-center w-4 h-4 rounded-full bg-black/60 border border-white/15 text-[9px] font-black tabular-nums ${f.accentText}`}
                            aria-hidden
                          >
                            {i + 1}
                          </span>
                          <span
                            className={`text-[10px] font-black ${f.accentText} tabular-nums`}
                          >
                            D{s.day}
                          </span>
                        </div>
                        <div className="text-[9px] text-slate-500 mb-0.5 whitespace-nowrap">
                          {glyph} {s.channel}
                        </div>
                        <div
                          className="text-[10px] text-slate-300 leading-tight line-clamp-2"
                          title={s.label}
                        >
                          {s.label}
                        </div>
                        {i < f.steps.length - 1 && (
                          <span
                            aria-hidden
                            className={`absolute top-1/2 -right-[2.5px] -translate-y-1/2 ${f.accentText} text-[10px]`}
                          >
                            ▶
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ol>
              </div>

              {/* LIVE / BASELINE data-mode badge — surfaces whether
                  this card's counts come from real Supabase via the
                  funnelSegment tag + attribution heuristics, or from
                  hardcoded defaultCounts baselines. Per CLAUDE.md
                  Status Accuracy Rule (Rule 74 dataMode signal — every
                  funnel surface must be honest about real vs baseline). */}
              <div className="mb-2">
                <span
                  className={`inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-[0.18em] px-1.5 py-0.5 rounded ${
                    isReal
                      ? "text-emerald-300 bg-emerald-500/[0.08] border border-emerald-500/30"
                      : "text-slate-500 bg-slate-800/40 border border-white/[0.06]"
                  }`}
                  title={
                    isReal
                      ? "Counts wired from real Supabase via funnelSegment tag + attribution heuristics"
                      : "Hardcoded baselines from bluejays-funnels.ts (stats fetch failed or pre-load)"
                  }
                >
                  {isReal ? "● Live data" : "○ Baseline"}
                </span>
              </div>

              {/* 4-stat row */}
              <div className="grid grid-cols-4 gap-1.5 mb-3 text-center">
                <div className="rounded-md bg-black/30 px-1.5 py-1.5">
                  <div className="text-[9px] uppercase tracking-wider text-slate-500">
                    Total
                  </div>
                  <div className="text-sm font-black text-white tabular-nums">
                    {counts.total}
                  </div>
                </div>
                <div className="rounded-md bg-black/30 px-1.5 py-1.5">
                  <div className="text-[9px] uppercase tracking-wider text-slate-500">
                    New
                  </div>
                  <div className="text-sm font-black text-blue-300 tabular-nums">
                    {counts.newCount}
                  </div>
                </div>
                <div className="rounded-md bg-black/30 px-1.5 py-1.5">
                  <div className="text-[9px] uppercase tracking-wider text-slate-500">
                    Active
                  </div>
                  <div className="text-sm font-black text-amber-300 tabular-nums">
                    {counts.enrolledCount}
                  </div>
                </div>
                <div className="rounded-md bg-black/30 px-1.5 py-1.5">
                  <div className="text-[9px] uppercase tracking-wider text-slate-500">
                    Won
                  </div>
                  <div className="text-sm font-black text-emerald-300 tabular-nums">
                    {counts.wonCount}
                  </div>
                </div>
              </div>

              {/* Action row */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setOpenWithNote(false);
                    setOpenSegment(f.segment);
                  }}
                  className="flex-1 text-xs font-bold uppercase tracking-wider px-3 py-2 rounded-lg border border-white/15 bg-slate-900/70 hover:border-amber-400/50 hover:bg-slate-800 text-amber-200 text-center transition-colors"
                >
                  View funnel
                </button>
                <a
                  href={f.landingPath}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-xs font-bold uppercase tracking-wider px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-center"
                >
                  View landing page ↗
                </a>
              </div>

              {/* Framework attribution — shows which memory-codified
                  frameworks shape this funnel's steps. Operators can
                  grep the framework names back into the reference
                  files in `.claude/projects/.../memory/`. Surfaces
                  the redesign work so it's never lost. */}
              {f.frameworks && f.frameworks.length > 0 && (
                <div className="mt-3 pt-3 border-t border-white/[0.05]">
                  <div className="text-[9px] uppercase tracking-[0.22em] text-slate-500 mb-1">
                    📚 Frameworks
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {f.frameworks.map((fw, i) => (
                      <span
                        key={i}
                        className="inline-block text-[9px] px-1.5 py-0.5 rounded bg-black/30 border border-white/[0.06] text-slate-400"
                      >
                        {fw}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl bg-slate-900/60 border border-white/[0.06] p-4 text-xs text-slate-500 italic">
        Bars use industry-typical baselines until per-step reach
        measurement lands. Edits + notes route through{" "}
        <code className="not-italic mx-1 px-1 rounded bg-slate-800/60 text-slate-400">
          /api/funnel/feedback
        </code>
        so even your own funnel-tweaks land in your inbox.
      </div>

      {/* CONVERSION ANALYTICS — existing surface */}
      {loading && !stats ? (
        <p className="text-slate-500 text-sm">Loading analytics…</p>
      ) : !stats ? null : (
        <>
          {/* 2-MIN CALLBACK SLA CHIPS — 116-Funnels chunk 13c
              Surfaces Madie's response time on hot audit leads.
              Three windows (7d / 30d / all) so trend is visible at
              a glance. Lime when SLA hit; amber when soft-missed
              (15-min reach); rose when chronically slow. */}
          <section>
            <div className="flex items-baseline justify-between mb-4 flex-wrap gap-2">
              <h2 className="text-xl font-bold">
                📞 2-min Callback SLA
              </h2>
              <p className="text-[11px] text-slate-500 max-w-xs text-right">
                Per 116-Funnels chunk 13c — every audit submission
                with a phone gets called within 2 minutes. Surfaces
                whether Madie&apos;s operator discipline is holding.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {(stats.callbackSla ?? []).map((s) => {
                const pct = s.sla_2min_pct;
                const tone =
                  pct >= 80
                    ? { ring: "ring-lime-500/30", text: "text-lime-300", label: "On pace" }
                    : pct >= 50
                      ? { ring: "ring-amber-500/30", text: "text-amber-300", label: "Soft miss" }
                      : { ring: "ring-rose-500/30", text: "text-rose-300", label: "Breached" };
                return (
                  <div
                    key={s.label}
                    className={`rounded-xl border border-white/10 bg-slate-900/40 p-5 ring-1 ${tone.ring}`}
                  >
                    <p className="text-xs uppercase tracking-wider text-slate-500 mb-2">
                      Last {s.label}
                    </p>
                    <p className={`text-3xl font-bold ${tone.text}`}>
                      {s.sla_2min_pct.toFixed(1)}%
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {s.called_within_2min} of {s.audits_with_phone} hot leads
                      reached within 2 min
                    </p>
                    <div className="mt-4 space-y-1 text-xs text-slate-500">
                      <p>
                        Within 15 min:{" "}
                        <span className="text-slate-300 font-semibold">
                          {s.sla_15min_pct.toFixed(1)}%
                        </span>
                      </p>
                      <p>
                        Reached at all:{" "}
                        <span className="text-slate-300 font-semibold">
                          {s.overall_reach_pct.toFixed(1)}%
                        </span>
                      </p>
                      <p
                        className={`text-[10px] uppercase tracking-wider font-bold mt-2 ${tone.text}`}
                      >
                        {tone.label}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="mt-4 text-xs text-slate-500">
              Hot lead = audit submission with phone on record. The
              SLA clock starts at <code className="not-italic mx-1 px-1 rounded bg-slate-800/60 text-slate-400">prospects.created_at</code>{" "}
              and stops at{" "}
              <code className="not-italic mx-1 px-1 rounded bg-slate-800/60 text-slate-400">last_contacted_at</code>{" "}
              (stamped by{" "}
              <code className="not-italic mx-1 px-1 rounded bg-slate-800/60 text-slate-400">
                POST /api/prospects/[id]/log-call
              </code>
              ). Madie&apos;s LeadPicker has a &quot;Just called&quot; button
              that fires the stamp.
            </p>
          </section>

          {/* Audit-to-paid by window */}
          <section>
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
              column is the dedup&apos;d basis for CR math.
            </p>
          </section>
        </>
      )}

      <FunnelVisualModal
        isOpen={openSegment !== null}
        onClose={() => {
          setOpenSegment(null);
          setOpenWithNote(false);
        }}
        funnel={openFunnel}
        counts={
          openFunnel
            ? effectiveCounts(openFunnel.segment).counts
            : { total: 0, newCount: 0, enrolledCount: 0, wonCount: 0 }
        }
        landingUrl={openFunnel?.landingPath ?? "/audit"}
        slug="bluejays-internal"
        editable
        initialShowNote={openWithNote}
        // dataMode signal — per Rule 74 / Status Accuracy: every funnel
        // surface must be honest about whether numbers are real or
        // projected. When real Supabase counts are wired via the
        // funnelSegment tag, the modal renders without the amber "DEMO
        // DATA" banner. When still on hardcoded baselines, the modal
        // surfaces the demo banner so Ben never confuses baseline for
        // measured performance.
        dataMode={
          openFunnel && effectiveCounts(openFunnel.segment).isReal
            ? "live"
            : "demo"
        }
      />
    </div>
  );
}
