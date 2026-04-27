import type { Metadata } from "next";
import AuditForm from "./AuditForm";
import AuditTestimonials from "./AuditTestimonials";
import RetargetingPixels from "@/components/RetargetingPixels";

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
      {/* Retargeting pixels — every audit landing-page visitor enters the
          30-day Meta + Google retargeting window. Lead-magnet entrypoint
          for paid ads (Tier 3). Self-gates on env vars. */}
      <RetargetingPixels />

      {/* Hero */}
      <section id="audit-top" className="border-b border-white/5 scroll-mt-20">
        <div className="mx-auto max-w-4xl px-6 pt-20 pb-12 text-center">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-sky-300">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-400 animate-pulse" />
            Free — no credit card, no signup
          </p>
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
            Your report opens in this tab in about 60–90 seconds. We&apos;ll also email you a copy to keep.
          </p>
        </div>
      </section>

      {/* Testimonials — proof before they commit to filling out the form */}
      <AuditTestimonials />

      {/* What you get */}
      <section className="border-b border-white/5 bg-slate-900/40">
        <div className="mx-auto max-w-4xl px-6 py-16">
          <h2 className="text-3xl font-bold text-center mb-2">
            What&apos;s in your audit
          </h2>
          <p className="text-center text-slate-400 mb-12 max-w-2xl mx-auto">
            Most audits give you 40 things to do. We give you the 3 that actually move the needle.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            <Card
              icon="0–100"
              title="A real score"
              body="One number. Color-coded red/yellow/green so you know where you stand."
            />
            <Card
              icon="$"
              title="Money-leak estimate"
              body="What your current site is costing you in missed leads every month."
            />
            <Card
              icon="3-5"
              title="Prioritized fixes"
              body="Plain-English issues with the dollar impact + how hard each is to fix."
            />
            <Card
              icon="✓"
              title="Industry benchmark"
              body="We compare your site to the gold-standard for your category."
            />
            <Card
              icon="↻"
              title="Honest verdict"
              body="Which fixes you can DIY vs. need a rebuild — no upselling."
            />
            <Card
              icon="→"
              title="What's next"
              body="A clear next-action. If a freelancer would do better, we'll say so."
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-b border-white/5">
        <div className="mx-auto max-w-4xl px-6 py-16">
          <h2 className="text-3xl font-bold text-center mb-12">How it works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Step n="1" title="Drop your URL" body="Paste your site link + your business category. That's it." />
            <Step n="2" title="We analyze" body="AI looks at your hero, copy, buttons, reviews, mobile, and Google ranking. Takes about 5 min." />
            <Step n="3" title="You get the audit" body="Comprehensive report emailed to you + a shareable URL. Read it, share it, act on it." />
          </div>
        </div>
      </section>

      {/* Final CTA — anchor scrolls to top via #audit-top id (CSS scroll-behavior:smooth on html handles smoothness) */}
      <section>
        <div className="mx-auto max-w-2xl px-6 py-16 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to see your score?</h2>
          <p className="text-slate-400 mb-8">It&apos;s free. It&apos;s 60 seconds. The audit lands in your inbox in 5 minutes.</p>
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

function Card({ icon, title, body }: { icon: string; title: string; body: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/50 p-4 md:p-6">
      <div className="mb-3 inline-flex items-center justify-center h-11 w-11 rounded-xl bg-gradient-to-br from-sky-500/20 to-emerald-500/20 text-sky-300 font-bold text-sm">
        {icon}
      </div>
      <h3 className="font-semibold mb-1 text-sm md:text-base">{title}</h3>
      <p className="text-xs md:text-sm text-slate-400 leading-relaxed">{body}</p>
    </div>
  );
}

function Step({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/30 p-6">
      <div className="text-3xl font-bold text-sky-400 mb-2">{n}</div>
      <h3 className="font-semibold mb-1">{title}</h3>
      <p className="text-sm text-slate-400 leading-relaxed">{body}</p>
    </div>
  );
}
