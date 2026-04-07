"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import BluejayLogo, { BluejayLogoCircle } from "./BluejayLogo";

/* ───────────────────────── Types ───────────────────────── */

interface SiteCard {
  name: string;
  category: string;
  color: string;
  href: string;
  icon: string;
  tagline: string;
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

const phrases = ["BlueJays stand out", "See for yourself"];

/* ───────────────────────── Main Component ───────────────────────── */

export default function Hero() {
  const [phase, setPhase] = useState(0);
  const [bubbleVisible, setBubbleVisible] = useState(true);
  const [cards, setCards] = useState<SiteCard[]>(defaultSiteCards);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 2500),
      setTimeout(() => setBubbleVisible(false), 5000),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    fetch("/api/portfolio")
      .then((r) => r.json())
      .then((data) => {
        if (data.sites && data.sites.length > 0) {
          const dynamicCards: SiteCard[] = data.sites.map(
            (s: { name: string; category: string; color: string; href: string }) => ({
              name: s.name,
              category: s.category,
              color: s.color,
              href: s.href,
              icon: getCategoryIcon(s.category),
              tagline: getCategoryTagline(s.category),
            })
          );
          const merged = [...dynamicCards, ...defaultSiteCards]
            .filter((card, i, arr) => arr.findIndex((c) => c.name === card.name) === i)
            .slice(0, 12);
          setCards(merged);
        }
      })
      .catch(() => {});
  }, []);

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
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-8 py-5"
      >
        <div className="flex items-center gap-3">
          <BluejayLogoCircle size={42} />
          <span className="text-xl font-bold text-white tracking-tight">BlueJays</span>
        </div>
        <div className="flex items-center gap-5">
          <a
            href="/dashboard"
            className="text-sm text-white/60 hover:text-white transition-colors duration-300 font-medium"
          >
            Dashboard
          </a>
          <a
            href="mailto:bluejaycontactme@gmail.com"
            className="group relative h-10 px-6 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 text-white text-sm font-semibold flex items-center gap-2 hover:shadow-[0_0_30px_rgba(14,165,233,0.5)] transition-all duration-300"
          >
            Get Started
            <ArrowUpRightIcon />
          </a>
        </div>
      </motion.nav>

      {/* ── Animated bubble ── */}
      <AnimatePresence>
        {bubbleVisible && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute z-20 flex items-center justify-center"
          >
            <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full bg-gradient-to-br from-sky-500 to-blue-700 flex items-center justify-center shadow-[0_0_100px_rgba(14,165,233,0.5),0_0_200px_rgba(14,165,233,0.2)]">
              {/* Decorative ring */}
              <div className="absolute inset-[-6px] rounded-full border border-sky-400/20" />
              <div className="absolute inset-[-14px] rounded-full border border-sky-400/10" />
              {/* Bird silhouette */}
              <BluejayLogo size={90} className="absolute text-white/[0.08] -top-3 -right-3" />
              <AnimatePresence mode="wait">
                <motion.p
                  key={phase}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.5 }}
                  className="text-white text-2xl md:text-3xl font-extrabold text-center px-8 tracking-tight"
                >
                  {phrases[phase]}
                </motion.p>
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Portfolio Grid ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: bubbleVisible ? 0.1 : 1 }}
        transition={{ duration: 1, delay: bubbleVisible ? 0 : 0.3 }}
        className="relative z-10 w-full max-w-6xl px-6 pt-24"
      >
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: bubbleVisible ? 0 : 1, y: bubbleVisible ? 20 : 0 }}
          transition={{ delay: 5.2, duration: 0.6 }}
          className="text-center mb-12"
        >
          <motion.span
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: bubbleVisible ? 0 : 1, y: bubbleVisible ? -10 : 0 }}
            transition={{ delay: 5.2 }}
            className="inline-block text-sky-400 text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border border-sky-500/20 bg-sky-500/5"
          >
            Our Portfolio
          </motion.span>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
            Websites that{" "}
            <span className="text-sky-400">win customers</span>
          </h2>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: bubbleVisible ? 0 : 1 }}
            transition={{ delay: 5.4, duration: 0.6 }}
            className="h-0.5 w-16 bg-gradient-to-r from-sky-500 to-transparent mt-4 mx-auto"
          />
          <p className="text-white/50 mt-4 text-lg max-w-xl mx-auto">
            Real websites we built for real businesses. Click any card to explore.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {cards.map((site, i) => (
            <motion.a
              key={site.name}
              href={site.href}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 5.4 + i * 0.08, duration: 0.5 }}
              whileHover={{ scale: 1.04, y: -8 }}
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
                  <span className="text-5xl opacity-30 group-hover:opacity-50 group-hover:scale-125 transition-all duration-500">
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
            </motion.a>
          ))}
        </div>
      </motion.div>

      {/* ── Scroll indicator ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 6.5 }}
        className="relative z-20 mt-16 mb-8"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center pt-2"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-sky-400" />
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ───────────────────────── Helpers ───────────────────────── */

function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    "Real Estate": "\u{1F3E0}",
    Dental: "\u{1F9B7}",
    "Law Firm": "\u2696\uFE0F",
    Landscaping: "\u{1F333}",
    Salon: "\u2702\uFE0F",
    Roofing: "\u{1F3D7}\uFE0F",
    Fitness: "\u{1F4AA}",
    "Pet Services": "\u{1F43E}",
    Electrician: "\u26A1",
    Plumber: "\u{1F527}",
    HVAC: "\u2744\uFE0F",
    "Auto Repair": "\u{1F697}",
    Veterinary: "\u{1F415}",
    Photography: "\u{1F4F8}",
    Catering: "\u{1F37D}\uFE0F",
  };
  return icons[category] || "\u{1F310}";
}

function getCategoryTagline(category: string): string {
  const taglines: Record<string, string> = {
    "Real Estate": "Luxury listings & expert agents",
    Dental: "Modern care for the whole family",
    "Law Firm": "Experienced attorneys, proven results",
    Landscaping: "Transform your outdoor space",
    Salon: "Where artistry meets luxury",
    Roofing: "Quality roofing you can trust",
    Fitness: "Train harder, live better",
    "Pet Services": "Premium care for your pets",
  };
  return taglines[category] || "Professional services, stunning design";
}

/* ───────────────────────── Default Cards ───────────────────────── */

const defaultSiteCards: SiteCard[] = [
  // Each card has a unique business name, specific tagline, and distinct color shade
  { name: "Puget Sound Realty", category: "Real Estate", color: "#1a2744", href: "/templates/real-estate", icon: "🏠", tagline: "Seattle luxury homes & expert agents" },
  { name: "Emerald City Dental", category: "Dental", color: "#0f2a2a", href: "/templates/dental", icon: "🦷", tagline: "Gentle family dentistry since 2008" },
  { name: "Pacific Law Group", category: "Law Firm", color: "#1f1a2e", href: "/templates/law-firm", icon: "⚖️", tagline: "$50M+ recovered for injury victims" },
  { name: "Cascade Electric Co.", category: "Electrician", color: "#2a2210", href: "/templates/electrician", icon: "⚡", tagline: "Master electricians, EV charger experts" },
  { name: "Emerald City Plumbing", category: "Plumber", color: "#0f1a2e", href: "/templates/plumber", icon: "🔧", tagline: "60-minute emergency response" },
  { name: "Alpine HVAC Solutions", category: "HVAC", color: "#0a2630", href: "/templates/hvac", icon: "❄️", tagline: "Carrier certified, energy efficient" },
  { name: "Summit Roofing NW", category: "Roofing", color: "#2e1f0a", href: "/templates/roofing", icon: "🏗️", tagline: "20+ years weatherproofing the PNW" },
  { name: "Pacific Auto Works", category: "Auto Repair", color: "#2e1414", href: "/templates/auto-repair", icon: "🚗", tagline: "ASE certified, honest pricing always" },
  { name: "Cascade Landscapes", category: "Landscaping", color: "#1a2e1a", href: "/templates/landscaping", icon: "🌳", tagline: "800+ yards transformed in Seattle" },
  { name: "Velvet Hair Studio", category: "Salon", color: "#2e1a2a", href: "/templates/salon", icon: "✂️", tagline: "East Austin's top-rated color specialists" },
  { name: "Iron & Oak Fitness", category: "Fitness", color: "#2e0a14", href: "#", icon: "💪", tagline: "Boutique strength & HIIT training" },
  { name: "Northshore Vet Clinic", category: "Veterinary", color: "#0a2e1a", href: "#", icon: "🐾", tagline: "Compassionate care for dogs & cats" },
];
