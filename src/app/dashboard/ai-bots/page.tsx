"use client";

/**
 * /dashboard/ai-bots
 *
 * Visual map of every Claude personality the BlueJays system runs.
 * Each "bot" is a distinct prompt + role Claude plays inside the
 * codebase — the appointment-setter on outbound calls, the QC
 * reviewer that audits generated sites, the Hyperloop A/B engine
 * that promotes winning email subjects, etc. They all use the same
 * underlying Anthropic API but with different prompts, different
 * data, different decision boundaries.
 *
 * Layout: a "BlueJays Brain" head at the top, branching downward
 * into 5 specializations (Sales · Build · Tenants · Ops · Skills),
 * each fanning out to its individual bots. Click any bot to see its
 * source files + what it does in one sentence.
 *
 * Pure SVG + CSS — no flow-chart library dep. Lines are computed
 * from grid positions so the chart stays responsive and reflows
 * gracefully on narrow viewports.
 */

import { useState } from "react";
import Link from "next/link";
import AIActivityFeed from "@/components/dashboard/AIActivityFeed";

type Bot = {
  id: string;
  name: string;
  emoji: string;
  desc: string;
  files: string[];
};

type Branch = {
  id: string;
  name: string;
  emoji: string;
  color: string; // tailwind hue (sky, violet, amber, emerald, rose)
  bots: Bot[];
};

const BRANCHES: Branch[] = [
  {
    id: "sales",
    name: "Sales · Outbound",
    emoji: "📞",
    color: "sky",
    bots: [
      {
        id: "partner",
        name: "Sales Setter Claude",
        emoji: "🎯",
        desc: "Appointment-setter. Books Ben on the calendar from inbound + partner outbound dialing. Pivots website → backend if prospect signals an agency. Earns $1k commission per backend close.",
        files: ["src/lib/partners-script.ts → PARTNER_CALL_SCRIPT"],
      },
      {
        id: "hormozi",
        name: "Hormozi Claude",
        emoji: "🔥",
        desc: "Ben's cold-call script. Hard-direct, scarcity-aware, value-first. Used when Ben dials his own pipeline.",
        files: ["src/lib/partners-script.ts → HORMOZI_CALL_SCRIPT"],
      },
      {
        id: "responder",
        name: "AI Inbound Responder",
        emoji: "✉️",
        desc: "Classifies every inbound email into 6 intent classes (interested / objection / scheduling / refund / spam / other) and drafts a one-tap reply in Ben's voice.",
        files: ["src/lib/ai-responder.ts"],
      },
      {
        id: "missedcall",
        name: "Missed-Call Text-Back",
        emoji: "📲",
        desc: "Twilio webhook fires the moment a call hits voicemail. Auto-text within 60 seconds — captures leads that voicemail would lose.",
        files: ["src/app/api/client-funnels/missed-call/route.ts"],
      },
    ],
  },
  {
    id: "build",
    name: "Build · Site Gen",
    emoji: "🏗️",
    color: "violet",
    bots: [
      {
        id: "sitegen",
        name: "Site Generator",
        emoji: "🏠",
        desc: "Builds a V2 template site for a prospect from scraped business data + category template. Outputs hero, about, services, testimonials, contact.",
        files: ["src/lib/site-audit.ts", "src/components/templates/V2*"],
      },
      {
        id: "qc",
        name: "QC Reviewer",
        emoji: "🔍",
        desc: "Hero-analysis + content-quality gate. Flags weak CTAs, generic hero copy, and bait-and-switch image alts before a site can ship.",
        files: ["src/lib/site-audit.ts → analyzeHero()"],
      },
      {
        id: "audit-headline",
        name: "Audit Headline",
        emoji: "📊",
        desc: "Generates the 'your site is losing $X/mo' headline + CTA on every audit deliverable. Banned word-list keeps it plain English.",
        files: ["src/lib/site-audit.ts → headline prompt"],
      },
      {
        id: "image-validator",
        name: "Image Validator",
        emoji: "🖼️",
        desc: "Pre-flight check on every hero / about / gallery image — catches fallback URLs, broken hot-links, and category-mismatched stock.",
        files: ["src/lib/image-validator.ts"],
      },
    ],
  },
  {
    id: "tenants",
    name: "Per-Client",
    emoji: "🏢",
    color: "emerald",
    bots: [
      {
        id: "zenith",
        name: "Zenith TEKKY Funnel",
        emoji: "⚽",
        desc: "Parent / coach / player drip sequences (email + SMS + voicemail). Per-audience branching off the homepage Build-Your-Player quiz.",
        files: ["src/lib/client-funnels/zenith-sports.ts"],
      },
      {
        id: "olympic",
        name: "Olympic Inspections",
        emoji: "🏠",
        desc: "Homeowner / realtor / insurance audience tracks. PNW home-inspection funnel.",
        files: ["src/lib/client-funnels/olympic-inspections.ts"],
      },
      {
        id: "itc",
        name: "ITC Quick Attach",
        emoji: "🚜",
        desc: "Planned 6-segment manufacturer funnel (hobbyist / forester / TYM / hunter / dealer / community). Pitch Wave 4.",
        files: ["src/lib/client-funnels/itc-quick-attach.ts (planned)"],
      },
      {
        id: "lcac",
        name: "Lewis County Autism",
        emoji: "💛",
        desc: "Donor + parent-resource dual funnel for the autism coalition.",
        files: ["public/sites/lcac/"],
      },
      {
        id: "wholme",
        name: "Wholme Naturopathy",
        emoji: "🌿",
        desc: "Patient education + intake funnel for the naturopathy practice.",
        files: ["src/app/clients/wholme-naturopathy/"],
      },
    ],
  },
  {
    id: "ops",
    name: "Ops · Optimization",
    emoji: "⚙️",
    color: "amber",
    bots: [
      {
        id: "hyperloop",
        name: "Hyperloop A/B",
        emoji: "🔬",
        desc: "Wilson-CI A/B engine. Tests every email subject + ad headline. Promotes winners, kills losers — no human pushes a button.",
        files: ["src/lib/client-hyperloop.ts"],
      },
      {
        id: "digest",
        name: "Weekly Digest",
        emoji: "📰",
        desc: "Auto-renders the per-client Monday-morning digest. Pulls leads + spend + conversion + win-loss from the week.",
        files: ["src/lib/client-reports.ts"],
      },
      {
        id: "daily",
        name: "Hormozi Daily Digest",
        emoji: "🌅",
        desc: "Ben's 5-bullet daily summary — cash, pipeline, alerts, daily habits, single highest-leverage action of the day.",
        files: ["src/lib/daily-digest.ts"],
      },
      {
        id: "scout",
        name: "Manufacturer Scout",
        emoji: "🏭",
        desc: "ICP lookalike scout for manufacturer prospects. Pulls Google Places + LinkedIn + Apollo signals; scores defensibility.",
        files: ["src/lib/scout.ts", "src/lib/scout-optimizer.ts"],
      },
      {
        id: "affiliate",
        name: "Affiliate Scoring",
        emoji: "🤝",
        desc: "Scores inbound affiliate applicants (volume of audience × match quality × likelihood-to-promote). Per-client branches.",
        files: ["src/lib/client-affiliates.ts"],
      },
      {
        id: "linkedin",
        name: "LinkedIn Discovery",
        emoji: "💼",
        desc: "Enriches prospects with LinkedIn data + Apollo contact info. Surfaces decision-maker email + role.",
        files: ["src/app/api/prospects/[id]/linkedin-discover/route.ts"],
      },
    ],
  },
  {
    id: "skills",
    name: "Slash Commands",
    emoji: "⚡",
    color: "rose",
    bots: [
      {
        id: "new-partner",
        name: "/new-partner",
        emoji: "🆕",
        desc: "Onboards a new sales partner end-to-end. Generates IC agreement from template, prints the partners-table SQL, sends the W-9 upload link, prints the next-steps checklist.",
        files: [".claude/commands/new-partner.md"],
      },
      {
        id: "audit-business",
        name: "/audit-business",
        emoji: "🔧",
        desc: "Quarterly ops sweep — refreshes the three audit docs (domain registrar, 2FA recovery, billing) by re-deriving code-known rows.",
        files: [".claude/commands/audit-business.md"],
      },
    ],
  },
];

const COLOR_MAP: Record<string, { border: string; bg: string; text: string; ring: string }> = {
  sky: {
    border: "border-sky-500/40",
    bg: "bg-sky-950/30",
    text: "text-sky-200",
    ring: "ring-sky-500/30",
  },
  violet: {
    border: "border-violet-500/40",
    bg: "bg-violet-950/30",
    text: "text-violet-200",
    ring: "ring-violet-500/30",
  },
  emerald: {
    border: "border-emerald-500/40",
    bg: "bg-emerald-950/30",
    text: "text-emerald-200",
    ring: "ring-emerald-500/30",
  },
  amber: {
    border: "border-amber-500/40",
    bg: "bg-amber-950/30",
    text: "text-amber-200",
    ring: "ring-amber-500/30",
  },
  rose: {
    border: "border-rose-500/40",
    bg: "bg-rose-950/30",
    text: "text-rose-200",
    ring: "ring-rose-500/30",
  },
};

export default function AiBotsPage() {
  const [activeBot, setActiveBot] = useState<Bot | null>(null);
  const [showArchitecture, setShowArchitecture] = useState(false);

  const totalBots = BRANCHES.reduce((sum, b) => sum + b.bots.length, 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-20 backdrop-blur bg-slate-950/85 border-b border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 flex items-center gap-3">
          <Link
            href="/dashboard"
            className="text-slate-400 hover:text-white text-sm flex items-center gap-1"
          >
            ← Dash
          </Link>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight flex-1">
            AI Skills · Activity
          </h1>
          <button
            type="button"
            onClick={() => setShowArchitecture((v) => !v)}
            className="text-[11px] tracking-wider uppercase font-bold text-slate-300 border border-slate-700 px-2.5 py-1 rounded hover:border-violet-500/50 hover:text-white transition-colors"
            title={`Toggle the architecture diagram — ${totalBots} bots across 5 branches`}
          >
            {showArchitecture ? "Hide" : "Show"} architecture
          </button>
        </div>
        <p className="mx-auto max-w-7xl px-4 sm:px-6 pb-3 text-xs text-slate-500">
          Live cross-client AI activity feed. Per-client AI Operator skills
          come online over the next 4 weeks (Drill Drafter first, then Lead
          Reply Drafter / Weekly Digest / Customer Save Agent / Lead Scorer).
          Architecture diagram below the feed when toggled.
        </p>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-6 pb-32 space-y-10">
        {/* ─── Activity feed (primary surface) ─── */}
        <AIActivityFeed />

        {showArchitecture && (
          <>
            <div className="border-t border-white/[0.06] pt-8">
              <p className="text-[10px] uppercase tracking-[0.22em] font-bold text-slate-400 mb-1">
                Architecture diagram
              </p>
              <h2 className="text-xl font-bold text-white mb-2">
                {totalBots} bots · 5 branches
              </h2>
              <p className="text-xs text-slate-500 max-w-2xl mb-6">
                Every Claude personality the BlueJays system runs. Click any
                node for source files + what it does. The brain is one model
                — the prompts are how we get specialized behavior.
              </p>
            </div>

        {/* ─── Head node ─── */}
        <div className="flex justify-center mb-2">
          <div className="relative">
            <div className="rounded-2xl border-2 border-white/30 bg-gradient-to-br from-slate-800 to-slate-900 px-7 py-5 text-center shadow-[0_0_40px_rgba(255,255,255,0.08)]">
              <div className="text-4xl mb-1">🧠</div>
              <div className="text-base font-black tracking-tight text-white">
                BlueJays Brain
              </div>
              <div className="text-[10px] uppercase tracking-widest text-slate-400 mt-0.5">
                Ben + Claude
              </div>
            </div>
          </div>
        </div>

        {/* Vertical line from brain down */}
        <div className="flex justify-center">
          <div className="w-px h-10 bg-gradient-to-b from-white/30 to-white/10" />
        </div>

        {/* Horizontal connector across all branches */}
        <div className="relative h-6 mb-0">
          <div
            className="absolute left-[10%] right-[10%] top-1/2 h-px bg-white/15"
            aria-hidden="true"
          />
        </div>

        {/* ─── 5 branch columns ─── */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {BRANCHES.map((branch) => {
            const c = COLOR_MAP[branch.color];
            return (
              <div key={branch.id} className="flex flex-col items-center">
                {/* Vertical line down to branch header */}
                <div className="w-px h-6 bg-white/15" />
                {/* Branch header card */}
                <div
                  className={`w-full rounded-xl border ${c.border} ${c.bg} px-4 py-3 text-center mb-3`}
                >
                  <div className="text-2xl mb-0.5">{branch.emoji}</div>
                  <div className={`text-xs font-bold uppercase tracking-wider ${c.text}`}>
                    {branch.name}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {branch.bots.length} bot{branch.bots.length === 1 ? "" : "s"}
                  </div>
                </div>

                {/* Vertical line to first bot */}
                <div className="w-px h-3 bg-white/10" />

                {/* Bot leaf nodes */}
                <ul className="w-full space-y-2">
                  {branch.bots.map((bot, i) => (
                    <li
                      key={bot.id}
                      className="relative"
                    >
                      {i > 0 && (
                        <div
                          aria-hidden="true"
                          className="absolute left-1/2 -top-2 w-px h-2 bg-white/10"
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => setActiveBot(bot)}
                        className={`w-full text-left rounded-lg border bg-slate-900/40 px-3 py-2 hover:${c.border} hover:bg-slate-900/80 transition-colors group ${
                          activeBot?.id === bot.id
                            ? `${c.border} ${c.bg} ring-1 ${c.ring}`
                            : "border-slate-800"
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <span className="text-lg leading-none mt-0.5">{bot.emoji}</span>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold text-white truncate group-hover:text-white">
                              {bot.name}
                            </div>
                            <div className="text-[10px] text-slate-500 truncate mt-0.5">
                              {bot.files[0]}
                            </div>
                          </div>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
          </>
        )}

        {/* ─── Detail drawer (sticky bottom) ─── */}
        {activeBot && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Bot detail: ${activeBot.name}`}
            className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-700 bg-slate-900/95 backdrop-blur shadow-[0_-12px_40px_rgba(0,0,0,0.5)]"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4">
              <div className="flex items-start gap-4">
                <div className="text-4xl shrink-0">{activeBot.emoji}</div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold text-white">{activeBot.name}</h2>
                  <p className="text-sm text-slate-300 leading-relaxed mt-1">
                    {activeBot.desc}
                  </p>
                  {activeBot.files.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {activeBot.files.map((f) => (
                        <code
                          key={f}
                          className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300"
                        >
                          {f}
                        </code>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setActiveBot(null)}
                  className="shrink-0 text-slate-400 hover:text-white text-2xl leading-none"
                  aria-label="Close detail"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
