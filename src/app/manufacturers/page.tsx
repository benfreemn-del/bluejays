import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";
import TrustBar from "@/components/TrustBar";
import { INCLUDED_UNIVERSAL, INCLUDED_MFG } from "@/lib/agency-included";

const BASE_URL = "https://bluejayportfolio.com";

export const metadata: Metadata = {
  title: "AI Marketing System for Product Manufacturers | BlueJays",
  description:
    "For owner-operators who make a real product and sell through dealers, distributors, or Amazon. We build the DTC storefront + dealer locator + multi-audience funnels so your distributor stops making more than you do. From the team behind Tekky's $30k/yr funnel and ITC Quick Attach's dealer network.",
  alternates: { canonical: `${BASE_URL}/manufacturers` },
  openGraph: {
    type: "website",
    siteName: "BlueJays",
    title: "AI Marketing System for Product Manufacturers",
    description:
      "Stop watching your distributor make more on your product than you do. We build the DTC funnel manufacturers actually need.",
    url: `${BASE_URL}/manufacturers`,
    images: [{ url: `${BASE_URL}/og-image.png`, width: 1200, height: 630 }],
  },
};

const FAQS = [
  {
    q: "How does this protect my existing dealer network?",
    a: "Two surfaces, one product catalog. The DTC storefront captures the end-buyer who wants to order direct, while the dealer locator (built into the same catalog) routes territory-bound customers to your authorized dealers. Your dealers still get the regional installs, support contracts, and bulk orders they handle today — you just stop losing the customer who would have bought direct if they could find the page.",
  },
  {
    q: "I make a B2B product. Do I need the DTC piece at all?",
    a: "Yes, even if 90% of your volume goes through dealers. The DTC piece isn't about replacing dealers — it's about owning the customer relationship. A small-business owner who Googles your product brand at 11pm and lands on a dealer's website doesn't become YOUR customer. They become the dealer's customer. The DTC piece captures that customer's email at the very least, even if the sale ultimately flows through a dealer.",
  },
  {
    q: "We already sell on Amazon. How does this fit?",
    a: "Amazon is rented audience — you don't own those buyers, can't email them, can't retarget them. The system runs alongside Amazon: keeps your Amazon listings live, drives traffic to BOTH the Amazon listing AND your DTC storefront, captures email + retargeting on every visit. You build an audience you OWN while Amazon stays the easy-checkout option for repeat buyers.",
  },
  {
    q: "What does the dealer partner program look like in practice?",
    a: "A signup page where dealers/reps register, plus a script library with the right pitch for each customer type (BUYER, PRO, SHOP). Each dealer gets their own portal — they see only THEIR leads, their commission, their territory. Built-in commission tracking can flat-fee (e.g. $50 per close) or split (e.g. $50 retail / $250 dealer for a wholesale unit). Tekky and ITC both run this — the dealer portal is a real reason existing dealers stay loyal.",
  },
  {
    q: "How long until it's profitable?",
    a: "Live in 30 days. Most manufacturer clients see the math break even on direct DTC orders in months 2-4. The dealer-network amplification — where existing dealers start sending leads back UP to you because the partner program tracks attribution cleanly — typically kicks in around month 5-6 and compounds from there.",
  },
  {
    q: "What's the pricing breakdown?",
    a: "The $10k AI System is the main goal for manufacturers — three ways to pay: (1) $9,700 up front and save $300. (2) $3,500 to start, $3,500 at day 30, $3,000 at day 60 — $10,000 total. (3) $2,500 today and $2,500 every 90 days, four times — $10,000 total, then it stops on its own. Same $10k whether you take 1 path or another — pick whichever fits your cash flow. After the build, ongoing runs at $500-1,000/mo (Twilio + SendGrid + Claude + your ad spend — those bills go to the vendors, not to us).",
  },
  {
    q: "What if I'm not ready for $10k yet?",
    a: "The $997 custom website tier is open to you. Honest answer — if you don't have at least 8-10 dealers (or a clear path to 8-10 in the next 12 months), the AI System tier is probably too early; the dealer-locator + partner program math only compounds when there's enough dealer volume to attribute against. The $997 site gets you a premium custom build today while you focus on dealer recruitment, and we graduate you to the full $10k AI System when the math is right. Same Ben, same quality, same approval gate — just the right tier for where you are. Start at /audit either way.",
  },
];

export default function ManufacturersPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-[#0a0a1c] to-slate-950 text-slate-100">
      <TrustBar />

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="relative px-6 pt-16 pb-12 md:pt-24 md:pb-20 max-w-5xl mx-auto text-center">
        <div className="inline-block bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-6">
          For product manufacturers
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold leading-[1.05] mb-6 tracking-tight">
          Your distributor is making more
          <br />
          <span className="bg-gradient-to-r from-amber-300 via-orange-300 to-rose-300 bg-clip-text text-transparent">
            on your product than you are.
          </span>
        </h1>
        <p className="text-lg md:text-2xl text-slate-300 leading-relaxed max-w-3xl mx-auto mb-8">
          We build the DTC storefront, dealer locator, multi-audience funnels,
          and partner program that product manufacturers actually need. So
          your dealers still get their territory installs — but every customer
          who&apos;d rather buy direct can finally find you.
        </p>

        <div className="grid sm:grid-cols-3 gap-3 max-w-3xl mx-auto mb-10 text-left">
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.04] p-4">
            <p className="text-amber-300 text-xs font-bold uppercase tracking-wider mb-1.5">Anchor: Tekky</p>
            <p className="text-sm text-slate-300">Soccer training-gear brand. Full funnel: shop, build-your-player configurator, training-guide, camps, coach + club partner program.</p>
          </div>
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.04] p-4">
            <p className="text-amber-300 text-xs font-bold uppercase tracking-wider mb-1.5">Anchor: ITC Quick Attach</p>
            <p className="text-sm text-slate-300">Tractor-accessory manufacturer. DTC + dealer-locator on the same catalog. Stopped losing the end-buyer to dealer websites.</p>
          </div>
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.04] p-4">
            <p className="text-amber-300 text-xs font-bold uppercase tracking-wider mb-1.5">Your slot</p>
            <p className="text-sm text-slate-300">10 builds per month, max. Start with a free 60-second audit. We&apos;ll tell you straight up if your product fits the pattern.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/agency/apply"
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold px-8 py-4 rounded-xl text-lg transition-all hover:scale-[1.02] shadow-[0_0_30px_rgba(245,158,11,0.4)]"
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
      </section>

      {/* ── WHAT'S INCLUDED — Universal + Manufacturer only ──────────────────── */}
      <section className="px-6 py-16 max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-3">
          Everything in your system
        </h2>
        <p className="text-slate-400 text-center text-lg mb-10">
          The Universal stack + the Manufacturer bonus modules.
          Same $10k. No upcharge.
        </p>

        {/* Universal stack */}
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

        {/* Manufacturer bonus stack */}
        <div className="mb-4">
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

        <p className="text-center text-slate-500 text-xs mt-8 max-w-2xl mx-auto">
          The Author bonus stack (Bloodlines pattern — interactive book-world
          showcase, Amazon CTAs, series-aware newsletter) is for indie fiction
          authors and isn&apos;t shown here. See <Link href="/agency" className="underline underline-offset-2 hover:text-slate-300">/agency</Link> for the full
          three-vertical view.
        </p>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────────── */}
      <section className="px-6 py-16 max-w-3xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-3">
          Manufacturer FAQ
        </h2>
        <p className="text-slate-400 text-center text-lg mb-10">
          The 6 questions every manufacturer asks on the first call.
        </p>
        <div className="space-y-4">
          {FAQS.map((faq, i) => (
            <details
              key={i}
              className="group rounded-xl border border-white/10 bg-white/[0.03] open:bg-white/[0.05] open:border-amber-500/30 transition-all"
            >
              <summary className="cursor-pointer p-5 font-semibold text-white hover:text-amber-300 transition-colors">
                {faq.q}
              </summary>
              <p className="px-5 pb-5 text-slate-300 leading-relaxed">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────────── */}
      <section className="px-6 py-20 max-w-3xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Find out if your product fits the pattern.
        </h2>
        <p className="text-slate-300 text-lg mb-8 max-w-2xl mx-auto">
          Free 60-second audit. We&apos;ll score your current site and tell
          you straight up whether the distributor-bypass math works for your
          margin structure — or if you should hold off until you have more
          dealer momentum first.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/audit"
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold px-8 py-4 rounded-xl text-lg transition-all hover:scale-[1.02] shadow-[0_0_30px_rgba(245,158,11,0.4)]"
          >
            Start with the free audit →
          </Link>
          <Link
            href="/agency/apply"
            className="border border-white/15 bg-white/5 hover:bg-white/10 text-slate-200 font-semibold px-8 py-4 rounded-xl text-lg transition-all"
          >
            Apply for the system
          </Link>
        </div>
        <p className="text-xs text-slate-500 mt-6">
          10 manufacturer builds per month, max. When it&apos;s full, the next slot rolls.
        </p>
      </section>

      <Footer />
    </main>
  );
}
