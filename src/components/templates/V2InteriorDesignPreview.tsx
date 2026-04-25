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
  Palette,
  PaintBrush,
  Lamp,
  ShieldCheck,
  Clock,
  Phone,
  MapPin,
  CaretDown,
  List,
  X,
  ArrowRight,
  Star,
  CheckCircle,
  Armchair,
  Ruler,
  House,
  Swatches,
  Blueprint,
  Lightbulb,
  CurrencyDollar,
  CalendarCheck,
  Eye,
  Bathtub,
  CookingPot,
  Desktop,
  Tree,
  Storefront,
  ForkKnife,
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
const CHARCOAL = "#faf9f7";
const DEFAULT_GOLD = "#b8860b";
const CREAM = "#d4c5a9";

function getAccent(accentColor?: string) {
  const c = accentColor || DEFAULT_GOLD;
  return {
    PRIMARY: c,
    PRIMARY_GLOW: `${c}26`,
    SECONDARY: CREAM,
  };
}

// Rotating color palette for service/room icon tiles. The primary
// brand accent (PRIMARY) stays on section headers, CTAs, and nav — the
// palette only colors iconography and highlight accents so the grid
// feels alive without fighting the brand.
const PALETTE = ["#b8860b", "#8b6f47", "#2d2d2d", "#6b7f5e", "#3a5a7c", "#d2691e"];
const pickPaletteColor = (i: number) => PALETTE[i % PALETTE.length];

/* ───────────────────────── SERVICE ICON MAP ───────────────────────── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SERVICE_ICON_MAP: Record<string, any> = {
  kitchen: House,
  bath: House,
  living: Armchair,
  bedroom: Armchair,
  office: Lamp,
  color: Swatches,
  consult: PaintBrush,
  staging: House,
  remodel: Blueprint,
  renov: Blueprint,
  light: Lightbulb,
  floor: Ruler,
  custom: Palette,
  furnit: Armchair,
  window: Lamp,
  space: Ruler,
};

function getServiceIcon(serviceName: string) {
  const lower = serviceName.toLowerCase();
  for (const [key, Icon] of Object.entries(SERVICE_ICON_MAP)) {
    if (lower.includes(key)) return Icon;
  }
  return Palette;
}

/* ───────────────────────── STOCK FALLBACK IMAGES ───────────────────────── */
const STOCK_HERO_POOL = ["https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1400&q=80"];
const STOCK_ABOUT_POOL = ["https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80"];
const STOCK_GALLERY = [
  "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600&q=80",
  "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=600&q=80",
  "https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=600&q=80",
  "https://images.unsplash.com/photo-1615529328331-f8917597711f?w=800&q=80",
  "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800&q=80",
  "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=600&q=80",
  "https://images.unsplash.com/photo-1615876234886-fd9a39fda97f?w=600&q=80",
  "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800&q=80",
];

/* ───────────────────────── DESIGN STYLE BADGES ───────────────────────── */
const DESIGN_STYLE_BADGES = [
  "Residential Design",
  "Commercial Spaces",
  "Full-Service",
  "Award-Winning",
];

/* ───────────────────────── DESIGN PACKAGES ───────────────────────── */
const DESIGN_PACKAGES = [
  {
    title: "Design Consultation",
    price: "from $250",
    description: "A personalized one-on-one session to explore your vision, assess your space, and outline a design direction tailored to your lifestyle.",
    features: ["60-Minute In-Home Visit", "Style Assessment", "Color Palette Suggestions", "Budget Guidance"],
    featured: false,
  },
  {
    title: "Room Makeover",
    price: "from $2,500",
    description: "A complete transformation of a single room — from concept and sourcing to installation and styling, delivered turnkey.",
    features: ["Full Concept Design", "Mood Board & 3D Rendering", "Furniture & Decor Sourcing", "Professional Installation", "Two Revision Rounds"],
    featured: true,
  },
  {
    title: "Full Home Design",
    price: "from $10,000+",
    description: "End-to-end design for your entire home. We manage every detail so you can enjoy the journey as much as the result.",
    features: ["Whole-Home Concept", "Custom Floor Plans", "Trade-Only Pricing Access", "Vendor & Contractor Coordination", "Project Management", "Final Styling & Reveal"],
    featured: false,
  },
];

/* ───────────────────────── DESIGN PROCESS TIMELINE (5-step) ───────────────────────── */
const DESIGN_TIMELINE = [
  { step: "01", title: "Discovery Call", desc: "We learn about your vision, lifestyle, and goals for the space.", icon: Phone },
  { step: "02", title: "Concept & Mood Board", desc: "Curated mood boards, color palettes, and material selections for your approval.", icon: Palette },
  { step: "03", title: "Design Development", desc: "Detailed floor plans, 3D renderings, and specifications brought to life.", icon: Blueprint },
  { step: "04", title: "Procurement & Installation", desc: "We source, order, and coordinate delivery of every piece — down to the last throw pillow.", icon: Armchair },
  { step: "05", title: "Final Reveal", desc: "The moment you walk into your newly designed space for the very first time.", icon: Eye },
];

/* ───────────────────────── ROOM TYPES ───────────────────────── */
const ROOM_TYPES = [
  { name: "Living Rooms", icon: Armchair },
  { name: "Kitchens", icon: CookingPot },
  { name: "Bedrooms", icon: Lamp },
  { name: "Bathrooms", icon: Bathtub },
  { name: "Home Offices", icon: Desktop },
  { name: "Outdoor Living", icon: Tree },
  { name: "Commercial Spaces", icon: Storefront },
  { name: "Restaurants", icon: ForkKnife },
];

/* ───────────────────────── DESIGN PHILOSOPHY PILLARS ───────────────────────── */
const DESIGN_PILLARS = [
  { title: "Personalized Design", desc: "Every project begins with your unique story — no cookie-cutter solutions, ever.", icon: PaintBrush },
  { title: "Quality Craftsmanship", desc: "We partner with the finest artisans and craftspeople to ensure lasting beauty.", icon: Ruler },
  { title: "Timeless Aesthetics", desc: "Designs that transcend trends and feel just as relevant a decade from now.", icon: Palette },
  { title: "Sustainable Materials", desc: "Thoughtfully sourced materials that honor both beauty and the environment.", icon: Tree },
];

/* ───────────────────────── COMPETITOR COMPARISON ROWS ───────────────────────── */
const COMPARISON_ROWS = [
  "Personalized Design Plan",
  "Trade-Only Pricing",
  "Professional Installation",
  "Color & Material Expertise",
  "Project Management",
  "Vendor Coordination",
  "3D Renderings",
];

/* ───────────────────────── DESIGN STYLE QUIZ OPTIONS ───────────────────────── */
const QUIZ_OPTIONS = [
  { style: "Modern & Minimalist", color: "#2d2d2d", desc: "Clean lines, neutral palettes, and curated simplicity." },
  { style: "Traditional & Timeless", color: "#8b6f47", desc: "Rich textures, warm woods, and classic elegance." },
  { style: "Bohemian & Eclectic", color: "#b5651d", desc: "Layered patterns, global influences, and collected charm." },
  { style: "Contemporary & Bold", color: "#3a5a7c", desc: "Statement pieces, dramatic contrasts, and artistic flair." },
];

/* ───────────────────────── FLOATING PARTICLES ───────────────────────── */
function FloatingGoldDust({ accent }: { accent: string }) {
  const particles = Array.from({ length: 16 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 8,
    duration: 7 + Math.random() * 8,
    size: 2 + Math.random() * 3,
    opacity: 0.1 + Math.random() * 0.25,
    isCream: Math.random() > 0.6,
  }));

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden hidden md:block">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{ left: `${p.x}%`, width: p.size, height: p.size, background: p.isCream ? CREAM : accent, willChange: "transform, opacity" }}
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

/* ───────────────────────── ELEGANT PATTERN ───────────────────────── */
function ElegantPattern({ opacity = 0.03, accent }: { opacity?: number; accent: string }) {
  const patternId = `elegantPatternV2Prev-${accent.replace("#", "")}`;
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }}>
      <defs>
        <pattern id={patternId} width="80" height="80" patternUnits="userSpaceOnUse">
          <rect x="10" y="10" width="60" height="60" fill="none" stroke={accent} strokeWidth="0.3" />
          <rect x="20" y="20" width="40" height="40" fill="none" stroke={accent} strokeWidth="0.3" />
          <line x1="10" y1="10" x2="20" y2="20" stroke={accent} strokeWidth="0.2" />
          <line x1="70" y1="10" x2="60" y2="20" stroke={accent} strokeWidth="0.2" />
          <line x1="70" y1="70" x2="60" y2="60" stroke={accent} strokeWidth="0.2" />
          <line x1="10" y1="70" x2="20" y2="60" stroke={accent} strokeWidth="0.2" />
          <circle cx="40" cy="40" r="2" fill={accent} opacity="0.3" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  );
}

/* ───────────────────────── LUXURY LINE SVG ───────────────────────── */
function LuxuryLines({ opacity = 0.03, accent }: { opacity?: number; accent: string }) {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }} viewBox="0 0 1000 600" preserveAspectRatio="none">
      <line x1="0" y1="150" x2="1000" y2="150" stroke={accent} strokeWidth="0.5" />
      <line x1="0" y1="300" x2="1000" y2="300" stroke={accent} strokeWidth="0.3" />
      <line x1="0" y1="450" x2="1000" y2="450" stroke={accent} strokeWidth="0.5" />
      <line x1="200" y1="0" x2="200" y2="600" stroke={CREAM} strokeWidth="0.2" />
      <line x1="500" y1="0" x2="500" y2="600" stroke={CREAM} strokeWidth="0.2" />
      <line x1="800" y1="0" x2="800" y2="600" stroke={CREAM} strokeWidth="0.2" />
    </svg>
  );
}

/* ───────────────────────── HERO SVG ───────────────────────── */
function HeroDesignSVG({ accent }: { accent: string }) {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1200 800" preserveAspectRatio="none" style={{ opacity: 0.04 }}>
      <motion.rect x="200" y="150" width="300" height="200" rx="4" stroke={accent} strokeWidth="1.5" fill="none" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2.5, ease: "easeInOut" }} />
      <motion.rect x="700" y="350" width="250" height="250" rx="4" stroke={CREAM} strokeWidth="1" fill="none" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2, ease: "easeInOut", delay: 0.4 }} />
      <motion.circle cx="350" cy="250" r="4" fill={accent} animate={{ opacity: [0, 1, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 2.5 }} />
    </svg>
  );
}

/* ───────────────────────── GLASS CARD ───────────────────────── */
function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-gray-200 bg-white/70 backdrop-blur-xl shadow-sm ${className}`}>
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
    return (<motion.a href={href} ref={ref as unknown as React.Ref<HTMLAnchorElement>} style={{ x: springX, y: springY, willChange: "transform", ...style }} onMouseMove={handleMouseMove as unknown as React.MouseEventHandler<HTMLAnchorElement>} onMouseLeave={handleMouseLeave} className={className} whileTap={{ scale: 0.97 }}>{children}</motion.a>);
  }
  return (<motion.button ref={ref} style={{ x: springX, y: springY, willChange: "transform", ...style }} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} onClick={onClick} className={className} whileTap={{ scale: 0.97 }}>{children}</motion.button>);
}

/* ───────────────────────── SHIMMER BORDER ───────────────────────── */
function ShimmerBorder({ children, className = "", accent }: { children: React.ReactNode; className?: string; accent: string }) {
  return (
    <div className={`relative rounded-2xl p-[1px] overflow-hidden ${className}`}>
      <motion.div className="absolute inset-0 rounded-2xl" style={{ background: `conic-gradient(from 0deg, transparent, ${accent}, transparent, ${CREAM}, transparent)`, willChange: "transform" }} animate={{ rotate: [0, 360] }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} />
      <div className="relative rounded-2xl bg-white z-10">{children}</div>
    </div>
  );
}

/* ───────────────────────── ACCORDION ───────────────────────── */
function AccordionItem({ question, answer, isOpen, onToggle }: { question: string; answer: string; isOpen: boolean; onToggle: () => void }) {
  return (
    <GlassCard className="overflow-hidden">
      <button onClick={onToggle} className="w-full flex items-center justify-between p-5 md:p-6 text-left group cursor-pointer">
        <span className="text-lg font-semibold text-[#1c1917] pr-4">{question}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={spring}><CaretDown size={20} className="text-[#6b7280] shrink-0" /></motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={spring} className="overflow-hidden"><p className="px-5 pb-5 md:px-6 md:pb-6 text-[#6b7280] leading-relaxed">{answer}</p></motion.div>)}
      </AnimatePresence>
    </GlassCard>
  );
}

/* ───────────────────────── SECTION HEADER ───────────────────────── */
function SectionHeader({ badge, title, subtitle, accent }: { badge: string; title: string; subtitle?: string; accent: string }) {
  return (
    <div className="text-center mb-16">
      <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: accent, borderColor: `${accent}33`, background: `${accent}0d` }}>{badge}</span>
      <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-[#1c1917]">{title}</h2>
      <div className="h-0.5 w-16 mx-auto mt-4" style={{ background: `linear-gradient(to right, ${accent}, transparent)` }} />
      {subtitle && <p className="text-[#6b7280] mt-4 max-w-2xl text-lg leading-relaxed mx-auto">{subtitle}</p>}
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════════
   MAIN PREVIEW COMPONENT — GALLERY-HEAVY INTERIOR DESIGN
   ═══════════════════════════════════════════════════════════════════ */
/* ───────────────────────── ANIMATED SECTION ───────────────────────── */
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

export default function V2InteriorDesignPreview({ data }: { data: GeneratedSiteData }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [quizSelection, setQuizSelection] = useState<number | null>(null);

  const { PRIMARY, PRIMARY_GLOW } = getAccent(data.accentColor);

  const uniquePhotos = data.photos ? [...new Set(data.photos)] : [];


  const heroImage = uniquePhotos[0] || pickFromPool(STOCK_HERO_POOL, data.businessName);


  const heroCardImage = uniquePhotos[1] || pickFromPool(STOCK_ABOUT_POOL, data.businessName, 1);


  const aboutImage = uniquePhotos[2] || pickFromPool(STOCK_ABOUT_POOL, data.businessName, 2);
  const usedUrls = new Set([heroImage, heroCardImage, aboutImage].filter(Boolean));
  const galleryFromReal = uniquePhotos.slice(3).filter((u) => !usedUrls.has(u));
  const galleryImages =
    galleryFromReal.length >= 8
      ? galleryFromReal.slice(0, 8)
      : [
          ...galleryFromReal,
          ...pickGallery(STOCK_GALLERY, data.businessName).filter(
            (u) => !usedUrls.has(u) && !galleryFromReal.includes(u)
          ),
        ].slice(0, 8);

  const faqs = [
    { q: `What design services does ${data.businessName} offer?`, a: `We offer a full spectrum of interior design services including ${data.services.slice(0, 3).map(s => s.name).join(", ")}, and more. Each project is tailored to your personal style and needs.` },
    { q: "What is your design process like?", a: `Our process begins with a discovery call, followed by concept development, material sourcing, and final installation. ${data.businessName} handles everything so you can enjoy the transformation.` },
    { q: "Do you work within a budget?", a: "Absolutely. We work with a range of budgets and always provide transparent pricing. We'll help you prioritize investments that make the biggest impact in your space." },
    { q: "How long does a typical project take?", a: `Timeline depends on the scope. A single room refresh might take 4-6 weeks, while a full home renovation can take 3-6 months. Contact ${data.businessName} for a personalized estimate.` },
  ];

  /* Fallback testimonials */
  const fallbackTestimonials = [
    { name: "Victoria H.", text: "They transformed our living room from dated to magazine-worthy. Absolutely love the result.", rating: 5 },
    { name: "Christopher J.", text: "Worked within our budget and still delivered a stunning design. True creative professionals.", rating: 5 },
    { name: "Ashley N.", text: "Our home finally feels like us. They listened to every preference and nailed the vision.", rating: 5 }
  ];
  const testimonials = data.testimonials?.length > 0 ? data.testimonials : fallbackTestimonials;

  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden" style={{ fontFamily: "Montserrat, system-ui, sans-serif", background: CHARCOAL, color: "#1c1917" }}>
      <FloatingGoldDust accent={PRIMARY} />

      {/* ══════════════════ 1. NAV ══════════════════ */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-4">
          <GlassCard className="flex items-center justify-between px-4 md:px-6 py-3">
            <div className="flex items-center gap-2">
              <Palette size={24} weight="fill" style={{ color: PRIMARY }} />
              <span className="text-lg font-bold tracking-tight text-[#1c1917]">{data.businessName}</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm text-[#6b7280]">
              <a href="#portfolio" className="hover:text-[#1c1917] transition-colors">Portfolio</a>
              <a href="#services" className="hover:text-[#1c1917] transition-colors">Services</a>
              <a href="#about" className="hover:text-[#1c1917] transition-colors">About</a>
              <a href="#contact" className="hover:text-[#1c1917] transition-colors">Contact</a>
            </div>
            <div className="flex items-center gap-3">
              <MagneticButton className="px-4 md:px-5 py-2 rounded-full text-sm font-semibold text-black transition-colors cursor-pointer" style={{ background: PRIMARY } as React.CSSProperties}>
                Free Consultation
              </MagneticButton>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-lg text-[#1c1917] hover:bg-gray-100 transition-colors">
                {mobileMenuOpen ? <X size={24} /> : <List size={24} />}
              </button>
            </div>
          </GlassCard>
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3, ease: "easeInOut" }} className="md:hidden mt-2 overflow-hidden">
                <GlassCard className="flex flex-col gap-1 px-4 py-4">
                  {[{ label: "Portfolio", href: "#portfolio" }, { label: "Services", href: "#services" }, { label: "About", href: "#about" }, { label: "Contact", href: "#contact" }].map((link) => (
                    <a key={link.label} href={link.href} onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-lg text-sm text-[#4b5563] hover:text-[#1c1917] hover:bg-gray-50 transition-colors">{link.label}</a>
                  ))}
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* ══════════════════ 2. HERO — FULL-BLEED ══════════════════ */}
      <section className="relative min-h-[100dvh] flex items-center pt-24 z-10 overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImage} alt={`${data.businessName} interior design`} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#faf9f7] via-transparent to-transparent" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6 w-full">
          <div className="max-w-2xl space-y-8">
            <div>
              <p className="text-sm uppercase tracking-widest mb-4" style={{ color: PRIMARY }}>Luxury Interior Design</p>
              <h1 className="text-3xl md:text-6xl tracking-tighter leading-none font-bold text-white" style={{ textShadow: "0 2px 20px rgba(0,0,0,0.7)" }}>{data.tagline}</h1>
            </div>
            <p className="text-lg text-white/70 max-w-md leading-relaxed">{(() => { const t = data.about; if (t.length <= 180) return t; const dot = t.indexOf('.', 80); return dot > 0 && dot < 220 ? t.slice(0, dot + 1) : t.slice(0, 180).trim() + '...'; })()}</p>
            <div className="flex flex-wrap gap-4">
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-black flex items-center gap-2 cursor-pointer" style={{ background: PRIMARY } as React.CSSProperties}>
                View Our Work <ArrowRight size={18} weight="bold" />
              </MagneticButton>
              <MagneticButton href={`tel:${data.phone.replace(/\D/g, "")}`} className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/20 flex items-center gap-2 cursor-pointer backdrop-blur-sm">
                <Phone size={18} weight="duotone" /><PhoneLink phone={data.phone} />
              </MagneticButton>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-white/70">
              <span className="flex items-center gap-2"><MapPin size={16} weight="duotone" style={{ color: PRIMARY }} /><MapLink address={data.address} /></span>
              <span className="flex items-center gap-2"><Palette size={16} weight="duotone" style={{ color: PRIMARY }} />Transforming Spaces Into Art</span>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════ DESIGN STYLE BADGES ══════════════════ */}
      <section className="relative z-10 py-6 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #faf9f7 0%, #f5f3ef 100%)" }} />
        <div className="max-w-5xl mx-auto px-4 md:px-6 relative z-10">
          <div className="flex flex-wrap justify-center gap-3">
            {DESIGN_STYLE_BADGES.map((badge) => (
              <span key={badge} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold border backdrop-blur-sm" style={{ color: PRIMARY, borderColor: `${PRIMARY}33`, background: `${PRIMARY}0d` }}>
                <CheckCircle size={16} weight="fill" style={{ color: PRIMARY }} />
                {badge}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ 3. STATS ══════════════════ */}
      <section className="relative z-10 py-16 overflow-hidden border-y" style={{ borderColor: `${PRIMARY}1a` }}>
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #f5f3ef 0%, #faf9f7 100%)" }} />
        <ElegantPattern opacity={0.02} accent={PRIMARY} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] rounded-full blur-[180px]" style={{ background: `${PRIMARY}08` }} /></div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {data.stats.map((stat, i) => {
              const statIcons = [Palette, House, Star, CheckCircle];
              const Icon = statIcons[i % statIcons.length];
              return (<div key={stat.label} className="text-center"><div className="flex items-center justify-center gap-2 mb-2"><Icon size={22} weight="fill" style={{ color: PRIMARY }} /><span className="text-3xl md:text-4xl font-extrabold text-[#1c1917]">{stat.value}</span></div><span className="text-[#9ca3af] text-sm font-medium tracking-wide uppercase">{stat.label}</span></div>);
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════ 4. PORTFOLIO GALLERY ══════════════════ */}
      <section id="portfolio" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #faf9f7 0%, #f5f3ef 50%, #faf9f7 100%)" }} />
        <ElegantPattern opacity={0.02} accent={PRIMARY} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[20%] right-[10%] w-[500px] h-[500px] rounded-full blur-[200px]" style={{ background: `${PRIMARY}06` }} /></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Portfolio" title="Our Design Showcase" subtitle={`Explore curated spaces designed by ${data.businessName}. Each project reflects our commitment to timeless elegance.`} accent={PRIMARY} />
          <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
            {galleryImages.map((src, i) => (
              <div key={i} className="group relative rounded-2xl overflow-hidden border border-gray-200/60 hover:border-opacity-30 transition-all duration-500 break-inside-avoid">
                <img src={src} alt={`Design project ${i + 1}`} className={`w-full object-cover transition-transform duration-700 group-hover:scale-105 ${i % 3 === 0 ? "h-80" : i % 3 === 1 ? "h-64" : "h-72"}`} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="flex items-center gap-2"><Palette size={14} weight="fill" style={{ color: PRIMARY }} /><span className="text-xs text-white/80 font-medium">{data.businessName}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ BEFORE/AFTER TRANSFORMATION ══════════════════ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #faf9f7 0%, #f5f3ef 50%, #faf9f7 100%)" }} />
        <LuxuryLines opacity={0.02} accent={PRIMARY} />
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Transformations" title="See the Difference" subtitle={`${data.businessName} turns ordinary rooms into extraordinary spaces.`} accent={PRIMARY} />
          <div className="relative rounded-2xl overflow-hidden border border-gray-200 shadow-lg">
            <img src="/images/interior-design-before-after.jpg" alt="Kitchen transformation before and after" className="w-full h-auto" />
          </div>
          <p className="text-center text-[#9ca3af] text-sm mt-6 italic">Every space has untapped potential. Let us reveal yours.</p>
        </div>
      </section>

      {/* ══════════════════ 5. SERVICES ══════════════════ */}
      <section id="services" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #faf9f7 0%, #f5f3ef 50%, #faf9f7 100%)" }} />
        <LuxuryLines opacity={0.025} accent={PRIMARY} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[10%] right-[5%] w-[500px] h-[500px] rounded-full blur-[160px]" style={{ background: `${PRIMARY}08` }} />
        </div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Services" title="Design Services" subtitle={`From concept to completion, ${data.businessName} transforms your space into something extraordinary.`} accent={PRIMARY} />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.services.map((service, i) => {
              const tile = pickPaletteColor(i);
              const Icon = getServiceIcon(service.name);
              return (
                <div key={service.name} className="group relative p-7 rounded-2xl border border-gray-200/60 hover:border-opacity-30 transition-all duration-500 overflow-hidden bg-white/60">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: `radial-gradient(circle at 50% 0%, ${tile}15, transparent 70%)` }} />
                  <div className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `linear-gradient(to right, transparent, ${tile}4d, transparent)` }} />
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-5">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center border" style={{ background: `${tile}22`, borderColor: `${tile}55` }}><Icon size={24} weight="duotone" style={{ color: tile }} /></div>
                      <span className="text-xs font-mono" style={{ color: `${tile}99` }}>{String(i + 1).padStart(2, "0")}</span>
                    </div>
                    <h3 className="text-lg font-bold text-[#1c1917] mb-2">{service.name}</h3>
                    <p className="text-sm text-[#6b7280] leading-relaxed">{service.description || ""}</p>
                    {service.price && <p className="text-sm font-semibold mt-3" style={{ color: tile }}>{service.price}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════ ROOM TYPES WE DESIGN ══════════════════ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #faf9f7 0%, #f5f3ef 50%, #faf9f7 100%)" }} />
        <ElegantPattern opacity={0.02} accent={PRIMARY} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Spaces" title="Room Types We Design" subtitle="From intimate bedrooms to grand commercial lobbies, we design every type of space." accent={PRIMARY} />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {ROOM_TYPES.map((room, i) => {
              const tile = pickPaletteColor(i + 2);
              return (
                <GlassCard key={room.name} className="p-6 text-center group hover:shadow-md transition-all duration-300">
                  <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center transition-colors duration-300" style={{ background: `${tile}22`, border: `1px solid ${tile}55` }}>
                    <room.icon size={28} weight="duotone" style={{ color: tile }} />
                  </div>
                  <h3 className="text-sm font-bold text-[#1c1917]">{room.name}</h3>
                </GlassCard>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════ DESIGN PACKAGES / PRICING ══════════════════ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #faf9f7 0%, #f5f3ef 50%, #faf9f7 100%)" }} />
        <LuxuryLines opacity={0.025} accent={PRIMARY} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[30%] left-[10%] w-[500px] h-[500px] rounded-full blur-[200px]" style={{ background: `${PRIMARY}06` }} /></div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Investment" title="Design Packages" subtitle="Thoughtful tiers to match every scope — from a single room refresh to a complete home transformation." accent={PRIMARY} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {DESIGN_PACKAGES.map((pkg) => (
              <div key={pkg.title} className={`relative rounded-2xl border overflow-hidden transition-all duration-300 ${pkg.featured ? "shadow-lg scale-[1.02] md:scale-105" : "hover:shadow-md"}`} style={{ borderColor: pkg.featured ? `${PRIMARY}55` : "rgba(229,231,235,0.6)", background: pkg.featured ? `linear-gradient(180deg, ${PRIMARY}08, white)` : "rgba(255,255,255,0.7)" }}>
                {pkg.featured && (
                  <div className="text-center py-2 text-xs font-bold uppercase tracking-widest text-black" style={{ background: PRIMARY }}>Most Popular</div>
                )}
                <div className="p-7">
                  <div className="flex items-center gap-2 mb-1">
                    <CurrencyDollar size={20} weight="duotone" style={{ color: PRIMARY }} />
                    <h3 className="text-lg font-bold text-[#1c1917]">{pkg.title}</h3>
                  </div>
                  <p className="text-2xl font-extrabold mb-3" style={{ color: PRIMARY }}>{pkg.price}</p>
                  <p className="text-sm text-[#6b7280] leading-relaxed mb-5">{pkg.description}</p>
                  <ul className="space-y-2 mb-6">
                    {pkg.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-[#4b5563]">
                        <CheckCircle size={16} weight="fill" style={{ color: PRIMARY }} />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <MagneticButton className={`w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors ${pkg.featured ? "text-black" : "text-[#1c1917] border"}`} style={pkg.featured ? { background: PRIMARY } as React.CSSProperties : { borderColor: `${PRIMARY}44`, background: `${PRIMARY}0d` } as React.CSSProperties}>
                    Get Started <ArrowRight size={16} weight="bold" />
                  </MagneticButton>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ 6. ABOUT ══════════════════ */}
      <section id="about" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #faf9f7 0%, #f5f3ef 50%, #faf9f7 100%)" }} />
        <LuxuryLines opacity={0.02} accent={PRIMARY} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[20%] left-[10%] w-[500px] h-[500px] rounded-full blur-[180px]" style={{ background: `${PRIMARY}06` }} /></div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="relative">
              <div className="rounded-2xl overflow-hidden border border-gray-200"><img src={aboutImage} alt={`${data.businessName} designer`} className="w-full h-[400px] object-cover" /></div>
              <div className="absolute -bottom-4 -right-4 md:bottom-6 md:-right-6">
                <div className="px-5 py-3 rounded-xl backdrop-blur-md border text-black font-bold text-sm shadow-lg" style={{ background: `${PRIMARY}e6`, borderColor: `${PRIMARY}80` }}>
                  {data.stats[0] ? `${data.stats[0].value} ${data.stats[0].label}` : "Award-Winning"}
                </div>
              </div>
            </div>
            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: PRIMARY, borderColor: `${PRIMARY}33`, background: `${PRIMARY}0d` }}>About Us</span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6 text-[#1c1917]">Designing Spaces That Inspire</h2>
              <p className="text-[#6b7280] leading-relaxed mb-8">{data.about}</p>
              <div className="grid grid-cols-2 gap-4">
                {[{ icon: Palette, label: "Curated Design" }, { icon: Ruler, label: "Precision Planning" }, { icon: Star, label: "5-Star Rated" }, { icon: House, label: "Full-Service" }].map((badge) => (
                  <GlassCard key={badge.label} className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: PRIMARY_GLOW }}><badge.icon size={20} weight="duotone" style={{ color: PRIMARY }} /></div>
                    <span className="text-sm font-semibold text-[#1c1917]">{badge.label}</span>
                  </GlassCard>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════ DESIGN PHILOSOPHY ══════════════════ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #faf9f7 0%, #f5f3ef 50%, #faf9f7 100%)" }} />
        <ElegantPattern opacity={0.02} accent={PRIMARY} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute bottom-[10%] right-[15%] w-[400px] h-[400px] rounded-full blur-[160px]" style={{ background: `${CREAM}08` }} /></div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Philosophy" title="Your Vision, Our Expertise" subtitle="Four guiding principles that define how we approach every project." accent={PRIMARY} />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {DESIGN_PILLARS.map((pillar, i) => (
              <GlassCard key={pillar.title} className="p-6 text-center group hover:shadow-md transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `linear-gradient(to right, transparent, ${PRIMARY}4d, transparent)` }} />
                <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${PRIMARY}22, ${PRIMARY}0a)`, border: `1px solid ${PRIMARY}33` }}>
                  <pillar.icon size={26} weight="duotone" style={{ color: PRIMARY }} />
                </div>
                <span className="text-xs font-mono text-[#9ca3af] mb-2 block">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="text-base font-bold text-[#1c1917] mb-2">{pillar.title}</h3>
                <p className="text-sm text-[#6b7280] leading-relaxed">{pillar.desc}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ 7. PROCESS ══════════════════ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #faf9f7 0%, #f5f3ef 50%, #faf9f7 100%)" }} />
        <ElegantPattern opacity={0.025} accent={PRIMARY} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] rounded-full blur-[180px]" style={{ background: `${CREAM}06` }} /></div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Our Process" title="From Vision to Reality" subtitle="A refined five-step journey that turns inspiration into a beautifully realized space." accent={PRIMARY} />
          <div className="space-y-6 max-w-3xl mx-auto">
            {DESIGN_TIMELINE.map((step, i) => {
              const StepIcon = step.icon;
              return (
                <div key={step.step} className="flex gap-5 items-start">
                  <div className="flex flex-col items-center shrink-0">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${PRIMARY}22, ${PRIMARY}0a)`, border: `1px solid ${PRIMARY}33` }}>
                      <StepIcon size={24} weight="duotone" style={{ color: PRIMARY }} />
                    </div>
                    {i < DESIGN_TIMELINE.length - 1 && <div className="w-px flex-1 min-h-[24px] mt-2" style={{ background: `linear-gradient(to bottom, ${PRIMARY}33, ${PRIMARY}0a)` }} />}
                  </div>
                  <GlassCard className="p-5 flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-xs font-mono font-bold" style={{ color: PRIMARY }}>{step.step}</span>
                      <h3 className="text-base font-bold text-[#1c1917]">{step.title}</h3>
                    </div>
                    <p className="text-sm text-[#6b7280] leading-relaxed">{step.desc}</p>
                  </GlassCard>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════ 8. TESTIMONIALS ══════════════════ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #faf9f7 0%, #f5f3ef 50%, #faf9f7 100%)" }} />
        <ElegantPattern opacity={0.02} accent={PRIMARY} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[20%] right-[15%] w-[400px] h-[400px] rounded-full blur-[160px]" style={{ background: `${PRIMARY}06` }} /></div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Testimonials" title="Client Experiences" accent={PRIMARY} />
          {/* Google Reviews Header */}
          <div className="flex flex-col items-center gap-2 mb-10">
            <div className="flex items-center gap-1.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={24} weight="fill" style={{ color: PRIMARY }} />
              ))}
            </div>
            <p className="text-sm text-[#6b7280]">
              <span className="font-bold text-[#1c1917]">{data.googleRating || "5.0"}</span> average rating from <span className="font-bold text-[#1c1917]">{data.reviewCount || "50+"}</span> Google reviews
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <GlassCard key={i} className="p-6 h-full flex flex-col">
                <div className="flex gap-0.5 mb-4">{Array.from({ length: t.rating || 5 }).map((_, j) => (<Star key={j} size={16} weight="fill" style={{ color: PRIMARY }} />))}</div>
                <p className="text-[#4b5563] leading-relaxed flex-1 text-sm mb-4">&ldquo;{t.text}&rdquo;</p>
                <div className="pt-4 border-t border-gray-100"><span className="text-sm font-semibold text-[#1c1917]">{t.name}</span></div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ COMPETITOR COMPARISON ══════════════════ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #faf9f7 0%, #f5f3ef 50%, #faf9f7 100%)" }} />
        <LuxuryLines opacity={0.02} accent={PRIMARY} />
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Why Us" title={`${data.businessName} vs. DIY / Big Box`} subtitle="Professional interior design delivers what no showroom floor model ever could." accent={PRIMARY} />
          <GlassCard className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left p-4 md:p-5 text-[#6b7280] font-medium">Feature</th>
                    <th className="text-center p-4 md:p-5 font-bold text-[#1c1917] min-w-[120px]">{data.businessName}</th>
                    <th className="text-center p-4 md:p-5 text-[#9ca3af] font-medium min-w-[120px]">DIY / Big Box</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_ROWS.map((row, i) => (
                    <tr key={row} className={i < COMPARISON_ROWS.length - 1 ? "border-b border-gray-50" : ""}>
                      <td className="p-4 md:p-5 text-[#4b5563] font-medium">{row}</td>
                      <td className="p-4 md:p-5 text-center"><CheckCircle size={22} weight="fill" style={{ color: PRIMARY }} /></td>
                      <td className="p-4 md:p-5 text-center text-[#d1d5db] text-xs font-medium">No / DIY</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* ══════════════════ 9. CTA ══════════════════ */}
      <section className="relative z-10 py-20 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${PRIMARY}, ${PRIMARY}cc, ${PRIMARY})` }} />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='40' height='40' fill='none'/%3E%3Cpath d='M0 0L40 40M40 0L0 40' stroke='%23000' stroke-width='0.5'/%3E%3C/svg%3E\")" }} />
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <Palette size={48} weight="fill" className="mx-auto mb-6 text-black/70" />
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-black mb-4">Ready to Transform Your Space?</h2>
          <p className="text-lg text-black/70 mb-8 max-w-xl mx-auto">Schedule a complimentary consultation with {data.businessName} and discover how we can elevate your home or office.</p>
          <PhoneLink phone={data.phone} className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-black text-white font-bold text-lg hover:bg-black/80 transition-colors">
            <Phone size={22} weight="fill" />{data.phone}
          </PhoneLink>
        </div>
      </section>

      {/* ══════════════════ 10. SERVICE AREAS ══════════════════ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #faf9f7 0%, #f5f3ef 50%, #faf9f7 100%)" }} />
        <ElegantPattern opacity={0.02} accent={PRIMARY} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <AnimatedSection>          <SectionHeader badge="Location" title="Areas We Serve" accent={PRIMARY} /></AnimatedSection>
          <div className="text-center">
            <GlassCard className="p-8 inline-block">
              <div className="flex items-center gap-3 text-lg"><MapPin size={24} weight="duotone" style={{ color: PRIMARY }} /><MapLink address={data.address} className="text-[#1c1917] font-semibold" /></div>
              <p className="text-[#6b7280] text-sm mt-2">Available for projects throughout the region</p>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* ══════════════════ 11. HOURS ══════════════════ */}
      {data.hours && (
        <section className="relative z-10 py-24 md:py-32 overflow-hidden">
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #faf9f7 0%, #f5f3ef 50%, #faf9f7 100%)" }} />
          <LuxuryLines opacity={0.02} accent={PRIMARY} />
          <div className="max-w-3xl mx-auto px-6 relative z-10">
            <AnimatedSection>          <SectionHeader badge="Hours" title="Studio Hours" accent={PRIMARY} /></AnimatedSection>
            <div className="text-center">
              <ShimmerBorder accent={PRIMARY}><div className="p-8"><Clock size={32} weight="duotone" style={{ color: PRIMARY }} className="mx-auto mb-4" /><p className="text-[#4b5563] leading-relaxed whitespace-pre-line text-lg">{data.hours}</p><p className="text-sm mt-4 font-semibold" style={{ color: PRIMARY }}>Consultations by appointment</p></div></ShimmerBorder>
            </div>
          </div>
        </section>
      )}

      
      {/* ══════════════════ MID-PAGE CTA ══════════════════ */}
      <section className="relative z-10 py-12 sm:py-16 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${PRIMARY}15, ${PRIMARY}08)` }} />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: PRIMARY }}>
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
            style={{ background: PRIMARY }}
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
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #faf9f7 0%, #f5f3ef 50%, #faf9f7 100%)" }} />
        <LuxuryLines opacity={0.02} accent={PRIMARY} />
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <AnimatedSection>          <SectionHeader badge="FAQ" title="Common Questions" accent={PRIMARY} /></AnimatedSection>
          <div className="space-y-3">
            {faqs.map((faq, i) => (<AccordionItem key={i} question={faq.q} answer={faq.a} isOpen={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} />))}
          </div>
        </div>
      </section>

      {/* ══════════════════ DESIGN STYLE QUIZ ══════════════════ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #faf9f7 0%, #f5f3ef 50%, #faf9f7 100%)" }} />
        <ElegantPattern opacity={0.02} accent={PRIMARY} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[20%] left-[20%] w-[400px] h-[400px] rounded-full blur-[180px]" style={{ background: `${PRIMARY}06` }} /></div>
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Discover" title="What's Your Design Style?" subtitle="Select the aesthetic that resonates most with you and we'll tailor our consultation to match." accent={PRIMARY} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {QUIZ_OPTIONS.map((opt, i) => (
              <button
                key={opt.style}
                onClick={() => setQuizSelection(i)}
                className={`text-left p-5 rounded-2xl border transition-all duration-300 cursor-pointer group ${quizSelection === i ? "shadow-md" : "hover:shadow-sm"}`}
                style={{
                  borderColor: quizSelection === i ? `${PRIMARY}66` : "rgba(229,231,235,0.6)",
                  background: quizSelection === i ? `${PRIMARY}0d` : "rgba(255,255,255,0.7)",
                }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg shrink-0" style={{ background: opt.color }} />
                  <h3 className="text-sm font-bold text-[#1c1917]">{opt.style}</h3>
                </div>
                <p className="text-xs text-[#6b7280] leading-relaxed">{opt.desc}</p>
                {quizSelection === i && (
                  <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold" style={{ color: PRIMARY }}>
                    <CheckCircle size={14} weight="fill" /> Selected
                  </div>
                )}
              </button>
            ))}
          </div>
          {quizSelection !== null && (
            <div className="text-center">
              <p className="text-sm text-[#6b7280] mb-4">Great taste! Let us build a {QUIZ_OPTIONS[quizSelection].style.toLowerCase()} vision just for you.</p>
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-black inline-flex items-center gap-2 cursor-pointer" style={{ background: PRIMARY } as React.CSSProperties}>
                <CalendarCheck size={18} weight="bold" /> Book Your Consultation
              </MagneticButton>
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════ 13. CONTACT ══════════════════ */}
      <section id="contact" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #faf9f7 0%, #f5f3ef 50%, #faf9f7 100%)" }} />
        <ElegantPattern opacity={0.02} accent={PRIMARY} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: PRIMARY, borderColor: `${PRIMARY}33`, background: `${PRIMARY}0d` }}>Contact</span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6 text-[#1c1917]">Start Your Design Journey</h2>
              <p className="text-[#6b7280] leading-relaxed mb-8">Reach out to {data.businessName} and let&apos;s bring your vision to life. Your dream space is just a conversation away.</p>
              <div className="space-y-5">
                <div className="flex items-start gap-4"><div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: PRIMARY_GLOW }}><MapPin size={20} weight="duotone" style={{ color: PRIMARY }} /></div><div><p className="text-sm font-semibold text-[#1c1917]">Studio</p><MapLink address={data.address} className="text-sm text-[#6b7280]" /></div></div>
                <div className="flex items-start gap-4"><div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: PRIMARY_GLOW }}><Phone size={20} weight="duotone" style={{ color: PRIMARY }} /></div><div><p className="text-sm font-semibold text-[#1c1917]">Phone</p><PhoneLink phone={data.phone} className="text-sm text-[#6b7280]" /></div></div>
                <div className="flex items-start gap-4"><div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: PRIMARY_GLOW }}><Palette size={20} weight="duotone" style={{ color: PRIMARY }} /></div><div><p className="text-sm font-semibold text-[#1c1917]">Consultations</p><p className="text-sm text-[#6b7280]">Complimentary initial consultation</p></div></div>
                {data.hours && (<div className="flex items-start gap-4"><div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: PRIMARY_GLOW }}><Clock size={20} weight="duotone" style={{ color: PRIMARY }} /></div><div><p className="text-sm font-semibold text-[#1c1917]">Hours</p><p className="text-sm text-[#6b7280] whitespace-pre-line">{data.hours}</p></div></div>)}
              </div>
            </div>
            <GlassCard className="p-8">
              <h3 className="text-xl font-semibold text-[#1c1917] mb-6">Request a Consultation</h3>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className="block text-sm text-[#6b7280] mb-1.5">First Name</label><input type="text" className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-[#1c1917] placeholder-gray-400 focus:outline-none text-sm" placeholder="Jane" /></div>
                  <div><label className="block text-sm text-[#6b7280] mb-1.5">Last Name</label><input type="text" className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-[#1c1917] placeholder-gray-400 focus:outline-none text-sm" placeholder="Smith" /></div>
                </div>
                <div><label className="block text-sm text-[#6b7280] mb-1.5">Phone</label><input type="tel" className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-[#1c1917] placeholder-gray-400 focus:outline-none text-sm" placeholder="(555) 123-4567" /></div>
                <div><label className="block text-sm text-[#6b7280] mb-1.5">Project Type</label>
                  <select className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-[#1c1917] focus:outline-none text-sm">
                    <option value="" className="bg-white">Select a service</option>
                    {data.services.map((s) => (<option key={s.name} value={s.name.toLowerCase().replace(/\s+/g, "-")} className="bg-white">{s.name}</option>))}
                  </select>
                </div>
                <div><label className="block text-sm text-[#6b7280] mb-1.5">Tell Us About Your Project</label><textarea rows={4} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-[#1c1917] placeholder-gray-400 focus:outline-none text-sm resize-none" placeholder="Describe your space and design goals..." /></div>
                <MagneticButton className="w-full py-4 rounded-xl text-base font-semibold text-black flex items-center justify-center gap-2 cursor-pointer" style={{ background: PRIMARY } as React.CSSProperties}>
                  Request Consultation <ArrowRight size={18} weight="bold" />
                </MagneticButton>
              </form>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* ══════════════════ 14. GUARANTEE ══════════════════ */}
      <section className="relative z-10 py-16 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #faf9f7 0%, #f5f3ef 100%)" }} />
        <ElegantPattern opacity={0.015} accent={PRIMARY} />
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <ShimmerBorder accent={PRIMARY}>
            <div className="p-8 md:p-12">
              <ShieldCheck size={48} weight="fill" style={{ color: PRIMARY }} className="mx-auto mb-4" />
              <h2 className="text-2xl md:text-4xl font-extrabold text-[#1c1917] mb-4">Our Design Promise</h2>
              <p className="text-[#6b7280] leading-relaxed max-w-2xl mx-auto text-lg">{data.businessName} is dedicated to creating spaces that exceed expectations. We combine timeless aesthetics with functional design to deliver results that transform how you live and work.</p>
              <div className="flex flex-wrap justify-center gap-4 mt-8">
                {["Personalized Design", "Premium Materials", "On-Time Delivery", "Client Satisfaction"].map((item) => (
                  <span key={item} className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border" style={{ color: PRIMARY, borderColor: `${PRIMARY}33`, background: `${PRIMARY}0d` }}><CheckCircle size={16} weight="fill" />{item}</span>
                ))}
              </div>
            </div>
          </ShimmerBorder>
        </div>
      </section>

      {/* ══════════════════ COMPLIMENTARY CONSULTATION CTA ══════════════════ */}
      <section className="relative z-10 py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #f5f3ef 0%, #faf9f7 100%)" }} />
        <ElegantPattern opacity={0.02} accent={PRIMARY} />
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <ShimmerBorder accent={PRIMARY}>
            <div className="p-8 md:p-14 text-center">
              <CalendarCheck size={44} weight="fill" style={{ color: PRIMARY }} className="mx-auto mb-5" />
              <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight text-[#1c1917] mb-3">Book Your Free Design Consultation</h2>
              <p className="text-[#6b7280] leading-relaxed max-w-xl mx-auto text-lg mb-8">Let&apos;s transform your space. Share your vision with {data.businessName} and receive a complimentary design roadmap tailored to your home or office.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <MagneticButton href={`tel:${data.phone.replace(/\D/g, "")}`} className="px-8 py-4 rounded-full text-base font-semibold text-black inline-flex items-center gap-2 cursor-pointer" style={{ background: PRIMARY } as React.CSSProperties}>
                  <Phone size={20} weight="fill" /> <PhoneLink phone={data.phone} />
                </MagneticButton>
                <span className="text-sm text-[#9ca3af]">or</span>
                <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-[#1c1917] border inline-flex items-center gap-2 cursor-pointer" style={{ borderColor: `${PRIMARY}44` } as React.CSSProperties} href="#contact">
                  <ArrowRight size={18} weight="bold" /> Fill Out Our Form
                </MagneticButton>
              </div>
            </div>
          </ShimmerBorder>
        </div>
      </section>

      {/* ══════════════════ 15. FOOTER ══════════════════ */}
      <footer className="relative z-10 border-t border-gray-100 py-10 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #faf9f7 0%, #f5f3ef 100%)" }} />
        <ElegantPattern opacity={0.015} accent={PRIMARY} />
        <div className="mx-auto max-w-6xl px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3"><Palette size={22} weight="fill" style={{ color: PRIMARY }} /><span className="text-lg font-bold text-[#1c1917]">{data.businessName}</span></div>
              <p className="text-sm text-[#9ca3af] leading-relaxed">{data.about.length > 120 ? data.about.slice(0, 120).trim() + "..." : data.about}</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[#1c1917] mb-3">Quick Links</h4>
              <div className="space-y-2">{["Portfolio", "Services", "About", "Contact"].map((link) => (<a key={link} href={`#${link.toLowerCase()}`} className="block text-sm text-[#9ca3af] hover:text-[#1c1917] transition-colors">{link}</a>))}</div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[#1c1917] mb-3">Contact</h4>
              <div className="space-y-2 text-sm text-[#9ca3af]">
                <p><PhoneLink phone={data.phone} /></p>
                <p><MapLink address={data.address} /></p>
                {data.socialLinks && Object.entries(data.socialLinks).map(([platform, url]) => (<a key={platform} href={url} target="_blank" rel="noopener noreferrer" className="block hover:text-[#1c1917] transition-colors capitalize">{platform}</a>))}
              </div>
            </div>
          </div>
          <div className="border-t border-gray-100 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-[#9ca3af]"><Palette size={14} weight="fill" style={{ color: PRIMARY }} /><span>{data.businessName} &copy; {new Date().getFullYear()}</span></div>
            <div className="flex items-center gap-2 text-xs text-[#6b7280]"><BluejayLogo className="w-4 h-4" /><span>Created by <a href="https://bluejayportfolio.com" target="_blank" rel="noopener noreferrer" style={{textDecoration:"underline"}}>bluejayportfolio.com</a></span></div>
          </div>
        </div>
      </footer>

      <ClaimBanner businessName={data.businessName} accentColor={PRIMARY} prospectId={data.id} />
      <div className="h-14 md:h-28" />
    </main>
  );
}
