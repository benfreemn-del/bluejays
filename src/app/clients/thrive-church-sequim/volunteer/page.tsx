"use client";

/**
 * Thrive Church Sequim — Volunteer page
 *
 * Two on-ramps on the same page:
 *   1) "I already know" → direct VolunteerSignup form
 *   2) "Not sure yet?"   → 4-question VolunteerQuiz that recommends 1-2
 *      serving teams + a one-click "send my matches to the team" button
 *
 * The two modes share a single hero / footer / brand surface. Quiz mode
 * shows the quiz inline above the signup form; users can skip out of
 * the quiz at any point and fall through to the direct form.
 */

import { useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  ArrowRight,
  ArrowLeft,
  HandHeart,
  Sparkle,
  Heart,
  Coffee,
} from "@phosphor-icons/react";

import StickyNav from "../sticky-nav";
import ChristianMotifs from "../christian-motifs";
import VolunteerQuiz from "./volunteer-quiz";
import VolunteerSignup from "./volunteer-signup";

type Mode = "choose" | "quiz" | "signup";

export default function VolunteerPage() {
  const [mode, setMode] = useState<Mode>("choose");

  return (
    <main
      className="relative min-h-screen overflow-x-clip bg-[#fbf7ee] text-[#1b2922] antialiased selection:bg-[#0d4f4a] selection:text-[#fbf7ee]"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <StickyNav />

      {/* ── HERO ── */}
      <section className="relative isolate overflow-hidden pt-20 sm:pt-24 lg:pt-28">
        <ChristianMotifs variant="corners" />
        <div className="relative mx-auto max-w-[1280px] px-6 pb-12 sm:px-10 sm:pb-16">
          <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.32em] text-[#0d4f4a]/70">
            <span className="inline-block h-px w-10 bg-[#d97706]" />
            Volunteer
          </div>
          <h1
            className="mt-7 font-[Fraunces] text-[clamp(2.8rem,7vw,6.5rem)] font-light leading-[0.95] tracking-[-0.03em] text-[#0d4f4a]"
            style={{ fontVariationSettings: '"opsz" 144, "SOFT" 100' }}
          >
            Find your place to{" "}
            <em className="italic">serve</em>.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[#1b2922]/75">
            Every team at Thrive is built around a simple idea: ordinary
            people, doing one small thing well, together. Tell us how
            you&rsquo;d like to help — or take a 2-minute quiz and we&rsquo;ll
            help you figure it out.
          </p>
        </div>
      </section>

      {/* ── ON-RAMP CHOICE ── */}
      {mode === "choose" && (
        <section className="relative bg-[#f5ede0] py-16 sm:py-20">
          <ChristianMotifs variant="right" />
          <div className="relative mx-auto max-w-[1280px] px-6 sm:px-10">
            <div className="grid gap-6 sm:grid-cols-2">
              {/* Quiz card */}
              <button
                type="button"
                onClick={() => setMode("quiz")}
                className="group flex h-full flex-col rounded-sm border border-[#0d4f4a]/15 bg-white p-8 text-left transition-all hover:-translate-y-1 hover:border-[#d97706] hover:shadow-[0_22px_50px_-26px_rgba(217,119,6,0.5)] sm:p-10"
              >
                <span
                  className="flex h-14 w-14 items-center justify-center rounded-full"
                  style={{ background: "rgba(217,119,6,0.12)", color: "#d97706" }}
                >
                  <Sparkle size={26} weight="duotone" />
                </span>
                <h2
                  className="mt-7 font-[Fraunces] text-3xl text-[#0d4f4a] sm:text-4xl"
                  style={{ fontWeight: 500 }}
                >
                  Not sure yet?
                </h2>
                <p className="mt-2 font-[Fraunces] text-lg italic text-[#0d4f4a]/70">
                  Take a 2-minute fit quiz.
                </p>
                <p className="mt-5 text-[15px] leading-relaxed text-[#1b2922]/72">
                  Four quick questions about your schedule, what energizes you,
                  and what you&rsquo;d rather not do. We&rsquo;ll point you at
                  the teams that match best.
                </p>
                <span
                  className="mt-8 inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.22em] text-[#d97706]"
                >
                  Start the quiz
                  <ArrowRight
                    size={14}
                    weight="bold"
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </span>
              </button>

              {/* Direct sign-up card */}
              <button
                type="button"
                onClick={() => setMode("signup")}
                className="group flex h-full flex-col rounded-sm border border-[#0d4f4a]/15 bg-white p-8 text-left transition-all hover:-translate-y-1 hover:border-[#0d4f4a] hover:shadow-[0_22px_50px_-26px_rgba(13,79,74,0.5)] sm:p-10"
              >
                <span
                  className="flex h-14 w-14 items-center justify-center rounded-full"
                  style={{ background: "rgba(13,79,74,0.10)", color: "#0d4f4a" }}
                >
                  <HandHeart size={26} weight="duotone" />
                </span>
                <h2
                  className="mt-7 font-[Fraunces] text-3xl text-[#0d4f4a] sm:text-4xl"
                  style={{ fontWeight: 500 }}
                >
                  I already know.
                </h2>
                <p className="mt-2 font-[Fraunces] text-lg italic text-[#0d4f4a]/70">
                  Skip ahead — sign me up.
                </p>
                <p className="mt-5 text-[15px] leading-relaxed text-[#1b2922]/72">
                  Got a team in mind already? Cool. The form takes 90 seconds.
                  A team lead will reach out this week to get you started.
                </p>
                <span
                  className="mt-8 inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.22em] text-[#0d4f4a]"
                >
                  Sign me up directly
                  <ArrowRight
                    size={14}
                    weight="bold"
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </span>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ── QUIZ MODE ── */}
      {mode === "quiz" && (
        <section className="relative bg-[#f5ede0] py-16 sm:py-20">
          <ChristianMotifs variant="scatter" />
          <div className="relative mx-auto max-w-[920px] px-6 sm:px-10">
            <button
              type="button"
              onClick={() => setMode("choose")}
              className="mb-6 inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.22em] text-[#0d4f4a]/70 transition-colors hover:text-[#d97706]"
            >
              <ArrowLeft size={12} weight="bold" />
              Back
            </button>
            <VolunteerQuiz onDone={() => setMode("signup")} />
          </div>
        </section>
      )}

      {/* ── SIGN-UP MODE ── */}
      {mode === "signup" && (
        <section className="relative bg-[#f5ede0] py-16 sm:py-20">
          <ChristianMotifs variant="left" />
          <div className="relative mx-auto max-w-[920px] px-6 sm:px-10">
            <button
              type="button"
              onClick={() => setMode("choose")}
              className="mb-6 inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.22em] text-[#0d4f4a]/70 transition-colors hover:text-[#d97706]"
            >
              <ArrowLeft size={12} weight="bold" />
              Back
            </button>
            <VolunteerSignup />
          </div>
        </section>
      )}

      {/* ── WHY SERVE? ── */}
      <section className="relative overflow-hidden bg-[#fbf7ee] py-16 sm:py-22">
        <ChristianMotifs variant="scatter" />
        <div className="relative mx-auto max-w-[1280px] px-6 sm:px-10">
          <div className="grid gap-10 lg:grid-cols-[1fr_2fr]">
            <div>
              <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.32em] text-[#0d4f4a]/70">
                <span className="inline-block h-px w-10 bg-[#d97706]" />
                Why serve?
              </div>
              <h2
                className="mt-7 font-[Fraunces] text-[clamp(2rem,4.5vw,3.5rem)] font-light leading-[1] tracking-[-0.02em] text-[#0d4f4a]"
                style={{ fontVariationSettings: '"opsz" 144, "SOFT" 100' }}
              >
                Three honest reasons.
              </h2>
            </div>
            <ul className="grid gap-6 sm:grid-cols-3">
              <Reason
                icon={<Heart size={22} weight="duotone" />}
                heading="It builds the family."
                body="Church works because regular people show up for each other. Serving is the front door to belonging."
              />
              <Reason
                icon={<Coffee size={22} weight="duotone" />}
                heading="It's small + sustainable."
                body="Most roles are 1–2 hours a week or month. We'd rather have you serve a little for years than burn out in a season."
              />
              <Reason
                icon={<Sparkle size={22} weight="duotone" />}
                heading="It shapes you."
                body="You'll meet people you wouldn't otherwise. You'll find gifts you didn't know you had. You'll grow."
              />
            </ul>
          </div>
        </div>
      </section>

      {/* ── FOOTER MINI ── */}
      <section className="relative overflow-hidden bg-[#0a3d39] py-12 text-[#fbf7ee] sm:py-16">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 right-1/4 h-[360px] w-[360px] rounded-full opacity-50"
          style={{
            background:
              "radial-gradient(circle, rgba(217,119,6,0.18) 0%, rgba(217,119,6,0) 60%)",
            filter: "blur(14px)",
          }}
        />
        <div className="relative mx-auto max-w-[1280px] px-6 text-center sm:px-10">
          <p
            className="font-[Fraunces] text-[clamp(1.6rem,3vw,2.6rem)] italic leading-snug text-[#fbf7ee]"
            style={{ fontWeight: 400 }}
          >
            &ldquo;Each of you should use whatever gift you have received to
            serve others, as faithful stewards of God&rsquo;s grace in its
            various forms.&rdquo;
          </p>
          <p className="mt-5 text-[11px] uppercase tracking-[0.28em] text-[#fbbf24]">
            1 Peter 4:10
          </p>
          <Link
            href="/clients/thrive-church-sequim"
            className="mt-10 inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.22em] text-[#fbf7ee]/70 transition-colors hover:text-[#fbbf24]"
          >
            <ArrowLeft size={12} weight="bold" />
            Back to Thrive home
          </Link>
        </div>
      </section>
    </main>
  );
}

function Reason({
  icon,
  heading,
  body,
}: {
  icon: React.ReactNode;
  heading: string;
  body: string;
}) {
  return (
    <li className="rounded-sm border border-[#0d4f4a]/15 bg-white p-6 sm:p-7">
      <span
        className="flex h-11 w-11 items-center justify-center rounded-full"
        style={{ background: "rgba(13,79,74,0.10)", color: "#0d4f4a" }}
      >
        {icon}
      </span>
      <h3
        className="mt-5 font-[Fraunces] text-xl text-[#0d4f4a] sm:text-2xl"
        style={{ fontWeight: 600 }}
      >
        {heading}
      </h3>
      <p className="mt-3 text-[14px] leading-relaxed text-[#1b2922]/72">
        {body}
      </p>
    </li>
  );
}
