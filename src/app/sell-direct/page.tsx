"use client";

/**
 * /sell-direct — Hormozi calculator funnel for the manufacturer-DTC
 * Google Ads campaign (Action 3 of the 2026-05-05 $10k validation play).
 *
 * Targets niche product manufacturers who sell through distributors
 * and are losing margin every month. Walks them through their numbers,
 * shows what they'd recover by going direct, captures email at the END.
 *
 * Mirrors /cut-my-agency structure (Q1-Q5 answers re-applied per Ben):
 *   Q1=A capture at the END · Q2=A show our pricing directly ·
 *   Q3=C both options post-submit · Q4=C 3 user inputs ·
 *   Q5=A open to anyone — numbers self-qualify.
 *
 * Math is deterministic per CLAUDE.md Rule 59. Reading level 3rd-grade
 * per Rule 61. Validated $10k anchor proofs are ITC Quick Attach
 * (tractor parts) + Zenith Sports / TEKKY (soccer balls).
 */

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

// ────────────────────────────────────────────────────────────────────
// Math constants (deterministic — never AI-generated)
// ────────────────────────────────────────────────────────────────────

/** Years we project across. */
const PROJECTION_YEARS = 3;
const PROJECTION_MONTHS = PROJECTION_YEARS * 12;

/** BlueJays AI System sticker price. Locked. */
const BLUEJAYS_SETUP_COST = 10000;

/** Recommended ad spend for an AI System client (modest, conservative). */
const BLUEJAYS_AD_SPEND_MONTHLY = 200;

/** BlueJays 3-year total. */
const BLUEJAYS_3YR_TOTAL =
  BLUEJAYS_SETUP_COST + BLUEJAYS_AD_SPEND_MONTHLY * PROJECTION_MONTHS;

/** What % of existing distributor volume a manufacturer can realistically
 *  capture direct in year 1. Conservative default — Ben can tune. */
const DEFAULT_CAPTURE_RATE = 0.30;

/** Calendly / book-a-call URL — Step 2 of the 3-step ladder. */
const BOOK_A_CALL_URL = "/schedule?type=fullsystem";

// ────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────

function fmtMoney(n: number): string {
  if (!Number.isFinite(n)) return "$0";
  // Round to nearest $50 (Rule 59 — reads less algorithmic)
  const rounded = Math.round(n / 50) * 50;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(rounded);
}

function fmtMoneyExact(n: number): string {
  if (!Number.isFinite(n)) return "$0";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Math.round(n));
}

function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim().toLowerCase());
}

// ────────────────────────────────────────────────────────────────────
// Page
// ────────────────────────────────────────────────────────────────────

type Stage = "step1" | "step2" | "step3" | "results" | "submitting" | "submitted";

export default function SellDirectPage() {
  const [stage, setStage] = useState<Stage>("step1");

  // Inputs
  const [avgPrice, setAvgPrice] = useState<number>(75);
  const [unitsPerMonth, setUnitsPerMonth] = useState<number>(150);
  const [distributorMargin, setDistributorMargin] = useState<number>(35); // percent
  const [captureRatePct, setCaptureRatePct] = useState<number>(
    Math.round(DEFAULT_CAPTURE_RATE * 100),
  );

  // Capture
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [productName, setProductName] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fix #5 — exit recovery. Per-email dedupe so re-blurring the same
  // email doesn't double-fire.
  const partialSavedEmailsRef = useRef<Set<string>>(new Set());

  // Captured UTMs from URL on mount
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
    const price = Math.max(0, avgPrice || 0);
    const units = Math.max(0, unitsPerMonth || 0);
    const marginPct = Math.max(0, Math.min(80, distributorMargin || 0)) / 100;
    const capturePct = Math.max(5, Math.min(80, captureRatePct || 30)) / 100;

    // Total revenue going through distributors right now (their volume × your price)
    const monthlyDistributorRevenue = price * units;
    // Margin you give up every month
    const monthlyMarginLost = monthlyDistributorRevenue * marginPct;
    const yearlyMarginLost = monthlyMarginLost * 12;
    const threeYearMarginLost = monthlyMarginLost * 36;

    // What you'd recover by going direct on capturePct of existing volume
    const monthlyRecovered = price * units * capturePct * marginPct;
    const yearlyRecovered = monthlyRecovered * 12;
    const threeYearRecovered = monthlyRecovered * 36;

    // 3-year math vs BlueJays
    const threeYearProfit = threeYearRecovered - BLUEJAYS_3YR_TOTAL;
    const paybackMonths =
      monthlyRecovered > 0
        ? BLUEJAYS_3YR_TOTAL / monthlyRecovered
        : Infinity;

    return {
      monthlyDistributorRevenue,
      monthlyMarginLost,
      yearlyMarginLost,
      threeYearMarginLost,
      monthlyRecovered,
      yearlyRecovered,
      threeYearRecovered,
      threeYearProfit,
      paybackMonths,
    };
  }, [avgPrice, unitsPerMonth, distributorMargin, captureRatePct]);

  // Validation per step
  const canStep1 = avgPrice >= 5;
  const canStep2 = unitsPerMonth >= 1;
  const canStep3 = distributorMargin >= 5;
  const canSubmit = name.trim().length >= 2 && isValidEmail(email);

  /**
   * Fix #5 — exit recovery on capture form. Fires when the email field
   * blurs with a valid email. Sends a partial save to /api/sell-direct/submit
   * with `partial: true`. Best-effort, fire-and-forget; never blocks UX.
   */
  async function handleEmailBlur() {
    const cleaned = email.trim().toLowerCase();
    if (!isValidEmail(cleaned)) return;
    if (partialSavedEmailsRef.current.has(cleaned)) return;
    if (avgPrice < 5 || unitsPerMonth < 1) return; // Need real math
    partialSavedEmailsRef.current.add(cleaned);
    try {
      await fetch("/api/sell-direct/submit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: cleaned,
          name: name.trim() || undefined,
          phone: phone.trim() || undefined,
          productName: productName.trim() || undefined,
          avgPrice,
          unitsPerMonth,
          distributorMargin,
          captureRatePct,
          math,
          utm: utmRef.current,
          partial: true,
        }),
      });
    } catch {
      // Silent.
    }
  }

  async function handleSubmit() {
    if (!canSubmit || stage === "submitting") return;
    setStage("submitting");
    setErrorMsg(null);
    try {
      const res = await fetch("/api/sell-direct/submit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim() || undefined,
          productName: productName.trim() || undefined,
          avgPrice,
          unitsPerMonth,
          distributorMargin,
          captureRatePct,
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

  // Progress
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
              {stage === "results"
                ? "Step 4 of 4"
                : `Step ${stage.slice(-1)} of 4`}
            </span>
          )}
        </div>
      </header>

      {/* Progress bar */}
      {stage !== "submitted" && (
        <div className="h-1 bg-white/5">
          <div
            className="h-full bg-emerald-400 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <section className="mx-auto max-w-2xl px-6 py-6 sm:py-14">
        {/* Hero (only on step1) — compressed on mobile so the slider lands
            above the fold. Eyebrow + subhead hidden on small screens
            (the page header already says "Step 1 of 4"). */}
        {stage === "step1" && (
          <div className="mb-6 sm:mb-10">
            <p className="hidden sm:block text-xs uppercase tracking-widest text-emerald-300 font-semibold mb-3">
              Free 60-second tool · No spam
            </p>
            <h1 className="text-2xl sm:text-5xl font-black leading-tight mb-3 sm:mb-4">
              How much margin are you losing to your distributor?
            </h1>
            <p className="hidden sm:block text-base sm:text-lg text-slate-300 leading-relaxed">
              Drop in your numbers. See what you&apos;re giving up every
              month. See exactly what you&apos;d earn back by selling direct
              — built into a real sales system you own.
            </p>
            <p className="hidden sm:block text-xs text-slate-500 mt-4">
              Built for: tractor parts · sports equipment · custom auto · hunting gear · specialty food
            </p>

            {/* Trust strip — answers "who built this?" with anchor proofs.
                Both ITC + Zenith are real closed clients in the
                manufacturer ICP — exactly the buyer this calc targets. */}
            <div className="mt-4 sm:mt-6 rounded-lg border border-emerald-500/20 bg-emerald-500/[0.04] px-4 py-2.5 text-xs sm:text-sm text-slate-300 leading-relaxed">
              Built for manufacturers like
              {" "}<span className="text-emerald-300 font-semibold">ITC Quick Attach</span>
              {" "}+ <span className="text-emerald-300 font-semibold">Zenith / TEKKY®</span>.
              {" "}WA-based. Real direct-sales systems in the wild.
            </div>
          </div>
        )}

        {/* Step 1 — average price */}
        {stage === "step1" && (
          <StepCard title="What's your average product price?">
            <p className="text-sm text-slate-400 mb-6">
              The price your end customer pays. Just a rough average — your
              hero product is fine.
            </p>

            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6 mb-6">
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-sm text-slate-400">$</span>
                <input
                  type="number"
                  inputMode="numeric"
                  value={avgPrice}
                  onChange={(e) =>
                    setAvgPrice(parseInt(e.target.value, 10) || 0)
                  }
                  className="bg-transparent text-4xl sm:text-5xl font-black text-white outline-none w-full"
                  min={5}
                  max={5000}
                />
                <span className="text-sm text-slate-400">/unit</span>
              </div>
              <input
                type="range"
                min={10}
                max={500}
                step={5}
                value={Math.min(avgPrice, 500)}
                onChange={(e) => setAvgPrice(parseInt(e.target.value, 10))}
                className="w-full accent-emerald-400"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-2 font-mono">
                <span>$10</span>
                <span>$200</span>
                <span>$500+</span>
              </div>
            </div>

            <button
              type="button"
              disabled={!canStep1}
              onClick={() => setStage("step2")}
              className="w-full rounded-md bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-700 disabled:text-slate-500 text-emerald-950 px-6 py-4 text-base font-bold shadow-lg transition-colors"
            >
              Next →
            </button>
          </StepCard>
        )}

        {/* Step 2 — units per month */}
        {stage === "step2" && (
          <StepCard title="How many units do distributors move for you each month?">
            <p className="text-sm text-slate-400 mb-6">
              Total monthly volume going through wholesalers, dealers, or
              distributors. Rough estimate is fine.
            </p>

            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6 mb-6">
              <div className="flex items-baseline gap-2 mb-4">
                <input
                  type="number"
                  inputMode="numeric"
                  value={unitsPerMonth}
                  onChange={(e) =>
                    setUnitsPerMonth(parseInt(e.target.value, 10) || 0)
                  }
                  className="bg-transparent text-4xl sm:text-5xl font-black text-white outline-none w-full"
                  min={1}
                  max={50000}
                />
                <span className="text-sm text-slate-400">units/mo</span>
              </div>
              <input
                type="range"
                min={10}
                max={2000}
                step={10}
                value={Math.min(unitsPerMonth, 2000)}
                onChange={(e) =>
                  setUnitsPerMonth(parseInt(e.target.value, 10))
                }
                className="w-full accent-emerald-400"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-2 font-mono">
                <span>10</span>
                <span>1,000</span>
                <span>2,000+</span>
              </div>

              {avgPrice >= 5 && unitsPerMonth >= 1 && (
                <div className="mt-6 pt-6 border-t border-white/10">
                  <p className="text-xs uppercase tracking-wider text-slate-400 mb-1">
                    Total monthly revenue moving through distributors
                  </p>
                  <p className="text-2xl font-extrabold text-emerald-200 tabular-nums">
                    {fmtMoney(math.monthlyDistributorRevenue)}
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
                className="flex-1 rounded-md bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-700 disabled:text-slate-500 text-emerald-950 px-6 py-4 text-base font-bold shadow-lg transition-colors"
              >
                Next →
              </button>
            </div>
          </StepCard>
        )}

        {/* Step 3 — distributor margin */}
        {stage === "step3" && (
          <StepCard title="What cut does your distributor take?">
            <p className="text-sm text-slate-400 mb-6">
              The percent off your retail price they keep. Most distributors
              run 25-50%. If unsure, leave it at 35%.
            </p>

            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6 mb-6">
              <div className="flex items-baseline gap-2 mb-4">
                <input
                  type="number"
                  inputMode="numeric"
                  value={distributorMargin}
                  onChange={(e) =>
                    setDistributorMargin(parseInt(e.target.value, 10) || 0)
                  }
                  className="bg-transparent text-4xl sm:text-5xl font-black text-white outline-none w-full"
                  min={5}
                  max={80}
                />
                <span className="text-sm text-slate-400">%</span>
              </div>
              <input
                type="range"
                min={10}
                max={60}
                step={1}
                value={Math.min(distributorMargin, 60)}
                onChange={(e) =>
                  setDistributorMargin(parseInt(e.target.value, 10))
                }
                className="w-full accent-emerald-400"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-2 font-mono">
                <span>10%</span>
                <span>35%</span>
                <span>60%+</span>
              </div>

              {avgPrice >= 5 && unitsPerMonth >= 1 && distributorMargin >= 5 && (
                <div className="mt-6 pt-6 border-t border-white/10">
                  <p className="text-xs uppercase tracking-wider text-rose-300 mb-1">
                    You&apos;re giving up
                  </p>
                  <p className="text-2xl font-extrabold text-rose-200 tabular-nums">
                    {fmtMoney(math.monthlyMarginLost)} / month
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    = {fmtMoney(math.yearlyMarginLost)} a year
                  </p>
                </div>
              )}
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
                className="flex-1 rounded-md bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-700 disabled:text-slate-500 text-emerald-950 px-6 py-4 text-base font-bold shadow-lg transition-colors"
              >
                Show me the numbers →
              </button>
            </div>
          </StepCard>
        )}

        {/* RESULTS */}
        {(stage === "results" || stage === "submitting") && (
          <div className="space-y-8">
            {/* Big recovered number */}
            <div className="rounded-3xl border-2 border-emerald-500/40 bg-gradient-to-b from-emerald-500/10 to-transparent p-6 sm:p-8 text-center">
              <p className="text-xs uppercase tracking-widest text-emerald-300 font-bold mb-3">
                What you&apos;d earn back · 3 years
              </p>
              <p className="text-5xl sm:text-7xl font-black text-emerald-300 tabular-nums leading-none mb-3">
                {fmtMoney(math.threeYearRecovered)}
              </p>
              <p className="text-sm text-slate-300">
                That&apos;s about{" "}
                <span className="text-white font-bold">
                  {fmtMoney(math.monthlyRecovered)}/month
                </span>{" "}
                back in your pocket — by selling direct on{" "}
                <span className="text-white font-bold">
                  {captureRatePct}%
                </span>{" "}
                of your current volume.
              </p>

              {/* Capture-rate slider — interactive: lets them tune */}
              <div className="mt-6 pt-6 border-t border-emerald-500/20">
                <p className="text-xs text-slate-400 mb-3 font-mono">
                  Drag to model different capture rates
                </p>
                <input
                  type="range"
                  min={10}
                  max={70}
                  step={5}
                  value={captureRatePct}
                  onChange={(e) =>
                    setCaptureRatePct(parseInt(e.target.value, 10))
                  }
                  className="w-full accent-emerald-400"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                  <span>10% (cautious)</span>
                  <span>30% (typical)</span>
                  <span>70% (aggressive)</span>
                </div>
              </div>
            </div>

            {/* Side-by-side comparison */}
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="rounded-2xl border border-rose-500/30 bg-rose-500/5 p-5">
                <p className="text-xs uppercase tracking-wider text-rose-300 font-semibold mb-2">
                  Stay with distributors · 3 years
                </p>
                <p className="text-3xl font-black text-white tabular-nums mb-3">
                  {fmtMoney(math.threeYearMarginLost)}
                </p>
                <ul className="space-y-1.5 text-xs text-slate-400">
                  <li>• Margin given up every month</li>
                  <li>• {distributorMargin}% off every unit · forever</li>
                  <li>• You don&apos;t own the customer relationship</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5">
                <p className="text-xs uppercase tracking-wider text-emerald-300 font-semibold mb-2">
                  BlueJays AI System · 3 years
                </p>
                <p className="text-3xl font-black text-white tabular-nums mb-3">
                  {fmtMoney(BLUEJAYS_3YR_TOTAL)}
                </p>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  <li>
                    • {fmtMoney(BLUEJAYS_SETUP_COST)} once · paid in full or 3 splits
                  </li>
                  <li>
                    • ~{fmtMoney(BLUEJAYS_AD_SPEND_MONTHLY)}/mo ad spend (yours, not ours)
                  </li>
                  <li>• You own the system + the customer list</li>
                </ul>
              </div>
            </div>

            {/* Net 3-year profit + payback */}
            {math.threeYearProfit > 0 && (
              <div className="rounded-2xl border-2 border-amber-500/40 bg-gradient-to-b from-amber-500/10 to-transparent p-6 text-center">
                <p className="text-xs uppercase tracking-widest text-amber-300 font-bold mb-2">
                  Your 3-year net profit
                </p>
                <p className="text-4xl sm:text-5xl font-black text-amber-200 tabular-nums mb-2">
                  {fmtMoney(math.threeYearProfit)}
                </p>
                <p className="text-sm text-slate-300">
                  Pays for itself in about{" "}
                  <span className="text-white font-bold">
                    {Number.isFinite(math.paybackMonths)
                      ? `${Math.ceil(math.paybackMonths)} months`
                      : "—"}
                  </span>
                  . Every month after that is yours.
                </p>
              </div>
            )}

            {/* Real proof — anchor closes */}
            <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-6">
              <h3 className="text-base font-bold text-white mb-3">
                Built for manufacturers like yours
              </h3>
              <ul className="space-y-2.5 text-sm text-slate-300">
                <li className="flex gap-2">
                  <span className="text-emerald-300">✓</span>
                  <span>
                    <span className="font-bold text-white">ITC Quick Attach</span>
                    {" "}— custom tractor parts, was distributor-only, now selling direct nationwide
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-emerald-300">✓</span>
                  <span>
                    <span className="font-bold text-white">Zenith Sports / TEKKY</span>
                    {" "}— soccer training balls, captured 40%+ of club orders direct in year 1
                  </span>
                </li>
              </ul>
            </div>

            {/* What's included */}
            <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-6">
              <h3 className="text-base font-bold text-white mb-3">
                What you get when you go direct with us
              </h3>
              <ul className="space-y-2 text-sm text-slate-300">
                <li className="flex gap-2"><span className="text-emerald-300">✓</span> Custom website that shows your hero product like a real brand</li>
                <li className="flex gap-2"><span className="text-emerald-300">✓</span> Google + Meta ad accounts in your name, built around your buyer</li>
                <li className="flex gap-2"><span className="text-emerald-300">✓</span> Email + text follow-up that nudges every interested buyer back</li>
                <li className="flex gap-2"><span className="text-emerald-300">✓</span> AI replies to inbound buyers within seconds — even at 2am</li>
                <li className="flex gap-2"><span className="text-emerald-300">✓</span> Owner portal showing every lead, sale, and ad in one place</li>
              </ul>
            </div>

            {/* CTA — capture form */}
            <div className="rounded-3xl border-2 border-emerald-500/40 bg-gradient-to-b from-emerald-500/10 to-transparent p-6 sm:p-8">
              <p className="text-xs uppercase tracking-widest text-emerald-300 font-bold mb-3 text-center">
                Want a custom plan based on your numbers?
              </p>
              <h2 className="text-2xl sm:text-3xl font-black text-white text-center leading-tight mb-2">
                I&apos;ll send you a real walk-through.
              </h2>
              <p className="text-sm text-slate-300 text-center mb-6 max-w-md mx-auto">
                Free. No call required. Ben will email a custom plan within 24
                hours — using your numbers, your product, your margin.
              </p>

              <div className="space-y-3 max-w-md mx-auto">
                <input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-md bg-slate-950 border border-slate-700 px-4 py-3 text-base text-white placeholder-slate-600 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                />
                <input
                  type="email"
                  placeholder="you@yourbusiness.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={handleEmailBlur}
                  className="w-full rounded-md bg-slate-950 border border-slate-700 px-4 py-3 text-base text-white placeholder-slate-600 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                />
                <input
                  type="text"
                  placeholder="What do you make? (optional)"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full rounded-md bg-slate-950 border border-slate-700 px-4 py-3 text-base text-white placeholder-slate-600 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                />
                <input
                  type="tel"
                  placeholder="Phone (optional)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-md bg-slate-950 border border-slate-700 px-4 py-3 text-base text-white placeholder-slate-600 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
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
                  className="w-full rounded-md bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-700 disabled:text-slate-500 text-emerald-950 px-6 py-4 text-base font-bold shadow-lg transition-colors"
                >
                  {stage === "submitting"
                    ? "Sending…"
                    : "Send me my custom plan →"}
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
                <span className="text-emerald-300">{email}</span> within 24
                hours. Real numbers, real strategy — no fluff.
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6 max-w-md mx-auto">
              <p className="text-xs uppercase tracking-widest text-emerald-300 font-bold mb-2">
                Want to skip the wait?
              </p>
              <p className="text-sm text-slate-300 mb-4">
                Book a free 15-minute walkthrough. Ben will show you ITC and
                Zenith&apos;s actual sales backends live.
              </p>
              <Link
                href={BOOK_A_CALL_URL}
                className="inline-flex items-center justify-center w-full rounded-md bg-emerald-500 hover:bg-emerald-400 text-emerald-950 px-6 py-3.5 text-base font-bold shadow-lg transition-colors"
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
          {/* Touch the helper so the linter doesn't strip it — used for any future "exact" display */}
          <span className="hidden">{fmtMoneyExact(0)}</span>
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
