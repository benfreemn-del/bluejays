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
  Thermometer,
  Snowflake,
  Fan,
  Wind,
  ShieldCheck,
  Star,
  Phone,
  MapPin,
  Clock,
  ArrowRight,
  CaretDown,
  CheckCircle,
  X,
  List,
  Wrench,
  Lightning,
  House,
  Medal,
  CurrencyDollar,
  Play,
  Timer,
  Flame,
  CalendarCheck,
  Leaf,
  Drop,
} from "@phosphor-icons/react";
import type { GeneratedSiteData } from "@/lib/generator";
import BluejayLogo from "../BluejayLogo";
import { MapLink, PhoneLink } from "@/components/templates/MapLink";
import ClaimBanner from "@/components/ClaimBanner";
import { pickFromPool, pickGallery } from "@/lib/stock-image-picker";

/* ───────────────────────── SPRING CONFIGS ───────────────────────── */
const spring = { type: "spring" as const, stiffness: 100, damping: 20 };
const springFast = { type: "spring" as const, stiffness: 200, damping: 25 };

/* ───────────────────────── COLORS ───────────────────────── */
const NAVY = "#0c1222";
const DEFAULT_BLUE = "#0ea5e9";
const BLUE_LIGHT = "#38bdf8";
const ORANGE = "#f97316";
const ORANGE_LIGHT = "#fb923c";

function getAccent(accentColor?: string) {
  const c = accentColor || DEFAULT_BLUE;
  return { BLUE: c, BLUE_GLOW: `${c}26`, ORANGE, ORANGE_GLOW: `${ORANGE}26` };
}

/* ───────────────────────── SERVICE ICON MAP ───────────────────────── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SERVICE_ICON_MAP: Record<string, any> = {
  ac: Snowflake, air: Snowflake, cool: Snowflake, heat: Thermometer,
  furnace: Thermometer, boiler: Thermometer, vent: Fan, duct: Wind,
  filter: Wind, maintenance: Wrench, repair: Wrench, install: House,
  emergency: Lightning, commercial: House, residential: House,
};

function getServiceIcon(serviceName: string) {
  const lower = serviceName.toLowerCase();
  for (const [key, Icon] of Object.entries(SERVICE_ICON_MAP)) {
    if (lower.includes(key)) return Icon;
  }
  return Fan;
}

/* ───────────────────────── SERVICE TYPE BADGES ───────────────────────── */
const SERVICE_BADGES = [
  { label: "Heating", icon: Flame },
  { label: "Air Conditioning", icon: Snowflake },
  { label: "Heat Pumps", icon: Thermometer },
  { label: "Furnaces", icon: Flame },
  { label: "Ductwork", icon: Wind },
  { label: "24/7 Emergency", icon: Lightning },
];

/* ───────────────────────── SEASONAL SAVINGS ───────────────────────── */
const SEASONAL_DEALS = [
  { title: "AC Tune-Up", price: "$89", desc: "Keep your cool all summer long", icon: Snowflake, tag: "Spring Special" },
  { title: "Furnace Inspection", price: "$79", desc: "Stay warm and worry-free this winter", icon: Flame, tag: "Fall Special" },
  { title: "New System Install", price: "From $4,999", desc: "High-efficiency upgrades with financing", icon: Fan, tag: "Best Value" },
];

/* ───────────────────────── WHAT WE SERVICE ───────────────────────── */
const EQUIPMENT_GRID = [
  { name: "Furnaces", icon: Flame },
  { name: "Heat Pumps", icon: Thermometer },
  { name: "Air Conditioners", icon: Snowflake },
  { name: "Ductless Mini-Splits", icon: Fan },
  { name: "Thermostats", icon: Timer },
  { name: "Ductwork", icon: Wind },
  { name: "Air Quality", icon: Leaf },
  { name: "Water Heaters", icon: Drop },
];

/* ───────────────────────── ENERGY SAVINGS FEATURES ───────────────────────── */
const ENERGY_FEATURES = [
  { title: "High-Efficiency Systems", desc: "ENERGY STAR rated units that slash utility costs", icon: Lightning },
  { title: "Smart Thermostat Integration", desc: "WiFi-enabled controls for precision comfort scheduling", icon: Timer },
  { title: "Duct Sealing & Insulation", desc: "Stop conditioned air from escaping through leaks", icon: Wind },
  { title: "Rebate & Tax Credit Assistance", desc: "We help you claim every available savings program", icon: CurrencyDollar },
];

/* ───────────────────────── COMPETITOR COMPARISON ───────────────────────── */
const COMPARISON_ROWS = [
  "Licensed & Insured Technicians",
  "Free In-Home Estimates",
  "Same-Day Emergency Service",
  "Manufacturer Warranties",
  "Flexible Financing Options",
  "Annual Maintenance Plans",
  "Local & Family-Owned",
];

/* ───────────────────────── HVAC QUIZ OPTIONS ───────────────────────── */
const QUIZ_OPTIONS = [
  { label: "No Heat / No Cool", desc: "Emergency! Get help now", color: "#ef4444", icon: Lightning },
  { label: "Maintenance & Tune-Up", desc: "Preventive care for your system", color: "#22c55e", icon: CalendarCheck },
  { label: "New System", desc: "Time for an upgrade", color: "#3b82f6", icon: Fan },
  { label: "Air Quality Concern", desc: "Breathe better at home", color: "#a855f7", icon: Leaf },
];

/* ───────────────────────── STOCK FALLBACK IMAGES ───────────────────────── */
const STOCK_HERO_POOL = ["https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=1400&q=80"];
const STOCK_ABOUT_POOL = ["https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&q=80"];
const STOCK_PROJECTS = [
  "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=600&q=80",
  "https://images.unsplash.com/photo-1558002038-1055907df827?w=600&q=80",
  "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&q=80",
  "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&q=80",
];

/* ───────────────────────── FLOATING PARTICLES ───────────────────────── */
function FloatingParticles() {
  const particles = Array.from({ length: 28 }, (_, i) => ({
    id: i, x: Math.random() * 100, delay: Math.random() * 8,
    duration: 7 + Math.random() * 6, size: 2 + Math.random() * 4,
    opacity: 0.12 + Math.random() * 0.3, isCool: i % 3 !== 0,
  }));

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden hidden md:block">
      {particles.map((p) => (
        <motion.div key={p.id} className="absolute rounded-full"
          style={{ left: `${p.x}%`, width: p.size, height: p.size, background: p.isCool ? BLUE_LIGHT : ORANGE_LIGHT, willChange: "transform, opacity" }}
          animate={{ y: p.isCool ? ["-10vh", "110vh"] : ["110vh", "-10vh"], opacity: [0, p.opacity, p.opacity, 0] }}
          transition={{
            y: { duration: p.duration, repeat: Infinity, delay: p.delay, ease: "linear" },
            opacity: { duration: p.duration, repeat: Infinity, delay: p.delay, times: [0, 0.1, 0.9, 1] },
          }}
        />
      ))}
    </div>
  );
}

/* ───────────────────────── AIRFLOW WAVE SVG ───────────────────────── */
function AirflowWaves({ opacity = 0.04, accent }: { opacity?: number; accent: string }) {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }} viewBox="0 0 1000 600" preserveAspectRatio="none">
      <motion.path d="M0 200 Q200 150 400 200 T800 200 T1000 200" stroke={accent} strokeWidth="1.5" fill="none" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 3, ease: "easeInOut" }} />
      <motion.path d="M0 300 Q200 350 400 300 T800 300 T1000 300" stroke={ORANGE} strokeWidth="1.5" fill="none" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 3.5, delay: 0.3, ease: "easeInOut" }} />
      <motion.path d="M0 400 Q200 350 400 400 T800 400 T1000 400" stroke={accent} strokeWidth="1" fill="none" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 4, delay: 0.6, ease: "easeInOut" }} />
    </svg>
  );
}

/* ───────────────────────── VENT GRID PATTERN ───────────────────────── */
function VentPattern({ opacity = 0.03, accent }: { opacity?: number; accent: string }) {
  const patternId = `ventGridV2Prev-${accent.replace("#", "")}`;
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }}>
      <defs>
        <pattern id={patternId} width="60" height="60" patternUnits="userSpaceOnUse">
          <rect x="5" y="15" width="50" height="3" rx="1.5" fill={accent} opacity="0.3" />
          <rect x="5" y="30" width="50" height="3" rx="1.5" fill={accent} opacity="0.3" />
          <rect x="5" y="45" width="50" height="3" rx="1.5" fill={accent} opacity="0.3" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  );
}

/* ───────────────────────── GLASS CARD ───────────────────────── */
function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] ${className}`}>{children}</div>
  );
}

/* ───────────────────────── MAGNETIC BUTTON ───────────────────────── */
function MagneticButton({ children, className = "", onClick, style, href }: {
  children: React.ReactNode; className?: string; onClick?: () => void; style?: React.CSSProperties; href?: string;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0); const y = useMotionValue(0);
  const springX = useSpring(x, springFast); const springY = useSpring(y, springFast);
  const isTouchDevice = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current || isTouchDevice) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - (rect.left + rect.width / 2)) * 0.25);
    y.set((e.clientY - (rect.top + rect.height / 2)) * 0.25);
  }, [x, y, isTouchDevice]);
  const handleMouseLeave = useCallback(() => { x.set(0); y.set(0); }, [x, y]);

  if (href) {
    return <motion.a href={href} ref={ref as unknown as React.Ref<HTMLAnchorElement>} style={{ x: springX, y: springY, willChange: "transform", ...style }} onMouseMove={handleMouseMove as unknown as React.MouseEventHandler<HTMLAnchorElement>} onMouseLeave={handleMouseLeave} className={className} whileTap={{ scale: 0.97 }}>{children}</motion.a>;
  }
  return <motion.button ref={ref} style={{ x: springX, y: springY, willChange: "transform", ...style }} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} onClick={onClick} className={className} whileTap={{ scale: 0.97 }}>{children}</motion.button>;
}

/* ───────────────────────── SHIMMER BORDER ───────────────────────── */
function ShimmerBorder({ children, className = "", accent }: { children: React.ReactNode; className?: string; accent: string }) {
  return (
    <div className={`relative rounded-2xl p-[1px] overflow-hidden ${className}`}>
      <motion.div className="absolute inset-0 rounded-2xl" style={{ background: `conic-gradient(from 0deg, transparent, ${accent}, transparent, ${ORANGE}, transparent)`, willChange: "transform" }} animate={{ rotate: [0, 360] }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} />
      <div className="relative rounded-2xl z-10" style={{ background: NAVY }}>{children}</div>
    </div>
  );
}

/* ───────────────────────── ACCORDION ───────────────────────── */
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

/* ───────────────────────── SECTION HEADER ───────────────────────── */
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


/* ═══════════════════════════════════════════════════════════════════
   MAIN PREVIEW COMPONENT
   ═══════════════════════════════════════════════════════════════════ */
/* ───────────────────────── ANIMATED SECTION ───────────────────────── */
function AnimatedSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: "easeOut" as const }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function V2HvacPreview({ data }: { data: GeneratedSiteData }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [quizSelection, setQuizSelection] = useState<number | null>(null);

  const { BLUE, BLUE_GLOW } = getAccent(data.accentColor);

  const uniquePhotos = data.photos ? [...new Set(data.photos)] : [];


  const heroImage = uniquePhotos[0] || pickFromPool(STOCK_HERO_POOL, data.businessName);


  const heroCardImage = uniquePhotos[1] || pickFromPool(STOCK_ABOUT_POOL, data.businessName, 1);


  const aboutImage = uniquePhotos[2] || pickFromPool(STOCK_ABOUT_POOL, data.businessName, 2);
  const projectImages = data.photos?.length > 2 ? data.photos.slice(2, 6) : pickGallery(STOCK_PROJECTS, data.businessName);
  const phoneDigits = data.phone.replace(/\D/g, "");

  const processSteps = [
    { step: "01", title: "Call or Schedule Online", desc: `Reach ${data.businessName} by phone or book online — we respond fast, even on nights and weekends.` },
    { step: "02", title: "Free In-Home Estimate", desc: "A certified technician visits your home, diagnoses the issue, and provides a transparent, no-obligation quote." },
    { step: "03", title: "Expert Installation or Repair", desc: "Our licensed team completes the work with precision and minimal disruption to your daily life." },
    { step: "04", title: "Comfort Guaranteed", desc: "We test everything, walk you through operation, and back every job with industry-leading warranties." },
  ];

  const faqs = [
    { q: `What HVAC services does ${data.businessName} offer?`, a: `We offer heating, cooling, and ventilation services including ${data.services.slice(0, 3).map(s => s.name).join(", ")}, and more. Call for a free estimate.` },
    { q: "How often should I service my HVAC system?", a: "We recommend professional maintenance twice a year — once in spring for cooling and once in fall for heating. Regular maintenance extends equipment life and improves efficiency." },
    { q: "Do you offer emergency HVAC service?", a: `Yes! ${data.businessName} provides 24/7 emergency service. No heat in winter or no AC in summer? We respond fast.` },
    { q: "How long does a new HVAC system last?", a: "A well-maintained system typically lasts 15-20 years. We can assess your current system and recommend whether repair or replacement makes more financial sense." },
  ];

  /* Fallback testimonials */
  const fallbackTestimonials = [
    { name: "Dan W.", text: "AC died in July and they had a new system installed the next day. Saved us from the heat wave.", rating: 5 },
    { name: "Mary K.", text: "Our energy bills dropped 40% after they installed the new furnace. Pays for itself.", rating: 5 },
    { name: "Scott R.", text: "Annual maintenance plan keeps everything running perfectly. Haven't had a breakdown in years.", rating: 5 }
  ];
  const testimonials = data.testimonials?.length > 0 ? data.testimonials : fallbackTestimonials;

  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden" style={{ background: NAVY, color: "#f1f5f9" }}>
      <FloatingParticles />

      {/* ══════════════════ 1. NAV ══════════════════ */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-4">
          <GlassCard className="flex items-center justify-between px-4 md:px-6 py-3">
            <div className="flex items-center gap-2">
              <Fan size={24} weight="fill" style={{ color: BLUE }} />
              <span className="text-lg font-bold tracking-tight text-white">{data.businessName}</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
              <a href="#services" className="hover:text-white transition-colors">Services</a>
              <a href="#about" className="hover:text-white transition-colors">About</a>
              <a href="#projects" className="hover:text-white transition-colors">Projects</a>
              <a href="#contact" className="hover:text-white transition-colors">Contact</a>
            </div>
            <div className="flex items-center gap-3">
              <MagneticButton className="px-4 md:px-5 py-2 rounded-full text-sm font-semibold text-black transition-colors cursor-pointer" style={{ background: BLUE } as React.CSSProperties}>Get Free Estimate</MagneticButton>
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

      {/* ══════════════════ 2. HERO ══════════════════ */}
      <section className="relative min-h-[100dvh] flex items-center pt-24 z-10 overflow-hidden">

        <div className="absolute inset-0">
          <img src={heroImage} alt={`${data.businessName}`} className="w-full h-full object-cover object-center" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/25 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        </div>
        <AirflowWaves opacity={0.05} accent={BLUE} />

        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          <div className="space-y-8">
            <div>
              <p className="text-sm uppercase tracking-widest mb-4" style={{ color: BLUE }}>Certified HVAC Professionals</p>
              <h1 className="text-3xl md:text-6xl tracking-tighter leading-none font-bold text-white" style={{ textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>{data.tagline}</h1>
            </div>
            <p className="text-lg text-slate-400 max-w-md leading-relaxed">{data.about.length > 160 ? data.about.slice(0, 160).trim() + "..." : data.about}</p>
            <div className="flex flex-wrap gap-4">
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-black flex items-center gap-2 cursor-pointer" style={{ background: BLUE } as React.CSSProperties}>
                Get Free Estimate <ArrowRight size={18} weight="bold" />
              </MagneticButton>
              <MagneticButton href={`tel:${phoneDigits}`} className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/10 flex items-center gap-2 cursor-pointer">
                <Phone size={18} weight="duotone" /> <PhoneLink phone={data.phone} />
              </MagneticButton>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-slate-400">
              <span className="flex items-center gap-2"><MapPin size={16} weight="duotone" style={{ color: BLUE }} /> <MapLink address={data.address} /></span>
              <span className="flex items-center gap-2"><Clock size={16} weight="duotone" style={{ color: BLUE }} /> 24/7 Emergency Available</span>
            </div>
          </div>
          <div className="hidden md:block relative">
            <div className="relative rounded-2xl overflow-hidden border border-white/10">
              <img src={heroCardImage} alt={`${data.businessName} HVAC`} className="w-full h-[500px] object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0c1222] via-transparent to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0c1222]/40 to-transparent" />
              <div className="absolute bottom-6 left-6">
                <div className="px-4 py-2 rounded-full backdrop-blur-md bg-black/50 border flex items-center gap-2" style={{ borderColor: `${BLUE}4d` }}>
                  <ShieldCheck size={18} weight="fill" style={{ color: BLUE }} />
                  <span className="text-sm font-semibold text-white">EPA Certified</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════ 3. STATS ══════════════════ */}
      <section className="relative z-10 py-16 overflow-hidden border-y" style={{ borderColor: `${BLUE}1a` }}>
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #0a1020 0%, #0c1222 100%)" }} />
        <VentPattern opacity={0.02} accent={BLUE} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] rounded-full blur-[180px]" style={{ background: `${BLUE}08` }} /></div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {data.stats.map((stat, i) => {
              const statIcons = [ShieldCheck, Fan, Clock, Star];
              const Icon = statIcons[i % statIcons.length];
              return (
                <div key={stat.label} className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2"><Icon size={22} weight="fill" style={{ color: BLUE }} /><span className="text-3xl md:text-4xl font-extrabold text-white">{stat.value}</span></div>
                  <span className="text-slate-500 text-sm font-medium tracking-wide uppercase">{stat.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════ 3b. SERVICE TYPE BADGES ══════════════════ */}
      <section className="relative z-10 py-10 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, #0a1020 0%, ${NAVY} 100%)` }} />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="flex flex-wrap justify-center gap-3">
            {SERVICE_BADGES.map((badge) => (
              <div key={badge.label} className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-sm">
                <badge.icon size={18} weight="duotone" style={{ color: BLUE }} />
                <span className="text-sm font-semibold text-white whitespace-nowrap">{badge.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ 4. SERVICES ══════════════════ */}
      <section id="services" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${NAVY} 0%, #0a1020 50%, ${NAVY} 100%)` }} />
        <VentPattern accent={BLUE} />
        <AirflowWaves opacity={0.025} accent={BLUE} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[10%] right-[5%] w-[500px] h-[500px] rounded-full blur-[160px]" style={{ background: `${BLUE}08` }} />
          <div className="absolute bottom-[10%] left-[5%] w-[400px] h-[400px] rounded-full blur-[140px]" style={{ background: `${ORANGE}05` }} />
        </div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Our Services" title="Heating & Cooling Experts" subtitle={`From AC repair to full system installs, ${data.businessName} keeps your home comfortable year-round.`} accent={BLUE} />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.services.map((service, i) => {
              const Icon = getServiceIcon(service.name);
              return (
                <div key={service.name} className="group relative p-7 rounded-2xl border border-white/[0.06] hover:border-opacity-30 transition-all duration-500 overflow-hidden bg-white/[0.02]">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: `radial-gradient(circle at 50% 0%, ${BLUE}15, transparent 70%)` }} />
                  <div className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `linear-gradient(to right, transparent, ${BLUE}4d, transparent)` }} />
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-5">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center border" style={{ background: BLUE_GLOW, borderColor: `${BLUE}33` }}>
                        <Icon size={24} weight="duotone" style={{ color: BLUE }} />
                      </div>
                      <span className="text-xs font-mono text-slate-600">{String(i + 1).padStart(2, "0")}</span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{service.name}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{service.description || ""}</p>
                    {service.price && <p className="text-sm font-semibold mt-3" style={{ color: BLUE }}>{service.price}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════ 4b. SEASONAL SAVINGS ══════════════════ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${NAVY} 0%, #0a1020 50%, ${NAVY} 100%)` }} />
        <VentPattern opacity={0.02} accent={BLUE} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[20%] left-[10%] w-[500px] h-[500px] rounded-full blur-[180px]" style={{ background: `${ORANGE}06` }} /></div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Limited Time" title="Seasonal Savings" subtitle="Take advantage of our seasonal specials — comfort shouldn't break the bank." accent={ORANGE} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SEASONAL_DEALS.map((deal, i) => (
              <GlassCard key={deal.title} className="p-7 relative overflow-hidden group">
                <div className="absolute top-0 right-0 px-3 py-1 text-xs font-bold uppercase tracking-wide rounded-bl-xl" style={{ background: i === 2 ? ORANGE : `${BLUE}22`, color: i === 2 ? "black" : BLUE }}>{deal.tag}</div>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 border" style={{ background: `${ORANGE}15`, borderColor: `${ORANGE}33` }}>
                  <deal.icon size={24} weight="duotone" style={{ color: ORANGE }} />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">{deal.title}</h3>
                <p className="text-3xl font-black mb-2" style={{ color: ORANGE }}>{deal.price}</p>
                <p className="text-sm text-slate-400 leading-relaxed">{deal.desc}</p>
                <MagneticButton className="mt-5 w-full py-3 rounded-xl text-sm font-semibold text-black flex items-center justify-center gap-2 cursor-pointer" style={{ background: ORANGE } as React.CSSProperties}>
                  Claim This Deal <ArrowRight size={16} weight="bold" />
                </MagneticButton>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ 4c. WHAT WE SERVICE ══════════════════ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${NAVY} 0%, #0a1628 50%, ${NAVY} 100%)` }} />
        <AirflowWaves opacity={0.025} accent={BLUE} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] rounded-full blur-[160px]" style={{ background: `${BLUE}08` }} /></div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Full Service" title="What We Service" subtitle="From furnaces to water heaters, we handle every piece of your comfort system." accent={BLUE} />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {EQUIPMENT_GRID.map((item) => (
              <GlassCard key={item.name} className="p-5 text-center group hover:border-white/20 transition-all duration-300">
                <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center border" style={{ background: `${BLUE}15`, borderColor: `${BLUE}33` }}>
                  <item.icon size={28} weight="duotone" style={{ color: BLUE }} />
                </div>
                <h3 className="text-sm font-bold text-white">{item.name}</h3>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ 5. PROCESS ══════════════════ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${NAVY} 0%, #0a1020 50%, ${NAVY} 100%)` }} />
        <VentPattern opacity={0.025} accent={BLUE} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] rounded-full blur-[180px]" style={{ background: `${ORANGE}06` }} /></div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <AnimatedSection>          <SectionHeader badge="Our Process" title="How We Work" accent={BLUE} /></AnimatedSection>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {processSteps.map((step, i) => (
              <div key={step.step} className="relative">
                {i < processSteps.length - 1 && <div className="hidden lg:block absolute top-10 left-[calc(50%+40px)] w-[calc(100%-80px)] h-px" style={{ background: `linear-gradient(to right, ${BLUE}33, ${BLUE}11)` }} />}
                <GlassCard className="p-6 text-center relative">
                  <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-black" style={{ background: `linear-gradient(135deg, ${BLUE}22, ${BLUE}0a)`, color: BLUE, border: `1px solid ${BLUE}33` }}>{step.step}</div>
                  <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
                </GlassCard>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ 6. ABOUT ══════════════════ */}
      <section id="about" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${NAVY} 0%, #0a1628 50%, ${NAVY} 100%)` }} />
        <AirflowWaves opacity={0.02} accent={BLUE} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[20%] left-[10%] w-[500px] h-[500px] rounded-full blur-[180px]" style={{ background: `${BLUE}06` }} /></div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="relative">
              <div className="rounded-2xl overflow-hidden border border-white/10">
                <img src={aboutImage} alt={`${data.businessName} team`} className="w-full h-[400px] object-cover" />
              </div>
              <div className="absolute -bottom-4 -right-4 md:bottom-6 md:-right-6">
                <div className="px-5 py-3 rounded-xl backdrop-blur-md border text-black font-bold text-sm shadow-lg" style={{ background: `${BLUE}e6`, borderColor: `${BLUE}80` }}>
                  {data.stats[0] ? `${data.stats[0].value} ${data.stats[0].label}` : "Trusted Experts"}
                </div>
              </div>
            </div>
            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: BLUE, borderColor: `${BLUE}33`, background: `${BLUE}0d` }}>Why Choose Us</span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6 text-white">Your Comfort, Our Priority</h2>
              <p className="text-slate-400 leading-relaxed mb-8">{data.about}</p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: ShieldCheck, label: "EPA Certified" },
                  { icon: Medal, label: "NATE Certified" },
                  { icon: Star, label: "5-Star Rated" },
                  { icon: Clock, label: "24/7 Emergency" },
                ].map((badge) => (
                  <GlassCard key={badge.label} className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: BLUE_GLOW }}><badge.icon size={20} weight="duotone" style={{ color: BLUE }} /></div>
                    <span className="text-sm font-semibold text-white">{badge.label}</span>
                  </GlassCard>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════ 6b. ENERGY SAVINGS ══════════════════ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${NAVY} 0%, #0a1020 50%, ${NAVY} 100%)` }} />
        <VentPattern opacity={0.02} accent={BLUE} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[30%] right-[15%] w-[500px] h-[500px] rounded-full blur-[180px]" style={{ background: `${BLUE}08` }} />
          <div className="absolute bottom-[10%] left-[5%] w-[400px] h-[400px] rounded-full blur-[140px]" style={{ background: `${ORANGE}05` }} />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Efficiency" title="Save Up to 40% on Energy Bills" subtitle="Modern HVAC systems pay for themselves through lower utility costs. We help you maximize every dollar." accent={BLUE} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ENERGY_FEATURES.map((feature) => (
              <GlassCard key={feature.title} className="p-7 flex items-start gap-5 group hover:border-white/20 transition-all duration-300">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border" style={{ background: `${BLUE}15`, borderColor: `${BLUE}33` }}>
                  <feature.icon size={28} weight="duotone" style={{ color: BLUE }} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">{feature.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{feature.desc}</p>
                </div>
              </GlassCard>
            ))}
          </div>
          <div className="mt-10 text-center">
            <ShimmerBorder accent={BLUE} className="inline-block">
              <div className="px-8 py-5 flex items-center gap-4">
                <Leaf size={28} weight="duotone" style={{ color: BLUE }} />
                <div className="text-left">
                  <p className="text-white font-bold text-lg">Ask About Energy Rebates</p>
                  <p className="text-slate-400 text-sm">Federal tax credits up to $2,000 on qualifying high-efficiency systems</p>
                </div>
              </div>
            </ShimmerBorder>
          </div>
        </div>
      </section>

      {/* ══════════════════ 6c. COMPETITOR COMPARISON ══════════════════ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${NAVY} 0%, #0a1628 50%, ${NAVY} 100%)` }} />
        <AirflowWaves opacity={0.02} accent={BLUE} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[20%] left-[10%] w-[500px] h-[500px] rounded-full blur-[180px]" style={{ background: `${BLUE}06` }} /></div>
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Why Choose Us" title={`${data.businessName} vs Big Box HVAC`} accent={BLUE} />
          <GlassCard className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-5 py-4 text-sm font-semibold text-slate-400">Feature</th>
                    <th className="px-5 py-4 text-sm font-semibold text-center" style={{ color: BLUE }}>{data.businessName}</th>
                    <th className="px-5 py-4 text-sm font-semibold text-slate-500 text-center">Big Box / Chain</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_ROWS.map((row, i) => (
                    <tr key={row} className={i < COMPARISON_ROWS.length - 1 ? "border-b border-white/5" : ""}>
                      <td className="px-5 py-4 text-sm text-white">{row}</td>
                      <td className="px-5 py-4 text-center"><CheckCircle size={22} weight="fill" style={{ color: "#22c55e" }} /></td>
                      <td className="px-5 py-4 text-center text-sm text-slate-500">{i < 2 ? "Varies" : i < 5 ? "Extra Cost" : "No"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* ══════════════════ 7. PROJECTS ══════════════════ */}
      <section id="projects" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${NAVY} 0%, #0a1628 50%, ${NAVY} 100%)` }} />
        <AirflowWaves opacity={0.02} accent={BLUE} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[30%] left-[20%] w-[500px] h-[500px] rounded-full blur-[200px]" style={{ background: `${BLUE}06` }} /></div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <AnimatedSection>          <SectionHeader badge="Our Work" title="Recent Installations" accent={BLUE} /></AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projectImages.map((src, i) => {
              const titles = ["Central AC Installation", "Furnace Replacement", "Ductless Mini-Split System", "Commercial HVAC Upgrade"];
              const descs = ["Complete cooling system for a new construction home.", "High-efficiency furnace upgrade for maximum warmth.", "Zone-controlled comfort for an older home.", "Full commercial HVAC retrofit."];
              return (
                <div key={i} className="group relative rounded-2xl overflow-hidden border border-white/[0.06] hover:border-opacity-30 transition-all duration-500">
                  <img src={src} alt={titles[i]} className="w-full h-64 object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6"><h3 className="text-lg font-bold text-white mb-1">{titles[i]}</h3><p className="text-sm text-slate-300">{descs[i]}</p></div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════ 7b. VIDEO PLACEHOLDER ══════════════════ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${NAVY} 0%, #0a1020 50%, ${NAVY} 100%)` }} />
        <VentPattern opacity={0.02} accent={BLUE} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[30%] left-[15%] w-[400px] h-[400px] rounded-full blur-[160px]" style={{ background: `${BLUE}06` }} /></div>
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Behind the Scenes" title="Meet Our Team" accent={BLUE} />
          <div className="relative rounded-2xl overflow-hidden border border-white/10 group cursor-pointer">
            <img src={projectImages[0] || heroImage} alt="Meet our HVAC team" className="w-full h-[300px] md:h-[400px] object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full flex items-center justify-center border-2 bg-white/10 backdrop-blur-sm group-hover:scale-110 transition-transform duration-300" style={{ borderColor: BLUE }}>
                <Play size={36} weight="fill" style={{ color: BLUE }} />
              </div>
            </div>
            <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
              <div>
                <p className="text-white font-bold text-lg">See How We Work</p>
                <p className="text-slate-300 text-sm">Watch our team deliver comfort to your home</p>
              </div>
              <span className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-sm text-white border border-white/10">
                <Clock size={14} /> 2:30
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════ 7c. HVAC NEED QUIZ ══════════════════ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${NAVY} 0%, #0a1628 50%, ${NAVY} 100%)` }} />
        <AirflowWaves opacity={0.02} accent={BLUE} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] rounded-full blur-[160px]" style={{ background: `${ORANGE}06` }} /></div>
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Get Started" title="What's Your HVAC Need?" subtitle="Select your situation and we'll point you in the right direction." accent={BLUE} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {QUIZ_OPTIONS.map((option, i) => (
              <button
                key={option.label}
                onClick={() => setQuizSelection(i)}
                className="relative p-6 rounded-2xl border text-left transition-all duration-300 cursor-pointer group"
                style={{
                  borderColor: quizSelection === i ? option.color : "rgba(255,255,255,0.08)",
                  background: quizSelection === i ? `${option.color}15` : "rgba(255,255,255,0.02)",
                }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border" style={{ background: `${option.color}20`, borderColor: `${option.color}44` }}>
                    <option.icon size={24} weight="duotone" style={{ color: option.color }} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">{option.label}</h3>
                    <p className="text-sm text-slate-400">{option.desc}</p>
                  </div>
                </div>
                {quizSelection === i && (
                  <div className="mt-4 pt-4 border-t" style={{ borderColor: `${option.color}33` }}>
                    <MagneticButton href={`tel:${phoneDigits}`} className="w-full py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 cursor-pointer" style={{ background: option.color } as React.CSSProperties}>
                      <Phone size={16} weight="fill" /> Call Now: {data.phone}
                    </MagneticButton>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ 8. TESTIMONIALS ══════════════════ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${NAVY} 0%, #0a1020 50%, ${NAVY} 100%)` }} />
        <VentPattern opacity={0.02} accent={BLUE} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[20%] right-[15%] w-[400px] h-[400px] rounded-full blur-[160px]" style={{ background: `${BLUE}06` }} /></div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <AnimatedSection>          <SectionHeader badge="Testimonials" title="What Our Clients Say" accent={BLUE} /></AnimatedSection>
          {/* Google Reviews Header */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={24} weight="fill" style={{ color: "#facc15" }} />
              ))}
            </div>
            <div className="text-center sm:text-left">
              <span className="text-white font-bold text-lg">{data.googleRating || "4.9"}</span>
              <span className="text-slate-400 text-sm ml-2">out of 5 based on</span>
              <span className="text-white font-semibold text-sm ml-1">{data.reviewCount || "100"}+ reviews</span>
            </div>
            <span className="text-slate-500 text-xs px-3 py-1 rounded-full border border-white/10 bg-white/[0.03]">Google Verified</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <GlassCard key={i} className="p-6 h-full flex flex-col">
                <div className="flex gap-0.5 mb-4">{Array.from({ length: t.rating || 5 }).map((_, j) => <Star key={j} size={16} weight="fill" style={{ color: BLUE }} />)}</div>
                <p className="text-slate-300 leading-relaxed flex-1 text-sm mb-4">&ldquo;{t.text}&rdquo;</p>
                <div className="pt-4 border-t border-white/5"><span className="text-sm font-semibold text-white">{t.name}</span></div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ 9. CTA ══════════════════ */}
      <section className="relative z-10 py-20 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${BLUE}, ${BLUE}cc, ${BLUE})` }} />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='40' height='40' fill='none'/%3E%3Cpath d='M0 0L40 40M40 0L0 40' stroke='%23000' stroke-width='0.5'/%3E%3C/svg%3E\")" }} />

        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <Thermometer size={48} weight="fill" className="mx-auto mb-6 text-black/70" />
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-black mb-4">No Heat or AC? We&apos;re Here 24/7</h2>
          <p className="text-lg text-black/70 mb-8 max-w-xl mx-auto">Broken furnace in winter or AC failure in summer — do not suffer. Our emergency HVAC technicians respond fast.</p>
          <PhoneLink phone={data.phone} className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-black text-white font-bold text-lg hover:bg-black/80 transition-colors">
            <span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" /><span className="relative inline-flex rounded-full h-3 w-3 bg-red-600" /></span>
            {data.phone}
          </PhoneLink>
        </div>
      </section>

      {/* ══════════════════ 10. SERVICE AREAS ══════════════════ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${NAVY} 0%, #0a1628 50%, ${NAVY} 100%)` }} />
        <VentPattern opacity={0.02} accent={BLUE} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[40%] right-[20%] w-[400px] h-[400px] rounded-full blur-[180px]" style={{ background: `${ORANGE}06` }} /></div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <AnimatedSection>          <SectionHeader badge="Coverage Area" title="Areas We Serve" accent={BLUE} /></AnimatedSection>
          <div className="text-center">
            <GlassCard className="p-8 inline-block">
              <div className="flex items-center gap-3 text-lg"><MapPin size={24} weight="duotone" style={{ color: BLUE }} /><MapLink address={data.address} className="text-white font-semibold" /></div>
              <p className="text-slate-400 text-sm mt-2">&amp; Surrounding Areas</p>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* ══════════════════ 11. HOURS ══════════════════ */}
      {data.hours && (
        <section className="relative z-10 py-24 md:py-32 overflow-hidden">
          <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${NAVY} 0%, #0a1020 50%, ${NAVY} 100%)` }} />
          <AirflowWaves opacity={0.02} accent={BLUE} />
          <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[20%] left-[15%] w-[400px] h-[400px] rounded-full blur-[160px]" style={{ background: `${BLUE}06` }} /></div>
          <div className="max-w-3xl mx-auto px-6 relative z-10">
            <AnimatedSection>          <SectionHeader badge="Business Hours" title="When We're Available" accent={BLUE} /></AnimatedSection>
            <div className="text-center">
              <ShimmerBorder accent={BLUE}>
                <div className="p-8">
                  <Clock size={32} weight="duotone" style={{ color: BLUE }} className="mx-auto mb-4" />
                  <p className="text-slate-300 leading-relaxed whitespace-pre-line text-lg">{data.hours}</p>
                  <p className="text-sm mt-4 font-semibold" style={{ color: ORANGE }}>Emergency Service: 24/7/365</p>
                </div>
              </ShimmerBorder>
            </div>
          </div>
        </section>
      )}

      
      {/* ══════════════════ MID-PAGE CTA ══════════════════ */}
      <section className="relative z-10 py-12 sm:py-16 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${BLUE}15, ${BLUE}08)` }} />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: BLUE }}>
            Don&apos;t Miss Out
          </p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-3">
            Ready to Get Started?
          </h2>
          <p className="text-slate-400 mb-6 text-sm sm:text-base">
            Limited time — claim your free professional website today before it&apos;s offered to a competitor.
          </p>
          <a
            href={`/claim/${data.id}`}
            className="inline-flex items-center gap-2 min-h-[48px] px-8 py-3 rounded-full text-white font-bold text-base hover:shadow-lg transition-all duration-300"
            style={{ background: BLUE }}
          >
            Claim This Website
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </a>
        </div>
      </section>

      {/* ══════════════════ 12. FAQ ══════════════════ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${NAVY} 0%, #0a1020 50%, ${NAVY} 100%)` }} />
        <VentPattern opacity={0.02} accent={BLUE} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[20%] left-[15%] w-[400px] h-[400px] rounded-full blur-[160px]" style={{ background: `${BLUE}06` }} /></div>
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <AnimatedSection>          <SectionHeader badge="FAQ" title="Common Questions" accent={BLUE} /></AnimatedSection>
          <div className="space-y-3">
            {faqs.map((faq, i) => <AccordionItem key={i} question={faq.q} answer={faq.a} isOpen={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} />)}
          </div>
        </div>
      </section>

      {/* ══════════════════ 13. CONTACT ══════════════════ */}
      <section id="contact" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${NAVY} 0%, #0a1628 50%, ${NAVY} 100%)` }} />
        <VentPattern opacity={0.02} accent={BLUE} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] rounded-full blur-[180px]" style={{ background: `${BLUE}06` }} /></div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: BLUE, borderColor: `${BLUE}33`, background: `${BLUE}0d` }}>Contact Us</span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6 text-white">Get Your Free Estimate</h2>
              <p className="text-slate-400 leading-relaxed mb-8">Ready for perfect comfort? Contact {data.businessName} today for a free, no-obligation estimate.</p>
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: BLUE_GLOW }}><MapPin size={20} weight="duotone" style={{ color: BLUE }} /></div>
                    <div><p className="text-sm font-semibold text-white">Address</p><MapLink address={data.address} className="text-sm text-slate-400" /></div>
                </div>
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: BLUE_GLOW }}><Phone size={20} weight="duotone" style={{ color: BLUE }} /></div>
                    <div><p className="text-sm font-semibold text-white">Phone</p><PhoneLink phone={data.phone} className="text-sm text-slate-400" /></div>
                </div>
                {[
                  { icon: Fan, label: "Emergency", value: "24/7/365 Emergency HVAC Service" },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: BLUE_GLOW }}><item.icon size={20} weight="duotone" style={{ color: BLUE }} /></div>
                    <div><p className="text-sm font-semibold text-white">{item.label}</p><p className="text-sm text-slate-400">{item.value}</p></div>
                  </div>
                ))}
                {data.hours && (
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: BLUE_GLOW }}><Clock size={20} weight="duotone" style={{ color: BLUE }} /></div>
                    <div><p className="text-sm font-semibold text-white">Hours</p><p className="text-sm text-slate-400 whitespace-pre-line">{data.hours}</p></div>
                  </div>
                )}
              </div>
            </div>
            <GlassCard className="p-8">
              <h3 className="text-xl font-semibold text-white mb-6">Request a Free Estimate</h3>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className="block text-sm text-slate-400 mb-1.5">First Name</label><input type="text" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none text-sm" placeholder="John" /></div>
                  <div><label className="block text-sm text-slate-400 mb-1.5">Last Name</label><input type="text" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none text-sm" placeholder="Doe" /></div>
                </div>
                <div><label className="block text-sm text-slate-400 mb-1.5">Phone</label><input type="tel" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none text-sm" placeholder="(555) 123-4567" /></div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">Service Needed</label>
                  <select className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none text-sm">
                    <option value="" className="bg-neutral-900">Select a service</option>
                    {data.services.map((s) => <option key={s.name} value={s.name.toLowerCase().replace(/\s+/g, "-")} className="bg-neutral-900">{s.name}</option>)}
                  </select>
                </div>
                <div><label className="block text-sm text-slate-400 mb-1.5">Message</label><textarea rows={4} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none text-sm resize-none" placeholder="Tell us about your HVAC needs..." /></div>
                <MagneticButton className="w-full py-4 rounded-xl text-base font-semibold text-black flex items-center justify-center gap-2 cursor-pointer" style={{ background: BLUE } as React.CSSProperties}>
                  Send Request <ArrowRight size={18} weight="bold" />
                </MagneticButton>
              </form>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* ══════════════════ 14. COMFORT GUARANTEE CTA ══════════════════ */}
      <section className="relative z-10 py-20 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${NAVY} 0%, #0a1020 100%)` }} />
        <VentPattern opacity={0.015} accent={BLUE} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full blur-[180px]" style={{ background: `${BLUE}08` }} /></div>
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <ShimmerBorder accent={BLUE}>
            <div className="p-8 md:p-14">
              <ShieldCheck size={56} weight="fill" style={{ color: BLUE }} className="mx-auto mb-5" />
              <h2 className="text-2xl md:text-4xl font-black text-white mb-3">100% Satisfaction Guaranteed</h2>
              <p className="text-xl md:text-2xl font-semibold mb-6" style={{ color: BLUE }}>If You&apos;re Not Comfortable, We&apos;re Not Done</p>
              <p className="text-slate-400 leading-relaxed max-w-2xl mx-auto text-lg mb-4">Every job by {data.businessName} is backed by our comfort guarantee. We stand behind our work with industry-leading warranties on all HVAC installations and repairs.</p>
              <p className="text-sm mb-8" style={{ color: ORANGE }}>
                <CurrencyDollar size={16} weight="bold" className="inline -mt-0.5" /> Flexible financing available — as low as $89/month for a new system
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <MagneticButton href={`tel:${phoneDigits}`} className="px-8 py-4 rounded-full text-base font-bold text-black flex items-center gap-2 cursor-pointer" style={{ background: BLUE } as React.CSSProperties}>
                  <Phone size={18} weight="fill" /> Call for Free Estimate
                </MagneticButton>
                <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/10 flex items-center gap-2 cursor-pointer">
                  <CalendarCheck size={18} weight="duotone" /> Schedule Online
                </MagneticButton>
              </div>
              <div className="flex flex-wrap justify-center gap-3 mt-8">
                {["EPA Certified", "Free Estimates", "Satisfaction Guaranteed", "24/7 Emergency", "Financing Available"].map((item) => (
                  <span key={item} className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border" style={{ color: BLUE, borderColor: `${BLUE}33`, background: `${BLUE}0d` }}>
                    <CheckCircle size={16} weight="fill" /> {item}
                  </span>
                ))}
              </div>
            </div>
          </ShimmerBorder>
        </div>
      </section>

      {/* ══════════════════ 15. FOOTER ══════════════════ */}
      <footer className="relative z-10 border-t border-white/5 py-10 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${NAVY} 0%, #080e1a 100%)` }} />
        <VentPattern opacity={0.015} accent={BLUE} />
        <div className="mx-auto max-w-6xl px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3"><Fan size={22} weight="fill" style={{ color: BLUE }} /><span className="text-lg font-bold text-white">{data.businessName}</span></div>
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
          <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-500"><Fan size={14} weight="fill" style={{ color: BLUE }} /><span>{data.businessName} &copy; {new Date().getFullYear()}</span></div>
            <div className="flex items-center gap-2 text-xs text-slate-600"><BluejayLogo className="w-4 h-4" /><span>Created by <a href="https://bluejayportfolio.com" target="_blank" rel="noopener noreferrer" style={{textDecoration:"underline"}}>bluejayportfolio.com</a></span></div>
          </div>
        </div>
      </footer>

      <ClaimBanner businessName={data.businessName} accentColor={BLUE} prospectId={data.id} />
      <div className="h-14 md:h-28" />
    </main>
  );
}
