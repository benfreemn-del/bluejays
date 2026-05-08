"use client";

/**
 * /dashboard/sales-pipeline
 *
 * Two-column kanban for active sales work:
 *
 *   Website ($997)                  $10K AI System (fullsystem)
 *   ──────────────                  ─────────────────────────────
 *   1 Preview created               1 Needs mockup
 *   2 Meeting scheduled             2 Mockup done
 *   3 Bought + paid                 3 Meeting completed
 *   4 Product delivered             4 Purchased — needs delivery
 *                                    5 Delivered, hands off
 *                                    6 Delivered + still managing $500/mo
 *
 * Track inferred from `pricingTier`:
 *   pricingTier === 'fullsystem' → $10K column
 *   anything else / undefined    → Website column
 *
 * SUB-CATEGORIES via lowercase letter suffix (added 2026-05-07):
 *   '4'  = stage 4, no sub-state
 *   '4a' = stage 4 sub-state a (e.g. awaiting first deliverable)
 *   '4b' = stage 4 sub-state b (e.g. awaiting client photos)
 *   '4c' = stage 4 sub-state c (e.g. blocked on client decision)
 *   ...up to 4z, but in practice a/b/c is plenty.
 *
 * Stage stored on prospects.pipeline_stage (text, NULL by default,
 * format-checked in Postgres). prospects.pipeline_stage is the SINGLE
 * CANONICAL lead-stage column — every funnel + every dashboard view
 * reads from it. No parallel stage on client_leads / partner_referrals
 * / anywhere else.
 *
 * Editing UX:
 *   - Each card has TWO steppers — a number stepper (1-N, clamped to
 *     per-track ceiling) and a letter stepper (none/a/b/c/d/e).
 *   - Changes are LOCAL until the user hits Save on that card. Pending
 *     changes show as amber outline + "Unsaved" pill so it's obvious.
 *   - Save calls PATCH /api/prospects/[id] with { pipelineStage: '4a' }
 *     and reflects success/failure in the card.
 */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Prospect } from "@/lib/types";

const WEBSITE_STAGES = [
  { n: 1, label: "Preview created" },
  { n: 2, label: "Meeting scheduled" },
  { n: 3, label: "Bought + paid" },
  { n: 4, label: "Product delivered" },
] as const;

const FULLSYSTEM_STAGES = [
  { n: 1, label: "Needs mockup" },
  { n: 2, label: "Mockup done" },
  { n: 3, label: "Meeting completed" },
  { n: 4, label: "Purchased · needs delivery" },
  { n: 5, label: "Delivered · hands off" },
  { n: 6, label: "Delivered + managing $500/mo" },
] as const;

// Available sub-letters in the stepper. Empty string = no letter.
// Cycle order: '' → 'a' → 'b' → 'c' → 'd' → 'e' → '' (wraps).
const LETTER_CYCLE = ["", "a", "b", "c", "d", "e"] as const;

type Track = "website" | "fullsystem";

function trackOf(p: Prospect): Track {
  return p.pricingTier === "fullsystem" ? "fullsystem" : "website";
}

function ceilingFor(track: Track): number {
  return track === "fullsystem" ? 6 : 4;
}

/** Per-prospect deal-value lookup. Drives the dollar chip on each card
 *  and the per-track total at the section header. Custom-tier is
 *  recurring ($100/yr) so we display the annualized value but mark it
 *  recurring in the UI; the others are one-time at close. */
function dealValueCents(p: Prospect): { cents: number; label: string; recurring: boolean } {
  switch (p.pricingTier) {
    case "fullsystem":
      return { cents: 970000, label: "$9.7k", recurring: false };
    case "custom":
      return { cents: 10000, label: "$100/yr", recurring: true };
    case "free":
      return { cents: 3000, label: "$30", recurring: false };
    case "standard":
    default:
      return { cents: 99700, label: "$997", recurring: false };
  }
}

function fmtUsdShort(cents: number): string {
  const d = cents / 100;
  if (d >= 1000) return `$${(d / 1000).toFixed(d % 1000 === 0 ? 0 : 1)}k`;
  return `$${Math.round(d)}`;
}

/** Days since the prospect's `updatedAt`. Used to flag stale stage
 *  cards. Rough proxy — Ben's eventually moving to a dedicated
 *  `pipeline_stage_changed_at` column, but updatedAt is good enough
 *  until then because the most recent edit is almost always the stage
 *  change. Returns null on bad input. */
function daysSinceUpdate(updatedAt: string | null | undefined): number | null {
  if (!updatedAt) return null;
  const t = Date.parse(updatedAt);
  if (Number.isNaN(t)) return null;
  return Math.floor((Date.now() - t) / (1000 * 60 * 60 * 24));
}

/** Status filter: which prospects belong on the active board. Hides
 *  the "shouldn't be here" buckets that previously made the board
 *  read inaccurate (Rule: every funnel reads from pipeline_stage,
 *  but an unsubscribed/bounced prospect with a stale stage shouldn't
 *  pollute the active view). */
const ARCHIVED_STATUSES = new Set([
  "bounced",
  "dismissed",
  "unsubscribed",
  "wont-do",
]);

type ViewMode = "active" | "stale" | "archived" | "all";

function passesViewFilter(p: Prospect, mode: ViewMode): boolean {
  const status = (p.status ?? "").toString();
  const isArchived = ARCHIVED_STATUSES.has(status);
  const days = daysSinceUpdate(p.updatedAt);
  const isStale = days != null && days > 14 && !isArchived;
  switch (mode) {
    case "active":
      return !isArchived;
    case "stale":
      return isStale;
    case "archived":
      return isArchived;
    case "all":
    default:
      return true;
  }
}

/** Parse '4a' → { num: 4, letter: 'a' }. '4' → { num: 4, letter: '' }.
 *  Falls back to { num: 1, letter: '' } on bad input. */
function parseStage(raw: string | undefined | null): { num: number; letter: string } {
  if (!raw) return { num: 1, letter: "" };
  const m = raw.match(/^([1-6])([a-z])?$/);
  if (!m) return { num: 1, letter: "" };
  return { num: parseInt(m[1], 10), letter: m[2] ?? "" };
}

function formatStage(num: number, letter: string): string {
  return letter ? `${num}${letter}` : `${num}`;
}

export default function SalesPipelinePage() {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("active");

  // Per-prospect local stage edits — keyed by prospect.id. Value is
  // the full stage string (e.g. '4a'). When this differs from the
  // persisted prospect.pipelineStage, the card shows amber outline +
  // "Unsaved" pill. Cleared on successful save.
  const [pendingStages, setPendingStages] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const dirtyCount = Object.keys(pendingStages).length;

  const fetchProspects = async () => {
    try {
      const res = await fetch("/api/prospects", { credentials: "include" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as { prospects?: Prospect[] };
      // Only the ones currently on the board.
      setProspects((data.prospects ?? []).filter((p) => p.pipelineStage != null));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProspects();
  }, []);

  // Discover the set of source_channel values present on the board so
  // the filter dropdown only offers options the operator can actually
  // pick. Sorted alpha + 'all' always first.
  const sourceOptions = useMemo(() => {
    const set = new Set<string>();
    for (const p of prospects) {
      if (p.sourceChannel) set.add(p.sourceChannel);
    }
    return ["all", ...Array.from(set).sort()];
  }, [prospects]);

  // Counts for view-mode chips — computed pre-filter so the chip
  // count reflects the size of the bucket, not a recursive double-
  // filter ("Active (12)" should mean 12 active prospects exist,
  // independent of which mode is currently selected).
  const viewCounts = useMemo(() => {
    let active = 0,
      stale = 0,
      archived = 0;
    for (const p of prospects) {
      if (passesViewFilter(p, "active")) active += 1;
      if (passesViewFilter(p, "stale")) stale += 1;
      if (passesViewFilter(p, "archived")) archived += 1;
    }
    return { active, stale, archived, all: prospects.length };
  }, [prospects]);

  // Group prospects into Map<stageNumber, Prospect[]> per track. Sub-
  // letter doesn't change which group bucket a prospect lives in — '4'
  // and '4a' both render under stage 4, sorted by letter so 4 < 4a < 4b.
  // View-mode + source-channel filters applied here so empty-stage
  // rows still show up in the layout (preserves visual structure when
  // filtering).
  const { websiteByStage, fullsystemByStage, websiteTotal, fullsystemTotal } =
    useMemo(() => {
      const website = new Map<number, Prospect[]>();
      const fullsystem = new Map<number, Prospect[]>();
      let webCents = 0;
      let fsCents = 0;
      for (const p of prospects) {
        if (!passesViewFilter(p, viewMode)) continue;
        if (sourceFilter !== "all" && p.sourceChannel !== sourceFilter) continue;
        const { num } = parseStage(p.pipelineStage);
        if (num <= 0) continue;
        const isFullsystem = trackOf(p) === "fullsystem";
        const map = isFullsystem ? fullsystem : website;
        if (!map.has(num)) map.set(num, []);
        map.get(num)!.push(p);
        const value = dealValueCents(p);
        if (isFullsystem) fsCents += value.cents;
        else webCents += value.cents;
      }
      // Sort each bucket by letter (empty first, then a/b/c).
      for (const list of [...website.values(), ...fullsystem.values()]) {
        list.sort((a, b) => {
          const la = parseStage(a.pipelineStage).letter;
          const lb = parseStage(b.pipelineStage).letter;
          return la.localeCompare(lb);
        });
      }
      return {
        websiteByStage: website,
        fullsystemByStage: fullsystem,
        websiteTotal: webCents,
        fullsystemTotal: fsCents,
      };
    }, [prospects, sourceFilter, viewMode]);

  const nudgeNum = (id: string, persisted: string, track: Track, delta: number) => {
    const max = ceilingFor(track);
    const current = pendingStages[id] ?? persisted;
    const { num, letter } = parseStage(current);
    const nextNum = Math.max(1, Math.min(max, num + delta));
    // When changing the major stage, drop the sub-letter (different
    // stage = different sub-meanings).
    const next = formatStage(nextNum, nextNum === num ? letter : "");
    setPendingStages((prev) => ({ ...prev, [id]: next }));
  };

  const nudgeLetter = (id: string, persisted: string, delta: number) => {
    const current = pendingStages[id] ?? persisted;
    const { num, letter } = parseStage(current);
    const idx = LETTER_CYCLE.indexOf(letter as (typeof LETTER_CYCLE)[number]);
    const nextIdx = (idx + delta + LETTER_CYCLE.length) % LETTER_CYCLE.length;
    const next = formatStage(num, LETTER_CYCLE[nextIdx]);
    setPendingStages((prev) => ({ ...prev, [id]: next }));
  };

  const saveStage = async (id: string) => {
    if (savingId) return;
    const next = pendingStages[id];
    if (!next) return;
    setSavingId(id);
    try {
      const res = await fetch(`/api/prospects/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pipelineStage: next }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setProspects((prev) =>
        prev.map((p) => (p.id === id ? { ...p, pipelineStage: next } : p)),
      );
      setPendingStages((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    } catch (e) {
      console.error("[sales-pipeline] save failed:", e);
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-20 backdrop-blur bg-slate-950/85 border-b border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 flex items-center gap-3">
          <Link
            href="/dashboard"
            className="text-slate-400 hover:text-white text-sm flex items-center gap-1"
          >
            ← Dash
          </Link>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight flex-1">
            Sales pipeline
          </h1>
          <Link
            href="/dashboard/clients"
            className="text-[11px] tracking-wider uppercase font-bold text-slate-300 hover:text-white border border-slate-700 px-2.5 py-1 rounded"
          >
            Client jobs →
          </Link>
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 pb-3 flex flex-col gap-3">
          {/* View-mode chips + source filter — same row on desktop,
              wraps on mobile. Active = the operator's daily board.
              Stale = >14 days no update (urgent). Archived = bounced /
              dismissed / unsubscribed (kept hidden by default per Rule
              42 — accessible but out of the way). */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 flex-wrap">
              <ViewModeChip
                mode="active"
                active={viewMode === "active"}
                count={viewCounts.active}
                onClick={() => setViewMode("active")}
                label="Active"
                tone="emerald"
              />
              <ViewModeChip
                mode="stale"
                active={viewMode === "stale"}
                count={viewCounts.stale}
                onClick={() => setViewMode("stale")}
                label="Stale"
                tone="amber"
                hint=">14 days no update"
              />
              <ViewModeChip
                mode="archived"
                active={viewMode === "archived"}
                count={viewCounts.archived}
                onClick={() => setViewMode("archived")}
                label="Archived"
                tone="slate"
                hint="bounced · dismissed · unsubscribed"
              />
              <ViewModeChip
                mode="all"
                active={viewMode === "all"}
                count={viewCounts.all}
                onClick={() => setViewMode("all")}
                label="All"
                tone="slate"
              />
            </div>
            {sourceOptions.length > 1 && (
              <label className="flex items-center gap-2 text-xs text-slate-400">
                Source
                <select
                  value={sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white font-mono focus:outline-none focus:border-sky-500"
                >
                  {sourceOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>
          <p className="text-[11px] text-slate-500 leading-snug">
            Single source of truth · every funnel reads from this stage. Use ▲▼
            on the number to change major stage, ▲▼ on the letter to add a
            sub-state (4a / 4b / 4c). Hit Save to persist.
          </p>
        </div>
        {dirtyCount > 0 && (
          <div className="border-t border-amber-500/40 bg-amber-950/40">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 py-2 flex items-center justify-between gap-3">
              <span className="text-[11px] uppercase tracking-wider font-bold text-amber-300">
                {dirtyCount} unsaved {dirtyCount === 1 ? "change" : "changes"} ·
                save each card individually
              </span>
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-6 pb-32">
        {loading && (
          <div className="text-center text-slate-500 py-10">Loading…</div>
        )}
        {err && (
          <div className="rounded-lg border border-rose-700/50 bg-rose-950/30 text-rose-200 px-4 py-3 mb-4 text-sm">
            {err}
          </div>
        )}

        {!loading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* ─── Website track ─── */}
            <section className="rounded-xl border border-sky-700/30 bg-sky-950/15 overflow-hidden">
              <header className="px-4 py-3 border-b border-sky-700/30 bg-sky-950/40 flex items-center justify-between gap-2">
                <h2 className="text-sm font-bold uppercase tracking-wider text-sky-200">
                  Website · $997
                </h2>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-sky-400/80 tabular-nums">
                    {[...websiteByStage.values()].reduce((a, b) => a + b.length, 0)}
                    {" "}leads
                  </span>
                  <span className="text-sky-400/40">·</span>
                  <span className="text-sky-300 font-bold tabular-nums">
                    {fmtUsdShort(websiteTotal)}
                  </span>
                </div>
              </header>
              <div className="divide-y divide-sky-900/40">
                {WEBSITE_STAGES.map((s) => (
                  <StageGroup
                    key={s.n}
                    stage={s.n}
                    label={s.label}
                    accent="sky"
                    leads={websiteByStage.get(s.n) ?? []}
                    pendingStages={pendingStages}
                    savingId={savingId}
                    onNudgeNum={(id, persisted, delta) =>
                      nudgeNum(id, persisted, "website", delta)
                    }
                    onNudgeLetter={(id, persisted, delta) =>
                      nudgeLetter(id, persisted, delta)
                    }
                    onSave={saveStage}
                  />
                ))}
              </div>
            </section>

            {/* ─── $10K AI System track ─── */}
            <section className="rounded-xl border border-violet-700/30 bg-violet-950/15 overflow-hidden">
              <header className="px-4 py-3 border-b border-violet-700/30 bg-violet-950/40 flex items-center justify-between gap-2">
                <h2 className="text-sm font-bold uppercase tracking-wider text-violet-200">
                  AI System · $10K
                </h2>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-violet-400/80 tabular-nums">
                    {[...fullsystemByStage.values()].reduce((a, b) => a + b.length, 0)}
                    {" "}leads
                  </span>
                  <span className="text-violet-400/40">·</span>
                  <span className="text-violet-300 font-bold tabular-nums">
                    {fmtUsdShort(fullsystemTotal)}
                  </span>
                </div>
              </header>
              <div className="divide-y divide-violet-900/40">
                {FULLSYSTEM_STAGES.map((s) => (
                  <StageGroup
                    key={s.n}
                    stage={s.n}
                    label={s.label}
                    accent="violet"
                    leads={fullsystemByStage.get(s.n) ?? []}
                    pendingStages={pendingStages}
                    savingId={savingId}
                    onNudgeNum={(id, persisted, delta) =>
                      nudgeNum(id, persisted, "fullsystem", delta)
                    }
                    onNudgeLetter={(id, persisted, delta) =>
                      nudgeLetter(id, persisted, delta)
                    }
                    onSave={saveStage}
                  />
                ))}
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────── */

function StageGroup({
  stage,
  label,
  accent,
  leads,
  pendingStages,
  savingId,
  onNudgeNum,
  onNudgeLetter,
  onSave,
}: {
  stage: number;
  label: string;
  accent: "sky" | "violet";
  leads: Prospect[];
  pendingStages: Record<string, string>;
  savingId: string | null;
  onNudgeNum: (id: string, persisted: string, delta: number) => void;
  onNudgeLetter: (id: string, persisted: string, delta: number) => void;
  onSave: (id: string) => void;
}) {
  // Stage 3 is the cash-in transition (Bought + paid / Meeting completed
  // → moving toward delivery). Light up green so the operator sees it
  // as the celebrate-and-execute moment, not just another row.
  const isCashStage = stage === 3;
  const stageTotal = leads.reduce(
    (sum, p) => sum + dealValueCents(p).cents,
    0,
  );

  if (leads.length === 0) {
    return (
      <div className="px-4 py-2.5 flex items-center gap-3 text-[11px] text-slate-500">
        <StageBadge label={`${stage}`} accent={accent} dim />
        <span className="flex-1">{label}</span>
        <span className="opacity-50 italic">no leads at this stage</span>
      </div>
    );
  }
  return (
    <div
      className={`px-4 py-3 ${
        isCashStage ? "bg-emerald-950/15 border-l-2 border-emerald-500/40" : ""
      }`}
    >
      <div className="flex items-center gap-3 mb-2">
        <StageBadge label={`${stage}`} accent={isCashStage ? "emerald" : accent} />
        <span
          className={`text-[11px] font-bold uppercase tracking-wider ${
            isCashStage ? "text-emerald-200" : "text-slate-300"
          }`}
        >
          {label}
        </span>
        <span className="text-[10px] text-slate-500">· {leads.length}</span>
        <span
          className={`ml-auto text-[10px] font-bold tabular-nums ${
            isCashStage ? "text-emerald-300" : "text-slate-400"
          }`}
        >
          {fmtUsdShort(stageTotal)}
        </span>
      </div>
      <ul className="space-y-2">
        {leads.map((p) => (
          <LeadCard
            key={p.id}
            prospect={p}
            pending={pendingStages[p.id]}
            saving={savingId === p.id}
            onNudgeNum={(delta) =>
              onNudgeNum(p.id, p.pipelineStage ?? `${stage}`, delta)
            }
            onNudgeLetter={(delta) =>
              onNudgeLetter(p.id, p.pipelineStage ?? `${stage}`, delta)
            }
            onSave={() => onSave(p.id)}
          />
        ))}
      </ul>
    </div>
  );
}

function StageBadge({
  label,
  accent,
  dim,
}: {
  label: string;
  accent: "sky" | "violet" | "emerald";
  dim?: boolean;
}) {
  const cls =
    accent === "sky"
      ? "bg-sky-500/15 text-sky-200 border-sky-500/30"
      : accent === "violet"
        ? "bg-violet-500/15 text-violet-200 border-violet-500/30"
        : "bg-emerald-500/20 text-emerald-200 border-emerald-500/40";
  return (
    <span
      className={`inline-flex items-center justify-center min-w-[1.5rem] h-6 px-1 rounded-md border text-xs font-black tabular-nums ${cls} ${
        dim ? "opacity-50" : ""
      }`}
    >
      {label}
    </span>
  );
}

function ViewModeChip({
  active,
  count,
  onClick,
  label,
  tone,
  hint,
}: {
  mode: ViewMode;
  active: boolean;
  count: number;
  onClick: () => void;
  label: string;
  tone: "emerald" | "amber" | "slate";
  hint?: string;
}) {
  const palette =
    tone === "emerald"
      ? active
        ? "border-emerald-500/60 bg-emerald-500/15 text-emerald-200"
        : "border-slate-700 bg-slate-900/60 text-slate-400 hover:border-emerald-700/40 hover:text-emerald-300"
      : tone === "amber"
        ? active
          ? "border-amber-500/60 bg-amber-500/15 text-amber-200"
          : "border-slate-700 bg-slate-900/60 text-slate-400 hover:border-amber-700/40 hover:text-amber-300"
        : active
          ? "border-slate-500 bg-slate-700/60 text-white"
          : "border-slate-700 bg-slate-900/60 text-slate-400 hover:border-slate-600 hover:text-white";

  return (
    <button
      type="button"
      onClick={onClick}
      title={hint}
      className={`text-[11px] font-bold uppercase tracking-wider rounded-full border px-3 py-1 transition-colors flex items-center gap-1.5 ${palette}`}
    >
      <span>{label}</span>
      <span className="opacity-70 tabular-nums">{count}</span>
    </button>
  );
}

function LeadCard({
  prospect,
  pending,
  saving,
  onNudgeNum,
  onNudgeLetter,
  onSave,
}: {
  prospect: Prospect;
  pending: string | undefined;
  saving: boolean;
  onNudgeNum: (delta: number) => void;
  onNudgeLetter: (delta: number) => void;
  onSave: () => void;
}) {
  const persisted = prospect.pipelineStage ?? "1";
  const display = pending ?? persisted;
  const dirty = pending != null && pending !== persisted;
  const { num, letter } = parseStage(display);
  const value = dealValueCents(prospect);
  const daysStale = daysSinceUpdate(prospect.updatedAt);
  const status = (prospect.status ?? "").toString();
  const isArchived = ARCHIVED_STATUSES.has(status);
  const staleSeverity =
    daysStale == null
      ? null
      : daysStale > 30
        ? "red"
        : daysStale > 14
          ? "amber"
          : null;

  return (
    <li
      className={`rounded-lg border bg-slate-900/50 p-3 transition-colors ${
        dirty
          ? "border-amber-500/60 bg-amber-950/20"
          : isArchived
            ? "border-slate-800 opacity-60 hover:opacity-100"
            : "border-slate-800 hover:border-slate-700"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <a
              href={`/preview/${prospect.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-sm text-white hover:text-sky-300 truncate"
            >
              {prospect.businessName || "(unnamed)"}
            </a>
            {/* Deal value chip — visible at a glance so the operator
                can see what's $9.7k vs $997 vs custom-tier without
                clicking in. */}
            <span
              className={`inline-flex items-center text-[10px] font-bold tabular-nums px-1.5 py-0.5 rounded border ${
                prospect.pricingTier === "fullsystem"
                  ? "bg-violet-500/15 text-violet-200 border-violet-500/40"
                  : prospect.pricingTier === "custom"
                    ? "bg-teal-500/15 text-teal-200 border-teal-500/40"
                    : prospect.pricingTier === "free"
                      ? "bg-slate-700 text-slate-300 border-slate-600"
                      : "bg-sky-500/15 text-sky-200 border-sky-500/40"
              }`}
              title={value.recurring ? "Recurring annual revenue" : "One-time at close"}
            >
              {value.label}
            </span>
            {/* Stale badge — flags cards that haven't moved in 14+
                days. Single biggest accuracy/action signal on the
                board. Hidden on archived cards (they're already out
                of the active flow). */}
            {!isArchived && staleSeverity != null && (
              <span
                className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                  staleSeverity === "red"
                    ? "bg-rose-500/15 text-rose-300 border-rose-500/40"
                    : "bg-amber-500/15 text-amber-300 border-amber-500/40"
                }`}
                title={`No update in ${daysStale} day${daysStale === 1 ? "" : "s"}`}
              >
                {daysStale}d
              </span>
            )}
            {isArchived && (
              <span className="inline-flex items-center text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded border border-slate-700 bg-slate-800 text-slate-400">
                {status}
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 truncate mt-0.5">
            {[prospect.ownerName, prospect.city, prospect.state]
              .filter(Boolean)
              .join(" · ") || "—"}
          </p>
          {(prospect.phone || prospect.email) && (
            <p className="text-[11px] text-slate-600 truncate mt-0.5">
              {prospect.phone || prospect.email}
            </p>
          )}
          {prospect.sourceChannel && (
            <p className="text-[10px] text-slate-500 truncate mt-1">
              <span className="inline-block px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono">
                {prospect.sourceChannel}
              </span>
            </p>
          )}
        </div>

        {/* Stage steppers — number + optional letter */}
        <div className="flex items-stretch gap-2 shrink-0">
          {/* Number stepper */}
          <div className="flex items-center gap-1">
            <div className="flex flex-col">
              <button
                type="button"
                onClick={() => onNudgeNum(1)}
                className="w-5 h-4 flex items-center justify-center text-slate-500 hover:text-white text-xs leading-none"
                aria-label="increase major stage"
              >
                ▲
              </button>
              <button
                type="button"
                onClick={() => onNudgeNum(-1)}
                className="w-5 h-4 flex items-center justify-center text-slate-500 hover:text-white text-xs leading-none"
                aria-label="decrease major stage"
              >
                ▼
              </button>
            </div>
            <span
              className={`inline-flex items-center justify-center w-7 h-8 rounded-md border text-base font-black tabular-nums ${
                dirty
                  ? "border-amber-500/60 bg-amber-500/15 text-amber-200"
                  : "border-slate-700 bg-slate-800 text-white"
              }`}
            >
              {num}
            </span>
          </div>
          {/* Letter stepper — cycles '' / a / b / c / d / e */}
          <div className="flex items-center gap-1">
            <div className="flex flex-col">
              <button
                type="button"
                onClick={() => onNudgeLetter(1)}
                className="w-5 h-4 flex items-center justify-center text-slate-500 hover:text-white text-xs leading-none"
                aria-label="cycle sub-letter forward"
              >
                ▲
              </button>
              <button
                type="button"
                onClick={() => onNudgeLetter(-1)}
                className="w-5 h-4 flex items-center justify-center text-slate-500 hover:text-white text-xs leading-none"
                aria-label="cycle sub-letter backward"
              >
                ▼
              </button>
            </div>
            <span
              className={`inline-flex items-center justify-center w-7 h-8 rounded-md border text-base font-black tabular-nums ${
                dirty
                  ? "border-amber-500/60 bg-amber-500/15 text-amber-200"
                  : letter
                    ? "border-slate-700 bg-slate-800 text-white"
                    : "border-slate-800 bg-slate-900 text-slate-600"
              }`}
              title={letter ? `Sub-state ${letter}` : "No sub-state"}
            >
              {letter || "·"}
            </span>
          </div>
        </div>
      </div>

      {dirty && (
        <div className="mt-2.5 flex items-center justify-between gap-3">
          <span className="text-[10px] uppercase tracking-wider font-bold text-amber-300">
            Unsaved · {persisted} → {display}
          </span>
          <button
            type="button"
            disabled={saving}
            onClick={onSave}
            className="text-[11px] font-bold uppercase tracking-wider rounded px-3 py-1 bg-amber-500 hover:bg-amber-400 text-amber-950 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      )}
    </li>
  );
}
