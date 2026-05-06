"use client";

/* eslint-disable @next/next/no-img-element */

/**
 * /clients/zenith-sports/camps — Camp Finder Quiz
 *
 * Per Philip + Paul's Saturday-meeting notes:
 *   · Short landing → starts with a question immediately
 *   · 6-step interactive questionnaire, simple UI, mobile-first
 *   · Q1 most important (age) → drives camp matching
 *   · Q2 = US states map → county text input (location)
 *   · Q3-Q5 supporting context (skill / format / timing)
 *   · Q6 = "tell me when camps open near me" + lead capture
 *
 * Submits to /api/clients/inquire with intent="Camp Finder Quiz" and
 * the full quiz snapshot in raw_payload so Philip can match parents
 * to camps as the catalog grows.
 */

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import StickyNav from "../sticky-nav";
import { CAMPS, type Camp } from "./camps-data";
import USStatesMap from "@/components/USStatesMap";
import { COUNTIES_BY_STATE } from "@/data/us-counties";
import {
  TOTAL_US_CAMPS_ESTIMATE,
  CAMPS_BY_STATE,
  AGE_MULTIPLIER,
  SKILL_MULTIPLIER,
  FORMAT_MULTIPLIER,
} from "@/data/camp-estimates";

// Page-local timing multipliers — the question's option ids are
// season-keyed (summer-2026, etc.) and don't match the data file's
// generic season keys. Single source of truth lives here.
const TIMING_FRAC: Record<string, number> = {
  "summer-2026": 0.55,
  "fall-2026": 0.12,
  "winter-2026": 0.08,
  "spring-2027": 0.1,
  any: 1.0,
};

const NAVY = "#0a1832";
const NAVY_DEEP = "#050d1f";
const LIME = "#a3e635";
const ELECTRIC = "#1d4ed8";
const IVORY = "#f5f3ee";

const LOGO =
  "https://zenithsports.org/cdn/shop/files/Zenith_Sports-02-removebg-preview.png";

// ─────────────────────────────────────────────────────────────────────────────
// Quiz state machine
// ─────────────────────────────────────────────────────────────────────────────

type Step =
  | "age"
  | "location"
  | "travel"
  | "skill"
  | "format"
  | "timing"
  | "notify"
  | "results";

type QuizState = {
  /** Up to 2 age bands so an in-between player isn't forced into one. */
  ageGroups: string[];
  state: string;
  county: string;
  /** How far the parent will travel to a camp (one-way miles). */
  travelMiles: number;
  /** Up to 2 skill tiers so a player straddling levels gets both pools. */
  skillLevels: string[];
  formats: string[];
  timing: string;
  parentName: string;
  email: string;
  phone: string;
  playerName: string;
  notifyOptIn: boolean;
};

const INITIAL: QuizState = {
  ageGroups: [],
  state: "",
  county: "",
  travelMiles: 50, // sensible default — most parents drive ~30-60mi to a camp
  skillLevels: [],
  formats: [],
  timing: "",
  parentName: "",
  email: "",
  phone: "",
  playerName: "",
  notifyOptIn: true,
};

// Q1 — Age group. Drives camp matching most directly.
const AGE_GROUPS = [
  { id: "U6-U8", label: "U6 – U8", emoji: "🌱", note: "Just starting out" },
  { id: "U9-U10", label: "U9 – U10", emoji: "⚡", note: "Growing fast" },
  { id: "U11-U12", label: "U11 – U12", emoji: "🎯", note: "Skill-building age" },
  { id: "U13-U14", label: "U13 – U14", emoji: "🔥", note: "Position decisions" },
  { id: "U15-U16", label: "U15 – U16", emoji: "🏆", note: "Tryout & HS prep" },
  { id: "U17-U19", label: "U17 – U19", emoji: "⭐", note: "College recruitment" },
];

// Q3 — Skill level. Cards over slider for fewer-tap UX.
const SKILL_LEVELS = [
  { id: "beginner", label: "Just starting", emoji: "🌱" },
  { id: "rec", label: "Rec / casual", emoji: "⚽" },
  { id: "select", label: "Select / club", emoji: "⚡" },
  { id: "elite", label: "Elite / ECNL", emoji: "🏆" },
];

// Q4 — Camp format preference. Multi-select.
const FORMATS = [
  { id: "day-camp", label: "Day camp", emoji: "☀️", note: "Drop-off mornings" },
  { id: "residential", label: "Residential", emoji: "🏕️", note: "Sleep-away weeks" },
  { id: "clinic", label: "Clinic", emoji: "🎯", note: "1-2 day skill clinics" },
  { id: "demo", label: "Demo / open house", emoji: "👋", note: "Try-it-out events" },
];

// Q5 — Timing window.
const TIMING = [
  { id: "summer-2026", label: "Summer 2026", emoji: "☀️" },
  { id: "fall-2026", label: "Fall break 2026", emoji: "🍂" },
  { id: "winter-2026", label: "Winter 2026/27", emoji: "❄️" },
  { id: "spring-2027", label: "Spring 2027", emoji: "🌸" },
  { id: "any", label: "Any time · keep me posted", emoji: "📅" },
];

const STATE_NAMES: Record<string, string> = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California",
  CO: "Colorado", CT: "Connecticut", DE: "Delaware", FL: "Florida", GA: "Georgia",
  HI: "Hawaii", ID: "Idaho", IL: "Illinois", IN: "Indiana", IA: "Iowa",
  KS: "Kansas", KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland",
  MA: "Massachusetts", MI: "Michigan", MN: "Minnesota", MS: "Mississippi",
  MO: "Missouri", MT: "Montana", NE: "Nebraska", NV: "Nevada", NH: "New Hampshire",
  NJ: "New Jersey", NM: "New Mexico", NY: "New York", NC: "North Carolina",
  ND: "North Dakota", OH: "Ohio", OK: "Oklahoma", OR: "Oregon", PA: "Pennsylvania",
  RI: "Rhode Island", SC: "South Carolina", SD: "South Dakota", TN: "Tennessee",
  TX: "Texas", UT: "Utah", VT: "Vermont", VA: "Virginia", WA: "Washington",
  WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming",
};

const STEPS: Step[] = [
  "age",
  "location",
  "travel",
  "skill",
  "format",
  "timing",
  "notify",
  "results",
];

// Total quiz steps shown to the user (excluding the results page).
const TOTAL_QUESTION_STEPS = STEPS.length - 1;

// ── Camp-availability estimator ────────────────────────────────────────────
//
// Returns an estimated count of US youth-soccer camps still in the funnel
// after the parent's filters are applied. Used for the right-rail % bar
// so the parent watches the pool narrow as they answer.
//
// Methodology:
//   · Start at TOTAL_US_CAMPS_ESTIMATE (~22,000)
//   · State pick: collapse to that state's slice (CAMPS_BY_STATE)
//   · Travel radius INSIDE a state: 0-30mi ≈ 25% of state, 30-100mi ≈ 60%,
//     100-200mi ≈ 100%, 200+ mi spills into neighbors (cap at 1.4x)
//   · Age / skill / format / timing multipliers pulled from camp-estimates
function estimateAvailability(s: QuizState): number {
  let count = TOTAL_US_CAMPS_ESTIMATE;

  // State narrows hardest. Before a state is picked we keep the full pool.
  if (s.state) {
    const stateCount = CAMPS_BY_STATE[s.state] ?? 0;
    // Travel radius gates how much of the state's pool the parent can reach,
    // and lightly spills across borders at the high end.
    const m = s.travelMiles;
    let radiusFrac: number;
    if (m <= 30) radiusFrac = 0.25;
    else if (m <= 60) radiusFrac = 0.45;
    else if (m <= 100) radiusFrac = 0.7;
    else if (m <= 150) radiusFrac = 0.9;
    else if (m <= 200) radiusFrac = 1.0;
    else radiusFrac = Math.min(1.4, 1.0 + (m - 200) / 250);
    count = stateCount * radiusFrac;
  }

  // Age + skill now multi-select (up to 2). Sum the band fractions so an
  // in-between player who picks two adjacent age bands sees the union of
  // both camp pools, not the intersection.
  if (s.ageGroups.length > 0) {
    const sum = s.ageGroups.reduce(
      (acc, id) => acc + (AGE_MULTIPLIER[id] ?? 0.18),
      0,
    );
    count *= Math.min(1, sum);
  }
  if (s.skillLevels.length > 0) {
    const sum = s.skillLevels.reduce(
      (acc, id) => acc + (SKILL_MULTIPLIER[id] ?? 0.3),
      0,
    );
    count *= Math.min(1, sum);
  }
  if (s.formats.length > 0) {
    const sum = s.formats.reduce(
      (acc, id) => acc + (FORMAT_MULTIPLIER[id] ?? 0),
      0,
    );
    count *= Math.min(1, sum);
  }
  if (s.timing && s.timing !== "any") {
    count *= TIMING_FRAC[s.timing] ?? 0.3;
  }

  return Math.max(1, Math.round(count));
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function CampFinderPage() {
  const [step, setStep] = useState<Step>("age");
  const [state, setState] = useState<QuizState>(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const update = <K extends keyof QuizState>(k: K, v: QuizState[K]) =>
    setState((s) => ({ ...s, [k]: v }));

  const toggleFormat = (id: string) =>
    setState((s) => {
      const has = s.formats.includes(id);
      return {
        ...s,
        formats: has ? s.formats.filter((f) => f !== id) : [...s.formats, id],
      };
    });

  // Toggle helper for age + skill — both capped at 2 picks. Tapping a
  // selected option deselects; tapping a 3rd at-cap is a no-op.
  const toggleCapped =
    <K extends "ageGroups" | "skillLevels">(key: K) =>
    (id: string) =>
      setState((s) => {
        const arr = s[key];
        if (arr.includes(id)) {
          return { ...s, [key]: arr.filter((x) => x !== id) };
        }
        if (arr.length >= 2) return s;
        return { ...s, [key]: [...arr, id] };
      });

  const stepIndex = STEPS.indexOf(step);

  // County must validate against the known list for the picked state.
  // The autocomplete UI nudges the parent to pick a real one, but we
  // also enforce here so a free-typed mismatch can't sneak past.
  const validCounty = (() => {
    if (!state.state || !state.county.trim()) return false;
    const list = COUNTIES_BY_STATE[state.state] ?? [];
    return list.some(
      (c) => c.toLowerCase() === state.county.trim().toLowerCase(),
    );
  })();

  const canAdvance = (() => {
    if (step === "age") return state.ageGroups.length >= 1;
    if (step === "location") return state.state !== "" && validCounty;
    if (step === "travel") return state.travelMiles > 0;
    if (step === "skill") return state.skillLevels.length >= 1;
    if (step === "format") return state.formats.length >= 1;
    if (step === "timing") return state.timing !== "";
    if (step === "notify")
      return (
        state.parentName.trim().length >= 2 &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email)
      );
    return false;
  })();

  const submitLead = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const r = await fetch("/api/clients/inquire", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          slug: "zenith-sports",
          name: state.parentName,
          email: state.email,
          phone: state.phone || null,
          intent: `Camp Finder · ${state.ageGroups.join("/")} · ${state.state} ${state.county}`,
          source: "camp-finder-quiz",
          ageGroups: state.ageGroups,
          state: state.state,
          county: state.county,
          travelMiles: state.travelMiles,
          skillLevels: state.skillLevels,
          formats: state.formats,
          timing: state.timing,
          playerName: state.playerName || null,
          notifyOptIn: state.notifyOptIn,
        }),
      });
      const j = (await r.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };
      if (!j.ok) throw new Error(j.error || "Submit failed");
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Couldn't save — try again?");
    } finally {
      setSubmitting(false);
    }
  };

  const next = () => {
    if (!canAdvance) return;
    if (step === "notify") {
      submitLead();
      setStep("results");
      return;
    }
    setStep(STEPS[stepIndex + 1] as Step);
  };

  const back = () => {
    if (stepIndex === 0) return;
    setStep(STEPS[stepIndex - 1] as Step);
  };

  // Match camps from the catalog using the quiz answers (mostly state +
  // age range parsing). When the catalog is empty, the results step
  // shows the notify-confirmation flow.
  const matchedCamps = useMemo(() => {
    if (CAMPS.length === 0) return [];
    return CAMPS.filter((c) => {
      const stateMatch = state.state ? c.state === state.state : true;
      const formatMatch =
        state.formats.length === 0 ? true : state.formats.includes(c.format.toLowerCase().replace(/\s+/g, "-"));
      return stateMatch && formatMatch;
    });
  }, [state.state, state.formats]);

  return (
    <main
      className="min-h-screen text-white"
      style={{
        background: `linear-gradient(180deg, ${NAVY_DEEP} 0%, ${NAVY} 100%)`,
      }}
    >
      <StickyNav
        businessName="Zenith Sports"
        logoSrc={LOGO}
        activePath="main"
      />

      {/* SHORT HEADER — no marketing wall, the quiz IS the page. */}
      <header className="border-b border-white/10">
        <div className="mx-auto max-w-3xl px-5 sm:px-8 py-5 flex items-center justify-between gap-4">
          <Link href="/clients/zenith-sports" className="flex items-center gap-2">
            <img src={LOGO} alt="" className="h-7 w-auto opacity-90" />
            <span className="text-[10px] tracking-[0.22em] uppercase font-bold text-white/60 hidden sm:inline">
              ← TEKKY®
            </span>
          </Link>
          {step !== "results" && step !== "age" && (
            <button
              onClick={back}
              className="text-[11px] tracking-[0.22em] uppercase font-bold text-white/60 hover:text-white"
            >
              ← Back
            </button>
          )}
        </div>
      </header>

      {/* PROGRESS BAR */}
      {step !== "results" && (
        <div className="mx-auto max-w-6xl px-5 sm:px-8 mt-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] tracking-[0.22em] uppercase font-bold text-white/60">
              Step {stepIndex + 1} of {TOTAL_QUESTION_STEPS}
            </span>
            <span className="text-[10px] tracking-[0.22em] uppercase font-bold text-white/40">
              {Math.round(((stepIndex + 1) / TOTAL_QUESTION_STEPS) * 100)}%
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${((stepIndex + 1) / TOTAL_QUESTION_STEPS) * 100}%`,
                background: LIME,
              }}
            />
          </div>
        </div>
      )}

      {/* STEP CONTENT — split layout: question on the left, live
          camp-availability rail on the right that narrows as the
          parent answers. Right rail collapses below the question on
          small screens. */}
      <div className="mx-auto max-w-6xl px-5 sm:px-8 py-8 sm:py-12 pb-24">
        <div
          className={`grid gap-8 ${
            step === "results" || step === "notify"
              ? "grid-cols-1"
              : "grid-cols-1 lg:grid-cols-[1fr_280px]"
          }`}
        >
          <div>
        {step === "age" && (
          <AgeStep
            values={state.ageGroups}
            onToggle={toggleCapped("ageGroups")}
          />
        )}
        {step === "location" && (
          <LocationStep
            stateCode={state.state}
            county={state.county}
            onState={(v) => update("state", v)}
            onCounty={(v) => update("county", v)}
          />
        )}
        {step === "travel" && (
          <TravelStep
            miles={state.travelMiles}
            onChange={(v) => update("travelMiles", v)}
          />
        )}
        {step === "skill" && (
          <SkillStep
            values={state.skillLevels}
            onToggle={toggleCapped("skillLevels")}
          />
        )}
        {step === "format" && (
          <FormatStep
            values={state.formats}
            onToggle={toggleFormat}
          />
        )}
        {step === "timing" && (
          <TimingStep
            value={state.timing}
            onChange={(v) => update("timing", v)}
          />
        )}
        {step === "notify" && (
          <NotifyStep
            state={state}
            update={update}
          />
        )}
        {step === "results" && (
          <ResultsStep
            state={state}
            matchedCamps={matchedCamps}
            submitting={submitting}
            submitError={submitError}
          />
        )}

        {/* NEXT BUTTON */}
        {step !== "results" && (
          <div className="mt-10 flex items-center justify-between">
            <div className="text-[11px] text-white/40">
              {step === "notify" ? "We'll only email when there's a real camp match — no spam." : ""}
            </div>
            <button
              onClick={next}
              disabled={!canAdvance}
              className="text-sm font-bold uppercase tracking-wider px-6 py-3 rounded-full transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              style={{
                background: canAdvance ? LIME : "#334155",
                color: canAdvance ? NAVY_DEEP : "#94a3b8",
              }}
            >
              {step === "notify" ? "Find my camps →" : "Next →"}
            </button>
          </div>
        )}
          </div>

          {/* Right rail · live camp-availability tracker. Hidden on
              the lead-capture + results steps (no more filtering to do). */}
          {step !== "results" && step !== "notify" && (
            <AvailabilityRail state={state} step={step} />
          )}
        </div>
      </div>
    </main>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Q1 · Age (the most important question)
// ─────────────────────────────────────────────────────────────────────────────

function AgeStep({
  values,
  onToggle,
}: {
  values: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <div>
      <p className="text-[11px] tracking-[0.32em] uppercase font-bold mb-3" style={{ color: LIME }}>
        Question 1 of 7
      </p>
      <h1 className="text-3xl sm:text-5xl font-black leading-tight mb-3">
        How old is your player?
      </h1>
      <p className="text-base text-white/60 mb-2 leading-relaxed">
        Pick the closest band — or two if your player is in between. Camp
        programming is built around the age group, so picking both unlocks
        more matches.
      </p>
      <p className="text-[11px] uppercase tracking-[0.18em] font-bold text-white/40 mb-6">
        {values.length} / 2 selected
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {AGE_GROUPS.map((opt) => {
          const active = values.includes(opt.id);
          const atCap = !active && values.length >= 2;
          return (
            <button
              key={opt.id}
              onClick={() => onToggle(opt.id)}
              disabled={atCap}
              className={`relative text-left rounded-xl p-4 border-2 transition-all ${
                active
                  ? "bg-lime-300 border-lime-300 text-slate-950 hover:scale-[1.02]"
                  : atCap
                    ? "bg-white/[0.02] border-white/5 opacity-40 cursor-not-allowed"
                    : "bg-white/5 border-white/10 hover:border-lime-300/40 hover:scale-[1.02]"
              }`}
            >
              {active && (
                <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-slate-950 text-lime-300 text-xs font-black flex items-center justify-center">
                  ✓
                </span>
              )}
              <div className="text-2xl mb-1.5">{opt.emoji}</div>
              <div className={`text-base font-bold ${active ? "text-slate-950" : "text-white"}`}>
                {opt.label}
              </div>
              <div
                className={`text-xs mt-0.5 ${active ? "text-slate-700" : "text-white/50"}`}
              >
                {opt.note}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Q2 · Location · State map → County
// ─────────────────────────────────────────────────────────────────────────────

function LocationStep({
  stateCode,
  county,
  onState,
  onCounty,
}: {
  stateCode: string;
  county: string;
  onState: (v: string) => void;
  onCounty: (v: string) => void;
}) {
  return (
    <div>
      <p className="text-[11px] tracking-[0.32em] uppercase font-bold mb-3" style={{ color: LIME }}>
        Question 2 of 7
      </p>
      <h1 className="text-3xl sm:text-5xl font-black leading-tight mb-3">
        Where do you live?
      </h1>
      <p className="text-base text-white/60 mb-6 leading-relaxed">
        Tap your state on the map. We&apos;ll match camps within driving
        distance.
      </p>

      {/* Real US map · Albers projection. SVG path data per state means
          the shape is recognizable, not a square grid. Active state is
          highlighted in lime. */}
      <div className="rounded-2xl border border-white/10 bg-black/30 p-3 sm:p-4 mb-5">
        <USStatesMap
          selected={stateCode || undefined}
          onSelect={(code) => {
            onState(code);
            // Clear county whenever the state changes — different list.
            onCounty("");
          }}
        />
        {stateCode && (
          <p className="text-center text-xs text-white/60 mt-3">
            <span className="font-bold" style={{ color: LIME }}>
              {STATE_NAMES[stateCode] ?? stateCode}
            </span>{" "}
            selected. Pick your county below.
          </p>
        )}
      </div>

      {/* County autocomplete — must be a real US county */}
      {stateCode && (
        <CountyAutocomplete
          stateCode={stateCode}
          value={county}
          onChange={onCounty}
        />
      )}
    </div>
  );
}

// County autocomplete · the full US-counties list is the source of truth.
// Free-typed values that don't match are rejected by canAdvance (the parent
// stepper) so we always end up with a real, matchable county.
function CountyAutocomplete({
  stateCode,
  value,
  onChange,
}: {
  stateCode: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);

  const counties = useMemo<string[]>(
    () => COUNTIES_BY_STATE[stateCode] ?? [],
    [stateCode],
  );

  const matches = useMemo(() => {
    const q = value.trim().toLowerCase();
    if (!q) return counties.slice(0, 8);
    return counties
      .filter((c) => c.toLowerCase().includes(q))
      .slice(0, 8);
  }, [value, counties]);

  const isExactMatch = counties.some(
    (c) => c.toLowerCase() === value.trim().toLowerCase(),
  );

  // Close the dropdown on outside click — keeps the keyboard tidy on
  // mobile and stops the list from hovering over the Next button.
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div ref={wrapRef} className="relative">
      <label className="block text-[10px] tracking-[0.22em] uppercase font-bold text-white/60 mb-2">
        What county?
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
          setHighlight(0);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (!open && (e.key === "ArrowDown" || e.key === "Enter")) {
            setOpen(true);
            return;
          }
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlight((h) => Math.min(matches.length - 1, h + 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlight((h) => Math.max(0, h - 1));
          } else if (e.key === "Enter" && matches[highlight]) {
            e.preventDefault();
            onChange(matches[highlight]!);
            setOpen(false);
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
        placeholder="Start typing — pick from the list"
        className={`w-full rounded-xl bg-white/5 border-2 px-4 py-3 text-base text-white placeholder:text-white/30 focus:outline-none transition ${
          isExactMatch
            ? "border-lime-300/60"
            : value
              ? "border-amber-400/40"
              : "border-white/10 focus:border-lime-300/60"
        }`}
        autoFocus
        autoComplete="off"
      />
      {open && matches.length > 0 && (
        <ul
          className="absolute z-10 mt-1 left-0 right-0 max-h-60 overflow-auto rounded-xl border border-white/10 bg-[#0a1628] shadow-xl shadow-black/60"
          role="listbox"
        >
          {matches.map((c, i) => (
            <li
              key={c}
              role="option"
              aria-selected={i === highlight}
              onMouseDown={(e) => {
                // mousedown not click — beats the input's blur race.
                e.preventDefault();
                onChange(c);
                setOpen(false);
              }}
              onMouseEnter={() => setHighlight(i)}
              className={`px-4 py-2.5 text-sm cursor-pointer transition ${
                i === highlight
                  ? "bg-lime-300/15 text-lime-200"
                  : "text-white/85 hover:bg-white/5"
              }`}
            >
              {c}
              <span className="text-white/30 text-xs ml-1">
                {STATE_NAMES[stateCode] ? "" : ""}
              </span>
            </li>
          ))}
        </ul>
      )}
      {value && !isExactMatch && !open && (
        <p className="text-[11px] text-amber-300/80 mt-1.5">
          Pick a county from the list to continue.
        </p>
      )}
      {!value && (
        <p className="text-[11px] text-white/40 italic mt-1.5">
          {counties.length} counties in {STATE_NAMES[stateCode] ?? stateCode}.
        </p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Q · Travel · slider with a car icon that drives along the bar
// ─────────────────────────────────────────────────────────────────────────────

function TravelStep({
  miles,
  onChange,
}: {
  miles: number;
  onChange: (v: number) => void;
}) {
  const MIN = 5;
  const MAX = 300;
  const pct = Math.min(100, Math.max(0, ((miles - MIN) / (MAX - MIN)) * 100));
  const approxHours = Math.max(0.1, miles / 55);
  const carScale = 0.9 + (pct / 100) * 0.6; // grows from 0.9x → 1.5x as miles climb

  // Tier labels keep the answer feeling concrete.
  const tier =
    miles <= 30
      ? { label: "Right around the corner", emoji: "🏠" }
      : miles <= 75
        ? { label: "Easy weekday drive", emoji: "🚗" }
        : miles <= 150
          ? { label: "Weekend road trip", emoji: "🛣️" }
          : miles <= 250
            ? { label: "Big day out", emoji: "🗺️" }
            : { label: "Anywhere in driving range", emoji: "🌎" };

  return (
    <div>
      <p
        className="text-[11px] tracking-[0.32em] uppercase font-bold mb-3"
        style={{ color: LIME }}
      >
        Question 3 of 7
      </p>
      <h1 className="text-3xl sm:text-5xl font-black leading-tight mb-3">
        How far can you travel?
      </h1>
      <p className="text-base text-white/60 mb-8 leading-relaxed">
        Drag the slider — the car shows your reach. Wider radius = more camps
        on the table.
      </p>

      {/* Read-out card */}
      <div
        className="rounded-2xl border-2 p-5 mb-6"
        style={{
          borderColor: `${LIME}40`,
          background:
            "linear-gradient(135deg, rgba(163,230,53,0.08) 0%, rgba(29,78,216,0.05) 100%)",
        }}
      >
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <div className="text-[10px] uppercase tracking-[0.22em] font-bold text-white/50 mb-1">
              {tier.emoji} {tier.label}
            </div>
            <div className="text-4xl sm:text-5xl font-black tabular-nums leading-none">
              {miles}
              <span className="text-xl text-white/50 font-normal ml-2">
                miles
              </span>
            </div>
            <div className="text-[11px] text-white/45 mt-1.5">
              ≈ {approxHours.toFixed(1)} hour{approxHours >= 1.5 ? "s" : ""} each way
            </div>
          </div>
        </div>
      </div>

      {/* Highway · car drives along the bar as miles increase */}
      <div className="relative pt-6 pb-3">
        {/* Distance markers */}
        <div className="flex justify-between text-[10px] uppercase tracking-wider text-white/35 mb-2 px-1">
          <span>5 mi</span>
          <span>50</span>
          <span>100</span>
          <span>200</span>
          <span>300+</span>
        </div>

        {/* Highway road */}
        <div className="relative h-12 rounded-full overflow-hidden border border-white/10"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 50%, rgba(255,255,255,0.04) 100%)",
          }}
        >
          {/* Filled progress (lime gradient) */}
          <div
            className="absolute inset-y-0 left-0 transition-all duration-200"
            style={{
              width: `${pct}%`,
              background:
                "linear-gradient(90deg, rgba(163,230,53,0.55) 0%, rgba(163,230,53,0.85) 100%)",
            }}
          />
          {/* Dashed lane stripes */}
          <div
            className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[3px]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(90deg, rgba(255,255,255,0.55) 0px, rgba(255,255,255,0.55) 14px, transparent 14px, transparent 28px)",
            }}
          />
          {/* Car emoji marker — slides + grows with miles */}
          <div
            className="absolute top-1/2 transition-all duration-200 pointer-events-none"
            style={{
              left: `calc(${pct}% - 16px)`,
              // 🚗 emoji faces left by default — flip horizontally so the
              // car drives rightward as miles increase.
              transform: `translateY(-50%) scale(${carScale}) scaleX(-1)`,
              filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.5))",
              fontSize: 28,
              lineHeight: 1,
            }}
            aria-hidden
          >
            🚗
          </div>
        </div>

        {/* Slider input — overlaid invisibly so the styled bar above
            renders the visual + the native input handles touch / a11y. */}
        <input
          type="range"
          min={MIN}
          max={MAX}
          step={5}
          value={miles}
          onChange={(e) => onChange(parseInt(e.target.value, 10))}
          aria-label="Travel distance in miles"
          className="absolute inset-x-0 top-6 h-12 w-full opacity-0 cursor-pointer"
        />
      </div>

      <p className="text-[11px] text-white/40 italic mt-4">
        Most parents drive 30-60 miles for a great camp. Big-name residential
        camps pull from 200+ mile radii.
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Right-rail · live camp-availability tracker
// ─────────────────────────────────────────────────────────────────────────────
//
// Shows the user a percentage of US camps remaining as their answers
// narrow the pool. Designed so each answer visibly moves the needle —
// makes the experience feel responsive + invests them in finishing.
function AvailabilityRail({
  state,
  step,
}: {
  state: QuizState;
  step: Step;
}) {
  const count = useMemo(() => estimateAvailability(state), [state]);
  const pct = Math.min(100, (count / TOTAL_US_CAMPS_ESTIMATE) * 100);
  // Bar color: green (lots of camps) → amber (narrowing) → blue (focused).
  const barColor =
    pct > 25 ? LIME : pct > 5 ? "#fbbf24" : ELECTRIC;

  // Step-specific commentary so the rail teaches as it updates.
  const note =
    step === "age"
      ? "Pick an age band → narrows by participation share"
      : step === "location"
        ? "Pick your state → collapses to local catalog"
        : step === "travel"
          ? "Wider radius = more camps on the table"
          : step === "skill"
            ? "Skill picks tier of programming"
            : step === "format"
              ? "Format trims to day / residential / clinic"
              : step === "timing"
                ? "Season slices the calendar"
                : "";

  return (
    <aside className="lg:sticky lg:top-6 lg:self-start">
      <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
        <div className="text-[10px] tracking-[0.28em] uppercase font-bold text-white/55 mb-1">
          Camps in your funnel
        </div>
        <div className="flex items-baseline gap-2 mb-4">
          <span
            className="text-4xl font-black tabular-nums tracking-tighter transition-all duration-300"
            style={{ color: barColor }}
          >
            {count.toLocaleString()}
          </span>
          <span className="text-[11px] text-white/45">
            of {TOTAL_US_CAMPS_ESTIMATE.toLocaleString()}
          </span>
        </div>

        {/* Vertical bar — fills bottom-up so narrowing visibly drains it */}
        <div className="flex gap-3 items-stretch">
          <div className="relative w-3 h-40 rounded-full bg-white/[0.06] overflow-hidden">
            <div
              className="absolute bottom-0 left-0 right-0 transition-all duration-500"
              style={{
                height: `${pct}%`,
                background: `linear-gradient(180deg, ${barColor} 0%, ${barColor}99 100%)`,
              }}
            />
          </div>
          <div className="flex-1 flex flex-col justify-between text-[10px] uppercase tracking-wider text-white/35 py-0.5">
            <span>100%</span>
            <span>50%</span>
            <span>0%</span>
          </div>
        </div>

        <div className="mt-4 text-[11px] leading-relaxed text-white/55">
          {pct.toFixed(pct < 1 ? 2 : 1)}% of US camps still match.
          {note && <span className="block mt-1.5 text-white/40">{note}</span>}
        </div>

        {/* Per-filter breakdown so the parent sees what's been applied. */}
        <ul className="mt-4 pt-4 border-t border-white/10 space-y-1.5 text-[11px]">
          <RailRow
            on={state.ageGroups.length > 0}
            label="Age"
            value={state.ageGroups.join(" + ")}
          />
          <RailRow
            on={!!state.state}
            label="State"
            value={STATE_NAMES[state.state] ?? state.state}
          />
          <RailRow
            on={!!state.county}
            label="County"
            value={state.county}
          />
          <RailRow
            on={state.travelMiles !== INITIAL.travelMiles}
            label="Travel"
            value={state.travelMiles ? `${state.travelMiles} mi` : ""}
          />
          <RailRow
            on={state.skillLevels.length > 0}
            label="Skill"
            value={state.skillLevels.join(" + ")}
          />
          <RailRow
            on={state.formats.length > 0}
            label="Format"
            value={state.formats.join(", ")}
          />
          <RailRow on={!!state.timing} label="When" value={state.timing} />
        </ul>
      </div>
    </aside>
  );
}

function RailRow({
  on,
  label,
  value,
}: {
  on: boolean;
  label: string;
  value: string;
}) {
  return (
    <li className="flex items-center justify-between gap-2">
      <span
        className={`uppercase tracking-wider ${
          on ? "text-white/65" : "text-white/25"
        }`}
      >
        {label}
      </span>
      <span
        className={`tabular-nums truncate ml-2 ${
          on ? "text-lime-300" : "text-white/30"
        }`}
        style={{ maxWidth: 130 }}
      >
        {on ? (value || "—") : "—"}
      </span>
    </li>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Q3 · Skill level
// ─────────────────────────────────────────────────────────────────────────────

function SkillStep({
  values,
  onToggle,
}: {
  values: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <div>
      <p className="text-[11px] tracking-[0.32em] uppercase font-bold mb-3" style={{ color: LIME }}>
        Question 4 of 7
      </p>
      <h1 className="text-3xl sm:text-5xl font-black leading-tight mb-3">
        Where are they at?
      </h1>
      <p className="text-base text-white/60 mb-2 leading-relaxed">
        Pick the closest level — or two if they straddle. Beginner camps feel
        different from elite tryout-prep camps; picking two adjacent tiers
        opens more matches.
      </p>
      <p className="text-[11px] uppercase tracking-[0.18em] font-bold text-white/40 mb-6">
        {values.length} / 2 selected
      </p>

      <div className="grid grid-cols-2 gap-2">
        {SKILL_LEVELS.map((opt) => {
          const active = values.includes(opt.id);
          const atCap = !active && values.length >= 2;
          return (
            <button
              key={opt.id}
              onClick={() => onToggle(opt.id)}
              disabled={atCap}
              className={`relative text-left rounded-xl p-5 border-2 transition-all ${
                active
                  ? "bg-lime-300 border-lime-300 text-slate-950 hover:scale-[1.02]"
                  : atCap
                    ? "bg-white/[0.02] border-white/5 opacity-40 cursor-not-allowed"
                    : "bg-white/5 border-white/10 hover:border-lime-300/40 hover:scale-[1.02]"
              }`}
            >
              {active && (
                <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-slate-950 text-lime-300 text-xs font-black flex items-center justify-center">
                  ✓
                </span>
              )}
              <div className="text-3xl mb-2">{opt.emoji}</div>
              <div className={`text-base font-bold ${active ? "text-slate-950" : "text-white"}`}>
                {opt.label}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Q4 · Format preference (multi-select)
// ─────────────────────────────────────────────────────────────────────────────

function FormatStep({
  values,
  onToggle,
}: {
  values: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <div>
      <p className="text-[11px] tracking-[0.32em] uppercase font-bold mb-3" style={{ color: LIME }}>
        Question 5 of 7
      </p>
      <h1 className="text-3xl sm:text-5xl font-black leading-tight mb-3">
        What format works for your family?
      </h1>
      <p className="text-base text-white/60 mb-8 leading-relaxed">
        Pick any that work — we&apos;ll surface camps that match.
      </p>

      <div className="grid grid-cols-2 gap-2">
        {FORMATS.map((opt) => {
          const active = values.includes(opt.id);
          return (
            <button
              key={opt.id}
              onClick={() => onToggle(opt.id)}
              className={`relative text-left rounded-xl p-4 border-2 transition-all hover:scale-[1.02] ${
                active
                  ? "bg-lime-300 border-lime-300 text-slate-950"
                  : "bg-white/5 border-white/10 hover:border-lime-300/40"
              }`}
            >
              {active && (
                <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-slate-950 text-lime-300 text-xs font-black flex items-center justify-center">
                  ✓
                </span>
              )}
              <div className="text-2xl mb-1.5">{opt.emoji}</div>
              <div className={`text-base font-bold ${active ? "text-slate-950" : "text-white"}`}>
                {opt.label}
              </div>
              <div
                className={`text-xs mt-0.5 ${active ? "text-slate-700" : "text-white/50"}`}
              >
                {opt.note}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Q5 · Timing
// ─────────────────────────────────────────────────────────────────────────────

function TimingStep({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <p className="text-[11px] tracking-[0.32em] uppercase font-bold mb-3" style={{ color: LIME }}>
        Question 6 of 7
      </p>
      <h1 className="text-3xl sm:text-5xl font-black leading-tight mb-3">
        When are you looking?
      </h1>
      <p className="text-base text-white/60 mb-8 leading-relaxed">
        Helps us alert you when camps in your window go live.
      </p>

      <div className="space-y-2">
        {TIMING.map((opt) => {
          const active = value === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => onChange(opt.id)}
              className={`w-full text-left rounded-xl p-4 border-2 transition-all flex items-center gap-3 ${
                active
                  ? "bg-lime-300 border-lime-300 text-slate-950"
                  : "bg-white/5 border-white/10 hover:border-lime-300/40"
              }`}
            >
              <span className="text-2xl">{opt.emoji}</span>
              <span className={`text-base font-bold ${active ? "text-slate-950" : "text-white"}`}>
                {opt.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Q6 · Notify (lead capture)
// ─────────────────────────────────────────────────────────────────────────────

function NotifyStep({
  state,
  update,
}: {
  state: QuizState;
  update: <K extends keyof QuizState>(k: K, v: QuizState[K]) => void;
}) {
  return (
    <div>
      <p className="text-[11px] tracking-[0.32em] uppercase font-bold mb-3" style={{ color: LIME }}>
        Last question
      </p>
      <h1 className="text-3xl sm:text-5xl font-black leading-tight mb-3">
        Where should we send your matches?
      </h1>
      <p className="text-base text-white/60 mb-8 leading-relaxed">
        We&apos;ll send camps that fit — and notify you the moment new ones open
        near {state.county || "you"}, {state.state || "your area"}.
      </p>

      <div className="space-y-3">
        <div>
          <label className="block text-[10px] tracking-[0.22em] uppercase font-bold text-white/60 mb-1.5">
            Your name *
          </label>
          <input
            type="text"
            value={state.parentName}
            onChange={(e) => update("parentName", e.target.value)}
            placeholder="Sarah Williams"
            className="w-full rounded-xl bg-white/5 border-2 border-white/10 px-4 py-3 text-base text-white placeholder:text-white/30 focus:outline-none focus:border-lime-300/60"
          />
        </div>

        <div>
          <label className="block text-[10px] tracking-[0.22em] uppercase font-bold text-white/60 mb-1.5">
            Email *
          </label>
          <input
            type="email"
            value={state.email}
            onChange={(e) => update("email", e.target.value)}
            placeholder="sarah@example.com"
            className="w-full rounded-xl bg-white/5 border-2 border-white/10 px-4 py-3 text-base text-white placeholder:text-white/30 focus:outline-none focus:border-lime-300/60"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] tracking-[0.22em] uppercase font-bold text-white/60 mb-1.5">
              Player&apos;s name (optional)
            </label>
            <input
              type="text"
              value={state.playerName}
              onChange={(e) => update("playerName", e.target.value)}
              placeholder="Maya"
              className="w-full rounded-xl bg-white/5 border-2 border-white/10 px-4 py-3 text-base text-white placeholder:text-white/30 focus:outline-none focus:border-lime-300/60"
            />
          </div>

          <div>
            <label className="block text-[10px] tracking-[0.22em] uppercase font-bold text-white/60 mb-1.5">
              Phone (optional)
            </label>
            <input
              type="tel"
              value={state.phone}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="(555) 123-4567"
              className="w-full rounded-xl bg-white/5 border-2 border-white/10 px-4 py-3 text-base text-white placeholder:text-white/30 focus:outline-none focus:border-lime-300/60"
            />
          </div>
        </div>

        <label className="flex items-start gap-3 mt-5 cursor-pointer p-4 rounded-xl bg-lime-300/10 border-2 border-lime-300/30">
          <input
            type="checkbox"
            checked={state.notifyOptIn}
            onChange={(e) => update("notifyOptIn", e.target.checked)}
            className="mt-0.5 w-5 h-5 accent-lime-400 cursor-pointer"
          />
          <span className="text-sm leading-relaxed">
            <strong className="text-white">Yes — notify me</strong> when new
            camps open near {state.state ? STATE_NAMES[state.state] : "me"}.
            <span className="block text-xs text-white/50 mt-1">
              First-look access. We email when there&apos;s a real fit, not on a
              schedule.
            </span>
          </span>
        </label>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Results — matched camps OR notify-confirmation
// ─────────────────────────────────────────────────────────────────────────────

function ResultsStep({
  state,
  matchedCamps,
  submitting,
  submitError,
}: {
  state: QuizState;
  matchedCamps: Camp[];
  submitting: boolean;
  submitError: string | null;
}) {
  const hasMatches = matchedCamps.length > 0;

  return (
    <div>
      {submitting && (
        <p className="text-center text-white/60 mb-4 text-sm">
          Saving your match request…
        </p>
      )}

      <div className="text-center mb-8">
        <div className="text-5xl mb-3">🎯</div>
        <h1 className="text-3xl sm:text-4xl font-black mb-2">
          {hasMatches
            ? `${matchedCamps.length} camp${matchedCamps.length === 1 ? "" : "s"} match`
            : "You're on the list"}
        </h1>
        <p className="text-base text-white/60 max-w-md mx-auto leading-relaxed">
          {hasMatches
            ? `Thanks ${state.parentName}. Here are camps that fit your ${state.ageGroups.join(" + ")} player in ${state.county}, ${state.state}.`
            : `Thanks ${state.parentName}. We'll email ${state.email} the moment a camp opens for ${state.ageGroups.join(" + ")} players in ${state.county}, ${state.state}.`}
        </p>
      </div>

      {submitError && (
        <p className="text-rose-300 text-center text-sm mb-4 bg-rose-500/10 border border-rose-500/30 rounded-md px-3 py-2 max-w-md mx-auto">
          {submitError}
        </p>
      )}

      {hasMatches ? (
        <div className="grid sm:grid-cols-2 gap-3">
          {matchedCamps.map((camp) => (
            <CampCard key={camp.id} camp={camp} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border-2 border-lime-300/30 bg-lime-300/5 p-6 max-w-md mx-auto text-center">
          <p className="text-base font-bold mb-2" style={{ color: LIME }}>
            What happens next
          </p>
          <ul className="space-y-2 text-sm text-white/70 text-left">
            <li>· You&apos;ll get one welcome email today (drill of the week)</li>
            <li>· When a camp opens for {state.ageGroups.join(" + ")} in {state.county}, you get FIRST-look access</li>
            <li>· Maximum 1-2 emails per month, ever</li>
            <li>· Unsubscribe anytime, no friction</li>
          </ul>
          <Link
            href="/clients/zenith-sports/build-your-player"
            className="inline-block mt-5 text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-full"
            style={{ background: LIME, color: NAVY_DEEP }}
          >
            While you wait → Build a training plan
          </Link>
        </div>
      )}

      {/* Cross-sell to other Zenith funnels */}
      <div className="mt-12 pt-8 border-t border-white/10 text-center">
        <p className="text-[11px] tracking-[0.22em] uppercase font-bold text-white/40 mb-4">
          What else?
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/clients/zenith-sports/build-your-player"
            className="text-sm font-bold px-5 py-2.5 rounded-full border border-white/20 hover:bg-white/10"
          >
            🎮 Build Your Player
          </Link>
          <Link
            href="/clients/zenith-sports/training-guide"
            className="text-sm font-bold px-5 py-2.5 rounded-full border border-white/20 hover:bg-white/10"
          >
            📘 Coach Training Guide
          </Link>
          <Link
            href="/clients/zenith-sports/shop"
            className="text-sm font-bold px-5 py-2.5 rounded-full border border-white/20 hover:bg-white/10"
            style={{ borderColor: LIME, color: LIME }}
          >
            ⚽ Shop TEKKY ball
          </Link>
        </div>
      </div>
    </div>
  );
}

function CampCard({ camp }: { camp: Camp }) {
  return (
    <div
      className="rounded-xl p-5"
      style={{ backgroundColor: IVORY, color: NAVY_DEEP }}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-bold text-base leading-tight">{camp.name}</h3>
        {camp.ballIncluded && (
          <span className="text-[9px] uppercase tracking-wider font-black px-1.5 py-0.5 rounded shrink-0" style={{ background: LIME, color: NAVY_DEEP }}>
            ⚽ ball
          </span>
        )}
      </div>
      <p className="text-xs text-slate-700 mb-2">
        {camp.city}, {camp.state} · {camp.format} · {camp.ageRange}
      </p>
      {camp.blurb && <p className="text-xs text-slate-600 leading-relaxed mb-3">{camp.blurb}</p>}
      {camp.url && (
        <a
          href={camp.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-[11px] uppercase tracking-wider font-bold"
          style={{ color: ELECTRIC }}
        >
          Camp page ↗
        </a>
      )}
    </div>
  );
}
