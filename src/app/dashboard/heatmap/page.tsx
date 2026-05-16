"use client";

/**
 * /dashboard/heatmap — Clarity-style leakage overlay for the operator.
 *
 * UX contract (per Ben 2026-05-16):
 *   - One tab in the backend nav, owner-only.
 *   - Site selector: BlueJays + Tekky to start (more sites in SITES).
 *   - "♻ Populate current data" button — single click pulls fresh
 *     Clarity friction signals and paints them as soft heat blobs over
 *     a live iframe of the selected site.
 *   - Each zone is plain-English: "Hero rage clicks", "Scroll cliff
 *     at 78%", etc. Pill color carries severity; tooltip carries the why.
 *   - Falls back to a clearly-labeled sample dataset when no Clarity
 *     token is configured — so the page is usable on day one and Ben
 *     can wire the token later.
 *
 * Built on @/components/ui primitives (Page, PageHeader, Card, Pill,
 * Button, etc.) so the visual language matches the rest of /dashboard/*.
 *
 * The iframe URLs always include ?embed=1 so the embedded site
 * skips the Clarity script + pixels — we don't want admin-side
 * previews polluting the heatmap data we're trying to look at.
 */

import { useCallback, useEffect, useState } from "react";
import {
  Page,
  PageHeader,
  Card,
  CardSubtle,
  Pill,
  Button,
  SectionLabel,
  Label,
  Stack,
  type Tone,
} from "@/components/ui";

type Severity = "engagement" | "warm" | "friction" | "leak";

interface LeakageZone {
  top: number;
  left: number;
  width: number;
  height: number;
  label: string;
  detail: string;
  severity: Severity;
  value: number | null;
}

interface HeatmapData {
  ok: boolean;
  configured: boolean;
  live: boolean;
  site: string;
  iframeUrl: string;
  fetchedAt: string;
  totals: {
    sessions: number | null;
    deadClickRate: number | null;
    rageClickRate: number | null;
    quickBackRate: number | null;
    avgScrollDepth: number | null;
  };
  leakageZones: LeakageZone[];
  topFrictionPages: { url: string; deadClicks: number; rageClicks: number }[];
  message?: string;
  error?: string;
}

const SITE_OPTIONS: { key: string; label: string }[] = [
  { key: "bluejays", label: "BlueJays · bluejayportfolio.com" },
  { key: "zenith-sports", label: "Tekky · Zenith Sports" },
];

/* Severity → visual language. The blob is a soft radial gradient that
 * reads as a real heat smudge, not a wireframe rectangle. The pill tone
 * maps to the design-system Pill component so we stay on-brand. */
const SEVERITY: Record<
  Severity,
  { blob: string; pillTone: Tone; word: string; blurb: string }
> = {
  engagement: {
    blob:
      "radial-gradient(circle at center, rgba(52,211,153,0.35) 0%, rgba(52,211,153,0.18) 40%, rgba(52,211,153,0) 75%)",
    pillTone: "emerald",
    word: "Engaged",
    blurb: "Visitors interact here — good zone.",
  },
  warm: {
    blob:
      "radial-gradient(circle at center, rgba(251,191,36,0.40) 0%, rgba(251,191,36,0.20) 40%, rgba(251,191,36,0) 75%)",
    pillTone: "amber",
    word: "Warm",
    blurb: "Mild signal — watch, don't fix yet.",
  },
  friction: {
    blob:
      "radial-gradient(circle at center, rgba(249,115,22,0.50) 0%, rgba(249,115,22,0.25) 40%, rgba(249,115,22,0) 75%)",
    pillTone: "amber",
    word: "Friction",
    blurb: "Visitors hesitate or get stuck here.",
  },
  leak: {
    blob:
      "radial-gradient(circle at center, rgba(244,63,94,0.60) 0%, rgba(244,63,94,0.30) 40%, rgba(244,63,94,0) 75%)",
    pillTone: "rose",
    word: "Leak",
    blurb: "Visitors drop off here — fix first.",
  },
};

const SEVERITY_ORDER: Severity[] = ["engagement", "warm", "friction", "leak"];

function RecycleIcon({ spinning }: { spinning: boolean }) {
  // Real recycle triangle (three chasing arrows, Möbius pattern) — not
  // the refresh-arrow we were using before. Hand-tuned Lucide-style
  // path so it reads cleanly at 16px.
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`w-4 h-4 ${spinning ? "animate-spin" : ""}`}
      aria-hidden
    >
      <path d="M7 19H4.815a1.83 1.83 0 0 1-1.57-.881a1.785 1.785 0 0 1-.004-1.784L7.196 9.5" />
      <path d="M11 19h8.203a1.83 1.83 0 0 0 1.556-.89a1.784 1.784 0 0 0 0-1.775l-1.226-2.12" />
      <path d="M14 16l-3 3l3 3" />
      <path d="M8.293 13.596l-2.16-3.806l-3.764 1.024" />
      <path d="M14.482 4.171a1.873 1.873 0 0 0-2.99-.354a1.832 1.832 0 0 0-.27 .447l-1.224 2.12" />
      <path d="M16.092 9.366l-3.764-1.024" />
      <path d="M20.794 7.628l-1.224-2.12a1.829 1.829 0 0 0-1.554-.908" />
    </svg>
  );
}

function fmtPct(n: number | null, digits = 1): string {
  if (n === null || !Number.isFinite(n)) return "—";
  return `${(n * 100).toFixed(digits)}%`;
}

function fmtCount(n: number | null): string {
  if (n === null || !Number.isFinite(n)) return "—";
  return n.toLocaleString();
}

export default function HeatmapPage() {
  const [site, setSite] = useState<string>("bluejays");
  const [days, setDays] = useState<number>(1);
  const [data, setData] = useState<HeatmapData | null>(null);
  const [loading, setLoading] = useState(false);
  const [hoveredZone, setHoveredZone] = useState<number | null>(null);

  const populate = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(
        `/api/dashboard/heatmap?site=${encodeURIComponent(site)}&days=${days}`,
        { cache: "no-store" },
      );
      const json = (await r.json()) as HeatmapData;
      setData(json);
    } catch (e) {
      setData({
        ok: false,
        configured: false,
        live: false,
        site,
        iframeUrl: "",
        fetchedAt: new Date().toISOString(),
        totals: {
          sessions: null,
          deadClickRate: null,
          rageClickRate: null,
          quickBackRate: null,
          avgScrollDepth: null,
        },
        leakageZones: [],
        topFrictionPages: [],
        error: (e as Error).message,
      });
    } finally {
      setLoading(false);
    }
  }, [site, days]);

  useEffect(() => {
    populate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const headerActions = (
    <div className="flex items-center gap-2">
      {data && (
        <Pill tone={data.live ? "emerald" : "amber"}>
          {data.live ? "Live data" : "Sample data"}
        </Pill>
      )}
      <Button
        type="button"
        variant="primary"
        onClick={populate}
        disabled={loading}
        className="inline-flex items-center gap-2"
      >
        <RecycleIcon spinning={loading} />
        {loading ? "Populating…" : "Populate current data"}
      </Button>
    </div>
  );

  return (
    <Page max="7xl">
      <PageHeader
        eyebrow="Operator · backend only"
        title="Leakage Heat Map"
        description="See where visitors get stuck, rage-click, or bail. Overlays live friction data on top of your site so you can fix the broken thing in plain English. Powered by Microsoft Clarity."
        actions={headerActions}
      />

      {/* Controls — site + window selectors. Status pills live in the
          header next to the populate button so the operator can see at
          a glance whether they're looking at real or sample data. */}
      <Card className="mb-4">
        <div className="flex flex-wrap items-end gap-4">
          <label className="block min-w-[260px]">
            <Label>Site</Label>
            <select
              value={site}
              onChange={(e) => setSite(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:border-sky-500/50"
            >
              {SITE_OPTIONS.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block min-w-[140px]">
            <Label>Window</Label>
            <select
              value={days}
              onChange={(e) => setDays(parseInt(e.target.value, 10))}
              className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:border-sky-500/50"
            >
              <option value={1}>Last 24h</option>
              <option value={2}>Last 48h</option>
              <option value={3}>Last 72h</option>
            </select>
          </label>
          {data?.fetchedAt && (
            <p className="text-[11px] text-slate-500 ml-auto pb-2">
              Pulled {new Date(data.fetchedAt).toLocaleTimeString()}
            </p>
          )}
        </div>
        {(data?.message || data?.error) && (
          <div className="mt-3 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
            <strong className="font-semibold">
              {data.error && !data.configured ? "Error" : "Heads up"}:
            </strong>{" "}
            {data.error || data.message}
          </div>
        )}
      </Card>

      {/* Main grid: iframe + side panel */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
        {/* Iframe with overlay */}
        <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-slate-950 aspect-[16/10]">
          {data?.iframeUrl ? (
            <iframe
              key={`${data.site}-${data.iframeUrl}`}
              src={data.iframeUrl}
              className="absolute inset-0 w-full h-full bg-white"
              title={`${data.site} preview for heat map overlay`}
              sandbox="allow-same-origin allow-scripts allow-forms"
            />
          ) : (
            <div className="absolute inset-0 grid place-items-center text-slate-500 text-sm">
              Loading site preview…
            </div>
          )}

          {/* Zone overlay layer — soft heat blobs (radial gradients) over
              the iframe. Tooltips flip above the zone when it sits in
              the lower half so they never get clipped off the canvas. */}
          {data?.leakageZones && data.leakageZones.length > 0 && (
            <div className="absolute inset-0 pointer-events-none">
              {data.leakageZones.map((z, idx) => {
                const s = SEVERITY[z.severity];
                const active = hoveredZone === idx;
                // Threshold tuned so the mid-page friction zone (center
                // ≈ 0.54) flips above too — otherwise its tooltip would
                // drop into the scroll-cliff blob sitting below at 0.78.
                const inLowerHalf = z.top + z.height / 2 > 0.5;
                return (
                  <div
                    key={`${z.label}-${idx}`}
                    onMouseEnter={() => setHoveredZone(idx)}
                    onMouseLeave={() => setHoveredZone(null)}
                    className={`absolute pointer-events-auto cursor-help transition-all duration-150 ${active ? "z-20 scale-[1.02]" : "z-10"}`}
                    style={{
                      top: `${z.top * 100}%`,
                      left: `${z.left * 100}%`,
                      width: `${z.width * 100}%`,
                      height: `${z.height * 100}%`,
                      background: s.blob,
                      borderRadius: "9999px",
                      filter: active ? "saturate(1.15)" : "saturate(1)",
                    }}
                  >
                    {/* Label pill — anchored to the top edge of the blob */}
                    <div
                      className={`absolute ${inLowerHalf ? "bottom-0" : "top-0"} left-1/2 -translate-x-1/2 ${inLowerHalf ? "translate-y-1/2" : "-translate-y-1/2"}`}
                    >
                      <Pill tone={s.pillTone}>{z.label}</Pill>
                    </div>
                    {/* Hover tooltip — flips above when the blob is in
                        the lower half so it never clips the iframe. */}
                    {active && (
                      <div
                        className={`absolute left-1/2 -translate-x-1/2 ${inLowerHalf ? "bottom-full mb-3" : "top-full mt-3"} w-[280px] z-30`}
                      >
                        <div className="rounded-xl border border-white/10 bg-slate-950/95 px-3 py-2.5 text-xs text-slate-200 shadow-2xl backdrop-blur">
                          <p className="mb-1">
                            <Pill tone={s.pillTone}>{s.word}</Pill>
                          </p>
                          <p className="leading-snug text-slate-300">
                            {z.detail}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Side panel: totals + legend + top friction pages */}
        <Stack gap={3}>
          {/* Totals */}
          <Card>
            <SectionLabel className="mb-2">
              Last {days * 24}h totals
            </SectionLabel>
            <dl className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-400">Sessions</dt>
                <dd className="font-semibold tabular-nums">
                  {fmtCount(data?.totals.sessions ?? null)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-400">Dead clicks / session</dt>
                <dd className="font-semibold tabular-nums">
                  {fmtPct(data?.totals.deadClickRate ?? null)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-400">Rage clicks / session</dt>
                <dd className="font-semibold tabular-nums">
                  {fmtPct(data?.totals.rageClickRate ?? null)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-400">Quick-backs / session</dt>
                <dd className="font-semibold tabular-nums">
                  {fmtPct(data?.totals.quickBackRate ?? null)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-400">Avg scroll depth</dt>
                <dd className="font-semibold tabular-nums">
                  {fmtPct(data?.totals.avgScrollDepth ?? null, 0)}
                </dd>
              </div>
            </dl>
          </Card>

          {/* Legend */}
          <CardSubtle>
            <SectionLabel className="mb-2">What the colors mean</SectionLabel>
            <ul className="space-y-2 text-xs">
              {SEVERITY_ORDER.map((sev) => {
                const s = SEVERITY[sev];
                return (
                  <li key={sev} className="flex items-start gap-2.5">
                    <span
                      className="mt-0.5 inline-block h-4 w-6 rounded-full shrink-0"
                      style={{ background: s.blob }}
                    />
                    <span className="flex-1 leading-snug">
                      <strong className="font-semibold text-slate-200">
                        {s.word}
                      </strong>{" "}
                      <span className="text-slate-500">— {s.blurb}</span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </CardSubtle>

          {/* Top friction pages */}
          {data?.topFrictionPages && data.topFrictionPages.length > 0 && (
            <Card>
              <SectionLabel className="mb-2">Top friction pages</SectionLabel>
              <ul className="space-y-1.5 text-xs">
                {data.topFrictionPages.slice(0, 5).map((p) => (
                  <li
                    key={p.url}
                    className="flex items-center justify-between gap-2"
                  >
                    <span className="truncate text-slate-300">{p.url}</span>
                    <span className="shrink-0 text-rose-300 tabular-nums">
                      {p.deadClicks + p.rageClicks}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </Stack>
      </div>

      <p className="mt-6 text-xs text-slate-500">
        Hover any colored blob for the plain-English explanation. To add a
        site here, edit{" "}
        <code className="rounded bg-slate-900 px-1 py-0.5 text-slate-300">
          SITES
        </code>{" "}
        in{" "}
        <code className="rounded bg-slate-900 px-1 py-0.5 text-slate-300">
          src/app/api/dashboard/heatmap/route.ts
        </code>
        .
      </p>
    </Page>
  );
}
