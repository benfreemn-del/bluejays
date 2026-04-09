"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  motion,
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
  Speedometer,
  Handshake,
  Images,
  Envelope,
} from "@phosphor-icons/react";

/* ───────────────────────── SPRING CONFIG ───────────────────────── */
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
const RED = "#dc2626";
const RED_LIGHT = "#ef4444";
const RED_GLOW = "rgba(220, 38, 38, 0.15)";
const SILVER = "#94a3b8";
const DARK = "#111111";
const DARK_CARD = "#1a1a1a";

/* ───────────────────────── FLOATING SPARK PARTICLES ───────────────────────── */
function FloatingParticles() {
  const particles = Array.from({ length: 20 }, (_, i) => ({
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

/* ───────────────────────── ANIMATED PISTON SVG ───────────────────────── */
function AnimatedPiston() {
  return (
    <div className="relative flex items-center justify-center">
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle, ${RED_GLOW} 0%, transparent 70%)`,
          filter: "blur(30px)",
          willChange: "transform",
        }}
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      <svg
        viewBox="0 0 200 260"
        className="relative z-10 w-48 h-60 md:w-64 md:h-80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Cylinder walls */}
        <motion.path
          d="M60 30 L60 180 M140 30 L140 180"
          stroke={SILVER}
          strokeWidth="3"
          strokeLinecap="round"
          opacity={0.4}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />
        {/* Cylinder head (top) */}
        <motion.path
          d="M55 30 L145 30"
          stroke={SILVER}
          strokeWidth="4"
          strokeLinecap="round"
          opacity={0.5}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, ease: "easeInOut" }}
        />
        {/* Piston head — animated up/down */}
        <motion.g
          animate={{ y: [0, 60, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Piston crown */}
          <rect x="65" y="70" width="70" height="20" rx="3" stroke={RED} strokeWidth="2.5" fill={`${RED}22`} />
          {/* Piston rings */}
          <line x1="68" y1="78" x2="132" y2="78" stroke={RED} strokeWidth="1" opacity={0.6} />
          <line x1="68" y1="84" x2="132" y2="84" stroke={RED} strokeWidth="1" opacity={0.4} />
          {/* Connecting rod */}
          <line x1="100" y1="90" x2="100" y2="160" stroke={SILVER} strokeWidth="3" strokeLinecap="round" />
          {/* Wrist pin */}
          <circle cx="100" cy="90" r="4" fill={RED} stroke={RED} strokeWidth="1" />
        </motion.g>
        {/* Crankshaft circle — rotates */}
        <motion.g
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: "100px 210px" }}
        >
          <circle cx="100" cy="210" r="25" stroke={SILVER} strokeWidth="2" fill="none" opacity={0.3} />
          <line x1="100" y1="210" x2="100" y2="185" stroke={RED} strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="100" cy="185" r="4" fill={RED} />
        </motion.g>
        {/* Crankshaft center */}
        <circle cx="100" cy="210" r="6" fill={`${RED}44`} stroke={RED} strokeWidth="1.5" />
        {/* Spark/combustion effect at top */}
        <motion.circle
          cx="100"
          cy="45"
          r="8"
          fill={RED}
          animate={{ opacity: [0, 0.8, 0], scale: [0.5, 1.5, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.1 }}
        />
        <motion.circle
          cx="85"
          cy="40"
          r="3"
          fill={RED_LIGHT}
          animate={{ opacity: [0, 0.6, 0], scale: [0.5, 1.2, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
        />
        <motion.circle
          cx="115"
          cy="42"
          r="3"
          fill={RED_LIGHT}
          animate={{ opacity: [0, 0.6, 0], scale: [0.5, 1.2, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
        />
      </svg>
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

/* ───────────────────────── ACCORDION ITEM ───────────────────────── */
function AccordionItem({
  title,
  answer,
  isOpen,
  onToggle,
}: {
  title: string;
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
        <span className="text-lg font-semibold text-white pr-4">{title}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={spring}>
          <CaretDown size={20} className="text-slate-400" />
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
    <span ref={ref}>
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

/* ───────────────────────── GEAR / ENGINE SVG PATTERNS ───────────────────────── */
function GearPatternBg() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.04]">
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="gears" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
            {/* Small gear */}
            <circle cx="30" cy="30" r="15" stroke={SILVER} strokeWidth="1" fill="none" />
            <circle cx="30" cy="30" r="8" stroke={SILVER} strokeWidth="0.5" fill="none" />
            {/* Teeth */}
            <rect x="28" y="10" width="4" height="8" fill={SILVER} opacity="0.5" />
            <rect x="28" y="42" width="4" height="8" fill={SILVER} opacity="0.5" />
            <rect x="10" y="28" width="8" height="4" fill={SILVER} opacity="0.5" />
            <rect x="42" y="28" width="8" height="4" fill={SILVER} opacity="0.5" />
            {/* Large gear */}
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
  {
    title: "Engine Diagnostics",
    description:
      "State-of-the-art computer diagnostics to pinpoint engine issues fast. We read trouble codes, run live data analysis, and provide clear explanations before any work begins.",
    icon: Gauge,
  },
  {
    title: "Brake Service",
    description:
      "Complete brake inspections, pad and rotor replacements, brake fluid flushes, and ABS diagnostics. Your safety on the road is our top priority.",
    icon: ShieldCheck,
  },
  {
    title: "Oil Change & Lube",
    description:
      "Conventional, synthetic blend, and full synthetic oil changes with premium filters. We also top off all fluids and perform a complimentary multi-point inspection.",
    icon: Drop,
  },
  {
    title: "AC & Heating",
    description:
      "Full climate control service including refrigerant recharge, compressor repair, heater core service, and cabin air filter replacement to keep you comfortable year-round.",
    icon: Thermometer,
  },
  {
    title: "Transmission",
    description:
      "Automatic and manual transmission services including fluid changes, filter replacements, and complete rebuilds. We handle both domestic and import vehicles.",
    icon: Gear,
  },
  {
    title: "Tire Service",
    description:
      "Tire rotations, balancing, flat repairs, and new tire installations from top brands. We offer competitive pricing and a smooth, safe ride guarantee.",
    icon: Fan,
  },
];

/* ───────────────────────── TESTIMONIALS ───────────────────────── */
const testimonials = [
  {
    name: "Mike R.",
    text: "Took my truck in for a strange noise and they diagnosed it in under an hour. Fair price, honest assessment, and the work was done the same day. This is my shop for life.",
    rating: 5,
  },
  {
    name: "Jennifer S.",
    text: "Finally found a mechanic I can trust. They showed me exactly what was wrong, explained my options, and never pushed unnecessary repairs. Highly recommend Pacific Auto Works.",
    rating: 5,
  },
  {
    name: "Carlos M.",
    text: "I have been bringing all three of my family vehicles here for two years. The team is professional, the waiting area is clean, and they always finish on time. Five stars every time.",
    rating: 5,
  },
];

/* ───────────────────────── SPECIALTIES ───────────────────────── */
const specialties = [
  { name: "Ford / GM / Chrysler", icon: CarSimple },
  { name: "Toyota / Honda / Nissan", icon: CarSimple },
  { name: "BMW / Mercedes / Audi", icon: CarSimple },
  { name: "Diesel Trucks", icon: CarSimple },
  { name: "Hybrid Vehicles", icon: Lightning },
  { name: "Fleet Vehicles", icon: CarSimple },
];

/* ───────────────────────── FAQ DATA ───────────────────────── */
const faqs = [
  {
    question: "How long does a typical service take?",
    answer:
      "Most routine services like oil changes and brake inspections take 30 to 90 minutes. More complex repairs like transmission work may take 1 to 3 days. We always provide a time estimate before we begin.",
  },
  {
    question: "Do you offer a warranty on repairs?",
    answer:
      "Yes. All parts and labor come with a 24-month / 24,000-mile warranty. We stand behind every repair we make and will make it right if anything is not up to standard.",
  },
  {
    question: "Can I wait while my car is being serviced?",
    answer:
      "Absolutely. We have a comfortable waiting area with Wi-Fi, coffee, and a TV. For longer repairs, we offer a complimentary shuttle service within a 10-mile radius.",
  },
  {
    question: "Do I need an appointment?",
    answer:
      "Walk-ins are welcome for quick services like oil changes. For diagnostics and major repairs, we recommend scheduling an appointment so we can dedicate a bay and technician to your vehicle.",
  },
];

/* ───────────────────────── GALLERY DATA ───────────────────────── */
const galleryImages = [
  {
    src: "https://images.unsplash.com/photo-1625047509248-ec889cbff17f?w=600&q=80",
    alt: "Clean modern auto repair bay with lifts",
  },
  {
    src: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=600&q=80",
    alt: "Mechanic working under the hood",
  },
  {
    src: "https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?w=600&q=80",
    alt: "Professional diagnostic equipment",
  },
  {
    src: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600&q=80",
    alt: "Sports car in service bay",
  },
  {
    src: "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=600&q=80",
    alt: "Technician inspecting brakes",
  },
  {
    src: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&q=80",
    alt: "Finished vehicle ready for pickup",
  },
];

/* ───────────────────────── COUPONS DATA ───────────────────────── */
const coupons = [
  {
    title: "First Visit Special",
    description: "Free multi-point inspection with any service over $50",
    code: "NEWCUSTOMER",
    icon: Tag,
  },
  {
    title: "Oil Change Deal",
    description: "Full synthetic oil change for $49.99 (reg. $79.99)",
    code: "OIL50",
    icon: Drop,
  },
  {
    title: "Brake Service",
    description: "15% off any brake pad and rotor replacement",
    code: "BRAKES15",
    icon: ShieldCheck,
  },
];

/* ═══════════════════════════════════════════════════════════════════
   MAIN PAGE COMPONENT
   ═══════════════════════════════════════════════════════════════════ */
export default function V2AutoRepairPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <main
      className="relative min-h-[100dvh] overflow-x-hidden"
      style={{ background: DARK, color: "#e2e8f0" }}
    >
      <FloatingParticles />

      {/* ─── 1. NAV ─── */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={spring}
        className="fixed top-0 left-0 right-0 z-50"
      >
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-4">
          <GlassCard className="flex items-center justify-between px-4 md:px-6 py-3">
            <div className="flex items-center gap-2">
              <Wrench size={24} weight="duotone" style={{ color: RED }} />
              <span className="text-lg font-bold tracking-tight text-white">
                Pacific Auto Works
              </span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
              <a href="#services" className="hover:text-white transition-colors">
                Services
              </a>
              <a href="#about" className="hover:text-white transition-colors">
                About
              </a>
              <a href="#reviews" className="hover:text-white transition-colors">
                Reviews
              </a>
              <a href="#contact" className="hover:text-white transition-colors">
                Contact
              </a>
            </div>
            <div className="flex items-center gap-3">
              <MagneticButton
                className="px-4 md:px-5 py-2 rounded-full text-sm font-semibold text-white transition-colors cursor-pointer"
                style={{ background: RED } as React.CSSProperties}
              >
                Book Service
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
                    { label: "Reviews", href: "#reviews" },
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

      {/* ─── 2. HERO ─── */}
      <section className="relative min-h-[100dvh] flex items-center pt-24 z-10">
        {/* Gear pattern background */}
        <GearPatternBg />
        {/* Dark garage gradient overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at 30% 50%, rgba(220,38,38,0.08) 0%, transparent 60%),
                          radial-gradient(ellipse at 70% 80%, rgba(148,163,184,0.05) 0%, transparent 50%)`,
          }}
        />
        <div className="mx-auto max-w-7xl px-4 md:px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-4 items-center">
          {/* Left: text */}
          <div className="space-y-8">
            <div>
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ ...spring, delay: 0.1 }}
                className="text-sm uppercase tracking-widest mb-4"
                style={{ color: RED }}
              >
                Full-Service Auto Repair
              </motion.p>
              <h1
                className="text-3xl md:text-6xl tracking-tighter leading-none font-bold text-white"
                style={{ textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}
              >
                <WordReveal text="Honest Service. Expert Hands." />
              </h1>
            </div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring, delay: 0.6 }}
              className="text-lg max-w-md leading-relaxed"
              style={{ color: SILVER }}
            >
              From routine oil changes to complex engine rebuilds, our
              ASE-certified technicians deliver honest diagnoses and quality
              repairs you can count on.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring, delay: 0.8 }}
              className="flex flex-wrap gap-4"
            >
              <MagneticButton
                className="px-8 py-4 rounded-full text-base font-semibold text-white flex items-center gap-2 cursor-pointer"
                style={{ background: RED } as React.CSSProperties}
              >
                Schedule Service
                <ArrowRight size={18} weight="bold" />
              </MagneticButton>
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/10 flex items-center gap-2 cursor-pointer">
                <Phone size={18} weight="duotone" />
                (555) 847-2900
              </MagneticButton>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ ...spring, delay: 1 }}
              className="flex flex-wrap gap-6 text-sm"
              style={{ color: SILVER }}
            >
              <span className="flex items-center gap-2">
                <MapPin size={16} weight="duotone" style={{ color: RED }} />
                4821 Pacific Blvd
              </span>
              <span className="flex items-center gap-2">
                <Clock size={16} weight="duotone" style={{ color: RED }} />
                Mon-Sat 7am-6pm
              </span>
            </motion.div>
          </div>

          {/* Right: rotating wrench/gear */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ ...spring, delay: 0.3 }}
            className="hidden md:flex items-center justify-center lg:justify-end"
          >
            <AnimatedPiston />
          </motion.div>
        </div>
      </section>

      {/* ─── 3. STATS ─── */}
      <SectionReveal className="relative z-10 pb-8">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(180deg, transparent 0%, rgba(220,38,38,0.03) 50%, transparent 100%)`,
          }}
        />
        <div className="relative mx-auto max-w-7xl px-4 md:px-6">
          <GlassCard className="p-6 md:p-8">
            <motion.div
              className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8"
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-50px" }}
            >
              {[
                { value: 15000, suffix: "+", label: "Cars Serviced", icon: CarSimple },
                { value: 8, suffix: "", label: "ASE Certified Techs", icon: Certificate },
                { value: 22, suffix: "", label: "Years Open", icon: Trophy },
                { value: 4.9, suffix: "", label: "Google Rating", icon: Star, isDecimal: true },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  className="text-center"
                >
                  <div
                    className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center"
                    style={{ background: RED_GLOW }}
                  >
                    <stat.icon size={24} weight="duotone" style={{ color: RED }} />
                  </div>
                  <p className="text-2xl md:text-3xl font-bold text-white">
                    {stat.isDecimal ? (
                      <span>{stat.value}</span>
                    ) : (
                      <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                    )}
                  </p>
                  <p className="text-sm mt-1" style={{ color: SILVER }}>
                    {stat.label}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </GlassCard>
        </div>
      </SectionReveal>

      {/* ─── 4. SERVICES ─── */}
      <SectionReveal id="services" className="relative z-10 py-16 md:py-24">
        <GearPatternBg />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at 80% 20%, rgba(220,38,38,0.06) 0%, transparent 50%)`,
          }}
        />
        <div className="relative mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p
              className="text-sm uppercase tracking-widest mb-3"
              style={{ color: RED }}
            >
              What We Do
            </p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Our Expert Services" />
            </h2>
          </div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
          >
            {services.map((svc, i) => (
              <motion.div key={i} variants={fadeUp}>
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  transition={springGentle}
                  style={{ willChange: "transform" }}
                >
                  <GlassCard className="p-6 h-full">
                    <div className="flex items-center gap-4 mb-4">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: RED_GLOW }}
                      >
                        <svc.icon size={24} weight="duotone" style={{ color: RED }} />
                      </div>
                      <h3 className="text-lg font-semibold text-white">{svc.title}</h3>
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: SILVER }}>
                      {svc.description}
                    </p>
                  </GlassCard>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── 5. WHY CHOOSE US ─── */}
      <SectionReveal id="about" className="relative z-10 py-16 md:py-24">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(135deg, rgba(220,38,38,0.04) 0%, transparent 40%, rgba(148,163,184,0.03) 100%)`,
          }}
        />
        <div className="relative mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <p
                className="text-sm uppercase tracking-widest mb-3"
                style={{ color: RED }}
              >
                Why Pacific Auto Works
              </p>
              <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white mb-6">
                <WordReveal text="Trusted Repair. No Surprises." />
              </h2>
              <p className="leading-relaxed max-w-md mb-8" style={{ color: SILVER }}>
                For over two decades, Pacific Auto Works has been the neighborhood
                shop that treats every vehicle like our own. We believe in
                transparent pricing, certified technicians, and repairs that last.
              </p>
              <div className="flex flex-wrap gap-4">
                <MagneticButton
                  className="px-8 py-4 rounded-full text-base font-semibold text-white flex items-center gap-2 cursor-pointer"
                  style={{ background: RED } as React.CSSProperties}
                >
                  Get a Free Quote
                  <ArrowRight size={18} weight="bold" />
                </MagneticButton>
              </div>
            </div>

            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
            >
              {[
                {
                  icon: Certificate,
                  label: "ASE Certified",
                  desc: "All techs nationally certified",
                },
                {
                  icon: Handshake,
                  label: "Honest Pricing",
                  desc: "Upfront quotes, no hidden fees",
                },
                {
                  icon: ShieldCheck,
                  label: "24/24 Warranty",
                  desc: "24 months / 24,000 miles",
                },
                {
                  icon: Speedometer,
                  label: "Fast Turnaround",
                  desc: "Most repairs same-day",
                },
              ].map((item, i) => (
                <motion.div key={i} variants={fadeUp}>
                  <GlassCard className="p-5 text-center">
                    <item.icon
                      size={28}
                      weight="duotone"
                      style={{ color: RED }}
                      className="mx-auto mb-2"
                    />
                    <p className="text-sm font-semibold text-white">{item.label}</p>
                    <p className="text-xs mt-1" style={{ color: SILVER }}>
                      {item.desc}
                    </p>
                  </GlassCard>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </SectionReveal>

      {/* ─── 6. PROCESS ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at 50% 50%, rgba(220,38,38,0.05) 0%, transparent 60%)`,
          }}
        />
        <div className="relative mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p
              className="text-sm uppercase tracking-widest mb-3"
              style={{ color: RED }}
            >
              Simple Process
            </p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Four Easy Steps" />
            </h2>
          </div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
          >
            {[
              {
                step: "01",
                title: "Drop Off",
                desc: "Bring your vehicle in or schedule a convenient drop-off time. We offer early-bird and after-hours key drop.",
                icon: CarSimple,
              },
              {
                step: "02",
                title: "Diagnose",
                desc: "Our ASE-certified techs run a thorough inspection and computer diagnostics to identify every issue.",
                icon: Gauge,
              },
              {
                step: "03",
                title: "Approve",
                desc: "We call you with a detailed estimate. No work begins until you review and approve the repair plan.",
                icon: CheckCircle,
              },
              {
                step: "04",
                title: "Pick Up",
                desc: "Your vehicle is repaired, road-tested, and ready. We walk you through everything we did before you leave.",
                icon: CarSimple,
              },
            ].map((item, i) => (
              <motion.div key={i} variants={fadeUp}>
                <ShimmerBorder>
                  <div className="p-6 text-center">
                    <div
                      className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center"
                      style={{ background: RED_GLOW }}
                    >
                      <item.icon size={28} weight="duotone" style={{ color: RED }} />
                    </div>
                    <p
                      className="text-xs font-bold tracking-widest mb-2"
                      style={{ color: RED }}
                    >
                      STEP {item.step}
                    </p>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm leading-relaxed" style={{ color: SILVER }}>
                      {item.desc}
                    </p>
                  </div>
                </ShimmerBorder>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── 7. SPECIALTIES ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <GearPatternBg />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(180deg, transparent 0%, rgba(148,163,184,0.03) 50%, transparent 100%)`,
          }}
        />
        <div className="relative mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p
              className="text-sm uppercase tracking-widest mb-3"
              style={{ color: RED }}
            >
              We Work On
            </p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="All Makes & Models" />
            </h2>
            <p className="mt-4 max-w-lg mx-auto leading-relaxed" style={{ color: SILVER }}>
              Whether you drive a domestic pickup, a Japanese sedan, or a European
              luxury car, our team has the training and tools to service it right.
            </p>
          </div>

          <motion.div
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
          >
            {specialties.map((item, i) => (
              <motion.div key={i} variants={fadeUp}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={springGentle}
                  style={{ willChange: "transform" }}
                >
                  <GlassCard className="p-5 text-center">
                    <item.icon
                      size={32}
                      weight="duotone"
                      style={{ color: RED }}
                      className="mx-auto mb-3"
                    />
                    <p className="text-xs font-semibold text-white leading-tight">
                      {item.name}
                    </p>
                  </GlassCard>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── 8. TESTIMONIALS ─── */}
      <SectionReveal id="reviews" className="relative z-10 py-16 md:py-24">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at 20% 80%, rgba(220,38,38,0.05) 0%, transparent 50%)`,
          }}
        />
        <div className="relative mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p
              className="text-sm uppercase tracking-widest mb-3"
              style={{ color: RED }}
            >
              Customer Reviews
            </p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="What Drivers Say" />
            </h2>
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
                  <Quotes
                    size={28}
                    weight="fill"
                    style={{ color: RED }}
                    className="mb-3 opacity-50"
                  />
                  <p className="text-sm leading-relaxed flex-1" style={{ color: SILVER }}>
                    {t.text}
                  </p>
                  <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                    <span className="text-sm font-semibold text-white">{t.name}</span>
                    <div className="flex gap-0.5">
                      {Array.from({ length: t.rating }).map((_, j) => (
                        <Star key={j} size={12} weight="fill" style={{ color: RED }} />
                      ))}
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── 9. COUPONS / OFFERS ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(180deg, transparent 0%, rgba(220,38,38,0.04) 50%, transparent 100%)`,
          }}
        />
        <div className="relative mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p
              className="text-sm uppercase tracking-widest mb-3"
              style={{ color: RED }}
            >
              Current Deals
            </p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Savings You Can Trust" />
            </h2>
          </div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
          >
            {coupons.map((coupon, i) => (
              <motion.div key={i} variants={fadeUp}>
                <ShimmerBorder>
                  <div className="p-6 text-center">
                    <div
                      className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center"
                      style={{ background: RED_GLOW }}
                    >
                      <coupon.icon size={28} weight="duotone" style={{ color: RED }} />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {coupon.title}
                    </h3>
                    <p className="text-sm mb-4" style={{ color: SILVER }}>
                      {coupon.description}
                    </p>
                    <div
                      className="inline-block px-4 py-2 rounded-lg text-sm font-mono font-bold tracking-wider"
                      style={{ background: RED_GLOW, color: RED }}
                    >
                      {coupon.code}
                    </div>
                  </div>
                </ShimmerBorder>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── 10. GALLERY ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at 60% 30%, rgba(148,163,184,0.04) 0%, transparent 50%)`,
          }}
        />
        <div className="relative mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p
              className="text-sm uppercase tracking-widest mb-3"
              style={{ color: RED }}
            >
              Inside the Shop
            </p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="See Our Facility" />
            </h2>
          </div>

          <motion.div
            className="grid grid-cols-2 md:grid-cols-3 gap-4"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
          >
            {galleryImages.map((img, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className={i === 0 ? "col-span-2 md:col-span-1 md:row-span-2" : ""}
              >
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  transition={springGentle}
                  className="overflow-hidden rounded-2xl h-full"
                  style={{ willChange: "transform" }}
                >
                  <div
                    className={`relative overflow-hidden rounded-2xl ${
                      i === 0 ? "aspect-square" : "aspect-video"
                    }`}
                  >
                    <img
                      src={img.src}
                      alt={img.alt}
                      className="w-full h-full object-cover object-center"
                      loading="lazy"
                    />
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(to top, rgba(17,17,17,0.5) 0%, transparent 50%)",
                      }}
                    />
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── 11. FAQ ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <GearPatternBg />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(135deg, rgba(220,38,38,0.03) 0%, transparent 50%)`,
          }}
        />
        <div className="relative mx-auto max-w-3xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p
              className="text-sm uppercase tracking-widest mb-3"
              style={{ color: RED }}
            >
              Common Questions
            </p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Frequently Asked" />
            </h2>
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
                  title={faq.question}
                  answer={faq.answer}
                  isOpen={openFaq === i}
                  onToggle={() => setOpenFaq(openFaq === i ? null : i)}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── 12. CONTACT ─── */}
      <SectionReveal id="contact" className="relative z-10 py-16 md:py-24">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at 40% 60%, rgba(220,38,38,0.05) 0%, transparent 50%)`,
          }}
        />
        <div className="relative mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p
                className="text-sm uppercase tracking-widest mb-3"
                style={{ color: RED }}
              >
                Get in Touch
              </p>
              <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white mb-6">
                <WordReveal text="Ready to Roll?" />
              </h2>
              <p className="leading-relaxed max-w-md mb-8" style={{ color: SILVER }}>
                Schedule your next service, get a free estimate, or just ask us a
                question. We are here to help keep you on the road.
              </p>
              <div className="flex flex-wrap gap-4">
                <MagneticButton
                  className="px-10 py-4 rounded-full text-base font-semibold text-white inline-flex items-center gap-2 cursor-pointer"
                  style={{ background: RED } as React.CSSProperties}
                >
                  <CalendarCheck size={20} weight="duotone" />
                  Book Appointment
                </MagneticButton>
                <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/10 flex items-center gap-2 cursor-pointer">
                  <Phone size={18} weight="duotone" />
                  Call Now
                </MagneticButton>
              </div>
            </div>

            <GlassCard className="p-8">
              <h3 className="text-xl font-semibold text-white mb-6">
                Contact Information
              </h3>
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <MapPin
                    size={20}
                    weight="duotone"
                    style={{ color: RED }}
                    className="mt-0.5 shrink-0"
                  />
                  <div>
                    <p className="text-sm font-semibold text-white">Location</p>
                    <p className="text-sm" style={{ color: SILVER }}>
                      4821 Pacific Boulevard
                      <br />
                      Tacoma, WA 98408
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Phone
                    size={20}
                    weight="duotone"
                    style={{ color: RED }}
                    className="mt-0.5 shrink-0"
                  />
                  <div>
                    <p className="text-sm font-semibold text-white">Phone</p>
                    <p className="text-sm" style={{ color: SILVER }}>
                      (555) 847-2900
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Envelope
                    size={20}
                    weight="duotone"
                    style={{ color: RED }}
                    className="mt-0.5 shrink-0"
                  />
                  <div>
                    <p className="text-sm font-semibold text-white">Email</p>
                    <p className="text-sm" style={{ color: SILVER }}>
                      service@pacificautoworks.com
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Clock
                    size={20}
                    weight="duotone"
                    style={{ color: RED }}
                    className="mt-0.5 shrink-0"
                  />
                  <div>
                    <p className="text-sm font-semibold text-white">Hours</p>
                    <p className="text-sm" style={{ color: SILVER }}>
                      Monday - Friday: 7:00 AM - 6:00 PM
                      <br />
                      Saturday: 8:00 AM - 4:00 PM
                      <br />
                      Sunday: Closed
                    </p>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </SectionReveal>

      {/* ─── 13. FOOTER ─── */}
      <footer className="relative z-10 border-t border-white/5 py-8">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: `linear-gradient(to top, rgba(17,17,17,1) 0%, rgba(17,17,17,0.95) 100%)` }}
        />
        <div className="relative mx-auto max-w-7xl px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Wrench size={16} weight="duotone" style={{ color: RED }} />
            <span>Pacific Auto Works &copy; {new Date().getFullYear()}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span>Created by <a href="https://bluejayportfolio.com" target="_blank" rel="noopener noreferrer" style={{textDecoration:"underline"}}>bluejayportfolio.com</a></span>
          </div>
        </div>
      </footer>
    </main>
  );
}
