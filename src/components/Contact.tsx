"use client";

import { motion } from "framer-motion";
import BluejayLogo from "./BluejayLogo";

/* ───────────────────────── SVG Icons ───────────────────────── */

const ArrowRightIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
  </svg>
);

const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
    <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
    <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const SparklesIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
    <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
  </svg>
);

/* ───────────────────────── Grid Pattern ───────────────────────── */

const GridPattern = ({ opacity = 0.03 }: { opacity?: number }) => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }}>
    <defs>
      <pattern id="contactGrid" width="60" height="60" patternUnits="userSpaceOnUse">
        <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#0ea5e9" strokeWidth="0.5" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#contactGrid)" />
  </svg>
);

/* ───────────────────────── Main Component ───────────────────────── */

export default function Contact() {
  return (
    <section
      id="contact"
      className="py-32 relative overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #050a14 0%, #0a1830 50%, #050a14 100%)",
      }}
    >
      {/* Background */}
      <GridPattern opacity={0.02} />
      <div className="absolute inset-0 pointer-events-none">
        {/* Big central glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] rounded-full bg-sky-500/[0.1] blur-[200px]" />
        <div className="absolute bottom-[5%] right-[10%] w-[350px] h-[350px] rounded-full bg-blue-700/[0.08] blur-[120px]" />

        {/* BluejayLogo decorative */}
        <BluejayLogo size={180} className="absolute top-[10%] left-[4%] opacity-[0.04] text-sky-500 rotate-6" />
        <BluejayLogo size={120} className="absolute bottom-[15%] right-[6%] opacity-[0.03] text-sky-400 -rotate-12" />

        {/* Radial circle rings */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.04]" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid meet">
          <circle cx="400" cy="250" r="60" stroke="#0ea5e9" strokeWidth="0.5" fill="none" />
          <circle cx="400" cy="250" r="120" stroke="#0ea5e9" strokeWidth="0.4" fill="none" />
          <circle cx="400" cy="250" r="190" stroke="#0ea5e9" strokeWidth="0.3" fill="none" />
          <circle cx="400" cy="250" r="270" stroke="#0ea5e9" strokeWidth="0.2" fill="none" />
          <circle cx="400" cy="250" r="360" stroke="#0ea5e9" strokeWidth="0.15" fill="none" />
        </svg>
      </div>

      <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
        {/* Section header */}
        <motion.span
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-block text-sky-400 text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border border-sky-500/20 bg-sky-500/5"
        >
          Get Started
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4"
        >
          Ready to see your{" "}
          <span className="text-sky-400">new website</span>?
        </motion.h2>
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="h-0.5 w-16 bg-gradient-to-r from-sky-500 to-transparent mt-4 mx-auto mb-6"
        />
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-white/50 text-lg mb-10 max-w-xl mx-auto leading-relaxed"
        >
          We&apos;ll build it first and show you a live preview — completely
          free. No commitment, no credit card required.
        </motion.p>

        {/* CTA button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <a
            href="/get-started"
            className="group relative inline-flex items-center justify-center h-16 px-10 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold text-lg hover:shadow-[0_0_60px_rgba(14,165,233,0.5)] transition-all duration-500"
          >
            {/* Glow ring behind button */}
            <span className="absolute inset-[-3px] rounded-full bg-gradient-to-r from-sky-400 to-blue-500 opacity-0 group-hover:opacity-30 blur-md transition-opacity duration-500" />
            <span className="relative flex items-center gap-3">
              Claim Your Free Preview
              <span className="group-hover:translate-x-1 transition-transform duration-300">
                <ArrowRightIcon />
              </span>
            </span>
          </a>
        </motion.div>

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="flex flex-wrap items-center justify-center gap-6 mt-10"
        >
          <div className="flex items-center gap-2 text-white/40 text-sm">
            <span className="text-sky-400"><ClockIcon /></span>
            Typically delivered within 48 hours
          </div>
          <div className="flex items-center gap-2 text-white/40 text-sm">
            <span className="text-sky-400"><ShieldIcon /></span>
            No credit card required
          </div>
          <div className="flex items-center gap-2 text-white/40 text-sm">
            <span className="text-sky-400"><SparklesIcon /></span>
            100% satisfaction guaranteed
          </div>
        </motion.div>
      </div>
    </section>
  );
}
