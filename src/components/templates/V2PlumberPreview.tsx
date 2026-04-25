"use client";

/* eslint-disable @next/next/no-img-element -- These static marketing and preview components intentionally use plain img tags to preserve existing markup and visual behavior during lint-only cleanup. */
/* eslint-disable react-hooks/purity -- Decorative particle values are intentionally randomized for static visual effects in these marketing pages and previews; this preserves existing appearance without changing business logic. */

import { useState, useRef, useCallback } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  AnimatePresence,
} from "framer-motion";
import {
  Drop,
  Wrench,
  Flame,
  Bathtub,
  Pipe,
  Warning,
  Phone,
  MapPin,
  Clock,
  ArrowRight,
  Star,
  ShieldCheck,
  CaretDown,
  CheckCircle,
  X,
  List,
  Timer,
  Certificate,
  ThumbsUp,
  Toilet,
  Funnel,
  Plug,
  PlayCircle,
  SealCheck,
  CurrencyDollar,
  Lightning,
  Trophy,
  Question,
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
const SLATE = "#0f172a";
const DEFAULT_BLUE = "#1e40af";
const TEAL = "#0d9488";
const TEAL_LIGHT = "#14b8a6";

function getAccent(accentColor?: string) {
  const c = accentColor || DEFAULT_BLUE;
  return { BLUE: c, BLUE_GLOW: `${c}26`, TEAL, TEAL_LIGHT, TEAL_GLOW: `${TEAL}26` };
}

// Rotating palette applied to service/feature grid icon tiles so each
// card reads as a distinct slot. Brand TEAL still owns headers + CTAs.
const PALETTE = ["#0d9488", "#1e40af", "#f59e0b", "#10b981", "#06b6d4", "#14b8a6"];
const pickPaletteColor = (i: number) => PALETTE[i % PALETTE.length];

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ SERVICE ICON MAP â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SERVICE_ICON_MAP: Record<string, any> = {
  drain: Pipe, pipe: Pipe, water: Drop, heater: Flame, hot: Flame,
  emergency: Warning, bath: Bathtub, tub: Bathtub, repair: Wrench,
  sewer: Pipe, faucet: Drop, leak: Drop, toilet: Bathtub, gas: Flame,
};

function getServiceIcon(serviceName: string) {
  const lower = serviceName.toLowerCase();
  for (const [key, Icon] of Object.entries(SERVICE_ICON_MAP)) {
    if (lower.includes(key)) return Icon;
  }
  return Wrench;
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ SERVICE TYPE BADGES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const SERVICE_TYPE_BADGES = [
  { label: "Emergency Plumbing", icon: Warning },
  { label: "Drain Cleaning", icon: Funnel },
  { label: "Water Heaters", icon: Flame },
  { label: "Sewer Repair", icon: Pipe },
  { label: "Repiping", icon: Wrench },
  { label: "Leak Detection", icon: Drop },
];

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ UPFRONT PRICING â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const PRICING_CARDS = [
  { service: "Drain Cleaning", price: "from $99", icon: Funnel, desc: "Clogged sink, shower, or main line cleared fast." },
  { service: "Water Heater Install", price: "from $1,200", icon: Flame, desc: "Tank or tankless â€” expert installation with warranty." },
  { service: "Leak Repair", price: "from $149", icon: Drop, desc: "Stop leaks before they cause major damage." },
];

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ WHAT WE FIX â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const WHAT_WE_FIX = [
  { label: "Clogged Drains", icon: Funnel },
  { label: "Leaking Pipes", icon: Drop },
  { label: "Water Heaters", icon: Flame },
  { label: "Sewer Lines", icon: Pipe },
  { label: "Toilets & Faucets", icon: Toilet },
  { label: "Garbage Disposals", icon: Plug },
  { label: "Gas Lines", icon: Lightning },
  { label: "Water Filtration", icon: Drop },
];

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ PLUMBING PROCESS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const PLUMBING_PROCESS_STEPS = [
  { num: "01", title: "Call 24/7", desc: "Reach us any time, day or night.", icon: Phone },
  { num: "02", title: "Fast Diagnosis", desc: "Licensed plumber inspects the issue on-site.", icon: Wrench },
  { num: "03", title: "Upfront Price", desc: "No surprises â€” you approve the cost before we start.", icon: CurrencyDollar },
  { num: "04", title: "Problem Solved", desc: "Fixed right the first time, guaranteed.", icon: CheckCircle },
];

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ WHY CHOOSE US PILLARS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const WHY_CHOOSE_PILLARS = [
  { title: "Licensed Master Plumber", desc: "Trained, certified, code-compliant.", icon: Certificate },
  { title: "24/7 Emergency Service", desc: "Burst pipes at 3 AM? We are on the way.", icon: Clock },
  { title: "Upfront Pricing", desc: "No hidden fees, no surprises, ever.", icon: CurrencyDollar },
  { title: "Satisfaction Guaranteed", desc: "If you are not happy, we make it right.", icon: Trophy },
];

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ COMPETITOR COMPARISON â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const COMPARISON_ROWS = [
  { feature: "Licensed & Insured", us: true, them: "Varies" },
  { feature: "Pulls Permits", us: true, them: "Rarely" },
  { feature: "Code Compliant Work", us: true, them: "No" },
  { feature: "Parts & Labor Warranty", us: true, them: "No" },
  { feature: "24/7 Emergency Service", us: true, them: "No" },
  { feature: "Camera Inspection", us: true, them: "No" },
  { feature: "Upfront Pricing", us: true, them: "Sometimes" },
];

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ QUIZ OPTIONS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const QUIZ_OPTIONS = [
  { label: "Clogged Drain", note: "Common fix â€” we clear it fast", icon: Funnel, color: "#22c55e" },
  { label: "Leak or Burst Pipe", note: "Emergency! Call now", icon: Drop, color: "#ef4444" },
  { label: "Water Heater Problem", note: "No hot water? We can help", icon: Flame, color: "#f59e0b" },
  { label: "Sewer / Main Line", note: "Serious â€” call now", icon: Pipe, color: "#ef4444" },
];

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ STOCK FALLBACK IMAGES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const STOCK_HERO_POOL = ["https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=1400&q=80"];
const STOCK_ABOUT_POOL = ["https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=800&q=80"];
const STOCK_PROJECTS = [
  "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=600&q=80",
  "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=600&q=80",
  "https://images.unsplash.com/photo-1542013936693-884638332954?w=600&q=80",
  "https://images.unsplash.com/photo-1583907659441-addbe699e921?w=600&q=80",
];

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ FLOATING WATER DROPS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function FloatingWaterDrops() {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i, x: Math.random() * 100, delay: Math.random() * 10,
    duration: 7 + Math.random() * 7, size: 3 + Math.random() * 5, opacity: 0.1 + Math.random() * 0.25,
  }));

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden hidden md:block">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute"
          style={{ left: `${p.x}%`, width: p.size, height: p.size * 1.4, background: TEAL_LIGHT, borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%", willChange: "transform, opacity" }}
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

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ WATER FLOW SVG â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function WaterFlowSVG({ opacity = 0.04, accent }: { opacity?: number; accent: string }) {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }} viewBox="0 0 1000 600" preserveAspectRatio="none">
      <motion.path d="M0 300 Q250 200 500 300 T1000 300" stroke={TEAL} strokeWidth="2" fill="none" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 3, ease: "easeInOut" }} />
      <motion.path d="M0 350 Q250 250 500 350 T1000 350" stroke={accent} strokeWidth="1.5" fill="none" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 3.5, ease: "easeInOut", delay: 0.3 }} />
      <motion.path d="M0 400 Q250 300 500 400 T1000 400" stroke={TEAL_LIGHT} strokeWidth="1" fill="none" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 4, ease: "easeInOut", delay: 0.6 }} />
    </svg>
  );
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ PIPE PATTERN â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function PipePattern({ opacity = 0.03, accent }: { opacity?: number; accent: string }) {
  const patternId = `pipeGridV2Prev-${accent.replace("#", "")}`;
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }}>
      <defs>
        <pattern id={patternId} width="80" height="80" patternUnits="userSpaceOnUse">
          <path d="M0 40 L30 40 L30 10 L50 10 L50 40 L80 40" fill="none" stroke={accent} strokeWidth="0.5" />
          <path d="M40 0 L40 30 L70 30 L70 60 L40 60 L40 80" fill="none" stroke={TEAL} strokeWidth="0.5" />
          <circle cx="30" cy="10" r="2" fill={accent} opacity="0.3" />
          <circle cx="70" cy="60" r="2" fill={TEAL} opacity="0.3" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
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
      <motion.a href={href} ref={ref as unknown as React.Ref<HTMLAnchorElement>} style={{ x: springX, y: springY, willChange: "transform", ...style }} onMouseMove={handleMouseMove as unknown as React.MouseEventHandler<HTMLAnchorElement>} onMouseLeave={handleMouseLeave} className={className} whileTap={{ scale: 0.97 }}>{children}</motion.a>
    );
  }
  return (
    <motion.button ref={ref} style={{ x: springX, y: springY, willChange: "transform", ...style }} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} onClick={onClick} className={className} whileTap={{ scale: 0.97 }}>{children}</motion.button>
  );
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ SHIMMER BORDER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function ShimmerBorder({ children, className = "", accent }: { children: React.ReactNode; className?: string; accent: string }) {
  return (
    <div className={`relative rounded-2xl p-[1px] overflow-hidden ${className}`}>
      <motion.div className="absolute inset-0 rounded-2xl" style={{ background: `conic-gradient(from 0deg, transparent, ${accent}, transparent, ${TEAL}, transparent)`, willChange: "transform" }} animate={{ rotate: [0, 360] }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} />
      <div className="relative rounded-2xl bg-[#0f172a] z-10">{children}</div>
    </div>
  );
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ ACCORDION â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function AccordionItem({ question, answer, isOpen, onToggle }: { question: string; answer: string; isOpen: boolean; onToggle: () => void }) {
  return (
    <GlassCard className="overflow-hidden">
      <button onClick={onToggle} className="w-full flex items-center justify-between p-5 md:p-6 text-left group cursor-pointer">
        <span className="text-lg font-semibold text-white pr-4">{question}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={spring}><CaretDown size={20} className="text-slate-400 shrink-0" /></motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={spring} className="overflow-hidden">
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
      <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: accent, borderColor: `${accent}33`, background: `${accent}0d` }}>{badge}</span>
      <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white">{title}</h2>
      <div className="h-0.5 w-16 mx-auto mt-4" style={{ background: `linear-gradient(to right, ${accent}, transparent)` }} />
      {subtitle && <p className="text-slate-400 mt-4 max-w-2xl text-lg leading-relaxed mx-auto">{subtitle}</p>}
    </div>
  );
}


/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   MAIN PREVIEW COMPONENT
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ ANIMATED SECTION â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function AnimatedSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 1, x: -50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: "easeOut" as const }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function V2PlumberPreview({ data }: { data: GeneratedSiteData }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const { BLUE, BLUE_GLOW, TEAL_GLOW } = getAccent(data.accentColor);

  const uniquePhotos = data.photos ? [...new Set(data.photos)] : [];


  const heroImage = uniquePhotos[0] || pickFromPool(STOCK_HERO_POOL, data.businessName);


  const heroCardImage = uniquePhotos[1] || pickFromPool(STOCK_ABOUT_POOL, data.businessName, 1);


  const aboutImage = uniquePhotos[2] || pickFromPool(STOCK_ABOUT_POOL, data.businessName, 2);
  const usedUrls = new Set([heroImage, heroCardImage, aboutImage].filter(Boolean));
  const projectFromReal = uniquePhotos.slice(3).filter((u) => !usedUrls.has(u));
  const projectImages =
    projectFromReal.length >= 4
      ? projectFromReal.slice(0, 4)
      : [
          ...projectFromReal,
          ...pickGallery(STOCK_PROJECTS, data.businessName).filter(
            (u) => !usedUrls.has(u) && !projectFromReal.includes(u)
          ),
        ].slice(0, 4);
  const phoneDigits = data.phone.replace(/\D/g, "");

  const processSteps = [
    { step: "01", title: "Call or Book Online", desc: `Contact ${data.businessName} any time. We will discuss your issue and schedule a visit that works for you.` },
    { step: "02", title: "On-Site Diagnosis", desc: "Our licensed plumber inspects the problem, explains what's happening, and gives you an upfront price â€” no surprises." },
    { step: "03", title: "Expert Repair", desc: "We fix it right the first time using quality parts and proven techniques. Clean, professional work every time." },
    { step: "04", title: "Satisfaction Guaranteed", desc: "We clean up after ourselves and back every job with our satisfaction guarantee. Your peace of mind is our priority." },
  ];

  const faqs = [
    { q: `What plumbing services does ${data.businessName} offer?`, a: `We provide a full range of plumbing services including ${data.services.slice(0, 3).map(s => s.name).join(", ")}, and more. Contact us for a free estimate.` },
    { q: "Do you offer emergency plumbing service?", a: `Yes! ${data.businessName} offers 24/7 emergency plumbing service. Burst pipes, overflowing toilets, major leaks â€” we respond fast to protect your home.` },
    { q: "How much does a plumber cost?", a: "We provide upfront pricing before any work begins. No hidden fees, no surprises. Call for a free estimate on your specific issue." },
    { q: "Are your plumbers licensed and insured?", a: `Every plumber at ${data.businessName} is fully licensed, bonded, and insured. We are committed to professional, code-compliant work on every job.` },
  ];

  /* Fallback testimonials */
  const fallbackTestimonials = [
    { name: "Gary N.", text: "Fixed our burst pipe at 3 AM. Fast response, fair price, and saved us from major water damage.", rating: 5 },
    { name: "Debbie R.", text: "Complete bathroom remodel plumbing done perfectly. Everything works flawlessly.", rating: 5 },
    { name: "Howard K.", text: "Honest plumber who doesn't try to sell you things you don't need. Refreshing and reliable.", rating: 5 }
  ];
  const testimonials = data.testimonials?.length > 0 ? data.testimonials : fallbackTestimonials;

  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden" style={{ fontFamily: "Inter, system-ui, sans-serif", background: SLATE, color: "#f1f5f9" }}>
      <FloatingWaterDrops />

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• 1. NAV â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-4">
          <GlassCard className="flex items-center justify-between px-4 md:px-6 py-3">
            <div className="flex items-center gap-2">
              <Drop size={24} weight="fill" style={{ color: TEAL }} />
              <span className="text-lg font-bold tracking-tight text-white">{data.businessName}</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
              <a href="#services" className="hover:text-white transition-colors">Services</a>
              <a href="#about" className="hover:text-white transition-colors">About</a>
              <a href="#projects" className="hover:text-white transition-colors">Projects</a>
              <a href="#contact" className="hover:text-white transition-colors">Contact</a>
            </div>
            <div className="flex items-center gap-3">
              <MagneticButton className="px-4 md:px-5 py-2 rounded-full text-sm font-semibold text-white transition-colors cursor-pointer" style={{ background: TEAL } as React.CSSProperties}>
                Get Free Estimate
              </MagneticButton>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors">
                {mobileMenuOpen ? <X size={24} /> : <List size={24} />}
              </button>
            </div>
          </GlassCard>
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3, ease: "easeInOut" }} className="md:hidden mt-2 overflow-hidden">
                <GlassCard className="flex flex-col gap-1 px-4 py-4">
                  {[{ label: "Services", href: "#services" }, { label: "About", href: "#about" }, { label: "Projects", href: "#projects" }, { label: "Contact", href: "#contact" }].map((link) => (
                    <a key={link.label} href={link.href} onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors">{link.label}</a>
                  ))}
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• BEAST MODE: EMERGENCY RESPONSE STRIP â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <div className="fixed top-0 left-0 right-0 z-[60] py-2 text-center" style={{ background: `linear-gradient(90deg, ${TEAL} 0%, #0f766e 50%, ${TEAL} 100%)` }}>
        <div className="flex items-center justify-center gap-3 text-sm font-bold text-white">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-white" />
          </span>
          <span>Burst Pipe? We&apos;re There in 60 Minutes</span>
          <span className="hidden sm:inline">â€”</span>
          <a href={`tel:${phoneDigits}`} className="underline underline-offset-2 hover:no-underline hidden sm:inline">
            Call {data.phone}
          </a>
          <a href={`tel:${phoneDigits}`} className="underline underline-offset-2 sm:hidden">Call Now</a>
        </div>
      </div>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• 2. HERO â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="relative min-h-[100dvh] flex items-center pt-32 z-10 overflow-hidden">

        <div className="absolute inset-0">
          <img src={heroImage} alt={`${data.businessName}`} className="w-full h-full object-cover object-center" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          <div className="space-y-8">
            <div>
              <p className="text-sm uppercase tracking-widest mb-4" style={{ color: TEAL }}> Licensed Master Plumbers</p>
              <h1 className="text-3xl md:text-6xl tracking-tighter leading-none font-bold text-white" style={{ textShadow: "0 2px 20px rgba(0,0,0,0.8), 0 4px 40px rgba(0,0,0,0.5)" }}>{data.tagline}</h1>
            </div>
            <p className="text-lg text-slate-400 max-w-md leading-relaxed">{(() => { const t = data.about; if (t.length <= 180) return t; const dot = t.indexOf('.', 80); return dot > 0 && dot < 220 ? t.slice(0, dot + 1) : t.slice(0, 180).trim() + '...'; })()}</p>
            <div className="flex flex-wrap gap-4">
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white flex items-center gap-2 cursor-pointer" style={{ background: TEAL } as React.CSSProperties}>
                Get Free Estimate <ArrowRight size={18} weight="bold" />
              </MagneticButton>
              <MagneticButton href={`tel:${phoneDigits}`} className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/15 flex items-center gap-2 cursor-pointer">
                <Phone size={18} weight="duotone" /> <PhoneLink phone={data.phone} />
              </MagneticButton>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-slate-400">
              <span className="flex items-center gap-2"><MapPin size={16} weight="duotone" style={{ color: TEAL }} /> <MapLink address={data.address} /></span>
              <span className="flex items-center gap-2"><Clock size={16} weight="duotone" style={{ color: TEAL }} /> 24/7 Emergency Available</span>
            </div>
          </div>

          <div className="hidden md:block relative">
            <div className="relative rounded-2xl overflow-hidden border border-white/15">
              <img src={heroCardImage} alt={`${data.businessName} plumber`} className="w-full h-[500px] object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0f172a]/40 to-transparent" />
              <div className="absolute bottom-6 left-6 flex items-center gap-3">
                <div className="px-4 py-2 rounded-full backdrop-blur-md bg-black/50 border flex items-center gap-2" style={{ borderColor: `${TEAL}4d` }}>
                  <ShieldCheck size={18} weight="fill" style={{ color: TEAL }} />
                  <span className="text-sm font-semibold text-white">Licensed &amp; Insured</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• FEATURE 1: SERVICE TYPE BADGES â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="relative z-10 py-8 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #0c1222 0%, #0f172a 100%)" }} />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="flex flex-wrap justify-center gap-3">
            {SERVICE_TYPE_BADGES.map((badge) => (
              <div key={badge.label} className="flex items-center gap-2 px-4 py-2.5 rounded-full border text-sm font-medium" style={{ color: TEAL, borderColor: `${TEAL}33`, background: `${TEAL}0d` }}>
                <badge.icon size={16} weight="fill" style={{ color: TEAL }} />
                {badge.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• 3. STATS â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="relative z-10 py-16 overflow-hidden border-y" style={{ borderColor: `${TEAL}1a` }}>
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #0c1222 0%, #0f172a 100%)" }} />
        <PipePattern opacity={0.02} accent={BLUE} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] rounded-full blur-[180px]" style={{ background: `${TEAL}08` }} /></div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {data.stats.map((stat, i) => {
              const statIcons = [ShieldCheck, Drop, Clock, Star];
              const Icon = statIcons[i % statIcons.length];
              return (
                <div key={stat.label} className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2"><Icon size={22} weight="fill" style={{ color: TEAL }} /><span className="text-3xl md:text-4xl font-extrabold text-white">{stat.value}</span></div>
                  <span className="text-slate-500 text-sm font-medium tracking-wide uppercase">{stat.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• 4. SERVICES â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section id="services" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #0f172a 0%, #0c1222 50%, #0f172a 100%)" }} />
        <PipePattern accent={BLUE} />
        <WaterFlowSVG opacity={0.025} accent={BLUE} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[10%] right-[5%] w-[500px] h-[500px] rounded-full blur-[160px]" style={{ background: `${TEAL}08` }} />
          <div className="absolute bottom-[10%] left-[5%] w-[400px] h-[400px] rounded-full blur-[140px]" style={{ background: `${BLUE}05` }} />
        </div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Our Services" title="Expert Plumbing Services" subtitle={`From leaky faucets to complete repiping, ${data.businessName} delivers reliable, professional plumbing every time.`} accent={TEAL} />

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.services.map((service, i) => {
              const Icon = getServiceIcon(service.name);
              const tile = pickPaletteColor(i);
              return (
                <div key={service.name} className="group relative p-7 rounded-2xl border border-white/[0.10] hover:border-opacity-30 transition-all duration-500 overflow-hidden bg-white/[0.07]">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: `radial-gradient(circle at 50% 0%, ${tile}15, transparent 70%)` }} />
                  <div className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `linear-gradient(to right, transparent, ${tile}4d, transparent)` }} />
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-5">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 border" style={{ background: `${tile}22`, borderColor: `${tile}55` }}>
                        <Icon size={24} weight="duotone" style={{ color: tile }} />
                      </div>
                      <span className="text-xs font-mono" style={{ color: `${tile}99` }}>{String(i + 1).padStart(2, "0")}</span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{service.name}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{service.description || ""}</p>
                    {service.price && <p className="text-sm font-semibold mt-3" style={{ color: TEAL }}>{service.price}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• FEATURE 3: WHAT WE FIX â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #0f172a 0%, #0c1222 50%, #0f172a 100%)" }} />
        <WaterFlowSVG opacity={0.02} accent={BLUE} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[30%] right-[10%] w-[500px] h-[500px] rounded-full blur-[180px]" style={{ background: `${TEAL}06` }} /></div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="What We Fix" title="Common Plumbing Problems" subtitle="From minor drips to major emergencies, we handle it all." accent={TEAL} />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {WHAT_WE_FIX.map((item, i) => {
              const tile = pickPaletteColor(i + 2);
              return (
                <GlassCard key={item.label} className="p-5 text-center group hover:border-white/20 transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center border transition-all duration-300" style={{ background: `${tile}22`, borderColor: `${tile}55` }}>
                    <item.icon size={24} weight="duotone" style={{ color: tile }} />
                  </div>
                  <p className="text-sm font-semibold text-white">{item.label}</p>
                </GlassCard>
              );
            })}
          </div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• FEATURE 2: UPFRONT PRICING â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #0f172a 0%, #0c1830 50%, #0f172a 100%)" }} />
        <PipePattern opacity={0.02} accent={BLUE} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute bottom-[20%] left-[10%] w-[500px] h-[500px] rounded-full blur-[180px]" style={{ background: `${BLUE}06` }} /></div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Transparent Pricing" title="Upfront, Honest Pricing" subtitle="No hidden fees. Know the cost before we start." accent={TEAL} />
          <div className="grid md:grid-cols-3 gap-6">
            {PRICING_CARDS.map((card) => (
              <GlassCard key={card.service} className="p-7 text-center group hover:border-white/20 transition-all duration-300 relative overflow-hidden">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: `radial-gradient(circle at 50% 0%, ${TEAL}10, transparent 70%)` }} />
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-xl mx-auto mb-4 flex items-center justify-center border" style={{ background: TEAL_GLOW, borderColor: `${TEAL}33` }}>
                    <card.icon size={28} weight="duotone" style={{ color: TEAL }} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">{card.service}</h3>
                  <p className="text-2xl font-extrabold mb-3" style={{ color: TEAL }}>{card.price}</p>
                  <p className="text-sm text-slate-400 leading-relaxed">{card.desc}</p>
                </div>
              </GlassCard>
            ))}
          </div>
          <p className="text-center text-xs text-slate-500 mt-6">* Final pricing depends on the scope of work. Free estimates always.</p>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• FEATURE 4: PLUMBING PROCESS â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #0f172a 0%, #0c1222 50%, #0f172a 100%)" }} />
        <PipePattern opacity={0.025} accent={BLUE} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[20%] left-[15%] w-[500px] h-[500px] rounded-full blur-[180px]" style={{ background: `${TEAL}06` }} /></div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="How It Works" title="4 Simple Steps" accent={TEAL} />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PLUMBING_PROCESS_STEPS.map((step, i) => (
              <div key={step.num} className="relative">
                {i < PLUMBING_PROCESS_STEPS.length - 1 && (
                  <div className="hidden lg:flex absolute top-10 left-[calc(50%+40px)] w-[calc(100%-80px)] items-center">
                    <div className="h-px flex-1" style={{ background: `linear-gradient(to right, ${TEAL}33, ${TEAL}11)` }} />
                    <ArrowRight size={14} style={{ color: `${TEAL}44` }} className="shrink-0 -ml-1" />
                  </div>
                )}
                <GlassCard className="p-6 text-center">
                  <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center border" style={{ background: `linear-gradient(135deg, ${TEAL}22, ${TEAL}0a)`, borderColor: `${TEAL}33` }}>
                    <step.icon size={24} weight="duotone" style={{ color: TEAL }} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
                </GlassCard>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• 5. PROCESS â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #0f172a 0%, #0c1222 50%, #0f172a 100%)" }} />
        <PipePattern opacity={0.025} accent={BLUE} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] rounded-full blur-[180px]" style={{ background: `${TEAL}06` }} /></div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <AnimatedSection>          <SectionHeader badge="Our Process" title="How We Work" accent={TEAL} /></AnimatedSection>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {processSteps.map((step, i) => (
              <div key={step.step} className="relative">
                {i < processSteps.length - 1 && <div className="hidden lg:block absolute top-10 left-[calc(50%+40px)] w-[calc(100%-80px)] h-px" style={{ background: `linear-gradient(to right, ${TEAL}33, ${TEAL}11)` }} />}
                <GlassCard className="p-6 text-center relative">
                  <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-black" style={{ background: `linear-gradient(135deg, ${TEAL}22, ${TEAL}0a)`, color: TEAL, border: `1px solid ${TEAL}33` }}>{step.step}</div>
                  <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
                </GlassCard>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• 6. ABOUT â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section id="about" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #0f172a 0%, #0c1830 50%, #0f172a 100%)" }} />
        <WaterFlowSVG opacity={0.02} accent={BLUE} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[20%] left-[10%] w-[500px] h-[500px] rounded-full blur-[180px]" style={{ background: `${BLUE}06` }} /></div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="relative">
              <div className="rounded-2xl overflow-hidden border border-white/15">
                <img src={aboutImage} alt={`${data.businessName} team`} className="w-full h-[400px] object-cover" />
              </div>
              <div className="absolute -bottom-4 -right-4 md:bottom-6 md:-right-6">
                <div className="px-5 py-3 rounded-xl backdrop-blur-md border text-white font-bold text-sm shadow-lg" style={{ background: `${TEAL}e6`, borderColor: `${TEAL}80` }}>
                  {data.stats[0] ? `${data.stats[0].value} ${data.stats[0].label}` : "Trusted Experts"}
                </div>
              </div>
            </div>
            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: TEAL, borderColor: `${TEAL}33`, background: `${TEAL}0d` }}>Why Choose Us</span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6 text-white">Your Most Trusted Plumbers</h2>
              <p className="text-slate-400 leading-relaxed mb-8">{data.about}</p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: ShieldCheck, label: "Fully Licensed" },
                  { icon: Certificate, label: "Bonded & Insured" },
                  { icon: ThumbsUp, label: "5-Star Rated" },
                  { icon: Timer, label: "24/7 Emergency" },
                ].map((badge) => (
                  <GlassCard key={badge.label} className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: TEAL_GLOW }}>
                      <badge.icon size={20} weight="duotone" style={{ color: TEAL }} />
                    </div>
                    <span className="text-sm font-semibold text-white">{badge.label}</span>
                  </GlassCard>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• FEATURE 5: WHY CHOOSE US â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #0f172a 0%, #0c1222 50%, #0f172a 100%)" }} />
        <WaterFlowSVG opacity={0.02} accent={BLUE} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute bottom-[30%] right-[10%] w-[500px] h-[500px] rounded-full blur-[180px]" style={{ background: `${TEAL}08` }} /></div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Why Us" title="Why Choose Us" subtitle={`${data.businessName} delivers expert plumbing you can trust.`} accent={TEAL} />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {WHY_CHOOSE_PILLARS.map((pillar) => (
              <GlassCard key={pillar.title} className="p-7 text-center group hover:border-white/20 transition-all duration-300">
                <div className="w-14 h-14 rounded-xl mx-auto mb-4 flex items-center justify-center border transition-all duration-300" style={{ background: TEAL_GLOW, borderColor: `${TEAL}33` }}>
                  <pillar.icon size={28} weight="duotone" style={{ color: TEAL }} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{pillar.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{pillar.desc}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• BEAST MODE: HONEST PLUMBER PROMISE â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #0f172a 0%, #0a1020 50%, #0f172a 100%)" }} />
        <PipePattern opacity={0.02} accent={BLUE} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[30%] left-[20%] w-[400px] h-[400px] rounded-full blur-[160px]" style={{ background: `${TEAL}08` }} /></div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Our Promise" title="The Honest Plumber Promise" subtitle={`${data.businessName} believes you deserve a plumber you can trust â€” every single time.`} accent={TEAL} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "We Show You the Problem", desc: "Before we touch a wrench, we show you exactly what is wrong â€” no mystery, no guesswork.", icon: Wrench },
              { title: "Upfront Pricing", desc: "You get the full cost before work begins. No surprise charges, no hidden fees. Ever.", icon: CurrencyDollar },
              { title: "Clean Up After Every Job", desc: "We treat your home like our own. Drop cloths down, mess cleaned up, shoes off.", icon: ThumbsUp },
              { title: "Can't Fix It = You Don't Pay", desc: "If we cannot solve your plumbing problem, you owe us nothing. That is our guarantee.", icon: SealCheck },
            ].map((promise) => (
              <GlassCard key={promise.title} className="p-7 text-center group hover:border-white/20 transition-all duration-500">
                <div className="w-14 h-14 rounded-xl mx-auto mb-4 flex items-center justify-center border" style={{ background: `${TEAL}15`, borderColor: `${TEAL}33` }}>
                  <promise.icon size={28} weight="duotone" style={{ color: TEAL }} />
                </div>
                <h3 className="text-base font-bold text-white mb-2">{promise.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{promise.desc}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• 7. PROJECTS GALLERY â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section id="projects" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #0f172a 0%, #0c1830 50%, #0f172a 100%)" }} />
        <WaterFlowSVG opacity={0.02} accent={BLUE} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[30%] left-[20%] w-[500px] h-[500px] rounded-full blur-[200px]" style={{ background: `${TEAL}06` }} /></div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <AnimatedSection>          <SectionHeader badge="Our Work" title="Recent Projects" accent={TEAL} /></AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projectImages.map((src, i) => {
              const titles = ["Full Bathroom Remodel", "Whole-House Repiping", "Emergency Pipe Repair", "Water Heater Installation"];
              const descs = ["Complete plumbing renovation for a modern bathroom.", "Copper to PEX repiping for a residential home.", "24-hour emergency burst pipe response.", "Tankless water heater upgrade and installation."];
              return (
                <div key={i} className="group relative rounded-2xl overflow-hidden border border-white/[0.10] hover:border-opacity-30 transition-all duration-500">
                  <img src={src} alt={titles[i]} className="w-full h-64 object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-lg font-bold text-white mb-1">{titles[i]}</h3>
                    <p className="text-sm text-slate-300">{descs[i]}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• FEATURE 6: COMPETITOR COMPARISON â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #0f172a 0%, #0c1222 50%, #0f172a 100%)" }} />
        <PipePattern opacity={0.02} accent={BLUE} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[20%] left-[20%] w-[500px] h-[500px] rounded-full blur-[180px]" style={{ background: `${TEAL}06` }} /></div>
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Compare" title={`${data.businessName} vs. Handyman / DIY`} accent={TEAL} />
          <GlassCard className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/15">
                    <th className="text-left p-4 text-slate-400 font-medium">Feature</th>
                    <th className="text-center p-4 font-bold text-white">{data.businessName}</th>
                    <th className="text-center p-4 text-slate-500 font-medium">Handyman / DIY</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_ROWS.map((row, i) => (
                    <tr key={row.feature} className={i < COMPARISON_ROWS.length - 1 ? "border-b border-white/8" : ""}>
                      <td className="p-4 text-slate-300">{row.feature}</td>
                      <td className="p-4 text-center">
                        <CheckCircle size={20} weight="fill" className="inline-block" style={{ color: "#22c55e" }} />
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

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• FEATURE 7: VIDEO PLACEHOLDER â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #0f172a 0%, #0c1830 50%, #0f172a 100%)" }} />
        <WaterFlowSVG opacity={0.02} accent={BLUE} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[30%] right-[15%] w-[400px] h-[400px] rounded-full blur-[160px]" style={{ background: `${TEAL}08` }} /></div>
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <SectionHeader badge="See Our Work" title="Watch Us In Action" accent={TEAL} />
          <div className="relative rounded-2xl overflow-hidden border border-white/15 group cursor-pointer">
            <img src={projectImages[0] || heroImage} alt="See our plumbing work" className="w-full h-[300px] md:h-[420px] object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center transition-all duration-300 group-hover:bg-black/40">
              <div className="w-20 h-20 rounded-full flex items-center justify-center border-2 transition-transform duration-300 group-hover:scale-110" style={{ borderColor: TEAL, background: `${TEAL}33` }}>
                <PlayCircle size={48} weight="fill" style={{ color: TEAL }} />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
              <p className="text-white font-bold text-lg">See Our Work</p>
              <p className="text-slate-300 text-sm">Watch how we solve plumbing problems the right way.</p>
            </div>
          </div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• FEATURE 8: PLUMBING ISSUE QUIZ â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #0f172a 0%, #0c1222 50%, #0f172a 100%)" }} />
        <PipePattern opacity={0.02} accent={BLUE} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute bottom-[20%] left-[15%] w-[500px] h-[500px] rounded-full blur-[180px]" style={{ background: `${TEAL}06` }} /></div>
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Quick Help" title="What's Your Plumbing Issue?" subtitle="Select your problem and we will get you the right help." accent={TEAL} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {QUIZ_OPTIONS.map((opt) => (
              <GlassCard key={opt.label} className="p-6 group hover:border-white/20 transition-all duration-300 cursor-pointer relative overflow-hidden">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: `radial-gradient(circle at 50% 0%, ${opt.color}15, transparent 70%)` }} />
                <div className="relative z-10 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border" style={{ background: `${opt.color}15`, borderColor: `${opt.color}33` }}>
                    <opt.icon size={24} weight="duotone" style={{ color: opt.color }} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">{opt.label}</h3>
                    <p className="text-sm" style={{ color: opt.color }}>{opt.note}</p>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
          <div className="text-center mt-8">
            <MagneticButton href={`tel:${phoneDigits}`} className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-base font-semibold text-white cursor-pointer" style={{ background: TEAL } as React.CSSProperties}>
              <Phone size={20} weight="fill" /> Call Now for Fast Help
            </MagneticButton>
          </div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• FEATURE 9: GOOGLE REVIEWS HEADER â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• 8. TESTIMONIALS â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #0f172a 0%, #0c1222 50%, #0f172a 100%)" }} />
        <PipePattern opacity={0.02} accent={BLUE} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[20%] right-[15%] w-[400px] h-[400px] rounded-full blur-[160px]" style={{ background: `${TEAL}06` }} /></div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          {/* FEATURE 9: Google Reviews Header */}
          {(data.googleRating || data.reviewCount) && (
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="flex gap-0.5">{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={22} weight="fill" style={{ color: i < Math.round(data.googleRating || 5) ? "#facc15" : "#334155" }} />)}</div>
              <span className="text-white font-bold text-lg">{data.googleRating || "5.0"}</span>
              {data.reviewCount && <span className="text-slate-400 text-sm">({data.reviewCount}+ reviews)</span>}
            </div>
          )}
          <AnimatedSection>          <SectionHeader badge="Testimonials" title="What Our Clients Say" accent={TEAL} /></AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <GlassCard key={i} className="p-6 h-full flex flex-col">
                <div className="flex gap-0.5 mb-4">{Array.from({ length: t.rating || 5 }).map((_, j) => <Star key={j} size={16} weight="fill" style={{ color: TEAL }} />)}</div>
                <p className="text-slate-300 leading-relaxed flex-1 text-sm mb-4">&ldquo;{t.text}&rdquo;</p>
                <div className="pt-4 border-t border-white/8"><span className="text-sm font-semibold text-white">{t.name}</span></div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• 9. EMERGENCY CTA â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="relative z-10 py-20 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${TEAL}, ${TEAL}cc, ${TEAL})` }} />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='40' height='40' fill='none'/%3E%3Cpath d='M0 0L40 40M40 0L0 40' stroke='%23000' stroke-width='0.5'/%3E%3C/svg%3E\")" }} />

        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <Warning size={48} weight="fill" className="mx-auto mb-6 text-black/70" />
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-black mb-4">Plumbing Emergency? We&apos;re Here 24/7</h2>
          <p className="text-lg text-black/70 mb-8 max-w-xl mx-auto">Burst pipes, overflowing drains, major leaks â€” do not wait. Our emergency plumbers respond fast to protect your home.</p>
          <PhoneLink phone={data.phone} className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-black text-white font-bold text-lg hover:bg-black/80 transition-colors">
            <span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" /><span className="relative inline-flex rounded-full h-3 w-3 bg-red-600" /></span>
            {data.phone}
          </PhoneLink>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• 10. SERVICE AREAS â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #0f172a 0%, #0c1830 50%, #0f172a 100%)" }} />
        <PipePattern opacity={0.02} accent={BLUE} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[40%] right-[20%] w-[400px] h-[400px] rounded-full blur-[180px]" style={{ background: `${TEAL}06` }} /></div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <AnimatedSection>          <SectionHeader badge="Coverage Area" title="Areas We Serve" accent={TEAL} /></AnimatedSection>
          <div className="text-center">
            <GlassCard className="p-8 inline-block">
              <div className="flex items-center gap-3 text-lg"><MapPin size={24} weight="duotone" style={{ color: TEAL }} /><MapLink address={data.address} className="text-white font-semibold" /></div>
              <p className="text-slate-400 text-sm mt-2">&amp; Surrounding Areas</p>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• 11. HOURS â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      {data.hours && (
        <section className="relative z-10 py-24 md:py-32 overflow-hidden">
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #0f172a 0%, #0c1222 50%, #0f172a 100%)" }} />
          <WaterFlowSVG opacity={0.02} accent={BLUE} />
          <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[20%] left-[15%] w-[400px] h-[400px] rounded-full blur-[160px]" style={{ background: `${TEAL}06` }} /></div>
          <div className="max-w-3xl mx-auto px-6 relative z-10">
            <AnimatedSection>          <SectionHeader badge="Business Hours" title="When We're Available" accent={TEAL} /></AnimatedSection>
            <div className="text-center">
              <ShimmerBorder accent={TEAL}>
                <div className="p-8">
                  <Clock size={32} weight="duotone" style={{ color: TEAL }} className="mx-auto mb-4" />
                  <p className="text-slate-300 leading-relaxed whitespace-pre-line text-lg">{data.hours}</p>
                  <p className="text-sm mt-4 font-semibold" style={{ color: TEAL }}>Emergency Service: 24/7/365</p>
                </div>
              </ShimmerBorder>
            </div>
          </div>
        </section>
      )}

      
      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• MID-PAGE CTA â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="relative z-10 py-12 sm:py-16 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${TEAL}15, ${TEAL}08)` }} />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: TEAL }}>
            Don&apos;t Miss Out
          </p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-3">
            Ready to Get Started?
          </h2>
          <p className="text-slate-400 mb-6 text-sm sm:text-base">
            Limited time â€” claim your free professional website today before it&apos;s offered to a competitor.
          </p>
          <a
            href={`/claim/${data.id}`}
            className="inline-flex items-center gap-2 min-h-[48px] px-8 py-3 rounded-full text-white font-bold text-base hover:shadow-lg transition-all duration-300"
            style={{ background: TEAL }}
          >
            Claim This Website
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </a>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• 12. FAQ â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #0f172a 0%, #0c1222 50%, #0f172a 100%)" }} />
        <PipePattern opacity={0.02} accent={BLUE} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[20%] left-[15%] w-[400px] h-[400px] rounded-full blur-[160px]" style={{ background: `${TEAL}06` }} /></div>
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <AnimatedSection>          <SectionHeader badge="FAQ" title="Common Questions" accent={TEAL} /></AnimatedSection>
          <div className="space-y-3">
            {faqs.map((faq, i) => <AccordionItem key={i} question={faq.q} answer={faq.a} isOpen={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} />)}
          </div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• 13. CONTACT â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section id="contact" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #0f172a 0%, #0c1830 50%, #0f172a 100%)" }} />
        <PipePattern opacity={0.02} accent={BLUE} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] rounded-full blur-[180px]" style={{ background: `${TEAL}06` }} /></div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: TEAL, borderColor: `${TEAL}33`, background: `${TEAL}0d` }}>Contact Us</span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6 text-white">Get Your Free Estimate</h2>
              <p className="text-slate-400 leading-relaxed mb-8">Ready to fix that leak? Contact {data.businessName} today for a free, no-obligation estimate. We respond within 24 hours.</p>
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: TEAL_GLOW }}><MapPin size={20} weight="duotone" style={{ color: TEAL }} /></div>
                    <div><p className="text-sm font-semibold text-white">Address</p><MapLink address={data.address} className="text-sm text-slate-400" /></div>
                </div>
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: TEAL_GLOW }}><Phone size={20} weight="duotone" style={{ color: TEAL }} /></div>
                    <div><p className="text-sm font-semibold text-white">Phone</p><PhoneLink phone={data.phone} className="text-sm text-slate-400" /></div>
                </div>
                {[
                  { icon: Drop, label: "Emergency", value: "24/7/365 Emergency Plumbing" },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: TEAL_GLOW }}><item.icon size={20} weight="duotone" style={{ color: TEAL }} /></div>
                    <div><p className="text-sm font-semibold text-white">{item.label}</p><p className="text-sm text-slate-400">{item.value}</p></div>
                  </div>
                ))}
                {data.hours && (
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: TEAL_GLOW }}><Clock size={20} weight="duotone" style={{ color: TEAL }} /></div>
                    <div><p className="text-sm font-semibold text-white">Hours</p><p className="text-sm text-slate-400 whitespace-pre-line">{data.hours}</p></div>
                  </div>
                )}
              </div>
            </div>
            <GlassCard className="p-8">
              <h3 className="text-xl font-semibold text-white mb-6">Request a Free Estimate</h3>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className="block text-sm text-slate-400 mb-1.5">First Name</label><input type="text" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 focus:outline-none text-sm" placeholder="John" /></div>
                  <div><label className="block text-sm text-slate-400 mb-1.5">Last Name</label><input type="text" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 focus:outline-none text-sm" placeholder="Doe" /></div>
                </div>
                <div><label className="block text-sm text-slate-400 mb-1.5">Phone</label><input type="tel" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 focus:outline-none text-sm" placeholder="(206) 287-2304" /></div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">Service Needed</label>
                  <select className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white focus:outline-none text-sm">
                    <option value="" className="bg-neutral-900">Select a service</option>
                    {data.services.map((s) => <option key={s.name} value={s.name.toLowerCase().replace(/\s+/g, "-")} className="bg-neutral-900">{s.name}</option>)}
                  </select>
                </div>
                <div><label className="block text-sm text-slate-400 mb-1.5">Message</label><textarea rows={4} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 focus:outline-none text-sm resize-none" placeholder="Describe your plumbing issue..." /></div>
                <MagneticButton className="w-full py-4 rounded-xl text-base font-semibold text-white flex items-center justify-center gap-2 cursor-pointer" style={{ background: TEAL } as React.CSSProperties}>
                  Send Request <ArrowRight size={18} weight="bold" />
                </MagneticButton>
              </form>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• FEATURE 10: GUARANTEE CTA â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="relative z-10 py-16 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #0f172a 0%, #0c1222 100%)" }} />
        <PipePattern opacity={0.015} accent={BLUE} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full blur-[180px]" style={{ background: `${TEAL}08` }} /></div>
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <ShimmerBorder accent={TEAL}>
            <div className="p-8 md:p-12">
              <SealCheck size={56} weight="fill" style={{ color: TEAL }} className="mx-auto mb-4" />
              <h2 className="text-2xl md:text-4xl font-extrabold text-white mb-4">Every Job Done Right</h2>
              <p className="text-xl md:text-2xl font-bold mb-4" style={{ color: TEAL }}>Licensed, Insured, Guaranteed</p>
              <p className="text-slate-400 leading-relaxed max-w-2xl mx-auto text-lg mb-8">Every job by {data.businessName} is backed by our satisfaction guarantee. We stand behind our work with warranties on all plumbing repairs and installations.</p>
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                {["Licensed Master Plumber", "Free Estimates", "Satisfaction Guaranteed", "24/7 Emergency"].map((item) => (
                  <span key={item} className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border" style={{ color: TEAL, borderColor: `${TEAL}33`, background: `${TEAL}0d` }}>
                    <CheckCircle size={16} weight="fill" /> {item}
                  </span>
                ))}
              </div>
              <MagneticButton href={`tel:${phoneDigits}`} className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-base font-semibold text-white cursor-pointer" style={{ background: TEAL } as React.CSSProperties}>
                <Phone size={20} weight="fill" /> Call {data.businessName} Today
              </MagneticButton>
            </div>
          </ShimmerBorder>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• 15. FOOTER â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <footer className="relative z-10 border-t border-white/8 py-10 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #0f172a 0%, #0a1020 100%)" }} />
        <PipePattern opacity={0.015} accent={BLUE} />
        <div className="mx-auto max-w-6xl px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3"><Drop size={22} weight="fill" style={{ color: TEAL }} /><span className="text-lg font-bold text-white">{data.businessName}</span></div>
              <p className="text-sm text-slate-500 leading-relaxed">{data.about.length > 120 ? data.about.slice(0, 120).trim() + "..." : data.about}</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-3">Quick Links</h4>
              <div className="space-y-2">{["Services", "About", "Projects", "Contact"].map((link) => <a key={link} href={`#${link.toLowerCase()}`} className="block text-sm text-slate-500 hover:text-white transition-colors">{link}</a>)}</div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-3">Contact</h4>
              <div className="space-y-2 text-sm text-slate-500">
                <p><PhoneLink phone={data.phone} /></p><p><MapLink address={data.address} /></p>
                {data.socialLinks && Object.entries(data.socialLinks).map(([platform, url]) => <a key={platform} href={url} target="_blank" rel="noopener noreferrer" className="block hover:text-white transition-colors capitalize">{platform}</a>)}
              </div>
            </div>
          </div>
          <div className="border-t border-white/8 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-500"><Drop size={14} weight="fill" style={{ color: TEAL }} /><span>{data.businessName} &copy; {new Date().getFullYear()}</span></div>
            <div className="flex items-center gap-2 text-xs text-slate-600"><BluejayLogo className="w-4 h-4" /><span>Created by <a href="https://bluejayportfolio.com" target="_blank" rel="noopener noreferrer" style={{textDecoration:"underline"}}>bluejayportfolio.com</a></span></div>
          </div>
        </div>
      </footer>

      <ClaimBanner businessName={data.businessName} accentColor={TEAL} prospectId={data.id} />
      <div className="h-14 md:h-28" />
    </main>
  );
}
