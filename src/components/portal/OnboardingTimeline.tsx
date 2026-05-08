"use client";

/**
 * OnboardingTimeline — 14-day "what to expect" timeline rendered on
 * the portal Overview tab for clients in their first 14 days post-
 * purchase.
 *
 * Reduces day-1 anxiety on the AI Package: client just spent $9,700,
 * gets a Stripe receipt, then... silence until kickoff. Timeline
 * shows them exactly what's happening day-by-day for the first two
 * weeks so they can see progress against expectations.
 *
 * Computes milestones from prospect.paidAt (or fallback to now-X
 * if paidAt is missing). Each milestone has a status:
 *   done    — date is in the past
 *   today   — date is today
 *   coming  — date is in the future
 *
 * Auto-hides after day 14 — at that point the client knows the
 * rhythm and the timeline becomes noise.
 */

const DAY_MS = 24 * 60 * 60 * 1000;

type Milestone = {
  day: number;
  title: string;
  detail: string;
  emoji: string;
};

const MILESTONES: Milestone[] = [
  {
    day: 0,
    emoji: "🚀",
    title: "Welcome + discovery starts",
    detail:
      "Payment lands, kickoff doc starts. You get an email today + portal login by tomorrow.",
  },
  {
    day: 1,
    emoji: "🔍",
    title: "Audience research + competitor scan",
    detail:
      "We map your three customer types, scan your top 5 competitors, draft your three-track funnel architecture.",
  },
  {
    day: 3,
    emoji: "📞",
    title: "Discovery call (30 min)",
    detail:
      "Walk through the funnel mock together. Confirm audience targeting + nail down the lead magnet concept.",
  },
  {
    day: 5,
    emoji: "✏️",
    title: "Site copy + ad creative drafts",
    detail:
      "First-draft headlines, sub-heads, services, three audience-specific landing variants. You review + comment.",
  },
  {
    day: 7,
    emoji: "🌐",
    title: "Site goes live in staging",
    detail:
      "Full polished site on a staging URL. You walk it, request changes, we iterate.",
  },
  {
    day: 10,
    emoji: "📡",
    title: "Ad accounts + tracking wired",
    detail:
      "Meta + Google ad accounts approved, Conversions API live, GA4 + Clarity tracking firing.",
  },
  {
    day: 12,
    emoji: "✉️",
    title: "Funnel sequences live",
    detail:
      "Per-audience email + SMS + voicemail sequences enrolled and ready to fire on inbound leads.",
  },
  {
    day: 14,
    emoji: "🎯",
    title: "First lead lands",
    detail:
      "Ads on, funnel running, lead-magnet quiz live. Watch the leads tab fill up + the AI auto-replies kick in.",
  },
];

function computeStatus(milestoneDate: number, now: number): "done" | "today" | "coming" {
  const dayDiff = Math.floor((now - milestoneDate) / DAY_MS);
  if (dayDiff > 0) return "done";
  if (dayDiff === 0) return "today";
  return "coming";
}

export default function OnboardingTimeline({
  paidAt,
}: {
  /** ISO date string when the AI Package was paid. Falls back to now()
   *  if missing — the timeline still renders but every milestone is
   *  "coming." */
  paidAt?: string | null;
}) {
  const startMs = paidAt ? new Date(paidAt).getTime() : Date.now();
  const nowMs = Date.now();
  const daysSinceStart = Math.floor((nowMs - startMs) / DAY_MS);

  // Auto-hide after day 14 — past that, the client knows the rhythm.
  if (daysSinceStart > 14) return null;

  return (
    <div className="rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-950/30 via-slate-900/40 to-slate-900/60 p-5 sm:p-6">
      <div className="flex items-baseline justify-between gap-3 flex-wrap mb-5">
        <div>
          <p className="text-[10px] uppercase tracking-[0.22em] text-violet-300 font-bold mb-1">
            What to expect · first 14 days
          </p>
          <h3 className="text-base sm:text-lg font-black text-violet-100">
            🗓️ Day {Math.max(0, daysSinceStart)} of 14
          </h3>
        </div>
        {daysSinceStart >= 0 && daysSinceStart <= 14 && (
          <ProgressPill day={daysSinceStart} />
        )}
      </div>

      <ol className="space-y-2.5">
        {MILESTONES.map((m) => {
          const milestoneMs = startMs + m.day * DAY_MS;
          const status = computeStatus(milestoneMs, nowMs);
          return (
            <li
              key={m.day}
              className={`relative pl-10 pr-3 py-2 rounded-lg border transition-colors ${
                status === "today"
                  ? "border-violet-400/60 bg-violet-500/10"
                  : status === "done"
                    ? "border-slate-800 bg-slate-900/30 opacity-70"
                    : "border-slate-800 bg-slate-900/40"
              }`}
            >
              {/* Day pill on the left */}
              <span
                className={`absolute left-2 top-1/2 -translate-y-1/2 inline-flex items-center justify-center w-7 h-7 rounded-full text-[10px] font-black tabular-nums ${
                  status === "today"
                    ? "bg-violet-500 text-white"
                    : status === "done"
                      ? "bg-slate-800 text-slate-500"
                      : "bg-slate-800 text-slate-300 border border-slate-700"
                }`}
              >
                D{m.day}
              </span>

              <div className="flex items-start gap-2">
                <span className="text-lg shrink-0 leading-tight">
                  {status === "done" ? "✓" : m.emoji}
                </span>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-bold leading-tight ${
                      status === "done"
                        ? "text-slate-400 line-through"
                        : "text-white"
                    }`}
                  >
                    {m.title}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                    {m.detail}
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      <p className="text-[10px] text-slate-500 mt-4 leading-relaxed">
        Dates above are typical — your actual timing depends on
        ad-account approval speed (Meta is 3-7 days) and how fast your
        onboarding form lands. Ben sends a real-numbers status email
        every Friday.
      </p>
    </div>
  );
}

function ProgressPill({ day }: { day: number }) {
  const pct = Math.max(0, Math.min(100, (day / 14) * 100));
  return (
    <div className="flex items-center gap-2">
      <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[10px] font-bold uppercase tracking-wider text-violet-300 tabular-nums">
        {Math.round(pct)}%
      </span>
    </div>
  );
}
