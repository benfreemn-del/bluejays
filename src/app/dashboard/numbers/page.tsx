"use client";

import { useEffect, useState } from "react";
import MetricsPanel from "@/components/diagnosis/MetricsPanel";
import type { DiagnosisMetricsRow } from "@/lib/types";

/**
 * /dashboard/numbers — Hormozi-style business-numbers wizard.
 *
 * Use case:
 *  · Ben enters BlueJays' own metrics → keyed by client_slug='bluejays'
 *  · Ben demos a prospect/affiliate's business → swap the slug + start fresh
 *  · Future: same page mounts inside /clients/[slug]/portal keyed by that slug
 *
 * Multi-tenant via `?slug=` query param. Defaults to 'bluejays' for self-diagnose.
 *
 * MetricsPanel does the heavy lifting (smart-ordered fields, work-backwards
 * qualifier flows, industry benchmarks, auto-save). This page wraps it with:
 *   · Slug picker at top (swap businesses on the fly)
 *   · Copy-Diagnostic-Summary button at bottom (paste into chat for Hormozi diagnosis)
 */

const DEFAULT_SLUG = "bluejays";
const SLUG_RE = /^[a-z0-9]([a-z0-9_-]{0,62}[a-z0-9])?$/i;

type Props = {
  searchParams: Promise<{ slug?: string }>;
};

export default function NumbersPage({ searchParams }: Props) {
  const [slug, setSlug] = useState<string>(DEFAULT_SLUG);
  const [slugInput, setSlugInput] = useState<string>(DEFAULT_SLUG);
  const [row, setRow] = useState<DiagnosisMetricsRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copyState, setCopyState] = useState<"idle" | "copied">("idle");

  // Hydrate slug from URL on first render (Next 16 async searchParams).
  useEffect(() => {
    let cancelled = false;
    searchParams.then((sp) => {
      if (cancelled) return;
      const fromUrl = sp.slug?.trim().toLowerCase();
      if (fromUrl && SLUG_RE.test(fromUrl)) {
        setSlug(fromUrl);
        setSlugInput(fromUrl);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  // Load row when slug changes
  useEffect(() => {
    if (!SLUG_RE.test(slug)) return;
    setLoading(true);
    setError(null);
    fetch(`/api/dashboard/diagnosis-metrics?clientSlug=${encodeURIComponent(slug)}`)
      .then((r) => r.json())
      .then((j) => {
        if (!j.ok) setError(j.error ?? "Failed to load");
        else setRow(j.row ?? null);
      })
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false));
  }, [slug]);

  async function handleSave(
    state: Parameters<NonNullable<React.ComponentProps<typeof MetricsPanel>["onSave"]>>[0],
  ) {
    const r = await fetch("/api/dashboard/diagnosis-metrics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "save",
        client_slug: slug,
        industry: state.industry,
        ...state.inputs,
        estimates: state.estimates,
        qualifier_answers: state.qualifier_answers,
      }),
    });
    const j = await r.json();
    if (!j.ok) throw new Error(j.error || "Save failed");
    setRow(j.row);
  }

  function switchSlug() {
    const cleaned = slugInput.trim().toLowerCase();
    if (!SLUG_RE.test(cleaned)) {
      setError("Slug must be 2-64 chars, letters/digits/dashes/underscores only");
      return;
    }
    setError(null);
    setSlug(cleaned);
    // Reflect in URL without full reload
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("slug", cleaned);
      window.history.replaceState({}, "", url.toString());
    }
  }

  function copyDiagnosticSummary() {
    if (!row) return;
    const md = buildDiagnosticMarkdown(slug, row);
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(md).then(() => {
        setCopyState("copied");
        setTimeout(() => setCopyState("idle"), 2000);
      });
    }
  }

  const hasData =
    row &&
    (row.monthly_revenue ||
      row.active_customers ||
      row.average_order_value ||
      row.gross_margin_pct ||
      row.churn_monthly_pct ||
      row.customer_acquisition_cost);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <header className="mb-8">
          <p className="text-xs uppercase tracking-wider text-emerald-400 font-semibold mb-2">
            BlueJays internal · business diagnostic
          </p>
          <h1 className="text-3xl font-bold mb-2">Business Numbers</h1>
          <p className="text-slate-400 text-sm max-w-2xl">
            Enter the minimum info you have, and the tool will help you work
            backwards to figure out the rest. Numbers save automatically.
            Switch the slug to diagnose a different business — each slug keeps
            its own saved state.
          </p>
        </header>

        {/* Slug picker */}
        <section className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 mb-6">
          <label className="block text-xs uppercase tracking-wider text-slate-400 mb-2">
            Business slug (which business are you diagnosing?)
          </label>
          <div className="flex gap-2 items-stretch">
            <input
              type="text"
              value={slugInput}
              onChange={(e) => setSlugInput(e.target.value.toLowerCase())}
              onKeyDown={(e) => {
                if (e.key === "Enter") switchSlug();
              }}
              placeholder="bluejays"
              className="flex-1 rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm font-mono"
            />
            <button
              type="button"
              onClick={switchSlug}
              disabled={slugInput.trim().toLowerCase() === slug}
              className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-700 disabled:cursor-not-allowed text-slate-950 text-sm font-semibold transition-colors"
            >
              {slugInput.trim().toLowerCase() === slug ? "Loaded" : "Switch"}
            </button>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Active: <span className="text-emerald-400 font-mono">{slug}</span>
            {" · "}
            <span className="text-slate-400">
              {hasData ? "saved data found" : "empty — start fresh"}
            </span>
          </p>
        </section>

        {error && (
          <div className="mb-4 rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
            {error}
          </div>
        )}

        {/* Metrics intake */}
        <section className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 mb-6">
          {loading ? (
            <p className="text-sm text-slate-500">Loading…</p>
          ) : (
            <MetricsPanel
              key={slug}
              initialInputs={
                row
                  ? {
                      monthly_revenue: row.monthly_revenue,
                      active_customers: row.active_customers,
                      average_order_value: row.average_order_value,
                      gross_margin_pct: row.gross_margin_pct,
                      churn_monthly_pct: row.churn_monthly_pct,
                      customer_acquisition_cost: row.customer_acquisition_cost,
                    }
                  : undefined
              }
              initialIndustry={row?.industry ?? null}
              initialEstimates={row?.estimates ?? {}}
              initialQualifierAnswers={row?.qualifier_answers ?? {}}
              onSave={handleSave}
              showIndustryPicker={true}
            />
          )}
        </section>

        {/* Copy diagnostic summary */}
        <section className="rounded-2xl border border-sky-500/30 bg-sky-500/5 p-6">
          <p className="text-xs uppercase tracking-wider text-sky-400 font-semibold mb-2">
            Send to Hormozi diagnosis
          </p>
          <p className="text-sm text-slate-300 mb-4">
            One-click copy a clean markdown summary of all current values
            (entered + derived + estimate sources) ready to paste into the
            Claude chat for a Hormozi-framework diagnosis using the 114-chunk
            KB. Re-run anytime as numbers improve.
          </p>
          <button
            type="button"
            onClick={copyDiagnosticSummary}
            disabled={!hasData}
            className="px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 disabled:bg-slate-700 disabled:cursor-not-allowed text-slate-950 text-sm font-semibold transition-colors"
          >
            {copyState === "copied"
              ? "✓ Copied to clipboard"
              : hasData
                ? "Copy diagnostic summary →"
                : "Enter some metrics first"}
          </button>
          {hasData && (
            <details className="mt-4">
              <summary className="text-xs text-slate-400 cursor-pointer hover:text-slate-200">
                Preview what gets copied
              </summary>
              <pre className="mt-2 p-3 rounded bg-slate-950 border border-white/5 text-[11px] text-slate-300 whitespace-pre-wrap overflow-x-auto">
                {buildDiagnosticMarkdown(slug, row!)}
              </pre>
            </details>
          )}
        </section>
      </div>
    </main>
  );
}

// ─── Helpers ───────────────────────────────────────────────────────────

function buildDiagnosticMarkdown(slug: string, row: DiagnosisMetricsRow): string {
  const lines: string[] = [];
  lines.push(`## Business Numbers — ${slug}`);
  lines.push("");
  lines.push(`**Industry:** ${row.industry ?? "(not set)"}`);
  lines.push(`**Last saved:** ${row.updated_at ?? row.created_at ?? "(unknown)"}`);
  lines.push("");
  lines.push("### Core metrics");
  lines.push(`- Monthly revenue: ${fmt(row.monthly_revenue, "$")}`);
  lines.push(`- Active customers: ${fmt(row.active_customers, "", 0)}`);
  lines.push(`- AOV: ${fmt(row.average_order_value, "$")}`);
  lines.push(`- Gross margin: ${fmt(row.gross_margin_pct, "", 1)}${row.gross_margin_pct != null ? "%" : ""}`);
  lines.push(`- Churn (monthly): ${fmt(row.churn_monthly_pct, "", 1)}${row.churn_monthly_pct != null ? "%" : ""}`);
  lines.push(`- CAC: ${fmt(row.customer_acquisition_cost, "$")}`);
  lines.push("");

  const d = row.derived ?? {};
  if (Object.keys(d).length > 0) {
    lines.push("### Derived (computed from above)");
    if (d.ltv != null) lines.push(`- LTV: ${fmt(d.ltv as number, "$")}`);
    if (d.ltv_cac_ratio != null)
      lines.push(`- LTV/CAC ratio: ${fmt(d.ltv_cac_ratio as number, "", 2)}:1`);
    if (d.payback_months != null)
      lines.push(`- Payback period: ${fmt(d.payback_months as number, "", 1)} months`);
    if (d.avg_lifespan_months != null)
      lines.push(`- Avg customer lifespan: ${fmt(d.avg_lifespan_months as number, "", 1)} months`);
    if (d.arpu_monthly != null)
      lines.push(`- ARPU (monthly): ${fmt(d.arpu_monthly as number, "$")}`);
    if (d.health_score) lines.push(`- Health flag: **${d.health_score}**`);
    lines.push("");
  }

  const est = row.estimates ?? {};
  const flaggedEntries = Object.entries(est).filter(
    ([, src]) => src && src !== "user_entered",
  );
  if (flaggedEntries.length > 0) {
    lines.push("### Estimate sources (verify before locking strategy)");
    for (const [key, src] of flaggedEntries) {
      lines.push(`- ${key}: \`${src}\``);
    }
    lines.push("");
  }

  lines.push("---");
  lines.push("");
  lines.push(
    "Diagnose this business using the Hormozi KB. Apply the cross-case validated pattern: funnel + pricing + ad-spend are year-1 levers; affiliate / events / nurture are year-2 levers. Flag the single highest-leverage move for the next 14 days.",
  );
  return lines.join("\n");
}

function fmt(v: number | null, prefix = "", decimals = 0): string {
  if (v === null || v === undefined) return "_(not set)_";
  return `${prefix}${Number(v).toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}
