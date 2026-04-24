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
  return (<div className={`rounded-2xl border border-white/15 bg-white/[0.08] backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] ${className}`}>{children}</div>);
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
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/15 flex items-center gap-2 cursor-pointer">
                <Phone size={18} weight="duotone" /> (555) 562-KEYS
              </MagneticButton>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ ...spring, delay: 0.95 }} className="flex flex-wrap gap-3">
              <span className="px-4 py-2 rounded-full text-xs font-semibold text-white flex items-center gap-2" style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${ACCENT}40` }}><ShieldCheck size={14} weight="duotone" style={{ color: ACCENT }} />Licensed &amp; Bonded</span>
              <span className="px-4 py-2 rounded-full text-xs font-semibold text-white flex items-center gap-2" style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${ACCENT_LIGHT}40` }}><Star size={14} weight="fill" style={{ color: ACCENT_LIGHT }} />4.9-Star Rated</span>
              <span className="px-4 py-2 rounded-full text-xs font-semibold text-white flex items-center gap-2" style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${ACCENT}40` }}><CheckCircle size={14} weight="duotone" style={{ color: ACCENT }} />Upfront Pricing</span>
              <span className="px-4 py-2 rounded-full text-xs font-semibold text-white flex items-center gap-2" style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${ACCENT_LIGHT}40` }}><Timer size={14} weight="duotone" style={{ color: ACCENT_LIGHT }} />15–30 Min Response</span>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ ...spring, delay: 1 }} className="flex flex-wrap gap-6 text-sm text-slate-400">
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
                    <Phone size={20} weight="duotone" /> Call (555) 562-KEYS
                  </MagneticButton>
                </div>
              </motion.div>
            </div>
          </ShimmerBorder>
        </div>
      </SectionReveal>

      {/* ─── GOOGLE REVIEWS HEADER ─── */}
      <SectionReveal className="relative z-10 py-8">
        <div className="mx-auto max-w-4xl px-4 md:px-6">
          <GlassCard className="px-6 py-5 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
            <div className="flex items-center gap-3">
              <svg width="32" height="32" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
              </svg>
              <div className="text-left">
                <p className="text-sm text-slate-400">Google Reviews</p>
                <p className="text-lg font-bold text-white">Customer Ratings</p>
              </div>
            </div>
            <div className="hidden sm:block w-px h-12 bg-white/10" />
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                {[0,1,2,3,4].map((i) => (<Star key={i} size={20} weight="fill" style={{ color: ACCENT_LIGHT }} />))}
              </div>
              <p className="text-sm text-slate-400"><span className="text-white font-bold">4.9</span> out of 5 &bull; <span className="text-white font-bold">466</span> reviews</p>
            </div>
          </GlassCard>
        </div>
      </SectionReveal>

      {/* ─── 6. TESTIMONIALS ─── */}
      <SectionReveal id="testimonials" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ACCENT }}>Customer Stories</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Trusted When It Matters" />
            </h2>
          </div>
          <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {testimonials.map((t, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="p-6 h-full flex flex-col relative overflow-hidden">
                  <Quotes size={60} weight="fill" style={{ color: ACCENT }} className="absolute -top-2 -right-2 opacity-10" />
                  <Quotes size={28} weight="fill" style={{ color: ACCENT }} className="mb-3 opacity-60" />
                  <p className="text-slate-300 leading-relaxed flex-1 text-sm">{t.text}</p>
                  <div className="mt-4 pt-4 border-t border-white/8 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">{t.name}</span>
                      <CheckCircle size={14} weight="fill" style={{ color: ACCENT }} />
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider">Verified</span>
                    </div>
                    <div className="flex gap-0.5">{Array.from({ length: t.rating }).map((_, j) => (<Star key={j} size={18} weight="fill" style={{ color: ACCENT_LIGHT }} />))}</div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── UPFRONT PRICING ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 60% 40% at 50% 50%, ${ACCENT_GLOW} 0%, transparent 70%)` }} />
        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ACCENT }}>Upfront Pricing</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white"><WordReveal text="No-Surprise Flat Rates" /></h2>
            <p className="text-slate-400 mt-4 max-w-2xl mx-auto">The price we quote on the phone is the price you pay. If we can't help, there's no charge.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "Lockout Service", price: "$89", desc: "Residential or automotive lockout. We'll have you back inside in 15 minutes or less.", features: ["Non-destructive entry", "All residential + most vehicles", "No damage guarantee", "24/7 dispatch"], highlight: false },
              { name: "Rekey & New Keys", price: "$149", desc: "Rekey every lock on the property to a single key — or cut a new set for the family.", features: ["Up to 5 locks rekeyed", "New master key included", "Same-day turnaround", "Smart lock compatible"], highlight: true },
              { name: "Commercial Security", price: "Custom", desc: "Master key systems, access control, panic bars, and high-security cylinders for business.", features: ["On-site security audit", "Master key hierarchy", "HID / Schlage certified", "Service agreement available"], highlight: false },
            ].map((tier, i) => (
              <div key={i} className={`relative rounded-2xl ${tier.highlight ? 'p-[2px]' : ''}`} style={tier.highlight ? { background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_LIGHT})` } : {}}>
                {tier.highlight && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-black" style={{ background: ACCENT }}>Most Popular</div>}
                <GlassCard className="p-6 h-full">
                  <h3 className="text-xl font-bold text-white">{tier.name}</h3>
                  <p className="text-xs text-slate-400 mt-1">{tier.desc}</p>
                  <div className="mt-6 flex items-end gap-1">
                    <span className="text-5xl font-black text-white">{tier.price}</span>
                    {tier.price !== "Custom" && <span className="text-sm text-slate-400 mb-2">flat</span>}
                  </div>
                  <ul className="mt-6 space-y-3">
                    {tier.features.map((f, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-slate-300">
                        <CheckCircle size={18} weight="fill" style={{ color: tier.highlight ? ACCENT_LIGHT : ACCENT }} className="shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <button className="mt-6 w-full px-6 py-3 rounded-full text-sm font-semibold" style={{ background: tier.highlight ? ACCENT : "rgba(255,255,255,0.05)", color: tier.highlight ? "#000" : "#fff", border: tier.highlight ? "none" : "1px solid rgba(255,255,255,0.1)" }}>Call Now</button>
                </GlassCard>
              </div>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ─── VIDEO PLACEHOLDER ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ACCENT }}>The Shop</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white"><WordReveal text="Meet Our Locksmiths" /></h2>
          </div>
          <div className="relative rounded-2xl overflow-hidden aspect-video group cursor-pointer">
            <img src="https://plus.unsplash.com/premium_photo-1683133675826-09631f7e36e2?w=1600&q=80" alt="Locksmith van and shop tour" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div className="w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center shadow-2xl" style={{ background: ACCENT } as React.CSSProperties} animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
                <svg width="28" height="32" viewBox="0 0 24 28" fill="white" className="ml-1">
                  <path d="M0 0L24 14L0 28Z" />
                </svg>
              </motion.div>
            </div>
            <div className="absolute bottom-6 left-6 right-6">
              <p className="text-xs uppercase tracking-widest" style={{ color: ACCENT_LIGHT }}>Mobile Shop Tour &bull; 2:18</p>
              <p className="text-xl md:text-2xl font-bold text-white mt-1">See how we cut keys + rekey deadbolts right from the van.</p>
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* ─── QUIZ ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="relative z-10 mx-auto max-w-5xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ACCENT }}>Quick Triage</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white"><WordReveal text="What's The Situation?" /></h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { color: "#ef4444", label: "Locked Out", detail: "Stuck outside your home, car, or office right now.", rec: "Emergency Lockout — 15 min response", icon: Lock },
              { color: ACCENT, label: "Moving In / Out", detail: "Just bought a home or moved tenants — need all locks rekeyed.", rec: "Rekey Package + Master Key", icon: House },
              { color: ACCENT_LIGHT, label: "Business Upgrade", detail: "Access control, master keys, keypad or smart-lock upgrade.", rec: "Commercial Security Audit", icon: ShieldCheck },
            ].map((opt, i) => (
              <GlassCard key={i} className="p-6 h-full flex flex-col items-start relative overflow-hidden group cursor-pointer">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: `radial-gradient(circle at 50% 0%, ${opt.color}22, transparent 60%)` }} />
                <div className="relative w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: `${opt.color}22` }}>
                  <opt.icon size={22} weight="duotone" style={{ color: opt.color }} />
                </div>
                <p className="relative text-xs uppercase tracking-widest font-bold" style={{ color: opt.color }}>{opt.label}</p>
                <p className="relative text-sm text-slate-300 mt-2 leading-relaxed flex-1">{opt.detail}</p>
                <div className="relative mt-6 pt-4 border-t border-white/15 w-full">
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-1">Dispatch</p>
                  <p className="text-sm font-semibold text-white">{opt.rec}</p>
                </div>
              </GlassCard>
            ))}
          </div>
          <div className="text-center mt-8">
            <MagneticButton className="px-10 py-4 rounded-full text-base font-semibold text-black inline-flex items-center gap-2 cursor-pointer" style={{ background: ACCENT } as React.CSSProperties}>
              <Phone size={18} weight="duotone" /> Call Dispatch Now
            </MagneticButton>
          </div>
        </div>
      </SectionReveal>

      {/* ─── COMPETITOR COMPARISON ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ACCENT }}>The Difference</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white"><WordReveal text="Us vs. The Scam Locksmith" /></h2>
          </div>
          <GlassCard className="overflow-hidden">
            <div className="grid grid-cols-[1.5fr_1fr_1fr] items-center border-b border-white/15">
              <div className="p-4 md:p-6 text-xs uppercase tracking-widest text-slate-400">What Matters</div>
              <div className="p-4 md:p-6 text-center" style={{ background: `${ACCENT}15` }}>
                <p className="text-sm md:text-base font-bold" style={{ color: ACCENT_LIGHT }}>Our Shop</p>
              </div>
              <div className="p-4 md:p-6 text-center">
                <p className="text-sm md:text-base font-semibold text-slate-400">Google Ad Scam</p>
              </div>
            </div>
            {[
              { feature: "Real local address + shop", us: "Shop + mobile vans", them: "Call center overseas" },
              { feature: "Bonded + insured locksmiths", us: "Always", them: "Rarely" },
              { feature: "Upfront flat-rate pricing", us: "Before arrival", them: "$19 bait, $500 surprise" },
              { feature: "Non-destructive entry", us: "Standard", them: "Drill first, bill later" },
              { feature: "Background-checked techs", us: "Every tech", them: "Unknown" },
              { feature: "24/7 live dispatch", us: "Local team", them: "Unclear" },
              { feature: "Written invoice + warranty", us: "Always", them: "Cash only" },
            ].map((row, i) => (
              <div key={i} className="grid grid-cols-[1.5fr_1fr_1fr] items-center border-b border-white/8 last:border-b-0">
                <div className="p-4 md:p-6 text-sm text-white">{row.feature}</div>
                <div className="p-4 md:p-6 text-center" style={{ background: `${ACCENT}08` }}>
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle size={18} weight="fill" style={{ color: ACCENT }} />
                    <span className="text-sm text-white font-semibold hidden sm:inline">{row.us}</span>
                  </div>
                </div>
                <div className="p-4 md:p-6 text-center text-sm text-slate-500 italic">{row.them}</div>
              </div>
            ))}
          </GlassCard>
        </div>
      </SectionReveal>

      {/* ─── CERTIFICATIONS ─── */}
      <SectionReveal className="relative z-10 py-8">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <p className="text-center text-xs uppercase tracking-widest text-slate-500 mb-6">Certifications &amp; Partners</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {[
              { label: "ALOA Certified", icon: Certificate },
              { label: "State Licensed", icon: ShieldCheck },
              { label: "BBB A+", icon: Star },
              { label: "HID Partner", icon: Medal },
              { label: "Schlage Pro", icon: CheckCircle },
              { label: "Bonded + Insured", icon: Lock },
            ].map((cert, i) => (
              <GlassCard key={i} className="px-4 py-3 flex items-center gap-2 justify-center">
                <cert.icon size={18} weight="duotone" style={{ color: i % 2 === 0 ? ACCENT : ACCENT_LIGHT }} />
                <span className="text-xs font-semibold text-slate-300">{cert.label}</span>
              </GlassCard>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ─── SERVICE AREA ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ACCENT }}>Coverage</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white"><WordReveal text="Where We Dispatch" /></h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <GlassCard className="p-6 text-center">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: ACCENT_GLOW }}>
                <MapPin size={26} weight="duotone" style={{ color: ACCENT }} />
              </div>
              <p className="text-xs uppercase tracking-widest mb-2" style={{ color: ACCENT_LIGHT }}>Coverage Radius</p>
              <p className="text-3xl font-black text-white">45 Miles</p>
              <p className="text-sm text-slate-400 mt-2">Metro, suburbs, and interstate corridors. Multiple vans staged for coverage around the clock.</p>
            </GlassCard>
            <GlassCard className="p-6 text-center">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: ACCENT_GLOW }}>
                <Timer size={26} weight="duotone" style={{ color: ACCENT_LIGHT }} />
              </div>
              <p className="text-xs uppercase tracking-widest mb-2" style={{ color: ACCENT_LIGHT }}>Response Time</p>
              <p className="text-3xl font-black text-white">15–30 Min</p>
              <p className="text-sm text-slate-400 mt-2">Emergency lockouts dispatched immediately from the closest van. Scheduled work booked same-day.</p>
            </GlassCard>
            <GlassCard className="p-6 text-center">
              <div className="relative w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: ACCENT_GLOW }}>
                <motion.div className="absolute inset-0 rounded-full" style={{ background: ACCENT }} animate={{ scale: [1, 1.6, 1], opacity: [0.4, 0, 0.4] }} transition={{ duration: 2, repeat: Infinity }} />
                <CheckCircle size={26} weight="duotone" style={{ color: ACCENT }} className="relative" />
              </div>
              <p className="text-xs uppercase tracking-widest mb-2" style={{ color: ACCENT_LIGHT }}>Availability</p>
              <p className="text-3xl font-black text-white">24/7 Live</p>
              <p className="text-sm text-slate-400 mt-2">Live local dispatcher, not a call center. Holidays, weekends, 3 AM — we answer.</p>
            </GlassCard>
          </div>
        </div>
      </SectionReveal>

      {/* ─── 7. SERVICE AREAS ─── */}
      <SectionReveal id="areas" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ACCENT }}>Coverage</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Service Areas" />
            </h2>
          </div>
          <motion.div className="grid grid-cols-2 sm:grid-cols-4 gap-4" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {serviceAreas.map((area, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="p-4 text-center">
                  <MapPin size={20} weight="duotone" style={{ color: ACCENT }} className="mx-auto mb-2" />
                  <p className="text-sm font-semibold text-white">{area}</p>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
          <p className="text-center text-sm text-slate-400 mt-6">
            <CheckCircle size={16} weight="duotone" style={{ color: ACCENT }} className="inline mr-1 -mt-0.5" />
            Plus surrounding communities within a 30-mile radius
          </p>
        </div>
      </SectionReveal>

      {/* ─── 8. FAQ ─── */}
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

      {/* ─── 9. CONTACT ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white mb-6">
                <WordReveal text="Need a Locksmith? Call Us Now." />
              </h2>
              <p className="text-slate-400 leading-relaxed max-w-md mb-8">
                Whether it is an emergency lockout or a planned security upgrade, we are here to help. Upfront pricing, no hidden fees, satisfaction guaranteed.
              </p>
              <div className="flex flex-wrap gap-4">
                <MagneticButton className="px-10 py-4 rounded-full text-base font-semibold text-black inline-flex items-center gap-2 cursor-pointer" style={{ background: ACCENT } as React.CSSProperties}>
                  <Phone size={20} weight="duotone" /> Call Now
                </MagneticButton>
                <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/15 flex items-center gap-2 cursor-pointer">
                  <CalendarCheck size={18} weight="duotone" /> Schedule Service
                </MagneticButton>
              </div>
            </div>
            <GlassCard className="p-8">
              <h3 className="text-xl font-semibold text-white mb-6">Contact Info</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <MapPin size={20} weight="duotone" style={{ color: ACCENT }} className="mt-0.5 shrink-0" />
                  <div><p className="text-sm font-semibold text-white">Location</p><p className="text-sm text-slate-400">789 Security Lane<br />Denver, CO 80202</p></div>
                </div>
                <div className="flex items-start gap-4">
                  <Phone size={20} weight="duotone" style={{ color: ACCENT }} className="mt-0.5 shrink-0" />
                  <div><p className="text-sm font-semibold text-white">Phone</p><p className="text-sm text-slate-400">(555) 562-KEYS (5397)</p></div>
                </div>
                <div className="flex items-start gap-4">
                  <Clock size={20} weight="duotone" style={{ color: ACCENT }} className="mt-0.5 shrink-0" />
                  <div><p className="text-sm font-semibold text-white">Hours</p><p className="text-sm text-slate-400">Emergency: 24/7/365<br />Office: Mon-Sat 8am-8pm</p></div>
                </div>
                <div className="flex items-start gap-4">
                  <Warning size={20} weight="duotone" style={{ color: ACCENT }} className="mt-0.5 shrink-0" />
                  <div><p className="text-sm font-semibold text-white">Emergency</p><p className="text-sm text-slate-400">Locked out? Call us now.<br />15-30 min average response.</p></div>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </SectionReveal>

      {/* ─── FINAL CTA ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-4 md:px-6">
          <GlassCard className="p-8 md:p-12 text-center">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ACCENT }}>Locked Out? Need Help?</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white mb-4">Call The Locksmith You Can Trust</h2>
            <p className="text-slate-400 text-lg mb-8 max-w-lg mx-auto">Real local shop. Real techs. Real upfront pricing. No middle-man dispatchers, no hidden fees, no drilling unless it is the last option.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <MagneticButton className="px-10 py-4 rounded-full text-base font-semibold text-black inline-flex items-center gap-2 cursor-pointer" style={{ background: ACCENT } as React.CSSProperties}>
                <Phone size={20} weight="duotone" /> Call Dispatch
              </MagneticButton>
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/15 inline-flex items-center gap-2 cursor-pointer">
                <CalendarCheck size={18} weight="duotone" /> Schedule Non-Emergency
              </MagneticButton>
            </div>
            <p className="mt-6 text-xs text-slate-500">Licensed &bull; Bonded &bull; Insured &bull; 24/7/365 Dispatch</p>
          </GlassCard>
        </div>
      </SectionReveal>

      {/* ─── KEY & LOCK TYPES WE SERVICE ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ACCENT }}>What We Handle</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white"><WordReveal text="Every Lock, Every Key" /></h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: "Residential Locks", desc: "Deadbolts, knob locks, smart locks, and high-security cylinders." },
              { name: "Automotive Keys", desc: "Transponders, smart keys, and fob programming for all makes." },
              { name: "Safe & Vault", desc: "Combination resets, safe opening, and commercial vault service." },
              { name: "Smart Home", desc: "August, Schlage Encode, and Yale smart lock installs + setup." },
              { name: "Master Key Systems", desc: "Hierarchical keying so the right people access the right doors." },
              { name: "Access Control", desc: "Keypads, fobs, and smartphone access for homes + businesses." },
              { name: "Panic Hardware", desc: "Commercial exit devices that meet public-building fire codes." },
              { name: "Safe Combination Reset", desc: "Reset dial, electronic keypad, or biometric safes." },
              { name: "Lock Rekey", desc: "Change the pins in existing locks so old keys no longer work — faster than replacing." },
              { name: "High-Security Locks", desc: "Medeco, Mul-T-Lock, and Assa cylinders with restricted keys that cannot be duplicated without authorization." },
              { name: "Smart Home Integration", desc: "Tie smart locks into Alexa, Google Home, and smartphone apps so you can lock up from anywhere." },
              { name: "Lockbox + Key Safe", desc: "Outdoor key safes for contractors, babysitters, and short-term guests." },
              { name: "Door Hardware Replacement", desc: "Hinges, strike plates, and reinforced plates that make break-ins much harder." },
            ].map((svc, i) => (
              <GlassCard key={i} className="p-5">
                <p className="text-sm font-bold text-white">{svc.name}</p>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">{svc.desc}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ─── GUARANTEES ─── */}
      <SectionReveal className="relative z-10 py-16">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="text-center mb-10">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ACCENT }}>Our Promise</p>
            <h2 className="text-3xl md:text-4xl tracking-tighter font-bold text-white"><WordReveal text="Four Guarantees You Can Hold Us To" /></h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { title: "Upfront Pricing", desc: "The number we quote on the phone is the number on your invoice.", icon: CheckCircle },
              { title: "No Damage Entry", desc: "Non-destructive lockout techniques on 99% of jobs. If we drill, we replace free.", icon: ShieldCheck },
              { title: "Lifetime Key Warranty", desc: "Keys we cut are warrantied forever. Bring them back if they ever fail.", icon: Medal },
              { title: "Background-Checked Techs", desc: "Every tech fingerprinted, background-checked, and uniformed.", icon: Certificate },
            ].map((item, i) => (
              <GlassCard key={i} className="p-5 text-center">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: ACCENT_GLOW }}>
                  <item.icon size={22} weight="duotone" style={{ color: ACCENT }} />
                </div>
                <p className="text-sm font-bold text-white">{item.title}</p>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{item.desc}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ─── COMMERCIAL FOCUS ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ACCENT }}>Commercial Security</p>
              <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white mb-6"><WordReveal text="For Businesses & Property Managers" /></h2>
              <p className="text-slate-300 leading-relaxed mb-8">Master key systems, access control, panic hardware, and 24/7 service contracts for retail, office, and multifamily. On-site security audits free with service contract signup.</p>
              <div className="space-y-3">
                {[
                  { label: "Master Key Systems", desc: "Hierarchical keying so managers access all, tenants access only theirs." },
                  { label: "Access Control", desc: "Keypad, fob, and smartphone access across all doors with reporting." },
                  { label: "Panic Hardware", desc: "Commercial door exit devices that meet code for public buildings." },
                  { label: "Service Contracts", desc: "Priority response, annual inspections, and replacement discounts." },
                ].map((item, i) => (
                  <GlassCard key={i} className="p-4 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold" style={{ background: ACCENT_GLOW, color: ACCENT }}>{i + 1}</div>
                    <div>
                      <p className="text-sm font-semibold text-white">{item.label}</p>
                      <p className="text-xs text-slate-400 mt-1">{item.desc}</p>
                    </div>
                  </GlassCard>
                ))}
              </div>
            </div>
            <div className="relative rounded-2xl overflow-hidden aspect-[4/5]">
              <img src="https://images.unsplash.com/photo-1641209678164-a2eb4b565f60?w=900&q=80" alt="Commercial lock and security panel install" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <p className="text-xs uppercase tracking-widest" style={{ color: ACCENT_LIGHT }}>Commercial Project</p>
                <p className="text-xl font-bold text-white mt-1">HID Access Control + Master Key</p>
              </div>
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* ─── EXTENDED FAQ ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4 md:px-6">
          <div className="text-center mb-10">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ACCENT }}>Quick Answers</p>
            <h2 className="text-3xl md:text-4xl tracking-tighter font-bold text-white"><WordReveal text="FAQ" /></h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { q: "How quickly can you arrive?", a: "Most emergency lockouts receive a tech within 15–30 minutes. Standard scheduling fits same-day or next-morning." },
              { q: "Do you work with landlords + property managers?", a: "Yes — preferred vendor contracts, volume discounts, and priority response for multi-property portfolios." },
              { q: "Can you rekey without changing locks?", a: "Absolutely. Rekeying swaps the inner pins to a new key without replacing the hardware. Faster and much cheaper." },
              { q: "What payment do you accept?", a: "All major credit cards, Apple/Google Pay, cash, business checks, and insurance-direct billing on covered jobs." },
            ].map((faq, i) => (
              <GlassCard key={i} className="p-5">
                <p className="text-sm font-bold text-white mb-2">{faq.q}</p>
                <p className="text-sm text-slate-400 leading-relaxed">{faq.a}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ─── 10. FOOTER ─── */}
      <footer className="relative z-10 border-t border-white/8 py-8">
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
