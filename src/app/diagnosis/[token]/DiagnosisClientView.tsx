"use client";

/**
 * Client-facing magic-link diagnosis view.
 *
 * Renders the same MetricsPanel as the admin dashboard, but:
 *   · No prospect picker — token already binds to one prospect
 *   · Softened copy: "your business" instead of "the prospect"
 *   · No "send to prospect" button — they ARE the prospect
 *   · Reads/writes via /api/diagnosis/[token] (public route, token-gated)
 *   · After save, can click "I'm done — show me the result"
 *
 * Robot-indexed: NO (set in page.tsx metadata).
 */

import { useEffect, useState } from "react";
import MetricsPanel from "@/components/diagnosis/MetricsPanel";
import type {
  DiagnosisDerived,
  DiagnosisEstimateSource,
  DiagnosisIndustry,
  DiagnosisMetricKey,
} from "@/lib/types";
import type { MetricInputs } from "@/lib/diagnosis/metrics-calc";

type ClientRow = {
  industry: DiagnosisIndustry | null;
  monthly_revenue: number | null;
  active_customers: number | null;
  average_order_value: number | null;
  gross_margin_pct: number | null;
  churn_monthly_pct: number | null;
  customer_acquisition_cost: number | null;
  estimates: Partial<Record<DiagnosisMetricKey, DiagnosisEstimateSource>>;
  qualifier_answers: Record<string, number | null>;
  derived: DiagnosisDerived;
  client_completed_at: string | null;
};

type LoadState =
  | { kind: "loading" }
  | { kind: "error"; reason: "not_found" | "expired" | "db_error" | "not_configured" | "unknown" }
  | { kind: "ready"; row: ClientRow };

export default function DiagnosisClientView({ token }: { token: string }) {
  const [state, setState] = useState<LoadState>({ kind: "loading" });
  const [completing, setCompleting] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    fetch(`/api/diagnosis/${token}`)
      .then(async (r) => {
        const j = await r.json();
        if (!j.ok) {
          setState({
            kind: "error",
            reason: j.error === "expired"
              ? "expired"
              : j.error === "not_found"
                ? "not_found"
                : j.error === "not_configured"
                  ? "not_configured"
                  : j.error === "db_error"
                    ? "db_error"
                    : "unknown",
          });
          return;
        }
        setState({ kind: "ready", row: j.row });
        if (j.row.client_completed_at) setCompleted(true);
      })
      .catch(() => setState({ kind: "error", reason: "unknown" }));
  }, [token]);

  async function saveMetrics(s: Parameters<
    NonNullable<React.ComponentProps<typeof MetricsPanel>["onSave"]>
  >[0]) {
    const r = await fetch(`/api/diagnosis/${token}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        industry: s.industry,
        ...s.inputs,
        estimates: s.estimates,
        qualifier_answers: s.qualifier_answers,
      }),
    });
    const j = await r.json();
    if (!j.ok) throw new Error(j.error || "save failed");
    if (state.kind === "ready") {
      setState({ kind: "ready", row: j.row });
    }
  }

  async function markComplete() {
    setCompleting(true);
    try {
      const r = await fetch(`/api/diagnosis/${token}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark_complete" }),
      });
      const j = await r.json();
      if (j.ok) {
        setCompleted(true);
        if (state.kind === "ready") {
          setState({ kind: "ready", row: j.row });
        }
      }
    } finally {
      setCompleting(false);
    }
  }

  // ─── ERROR STATES ─────────────────────────────────────────────
  if (state.kind === "loading") {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <p className="text-slate-500">Loading…</p>
      </main>
    );
  }

  if (state.kind === "error") {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <p className="text-4xl mb-4">😕</p>
          <h1 className="text-2xl font-bold mb-2">
            {state.reason === "expired"
              ? "This link has expired"
              : state.reason === "not_found"
                ? "This link isn't valid"
                : "Something went wrong"}
          </h1>
          <p className="text-slate-400 text-sm">
            {state.reason === "expired"
              ? "Magic links expire after 7 days for security. Ask Ben to send you a fresh one."
              : state.reason === "not_found"
                ? "Either the URL is mistyped or the link was already used and reset. Ask Ben to send a new one."
                : "Try refreshing the page in a minute. If it keeps happening, text Ben."}
          </p>
        </div>
      </main>
    );
  }

  // ─── READY STATE ──────────────────────────────────────────────
  const row = state.row;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <header className="mb-8">
          <p className="text-xs uppercase tracking-wider text-sky-400 font-semibold mb-2">
            BlueJays · Business Health Check
          </p>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            Help us see your full picture
          </h1>
          <p className="text-slate-300 text-base max-w-2xl">
            Ben filled in what he knew from our call. Take 2 minutes to
            add anything missing — your saved numbers update the analysis
            instantly. If you don&apos;t know a number, hit{" "}
            <span className="text-sky-300 font-semibold">
              &ldquo;Not sure? Help me figure it out&rdquo;
            </span>{" "}
            for a quick way to back into it.
          </p>
        </header>

        {completed && (
          <div className="mb-6 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
            <p className="text-emerald-300 font-semibold text-sm">
              ✓ Sent to Ben — he&apos;ll be in touch with the full
              breakdown.
            </p>
            <p className="text-emerald-300/70 text-xs mt-1">
              You can keep editing if you want — your changes still save.
            </p>
          </div>
        )}

        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
          <MetricsPanel
            initialInputs={
              {
                monthly_revenue: row.monthly_revenue,
                active_customers: row.active_customers,
                average_order_value: row.average_order_value,
                gross_margin_pct: row.gross_margin_pct,
                churn_monthly_pct: row.churn_monthly_pct,
                customer_acquisition_cost: row.customer_acquisition_cost,
              } as MetricInputs
            }
            initialIndustry={row.industry}
            initialEstimates={row.estimates}
            initialQualifierAnswers={row.qualifier_answers}
            onSave={saveMetrics}
            showIndustryPicker={true}
            clientMode
          />
        </div>

        {!completed && (
          <div className="mt-6 flex justify-end">
            <button
              onClick={markComplete}
              disabled={completing}
              className="px-5 py-3 text-sm font-semibold rounded-lg bg-sky-500 hover:bg-sky-400 disabled:bg-slate-700 text-slate-950"
            >
              {completing ? "Sending…" : "I’m done — send to Ben →"}
            </button>
          </div>
        )}

        <p className="text-center text-[11px] text-slate-600 mt-8">
          Saved automatically as you type · Link expires in 7 days
        </p>
      </div>
    </main>
  );
}
