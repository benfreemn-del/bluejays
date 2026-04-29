import type { Metadata } from "next";
import type React from "react";
import Image from "next/image";
import AuditForm from "./AuditForm";
import SocialProofCounter from "./SocialProofCounter";
import ExitIntentPopup from "./ExitIntentPopup";

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

export default function AuditLandingPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Exit-intent popup — silently mounts, triggers on mouseleave/idle */}
      <ExitIntentPopup />

      {/* Hero */}
      <section id="audit-top" className="border-b border-white/5 scroll-mt-20">
        <div className="mx-auto max-w-4xl px-6 pt-20 pb-12 text-center">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-sky-300">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-400 animate-pulse" />
            Free — no credit card, no signup
          </p>
          <div className="mb-4">
            <SocialProofCounter />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Why isn&apos;t your site
            <br />
            <span className="bg-gradient-to-r from-sky-400 to-emerald-400 bg-clip-text text-transparent">
              booking jobs?
            </span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-slate-300 leading-relaxed max-w-2xl mx-auto">
            We score your site 0–100 and show you the <span className="font-semibold text-white">3 fixes worth real money</span> — for free, in about 60 seconds. What&apos;s costing you customers? Find out before your competitor does.
          </p>

          <div className="mt-12 max-w-xl mx-auto">
            <AuditForm />
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
              <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5 text-violet-400 shrink-0" aria-hidden="true"><path fillRule="evenodd" d="M8 .5C5.8.5 4 2.3 4 4.5v.67C2.8 5.7 2 6.8 2 8v5c0 1.4 1.1 2.5 2.5 2.5h7c1.4 0 2.5-1.1 2.5-2.5V8c0-1.2-.8-2.3-2-2.83V4.5C12 2.3 10.2.5 8 .5zm2.5 4.17V4.5a2.5 2.5 0 00-5 0v.17c.32-.1.65-.17 1-.17h3c.35 0 .68.07 1 .17zM8 9a1 1 0 01.5 1.87V12a.5.5 0 01-1 0v-1.13A1 1 0 018 9z" clipRule="evenodd" /></svg>
              SSL encrypted
            </span>
          </div>
        </div>
      </section>

      {/* Real client testimonials — drop video files in /public/testimonials/
          and uncomment the <video> tag in each card. Until then, name + company
          + quote-style text card serves as proof. */}
      <section className="border-b border-white/5 bg-slate-900/40">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <div className="text-center mb-10">
            <p className="text-xs uppercase tracking-wider text-sky-400 font-semibold mb-2">Real clients · Real results</p>
            <h2 className="text-2xl md:text-3xl font-bold">What local owners are saying</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Hector */}
            <div className="rounded-2xl border border-white/10 bg-slate-950/60 overflow-hidden hover:border-sky-500/30 transition-all">
              <div className="aspect-video bg-gradient-to-br from-emerald-500/20 to-sky-500/20 flex items-center justify-center relative group">
                {/* TODO: replace with <video controls poster="/testimonials/hector-poster.jpg" src="/testimonials/hector.mp4" className="w-full h-full object-cover" /> */}
                <div className="text-center px-6">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/15 transition-colors">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 text-white"><path d="M8 5v14l11-7z" /></svg>
                  </div>
                  <p className="text-xs text-slate-300 font-semibold">Video coming soon</p>
                </div>
              </div>
              <div className="p-5">
                <p className="text-sm text-slate-200 leading-relaxed mb-3 italic">&ldquo;Ben built my site faster than I thought possible. Looks better than my competitors who paid 5x more.&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 font-bold text-sm">H</div>
                  <div>
                    <p className="text-sm font-semibold text-white">Hector</p>
                    <p className="text-xs text-slate-400">Hector Landscaping</p>
                  </div>
                </div>
              </div>
            </div>
            {/* Luke */}
            <div className="rounded-2xl border border-white/10 bg-slate-950/60 overflow-hidden hover:border-sky-500/30 transition-all">
              <div className="aspect-video bg-gradient-to-br from-amber-500/20 to-rose-500/20 flex items-center justify-center relative group">
                {/* TODO: replace with <video controls poster="/testimonials/luke-poster.jpg" src="/testimonials/luke.mp4" className="w-full h-full object-cover" /> */}
                <div className="text-center px-6">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/15 transition-colors">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 text-white"><path d="M8 5v14l11-7z" /></svg>
                  </div>
                  <p className="text-xs text-slate-300 font-semibold">Video coming soon</p>
                </div>
              </div>
              <div className="p-5">
                <p className="text-sm text-slate-200 leading-relaxed mb-3 italic">&ldquo;Way better than the freelancer who ghosted me last year. Ben actually picks up the phone.&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 font-bold text-sm">L</div>
                  <div>
                    <p className="text-sm font-semibold text-white">Luke</p>
                    <p className="text-xs text-slate-400">Pine &amp; Particle</p>
                  </div>
                </div>
              </div>
            </div>
            {/* Michelle / LCAC */}
            <div className="rounded-2xl border border-white/10 bg-slate-950/60 overflow-hidden hover:border-sky-500/30 transition-all">
              <div className="aspect-video bg-gradient-to-br from-sky-500/20 to-violet-500/20 flex items-center justify-center relative group">
                {/* TODO: replace with <video controls poster="/testimonials/lcac-poster.jpg" src="/testimonials/lcac.mp4" className="w-full h-full object-cover" /> */}
                <div className="text-center px-6">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/15 transition-colors">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 text-white"><path d="M8 5v14l11-7z" /></svg>
                  </div>
                  <p className="text-xs text-slate-300 font-semibold">Video coming soon</p>
                </div>
              </div>
              <div className="p-5">
                <p className="text-sm text-slate-200 leading-relaxed mb-3 italic">&ldquo;Ben took our outdated nonprofit site and made it look like a real organization. Donations went up the first month.&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-300 font-bold text-sm">M</div>
                  <div>
                    <p className="text-sm font-semibold text-white">Michelle</p>
                    <p className="text-xs text-slate-400">Lewis County Autism Coalition</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

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

      {/* Final CTA — anchor scrolls to top via #audit-top id (CSS scroll-behavior:smooth on html handles smoothness) */}
      <section>
        <div className="mx-auto max-w-2xl px-6 py-16 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to see your score?</h2>
          <p className="text-slate-400 mb-8">It&apos;s free. It&apos;s 60 seconds. The audit lands in your inbox in about a minute.</p>
          <a
            href="#audit-top"
            className="inline-flex items-center justify-center rounded-md bg-gradient-to-r from-sky-500 to-emerald-500 px-8 py-4 text-sm font-semibold text-white shadow-lg hover:opacity-90 transition-opacity"
          >
            Run my audit →
          </a>
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
