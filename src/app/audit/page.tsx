import type { Metadata } from "next";
import AuditForm from "./AuditForm";

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
            Audit takes ~3-5 minutes to generate. We&apos;ll email it to you the moment it&apos;s ready.
          </p>
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
          <h2 className="text-3xl font-bold text-center mb-12">How it works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Step n="1" title="Drop your URL" body="Paste your site link + your business category. That's it." />
            <Step n="2" title="We analyze" body="Claude + GPT-4 look at your hero, copy, CTAs, social proof, mobile, SEO. Takes ~5 min." />
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

function Step({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/30 p-6">
      <div className="text-3xl font-bold text-sky-400 mb-2">{n}</div>
      <h3 className="font-semibold mb-1">{title}</h3>
      <p className="text-sm text-slate-400 leading-relaxed">{body}</p>
    </div>
  );
}
