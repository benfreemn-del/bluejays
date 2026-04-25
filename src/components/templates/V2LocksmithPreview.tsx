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
  LockKey,
  Key,
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
  Warning,
  Car,
  Play,
  NavigationArrow,
  Lock,
  Shield,
  Fingerprint,
  Vault,
} from "@phosphor-icons/react";
import type { GeneratedSiteData } from "@/lib/generator";
import BluejayLogo from "../BluejayLogo";
import { MapLink, PhoneLink } from "@/components/templates/MapLink";
import ClaimBanner from "@/components/ClaimBanner";
import { pickFromPool, pickGallery } from "@/lib/stock-image-picker";

const spring = { type: "spring" as const, stiffness: 100, damping: 20 };
const springFast = { type: "spring" as const, stiffness: 200, damping: 25 };

const CHARCOAL = "#1a1a1a";
const DEFAULT_YELLOW = "#eab308";
const YELLOW_LIGHT = "#fde047";
const WARM_ACCENT = "#b45309";

function getAccent(accentColor?: string) {
  const c = accentColor || DEFAULT_YELLOW;
  return {
    ACCENT: c,
    ACCENT_GLOW: `${c}26`,
    ACCENT_LIGHT: YELLOW_LIGHT,
    WARM: WARM_ACCENT,
  };
}

// Rotating palette so service/type card tiles feel alive instead of
// monochrome. Brand ACCENT still drives headers, CTAs, borders.
const PALETTE = ["#eab308", "#10b981", "#ef4444", "#64748b", "#b45309", "#f59e0b"];
const pickPaletteColor = (i: number) => PALETTE[i % PALETTE.length];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SERVICE_ICON_MAP: Record<string, any> = {
  lockout: LockKey,
  rekey: Key,
  key: Key,
  lock: LockKey,
  deadbolt: Lock,
  commercial: Buildings,
  residential: HouseLine,
  auto: Car,
  car: Car,
  emergency: Warning,
  safe: Vault,
  access: Fingerprint,
  master: Key,
  install: Lock,
  security: Shield,
};

function getServiceIcon(n: string) {
  const l = n.toLowerCase();
  for (const [k, I] of Object.entries(SERVICE_ICON_MAP)) {
    if (l.includes(k)) return I;
  }
  return LockKey;
}

const STOCK_HERO_POOL = [
  "https://images.unsplash.com/photo-1558002038-1055907df827?w=1400&q=80",
];
const STOCK_ABOUT_POOL = [
  "https://images.unsplash.com/photo-1558002038-1055907df827?w=600&q=80",
];
const STOCK_GALLERY = [
  "https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=600&q=80",
  "https://images.unsplash.com/photo-1558002038-1055907df827?w=600&q=80",
  "https://images.unsplash.com/photo-1582139329536-e7284fece509?w=600&q=80",
  "https://images.unsplash.com/photo-1582139329536-e7284fece509?w=600&q=80",
];

/* ── decorative backgrounds ── */

function FloatingParticles({ accent }: { accent: string }) {
  const particles = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 8,
    duration: 5 + Math.random() * 7,
    size: 2 + Math.random() * 3,
    opacity: 0.12 + Math.random() * 0.25,
    isWarm: Math.random() > 0.6,
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
            background: p.isWarm ? WARM_ACCENT : accent,
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

function KeyLockPattern({ opacity = 0.03, accent }: { opacity?: number; accent: string }) {
  const patternId = `keylockV2-${accent.replace("#", "")}`;
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }}>
      <defs>
        <pattern id={patternId} width="80" height="80" patternUnits="userSpaceOnUse">
          <circle cx="40" cy="25" r="8" fill="none" stroke={accent} strokeWidth="0.5" opacity="0.2" />
          <rect x="37" y="33" width="6" height="12" rx="1" fill="none" stroke={accent} strokeWidth="0.4" opacity="0.2" />
          <circle cx="15" cy="60" r="3" fill={accent} opacity="0.1" />
          <circle cx="65" cy="55" r="2" fill={WARM_ACCENT} opacity="0.1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  );
}

function SecurityTrail({ opacity = 0.03, accent }: { opacity?: number; accent: string }) {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }} viewBox="0 0 1000 600" preserveAspectRatio="none">
      <motion.path d="M100 0 Q120 100 100 200 Q80 300 100 400 Q120 500 100 600" fill="none" stroke={accent} strokeWidth="2" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} />
      <motion.path d="M800 0 Q780 150 800 300 Q820 450 800 600" fill="none" stroke={WARM_ACCENT} strokeWidth="1.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }} />
    </svg>
  );
}

/* ── shared UI components ── */

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-white/15 bg-white/[0.08] backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] ${className}`}>{children}</div>;
}

function MagneticButton({ children, className = "", onClick, style, href }: { children: React.ReactNode; className?: string; onClick?: () => void; style?: React.CSSProperties; href?: string }) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, springFast);
  const springY = useSpring(y, springFast);
  const isTouchDevice = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
  const handleMouseMove = useCallback((e: React.MouseEvent) => { if (!ref.current || isTouchDevice) return; const rect = ref.current.getBoundingClientRect(); x.set((e.clientX - (rect.left + rect.width / 2)) * 0.25); y.set((e.clientY - (rect.top + rect.height / 2)) * 0.25); }, [x, y, isTouchDevice]);
  const handleMouseLeave = useCallback(() => { x.set(0); y.set(0); }, [x, y]);
  if (href) return <motion.a href={href} ref={ref as unknown as React.Ref<HTMLAnchorElement>} style={{ x: springX, y: springY, willChange: "transform", ...style }} onMouseMove={handleMouseMove as unknown as React.MouseEventHandler<HTMLAnchorElement>} onMouseLeave={handleMouseLeave} className={className} whileTap={{ scale: 0.97 }}>{children}</motion.a>;
  return <motion.button ref={ref} style={{ x: springX, y: springY, willChange: "transform", ...style }} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} onClick={onClick} className={className} whileTap={{ scale: 0.97 }}>{children}</motion.button>;
}

function ShimmerBorder({ children, className = "", accent }: { children: React.ReactNode; className?: string; accent: string }) {
  return (
    <div className={`relative rounded-2xl p-[1px] overflow-hidden ${className}`}>
      <motion.div className="absolute inset-0 rounded-2xl" style={{ background: `conic-gradient(from 0deg, transparent, ${accent}, transparent, ${WARM_ACCENT}, transparent)`, willChange: "transform" }} animate={{ rotate: [0, 360] }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} />
      <div className="relative rounded-2xl bg-[#141414] z-10">{children}</div>
    </div>
  );
}

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

/* ── constants ── */

const SERVICE_TYPES = [
  { icon: HouseLine, title: "Residential", desc: "Home lockouts, rekeying, deadbolt installation, lock repair, smart locks", color: "#22c55e" },
  { icon: Buildings, title: "Commercial", desc: "Master key systems, access control, high-security locks, panic bars", color: "#3b82f6" },
  { icon: Car, title: "Automotive", desc: "Car lockouts, key duplication, transponder programming, ignition repair", color: "#f59e0b" },
];

const LOCK_SERVICES = [
  { icon: LockKey, title: "Emergency Lockout", desc: "Locked out? We arrive in 15-30 minutes, 24/7", urgent: true },
  { icon: Key, title: "Key Duplication", desc: "Standard, high-security, and transponder key copies" },
  { icon: Lock, title: "Lock Rekeying", desc: "Change your locks without replacing them — new keys, same hardware" },
  { icon: Shield, title: "Deadbolt Installation", desc: "Grade 1 and Grade 2 deadbolts for maximum security" },
  { icon: Fingerprint, title: "Smart Lock Install", desc: "Keypad, fingerprint, and Bluetooth smart locks" },
  { icon: Vault, title: "Safe Services", desc: "Safe opening, combination changes, and installation" },
];

const SECURITY_CHECKLIST = [
  { item: "Front door deadbolt grade", good: "Grade 1 or 2", bad: "No deadbolt" },
  { item: "Back/side door locks", good: "Keyed deadbolts", bad: "Knob locks only" },
  { item: "Window locks", good: "Pin locks installed", bad: "Standard latches" },
  { item: "Garage entry", good: "Deadbolt + smart lock", bad: "No lock on interior door" },
  { item: "Key control", good: "Restricted keyway", bad: "Standard keys, anyone can copy" },
];

const COMPARISON_ROWS = [
  { feature: "24/7 Emergency Response", us: true, them: "Business Hours" },
  { feature: "15-30 Min Response Time", us: true, them: "1-3 Hours" },
  { feature: "Upfront Flat-Rate Pricing", us: true, them: "Hourly + Surprise Fees" },
  { feature: "Licensed & Background Checked", us: true, them: "Varies" },
  { feature: "All Lock Brands & Types", us: true, them: "Limited" },
  { feature: "Written Warranty on All Work", us: true, them: "No" },
  { feature: "No Damage Guarantee", us: true, them: "No" },
];

const PRICING_TIERS = [
  {
    title: "Lockout Service",
    price: "$75",
    subtitle: "starting at",
    features: ["15-30 min response", "No damage entry", "All lock types", "24/7 availability"],
  },
  {
    title: "Rekey / New Locks",
    price: "$89",
    subtitle: "per lock",
    popular: true,
    features: ["Same-day service", "All major brands", "New keys included", "Security assessment", "Written warranty"],
  },
  {
    title: "Security Upgrade",
    price: "$199",
    subtitle: "starting at",
    features: ["Deadbolt installation", "Smart lock setup", "Full security audit", "Grade 1 hardware", "Extended warranty", "Key control system"],
  },
];

/* ── main component ── */

export default function V2LocksmithPreview({ data }: { data: GeneratedSiteData }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const { ACCENT, ACCENT_GLOW } = getAccent(data.accentColor);
  const uniquePhotos = data.photos ? [...new Set(data.photos)] : [];
  const heroImage = uniquePhotos[0] || pickFromPool(STOCK_HERO_POOL, data.businessName);
  const heroCardImage = uniquePhotos[1] || pickFromPool(STOCK_ABOUT_POOL, data.businessName);
  const aboutImage = uniquePhotos[2] || pickFromPool(STOCK_ABOUT_POOL, data.businessName);
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
    { step: "01", title: "Call Us 24/7", desc: "Describe your lock situation — we'll dispatch a technician immediately." },
    { step: "02", title: "Fast Arrival", desc: "Our licensed locksmith arrives in 15-30 minutes with a fully stocked van." },
    { step: "03", title: "Upfront Quote", desc: "We assess the situation and give you a flat-rate price before any work begins." },
    { step: "04", title: "Problem Solved", desc: "Expert service with zero damage. We test everything and clean up before leaving." },
  ];

  const faqs = [
    { q: "How fast can you get here for a lockout?", a: `${data.businessName} typically arrives within 15-30 minutes for emergency lockouts. We operate 24/7, including holidays and weekends.` },
    { q: "Will you damage my lock or door?", a: "No. Our licensed technicians use non-destructive entry techniques whenever possible. In the rare case a lock must be drilled, we'll discuss it with you first and replace it at a fair price." },
    { q: "Can you make keys for any car?", a: "Yes, we service all major car brands. Our mobile units carry key blanks, transponder chips, and programming equipment for most vehicles on the road today." },
    { q: "Should I rekey or replace my locks?", a: "Rekeying is the most cost-effective option when your locks are in good condition but you need new keys (new home, lost keys, employee turnover). Replacement is recommended for old, worn, or low-security locks." },
    { q: `Is ${data.businessName} licensed and insured?`, a: `Absolutely. ${data.businessName} is fully licensed, bonded, and insured. All our technicians are background-checked and carry proper identification.` },
  ];

  const fallbackTestimonials = [
    { name: "Angela P.", text: "Locked out at 11 PM and they were here in 20 minutes. Professional, fast, and fair price. This is my go-to locksmith now.", rating: 5 },
    { name: "Mark S.", text: "Rekeyed our entire office after an employee left. Done in one afternoon, new master key system works perfectly. Highly recommend.", rating: 5 },
    { name: "Lisa C.", text: "Installed smart locks on all our doors. Clean work, great advice on security, and they showed us how to use everything. Five stars.", rating: 5 },
  ];

  const testimonials = data.testimonials?.length > 0 ? data.testimonials : fallbackTestimonials;

  const quizOptions = [
    { label: "Locked Out Right Now", emoji: "🚨", color: "#ef4444", result: "Call us immediately! We'll have a technician at your door in 15-30 minutes." },
    { label: "Need New Locks / Rekey", emoji: "🔑", color: "#f59e0b", result: "Schedule a visit and we'll handle the rekeying or installation same-day." },
    { label: "Security Upgrade", emoji: "🛡️", color: "#22c55e", result: "Book a free security assessment. We'll evaluate your property and recommend the right upgrades." },
  ];

  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden" style={{ fontFamily: "Inter, system-ui, sans-serif", background: CHARCOAL, color: "#f1f5f9" }}>
      <FloatingParticles accent={ACCENT} />

      {/* ── NAV ── */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-4">
          <GlassCard className="flex items-center justify-between px-4 md:px-6 py-3">
            <div className="flex items-center gap-2">
              <LockKey size={24} weight="fill" style={{ color: ACCENT }} />
              <span className="text-lg font-bold tracking-tight text-white">{data.businessName}</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
              <a href="#services" className="hover:text-white transition-colors">Services</a>
              <a href="#about" className="hover:text-white transition-colors">About</a>
              <a href="#security" className="hover:text-white transition-colors">Security</a>
              <a href="#contact" className="hover:text-white transition-colors">Contact</a>
            </div>
            <div className="flex items-center gap-3">
              <MagneticButton href={`tel:${phoneDigits}`} className="px-4 md:px-5 py-2 rounded-full text-sm font-semibold text-white transition-colors cursor-pointer flex items-center gap-1.5" style={{ background: ACCENT } as React.CSSProperties}>
                <Phone size={14} weight="fill" /> Call Now
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
                  {[{ label: "Services", href: "#services" }, { label: "About", href: "#about" }, { label: "Security", href: "#security" }, { label: "Contact", href: "#contact" }].map((link) => (
                    <a key={link.label} href={link.href} onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors">{link.label}</a>
                  ))}
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* ── 1. HERO ── */}
      <section className="relative min-h-[100dvh] flex items-center pt-24 z-10 overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImage} alt={data.businessName} className="w-full h-full object-cover object-center" />
          <div className="absolute inset-0 bg-black/70" />
        </div>
        <KeyLockPattern opacity={0.04} accent={ACCENT} />
        <SecurityTrail opacity={0.04} accent={ACCENT} />
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full blur-[200px] pointer-events-none" style={{ background: `${ACCENT}08` }} />
        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          <div className="space-y-8">
            <div>
              <p className="text-sm uppercase tracking-widest mb-4" style={{ color: ACCENT }}>Licensed Locksmith — 24/7</p>
              <h1 className="text-3xl md:text-6xl tracking-tighter leading-none font-bold text-white" style={{ textShadow: "0 2px 20px rgba(0,0,0,0.8), 0 4px 40px rgba(0,0,0,0.5)" }}>
                {data.tagline}
              </h1>
            </div>
            <p className="text-lg text-white/80 max-w-md leading-relaxed" style={{ textShadow: "0 1px 8px rgba(0,0,0,0.6)" }}>
              {(() => { const t = data.about; if (t.length <= 180) return t; const dot = t.indexOf(".", 80); return dot > 0 && dot < 220 ? t.slice(0, dot + 1) : t.slice(0, 180).trim() + "..."; })()}
            </p>
            <div className="flex flex-wrap gap-4">
              <MagneticButton href={`tel:${phoneDigits}`} className="px-8 py-4 rounded-full text-base font-semibold text-white flex items-center gap-2 cursor-pointer" style={{ background: ACCENT } as React.CSSProperties}>
                <Phone size={18} weight="fill" /> Call Now <ArrowRight size={18} weight="bold" />
              </MagneticButton>
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/15 flex items-center gap-2 cursor-pointer">
                <Shield size={18} weight="duotone" /> Free Security Assessment
              </MagneticButton>
            </div>
            <div className="flex flex-wrap gap-3">
              {["24/7 Emergency", data.googleRating ? `${data.googleRating}-Star Rated` : "5-Star Rated", "15-Min Response"].map((badge) => (
                <span key={badge} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border backdrop-blur-md" style={{ color: ACCENT, borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}>
                  <CheckCircle size={14} weight="fill" /> {badge}
                </span>
              ))}
            </div>
          </div>
          <div className="hidden md:block relative">
            <div className="relative rounded-2xl overflow-hidden border border-white/15">
              <img src={heroCardImage} alt={`${data.businessName} locksmith service`} className="w-full h-[500px] object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6">
                <div className="px-4 py-2 rounded-full backdrop-blur-md bg-black/50 border flex items-center gap-2" style={{ borderColor: `${ACCENT}4d` }}>
                  <LockKey size={18} weight="fill" style={{ color: ACCENT }} />
                  <span className="text-sm font-semibold text-white">Licensed & Bonded</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. EMERGENCY LOCKOUT INDICATOR ── */}
      <section className="relative z-10 py-6 overflow-hidden border-y" style={{ borderColor: `${ACCENT}1a` }}>
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a0e08 0%, #1a1a1a 100%)" }} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-4 h-4 rounded-full animate-ping absolute" style={{ background: "#ef444480" }} />
                <div className="w-4 h-4 rounded-full relative" style={{ background: "#ef4444" }} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Locked Out? We&apos;re On Our Way.</h3>
                <p className="text-sm text-slate-400">Average response time: <strong className="text-white">15-30 minutes</strong> — 24 hours a day, 7 days a week</p>
              </div>
            </div>
            <MagneticButton href={`tel:${phoneDigits}`} className="px-6 py-3 rounded-full text-sm font-semibold text-white cursor-pointer whitespace-nowrap flex items-center gap-2" style={{ background: "#ef4444" } as React.CSSProperties}>
              <Phone size={16} weight="fill" /> Emergency Lockout
            </MagneticButton>
          </div>
        </div>
      </section>

      {/* ── 3. RESPONSE TIME BADGE + STATS ── */}
      <section className="relative z-10 py-16 overflow-hidden border-b" style={{ borderColor: `${ACCENT}1a` }}>
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #120e08 100%)" }} />
        <KeyLockPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {data.stats.map((stat, i) => {
              const statIcons = [LockKey, Clock, Star, ShieldCheck];
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

      {/* ── 4. SERVICE TYPES (Residential / Commercial / Auto) ── */}
      <section id="services" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0a0e18 50%, #1a1a1a 100%)" }} />
        <KeyLockPattern accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Service Types" title="Residential, Commercial & Auto" subtitle="One call handles it all — no matter what kind of lock, key, or security system you need." accent={ACCENT} />
          <div className="grid md:grid-cols-3 gap-6">
            {SERVICE_TYPES.map((type) => {
              const Icon = type.icon;
              return (
                <GlassCard key={type.title} className="p-8 text-center group hover:border-white/20 transition-all duration-300">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5 border" style={{ background: `${type.color}15`, borderColor: `${type.color}33` }}>
                    <Icon size={32} weight="duotone" style={{ color: type.color }} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{type.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{type.desc}</p>
                </GlassCard>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 5. LOCK SERVICES ── */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #120e18 50%, #1a1a1a 100%)" }} />
        <SecurityTrail opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Our Services" title="Locksmith Services" subtitle={`${data.businessName} provides expert lock and key services for every situation.`} accent={ACCENT} />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.services.length > 0 ? data.services.map((service, i) => {
              const tile = pickPaletteColor(i);
              const Icon = getServiceIcon(service.name);
              return (
                <div key={service.name} className="group relative p-7 rounded-2xl border border-white/[0.10] hover:border-opacity-30 transition-all duration-500 overflow-hidden bg-white/[0.07]">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: `radial-gradient(circle at 50% 0%, ${ACCENT}15, transparent 70%)` }} />
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-5">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center border" style={{ background: `${tile}22`, borderColor: `${tile}55` }}>
                        <Icon size={24} weight="duotone" style={{ color: tile }} />
                      </div>
                      <span className="text-xs font-mono" style={{ color: `${tile}99` }}>{String(i + 1).padStart(2, "0")}</span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{service.name}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{service.description || ""}</p>
                    {service.price && <p className="text-sm font-semibold mt-3" style={{ color: ACCENT }}>{service.price}</p>}
                  </div>
                </div>
              );
            }) : LOCK_SERVICES.map((service, i) => {
              const tile = pickPaletteColor(i);
              const Icon = service.icon;
              return (
                <div key={service.title} className="group relative p-7 rounded-2xl border border-white/[0.10] hover:border-opacity-30 transition-all duration-500 overflow-hidden bg-white/[0.07]">
                  <div className="relative z-10">
                    {service.urgent && <div className="absolute top-0 right-0 px-2 py-0.5 rounded-bl-lg rounded-tr-xl text-[10px] font-bold bg-red-500/20 text-red-400 border-b border-l border-red-500/30">24/7</div>}
                    <div className="flex items-start justify-between mb-5">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center border" style={{ background: `${tile}22`, borderColor: `${tile}55` }}>
                        <Icon size={24} weight="duotone" style={{ color: tile }} />
                      </div>
                      <span className="text-xs font-mono" style={{ color: `${tile}99` }}>{String(i + 1).padStart(2, "0")}</span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{service.title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{service.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 6. LICENSE DISPLAY ── */}
      <section className="relative z-10 py-16 overflow-hidden border-y" style={{ borderColor: `${ACCENT}1a` }}>
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #120e08 0%, #1a1a1a 100%)" }} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="flex flex-wrap justify-center gap-4">
            {["Licensed Locksmith", "Bonded & Insured", "Background Checked", "BBB Accredited", "5-Star Google Rating", "24/7 Service"].map((badge) => (
              <span key={badge} className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium border" style={{ color: ACCENT, borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}>
                <ShieldCheck size={14} weight="fill" /> {badge}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. ABOUT ── */}
      <section id="about" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0a0e18 50%, #1a1a1a 100%)" }} />
        <KeyLockPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="relative">
              <div className="rounded-2xl overflow-hidden border border-white/15">
                <img src={aboutImage} alt={`${data.businessName} team`} className="w-full h-[400px] object-cover" />
              </div>
              <div className="absolute -bottom-4 -right-4 md:bottom-6 md:-right-6">
                <div className="px-5 py-3 rounded-xl backdrop-blur-md border text-white font-bold text-sm shadow-lg" style={{ background: `${ACCENT}e6`, borderColor: `${ACCENT}80` }}>
                  {data.stats[0] ? `${data.stats[0].value} ${data.stats[0].label}` : "Locks Installed"}
                </div>
              </div>
            </div>
            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: ACCENT, borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}>About Us</span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6 text-white">Your Trusted Locksmith</h2>
              <p className="text-slate-400 leading-relaxed mb-8">{data.about}</p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: ShieldCheck, label: "Licensed & Bonded" },
                  { icon: Clock, label: "24/7 Available" },
                  { icon: Star, label: "Top Rated" },
                  { icon: CheckCircle, label: "No Damage Guarantee" },
                ].map((badge) => (
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

      {/* ── 8. PRICING ── */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #120e18 50%, #1a1a1a 100%)" }} />
        <SecurityTrail opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Pricing" title="Upfront, Honest Pricing" subtitle="No hidden fees, no hourly rates. We quote a flat price before we start." accent={ACCENT} />
          <div className="grid md:grid-cols-3 gap-6">
            {PRICING_TIERS.map((tier) => (
              <div key={tier.title} className="relative">
                {tier.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold text-white z-20" style={{ background: ACCENT }}>Most Common</div>}
                <GlassCard className={`p-8 h-full flex flex-col ${tier.popular ? "border-2" : ""}`} {...(tier.popular ? { style: { borderColor: `${ACCENT}4d` } } : {})}>
                  <h3 className="text-lg font-bold text-white mb-1">{tier.title}</h3>
                  <p className="text-xs text-slate-500 mb-3">{tier.subtitle}</p>
                  <p className="text-4xl font-black mb-6" style={{ color: ACCENT }}>{tier.price}</p>
                  <ul className="space-y-3 flex-1">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-slate-300">
                        <CheckCircle size={16} weight="fill" style={{ color: ACCENT }} className="shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <MagneticButton className="w-full mt-6 py-3 rounded-xl text-sm font-semibold text-white cursor-pointer text-center" style={{ background: tier.popular ? ACCENT : `${ACCENT}22`, border: tier.popular ? "none" : `1px solid ${ACCENT}33` } as React.CSSProperties}>
                    Get Quote
                  </MagneticButton>
                </GlassCard>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 9. SECURITY ASSESSMENT ── */}
      <section id="security" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0a0e18 50%, #1a1a1a 100%)" }} />
        <KeyLockPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Security Check" title="Is Your Property Secure?" subtitle="Use this checklist to assess your home or business security. We offer free on-site assessments." accent={ACCENT} />
          <GlassCard className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/15">
                    <th className="text-left p-4 text-slate-400 font-medium">Security Point</th>
                    <th className="text-center p-4 font-medium" style={{ color: "#22c55e" }}>Secure</th>
                    <th className="text-center p-4 font-medium" style={{ color: "#ef4444" }}>At Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {SECURITY_CHECKLIST.map((row) => (
                    <tr key={row.item} className="border-b border-white/8 hover:bg-white/[0.07] transition-colors">
                      <td className="p-4 text-slate-300 font-medium">{row.item}</td>
                      <td className="p-4 text-center text-xs text-green-400">{row.good}</td>
                      <td className="p-4 text-center text-xs text-red-400">{row.bad}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
          <div className="text-center mt-8">
            <MagneticButton href={`tel:${phoneDigits}`} className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white cursor-pointer" style={{ background: ACCENT } as React.CSSProperties}>
              <Shield size={16} weight="fill" /> Book Free Security Assessment
            </MagneticButton>
          </div>
        </div>
      </section>

      {/* ── 10. PROCESS ── */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #120e18 50%, #1a1a1a 100%)" }} />
        <SecurityTrail opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Our Process" title="How It Works" accent={ACCENT} />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {processSteps.map((step, i) => (
              <div key={step.step} className="relative">
                {i < processSteps.length - 1 && <div className="hidden lg:block absolute top-10 left-[calc(50%+40px)] w-[calc(100%-80px)] h-px" style={{ background: `linear-gradient(to right, ${ACCENT}33, ${ACCENT}11)` }} />}
                <GlassCard className="p-6 text-center relative">
                  <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-black" style={{ background: `linear-gradient(135deg, ${ACCENT}22, ${ACCENT}0a)`, color: ACCENT, border: `1px solid ${ACCENT}33` }}>{step.step}</div>
                  <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
                </GlassCard>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 11. GALLERY ── */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0a0e18 50%, #1a1a1a 100%)" }} />
        <KeyLockPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Our Work" title="Recent Projects" accent={ACCENT} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {galleryImages.map((src, i) => {
              const titles = ["Smart Lock Installation", "Commercial Rekey", "Emergency Lockout", "Deadbolt Upgrade"];
              return (
                <div key={i} className="group relative rounded-2xl overflow-hidden border border-white/[0.10] hover:border-opacity-30 transition-all duration-500">
                  <img src={src} alt={titles[i]} className="w-full h-64 object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6"><h3 className="text-lg font-bold text-white mb-1">{titles[i]}</h3></div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 12. VIDEO PLACEHOLDER ── */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #120e18 50%, #1a1a1a 100%)" }} />
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <SectionHeader badge="See Our Work" title="Watch Our Locksmiths in Action" accent={ACCENT} />
          <div className="relative rounded-2xl overflow-hidden border border-white/15">
            <img src={heroImage} alt="Locksmith service" className="w-full h-[350px] object-cover" />
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full flex items-center justify-center cursor-pointer border-2" style={{ background: `${ACCENT}cc`, borderColor: ACCENT }}>
                <Play size={36} weight="fill" className="text-white ml-1" />
              </div>
            </div>
            <div className="absolute bottom-6 left-6">
              <p className="text-white font-semibold text-lg">Service Showcase</p>
              <p className="text-white/60 text-sm">See how we handle emergency lockouts with zero damage</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 13. GOOGLE REVIEWS + TESTIMONIALS ── */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0a0e18 50%, #1a1a1a 100%)" }} />
        <KeyLockPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border backdrop-blur-md" style={{ borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}>
              <div className="flex gap-0.5">{Array.from({ length: 5 }).map((_, j) => <Star key={j} size={18} weight="fill" style={{ color: ACCENT }} />)}</div>
              <span className="text-white font-semibold text-sm">{data.googleRating || "5.0"} Rating</span>
              {data.reviewCount && <span className="text-slate-400 text-sm">({data.reviewCount}+ reviews)</span>}
            </div>
          </div>
          <SectionHeader badge="Reviews" title="What Our Customers Say" accent={ACCENT} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <GlassCard key={i} className="p-6 h-full flex flex-col">
                <div className="text-4xl mb-4" style={{ color: `${ACCENT}33` }}>&ldquo;</div>
                <div className="flex gap-0.5 mb-4">{Array.from({ length: t.rating || 5 }).map((_, j) => <Star key={j} size={16} weight="fill" style={{ color: ACCENT }} />)}</div>
                <p className="text-slate-300 leading-relaxed flex-1 text-sm mb-4">{t.text}</p>
                <div className="pt-4 border-t border-white/8 flex items-center gap-2">
                  <CheckCircle size={14} weight="fill" style={{ color: ACCENT }} />
                  <span className="text-sm font-semibold text-white">{t.name}</span>
                  <span className="text-xs text-slate-500">Verified Customer</span>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* ── 14. COMPETITOR COMPARISON ── */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #120e18 50%, #1a1a1a 100%)" }} />
        <SecurityTrail opacity={0.02} accent={ACCENT} />
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Why Us" title={`${data.businessName} vs. The Competition`} accent={ACCENT} />
          <GlassCard className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/15">
                    <th className="text-left p-4 text-slate-400 font-medium">Feature</th>
                    <th className="text-center p-4 font-bold" style={{ color: ACCENT }}>{data.businessName}</th>
                    <th className="text-center p-4 text-slate-500 font-medium">Others</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_ROWS.map((row) => (
                    <tr key={row.feature} className="border-b border-white/8 hover:bg-white/[0.07] transition-colors">
                      <td className="p-4 text-slate-300">{row.feature}</td>
                      <td className="p-4 text-center"><CheckCircle size={20} weight="fill" className="mx-auto" style={{ color: "#22c55e" }} /></td>
                      <td className="p-4 text-center text-slate-500 text-xs">{row.them}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* ── 15. LOCKSMITH QUIZ ── */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0a0e18 50%, #1a1a1a 100%)" }} />
        <KeyLockPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <SectionHeader badge="How Can We Help?" title="What Do You Need?" accent={ACCENT} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {quizOptions.map((opt, i) => (
              <button key={opt.label} onClick={() => setQuizAnswer(i)} className={`p-6 rounded-2xl border text-left transition-all duration-300 cursor-pointer ${quizAnswer === i ? "border-opacity-100 bg-white/[0.06]" : "border-white/15 bg-white/[0.07] hover:bg-white/[0.07]"}`} style={quizAnswer === i ? { borderColor: opt.color } : undefined}>
                <span className="text-2xl mb-3 block">{opt.emoji}</span>
                <h3 className="text-white font-semibold text-sm">{opt.label}</h3>
              </button>
            ))}
          </div>
          <AnimatePresence>
            {quizAnswer !== null && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}>
                <ShimmerBorder accent={quizOptions[quizAnswer].color}>
                  <div className="p-6 text-center">
                    <p className="text-white text-lg mb-4">{quizOptions[quizAnswer].result}</p>
                    <MagneticButton href={`tel:${phoneDigits}`} className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white cursor-pointer" style={{ background: ACCENT } as React.CSSProperties}>
                      <Phone size={16} weight="fill" /> Call {data.phone}
                    </MagneticButton>
                  </div>
                </ShimmerBorder>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ── 16. MID-PAGE CTA ── */}
      <section className="relative z-10 py-20 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT}cc, ${ACCENT})` }} />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='40' height='40' fill='none'/%3E%3Cpath d='M0 0L40 40M40 0L0 40' stroke='%23000' stroke-width='0.5'/%3E%3C/svg%3E\")" }} />
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <LockKey size={48} weight="fill" className="mx-auto mb-6 text-white/70" />
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-4">Need a Locksmith?</h2>
          <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">Locked out, need new locks, or want a security upgrade — we&apos;re here 24/7.</p>
          <PhoneLink phone={data.phone} className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-white text-black font-bold text-lg hover:bg-white/90 transition-colors">
            <Phone size={22} weight="fill" /> Call {data.phone}
          </PhoneLink>
        </div>
      </section>

      {/* ── 17. SERVICE AREA ── */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #120e18 50%, #1a1a1a 100%)" }} />
        <KeyLockPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Service Area" title="Areas We Serve" accent={ACCENT} />
          <div className="flex flex-col items-center gap-6">
            <GlassCard className="p-8 inline-block">
              <div className="flex items-center gap-3 text-lg">
                <MapPin size={24} weight="duotone" style={{ color: ACCENT }} />
                <MapLink address={data.address} className="text-white font-semibold" />
              </div>
              <p className="text-slate-400 text-sm mt-2">&amp; Surrounding Areas</p>
            </GlassCard>
            <div className="flex flex-wrap justify-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full border" style={{ borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}>
                <NavigationArrow size={14} weight="fill" style={{ color: ACCENT }} />
                <span className="text-sm text-slate-300">15-30 min response time</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full border" style={{ borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}>
                <div className="relative">
                  <div className="w-2 h-2 rounded-full animate-ping absolute" style={{ background: "#22c55e80" }} />
                  <div className="w-2 h-2 rounded-full relative" style={{ background: "#22c55e" }} />
                </div>
                <span className="text-sm text-slate-300">Locksmiths available now</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 18. HOURS ── */}
      {data.hours && (
        <section className="relative z-10 py-24 md:py-32 overflow-hidden">
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0a0e18 50%, #1a1a1a 100%)" }} />
          <SecurityTrail opacity={0.02} accent={ACCENT} />
          <div className="max-w-3xl mx-auto px-6 relative z-10">
            <SectionHeader badge="Hours" title="When We're Available" accent={ACCENT} />
            <div className="text-center">
              <ShimmerBorder accent={ACCENT}>
                <div className="p-8">
                  <Clock size={32} weight="duotone" style={{ color: ACCENT }} className="mx-auto mb-4" />
                  <p className="text-slate-300 leading-relaxed whitespace-pre-line text-lg">{data.hours}</p>
                  <p className="text-sm mt-4 font-semibold" style={{ color: ACCENT }}>Emergency lockouts: Available 24/7</p>
                </div>
              </ShimmerBorder>
            </div>
          </div>
        </section>
      )}

      {/* ── 19. FAQ ── */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #120e18 50%, #1a1a1a 100%)" }} />
        <KeyLockPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <SectionHeader badge="FAQ" title="Common Questions" accent={ACCENT} />
          <div className="space-y-3">
            {faqs.map((faq, i) => <AccordionItem key={i} question={faq.q} answer={faq.a} isOpen={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} />)}
          </div>
        </div>
      </section>

      {/* ── 20. CONTACT ── */}
      <section id="contact" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0a0e18 50%, #1a1a1a 100%)" }} />
        <KeyLockPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: ACCENT, borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}>Contact Us</span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6 text-white">Get Help Now</h2>
              <p className="text-slate-400 leading-relaxed mb-8">Locked out or need lock service? Contact {data.businessName} — we&apos;re available 24/7.</p>
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: ACCENT_GLOW }}><MapPin size={20} weight="duotone" style={{ color: ACCENT }} /></div>
                  <div><p className="text-sm font-semibold text-white">Address</p><MapLink address={data.address} className="text-sm text-slate-400" /></div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: ACCENT_GLOW }}><Phone size={20} weight="duotone" style={{ color: ACCENT }} /></div>
                  <div><p className="text-sm font-semibold text-white">Phone</p><PhoneLink phone={data.phone} className="text-sm text-slate-400" /></div>
                </div>
                {data.hours && <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: ACCENT_GLOW }}><Clock size={20} weight="duotone" style={{ color: ACCENT }} /></div>
                  <div><p className="text-sm font-semibold text-white">Hours</p><p className="text-sm text-slate-400 whitespace-pre-line">{data.hours}</p></div>
                </div>}
              </div>
            </div>
            <GlassCard className="p-8">
              <h3 className="text-xl font-semibold text-white mb-6">Request Service</h3>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className="block text-sm text-slate-400 mb-1.5">First Name</label><input type="text" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 focus:outline-none text-sm" placeholder="John" /></div>
                  <div><label className="block text-sm text-slate-400 mb-1.5">Last Name</label><input type="text" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 focus:outline-none text-sm" placeholder="Doe" /></div>
                </div>
                <div><label className="block text-sm text-slate-400 mb-1.5">Phone</label><input type="tel" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 focus:outline-none text-sm" placeholder="(555) 123-4567" /></div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">Service Needed</label>
                  <select className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white focus:outline-none text-sm">
                    <option value="" className="bg-neutral-900">Select a service</option>
                    <option value="lockout" className="bg-neutral-900">Emergency Lockout</option>
                    <option value="rekey" className="bg-neutral-900">Rekey / New Locks</option>
                    <option value="auto" className="bg-neutral-900">Automotive Key Service</option>
                    <option value="security" className="bg-neutral-900">Security Upgrade</option>
                    <option value="commercial" className="bg-neutral-900">Commercial Service</option>
                    <option value="other" className="bg-neutral-900">Other</option>
                  </select>
                </div>
                <div><label className="block text-sm text-slate-400 mb-1.5">Describe Your Situation</label><textarea rows={3} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 focus:outline-none text-sm resize-none" placeholder="Locked out, need rekey, security upgrade..." /></div>
                <MagneticButton className="w-full py-4 rounded-xl text-base font-semibold text-white flex items-center justify-center gap-2 cursor-pointer" style={{ background: ACCENT } as React.CSSProperties}>
                  Send Request <ArrowRight size={18} weight="bold" />
                </MagneticButton>
              </form>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* ── 21. GUARANTEE ── */}
      <section className="relative z-10 py-16 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0a0e08 100%)" }} />
        <KeyLockPattern opacity={0.015} accent={ACCENT} />
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <ShimmerBorder accent={ACCENT}>
            <div className="p-8 md:p-12">
              <ShieldCheck size={48} weight="fill" style={{ color: ACCENT }} className="mx-auto mb-4" />
              <h2 className="text-2xl md:text-4xl font-extrabold text-white mb-4">Our No-Damage Guarantee</h2>
              <p className="text-slate-400 leading-relaxed max-w-2xl mx-auto text-lg">{data.businessName} guarantees professional, damage-free service on every call. Licensed, bonded, insured, and committed to your security.</p>
              <div className="flex flex-wrap justify-center gap-4 mt-8">
                {["Licensed & Bonded", "No Damage Entry", "Upfront Pricing", "Satisfaction Guaranteed"].map((item) => (
                  <span key={item} className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border" style={{ color: ACCENT, borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}>
                    <CheckCircle size={16} weight="fill" /> {item}
                  </span>
                ))}
              </div>
            </div>
          </ShimmerBorder>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="relative z-10 border-t border-white/8 py-10 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #111 100%)" }} />
        <KeyLockPattern opacity={0.015} accent={ACCENT} />
        <div className="mx-auto max-w-6xl px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <LockKey size={22} weight="fill" style={{ color: ACCENT }} />
                <span className="text-lg font-bold text-white">{data.businessName}</span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">{data.about.length > 120 ? data.about.slice(0, 120).trim() + "..." : data.about}</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-3">Quick Links</h4>
              <div className="space-y-2">
                {["Services", "About", "Security", "Contact"].map((link) => (
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
                  <a key={platform} href={url} target="_blank" rel="noopener noreferrer" className="block hover:text-white transition-colors capitalize">{platform}</a>
                ))}
              </div>
            </div>
          </div>
          <div className="border-t border-white/8 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <LockKey size={14} weight="fill" style={{ color: ACCENT }} />
              <span>{data.businessName} &copy; {new Date().getFullYear()}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <BluejayLogo className="w-4 h-4" />
              <span>Created by <a href="https://bluejayportfolio.com" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "underline" }}>bluejayportfolio.com</a></span>
            </div>
          </div>
        </div>
      </footer>

      <ClaimBanner businessName={data.businessName} accentColor={ACCENT} prospectId={data.id} />
      <div className="h-14 md:h-28" />
    </main>
  );
}
