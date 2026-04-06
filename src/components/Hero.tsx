"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

interface SiteCard {
  name: string;
  category: string;
  color: string;
  href: string;
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

  // Load dynamic sites from API
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
            })
          );
          // Merge: dynamic sites first, then fill with defaults up to 8
          const merged = [...dynamicCards, ...defaultSiteCards]
            .filter((card, i, arr) => arr.findIndex((c) => c.name === card.name) === i)
            .slice(0, 12);
          setCards(merged);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      {/* Background grid pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div
          className="h-full w-full"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-blue-electric/10 blur-[120px]" />

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

      {/* Site grid behind bubble */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: bubbleVisible ? 0.15 : 1 }}
        transition={{ duration: 1, delay: bubbleVisible ? 0 : 0.3 }}
        className="relative z-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-6 max-w-6xl w-full"
      >
        {cards.map((site, i) => (
          <motion.a
            key={site.name}
            href={site.href}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 5.2 + i * 0.1, duration: 0.5 }}
            whileHover={{ scale: 1.04, y: -4 }}
            className="group relative aspect-[4/3] rounded-xl overflow-hidden bg-surface border border-border cursor-pointer"
          >
            <div
              className="absolute inset-0"
              style={{ backgroundColor: site.color }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <p className="text-white text-sm font-semibold">{site.name}</p>
              <p className="text-white/60 text-xs">{site.category}</p>
            </div>
            <div className="absolute inset-0 border-2 border-blue-electric/0 group-hover:border-blue-electric/60 rounded-xl transition-colors duration-300" />
          </motion.a>
        ))}
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-6 h-10 rounded-full border-2 border-muted flex items-start justify-center pt-2"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-blue-electric" />
        </motion.div>
      </motion.div>
    </section>
  );
}

const defaultSiteCards: SiteCard[] = [
  { name: "Prestige Realty", category: "Real Estate", color: "#1a2744", href: "/templates/real-estate" },
  { name: "Bright Smile Dental", category: "Dental", color: "#0f2a2a", href: "/templates/dental" },
  { name: "Carter & Associates", category: "Law Firm", color: "#1f1a2e", href: "/templates/law-firm" },
  { name: "GreenScape Pro", category: "Landscaping", color: "#1a2e1a", href: "/templates/landscaping" },
  { name: "Luxe Studio", category: "Salon", color: "#2e1a2a", href: "/templates/salon" },
  { name: "Summit Roofing", category: "Roofing", color: "#2a1f14", href: "#" },
  { name: "FlowState Yoga", category: "Fitness", color: "#142a2a", href: "#" },
  { name: "PurePaws Grooming", category: "Pet Services", color: "#1e2a14", href: "#" },
];
