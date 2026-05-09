"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import MadieCelebration from "./MadieCelebration";
import { useRole } from "@/lib/use-role";

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
  streakDays: number;
  streakIncludesToday: boolean;
};

type CommissionStats = {
  monthCommissionUsd: number;
  monthWebsiteCloses: number;
  monthAiSystemCloses: number;
  monthGoalUsd: number;
  monthGoalPct: number;
  lifetimeCommissionUsd: number;
  lifetimeCloses: number;
  nextMilestone: number | null;
  distanceToMilestone: number | null;
  closesNeededWebsite: number | null;
  closesNeededAiSystem: number | null;
  rates: { website: number; ai_system: number };
  tier: "setter" | "closer";
  currentLap: number;
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
  const role = useRole();
  const [stats, setStats] = useState<MadieStats | null>(null);
  const [commission, setCommission] = useState<CommissionStats | null>(null);
  const [lapOverride, setLapOverride] = useState<number | null>(null);
  const [advancing, setAdvancing] = useState(false);

  const loadAll = async () => {
    try {
      const [statsRes, commRes, lapRes] = await Promise.all([
        fetch("/api/madie/today", { credentials: "include" }),
        fetch("/api/madie/commission", { credentials: "include" }),
        fetch("/api/madie/lap-override", { credentials: "include" }),
      ]);
      if (statsRes.ok) {
        const j = (await statsRes.json()) as MadieStats;
        setStats(j);
      }
      if (commRes.ok) {
        const j = (await commRes.json()) as CommissionStats;
        setCommission(j);
      }
      if (lapRes.ok) {
        const j = (await lapRes.json()) as { lap: number | null };
        setLapOverride(j.lap);
      }
    } catch (err) {
      console.warn("[MadieRaceTrack]", err);
    }
  };

  useEffect(() => {
    void loadAll();
    const t = setInterval(loadAll, 60_000);
    return () => clearInterval(t);
  }, []);

  // Owner-only: graduate Madie to a specific lap. Persists via PUT
  // to /api/madie/lap-override; UI reflects the new lap on next
  // render (from the response, no extra fetch needed).
  const advanceLap = async (toLap: number) => {
    if (advancing) return;
    setAdvancing(true);
    try {
      const r = await fetch("/api/madie/lap-override", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ lap: toLap }),
      });
      if (r.ok) {
        setLapOverride(toLap);
      } else {
        const j = (await r.json().catch(() => null)) as { error?: string } | null;
        alert(`Failed to advance: ${j?.error || `HTTP ${r.status}`}`);
      }
    } catch (err) {
      alert(`Failed to advance: ${err instanceof Error ? err.message : "unknown"}`);
    } finally {
      setAdvancing(false);
    }
  };

  // Lap-override (set by Ben via the admin button) wins over the
  // heuristic call-volume detector. Allows manual graduation through
  // the skill-based laps (3-5) which can't be inferred from call data.
  const heuristicLevel = computeCurrentLevel(stats);
  const currentLevel =
    lapOverride != null ? Math.max(lapOverride, heuristicLevel) : heuristicLevel;

  const levels: Level[] = [
    {
      n: 1,
      emoji: "🎙️",
      title: "Cold Caller",
      subtitle: "100 dials a day · 3 meetings booked · become a phone weapon",
      unlockCriterion:
        "Land 1 full week of 100/3 cadence — 500 calls + 15 meetings minimum.",
      skill: "Voice on the phone · objection handling · pace under pressure",
      commission: "🎯 Setter tier · $200/website · $1,000/AI System per close",
      status:
        currentLevel > 1
          ? "completed"
          : currentLevel === 1
            ? "current"
            : "locked",
      // No CTA — this card renders inside /dashboard/script itself,
      // so a "Start dialing →" button pointing back to the page she's
      // already on was a no-op and confusing. Removed 2026-05-08.
    },
    {
      n: 2,
      emoji: "📁",
      title: "Preview Generator",
      subtitle: "50+ V2 previews/week · cold outreach at scale",
      unlockCriterion:
        "Generate 100 V2 previews + send 50 cold-pitch links from the portfolio library.",
      skill: "Speed + scale · category-matched personalization",
      commission: "🎯 Still Setter tier · $200/website · $1,000/AI System · multiplies your pipeline 5-10×",
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
      commission: "🎯 Setter tier · close-rate jumps because warm prospects say yes faster · same $200/$1k rates apply but you're closing 3-5× more",
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
      commission: "🎯 Setter tier · sets up the $9,700 close motion · every $1,000 setter commission lands here",
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
      commission: "🚀 CLOSER tier unlocks · rates DOUBLE · $400/website · $2,000/AI System per close",
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
      unlockCriterion: "First paid close YOU ran end-to-end. Then the second. Then the streak.",
      skill: "$400 per $997 website · $2,000 per AI System ($9,700+) — top tier",
      commission: "💎 10 closes/month at $10k tier = $20k/mo for you · the prize",
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
      {/* Achievement celebrations — confetti + banner overlay. Fires
          when Madie crosses 100 calls / 3 meetings / first commission /
          lap-up. localStorage-deduped so refreshing doesn't re-fire. */}
      <MadieCelebration
        callsToday={stats?.callsToday ?? 0}
        meetingsToday={stats?.meetingsToday ?? 0}
        monthCommissionUsd={commission?.monthCommissionUsd ?? 0}
        currentLap={currentLevel}
      />

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
        <div className="flex items-start justify-between gap-3 flex-wrap mb-1">
          <p className="text-[10px] uppercase tracking-[0.28em] font-bold text-violet-300">
            🏁 Welcome back · the race
          </p>
          {/* Streak pill — visible whenever streak > 0 OR today is blank
              (motivational nudge to start). Solid orange flame when
              streak ≥ 7 days; ember when streak ≤ 7. */}
          {stats && <StreakPill stats={stats} />}
        </div>
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

        {/* Owner-only: manual lap-advance admin panel. Hidden from
            sales role. Lets Ben graduate Madie past the heuristic
            detection when she demonstrates Lap 3+ skills. */}
        {role === "owner" && (
          <div className="mb-5 rounded-xl border border-amber-500/40 bg-amber-500/[0.08] p-3 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <p className="text-[10px] uppercase tracking-wider font-bold text-amber-300 mb-0.5">
                ⚙ Admin · lap controls
              </p>
              <p className="text-[11px] text-amber-100">
                Currently:{" "}
                <span className="font-bold tabular-nums">Lap {currentLevel}</span>
                {lapOverride != null && (
                  <span className="text-amber-300/80">
                    {" "}
                    · override active (Lap {lapOverride})
                  </span>
                )}
                {lapOverride == null && heuristicLevel > 1 && (
                  <span className="text-amber-300/80">
                    {" "}
                    · auto-detected from call volume
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {[1, 2, 3, 4, 5, 6].map((n) => {
                const isCurrent = n === currentLevel;
                return (
                  <button
                    key={n}
                    type="button"
                    onClick={() => advanceLap(n)}
                    disabled={advancing || isCurrent}
                    className={`text-[11px] font-bold rounded px-2.5 py-1 transition-colors ${
                      isCurrent
                        ? "bg-amber-500 text-amber-950 cursor-default"
                        : "border border-amber-500/40 text-amber-200 hover:bg-amber-500/15 disabled:opacity-50"
                    }`}
                  >
                    Lap {n}
                  </button>
                );
              })}
            </div>
          </div>
        )}

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

        {/* Commission ticker — money earned this month + next-milestone gap.
            Big and front-and-center. The whole race exists for this. */}
        {commission && (
          <CommissionTicker commission={commission} />
        )}

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

function StreakPill({ stats }: { stats: MadieStats }) {
  const days = stats.streakDays;
  const live = stats.streakIncludesToday;

  if (days === 0) {
    return (
      <span className="text-[11px] font-bold rounded-full border border-amber-500/40 bg-amber-500/10 text-amber-200 px-3 py-1 flex items-center gap-1.5 whitespace-nowrap">
        <span>🎯</span>
        <span>Start your streak — 1 call today</span>
      </span>
    );
  }

  // Hot streak: 7+ days · animated flame
  const isHot = days >= 7;
  return (
    <span
      className={`text-[11px] font-bold rounded-full border px-3 py-1 flex items-center gap-1.5 whitespace-nowrap ${
        isHot
          ? "border-orange-500/50 bg-orange-500/15 text-orange-200"
          : "border-amber-500/40 bg-amber-500/10 text-amber-200"
      }`}
      title={
        live
          ? `${days}-day streak (today logged)`
          : `${days}-day streak — make 1 call today to extend it`
      }
    >
      <span className={isHot ? "animate-pulse" : ""}>🔥</span>
      <span className="tabular-nums">{days}-day streak</span>
      {!live && (
        <span className="text-amber-300/80 italic font-normal">· today blank</span>
      )}
    </span>
  );
}

function CommissionTicker({ commission }: { commission: CommissionStats }) {
  const monthUsd = commission.monthCommissionUsd;
  const goalPct = commission.monthGoalPct;
  const next = commission.nextMilestone;
  const gap = commission.distanceToMilestone;
  const tierLabel = commission.tier === "closer" ? "Closer tier" : "Setter tier";
  const tierIcon = commission.tier === "closer" ? "💎" : "🎯";

  return (
    <div className="rounded-2xl border border-emerald-500/40 bg-gradient-to-br from-emerald-500/[0.10] via-lime-500/[0.06] to-emerald-500/[0.04] p-4 sm:p-5 mb-5 relative overflow-hidden">
      {/* Money-stripe accent */}
      <div
        aria-hidden="true"
        className="absolute -top-1 -right-1 -bottom-1 w-24 opacity-20 pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, rgba(16,185,129,0.6) 0 10px, transparent 10px 20px)",
        }}
      />
      <div className="relative flex items-baseline justify-between gap-3 flex-wrap">
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-emerald-300 mb-1 flex items-center gap-2">
            <span>💰 Earned this month</span>
            <span className="text-[9px] font-bold rounded-full border border-emerald-400/40 bg-emerald-500/10 text-emerald-100 px-2 py-0.5 normal-case tracking-wide">
              {tierIcon} {tierLabel} · ${commission.rates.website}/website · ${commission.rates.ai_system}/AI System
            </span>
          </p>
          <p className="text-4xl sm:text-5xl font-black text-white tabular-nums leading-none">
            ${monthUsd.toLocaleString()}
          </p>
          <p className="text-[12px] text-slate-300 mt-1">
            {commission.monthAiSystemCloses > 0 && (
              <span className="text-violet-200 font-bold">
                {commission.monthAiSystemCloses} AI System
              </span>
            )}
            {commission.monthAiSystemCloses > 0 &&
              commission.monthWebsiteCloses > 0 && (
                <span className="text-slate-500"> · </span>
              )}
            {commission.monthWebsiteCloses > 0 && (
              <span className="text-sky-200 font-bold">
                {commission.monthWebsiteCloses} website
              </span>
            )}
            {commission.monthAiSystemCloses === 0 &&
              commission.monthWebsiteCloses === 0 && (
                <span className="italic text-slate-500">
                  No closes yet this month — first one starts the streak
                </span>
              )}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-wider font-bold text-emerald-300 mb-0.5">
            $20k month goal
          </p>
          <p className="text-3xl font-black text-emerald-200 tabular-nums">
            {goalPct}%
          </p>
          <div className="relative h-1.5 rounded-full bg-white/[0.06] overflow-hidden w-32 sm:w-44 mt-1.5">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-400 to-lime-400 transition-all duration-700"
              style={{ width: `${Math.min(100, goalPct)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Next milestone callout */}
      {next != null && gap != null && gap > 0 && (
        <div className="relative mt-4 pt-4 border-t border-white/[0.08] flex items-baseline justify-between gap-3 flex-wrap">
          <p className="text-sm text-slate-200">
            <span className="text-emerald-300 font-bold">${gap.toLocaleString()} away</span>{" "}
            from the next milestone:{" "}
            <span className="text-white font-black tabular-nums">
              ${next.toLocaleString()}
            </span>
          </p>
          <p className="text-[11px] text-slate-400">
            ={" "}
            <span className="font-bold text-violet-200 tabular-nums">
              {commission.closesNeededAiSystem}
            </span>{" "}
            AI System close{commission.closesNeededAiSystem === 1 ? "" : "s"}
            {" or "}
            <span className="font-bold text-sky-200 tabular-nums">
              {commission.closesNeededWebsite}
            </span>{" "}
            website close{commission.closesNeededWebsite === 1 ? "" : "s"}
          </p>
        </div>
      )}

      {next == null && monthUsd > 0 && (
        <p className="relative mt-4 pt-4 border-t border-white/[0.08] text-sm text-emerald-200 italic">
          🏆 You&apos;ve passed every milestone this month. Welcome to the top.
        </p>
      )}
    </div>
  );
}

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

  // CTAs that pointed back at /dashboard/script have been removed —
  // this race-track renders INSIDE /dashboard/script itself, so those
  // buttons were no-ops. Remaining CTAs point to genuinely-different
  // pages (Portfolio Library, Win-Loss) only.
  if (level === 1) {
    if (callsToday < 25) {
      return {
        headline: "First 25 calls — start your block.",
        detail:
          "Pick your window — naptime, after drop-off, before pickup, evening. The script is right there. Nothing to think about. Just dial.",
      };
    }
    if (callsToday < 100) {
      return {
        headline: `${100 - callsToday} more dials to hit 100.`,
        detail:
          "You're in the zone. Keep dialing. Every call is a lap closer to Lap 2.",
      };
    }
    if (meetingsToday < 3) {
      return {
        headline: `${3 - meetingsToday} more meetings to hit today's quota.`,
        detail:
          "100 calls done — now convert. Check the Win-Loss banner; weave this week's top objection-tweak into your next pitch.",
        ctaLabel: "Run pitch review",
        ctaHref: "/dashboard/win-loss",
      };
    }
    return {
      headline: "🔥 Daily quota crushed. Keep the streak.",
      detail:
        "100/3 done. Every extra call right now is bonus. Aim for one more meeting before EOD — that's the streak Lap 2 is built on.",
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
    detail: "Pick up where you left off.",
  };
}
