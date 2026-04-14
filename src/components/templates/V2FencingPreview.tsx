"use client";

/* eslint-disable @next/next/no-img-element -- These static marketing and preview components intentionally use plain img tags to preserve existing markup and visual behavior during lint-only cleanup. */
/* eslint-disable react-hooks/purity -- Decorative particle values are intentionally randomized for static visual effects in these marketing pages and previews; this preserves existing appearance without changing business logic. */

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import { Wall, Hammer, Clock, Phone, MapPin, CaretDown, List, X, Star, ArrowRight, CheckCircle, ShieldCheck, Ruler, TreeStructure, HouseLine, Buildings, Wrench, Timer, Trophy, Calculator } from "@phosphor-icons/react";
import type { GeneratedSiteData } from "@/lib/generator";
import BluejayLogo from "../BluejayLogo";
import { MapLink, PhoneLink } from "@/components/templates/MapLink";
import ClaimBanner from "@/components/ClaimBanner";
import { pickFromPool, pickGallery } from "@/lib/stock-image-picker";

const spring = { type: "spring" as const, stiffness: 100, damping: 20 };
const springFast = { type: "spring" as const, stiffness: 200, damping: 25 };
const CHARCOAL = "#1a1a1a";
const DEFAULT_STONE = "#78716c";
const STONE_LIGHT = "#a8a29e";
const WOOD_ACCENT = "#92400e";

function getAccent(accentColor?: string) { const c = accentColor || DEFAULT_STONE; return { ACCENT: c, ACCENT_GLOW: `${c}26`, ACCENT_LIGHT: STONE_LIGHT, WOOD: WOOD_ACCENT }; }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SERVICE_ICON_MAP: Record<string, any> = {
  wood: TreeStructure, cedar: TreeStructure, privacy: Wall, chain: Wall, vinyl: Wall, aluminum: Wall, iron: Wall, metal: Wall, gate: Wall, commercial: Buildings, residential: HouseLine, repair: Wrench, install: Hammer, custom: Ruler, deck: TreeStructure, ranch: Wall, picket: Wall,
};
function getServiceIcon(serviceName: string) { const lower = serviceName.toLowerCase(); for (const [key, Icon] of Object.entries(SERVICE_ICON_MAP)) { if (lower.includes(key)) return Icon; } return Wall; }

const STOCK_HERO_POOL = ["https://images.unsplash.com/photo-1599427303058-f04cbcf4756f?w=1400&q=80","https://images.unsplash.com/photo-1516455590571-18256e5bb9ff?w=1400&q=80"];
const STOCK_ABOUT_POOL = ["https://images.unsplash.com/photo-1560184897-ae75f418493e?w=800&q=80","https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=800&q=80"];
const STOCK_GALLERY = [
  "https://images.unsplash.com/photo-1598228723793-52759bba239c?w=600&q=80",
  "https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=600&q=80",
  "https://images.unsplash.com/photo-1534237710431-e2fc698436d0?w=600&q=80",
  "https://images.unsplash.com/photo-1526367790999-0150786686a2?w=600&q=80",
  "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&q=80",
  "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=600&q=80",
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&q=80",
  "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600&q=80",
];

function FloatingParticles({ accent }: { accent: string }) {
  const particles = Array.from({ length: 16 }, (_, i) => ({ id: i, x: Math.random() * 100, delay: Math.random() * 8, duration: 6 + Math.random() * 7, size: 2 + Math.random() * 3, opacity: 0.10 + Math.random() * 0.2, isWood: Math.random() > 0.6 }));
  return (<div className="pointer-events-none fixed inset-0 z-0 overflow-hidden hidden md:block">{particles.map((p) => (<motion.div key={p.id} className="absolute rounded-full" style={{ left: `${p.x}%`, width: p.size, height: p.size, background: p.isWood ? WOOD_ACCENT : accent, willChange: "transform, opacity" }} animate={{ y: ["-10vh", "110vh"], opacity: [0, p.opacity, p.opacity, 0] }} transition={{ y: { duration: p.duration, repeat: Infinity, delay: p.delay, ease: "linear" }, opacity: { duration: p.duration, repeat: Infinity, delay: p.delay, times: [0, 0.1, 0.9, 1] } }} />))}</div>);
}

function WoodGrainPattern({ opacity = 0.03, accent }: { opacity?: number; accent: string }) {
  const patternId = `woodGrainV2-${accent.replace("#", "")}`;
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }}>
      <defs>
        <pattern id={patternId} width="60" height="120" patternUnits="userSpaceOnUse">
          <path d="M0 20 Q15 18 30 20 Q45 22 60 20" fill="none" stroke={accent} strokeWidth="0.5" />
          <path d="M0 40 Q15 38 30 42 Q45 40 60 38" fill="none" stroke={accent} strokeWidth="0.4" />
          <path d="M0 60 Q20 58 30 62 Q40 60 60 58" fill="none" stroke={WOOD_ACCENT} strokeWidth="0.3" />
          <path d="M0 80 Q10 82 30 78 Q50 80 60 82" fill="none" stroke={accent} strokeWidth="0.5" />
          <path d="M0 100 Q15 102 30 98 Q45 100 60 102" fill="none" stroke={accent} strokeWidth="0.4" />
          <circle cx="20" cy="50" r="4" fill="none" stroke={accent} strokeWidth="0.3" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  );
}

function WallPostBackground({ opacity = 0.03, accent }: { opacity?: number; accent: string }) {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }} viewBox="0 0 1000 600" preserveAspectRatio="none">
      {[100, 250, 400, 550, 700, 850].map((xPos, i) => (
        <g key={i}>
          <rect x={xPos - 4} y="50" width="8" height="500" fill={accent} opacity="0.3" rx="2" />
          <rect x={xPos - 3} y="40" width="6" height="20" fill={accent} opacity="0.4" rx="1" />
        </g>
      ))}
      <rect x="96" y="200" width="758" height="6" fill={accent} opacity="0.2" rx="1" />
      <rect x="96" y="380" width="758" height="6" fill={accent} opacity="0.2" rx="1" />
    </svg>
  );
}

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] ${className}`}>
      {children}
    </div>
  );
}

function MagneticButton({ children, className = "", onClick, style, href }: { children: React.ReactNode; className?: string; onClick?: () => void; style?: React.CSSProperties; href?: string }) {
  const ref = useRef<HTMLButtonElement>(null); const x = useMotionValue(0); const y = useMotionValue(0); const springX = useSpring(x, springFast); const springY = useSpring(y, springFast);
  const isTouchDevice = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
  const handleMouseMove = useCallback((e: React.MouseEvent) => { if (!ref.current || isTouchDevice) return; const rect = ref.current.getBoundingClientRect(); x.set((e.clientX - (rect.left + rect.width / 2)) * 0.25); y.set((e.clientY - (rect.top + rect.height / 2)) * 0.25); }, [x, y, isTouchDevice]);
  const handleMouseLeave = useCallback(() => { x.set(0); y.set(0); }, [x, y]);
  if (href) return <motion.a href={href} ref={ref as unknown as React.Ref<HTMLAnchorElement>} style={{ x: springX, y: springY, willChange: "transform", ...style }} onMouseMove={handleMouseMove as unknown as React.MouseEventHandler<HTMLAnchorElement>} onMouseLeave={handleMouseLeave} className={className} whileTap={{ scale: 0.97 }}>{children}</motion.a>;
  return <motion.button ref={ref} style={{ x: springX, y: springY, willChange: "transform", ...style }} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} onClick={onClick} className={className} whileTap={{ scale: 0.97 }}>{children}</motion.button>;
}

function ShimmerBorder({ children, className = "", accent }: { children: React.ReactNode; className?: string; accent: string }) { return (<div className={`relative rounded-2xl p-[1px] overflow-hidden ${className}`}><motion.div className="absolute inset-0 rounded-2xl" style={{ background: `conic-gradient(from 0deg, transparent, ${accent}, transparent, ${WOOD_ACCENT}, transparent)`, willChange: "transform" }} animate={{ rotate: [0, 360] }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} /><div className="relative rounded-2xl bg-[#141414] z-10">{children}</div></div>); }

function SectionHeader({ badge, title, subtitle, accent }: { badge: string; title: string; subtitle?: string; accent: string }) { return (<div className="text-center mb-16"><span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: accent, borderColor: `${accent}33`, background: `${accent}0d` }}>{badge}</span><h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white">{title}</h2><div className="h-0.5 w-16 mx-auto mt-4" style={{ background: `linear-gradient(to right, ${accent}, transparent)` }} />{subtitle && <p className="text-slate-400 mt-4 max-w-2xl text-lg leading-relaxed mx-auto">{subtitle}</p>}</div>); }

function AccordionItem({ question, answer, isOpen, onToggle }: { question: string; answer: string; isOpen: boolean; onToggle: () => void }) {
  return (
    <GlassCard className="overflow-hidden">
      <button onClick={onToggle} className="w-full flex items-center justify-between p-5 md:p-6 text-left group cursor-pointer">
        <span className="text-lg font-semibold text-white pr-4">{question}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={spring}>
          <CaretDown size={20} className="text-slate-400 shrink-0" />
        </motion.div>
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

function AnimatedSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.7, ease: "easeOut" as const }} className={className}>
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════ */

const FENCE_MATERIALS = [
  { name: "Wood / Cedar", icon: TreeStructure, desc: "Classic warmth and natural beauty. Cedar resists rot and insects naturally.", warranty: "5-Year", price: "$$" },
  { name: "Vinyl / PVC", icon: Wall, desc: "Maintenance-free with lasting color. Never needs painting or staining.", warranty: "Lifetime", price: "$$$" },
  { name: "Chain Link", icon: Wall, desc: "Affordable security for any property. Galvanized or vinyl-coated options.", warranty: "10-Year", price: "$" },
  { name: "Wrought Iron", icon: Wall, desc: "Elegant, durable, and timeless. Perfect for decorative and security fencing.", warranty: "15-Year", price: "$$$$" },
  { name: "Aluminum", icon: Wall, desc: "Rust-proof and lightweight. Low maintenance with a sleek modern look.", warranty: "Lifetime", price: "$$$" },
  { name: "Composite", icon: Ruler, desc: "Best of wood and plastic. Eco-friendly, durable, and weather-resistant.", warranty: "25-Year", price: "$$$" },
];

const ESTIMATE_TYPES = [
  { label: "Small Yard (under 100 ft)", range: "$1,500 - $3,500" },
  { label: "Medium Yard (100-200 ft)", range: "$3,500 - $7,000" },
  { label: "Large Property (200+ ft)", range: "$7,000 - $15,000+" },
];

const COMPARISON_ROWS = [
  { feature: "Free On-Site Estimate", us: true, them: "Sometimes" },
  { feature: "Licensed & Insured", us: true, them: "Varies" },
  { feature: "Written Warranty", us: true, them: "Limited" },
  { feature: "Permit Handling", us: true, them: "No" },
  { feature: "Premium Materials", us: true, them: "Basic" },
  { feature: "Proper Post Depth", us: true, them: "Varies" },
  { feature: "Full Site Cleanup", us: true, them: "Extra Cost" },
];

export default function V2FencingPreview({ data }: { data: GeneratedSiteData }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const { ACCENT, ACCENT_GLOW } = getAccent(data.accentColor);
  const uniquePhotos = data.photos ? [...new Set(data.photos)] : [];

  const heroImage = uniquePhotos[0] || pickFromPool(STOCK_HERO_POOL, data.businessName);
  const heroCardImage = uniquePhotos[1] || pickFromPool(STOCK_ABOUT_POOL, data.businessName, 1);
  const aboutImage = uniquePhotos[2] || pickFromPool(STOCK_ABOUT_POOL, data.businessName, 2);
  const galleryImages = data.photos?.length > 2 ? data.photos.slice(2, 8) : pickGallery(STOCK_GALLERY, data.businessName);
  const phoneDigits = data.phone.replace(/\D/g, "");

  const processSteps = [
    { step: "01", title: "Free Consultation", desc: "We visit your property, discuss your needs, and help you choose the right fence style and material.", icon: Phone },
    { step: "02", title: "Detailed Quote", desc: "Receive a transparent, written estimate that covers materials, labor, and timeline.", icon: Calculator },
    { step: "03", title: "Expert Installation", desc: "Our experienced crew installs your fence with precision, proper post depth, and quality materials.", icon: Hammer },
    { step: "04", title: "Final Inspection", desc: "We walk the fence line with you, verify everything meets your expectations, and clean up completely.", icon: Trophy },
  ];

  const faqs = [
    { q: `What types of fencing does ${data.businessName} install?`, a: `We install all types of fencing including ${data.services.slice(0, 3).map(s => s.name).join(", ")}, and more. We help you choose the best option for your property and budget.` },
    { q: "Do I need a permit for a new fence?", a: "Permit requirements vary by municipality. We handle all permit research and applications as part of our service, so you do not have to worry about compliance." },
    { q: "How long does fence installation take?", a: "Most residential fencing projects take 1-3 days depending on the property size and fence type. We provide an estimated timeline with every quote." },
    { q: "Do you offer fence repair services?", a: `Yes! ${data.businessName} handles all types of fence repairs including post replacement, panel repair, gate adjustments, and storm damage restoration.` },
    { q: "What warranty do you offer?", a: "We provide a workmanship warranty on every installation, plus manufacturer warranties on materials. Specific coverage varies by material type — ask us for details." },
    { q: "Can you remove my old fence?", a: "Absolutely. Old fence removal and disposal is included in most installation quotes. We handle everything from start to finish." },
  ];

  const fallbackTestimonials = [
    { name: "Greg P.", text: "Beautiful cedar fence installed in just two days. The crew was professional and cleaned up perfectly.", rating: 5 },
    { name: "Diana L.", text: "Got quotes from five companies. Best price AND best quality. Our neighbors are jealous.", rating: 5 },
    { name: "Paul M.", text: "They replaced our old chain link with a gorgeous privacy fence. Transformed our backyard.", rating: 5 },
  ];
  const testimonials = data.testimonials?.length > 0 ? data.testimonials : fallbackTestimonials;

  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden" style={{ background: CHARCOAL, color: "#f1f5f9" }}>
      <FloatingParticles accent={ACCENT} />

      {/* 1. NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-4">
          <GlassCard className="flex items-center justify-between px-4 md:px-6 py-3">
            <div className="flex items-center gap-2"><Wall size={24} weight="fill" style={{ color: ACCENT }} /><span className="text-lg font-bold tracking-tight text-white">{data.businessName}</span></div>
            <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
              <a href="#services" className="hover:text-white transition-colors">Services</a>
              <a href="#materials" className="hover:text-white transition-colors">Materials</a>
              <a href="#projects" className="hover:text-white transition-colors">Projects</a>
              <a href="#about" className="hover:text-white transition-colors">About</a>
              <a href="#contact" className="hover:text-white transition-colors">Contact</a>
            </div>
            <div className="flex items-center gap-3">
              <MagneticButton className="px-4 md:px-5 py-2 rounded-full text-sm font-semibold text-white transition-colors cursor-pointer" style={{ background: ACCENT } as React.CSSProperties}>Free Estimate</MagneticButton>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors">{mobileMenuOpen ? <X size={24} /> : <List size={24} />}</button>
            </div>
          </GlassCard>
          <AnimatePresence>{mobileMenuOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="md:hidden mt-2 overflow-hidden">
              <GlassCard className="flex flex-col gap-1 px-4 py-4">
                {["Services", "Materials", "Projects", "About", "Contact"].map((l) => <a key={l} href={`#${l.toLowerCase()}`} onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors">{l}</a>)}
              </GlassCard>
            </motion.div>
          )}</AnimatePresence>
        </div>
      </nav>

      {/* 2. HERO */}
      <section className="relative min-h-[100dvh] flex items-center pt-24 z-10 overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImage} alt={`${data.businessName}`} className="w-full h-full object-cover object-center" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          <div className="space-y-8 rounded-2xl bg-black/50 backdrop-blur-md p-6 md:p-8 border border-white/5">
            <div>
              <p className="text-sm uppercase tracking-widest mb-4" style={{ color: ACCENT }}>Professional Fencing Contractors</p>
              <h1 className="text-3xl md:text-6xl tracking-tighter leading-none font-bold text-white" style={{ textShadow: "0 2px 20px rgba(0,0,0,0.8)" }}>{data.tagline || `${data.businessName} — Quality Fencing`}</h1>
            </div>
            <p className="text-lg text-slate-400 max-w-md leading-relaxed">{(() => { const t = data.about; if (t.length <= 180) return t; const dot = t.indexOf('.', 80); return dot > 0 && dot < 220 ? t.slice(0, dot + 1) : t.slice(0, 180).trim() + '...'; })()}</p>
            <div className="flex flex-wrap gap-4">
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white flex items-center gap-2 cursor-pointer" style={{ background: ACCENT } as React.CSSProperties}>Get Free Estimate <ArrowRight size={18} weight="bold" /></MagneticButton>
              <MagneticButton href={`tel:${phoneDigits}`} className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/10 flex items-center gap-2 cursor-pointer"><Phone size={18} weight="duotone" /> <PhoneLink phone={data.phone} className="text-white" /></MagneticButton>
            </div>
            <div className="flex flex-wrap gap-3">
              {["Licensed & Insured", `${data.googleRating || "5.0"}-Star Rated`, "Free Estimates"].map((badge) => (
                <span key={badge} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border border-white/10 bg-white/5 text-white/80"><CheckCircle size={14} weight="fill" style={{ color: ACCENT }} /> {badge}</span>
              ))}
            </div>
          </div>
          <div className="hidden md:block relative">
            <div className="relative rounded-2xl overflow-hidden border border-white/10">
              <img src={heroCardImage} alt={`${data.businessName} fence installation`} className="w-full h-[500px] object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6"><div className="px-4 py-2 rounded-full backdrop-blur-md bg-black/50 border flex items-center gap-2" style={{ borderColor: `${ACCENT}4d` }}><Wall size={18} weight="fill" style={{ color: ACCENT }} /><span className="text-sm font-semibold text-white">Quality Built to Last</span></div></div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. STATS */}
      <section className="relative z-10 py-16 overflow-hidden border-y" style={{ borderColor: `${ACCENT}1a` }}>
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #141210 0%, #1a1a1a 100%)" }} />
        <WoodGrainPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {data.stats.map((stat, i) => {
              const statIcons = [Wall, Ruler, Star, ShieldCheck];
              const Icon = statIcons[i % statIcons.length];
              return (<div key={stat.label} className="text-center"><div className="flex items-center justify-center gap-2 mb-2"><Icon size={22} weight="fill" style={{ color: ACCENT }} /><span className="text-3xl md:text-4xl font-extrabold text-white">{stat.value}</span></div><span className="text-slate-500 text-sm font-medium tracking-wide uppercase">{stat.label}</span></div>);
            })}
          </div>
        </div>
      </section>

      {/* 4. SERVICES */}
      <section id="services" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #141210 50%, #1a1a1a 100%)" }} />
        <WoodGrainPattern accent={ACCENT} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[10%] right-[5%] w-[500px] h-[500px] rounded-full blur-[160px]" style={{ background: `${ACCENT}08` }} /></div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Our Services" title="Fencing Solutions" subtitle={`${data.businessName} installs and repairs all types of fencing for residential and commercial properties.`} accent={ACCENT} />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.services.map((service, i) => {
              const Icon = getServiceIcon(service.name);
              return (
                <div key={service.name} className="group relative p-7 rounded-2xl border border-white/[0.06] hover:border-opacity-30 transition-all duration-500 overflow-hidden bg-white/[0.02]">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: `radial-gradient(circle at 50% 0%, ${ACCENT}15, transparent 70%)` }} />
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-5">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center border" style={{ background: ACCENT_GLOW, borderColor: `${ACCENT}33` }}><Icon size={24} weight="duotone" style={{ color: ACCENT }} /></div>
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

      {/* 5. FENCE MATERIAL TYPES */}
      <section id="materials" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #110f0c 50%, #1a1a1a 100%)" }} />
        <WallPostBackground opacity={0.02} accent={ACCENT} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[30%] left-[15%] w-[500px] h-[500px] rounded-full blur-[200px]" style={{ background: `${WOOD_ACCENT}06` }} /></div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Materials" title="Fence Material Guide" subtitle="Choose the right material for your property, budget, and style." accent={ACCENT} />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FENCE_MATERIALS.map((mat) => (
              <GlassCard key={mat.name} className="p-6 h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center border" style={{ background: ACCENT_GLOW, borderColor: `${ACCENT}33` }}><mat.icon size={24} weight="duotone" style={{ color: ACCENT }} /></div>
                  <span className="text-xs font-mono px-2 py-1 rounded-md bg-white/5 text-slate-400">{mat.price}</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{mat.name}</h3>
                <p className="text-sm text-slate-400 leading-relaxed flex-1">{mat.desc}</p>
                <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-2">
                  <ShieldCheck size={16} weight="fill" style={{ color: ACCENT }} />
                  <span className="text-sm font-medium text-white">{mat.warranty} Warranty</span>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* 6. ABOUT */}
      <section id="about" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #110f0c 50%, #1a1a1a 100%)" }} />
        <WallPostBackground opacity={0.02} accent={ACCENT} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[20%] left-[10%] w-[500px] h-[500px] rounded-full blur-[180px]" style={{ background: `${ACCENT}06` }} /></div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="relative">
              <div className="rounded-2xl overflow-hidden border border-white/10"><img src={aboutImage} alt={`${data.businessName} team`} className="w-full h-[400px] object-cover" /></div>
              <div className="absolute -bottom-4 -right-4 md:bottom-6 md:-right-6"><div className="px-5 py-3 rounded-xl backdrop-blur-md border text-white font-bold text-sm shadow-lg" style={{ background: `${ACCENT}e6`, borderColor: `${ACCENT}80` }}>{data.stats[0] ? `${data.stats[0].value} ${data.stats[0].label}` : "Built to Last"}</div></div>
            </div>
            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: ACCENT, borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}>About Us</span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6 text-white">Your Trusted Fencing Experts</h2>
              <p className="text-slate-400 leading-relaxed mb-8">{data.about}</p>
              <div className="grid grid-cols-2 gap-4">
                {[{ icon: ShieldCheck, label: "Licensed & Insured" }, { icon: Ruler, label: "Custom Designs" }, { icon: Star, label: "Top Rated" }, { icon: CheckCircle, label: "Warranty Included" }].map((badge) => (
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

      {/* 7. PROCESS */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #141210 50%, #1a1a1a 100%)" }} />
        <WoodGrainPattern opacity={0.025} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Our Process" title="How We Work" accent={ACCENT} />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {processSteps.map((step, i) => (
              <div key={step.step} className="relative">
                {i < processSteps.length - 1 && <div className="hidden lg:block absolute top-10 left-[calc(50%+40px)] w-[calc(100%-80px)] h-px" style={{ background: `linear-gradient(to right, ${ACCENT}33, ${ACCENT}11)` }} />}
                <GlassCard className="p-6 text-center relative">
                  <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${ACCENT}22, ${ACCENT}0a)`, border: `1px solid ${ACCENT}33` }}>
                    <step.icon size={28} weight="duotone" style={{ color: ACCENT }} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
                </GlassCard>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. PROJECT GALLERY */}
      <section id="projects" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #110f0c 50%, #1a1a1a 100%)" }} />
        <WallPostBackground opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <AnimatedSection><SectionHeader badge="Our Work" title="Recent Installations" accent={ACCENT} /></AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {galleryImages.slice(0, 6).map((src, i) => {
              const titles = ["Cedar Privacy Fence", "Vinyl Fencing", "Chain Link Installation", "Custom Iron Gate", "Wood Panel Fence", "Aluminum Railing"];
              return (
                <div key={i} className="group relative rounded-2xl overflow-hidden border border-white/[0.06] hover:border-opacity-30 transition-all duration-500">
                  <img src={src} alt={titles[i] || `Project ${i + 1}`} className="w-full h-64 object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-lg font-bold text-white mb-1">{titles[i] || `Project ${i + 1}`}</h3>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 9. ESTIMATE CALCULATOR */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #141210 50%, #1a1a1a 100%)" }} />
        <WoodGrainPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Pricing" title="Free Estimate Guide" subtitle="Get a ballpark price for your fencing project. Actual cost varies by material, terrain, and customization." accent={ACCENT} />
          <div className="grid sm:grid-cols-3 gap-6">
            {ESTIMATE_TYPES.map((est, i) => (
              <GlassCard key={est.label} className={`p-6 text-center ${i === 1 ? "ring-1" : ""}`} style={i === 1 ? { borderColor: ACCENT } : undefined}>
                <div className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: `${ACCENT}15`, border: `1px solid ${ACCENT}33` }}>
                  <Ruler size={24} weight="duotone" style={{ color: ACCENT }} />
                </div>
                <h4 className="text-base font-bold text-white mb-2">{est.label}</h4>
                <p className="text-2xl font-extrabold mb-4" style={{ color: ACCENT }}>{est.range}</p>
                <p className="text-xs text-slate-500">Installed. Materials + labor included.</p>
              </GlassCard>
            ))}
          </div>
          <div className="text-center mt-8">
            <PhoneLink phone={data.phone} className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-white font-semibold" style={{ background: ACCENT }}>
              <Phone size={20} weight="fill" /> Get Your Free Estimate
            </PhoneLink>
          </div>
        </div>
      </section>

      {/* 10. WARRANTY DISPLAY */}
      <section className="relative z-10 py-20 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT}cc, ${ACCENT})` }} />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='40' height='40' fill='none'/%3E%3Cpath d='M0 0L40 40M40 0L0 40' stroke='%23000' stroke-width='0.5'/%3E%3C/svg%3E\")" }} />
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <ShieldCheck size={56} weight="fill" className="mx-auto mb-6 text-white/90" />
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-4">Warranty-Backed Quality</h2>
          <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">Every fence we install comes with our workmanship warranty plus manufacturer material guarantees — from 5 years to lifetime coverage.</p>
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {["Workmanship Guarantee", "Material Warranty", "Post Depth Standard", "Storm Damage Support"].map((item) => (
              <span key={item} className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-white/15 text-white border border-white/20">
                <CheckCircle size={16} weight="fill" /> {item}
              </span>
            ))}
          </div>
          <PhoneLink phone={data.phone} className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-white text-black font-bold text-lg hover:bg-white/90 transition-colors">
            <Phone size={22} weight="fill" /> Call {data.phone}
          </PhoneLink>
        </div>
      </section>

      {/* 11. GOOGLE REVIEWS + TESTIMONIALS */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #141210 50%, #1a1a1a 100%)" }} />
        <WoodGrainPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          {(data.googleRating || data.reviewCount) && (
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm">
                <div className="flex gap-0.5">{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={18} weight="fill" style={{ color: ACCENT }} />)}</div>
                <span className="text-lg font-bold text-white">{data.googleRating || "5.0"}</span>
                {data.reviewCount && <span className="text-sm text-slate-400">({data.reviewCount} reviews)</span>}
              </div>
            </div>
          )}
          <SectionHeader badge="Reviews" title="What Our Clients Say" accent={ACCENT} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <GlassCard key={i} className="p-6 h-full flex flex-col">
                <div className="flex gap-0.5 mb-4">{Array.from({ length: t.rating || 5 }).map((_, j) => <Star key={j} size={16} weight="fill" style={{ color: ACCENT }} />)}</div>
                <p className="text-slate-300 leading-relaxed flex-1 text-sm mb-4">&ldquo;{t.text}&rdquo;</p>
                <div className="pt-4 border-t border-white/5 flex items-center gap-2">
                  <CheckCircle size={14} weight="fill" style={{ color: ACCENT }} />
                  <span className="text-sm font-semibold text-white">{t.name}</span>
                  <span className="text-xs text-slate-500">Verified</span>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* 12. COMPETITOR COMPARISON */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #110f0c 50%, #1a1a1a 100%)" }} />
        <WallPostBackground opacity={0.02} accent={ACCENT} />
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Why Us" title={`${data.businessName} vs. The Competition`} accent={ACCENT} />
          <GlassCard className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-4 font-semibold text-white">Feature</th>
                    <th className="text-center p-4 font-semibold" style={{ color: ACCENT }}>{data.businessName}</th>
                    <th className="text-center p-4 font-semibold text-slate-500">Others</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_ROWS.map((row, i) => (
                    <tr key={row.feature} className={i % 2 === 0 ? "bg-white/[0.02]" : ""}>
                      <td className="p-4 text-slate-300 font-medium">{row.feature}</td>
                      <td className="p-4 text-center"><CheckCircle size={20} weight="fill" style={{ color: ACCENT }} className="mx-auto" /></td>
                      <td className="p-4 text-center text-slate-500">{row.them}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* 13. VIDEO PLACEHOLDER */}
      <section className="relative z-10 py-20 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #141210 100%)" }} />
        <WoodGrainPattern opacity={0.015} accent={ACCENT} />
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <div className="relative rounded-2xl overflow-hidden border border-white/10 aspect-video flex items-center justify-center" style={{ background: "rgba(0,0,0,0.3)" }}>
            <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20 cursor-pointer hover:bg-white/20 transition-colors">
              <div className="w-0 h-0 border-l-[18px] border-l-white border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent ml-1.5" />
            </div>
            <p className="absolute bottom-6 text-white/40 text-sm font-medium">Watch Our Installation Process</p>
          </div>
        </div>
      </section>

      {/* 14. SERVICE AREA */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #110f0c 50%, #1a1a1a 100%)" }} />
        <WoodGrainPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Service Area" title="Areas We Serve" accent={ACCENT} />
          <div className="text-center">
            <GlassCard className="p-8 inline-block">
              <div className="flex items-center gap-3 text-lg"><MapPin size={24} weight="duotone" style={{ color: ACCENT }} /><MapLink address={data.address} className="text-white font-semibold" /></div>
              <p className="text-slate-400 text-sm mt-2">&amp; Surrounding Areas</p>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* 15. HOURS */}
      {data.hours && (
        <section className="relative z-10 py-24 md:py-32 overflow-hidden">
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #141210 50%, #1a1a1a 100%)" }} />
          <WallPostBackground opacity={0.02} accent={ACCENT} />
          <div className="max-w-3xl mx-auto px-6 relative z-10">
            <SectionHeader badge="Hours" title="When We're Available" accent={ACCENT} />
            <div className="text-center">
              <ShimmerBorder accent={ACCENT}><div className="p-8">
                <Clock size={32} weight="duotone" style={{ color: ACCENT }} className="mx-auto mb-4" />
                <p className="text-slate-300 leading-relaxed whitespace-pre-line text-lg">{data.hours}</p>
                <p className="text-sm mt-4 font-semibold" style={{ color: ACCENT }}>Free Estimates Available</p>
              </div></ShimmerBorder>
            </div>
          </div>
        </section>
      )}

      {/* 16. FENCE QUIZ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #110f0c 50%, #1a1a1a 100%)" }} />
        <WoodGrainPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Get Started" title="What Do You Need?" subtitle="Tell us about your project and we will recommend the best solution." accent={ACCENT} />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "New Fence Installation", color: "#10b981", rec: "Full installation from consultation to cleanup." },
              { label: "Fence Repair", color: ACCENT, rec: "Fix damaged panels, posts, gates, or storm damage." },
              { label: "Gate Installation", color: WOOD_ACCENT, rec: "Custom gates for driveways, pools, and gardens." },
            ].map((opt) => (
              <GlassCard key={opt.label} className="p-6 text-center hover:border-white/20 transition-all cursor-pointer">
                <div className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: `${opt.color}15`, border: `1px solid ${opt.color}33` }}>
                  <Wall size={22} weight="duotone" style={{ color: opt.color }} />
                </div>
                <h4 className="text-sm font-bold text-white mb-2">{opt.label}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{opt.rec}</p>
              </GlassCard>
            ))}
          </div>
          <div className="text-center mt-8">
            <PhoneLink phone={data.phone} className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-white font-semibold" style={{ background: ACCENT }}>
              <Phone size={20} weight="fill" /> Call for Free Estimate
            </PhoneLink>
          </div>
        </div>
      </section>

      {/* 17. FAQ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #141210 50%, #1a1a1a 100%)" }} />
        <WoodGrainPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <SectionHeader badge="FAQ" title="Common Questions" accent={ACCENT} />
          <div className="space-y-3">{faqs.map((faq, i) => <AccordionItem key={i} question={faq.q} answer={faq.a} isOpen={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} />)}</div>
        </div>
      </section>

      {/* 18. CONTACT */}
      <section id="contact" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #110f0c 50%, #1a1a1a 100%)" }} />
        <WoodGrainPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: ACCENT, borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}>Contact Us</span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6 text-white">Get Your Free Estimate</h2>
              <p className="text-slate-400 leading-relaxed mb-8">Ready for a new fence or need repairs? Contact {data.businessName} today for a free, no-obligation estimate.</p>
              <div className="space-y-5">
                <div className="flex items-start gap-4"><div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: ACCENT_GLOW }}><MapPin size={20} weight="duotone" style={{ color: ACCENT }} /></div><div><p className="text-sm font-semibold text-white">Address</p><MapLink address={data.address} className="text-sm text-slate-400" /></div></div>
                <div className="flex items-start gap-4"><div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: ACCENT_GLOW }}><Phone size={20} weight="duotone" style={{ color: ACCENT }} /></div><div><p className="text-sm font-semibold text-white">Phone</p><PhoneLink phone={data.phone} className="text-sm text-slate-400" /></div></div>
                {data.hours && <div className="flex items-start gap-4"><div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: ACCENT_GLOW }}><Clock size={20} weight="duotone" style={{ color: ACCENT }} /></div><div><p className="text-sm font-semibold text-white">Hours</p><p className="text-sm text-slate-400 whitespace-pre-line">{data.hours}</p></div></div>}
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
                <div><label className="block text-sm text-slate-400 mb-1.5">Fence Type</label><select className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none text-sm"><option value="" className="bg-neutral-900">Select a type</option>{data.services.map((s) => <option key={s.name} value={s.name.toLowerCase().replace(/\s+/g, "-")} className="bg-neutral-900">{s.name}</option>)}</select></div>
                <div><label className="block text-sm text-slate-400 mb-1.5">Project Details</label><textarea rows={3} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none text-sm resize-none" placeholder="Describe your fencing project..." /></div>
                <MagneticButton className="w-full py-4 rounded-xl text-base font-semibold text-white flex items-center justify-center gap-2 cursor-pointer" style={{ background: ACCENT } as React.CSSProperties}>Send Request <ArrowRight size={18} weight="bold" /></MagneticButton>
              </form>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* 19. URGENCY / AVAILABILITY */}
      <section className="relative z-10 py-16 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #141210 100%)" }} />
        <WallPostBackground opacity={0.015} accent={ACCENT} />
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <GlassCard className="p-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="relative">
                <div className="w-3 h-3 rounded-full" style={{ background: "#10b981" }} />
                <div className="absolute inset-0 w-3 h-3 rounded-full animate-ping" style={{ background: "#10b981", opacity: 0.4 }} />
              </div>
              <span className="text-sm font-bold uppercase tracking-wider" style={{ color: "#10b981" }}>Crews Available Now</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Book Your Free On-Site Estimate</h3>
            <p className="text-slate-400 mb-6">Our scheduling fills up fast during peak season. Reserve your estimate today to lock in your preferred installation date.</p>
            <PhoneLink phone={data.phone} className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-white font-semibold" style={{ background: ACCENT }}>
              <Phone size={20} weight="fill" /> Schedule Free Estimate
            </PhoneLink>
          </GlassCard>
        </div>
      </section>

      {/* 20. CERTIFICATIONS */}
      <section className="relative z-10 py-16 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #141210 0%, #1a1a1a 100%)" }} />
        <WoodGrainPattern opacity={0.015} accent={ACCENT} />
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <div className="text-center mb-10">
            <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-3 px-4 py-1.5 rounded-full border" style={{ color: ACCENT, borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}>Credentials</span>
            <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight text-white">Licensed, Bonded &amp; Insured</h2>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {["Licensed Contractor", "Fully Bonded", "Liability Insured", "BBB Accredited", "Background Checked", "Manufacturer Certified"].map((badge) => (
              <div key={badge} className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-sm text-sm font-medium text-white">
                <ShieldCheck size={18} weight="duotone" style={{ color: ACCENT }} />
                {badge}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 21. WHAT WE FENCE */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #110f0c 50%, #1a1a1a 100%)" }} />
        <WallPostBackground opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Applications" title="What We Fence" accent={ACCENT} />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: HouseLine, label: "Backyards" },
              { icon: Buildings, label: "Commercial" },
              { icon: Wall, label: "Pool Enclosures" },
              { icon: TreeStructure, label: "Garden Borders" },
              { icon: Wall, label: "Property Lines" },
              { icon: HouseLine, label: "Pet Containment" },
              { icon: Buildings, label: "Parking Lots" },
              { icon: Wall, label: "Security Perimeters" },
            ].map((item) => (
              <GlassCard key={item.label} className="p-5 text-center">
                <div className="w-10 h-10 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ background: `${ACCENT}15`, border: `1px solid ${ACCENT}22` }}>
                  <item.icon size={20} weight="duotone" style={{ color: ACCENT }} />
                </div>
                <span className="text-sm font-semibold text-white">{item.label}</span>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* 22. FINANCING */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #141210 50%, #1a1a1a 100%)" }} />
        <WoodGrainPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Financing" title="Affordable Fencing Options" subtitle="Quality fencing fits every budget. Flexible payment plans available." accent={ACCENT} />
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Basic", price: "$49", per: "/month", desc: "Chain link or basic wood fencing for standard lots", features: ["Standard Materials", "Professional Install", "1-Year Warranty", "Permit Handling"] },
              { name: "Premium", price: "$89", per: "/month", desc: "Cedar, vinyl, or composite with custom design options", features: ["Premium Materials", "Custom Design", "5-Year Warranty", "Gate Included"], popular: true },
              { name: "Estate", price: "$149", per: "/month", desc: "Wrought iron, aluminum, or premium composite with decorative elements", features: ["Top-Tier Materials", "Architectural Design", "Lifetime Warranty", "Full Customization"] },
            ].map((tier) => (
              <GlassCard key={tier.name} className={`p-8 ${tier.popular ? "ring-1" : ""}`} style={tier.popular ? { borderColor: ACCENT } : undefined}>
                {tier.popular && <div className="text-center mb-4"><span className="px-4 py-1 rounded-full text-xs font-bold text-white" style={{ background: ACCENT }}>Most Popular</span></div>}
                <h3 className="text-xl font-bold text-white mb-1">{tier.name}</h3>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-extrabold" style={{ color: ACCENT }}>{tier.price}</span>
                  <span className="text-sm text-slate-500">{tier.per}</span>
                </div>
                <p className="text-sm text-slate-400 mb-6">{tier.desc}</p>
                <ul className="space-y-3 mb-8">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                      <CheckCircle size={16} weight="fill" style={{ color: ACCENT }} /> {f}
                    </li>
                  ))}
                </ul>
                <MagneticButton className={`w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer ${tier.popular ? "text-white" : "text-white border border-white/10"}`} style={tier.popular ? { background: ACCENT } as React.CSSProperties : undefined}>
                  Get Quote <ArrowRight size={16} weight="bold" />
                </MagneticButton>
              </GlassCard>
            ))}
          </div>
          <p className="text-center text-xs text-slate-500 mt-6">0% APR financing available. Subject to credit approval. Prices are estimates based on typical project sizes.</p>
        </div>
      </section>

      {/* 23. WHY CHOOSE US */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #110f0c 50%, #1a1a1a 100%)" }} />
        <WallPostBackground opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Why Us" title="The Right Choice" accent={ACCENT} />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: ShieldCheck, title: "Licensed & Insured", desc: "Fully licensed, bonded, and insured for your peace of mind. We handle all permits." },
              { icon: Ruler, title: "Custom Designs", desc: "We design fences to match your property's style, terrain, and specific needs." },
              { icon: Trophy, title: "Premium Materials", desc: "We only use top-grade materials from trusted manufacturers with warranties." },
              { icon: Timer, title: "Fast Turnaround", desc: "Most residential fencing projects completed in 1-3 days after material delivery." },
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

      {/* 24. VIDEO TESTIMONIAL PLACEHOLDER */}
      <section className="relative z-10 py-20 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #141210 100%)" }} />
        <WoodGrainPattern opacity={0.015} accent={ACCENT} />
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <div className="text-center mb-8">
            <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-3 px-4 py-1.5 rounded-full border" style={{ color: ACCENT, borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}>Watch</span>
            <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight text-white">See Our Work in Action</h2>
          </div>
          <div className="relative rounded-2xl overflow-hidden border border-white/10 aspect-video flex items-center justify-center" style={{ background: "rgba(0,0,0,0.3)" }}>
            <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20 cursor-pointer hover:bg-white/20 transition-colors">
              <div className="w-0 h-0 border-l-[18px] border-l-white border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent ml-1.5" />
            </div>
            <p className="absolute bottom-6 text-white/40 text-sm font-medium">Watch Our Installation Process</p>
          </div>
        </div>
      </section>

      {/* 25. GUARANTEE */}
      <section className="relative z-10 py-16 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #141210 100%)" }} />
        <WoodGrainPattern opacity={0.015} accent={ACCENT} />
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <ShimmerBorder accent={ACCENT}><div className="p-8 md:p-12">
            <ShieldCheck size={48} weight="fill" style={{ color: ACCENT }} className="mx-auto mb-4" />
            <h2 className="text-2xl md:text-4xl font-extrabold text-white mb-4">Our Quality Guarantee</h2>
            <p className="text-slate-400 leading-relaxed max-w-2xl mx-auto text-lg">Every fence by {data.businessName} is built to last. We use premium materials, proper post depth, and expert craftsmanship backed by our workmanship warranty.</p>
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              {["Quality Materials", "Expert Installation", "Free Estimates", "Warranty Included", "Full Cleanup"].map((item) => <span key={item} className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border" style={{ color: ACCENT, borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}><CheckCircle size={16} weight="fill" /> {item}</span>)}
            </div>
          </div></ShimmerBorder>
        </div>
      </section>

      {/* 20. FOOTER */}
      <footer className="relative z-10 border-t border-white/5 py-10 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #111 100%)" }} />
        <WoodGrainPattern opacity={0.015} accent={ACCENT} />
        <div className="mx-auto max-w-6xl px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div><div className="flex items-center gap-2 mb-3"><Wall size={22} weight="fill" style={{ color: ACCENT }} /><span className="text-lg font-bold text-white">{data.businessName}</span></div><p className="text-sm text-slate-500 leading-relaxed">{data.about.length > 120 ? data.about.slice(0, 120).trim() + "..." : data.about}</p></div>
            <div><h4 className="text-sm font-semibold text-white mb-3">Quick Links</h4><div className="space-y-2">{["Services", "Materials", "About", "Projects", "Contact"].map((link) => <a key={link} href={`#${link.toLowerCase()}`} className="block text-sm text-slate-500 hover:text-white transition-colors">{link}</a>)}</div></div>
            <div><h4 className="text-sm font-semibold text-white mb-3">Contact</h4><div className="space-y-2 text-sm text-slate-500"><p><PhoneLink phone={data.phone} /></p><p><MapLink address={data.address} /></p>{data.socialLinks && Object.entries(data.socialLinks).map(([platform, url]) => <a key={platform} href={url} target="_blank" rel="noopener noreferrer" className="block hover:text-white transition-colors capitalize">{platform}</a>)}</div></div>
          </div>
          <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-500"><Wall size={14} weight="fill" style={{ color: ACCENT }} /><span>{data.businessName} &copy; {new Date().getFullYear()}</span></div>
            <div className="flex items-center gap-2 text-xs text-slate-600"><BluejayLogo className="w-4 h-4" /><span>Created by <a href="https://bluejayportfolio.com" target="_blank" rel="noopener noreferrer" style={{textDecoration:"underline"}}>bluejayportfolio.com</a></span></div>
          </div>
        </div>
      </footer>

      <ClaimBanner businessName={data.businessName} accentColor={ACCENT} prospectId={data.id} />
      <div className="h-14 md:h-28" />
    </main>
  );
}
