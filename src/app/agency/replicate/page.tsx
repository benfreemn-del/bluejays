import Link from "next/link";

export const metadata = {
  title: "What you'd build to replicate this — BlueJays AI Marketing System",
  description:
    "Honest engineering teardown: every component inside the $10,000 BlueJays AI Marketing System, with hours-to-build and monthly running cost estimates.",
};

/**
 * /agency/replicate — engineering teardown of the AI Marketing System.
 *
 * Designed for prospects who say "I have Claude, I could build this myself."
 * The honest answer is yes — but here's what it actually costs in time and
 * running infrastructure once you account for every piece. Component-by-
 * component, with hours estimates a senior contractor would charge.
 */

type Component = {
  title: string;
  detail: string;
  /** Senior-contractor hours to build, ground-up */
  hours: number;
  /** Monthly running cost in USD (0 if free / one-time) */
  monthly?: number;
  /** One-line reason this is harder than it looks */
  trap?: string;
};

const FOUNDATIONS: Component[] = [
  {
    title: "Multi-tenant auth + slug routing",
    detail:
      "Cookie-session auth for owners + admin, per-tenant cookies (CLIENT_PORTAL_COOKIE), slug-aware middleware that gates /clients/[slug]/* + /api/admin/*, plus admin-impersonate-as-client shortcut.",
    hours: 32,
    trap: "Cookie-name conflicts and missing slug-scoped queries leak data between tenants — hardest bug to catch in QA.",
  },
  {
    title: "Per-tenant Postgres schema",
    detail:
      "client_owners, client_leads, client_lead_messages, client_email_campaigns, client_email_sends, client_tasks, client_budget_items, client_subscriptions, system_costs (with client_slug), recurring_costs (with client_slug). 10+ tables, 15+ indexes, 5+ migrations evolving the schema as patterns emerge.",
    hours: 28,
    trap: "Adding client_slug to system_costs after the fact requires backfilling NULL rows + re-checking every cost-logger call site.",
  },
  {
    title: "Deploy infra · Vercel + Supabase + cron",
    detail:
      "Vercel Edge + Postgres connection pooling, vercel.json cron schedule (daily digest, every-5-min campaign tick, weekly recurring-cost charge), env-var management across preview + prod.",
    hours: 12,
    monthly: 20,
    trap: "Vercel cron quietly stops on stuck deploys — needs a heartbeat row to detect silent failures.",
  },
  {
    title: "Domain + SSL automation",
    detail:
      "Per-client domain mapping (yourbiz.com → /clients/yourbiz/*) via middleware host header inspection; cert auto-provisioning.",
    hours: 8,
  },
];

const LEAD_CAPTURE: Component[] = [
  {
    title: "Public inquire endpoint with audience detection",
    detail:
      "POST /api/clients/inquire/[code] receives form data, runs detectAudience() that maps free-text intent + landing-page slug to one of 6 segments per client, persists lead, fires SMS alert to owner, queues day-0 email.",
    hours: 14,
    trap: "Audience detection regex misses ~15% of intents — needs LLM fallback that costs ~$0.001/lead.",
  },
  {
    title: "Six audience-specific landing pages",
    detail:
      "Per-segment copy, hero, social proof, form. Each tagged so capture lands in the right funnel automatically. Real product references (not generic copy).",
    hours: 36,
    trap: "Copy that converts is 80% of the work — generic templates pull <1% conversion vs. 6-12% for audience-tuned pages.",
  },
  {
    title: "Interactive lead magnet (configurator quiz)",
    detail:
      "Client-side state machine; live SVG that re-renders as the user toggles options; final personalized recommendation; capture form auto-routes to the matching audience funnel.",
    hours: 42,
    trap: "Live SVG that updates on every toggle (vs. just at the end) is what 3-5×s the conversion rate — and is the hardest piece to ship.",
  },
  {
    title: "Lead pipeline UI · audience badges + timeline",
    detail:
      "Filter by audience, click any lead to see full message timeline (inbound + outbound, color-coded by direction), promote to customer, mark DNC/bounced.",
    hours: 18,
  },
];

const FUNNELS: Component[] = [
  {
    title: "Email campaign engine",
    detail:
      "Compose with merge tags, audience-segment filter, schedule for future date, draft/queued/running/sent state machine, idempotent step advancement.",
    hours: 24,
    trap: "Idempotency on cron retries is the silent bug factory — without it, a single re-run double-sends every campaign.",
  },
  {
    title: "Scheduled cron tick · every 5 min",
    detail:
      "Picks up campaigns whose scheduled_at has passed, fans out to client_email_sends, calls SendGrid, advances state. Built to survive partial failures.",
    hours: 14,
    monthly: 0,
  },
  {
    title: "SendGrid event webhook",
    detail:
      "Receives delivered/open/click/bounce/spam events, maps each to a client_email_sends row, advances send.status forward only, bumps campaign aggregates (open_count, click_count).",
    hours: 16,
    monthly: 20,
    trap: "Webhook signature verification is in SendGrid docs but rarely implemented; without it, anyone can spoof opens.",
  },
  {
    title: "Multi-step, 4-channel audience funnels",
    detail:
      "Each audience has its own day-by-day drip schedule (Day 0 capture, Day 2, Day 5, Day 14, Day 30) using ALL FOUR channels — email, SMS, voicemail, AI postcard — interleaved by audience preference. Step-skip logic if the lead replies or buys.",
    hours: 22,
    trap: "Mixing channels in one funnel multiplies the bug surface — a SMS step that fires before the email arrives looks robotic. The cron has to know which channel ships first per audience.",
  },
  {
    title: "SMS follow-ups + missed-call text-back",
    detail:
      "Twilio integration: outbound SMS as funnel touch, missed-call detection via Twilio Studio webhook, auto-reply within 60 seconds.",
    hours: 20,
    monthly: 1.15,
  },
  {
    title: "Voicemail drops",
    detail:
      "Ringless voicemail vendor integration (Slybroadcast / Drop Cowboy), queueing system, per-audience voicemail script library.",
    hours: 16,
    monthly: 30,
  },
  {
    title: "AI postcards via Lob",
    detail:
      "Physical-mail funnel step. Lob print-and-mail API integration, AI-generated front artwork (tuned per lead's context — tractor model, hunting state, kid's age), personalized back copy, address-validation pipeline, deliverability tracking. Adds ~$1/lead but lifts response 3-5× over email-only sequences.",
    hours: 26,
    monthly: 0,
    trap: "Lob's address verification rejects ~8% of inbound addresses — needs a fallback that queues the failure for owner review instead of silently dropping the postcard.",
  },
];

const AI_LAYER: Component[] = [
  {
    title: "AI inbound responder · intent classification",
    detail:
      "On every inbound reply: classify into 6 intent classes (interested / not-now / objection-price / objection-timing / question / unsubscribe), draft a response in the owner's voice, log to admin queue for one-tap approve/edit/send.",
    hours: 38,
    monthly: 60,
    trap: "Voice-matching the owner takes 50+ training examples; generic LLM output tanks reply rates by ~40%.",
  },
  {
    title: "Hyperloop A/B engine · Wilson CI",
    detail:
      "Statistical confidence intervals on subject lines + hooks, auto-promote winners once CI lower bound exceeds the runner-up's upper bound. Per-audience winner tracking.",
    hours: 22,
    trap: "Most A/B 'winners' aren't statistically significant — without Wilson-CI gating you optimize for noise.",
  },
  {
    title: "Site audit engine",
    detail:
      "Crawl a competitor URL, run hero + structure + speed + mobile + copy analysis through Claude, render an audit page with findings + recommended fixes + score.",
    hours: 28,
    monthly: 15,
  },
  {
    title: "Cost logger with attribution",
    detail:
      "Every Claude/SendGrid/Twilio/Places API call logs row to system_costs with client_slug for per-tenant billing splits. Threaded through 30+ caller sites.",
    hours: 18,
    trap: "Forgetting client_slug on one cost call silently drops it into the 'house' bucket, costing you margin you can't recover.",
  },
];

const SALES: Component[] = [
  {
    title: "Cold-call workspace",
    detail:
      "Auto-pulls next prospect from queue, displays color-coded script + tips + click-to-dial + click-to-text + one-tap outcome buttons (booked / VM / not interested / DNC) with per-call notes.",
    hours: 34,
  },
  {
    title: "Audience-branched script library",
    detail:
      "Six fully-written CallScripts (intro / qualify / pitch / CTA / voicemail) + branched objection handlers per audience, with template-variable substitution.",
    hours: 26,
    trap: "The objections matter more than the openers — generic 'too expensive' replies leave 30% of close potential on the table.",
  },
  {
    title: "Partner program · apply + approve + track + payout",
    detail:
      "Public landing pitch, apply form, admin approval queue, partner workspace login, partner_referrals table, manual-payout dashboard with status tracking.",
    hours: 48,
  },
  {
    title: "Lead pool guardrails",
    detail:
      "Filter rules: exclude paid/in-progress/deployed/bounced/unsubscribed/DNC, exclude prospects called by ANY partner in last 30 days, prefer audited prospects, randomize to avoid collisions.",
    hours: 14,
  },
];

const ANALYTICS: Component[] = [
  {
    title: "Real-time activity feed",
    detail:
      "Joins client_leads + client_lead_messages + client_email_sends + system_costs into one slug-scoped, time-sorted event stream. Polls every 6s in the portal. Pause/resume + 5 summary counters.",
    hours: 12,
  },
  {
    title: "Owner portal · 10 tabs",
    detail:
      "Overview / Leads / Activity / To-Do / Budget / Campaigns / Funnels / Map / Insights / Account. One login. Mobile-responsive. Single source of truth.",
    hours: 38,
  },
  {
    title: "Spending dashboard with per-tenant filter",
    detail:
      "Daily chart, road-to-revenue-goal gauge, recurring + variable cost split, per-client filter, ad-spend logger.",
    hours: 22,
  },
  {
    title: "Weekly + monthly digest auto-generation",
    detail:
      "Cron-rendered Monday digest: leads captured, replies received, campaigns sent, top-performing audience, biggest cost line. Emailed to owner.",
    hours: 16,
  },
  {
    title: "Microsoft Clarity heatmaps",
    detail:
      "Wired into every client site for free session-recording + click/scroll heatmaps. Drop-off insights flow back into the optimization loop.",
    hours: 1,
    monthly: 0,
  },
  {
    title: "County-level lead scout map",
    detail:
      "US county GeoJSON overlay (3000+ features), click any county to scout audience-tagged businesses via Google Places, fly-to-bounds zoom, universal status colors (blue=in-progress, green=completed, red ✕=no results) persisted in localStorage, MLS/USL/MLS-NEXT data layers.",
    hours: 56,
    monthly: 12,
    trap: "Loading 3000-feature GeoJSON without bounding-box filtering tanks mobile performance — needs progressive loading.",
  },
];

const ADS_SEO: Component[] = [
  {
    title: "Google Ads + Meta Ads · self-learning structure",
    detail:
      "Conversion-event wiring (lead capture, configurator complete, audit request), audience-based campaign architecture, weekly creative rotation, Wilson-CI gating on winners.",
    hours: 28,
    monthly: 0,
    trap: "Most 'self-learning' campaigns fail because the conversion-event signal is dirty — needs server-side event firing to dedupe.",
  },
  {
    title: "Long-term SEO build",
    detail:
      "Site architecture, content cluster planning, schema markup, internal linking strategy, monthly content cadence, GSC + GA4 wiring.",
    hours: 40,
    monthly: 0,
  },
  {
    title: "Custom website",
    detail:
      "Conversion-tracked, fast (Lighthouse 90+), mobile-first, on-brand, hooked into the rest of the system.",
    hours: 60,
  },
  {
    title: "Logo revision + brand polish",
    detail:
      "Refresh that matches the system's tone — not Fiverr-generic, but not over-engineered.",
    hours: 8,
  },
];

const SECTIONS: { id: string; title: string; subtitle: string; items: Component[] }[] = [
  {
    id: "foundations",
    title: "Foundations",
    subtitle: "The plumbing nobody sees but everything depends on",
    items: FOUNDATIONS,
  },
  {
    id: "lead-capture",
    title: "Lead capture",
    subtitle: "Where prospects become leads",
    items: LEAD_CAPTURE,
  },
  {
    id: "funnels",
    title: "Funnels & messaging",
    subtitle: "What runs after the form is filled",
    items: FUNNELS,
  },
  {
    id: "ai",
    title: "AI layer",
    subtitle: "Where the system gets smarter without you touching it",
    items: AI_LAYER,
  },
  {
    id: "sales",
    title: "Sales operations",
    subtitle: "If you have a team or partners",
    items: SALES,
  },
  {
    id: "analytics",
    title: "Analytics & control",
    subtitle: "How the owner watches the system breathe",
    items: ANALYTICS,
  },
  {
    id: "ads-seo",
    title: "Ads, SEO, brand",
    subtitle: "The traffic that feeds the funnel",
    items: ADS_SEO,
  },
];

const TOTAL_HOURS = SECTIONS.reduce(
  (sum, s) => sum + s.items.reduce((sub, i) => sub + i.hours, 0),
  0,
);
const TOTAL_MONTHLY = SECTIONS.reduce(
  (sum, s) => sum + s.items.reduce((sub, i) => sub + (i.monthly ?? 0), 0),
  0,
);
const HOURLY_RATE = 125; // honest senior-contractor rate
const TOTAL_BUILD_COST = TOTAL_HOURS * HOURLY_RATE;

export default function ReplicatePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Nav */}
      <nav className="border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-white font-bold text-lg tracking-tight">
          Blue<span className="text-sky-400">Jays</span>
        </Link>
        <Link
          href="/agency"
          className="text-sm text-slate-400 hover:text-white transition-colors"
        >
          ← Agency overview
        </Link>
      </nav>

      {/* Hero */}
      <section className="border-b border-white/5 bg-gradient-to-b from-violet-950/30 to-transparent">
        <div className="mx-auto max-w-3xl px-6 py-16 text-center">
          <p className="text-xs uppercase tracking-widest text-violet-300 font-semibold mb-3">
            Engineering teardown · honest numbers
          </p>
          <h1 className="text-4xl md:text-6xl font-black leading-tight mb-5">
            What you&apos;d build{" "}
            <span className="text-violet-400">to replicate this.</span>
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed mb-7">
            Yes — you could build this with Claude. Here&apos;s every component
            inside the $10,000 AI Marketing System, with senior-contractor
            hours and monthly running cost. No padding. We built it; we know
            what it cost.
          </p>

          <div className="grid sm:grid-cols-3 gap-3 max-w-2xl mx-auto mb-8">
            <Stat
              label="Components"
              value={String(
                SECTIONS.reduce((s, sec) => s + sec.items.length, 0),
              )}
            />
            <Stat label="Senior-dev hours" value={`~${TOTAL_HOURS}`} />
            <Stat
              label="Replication cost"
              value={`$${(TOTAL_BUILD_COST / 1000).toFixed(0)}K`}
              accent
            />
          </div>

          <p className="text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
            At ${HOURLY_RATE}/hr senior-contractor rate. Plus ~$
            {TOTAL_MONTHLY.toFixed(0)}/mo in running infrastructure. Plus the
            6–12 months of iteration to figure out which parts actually move
            the needle.
          </p>
        </div>
      </section>

      {/* Anchor nav */}
      <nav className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/95 backdrop-blur">
        <div className="mx-auto max-w-5xl px-6 py-3 flex flex-wrap gap-2">
          {SECTIONS.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="text-xs font-semibold rounded-md border border-white/10 hover:border-violet-500/50 hover:text-white text-slate-400 px-3 py-1.5 transition-colors"
            >
              {s.title}
            </a>
          ))}
          <a
            href="#total"
            className="text-xs font-bold rounded-md border border-violet-500/40 bg-violet-500/10 text-violet-200 hover:bg-violet-500/20 px-3 py-1.5 transition-colors ml-auto"
          >
            Totals →
          </a>
        </div>
      </nav>

      {/* Sections */}
      {SECTIONS.map((sec) => {
        const sectionHours = sec.items.reduce((s, i) => s + i.hours, 0);
        const sectionMonthly = sec.items.reduce(
          (s, i) => s + (i.monthly ?? 0),
          0,
        );
        return (
          <section
            key={sec.id}
            id={sec.id}
            className="border-b border-white/5 scroll-mt-16"
          >
            <div className="mx-auto max-w-5xl px-6 py-14">
              <div className="mb-8 flex items-end justify-between flex-wrap gap-4">
                <div>
                  <h2 className="text-3xl md:text-4xl font-extrabold leading-tight">
                    {sec.title}
                  </h2>
                  <p className="text-slate-400 mt-2 leading-relaxed">
                    {sec.subtitle}
                  </p>
                </div>
                <div className="flex gap-3 text-xs">
                  <span className="rounded-md border border-violet-500/30 bg-violet-500/10 text-violet-200 px-3 py-1.5 font-bold">
                    {sectionHours} hrs
                  </span>
                  {sectionMonthly > 0 && (
                    <span className="rounded-md border border-emerald-500/30 bg-emerald-500/10 text-emerald-200 px-3 py-1.5 font-bold">
                      ${sectionMonthly.toFixed(2)}/mo
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                {sec.items.map((item) => (
                  <ComponentCard key={item.title} item={item} />
                ))}
              </div>
            </div>
          </section>
        );
      })}

      {/* Totals */}
      <section
        id="total"
        className="border-b border-white/5 bg-gradient-to-b from-violet-950/30 to-transparent scroll-mt-16"
      >
        <div className="mx-auto max-w-3xl px-6 py-16">
          <p className="text-xs uppercase tracking-widest text-violet-300 font-semibold mb-3 text-center">
            All in
          </p>
          <h2 className="text-3xl md:text-5xl font-extrabold leading-tight text-center mb-10">
            What it would actually cost you to build
          </h2>

          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            <BigStat
              label="Senior-dev hours"
              value={`${TOTAL_HOURS}`}
              sub={`~${Math.round(TOTAL_HOURS / 40)} full-time weeks`}
            />
            <BigStat
              label="Build cost"
              value={`$${TOTAL_BUILD_COST.toLocaleString()}`}
              sub={`@ $${HOURLY_RATE}/hr`}
              accent
            />
            <BigStat
              label="Running cost"
              value={`$${TOTAL_MONTHLY.toFixed(0)}/mo`}
              sub="infrastructure + APIs"
            />
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-6 mb-6">
            <p className="text-sm text-slate-400 mb-2 font-semibold uppercase tracking-wider">
              Build cost vs. BlueJays
            </p>
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b border-white/5">
                  <td className="py-2 text-slate-300">
                    Build it yourself (senior contractor)
                  </td>
                  <td className="py-2 text-right text-rose-400 font-bold">
                    ${TOTAL_BUILD_COST.toLocaleString()}
                  </td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-2 text-slate-300">
                    + 6–12 months of iteration to find what works
                  </td>
                  <td className="py-2 text-right text-rose-400 font-bold">
                    + $20–50K
                  </td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-2 text-slate-300">
                    + Owner&apos;s time managing the build
                  </td>
                  <td className="py-2 text-right text-rose-400 font-bold">
                    + months
                  </td>
                </tr>
                <tr>
                  <td className="py-3 text-white font-bold">
                    BlueJays AI Marketing System
                  </td>
                  <td className="py-3 text-right text-emerald-400 font-extrabold text-lg">
                    $10,000
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-xs text-slate-500 text-center max-w-xl mx-auto leading-relaxed">
            Hour estimates are honest — what a senior contractor would
            actually charge to ship each piece, ground-up, today. They do
            NOT include the 6–12 months of A/B testing, copy iteration, and
            funnel tuning that turn a working system into one that converts.
          </p>
        </div>
      </section>

      {/* What makes it hard */}
      <section className="border-b border-white/5">
        <div className="mx-auto max-w-3xl px-6 py-14">
          <h2 className="text-3xl md:text-4xl font-extrabold leading-tight mb-3 text-center">
            What makes this hard to replicate
          </h2>
          <p className="text-slate-400 text-center mb-10 leading-relaxed">
            Not the code. The code is buildable. Here&apos;s the actual moat.
          </p>

          <div className="space-y-4">
            <Moat
              title="The traps in the table above"
              body="Every component has a 'trap' — a gotcha we hit and fixed. You'll hit them too. We hit them on someone else's clock."
            />
            <Moat
              title="The 6 audience-specific scripts and funnels"
              body="Generic copy converts at 1%. Audience-tuned copy converts at 6-12%. The work to find what each audience responds to is months of iteration — and we've already done it for verticals that match yours."
            />
            <Moat
              title="The voice-match training for the AI responder"
              body="A generic GPT reply gets unsubscribed. A voice-matched reply gets a meeting booked. Training data is 50+ examples of you, plus the prompt engineering to keep it on-brand."
            />
            <Moat
              title="The conversion-event wiring across ads + site + email"
              body="Server-side event tracking, deduped, cookie-resilient. Most agencies fake this with last-click. We don't."
            />
            <Moat
              title="The integration debt"
              body="Vercel + Supabase + SendGrid + Twilio + Google Ads + Meta + Stripe + Claude. Every API has its own quirks. Every quirk we already know."
            />
            <Moat
              title="The discipline to not add features that don't move the metric"
              body="Most replicas keep adding tabs and dashboards no owner uses. Knowing what to leave out is the part Claude can't do for you yet."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-b border-white/5">
        <div className="mx-auto max-w-2xl px-6 py-14 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Or just buy the system
          </h2>
          <p className="text-slate-400 mb-8 leading-relaxed">
            $10,000 ($300 off pay-in-full · 3-pay also available) · live in 30 days · you own every piece ·
            cancel monthly support and the system keeps running.
          </p>
          <Link
            href="/audit"
            className="inline-flex items-center justify-center rounded-md bg-violet-500 hover:bg-violet-400 text-white px-8 py-4 text-base font-bold shadow-lg transition-colors"
          >
            Get a free audit →
          </Link>
        </div>
      </section>

      <footer className="pb-16">
        <div className="mx-auto max-w-4xl px-6 py-8 text-center text-xs text-slate-500">
          BlueJays · Built by Ben in upstate NY ·{" "}
          <a
            href="mailto:ben@bluejayportfolio.com"
            className="text-sky-400 hover:underline"
          >
            ben@bluejayportfolio.com
          </a>
        </div>
      </footer>
    </main>
  );
}

function ComponentCard({ item }: { item: Component }) {
  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/40 p-5 hover:border-violet-500/30 transition-colors">
      <div className="flex items-start justify-between gap-4 mb-2">
        <h3 className="font-bold text-white text-lg leading-tight">
          {item.title}
        </h3>
        <div className="flex gap-2 shrink-0">
          <span className="text-xs font-bold rounded-md bg-violet-500/15 text-violet-200 px-2 py-1">
            {item.hours} hrs
          </span>
          {item.monthly !== undefined && item.monthly > 0 && (
            <span className="text-xs font-bold rounded-md bg-emerald-500/15 text-emerald-200 px-2 py-1">
              ${item.monthly}/mo
            </span>
          )}
        </div>
      </div>
      <p className="text-sm text-slate-400 leading-relaxed mb-3">
        {item.detail}
      </p>
      {item.trap && (
        <div className="border-l-2 border-amber-500/40 pl-3 mt-3">
          <p className="text-xs uppercase tracking-widest text-amber-400 font-semibold mb-1">
            Trap
          </p>
          <p className="text-xs text-amber-100/80 leading-relaxed">
            {item.trap}
          </p>
        </div>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        accent
          ? "border-violet-500/40 bg-violet-500/10"
          : "border-white/10 bg-slate-900/40"
      }`}
    >
      <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1">
        {label}
      </p>
      <p
        className={`text-2xl font-extrabold tabular-nums ${
          accent ? "text-violet-200" : "text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function BigStat({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-6 ${
        accent
          ? "border-violet-500/40 bg-violet-500/10"
          : "border-white/10 bg-slate-900/50"
      }`}
    >
      <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-2">
        {label}
      </p>
      <p
        className={`text-3xl md:text-4xl font-extrabold tabular-nums mb-1 ${
          accent ? "text-violet-200" : "text-white"
        }`}
      >
        {value}
      </p>
      <p className="text-xs text-slate-500">{sub}</p>
    </div>
  );
}

function Moat({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/40 p-5">
      <p className="font-bold text-white text-base mb-1.5">{title}</p>
      <p className="text-sm text-slate-400 leading-relaxed">{body}</p>
    </div>
  );
}
