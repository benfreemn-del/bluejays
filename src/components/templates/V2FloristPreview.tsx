"use client";

/* eslint-disable @next/next/no-img-element -- These static marketing and preview components intentionally use plain img tags to preserve existing markup and visual behavior during lint-only cleanup. */
/* eslint-disable react-hooks/purity -- Decorative particle values are intentionally randomized for static visual effects in these marketing pages and previews; this preserves existing appearance without changing business logic. */

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import {
  Flower, ShieldCheck, Clock, Phone, MapPin, CaretDown, List, X,
  CheckCircle, ArrowRight, Star, Leaf, Heart, Truck, Gift, Palette,
  CalendarCheck, Timer, Sparkle, Trophy,
} from "@phosphor-icons/react";
import type { GeneratedSiteData } from "@/lib/generator";
import BluejayLogo from "../BluejayLogo";
import { MapLink, PhoneLink } from "@/components/templates/MapLink";
import ClaimBanner from "@/components/ClaimBanner";
import { pickFromPool, pickGallery } from "@/lib/stock-image-picker";

const spring = { type: "spring" as const, stiffness: 100, damping: 20 };
const springFast = { type: "spring" as const, stiffness: 200, damping: 25 };
const BG = "#fdf9f7";
const DEFAULT_ROSE = "#e11d48";
const SAGE = "#6b8f71";
const ROSE_LIGHT = "#fb7185";

function getAccent(accentColor?: string) { const c = accentColor || DEFAULT_ROSE; return { ACCENT: c, ACCENT_GLOW: `${c}26`, SAGE, ROSE_LIGHT }; }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SERVICE_ICON_MAP: Record<string, any> = {
  wedding: Heart, bridal: Heart, bouquet: Flower, arrangement: Flower,
  delivery: Truck, event: Gift, sympathy: Flower, corporate: Gift,
  plant: Leaf, seasonal: Leaf, custom: Palette, gift: Gift,
};
function getServiceIcon(n: string) { const l = n.toLowerCase(); for (const [k, I] of Object.entries(SERVICE_ICON_MAP)) { if (l.includes(k)) return I; } return Flower; }

const STOCK_HERO_POOL = [
  "https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=1400&q=80",
  "https://images.unsplash.com/photo-1490750967868-88aa4f44baee?w=1400&q=80",
];
const STOCK_ABOUT_POOL = [
  "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=600&q=80",
  "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=600&q=80",
];
const STOCK_GALLERY = [
  "https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=600&q=80",
  "https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=600&q=80",
  "https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=600&q=80",
  "https://images.unsplash.com/photo-1469259943454-aa100abba749?w=600&q=80",
  "https://images.unsplash.com/photo-1457089328109-e5d9bd499191?w=600&q=80",
  "https://images.unsplash.com/photo-1471696035578-3d8c78d99571?w=600&q=80",
  "https://images.unsplash.com/photo-1519378058457-4c29a0a2efac?w=600&q=80",
  "https://images.unsplash.com/photo-1468327768560-75b778cbb551?w=600&q=80",
];

function FloatingPetals({ accent }: { accent: string }) {
  const particles = Array.from({ length: 22 }, (_, i) => ({ id: i, x: Math.random() * 100, delay: Math.random() * 8, duration: 6 + Math.random() * 8, size: 3 + Math.random() * 4, opacity: 0.12 + Math.random() * 0.3, isSage: Math.random() > 0.65 }));
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden hidden md:block">
      {particles.map((p) => (
        <motion.div key={p.id} className="absolute rounded-full" style={{ left: `${p.x}%`, width: p.size, height: p.size, background: p.isSage ? SAGE : accent, willChange: "transform, opacity" }}
          animate={{ y: ["-10vh", "110vh"], x: [0, Math.random() * 30 - 15], opacity: [0, p.opacity, p.opacity, 0] }}
          transition={{ y: { duration: p.duration, repeat: Infinity, delay: p.delay, ease: "linear" }, x: { duration: p.duration * 0.5, repeat: Infinity, repeatType: "mirror", delay: p.delay }, opacity: { duration: p.duration, repeat: Infinity, delay: p.delay, times: [0, 0.1, 0.9, 1] } }}
        />
      ))}
    </div>
  );
}

function PetalPattern({ opacity = 0.03, accent }: { opacity?: number; accent: string }) {
  const pid = `petalPat-${accent.replace("#", "")}`;
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }}>
      <defs>
        <pattern id={pid} width="100" height="100" patternUnits="userSpaceOnUse">
          <path d="M20 20 Q25 10 30 20 Q25 30 20 20 Z" fill={accent} opacity="0.2" />
          <path d="M70 50 Q75 40 80 50 Q75 60 70 50 Z" fill={SAGE} opacity="0.15" />
          <path d="M40 80 Q45 70 50 80 Q45 90 40 80 Z" fill={accent} opacity="0.18" />
          <circle cx="90" cy="20" r="1.5" fill={SAGE} opacity="0.2" />
          <circle cx="10" cy="60" r="1" fill={accent} opacity="0.15" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${pid})`} />
    </svg>
  );
}

function VineBackground({ opacity = 0.03, accent }: { opacity?: number; accent: string }) {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }} viewBox="0 0 1000 600" preserveAspectRatio="none">
      <path d="M0 300 Q200 250 400 300 Q600 350 800 280 Q900 260 1000 290" stroke={SAGE} strokeWidth="1.5" fill="none" />
      <path d="M0 400 Q150 380 300 420 Q500 450 700 390 Q850 370 1000 400" stroke={accent} strokeWidth="1" fill="none" />
      <circle cx="400" cy="300" r="4" fill={SAGE} opacity="0.3" />
      <circle cx="700" cy="390" r="3" fill={accent} opacity="0.25" />
    </svg>
  );
}

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-gray-200 bg-white/70 backdrop-blur-xl shadow-sm ${className}`}>{children}</div>;
}

function MagneticButton({ children, className = "", onClick, style, href }: { children: React.ReactNode; className?: string; onClick?: () => void; style?: React.CSSProperties; href?: string }) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0); const y = useMotionValue(0);
  const springX = useSpring(x, springFast); const springY = useSpring(y, springFast);
  const isTouchDevice = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
  const handleMouseMove = useCallback((e: React.MouseEvent) => { if (!ref.current || isTouchDevice) return; const rect = ref.current.getBoundingClientRect(); x.set((e.clientX - (rect.left + rect.width / 2)) * 0.25); y.set((e.clientY - (rect.top + rect.height / 2)) * 0.25); }, [x, y, isTouchDevice]);
  const handleMouseLeave = useCallback(() => { x.set(0); y.set(0); }, [x, y]);
  if (href) return <motion.a href={href} ref={ref as unknown as React.Ref<HTMLAnchorElement>} style={{ x: springX, y: springY, willChange: "transform", ...style }} onMouseMove={handleMouseMove as unknown as React.MouseEventHandler<HTMLAnchorElement>} onMouseLeave={handleMouseLeave} className={className} whileTap={{ scale: 0.97 }}>{children}</motion.a>;
  return <motion.button ref={ref} style={{ x: springX, y: springY, willChange: "transform", ...style }} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} onClick={onClick} className={className} whileTap={{ scale: 0.97 }}>{children}</motion.button>;
}

function ShimmerBorder({ children, className = "", accent }: { children: React.ReactNode; className?: string; accent: string }) {
  return (
    <div className={`relative rounded-2xl p-[1px] overflow-hidden ${className}`}>
      <motion.div className="absolute inset-0 rounded-2xl" style={{ background: `conic-gradient(from 0deg, transparent, ${accent}, transparent, ${SAGE}, transparent)`, willChange: "transform" }} animate={{ rotate: [0, 360] }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} />
      <div className="relative rounded-2xl bg-white z-10">{children}</div>
    </div>
  );
}

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

function AccordionItem({ question, answer, isOpen, onToggle }: { question: string; answer: string; isOpen: boolean; onToggle: () => void }) {
  return (
    <GlassCard className="overflow-hidden">
      <button onClick={onToggle} className="w-full flex items-center justify-between p-5 md:p-6 text-left group cursor-pointer">
        <span className="text-lg font-semibold text-[#1c1917] pr-4">{question}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={spring}><CaretDown size={20} className="text-[#6b7280] shrink-0" /></motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={spring} className="overflow-hidden">
            <p className="px-5 pb-5 md:px-6 md:pb-6 text-[#6b7280] leading-relaxed">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
}

function AnimatedSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.7, ease: "easeOut" as const }} className={className}>
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════ */

const OCCASION_TYPES = [
  { icon: Heart, name: "Weddings", desc: "Bridal bouquets, centerpieces, ceremony arches, and reception decor" },
  { icon: Flower, name: "Sympathy & Funerals", desc: "Tasteful tributes, standing sprays, casket arrangements, and wreaths" },
  { icon: Gift, name: "Birthdays", desc: "Vibrant birthday bouquets, balloon combos, and gift baskets" },
  { icon: CalendarCheck, name: "Anniversaries", desc: "Romantic roses, premium blooms, and personalized arrangements" },
  { icon: Sparkle, name: "Just Because", desc: "Brighten someone's day with a surprise delivery of fresh flowers" },
  { icon: Leaf, name: "Corporate & Events", desc: "Office arrangements, event centerpieces, and weekly subscriptions" },
];

const ARRANGEMENT_STYLES = [
  { name: "Classic Dozen Roses", price: "From $65", desc: "Long-stem roses in your choice of color" },
  { name: "Seasonal Wildflowers", price: "From $45", desc: "Fresh seasonal blooms in a rustic arrangement" },
  { name: "Luxury Designer", price: "From $95", desc: "Premium blooms arranged by our lead designer" },
  { name: "Orchid Collection", price: "From $75", desc: "Elegant phalaenopsis orchids in decorative containers" },
  { name: "Mixed Garden", price: "From $55", desc: "Colorful garden-style mix of seasonal varieties" },
  { name: "Tropical Paradise", price: "From $85", desc: "Birds of paradise, protea, and exotic blooms" },
];

const SUBSCRIPTION_TIERS = [
  { name: "Petite", price: "$39", per: "/delivery", desc: "Small bouquet of seasonal blooms every 2 weeks", features: ["Seasonal Blooms", "Bi-Weekly Delivery", "Free Vase First Order", "Skip Anytime"] },
  { name: "Garden", price: "$59", per: "/delivery", desc: "Medium arrangement with premium flowers weekly", features: ["Premium Flowers", "Weekly Delivery", "Free Vase Included", "Priority Selection"], popular: true },
  { name: "Grand", price: "$89", per: "/delivery", desc: "Large luxury arrangement with exotic and rare blooms", features: ["Rare & Exotic Blooms", "Weekly Delivery", "Luxury Vessel Included", "Personal Florist"] },
];

const SEASONAL_SPECIALS = [
  { season: "Spring", flowers: "Tulips, Peonies, Daffodils, Ranunculus", color: "#ec4899" },
  { season: "Summer", flowers: "Sunflowers, Dahlias, Zinnias, Hydrangeas", color: "#f59e0b" },
  { season: "Autumn", flowers: "Chrysanthemums, Marigolds, Asters, Berries", color: "#ea580c" },
  { season: "Winter", flowers: "Amaryllis, Holly, Evergreens, White Roses", color: "#059669" },
];

const COMPARISON_ROWS = [
  { feature: "Hand-Arranged Daily", us: true, them: "Pre-Made" },
  { feature: "Same-Day Delivery", us: true, them: "Next Day" },
  { feature: "Fresh Guarantee", us: true, them: "No" },
  { feature: "Custom Designs", us: true, them: "Limited" },
  { feature: "Local & Fresh Blooms", us: true, them: "Shipped" },
  { feature: "Personal Consultation", us: true, them: "No" },
  { feature: "Event & Wedding Services", us: true, them: "No" },
];

const occasions = ["Wedding", "Birthday", "Anniversary", "Sympathy", "Get Well", "Thank You", "Just Because", "Corporate"];

export default function V2FloristPreview({ data }: { data: GeneratedSiteData }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const { ACCENT, ACCENT_GLOW } = getAccent(data.accentColor);

  const uniquePhotos = data.photos ? [...new Set(data.photos)] : [];
  const heroImage = uniquePhotos[0] || pickFromPool(STOCK_HERO_POOL, data.businessName);
  const heroCardImage = uniquePhotos[1] || pickFromPool(STOCK_ABOUT_POOL, data.businessName, 1);
  const aboutImage = uniquePhotos[2] || pickFromPool(STOCK_ABOUT_POOL, data.businessName, 2);
  const galleryImages = data.photos?.length > 2 ? data.photos.slice(2, 8) : pickGallery(STOCK_GALLERY, data.businessName);

  const faqs = [
    { q: `What occasions does ${data.businessName} create arrangements for?`, a: `We design flowers for weddings, funerals, birthdays, anniversaries, corporate events, and everyday celebrations. Every arrangement is custom-made.` },
    { q: "Do you offer same-day delivery?", a: "Yes! Orders placed before noon are available for same-day delivery within our service area. Contact us for rush orders." },
    { q: "Can I customize my arrangement?", a: `Absolutely. ${data.businessName} specializes in custom designs. Tell us your colors, style, and budget, and we will create something beautiful.` },
    { q: "Do you offer wedding consultations?", a: "Yes, we offer complimentary wedding consultations to discuss your vision, color palette, and floral needs for your special day." },
    { q: "How do I care for my flowers?", a: "Trim stems at an angle, change water every 2 days, keep away from direct sunlight and heat sources. We include care instructions with every delivery." },
    { q: "Do you deliver to hospitals and funeral homes?", a: "Yes, we deliver to all local hospitals, funeral homes, churches, and event venues." },
  ];

  const fallbackTestimonials = [
    { name: "Rachel M.", text: "The wedding flowers were beyond my dreams. Every centerpiece was a work of art.", rating: 5 },
    { name: "David K.", text: "They handled our corporate account beautifully. Fresh flowers in the office every week.", rating: 5 },
    { name: "Lisa T.", text: "Sent sympathy flowers to a friend. They were stunning and delivered the same day.", rating: 5 },
  ];
  const testimonials = data.testimonials?.length > 0 ? data.testimonials : fallbackTestimonials;

  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden" style={{ background: BG, color: "#1c1917" }}>
      <FloatingPetals accent={ACCENT} />

      {/* 1. NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-4">
          <GlassCard className="flex items-center justify-between px-4 md:px-6 py-3">
            <div className="flex items-center gap-2"><Flower size={24} weight="fill" style={{ color: ACCENT }} /><span className="text-lg font-bold tracking-tight text-[#1c1917]">{data.businessName}</span></div>
            <div className="hidden md:flex items-center gap-8 text-sm text-[#6b7280]">
              <a href="#gallery" className="hover:text-[#1c1917] transition-colors">Gallery</a>
              <a href="#services" className="hover:text-[#1c1917] transition-colors">Services</a>
              <a href="#about" className="hover:text-[#1c1917] transition-colors">About</a>
              <a href="#contact" className="hover:text-[#1c1917] transition-colors">Contact</a>
            </div>
            <div className="flex items-center gap-3">
              <MagneticButton className="px-4 md:px-5 py-2 rounded-full text-sm font-semibold text-white transition-colors cursor-pointer" style={{ background: ACCENT } as React.CSSProperties}>Order Now</MagneticButton>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-lg text-[#1c1917] hover:bg-gray-100 transition-colors">{mobileMenuOpen ? <X size={24} /> : <List size={24} />}</button>
            </div>
          </GlassCard>
          <AnimatePresence>{mobileMenuOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="md:hidden mt-2 overflow-hidden">
              <GlassCard className="flex flex-col gap-1 px-4 py-4">
                {["Gallery", "Services", "About", "Contact"].map((l) => <a key={l} href={`#${l.toLowerCase()}`} onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-lg text-sm text-[#4b5563] hover:text-[#1c1917] hover:bg-gray-50 transition-colors">{l}</a>)}
              </GlassCard>
            </motion.div>
          )}</AnimatePresence>
        </div>
      </nav>

      {/* 2. HERO */}
      <section className="relative min-h-[100dvh] flex items-center pt-24 z-10 overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImage} alt={data.businessName} className="w-full h-full object-cover object-center" />
          <div className="absolute inset-0 bg-black/60" />
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 rounded-2xl bg-black/40 backdrop-blur-md p-6 md:p-8 border border-white/5">
            <div>
              <p className="text-sm uppercase tracking-widest mb-4" style={{ color: SAGE }}>Fresh Flowers &amp; Design</p>
              <h1 className="text-3xl md:text-6xl tracking-tighter leading-none font-bold text-white" style={{ textShadow: "0 2px 20px rgba(0,0,0,0.8)" }}>{data.tagline || `${data.businessName} — Beautiful Blooms`}</h1>
            </div>
            <p className="text-lg text-white/70 max-w-md leading-relaxed">{(() => { const t = data.about; if (t.length <= 180) return t; const dot = t.indexOf('.', 80); return dot > 0 && dot < 220 ? t.slice(0, dot + 1) : t.slice(0, 180).trim() + '...'; })()}</p>
            <div className="flex flex-wrap gap-4">
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white flex items-center gap-2 cursor-pointer" style={{ background: ACCENT } as React.CSSProperties}>Shop Flowers <ArrowRight size={18} weight="bold" /></MagneticButton>
              <MagneticButton href={`tel:${data.phone.replace(/\D/g, "")}`} className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/20 flex items-center gap-2 cursor-pointer"><Phone size={18} weight="duotone" /> <PhoneLink phone={data.phone} className="text-white" /></MagneticButton>
            </div>
            <div className="flex flex-wrap gap-3">
              {["Same-Day Delivery", `${data.googleRating || "5.0"}-Star Rated`, "Fresh Guarantee"].map((badge) => (
                <span key={badge} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border border-white/10 bg-white/5 text-white/80"><CheckCircle size={14} weight="fill" style={{ color: SAGE }} /> {badge}</span>
              ))}
            </div>
          </div>
          <div className="hidden md:block relative">
            <div className="relative rounded-2xl overflow-hidden border border-white/10">
              <img src={heroCardImage} alt={`${data.businessName} flowers`} className="w-full h-[500px] object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6"><div className="px-4 py-2 rounded-full backdrop-blur-md bg-black/40 border flex items-center gap-2" style={{ borderColor: `${ACCENT}4d` }}><Flower size={18} weight="fill" style={{ color: ACCENT }} /><span className="text-sm font-semibold text-white">Handcrafted Daily</span></div></div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. STATS */}
      <section className="relative z-10 py-16 overflow-hidden border-y" style={{ borderColor: `${ACCENT}1a` }}>
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, #f5f0ea 0%, ${BG} 100%)` }} />
        <PetalPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {data.stats.map((stat, i) => {
              const icons = [Flower, Heart, Star, Truck];
              const Icon = icons[i % icons.length];
              return (<div key={stat.label} className="text-center"><div className="flex items-center justify-center gap-2 mb-2"><Icon size={22} weight="fill" style={{ color: ACCENT }} /><span className="text-3xl md:text-4xl font-extrabold text-[#1c1917]">{stat.value}</span></div><span className="text-[#9ca3af] text-sm font-medium tracking-wide uppercase">{stat.label}</span></div>);
            })}
          </div>
        </div>
      </section>

      {/* 4. OCCASION TYPES */}
      <section id="services" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #f5f0ea 50%, ${BG} 100%)` }} />
        <PetalPattern accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Occasions" title="Flowers for Every Moment" subtitle={`${data.businessName} creates beautiful arrangements for life's most important moments.`} accent={ACCENT} />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {OCCASION_TYPES.map((occ, i) => (
              <div key={occ.name} className="group relative p-7 rounded-2xl border border-gray-200/60 hover:border-opacity-30 transition-all duration-500 overflow-hidden bg-white/60">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: `radial-gradient(circle at 50% 0%, ${ACCENT}15, transparent 70%)` }} />
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center border" style={{ background: ACCENT_GLOW, borderColor: `${ACCENT}33` }}><occ.icon size={24} weight="duotone" style={{ color: ACCENT }} /></div>
                    <span className="text-xs font-mono text-[#6b7280]">{String(i + 1).padStart(2, "0")}</span>
                  </div>
                  <h3 className="text-lg font-bold text-[#1c1917] mb-2">{occ.name}</h3>
                  <p className="text-sm text-[#6b7280] leading-relaxed">{occ.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. SERVICES */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #f5f0ea 50%, ${BG} 100%)` }} />
        <VineBackground opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Our Services" title="What We Offer" accent={ACCENT} />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.services.map((service, i) => {
              const Icon = getServiceIcon(service.name);
              return (
                <div key={service.name} className="group relative p-7 rounded-2xl border border-gray-200/60 hover:border-opacity-30 transition-all duration-500 overflow-hidden bg-white/60">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: `radial-gradient(circle at 50% 0%, ${ACCENT}15, transparent 70%)` }} />
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-5">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center border" style={{ background: ACCENT_GLOW, borderColor: `${ACCENT}33` }}><Icon size={24} weight="duotone" style={{ color: ACCENT }} /></div>
                      <span className="text-xs font-mono text-[#6b7280]">{String(i + 1).padStart(2, "0")}</span>
                    </div>
                    <h3 className="text-lg font-bold text-[#1c1917] mb-2">{service.name}</h3>
                    <p className="text-sm text-[#6b7280] leading-relaxed">{service.description || ""}</p>
                    {service.price && <p className="text-sm font-semibold mt-3" style={{ color: ACCENT }}>{service.price}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. ARRANGEMENT STYLES */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, #f5f0ea 0%, ${BG} 50%, #f5f0ea 100%)` }} />
        <PetalPattern opacity={0.025} accent={ACCENT} />
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Shop" title="Popular Arrangements" subtitle="Every bouquet is handcrafted with the freshest seasonal blooms." accent={ACCENT} />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {ARRANGEMENT_STYLES.map((arr) => (
              <GlassCard key={arr.name} className="p-6">
                <h4 className="text-base font-bold text-[#1c1917] mb-1">{arr.name}</h4>
                <p className="text-sm text-[#6b7280] mb-3">{arr.desc}</p>
                <p className="text-lg font-bold" style={{ color: ACCENT }}>{arr.price}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* 7. GALLERY */}
      <section id="gallery" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #f5f0ea 50%, ${BG} 100%)` }} />
        <VineBackground opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <AnimatedSection><SectionHeader badge="Gallery" title="Our Creations" accent={ACCENT} /></AnimatedSection>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {galleryImages.map((src, i) => (
              <div key={i} className="group relative rounded-2xl overflow-hidden border border-gray-200/60">
                <img src={src} alt={`Arrangement ${i + 1}`} className="w-full h-48 md:h-56 object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. ABOUT */}
      <section id="about" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #f5f0ea 50%, ${BG} 100%)` }} />
        <PetalPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="relative">
              <div className="rounded-2xl overflow-hidden border border-gray-200"><img src={aboutImage} alt={`${data.businessName}`} className="w-full h-[400px] object-cover" /></div>
              <div className="absolute -bottom-4 -right-4 md:bottom-6 md:-right-6"><div className="px-5 py-3 rounded-xl backdrop-blur-md border text-white font-bold text-sm shadow-lg" style={{ background: `${ACCENT}e6`, borderColor: `${ACCENT}80` }}>{data.stats[0] ? `${data.stats[0].value} ${data.stats[0].label}` : "Local Florist"}</div></div>
            </div>
            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: ACCENT, borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}>About Us</span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6 text-[#1c1917]">Artistry in Every Bloom</h2>
              <p className="text-[#6b7280] leading-relaxed mb-8">{data.about}</p>
              <div className="grid grid-cols-2 gap-4">
                {[{ icon: Flower, label: "Hand-Arranged" }, { icon: Truck, label: "Same-Day Delivery" }, { icon: Leaf, label: "Locally Sourced" }, { icon: Heart, label: "Fresh Guarantee" }].map((badge) => (
                  <GlassCard key={badge.label} className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: ACCENT_GLOW }}><badge.icon size={20} weight="duotone" style={{ color: ACCENT }} /></div>
                    <span className="text-sm font-semibold text-[#1c1917]">{badge.label}</span>
                  </GlassCard>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. SUBSCRIPTION SERVICE */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, #f5f0ea 0%, ${BG} 50%, #f5f0ea 100%)` }} />
        <PetalPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Subscriptions" title="Fresh Flowers on Repeat" subtitle="Never go without beautiful blooms. Choose your plan and enjoy regular deliveries." accent={ACCENT} />
          <div className="grid md:grid-cols-3 gap-6">
            {SUBSCRIPTION_TIERS.map((tier) => (
              <div key={tier.name} className={`relative rounded-2xl border p-8 transition-all ${tier.popular ? "border-2 shadow-xl bg-white" : "border-gray-200 bg-white/60"}`} style={tier.popular ? { borderColor: ACCENT } : undefined}>
                {tier.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold text-white" style={{ background: ACCENT }}>Most Popular</div>}
                <h3 className="text-xl font-bold text-[#1c1917] mb-1">{tier.name}</h3>
                <div className="flex items-baseline gap-1 mb-2"><span className="text-4xl font-extrabold" style={{ color: ACCENT }}>{tier.price}</span><span className="text-sm text-[#9ca3af]">{tier.per}</span></div>
                <p className="text-sm text-[#6b7280] mb-6">{tier.desc}</p>
                <ul className="space-y-3 mb-8">
                  {tier.features.map((f) => <li key={f} className="flex items-center gap-2 text-sm text-[#4b5563]"><CheckCircle size={16} weight="fill" style={{ color: ACCENT }} /> {f}</li>)}
                </ul>
                <MagneticButton className={`w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer ${tier.popular ? "text-white" : "text-[#1c1917] border border-gray-200"}`} style={tier.popular ? { background: ACCENT } as React.CSSProperties : undefined}>Subscribe <ArrowRight size={16} weight="bold" /></MagneticButton>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. SEASONAL SPECIALS */}
      <section className="relative z-10 py-16 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #f5f0ea 100%)` }} />
        <VineBackground opacity={0.02} accent={ACCENT} />
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Seasonal" title="What's Blooming Now" accent={ACCENT} />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {SEASONAL_SPECIALS.map((s) => (
              <GlassCard key={s.season} className="p-5 text-center">
                <div className="w-10 h-10 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ background: `${s.color}15`, border: `1px solid ${s.color}33` }}>
                  <Leaf size={20} weight="duotone" style={{ color: s.color }} />
                </div>
                <h4 className="text-base font-bold text-[#1c1917] mb-1">{s.season}</h4>
                <p className="text-xs text-[#6b7280]">{s.flowers}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* 11. DELIVERY ZONES */}
      <section className="relative z-10 py-20 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT}cc, ${ACCENT})` }} />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='40' height='40' fill='none'/%3E%3Cpath d='M0 0L40 40M40 0L0 40' stroke='%23000' stroke-width='0.5'/%3E%3C/svg%3E\")" }} />
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <Truck size={48} weight="fill" className="mx-auto mb-6 text-white/80" />
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-4">Same-Day Delivery Available</h2>
          <p className="text-lg text-white/80 mb-4 max-w-xl mx-auto">Order before noon for same-day delivery. We deliver to homes, offices, hospitals, churches, and event venues.</p>
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {["Free Local Delivery $50+", "Hospital Delivery", "Office Delivery", "Event Setup"].map((item) => (
              <span key={item} className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-white/15 text-white border border-white/20"><CheckCircle size={14} weight="fill" /> {item}</span>
            ))}
          </div>
          <PhoneLink phone={data.phone} className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-white text-black font-bold text-lg hover:bg-white/90 transition-colors">
            <Phone size={20} weight="fill" /> Order Now {data.phone}
          </PhoneLink>
        </div>
      </section>

      {/* 12. GOOGLE REVIEWS + TESTIMONIALS */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #f5f0ea 50%, ${BG} 100%)` }} />
        <PetalPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          {(data.googleRating || data.reviewCount) && (
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full border border-gray-200 bg-white/80 backdrop-blur-sm">
                <div className="flex gap-0.5">{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={18} weight="fill" style={{ color: ACCENT }} />)}</div>
                <span className="text-lg font-bold text-[#1c1917]">{data.googleRating || "5.0"}</span>
                {data.reviewCount && <span className="text-sm text-[#9ca3af]">({data.reviewCount} reviews)</span>}
              </div>
            </div>
          )}
          <AnimatedSection><SectionHeader badge="Reviews" title="What Our Customers Say" accent={ACCENT} /></AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <GlassCard key={i} className="p-6 h-full flex flex-col">
                <div className="text-4xl mb-3" style={{ color: `${ACCENT}33` }}>&ldquo;</div>
                <div className="flex gap-0.5 mb-4">{Array.from({ length: t.rating || 5 }).map((_, j) => <Star key={j} size={16} weight="fill" style={{ color: ACCENT }} />)}</div>
                <p className="text-[#4b5563] leading-relaxed flex-1 text-sm mb-4">{t.text}</p>
                <div className="pt-4 border-t border-gray-100 flex items-center gap-2">
                  <CheckCircle size={14} weight="fill" style={{ color: ACCENT }} />
                  <span className="text-sm font-semibold text-[#1c1917]">{t.name}</span>
                  <span className="text-xs text-[#9ca3af]">Verified</span>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* 13. COMPETITOR COMPARISON */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, #f5f0ea 0%, ${BG} 50%, #f5f0ea 100%)` }} />
        <VineBackground opacity={0.02} accent={ACCENT} />
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Why Us" title={`${data.businessName} vs. Online Florists`} accent={ACCENT} />
          <GlassCard className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-gray-200"><th className="text-left p-4 font-semibold text-[#1c1917]">Feature</th><th className="text-center p-4 font-semibold" style={{ color: ACCENT }}>{data.businessName}</th><th className="text-center p-4 font-semibold text-[#9ca3af]">Online</th></tr></thead>
                <tbody>
                  {COMPARISON_ROWS.map((row, i) => (
                    <tr key={row.feature} className={i % 2 === 0 ? "bg-white/30" : ""}>
                      <td className="p-4 text-[#4b5563] font-medium">{row.feature}</td>
                      <td className="p-4 text-center"><CheckCircle size={20} weight="fill" style={{ color: ACCENT }} className="mx-auto" /></td>
                      <td className="p-4 text-center text-[#9ca3af]">{row.them}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* 14. PROCESS */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #f5f0ea 50%, ${BG} 100%)` }} />
        <PetalPattern opacity={0.025} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <AnimatedSection>
            <SectionHeader badge="How It Works" title="From Order to Doorstep" accent={ACCENT} />
          </AnimatedSection>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: "01", title: "Choose Your Style", desc: "Browse our gallery or describe your perfect arrangement.", icon: Palette },
              { step: "02", title: "Artisan Design", desc: "Our florists handcraft your arrangement with the freshest blooms.", icon: Flower },
              { step: "03", title: "Quality Check", desc: "Every arrangement is inspected for freshness and beauty.", icon: CheckCircle },
              { step: "04", title: "Delivery", desc: "We deliver your flowers fresh to your doorstep or venue.", icon: Truck },
            ].map((step, i) => (
              <div key={step.step} className="relative">
                {i < 3 && (
                  <div className="hidden lg:block absolute top-10 left-[calc(50%+40px)] w-[calc(100%-80px)] h-px" style={{ background: `linear-gradient(to right, ${ACCENT}33, ${ACCENT}11)` }} />
                )}
                <GlassCard className="p-6 text-center">
                  <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${ACCENT}22, ${ACCENT}0a)`, border: `1px solid ${ACCENT}33` }}>
                    <step.icon size={28} weight="duotone" style={{ color: ACCENT }} />
                  </div>
                  <h3 className="text-lg font-bold text-[#1c1917] mb-2">{step.title}</h3>
                  <p className="text-sm text-[#6b7280] leading-relaxed">{step.desc}</p>
                </GlassCard>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 14b. WHAT WE ARRANGE */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, #f5f0ea 0%, ${BG} 50%, #f5f0ea 100%)` }} />
        <VineBackground opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Specialties" title="What We Create" accent={ACCENT} />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Flower, label: "Bouquets" },
              { icon: Heart, label: "Centerpieces" },
              { icon: Gift, label: "Gift Baskets" },
              { icon: Leaf, label: "Plants & Succulents" },
              { icon: Sparkle, label: "Corsages & Bouts" },
              { icon: Flower, label: "Wreaths & Sprays" },
              { icon: CalendarCheck, label: "Event Florals" },
              { icon: Heart, label: "Bridal Packages" },
            ].map((item) => (
              <GlassCard key={item.label} className="p-5 text-center">
                <div className="w-10 h-10 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ background: `${ACCENT}15`, border: `1px solid ${ACCENT}22` }}>
                  <item.icon size={20} weight="duotone" style={{ color: ACCENT }} />
                </div>
                <span className="text-sm font-semibold text-[#1c1917]">{item.label}</span>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* 15. SERVICE AREAS */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #f5f0ea 50%, ${BG} 100%)` }} />
        <PetalPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Delivery Area" title="Where We Deliver" accent={ACCENT} />
          <div className="text-center">
            <GlassCard className="p-8 inline-block">
              <div className="flex items-center gap-3 text-lg">
                <MapPin size={24} weight="duotone" style={{ color: ACCENT }} />
                <MapLink address={data.address} className="text-[#1c1917] font-semibold" />
              </div>
              <p className="text-[#6b7280] text-sm mt-2">&amp; Surrounding Areas</p>
              <div className="flex flex-wrap justify-center gap-3 mt-5">
                {["Homes", "Hospitals", "Churches", "Funeral Homes", "Office Buildings", "Event Venues"].map((loc) => (
                  <span key={loc} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border" style={{ color: ACCENT, borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}>
                    <Truck size={12} weight="fill" /> {loc}
                  </span>
                ))}
              </div>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* 16. HOURS */}
      {data.hours && (
        <section className="relative z-10 py-24 md:py-32 overflow-hidden">
          <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #f5f0ea 50%, ${BG} 100%)` }} />
          <VineBackground opacity={0.02} accent={ACCENT} />
          <div className="max-w-3xl mx-auto px-6 relative z-10">
            <SectionHeader badge="Shop Hours" title="When We're Open" accent={ACCENT} />
            <div className="text-center">
              <ShimmerBorder accent={ACCENT}>
                <div className="p-8">
                  <Clock size={32} weight="duotone" style={{ color: ACCENT }} className="mx-auto mb-4" />
                  <p className="text-[#4b5563] leading-relaxed whitespace-pre-line text-lg">{data.hours}</p>
                  <p className="text-sm mt-4 font-semibold" style={{ color: ACCENT }}>
                    Walk-Ins Welcome &bull; Phone Orders Accepted
                  </p>
                </div>
              </ShimmerBorder>
            </div>
          </div>
        </section>
      )}

      {/* 17. FAQ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #f5f0ea 50%, ${BG} 100%)` }} />
        <PetalPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <SectionHeader badge="FAQ" title="Common Questions" accent={ACCENT} />
          <div className="space-y-3">{faqs.map((faq, i) => <AccordionItem key={i} question={faq.q} answer={faq.a} isOpen={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} />)}</div>
        </div>
      </section>

      {/* 18. CONTACT */}
      <section id="contact" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #f5f0ea 50%, ${BG} 100%)` }} />
        <VineBackground opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: ACCENT, borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}>Contact Us</span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6 text-[#1c1917]">Order Beautiful Flowers</h2>
              <p className="text-[#6b7280] leading-relaxed mb-8">Ready to brighten someone&apos;s day? Contact {data.businessName} to order a custom arrangement or schedule a consultation.</p>
              <div className="space-y-5">
                <div className="flex items-start gap-4"><div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: ACCENT_GLOW }}><MapPin size={20} weight="duotone" style={{ color: ACCENT }} /></div><div><p className="text-sm font-semibold text-[#1c1917]">Shop</p><MapLink address={data.address} className="text-sm text-[#6b7280]" /></div></div>
                <div className="flex items-start gap-4"><div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: ACCENT_GLOW }}><Phone size={20} weight="duotone" style={{ color: ACCENT }} /></div><div><p className="text-sm font-semibold text-[#1c1917]">Phone</p><PhoneLink phone={data.phone} className="text-sm text-[#6b7280]" /></div></div>
                {data.hours && <div className="flex items-start gap-4"><div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: ACCENT_GLOW }}><Clock size={20} weight="duotone" style={{ color: ACCENT }} /></div><div><p className="text-sm font-semibold text-[#1c1917]">Hours</p><p className="text-sm text-[#6b7280] whitespace-pre-line">{data.hours}</p></div></div>}
              </div>
            </div>
            <GlassCard className="p-8">
              <h3 className="text-xl font-semibold text-[#1c1917] mb-6">Order Flowers</h3>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><div><label className="block text-sm text-[#6b7280] mb-1.5">Your Name</label><input type="text" className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-[#1c1917] placeholder-gray-400 focus:outline-none text-sm" placeholder="Jane Doe" /></div><div><label className="block text-sm text-[#6b7280] mb-1.5">Phone</label><input type="tel" className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-[#1c1917] placeholder-gray-400 focus:outline-none text-sm" placeholder="(555) 123-4567" /></div></div>
                <div><label className="block text-sm text-[#6b7280] mb-1.5">Occasion</label><select className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-[#1c1917] focus:outline-none text-sm"><option value="" className="bg-white">Select occasion</option>{occasions.map((o) => <option key={o} value={o.toLowerCase()} className="bg-white">{o}</option>)}</select></div>
                <div><label className="block text-sm text-[#6b7280] mb-1.5">Delivery Date</label><input type="text" className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-[#1c1917] placeholder-gray-400 focus:outline-none text-sm" placeholder="MM/DD/YYYY" /></div>
                <div><label className="block text-sm text-[#6b7280] mb-1.5">Message</label><textarea rows={4} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-[#1c1917] placeholder-gray-400 focus:outline-none text-sm resize-none" placeholder="Describe what you're looking for..." /></div>
                <MagneticButton className="w-full py-4 rounded-xl text-base font-semibold text-white flex items-center justify-center gap-2 cursor-pointer" style={{ background: ACCENT } as React.CSSProperties}>Send Request <ArrowRight size={18} weight="bold" /></MagneticButton>
              </form>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* 19. VIDEO PLACEHOLDER */}
      <section className="relative z-10 py-20 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #f5f0ea 100%)` }} />
        <PetalPattern opacity={0.015} accent={ACCENT} />
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <div className="text-center mb-8">
            <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-3 px-4 py-1.5 rounded-full border" style={{ color: ACCENT, borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}>Watch</span>
            <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight text-[#1c1917]">See Our Artistry</h2>
          </div>
          <div className="relative rounded-2xl overflow-hidden border border-gray-200 aspect-video flex items-center justify-center" style={{ background: "rgba(0,0,0,0.05)" }}>
            <div className="w-20 h-20 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center border border-gray-200 cursor-pointer hover:bg-white transition-colors shadow-lg">
              <div className="w-0 h-0 border-l-[18px] border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent ml-1.5" style={{ borderLeftColor: ACCENT }} />
            </div>
            <p className="absolute bottom-6 text-[#9ca3af] text-sm font-medium">Watch Our Florists at Work</p>
          </div>
        </div>
      </section>

      {/* 20. OCCASION QUIZ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, #f5f0ea 0%, ${BG} 50%, #f5f0ea 100%)` }} />
        <VineBackground opacity={0.02} accent={ACCENT} />
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Get Started" title="What's the Occasion?" subtitle="Let us help you find the perfect arrangement." accent={ACCENT} />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "Romance & Love", color: "#e11d48", rec: "Red roses, premium bouquets, and luxury arrangements" },
              { label: "Celebration & Joy", color: "#f59e0b", rec: "Bright, vibrant mixes perfect for birthdays and milestones" },
              { label: "Comfort & Sympathy", color: SAGE, rec: "Elegant, tasteful tributes and peaceful arrangements" },
            ].map((opt) => (
              <GlassCard key={opt.label} className="p-6 text-center hover:shadow-md transition-shadow cursor-pointer">
                <div className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: `${opt.color}15`, border: `1px solid ${opt.color}33` }}>
                  <Flower size={22} weight="duotone" style={{ color: opt.color }} />
                </div>
                <h4 className="text-sm font-bold text-[#1c1917] mb-2">{opt.label}</h4>
                <p className="text-xs text-[#6b7280] leading-relaxed">{opt.rec}</p>
              </GlassCard>
            ))}
          </div>
          <div className="text-center mt-8">
            <PhoneLink phone={data.phone} className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-white font-semibold" style={{ background: ACCENT }}>
              <Phone size={20} weight="fill" /> Call to Order
            </PhoneLink>
          </div>
        </div>
      </section>

      {/* 21. CERTIFICATIONS */}
      <section className="relative z-10 py-16 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #f5f0ea 100%)` }} />
        <PetalPattern opacity={0.015} accent={ACCENT} />
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <div className="text-center mb-10">
            <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-3 px-4 py-1.5 rounded-full border" style={{ color: ACCENT, borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}>Trust</span>
            <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight text-[#1c1917]">Why Customers Choose Us</h2>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {["Certified Master Florist", "Locally Owned", "Eco-Friendly Packaging", "Satisfaction Guaranteed", "FTD Member", "Same-Day Available"].map((badge) => (
              <div key={badge} className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-gray-200 bg-white/60 backdrop-blur-sm text-sm font-medium text-[#1c1917]">
                <CheckCircle size={18} weight="duotone" style={{ color: ACCENT }} />
                {badge}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 22. URGENCY */}
      <section className="relative z-10 py-16 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, #f5f0ea 0%, ${BG} 100%)` }} />
        <VineBackground opacity={0.015} accent={ACCENT} />
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <GlassCard className="p-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="relative">
                <div className="w-3 h-3 rounded-full" style={{ background: ACCENT }} />
                <div className="absolute inset-0 w-3 h-3 rounded-full animate-ping" style={{ background: ACCENT, opacity: 0.4 }} />
              </div>
              <span className="text-sm font-bold uppercase tracking-wider" style={{ color: ACCENT }}>Order Before Noon for Same-Day</span>
            </div>
            <h3 className="text-2xl font-bold text-[#1c1917] mb-2">Need Flowers Today?</h3>
            <p className="text-[#6b7280] mb-6">We handcraft every arrangement with care. Order early for the freshest selection and same-day delivery.</p>
            <PhoneLink phone={data.phone} className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-white font-semibold" style={{ background: ACCENT }}>
              <Phone size={20} weight="fill" /> Order Now
            </PhoneLink>
          </GlassCard>
        </div>
      </section>

      {/* 23. GUARANTEE */}
      <section className="relative z-10 py-16 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #f5f0ea 100%)` }} />
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <ShimmerBorder accent={ACCENT}><div className="p-8 md:p-12">
            <Flower size={48} weight="fill" style={{ color: ACCENT }} className="mx-auto mb-4" />
            <h2 className="text-2xl md:text-4xl font-extrabold text-[#1c1917] mb-4">Our Freshness Guarantee</h2>
            <p className="text-[#6b7280] leading-relaxed max-w-2xl mx-auto text-lg">Every arrangement from {data.businessName} is guaranteed fresh for 7 days. If you are not completely satisfied, we will replace it free of charge.</p>
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              {["7-Day Fresh Guarantee", "Free Replacement", "Same-Day Delivery", "Handcrafted Daily"].map((item) => (
                <span key={item} className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border" style={{ color: ACCENT, borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}><CheckCircle size={16} weight="fill" /> {item}</span>
              ))}
            </div>
          </div></ShimmerBorder>
        </div>
      </section>

      {/* 20. FOOTER */}
      <footer className="relative z-10 border-t border-gray-100 py-10 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #f5f3ef 100%)` }} />
        <PetalPattern opacity={0.015} accent={ACCENT} />
        <div className="mx-auto max-w-6xl px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div><div className="flex items-center gap-2 mb-3"><Flower size={22} weight="fill" style={{ color: ACCENT }} /><span className="text-lg font-bold text-[#1c1917]">{data.businessName}</span></div><p className="text-sm text-[#9ca3af] leading-relaxed">{data.about.length > 120 ? data.about.slice(0, 120).trim() + "..." : data.about}</p></div>
            <div><h4 className="text-sm font-semibold text-[#1c1917] mb-3">Quick Links</h4><div className="space-y-2">{["Gallery","Services","About","Contact"].map((link) => <a key={link} href={`#${link.toLowerCase()}`} className="block text-sm text-[#9ca3af] hover:text-[#1c1917] transition-colors">{link}</a>)}</div></div>
            <div><h4 className="text-sm font-semibold text-[#1c1917] mb-3">Contact</h4><div className="space-y-2 text-sm text-[#9ca3af]"><p><PhoneLink phone={data.phone} /></p><p><MapLink address={data.address} /></p>{data.socialLinks && Object.entries(data.socialLinks).map(([platform, url]) => <a key={platform} href={url} target="_blank" rel="noopener noreferrer" className="block hover:text-[#1c1917] transition-colors capitalize">{platform}</a>)}</div></div>
          </div>
          <div className="border-t border-gray-100 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-[#9ca3af]"><Flower size={14} weight="fill" style={{ color: ACCENT }} /><span>{data.businessName} &copy; {new Date().getFullYear()}</span></div>
            <div className="flex items-center gap-2 text-xs text-[#6b7280]"><BluejayLogo className="w-4 h-4" /><span>Created by <a href="https://bluejayportfolio.com" target="_blank" rel="noopener noreferrer" style={{textDecoration:"underline"}}>bluejayportfolio.com</a></span></div>
          </div>
        </div>
      </footer>

      <ClaimBanner businessName={data.businessName} accentColor={ACCENT} prospectId={data.id} />
      <div className="h-14 md:h-28" />
    </main>
  );
}
