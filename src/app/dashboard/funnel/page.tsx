"use client";

import { useEffect, useMemo, useState } from "react";
import FunnelVisualModal from "@/components/portal/FunnelVisualModal";
import { BLUEJAYS_FUNNELS } from "@/lib/bluejays-funnels";

/**
 * /dashboard/funnel — BlueJays' OWN funnel surface
 *
 * Two halves:
 *
 * 1. Audience funnel cards (top) — same Zenith/Meyer Funnels-tab UX
 *    rendered against BlueJays' three audience cuts (cold-scouted,
 *    inbound-audit, manufacturer-lookalike). Click "View funnel" to
 *    open the shared FunnelVisualModal with editable steps + day
 *    arrows + voicemail transcripts + per-step cumulative-reach bars +
 *    drop-off pills (Rule 74 standard). + Note button on each card
 *    routes through /api/funnel/feedback (i.e. SMS-to-self for Ben).
 *
 * 2. Conversion analytics (below) — the existing audit-to-paid + per-
 *    fork CTA breakdown. Pulls from /api/funnel-conversion/stats.
 *    Read-only — this is the measurement surface.
 *
 * Goal: parity between BlueJays' own funnel page and what every paying
 * client sees on their portal Funnels tab. Same modal, same rules,
 * same visual rhythm. When future per-step measurement lands, the
 * cards' baseline bars flip to measured automatically.
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

  // Aggregate-stats strip across all 3 funnels (top of page)
  const aggregate = useMemo(() => {
    const total = BLUEJAYS_FUNNELS.reduce(
      (s, f) => s + f.defaultCounts.total,
      0,
    );
    const won = BLUEJAYS_FUNNELS.reduce(
      (s, f) => s + f.defaultCounts.wonCount,
      0,
    );
    const blended = total > 0 ? (won / total) * 100 : 0;
    return { total, won, blended };
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <header className="mb-8 flex items-start justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">📊 BlueJays funnels</h1>
            <p className="text-slate-400 text-sm max-w-2xl">
              Three audience cuts of the BlueJays sales motion + the
              audit→paid analytics that proves whether ad spend is ROI-
              positive. Click any funnel card to drill in, edit a step,
              or hit + to leave yourself a note.
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

        {/* AUDIENCE FUNNELS — same shared modal as the per-client portal */}
        <section className="mb-12">
          <div className="rounded-2xl bg-slate-900/60 border border-white/[0.06] p-5 mb-4">
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
              const counts = f.defaultCounts;
              return (
                <div
                  key={f.segment}
                  className={`relative rounded-2xl border p-5 transition-shadow ${f.cardClass}`}
                >
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
                                : "📮";
                        return (
                          <li
                            key={i}
                            className="relative rounded-md bg-black/30 border border-white/[0.04] px-1.5 py-1.5"
                          >
                            <div className={`text-[10px] font-black ${f.accentText} mb-0.5`}>
                              D{s.day}
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
                </div>
              );
            })}
          </div>

          <div className="mt-3 rounded-2xl bg-slate-900/60 border border-white/[0.06] p-4 text-xs text-slate-500 italic">
            Bars use industry-typical baselines until per-step reach
            measurement lands. Edits + notes route through
            <code className="not-italic mx-1 px-1 rounded bg-slate-800/60 text-slate-400">
              /api/funnel/feedback
            </code>
            so even your own funnel-tweaks land in your inbox.
          </div>
        </section>

        {/* CONVERSION ANALYTICS — existing surface, kept verbatim */}
        {loading && !stats ? (
          <p className="text-slate-500 text-sm">Loading analytics…</p>
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

      <FunnelVisualModal
        isOpen={openSegment !== null}
        onClose={() => {
          setOpenSegment(null);
          setOpenWithNote(false);
        }}
        funnel={openFunnel}
        counts={
          openFunnel
            ? openFunnel.defaultCounts
            : { total: 0, newCount: 0, enrolledCount: 0, wonCount: 0 }
        }
        landingUrl={openFunnel?.landingPath ?? "/audit"}
        slug="bluejays-internal"
        editable
        initialShowNote={openWithNote}
      />
    </main>
  );
}
