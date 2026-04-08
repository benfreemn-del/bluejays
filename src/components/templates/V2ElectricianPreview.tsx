"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  AnimatePresence,
} from "framer-motion";
import {
  Lightning,
  Wrench,
  ShieldCheck,
  Clock,
  Phone,
  MapPin,
  CaretDown,
  List,
  X,
  Plug,
  LightbulbFilament,
  BatteryCharging,
  HouseLine,
  Buildings,
  Warning,
  ArrowRight,
  Star,
  CheckCircle,
} from "@phosphor-icons/react";
import type { GeneratedSiteData } from "@/lib/generator";
import BluejayLogo from "../BluejayLogo";
import { MapLink, PhoneLink } from "@/components/templates/MapLink";

/* ───────────────────────── SPRING CONFIGS ───────────────────────── */
const spring = { type: "spring" as const, stiffness: 100, damping: 20 };
const springFast = { type: "spring" as const, stiffness: 200, damping: 25 };

/* ───────────────────────── COLORS ───────────────────────── */
const CHARCOAL = "#1a1a1a";
const DEFAULT_AMBER = "#f59e0b";
const AMBER_LIGHT = "#fbbf24";
const BLUE_SPARK = "#3b82f6";

function getAccent(accentColor?: string) {
  const c = accentColor || DEFAULT_AMBER;
  return {
    AMBER: c,
    AMBER_GLOW: `${c}26`,
    AMBER_LIGHT: AMBER_LIGHT,
    BLUE_SPARK,
  };
}

/* ───────────────────────── SERVICE ICON MAP ───────────────────────── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SERVICE_ICON_MAP: Record<string, any> = {
  "residential": HouseLine,
  "wiring": HouseLine,
  "commercial": Buildings,
  "panel": Plug,
  "ev": BatteryCharging,
  "charger": BatteryCharging,
  "emergency": Warning,
  "lighting": LightbulbFilament,
  "repair": Wrench,
  "inspection": ShieldCheck,
  "generator": Lightning,
};

function getServiceIcon(serviceName: string) {
  const lower = serviceName.toLowerCase();
  for (const [key, Icon] of Object.entries(SERVICE_ICON_MAP)) {
    if (lower.includes(key)) return Icon;
  }
  return Lightning;
}

/* ───────────────────────── STOCK FALLBACK IMAGES ───────────────────────── */
const STOCK_HERO = "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=1400&q=80";
const STOCK_ABOUT = "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=600&q=80";
const STOCK_PROJECTS = [
  "https://images.unsplash.com/photo-1545259741-2ea3ebf61fa3?w=600&q=80",
  "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?w=600&q=80",
  "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?w=800&q=80",
  "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800&q=80",
];

/* ───────────────────────── FLOATING SPARK PARTICLES ───────────────────────── */
function FloatingSparks({ accent }: { accent: string }) {
  const particles = Array.from({ length: 22 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 8,
    duration: 5 + Math.random() * 7,
    size: 2 + Math.random() * 3,
    opacity: 0.15 + Math.random() * 0.35,
    isBlue: Math.random() > 0.65,
  }));

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden hidden md:block">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            width: p.size,
            height: p.size,
            background: p.isBlue ? BLUE_SPARK : accent,
            willChange: "transform, opacity",
          }}
          animate={{
            y: ["-10vh", "110vh"],
            opacity: [0, p.opacity, p.opacity, 0],
          }}
          transition={{
            y: { duration: p.duration, repeat: Infinity, delay: p.delay, ease: "linear" },
            opacity: {
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              times: [0, 0.1, 0.9, 1],
            },
          }}
        />
      ))}
    </div>
  );
}

/* ───────────────────────── CIRCUIT BOARD SVG PATTERN ───────────────────────── */
function CircuitPattern({ opacity = 0.03, accent }: { opacity?: number; accent: string }) {
  const patternId = `circuitGridV2Prev-${accent.replace("#", "")}`;
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }}>
      <defs>
        <pattern id={patternId} width="80" height="80" patternUnits="userSpaceOnUse">
          <path d="M 0 40 L 20 40 L 20 20 L 40 20" fill="none" stroke={accent} strokeWidth="0.5" />
          <path d="M 40 0 L 40 20 L 60 20 L 60 40 L 80 40" fill="none" stroke={accent} strokeWidth="0.5" />
          <path d="M 40 80 L 40 60 L 60 60 L 60 40" fill="none" stroke={accent} strokeWidth="0.5" />
          <path d="M 0 60 L 20 60 L 20 80" fill="none" stroke={accent} strokeWidth="0.5" />
          <circle cx="20" cy="20" r="2" fill={accent} opacity="0.4" />
          <circle cx="60" cy="40" r="2" fill={accent} opacity="0.4" />
          <circle cx="40" cy="60" r="1.5" fill={accent} opacity="0.3" />
          <circle cx="20" cy="60" r="1.5" fill={accent} opacity="0.3" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  );
}

/* ───────────────────────── LIGHTNING BACKGROUND SVG ───────────────────────── */
function LightningBackground({ opacity = 0.03, accent }: { opacity?: number; accent: string }) {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }} viewBox="0 0 1000 600" preserveAspectRatio="none">
      <path d="M150 0 L100 250 L180 250 L80 600" stroke={accent} strokeWidth="2" fill="none" />
      <path d="M850 0 L900 250 L820 250 L920 600" stroke={accent} strokeWidth="1.5" fill="none" />
      <path d="M500 0 L470 200 L530 200 L460 500" stroke={BLUE_SPARK} strokeWidth="1" fill="none" />
    </svg>
  );
}

/* ───────────────────────── HERO LIGHTNING SVG ───────────────────────── */
function HeroLightning({ accent }: { accent: string }) {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1200 800" preserveAspectRatio="none" style={{ opacity: 0.06 }}>
      <motion.path d="M200 0 L160 300 L240 280 L120 800" stroke={accent} strokeWidth="3" fill="none" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2, ease: "easeInOut" }} />
      <motion.path d="M900 0 L940 350 L860 330 L980 800" stroke={BLUE_SPARK} strokeWidth="2" fill="none" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2.5, ease: "easeInOut", delay: 0.3 }} />
      <motion.path d="M600 0 L580 250 L630 240 L560 600" stroke={accent} strokeWidth="1.5" fill="none" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2, ease: "easeInOut", delay: 0.6 }} />
      <motion.circle cx="120" cy="800" r="6" fill={accent} animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1.5, repeat: Infinity, delay: 2 }} />
      <motion.circle cx="980" cy="800" r="5" fill={BLUE_SPARK} animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1.5, repeat: Infinity, delay: 2.5 }} />
    </svg>
  );
}

/* ───────────────────────── GLASS CARD ───────────────────────── */
function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] ${className}`}>
      {children}
    </div>
  );
}

/* ───────────────────────── MAGNETIC BUTTON ───────────────────────── */
function MagneticButton({ children, className = "", onClick, style, href }: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
  href?: string;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, springFast);
  const springY = useSpring(y, springFast);

  const isTouchDevice = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!ref.current || isTouchDevice) return;
      const rect = ref.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      x.set((e.clientX - cx) * 0.25);
      y.set((e.clientY - cy) * 0.25);
    },
    [x, y, isTouchDevice]
  );

  const handleMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  if (href) {
    return (
      <motion.a
        href={href}
        ref={ref as unknown as React.Ref<HTMLAnchorElement>}
        style={{ x: springX, y: springY, willChange: "transform", ...style }}
        onMouseMove={handleMouseMove as unknown as React.MouseEventHandler<HTMLAnchorElement>}
        onMouseLeave={handleMouseLeave}
        className={className}
        whileTap={{ scale: 0.97 }}
      >
        {children}
      </motion.a>
    );
  }

  return (
    <motion.button
      ref={ref}
      style={{ x: springX, y: springY, willChange: "transform", ...style }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={className}
      whileTap={{ scale: 0.97 }}
    >
      {children}
    </motion.button>
  );
}

/* ───────────────────────── SHIMMER BORDER ───────────────────────── */
function ShimmerBorder({ children, className = "", accent }: { children: React.ReactNode; className?: string; accent: string }) {
  return (
    <div className={`relative rounded-2xl p-[1px] overflow-hidden ${className}`}>
      <motion.div
        className="absolute inset-0 rounded-2xl"
        style={{
          background: `conic-gradient(from 0deg, transparent, ${accent}, transparent, ${BLUE_SPARK}, transparent)`,
          willChange: "transform",
        }}
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      />
      <div className="relative rounded-2xl bg-[#141414] z-10">{children}</div>
    </div>
  );
}

/* ───────────────────────── ACCORDION ITEM ───────────────────────── */
function AccordionItem({ question, answer, isOpen, onToggle }: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
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
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={spring}
            className="overflow-hidden"
          >
            <p className="px-5 pb-5 md:px-6 md:pb-6 text-slate-400 leading-relaxed">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
}

/* ───────────────────────── SECTION HEADER ───────────────────────── */
function SectionHeader({ badge, title, subtitle, accent }: {
  badge: string;
  title: string;
  subtitle?: string;
  accent: string;
}) {
  return (
    <div className="text-center mb-16">
      <span
        className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border"
        style={{ color: accent, borderColor: `${accent}33`, background: `${accent}0d` }}
      >
        {badge}
      </span>
      <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white">{title}</h2>
      <div className="h-0.5 w-16 mx-auto mt-4" style={{ background: `linear-gradient(to right, ${accent}, transparent)` }} />
      {subtitle && (
        <p className="text-slate-400 mt-4 max-w-2xl text-lg leading-relaxed mx-auto">{subtitle}</p>
      )}
    </div>
  );
}

/* ───────────────────────── CLAIM BANNER ───────────────────────── */
function ClaimBanner({ businessName, accentColor, prospectId }: {
  businessName: string;
  accentColor: string;
  prospectId: string;
}) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 7);
    const tick = () => {
      const diff = expiry.getTime() - Date.now();
      if (diff <= 0) { setTimeLeft("EXPIRED"); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setTimeLeft(`${d}d ${h}h ${m}m`);
    };
    tick();
    const interval = setInterval(tick, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="bg-[#1a1a1a]/90 backdrop-blur-sm border-t border-white/10 px-4 py-2 flex items-center justify-center gap-4">
        <p className="text-xs text-slate-400">
          <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1.5 animate-pulse" />
          Custom-built preview for this business
        </p>
        {timeLeft && timeLeft !== "EXPIRED" && (
          <p className="text-xs font-bold" style={{ color: accentColor }}>
            Preview expires in {timeLeft}
          </p>
        )}
      </div>
      <div
        className="px-6 py-4 flex items-center justify-between gap-4"
        style={{ background: `linear-gradient(135deg, ${accentColor}20, ${accentColor}10)`, borderTop: `1px solid ${accentColor}30` }}
      >
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">
            This website was built for {businessName}
          </p>
          <p className="text-xs text-slate-400">Claim it before we offer it to a competitor</p>
        </div>
        <a
          href={`/claim/${prospectId}`}
          className="shrink-0 h-11 px-6 rounded-full text-white text-sm font-bold flex items-center gap-2 hover:shadow-lg transition-all duration-300"
          style={{ background: accentColor }}
        >
          Claim Your Website
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </a>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN PREVIEW COMPONENT
   ═══════════════════════════════════════════════════════════════════ */
export default function V2ElectricianPreview({ data }: { data: GeneratedSiteData }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const { AMBER, AMBER_GLOW } = getAccent(data.accentColor);

  const heroImage = data.photos?.[0] || STOCK_HERO;
  const aboutImage = data.photos?.[1] || STOCK_ABOUT;
  const projectImages = data.photos?.length > 2
    ? data.photos.slice(2, 6)
    : STOCK_PROJECTS;

  const phoneDigits = data.phone.replace(/\D/g, "");

  /* Build process steps from services */
  const processSteps = [
    { step: "01", title: "Free Consultation", desc: `Call or book online. We discuss your project, timeline, and budget at no cost.` },
    { step: "02", title: "On-Site Assessment", desc: `Our licensed electrician inspects your property and provides a detailed, transparent quote.` },
    { step: "03", title: "Expert Work", desc: `Our master electricians complete the job with precision, cleanliness, and full code compliance.` },
    { step: "04", title: "Final Inspection", desc: `We walk you through everything, handle permits and inspections, and guarantee our work.` },
  ];

  /* Build FAQs dynamically */
  const faqs = [
    { q: `What electrical services does ${data.businessName} offer?`, a: `We offer a full range of electrical services including ${data.services.slice(0, 3).map(s => s.name).join(", ")}, and more. Contact us for a free estimate on any electrical project.` },
    { q: "Do you handle permits and inspections?", a: "Absolutely. We pull all required permits and schedule city inspections as part of every job. You never have to worry about code compliance." },
    { q: "How fast can you respond to an emergency?", a: "Our emergency team typically arrives within 60 minutes for urgent calls. We are available 24 hours a day, 7 days a week, 365 days a year." },
    { q: "Are your electricians licensed and insured?", a: `Every technician at ${data.businessName} holds a valid Journeyman or Master Electrician license. We carry full liability insurance and bonding for your protection.` },
  ];

  return (
    <main
      className="relative min-h-[100dvh] overflow-x-hidden"
      style={{ background: CHARCOAL, color: "#f1f5f9" }}
    >
      <FloatingSparks accent={AMBER} />

      {/* ══════════════════ 1. NAV ══════════════════ */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-4">
          <GlassCard className="flex items-center justify-between px-4 md:px-6 py-3">
            <div className="flex items-center gap-2">
              <Lightning size={24} weight="fill" style={{ color: AMBER }} />
              <span className="text-lg font-bold tracking-tight text-white">
                {data.businessName}
              </span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
              <a href="#services" className="hover:text-white transition-colors">Services</a>
              <a href="#about" className="hover:text-white transition-colors">About</a>
              <a href="#projects" className="hover:text-white transition-colors">Projects</a>
              <a href="#contact" className="hover:text-white transition-colors">Contact</a>
            </div>
            <div className="flex items-center gap-3">
              <MagneticButton
                className="px-4 md:px-5 py-2 rounded-full text-sm font-semibold text-black transition-colors cursor-pointer"
                style={{ background: AMBER } as React.CSSProperties}
              >
                Get Free Estimate
              </MagneticButton>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
              >
                {mobileMenuOpen ? <X size={24} /> : <List size={24} />}
              </button>
            </div>
          </GlassCard>

          {/* Mobile Menu */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="md:hidden mt-2 overflow-hidden"
              >
                <GlassCard className="flex flex-col gap-1 px-4 py-4">
                  {[
                    { label: "Services", href: "#services" },
                    { label: "About", href: "#about" },
                    { label: "Projects", href: "#projects" },
                    { label: "Contact", href: "#contact" },
                  ].map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-3 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      {link.label}
                    </a>
                  ))}
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* ══════════════════ 2. HERO ══════════════════ */}
      <section className="relative min-h-[100dvh] flex items-center pt-24 z-10 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #1a1408 0%, #0f0d08 50%, #1a1a1a 100%)" }} />
        <CircuitPattern opacity={0.04} accent={AMBER} />
        <HeroLightning accent={AMBER} />
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full blur-[200px] pointer-events-none" style={{ background: `${AMBER}08` }} />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full blur-[160px] pointer-events-none" style={{ background: `${BLUE_SPARK}06` }} />

        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Left: text */}
          <div className="space-y-8">
            <div>
              <p className="text-sm uppercase tracking-widest mb-4" style={{ color: AMBER }}>
                Licensed Master Electricians
              </p>
              <h1
                className="text-3xl md:text-6xl tracking-tighter leading-none font-bold text-white"
                style={{ textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}
              >
                {data.tagline}
              </h1>
            </div>
            <p className="text-lg text-slate-400 max-w-md leading-relaxed">
              {data.about.length > 160 ? data.about.slice(0, 160).trim() + "..." : data.about}
            </p>
            <div className="flex flex-wrap gap-4">
              <MagneticButton
                className="px-8 py-4 rounded-full text-base font-semibold text-black flex items-center gap-2 cursor-pointer"
                style={{ background: AMBER } as React.CSSProperties}
              >
                Get Free Estimate
                <ArrowRight size={18} weight="bold" />
              </MagneticButton>
              <MagneticButton
                href={`tel:${phoneDigits}`}
                className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/10 flex items-center gap-2 cursor-pointer"
              >
                <Phone size={18} weight="duotone" />
                <PhoneLink phone={data.phone} />
              </MagneticButton>
            </div>

            {/* Quick info */}
            <div className="flex flex-wrap gap-6 text-sm text-slate-400">
              <span className="flex items-center gap-2">
                <MapPin size={16} weight="duotone" style={{ color: AMBER }} />
                <MapLink address={data.address} />
              </span>
              <span className="flex items-center gap-2">
                <Clock size={16} weight="duotone" style={{ color: AMBER }} />
                24/7 Emergency Available
              </span>
            </div>
          </div>

          {/* Right: hero image */}
          <div className="hidden md:block relative">
            <div className="relative rounded-2xl overflow-hidden border border-white/10">
              <img
                src={heroImage}
                alt={`${data.businessName} professional electrician`}
                className="w-full h-[500px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-transparent to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#1a1a1a]/40 to-transparent" />
              <div className="absolute bottom-6 left-6 flex items-center gap-3">
                <div className="px-4 py-2 rounded-full backdrop-blur-md bg-black/50 border flex items-center gap-2" style={{ borderColor: `${AMBER}4d` }}>
                  <ShieldCheck size={18} weight="fill" style={{ color: AMBER }} />
                  <span className="text-sm font-semibold text-white">Licensed &amp; Insured</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════ 3. STATS ══════════════════ */}
      <section className="relative z-10 py-16 overflow-hidden border-y" style={{ borderColor: `${AMBER}1a` }}>
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #141210 0%, #1a1a1a 100%)" }} />
        <CircuitPattern opacity={0.02} accent={AMBER} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] rounded-full blur-[180px]" style={{ background: `${AMBER}08` }} />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {data.stats.map((stat, i) => {
              const statIcons = [ShieldCheck, Lightning, Clock, Star];
              const Icon = statIcons[i % statIcons.length];
              return (
                <div key={stat.label} className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Icon size={22} weight="fill" style={{ color: AMBER }} />
                    <span className="text-3xl md:text-4xl font-extrabold text-white">{stat.value}</span>
                  </div>
                  <span className="text-slate-500 text-sm font-medium tracking-wide uppercase">{stat.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════ 4. SERVICES ══════════════════ */}
      <section id="services" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #141210 50%, #1a1a1a 100%)" }} />
        <CircuitPattern accent={AMBER} />
        <LightningBackground opacity={0.025} accent={AMBER} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[10%] right-[5%] w-[500px] h-[500px] rounded-full blur-[160px]" style={{ background: `${AMBER}08` }} />
          <div className="absolute bottom-[10%] left-[5%] w-[400px] h-[400px] rounded-full blur-[140px]" style={{ background: `${BLUE_SPARK}05` }} />
        </div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            badge="Our Services"
            title="Expert Electrical Services"
            subtitle={`From residential rewiring to commercial build-outs, ${data.businessName} delivers safe, code-compliant work every time.`}
            accent={AMBER}
          />

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.services.map((service, i) => {
              const Icon = getServiceIcon(service.name);
              return (
                <div
                  key={service.name}
                  className="group relative p-7 rounded-2xl border border-white/[0.06] hover:border-opacity-30 transition-all duration-500 overflow-hidden bg-white/[0.02]"
                  style={{ ["--hover-border" as string]: `${AMBER}4d` }}
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: `radial-gradient(circle at 50% 0%, ${AMBER}15, transparent 70%)` }} />
                  <div className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `linear-gradient(to right, transparent, ${AMBER}4d, transparent)` }} />
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-5">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 border"
                        style={{ background: AMBER_GLOW, borderColor: `${AMBER}33` }}
                      >
                        <Icon size={24} weight="duotone" style={{ color: AMBER }} />
                      </div>
                      <span className="text-xs font-mono text-slate-600">{String(i + 1).padStart(2, "0")}</span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{service.name}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{service.description || ""}</p>
                    {service.price && (
                      <p className="text-sm font-semibold mt-3" style={{ color: AMBER }}>{service.price}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════ 5. WHY CHOOSE US / ABOUT ══════════════════ */}
      <section id="about" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0f0e0c 50%, #1a1a1a 100%)" }} />
        <LightningBackground opacity={0.02} accent={AMBER} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] left-[10%] w-[500px] h-[500px] rounded-full blur-[180px]" style={{ background: `${AMBER}06` }} />
        </div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Photo */}
            <div className="relative">
              <div className="rounded-2xl overflow-hidden border border-white/10">
                <img
                  src={aboutImage}
                  alt={`${data.businessName} team`}
                  className="w-full h-[400px] object-cover"
                />
              </div>
              <div className="absolute -bottom-4 -right-4 md:bottom-6 md:-right-6">
                <div className="px-5 py-3 rounded-xl backdrop-blur-md border text-black font-bold text-sm shadow-lg" style={{ background: `${AMBER}e6`, borderColor: `${AMBER}80` }}>
                  {data.stats[0] ? `${data.stats[0].value} ${data.stats[0].label}` : "Trusted Experts"}
                </div>
              </div>
            </div>

            {/* Trust content */}
            <div>
              <span
                className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border"
                style={{ color: AMBER, borderColor: `${AMBER}33`, background: `${AMBER}0d` }}
              >
                Why Choose Us
              </span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6 text-white">
                Your Most Trusted Electricians
              </h2>
              <p className="text-slate-400 leading-relaxed mb-8">
                {data.about}
              </p>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: ShieldCheck, label: "Fully Licensed" },
                  { icon: CheckCircle, label: "Bonded & Insured" },
                  { icon: Star, label: "5-Star Rated" },
                  { icon: Clock, label: "24/7 Emergency" },
                ].map((badge) => (
                  <GlassCard key={badge.label} className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: AMBER_GLOW }}>
                      <badge.icon size={20} weight="duotone" style={{ color: AMBER }} />
                    </div>
                    <span className="text-sm font-semibold text-white">{badge.label}</span>
                  </GlassCard>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════ 6. PROCESS ══════════════════ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #141210 50%, #1a1a1a 100%)" }} />
        <CircuitPattern opacity={0.025} accent={AMBER} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] rounded-full blur-[180px]" style={{ background: `${BLUE_SPARK}06` }} />
        </div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Our Process" title="How We Work" accent={AMBER} />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {processSteps.map((step, i) => (
              <div key={step.step} className="relative">
                {i < processSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-10 left-[calc(50%+40px)] w-[calc(100%-80px)] h-px" style={{ background: `linear-gradient(to right, ${AMBER}33, ${AMBER}11)` }} />
                )}
                <GlassCard className="p-6 text-center relative">
                  <div
                    className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-black"
                    style={{ background: `linear-gradient(135deg, ${AMBER}22, ${AMBER}0a)`, color: AMBER, border: `1px solid ${AMBER}33` }}
                  >
                    {step.step}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
                </GlassCard>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ 7. PROJECTS GALLERY ══════════════════ */}
      <section id="projects" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0f0e0c 50%, #1a1a1a 100%)" }} />
        <LightningBackground opacity={0.02} accent={AMBER} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[30%] left-[20%] w-[500px] h-[500px] rounded-full blur-[200px]" style={{ background: `${AMBER}06` }} />
        </div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Our Work" title="Recent Projects" accent={AMBER} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projectImages.map((src, i) => {
              const projectTitles = [
                "Commercial Panel Installation",
                "Residential Smart Home Wiring",
                "Emergency Panel Repair",
                "EV Charger Network",
              ];
              const projectDescs = [
                "Full service upgrade for a commercial facility.",
                "Complete smart home wiring and automation.",
                "24-hour emergency response for electrical repairs.",
                "Multi-unit EV charging station installation.",
              ];
              return (
                <div
                  key={i}
                  className="group relative rounded-2xl overflow-hidden border border-white/[0.06] hover:border-opacity-30 transition-all duration-500"
                >
                  <img
                    src={src}
                    alt={projectTitles[i] || `Project ${i + 1}`}
                    className="w-full h-64 object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-lg font-bold text-white mb-1">{projectTitles[i] || `Project ${i + 1}`}</h3>
                    <p className="text-sm text-slate-300">{projectDescs[i] || ""}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════ 8. TESTIMONIALS ══════════════════ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #141210 50%, #1a1a1a 100%)" }} />
        <CircuitPattern opacity={0.02} accent={AMBER} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] right-[15%] w-[400px] h-[400px] rounded-full blur-[160px]" style={{ background: `${AMBER}06` }} />
        </div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Testimonials" title="What Our Clients Say" accent={AMBER} />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {data.testimonials.map((t, i) => (
              <GlassCard key={i} className="p-6 h-full flex flex-col">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.rating || 5 }).map((_, j) => (
                    <Star key={j} size={16} weight="fill" style={{ color: AMBER }} />
                  ))}
                </div>
                <p className="text-slate-300 leading-relaxed flex-1 text-sm mb-4">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">{t.name}</span>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ 9. EMERGENCY CTA ══════════════════ */}
      <section className="relative z-10 py-20 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${AMBER}, ${AMBER}cc, ${AMBER})` }} />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='40' height='40' fill='none'/%3E%3Cpath d='M0 0L40 40M40 0L0 40' stroke='%23000' stroke-width='0.5'/%3E%3C/svg%3E\")" }} />
        <LightningBackground opacity={0.06} accent={AMBER} />

        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <Warning size={48} weight="fill" className="mx-auto mb-6 text-black/70" />
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-black mb-4">
            Electrical Emergency? We&apos;re Here 24/7
          </h2>
          <p className="text-lg text-black/70 mb-8 max-w-xl mx-auto">
            Power outages, sparking outlets, burning smells — do not wait. Our emergency electricians respond fast to keep your home and family safe.
          </p>
          <PhoneLink
            phone={data.phone}
            className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-black text-white font-bold text-lg hover:bg-black/80 transition-colors"
          >
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600" />
            </span>
            {data.phone}
          </PhoneLink>
        </div>
      </section>

      {/* ══════════════════ 10. SERVICE AREAS ══════════════════ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0f0e0c 50%, #1a1a1a 100%)" }} />
        <CircuitPattern opacity={0.02} accent={AMBER} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[40%] right-[20%] w-[400px] h-[400px] rounded-full blur-[180px]" style={{ background: `${BLUE_SPARK}06` }} />
        </div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Coverage Area" title="Areas We Serve" accent={AMBER} />

          <div className="text-center">
            <GlassCard className="p-8 inline-block">
              <div className="flex items-center gap-3 text-lg">
                <MapPin size={24} weight="duotone" style={{ color: AMBER }} />
                <MapLink address={data.address} className="text-white font-semibold" />
              </div>
              <p className="text-slate-400 text-sm mt-2">&amp; Surrounding Areas</p>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* ══════════════════ 11. HOURS ══════════════════ */}
      {data.hours && (
        <section className="relative z-10 py-24 md:py-32 overflow-hidden">
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #141210 50%, #1a1a1a 100%)" }} />
          <LightningBackground opacity={0.02} accent={AMBER} />
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-[20%] left-[15%] w-[400px] h-[400px] rounded-full blur-[160px]" style={{ background: `${AMBER}06` }} />
          </div>

          <div className="max-w-3xl mx-auto px-6 relative z-10">
            <SectionHeader badge="Business Hours" title="When We're Available" accent={AMBER} />
            <div className="text-center">
              <ShimmerBorder accent={AMBER}>
                <div className="p-8">
                  <Clock size={32} weight="duotone" style={{ color: AMBER }} className="mx-auto mb-4" />
                  <p className="text-slate-300 leading-relaxed whitespace-pre-line text-lg">{data.hours}</p>
                  <p className="text-sm mt-4 font-semibold" style={{ color: AMBER }}>Emergency Service: 24/7/365</p>
                </div>
              </ShimmerBorder>
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════ 12. FAQ ══════════════════ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #141210 50%, #1a1a1a 100%)" }} />
        <LightningBackground opacity={0.02} accent={AMBER} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] left-[15%] w-[400px] h-[400px] rounded-full blur-[160px]" style={{ background: `${AMBER}06` }} />
        </div>

        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <SectionHeader badge="FAQ" title="Common Questions" accent={AMBER} />

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                question={faq.q}
                answer={faq.a}
                isOpen={openFaq === i}
                onToggle={() => setOpenFaq(openFaq === i ? null : i)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ 13. CONTACT ══════════════════ */}
      <section id="contact" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0f0e0c 50%, #1a1a1a 100%)" }} />
        <CircuitPattern opacity={0.02} accent={AMBER} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] rounded-full blur-[180px]" style={{ background: `${AMBER}06` }} />
        </div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Info side */}
            <div>
              <span
                className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border"
                style={{ color: AMBER, borderColor: `${AMBER}33`, background: `${AMBER}0d` }}
              >
                Contact Us
              </span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6 text-white">
                Get Your Free Estimate
              </h2>
              <p className="text-slate-400 leading-relaxed mb-8">
                Ready to start your project? Contact {data.businessName} today for a free, no-obligation estimate. We respond to all inquiries within 24 hours.
              </p>

              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: AMBER_GLOW }}>
                    <MapPin size={20} weight="duotone" style={{ color: AMBER }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Address</p>
                    <MapLink address={data.address} className="text-sm text-slate-400" />
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: AMBER_GLOW }}>
                    <Phone size={20} weight="duotone" style={{ color: AMBER }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Phone</p>
                    <PhoneLink phone={data.phone} className="text-sm text-slate-400" />
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: AMBER_GLOW }}>
                    <Lightning size={20} weight="duotone" style={{ color: AMBER }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Emergency</p>
                    <p className="text-sm text-slate-400">24/7/365 Emergency Service Available</p>
                  </div>
                </div>
                {data.hours && (
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: AMBER_GLOW }}>
                      <Clock size={20} weight="duotone" style={{ color: AMBER }} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">Hours</p>
                      <p className="text-sm text-slate-400 whitespace-pre-line">{data.hours}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Form */}
            <GlassCard className="p-8">
              <h3 className="text-xl font-semibold text-white mb-6">Request a Free Estimate</h3>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-1.5">First Name</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none transition-colors text-sm"
                      style={{ ["--tw-ring-color" as string]: `${AMBER}80` }}
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1.5">Last Name</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none transition-colors text-sm"
                      placeholder="Doe"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">Phone</label>
                  <input
                    type="tel"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none transition-colors text-sm"
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">Service Needed</label>
                  <select className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none transition-colors text-sm">
                    <option value="" className="bg-neutral-900">Select a service</option>
                    {data.services.map((s) => (
                      <option key={s.name} value={s.name.toLowerCase().replace(/\s+/g, "-")} className="bg-neutral-900">
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">Message</label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none transition-colors text-sm resize-none"
                    placeholder="Tell us about your project..."
                  />
                </div>
                <MagneticButton
                  className="w-full py-4 rounded-xl text-base font-semibold text-black flex items-center justify-center gap-2 cursor-pointer"
                  style={{ background: AMBER } as React.CSSProperties}
                >
                  Send Request
                  <ArrowRight size={18} weight="bold" />
                </MagneticButton>
              </form>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* ══════════════════ 14. GUARANTEE / TRUST BANNER ══════════════════ */}
      <section className="relative z-10 py-16 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #141210 100%)" }} />
        <CircuitPattern opacity={0.015} accent={AMBER} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full blur-[180px]" style={{ background: `${AMBER}06` }} />
        </div>

        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <ShimmerBorder accent={AMBER}>
            <div className="p-8 md:p-12">
              <ShieldCheck size={48} weight="fill" style={{ color: AMBER }} className="mx-auto mb-4" />
              <h2 className="text-2xl md:text-4xl font-extrabold text-white mb-4">Our Guarantee</h2>
              <p className="text-slate-400 leading-relaxed max-w-2xl mx-auto text-lg">
                Every job by {data.businessName} is backed by our satisfaction guarantee. We stand behind our work with warranties on all electrical installations and repairs. Your safety and satisfaction are our top priorities.
              </p>
              <div className="flex flex-wrap justify-center gap-4 mt-8">
                {["Licensed Electricians", "Free Estimates", "Satisfaction Guaranteed", "24/7 Emergency"].map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border"
                    style={{ color: AMBER, borderColor: `${AMBER}33`, background: `${AMBER}0d` }}
                  >
                    <CheckCircle size={16} weight="fill" />
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </ShimmerBorder>
        </div>
      </section>

      {/* ══════════════════ 15. FOOTER ══════════════════ */}
      <footer className="relative z-10 border-t border-white/5 py-10 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #111 100%)" }} />
        <CircuitPattern opacity={0.015} accent={AMBER} />
        <div className="mx-auto max-w-6xl px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Lightning size={22} weight="fill" style={{ color: AMBER }} />
                <span className="text-lg font-bold text-white">{data.businessName}</span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">
                {data.about.length > 120 ? data.about.slice(0, 120).trim() + "..." : data.about}
              </p>
            </div>
            {/* Quick Links */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-3">Quick Links</h4>
              <div className="space-y-2">
                {["Services", "About", "Projects", "Contact"].map((link) => (
                  <a
                    key={link}
                    href={`#${link.toLowerCase()}`}
                    className="block text-sm text-slate-500 hover:text-white transition-colors"
                  >
                    {link}
                  </a>
                ))}
              </div>
            </div>
            {/* Contact Info */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-3">Contact</h4>
              <div className="space-y-2 text-sm text-slate-500">
                <p><PhoneLink phone={data.phone} /></p>
                <p><MapLink address={data.address} /></p>
                {data.socialLinks && Object.entries(data.socialLinks).map(([platform, url]) => (
                  <a key={platform} href={url} target="_blank" rel="noopener noreferrer" className="block hover:text-white transition-colors capitalize">
                    {platform}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Lightning size={14} weight="fill" style={{ color: AMBER }} />
              <span>{data.businessName} &copy; {new Date().getFullYear()}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <BluejayLogo className="w-4 h-4" />
              <span>Created by <a href="https://bluejayportfolio.com" target="_blank" rel="noopener noreferrer" style={{textDecoration:"underline"}}>bluejayportfolio.com</a></span>
            </div>
          </div>
        </div>
      </footer>

      {/* Claim Banner */}
      <ClaimBanner businessName={data.businessName} accentColor={AMBER} prospectId={data.id} />

      {/* Bottom padding for claim banner */}
      <div className="h-28" />
    </main>
  );
}
