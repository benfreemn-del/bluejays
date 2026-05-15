import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";
import TrustBar from "@/components/TrustBar";
import { INCLUDED_UNIVERSAL, INCLUDED_AUTHOR } from "@/lib/agency-included";

const BASE_URL = "https://bluejayportfolio.com";

export const metadata: Metadata = {
  title: "AI Marketing System for Indie Authors | BlueJays",
  description:
    "For self-published fiction series authors. We build the interactive book-world showcase + Amazon-direct funnel + series-aware newsletter that turns one book-#1 reader into a 5-10× lifetime customer across your full series. From the team behind the Bloodlines fantasy saga's bespoke author showcase.",
  alternates: { canonical: `${BASE_URL}/authors` },
  openGraph: {
    type: "website",
    siteName: "BlueJays",
    title: "AI Marketing System for Indie Authors",
    description:
      "Your book is selling on Amazon. Your author site is selling it short. Built for fiction series creators who want to own the reader relationship across multiple books.",
    url: `${BASE_URL}/authors`,
    images: [{ url: `${BASE_URL}/og-image.png`, width: 1200, height: 630 }],
  },
};

const FAQS = [
  {
    q: "I just have one book out. Is it too early for this?",
    a: "Honest answer: probably yes, unless book #2 is already drafted. The math on this $10k system works when you have a SERIES — one book-#1 reader who follows you through 3-5 books is what justifies the build. If you've only got book #1 and the series isn't real yet, start with our $997 author website tier instead and circle back when book #2 is in beta. We'll tell you straight up on the call.",
  },
  {
    q: "How does the system know who finished book #1 vs who just landed on my site?",
    a: "The newsletter capture is series-aware — different sequences fire for different audiences. A first-time visitor gets the world-introduction sequence. A reader who clicked a Goodreads or Amazon retargeting pixel after finishing book #1 gets the book-#2 pitch immediately. A pre-order signup gets the launch-countdown sequence. Same email list, four different journeys.",
  },
  {
    q: "What's the interactive book-world piece, really?",
    a: "Animated world map (zoom + pan to character locations), character roster (cards with arcs, relationships, allegiances), magic-system explorer (interactive diagram of how your world's magic works), parchment-style chapter reader (free sample chapter with on-page reader signup), faction quiz (where do you fit in the world). Each one becomes a newsletter capture point — readers play with the tool, drop their email to save progress or get results. The Bloodlines build has all 5; you'd pick the ones that fit your world.",
  },
  {
    q: "Will Amazon still get my sales? I don't want to break my KDP reports.",
    a: "Amazon stays the primary checkout. The CTAs route directly to your Amazon (and Apple Books, Kobo, IngramSpark if you sell on those). Every page on YOUR site captures the email + retargeting pixel BEFORE the click goes to Amazon. So Amazon still gets the sale, KDP reports stay clean — and you finally have an owned audience to retarget when book #2 drops.",
  },
  {
    q: "I'm not a fantasy author. Does this work for romance/thriller/sci-fi/litfic?",
    a: "Yes — the system is genre-agnostic in mechanic but genre-specific in delivery. The interactive features adapt: a romance series might do a couples-quiz + tropes explorer + character relationship map. A thriller series might do a case-file dossier + clue tracker + character-suspect roster. A sci-fi series might do a worldbuilding wiki + tech-glossary + faction matrix. Same engine, your genre's flavor.",
  },
  {
    q: "What's the pricing breakdown?",
    a: "Three ways to pay: (1) $9,700 up front and save $300. (2) $3,500 to start, $3,500 at day 30, $3,000 at day 60 — $10,000 total. (3) $2,500 today and $2,500 every 90 days, four times — $10,000 total, then it stops on its own. Same $10k whether you take 1 path or another — pick whichever fits your cash flow. After the build, ongoing runs at $500-1,000/mo (Twilio + SendGrid + Claude + your ad spend — those bills go to the vendors, not to us).",
  },
];

export default function AuthorsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-[#0a0617] to-slate-950 text-slate-100">
      <TrustBar />

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="relative px-6 pt-16 pb-12 md:pt-24 md:pb-20 max-w-5xl mx-auto text-center">
        <div className="inline-block bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-6">
          For indie fiction authors
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold leading-[1.05] mb-6 tracking-tight">
          Your book is selling.
          <br />
          <span className="bg-gradient-to-r from-violet-300 via-fuchsia-300 to-amber-200 bg-clip-text text-transparent">
            Your author site is selling it short.
          </span>
        </h1>
        <p className="text-lg md:text-2xl text-slate-300 leading-relaxed max-w-3xl mx-auto mb-8">
          90% of your Amazon readers have no idea you exist as an author —
          they just bought a book. We build the interactive book-world
          showcase, series-aware newsletter, and pre-order funnel that turns
          one book-#1 reader into a 5-10× lifetime customer across your
          entire series.
        </p>

        <div className="grid sm:grid-cols-3 gap-3 max-w-3xl mx-auto mb-10 text-left">
          <div className="rounded-xl border border-violet-500/20 bg-violet-500/[0.04] p-4">
            <p className="text-violet-300 text-xs font-bold uppercase tracking-wider mb-1.5">Anchor: Bloodlines</p>
            <p className="text-sm text-slate-300">Preston James Hunsaker&apos;s fantasy saga. Bespoke showcase with 5 interactive features — world map, character roster, magic-system explorer, parchment reader, faction quiz.</p>
          </div>
          <div className="rounded-xl border border-violet-500/20 bg-violet-500/[0.04] p-4">
            <p className="text-violet-300 text-xs font-bold uppercase tracking-wider mb-1.5">Built for series</p>
            <p className="text-sm text-slate-300">Book #1 reader → book #2 pre-order → book #3 launch retargeting. The math only works when you have a series, not a single title.</p>
          </div>
          <div className="rounded-xl border border-violet-500/20 bg-violet-500/[0.04] p-4">
            <p className="text-violet-300 text-xs font-bold uppercase tracking-wider mb-1.5">Your slot</p>
            <p className="text-sm text-slate-300">10 builds per month, max — across both verticals. Start with a free 60-second audit. We&apos;ll tell you if your series is ready.</p>
          </div>
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
      </section>

      {/* ── WHAT'S INCLUDED — Universal + Author only ────────────────────────── */}
      <section className="px-6 py-16 max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-3">
          Everything in your system
        </h2>
        <p className="text-slate-400 text-center text-lg mb-10">
          The Universal stack + the Indie-author bonus modules.
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

        {/* Author bonus stack */}
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
          The Manufacturer bonus stack (Tekky/ITC pattern — DTC storefront,
          dealer locator, smart postcards) is for product manufacturers and
          isn&apos;t shown here. See <Link href="/agency" className="underline underline-offset-2 hover:text-slate-300">/agency</Link> for the full three-vertical view.
        </p>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────────── */}
      <section className="px-6 py-16 max-w-3xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-3">
          Indie author FAQ
        </h2>
        <p className="text-slate-400 text-center text-lg mb-10">
          The 6 questions every author asks on the first call.
        </p>
        <div className="space-y-4">
          {FAQS.map((faq, i) => (
            <details
              key={i}
              className="group rounded-xl border border-white/10 bg-white/[0.03] open:bg-white/[0.05] open:border-violet-500/30 transition-all"
            >
              <summary className="cursor-pointer p-5 font-semibold text-white hover:text-violet-300 transition-colors">
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
          Find out if your series is ready.
        </h2>
        <p className="text-slate-300 text-lg mb-8 max-w-2xl mx-auto">
          Free 60-second audit. We&apos;ll score your current author site
          and tell you straight up whether the series-LTV math works for
          where you are with the series — or if you should start with our
          $997 author website tier first and graduate to the $10k system
          when book #2 lands.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/audit"
            className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-bold px-8 py-4 rounded-xl text-lg transition-all hover:scale-[1.02] shadow-[0_0_30px_rgba(139,92,246,0.4)]"
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
          10 builds per month, max — across both verticals. When it&apos;s full, the next slot rolls.
        </p>
      </section>

      <Footer />
    </main>
  );
}
