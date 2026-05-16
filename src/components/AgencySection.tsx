"use client";

import { motion } from "framer-motion";

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 flex-shrink-0">
    <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
    <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const INCLUDED = [
  { label: "Ads That Get Smarter", desc: "Winners get more money. Losers get cut. You don't touch it." },
  { label: "Everything Talks To Everything", desc: "Ads → site → email → text → voicemail — all sharing the same brain" },
  { label: "Smart Website", desc: "Tracks every click and feeds the results back to your ads" },
  { label: "Auto Email + Text", desc: "Sequences that get sharper as more people reply" },
  { label: "Lead-Catching Quizzes", desc: "Every form, click, and drop-off makes the next one better" },
  { label: "Monthly Report", desc: "Plain numbers that show the system getting smarter" },
];

export default function AgencySection() {
  return (
    <section className="relative overflow-hidden bg-[#050a14] py-14 md:py-24 px-6">
      {/* Background atmosphere */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full bg-violet-600/[0.06] blur-[140px]" />
        <div className="absolute bottom-0 right-[10%] w-[600px] h-[400px] rounded-full bg-indigo-700/[0.07] blur-[120px]" />
        {/* Subtle grid */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.025]">
          <defs>
            <pattern id="agencyGrid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#a78bfa" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#agencyGrid)" />
        </svg>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Two-column layout */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Left — copy */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <span className="inline-flex items-center gap-2 text-violet-400 text-xs font-bold uppercase tracking-[0.25em] mb-5 px-4 py-1.5 rounded-full border border-violet-500/20 bg-violet-500/[0.06]">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
              Self-Learning AI Marketing System
            </span>

            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-[1.1] mb-5">
              100 real leads in 90 days.{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: "linear-gradient(135deg, #a78bfa 0%, #818cf8 50%, #c4b5fd 100%)" }}
              >
                Or we work free until you get them.
              </span>
            </h2>

            <p className="text-white/50 text-lg leading-relaxed mb-8 max-w-lg">
              One system that runs your ads, website, emails, texts, and voicemails. Every week it figures out what works for your customers and does more of it. You don&apos;t touch a thing. We bet the deal on a number — most agencies won&apos;t.
            </p>

            {/* Guarantee + price callout — Hormozi review #5 (2026-05-14).
                Outcome FIRST (emerald guarantee row), price SECOND (violet
                price strip). Reverses the original visual hierarchy so the
                $10,000 anchors against a stated outcome instead of leading
                with the number. */}
            <div className="flex flex-col gap-2 mb-8">
              <div className="inline-flex flex-wrap items-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/[0.08] w-fit max-w-full">
                <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider">Guaranteed outcome</span>
                <span className="text-white text-sm font-semibold">100 qualified leads in 90 days — or we work free</span>
              </div>
              <div className="flex flex-wrap items-baseline gap-2 px-5 py-3 rounded-2xl border border-violet-500/20 bg-violet-500/[0.06] w-fit">
                <span className="text-white/40 text-sm line-through">$36,000+/yr agency fees</span>
                <span className="text-white font-extrabold text-xl md:text-2xl">$10,000 one-time</span>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {/* PROMOTED CTA — agency cost calculator. Highest-intent
                  conversion path right now (Hormozi calculator funnel
                  feeding the agency-replacement Google Ads campaign).
                  Promoted hard 2026-05-06 per Ben — calculator funnel
                  converts 3-8x generic landing-page CTAs.

                  Visual treatment vs the other two buttons:
                  - "Most chosen" eyebrow pill above
                  - h-14 (vs h-12 below) + text-base (vs text-sm)
                  - Pulsing amber halo ring behind (CSS keyframe in
                    style jsx) + bigger shadow glow
                  - Animated chevron that nudges right on hover
                  Other 2 demoted to "Or, if you'd rather:" footer row
                  with smaller h-10 + subdued styling. */}
              <style jsx>{`
                @keyframes cma-halo-pulse {
                  0%, 100% {
                    box-shadow:
                      0 0 0 0 rgba(251, 191, 36, 0.55),
                      0 12px 36px -8px rgba(251, 191, 36, 0.45);
                  }
                  50% {
                    box-shadow:
                      0 0 0 12px rgba(251, 191, 36, 0),
                      0 16px 48px -6px rgba(251, 191, 36, 0.6);
                  }
                }
                @media (prefers-reduced-motion: reduce) {
                  .cma-halo {
                    animation: none !important;
                  }
                }
                .cma-halo {
                  animation: cma-halo-pulse 2.6s ease-in-out infinite;
                }
                .cma-chevron {
                  transition: transform 0.25s ease-out;
                }
                .cma-cta:hover .cma-chevron {
                  transform: translateX(4px);
                }
              `}</style>

              {/* Eyebrow pill — "Most chosen path" tag */}
              <div className="inline-flex items-center gap-2 self-start px-3 py-1 rounded-full border border-amber-400/40 bg-amber-400/[0.08] text-amber-300 text-[11px] font-bold uppercase tracking-widest">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75 animate-ping" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-400" />
                </span>
                Best place to start · 60 seconds
              </div>

              <a
                href="/cut-my-agency"
                className="cma-cta cma-halo inline-flex items-center justify-center gap-2.5 h-14 sm:h-16 px-8 rounded-full font-extrabold text-base sm:text-lg text-amber-950 transition-all duration-300 active:scale-[0.97] w-full sm:w-fit"
                style={{
                  background: "linear-gradient(135deg, #fcd34d 0%, #fbbf24 50%, #f59e0b 100%)",
                }}
              >
                <span className="text-xl">💰</span>
                See how much you&apos;d save
                <span className="cma-chevron"><ArrowIcon /></span>
              </a>
              <p className="text-white/40 text-xs -mt-2 ml-1">
                Free. No call. Real numbers based on your inputs.
              </p>

              {/* Demoted secondary row — clearly subordinate to the
                  calculator above. Smaller height, smaller text,
                  outline-only treatment so the calculator pops. */}
              <div className="flex items-center gap-3 mt-2">
                <span className="text-white/30 text-[11px] uppercase tracking-widest font-semibold">Or</span>
                <div className="flex-1 h-px bg-white/[0.06]" />
              </div>
              <div className="flex flex-col sm:flex-row gap-2.5">
                <a
                  href="/agency"
                  className="inline-flex items-center justify-center gap-1.5 h-10 px-5 rounded-full border border-violet-500/30 bg-violet-500/[0.06] text-violet-200 hover:bg-violet-500/[0.12] hover:border-violet-500/50 font-semibold text-xs transition-all duration-300"
                >
                  See how the system works
                </a>
                <a
                  href="/get-started"
                  className="inline-flex items-center justify-center gap-1.5 h-10 px-5 rounded-full border border-white/10 text-white/55 hover:text-white/85 hover:border-white/20 font-semibold text-xs transition-all duration-300"
                >
                  Start with a website first
                </a>
              </div>
            </div>
          </motion.div>

          {/* Right — feature grid card */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="relative"
          >
            {/* Glow ring behind card */}
            <div className="absolute -inset-px rounded-3xl bg-gradient-to-br from-violet-500/20 via-indigo-500/10 to-transparent blur-sm" />

            <div className="relative rounded-3xl border border-white/[0.07] bg-white/[0.03] backdrop-blur-sm overflow-hidden">
              {/* Top bar */}
              <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
                <span className="text-white/60 text-sm font-semibold">The system that runs itself</span>
                <span className="text-xs text-violet-400 font-bold px-2.5 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20">
                  Gets smarter weekly
                </span>
              </div>

              {/* Feature list */}
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {INCLUDED.map((item) => (
                  <div key={item.label} className="flex items-start gap-3 group">
                    <div className="mt-0.5 w-6 h-6 rounded-full bg-violet-500/15 border border-violet-500/25 flex items-center justify-center text-violet-400 flex-shrink-0 group-hover:bg-violet-500/25 transition-colors">
                      <CheckIcon />
                    </div>
                    <div>
                      <p className="text-white text-sm font-semibold leading-snug">{item.label}</p>
                      <p className="text-white/40 text-xs mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom comparison bar */}
              <div className="px-6 py-4 border-t border-white/[0.06] bg-white/[0.02]">
                <p className="text-white/35 text-xs text-center leading-relaxed">
                  Agencies run it manually. This runs itself.{" "}
                  <span className="text-violet-400 font-semibold">Every week it learns. Every month it compounds.</span>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
