"use client";

/**
 * /dashboard/ai-bots
 *
 * Visual map of every Claude personality + deterministic-with-LLM tool
 * the BlueJays system runs, AND the handoffs between them.
 *
 * Each bot has:
 *   · `id` — stable handle (used as edge endpoint in `talksTo`)
 *   · `kind` — "agent" (autonomous w/ system prompt) vs "tool"
 *     (deterministic helper that calls an LLM once)
 *   · `talksTo` — array of {id, via, wired} edges describing the
 *     designed flow between bots. `wired: true` = handoff is firing
 *     in production today; `wired: false` = designed but not yet
 *     plumbed (so we can see what's still TODO without digging).
 *
 * Layout: BlueJays Brain → 7 specialization branches → leaf bots.
 * Click any bot for source files + handoff list.
 */

import { useState } from "react";
import Link from "next/link";
import AIActivityFeed from "@/components/dashboard/AIActivityFeed";

type Edge = {
  /** target bot id */
  to: string;
  /** one-line label for HOW the handoff happens */
  via: string;
  /** true if the handoff is firing in prod today */
  wired: boolean;
};

type Bot = {
  id: string;
  name: string;
  emoji: string;
  /** "agent" = autonomous w/ system prompt, "tool" = deterministic helper */
  kind: "agent" | "tool" | "skill";
  desc: string;
  files: string[];
  talksTo?: Edge[];
};

type Branch = {
  id: string;
  name: string;
  emoji: string;
  color: string; // tailwind hue
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
        id: "sales-setter",
        name: "Sales Setter Claude",
        emoji: "🎯",
        kind: "agent",
        desc: "Appointment-setter. Books Ben on the calendar from inbound + partner outbound dialing. Pivots website → backend if prospect signals an agency. $1k commission per backend close.",
        files: ["src/lib/partners-script.ts → PARTNER_CALL_SCRIPT"],
        talksTo: [
          { to: "daily-digest", via: "books logged → digest count", wired: true },
        ],
      },
      {
        id: "hormozi",
        name: "Hormozi Claude",
        emoji: "🔥",
        kind: "agent",
        desc: "Ben's cold-call script. Hard-direct, scarcity-aware, value-first. Used when Ben dials his own pipeline.",
        files: ["src/lib/partners-script.ts → HORMOZI_CALL_SCRIPT"],
      },
      {
        id: "ai-receptionist",
        name: "AI Receptionist (Voice)",
        emoji: "☎️",
        kind: "agent",
        desc: "Twilio voice agent. Handles inbound calls live with Claude Haiku 4.5, books on calendar, sends confirmation SMS, hands off to voicemail w/ transcription if escalation needed.",
        files: [
          "src/lib/voice-agent.ts",
          "src/app/api/voice/incoming/route.ts",
          "src/app/api/voice/turn/route.ts",
          "src/app/api/voice/voicemail/route.ts",
        ],
        talksTo: [
          { to: "sales-setter", via: "books call → setter pipeline", wired: true },
          { to: "ai-responder", via: "voicemail transcript → email reply", wired: false },
        ],
      },
      {
        id: "ai-responder",
        name: "AI Inbound Responder",
        emoji: "✉️",
        kind: "agent",
        desc: "Classifies every inbound email into 6 intent classes (interested / question / objection / scheduling / refund / spam). Drafts a one-tap reply in Ben's voice. Routes intent=interested + intent=scheduling to checkout vs calendar.",
        files: ["src/lib/ai-responder.ts"],
        talksTo: [
          { to: "sales-setter", via: "intent=scheduling → setter outbound", wired: false },
          { to: "agent-signals", via: "every classification logged", wired: false },
        ],
      },
      {
        id: "missed-call",
        name: "Missed-Call Text-Back",
        emoji: "📲",
        kind: "tool",
        desc: "Twilio webhook fires the moment a call hits voicemail. Auto-text within 60 seconds — captures leads voicemail would lose.",
        files: ["src/app/api/client-funnels/missed-call/route.ts"],
        talksTo: [
          { to: "ai-responder", via: "reply thread → classify intent", wired: false },
        ],
      },
    ],
  },
  {
    id: "build",
    name: "Build · Audit Engine",
    emoji: "🏗️",
    color: "violet",
    bots: [
      {
        id: "audit-engine",
        name: "Audit Engine",
        emoji: "🧪",
        kind: "agent",
        desc: "Generates the full $X-losing-per-month audit doc for any prospect URL. Runs scrape → score → write headline → write body → kick off personalized HeyGen video in parallel. Centerpiece of the inbound funnel.",
        files: ["src/lib/site-audit.ts", "src/app/api/audit/generate/[id]/route.ts"],
        talksTo: [
          { to: "audit-headline", via: "calls headline subprompt", wired: true },
          { to: "qc-reviewer", via: "calls hero-quality gate", wired: true },
          { to: "heygen-video", via: "fire-and-forget kickoff", wired: true },
          { to: "image-validator", via: "pre-flights every image", wired: true },
        ],
      },
      {
        id: "audit-headline",
        name: "Audit Headline",
        emoji: "📊",
        kind: "tool",
        desc: "Generates the 'your site is losing $X/mo' headline + CTA on every audit deliverable. Banned word-list keeps it plain English.",
        files: ["src/lib/site-audit.ts → headline prompt"],
      },
      {
        id: "qc-reviewer",
        name: "QC Reviewer",
        emoji: "🔍",
        kind: "tool",
        desc: "Hero-analysis + content-quality gate. Flags weak CTAs, generic hero copy, and bait-and-switch image alts before a site can ship.",
        files: ["src/lib/site-audit.ts → analyzeHero()"],
      },
      {
        id: "heygen-video",
        name: "HeyGen Personalized Video",
        emoji: "🎬",
        kind: "tool",
        desc: "Per-prospect video that plays on the audit page. Async generation (~3min) polled by cron; falls back to static image if HeyGen times out so the audit page never blocks.",
        files: [
          "src/lib/heygen.ts",
          "src/app/api/cron/heygen-poll/route.ts",
        ],
      },
      {
        id: "site-generator",
        name: "Site Generator",
        emoji: "🏠",
        kind: "tool",
        desc: "Builds a V2 template site for a prospect from scraped business data + category template. Outputs hero, about, services, testimonials, contact.",
        files: ["src/lib/site-audit.ts", "src/components/templates/V2*"],
        talksTo: [
          { to: "image-validator", via: "validates every hero/about/gallery img", wired: true },
        ],
      },
      {
        id: "image-validator",
        name: "Image Validator",
        emoji: "🖼️",
        kind: "tool",
        desc: "Pre-flight check on every hero / about / gallery image — catches fallback URLs, broken hot-links, and category-mismatched stock.",
        files: ["src/lib/image-validator.ts"],
      },
    ],
  },
  {
    id: "tenants",
    name: "Per-Client Funnels",
    emoji: "🏢",
    color: "emerald",
    bots: [
      {
        id: "zenith",
        name: "Zenith TEKKY Funnel",
        emoji: "⚽",
        kind: "agent",
        desc: "Parent / coach / player drip sequences (email + SMS + voicemail). Per-audience branching off the homepage Build-Your-Player quiz.",
        files: ["src/lib/client-funnels/zenith-sports.ts"],
        talksTo: [
          { to: "hyperloop", via: "subject-line A/B winner promotion", wired: true },
          { to: "weekly-digest", via: "sends weekly funnel report", wired: true },
        ],
      },
      {
        id: "olympic",
        name: "Olympic Inspections",
        emoji: "🏠",
        kind: "agent",
        desc: "Homeowner / realtor / insurance audience tracks. PNW home-inspection funnel.",
        files: ["src/lib/client-funnels/olympic-inspections.ts"],
        talksTo: [
          { to: "hyperloop", via: "subject-line A/B winner promotion", wired: true },
        ],
      },
      {
        id: "itc",
        name: "ITC Quick Attach",
        emoji: "🚜",
        kind: "agent",
        desc: "6-segment manufacturer funnel (hobbyist / forester / TYM / hunter / dealer / community).",
        files: ["src/lib/client-funnels/itc-quick-attach.ts (planned)"],
      },
      {
        id: "lcac",
        name: "Lewis County Autism",
        emoji: "💛",
        kind: "agent",
        desc: "Donor + parent-resource dual funnel for the autism coalition.",
        files: ["public/sites/lcac/"],
      },
      {
        id: "wholme",
        name: "Wholme Naturopathy",
        emoji: "🌿",
        kind: "agent",
        desc: "Patient education + intake funnel for the naturopathy practice.",
        files: ["src/app/clients/wholme-naturopathy/"],
      },
      {
        id: "bloodlines",
        name: "Bloodlines (book launch)",
        emoji: "📕",
        kind: "agent",
        desc: "Pre-launch funnel for the fantasy series — character vault, synopsis, mailing-list capture, character portrait drip.",
        files: ["src/app/clients/bloodlines/"],
      },
      {
        id: "nevarland",
        name: "Nevarland Outpost",
        emoji: "🔥",
        kind: "agent",
        desc: "Christopher's handmade-apparel brand front. Story-led layout, Shopify-CDN product cards, founder-letter section, Klaviyo handoff for newsletter.",
        files: [
          "src/app/clients/nevarland-outpost/",
          "src/app/api/clients/inquire/[code]/route.ts",
        ],
      },
    ],
  },
  {
    id: "lifecycle",
    name: "Lifecycle · Drip",
    emoji: "💌",
    color: "fuchsia",
    bots: [
      {
        id: "ai-package-welcome",
        name: "AI Package Welcome",
        emoji: "🎁",
        kind: "agent",
        desc: "$9,700 close → 5-email welcome arc: kickoff, what's-built, what's-coming, here's-your-portal, here's-your-first-results-summary.",
        files: [
          "src/lib/ai-package-welcome-emails.ts",
          "src/app/api/cron/ai-package-welcome/route.ts",
        ],
        talksTo: [
          { to: "onboarding-reminder", via: "hands off to drip", wired: true },
        ],
      },
      {
        id: "onboarding-reminder",
        name: "Onboarding Reminder Bot",
        emoji: "📅",
        kind: "agent",
        desc: "30-day client-setup drip. Reminds clients about webhook wiring, Twilio number config, asset uploads. Email + SMS, escalates to Ben if blocked > 3 days.",
        files: ["src/app/api/onboarding-reminders/process/route.ts"],
        talksTo: [
          { to: "weekly-digest", via: "blocked-clients list", wired: false },
        ],
      },
      {
        id: "win-loss-survey",
        name: "Win-Loss Survey Bot",
        emoji: "📋",
        kind: "agent",
        desc: "Sends post-decision survey to closed-lost + closed-won prospects. Classifies open-text answer into outcome categories. Feeds the operator-side win-loss UI.",
        files: [
          "src/lib/win-loss-emails.ts",
          "src/app/api/cron/win-loss-survey/route.ts",
        ],
        talksTo: [
          { to: "weekly-digest", via: "loss reasons → digest summary", wired: false },
        ],
      },
      {
        id: "review-blast",
        name: "Review Blast",
        emoji: "⭐",
        kind: "tool",
        desc: "After a closed-won client crosses 30 days happy, fires a one-tap review-request SMS to the operator + a follow-up to the client.",
        files: ["src/app/api/review-blast/dispatch/route.ts"],
      },
    ],
  },
  {
    id: "insights",
    name: "Insights & Reports",
    emoji: "📰",
    color: "amber",
    bots: [
      {
        id: "weekly-digest",
        name: "Weekly Digest",
        emoji: "📰",
        kind: "agent",
        desc: "Auto-renders the per-client Monday-morning digest. Pulls leads + spend + conversion + win-loss + Hyperloop variants from the week.",
        files: ["src/lib/client-reports.ts"],
      },
      {
        id: "daily-digest",
        name: "Hormozi Daily Digest",
        emoji: "🌅",
        kind: "agent",
        desc: "Ben's 5-bullet daily SMS — cash, pipeline, alerts, daily habits, single highest-leverage action of the day. Now includes any unack'd watchdog alerts since last run.",
        files: ["src/app/api/digest/route.ts"],
        talksTo: [
          { to: "customer-watchdog", via: "pulls unack'd alerts from agent_signals", wired: true },
        ],
      },
      {
        id: "customer-watchdog",
        name: "Customer Watchdog",
        emoji: "🚨",
        kind: "agent",
        desc: "Anomaly detection across every active client — spending drops, missing webhook events, response-time regressions, NPS decay. Logs findings to agent_signals so the daily digest picks them up.",
        files: ["src/app/api/cron/customer-watchdog/route.ts"],
        talksTo: [
          { to: "daily-digest", via: "writes signals → digest reads", wired: true },
          { to: "agent-signals", via: "logs findings", wired: true },
        ],
      },
      {
        id: "agent-signals",
        name: "Agent Signals (event bus)",
        emoji: "📡",
        kind: "tool",
        desc: "Single-table event bus for inter-bot handoffs. Any bot can emit a signal; any other bot can subscribe via cron-tail. Replaces ad-hoc per-pair direct calls so the architecture stays composable as we add more bots.",
        files: [
          "src/lib/agent-signals.ts",
          "supabase/migrations/*_agent_signals.sql",
        ],
      },
    ],
  },
  {
    id: "experiment",
    name: "Experimentation",
    emoji: "🔬",
    color: "violet",
    bots: [
      {
        id: "hyperloop",
        name: "Hyperloop A/B",
        emoji: "🔬",
        kind: "agent",
        desc: "Wilson-CI A/B engine. Tests every email subject + ad headline. Promotes winners, kills losers — no human pushes a button.",
        files: ["src/lib/client-hyperloop.ts"],
        talksTo: [
          { to: "zenith", via: "promotes subject-line winners", wired: true },
          { to: "olympic", via: "promotes subject-line winners", wired: true },
          { to: "weekly-digest", via: "winner list → digest summary", wired: true },
        ],
      },
    ],
  },
  {
    id: "discovery",
    name: "Lead Discovery",
    emoji: "🔭",
    color: "emerald",
    bots: [
      {
        id: "scout",
        name: "Manufacturer Scout",
        emoji: "🏭",
        kind: "agent",
        desc: "ICP lookalike scout for manufacturer prospects. Pulls Google Places + LinkedIn + Apollo signals; scores defensibility.",
        files: ["src/lib/scout.ts", "src/lib/scout-optimizer.ts"],
        talksTo: [
          { to: "linkedin-discovery", via: "enriches scout output", wired: true },
        ],
      },
      {
        id: "linkedin-discovery",
        name: "LinkedIn Discovery",
        emoji: "💼",
        kind: "tool",
        desc: "Enriches prospects with LinkedIn + Apollo data. Surfaces decision-maker email + role.",
        files: ["src/app/api/prospects/[id]/linkedin-discover/route.ts"],
        talksTo: [
          { to: "sales-setter", via: "qualified prospects → setter pipeline", wired: false },
        ],
      },
      {
        id: "auto-scout",
        name: "Auto Scout",
        emoji: "🌐",
        kind: "agent",
        desc: "Daily auto-discovery cron. Finds new ICP-match prospects across the manufacturer + service-business universe and queues them.",
        files: ["src/lib/auto-scout.ts", "src/app/api/auto-scout/route.ts"],
        talksTo: [
          { to: "scout", via: "feeds raw prospect candidates", wired: true },
        ],
      },
      {
        id: "affiliate-scoring",
        name: "Affiliate Scoring",
        emoji: "🤝",
        kind: "tool",
        desc: "Scores inbound affiliate applicants (audience-size × match-quality × likelihood-to-promote).",
        files: ["src/lib/client-affiliates.ts"],
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
        kind: "skill",
        desc: "Onboards a new sales partner end-to-end. Generates IC agreement, prints partners-table SQL, sends W-9 upload link, prints next-steps checklist.",
        files: [".claude/commands/new-partner.md"],
      },
      {
        id: "audit-business",
        name: "/audit-business",
        emoji: "🔧",
        kind: "skill",
        desc: "Quarterly ops sweep — refreshes the three audit docs (domain registrar, 2FA recovery, billing).",
        files: [".claude/commands/audit-business.md"],
      },
      {
        id: "optimize-costs",
        name: "/optimize-costs",
        emoji: "💸",
        kind: "skill",
        desc: "Cost-leak scan: chatty crons, image-optimizer drift, untracked recurring subs, unbounded fan-out queries, uncapped AI calls. Prints a triaged report.",
        files: [".claude/commands/optimize-costs.md"],
      },
    ],
  },
];

const COLOR_MAP: Record<
  string,
  { border: string; bg: string; text: string; ring: string }
> = {
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
  fuchsia: {
    border: "border-fuchsia-500/40",
    bg: "bg-fuchsia-950/30",
    text: "text-fuchsia-200",
    ring: "ring-fuchsia-500/30",
  },
};

const KIND_BADGE: Record<Bot["kind"], { label: string; cls: string }> = {
  agent: { label: "agent", cls: "bg-violet-500/20 text-violet-200 border-violet-500/40" },
  tool: { label: "tool", cls: "bg-slate-700/40 text-slate-300 border-slate-600" },
  skill: { label: "skill", cls: "bg-rose-500/20 text-rose-200 border-rose-500/40" },
};

// Flatten the bot map for handoff lookup (used to resolve target names)
function buildBotMap(branches: Branch[]) {
  const m = new Map<string, { name: string; emoji: string }>();
  for (const b of branches) {
    for (const bot of b.bots) m.set(bot.id, { name: bot.name, emoji: bot.emoji });
  }
  return m;
}

export default function AiBotsPage() {
  const [activeBot, setActiveBot] = useState<Bot | null>(null);
  const [showArchitecture, setShowArchitecture] = useState(false);

  const totalBots = BRANCHES.reduce((sum, b) => sum + b.bots.length, 0);
  const totalEdges = BRANCHES.reduce(
    (sum, b) =>
      sum + b.bots.reduce((s, bot) => s + (bot.talksTo?.length ?? 0), 0),
    0,
  );
  const wiredEdges = BRANCHES.reduce(
    (sum, b) =>
      sum +
      b.bots.reduce(
        (s, bot) => s + (bot.talksTo?.filter((e) => e.wired).length ?? 0),
        0,
      ),
    0,
  );
  const botMap = buildBotMap(BRANCHES);

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
            title={`Toggle the architecture diagram — ${totalBots} bots across ${BRANCHES.length} branches, ${wiredEdges}/${totalEdges} handoffs wired`}
          >
            {showArchitecture ? "Hide" : "Show"} architecture
          </button>
        </div>
        <p className="mx-auto max-w-7xl px-4 sm:px-6 pb-3 text-xs text-slate-500">
          Live cross-client AI activity feed. {totalBots} bots across{" "}
          {BRANCHES.length} branches · {wiredEdges}/{totalEdges} handoffs wired.
          Architecture diagram below the feed when toggled.
        </p>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-6 pb-32 space-y-10">
        <AIActivityFeed />

        {showArchitecture && (
          <>
            <div className="border-t border-white/[0.06] pt-8">
              <p className="text-[10px] uppercase tracking-[0.22em] font-bold text-slate-400 mb-1">
                Architecture diagram
              </p>
              <h2 className="text-xl font-bold text-white mb-2">
                {totalBots} bots · {BRANCHES.length} branches ·{" "}
                <span className="text-emerald-300">{wiredEdges}</span>
                <span className="text-slate-500">/</span>
                <span className="text-slate-400">{totalEdges}</span> handoffs
                wired
              </h2>
              <p className="text-xs text-slate-500 max-w-3xl mb-4">
                Every Claude personality + LLM-powered tool the BlueJays system
                runs, plus the handoffs between them. Click any node for source
                files + outgoing edges. Solid lines = handoff is firing in
                production today; dashed = designed but not yet plumbed.
              </p>
              <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 mb-6">
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-2 h-2 rounded-full bg-violet-400" />
                  agent (autonomous)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-2 h-2 rounded-full bg-slate-400" />
                  tool (deterministic)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-2 h-2 rounded-full bg-rose-400" />
                  skill (slash command)
                </span>
              </div>
            </div>

            {/* ─── Head node ─── */}
            <div className="flex justify-center mb-2">
              <div className="rounded-2xl border-2 border-white/30 bg-gradient-to-br from-slate-800 to-slate-900 px-7 py-5 text-center shadow-[0_0_40px_rgba(255,255,255,0.08)]">
                <div className="text-4xl mb-1">🧠</div>
                <div className="text-base font-black tracking-tight text-white">
                  BlueJays Brain
                </div>
                <div className="text-[10px] uppercase tracking-widest text-slate-400 mt-0.5">
                  Ben + Claude + Madie
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <div className="w-px h-10 bg-gradient-to-b from-white/30 to-white/10" />
            </div>
            <div className="relative h-6">
              <div
                className="absolute left-[6%] right-[6%] top-1/2 h-px bg-white/15"
                aria-hidden="true"
              />
            </div>

            {/* ─── Branch grid ─── */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {BRANCHES.map((branch) => {
                const c = COLOR_MAP[branch.color];
                return (
                  <div key={branch.id} className="flex flex-col items-center">
                    <div className="w-px h-6 bg-white/15" />
                    <div
                      className={`w-full rounded-xl border ${c.border} ${c.bg} px-4 py-3 text-center mb-3`}
                    >
                      <div className="text-2xl mb-0.5">{branch.emoji}</div>
                      <div
                        className={`text-xs font-bold uppercase tracking-wider ${c.text}`}
                      >
                        {branch.name}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {branch.bots.length} bot
                        {branch.bots.length === 1 ? "" : "s"}
                      </div>
                    </div>

                    <div className="w-px h-3 bg-white/10" />

                    <ul className="w-full space-y-2">
                      {branch.bots.map((bot, i) => (
                        <li key={bot.id} className="relative">
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
                              <span className="text-lg leading-none mt-0.5">
                                {bot.emoji}
                              </span>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 mb-0.5">
                                  <div className="text-sm font-bold text-white truncate">
                                    {bot.name}
                                  </div>
                                </div>
                                <div className="text-[9px] uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                                  <span
                                    className={`px-1 py-px rounded border ${KIND_BADGE[bot.kind].cls}`}
                                  >
                                    {KIND_BADGE[bot.kind].label}
                                  </span>
                                  {bot.talksTo && bot.talksTo.length > 0 && (
                                    <span className="text-slate-500">
                                      → {bot.talksTo.length} edge
                                      {bot.talksTo.length === 1 ? "" : "s"}
                                    </span>
                                  )}
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
            <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 max-h-[60vh] overflow-y-auto">
              <div className="flex items-start gap-4">
                <div className="text-4xl shrink-0">{activeBot.emoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg font-bold text-white">
                      {activeBot.name}
                    </h2>
                    <span
                      className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded border ${KIND_BADGE[activeBot.kind].cls}`}
                    >
                      {KIND_BADGE[activeBot.kind].label}
                    </span>
                  </div>
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
                  {activeBot.talksTo && activeBot.talksTo.length > 0 && (
                    <div className="mt-4 border-t border-slate-800 pt-3">
                      <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-2">
                        Handoffs ({activeBot.talksTo.filter((e) => e.wired).length}
                        /{activeBot.talksTo.length} wired)
                      </p>
                      <ul className="space-y-1.5">
                        {activeBot.talksTo.map((edge) => {
                          const target = botMap.get(edge.to);
                          return (
                            <li
                              key={edge.to}
                              className="flex items-center gap-2 text-sm"
                            >
                              <span
                                className={`shrink-0 inline-block w-2 h-2 rounded-full ${edge.wired ? "bg-emerald-400" : "bg-amber-400"}`}
                                title={edge.wired ? "wired" : "designed, not wired"}
                              />
                              <span className="text-slate-500">→</span>
                              <span className="text-base">
                                {target?.emoji ?? "❓"}
                              </span>
                              <span className="font-semibold text-white">
                                {target?.name ?? edge.to}
                              </span>
                              <span className="text-slate-400 text-xs italic">
                                · {edge.via}
                              </span>
                              {!edge.wired && (
                                <span className="text-[9px] uppercase tracking-wider font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-1.5 py-px rounded ml-auto">
                                  TODO
                                </span>
                              )}
                            </li>
                          );
                        })}
                      </ul>
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
