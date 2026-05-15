import type { Metadata } from "next";
import type React from "react";
import Image from "next/image";
import { cookies } from "next/headers";
import AuditForm from "./AuditForm";
import AuditTestimonials from "./AuditTestimonials";
import SocialProofCounter from "./SocialProofCounter";
import ExitIntentPopup from "./ExitIntentPopup";
import PartnerRefCapture from "@/components/PartnerRefCapture";
import { jsonLdString, auditToolLd, breadcrumbLd } from "@/lib/json-ld";

/**
 * Hero variant copy — A/B/C cold-traffic test locked 2026-05-08.
 * Variant assigned by middleware (sticky cookie). URL override
 * `?v=A|B|C` for manual testing. See docs/templates/cold-traffic-ad-creatives.md
 * for the matching ad copy + UTM mapping.
 */
type AuditVariant = "A" | "B" | "C";

// Rewritten 2026-05-14 per ICP niche-down. Both verticals tested in
// parallel: A + B = manufacturer (2 sub-angles, Kaleidoscope-style test),
// C = indie author (Bloodlines anchor). Service-trade variants archived
// in git history; see commit before 15510bdf for legacy copy.
const HERO_VARIANTS: Record<
  AuditVariant,
  {
    eyebrow: string;
    h1Top: string;
    h1Bottom: string;
    sub: React.ReactNode;
  }
> = {
  A: {
    eyebrow: "Free — for product makers selling through distributors",
    h1Top: "Why is your distributor",
    h1Bottom: "making more than you?",
    sub: (
      <>
        We score your site 0–100 and show you the{" "}
        <span className="font-semibold text-white">3 fixes that pull demand back to you</span>
        {" "}— for free, in about 60 seconds. If you make the product, you should
        own the customer. Find out what&apos;s costing you the relationship.
      </>
    ),
  },
  B: {
    eyebrow: "Free 60-second diagnostic — manufacturers + niche brands",
    h1Top: "Your product is great.",
    h1Bottom: "Your website is leaking the demand.",
    sub: (
      <>
        The honest answer is the{" "}
        <span className="font-semibold text-white">bottleneck costing you orders right now</span>.
        Speed-to-lead. Cart abandonment. Dealer cannibalization. Zero email capture.
        No audience to retarget. We score the 5 leaks every product brand has.
        Free, 60 seconds, no signup.
      </>
    ),
  },
  C: {
    eyebrow: "Free — for indie authors with a book on Amazon",
    h1Top: "Your book is selling.",
    h1Bottom: "Your author site is selling it short.",
    sub: (
      <>
        Most indie author sites are a Squarespace landing page and a Goodreads link.
        That&apos;s a problem if you&apos;re working on book #2 or #3. We score the{" "}
        <span className="font-semibold text-white">5 leaks every author site has</span>
        {" "}— newsletter capture, series funnel, world-building reveal, retargeting.
        Free, 60 seconds, no signup.
      </>
    ),
  },
};

/**
 * /audit — Hormozi salty-pretzel lead-magnet landing page.
 *
 * Per Ben's spec 2026-04-26 (#4C — both homepage CTA + dedicated landing):
 * this is the dedicated landing page that the homepage CTA points at.
 * Form submits to /api/audit/submit, then user is redirected to
 * /audit/[id]/processing while the AI generates.
 *
 * Public via PUBLIC_API_PATHS in middleware (URL-as-secret pattern).
 *
 * Copy lifted from research deliverable Section F (locked Hormozi-tone
 * phrasings):
 *  - "Free 60-second audit that tells you exactly why your site isn't
 *    booking jobs"
 *  - "We score your site 0–100 and show you the 3 fixes worth real
 *    money"
 *  - "What's costing you customers? Find out before your competitor does."
 */

export const metadata: Metadata = {
  title: "Free Website Audit — BlueJays",
  description:
    "Free 60-second audit that tells you exactly why your site isn't booking jobs. We score your site 0–100 and show you the 3 fixes worth real money.",
  openGraph: {
    title: "Free Website Audit — BlueJays",
    description:
      "We score your site 0–100 and show you the 3 fixes worth real money. Takes 60 seconds.",
    url: "https://bluejayportfolio.com/audit",
    type: "website",
  },
};

export const dynamic = "force-dynamic";

export default async function AuditLandingPage() {
  // Read the variant cookie set by middleware. Falls back to A
  // (control) if anything is off — never crashes the page.
  const cookieStore = await cookies();
  const rawVariant = cookieStore.get("bj_audit_variant")?.value || "A";
  const variant: AuditVariant =
    rawVariant === "B" || rawVariant === "C" ? rawVariant : "A";
  const hero = HERO_VARIANTS[variant];
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Structured data — helps Google show /audit as a free-tool
          rich result + breadcrumb in search. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(auditToolLd()) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdString(
            breadcrumbLd([
              { name: "BlueJays", url: "https://bluejayportfolio.com" },
              { name: "Free Audit", url: "https://bluejayportfolio.com/audit" },
            ]),
          ),
        }}
      />
      {/* Exit-intent popup — silently mounts, triggers on mouseleave/idle */}
      <ExitIntentPopup />
      {/* Drops `bj_partner_ref` cookie when ?ref=<code> is in the URL.
          AuditForm reads it and forwards in the submit body so the
          Stripe webhook can credit the partner $200 on close. */}
      <PartnerRefCapture />

      {/* Hero */}
      <section id="audit-top" className="border-b border-white/5 scroll-mt-20">
        <div className="mx-auto max-w-4xl px-6 pt-12 pb-8 md:pt-20 md:pb-12 text-center">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-sky-300">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-400 animate-pulse" />
            {hero.eyebrow}
          </p>
          <div className="mb-4">
            <SocialProofCounter />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            {hero.h1Top}
            <br />
            <span className="bg-gradient-to-r from-sky-400 to-emerald-400 bg-clip-text text-transparent">
              {hero.h1Bottom}
            </span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-slate-300 leading-relaxed max-w-2xl mx-auto">
            {hero.sub}
          </p>

          <div className="mt-12 max-w-xl mx-auto">
            <AuditForm variant={variant} />
          </div>

          <p className="mt-6 text-xs text-slate-500">
            Audit generates in about 60 seconds. We&apos;ll email it to you the moment it&apos;s ready.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
              <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5 text-emerald-500 shrink-0" aria-hidden="true"><path fillRule="evenodd" d="M8 .5a7.5 7.5 0 100 15A7.5 7.5 0 008 .5zm3.53 5.97a.75.75 0 010 1.06l-4 4a.75.75 0 01-1.06 0l-2-2a.75.75 0 011.06-1.06l1.47 1.47 3.47-3.47a.75.75 0 011.06 0z" clipRule="evenodd" /></svg>
              No credit card required
            </span>
            <span className="text-slate-700 hidden sm:block">·</span>
            <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
              <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5 text-sky-500 shrink-0" aria-hidden="true"><path d="M8 1a7 7 0 100 14A7 7 0 008 1zm-.75 4a.75.75 0 011.5 0v3.25l1.75 1.75a.75.75 0 11-1.06 1.06l-2-2A.75.75 0 017.25 8.5V5z" /><path fillRule="evenodd" d="M8 0a8 8 0 100 16A8 8 0 008 0zm0 1.5a6.5 6.5 0 110 13 6.5 6.5 0 010-13z" clipRule="evenodd" /></svg>
              Results in ~60 seconds
            </span>
            <span className="text-slate-700 hidden sm:block">·</span>
            <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
              <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5 text-violet-400 shrink-0" aria-hidden="true"><path d="M8 .5a1 1 0 01.92.612l1.789 4.295 4.643.397a1 1 0 01.569 1.751l-3.527 3.05 1.063 4.54a1 1 0 01-1.491 1.083L8 13.84l-3.966 2.389a1 1 0 01-1.49-1.084l1.062-4.54L.08 7.555a1 1 0 01.57-1.75l4.643-.398L7.08 1.112A1 1 0 018 .5z" /></svg>
              Real audits by Ben — not bots
            </span>
          </div>
        </div>
      </section>

      {/* Real client testimonials — render the shared <AuditTestimonials/>
          component instead of inlining cards. That component has Erik's
          real video, Luke's real video, "Paid for itself in X months"
          badges, and a 4th testimonial (Bonnie / Mt View). One source
          of truth for both /audit and /audit/[id]. */}
      <AuditTestimonials />

      {/* Meet Ben — compact half-size founder section.
          Full version lives on bluejayportfolio.com homepage; this is a
          shrunk variant to anchor trust on the audit lead-magnet page. */}
      <section className="border-b border-white/5 bg-slate-950/60 relative overflow-hidden">
        {/* Subtle ambient glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-[10%] -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-sky-500/[0.04] blur-[120px]" />
          <div className="absolute top-1/2 right-[15%] -translate-y-1/2 w-[260px] h-[260px] rounded-full bg-emerald-500/[0.04] blur-[100px]" />
        </div>

        <div className="relative mx-auto max-w-4xl px-6 py-12">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-10">
            {/* Left — photo (smaller than homepage version) */}
            <div className="relative shrink-0">
              <div className="relative w-44 h-52 md:w-52 md:h-60 rounded-xl overflow-hidden border border-white/10 shadow-2xl shadow-sky-500/10">
                <Image
                  src="/ben-and-wife.jpg"
                  alt="Ben Freeman with his wife"
                  fill
                  sizes="(max-width: 768px) 176px, 208px"
                  className="object-cover"
                  priority={false}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              </div>
              {/* Compact founder badge */}
              <div className="absolute -bottom-3 left-3 bg-gradient-to-br from-sky-500 to-blue-600 text-white px-3 py-1.5 rounded-lg shadow-lg shadow-sky-500/30">
                <div className="text-[8px] uppercase tracking-[0.15em] opacity-80 leading-none">Founder</div>
                <div className="text-xs font-bold leading-tight mt-0.5">Ben Freeman</div>
              </div>
            </div>

            {/* Right — story + trust pillars */}
            <div className="flex-1 text-center md:text-left">
              <span className="inline-block text-sky-400 text-[10px] font-bold uppercase tracking-[0.25em] mb-2 px-3 py-1 rounded-full border border-sky-500/20 bg-sky-500/5">
                Meet Ben
              </span>
              <h3 className="text-xl md:text-2xl font-extrabold tracking-tight mb-3 leading-tight">
                When you hire BlueJays,{" "}
                <span className="text-sky-400">you hire me.</span>
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed mb-4 max-w-xl">
                I&apos;m a Washington State Trooper based in Quilcene. I started BlueJays because too many local owners get burned by web designers who ghost after the invoice. <span className="text-white font-semibold">I answer my phone. I don&apos;t disappear.</span>
              </p>

              {/* Trust pillars — inline strip */}
              <div className="flex flex-wrap justify-center md:justify-start gap-x-5 gap-y-2 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 text-sky-400">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="12" cy="9" r="2.5" />
                  </svg>
                  <span><span className="text-white font-semibold">Local</span> · Quilcene WA</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 text-sky-400">
                    <path d="M12 2L4 6v6c0 5 3.5 9 8 10 4.5-1 8-5 8-10V6l-8-4z" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span><span className="text-white font-semibold">Accountable</span> · One person, one promise</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 text-sky-400">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.13.96.37 1.91.71 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.9.34 1.85.58 2.81.71A2 2 0 0122 16.92z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span><span className="text-white font-semibold">Personal</span> · Direct line, real human</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What you get */}
      <section className="border-b border-white/5 bg-slate-900/40">
        <div className="mx-auto max-w-4xl px-6 py-16">
          <h2 className="text-3xl font-bold text-center mb-2">
            What&apos;s in your audit
          </h2>
          <p className="text-center text-slate-400 mb-12 max-w-2xl mx-auto">
            Most audits give you 40 things to do. We give you the 3 that actually move the needle.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            <Card icon="%"    title="A real score"         body="One number. Honest. Color-coded red/yellow/green so you know where you stand at a glance." accent="emerald" />
            <Card icon="$"    title="Money-leak estimate"   body="A conservative estimate of what your current site is costing you in missed leads every month." accent="rose" />
            <Card icon="#1"   title="Prioritized fixes"     body="Specific, plain-English issues with the dollar impact + how hard each one is to fix." accent="amber" />
            <Card icon="✓"   title="Industry benchmark"    body="We compare your site to the gold-standard template for your category. See the gap." accent="sky" />
            <Card icon="↻"   title="Honest verdict"        body="Which fixes you can DIY, and which ones need a rebuild. We tell you which is which — no upselling." accent="violet" />
            <Card icon="→"   title="What's next"           body="A clear next-action. If we can help, we'll say so. If a freelancer would do better, we'll point you there." accent="teal" />
          </div>
        </div>
      </section>

      {/* The 5 Clogs — what we audit for + what we fix.
          Per AIOS Rule 24 / 5-Clog Framework locked 2026-05-07.
          Doc-processing clog is OUT-OF-ICP for local service buyers
          and intentionally not listed — we only show the 5 that
          BlueJays actually fixes for this audience. Source:
          aios/decisions/2026-05-07_5-clog-framework.md */}
      <section className="border-b border-white/5 bg-slate-950/60">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <div className="text-center mb-3">
            <p className="text-xs uppercase tracking-wider text-amber-400 font-semibold">The 5 most common money-leaks</p>
          </div>
          <h2 className="text-3xl font-bold text-center mb-3">
            What&apos;s actually costing you customers
          </h2>
          <p className="text-center text-slate-400 mb-12 max-w-2xl mx-auto">
            Most local businesses lose money in the same five places. Your audit shows which ones are leaking — and if you book a build, we fix every one of them.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            <ClogCard
              n="1"
              title="Slow lead response"
              stat="5-min response = 10× conversion vs 30-min"
              pain="Industry average: 47 hours to respond. By then they&apos;ve called three competitors."
              fix="Auto-responder fires within seconds of any form submit. Personalized, qualifies them, routes to your phone."
              accent="rose"
            />
            <ClogCard
              n="2"
              title="Missed calls go silent"
              stat="Every missed call is a customer who calls a competitor next"
              pain="Phone rings, nobody picks up, caller hangs up and you never know they tried."
              fix="Every unanswered call triggers an instant text within seconds: &ldquo;Sorry we missed you — book here.&rdquo;"
              accent="amber"
            />
            <ClogCard
              n="3"
              title="No real follow-up"
              stat="80% of sales need 5+ follow-ups. Most reps stop after 1-2."
              pain="Warm leads who already raised their hand go cold because nobody touched them again."
              fix="Multi-touch nurture sequence runs automatically. Warm replies route back to you, sequence stops on book."
              accent="emerald"
            />
            <ClogCard
              n="4"
              title="Old customers forgotten"
              stat="Industry agency benchmark: 200% ROI in 60 days"
              pain="Past customers, dead leads, churned trial users — all sitting in your CRM doing nothing."
              fix="Database reactivation sequence pulls them back. Personalized per their history with you, not generic blasts."
              accent="violet"
            />
            <ClogCard
              n="5"
              title="Flying blind on numbers"
              stat="Decisions delayed because nobody compiled the report"
              pain="You don&apos;t know yesterday&apos;s leads, this week&apos;s pipeline, or last month&apos;s ROI without spending an hour pulling it."
              fix="Daily digest hits your phone. Weekly performance email. The dashboard you check once instead of six tools."
              accent="sky"
            />
            {/* The frame — which clog is leaking the most? */}
            <div className="rounded-xl border border-amber-500/30 bg-gradient-to-br from-amber-500/[0.06] via-slate-900/60 to-slate-900/40 p-6 flex flex-col justify-center">
              <p className="text-xs uppercase tracking-wider text-amber-400 font-semibold mb-3">The diagnostic</p>
              <p className="text-lg font-semibold text-white mb-3 leading-snug">
                &ldquo;If 500 new clients showed up tomorrow, what would break first?&rdquo;
              </p>
              <p className="text-sm text-slate-400 leading-relaxed">
                Your honest answer is the clog leaking the most money right now. Your audit identifies which one — and we&apos;ll show you exactly what it&apos;s worth.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-b border-white/5">
        <div className="mx-auto max-w-4xl px-6 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">How it works</h2>
            <p className="text-slate-400 max-w-xl mx-auto">Three steps. About 60 seconds. A report you can actually use.</p>
          </div>
          <div className="relative">
            {/* Connector line on desktop */}
            <div className="hidden md:block absolute top-10 left-[16.5%] right-[16.5%] h-px bg-gradient-to-r from-transparent via-sky-500/30 to-transparent" />
            <div className="grid md:grid-cols-3 gap-6">
              <Step
                n="1"
                icon={
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
                    <path d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                }
                title="Drop your URL"
                body="Paste your site link and pick your business type. Takes 30 seconds."
              />
              <Step
                n="2"
                icon={
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
                    <path d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                }
                title="We run it through the system"
                body="We score your hero, copy, CTAs, trust signals, mobile layout, and local SEO against what's actually working in your industry right now."
              />
              <Step
                n="3"
                icon={
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
                    <path d="M21.75 9v.906a2.25 2.25 0 01-1.183 1.981l-6.478 3.488M2.25 9v.906a2.25 2.25 0 001.183 1.981l6.478 3.488m8.839 2.51l-4.66-2.51m0 0l-1.023-.55a2.25 2.25 0 00-2.134 0l-1.022.55m0 0l-4.661 2.51m16.5 1.615a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V8.844a2.25 2.25 0 011.183-1.981l7.5-4.039a2.25 2.25 0 012.134 0l7.5 4.039a2.25 2.25 0 011.183 1.98V19.5z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                }
                title="Hits your inbox"
                body="Full report emailed + a shareable link. Score, money-leak estimate, the 3 fixes that matter most, and exactly what to do next."
              />
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA — anchor scrolls to top via #audit-top id (CSS scroll-behavior:smooth on html handles smoothness).
          Closes with a Hormozi-style "what you avoid" frame + the
          real cost-of-inaction the 5 clogs translate to. */}
      <section className="border-t border-white/5">
        <div className="mx-auto max-w-2xl px-6 py-20 text-center">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-300">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
            Free · 60 seconds · no signup
          </p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
            Stop guessing which fix matters most.
          </h2>
          <p className="text-slate-300 mb-2 leading-relaxed">
            Every week you don&apos;t know which clog is leaking is another week of customers calling competitors.
          </p>
          <p className="text-slate-400 mb-10 text-sm">
            The audit shows you in 60 seconds. We email the report + the 3 fixes that actually move the needle.
          </p>
          <a
            href="#audit-top"
            className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-sky-500 to-emerald-500 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-sky-500/20 hover:shadow-sky-500/30 hover:scale-[1.02] transition-all"
          >
            Run my free audit →
          </a>
          <p className="mt-6 text-xs text-slate-500">
            Ben personally reviews every audit before it hits your inbox.
          </p>
        </div>
      </section>

      <footer className="border-t border-white/5">
        <div className="mx-auto max-w-4xl px-6 py-8 text-center text-xs text-slate-500">
          <p>
            Built by <a href="https://bluejayportfolio.com" className="text-sky-400 hover:underline">BlueJays</a> — custom websites for local businesses across Washington State and beyond.
          </p>
        </div>
      </footer>
    </main>
  );
}

const CARD_ACCENTS: Record<string, { icon: string; border: string; title: string; glow: string }> = {
  emerald: { icon: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30", border: "border-emerald-500/20", title: "text-emerald-100", glow: "hover:border-emerald-500/40 hover:shadow-[0_0_20px_rgba(16,185,129,0.08)]" },
  rose:    { icon: "bg-rose-500/15 text-rose-300 border border-rose-500/30",           border: "border-rose-500/20",   title: "text-rose-100",    glow: "hover:border-rose-500/40 hover:shadow-[0_0_20px_rgba(244,63,94,0.08)]" },
  amber:   { icon: "bg-amber-500/15 text-amber-300 border border-amber-500/30",        border: "border-amber-500/20",  title: "text-amber-100",   glow: "hover:border-amber-500/40 hover:shadow-[0_0_20px_rgba(245,158,11,0.08)]" },
  sky:     { icon: "bg-sky-500/15 text-sky-300 border border-sky-500/30",              border: "border-sky-500/20",    title: "text-sky-100",     glow: "hover:border-sky-500/40 hover:shadow-[0_0_20px_rgba(14,165,233,0.08)]" },
  violet:  { icon: "bg-violet-500/15 text-violet-300 border border-violet-500/30",     border: "border-violet-500/20", title: "text-violet-100",  glow: "hover:border-violet-500/40 hover:shadow-[0_0_20px_rgba(139,92,246,0.08)]" },
  teal:    { icon: "bg-teal-500/15 text-teal-300 border border-teal-500/30",           border: "border-teal-500/20",   title: "text-teal-100",    glow: "hover:border-teal-500/40 hover:shadow-[0_0_20px_rgba(20,184,166,0.08)]" },
};

function Card({ icon, title, body, accent = "sky" }: { icon: string; title: string; body: string; accent?: string }) {
  const a = CARD_ACCENTS[accent] || CARD_ACCENTS.sky;
  return (
    <div className={`rounded-xl border ${a.border} bg-slate-900/50 p-6 transition-all duration-200 ${a.glow}`}>
      <div className={`mb-3 inline-flex items-center justify-center h-10 w-10 rounded-lg ${a.icon} font-bold text-sm`}>
        {icon}
      </div>
      <h3 className={`font-semibold mb-1 ${a.title}`}>{title}</h3>
      <p className="text-sm text-slate-400 leading-relaxed">{body}</p>
    </div>
  );
}

function Step({ n, icon, title, body }: { n: string; icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="relative rounded-2xl border border-white/8 bg-slate-900/50 p-6 hover:border-sky-500/25 hover:bg-slate-900/70 transition-all duration-300">
      {/* Step number badge */}
      <div className="absolute -top-3 left-6 flex items-center justify-center w-6 h-6 rounded-full bg-sky-500 text-white text-[10px] font-bold">
        {n}
      </div>
      {/* Icon */}
      <div className="mb-4 mt-1 inline-flex items-center justify-center w-11 h-11 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
        {icon}
      </div>
      <h3 className="font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-400 leading-relaxed">{body}</p>
    </div>
  );
}

function ClogCard({ n, title, stat, pain, fix, accent }: {
  n: string;
  title: string;
  stat: string;
  pain: string;
  fix: string;
  accent: string;
}) {
  const a = CARD_ACCENTS[accent] || CARD_ACCENTS.sky;
  return (
    <div className={`relative rounded-xl border ${a.border} bg-slate-900/50 p-5 transition-all duration-200 ${a.glow}`}>
      <div className="flex items-start gap-3 mb-3">
        <div className={`shrink-0 inline-flex items-center justify-center h-8 w-8 rounded-lg ${a.icon} font-bold text-sm`}>
          {n}
        </div>
        <h3 className={`font-bold text-base leading-tight pt-1 ${a.title}`}>{title}</h3>
      </div>
      <p className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold mb-2">{stat}</p>
      <p className="text-sm text-slate-400 leading-relaxed mb-3">{pain}</p>
      <div className="border-t border-white/5 pt-3">
        <p className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold mb-1">What we ship</p>
        <p className="text-sm text-slate-300 leading-relaxed">{fix}</p>
      </div>
    </div>
  );
}
