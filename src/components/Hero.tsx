"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import BluejayLogo, { BluejayLogoCircle } from "./BluejayLogo";

interface SiteCard {
  name: string;
  category: string;
  color: string;
  href: string;
  icon: string;
  tagline: string;
}

const phrases = ["BlueJays stand out", "See for yourself"];

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
      {/* Layered background — rich blue glow */}
      <div className="absolute inset-0">
        {/* Base gradient — deep blue instead of pure black */}
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse at 50% 30%, #0c2d4a 0%, #081828 40%, #050a14 70%)",
          }}
        />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(14,165,233,.2) 1px, transparent 1px), linear-gradient(90deg, rgba(14,165,233,.2) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        {/* Large bluejay silhouettes */}
        <BluejayLogo size={300} className="absolute top-[5%] left-[2%] opacity-[0.06] text-blue-electric" />
        <BluejayLogo size={220} className="absolute top-[10%] right-[5%] opacity-[0.04] text-blue-glow rotate-12" />
        <BluejayLogo size={180} className="absolute bottom-[15%] left-[8%] opacity-[0.035] text-accent -rotate-12" />
        <BluejayLogo size={140} className="absolute bottom-[25%] right-[15%] opacity-[0.025] text-blue-electric rotate-6" />
        {/* Big blue glows */}
        <div className="absolute top-[10%] left-[20%] w-[600px] h-[600px] rounded-full bg-blue-electric/15 blur-[150px]" />
        <div className="absolute top-[40%] right-[10%] w-[500px] h-[500px] rounded-full bg-blue-deep/20 blur-[130px]" />
        <div className="absolute bottom-[10%] left-[30%] w-[500px] h-[500px] rounded-full bg-blue-glow/10 blur-[160px]" />
        <div className="absolute top-[20%] left-[50%] w-[400px] h-[400px] rounded-full bg-accent/8 blur-[140px]" />
      </div>

      {/* BlueJays Logo + Nav */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-8 py-5"
      >
        <div className="flex items-center gap-3">
          <BluejayLogoCircle size={40} />
          <span className="text-xl font-bold text-foreground">BlueJays</span>
        </div>
        <div className="flex items-center gap-4">
          <a href="/dashboard" className="text-sm text-muted hover:text-foreground transition-colors">Dashboard</a>
          <a href="mailto:bluejaycontactme@gmail.com" className="h-9 px-5 rounded-full bg-blue-electric text-white text-sm font-medium flex items-center hover:bg-blue-deep transition-colors">
            Get Started
          </a>
        </div>
      </motion.nav>

      {/* Animated bubble */}
      <AnimatePresence>
        {bubbleVisible && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute z-20 flex items-center justify-center"
          >
            <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full bg-gradient-to-br from-blue-electric to-blue-deep flex items-center justify-center shadow-[0_0_80px_rgba(14,165,233,0.4)]">
              {/* Bird silhouette in bubble */}
              <BluejayLogo size={80} className="absolute text-white/10 -top-2 -right-2" />
              <AnimatePresence mode="wait">
                <motion.p
                  key={phase}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.5 }}
                  className="text-white text-2xl md:text-3xl font-bold text-center px-8"
                >
                  {phrases[phase]}
                </motion.p>
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Site grid */}
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
          className="text-center mb-10"
        >
          <p className="text-blue-electric text-sm font-semibold uppercase tracking-wider mb-3">Our Portfolio</p>
          <h2 className="text-3xl md:text-4xl font-bold">Websites that win customers</h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {cards.map((site, i) => (
            <motion.a
              key={site.name}
              href={site.href}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 5.4 + i * 0.08, duration: 0.5 }}
              whileHover={{ scale: 1.03, y: -6 }}
              className="group relative rounded-2xl overflow-hidden bg-[#0a1628] border border-blue-electric/10 cursor-pointer hover:border-blue-electric/40 transition-all duration-300 hover:shadow-[0_8px_40px_rgba(14,165,233,0.25)]"
            >
              {/* Thumbnail area */}
              <div
                className="aspect-[4/3] relative overflow-hidden"
                style={{ background: `linear-gradient(135deg, ${site.color} 0%, ${site.color}dd 100%)` }}
              >
                {/* Icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-5xl opacity-30 group-hover:opacity-50 group-hover:scale-110 transition-all duration-300">
                    {site.icon}
                  </span>
                </div>
                {/* Decorative elements */}
                <div className="absolute top-3 left-3 right-3 h-2 rounded-full bg-white/10" />
                <div className="absolute top-7 left-3 w-1/3 h-1.5 rounded-full bg-white/5" />
                <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent" />
                {/* Category pill */}
                <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-black/30 backdrop-blur-sm text-[10px] text-white/80 font-medium">
                  {site.category}
                </div>
              </div>
              {/* Info */}
              <div className="p-4">
                <p className="text-foreground font-semibold text-sm">{site.name}</p>
                <p className="text-muted text-xs mt-1 line-clamp-1">{site.tagline}</p>
              </div>
              {/* Hover glow */}
              <div className="absolute inset-0 rounded-2xl border-2 border-blue-electric/0 group-hover:border-blue-electric/30 transition-colors duration-300 pointer-events-none" />
            </motion.a>
          ))}
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 6.5 }}
        className="relative z-20 mt-16 mb-8"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-6 h-10 rounded-full border-2 border-muted/40 flex items-start justify-center pt-2"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-blue-electric" />
        </motion.div>
      </motion.div>
    </section>
  );
}

function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    "Real Estate": "🏠", "Dental": "🦷", "Law Firm": "⚖️",
    "Landscaping": "🌳", "Salon": "✂️", "Roofing": "🏗️",
    "Fitness": "💪", "Pet Services": "🐾", "Electrician": "⚡",
    "Plumber": "🔧", "HVAC": "❄️", "Auto Repair": "🚗",
    "Veterinary": "🐕", "Photography": "📸", "Catering": "🍽️",
  };
  return icons[category] || "🌐";
}

function getCategoryTagline(category: string): string {
  const taglines: Record<string, string> = {
    "Real Estate": "Luxury listings & expert agents",
    "Dental": "Modern care for the whole family",
    "Law Firm": "Experienced attorneys, proven results",
    "Landscaping": "Transform your outdoor space",
    "Salon": "Where artistry meets luxury",
    "Roofing": "Quality roofing you can trust",
    "Fitness": "Train harder, live better",
    "Pet Services": "Premium care for your pets",
  };
  return taglines[category] || "Professional services, stunning design";
}

const defaultSiteCards: SiteCard[] = [
  { name: "Prestige Realty", category: "Real Estate", color: "#1a2744", href: "/templates/real-estate", icon: "🏠", tagline: "Luxury listings & expert agents" },
  { name: "Bright Smile Dental", category: "Dental", color: "#0f2a2a", href: "/templates/dental", icon: "🦷", tagline: "Modern care for the whole family" },
  { name: "Carter & Associates", category: "Law Firm", color: "#1f1a2e", href: "/templates/law-firm", icon: "⚖️", tagline: "Experienced attorneys, proven results" },
  { name: "GreenScape Pro", category: "Landscaping", color: "#1a2e1a", href: "/templates/landscaping", icon: "🌳", tagline: "Transform your outdoor space" },
  { name: "Luxe Studio", category: "Salon", color: "#2e1a2a", href: "/templates/salon", icon: "✂️", tagline: "Where artistry meets luxury" },
  { name: "Summit Roofing", category: "Roofing", color: "#2a1f14", href: "#", icon: "🏗️", tagline: "Quality roofing you can trust" },
  { name: "FlowState Yoga", category: "Fitness", color: "#142a2a", href: "#", icon: "💪", tagline: "Train harder, live better" },
  { name: "PurePaws Grooming", category: "Pet Services", color: "#1e2a14", href: "#", icon: "🐾", tagline: "Premium care for your pets" },
];
