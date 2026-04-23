"use client";

/* eslint-disable @next/next/no-img-element -- These static marketing and preview components intentionally use plain img tags to preserve existing markup and visual behavior during lint-only cleanup. */
/* eslint-disable react-hooks/purity -- Decorative particle values are intentionally randomized for static visual effects in these marketing pages and previews; this preserves existing appearance without changing business logic. */

import { useState, useRef, useCallback } from "react";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import { PaintBrush, Palette, Drop, Clock, Phone, MapPin, CaretDown, List, X, Star, ArrowRight, CheckCircle, ShieldCheck, HouseLine, Buildings, Swatches, Eye, Wall } from "@phosphor-icons/react";
import type { GeneratedSiteData } from "@/lib/generator";
import BluejayLogo from "../BluejayLogo";
import { MapLink, PhoneLink } from "@/components/templates/MapLink";
import ClaimBanner from "@/components/ClaimBanner";
import { pickFromPool, pickGallery } from "@/lib/stock-image-picker";

const spring = { type: "spring" as const, stiffness: 100, damping: 20 };
const springFast = { type: "spring" as const, stiffness: 200, damping: 25 };
const CHARCOAL = "#1a1a1a";
const DEFAULT_PURPLE = "#8b5cf6";
const PURPLE_LIGHT = "#a78bfa";
const PINK_ACCENT = "#ec4899";

function getAccent(accentColor?: string) {
  const c = accentColor || DEFAULT_PURPLE;
  return { ACCENT: c, ACCENT_GLOW: `${c}26`, ACCENT_LIGHT: PURPLE_LIGHT, PINK: PINK_ACCENT };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SERVICE_ICON_MAP: Record<string, any> = {
  interior: HouseLine, exterior: Buildings, residential: HouseLine, commercial: Buildings,
  cabinet: Wall, stain: Drop, color: Swatches, consult: Eye, wallpaper: Wall,
  trim: PaintBrush, deck: Wall, pressure: Drop, power: Drop, texture: Wall,
};
function getServiceIcon(serviceName: string) { const lower = serviceName.toLowerCase(); for (const [key, Icon] of Object.entries(SERVICE_ICON_MAP)) { if (lower.includes(key)) return Icon; } return PaintBrush; }

const STOCK_HERO_POOL = [
  "https://images.unsplash.com/photo-1562259929-b4e1fd3aef09?w=1400&q=80",
  "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=1400&q=80",
];
const STOCK_ABOUT_POOL = [
  "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&q=80",
  "https://images.unsplash.com/photo-1562259929-b4e1fd3aef09?w=600&q=80",
];
const STOCK_GALLERY = [
  "https://images.unsplash.com/photo-1595814433015-e6f5ce69614e?w=600&q=80",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80",
  "https://images.unsplash.com/photo-1525909002-1b05e0c869d8?w=600&q=80",
  "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=600&q=80",
  "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=600&q=80",
  "https://images.unsplash.com/photo-1560448075-bb485b067938?w=600&q=80",
  "https://images.unsplash.com/photo-1562259929-b4e1fd3aef09?w=600&q=80",
  "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=600&q=80",
];

/* ─── Decorative helpers ─── */

function FloatingParticles({ accent }: { accent: string }) {
  const particles = Array.from({ length: 20 }, (_, i) => ({ id: i, x: Math.random() * 100, delay: Math.random() * 8, duration: 5 + Math.random() * 7, size: 2 + Math.random() * 4, opacity: 0.12 + Math.random() * 0.3, isPink: Math.random() > 0.6 }));
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden hidden md:block">
      {particles.map((p) => (
        <motion.div key={p.id} className="absolute rounded-full" style={{ left: `${p.x}%`, width: p.size, height: p.size, background: p.isPink ? PINK_ACCENT : accent, willChange: "transform, opacity" }} animate={{ y: ["-10vh", "110vh"], opacity: [0, p.opacity, p.opacity, 0] }} transition={{ y: { duration: p.duration, repeat: Infinity, delay: p.delay, ease: "linear" }, opacity: { duration: p.duration, repeat: Infinity, delay: p.delay, times: [0, 0.1, 0.9, 1] } }} />
      ))}
    </div>
  );
}

function SplatterPattern({ opacity = 0.03, accent }: { opacity?: number; accent: string }) {
  const patternId = `splatterV2Prev-${accent.replace("#", "")}`;
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }}>
      <defs>
        <pattern id={patternId} width="120" height="120" patternUnits="userSpaceOnUse">
          <circle cx="30" cy="30" r="8" fill={accent} opacity="0.2" />
          <circle cx="35" cy="25" r="3" fill={accent} opacity="0.3" />
          <circle cx="25" cy="35" r="4" fill={PINK_ACCENT} opacity="0.15" />
          <circle cx="90" cy="80" r="6" fill={accent} opacity="0.15" />
          <circle cx="95" cy="75" r="2" fill={PINK_ACCENT} opacity="0.2" />
          <circle cx="60" cy="60" r="10" fill={accent} opacity="0.08" />
          <circle cx="55" cy="55" r="2" fill={accent} opacity="0.25" />
          <circle cx="100" cy="20" r="5" fill={PINK_ACCENT} opacity="0.1" />
          <circle cx="15" cy="95" r="7" fill={accent} opacity="0.12" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  );
}

function PaintDripBackground({ opacity = 0.03, accent }: { opacity?: number; accent: string }) {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }} viewBox="0 0 1000 600" preserveAspectRatio="none">
      <path d="M100 0 Q105 80 95 150 Q100 200 100 250 Q95 270 100 280 C100 290 95 295 100 300" fill="none" stroke={accent} strokeWidth="3" strokeLinecap="round" />
      <path d="M300 0 Q295 120 305 200 Q300 280 300 350" fill="none" stroke={PINK_ACCENT} strokeWidth="2" strokeLinecap="round" />
      <path d="M700 0 Q705 100 695 180 Q700 240 700 320 Q695 340 700 360" fill="none" stroke={accent} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M900 0 Q895 60 905 120 Q900 180 900 220" fill="none" stroke={PINK_ACCENT} strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="100" cy="300" r="8" fill={accent} opacity="0.4" />
      <circle cx="300" cy="350" r="6" fill={PINK_ACCENT} opacity="0.3" />
      <circle cx="700" cy="360" r="7" fill={accent} opacity="0.35" />
    </svg>
  );
}

/* ─── Shared UI components ─── */

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-white/15 bg-white/[0.08] backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] ${className}`}>{children}</div>;
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
      <motion.div className="absolute inset-0 rounded-2xl" style={{ background: `conic-gradient(from 0deg, transparent, ${accent}, transparent, ${PINK_ACCENT}, transparent)`, willChange: "transform" }} animate={{ rotate: [0, 360] }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} />
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

function AnimatedSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.7, ease: "easeOut" as const }} className={className}>
      {children}
    </motion.div>
  );
}

/* ─── Category-specific constants ─── */

const PAINT_BRAND_BADGES = ["Sherwin-Williams", "Benjamin Moore", "PPG", "Behr", "Farrow & Ball", "Dunn-Edwards"];

const PREP_STEPS = [
  { step: "01", title: "Surface Inspection", desc: "We examine every surface for cracks, peeling, mildew, and damage that needs repair before painting." },
  { step: "02", title: "Prep & Protect", desc: "Furniture moved, floors covered, trim taped, surfaces sanded, and caulk applied where needed." },
  { step: "03", title: "Prime & Paint", desc: "Premium primer applied, then two coats of your chosen color with precision brushwork and rolling." },
  { step: "04", title: "Final Walkthrough", desc: "We inspect every detail with you, touch up any spots, and leave your space spotless." },
];

const COMPARISON_ROWS = [
  { feature: "Licensed & Insured", us: true, them: "Sometimes" },
  { feature: "Free Color Consultation", us: true, them: "Rarely" },
  { feature: "Premium Paint Brands", us: true, them: "Varies" },
  { feature: "Written Warranty", us: true, them: "No" },
  { feature: "Detailed Prep Work", us: true, them: "Shortcuts" },
  { feature: "Furniture Protection", us: true, them: "Sometimes" },
  { feature: "Final Walkthrough", us: true, them: "No" },
];

const WARRANTY_ITEMS = [
  { title: "Interior Warranty", desc: "5-year warranty on all interior painting work including walls, ceilings, and trim.", years: "5 Years" },
  { title: "Exterior Warranty", desc: "7-year warranty on exterior painting covering peeling, blistering, and fading.", years: "7 Years" },
  { title: "Cabinet Warranty", desc: "3-year warranty on all cabinet refinishing and painting projects.", years: "3 Years" },
];

const PRICING_TIERS = [
  { name: "Single Room", price: "$299+", features: ["Walls & ceiling", "Basic prep", "2 coats premium paint", "Same-day completion"], popular: false },
  { name: "Full Interior", price: "$1,999+", features: ["All rooms painted", "Full surface prep", "Premium paint included", "Color consultation", "Furniture protection"], popular: true },
  { name: "Exterior", price: "$2,999+", features: ["Full exterior coverage", "Power wash included", "Wood repair & caulk", "Premium weather paint", "7-year warranty"], popular: false },
];

const QUIZ_OPTIONS = [
  { label: "Refresh a Room", icon: HouseLine, color: "#8b5cf6", recommendation: "Our single-room package starts at $299 with free color consultation." },
  { label: "Whole House Interior", icon: Buildings, color: "#ec4899", recommendation: "Full interior packages include all prep, paint, and cleanup. Free estimates!" },
  { label: "Exterior Facelift", icon: Wall, color: "#f59e0b", recommendation: "Our exterior team handles everything from power washing to final coat." },
];

/* ─────────────────── MAIN COMPONENT ─────────────────── */

export default function V2PaintingPreview({ data }: { data: GeneratedSiteData }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [serviceFilter, setServiceFilter] = useState<"all" | "interior" | "exterior">("all");
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const { ACCENT, ACCENT_GLOW } = getAccent(data.accentColor);
  const uniquePhotos = data.photos ? [...new Set(data.photos)] : [];

  const heroImage = uniquePhotos[0] || pickFromPool(STOCK_HERO_POOL, data.businessName);
  const heroCardImage = uniquePhotos[1] || pickFromPool(STOCK_ABOUT_POOL, data.businessName, 1);
  const aboutImage = uniquePhotos[2] || pickFromPool(STOCK_ABOUT_POOL, data.businessName, 2);
  const galleryImages = data.photos?.length > 2 ? data.photos.slice(2, 8) : pickGallery(STOCK_GALLERY, data.businessName);
  const phoneDigits = data.phone.replace(/\D/g, "");

  /* Service filtering for interior/exterior toggle */
  function isExterior(name: string) { const l = name.toLowerCase(); return l.includes("exterior") || l.includes("deck") || l.includes("fence") || l.includes("power") || l.includes("pressure") || l.includes("siding"); }
  function isInterior(name: string) { const l = name.toLowerCase(); return l.includes("interior") || l.includes("cabinet") || l.includes("wallpaper") || l.includes("trim") || l.includes("ceiling") || l.includes("room"); }

  const filteredServices = serviceFilter === "all" ? data.services : data.services.filter(s => serviceFilter === "interior" ? isInterior(s.name) || (!isExterior(s.name) && !isInterior(s.name)) : isExterior(s.name) || (!isExterior(s.name) && !isInterior(s.name)));

  const faqs = [
    { q: `What painting services does ${data.businessName} offer?`, a: `We offer a full range including ${data.services.slice(0, 3).map(s => s.name).join(", ")}, and more. Whether residential or commercial, we deliver flawless results.` },
    { q: "Do you provide color consultations?", a: "Yes! Our team offers free color consultations to help you choose the perfect palette for your space. We bring sample swatches and can create test patches on your walls." },
    { q: "How long does a typical painting project take?", a: "Most residential rooms take 1-2 days. Full house interiors typically take 3-5 days. Exteriors vary by size but usually 3-7 days. We provide a timeline with every estimate." },
    { q: "Are your painters licensed and insured?", a: `Absolutely. ${data.businessName} is fully licensed, bonded, and insured. Our team consists of experienced professionals who take pride in every project.` },
    { q: "What brands of paint do you use?", a: "We use premium brands including Sherwin-Williams, Benjamin Moore, and PPG. We can also accommodate specific brand requests. Premium paint means better coverage and longer-lasting results." },
    { q: "Do you move furniture?", a: "Yes, we carefully move and cover all furniture and fixtures before painting. Everything is returned to its original position when we finish." },
    { q: "Can you paint over wallpaper?", a: "We recommend removing wallpaper for the best results. Our team handles wallpaper removal, wall repair, and priming before applying fresh paint." },
    { q: "Do you offer exterior pressure washing?", a: "Yes, exterior projects include thorough pressure washing and surface preparation. Clean surfaces are essential for paint adhesion and longevity." },
  ];

  const fallbackTestimonials = [
    { name: "Laura T.", text: "They painted our entire exterior in two days. Clean lines, no mess, and the color is perfect. Neighbors keep complimenting it.", rating: 5 },
    { name: "Dennis K.", text: "Interior painting that looks like a professional magazine shoot. Meticulous attention to detail on every wall and trim piece.", rating: 5 },
    { name: "Sharon M.", text: "Third time using them and they never disappoint. Fair prices, beautiful lasting results, and the crew is always respectful.", rating: 5 },
  ];
  const testimonials = data.testimonials?.length > 0 ? data.testimonials : fallbackTestimonials;

  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden" style={{ background: CHARCOAL, color: "#f1f5f9" }}>
      <FloatingParticles accent={ACCENT} />

      {/* ─── 1. NAV ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-4">
          <GlassCard className="flex items-center justify-between px-4 md:px-6 py-3">
            <div className="flex items-center gap-2">
              <PaintBrush size={24} weight="fill" style={{ color: ACCENT }} />
              <span className="text-lg font-bold tracking-tight text-white">{data.businessName}</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
              <a href="#services" className="hover:text-white transition-colors">Services</a>
              <a href="#about" className="hover:text-white transition-colors">About</a>
              <a href="#gallery" className="hover:text-white transition-colors">Gallery</a>
              <a href="#contact" className="hover:text-white transition-colors">Contact</a>
            </div>
            <div className="flex items-center gap-3">
              <MagneticButton className="px-4 md:px-5 py-2 rounded-full text-sm font-semibold text-white transition-colors cursor-pointer" style={{ background: ACCENT } as React.CSSProperties}>Free Estimate</MagneticButton>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors">{mobileMenuOpen ? <X size={24} /> : <List size={24} />}</button>
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

      {/* ─── 2. HERO ─── */}
      <section className="relative min-h-[100dvh] flex items-center pt-24 z-10 overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImage} alt={data.businessName} className="w-full h-full object-cover object-center" />
          <div className="absolute inset-0 bg-black/70" />
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          <div className="space-y-8 rounded-2xl bg-black/50 backdrop-blur-md p-6 md:p-8 border border-white/8">
            <div>
              <p className="text-sm uppercase tracking-widest mb-4" style={{ color: ACCENT }}>Professional Painting Services</p>
              <h1 className="text-3xl md:text-6xl tracking-tighter leading-none font-bold text-white" style={{ textShadow: "0 2px 20px rgba(0,0,0,0.8)" }}>{data.tagline}</h1>
            </div>
            <p className="text-lg text-white/80 max-w-md leading-relaxed" style={{ textShadow: "0 1px 8px rgba(0,0,0,0.6)" }}>{(() => { const t = data.about; if (t.length <= 180) return t; const dot = t.indexOf(".", 80); return dot > 0 && dot < 220 ? t.slice(0, dot + 1) : t.slice(0, 180).trim() + "..."; })()}</p>
            <div className="flex flex-wrap gap-4">
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white flex items-center gap-2 cursor-pointer" style={{ background: ACCENT } as React.CSSProperties}>Get Free Estimate <ArrowRight size={18} weight="bold" /></MagneticButton>
              <MagneticButton href={`tel:${phoneDigits}`} className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/15 flex items-center gap-2 cursor-pointer"><Phone size={18} weight="duotone" /> <PhoneLink phone={data.phone} /></MagneticButton>
            </div>
            <div className="flex flex-wrap gap-3">
              {["Licensed & Insured", "Free Color Consult", "Premium Paints"].map((badge) => (
                <span key={badge} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border backdrop-blur-sm" style={{ color: ACCENT, borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}>
                  <CheckCircle size={14} weight="fill" /> {badge}
                </span>
              ))}
            </div>
          </div>
          <div className="hidden md:block relative">
            <div className="relative rounded-2xl overflow-hidden border border-white/15">
              <img src={heroCardImage} alt={`${data.businessName} painting work`} className="w-full h-[500px] object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 flex items-center gap-3">
                <div className="px-4 py-2 rounded-full backdrop-blur-md bg-black/50 border flex items-center gap-2" style={{ borderColor: `${ACCENT}4d` }}>
                  <ShieldCheck size={18} weight="fill" style={{ color: ACCENT }} />
                  <span className="text-sm font-semibold text-white">Licensed &amp; Insured</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 3. STATS ─── */}
      <section className="relative z-10 py-16 overflow-hidden border-y" style={{ borderColor: `${ACCENT}1a` }}>
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #140f1a 0%, #1a1a1a 100%)" }} />
        <SplatterPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {data.stats.map((stat, i) => {
              const statIcons = [PaintBrush, HouseLine, Star, Clock];
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

      {/* ─── 4. SERVICES (with interior/exterior toggle) ─── */}
      <section id="services" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #140f1a 50%, #1a1a1a 100%)" }} />
        <SplatterPattern accent={ACCENT} />
        <PaintDripBackground opacity={0.025} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Our Services" title="Professional Painting Solutions" subtitle={`${data.businessName} delivers flawless finishes for homes and businesses alike.`} accent={ACCENT} />
          {/* Interior/Exterior Toggle */}
          <div className="flex justify-center gap-2 mb-12">
            {([["all", "All Services"], ["interior", "Interior"], ["exterior", "Exterior"]] as const).map(([key, label]) => (
              <button key={key} onClick={() => setServiceFilter(key)} className="px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 cursor-pointer" style={{ background: serviceFilter === key ? ACCENT : "rgba(255,255,255,0.05)", color: serviceFilter === key ? "#fff" : "#94a3b8", border: `1px solid ${serviceFilter === key ? ACCENT : "rgba(255,255,255,0.1)"}` }}>
                {key === "interior" && <HouseLine size={16} weight="bold" className="inline mr-1.5 -mt-0.5" />}
                {key === "exterior" && <Buildings size={16} weight="bold" className="inline mr-1.5 -mt-0.5" />}
                {label}
              </button>
            ))}
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service, i) => {
              const Icon = getServiceIcon(service.name);
              return (
                <div key={service.name} className="group relative p-7 rounded-2xl border border-white/[0.10] hover:border-opacity-30 transition-all duration-500 overflow-hidden bg-white/[0.07]">
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

      {/* ─── 5. COLOR CONSULTATION ─── */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #12091a 50%, #1a1a1a 100%)" }} />
        <PaintDripBackground opacity={0.02} accent={ACCENT} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[20%] left-[10%] w-[500px] h-[500px] rounded-full blur-[180px]" style={{ background: `${ACCENT}06` }} /></div>
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <AnimatedSection><SectionHeader badge="Free Service" title="Color Consultation" subtitle="Not sure which colors to choose? Our expert colorists bring the showroom to you." accent={ACCENT} /></AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[{ icon: Swatches, title: "Swatch Samples", desc: "We bring hundreds of real paint swatches to your home so you can see colors in your actual lighting." },
              { icon: Eye, title: "Digital Visualization", desc: "See how your chosen colors will look on your walls before a single drop of paint is applied." },
              { icon: Palette, title: "Expert Guidance", desc: "Our color experts help you build cohesive palettes that complement your furniture and decor." }].map((item) => (
              <GlassCard key={item.title} className="p-7">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-5 border" style={{ background: ACCENT_GLOW, borderColor: `${ACCENT}33` }}>
                  <item.icon size={28} weight="duotone" style={{ color: ACCENT }} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 6. ABOUT ─── */}
      <section id="about" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #12091a 50%, #1a1a1a 100%)" }} />
        <PaintDripBackground opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="relative">
              <div className="rounded-2xl overflow-hidden border border-white/15"><img src={aboutImage} alt={`${data.businessName} team`} className="w-full h-[400px] object-cover" /></div>
              <div className="absolute -bottom-4 -right-4 md:bottom-6 md:-right-6">
                <div className="px-5 py-3 rounded-xl backdrop-blur-md border text-white font-bold text-sm shadow-lg" style={{ background: `${ACCENT}e6`, borderColor: `${ACCENT}80` }}>{data.stats[0] ? `${data.stats[0].value} ${data.stats[0].label}` : "Color Experts"}</div>
              </div>
            </div>
            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: ACCENT, borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}>Our Story</span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6 text-white">Transforming Spaces with Color</h2>
              <p className="text-slate-400 leading-relaxed mb-8">{data.about}</p>
              <div className="grid grid-cols-2 gap-4">
                {[{ icon: ShieldCheck, label: "Licensed & Insured" }, { icon: Palette, label: "Color Experts" }, { icon: Star, label: "5-Star Rated" }, { icon: CheckCircle, label: "Satisfaction Guaranteed" }].map((badge) => (
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

      {/* ─── 7. PREP PROCESS ─── */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #140f1a 50%, #1a1a1a 100%)" }} />
        <SplatterPattern opacity={0.025} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <AnimatedSection><SectionHeader badge="Our Process" title="Meticulous Prep, Perfect Results" accent={ACCENT} /></AnimatedSection>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PREP_STEPS.map((step, i) => (
              <div key={step.step} className="relative">
                {i < PREP_STEPS.length - 1 && <div className="hidden lg:block absolute top-10 left-[calc(50%+40px)] w-[calc(100%-80px)] h-px" style={{ background: `linear-gradient(to right, ${ACCENT}33, ${ACCENT}11)` }} />}
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

      {/* ─── 8. PAINT BRAND BADGES ─── */}
      <section className="relative z-10 py-16 overflow-hidden border-y" style={{ borderColor: `${ACCENT}1a` }}>
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #140f1a 0%, #1a1a1a 100%)" }} />
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <p className="text-center text-xs font-bold uppercase tracking-[0.25em] mb-6" style={{ color: ACCENT }}>Premium Brands We Use</p>
          <div className="flex flex-wrap justify-center gap-4">
            {PAINT_BRAND_BADGES.map((brand) => (
              <span key={brand} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium border" style={{ color: "#e2e8f0", borderColor: `${ACCENT}22`, background: `${ACCENT}08` }}>
                <Drop size={14} weight="fill" style={{ color: ACCENT }} /> {brand}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 9. GALLERY ─── */}
      <section id="gallery" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #12091a 50%, #1a1a1a 100%)" }} />
        <PaintDripBackground opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Our Portfolio" title="Recent Transformations" subtitle="See the stunning results of our painting projects." accent={ACCENT} />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {galleryImages.map((src, i) => {
              const captions = ["Living Room Refresh", "Exterior Makeover", "Kitchen Cabinet Painting", "Bedroom Color Update", "Commercial Office", "Accent Wall Design"];
              return (
                <div key={i} className="group relative rounded-2xl overflow-hidden border border-white/[0.10] hover:border-opacity-30 transition-all duration-500 aspect-square">
                  <img src={src} alt={captions[i] || `Project ${i + 1}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <h3 className="text-sm font-bold text-white">{captions[i] || `Project ${i + 1}`}</h3>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── 10. PROJECT QUIZ ─── */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #140f1a 50%, #1a1a1a 100%)" }} />
        <SplatterPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <AnimatedSection><SectionHeader badge="Get Started" title="What&apos;s Your Project?" subtitle="Select your project type for a personalized recommendation." accent={ACCENT} /></AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {QUIZ_OPTIONS.map((opt, i) => (
              <button key={opt.label} onClick={() => setQuizAnswer(i)} className="text-left cursor-pointer">
                <GlassCard className={`p-6 h-full transition-all duration-300 ${quizAnswer === i ? "ring-2" : ""}`} style={quizAnswer === i ? { borderColor: opt.color, boxShadow: `0 0 20px ${opt.color}22` } as React.CSSProperties : undefined}>
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 border" style={{ background: `${opt.color}15`, borderColor: `${opt.color}33` }}>
                    <opt.icon size={28} weight="duotone" style={{ color: opt.color }} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{opt.label}</h3>
                  <AnimatePresence>
                    {quizAnswer === i && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={spring}>
                        <p className="text-sm leading-relaxed mt-2 pb-1" style={{ color: opt.color }}>{opt.recommendation}</p>
                        <PhoneLink phone={data.phone} className="inline-flex items-center gap-2 mt-3 text-sm font-semibold text-white">
                          <Phone size={14} weight="fill" /> Get Free Estimate
                        </PhoneLink>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </GlassCard>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 11. PRICING / FINANCING ─── */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #12091a 50%, #1a1a1a 100%)" }} />
        <PaintDripBackground opacity={0.02} accent={ACCENT} />
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Transparent Pricing" title="Investment Guide" subtitle="Honest, upfront pricing with no hidden fees. Every estimate is free." accent={ACCENT} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PRICING_TIERS.map((tier) => (
              <div key={tier.name} className="relative">
                {tier.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 px-4 py-1 rounded-full text-xs font-bold" style={{ background: ACCENT, color: "#fff" }}>Most Popular</div>}
                <ShimmerBorder accent={tier.popular ? ACCENT : PINK_ACCENT} className="h-full">
                  <div className="p-7 h-full flex flex-col">
                    <h3 className="text-xl font-bold text-white mb-2">{tier.name}</h3>
                    <p className="text-3xl font-extrabold text-white mb-6">{tier.price}</p>
                    <ul className="space-y-3 flex-1">
                      {tier.features.map((feat) => (
                        <li key={feat} className="flex items-start gap-2 text-sm text-slate-400">
                          <CheckCircle size={16} weight="fill" style={{ color: ACCENT }} className="shrink-0 mt-0.5" /> {feat}
                        </li>
                      ))}
                    </ul>
                    <MagneticButton className="w-full mt-6 py-3 rounded-xl text-sm font-semibold text-white text-center cursor-pointer" style={{ background: tier.popular ? ACCENT : `${ACCENT}80` } as React.CSSProperties}>
                      Get Free Estimate
                    </MagneticButton>
                  </div>
                </ShimmerBorder>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 12. COMPARISON TABLE ─── */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #140f1a 50%, #1a1a1a 100%)" }} />
        <SplatterPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <AnimatedSection><SectionHeader badge="Why Choose Us" title={`${data.businessName} vs. The Competition`} accent={ACCENT} /></AnimatedSection>
          <GlassCard className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/15">
                    <th className="text-left p-4 text-slate-400 font-medium">Feature</th>
                    <th className="text-center p-4 font-bold text-white">{data.businessName}</th>
                    <th className="text-center p-4 text-slate-400 font-medium">Others</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_ROWS.map((row) => (
                    <tr key={row.feature} className="border-b border-white/8">
                      <td className="p-4 text-slate-300">{row.feature}</td>
                      <td className="p-4 text-center"><CheckCircle size={20} weight="fill" className="mx-auto" style={{ color: "#22c55e" }} /></td>
                      <td className="p-4 text-center text-slate-500">{row.them}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* ─── 13. WARRANTY INFO ─── */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #12091a 50%, #1a1a1a 100%)" }} />
        <PaintDripBackground opacity={0.02} accent={ACCENT} />
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <AnimatedSection><SectionHeader badge="Peace of Mind" title="Our Warranty Protection" subtitle="Every project is backed by our comprehensive warranty." accent={ACCENT} /></AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {WARRANTY_ITEMS.map((item) => (
              <GlassCard key={item.title} className="p-7 text-center">
                <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${ACCENT}22, ${ACCENT}0a)`, border: `1px solid ${ACCENT}33` }}>
                  <ShieldCheck size={28} weight="fill" style={{ color: ACCENT }} />
                </div>
                <span className="text-2xl font-black text-white">{item.years}</span>
                <h3 className="text-lg font-bold text-white mt-2 mb-2">{item.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 13b. VIDEO PLACEHOLDER ─── */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #140f1a 50%, #1a1a1a 100%)" }} />
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <SectionHeader badge="See Our Work" title="Watch a Transformation" accent={ACCENT} />
          <div className="relative rounded-2xl overflow-hidden border border-white/15 aspect-video">
            <img src={uniquePhotos[3] || pickFromPool(STOCK_GALLERY, data.businessName, 3)} alt={`${data.businessName} painting project`} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform" style={{ background: `${ACCENT}cc` }}>
                <svg viewBox="0 0 24 24" fill="white" className="w-8 h-8 ml-1"><polygon points="5,3 19,12 5,21" /></svg>
              </div>
            </div>
            <div className="absolute bottom-4 left-4 text-sm text-white/70">See the difference professional painting makes</div>
          </div>
        </div>
      </section>

      {/* ─── 13c. CERTIFICATIONS ─── */}
      <section className="relative z-10 py-16 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #140f1a 100%)" }} />
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <div className="flex flex-wrap justify-center gap-4">
            {["Licensed & Insured", "EPA Lead-Safe Certified", "BBB Accredited", "Benjamin Moore Partner", "Sherwin-Williams Pro", "Satisfaction Guaranteed"].map((cert) => (
              <span key={cert} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium border" style={{ color: ACCENT, borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}>
                <ShieldCheck size={16} weight="fill" />{cert}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 14. GOOGLE REVIEWS + TESTIMONIALS ─── */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #140f1a 50%, #1a1a1a 100%)" }} />
        <SplatterPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          {data.googleRating && (
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full border" style={{ borderColor: `${ACCENT}22`, background: `${ACCENT}08` }}>
                <div className="flex gap-0.5">{Array.from({ length: 5 }).map((_, j) => <Star key={j} size={18} weight="fill" style={{ color: j < Math.round(data.googleRating || 5) ? "#fbbf24" : "#334155" }} />)}</div>
                <span className="text-white font-bold">{data.googleRating}</span>
                {data.reviewCount && <span className="text-slate-400 text-sm">({data.reviewCount}+ reviews)</span>}
              </div>
            </div>
          )}
          <AnimatedSection><SectionHeader badge="Reviews" title="What Our Clients Say" accent={ACCENT} /></AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <GlassCard key={i} className="p-6 h-full flex flex-col">
                <div className="text-4xl mb-3" style={{ color: `${ACCENT}40` }}>&ldquo;</div>
                <div className="flex gap-0.5 mb-4">{Array.from({ length: t.rating || 5 }).map((_, j) => <Star key={j} size={18} weight="fill" style={{ color: "#fbbf24" }} />)}</div>
                <p className="text-slate-300 leading-relaxed flex-1 text-sm mb-4">{t.text}</p>
                <div className="pt-4 border-t border-white/8 flex items-center gap-2">
                  <CheckCircle size={14} weight="fill" style={{ color: "#22c55e" }} />
                  <span className="text-sm font-semibold text-white">{t.name}</span>
                  <span className="text-xs text-slate-500">Verified</span>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 15. CTA ─── */}
      <section className="relative z-10 py-20 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT}cc, ${ACCENT})` }} />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='40' height='40' fill='none'/%3E%3Cpath d='M0 0L40 40M40 0L0 40' stroke='%23000' stroke-width='0.5'/%3E%3C/svg%3E\")" }} />
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <PaintBrush size={48} weight="fill" className="mx-auto mb-6 text-white/70" />
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-4">Ready to Transform Your Space?</h2>
          <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">Get a free color consultation and detailed estimate. Let us bring your vision to life.</p>
          <PhoneLink phone={data.phone} className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-white text-black font-bold text-lg hover:bg-white/90 transition-colors">
            <Phone size={22} weight="fill" /> Call {data.phone}
          </PhoneLink>
        </div>
      </section>

      {/* ─── 16. SERVICE AREA ─── */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #12091a 50%, #1a1a1a 100%)" }} />
        <SplatterPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Service Area" title="Areas We Serve" accent={ACCENT} />
          <div className="text-center">
            <GlassCard className="p-8 inline-block">
              <div className="flex items-center gap-3 text-lg"><MapPin size={24} weight="duotone" style={{ color: ACCENT }} /><MapLink address={data.address} className="text-white font-semibold" /></div>
              <p className="text-slate-400 text-sm mt-2">&amp; Surrounding Communities</p>
              <div className="flex items-center justify-center gap-2 mt-4">
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#22c55e" }} />
                <span className="text-sm font-medium" style={{ color: "#22c55e" }}>Crews Available Now</span>
              </div>
            </GlassCard>
          </div>
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {(data.serviceAreas || [data.address?.split(",")[0] || "Local Area"]).map((area: string) => (
              <span key={area} className="px-4 py-2 rounded-full text-xs font-medium border" style={{ color: ACCENT, borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}>
                {area}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto mt-6">
            <GlassCard className="p-4 text-center">
              <PaintBrush size={20} weight="duotone" style={{ color: ACCENT }} className="mx-auto mb-2" />
              <p className="text-sm font-semibold text-white">Interior Painting</p>
              <p className="text-xs text-slate-500">Rooms, trim, and ceilings</p>
            </GlassCard>
            <GlassCard className="p-4 text-center">
              <HouseLine size={20} weight="duotone" style={{ color: ACCENT }} className="mx-auto mb-2" />
              <p className="text-sm font-semibold text-white">Exterior Painting</p>
              <p className="text-xs text-slate-500">Siding, trim, and decks</p>
            </GlassCard>
            <GlassCard className="p-4 text-center">
              <Buildings size={20} weight="duotone" style={{ color: ACCENT }} className="mx-auto mb-2" />
              <p className="text-sm font-semibold text-white">Commercial</p>
              <p className="text-xs text-slate-500">Offices and retail spaces</p>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* ─── 17. HOURS ─── */}
      {data.hours && (
        <section className="relative z-10 py-24 md:py-32 overflow-hidden">
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #140f1a 50%, #1a1a1a 100%)" }} />
          <PaintDripBackground opacity={0.02} accent={ACCENT} />
          <div className="max-w-3xl mx-auto px-6 relative z-10">
            <SectionHeader badge="Hours" title="When We&apos;re Available" accent={ACCENT} />
            <div className="text-center">
              <ShimmerBorder accent={ACCENT}>
                <div className="p-8">
                  <Clock size={32} weight="duotone" style={{ color: ACCENT }} className="mx-auto mb-4" />
                  <p className="text-slate-300 leading-relaxed whitespace-pre-line text-lg">{data.hours}</p>
                  <p className="text-sm mt-4 font-semibold" style={{ color: ACCENT }}>Free Estimates Available</p>
                </div>
              </ShimmerBorder>
            </div>
          </div>
        </section>
      )}

      {/* ─── 17a-2. DETAILED PREP PROCESS ─── */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #1a0f14 50%, #1a1a1a 100%)" }} />
        <PaintDripBackground opacity={0.02} accent={ACCENT} />
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Our Process" title="How We Deliver Perfect Results" subtitle="Great painting starts with meticulous preparation. Here is our 5-step process." accent={ACCENT} />
          <div className="space-y-4">
            {[
              { step: "01", title: "Free Consultation", desc: "We visit your property, discuss your vision, review colors, and provide a detailed written estimate with no hidden costs." },
              { step: "02", title: "Surface Preparation", desc: "Scraping, sanding, patching holes, caulking gaps, and priming bare surfaces. This is the most critical step for lasting results." },
              { step: "03", title: "Protection Setup", desc: "We cover floors, furniture, fixtures, and landscaping with professional drop cloths and plastic sheeting. Nothing gets damaged." },
              { step: "04", title: "Expert Application", desc: "Two coats of premium paint applied with brushes, rollers, or spray depending on the surface. Clean edges and consistent coverage guaranteed." },
              { step: "05", title: "Final Walkthrough", desc: "We do a detailed walkthrough with you to ensure every surface meets our high standards. Touch-ups are completed on the spot." },
            ].map((item) => (
              <GlassCard key={item.step} className="p-6 flex gap-4 items-start">
                <div className="w-12 h-10 rounded-lg shrink-0 flex items-center justify-center text-sm font-bold" style={{ background: `${ACCENT}15`, color: ACCENT, border: `1px solid ${ACCENT}22` }}>
                  {item.step}
                </div>
                <div>
                  <h4 className="text-base font-bold text-white mb-1">{item.title}</h4>
                  <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 17b. COLOR CONSULTATION GALLERY ─── */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #140f1a 50%, #1a1a1a 100%)" }} />
        <SplatterPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            badge="Portfolio"
            title="Recent Projects"
            subtitle="Browse our latest residential and commercial painting projects."
            accent={ACCENT}
          />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {galleryImages.slice(0, 6).map((img, i) => {
              const labels = ["Kitchen Refresh", "Exterior Repaint", "Accent Wall Design", "Cabinet Refinish", "Commercial Office", "Deck Staining"];
              const types = ["Interior", "Exterior", "Interior", "Specialty", "Commercial", "Exterior"];
              return (
                <div key={i} className="group relative aspect-[4/3] rounded-2xl overflow-hidden border border-white/8">
                  <img src={img} alt={labels[i]} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                    <span className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: ACCENT }}>{types[i]}</span>
                    <span className="text-sm font-semibold text-white">{labels[i]}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── 17c. PAINT SELECTION GUIDE ─── */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #1a0f14 50%, #1a1a1a 100%)" }} />
        <PaintDripBackground opacity={0.02} accent={ACCENT} />
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <SectionHeader
            badge="Guide"
            title="Paint Selection Guide"
            subtitle="Choosing the right paint makes all the difference. We help you select the perfect product."
            accent={ACCENT}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { title: "Interior Finishes", desc: "Flat for ceilings, eggshell for living spaces, satin for kitchens and baths, semi-gloss for trim and doors. Each finish serves a purpose.", icon: HouseLine },
              { title: "Exterior Paints", desc: "100% acrylic latex for durability against weather. UV-resistant formulas prevent fading. Proper primer is essential for long-lasting results.", icon: Buildings },
              { title: "Color Psychology", desc: "Blues create calm, greens inspire freshness, warm tones feel inviting. We help you choose colors that match your space and mood.", icon: Swatches },
              { title: "Eco-Friendly Options", desc: "Low-VOC and zero-VOC paints are better for indoor air quality. We carry premium eco-friendly lines from all major brands.", icon: Drop },
            ].map((item) => (
              <GlassCard key={item.title} className="p-6 flex gap-4 items-start">
                <div className="w-12 h-12 rounded-full shrink-0 flex items-center justify-center" style={{ background: `${ACCENT}15`, border: `1px solid ${ACCENT}22` }}>
                  <item.icon size={24} weight="duotone" style={{ color: ACCENT }} />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white mb-1">{item.title}</h4>
                  <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 17d. WHY CHOOSE US ─── */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #140f1a 50%, #1a1a1a 100%)" }} />
        <SplatterPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Our Edge" title="Why Choose Our Painters" accent={ACCENT} />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: ShieldCheck, title: "Licensed & Insured", desc: "Full liability coverage and worker's compensation for your protection." },
              { icon: Eye, title: "Detailed Prep Work", desc: "We spend more time prepping than painting. That is why our work lasts." },
              { icon: Palette, title: "Free Color Consult", desc: "Not sure on colors? Our design team helps you choose the perfect palette." },
              { icon: Star, title: "Clean & Respectful", desc: "We protect your furniture, floors, and landscaping. Leave it cleaner than we found it." },
            ].map((item) => (
              <GlassCard key={item.title} className="p-6 text-center">
                <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: `${ACCENT}15`, border: `1px solid ${ACCENT}22` }}>
                  <item.icon size={28} weight="duotone" style={{ color: ACCENT }} />
                </div>
                <h3 className="text-base font-bold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 17e. MID-PAGE CTA ─── */}
      <section className="relative z-10 py-16 overflow-hidden">
        <div className="absolute inset-0" style={{ background: ACCENT }} />
        <div className="absolute inset-0 bg-black/30" />
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">Ready to Transform Your Space?</h2>
          <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
            Free color consultation and estimate. We will help you pick the perfect colors
            and provide a detailed quote with no hidden fees.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <PhoneLink phone={data.phone} className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-sm font-bold" style={{ color: ACCENT }}>
              <Phone size={18} weight="fill" /> Free Estimate
            </PhoneLink>
            <a href="#contact" className="inline-flex items-center gap-2 px-8 py-4 rounded-full border-2 border-white text-white text-sm font-bold hover:bg-white/10 transition-colors">
              Get Started <ArrowRight size={18} weight="bold" />
            </a>
          </div>
        </div>
      </section>

      {/* ─── 18. FAQ ─── */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #140f1a 50%, #1a1a1a 100%)" }} />
        <PaintDripBackground opacity={0.02} accent={ACCENT} />
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <SectionHeader badge="FAQ" title="Common Questions" accent={ACCENT} />
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} question={faq.q} answer={faq.a} isOpen={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── 19. CONTACT ─── */}
      <section id="contact" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #12091a 50%, #1a1a1a 100%)" }} />
        <SplatterPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: ACCENT, borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}>Contact Us</span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6 text-white">Get Your Free Estimate</h2>
              <p className="text-slate-400 leading-relaxed mb-8">Ready to transform your space? Contact {data.businessName} today for a free consultation and detailed estimate.</p>
              <div className="space-y-5">
                <div className="flex items-start gap-4"><div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: ACCENT_GLOW }}><MapPin size={20} weight="duotone" style={{ color: ACCENT }} /></div><div><p className="text-sm font-semibold text-white">Address</p><MapLink address={data.address} className="text-sm text-slate-400" /></div></div>
                <div className="flex items-start gap-4"><div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: ACCENT_GLOW }}><Phone size={20} weight="duotone" style={{ color: ACCENT }} /></div><div><p className="text-sm font-semibold text-white">Phone</p><PhoneLink phone={data.phone} className="text-sm text-slate-400" /></div></div>
                <div className="flex items-start gap-4"><div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: ACCENT_GLOW }}><Palette size={20} weight="duotone" style={{ color: ACCENT }} /></div><div><p className="text-sm font-semibold text-white">Free Consultation</p><p className="text-sm text-slate-400">Color consultation included with every estimate</p></div></div>
                {data.hours && <div className="flex items-start gap-4"><div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: ACCENT_GLOW }}><Clock size={20} weight="duotone" style={{ color: ACCENT }} /></div><div><p className="text-sm font-semibold text-white">Hours</p><p className="text-sm text-slate-400 whitespace-pre-line">{data.hours}</p></div></div>}
              </div>
            </div>
            <GlassCard className="p-8">
              <h3 className="text-xl font-semibold text-white mb-6">Request a Free Estimate</h3>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className="block text-sm text-slate-400 mb-1.5">First Name</label><input type="text" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 focus:outline-none text-sm" placeholder="John" /></div>
                  <div><label className="block text-sm text-slate-400 mb-1.5">Last Name</label><input type="text" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 focus:outline-none text-sm" placeholder="Doe" /></div>
                </div>
                <div><label className="block text-sm text-slate-400 mb-1.5">Phone</label><input type="tel" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 focus:outline-none text-sm" placeholder="(555) 123-4567" /></div>
                <div><label className="block text-sm text-slate-400 mb-1.5">Service Needed</label><select className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white focus:outline-none text-sm"><option value="" className="bg-neutral-900">Select a service</option>{data.services.map((s) => <option key={s.name} value={s.name.toLowerCase().replace(/\s+/g, "-")} className="bg-neutral-900">{s.name}</option>)}</select></div>
                <div><label className="block text-sm text-slate-400 mb-1.5">Project Details</label><textarea rows={3} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 focus:outline-none text-sm resize-none" placeholder="Describe your painting project..." /></div>
                <MagneticButton className="w-full py-4 rounded-xl text-base font-semibold text-white flex items-center justify-center gap-2 cursor-pointer" style={{ background: ACCENT } as React.CSSProperties}>Send Request <ArrowRight size={18} weight="bold" /></MagneticButton>
              </form>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* ─── 20. GUARANTEE ─── */}
      <section className="relative z-10 py-16 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #140f1a 100%)" }} />
        <SplatterPattern opacity={0.015} accent={ACCENT} />
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <ShimmerBorder accent={ACCENT}>
            <div className="p-8 md:p-12">
              <ShieldCheck size={48} weight="fill" style={{ color: ACCENT }} className="mx-auto mb-4" />
              <h2 className="text-2xl md:text-4xl font-extrabold text-white mb-4">Our Quality Guarantee</h2>
              <p className="text-slate-400 leading-relaxed max-w-2xl mx-auto text-lg mb-2">Every project by {data.businessName} is backed by our satisfaction guarantee. We use premium paints, proper preparation, and meticulous technique to deliver results that last.</p>
              <p className="text-slate-500 text-sm max-w-xl mx-auto mb-6">
                We stand behind every brushstroke. If you are not completely satisfied with
                any aspect of our work, we will return to make it right at no additional cost.
                That is the confidence that comes from hiring true professionals.
              </p>
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                {[
                  "Premium Paints", "Clean Edges", "No Hidden Fees",
                  "Satisfaction Guaranteed", "Detailed Prep", "Full Warranty",
                ].map((item) => (
                  <span key={item} className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border" style={{ color: ACCENT, borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}>
                    <CheckCircle size={16} weight="fill" /> {item}
                  </span>
                ))}
              </div>
            </div>
          </ShimmerBorder>
        </div>
      </section>

      {/* ─── 21. FOOTER ─── */}
      <footer className="relative z-10 border-t border-white/8 py-10 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #111 100%)" }} />
        <SplatterPattern opacity={0.015} accent={ACCENT} />
        <div className="mx-auto max-w-6xl px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3"><PaintBrush size={22} weight="fill" style={{ color: ACCENT }} /><span className="text-lg font-bold text-white">{data.businessName}</span></div>
              <p className="text-sm text-slate-500 leading-relaxed">{data.about.length > 120 ? data.about.slice(0, 120).trim() + "..." : data.about}</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-3">Quick Links</h4>
              <div className="space-y-2">{["Services", "About", "Gallery", "Contact"].map((link) => <a key={link} href={`#${link.toLowerCase()}`} className="block text-sm text-slate-500 hover:text-white transition-colors">{link}</a>)}</div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-3">Contact</h4>
              <div className="space-y-2 text-sm text-slate-500">
                <p><PhoneLink phone={data.phone} /></p>
                <p><MapLink address={data.address} /></p>
                {data.socialLinks && Object.entries(data.socialLinks).map(([platform, url]) => <a key={platform} href={url} target="_blank" rel="noopener noreferrer" className="block hover:text-white transition-colors capitalize">{platform}</a>)}
              </div>
            </div>
          </div>
          <div className="border-t border-white/8 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-500"><PaintBrush size={14} weight="fill" style={{ color: ACCENT }} /><span>{data.businessName} &copy; {new Date().getFullYear()}</span></div>
            <div className="flex items-center gap-2 text-xs text-slate-600"><BluejayLogo className="w-4 h-4" /><span>Created by <a href="https://bluejayportfolio.com" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "underline" }}>bluejayportfolio.com</a></span></div>
          </div>
        </div>
      </footer>

      <ClaimBanner businessName={data.businessName} accentColor={ACCENT} prospectId={data.id} />
      <div className="h-14 md:h-28" />
    </main>
  );
}
