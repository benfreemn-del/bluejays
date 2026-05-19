"use client";

import { use, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type {
  ClientLead,
  ClientLeadAudience,
  ClientLeadFunnelStatus,
} from "@/lib/client-leads";
import { clientSiteFor } from "@/lib/client-site-urls";

/**
 * /dashboard/clients/[slug]/leads
 *
 * Per-client lead board. Shows everyone who's submitted a form on
 * /clients/[slug] in the last 200 captures, plus aggregate counts at the
 * top so Ben can see at a glance: how many leads total, how they break
 * down by audience, and where they sit in the funnel.
 *
 * Mobile-first like the tasks board. One-tap audience tag for leads the
 * detector couldn't auto-classify.
 */

const AUDIENCE_LABEL: Record<ClientLeadAudience, string> = {
  // Zenith / TEKKY soccer
  parent: "👪 Parent",
  coach: "🏟️ Coach",
  player: "⚽ Player",
  club: "🏛️ Club",
  unknown: "📥 Unknown",
  // ITC tractor accessories
  hobbyist: "🚜 Hobbyist",
  forester: "🌲 Forester",
  tym: "⚙️ TYM",
  hunter: "🦌 Hunter",
  dealer: "🤝 Dealer",
  community: "🏆 Community",
};
// Zenith audiences (parent/coach/player/club) aligned with the owner
// portal palette per CLAUDE.md Owner Portal Rule 8 — so the same lead
// has the same color whether Ben opens the admin board or Philip + Paul
// open their portal. Other clients keep their bespoke palettes.
const AUDIENCE_COLOR: Record<ClientLeadAudience, string> = {
  parent: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  coach: "bg-sky-500/15 text-sky-300 border-sky-500/30",
  player: "bg-lime-500/15 text-lime-300 border-lime-500/30",
  club: "bg-violet-500/15 text-violet-300 border-violet-500/30",
  unknown: "bg-slate-700/40 text-slate-400 border-slate-600",
  hobbyist: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  forester: "bg-lime-500/15 text-lime-300 border-lime-500/30",
  tym: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  hunter: "bg-rose-500/15 text-rose-300 border-rose-500/30",
  dealer: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  community: "bg-violet-500/15 text-violet-300 border-violet-500/30",
};
const STATUS_LABEL: Record<ClientLeadFunnelStatus, string> = {
  not_enrolled: "Not enrolled",
  enrolled: "In funnel",
  paused: "Paused",
  responded: "Responded",
  converted: "Converted",
  completed: "Completed",
};
const STATUS_COLOR: Record<ClientLeadFunnelStatus, string> = {
  not_enrolled: "bg-slate-800 text-slate-300",
  enrolled: "bg-blue-500/20 text-blue-300",
  paused: "bg-amber-500/20 text-amber-300",
  responded: "bg-emerald-500/20 text-emerald-300",
  converted: "bg-emerald-500 text-white",
  completed: "bg-slate-700 text-slate-400",
};

type Counts = {
  total: number;
  byAudience: Record<string, number>;
  byStatus: Record<string, number>;
};

type FunnelRun = {
  id: string;
  enrolled: number;
  steps_sent: number;
  steps_skipped: number;
  errors_count: number;
  triggered_by: "cron" | "manual" | "api";
  duration_ms: number | null;
  ran_at: string;
};

export default function ClientLeadsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [leads, setLeads] = useState<ClientLead[]>([]);
  const [counts, setCounts] = useState<Counts | null>(null);
  const [loading, setLoading] = useState(true);
  const [audienceFilter, setAudienceFilter] = useState<"" | ClientLeadAudience>("");
  const [statusFilter, setStatusFilter] = useState<"" | ClientLeadFunnelStatus>(
    "",
  );
  // Faceted filters layered on top of the server-side audience+status
  // filters. These narrow the *already-loaded* leads client-side using
  // the lead-context columns populated by /api/clients/inquire (gender,
  // age_group, competition_tier, state_override). The dashboard-side
  // filtering is fast even on the 200-row default list.
  const [genderFacet, setGenderFacet] = useState<"" | "male" | "female">("");
  const [ageFacet, setAgeFacet] = useState<string>("");
  const [tierFacet, setTierFacet] = useState<string>("");
  const [stateFacet, setStateFacet] = useState<string>("");
  // Revenue toggle: "" = no filter, "yes" = only leads with $ recorded,
  // "no" = only leads without $ recorded.
  const [revenueFacet, setRevenueFacet] = useState<"" | "yes" | "no">("");
  const [openLead, setOpenLead] = useState<ClientLead | null>(null);
  const [runningFunnel, setRunningFunnel] = useState(false);
  const [runResult, setRunResult] = useState<string | null>(null);
  const [runs, setRuns] = useState<FunnelRun[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  // Per-audience cost totals from /api/client-funnel-costs?group=audience.
  // Keys are audience codes (parent / coach / ...) and "" for unattributed.
  const [costsByAud, setCostsByAud] = useState<Record<string, number>>({});
  // Pagination — CLAUDE.md: never render more than 100 lead rows. 50/page
  // cap. Resets when any filter narrows the set.
  const PAGE_SIZE = 50;
  const [page, setPage] = useState(0);
  useEffect(() => {
    setPage(0);
  }, [audienceFilter, statusFilter, genderFacet, ageFacet, tierFacet, stateFacet, revenueFacet]);

  const runFunnelNow = async () => {
    setRunningFunnel(true);
    setRunResult(null);
    try {
      const r = await fetch("/api/client-funnels/run", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ client: slug }),
      });
      const j = (await r.json()) as {
        ok: boolean;
        summaries?: { enrolled: number; steps_sent: number; errors: unknown[] }[];
        error?: string;
      };
      if (j.ok && j.summaries?.[0]) {
        const s = j.summaries[0];
        setRunResult(
          `Enrolled ${s.enrolled} · sent ${s.steps_sent}${s.errors.length > 0 ? ` · ${s.errors.length} errors` : ""}`,
        );
      } else {
        setRunResult(`Error: ${j.error ?? "unknown"}`);
      }
      await load();
    } finally {
      setRunningFunnel(false);
    }
  };

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ client: slug });
    if (audienceFilter) params.set("audience", audienceFilter);
    if (statusFilter) params.set("status", statusFilter);

    const [leadsRes, countsRes, runsRes, costsRes] = await Promise.all([
      fetch(`/api/client-leads?${params}`),
      fetch(`/api/client-leads?client=${encodeURIComponent(slug)}&counts=1`),
      fetch(`/api/client-funnels/runs?client=${encodeURIComponent(slug)}&limit=10`),
      fetch(
        `/api/client-funnel-costs?client=${encodeURIComponent(slug)}&group=audience`,
      ),
    ]);
    const leadsJson = (await leadsRes.json()) as {
      ok: boolean;
      leads?: ClientLead[];
    };
    const countsJson = (await countsRes.json()) as Counts & { ok: boolean };
    const runsJson = (await runsRes.json()) as { ok: boolean; runs?: FunnelRun[] };
    const costsJson = (await costsRes.json()) as {
      ok: boolean;
      totals?: Record<string, number>;
    };
    if (leadsJson.ok && leadsJson.leads) setLeads(leadsJson.leads);
    if (countsJson.ok) setCounts(countsJson);
    if (runsJson.ok && runsJson.runs) setRuns(runsJson.runs);
    if (costsJson.ok && costsJson.totals) setCostsByAud(costsJson.totals);
    setLoading(false);
  }, [slug, audienceFilter, statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  // Apply the 4 client-side facets on top of the loaded `leads`. Each
  // facet matches a substring (case-insensitive) — handles Camp Finder's
  // multi-pick fields where age_group can be "U9-U10 + U11-U12" and a
  // facet of "U11-U12" should still match.
  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      if (genderFacet && l.gender !== genderFacet) return false;
      if (
        ageFacet &&
        !(l.age_group ?? "").toLowerCase().includes(ageFacet.toLowerCase())
      )
        return false;
      if (
        tierFacet &&
        !(l.competition_tier ?? "")
          .toLowerCase()
          .includes(tierFacet.toLowerCase())
      )
        return false;
      if (stateFacet && l.state_override !== stateFacet) return false;
      if (revenueFacet === "yes" && l.conversion_value_cents === null) return false;
      if (revenueFacet === "no" && l.conversion_value_cents !== null) return false;
      return true;
    });
  }, [leads, genderFacet, ageFacet, tierFacet, stateFacet, revenueFacet]);

  // Per-facet value pools — built from the loaded leads (post-server
  // audience+status filter). Lets the dropdowns show only values the
  // user could meaningfully pick.
  const facetPool = useMemo(() => {
    const ages = new Map<string, number>();
    const tiers = new Map<string, number>();
    const states = new Map<string, number>();
    for (const l of leads) {
      // Camp Finder writes joined labels like "U9-U10 + U11-U12" — split
      // them so each band gets counted on its own.
      if (l.age_group) {
        for (const a of l.age_group.split(/\s*\+\s*/)) {
          if (a) ages.set(a, (ages.get(a) ?? 0) + 1);
        }
      }
      if (l.competition_tier) {
        for (const t of l.competition_tier.split(/\s*\+\s*/)) {
          if (t) tiers.set(t, (tiers.get(t) ?? 0) + 1);
        }
      }
      if (l.state_override) {
        states.set(l.state_override, (states.get(l.state_override) ?? 0) + 1);
      }
    }
    const sortByCount = (a: [string, number], b: [string, number]) =>
      b[1] - a[1] || a[0].localeCompare(b[0]);
    return {
      ages: Array.from(ages.entries()).sort(sortByCount),
      tiers: Array.from(tiers.entries()).sort(sortByCount),
      states: Array.from(states.entries()).sort(sortByCount),
    };
  }, [leads]);

  // Per-funnel ROI rollups — compute revenue, conversions, and full
  // funnel context (lead count, conversion rate, $ per lead, avg deal
  // size) per audience segment. Surfaces "is this funnel paying off?"
  // at a glance without drilling in.
  //
  // Note: this only sees the LOADED window (last 200 by default). For
  // long-running clients we'd swap to a server-side aggregate, but at
  // current Zenith volume the in-memory roll-up is fine + responsive.
  type FunnelPerf = {
    cents: number;
    convCount: number;
    leadCount: number;
  };
  const { revenueTotalCents, funnelPerf } = useMemo(() => {
    let total = 0;
    const byAud = new Map<string, FunnelPerf>();
    for (const l of leads) {
      const key = l.audience_segment ?? "unknown";
      const cur = byAud.get(key) ?? { cents: 0, convCount: 0, leadCount: 0 };
      cur.leadCount += 1;
      const v = l.conversion_value_cents;
      if (v !== null && v !== undefined) {
        cur.cents += v;
        cur.convCount += 1;
        total += v;
      } else if (l.funnel_status === "converted") {
        // Counted as a conversion even without a $ value attached
        cur.convCount += 1;
      }
      byAud.set(key, cur);
    }
    return {
      revenueTotalCents: total,
      // Sort by revenue desc; tie-break on conversion count then lead
      // count so an empty funnel doesn't shove a paying one down.
      funnelPerf: Array.from(byAud.entries()).sort(
        (a, b) =>
          b[1].cents - a[1].cents ||
          b[1].convCount - a[1].convCount ||
          b[1].leadCount - a[1].leadCount,
      ),
    };
  }, [leads]);

  const anyFacetActive =
    genderFacet || ageFacet || tierFacet || stateFacet || revenueFacet;
  const clearFacets = () => {
    setGenderFacet("");
    setAgeFacet("");
    setTierFacet("");
    setStateFacet("");
    setRevenueFacet("");
  };
  const leadsWithRevenue = leads.filter(
    (l) => l.conversion_value_cents !== null,
  ).length;

  // Funnel-cost manager modal state. Defined here so we can compute the
  // current per-audience cost totals for display + edit.
  const [costsModalOpen, setCostsModalOpen] = useState(false);

  const updateLead = async (id: string, patch: Partial<ClientLead>) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ...patch } : l)),
    );
    if (openLead?.id === id) setOpenLead({ ...openLead, ...patch });
    await fetch(`/api/client-leads/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(patch),
    });
    load();
  };

  /** Bulk apply a patch to all selected leads. */
  const bulkUpdate = async (patch: Partial<ClientLead>) => {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    if (!confirm(`Apply to ${ids.length} lead${ids.length === 1 ? "" : "s"}?`)) return;
    await Promise.all(
      ids.map((id) =>
        fetch(`/api/client-leads/${id}`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(patch),
        }),
      ),
    );
    setSelected(new Set());
    load();
  };

  /** Mark selected leads converted with an optional $ value applied to
   *  EACH. We prompt rather than splitting the value because most bulk
   *  conversions in practice are "all 4 of these bought one $90 ball." */
  const bulkMarkConverted = () => {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    const raw = window.prompt(
      `$ value of EACH conversion? (e.g. 90 for one TEKKY ball, leave blank to skip)\n\nApplied to ${ids.length} lead${ids.length === 1 ? "" : "s"}.`,
      "",
    );
    if (raw === null) return; // cancelled
    const cents = dollarsInputToCents(raw);
    if (raw.trim() !== "" && cents === null) {
      alert("Couldn't parse that as a dollar amount. Try '90' or '89.99'.");
      return;
    }
    bulkUpdate({
      funnel_status: "converted",
      ...(cents !== null ? { conversion_value_cents: cents } : {}),
    });
  };

  const toggleSelect = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <>
      {/* Sub-action bar — count + Run Funnel button.
          Tab bar (back-nav, title, Site link) supplied by the
          [slug]/layout via ClientTabsBar. */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-3 border-b border-slate-800/50 flex items-center gap-3 flex-wrap">
        <span className="text-[11px] text-slate-500 flex-1">
          {counts ? `${counts.total} total leads` : "Loading…"}
        </span>
        <button
          onClick={runFunnelNow}
          disabled={runningFunnel}
          className="text-[11px] tracking-wider uppercase font-bold text-emerald-300 hover:text-white border border-emerald-700/50 px-2.5 py-1 rounded disabled:opacity-50"
          title="Enroll new leads + send any due funnel steps right now"
        >
          {runningFunnel ? "Running…" : "Run funnel"}
        </button>
      </div>
      {runResult && (
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-2 text-[11px] text-emerald-300 border-b border-emerald-700/30 bg-emerald-950/20">
          ✓ {runResult}
        </div>
      )}

      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-5 pb-32">
        {/* Run history strip — last cron pulse so Ben can confirm
            "yes the funnel is firing". Hidden if no runs logged yet. */}
        {runs.length > 0 && (
          <div className="mb-3 flex items-center gap-2 text-[11px] text-slate-400 flex-wrap">
            <span className="text-slate-500">Funnel cron:</span>
            <span className="text-emerald-300">
              ✓ last ran {timeAgo(runs[0].ran_at)} ({runs[0].triggered_by})
            </span>
            <span className="text-slate-600">·</span>
            <span>
              {runs[0].enrolled} enrolled · {runs[0].steps_sent} sent
              {runs[0].errors_count > 0 && (
                <span className="text-rose-400"> · {runs[0].errors_count} errors</span>
              )}
            </span>
            <details className="ml-auto">
              <summary className="text-slate-500 hover:text-slate-300 cursor-pointer">
                Run history ({runs.length})
              </summary>
              <div className="absolute right-4 sm:right-6 mt-2 z-10 bg-slate-900 border border-slate-700 rounded-lg p-3 max-w-md w-72 shadow-xl">
                <ol className="space-y-1.5 text-[11px]">
                  {runs.map((r) => (
                    <li key={r.id} className="flex items-center gap-2 text-slate-300">
                      <span className="text-slate-500 w-12 shrink-0">
                        {timeAgo(r.ran_at)}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[9px] uppercase tracking-wider font-bold">
                        {r.triggered_by}
                      </span>
                      <span>
                        {r.enrolled}E · {r.steps_sent}S
                        {r.steps_skipped > 0 && (
                          <span className="text-amber-300"> · {r.steps_skipped}sk</span>
                        )}
                        {r.errors_count > 0 && (
                          <span className="text-rose-400"> · {r.errors_count}!</span>
                        )}
                      </span>
                      {r.duration_ms !== null && (
                        <span className="ml-auto text-slate-600">
                          {r.duration_ms}ms
                        </span>
                      )}
                    </li>
                  ))}
                </ol>
              </div>
            </details>
          </div>
        )}

        {/* Bulk-action toolbar — shows when leads selected */}
        {selected.size > 0 && (
          <div className="mb-3 sticky top-[60px] z-10 bg-blue-950/80 backdrop-blur border border-blue-500/40 rounded-lg p-2 flex items-center gap-2 text-xs flex-wrap">
            <span className="font-bold text-blue-200 px-2">
              {selected.size} selected
            </span>
            <button
              onClick={() => bulkUpdate({ funnel_status: "paused" })}
              className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 px-2.5 py-1 rounded font-bold"
            >
              Pause funnel
            </button>
            <button
              onClick={() => bulkUpdate({ funnel_status: "enrolled" })}
              className="bg-blue-500/30 hover:bg-blue-500/40 text-blue-200 px-2.5 py-1 rounded font-bold"
            >
              Force enroll
            </button>
            <button
              onClick={() => bulkUpdate({ funnel_status: "responded" })}
              className="bg-emerald-500/30 hover:bg-emerald-500/40 text-emerald-200 px-2.5 py-1 rounded font-bold"
            >
              Mark responded
            </button>
            <button
              onClick={bulkMarkConverted}
              className="bg-emerald-500 hover:bg-emerald-400 text-white px-2.5 py-1 rounded font-bold"
              title="Mark converted + record revenue"
            >
              Mark converted 💰
            </button>
            <button
              onClick={() => setSelected(new Set())}
              className="ml-auto text-slate-400 hover:text-white px-2 py-1"
            >
              Clear
            </button>
          </div>
        )}

        {/* Stats cards */}
        {counts && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mb-5">
            <StatCard label="Total" value={counts.total} accent="slate" />
            <StatCard
              label="In funnel"
              value={counts.byStatus["enrolled"] ?? 0}
              accent="blue"
            />
            <StatCard
              label="Responded"
              value={counts.byStatus["responded"] ?? 0}
              accent="emerald"
            />
            <StatCard
              label="Converted"
              value={counts.byStatus["converted"] ?? 0}
              accent="amber"
            />
            <StatCard
              label="Revenue"
              value={centsToDollars(revenueTotalCents)}
              accent="emerald"
            />
          </div>
        )}

        {/* Per-funnel ROI cards — full "is this funnel paying off?"
            view for every audience segment with at least one lead.
            Each card shows: lead count, conversion rate, revenue,
            $/lead, avg deal size. Sorted by revenue desc so the
            best-paying funnel surfaces first.
            Filter by clicking the audience header to scope the rest
            of the dashboard to that funnel. */}
        {funnelPerf.length > 0 && (
          <div className="mb-5 rounded-lg border border-emerald-700/30 bg-gradient-to-br from-emerald-950/30 to-slate-900/30 p-3">
            <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
              <div className="text-[10px] tracking-[0.22em] uppercase font-bold text-emerald-300">
                💰 Funnel performance
              </div>
              <div className="flex items-center gap-3 text-[10px]">
                <span className="text-slate-500">
                  Revenue:{" "}
                  <span className="text-emerald-300 font-bold">
                    {centsToDollars(revenueTotalCents)}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => setCostsModalOpen(true)}
                  className="text-rose-300 hover:text-rose-200 underline decoration-rose-500/40 underline-offset-2"
                  title="Add or edit funnel costs"
                >
                  Manage costs →
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {funnelPerf.map(([aud, info]) => {
                const convRatePct =
                  info.leadCount > 0
                    ? (info.convCount / info.leadCount) * 100
                    : 0;
                const revPerLeadCents =
                  info.leadCount > 0
                    ? Math.round(info.cents / info.leadCount)
                    : 0;
                const avgDealCents =
                  info.convCount > 0
                    ? Math.round(info.cents / info.convCount)
                    : 0;
                const costCents = costsByAud[aud] ?? 0;
                const netCents = info.cents - costCents;
                const roiPct =
                  costCents > 0 ? (netCents / costCents) * 100 : null;
                const isFiltered = audienceFilter === aud;
                return (
                  <button
                    key={aud}
                    type="button"
                    onClick={() =>
                      setAudienceFilter(
                        isFiltered ? "" : (aud as ClientLeadAudience),
                      )
                    }
                    className={`text-left rounded-md border px-3 py-2.5 transition ${
                      isFiltered
                        ? "border-emerald-400/60 bg-emerald-500/10 ring-2 ring-emerald-400/30"
                        : "border-emerald-800/40 bg-slate-900/50 hover:border-emerald-700/60"
                    }`}
                    title={`Click to filter to ${aud} leads`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-slate-100 text-sm">
                        {AUDIENCE_LABEL[aud as ClientLeadAudience] ?? aud}
                      </span>
                      <span className="text-[10px] text-slate-500 tabular-nums">
                        {info.leadCount} lead{info.leadCount === 1 ? "" : "s"}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2 mb-1.5">
                      <span className="text-xl font-black tracking-tight text-emerald-300 leading-none">
                        {centsToDollars(info.cents)}
                      </span>
                      <span className="text-[10px] text-slate-500">rev</span>
                    </div>
                    {/* Cost / net / ROI line — only renders when a
                        cost has been logged for this audience. */}
                    {costCents > 0 && (
                      <div className="mb-1.5 grid grid-cols-3 gap-2 text-[10px] rounded bg-slate-950/50 border border-slate-800 px-2 py-1">
                        <div>
                          <div className="text-rose-400/70 uppercase tracking-wider text-[9px]">
                            Cost
                          </div>
                          <div className="text-rose-300 font-bold">
                            -{centsToDollars(costCents)}
                          </div>
                        </div>
                        <div>
                          <div className="text-slate-500 uppercase tracking-wider text-[9px]">
                            Net
                          </div>
                          <div
                            className={`font-bold ${
                              netCents >= 0
                                ? "text-emerald-300"
                                : "text-rose-300"
                            }`}
                          >
                            {netCents >= 0 ? "" : "-"}
                            {centsToDollars(Math.abs(netCents))}
                          </div>
                        </div>
                        <div>
                          <div className="text-slate-500 uppercase tracking-wider text-[9px]">
                            ROI
                          </div>
                          <div
                            className={`font-bold ${
                              roiPct === null
                                ? "text-slate-500"
                                : roiPct > 0
                                  ? "text-emerald-300"
                                  : "text-rose-300"
                            }`}
                          >
                            {roiPct === null
                              ? "—"
                              : `${roiPct >= 0 ? "+" : ""}${roiPct.toFixed(0)}%`}
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="grid grid-cols-3 gap-1 text-[10px] text-slate-400">
                      <div>
                        <div className="text-slate-500 uppercase tracking-wider text-[9px]">
                          Conv rate
                        </div>
                        <div
                          className={
                            convRatePct >= 10
                              ? "text-emerald-300 font-bold"
                              : convRatePct >= 3
                                ? "text-amber-300 font-bold"
                                : "text-slate-300"
                          }
                        >
                          {convRatePct.toFixed(1)}%
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-500 uppercase tracking-wider text-[9px]">
                          $ / lead
                        </div>
                        <div className="text-slate-200 font-bold">
                          {centsToDollars(revPerLeadCents)}
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-500 uppercase tracking-wider text-[9px]">
                          Avg deal
                        </div>
                        <div className="text-slate-200 font-bold">
                          {info.convCount > 0
                            ? centsToDollars(avgDealCents)
                            : "—"}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] text-slate-600 mt-2 italic">
              Click a funnel to filter the lead list. Conv rate counts every
              lead marked "converted"; $ figures only count conversions with
              a recorded value.
            </p>
          </div>
        )}

        {/* Audience breakdown */}
        {counts && Object.keys(counts.byAudience).length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-5">
            {(Object.keys(counts.byAudience) as string[]).map((aud) => {
              const k = (aud as ClientLeadAudience) ?? "unknown";
              const count = counts.byAudience[aud] ?? 0;
              const isActive = audienceFilter === aud;
              return (
                <button
                  key={aud}
                  onClick={() =>
                    setAudienceFilter(isActive ? "" : (aud as ClientLeadAudience))
                  }
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-full border transition ${
                    isActive
                      ? AUDIENCE_COLOR[k] + " ring-2 ring-white/30"
                      : AUDIENCE_COLOR[k]
                  }`}
                >
                  {AUDIENCE_LABEL[k] ?? aud} · {count}
                </button>
              );
            })}
            {audienceFilter && (
              <button
                onClick={() => setAudienceFilter("")}
                className="text-[11px] text-slate-400 hover:text-white px-2 py-1"
              >
                Clear
              </button>
            )}
          </div>
        )}

        {/* Status filter */}
        <div className="flex items-center gap-2 mb-3 text-xs">
          <span className="text-slate-500">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as ClientLeadFunnelStatus | "")
            }
            className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-sm"
          >
            <option value="">All</option>
            {(Object.keys(STATUS_LABEL) as ClientLeadFunnelStatus[]).map(
              (s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s]}
                </option>
              ),
            )}
          </select>
        </div>

        {/* Faceted filters · gender × age × tier × state.
            Powered by the lead-context columns the inquire route
            extracts from Build Your Player + Camp Finder payloads.
            Empty pools (no leads have an age_group yet) hide the
            corresponding dropdown so the UI doesn't show useless
            "All —" controls. */}
        {(facetPool.ages.length > 0 ||
          facetPool.tiers.length > 0 ||
          facetPool.states.length > 0 ||
          leads.some((l) => l.gender)) && (
          <div className="mb-4 rounded-lg border border-slate-800 bg-slate-900/30 p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] tracking-[0.22em] uppercase font-bold text-slate-400">
                Filter by player context
              </span>
              {anyFacetActive ? (
                <button
                  onClick={clearFacets}
                  className="ml-auto text-[11px] text-slate-400 hover:text-white"
                >
                  Clear filters ✕
                </button>
              ) : (
                <span className="ml-auto text-[10px] text-slate-600">
                  Showing {filteredLeads.length} of {leads.length}
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              {leadsWithRevenue > 0 && (
                <div
                  className={`flex items-center gap-1 rounded-md border px-2 py-1 ${
                    revenueFacet
                      ? "border-emerald-500/50 bg-emerald-500/10"
                      : "border-slate-700 bg-slate-900/40"
                  }`}
                >
                  <span
                    className={`text-[10px] tracking-wider uppercase font-bold ${
                      revenueFacet ? "text-emerald-200" : "text-slate-500"
                    }`}
                  >
                    💰 $
                  </span>
                  <button
                    type="button"
                    onClick={() => setRevenueFacet("")}
                    className={`text-[11px] px-1.5 rounded ${revenueFacet === "" ? "bg-white/10 text-white" : "text-slate-400 hover:text-white"}`}
                  >
                    All
                  </button>
                  <button
                    type="button"
                    onClick={() => setRevenueFacet("yes")}
                    className={`text-[11px] px-1.5 rounded ${revenueFacet === "yes" ? "bg-emerald-500/40 text-white" : "text-slate-400 hover:text-white"}`}
                  >
                    Has ({leadsWithRevenue})
                  </button>
                  <button
                    type="button"
                    onClick={() => setRevenueFacet("no")}
                    className={`text-[11px] px-1.5 rounded ${revenueFacet === "no" ? "bg-amber-500/40 text-white" : "text-slate-400 hover:text-white"}`}
                  >
                    None ({leads.length - leadsWithRevenue})
                  </button>
                </div>
              )}
              {leads.some((l) => l.gender) && (
                <FacetSelect
                  label="Gender"
                  value={genderFacet}
                  onChange={(v) =>
                    setGenderFacet(v as "" | "male" | "female")
                  }
                  options={[
                    { value: "male", label: "Boy / Man" },
                    { value: "female", label: "Girl / Woman" },
                  ]}
                />
              )}
              {facetPool.ages.length > 0 && (
                <FacetSelect
                  label="Age"
                  value={ageFacet}
                  onChange={setAgeFacet}
                  options={facetPool.ages.map(([v, n]) => ({
                    value: v,
                    label: `${v} (${n})`,
                  }))}
                />
              )}
              {facetPool.tiers.length > 0 && (
                <FacetSelect
                  label="Tier"
                  value={tierFacet}
                  onChange={setTierFacet}
                  options={facetPool.tiers.map(([v, n]) => ({
                    value: v,
                    label: `${v} (${n})`,
                  }))}
                />
              )}
              {facetPool.states.length > 0 && (
                <FacetSelect
                  label="State"
                  value={stateFacet}
                  onChange={setStateFacet}
                  options={facetPool.states.map(([v, n]) => ({
                    value: v,
                    label: `${v} (${n})`,
                  }))}
                />
              )}
            </div>
            {anyFacetActive && (
              <div className="mt-2 text-[11px] text-emerald-300">
                {filteredLeads.length} of {leads.length} leads match
              </div>
            )}
          </div>
        )}

        {loading && leads.length === 0 && (
          <div className="text-center text-slate-500 py-10">Loading…</div>
        )}

        {!loading && leads.length === 0 && (
          <div className="text-center text-slate-500 py-10 border border-dashed border-slate-800 rounded-lg">
            <div className="text-4xl mb-2">📥</div>
            <p>No leads yet for {slug}.</p>
            <p className="text-xs mt-2">
              Submissions to /clients/{slug} forms will appear here.
            </p>
          </div>
        )}

        {!loading && leads.length > 0 && filteredLeads.length === 0 && (
          <div className="text-center text-slate-500 py-10 border border-dashed border-slate-800 rounded-lg">
            <div className="text-4xl mb-2">🔍</div>
            <p>No leads match these filters.</p>
            <button
              onClick={clearFacets}
              className="text-xs mt-2 text-blue-300 hover:text-blue-200"
            >
              Clear filters →
            </button>
          </div>
        )}

        {/* Page slice — capped at 50 per CLAUDE.md rule. */}
        {(() => null)()}
        {/* Lead list */}
        <div className="space-y-2">
          {(() => {
            const pageCount = Math.max(1, Math.ceil(filteredLeads.length / PAGE_SIZE));
            const safePage = Math.min(page, pageCount - 1);
            const pageStart = safePage * PAGE_SIZE;
            return filteredLeads.slice(pageStart, pageStart + PAGE_SIZE);
          })().map((lead) => (
            <div
              key={lead.id}
              className={`flex items-stretch gap-2 rounded-lg border transition ${
                selected.has(lead.id)
                  ? "border-blue-500/50 bg-blue-950/30"
                  : "border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900"
              }`}
            >
              <label
                className="px-3 py-3 sm:py-4 flex items-start cursor-pointer"
                onClick={(e) => e.stopPropagation()}
              >
                <input
                  type="checkbox"
                  checked={selected.has(lead.id)}
                  onChange={() => toggleSelect(lead.id)}
                  className="rounded mt-1"
                />
              </label>
              <button
                onClick={() => setOpenLead(lead)}
                className="flex-1 text-left p-3 sm:p-4 pl-0"
              >
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-[15px] truncate">
                      {lead.name || "(no name)"}
                    </span>
                    {lead.audience_segment && (
                      <span
                        className={`text-[9px] tracking-wider uppercase font-extrabold px-1.5 py-0.5 rounded border ${
                          AUDIENCE_COLOR[lead.audience_segment] ??
                          "bg-slate-700/40 text-slate-300 border-slate-600"
                        }`}
                      >
                        {(AUDIENCE_LABEL[lead.audience_segment] ?? lead.audience_segment)
                          .split(" ")
                          .slice(1)
                          .join(" ") || lead.audience_segment}
                      </span>
                    )}
                    <span
                      className={`text-[9px] tracking-wider uppercase font-extrabold px-1.5 py-0.5 rounded ${STATUS_COLOR[lead.funnel_status]}`}
                    >
                      {STATUS_LABEL[lead.funnel_status]}
                    </span>
                    {lead.conversion_value_cents !== null && (
                      <span className="text-[9px] tracking-wider uppercase font-extrabold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                        💰 {centsToDollars(lead.conversion_value_cents)}
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-400 flex-wrap">
                    {lead.email && <span className="truncate">{lead.email}</span>}
                    {lead.phone && (
                      <>
                        <span>·</span>
                        <span>{lead.phone}</span>
                      </>
                    )}
                  </div>
                  {lead.intent && (
                    <div className="mt-1 text-[12px] text-slate-300">
                      <span className="text-slate-500">Intent:</span> {lead.intent}
                    </div>
                  )}
                </div>
                <div className="text-[10px] text-slate-500 shrink-0">
                  {timeAgo(lead.created_at)}
                </div>
              </div>
              </button>
            </div>
          ))}
        </div>

        {/* Paginator — only renders when there's more than one page */}
        {filteredLeads.length > PAGE_SIZE && (() => {
          const pageCount = Math.max(1, Math.ceil(filteredLeads.length / PAGE_SIZE));
          const safePage = Math.min(page, pageCount - 1);
          const pageStart = safePage * PAGE_SIZE;
          const pageEnd = Math.min(pageStart + PAGE_SIZE, filteredLeads.length);
          return (
            <div className="mt-4 flex items-center justify-between gap-2 flex-wrap">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={safePage === 0}
                className="text-[11px] font-bold px-3 py-1.5 rounded border border-slate-700 text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ← Prev
              </button>
              <div className="text-[11px] text-slate-400 font-mono">
                {pageStart + 1}-{pageEnd} of {filteredLeads.length} · page {safePage + 1}/{pageCount}
              </div>
              <button
                onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
                disabled={safePage >= pageCount - 1}
                className="text-[11px] font-bold px-3 py-1.5 rounded border border-slate-700 text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            </div>
          );
        })()}
      </main>

      {/* Detail drawer */}
      {openLead && (
        <LeadDetailDrawer
          lead={openLead}
          onClose={() => setOpenLead(null)}
          onUpdate={updateLead}
        />
      )}

      {/* Funnel-costs manager — opens from the ROI panel header */}
      {costsModalOpen && (
        <FunnelCostsModal
          slug={slug}
          onClose={() => {
            setCostsModalOpen(false);
            load();
          }}
        />
      )}
    </>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number | string;
  accent: "slate" | "blue" | "emerald" | "amber";
}) {
  const colors: Record<typeof accent, string> = {
    slate: "bg-slate-900/60 border-slate-800 text-slate-100",
    blue: "bg-blue-950/40 border-blue-500/30 text-blue-100",
    emerald: "bg-emerald-950/40 border-emerald-500/30 text-emerald-100",
    amber: "bg-amber-950/40 border-amber-500/30 text-amber-100",
  };
  return (
    <div className={`rounded-lg border p-3 ${colors[accent]}`}>
      <div className="text-[10px] tracking-wider uppercase font-bold opacity-70">
        {label}
      </div>
      <div className="mt-1 text-2xl font-black tracking-tighter">{value}</div>
    </div>
  );
}

type LeadMessage = {
  id: string;
  funnel_step: number | null;
  channel: "email" | "sms" | "voicemail";
  direction: "outbound" | "inbound";
  to_address: string | null;
  from_address: string | null;
  subject: string | null;
  body: string | null;
  template_id: string | null;
  status: string;
  provider: string | null;
  error: string | null;
  sent_at: string;
};

function LeadDetailDrawer({
  lead,
  onClose,
  onUpdate,
}: {
  lead: ClientLead;
  onClose: () => void;
  onUpdate: (id: string, patch: Partial<ClientLead>) => void;
}) {
  const [notesDraft, setNotesDraft] = useState(lead.notes ?? "");
  const [messages, setMessages] = useState<LeadMessage[]>([]);
  const [loadingMsgs, setLoadingMsgs] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingMsgs(true);
      const r = await fetch(`/api/client-leads/${lead.id}/messages`);
      const j = (await r.json()) as { ok: boolean; messages?: LeadMessage[] };
      if (!cancelled && j.ok && j.messages) setMessages(j.messages);
      setLoadingMsgs(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [lead.id]);

  return (
    <div
      className="fixed inset-0 z-30 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-6"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 border border-slate-700 rounded-t-2xl sm:rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-slate-900 border-b border-slate-800 px-5 py-3 flex items-center justify-between">
          <div className="font-semibold">{lead.name || "(no name)"}</div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Contact */}
          <section>
            <div className="text-[10px] tracking-wider uppercase font-bold text-slate-500 mb-2">
              Contact
            </div>
            <div className="space-y-1 text-sm">
              {lead.email && (
                <div>
                  <a
                    className="text-blue-300 hover:text-blue-200"
                    href={`mailto:${lead.email}`}
                  >
                    ✉ {lead.email}
                  </a>
                </div>
              )}
              {lead.phone && (
                <div className="flex gap-3">
                  <a
                    className="text-blue-300 hover:text-blue-200"
                    href={`tel:${lead.phone}`}
                  >
                    ☎ {lead.phone}
                  </a>
                  <a
                    className="text-blue-300 hover:text-blue-200"
                    href={`sms:${lead.phone}`}
                  >
                    💬 Text
                  </a>
                </div>
              )}
            </div>
          </section>

          {/* Audience tagging */}
          <section>
            <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
              <div className="text-[10px] tracking-wider uppercase font-bold text-slate-500">
                Audience
              </div>
              <AISuggestButton lead={lead} onApply={onUpdate} />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(["parent", "coach", "player", "club", "unknown"] as ClientLeadAudience[]).map(
                (a) => (
                  <button
                    key={a}
                    onClick={() => onUpdate(lead.id, { audience_segment: a })}
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-full border transition ${
                      lead.audience_segment === a
                        ? AUDIENCE_COLOR[a] + " ring-2 ring-white/30"
                        : "border-slate-700 text-slate-400 hover:text-white"
                    }`}
                  >
                    {AUDIENCE_LABEL[a]}
                  </button>
                ),
              )}
            </div>
          </section>

          {/* Funnel status */}
          <section>
            <div className="text-[10px] tracking-wider uppercase font-bold text-slate-500 mb-2">
              Funnel status
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(Object.keys(STATUS_LABEL) as ClientLeadFunnelStatus[]).map(
                (s) => (
                  <button
                    key={s}
                    onClick={() => {
                      // Mark-converted: prompt for the $ amount inline so
                      // every conversion gets a value attached. Cancel
                      // skips the status flip; blank = flip without $.
                      if (s === "converted") {
                        const raw = window.prompt(
                          `$ value of this conversion? (e.g. 90 for one TEKKY ball)\n\nLeave blank to mark converted without recording revenue.`,
                          lead.conversion_value_cents !== null
                            ? String(lead.conversion_value_cents / 100)
                            : "",
                        );
                        if (raw === null) return; // cancelled
                        const cents = dollarsInputToCents(raw);
                        if (raw.trim() !== "" && cents === null) {
                          alert(
                            "Couldn't parse that as a dollar amount. Try '90' or '89.99'.",
                          );
                          return;
                        }
                        onUpdate(lead.id, {
                          funnel_status: "converted",
                          ...(cents !== null
                            ? { conversion_value_cents: cents }
                            : {}),
                        });
                        return;
                      }
                      onUpdate(lead.id, { funnel_status: s });
                    }}
                    className={`text-[11px] font-bold px-2.5 py-1 rounded transition ${
                      lead.funnel_status === s
                        ? STATUS_COLOR[s] + " ring-2 ring-white/40"
                        : "border border-slate-700 text-slate-400 hover:text-white"
                    }`}
                  >
                    {STATUS_LABEL[s]}
                  </button>
                ),
              )}
            </div>
            {lead.funnel_step !== null && (
              <div className="mt-2 text-xs text-slate-400">
                Step {lead.funnel_step}
                {lead.last_contact_at &&
                  ` · last contact ${timeAgo(lead.last_contact_at)}`}
              </div>
            )}
            {/* Revenue line — visible whenever converted, with an
                edit affordance so corrections + retroactive $ entry
                are one click. */}
            {(lead.funnel_status === "converted" ||
              lead.conversion_value_cents !== null) && (
              <div className="mt-3 flex items-center gap-2 text-sm">
                <span className="text-[10px] tracking-wider uppercase font-bold text-emerald-400">
                  Revenue
                </span>
                <span className="font-bold text-emerald-300">
                  {centsToDollars(lead.conversion_value_cents)}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const raw = window.prompt(
                      "Update conversion value in $ (blank to clear):",
                      lead.conversion_value_cents !== null
                        ? String(lead.conversion_value_cents / 100)
                        : "",
                    );
                    if (raw === null) return;
                    if (raw.trim() === "") {
                      onUpdate(lead.id, { conversion_value_cents: null });
                      return;
                    }
                    const cents = dollarsInputToCents(raw);
                    if (cents === null) {
                      alert(
                        "Couldn't parse that as a dollar amount. Try '90' or '89.99'.",
                      );
                      return;
                    }
                    onUpdate(lead.id, { conversion_value_cents: cents });
                  }}
                  className="text-[11px] text-blue-300 hover:text-blue-200 underline"
                >
                  Edit
                </button>
              </div>
            )}
          </section>

          {/* Intent + source */}
          {(lead.intent || lead.source) && (
            <section className="grid grid-cols-2 gap-3 text-sm">
              {lead.intent && (
                <div>
                  <div className="text-[10px] tracking-wider uppercase font-bold text-slate-500 mb-1">
                    Intent
                  </div>
                  <div>{lead.intent}</div>
                </div>
              )}
              {lead.source && (
                <div>
                  <div className="text-[10px] tracking-wider uppercase font-bold text-slate-500 mb-1">
                    Source
                  </div>
                  <div>{lead.source}</div>
                </div>
              )}
            </section>
          )}

          {/* Notes */}
          <section>
            <label className="text-[10px] tracking-wider uppercase font-bold text-slate-500 block mb-1">
              Notes
            </label>
            <textarea
              value={notesDraft}
              onChange={(e) => setNotesDraft(e.target.value)}
              rows={3}
              className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-[13px]"
              placeholder="Per-lead context (e.g. ‘called Mom, son tried out for WA Premier last week’)"
            />
            {notesDraft !== (lead.notes ?? "") && (
              <button
                onClick={() => onUpdate(lead.id, { notes: notesDraft })}
                className="mt-1.5 text-[11px] font-bold bg-blue-500 hover:bg-blue-400 text-white px-3 py-1 rounded"
              >
                Save notes
              </button>
            )}
          </section>

          {/* Funnel timeline */}
          <section>
            <div className="text-[10px] tracking-wider uppercase font-bold text-slate-500 mb-2">
              Funnel timeline ({messages.length})
            </div>
            {loadingMsgs ? (
              <div className="text-xs text-slate-500">Loading…</div>
            ) : messages.length === 0 ? (
              <div className="text-xs text-slate-500 border border-dashed border-slate-800 rounded p-3 text-center">
                No messages yet. Hit “Run funnel” on the leads page header to
                fire any due steps now.
              </div>
            ) : (
              <ol className="relative border-l border-slate-800 ml-2 space-y-3">
                {messages.map((m) => (
                  <li key={m.id} className="pl-4 relative">
                    <span
                      className={`absolute -left-[7px] top-1.5 w-3 h-3 rounded-full border-2 ${
                        m.direction === "inbound"
                          ? "bg-emerald-500 border-emerald-300"
                          : m.status === "sent"
                            ? "bg-blue-500 border-blue-300"
                            : m.status === "failed"
                              ? "bg-rose-500 border-rose-300"
                              : m.status === "skipped"
                                ? "bg-slate-700 border-slate-500"
                                : "bg-amber-500 border-amber-300"
                      }`}
                    />
                    <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-1.5">
                      <span className="font-bold text-slate-200">
                        {m.direction === "inbound" ? "← Reply" : "→ Sent"}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[9px] uppercase tracking-wider font-bold">
                        {m.channel}
                      </span>
                      {m.funnel_step !== null && (
                        <span className="text-slate-500">step {m.funnel_step}</span>
                      )}
                      <span
                        className={`text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded ${
                          m.status === "sent"
                            ? "bg-blue-500/15 text-blue-300"
                            : m.status === "failed"
                              ? "bg-rose-500/15 text-rose-300"
                              : m.status === "skipped"
                                ? "bg-slate-700/40 text-slate-400"
                                : m.status === "replied"
                                  ? "bg-emerald-500/15 text-emerald-300"
                                  : "bg-amber-500/15 text-amber-300"
                        }`}
                      >
                        {m.status}
                      </span>
                      <span className="text-slate-500">
                        · {timeAgo(m.sent_at)}
                      </span>
                    </div>
                    {m.subject && (
                      <div className="text-[13px] font-semibold text-slate-200 mt-1">
                        {m.subject}
                      </div>
                    )}
                    {m.body && (
                      <details className="mt-1">
                        <summary className="text-[11px] text-slate-500 cursor-pointer hover:text-slate-300">
                          {m.body.slice(0, 90)}
                          {m.body.length > 90 ? "…" : ""}
                        </summary>
                        <pre className="mt-1.5 text-[12px] bg-slate-950 border border-slate-800 rounded p-2 whitespace-pre-wrap text-slate-300">
                          {m.body}
                        </pre>
                      </details>
                    )}
                    {m.error && (
                      <div className="text-[11px] text-rose-400 mt-1">
                        ⚠ {m.error}
                      </div>
                    )}
                    {m.template_id && (
                      <div className="text-[10px] text-slate-600 mt-0.5">
                        {m.template_id}
                      </div>
                    )}
                  </li>
                ))}
              </ol>
            )}
          </section>

          {/* Raw payload */}
          <section>
            <details>
              <summary className="text-[10px] tracking-wider uppercase font-bold text-slate-500 cursor-pointer">
                Raw payload
              </summary>
              <pre className="mt-2 text-[11px] bg-slate-950 border border-slate-800 rounded p-3 overflow-x-auto text-slate-300">
                {JSON.stringify(lead.raw_payload, null, 2)}
              </pre>
            </details>
          </section>

          <div className="text-[10px] text-slate-600 pt-2 border-t border-slate-800">
            Created {new Date(lead.created_at).toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Tiny "🤖 Suggest" button next to the audience picker. Calls
 *  /api/client-leads/[id]/classify which sends the lead's payload to
 *  Claude Haiku and returns a suggested audience + reasoning. Renders
 *  the suggestion inline with an Apply button.
 *
 *  Usage: only enabled when a lead is currently `unknown` or null —
 *  for already-tagged leads the button still works but shows the
 *  AI's confidence so Ben can sanity-check his manual tagging. */
function AISuggestButton({
  lead,
  onApply,
}: {
  lead: ClientLead;
  onApply: (id: string, patch: Partial<ClientLead>) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [suggestion, setSuggestion] = useState<{
    audience: string;
    confidence: number;
    reasoning: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    setBusy(true);
    setError(null);
    setSuggestion(null);
    try {
      const r = await fetch(`/api/client-leads/${lead.id}/classify`, {
        method: "POST",
      });
      const j = (await r.json()) as {
        ok: boolean;
        suggestion?: {
          audience: string;
          confidence: number;
          reasoning: string;
        };
        error?: string;
      };
      if (j.ok && j.suggestion) {
        setSuggestion(j.suggestion);
      } else {
        setError(j.error ?? "Classification failed");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {suggestion ? (
        <div className="flex items-center gap-2 text-[11px] bg-violet-500/10 border border-violet-500/30 rounded-md px-2 py-1">
          <span className="text-violet-300 font-bold">
            🤖 {suggestion.audience}
          </span>
          <span
            className="text-violet-400/70"
            title={`Reasoning: ${suggestion.reasoning}`}
          >
            ({Math.round(suggestion.confidence * 100)}%)
          </span>
          <button
            type="button"
            onClick={() => {
              onApply(lead.id, {
                audience_segment:
                  suggestion.audience as ClientLeadAudience,
              });
              setSuggestion(null);
            }}
            className="bg-violet-500 hover:bg-violet-400 text-white px-2 py-0.5 rounded font-bold"
          >
            Apply
          </button>
          <button
            type="button"
            onClick={() => setSuggestion(null)}
            className="text-violet-400/60 hover:text-white"
            aria-label="Dismiss suggestion"
          >
            ✕
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={run}
          disabled={busy}
          className="text-[10px] tracking-wider uppercase font-bold text-violet-300 hover:text-white border border-violet-700/50 px-2 py-0.5 rounded disabled:opacity-50"
          title="Ask Claude to suggest an audience based on the form data"
        >
          {busy ? "🤖 thinking…" : "🤖 Suggest"}
        </button>
      )}
      {error && (
        <span className="text-[10px] text-rose-300" title={error}>
          ⚠ failed
        </span>
      )}
    </div>
  );
}

/** Funnel-costs manager modal. Lists every cost row, supports add +
 *  delete, and pipes back to the leads page so the ROI cards refresh
 *  the moment you save. Edits are intentionally minimal here — drop
 *  + re-add for tweaks at this volume. */
function FunnelCostsModal({
  slug,
  onClose,
}: {
  slug: string;
  onClose: () => void;
}) {
  type CostRow = {
    id: string;
    audience_segment: string | null;
    cost_cents: number;
    period_label: string | null;
    notes: string | null;
    created_at: string;
  };
  const [rows, setRows] = useState<CostRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [audience, setAudience] = useState<string>("");
  const [costInput, setCostInput] = useState("");
  const [period, setPeriod] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await fetch(
      `/api/client-funnel-costs?client=${encodeURIComponent(slug)}`,
    );
    const j = (await r.json()) as { ok: boolean; costs?: CostRow[] };
    if (j.ok && j.costs) setRows(j.costs);
    setLoading(false);
  }, [slug]);

  useEffect(() => {
    load();
  }, [load]);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    const cents = dollarsInputToCents(costInput);
    if (cents === null) {
      alert("Couldn't parse $ amount. Try '200' or '199.99'.");
      return;
    }
    setSaving(true);
    await fetch("/api/client-funnel-costs", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        client_slug: slug,
        cost_cents: cents,
        audience_segment: audience || null,
        period_label: period || null,
        notes: notes || null,
      }),
    });
    setSaving(false);
    setCostInput("");
    setPeriod("");
    setNotes("");
    setAudience("");
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this cost row?")) return;
    await fetch(`/api/client-funnel-costs/${id}`, { method: "DELETE" });
    load();
  };

  // Roll up totals for display under the form so the user sees the
  // current per-funnel cost summary at a glance.
  const totals = rows.reduce<Record<string, number>>((acc, r) => {
    const k = r.audience_segment ?? "(unattributed)";
    acc[k] = (acc[k] ?? 0) + r.cost_cents;
    return acc;
  }, {});
  const grandTotal = rows.reduce((acc, r) => acc + r.cost_cents, 0);

  return (
    <div
      className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-6"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 border border-slate-700 rounded-t-2xl sm:rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-slate-900 border-b border-slate-800 px-5 py-3 flex items-center justify-between">
          <div className="font-semibold">Funnel costs · {slug}</div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        <div className="p-5 space-y-5">
          <p className="text-xs text-slate-400 leading-relaxed">
            Log what each funnel cost you (ad spend, partner fees, retainers)
            so the dashboard can compute Net + ROI per audience. Add a row
            per period — the dashboard sums them all per funnel. Use a blank
            audience for general overhead.
          </p>

          {/* Add form */}
          <form
            onSubmit={add}
            className="rounded-lg border border-slate-700 bg-slate-950/40 p-3 space-y-2"
          >
            <div className="grid sm:grid-cols-2 gap-2">
              <label className="block">
                <span className="text-[10px] tracking-wider uppercase font-bold text-slate-500 block mb-1">
                  Funnel
                </span>
                <select
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-sm"
                >
                  <option value="">— overhead / unattributed</option>
                  <option value="parent">Parent</option>
                  <option value="coach">Coach</option>
                  <option value="player">Player</option>
                  <option value="club">Club</option>
                  <option value="hobbyist">Hobbyist</option>
                  <option value="forester">Forester</option>
                  <option value="tym">TYM</option>
                  <option value="hunter">Hunter</option>
                  <option value="dealer">Dealer</option>
                  <option value="community">Community</option>
                </select>
              </label>
              <label className="block">
                <span className="text-[10px] tracking-wider uppercase font-bold text-slate-500 block mb-1">
                  Cost ($)
                </span>
                <input
                  type="text"
                  value={costInput}
                  onChange={(e) => setCostInput(e.target.value)}
                  placeholder="200"
                  required
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-sm"
                />
              </label>
            </div>
            <div className="grid sm:grid-cols-2 gap-2">
              <label className="block">
                <span className="text-[10px] tracking-wider uppercase font-bold text-slate-500 block mb-1">
                  Period
                </span>
                <input
                  type="text"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  placeholder="Apr 2026 / Q2 2026 / ongoing"
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-sm"
                />
              </label>
              <label className="block">
                <span className="text-[10px] tracking-wider uppercase font-bold text-slate-500 block mb-1">
                  Notes
                </span>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Meta ads, parent campaign 4/1-30"
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-sm"
                />
              </label>
            </div>
            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={saving || !costInput.trim()}
                className="bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-700 text-white px-4 py-1.5 rounded text-sm font-bold"
              >
                {saving ? "Saving…" : "Add cost"}
              </button>
            </div>
          </form>

          {/* Totals */}
          {Object.keys(totals).length > 0 && (
            <div className="rounded-lg border border-slate-800 bg-slate-950/30 p-3 text-xs">
              <div className="text-[10px] tracking-wider uppercase font-bold text-slate-500 mb-2">
                Totals (sum of every row)
              </div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(totals).map(([aud, cents]) => (
                  <div
                    key={aud}
                    className="rounded bg-slate-900 border border-slate-800 px-2.5 py-1"
                  >
                    <span className="text-slate-400 mr-1.5">
                      {aud === "(unattributed)"
                        ? "Overhead"
                        : (AUDIENCE_LABEL[aud as ClientLeadAudience] ?? aud)}
                    </span>
                    <span className="font-bold text-rose-300">
                      {centsToDollars(cents)}
                    </span>
                  </div>
                ))}
                <div className="rounded bg-slate-900 border border-slate-700 px-2.5 py-1 ml-auto">
                  <span className="text-slate-400 mr-1.5">All funnels</span>
                  <span className="font-bold text-rose-300">
                    {centsToDollars(grandTotal)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Rows list */}
          <div>
            <div className="text-[10px] tracking-wider uppercase font-bold text-slate-500 mb-2">
              Logged rows ({rows.length})
            </div>
            {loading ? (
              <div className="text-sm text-slate-500">Loading…</div>
            ) : rows.length === 0 ? (
              <div className="text-xs text-slate-500 border border-dashed border-slate-800 rounded p-3 text-center">
                No costs logged yet. Add one above to start tracking ROI.
              </div>
            ) : (
              <ul className="space-y-1.5">
                {rows.map((r) => (
                  <li
                    key={r.id}
                    className="flex items-center gap-2 text-xs bg-slate-950/40 border border-slate-800 rounded px-2.5 py-1.5"
                  >
                    <span className="font-bold text-rose-300 tabular-nums w-20">
                      {centsToDollars(r.cost_cents)}
                    </span>
                    <span className="text-slate-300 w-24 truncate">
                      {r.audience_segment
                        ? (AUDIENCE_LABEL[
                            r.audience_segment as ClientLeadAudience
                          ] ?? r.audience_segment)
                        : "Overhead"}
                    </span>
                    <span className="text-slate-500 truncate flex-1">
                      {r.period_label ?? ""}
                      {r.period_label && r.notes ? " · " : ""}
                      {r.notes ?? ""}
                    </span>
                    <button
                      onClick={() => remove(r.id)}
                      className="text-rose-400 hover:text-rose-200 px-1.5"
                      title="Delete"
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Small labeled select used by the player-context facet row. Keeps each
 *  facet visually compact + consistent with the existing Status filter. */
function FacetSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  const active = value !== "";
  return (
    <label
      className={`flex items-center gap-1.5 rounded-md border px-2 py-1 transition ${
        active
          ? "border-emerald-500/50 bg-emerald-500/10"
          : "border-slate-700 bg-slate-900/40"
      }`}
    >
      <span
        className={`text-[10px] tracking-wider uppercase font-bold ${
          active ? "text-emerald-200" : "text-slate-500"
        }`}
      >
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent text-[12px] text-slate-200 outline-none"
      >
        <option value="">All</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

/** Parse a free-typed "$90", "89.99", "1,250" into integer cents.
 *  Returns null on garbage. Empty string returns null too — callers
 *  decide whether that means "skip the field" or "error". */
function dollarsInputToCents(raw: string): number | null {
  const s = raw.replace(/[$,\s]/g, "").trim();
  if (!s) return null;
  if (!/^\d+(\.\d{1,2})?$/.test(s)) return null;
  return Math.round(parseFloat(s) * 100);
}

/** Pretty-print cents as "$X" or "$X.XX" depending on whether the
 *  value lands on whole dollars. */
function centsToDollars(cents: number | null | undefined): string {
  if (cents === null || cents === undefined) return "—";
  const d = cents / 100;
  return d % 1 === 0
    ? `$${d.toLocaleString()}`
    : `$${d.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d`;
  return new Date(iso).toLocaleDateString();
}

/** Per-client Site ↗ button — see /dashboard/clients/[slug]/page.tsx
 *  for the canonical version. Renders disabled when no URL is wired. */
function SiteButton({ slug }: { slug: string }) {
  const site = clientSiteFor(slug);
  const base =
    "text-[11px] tracking-wider uppercase font-bold border px-2.5 py-1 rounded";
  if (site.kind === "none") {
    return (
      <span
        title="No site URL set yet — wire it in src/lib/client-site-urls.ts"
        className={`${base} text-slate-600 border-slate-800 cursor-not-allowed`}
      >
        Site ↗
      </span>
    );
  }
  return (
    <a
      href={site.href}
      target="_blank"
      rel="noopener noreferrer"
      className={`${base} text-slate-400 hover:text-white border-slate-700`}
    >
      Site ↗
    </a>
  );
}
