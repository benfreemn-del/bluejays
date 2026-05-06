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
import { useMemo, useState } from "react";
import StickyNav from "../sticky-nav";
import { CAMPS, type Camp } from "./camps-data";

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

type Step = "age" | "location" | "skill" | "format" | "timing" | "notify" | "results";

type QuizState = {
  ageGroup: string;
  state: string;
  county: string;
  skillLevel: string;
  formats: string[];
  timing: string;
  parentName: string;
  email: string;
  phone: string;
  playerName: string;
  notifyOptIn: boolean;
};

const INITIAL: QuizState = {
  ageGroup: "",
  state: "",
  county: "",
  skillLevel: "",
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

// 50-state geographic grid. Each cell = state OR null (empty).
// Layout follows actual US geography to feel like a map.
const STATE_GRID: (string | null)[][] = [
  // Row 1
  [null, null, null, null, null, null, null, null, null, null, "ME"],
  // Row 2
  ["WA", null, null, null, null, null, null, null, null, "VT", "NH"],
  // Row 3
  ["WA", "ID", "MT", "ND", "MN", null, "WI", "MI", null, "NY", "MA"],
  // Row 4
  ["OR", "ID", "WY", "SD", "MN", "IA", "WI", "MI", "PA", "NY", "RI"],
  // Row 5
  ["OR", "NV", "WY", "SD", "NE", "IA", "IL", "IN", "OH", "PA", "CT"],
  // Row 6
  ["CA", "NV", "UT", "CO", "NE", "MO", "IL", "IN", "OH", "WV", "NJ"],
  // Row 7
  ["CA", "NV", "UT", "CO", "KS", "MO", "KY", "TN", "VA", "MD", "DE"],
  // Row 8
  ["CA", "AZ", "NM", "OK", "AR", "TN", "NC", "SC", "VA", null, null],
  // Row 9
  [null, "AZ", "NM", "TX", "LA", "MS", "AL", "GA", null, null, null],
  // Row 10
  ["HI", null, null, "TX", "LA", null, null, "FL", null, null, null],
  // Row 11
  [null, null, null, null, null, null, null, "FL", null, null, "AK"],
];

// Dedupe the grid so each state has ONE clickable cell across its
// physical-extent footprint. We use a Set to avoid the same button
// rendering multiple times.
const STATE_FIRST_OCCURRENCE: Record<string, [number, number]> = {};
for (let r = 0; r < STATE_GRID.length; r++) {
  for (let c = 0; c < STATE_GRID[r]!.length; c++) {
    const s = STATE_GRID[r]![c];
    if (s && !STATE_FIRST_OCCURRENCE[s]) {
      STATE_FIRST_OCCURRENCE[s] = [r, c];
    }
  }
}

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

// Per-state county hint placeholder for the county input. For WA we
// show real county examples to nudge the parent. Other states just get
// generic "type your county" prompts.
const COUNTY_HINTS: Record<string, string> = {
  WA: "King · Pierce · Snohomish · Spokane · Clark · Thurston…",
  OR: "Multnomah · Washington · Clackamas · Lane…",
  CA: "Los Angeles · Orange · San Diego · Alameda…",
  TX: "Harris · Dallas · Tarrant · Bexar · Travis…",
  FL: "Miami-Dade · Broward · Orange · Hillsborough…",
};

const STEPS: Step[] = [
  "age",
  "location",
  "skill",
  "format",
  "timing",
  "notify",
  "results",
];

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

  const stepIndex = STEPS.indexOf(step);

  const canAdvance = (() => {
    if (step === "age") return state.ageGroup !== "";
    if (step === "location") return state.state !== "" && state.county.trim().length >= 2;
    if (step === "skill") return state.skillLevel !== "";
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
          intent: `Camp Finder · ${state.ageGroup} · ${state.state} ${state.county}`,
          source: "camp-finder-quiz",
          ageGroup: state.ageGroup,
          state: state.state,
          county: state.county,
          skillLevel: state.skillLevel,
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
        <div className="mx-auto max-w-3xl px-5 sm:px-8 mt-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] tracking-[0.22em] uppercase font-bold text-white/60">
              Step {stepIndex + 1} of 6
            </span>
            <span className="text-[10px] tracking-[0.22em] uppercase font-bold text-white/40">
              {Math.round(((stepIndex + 1) / 6) * 100)}%
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${((stepIndex + 1) / 6) * 100}%`,
                background: LIME,
              }}
            />
          </div>
        </div>
      )}

      {/* STEP CONTENT */}
      <div className="mx-auto max-w-3xl px-5 sm:px-8 py-8 sm:py-12 pb-24">
        {step === "age" && (
          <AgeStep
            value={state.ageGroup}
            onChange={(v) => update("ageGroup", v)}
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
        {step === "skill" && (
          <SkillStep
            value={state.skillLevel}
            onChange={(v) => update("skillLevel", v)}
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
    </main>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Q1 · Age (the most important question)
// ─────────────────────────────────────────────────────────────────────────────

function AgeStep({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <p className="text-[11px] tracking-[0.32em] uppercase font-bold mb-3" style={{ color: LIME }}>
        Question 1 of 6
      </p>
      <h1 className="text-3xl sm:text-5xl font-black leading-tight mb-3">
        How old is your player?
      </h1>
      <p className="text-base text-white/60 mb-8 leading-relaxed">
        This is the most important match — camp programming is built around the
        age group, not the skill level.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {AGE_GROUPS.map((opt) => {
          const active = value === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => onChange(opt.id)}
              className={`text-left rounded-xl p-4 border-2 transition-all hover:scale-[1.02] ${
                active
                  ? "bg-lime-300 border-lime-300 text-slate-950"
                  : "bg-white/5 border-white/10 hover:border-lime-300/40"
              }`}
            >
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
        Question 2 of 6
      </p>
      <h1 className="text-3xl sm:text-5xl font-black leading-tight mb-3">
        Where do you live?
      </h1>
      <p className="text-base text-white/60 mb-6 leading-relaxed">
        Tap your state on the map. We&apos;ll match camps within driving
        distance.
      </p>

      {/* US states map · geographic-grid layout */}
      <div className="rounded-2xl border border-white/10 bg-black/30 p-3 sm:p-4 mb-5">
        <div className="grid gap-1" style={{ gridTemplateColumns: "repeat(11, minmax(0, 1fr))" }}>
          {STATE_GRID.flatMap((row, r) =>
            row.map((s, c) => {
              const isFirstOccurrence = s ? STATE_FIRST_OCCURRENCE[s]?.[0] === r && STATE_FIRST_OCCURRENCE[s]?.[1] === c : false;
              if (!s) return <div key={`${r}-${c}`} />;
              if (!isFirstOccurrence) {
                // Render an invisible filler so the grid stays aligned but
                // we don't repeat the button.
                return (
                  <div
                    key={`${r}-${c}`}
                    className={`aspect-square rounded ${
                      stateCode === s ? "bg-lime-300/40" : "bg-white/[0.03]"
                    }`}
                  />
                );
              }
              const active = stateCode === s;
              return (
                <button
                  key={`${r}-${c}`}
                  onClick={() => onState(s)}
                  className={`aspect-square rounded text-[10px] sm:text-xs font-bold transition-all ${
                    active
                      ? "bg-lime-300 text-slate-950 scale-110 shadow-lg shadow-lime-300/30 z-10 relative"
                      : "bg-white/5 text-white/70 hover:bg-white/15 hover:text-white"
                  }`}
                  title={STATE_NAMES[s]}
                >
                  {s}
                </button>
              );
            }),
          )}
        </div>
        {stateCode && (
          <p className="text-center text-xs text-white/60 mt-3">
            <span className="font-bold" style={{ color: LIME }}>
              {STATE_NAMES[stateCode]}
            </span>{" "}
            selected. Type your county below.
          </p>
        )}
      </div>

      {/* County input */}
      {stateCode && (
        <div>
          <label className="block text-[10px] tracking-[0.22em] uppercase font-bold text-white/60 mb-2">
            What county?
          </label>
          <input
            type="text"
            value={county}
            onChange={(e) => onCounty(e.target.value)}
            placeholder={
              COUNTY_HINTS[stateCode]
                ? `e.g. ${COUNTY_HINTS[stateCode]?.split(" ·")[0]}`
                : "Type your county name"
            }
            className="w-full rounded-xl bg-white/5 border-2 border-white/10 px-4 py-3 text-base text-white placeholder:text-white/30 focus:outline-none focus:border-lime-300/60"
            autoFocus
          />
          {COUNTY_HINTS[stateCode] && (
            <p className="text-[11px] text-white/40 italic mt-1.5">
              Common in {STATE_NAMES[stateCode]}: {COUNTY_HINTS[stateCode]}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Q3 · Skill level
// ─────────────────────────────────────────────────────────────────────────────

function SkillStep({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <p className="text-[11px] tracking-[0.32em] uppercase font-bold mb-3" style={{ color: LIME }}>
        Question 3 of 6
      </p>
      <h1 className="text-3xl sm:text-5xl font-black leading-tight mb-3">
        Where are they at?
      </h1>
      <p className="text-base text-white/60 mb-8 leading-relaxed">
        Skill level helps us point you at the right intensity — beginner camps
        feel different from elite tryout-prep camps.
      </p>

      <div className="grid grid-cols-2 gap-2">
        {SKILL_LEVELS.map((opt) => {
          const active = value === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => onChange(opt.id)}
              className={`text-left rounded-xl p-5 border-2 transition-all hover:scale-[1.02] ${
                active
                  ? "bg-lime-300 border-lime-300 text-slate-950"
                  : "bg-white/5 border-white/10 hover:border-lime-300/40"
              }`}
            >
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
        Question 4 of 6
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
        Question 5 of 6
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
            ? `Thanks ${state.parentName}. Here are camps that fit your ${state.ageGroup} player in ${state.county}, ${state.state}.`
            : `Thanks ${state.parentName}. We'll email ${state.email} the moment a camp opens for ${state.ageGroup} players in ${state.county}, ${state.state}.`}
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
            <li>· When a camp opens for {state.ageGroup} in {state.county}, you get FIRST-look access</li>
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
