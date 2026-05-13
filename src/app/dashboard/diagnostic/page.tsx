"use client";

import { useEffect, useRef, useState } from "react";
import MetricsPanel from "@/components/diagnosis/MetricsPanel";
import type { DiagnosisMetricsRow } from "@/lib/types";

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
  const [prospectId, setProspectId] = useState("");
  const [metricsRow, setMetricsRow] = useState<DiagnosisMetricsRow | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [magicLink, setMagicLink] = useState<string | null>(null);
  const [magicLinkCopied, setMagicLinkCopied] = useState(false);

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

  async function submit() {
    if (form.businessText.trim().length < 20) {
      setError("Add at least one sentence about the business (20+ chars).");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    setMeta(null);
    try {
      const payload = {
        ...form,
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
                  {/* Prospect picker */}
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
                          Generate a one-time magic link so the prospect can
                          fill in any missing metrics themselves. Link expires
                          in 7 days.
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
                        Not a valid UUID — paste the full 36-char prospect
                        ID.
                      </p>
                    )
                  )}
                </div>
              )}
            </div>

            <button
              onClick={submit}
              disabled={loading}
              className="mt-6 w-full rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-700 disabled:cursor-not-allowed text-slate-950 font-semibold px-4 py-3 text-sm transition-colors"
            >
              {loading ? "Diagnosing…" : "Diagnose"}
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

function Cite({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] text-slate-500 mt-1">
      <span className="text-slate-600">↳ </span>
      {children}
    </p>
  );
}
