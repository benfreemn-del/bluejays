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
import { AnimatePresence, motion } from "framer-motion";
import { PlayerAvatar } from "@/components/PlayerAvatar";
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

// Per Philip+Paul's notes: email capture moves AFTER goals (so the
// parent has invested in customization) but BEFORE the plan reveal
// (so the email is the gate to the personalized output).
type Step = "role" | "builder" | "goals" | "identity" | "plan";

type State = Omit<BuilderInputs, "role" | "gender"> & {
  role: BuilderInputs["role"] | null;
  gender: BuilderInputs["gender"] | null;
};

const INITIAL: State = {
  role: null,
  gender: null,
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
    return generatePlan({
      ...state,
      role: state.role,
      gender: state.gender ?? "male",
    });
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
            gender: state.gender,
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
    if (step === "builder") return state.gender !== null;
    if (step === "goals") return state.goals.length >= 1;
    return false;
  })();

  // New order: role → builder → goals → identity (email gate) → plan
  const next = () => {
    if (!canAdvance) return;
    setStep((s) =>
      s === "role"
        ? "builder"
        : s === "builder"
          ? "goals"
          : s === "goals"
            ? "identity"
            : "plan",
    );
  };
  const back = () => {
    setStep((s) =>
      s === "plan"
        ? "identity"
        : s === "identity"
          ? "goals"
          : s === "goals"
            ? "builder"
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
            canAdvance={canAdvance}
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
  // Order matches the new flow (email is the gate before plan).
  const order: Step[] = ["role", "builder", "goals", "identity", "plan"];
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
  // Email-gate framing per Philip+Paul's notes — the parent has invested
  // in customizing (slider + goals), so framing the email as the bridge
  // to "your custom training plan" lifts capture rate vs asking up-front.
  return (
    <div className="max-w-md mx-auto">
      <div className="text-[10px] tracking-[0.32em] uppercase font-bold text-[#a3e635] mb-3">
        Last step before your plan
      </div>
      <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight">
        Where should we send it?
      </h2>
      <p className="mt-3 text-white/70 text-base leading-relaxed">
        Your custom training plan is ready — drills, weekly cadence, kit fit,
        all matched to {state.firstName ? "your" : "the"} build. Drop your email
        and we&apos;ll send it now plus a follow-up from Philip.
      </p>

      {/* What they'll get card — invests them harder before the field */}
      <div className="mt-5 rounded-xl border border-[#a3e635]/30 bg-[#a3e635]/5 p-4">
        <p className="text-[10px] tracking-[0.22em] uppercase font-bold text-[#a3e635] mb-2">
          You&apos;ll get
        </p>
        <ul className="space-y-1.5 text-sm text-white/85">
          <li>· Personalized weekly cadence (sessions × duration)</li>
          <li>· 3 starter drills matched to current skill</li>
          <li>· Recommended TEKKY kit fit</li>
          <li>
            · A quick reply from Philip with{" "}
            <strong className="text-[#a3e635]">
              one specific next-step recommendation
            </strong>{" "}
            for {state.firstName || "your player"}
          </li>
        </ul>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (canAdvance) onNext();
        }}
        className="mt-6 space-y-4"
      >
        <Field label="First name *">
          <input
            type="text"
            value={state.firstName}
            onChange={(e) => update("firstName", e.target.value)}
            autoComplete="given-name"
            required
            className="w-full bg-white/[0.04] border border-white/10 rounded-md px-4 py-3 text-white focus:border-[#a3e635] focus:ring-2 focus:ring-[#a3e635]/30 outline-none transition"
            placeholder="Your name"
            autoFocus
          />
        </Field>
        <Field label="Email *">
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
        <Field label="Phone (optional · we only text if you ask)">
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
          <NextButton
            disabled={!canAdvance}
            onClick={onNext}
            label="Show me my plan →"
          />
        </div>
        <p className="text-[10px] text-white/35 text-center pt-2">
          We never share your info. Unsubscribe anytime.
        </p>
      </form>
    </div>
  );
}

/* ─────────────────────────── STEP: BUILDER ─────────────────────────── */

// Builder sub-steps — questions answered one at a time on the left while
// the avatar stays mounted on the right. As the parent answers gender →
// age → skill, the avatar card on the right swaps live (those are the 3
// inputs that drive the Pixar card lookup). Height + hours follow but
// don't change the card; they feed the training-plan generator.
type BuilderSubStep = "gender" | "age" | "skill" | "height" | "hours";
const BUILDER_SUBSTEPS: BuilderSubStep[] = [
  "gender",
  "age",
  "skill",
  "height",
  "hours",
];

function BuilderStep({
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
  const [sub, setSub] = useState<BuilderSubStep>("gender");
  const subIdx = BUILDER_SUBSTEPS.indexOf(sub);
  const isLast = subIdx === BUILDER_SUBSTEPS.length - 1;

  // Per-substep gate. Sliders default to a value so they're always
  // advanceable; gender requires a pick.
  const canSubAdvance =
    sub === "gender" ? state.gender !== null : true;

  const advanceSub = () => {
    if (!canSubAdvance) return;
    if (isLast) {
      // Final substep handed off to the parent stepper.
      if (canAdvance) onNext();
      return;
    }
    setSub(BUILDER_SUBSTEPS[subIdx + 1]!);
  };
  const backSub = () => {
    if (subIdx === 0) return;
    setSub(BUILDER_SUBSTEPS[subIdx - 1]!);
  };

  return (
    <div className="grid lg:grid-cols-2 gap-10 items-stretch">
      {/* Left — one question at a time */}
      <div className="flex flex-col">
        <div className="text-[10px] tracking-[0.32em] uppercase font-bold text-[#a3e635] mb-3">
          Step 2 of 5 · {subIdx + 1} / {BUILDER_SUBSTEPS.length}
        </div>
        <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight">
          Build the player.
        </h2>
        <p className="mt-3 text-white/55 text-sm leading-relaxed">
          Answer one quick question at a time. Watch the player on the right
          shift as you go.
        </p>

        {/* Sub-step tracker — slim dot row */}
        <div className="mt-5 flex items-center gap-1.5">
          {BUILDER_SUBSTEPS.map((s, i) => (
            <span
              key={s}
              className={`block h-1 rounded-full transition-all ${
                i === subIdx
                  ? "w-6 bg-[#a3e635]"
                  : i < subIdx
                    ? "w-3 bg-[#a3e635]/60"
                    : "w-3 bg-white/15"
              }`}
            />
          ))}
        </div>

        {/* The active question */}
        <div className="mt-8 flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={sub}
              initial={{ opacity: 0, x: 14 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -14 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              {sub === "gender" && (
                <SubQuestion title="Who is the player?">
                  <div className="grid grid-cols-2 gap-3">
                    {(
                      [
                        { v: "male", emoji: "👦", label: "Boy / Man" },
                        { v: "female", emoji: "👧", label: "Girl / Woman" },
                      ] as const
                    ).map((opt) => {
                      const selected = state.gender === opt.v;
                      return (
                        <button
                          key={opt.v}
                          type="button"
                          onClick={() => update("gender", opt.v)}
                          className={`p-5 rounded-2xl border-2 transition text-left ${
                            selected
                              ? "border-[#a3e635] bg-[#a3e635]/8"
                              : "border-white/10 bg-white/[0.03] hover:border-white/30"
                          }`}
                        >
                          <div className="text-3xl mb-2">{opt.emoji}</div>
                          <div className="text-base font-black uppercase tracking-tight">
                            {opt.label}
                          </div>
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
                </SubQuestion>
              )}

              {sub === "age" && (
                <SubQuestion title="How old are they?">
                  <Slider
                    label="Age"
                    value={state.age}
                    onChange={(v) => update("age", v)}
                    min={5}
                    max={35}
                    step={1}
                    display={
                      state.age >= 24 ? `Adult · ${state.age}` : `U-${state.age}`
                    }
                  />
                </SubQuestion>
              )}

              {sub === "skill" && (
                <SubQuestion title="What level do they play at?">
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
                </SubQuestion>
              )}

              {sub === "height" && (
                <SubQuestion title="How tall are they?">
                  <Slider
                    label="Height"
                    value={state.heightInches}
                    onChange={(v) => update("heightInches", v)}
                    min={36}
                    max={84}
                    step={1}
                    display={`${Math.floor(state.heightInches / 12)}'${state.heightInches % 12}"`}
                  />
                </SubQuestion>
              )}

              {sub === "hours" && (
                <SubQuestion title="How much do they train each week?">
                  <Slider
                    label="Current weekly training (hrs)"
                    value={state.currentWeeklyHours}
                    onChange={(v) => update("currentWeeklyHours", v)}
                    min={0}
                    max={30}
                    step={1}
                    display={`${state.currentWeeklyHours} hrs / wk`}
                  />
                </SubQuestion>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Per-substep nav */}
        <div className="mt-8 flex items-center gap-3">
          {subIdx > 0 && (
            <button
              type="button"
              onClick={backSub}
              className="text-[11px] tracking-[0.22em] uppercase font-bold text-white/60 hover:text-white flex items-center gap-1"
            >
              <ArrowLeft size={12} weight="bold" /> Back
            </button>
          )}
          <div className="ml-auto">
            <NextButton
              disabled={!canSubAdvance}
              onClick={advanceSub}
              label={
                isLast
                  ? "Pick goals →"
                  : sub === "gender" && !state.gender
                    ? "Pick a player first"
                    : "Continue →"
              }
            />
          </div>
        </div>
      </div>

      {/* Right — Pixar-style 3D avatar card. Stays mounted across all
          builder sub-steps so the parent watches the player update live
          as they answer. Lookup keys off gender + age + skillLevel.
          Until gender is picked the neutral DEFAULT_AVATAR shows so the
          slot is never empty. Sticky so it stays in view as the parent
          scrolls through tall sliders on smaller viewports. */}
      <div className="w-full max-w-[420px] mx-auto lg:sticky lg:top-24 lg:self-start">
        <div
          className="relative rounded-2xl border border-white/10 overflow-hidden"
          style={{
            background: "linear-gradient(180deg, #0a1628 0%, #1e3a5f 100%)",
          }}
        >
          <AnimatePresence mode="wait">
            <PlayerAvatar
              gender={state.gender}
              age={state.age}
              skillLevel={state.skillLevel}
              alt={`${state.firstName || "Your player"} avatar`}
              priority
            />
          </AnimatePresence>
        </div>
        {/* Tier + age caption for context */}
        <div className="mt-3 flex items-center justify-between text-[10px] tracking-[0.22em] uppercase font-bold text-white/45">
          <span>
            {state.gender
              ? ["Rec", "Travel", "Club", "ECNL / MLS Next", "Elite"][
                  state.skillLevel - 1
                ] ?? "—"
              : "Pick a player to start"}
          </span>
          <span>
            {state.age >= 24 ? `Adult · ${state.age}` : `U-${state.age}`}
          </span>
        </div>
      </div>
    </div>
  );
}

function SubQuestion({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight mb-5">
        {title}
      </h3>
      {children}
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
          Step 3 of 5
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

      {/* HARD UPSELL — full custom coaching plan (the paid product).
          Per Philip+Paul's notes: push this hard so the parent who just
          got a free starter plan sees the upgrade clearly, with concrete
          deliverables + scarcity (1:1 cadence with Philip). */}
      <div
        className="mt-10 rounded-2xl border-2 p-6 sm:p-8 relative overflow-hidden"
        style={{
          borderColor: LIME,
          background:
            "linear-gradient(135deg, rgba(163,230,53,0.18) 0%, rgba(29,78,216,0.12) 100%)",
        }}
      >
        <div className="absolute top-3 right-3 text-[10px] uppercase tracking-widest font-black px-2.5 py-1 rounded-full" style={{ background: LIME, color: NAVY_DEEP }}>
          🔥 Best fit for {state.firstName}
        </div>

        <div className="text-[11px] tracking-[0.28em] uppercase font-bold mb-3" style={{ color: LIME }}>
          The next level · 1-on-1 coaching plan
        </div>
        <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight leading-tight mb-3">
          Want Philip building the full {plan.level} plan with you?
        </h3>
        <p className="text-base text-white/85 leading-relaxed mb-5">
          Your starter plan is 3 drills + a weekly cadence. The{" "}
          <strong style={{ color: LIME }}>Custom Coaching Plan</strong> is what
          ECNL parents actually pay for — Philip personally builds a 12-week
          progression for {state.firstName}, monthly check-in video review,
          drill-pack updates as they level up, and direct text access to him.
        </p>

        <div className="grid sm:grid-cols-2 gap-3 mb-5">
          <ul className="space-y-1.5 text-sm text-white/85">
            <li>· 12-week progression (vs 3 drills)</li>
            <li>· Monthly video review of {state.firstName}&apos;s footage</li>
            <li>· Drill-pack updates as skill grows</li>
          </ul>
          <ul className="space-y-1.5 text-sm text-white/85">
            <li>· Direct text access to Philip</li>
            <li>· Tryout / showcase prep guidance</li>
            <li>· Cancel anytime · 30-day money back</li>
          </ul>
        </div>

        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-white/50 mb-0.5">
              Starting at
            </div>
            <div className="text-3xl font-black tracking-tighter">
              $97
              <span className="text-base text-white/60 font-normal">/month</span>
            </div>
            <div className="text-[10px] text-white/50 mt-0.5">
              Less than one club training session per week
            </div>
          </div>
          <a
            href={`mailto:philip@zenithsports.org?subject=${encodeURIComponent(
              `Custom Coaching Plan for ${state.firstName} (${plan.level})`,
            )}&body=${encodeURIComponent(
              `Hey Philip — saw the Build Your Player plan for ${state.firstName} and want to talk about the full Custom Coaching Plan. Their level: ${plan.level}. Goals: ${state.goals.join(", ")}.\n\nWhat's the next step?`,
            )}`}
            className="inline-flex items-center gap-2 px-6 py-4 text-sm font-extrabold tracking-[0.2em] uppercase rounded-md transition hover:scale-[1.02]"
            style={{ background: LIME, color: NAVY_DEEP }}
          >
            Talk to Philip
            <ArrowRight size={14} weight="bold" />
          </a>
        </div>
        <p className="text-[10px] text-white/45 italic mt-3">
          Limited cohort — Philip caps at 20 active players for personalized
          coaching at any time.
        </p>
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
