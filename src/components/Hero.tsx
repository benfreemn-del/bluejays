"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import BluejayLogo, { BluejayLogoCircle } from "./BluejayLogo";

/* ───────────────────────── Types ───────────────────────── */

type SiteGroup = "manufacturer" | "author" | "service";

interface SiteCard {
  name: string;
  category: string;
  color: string;
  href: string;
  icon: string;
  tagline: string;
  group: SiteGroup;
}

/* ───────────────────────── Grid Pattern ───────────────────────── */

const GridPattern = ({ opacity = 0.04 }: { opacity?: number }) => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }}>
    <defs>
      <pattern id="heroGrid" width="60" height="60" patternUnits="userSpaceOnUse">
        <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#0ea5e9" strokeWidth="0.5" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#heroGrid)" />
  </svg>
);

/* ───────────────────────── Arrow Icon ───────────────────────── */

const ArrowUpRightIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
    <path d="M7 17L17 7M17 7H7M17 7v10" />
  </svg>
);

/* ───────────────────────── Phrases ───────────────────────── */

const phrases = ["BlueJays Stand Out", "See For Yourself"];

/* ───────────────────────── Main Component ───────────────────────── */

type SlotStats = { used: number; cap: number; remaining: number; monthLabel: string };

export default function Hero() {
  const [phase, setPhase] = useState(0);
  const [bubbleVisible, setBubbleVisible] = useState(true);
  const [cards] = useState<SiteCard[]>(defaultSiteCards);

  // Live slot count for the urgency line. Falls back to a generic
  // "limited slots remaining" string if the API errors or DB isn't
  // configured. Powered by /api/agency/slots-remaining (Hormozi
  // backend review A2, 2026-05-16).
  const [slots, setSlots] = useState<SlotStats | null>(null);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 2500),
      setTimeout(() => setBubbleVisible(false), 5000),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/agency/slots-remaining", { cache: "no-store" });
        const j = (await res.json()) as { ok?: boolean } & SlotStats;
        if (!cancelled && j.ok !== false) {
          setSlots({
            used: j.used ?? 0,
            cap: j.cap ?? 10,
            remaining: j.remaining ?? 10,
            monthLabel: j.monthLabel ?? new Date().toLocaleString("en-US", { month: "long", year: "numeric" }),
          });
        }
      } catch {
        // Stay on the static fallback if the API fails.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Portfolio shows only curated showcase cards — not every generated prospect
  // Dynamic prospects are managed in the dashboard, not the public portfolio

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#050a14]">
      {/* ── Layered background ── */}
      <div className="absolute inset-0">
        {/* Base gradient */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 50% 20%, #0c2d4a 0%, #081828 40%, #050a14 70%)",
          }}
        />
        {/* Grid */}
        <GridPattern opacity={0.035} />
        {/* BluejayLogo silhouettes -- slightly more visible */}
        <BluejayLogo size={340} className="absolute top-[3%] left-[1%] opacity-[0.07] text-sky-500" />
        <BluejayLogo size={260} className="absolute top-[8%] right-[3%] opacity-[0.05] text-sky-400 rotate-12" />
        <BluejayLogo size={200} className="absolute bottom-[12%] left-[6%] opacity-[0.045] text-sky-500 -rotate-12" />
        <BluejayLogo size={160} className="absolute bottom-[22%] right-[12%] opacity-[0.035] text-sky-400 rotate-6" />
        {/* Big blue glows */}
        <div className="absolute top-[8%] left-[15%] w-[700px] h-[700px] rounded-full bg-sky-500/[0.12] blur-[180px]" />
        <div className="absolute top-[35%] right-[8%] w-[550px] h-[550px] rounded-full bg-blue-700/[0.15] blur-[150px]" />
        <div className="absolute bottom-[5%] left-[25%] w-[550px] h-[550px] rounded-full bg-sky-600/[0.08] blur-[170px]" />
        <div className="absolute top-[18%] left-[45%] w-[450px] h-[450px] rounded-full bg-cyan-500/[0.06] blur-[160px]" />
      </div>

      {/* ── Nav ── */}
      <nav
        className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-4 md:px-8 py-4 md:py-5"
      >
        <div className="flex items-center gap-2 md:gap-3">
          <BluejayLogoCircle size={36} className="md:w-[42px] md:h-[42px]" />
          <span className="text-lg md:text-xl font-bold text-white tracking-tight">BlueJays</span>
        </div>
        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-5">
          <a href="/agency" className="text-sm text-violet-400/80 hover:text-violet-300 transition-colors duration-300 font-medium">AI Marketing System</a>
          <a href="/login" className="text-sm text-white/60 hover:text-white transition-colors duration-300 font-medium">Login</a>
          <a href="/get-started" className="group relative h-10 px-6 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 text-white text-sm font-semibold flex items-center gap-2 hover:shadow-[0_0_30px_rgba(14,165,233,0.5)] transition-all duration-300">
            Request a Free Website <ArrowUpRightIcon />
          </a>
        </div>
        {/* Mobile nav — hamburger */}
        <div className="md:hidden flex items-center gap-3">
          <a href="/get-started" className="h-9 px-4 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 text-white text-xs font-semibold flex items-center">
            Free Website
          </a>
          <details className="relative">
            <summary className="list-none cursor-pointer p-2">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-6 h-6">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </summary>
            <div className="absolute right-0 top-12 w-48 py-2 rounded-xl bg-[#0a1628]/95 backdrop-blur-xl border border-white/10 shadow-2xl z-50">
              {/* Public links — always visible */}
              <a href="/get-started" className="block px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5">Request a Free Website</a>
              <a href="/agency" className="block px-4 py-2.5 text-sm text-violet-400/80 hover:text-violet-300 hover:bg-white/5">AI Marketing System</a>
              <a href="/login" className="block px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5">Login</a>
            </div>
          </details>
        </div>
      </nav>

      {/* ── Animated bubble with bird on branch ── */}
      <AnimatePresence>
        {bubbleVisible && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute z-20 flex items-center justify-center top-[15%] left-1/2 -translate-x-1/2"
          >
            <div className="relative w-72 h-72 md:w-[340px] md:h-[340px] rounded-full bg-gradient-to-br from-sky-400 via-sky-500 to-blue-700 flex items-center justify-center shadow-[0_0_120px_rgba(14,165,233,0.6),0_0_250px_rgba(14,165,233,0.2)]">
              {/* Decorative rings */}
              <div className="absolute inset-[-6px] rounded-full border border-sky-300/25" />
              <div className="absolute inset-[-14px] rounded-full border border-sky-300/15" />
              <div className="absolute inset-[-24px] rounded-full border border-sky-300/8" />

              {/* Branch extending from bubble with leaf — shakes when bird leaves */}
              <motion.svg
                className="absolute -right-16 top-[15%] w-32 h-24"
                viewBox="0 0 130 100"
                fill="none"
                animate={phase >= 1 ? { rotate: [0, 2, -1.5, 1, -0.5, 0], y: [0, 1, -1, 0.5, 0] } : {}}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                {/* Branch */}
                <path d="M0 55 Q30 50 60 45 Q90 40 115 30" stroke="#8B6914" strokeWidth="3" strokeLinecap="round" />
                <path d="M0 58 Q30 53 60 48 Q90 43 115 33" stroke="#6B4F10" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
                {/* Small twig */}
                <path d="M70 44 Q80 30 90 25" stroke="#8B6914" strokeWidth="2" strokeLinecap="round" />
                {/* Leaf on branch */}
                <path d="M85 22 Q95 12 105 18 Q95 28 85 22Z" fill="#22c55e" opacity="0.7" />
                <path d="M85 22 Q95 20 105 18" stroke="#16a34a" strokeWidth="0.5" opacity="0.5" />
                {/* Second leaf */}
                <path d="M55 38 Q60 28 70 33 Q60 42 55 38Z" fill="#22c55e" opacity="0.5" />
              </motion.svg>

              {/* Bird on branch — flaps wings and flies away FAST at phase 1 */}
              <motion.div
                className="absolute -right-4 top-[11%] z-10"
                initial={{ x: 0, y: 0, rotate: 0 }}
                animate={phase >= 1 ? {
                  x: [0, -5, 15, 60, 150, 350, 700],
                  y: [0, -8, -25, -60, -120, -200, -300],
                  rotate: [0, -8, -15, -20, -15, -10, -5],
                  opacity: [1, 1, 1, 1, 0.9, 0.6, 0],
                  scale: [1, 1.05, 1, 0.95, 0.85, 0.7, 0.5],
                } : {
                  y: [0, -2, 0, -1, 0],
                }}
                transition={phase >= 1 ? {
                  duration: 1.2,
                  ease: [0.2, 0.8, 0.4, 1],
                } : {
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <svg width="60" height="60" viewBox="0 0 120 120" className="drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
                  {/* Body */}
                  <ellipse cx="60" cy="62" rx="22" ry="18" fill="#3b82f6" />
                  <ellipse cx="60" cy="68" rx="15" ry="11" fill="#93c5fd" opacity="0.5" />
                  {/* Head */}
                  <circle cx="62" cy="38" r="16" fill="#3b82f6" />
                  <circle cx="62" cy="38" r="14" fill="#60a5fa" opacity="0.3" />
                  {/* Crest — spiky and detailed */}
                  <path d="M58 24 L52 8 L56 20 L48 4 L55 18 L44 10 L54 22" fill="#2563eb" />
                  <path d="M60 22 L56 6 L58 18" fill="#1d4ed8" opacity="0.7" />
                  {/* Eye — big and expressive */}
                  <circle cx="70" cy="35" r="7" fill="white" />
                  <circle cx="71" cy="34" r="4" fill="#0f172a" />
                  <circle cx="72.5" cy="32.5" r="1.5" fill="white" />
                  <circle cx="69" cy="36" r="0.8" fill="white" opacity="0.5" />
                  {/* Beak */}
                  <path d="M76 40 L92 37 L76 44Z" fill="#1e293b" />
                  <path d="M76 41 L88 39" stroke="#334155" strokeWidth="0.5" />
                  {/* Black mask/necklace */}
                  <path d="M46 48 Q62 56 78 48" stroke="#0f172a" strokeWidth="3" fill="none" />
                  <path d="M48 50 Q62 56 76 50" fill="#0f172a" opacity="0.3" />
                  {/* Wing — with CSS animation for flapping */}
                  <g className={phase >= 1 ? "animate-[flapWing_0.15s_ease-in-out_infinite]" : ""}>
                    <path d="M38 52 Q24 42 18 28 Q22 38 28 44 L38 55Z" fill="#1d4ed8" />
                    <path d="M36 56 Q20 50 12 38 Q18 48 26 54 L36 58Z" fill="#2563eb" />
                    <path d="M34 58 Q18 56 8 48 Q16 56 24 60 L34 60Z" fill="#3b82f6" opacity="0.8" />
                    {/* Wing bars — white stripes */}
                    <path d="M30 46 L22 40" stroke="white" strokeWidth="2" opacity="0.7" />
                    <path d="M28 50 L20 46" stroke="white" strokeWidth="2" opacity="0.5" />
                    <path d="M26 54 L18 50" stroke="white" strokeWidth="1.5" opacity="0.4" />
                  </g>
                  {/* Tail — long and fanned */}
                  <path d="M42 76 L24 96 L30 92 L22 104 L34 94 L28 106 L38 94 L34 102 L42 90 L44 80Z" fill="#1d4ed8" />
                  <path d="M44 78 L32 94" stroke="#2563eb" strokeWidth="1" opacity="0.5" />
                  {/* Tail bars */}
                  <path d="M36 88 L28 94" stroke="#0f172a" strokeWidth="1.5" opacity="0.3" />
                  {/* Feet — only show when perched */}
                  {phase < 1 && (
                    <>
                      <path d="M52 78 L50 88 L46 90 M50 88 L54 90 M50 88 L52 92" stroke="#78716c" strokeWidth="2" fill="none" strokeLinecap="round" />
                      <path d="M66 78 L68 88 L64 90 M68 88 L72 90 M68 88 L70 92" stroke="#78716c" strokeWidth="2" fill="none" strokeLinecap="round" />
                    </>
                  )}
                </svg>
              </motion.div>

              {/* Wing flap CSS animation */}
              <style>{`
                @keyframes flapWing {
                  0% { transform: scaleY(1) rotate(0deg); }
                  50% { transform: scaleY(-0.8) rotate(-5deg); }
                  100% { transform: scaleY(1) rotate(0deg); }
                }
              `}</style>

              {/* Text with better font styling */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={phase}
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -15, scale: 0.95 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="text-center px-10"
                >
                  <p className="text-white text-3xl md:text-4xl font-extrabold tracking-tight leading-tight" style={{ textShadow: "0 2px 20px rgba(0,0,0,0.3)" }}>
                    {phrases[phase]}
                  </p>
                  {phase === 0 && (
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: 0.5, duration: 0.6 }}
                      className="h-0.5 w-12 bg-white/30 mx-auto mt-3"
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Portfolio Grid ── */}
      <div
        className="relative z-10 w-full max-w-6xl px-6 pt-24"
      >
        {/* Value prop headline — pain-led, ICP-specific (2026-05-17).
            Previous "Your business deserves to be the obvious choice"
            was service-business-era soft aspirational copy. The locked
            ICP is now product makers + DTC brands + indie authors — and
            the customer-eye review flagged the homepage hero as the
            weakest point in the funnel vs the /audit page's sharp
            "4 Reasons Your Product Isn't Selling." This rewrite
            mirrors the /agency page's "real thing" callback so the hook
            is consistent across the cold-traffic surfaces. */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
            You make a real thing.{" "}
            <span className="text-sky-400 block">Your site isn&apos;t built to sell it.</span>
          </h1>
          <p className="text-white/65 text-lg md:text-xl mt-5 max-w-2xl mx-auto leading-relaxed">
            A premium product site in 48 hours, or the full AI marketing system — ads, funnel, customer machine — built in weeks. For product makers, DTC brands, and indie authors competing with $10K/mo agency budgets.
          </p>
          {/* Trust strip — Hormozi review #14 (2026-05-14). 3rd badge swapped
              from generic "100% risk-free" to the $10K-tier guarantee so a
              product-brand visitor sees themselves above the fold. The first
              two badges anchor the $997 website path; the third anchors the
              system path. Together they tell both buyers: yes, you're home. */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-6 text-sm text-white/40">
            <span className="flex items-center gap-1.5">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-sky-400"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              48-hour delivery
            </span>
            <span className="flex items-center gap-1.5">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-sky-400"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              Domain &amp; hosting included
            </span>
            <span className="flex items-center gap-1.5">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-emerald-400"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              100 leads in 90 days — guaranteed
            </span>
          </div>

          {/* Single primary CTA — $997 is the locked gate to the $10K AI
              System per the offer-ladder rule. AI System becomes an under-
              CTA text link so AI-System-curious visitors still have a path
              without splitting the primary attention. Second guarantee
              strip removed — the 100-leads badge in the trust strip above
              already carries the AI System risk-reversal. */}
          <div className="mt-8 flex flex-col items-center justify-center gap-3">
            <a
              href="/get-started"
              className="group inline-flex items-center justify-center gap-2 h-12 px-7 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold text-base shadow-[0_0_30px_rgba(14,165,233,0.3)] hover:shadow-[0_0_45px_rgba(14,165,233,0.55)] active:scale-[0.97] transition-all duration-300"
            >
              Build my website — $997
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
            <p className="text-sm text-white/55">
              Already running ads?{" "}
              <a
                href="/agency"
                className="text-sky-300 hover:text-sky-200 underline underline-offset-2 font-medium transition-colors"
              >
                See the full AI marketing system →
              </a>
            </p>
          </div>

          {/* Urgency / scarcity line — Hormozi review #7 (2026-05-14).
              Live slot count via /api/agency/slots-remaining (review A2,
              2026-05-16): pulls real fullsystem-tier paid prospects this
              month and renders "X of 10 remaining." Falls back to a
              generic "limited slots remaining" string if the API errors
              so the page never shows fake numbers. */}
          <p className="mt-3 text-xs text-white/35 tracking-wide">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 mr-1.5 align-middle animate-pulse" />
            {slots ? (
              <>
                {slots.monthLabel} · {slots.remaining > 0 ? (
                  <>
                    <span className="text-amber-300/80 font-semibold">{slots.remaining} of {slots.cap}</span>{" "}
                    AI system build slots remaining
                  </>
                ) : (
                  <>
                    <span className="text-rose-300/80 font-semibold">{slots.cap} of {slots.cap}</span>{" "}
                    AI system builds taken — next slot rolls to next month
                  </>
                )}
              </>
            ) : (
              <>
                {new Date().toLocaleString("en-US", { month: "long", year: "numeric" })} · only 10 AI system builds per month — limited slots remaining
              </>
            )}
          </p>
        </div>

        {/* Section header */}
        <div className="text-center mb-12">
          <span
            className="inline-block text-sky-400 text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border border-sky-500/20 bg-sky-500/5"
          >
            Our Portfolio
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
            Websites that{" "}
            <span className="text-sky-400">win customers</span>
          </h2>
          <div className="h-0.5 w-16 bg-gradient-to-r from-sky-500 to-transparent mt-4 mx-auto" />
          <p className="text-white/50 mt-4 text-lg max-w-xl mx-auto">
            Real websites we built for real businesses. Click any card to explore.
          </p>
        </div>

        {/* Local CSS for the Custom Builds <details> dropdown — rotates the
            chevron + swaps "Click to expand" ↔ "Hide" when the parent's
            [open] attribute toggles. Inline (vs <style jsx>) per the
            Turbopack hang rule in CLAUDE.md. */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              .bj-dropdown summary { list-style: none; cursor: pointer; }
              .bj-dropdown summary::-webkit-details-marker { display: none; }
              .bj-dropdown .bj-chevron { transition: transform 0.2s ease; }
              .bj-dropdown[open] .bj-chevron { transform: rotate(180deg); }
              .bj-dropdown .bj-when-open { display: none; }
              .bj-dropdown[open] .bj-when-closed { display: none; }
              .bj-dropdown[open] .bj-when-open { display: inline-flex; }
            `,
          }}
        />

        {/* Cards — grouped by vertical (Hormozi review #16, 2026-05-14).
            Manufacturer group stays always-visible (4 product builds, the
            page's primary anchor). Custom Builds group becomes a native
            <details> dropdown so the homepage doesn't open with 12 cards
            stacked — visitor sees the 4 manufacturer builds + a clearly-
            labeled "show all custom builds (12)" summary they can click
            to expand. Per Ben 2026-05-15. */}
        {(["manufacturer", "author", "service"] as SiteGroup[]).map((g) => {
          const groupCards = cards.filter((c) => c.group === g);
          if (groupCards.length === 0) return null;
          const meta = GROUP_META[g];

          const headerEyebrow = (
            <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.18em] px-3 py-1 rounded-full border ${meta.ring} ${meta.accent}`}>
              <span>{meta.eyebrow}</span>
              {meta.label}
            </span>
          );
          const headerCount = (
            <span className="text-white/25 text-xs">
              {groupCards.length} {groupCards.length === 1 ? "build" : "builds"}
            </span>
          );

          const grid = (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {groupCards.map((site) => {
                  const isExternal = site.href.startsWith("http");
                  return (
                    <a
                      key={site.name}
                      href={site.href}
                      target={isExternal ? "_blank" : undefined}
                      rel={isExternal ? "noopener noreferrer" : undefined}
                      className="group relative rounded-2xl overflow-hidden bg-white/[0.03] border border-white/[0.06] cursor-pointer hover:border-sky-500/40 transition-all duration-500 hover:shadow-[0_12px_50px_rgba(14,165,233,0.3)]"
                    >
                      {/* Thumbnail area */}
                      <div
                        className="aspect-[4/3] relative overflow-hidden"
                        style={{
                          background: `linear-gradient(135deg, ${site.color} 0%, ${site.color}dd 100%)`,
                        }}
                      >
                        {/* Icon */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-7xl opacity-40 group-hover:opacity-60 group-hover:scale-125 transition-all duration-500">
                            {site.icon}
                          </span>
                        </div>
                        {/* Mock browser chrome */}
                        <div className="absolute top-3 left-3 right-3 flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-white/20" />
                          <div className="w-2 h-2 rounded-full bg-white/15" />
                          <div className="w-2 h-2 rounded-full bg-white/10" />
                          <div className="flex-1 h-3 rounded-full bg-white/[0.06] ml-2" />
                        </div>
                        {/* Gradient overlay */}
                        <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                        {/* Category pill */}
                        <div className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-black/40 backdrop-blur-sm text-[10px] text-white/80 font-semibold tracking-wide border border-white/10">
                          {site.category}
                        </div>
                        {/* Hover overlay with "View Site" */}
                        <div className="absolute inset-0 bg-sky-500/0 group-hover:bg-sky-500/20 transition-all duration-500 flex items-center justify-center">
                          <span className="flex items-center gap-2 px-5 py-2 rounded-full bg-white/0 group-hover:bg-white text-transparent group-hover:text-gray-900 font-bold text-sm transition-all duration-500 scale-75 group-hover:scale-100 opacity-0 group-hover:opacity-100">
                            View Site
                            <ArrowUpRightIcon />
                          </span>
                        </div>
                      </div>
                      {/* Info */}
                      <div className="p-4">
                        <p className="text-white font-semibold text-sm group-hover:text-sky-300 transition-colors duration-300">
                          {site.name}
                        </p>
                        <p className="text-white/40 text-xs mt-1 line-clamp-1">{site.tagline}</p>
                      </div>
                      {/* Hover glow top line */}
                      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sky-400/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      {/* Hover glow bg */}
                      <div className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_50%_0%,rgba(14,165,233,0.08),transparent_70%)]" />
                    </a>
                  );
                })}
            </div>
          );

          // Service group → collapsible <details> dropdown so the 12 custom
          // builds don't dominate the homepage at first glance.
          if (g === "service") {
            return (
              <details key={g} className="bj-dropdown mb-10 last:mb-0">
                <summary
                  className="flex items-center gap-3 mb-4 rounded-lg px-3 py-2.5 -mx-3 border border-white/[0.04] hover:border-sky-500/30 hover:bg-white/[0.02] transition-colors"
                  aria-label={`Show all ${groupCards.length} custom builds`}
                >
                  {headerEyebrow}
                  {headerCount}
                  <div className="flex-1 h-px bg-white/[0.04]" />
                  <span className="bj-when-closed inline-flex items-center gap-1.5 text-xs font-semibold text-sky-300 whitespace-nowrap">
                    Click to expand
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="bj-chevron w-3.5 h-3.5">
                      <path d="M3 6l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <span className="bj-when-open items-center gap-1.5 text-xs font-semibold text-white/55 whitespace-nowrap">
                    Hide
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="bj-chevron w-3.5 h-3.5">
                      <path d="M3 6l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </summary>
                <div className="pt-5">{grid}</div>
              </details>
            );
          }

          return (
            <div key={g} className="mb-10 last:mb-0">
              <div className="flex items-center gap-3 mb-4">
                {headerEyebrow}
                {headerCount}
                <div className="flex-1 h-px bg-white/[0.04]" />
              </div>
              {grid}
            </div>
          );
        })}
      </div>

      {/* ── Bottom CTA Banner — dual CTA + explicit risk reversal ── */}
      <div
        className="relative z-20 w-full max-w-3xl px-6 mt-16"
      >
        <div className="relative overflow-hidden rounded-2xl border border-sky-500/20 bg-gradient-to-r from-sky-500/10 via-blue-600/10 to-sky-500/10 p-8 md:p-10 text-center">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(14,165,233,0.15),transparent_70%)]" />
          <div className="relative z-10">
            <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-3">
              Want a website like these?
            </h3>
            <p className="text-white/55 text-base md:text-lg mb-7 max-w-lg mx-auto">
              Two ways to start. Both are free. Pick the one that fits.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href="/get-started"
                className="inline-flex items-center justify-center gap-2 h-12 px-8 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold text-base hover:shadow-[0_0_40px_rgba(14,165,233,0.5)] active:scale-[0.97] transition-all duration-300"
              >
                Build my full preview
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
              <a
                href="/audit"
                className="inline-flex items-center justify-center gap-2 h-12 px-8 rounded-full border border-sky-500/40 bg-sky-500/[0.04] text-sky-200 hover:bg-sky-500/10 hover:border-sky-400/70 hover:text-white text-base font-semibold transition-all duration-300"
              >
                Run a 60-second audit
              </a>
            </div>
            <p className="mt-6 text-sm text-white/55 max-w-md mx-auto leading-relaxed">
              <span className="text-white font-semibold">Don&apos;t love what we build? You don&apos;t pay a cent.</span> That&apos;s the deal.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── Default Cards ───────────────────────── */

// ICP niche-down portfolio — locked 2026-05-14, updated 2026-05-19.
// Four featured-brand anchors lead: three product manufacturers (Tekky,
// KR Ranches, Laser Lakes) + Bloodlines (indie author, promoted from
// the custom-builds dropdown 2026-05-19 when ITC Quick Attach was
// pulled from the homepage). Each card points to a REAL client build,
// not a V2 template showcase. The 23 legacy service-trade cards are
// archived in git history pre-15510bdf — V2 templates remain on disk
// for inbound but no longer surface on the homepage (per "Optimize for
// the Customer You Already Have" Luis-validated framework — show
// prospects what their version will look like, not 23 versions of
// someone else's industry).
const defaultSiteCards: SiteCard[] = [
  // ── Featured Brands (always visible, 4 cards) ───────────────────────
  { name: "Zenith Sports / TEKKY", category: "Sports manufacturer", color: "#0a0f1e", href: "/clients/zenith-sports", icon: "⚽", tagline: "Full AI marketing system — soccer training brand", group: "manufacturer" },
  { name: "Bloodlines", category: "Indie author", color: "#09090b", href: "/clients/bloodlines", icon: "📖", tagline: "Bespoke fantasy showcase — world map, magic system, faction quiz", group: "manufacturer" },
  { name: "KR Ranches", category: "DTC food manufacturer", color: "#1a0f0a", href: "/sites/kr-ranches/index.html", icon: "🥩", tagline: "Farm-direct meat — direct-to-consumer brand", group: "manufacturer" },
  { name: "Laser Lakes", category: "Shopify product brand", color: "#0a151e", href: "/clients/laser-lakes", icon: "🎨", tagline: "Custom marketing front — Shopify-powered storefront", group: "manufacturer" },
  // ── Custom Builds (collapsed dropdown, expanded 2026-05-15) ─────────
  // All non-featured bespoke client builds collected under one
  // collapsible <details> so the homepage stays tight at first glance
  // (4 featured brand builds visible) but every real custom build is
  // one click away. Order: proven income-generating local clients
  // first, then specialty. (Bloodlines was promoted to the Featured
  // Brands row on 2026-05-19.)
  { name: "Hector Landscaping", category: "Landscape design", color: "#0d1a0a", href: "/clients/hector-landscaping", icon: "🌿", tagline: "Lawn care + property maintenance · Sequim WA", group: "service" },
  { name: "Mountain View Landscaping", category: "Landscape design", color: "#0f1a14", href: "/clients/mt-view-landscaping", icon: "🏞️", tagline: "Full-service landscape design · Sequim WA", group: "service" },
  { name: "Elite Hardscapes & Landscaping", category: "Hardscape + landscape", color: "#1a1410", href: "/clients/elite-hardscapes-and-landscapes", icon: "🪨", tagline: "Patios, walls, drainage · Port Angeles WA", group: "service" },
  { name: "Pine & Particle Co.", category: "Home inspections", color: "#15211a", href: "/sites/olympic-inspections/index.html", icon: "🌲", tagline: "Olympic Peninsula home inspections + testing", group: "service" },
  { name: "Lewis County Autism Coalition", category: "Nonprofit", color: "#0f1a2e", href: "/sites/lcac/index.html", icon: "🧩", tagline: "Family-focused nonprofit · Lewis County WA", group: "service" },
  { name: "Meyer Electric", category: "Electrician", color: "#1e1407", href: "/clients/meyer-electric", icon: "⚡", tagline: "Residential + commercial electrician · Snohomish WA", group: "service" },
  { name: "Masters Window Tinting", category: "Auto tint + detail", color: "#0a0a14", href: "/clients/masters-window-tinting", icon: "🚗", tagline: "Window tint + auto detail · Long Island NY", group: "service" },
  { name: "Wholme Naturopathy", category: "Naturopathic medicine", color: "#1a1714", href: "/clients/wholme-naturopathy", icon: "🌱", tagline: "Holistic naturopathic practice", group: "service" },
  { name: "Family Care Cleaning", category: "Residential cleaning", color: "#1a1408", href: "/clients/family-care-cleaning", icon: "🧽", tagline: "House cleaning · Olympic Peninsula WA", group: "service" },
  { name: "Ways Executive Sedan", category: "Luxury chauffeur", color: "#0a0a0a", href: "/clients/ways-executive-sedan", icon: "🚙", tagline: "Executive transport + airport service", group: "service" },
  { name: "The Oregon Appraisers", category: "Real-estate appraisal", color: "#0a121a", href: "/clients/theoregonappraisers", icon: "🏠", tagline: "Residential appraisal · Oregon", group: "service" },
];

const GROUP_META: Record<SiteGroup, { label: string; eyebrow: string; accent: string; ring: string }> = {
  manufacturer: {
    // Renamed 2026-05-19 — group now mixes 3 product manufacturers +
    // Bloodlines (indie author). "Featured Brands" is the common
    // denominator: every site in this row is a polished product brand
    // build, whether the product is a tractor accessory, a steak, a
    // soccer course, or a fantasy novel.
    label: "Featured Brands",
    eyebrow: "⭐",
    accent: "text-amber-300",
    ring: "border-amber-500/20 bg-amber-500/5",
  },
  author: {
    label: "Indie Authors",
    eyebrow: "📚",
    accent: "text-violet-300",
    ring: "border-violet-500/20 bg-violet-500/5",
  },
  // Renamed 2026-05-15 — group now mixes service businesses + bespoke
  // builds (Bloodlines indie author, LCAC nonprofit, etc). "Custom Builds"
  // captures the common denominator: every site in this row is hand-
  // crafted, not V2-template-generated.
  service: {
    label: "Custom Builds",
    eyebrow: "🛠️",
    accent: "text-sky-300",
    ring: "border-sky-500/20 bg-sky-500/5",
  },
};
