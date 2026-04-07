"use client";

import { motion } from "framer-motion";
import BluejayLogo from "./BluejayLogo";

/* ───────────────────────── SVG Icons ───────────────────────── */

const BoltIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
  </svg>
);

const PaletteIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c1.1 0 2-.9 2-2 0-.52-.2-1-.54-1.36-.33-.37-.53-.86-.53-1.39 0-1.1.9-2 2-2h2.36c3.07 0 5.64-2.57 5.64-5.64C23.64 5.82 18.52 2 12 2z" />
    <circle cx="7.5" cy="11.5" r="1.5" />
    <circle cx="10.5" cy="7.5" r="1.5" />
    <circle cx="15.5" cy="7.5" r="1.5" />
    <circle cx="17.5" cy="11.5" r="1.5" />
  </svg>
);

const DevicePhoneMobileIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
  </svg>
);

const EyeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

/* ───────────────────────── Grid Pattern ───────────────────────── */

const GridPattern = ({ opacity = 0.03 }: { opacity?: number }) => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }}>
    <defs>
      <pattern id="aboutGrid" width="60" height="60" patternUnits="userSpaceOnUse">
        <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#0ea5e9" strokeWidth="0.5" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#aboutGrid)" />
  </svg>
);

/* ───────────────────────── Data ───────────────────────── */

const features = [
  {
    icon: <BoltIcon />,
    title: "Built in Days, Not Months",
    description:
      "Our streamlined process delivers a polished site faster than any traditional agency. Most sites are ready in under 48 hours.",
  },
  {
    icon: <PaletteIcon />,
    title: "Industry-Specific Design",
    description:
      "Every site is crafted for your specific industry with sections that actually matter to your customers.",
  },
  {
    icon: <DevicePhoneMobileIcon />,
    title: "Mobile-First & Lightning Fast",
    description:
      "Every site scores 90+ on Google PageSpeed. Your customers find you on their phones — we make sure it looks perfect.",
  },
  {
    icon: <EyeIcon />,
    title: "See It Before You Pay",
    description:
      "We build your site first and show you a live preview. Only pay if you love it. Zero risk.",
  },
];

/* ───────────────────────── Main Component ───────────────────────── */

export default function About() {
  return (
    <section className="py-28 relative overflow-hidden bg-[#050a14]">
      {/* Background */}
      <GridPattern opacity={0.025} />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[15%] right-[5%] w-[500px] h-[500px] rounded-full bg-sky-500/[0.06] blur-[160px]" />
        <div className="absolute bottom-[15%] left-[15%] w-[450px] h-[450px] rounded-full bg-blue-700/[0.08] blur-[140px]" />
        <BluejayLogo size={220} className="absolute bottom-[8%] right-[2%] opacity-[0.04] text-sky-500 -rotate-12" />
      </div>

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="grid md:grid-cols-2 gap-20 items-center">
          {/* Left — text content */}
          <div>
            {/* Section header */}
            <motion.span
              initial={{ opacity: 0, y: -10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-block text-sky-400 text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border border-sky-500/20 bg-sky-500/5"
            >
              Who We Are
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4"
            >
              Your business deserves a website that{" "}
              <span className="text-sky-400">works</span> as hard as you do
            </motion.h2>
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="h-0.5 w-16 bg-gradient-to-r from-sky-500 to-transparent mb-6"
            />
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="text-white/50 text-lg leading-relaxed mb-4"
            >
              Most local businesses either have an outdated website or no site at
              all. We change that. BlueJays builds premium, modern websites
              tailored to your industry — and we show you the finished product
              before you pay a dime.
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="text-white/50 text-lg leading-relaxed"
            >
              No templates that look like everyone else. No hidden fees. No
              waiting months. Just a stunning website that brings in customers,
              delivered fast.
            </motion.p>
          </div>

          {/* Right — feature cards */}
          <div className="space-y-5">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
                className="group relative flex gap-5 p-5 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:border-sky-500/30 transition-all duration-500 overflow-hidden"
              >
                {/* Hover glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_0%_50%,rgba(14,165,233,0.08),transparent_70%)]" />
                {/* Top accent line */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sky-400/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative z-10 flex gap-5">
                  {/* Number + Icon */}
                  <div className="shrink-0 flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 group-hover:bg-sky-500/20 group-hover:border-sky-500/40 transition-all duration-300">
                      {feature.icon}
                    </div>
                    <span className="text-2xl font-extrabold text-white/[0.04] group-hover:text-sky-500/10 transition-colors duration-300 leading-none">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1.5 group-hover:text-sky-300 transition-colors duration-300">
                      {feature.title}
                    </h3>
                    <p className="text-white/40 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
