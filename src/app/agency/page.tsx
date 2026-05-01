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
  { icon: "✉️", title: "Email Sequences", detail: "Subject lines tested, winners kept, losers replaced" },
  { icon: "📱", title: "SMS Follow-Ups", detail: "Automated texts that improve based on reply data" },
  { icon: "📞", title: "Voicemail Drops", detail: "Ringless voicemail to every warm lead — hands-free" },
  { icon: "🔍", title: "Long-Term SEO", detail: "Content + authority that compounds while the ads learn" },
  { icon: "🎁", title: "Custom Lead Magnet", detail: "Industry-specific hook that feeds the top of the funnel" },
  { icon: "🖼️", title: "Logo Revision", detail: "Brand polish so your system looks as good as it runs" },
  { icon: "📊", title: "Monthly Reports", detail: "Real numbers showing exactly how the loop is tightening" },
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
          Your funnel gets smarter{" "}
          <span className="text-violet-400">every single week.</span>
          <br className="hidden md:block" /> Automatically.
        </h1>
        <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-4 leading-relaxed">
          Not a campaign. Not a template. A self-improving loop — every ad click, email open, and form fill feeds data back in and tightens the funnel without anyone touching it.
        </p>
        <p className="text-lg text-slate-400 max-w-xl mx-auto mb-10">
          BlueJays builds the system, connects all the pieces, and hands it to you. Google Ads, Meta Ads, email, SMS, voicemail, SEO — all sharing data, all learning from your real customers. <strong className="text-white">One setup. You own it. The AI manages the rest.</strong>
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/audit"
            className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold px-8 py-4 rounded-xl text-lg transition-all hover:scale-[1.02] shadow-[0_0_30px_rgba(14,165,233,0.3)]"
          >
            Get my free site audit →
          </Link>
          <Link
            href="/agency/apply"
            className="border border-violet-500/50 bg-violet-500/10 hover:bg-violet-500/20 text-violet-200 font-semibold px-8 py-4 rounded-xl text-lg transition-all"
          >
            Apply for the system
          </Link>
        </div>
        <p className="text-xs text-slate-500 mt-4">Free audit · 8-question fit check · Ben answers personally</p>
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
            Get a free audit of your current website and marketing. No pitch, no obligation. Ben shows you exactly what the self-learning system would look like for your specific business — and what it would cost you to keep doing things the old way.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/audit"
              className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold px-8 py-4 rounded-xl text-lg transition-all hover:scale-[1.02] shadow-[0_0_30px_rgba(14,165,233,0.3)]"
            >
              Get my free audit →
            </Link>
            <Link
              href="/agency/apply"
              className="border border-violet-500/50 bg-violet-500/10 hover:bg-violet-500/20 text-violet-200 font-semibold px-8 py-4 rounded-xl text-lg transition-all"
            >
              Apply for the system
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
