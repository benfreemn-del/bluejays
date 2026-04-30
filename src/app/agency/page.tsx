import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";

const BASE_URL = "https://bluejayportfolio.com";

export const metadata: Metadata = {
  title: "Replace Your Marketing Agency | BlueJays Full System",
  description:
    "Paying $3,000–$8,000/month to a marketing agency? Get a custom AI marketing system built once, own it forever, pay a fraction monthly. Cut the agency.",
  alternates: { canonical: `${BASE_URL}/agency` },
  openGraph: {
    type: "website",
    siteName: "BlueJays",
    title: "Still Paying an Agency? Read This First.",
    description:
      "Agencies charge $3–8K/month forever using cookie-cutter playbooks. BlueJays builds a custom AI system tailored to YOUR business. One setup. You own it.",
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
  { icon: "🌐", title: "Custom Website", detail: "Built for your brand, not a template" },
  { icon: "📈", title: "Google Ads — Self-Learning", detail: "AI optimizes bids and copy automatically" },
  { icon: "🎯", title: "Meta Ads — Self-Learning", detail: "Facebook + Instagram, targeted to your buyers" },
  { icon: "✉️", title: "Email Sequences", detail: "Automated nurture from first click to close" },
  { icon: "📱", title: "Text Campaigns", detail: "SMS follow-ups that feel personal, not spammy" },
  { icon: "📞", title: "Voicemail Drops", detail: "Ringless voicemail to warm leads automatically" },
  { icon: "🔍", title: "Long-Term SEO", detail: "Content + authority that compounds over years" },
  { icon: "🎁", title: "Custom Lead Magnet", detail: "Something valuable specific to your industry" },
  { icon: "🖼️", title: "Logo Revision", detail: "Polish your brand if it needs it" },
  { icon: "📊", title: "Monthly Reports", detail: "Real numbers, plain English, every month" },
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
    q: "What's the $10,000 broken into?",
    a: "$3,500 to start, $3,500 at 30 days, $3,000 at 60 days. Nothing is due until you've seen real progress.",
  },
  {
    q: "Can I keep my existing website?",
    a: "We rebuild it as part of the system. Your site needs to be connected to the ad tracking, email capture, and CRM — that requires a clean build. The new site is included in the $10K.",
  },
  {
    q: "Do you manage the ad accounts or just set them up?",
    a: "Both. Ben sets them up, owns the structure, and manages them monthly. You have full transparency — login access, real reporting, no black-box dashboards.",
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
      <section className="px-6 pt-20 pb-16 text-center max-w-4xl mx-auto">
        <div className="inline-block bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-6">
          For business owners paying agencies
        </div>
        <h1 className="text-4xl md:text-6xl font-black leading-tight mb-6">
          Still paying{" "}
          <span className="text-rose-400">$4,000/month</span>
          <br className="hidden md:block" /> to a marketing agency?
        </h1>
        <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-4 leading-relaxed">
          That&apos;s $48,000 a year. For campaigns built from the same template they use for every other client on their roster.
        </p>
        <p className="text-lg text-slate-400 max-w-xl mx-auto mb-10">
          BlueJays builds you a <strong className="text-white">custom AI marketing system</strong> — Google Ads, Meta Ads, email, text, voicemail, SEO — connected to a website built for your business specifically. One setup fee. You own it. Ben manages it monthly for a fraction of what you&apos;re paying now.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/audit"
            className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold px-8 py-4 rounded-xl text-lg transition-all hover:scale-[1.02] shadow-[0_0_30px_rgba(14,165,233,0.3)]"
          >
            Get my free site audit →
          </Link>
          <Link
            href="/schedule/fullsystem"
            className="border border-violet-500/50 bg-violet-500/10 hover:bg-violet-500/20 text-violet-200 font-semibold px-8 py-4 rounded-xl text-lg transition-all"
          >
            Book a discovery call
          </Link>
        </div>
        <p className="text-xs text-slate-500 mt-4">Free call · No obligation · Ben answers personally</p>
      </section>

      {/* ── THE MATH ─────────────────────────────────────────────────────────── */}
      <section className="px-6 py-16 max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            The math agencies don&apos;t want you to do
          </h2>
          <p className="text-slate-400 text-lg">What you&apos;re spending vs. what you could be spending.</p>
        </div>
        <div className="rounded-2xl border border-white/10 overflow-hidden">
          <table className="w-full">
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
          <div className="rounded-2xl border border-white/10 overflow-hidden">
            <div className="grid grid-cols-3 bg-white/5 text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-white/10">
              <div className="py-3 px-4">What you get</div>
              <div className="py-3 px-4 text-rose-400">Typical agency</div>
              <div className="py-3 px-4 text-emerald-400">BlueJays</div>
            </div>
            {AGENCY_ITEMS.map((row, i) => (
              <div
                key={i}
                className="grid grid-cols-3 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors"
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
          One connected machine — not 6 disconnected tools from 6 different vendors.
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
            Cutting-edge AI — built custom for your business
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            This isn&apos;t a template.<br />
            <span className="text-violet-300">It&apos;s a system that learns.</span>
          </h2>
          <p className="text-slate-300 text-lg leading-relaxed mb-6">
            The Hyperloop — BlueJays&apos; self-improving AI funnel — connects your ads to your website to your email to your texts to your voicemails. Every channel feeds data back into the system. Winners get amplified automatically. Losers get cut. No account manager needed.
          </p>
          <p className="text-slate-400 leading-relaxed mb-10">
            Agencies build a campaign and pray. BlueJays builds a machine that gets smarter every month. When a Google Ad headline starts converting at 8% instead of 3%, the system detects it and shifts budget there automatically. When an email subject line underperforms, it gets replaced. The system is always testing, always optimizing — without you touching anything.
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
            Stop renting. Start owning.
          </h2>
          <p className="text-slate-400 text-lg mb-8">
            Get a free audit of your current website and marketing. No pitch, no obligation. Ben tells you exactly what&apos;s costing you customers and what the full system would look like for your specific business.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/audit"
              className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold px-8 py-4 rounded-xl text-lg transition-all hover:scale-[1.02] shadow-[0_0_30px_rgba(14,165,233,0.3)]"
            >
              Get my free audit →
            </Link>
            <Link
              href="/schedule/fullsystem"
              className="border border-violet-500/50 bg-violet-500/10 hover:bg-violet-500/20 text-violet-200 font-semibold px-8 py-4 rounded-xl text-lg transition-all"
            >
              Book a discovery call
            </Link>
          </div>
          <p className="text-xs text-slate-500 mt-4">
            Free call · Takes 30 minutes · Ben handles this personally — no sales team
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}
