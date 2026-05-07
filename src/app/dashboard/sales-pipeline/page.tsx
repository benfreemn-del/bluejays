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
 * Stage stored on prospects.pipeline_stage (smallint, NULL by default).
 * Only prospects with pipelineStage IS NOT NULL render here — keeps the
 * board focused. Move a lead onto the board by setting their stage
 * (default 1) the first time they hit a relevant status.
 *
 * Editing UX:
 *   - Each card shows the current stage number with ▲ ▼ buttons to nudge
 *     it up or down (clamped to per-track ceiling).
 *   - Changes are LOCAL until the user hits Save on that card. Pending
 *     changes show as amber outline + "Unsaved" pill so it's obvious.
 *   - Save calls PATCH /api/prospects/[id] with { pipelineStage } and
 *     reflects success/failure in the card.
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

type Track = "website" | "fullsystem";

function trackOf(p: Prospect): Track {
  return p.pricingTier === "fullsystem" ? "fullsystem" : "website";
}

function ceilingFor(track: Track): number {
  return track === "fullsystem" ? 6 : 4;
}

export default function SalesPipelinePage() {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // Per-prospect local stage edits — keyed by prospect.id. When the
  // value differs from the persisted one, we render an "Unsaved" pill
  // and amber outline. Cleared on successful save.
  const [pendingStages, setPendingStages] = useState<Record<string, number>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

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

  const { websiteByStage, fullsystemByStage } = useMemo(() => {
    const website = new Map<number, Prospect[]>();
    const fullsystem = new Map<number, Prospect[]>();
    for (const p of prospects) {
      const stage = p.pipelineStage ?? 0;
      if (stage <= 0) continue;
      const map = trackOf(p) === "fullsystem" ? fullsystem : website;
      if (!map.has(stage)) map.set(stage, []);
      map.get(stage)!.push(p);
    }
    return { websiteByStage: website, fullsystemByStage: fullsystem };
  }, [prospects]);

  const nudge = (id: string, currentPersisted: number, track: Track, delta: number) => {
    const max = ceilingFor(track);
    const current = pendingStages[id] ?? currentPersisted;
    const next = Math.max(1, Math.min(max, current + delta));
    setPendingStages((prev) => ({ ...prev, [id]: next }));
  };

  const saveStage = async (id: string) => {
    if (savingId) return;
    const next = pendingStages[id];
    if (next == null) return;
    setSavingId(id);
    try {
      const res = await fetch(`/api/prospects/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pipelineStage: next }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      // Optimistic local update + clear pending.
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
      // Leave pending state in place so the user can retry.
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
        <p className="mx-auto max-w-7xl px-4 sm:px-6 pb-3 text-xs text-slate-500">
          Active leads only — set a prospect&apos;s pipeline stage from
          their detail page to put them on this board.
        </p>
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
              <header className="px-4 py-3 border-b border-sky-700/30 bg-sky-950/40 flex items-baseline justify-between">
                <h2 className="text-sm font-bold uppercase tracking-wider text-sky-200">
                  Website · $997
                </h2>
                <span className="text-xs text-sky-400/80">
                  {[...websiteByStage.values()].reduce((a, b) => a + b.length, 0)} active
                </span>
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
                    onNudge={(id, persisted, delta) =>
                      nudge(id, persisted, "website", delta)
                    }
                    onSave={saveStage}
                  />
                ))}
              </div>
            </section>

            {/* ─── $10K AI System track ─── */}
            <section className="rounded-xl border border-violet-700/30 bg-violet-950/15 overflow-hidden">
              <header className="px-4 py-3 border-b border-violet-700/30 bg-violet-950/40 flex items-baseline justify-between">
                <h2 className="text-sm font-bold uppercase tracking-wider text-violet-200">
                  AI System · $10K
                </h2>
                <span className="text-xs text-violet-400/80">
                  {[...fullsystemByStage.values()].reduce((a, b) => a + b.length, 0)} active
                </span>
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
                    onNudge={(id, persisted, delta) =>
                      nudge(id, persisted, "fullsystem", delta)
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
  onNudge,
  onSave,
}: {
  stage: number;
  label: string;
  accent: "sky" | "violet";
  leads: Prospect[];
  pendingStages: Record<string, number>;
  savingId: string | null;
  onNudge: (id: string, persisted: number, delta: number) => void;
  onSave: (id: string) => void;
}) {
  if (leads.length === 0) {
    return (
      <div className="px-4 py-2.5 flex items-center gap-3 text-[11px] text-slate-500">
        <StageBadge n={stage} accent={accent} />
        <span className="flex-1">{label}</span>
        <span className="opacity-60">empty</span>
      </div>
    );
  }
  return (
    <div className="px-4 py-3">
      <div className="flex items-center gap-3 mb-2">
        <StageBadge n={stage} accent={accent} />
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
          {label}
        </span>
        <span className="text-[10px] text-slate-500">· {leads.length}</span>
      </div>
      <ul className="space-y-2">
        {leads.map((p) => (
          <LeadCard
            key={p.id}
            prospect={p}
            pending={pendingStages[p.id]}
            saving={savingId === p.id}
            onNudge={(delta) => onNudge(p.id, p.pipelineStage ?? stage, delta)}
            onSave={() => onSave(p.id)}
          />
        ))}
      </ul>
    </div>
  );
}

function StageBadge({ n, accent }: { n: number; accent: "sky" | "violet" }) {
  const cls =
    accent === "sky"
      ? "bg-sky-500/15 text-sky-200 border-sky-500/30"
      : "bg-violet-500/15 text-violet-200 border-violet-500/30";
  return (
    <span
      className={`inline-flex items-center justify-center w-6 h-6 rounded-md border text-xs font-black tabular-nums ${cls}`}
    >
      {n}
    </span>
  );
}

function LeadCard({
  prospect,
  pending,
  saving,
  onNudge,
  onSave,
}: {
  prospect: Prospect;
  pending: number | undefined;
  saving: boolean;
  onNudge: (delta: number) => void;
  onSave: () => void;
}) {
  const persisted = prospect.pipelineStage ?? 0;
  const display = pending ?? persisted;
  const dirty = pending != null && pending !== persisted;

  return (
    <li
      className={`rounded-lg border bg-slate-900/50 p-3 transition-colors ${
        dirty
          ? "border-amber-500/60 bg-amber-950/20"
          : "border-slate-800 hover:border-slate-700"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          {/* Click-through opens the prospect's generated preview in
              a new tab. /dashboard/prospects/[id] detail route doesn't
              exist yet, so we link directly at /preview/[id] which
              always renders something for any prospect with site copy. */}
          <a
            href={`/preview/${prospect.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-sm text-white hover:text-sky-300 truncate block"
          >
            {prospect.businessName || "(unnamed)"}
          </a>
          <p className="text-[11px] text-slate-500 truncate">
            {[prospect.ownerName, prospect.city, prospect.state]
              .filter(Boolean)
              .join(" · ") || "—"}
          </p>
          {(prospect.phone || prospect.email) && (
            <p className="text-[11px] text-slate-600 truncate mt-0.5">
              {prospect.phone || prospect.email}
            </p>
          )}
        </div>

        {/* Stage stepper */}
        <div className="flex items-center gap-1 shrink-0">
          <div className="flex flex-col">
            <button
              type="button"
              onClick={() => onNudge(1)}
              className="w-5 h-4 flex items-center justify-center text-slate-500 hover:text-white text-xs leading-none"
              aria-label="increase stage"
            >
              ▲
            </button>
            <button
              type="button"
              onClick={() => onNudge(-1)}
              className="w-5 h-4 flex items-center justify-center text-slate-500 hover:text-white text-xs leading-none"
              aria-label="decrease stage"
            >
              ▼
            </button>
          </div>
          <span
            className={`inline-flex items-center justify-center w-8 h-8 rounded-md border text-base font-black tabular-nums ${
              dirty
                ? "border-amber-500/60 bg-amber-500/15 text-amber-200"
                : "border-slate-700 bg-slate-800 text-white"
            }`}
          >
            {display}
          </span>
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
