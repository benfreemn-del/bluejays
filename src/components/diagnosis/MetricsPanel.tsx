"use client";

/**
 * MetricsPanel — the structured financial-metrics intake for the
 * Diagnosis Tool. Mounts inside /dashboard/diagnostic page below the
 * existing free-text "What they said" textarea, AND inside the
 * /diagnosis/[token] client magic-link view (variant: clientMode).
 *
 * Three behaviors that make this not just "another form":
 *  1. SMART ORDERING — fields rendered in dependency order so
 *     answering one unlocks the auto-derive of others
 *  2. THREE WAYS TO FILL EACH FIELD —
 *       a) type it in
 *       b) "Use industry estimate" (⚠ flagged in audit trail)
 *       c) "Help me derive it" (qualifier dialog with simpler questions)
 *  3. LIVE DERIVED METRICS — sidebar updates on every change
 *     showing LTV, payback, LTV:CAC ratio, health score
 *
 * Auto-save: debounced 500ms after last edit (Q12=A).
 */

import { useEffect, useMemo, useRef, useState } from "react";
import {
  computeDerivedMetrics,
  METRIC_HINTS,
  METRIC_LABELS,
  METRIC_UNIT,
  METRIC_UNLOCKS,
  SMART_ENTRY_ORDER,
  type DerivedMetrics,
  type MetricInputs,
} from "@/lib/diagnosis/metrics-calc";
import {
  applyBenchmark,
  BENCHMARKS,
  getBenchmark,
  INDUSTRY_LABELS,
  type Industry,
} from "@/lib/diagnosis/benchmarks";
import {
  getQualifierFlow,
  type QualifierFlow,
} from "@/lib/diagnosis/qualifier-flows";
import type {
  DiagnosisEstimateSource,
  DiagnosisMetricKey,
} from "@/lib/types";

type Props = {
  /** Optional initial values (e.g. loaded from server) */
  initialInputs?: Partial<MetricInputs>;
  initialIndustry?: Industry | null;
  initialEstimates?: Partial<Record<DiagnosisMetricKey, DiagnosisEstimateSource>>;
  initialQualifierAnswers?: Record<string, number | null>;

  /** Save callback — called debounced 500ms after change. */
  onSave?: (state: {
    industry: Industry | null;
    inputs: MetricInputs;
    estimates: Partial<Record<DiagnosisMetricKey, DiagnosisEstimateSource>>;
    qualifier_answers: Record<string, number | null>;
    derived: DerivedMetrics;
  }) => Promise<void> | void;

  /** Show industry picker? Admin always wants it; client view inherits. */
  showIndustryPicker?: boolean;

  /** Client-mode: removes admin-only affordances + softens copy. */
  clientMode?: boolean;
};

const EMPTY_INPUTS: MetricInputs = {
  monthly_revenue: null,
  active_customers: null,
  average_order_value: null,
  gross_margin_pct: null,
  churn_monthly_pct: null,
  customer_acquisition_cost: null,
};

export default function MetricsPanel(props: Props) {
  const [industry, setIndustry] = useState<Industry | null>(
    props.initialIndustry ?? null,
  );
  const [inputs, setInputs] = useState<MetricInputs>({
    ...EMPTY_INPUTS,
    ...(props.initialInputs ?? {}),
  });
  const [estimates, setEstimates] = useState<
    Partial<Record<DiagnosisMetricKey, DiagnosisEstimateSource>>
  >(props.initialEstimates ?? {});
  const [qualifierAnswers, setQualifierAnswers] = useState<
    Record<string, number | null>
  >(props.initialQualifierAnswers ?? {});

  const [activeQualifier, setActiveQualifier] = useState<
    DiagnosisMetricKey | null
  >(null);

  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRenderRef = useRef(true);

  // Live derived metrics
  const derived = useMemo(() => computeDerivedMetrics(inputs), [inputs]);

  // Auto-derive AOV when revenue + customers are both known
  useEffect(() => {
    if (
      inputs.monthly_revenue !== null &&
      inputs.active_customers !== null &&
      inputs.active_customers > 0 &&
      inputs.average_order_value === null
    ) {
      const aov =
        Math.round(
          (inputs.monthly_revenue / inputs.active_customers) * 100,
        ) / 100;
      setInputs((prev) => ({ ...prev, average_order_value: aov }));
      setEstimates((prev) => ({
        ...prev,
        average_order_value: "auto_computed",
      }));
    }
  }, [inputs.monthly_revenue, inputs.active_customers, inputs.average_order_value]);

  // Debounced auto-save
  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      return;
    }
    if (!props.onSave) return;

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    setSaveState("idle");

    saveTimerRef.current = setTimeout(async () => {
      setSaveState("saving");
      try {
        await props.onSave?.({
          industry,
          inputs,
          estimates,
          qualifier_answers: qualifierAnswers,
          derived,
        });
        setSaveState("saved");
        setTimeout(() => setSaveState("idle"), 1500);
      } catch {
        setSaveState("error");
      }
    }, 500);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [industry, inputs, estimates, qualifierAnswers]);

  // ─── Handlers ─────────────────────────────────────────────────

  function setMetric(key: DiagnosisMetricKey, value: number | null) {
    setInputs((prev) => ({ ...prev, [key]: value }));
    setEstimates((prev) => ({ ...prev, [key]: "user_entered" }));
  }

  function clearMetric(key: DiagnosisMetricKey) {
    setInputs((prev) => ({ ...prev, [key]: null }));
    setEstimates((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function useIndustryDefault(key: DiagnosisMetricKey) {
    if (!industry) return;
    const result = applyBenchmark(inputs, industry, key);
    if (!result.applied) return;
    setInputs(result.inputs);
    setEstimates((prev) => ({ ...prev, [key]: "industry_default" }));
  }

  function handleQualifierComplete(
    metric: DiagnosisMetricKey,
    derivedValue: number,
    rawAnswers: Record<string, number | null>,
  ) {
    setInputs((prev) => ({ ...prev, [metric]: derivedValue }));
    setEstimates((prev) => ({ ...prev, [metric]: "derived" }));
    setQualifierAnswers((prev) => ({ ...prev, ...rawAnswers }));
    setActiveQualifier(null);
  }

  // ─── Render ───────────────────────────────────────────────────

  const orderedKeys = SMART_ENTRY_ORDER;

  return (
    <div className="space-y-4">
      {/* Industry picker */}
      {props.showIndustryPicker !== false && (
        <div>
          <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1">
            Industry
            {industry && (
              <span className="ml-2 text-emerald-400 text-[10px]">
                ✓ benchmarks loaded
              </span>
            )}
          </label>
          <select
            value={industry ?? ""}
            onChange={(e) =>
              setIndustry((e.target.value || null) as Industry | null)
            }
            className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm"
          >
            <option value="">— Select industry —</option>
            {(Object.keys(INDUSTRY_LABELS) as Industry[]).map((k) => (
              <option key={k} value={k}>
                {INDUSTRY_LABELS[k]}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Metric inputs (smart-ordered) */}
      <div className="space-y-3">
        {orderedKeys.map((key, idx) => {
          const value = inputs[key];
          const source = estimates[key];
          const benchmark = industry ? getBenchmark(industry, key) : null;
          const flow = getQualifierFlow(key);
          const unit = METRIC_UNIT[key];
          const isUnanswered = value === null;
          const isNextRecommended =
            isUnanswered &&
            orderedKeys.slice(0, idx).every((k) => inputs[k] !== null);

          return (
            <MetricRow
              key={key}
              metricKey={key}
              stepNumber={idx + 1}
              totalSteps={orderedKeys.length}
              value={value}
              source={source}
              unit={unit}
              isNextRecommended={isNextRecommended}
              benchmark={benchmark}
              hasQualifier={!!flow}
              clientMode={props.clientMode}
              onChangeValue={(v) =>
                v === null ? clearMetric(key) : setMetric(key, v)
              }
              onUseBenchmark={() => useIndustryDefault(key)}
              onOpenQualifier={() => setActiveQualifier(key)}
            />
          );
        })}
      </div>

      {/* Save state */}
      <div className="flex justify-end text-[11px] text-slate-500 min-h-[16px]">
        {saveState === "saving" && <span>Saving…</span>}
        {saveState === "saved" && (
          <span className="text-emerald-400">✓ Saved</span>
        )}
        {saveState === "error" && (
          <span className="text-rose-400">Save failed — retrying…</span>
        )}
      </div>

      {/* Derived metrics sidebar (inline below on mobile) */}
      <DerivedSidebar derived={derived} clientMode={props.clientMode} />

      {/* Qualifier dialog */}
      {activeQualifier && (
        <QualifierDialog
          metric={activeQualifier}
          flow={getQualifierFlow(activeQualifier)!}
          initialAnswers={qualifierAnswers}
          onCancel={() => setActiveQualifier(null)}
          onComplete={handleQualifierComplete}
        />
      )}
    </div>
  );
}

// ──────────────────────────── MetricRow ────────────────────────────

function MetricRow({
  metricKey,
  stepNumber,
  totalSteps,
  value,
  source,
  unit,
  isNextRecommended,
  benchmark,
  hasQualifier,
  clientMode,
  onChangeValue,
  onUseBenchmark,
  onOpenQualifier,
}: {
  metricKey: DiagnosisMetricKey;
  stepNumber: number;
  totalSteps: number;
  value: number | null;
  source?: DiagnosisEstimateSource;
  unit: "currency" | "count" | "percent";
  isNextRecommended: boolean;
  benchmark: { value: number; note: string } | null;
  hasQualifier: boolean;
  clientMode?: boolean;
  onChangeValue: (v: number | null) => void;
  onUseBenchmark: () => void;
  onOpenQualifier: () => void;
}) {
  const label = METRIC_LABELS[metricKey];
  const hint = METRIC_HINTS[metricKey];
  const unlocks = METRIC_UNLOCKS[metricKey];

  const isEmpty = value === null;
  const isEstimate =
    source === "industry_default" || source === "derived" || source === "auto_computed";

  return (
    <div
      className={`rounded-lg border p-3 transition-colors ${
        isNextRecommended
          ? "border-emerald-500/40 bg-emerald-500/5"
          : isEmpty
            ? "border-white/10 bg-slate-950/40"
            : "border-white/15 bg-slate-900/40"
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] uppercase tracking-wider text-slate-500">
              Step {stepNumber}/{totalSteps}
            </span>
            {isNextRecommended && !isEmpty === false && (
              <span className="text-[10px] uppercase tracking-wider text-emerald-400">
                ← start here
              </span>
            )}
            {isEstimate && (
              <span
                title={`Source: ${source}`}
                className="text-[10px] uppercase tracking-wider text-amber-400"
              >
                ⚠ {source === "industry_default" ? "estimate" : source === "derived" ? "derived" : "auto"}
              </span>
            )}
          </div>
          <p className="text-sm font-semibold text-white mt-0.5">{label}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">{hint}</p>
        </div>

        {/* Input */}
        <div className="flex items-center gap-1 shrink-0">
          {unit === "currency" && (
            <span className="text-slate-500 text-sm">$</span>
          )}
          <input
            type="number"
            value={value ?? ""}
            onChange={(e) => {
              const v = e.target.value;
              if (v === "") onChangeValue(null);
              else {
                const n = parseFloat(v);
                if (Number.isFinite(n)) onChangeValue(n);
              }
            }}
            inputMode={unit === "count" ? "numeric" : "decimal"}
            placeholder="—"
            className="w-28 rounded border border-white/15 bg-slate-950 px-2 py-1 text-sm text-right text-white placeholder-slate-600"
          />
          {unit === "percent" && (
            <span className="text-slate-500 text-sm">%</span>
          )}
        </div>
      </div>

      {/* Helper row: unlocks + estimate / derive buttons */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <p className="text-[10px] text-slate-500">
          Unlocks: {unlocks.join(" · ")}
        </p>
        {isEmpty && (
          <div className="flex items-center gap-2 flex-wrap">
            {benchmark && (
              <button
                onClick={onUseBenchmark}
                className="text-[11px] text-amber-300 hover:text-amber-200 underline-offset-2 hover:underline"
                title={benchmark.note}
              >
                ⚠ Use industry estimate ({formatValue(benchmark.value, unit)})
              </button>
            )}
            {hasQualifier && (
              <button
                onClick={onOpenQualifier}
                className="text-[11px] text-sky-300 hover:text-sky-200 underline-offset-2 hover:underline"
              >
                {clientMode ? "Not sure? Help me figure it out →" : "Help me derive it →"}
              </button>
            )}
          </div>
        )}
        {!isEmpty && (
          <button
            onClick={() => onChangeValue(null)}
            className="text-[10px] text-slate-600 hover:text-slate-400"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}

// ──────────────────────────── DerivedSidebar ────────────────────────────

function DerivedSidebar({
  derived,
  clientMode,
}: {
  derived: DerivedMetrics;
  clientMode?: boolean;
}) {
  const healthLabel =
    derived.health_score === "healthy"
      ? "✅ Healthy"
      : derived.health_score === "watch"
        ? "⚠ Watch zone"
        : derived.health_score === "red_flag"
          ? "🚨 Red flag"
          : "— Insufficient data";

  const healthClass =
    derived.health_score === "healthy"
      ? "text-emerald-300 border-emerald-500/40 bg-emerald-500/10"
      : derived.health_score === "watch"
        ? "text-amber-300 border-amber-500/40 bg-amber-500/10"
        : derived.health_score === "red_flag"
          ? "text-rose-300 border-rose-500/40 bg-rose-500/10"
          : "text-slate-400 border-white/10 bg-slate-900/40";

  return (
    <div className="rounded-lg border border-white/10 bg-slate-950/60 p-4">
      <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-3 font-semibold">
        Derived metrics — live
      </p>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <StatCard label="LTV" value={derived.ltv} unit="currency" />
        <StatCard label="LTV : CAC" value={derived.ltv_cac_ratio} unit="ratio" />
        <StatCard label="Payback" value={derived.payback_months} unit="months" />
        <StatCard
          label="Avg Lifespan"
          value={derived.avg_lifespan_months}
          unit="months"
        />
        <StatCard label="ARPU / mo" value={derived.arpu_monthly} unit="currency" />
      </div>

      <div className={`rounded border px-3 py-2 ${healthClass}`}>
        <p className="text-xs uppercase tracking-wider font-semibold">
          {healthLabel}
        </p>
        {derived.health_reasons && derived.health_reasons.length > 0 && (
          <ul className="mt-1 text-[11px] space-y-0.5 opacity-90">
            {derived.health_reasons.map((r, i) => (
              <li key={i}>• {r}</li>
            ))}
          </ul>
        )}
        {derived.health_score === "insufficient_data" && !clientMode && (
          <p className="text-[11px] mt-1 opacity-80">
            Fill in more metrics above to unlock the health score.
          </p>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  unit,
}: {
  label: string;
  value: number | null | undefined;
  unit: "currency" | "ratio" | "months";
}) {
  const display =
    value === null || value === undefined
      ? "—"
      : unit === "currency"
        ? `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
        : unit === "ratio"
          ? `${value.toFixed(1)}×`
          : `${value.toFixed(1)} mo`;

  return (
    <div className="rounded border border-white/10 bg-slate-900/60 px-3 py-2">
      <p className="text-[10px] uppercase tracking-wider text-slate-500">{label}</p>
      <p className="text-lg font-bold text-white mt-0.5">{display}</p>
    </div>
  );
}

// ──────────────────────────── QualifierDialog ────────────────────────────

function QualifierDialog({
  metric,
  flow,
  initialAnswers,
  onCancel,
  onComplete,
}: {
  metric: DiagnosisMetricKey;
  flow: QualifierFlow;
  initialAnswers: Record<string, number | null>;
  onCancel: () => void;
  onComplete: (
    metric: DiagnosisMetricKey,
    derived: number,
    raw: Record<string, number | null>,
  ) => void;
}) {
  const [answers, setAnswers] = useState<Record<string, number | null>>(() => {
    const seeded: Record<string, number | null> = {};
    for (const f of flow.fields) {
      seeded[f.key] = initialAnswers[f.key] ?? null;
    }
    return seeded;
  });

  const derivedValue = useMemo(() => flow.derive(answers), [answers, flow]);
  const canSubmit = derivedValue !== null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-xs uppercase tracking-wider text-sky-400 font-semibold mb-1">
          Reverse-engineering
        </p>
        <h3 className="text-xl font-bold text-white mb-2">{flow.title}</h3>
        <p className="text-sm text-slate-400 mb-5">{flow.blurb}</p>

        <div className="space-y-4">
          {flow.fields.map((f) => (
            <div key={f.key}>
              <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1">
                {f.label}
              </label>
              <div className="flex items-center gap-1">
                {f.unit === "currency" && (
                  <span className="text-slate-500 text-sm">$</span>
                )}
                <input
                  type="number"
                  inputMode={f.unit === "count" ? "numeric" : "decimal"}
                  placeholder={f.placeholder}
                  value={answers[f.key] ?? ""}
                  onChange={(e) => {
                    const v = e.target.value;
                    setAnswers((prev) => ({
                      ...prev,
                      [f.key]:
                        v === ""
                          ? null
                          : Number.isFinite(parseFloat(v))
                            ? parseFloat(v)
                            : null,
                    }));
                  }}
                  className="flex-1 rounded border border-white/15 bg-slate-950 px-3 py-2 text-sm text-white placeholder-slate-600"
                />
                {f.unit === "percent" && (
                  <span className="text-slate-500 text-sm">%</span>
                )}
              </div>
              {f.hint && (
                <p className="text-[11px] text-slate-500 mt-1">{f.hint}</p>
              )}
            </div>
          ))}
        </div>

        {derivedValue !== null && (
          <div className="mt-5 rounded border border-emerald-500/30 bg-emerald-500/5 px-3 py-2">
            <p className="text-[11px] uppercase tracking-wider text-emerald-400 font-semibold">
              Derived {METRIC_LABELS[metric]}
            </p>
            <p className="text-2xl font-bold text-white mt-0.5">
              {formatValue(derivedValue, METRIC_UNIT[metric])}
            </p>
          </div>
        )}

        <div className="mt-6 flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm text-slate-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={() => canSubmit && onComplete(metric, derivedValue!, answers)}
            disabled={!canSubmit}
            className="px-4 py-2 text-sm font-semibold rounded-lg bg-emerald-500 text-slate-950 hover:bg-emerald-400 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed"
          >
            Use this value
          </button>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────── helpers ────────────────────────────

function formatValue(
  value: number,
  unit: "currency" | "count" | "percent",
): string {
  if (unit === "currency") {
    return `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  }
  if (unit === "percent") return `${value}%`;
  return value.toLocaleString();
}

/** Re-export benchmark table for the client view to render. */
export { BENCHMARKS };
