import type { Metadata } from "next";
import Image from "next/image";
import AuditForm from "./AuditForm";
import AuditTestimonials from "./AuditTestimonials";
import SocialProofCounter from "./SocialProofCounter";
import ExitIntentPopup from "./ExitIntentPopup";
import FourReasonsAudience from "./FourReasonsAudience";
import AuditLiveSlots from "@/components/AuditLiveSlots";
import PartnerRefCapture from "@/components/PartnerRefCapture";
import { jsonLdString, auditToolLd, breadcrumbLd } from "@/lib/json-ld";

/**
 * /audit — Product Audit lead-magnet, Hormozi-grade rebuild
 * (2026-05-15, "lead capture tool Hormozi would be proud of").
 *
 * Key conversion mechanics applied:
 *   - Form lives ABOVE THE FOLD (no scroll required to convert) —
 *     prior version buried it 1 viewport down.
 *   - Single H1 + 1-line sub + form, with social-proof counter
 *     wrapping the trust line directly under the button.
 *   - LIVE scarcity counter pulls real fullsystem-tier paid-this-
 *     month count from /api/agency/slots-remaining — no more
 *     hardcoded "5 businesses this month" optic.
 *   - "What you'll get in 60 seconds" preview card sits between
 *     the hero and the 4-reasons proof-of-pain so a hesitant
 *     visitor sees the output BEFORE the form-fill commitment.
 *   - 4 reasons stay (Ben's locked spec) but reframed as
 *     "Sound familiar?" — pain-validation rather than
 *     diagnostic reveal.
 *   - Testimonials, Meet Ben, scarcity footer all preserved but
 *     tightened.
 *
 * Old website-audit landing is preserved verbatim at /audit-classic.
 * Both funnels post to /api/audit/submit (single backend).
 */

const SITE = "https://bluejayportfolio.com";

// Root layout adds "| BlueJays" via metadata.title.template — don't
// double-include it here.
export const metadata: Metadata = {
  title: "4 Reasons Your Product Isn't Selling — Free Audit",
  description:
    "Free 60-second audit for product brands + indie authors. We score the 5 leaks costing you orders and email you the top fixes — no signup required to see the result.",
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

      {/* ── HERO — H1 + sub + FORM all above the fold ──────────────── */}
      <section id="audit-top" className="border-b border-white/5 scroll-mt-20 relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[10%] left-[15%] w-[600px] h-[600px] rounded-full bg-amber-500/[0.06] blur-[160px]" />
          <div className="absolute bottom-[10%] right-[10%] w-[500px] h-[500px] rounded-full bg-rose-500/[0.05] blur-[140px]" />
        </div>
        <div className="relative mx-auto max-w-5xl px-6 pt-10 pb-12 md:pt-16 md:pb-16">
          <div className="text-center mb-6 md:mb-8">
            <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-300">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
              Free — for product makers + indie authors
            </p>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-[1.05] mb-5">
              4 Reasons Why{" "}
              <span className="bg-gradient-to-r from-rose-400 via-amber-300 to-amber-400 bg-clip-text text-transparent">
                Your Product Isn&apos;t Selling
              </span>
            </h1>
            <p className="text-lg md:text-xl text-slate-300 leading-relaxed max-w-2xl mx-auto">
              Drop your URL. In 60 seconds we score the 5 biggest leaks costing
              you orders + email the top fixes.{" "}
              <span className="text-white font-semibold">
                No signup to see the result.
              </span>
            </p>
            {/* Founder-trust chip — above-the-fold "you're dealing with a
                real person." Originally the trust signal lived ~5 sections
                deep at the "Meet Ben" card where most cold visitors had
                already bounced. Hoisting it here per the 2026-05-17
                Hormozi review (every-funnel-step-loses-50% → trust above
                the fold). Clicking jumps to the full founder bio for the
                visitors who want more proof. */}
            <a
              href="#meet-ben"
              className="mt-5 inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/[0.06] px-4 py-1.5 text-xs md:text-sm text-sky-200 hover:border-sky-400/60 hover:bg-sky-500/[0.10] transition-colors"
            >
              <span className="text-sky-300">👋</span>
              <span>
                Real person — Ben texts you within{" "}
                <span className="font-semibold text-white">1 hour</span>
              </span>
            </a>
          </div>

          {/* Above-the-fold form card */}
          <div className="max-w-xl mx-auto">
            <div className="rounded-2xl border-2 border-amber-500/40 bg-gradient-to-b from-amber-500/[0.06] to-transparent p-5 md:p-6 shadow-[0_0_60px_-12px_rgba(245,158,11,0.25)]">
              <AuditForm
                variant="B"
                ctaLabel="Audit my product →"
                defaultCategory="mfg-ag-equipment"
                hideCategory
              />

              {/* Social proof + trust strip — directly under the button */}
              <div className="mt-4 flex flex-col items-center gap-2.5">
                <SocialProofCounter />
                <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
                  <span className="inline-flex items-center gap-1">
                    <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3 text-emerald-500"><path fillRule="evenodd" d="M8 .5a7.5 7.5 0 100 15A7.5 7.5 0 008 .5zm3.53 5.97a.75.75 0 010 1.06l-4 4a.75.75 0 01-1.06 0l-2-2a.75.75 0 011.06-1.06l1.47 1.47 3.47-3.47a.75.75 0 011.06 0z" clipRule="evenodd" /></svg>
                    No credit card
                  </span>
                  <span className="text-slate-700">·</span>
                  <span className="inline-flex items-center gap-1">
                    <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3 text-sky-500"><path d="M8 1a7 7 0 100 14A7 7 0 008 1zm-.75 4a.75.75 0 011.5 0v3.25l1.75 1.75a.75.75 0 11-1.06 1.06l-2-2A.75.75 0 017.25 8.5V5z" /></svg>
                    ~60 sec results
                  </span>
                  <span className="text-slate-700">·</span>
                  <span className="inline-flex items-center gap-1">
                    <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3 text-violet-400"><path d="M8 .5a1 1 0 01.92.612l1.789 4.295 4.643.397a1 1 0 01.569 1.751l-3.527 3.05 1.063 4.54a1 1 0 01-1.491 1.083L8 13.84l-3.966 2.389a1 1 0 01-1.49-1.084l1.062-4.54L.08 7.555a1 1 0 01.57-1.75l4.643-.398L7.08 1.112A1 1 0 018 .5z" /></svg>
                    Real audits by Ben
                  </span>
                </div>
              </div>
            </div>

            {/* Live scarcity strip directly under the form */}
            <div className="mt-4 flex justify-center">
              <AuditLiveSlots variant="strip" />
            </div>
          </div>
        </div>
      </section>

      {/* ── WHAT YOU'LL GET — visual proof BEFORE the deeper pain ──── */}
      <section className="border-b border-white/5">
        <div className="mx-auto max-w-5xl px-6 py-12 md:py-16">
          <div className="text-center mb-8 md:mb-10">
            <p className="text-xs uppercase tracking-wider text-emerald-400 font-bold mb-2">
              What you&apos;ll get · in 60 seconds
            </p>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
              Specific. Ranked. Honest.
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4 md:gap-5">
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.04] p-5">
              <div className="text-3xl mb-2">📊</div>
              <h3 className="text-white font-bold mb-1.5">A real score</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                One honest number 0-100. Color-coded. You know exactly where
                you stand at a glance.
              </p>
            </div>
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/[0.04] p-5">
              <div className="text-3xl mb-2">💰</div>
              <h3 className="text-white font-bold mb-1.5">Money-leak estimate</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                A conservative dollar/month figure of what your current funnel
                is costing you in missed orders.
              </p>
            </div>
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/[0.04] p-5">
              <div className="text-3xl mb-2">🛠️</div>
              <h3 className="text-white font-bold mb-1.5">Top 5 fixes, ranked</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Specific, plain-English issues. Ranked by dollar impact + how
                hard each one is to fix. No 40-item to-do list.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4 REASONS — proof-of-pain, with audience toggle ────────
            Per the 2026-05-17 Hormozi review: avatar sprawl was killing
            the section ("which of these is for me?"). FourReasonsAudience
            now ships 3 separate leak sets (manufacturer / DTC / author)
            and lets the visitor pick. ── */}
      <FourReasonsAudience />

      {/* ── TESTIMONIALS ───────────────────────────────────────────── */}
      <AuditTestimonials />

      {/* ── MEET BEN — compact. Anchor target for the above-the-fold
            trust chip ("Real person — Ben texts you within 1 hour"). ─ */}
      <section id="meet-ben" className="border-b border-white/5 bg-slate-950/60 relative overflow-hidden scroll-mt-20">
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
                I&apos;ve spent my career in law enforcement and I&apos;m based in Quilcene. I started BlueJays because too many product owners get burned by agencies that ghost after the invoice.{" "}
                <span className="text-white font-semibold">
                  I answer my phone. I don&apos;t disappear.
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── SCARCITY FOOTER — live count ───────────────────────────── */}
      <section className="border-b border-white/5 bg-gradient-to-b from-amber-950/15 to-transparent">
        <div className="mx-auto max-w-3xl px-6 py-12 md:py-14 text-center">
          <p className="text-xs uppercase tracking-wider text-amber-400 font-bold mb-3">
            Heads up
          </p>
          <p className="text-base md:text-lg text-slate-300 leading-relaxed">
            If you&apos;d like to be one of the businesses I&apos;ll be building
            custom software for this month —{" "}
            <span className="text-white font-semibold">
              let&apos;s see if we&apos;re a good fit.
            </span>{" "}
            Start with the free audit and we&apos;ll go from there.
          </p>
          <div className="mt-5">
            <AuditLiveSlots variant="inline" />
          </div>
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
