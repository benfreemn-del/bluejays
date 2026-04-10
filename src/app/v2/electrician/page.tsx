"use client";

/* eslint-disable @next/next/no-img-element -- These static marketing and preview components intentionally use plain img tags to preserve existing markup and visual behavior during lint-only cleanup. */
/* eslint-disable react-hooks/purity -- Decorative particle values are intentionally randomized for static visual effects in these marketing pages and previews; this preserves existing appearance without changing business logic. */

import { useState, useRef, useCallback } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useInView,
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

/* ───────────────────────── SPRING CONFIGS ───────────────────────── */
const spring = { type: "spring" as const, stiffness: 100, damping: 20 };
const springFast = { type: "spring" as const, stiffness: 200, damping: 25 };
const springGentle = { type: "spring" as const, stiffness: 60, damping: 18 };

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: spring },
};

/* ───────────────────────── COLORS ───────────────────────── */
const CHARCOAL = "#1a1a1a";
const AMBER = "#f59e0b";
const AMBER_LIGHT = "#fbbf24";
const AMBER_GLOW = "rgba(245, 158, 11, 0.15)";
const BLUE_SPARK = "#3b82f6";

/* ───────────────────────── FLOATING SPARK PARTICLES ───────────────────────── */
function FloatingSparks() {
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
            background: p.isBlue ? BLUE_SPARK : AMBER_LIGHT,
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
function CircuitPattern({ opacity = 0.03 }: { opacity?: number }) {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }}>
      <defs>
        <pattern id="circuitGridV2" width="80" height="80" patternUnits="userSpaceOnUse">
          <path d="M 0 40 L 20 40 L 20 20 L 40 20" fill="none" stroke={AMBER} strokeWidth="0.5" />
          <path d="M 40 0 L 40 20 L 60 20 L 60 40 L 80 40" fill="none" stroke={AMBER} strokeWidth="0.5" />
          <path d="M 40 80 L 40 60 L 60 60 L 60 40" fill="none" stroke={AMBER} strokeWidth="0.5" />
          <path d="M 0 60 L 20 60 L 20 80" fill="none" stroke={AMBER} strokeWidth="0.5" />
          <circle cx="20" cy="20" r="2" fill={AMBER} opacity="0.4" />
          <circle cx="60" cy="40" r="2" fill={AMBER} opacity="0.4" />
          <circle cx="40" cy="60" r="1.5" fill={AMBER} opacity="0.3" />
          <circle cx="20" cy="60" r="1.5" fill={AMBER} opacity="0.3" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#circuitGridV2)" />
    </svg>
  );
}

/* ───────────────────────── LIGHTNING BACKGROUND SVG ───────────────────────── */
function LightningBackground({ opacity = 0.03 }: { opacity?: number }) {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity }}
      viewBox="0 0 1000 600"
      preserveAspectRatio="none"
    >
      <path d="M150 0 L100 250 L180 250 L80 600" stroke={AMBER} strokeWidth="2" fill="none" />
      <path d="M850 0 L900 250 L820 250 L920 600" stroke={AMBER} strokeWidth="1.5" fill="none" />
      <path d="M500 0 L470 200 L530 200 L460 500" stroke={BLUE_SPARK} strokeWidth="1" fill="none" />
    </svg>
  );
}

/* ───────────────────────── WORD REVEAL ───────────────────────── */
function WordReveal({ text, className = "" }: { text: string; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const words = text.split(" ");

  return (
    <motion.span
      ref={ref}
      className={`inline-flex flex-wrap gap-x-3 ${className}`}
      variants={stagger}
      initial="hidden"
      animate={isInView ? "show" : "hidden"}
    >
      {words.map((word, i) => (
        <motion.span key={i} variants={fadeUp} className="inline-block">
          {word}
        </motion.span>
      ))}
    </motion.span>
  );
}

/* ───────────────────────── SECTION REVEAL ───────────────────────── */
function SectionReveal({
  children,
  className = "",
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.section
      ref={ref}
      id={id}
      className={className}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={spring}
    >
      {children}
    </motion.section>
  );
}

/* ───────────────────────── GLASS CARD ───────────────────────── */
function GlassCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] ${className}`}
    >
      {children}
    </div>
  );
}

/* ───────────────────────── MAGNETIC BUTTON ───────────────────────── */
function MagneticButton({
  children,
  className = "",
  onClick,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, springFast);
  const springY = useSpring(y, springFast);

  const isTouchDevice =
    typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;

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
function ShimmerBorder({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative rounded-2xl p-[1px] overflow-hidden ${className}`}>
      <motion.div
        className="absolute inset-0 rounded-2xl"
        style={{
          background: `conic-gradient(from 0deg, transparent, ${AMBER}, transparent, ${BLUE_SPARK}, transparent)`,
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
function AccordionItem({
  question,
  answer,
  isOpen,
  onToggle,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <GlassCard className="overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-5 md:p-6 text-left group cursor-pointer"
      >
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
            <p className="px-5 pb-5 md:px-6 md:pb-6 text-slate-400 leading-relaxed">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
}

/* ───────────────────────── HERO LIGHTNING SVG ───────────────────────── */
function HeroLightning() {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 1200 800"
      preserveAspectRatio="none"
      style={{ opacity: 0.06 }}
    >
      <motion.path
        d="M200 0 L160 300 L240 280 L120 800"
        stroke={AMBER}
        strokeWidth="3"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2, ease: "easeInOut" }}
      />
      <motion.path
        d="M900 0 L940 350 L860 330 L980 800"
        stroke={BLUE_SPARK}
        strokeWidth="2"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2.5, ease: "easeInOut", delay: 0.3 }}
      />
      <motion.path
        d="M600 0 L580 250 L630 240 L560 600"
        stroke={AMBER}
        strokeWidth="1.5"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2, ease: "easeInOut", delay: 0.6 }}
      />
      {/* Spark dots */}
      <motion.circle cx="120" cy="800" r="6" fill={AMBER} animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1.5, repeat: Infinity, delay: 2 }} />
      <motion.circle cx="980" cy="800" r="5" fill={BLUE_SPARK} animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1.5, repeat: Infinity, delay: 2.5 }} />
    </svg>
  );
}

/* ───────────────────────── DATA ───────────────────────── */
const services = [
  {
    name: "Residential Wiring",
    desc: "Full-home rewiring, new construction wiring, and circuit additions. We bring your home up to code with meticulous craftsmanship.",
    icon: HouseLine,
  },
  {
    name: "Commercial Electrical",
    desc: "Office build-outs, retail lighting, and industrial wiring. Scalable electrical solutions for businesses of every size.",
    icon: Buildings,
  },
  {
    name: "Panel Upgrades",
    desc: "Upgrade aging fuse boxes to modern breaker panels. Increase capacity safely for today's power demands.",
    icon: Plug,
  },
  {
    name: "EV Charger Installation",
    desc: "Level 2 home charging stations installed fast and to code. Power your electric vehicle from the comfort of your garage.",
    icon: BatteryCharging,
  },
  {
    name: "Emergency Repairs",
    desc: "Power outages, sparking outlets, tripped breakers at 2 AM. Our emergency crew responds fast, 24/7/365.",
    icon: Warning,
  },
  {
    name: "Lighting Design",
    desc: "Architectural accent lighting, pathway illumination, and smart lighting setups that transform your space.",
    icon: LightbulbFilament,
  },
];

const processSteps = [
  { step: "01", title: "Free Consultation", desc: "Call or book online. We discuss your project, timeline, and budget at no cost." },
  { step: "02", title: "On-Site Assessment", desc: "Our licensed electrician inspects your property and provides a detailed, transparent quote." },
  { step: "03", title: "Expert Work", desc: "Our master electricians complete the job with precision, cleanliness, and full code compliance." },
  { step: "04", title: "Final Inspection", desc: "We walk you through everything, handle permits and inspections, and guarantee our work." },
];

const testimonials = [
  {
    name: "Sarah K.",
    text: "They upgraded our entire panel in one day. Showed up on time, explained everything, and left the place spotless. Best electricians we have ever hired.",
    service: "Panel Upgrade",
    rating: 5,
  },
  {
    name: "Mike T.",
    text: "Had a power outage at midnight and they were at my door within 45 minutes. Fixed the issue fast and the price was more than fair. True professionals.",
    service: "Emergency Service",
    rating: 5,
  },
  {
    name: "Jennifer & Dan L.",
    text: "Cascade Electric installed our Tesla charger and rewired our garage. The work was flawless and they handled the permit. Could not recommend them more.",
    service: "EV Charger Install",
    rating: 5,
  },
];

const faqs = [
  {
    q: "How much does it cost to upgrade an electrical panel?",
    a: "Panel upgrades typically range from $1,500 to $4,000 depending on the amperage and complexity. We provide free on-site estimates so you know the exact cost upfront with no surprises.",
  },
  {
    q: "Do you handle permits and inspections?",
    a: "Absolutely. We pull all required permits and schedule city inspections as part of every job. You never have to worry about code compliance when Cascade Electric is on the job.",
  },
  {
    q: "How fast can you respond to an emergency?",
    a: "Our emergency team typically arrives within 60 minutes for urgent calls in the greater Seattle area. We are available 24 hours a day, 7 days a week, 365 days a year.",
  },
  {
    q: "Are your electricians licensed and insured?",
    a: "Every technician on our team holds a valid Washington State Journeyman or Master Electrician license. We carry full liability insurance and bonding for your protection.",
  },
];

const serviceAreas = [
  "Seattle", "Bellevue", "Kirkland", "Redmond", "Tacoma",
  "Renton", "Kent", "Federal Way", "Auburn", "Issaquah",
  "Mercer Island", "Bothell",
];

/* ═══════════════════════════════════════════════════════════════════
   MAIN PAGE COMPONENT
   ═══════════════════════════════════════════════════════════════════ */
export default function V2ElectricianPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <main
      className="relative min-h-[100dvh] overflow-x-hidden"
      style={{ background: CHARCOAL, color: "#f1f5f9" }}
    >
      <FloatingSparks />

      {/* ══════════════════ 1. NAV ══════════════════ */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={spring}
        className="fixed top-0 left-0 right-0 z-50"
      >
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-4">
          <GlassCard className="flex items-center justify-between px-4 md:px-6 py-3">
            <div className="flex items-center gap-2">
              <Lightning size={24} weight="fill" style={{ color: AMBER }} />
              <span className="text-lg font-bold tracking-tight text-white">
                Cascade Electric Co.
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
      </motion.nav>

      {/* ══════════════════ 2. HERO ══════════════════ */}
      <section className="relative min-h-[100dvh] flex items-center pt-24 z-10 overflow-hidden">
        {/* Dark gradient background */}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(135deg, #1a1408 0%, #0f0d08 50%, #1a1a1a 100%)" }}
        />
        {/* Circuit board pattern */}
        <CircuitPattern opacity={0.04} />
        {/* Animated lightning bolts */}
        <HeroLightning />
        {/* Amber glow */}
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full blur-[200px] pointer-events-none" style={{ background: `${AMBER}08` }} />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full blur-[160px] pointer-events-none" style={{ background: `${BLUE_SPARK}06` }} />

        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Left: text */}
          <div className="space-y-8">
            <div>
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ ...spring, delay: 0.1 }}
                className="text-sm uppercase tracking-widest mb-4"
                style={{ color: AMBER }}
              >
                Licensed Master Electricians
              </motion.p>
              <h1
                className="text-3xl md:text-6xl tracking-tighter leading-none font-bold text-white"
                style={{ textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}
              >
                <WordReveal text="Powering Your World Safely" />
              </h1>
            </div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring, delay: 0.6 }}
              className="text-lg text-slate-400 max-w-md leading-relaxed"
            >
              From residential rewiring to commercial build-outs, our master
              electricians deliver safe, code-compliant work with 24/7 emergency
              response.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring, delay: 0.8 }}
              className="flex flex-wrap gap-4"
            >
              <MagneticButton
                className="px-8 py-4 rounded-full text-base font-semibold text-black flex items-center gap-2 cursor-pointer"
                style={{ background: AMBER } as React.CSSProperties}
              >
                Get Free Estimate
                <ArrowRight size={18} weight="bold" />
              </MagneticButton>
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/10 flex items-center gap-2 cursor-pointer">
                <Phone size={18} weight="duotone" />
                (206) 555-0103
              </MagneticButton>
            </motion.div>

            {/* Quick info */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ ...spring, delay: 1 }}
              className="flex flex-wrap gap-6 text-sm text-slate-400"
            >
              <span className="flex items-center gap-2">
                <MapPin size={16} weight="duotone" style={{ color: AMBER }} />
                Seattle, WA &amp; Surrounding Areas
              </span>
              <span className="flex items-center gap-2">
                <Clock size={16} weight="duotone" style={{ color: AMBER }} />
                24/7 Emergency Available
              </span>
            </motion.div>
          </div>

          {/* Right: hero image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ ...spring, delay: 0.3 }}
            className="hidden md:block relative"
          >
            <div className="relative rounded-2xl overflow-hidden border border-white/10">
              <img
                src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=1400&q=80"
                alt="Professional electrician at work"
                className="w-full h-[500px] object-cover"
              />
              {/* Amber overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-transparent to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#1a1a1a]/40 to-transparent" />
              {/* Badge on image */}
              <div className="absolute bottom-6 left-6 flex items-center gap-3">
                <div className="px-4 py-2 rounded-full backdrop-blur-md bg-black/50 border border-amber-500/30 flex items-center gap-2">
                  <ShieldCheck size={18} weight="fill" style={{ color: AMBER }} />
                  <span className="text-sm font-semibold text-white">Licensed &amp; Insured</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════ 3. STATS ══════════════════ */}
      <SectionReveal className="relative z-10 py-16 overflow-hidden border-y border-amber-500/10" id="stats">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #141210 0%, #1a1a1a 100%)" }} />
        <CircuitPattern opacity={0.02} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] rounded-full blur-[180px]" style={{ background: `${AMBER}08` }} />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
          >
            {[
              { value: "2008", label: "Licensed Since", icon: ShieldCheck },
              { value: "2,500+", label: "Projects Completed", icon: Lightning },
              { value: "<60 min", label: "Emergency Response", icon: Clock },
              { value: "4.9", label: "Customer Rating", icon: Star },
            ].map((stat, i) => (
              <motion.div key={stat.label} variants={fadeUp} className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <stat.icon size={22} weight="fill" style={{ color: AMBER }} />
                  <span className="text-3xl md:text-4xl font-extrabold text-white">{stat.value}</span>
                </div>
                <span className="text-slate-500 text-sm font-medium tracking-wide uppercase">{stat.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ══════════════════ 4. SERVICES ══════════════════ */}
      <SectionReveal
        id="services"
        className="relative z-10 py-24 md:py-32 overflow-hidden"
      >
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #141210 50%, #1a1a1a 100%)" }} />
        <CircuitPattern />
        <LightningBackground opacity={0.025} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[10%] right-[5%] w-[500px] h-[500px] rounded-full blur-[160px]" style={{ background: `${AMBER}08` }} />
          <div className="absolute bottom-[10%] left-[5%] w-[400px] h-[400px] rounded-full blur-[140px]" style={{ background: `${BLUE_SPARK}05` }} />
        </div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <motion.span
              initial={{ opacity: 0, y: -10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border"
              style={{ color: AMBER, borderColor: `${AMBER}33`, background: `${AMBER}0d` }}
            >
              Our Services
            </motion.span>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
              <WordReveal text="Expert Electrical Services" />
            </h2>
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="h-0.5 w-16 mx-auto mt-4"
              style={{ background: `linear-gradient(to right, ${AMBER}, transparent)` }}
            />
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="text-slate-400 mt-4 max-w-2xl text-lg leading-relaxed mx-auto"
            >
              From residential rewiring to commercial build-outs, our master electricians deliver safe, code-compliant work every time.
            </motion.p>
          </div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
          >
            {services.map((service, i) => (
              <motion.div
                key={service.name}
                variants={fadeUp}
                className="group relative p-7 rounded-2xl border border-white/[0.06] hover:border-amber-500/30 transition-all duration-500 overflow-hidden bg-white/[0.02]"
              >
                {/* Hover glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: `radial-gradient(circle at 50% 0%, ${AMBER}15, transparent 70%)` }} />
                {/* Top accent line */}
                <div className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `linear-gradient(to right, transparent, ${AMBER}4d, transparent)` }} />
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-5">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 border"
                      style={{
                        background: AMBER_GLOW,
                        borderColor: `${AMBER}33`,
                      }}
                    >
                      <service.icon size={24} weight="duotone" style={{ color: AMBER }} />
                    </div>
                    <span className="text-xs font-mono text-slate-600">{String(i + 1).padStart(2, "0")}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{service.name}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{service.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ══════════════════ 5. WHY CHOOSE US ══════════════════ */}
      <SectionReveal id="about" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0f0e0c 50%, #1a1a1a 100%)" }} />
        <LightningBackground opacity={0.02} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] left-[10%] w-[500px] h-[500px] rounded-full blur-[180px]" style={{ background: `${AMBER}06` }} />
        </div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Photo */}
            <motion.div
              whileInView={{ opacity: 1, x: 0 }}
              initial={{ opacity: 0, x: -30 }}
              viewport={{ once: true }}
              transition={spring}
              className="relative"
            >
              <div className="rounded-2xl overflow-hidden border border-white/10">
                <img
                  src="https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=600&q=80"
                  alt="Electrician team at work"
                  className="w-full h-[400px] object-cover"
                />
              </div>
              {/* Floating badge */}
              <motion.div
                className="absolute -bottom-4 -right-4 md:bottom-6 md:-right-6"
                whileInView={{ opacity: 1, scale: 1 }}
                initial={{ opacity: 0, scale: 0.8 }}
                viewport={{ once: true }}
                transition={{ ...spring, delay: 0.3 }}
              >
                <div className="px-5 py-3 rounded-xl backdrop-blur-md bg-amber-500/90 border border-amber-400/50 text-black font-bold text-sm shadow-lg">
                  15+ Years Experience
                </div>
              </motion.div>
            </motion.div>

            {/* Trust content */}
            <div>
              <motion.span
                initial={{ opacity: 0, y: -10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border"
                style={{ color: AMBER, borderColor: `${AMBER}33`, background: `${AMBER}0d` }}
              >
                Why Choose Us
              </motion.span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6">
                <WordReveal text="Seattle's Most Trusted Electricians" />
              </h2>
              <p className="text-slate-400 leading-relaxed mb-8">
                For over 15 years, homeowners and businesses across the greater Seattle
                area have trusted Cascade Electric for reliable, safe, and expert electrical
                work. Every job is backed by our satisfaction guarantee.
              </p>

              <motion.div
                className="grid grid-cols-2 gap-4"
                variants={stagger}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
              >
                {[
                  { icon: ShieldCheck, label: "Fully Licensed" },
                  { icon: CheckCircle, label: "Bonded & Insured" },
                  { icon: Star, label: "5-Star Rated" },
                  { icon: Clock, label: "24/7 Emergency" },
                ].map((badge) => (
                  <motion.div key={badge.label} variants={fadeUp}>
                    <GlassCard className="p-4 flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: AMBER_GLOW }}
                      >
                        <badge.icon size={20} weight="duotone" style={{ color: AMBER }} />
                      </div>
                      <span className="text-sm font-semibold text-white">{badge.label}</span>
                    </GlassCard>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* ══════════════════ 6. PROCESS ══════════════════ */}
      <SectionReveal className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #141210 50%, #1a1a1a 100%)" }} />
        <CircuitPattern opacity={0.025} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] rounded-full blur-[180px]" style={{ background: `${BLUE_SPARK}06` }} />
        </div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <motion.span
              initial={{ opacity: 0, y: -10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border"
              style={{ color: AMBER, borderColor: `${AMBER}33`, background: `${AMBER}0d` }}
            >
              Our Process
            </motion.span>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
              <WordReveal text="How We Work" />
            </h2>
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="h-0.5 w-16 mx-auto mt-4"
              style={{ background: `linear-gradient(to right, ${AMBER}, transparent)` }}
            />
          </div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
          >
            {processSteps.map((step, i) => (
              <motion.div key={step.step} variants={fadeUp} className="relative">
                {/* Connector line */}
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
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ══════════════════ 7. PROJECTS GALLERY ══════════════════ */}
      <SectionReveal id="projects" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0f0e0c 50%, #1a1a1a 100%)" }} />
        <LightningBackground opacity={0.02} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[30%] left-[20%] w-[500px] h-[500px] rounded-full blur-[200px]" style={{ background: `${AMBER}06` }} />
        </div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <motion.span
              initial={{ opacity: 0, y: -10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border"
              style={{ color: AMBER, borderColor: `${AMBER}33`, background: `${AMBER}0d` }}
            >
              Our Work
            </motion.span>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
              <WordReveal text="Recent Projects" />
            </h2>
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="h-0.5 w-16 mx-auto mt-4"
              style={{ background: `linear-gradient(to right, ${AMBER}, transparent)` }}
            />
          </div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
          >
            {[
              {
                src: "https://images.unsplash.com/photo-1545259741-2ea3ebf61fa3?w=600&q=80",
                title: "Commercial Panel Installation",
                desc: "Full 400-amp service upgrade for a downtown Seattle office building.",
              },
              {
                src: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?w=600&q=80",
                title: "Residential Smart Home Wiring",
                desc: "Complete smart home wiring and automation for a modern Bellevue residence.",
              },
              {
                src: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?w=800&q=80",
                title: "Emergency Panel Repair",
                desc: "24-hour emergency response for a damaged electrical panel after a storm.",
              },
              {
                src: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800&q=80",
                title: "EV Charger Network",
                desc: "Multi-unit EV charging station installation for a commercial parking facility.",
              },
            ].map((project, i) => (
              <motion.div
                key={project.title}
                variants={fadeUp}
                className="group relative rounded-2xl overflow-hidden border border-white/[0.06] hover:border-amber-500/30 transition-all duration-500"
              >
                <img
                  src={project.src}
                  alt={project.title}
                  className="w-full h-64 object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-lg font-bold text-white mb-1">{project.title}</h3>
                  <p className="text-sm text-slate-300">{project.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ══════════════════ 8. TESTIMONIALS ══════════════════ */}
      <SectionReveal className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #141210 50%, #1a1a1a 100%)" }} />
        <CircuitPattern opacity={0.02} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] right-[15%] w-[400px] h-[400px] rounded-full blur-[160px]" style={{ background: `${AMBER}06` }} />
        </div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <motion.span
              initial={{ opacity: 0, y: -10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border"
              style={{ color: AMBER, borderColor: `${AMBER}33`, background: `${AMBER}0d` }}
            >
              Testimonials
            </motion.span>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
              <WordReveal text="What Our Clients Say" />
            </h2>
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="h-0.5 w-16 mx-auto mt-4"
              style={{ background: `linear-gradient(to right, ${AMBER}, transparent)` }}
            />
          </div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
          >
            {testimonials.map((t, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="p-6 h-full flex flex-col">
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star key={j} size={16} weight="fill" style={{ color: AMBER }} />
                    ))}
                  </div>
                  <p className="text-slate-300 leading-relaxed flex-1 text-sm mb-4">
                    &ldquo;{t.text}&rdquo;
                  </p>
                  <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                    <span className="text-sm font-semibold text-white">{t.name}</span>
                    <span className="text-xs px-2 py-1 rounded-full border" style={{ color: AMBER, borderColor: `${AMBER}33`, background: `${AMBER}0d` }}>
                      {t.service}
                    </span>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ══════════════════ 9. EMERGENCY CTA ══════════════════ */}
      <SectionReveal className="relative z-10 py-20 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${AMBER}, #d97706, ${AMBER})` }} />
        {/* Cross-hatch pattern overlay */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='40' height='40' fill='none'/%3E%3Cpath d='M0 0L40 40M40 0L0 40' stroke='%23000' stroke-width='0.5'/%3E%3C/svg%3E\")" }} />
        <LightningBackground opacity={0.06} />

        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <motion.div
            whileInView={{ opacity: 1, scale: 1 }}
            initial={{ opacity: 0, scale: 0.95 }}
            viewport={{ once: true }}
            transition={spring}
          >
            <Warning size={48} weight="fill" className="mx-auto mb-6 text-black/70" />
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-black mb-4">
              Electrical Emergency? We&apos;re Here 24/7
            </h2>
            <p className="text-lg text-black/70 mb-8 max-w-xl mx-auto">
              Power outages, sparking outlets, burning smells — do not wait. Our emergency
              electricians respond fast to keep your home and family safe.
            </p>
            <a
              href="tel:2065550103"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-black text-white font-bold text-lg hover:bg-black/80 transition-colors"
            >
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600" />
              </span>
              (206) 555-0103
            </a>
          </motion.div>
        </div>
      </SectionReveal>

      {/* ══════════════════ 10. SERVICE AREAS ══════════════════ */}
      <SectionReveal className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0f0e0c 50%, #1a1a1a 100%)" }} />
        <CircuitPattern opacity={0.02} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[40%] right-[20%] w-[400px] h-[400px] rounded-full blur-[180px]" style={{ background: `${BLUE_SPARK}06` }} />
        </div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <motion.span
              initial={{ opacity: 0, y: -10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border"
              style={{ color: AMBER, borderColor: `${AMBER}33`, background: `${AMBER}0d` }}
            >
              Coverage Area
            </motion.span>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
              <WordReveal text="Areas We Serve" />
            </h2>
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="h-0.5 w-16 mx-auto mt-4"
              style={{ background: `linear-gradient(to right, ${AMBER}, transparent)` }}
            />
          </div>

          <motion.div
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
          >
            {serviceAreas.map((area) => (
              <motion.div key={area} variants={fadeUp}>
                <GlassCard className="p-4 flex items-center gap-3">
                  <MapPin size={18} weight="duotone" style={{ color: AMBER }} className="shrink-0" />
                  <span className="text-sm font-medium text-white">{area}</span>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ══════════════════ 11. FAQ ══════════════════ */}
      <SectionReveal className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #141210 50%, #1a1a1a 100%)" }} />
        <LightningBackground opacity={0.02} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] left-[15%] w-[400px] h-[400px] rounded-full blur-[160px]" style={{ background: `${AMBER}06` }} />
        </div>

        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <motion.span
              initial={{ opacity: 0, y: -10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border"
              style={{ color: AMBER, borderColor: `${AMBER}33`, background: `${AMBER}0d` }}
            >
              FAQ
            </motion.span>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
              <WordReveal text="Common Questions" />
            </h2>
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="h-0.5 w-16 mx-auto mt-4"
              style={{ background: `linear-gradient(to right, ${AMBER}, transparent)` }}
            />
          </div>

          <motion.div
            className="space-y-3"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
          >
            {faqs.map((faq, i) => (
              <motion.div key={i} variants={fadeUp}>
                <AccordionItem
                  question={faq.q}
                  answer={faq.a}
                  isOpen={openFaq === i}
                  onToggle={() => setOpenFaq(openFaq === i ? null : i)}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ══════════════════ 12. CONTACT ══════════════════ */}
      <SectionReveal id="contact" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0f0e0c 50%, #1a1a1a 100%)" }} />
        <CircuitPattern opacity={0.02} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] rounded-full blur-[180px]" style={{ background: `${AMBER}06` }} />
        </div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Info side */}
            <div>
              <motion.span
                initial={{ opacity: 0, y: -10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border"
                style={{ color: AMBER, borderColor: `${AMBER}33`, background: `${AMBER}0d` }}
              >
                Contact Us
              </motion.span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6">
                <WordReveal text="Get Your Free Estimate" />
              </h2>
              <p className="text-slate-400 leading-relaxed mb-8">
                Ready to start your project? Contact us today for a free, no-obligation
                estimate. We respond to all inquiries within 24 hours.
              </p>

              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: AMBER_GLOW }}>
                    <MapPin size={20} weight="duotone" style={{ color: AMBER }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Address</p>
                    <p className="text-sm text-slate-400">4521 Aurora Ave N, Seattle, WA 98103</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: AMBER_GLOW }}>
                    <Phone size={20} weight="duotone" style={{ color: AMBER }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Phone</p>
                    <p className="text-sm text-slate-400">(206) 555-0103</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: AMBER_GLOW }}>
                    <Lightning size={20} weight="duotone" style={{ color: AMBER }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Email</p>
                    <p className="text-sm text-slate-400">info@cascadeelectric.com</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: AMBER_GLOW }}>
                    <Clock size={20} weight="duotone" style={{ color: AMBER }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Hours</p>
                    <p className="text-sm text-slate-400">
                      Monday - Friday: 7:00 AM - 6:00 PM<br />
                      Saturday: 8:00 AM - 3:00 PM<br />
                      Emergency: 24/7/365
                    </p>
                  </div>
                </div>
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
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 transition-colors text-sm"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1.5">Last Name</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 transition-colors text-sm"
                      placeholder="Doe"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">Phone</label>
                  <input
                    type="tel"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 transition-colors text-sm"
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">Service Needed</label>
                  <select className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-amber-500/50 transition-colors text-sm">
                    <option value="" className="bg-neutral-900">Select a service</option>
                    <option value="residential" className="bg-neutral-900">Residential Wiring</option>
                    <option value="commercial" className="bg-neutral-900">Commercial Electrical</option>
                    <option value="panel" className="bg-neutral-900">Panel Upgrades</option>
                    <option value="ev" className="bg-neutral-900">EV Charger Installation</option>
                    <option value="emergency" className="bg-neutral-900">Emergency Repairs</option>
                    <option value="lighting" className="bg-neutral-900">Lighting Design</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">Message</label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 transition-colors text-sm resize-none"
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
      </SectionReveal>

      {/* ══════════════════ 13. FOOTER ══════════════════ */}
      <footer className="relative z-10 border-t border-white/5 py-10 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #111 100%)" }} />
        <CircuitPattern opacity={0.015} />
        <div className="mx-auto max-w-6xl px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Lightning size={22} weight="fill" style={{ color: AMBER }} />
                <span className="text-lg font-bold text-white">Cascade Electric Co.</span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">
                Licensed master electricians serving the greater Seattle area since 2008.
                Residential, commercial, and emergency electrical services.
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
                <p>(206) 555-0103</p>
                <p>info@cascadeelectric.com</p>
                <p>4521 Aurora Ave N, Seattle, WA 98103</p>
              </div>
            </div>
          </div>

          <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Lightning size={14} weight="fill" style={{ color: AMBER }} />
              <span>Cascade Electric Co. &copy; {new Date().getFullYear()}</span>
            </div>
            <p className="text-xs text-slate-600">
              Created by <a href="https://bluejayportfolio.com" target="_blank" rel="noopener noreferrer" style={{textDecoration:"underline"}}>bluejayportfolio.com</a>
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
