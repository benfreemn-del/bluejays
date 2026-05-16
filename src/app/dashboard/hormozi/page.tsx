"use client";

/**
 * /dashboard/hormozi — owner-only 6-Horseman scoreboard.
 *
 * One page Ben can open to see the live state of every Horseman from
 * the 2026-05-13 strategic review. Auto-pulls NPS + paid-prospect +
 * outbound-category data from Supabase. The items that can't be
 * auto-computed (VSL shipped? pixel set? Madie booking?) render as
 * manual toggles persisted to localStorage so re-running the
 * diagnostic weekly is one click, not a 90-minute exercise.
 *
 * This is the meta-instrument: it closes the "no Data Daddy" gap by
 * making the diagnostic continuously visible. Hormozi's own
 * principle — you can't fix what you can't see.
 */

import { useCallback, useEffect, useState } from "react";
import {
  Page,
  PageHeader,
  Card,
  CardSubtle,
  Pill,
  SectionLabel,
  Stack,
  type Tone,
} from "@/components/ui";

type HorsemanState = "green" | "yellow" | "red" | "manual";

interface Horseman {
  id: string;
  label: string;
  state: HorsemanState;
  metric: string;
  detail: string;
  next_action: string;
}

interface CriticalItem {
  id: string;
  label: string;
  state: HorsemanState;
  due: string;
  manual_key?: string;
}

interface BackendFixItem {
  id: string;
  label: string;
  state: "shipped" | "partial" | "missing";
  detail: string;
}

interface ScoreboardData {
  ok: boolean;
  generated_at: string;
  days_since_review: number;
  horsemen: Horseman[];
  critical_this_week: CriticalItem[];
  backend_fix_progress: BackendFixItem[];
  totals: {
    nps_responses_30d: number;
    nps_avg_score: number | null;
    nps_promoters: number;
    nps_detractors: number;
    paid_prospects_30d: number;
    paid_fullsystem_30d: number;
    paid_standard_30d: number;
    cold_categories_30d: number;
  };
}

const TONE_FOR_STATE: Record<HorsemanState, Tone> = {
  green: "emerald",
  yellow: "amber",
  red: "rose",
  manual: "slate",
};

const TONE_FOR_BACKEND: Record<BackendFixItem["state"], Tone> = {
  shipped: "emerald",
  partial: "amber",
  missing: "rose",
};

const LABEL_FOR_STATE: Record<HorsemanState, string> = {
  green: "Green",
  yellow: "Watch",
  red: "Red",
  manual: "Manual",
};

const STORAGE_KEY = "bj_hormozi_manual_state_v1";

function loadManualState(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveManualState(state: Record<string, boolean>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage might be disabled — degrade gracefully.
  }
}

export default function HormoziScoreboardPage() {
  const [data, setData] = useState<ScoreboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualState, setManualState] = useState<Record<string, boolean>>({});

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch("/api/dashboard/hormozi", { cache: "no-store" });
      const json = (await r.json()) as ScoreboardData;
      setData(json);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setManualState(loadManualState());
    load();
  }, [load]);

  const toggleManual = (key: string) => {
    setManualState((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      saveManualState(next);
      return next;
    });
  };

  // Resolve the effective state of a critical item — manual_key flips
  // it to green if the operator has checked it off.
  const resolveCriticalState = (item: CriticalItem): HorsemanState => {
    if (item.manual_key && manualState[item.manual_key]) return "green";
    return item.state;
  };

  return (
    <Page max="7xl">
      <PageHeader
        eyebrow="Operator · backend only"
        title="Hormozi Scoreboard"
        description="Live state of every Horseman from the 2026-05-13 strategic review. Auto-pulled from Supabase where possible; manual toggles for the items only you can flip. Re-run this every Monday."
        actions={
          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="rounded-lg bg-sky-500 hover:bg-sky-400 disabled:bg-slate-700 disabled:cursor-not-allowed text-slate-950 font-semibold px-4 py-2 text-sm inline-flex items-center gap-2"
          >
            {loading ? "Loading…" : "Refresh"}
          </button>
        }
      />

      {error && (
        <Card className="mb-4 border-rose-500/40 bg-rose-500/[0.05]">
          <p className="text-sm text-rose-300">
            <strong className="font-semibold">Error:</strong> {error}
          </p>
        </Card>
      )}

      {data && (
        <>
          {/* Headline totals strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <StatTile
              label="Day on ramp"
              value={`Day ${16 + data.days_since_review}`}
              hint={`${data.days_since_review}d since 5/13 review`}
            />
            <StatTile
              label="$10K closes (30d)"
              value={String(data.totals.paid_fullsystem_30d)}
              hint={
                data.totals.paid_fullsystem_30d >= 3
                  ? "3-anchor lock cleared"
                  : `${3 - data.totals.paid_fullsystem_30d} more to clear 3-anchor lock`
              }
              tone={data.totals.paid_fullsystem_30d >= 3 ? "emerald" : "amber"}
            />
            <StatTile
              label="NPS responses (30d)"
              value={String(data.totals.nps_responses_30d)}
              hint={
                data.totals.nps_avg_score === null
                  ? "Avg pending first response"
                  : `Avg ${data.totals.nps_avg_score.toFixed(1)} · ${data.totals.nps_promoters}P / ${data.totals.nps_detractors}D`
              }
            />
            <StatTile
              label="Cold categories (30d)"
              value={String(data.totals.cold_categories_30d)}
              hint={
                data.totals.cold_categories_30d > 3
                  ? "Avatar sprawl — narrow it"
                  : "Avatar focused"
              }
              tone={data.totals.cold_categories_30d > 3 ? "rose" : "emerald"}
            />
          </div>

          {/* Six Horsemen */}
          <SectionLabel className="mb-3">The 6 Horsemen</SectionLabel>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-8">
            {data.horsemen.map((h) => (
              <HorsemanCard key={h.id} h={h} />
            ))}
          </div>

          {/* Critical this week */}
          <SectionLabel className="mb-3">
            Critical this week (from 5/13 review)
          </SectionLabel>
          <Card className="mb-8">
            <ul className="space-y-2.5">
              {data.critical_this_week.map((item) => {
                const state = resolveCriticalState(item);
                const tone = TONE_FOR_STATE[state];
                const done = state === "green";
                return (
                  <li
                    key={item.id}
                    className="flex items-start gap-3 py-2 border-b border-white/5 last:border-b-0"
                  >
                    {item.manual_key ? (
                      <button
                        type="button"
                        onClick={() => toggleManual(item.manual_key!)}
                        className={`mt-0.5 shrink-0 w-5 h-5 rounded border ${done ? "border-emerald-500 bg-emerald-500/20" : "border-white/20 hover:border-white/40"} flex items-center justify-center transition-colors`}
                        aria-label={`Toggle ${item.label}`}
                      >
                        {done && (
                          <svg
                            viewBox="0 0 16 16"
                            fill="currentColor"
                            className="w-3 h-3 text-emerald-300"
                            aria-hidden
                          >
                            <path
                              fillRule="evenodd"
                              d="M13.78 4.22a.75.75 0 010 1.06l-7 7a.75.75 0 01-1.06 0l-3-3a.75.75 0 011.06-1.06L6.25 10.69l6.47-6.47a.75.75 0 011.06 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </button>
                    ) : (
                      <span className="mt-1.5 shrink-0 w-2 h-2 rounded-full bg-slate-500" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-medium ${done ? "text-slate-500 line-through" : "text-slate-200"}`}
                      >
                        {item.label}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">{item.due}</p>
                    </div>
                    <Pill tone={tone}>{LABEL_FOR_STATE[state]}</Pill>
                  </li>
                );
              })}
            </ul>
          </Card>

          {/* Back-end fix progress */}
          <SectionLabel className="mb-3">
            Back-end fix recipe (H6 sub-items + CS tactics)
          </SectionLabel>
          <Stack gap={2}>
            {data.backend_fix_progress.map((item) => (
              <CardSubtle key={item.id}>
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-200">
                      <span className="text-slate-500 tabular-nums">{item.id}</span>{" "}
                      <span className="ml-2">{item.label}</span>
                    </p>
                    <p className="text-xs text-slate-400 mt-1 leading-snug">
                      {item.detail}
                    </p>
                  </div>
                  <Pill tone={TONE_FOR_BACKEND[item.state]}>
                    {item.state === "shipped"
                      ? "Shipped"
                      : item.state === "partial"
                        ? "Partial"
                        : "Missing"}
                  </Pill>
                </div>
              </CardSubtle>
            ))}
          </Stack>

          <p className="mt-8 text-xs text-slate-500">
            Generated {new Date(data.generated_at).toLocaleString()} · Source:
            5/13 strategic review + live Supabase data
          </p>
        </>
      )}
    </Page>
  );
}

function StatTile({
  label,
  value,
  hint,
  tone = "slate",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: Tone;
}) {
  const ring: Record<Tone, string> = {
    emerald: "border-emerald-500/30",
    amber: "border-amber-500/30",
    rose: "border-rose-500/30",
    sky: "border-sky-500/30",
    violet: "border-violet-500/30",
    slate: "border-white/10",
  };
  return (
    <div
      className={`rounded-2xl border ${ring[tone]} bg-slate-900/60 p-4`}
    >
      <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold text-slate-100 tabular-nums">
        {value}
      </p>
      {hint && <p className="mt-1 text-[11px] text-slate-500">{hint}</p>}
    </div>
  );
}

function HorsemanCard({ h }: { h: Horseman }) {
  const tone = TONE_FOR_STATE[h.state];
  return (
    <Card>
      <div className="flex items-start justify-between gap-3 mb-2">
        <h2 className="text-sm font-bold text-slate-100">
          <span className="text-slate-500 tabular-nums mr-2">{h.id}</span>
          {h.label}
        </h2>
        <Pill tone={tone}>{LABEL_FOR_STATE[h.state]}</Pill>
      </div>
      <p className="text-xs font-semibold text-slate-300 tabular-nums mb-2">
        {h.metric}
      </p>
      <p className="text-xs text-slate-400 leading-snug mb-3">{h.detail}</p>
      <div className="pt-3 border-t border-white/5">
        <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 mb-1">
          Next action
        </p>
        <p className="text-xs text-slate-300 leading-snug">{h.next_action}</p>
      </div>
    </Card>
  );
}
