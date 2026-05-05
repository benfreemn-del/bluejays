"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type {
  ClientLead,
  ClientLeadAudience,
  ClientLeadFunnelStatus,
} from "@/lib/client-leads";

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
const AUDIENCE_COLOR: Record<ClientLeadAudience, string> = {
  parent: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  coach: "bg-violet-500/15 text-violet-300 border-violet-500/30",
  player: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  club: "bg-blue-500/15 text-blue-300 border-blue-500/30",
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
  const [openLead, setOpenLead] = useState<ClientLead | null>(null);
  const [runningFunnel, setRunningFunnel] = useState(false);
  const [runResult, setRunResult] = useState<string | null>(null);
  const [runs, setRuns] = useState<FunnelRun[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());

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

    const [leadsRes, countsRes, runsRes] = await Promise.all([
      fetch(`/api/client-leads?${params}`),
      fetch(`/api/client-leads?client=${encodeURIComponent(slug)}&counts=1`),
      fetch(`/api/client-funnels/runs?client=${encodeURIComponent(slug)}&limit=10`),
    ]);
    const leadsJson = (await leadsRes.json()) as {
      ok: boolean;
      leads?: ClientLead[];
    };
    const countsJson = (await countsRes.json()) as Counts & { ok: boolean };
    const runsJson = (await runsRes.json()) as { ok: boolean; runs?: FunnelRun[] };
    if (leadsJson.ok && leadsJson.leads) setLeads(leadsJson.leads);
    if (countsJson.ok) setCounts(countsJson);
    if (runsJson.ok && runsJson.runs) setRuns(runsJson.runs);
    setLoading(false);
  }, [slug, audienceFilter, statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

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

  const toggleSelect = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-20 backdrop-blur bg-slate-950/85 border-b border-slate-800">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-3 flex items-center gap-3">
          <Link
            href={`/dashboard/clients/${slug}`}
            className="text-slate-400 hover:text-white text-sm flex items-center gap-1"
          >
            ← Tasks
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-xl font-bold tracking-tight truncate">
              {slug} <span className="text-slate-500 font-normal">/ leads</span>
            </h1>
            <div className="text-[11px] text-slate-500">
              {counts ? `${counts.total} total leads` : "Loading…"}
            </div>
          </div>
          <button
            onClick={runFunnelNow}
            disabled={runningFunnel}
            className="text-[11px] tracking-wider uppercase font-bold text-emerald-300 hover:text-white border border-emerald-700/50 px-2.5 py-1 rounded disabled:opacity-50"
            title="Enroll new leads + send any due funnel steps right now"
          >
            {runningFunnel ? "Running…" : "Run funnel"}
          </button>
          <Link
            href={`/clients/${slug}`}
            target="_blank"
            className="text-[11px] tracking-wider uppercase font-bold text-slate-400 hover:text-white border border-slate-700 px-2.5 py-1 rounded"
          >
            Site ↗
          </Link>
        </div>
        {runResult && (
          <div className="mx-auto max-w-5xl px-4 sm:px-6 pb-2 text-[11px] text-emerald-300">
            ✓ {runResult}
          </div>
        )}
      </header>

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
              onClick={() => bulkUpdate({ funnel_status: "converted" })}
              className="bg-emerald-500 hover:bg-emerald-400 text-white px-2.5 py-1 rounded font-bold"
            >
              Mark converted
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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
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
        <div className="flex items-center gap-2 mb-4 text-xs">
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

        {/* Lead list */}
        <div className="space-y-2">
          {leads.map((lead) => (
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
      </main>

      {/* Detail drawer */}
      {openLead && (
        <LeadDetailDrawer
          lead={openLead}
          onClose={() => setOpenLead(null)}
          onUpdate={updateLead}
        />
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
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
            <div className="text-[10px] tracking-wider uppercase font-bold text-slate-500 mb-2">
              Audience
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
                    onClick={() => onUpdate(lead.id, { funnel_status: s })}
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
