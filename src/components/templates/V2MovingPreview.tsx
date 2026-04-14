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
  Truck,
  Package,
  ShieldCheck,
  Clock,
  Phone,
  MapPin,
  CaretDown,
  List,
  X,
  Cube,
  House,
  Buildings,
  Warehouse,
  CheckCircle,
  ArrowRight,
  Star,
  HandGrabbing,
  CurrencyDollar,
  Play,
  Timer,
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
const CHARCOAL = "#1a1a1a";
const DEFAULT_ORANGE = "#f97316";
const ORANGE_LIGHT = "#fb923c";
const BROWN = "#92400e";

function getAccent(accentColor?: string) {
  const c = accentColor || DEFAULT_ORANGE;
  return { ACCENT: c, ACCENT_GLOW: `${c}26`, ACCENT_LIGHT: ORANGE_LIGHT, BROWN };
}

/* ───────────────────────── SERVICE ICON MAP ───────────────────────── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SERVICE_ICON_MAP: Record<string, any> = {
  local: Truck,
  residential: House,
  office: Buildings,
  commercial: Buildings,
  pack: Package,
  storage: Warehouse,
  piano: Cube,
  load: HandGrabbing,
  junk: Truck,
  long: Truck,
  special: Cube,
  
};

function getServiceIcon(serviceName: string) {
  const lower = serviceName.toLowerCase();
  for (const [key, Icon] of Object.entries(SERVICE_ICON_MAP)) {
    if (lower.includes(key)) return Icon;
  }
  return Truck;
}

/* ───────────────────────── STOCK FALLBACK IMAGES ───────────────────────── */
/* Moving-relevant stock photos — movers, trucks, boxes, packing */
const STOCK_HERO_POOL = [
  "https://images.unsplash.com/photo-1581573950452-5a438c5f390f?w=1400&q=80",    // family unpacking in new home
  "https://images.unsplash.com/photo-1614359835514-92f8ba196357?w=1400&q=80",    // movers loading furniture onto truck
  "https://images.unsplash.com/photo-1624137527136-66e631bdaa0e?w=1400&q=80",    // stacked cardboard boxes against wall
  "https://images.unsplash.com/photo-1601467995997-ac1ae9a8fff4?w=1400&q=80",    // white unbranded moving truck
  "https://images.unsplash.com/photo-1580709839515-54b8991e2813?w=1400&q=80",    // person carrying bins through doorway
];
const STOCK_ABOUT_POOL = [
  "https://images.unsplash.com/photo-1663625318264-695d2d04f11a?w=800&q=80",     // moving boxes by apartment window
  "https://images.unsplash.com/photo-1577705998148-6da4f3963bc8?w=800&q=80",     // single cardboard box on floor
  "https://images.unsplash.com/photo-1600725935160-f67ee4f6084a?w=800&q=80",     // packed boxes stacked in room
  "https://images.unsplash.com/photo-1586781383963-8e66f88077ec?w=800&q=80",     // boxes being loaded from truck
  "https://images.unsplash.com/photo-1624137308703-e1da1ca881df?w=800&q=80",     // moving boxes styled with flowers
];
const STOCK_PROJECTS = [
  "https://images.unsplash.com/photo-1624137527136-66e631bdaa0e?w=600&q=80",     // stacked cardboard boxes
  "https://images.unsplash.com/photo-1580709839515-54b8991e2813?w=600&q=80",     // person carrying moving bins
  "https://images.unsplash.com/photo-1601467995997-ac1ae9a8fff4?w=600&q=80",     // moving truck parked
  "https://images.unsplash.com/photo-1663625318264-695d2d04f11a?w=600&q=80",     // boxes by apartment window
  "https://images.unsplash.com/photo-1614359835514-92f8ba196357?w=600&q=80",     // movers loading furniture
  "https://images.unsplash.com/photo-1577705998148-6da4f3963bc8?w=600&q=80",     // cardboard box on floor
  "https://images.unsplash.com/photo-1600725935160-f67ee4f6084a?w=600&q=80",     // packed boxes in room
  "https://images.unsplash.com/photo-1581573950452-5a438c5f390f?w=600&q=80",     // family settling into new home
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
          style={{ left: `${p.x}%`, width: p.size, height: p.size, background: p.isMint ? BROWN : accent, willChange: "transform, opacity" }}
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
          <circle cx="50" cy="30" r="1" fill={BROWN} opacity="0.3" />
          <circle cx="90" cy="15" r="1.8" fill={accent} opacity="0.35" />
          <circle cx="30" cy="70" r="1.2" fill={BROWN} opacity="0.3" />
          <circle cx="70" cy="80" r="2" fill={accent} opacity="0.4" />
          <circle cx="20" cy="50" r="0.8" fill={accent} opacity="0.25" />
          <path d="M45 45 L50 40 L55 45 L50 50 Z" fill={accent} opacity="0.2" />
          <path d="M80 55 L85 50 L90 55 L85 60 Z" fill={BROWN} opacity="0.15" />
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
      <path d="M700 80 Q700 40 715 80 Q730 120 700 120 Q670 120 700 80 Z" fill={BROWN} />
      <path d="M450 400 Q450 350 470 400 Q490 450 450 450 Q410 450 450 400 Z" fill={accent} />
      <circle cx="150" cy="400" r="30" fill={accent} opacity="0.3" />
      <circle cx="850" cy="300" r="20" fill={BROWN} opacity="0.3" />
    </svg>
  );
}

/* ───────────────────────── GLASS CARD ───────────────────────── */
function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-white/15 bg-white/[0.06] backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)] ${className}`}>
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
      <motion.div className="absolute inset-0 rounded-2xl" style={{ background: `conic-gradient(from 0deg, transparent, ${accent}, transparent, ${BROWN}, transparent)`, willChange: "transform" }}
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
      initial={{ opacity: 0, scale: 0.92 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, ease: "easeOut" as const }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function V2MovingPreview({ data }: { data: GeneratedSiteData }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const { ACCENT, ACCENT_GLOW } = getAccent(data.accentColor);

  /* Deduplicate scraped photos — ensure hero, card, and about are NEVER the same */
  const uniquePhotos = data.photos ? [...new Set(data.photos)] : [];
  const heroImage = uniquePhotos[0] || pickFromPool(STOCK_HERO_POOL, data.businessName);
  const heroCardImage = uniquePhotos[1] || pickFromPool(STOCK_ABOUT_POOL, data.businessName, 1);
  const aboutImage = uniquePhotos.length >= 2 && uniquePhotos[1] !== uniquePhotos[0]
    ? uniquePhotos[1]
    : uniquePhotos[2] || pickFromPool(STOCK_ABOUT_POOL, data.businessName, 2);
  const projectImages = uniquePhotos.length > 2 ? uniquePhotos.slice(2, 6) : pickGallery(STOCK_PROJECTS, data.businessName);

  const processSteps = [
    { step: "01", title: "Free Moving Quote", desc: "Tell us about your move and get a detailed, no-obligation estimate." },
    { step: "02", title: "Plan Your Move", desc: "We assign a dedicated crew and create your custom moving timeline." },
    { step: "03", title: "Moving Day", desc: "Our trained movers arrive on time, protect belongings, and load efficiently." },
    { step: "04", title: "Safe Delivery", desc: "We unload and place everything exactly where you want it in your new space." },
  ];

  /* ── Licensed & Insured Badges ── */
  const trustBadges = [
    { icon: ShieldCheck, label: "Licensed & Bonded" },
    { icon: ShieldCheck, label: "Full Insurance Coverage" },
    { icon: Star, label: "BBB Accredited" },
    { icon: CheckCircle, label: "Background-Checked Crews" },
  ];

  /* ── Moving Pricing Estimates ── */
  const pricingTiers = [
    { title: "Studio / 1BR", price: "From $349", desc: "Small moves, apartments, and studios. Includes 2 movers and a truck.", featured: false },
    { title: "2-3 Bedroom", price: "From $599", desc: "Standard home moves with full packing and furniture protection.", featured: true },
    { title: "4BR+ / Large", price: "From $999", desc: "Large homes, multi-story, or long-distance relocations.", featured: false },
  ];

  /* ── Moving Day Checklist ── */
  const movingChecklist = [
    "Book 4-6 weeks ahead",
    "Declutter before packing",
    "Label all boxes by room",
    "Disconnect appliances",
    "Keep an essentials bag",
    "Walk through your old home",
  ];

  /* ── Truck Size Calculator ── */
  const truckSizes = [
    { size: "Studio / 1BR", truck: "16 ft truck", icon: House, desc: "Perfect for studio apartments and small 1-bedroom moves." },
    { size: "2 Bedroom", truck: "20 ft truck", icon: House, desc: "Ideal for average 2-bedroom homes and apartments." },
    { size: "3 Bedroom", truck: "26 ft truck", icon: Buildings, desc: "Fits full 3-bedroom households with furniture and appliances." },
    { size: "4BR+", truck: "Multiple trucks", icon: Warehouse, desc: "Large homes requiring multiple trips or trucks." },
  ];

  /* ── What We Move ── */
  const whatWeMove = [
    "Furniture", "Electronics", "Pianos", "Antiques",
    "Fragile Items", "Office Equipment", "Storage Units", "Appliances",
  ];

  /* ── Competitor Comparison ── */
  const comparisonRows = [
    { feature: "Licensed & Insured", us: true, them: "Sometimes" },
    { feature: "No Hidden Fees", us: true, them: "No" },
    { feature: "On-Time Guarantee", us: true, them: "No" },
    { feature: "Furniture Protection", us: true, them: "Sometimes" },
    { feature: "Free Estimates", us: true, them: "Sometimes" },
    { feature: "Same-Day Available", us: true, them: "No" },
    { feature: "Background-Checked", us: true, them: "No" },
  ];

  /* ── Moving Quiz Options ── */
  const quizOptions = [
    { label: "This Week", sublabel: "Rush service available!", color: "#ef4444", icon: Timer },
    { label: "This Month", sublabel: "Great timing \u2014 book now", color: ACCENT, icon: CalendarCheck },
    { label: "Just Planning", sublabel: "Get a free quote & lock in your date", color: "#22c55e", icon: NavigationArrow },
  ];

  const faqs = [
    { q: `What moving services does ${data.businessName} offer?`, a: `We provide a full range of professional moving services including ${data.services.slice(0, 3).map(s => s.name).join(", ")}, and more. Get a free quote today.` },
    { q: "How far in advance should I book?", a: "We recommend booking 2-4 weeks ahead. Peak season (summer) may require more notice." },
    { q: "Do you provide packing materials?", a: `Yes! ${data.businessName} provides all packing materials including boxes, tape, bubble wrap, and specialty containers for fragile items.` },
    { q: "Are my belongings insured during the move?", a: "Absolutely. We carry full liability coverage and offer additional valuation protection options for high-value items." },
  ];

  /* Fallback testimonials */
  const fallbackTestimonials = [
    { name: "Christine D.", text: "Moved our entire 4-bedroom house without a single scratch. Careful, fast, and friendly crew.", rating: 5 },
    { name: "Brian P.", text: "They packed everything perfectly and were done hours ahead of schedule. Best movers we've used.", rating: 5 },
    { name: "Kelly A.", text: "Stress-free moving experience from start to finish. Fair price and they handled our stuff with care.", rating: 5 }
  ];
  const testimonials = data.testimonials?.length > 0 ? data.testimonials : fallbackTestimonials;

  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden" style={{ background: CHARCOAL, color: "#f1f5f9" }}>
      <FloatingSparkles accent={ACCENT} />

      {/* ══════════════════ 1. NAV ══════════════════ */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-4">
          <GlassCard className="flex items-center justify-between px-4 md:px-6 py-3">
            <div className="flex items-center gap-2">
              <Truck size={24} weight="fill" style={{ color: ACCENT }} />
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
                Free Quote
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
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          <div className="space-y-8">
            <div>
              <p className="text-sm uppercase tracking-widest mb-4" style={{ color: ACCENT }}>Professional Moving Company</p>
              <h1 className="text-3xl md:text-6xl tracking-tighter leading-none font-bold text-white" style={{ textShadow: "0 2px 20px rgba(0,0,0,0.8), 0 4px 40px rgba(0,0,0,0.5)" }}>
                {data.tagline}
              </h1>
            </div>
            <p className="text-lg text-slate-400 max-w-md leading-relaxed">
              {(() => { const t = data.about; if (t.length <= 180) return t; const dot = t.indexOf('.', 80); return dot > 0 && dot < 220 ? t.slice(0, dot + 1) : t.slice(0, 180).trim() + '...'; })()}
            </p>
            <div className="flex flex-wrap gap-4">
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white flex items-center gap-2 cursor-pointer" style={{ background: ACCENT } as React.CSSProperties}>
                Get Free Quote <ArrowRight size={18} weight="bold" />
              </MagneticButton>
              <MagneticButton href={`tel:${data.phone.replace(/\D/g, "")}`} className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/10 flex items-center gap-2 cursor-pointer">
                <Phone size={18} weight="duotone" /> <PhoneLink phone={data.phone} />
              </MagneticButton>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-slate-400">
              <span className="flex items-center gap-2"><MapPin size={16} weight="duotone" style={{ color: ACCENT }} /><MapLink address={data.address} /></span>
              <span className="flex items-center gap-2"><ShieldCheck size={16} weight="duotone" style={{ color: ACCENT }} />Licensed & Insured</span>
            </div>
          </div>
          <div className="hidden md:block relative">
            <div className="relative rounded-2xl overflow-hidden border border-white/10">
              <img src={heroCardImage} alt={`${data.businessName} professional moving`} className="w-full h-[500px] object-cover" />
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
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #0f0d08 0%, #1a1a1a 100%)" }} />
        <SparklePattern opacity={0.02} accent={ACCENT} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] rounded-full blur-[180px]" style={{ background: `${ACCENT}15` }} /></div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {data.stats.map((stat, i) => {
              const statIcons = [Truck, ShieldCheck, Clock, Star];
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

      {/* ══════════════════ 4. SERVICES ══════════════════ */}
      <section id="services" className="relative z-10 py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0f0d08 50%, #1a1a1a 100%)" }} />
        <SparklePattern accent={ACCENT} />
        <WaterDropBackground opacity={0.025} accent={ACCENT} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[10%] right-[5%] w-[500px] h-[500px] rounded-full blur-[160px]" style={{ background: `${ACCENT}15` }} />
          <div className="absolute bottom-[10%] left-[5%] w-[400px] h-[400px] rounded-full blur-[140px]" style={{ background: `${BROWN}05` }} />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Our Services" title="Complete Moving Solutions" subtitle={`From local residential moves to long-distance relocations, ${data.businessName} handles every move with care and precision.`} accent={ACCENT} />
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

      {/* ══════════════════ 4B. LICENSED & INSURED BADGES ══════════════════ */}
      <section className="relative z-10 py-12 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0f0d08 50%, #1a1a1a 100%)" }} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {trustBadges.map((badge) => (
              <GlassCard key={badge.label} className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: ACCENT_GLOW, border: `1px solid ${ACCENT}33` }}>
                  <badge.icon size={20} weight="fill" style={{ color: ACCENT }} />
                </div>
                <span className="text-sm font-semibold text-white">{badge.label}</span>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ 4C. MOVING PRICING ESTIMATES ══════════════════ */}
      <section className="relative z-10 py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #1a1005 50%, #1a1a1a 100%)" }} />
        <WaterDropBackground opacity={0.02} accent={ACCENT} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[20%] left-[15%] w-[500px] h-[500px] rounded-full blur-[180px]" style={{ background: `${ACCENT}08` }} /></div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Pricing" title="Transparent Moving Estimates" subtitle="No hidden fees. Get an accurate quote in minutes." accent={ACCENT} />
          <div className="grid md:grid-cols-3 gap-6">
            {pricingTiers.map((tier) => (
              <div key={tier.title} className={`relative rounded-2xl border p-7 transition-all duration-300 ${tier.featured ? "border-opacity-60 scale-[1.03] shadow-lg" : "border-white/[0.06] bg-white/[0.02]"}`}
                style={tier.featured ? { borderColor: `${ACCENT}66`, background: `linear-gradient(180deg, ${ACCENT}12, ${ACCENT}04)` } : {}}>
                {tier.featured && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold uppercase tracking-wider px-4 py-1 rounded-full text-white" style={{ background: ACCENT }}>
                    Most Popular
                  </span>
                )}
                <div className="text-center mb-5">
                  <CurrencyDollar size={28} weight="duotone" style={{ color: ACCENT }} className="mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-white mb-1">{tier.title}</h3>
                  <p className="text-2xl md:text-3xl font-extrabold text-white">{tier.price}</p>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed text-center mb-6">{tier.desc}</p>
                <MagneticButton className="w-full py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 cursor-pointer" style={{ background: tier.featured ? ACCENT : `${ACCENT}33` } as React.CSSProperties}>
                  Get Quote <ArrowRight size={16} weight="bold" />
                </MagneticButton>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ 4D. TRUCK SIZE CALCULATOR ══════════════════ */}
      <section className="relative z-10 py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0f0d08 50%, #1a1a1a 100%)" }} />
        <SparklePattern opacity={0.02} accent={ACCENT} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute bottom-[30%] right-[10%] w-[400px] h-[400px] rounded-full blur-[160px]" style={{ background: `${BROWN}06` }} /></div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Truck Calculator" title="What Size Move?" subtitle="Choose the right truck size for your home." accent={ACCENT} />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {truckSizes.map((t) => (
              <GlassCard key={t.size} className="p-6 text-center group hover:border-white/25 transition-all duration-300">
                <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${ACCENT}22, ${ACCENT}0a)`, border: `1px solid ${ACCENT}33` }}>
                  <t.icon size={26} weight="duotone" style={{ color: ACCENT }} />
                </div>
                <h3 className="text-base font-bold text-white mb-1">{t.size}</h3>
                <p className="text-sm font-semibold mb-2" style={{ color: ACCENT }}>{t.truck}</p>
                <p className="text-xs text-slate-400 leading-relaxed">{t.desc}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ 5. WHY CHOOSE US / ABOUT ══════════════════ */}
      <section id="about" className="relative z-10 py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #1a1005 50%, #1a1a1a 100%)" }} />
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
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6 text-white">Move With Confidence</h2>
              <p className="text-slate-400 leading-relaxed mb-8">{data.about}</p>
              <div className="grid grid-cols-2 gap-4">
                {[{ icon: ShieldCheck, label: "Fully Insured" }, { icon: Package, label: "Professional Packing" }, { icon: Star, label: "5-Star Rated" }, { icon: CheckCircle, label: "No Hidden Fees" }].map((badge) => (
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
      <section className="relative z-10 py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0f0d08 50%, #1a1a1a 100%)" }} />
        <SparklePattern opacity={0.025} accent={ACCENT} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] rounded-full blur-[180px]" style={{ background: `${BROWN}06` }} /></div>
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
      <section id="gallery" className="relative z-10 py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #1a1005 50%, #1a1a1a 100%)" }} />
        <WaterDropBackground opacity={0.02} accent={ACCENT} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[30%] left-[20%] w-[500px] h-[500px] rounded-full blur-[200px]" style={{ background: `${ACCENT}06` }} /></div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <AnimatedSection>          <SectionHeader badge="Our Work" title="Recent Moves" accent={ACCENT} /></AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projectImages.map((src, i) => {
              const titles = ["Residential Move", "Office Relocation", "Long Distance Move", "Storage & Delivery"];
              const descs = ["Full home move with white-glove service.", "Complete office relocation with minimal downtime.", "Cross-state move handled with precision.", "Secure storage and on-demand delivery."];
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

      {/* ══════════════════ 7B. VIDEO PLACEHOLDER ══════════════════ */}
      <section className="relative z-10 py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0f0d08 50%, #1a1a1a 100%)" }} />
        <SparklePattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <SectionHeader badge="See Us In Action" title="Watch Our Crew in Action" accent={ACCENT} />
          <div className="relative rounded-2xl overflow-hidden border border-white/10 group cursor-pointer">
            <img src={heroCardImage} alt="Watch our moving crew" className="w-full h-64 md:h-96 object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-black/50 group-hover:bg-black/40 transition-colors duration-300" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full flex items-center justify-center border-2 border-white/30 backdrop-blur-sm group-hover:scale-110 transition-transform duration-300" style={{ background: `${ACCENT}cc` }}>
                <Play size={36} weight="fill" className="text-white ml-1" />
              </div>
            </div>
            <div className="absolute bottom-6 left-6 right-6 text-center">
              <p className="text-white font-semibold text-lg">See How We Handle Your Belongings</p>
              <p className="text-slate-300 text-sm mt-1">Professional moving, from start to finish</p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════ 7C. COMPETITOR COMPARISON TABLE ══════════════════ */}
      <section className="relative z-10 py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #1a1005 50%, #1a1a1a 100%)" }} />
        <WaterDropBackground opacity={0.02} accent={ACCENT} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[30%] left-[10%] w-[500px] h-[500px] rounded-full blur-[180px]" style={{ background: `${ACCENT}06` }} /></div>
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Why Us" title={`${data.businessName} vs Average Movers`} accent={ACCENT} />
          <GlassCard className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-4 text-slate-400 font-medium">Feature</th>
                    <th className="text-center p-4 font-bold text-white" style={{ minWidth: 100 }}>{data.businessName.length > 18 ? "Us" : data.businessName}</th>
                    <th className="text-center p-4 text-slate-500 font-medium" style={{ minWidth: 100 }}>Others</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row, i) => (
                    <tr key={row.feature} className={i % 2 === 0 ? "bg-white/[0.02]" : ""}>
                      <td className="p-4 text-white font-medium">{row.feature}</td>
                      <td className="p-4 text-center"><CheckCircle size={22} weight="fill" style={{ color: "#22c55e" }} className="mx-auto" /></td>
                      <td className="p-4 text-center text-slate-500 text-xs">{row.them}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* ══════════════════ 7D. GOOGLE REVIEWS HEADER + TESTIMONIALS ══════════════════ */}
      {/* ══════════════════ 8. TESTIMONIALS ══════════════════ */}
      <section className="relative z-10 py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0f0d08 50%, #1a1a1a 100%)" }} />
        <SparklePattern opacity={0.02} accent={ACCENT} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[20%] right-[15%] w-[400px] h-[400px] rounded-full blur-[160px]" style={{ background: `${ACCENT}06` }} /></div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          {/* Google Reviews Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-sm">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={18} weight="fill" style={{ color: ACCENT }} />
                ))}
              </div>
              <span className="text-white font-bold text-sm">
                {data.googleRating || "5.0"}
              </span>
              <span className="text-slate-400 text-sm">
                ({data.reviewCount || "50"}+ Reviews)
              </span>
            </div>
          </div>
          <AnimatedSection><SectionHeader badge="Testimonials" title="What Our Clients Say" accent={ACCENT} /></AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <GlassCard key={i} className="p-6 h-full flex flex-col">
                <div className="flex gap-0.5 mb-4">{Array.from({ length: t.rating || 5 }).map((_, j) => <Star key={j} size={16} weight="fill" style={{ color: ACCENT }} />)}</div>
                <p className="text-slate-300 leading-relaxed flex-1 text-sm mb-4">&ldquo;{t.text}&rdquo;</p>
                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">{t.name}</span>
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
          <Truck size={48} weight="fill" className="mx-auto mb-6 text-white/70" />
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-4">Ready to Move?</h2>
          <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">Get your free moving estimate today. We make moving stress-free, guaranteed.</p>
          <PhoneLink phone={data.phone} className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-black text-white font-bold text-lg hover:bg-black/80 transition-colors">
            <span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" /><span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" /></span>
            {data.phone}
          </PhoneLink>
        </div>
      </section>

      {/* ══════════════════ 9B. WHEN ARE YOU MOVING? QUIZ ══════════════════ */}
      <section className="relative z-10 py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0f0d08 50%, #1a1a1a 100%)" }} />
        <SparklePattern opacity={0.02} accent={ACCENT} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[30%] right-[15%] w-[400px] h-[400px] rounded-full blur-[160px]" style={{ background: `${ACCENT}08` }} /></div>
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Quick Quiz" title="When Are You Moving?" subtitle="Select your timeline and we'll match you with the right service." accent={ACCENT} />
          <div className="grid md:grid-cols-3 gap-5">
            {quizOptions.map((opt) => (
              <div key={opt.label} className="group relative rounded-2xl border border-white/[0.06] p-6 text-center hover:border-opacity-40 transition-all duration-300 cursor-pointer bg-white/[0.02]"
                style={{ borderColor: `${opt.color}33` }}>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none" style={{ background: `radial-gradient(circle at 50% 0%, ${opt.color}15, transparent 70%)` }} />
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: `${opt.color}22`, border: `1px solid ${opt.color}44` }}>
                    <opt.icon size={26} weight="duotone" style={{ color: opt.color }} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">{opt.label}</h3>
                  <p className="text-sm text-slate-400">{opt.sublabel}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <MagneticButton href={`tel:${data.phone.replace(/\D/g, "")}`} className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-base font-semibold text-white cursor-pointer" style={{ background: ACCENT } as React.CSSProperties}>
              <Phone size={20} weight="fill" /> Call Now for Your Free Quote
            </MagneticButton>
          </div>
        </div>
      </section>

      {/* ══════════════════ 10. WHAT WE MOVE (ENHANCED) ══════════════════ */}
      <section className="relative z-10 py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #1a1005 50%, #1a1a1a 100%)" }} />
        <SparklePattern opacity={0.02} accent={ACCENT} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[40%] right-[20%] w-[400px] h-[400px] rounded-full blur-[180px]" style={{ background: `${BROWN}06` }} /></div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <AnimatedSection><SectionHeader badge="What We Move" title="We Handle It All" subtitle="From heavy furniture to delicate antiques, our crews are trained for every item." accent={ACCENT} /></AnimatedSection>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {whatWeMove.map((item) => (
              <GlassCard key={item} className="p-5 text-center group hover:border-white/25 transition-all duration-300">
                <Package size={24} weight="duotone" style={{ color: ACCENT }} className="mx-auto mb-2" />
                <span className="text-sm font-semibold text-white">{item}</span>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ 10B. MOVING DAY CHECKLIST ══════════════════ */}
      <section className="relative z-10 py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0f0d08 50%, #1a1a1a 100%)" }} />
        <WaterDropBackground opacity={0.02} accent={ACCENT} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[20%] left-[10%] w-[500px] h-[500px] rounded-full blur-[180px]" style={{ background: `${ACCENT}06` }} /></div>
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Be Prepared" title="Your Moving Day Checklist" subtitle="Follow these tips for a smooth, stress-free move." accent={ACCENT} />
          <ShimmerBorder accent={ACCENT}>
            <div className="p-6 md:p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {movingChecklist.map((item) => (
                  <div key={item} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <CheckCircle size={22} weight="fill" style={{ color: ACCENT }} className="shrink-0" />
                    <span className="text-sm font-medium text-white">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </ShimmerBorder>
        </div>
      </section>

      {/* ══════════════════ 11. SERVICE AREAS ══════════════════ */}
      <section className="relative z-10 py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0f0d08 50%, #1a1a1a 100%)" }} />
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
        <section className="relative z-10 py-16 md:py-24 overflow-hidden">
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #1a1005 50%, #1a1a1a 100%)" }} />
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
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${ACCENT}15, ${ACCENT}15)` }} />
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

      {/* ══════════════════ 12B. MOVING DAY GUARANTEE CTA ══════════════════ */}
      <section className="relative z-10 py-16 md:py-20 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${ACCENT}15, ${ACCENT}08)` }} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full blur-[200px]" style={{ background: `${ACCENT}12` }} /></div>
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <ShieldCheck size={48} weight="fill" style={{ color: ACCENT }} className="mx-auto mb-6" />
          <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight text-white mb-4">
            Our Promise: On Time, No Hidden Fees, No Damage — Guaranteed
          </h2>
          <p className="text-slate-400 text-lg mb-8 max-w-2xl mx-auto">
            We stand behind every move. If anything goes wrong, we make it right. That&apos;s the {data.businessName} guarantee.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {["On-Time Arrival", "No Hidden Fees", "Damage Protection", "Satisfaction Guaranteed"].map((badge) => (
              <span key={badge} className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border" style={{ color: ACCENT, borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}>
                <CheckCircle size={16} weight="fill" /> {badge}
              </span>
            ))}
          </div>
          <MagneticButton href={`tel:${data.phone.replace(/\D/g, "")}`} className="inline-flex items-center gap-3 px-8 py-4 rounded-full text-base font-semibold text-white cursor-pointer" style={{ background: ACCENT } as React.CSSProperties}>
            <Phone size={20} weight="fill" /> Get Your Guaranteed Quote
          </MagneticButton>
        </div>
      </section>

      {/* ══════════════════ 13. FAQ ══════════════════ */}
      <section className="relative z-10 py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0f0d08 50%, #1a1a1a 100%)" }} />
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
      <section id="contact" className="relative z-10 py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #1a1005 50%, #1a1a1a 100%)" }} />
        <SparklePattern opacity={0.02} accent={ACCENT} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] rounded-full blur-[180px]" style={{ background: `${ACCENT}06` }} /></div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: ACCENT, borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}>Contact Us</span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6 text-white">Get Your Free Quote</h2>
              <p className="text-slate-400 leading-relaxed mb-8">Ready to make your move? Contact {data.businessName} today for a free, no-obligation estimate. We respond to all inquiries within 24 hours.</p>
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
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: ACCENT_GLOW }}><Package size={20} weight="duotone" style={{ color: ACCENT }} /></div>
                  <div><p className="text-sm font-semibold text-white">Full-Service</p><p className="text-sm text-slate-400">Full packing and unpacking services</p></div>
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
              <h3 className="text-xl font-semibold text-white mb-6">Request a Free Quote</h3>
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
                <div><label className="block text-sm text-slate-400 mb-1.5">Message</label><textarea rows={4} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none transition-colors text-sm resize-none" placeholder="Tell us about your move..." /></div>
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
              <div className="flex items-center gap-2 mb-3"><Truck size={22} weight="fill" style={{ color: ACCENT }} /><span className="text-lg font-bold text-white">{data.businessName}</span></div>
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
            <div className="flex items-center gap-2 text-sm text-slate-500"><Truck size={14} weight="fill" style={{ color: ACCENT }} /><span>{data.businessName} &copy; {new Date().getFullYear()}</span></div>
            <div className="flex items-center gap-2 text-xs text-slate-600"><BluejayLogo className="w-4 h-4" /><span>Created by <a href="https://bluejayportfolio.com" target="_blank" rel="noopener noreferrer" style={{textDecoration:"underline"}}>bluejayportfolio.com</a></span></div>
          </div>
        </div>
      </footer>

      <ClaimBanner businessName={data.businessName} accentColor={ACCENT} prospectId={data.id} />
      <div className="h-14 md:h-28" />
    </main>
  );
}
