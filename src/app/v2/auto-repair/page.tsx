"use client";

/* eslint-disable @next/next/no-img-element -- Static marketing showcase uses plain img tags */
/* eslint-disable react-hooks/purity -- Decorative particle values randomized for visual effects */

import { useState, useRef, useCallback, useEffect } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
  useInView,
  AnimatePresence,
} from "framer-motion";
import {
  Wrench,
  GasPump,
  Gear,
  CarSimple,
  Gauge,
  Drop,
  Thermometer,
  Fan,
  Star,
  ShieldCheck,
  Phone,
  MapPin,
  Clock,
  ArrowRight,
  Quotes,
  CaretDown,
  X,
  List,
  CheckCircle,
  CalendarCheck,
  Certificate,
  Tag,
  Trophy,
  Lightning,
  Handshake,
  Envelope,
  Engine,
  Truck,
  Tire,
  CreditCard,
  PlayCircle,
  CarProfile,
  Nut,
  Warning,
  Leaf,
  Question,
  Target,
  UserCircle,
  Buildings,
} from "@phosphor-icons/react";

/* ───────────────────────── SPRING CONFIG ───────────────────────── */
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

/* ───────────────────────── COLORS ───────────────────────── */
const RED = "#dc2626";
const RED_LIGHT = "#ef4444";
const RED_GLOW = "rgba(220, 38, 38, 0.15)";
const SILVER = "#94a3b8";
const DARK = "#111111";
const DARK_CARD = "#1a1a1a";
const DARK_CARD_ALT = "#1f1f1f";

/* ───────────────────────── FLOATING SPARK PARTICLES ───────────────────────── */
function FloatingParticles() {
  const particles = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 8,
    duration: 5 + Math.random() * 5,
    size: 1.5 + Math.random() * 2.5,
    opacity: 0.2 + Math.random() * 0.4,
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
            background: `linear-gradient(135deg, ${RED_LIGHT}, ${SILVER})`,
            willChange: "transform, opacity",
          }}
          animate={{
            y: ["110vh", "-10vh"],
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
      className={`rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)] ${className}`}
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
    typeof window !== "undefined" &&
    window.matchMedia("(pointer: coarse)").matches;

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
function ShimmerBorder({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`relative rounded-2xl p-[1px] overflow-hidden ${className}`}>
      <motion.div
        className="absolute inset-0 rounded-2xl"
        style={{
          background: `conic-gradient(from 0deg, transparent, ${RED}, transparent, ${SILVER}, transparent)`,
          willChange: "transform",
        }}
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      />
      <div className="relative rounded-2xl z-10" style={{ background: DARK_CARD }}>
        {children}
      </div>
    </div>
  );
}

/* ───────────────────────── COUNTER ANIMATION ───────────────────────── */
function AnimatedCounter({
  target,
  suffix = "",
  prefix = "",
  duration = 2,
}: {
  target: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const step = target / (duration * 60);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [isInView, target, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

/* ───────────────────────── GEAR SVG PATTERN ───────────────────────── */
function GearPatternBg() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.04]">
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="gears" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
            <circle cx="30" cy="30" r="15" stroke={SILVER} strokeWidth="1" fill="none" />
            <circle cx="30" cy="30" r="8" stroke={SILVER} strokeWidth="0.5" fill="none" />
            <rect x="28" y="10" width="4" height="8" fill={SILVER} opacity="0.5" />
            <rect x="28" y="42" width="4" height="8" fill={SILVER} opacity="0.5" />
            <rect x="10" y="28" width="8" height="4" fill={SILVER} opacity="0.5" />
            <rect x="42" y="28" width="8" height="4" fill={SILVER} opacity="0.5" />
            <circle cx="90" cy="90" r="22" stroke={SILVER} strokeWidth="1" fill="none" />
            <circle cx="90" cy="90" r="10" stroke={SILVER} strokeWidth="0.5" fill="none" />
            <rect x="88" y="62" width="4" height="10" fill={SILVER} opacity="0.5" />
            <rect x="88" y="108" width="4" height="10" fill={SILVER} opacity="0.5" />
            <rect x="62" y="88" width="10" height="4" fill={SILVER} opacity="0.5" />
            <rect x="108" y="88" width="10" height="4" fill={SILVER} opacity="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#gears)" />
      </svg>
    </div>
  );
}

/* ───────────────────────── SERVICES DATA ───────────────────────── */
const services = [
  { title: "Oil Changes", desc: "Conventional, synthetic blend, and full synthetic with premium filters. Multi-point inspection included.", icon: Drop },
  { title: "Brake Service", desc: "Pads, rotors, calipers, fluid flush, and ABS diagnostics. Your safety comes first.", icon: ShieldCheck },
  { title: "Engine Repair", desc: "From timing belts to head gaskets. Full engine rebuilds with a 2-year warranty on parts and labor.", icon: Engine },
  { title: "Transmission", desc: "Fluid changes, filter replacement, clutch service, and complete rebuilds for automatic and manual.", icon: Gear },
  { title: "Diagnostics", desc: "State-of-the-art computer diagnostics with live data analysis. We find the problem. Fast.", icon: Gauge },
  { title: "A/C Service", desc: "Recharge, compressor repair, condenser replacement, and cabin air filter service.", icon: Thermometer },
  { title: "Tire Service", desc: "Rotation, balancing, flat repair, alignment, and new tire installation from top brands.", icon: Tire },
  { title: "Suspension", desc: "Shocks, struts, control arms, ball joints, and complete steering system service.", icon: CarSimple },
];

/* ───────────────────────── TESTIMONIALS DATA ───────────────────────── */
const testimonials = [
  { name: "Derek P.", text: "Tony saved me $2,400. The dealership quoted me for a full transmission rebuild. Tony found a $180 solenoid that fixed it completely. Honest mechanic. Period.", rating: 5 },
  { name: "Karen L.", text: "My daughter's first car. Tony did the pre-purchase inspection and found issues the seller didn't disclose. Saved us from a bad deal. We went back for her real first car.", rating: 5 },
  { name: "Chen Express Logistics", text: "They've been maintaining our fleet of 12 delivery vans for 6 years. Zero breakdowns on the road. Zero. That's unheard of in this business.", rating: 5 },
  { name: "Ashley W.", text: "Check engine light came on driving to work. They got me in that morning and back on the road by lunch. No appointment needed. Reasonable price.", rating: 5 },
  { name: "Marcus J.", text: "Honest. That's it. That's the review. Honest mechanics exist and Tony is proof.", rating: 5 },
];

/* ───────────────────────── VEHICLE TYPES DATA ───────────────────────── */
const vehicleTypes = [
  { label: "Domestic", brands: "Ford, Chevy, GM, Chrysler", icon: CarSimple },
  { label: "Import", brands: "Toyota, Honda, Nissan, Subaru", icon: CarProfile },
  { label: "European", brands: "BMW, Mercedes, Audi, VW", icon: CarSimple },
  { label: "Trucks & SUVs", brands: "F-150, Silverado, RAM, Tacoma", icon: Truck },
  { label: "Diesel", brands: "Cummins, Duramax, PowerStroke", icon: GasPump },
  { label: "Hybrid / Electric", brands: "Prius, Tesla, Bolt, Ioniq", icon: Lightning },
];

/* ───────────────────────── COMPARISON DATA ───────────────────────── */
const comparisonRows = [
  { label: "Honest Pricing", us: true, them: "Hidden fees" },
  { label: "Free Estimates", us: true, them: "Diagnostic fee" },
  { label: "Same-Day Service", us: true, them: "1-2 week wait" },
  { label: "OEM & Aftermarket Parts", us: true, them: "OEM only (marked up)" },
  { label: "2-Year Warranty", us: true, them: "90 days" },
  { label: "No Appointment Needed", us: true, them: "Appointment required" },
  { label: "Owner On-Site", us: true, them: "Never" },
];

/* ───────────────────────── QUIZ DATA ───────────────────────── */
const quizOptions = [
  { label: "Routine Maintenance", color: "#22c55e", icon: Wrench, answer: "Great! An oil change, tire rotation, or multi-point inspection keeps your car running strong. Book a quick appointment and we'll have you back on the road in under an hour." },
  { label: "Something Sounds Wrong", color: "#f59e0b", icon: Question, answer: "Strange noises usually mean something is wearing out. The sooner we catch it, the cheaper the fix. Call us now before a small rattle turns into a big repair bill." },
  { label: "Brakes Feel Off", color: RED, icon: Warning, answer: "Don't wait on brakes. Spongy pedals, grinding, or pulling means your stopping power is compromised. Come in today for a free brake inspection. Safety first." },
  { label: "Check Engine Light", color: RED, icon: Gauge, answer: "Could be minor (loose gas cap) or major (catalytic converter). Our diagnostic scan pinpoints the exact issue in 30 minutes. $89 and we'll tell you exactly what's wrong." },
];

/* ───────────────────────── SERVICE AREAS ───────────────────────── */
const serviceAreas = [
  "Columbia City", "Beacon Hill", "Rainier Beach", "Georgetown",
  "SoDo", "Capitol Hill", "Central District", "Mount Baker",
];

const AUTO_FAQS = [
  { q: "Do you provide free estimates before starting repairs?", a: "Always. We'll diagnose the issue, explain what we found, and give you a written estimate before touching anything. You approve every repair — we never start work without your go-ahead. No pressure, no surprises." },
  { q: "How long will my repair take?", a: "Most maintenance services (oil change, brakes, tires) are done same-day, typically within 1–3 hours. More involved repairs like engine work or transmission service may take 1–2 days. We'll give you a specific timeline when you drop off and text you when the car is ready." },
  { q: "Do you service European and import vehicles?", a: "Yes — our technicians are trained and certified to work on European, Japanese, Korean, and domestic vehicles. We have manufacturer-level diagnostic software for BMW, Mercedes, Toyota, Honda, Hyundai, Ford, GM, and more. If you drive it, we can service it." },
  { q: "Do your repairs come with a warranty?", a: "Absolutely. All parts and labor come with a 24-month / 24,000-mile warranty, whichever comes first. If something we repaired fails within the warranty period, we fix it at no charge. That's our commitment to quality work." },
  { q: "Can you help if my check engine light is on?", a: "Yes — we have professional-grade OBD-II diagnostic equipment and our own in-house scan tools that go beyond basic code readers. We'll identify the root cause (not just clear the code), explain it in plain English, and recommend the right repair." },
  { q: "Do you offer loaner cars or shuttle service?", a: "We offer a free shuttle service within 5 miles of the shop while your vehicle is being serviced. For longer repairs requiring an overnight stay, ask about our loaner car program — available on a first-come, first-served basis for qualifying repairs." },
];

/* ═══════════════════════════════════════════════════════════════════
   MAIN PAGE COMPONENT
   ═══════════════════════════════════════════════════════════════════ */
export default function V2AutoRepairPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [quizOpen, setQuizOpen] = useState<number | null>(null);

  /* ── Scroll-driven parallax hero ── */
  const heroContainerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroContainerRef,
    offset: ["start start", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.5], [0.85, 0.2]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  const navLinks = [
    { label: "Services", href: "#services" },
    { label: "Pricing", href: "#pricing" },
    { label: "About Tony", href: "#about" },
    { label: "Reviews", href: "#reviews" },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <main
      className="auto-v2 relative min-h-[100dvh] overflow-x-hidden"
      style={{ background: DARK, color: "#e2e8f0" }}
    >
      <FloatingParticles />

      {/* ────────────────────── 0. NAV ────────────────────── */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={spring}
        className="fixed top-0 inset-x-0 z-50 border-b border-white/5"
        style={{ background: "rgba(17,17,17,0.85)", backdropFilter: "blur(16px)" }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between px-5 py-4">
          <a href="#" className="flex items-center gap-2.5">
            <Wrench size={26} style={{ color: RED }} weight="fill" />
            <span className="text-lg font-bold text-white tracking-tight">
              Pacific <span style={{ color: RED }}>Auto Works</span>
            </span>
          </a>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
              >
                {l.label}
              </a>
            ))}
            <a
              href="tel:2068324750"
              className="ml-2 flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-105"
              style={{ background: RED }}
            >
              <Phone size={16} weight="fill" />
              (206) 832-4750
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-white p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <List size={24} />}
          </button>
        </div>

        {/* Mobile drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={spring}
              className="md:hidden overflow-hidden border-t border-white/5"
              style={{ background: DARK_CARD }}
            >
              <div className="flex flex-col gap-1 p-4">
                {navLinks.map((l) => (
                  <a
                    key={l.label}
                    href={l.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition"
                  >
                    {l.label}
                  </a>
                ))}
                <a
                  href="tel:2068324750"
                  className="mt-2 flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-white font-semibold"
                  style={{ background: RED }}
                >
                  <Phone size={18} weight="fill" />
                  Call Now
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* ────────────────────── 1. HERO — SCROLL-DRIVEN PARALLAX REVEAL ────────────────────── */}
      <div ref={heroContainerRef} className="relative h-[160vh]">
        {/* Sticky text layer */}
        <div className="sticky top-0 h-screen flex items-center justify-center z-20">
          <motion.div
            style={{ opacity: textOpacity }}
            className="relative z-30 text-center px-5 max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring, delay: 0.2 }}
            >
              <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6 border border-white/10 bg-white/[0.04] text-sm text-slate-400">
                <ShieldCheck size={16} style={{ color: RED }} weight="fill" />
                ASE Master Technician &middot; Since 2006
              </div>
            </motion.div>

            <motion.h1
              className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-[0.95] tracking-tight mb-6"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring, delay: 0.35 }}
            >
              Honest Auto Repair.
              <br />
              <span style={{ color: RED }}>No Surprises.</span>
            </motion.h1>

            <motion.div
              className="flex flex-wrap justify-center gap-6 md:gap-10 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring, delay: 0.5 }}
            >
              {[
                { n: 20, s: "Years" },
                { n: 5000, s: "Cars Serviced" },
                { n: 0, s: "Shortcuts", label: "Zero" },
              ].map((stat) => (
                <div key={stat.s} className="text-center">
                  <div className="text-2xl md:text-3xl font-black text-white">
                    {stat.label ? stat.label : <AnimatedCounter target={stat.n} suffix="+" />}
                  </div>
                  <div className="text-xs text-slate-500 uppercase tracking-wider mt-0.5">{stat.s}</div>
                </div>
              ))}
            </motion.div>

            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring, delay: 0.65 }}
            >
              <MagneticButton
                className="rounded-full px-8 py-4 text-white font-bold text-lg flex items-center gap-2 shadow-lg shadow-red-900/30 transition-transform"
                style={{ background: RED }}
              >
                <CalendarCheck size={20} weight="fill" />
                Book Appointment
              </MagneticButton>
              <MagneticButton className="rounded-full px-8 py-4 font-bold text-lg flex items-center gap-2 border-2 border-white/20 text-white hover:bg-white/5 transition">
                <Phone size={20} weight="fill" />
                Call Now
              </MagneticButton>
            </motion.div>
          </motion.div>

          {/* Parallax image behind text — reveals as user scrolls */}
          <motion.div
            className="absolute inset-0 z-10"
            style={{ y: imageY }}
          >
            <img
              src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1920&q=85"
              alt="Classic car in dramatic lighting"
              className="w-full h-full object-cover"
            />
          </motion.div>

          {/* Dark overlay that fades as you scroll */}
          <motion.div
            className="absolute inset-0 z-15"
            style={{
              opacity: overlayOpacity,
              background: `linear-gradient(to bottom, ${DARK} 0%, rgba(17,17,17,0.92) 40%, rgba(17,17,17,0.7) 100%)`,
            }}
          />

          {/* Bottom gradient fade */}
          <div className="absolute bottom-0 left-0 right-0 h-40 z-20" style={{ background: `linear-gradient(to bottom, transparent, ${DARK})` }} />
        </div>
      </div>

      {/* ────────────────────── 2. TRUST BAR ────────────────────── */}
      <SectionReveal className="relative py-8 border-y border-white/5" style={{ background: DARK_CARD }}>
        <div className="max-w-6xl mx-auto px-5">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {[
              { icon: Certificate, text: "ASE Master Tech" },
              { icon: Clock, text: "20 Years Experience" },
              { icon: CarSimple, text: "5,000+ Cars Serviced" },
              { icon: ShieldCheck, text: "2-Year Warranty" },
              { icon: Star, text: "4.8 Stars (312 Reviews)" },
            ].map((b) => (
              <div key={b.text} className="flex items-center gap-2 text-sm text-slate-400">
                <b.icon size={18} style={{ color: RED }} weight="fill" />
                <span>{b.text}</span>
              </div>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ────────────────────── 3. SERVICES — RACING FLAG CHECKER ────────────────────── */}
      <SectionReveal id="services" className="relative py-24 md:py-32">
        <GearPatternBg />
        <div className="relative z-10 max-w-7xl mx-auto px-5">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: RED }}>
              What We Do
            </p>
            <h2 className="text-4xl md:text-5xl font-black text-white">
              Full-Service <span style={{ color: RED }}>Auto Repair</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0">
            {services.map((s, i) => {
              // Racing flag checker: alternate dark/slightly lighter
              const isLight = (Math.floor(i / 4) + (i % 4)) % 2 === 0;
              return (
                <motion.div
                  key={s.title}
                  className="p-8 border border-white/5 group hover:border-red-600/30 transition-colors"
                  style={{ background: isLight ? DARK_CARD : DARK_CARD_ALT }}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ ...spring, delay: i * 0.06 }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform"
                    style={{ background: `${RED}18` }}
                  >
                    <s.icon size={24} style={{ color: RED }} weight="duotone" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{s.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{s.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </SectionReveal>

      {/* ────────────────────── 4. TRANSPARENT PRICING ────────────────────── */}
      <SectionReveal id="pricing" className="relative py-24 md:py-32" style={{ background: DARK_CARD }}>
        <GearPatternBg />
        <div className="relative z-10 max-w-5xl mx-auto px-5">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: RED }}>
              No Hidden Fees
            </p>
            <h2 className="text-4xl md:text-5xl font-black text-white">
              Transparent <span style={{ color: RED }}>Pricing</span>
            </h2>
            <p className="mt-4 text-slate-400 max-w-xl mx-auto">
              We show you the price BEFORE we start. No surprises on the bill. Ever.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "Oil Change", price: "$39.99", note: "Synthetic blend, filter, multi-point inspection", icon: Drop },
              { title: "Brake Service", price: "$149", note: "Pads, rotor inspection, fluid check, road test", icon: ShieldCheck },
              { title: "Full Diagnostic", price: "$89", note: "Computer scan, live data analysis, written report", icon: Gauge },
            ].map((p, i) => (
              <ShimmerBorder key={p.title}>
                <div className="p-8 text-center">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
                    style={{ background: `${RED}18` }}
                  >
                    <p.icon size={28} style={{ color: RED }} weight="fill" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">{p.title}</h3>
                  <div className="text-4xl font-black mb-2" style={{ color: RED }}>
                    {p.price}
                  </div>
                  <p className="text-sm text-slate-500">{p.note}</p>
                  <p className="text-xs text-slate-600 mt-3 uppercase tracking-wider">Starting from</p>
                </div>
              </ShimmerBorder>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ────────────────────── 5. HONEST MECHANIC GUARANTEE ────────────────────── */}
      <SectionReveal className="relative py-24 md:py-32">
        <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at center, ${RED_GLOW}, transparent 70%)` }} />
        <GearPatternBg />
        <div className="relative z-10 max-w-5xl mx-auto px-5">
          <div className="text-center mb-14">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6" style={{ background: `${RED}18`, border: `2px solid ${RED}33` }}>
              <Handshake size={40} style={{ color: RED }} weight="fill" />
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white">
              The Honest Mechanic <span style={{ color: RED }}>Guarantee</span>
            </h2>
            <p className="mt-4 text-slate-400 max-w-xl mx-auto">
              Trust is earned. Here are four promises we make to every customer who walks through our door.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              { title: "No Unnecessary Repairs", desc: "If it doesn't need fixing, we won't fix it. Simple as that. We'd rather earn your trust than your money.", icon: Target },
              { title: "Free Estimates", desc: "Walk in, tell us what's wrong, and we'll give you an honest estimate. No obligation. No pressure. No games.", icon: Tag },
              { title: "Parts & Labor Warranty", desc: "Every repair comes with a 2-year / 24,000-mile warranty. If something isn't right, we make it right. Free.", icon: ShieldCheck },
              { title: "We Show You the Problem", desc: "Before we touch a wrench, we show you the issue. Photos. Video. In person. You see what we see.", icon: CheckCircle },
            ].map((g, i) => (
              <GlassCard key={g.title} className="p-8">
                <motion.div
                  initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ ...spring, delay: i * 0.1 }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: `${RED}18` }}
                    >
                      <g.icon size={24} style={{ color: RED }} weight="fill" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white mb-2">{g.title}</h3>
                      <p className="text-sm text-slate-400 leading-relaxed">{g.desc}</p>
                    </div>
                  </div>
                </motion.div>
              </GlassCard>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ────────────────────── 6. MEET TONY ────────────────────── */}
      <SectionReveal id="about" className="relative py-24 md:py-32" style={{ background: DARK_CARD }}>
        <GearPatternBg />
        <div className="relative z-10 max-w-6xl mx-auto px-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Photo side */}
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden border border-white/10">
                <img
                  src="https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&q=80"
                  alt="Tony Reeves — ASE Master Technician"
                  className="w-full h-[480px] object-cover object-top"
                />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(17,17,17,0.8) 0%, transparent 50%)" }} />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="flex flex-wrap gap-2">
                    {["ASE Master Tech", "UTI Graduate", "20 Years", "5,000+ Cars"].map((badge) => (
                      <span
                        key={badge}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border border-white/10 bg-black/60 text-white"
                      >
                        <Certificate size={12} style={{ color: RED }} weight="fill" />
                        {badge}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              {/* Chrome accent line */}
              <div className="absolute -bottom-3 left-6 right-6 h-1 rounded-full" style={{ background: `linear-gradient(to right, ${RED}, ${SILVER}, ${RED})` }} />
            </div>

            {/* Text side */}
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: RED }}>
                Your Mechanic
              </p>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
                Meet <span style={{ color: RED }}>Tony Reeves</span>
              </h2>
              <div className="space-y-4 text-slate-400 leading-relaxed">
                <p>
                  Started turning wrenches at 15. ASE Master Technician by 25. Tony graduated from Universal Technical Institute and spent a decade at dealerships before opening Pacific Auto Works in 2006.
                </p>
                <p>
                  Twenty years and over five thousand cars later, the philosophy hasn't changed: tell the customer the truth, charge a fair price, and stand behind every repair. That's it.
                </p>
                <p>
                  Tony is on-site every single day. When you bring your car in, you talk to the person who's going to work on it. No service advisors. No middlemen. No runaround.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 mt-8">
                {["ASE Master Certified", "UTI Graduate", "Washington Licensed", "EPA Certified"].map((c) => (
                  <span
                    key={c}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border border-white/10 bg-white/[0.04] text-slate-300"
                  >
                    <CheckCircle size={16} style={{ color: RED }} weight="fill" />
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* ────────────────────── 7. WHAT WE WORK ON ────────────────────── */}
      <SectionReveal className="relative py-24 md:py-32">
        <GearPatternBg />
        <div className="relative z-10 max-w-6xl mx-auto px-5">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: RED }}>
              All Makes & Models
            </p>
            <h2 className="text-4xl md:text-5xl font-black text-white">
              What We <span style={{ color: RED }}>Work On</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
            {vehicleTypes.map((v, i) => (
              <motion.div
                key={v.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ ...spring, delay: i * 0.07 }}
              >
                <GlassCard className="p-6 text-center group hover:border-red-600/30 transition-colors">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform"
                    style={{ background: `${RED}12` }}
                  >
                    <v.icon size={28} style={{ color: SILVER }} weight="duotone" />
                  </div>
                  <h3 className="text-white font-bold text-lg mb-1">{v.label}</h3>
                  <p className="text-xs text-slate-500">{v.brands}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ────────────────────── 8. QUIZ — WHAT DOES YOUR CAR NEED? ────────────────────── */}
      <SectionReveal className="relative py-24 md:py-32" style={{ background: DARK_CARD }}>
        <GearPatternBg />
        <div className="relative z-10 max-w-4xl mx-auto px-5">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: RED }}>
              Quick Check
            </p>
            <h2 className="text-4xl md:text-5xl font-black text-white">
              What Does Your Car <span style={{ color: RED }}>Need?</span>
            </h2>
            <p className="mt-4 text-slate-400">Select the option that best describes your situation.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {quizOptions.map((q, i) => (
              <div key={q.label}>
                <button
                  onClick={() => setQuizOpen(quizOpen === i ? null : i)}
                  className="w-full text-left cursor-pointer"
                >
                  <GlassCard className={`p-6 transition-all ${quizOpen === i ? "border-white/20" : "hover:border-white/15"}`}>
                    <div className="flex items-center gap-4">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: `${q.color}18` }}
                      >
                        <q.icon size={24} style={{ color: q.color }} weight="fill" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white">{q.label}</h3>
                        <div
                          className="w-3 h-3 rounded-full mt-1"
                          style={{ background: q.color }}
                        />
                      </div>
                      <motion.div
                        className="ml-auto"
                        animate={{ rotate: quizOpen === i ? 180 : 0 }}
                        transition={spring}
                      >
                        <CaretDown size={18} className="text-slate-500" />
                      </motion.div>
                    </div>
                  </GlassCard>
                </button>
                <AnimatePresence>
                  {quizOpen === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={spring}
                      className="overflow-hidden"
                    >
                      <div className="mt-3 p-5 rounded-xl border border-white/10 bg-white/[0.02]">
                        <p className="text-sm text-slate-400 leading-relaxed mb-4">{q.answer}</p>
                        <a
                          href="tel:2068324750"
                          className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white"
                          style={{ background: RED }}
                        >
                          <Phone size={16} weight="fill" />
                          Call (206) 832-4750
                        </a>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ────────────────────── 9. COMPETITOR COMPARISON ────────────────────── */}
      <SectionReveal className="relative py-24 md:py-32">
        <GearPatternBg />
        <div className="relative z-10 max-w-4xl mx-auto px-5">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: RED }}>
              See The Difference
            </p>
            <h2 className="text-4xl md:text-5xl font-black text-white">
              Pacific Auto Works <span style={{ color: RED }}>vs Dealership</span>
            </h2>
          </div>

          <GlassCard className="overflow-hidden">
            {/* Header row */}
            <div className="grid grid-cols-3 p-5 border-b border-white/10 text-sm font-bold">
              <div className="text-slate-400">Feature</div>
              <div className="text-center" style={{ color: RED }}>Pacific Auto Works</div>
              <div className="text-center text-slate-500">Dealership</div>
            </div>
            {comparisonRows.map((r, i) => (
              <motion.div
                key={r.label}
                className="grid grid-cols-3 p-5 border-b border-white/5 items-center"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ ...spring, delay: i * 0.06 }}
              >
                <div className="text-sm text-white font-medium">{r.label}</div>
                <div className="text-center">
                  <CheckCircle size={22} style={{ color: "#22c55e" }} weight="fill" />
                </div>
                <div className="text-center text-sm text-slate-500">{r.them}</div>
              </motion.div>
            ))}
          </GlassCard>
        </div>
      </SectionReveal>

      {/* ────────────────────── 10. TESTIMONIALS — SPLIT-SCREEN ────────────────────── */}
      <SectionReveal id="reviews" className="relative py-24 md:py-32" style={{ background: DARK_CARD }}>
        <GearPatternBg />
        <div className="relative z-10 max-w-6xl mx-auto px-5">
          <div className="text-center mb-6">
            <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: RED }}>
              Real Reviews
            </p>
            <h2 className="text-4xl md:text-5xl font-black text-white">
              What Our Customers <span style={{ color: RED }}>Say</span>
            </h2>
          </div>

          {/* Google Reviews header */}
          <div className="flex items-center justify-center gap-3 mb-14">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={20} style={{ color: "#facc15" }} weight="fill" />
              ))}
            </div>
            <span className="text-white font-bold">4.8</span>
            <span className="text-slate-500 text-sm">(312 reviews on Google)</span>
          </div>

          <div className="space-y-6">
            {testimonials.map((t, i) => {
              const isEven = i % 2 === 0;
              return (
                <motion.div
                  key={t.name}
                  className={`flex flex-col ${isEven ? "md:flex-row" : "md:flex-row-reverse"} gap-0 overflow-hidden rounded-2xl border border-white/5`}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ ...spring, delay: i * 0.08 }}
                >
                  {/* Icon half */}
                  <div
                    className="md:w-2/5 flex items-center justify-center p-10 md:p-12"
                    style={{ background: `linear-gradient(135deg, ${DARK}, ${DARK_CARD_ALT})` }}
                  >
                    <div className="text-center">
                      <UserCircle size={64} style={{ color: SILVER }} weight="duotone" className="mx-auto mb-3 opacity-60" />
                      <p className="text-white font-bold text-lg">{t.name}</p>
                      <div className="flex justify-center gap-0.5 mt-2">
                        {[...Array(t.rating)].map((_, s) => (
                          <Star key={s} size={14} style={{ color: "#facc15" }} weight="fill" />
                        ))}
                      </div>
                      <div className="flex items-center justify-center gap-1 mt-2">
                        <CheckCircle size={14} style={{ color: "#22c55e" }} weight="fill" />
                        <span className="text-xs text-slate-500">Verified Customer</span>
                      </div>
                    </div>
                  </div>

                  {/* Quote half */}
                  <div className="md:w-3/5 flex items-center p-8 md:p-12" style={{ background: DARK_CARD }}>
                    <div>
                      <Quotes size={32} style={{ color: RED }} weight="fill" className="mb-4 opacity-40" />
                      <p className="text-slate-300 leading-relaxed text-base md:text-lg">
                        {t.text}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </SectionReveal>

      {/* ────────────────────── 11. FINANCING ────────────────────── */}
      <SectionReveal className="relative py-20 md:py-24">
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${RED}15, transparent 60%)` }} />
        <GearPatternBg />
        <div className="relative z-10 max-w-4xl mx-auto px-5 text-center">
          <ShimmerBorder>
            <div className="p-10 md:p-14">
              <CreditCard size={40} style={{ color: RED }} weight="fill" className="mx-auto mb-5" />
              <h2 className="text-3xl md:text-4xl font-black text-white mb-3">
                Big Repair? <span style={{ color: RED }}>We've Got You.</span>
              </h2>
              <p className="text-lg text-slate-400 mb-6">
                0% financing for 12 months on repairs over $500. No credit check hassle. Get back on the road now, pay over time.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <MagneticButton
                  className="rounded-full px-8 py-3.5 text-white font-bold flex items-center gap-2"
                  style={{ background: RED }}
                >
                  <ArrowRight size={18} weight="bold" />
                  Apply for Financing
                </MagneticButton>
                <a href="tel:2068324750" className="text-sm text-slate-400 hover:text-white transition">
                  Or call to discuss options
                </a>
              </div>
            </div>
          </ShimmerBorder>
        </div>
      </SectionReveal>

      {/* ────────────────────── 12. VIDEO PLACEHOLDER ────────────────────── */}
      <SectionReveal className="relative py-24 md:py-32" style={{ background: DARK_CARD }}>
        <div className="max-w-5xl mx-auto px-5">
          <div className="relative rounded-2xl overflow-hidden border border-white/10 group cursor-pointer">
            <img
              src="https://images.unsplash.com/photo-1625047509248-ec889cbff17f?w=1200&q=80"
              alt="Pacific Auto Works shop floor"
              className="w-full h-[320px] md:h-[480px] object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <div className="text-center">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform"
                  style={{ background: `${RED}cc` }}
                >
                  <PlayCircle size={44} className="text-white" weight="fill" />
                </div>
                <p className="text-white font-bold text-xl">See Our Shop</p>
                <p className="text-slate-400 text-sm mt-1">Take a virtual tour of Pacific Auto Works</p>
              </div>
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* ────────────────────── 13. SERVICE AREAS ────────────────────── */}
      <SectionReveal className="relative py-24 md:py-32">
        <GearPatternBg />
        <div className="relative z-10 max-w-5xl mx-auto px-5">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: RED }}>
              Serving Seattle
            </p>
            <h2 className="text-4xl md:text-5xl font-black text-white">
              Service <span style={{ color: RED }}>Areas</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {serviceAreas.map((area, i) => (
              <motion.div
                key={area}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ ...spring, delay: i * 0.05 }}
              >
                <GlassCard className="p-5 text-center group hover:border-red-600/30 transition">
                  <MapPin size={20} style={{ color: RED }} weight="fill" className="mx-auto mb-2" />
                  <p className="text-white font-medium text-sm">{area}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <p className="text-slate-500 text-sm">
              Located at 3815 Rainier Ave S, Seattle, WA 98118 &middot; Serving a 15-mile radius
            </p>
          </div>
        </div>
      </SectionReveal>

      {/* ────────────────────── 14. FAQ ────────────────────── */}
      <SectionReveal className="relative py-16 md:py-24" style={{ background: DARK }}>
        <div className="relative z-10 mx-auto max-w-3xl px-5">
          <div className="text-center mb-10">
            <p className="text-sm uppercase tracking-[0.2em] mb-3 font-semibold" style={{ color: RED }}>Common Questions</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white">Frequently Asked</h2>
            <p className="mt-4 text-slate-400 text-lg">Straight answers about our shop, pricing, and what to expect.</p>
          </div>
          <motion.div className="space-y-3" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {AUTO_FAQS.map((faq, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between p-5 text-left cursor-pointer"
                  >
                    <span className="text-base font-semibold text-white pr-4">{faq.q}</span>
                    <motion.div animate={{ rotate: openFaq === i ? 180 : 0 }} transition={spring}>
                      <CaretDown size={20} style={{ color: RED }} className="shrink-0" />
                    </motion.div>
                  </button>
                  <AnimatePresence initial={false}>
                    {openFaq === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={spring}
                        className="overflow-hidden"
                      >
                        <p className="px-5 pb-5 text-slate-400 leading-relaxed">{faq.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
          <p className="text-center mt-8 text-slate-400">Still have questions? <a href="tel:2068324750" className="font-semibold" style={{ color: RED }}>Call (206) 832-4750</a> — we&apos;re happy to help.</p>
        </div>
      </SectionReveal>

      {/* ────────────────────── 15. CONTACT ────────────────────── */}
      <SectionReveal id="contact" className="relative py-24 md:py-32" style={{ background: DARK_CARD }}>
        <GearPatternBg />
        <div className="relative z-10 max-w-6xl mx-auto px-5">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: RED }}>
              Get In Touch
            </p>
            <h2 className="text-4xl md:text-5xl font-black text-white">
              Book Your <span style={{ color: RED }}>Appointment</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Contact form */}
            <GlassCard className="p-8">
              <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="text-xs text-slate-500 uppercase tracking-wider mb-1.5 block">Name</label>
                    <input
                      type="text"
                      placeholder="Your name"
                      className="w-full rounded-xl px-4 py-3 bg-white/[0.04] border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-red-600/50 transition"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 uppercase tracking-wider mb-1.5 block">Phone</label>
                    <input
                      type="tel"
                      placeholder="(206) 555-0000"
                      className="w-full rounded-xl px-4 py-3 bg-white/[0.04] border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-red-600/50 transition"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-500 uppercase tracking-wider mb-1.5 block">Vehicle</label>
                  <input
                    type="text"
                    placeholder="Year, Make, Model (e.g. 2019 Toyota Camry)"
                    className="w-full rounded-xl px-4 py-3 bg-white/[0.04] border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-red-600/50 transition"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 uppercase tracking-wider mb-1.5 block">What do you need?</label>
                  <textarea
                    rows={4}
                    placeholder="Describe the issue or service needed..."
                    className="w-full rounded-xl px-4 py-3 bg-white/[0.04] border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-red-600/50 transition resize-none"
                  />
                </div>
                <MagneticButton
                  className="w-full rounded-xl py-3.5 text-white font-bold flex items-center justify-center gap-2"
                  style={{ background: RED }}
                >
                  <CalendarCheck size={20} weight="fill" />
                  Request Appointment
                </MagneticButton>
              </form>
            </GlassCard>

            {/* Contact details */}
            <div className="space-y-6">
              {/* Convenience note */}
              <GlassCard className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${RED}18` }}>
                    <Clock size={24} style={{ color: RED }} weight="fill" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold mb-1">Early Drop-Off, Late Pick-Up</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      Drop off before 8am, pick up after 5pm. We work around your schedule so car trouble doesn't mean missing work.
                    </p>
                  </div>
                </div>
              </GlassCard>

              {/* Contact info cards */}
              {[
                {
                  icon: Phone,
                  label: "Call Us",
                  value: "(206) 832-4750",
                  href: "tel:2068324750",
                  sub: "Mon-Fri 7am-6pm, Sat 8am-4pm",
                },
                {
                  icon: MapPin,
                  label: "Visit Us",
                  value: "3815 Rainier Ave S, Seattle, WA 98118",
                  href: "https://maps.google.com/?q=3815+Rainier+Ave+S+Seattle+WA+98118",
                  sub: "Corner of Rainier & S Edmunds",
                },
                {
                  icon: Envelope,
                  label: "Email Us",
                  value: "service@pacificautoworks.com",
                  href: "mailto:service@pacificautoworks.com",
                  sub: "We respond within 2 hours",
                },
              ].map((c) => (
                <a
                  key={c.label}
                  href={c.href}
                  target={c.href.startsWith("http") ? "_blank" : undefined}
                  rel={c.href.startsWith("http") ? "noopener noreferrer" : undefined}
                >
                  <GlassCard className="p-6 hover:border-red-600/30 transition group">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform" style={{ background: `${RED}18` }}>
                        <c.icon size={24} style={{ color: RED }} weight="fill" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-0.5">{c.label}</p>
                        <p className="text-white font-bold">{c.value}</p>
                        <p className="text-xs text-slate-500 mt-1">{c.sub}</p>
                      </div>
                    </div>
                  </GlassCard>
                </a>
              ))}
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* ────────────────────── 15. FOOTER ────────────────────── */}
      <footer className="relative py-16 border-t border-white/5" style={{ background: DARK }}>
        <GearPatternBg />
        <div className="relative z-10 max-w-6xl mx-auto px-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Wrench size={22} style={{ color: RED }} weight="fill" />
                <span className="text-lg font-bold text-white">
                  Pacific <span style={{ color: RED }}>Auto Works</span>
                </span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed mb-4">
                Honest auto repair in Seattle's Rainier Valley. ASE Master Technician on-site every day. No surprises.
              </p>
              {/* Trust badges */}
              <div className="flex items-center gap-3">
                {["ASE Certified", "BBB A+"].map((badge) => (
                  <span
                    key={badge}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border border-white/10 bg-white/[0.03] text-slate-400"
                  >
                    <Trophy size={12} style={{ color: RED }} weight="fill" />
                    {badge}
                  </span>
                ))}
              </div>
            </div>

            {/* Quick links */}
            <div>
              <h4 className="text-white font-bold mb-4">Services</h4>
              <ul className="space-y-2.5">
                {["Oil Changes", "Brake Service", "Engine Repair", "Transmission", "Diagnostics", "A/C Service"].map((s) => (
                  <li key={s}>
                    <a href="#services" className="text-sm text-slate-500 hover:text-white transition">
                      {s}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-white font-bold mb-4">Contact</h4>
              <ul className="space-y-3">
                <li>
                  <a href="tel:2068324750" className="flex items-center gap-2 text-sm text-slate-500 hover:text-white transition">
                    <Phone size={16} style={{ color: RED }} weight="fill" />
                    (206) 832-4750
                  </a>
                </li>
                <li>
                  <a href="mailto:service@pacificautoworks.com" className="flex items-center gap-2 text-sm text-slate-500 hover:text-white transition">
                    <Envelope size={16} style={{ color: RED }} weight="fill" />
                    service@pacificautoworks.com
                  </a>
                </li>
                <li>
                  <a
                    href="https://maps.google.com/?q=3815+Rainier+Ave+S+Seattle+WA+98118"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-2 text-sm text-slate-500 hover:text-white transition"
                  >
                    <MapPin size={16} style={{ color: RED }} weight="fill" className="shrink-0 mt-0.5" />
                    3815 Rainier Ave S, Seattle, WA 98118
                  </a>
                </li>
                <li className="flex items-center gap-2 text-sm text-slate-500">
                  <Clock size={16} style={{ color: RED }} weight="fill" />
                  Mon-Fri 7am-6pm, Sat 8am-4pm
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-600">
              &copy; {new Date().getFullYear()} Pacific Auto Works. All rights reserved.
            </p>
            <p className="text-xs text-slate-600 flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-sky-500"><path d="M24.3 4.2c-1.5-.4-3.2.1-4.5 1.1-1-.7-2.3-1-3.5-.8-2.4.4-4.2 2.5-4.2 4.9v.6c-3.2.8-6 2.8-7.8 5.6-.3.5-.1 1.1.4 1.4.5.3 1.1.1 1.4-.4 1.5-2.3 3.7-4 6.3-4.7.5-.1 1-.1 1.5 0 .8.2 1.4.8 1.7 1.5.3.8.2 1.6-.2 2.3l-2.8 4.3c-.6.9-.4 2.1.4 2.8l2.5 2.1c.4.3.8.5 1.3.5h5.2c.5 0 1-.2 1.3-.5l1.2-1c.6-.5.8-1.3.6-2l-1-3.2c-.2-.5 0-1.1.4-1.4l3.8-2.5c1.3-.9 2.1-2.3 2.1-3.9V9.6c0-2.5-1.7-4.7-4.1-5.3v-.1z" fill="currentColor"/></svg>Created by{" "}
              <a
                href="https://bluejayportfolio.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-slate-400 transition"
                style={{ color: SILVER }}
              >
                bluejayportfolio.com
              </a>
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
