"use client";

/* eslint-disable @next/next/no-img-element -- Preview templates use plain img tags */
/* eslint-disable react-hooks/purity -- Decorative particle values are intentionally randomized */

import { useState, useRef, useCallback } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  AnimatePresence,
} from "framer-motion";
import {
  HardHat,
  Hammer,
  Clock,
  Phone,
  MapPin,
  CaretDown,
  List,
  X,
  Star,
  ArrowRight,
  CheckCircle,
  ShieldCheck,
  HouseLine,
  Buildings,
  Wrench,
  PencilSimpleLine,
  Play,
  GoogleLogo,
  SealCheck,
  Certificate,
} from "@phosphor-icons/react";
import type { GeneratedSiteData } from "@/lib/generator";
import BluejayLogo from "../BluejayLogo";
import { MapLink, PhoneLink } from "@/components/templates/MapLink";
import ClaimBanner from "@/components/ClaimBanner";
import { pickFromPool, pickGallery } from "@/lib/stock-image-picker";

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ SPRING CONFIGS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const spring = { type: "spring" as const, stiffness: 100, damping: 20 };
const springFast = { type: "spring" as const, stiffness: 200, damping: 25 };

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ COLORS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const CHARCOAL = "#1a1a1a";
const DEFAULT_ORANGE = "#ea580c";
const ORANGE_LIGHT = "#fb923c";
const AMBER = "#d97706";

const PALETTE = ["#ea580c", "#d97706", "#64748b", "#10b981", "#3b82f6", "#92400e"];
const pickPaletteColor = (i: number) => PALETTE[i % PALETTE.length];

function getAccent(accentColor?: string) {
  const c = accentColor || DEFAULT_ORANGE;
  return { ACCENT: c, ACCENT_GLOW: `${c}26`, ACCENT_LIGHT: ORANGE_LIGHT, AMBER };
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ SERVICE ICON MAP â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SERVICE_ICON_MAP: Record<string, any> = {
  remodel: Hammer,
  renovation: Hammer,
  addition: HouseLine,
  custom: HouseLine,
  commercial: Buildings,
  residential: HouseLine,
  concrete: HardHat,
  framing: PencilSimpleLine,
  roofing: HouseLine,
  demolition: Hammer,
  foundation: HardHat,
  deck: HouseLine,
  kitchen: HouseLine,
  bathroom: HouseLine,
  new: HouseLine,
  build: HardHat,
  tenant: Buildings,
  drywall: Hammer,
  plumbing: Wrench,
  electrical: Wrench,
};

function getServiceIcon(serviceName: string) {
  const lower = serviceName.toLowerCase();
  for (const [key, Icon] of Object.entries(SERVICE_ICON_MAP)) {
    if (lower.includes(key)) return Icon;
  }
  return HardHat;
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ STOCK FALLBACK IMAGES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const STOCK_HERO_POOL = [
  "https://images.unsplash.com/photo-1522770179533-24471fcdba45?w=1400&q=80",
  "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1400&q=80",
];
const STOCK_ABOUT_POOL = [
  "https://images.unsplash.com/photo-1517581177682-a085bb7ffb15?w=600&q=80",
  "https://images.unsplash.com/photo-1531834685032-c34bf0d84c77?w=600&q=80",
];
const STOCK_GALLERY = [
  "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=600&q=80",
  "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600&q=80",
  "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&q=80",
  "https://images.unsplash.com/photo-1522770179533-24471fcdba45?w=600&q=80",
  "https://images.unsplash.com/photo-1517581177682-a085bb7ffb15?w=600&q=80",
  "https://images.unsplash.com/photo-1531834685032-c34bf0d84c77?w=600&q=80",
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80",
  "https://images.unsplash.com/photo-1520975916090-3105956dac38?w=600&q=80",
];

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ TRUST BADGES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const TRUST_BADGES = [
  { icon: ShieldCheck, label: "Licensed & Bonded", desc: "Fully licensed general contractor with complete bonding" },
  { icon: Certificate, label: "Permit Handling", desc: "We manage all permits and inspections â€” stress-free for you" },
  { icon: CheckCircle, label: "On-Time Guarantee", desc: "We stick to timelines and keep you updated every step" },
  { icon: Star, label: "Quality Craftsmanship", desc: "Premium materials and meticulous attention to detail" },
];

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ PRICING TIERS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const PRICING_PLANS = [
  {
    name: "Kitchen & Bath",
    price: "$15K+",
    period: "starting at",
    features: ["Full design consultation", "Custom cabinetry", "Countertop installation", "Plumbing & electrical", "Tile & flooring", "Project management"],
    icon: HouseLine,
    featured: false,
  },
  {
    name: "Room Addition",
    price: "$35K+",
    period: "starting at",
    features: ["Architectural plans", "Foundation & framing", "Full MEP integration", "Permit handling", "Interior finish work", "Final walkthrough", "1-year warranty"],
    icon: Buildings,
    featured: true,
  },
  {
    name: "Custom Home",
    price: "$75K+",
    period: "starting at",
    features: ["Complete custom build", "Architect coordination", "All permits & surveys", "Premium materials", "Landscape integration", "Smart home ready", "2-year warranty"],
    icon: HardHat,
    featured: false,
  },
];

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ PROJECT TYPES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const PROJECT_TYPES = [
  { name: "Kitchen Remodels", icon: HouseLine, desc: "Custom cabinetry, countertops, flooring, and modern layouts" },
  { name: "Bathroom Renovations", icon: Wrench, desc: "Tile, fixtures, vanities, and spa-like upgrades" },
  { name: "Room Additions", icon: Buildings, desc: "Expand your living space with seamless additions" },
  { name: "Custom Homes", icon: HardHat, desc: "Ground-up builds designed to your exact vision" },
  { name: "Commercial Buildouts", icon: Buildings, desc: "Tenant improvements, office builds, and retail spaces" },
  { name: "Decks & Outdoor", icon: HouseLine, desc: "Composite decking, pergolas, and outdoor living spaces" },
  { name: "Structural Work", icon: Hammer, desc: "Foundation repair, load-bearing walls, and structural upgrades" },
  { name: "Whole-Home Renovations", icon: PencilSimpleLine, desc: "Complete interior transformations from floor to ceiling" },
];

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ MATERIALS SECTION â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const MATERIALS = [
  "Hardwood Flooring", "Quartz Countertops", "Custom Cabinetry", "Porcelain Tile",
  "Standing Seam Metal", "Composite Decking", "Engineered Stone", "Smart Home Systems",
];

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ COMPARISON TABLE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const COMPARISON_ROWS = [
  { feature: "Licensed General Contractor", us: true, them: "Sometimes" },
  { feature: "All Permits Handled", us: true, them: "Your Problem" },
  { feature: "Written Timeline", us: true, them: "Vague Estimates" },
  { feature: "Dedicated Project Manager", us: true, them: "No" },
  { feature: "Warranty on All Work", us: true, them: "Limited" },
  { feature: "Clean Job Site Daily", us: true, them: "Rarely" },
  { feature: "Transparent Change Orders", us: true, them: "Surprise Costs" },
];

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ QUIZ OPTIONS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const QUIZ_OPTIONS = [
  { label: "Kitchen or Bathroom", color: "#3b82f6", desc: "Remodel or full renovation of your kitchen or bathroom. Most common project type.", tag: "Most Popular" },
  { label: "Addition or New Build", color: "#f59e0b", desc: "Expanding your home with a room addition or building a custom home from scratch.", tag: "Major Project" },
  { label: "Commercial / Tenant", color: "#22c55e", desc: "Office buildout, retail space, restaurant, or commercial tenant improvement.", tag: "Commercial" },
];

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ FLOATING PARTICLES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function FloatingParticles({ accent }: { accent: string }) {
  const particles = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 8,
    duration: 5 + Math.random() * 7,
    size: 2 + Math.random() * 3,
    opacity: 0.12 + Math.random() * 0.25,
    isAmber: Math.random() > 0.6,
  }));
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden hidden md:block">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{ left: `${p.x}%`, width: p.size, height: p.size, background: p.isAmber ? AMBER : accent, willChange: "transform, opacity" }}
          animate={{ y: ["-10vh", "110vh"], opacity: [0, p.opacity, p.opacity, 0] }}
          transition={{
            y: { duration: p.duration, repeat: Infinity, delay: p.delay, ease: "linear" },
            opacity: { duration: p.duration, repeat: Infinity, delay: p.delay, times: [0, 0.1, 0.9, 1] },
          }}
        />
      ))}
    </div>
  );
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ BLUEPRINT GRID â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function BlueprintGrid({ opacity = 0.03, accent }: { opacity?: number; accent: string }) {
  const patternId = `bpConstructionV2-${accent.replace("#", "")}`;
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }}>
      <defs>
        <pattern id={patternId} width="80" height="80" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="80" y2="0" stroke={accent} strokeWidth="0.3" opacity="0.15" />
          <line x1="0" y1="40" x2="80" y2="40" stroke={accent} strokeWidth="0.3" opacity="0.1" />
          <line x1="0" y1="0" x2="0" y2="80" stroke={accent} strokeWidth="0.3" opacity="0.15" />
          <line x1="40" y1="0" x2="40" y2="80" stroke={accent} strokeWidth="0.3" opacity="0.1" />
          <circle cx="20" cy="20" r="2" fill={accent} opacity="0.2" />
          <circle cx="60" cy="60" r="2" fill={AMBER} opacity="0.15" />
          <circle cx="40" cy="40" r="1.5" fill={accent} opacity="0.12" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  );
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ STRUCTURE BG â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function StructureBg({ opacity = 0.03, accent }: { opacity?: number; accent: string }) {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }} viewBox="0 0 1000 600" preserveAspectRatio="none">
      <motion.path d="M100 600 L100 200 L300 200 L300 600" fill="none" stroke={accent} strokeWidth="2"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} />
      <motion.path d="M500 600 L500 100 L700 100 L700 600" fill="none" stroke={AMBER} strokeWidth="1.5"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }} />
      <motion.path d="M200 200 L200 50 L600 50 L600 200" fill="none" stroke={accent} strokeWidth="1"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 1 }} />
    </svg>
  );
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ GLASS CARD â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-white/15 bg-white/[0.08] backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] ${className}`}>
      {children}
    </div>
  );
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ MAGNETIC BUTTON â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function MagneticButton({ children, className = "", onClick, style, href }: {
  children: React.ReactNode; className?: string; onClick?: () => void; style?: React.CSSProperties; href?: string;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, springFast);
  const springY = useSpring(y, springFast);
  const isTouchDevice = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current || isTouchDevice) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - (rect.left + rect.width / 2)) * 0.25);
    y.set((e.clientY - (rect.top + rect.height / 2)) * 0.25);
  }, [x, y, isTouchDevice]);
  const handleMouseLeave = useCallback(() => { x.set(0); y.set(0); }, [x, y]);
  if (href) {
    return (
      <motion.a href={href} ref={ref as unknown as React.Ref<HTMLAnchorElement>}
        style={{ x: springX, y: springY, willChange: "transform", ...style }}
        onMouseMove={handleMouseMove as unknown as React.MouseEventHandler<HTMLAnchorElement>}
        onMouseLeave={handleMouseLeave} className={className} whileTap={{ scale: 0.97 }}>
        {children}
      </motion.a>
    );
  }
  return (
    <motion.button ref={ref} style={{ x: springX, y: springY, willChange: "transform", ...style }}
      onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} onClick={onClick}
      className={className} whileTap={{ scale: 0.97 }}>
      {children}
    </motion.button>
  );
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ SHIMMER BORDER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function ShimmerBorder({ children, className = "", accent }: { children: React.ReactNode; className?: string; accent: string }) {
  return (
    <div className={`relative rounded-2xl p-[1px] overflow-hidden ${className}`}>
      <motion.div className="absolute inset-0 rounded-2xl"
        style={{ background: `conic-gradient(from 0deg, transparent, ${accent}, transparent, ${AMBER}, transparent)`, willChange: "transform" }}
        animate={{ rotate: [0, 360] }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} />
      <div className="relative rounded-2xl bg-[#141414] z-10">{children}</div>
    </div>
  );
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ ACCORDION â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function AccordionItem({ question, answer, isOpen, onToggle }: { question: string; answer: string; isOpen: boolean; onToggle: () => void }) {
  return (
    <GlassCard className="overflow-hidden">
      <button onClick={onToggle} className="w-full flex items-center justify-between p-5 md:p-6 text-left group cursor-pointer">
        <span className="text-lg font-semibold text-white pr-4">{question}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={spring}>
          <CaretDown size={20} className="text-slate-400 shrink-0" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={spring} className="overflow-hidden">
            <p className="px-5 pb-5 md:px-6 md:pb-6 text-slate-400 leading-relaxed">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ SECTION HEADER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function SectionHeader({ badge, title, subtitle, accent }: { badge: string; title: string; subtitle?: string; accent: string }) {
  return (
    <div className="text-center mb-16">
      <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border"
        style={{ color: accent, borderColor: `${accent}33`, background: `${accent}0d` }}>{badge}</span>
      <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white">{title}</h2>
      <div className="h-0.5 w-16 mx-auto mt-4" style={{ background: `linear-gradient(to right, ${accent}, transparent)` }} />
      {subtitle && <p className="text-slate-400 mt-4 max-w-2xl text-lg leading-relaxed mx-auto">{subtitle}</p>}
    </div>
  );
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ ANIMATED SECTION â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function AnimatedSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div initial={{ opacity: 1, x: -50 }} whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.7, ease: "easeOut" as const }}
      className={className}>
      {children}
    </motion.div>
  );
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   MAIN COMPONENT
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
export default function V2ConstructionPreview({ data }: { data: GeneratedSiteData }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const { ACCENT, ACCENT_GLOW } = getAccent(data.accentColor);

  const uniquePhotos = data.photos ? [...new Set(data.photos)] : [];
  const heroImage = uniquePhotos[0] || pickFromPool(STOCK_HERO_POOL, data.businessName);
  const heroCardImage = uniquePhotos[1] || pickFromPool(STOCK_ABOUT_POOL, data.businessName, 1);
  const aboutImage = uniquePhotos[2] || pickFromPool(STOCK_ABOUT_POOL, data.businessName, 2);
  const usedUrls = new Set([heroImage, heroCardImage, aboutImage].filter(Boolean));
  const galleryFromReal = uniquePhotos.slice(3).filter((u) => !usedUrls.has(u));
  const galleryImages =
    galleryFromReal.length >= 4
      ? galleryFromReal.slice(0, 4)
      : [
          ...galleryFromReal,
          ...pickGallery(STOCK_GALLERY, data.businessName).filter(
            (u) => !usedUrls.has(u) && !galleryFromReal.includes(u)
          ),
        ].slice(0, 4);
  const phoneDigits = data.phone.replace(/\D/g, "");

  const processSteps = [
    { step: "01", title: "Free Consultation", desc: "We meet on-site, discuss your vision, review your budget, and outline the scope of work." },
    { step: "02", title: "Design & Planning", desc: "Our team creates detailed plans, selects materials, and handles all permit applications." },
    { step: "03", title: "Expert Construction", desc: "Licensed crews build with precision. You get weekly updates and a dedicated project manager." },
    { step: "04", title: "Final Walkthrough", desc: "We inspect every detail together, address any items, and hand over your completed project." },
    { step: "05", title: "Warranty & Support", desc: "Backed by our written warranty. We're here for you long after the project is complete." },
  ];

  const faqs = [
    { q: `Is ${data.businessName} a licensed general contractor?`, a: `Yes. ${data.businessName} is a fully licensed, bonded, and insured general contractor. We carry all required state and local licenses and maintain comprehensive liability and workers' compensation coverage.` },
    { q: "Do you handle permits and inspections?", a: "Absolutely. We manage the entire permit process from application through final inspection. You don't have to worry about building codes, zoning, or scheduling inspector visits â€” we handle it all." },
    { q: "How long does a typical renovation take?", a: "Timelines vary by project scope. A kitchen remodel typically takes 4-8 weeks, a bathroom 2-4 weeks, and room additions 8-16 weeks. We provide a detailed timeline during the planning phase and keep you updated throughout." },
    { q: "What happens if something unexpected comes up?", a: "We never surprise you with costs. If we discover anything unexpected (like hidden water damage or outdated wiring), we document it, present options with pricing, and get your approval before proceeding." },
    { q: "Do you offer financing?", a: "Yes, we work with several financing partners to offer flexible payment plans. We also accept phased payment schedules tied to project milestones, so you only pay as work is completed." },
    { q: "What warranty do you provide?", a: "All our work comes with a minimum 1-year craftsmanship warranty. Custom home builds include a 2-year warranty. Many of the materials and fixtures we install carry their own manufacturer warranties as well." },
  ];

  const fallbackTestimonials = [
    { name: "Mark D.", text: "Built our dream home on time and on budget. The craftsmanship is outstanding.", rating: 5 },
    { name: "Susan B.", text: "Our kitchen renovation exceeded all expectations. Professional crew and beautiful results.", rating: 5 },
    { name: "Tony R.", text: "They handled all permits and inspections seamlessly. Stress-free construction experience.", rating: 5 },
  ];
  const testimonials = data.testimonials?.length > 0 ? data.testimonials : fallbackTestimonials;

  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden" style={{ fontFamily: "Barlow, system-ui, sans-serif", background: CHARCOAL, color: "#f1f5f9" }}>
      <FloatingParticles accent={ACCENT} />

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• 1. NAV â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-4">
          <GlassCard className="flex items-center justify-between px-4 md:px-6 py-3">
            <div className="flex items-center gap-2">
              <HardHat size={24} weight="fill" style={{ color: ACCENT }} />
              <span className="text-lg font-bold tracking-tight text-white">{data.businessName}</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
              <a href="#services" className="hover:text-white transition-colors">Services</a>
              <a href="#about" className="hover:text-white transition-colors">About</a>
              <a href="#projects" className="hover:text-white transition-colors">Projects</a>
              <a href="#reviews" className="hover:text-white transition-colors">Reviews</a>
              <a href="#contact" className="hover:text-white transition-colors">Contact</a>
            </div>
            <div className="flex items-center gap-3">
              <MagneticButton className="px-4 md:px-5 py-2 rounded-full text-sm font-semibold text-white transition-colors cursor-pointer"
                style={{ background: ACCENT } as React.CSSProperties}>
                Free Estimate
              </MagneticButton>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors">
                {mobileMenuOpen ? <X size={24} /> : <List size={24} />}
              </button>
            </div>
          </GlassCard>
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3, ease: "easeInOut" }}
                className="md:hidden mt-2 overflow-hidden">
                <GlassCard className="flex flex-col gap-1 px-4 py-4">
                  {[{ label: "Services", href: "#services" }, { label: "About", href: "#about" }, { label: "Projects", href: "#projects" }, { label: "Reviews", href: "#reviews" }, { label: "Contact", href: "#contact" }].map((link) => (
                    <a key={link.label} href={link.href} onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-3 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors">{link.label}</a>
                  ))}
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• 2. HERO â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="relative min-h-[100dvh] flex items-center pt-24 z-10 overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImage} alt={data.businessName} className="w-full h-full object-cover object-center" />
          <div className="absolute inset-0 bg-black/70" />
        </div>
        <BlueprintGrid opacity={0.04} accent={ACCENT} />
        <StructureBg opacity={0.04} accent={ACCENT} />
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full blur-[200px] pointer-events-none" style={{ background: `${ACCENT}08` }} />

        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          <div className="space-y-8">
            <div>
              <p className="text-sm uppercase tracking-widest mb-4" style={{ color: ACCENT }}>Licensed General Contractor</p>
              <h1 className="text-3xl md:text-6xl tracking-tighter leading-none font-bold text-white"
                style={{ textShadow: "0 2px 20px rgba(0,0,0,0.8), 0 4px 40px rgba(0,0,0,0.5)" }}>
                {data.tagline}
              </h1>
            </div>
            <p className="text-lg text-white/80 max-w-md leading-relaxed" style={{ textShadow: "0 1px 8px rgba(0,0,0,0.6)" }}>
              {(() => { const t = data.about; if (t.length <= 180) return t; const dot = t.indexOf(".", 80); return dot > 0 && dot < 220 ? t.slice(0, dot + 1) : t.slice(0, 180).trim() + "..."; })()}
            </p>
            <div className="flex flex-wrap gap-3">
              {["Licensed & Bonded", "Permits Handled", "Free Estimates"].map((badge) => (
                <span key={badge} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border backdrop-blur-sm bg-black/30"
                  style={{ color: ACCENT, borderColor: `${ACCENT}4d` }}>
                  <CheckCircle size={14} weight="fill" /> {badge}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap gap-4">
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white flex items-center gap-2 cursor-pointer"
                style={{ background: ACCENT } as React.CSSProperties}>
                Get Free Estimate <ArrowRight size={18} weight="bold" />
              </MagneticButton>
              <MagneticButton href={`tel:${phoneDigits}`}
                className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/15 flex items-center gap-2 cursor-pointer">
                <Phone size={18} weight="duotone" /> <PhoneLink phone={data.phone} />
              </MagneticButton>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-slate-300">
              <span className="flex items-center gap-2"><MapPin size={16} weight="duotone" style={{ color: ACCENT }} /><MapLink address={data.address} /></span>
              <span className="flex items-center gap-2"><ShieldCheck size={16} weight="duotone" style={{ color: ACCENT }} />Licensed &amp; Insured</span>
            </div>
          </div>
          <div className="hidden md:block relative">
            <div className="relative rounded-2xl overflow-hidden border border-white/15">
              <img src={heroCardImage} alt={`${data.businessName} construction`} className="w-full h-[500px] object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6">
                <div className="px-4 py-2 rounded-full backdrop-blur-md bg-black/50 border flex items-center gap-2" style={{ borderColor: `${ACCENT}4d` }}>
                  <HardHat size={18} weight="fill" style={{ color: ACCENT }} />
                  <span className="text-sm font-semibold text-white">Licensed General Contractor</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• 3. STATS BAR â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="relative z-10 py-16 overflow-hidden border-y" style={{ borderColor: `${ACCENT}1a` }}>
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #14100a 0%, #1a1a1a 100%)" }} />
        <BlueprintGrid opacity={0.02} accent={ACCENT} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] rounded-full blur-[180px]" style={{ background: `${ACCENT}08` }} />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {data.stats.map((stat, i) => {
              const statIcons = [HardHat, Buildings, Star, ShieldCheck];
              const Icon = statIcons[i % statIcons.length];
              return (
                <div key={stat.label} className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Icon size={22} weight="fill" style={{ color: ACCENT }} />
                    <span className="text-3xl md:text-4xl font-extrabold text-white">{stat.value}</span>
                  </div>
                  <span className="text-slate-500 text-sm font-medium tracking-wide uppercase">{stat.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• 4. FREE CONSULTATION CTA â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="relative z-10 py-12 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT}dd)` }} />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='40' height='40' fill='none'/%3E%3Cpath d='M0 0L40 40M40 0L0 40' stroke='%23000' stroke-width='0.5'/%3E%3C/svg%3E\")" }} />
        <div className="max-w-4xl mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl md:text-2xl font-black text-white">Free On-Site Consultation &amp; Estimate</h3>
            <p className="text-white/80 text-sm">We visit your property, discuss your vision, and provide a detailed written estimate at no cost.</p>
          </div>
          <PhoneLink phone={data.phone} className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white text-black font-bold hover:bg-white/90 transition-colors whitespace-nowrap">
            <Phone size={20} weight="fill" /> Schedule Now
          </PhoneLink>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• 5. PROJECT TYPES â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #120c06 50%, #1a1a1a 100%)" }} />
        <BlueprintGrid accent={ACCENT} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[10%] right-[5%] w-[500px] h-[500px] rounded-full blur-[160px]" style={{ background: `${ACCENT}08` }} />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <AnimatedSection>
            <SectionHeader badge="What We Build" title="Project Types" subtitle="From kitchen remodels to ground-up custom homes, we build it all." accent={ACCENT} />
          </AnimatedSection>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {PROJECT_TYPES.map((item, i) => {
              const tile = pickPaletteColor(i + 2);
              return (
                <GlassCard key={item.name} className="p-5 text-center group hover:border-white/20 transition-all duration-300">
                  <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center"
                    style={{ background: `${tile}22`, border: `1px solid ${tile}55` }}>
                    <item.icon size={28} weight="duotone" style={{ color: tile }} />
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1">{item.name}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                </GlassCard>
              );
            })}
          </div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• 6. SERVICES GRID â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section id="services" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0a1218 50%, #1a1a1a 100%)" }} />
        <StructureBg opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Our Services" title="Construction Solutions"
            subtitle={`${data.businessName} provides professional construction services you can trust.`} accent={ACCENT} />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.services.map((service, i) => {
              const Icon = getServiceIcon(service.name);
              const tile = pickPaletteColor(i);
              return (
                <div key={service.name} className="group relative p-7 rounded-2xl border border-white/[0.10] hover:border-opacity-30 transition-all duration-500 overflow-hidden bg-white/[0.07]">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{ background: `radial-gradient(circle at 50% 0%, ${tile}22, transparent 70%)` }} />
                  <div className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: `linear-gradient(to right, transparent, ${tile}66, transparent)` }} />
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-5">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 border"
                        style={{ background: `${tile}22`, borderColor: `${tile}55` }}>
                        <Icon size={24} weight="duotone" style={{ color: tile }} />
                      </div>
                      <span className="text-xs font-mono" style={{ color: `${tile}99` }}>{String(i + 1).padStart(2, "0")}</span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{service.name}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{service.description || ""}</p>
                    {service.price && <p className="text-sm font-semibold mt-3" style={{ color: tile }}>{service.price}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• 7. ABOUT â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section id="about" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #120c06 50%, #1a1a1a 100%)" }} />
        <StructureBg opacity={0.02} accent={ACCENT} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] left-[10%] w-[500px] h-[500px] rounded-full blur-[180px]" style={{ background: `${ACCENT}06` }} />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="relative">
              <div className="rounded-2xl overflow-hidden border border-white/15">
                <img src={aboutImage} alt={`${data.businessName} team`} className="w-full h-[400px] object-cover" />
              </div>
              <div className="absolute -bottom-4 -right-4 md:bottom-6 md:-right-6">
                <div className="px-5 py-3 rounded-xl backdrop-blur-md border text-white font-bold text-sm shadow-lg"
                  style={{ background: `${ACCENT}e6`, borderColor: `${ACCENT}80` }}>
                  {data.stats[0] ? `${data.stats[0].value} ${data.stats[0].label}` : "Quality Built"}
                </div>
              </div>
            </div>
            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border"
                style={{ color: ACCENT, borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}>About Us</span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6 text-white">Building Your Vision</h2>
              <p className="text-slate-400 leading-relaxed mb-8">{data.about}</p>
              <div className="grid grid-cols-2 gap-4">
                {TRUST_BADGES.map((badge) => (
                  <GlassCard key={badge.label} className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: ACCENT_GLOW }}>
                      <badge.icon size={20} weight="duotone" style={{ color: ACCENT }} />
                    </div>
                    <span className="text-sm font-semibold text-white">{badge.label}</span>
                  </GlassCard>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• 8. PROCESS / TIMELINE â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0a1218 50%, #1a1a1a 100%)" }} />
        <BlueprintGrid opacity={0.025} accent={ACCENT} />
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <AnimatedSection>
            <SectionHeader badge="Our Process" title="From Concept to Completion" subtitle="A transparent, 5-step process that keeps you informed and in control." accent={ACCENT} />
          </AnimatedSection>
          <div className="space-y-6">
            {processSteps.map((step, i) => (
              <div key={step.step} className="flex gap-6 items-start">
                <div className="shrink-0 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black"
                  style={{ background: `linear-gradient(135deg, ${ACCENT}22, ${ACCENT}0a)`, color: ACCENT, border: `1px solid ${ACCENT}33` }}>
                  {step.step}
                </div>
                <div className="flex-1 pt-2">
                  <h3 className="text-lg font-bold text-white mb-1">{step.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
                  {i < processSteps.length - 1 && (
                    <div className="w-px h-6 ml-8 mt-4" style={{ background: `${ACCENT}33` }} />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• 9. PRICING TIERS â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #120c06 50%, #1a1a1a 100%)" }} />
        <StructureBg opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Project Investment" title="Transparent Project Pricing" subtitle="Every project is unique. Here's a guide to what you can expect." accent={ACCENT} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PRICING_PLANS.map((plan) => (
              <div key={plan.name} className="relative">
                {plan.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 px-4 py-1 rounded-full text-xs font-bold text-white"
                    style={{ background: ACCENT }}>Most Common</div>
                )}
                {plan.featured ? (
                  <ShimmerBorder accent={ACCENT}>
                    <div className="p-7">
                      <div className="w-12 h-12 rounded-xl mb-4 flex items-center justify-center" style={{ background: ACCENT_GLOW }}>
                        <plan.icon size={24} weight="duotone" style={{ color: ACCENT }} />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
                      <p className="text-slate-500 text-xs mb-3">{plan.period}</p>
                      <p className="text-4xl font-black mb-6" style={{ color: ACCENT }}>{plan.price}</p>
                      <ul className="space-y-2.5 mb-6">
                        {plan.features.map((f) => (
                          <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                            <CheckCircle size={16} weight="fill" style={{ color: ACCENT }} /> {f}
                          </li>
                        ))}
                      </ul>
                      <MagneticButton className="w-full py-3 rounded-xl text-sm font-semibold text-white cursor-pointer"
                        style={{ background: ACCENT } as React.CSSProperties}>
                        Get Estimate <ArrowRight size={16} weight="bold" />
                      </MagneticButton>
                    </div>
                  </ShimmerBorder>
                ) : (
                  <GlassCard className="p-7 h-full flex flex-col">
                    <div className="w-12 h-12 rounded-xl mb-4 flex items-center justify-center" style={{ background: ACCENT_GLOW }}>
                      <plan.icon size={24} weight="duotone" style={{ color: ACCENT }} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
                    <p className="text-slate-500 text-xs mb-3">{plan.period}</p>
                    <p className="text-4xl font-black mb-6" style={{ color: ACCENT }}>{plan.price}</p>
                    <ul className="space-y-2.5 mb-6 flex-1">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                          <CheckCircle size={16} weight="fill" style={{ color: ACCENT }} /> {f}
                        </li>
                      ))}
                    </ul>
                    <MagneticButton className="w-full py-3 rounded-xl text-sm font-semibold border border-white/15 text-white cursor-pointer">
                      Learn More
                    </MagneticButton>
                  </GlassCard>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• 10. COMPARISON TABLE â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0a1218 50%, #1a1a1a 100%)" }} />
        <BlueprintGrid opacity={0.02} accent={ACCENT} />
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <AnimatedSection>
            <SectionHeader badge="Why Choose Us" title={`${data.businessName} vs. Unlicensed Contractors`} accent={ACCENT} />
          </AnimatedSection>
          <GlassCard className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/15">
                    <th className="text-left p-4 text-slate-400 font-medium">Feature</th>
                    <th className="text-center p-4 font-bold text-white" style={{ color: ACCENT }}>{data.businessName}</th>
                    <th className="text-center p-4 text-slate-500 font-medium">Others</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_ROWS.map((row, i) => (
                    <tr key={row.feature} className={i % 2 === 0 ? "bg-white/[0.01]" : ""}>
                      <td className="p-4 text-slate-300">{row.feature}</td>
                      <td className="p-4 text-center">
                        <CheckCircle size={20} weight="fill" className="mx-auto" style={{ color: "#22c55e" }} />
                      </td>
                      <td className="p-4 text-center text-slate-500">{row.them}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• 11. MATERIALS â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="relative z-10 py-20 md:py-24 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #120c06 50%, #1a1a1a 100%)" }} />
        <StructureBg opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <AnimatedSection>
            <SectionHeader badge="Premium Materials" title="We Build With the Best" subtitle="Quality materials mean lasting results. We source from trusted suppliers." accent={ACCENT} />
          </AnimatedSection>
          <div className="flex flex-wrap justify-center gap-4">
            {MATERIALS.map((material) => (
              <div key={material} className="px-6 py-3 rounded-xl border border-white/15 bg-white/[0.07] text-sm font-semibold text-slate-300 hover:border-white/20 transition-colors">
                {material}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• 12. GOOGLE REVIEWS + TESTIMONIALS â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section id="reviews" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0a1218 50%, #1a1a1a 100%)" }} />
        <BlueprintGrid opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <AnimatedSection>
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full border border-white/15 bg-white/[0.08] mb-6">
                <GoogleLogo size={24} weight="bold" className="text-white" />
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={18} weight="fill" style={{ color: "#facc15" }} />
                  ))}
                </div>
                <span className="text-white font-bold">{data.stats.find(s => s.label.toLowerCase().includes("rating"))?.value || "4.9"}</span>
                <span className="text-slate-400 text-sm">on Google</span>
              </div>
              <SectionHeader badge="Client Reviews" title="What Our Clients Say" accent={ACCENT} />
            </div>
          </AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <GlassCard key={i} className="p-6 h-full flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex gap-0.5">
                    {Array.from({ length: t.rating || 5 }).map((_, j) => (
                      <Star key={j} size={16} weight="fill" style={{ color: ACCENT }} />
                    ))}
                  </div>
                  <SealCheck size={16} weight="fill" className="text-blue-400" />
                  <span className="text-xs text-slate-500">Verified</span>
                </div>
                <p className="text-slate-300 leading-relaxed flex-1 text-sm mb-4">&ldquo;{t.text}&rdquo;</p>
                <div className="pt-4 border-t border-white/8">
                  <span className="text-sm font-semibold text-white">{t.name}</span>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• 13. PROJECT QUIZ â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #120c06 50%, #1a1a1a 100%)" }} />
        <BlueprintGrid opacity={0.02} accent={ACCENT} />
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <AnimatedSection>
            <SectionHeader badge="Get Started" title="What&apos;s Your Project?" accent={ACCENT} />
          </AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {QUIZ_OPTIONS.map((opt, i) => (
              <button key={opt.label} onClick={() => setQuizAnswer(i)}
                className={`p-6 rounded-2xl border text-left transition-all duration-300 cursor-pointer ${quizAnswer === i ? "border-white/30 bg-white/[0.06]" : "border-white/15 bg-white/[0.07] hover:border-white/20"}`}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 rounded-full" style={{ background: opt.color }} />
                  <span className="text-xs font-bold uppercase tracking-wider" style={{ color: opt.color }}>{opt.tag}</span>
                </div>
                <h4 className="text-white font-semibold mb-2">{opt.label}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{opt.desc}</p>
              </button>
            ))}
          </div>
          <AnimatePresence>
            {quizAnswer !== null && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }} transition={spring} className="overflow-hidden">
                <ShimmerBorder accent={ACCENT}>
                  <div className="p-6 text-center">
                    <h4 className="text-lg font-bold text-white mb-2">
                      {quizAnswer === 0 ? "Great â€” We Love Kitchen & Bath Projects" : quizAnswer === 1 ? "Big Vision? Let's Make It Happen" : "Commercial Projects Are Our Specialty"}
                    </h4>
                    <p className="text-slate-400 text-sm mb-4">
                      {quizAnswer === 0 ? "Kitchen and bath remodels are our bread and butter. We'll design a space you'll love coming home to." : quizAnswer === 1 ? "Whether it's an addition or custom build, we handle permits, design, and construction from A to Z." : "From tenant buildouts to full commercial renovations, we deliver on-time and on-budget."}
                    </p>
                    <MagneticButton href={`tel:${phoneDigits}`}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-white font-semibold cursor-pointer"
                      style={{ background: ACCENT } as React.CSSProperties}>
                      <Phone size={18} weight="fill" /> Call {data.phone}
                    </MagneticButton>
                  </div>
                </ShimmerBorder>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• 14. VIDEO PLACEHOLDER â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0a1218 50%, #1a1a1a 100%)" }} />
        <StructureBg opacity={0.02} accent={ACCENT} />
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <AnimatedSection>
            <SectionHeader badge="Tour Our Projects" title="See Our Craftsmanship" accent={ACCENT} />
          </AnimatedSection>
          <div className="relative rounded-2xl overflow-hidden border border-white/15 group cursor-pointer">
            <img src={galleryImages[0]} alt="Construction project video" className="w-full h-[350px] md:h-[450px] object-cover" />
            <div className="absolute inset-0 bg-black/50 group-hover:bg-black/40 transition-colors flex items-center justify-center">
              <div className="w-20 h-20 rounded-full flex items-center justify-center border-2 border-white/30 bg-white/10 backdrop-blur-sm group-hover:scale-110 transition-transform">
                <Play size={36} weight="fill" className="text-white ml-1" />
              </div>
            </div>
            <div className="absolute bottom-6 left-6">
              <p className="text-white font-semibold text-lg">Project Walkthrough</p>
              <p className="text-white/60 text-sm">See our quality craftsmanship up close</p>
            </div>
          </div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• 15. GALLERY â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section id="projects" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #120c06 50%, #1a1a1a 100%)" }} />
        <BlueprintGrid opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <AnimatedSection>
            <SectionHeader badge="Our Work" title="Recent Projects" accent={ACCENT} />
          </AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {galleryImages.slice(0, 4).map((src, i) => {
              const titles = ["Custom Home Build", "Kitchen Renovation", "Commercial Buildout", "Room Addition"];
              return (
                <div key={i} className="group relative rounded-2xl overflow-hidden border border-white/[0.10] hover:border-opacity-30 transition-all duration-500">
                  <img src={src} alt={titles[i]} className="w-full h-64 object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-lg font-bold text-white mb-1">{titles[i]}</h3>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• 16. FAQ â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0a1218 50%, #1a1a1a 100%)" }} />
        <BlueprintGrid opacity={0.02} accent={ACCENT} />
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <AnimatedSection>
            <SectionHeader badge="FAQ" title="Common Questions" accent={ACCENT} />
          </AnimatedSection>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} question={faq.q} answer={faq.a} isOpen={openFaq === i}
                onToggle={() => setOpenFaq(openFaq === i ? null : i)} />
            ))}
          </div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• 17. SERVICE AREA â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #120c06 50%, #1a1a1a 100%)" }} />
        <BlueprintGrid opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <AnimatedSection>
            <SectionHeader badge="Service Area" title="Where We Build" accent={ACCENT} />
          </AnimatedSection>
          <div className="text-center">
            <GlassCard className="p-8 inline-block">
              <div className="flex items-center gap-3 text-lg">
                <MapPin size={24} weight="duotone" style={{ color: ACCENT }} />
                <MapLink address={data.address} className="text-white font-semibold" />
              </div>
              <p className="text-slate-400 text-sm mt-2">&amp; Surrounding Areas</p>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• 18. MID-PAGE CTA â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="relative z-10 py-20 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT}cc, ${ACCENT})` }} />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='40' height='40' fill='none'/%3E%3Cpath d='M0 0L40 40M40 0L0 40' stroke='%23000' stroke-width='0.5'/%3E%3C/svg%3E\")" }} />
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <HardHat size={48} weight="fill" className="mx-auto mb-6 text-white/70" />
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-4">Ready to Build?</h2>
          <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">From concept to completion, we bring your construction project to life with expert craftsmanship.</p>
          <PhoneLink phone={data.phone} className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-white text-black font-bold text-lg hover:bg-white/90 transition-colors">
            <Phone size={22} weight="fill" /> Call {data.phone}
          </PhoneLink>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• 19. HOURS â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      {data.hours && (
        <section className="relative z-10 py-24 md:py-32 overflow-hidden">
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0a1218 50%, #1a1a1a 100%)" }} />
          <StructureBg opacity={0.02} accent={ACCENT} />
          <div className="max-w-3xl mx-auto px-6 relative z-10">
            <AnimatedSection>
              <SectionHeader badge="Hours" title="When We&apos;re Available" accent={ACCENT} />
            </AnimatedSection>
            <div className="text-center">
              <ShimmerBorder accent={ACCENT}>
                <div className="p-8">
                  <Clock size={32} weight="duotone" style={{ color: ACCENT }} className="mx-auto mb-4" />
                  <p className="text-slate-300 leading-relaxed whitespace-pre-line text-lg">{data.hours}</p>
                </div>
              </ShimmerBorder>
            </div>
          </div>
        </section>
      )}

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• 20. CONTACT FORM â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section id="contact" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #120c06 50%, #1a1a1a 100%)" }} />
        <BlueprintGrid opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border"
                style={{ color: ACCENT, borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}>Contact Us</span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6 text-white">Start Your Project</h2>
              <p className="text-slate-400 leading-relaxed mb-8">Ready to build? Contact {data.businessName} today for a free, no-obligation consultation and estimate.</p>
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: ACCENT_GLOW }}>
                    <MapPin size={20} weight="duotone" style={{ color: ACCENT }} />
                  </div>
                  <div><p className="text-sm font-semibold text-white">Address</p><MapLink address={data.address} className="text-sm text-slate-400" /></div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: ACCENT_GLOW }}>
                    <Phone size={20} weight="duotone" style={{ color: ACCENT }} />
                  </div>
                  <div><p className="text-sm font-semibold text-white">Phone</p><PhoneLink phone={data.phone} className="text-sm text-slate-400" /></div>
                </div>
                {data.hours && (
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: ACCENT_GLOW }}>
                      <Clock size={20} weight="duotone" style={{ color: ACCENT }} />
                    </div>
                    <div><p className="text-sm font-semibold text-white">Hours</p><p className="text-sm text-slate-400 whitespace-pre-line">{data.hours}</p></div>
                  </div>
                )}
              </div>
            </div>
            <GlassCard className="p-8">
              <h3 className="text-xl font-semibold text-white mb-6">Request a Free Estimate</h3>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className="block text-sm text-slate-400 mb-1.5">First Name</label>
                    <input type="text" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 focus:outline-none text-sm" placeholder="John" /></div>
                  <div><label className="block text-sm text-slate-400 mb-1.5">Last Name</label>
                    <input type="text" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 focus:outline-none text-sm" placeholder="Doe" /></div>
                </div>
                <div><label className="block text-sm text-slate-400 mb-1.5">Phone</label>
                  <input type="tel" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 focus:outline-none text-sm" placeholder="(206) 287-2304" /></div>
                <div><label className="block text-sm text-slate-400 mb-1.5">Project Type</label>
                  <select className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white focus:outline-none text-sm">
                    <option value="" className="bg-neutral-900">Select a project type</option>
                    {PROJECT_TYPES.map((p) => (
                      <option key={p.name} value={p.name.toLowerCase()} className="bg-neutral-900">{p.name}</option>
                    ))}
                  </select></div>
                <div><label className="block text-sm text-slate-400 mb-1.5">Project Details</label>
                  <textarea rows={3} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 focus:outline-none text-sm resize-none" placeholder="Describe your construction project..." /></div>
                <MagneticButton className="w-full py-4 rounded-xl text-base font-semibold text-white flex items-center justify-center gap-2 cursor-pointer"
                  style={{ background: ACCENT } as React.CSSProperties}>
                  Get Free Estimate <ArrowRight size={18} weight="bold" />
                </MagneticButton>
              </form>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• 21. PROMISE â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="relative z-10 py-16 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0a1218 100%)" }} />
        <BlueprintGrid opacity={0.015} accent={ACCENT} />
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <ShimmerBorder accent={ACCENT}>
            <div className="p-8 md:p-12">
              <ShieldCheck size={48} weight="fill" style={{ color: ACCENT }} className="mx-auto mb-4" />
              <h2 className="text-2xl md:text-4xl font-extrabold text-white mb-4">Our Quality Commitment</h2>
              <p className="text-slate-400 leading-relaxed max-w-2xl mx-auto text-lg">
                {data.businessName} stands behind every project with industry-leading warranties and a commitment to excellence.
              </p>
              <div className="flex flex-wrap justify-center gap-4 mt-8">
                {["Licensed & Bonded", "Permits Handled", "Written Warranty", "On-Time Guarantee"].map((item) => (
                  <span key={item} className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border"
                    style={{ color: ACCENT, borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}>
                    <CheckCircle size={16} weight="fill" /> {item}
                  </span>
                ))}
              </div>
            </div>
          </ShimmerBorder>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• 22. FOOTER â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <footer className="relative z-10 border-t border-white/8 py-10 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #111 100%)" }} />
        <BlueprintGrid opacity={0.015} accent={ACCENT} />
        <div className="mx-auto max-w-6xl px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <HardHat size={22} weight="fill" style={{ color: ACCENT }} />
                <span className="text-lg font-bold text-white">{data.businessName}</span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">
                {data.about.length > 120 ? data.about.slice(0, 120).trim() + "..." : data.about}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-3">Quick Links</h4>
              <div className="space-y-2">
                {["Services", "About", "Projects", "Reviews", "Contact"].map((link) => (
                  <a key={link} href={`#${link.toLowerCase()}`} className="block text-sm text-slate-500 hover:text-white transition-colors">{link}</a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-3">Contact</h4>
              <div className="space-y-2 text-sm text-slate-500">
                <p><PhoneLink phone={data.phone} /></p>
                <p><MapLink address={data.address} /></p>
                {data.socialLinks && Object.entries(data.socialLinks).map(([platform, url]) => (
                  <a key={platform} href={url} target="_blank" rel="noopener noreferrer"
                    className="block hover:text-white transition-colors capitalize">{platform}</a>
                ))}
              </div>
            </div>
          </div>
          <div className="border-t border-white/8 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <HardHat size={14} weight="fill" style={{ color: ACCENT }} />
              <span>{data.businessName} &copy; {new Date().getFullYear()}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <BluejayLogo className="w-4 h-4" />
              <span>Built by <a href="https://bluejayportfolio.com/audit" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "underline" }}>BlueJays</a> — get your free site audit</span>
            </div>
          </div>
        </div>
      </footer>

      <ClaimBanner businessName={data.businessName} accentColor={ACCENT} prospectId={data.id} />
      <div className="h-14 md:h-28" />
    </main>
  );
}
