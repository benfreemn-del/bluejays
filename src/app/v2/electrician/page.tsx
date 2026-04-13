"use client";

/* eslint-disable @next/next/no-img-element */

import { useState, useRef, useEffect, useCallback } from "react";
import {
  motion,
  useInView,
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
  XCircle,
  Envelope,
  Play,
  Certificate,
  Users,
  Quotes,
  Timer,
  CurrencyDollar,
  GearSix,
  CarSimple,
  SolarPanel,
  Fan,
} from "@phosphor-icons/react";

/* ───────────────────────── SPRING / ANIMATION CONFIGS ───────────────────────── */
const spring = { type: "spring" as const, stiffness: 100, damping: 20 };
const springFast = { type: "spring" as const, stiffness: 200, damping: 25 };

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: spring },
};
const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.6 } },
};

/* ───────────────────────── COLORS ───────────────────────── */
const CHARCOAL = "#1a1a1a";
const CHARCOAL_LIGHT = "#242424";
const AMBER = "#f59e0b";
const AMBER_LIGHT = "#fbbf24";
const AMBER_GLOW = "rgba(245, 158, 11, 0.15)";
const BLUE_SPARK = "#3b82f6";
const RED_EMERGENCY = "#ef4444";

/* ───────────────────────── DATA CONSTANTS ───────────────────────── */
const SERVICES = [
  { title: "Panel Upgrades", desc: "200A upgrades for modern homes — no more tripped breakers.", icon: Lightning },
  { title: "EV Charger Installation", desc: "Tesla, ChargePoint, and universal Level 2 chargers wired to code.", icon: CarSimple },
  { title: "Whole-Home Rewiring", desc: "Safe, code-compliant rewiring for pre-1970 Seattle homes.", icon: HouseLine },
  { title: "Generator Installation", desc: "Automatic standby generators — never lose power in a storm.", icon: BatteryCharging },
  { title: "Smart Home Wiring", desc: "Lutron, Crestron, and whole-home network infrastructure.", icon: GearSix },
  { title: "Commercial Electrical", desc: "Tenant improvements, code upgrades, and 3-phase installations.", icon: Buildings },
  { title: "Lighting Design", desc: "Recessed, under-cabinet, landscape, and architectural lighting.", icon: LightbulbFilament },
  { title: "Code Corrections", desc: "Fix violations found during inspections — fast and guaranteed.", icon: ShieldCheck },
];

const PRICING = [
  { label: "Outlet / Switch Repair", price: "$99", note: "Per location, parts included", color: AMBER },
  { label: "Panel Upgrade", price: "$1,800", note: "200A residential, permit included", color: BLUE_SPARK },
  { label: "EV Charger Install", price: "$799", note: "Level 2, most vehicles", color: AMBER },
];

const SAFETY_PILLARS = [
  { title: "Master Electrician on Every Job", desc: "Mike Torres personally oversees every project — never a handyman stand-in.", icon: Certificate },
  { title: "Code-Compliant Work", desc: "Every install permitted and inspected. We pull the permits so you don't have to.", icon: ShieldCheck },
  { title: "Background-Checked Crew", desc: "Every technician passes a full background check before entering your home.", icon: Users },
  { title: "Lifetime Warranty on Labor", desc: "If our workmanship ever fails, we fix it free — forever. No fine print.", icon: Star },
];

const PROJECTS = [
  {
    title: "200-Amp Panel Upgrade",
    location: "Ballard Craftsman",
    desc: "Replaced a 1962 Federal Pacific panel with a new Square D 200A panel, 42-circuit capacity. Full inspection passed same day.",
    img: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&q=80",
  },
  {
    title: "Tesla Wall Connector",
    location: "Capitol Hill Townhome",
    desc: "Dedicated 60A circuit from panel to garage, NEMA 14-50 outlet backup, clean conduit run along foundation wall.",
    img: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800&q=80",
  },
  {
    title: "Commercial Rewire",
    location: "Fremont Brewery",
    desc: "Full 3-phase 400A service upgrade for new brewing equipment. Zero downtime — phased installation over 3 weekends.",
    img: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&q=80",
  },
  {
    title: "Smart Home System",
    location: "Mercer Island Estate",
    desc: "Lutron Caseta throughout, 47 zones, centralized panel, landscape lighting, and whole-home Cat6 network.",
    img: "https://images.unsplash.com/photo-1558002038-1055907df827?w=800&q=80",
  },
];

const QUIZ_OPTIONS = [
  { label: "Outlet / Switch Problem", color: "#22c55e", icon: Plug, rec: "Quick fix — most outlet and switch repairs are completed in under an hour. Call for same-day scheduling." },
  { label: "Panel Upgrade", color: BLUE_SPARK, icon: Lightning, rec: "Capacity upgrade — we'll assess your current panel and provide a fixed-price quote. Free estimates available." },
  { label: "New Installation", color: AMBER, icon: SolarPanel, rec: "EV chargers, generators, lighting — tell us what you need and we'll design the right system for your home." },
  { label: "Emergency", color: RED_EMERGENCY, icon: Warning, rec: "Sparks, burning smell, or outage? Call (206) 555-0471 immediately — we respond in under 60 minutes." },
];

const COMPARISON_ROWS = [
  { feature: "Licensed Master Electrician", us: true, them: false },
  { feature: "Permits Pulled on Every Job", us: true, them: false },
  { feature: "Full Code Compliance", us: true, them: false },
  { feature: "$2M Liability Insurance", us: true, them: false },
  { feature: "Lifetime Labor Warranty", us: true, them: false },
  { feature: "60-Min Emergency Response", us: true, them: false },
  { feature: "On-Site Owner Supervision", us: true, them: false },
];

const TESTIMONIALS = [
  { text: "Mike rewired our entire 1920s Craftsman. Not a single code issue on final inspection — the city inspector actually complimented the work.", author: "Tom & Sarah B.", location: "Ballard", stars: 5 },
  { text: "The Tesla charger install took 3 hours. Clean work, no mess, and he showed me exactly how everything was wired. Professional from start to finish.", author: "Priya K.", location: "Capitol Hill", stars: 5 },
  { text: "Had a panel fire scare at 11pm. Mike was there in 40 minutes. Isolated the problem, made it safe, and came back the next morning to do the full repair.", author: "Greg W.", location: "Fremont", stars: 5 },
  { text: "Three electricians told us we needed a full rewire. Mike found the actual problem — a single corroded junction box. Saved us $8,000.", author: "Amy R.", location: "Wallingford", stars: 5 },
  { text: "Cascade wired our entire restaurant build-out on time and under budget. The inspection passed first try. We recommend them to every business owner we know.", author: "Chef Daniel M.", location: "Fremont", stars: 5 },
];

const SERVICE_AREAS = [
  "Seattle", "Bellevue", "Kirkland", "Redmond", "Shoreline", "Lynnwood", "Bothell", "Edmonds",
];

/* ───────────────────────── FLOATING SPARK PARTICLES ───────────────────────── */
function FloatingSparks() {
  const particles = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 8,
    duration: 5 + Math.random() * 7,
    size: 2 + Math.random() * 3,
    opacity: 0.12 + Math.random() * 0.3,
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
            opacity: { duration: p.duration, repeat: Infinity, delay: p.delay, times: [0, 0.1, 0.9, 1] },
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
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#circuitGridV2)" />
    </svg>
  );
}

/* ───────────────────────── HERO LIGHTNING BOLT SVG ───────────────────────── */
function HeroLightningBolt() {
  return (
    <motion.svg
      viewBox="0 0 120 260"
      className="absolute right-8 top-12 w-20 h-44 md:w-28 md:h-60 opacity-20 pointer-events-none"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 0.2 }}
      transition={{ duration: 2, ease: "easeInOut" }}
    >
      <defs>
        <linearGradient id="boltGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={AMBER_LIGHT} />
          <stop offset="100%" stopColor={AMBER} />
        </linearGradient>
        <filter id="boltGlow">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <motion.path
        d="M70 0 L30 100 L60 100 L20 200 L55 200 L10 260 L50 180 L25 180 L55 90 L30 90 L70 0Z"
        fill="url(#boltGrad)"
        filter="url(#boltGlow)"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0.7, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.svg>
  );
}

/* ───────────────────────── ANIMATED COUNTER ───────────────────────── */
function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const motionVal = useMotionValue(0);
  const springVal = useSpring(motionVal, { stiffness: 40, damping: 20 });
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (isInView) motionVal.set(target);
  }, [isInView, motionVal, target]);

  useEffect(() => {
    const unsub = springVal.on("change", (v) => {
      setDisplay(Math.round(v).toLocaleString());
    });
    return unsub;
  }, [springVal]);

  return <span ref={ref}>{display}{suffix}</span>;
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
        <motion.span key={i} variants={fadeUp} className="inline-block">{word}</motion.span>
      ))}
    </motion.span>
  );
}

/* ───────────────────────── SECTION WRAPPER ───────────────────────── */
function Section({ children, className = "", id }: { children: React.ReactNode; className?: string; id?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.section
      ref={ref}
      id={id}
      className={`relative py-20 md:py-28 ${className}`}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={spring}
    >
      {children}
    </motion.section>
  );
}

/* ───────────────────────── GLASS CARD ───────────────────────── */
function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-white/[0.08] p-6 md:p-8 ${className}`}
      style={{ background: "rgba(255,255,255,0.04)" }}
    >
      {children}
    </div>
  );
}

/* ───────────────────────── SECTION HEADER ───────────────────────── */
function SectionHeader({ title, accent, subtitle }: { title: string; accent: string; subtitle?: string }) {
  return (
    <div className="text-center mb-12 md:mb-16">
      <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight">
        {title} <span style={{ color: AMBER }}>{accent}</span>
      </h2>
      {subtitle && <p className="mt-4 text-lg text-white/50 max-w-2xl mx-auto">{subtitle}</p>}
      <div className="mt-4 mx-auto w-20 h-1 rounded-full" style={{ background: `linear-gradient(90deg, ${AMBER}, ${BLUE_SPARK})` }} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════════════════════ */
export default function ElectricianV2Showcase() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [quizActive, setQuizActive] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: "", phone: "", email: "", service: "", message: "" });

  const NAV_LINKS = [
    { label: "Services", href: "#services" },
    { label: "Pricing", href: "#pricing" },
    { label: "Projects", href: "#projects" },
    { label: "Reviews", href: "#reviews" },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <div className="relative min-h-screen overflow-x-hidden" style={{ background: CHARCOAL, color: "#fff" }}>
      <FloatingSparks />

      {/* ─────────────────── NAV ─────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06]" style={{ background: "rgba(26,26,26,0.92)", backdropFilter: "blur(16px)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16 md:h-18">
          <a href="#" className="flex items-center gap-2">
            <Lightning size={28} weight="fill" style={{ color: AMBER }} />
            <span className="text-lg font-bold tracking-tight">Cascade Electric Co.</span>
          </a>
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((l) => (
              <a key={l.label} href={l.href} className="text-sm text-white/60 hover:text-white transition-colors">{l.label}</a>
            ))}
            <a href="tel:2065550471" className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold" style={{ background: AMBER, color: "#000" }}>
              <Phone size={16} weight="bold" /> (206) 555-0471
            </a>
          </div>
          <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={24} /> : <List size={24} />}
          </button>
        </div>
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden border-t border-white/[0.06]"
              style={{ background: "rgba(26,26,26,0.98)" }}
            >
              <div className="px-4 py-4 flex flex-col gap-3">
                {NAV_LINKS.map((l) => (
                  <a key={l.label} href={l.href} onClick={() => setMenuOpen(false)} className="text-white/70 py-2">{l.label}</a>
                ))}
                <a href="tel:2065550471" className="flex items-center justify-center gap-2 py-3 rounded-xl font-semibold mt-2" style={{ background: AMBER, color: "#000" }}>
                  <Phone size={18} weight="bold" /> Call Now
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ═══════════════════════════════════════════════════════════════
          1. HERO — DIAGONAL SPLIT
          ═══════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        {/* Dark left background */}
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${CHARCOAL} 0%, #0f0f0f 100%)` }} />
        <CircuitPattern opacity={0.04} />

        {/* Diagonal photo on the right */}
        <div className="absolute inset-0 hidden md:block">
          <div
            className="absolute top-0 right-0 h-full"
            style={{
              width: "55%",
              clipPath: "polygon(20% 0, 100% 0, 100% 100%, 0% 100%)",
            }}
          >
            <img
              src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=1400&q=80"
              alt="Professional electrician working on panel"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(26,26,26,1) 0%, rgba(26,26,26,0.4) 30%, rgba(26,26,26,0.1) 100%)" }} />
            <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, transparent 60%, ${CHARCOAL})` }} />
          </div>
        </div>

        {/* Lightning bolt accent */}
        <HeroLightningBolt />

        {/* Hero content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full">
          <div className="max-w-2xl">
            {/* Emergency badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-8"
              style={{ background: "rgba(239,68,68,0.12)", borderColor: "rgba(239,68,68,0.3)" }}
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: RED_EMERGENCY }} />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ background: RED_EMERGENCY }} />
              </span>
              <span className="text-sm font-semibold" style={{ color: RED_EMERGENCY }}>60-Minute Emergency Response</span>
            </motion.div>

            <motion.h1
              className="text-5xl sm:text-6xl md:text-7xl font-black leading-[0.95] tracking-tight mb-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, ...spring }}
            >
              <span className="text-white">Powering</span><br />
              <span style={{ color: AMBER }}>Seattle&apos;s</span>{" "}
              <span className="text-white">Homes<br />&amp; Businesses</span>
            </motion.h1>

            <motion.p
              className="text-lg md:text-xl text-white/50 mb-8 max-w-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              Master Electrician Mike Torres — 18 years, 2,500+ projects, and one promise: every job done safe, on time, and to code.
            </motion.p>

            <motion.div
              className="flex flex-wrap gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <a href="#contact" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-lg font-bold transition-transform hover:scale-105" style={{ background: AMBER, color: "#000" }}>
                Free Estimate <ArrowRight size={20} weight="bold" />
              </a>
              <a href="tel:2065550471" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-lg font-bold border-2 transition-transform hover:scale-105" style={{ borderColor: "rgba(255,255,255,0.2)", color: "#fff" }}>
                <Phone size={20} weight="bold" /> Call Now
              </a>
            </motion.div>

            {/* Trust pills on hero */}
            <motion.div
              className="flex flex-wrap gap-3 mt-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
            >
              {["Master Electrician", "WA Licensed", "2,500+ Projects", "4.9 Stars"].map((badge) => (
                <span key={badge} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border" style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)" }}>
                  <CheckCircle size={14} style={{ color: AMBER }} weight="fill" /> {badge}
                </span>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32" style={{ background: `linear-gradient(to top, ${CHARCOAL}, transparent)` }} />
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          2. EMERGENCY RESPONSE STRIP
          ═══════════════════════════════════════════════════════════════ */}
      <div className="relative z-10 py-4 overflow-hidden" style={{ background: `linear-gradient(90deg, ${RED_EMERGENCY}, #dc2626)` }}>
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-center gap-3 text-center">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-white" />
          </span>
          <span className="text-sm sm:text-base font-bold text-white tracking-wide">
            Electrical Emergency? We&apos;re There in 60 Minutes or Less
          </span>
          <a href="tel:2065550471" className="inline-flex items-center gap-2 px-4 py-1.5 bg-white rounded-full text-sm font-bold" style={{ color: RED_EMERGENCY }}>
            <Phone size={14} weight="bold" /> (206) 555-0471
          </a>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          3. TRUST BAR
          ═══════════════════════════════════════════════════════════════ */}
      <Section className="!py-12 md:!py-16">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, rgba(245,158,11,0.04) 0%, transparent 100%)` }} />
        <div className="relative max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 md:gap-4 text-center">
            {[
              { label: "Master Electrician", value: <Certificate size={28} style={{ color: AMBER }} weight="fill" /> },
              { label: "Years Experience", value: <AnimatedCounter target={18} /> },
              { label: "Projects Completed", value: <><AnimatedCounter target={2500} suffix="+" /></> },
              { label: "WA License", value: <span className="text-xs" style={{ color: AMBER }}>#CASCAEC789QZ</span> },
              { label: "Google Rating", value: <span className="flex items-center justify-center gap-1"><AnimatedCounter target={4} suffix=".9" /> <Star size={18} weight="fill" style={{ color: AMBER }} /></span> },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                className="flex flex-col items-center gap-2"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, ...spring }}
              >
                <div className="text-2xl md:text-3xl font-black text-white">{stat.value}</div>
                <div className="text-xs text-white/40 uppercase tracking-widest">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════════════════════
          4. SERVICES — STAGGERED 2-ROW LAYOUT
          ═══════════════════════════════════════════════════════════════ */}
      <Section id="services">
        <CircuitPattern opacity={0.02} />
        <div className="relative max-w-7xl mx-auto px-4">
          <SectionHeader title="Our" accent="Services" subtitle="From outlets to full commercial build-outs — licensed, insured, and guaranteed." />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {SERVICES.map((svc, i) => {
              const Icon = svc.icon;
              return (
                <motion.div
                  key={svc.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, ...spring }}
                  style={{ marginTop: i % 2 === 1 ? "2rem" : "0" }}
                >
                  <GlassCard className="h-full group hover:border-amber-500/30 transition-all duration-300">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: AMBER_GLOW }}>
                      <Icon size={24} weight="duotone" style={{ color: AMBER }} />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{svc.title}</h3>
                    <p className="text-sm text-white/45 leading-relaxed">{svc.desc}</p>
                  </GlassCard>
                </motion.div>
              );
            })}
          </div>
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════════════════════
          5. UPFRONT PRICING
          ═══════════════════════════════════════════════════════════════ */}
      <Section id="pricing">
        <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at center, ${AMBER_GLOW} 0%, transparent 60%)` }} />
        <div className="relative max-w-5xl mx-auto px-4">
          <SectionHeader title="Transparent" accent="Pricing" subtitle="No surprises. No hidden fees. You know the price before we start." />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PRICING.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, ...spring }}
              >
                <GlassCard className="text-center hover:border-amber-500/30 transition-all duration-300">
                  <div className="text-sm uppercase tracking-widest text-white/40 mb-3">{item.label}</div>
                  <div className="text-4xl md:text-5xl font-black mb-1" style={{ color: item.color }}>{item.price}</div>
                  <div className="text-xs text-white/35 mb-6">{item.note}</div>
                  <div className="w-full h-px mb-6" style={{ background: "rgba(255,255,255,0.06)" }} />
                  <span className="text-xs uppercase tracking-wider" style={{ color: AMBER }}>Starting from</span>
                </GlassCard>
              </motion.div>
            ))}
          </div>
          <p className="text-center text-white/30 text-sm mt-8">All prices include materials, labor, and permit fees. Final quote provided on-site.</p>
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════════════════════
          6. SAFETY GUARANTEE
          ═══════════════════════════════════════════════════════════════ */}
      <Section>
        <CircuitPattern opacity={0.025} />
        <div className="relative max-w-6xl mx-auto px-4">
          <SectionHeader title="The Cascade" accent="Safety Promise" subtitle="What separates a Master Electrician from a handyman with a wire stripper." />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {SAFETY_PILLARS.map((pillar, i) => {
              const Icon = pillar.icon;
              return (
                <motion.div
                  key={pillar.title}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, ...spring }}
                >
                  <GlassCard className="flex gap-5 items-start h-full hover:border-amber-500/20 transition-all">
                    <div className="w-14 h-14 rounded-xl flex-shrink-0 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${AMBER_GLOW}, rgba(59,130,246,0.1))` }}>
                      <Icon size={28} weight="duotone" style={{ color: AMBER }} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white mb-1">{pillar.title}</h3>
                      <p className="text-sm text-white/45 leading-relaxed">{pillar.desc}</p>
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })}
          </div>
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════════════════════
          7. MEET MIKE TORRES
          ═══════════════════════════════════════════════════════════════ */}
      <Section>
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, rgba(59,130,246,0.04) 0%, rgba(245,158,11,0.04) 100%)` }} />
        <div className="relative max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Photo */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={spring}
              className="relative"
            >
              <div className="rounded-2xl overflow-hidden border border-white/[0.08]">
                <img
                  src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=700&q=80"
                  alt="Mike Torres — Master Electrician"
                  className="w-full aspect-[4/5] object-cover object-top"
                />
              </div>
              {/* License badge overlay */}
              <div
                className="absolute -bottom-4 -right-4 md:-right-6 px-5 py-3 rounded-xl border border-white/[0.1]"
                style={{ background: "rgba(26,26,26,0.9)", backdropFilter: "blur(12px)" }}
              >
                <div className="text-xs text-white/40 uppercase tracking-wider">WA License</div>
                <div className="text-sm font-bold" style={{ color: AMBER }}>#CASCAEC789QZ</div>
              </div>
            </motion.div>

            {/* Bio */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={spring}
            >
              <div className="text-sm uppercase tracking-widest mb-3" style={{ color: AMBER }}>Meet Your Electrician</div>
              <h2 className="text-3xl md:text-4xl font-black text-white mb-6">Mike Torres</h2>
              <p className="text-white/50 leading-relaxed mb-4">
                Master Electrician since 2007 and proud graduate of IBEW Local 46. Mike started Cascade Electric after spending a decade running jobs for one of Seattle&apos;s largest commercial firms.
              </p>
              <p className="text-white/50 leading-relaxed mb-6">
                His philosophy is simple: treat every home like it&apos;s your own. That means clean work, honest pricing, and the kind of wiring you&apos;d want behind your own walls. 2,500 projects later, every single one has passed inspection on the first try.
              </p>
              <div className="flex flex-wrap gap-3">
                {["IBEW Local 46", "Master Electrician", "18 Years", "WA Licensed"].map((cred) => (
                  <span key={cred} className="px-3 py-1.5 rounded-full text-xs font-medium border" style={{ borderColor: "rgba(245,158,11,0.3)", color: AMBER, background: "rgba(245,158,11,0.08)" }}>
                    {cred}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════════════════════
          8. PROJECT SHOWCASE
          ═══════════════════════════════════════════════════════════════ */}
      <Section id="projects">
        <CircuitPattern opacity={0.02} />
        <div className="relative max-w-7xl mx-auto px-4">
          <SectionHeader title="Recent" accent="Projects" subtitle="Real work for real Seattle homes and businesses." />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {PROJECTS.map((proj, i) => (
              <motion.div
                key={proj.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, ...spring }}
              >
                <GlassCard className="overflow-hidden group hover:border-amber-500/20 transition-all !p-0">
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={proj.img}
                      alt={proj.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(26,26,26,0.8) 0%, transparent 50%)" }} />
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="text-xs uppercase tracking-wider mb-1" style={{ color: AMBER }}>{proj.location}</div>
                      <h3 className="text-lg font-bold text-white">{proj.title}</h3>
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="text-sm text-white/45 leading-relaxed">{proj.desc}</p>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════════════════════
          9. WHAT DOES YOUR HOME NEED? QUIZ
          ═══════════════════════════════════════════════════════════════ */}
      <Section>
        <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at top, ${AMBER_GLOW} 0%, transparent 50%)` }} />
        <div className="relative max-w-5xl mx-auto px-4">
          <SectionHeader title="What Does Your" accent="Home Need?" subtitle="Select your situation and we'll point you in the right direction." />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {QUIZ_OPTIONS.map((opt, i) => {
              const Icon = opt.icon;
              const isActive = quizActive === i;
              return (
                <motion.div
                  key={opt.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, ...spring }}
                >
                  <button
                    onClick={() => setQuizActive(isActive ? null : i)}
                    className="w-full text-left rounded-2xl border transition-all duration-300 overflow-hidden"
                    style={{
                      borderColor: isActive ? opt.color : "rgba(255,255,255,0.08)",
                      background: isActive ? `${opt.color}10` : "rgba(255,255,255,0.04)",
                    }}
                  >
                    <div className="p-5 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${opt.color}18` }}>
                        <Icon size={24} weight="duotone" style={{ color: opt.color }} />
                      </div>
                      <div>
                        <h3 className="font-bold text-white">{opt.label}</h3>
                        <div className="text-xs text-white/30 mt-0.5">Click to see recommendation</div>
                      </div>
                      <CaretDown
                        size={18}
                        className="ml-auto transition-transform duration-300"
                        style={{ color: opt.color, transform: isActive ? "rotate(180deg)" : "rotate(0)" }}
                      />
                    </div>
                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="px-5 pb-5 pt-0">
                            <div className="h-px mb-4" style={{ background: `${opt.color}20` }} />
                            <p className="text-sm text-white/50 mb-4">{opt.rec}</p>
                            <a
                              href={opt.label === "Emergency" ? "tel:2065550471" : "#contact"}
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-transform hover:scale-105"
                              style={{ background: opt.color, color: "#fff" }}
                            >
                              {opt.label === "Emergency" ? "Call Now" : "Get a Quote"} <ArrowRight size={14} weight="bold" />
                            </a>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════════════════════
          10. COMPETITOR COMPARISON
          ═══════════════════════════════════════════════════════════════ */}
      <Section>
        <CircuitPattern opacity={0.02} />
        <div className="relative max-w-4xl mx-auto px-4">
          <SectionHeader title="Cascade Electric vs." accent="Handyman Electrical" subtitle="There's a reason licensed electricians exist." />
          <GlassCard>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/[0.08]">
                    <th className="pb-4 text-sm text-white/40 font-medium">Feature</th>
                    <th className="pb-4 text-sm font-semibold text-center" style={{ color: AMBER }}>Cascade Electric</th>
                    <th className="pb-4 text-sm text-white/30 font-medium text-center">Handyman</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_ROWS.map((row, i) => (
                    <motion.tr
                      key={row.feature}
                      className="border-b border-white/[0.04]"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.06, ...spring }}
                    >
                      <td className="py-4 text-sm text-white/60">{row.feature}</td>
                      <td className="py-4 text-center">
                        <CheckCircle size={22} weight="fill" style={{ color: "#22c55e" }} className="mx-auto" />
                      </td>
                      <td className="py-4 text-center">
                        <XCircle size={22} weight="fill" style={{ color: "#ef4444" }} className="mx-auto opacity-50" />
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════════════════════
          11. TESTIMONIALS — ALTERNATING LAYOUT
          ═══════════════════════════════════════════════════════════════ */}
      <Section id="reviews">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, transparent, rgba(245,158,11,0.03), transparent)` }} />
        <div className="relative max-w-5xl mx-auto px-4">
          <SectionHeader title="What Seattle" accent="Says About Us" />
          {/* Google review header */}
          <div className="flex items-center justify-center gap-3 mb-12">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={20} weight="fill" style={{ color: AMBER }} />
              ))}
            </div>
            <span className="text-white/60 text-sm">4.9 out of 5 based on 127 Google reviews</span>
          </div>

          <div className="flex flex-col gap-6">
            {TESTIMONIALS.map((t, i) => {
              const isRight = i % 2 === 1;
              return (
                <motion.div
                  key={t.author}
                  className={`max-w-2xl ${isRight ? "ml-auto" : "mr-auto"}`}
                  initial={{ opacity: 0, x: isRight ? 40 : -40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, ...spring }}
                >
                  <GlassCard className="hover:border-amber-500/20 transition-all">
                    <Quotes size={24} weight="fill" style={{ color: AMBER }} className="mb-3 opacity-40" />
                    <p className="text-white/60 leading-relaxed mb-4 text-sm">{t.text}</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-semibold text-white">{t.author}</div>
                        <div className="text-xs text-white/30">{t.location}</div>
                      </div>
                      <div className="flex items-center gap-1">
                        <CheckCircle size={14} weight="fill" style={{ color: "#22c55e" }} />
                        <span className="text-xs text-white/30">Verified</span>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })}
          </div>
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════════════════════
          12. FINANCING
          ═══════════════════════════════════════════════════════════════ */}
      <Section>
        <CircuitPattern opacity={0.02} />
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <SectionHeader title="Flexible" accent="Financing Available" subtitle="Don't let cost delay a safety upgrade. We make it easy." />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "0% Interest", desc: "For 12 months on jobs over $1,500", highlight: true },
              { title: "$89/mo", desc: "Example payment on a $3,200 panel upgrade" },
              { title: "Apply in Minutes", desc: "Soft credit check — no impact to your score" },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, ...spring }}
              >
                <GlassCard className={`text-center ${item.highlight ? "!border-amber-500/30" : ""}`}>
                  <div className="text-3xl font-black mb-2" style={{ color: item.highlight ? AMBER : "#fff" }}>{item.title}</div>
                  <p className="text-sm text-white/40">{item.desc}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
          <motion.a
            href="#contact"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold mt-8 transition-transform hover:scale-105"
            style={{ background: AMBER, color: "#000" }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Ask About Financing <ArrowRight size={16} weight="bold" />
          </motion.a>
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════════════════════
          13. VIDEO PLACEHOLDER
          ═══════════════════════════════════════════════════════════════ */}
      <Section>
        <div className="relative max-w-5xl mx-auto px-4">
          <motion.div
            className="relative rounded-2xl overflow-hidden border border-white/[0.08] cursor-pointer group"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={spring}
          >
            <img
              src="https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=1200&q=80"
              alt="See our work in action"
              className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ background: "rgba(26,26,26,0.6)" }}>
              <div className="w-20 h-20 rounded-full flex items-center justify-center border-2 border-white/30 group-hover:border-amber-500/50 group-hover:scale-110 transition-all" style={{ background: "rgba(245,158,11,0.15)" }}>
                <Play size={36} weight="fill" style={{ color: AMBER }} />
              </div>
              <div className="mt-4 text-lg font-bold text-white">See Our Work in Action</div>
              <div className="text-sm text-white/40">3 min — Panel upgrades, EV installs, and more</div>
            </div>
          </motion.div>
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════════════════════
          14. SERVICE AREAS
          ═══════════════════════════════════════════════════════════════ */}
      <Section>
        <CircuitPattern opacity={0.02} />
        <div className="relative max-w-5xl mx-auto px-4">
          <SectionHeader title="Serving the" accent="Seattle Metro" subtitle="Same-day appointments available across all service areas." />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {SERVICE_AREAS.map((city, i) => (
              <motion.div
                key={city}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, ...spring }}
              >
                <GlassCard className="text-center hover:border-amber-500/20 transition-all !py-5">
                  <MapPin size={20} weight="duotone" style={{ color: AMBER }} className="mx-auto mb-2" />
                  <div className="text-sm font-semibold text-white">{city}</div>
                  <div className="text-xs text-white/30 mt-1 flex items-center justify-center gap-1">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: "#22c55e" }} />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ background: "#22c55e" }} />
                    </span>
                    Available
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════════════════════
          15. CONTACT FORM
          ═══════════════════════════════════════════════════════════════ */}
      <Section id="contact">
        <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at bottom, ${AMBER_GLOW} 0%, transparent 50%)` }} />
        <div className="relative max-w-6xl mx-auto px-4">
          <SectionHeader title="Get Your Free" accent="Estimate" subtitle="Most quotes provided within 24 hours. Emergency calls answered immediately." />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Form */}
            <GlassCard>
              <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
                <div>
                  <label className="text-xs text-white/40 uppercase tracking-wider mb-1 block">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-white/[0.08] bg-white/[0.04] text-white text-sm focus:outline-none focus:border-amber-500/40 transition-colors"
                    placeholder="Your name"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-white/40 uppercase tracking-wider mb-1 block">Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-white/[0.08] bg-white/[0.04] text-white text-sm focus:outline-none focus:border-amber-500/40 transition-colors"
                      placeholder="(206) 555-0000"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-white/40 uppercase tracking-wider mb-1 block">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-white/[0.08] bg-white/[0.04] text-white text-sm focus:outline-none focus:border-amber-500/40 transition-colors"
                      placeholder="you@email.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-white/40 uppercase tracking-wider mb-1 block">Service Needed</label>
                  <select
                    value={formData.service}
                    onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-white/[0.08] bg-white/[0.04] text-white text-sm focus:outline-none focus:border-amber-500/40 transition-colors appearance-none"
                  >
                    <option value="" className="bg-neutral-800">Select a service</option>
                    {SERVICES.map((s) => (
                      <option key={s.title} value={s.title} className="bg-neutral-800">{s.title}</option>
                    ))}
                    <option value="Emergency" className="bg-neutral-800">Emergency Electrical</option>
                    <option value="Other" className="bg-neutral-800">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-white/40 uppercase tracking-wider mb-1 block">Describe Your Electrical Need</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-white/[0.08] bg-white/[0.04] text-white text-sm focus:outline-none focus:border-amber-500/40 transition-colors resize-none"
                    placeholder="Tell us about your project..."
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-4 rounded-xl font-bold text-lg transition-transform hover:scale-[1.02]"
                  style={{ background: AMBER, color: "#000" }}
                >
                  Request Free Estimate
                </button>
                <p className="text-xs text-white/25 text-center">We respond within 2 hours during business hours.</p>
              </form>
            </GlassCard>

            {/* Contact info */}
            <div className="flex flex-col gap-5">
              <GlassCard className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: AMBER_GLOW }}>
                  <Phone size={24} weight="duotone" style={{ color: AMBER }} />
                </div>
                <div>
                  <div className="text-xs text-white/40 uppercase tracking-wider">Call or Text</div>
                  <a href="tel:2065550471" className="text-lg font-bold text-white hover:underline">(206) 555-0471</a>
                </div>
              </GlassCard>

              <GlassCard className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: AMBER_GLOW }}>
                  <Envelope size={24} weight="duotone" style={{ color: AMBER }} />
                </div>
                <div>
                  <div className="text-xs text-white/40 uppercase tracking-wider">Email</div>
                  <a href="mailto:service@cascadeelectric.com" className="text-lg font-bold text-white hover:underline">service@cascadeelectric.com</a>
                </div>
              </GlassCard>

              <GlassCard className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: AMBER_GLOW }}>
                  <MapPin size={24} weight="duotone" style={{ color: AMBER }} />
                </div>
                <div>
                  <div className="text-xs text-white/40 uppercase tracking-wider">Office</div>
                  <a href="https://maps.google.com/?q=8320+Aurora+Ave+N+Seattle+WA+98103" target="_blank" rel="noopener noreferrer" className="text-lg font-bold text-white hover:underline">
                    8320 Aurora Ave N, Seattle, WA 98103
                  </a>
                </div>
              </GlassCard>

              <GlassCard className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: AMBER_GLOW }}>
                  <Clock size={24} weight="duotone" style={{ color: AMBER }} />
                </div>
                <div>
                  <div className="text-xs text-white/40 uppercase tracking-wider">Hours</div>
                  <div className="text-sm text-white/60">Mon–Fri 7am–6pm | Sat 8am–2pm</div>
                  <div className="text-xs mt-1 font-semibold" style={{ color: RED_EMERGENCY }}>24/7 Emergency Service</div>
                </div>
              </GlassCard>

              {/* License callout */}
              <div className="rounded-xl border-2 p-4 text-center" style={{ borderColor: `${AMBER}40`, background: `${AMBER}08` }}>
                <div className="text-xs text-white/40 uppercase tracking-wider mb-1">Licensed in Washington State</div>
                <div className="text-lg font-black" style={{ color: AMBER }}>#CASCAEC789QZ</div>
                <div className="text-xs text-white/30 mt-1">Bonded &amp; Insured — $2M Liability Coverage</div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════════════════════
          16. FOOTER
          ═══════════════════════════════════════════════════════════════ */}
      <footer className="relative border-t border-white/[0.06] py-12" style={{ background: "#111111" }}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Lightning size={24} weight="fill" style={{ color: AMBER }} />
                <span className="text-lg font-bold">Cascade Electric Co.</span>
              </div>
              <p className="text-sm text-white/40 leading-relaxed max-w-md">
                Powering Seattle&apos;s homes and businesses since 2007. Master Electrician Mike Torres and his licensed crew deliver safe, code-compliant electrical work with a lifetime warranty on labor.
              </p>
              <div className="mt-4 text-xs text-white/25">WA License #CASCAEC789QZ | Bonded &amp; Insured</div>
            </div>

            {/* Quick links */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Quick Links</h4>
              <div className="flex flex-col gap-2">
                {["Services", "Pricing", "Projects", "Reviews", "Contact"].map((link) => (
                  <a key={link} href={`#${link.toLowerCase()}`} className="text-sm text-white/40 hover:text-white transition-colors">{link}</a>
                ))}
              </div>
            </div>

            {/* Emergency */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Emergency Line</h4>
              <a href="tel:2065550471" className="text-2xl font-black block mb-2" style={{ color: AMBER }}>(206) 555-0471</a>
              <div className="flex items-center gap-2 text-xs text-white/40">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: "#22c55e" }} />
                  <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: "#22c55e" }} />
                </span>
                Available 24/7 for emergencies
              </div>
            </div>
          </div>

          <div className="border-t border-white/[0.06] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-white/25">
              &copy; {new Date().getFullYear()} Cascade Electric Co. All rights reserved.
            </div>
            <div className="text-xs text-white/25">
              Created by{" "}
              <a href="https://bluejayportfolio.com" target="_blank" rel="noopener noreferrer" className="hover:text-white/50 transition-colors underline">
                bluejayportfolio.com
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
