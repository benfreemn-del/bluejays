import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";
import TrustBar from "@/components/TrustBar";
import {
  INCLUDED_UNIVERSAL,
  INCLUDED_MFG,
  INCLUDED_AUTHOR,
} from "@/lib/agency-included";

const BASE_URL = "https://bluejayportfolio.com";

export const metadata: Metadata = {
  title: "Self-Learning AI Marketing System | BlueJays Full System",
  description:
    "Not a campaign. A self-improving loop. Every ad click, email open, and form fill feeds data back in and tightens your funnel automatically. Built once. Runs forever.",
  alternates: { canonical: `${BASE_URL}/agency` },
  openGraph: {
    type: "website",
    siteName: "BlueJays",
    title: "Your funnel gets smarter every week. Automatically.",
    description:
      "BlueJays builds a self-learning AI marketing system custom for your business. Winners auto-scale. Losers auto-cut. No account manager. No check-ins. The machine does it.",
    url: `${BASE_URL}/agency`,
    images: [{ url: `${BASE_URL}/og-image.png`, width: 1200, height: 630 }],
  },
};

// Comparison table — Hormozi review #11 (2026-05-14). Trimmed from 8 rows
// to 6 for skim-readability. Dropped rows: "You own nothing" (overlapped
// with the contract-length row below it) and "Results next month" (overlapped
// with the cost/launch-speed framing of row 1). Kept the strongest 6
// dimensions: cost, commoditization, relationship, lock-in, speed, integration.
const AGENCY_ITEMS = [
  { agency: "$3,000–$8,000 / month", blueJays: "$500–$1,000 / month (after setup)" },
  { agency: "Same playbook for every client", blueJays: "Built for your business — no template" },
  { agency: "Junior reps rotate every 6 months", blueJays: "Ben — direct, no middlemen" },
  { agency: "12-month contracts, hard to exit", blueJays: "Month-to-month, cancel any time" },
  { agency: "Slow creative revisions (weeks)", blueJays: "AI generates + iterates in hours" },
  { agency: "Siloed: ads don't talk to email/text", blueJays: "Single funnel: ads → site → email → text → voicemail" },
];

// Process testimonials — Hormozi review #10 (2026-05-14). Real active
// builds, not stock quotes. Each card shows what's shipped + what's coming
// for a real client by name. Hormozi pattern: when outcome data (Day-90
// leads) isn't available yet, show the build cadence — proof the work is
// real and the system gets shipped, week by week.
const PROCESS_TESTIMONIALS: Array<{
  client: string;
  vertical: string;
  status: string;
  icon: string;
  accent: string;
  timeline: Array<{ when: string; what: string; done: boolean }>;
}> = [
  {
    client: "Bloodlines — Preston James Hunsaker",
    vertical: "Indie author · fantasy series",
    status: "Live — 1 week in",
    icon: "📖",
    accent: "violet",
    timeline: [
      { when: "Week 0 (May 7)", what: "Bespoke showcase shipped — world map, character roster, magic-system explorer, faction quiz, parchment reader", done: true },
      { when: "Week 1 (now)", what: "Amazon-driven CTAs live, reader-list capture running, content funnel pumping", done: true },
      { when: "Coming", what: "Book #2 beta-launch sequence + audience-segmented email cadence (early-reader / superfan / casual)", done: false },
    ],
  },
  {
    client: "Zenith Sports / TEKKY",
    vertical: "Manufacturer · soccer training",
    status: "Active build — Q1 in progress",
    icon: "⚽",
    accent: "amber",
    timeline: [
      { when: "Weeks 1–3", what: "Full site rebuild, brand-voice doc, 4-audience taxonomy (parent / coach / player / club)", done: true },
      { when: "Weeks 4–6", what: "AI auto-responder live, per-audience funnel sequences, configurator quiz scaffolding", done: false },
      { when: "Day 90 target", what: "100 qualified soccer-parent leads via Meta + Google Ads — covered by the 100-lead guarantee", done: false },
    ],
  },
  {
    client: "ITC Quick Attach — Jake",
    vertical: "Manufacturer · tractor accessories",
    status: "Just closed — build kicking off",
    icon: "🚜",
    accent: "sky",
    timeline: [
      { when: "Week 1", what: "Site rebuild + dealer-network audit + 6-audience taxonomy (dealer / hunter / forester / arborist / homeowner / fleet)", done: false },
      { when: "Weeks 4–6", what: "TYM/Kioti configurator quiz, Lob postcard sequences (dealer catalog, hunter pre-season card)", done: false },
      { when: "Day 90 target", what: "100 qualified dealer + end-buyer leads — covered by the 100-lead guarantee", done: false },
    ],
  },
];

// Deliverables stacks moved to `src/lib/agency-included.ts` 2026-05-14
// (Phase 2 of niche-down) so /manufacturers + /authors landers can
// import the same single source of truth without copy-paste. The three
// arrays (INCLUDED_UNIVERSAL, INCLUDED_MFG, INCLUDED_AUTHOR) are now
// imported at top of file. /agency renders all 3; /manufacturers
// renders Universal + Mfg; /authors renders Universal + Author.

const FAQS = [
  {
    q: "How is this different from an agency?",
    a: "Agencies rent you their team. When you stop paying, everything disappears. BlueJays builds you a system you own — the AI, the ads structure, the sequences, the website. It's yours. Cancel the monthly support and the system keeps running.",
  },
  {
    q: "What's the $500–$1,000/month for?",
    a: "Those are the bills that keep the system running — Twilio (texts + voicemails), SendGrid (email), Claude (the AI brain), and whatever you're spending on ads. Those bills go straight to the vendors, not to us. We are NOT a retainer agency. Versus an agency at $3-8K/mo, you're paying about a third for the same outcome — and you own the system.",
  },
  {
    q: "How does the AI get smarter every week?",
    a: "Your ads, emails, and texts feed their results back into the system. Headlines that win get more budget. Customers types that buy get more ads. Email subject lines that flop get replaced. No one pushes a button. It just keeps tuning itself.",
  },
  {
    q: "What's the pricing breakdown?",
    a: "Three ways to pay: (1) $9,700 up front and save $300. (2) $3,500 to start, $3,500 at day 30, $3,000 at day 60 — $10,000 total. (3) $2,500 today and $2,500 every 90 days, four times — $10,000 total, then it stops on its own. Pick whichever fits your cash flow.",
  },
  {
    q: "Can I keep my existing website?",
    a: "We rebuild it as part of the system. Your site needs to be connected to the ad tracking, email capture, and CRM — that requires a clean build. The new site is included in the $10K.",
  },
  {
    q: "Do you manage the ad accounts or just set them up?",
    a: "Both. Ben sets them up, owns the structure, and manages them monthly. You have full transparency — login access, real reporting, no black-box dashboards.",
  },
  {
    q: "What does the owner portal actually look like?",
    a: "One login at /clients/{your-business}/portal. Nine tabs: Overview (pipeline value + alerts), Leads (audience-tagged + click-to-expand timeline), To-Do, Budget, Campaigns (compose + schedule blasts), Funnels (your live audience-segmented sequences), Map (county-level lead scout for your industry), Insights (weekly auto-report), Account. Built for a phone or a laptop — your team logs in every morning, you see the whole business in 60 seconds.",
  },
  {
    q: "What's an 'audience-segmented funnel'?",
    a: "Most agencies blast the same email to every lead. We don't. Three kinds of people care about your product: the BUYER who uses it, the PRO who tells the buyer to get it (coach, dealer, contractor, vet), and the SHOP that resells it. Each one needs a different message. We build a separate path for each — and each path uses email, text, voicemail, and a real printed postcard. Example for a tractor-accessory shop: the Dealer gets margin math + a printed dealer catalog. The Hunter gets gun-mount install tips + a season-prep card. The Forester gets a chainsaw-rig setup card. Same lead-magnet site. Up to six paths. Four channels per path.",
  },
  {
    q: "Is the $10K system for service businesses?",
    a: "No — service businesses (electricians, dental, salons, HVAC, contractors) belong on the $997 custom website tier. Same Ben, same risk-free guarantee, just sized to the math. The $10K system needs a defined product, a retargetable audience, and a story the AI can compound over time — commodity services don't have the LTV mechanics to justify the spend. Start at /audit and we'll route you correctly.",
  },
  {
    q: "What if I'm a manufacturer without dealers yet?",
    a: "Start with the $997 site. The AI System compounds best with a working dealer network or distribution channel — typically 8+ dealers — so the math works on day one. The $997 site builds the credibility you need to recruit dealers; we graduate you to the $10K system when the network is alive. Same Ben, no re-onboarding.",
  },
  {
    q: "What if I'm an author with only book #1?",
    a: "Same logic as the manufacturer route. The AI System compounds book-to-book — newsletter subscribers from book #1 → pre-order surge for book #2 → backlist sales loop. With only one book out, the LTV ceiling is too low to justify the full spend. Start with a $997 bespoke showcase (Bloodlines pattern), build the reader list, graduate when book #2 hits beta.",
  },
  {
    q: "How do AI Postcards work?",
    a: "Inside the funnel, certain audiences get a physical postcard delivered around day 7-14. We use Lob's print-and-mail API: we feed in the lead's data (their TYM model, their hunting state, their kid's age) and an AI-generated postcard goes out — front artwork tuned to their context, back copy referencing their specific situation. Costs us about $1 per card. Multi-channel sequences that step out of the inbox respond 3-5× better than email-only — especially for B2B (a printed catalog at the dealer counter) and seasonal (a hunter's pre-season checklist landing the week of opening day).",
  },
  {
    q: "Can my sales team or referral partners use the system?",
    a: "Yes — the partner program is built in. You get a public recruitment landing page (your branding, your payout structure) plus an audience-branched script library: every customer type gets its own intro, qualifier, pitch, CTA, voicemail, and objection handlers. A rep picks the audience tag, the right script auto-loads, they dial. Built for flat-fee commission models ($50 retail / $250 dealer is the ITC default — yours can be whatever you set) and warm-referrer programs. Manual payout dashboard included; full Stripe Connect integration optional in v2.",
  },
  {
    q: "What's an interactive lead magnet?",
    a: "Instead of a passive PDF, your top-of-funnel page is a configurator quiz. The user picks options; a live preview updates as they answer (e.g. a tractor that adds accessories on the right as the user toggles them). At submission, the system builds a personalized recommendation, captures the lead, fires you an instant SMS, and auto-routes them into the right segment funnel. Conversion rates 3-5× a static lead magnet because the user co-builds the offer.",
  },
];

function SavingsRow({ label, agencyMonthly }: { label: string; agencyMonthly: number }) {
  const agencyYear1 = agencyMonthly * 12;
  const bjYear1 = 10000 + 9000; // $10K setup + avg $750/mo × 12
  const bjYear2 = 9000;
  const saved1 = agencyYear1 - bjYear1;
  const saved2 = agencyMonthly * 12 - bjYear2;
  return (
    <tr className="border-b border-white/5">
      <td className="py-3 px-4 text-slate-300 text-sm">{label}</td>
      <td className="py-3 px-4 text-rose-400 text-sm font-semibold">${agencyYear1.toLocaleString()}/yr</td>
      <td className="py-3 px-4 text-emerald-400 text-sm font-semibold">${bjYear1.toLocaleString()}/yr</td>
      <td className="py-3 px-4 text-sky-300 text-sm font-bold">
        Save ${saved1.toLocaleString()} yr 1<br />
        <span className="text-xs text-sky-400/70">Save ${saved2.toLocaleString()} yr 2+</span>
      </td>
    </tr>
  );
}

export default function AgencyPage() {
  return (
    <main className="bg-slate-950 text-white min-h-screen">
      {/* ── NAV ─────────────────────────────────────────────────────────────── */}
      <nav className="border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-white font-bold text-lg tracking-tight">
          Blue<span className="text-sky-400">Jays</span>
        </Link>
        <Link
          href="/audit"
          className="text-sm font-semibold bg-sky-500 hover:bg-sky-400 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Get free audit →
        </Link>
      </nav>

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="px-6 pt-12 pb-10 md:pt-20 md:pb-16 text-center max-w-4xl mx-auto">
        {/* Eyebrow rewritten 2026-05-06 for the ad-system-2026-05 Google
            Ads campaign — speaks to owners already running paid ads
            (huge audience vs the agency-firers we were targeting before).
            The maker / product-shop framing still fires lower on the
            page; this hero is the front door for the wider ad-runner
            buyer profile. */}
        <div className="inline-block bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-6">
          Already running ads? Make them work twice as hard.
        </div>
        <h1 className="text-4xl md:text-6xl font-black leading-tight mb-6">
          You&apos;re already paying for ads.{" "}
          <span className="text-violet-400">We build the system that doubles what they pull in.</span>
        </h1>
        <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-4 leading-relaxed">
          One custom system that runs your ads, website, emails, texts,
          voicemails, and SEO together — every week it figures out what
          works for your customers and does more of it. You don&apos;t
          tweak bids, swap creative, or babysit a dashboard.
        </p>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-4 leading-relaxed">
          We build a path for the buyer who wants the thing, the pro who
          tells them to buy it (the coach, the dealer, the contractor), and
          the shop that sells it for you. Three jobs. One system.
        </p>
        <p className="text-lg text-slate-400 max-w-xl mx-auto mb-8">
          We build it for you in 30 days. You own all of it.
          <strong className="text-white"> 100 real leads in 90 days, or we keep working free until you hit it.</strong>
        </p>

        {/* Live social-proof bar — pulls from /api/stats/public.
            Floor values keep the surface healthy on cold paid
            traffic; live numbers take over once volume exceeds
            the floor. */}
        <div className="max-w-2xl mx-auto mb-10">
          <TrustBar />
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/agency/apply"
            className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-bold px-8 py-4 rounded-xl text-lg transition-all hover:scale-[1.02] shadow-[0_0_30px_rgba(139,92,246,0.4)]"
          >
            Apply for the system →
          </Link>
          <Link
            href="/audit"
            className="border border-white/15 bg-white/5 hover:bg-white/10 text-slate-200 font-semibold px-8 py-4 rounded-xl text-lg transition-all"
          >
            Get a free audit first
          </Link>
        </div>
        <p className="text-xs text-slate-500 mt-4">
          Quick fit check · Ben answers in person · Most replies within a day
        </p>
        <p className="text-xs text-slate-500 mt-2">
          Only 10 of these built per month. When the month is full, the next slot rolls to next month.
        </p>
        <p className="text-sm text-slate-400 mt-6">
          Thinking &quot;I could build this myself with Claude&quot;?{" "}
          <Link
            href="/agency/replicate"
            className="text-violet-300 hover:text-violet-200 underline underline-offset-2 font-semibold"
          >
            See the full engineering teardown →
          </Link>
        </p>
      </section>

      {/* ── WHO THIS IS FOR ──────────────────────────────────────────────────── */}
      <section className="px-6 py-12 md:py-16 max-w-4xl mx-auto">
        <div className="rounded-2xl border border-violet-500/20 bg-violet-500/[0.04] p-6 md:p-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center">
            Who this works best for
          </h2>
          {/* SPCL paragraph — Hormozi review #14 (2026-05-14). Adds Status
              ("the brands you compete with") + Likeness ("a real thing made
              by a real owner") to a section that previously only carried
              qualification logic. Pairs the math-heavy bottom of the page
              with one emotional positioning beat. */}
          <p className="text-slate-200 text-center max-w-2xl mx-auto mb-5 text-lg leading-relaxed font-medium">
            If you make a <span className="text-violet-300">real thing</span> — a tractor accessory,
            a fantasy book series, a kid&apos;s apparel brand — you compete with
            companies running $10K-a-month agencies. This is how you outrun
            them without spending $120K a year.
          </p>
          <p className="text-slate-300 text-center max-w-2xl mx-auto mb-6 leading-relaxed">
            We built this for owners who make a real thing. A product. A
            service with proof. Something only you do. If your work has any
            of these, this fits:
          </p>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
              <p className="text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">A place</p>
              <p className="text-sm text-slate-300">You make it in your shop. Your town. Your country. Not &quot;drop-shipped from a warehouse.&quot;</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
              <p className="text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">A patent or a fit</p>
              <p className="text-sm text-slate-300">You hold a patent. A trademark. A part that fits one specific machine. Something nobody else can copy fast.</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
              <p className="text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">A pro who sends you buyers</p>
              <p className="text-sm text-slate-300">A coach, vet, dealer, contractor, mom-blogger — someone trusted who tells the buyer to come to you.</p>
            </div>
          </div>
          <p className="text-xs text-slate-500 text-center mt-6 max-w-xl mx-auto">
            Two of these three is plenty. All three and the system flies. None and your ad spend will burn fast — Ben will tell you on the call.
          </p>
        </div>
      </section>

      {/* ── THE MATH ─────────────────────────────────────────────────────────── */}
      <section className="px-6 py-16 max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            The math agencies don&apos;t want you to do
          </h2>
          <p className="text-slate-400 text-lg">What you&apos;re spending vs. what you could be spending.</p>
        </div>
        <div className="rounded-2xl border border-white/10 overflow-hidden overflow-x-auto">
          <table className="w-full min-w-[480px]">
            <thead>
              <tr className="bg-white/5 text-xs font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4 text-left">Agency tier</th>
                <th className="py-3 px-4 text-left text-rose-400">Agency cost (yr)</th>
                <th className="py-3 px-4 text-left text-emerald-400">BlueJays (yr)</th>
                <th className="py-3 px-4 text-left text-sky-300">You save</th>
              </tr>
            </thead>
            <tbody>
              <SavingsRow label="Small agency ($3K/mo)" agencyMonthly={3000} />
              <SavingsRow label="Mid agency ($5K/mo)" agencyMonthly={5000} />
              <SavingsRow label="Large agency ($8K/mo)" agencyMonthly={8000} />
            </tbody>
          </table>
        </div>
        <p className="text-center text-xs text-slate-500 mt-3">
          BlueJays: $10K setup + avg $750/mo ongoing. Year 2+ ongoing only.
        </p>
      </section>

      {/* ── COMPARISON TABLE ──────────────────────────────────────────────────── */}
      <section className="px-6 py-16 bg-gradient-to-b from-transparent to-slate-900/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-10">
            Agency vs. BlueJays Full System
          </h2>
          <div className="rounded-2xl border border-white/10 overflow-hidden overflow-x-auto">
            <div className="grid grid-cols-3 min-w-[480px] bg-white/5 text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-white/10">
              <div className="py-3 px-4">What you get</div>
              <div className="py-3 px-4 text-rose-400">Typical agency</div>
              <div className="py-3 px-4 text-emerald-400">BlueJays</div>
            </div>
            {AGENCY_ITEMS.map((row, i) => (
              <div
                key={i}
                className="grid grid-cols-3 min-w-[480px] border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors"
              >
                <div className="py-3.5 px-4 text-slate-400 text-sm flex items-start gap-2">
                  <span className="text-rose-500 mt-0.5 flex-shrink-0">✗</span>
                  {row.agency}
                </div>
                <div className="py-3.5 px-4 text-rose-300/60 text-sm line-through opacity-60">
                  {row.agency.split("–")[0]}…
                </div>
                <div className="py-3.5 px-4 text-emerald-300 text-sm flex items-start gap-2">
                  <span className="text-emerald-400 mt-0.5 flex-shrink-0">✓</span>
                  {row.blueJays}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROCESS TESTIMONIALS ─────────────────────────────────────────────── */}
      {/* Hormozi review #10 (2026-05-14). The page below this point is all
          logic — math, comparison, value stack, guarantee. This section adds
          the emotional proof: real client builds, real timelines, real
          status. Process testimonials (week-by-week build cadence) work
          BEFORE outcome data (Day-90 leads) is available — they prove the
          work gets shipped, not just promised. */}
      <section className="px-6 py-16 bg-gradient-to-b from-slate-900/30 to-transparent">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-block bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-4">
              Real builds · live this month
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-3">
              Here&apos;s what&apos;s shipping right now
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
              Three active builds. Real client names. Week-by-week milestones —
              what&apos;s done, what&apos;s coming. No stock testimonials.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {PROCESS_TESTIMONIALS.map((card) => {
              const accentRing =
                card.accent === "violet"
                  ? "border-violet-500/30 bg-violet-500/[0.04]"
                  : card.accent === "amber"
                  ? "border-amber-500/30 bg-amber-500/[0.04]"
                  : "border-sky-500/30 bg-sky-500/[0.04]";
              const accentText =
                card.accent === "violet"
                  ? "text-violet-300"
                  : card.accent === "amber"
                  ? "text-amber-300"
                  : "text-sky-300";
              return (
                <div
                  key={card.client}
                  className={`rounded-2xl border ${accentRing} p-5 md:p-6 flex flex-col`}
                >
                  <div className="flex items-start gap-3 mb-4">
                    <div className="text-3xl flex-shrink-0">{card.icon}</div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-white text-base leading-tight">
                        {card.client}
                      </h3>
                      <p className={`text-xs ${accentText} mt-0.5`}>{card.vertical}</p>
                    </div>
                  </div>
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${accentText} bg-white/[0.04] border border-white/10 self-start mb-4`}>
                    <span className="relative flex h-1.5 w-1.5">
                      <span className={`absolute inline-flex h-full w-full rounded-full ${
                        card.accent === "violet" ? "bg-violet-400" : card.accent === "amber" ? "bg-amber-400" : "bg-sky-400"
                      } opacity-75 animate-ping`} />
                      <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${
                        card.accent === "violet" ? "bg-violet-400" : card.accent === "amber" ? "bg-amber-400" : "bg-sky-400"
                      }`} />
                    </span>
                    {card.status}
                  </div>
                  <ul className="space-y-3 flex-1">
                    {card.timeline.map((step) => (
                      <li key={step.when} className="flex items-start gap-2.5">
                        <span
                          className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            step.done
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                              : "bg-white/[0.04] text-slate-500 border border-white/10"
                          }`}
                          aria-label={step.done ? "Done" : "Upcoming"}
                        >
                          {step.done ? "✓" : "○"}
                        </span>
                        <div className="min-w-0">
                          <p className={`text-[11px] font-bold uppercase tracking-wider ${step.done ? accentText : "text-slate-500"}`}>
                            {step.when}
                          </p>
                          <p className={`text-sm leading-snug mt-0.5 ${step.done ? "text-slate-200" : "text-slate-400"}`}>
                            {step.what}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
          <p className="text-center text-slate-500 text-xs mt-6 max-w-2xl mx-auto leading-relaxed">
            These are the three active builds right now. Day-90 outcome data
            posts here as it lands — no curated quotes, no cherry-picked screenshots.
          </p>
        </div>
      </section>

      {/* ── WHAT'S INCLUDED ───────────────────────────────────────────────────── */}
      <section className="px-6 py-16 max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-3">
          Everything in the Full System
        </h2>
        <p className="text-slate-400 text-center text-lg mb-10">
          One connected loop — every piece feeds data back to every other piece.
          Then your vertical adds its own bonus modules on top.
        </p>

        {/* Universal stack — every $10k client gets these 17 */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-5">
            <span className="inline-block bg-sky-500/15 text-sky-300 text-[11px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">
              Every system gets
            </span>
            <span className="text-slate-500 text-xs">Universal — 17 modules</span>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {INCLUDED_UNIVERSAL.map((item) => (
              <div
                key={item.title}
                className="flex gap-4 items-start bg-white/[0.04] border border-white/10 rounded-xl p-5 hover:border-white/20 transition-colors"
              >
                <div className="text-3xl flex-shrink-0">{item.icon}</div>
                <div>
                  <h3 className="font-bold text-white mb-0.5">{item.title}</h3>
                  <p className="text-sm text-slate-400">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Manufacturer vertical bonus stack */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-5">
            <span className="inline-block bg-amber-500/15 text-amber-300 text-[11px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">
              Product manufacturers also get
            </span>
            <span className="text-slate-500 text-xs">Tekky · ITC pattern — 4 modules</span>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {INCLUDED_MFG.map((item) => (
              <div
                key={item.title}
                className="flex gap-4 items-start bg-amber-500/[0.03] border border-amber-500/20 rounded-xl p-5 hover:border-amber-500/40 transition-colors"
              >
                <div className="text-3xl flex-shrink-0">{item.icon}</div>
                <div>
                  <h3 className="font-bold text-white mb-0.5">{item.title}</h3>
                  <p className="text-sm text-slate-400">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Indie author vertical bonus stack */}
        <div className="mb-4">
          <div className="flex items-center gap-3 mb-5">
            <span className="inline-block bg-violet-500/15 text-violet-300 text-[11px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">
              Indie authors also get
            </span>
            <span className="text-slate-500 text-xs">Bloodlines pattern — 5 modules</span>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {INCLUDED_AUTHOR.map((item) => (
              <div
                key={item.title}
                className="flex gap-4 items-start bg-violet-500/[0.03] border border-violet-500/20 rounded-xl p-5 hover:border-violet-500/40 transition-colors"
              >
                <div className="text-3xl flex-shrink-0">{item.icon}</div>
                <div>
                  <h3 className="font-bold text-white mb-0.5">{item.title}</h3>
                  <p className="text-sm text-slate-400">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-slate-500 text-xs mt-8 max-w-2xl mx-auto">
          Same $10k. Your vertical&apos;s bonus stack is included automatically
          based on what you sell — manufacturers get the dealer-network modules,
          authors get the series-funnel modules. No upcharge.
        </p>
      </section>

      {/* ── THE TECH ─────────────────────────────────────────────────────────── */}
      <section className="px-6 py-16 bg-gradient-to-b from-slate-900/50 to-transparent">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-block bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-6">
            What agencies can&apos;t match
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Agencies babysit your ads.<br />
            <span className="text-violet-300">This one runs itself.</span>
          </h2>
          <p className="text-slate-300 text-lg leading-relaxed mb-6">
            Your ads, website, emails, texts, and voicemails all share the same brain. When something works, the system does more of it. When something flops, the system drops it. No one has to push a button. It happens 24/7 in the background.
          </p>
          <p className="text-slate-400 leading-relaxed mb-10">
            An agency team runs ads for 30+ businesses at once. They use the same playbook on your roofing company that they use on the dentist down the street. BlueJays builds ONE system just for you. Month 3 is smarter than Month 1. Month 12 is smarter than Month 3. It keeps getting better — that&apos;s your real edge.
          </p>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { stat: "$10K", label: "One-time setup", sub: "vs. $36K–$96K first year at an agency" },
              { stat: "30 days", label: "Live and running", sub: "Agencies take 90+ days to launch anything" },
              { stat: "100%", label: "You own it", sub: "Cancel the monthly support — system keeps running" },
            ].map((s) => (
              <div key={s.stat} className="bg-white/[0.04] border border-white/10 rounded-xl p-5">
                <p className="text-3xl font-black text-violet-300 mb-1">{s.stat}</p>
                <p className="font-bold text-white text-sm mb-1">{s.label}</p>
                <p className="text-xs text-slate-500">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── VALUE STACK ──────────────────────────────────────────────────────── */}
      {/* Hormozi rule: anchor the buyer at perceived value > 2x the price BEFORE
          they see the price. Each line is what an agency or freelancer would
          quote for that single deliverable in isolation. The total is what
          you'd actually pay if you hired this stack à la carte. The price you
          actually pay reframes the same buyer from "is $9,700 a lot?" to
          "I'm getting $24K of value for $9,700." */}
      <section className="px-6 py-16 max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-block bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-4">
            What you actually get
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            Priced à la carte, this stack is{" "}
            <span className="text-violet-300">$24,000.</span>
          </h2>
          <p className="text-slate-400 text-lg">
            You pay $9,700 because we build them all in one connected loop —
            not as separate engagements that don&apos;t talk to each other.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
          {[
            { item: "Custom website (designed for your industry, mobile-first, conversion-built)", value: 4000 },
            { item: "Google Ads — full setup + first 90 days managed", value: 3500 },
            { item: "Meta Ads (Facebook + Instagram) — full setup + first 90 days managed", value: 3500 },
            { item: "Email automation — sequences, re-engagement, weekly newsletter setup", value: 2500 },
            { item: "SMS automation — replies, reminders, drip flows via Twilio", value: 1500 },
            { item: "Voicemail drops — broadcast voicemails to your prospect list", value: 1000 },
            { item: "SEO foundation — schema, sitemap, on-page, GBP optimization", value: 3000 },
            { item: "AI lead magnet — custom audit / quiz / calculator for your niche", value: 2000 },
            { item: "Logo + brand polish (if you need it)", value: 500 },
            { item: "AI auto-responder — handles inbound replies on email + SMS 24/7", value: 2500 },
          ].map((row, i) => (
            <div
              key={i}
              className="flex items-start justify-between gap-4 px-5 py-3.5 border-b border-white/5 last:border-0"
            >
              <div className="flex items-start gap-3 min-w-0">
                <span className="text-emerald-400 mt-0.5 flex-shrink-0">✓</span>
                <span className="text-slate-300 text-sm leading-relaxed">{row.item}</span>
              </div>
              <span className="text-slate-400 text-sm font-mono tabular-nums whitespace-nowrap">
                ${row.value.toLocaleString()}
              </span>
            </div>
          ))}
          <div className="flex items-center justify-between px-5 py-4 bg-white/[0.04] border-t border-white/10">
            <span className="text-sm uppercase tracking-wider text-slate-400 font-bold">
              À la carte total
            </span>
            <span className="text-2xl font-bold text-white tabular-nums line-through opacity-70">
              $24,000
            </span>
          </div>
          <div className="flex items-center justify-between px-5 py-5 bg-violet-500/10 border-t border-violet-500/30">
            <span className="text-sm uppercase tracking-wider text-violet-300 font-bold">
              You pay
            </span>
            <div className="text-right">
              <div className="text-3xl md:text-4xl font-black text-white tabular-nums">
                $9,700
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                or 3 × $3,500 split over 90 days
              </div>
            </div>
          </div>
        </div>
        <p className="text-center text-xs text-slate-500 mt-4">
          You own every piece forever. Year 2+ ongoing optimization is $497/mo, cancel anytime.
        </p>
      </section>

      {/* ── GUARANTEE ────────────────────────────────────────────────────────── */}
      {/* Hormozi rule: stronger risk reversal beats more features. The
          "100 leads or we work free" guarantee is the single biggest perceived-
          value lever on the page. Place it AFTER the value stack (so the buyer
          already feels the value > price), then the guarantee makes saying yes
          feel almost irrational to skip. */}
      <section className="px-6 py-16">
        <div className="max-w-3xl mx-auto">
          <div className="rounded-3xl border-2 border-emerald-500/40 bg-gradient-to-b from-emerald-500/[0.08] to-transparent p-8 md:p-12 text-center relative overflow-hidden">
            {/* Soft glow */}
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-emerald-500/10 blur-[100px] pointer-events-none" />
            <div className="relative">
              <div className="inline-block bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-6">
                The 100-lead guarantee
              </div>
              <h2 className="text-3xl md:text-5xl font-black leading-tight mb-6">
                100 qualified leads in 90 days.<br />
                <span className="text-emerald-300">Or we work free until you hit it.</span>
              </h2>
              <p className="text-slate-300 text-lg leading-relaxed mb-6 max-w-2xl mx-auto">
                If by Day 90 the system hasn&apos;t generated <strong className="text-white">100 qualified leads</strong> for your business, we don&apos;t walk away — we keep running ads, keep optimizing, keep emailing, keep texting, keep iterating. <strong className="text-white">At zero additional cost.</strong> Until you hit the number.
              </p>
              <p className="text-slate-400 text-base leading-relaxed max-w-2xl mx-auto mb-8">
                We can promise this because the system pays us back through the customer LTV you make from the leads. Hitting the number is in our interest, not just yours. Most agencies refuse to attach a number to their work. We bet $9,700 on ours.
              </p>
              <div className="grid sm:grid-cols-3 gap-4 mt-8 text-left">
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">What counts as qualified</div>
                  <p className="text-sm text-slate-300">A real human who fits your ICP and has either booked a call, replied, or converted on a form.</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">No fine print</div>
                  <p className="text-sm text-slate-300">Threshold + definition written into the service agreement before you pay a cent.</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">Why we can offer it</div>
                  <p className="text-sm text-slate-300">When the system works, you become a long-term retainer customer. We&apos;re aligned.</p>
                </div>
              </div>
              <Link
                href="/agency/apply"
                className="inline-flex items-center justify-center gap-2 mt-10 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-bold px-8 py-4 rounded-xl text-lg transition-all hover:scale-[1.02] shadow-[0_0_30px_rgba(16,185,129,0.4)]"
              >
                Apply for the system →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────────────── */}
      <section className="px-6 py-16 max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-10">Common questions</h2>
        <div className="space-y-4">
          {FAQS.map((faq) => (
            <div key={faq.q} className="border border-white/10 rounded-xl p-6">
              <h3 className="font-bold text-white mb-2">{faq.q}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── BOTTOM CTA ───────────────────────────────────────────────────────── */}
      <section className="px-6 py-20 text-center border-t border-white/5">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Build the loop once. Let it run.
          </h2>
          <p className="text-slate-400 text-lg mb-8">
            $9,700 one-time. 100 qualified leads in 90 days, guaranteed — or we
            work free until you hit it. 8-question fit check first; if
            we&apos;re not right for you, Ben will tell you on the spot.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/agency/apply"
              className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-bold px-8 py-4 rounded-xl text-lg transition-all hover:scale-[1.02] shadow-[0_0_30px_rgba(139,92,246,0.4)]"
            >
              Apply for the system →
            </Link>
            <Link
              href="/audit"
              className="border border-white/15 bg-white/5 hover:bg-white/10 text-slate-200 font-semibold px-8 py-4 rounded-xl text-lg transition-all"
            >
              Or get a free audit first
            </Link>
          </div>
          <p className="text-xs text-slate-500 mt-4">
            Quick form · 24-hour reply · If you qualify we send you Ben&apos;s calendar — no sales team
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}
