"use client";

/* eslint-disable @next/next/no-img-element -- These static marketing and preview components intentionally use plain img tags to preserve existing markup and visual behavior during lint-only cleanup. */

import { motion } from "framer-motion";
import TemplateLayout from "./TemplateLayout";

/* ───────────────────────── SVG Icons ───────────────────────── */

const RoofIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M3 21h18M4 21V10l8-7 8 7v11" />
    <path d="M2 10l10-8 10 8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ShingleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <rect x="2" y="4" width="9" height="6" rx="1" />
    <rect x="13" y="4" width="9" height="6" rx="1" />
    <rect x="6" y="12" width="9" height="6" rx="1" />
    <rect x="2" y="20" width="9" height="2" rx="0.5" />
    <rect x="13" y="20" width="9" height="2" rx="0.5" />
  </svg>
);

const GutterIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M4 4h16v3a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
    <path d="M6 9v8l-2 4M18 9v8l2 4" />
    <path d="M8 9v6M12 9v6M16 9v6" />
  </svg>
);

const ChimneyIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M8 22V12l4-4 4 4v10" />
    <rect x="9" y="2" width="6" height="6" rx="0.5" />
    <path d="M10 2v-0M14 2v-0" />
    <path d="M11 5c0-1 1-2 1-2s1 1 1 2" strokeLinecap="round" />
    <path d="M12 8v4" />
  </svg>
);

const HammerIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
  </svg>
);

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const StormIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M19 16.9A5 5 0 0018 7h-1.26a8 8 0 10-11.62 9" strokeLinecap="round" />
    <path d="M13 11l-4 6h6l-4 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const InspectIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    <path d="M9 14l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const MetalIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M2 20l10-16 10 16H2z" />
    <path d="M7 20l5-8 5 8" />
    <path d="M12 4v16" strokeDasharray="2 2" />
  </svg>
);

const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
    <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const StarIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
    <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const TrophyIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
    <path d="M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
  </svg>
);

const WarrantyIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
    <path d="M9 12l2 2 4-4" />
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

/* ───────────────────────── SVG Patterns ───────────────────────── */

const ShinglePattern = ({ opacity = 0.03 }: { opacity?: number }) => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }}>
    <defs>
      <pattern id="shinglePattern" width="80" height="40" patternUnits="userSpaceOnUse">
        <path d="M0 20 Q20 0 40 20 Q60 0 80 20" fill="none" stroke="#d97706" strokeWidth="0.5" />
        <path d="M-40 40 Q-20 20 0 40 Q20 20 40 40 Q60 20 80 40 Q100 20 120 40" fill="none" stroke="#d97706" strokeWidth="0.5" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#shinglePattern)" />
  </svg>
);

const RoofLinePattern = ({ opacity = 0.04 }: { opacity?: number }) => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }}>
    <defs>
      <pattern id="roofLines" width="120" height="60" patternUnits="userSpaceOnUse">
        <path d="M0 60 L60 20 L120 60" fill="none" stroke="#d97706" strokeWidth="0.6" />
        <path d="M30 60 L60 40 L90 60" fill="none" stroke="#d97706" strokeWidth="0.3" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#roofLines)" />
  </svg>
);

/* ───────────────────────── Data ───────────────────────── */

const services = [
  {
    name: "Roof Replacement",
    desc: "Complete tear-off and installation with premium materials built to outlast decades of Pacific Northwest weather.",
    icon: <RoofIcon />,
    tags: ["Asphalt", "Architectural", "Full Tear-Off"],
  },
  {
    name: "Roof Repair",
    desc: "Fast, lasting fixes for leaks, missing shingles, flashing damage, and wind-lifted sections. We stop the damage before it spreads.",
    icon: <HammerIcon />,
    tags: ["Leak Repair", "Flashing", "Patching"],
  },
  {
    name: "Metal Roofing",
    desc: "Standing seam and corrugated metal systems engineered for maximum durability, energy efficiency, and a bold modern look.",
    icon: <MetalIcon />,
    tags: ["Standing Seam", "Corrugated", "50-Year Life"],
  },
  {
    name: "Gutter Systems",
    desc: "Seamless aluminum gutters, gutter guards, and downspout routing that channels water away from your foundation.",
    icon: <GutterIcon />,
    tags: ["Seamless", "Guards", "Downspouts"],
  },
  {
    name: "Storm Damage",
    desc: "24/7 emergency tarping and full restoration. We handle insurance paperwork so you can focus on your family.",
    icon: <StormIcon />,
    tags: ["Emergency Tarp", "Insurance", "Hail Damage"],
  },
  {
    name: "Inspections",
    desc: "Comprehensive 21-point roof inspection with drone photography, moisture mapping, and a detailed written report.",
    icon: <InspectIcon />,
    tags: ["21-Point Check", "Drone Survey", "Free Report"],
  },
];

const materialComparison = [
  {
    name: "Composition Shingles",
    lifespan: "25-30 years",
    cost: "$$",
    pros: ["Most affordable", "Wide color range", "Easy to repair"],
    best: "Best for budget-friendly durability",
    icon: <ShingleIcon />,
  },
  {
    name: "Metal Roofing",
    lifespan: "50+ years",
    cost: "$$$",
    pros: ["Extreme durability", "Energy efficient", "Fire resistant"],
    best: "Best for long-term investment",
    icon: <MetalIcon />,
  },
  {
    name: "Flat / Low-Slope",
    lifespan: "20-25 years",
    cost: "$$",
    pros: ["Modern aesthetic", "Usable roof space", "Easy maintenance"],
    best: "Best for commercial and modern homes",
    icon: <RoofIcon />,
  },
];

const projects = [
  {
    image: "https://images.unsplash.com/photo-1449844908441-8829872d2607?w=500&q=80",
    title: "Full Replacement - Tacoma Hills",
    type: "Architectural Shingles",
  },
  {
    image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=500&q=80",
    title: "Metal Roof Upgrade - Puyallup",
    type: "Standing Seam Metal",
  },
  {
    image: "https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?w=500&q=80",
    title: "Storm Restoration - Lakewood",
    type: "Emergency + Full Replacement",
  },
];

const testimonials = [
  {
    name: "David P.",
    text: "Summit replaced our entire roof in two days. The crew was professional, the cleanup was spotless, and the price beat every other bid. Absolutely top-notch work.",
    service: "Roof Replacement",
    rating: 5,
  },
  {
    name: "Karen M.",
    text: "A massive storm tore shingles off our roof at midnight. Summit had a tarp on by 7am and the full repair done within a week. They handled our insurance claim start to finish.",
    service: "Storm Damage",
    rating: 5,
  },
  {
    name: "James & Lisa T.",
    text: "We went with the metal roof option and could not be happier. Our energy bills dropped noticeably and the house looks incredible. Worth every penny.",
    service: "Metal Roofing",
    rating: 5,
  },
];

/* ───────────────────────── Section Header Component ───────────────────────── */

function SectionHeader({
  tag,
  title,
  highlightWord,
  subtitle,
  center = true,
}: {
  tag: string;
  title: string;
  highlightWord: string;
  subtitle?: string;
  center?: boolean;
}) {
  const parts = title.split(highlightWord);
  return (
    <div className={`mb-16 ${center ? "text-center" : ""}`}>
      <motion.span
        initial={{ opacity: 0, y: -10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="inline-block text-[#d97706] text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border border-[#d97706]/20 bg-[#d97706]/5"
      >
        {tag}
      </motion.span>
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        className="text-3xl md:text-5xl font-extrabold tracking-tight"
      >
        {parts[0]}
        <span className="text-[#d97706]">{highlightWord}</span>
        {parts[1] || ""}
      </motion.h2>
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className={`h-0.5 w-16 bg-gradient-to-r from-[#d97706] to-transparent mt-4 ${center ? "mx-auto" : ""}`}
      />
      {subtitle && (
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-muted mt-4 max-w-2xl text-lg leading-relaxed mx-auto"
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
}

/* ───────────────────────── Main Component ───────────────────────── */

export default function RoofingTemplate() {
  return (
    <TemplateLayout
      businessName="Summit Roofing & Exteriors"
      tagline="Built to Protect. Engineered to Last. Tacoma's Most Trusted Roofing Experts."
      accentColor="#d97706"
      accentColorLight="#f59e0b"
      heroGradient="linear-gradient(135deg, #1a1206 0%, #0f0c08 100%)"
      heroImage="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1400&q=80"
      phone="(253) 555-0105"
      address="Tacoma, WA"
    >
      {/* ════════════════ Storm Damage Emergency Banner ════════════════ */}
      <section className="py-3 bg-gradient-to-r from-[#d97706] via-[#b45309] to-[#d97706] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9Im5vbmUiLz48cGF0aCBkPSJNMCAwTDQwIDQwTTQwIDBMMCA0MCIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjAuMyIgb3BhY2l0eT0iMC4xIi8+PC9zdmc+')] opacity-30" />
        <div className="max-w-6xl mx-auto px-6 flex flex-wrap items-center justify-center gap-6 relative z-10">
          <div className="flex items-center gap-3">
            <StormIcon />
            <p className="text-sm font-bold tracking-wide">STORM DAMAGE? FREE EMERGENCY INSPECTION &mdash; WE HANDLE YOUR INSURANCE CLAIM</p>
          </div>
          <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm px-5 py-2 rounded-full border border-white/20">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
            </span>
            <span className="text-xs font-bold tracking-wider">24/7 EMERGENCY: (253) 555-0105</span>
          </div>
        </div>
      </section>

      {/* ════════════════ Stats Banner ════════════════ */}
      <section className="py-12 relative overflow-hidden bg-[#0c0a06] border-b border-[#d97706]/10">
        <ShinglePattern opacity={0.02} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] rounded-full blur-[180px] bg-[#d97706]/5" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "1,500+", label: "Roofs Completed", icon: <TrophyIcon /> },
              { value: "20+", label: "Years Experience", icon: <ClockIcon /> },
              { value: "Lifetime", label: "Warranty", icon: <WarrantyIcon /> },
              { value: "4.9", label: "Star Rating", icon: <StarIcon /> },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-[#d97706]">{stat.icon}</span>
                  <span className="text-3xl md:text-4xl font-extrabold text-white">{stat.value}</span>
                </div>
                <span className="text-muted text-sm font-medium tracking-wide uppercase">{stat.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ Trust Badges ════════════════ */}
      <section className="py-8 relative overflow-hidden bg-[#0a0906]">
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: <ShieldIcon />, label: "Licensed & Insured" },
              { icon: <WarrantyIcon />, label: "Lifetime Warranty" },
              { icon: <StormIcon />, label: "Insurance Claims Help" },
              { icon: <InspectIcon />, label: "Free Inspections" },
            ].map((badge, i) => (
              <motion.div
                key={badge.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="flex items-center gap-3 p-4 rounded-xl border border-[#d97706]/15 bg-[#d97706]/5"
              >
                <div className="w-10 h-10 rounded-lg bg-[#d97706]/10 border border-[#d97706]/20 flex items-center justify-center text-[#d97706] shrink-0">
                  {badge.icon}
                </div>
                <span className="text-sm font-bold text-white/90">{badge.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ Services (Numbered Cards) ════════════════ */}
      <section
        id="services"
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0a0906 0%, #0f0b06 50%, #0a0906 100%)" }}
      >
        <RoofLinePattern />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[10%] right-[5%] w-[500px] h-[500px] rounded-full blur-[160px] bg-[#d97706]/6" />
          <div className="absolute bottom-[10%] left-[5%] w-[400px] h-[400px] rounded-full blur-[140px] bg-[#d97706]/4" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="OUR SERVICES"
            title="Roofing Solutions Built to Last"
            highlightWord="Built to Last"
            subtitle="From emergency repairs to complete replacements, we deliver weatherproof results backed by an ironclad warranty."
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((svc, i) => (
              <motion.div
                key={svc.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group relative p-7 rounded-2xl border border-white/[0.10] hover:border-[#d97706]/30 transition-all duration-500 overflow-hidden bg-white/[0.07]"
              >
                {/* Hover glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,#d9770615,transparent_70%)]" />
                {/* Top accent line */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#d97706]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  {/* Number + Icon row */}
                  <div className="flex items-start justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl bg-[#d97706]/10 border border-[#d97706]/20 flex items-center justify-center text-[#d97706] group-hover:bg-[#d97706]/20 group-hover:border-[#d97706]/40 transition-all duration-300">
                      {svc.icon}
                    </div>
                    <span className="text-4xl font-extrabold text-white/[0.04] group-hover:text-[#d97706]/10 transition-colors duration-300 leading-none">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold mb-3 group-hover:text-[#d97706] transition-colors duration-300">{svc.name}</h3>
                  <p className="text-muted text-sm leading-relaxed mb-5">{svc.desc}</p>
                  {/* Feature tags */}
                  <div className="flex flex-wrap gap-2">
                    {svc.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-semibold uppercase tracking-wider text-[#d97706]/70 bg-[#d97706]/8 border border-[#d97706]/10 px-2.5 py-1 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ Insurance Claims Help ════════════════ */}
      <section
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0f0b06 0%, #130f08 50%, #0f0b06 100%)" }}
      >
        <ShinglePattern opacity={0.025} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] left-[5%] w-[500px] h-[500px] rounded-full blur-[160px] bg-[#d97706]/5" />
          <div className="absolute bottom-[10%] right-[10%] w-[350px] h-[350px] rounded-full blur-[140px] bg-[#d97706]/4" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Image Stack */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative w-full aspect-[4/5] max-w-md mx-auto">
                {/* Main image */}
                <div className="absolute top-0 left-0 w-[75%] h-[70%] rounded-2xl overflow-hidden border-2 border-white/[0.10] shadow-2xl z-10">
                  <img
                    src="https://images.unsplash.com/photo-1558036117-15d82a90b9b1?w=600&q=80"
                    alt="Roof inspection"
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Secondary image */}
                <div className="absolute bottom-0 right-0 w-[65%] h-[55%] rounded-2xl overflow-hidden border-2 border-white/[0.10] shadow-2xl z-20">
                  <img
                    src="https://images.unsplash.com/photo-1513694203232-719a280e022f?w=400&q=80"
                    alt="Completed roof"
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Accent badge */}
                <div className="absolute top-[55%] left-[60%] z-30 bg-[#d97706] rounded-2xl px-5 py-4 shadow-xl shadow-[#d97706]/20 border border-[#f59e0b]/30">
                  <span className="block text-3xl font-extrabold text-white leading-none">100%</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-white/80">Claims<br />Approved</span>
                </div>
                {/* Decorative corner lines */}
                <div className="absolute -top-3 -left-3 w-16 h-16 border-t-2 border-l-2 border-[#d97706]/20 rounded-tl-xl" />
                <div className="absolute -bottom-3 -right-3 w-16 h-16 border-b-2 border-r-2 border-[#d97706]/20 rounded-br-xl" />
              </div>
            </motion.div>

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <SectionHeader
                tag="INSURANCE CLAIMS"
                title="We Handle the Paperwork"
                highlightWord="Paperwork"
                center={false}
              />
              <p className="text-muted leading-relaxed mb-6 text-lg -mt-8">
                Dealing with insurance after storm damage is overwhelming. Summit Roofing takes the burden off your shoulders and manages the entire claims process from start to finish.
              </p>
              <p className="text-muted leading-relaxed mb-8">
                We document every square inch of damage with drone photography, write detailed scope-of-work reports your adjuster can&apos;t argue with, and negotiate directly with your insurance company to ensure you get the full payout you deserve.
              </p>
              {/* Feature list */}
              <div className="space-y-4">
                {[
                  { icon: <InspectIcon />, title: "Free Damage Assessment", desc: "Comprehensive inspection with drone photography and moisture mapping" },
                  { icon: <ShieldIcon />, title: "Direct Insurance Billing", desc: "We work directly with your insurer so you pay nothing out of pocket" },
                  { icon: <PhoneIcon />, title: "24/7 Emergency Response", desc: "Emergency tarping within hours of your call, day or night" },
                ].map((feature) => (
                  <div key={feature.title} className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.07] border border-white/[0.04] hover:border-[#d97706]/20 transition-colors duration-300">
                    <div className="w-10 h-10 rounded-lg bg-[#d97706]/10 border border-[#d97706]/20 flex items-center justify-center text-[#d97706] shrink-0">
                      {feature.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm mb-0.5">{feature.title}</h4>
                      <p className="text-muted text-sm">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ════════════════ Material Comparison ════════════════ */}
      <section
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0a0906 0%, #0d0a06 50%, #0a0906 100%)" }}
      >
        <RoofLinePattern opacity={0.03} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[30%] left-[50%] -translate-x-1/2 w-[700px] h-[400px] rounded-full blur-[180px] bg-[#d97706]/6" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="ROOFING MATERIALS"
            title="Choose Your Protection"
            highlightWord="Protection"
            subtitle="Every home is different. We help you pick the material that matches your budget, style, and performance needs."
          />
          <div className="grid md:grid-cols-3 gap-6">
            {materialComparison.map((mat, i) => (
              <motion.div
                key={mat.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`group relative p-8 rounded-2xl border transition-all duration-500 overflow-hidden ${
                  i === 1
                    ? "border-[#d97706]/40 bg-[#d97706]/5 scale-[1.02]"
                    : "border-white/[0.10] bg-white/[0.07] hover:border-[#d97706]/30"
                }`}
              >
                {i === 1 && (
                  <div className="absolute -top-px left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#d97706] to-transparent" />
                )}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,#d9770612,transparent_70%)]" />
                <div className="relative z-10">
                  {i === 1 && (
                    <span className="inline-block text-[10px] font-bold uppercase tracking-[0.2em] text-[#d97706] bg-[#d97706]/10 border border-[#d97706]/20 px-3 py-1 rounded-full mb-4">
                      MOST POPULAR
                    </span>
                  )}
                  <div className="w-14 h-14 rounded-xl bg-[#d97706]/10 border border-[#d97706]/20 flex items-center justify-center text-[#d97706] mb-5">
                    {mat.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{mat.name}</h3>
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-sm text-muted">
                      <span className="text-[#d97706] font-bold">{mat.lifespan}</span> lifespan
                    </span>
                    <span className="text-sm text-[#d97706] font-bold">{mat.cost}</span>
                  </div>
                  <ul className="space-y-2 mb-5">
                    {mat.pros.map((pro) => (
                      <li key={pro} className="flex items-center gap-2 text-sm text-muted">
                        <span className="text-[#d97706]"><CheckIcon /></span>
                        {pro}
                      </li>
                    ))}
                  </ul>
                  <div className="pt-4 border-t border-white/[0.10]">
                    <p className="text-xs font-semibold text-[#d97706]/80 uppercase tracking-wider">{mat.best}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ Before / After Gallery ════════════════ */}
      <section
        id="about"
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0f0b06 0%, #110d08 50%, #0f0b06 100%)" }}
      >
        <ShinglePattern />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] right-[10%] w-[500px] h-[500px] rounded-full blur-[180px] bg-[#d97706]/5" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="OUR WORK"
            title="Recent Projects"
            highlightWord="Projects"
            subtitle="Real transformations from real Tacoma homes. See the Summit difference for yourself."
          />
          <div className="grid md:grid-cols-3 gap-8">
            {projects.map((project, i) => (
              <motion.div
                key={project.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="group relative rounded-2xl border border-white/[0.10] hover:border-[#d97706]/30 transition-all duration-500 overflow-hidden bg-white/[0.07]"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img src={project.image} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                </div>
                {/* Info */}
                <div className="p-5">
                  <h3 className="font-bold mb-1">{project.title}</h3>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#d97706]/70 bg-[#d97706]/8 border border-[#d97706]/10 px-2.5 py-1 rounded-full">
                    {project.type}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ Why Choose Summit Banner ════════════════ */}
      <section className="py-20 relative overflow-hidden bg-gradient-to-b from-[#d97706]/10 to-[#0a0906]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#d97706]/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#d97706]/10 to-transparent" />
          <svg className="absolute inset-0 w-full h-full opacity-[0.04]" viewBox="0 0 1000 400">
            <path d="M0 300 L250 100 L500 300 L750 100 L1000 300" stroke="#d97706" strokeWidth="1" fill="none" />
            <path d="M0 350 L250 150 L500 350 L750 150 L1000 350" stroke="#d97706" strokeWidth="0.5" fill="none" />
            <path d="M125 200 L375 200 M625 200 L875 200" stroke="#d97706" strokeWidth="0.3" fill="none" />
          </svg>
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              WHY CHOOSE <span className="text-[#d97706]">SUMMIT ROOFING?</span>
            </h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <ShieldIcon />, title: "Ironclad Warranty", desc: "Lifetime workmanship warranty plus full manufacturer coverage on materials" },
              { icon: <HammerIcon />, title: "Master Craftsmen", desc: "Factory-certified installers with 20+ years of hands-on roofing experience" },
              { icon: <StormIcon />, title: "Storm Ready", desc: "24/7 emergency response with tarping on-site within hours of your call" },
              { icon: <InspectIcon />, title: "Free Inspections", desc: "Comprehensive 21-point inspection with drone photos and moisture mapping" },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group text-center p-6 rounded-2xl border border-white/[0.10] hover:border-[#d97706]/30 bg-white/[0.07] transition-all duration-500"
              >
                <div className="w-14 h-14 mx-auto rounded-xl bg-[#d97706]/10 border border-[#d97706]/20 flex items-center justify-center text-[#d97706] mb-4 group-hover:bg-[#d97706]/20 group-hover:scale-110 transition-all duration-300">
                  {item.icon}
                </div>
                <h4 className="font-bold mb-2">{item.title}</h4>
                <p className="text-muted text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ Testimonials ════════════════ */}
      <section
        id="testimonials"
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0a0906 0%, #0d0a06 50%, #0a0906 100%)" }}
      >
        <RoofLinePattern />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[30%] left-[40%] w-[600px] h-[400px] rounded-full blur-[180px] bg-[#d97706]/5" />
          <svg className="absolute inset-0 w-full h-full opacity-[0.025]" viewBox="0 0 800 400">
            <path d="M0 300 L400 100 L800 300" stroke="#d97706" strokeWidth="0.5" fill="none" />
            <path d="M0 350 L400 150 L800 350" stroke="#d97706" strokeWidth="0.3" fill="none" />
          </svg>
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="CLIENT REVIEWS"
            title="Trusted by Homeowners"
            highlightWord="Homeowners"
            subtitle="Real reviews from Tacoma families who trusted Summit with their most important investment."
          />
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative p-7 rounded-2xl border border-white/[0.10] hover:border-[#d97706]/30 transition-all duration-500 overflow-hidden bg-white/[0.07]"
              >
                {/* Top accent line */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-[#d97706]/40 via-[#d97706]/10 to-transparent" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_0%_0%,#d9770610,transparent_70%)]" />
                <div className="relative z-10">
                  {/* Service tag */}
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#d97706]/70 bg-[#d97706]/8 border border-[#d97706]/10 px-2.5 py-1 rounded-full">
                    {t.service}
                  </span>
                  {/* Stars */}
                  <div className="flex items-center gap-0.5 text-[#d97706] mt-4 mb-4">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <StarIcon key={j} />
                    ))}
                  </div>
                  {/* Quote */}
                  <p className="text-muted leading-relaxed mb-6 text-sm">&ldquo;{t.text}&rdquo;</p>
                  {/* Author */}
                  <div className="flex items-center gap-3 pt-4 border-t border-white/[0.10]">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#d97706]/30 to-[#d97706]/10 flex items-center justify-center text-sm font-bold text-[#d97706]">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-sm">{t.name}</p>
                      <p className="text-muted text-xs">Verified Homeowner</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ Free Inspection CTA Form ════════════════ */}
      <section className="py-28 relative overflow-hidden" style={{ background: "linear-gradient(180deg, #0f0b06 0%, #1a1206 50%, #0f0b06 100%)" }}>
        <ShinglePattern opacity={0.03} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full blur-[200px] bg-[#d97706]/8" />
        </div>
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="FREE INSPECTION"
            title="Get Your Free Roof Inspection"
            highlightWord="Free Roof Inspection"
            subtitle="Schedule your complimentary 21-point inspection today. No obligation, no pressure, just honest answers about your roof."
          />
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative p-8 md:p-12 rounded-2xl border border-[#d97706]/20 bg-white/[0.07] overflow-hidden"
          >
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,#d9770610,transparent_60%)]" />
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#d97706] to-transparent" />
            <div className="relative z-10">
              <div className="grid md:grid-cols-2 gap-5 mb-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Full Name</label>
                  <input
                    type="text"
                    placeholder="John Smith"
                    className="w-full h-12 px-4 rounded-xl bg-white/[0.07] border border-white/[0.13] text-white placeholder:text-white/30 focus:border-[#d97706]/40 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="(253) 555-0000"
                    className="w-full h-12 px-4 rounded-xl bg-white/[0.07] border border-white/[0.13] text-white placeholder:text-white/30 focus:border-[#d97706]/40 focus:outline-none transition-colors"
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-5 mb-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Email Address</label>
                  <input
                    type="email"
                    placeholder="john@example.com"
                    className="w-full h-12 px-4 rounded-xl bg-white/[0.07] border border-white/[0.13] text-white placeholder:text-white/30 focus:border-[#d97706]/40 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Service Needed</label>
                  <select className="w-full h-12 px-4 rounded-xl bg-white/[0.07] border border-white/[0.13] text-white/70 focus:border-[#d97706]/40 focus:outline-none transition-colors appearance-none">
                    <option value="">Select a service...</option>
                    <option value="replacement">Roof Replacement</option>
                    <option value="repair">Roof Repair</option>
                    <option value="metal">Metal Roofing</option>
                    <option value="gutters">Gutter Systems</option>
                    <option value="storm">Storm Damage</option>
                    <option value="inspection">Free Inspection</option>
                  </select>
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Tell Us About Your Roof</label>
                <textarea
                  rows={4}
                  placeholder="Describe your roofing needs, any damage you've noticed, or questions you have..."
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.07] border border-white/[0.13] text-white placeholder:text-white/30 focus:border-[#d97706]/40 focus:outline-none transition-colors resize-none"
                />
              </div>
              <button
                type="button"
                className="w-full h-14 rounded-xl bg-[#d97706] hover:bg-[#b45309] text-white font-bold text-lg transition-colors duration-300 flex items-center justify-center gap-2"
              >
                <InspectIcon />
                Schedule My Free Inspection
              </button>
              <p className="text-center text-muted text-xs mt-4">
                No obligation. No pressure. We&apos;ll contact you within 2 hours to schedule.
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </TemplateLayout>
  );
}
