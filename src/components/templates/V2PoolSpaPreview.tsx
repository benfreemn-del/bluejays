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
  Drop,
  Thermometer,
  ShieldCheck,
  Clock,
  Phone,
  MapPin,
  CaretDown,
  List,
  X,
  Wrench,
  SunHorizon,
  WaveSine,
  CheckCircle,
  ArrowRight,
  Star,

} from "@phosphor-icons/react";
import type { GeneratedSiteData } from "@/lib/generator";
import BluejayLogo from "../BluejayLogo";
import { MapLink, PhoneLink } from "@/components/templates/MapLink";
import ClaimBanner from "@/components/ClaimBanner";
import { pickFromPool, pickGallery } from "@/lib/stock-image-picker";

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ SPRING CONFIGS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const spring = { type: "spring" as const, stiffness: 100, damping: 20 };
const springFast = { type: "spring" as const, stiffness: 200, damping: 25 };

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ COLORS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const CHARCOAL = "#1a1a1a";
const DEFAULT_CYAN = "#0891b2";
const CYAN_LIGHT = "#22d3ee";
const DEEP_BLUE = "#2563eb";

function getAccent(accentColor?: string) {
  const c = accentColor || DEFAULT_CYAN;
  return { ACCENT: c, ACCENT_GLOW: `${c}26`, ACCENT_LIGHT: CYAN_LIGHT, DEEP_BLUE };
}

// Rotating palette so service card tiles feel alive instead of
// monochrome. Brand ACCENT still drives headers, CTAs, borders.
const PALETTE = ["#0891b2", "#fb7185", "#d4a853", "#10b981", "#22d3ee", "#f97316"];
const pickPaletteColor = (i: number) => PALETTE[i % PALETTE.length];

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ SERVICE ICON MAP â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SERVICE_ICON_MAP: Record<string, any> = {
  clean: Drop,
  maintenance: Wrench,
  repair: Wrench,
  heat: Thermometer,
  spa: Thermometer,
  build: Drop,
  install: Drop,
  renovation: Drop,
  chemical: Drop,
  open: SunHorizon,
  close: SunHorizon,
  
};

function getServiceIcon(serviceName: string) {
  const lower = serviceName.toLowerCase();
  for (const [key, Icon] of Object.entries(SERVICE_ICON_MAP)) {
    if (lower.includes(key)) return Icon;
  }
  return Drop;
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ STOCK FALLBACK IMAGES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const STOCK_HERO_POOL = ["https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?w=1400&q=80"];
const STOCK_ABOUT_POOL = ["https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?w=600&q=80"];
const STOCK_PROJECTS = [
  "https://images.unsplash.com/photo-1562778612-e1e0cda9915c?w=600&q=80",
  "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=600&q=80",
  "https://images.unsplash.com/photo-1572331165267-854da2b10ccc?w=800&q=80",
  "https://images.unsplash.com/photo-1519449556851-5720b33024e7?w=800&q=80",
];

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ FLOATING SPARKLE PARTICLES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
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
          style={{ left: `${p.x}%`, width: p.size, height: p.size, background: p.isMint ? DEEP_BLUE : accent, willChange: "transform, opacity" }}
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

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ SPARKLE / BUBBLE SVG PATTERN â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function SparklePattern({ opacity = 0.03, accent }: { opacity?: number; accent: string }) {
  const patternId = `sparklePatternV2-${accent.replace("#", "")}`;
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }}>
      <defs>
        <pattern id={patternId} width="100" height="100" patternUnits="userSpaceOnUse">
          <circle cx="10" cy="10" r="1.5" fill={accent} opacity="0.4" />
          <circle cx="50" cy="30" r="1" fill={DEEP_BLUE} opacity="0.3" />
          <circle cx="90" cy="15" r="1.8" fill={accent} opacity="0.35" />
          <circle cx="30" cy="70" r="1.2" fill={DEEP_BLUE} opacity="0.3" />
          <circle cx="70" cy="80" r="2" fill={accent} opacity="0.4" />
          <circle cx="20" cy="50" r="0.8" fill={accent} opacity="0.25" />
          <path d="M45 45 L50 40 L55 45 L50 50 Z" fill={accent} opacity="0.2" />
          <path d="M80 55 L85 50 L90 55 L85 60 Z" fill={DEEP_BLUE} opacity="0.15" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  );
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ WATER DROP SVG â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function WaterDropBackground({ opacity = 0.03, accent }: { opacity?: number; accent: string }) {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }} viewBox="0 0 1000 600" preserveAspectRatio="none">
      <path d="M200 100 Q200 50 220 100 Q240 150 200 150 Q160 150 200 100 Z" fill={accent} />
      <path d="M700 80 Q700 40 715 80 Q730 120 700 120 Q670 120 700 80 Z" fill={DEEP_BLUE} />
      <path d="M450 400 Q450 350 470 400 Q490 450 450 450 Q410 450 450 400 Z" fill={accent} />
      <circle cx="150" cy="400" r="30" fill={accent} opacity="0.3" />
      <circle cx="850" cy="300" r="20" fill={DEEP_BLUE} opacity="0.3" />
    </svg>
  );
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ GLASS CARD â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function GlassCard({ children, className = "", style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`rounded-2xl border border-white/15 bg-white/[0.08] backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] ${className}`} style={style}>
      {children}
    </div>
  );
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ MAGNETIC BUTTON â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
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

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ SHIMMER BORDER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function ShimmerBorder({ children, className = "", accent }: { children: React.ReactNode; className?: string; accent: string }) {
  return (
    <div className={`relative rounded-2xl p-[1px] overflow-hidden ${className}`}>
      <motion.div className="absolute inset-0 rounded-2xl" style={{ background: `conic-gradient(from 0deg, transparent, ${accent}, transparent, ${DEEP_BLUE}, transparent)`, willChange: "transform" }}
        animate={{ rotate: [0, 360] }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} />
      <div className="relative rounded-2xl bg-[#141414] z-10">{children}</div>
    </div>
  );
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ ACCORDION ITEM â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
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

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ SECTION HEADER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
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


/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   MAIN COMPONENT
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ ANIMATED SECTION â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function AnimatedSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 1, x: 50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: "easeOut" as const }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const POOL_COMPARISON_ROWS = [
  { feature: "Certified Pool Technicians", us: true, them: "Varies" },
  { feature: "Free Pool Assessment", us: true, them: "No" },
  { feature: "Chemical Balance Guarantee", us: true, them: "Sometimes" },
  { feature: "All Pool Types Serviced", us: true, them: "Limited" },
  { feature: "Emergency Repairs Available", us: true, them: "Extra Cost" },
  { feature: "Seasonal Opening & Closing", us: true, them: "Extra Cost" },
  { feature: "Equipment Warranty Support", us: true, them: "No" },
];

const POOL_PRICING_TIERS = [
  { title: "Weekly Clean", price: "$149", period: "/month", features: ["Weekly visits", "Chemical balancing", "Skimming & vacuuming", "Filter check", "Basic water testing"], featured: false },
  { title: "Full Service", price: "$249", period: "/month", features: ["Everything in Weekly", "Equipment inspection", "Tile cleaning", "Detailed water analysis", "Priority scheduling", "Heater check"], featured: true },
  { title: "Premium Care", price: "$399", period: "/month", features: ["Everything in Full Service", "Monthly deep clean", "Filter replacement", "Salt cell cleaning", "24/7 emergency line", "Quarterly equipment tune-up"], featured: false },
];

const POOL_QUIZ_OPTIONS = [
  { label: "Regular Maintenance", desc: "Keep your pool crystal clear year-round.", color: "#22c55e" },
  { label: "Pool Repair", desc: "Equipment, plumbing, or surface issues.", color: "#f59e0b" },
  { label: "New Build / Renovation", desc: "Build your dream pool or upgrade your current one.", color: "#3b82f6" },
  { label: "Seasonal Service", desc: "Opening, closing, or winterization services.", color: "#a855f7" },
];

export default function V2PoolSpaPreview({ data }: { data: GeneratedSiteData }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const { ACCENT, ACCENT_GLOW } = getAccent(data.accentColor);

  const uniquePhotos = data.photos ? [...new Set(data.photos)] : [];


  const heroImage = uniquePhotos[0] || pickFromPool(STOCK_HERO_POOL, data.businessName);


  const heroCardImage = uniquePhotos[1] || pickFromPool(STOCK_ABOUT_POOL, data.businessName, 1);


  const aboutImage = uniquePhotos[2] || pickFromPool(STOCK_ABOUT_POOL, data.businessName, 2);
  const usedUrls = new Set([heroImage, heroCardImage, aboutImage].filter(Boolean));
  const projectFromReal = uniquePhotos.slice(3).filter((u) => !usedUrls.has(u));
  const projectImages =
    projectFromReal.length >= 4
      ? projectFromReal.slice(0, 4)
      : [
          ...projectFromReal,
          ...pickGallery(STOCK_PROJECTS, data.businessName).filter(
            (u) => !usedUrls.has(u) && !projectFromReal.includes(u)
          ),
        ].slice(0, 4);

  const processSteps = [
    { step: "01", title: "Free Assessment", desc: "We inspect your pool or spa and provide a detailed report and estimate." },
    { step: "02", title: "Custom Plan", desc: "We design a maintenance or renovation plan tailored to your pool needs." },
    { step: "03", title: "Expert Service", desc: "Our certified technicians perform all work with premium equipment and chemicals." },
    { step: "04", title: "Ongoing Care", desc: "Regular maintenance visits keep your pool pristine and equipment running perfectly." },
  ];

  const faqs = [
    { q: `What pool services does ${data.businessName} offer?`, a: `We provide a full range of pool & spa service services including ${data.services.slice(0, 3).map(s => s.name).join(", ")}, and more. Contact us for a free assessment.` },
    { q: "How often should my pool be serviced?", a: "We recommend weekly service for optimal water quality. We offer weekly, bi-weekly, and monthly maintenance plans." },
    { q: "Do you work on all pool types?", a: `Yes! ${data.businessName} services all pool types including concrete, fiberglass, vinyl liner, saltwater, and chlorine pools.` },
    { q: "Can you fix my pool heater?", a: "Absolutely. Our technicians are certified to repair and maintain all major pool and spa heater brands." },
  ];

  /* Fallback testimonials */
  const fallbackTestimonials = [
    { name: "Craig B.", text: "They built our dream pool and it's absolutely gorgeous. The whole family loves it.", rating: 5 },
    { name: "Wendy S.", text: "Weekly maintenance keeps our pool crystal clear. Haven't had to worry about it in years.", rating: 5 },
    { name: "Alan M.", text: "Hot tub installation was seamless. They handled everything from permits to final setup.", rating: 5 }
  ];
  const testimonials = data.testimonials?.length > 0 ? data.testimonials : fallbackTestimonials;

  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden" style={{ fontFamily: "Lato, system-ui, sans-serif", background: CHARCOAL, color: "#f1f5f9" }}>
      <FloatingSparkles accent={ACCENT} />

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• 1. NAV â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-4">
          <GlassCard className="flex items-center justify-between px-4 md:px-6 py-3">
            <div className="flex items-center gap-2">
              <Drop size={24} weight="fill" style={{ color: ACCENT }} />
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
                Free Assessment
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

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• 2. HERO â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="relative min-h-[100dvh] flex items-center pt-24 z-10 overflow-hidden">

        <div className="absolute inset-0">
          <img src={heroImage} alt={`${data.businessName}`} className="w-full h-full object-cover object-center" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          <div className="space-y-8">
            <div>
              <p className="text-sm uppercase tracking-widest mb-4" style={{ color: ACCENT }}>Pool & Spa Professionals</p>
              <h1 className="text-3xl md:text-6xl tracking-tighter leading-none font-bold text-white" style={{ textShadow: "0 2px 20px rgba(0,0,0,0.8), 0 4px 40px rgba(0,0,0,0.5)" }}>
                {data.tagline}
              </h1>
            </div>
            <p className="text-lg text-slate-400 max-w-md leading-relaxed">
              {(() => { const t = data.about; if (t.length <= 180) return t; const dot = t.indexOf('.', 80); return dot > 0 && dot < 220 ? t.slice(0, dot + 1) : t.slice(0, 180).trim() + '...'; })()}
            </p>
            <div className="flex flex-wrap gap-4">
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white flex items-center gap-2 cursor-pointer" style={{ background: ACCENT } as React.CSSProperties}>
                Get Free Assessment <ArrowRight size={18} weight="bold" />
              </MagneticButton>
              <MagneticButton href={`tel:${data.phone.replace(/\D/g, "")}`} className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/15 flex items-center gap-2 cursor-pointer">
                <Phone size={18} weight="duotone" /> <PhoneLink phone={data.phone} />
              </MagneticButton>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-slate-400">
              <span className="flex items-center gap-2"><MapPin size={16} weight="duotone" style={{ color: ACCENT }} /><MapLink address={data.address} /></span>
              <span className="flex items-center gap-2"><Drop size={16} weight="duotone" style={{ color: ACCENT }} />Certified Pool Pros</span>
            </div>
          </div>
          <div className="hidden md:block relative">
            <div className="relative rounded-2xl overflow-hidden border border-white/15">
              <img src={heroCardImage} alt={`${data.businessName} pool & spa service`} className="w-full h-[500px] object-cover" />
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

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• 3. STATS â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="relative z-10 py-16 overflow-hidden border-y" style={{ borderColor: `${ACCENT}1a` }}>
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #0a1520 0%, #1a1a1a 100%)" }} />
        <SparklePattern opacity={0.02} accent={ACCENT} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] rounded-full blur-[180px]" style={{ background: `${ACCENT}08` }} /></div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {data.stats.map((stat, i) => {
              const statIcons = [Drop, ShieldCheck, Clock, Star];
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

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• 4. SERVICES â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section id="services" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0a1520 50%, #1a1a1a 100%)" }} />
        <SparklePattern accent={ACCENT} />
        <WaterDropBackground opacity={0.025} accent={ACCENT} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[10%] right-[5%] w-[500px] h-[500px] rounded-full blur-[160px]" style={{ background: `${ACCENT}08` }} />
          <div className="absolute bottom-[10%] left-[5%] w-[400px] h-[400px] rounded-full blur-[140px]" style={{ background: `${DEEP_BLUE}05` }} />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Our Services" title="Crystal Clear Pool Services" subtitle={`From weekly maintenance to full pool renovations, ${data.businessName} keeps your pool crystal clear and swim-ready all year.`} accent={ACCENT} />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.services.map((service, i) => {
              const tile = pickPaletteColor(i);
              const Icon = getServiceIcon(service.name);
              return (
                <div key={service.name} className="group relative p-7 rounded-2xl border border-white/[0.10] hover:border-opacity-30 transition-all duration-500 overflow-hidden bg-white/[0.07]">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: `radial-gradient(circle at 50% 0%, ${ACCENT}15, transparent 70%)` }} />
                  <div className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `linear-gradient(to right, transparent, ${ACCENT}4d, transparent)` }} />
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-5">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 border" style={{ background: `${tile}22`, borderColor: `${tile}55` }}>
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
            })}
          </div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• 5. WHY CHOOSE US / ABOUT â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section id="about" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #051a20 50%, #1a1a1a 100%)" }} />
        <WaterDropBackground opacity={0.02} accent={ACCENT} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[20%] left-[10%] w-[500px] h-[500px] rounded-full blur-[180px]" style={{ background: `${ACCENT}06` }} /></div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="relative">
              <div className="rounded-2xl overflow-hidden border border-white/15">
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
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6 text-white">Crystal Clear Excellence</h2>
              <p className="text-slate-400 leading-relaxed mb-8">{data.about}</p>
              <div className="grid grid-cols-2 gap-4">
                {[{ icon: ShieldCheck, label: "Certified Technicians" }, { icon: Drop, label: "Crystal Clear Results" }, { icon: Star, label: "5-Star Rated" }, { icon: CheckCircle, label: "Satisfaction Guaranteed" }].map((badge) => (
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

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• 6. PROCESS â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0a1520 50%, #1a1a1a 100%)" }} />
        <SparklePattern opacity={0.025} accent={ACCENT} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] rounded-full blur-[180px]" style={{ background: `${DEEP_BLUE}06` }} /></div>
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

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• 7. GALLERY â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section id="gallery" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #051a20 50%, #1a1a1a 100%)" }} />
        <WaterDropBackground opacity={0.02} accent={ACCENT} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[30%] left-[20%] w-[500px] h-[500px] rounded-full blur-[200px]" style={{ background: `${ACCENT}06` }} /></div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <AnimatedSection>          <SectionHeader badge="Our Work" title="Recent Projects" accent={ACCENT} /></AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projectImages.map((src, i) => {
              const titles = ["Pool Renovation", "Spa Installation", "Weekly Maintenance", "Equipment Upgrade"];
              const descs = ["Complete pool renovation with modern finishes.", "Custom spa installation for ultimate relaxation.", "Keeping pools crystal clear with regular service.", "State-of-the-art pool equipment upgrades."];
              return (
                <div key={i} className="group relative rounded-2xl overflow-hidden border border-white/[0.10] hover:border-opacity-30 transition-all duration-500">
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

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• 8. COMPARISON TABLE â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0a1520 50%, #1a1a1a 100%)" }} />
        <SparklePattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <AnimatedSection><SectionHeader badge="Compare" title={`${data.businessName} vs. The Competition`} accent={ACCENT} /></AnimatedSection>
          <GlassCard className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead><tr className="border-b border-white/15"><th className="px-6 py-4 text-sm font-semibold text-slate-400">Feature</th><th className="px-6 py-4 text-sm font-semibold text-center" style={{ color: ACCENT }}>{data.businessName}</th><th className="px-6 py-4 text-sm font-semibold text-center text-slate-500">Other Companies</th></tr></thead>
                <tbody>
                  {POOL_COMPARISON_ROWS.map((row, i) => (
                    <tr key={i} className="border-b border-white/8">
                      <td className="px-6 py-4 text-sm text-slate-300">{row.feature}</td>
                      <td className="px-6 py-4 text-center"><CheckCircle size={20} weight="fill" className="inline" style={{ color: "#22c55e" }} /></td>
                      <td className="px-6 py-4 text-center text-sm text-slate-500">{row.them}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• 8b. PRICING TIERS â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0a1520 50%, #1a1a1a 100%)" }} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <AnimatedSection><SectionHeader badge="Pricing" title="Service Plans" subtitle="Crystal clear pricing for crystal clear pools. No hidden fees." accent={ACCENT} /></AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {POOL_PRICING_TIERS.map((tier) => (
              <GlassCard key={tier.title} className={`p-8 h-full flex flex-col ${tier.featured ? "ring-2" : ""}`} style={tier.featured ? { borderColor: ACCENT, boxShadow: `0 0 30px ${ACCENT}22` } as React.CSSProperties : undefined}>
                {tier.featured && <span className="inline-block self-start text-xs font-bold uppercase tracking-widest mb-4 px-3 py-1 rounded-full text-white" style={{ background: ACCENT }}>Best Value</span>}
                <h3 className="text-xl font-bold text-white mb-1">{tier.title}</h3>
                <div className="flex items-baseline gap-1 mb-4"><span className="text-4xl font-black text-white">{tier.price}</span><span className="text-slate-500 text-sm">{tier.period}</span></div>
                <ul className="space-y-3 flex-1 mb-6">{tier.features.map((f) => <li key={f} className="flex items-center gap-2 text-sm text-slate-300"><CheckCircle size={16} weight="fill" style={{ color: ACCENT }} />{f}</li>)}</ul>
                <PhoneLink phone={data.phone} className="block w-full py-3 rounded-xl text-center font-bold text-sm transition-all" style={tier.featured ? { background: ACCENT, color: "#fff" } : { background: `${ACCENT}15`, color: ACCENT }}>Get Started</PhoneLink>
              </GlassCard>
            ))}
          </div>
          <p className="text-center text-sm text-slate-500 mt-8">Exact pricing depends on pool size and location. Call for a free quote.</p>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• 8c. POOL QUIZ â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0a1520 50%, #1a1a1a 100%)" }} />
        <SparklePattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <AnimatedSection><SectionHeader badge="Get Started" title="What Does Your Pool Need?" accent={ACCENT} /></AnimatedSection>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {POOL_QUIZ_OPTIONS.map((opt, i) => (
              <button key={opt.label} onClick={() => setQuizAnswer(i)} className="text-left cursor-pointer">
                <GlassCard className={`p-6 h-full transition-all duration-300 ${quizAnswer === i ? "ring-2" : ""}`} style={quizAnswer === i ? { borderColor: opt.color, boxShadow: `0 0 20px ${opt.color}22` } as React.CSSProperties : undefined}>
                  <h4 className="text-lg font-bold text-white mb-1">{opt.label}</h4>
                  <p className="text-sm text-slate-400">{opt.desc}</p>
                  {quizAnswer === i && (
                    <div className="mt-4 pt-4 border-t border-white/15">
                      <PhoneLink phone={data.phone} className="inline-flex items-center gap-2 text-sm font-bold" style={{ color: opt.color }}><Phone size={16} weight="bold" /> Get a Free Quote <ArrowRight size={14} /></PhoneLink>
                    </div>
                  )}
                </GlassCard>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• 8d. VIDEO PLACEHOLDER â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0a1520 50%, #1a1a1a 100%)" }} />
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <AnimatedSection><SectionHeader badge="See Our Work" title="Pool Transformations" accent={ACCENT} /></AnimatedSection>
          <div className="relative rounded-2xl overflow-hidden border border-white/15 aspect-video">
            <img src={uniquePhotos[3] || pickFromPool(STOCK_PROJECTS, data.businessName, 3)} alt={`${data.businessName} pool work`} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform" style={{ background: `${ACCENT}cc` }}><svg viewBox="0 0 24 24" fill="white" className="w-8 h-8 ml-1"><polygon points="5,3 19,12 5,21" /></svg></div>
            </div>
            <div className="absolute bottom-4 left-4 text-sm text-white/70">Watch our recent pool transformations</div>
          </div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• 8e. CERTIFICATIONS â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="relative z-10 py-16 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0a1520 100%)" }} />
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <div className="flex flex-wrap justify-center gap-4">
            {["CPO Certified", "Licensed & Insured", "BBB A+ Rated", "EPA Compliant", "APSP Member", "Manufacturer Authorized"].map((cert) => (
              <span key={cert} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium border" style={{ color: ACCENT, borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}><ShieldCheck size={16} weight="fill" />{cert}</span>
            ))}
          </div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• 9. TESTIMONIALS (with Google Reviews) â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0a1520 50%, #1a1a1a 100%)" }} />
        <SparklePattern opacity={0.02} accent={ACCENT} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[20%] right-[15%] w-[400px] h-[400px] rounded-full blur-[160px]" style={{ background: `${ACCENT}06` }} /></div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          {/* Google Reviews Header */}
          <div className="flex flex-col items-center gap-2 mb-8">
            <div className="flex items-center gap-1">{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={22} weight="fill" style={{ color: "#facc15" }} />)}</div>
            <p className="text-white font-bold text-lg">{data.googleRating || "4.9"} out of 5</p>
            <span className="text-slate-400 text-sm">based on {data.reviewCount || "100+"} Google reviews</span>
          </div>
          <AnimatedSection><SectionHeader badge="Testimonials" title="What Our Clients Say" accent={ACCENT} /></AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <GlassCard key={i} className="p-6 h-full flex flex-col">
                <div className="flex gap-0.5 mb-4">{Array.from({ length: t.rating || 5 }).map((_, j) => <Star key={j} size={16} weight="fill" style={{ color: ACCENT }} />)}</div>
                <p className="text-slate-300 leading-relaxed flex-1 text-sm mb-4">&ldquo;{t.text}&rdquo;</p>
                <div className="pt-4 border-t border-white/8 flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">{t.name}</span>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• 10. FRESH HOME CTA â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="relative z-10 py-20 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT}cc, ${ACCENT})` }} />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='40' height='40' fill='none'/%3E%3Cpath d='M0 0L40 40M40 0L0 40' stroke='%23000' stroke-width='0.5'/%3E%3C/svg%3E\")" }} />
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <Drop size={48} weight="fill" className="mx-auto mb-6 text-white/70" />
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-4">Dive Into Perfection</h2>
          <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">Get a free pool assessment today. Let us keep your pool crystal clear, properly balanced, and swim-ready all year.</p>
          <PhoneLink phone={data.phone} className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-black text-white font-bold text-lg hover:bg-black/80 transition-colors">
            <span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" /><span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" /></span>
            {data.phone}
          </PhoneLink>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• 10. CHECKLIST / WHAT WE CLEAN â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #051a20 50%, #1a1a1a 100%)" }} />
        <SparklePattern opacity={0.02} accent={ACCENT} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[40%] right-[20%] w-[400px] h-[400px] rounded-full blur-[180px]" style={{ background: `${DEEP_BLUE}06` }} /></div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <AnimatedSection>          <SectionHeader badge="Services" title="Complete Pool Care" accent={ACCENT} /></AnimatedSection>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {["Weekly Cleaning", "Chemical Balancing", "Equipment Repair", "Pool Renovation", "Spa Maintenance", "Heater Service", "Opening & Closing", "Leak Detection"].map((item) => (
              <GlassCard key={item} className="p-4 flex items-center gap-3">
                <CheckCircle size={20} weight="fill" style={{ color: ACCENT }} />
                <span className="text-sm font-medium text-white">{item}</span>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• 11. SERVICE AREAS â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0a1520 50%, #1a1a1a 100%)" }} />
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

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• 12. HOURS â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      {data.hours && (
        <section className="relative z-10 py-24 md:py-32 overflow-hidden">
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #051a20 50%, #1a1a1a 100%)" }} />
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

      
      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• MID-PAGE CTA â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
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
            Limited time â€” claim your free professional website today before it&apos;s offered to a competitor.
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

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• 13. FAQ â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0a1520 50%, #1a1a1a 100%)" }} />
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

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• 14. CONTACT â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section id="contact" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #051a20 50%, #1a1a1a 100%)" }} />
        <SparklePattern opacity={0.02} accent={ACCENT} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] rounded-full blur-[180px]" style={{ background: `${ACCENT}06` }} /></div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: ACCENT, borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}>Contact Us</span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6 text-white">Get a Free Assessment</h2>
              <p className="text-slate-400 leading-relaxed mb-8">Need pool or spa service? Contact {data.businessName} today for a free, no-obligation estimate. We respond to all inquiries within 24 hours.</p>
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
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: ACCENT_GLOW }}><Thermometer size={20} weight="duotone" style={{ color: ACCENT }} /></div>
                  <div><p className="text-sm font-semibold text-white">Pool Chemistry</p><p className="text-sm text-slate-400">Certified pool service professionals</p></div>
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
              <h3 className="text-xl font-semibold text-white mb-6">Request a Free Assessment</h3>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className="block text-sm text-slate-400 mb-1.5">First Name</label><input type="text" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 focus:outline-none transition-colors text-sm" placeholder="John" /></div>
                  <div><label className="block text-sm text-slate-400 mb-1.5">Last Name</label><input type="text" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 focus:outline-none transition-colors text-sm" placeholder="Doe" /></div>
                </div>
                <div><label className="block text-sm text-slate-400 mb-1.5">Phone</label><input type="tel" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 focus:outline-none transition-colors text-sm" placeholder="(206) 287-2304" /></div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">Service Type</label>
                  <select className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white focus:outline-none transition-colors text-sm">
                    <option value="" className="bg-neutral-900">Select a service</option>
                    {data.services.map((s) => <option key={s.name} value={s.name.toLowerCase().replace(/\s+/g, "-")} className="bg-neutral-900">{s.name}</option>)}
                  </select>
                </div>
                <div><label className="block text-sm text-slate-400 mb-1.5">Message</label><textarea rows={4} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 focus:outline-none transition-colors text-sm resize-none" placeholder="Tell us about your pool or spa needs..." /></div>
                <MagneticButton className="w-full py-4 rounded-xl text-base font-semibold text-white flex items-center justify-center gap-2 cursor-pointer" style={{ background: ACCENT } as React.CSSProperties}>
                  Send Request <ArrowRight size={18} weight="bold" />
                </MagneticButton>
              </form>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• MAINTENANCE CALENDAR â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="relative z-10 py-20 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #111 50%, #1a1a1a 100%)" }} />
        <SparklePattern opacity={0.01} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-12">
            <Clock size={40} weight="duotone" style={{ color: ACCENT }} className="mx-auto mb-3" />
            <h2 className="text-3xl md:text-4xl font-extrabold text-white">Seasonal Maintenance Calendar</h2>
            <p className="text-slate-400 mt-3 max-w-xl mx-auto">Keep your pool and spa in pristine condition year-round with our seasonal care guide.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { season: "Spring", tasks: "Open pool, balance chemicals, inspect equipment, clean filters, check heater" },
              { season: "Summer", tasks: "Weekly testing, skimming, vacuuming, backwashing, algae prevention" },
              { season: "Autumn", tasks: "Reduce chemical usage, remove debris, lower water level, winterize equipment" },
              { season: "Winter", tasks: "Cover maintenance, periodic checks, anti-freeze protection, spa upkeep" },
            ].map((s) => (
              <div key={s.season} className="rounded-2xl border border-white/15 p-6" style={{ background: "rgba(255,255,255,0.06)" }}>
                <h3 className="text-lg font-bold mb-2" style={{ color: ACCENT }}>{s.season}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{s.tasks}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• EQUIPMENT BRANDS â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="relative z-10 py-20 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #111 0%, #1a1a1a 100%)" }} />
        <SparklePattern opacity={0.012} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-12">
            <Wrench size={40} weight="duotone" style={{ color: ACCENT }} className="mx-auto mb-3" />
            <h2 className="text-3xl md:text-4xl font-extrabold text-white">Equipment We Trust</h2>
            <p className="text-slate-400 mt-3 max-w-xl mx-auto">We install and service leading pool and spa brands for lasting performance.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {["Pentair", "Hayward", "Jandy", "Zodiac", "Polaris", "Raypak", "Sta-Rite", "Jacuzzi"].map((brand) => (
              <div key={brand} className="rounded-2xl border border-white/15 p-5 text-center" style={{ background: "rgba(255,255,255,0.06)" }}>
                <ShieldCheck size={24} weight="duotone" style={{ color: ACCENT }} className="mx-auto mb-2" />
                <span className="text-white font-semibold text-sm">{brand}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• WATER CHEMISTRY GUIDE â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="relative z-10 py-20 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #111 100%)" }} />
        <SparklePattern opacity={0.01} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-12">
            <Drop size={40} weight="duotone" style={{ color: ACCENT }} className="mx-auto mb-3" />
            <h2 className="text-3xl md:text-4xl font-extrabold text-white">Water Chemistry Guide</h2>
            <div className="w-16 h-1 mx-auto mt-3 rounded-full" style={{ background: ACCENT }} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { param: "pH Level", range: "7.2 â€“ 7.6", desc: "Keeps water comfortable and prevents equipment corrosion. Test twice a week." },
              { param: "Free Chlorine", range: "1 â€“ 3 ppm", desc: "Sanitizes water and eliminates bacteria. Adjust after heavy use or rain." },
              { param: "Total Alkalinity", range: "80 â€“ 120 ppm", desc: "Buffers pH fluctuations. Test weekly and adjust with baking soda or muriatic acid." },
            ].map((c) => (
              <div key={c.param} className="rounded-2xl border border-white/15 p-6" style={{ background: "rgba(255,255,255,0.06)" }}>
                <h3 className="text-lg font-bold text-white mb-1">{c.param}</h3>
                <p className="text-sm font-semibold mb-2" style={{ color: ACCENT }}>Ideal: {c.range}</p>
                <p className="text-sm text-slate-400 leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• MID-PAGE CTA â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="relative z-10 py-16 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${ACCENT}15 0%, #1a1a1a 50%, ${ACCENT}08 100%)` }} />
        <SparklePattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <WaveSine size={44} weight="fill" style={{ color: ACCENT }} className="mx-auto mb-4" />
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">Ready for Crystal-Clear Water?</h2>
          <p className="text-slate-400 max-w-2xl mx-auto mb-8 text-lg">
            Let {data.businessName} handle the chemistry, equipment, and maintenance so you can simply enjoy your pool and spa.
          </p>
          <a href={`tel:${data.phone}`} className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-white font-bold text-lg transition-transform hover:scale-105" style={{ background: ACCENT }}>
            <Phone size={20} weight="fill" /> Schedule Pool Service
          </a>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• WHY CHOOSE US â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="relative z-10 py-20 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #111 0%, #1a1a1a 100%)" }} />
        <SparklePattern opacity={0.01} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white">Why Choose <span style={{ color: ACCENT }}>{data.businessName}</span></h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { title: "Certified Technicians", desc: "Factory-trained and certified pool professionals with years of hands-on experience" },
              { title: "All Brands Serviced", desc: "We work on every major pool and spa brand â€” no need to call multiple companies" },
              { title: "Transparent Pricing", desc: "Upfront quotes with no hidden fees. You approve the price before we start any work" },
              { title: "Satisfaction Guaranteed", desc: "If your water isn't crystal clear, we come back and make it right â€” guaranteed" },
            ].map((card) => (
              <div key={card.title} className="rounded-2xl border border-white/15 p-6 text-center" style={{ background: "rgba(255,255,255,0.06)" }}>
                <CheckCircle size={28} weight="fill" style={{ color: ACCENT }} className="mx-auto mb-3" />
                <h3 className="text-lg font-bold text-white mb-2">{card.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• CERTIFICATIONS ROW â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="relative z-10 py-12 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #111 0%, #1a1a1a 100%)" }} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="flex flex-wrap justify-center gap-6">
            {[
              "NSPF Certified",
              "Licensed & Insured",
              "EPA Compliant",
              "Manufacturer Authorized",
              "BBB Accredited",
            ].map((badge) => (
              <div
                key={badge}
                className="flex items-center gap-2 px-5 py-3 rounded-full border border-white/15"
                style={{ background: "rgba(255,255,255,0.06)" }}
              >
                <ShieldCheck size={18} weight="fill" style={{ color: ACCENT }} />
                <span className="text-sm font-medium text-white">{badge}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• 15. FOOTER â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <footer className="relative z-10 border-t border-white/8 py-10 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #111 100%)" }} />
        <SparklePattern opacity={0.015} accent={ACCENT} />
        <div className="mx-auto max-w-6xl px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3"><Drop size={22} weight="fill" style={{ color: ACCENT }} /><span className="text-lg font-bold text-white">{data.businessName}</span></div>
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
          <div className="border-t border-white/8 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-500"><Drop size={14} weight="fill" style={{ color: ACCENT }} /><span>{data.businessName} &copy; {new Date().getFullYear()}</span></div>
            <div className="flex items-center gap-2 text-xs text-slate-600"><BluejayLogo className="w-4 h-4" /><span>Built by <a href="https://bluejayportfolio.com/audit" target="_blank" rel="noopener noreferrer" style={{textDecoration:"underline"}}>BlueJays</a> — get your free site audit</span></div>
          </div>
        </div>
      </footer>

      <ClaimBanner businessName={data.businessName} accentColor={ACCENT} prospectId={data.id} />
      <div className="h-14 md:h-28" />
    </main>
  );
}
