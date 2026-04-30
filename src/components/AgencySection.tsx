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
  { label: "AI-Powered Website", desc: "Full custom site, built and deployed" },
  { label: "Email Automation", desc: "Sequences that nurture leads while you sleep" },
  { label: "SMS Follow-Up", desc: "Instant texts to every new inquiry" },
  { label: "AI Chat Widget", desc: "Answers questions, captures leads 24/7" },
  { label: "Lead Capture Funnels", desc: "Forms, landing pages, and booking flows" },
  { label: "Local SEO Setup", desc: "Google Business, schema, and on-page SEO" },
];

export default function AgencySection() {
  return (
    <section className="relative overflow-hidden bg-[#050a14] py-24 px-6">
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
              Full AI Marketing System
            </span>

            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-[1.1] mb-5">
              Replace your agency.{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: "linear-gradient(135deg, #a78bfa 0%, #818cf8 50%, #c4b5fd 100%)" }}
              >
                Keep the results.
              </span>
            </h2>

            <p className="text-white/50 text-lg leading-relaxed mb-8 max-w-lg">
              Most marketing agencies charge $3,000–$8,000 per month and own everything. We build the complete AI marketing engine — website, email, SMS, chat, funnels — hand it over, and you own it forever.
            </p>

            {/* Price callout */}
            <div className="inline-flex items-baseline gap-3 mb-8 px-5 py-3 rounded-2xl border border-violet-500/20 bg-violet-500/[0.06]">
              <span className="text-white/40 text-sm line-through">$36,000+/year agency fees</span>
              <span className="text-white font-extrabold text-2xl">One-time from $9,700</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="/agency"
                className="inline-flex items-center justify-center gap-2 h-12 px-7 rounded-full font-bold text-sm text-white transition-all duration-300 hover:shadow-[0_0_40px_rgba(139,92,246,0.45)] active:scale-[0.97]"
                style={{ background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)" }}
              >
                See what&apos;s included
                <ArrowIcon />
              </a>
              <a
                href="/get-started"
                className="inline-flex items-center justify-center gap-2 h-12 px-7 rounded-full border border-white/10 text-white/70 hover:text-white hover:border-white/20 font-semibold text-sm transition-all duration-300"
              >
                Start with a website first
              </a>
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
                <span className="text-white/60 text-sm font-semibold">Everything included</span>
                <span className="text-xs text-violet-400 font-bold px-2.5 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20">
                  Yours forever
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
                  A typical agency charges $3K–$8K/mo and owns all of it.{" "}
                  <span className="text-violet-400 font-semibold">You keep everything we build.</span>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
