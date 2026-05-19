import Link from "next/link";

/**
 * /dashboard/clients/zenith-sports/ai-operator
 *
 * Skeleton UI for the per-client AI Operator (per AI_PACKAGE_PLAYBOOK
 * Phase 9 + AIOS PRO_SYNTHESIS row 2026-05-06). Shipped 2026-05-08
 * ahead of the 2026-05-09 final delivery walkthrough so Ben can show
 * Philip + Paul "the AI brain" exists rather than describing it
 * verbally.
 *
 * Five skills, customized for the Zenith soccer-niche use case:
 *   1. Drill Drafter (Zenith-specific Client-pick)
 *   2. Lead Reply Drafter (parent / coach / club inquiries, Philip's voice)
 *   3. Weekly Digest Author (drill-of-week broadcast email)
 *   4. Customer Save Agent (re-engages dismissed / churned leads)
 *   5. Lead Scorer (intent classification for inbound calls + DMs)
 *
 * Status semantics:
 *   - "Online · mock" — UI exists, output is template-based, no LLM
 *     call yet. Visible to operator + customer; clearly labelled.
 *   - "Training" — wired to Claude API but waiting on training data
 *     (real call transcripts / sent emails / drill writeups).
 *   - "Coming online · week of [date]" — not yet wired.
 *
 * NEVER show "Online" without the "mock" suffix until the skill is
 * actually pulling LLM output AND has been QC'd against the voice
 * corpus (Rule 76). Same accuracy rule as the rest of the dashboard:
 * don't render fake numbers (CLAUDE.md "Status Accuracy Rules").
 */

export const metadata = {
  title: "Zenith Sports / Tekky · AI Operator — BlueJays",
};

type SkillStatus = "online_mock" | "training" | "coming_soon";

type Skill = {
  id: string;
  name: string;
  oneLiner: string;
  description: string;
  status: SkillStatus;
  comingOnline?: string;
  monthlyCap?: string;
  inputs: string[];
  outputs: string[];
  icon: string;
};

const SKILLS: Skill[] = [
  {
    id: "drill-drafter",
    name: "Drill Drafter",
    oneLiner: "Generate a soccer drill on-spec, in Philip's coaching voice.",
    description:
      "Ask for a drill by skill (first touch / 1v1 / passing under pressure / etc.) + age band + duration. Returns a coach-ready writeup with setup, progression, key cues, and YouTube-search hints. Trained on the 26-drill library + Philip's existing coaching language.",
    status: "online_mock",
    monthlyCap: "100 drills / month soft cap",
    inputs: ["Skill area", "Age band", "Duration (10-30 min)", "Any context notes"],
    outputs: [
      "Drill name + 1-line summary",
      "Setup diagram description",
      "Progression (3-4 steps)",
      "Key cues (3-5 short bullets)",
      "Common mistakes to flag",
    ],
    icon: "⚽",
  },
  {
    id: "lead-reply-drafter",
    name: "Lead Reply Drafter",
    oneLiner: "Draft a reply to any inbound parent / coach / club inquiry in Philip's voice.",
    description:
      "Reads the inbound message, classifies the audience (parent / coach / club / camp director), pulls relevant context from the lead record, and drafts a 3-5 sentence reply. Output is plain text ready to paste — Philip reviews + sends. Voice anchored to the Zenith voice corpus.",
    status: "training",
    comingOnline: "Week of 2026-05-19 (waiting on 20 sample replies from Philip's sent folder)",
    inputs: [
      "Inbound message text",
      "Lead record (audience, location, history)",
      "Voice corpus excerpts (per Rule 76)",
    ],
    outputs: ["Suggested reply (3-5 sentences)", "Audience tag", "Suggested next step"],
    icon: "✉",
  },
  {
    id: "weekly-digest",
    name: "Weekly Digest Author",
    oneLiner: "Compose the Drill-of-the-Week broadcast email for coaches.",
    description:
      "Picks this week's drill from the library, writes the broadcast email body (hook → drill description → CTA), generates 3 subject-line variants for A/B testing, and queues for dry-run preview before send. Currently the broadcast UI is admin-only — this skill makes the copy generation automatic.",
    status: "training",
    comingOnline: "Week of 2026-05-19 (paired with Drill Drafter)",
    inputs: ["This week's drill", "Last 4 weeks of open / click rates", "Coach segment filters"],
    outputs: ["Email body", "3 subject-line variants", "Suggested send time"],
    icon: "📰",
  },
  {
    id: "customer-save",
    name: "Customer Save Agent",
    oneLiner: "Re-engage leads who dismissed a previous touch, before they go cold.",
    description:
      "Watches client_leads for status='dismissed' or 'cold'. Drafts a soft re-engagement message (different angle than the original touch), routes to Philip for approval, fires after explicit OK. Per Rule 45 — soft probe phrasing, never sales-hook.",
    status: "coming_soon",
    comingOnline: "Week of 2026-05-26",
    inputs: ["Dismissed lead history", "Original touch + reason for dismissal", "Voice corpus"],
    outputs: ["Soft re-engagement draft", "Recommended channel (email / SMS / VM-drop)"],
    icon: "🔄",
  },
  {
    id: "lead-scorer",
    name: "Lead Scorer",
    oneLiner: "Classify inbound intent + score buying-readiness on every new lead.",
    description:
      "Runs on every form submit, missed-call recovery, and DM. Tags intent (info / pricing / demo-request / partnership / spam) + scores 0-100 on buying readiness. Drives funnel routing — high-score leads jump to Philip's direct queue, others enter the standard nurture flow.",
    status: "coming_soon",
    comingOnline: "Week of 2026-05-26",
    inputs: ["Lead message text", "Lead source channel", "Time-of-day signal"],
    outputs: ["Intent tag", "Buying-readiness score (0-100)", "Recommended funnel route"],
    icon: "🎯",
  },
];

const STATUS_BADGES: Record<
  SkillStatus,
  { label: string; cls: string; dot: string }
> = {
  online_mock: {
    label: "Online · mock",
    cls: "border-emerald-500/40 bg-emerald-500/10 text-emerald-200",
    dot: "bg-emerald-400",
  },
  training: {
    label: "Training",
    cls: "border-amber-500/40 bg-amber-500/10 text-amber-200",
    dot: "bg-amber-400",
  },
  coming_soon: {
    label: "Coming online",
    cls: "border-slate-700 bg-slate-800/60 text-slate-400",
    dot: "bg-slate-500",
  },
};

export default function ZenithAIOperatorPage() {
  const onlineCount = SKILLS.filter((s) => s.status === "online_mock").length;
  const trainingCount = SKILLS.filter((s) => s.status === "training").length;

  return (
    <>
      {/* Sub-action bar — skill count.
          Tab bar (back-nav, title, Site link) is provided by
          /dashboard/clients/zenith-sports/layout.tsx via ClientTabsBar. */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-3 border-b border-slate-800/50 flex items-center gap-3">
        <p className="text-[11px] text-slate-500 leading-snug flex-1">
          The brain behind the funnel — five skills running on every Tekky lead.
        </p>
        <span className="text-[11px] tracking-wider uppercase font-bold text-slate-500 whitespace-nowrap">
          {SKILLS.length} skills
        </span>
      </div>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-6 pb-32">
        {/* Hero — what is the AI Operator */}
        <section className="rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-950/40 via-slate-900/50 to-slate-900/40 p-6 sm:p-8 mb-8">
          <p className="text-xs uppercase tracking-[0.25em] font-bold text-violet-300 mb-2">
            The brain behind the funnel
          </p>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-3">
            5 skills. Trained on Tekky&apos;s voice. Always learning.
          </h2>
          <p className="text-slate-300 leading-relaxed mb-5 max-w-3xl">
            The AI Operator is the per-client agentic Claude that drafts replies,
            generates drills, scores leads, and re-engages cold ones — all in
            Philip&apos;s coaching voice. Skills come online over the next 4 weeks
            as they ingest training data from real calls + sent emails. Every
            output is reviewable; nothing fires without operator approval.
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <SummaryPill
              label={`${onlineCount} online`}
              tone="emerald"
            />
            <SummaryPill
              label={`${trainingCount} training`}
              tone="amber"
            />
            <SummaryPill
              label={`${SKILLS.length - onlineCount - trainingCount} queued`}
              tone="slate"
            />
            <span className="text-[11px] text-slate-500 ml-1">
              · Spec at{" "}
              <code className="text-slate-400">docs/AI_PACKAGE_PLAYBOOK.md</code> Phase 9
            </span>
          </div>
        </section>

        {/* Skill grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {SKILLS.map((skill) => {
            const badge = STATUS_BADGES[skill.status];
            return (
              <article
                key={skill.id}
                className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="text-3xl shrink-0" aria-hidden="true">
                    {skill.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-white leading-tight">
                      {skill.name}
                    </h3>
                    <p className="text-sm text-slate-400 mt-0.5 leading-snug">
                      {skill.oneLiner}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold rounded-full border px-2 py-0.5 whitespace-nowrap ${badge.cls}`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${badge.dot} ${
                        skill.status === "online_mock" ? "animate-pulse" : ""
                      }`}
                    />
                    {badge.label}
                  </span>
                </div>

                <p className="text-sm text-slate-300 leading-relaxed mb-4">
                  {skill.description}
                </p>

                {skill.comingOnline && (
                  <p className="text-[11px] text-amber-300/90 mb-4">
                    🗓 {skill.comingOnline}
                  </p>
                )}

                <div className="grid sm:grid-cols-2 gap-3 mb-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-1.5">
                      Inputs
                    </p>
                    <ul className="space-y-0.5">
                      {skill.inputs.map((inp) => (
                        <li key={inp} className="text-[12px] text-slate-400 leading-snug">
                          · {inp}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-1.5">
                      Outputs
                    </p>
                    <ul className="space-y-0.5">
                      {skill.outputs.map((out) => (
                        <li key={out} className="text-[12px] text-slate-400 leading-snug">
                          · {out}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {skill.monthlyCap && (
                  <p className="text-[11px] text-slate-500 mb-3">
                    Soft cap: {skill.monthlyCap}
                  </p>
                )}

                <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-800">
                  <span className="text-[10px] uppercase tracking-wider text-slate-500">
                    Skill ID: <code className="text-slate-400">{skill.id}</code>
                  </span>
                  <button
                    type="button"
                    disabled={skill.status !== "online_mock"}
                    className="text-[11px] uppercase tracking-wider font-bold rounded px-3 py-1.5 border border-slate-700 text-slate-300 hover:border-violet-500/50 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {skill.status === "online_mock" ? "Try it →" : "Locked"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        {/* Footer note */}
        <section className="mt-10 rounded-xl border border-slate-800 bg-slate-900/30 p-5">
          <p className="text-xs uppercase tracking-wider font-bold text-slate-500 mb-2">
            How training works
          </p>
          <p className="text-sm text-slate-400 leading-relaxed mb-3">
            Each skill ingests Tekky&apos;s voice corpus (sample emails + call
            transcripts + drill writeups) at runtime per Rule 76. As Philip
            sends real replies and runs real calls, the corpus grows and the
            skill output gets sharper. The skills are not static — they learn.
          </p>
          <p className="text-sm text-slate-400 leading-relaxed">
            <strong className="text-slate-300">Cost discipline:</strong> every
            skill run is logged via <code className="text-slate-300">logCost()</code>
            against <code className="text-slate-300">client_slug=&quot;zenith-sports&quot;</code> so
            Tekky-attributable AI spend is auditable monthly. Soft caps prevent
            runaway. Full QC + voice-fidelity review per Rule 14
            (amplification, not automation).
          </p>
        </section>
      </main>
    </>
  );
}

function SummaryPill({
  label,
  tone,
}: {
  label: string;
  tone: "emerald" | "amber" | "slate";
}) {
  const cls =
    tone === "emerald"
      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
      : tone === "amber"
        ? "border-amber-500/40 bg-amber-500/10 text-amber-200"
        : "border-slate-700 bg-slate-800/60 text-slate-400";
  return (
    <span
      className={`inline-flex items-center text-[11px] uppercase tracking-wider font-bold rounded-full border px-2.5 py-0.5 ${cls}`}
    >
      {label}
    </span>
  );
}
