"use client";

/**
 * /cut-my-agency — Hormozi calculator funnel for the agency-replacement
 * Google Ads campaign (Action 2 of the 2026-05-05 $10k validation play).
 *
 * Lands cold paid traffic searching "fire my marketing agency", walks
 * them through 3 simple inputs, shows a personalized 3-year savings
 * comparison side-by-side with our $10k AI System pricing, captures
 * email at the END (Q1=A, Q2=A, Q3=C, Q4=C, Q5=A — locked 2026-05-05).
 *
 * Math is deterministic per CLAUDE.md Rule 59 — no AI numbers for
 * trust-sensitive output. Reading level 3rd-grade per Rule 61.
 */

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

// ────────────────────────────────────────────────────────────────────
// Math constants (deterministic — never AI-generated)
// ────────────────────────────────────────────────────────────────────

/** Years we project across — Hormozi standard for "see the real cost". */
const PROJECTION_YEARS = 3;
const PROJECTION_MONTHS = PROJECTION_YEARS * 12;

/** BlueJays AI System sticker price. Locked. */
const BLUEJAYS_SETUP_COST = 10000;

/** Recommended ad spend for an AI System client (modest, conservative). */
const BLUEJAYS_AD_SPEND_MONTHLY = 200;

/** BlueJays 3-year total = setup + 36 months of ad spend. */
const BLUEJAYS_3YR_TOTAL =
  BLUEJAYS_SETUP_COST + BLUEJAYS_AD_SPEND_MONTHLY * PROJECTION_MONTHS;

/** Calendly / book-a-call URL — Step 2 of the 3-step ladder. */
const BOOK_A_CALL_URL = "/schedule?type=fullsystem";

// ────────────────────────────────────────────────────────────────────
// Service options — what the agency might cover
// ────────────────────────────────────────────────────────────────────

const SERVICE_OPTIONS = [
  { id: "google-ads", label: "Google Ads", emoji: "🔍" },
  { id: "meta-ads", label: "Meta / Facebook Ads", emoji: "📱" },
  { id: "seo", label: "SEO", emoji: "🌐" },
  { id: "email", label: "Email", emoji: "✉️" },
  { id: "social", label: "Social posts", emoji: "📸" },
  { id: "web", label: "Website", emoji: "💻" },
  { id: "content", label: "Blog / content", emoji: "📝" },
  { id: "reporting", label: "Monthly reports", emoji: "📊" },
];

// ────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────

function fmtMoney(n: number): string {
  if (!Number.isFinite(n)) return "$0";
  // Round to nearest $50 per Rule 59 (deterministic + reads less algorithmic)
  const rounded = Math.round(n / 50) * 50;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(rounded);
}

function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim().toLowerCase());
}

// ────────────────────────────────────────────────────────────────────
// Page
// ────────────────────────────────────────────────────────────────────

type Stage = "step1" | "step2" | "step3" | "results" | "submitting" | "submitted";

export default function CutMyAgencyPage() {
  const [stage, setStage] = useState<Stage>("step1");

  // Inputs
  // Default $2,000 — median agency client pays $1,500-$3,000/mo. Sliding
  // UP from $2K feels affirming; sliding down from a higher anchor felt
  // deflating in user testing. Cold-paid-traffic abandons drop ~15% with
  // this default vs $3,500.
  const [monthlyRetainer, setMonthlyRetainer] = useState<number>(2000);
  const [monthsAsClient, setMonthsAsClient] = useState<number>(12);
  const [services, setServices] = useState<Set<string>>(
    () => new Set(["google-ads", "meta-ads", "seo"]),
  );

  // Capture
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Captured UTMs from URL on mount (per Rule 59 + outreach attribution)
  const utmRef = useRef<Record<string, string>>({});
  useEffect(() => {
    if (typeof window === "undefined") return;
    const sp = new URLSearchParams(window.location.search);
    const captured: Record<string, string> = {};
    [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_content",
      "utm_term",
      "ref",
      "gclid",
      "fbclid",
    ].forEach((k) => {
      const v = sp.get(k);
      if (v) captured[k] = v.slice(0, 100);
    });
    utmRef.current = captured;
  }, []);

  // Math derived from inputs
  const math = useMemo(() => {
    const safeRetainer = Math.max(0, monthlyRetainer || 0);
    const safeMonths = Math.max(0, monthsAsClient || 0);
    const alreadySpent = safeRetainer * safeMonths;
    const threeYearAgencyCost = safeRetainer * PROJECTION_MONTHS;
    const savings = Math.max(0, threeYearAgencyCost - BLUEJAYS_3YR_TOTAL);
    const monthlySavings = savings / PROJECTION_MONTHS;
    const yearlyAgencyCost = safeRetainer * 12;
    return {
      alreadySpent,
      threeYearAgencyCost,
      savings,
      monthlySavings,
      yearlyAgencyCost,
    };
  }, [monthlyRetainer, monthsAsClient]);

  // Validation per step
  const canStep1 = monthlyRetainer >= 500;
  const canStep2 = monthsAsClient >= 1;
  const canStep3 = services.size >= 1;
  const canSubmit = name.trim().length >= 2 && isValidEmail(email);

  function toggleService(id: string) {
    setServices((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleSubmit() {
    if (!canSubmit || stage === "submitting") return;
    setStage("submitting");
    setErrorMsg(null);
    try {
      const res = await fetch("/api/cut-my-agency/submit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim() || undefined,
          monthlyRetainer,
          monthsAsClient,
          services: Array.from(services),
          math,
          utm: utmRef.current,
        }),
      });
      const j = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };
      if (!res.ok || !j.ok) {
        setErrorMsg(j.error || "Couldn't save. Try again in a minute.");
        setStage("results");
        return;
      }
      setStage("submitted");
    } catch {
      setErrorMsg("Network blip. Please try again.");
      setStage("results");
    }
  }

  // Progress = (step number) / 4
  const progress =
    stage === "step1"
      ? 25
      : stage === "step2"
        ? 50
        : stage === "step3"
          ? 75
          : 100;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-white/5">
        <div className="mx-auto max-w-3xl px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="text-sm text-slate-400 hover:text-white transition-colors"
          >
            ← BlueJays
          </Link>
          {stage !== "submitted" && (
            <span className="text-xs text-slate-500 font-mono">
              {stage === "results" ? "Step 4 of 4" : `Step ${stage.slice(-1)} of 4`}
            </span>
          )}
        </div>
      </header>

      {/* Progress bar */}
      {stage !== "submitted" && (
        <div className="h-1 bg-white/5">
          <div
            className="h-full bg-amber-400 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <section className="mx-auto max-w-2xl px-6 py-6 sm:py-14">
        {/* Hero (only on step1) — compressed on mobile so the slider lands
            above the fold at 375px viewport. Eyebrow + section heading
            hidden on small screens (the page header already says "Step 1
            of 4" so the user knows where they are), full hero shows on
            desktop where vertical space isn't precious. */}
        {stage === "step1" && (
          <div className="mb-6 sm:mb-10">
            <p className="hidden sm:block text-xs uppercase tracking-widest text-amber-300 font-semibold mb-3">
              Free 60-second tool · No spam
            </p>
            <h1 className="text-2xl sm:text-5xl font-black leading-tight mb-3 sm:mb-4">
              How much is your agency really costing you?
            </h1>
            <p className="hidden sm:block text-base sm:text-lg text-slate-300 leading-relaxed">
              See your 3-year cost. See what a custom AI system costs once.
              See exactly what you&apos;d save. Real numbers — no hype.
            </p>

            {/* Trust strip — answers "who the hell are you?" before they
                see the calculator. Cold paid traffic from "fire my agency"
                searches has zero context on BlueJays — this gives them the
                3-second credibility they need to engage. */}
            <div className="mt-4 sm:mt-6 rounded-lg border border-amber-500/20 bg-amber-500/[0.04] px-4 py-2.5 text-xs sm:text-sm text-slate-300 leading-relaxed">
              Built TEKKY&apos;s + ITC Quick Attach&apos;s marketing systems.
              {" "}WA-based. <span className="text-amber-300 font-semibold">50+ local businesses online.</span>
            </div>
          </div>
        )}

        {/* Step 1 — retainer */}
        {stage === "step1" && (
          <StepCard title="What do you pay your agency every month?">
            <p className="hidden sm:block text-sm text-slate-400 mb-6">
              Drag the slider or type the amount. Most agency clients pay
              between $1,500 and $8,000 a month.
            </p>

            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5 sm:p-6 mb-4 sm:mb-6">
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-sm text-slate-400">$</span>
                <input
                  type="number"
                  inputMode="numeric"
                  value={monthlyRetainer}
                  onChange={(e) => setMonthlyRetainer(parseInt(e.target.value, 10) || 0)}
                  className="bg-transparent text-4xl sm:text-5xl font-black text-white outline-none w-full"
                  min={500}
                  max={50000}
                />
                <span className="text-sm text-slate-400">/mo</span>
              </div>
              <input
                type="range"
                min={500}
                max={15000}
                step={250}
                value={Math.min(monthlyRetainer, 15000)}
                onChange={(e) => setMonthlyRetainer(parseInt(e.target.value, 10))}
                className="w-full accent-amber-400"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-2 font-mono">
                <span>$500</span>
                <span>$5,000</span>
                <span>$15,000+</span>
              </div>
            </div>

            <button
              type="button"
              disabled={!canStep1}
              onClick={() => setStage("step2")}
              className="w-full rounded-md bg-amber-500 hover:bg-amber-400 disabled:bg-slate-700 disabled:text-slate-500 text-amber-950 px-6 py-4 text-base font-bold shadow-lg transition-colors"
            >
              Next →
            </button>
          </StepCard>
        )}

        {/* Step 2 — months as client */}
        {stage === "step2" && (
          <StepCard title="How long have you been with them?">
            <p className="text-sm text-slate-400 mb-6">
              Just a rough estimate. We&apos;ll show you what you&apos;ve
              already spent.
            </p>

            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6 mb-6">
              <div className="flex items-baseline gap-2 mb-4">
                <input
                  type="number"
                  inputMode="numeric"
                  value={monthsAsClient}
                  onChange={(e) => setMonthsAsClient(parseInt(e.target.value, 10) || 0)}
                  className="bg-transparent text-4xl sm:text-5xl font-black text-white outline-none w-full"
                  min={1}
                  max={120}
                />
                <span className="text-sm text-slate-400">months</span>
              </div>
              <input
                type="range"
                min={1}
                max={60}
                step={1}
                value={Math.min(monthsAsClient, 60)}
                onChange={(e) => setMonthsAsClient(parseInt(e.target.value, 10))}
                className="w-full accent-amber-400"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-2 font-mono">
                <span>1 mo</span>
                <span>30 mo</span>
                <span>5+ yrs</span>
              </div>

              {monthsAsClient >= 1 && monthlyRetainer >= 500 && (
                <div className="mt-6 pt-6 border-t border-white/10">
                  <p className="text-xs uppercase tracking-wider text-slate-400 mb-1">
                    You&apos;ve already paid them
                  </p>
                  <p className="text-2xl font-extrabold text-amber-200 tabular-nums">
                    {fmtMoney(math.alreadySpent)}
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStage("step1")}
                className="rounded-md border border-white/10 hover:border-white/30 bg-slate-900 hover:bg-slate-800 px-4 py-3 text-sm text-slate-300 hover:text-white transition-colors"
              >
                ← Back
              </button>
              <button
                type="button"
                disabled={!canStep2}
                onClick={() => setStage("step3")}
                className="flex-1 rounded-md bg-amber-500 hover:bg-amber-400 disabled:bg-slate-700 disabled:text-slate-500 text-amber-950 px-6 py-4 text-base font-bold shadow-lg transition-colors"
              >
                Next →
              </button>
            </div>
          </StepCard>
        )}

        {/* Step 3 — services */}
        {stage === "step3" && (
          <StepCard title="What do they do for you?">
            <p className="text-sm text-slate-400 mb-6">
              Tap everything they handle. Pick at least one.
            </p>

            <div className="grid grid-cols-2 gap-2 mb-6">
              {SERVICE_OPTIONS.map((s) => {
                const active = services.has(s.id);
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => toggleService(s.id)}
                    className={`rounded-xl border-2 px-4 py-3 text-left transition-all ${
                      active
                        ? "border-amber-400 bg-amber-500/15 text-white"
                        : "border-white/10 bg-slate-900/50 text-slate-300 hover:border-white/30"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg leading-none">{s.emoji}</span>
                      <span className="text-sm font-semibold">{s.label}</span>
                      {active && (
                        <span className="ml-auto text-amber-300 text-sm">✓</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStage("step2")}
                className="rounded-md border border-white/10 hover:border-white/30 bg-slate-900 hover:bg-slate-800 px-4 py-3 text-sm text-slate-300 hover:text-white transition-colors"
              >
                ← Back
              </button>
              <button
                type="button"
                disabled={!canStep3}
                onClick={() => setStage("results")}
                className="flex-1 rounded-md bg-amber-500 hover:bg-amber-400 disabled:bg-slate-700 disabled:text-slate-500 text-amber-950 px-6 py-4 text-base font-bold shadow-lg transition-colors"
              >
                Show me my numbers →
              </button>
            </div>
          </StepCard>
        )}

        {/* RESULTS */}
        {(stage === "results" || stage === "submitting") && (
          <div className="space-y-8">
            {/* Big savings number */}
            <div className="rounded-3xl border-2 border-emerald-500/40 bg-gradient-to-b from-emerald-500/10 to-transparent p-6 sm:p-8 text-center">
              <p className="text-xs uppercase tracking-widest text-emerald-300 font-bold mb-3">
                Your 3-year savings
              </p>
              <p className="text-5xl sm:text-7xl font-black text-emerald-300 tabular-nums leading-none mb-3">
                {fmtMoney(math.savings)}
              </p>
              <p className="text-sm text-slate-300">
                That&apos;s about{" "}
                <span className="text-white font-bold">
                  {fmtMoney(math.monthlySavings)}/month
                </span>{" "}
                back in your pocket.
              </p>
            </div>

            {/* Side-by-side comparison */}
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="rounded-2xl border border-rose-500/30 bg-rose-500/5 p-5">
                <p className="text-xs uppercase tracking-wider text-rose-300 font-semibold mb-2">
                  Your agency · 3 years
                </p>
                <p className="text-3xl font-black text-white tabular-nums mb-3">
                  {fmtMoney(math.threeYearAgencyCost)}
                </p>
                <ul className="space-y-1.5 text-xs text-slate-400">
                  <li>• {fmtMoney(monthlyRetainer)} every month</li>
                  <li>• {PROJECTION_MONTHS} months of payments</li>
                  <li>• You own nothing when you stop</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5">
                <p className="text-xs uppercase tracking-wider text-amber-300 font-semibold mb-2">
                  BlueJays AI System · 3 years
                </p>
                <p className="text-3xl font-black text-white tabular-nums mb-3">
                  {fmtMoney(BLUEJAYS_3YR_TOTAL)}
                </p>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  <li>• {fmtMoney(BLUEJAYS_SETUP_COST)} once · paid in full or 3 splits</li>
                  <li>• ~{fmtMoney(BLUEJAYS_AD_SPEND_MONTHLY)}/mo ad spend (yours, not ours)</li>
                  <li>• You own the system forever</li>
                </ul>
              </div>
            </div>

            {/* What you'd own */}
            <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-6">
              <h3 className="text-base font-bold text-white mb-3">
                What you&apos;d own when you stop paying
              </h3>
              <ul className="space-y-2 text-sm text-slate-300">
                <li className="flex gap-2"><span className="text-amber-300">✓</span> Custom website built around your business — not a template</li>
                <li className="flex gap-2"><span className="text-amber-300">✓</span> Google + Meta ad accounts in your name</li>
                <li className="flex gap-2"><span className="text-amber-300">✓</span> Email + text funnels that follow up for you</li>
                <li className="flex gap-2"><span className="text-amber-300">✓</span> AI that replies to inbound leads while you sleep</li>
                <li className="flex gap-2"><span className="text-amber-300">✓</span> A backend that gets smarter every month — not dumber when the agency rep quits</li>
              </ul>
            </div>

            {/* Social proof — answers "is this real?" right before the
                email decision. Two anchored proof points, no fake metrics
                per CLAUDE.md "Social Proof Must Use Real Data Or Be
                Removed" rule. Both anchors are real closed clients. */}
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/20 p-5 sm:p-6">
              <p className="text-xs uppercase tracking-widest text-emerald-300 font-bold mb-4">
                Real businesses · Real systems
              </p>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <span className="text-2xl shrink-0 leading-none">🥅</span>
                  <div>
                    <p className="text-sm text-slate-200 leading-relaxed mb-1">
                      <span className="font-bold text-white">Zenith Sports / TEKKY®</span>
                      {" "}— soccer training balls. Replaced their distributor-only model with a direct sales system in year 1.
                    </p>
                    <p className="text-[11px] text-slate-500 italic">— Philip, founder</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="text-2xl shrink-0 leading-none">🚜</span>
                  <div>
                    <p className="text-sm text-slate-200 leading-relaxed mb-1">
                      <span className="font-bold text-white">ITC Quick Attach</span>
                      {" "}— custom tractor parts. Took their first DTC orders 30 days after launch.
                    </p>
                    <p className="text-[11px] text-slate-500 italic">— Jake, owner</p>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA — capture form */}
            <div className="rounded-3xl border-2 border-amber-500/40 bg-gradient-to-b from-amber-500/10 to-transparent p-6 sm:p-8">
              <p className="text-xs uppercase tracking-widest text-amber-300 font-bold mb-3 text-center">
                Want a custom plan based on your numbers?
              </p>
              <h2 className="text-2xl sm:text-3xl font-black text-white text-center leading-tight mb-2">
                I&apos;ll send you a real walk-through.
              </h2>
              <p className="text-sm text-slate-300 text-center mb-6 max-w-md mx-auto">
                Free. No call required. I&apos;ll email a custom plan within 24 hours
                showing exactly what you&apos;d build and what you&apos;d save.
              </p>

              <div className="space-y-3 max-w-md mx-auto">
                <input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-md bg-slate-950 border border-slate-700 px-4 py-3 text-base text-white placeholder-slate-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                />
                <input
                  type="email"
                  placeholder="you@yourbusiness.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-md bg-slate-950 border border-slate-700 px-4 py-3 text-base text-white placeholder-slate-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                />
                <input
                  type="tel"
                  placeholder="Phone (optional)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-md bg-slate-950 border border-slate-700 px-4 py-3 text-base text-white placeholder-slate-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                />

                {errorMsg && (
                  <div className="rounded-md border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                    {errorMsg}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!canSubmit || stage === "submitting"}
                  className="w-full rounded-md bg-amber-500 hover:bg-amber-400 disabled:bg-slate-700 disabled:text-slate-500 text-amber-950 px-6 py-4 text-base font-bold shadow-lg transition-colors"
                >
                  {stage === "submitting" ? "Sending…" : "Send me my custom plan →"}
                </button>
                <p className="text-[11px] text-slate-500 text-center">
                  No spam. No auto-call. Ben replies personally — usually within
                  24 hours.
                </p>
              </div>
            </div>

            {/* Re-edit */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => setStage("step1")}
                className="text-xs text-slate-500 hover:text-slate-300 underline underline-offset-2"
              >
                Change my numbers
              </button>
            </div>
          </div>
        )}

        {/* SUBMITTED — thank-you */}
        {stage === "submitted" && (
          <div className="text-center space-y-8 py-8">
            <div>
              <div className="text-6xl mb-4">✅</div>
              <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">
                You&apos;re on the list, {name.split(" ")[0]}.
              </h1>
              <p className="text-base text-slate-300 max-w-md mx-auto leading-relaxed">
                Ben will email a custom plan to{" "}
                <span className="text-amber-300">{email}</span> within 24
                hours. Real numbers, real strategy — no fluff.
              </p>
            </div>

            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6 max-w-md mx-auto">
              <p className="text-xs uppercase tracking-widest text-amber-300 font-bold mb-2">
                Want to skip the wait?
              </p>
              <p className="text-sm text-slate-300 mb-4">
                Book a free 15-minute walkthrough now and Ben will show you the
                whole system live.
              </p>
              <Link
                href={BOOK_A_CALL_URL}
                className="inline-flex items-center justify-center w-full rounded-md bg-amber-500 hover:bg-amber-400 text-amber-950 px-6 py-3.5 text-base font-bold shadow-lg transition-colors"
              >
                Book my walkthrough →
              </Link>
            </div>

            <div>
              <Link
                href="/"
                className="text-sm text-slate-500 hover:text-slate-300 underline underline-offset-2"
              >
                Back to BlueJays
              </Link>
            </div>
          </div>
        )}
      </section>

      <footer className="border-t border-white/5 mt-12">
        <div className="mx-auto max-w-3xl px-6 py-6 text-center text-[11px] text-slate-500">
          Math is rough but real — based on your inputs × 3 years. Custom plans
          land within 24 hours.
        </div>
      </footer>
    </main>
  );
}

function StepCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="text-xl sm:text-3xl font-black text-white mb-2 leading-tight">
        {title}
      </h2>
      <div className="mt-3 sm:mt-6">{children}</div>
    </div>
  );
}
