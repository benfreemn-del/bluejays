"use client";

/* eslint-disable @next/next/no-img-element -- These static marketing and preview components intentionally use plain img tags to preserve existing markup and visual behavior during lint-only cleanup. */
/* eslint-disable react-hooks/purity -- Decorative particle values are intentionally randomized for static visual effects in these marketing pages and previews; this preserves existing appearance without changing business logic. */

import { useState, useEffect, useRef, useCallback } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  AnimatePresence,
} from "framer-motion";
import {
  SprayBottle,
  Broom,
  ShieldCheck,
  Clock,
  Phone,
  MapPin,
  CaretDown,
  List,
  X,
  Sparkle,
  House,
  Buildings,
  CheckCircle,
  ArrowRight,
  Star,
  Leaf,
  Drop,
  HandSoap,
  CurrencyDollar,
  Play,
  CalendarCheck,
  Users,
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
const CHARCOAL = "#1a1a1a";
const DEFAULT_BLUE = "#0284c7";
const BLUE_LIGHT = "#38bdf8";
const MINT = "#34d399";

function getAccent(accentColor?: string) {
  const c = accentColor || DEFAULT_BLUE;
  return { ACCENT: c, ACCENT_GLOW: `${c}26`, ACCENT_LIGHT: BLUE_LIGHT, MINT };
}

/* ───────────────────────── SERVICE ICON MAP ───────────────────────── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SERVICE_ICON_MAP: Record<string, any> = {
  residential: House,
  home: House,
  office: Buildings,
  commercial: Buildings,
  deep: SprayBottle,
  carpet: Broom,
  window: Sparkle,
  sanitiz: HandSoap,
  disinfect: HandSoap,
  move: House,
  green: Leaf,
  eco: Leaf,
};

function getServiceIcon(serviceName: string) {
  const lower = serviceName.toLowerCase();
  for (const [key, Icon] of Object.entries(SERVICE_ICON_MAP)) {
    if (lower.includes(key)) return Icon;
  }
  return Sparkle;
}

/* ───────────────────────── STOCK FALLBACK IMAGES ───────────────────────── */
const STOCK_HERO_POOL = ["https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1400&q=80"];
const STOCK_ABOUT_POOL = ["https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=600&q=80"];
const STOCK_PROJECTS = [
  "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=600&q=80",
  "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=600&q=80",
  "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=800&q=80",
  "https://images.unsplash.com/photo-1528740561666-dc2479dc08ab?w=800&q=80",
];

/* ───────────────────────── TRUST & SAFETY BADGES DATA ───────────────────────── */
const TRUST_BADGES = [
  { icon: ShieldCheck, label: "Background-Checked Staff", desc: "Every team member passes rigorous background screening" },
  { icon: CheckCircle, label: "Bonded & Insured", desc: "Full liability coverage for your peace of mind" },
  { icon: Leaf, label: "Eco-Friendly Products", desc: "Non-toxic, green-certified cleaning solutions" },
  { icon: Star, label: "Satisfaction Guaranteed", desc: "Not happy? We re-clean for free, no questions asked" },
];

/* ───────────────────────── PRICING PLANS DATA ───────────────────────── */
const PRICING_PLANS = [
  { name: "Standard Clean", price: "$149", period: "starting at", features: ["All rooms dusted & vacuumed", "Kitchen & bathroom wipe-down", "Floors mopped", "Trash removed", "Beds made"], icon: SprayBottle, featured: false },
  { name: "Deep Clean", price: "$249", period: "starting at", features: ["Everything in Standard", "Inside appliances cleaned", "Baseboards & vents scrubbed", "Light fixtures dusted", "Cabinet fronts wiped", "Grout & tile scrubbed"], icon: Broom, featured: true },
  { name: "Move-In/Move-Out", price: "$349", period: "starting at", features: ["Everything in Deep Clean", "Inside all cabinets & drawers", "Oven & fridge deep clean", "Garage sweep", "Window tracks cleaned", "Wall spot cleaning"], icon: House, featured: false },
];

/* ───────────────────────── WHAT WE CLEAN AREAS DATA ───────────────────────── */
const CLEANING_AREAS = [
  { name: "Kitchens", icon: SprayBottle, desc: "Counters degreased, appliances wiped, sinks sanitized" },
  { name: "Bathrooms", icon: Drop, desc: "Toilets, showers, tubs scrubbed and disinfected" },
  { name: "Bedrooms", icon: House, desc: "Dusted, vacuumed, beds made, surfaces polished" },
  { name: "Living Areas", icon: Sparkle, desc: "Furniture dusted, floors cleaned, cushions freshened" },
  { name: "Windows", icon: Sparkle, desc: "Interior glass, sills, and tracks wiped streak-free" },
  { name: "Carpets", icon: Broom, desc: "Deep vacuumed, spot treated, deodorized" },
  { name: "Appliances", icon: HandSoap, desc: "Oven, fridge, microwave, dishwasher deep cleaned" },
  { name: "Offices", icon: Buildings, desc: "Desks sanitized, floors cleaned, trash emptied" },
];

/* ───────────────────────── CLEANING CHECKLIST DATA ───────────────────────── */
const CLEANING_CHECKLIST = [
  "All surfaces wiped & sanitized",
  "Floors vacuumed & mopped",
  "Bathrooms scrubbed top-to-bottom",
  "Kitchen counters & appliances cleaned",
  "Trash removed & bins lined",
  "Beds made & linens straightened",
  "Mirrors & glass polished",
  "Baseboards & door frames dusted",
  "Light switches & handles disinfected",
  "Cobwebs removed from corners",
];

/* ───────────────────────── ECO-FRIENDLY FEATURES DATA ───────────────────────── */
const ECO_FEATURES = [
  { icon: Leaf, title: "Non-Toxic Products", desc: "Plant-based formulas that clean powerfully without harmful chemicals" },
  { icon: ShieldCheck, title: "Allergen Reduction", desc: "HEPA filtration and hypoallergenic products reduce airborne irritants" },
  { icon: CheckCircle, title: "Green Seal Certified", desc: "Our products meet the highest environmental safety standards" },
  { icon: Drop, title: "No Harsh Residue", desc: "Zero chemical residue left behind — safe for crawling babies and pets" },
];

/* ───────────────────────── COMPETITOR COMPARISON DATA ───────────────────────── */
const COMPARISON_ROWS = [
  { feature: "Background-Checked Staff", us: true, them: "Sometimes" },
  { feature: "Satisfaction Guarantee", us: true, them: "No" },
  { feature: "Eco-Friendly Products", us: true, them: "Rarely" },
  { feature: "Online Booking", us: true, them: "Sometimes" },
  { feature: "Same-Day Available", us: true, them: "No" },
  { feature: "Consistent Teams", us: true, them: "Varies" },
  { feature: "Supplies Included", us: true, them: "Sometimes" },
];

/* ───────────────────────── CLEANING FREQUENCY QUIZ DATA ───────────────────────── */
const FREQUENCY_OPTIONS = [
  { freq: "Weekly", color: "#22c55e", desc: "Best for families with kids & pets. Keeps your home consistently spotless.", tag: "Best for Families" },
  { freq: "Bi-Weekly", color: "#3b82f6", desc: "Our most popular option. Great balance of clean and budget-friendly.", tag: "Most Popular" },
  { freq: "Monthly", color: "#a855f7", desc: "Ideal for low-traffic homes or as a maintenance refresh between deep cleans.", tag: "Great for Maintenance" },
];

/* ───────────────────────── FLOATING SPARKLE PARTICLES ───────────────────────── */
function FloatingSparkles({ accent }: { accent: string }) {
  const particles = Array.from({ length: 22 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 8,
    duration: 5 + Math.random() * 7,
    size: 2 + Math.random() * 3,
    opacity: 0.15 + Math.random() * 0.35,
    isMint: Math.random() > 0.65,
  }));
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden hidden md:block">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{ left: `${p.x}%`, width: p.size, height: p.size, background: p.isMint ? MINT : accent, willChange: "transform, opacity" }}
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

/* ───────────────────────── SPARKLE / BUBBLE SVG PATTERN ───────────────────────── */
function SparklePattern({ opacity = 0.03, accent }: { opacity?: number; accent: string }) {
  const patternId = `sparklePatternV2-${accent.replace("#", "")}`;
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }}>
      <defs>
        <pattern id={patternId} width="100" height="100" patternUnits="userSpaceOnUse">
          <circle cx="10" cy="10" r="1.5" fill={accent} opacity="0.4" />
          <circle cx="50" cy="30" r="1" fill={MINT} opacity="0.3" />
          <circle cx="90" cy="15" r="1.8" fill={accent} opacity="0.35" />
          <circle cx="30" cy="70" r="1.2" fill={MINT} opacity="0.3" />
          <circle cx="70" cy="80" r="2" fill={accent} opacity="0.4" />
          <circle cx="20" cy="50" r="0.8" fill={accent} opacity="0.25" />
          <path d="M45 45 L50 40 L55 45 L50 50 Z" fill={accent} opacity="0.2" />
          <path d="M80 55 L85 50 L90 55 L85 60 Z" fill={MINT} opacity="0.15" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  );
}

/* ───────────────────────── WATER DROP SVG ───────────────────────── */
function WaterDropBackground({ opacity = 0.03, accent }: { opacity?: number; accent: string }) {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }} viewBox="0 0 1000 600" preserveAspectRatio="none">
      <path d="M200 100 Q200 50 220 100 Q240 150 200 150 Q160 150 200 100 Z" fill={accent} />
      <path d="M700 80 Q700 40 715 80 Q730 120 700 120 Q670 120 700 80 Z" fill={MINT} />
      <path d="M450 400 Q450 350 470 400 Q490 450 450 450 Q410 450 450 400 Z" fill={accent} />
      <circle cx="150" cy="400" r="30" fill={accent} opacity="0.3" />
      <circle cx="850" cy="300" r="20" fill={MINT} opacity="0.3" />
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
      <motion.a href={href} ref={ref as unknown as React.Ref<HTMLAnchorElement>} style={{ x: springX, y: springY, willChange: "transform", ...style }}
        onMouseMove={handleMouseMove as unknown as React.MouseEventHandler<HTMLAnchorElement>} onMouseLeave={handleMouseLeave} className={className} whileTap={{ scale: 0.97 }}>
        {children}
      </motion.a>
    );
  }
  return (
    <motion.button ref={ref} style={{ x: springX, y: springY, willChange: "transform", ...style }}
      onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} onClick={onClick} className={className} whileTap={{ scale: 0.97 }}>
      {children}
    </motion.button>
  );
}

/* ───────────────────────── SHIMMER BORDER ───────────────────────── */
function ShimmerBorder({ children, className = "", accent }: { children: React.ReactNode; className?: string; accent: string }) {
  return (
    <div className={`relative rounded-2xl p-[1px] overflow-hidden ${className}`}>
      <motion.div className="absolute inset-0 rounded-2xl" style={{ background: `conic-gradient(from 0deg, transparent, ${accent}, transparent, ${MINT}, transparent)`, willChange: "transform" }}
        animate={{ rotate: [0, 360] }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} />
      <div className="relative rounded-2xl bg-[#141414] z-10">{children}</div>
    </div>
  );
}

/* ───────────────────────── ACCORDION ITEM ───────────────────────── */
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
      <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border"
        style={{ color: accent, borderColor: `${accent}33`, background: `${accent}0d` }}>{badge}</span>
      <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white">{title}</h2>
      <div className="h-0.5 w-16 mx-auto mt-4" style={{ background: `linear-gradient(to right, ${accent}, transparent)` }} />
      {subtitle && <p className="text-slate-400 mt-4 max-w-2xl text-lg leading-relaxed mx-auto">{subtitle}</p>}
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════ */
/* ───────────────────────── ANIMATED SECTION ───────────────────────── */
function AnimatedSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 1, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: "easeOut" as const }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function V2CleaningPreview({ data }: { data: GeneratedSiteData }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const { ACCENT, ACCENT_GLOW } = getAccent(data.accentColor);

  const uniquePhotos = data.photos ? [...new Set(data.photos)] : [];
  const heroImage = uniquePhotos[0] || pickFromPool(STOCK_HERO_POOL, data.businessName);
  const heroCardImage = uniquePhotos[1] || pickFromPool(STOCK_ABOUT_POOL, data.businessName, 1);
  const aboutImage = uniquePhotos[2] || pickFromPool(STOCK_ABOUT_POOL, data.businessName, 2);
  const projectImages = uniquePhotos.length > 2 ? uniquePhotos.slice(2, 6) : pickGallery(STOCK_PROJECTS, data.businessName);

  const processSteps = [
    { step: "01", title: "Book Online or Call", desc: "Schedule your cleaning in minutes. We work around your availability." },
    { step: "02", title: "Custom Plan", desc: "We assess your space and create a tailored cleaning checklist." },
    { step: "03", title: "Spotless Clean", desc: "Our trained team arrives on time with eco-friendly supplies and equipment." },
    { step: "04", title: "Final Walkthrough", desc: "We do a quality check to ensure every corner meets our high standards." },
  ];

  const faqs = [
    { q: `What cleaning services does ${data.businessName} offer?`, a: `We provide a full range of professional cleaning services including ${data.services.slice(0, 3).map(s => s.name).join(", ")}, and more. Contact us for a free estimate.` },
    { q: "Do you bring your own supplies?", a: "Yes! We arrive fully equipped with professional-grade, eco-friendly cleaning products and equipment. You don't need to provide anything." },
    { q: "Are your cleaners background checked?", a: `Every team member at ${data.businessName} undergoes thorough background checks, is fully insured, and receives ongoing professional training.` },
    { q: "Can I customize my cleaning plan?", a: "Absolutely! We tailor every cleaning to your specific needs. Whether you need extra attention on kitchens, bathrooms, or specialty areas, we've got you covered." },
  ];

  /* Fallback testimonials */
  const fallbackTestimonials = [
    { name: "Nancy W.", text: "Coming home to a spotless house every week is the best feeling. They're thorough and trustworthy.", rating: 5 },
    { name: "Steve P.", text: "We've tried three cleaning services before. This one is by far the most consistent and reliable.", rating: 5 },
    { name: "Karen L.", text: "They deep-cleaned our home before we moved in and it was absolutely immaculate. Worth every penny.", rating: 5 }
  ];
  const testimonials = data.testimonials?.length > 0 ? data.testimonials : fallbackTestimonials;

  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden" style={{ fontFamily: "Poppins, system-ui, sans-serif", background: CHARCOAL, color: "#f1f5f9" }}>
      <FloatingSparkles accent={ACCENT} />

      {/* ══════════════════ 1. NAV ══════════════════ */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-4">
          <GlassCard className="flex items-center justify-between px-4 md:px-6 py-3">
            <div className="flex items-center gap-2">
              <Sparkle size={24} weight="fill" style={{ color: ACCENT }} />
              <span className="text-lg font-bold tracking-tight text-white">{data.businessName}</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
              <a href="#services" className="hover:text-white transition-colors">Services</a>
              <a href="#about" className="hover:text-white transition-colors">About</a>
              <a href="#gallery" className="hover:text-white transition-colors">Gallery</a>
              <a href="#contact" className="hover:text-white transition-colors">Contact</a>
            </div>
            <div className="flex items-center gap-3">
              <MagneticButton className="px-4 md:px-5 py-2 rounded-full text-sm font-semibold text-white transition-colors cursor-pointer" style={{ background: ACCENT } as React.CSSProperties}>
                Free Estimate
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
                  {[{ label: "Services", href: "#services" }, { label: "About", href: "#about" }, { label: "Gallery", href: "#gallery" }, { label: "Contact", href: "#contact" }].map((link) => (
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
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          <div className="space-y-8 rounded-2xl bg-black/50 backdrop-blur-md p-6 md:p-8 border border-white/5">
            <div>
              <p className="text-sm uppercase tracking-widest mb-4" style={{ color: ACCENT }}>Professional Cleaning Services</p>
              <h1 className="text-3xl md:text-6xl tracking-tighter leading-none font-bold text-white" style={{ textShadow: "0 2px 20px rgba(0,0,0,0.8), 0 4px 40px rgba(0,0,0,0.5)" }}>
                {data.tagline}
              </h1>
            </div>
            <p className="text-lg text-slate-400 max-w-md leading-relaxed">
              {(() => { const t = data.about; if (t.length <= 180) return t; const dot = t.indexOf('.', 80); return dot > 0 && dot < 220 ? t.slice(0, dot + 1) : t.slice(0, 180).trim() + '...'; })()}
            </p>
            <div className="flex flex-wrap gap-4">
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white flex items-center gap-2 cursor-pointer" style={{ background: ACCENT } as React.CSSProperties}>
                Get Free Estimate <ArrowRight size={18} weight="bold" />
              </MagneticButton>
              <MagneticButton href={`tel:${data.phone.replace(/\D/g, "")}`} className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/10 flex items-center gap-2 cursor-pointer">
                <Phone size={18} weight="duotone" /> <PhoneLink phone={data.phone} />
              </MagneticButton>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-slate-400">
              <span className="flex items-center gap-2"><MapPin size={16} weight="duotone" style={{ color: ACCENT }} /><MapLink address={data.address} /></span>
              <span className="flex items-center gap-2"><Leaf size={16} weight="duotone" style={{ color: ACCENT }} />Eco-Friendly Products</span>
            </div>
          </div>
          <div className="hidden md:block relative">
            <div className="relative rounded-2xl overflow-hidden border border-white/10">
              <img src={heroCardImage} alt={`${data.businessName} professional cleaning`} className="w-full h-[500px] object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-transparent to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#1a1a1a]/40 to-transparent" />
              <div className="absolute bottom-6 left-6 flex items-center gap-3">
                <div className="px-4 py-2 rounded-full backdrop-blur-md bg-black/50 border flex items-center gap-2" style={{ borderColor: `${ACCENT}4d` }}>
                  <ShieldCheck size={18} weight="fill" style={{ color: ACCENT }} />
                  <span className="text-sm font-semibold text-white">Bonded &amp; Insured</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════ 3. STATS ══════════════════ */}
      <section className="relative z-10 py-16 overflow-hidden border-y" style={{ borderColor: `${ACCENT}1a` }}>
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #0f172a 0%, #1a1a1a 100%)" }} />
        <SparklePattern opacity={0.02} accent={ACCENT} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] rounded-full blur-[180px]" style={{ background: `${ACCENT}08` }} /></div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {data.stats.map((stat, i) => {
              const statIcons = [Sparkle, ShieldCheck, Clock, Star];
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

      {/* ══════════════════ TRUST & SAFETY BADGES ══════════════════ */}
      <section className="relative z-10 py-20 md:py-24 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0c1929 50%, #1a1a1a 100%)" }} />
        <SparklePattern opacity={0.02} accent={ACCENT} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[30%] left-[20%] w-[500px] h-[500px] rounded-full blur-[180px]" style={{ background: `${ACCENT}06` }} /></div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Your Safety Matters" title="Why Families Trust Us in Their Homes" subtitle="We know letting someone into your home is personal. That's why we go above and beyond to earn your trust." accent={ACCENT} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TRUST_BADGES.map((badge) => (
              <GlassCard key={badge.label} className="p-6 text-center">
                <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${ACCENT}22, ${ACCENT}0a)`, border: `1px solid ${ACCENT}33` }}>
                  <badge.icon size={28} weight="duotone" style={{ color: ACCENT }} />
                </div>
                <h3 className="text-base font-bold text-white mb-2">{badge.label}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{badge.desc}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ 4. SERVICES ══════════════════ */}
      <section id="services" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0f172a 50%, #1a1a1a 100%)" }} />
        <SparklePattern accent={ACCENT} />
        <WaterDropBackground opacity={0.025} accent={ACCENT} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[10%] right-[5%] w-[500px] h-[500px] rounded-full blur-[160px]" style={{ background: `${ACCENT}08` }} />
          <div className="absolute bottom-[10%] left-[5%] w-[400px] h-[400px] rounded-full blur-[140px]" style={{ background: `${MINT}05` }} />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Our Services" title="Spotless Cleaning Solutions" subtitle={`From routine home cleaning to deep commercial sanitization, ${data.businessName} delivers a pristine environment every time.`} accent={ACCENT} />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.services.map((service, i) => {
              const Icon = getServiceIcon(service.name);
              return (
                <div key={service.name} className="group relative p-7 rounded-2xl border border-white/[0.06] hover:border-opacity-30 transition-all duration-500 overflow-hidden bg-white/[0.02]">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: `radial-gradient(circle at 50% 0%, ${ACCENT}15, transparent 70%)` }} />
                  <div className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `linear-gradient(to right, transparent, ${ACCENT}4d, transparent)` }} />
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-5">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 border" style={{ background: ACCENT_GLOW, borderColor: `${ACCENT}33` }}>
                        <Icon size={24} weight="duotone" style={{ color: ACCENT }} />
                      </div>
                      <span className="text-xs font-mono text-slate-600">{String(i + 1).padStart(2, "0")}</span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{service.name}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{service.description || ""}</p>
                    {service.price && <p className="text-sm font-semibold mt-3" style={{ color: ACCENT }}>{service.price}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════ CLEANING PRICING PLANS ══════════════════ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0c1929 50%, #1a1a1a 100%)" }} />
        <WaterDropBackground opacity={0.025} accent={ACCENT} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[15%] left-[10%] w-[400px] h-[400px] rounded-full blur-[160px]" style={{ background: `${ACCENT}06` }} />
          <div className="absolute bottom-[15%] right-[10%] w-[300px] h-[300px] rounded-full blur-[140px]" style={{ background: `${MINT}05` }} />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Transparent Pricing" title="Cleaning Plans for Every Home" subtitle="No hidden fees. No surprises. Just honest pricing for a spotless home." accent={ACCENT} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PRICING_PLANS.map((plan) => (
              <div key={plan.name} className="relative">
                {plan.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 px-4 py-1 rounded-full text-xs font-bold text-white" style={{ background: ACCENT }}>
                    Most Popular
                  </div>
                )}
                {plan.featured ? (
                  <ShimmerBorder accent={ACCENT}>
                    <div className="p-7">
                      <div className="w-12 h-12 rounded-xl mb-4 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${ACCENT}22, ${ACCENT}0a)`, border: `1px solid ${ACCENT}33` }}>
                        <plan.icon size={24} weight="duotone" style={{ color: ACCENT }} />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
                      <div className="flex items-baseline gap-1 mb-1">
                        <span className="text-3xl font-black text-white">{plan.price}</span>
                      </div>
                      <p className="text-xs text-slate-500 mb-5">{plan.period}</p>
                      <ul className="space-y-2.5 mb-6">
                        {plan.features.map((f) => (
                          <li key={f} className="flex items-start gap-2 text-sm text-slate-300">
                            <CheckCircle size={16} weight="fill" style={{ color: ACCENT }} className="mt-0.5 shrink-0" />
                            {f}
                          </li>
                        ))}
                      </ul>
                      <MagneticButton className="w-full py-3 rounded-xl text-sm font-semibold text-white cursor-pointer text-center flex items-center justify-center gap-2" style={{ background: ACCENT } as React.CSSProperties}>
                        Book Now <ArrowRight size={16} weight="bold" />
                      </MagneticButton>
                    </div>
                  </ShimmerBorder>
                ) : (
                  <GlassCard className="p-7 h-full flex flex-col">
                    <div className="w-12 h-12 rounded-xl mb-4 flex items-center justify-center" style={{ background: `${ACCENT}0d`, border: `1px solid ${ACCENT}1a` }}>
                      <plan.icon size={24} weight="duotone" style={{ color: ACCENT }} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
                    <div className="flex items-baseline gap-1 mb-1">
                      <span className="text-3xl font-black text-white">{plan.price}</span>
                    </div>
                    <p className="text-xs text-slate-500 mb-5">{plan.period}</p>
                    <ul className="space-y-2.5 mb-6 flex-1">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-sm text-slate-300">
                          <CheckCircle size={16} weight="fill" style={{ color: `${ACCENT}80` }} className="mt-0.5 shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <MagneticButton className="w-full py-3 rounded-xl text-sm font-semibold text-white border border-white/10 cursor-pointer text-center flex items-center justify-center gap-2">
                      Get Quote <ArrowRight size={16} weight="bold" />
                    </MagneticButton>
                  </GlassCard>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ 5. WHY CHOOSE US / ABOUT ══════════════════ */}
      <section id="about" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0c1929 50%, #1a1a1a 100%)" }} />
        <WaterDropBackground opacity={0.02} accent={ACCENT} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[20%] left-[10%] w-[500px] h-[500px] rounded-full blur-[180px]" style={{ background: `${ACCENT}06` }} /></div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="relative">
              <div className="rounded-2xl overflow-hidden border border-white/10">
                <img src={aboutImage} alt={`${data.businessName} team`} className="w-full h-[400px] object-cover" />
              </div>
              <div className="absolute -bottom-4 -right-4 md:bottom-6 md:-right-6">
                <div className="px-5 py-3 rounded-xl backdrop-blur-md border text-white font-bold text-sm shadow-lg" style={{ background: `${ACCENT}e6`, borderColor: `${ACCENT}80` }}>
                  {data.stats[0] ? `${data.stats[0].value} ${data.stats[0].label}` : "Trusted Experts"}
                </div>
              </div>
            </div>
            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: ACCENT, borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}>Why Choose Us</span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6 text-white">A Cleaner Space, A Healthier Life</h2>
              <p className="text-slate-400 leading-relaxed mb-8">{data.about}</p>
              <div className="grid grid-cols-2 gap-4">
                {[{ icon: ShieldCheck, label: "Bonded & Insured" }, { icon: Leaf, label: "Eco-Friendly" }, { icon: Star, label: "5-Star Rated" }, { icon: CheckCircle, label: "Satisfaction Guaranteed" }].map((badge) => (
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

      {/* ══════════════════ 6. PROCESS ══════════════════ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0f172a 50%, #1a1a1a 100%)" }} />
        <SparklePattern opacity={0.025} accent={ACCENT} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] rounded-full blur-[180px]" style={{ background: `${MINT}06` }} /></div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <AnimatedSection>          <SectionHeader badge="Our Process" title="How We Work" accent={ACCENT} /></AnimatedSection>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {processSteps.map((step, i) => (
              <div key={step.step} className="relative">
                {i < processSteps.length - 1 && <div className="hidden lg:block absolute top-10 left-[calc(50%+40px)] w-[calc(100%-80px)] h-px" style={{ background: `linear-gradient(to right, ${ACCENT}33, ${ACCENT}11)` }} />}
                <GlassCard className="p-6 text-center relative">
                  <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-black" style={{ background: `linear-gradient(135deg, ${ACCENT}22, ${ACCENT}0a)`, color: ACCENT, border: `1px solid ${ACCENT}33` }}>
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

      {/* ══════════════════ 7. GALLERY ══════════════════ */}
      <section id="gallery" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0c1929 50%, #1a1a1a 100%)" }} />
        <WaterDropBackground opacity={0.02} accent={ACCENT} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[30%] left-[20%] w-[500px] h-[500px] rounded-full blur-[200px]" style={{ background: `${ACCENT}06` }} /></div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <AnimatedSection>          <SectionHeader badge="Our Work" title="Recent Projects" accent={ACCENT} /></AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projectImages.map((src, i) => {
              const titles = ["Deep Kitchen Clean", "Office Sanitization", "Move-Out Cleaning", "Post-Construction Cleanup"];
              const descs = ["Complete kitchen deep clean and degreasing.", "Full office sanitization and floor care.", "Top-to-bottom move-out cleaning service.", "Post-construction dust and debris removal."];
              return (
                <div key={i} className="group relative rounded-2xl overflow-hidden border border-white/[0.06] hover:border-opacity-30 transition-all duration-500">
                  <img src={src} alt={titles[i] || `Project ${i + 1}`} className="w-full h-64 object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-lg font-bold text-white mb-1">{titles[i] || `Project ${i + 1}`}</h3>
                    <p className="text-sm text-slate-300">{descs[i] || ""}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════ ECO-FRIENDLY / GREEN CLEANING ══════════════════ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0a1f15 50%, #1a1a1a 100%)" }} />
        <SparklePattern opacity={0.02} accent={MINT} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] right-[15%] w-[500px] h-[500px] rounded-full blur-[200px]" style={{ background: `${MINT}08` }} />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Green Cleaning" title="Safe for Your Family & Pets" subtitle="We believe a clean home shouldn't come at the cost of your health. Every product we use is carefully chosen to protect your loved ones." accent={MINT} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {ECO_FEATURES.map((feat) => (
              <GlassCard key={feat.title} className="p-6 text-center">
                <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: `${MINT}15`, border: `1px solid ${MINT}33` }}>
                  <feat.icon size={28} weight="duotone" style={{ color: MINT }} />
                </div>
                <h3 className="text-base font-bold text-white mb-2">{feat.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{feat.desc}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ OUR RESULTS ══════════════════ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0f172a 50%, #1a1a1a 100%)" }} />
        <WaterDropBackground opacity={0.02} accent={ACCENT} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[30%] left-[10%] w-[500px] h-[500px] rounded-full blur-[180px]" style={{ background: `${ACCENT}06` }} /></div>
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Our Results" title="See the Sparkle" subtitle={`Every cleaning from ${data.businessName} delivers a visible transformation you can feel the moment you walk in.`} accent={ACCENT} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <GlassCard className="overflow-hidden">
              <div className="relative">
                <img src="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&q=80" alt="Sparkling clean kitchen" className="w-full h-64 object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <span className="px-3 py-1 rounded-full text-xs font-bold text-white" style={{ background: ACCENT }}>Our Results</span>
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-white mb-1">Kitchen Deep Clean</h3>
                <p className="text-sm text-slate-400">Degreased, sanitized, and sparkling from countertop to floor.</p>
              </div>
            </GlassCard>
            <GlassCard className="overflow-hidden">
              <div className="relative">
                <img src="https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=600&q=80" alt="Spotless bathroom" className="w-full h-64 object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <span className="px-3 py-1 rounded-full text-xs font-bold text-white" style={{ background: ACCENT }}>Our Results</span>
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-white mb-1">Bathroom Restoration</h3>
                <p className="text-sm text-slate-400">Tile scrubbed, grout whitened, fixtures polished to a mirror shine.</p>
              </div>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* ══════════════════ 8. TESTIMONIALS (WITH GOOGLE REVIEWS HEADER) ══════════════════ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0f172a 50%, #1a1a1a 100%)" }} />
        <SparklePattern opacity={0.02} accent={ACCENT} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[20%] right-[15%] w-[400px] h-[400px] rounded-full blur-[160px]" style={{ background: `${ACCENT}06` }} /></div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          {/* Google Reviews Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-xl">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={20} weight="fill" style={{ color: "#facc15" }} />
                ))}
              </div>
              <span className="text-white font-bold text-sm">
                {data.googleRating || "4.9"} Rating
              </span>
              <span className="text-slate-400 text-sm">
                ({data.reviewCount || "100"}+ Reviews)
              </span>
            </div>
          </div>
          <SectionHeader badge="Testimonials" title="What Our Clients Say" accent={ACCENT} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <GlassCard key={i} className="p-6 h-full flex flex-col">
                <div className="text-3xl mb-3" style={{ color: `${ACCENT}40` }}>&ldquo;</div>
                <div className="flex gap-0.5 mb-3">{Array.from({ length: t.rating || 5 }).map((_, j) => <Star key={j} size={18} weight="fill" style={{ color: "#facc15" }} />)}</div>
                <p className="text-slate-300 leading-relaxed flex-1 text-sm mb-4">{t.text}</p>
                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">{t.name}</span>
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <CheckCircle size={14} weight="fill" style={{ color: ACCENT }} />
                    Verified
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ 9. FRESH HOME CTA ══════════════════ */}
      <section className="relative z-10 py-20 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT}cc, ${ACCENT})` }} />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='40' height='40' fill='none'/%3E%3Cpath d='M0 0L40 40M40 0L0 40' stroke='%23000' stroke-width='0.5'/%3E%3C/svg%3E\")" }} />
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <Sparkle size={48} weight="fill" className="mx-auto mb-6 text-white/70" />
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-4">Ready for a Spotless Space?</h2>
          <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">Book your professional cleaning today. We guarantee 100% satisfaction or we come back and re-clean for free.</p>
          <PhoneLink phone={data.phone} className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-black text-white font-bold text-lg hover:bg-black/80 transition-colors">
            <span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" /><span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" /></span>
            {data.phone}
          </PhoneLink>
        </div>
      </section>

      {/* ══════════════════ COMPETITOR COMPARISON TABLE ══════════════════ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0f172a 50%, #1a1a1a 100%)" }} />
        <SparklePattern opacity={0.02} accent={ACCENT} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[30%] right-[20%] w-[400px] h-[400px] rounded-full blur-[180px]" style={{ background: `${ACCENT}06` }} /></div>
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <SectionHeader badge="The Difference" title={`${data.businessName} vs Average Cleaning Services`} accent={ACCENT} />
          <GlassCard className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-4 px-5 text-slate-400 font-medium">Feature</th>
                    <th className="text-center py-4 px-4 font-bold text-white whitespace-nowrap">{data.businessName}</th>
                    <th className="text-center py-4 px-4 text-slate-500 font-medium">Others</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_ROWS.map((row, i) => (
                    <tr key={row.feature} className={i < COMPARISON_ROWS.length - 1 ? "border-b border-white/5" : ""}>
                      <td className="py-3.5 px-5 text-slate-300">{row.feature}</td>
                      <td className="py-3.5 px-4 text-center">
                        <CheckCircle size={20} weight="fill" style={{ color: "#22c55e" }} className="inline-block" />
                      </td>
                      <td className="py-3.5 px-4 text-center text-slate-500 text-xs">{row.them}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* ══════════════════ HOW OFTEN SHOULD YOU CLEAN? QUIZ ══════════════════ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0c1929 50%, #1a1a1a 100%)" }} />
        <WaterDropBackground opacity={0.02} accent={ACCENT} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[25%] left-[10%] w-[500px] h-[500px] rounded-full blur-[180px]" style={{ background: `${ACCENT}06` }} /></div>
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Find Your Schedule" title="How Often Should You Clean?" subtitle="Not sure how often you need professional cleaning? Here's our recommendation based on your lifestyle." accent={ACCENT} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FREQUENCY_OPTIONS.map((opt) => (
              <GlassCard key={opt.freq} className="p-6 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1" style={{ background: opt.color }} />
                <div className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-4" style={{ background: `${opt.color}20`, color: opt.color }}>
                  {opt.tag}
                </div>
                <div className="flex items-center justify-center gap-2 mb-3">
                  <CalendarCheck size={24} weight="duotone" style={{ color: opt.color }} />
                  <h3 className="text-2xl font-black text-white">{opt.freq}</h3>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed mb-5">{opt.desc}</p>
                <MagneticButton className="w-full py-3 rounded-xl text-sm font-semibold text-white cursor-pointer text-center flex items-center justify-center gap-2 border" style={{ borderColor: `${opt.color}33`, background: `${opt.color}15` } as React.CSSProperties}>
                  <Phone size={16} weight="duotone" /> Book {opt.freq}
                </MagneticButton>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ WHAT WE CLEAN (ENHANCED) ══════════════════ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0c1929 50%, #1a1a1a 100%)" }} />
        <SparklePattern opacity={0.02} accent={ACCENT} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[40%] right-[20%] w-[400px] h-[400px] rounded-full blur-[180px]" style={{ background: `${MINT}06` }} /></div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Every Room, Every Detail" title="What We Clean" subtitle="From kitchen grease to bathroom grime, we tackle every surface with professional-grade thoroughness." accent={ACCENT} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {CLEANING_AREAS.map((area) => (
              <GlassCard key={area.name} className="p-5 group hover:border-opacity-30 transition-all duration-500">
                <div className="w-11 h-11 rounded-xl mb-3 flex items-center justify-center transition-all duration-300" style={{ background: `${ACCENT}15`, border: `1px solid ${ACCENT}22` }}>
                  <area.icon size={22} weight="duotone" style={{ color: ACCENT }} />
                </div>
                <h3 className="text-base font-bold text-white mb-1.5">{area.name}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{area.desc}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ CLEANING CHECKLIST ══════════════════ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0f172a 50%, #1a1a1a 100%)" }} />
        <WaterDropBackground opacity={0.02} accent={ACCENT} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[25%] left-[15%] w-[400px] h-[400px] rounded-full blur-[160px]" style={{ background: `${ACCENT}06` }} /></div>
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Every Visit" title={`What\u2019s Included in Every Clean`} subtitle="No cutting corners. Every clean follows our comprehensive checklist so nothing gets missed." accent={ACCENT} />
          <GlassCard className="p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
              {CLEANING_CHECKLIST.map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle size={20} weight="fill" style={{ color: ACCENT }} className="mt-0.5 shrink-0" />
                  <span className="text-sm text-slate-300 leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </section>

      {/* ══════════════════ 11. SERVICE AREAS ══════════════════ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0f172a 50%, #1a1a1a 100%)" }} />
        <SparklePattern opacity={0.02} accent={ACCENT} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[40%] right-[20%] w-[400px] h-[400px] rounded-full blur-[180px]" style={{ background: `${ACCENT}06` }} /></div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <AnimatedSection>          <SectionHeader badge="Coverage Area" title="Areas We Serve" accent={ACCENT} /></AnimatedSection>
          <div className="text-center">
            <GlassCard className="p-8 inline-block">
              <div className="flex items-center gap-3 text-lg"><MapPin size={24} weight="duotone" style={{ color: ACCENT }} /><MapLink address={data.address} className="text-white font-semibold" /></div>
              <p className="text-slate-400 text-sm mt-2">&amp; Surrounding Areas</p>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* ══════════════════ 12. HOURS ══════════════════ */}
      {data.hours && (
        <section className="relative z-10 py-24 md:py-32 overflow-hidden">
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0c1929 50%, #1a1a1a 100%)" }} />
          <WaterDropBackground opacity={0.02} accent={ACCENT} />
          <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[20%] left-[15%] w-[400px] h-[400px] rounded-full blur-[160px]" style={{ background: `${ACCENT}06` }} /></div>
          <div className="max-w-3xl mx-auto px-6 relative z-10">
            <AnimatedSection>          <SectionHeader badge="Business Hours" title="When We're Available" accent={ACCENT} /></AnimatedSection>
            <div className="text-center">
              <ShimmerBorder accent={ACCENT}>
                <div className="p-8">
                  <Clock size={32} weight="duotone" style={{ color: ACCENT }} className="mx-auto mb-4" />
                  <p className="text-slate-300 leading-relaxed whitespace-pre-line text-lg">{data.hours}</p>
                </div>
              </ShimmerBorder>
            </div>
          </div>
        </section>
      )}

      
      {/* ══════════════════ MID-PAGE CTA ══════════════════ */}
      <section className="relative z-10 py-12 sm:py-16 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${ACCENT}15, ${ACCENT}08)` }} />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: ACCENT }}>
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
            style={{ background: ACCENT }}
          >
            Claim This Website
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </a>
        </div>
      </section>

      {/* ══════════════════ SPOTLESS GUARANTEE CTA ══════════════════ */}
      <section className="relative z-10 py-20 md:py-24 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0c1929 50%, #1a1a1a 100%)" }} />
        <SparklePattern opacity={0.02} accent={ACCENT} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[30%] right-[20%] w-[500px] h-[500px] rounded-full blur-[180px]" style={{ background: `${ACCENT}08` }} /></div>
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <ShimmerBorder accent={ACCENT}>
            <div className="p-8 md:p-12 text-center">
              <ShieldCheck size={48} weight="duotone" style={{ color: ACCENT }} className="mx-auto mb-5" />
              <h2 className="text-2xl md:text-4xl font-black tracking-tight text-white mb-3">
                Not Satisfied? We&apos;ll Re-Clean for Free.
              </h2>
              <p className="text-slate-400 mb-6 max-w-lg mx-auto leading-relaxed">
                Our Spotless Guarantee means you never pay for a clean that doesn&apos;t meet your standards. If anything is missed, we come back and make it right — no questions asked.
              </p>
              <div className="flex flex-wrap justify-center gap-3 mb-6">
                {[{ icon: ShieldCheck, label: "100% Guaranteed" }, { icon: Users, label: "Consistent Teams" }, { icon: Leaf, label: "Eco-Friendly" }, { icon: CheckCircle, label: "Background-Checked" }].map((b) => (
                  <div key={b.label} className="flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold text-white" style={{ borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}>
                    <b.icon size={14} weight="fill" style={{ color: ACCENT }} />
                    {b.label}
                  </div>
                ))}
              </div>
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white flex items-center gap-2 mx-auto cursor-pointer" style={{ background: ACCENT } as React.CSSProperties}>
                Book Your Guaranteed Clean <ArrowRight size={18} weight="bold" />
              </MagneticButton>
            </div>
          </ShimmerBorder>
        </div>
      </section>

      {/* ══════════════════ 13. FAQ ══════════════════ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0f172a 50%, #1a1a1a 100%)" }} />
        <WaterDropBackground opacity={0.02} accent={ACCENT} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[20%] left-[15%] w-[400px] h-[400px] rounded-full blur-[160px]" style={{ background: `${ACCENT}06` }} /></div>
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <AnimatedSection>          <SectionHeader badge="FAQ" title="Common Questions" accent={ACCENT} /></AnimatedSection>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} question={faq.q} answer={faq.a} isOpen={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ 14. CONTACT ══════════════════ */}
      <section id="contact" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0c1929 50%, #1a1a1a 100%)" }} />
        <SparklePattern opacity={0.02} accent={ACCENT} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] rounded-full blur-[180px]" style={{ background: `${ACCENT}06` }} /></div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: ACCENT, borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}>Contact Us</span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6 text-white">Book Your Cleaning</h2>
              <p className="text-slate-400 leading-relaxed mb-8">Ready for a spotless space? Contact {data.businessName} today for a free, no-obligation estimate. We respond to all inquiries within 24 hours.</p>
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: ACCENT_GLOW }}><MapPin size={20} weight="duotone" style={{ color: ACCENT }} /></div>
                  <div><p className="text-sm font-semibold text-white">Address</p><MapLink address={data.address} className="text-sm text-slate-400" /></div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: ACCENT_GLOW }}><Phone size={20} weight="duotone" style={{ color: ACCENT }} /></div>
                  <div><p className="text-sm font-semibold text-white">Phone</p><PhoneLink phone={data.phone} className="text-sm text-slate-400" /></div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: ACCENT_GLOW }}><Drop size={20} weight="duotone" style={{ color: ACCENT }} /></div>
                  <div><p className="text-sm font-semibold text-white">Eco-Friendly</p><p className="text-sm text-slate-400">Green cleaning products safe for kids &amp; pets</p></div>
                </div>
                {data.hours && (
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: ACCENT_GLOW }}><Clock size={20} weight="duotone" style={{ color: ACCENT }} /></div>
                    <div><p className="text-sm font-semibold text-white">Hours</p><p className="text-sm text-slate-400 whitespace-pre-line">{data.hours}</p></div>
                  </div>
                )}
              </div>
            </div>
            <GlassCard className="p-8">
              <h3 className="text-xl font-semibold text-white mb-6">Request a Free Estimate</h3>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className="block text-sm text-slate-400 mb-1.5">First Name</label><input type="text" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none transition-colors text-sm" placeholder="John" /></div>
                  <div><label className="block text-sm text-slate-400 mb-1.5">Last Name</label><input type="text" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none transition-colors text-sm" placeholder="Doe" /></div>
                </div>
                <div><label className="block text-sm text-slate-400 mb-1.5">Phone</label><input type="tel" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none transition-colors text-sm" placeholder="(555) 123-4567" /></div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">Service Needed</label>
                  <select className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none transition-colors text-sm">
                    <option value="" className="bg-neutral-900">Select a service</option>
                    {data.services.map((s) => <option key={s.name} value={s.name.toLowerCase().replace(/\s+/g, "-")} className="bg-neutral-900">{s.name}</option>)}
                  </select>
                </div>
                <div><label className="block text-sm text-slate-400 mb-1.5">Message</label><textarea rows={4} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none transition-colors text-sm resize-none" placeholder="Tell us about your cleaning needs..." /></div>
                <MagneticButton className="w-full py-4 rounded-xl text-base font-semibold text-white flex items-center justify-center gap-2 cursor-pointer" style={{ background: ACCENT } as React.CSSProperties}>
                  Send Request <ArrowRight size={18} weight="bold" />
                </MagneticButton>
              </form>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* ══════════════════ 15. FOOTER ══════════════════ */}
      <footer className="relative z-10 border-t border-white/5 py-10 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #111 100%)" }} />
        <SparklePattern opacity={0.015} accent={ACCENT} />
        <div className="mx-auto max-w-6xl px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3"><Sparkle size={22} weight="fill" style={{ color: ACCENT }} /><span className="text-lg font-bold text-white">{data.businessName}</span></div>
              <p className="text-sm text-slate-500 leading-relaxed">{data.about.length > 120 ? data.about.slice(0, 120).trim() + "..." : data.about}</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-3">Quick Links</h4>
              <div className="space-y-2">
                {["Services", "About", "Gallery", "Contact"].map((link) => (
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
          <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-500"><Sparkle size={14} weight="fill" style={{ color: ACCENT }} /><span>{data.businessName} &copy; {new Date().getFullYear()}</span></div>
            <div className="flex items-center gap-2 text-xs text-slate-600"><BluejayLogo className="w-4 h-4" /><span>Created by <a href="https://bluejayportfolio.com" target="_blank" rel="noopener noreferrer" style={{textDecoration:"underline"}}>bluejayportfolio.com</a></span></div>
          </div>
        </div>
      </footer>

      <ClaimBanner businessName={data.businessName} accentColor={ACCENT} prospectId={data.id} />
      <div className="h-14 md:h-28" />
    </main>
  );
}
