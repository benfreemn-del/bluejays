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
  House,
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
  HardHat,
  Drop,
  Buildings,
  Certificate,
  Handshake,
  ClipboardText,
  Hammer,
  Eye,
  Warning,
  Question,
  CurrencyDollar,
  Play,
  GoogleLogo,
  Timer,
  Scales,
  NavigationArrow,
  CalendarCheck,
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
const CHARCOAL = "#111827";
const DEFAULT_SLATE = "#475569";
const BRICK = "#dc2626";
const BRICK_LIGHT = "#ef4444";
const BRICK_GLOW = "rgba(220, 38, 38, 0.15)";
const SLATE_GLOW = "rgba(71, 85, 105, 0.2)";

function getAccent(accentColor?: string) {
  const c = accentColor || BRICK;
  return { ACCENT: c, ACCENT_GLOW: `${c}26`, BRICK, BRICK_LIGHT, BRICK_GLOW, SLATE: DEFAULT_SLATE, SLATE_GLOW };
}

/* ───────────────────────── SERVICE ICON MAP ───────────────────────── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SERVICE_ICON_MAP: Record<string, any> = {
  shingle: House, roof: House, repair: Wrench, leak: Drop, storm: Lightning,
  gutter: Drop, metal: HardHat, commercial: Buildings, flat: Buildings,
  tile: House, slate: House, inspect: Eye, emergency: Warning, replace: Hammer,
  install: Hammer, maintenance: ClipboardText,
};

function getServiceIcon(serviceName: string) {
  const lower = serviceName.toLowerCase();
  for (const [key, Icon] of Object.entries(SERVICE_ICON_MAP)) {
    if (lower.includes(key)) return Icon;
  }
  return House;
}

/* ───────────────────────── STOCK FALLBACK IMAGES ───────────────────────── */
const STOCK_HERO_POOL = [
  "https://images.unsplash.com/photo-1558036117-15d82a90b9b1?w=1400&q=80",   // aerial view new roof
  "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1400&q=80", // roofer working
  "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1400&q=80", // house exterior
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1400&q=80", // luxury home
  "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1400&q=80", // modern home
];
const STOCK_ABOUT_POOL = [
  "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&q=80",    // roofing crew
  "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&q=80",  // construction team
  "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80",  // worker on roof
  "https://images.unsplash.com/photo-1615799998603-7c6270a45196?w=600&q=80",  // roof shingles
  "https://images.unsplash.com/photo-1513467535987-fd81bc7d62f8?w=600&q=80",  // blueprint planning
];
const STOCK_PROJECTS = [
  "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=600&q=80",  // house 1
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80",  // house 2
  "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600&q=80",  // house 3
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80",  // house 4
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&q=80",  // house 5
  "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=600&q=80",  // house 6
  "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=600&q=80",  // house 7
  "https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=600&q=80",  // house 8
];
const STOCK_BEFORE = "https://images.unsplash.com/photo-1632149877166-f75d49000351?w=800&q=80";
const STOCK_AFTER = "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80";

/* ───────────────────────── ROOFING MATERIALS DATA ───────────────────────── */
const ROOFING_MATERIALS = [
  { name: "Architectural Shingles", desc: "30-50 year warranty, wind-resistant up to 130mph", icon: House },
  { name: "Standing Seam Metal", desc: "50+ year lifespan, energy-efficient, fireproof", icon: ShieldCheck },
  { name: "Cedar Shake", desc: "Natural beauty, excellent insulation, eco-friendly", icon: Certificate },
  { name: "Composite Tile", desc: "Lightweight, impact-resistant, versatile styles", icon: HardHat },
];

/* ───────────────────────── INSURANCE CLAIMS STEPS ───────────────────────── */
const INSURANCE_STEPS = [
  { step: "1", title: "Free Damage Assessment", desc: "We inspect your roof and document all storm damage with photos and measurements.", icon: Eye },
  { step: "2", title: "File Your Claim", desc: "We help you file the insurance claim with complete documentation — no paperwork headaches.", icon: ClipboardText },
  { step: "3", title: "Meet the Adjuster", desc: "We meet the insurance adjuster on-site to ensure nothing is missed in their assessment.", icon: Handshake },
  { step: "4", title: "Roof Installed — $0 Out of Pocket", desc: "Once approved, we install your new roof. Most homeowners pay only their deductible.", icon: House },
];

/* ───────────────────────── COMPETITOR COMPARISON ───────────────────────── */
const COMPARISON_ROWS = [
  { feature: "Free Roof Inspection", us: true, them: "Sometimes" },
  { feature: "Insurance Claims Help", us: true, them: "Rarely" },
  { feature: "Written Warranty", us: true, them: "Varies" },
  { feature: "Same-Day Emergency Response", us: true, them: "No" },
  { feature: "Licensed & Bonded", us: true, them: "Check" },
  { feature: "Cleanup Guarantee", us: true, them: "No" },
  { feature: "Financing Available", us: true, them: "Rarely" },
];

/* ───────────────────────── FLOATING RAIN PARTICLES ───────────────────────── */
function FloatingParticles({ accent }: { accent: string }) {
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i, x: Math.random() * 100, delay: Math.random() * 6,
    duration: 3 + Math.random() * 4, size: 1 + Math.random() * 2, opacity: 0.1 + Math.random() * 0.25,
  }));

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden hidden md:block">
      {particles.map((p) => (
        <motion.div key={p.id} className="absolute rounded-full"
          style={{ left: `${p.x}%`, width: p.size, height: p.size * 3, background: `linear-gradient(to bottom, transparent, ${DEFAULT_SLATE})`, willChange: "transform, opacity" }}
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

/* ───────────────────────── ROOFLINE SVG PATTERN ───────────────────────── */
function RooflinePattern({ opacity = 0.06 }: { opacity?: number }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ opacity }}>
      <svg viewBox="0 0 1440 400" className="absolute bottom-0 w-full" preserveAspectRatio="none" fill="none">
        <path d="M0,350 L80,280 L160,350 L240,260 L320,350 L400,270 L480,350 L560,250 L640,350 L720,280 L800,350 L880,260 L960,350 L1040,270 L1120,350 L1200,250 L1280,350 L1360,280 L1440,350" stroke={DEFAULT_SLATE} strokeWidth="2" />
        <path d="M0,380 L120,300 L240,380 L360,290 L480,380 L600,300 L720,380 L840,290 L960,380 L1080,300 L1200,380 L1320,290 L1440,380" stroke={DEFAULT_SLATE} strokeWidth="1.5" />
        <rect x="70" y="260" width="20" height="30" stroke={BRICK} strokeWidth="1" />
        <rect x="390" y="250" width="20" height="30" stroke={BRICK} strokeWidth="1" />
        <rect x="710" y="260" width="20" height="30" stroke={BRICK} strokeWidth="1" />
        <rect x="1030" y="250" width="20" height="30" stroke={BRICK} strokeWidth="1" />
        <rect x="1350" y="260" width="20" height="30" stroke={BRICK} strokeWidth="1" />
      </svg>
    </div>
  );
}

/* ───────────────────────── STORM SVG ───────────────────────── */
function StormBackground({ opacity = 0.03, accent }: { opacity?: number; accent: string }) {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }} viewBox="0 0 1000 600" preserveAspectRatio="none">
      <motion.path d="M200 0 L180 200 L220 190 L150 600" stroke={accent} strokeWidth="2" fill="none" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2, ease: "easeInOut" }} />
      <motion.path d="M800 0 L820 250 L780 240 L850 600" stroke={DEFAULT_SLATE} strokeWidth="1.5" fill="none" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2.5, delay: 0.3, ease: "easeInOut" }} />
    </svg>
  );
}

/* ───────────────────────── GLASS CARD ───────────────────────── */
function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-white/15 bg-white/[0.06] backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)] ${className}`}>{children}</div>;
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
      <motion.div className="absolute inset-0 rounded-2xl" style={{ background: `conic-gradient(from 0deg, transparent, ${accent}, transparent, ${DEFAULT_SLATE}, transparent)`, willChange: "transform" }} animate={{ rotate: [0, 360] }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} />
      <div className="relative rounded-2xl z-10" style={{ background: CHARCOAL }}>{children}</div>
    </div>
  );
}

/* ───────────────────────── ACCORDION ───────────────────────── */
function AccordionItem({ question, answer, isOpen, onToggle, accent }: { question: string; answer: string; isOpen: boolean; onToggle: () => void; accent: string }) {
  return (
    <GlassCard className="overflow-hidden">
      <button onClick={onToggle} className="w-full flex items-center justify-between p-5 md:p-6 text-left group cursor-pointer">
        <div className="flex items-center gap-4 pr-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${accent}15` }}>
            <Question size={20} weight="bold" style={{ color: accent }} />
          </div>
          <span className="text-lg font-semibold text-white">{question}</span>
        </div>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={spring}><CaretDown size={20} className="text-slate-400 shrink-0" /></motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={spring} className="overflow-hidden">
            <p className="px-5 pb-5 md:px-6 md:pb-6 pl-[4.5rem] text-slate-400 leading-relaxed">{answer}</p>
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
/* ───────────────────────── BEFORE/AFTER SLIDER ───────────────────────── */
function BeforeAfterSlider() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [sliderPos, setSliderPos] = useState(50);
  const isDragging = useRef(false);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current || !isDragging.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pos = ((clientX - rect.left) / rect.width) * 100;
    setSliderPos(Math.max(5, Math.min(95, pos)));
  }, []);

  useEffect(() => {
    const handleUp = () => { isDragging.current = false; };
    const handleMoveGlobal = (e: MouseEvent) => handleMove(e.clientX);
    const handleTouchMove = (e: TouchEvent) => { if (e.touches[0]) handleMove(e.touches[0].clientX); };
    window.addEventListener("mouseup", handleUp);
    window.addEventListener("mousemove", handleMoveGlobal);
    window.addEventListener("touchend", handleUp);
    window.addEventListener("touchmove", handleTouchMove);
    return () => {
      window.removeEventListener("mouseup", handleUp);
      window.removeEventListener("mousemove", handleMoveGlobal);
      window.removeEventListener("touchend", handleUp);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, [handleMove]);

  return (
    <div ref={containerRef} className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden cursor-ew-resize select-none border border-white/10"
      onMouseDown={() => { isDragging.current = true; }}
      onTouchStart={() => { isDragging.current = true; }}
    >
      <div className="absolute inset-0">
        <img src={STOCK_AFTER} alt="After — new roof" className="w-full h-full object-cover" />
        <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-full bg-green-600/80 backdrop-blur-sm text-white text-sm font-bold">After</div>
      </div>
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}>
        <img src={STOCK_BEFORE} alt="Before — damaged roof" className="w-full h-full object-cover" />
        <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-full bg-slate-700/80 backdrop-blur-sm text-white text-sm font-bold">Before</div>
      </div>
      <div className="absolute top-0 bottom-0 w-[2px] bg-white/80 z-10" style={{ left: `${sliderPos}%` }}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center">
          <div className="flex gap-0.5">
            <CaretDown size={12} className="text-slate-800 -rotate-90" />
            <CaretDown size={12} className="text-slate-800 rotate-90" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function V2RoofingPreview({ data }: { data: GeneratedSiteData }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const { ACCENT, ACCENT_GLOW } = getAccent(data.accentColor);

  /* Deduplicate scraped photos */
  const uniquePhotos = data.photos ? [...new Set(data.photos)] : [];
  const heroImage = uniquePhotos[0] || pickFromPool(STOCK_HERO_POOL, data.businessName);
  const heroCardImage = uniquePhotos[1] || pickFromPool(STOCK_ABOUT_POOL, data.businessName, 1);
  const aboutImage = uniquePhotos[2] || pickFromPool(STOCK_ABOUT_POOL, data.businessName, 2);
  const projectImages = uniquePhotos.length > 2 ? uniquePhotos.slice(2, 6) : pickGallery(STOCK_PROJECTS, data.businessName);
  const phoneDigits = data.phone.replace(/\D/g, "");

  const processSteps = [
    { step: "01", title: "Free Roof Inspection", desc: `Call ${data.businessName} for a free, no-obligation roof inspection. We assess damage, wear, and options.` },
    { step: "02", title: "Detailed Estimate", desc: "We provide a transparent, written estimate covering materials, labor, timeline, and warranty options." },
    { step: "03", title: "Expert Installation", desc: "Our certified crew completes the work with precision, quality materials, and respect for your property." },
    { step: "04", title: "Final Walkthrough", desc: "We inspect every detail, clean up completely, and walk you through your new roof with warranty documentation." },
  ];

  const faqs = [
    { q: `What roofing services does ${data.businessName} offer?`, a: `We provide comprehensive roofing services including ${data.services.slice(0, 3).map(s => s.name).join(", ")}, and more. Contact us for a free inspection.` },
    { q: "Do you help with insurance claims?", a: `Absolutely. ${data.businessName} has extensive experience working with insurance companies. We document damage, meet with adjusters, and help you maximize your claim.` },
    { q: "How long does a new roof take?", a: "Most residential roofs are completed in 1-3 days depending on size and complexity. We work efficiently to minimize disruption to your daily life." },
    { q: "What warranty do you offer?", a: `${data.businessName} offers manufacturer warranties of up to 50 years on materials plus our workmanship guarantee. We stand behind every roof we install.` },
  ];

  /* Fallback testimonials */
  const fallbackTestimonials = [
    { name: "Charles W.", text: "New roof installed in one day. Clean crew, quality materials, and a 25-year warranty.", rating: 5 },
    { name: "Martha B.", text: "They found and fixed a leak that two other companies missed. Honest and thorough.", rating: 5 },
    { name: "Steven R.", text: "Best roofing experience we've had. Fair price, great communication, and excellent craftsmanship.", rating: 5 }
  ];
  const testimonials = data.testimonials?.length > 0 ? data.testimonials : fallbackTestimonials;

  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden" style={{ background: CHARCOAL, color: "#f1f5f9" }}>
      <FloatingParticles accent={ACCENT} />

      {/* ══════════════════ 1. NAV ══════════════════ */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-4">
          <GlassCard className="flex items-center justify-between px-4 md:px-6 py-3">
            <div className="flex items-center gap-2">
              <House size={24} weight="fill" style={{ color: ACCENT }} />
              <span className="text-lg font-bold tracking-tight text-white">{data.businessName}</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
              <a href="#services" className="hover:text-white transition-colors">Services</a>
              <a href="#about" className="hover:text-white transition-colors">About</a>
              <a href="#projects" className="hover:text-white transition-colors">Projects</a>
              <a href="#contact" className="hover:text-white transition-colors">Contact</a>
            </div>
            <div className="flex items-center gap-3">
              <MagneticButton className="px-4 md:px-5 py-2 rounded-full text-sm font-semibold text-white transition-colors cursor-pointer" style={{ background: ACCENT } as React.CSSProperties}>Free Inspection</MagneticButton>
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

        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          <div className="space-y-8">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] px-4 py-2 rounded-full border mb-6" style={{ color: ACCENT, borderColor: `${ACCENT}33`, background: `${ACCENT}15` }}>
                <ShieldCheck size={14} weight="fill" />
                Licensed Roofing Professionals
              </span>
              <h1 className="text-4xl md:text-6xl lg:text-7xl tracking-tight leading-[0.95] font-black text-white" style={{ textShadow: "0 2px 20px rgba(0,0,0,0.6)" }}>{data.tagline}</h1>
            </div>
            <p className="text-lg text-slate-300 max-w-md leading-relaxed">{data.about.length > 160 ? data.about.slice(0, 160).trim() + "..." : data.about}</p>
            <div className="flex flex-wrap gap-4">
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white flex items-center gap-2 cursor-pointer shadow-lg" style={{ background: ACCENT, boxShadow: `0 8px 30px ${ACCENT}40` } as React.CSSProperties}>
                Free Roof Inspection <ArrowRight size={18} weight="bold" />
              </MagneticButton>
              <MagneticButton href={`tel:${phoneDigits}`} className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/20 bg-white/5 backdrop-blur-sm flex items-center gap-2 cursor-pointer">
                <Phone size={18} weight="duotone" /> <PhoneLink phone={data.phone} />
              </MagneticButton>
            </div>
            {/* Trust badges row */}
            <div className="flex flex-wrap gap-3">
              {[
                { icon: ShieldCheck, label: "Licensed & Insured" },
                { icon: Star, label: `${data.googleRating || "5.0"}-Star Rated` },
                { icon: CheckCircle, label: "Free Estimates" },
              ].map((b) => (
                <span key={b.label} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white/10 text-white/80 border border-white/10">
                  <b.icon size={14} weight="fill" style={{ color: ACCENT }} /> {b.label}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-slate-400">
              <span className="flex items-center gap-2"><MapPin size={16} weight="duotone" style={{ color: ACCENT }} /> <MapLink address={data.address} /></span>
            </div>
          </div>
          <div className="hidden lg:block relative">
            <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
              <img src={heroCardImage} alt={`${data.businessName} roofing`} className="w-full h-[520px] object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
                <div className="px-4 py-2.5 rounded-full backdrop-blur-md bg-black/50 border flex items-center gap-2" style={{ borderColor: `${ACCENT}4d` }}>
                  <ShieldCheck size={18} weight="fill" style={{ color: ACCENT }} />
                  <span className="text-sm font-semibold text-white">Licensed &amp; Insured</span>
                </div>
                <div className="px-4 py-2.5 rounded-full backdrop-blur-md bg-black/50 border border-white/20 flex items-center gap-2">
                  <div className="flex -space-x-0.5">{[...Array(5)].map((_, i) => <Star key={i} size={12} weight="fill" className="text-amber-400" />)}</div>
                  <span className="text-sm font-semibold text-white">{data.googleRating || "5.0"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════ 3. STATS ══════════════════ */}
      <section className="relative z-10 py-16 overflow-hidden border-y" style={{ borderColor: `${ACCENT}1a` }}>
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #0f1520 0%, #111827 100%)" }} />
        <RooflinePattern opacity={0.03} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] rounded-full blur-[180px]" style={{ background: `${ACCENT}18` }} /></div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {data.stats.map((stat, i) => {
              const statIcons = [House, ShieldCheck, Clock, Star];
              const Icon = statIcons[i % statIcons.length];
              return (
                <div key={stat.label} className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2"><Icon size={22} weight="fill" style={{ color: ACCENT }} /><span className="text-3xl md:text-4xl font-extrabold text-white">{stat.value}</span></div>
                  <span className="text-slate-500 text-sm font-medium tracking-wide uppercase">{stat.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════ 4. SERVICES ══════════════════ */}
      <section id="services" className="relative z-10 py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${CHARCOAL} 0%, #0f1520 50%, ${CHARCOAL} 100%)` }} />
        <RooflinePattern opacity={0.04} />
        <StormBackground opacity={0.025} accent={ACCENT} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[10%] right-[5%] w-[500px] h-[500px] rounded-full blur-[160px]" style={{ background: `${ACCENT}18` }} />
        </div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Our Services" title="Expert Roofing Services" subtitle={`From storm damage repair to full roof replacements, ${data.businessName} protects your most important investment.`} accent={ACCENT} />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.services.map((service, i) => {
              const Icon = getServiceIcon(service.name);
              return (
                <div key={service.name} className="group relative p-7 rounded-2xl border border-white/[0.06] hover:border-opacity-30 transition-all duration-500 overflow-hidden bg-white/[0.02]">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: `radial-gradient(circle at 50% 0%, ${ACCENT}15, transparent 70%)` }} />
                  <div className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `linear-gradient(to right, transparent, ${ACCENT}4d, transparent)` }} />
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-5">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center border" style={{ background: ACCENT_GLOW, borderColor: `${ACCENT}33` }}>
                        <Icon size={24} weight="duotone" style={{ color: ACCENT }} />
                      </div>
                      <span className="text-xs font-mono text-slate-600">{String(i + 1).padStart(2, "0")}</span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{service.name}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{service.description || ""}</p>
                    {service.price && <p className="text-sm font-semibold mt-3" style={{ color: ACCENT }}>{service.price}</p>}
                    <span className="flex items-center gap-1 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300 mt-4" style={{ color: ACCENT }}>Learn More <ArrowRight size={14} /></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════ 5. PROCESS ══════════════════ */}
      <section className="relative z-10 py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${CHARCOAL} 0%, #0f1520 50%, ${CHARCOAL} 100%)` }} />
        <RooflinePattern opacity={0.03} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] rounded-full blur-[180px]" style={{ background: `${DEFAULT_SLATE}12` }} /></div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Our Process" title="How We Work" accent={ACCENT} />          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
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

      {/* ══════════════════ 6. ABOUT ══════════════════ */}
      <section id="about" className="relative z-10 py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${CHARCOAL} 0%, #0f1520 50%, ${CHARCOAL} 100%)` }} />
        <StormBackground opacity={0.02} accent={ACCENT} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[20%] left-[10%] w-[500px] h-[500px] rounded-full blur-[180px]" style={{ background: `${ACCENT}06` }} /></div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="relative">
              <div className="rounded-2xl overflow-hidden border border-white/10">
                <img src={aboutImage} alt={`${data.businessName} team`} className="w-full h-[400px] object-cover" />
              </div>
              <div className="absolute -bottom-4 -right-4 md:bottom-6 md:-right-6">
                <div className="px-5 py-3 rounded-xl backdrop-blur-md border text-white font-bold text-sm shadow-lg" style={{ background: `${ACCENT}e6`, borderColor: `${ACCENT}80` }}>
                  {data.stats[0] ? `${data.stats[0].value} ${data.stats[0].label}` : "Trusted Roofers"}
                </div>
              </div>
            </div>
            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: ACCENT, borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}>Why Choose Us</span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6 text-white">Your Roof, Our Reputation</h2>
              <p className="text-slate-400 leading-relaxed mb-8">{data.about}</p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: ShieldCheck, label: "Fully Licensed" },
                  { icon: Certificate, label: "Bonded & Insured" },
                  { icon: Handshake, label: "Insurance Claims Help" },
                  { icon: Star, label: "5-Star Rated" },
                ].map((badge) => (
                  <GlassCard key={badge.label} className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: ACCENT_GLOW }}><badge.icon size={20} weight="duotone" style={{ color: ACCENT }} /></div>
                    <span className="text-sm font-semibold text-white">{badge.label}</span>
                  </GlassCard>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════ 6B. BEFORE/AFTER ══════════════════ */}
      <section className="relative z-10 py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${CHARCOAL} 0%, #0f1520 50%, ${CHARCOAL} 100%)` }} />
        <RooflinePattern opacity={0.03} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[30%] right-[15%] w-[500px] h-[500px] rounded-full blur-[200px]" style={{ background: `${ACCENT}18` }} /></div>
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <SectionHeader badge="See The Difference" title="Before & After" subtitle="Drag the slider to compare storm damage versus a professionally installed roof." accent={ACCENT} />
          <BeforeAfterSlider />
        </div>
      </section>

      {/* ══════════════════ 7. PROJECTS ══════════════════ */}
      <section id="projects" className="relative z-10 py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${CHARCOAL} 0%, #0f1520 50%, ${CHARCOAL} 100%)` }} />
        <StormBackground opacity={0.02} accent={ACCENT} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[30%] left-[20%] w-[500px] h-[500px] rounded-full blur-[200px]" style={{ background: `${ACCENT}06` }} /></div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Our Work" title="Recent Projects" accent={ACCENT} />          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projectImages.map((src, i) => {
              const titles = ["Full Roof Replacement", "Storm Damage Repair", "Commercial Roof Installation", "Gutter & Flashing Upgrade"];
              const descs = ["Complete tear-off and architectural shingle installation.", "Emergency storm response and insurance claim support.", "Flat roof installation for a commercial building.", "Premium gutter system with leak-proof flashing."];
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

      {/* ══════════════════ 7B. PREMIUM MATERIALS ══════════════════ */}
      <section className="relative z-10 py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${CHARCOAL} 0%, #0f1520 50%, ${CHARCOAL} 100%)` }} />
        <StormBackground opacity={0.02} accent={ACCENT} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute bottom-[20%] left-[10%] w-[400px] h-[400px] rounded-full blur-[160px]" style={{ background: `${ACCENT}18` }} /></div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Premium Materials" title="Quality You Can Trust" subtitle="We use only the finest roofing materials backed by industry-leading manufacturer warranties." accent={ACCENT} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {ROOFING_MATERIALS.map((mat) => (
              <GlassCard key={mat.name} className="p-6 text-center group hover:border-white/20 transition-all duration-300">
                <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: ACCENT_GLOW, border: `1px solid ${ACCENT}33` }}>
                  <mat.icon size={28} weight="duotone" style={{ color: ACCENT }} />
                </div>
                <h3 className="text-base font-bold text-white mb-2">{mat.name}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{mat.desc}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ 8. TESTIMONIALS ══════════════════ */}
      <section className="relative z-10 py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${CHARCOAL} 0%, #0f1520 50%, ${CHARCOAL} 100%)` }} />
        <RooflinePattern opacity={0.03} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[20%] right-[15%] w-[400px] h-[400px] rounded-full blur-[160px]" style={{ background: `${ACCENT}06` }} /></div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Testimonials" title="What Our Clients Say" accent={ACCENT} />
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="flex -space-x-0.5">{[...Array(5)].map((_, i) => <Star key={i} size={20} weight="fill" className="text-amber-400" />)}</div>
            <span className="text-white font-bold">{data.googleRating || "5.0"}</span>
            <span className="text-slate-400 text-sm">from {data.reviewCount || "100"}+ Google Reviews</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <GlassCard key={i} className="p-6 h-full flex flex-col">
                <span className="text-4xl leading-none font-serif mb-2" style={{ color: ACCENT }}>&ldquo;</span>
                <div className="flex gap-0.5 mb-4">{Array.from({ length: t.rating || 5 }).map((_, j) => <Star key={j} size={18} weight="fill" style={{ color: ACCENT }} />)}</div>
                <p className="text-slate-300 leading-relaxed flex-1 text-sm mb-4">{t.text}</p>
                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">{t.name}</span>
                  <span className="flex items-center gap-1 text-xs text-slate-500"><CheckCircle size={14} weight="fill" style={{ color: ACCENT }} /> Verified</span>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ 9. CTA ══════════════════ */}
      <section className="relative z-10 py-20 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT}cc, ${ACCENT})` }} />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='40' height='40' fill='none'/%3E%3Cpath d='M0 0L40 40M40 0L0 40' stroke='%23000' stroke-width='0.5'/%3E%3C/svg%3E\")" }} />

        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <Warning size={48} weight="fill" className="mx-auto mb-6 text-black/70" />
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-4">Storm Damage? We Respond Fast</h2>
          <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">Hail, wind, fallen trees — do not wait. Our emergency roofing team assesses damage and begins repairs immediately.</p>
          <PhoneLink phone={data.phone} className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-black text-white font-bold text-lg hover:bg-black/80 transition-colors">
            <span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75" /><span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500" /></span>
            {data.phone}
          </PhoneLink>
        </div>
      </section>

      {/* ══════════════════ 9B. INSURANCE CLAIMS PROCESS ══════════════════ */}
      <section className="relative z-10 py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${CHARCOAL} 0%, #0f1520 50%, ${CHARCOAL} 100%)` }} />
        <RooflinePattern opacity={0.03} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[20%] left-[15%] w-[500px] h-[500px] rounded-full blur-[200px]" style={{ background: `${ACCENT}18` }} /></div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Insurance Claims" title="We Handle Everything" subtitle="Storm damage? We manage the entire insurance process so you don't have to stress." accent={ACCENT} />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {INSURANCE_STEPS.map((step, i) => (
              <div key={step.step} className="relative">
                {i < INSURANCE_STEPS.length - 1 && <div className="hidden lg:block absolute top-8 left-[calc(50%+40px)] w-[calc(100%-80px)] h-px" style={{ background: `linear-gradient(to right, ${ACCENT}44, ${ACCENT}11)` }} />}
                <GlassCard className="p-6 text-center h-full">
                  <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: `${ACCENT}20`, border: `1px solid ${ACCENT}33` }}>
                    <step.icon size={28} weight="duotone" style={{ color: ACCENT }} />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest mb-2 block" style={{ color: ACCENT }}>Step {step.step}</span>
                  <h3 className="text-base font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
                </GlassCard>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold text-white" style={{ background: `${ACCENT}20`, border: `1px solid ${ACCENT}33` }}>
              <CurrencyDollar size={18} weight="bold" style={{ color: ACCENT }} />
              Most homeowners pay only their deductible
            </span>
          </div>
        </div>
      </section>

      {/* ══════════════════ 9C. FINANCING ══════════════════ */}
      <section className="relative z-10 py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${CHARCOAL} 0%, #0f1520 50%, ${CHARCOAL} 100%)` }} />
        <StormBackground opacity={0.02} accent={ACCENT} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute bottom-[20%] right-[10%] w-[400px] h-[400px] rounded-full blur-[160px]" style={{ background: `${ACCENT}18` }} /></div>
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <SectionHeader badge="Flexible Financing" title="A New Roof for Less Than You Think" accent={ACCENT} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[
              { price: "$89", period: "/mo", label: "Roof Repair", note: "12-month plan" },
              { price: "$149", period: "/mo", label: "Full Reroof", note: "60-month plan", featured: true },
              { price: "$199", period: "/mo", label: "Premium Upgrade", note: "48-month plan" },
            ].map((plan) => (
              <GlassCard key={plan.label} className={`p-6 text-center ${plan.featured ? "ring-2" : ""}`} style={plan.featured ? { "--tw-ring-color": ACCENT } as React.CSSProperties : undefined}>
                {plan.featured && <span className="text-xs font-bold uppercase tracking-widest mb-3 block" style={{ color: ACCENT }}>Most Popular</span>}
                <div className="flex items-baseline justify-center gap-1 mb-1">
                  <span className="text-4xl font-black text-white">{plan.price}</span>
                  <span className="text-slate-400 text-sm">{plan.period}</span>
                </div>
                <p className="text-white font-semibold mb-1">{plan.label}</p>
                <p className="text-xs text-slate-500">{plan.note}</p>
              </GlassCard>
            ))}
          </div>
          <p className="text-sm text-slate-400">0% interest available for qualified homeowners. No prepayment penalties. Apply in minutes.</p>
        </div>
      </section>

      {/* ══════════════════ 9D. CERTIFICATIONS ══════════════════ */}
      <section className="relative z-10 py-12 overflow-hidden border-y" style={{ borderColor: `${ACCENT}1a` }}>
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, #0f1520 0%, ${CHARCOAL} 100%)` }} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <p className="text-center text-xs font-bold uppercase tracking-widest text-slate-500 mb-6">Trusted Certifications & Partners</p>
          <div className="flex flex-wrap justify-center items-center gap-6 md:gap-10">
            {[
              { name: "GAF Certified", icon: ShieldCheck },
              { name: "BBB Accredited", icon: Certificate },
              { name: "Licensed & Bonded", icon: Handshake },
              { name: "Manufacturer Warranty", icon: CheckCircle },
              { name: "NRCA Member", icon: Star },
            ].map((cert) => (
              <div key={cert.name} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
                <cert.icon size={18} weight="fill" style={{ color: ACCENT }} />
                <span className="text-sm font-semibold text-white/80">{cert.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ 9E. COMPETITOR COMPARISON ══════════════════ */}
      <section className="relative z-10 py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${CHARCOAL} 0%, #0f1520 50%, ${CHARCOAL} 100%)` }} />
        <RooflinePattern opacity={0.02} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[30%] right-[20%] w-[400px] h-[400px] rounded-full blur-[180px]" style={{ background: `${ACCENT}18` }} /></div>
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Why Us" title={`${data.businessName} vs. The Competition`} accent={ACCENT} />
          <GlassCard className="overflow-hidden">
            <div className="grid grid-cols-3 text-center text-sm font-bold border-b border-white/10">
              <div className="p-4 text-slate-400">Feature</div>
              <div className="p-4 text-white" style={{ background: `${ACCENT}15` }}>{data.businessName.split(" ")[0]}</div>
              <div className="p-4 text-slate-500">Others</div>
            </div>
            {COMPARISON_ROWS.map((row, i) => (
              <div key={row.feature} className={`grid grid-cols-3 text-center text-sm ${i < COMPARISON_ROWS.length - 1 ? "border-b border-white/5" : ""}`}>
                <div className="p-3 text-slate-300 text-left pl-4">{row.feature}</div>
                <div className="p-3 flex items-center justify-center" style={{ background: `${ACCENT}08` }}>
                  <CheckCircle size={20} weight="fill" style={{ color: ACCENT }} />
                </div>
                <div className="p-3 text-slate-500">{row.them}</div>
              </div>
            ))}
          </GlassCard>
        </div>
      </section>

      {/* ══════════════════ 9F. VIDEO TESTIMONIAL ══════════════════ */}
      <section className="relative z-10 py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${CHARCOAL} 0%, #0f1520 50%, ${CHARCOAL} 100%)` }} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[20%] left-[10%] w-[500px] h-[500px] rounded-full blur-[200px]" style={{ background: `${ACCENT}12` }} /></div>
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Watch Our Work" title="See the Quality for Yourself" accent={ACCENT} />
          <div className="relative rounded-2xl overflow-hidden border border-white/10 cursor-pointer group">
            <img src={heroImage} alt="Watch our roofing projects" className="w-full h-[350px] object-cover transition-transform duration-500 group-hover:scale-105" />
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full flex items-center justify-center bg-white/20 backdrop-blur-md border border-white/30 group-hover:scale-110 transition-transform">
                <Play size={36} weight="fill" className="text-white ml-1" />
              </div>
            </div>
            <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
              <p className="text-white font-semibold text-sm">Project Showcase — {data.businessName}</p>
              <span className="text-xs text-white/60">Click to play</span>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════ 9G. ROOF AGE QUIZ ══════════════════ */}
      <section className="relative z-10 py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${ACCENT}20, ${ACCENT}08)` }} />
        <div className="max-w-3xl mx-auto px-6 relative z-10 text-center">
          <SectionHeader badge="Is It Time?" title="How Old Is Your Roof?" accent={ACCENT} />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { age: "Under 10 Years", recommendation: "Schedule a maintenance check", color: "bg-green-500/20 border-green-500/30 text-green-400", icon: CheckCircle },
              { age: "10-20 Years", recommendation: "Book a free inspection — repairs may be needed", color: "bg-amber-500/20 border-amber-500/30 text-amber-400", icon: Eye },
              { age: "20+ Years", recommendation: "Replacement recommended — call today", color: "bg-red-500/20 border-red-500/30 text-red-400", icon: Warning },
            ].map((option) => (
              <GlassCard key={option.age} className="p-6 text-center group hover:border-white/20 transition-all cursor-pointer">
                <div className={`w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center border ${option.color}`}>
                  <option.icon size={28} weight="duotone" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{option.age}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{option.recommendation}</p>
              </GlassCard>
            ))}
          </div>
          <div className="mt-8">
            <MagneticButton href={`tel:${phoneDigits}`} className="px-8 py-4 rounded-full text-base font-semibold text-white inline-flex items-center gap-2 cursor-pointer" style={{ background: ACCENT } as React.CSSProperties}>
              <Phone size={18} weight="fill" /> Get Your Free Assessment
            </MagneticButton>
          </div>
        </div>
      </section>

      {/* ══════════════════ 10. SERVICE AREAS ══════════════════ */}
      <section className="relative z-10 py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${CHARCOAL} 0%, #0f1520 50%, ${CHARCOAL} 100%)` }} />
        <RooflinePattern opacity={0.03} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[40%] right-[20%] w-[400px] h-[400px] rounded-full blur-[180px]" style={{ background: `${DEFAULT_SLATE}12` }} /></div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Coverage Area" title="Areas We Serve" accent={ACCENT} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <GlassCard className="p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: `${ACCENT}20`, border: `1px solid ${ACCENT}33` }}>
                  <NavigationArrow size={24} weight="duotone" style={{ color: ACCENT }} />
                </div>
                <div>
                  <p className="text-white font-bold">Headquarters</p>
                  <MapLink address={data.address} className="text-sm text-slate-400" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {["Within 30 miles", "Same-day service", "Free on-site estimates", "Emergency coverage"].map((area) => (
                  <div key={area} className="flex items-center gap-2 text-xs text-slate-400">
                    <CheckCircle size={14} weight="fill" style={{ color: ACCENT }} />
                    <span>{area}</span>
                  </div>
                ))}
              </div>
            </GlassCard>
            <GlassCard className="p-8 text-center">
              <Timer size={48} weight="duotone" style={{ color: ACCENT }} className="mx-auto mb-4" />
              <h3 className="text-2xl font-black text-white mb-2">Under 2 Hours</h3>
              <p className="text-slate-400 text-sm">Average emergency response time</p>
              <div className="mt-4 flex items-center justify-center gap-2">
                <span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: ACCENT }} /><span className="relative inline-flex rounded-full h-3 w-3" style={{ background: ACCENT }} /></span>
                <span className="text-xs font-bold text-white">Crews Available Now</span>
              </div>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* ══════════════════ 11. HOURS ══════════════════ */}
      {data.hours && (
        <section className="relative z-10 py-16 md:py-24 overflow-hidden">
          <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${CHARCOAL} 0%, #0f1520 50%, ${CHARCOAL} 100%)` }} />
          <StormBackground opacity={0.02} accent={ACCENT} />
          <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[20%] left-[15%] w-[400px] h-[400px] rounded-full blur-[160px]" style={{ background: `${ACCENT}06` }} /></div>
          <div className="max-w-3xl mx-auto px-6 relative z-10">
            <SectionHeader badge="Business Hours" title="When We're Available" accent={ACCENT} />            <div className="text-center">
              <ShimmerBorder accent={ACCENT}>
                <div className="p-8">
                  <Clock size={32} weight="duotone" style={{ color: ACCENT }} className="mx-auto mb-4" />
                  <p className="text-slate-300 leading-relaxed whitespace-pre-line text-lg">{data.hours}</p>
                  <p className="text-sm mt-4 font-semibold" style={{ color: ACCENT }}>Storm Emergency: Available 24/7</p>
                </div>
              </ShimmerBorder>
            </div>
          </div>
        </section>
      )}

      
      {/* ══════════════════ MID-PAGE CTA ══════════════════ */}
      <section className="relative z-10 py-12 sm:py-16 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${ACCENT}15, ${ACCENT}18)` }} />
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

      {/* ══════════════════ 12. FAQ ══════════════════ */}
      <section className="relative z-10 py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${CHARCOAL} 0%, #0f1520 50%, ${CHARCOAL} 100%)` }} />
        <RooflinePattern opacity={0.02} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[20%] left-[15%] w-[400px] h-[400px] rounded-full blur-[160px]" style={{ background: `${ACCENT}06` }} /></div>
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <SectionHeader badge="FAQ" title="Common Questions" accent={ACCENT} />          <div className="space-y-3">
            {faqs.map((faq, i) => <AccordionItem key={i} question={faq.q} answer={faq.a} isOpen={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} accent={ACCENT} />)}
          </div>
        </div>
      </section>

      {/* ══════════════════ 13. CONTACT ══════════════════ */}
      <section id="contact" className="relative z-10 py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${CHARCOAL} 0%, #0f1520 50%, ${CHARCOAL} 100%)` }} />
        <RooflinePattern opacity={0.02} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] rounded-full blur-[180px]" style={{ background: `${ACCENT}06` }} /></div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: ACCENT, borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}>Contact Us</span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6 text-white">Get a Free Roof Inspection</h2>
              <p className="text-slate-400 leading-relaxed mb-8">Concerned about your roof? Contact {data.businessName} today for a free, no-obligation inspection and estimate.</p>
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: ACCENT_GLOW }}><MapPin size={20} weight="duotone" style={{ color: ACCENT }} /></div>
                    <div><p className="text-sm font-semibold text-white">Address</p><MapLink address={data.address} className="text-sm text-slate-400" /></div>
                </div>
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: ACCENT_GLOW }}><Phone size={20} weight="duotone" style={{ color: ACCENT }} /></div>
                    <div><p className="text-sm font-semibold text-white">Phone</p><PhoneLink phone={data.phone} className="text-sm text-slate-400" /></div>
                </div>
                {[
                  { icon: House, label: "Emergency", value: "Storm Damage Response Available 24/7" },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: ACCENT_GLOW }}><item.icon size={20} weight="duotone" style={{ color: ACCENT }} /></div>
                    <div><p className="text-sm font-semibold text-white">{item.label}</p><p className="text-sm text-slate-400">{item.value}</p></div>
                  </div>
                ))}
                {data.hours && (
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: ACCENT_GLOW }}><Clock size={20} weight="duotone" style={{ color: ACCENT }} /></div>
                    <div><p className="text-sm font-semibold text-white">Hours</p><p className="text-sm text-slate-400 whitespace-pre-line">{data.hours}</p></div>
                  </div>
                )}
              </div>
            </div>
            <GlassCard className="p-8">
              <h3 className="text-xl font-semibold text-white mb-6">Request a Free Inspection</h3>
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
                <div><label className="block text-sm text-slate-400 mb-1.5">Message</label><textarea rows={4} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none text-sm resize-none" placeholder="Describe your roofing needs..." /></div>
                <MagneticButton className="w-full py-4 rounded-xl text-base font-semibold text-white flex items-center justify-center gap-2 cursor-pointer" style={{ background: ACCENT } as React.CSSProperties}>
                  Send Request <ArrowRight size={18} weight="bold" />
                </MagneticButton>
              </form>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* ══════════════════ 14. GUARANTEE ══════════════════ */}
      <section className="relative z-10 py-16 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${CHARCOAL} 0%, #0f1520 100%)` }} />
        <RooflinePattern opacity={0.015} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full blur-[180px]" style={{ background: `${ACCENT}06` }} /></div>
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <ShimmerBorder accent={ACCENT}>
            <div className="p-8 md:p-12">
              <ShieldCheck size={48} weight="fill" style={{ color: ACCENT }} className="mx-auto mb-4" />
              <h2 className="text-2xl md:text-4xl font-extrabold text-white mb-4">Our Roofing Guarantee</h2>
              <p className="text-slate-400 leading-relaxed max-w-2xl mx-auto text-lg">Every roof by {data.businessName} is backed by manufacturer warranties up to 50 years plus our workmanship guarantee. Your home is in the best hands.</p>
              <div className="flex flex-wrap justify-center gap-4 mt-8">
                {["Licensed Roofers", "Free Inspections", "Insurance Help", "Lifetime Warranty"].map((item) => (
                  <span key={item} className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border" style={{ color: ACCENT, borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}>
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
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${CHARCOAL} 0%, #0a0f1a 100%)` }} />
        <RooflinePattern opacity={0.015} />
        <div className="mx-auto max-w-6xl px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3"><House size={22} weight="fill" style={{ color: ACCENT }} /><span className="text-lg font-bold text-white">{data.businessName}</span></div>
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
            <div className="flex items-center gap-2 text-sm text-slate-500"><House size={14} weight="fill" style={{ color: ACCENT }} /><span>{data.businessName} &copy; {new Date().getFullYear()}</span></div>
            <div className="flex items-center gap-2 text-xs text-slate-600"><BluejayLogo className="w-4 h-4" /><span>Created by <a href="https://bluejayportfolio.com" target="_blank" rel="noopener noreferrer" style={{textDecoration:"underline"}}>bluejayportfolio.com</a></span></div>
          </div>
        </div>
      </footer>

      <ClaimBanner businessName={data.businessName} accentColor={ACCENT} prospectId={data.id} />
      <div className="h-14 md:h-28" />
    </main>
  );
}
