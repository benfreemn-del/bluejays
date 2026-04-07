"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import BluejayLogo from "./BluejayLogo";

/* ───────────────────────── SVG Icons ───────────────────────── */

const WebsiteIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
    <path d="M3.6 9h16.8M3.6 15h16.8" />
    <path d="M12 3a15.3 15.3 0 014 9 15.3 15.3 0 01-4 9 15.3 15.3 0 01-4-9 15.3 15.3 0 014-9z" />
  </svg>
);

const IndustryIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

const ImpressionsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const SatisfactionIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

/* ───────────────────────── Grid Pattern ───────────────────────── */

const GridPattern = ({ opacity = 0.03 }: { opacity?: number }) => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }}>
    <defs>
      <pattern id="statsGrid" width="60" height="60" patternUnits="userSpaceOnUse">
        <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#0ea5e9" strokeWidth="0.5" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#statsGrid)" />
  </svg>
);

/* ───────────────────────── Counter ───────────────────────── */

interface CounterProps {
  target: number;
  suffix?: string;
  label: string;
  icon: React.ReactNode;
  delay?: number;
}

function Counter({ target, suffix = "", label, icon, delay = 0 }: CounterProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const duration = 2000;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, target]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      className="group relative text-center p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:border-sky-500/30 transition-all duration-500"
    >
      {/* Hover glow */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,rgba(14,165,233,0.08),transparent_70%)]" />
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sky-400/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative z-10">
        <div className="w-14 h-14 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 mx-auto mb-4 group-hover:bg-sky-500/20 group-hover:border-sky-500/40 transition-all duration-300">
          {icon}
        </div>
        <p className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
          {count.toLocaleString()}
          {suffix}
        </p>
        <p className="text-white/40 mt-2 text-sm font-semibold uppercase tracking-wider">
          {label}
        </p>
      </div>
    </motion.div>
  );
}

/* ───────────────────────── Main Component ───────────────────────── */

export default function Stats() {
  return (
    <section
      className="py-28 relative overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #081424 0%, #0c2040 50%, #081424 100%)",
      }}
    >
      {/* Background */}
      <GridPattern opacity={0.03} />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] rounded-full bg-sky-500/[0.06] blur-[200px]" />
        <div className="absolute top-[10%] right-[10%] w-[400px] h-[400px] rounded-full bg-blue-700/[0.08] blur-[140px]" />
        <div className="absolute bottom-[10%] left-[10%] w-[350px] h-[350px] rounded-full bg-sky-600/[0.05] blur-[130px]" />
        <BluejayLogo size={280} className="absolute top-[3%] left-[50%] -translate-x-1/2 opacity-[0.035] text-sky-500" />
      </div>

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        {/* Section header */}
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block text-sky-400 text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border border-sky-500/20 bg-sky-500/5"
          >
            By The Numbers
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-extrabold tracking-tight"
          >
            Results that{" "}
            <span className="text-sky-400">speak for themselves</span>
          </motion.h2>
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="h-0.5 w-16 bg-gradient-to-r from-sky-500 to-transparent mt-4 mx-auto"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <Counter target={150} suffix="+" label="Websites Built" icon={<WebsiteIcon />} delay={0} />
          <Counter target={30} label="Industries Served" icon={<IndustryIcon />} delay={0.1} />
          <Counter target={2} suffix="M+" label="Impressions Generated" icon={<ImpressionsIcon />} delay={0.2} />
          <Counter target={98} suffix="%" label="Client Satisfaction" icon={<SatisfactionIcon />} delay={0.3} />
        </div>
      </div>
    </section>
  );
}
