"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

/**
 * MadieRaceTrack — gamified onboarding + progression UI for the
 * sales role. Madie sees this at the top of /dashboard/script every
 * time she logs in. Frames her growth as a 6-lap race with each lap
 * unlocking a new skill + commission ceiling. Designed to be fun.
 *
 * Levels (locked 2026-05-08 per Ben's spec):
 *   1. Cold Caller       — 100 calls / 3 meetings daily cadence
 *   2. Preview Generator — mass V2 preview generation for cold outreach
 *   3. Bespoke Architect — custom mock sites for warm leads
 *   4. AI Backend Builder — mock-backend demos for $10k prospects
 *   5. Backend Customizer — live customization in close meetings
 *   6. Closer            — $400/website + $2,000/AI System per close
 *
 * Reads /api/madie/today for live stats. Auto-detects current level
 * from cumulative numbers (placeholder logic for v1 — refine when
 * skill-graduation events get logged).
 */

type MadieStats = {
  callsToday: number;
  meetingsToday: number;
  callsWeek: number;
  meetingsWeek: number;
  callsTarget: number;
  meetingsTarget: number;
  paceVsExpected: number | null;
};

type Level = {
  n: number;
  emoji: string;
  title: string;
  subtitle: string;
  unlockCriterion: string;
  skill: string;
  commission: string;
  status: "completed" | "current" | "locked";
  ctaLabel?: string;
  ctaHref?: string;
};

export default function MadieRaceTrack() {
  const [stats, setStats] = useState<MadieStats | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const r = await fetch("/api/madie/today", { credentials: "include" });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const j = (await r.json()) as MadieStats;
        if (!cancelled) setStats(j);
      } catch (err) {
        console.warn("[MadieRaceTrack]", err);
      }
    };
    load();
    const t = setInterval(load, 60_000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, []);

  // Determine current level from stats. v1: progression is mostly
  // hand-rolled; the real graduation gates ship when skill-completion
  // events (preview-generated, mock-site-shipped, backend-customized,
  // close-won) get logged. For now: Madie advances based on cumulative
  // call volume + closes-implied behavior. Ben can flip this to
  // explicit advancement in /dashboard or via Supabase.
  const currentLevel = computeCurrentLevel(stats);

  const levels: Level[] = [
    {
      n: 1,
      emoji: "🎙️",
      title: "Cold Caller",
      subtitle: "100 dials a day · 3 meetings booked · become a phone weapon",
      unlockCriterion:
        "Land 1 full week of 100/3 cadence — 500 calls + 15 meetings minimum.",
      skill: "Voice on the phone · objection handling · pace under pressure",
      commission: "Foundation tier — every close from here on is YOURS",
      status:
        currentLevel > 1
          ? "completed"
          : currentLevel === 1
            ? "current"
            : "locked",
      ctaLabel: "Start dialing →",
      ctaHref: "/dashboard/script",
    },
    {
      n: 2,
      emoji: "📁",
      title: "Preview Generator",
      subtitle: "50+ V2 previews/week · cold outreach at scale",
      unlockCriterion:
        "Generate 100 V2 previews + send 50 cold-pitch links from the portfolio library.",
      skill: "Speed + scale · category-matched personalization",
      commission: "Multiplies your pipeline 5-10×",
      status:
        currentLevel > 2
          ? "completed"
          : currentLevel === 2
            ? "current"
            : "locked",
      ctaLabel: "Open Portfolio Library →",
      ctaHref: "/dashboard/script/portfolio",
    },
    {
      n: 3,
      emoji: "🎨",
      title: "Bespoke Architect",
      subtitle: "When cold turns warm — build a custom mock site",
      unlockCriterion:
        "Build 3 bespoke mock showcases for warm leads (ship a /clients/<their-slug> page in <1 hr).",
      skill: "Trust through customization · the moment 'maybe' becomes 'yes'",
      commission: "Unlocks $400 commissions on $997 closes",
      status:
        currentLevel > 3
          ? "completed"
          : currentLevel === 3
            ? "current"
            : "locked",
    },
    {
      n: 4,
      emoji: "🧠",
      title: "AI Backend Builder",
      subtitle: "$10k prospects need to SEE the AI Operator running",
      unlockCriterion:
        "Demo the mock-backend pattern (Meyer-style /portal-demo) to 5 qualified $10k prospects.",
      skill: "Deploy the mock backend · password-gate it · run the live walkthrough",
      commission: "Sets up the $9,700 close motion",
      status:
        currentLevel > 4
          ? "completed"
          : currentLevel === 4
            ? "current"
            : "locked",
    },
    {
      n: 5,
      emoji: "🛠️",
      title: "Backend Customizer",
      subtitle: "Live-customize the backend in the close meeting",
      unlockCriterion:
        "Customize 3 mock backends with prospect-specific data DURING a close meeting.",
      skill: "Real-time confidence · the demo that closes itself",
      commission: "Unlocks $2,000 commissions on $9,700 closes",
      status:
        currentLevel > 5
          ? "completed"
          : currentLevel === 5
            ? "current"
            : "locked",
    },
    {
      n: 6,
      emoji: "💰",
      title: "Closer",
      subtitle: "Cash in the bank · streaks · leaderboard top",
      unlockCriterion: "First paid close. Then the second. Then the streak.",
      skill: "$400 per $997 website · $2,000 per AI System ($9,700+)",
      commission: "10 closes/month at $10k tier = $20k/mo for you",
      status:
        currentLevel >= 6
          ? "current"
          : "locked",
    },
  ];

  const callsTarget = stats?.callsTarget ?? 100;
  const meetingsTarget = stats?.meetingsTarget ?? 3;
  const callsToday = stats?.callsToday ?? 0;
  const meetingsToday = stats?.meetingsToday ?? 0;
  const callsWeek = stats?.callsWeek ?? 0;
  const meetingsWeek = stats?.meetingsWeek ?? 0;

  const todayMission = pickMission(currentLevel, stats);

  return (
    <div className="rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-950/60 via-slate-950/80 to-fuchsia-950/40 p-5 sm:p-6 mb-4 relative overflow-hidden">
      {/* Decorative race-stripe accent */}
      <div
        aria-hidden="true"
        className="absolute -top-1 -right-1 -bottom-1 w-32 opacity-20 pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, rgba(168,85,247,0.5) 0 12px, transparent 12px 24px)",
        }}
      />

      {/* Hero */}
      <div className="relative">
        <p className="text-[10px] uppercase tracking-[0.28em] font-bold text-violet-300 mb-1">
          🏁 Welcome back · the race
        </p>
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-1">
          Hi Madie.{" "}
          <span className="bg-gradient-to-r from-violet-300 to-fuchsia-300 bg-clip-text text-transparent">
            6 laps to a $20k month.
          </span>
        </h2>
        <p className="text-sm text-slate-300 leading-relaxed mb-5 max-w-3xl">
          Every conversation is a lap. Every lap unlocks a new skill + a higher
          commission ceiling. The race rewards consistency: the operators who
          dial 100 calls a day for 30 days hit Lap 6 within their first 90 days.
          The ones who skip days don&apos;t. Pick a lap, run it, level up.
        </p>

        {/* This week's velocity */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
          <RaceStat
            label="Calls today"
            value={callsToday}
            target={callsTarget}
            tone="violet"
            emoji="📞"
          />
          <RaceStat
            label="Meetings today"
            value={meetingsToday}
            target={meetingsTarget}
            tone="emerald"
            emoji="📅"
          />
          <RaceStat
            label="Calls this week"
            value={callsWeek}
            target={callsTarget * 5}
            tone="sky"
            emoji="🔥"
          />
          <RaceStat
            label="Meetings this week"
            value={meetingsWeek}
            target={meetingsTarget * 5}
            tone="amber"
            emoji="🎯"
          />
        </div>

        {/* Today's mission CTA */}
        <div className="rounded-xl border border-emerald-500/40 bg-gradient-to-br from-emerald-500/[0.10] to-lime-500/[0.06] p-4 mb-5 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-wider font-bold text-emerald-300 mb-1">
              🚩 Today&apos;s mission
            </p>
            <p className="text-base font-bold text-white">{todayMission.headline}</p>
            <p className="text-sm text-slate-300 mt-1">{todayMission.detail}</p>
          </div>
          {todayMission.ctaHref && (
            <Link
              href={todayMission.ctaHref}
              className="text-sm font-bold rounded-lg bg-emerald-500 hover:bg-emerald-400 text-emerald-950 px-4 py-2.5 whitespace-nowrap"
            >
              {todayMission.ctaLabel} →
            </Link>
          )}
        </div>

        {/* Race track — 6 laps */}
        <div className="space-y-2">
          <div className="flex items-baseline justify-between mb-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
              The 6 Laps
            </h3>
            <p className="text-[11px] text-slate-500">
              Currently on Lap{" "}
              <span className="font-black text-violet-300 tabular-nums">
                {currentLevel}
              </span>{" "}
              of 6
            </p>
          </div>

          {levels.map((level) => (
            <LevelRow key={level.n} level={level} />
          ))}
        </div>

        {/* Footer rally cry */}
        <p className="text-center text-[12px] text-slate-400 mt-5 italic">
          &ldquo;The compound curve doesn&apos;t bend until ~Day 25. Show up
          every day. Lap 6 is closer than it feels.&rdquo;
        </p>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────── */
// Sub-components
/* ──────────────────────────────────────────────────────────────────── */

function RaceStat({
  label,
  value,
  target,
  tone,
  emoji,
}: {
  label: string;
  value: number;
  target: number;
  tone: "violet" | "emerald" | "sky" | "amber";
  emoji: string;
}) {
  const pct = target > 0 ? Math.min(100, Math.round((value / target) * 100)) : 0;
  const cls =
    tone === "violet"
      ? { border: "border-violet-500/30", bg: "bg-violet-500/[0.08]", bar: "from-violet-500 to-fuchsia-500", text: "text-violet-200" }
      : tone === "emerald"
        ? { border: "border-emerald-500/30", bg: "bg-emerald-500/[0.08]", bar: "from-emerald-500 to-lime-500", text: "text-emerald-200" }
        : tone === "sky"
          ? { border: "border-sky-500/30", bg: "bg-sky-500/[0.08]", bar: "from-sky-500 to-cyan-500", text: "text-sky-200" }
          : { border: "border-amber-500/30", bg: "bg-amber-500/[0.08]", bar: "from-amber-500 to-orange-500", text: "text-amber-200" };

  return (
    <div className={`rounded-lg border ${cls.border} ${cls.bg} px-3 py-2`}>
      <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 truncate flex items-center gap-1">
        <span>{emoji}</span> {label}
      </p>
      <div className="flex items-baseline justify-between gap-2 mt-0.5">
        <span className={`text-2xl font-black tabular-nums ${cls.text}`}>
          {value}
        </span>
        <span className="text-[11px] text-slate-500 tabular-nums">
          / {target}
        </span>
      </div>
      <div className="relative h-1 rounded-full bg-white/[0.08] overflow-hidden mt-1.5">
        <div
          className={`absolute inset-y-0 left-0 bg-gradient-to-r ${cls.bar} transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function LevelRow({ level }: { level: Level }) {
  const isCompleted = level.status === "completed";
  const isCurrent = level.status === "current";
  const isLocked = level.status === "locked";

  return (
    <div
      className={`rounded-xl border p-3 sm:p-4 transition-all ${
        isCurrent
          ? "border-violet-500/60 bg-gradient-to-br from-violet-500/[0.12] to-fuchsia-500/[0.05] ring-2 ring-violet-500/30 shadow-[0_0_30px_rgba(168,85,247,0.18)]"
          : isCompleted
            ? "border-emerald-500/40 bg-emerald-500/[0.05]"
            : "border-slate-800 bg-slate-900/40 opacity-60"
      }`}
    >
      <div className="flex items-start gap-3 sm:gap-4">
        {/* Lap number medallion */}
        <div
          className={`shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-2xl border-2 ${
            isCompleted
              ? "border-emerald-500 bg-emerald-500/15 text-emerald-200"
              : isCurrent
                ? "border-violet-500 bg-violet-500/20 text-white animate-pulse"
                : "border-slate-700 bg-slate-800 text-slate-500"
          }`}
        >
          {isCompleted ? "✓" : level.emoji}
        </div>

        <div className="flex-1 min-w-0">
          {/* Header line */}
          <div className="flex items-baseline gap-2 flex-wrap mb-0.5">
            <span
              className={`text-[10px] uppercase tracking-[0.22em] font-black ${
                isCurrent
                  ? "text-violet-300"
                  : isCompleted
                    ? "text-emerald-300"
                    : "text-slate-500"
              }`}
            >
              Lap {level.n}
            </span>
            {isCurrent && (
              <span className="text-[9px] uppercase tracking-wider font-bold rounded-full border border-violet-500/40 bg-violet-500/15 text-violet-200 px-1.5 py-0.5">
                ⚡ live
              </span>
            )}
            {isCompleted && (
              <span className="text-[9px] uppercase tracking-wider font-bold rounded-full border border-emerald-500/40 bg-emerald-500/15 text-emerald-200 px-1.5 py-0.5">
                ✓ done
              </span>
            )}
            {isLocked && (
              <span className="text-[9px] uppercase tracking-wider font-bold rounded-full border border-slate-700 bg-slate-800 text-slate-500 px-1.5 py-0.5">
                🔒 locked
              </span>
            )}
          </div>
          <h4
            className={`text-base sm:text-lg font-black tracking-tight ${
              isLocked ? "text-slate-400" : "text-white"
            }`}
          >
            {level.title}
          </h4>
          <p
            className={`text-sm leading-snug mt-0.5 ${
              isLocked ? "text-slate-500" : "text-slate-300"
            }`}
          >
            {level.subtitle}
          </p>

          {/* Detail block — only shown for current + completed */}
          {!isLocked && (
            <div className="mt-3 grid sm:grid-cols-3 gap-2 text-[11px]">
              <DetailChip label="Unlock when" tone="amber">
                {level.unlockCriterion}
              </DetailChip>
              <DetailChip label="Skill" tone="sky">
                {level.skill}
              </DetailChip>
              <DetailChip label="$$$" tone="emerald">
                {level.commission}
              </DetailChip>
            </div>
          )}

          {/* CTA on current lap only */}
          {isCurrent && level.ctaHref && level.ctaLabel && (
            <Link
              href={level.ctaHref}
              className="inline-block mt-3 text-xs font-bold rounded bg-violet-500 hover:bg-violet-400 text-white px-3 py-2"
            >
              {level.ctaLabel}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailChip({
  label,
  tone,
  children,
}: {
  label: string;
  tone: "amber" | "sky" | "emerald";
  children: React.ReactNode;
}) {
  const cls =
    tone === "amber"
      ? "border-amber-500/30 bg-amber-500/[0.06] text-amber-100"
      : tone === "sky"
        ? "border-sky-500/30 bg-sky-500/[0.06] text-sky-100"
        : "border-emerald-500/30 bg-emerald-500/[0.06] text-emerald-100";
  return (
    <div className={`rounded-lg border ${cls} px-2.5 py-2`}>
      <p className="text-[9px] uppercase tracking-wider font-bold opacity-70 mb-0.5">
        {label}
      </p>
      <p className="text-[11px] leading-snug">{children}</p>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────── */
// Helpers
/* ──────────────────────────────────────────────────────────────────── */

function computeCurrentLevel(stats: MadieStats | null): number {
  // Heuristic level detection from cumulative stats. v1 — refine when
  // skill-graduation events are logged. Conservative: only advances
  // past Lap 1 when she clears the week-cadence gate.
  if (!stats) return 1;
  const totalCalls = stats.callsWeek;
  const totalMeetings = stats.meetingsWeek;
  if (totalCalls < 500) return 1; // Lap 1 = haven't cleared the 500-call week yet
  if (totalCalls < 1000 || totalMeetings < 30) return 2; // Lap 2 = preview-gen
  // Laps 3-5 require Ben to flip a flag once she hits the skill gate
  // (mock-site shipped, mock-backend demo'd, customization done).
  // Default to Lap 2 until that's wired.
  return 2;
}

type Mission = {
  headline: string;
  detail: string;
  ctaLabel?: string;
  ctaHref?: string;
};

function pickMission(level: number, stats: MadieStats | null): Mission {
  const callsToday = stats?.callsToday ?? 0;
  const meetingsToday = stats?.meetingsToday ?? 0;

  if (level === 1) {
    if (callsToday < 25) {
      return {
        headline: "Get to 25 calls before lunch.",
        detail:
          "First quarter of the day sets the tone. Open the Sales Portal, hit Start, dial. The script is right there — nothing to think about.",
        ctaLabel: "Open Sales Portal",
        ctaHref: "/dashboard/script",
      };
    }
    if (callsToday < 100) {
      return {
        headline: `${100 - callsToday} more dials to hit 100.`,
        detail:
          "You're in the zone. Keep dialing. Every call is a lap closer to Lap 2.",
        ctaLabel: "Keep going",
        ctaHref: "/dashboard/script",
      };
    }
    if (meetingsToday < 3) {
      return {
        headline: `${3 - meetingsToday} more meetings to hit today's quota.`,
        detail:
          "100 calls done — now convert. Open the Win-Loss banner above; check this week's top objection, weave the suggested tweak into your next pitch.",
        ctaLabel: "Run pitch review",
        ctaHref: "/dashboard/win-loss",
      };
    }
    return {
      headline: "🔥 Daily quota crushed. Keep the streak.",
      detail:
        "100/3 done. Every extra call right now is bonus. Aim for one more meeting before EOD — that's the streak Lap 2 is built on.",
      ctaLabel: "Bonus dials",
      ctaHref: "/dashboard/script",
    };
  }

  if (level === 2) {
    return {
      headline: "Open the Portfolio Library — pick 5 cold matches today.",
      detail:
        "You've earned scale. For every cold prospect today, find the closest portfolio showcase by category and copy that link instead of the generic preview. Real client work converts 3-5× higher.",
      ctaLabel: "Portfolio Library",
      ctaHref: "/dashboard/script/portfolio",
    };
  }

  return {
    headline: "Keep showing up. The race rewards consistency.",
    detail: "Open the Sales Portal and pick up where you left off.",
    ctaLabel: "Sales Portal",
    ctaHref: "/dashboard/script",
  };
}
