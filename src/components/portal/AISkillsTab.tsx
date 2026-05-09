"use client";

import AIBotFlowChart from "./AIBotFlowChart";
import HyperloopTransparency from "./HyperloopTransparency";

/**
 * AISkillsTab — universal owner-portal panel showing every AI capability
 * the BlueJays AI Marketing System runs on the tenant's behalf.
 *
 * Designed for live walkthroughs: when Caleb / Jake / Nate / Hector asks
 * "what does my AI actually do?", this is the single screen that answers
 * it without making them dig through 10 tabs.
 *
 * Categorized into 5 buckets that map to the value chain:
 *   🎯 Lead acquisition
 *   ✉️ Messaging
 *   🎙 Sales conversations
 *   📊 Performance optimization
 *   📈 Analytics + reporting
 *
 * Each capability card carries a status pill so the owner sees what's
 * ACTIVE (running today on their data), AVAILABLE (built, awaiting their
 * config — env vars, API keys, content approval), or COMING (queued for
 * a future sprint).
 */

export type Status = "active" | "available" | "coming" | "trainable";

export type Capability = {
  emoji: string;
  title: string;
  detail: string;
  /** Status keyed by tenant slug — uses "default" if a slug isn't listed. */
  status: Record<string, Status> | { default: Status };
  /** Optional: where in the portal to see it in action. */
  seeItIn?: { label: string; tab: string };
  /** Optional: per-tenant trap to call out (for the engineering-replicate page) */
  trap?: string;
};

export type Category = {
  id: string;
  label: string;
  emoji: string;
  subtitle: string;
  capabilities: Capability[];
};

export const CATEGORIES: Category[] = [
  {
    id: "lead-acquisition",
    label: "Lead acquisition",
    emoji: "🎯",
    subtitle: "How net-new leads enter your system without you lifting a finger.",
    capabilities: [
      {
        emoji: "🗺️",
        title: "County-Level Lead Scout",
        detail:
          "Click any U.S. county. AI runs an audience-tagged Google Places search across the whole county, dedupes against your existing pipeline, drops 5-25 fresh leads into your Leads tab — every click. Multi-audience: stage Parent + Coach + Player, hit Run once, AI works all 3 in sequence. Replaces ~40 hrs of manual prospecting per county.",
        status: { default: "active" },
        seeItIn: { label: "Map tab", tab: "map" },
      },
      {
        emoji: "🎯",
        title: "Audience Auto-Detection",
        detail:
          "Every form submission and inbound message is classified into your pre-defined customer segments (e.g. Coach / Parent / Player / Camp Director) so the right funnel fires automatically.",
        status: { default: "active" },
        seeItIn: { label: "Leads tab", tab: "leads" },
      },
      {
        emoji: "🎁",
        title: "Interactive Lead Magnet",
        detail:
          "Configurator quizzes (Build Your Player, Build Your Tractor, Build Your Lake Map) generate a personalized recommendation and capture the lead with full context — 3-5× the conversion of static PDF magnets.",
        status: { default: "active" },
        seeItIn: { label: "Funnels tab", tab: "funnels" },
      },
      {
        emoji: "📥",
        title: "Missed-Call Text-Back",
        detail:
          "Caller hangs up. Within 60 seconds, AI texts them in your voice. Recovers 25-30% of leads that voicemail loses. For a service business doing 50 missed calls/month, that's 12-15 saved leads/month — typically $4-8K in recovered revenue.",
        status: { default: "available" },
      },
    ],
  },
  {
    id: "messaging",
    label: "Messaging AI",
    emoji: "✉️",
    subtitle: "Multi-channel funnels that know which message goes to which lead, when, and through what channel.",
    capabilities: [
      {
        emoji: "📧",
        title: "Audience-Segmented Funnels",
        detail:
          "Up to 6 audience tracks per tenant. Each track has its own day-by-day cadence using all 4 channels: email, SMS, ringless voicemail, and AI postcards via Lob. Definitions live; firing waits on email-domain auth + Twilio setup per tenant.",
        status: { "zenith-sports": "available", "itc-quick-attach": "available", default: "active" },
        seeItIn: { label: "Funnels tab", tab: "funnels" },
      },
      {
        emoji: "🤖",
        title: "AI Inbound Responder",
        detail:
          "Every inbound reply classified into 6 intent classes, drafted in your voice within 10 seconds, queued for one-tap approve. You stop reading every email. Reply latency drops from 3 hours to 90 seconds — the data says replies under 5 min convert 5× more.",
        status: { default: "available" },
        trap: "Voice-matching the owner takes 50+ training examples — generic LLM output tanks reply rates by ~40%.",
      },
      {
        emoji: "💬",
        title: "SMS Campaign Engine",
        detail:
          "Twilio-backed outbound SMS with cohort segmenting and reply detection. Auto-pauses funnel steps when a lead replies so the system doesn't talk over them.",
        status: { default: "available" },
      },
      {
        emoji: "🎙",
        title: "Ringless Voicemail Drops",
        detail:
          "Slybroadcast or Drop Cowboy drop a personalized voicemail directly to a lead's voicemail without ringing their phone — high-touch re-engagement for warm leads.",
        status: { default: "available" },
      },
      {
        emoji: "📮",
        title: "AI Postcards (Lob)",
        detail:
          "Physical mail step inside your funnel. AI generates artwork + copy per lead (their tractor model, kid's age group, their lake's shoreline) — Lob prints + ships. ~$1/card. Multi-channel sequences with a postcard step pull 3-5× the response of email-only. Hits when the inbox doesn't.",
        status: { default: "available" },
        seeItIn: { label: "Funnels tab", tab: "funnels" },
      },
    ],
  },
  {
    id: "sales",
    label: "Sales conversations",
    emoji: "🎙",
    subtitle: "When the funnel earns the call, AI helps you close.",
    capabilities: [
      {
        emoji: "📋",
        title: "Audience-Branched Sales Scripts",
        detail:
          "A full intro / qualify / pitch / CTA / voicemail / objection-handling tree per audience. Live variable substitution as you type the prospect's name + biz + tractor brand + age group.",
        status: { default: "active" },
        seeItIn: { label: "Sales Portal", tab: "partners" },
      },
      {
        emoji: "📞",
        title: "Cold-Call Workspace",
        detail:
          "Auto-pulls the next prospect, displays color-coded script, click-to-dial + click-to-text, one-tap outcome buttons, per-call notes — the script + the lead pool feel like one app.",
        status: { default: "active" },
      },
      {
        emoji: "🤝",
        title: "Partner Recruitment Page",
        detail:
          "Public landing page where reps + warm-referrer partners apply. Built-in payout structure (per-close commissions). Each partner gets a tracked link.",
        status: { default: "active" },
        seeItIn: { label: "Sales Portal", tab: "partners" },
      },
      {
        emoji: "🎯",
        title: "Lead Pool Smart Dispatch",
        detail:
          "When you (or your reps) start dialing, AI filters the pool: excludes paid / in-progress / unsubscribed / DNC, excludes anyone called by ANY rep in the last 30 days, prefers leads with a completed audit. No collisions.",
        status: { default: "active" },
      },
    ],
  },
  {
    id: "optimization",
    label: "Performance optimization",
    emoji: "📊",
    subtitle: "The system learns from what works without you running A/B tests yourself.",
    capabilities: [
      {
        emoji: "🔬",
        title: "Hyperloop A/B Engine",
        detail:
          "Wilson Confidence Interval testing on every subject line, ad creative, landing-page variant. AI auto-promotes winners only when statistically real (no noise winners). Compounds — at 10 tests/yr, your top funnel typically lifts 30-50% conversion vs the baseline.",
        status: { default: "available" },
        trap: "Most A/B 'winners' aren't statistically significant — without Wilson-CI gating you optimize for noise.",
      },
      {
        emoji: "🧠",
        title: "Site Audit Engine",
        detail:
          "Crawl any competitor URL, AI generates a hero / structure / speed / mobile / copy audit with findings + recommended fixes + a 0-100 score. Useful for partner pitches AND for keeping your own site sharp.",
        status: { default: "active" },
      },
      {
        emoji: "🚀",
        title: "Paid Ads Optimizer · Meta + Google",
        detail:
          "Hormozi-codified iteration engine running on every active creative. Every Monday surfaces 4 nudge cards: Scale (ROAS 7+ → spend more), Iterate (winners unchanged 14+ days → 100 reskins per Rule 2), Audit (retargeting gaps · branded PPC · proof-led ratio · pain hooks), Kill (ROAS <1 over 21+ days → cut). Backed by the 11-rule paid_ads_iteration skill — 70/20/10 budget allocation, 80% reskinning discipline, top-3-second mining, proof > promise. Owner requests changes from the Ads tab; operator pushes to Meta/Google within 24 hrs.",
        status: { "zenith-sports": "available", "itc-quick-attach": "available", default: "available" },
        seeItIn: { label: "Ads tab", tab: "ads" },
        trap: "Most ad operators iterate weekly without rules — burns budget on noise. The skill enforces hard rules: don't kill creatives <7 days old, reskin winners before net-new, capacity-check before any scale recommendation.",
      },
      {
        emoji: "📡",
        title: "Multi-Platform Marketing Optimizer",
        detail:
          "Same Hormozi framework applied across the rest of the marketing stack: TikTok Ads, LinkedIn Ads, Lob direct-mail postcards, podcast sponsorships, influencer outreach. Picks the right platform per audience (parent → Meta · coach → email + podcast · channel-partner → LinkedIn · re-engagement → Lob postcard). Runs the iteration engine across all platforms and surfaces cross-platform allocation drift — are you spending where ROAS justifies, or stuck on Meta out of habit? Cross-channel budget rebalancing is the lever most operators miss.",
        status: { "zenith-sports": "coming", "itc-quick-attach": "coming", default: "coming" },
        seeItIn: { label: "Ads tab", tab: "ads" },
      },
      {
        emoji: "🔥",
        title: "Microsoft Clarity Heatmaps",
        detail:
          "Free session recordings + click/scroll heatmaps on your site. AI surfaces drop-off patterns into your weekly digest so the optimization loop stays evidence-based.",
        status: { default: "available" },
      },
    ],
  },
  {
    id: "analytics",
    label: "Analytics + reporting",
    emoji: "📈",
    subtitle: "What the system thinks you should know each week.",
    capabilities: [
      {
        emoji: "⚡",
        title: "Real-Time Activity Feed",
        detail:
          "Joins your leads, lead messages, campaign sends, and API costs into one time-sorted live stream. 6-second polling. Pause when you want to focus.",
        status: { default: "active" },
        seeItIn: { label: "Activity tab", tab: "activity" },
      },
      {
        emoji: "📊",
        title: "Weekly + Monthly Auto-Reports",
        detail:
          "Cron-rendered Monday digest: leads captured, replies received, campaigns sent, top-performing audience, biggest cost line. Emailed to you. No spreadsheet building.",
        status: { default: "active" },
        seeItIn: { label: "Insights tab", tab: "insights" },
      },
      {
        emoji: "💰",
        title: "Per-Tenant Cost Attribution",
        detail:
          "Every Claude / SendGrid / Twilio / Google Places API call attributes itself to your account. You see exactly what your AI cost to run last month — typically $20-80/mo total.",
        status: { default: "active" },
        seeItIn: { label: "Budget tab", tab: "budget" },
      },
      {
        emoji: "🎯",
        title: "Per-Audience Conversion Tracking",
        detail:
          "Every funnel step writes to the analytics ledger. AI rolls up: which audience opens the most? Which converts? Where do leads drop off? Surfaces the weakest link in your sequence. Numbers populate as funnels start firing.",
        status: { "zenith-sports": "available", "itc-quick-attach": "available", default: "active" },
        seeItIn: { label: "Insights tab", tab: "insights" },
      },
    ],
  },
  {
    id: "trainable",
    label: "Custom training",
    emoji: "🚀",
    subtitle: "What we can train your AI to do for you. Tell us what you want; we wire it.",
    capabilities: [
      {
        emoji: "🗣️",
        title: "Voice Cloning · outbound in your voice",
        detail:
          "Drop a 30-min recording. Within 48 hours, every voicemail, missed-call text-back voice reply, and AI-driven follow-up sounds like you — not a robot. Voice-cloned outreach pulls 2-4× the call-back rate of generic AI voice. Setup once, runs forever.",
        status: { default: "trainable" },
      },
      {
        emoji: "🎯",
        title: "Predictive Lead Scoring",
        detail:
          "AI scores every lead 0-100 on close-likelihood. Your dashboard sorts hot to cold automatically — the top 20% close 5× more often than the bottom 20%. You stop wasting hours on tire-kickers. Live within 1 week of training.",
        status: { default: "trainable" },
      },
      {
        emoji: "🌶️",
        title: "Sentiment Hot-Lead Alerts",
        detail:
          "AI reads every inbound reply for emotional intensity. Excited buyer → SMS you in under 60s with \"this one's ready, call today.\" Frustrated → auto-soothing response + your inbox. Catches 90%+ of urgent intent vs hours of manual triage. Live in 3 days.",
        status: { default: "trainable" },
      },
      {
        emoji: "🌎",
        title: "Multi-Language Funnels",
        detail:
          "AI translates + tone-adapts your entire funnel into Spanish, Portuguese, Mandarin — whatever your audience speaks. Latino soccer market alone = 60M+ in the US. Idiom-aware (la pelota, el entrenamiento), not literal. One funnel, 2-3× the addressable audience. Live in 2 weeks.",
        status: { default: "trainable" },
      },
      {
        emoji: "📅",
        title: "AI Social Media Calendar",
        detail:
          "Train AI on your voice + your top-performing posts. Generates 90 days of captions + hashtags + image prompts + post times at a time. One-click schedule. Replaces a $1500/mo content writer; you spend 10 min/quarter reviewing instead of 4 hours/week creating.",
        status: { default: "trainable" },
      },
      {
        emoji: "🤖",
        title: "Custom Site Chatbot · trained on your FAQ",
        detail:
          "We feed AI your products, pricing, services, every past customer question. Bot lives on your site 24/7 answering in your voice. Books calls when it can't. Average service business: 70%+ of inbound questions handled before you see them. ~25 hrs/week reclaimed.",
        status: { default: "trainable" },
      },
      {
        emoji: "🔁",
        title: "Smart Re-Engagement of Dormant Customers",
        detail:
          "AI mines past customers, predicts who'll respond, writes a unique message per person (references what they bought + when + their family's lake / kid's age group / tractor model), ships across email + SMS + postcard. 8-12% reactivation = $X thousand in immediate recovered revenue from a list you already paid to build.",
        status: { default: "trainable" },
      },
      {
        emoji: "📞",
        title: "Conversational AI Sales Rep (voice)",
        detail:
          "AI agent answers missed calls live in your tone, qualifies the lead (budget, timeline, fit), books the call on your calendar, SMS-summarizes to you. Works 24/7 including 2 AM Sunday. Recovers 30-50% of leads voicemail loses — the difference between a $40K and $60K month.",
        status: { default: "trainable" },
      },
      {
        emoji: "📸",
        title: "Photo / Video AI Analysis",
        detail:
          "Customer sends a pic, AI replies with what they need. Soccer parent: \"send a video of your kid juggling\" → AI scores skill + recommends drills. Lake customer: photo of their cabin wall → AI suggests map size. Tractor: photo of mower → AI identifies brand + accessories. Built on Claude Vision · 2-3 weeks to train.",
        status: { default: "trainable" },
      },
    ],
  },
];

const STATUS_META: Record<Status, { label: string; chip: string; ring: string; dot: string }> = {
  active: {
    label: "Active",
    chip: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    ring: "border-emerald-500/30",
    dot: "bg-emerald-400",
  },
  available: {
    label: "Available",
    chip: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    ring: "border-amber-500/20",
    dot: "bg-amber-400",
  },
  coming: {
    label: "Coming",
    chip: "bg-slate-500/15 text-slate-400 border-slate-500/30",
    ring: "border-white/[0.06]",
    dot: "bg-slate-500",
  },
  trainable: {
    label: "Trainable",
    chip: "bg-violet-500/15 text-violet-300 border-violet-500/40",
    ring: "border-violet-500/25",
    dot: "bg-violet-400",
  },
};

export default function AISkillsTab({
  slug,
  onJumpToTab,
}: {
  slug: string;
  /** Hook back to the parent's setTab so "see it in action" jumps the user there. */
  onJumpToTab?: (tab: string) => void;
}) {
  // Aggregate stats across all categories.
  const allCaps = CATEGORIES.flatMap((c) => c.capabilities);
  const counts = {
    active: allCaps.filter((c) => statusFor(c, slug) === "active").length,
    available: allCaps.filter((c) => statusFor(c, slug) === "available").length,
    coming: allCaps.filter((c) => statusFor(c, slug) === "coming").length,
    trainable: allCaps.filter((c) => statusFor(c, slug) === "trainable").length,
    total: allCaps.length,
  };

  return (
    <div className="space-y-6">
      {/* VISUAL FLOW CHART — added 2026-05-07. Brain → 5 branches →
          per-bot leaves with live/locked status. Mirrors the internal
          /dashboard/ai-bots layout but tightened for owner use; click
          any node to surface the full description in an inline drawer.
          Reads from the same CATEGORIES + statusFor() this file already
          exports, so the visual + the detailed list never drift. */}
      <AIBotFlowChart slug={slug} />

      {/* HYPERLOOP TRANSPARENCY — added 2026-05-07. Glass-box view of
          every A/B decision the engine has made. Currently testing /
          promoted winners / killed losers, with per-variant CTR +
          impressions. Renewal-stickiness move: clients SEE the AI
          making decisions instead of trusting the abstract claim. */}
      <HyperloopTransparency slug={slug} />

      {/* HEADER */}
      <div className="rounded-2xl bg-gradient-to-br from-violet-950/40 via-violet-900/15 to-slate-900/60 border border-violet-500/20 p-6">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-violet-300 font-bold mb-1">
              Your AI · what it does
            </p>
            <h2 className="text-2xl font-black tracking-tight text-violet-100 mb-1">
              🧠 AI Skills
            </h2>
            <p className="text-sm text-violet-200/70 max-w-2xl leading-relaxed">
              Every AI capability running on your account — what&apos;s active
              today, what&apos;s built and waiting for your config, and
              what&apos;s queued. One screen so you don&apos;t have to dig
              through 10 tabs to know what your AI is doing.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-5">
          <Stat
            label="Active"
            value={String(counts.active)}
            tone="emerald"
            withDot
          />
          <Stat
            label="Available"
            value={String(counts.available)}
            tone="amber"
            withDot
          />
          <Stat
            label="Trainable"
            value={String(counts.trainable)}
            tone="violet"
            withDot
          />
          <Stat
            label="Total"
            value={String(counts.total)}
            tone="white"
          />
        </div>
      </div>

      {/* CATEGORIES */}
      {CATEGORIES.map((cat) => (
        <section key={cat.id} className="space-y-3">
          <div className="flex items-baseline gap-3 px-1">
            <h3 className="text-sm font-bold tracking-wider uppercase text-white">
              {cat.emoji} {cat.label}
            </h3>
            <span className="text-[11px] text-slate-500 leading-tight">
              {cat.subtitle}
            </span>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {cat.capabilities.map((cap) => {
              const status = statusFor(cap, slug);
              const meta = STATUS_META[status];
              return (
                <div
                  key={cap.title}
                  className={`rounded-xl border ${meta.ring} bg-slate-900/40 p-4 hover:bg-slate-900/60 transition-colors`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl shrink-0 leading-none mt-0.5">
                      {cap.emoji}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2 flex-wrap">
                        <p className="font-bold text-white text-sm leading-tight">
                          {cap.title}
                        </p>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider rounded-full px-2 py-0.5 border inline-flex items-center gap-1 ${meta.chip}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${meta.dot} ${
                              status === "active" ? "animate-pulse" : ""
                            }`}
                          />
                          {meta.label}
                        </span>
                      </div>
                      <p className="text-[12px] text-slate-400 leading-relaxed mt-1.5">
                        {cap.detail}
                      </p>
                      {cap.seeItIn && onJumpToTab && (
                        <button
                          type="button"
                          onClick={() => onJumpToTab(cap.seeItIn!.tab)}
                          className="mt-2.5 inline-flex items-center gap-1 text-[11px] uppercase tracking-wider font-bold text-violet-300 hover:text-violet-200"
                        >
                          See it in action · {cap.seeItIn.label} →
                        </button>
                      )}
                      {cap.seeItIn && !onJumpToTab && (
                        <p className="mt-2 text-[11px] text-slate-500 italic">
                          See it: {cap.seeItIn.label}
                        </p>
                      )}
                      {!cap.seeItIn && status === "trainable" && (
                        <a
                          href={`mailto:ben@bluejayportfolio.com?subject=Train AI · ${encodeURIComponent(
                            cap.title,
                          )}&body=${encodeURIComponent(
                            `Hey Ben — interested in turning on "${cap.title}" for our account. Let's talk scope + quote.`,
                          )}`}
                          className="mt-2.5 inline-flex items-center gap-1 text-[11px] uppercase tracking-wider font-bold text-violet-300 hover:text-violet-200"
                        >
                          Get a quote → email Ben
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}

      {/* FOOTER NOTE */}
      <div className="rounded-2xl bg-slate-900/40 border border-white/[0.06] p-4 text-xs text-slate-500 italic leading-relaxed space-y-1.5">
        <div>
          <span className="text-emerald-400">●</span> <strong>Active</strong> ·
          running on your account today
        </div>
        <div>
          <span className="text-amber-400">●</span> <strong>Available</strong>{" "}
          · built, ready to flip on with your config
        </div>
        <div>
          <span className="text-violet-400">●</span> <strong>Trainable</strong>{" "}
          · custom-build for your business — extra scope, scoped quote
        </div>
        <div>
          <span className="text-slate-500">●</span> <strong>Coming</strong> ·
          queued for a future sprint
        </div>
        <div className="pt-2 border-t border-white/[0.05] mt-2">
          Want a Trainable capability turned on, or anything moved up the
          queue? Email{" "}
          <a
            href="mailto:ben@bluejayportfolio.com"
            className="text-violet-300 hover:text-violet-200"
          >
            ben@bluejayportfolio.com
          </a>
          .
        </div>
      </div>
    </div>
  );
}

export function statusFor(cap: Capability, slug: string): Status {
  const s = cap.status as Record<string, Status>;
  return s[slug] ?? s.default ?? "available";
}

function Stat({
  label,
  value,
  tone,
  withDot,
}: {
  label: string;
  value: string;
  tone: "white" | "emerald" | "amber" | "slate" | "violet";
  withDot?: boolean;
}) {
  const cls: Record<typeof tone, string> = {
    white: "text-white",
    emerald: "text-emerald-300",
    amber: "text-amber-300",
    slate: "text-slate-400",
    violet: "text-violet-300",
  };
  const dotCls: Record<typeof tone, string> = {
    white: "bg-white",
    emerald: "bg-emerald-400",
    amber: "bg-amber-400",
    slate: "bg-slate-500",
    violet: "bg-violet-400",
  };
  return (
    <div className="rounded-md bg-black/30 border border-white/5 px-3 py-2 text-center">
      <div className="text-[9px] uppercase tracking-wider text-slate-500 mb-0.5 inline-flex items-center gap-1.5 justify-center">
        {withDot && <span className={`w-1.5 h-1.5 rounded-full ${dotCls[tone]}`} />}
        {label}
      </div>
      <div className={`text-lg font-black tabular-nums ${cls[tone]}`}>
        {value}
      </div>
    </div>
  );
}
