import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";

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

const AGENCY_ITEMS = [
  { agency: "$3,000–$8,000 / month", blueJays: "$500–$1,000 / month (after setup)" },
  { agency: "Same playbook for every client", blueJays: "Custom AI built for your business" },
  { agency: "Junior reps rotate every 6 months", blueJays: "Ben — direct, no middlemen" },
  { agency: "You own nothing — cancel and it's gone", blueJays: "You own the system, always" },
  { agency: "12-month contracts, hard to exit", blueJays: "Month-to-month, cancel any time" },
  { agency: "\"Results next month\" — indefinitely", blueJays: "Live in 30 days, tracked monthly" },
  { agency: "Slow creative revisions (weeks)", blueJays: "AI generates + iterates in hours" },
  { agency: "Siloed: ads don't talk to email/text", blueJays: "Single funnel: ads → site → email → text → voicemail" },
];

const INCLUDED = [
  { icon: "🌐", title: "Custom Website", detail: "Conversion-tracked — every click feeds the loop" },
  { icon: "📈", title: "Google Ads — Self-Learning", detail: "Headlines that win get more budget automatically" },
  { icon: "🎯", title: "Meta Ads — Self-Learning", detail: "Audiences that don't convert get cut without touching it" },
  { icon: "🧭", title: "Audience-Segmented Funnels", detail: "Up to 6 separate funnel tracks per customer type — never a generic blast" },
  { icon: "✉️", title: "AI Inbound Responder", detail: "Auto-classifies every reply into 6 intent classes; drafts in your voice for one-tap send" },
  { icon: "📅", title: "Scheduled Campaigns", detail: "Pick a date — system queues + ships at the minute, no babysitting" },
  { icon: "📱", title: "SMS Follow-Ups", detail: "Automated texts that improve based on reply data" },
  { icon: "☎️", title: "Missed-Call Text-Back", detail: "Caller hangs up → auto-text in under 60 seconds. Captures the voicemail you'd lose." },
  { icon: "📞", title: "Voicemail Drops", detail: "Ringless voicemail to every warm lead — hands-free" },
  { icon: "🎁", title: "Interactive Lead Magnet", detail: "Industry-specific configurator quiz that builds personalized recommendations + auto-routes leads to the right funnel" },
  { icon: "🗺️", title: "County-Level Lead Scout", detail: "Click any US county on a map → audience-scoped Google Places scrape pulls fresh leads to your inbox" },
  { icon: "📊", title: "Owner Portal", detail: "Live cockpit: Leads · To-Do · Budget · Campaigns · Funnels · Map · Insights · Account. One login, everything in view." },
  { icon: "🔬", title: "Hyperloop A/B Engine", detail: "Wilson-CI statistical testing on every email subject + ad creative. Winners auto-promoted." },
  { icon: "🔍", title: "Long-Term SEO", detail: "Content + authority that compounds while the ads learn" },
  { icon: "🖼️", title: "Logo Revision", detail: "Brand polish so your system looks as good as it runs" },
  { icon: "📈", title: "Live Open/Click Tracking", detail: "SendGrid + pixel tracking flows back into your dashboard in real time" },
  { icon: "🔥", title: "Microsoft Clarity Heatmaps", detail: "Session recordings + click/scroll heatmaps wired into your site so we see exactly where users drop off — and tighten the loop with proof" },
  { icon: "📊", title: "Weekly + Monthly Reports", detail: "Auto-generated digests in your inbox. Real numbers showing the loop tightening." },
];

const FAQS = [
  {
    q: "How is this different from an agency?",
    a: "Agencies rent you their team. When you stop paying, everything disappears. BlueJays builds you a system you own — the AI, the ads structure, the sequences, the website. It's yours. Cancel the monthly support and the system keeps running.",
  },
  {
    q: "What's the $500–$1,000/month for?",
    a: "Ad spend management, ongoing SEO, content updates, system tuning, and Ben's direct availability. The exact amount depends on your ad budget and how active you want the ongoing work to be.",
  },
  {
    q: "How does the self-learning AI work?",
    a: "The ad campaigns feed performance data back into the system automatically. Headlines that convert get used more. Audiences that don't convert get cut. Over time, the system gets smarter about your specific buyers without you touching anything.",
  },
  {
    q: "What's the pricing breakdown?",
    a: "Pay $9,700 in full (save $300), or split into three milestones: $3,500 to start, $3,500 at 30 days, $3,000 at 60 days ($10,000 total either way). Nothing is due until you've seen real progress.",
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
    a: "Most agencies blast the same email to every lead. We map your customer mix into segments (e.g. for a tractor-accessory shop: Dealer / TYM owner / Forester / Hunter / Sub-compact owner) and run a separate funnel for each. The Dealer gets ROI math; the Hunter gets gun-mount install tips; the Forester gets chainsaw-rig content. Same lead-magnet site, six conversion paths.",
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
        <div className="inline-block bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-6">
          The self-learning AI marketing system
        </div>
        <h1 className="text-4xl md:text-6xl font-black leading-tight mb-6">
          100 qualified leads in 90 days.{" "}
          <span className="text-violet-400">Or we work free until you hit it.</span>
        </h1>
        <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-4 leading-relaxed">
          One self-improving funnel — Google Ads, Meta Ads, email, SMS, voicemail,
          SEO — all sharing data, all learning from your customers, all
          tightening every week without anyone touching it.
        </p>
        <p className="text-lg text-slate-400 max-w-xl mx-auto mb-10">
          We build it custom for your business in 30 days. You own every piece.
          <strong className="text-white"> If we don&apos;t deliver 100 qualified leads in 90 days, we keep working — at no extra cost — until you hit the number.</strong>
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
            Get a free audit first
          </Link>
        </div>
        <p className="text-xs text-slate-500 mt-4">
          8-question fit check · Ben answers personally · Most apps reviewed within 24h
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

      {/* ── WHAT'S INCLUDED ───────────────────────────────────────────────────── */}
      <section className="px-6 py-16 max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-3">
          Everything in the Full System
        </h2>
        <p className="text-slate-400 text-center text-lg mb-10">
          One connected loop — every piece feeds data back to every other piece.
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          {INCLUDED.map((item) => (
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
      </section>

      {/* ── THE TECH ─────────────────────────────────────────────────────────── */}
      <section className="px-6 py-16 bg-gradient-to-b from-slate-900/50 to-transparent">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-block bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-6">
            The competitive advantage agencies can&apos;t match
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Agencies manage campaigns.<br />
            <span className="text-violet-300">This system manages itself.</span>
          </h2>
          <p className="text-slate-300 text-lg leading-relaxed mb-6">
            Every component — ads, website, email, SMS, voicemail — feeds performance data back into a single loop. Headlines that convert get amplified. Audiences that don&apos;t convert get cut. Email subject lines that underperform get replaced. No human makes these calls. The AI does, continuously, in the background.
          </p>
          <p className="text-slate-400 leading-relaxed mb-10">
            An agency team runs campaigns for 30+ clients simultaneously. They rotate junior reps every six months. They use the same playbook for your roofing company as they do for the dentist down the street. BlueJays builds one system, custom for your business, and the AI tightens it week after week. Month 3 is smarter than Month 1. Month 12 is smarter than Month 3. It compounds — the way real competitive advantages do.
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
