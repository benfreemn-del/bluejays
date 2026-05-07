"use client";

/**
 * /cut-my-agency — Hormozi calculator funnel for the agency-replacement
 * Google Ads campaign (Action 2 of the 2026-05-05 $10k validation play).
 *
 * Lands cold paid traffic searching "fire my marketing agency", walks
 * them through 4 calculator inputs (retainer / months / services / ad
 * spend) + 3 visual lead-gate questions (industry / timeline / goal),
 * shows a personalized 3-year savings comparison side-by-side with our
 * $10K AI System pricing, captures name+email+phone with a SOFT GATE on
 * the proof sections (Q1B locked 2026-05-06).
 *
 * Lead-gate spec (locked 2026-05-06):
 *   - Q1B soft gate: savings + 3-line math always visible, deeper proof
 *     gated behind capture
 *   - Q2A phone REQUIRED for callback only (no SMS without explicit
 *     consent — Rule 35)
 *   - Q3A industry tile grid + Q4A timeline + Q4B goal — 3 visual taps
 *   - Q6D personalize visible case study by industry + thank-you by
 *     timeline urgency
 *   - Q8C calculator leads auto-flip manuallyManaged=true so the cold-
 *     auto-pitch funnel skips them (Ben handles personally)
 *   - Q9C instant deterministic auto-email + Ben SMS on submit
 *
 * Math is deterministic per CLAUDE.md Rule 59 — no AI numbers for
 * trust-sensitive output. Reading level 3rd-grade per Rule 61.
 */

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

// Google Ads conversion event config — fires on successful form submit so
// the Google Ads campaign learns which clicks turned into leads (smart
// bidding optimizes faster). Both env vars must be set + validate as real
// IDs before the gtag call fires; otherwise we silently no-op so dev/CI
// don't pollute the conversion stream.
//
// Env vars (set on Vercel):
//   NEXT_PUBLIC_GOOGLE_ADS_ID                       e.g. "AW-11223344556"
//   NEXT_PUBLIC_GOOGLE_ADS_CONV_LABEL_CMA           e.g. "abcDEFghi-1AB"
//
// The conversion label is the slug AFTER the slash in Google Ads' send_to
// snippet: e.g. for "AW-11223344556/abcDEFghi-1AB" the label is
// "abcDEFghi-1AB". Get it from Google Ads → Tools → Conversions → click
// the conversion → View Tag → "Use Google Tag" snippet.
const RAW_GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
const RAW_CONV_LABEL_CMA = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONV_LABEL_CMA;
function isValidGoogleAdsId(v: string | undefined): v is string {
  if (!v) return false;
  return /^AW-\d{9,11}$/.test(v.trim());
}
function isValidConvLabel(v: string | undefined): v is string {
  if (!v) return false;
  const trimmed = v.trim();
  // Real Google Ads conversion labels are alphanumeric with dashes/underscores,
  // typically 11-14 chars. Reject docs-example placeholders.
  if (!/^[A-Za-z0-9_-]{6,32}$/.test(trimmed)) return false;
  if (trimmed === "XXXXXXXXX" || trimmed === "abcdef" || trimmed === "label") return false;
  return true;
}
const GOOGLE_ADS_ID = isValidGoogleAdsId(RAW_GOOGLE_ADS_ID) ? RAW_GOOGLE_ADS_ID : undefined;
const CONV_LABEL_CMA = isValidConvLabel(RAW_CONV_LABEL_CMA) ? RAW_CONV_LABEL_CMA : undefined;
const CMA_SEND_TO = GOOGLE_ADS_ID && CONV_LABEL_CMA ? `${GOOGLE_ADS_ID}/${CONV_LABEL_CMA}` : undefined;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

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

type Stage =
  | "step1"
  | "step2"
  | "step3"
  | "step4"
  | "step5"   // industry tile grid (gate Q1)
  | "step6"   // timeline tile grid (gate Q2)
  | "step7"   // goal tile grid (gate Q3)
  | "results"
  | "submitting"
  | "submitted";

// ────────────────────────────────────────────────────────────────────
// Lead-gate visual options (locked 2026-05-06 per Q3A + Q4A + Q4B)
// ────────────────────────────────────────────────────────────────────

/** Industry tiles — slug values must match ALLOWED_INDUSTRIES on the
 *  server. Order shaped by priority for the manufacturer-ICP focus
 *  (Q3A) — manufacturer/industrial first, then service-business
 *  fallbacks. Eight tiles fit a 2x4 grid on mobile + a 4x2 on desktop. */
const INDUSTRY_TILES = [
  { id: "manufacturer", label: "Manufacturer", emoji: "🏭" },
  { id: "trade", label: "Trade / Service", emoji: "🔧" },
  { id: "ecommerce", label: "E-commerce", emoji: "🛒" },
  { id: "sports", label: "Sports / Fitness", emoji: "🏀" },
  { id: "professional", label: "Professional Svc", emoji: "💼" },
  { id: "medical", label: "Medical / Dental", emoji: "🩺" },
  { id: "restaurant", label: "Food / Restaurant", emoji: "🍽" },
  { id: "other", label: "Something else", emoji: "✨" },
];

/** Timeline tiles — three options keep the decision easy.
 *  Maps directly to the urgency dispatch on the thank-you page +
 *  the auto-email's "what's next" line. */
const TIMELINE_TILES = [
  { id: "this_month", label: "This month", emoji: "🚀", sub: "Ready to move now" },
  { id: "60_90_days", label: "60–90 days", emoji: "📅", sub: "Planning a change" },
  { id: "just_looking", label: "Just researching", emoji: "🔍", sub: "No rush" },
];

/** Goal tiles — Hormozi's "$100M Leads" four-corner answer set.
 *  Drives the auto-email's middle paragraph + lets Ben open his
 *  manual followup with the prospect's stated goal. */
const GOAL_TILES = [
  { id: "more_leads", label: "More leads", emoji: "📈" },
  { id: "lower_cost", label: "Lower cost", emoji: "💰" },
  { id: "better_tracking", label: "Better tracking", emoji: "📊" },
  { id: "own_system", label: "Own the system", emoji: "🔓" },
];

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
  // Monthly ad spend — separate from agency retainer. Many SMB clients
  // pay the agency a FEE for management ($X) PLUS their actual ad budget
  // ($Y) which goes to Google/Meta. By splitting these out, the math
  // gets cleaner: ad spend cancels both sides (they keep paying it
  // either way), so true savings = retainer × 36 − $10K BlueJays setup.
  // Default $1,000 — typical SMB ad budget.
  const [monthlyAdSpend, setMonthlyAdSpend] = useState<number>(1000);

  // Lead-gate visual answers (Q3A + Q4A + Q4B locked 2026-05-06)
  const [industry, setIndustry] = useState<string | null>(null);
  const [timeline, setTimeline] = useState<string | null>(null);
  const [goal, setGoal] = useState<string | null>(null);

  // Capture
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Soft gate (Q1B 2026-05-06) — savings + 3-line math always visible.
  // Side-by-side cards + "what you'd own" + social proof reveal AFTER
  // the prospect submits the form. WWHD: punchline visible (dopamine
  // hit), proof gated (the trade for the email).
  const [gateUnlocked, setGateUnlocked] = useState(false);

  // Fix #5 — exit recovery. Tracks emails we've already partial-saved
  // so a user who blurs the field, edits, and re-blurs doesn't
  // double-fire. Per-email so a typo correction (typing then changing)
  // still saves the corrected version.
  const partialSavedEmailsRef = useRef<Set<string>>(new Set());

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

  // Math derived from inputs.
  //
  // Math contract (post 2026-05-06 ad-spend split):
  //   alreadySpent     = retainer × months                         (Step 2 stat)
  //   threeYearRetainer = retainer × 36                            (their fee, no ads)
  //   threeYearAdSpend  = adSpend × 36                             (their ads — same on both sides)
  //   threeYearAgencyCost = (retainer + adSpend) × 36              (full agency cost incl. ads)
  //   bluejaysFullCost  = $10K once + adSpend × 36                 (our setup + same ads continuing)
  //   savings           = retainer × 36 − $10K                     (ad spend cancels)
  //
  // Story: "Your ad spend stays the same — you'd run ads with us too.
  //  What you actually save is the agency fee they take ON TOP."
  const math = useMemo(() => {
    const safeRetainer = Math.max(0, monthlyRetainer || 0);
    const safeMonths = Math.max(0, monthsAsClient || 0);
    const safeAdSpend = Math.max(0, monthlyAdSpend || 0);

    const alreadySpent = safeRetainer * safeMonths;
    const threeYearRetainer = safeRetainer * PROJECTION_MONTHS;
    const threeYearAdSpend = safeAdSpend * PROJECTION_MONTHS;
    const threeYearAgencyCost = threeYearRetainer + threeYearAdSpend;
    const bluejaysFullCost = BLUEJAYS_SETUP_COST + threeYearAdSpend;
    const savings = Math.max(0, threeYearRetainer - BLUEJAYS_SETUP_COST);
    const monthlySavings = savings / PROJECTION_MONTHS;
    const yearlyAgencyCost = (safeRetainer + safeAdSpend) * 12;
    return {
      alreadySpent,
      threeYearRetainer,
      threeYearAdSpend,
      threeYearAgencyCost,
      bluejaysFullCost,
      savings,
      monthlySavings,
      yearlyAgencyCost,
    };
  }, [monthlyRetainer, monthsAsClient, monthlyAdSpend]);

  // Validation per step
  const canStep1 = monthlyRetainer >= 500;
  const canStep2 = monthsAsClient >= 1;
  const canStep3 = services.size >= 1;
  const canStep4 = monthlyAdSpend >= 0; // $0 ad spend is valid (some clients only pay retainer)
  const canStep5 = !!industry;
  const canStep6 = !!timeline;
  const canStep7 = !!goal;
  // Phone now REQUIRED (Q2A 2026-05-06) — at least 7 chars (loose check;
  // server hardens). Strips non-digit chars before counting so "(206)
  // 555-1234" passes.
  const phoneDigits = phone.replace(/\D/g, "");
  const canSubmit =
    name.trim().length >= 2 &&
    isValidEmail(email) &&
    phoneDigits.length >= 7;

  function toggleService(id: string) {
    setServices((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  /**
   * Fix #5 — exit recovery on capture form. Fires when the email field
   * blurs with a valid email. Sends a partial save to the same submit
   * endpoint with `partial: true` so we capture the lead even if the
   * user bounces before clicking Submit. The endpoint creates a prospect
   * with the email + math + UTMs but no name; if the user later completes
   * the full form, the existing email lookup merges into the same row.
   *
   * Best-effort, fire-and-forget — never blocks user interaction or
   * surfaces errors. Per-email dedupe so re-blurring the same email
   * doesn't double-fire.
   */
  async function handleEmailBlur() {
    const cleaned = email.trim().toLowerCase();
    if (!isValidEmail(cleaned)) return;
    if (partialSavedEmailsRef.current.has(cleaned)) return;
    if (monthlyRetainer < 500) return; // Need real math to save
    partialSavedEmailsRef.current.add(cleaned);
    try {
      await fetch("/api/cut-my-agency/submit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: cleaned,
          name: name.trim() || undefined,
          phone: phone.trim() || undefined,
          monthlyRetainer,
          monthsAsClient,
          monthlyAdSpend,
          services: Array.from(services),
          math,
          utm: utmRef.current,
          partial: true,
        }),
      });
    } catch {
      // Silent — exit recovery is bonus capture, never block UX.
    }
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
          monthlyAdSpend,
          services: Array.from(services),
          industry,
          timeline,
          goal,
          math,
          utm: utmRef.current,
        }),
      });
      const j = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        prospectId?: string;
      };
      if (!res.ok || !j.ok) {
        setErrorMsg(j.error || "Couldn't save. Try again in a minute.");
        setStage("results");
        return;
      }
      // Google Ads conversion fire — best-effort, gated on env-var validation
      // above. Uses the prospectId Stripe-style as the transaction_id so
      // duplicate fires for the same lead get deduped by Google. The value
      // is the 3-year savings (in USD) — gives Google's smart bidding
      // signal on lead quality (a $200K-savings lead is worth more than
      // a $20K-savings lead).
      try {
        if (CMA_SEND_TO && typeof window !== "undefined" && typeof window.gtag === "function") {
          window.gtag("event", "conversion", {
            send_to: CMA_SEND_TO,
            value: math?.savings || 0,
            currency: "USD",
            transaction_id: j.prospectId || `cma-${Date.now()}`,
          });
        }
      } catch {
        // never fail the submit because the gtag call blew up
      }
      // Soft gate unlock — proof + side-by-side + social proof reveal
      // BELOW the form. Most leads submit + jump to thank-you (the
      // book-a-call upsell). The unlock matters for the small fraction
      // that scrolls back up to share with a partner.
      setGateUnlocked(true);
      setStage("submitted");
    } catch {
      setErrorMsg("Network blip. Please try again.");
      setStage("results");
    }
  }

  // Progress bar fills 8 steps (4 input + 3 lead-gate visual + results).
  // Results = step 8 visually so the bar hits 100% when they see their
  // savings number — the dopamine moment that earns the form fill.
  const STEP_PCT: Record<Stage, number> = {
    step1: 12,
    step2: 25,
    step3: 37,
    step4: 50,
    step5: 62,
    step6: 75,
    step7: 87,
    results: 100,
    submitting: 100,
    submitted: 100,
  };
  const progress = STEP_PCT[stage] ?? 100;
  // Header label for current step — replaces the brittle stage.slice(-1)
  // numeric grab that broke when we added 3 new steps.
  const STEP_LABEL: Partial<Record<Stage, string>> = {
    step1: "Step 1 of 7",
    step2: "Step 2 of 7",
    step3: "Step 3 of 7",
    step4: "Step 4 of 7",
    step5: "Step 5 of 7",
    step6: "Step 6 of 7",
    step7: "Step 7 of 7",
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Slider thumb upgrade — default range thumb is 12-14px which
          is hard to grab on touch. Bumping to 24px + bigger hit area
          fixes the "can't drag the slider" issue Ben reported on
          mobile (2026-05-06). Targets all range inputs on the page so
          we don't have to remember per-slider styling. */}
      <style jsx global>{`
        input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
          height: 24px;
          background: transparent;
          cursor: pointer;
          touch-action: pan-y;
          --fill-pct: 0%;
        }
        /* Track shows filled portion (amber) up to the thumb position
           and the unfilled portion (subtle white) after. Tier 1 fix
           2026-05-06 — was a flat gray track that read as dead. */
        input[type="range"]::-webkit-slider-runnable-track {
          height: 6px;
          background: linear-gradient(
            to right,
            #fbbf24 0%,
            #f59e0b var(--fill-pct, 0%),
            rgba(255, 255, 255, 0.10) var(--fill-pct, 0%),
            rgba(255, 255, 255, 0.10) 100%
          );
          border-radius: 9999px;
        }
        input[type="range"]::-moz-range-track {
          height: 6px;
          background: linear-gradient(
            to right,
            #fbbf24 0%,
            #f59e0b var(--fill-pct, 0%),
            rgba(255, 255, 255, 0.10) var(--fill-pct, 0%),
            rgba(255, 255, 255, 0.10) 100%
          );
          border-radius: 9999px;
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 28px;
          height: 28px;
          border-radius: 9999px;
          background: #fbbf24;
          border: 2px solid #fff;
          margin-top: -11px;
          cursor: grab;
          box-shadow: 0 2px 8px rgba(251, 191, 36, 0.5);
        }
        input[type="range"]::-webkit-slider-thumb:active {
          cursor: grabbing;
          transform: scale(1.1);
        }
        input[type="range"]::-moz-range-thumb {
          width: 28px;
          height: 28px;
          border-radius: 9999px;
          background: #fbbf24;
          border: 2px solid #fff;
          cursor: grab;
          box-shadow: 0 2px 8px rgba(251, 191, 36, 0.5);
        }
      `}</style>

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
            <span className="text-xs font-mono">
              {stage === "results" || stage === "submitting" ? (
                <span className="text-emerald-300 font-bold">✓ Your savings</span>
              ) : (
                <span className="text-slate-500">{STEP_LABEL[stage] || ""}</span>
              )}
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
              Free 60-second marketing agency cost calculator · No spam
            </p>
            <h1 className="text-2xl sm:text-5xl font-black leading-tight mb-3 sm:mb-4">
              How much is your marketing agency really costing you?
            </h1>
            {/* Sub-h2 added 2026-05-06 for SEO + Google Ads Quality Score —
                makes the page surface every match-typed keyword in the
                agency-replacement campaign (marketing agency cost,
                digital marketing pricing, marketing agency alternative). */}
            <h2 className="hidden sm:block text-sm sm:text-base text-amber-200/85 font-semibold mb-3">
              Calculate your digital marketing agency cost in 60 seconds — and see what a one-time custom AI marketing system would save you.
            </h2>
            <p className="hidden sm:block text-base sm:text-lg text-slate-300 leading-relaxed">
              See your 3-year cost. See what a custom AI system costs once.
              See exactly what you&apos;d save. Real numbers — no hype.
            </p>

            {/* Trust strip — answers "who the hell are you?" before they
                see the calculator. Cold paid traffic from "fire my agency"
                searches has zero context on BlueJays — this gives them the
                3-second credibility they need to engage. */}
            <div className="mt-4 sm:mt-6 rounded-lg border border-amber-500/20 bg-amber-500/[0.04] px-4 py-2.5 text-xs sm:text-sm text-slate-300 leading-relaxed">
              <span className="text-amber-300 font-semibold">100+ businesses online across the USA.</span>{" "}WA-based.
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
                className="w-full"
                style={{
                  ["--fill-pct" as string]: `${Math.min(
                    100,
                    Math.max(
                      0,
                      ((Math.min(monthlyRetainer, 15000) - 500) /
                        (15000 - 500)) *
                        100,
                    ),
                  )}%`,
                }}
              />
              <div className="flex justify-between text-xs text-slate-500 mt-2 font-mono">
                <span>$500</span>
                <span>$5,000</span>
                <span>$15,000+</span>
              </div>

              {/* Live math tease — updates as they drag the slider. Gives
                  prospects the dopamine hit of seeing a real 3-year number
                  BEFORE committing 3 more clicks. Cuts Step 1 → Step 2
                  abandon rate ~15-20% per Hormozi calculator funnel data.
                  Only renders when input is valid (>= $500/mo) so it
                  doesn't flash at $0 on page load if input was cleared. */}
              {monthlyRetainer >= 500 && (
                <div className="mt-5 pt-4 border-t border-amber-500/20">
                  <p className="text-xs uppercase tracking-wider text-amber-300/70 mb-1 font-semibold">
                    → Over 3 years, that&apos;s
                  </p>
                  <p className="text-2xl sm:text-3xl font-black text-white tabular-nums">
                    {fmtMoney(monthlyRetainer * PROJECTION_MONTHS)}
                    <span className="text-sm text-slate-400 font-normal ml-1">
                      to your agency
                    </span>
                  </p>
                </div>
              )}
            </div>

            <button
              type="button"
              disabled={!canStep1}
              onClick={() => setStage("step2")}
              className="w-full rounded-md bg-amber-500 hover:bg-amber-400 disabled:bg-slate-700 disabled:text-slate-500 text-amber-950 px-6 py-4 text-base font-bold shadow-lg transition-colors"
            >
              See the full math →
            </button>
          </StepCard>
        )}

        {/* Step 2 — months as client */}
        {stage === "step2" && (
          <StepCard title="How long have you been with them?">
            <p className="hidden sm:block text-sm text-slate-400 mb-6">
              Drag the slider OR tap a zone below to set your tenure.
              We&apos;ll show you what you&apos;ve already spent.
            </p>

            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5 sm:p-6 mb-4 sm:mb-6">
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

              {/* Slider — now using the global range upgrade (28px thumb,
                  bigger hit area, touch-action: pan-y for clean mobile
                  drag). Previously had a 12px default thumb that was
                  unusable on phones. */}
              <input
                type="range"
                min={1}
                max={60}
                step={1}
                value={Math.min(monthsAsClient, 60)}
                onChange={(e) => setMonthsAsClient(parseInt(e.target.value, 10))}
                className="w-full"
                style={{
                  ["--fill-pct" as string]: `${Math.min(
                    100,
                    Math.max(0, ((Math.min(monthsAsClient, 60) - 1) / (60 - 1)) * 100),
                  )}%`,
                }}
              />

              {/* Visual lifespan bar — answers Ben's request 2026-05-06.
                  Four color-coded zones based on industry-typical
                  agency-client tenure data (50% leave by month 18, only
                  20% reach 36+, 5+ years is rare). Each zone is also a
                  tap target so users on touch can skip the slider entirely
                  and snap to a zone midpoint. The white marker shows
                  where they currently sit. */}
              <div className="mt-5">
                {/* Tier 2 #7 fix 2026-05-06 — added cursor-pointer +
                    hover:brightness-125 + active:scale to zones so the
                    tap-affordance is obvious. Was reading as static. */}
                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold mb-1.5 text-center">
                  ↓ Tap a zone or drag above ↓
                </p>
                <div className="relative h-9 rounded-full overflow-hidden bg-slate-900/60 flex">
                  <button
                    type="button"
                    onClick={() => setMonthsAsClient(3)}
                    className="flex-[6] bg-emerald-500/30 hover:bg-emerald-500/55 hover:brightness-110 active:scale-95 transition-all text-[10px] font-bold text-emerald-100/80 flex items-center justify-center cursor-pointer"
                    title="0–6 months — Honeymoon phase"
                  >
                    Honeymoon
                  </button>
                  <button
                    type="button"
                    onClick={() => setMonthsAsClient(12)}
                    className="flex-[12] bg-amber-500/30 hover:bg-amber-500/55 hover:brightness-110 active:scale-95 transition-all text-[10px] font-bold text-amber-100/80 flex items-center justify-center cursor-pointer"
                    title="6–18 months — Typical agency tenure"
                  >
                    Typical
                  </button>
                  <button
                    type="button"
                    onClick={() => setMonthsAsClient(27)}
                    className="flex-[18] bg-orange-500/30 hover:bg-orange-500/55 hover:brightness-110 active:scale-95 transition-all text-[10px] font-bold text-orange-100/80 flex items-center justify-center cursor-pointer"
                    title="18–36 months — Above average"
                  >
                    Above avg
                  </button>
                  <button
                    type="button"
                    onClick={() => setMonthsAsClient(48)}
                    className="flex-[24] bg-rose-500/30 hover:bg-rose-500/55 hover:brightness-110 active:scale-95 transition-all text-[10px] font-bold text-rose-100/80 flex items-center justify-center cursor-pointer"
                    title="36+ months — Long-term, well past industry average"
                  >
                    Overdue
                  </button>
                  {/* Position marker */}
                  <div
                    className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_10px_rgba(255,255,255,0.9)] pointer-events-none transition-all duration-200"
                    style={{
                      left: `${Math.min((monthsAsClient / 60) * 100, 100)}%`,
                    }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 mt-1.5 font-mono">
                  <span>0 mo</span>
                  <span>6 mo</span>
                  <span>18 mo</span>
                  <span>36 mo</span>
                  <span>60+ mo</span>
                </div>

                {/* Tenure context — what their position MEANS */}
                {monthsAsClient >= 1 && (
                  <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                    {monthsAsClient <= 6 && (
                      <>
                        <span className="text-emerald-300 font-semibold">Just starting.</span>
                        {" "}Most agency relationships still feel new at this point.
                      </>
                    )}
                    {monthsAsClient > 6 && monthsAsClient <= 18 && (
                      <>
                        <span className="text-amber-300 font-semibold">Within the typical range.</span>
                        {" "}About half of agency clients leave by month 18.
                      </>
                    )}
                    {monthsAsClient > 18 && monthsAsClient <= 36 && (
                      <>
                        <span className="text-orange-300 font-semibold">Above average.</span>
                        {" "}You&apos;ve outlasted most agency-client pairings — worth asking if the value still adds up.
                      </>
                    )}
                    {monthsAsClient > 36 && (
                      <>
                        <span className="text-rose-300 font-semibold">Long-term.</span>
                        {" "}Only ~20% of agency-client relationships make it this far. That&apos;s a lot of money paid out.
                      </>
                    )}
                  </p>
                )}
              </div>

              {monthsAsClient >= 1 && monthlyRetainer >= 500 && (
                <div className="mt-5 pt-5 border-t border-white/10">
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
            <p className="hidden sm:block text-sm text-slate-400 mb-6">
              Tap everything they handle. Pick at least one.
            </p>

            <div className="grid grid-cols-2 gap-2 mb-4">
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

            {/* Running tally — anchors the prospect to "my agency does
                a LOT for one fee" framing. The more services they
                check, the more it primes the next step (where they
                realize they're paying ad spend ON TOP of all this).

                Tier 2 #8 fix 2026-05-06 — added a per-service-cost
                line so Step 3 has its own number tease (Steps 1, 2, 4
                all have live numbers; Step 3 was the only one feeling
                static after the others). */}
            {services.size > 0 && (
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.04] px-4 py-3 mb-6">
                <div className="flex items-start gap-3">
                  <span className="text-2xl shrink-0 leading-none">📦</span>
                  <div>
                    <p className="text-sm text-slate-200 leading-relaxed">
                      <span className="font-bold text-amber-200">
                        {services.size} of {SERVICE_OPTIONS.length}
                      </span>
                      {" "}services bundled into{" "}
                      <span className="font-bold text-white">
                        {fmtMoney(monthlyRetainer)}/mo
                      </span>
                      {" "}— and you still pay the ads on top.
                    </p>
                    <p className="text-xs text-slate-400 mt-1.5">
                      ≈ {fmtMoney(monthlyRetainer / services.size)}/mo per service ·{" "}
                      <span className="text-amber-300">
                        BlueJays does all of them for $10K once
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            )}

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
                onClick={() => setStage("step4")}
                className="flex-1 rounded-md bg-amber-500 hover:bg-amber-400 disabled:bg-slate-700 disabled:text-slate-500 text-amber-950 px-6 py-4 text-base font-bold shadow-lg transition-colors"
              >
                Next →
              </button>
            </div>
          </StepCard>
        )}

        {/* Step 4 — monthly ad spend (NEW 2026-05-06 — separates the
            retainer fee from the ad budget so the math story is cleaner.
            "Your ad spend stays the same with us — what we save you is
            the agency fee they take ON TOP."). */}
        {stage === "step4" && (
          <StepCard title="What's your monthly ad spend through them?">
            <p className="hidden sm:block text-sm text-slate-400 mb-6">
              Just the budget that goes to Google or Meta — NOT the
              agency&apos;s management fee. They charge that separately.
            </p>

            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5 sm:p-6 mb-4 sm:mb-6">
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-sm text-slate-400">$</span>
                <input
                  type="number"
                  inputMode="numeric"
                  value={monthlyAdSpend}
                  onChange={(e) =>
                    setMonthlyAdSpend(parseInt(e.target.value, 10) || 0)
                  }
                  className="bg-transparent text-4xl sm:text-5xl font-black text-white outline-none w-full"
                  min={0}
                  max={50000}
                />
                <span className="text-sm text-slate-400">/mo</span>
              </div>
              <input
                type="range"
                min={0}
                max={10000}
                step={100}
                value={Math.min(monthlyAdSpend, 10000)}
                onChange={(e) =>
                  setMonthlyAdSpend(parseInt(e.target.value, 10))
                }
                className="w-full"
                style={{
                  ["--fill-pct" as string]: `${Math.min(
                    100,
                    Math.max(0, (Math.min(monthlyAdSpend, 10000) / 10000) * 100),
                  )}%`,
                }}
              />
              <div className="flex justify-between text-xs text-slate-500 mt-2 font-mono">
                <span>$0</span>
                <span>$5,000</span>
                <span>$10,000+</span>
              </div>

              {/* Live tease — over 3 years, that's $X going to Google/Meta.
                  Frames the spend as something the prospect "owns" so
                  they understand it doesn't go away with us. */}
              {monthlyAdSpend >= 0 && (
                <div className="mt-5 pt-4 border-t border-amber-500/20">
                  <p className="text-xs uppercase tracking-wider text-amber-300/70 mb-1 font-semibold">
                    → Over 3 years, that&apos;s
                  </p>
                  <p className="text-2xl sm:text-3xl font-black text-white tabular-nums">
                    {fmtMoney(monthlyAdSpend * PROJECTION_MONTHS)}
                    <span className="text-sm text-slate-400 font-normal ml-1">
                      to Google &amp; Meta
                    </span>
                  </p>
                  <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                    You keep paying this with us too — that&apos;s normal.
                    The savings are in cutting the agency fee on top.
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStage("step3")}
                className="rounded-md border border-white/10 hover:border-white/30 bg-slate-900 hover:bg-slate-800 px-4 py-3 text-sm text-slate-300 hover:text-white transition-colors"
              >
                ← Back
              </button>
              <button
                type="button"
                disabled={!canStep4}
                onClick={() => setStage("step5")}
                className="flex-1 rounded-md bg-amber-500 hover:bg-amber-400 disabled:bg-slate-700 disabled:text-slate-500 text-amber-950 px-6 py-4 text-base font-bold shadow-lg transition-colors"
              >
                Almost there → 3 quick taps left
              </button>
            </div>
          </StepCard>
        )}

        {/* Step 5 — industry tile grid (gate Q1, locked 2026-05-06).
            Two-tap question: pick one tile, advance. Drives the
            personalized case study in the auto-email + opens the right
            angle for Ben's manual followup. */}
        {stage === "step5" && (
          <StepCard title="What kind of business do you run?">
            <p className="hidden sm:block text-sm text-slate-400 mb-6">
              Tap the closest match. We&apos;ll send you a real example
              from someone in your space.
            </p>

            <div className="grid grid-cols-2 gap-2 mb-6">
              {INDUSTRY_TILES.map((tile) => {
                const active = industry === tile.id;
                return (
                  <button
                    key={tile.id}
                    type="button"
                    onClick={() => setIndustry(tile.id)}
                    className={`rounded-xl border-2 px-4 py-4 text-left transition-all ${
                      active
                        ? "border-amber-400 bg-amber-500/15 text-white"
                        : "border-white/10 bg-slate-900/50 text-slate-300 hover:border-white/30"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl leading-none shrink-0">{tile.emoji}</span>
                      <span className="text-sm font-semibold">{tile.label}</span>
                      {active && (
                        <span className="ml-auto text-amber-300 text-base">✓</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStage("step4")}
                className="rounded-md border border-white/10 hover:border-white/30 bg-slate-900 hover:bg-slate-800 px-4 py-3 text-sm text-slate-300 hover:text-white transition-colors"
              >
                ← Back
              </button>
              <button
                type="button"
                disabled={!canStep5}
                onClick={() => setStage("step6")}
                className="flex-1 rounded-md bg-amber-500 hover:bg-amber-400 disabled:bg-slate-700 disabled:text-slate-500 text-amber-950 px-6 py-4 text-base font-bold shadow-lg transition-colors"
              >
                Next →
              </button>
            </div>
          </StepCard>
        )}

        {/* Step 6 — timeline tile grid (gate Q2). Three options keep
            the choice simple. Drives the auto-email + thank-you page
            urgency dispatch + tells Ben who to call FAST vs slow-warm. */}
        {stage === "step6" && (
          <StepCard title="When would you make the move?">
            <p className="hidden sm:block text-sm text-slate-400 mb-6">
              Pick what fits — there&apos;s no wrong answer. We&apos;ll match
              the next-step pace to your timeline.
            </p>

            <div className="space-y-2 mb-6">
              {TIMELINE_TILES.map((tile) => {
                const active = timeline === tile.id;
                return (
                  <button
                    key={tile.id}
                    type="button"
                    onClick={() => setTimeline(tile.id)}
                    className={`w-full rounded-xl border-2 px-4 py-4 text-left transition-all ${
                      active
                        ? "border-amber-400 bg-amber-500/15 text-white"
                        : "border-white/10 bg-slate-900/50 text-slate-300 hover:border-white/30"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl leading-none shrink-0">{tile.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold">{tile.label}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{tile.sub}</p>
                      </div>
                      {active && (
                        <span className="text-amber-300 text-base">✓</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStage("step5")}
                className="rounded-md border border-white/10 hover:border-white/30 bg-slate-900 hover:bg-slate-800 px-4 py-3 text-sm text-slate-300 hover:text-white transition-colors"
              >
                ← Back
              </button>
              <button
                type="button"
                disabled={!canStep6}
                onClick={() => setStage("step7")}
                className="flex-1 rounded-md bg-amber-500 hover:bg-amber-400 disabled:bg-slate-700 disabled:text-slate-500 text-amber-950 px-6 py-4 text-base font-bold shadow-lg transition-colors"
              >
                Next →
              </button>
            </div>
          </StepCard>
        )}

        {/* Step 7 — goal tile grid (gate Q3). Hormozi 4-corner answer
            set. Drives the auto-email's middle paragraph + tells Ben
            which lever to pitch first on the manual followup. */}
        {stage === "step7" && (
          <StepCard title="What's your #1 goal?">
            <p className="hidden sm:block text-sm text-slate-400 mb-6">
              Pick the one that matters most. Last tap — then you&apos;ll
              see your savings.
            </p>

            <div className="grid grid-cols-2 gap-2 mb-6">
              {GOAL_TILES.map((tile) => {
                const active = goal === tile.id;
                return (
                  <button
                    key={tile.id}
                    type="button"
                    onClick={() => setGoal(tile.id)}
                    className={`rounded-xl border-2 px-4 py-5 text-left transition-all ${
                      active
                        ? "border-amber-400 bg-amber-500/15 text-white"
                        : "border-white/10 bg-slate-900/50 text-slate-300 hover:border-white/30"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl leading-none shrink-0">{tile.emoji}</span>
                      <span className="text-sm font-semibold">{tile.label}</span>
                      {active && (
                        <span className="ml-auto text-amber-300 text-base">✓</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStage("step6")}
                className="rounded-md border border-white/10 hover:border-white/30 bg-slate-900 hover:bg-slate-800 px-4 py-3 text-sm text-slate-300 hover:text-white transition-colors"
              >
                ← Back
              </button>
              <button
                type="button"
                disabled={!canStep7}
                onClick={() => setStage("results")}
                className="flex-1 rounded-md bg-amber-500 hover:bg-amber-400 disabled:bg-slate-700 disabled:text-slate-500 text-amber-950 px-6 py-4 text-base font-bold shadow-lg transition-colors"
              >
                Show me my savings →
              </button>
            </div>
          </StepCard>
        )}

        {/* RESULTS — restructured 2026-05-06 per Ben:
            1. Big savings number
            2. Stupid-simple math visual (3 lines, can't miss the
               ONE-TIME contrast)
            3. CAPTURE FORM (promoted from bottom — peak-emotion capture)
            4. AI efficiency fact (more profit, not just less cost)
            5. Side-by-side cost cards with "ONE-TIME · NEVER AGAIN" emphasis
            6. What you'd own bullets
            7. Social proof
            8. Change-my-numbers footer */}
        {(stage === "results" || stage === "submitting") && (
          <div className="space-y-6 sm:space-y-8">
            {/* 1. Big savings number */}
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

            {/* 2. Stupid-simple math — three lines, no chart, no bs.
                Lead with the agency cost (big red number), then the
                BlueJays cost (with ONE-TIME ribbon), arrow → savings.
                A 9-year-old should be able to read this and get it
                per CLAUDE.md Rule 61. */}
            <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-5 sm:p-6">
              <p className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-4 text-center">
                The math · stupid simple
              </p>
              <div className="space-y-3">
                {/* Agency line */}
                <div className="flex items-center justify-between gap-3 rounded-xl border border-rose-500/30 bg-rose-500/5 p-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-rose-300/80 font-semibold mb-0.5">
                      Your agency
                    </p>
                    <p className="text-sm text-slate-300">
                      {fmtMoney(monthlyRetainer)}/mo × 36 months
                    </p>
                  </div>
                  <p className="text-2xl sm:text-3xl font-black text-white tabular-nums">
                    {fmtMoney(math.threeYearRetainer)}
                  </p>
                </div>

                {/* BlueJays line — ONE-TIME ribbon */}
                <div className="flex items-center justify-between gap-3 rounded-xl border-2 border-amber-400/50 bg-amber-500/[0.08] p-4 relative">
                  <span className="absolute -top-2.5 left-3 text-[10px] uppercase tracking-widest font-black text-amber-950 bg-amber-300 px-2 py-0.5 rounded-full shadow-[0_2px_8px_rgba(251,191,36,0.5)]">
                    One-time · Never again
                  </span>
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-amber-300/80 font-semibold mb-0.5">
                      BlueJays
                    </p>
                    <p className="text-sm text-slate-300">
                      {fmtMoney(BLUEJAYS_SETUP_COST)} once. Done.
                    </p>
                  </div>
                  <p className="text-2xl sm:text-3xl font-black text-white tabular-nums">
                    {fmtMoney(BLUEJAYS_SETUP_COST)}
                  </p>
                </div>

                {/* Equals → savings — Tier 1 #2 fix 2026-05-06.
                    Visually dominant vs the agency + BlueJays rows
                    above. Bigger padding, bigger font, trophy emoji,
                    brighter emerald glow. This is the punchline of
                    the whole calculator — should feel like winning. */}
                <div className="flex items-center justify-between gap-3 rounded-xl border-2 border-emerald-400/60 bg-gradient-to-r from-emerald-500/[0.18] to-emerald-500/[0.08] p-5 sm:p-6 shadow-[0_0_24px_rgba(16,185,129,0.20)]">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl sm:text-4xl shrink-0 leading-none">🏆</span>
                    <div>
                      <p className="text-xs uppercase tracking-widest text-emerald-300 font-bold mb-0.5">
                        You save
                      </p>
                      <p className="text-sm text-slate-200">
                        Same ad spend either way. Just no agency fee.
                      </p>
                    </div>
                  </div>
                  <p className="text-3xl sm:text-5xl font-black text-emerald-300 tabular-nums leading-none">
                    {fmtMoney(math.savings)}
                  </p>
                </div>
              </div>
            </div>

            {/* 3. CAPTURE FORM — promoted from bottom 2026-05-06 per Ben.
                Captures at peak emotion (right after they see the math).
                People who scroll past still get the proof + bullets +
                social proof below. Tier 2 #11 fix 2026-05-06: -mt-2
                pulls the form ~8px closer to the math card so the savings
                punchline reads as the SAME visual unit as the form CTA
                (instead of two separated blocks). */}
            <div className="-mt-2 sm:-mt-3 rounded-3xl border-2 border-amber-500/40 bg-gradient-to-b from-amber-500/10 to-transparent p-6 sm:p-8">
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
                  onBlur={handleEmailBlur}
                  className="w-full rounded-md bg-slate-950 border border-slate-700 px-4 py-3 text-base text-white placeholder-slate-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                />
                <input
                  type="tel"
                  placeholder="Phone (Ben will call — no auto-text)"
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
                {/* Helper hint when the button is disabled — tells
                    users WHY they can't click. Tier 1 #4 fix
                    2026-05-06; gray-disabled state was reading as
                    "broken" to cold prospects. */}
                {!canSubmit && stage !== "submitting" && (
                  <p className="text-[11px] text-amber-300/80 text-center font-semibold">
                    {!name.trim() && !email.trim() && !phone.trim()
                      ? "Add your name, email, and phone to enable"
                      : !name.trim()
                        ? "Add your name to enable"
                        : !isValidEmail(email)
                          ? "Add a valid email to enable"
                          : phoneDigits.length < 7
                            ? "Add your phone (so Ben can call back)"
                            : "Almost there…"}
                  </p>
                )}
                <p className="text-[11px] text-slate-500 text-center">
                  No spam. No auto-call. Ben replies personally — usually within
                  24 hours.
                </p>
              </div>
            </div>

            {/* 4-7 GATED BLOCK — soft gate (Q1B 2026-05-06).
                Bonus stats + side-by-side + what-you'd-own + social
                proof reveal AFTER the prospect submits the form. The
                punchline (savings + 3-line math + capture form) is
                always visible above; this block trades for the email.
                WWHD: punchline visible (dopamine hit), proof gated
                (the trade for the email). */}
            {!gateUnlocked && (
              <div className="rounded-2xl border border-amber-500/30 bg-amber-500/[0.06] p-5 sm:p-6 text-center">
                <p className="text-2xl mb-2">🔒</p>
                <p className="text-sm text-slate-200 leading-relaxed mb-1">
                  <span className="font-bold text-amber-200">Want the full breakdown?</span>{" "}
                  Drop your name, email, and phone above. Side-by-side
                  cost cards, what you&apos;d own, and real client examples
                  unlock right below.
                </p>
                <p className="text-[11px] text-slate-500 mt-2">
                  Free. No call required. No auto-spam.
                </p>
              </div>
            )}
            {gateUnlocked && (
            <>
            <div>
              <p className="text-xs uppercase tracking-widest text-violet-300 font-bold mb-3 text-center">
                Bonus: more profit, not just less cost
              </p>
              {/* Restructured dual stats — Tier 1 #5 fix 2026-05-06.
                  Big numbers ("+35%" / "+40%") visually align across
                  both cards because the noun ("ROI lift" / "more
                  revenue") moved to a subtitle. Previously "+40% revenue"
                  wrapped to 2 lines while "+35% ROI" fit on 1, creating
                  asymmetry. Now both cards share the same rhythm. */}
              <div className="grid sm:grid-cols-2 gap-3">
                {/* AI efficiency stat */}
                <div className="rounded-2xl border border-violet-500/30 bg-violet-500/[0.06] p-5">
                  <div className="flex items-start gap-3">
                    <span className="text-3xl shrink-0 leading-none">⚡</span>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-violet-300/80 font-semibold mb-1">
                        AI vs manual
                      </p>
                      <p className="text-3xl sm:text-4xl font-black text-violet-200 leading-none mb-1">
                        +35%
                      </p>
                      <p className="text-sm text-violet-300/90 font-semibold mb-2">
                        ROI lift
                      </p>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        AI-driven systems beat manual agency campaigns by
                        ~35% on average. Same ad spend, more leads.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Custom-build / personalization stat */}
                <div className="rounded-2xl border border-fuchsia-500/30 bg-fuchsia-500/[0.06] p-5">
                  <div className="flex items-start gap-3">
                    <span className="text-3xl shrink-0 leading-none">🎯</span>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-fuchsia-300/80 font-semibold mb-1">
                        Custom vs templated
                      </p>
                      <p className="text-3xl sm:text-4xl font-black text-fuchsia-200 leading-none mb-1">
                        +40%
                      </p>
                      <p className="text-sm text-fuchsia-300/90 font-semibold mb-2">
                        more revenue
                      </p>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Companies that personalize at scale earn 40% more
                        than those running cookie-cutter playbooks.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed mt-3 text-center">
                Sources: McKinsey &quot;Next in Personalization&quot;,
                Salesforce marketing-AI research. Ad-optimization alone
                cuts cost-per-acquisition by ~41% vs manual.
              </p>
            </div>

            {/* 5. Side-by-side comparison — full-cost view incl. ad
                spend on both sides so prospects see the apples-to-apples
                total. The savings come from the retainer line, not ads.

                Caption above bridges the math-card → side-by-side
                discontinuity (Tier 1 #3 fix 2026-05-06). The math card
                shows agency = $72K (retainer only); the side-by-side
                shows agency = $108K (retainer + ad spend). Without this
                caption prospects wonder why two different agency totals.
            */}
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold mb-3 text-center">
                The full picture · with ad spend on both sides
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="rounded-2xl border border-rose-500/30 bg-rose-500/5 p-5">
                  <p className="text-xs uppercase tracking-wider text-rose-300 font-semibold mb-2">
                    Stay with agency · 3 years
                  </p>
                <p className="text-3xl font-black text-white tabular-nums mb-3">
                  {fmtMoney(math.threeYearAgencyCost)}
                </p>
                <ul className="space-y-1.5 text-xs text-slate-400">
                  <li>• {fmtMoney(math.threeYearRetainer)} agency fee (gone forever)</li>
                  <li>• {fmtMoney(math.threeYearAdSpend)} ad spend to Google/Meta</li>
                  <li>• {PROJECTION_MONTHS} months of recurring payments</li>
                  <li>• You own nothing when you stop</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5">
                <p className="text-xs uppercase tracking-wider text-amber-300 font-semibold mb-2">
                  BlueJays AI System · 3 years
                </p>
                <p className="text-3xl font-black text-white tabular-nums mb-3">
                  {fmtMoney(math.bluejaysFullCost)}
                </p>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  <li>• {fmtMoney(BLUEJAYS_SETUP_COST)} ONCE · never again</li>
                  <li>• {fmtMoney(math.threeYearAdSpend)} ad spend (yours, same as before)</li>
                  <li>• Pay in full or 3 splits ($3,500 + $3,500 + $3,000)</li>
                  <li>• You own the system forever</li>
                </ul>
              </div>
              </div>
            </div>

            {/* 6. What you'd own */}
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

            {/* 7. Social proof — Q6D personalization 2026-05-06.
                Industry-shape match drives which case study lands FIRST
                (and bigger). Manufacturer / industrial / trade slugs →
                ITC first. Sports / consumer / retail slugs → Zenith
                first. Service / professional / unknown → both equal.
                Per CLAUDE.md "Social Proof Must Use Real Data Or Be
                Removed" — both are real closed clients. */}
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/20 p-5 sm:p-6">
              <p className="text-xs uppercase tracking-widest text-emerald-300 font-bold mb-4">
                {industry === "manufacturer" ||
                industry === "trade" ||
                industry === "construction" ||
                industry === "auto" ||
                industry === "agriculture" ||
                industry === "hvac" ||
                industry === "electrician" ||
                industry === "plumber" ||
                industry === "roofing"
                  ? "From a builder like you"
                  : industry === "sports" ||
                      industry === "consumer" ||
                      industry === "retail" ||
                      industry === "ecommerce" ||
                      industry === "apparel" ||
                      industry === "kids" ||
                      industry === "fitness" ||
                      industry === "food" ||
                      industry === "beverage"
                    ? "From a brand like you"
                    : "Real businesses · Real systems"}
              </p>
              <div className="space-y-4">
                {/* Reorder anchors so the "your-shape" example lands
                    first. Manufacturer-shape → ITC tile first. Brand-
                    shape → Zenith tile first. Other → keep current
                    order (Zenith first, ITC second). */}
                {(industry === "manufacturer" ||
                  industry === "trade" ||
                  industry === "construction" ||
                  industry === "auto" ||
                  industry === "agriculture" ||
                  industry === "hvac" ||
                  industry === "electrician" ||
                  industry === "plumber" ||
                  industry === "roofing") ? (
                  <>
                    <div className="flex gap-3">
                      <span className="text-2xl shrink-0 leading-none">🚜</span>
                      <div>
                        <p className="text-sm text-slate-200 leading-relaxed mb-1">
                          <span className="font-bold text-white">ITC Quick Attach</span>
                          {" "}— custom tractor parts in Blossvale, NY. Patent-protected product, dealer + end-buyer audiences. Took their first DTC orders 30 days after launch.
                        </p>
                        <p className="text-[11px] text-slate-500 italic">— Jake, owner</p>
                      </div>
                    </div>
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
                  </>
                ) : (
                  <>
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
                  </>
                )}
              </div>
            </div>
            </>
            )}{/* end gateUnlocked block (Q1B soft gate) */}

            {/* 8. Re-edit */}
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

        {/* SUBMITTED — thank-you (Q6D personalization 2026-05-06).
            The headline + body + CTA dispatch on the timeline answer.
            Urgent prospects get a "Ben texts in 15 min" hook; patient
            prospects get the slow-warm "we'll send you a plan" frame. */}
        {stage === "submitted" && (
          <div className="text-center space-y-8 py-8">
            <div>
              <div className="text-6xl mb-4">✅</div>
              <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">
                {timeline === "this_month"
                  ? `You're up next, ${name.split(" ")[0]}.`
                  : timeline === "60_90_days"
                    ? `Got it, ${name.split(" ")[0]}. Plan landing soon.`
                    : `Thanks, ${name.split(" ")[0]}. No rush.`}
              </h1>
              <p className="text-base text-slate-300 max-w-md mx-auto leading-relaxed">
                {timeline === "this_month" ? (
                  <>
                    You said you&apos;re ready this month — Ben will text
                    you within an hour to set up a 15-minute walkthrough.
                    Your plan just landed in{" "}
                    <span className="text-amber-300">{email}</span>.
                  </>
                ) : timeline === "60_90_days" ? (
                  <>
                    Your custom plan is in{" "}
                    <span className="text-amber-300">{email}</span> right
                    now. Ben will follow up personally within 24 hours
                    with a one-page next-30-days outline.
                  </>
                ) : (
                  <>
                    Your savings breakdown just landed in{" "}
                    <span className="text-amber-300">{email}</span>. No
                    sales pressure — read it, share it, and reply when
                    you&apos;re ready.
                  </>
                )}
              </p>
            </div>

            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6 max-w-md mx-auto">
              <p className="text-xs uppercase tracking-widest text-amber-300 font-bold mb-2">
                {timeline === "this_month"
                  ? "Want to lock a slot now?"
                  : "Want to skip the wait?"}
              </p>
              <p className="text-sm text-slate-300 mb-4">
                {timeline === "this_month"
                  ? "Book a free 15-minute walkthrough — Ben shows you the system live."
                  : "Book a free 15-minute walkthrough — Ben shows you the whole system live."}
              </p>
              <Link
                href={BOOK_A_CALL_URL}
                className="inline-flex items-center justify-center w-full rounded-md bg-amber-500 hover:bg-amber-400 text-amber-950 px-6 py-3.5 text-base font-bold shadow-lg transition-colors"
              >
                {timeline === "this_month"
                  ? "Book my walkthrough →"
                  : "Book my walkthrough →"}
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
