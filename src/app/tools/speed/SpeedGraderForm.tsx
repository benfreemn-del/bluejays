"use client";

import { useState } from "react";
import Link from "next/link";

type SpeedResult = {
  ok: true;
  url: string;
  strategy: "mobile" | "desktop";
  scores: {
    performance: number | null;
    accessibility: number | null;
    bestPractices: number | null;
    seo: number | null;
  };
  metrics: Record<
    string,
    { display: string | null; numeric: number | null; score: number | null } | null
  >;
  opportunities: { key: string; display: string | null; score: number | null }[];
};

type FormState = "idle" | "checking" | "result" | "error";

const METRIC_LABELS: Record<string, { label: string; tip: string }> = {
  lcp: { label: "Largest Contentful Paint", tip: "Time until the biggest image / heading appears. Want < 2.5s." },
  cls: { label: "Cumulative Layout Shift", tip: "How much things jump around as the page loads. Want < 0.1." },
  tbt: { label: "Total Blocking Time", tip: "How long the page is unresponsive while loading. Want < 200ms." },
  fcp: { label: "First Contentful Paint", tip: "Time until ANYTHING shows on screen. Want < 1.8s." },
  speedIndex: { label: "Speed Index", tip: "Overall how fast content fills in. Want < 3.4s." },
  tti: { label: "Time to Interactive", tip: "When the page is fully usable. Want < 3.8s." },
};

export default function SpeedGraderForm() {
  const [state, setState] = useState<FormState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SpeedResult | null>(null);
  const [strategy, setStrategy] = useState<"mobile" | "desktop">("mobile");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state === "checking") return;
    setState("checking");
    setError(null);

    const fd = new FormData(e.currentTarget);
    const url = String(fd.get("url") || "").trim();
    if (!url) {
      setError("Enter a URL.");
      setState("error");
      return;
    }

    try {
      const params = new URLSearchParams({ url, strategy });
      const res = await fetch(`/api/tools/speed?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Couldn't run the test.");
        setState("error");
        return;
      }
      setResult(data);
      setState("result");
    } catch {
      setError("Network error. Try again.");
      setState("error");
    }
  }

  if (state === "result" && result) {
    return <ResultCard result={result} onReset={() => setState("idle")} strategy={strategy} setStrategy={setStrategy} />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          name="url"
          required
          autoFocus
          placeholder="yourbusiness.com"
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="url"
          className="flex-1 rounded-md bg-slate-950 border border-slate-700 px-4 py-3 text-base text-white placeholder-slate-600 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
        />
        <button
          type="submit"
          disabled={state === "checking"}
          className="rounded-md bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 disabled:opacity-50 disabled:cursor-wait px-6 py-3 text-base font-bold text-white shadow-lg transition-all"
        >
          {state === "checking" ? "Checking…" : "Grade my site →"}
        </button>
      </div>

      <div className="flex items-center gap-2 text-xs">
        <span className="text-slate-500">Test:</span>
        <button
          type="button"
          onClick={() => setStrategy("mobile")}
          className={`rounded-full px-3 py-1 font-semibold transition-colors ${
            strategy === "mobile"
              ? "bg-sky-500/20 border border-sky-500/40 text-sky-200"
              : "border border-white/10 text-slate-400 hover:text-white"
          }`}
        >
          📱 Mobile (recommended)
        </button>
        <button
          type="button"
          onClick={() => setStrategy("desktop")}
          className={`rounded-full px-3 py-1 font-semibold transition-colors ${
            strategy === "desktop"
              ? "bg-sky-500/20 border border-sky-500/40 text-sky-200"
              : "border border-white/10 text-slate-400 hover:text-white"
          }`}
        >
          🖥️ Desktop
        </button>
      </div>

      {state === "checking" && (
        <p className="text-xs text-slate-500 leading-relaxed">
          Running real Google PageSpeed audit — this takes 15–45 seconds.
          Don&apos;t close the tab.
        </p>
      )}
      {error && (
        <div className="rounded-md border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      )}
      <p className="text-[10px] text-slate-500">
        Powered by Google PageSpeed Insights. Free, no signup, rate-limited
        to 10 checks per IP per hour.
      </p>
    </form>
  );
}

function ResultCard({
  result,
  onReset,
  strategy,
  setStrategy,
}: {
  result: SpeedResult;
  onReset: () => void;
  strategy: "mobile" | "desktop";
  setStrategy: (s: "mobile" | "desktop") => void;
}) {
  const perf = result.scores.performance;
  const grade = perf == null ? "—" : perf >= 90 ? "A" : perf >= 80 ? "B" : perf >= 70 ? "C" : perf >= 50 ? "D" : "F";
  const verdict =
    perf == null
      ? "Couldn't grade — try again."
      : perf >= 90
        ? "Excellent — your site is faster than 90% of the internet."
        : perf >= 80
          ? "Solid. A couple of small fixes would push it to top-tier."
          : perf >= 70
            ? "Acceptable, but mobile users are bouncing. Worth fixing."
            : perf >= 50
              ? "Slow. You're losing conversions to load time."
              : "Critically slow. Fix this before anything else.";
  const tone =
    perf == null
      ? "slate"
      : perf >= 80
        ? "emerald"
        : perf >= 60
          ? "amber"
          : "rose";
  const toneCls =
    tone === "emerald"
      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
      : tone === "amber"
        ? "border-amber-500/40 bg-amber-500/10 text-amber-200"
        : tone === "rose"
          ? "border-rose-500/40 bg-rose-500/10 text-rose-200"
          : "border-white/10 bg-slate-900/50 text-slate-300";

  return (
    <div className="space-y-6">
      {/* Top-line grade */}
      <div className={`rounded-2xl border-2 ${toneCls} p-6 md:p-8`}>
        <p className="text-xs uppercase tracking-wider opacity-70 mb-2">
          Performance score · {strategy === "mobile" ? "📱 mobile" : "🖥️ desktop"}
        </p>
        <div className="flex items-baseline gap-3 mb-3">
          <span className="text-6xl md:text-7xl font-black tabular-nums leading-none">
            {perf ?? "—"}
          </span>
          <span className="text-3xl font-bold opacity-60">/100</span>
          <span className="ml-auto text-5xl font-black opacity-80">{grade}</span>
        </div>
        <p className="text-base md:text-lg leading-relaxed mb-4">{verdict}</p>
        <p className="text-xs opacity-60 break-all">{result.url}</p>
      </div>

      {/* Other category scores */}
      <div className="grid grid-cols-3 gap-3">
        <SubScore label="Accessibility" score={result.scores.accessibility} />
        <SubScore label="Best Practices" score={result.scores.bestPractices} />
        <SubScore label="SEO" score={result.scores.seo} />
      </div>

      {/* Core Web Vitals */}
      <div className="rounded-xl border border-white/10 bg-slate-900/40 p-5">
        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">
          Core Web Vitals
        </h3>
        <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
          {Object.entries(METRIC_LABELS).map(([key, info]) => {
            const m = result.metrics[key];
            if (!m || !m.display) return null;
            const score = m.score ?? null;
            const cls =
              score == null
                ? "text-slate-300"
                : score >= 0.9
                  ? "text-emerald-300"
                  : score >= 0.5
                    ? "text-amber-300"
                    : "text-rose-300";
            return (
              <div key={key} className="flex items-baseline justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-white text-sm leading-tight">
                    {info.label}
                  </p>
                  <p className="text-xs text-slate-500 leading-snug">{info.tip}</p>
                </div>
                <span className={`shrink-0 font-mono font-bold tabular-nums ${cls}`}>
                  {m.display}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top opportunities */}
      {result.opportunities.length > 0 && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
          <h3 className="text-sm font-bold text-amber-300 uppercase tracking-wider mb-3">
            Top issues to fix
          </h3>
          <ul className="space-y-2">
            {result.opportunities.map((o) => (
              <li key={o.key} className="flex items-start gap-3 text-sm">
                <span className="shrink-0 mt-1 w-2 h-2 rounded-full bg-amber-400" />
                <span className="text-slate-200">
                  <span className="font-mono text-xs text-slate-500">
                    {o.key}
                  </span>{" "}
                  — {o.display}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Soft CTA — only push the audit if score is bad */}
      <div className="rounded-2xl border border-sky-500/30 bg-gradient-to-br from-sky-500/[0.06] to-blue-600/[0.06] p-6 md:p-8 text-center">
        <h3 className="text-xl md:text-2xl font-extrabold text-white mb-3">
          {perf != null && perf < 70
            ? "Speed is just one piece. Want the full picture?"
            : "Speed looks good. What about the rest of the site?"}
        </h3>
        <p className="text-slate-300 mb-6 max-w-xl mx-auto leading-relaxed">
          Our full audit scores design, copy, trust signals, mobile UX,
          local SEO, and money-leak math — the things that actually decide
          whether visitors call you or bounce. Free, 60 seconds.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/audit"
            className="inline-flex items-center justify-center rounded-md bg-amber-500 hover:bg-amber-400 text-amber-950 px-6 py-3 text-base font-bold transition-colors"
          >
            Run the full audit →
          </Link>
          <button
            onClick={() => {
              setStrategy(strategy === "mobile" ? "desktop" : "mobile");
              onReset();
            }}
            className="inline-flex items-center justify-center rounded-md border border-white/10 hover:border-white/30 bg-slate-900 hover:bg-slate-800 px-6 py-3 text-sm text-slate-300 hover:text-white transition-colors"
          >
            Test {strategy === "mobile" ? "desktop" : "mobile"} instead
          </button>
        </div>
      </div>

      <button
        onClick={onReset}
        className="text-xs text-slate-500 hover:text-slate-300 underline underline-offset-4"
      >
        ← Test another URL
      </button>
    </div>
  );
}

function SubScore({ label, score }: { label: string; score: number | null }) {
  const cls =
    score == null
      ? "text-slate-300"
      : score >= 90
        ? "text-emerald-300"
        : score >= 70
          ? "text-amber-300"
          : "text-rose-300";
  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/40 p-4 text-center">
      <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">
        {label}
      </p>
      <p className={`text-2xl font-bold tabular-nums ${cls}`}>{score ?? "—"}</p>
    </div>
  );
}
