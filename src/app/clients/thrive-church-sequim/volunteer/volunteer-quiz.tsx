"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Sparkle,
  Warning,
} from "@phosphor-icons/react";

/**
 * VolunteerQuiz — a 4-question "find your serving fit" flow.
 *
 * Q1: When are you free?
 * Q2: What's your gift / what energizes you?
 * Q3: Time commitment?
 * Q4: Anything you'd rather NOT do?
 *
 * On finish, runs a deterministic scoring pass against the SERVING_TEAMS
 * catalog and surfaces the top 1-2 matches as a recommendation card,
 * then includes a "send this to the team" button that posts the quiz
 * answers + recommendation to /api/clients/inquire (form_type =
 * "volunteer_quiz_result").
 *
 * Visually matches the rest of the Thrive site: cream / deep teal /
 * amber palette + Fraunces display.
 */

const TEAL = "#0d4f4a";
const TEAL_DEEP = "#0a3a36";
const AMBER = "#d97706";
const AMBER_LIGHT = "#fbbf24";
const CREAM = "#fbf7ee";
const INK = "#1b2922";

type Availability = "sunday" | "weeknight" | "weekend" | "flexible";
type Gift = "kids" | "tech" | "hospitality" | "behind" | "leadership" | "people";
type Commitment = "one-shot" | "monthly" | "weekly" | "open";
type Avoid =
  | "kids"
  | "stage"
  | "early-mornings"
  | "none";

type Answers = {
  availability?: Availability;
  gift?: Gift;
  commitment?: Commitment;
  avoid?: Avoid;
};

type Team = {
  id: string;
  name: string;
  blurb: string;
  emoji: string;
  /** Tag set used for scoring. */
  tags: {
    availability?: Availability[];
    gift?: Gift[];
    commitment?: Commitment[];
    /** If the user picked this avoid value, blacklist the team. */
    avoidBlock?: Avoid[];
  };
};

const SERVING_TEAMS: Team[] = [
  {
    id: "kids",
    name: "Next Wave Kids",
    blurb:
      "Snack-handing, story-helping, name-remembering for infants → 5th grade during the Sunday service.",
    emoji: "🧒",
    tags: {
      availability: ["sunday"],
      gift: ["kids", "people"],
      commitment: ["weekly", "monthly"],
      avoidBlock: ["kids"],
    },
  },
  {
    id: "youth",
    name: "Next Wave Youth",
    blurb:
      "Show up for middle + high schoolers — weeknight hangouts, Sunday gatherings, the occasional retreat.",
    emoji: "🏕️",
    tags: {
      availability: ["weeknight", "sunday"],
      gift: ["people", "leadership", "kids"],
      commitment: ["weekly", "monthly"],
    },
  },
  {
    id: "worship-tech",
    name: "Worship & Tech",
    blurb:
      "Sound, lights, slides, livestream, or playing/singing on the team. If signal flow excites you, this is home.",
    emoji: "🎛️",
    tags: {
      availability: ["sunday"],
      gift: ["tech", "behind"],
      commitment: ["weekly", "monthly"],
    },
  },
  {
    id: "hospitality",
    name: "Coffee & Hospitality",
    blurb:
      "Coffee bar, greeters, first-time gift bags — the warm-welcome team that catches every visitor.",
    emoji: "☕",
    tags: {
      availability: ["sunday"],
      gift: ["hospitality", "people"],
      commitment: ["monthly", "weekly"],
    },
  },
  {
    id: "setup",
    name: "Setup & Production",
    blurb:
      "Early Sunday + Saturday setup, teardown, building care, props. Best for people who love getting things ready.",
    emoji: "🪜",
    tags: {
      availability: ["sunday", "weekend"],
      gift: ["behind"],
      commitment: ["weekly", "monthly", "one-shot"],
      avoidBlock: ["early-mornings"],
    },
  },
  {
    id: "table",
    name: "Table of Grace",
    blurb:
      "Cooking, plating, serving meals + sitting with our neighbors at our community meal nights.",
    emoji: "🍲",
    tags: {
      availability: ["weeknight", "weekend"],
      gift: ["hospitality", "people"],
      commitment: ["monthly", "one-shot"],
    },
  },
  {
    id: "prayer",
    name: "Prayer Team",
    blurb:
      "Pray over requests submitted on the site + after-service prayer. Quiet, faithful, low-volume serving.",
    emoji: "🙏",
    tags: {
      availability: ["flexible", "sunday"],
      gift: ["behind", "people"],
      commitment: ["weekly", "monthly"],
    },
  },
  {
    id: "outreach",
    name: "Across the Street / Around the World",
    blurb:
      "Local school drives, food bank shifts, missions support, occasional global trips.",
    emoji: "🌍",
    tags: {
      availability: ["weekend", "weeknight", "flexible"],
      gift: ["people", "hospitality", "leadership"],
      commitment: ["one-shot", "monthly"],
    },
  },
  {
    id: "group-leader",
    name: "Thrive Group Co-Leader",
    blurb:
      "Open your home (or another's) for a weekly small group. We pair new leaders with a seasoned one for a season first.",
    emoji: "🏡",
    tags: {
      availability: ["weeknight"],
      gift: ["leadership", "people", "hospitality"],
      commitment: ["weekly"],
    },
  },
  {
    id: "comms",
    name: "Communications & Photo",
    blurb:
      "Sunday photography, social posts, weekly email help, graphic design. Behind-the-scenes storytelling.",
    emoji: "📸",
    tags: {
      availability: ["sunday", "flexible"],
      gift: ["tech", "behind", "people"],
      commitment: ["monthly", "weekly"],
    },
  },
];

function scoreTeam(team: Team, a: Answers) {
  let score = 0;
  if (a.availability && team.tags.availability?.includes(a.availability))
    score += 3;
  if (a.gift && team.tags.gift?.includes(a.gift)) score += 4;
  if (a.commitment && team.tags.commitment?.includes(a.commitment)) score += 2;
  if (a.avoid && team.tags.avoidBlock?.includes(a.avoid)) score = -999;
  return score;
}

const QUESTIONS = [
  {
    key: "availability" as const,
    label: "When are you most free?",
    helper: "Pick the slot that fits your normal week best.",
    options: [
      { value: "sunday" as Availability, label: "Sunday mornings" },
      { value: "weeknight" as Availability, label: "Weeknights" },
      { value: "weekend" as Availability, label: "Saturdays / Sundays" },
      { value: "flexible" as Availability, label: "Pretty flexible" },
    ],
  },
  {
    key: "gift" as const,
    label: "What kind of serving energizes you?",
    helper: "Don't overthink — pick the one that lights you up most.",
    options: [
      { value: "kids" as Gift, label: "Hanging out with kids" },
      { value: "tech" as Gift, label: "Tech / music / production" },
      { value: "hospitality" as Gift, label: "Welcoming + hosting" },
      { value: "behind" as Gift, label: "Behind-the-scenes work" },
      { value: "leadership" as Gift, label: "Leading + organizing" },
      { value: "people" as Gift, label: "Meeting + talking with people" },
    ],
  },
  {
    key: "commitment" as const,
    label: "How often can you commit?",
    helper: "Be honest — we'd rather match your real rhythm than overload you.",
    options: [
      { value: "one-shot" as Commitment, label: "One-shot events only" },
      { value: "monthly" as Commitment, label: "Once or twice a month" },
      { value: "weekly" as Commitment, label: "Every week" },
      { value: "open" as Commitment, label: "I'll commit to what fits" },
    ],
  },
  {
    key: "avoid" as const,
    label: "Anything you'd rather NOT do?",
    helper: "Optional. We won't recommend something that's a hard no.",
    options: [
      { value: "kids" as Avoid, label: "Working with kids" },
      { value: "stage" as Avoid, label: "Being on stage / front-facing" },
      { value: "early-mornings" as Avoid, label: "Early-early mornings" },
      { value: "none" as Avoid, label: "Open to anything" },
    ],
  },
];

export default function VolunteerQuiz({ onDone }: { onDone?: () => void }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [submitted, setSubmitted] = useState<
    "idle" | "sending" | "ok" | "err"
  >("idle");
  const [errMsg, setErrMsg] = useState<string>("");
  const [contact, setContact] = useState({ name: "", email: "", phone: "" });

  const total = QUESTIONS.length;
  const done = step >= total;

  const recommendations = useMemo(() => {
    if (!done) return [];
    return SERVING_TEAMS.map((t) => ({ team: t, score: scoreTeam(t, answers) }))
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }, [done, answers]);

  function pick(value: string) {
    const q = QUESTIONS[step];
    setAnswers((prev) => ({ ...prev, [q.key]: value }));
    setStep((s) => s + 1);
  }

  function back() {
    setStep((s) => Math.max(0, s - 1));
  }

  function restart() {
    setStep(0);
    setAnswers({});
    setSubmitted("idle");
    setErrMsg("");
  }

  async function sendToTeam() {
    if (!contact.name || (!contact.email && !contact.phone)) {
      setSubmitted("err");
      setErrMsg("Tell us your name and either an email or phone so we can reach back.");
      return;
    }
    setSubmitted("sending");
    setErrMsg("");
    try {
      const payload = {
        slug: "thrive-church-sequim",
        form_type: "volunteer_quiz_result",
        name: contact.name,
        email: contact.email,
        phone: contact.phone,
        availability: answers.availability,
        gift: answers.gift,
        commitment: answers.commitment,
        avoid: answers.avoid,
        top_recommendation: recommendations[0]?.team.name,
        second_recommendation: recommendations[1]?.team.name,
        message: `Volunteer quiz result. Top picks: ${recommendations
          .map((r) => r.team.name)
          .join(" / ") || "none"}`,
      };
      const res = await fetch("/api/clients/inquire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };
      if (!res.ok || data.ok === false) {
        setSubmitted("err");
        setErrMsg(data.error || "Couldn't send. Try again or call (360) 683-7981.");
        return;
      }
      setSubmitted("ok");
    } catch {
      setSubmitted("err");
      setErrMsg("Network error. Try again or call (360) 683-7981.");
    }
  }

  // SUCCESS state
  if (submitted === "ok") {
    return (
      <div
        className="rounded-sm border border-[#0d4f4a]/15 bg-[#fbf7ee] p-8 sm:p-10"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        <CheckCircle size={36} weight="duotone" style={{ color: TEAL }} />
        <h3
          className="mt-5 font-[Fraunces] text-3xl tracking-tight text-[#0d4f4a]"
          style={{ fontWeight: 600 }}
        >
          On its way to the team.
        </h3>
        <p className="mt-3 text-[15px] leading-relaxed text-[#1b2922]/75">
          Someone from the {recommendations[0]?.team.name} team will reach out
          this week to introduce themselves and walk you in. Welcome.
        </p>
      </div>
    );
  }

  return (
    <div
      className="rounded-sm border border-[#0d4f4a]/15 bg-[#fbf7ee] p-7 sm:p-9 lg:p-11"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* progress */}
      <div className="mb-7 flex items-center justify-between text-[11px] uppercase tracking-[0.28em] text-[#0d4f4a]/70">
        <span>{done ? "Your matches" : `Question ${step + 1} of ${total}`}</span>
        <div className="flex gap-1.5">
          {Array.from({ length: total }).map((_, i) => (
            <span
              key={i}
              className="block h-1 w-6 rounded-full transition-colors"
              style={{
                background: i < step || done ? AMBER : "rgba(13,79,74,0.18)",
              }}
            />
          ))}
        </div>
      </div>

      {/* question */}
      {!done && (
        <div>
          <h3
            className="font-[Fraunces] text-[clamp(1.8rem,3.5vw,2.8rem)] leading-tight tracking-tight text-[#0d4f4a]"
            style={{ fontWeight: 500 }}
          >
            {QUESTIONS[step].label}
          </h3>
          <p className="mt-3 text-[14px] text-[#1b2922]/65">
            {QUESTIONS[step].helper}
          </p>

          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            {QUESTIONS[step].options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => pick(opt.value)}
                className="group flex items-center justify-between rounded-sm border border-[#0d4f4a]/15 bg-white px-5 py-4 text-left transition-all hover:-translate-y-0.5 hover:border-[#d97706] hover:bg-[#fdebbf]/40 hover:shadow-[0_12px_28px_-18px_rgba(217,119,6,0.5)]"
              >
                <span className="text-[15px] font-medium text-[#1b2922]">
                  {opt.label}
                </span>
                <ArrowRight
                  size={16}
                  weight="bold"
                  className="text-[#0d4f4a]/30 transition-all group-hover:translate-x-0.5 group-hover:text-[#d97706]"
                />
              </button>
            ))}
          </div>

          {step > 0 && (
            <button
              type="button"
              onClick={back}
              className="mt-7 inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.22em] text-[#0d4f4a]/70 transition-colors hover:text-[#d97706]"
            >
              <ArrowLeft size={12} weight="bold" />
              Back
            </button>
          )}
        </div>
      )}

      {/* result */}
      {done && (
        <div>
          <h3
            className="font-[Fraunces] text-[clamp(1.8rem,3.5vw,2.8rem)] leading-tight tracking-tight text-[#0d4f4a]"
            style={{ fontWeight: 500 }}
          >
            Sounds like you&rsquo;d be a great fit for…
          </h3>
          <p className="mt-3 text-[14px] text-[#1b2922]/65">
            Based on what you picked. These are starting suggestions — every
            team will train you and pair you with someone seasoned.
          </p>

          <div className="mt-7 space-y-4">
            {recommendations.length === 0 && (
              <div
                className="rounded-sm border border-[#0d4f4a]/15 bg-[#fdebbf]/40 p-5 text-[14px] text-[#1b2922]/80"
              >
                Hmm — no perfect match on the first pass. That just means
                you&rsquo;d be a great fit somewhere unusual. Sign up below
                and we&rsquo;ll find the right team for you in person.
              </div>
            )}
            {recommendations.map((r, idx) => (
              <div
                key={r.team.id}
                className="rounded-sm border border-[#0d4f4a]/15 bg-white p-5 transition-shadow hover:shadow-[0_14px_36px_-20px_rgba(13,79,74,0.35)] sm:p-6"
              >
                <div className="flex items-start gap-4">
                  <span
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-2xl"
                    style={{
                      background:
                        idx === 0
                          ? "rgba(217,119,6,0.12)"
                          : "rgba(13,79,74,0.08)",
                    }}
                  >
                    {r.team.emoji}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-[Fraunces] text-xl text-[#0d4f4a]">
                        {r.team.name}
                      </h4>
                      {idx === 0 && (
                        <span
                          className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.2em]"
                          style={{
                            background: AMBER,
                            color: CREAM,
                          }}
                        >
                          Best Fit
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-[14px] leading-relaxed text-[#1b2922]/72">
                      {r.team.blurb}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Contact capture */}
          <div className="mt-8 border-t border-[#0d4f4a]/15 pt-7">
            <p
              className="text-[11px] uppercase tracking-[0.24em] font-semibold text-[#0a3a36]"
            >
              Send your matches to the team
            </p>
            <p className="mt-2 text-[13px] text-[#1b2922]/70">
              We&rsquo;ll forward this to the team lead so they can reach out
              personally.
            </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <input
                type="text"
                placeholder="Your name"
                value={contact.name}
                onChange={(e) =>
                  setContact((c) => ({ ...c, name: e.target.value }))
                }
                className="rounded-sm border border-[#0d4f4a]/18 bg-white px-3 py-2.5 text-[15px] text-[#1b2922] outline-none transition-colors focus:border-[#d97706]"
              />
              <input
                type="email"
                placeholder="Email"
                value={contact.email}
                onChange={(e) =>
                  setContact((c) => ({ ...c, email: e.target.value }))
                }
                className="rounded-sm border border-[#0d4f4a]/18 bg-white px-3 py-2.5 text-[15px] text-[#1b2922] outline-none transition-colors focus:border-[#d97706]"
              />
              <input
                type="tel"
                placeholder="Phone"
                value={contact.phone}
                onChange={(e) =>
                  setContact((c) => ({ ...c, phone: e.target.value }))
                }
                className="rounded-sm border border-[#0d4f4a]/18 bg-white px-3 py-2.5 text-[15px] text-[#1b2922] outline-none transition-colors focus:border-[#d97706]"
              />
            </div>

            {submitted === "err" && (
              <div
                className="mt-4 flex items-start gap-2 rounded-sm border px-4 py-3 text-[13px]"
                style={{
                  color: "#7a1f1f",
                  background: "#fbeaea",
                  borderColor: "rgba(122,31,31,0.18)",
                }}
              >
                <Warning size={16} weight="fill" className="mt-0.5 shrink-0" />
                <span>{errMsg}</span>
              </div>
            )}

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={restart}
                className="text-[12px] uppercase tracking-[0.22em] text-[#0d4f4a]/70 transition-colors hover:text-[#d97706]"
              >
                Retake the quiz
              </button>
              <div className="flex items-center gap-3">
                {onDone && (
                  <button
                    type="button"
                    onClick={onDone}
                    className="text-[12px] uppercase tracking-[0.22em] text-[#0d4f4a]/70 transition-colors hover:text-[#d97706]"
                  >
                    Skip — fill the form instead
                  </button>
                )}
                <button
                  type="button"
                  onClick={sendToTeam}
                  disabled={submitted === "sending"}
                  className="inline-flex items-center gap-2 rounded-full bg-[#d97706] px-6 py-3 text-[12px] font-bold uppercase tracking-[0.16em] text-[#fbf7ee] transition-all hover:bg-[#b45309] hover:shadow-[0_14px_36px_-14px_rgba(217,119,6,0.6)] disabled:cursor-wait disabled:opacity-60"
                >
                  {submitted === "sending" ? "Sending…" : "Send to the team"}
                  <Sparkle size={14} weight="fill" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
