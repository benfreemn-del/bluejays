"use client";

/* eslint-disable @next/next/no-img-element */

/**
 * /clients/zenith-sports/build-your-player
 *
 * Lead-gen experience replacing the old "Player Challenge" email-capture.
 *
 * Flow (multi-step state machine):
 *   1. Role chooser — Parent / Player / Coach
 *   2. Identity — name, email, phone (the lead capture)
 *   3. Builder — sliders for age/height/skill/weekly hours,
 *      live SVG character morphs as you change them
 *   4. Goals — pick up to 3 goal chips
 *   5. Plan reveal — personalized training plan + recommended kit
 *      Submits to /api/clients/inquire on completion
 *
 * Lead schema:
 *   intent  = "Build Your Player"
 *   source  = "lead-gen-builder"
 *   payload = { role, age, heightInches, skillLevel, currentWeeklyHours,
 *               goals, plan: { ...generated plan } }
 *
 * The audience-segment auto-detector reads `role` directly. No manual tagging.
 */

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  ShoppingCart,
  Lightning,
  PlayCircle,
} from "@phosphor-icons/react/dist/ssr";
import CharacterBuilder from "./character";
import {
  GOAL_OPTIONS,
  generatePlan,
  type BuilderInputs,
  type TrainingPlan,
} from "./training-plan";

const NAVY = "#0a1832";
const NAVY_DEEP = "#050d1f";
const LIME = "#a3e635";
const ELECTRIC = "#1d4ed8";

type Step = "role" | "identity" | "builder" | "goals" | "plan";

type State = Omit<BuilderInputs, "role"> & {
  role: BuilderInputs["role"] | null;
};

const INITIAL: State = {
  role: null,
  firstName: "",
  email: "",
  phone: "",
  age: 12,
  heightInches: 56,
  skillLevel: 2,
  currentWeeklyHours: 2,
  goals: [],
};

export default function BuildYourPlayerPage() {
  const [step, setStep] = useState<Step>("role");
  const [state, setState] = useState<State>(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const update = <K extends keyof State>(k: K, v: State[K]) =>
    setState((s) => ({ ...s, [k]: v }));

  const toggleGoal = (id: string) =>
    setState((s) => {
      const has = s.goals.includes(id);
      if (has) return { ...s, goals: s.goals.filter((g) => g !== id) };
      if (s.goals.length >= 3) return s; // cap at 3
      return { ...s, goals: [...s.goals, id] };
    });

  const plan: TrainingPlan | null = useMemo(() => {
    if (step !== "plan" || !state.role) return null;
    return generatePlan({ ...state, role: state.role });
  }, [step, state]);

  // Auto-submit the lead when the plan reveal is shown.
  useEffect(() => {
    if (step !== "plan" || !plan || !state.role) return;
    let cancelled = false;
    (async () => {
      setSubmitting(true);
      setSubmitError(null);
      try {
        const r = await fetch("/api/clients/inquire", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            slug: "zenith-sports",
            name: state.firstName,
            email: state.email,
            phone: state.phone,
            intent: "Build Your Player",
            source: "lead-gen-builder",
            // Stash the full builder snapshot + the generated plan so the
            // dashboard timeline can show what we promised the lead.
            role: state.role,
            age: state.age,
            heightInches: state.heightInches,
            skillLevel: state.skillLevel,
            currentWeeklyHours: state.currentWeeklyHours,
            goals: state.goals,
            generatedPlan: plan,
          }),
        });
        const j = (await r.json()) as { ok: boolean; error?: string };
        if (!cancelled && !j.ok) {
          setSubmitError(j.error || "Couldn't save — but here's your plan anyway.");
        }
      } catch {
        if (!cancelled)
          setSubmitError("Network blip — but here's your plan anyway.");
      } finally {
        if (!cancelled) setSubmitting(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [step, plan, state]);

  // Step navigation guards — disable Next if required fields aren't ready.
  const canAdvance = (() => {
    if (step === "role") return state.role !== null;
    if (step === "identity")
      return (
        state.firstName.trim().length >= 2 &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email)
      );
    if (step === "builder") return true;
    if (step === "goals") return state.goals.length >= 1;
    return false;
  })();

  const next = () => {
    if (!canAdvance) return;
    setStep((s) =>
      s === "role"
        ? "identity"
        : s === "identity"
          ? "builder"
          : s === "builder"
            ? "goals"
            : "plan",
    );
  };
  const back = () => {
    setStep((s) =>
      s === "plan"
        ? "goals"
        : s === "goals"
          ? "builder"
          : s === "builder"
            ? "identity"
            : "role",
    );
  };

  return (
    <main
      className="min-h-screen text-white"
      style={{
        background: `linear-gradient(180deg, ${NAVY_DEEP} 0%, ${NAVY} 100%)`,
      }}
    >
      {/* Header */}
      <header className="sticky top-0 z-20 backdrop-blur bg-[#0a1832]/85 border-b border-white/10">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 h-14 flex items-center justify-between gap-4">
          <Link
            href="/clients/zenith-sports"
            className="text-[11px] tracking-[0.22em] uppercase font-bold text-white/60 hover:text-white"
          >
            ← TEKKY®
          </Link>
          <ProgressDots step={step} />
          {step !== "plan" && step !== "role" && (
            <button
              onClick={back}
              className="text-[11px] tracking-[0.22em] uppercase font-bold text-white/60 hover:text-white flex items-center gap-1"
            >
              <ArrowLeft size={12} weight="bold" /> Back
            </button>
          )}
          {(step === "plan" || step === "role") && <span className="w-12" />}
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 sm:px-8 py-10 sm:py-16">
        {step === "role" && <RoleStep state={state} update={update} onNext={next} />}
        {step === "identity" && (
          <IdentityStep
            state={state}
            update={update}
            onNext={next}
            canAdvance={canAdvance}
          />
        )}
        {step === "builder" && (
          <BuilderStep
            state={state}
            update={update}
            onNext={next}
          />
        )}
        {step === "goals" && (
          <GoalsStep
            state={state}
            toggleGoal={toggleGoal}
            onNext={next}
            canAdvance={canAdvance}
          />
        )}
        {step === "plan" && plan && state.role && (
          <PlanStep
            state={state}
            plan={plan}
            submitting={submitting}
            error={submitError}
          />
        )}
      </div>

      <footer className="border-t border-white/10 py-6 mt-12">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 text-center text-[10px] tracking-[0.22em] uppercase text-white/30">
          © 2025 Zenith Sports, LLC · TEKKY<sup className="text-[0.7em] -ml-px top-[-0.45em]">®</sup>{" "}
          is a registered trademark · Patent Pending
        </div>
      </footer>
    </main>
  );
}

/* ─────────────────────────── PROGRESS DOTS ─────────────────────────── */

function ProgressDots({ step }: { step: Step }) {
  const order: Step[] = ["role", "identity", "builder", "goals", "plan"];
  const idx = order.indexOf(step);
  return (
    <div className="flex items-center gap-1.5">
      {order.map((s, i) => (
        <span
          key={s}
          className={`block h-1 rounded-full transition-all ${
            i === idx
              ? "w-8 bg-[#a3e635]"
              : i < idx
                ? "w-3 bg-[#a3e635]/60"
                : "w-3 bg-white/15"
          }`}
        />
      ))}
    </div>
  );
}

/* ─────────────────────────── STEP: ROLE ─────────────────────────── */

function RoleStep({
  state,
  update,
  onNext,
}: {
  state: State;
  update: <K extends keyof State>(k: K, v: State[K]) => void;
  onNext: () => void;
}) {
  return (
    <div className="text-center">
      <div className="text-[10px] tracking-[0.32em] uppercase font-bold text-[#a3e635] mb-3">
        Free · 60 seconds
      </div>
      <h1 className="text-5xl sm:text-7xl font-black uppercase tracking-tighter leading-[0.92]">
        Build your player.
      </h1>
      <p className="mt-5 max-w-xl mx-auto text-base sm:text-lg text-white/65 leading-relaxed">
        Tell us about the player. Get a personalized TEKKY® training plan
        + recommended kit. Built by Philip + Paul, the coaches behind
        TEKKY®.
      </p>

      <div className="mt-10 grid sm:grid-cols-3 gap-3 max-w-3xl mx-auto">
        {(
          [
            { v: "parent", emoji: "👪", label: "I'm a parent", sub: "Building a plan for my player" },
            { v: "player", emoji: "⚽", label: "I'm the player", sub: "Building my own training plan" },
            { v: "coach", emoji: "🏟️", label: "I'm a coach / DOC", sub: "Building a plan for my roster" },
          ] as const
        ).map((opt) => {
          const selected = state.role === opt.v;
          return (
            <button
              key={opt.v}
              onClick={() => update("role", opt.v)}
              className={`text-left p-5 rounded-2xl border-2 transition group ${
                selected
                  ? "border-[#a3e635] bg-[#a3e635]/5"
                  : "border-white/10 bg-white/[0.03] hover:border-white/30"
              }`}
            >
              <div className="text-3xl mb-2">{opt.emoji}</div>
              <div className="text-base font-black uppercase tracking-tight">
                {opt.label}
              </div>
              <div className="text-[12px] text-white/55 mt-1">{opt.sub}</div>
              {selected && (
                <CheckCircle
                  size={16}
                  weight="fill"
                  className="text-[#a3e635] mt-3"
                />
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-10">
        <NextButton disabled={!state.role} onClick={onNext} label="Continue" />
      </div>
    </div>
  );
}

/* ─────────────────────────── STEP: IDENTITY ─────────────────────────── */

function IdentityStep({
  state,
  update,
  onNext,
  canAdvance,
}: {
  state: State;
  update: <K extends keyof State>(k: K, v: State[K]) => void;
  onNext: () => void;
  canAdvance: boolean;
}) {
  return (
    <div className="max-w-md mx-auto">
      <div className="text-[10px] tracking-[0.32em] uppercase font-bold text-[#a3e635] mb-3">
        Step 2 of 5
      </div>
      <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight">
        Who&apos;s this for?
      </h2>
      <p className="mt-3 text-white/55 text-sm leading-relaxed">
        We&apos;ll email you the plan + a quick reply from Philip with any
        next-step recommendations.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (canAdvance) onNext();
        }}
        className="mt-7 space-y-4"
      >
        <Field label="First name">
          <input
            type="text"
            value={state.firstName}
            onChange={(e) => update("firstName", e.target.value)}
            autoComplete="given-name"
            required
            className="w-full bg-white/[0.04] border border-white/10 rounded-md px-4 py-3 text-white focus:border-[#a3e635] focus:ring-2 focus:ring-[#a3e635]/30 outline-none transition"
            placeholder={state.role === "parent" ? "Your name" : "Your name"}
            autoFocus
          />
        </Field>
        <Field label="Email">
          <input
            type="email"
            value={state.email}
            onChange={(e) => update("email", e.target.value)}
            autoComplete="email"
            required
            className="w-full bg-white/[0.04] border border-white/10 rounded-md px-4 py-3 text-white focus:border-[#a3e635] focus:ring-2 focus:ring-[#a3e635]/30 outline-none transition"
            placeholder="you@example.com"
          />
        </Field>
        <Field label="Phone (optional, for SMS updates)">
          <input
            type="tel"
            value={state.phone}
            onChange={(e) => update("phone", e.target.value)}
            autoComplete="tel"
            className="w-full bg-white/[0.04] border border-white/10 rounded-md px-4 py-3 text-white focus:border-[#a3e635] focus:ring-2 focus:ring-[#a3e635]/30 outline-none transition"
            placeholder="(555) 555-5555"
          />
        </Field>

        <div className="pt-3">
          <NextButton disabled={!canAdvance} onClick={onNext} label="Build the player →" />
        </div>
        <p className="text-[10px] text-white/35 text-center pt-2">
          We never share your info. Unsubscribe anytime.
        </p>
      </form>
    </div>
  );
}

/* ─────────────────────────── STEP: BUILDER ─────────────────────────── */

function BuilderStep({
  state,
  update,
  onNext,
}: {
  state: State;
  update: <K extends keyof State>(k: K, v: State[K]) => void;
  onNext: () => void;
}) {
  return (
    <div className="grid lg:grid-cols-2 gap-10 items-center">
      {/* Left — sliders */}
      <div>
        <div className="text-[10px] tracking-[0.32em] uppercase font-bold text-[#a3e635] mb-3">
          Step 3 of 5
        </div>
        <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight">
          Build the player.
        </h2>
        <p className="mt-3 text-white/55 text-sm leading-relaxed">
          Move the sliders. Watch the player on the right shift in real time.
        </p>

        <div className="mt-8 space-y-7">
          <Slider
            label="Age"
            value={state.age}
            onChange={(v) => update("age", v)}
            min={5}
            max={35}
            step={1}
            // U-{N} bracket through 23 (covers youth → academy/college
            // pathway). 24+ becomes the "Adult" senior bracket so
            // current/returning players + adult-league users can
            // generate a plan too.
            display={state.age >= 24 ? `Adult · ${state.age}` : `U-${state.age}`}
          />
          <Slider
            label="Height"
            value={state.heightInches}
            onChange={(v) => update("heightInches", v)}
            min={36}
            max={84}
            step={1}
            display={`${Math.floor(state.heightInches / 12)}'${state.heightInches % 12}"`}
          />
          <Slider
            label="Skill level"
            value={state.skillLevel}
            onChange={(v) => update("skillLevel", v)}
            min={1}
            max={5}
            step={1}
            display={
              ["Rec", "Travel", "Club", "ECNL / MLS Next", "Elite"][
                state.skillLevel - 1
              ] ?? "—"
            }
          />
          <Slider
            label="Current weekly training (hrs)"
            value={state.currentWeeklyHours}
            onChange={(v) => update("currentWeeklyHours", v)}
            min={0}
            max={30}
            step={1}
            display={`${state.currentWeeklyHours} hrs / wk`}
          />
        </div>

        <div className="mt-8">
          <NextButton onClick={onNext} label="Pick goals →" />
        </div>
      </div>

      {/* Right — character */}
      <div
        className="relative h-[520px] rounded-2xl border border-white/10 overflow-hidden"
        style={{ background: NAVY_DEEP }}
      >
        <CharacterBuilder
          age={state.age}
          heightInches={state.heightInches}
          skillLevel={state.skillLevel}
        />
      </div>
    </div>
  );
}

/* ─────────────────────────── STEP: GOALS ─────────────────────────── */

function GoalsStep({
  state,
  toggleGoal,
  onNext,
  canAdvance,
}: {
  state: State;
  toggleGoal: (id: string) => void;
  onNext: () => void;
  canAdvance: boolean;
}) {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center">
        <div className="text-[10px] tracking-[0.32em] uppercase font-bold text-[#a3e635] mb-3">
          Step 4 of 5
        </div>
        <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight">
          What&apos;s the goal?
        </h2>
        <p className="mt-3 text-white/55 text-sm leading-relaxed">
          Pick up to 3. We&apos;ll match your plan to what matters most.
        </p>
      </div>

      <div className="mt-8 grid sm:grid-cols-2 gap-3">
        {GOAL_OPTIONS.map((g) => {
          const selected = state.goals.includes(g.id);
          const atCap = !selected && state.goals.length >= 3;
          return (
            <button
              key={g.id}
              onClick={() => toggleGoal(g.id)}
              disabled={atCap}
              className={`text-left p-4 rounded-xl border-2 transition flex items-center gap-3 ${
                selected
                  ? "border-[#a3e635] bg-[#a3e635]/8"
                  : atCap
                    ? "border-white/5 bg-white/[0.02] opacity-40 cursor-not-allowed"
                    : "border-white/10 bg-white/[0.03] hover:border-white/30"
              }`}
            >
              <span className="text-2xl">{g.emoji}</span>
              <span className="font-bold text-[14px]">{g.label}</span>
              {selected && (
                <CheckCircle
                  size={16}
                  weight="fill"
                  className="ml-auto text-[#a3e635]"
                />
              )}
            </button>
          );
        })}
      </div>
      <div className="mt-3 text-[11px] text-white/40 text-center">
        {state.goals.length} / 3 selected
      </div>

      <div className="mt-10 text-center">
        <NextButton
          disabled={!canAdvance}
          onClick={onNext}
          label="Generate my plan →"
        />
      </div>
    </div>
  );
}

/* ─────────────────────────── STEP: PLAN REVEAL ─────────────────────────── */

function PlanStep({
  state,
  plan,
  submitting,
  error,
}: {
  state: State;
  plan: TrainingPlan;
  submitting: boolean;
  error: string | null;
}) {
  return (
    <div className="max-w-4xl mx-auto">
      {submitting && (
        <div className="text-center text-[11px] tracking-[0.32em] uppercase font-bold text-[#a3e635] mb-3 animate-pulse">
          Saving your plan…
        </div>
      )}
      {!submitting && (
        <div className="text-center text-[11px] tracking-[0.32em] uppercase font-bold text-emerald-300 mb-3">
          ✓ Plan ready · we&apos;ll email it to you too
        </div>
      )}

      <div className="text-center">
        <h2 className="text-4xl sm:text-6xl font-black uppercase tracking-tighter leading-[0.95]">
          {state.firstName}&apos;s
          <br />
          <span style={{ color: LIME }}>{plan.level} plan.</span>
        </h2>
      </div>

      {/* Cadence card */}
      <div
        className="mt-10 rounded-2xl border-2 p-6 sm:p-8"
        style={{
          borderColor: `${LIME}55`,
          background:
            "linear-gradient(135deg, rgba(163,230,53,0.06) 0%, rgba(255,255,255,0.02) 100%)",
        }}
      >
        <div className="grid sm:grid-cols-3 gap-5 text-center">
          <Stat label="Sessions" value={`${plan.weeklySessions}× / week`} />
          <Stat label="Per session" value={`${plan.minutesPerSession} min`} />
          <Stat label="Focus tier" value={plan.focusTier} />
        </div>
        <p
          className="mt-6 pt-6 border-t border-white/10 text-base sm:text-lg leading-relaxed text-white/85"
          style={{ fontFamily: "ui-serif, Georgia, serif", fontStyle: "italic" }}
        >
          {plan.pitch}
        </p>
      </div>

      {/* Drills */}
      <div className="mt-8">
        <h3 className="text-[11px] tracking-[0.28em] uppercase font-bold text-[#a3e635] mb-4">
          Your 3 starter drills
        </h3>
        <div className="grid md:grid-cols-3 gap-3">
          {plan.recommendedDrills.map((d, i) => (
            <a
              key={d.id}
              href={`https://www.youtube.com/watch?v=${d.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group block rounded-xl border border-white/10 bg-white/[0.03] hover:border-[#a3e635]/40 transition p-4"
            >
              <div className="flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase font-bold text-[#a3e635]">
                <span>0{i + 1}</span>
                <PlayCircle size={14} weight="fill" />
                <span className="ml-auto text-white/40">YouTube</span>
              </div>
              <h4 className="mt-2 text-base font-black uppercase tracking-tight">
                {d.name}
              </h4>
              <p className="mt-1.5 text-[12px] text-white/60 leading-relaxed">
                {d.reason}
              </p>
            </a>
          ))}
        </div>
      </div>

      {/* Recommended kit */}
      <div
        className="mt-8 rounded-2xl border-2 p-6 sm:p-8"
        style={{
          borderColor: `${ELECTRIC}66`,
          background:
            "linear-gradient(135deg, rgba(29,78,216,0.06) 0%, rgba(255,255,255,0.02) 100%)",
        }}
      >
        <div className="text-[11px] tracking-[0.28em] uppercase font-bold text-blue-300 mb-3">
          Recommended kit · {plan.recommendedKit.label}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <ul className="space-y-1.5">
            {plan.recommendedKit.items.map((it) => (
              <li
                key={it}
                className="flex items-start gap-2 text-[14px] text-white/85"
              >
                <CheckCircle
                  size={16}
                  weight="fill"
                  className="mt-0.5 text-[#1d4ed8] shrink-0"
                />
                {it}
              </li>
            ))}
          </ul>
          <div className="text-right">
            <div className="text-3xl font-black tracking-tighter">
              ${plan.recommendedKit.priceUsd.toFixed(2)}
            </div>
            <div className="text-[10px] uppercase tracking-wider text-white/40">
              Total kit
            </div>
          </div>
        </div>
        <a
          href="/clients/zenith-sports/shop"
          className="mt-6 flex items-center justify-center gap-2 bg-[#a3e635] text-[#0a1832] px-6 py-4 text-[13px] font-extrabold tracking-[0.2em] uppercase hover:bg-white transition rounded-md"
        >
          <ShoppingCart size={16} weight="bold" />
          Shop the kit
          <ArrowRight size={14} weight="bold" />
        </a>
      </div>

      {/* Next step */}
      <div className="mt-8 text-center">
        <Lightning
          size={28}
          weight="fill"
          className="mx-auto text-[#a3e635] mb-3"
        />
        <p className="text-base sm:text-lg text-white/85 max-w-2xl mx-auto leading-relaxed">
          {plan.nextStep}
        </p>
      </div>

      {error && (
        <p className="mt-6 text-center text-[12px] text-amber-300">
          {error}
        </p>
      )}
    </div>
  );
}

/* ─────────────────────────── ATOMS ─────────────────────────── */

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-[10px] tracking-[0.22em] uppercase font-bold text-white/45 block mb-1.5">
        {label}
      </span>
      {children}
    </label>
  );
}

function Slider({
  label,
  value,
  onChange,
  min,
  max,
  step,
  display,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  display: string;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <label className="text-[11px] tracking-[0.22em] uppercase font-bold text-white/55">
          {label}
        </label>
        <span className="text-base font-black text-[#a3e635] tabular-nums">
          {display}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        className="w-full accent-[#a3e635]"
      />
      <div className="flex justify-between text-[9px] text-white/30 mt-1 tabular-nums">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}

function NextButton({
  disabled,
  onClick,
  label,
}: {
  disabled?: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center justify-center gap-2 bg-[#a3e635] text-[#0a1832] px-7 py-4 text-[13px] font-extrabold tracking-[0.2em] uppercase hover:bg-white transition rounded-md disabled:opacity-40 disabled:cursor-not-allowed"
    >
      {label}
      <ArrowRight size={14} weight="bold" />
    </button>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-3xl font-black tracking-tighter text-[#a3e635]">
        {value}
      </div>
      <div className="text-[10px] tracking-[0.22em] uppercase font-bold text-white/45 mt-1">
        {label}
      </div>
    </div>
  );
}
