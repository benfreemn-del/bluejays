import type { Metadata } from "next";
import Image from "next/image";
import AuditForm from "./AuditForm";
import AuditTestimonials from "./AuditTestimonials";
import SocialProofCounter from "./SocialProofCounter";
import ExitIntentPopup from "./ExitIntentPopup";
import PartnerRefCapture from "@/components/PartnerRefCapture";
import { jsonLdString, auditToolLd, breadcrumbLd } from "@/lib/json-ld";

/**
 * /audit — Product Audit lead-magnet (2026-05-15 rebuild).
 *
 * Replaces the legacy website-audit landing with a Hormozi pain-led
 * funnel for the $10K AI Marketing System ICP: product manufacturers
 * and indie authors who already have a site that doesn't sell.
 *
 * The OLD website-audit landing is preserved verbatim at /audit-classic
 * (full duplicate of the 13-file tree, internal paths rewritten). Both
 * funnels post to the same /api/audit/submit so the backend pipeline
 * stays single source of truth.
 *
 * Hormozi framework anchors used here:
 *   - Lead with pain (H1 = "4 Reasons Why Your Product Isn't Selling")
 *   - Curiosity gap with specific number (4)
 *   - Reasons listed ABOVE the form so the prospect sees the value of
 *     the audit before being asked to opt in
 *   - "Audit my product" CTA matches the H1 verb so click feels like
 *     a continuation, not a context switch
 */

const SITE = "https://bluejayportfolio.com";

export const metadata: Metadata = {
  title: "4 Reasons Your Product Isn't Selling — Free Audit | BlueJays",
  description:
    "Free 60-second audit for product brands + indie authors. We score the 5 leaks costing you orders and email you the top fixes — no signup required to see the results.",
  alternates: { canonical: `${SITE}/audit` },
  openGraph: {
    title: "4 Reasons Your Product Isn't Selling — Free Audit | BlueJays",
    description:
      "Free 60-second audit for product brands + indie authors. We score the 5 leaks costing you orders and email the top fixes.",
    url: `${SITE}/audit`,
    type: "website",
  },
};

export const dynamic = "force-dynamic";

/** The 4 reasons rendered above the form. Locked Hormozi-style: each
 *  reason is a SPECIFIC operator-flavor failure mode the prospect
 *  recognizes in their own funnel. No hand-wavy "your branding"
 *  garbage — every reason is testable in 60 seconds. */
const FOUR_REASONS = [
  {
    n: 1,
    title: "Your product page is a brochure, not a buy-button.",
    body: "Pretty photos. Spec sheet. No clear path to purchase, no urgency, no social proof above the fold. Visitors come, nod, leave.",
    accent: "rose",
  },
  {
    n: 2,
    title: "Your distributor owns the customer relationship — you don't.",
    body: "You make the product. They take the order, email, repeat purchase, and LTV. You're a vendor on someone else's audience. Cap on growth, cap on margin.",
    accent: "amber",
  },
  {
    n: 3,
    title: "You can't retarget the people who almost bought.",
    body: "No email capture. No Meta pixel. No SMS list. Every visitor who didn't convert is gone forever. You're paying for the same lead twice.",
    accent: "sky",
  },
  {
    n: 4,
    title: "Your funnel doesn't speak to the buyer who actually decides.",
    body: "Parents buy for kids. Coaches recommend to parents. Dealers resell to end-users. One blanket message for three audiences = converts none of them well.",
    accent: "violet",
  },
] as const;

const ACCENT_RING: Record<string, string> = {
  rose: "border-rose-500/30 bg-rose-500/[0.04]",
  amber: "border-amber-500/30 bg-amber-500/[0.04]",
  sky: "border-sky-500/30 bg-sky-500/[0.04]",
  violet: "border-violet-500/30 bg-violet-500/[0.04]",
};
const ACCENT_NUM: Record<string, string> = {
  rose: "bg-rose-500/15 border-rose-500/40 text-rose-300",
  amber: "bg-amber-500/15 border-amber-500/40 text-amber-300",
  sky: "bg-sky-500/15 border-sky-500/40 text-sky-300",
  violet: "bg-violet-500/15 border-violet-500/40 text-violet-300",
};

export default function ProductAuditLandingPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(auditToolLd()) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdString(
            breadcrumbLd([
              { name: "BlueJays", url: SITE },
              { name: "Free Product Audit", url: `${SITE}/audit` },
            ]),
          ),
        }}
      />
      <ExitIntentPopup />
      <PartnerRefCapture />

      {/* ── HERO ───────────────────────────────────────────────────── */}
      <section id="audit-top" className="border-b border-white/5 scroll-mt-20 relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[10%] left-[15%] w-[600px] h-[600px] rounded-full bg-amber-500/[0.05] blur-[160px]" />
          <div className="absolute bottom-[10%] right-[10%] w-[500px] h-[500px] rounded-full bg-rose-500/[0.05] blur-[140px]" />
        </div>
        <div className="relative mx-auto max-w-4xl px-6 pt-12 pb-10 md:pt-20 md:pb-14 text-center">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-300">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
            Free — for product makers + indie authors
          </p>
          <div className="mb-4">
            <SocialProofCounter />
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-[1.05]">
            4 Reasons Why{" "}
            <span className="bg-gradient-to-r from-rose-400 via-amber-300 to-amber-400 bg-clip-text text-transparent">
              Your Product Isn&apos;t Selling
            </span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-slate-300 leading-relaxed max-w-2xl mx-auto">
            Your product is great. Your funnel is leaking the orders.{" "}
            <span className="text-white font-semibold">
              Free 60-second audit — we score the 5 biggest leaks and email you the top fixes.
            </span>{" "}
            No signup to see the result.
          </p>
        </div>
      </section>

      {/* ── 4 REASONS ──────────────────────────────────────────────── */}
      <section className="border-b border-white/5 bg-slate-900/40">
        <div className="mx-auto max-w-5xl px-6 py-14 md:py-20">
          <div className="text-center mb-10 md:mb-14">
            <p className="text-xs uppercase tracking-wider text-amber-400 font-semibold mb-2">
              The honest answer
            </p>
            <h2 className="text-3xl md:text-4xl font-bold mb-3">
              Most product brands lose orders in the same 4 places.
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto leading-relaxed">
              The audit confirms which of these are leaking on YOUR site. The
              full report ranks all 5 leaks by dollar impact + how hard each
              one is to fix.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {FOUR_REASONS.map((r) => (
              <div
                key={r.n}
                className={`rounded-2xl border ${ACCENT_RING[r.accent]} p-6 md:p-7`}
              >
                <div className="flex items-start gap-4">
                  <span
                    className={`flex-shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-full border text-base font-black ${ACCENT_NUM[r.accent]}`}
                  >
                    {r.n}
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-lg md:text-xl font-bold text-white mb-2 leading-snug">
                      {r.title}
                    </h3>
                    <p className="text-sm md:text-base text-slate-300 leading-relaxed">
                      {r.body}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA card — hosts the AuditForm directly under the 4 reasons
              so the prospect's curiosity peak doesn't leak. Pain-pulled
              then form, classic Hormozi flow. */}
          <div className="mt-12 md:mt-14 max-w-xl mx-auto">
            <div className="rounded-2xl border-2 border-amber-500/40 bg-gradient-to-b from-amber-500/[0.05] to-transparent p-6 md:p-8">
              <div className="text-center mb-5">
                <p className="text-xs uppercase tracking-wider text-amber-400 font-bold mb-2">
                  See your audit
                </p>
                <h3 className="text-2xl md:text-3xl font-bold text-white leading-tight">
                  Which of these is yours?
                </h3>
                <p className="text-sm text-slate-400 mt-2">
                  Drop your site below. We grade all 5 leaks in 60 seconds.
                </p>
              </div>
              <AuditForm variant="B" ctaLabel="Audit my product →" />
              <p className="mt-4 text-xs text-slate-500 text-center">
                Audit generates in about 60 seconds. We&apos;ll email it to you the moment it&apos;s ready.
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5 text-emerald-500 shrink-0"><path fillRule="evenodd" d="M8 .5a7.5 7.5 0 100 15A7.5 7.5 0 008 .5zm3.53 5.97a.75.75 0 010 1.06l-4 4a.75.75 0 01-1.06 0l-2-2a.75.75 0 011.06-1.06l1.47 1.47 3.47-3.47a.75.75 0 011.06 0z" clipRule="evenodd" /></svg>
                  No credit card
                </span>
                <span className="text-slate-700">·</span>
                <span className="inline-flex items-center gap-1.5">
                  <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5 text-sky-500 shrink-0"><path d="M8 1a7 7 0 100 14A7 7 0 008 1zm-.75 4a.75.75 0 011.5 0v3.25l1.75 1.75a.75.75 0 11-1.06 1.06l-2-2A.75.75 0 017.25 8.5V5z" /></svg>
                  ~60 sec results
                </span>
                <span className="text-slate-700">·</span>
                <span className="inline-flex items-center gap-1.5">
                  <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5 text-violet-400 shrink-0"><path d="M8 .5a1 1 0 01.92.612l1.789 4.295 4.643.397a1 1 0 01.569 1.751l-3.527 3.05 1.063 4.54a1 1 0 01-1.491 1.083L8 13.84l-3.966 2.389a1 1 0 01-1.49-1.084l1.062-4.54L.08 7.555a1 1 0 01.57-1.75l4.643-.398L7.08 1.112A1 1 0 018 .5z" /></svg>
                  Real audits by Ben
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ───────────────────────────────────────────── */}
      <AuditTestimonials />

      {/* ── MEET BEN — compact ─────────────────────────────────────── */}
      <section className="border-b border-white/5 bg-slate-950/60 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-[10%] -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-sky-500/[0.04] blur-[120px]" />
          <div className="absolute top-1/2 right-[15%] -translate-y-1/2 w-[260px] h-[260px] rounded-full bg-emerald-500/[0.04] blur-[100px]" />
        </div>
        <div className="relative mx-auto max-w-4xl px-6 py-12">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-10">
            <div className="relative shrink-0">
              <div className="relative w-44 h-52 md:w-52 md:h-60 rounded-xl overflow-hidden border border-white/10 shadow-2xl shadow-sky-500/10">
                <Image
                  src="/ben-and-wife.jpg"
                  alt="Ben Freeman with his wife"
                  fill
                  sizes="(max-width: 768px) 176px, 208px"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              </div>
              <div className="absolute -bottom-3 left-3 bg-gradient-to-br from-sky-500 to-blue-600 text-white px-3 py-1.5 rounded-lg shadow-lg shadow-sky-500/30">
                <div className="text-[8px] uppercase tracking-[0.15em] opacity-80 leading-none">Founder</div>
                <div className="text-xs font-bold leading-tight mt-0.5">Ben Freeman</div>
              </div>
            </div>
            <div className="flex-1 text-center md:text-left">
              <span className="inline-block text-sky-400 text-[10px] font-bold uppercase tracking-[0.25em] mb-2 px-3 py-1 rounded-full border border-sky-500/20 bg-sky-500/5">
                Meet Ben
              </span>
              <h3 className="text-xl md:text-2xl font-extrabold tracking-tight mb-3 leading-tight">
                Real audits — by{" "}
                <span className="text-sky-400">a real person.</span>
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed mb-4 max-w-xl">
                I&apos;m a Washington State Trooper based in Quilcene. I started BlueJays because too many product owners get burned by agencies that ghost after the invoice.{" "}
                <span className="text-white font-semibold">
                  I answer my phone. I don&apos;t disappear.
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── SCARCITY FOOTER ────────────────────────────────────────── */}
      <section className="border-b border-white/5 bg-slate-900/40">
        <div className="mx-auto max-w-3xl px-6 py-12 text-center">
          <p className="text-xs uppercase tracking-wider text-amber-400 font-bold mb-3">
            Heads up
          </p>
          <p className="text-base md:text-lg text-slate-300 leading-relaxed">
            If you&apos;d like to be one of the{" "}
            <span className="text-white font-bold">5 businesses</span> I&apos;ll be building custom software for this month —{" "}
            <span className="text-white font-semibold">
              let&apos;s see if we&apos;re a good fit.
            </span>{" "}
            Start with the free audit and we&apos;ll go from there.
          </p>
          <a
            href="#audit-top"
            className="mt-6 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-amber-950 font-bold text-base hover:shadow-[0_0_30px_rgba(245,158,11,0.45)] active:scale-[0.97] transition-all"
          >
            Audit my product →
          </a>
        </div>
      </section>
    </main>
  );
}
