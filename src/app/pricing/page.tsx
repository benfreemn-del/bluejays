import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";

/**
 * /pricing — public 3-row pricing surface. Built 2026-05-16 per Ben's
 * directive to close the funnel gap (the landing_page_optimizer audit
 * flagged /pricing as missing — cold paid traffic clicking a "pricing"
 * ad CTA had no destination).
 *
 * Ladder mirrors the FAQ on /agency: Standard $997 (templated entry),
 * Custom Bespoke ($100/yr maintenance + custom build, per-client),
 * Full AI System $10k (high-ticket). Per the offer-ladder rule the
 * $500/mo management does NOT appear here — it's a post-purchase
 * cart-bump on the $10k checkout, not a public tier.
 *
 * Applied skill chunks:
 *   - frameworks_video_01 chunk 6 — value-equation per tier (each card
 *     carries dream outcome + risk reversal + time period + effort)
 *   - frameworks_video_01 chunk 14 — risk badges directly under each CTA
 *   - frameworks_video_02 chunk 19 — nav minimal (logo + audit fallback)
 *   - frameworks_video_03 chunk 17 — 3-part headline formula on each tier
 *   - frameworks_video_03 chunk 21 — closer section with step 1/2/3 path
 */

const BASE_URL = "https://bluejayportfolio.com";

export const metadata: Metadata = {
  title: "Pricing — Three ways to work with BlueJays",
  description:
    "Standard website at $997/yr · Custom bespoke build for one-of-a-kind brands · Full AI Marketing System at $10K. Pick the tier that fits where your business is now. Risk reversal on every tier.",
  alternates: { canonical: `${BASE_URL}/pricing` },
  openGraph: {
    type: "website",
    siteName: "BlueJays",
    title: "Pricing — Three ways to work with BlueJays",
    description:
      "Standard $997/yr · Custom bespoke · Full AI System $10K. Risk reversal on every tier.",
    url: `${BASE_URL}/pricing`,
    images: [{ url: `${BASE_URL}/og-image.png`, width: 1200, height: 630 }],
  },
};

type Tier = {
  name: string;
  tagline: string;
  price: string;
  priceNote: string;
  outcome: string;
  highlights: string[];
  cta: { label: string; href: string };
  riskBadges: string[];
  accent: "sky" | "violet" | "amber";
  emphasis?: boolean;
  best: string;
};

const TIERS: Tier[] = [
  {
    name: "Standard Website",
    tagline: "Get online fast with a category-tuned template.",
    price: "$997",
    priceNote: "one-time setup · then $100/yr maintenance",
    outcome:
      "Launch a premium-looking site in 14 days that ranks on Google and turns inbound clicks into bookings.",
    highlights: [
      "Category-tuned design (40+ verticals)",
      "Domain + hosting + SSL handled",
      "Lead-capture form wired to your email",
      "Mobile-first, animations, real photos",
      "Google Business + SEO basics",
      "$100/yr keeps it live + maintained",
    ],
    cta: { label: "Get the audit first →", href: "/audit" },
    riskBadges: [
      "Live in 14 days or it's free",
      "Cancel renewal anytime",
    ],
    accent: "sky",
    best: "Service trades · local businesses · solo operators",
  },
  {
    name: "Custom Bespoke",
    tagline: "Hand-built showcase for brands with a real story to tell.",
    price: "Custom",
    priceNote: "starting around $2,500 · $100/yr maintenance",
    outcome:
      "Get a bespoke site that reads like agency work — interactive features, custom photography, brand-aligned design — built in 3-6 weeks.",
    highlights: [
      "Fully custom design, no template",
      "Interactive features (quiz, calculator, map, gallery)",
      "Real photography sourced + optimized",
      "Brand-voice copy from a discovery call",
      "5-15 pages, content fidelity guaranteed",
      "Pre-launch audit before DNS flip",
    ],
    cta: { label: "Apply for a custom build →", href: "/agency/apply" },
    riskBadges: [
      "Pre-launch audit before DNS flip",
      "Real content, zero fabrications",
    ],
    accent: "violet",
    emphasis: true,
    best: "Indie authors · niche manufacturers · premium service brands",
  },
  {
    name: "Full AI System",
    tagline: "Your ads, site, emails, texts, voicemails, and SEO as one system.",
    price: "$10,000",
    priceNote: "one-time · $500-1,000/mo ongoing infra",
    outcome:
      "Built in 30 days, paid back in 90 — guaranteed 100 real leads or we keep working free until you hit it.",
    highlights: [
      "Self-learning ad + email loop",
      "Audience-segmented funnels (buyer / pro / shop)",
      "AI inbound responder + AI postcards",
      "Owner portal (9 tabs, your business in 60 seconds)",
      "$100/yr site maintenance included",
      "Pay in full · 3 payments · or quarterly",
    ],
    cta: { label: "Apply for the system →", href: "/agency/apply" },
    riskBadges: [
      "100 real leads in 90 days, or we keep working free",
      "Month-to-month support · cancel anytime",
    ],
    accent: "amber",
    best: "Product manufacturers · indie authors with 2+ books · brands ready to scale paid",
  },
];

function accentClasses(accent: Tier["accent"]) {
  const map = {
    sky: {
      ring: "border-sky-500/30 bg-sky-500/[0.03]",
      text: "text-sky-300",
      btn: "bg-sky-500 hover:bg-sky-400 text-white",
      glow: "shadow-[0_0_30px_-12px_rgba(56,189,248,0.35)]",
    },
    violet: {
      ring: "border-violet-500/40 bg-violet-500/[0.05]",
      text: "text-violet-300",
      btn: "bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white",
      glow: "shadow-[0_0_40px_-8px_rgba(139,92,246,0.4)]",
    },
    amber: {
      ring: "border-amber-500/30 bg-amber-500/[0.04]",
      text: "text-amber-300",
      btn: "bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold",
      glow: "shadow-[0_0_30px_-12px_rgba(245,158,11,0.35)]",
    },
  };
  return map[accent];
}

export default function PricingPage() {
  return (
    <main className="bg-slate-950 text-white min-h-screen">
      {/* ── NAV — minimal per skill chunk v02-19 ──────────────────────────── */}
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

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="px-6 pt-12 pb-10 md:pt-20 md:pb-12 text-center max-w-4xl mx-auto">
        <div className="inline-block bg-sky-500/10 border border-sky-500/30 text-sky-300 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-6">
          Three tiers · One operator · Real guarantee on every tier
        </div>
        <h1 className="text-4xl md:text-6xl font-black leading-tight mb-6">
          Pick the system that fits{" "}
          <span className="text-sky-400">where your business is now.</span>
        </h1>
        <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-4 leading-relaxed">
          One operator (Ben) builds every tier. No agency-rep churn. No
          black-box dashboards. Every tier comes with a written guarantee.
        </p>
        <p className="text-sm text-slate-500 max-w-xl mx-auto">
          Not sure which tier fits?{" "}
          <Link href="/audit" className="text-sky-400 hover:text-sky-300 underline underline-offset-2">
            Start with the free 60-second audit
          </Link>{" "}
          — we&apos;ll route you to the right tier on the call.
        </p>
      </section>

      {/* ── TIER GRID ────────────────────────────────────────────────────── */}
      <section className="px-6 pb-16 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-6">
          {TIERS.map((tier) => {
            const a = accentClasses(tier.accent);
            return (
              <div
                key={tier.name}
                className={`relative rounded-2xl border ${a.ring} ${a.glow} ${
                  tier.emphasis ? "md:scale-[1.03]" : ""
                } p-6 md:p-7 flex flex-col`}
              >
                {tier.emphasis && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-violet-500 text-white text-[10px] font-bold uppercase tracking-widest shadow-lg">
                    Most distinctive
                  </div>
                )}

                <div className="mb-4">
                  <h2 className="text-xl font-bold text-white">{tier.name}</h2>
                  <p className={`text-sm ${a.text} mt-1`}>{tier.tagline}</p>
                </div>

                <div className="mb-5">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl md:text-5xl font-black text-white">
                      {tier.price}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{tier.priceNote}</p>
                </div>

                <p className="text-sm text-slate-300 leading-relaxed mb-5 min-h-[60px]">
                  {tier.outcome}
                </p>

                <ul className="space-y-2.5 mb-6 flex-grow">
                  {tier.highlights.map((h) => (
                    <li key={h} className="flex items-start gap-2 text-sm text-slate-300">
                      <span className={`${a.text} mt-0.5 flex-shrink-0`}>✓</span>
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={tier.cta.href}
                  className={`${a.btn} block w-full text-center font-semibold px-6 py-3 rounded-xl transition-all hover:scale-[1.01]`}
                >
                  {tier.cta.label}
                </Link>

                {/* Risk badges under CTA per chunk 14 */}
                <div className="mt-4 space-y-1.5">
                  {tier.riskBadges.map((b) => (
                    <div key={b} className="flex items-start gap-1.5 text-xs text-slate-400">
                      <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0">
                        <path fillRule="evenodd" d="M8 .5a7.5 7.5 0 100 15A7.5 7.5 0 008 .5zm3.53 5.97a.75.75 0 010 1.06l-4 4a.75.75 0 01-1.06 0l-2-2a.75.75 0 011.06-1.06l1.47 1.47 3.47-3.47a.75.75 0 011.06 0z" clipRule="evenodd" />
                      </svg>
                      <span>{b}</span>
                    </div>
                  ))}
                </div>

                <p className="text-[11px] text-slate-500 mt-4 pt-4 border-t border-white/5">
                  <span className="font-semibold text-slate-400">Best for:</span>{" "}
                  {tier.best}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── COMPARISON STRIP ─────────────────────────────────────────────── */}
      <section className="px-6 py-12 max-w-5xl mx-auto">
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 md:p-8 text-center">
          <p className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-3">
            Side-by-side
          </p>
          <p className="text-lg md:text-xl text-slate-200 leading-relaxed">
            Standard gets you <span className="text-sky-300">live fast</span>.
            Custom Bespoke gets you <span className="text-violet-300">memorable</span>.
            Full AI System gets you <span className="text-amber-300">compounding</span>.
            All three are built by Ben, with a written guarantee per tier.
          </p>
        </div>
      </section>

      {/* ── CLOSER (step 1/2/3) per chunk 21 ─────────────────────────────── */}
      <section className="px-6 py-16 max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            Don&apos;t pick a tier yet
          </h2>
          <p className="text-slate-400 text-lg">
            Start with the free audit — Ben routes you to the right tier on the call.
          </p>
        </div>
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          {[
            {
              n: "Step 1",
              t: "Run the free audit",
              d: "60-second scan reveals the 5 biggest leaks on your current site. No signup to see the result.",
            },
            {
              n: "Step 2",
              t: "Ben texts the top 3 fixes",
              d: "Within an hour. You decide if you want to keep going. No pressure call.",
            },
            {
              n: "Step 3",
              t: "Pick the tier that fits",
              d: "Standard for fast launch. Custom for distinction. Full System for compounding scale.",
            },
          ].map((s) => (
            <div key={s.n} className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
              <div className="inline-block px-2.5 py-1 rounded-full bg-sky-500 text-white text-[10px] font-bold uppercase tracking-widest mb-3">
                {s.n}
              </div>
              <h3 className="font-bold text-white mb-1.5">{s.t}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{s.d}</p>
            </div>
          ))}
        </div>
        <div className="text-center">
          <Link
            href="/audit"
            className="inline-block bg-gradient-to-r from-sky-500 to-emerald-500 hover:opacity-90 text-white font-bold px-8 py-4 rounded-xl text-lg transition-all hover:scale-[1.02] shadow-[0_0_30px_rgba(56,189,248,0.4)]"
          >
            Run the free audit →
          </Link>
          <p className="text-xs text-slate-500 mt-3">
            No credit card · ~60 second results · Real audits by Ben
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}
