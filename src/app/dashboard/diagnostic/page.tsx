"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import MetricsPanel from "@/components/diagnosis/MetricsPanel";
import {
  computeDerivedMetrics,
  METRIC_LABELS,
  type MetricInputs,
} from "@/lib/diagnosis/metrics-calc";
import type { Industry } from "@/lib/diagnosis/benchmarks";
import type {
  DiagnosisEstimateSource,
  DiagnosisMetricKey,
  DiagnosisMetricsRow,
} from "@/lib/types";

/**
 * /dashboard/diagnostic — Hormozi-style live business diagnosis tool.
 *
 * Use case: Madie or Ben is on a sales call, pastes what the prospect
 * just said into the textarea, optionally fills the structured fields,
 * hits Diagnose, and gets back the Hormozi-framework analysis to read
 * out live: bottleneck, three problems, Grand Slam offer reframe, and
 * the close.
 *
 * Backed by /api/dashboard/hormozi-diagnostic which calls Claude with
 * a cached KB system prompt. Each run is persisted so we can audit and
 * replay later.
 */

interface Diagnosis {
  one_line_summary: string;
  bottleneck: { label: string; explanation: string; framework_cited: string };
  three_problems: Array<{ title: string; why_it_matters: string; framework_cited: string }>;
  grand_slam_offer: {
    headline: string;
    dream_outcome: string;
    proof_or_guarantee: string;
    time_to_first_win: string;
    bonus_stack: string[];
  };
  close_frame: {
    one_sentence_pitch: string;
    objection_handler: string;
    call_to_action: string;
  };
  follow_ups: string[];
}

interface RecentRun {
  id: string;
  prospect_id: string | null;
  business_input: { businessName?: string; businessText?: string };
  diagnosis: Diagnosis | null;
  cost_usd: number | string;
  duration_ms: number;
  created_at: string;
}

interface AttachedFile {
  name: string;
  mediaType: string;
  sizeBytes: number;
  base64: string;
  previewUrl?: string;
}

const ACCEPTED_TYPES = "image/png,image/jpeg,image/webp,image/gif,application/pdf";
const ACCEPTED_MIMES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/gif",
  "application/pdf",
]);
const MAX_FILES = 3;
const MAX_BYTES_PER_FILE = 2 * 1024 * 1024;

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const stripped = result.includes(",") ? result.split(",", 2)[1] : result;
      resolve(stripped);
    };
    reader.onerror = () => reject(reader.error ?? new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

const EMPTY_FORM = {
  businessText: "",
  businessName: "",
  category: "",
  monthlyRevenue: "",
  leadSources: "",
  currentOffer: "",
  pricing: "",
  topComplaint: "",
};

/** 4 extra stats (round out the top-10 alongside the 6 MetricsPanel fields). */
type ExtraStats = {
  monthly_leads: string;
  close_rate_pct: string;
  monthly_ad_spend: string;
  team_size: string;
};

const EMPTY_EXTRA_STATS: ExtraStats = {
  monthly_leads: "",
  close_rate_pct: "",
  monthly_ad_spend: "",
  team_size: "",
};

const EXTRA_STATS_LABELS: Record<keyof ExtraStats, string> = {
  monthly_leads: "Monthly leads (new prospects in)",
  close_rate_pct: "Close rate %",
  monthly_ad_spend: "Monthly ad spend",
  team_size: "Team size (people who deliver)",
};

const EXTRA_STATS_UNIT: Record<keyof ExtraStats, "currency" | "count" | "percent"> = {
  monthly_leads: "count",
  close_rate_pct: "percent",
  monthly_ad_spend: "currency",
  team_size: "count",
};

const EMPTY_INPUTS: MetricInputs = {
  monthly_revenue: null,
  active_customers: null,
  average_order_value: null,
  gross_margin_pct: null,
  churn_monthly_pct: null,
  customer_acquisition_cost: null,
};

type MetricsMode = "prospect" | "manual";

type ManualMetricsState = {
  industry: Industry | null;
  inputs: MetricInputs;
  estimates: Partial<Record<DiagnosisMetricKey, DiagnosisEstimateSource>>;
  qualifier_answers: Record<string, number | null>;
};

const EMPTY_MANUAL_METRICS: ManualMetricsState = {
  industry: null,
  inputs: EMPTY_INPUTS,
  estimates: {},
  qualifier_answers: {},
};

function parseNumericField(v: string): number | null {
  const trimmed = v.trim();
  if (!trimmed) return null;
  const n = parseFloat(trimmed.replace(/[$,\s%]/g, ""));
  return Number.isFinite(n) ? n : null;
}

// Match prospects.id UUID format
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function DiagnosticPage() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [files, setFiles] = useState<AttachedFile[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Diagnosis | null>(null);
  const [meta, setMeta] = useState<{ durationMs: number; chunksUsed: number } | null>(null);
  const [recent, setRecent] = useState<RecentRun[]>([]);

  // ─── Metrics panel state ─────────────────────────────────────
  const [metricsOpen, setMetricsOpen] = useState(false);
  const [metricsMode, setMetricsMode] = useState<MetricsMode>("prospect");
  const [prospectId, setProspectId] = useState("");
  const [metricsRow, setMetricsRow] = useState<DiagnosisMetricsRow | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [magicLink, setMagicLink] = useState<string | null>(null);
  const [magicLinkCopied, setMagicLinkCopied] = useState(false);

  // Manual-mode local metrics state (used when metricsMode === "manual").
  // Mirrors the shape MetricsPanel.onSave emits so the same panel works
  // in both modes — saved-to-server (prospect) vs. local-only (manual).
  const [manualMetrics, setManualMetrics] = useState<ManualMetricsState>(
    EMPTY_MANUAL_METRICS,
  );

  // 4 extra top-10 stats — apply in both modes. String state so empty
  // inputs render cleanly; coerced to number at submit time.
  const [extraStats, setExtraStats] = useState<ExtraStats>(EMPTY_EXTRA_STATS);

  // Pre-flight modal — gates the diagnose click when stats are missing.
  const [preFlightOpen, setPreFlightOpen] = useState(false);
  const [preFlightDismissed, setPreFlightDismissed] = useState(false);

  const isValidProspectId = UUID_RE.test(prospectId.trim());

  // Load existing metrics whenever a valid prospect ID is entered
  useEffect(() => {
    if (!isValidProspectId) {
      setMetricsRow(null);
      return;
    }
    setMetricsLoading(true);
    fetch(`/api/dashboard/diagnosis-metrics?prospectId=${prospectId.trim()}`)
      .then((r) => r.json())
      .then((j) => {
        if (j.ok) setMetricsRow(j.row);
      })
      .catch(() => {})
      .finally(() => setMetricsLoading(false));
  }, [prospectId, isValidProspectId]);

  async function saveMetrics(state: Parameters<
    NonNullable<React.ComponentProps<typeof MetricsPanel>["onSave"]>
  >[0]) {
    if (!isValidProspectId) return;
    const r = await fetch("/api/dashboard/diagnosis-metrics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "save",
        prospect_id: prospectId.trim(),
        industry: state.industry,
        ...state.inputs,
        estimates: state.estimates,
        qualifier_answers: state.qualifier_answers,
      }),
    });
    const j = await r.json();
    if (j.ok) setMetricsRow(j.row);
    else throw new Error(j.error || "save failed");
  }

  async function generateMagicLink() {
    if (!isValidProspectId) return;
    const r = await fetch("/api/dashboard/diagnosis-metrics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "generate_magic_link",
        prospect_id: prospectId.trim(),
      }),
    });
    const j = await r.json();
    if (j.ok) {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      setMagicLink(`${origin}${j.url}`);
      setMagicLinkCopied(false);
    }
  }

  async function copyMagicLink() {
    if (!magicLink) return;
    try {
      await navigator.clipboard.writeText(magicLink);
      setMagicLinkCopied(true);
      setTimeout(() => setMagicLinkCopied(false), 2000);
    } catch {
      // ignore — user can manually copy
    }
  }

  async function addFiles(fileList: FileList | File[]) {
    const incoming = Array.from(fileList);
    if (files.length + incoming.length > MAX_FILES) {
      setError(`Max ${MAX_FILES} files per diagnosis.`);
      return;
    }
    const next: AttachedFile[] = [];
    for (const f of incoming) {
      if (!ACCEPTED_MIMES.has(f.type)) {
        setError(`Unsupported type: ${f.type || "unknown"}. PNG/JPG/WEBP/GIF/PDF only.`);
        continue;
      }
      if (f.size > MAX_BYTES_PER_FILE) {
        setError(`"${f.name}" is over 2MB.`);
        continue;
      }
      try {
        const base64 = await fileToBase64(f);
        next.push({
          name: f.name,
          mediaType: f.type,
          sizeBytes: f.size,
          base64,
          previewUrl: f.type.startsWith("image/") ? URL.createObjectURL(f) : undefined,
        });
      } catch (e) {
        setError(`Failed to read "${f.name}": ${(e as Error).message}`);
      }
    }
    if (next.length > 0) {
      setError(null);
      setFiles((prev) => [...prev, ...next]);
    }
  }

  function removeFile(idx: number) {
    setFiles((prev) => {
      const target = prev[idx];
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((_, i) => i !== idx);
    });
  }

  async function loadRecent() {
    try {
      const r = await fetch("/api/dashboard/hormozi-diagnostic");
      const j = await r.json();
      if (j.ok) setRecent(j.runs);
    } catch {
      // ignore — recent is non-critical
    }
  }

  useEffect(() => {
    loadRecent();
  }, []);

  // Hydrate businessName + category from URL on mount (so the per-client
  // Diagnostic tab in ClientTabsBar can deep-link straight into a
  // pre-filled diagnosis). Uses window.location to avoid the Suspense
  // boundary useSearchParams would require.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const sp = new URLSearchParams(window.location.search);
    const businessName = sp.get("businessName") ?? "";
    const category = sp.get("category") ?? "";
    if (!businessName && !category) return;
    setForm((prev) => ({
      ...prev,
      businessName: businessName || prev.businessName,
      category: category || prev.category,
    }));
  }, []);

  // ─── Effective metrics — merged from whichever mode is active ───
  const effectiveMetrics = useMemo(() => {
    // Pick the source: manual state OR the persisted prospect row.
    const src: ManualMetricsState =
      metricsMode === "manual"
        ? manualMetrics
        : metricsRow
          ? {
              industry: (metricsRow.industry ?? null) as Industry | null,
              inputs: {
                monthly_revenue: metricsRow.monthly_revenue ?? null,
                active_customers: metricsRow.active_customers ?? null,
                average_order_value: metricsRow.average_order_value ?? null,
                gross_margin_pct: metricsRow.gross_margin_pct ?? null,
                churn_monthly_pct: metricsRow.churn_monthly_pct ?? null,
                customer_acquisition_cost:
                  metricsRow.customer_acquisition_cost ?? null,
              },
              estimates: metricsRow.estimates ?? {},
              qualifier_answers: metricsRow.qualifier_answers ?? {},
            }
          : EMPTY_MANUAL_METRICS;

    const derived = computeDerivedMetrics(src.inputs);
    return {
      industry: src.industry,
      ...src.inputs,
      monthly_leads: parseNumericField(extraStats.monthly_leads),
      close_rate_pct: parseNumericField(extraStats.close_rate_pct),
      monthly_ad_spend: parseNumericField(extraStats.monthly_ad_spend),
      team_size: parseNumericField(extraStats.team_size),
      derived: {
        ltv: derived.ltv,
        ltv_cac_ratio: derived.ltv_cac_ratio,
        payback_months: derived.payback_months,
        avg_lifespan_months: derived.avg_lifespan_months,
        arpu_monthly: derived.arpu_monthly,
        health_score: derived.health_score,
      },
    };
  }, [metricsMode, manualMetrics, metricsRow, extraStats]);

  // The 10 top stats — surfaced in the pre-flight check.
  const TOP_10_KEYS: Array<{
    key: keyof typeof effectiveMetrics;
    label: string;
  }> = [
    { key: "monthly_revenue", label: METRIC_LABELS.monthly_revenue },
    { key: "active_customers", label: METRIC_LABELS.active_customers },
    { key: "average_order_value", label: METRIC_LABELS.average_order_value },
    { key: "gross_margin_pct", label: METRIC_LABELS.gross_margin_pct },
    { key: "churn_monthly_pct", label: METRIC_LABELS.churn_monthly_pct },
    {
      key: "customer_acquisition_cost",
      label: METRIC_LABELS.customer_acquisition_cost,
    },
    { key: "monthly_leads", label: EXTRA_STATS_LABELS.monthly_leads },
    { key: "close_rate_pct", label: EXTRA_STATS_LABELS.close_rate_pct },
    { key: "monthly_ad_spend", label: EXTRA_STATS_LABELS.monthly_ad_spend },
    { key: "team_size", label: EXTRA_STATS_LABELS.team_size },
  ];

  const missingTop10 = TOP_10_KEYS.filter(
    ({ key }) => effectiveMetrics[key] === null || effectiveMetrics[key] === undefined,
  );

  // What the user CLICKS — gates on the pre-flight when stats are missing.
  function onDiagnoseClick() {
    if (form.businessText.trim().length < 20) {
      setError("Add at least one sentence about the business (20+ chars).");
      return;
    }
    if (missingTop10.length > 0 && !preFlightDismissed) {
      setPreFlightOpen(true);
      return;
    }
    submit();
  }

  async function submit() {
    if (form.businessText.trim().length < 20) {
      setError("Add at least one sentence about the business (20+ chars).");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    setMeta(null);
    setPreFlightOpen(false);
    try {
      // Strip null fields so the payload only carries actual numbers.
      const cleanMetrics = Object.fromEntries(
        Object.entries(effectiveMetrics).filter(([, v]) => v !== null && v !== undefined),
      );
      const payload = {
        ...form,
        prospectId: metricsMode === "prospect" && isValidProspectId ? prospectId.trim() : undefined,
        metrics: Object.keys(cleanMetrics).length > 0 ? cleanMetrics : undefined,
        files: files.map((f) => ({
          name: f.name,
          mediaType: f.mediaType,
          sizeBytes: f.sizeBytes,
          base64: f.base64,
        })),
      };
      const r = await fetch("/api/dashboard/hormozi-diagnostic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const j = await r.json();
      if (!j.ok) {
        setError(j.error || "Unknown error");
      } else {
        setResult(j.diagnosis);
        setMeta({ durationMs: j.durationMs, chunksUsed: j.chunksUsed });
        loadRecent();
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  function loadRun(run: RecentRun) {
    if (!run.diagnosis) return;
    setResult(run.diagnosis);
    setMeta({ durationMs: run.duration_ms, chunksUsed: 0 });
    setForm({
      ...EMPTY_FORM,
      ...run.business_input,
      businessText: run.business_input.businessText ?? "",
    });
    // Recent runs don't restore file bytes — only metadata is stored.
    files.forEach((f) => f.previewUrl && URL.revokeObjectURL(f.previewUrl));
    setFiles([]);
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <header className="mb-8">
          <p className="text-xs uppercase tracking-wider text-emerald-400 font-semibold mb-2">
            BlueJays internal · sales tooling
          </p>
          <h1 className="text-3xl font-bold mb-2">Hormozi Diagnostic Agent</h1>
          <p className="text-slate-400 text-sm max-w-2xl">
            Paste what the prospect said. Get back a Hormozi-framework
            diagnosis you can read live on the call: bottleneck, three
            problems, the Grand Slam offer reframe, and the close.
          </p>
        </header>

        <div className="grid lg:grid-cols-[1fr_1.2fr] gap-6">
          {/* INPUT */}
          <section className="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
            <h2 className="text-lg font-semibold mb-4">Prospect</h2>

            <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1">
              What they said *
            </label>
            <textarea
              value={form.businessText}
              onChange={(e) => setForm({ ...form, businessText: e.target.value })}
              placeholder="Dump the call: business, what they're doing for leads, what's working, what's not, prices, complaints…"
              className="w-full min-h-[180px] rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm placeholder-slate-600 mb-4"
            />

            <div className="mb-4">
              <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1">
                Attachments <span className="text-slate-600 normal-case tracking-normal">— screenshots, PDFs, P&L, GBP listing (max {MAX_FILES}, 2MB each)</span>
              </label>
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`rounded-lg border-2 border-dashed px-4 py-5 text-center cursor-pointer transition-colors ${
                  dragOver
                    ? "border-emerald-400 bg-emerald-500/5"
                    : "border-white/10 bg-slate-950 hover:border-white/20"
                }`}
              >
                <p className="text-sm text-slate-300">
                  {files.length >= MAX_FILES
                    ? `Max ${MAX_FILES} files reached.`
                    : "Drop files or click to upload"}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">PNG · JPG · WEBP · GIF · PDF</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPTED_TYPES}
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.length) addFiles(e.target.files);
                    e.target.value = "";
                  }}
                />
              </div>

              {files.length > 0 && (
                <ul className="mt-3 space-y-2">
                  {files.map((f, i) => (
                    <li
                      key={`${f.name}-${i}`}
                      className="flex items-center gap-3 rounded-lg border border-white/10 bg-slate-950 px-3 py-2"
                    >
                      {f.previewUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={f.previewUrl}
                          alt={f.name}
                          className="w-10 h-10 rounded object-cover border border-white/10"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded bg-slate-800 border border-white/10 flex items-center justify-center text-[10px] font-semibold text-slate-400">
                          PDF
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-white truncate">{f.name}</p>
                        <p className="text-[11px] text-slate-500">
                          {f.mediaType} · {formatBytes(f.sizeBytes)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(i)}
                        className="text-xs text-slate-500 hover:text-rose-400 px-2"
                        aria-label={`Remove ${f.name}`}
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Business name" value={form.businessName} onChange={(v) => setForm({ ...form, businessName: v })} />
              <Field label="Category" value={form.category} onChange={(v) => setForm({ ...form, category: v })} placeholder="landscaper, gym, dental…" />
              <Field label="Monthly revenue" value={form.monthlyRevenue} onChange={(v) => setForm({ ...form, monthlyRevenue: v })} placeholder="$40k" />
              <Field label="Lead sources" value={form.leadSources} onChange={(v) => setForm({ ...form, leadSources: v })} placeholder="word of mouth, Google" />
              <Field label="Current offer" value={form.currentOffer} onChange={(v) => setForm({ ...form, currentOffer: v })} />
              <Field label="Pricing" value={form.pricing} onChange={(v) => setForm({ ...form, pricing: v })} />
              <div className="col-span-2">
                <Field label="Top complaint" value={form.topComplaint} onChange={(v) => setForm({ ...form, topComplaint: v })} />
              </div>
            </div>

            {/* ─── Business Metrics (collapsible) ──────────────────── */}
            <div className="mt-6 rounded-xl border border-white/10 bg-slate-950/40 overflow-hidden">
              <button
                onClick={() => setMetricsOpen((o) => !o)}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-slate-900/40 transition-colors"
              >
                <div className="text-left">
                  <p className="text-sm font-semibold text-white">
                    📊 Business Metrics
                    <span className="ml-2 text-[10px] uppercase tracking-wider text-emerald-400">
                      new
                    </span>
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    LTV · CAC · Churn · MRR · AOV · Gross Margin —
                    smart-ordered, industry benchmarks, reverse-engineering
                    helpers, magic link to share with prospect.
                  </p>
                </div>
                <span className="text-slate-400 text-lg">
                  {metricsOpen ? "▾" : "▸"}
                </span>
              </button>

              {metricsOpen && (
                <div className="px-4 pb-4 border-t border-white/10">
                  {/* Mode toggle — prospect UUID vs manual entry */}
                  <div className="mt-4 mb-3 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setMetricsMode("prospect")}
                      className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                        metricsMode === "prospect"
                          ? "bg-emerald-500 text-slate-950"
                          : "bg-slate-900 text-slate-400 hover:text-white"
                      }`}
                    >
                      Existing prospect (UUID)
                    </button>
                    <button
                      type="button"
                      onClick={() => setMetricsMode("manual")}
                      className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                        metricsMode === "manual"
                          ? "bg-emerald-500 text-slate-950"
                          : "bg-slate-900 text-slate-400 hover:text-white"
                      }`}
                    >
                      Manual entry (no UUID)
                    </button>
                  </div>

                  {metricsMode === "prospect" ? (
                    <>
                      <div className="mt-4 mb-4">
                        <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1">
                          Prospect UUID *
                        </label>
                        <input
                          type="text"
                          value={prospectId}
                          onChange={(e) => {
                            setProspectId(e.target.value);
                            setMagicLink(null);
                          }}
                          placeholder="paste prospect UUID (from CRM / dashboard / URL)"
                          className={`w-full rounded-lg border px-3 py-2 text-sm font-mono ${
                            prospectId === ""
                              ? "border-white/10 bg-slate-950"
                              : isValidProspectId
                                ? "border-emerald-500/40 bg-slate-950"
                                : "border-rose-500/40 bg-slate-950"
                          }`}
                        />
                        <p className="text-[11px] text-slate-500 mt-1">
                          Find a prospect&apos;s UUID by opening their row in
                          /dashboard/clients or /dashboard/sales-pipeline and
                          copying from the URL.
                        </p>
                      </div>

                      {isValidProspectId ? (
                        <>
                          {metricsLoading && (
                            <p className="text-xs text-slate-500 my-3">
                              Loading existing metrics…
                            </p>
                          )}
                          <MetricsPanel
                            key={prospectId}
                            initialInputs={
                              metricsRow
                                ? {
                                    monthly_revenue: metricsRow.monthly_revenue,
                                    active_customers: metricsRow.active_customers,
                                    average_order_value:
                                      metricsRow.average_order_value,
                                    gross_margin_pct: metricsRow.gross_margin_pct,
                                    churn_monthly_pct:
                                      metricsRow.churn_monthly_pct,
                                    customer_acquisition_cost:
                                      metricsRow.customer_acquisition_cost,
                                  }
                                : undefined
                            }
                            initialIndustry={metricsRow?.industry ?? null}
                            initialEstimates={metricsRow?.estimates ?? {}}
                            initialQualifierAnswers={
                              metricsRow?.qualifier_answers ?? {}
                            }
                            onSave={saveMetrics}
                          />

                          {/* Magic link generator */}
                          <div className="mt-5 rounded-lg border border-sky-500/30 bg-sky-500/5 p-4">
                            <p className="text-xs uppercase tracking-wider text-sky-400 font-semibold mb-2">
                              Send to prospect
                            </p>
                            <p className="text-[11px] text-slate-300 mb-3">
                              Generate a one-time magic link so the prospect
                              can fill in any missing metrics themselves. Link
                              expires in 7 days.
                            </p>
                            {!magicLink ? (
                              <button
                                onClick={generateMagicLink}
                                className="px-3 py-2 text-xs font-semibold rounded bg-sky-500 hover:bg-sky-400 text-slate-950"
                              >
                                Generate magic link →
                              </button>
                            ) : (
                              <div className="space-y-2">
                                <div className="flex gap-2">
                                  <input
                                    readOnly
                                    value={magicLink}
                                    className="flex-1 rounded border border-white/15 bg-slate-950 px-2 py-1.5 text-[11px] text-white font-mono"
                                    onFocus={(e) => e.currentTarget.select()}
                                  />
                                  <button
                                    onClick={copyMagicLink}
                                    className="px-3 py-1.5 text-[11px] font-semibold rounded bg-sky-500 hover:bg-sky-400 text-slate-950"
                                  >
                                    {magicLinkCopied ? "✓ Copied" : "Copy"}
                                  </button>
                                </div>
                                <p className="text-[10px] text-slate-500">
                                  Expires in 7 days · text/email this to the
                                  prospect
                                </p>
                              </div>
                            )}
                          </div>
                        </>
                      ) : (
                        prospectId !== "" && (
                          <p className="text-xs text-rose-400 my-3">
                            Not a valid UUID — paste the full 36-char
                            prospect ID.
                          </p>
                        )
                      )}
                    </>
                  ) : (
                    <>
                      <p className="text-[11px] text-slate-500 mt-3 mb-3">
                        Local-only — nothing saved to the prospect row.
                        Numbers flow straight into the diagnosis prompt.
                      </p>
                      <MetricsPanel
                        key="manual"
                        initialInputs={manualMetrics.inputs}
                        initialIndustry={manualMetrics.industry}
                        initialEstimates={manualMetrics.estimates}
                        initialQualifierAnswers={manualMetrics.qualifier_answers}
                        onSave={async (state) => {
                          setManualMetrics({
                            industry: state.industry,
                            inputs: state.inputs,
                            estimates: state.estimates,
                            qualifier_answers: state.qualifier_answers,
                          });
                        }}
                      />
                    </>
                  )}

                  {/* 4 extra stats — apply to both modes (round out to 10). */}
                  <div className="mt-5 rounded-lg border border-white/10 bg-slate-950/60 p-4">
                    <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-3">
                      Top-of-funnel & capacity (4 more)
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {(Object.keys(EXTRA_STATS_LABELS) as Array<keyof ExtraStats>).map(
                        (k) => {
                          const unit = EXTRA_STATS_UNIT[k];
                          return (
                            <div key={k}>
                              <label className="block text-[11px] uppercase tracking-wider text-slate-400 mb-1">
                                {EXTRA_STATS_LABELS[k]}
                              </label>
                              <div className="flex items-center gap-1">
                                {unit === "currency" && (
                                  <span className="text-slate-500 text-sm">$</span>
                                )}
                                <input
                                  type="number"
                                  inputMode={unit === "count" ? "numeric" : "decimal"}
                                  value={extraStats[k]}
                                  onChange={(e) =>
                                    setExtraStats((p) => ({ ...p, [k]: e.target.value }))
                                  }
                                  placeholder="—"
                                  className="w-full rounded border border-white/15 bg-slate-950 px-2 py-1.5 text-sm text-white placeholder-slate-600"
                                />
                                {unit === "percent" && (
                                  <span className="text-slate-500 text-sm">%</span>
                                )}
                              </div>
                            </div>
                          );
                        },
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={onDiagnoseClick}
              disabled={loading}
              className="mt-6 w-full rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-700 disabled:cursor-not-allowed text-slate-950 font-semibold px-4 py-3 text-sm transition-colors"
            >
              {loading
                ? "Diagnosing…"
                : missingTop10.length > 0
                  ? `Diagnose · ${10 - missingTop10.length}/10 stats filled`
                  : "Diagnose · all 10 stats filled"}
            </button>

            {error && (
              <p className="mt-3 text-sm text-rose-400 whitespace-pre-wrap">{error}</p>
            )}

            <button
              onClick={() => {
                setForm(EMPTY_FORM);
                files.forEach((f) => f.previewUrl && URL.revokeObjectURL(f.previewUrl));
                setFiles([]);
                setResult(null);
                setMeta(null);
                setError(null);
                setManualMetrics(EMPTY_MANUAL_METRICS);
                setExtraStats(EMPTY_EXTRA_STATS);
                setPreFlightDismissed(false);
              }}
              className="mt-2 w-full text-xs text-slate-500 hover:text-slate-300"
            >
              Clear
            </button>
          </section>

          {/* OUTPUT */}
          <section className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 min-h-[400px]">
            {!result ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-500">
                <div className="text-5xl mb-3">🧠</div>
                <p className="text-sm max-w-sm">
                  Paste a prospect call dump and hit <b>Diagnose</b>. Output appears here in ~10 seconds.
                </p>
              </div>
            ) : (
              <DiagnosisView diagnosis={result} meta={meta} />
            )}
          </section>
        </div>

        {/* PRE-FLIGHT CHECK — surfaces missing stats before firing diagnose */}
        {preFlightOpen && (
          <PreFlightModal
            missing={missingTop10}
            filledCount={10 - missingTop10.length}
            mode={metricsMode}
            extraStats={extraStats}
            manualMetrics={manualMetrics}
            onSetExtra={(k, v) =>
              setExtraStats((p) => ({ ...p, [k]: v }))
            }
            onSetManualMetric={(k, v) =>
              setManualMetrics((p) => ({
                ...p,
                inputs: { ...p.inputs, [k]: v },
                estimates: { ...p.estimates, [k]: "user_entered" },
              }))
            }
            onCancel={() => setPreFlightOpen(false)}
            onProceed={() => {
              setPreFlightDismissed(true);
              setPreFlightOpen(false);
              submit();
            }}
            onOpenMetricsPanel={() => {
              setMetricsOpen(true);
              setPreFlightOpen(false);
            }}
          />
        )}

        {/* RECENT */}
        {recent.length > 0 && (
          <section className="mt-10">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-3">
              Recent diagnoses
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              {recent.map((r) => (
                <button
                  key={r.id}
                  onClick={() => loadRun(r)}
                  className="text-left rounded-lg border border-white/5 bg-slate-900/40 hover:bg-slate-900/80 hover:border-white/20 px-4 py-3 transition-colors"
                >
                  <p className="text-sm font-semibold text-white truncate">
                    {r.business_input.businessName || "(unnamed)"}
                  </p>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                    {r.diagnosis?.one_line_summary || r.business_input.businessText || "—"}
                  </p>
                  <p className="text-[10px] text-slate-600 mt-2">
                    {new Date(r.created_at).toLocaleString()} · ${Number(r.cost_usd).toFixed(3)}
                  </p>
                </button>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm placeholder-slate-600"
      />
    </div>
  );
}

function DiagnosisView({
  diagnosis,
  meta,
}: {
  diagnosis: Diagnosis;
  meta: { durationMs: number; chunksUsed: number } | null;
}) {
  return (
    <div className="space-y-5">
      {meta && (
        <p className="text-[11px] uppercase tracking-wider text-slate-500">
          {(meta.durationMs / 1000).toFixed(1)}s · {meta.chunksUsed} KB chunks
        </p>
      )}

      <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4">
        <p className="text-xs uppercase tracking-wider text-emerald-400 font-semibold mb-1">
          One-line diagnosis
        </p>
        <p className="text-base text-white font-medium">{diagnosis.one_line_summary}</p>
      </div>

      <Section title="Bottleneck">
        <p className="text-sm font-semibold text-white mb-1">{diagnosis.bottleneck.label}</p>
        <p className="text-sm text-slate-300 mb-2">{diagnosis.bottleneck.explanation}</p>
        <Cite>{diagnosis.bottleneck.framework_cited}</Cite>
      </Section>

      <Section title="Three problems">
        <ol className="space-y-3">
          {diagnosis.three_problems.map((p, i) => (
            <li key={i} className="border-l-2 border-sky-500/40 pl-3">
              <p className="text-sm font-semibold text-white">{i + 1}. {p.title}</p>
              <p className="text-sm text-slate-300 mt-1">{p.why_it_matters}</p>
              <Cite>{p.framework_cited}</Cite>
            </li>
          ))}
        </ol>
      </Section>

      <Section title="Grand Slam offer reframe">
        <p className="text-base font-semibold text-white mb-2">
          &ldquo;{diagnosis.grand_slam_offer.headline}&rdquo;
        </p>
        <KV k="Dream outcome" v={diagnosis.grand_slam_offer.dream_outcome} />
        <KV k="Proof / guarantee" v={diagnosis.grand_slam_offer.proof_or_guarantee} />
        <KV k="Week-1 win" v={diagnosis.grand_slam_offer.time_to_first_win} />
        <div className="mt-2">
          <p className="text-xs uppercase tracking-wider text-slate-400 mb-1">Bonus stack</p>
          <ul className="list-disc list-inside text-sm text-slate-300 space-y-1">
            {diagnosis.grand_slam_offer.bonus_stack.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
        </div>
      </Section>

      <Section title="Close frame">
        <KV k="Pitch" v={diagnosis.close_frame.one_sentence_pitch} highlight />
        <KV k="Objection handler" v={diagnosis.close_frame.objection_handler} />
        <KV k="Ask" v={diagnosis.close_frame.call_to_action} />
      </Section>

      <Section title="Follow-ups">
        <ul className="list-disc list-inside text-sm text-slate-300 space-y-1">
          {diagnosis.follow_ups.map((f, i) => (
            <li key={i}>{f}</li>
          ))}
        </ul>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2">{title}</p>
      <div className="rounded-lg border border-white/10 bg-slate-950/40 p-4">{children}</div>
    </div>
  );
}

function KV({ k, v, highlight }: { k: string; v: string; highlight?: boolean }) {
  return (
    <div className="mb-2 last:mb-0">
      <p className="text-[11px] uppercase tracking-wider text-slate-500">{k}</p>
      <p className={`text-sm ${highlight ? "text-emerald-300 font-medium" : "text-slate-200"}`}>{v}</p>
    </div>
  );
}

function PreFlightModal({
  missing,
  filledCount,
  mode,
  extraStats,
  manualMetrics,
  onSetExtra,
  onSetManualMetric,
  onCancel,
  onProceed,
  onOpenMetricsPanel,
}: {
  missing: Array<{ key: string; label: string }>;
  filledCount: number;
  mode: MetricsMode;
  extraStats: ExtraStats;
  manualMetrics: ManualMetricsState;
  onSetExtra: (k: keyof ExtraStats, v: string) => void;
  onSetManualMetric: (k: DiagnosisMetricKey, v: number | null) => void;
  onCancel: () => void;
  onProceed: () => void;
  onOpenMetricsPanel: () => void;
}) {
  const coreKeys = new Set([
    "monthly_revenue",
    "active_customers",
    "average_order_value",
    "gross_margin_pct",
    "churn_monthly_pct",
    "customer_acquisition_cost",
  ]);
  const extraKeys = new Set([
    "monthly_leads",
    "close_rate_pct",
    "monthly_ad_spend",
    "team_size",
  ]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-xl rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-xs uppercase tracking-wider text-amber-400 font-semibold mb-1">
          Quick numbers check
        </p>
        <h3 className="text-xl font-bold text-white mb-1">
          {filledCount}/10 stats filled — {missing.length} still missing
        </h3>
        <p className="text-sm text-slate-400 mb-5">
          The diagnosis gets sharper with every number. Fill what you can
          here, or skip and let Claude infer from the free-text dump.
        </p>

        <div className="space-y-3">
          {missing.map(({ key, label }) => {
            const isCore = coreKeys.has(key);
            const isExtra = extraKeys.has(key);

            if (isExtra) {
              const ek = key as keyof ExtraStats;
              const unit = EXTRA_STATS_UNIT[ek];
              return (
                <div
                  key={key}
                  className="rounded-lg border border-white/10 bg-slate-950/60 p-3"
                >
                  <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1">
                    {label}
                  </label>
                  <div className="flex items-center gap-1">
                    {unit === "currency" && (
                      <span className="text-slate-500 text-sm">$</span>
                    )}
                    <input
                      type="number"
                      inputMode={unit === "count" ? "numeric" : "decimal"}
                      value={extraStats[ek]}
                      onChange={(e) => onSetExtra(ek, e.target.value)}
                      placeholder="—"
                      className="w-full rounded border border-white/15 bg-slate-950 px-2 py-1.5 text-sm text-white placeholder-slate-600"
                      autoFocus={missing[0]?.key === key}
                    />
                    {unit === "percent" && (
                      <span className="text-slate-500 text-sm">%</span>
                    )}
                  </div>
                </div>
              );
            }

            if (isCore && mode === "manual") {
              const mk = key as DiagnosisMetricKey;
              const currentValue = manualMetrics.inputs[mk];
              const unit =
                mk === "monthly_revenue" ||
                mk === "average_order_value" ||
                mk === "customer_acquisition_cost"
                  ? "currency"
                  : mk === "gross_margin_pct" || mk === "churn_monthly_pct"
                    ? "percent"
                    : "count";
              return (
                <div
                  key={key}
                  className="rounded-lg border border-white/10 bg-slate-950/60 p-3"
                >
                  <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1">
                    {label}
                  </label>
                  <div className="flex items-center gap-1">
                    {unit === "currency" && (
                      <span className="text-slate-500 text-sm">$</span>
                    )}
                    <input
                      type="number"
                      inputMode={unit === "count" ? "numeric" : "decimal"}
                      value={currentValue ?? ""}
                      onChange={(e) => {
                        const v = e.target.value;
                        if (v === "") onSetManualMetric(mk, null);
                        else {
                          const n = parseFloat(v);
                          if (Number.isFinite(n)) onSetManualMetric(mk, n);
                        }
                      }}
                      placeholder="—"
                      className="w-full rounded border border-white/15 bg-slate-950 px-2 py-1.5 text-sm text-white placeholder-slate-600"
                      autoFocus={missing[0]?.key === key}
                    />
                    {unit === "percent" && (
                      <span className="text-slate-500 text-sm">%</span>
                    )}
                  </div>
                </div>
              );
            }

            // Core metric missing in prospect mode — point user back to the panel.
            return (
              <div
                key={key}
                className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-xs text-amber-200 flex items-center justify-between"
              >
                <span>{label}</span>
                <button
                  onClick={onOpenMetricsPanel}
                  className="text-amber-300 hover:text-amber-100 underline-offset-2 hover:underline"
                >
                  Open metrics panel →
                </button>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex gap-3 justify-end">
          <button
            onClick={onProceed}
            className="px-4 py-2 text-sm text-slate-400 hover:text-white"
          >
            Skip — diagnose with what I have
          </button>
          <button
            onClick={onProceed}
            className="px-4 py-2 text-sm font-semibold rounded-lg bg-emerald-500 text-slate-950 hover:bg-emerald-400"
          >
            Use these numbers · Diagnose
          </button>
        </div>
      </div>
    </div>
  );
}

function Cite({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] text-slate-500 mt-1">
      <span className="text-slate-600">↳ </span>
      {children}
    </p>
  );
}
