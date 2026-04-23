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
  Star,
  ShieldCheck,
  CaretDown,
  Phone,
  MapPin,
  Clock,
  ArrowRight,
  Quotes,
  X,
  List,
  Key,
  Lock,
  LockOpen,
  Car,
  Buildings,
  House,
  Vault,
  Fingerprint,
  CalendarCheck,
  Users,
  Timer,
  Medal,
  Certificate,
  Warning,
  Siren,
  CheckCircle,
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
const BG = "#1a1a0a";
const ACCENT = "#eab308";
const ACCENT_LIGHT = "#facc15";
const ACCENT_GLOW = "rgba(234, 179, 8, 0.15)";

/* ───────────────────────── KEY/LOCK NAV ICON ───────────────────────── */
function KeyLockIcon({ size = 24 }: { size?: number }) {
  if (size <= 32) {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <circle cx="12" cy="12" r="6" stroke={ACCENT} strokeWidth="2" fill={`${ACCENT}22`} />
        <circle cx="12" cy="12" r="2.5" fill={ACCENT_LIGHT} opacity="0.6" />
        <line x1="17" y1="14" x2="28" y2="25" stroke={ACCENT_LIGHT} strokeWidth="2" strokeLinecap="round" />
        <line x1="24" y1="21" x2="27" y2="18" stroke={ACCENT_LIGHT} strokeWidth="1.5" strokeLinecap="round" />
        <line x1="21" y1="24" x2="24" y2="21" stroke={ACCENT_LIGHT} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 200 220" fill="none">
      {/* Outer glow rings */}
      <motion.circle cx="100" cy="105" r="90" stroke={ACCENT} strokeWidth="0.5" opacity={0.12}
        animate={{ r: [88, 92, 88] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} />
      <motion.circle cx="100" cy="105" r="80" stroke={ACCENT} strokeWidth="0.3" opacity={0.08}
        animate={{ r: [78, 82, 78] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }} />

      {/* Lock body */}
      <motion.rect x="55" y="85" width="90" height="70" rx="10" fill={`${ACCENT}18`} stroke={ACCENT} strokeWidth="2.5"
        initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "backOut" }} />
      {/* Lock body inner highlight */}
      <rect x="62" y="90" width="76" height="55" rx="7" fill={`${ACCENT}0d`} />

      {/* Lock shackle */}
      <motion.path d="M72 85 L72 60 C72 40, 128 40, 128 60 L128 85" stroke={ACCENT} strokeWidth="3" strokeLinecap="round" fill="none"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, delay: 0.5, ease: "easeInOut" }} />
      <motion.path d="M78 85 L78 62 C78 46, 122 46, 122 62 L122 85" stroke={ACCENT_LIGHT} strokeWidth="1" strokeLinecap="round" fill="none" opacity={0.3}
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, delay: 0.7, ease: "easeInOut" }} />

      {/* Keyhole */}
      <motion.circle cx="100" cy="112" r="10" fill={`${ACCENT}30`} stroke={ACCENT_LIGHT} strokeWidth="1.5"
        initial={{ scale: 0 }} animate={{ scale: 1 }}
        transition={{ duration: 0.6, delay: 1.2, ease: "backOut" }} />
      <motion.path d="M96 118 L92 140 L108 140 L104 118" fill={`${ACCENT}25`} stroke={ACCENT_LIGHT} strokeWidth="1"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1.5 }} />
      {/* Keyhole glow */}
      <motion.circle cx="100" cy="112" r="15" fill={`${ACCENT}08`}
        animate={{ r: [13, 18, 13], opacity: [0.1, 0.3, 0.1] }}
        transition={{ duration: 2, repeat: Infinity }} />

      {/* Tumbler hint lines */}
      <motion.line x1="65" y1="100" x2="75" y2="100" stroke={ACCENT_LIGHT} strokeWidth="1" opacity={0.3}
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1.8 }} />
      <motion.line x1="65" y1="108" x2="78" y2="108" stroke={ACCENT_LIGHT} strokeWidth="1" opacity={0.25}
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1.9 }} />
      <motion.line x1="65" y1="116" x2="73" y2="116" stroke={ACCENT_LIGHT} strokeWidth="1" opacity={0.2}
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 2.0 }} />

      {/* Key floating beside lock */}
      <motion.g
        animate={{ x: [0, 5, 0], y: [0, -3, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
        {/* Key head ring */}
        <motion.circle cx="38" cy="180" r="12" fill={`${ACCENT}22`} stroke={ACCENT} strokeWidth="2"
          initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 2, ease: "backOut" }} />
        <circle cx="38" cy="178" r="5" fill={`${ACCENT}15`} />
        {/* Key shaft */}
        <motion.line x1="50" y1="180" x2="100" y2="180" stroke={ACCENT_LIGHT} strokeWidth="2.5" strokeLinecap="round"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 2.2, duration: 1 }} />
        {/* Key teeth */}
        <motion.path d="M78 180 L78 188 M86 180 L86 186 M94 180 L94 190" stroke={ACCENT_LIGHT} strokeWidth="2" strokeLinecap="round"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 2.5, duration: 0.8 }} />
      </motion.g>

      {/* Sparkle accents */}
      <motion.circle cx="170" cy="35" r="3" fill={ACCENT_LIGHT}
        animate={{ opacity: [0.2, 1, 0.2], scale: [0.7, 1.3, 0.7] }}
        transition={{ duration: 2.5, repeat: Infinity }} />
      <motion.circle cx="25" cy="50" r="2" fill={ACCENT_LIGHT}
        animate={{ opacity: [0.1, 0.8, 0.1], scale: [0.5, 1.2, 0.5] }}
        transition={{ duration: 3, repeat: Infinity, delay: 0.8 }} />
      <motion.circle cx="175" cy="170" r="2.5" fill={ACCENT_LIGHT}
        animate={{ opacity: [0.15, 0.7, 0.15] }}
        transition={{ duration: 2, repeat: Infinity, delay: 1.2 }} />
      <motion.circle cx="20" cy="145" r="2" fill={ACCENT_LIGHT}
        animate={{ opacity: [0.1, 0.6, 0.1] }}
        transition={{ duration: 2.5, repeat: Infinity, delay: 0.4 }} />
    </svg>
  );
}

/* ───────────────────────── GOLD PARTICLES ───────────────────────── */
function GoldParticles() {
  const particles = Array.from({ length: 22 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 10,
    duration: 7 + Math.random() * 5,
    size: 1.5 + Math.random() * 2.5,
    opacity: 0.1 + Math.random() * 0.25,
  }));

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden hidden md:block">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{ left: `${p.x}%`, width: p.size, height: p.size, background: ACCENT_LIGHT, willChange: "transform, opacity" }}
          animate={{ y: ["-5vh", "110vh"], opacity: [0, p.opacity, p.opacity, 0] }}
          transition={{
            y: { duration: p.duration, repeat: Infinity, delay: p.delay, ease: "linear" },
            opacity: { duration: p.duration, repeat: Infinity, delay: p.delay, times: [0, 0.1, 0.9, 1] },
          }}
        />
      ))}
    </div>
  );
}

/* ───────────────────────── SHARED COMPONENTS ───────────────────────── */
function WordReveal({ text, className = "" }: { text: string; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const words = text.split(" ");
  return (
    <motion.span ref={ref} className={`inline-flex flex-wrap gap-x-3 ${className}`} variants={stagger} initial="hidden" animate={isInView ? "show" : "hidden"}>
      {words.map((word, i) => (<motion.span key={i} variants={fadeUp} className="inline-block">{word}</motion.span>))}
    </motion.span>
  );
}

function SectionReveal({ children, className = "", id }: { children: React.ReactNode; className?: string; id?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.section ref={ref} id={id} className={className} initial={{ opacity: 0, y: 50 }} animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }} transition={spring}>
      {children}
    </motion.section>
  );
}

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (<div className={`rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] ${className}`}>{children}</div>);
}

function MagneticButton({ children, className = "", onClick, style }: { children: React.ReactNode; className?: string; onClick?: () => void; style?: React.CSSProperties }) {
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
  return (
    <motion.button ref={ref} style={{ x: springX, y: springY, willChange: "transform", ...style }} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} onClick={onClick} className={className} whileTap={{ scale: 0.97 }}>
      {children}
    </motion.button>
  );
}

function ShimmerBorder({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative rounded-2xl p-[1px] overflow-hidden ${className}`}>
      <motion.div className="absolute inset-0 rounded-2xl" style={{ background: `conic-gradient(from 0deg, transparent, ${ACCENT}, transparent, ${ACCENT_LIGHT}, transparent)`, willChange: "transform" }} animate={{ rotate: [0, 360] }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} />
      <div className="relative rounded-2xl z-10" style={{ background: BG }}>{children}</div>
    </div>
  );
}

/* ───────────────────────── DATA ───────────────────────── */
const comparisonRows = [
  { feature: "Response Time", us: "15-30 Minutes", them: "45-90 Minutes" },
  { feature: "Upfront Pricing", us: "Always Quoted First", them: "Sometimes" },
  { feature: "Licensed & Insured", us: "Fully Licensed", them: "Varies" },
  { feature: "Background-Checked Techs", us: "Every Technician", them: "Rarely" },
  { feature: "24/7 Availability", us: "365 Days a Year", them: "Business Hours" },
  { feature: "Warranty on Work", us: "90-Day Guarantee", them: "No Warranty" },
  { feature: "High-Security Brands", us: "Medeco, Mul-T-Lock, ASSA", them: "Basic Hardware Only" },
];

const pricingTiers = [
  {
    name: "Lockout Service",
    price: "$75 – $125",
    description: "Emergency residential, commercial, or automotive lockout. Upfront quote before we start.",
    features: ["15-30 min response", "Non-destructive entry", "All lock types", "No hidden fees", "Available 24/7"],
    cta: "Get Unlocked Now",
    highlighted: false,
  },
  {
    name: "Lock Rekey",
    price: "$35 – $65",
    description: "Per lock rekey service. Change who has access without replacing the hardware.",
    features: ["Same-day service", "All cylinder types", "Master key available", "Multiple locks discounted", "Landlord & move-in specials"],
    cta: "Schedule Rekey",
    highlighted: true,
  },
  {
    name: "High-Security Install",
    price: "$150 – $350",
    description: "Premium lock installation with anti-pick, anti-drill, and bump-resistant technology.",
    features: ["Medeco / Mul-T-Lock", "ANSI Grade 1 rated", "Restricted key control", "Professional installation", "5-year hardware warranty"],
    cta: "Upgrade Security",
    highlighted: false,
  },
];

const quizOptions = [
  {
    label: "Locked Out",
    icon: LockOpen,
    urgency: "URGENT",
    urgencyColor: "#ef4444",
    recommendation: "Call us immediately at (206) 294-5817. Our emergency dispatch will have a technician to you in 15-30 minutes. Stay with your vehicle or in a safe public area.",
  },
  {
    label: "Need New Keys",
    icon: Key,
    urgency: "SCHEDULED",
    urgencyColor: ACCENT,
    recommendation: "We can cut and program keys for any lock or vehicle — including transponder and smart keys. Schedule a same-day or next-day appointment for fastest service.",
  },
  {
    label: "Security Upgrade",
    icon: ShieldCheck,
    urgency: "PLANNED",
    urgencyColor: "#22c55e",
    recommendation: "We recommend a free security audit first. Our tech will assess your current locks, identify vulnerabilities, and recommend the right high-security solution for your budget.",
  },
  {
    label: "Commercial Job",
    icon: Buildings,
    urgency: "CONSULT",
    urgencyColor: "#3b82f6",
    recommendation: "Commercial jobs need a site assessment. We handle master key systems, access control, panic bars, and multi-unit rekeying. Call for a free commercial quote.",
  },
];

const certBadges = [
  "ALOA Member",
  "SAVTA Certified",
  "BBB Accredited",
  "State Licensed",
  "Fully Bonded",
  "Background Checked",
];

const serviceAreaGrid = [
  { area: "Downtown Seattle", time: "15-20 min" },
  { area: "Capitol Hill", time: "18-25 min" },
  { area: "Bellevue", time: "20-30 min" },
  { area: "Kirkland", time: "22-30 min" },
  { area: "Redmond", time: "25-35 min" },
  { area: "Renton", time: "20-28 min" },
];

const services = [
  { title: "Residential Locksmith", description: "Home lockouts, lock changes, rekeying, deadbolt installation, and smart lock setup. We secure your home with the latest hardware and get you back inside fast.", icon: House },
  { title: "Commercial Locksmith", description: "Master key systems, high-security locks, panic bars, access control, and commercial-grade deadbolts for offices, retail, and warehouses.", icon: Buildings },
  { title: "Automotive Locksmith", description: "Car lockouts, transponder key programming, key fob replacement, ignition repair, and broken key extraction for all makes and models.", icon: Car },
  { title: "Emergency Lockout", description: "Locked out of your home, car, or office? Our mobile units arrive in 15-30 minutes, 24/7/365. No door is too tough and no hour is too late.", icon: LockOpen },
  { title: "Safe Services", description: "Safe opening, combination changes, lock upgrades, and new safe installation. We work with all brands from residential fire safes to commercial vaults.", icon: Vault },
  { title: "Access Control", description: "Keypad entry, card readers, biometric systems, and intercom installation. Modern security solutions for businesses and multi-unit residential buildings.", icon: Fingerprint },
];

const testimonials = [
  { name: "Patricia G.", text: "Locked out at 2 AM and they were here in 20 minutes. Professional, fast, and the price was exactly what they quoted on the phone. Lifesaver.", rating: 5 },
  { name: "James W.", text: "Had our entire office rekeyed after a break-in. They installed a master key system and high-security deadbolts. We feel much safer now. Great team.", rating: 5 },
  { name: "Diana M.", text: "Lost my only car key and needed a transponder programmed. They came to my location and had a new key working in 30 minutes. Incredible service.", rating: 5 },
];

const serviceAreas = [
  "Downtown", "North Side", "South Side", "East County", "West Hills", "Suburban Heights", "Lakefront", "Industrial District",
];

const faqData = [
  { q: "How fast can you get to me in an emergency?", a: "Our average response time is 15-30 minutes for emergency lockouts. We have mobile units stationed throughout the metro area for rapid dispatch." },
  { q: "Can you make keys for any car?", a: "Yes. We program transponder keys, smart keys, and key fobs for virtually all makes and models, including luxury and foreign vehicles. We come to your location." },
  { q: "Do you damage the lock when picking it?", a: "No. Our technicians use non-destructive entry methods whenever possible. In the rare case a lock must be drilled, we replace it at no additional charge for the labor." },
  { q: "Are you licensed and insured?", a: "Absolutely. We are fully licensed, bonded, and insured. All technicians are background-checked and carry ID. We follow all state locksmith regulations." },
  { q: "Can you install smart locks?", a: "Yes. We install and program all major smart lock brands including August, Schlage Encode, Yale, and Kwikset Halo. We also set up the accompanying apps for you." },
  { q: "What forms of payment do you accept?", a: "We accept cash, all major credit cards, Apple Pay, Google Pay, and Venmo. Payment is collected only after the job is complete to your satisfaction." },
];

/* ═══════════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════════ */
export default function V2LocksmithPage() {
  const [openService, setOpenService] = useState<number | null>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [quizOpen, setQuizOpen] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: "", phone: "", serviceType: "", description: "" });
  const [formSent, setFormSent] = useState(false);

  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden" style={{ background: BG, color: "#f1f5f9" }}>
      <GoldParticles />

      {/* ─── NAV ─── */}
      <motion.nav initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-4">
          <GlassCard className="flex items-center justify-between px-4 md:px-6 py-3">
            <div className="flex items-center gap-2">
              <KeyLockIcon size={24} />
              <span className="text-lg font-bold tracking-tight text-white">SecureKey Locksmith</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
              <a href="#services" className="hover:text-white transition-colors">Services</a>
              <a href="#about" className="hover:text-white transition-colors">About</a>
              <a href="#areas" className="hover:text-white transition-colors">Areas</a>
              <a href="#testimonials" className="hover:text-white transition-colors">Reviews</a>
            </div>
            <div className="flex items-center gap-3">
              <MagneticButton className="px-4 md:px-5 py-2 rounded-full text-sm font-semibold text-black transition-colors" style={{ background: ACCENT } as React.CSSProperties}>
                Call Now
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
                  {[{ label: "Services", href: "#services" }, { label: "About", href: "#about" }, { label: "Areas", href: "#areas" }, { label: "Reviews", href: "#testimonials" }].map((link) => (
                    <a key={link.label} href={link.href} onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors">{link.label}</a>
                  ))}
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.nav>

      {/* ─── 1. HERO ─── */}
      <section className="relative min-h-[100dvh] flex items-center pt-24 z-10">
        <div className="absolute inset-0 z-0">
          <img src="https://images.unsplash.com/photo-1582139329536-e7284fece509?w=1600&q=80" alt="" className="w-full h-full object-cover object-center" />
          <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${BG}f0 0%, ${BG}dd 50%, ${BG}bb 100%)` }} />
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div>
              <motion.p initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ ...spring, delay: 0.1 }} className="text-sm uppercase tracking-widest mb-4" style={{ color: ACCENT }}>
                24/7 Licensed Locksmith
              </motion.p>
              <h1 className="text-3xl md:text-6xl tracking-tighter leading-none font-bold text-white" style={{ textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>
                <WordReveal text="Locked Out? We Are On Our Way." />
              </h1>
            </div>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.6 }} className="text-lg text-slate-300 max-w-md leading-relaxed">
              Fast, reliable locksmith service for homes, cars, and businesses. 15-30 minute response time, upfront pricing, and zero hidden fees. Day or night.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.8 }} className="flex flex-wrap gap-4">
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-black flex items-center gap-2 cursor-pointer" style={{ background: ACCENT } as React.CSSProperties}>
                Emergency Lockout <ArrowRight size={18} weight="bold" />
              </MagneticButton>
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/10 flex items-center gap-2 cursor-pointer">
                <Phone size={18} weight="duotone" /> (206) 294-5817
              </MagneticButton>
            </motion.div>
            {/* Trust Badge Pills */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 1 }} className="flex flex-wrap gap-2">
              {[
                { icon: Certificate, label: "Licensed & Bonded" },
                { icon: ShieldCheck, label: "Background Checked" },
                { icon: Timer, label: "30-Min Response" },
                { icon: CheckCircle, label: "Upfront Pricing" },
              ].map((badge, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border" style={{ borderColor: `${ACCENT}40`, background: `${ACCENT}10`, color: ACCENT_LIGHT }}>
                  <badge.icon size={12} weight="fill" />
                  {badge.label}
                </span>
              ))}
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ ...spring, delay: 1.2 }} className="flex flex-wrap gap-6 text-sm text-slate-400">
              <span className="flex items-center gap-2"><Timer size={16} weight="duotone" style={{ color: ACCENT }} />15-30 Min Response</span>
              <span className="flex items-center gap-2"><Clock size={16} weight="duotone" style={{ color: ACCENT }} />24/7/365 Service</span>
            </motion.div>
          </div>
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ ...spring, delay: 0.3 }} className="hidden lg:flex items-center justify-center">
            <div className="relative">
              <motion.div className="absolute inset-0 rounded-full" style={{ background: `radial-gradient(circle, ${ACCENT_GLOW} 0%, transparent 70%)`, filter: "blur(40px)" }} animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} />
              <div className="relative z-10"><KeyLockIcon size={260} /></div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── 1.5. EMERGENCY URGENCY STRIP ─── */}
      <div className="relative z-10 w-full" style={{ background: ACCENT }}>
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-3 flex flex-col sm:flex-row items-center justify-center gap-3 text-center">
          <div className="flex items-center gap-2">
            <motion.span
              className="inline-block w-2.5 h-2.5 rounded-full bg-black/40"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            />
            <span className="text-sm font-bold text-black tracking-wide uppercase">Locksmiths On-Call 24/7</span>
          </div>
          <span className="hidden sm:block text-black/30 text-sm">—</span>
          <a href="tel:2062945817" className="text-sm font-bold text-black hover:underline flex items-center gap-1.5">
            <Phone size={14} weight="fill" />
            (206) 294-5817 — Call or Text Anytime
          </a>
        </div>
      </div>

      {/* ─── 2. STATS ─── */}
      <SectionReveal className="relative z-10 pb-8">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <GlassCard className="p-6 md:p-8">
            <motion.div className="grid grid-cols-2 sm:grid-cols-4 gap-6 md:gap-8" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
              {[
                { icon: Star, label: "4.9 Star Rating", desc: "600+ reviews" },
                { icon: Timer, label: "15-30 Min", desc: "Average response" },
                { icon: Certificate, label: "Licensed & Bonded", desc: "Full credentials" },
                { icon: Medal, label: "12+ Years", desc: "Trusted service" },
              ].map((stat, i) => (
                <motion.div key={i} variants={fadeUp} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: ACCENT_GLOW }}>
                    <stat.icon size={20} weight="duotone" style={{ color: ACCENT }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{stat.label}</p>
                    <p className="text-xs text-slate-400">{stat.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </GlassCard>
        </div>
      </SectionReveal>

      {/* ─── 3. SERVICES ─── */}
      <SectionReveal id="services" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            <div className="lg:sticky lg:top-32">
              <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ACCENT }}>Our Services</p>
              <h2 className="text-3xl md:text-6xl tracking-tighter leading-none font-bold text-white mb-6">
                <WordReveal text="Complete Lock & Key Solutions" />
              </h2>
              <p className="text-slate-400 leading-relaxed max-w-md">
                From emergency lockouts to full commercial security systems, our mobile technicians bring the shop to you with upfront pricing and zero surprises.
              </p>
            </div>
            <motion.div className="space-y-3" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
              {services.map((svc, i) => (
                <motion.div key={i} variants={fadeUp}>
                  <GlassCard className="overflow-hidden">
                    <button onClick={() => setOpenService(openService === i ? null : i)} className="w-full flex items-center justify-between p-5 md:p-6 text-left group cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: ACCENT_GLOW }}>
                          <svc.icon size={20} weight="duotone" style={{ color: ACCENT }} />
                        </div>
                        <span className="text-lg font-semibold text-white">{svc.title}</span>
                      </div>
                      <motion.div animate={{ rotate: openService === i ? 180 : 0 }} transition={spring}><CaretDown size={20} className="text-slate-400" /></motion.div>
                    </button>
                    <AnimatePresence initial={false}>
                      {openService === i && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={spring} className="overflow-hidden">
                          <p className="px-5 pb-5 md:px-6 md:pb-6 text-slate-400 leading-relaxed pl-[4.5rem]">{svc.description}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </GlassCard>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </SectionReveal>

      {/* ─── 4. ABOUT ─── */}
      <SectionReveal id="about" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ACCENT }}>About SecureKey</p>
              <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white mb-6">
                <WordReveal text="Your Security Is Our Mission" />
              </h2>
              <p className="text-slate-400 leading-relaxed mb-6">
                SecureKey Locksmith has served thousands of residential and commercial clients over the past 12 years. Our fleet of fully equipped mobile units ensures we arrive fast and fix it right the first time.
              </p>
              <p className="text-slate-400 leading-relaxed">
                Every technician is licensed, insured, and trained on the latest lock technologies from traditional deadbolts to biometric access control. We price honestly and never charge hidden fees.
              </p>
            </div>
            <motion.div className="grid grid-cols-2 gap-4" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
              {[
                { icon: ShieldCheck, label: "Fully Licensed", desc: "State certified" },
                { icon: Users, label: "Expert Techs", desc: "Background checked" },
                { icon: Lock, label: "All Lock Types", desc: "Residential to commercial" },
                { icon: Timer, label: "Rapid Response", desc: "15-30 min arrival" },
              ].map((item, i) => (
                <motion.div key={i} variants={fadeUp}>
                  <GlassCard className="p-5 text-center">
                    <item.icon size={28} weight="duotone" style={{ color: ACCENT }} className="mx-auto mb-2" />
                    <p className="text-sm font-semibold text-white">{item.label}</p>
                    <p className="text-xs text-slate-400 mt-1">{item.desc}</p>
                  </GlassCard>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </SectionReveal>

      {/* ─── 5. 24/7 EMERGENCY CTA ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4 md:px-6">
          <ShimmerBorder>
            <div className="p-8 md:p-12 text-center">
              <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={spring}>
                <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }} className="inline-block mb-4">
                  <Siren size={48} weight="duotone" style={{ color: ACCENT }} />
                </motion.div>
                <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ACCENT }}>24/7 Emergency Service</p>
                <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white mb-4">Locked Out Right Now?</h2>
                <p className="text-slate-400 text-lg mb-6 max-w-lg mx-auto">
                  Do not panic. Our emergency locksmith team is available around the clock, 365 days a year. We will be there in 15-30 minutes with upfront pricing.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <MagneticButton className="px-10 py-4 rounded-full text-base font-semibold text-black inline-flex items-center gap-2 cursor-pointer" style={{ background: ACCENT } as React.CSSProperties}>
                    <Phone size={20} weight="duotone" /> Call (206) 294-5817
                  </MagneticButton>
                </div>
              </motion.div>
            </div>
          </ShimmerBorder>
        </div>
      </SectionReveal>

      {/* ─── 6. TESTIMONIALS ─── */}
      <SectionReveal id="testimonials" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-10">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ACCENT }}>Customer Stories</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Trusted When It Matters" />
            </h2>
          </div>
          {/* Google Reviews Header */}
          <div className="flex justify-center mb-10">
            <div className="inline-flex items-center gap-3 px-5 py-3 rounded-full border border-white/10 bg-white/[0.04]">
              {/* Google G SVG */}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              {/* Stars */}
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={16} weight="fill" style={{ color: ACCENT }} />
                ))}
              </div>
              <span className="text-sm font-semibold text-white">4.8</span>
              <span className="text-sm text-slate-400">·</span>
              <span className="text-sm text-slate-400">312 Google reviews</span>
            </div>
          </div>
          <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {testimonials.map((t, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="p-6 h-full flex flex-col">
                  <Quotes size={28} weight="fill" style={{ color: ACCENT }} className="mb-3 opacity-50" />
                  <p className="text-slate-300 leading-relaxed flex-1 text-sm">{t.text}</p>
                  <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                    <span className="text-sm font-semibold text-white">{t.name}</span>
                    <div className="flex gap-0.5">{Array.from({ length: t.rating }).map((_, j) => (<Star key={j} size={12} weight="fill" style={{ color: ACCENT }} />))}</div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── 8. PRICING TIERS ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ACCENT }}>Transparent Pricing</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="No Surprises. Ever." />
            </h2>
            <p className="text-slate-400 mt-4 max-w-xl mx-auto">Every job starts with an upfront quote. You approve the price before we touch anything. Period.</p>
          </div>
          <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {pricingTiers.map((tier, i) => (
              <motion.div key={i} variants={fadeUp}>
                {tier.highlighted ? (
                  <ShimmerBorder className="h-full">
                    <div className="p-6 md:p-8 flex flex-col h-full">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-4 self-start" style={{ background: ACCENT, color: "#000" }}>
                        Most Popular
                      </div>
                      <h3 className="text-xl font-bold text-white mb-1">{tier.name}</h3>
                      <p className="text-3xl font-bold mb-3" style={{ color: ACCENT }}>{tier.price}</p>
                      <p className="text-sm text-slate-400 leading-relaxed mb-6">{tier.description}</p>
                      <ul className="space-y-2 mb-8 flex-1">
                        {tier.features.map((f, j) => (
                          <li key={j} className="flex items-center gap-2 text-sm text-slate-300">
                            <CheckCircle size={15} weight="fill" style={{ color: ACCENT }} className="shrink-0" />
                            {f}
                          </li>
                        ))}
                      </ul>
                      <MagneticButton className="w-full py-3 rounded-full text-sm font-bold text-black cursor-pointer" style={{ background: ACCENT } as React.CSSProperties}>
                        {tier.cta}
                      </MagneticButton>
                    </div>
                  </ShimmerBorder>
                ) : (
                  <GlassCard className="p-6 md:p-8 flex flex-col h-full">
                    <h3 className="text-xl font-bold text-white mb-1">{tier.name}</h3>
                    <p className="text-3xl font-bold mb-3" style={{ color: ACCENT }}>{tier.price}</p>
                    <p className="text-sm text-slate-400 leading-relaxed mb-6">{tier.description}</p>
                    <ul className="space-y-2 mb-8 flex-1">
                      {tier.features.map((f, j) => (
                        <li key={j} className="flex items-center gap-2 text-sm text-slate-300">
                          <CheckCircle size={15} weight="fill" style={{ color: ACCENT }} className="shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <MagneticButton className="w-full py-3 rounded-full text-sm font-bold text-white border border-white/15 cursor-pointer hover:border-white/30 transition-colors">
                      {tier.cta}
                    </MagneticButton>
                  </GlassCard>
                )}
              </motion.div>
            ))}
          </motion.div>
          <p className="text-center text-xs text-slate-500 mt-6">All prices quoted upfront before work begins. Final price never exceeds quote without your approval.</p>
        </div>
      </SectionReveal>

      {/* ─── 9. COMPARISON TABLE ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ACCENT }}>Why Choose Us</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="City Lock & Key vs. The Competition" />
            </h2>
          </div>
          <GlassCard className="overflow-hidden">
            {/* Header row */}
            <div className="grid grid-cols-3 border-b border-white/10">
              <div className="p-4 md:p-5 text-xs font-semibold text-slate-500 uppercase tracking-widest">Feature</div>
              <div className="p-4 md:p-5 text-center text-xs font-semibold uppercase tracking-widest" style={{ color: ACCENT }}>City Lock &amp; Key</div>
              <div className="p-4 md:p-5 text-center text-xs font-semibold text-slate-500 uppercase tracking-widest">The Others</div>
            </div>
            {comparisonRows.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 border-b border-white/5 last:border-0 ${i % 2 === 0 ? "bg-white/[0.01]" : ""}`}>
                <div className="p-4 md:p-5 text-sm text-slate-300 font-medium flex items-center">{row.feature}</div>
                <div className="p-4 md:p-5 flex items-center justify-center gap-2">
                  <CheckCircle size={16} weight="fill" style={{ color: "#22c55e" }} />
                  <span className="text-xs md:text-sm font-semibold text-green-400 hidden sm:inline">{row.us}</span>
                </div>
                <div className="p-4 md:p-5 flex items-center justify-center gap-2">
                  <X size={16} weight="bold" className="text-red-400 shrink-0" />
                  <span className="text-xs md:text-sm text-slate-500 hidden sm:inline">{row.them}</span>
                </div>
              </div>
            ))}
          </GlassCard>
        </div>
      </SectionReveal>

      {/* ─── 10. VIDEO PLACEHOLDER ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-4 md:px-6">
          <div className="text-center mb-10">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ACCENT }}>See Our Work</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Watch a High-Security Lock Installation" />
            </h2>
          </div>
          <div className="relative rounded-2xl overflow-hidden group cursor-pointer" style={{ aspectRatio: "16/9" }}>
            <img
              src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80"
              alt="Locksmith installing high-security lock"
              className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ background: "rgba(0,0,0,0.55)" }}>
              {/* Play button */}
              <motion.div
                whileHover={{ scale: 1.12 }}
                whileTap={{ scale: 0.96 }}
                className="w-20 h-20 rounded-full flex items-center justify-center shadow-2xl mb-5 cursor-pointer"
                style={{ background: ACCENT }}
                animate={{ boxShadow: [`0 0 0 0 ${ACCENT}60`, `0 0 0 20px transparent`] }}
                transition={{ duration: 1.8, repeat: Infinity }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="black">
                  <polygon points="5,3 19,12 5,21" />
                </svg>
              </motion.div>
              <p className="text-white font-semibold text-lg text-center px-4">Watch a High-Security Lock Installation</p>
              <p className="text-white/60 text-sm mt-1">3 min · See our process from start to finish</p>
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* ─── 11. INTERACTIVE QUIZ ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-4 md:px-6">
          <div className="text-center mb-10">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ACCENT }}>Quick Help</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="What Do You Need?" />
            </h2>
            <p className="text-slate-400 mt-4">Select your situation and we will tell you exactly what to do next.</p>
          </div>
          <div className="space-y-3">
            {quizOptions.map((opt, i) => {
              const isOpen = quizOpen === i;
              return (
                <div key={i}>
                  <GlassCard className="overflow-hidden">
                    <button
                      onClick={() => setQuizOpen(isOpen ? null : i)}
                      className="w-full flex items-center gap-4 p-5 text-left cursor-pointer group"
                    >
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors"
                        style={{ background: isOpen ? `${opt.urgencyColor}25` : ACCENT_GLOW }}
                      >
                        <opt.icon size={22} weight="duotone" style={{ color: isOpen ? opt.urgencyColor : ACCENT }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-base font-semibold text-white">{opt.label}</span>
                      </div>
                      <span
                        className="text-xs font-bold px-2.5 py-1 rounded-full shrink-0"
                        style={{ background: `${opt.urgencyColor}20`, color: opt.urgencyColor }}
                      >
                        {opt.urgency}
                      </span>
                      <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={spring} className="shrink-0">
                        <CaretDown size={18} className="text-slate-400" />
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
                          <div
                            className="mx-5 mb-5 p-4 rounded-xl text-sm text-slate-300 leading-relaxed"
                            style={{ background: `${opt.urgencyColor}10`, borderLeft: `3px solid ${opt.urgencyColor}` }}
                          >
                            {opt.recommendation}
                            {opt.urgency === "URGENT" && (
                              <div className="mt-3">
                                <a
                                  href="tel:2062945817"
                                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold text-black"
                                  style={{ background: ACCENT }}
                                >
                                  <Phone size={13} weight="fill" /> Call (206) 294-5817 Now
                                </a>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </GlassCard>
                </div>
              );
            })}
          </div>
          <p className="text-center text-sm text-slate-500 mt-6">Not sure? Call us at <a href="tel:2062945817" className="underline" style={{ color: ACCENT }}>(206) 294-5817</a> and we will figure it out together.</p>
        </div>
      </SectionReveal>

      {/* ─── 12. CERTIFICATIONS BADGE ROW ─── */}
      <SectionReveal className="relative z-10 py-12 md:py-16">
        <div className="mx-auto max-w-5xl px-4 md:px-6">
          <div className="text-center mb-8">
            <p className="text-sm uppercase tracking-widest" style={{ color: ACCENT }}>Credentials &amp; Certifications</p>
          </div>
          <motion.div
            className="flex flex-wrap justify-center gap-3"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
          >
            {certBadges.map((badge, i) => (
              <motion.span
                key={i}
                variants={fadeUp}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border"
                style={{ borderColor: `${ACCENT}35`, background: `${ACCENT}0d`, color: ACCENT_LIGHT }}
              >
                <Certificate size={15} weight="fill" style={{ color: ACCENT }} />
                {badge}
              </motion.span>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── 13. SERVICE AREA GRID (with response times) ─── */}
      <SectionReveal id="areas" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ACCENT }}>Coverage Map</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Seattle Metro Service Areas" />
            </h2>
            <p className="text-slate-400 mt-4">Estimated drive times from our nearest unit — actual response may be faster.</p>
          </div>
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-3 gap-4"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
          >
            {serviceAreaGrid.map((item, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="p-5 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: ACCENT_GLOW }}>
                    <MapPin size={20} weight="duotone" style={{ color: ACCENT }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{item.area}</p>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <Timer size={11} style={{ color: ACCENT }} /> {item.time} avg response
                    </p>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
          <div className="mt-6 flex justify-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm text-slate-400 border border-white/10">
              <CheckCircle size={15} weight="duotone" style={{ color: ACCENT }} />
              Plus surrounding communities within a 30-mile radius
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* ─── 14. FAQ ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ACCENT }}>Questions</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Frequently Asked Questions" />
            </h2>
          </div>
          <motion.div className="space-y-3" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {faqData.map((item, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="overflow-hidden">
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-5 text-left cursor-pointer">
                    <span className="text-sm md:text-base font-semibold text-white pr-4">{item.q}</span>
                    <motion.div animate={{ rotate: openFaq === i ? 180 : 0 }} transition={spring}><CaretDown size={18} className="text-slate-400 shrink-0" /></motion.div>
                  </button>
                  <AnimatePresence initial={false}>
                    {openFaq === i && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={spring} className="overflow-hidden">
                        <p className="px-5 pb-5 text-sm text-slate-400 leading-relaxed">{item.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── 15. CONTACT FORM + INFO ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white mb-6">
                <WordReveal text="Need a Locksmith? Call Us Now." />
              </h2>
              <p className="text-slate-400 leading-relaxed max-w-md mb-8">
                Whether it is an emergency lockout or a planned security upgrade, we are here to help. Upfront pricing, no hidden fees, satisfaction guaranteed.
              </p>
              <div className="flex flex-wrap gap-4 mb-10">
                <MagneticButton className="px-10 py-4 rounded-full text-base font-semibold text-black inline-flex items-center gap-2 cursor-pointer" style={{ background: ACCENT } as React.CSSProperties}>
                  <Phone size={20} weight="duotone" /> Call Now
                </MagneticButton>
                <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/10 flex items-center gap-2 cursor-pointer">
                  <CalendarCheck size={18} weight="duotone" /> Schedule Service
                </MagneticButton>
              </div>
              <GlassCard className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <MapPin size={20} weight="duotone" style={{ color: ACCENT }} className="mt-0.5 shrink-0" />
                    <div><p className="text-sm font-semibold text-white">Location</p><p className="text-sm text-slate-400">Serving Seattle Metro &amp; Eastside Communities</p></div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Phone size={20} weight="duotone" style={{ color: ACCENT }} className="mt-0.5 shrink-0" />
                    <div><p className="text-sm font-semibold text-white">Phone</p><a href="tel:2062945817" className="text-sm text-slate-400 hover:underline">(206) 294-5817</a></div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Clock size={20} weight="duotone" style={{ color: ACCENT }} className="mt-0.5 shrink-0" />
                    <div><p className="text-sm font-semibold text-white">Hours</p><p className="text-sm text-slate-400">Emergency: 24/7/365<br />Office: Mon–Sat 8am–8pm</p></div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Warning size={20} weight="duotone" style={{ color: ACCENT }} className="mt-0.5 shrink-0" />
                    <div><p className="text-sm font-semibold text-white">Emergency</p><p className="text-sm text-slate-400">Locked out? Call us now — 15-30 min average response.</p></div>
                  </div>
                </div>
              </GlassCard>
            </div>

            {/* Contact Form */}
            <GlassCard className="p-6 md:p-8">
              {formSent ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <CheckCircle size={56} weight="fill" style={{ color: ACCENT }} className="mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-2">Message Sent!</h3>
                  <p className="text-slate-400 text-sm max-w-xs">We received your request and will reach out within minutes. For emergencies, call <a href="tel:2062945817" className="underline" style={{ color: ACCENT }}>(206) 294-5817</a> right now.</p>
                </div>
              ) : (
                <>
                  <h3 className="text-xl font-bold text-white mb-6">Request Service</h3>
                  <form
                    onSubmit={(e) => { e.preventDefault(); setFormSent(true); }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Full Name</label>
                      <input
                        type="text"
                        required
                        placeholder="Jane Smith"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 border border-white/10 focus:border-white/30 focus:outline-none transition-colors"
                        style={{ background: "rgba(255,255,255,0.04)" }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Phone Number</label>
                      <input
                        type="tel"
                        required
                        placeholder="Your phone number"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 border border-white/10 focus:border-white/30 focus:outline-none transition-colors"
                        style={{ background: "rgba(255,255,255,0.04)" }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Service Type</label>
                      <select
                        required
                        value={formData.serviceType}
                        onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                        className="w-full rounded-xl px-4 py-3 text-sm border border-white/10 focus:border-white/30 focus:outline-none transition-colors appearance-none cursor-pointer"
                        style={{ background: "rgba(255,255,255,0.04)", color: formData.serviceType ? "#f1f5f9" : "#64748b" }}
                      >
                        <option value="" disabled>Select a service...</option>
                        <option value="emergency-lockout" style={{ background: "#1a1a0a" }}>Emergency Lockout</option>
                        <option value="residential" style={{ background: "#1a1a0a" }}>Residential Locksmith</option>
                        <option value="commercial" style={{ background: "#1a1a0a" }}>Commercial Locksmith</option>
                        <option value="automotive" style={{ background: "#1a1a0a" }}>Automotive / Car Key</option>
                        <option value="rekey" style={{ background: "#1a1a0a" }}>Lock Rekey</option>
                        <option value="high-security" style={{ background: "#1a1a0a" }}>High-Security Upgrade</option>
                        <option value="safe" style={{ background: "#1a1a0a" }}>Safe Services</option>
                        <option value="access-control" style={{ background: "#1a1a0a" }}>Access Control</option>
                        <option value="other" style={{ background: "#1a1a0a" }}>Other / Not Sure</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Tell Us More (optional)</label>
                      <textarea
                        rows={3}
                        placeholder="Briefly describe what you need..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 border border-white/10 focus:border-white/30 focus:outline-none transition-colors resize-none"
                        style={{ background: "rgba(255,255,255,0.04)" }}
                      />
                    </div>
                    <MagneticButton
                      className="w-full py-3.5 rounded-full text-sm font-bold text-black flex items-center justify-center gap-2 cursor-pointer"
                      style={{ background: ACCENT } as React.CSSProperties}
                    >
                      <Key size={16} weight="fill" /> Send Request
                    </MagneticButton>
                    <p className="text-xs text-center text-slate-500">For emergencies, call directly: <a href="tel:2062945817" style={{ color: ACCENT }} className="font-semibold">(206) 294-5817</a></p>
                  </form>
                </>
              )}
            </GlassCard>
          </div>
        </div>
      </SectionReveal>

      {/* ─── 10. FOOTER ─── */}
      <footer className="relative z-10 border-t border-white/5 py-8">
        <div className="mx-auto max-w-7xl px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Key size={16} weight="duotone" style={{ color: ACCENT }} />
            <span>SecureKey Locksmith &copy; {new Date().getFullYear()}</span>
          </div>
          <p className="text-xs text-slate-600 flex items-center gap-1.5"><svg width="14" height="14" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-sky-500"><path d="M24.3 4.2c-1.5-.4-3.2.1-4.5 1.1-1-.7-2.3-1-3.5-.8-2.4.4-4.2 2.5-4.2 4.9v.6c-3.2.8-6 2.8-7.8 5.6-.3.5-.1 1.1.4 1.4.5.3 1.1.1 1.4-.4 1.5-2.3 3.7-4 6.3-4.7.5-.1 1-.1 1.5 0 .8.2 1.4.8 1.7 1.5.3.8.2 1.6-.2 2.3l-2.8 4.3c-.6.9-.4 2.1.4 2.8l2.5 2.1c.4.3.8.5 1.3.5h5.2c.5 0 1-.2 1.3-.5l1.2-1c.6-.5.8-1.3.6-2l-1-3.2c-.2-.5 0-1.1.4-1.4l3.8-2.5c1.3-.9 2.1-2.3 2.1-3.9V9.6c0-2.5-1.7-4.7-4.1-5.3v-.1z" fill="currentColor"/></svg>Created by <a href="https://bluejayportfolio.com" target="_blank" rel="noopener noreferrer" style={{textDecoration:"underline"}}>bluejayportfolio.com</a></p>
        </div>
      </footer>
    </main>
  );
}
