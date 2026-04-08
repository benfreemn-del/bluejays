"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  AnimatePresence,
} from "framer-motion";
import {
  Tree,
  Leaf,
  Sun,
  Drop,
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
  Flower,
  Shovel,
  Mountains,
  Park,
} from "@phosphor-icons/react";
import type { GeneratedSiteData } from "@/lib/generator";
import BluejayLogo from "../BluejayLogo";
import { MapLink, PhoneLink } from "@/components/templates/MapLink";

/* ───────────────────────── SPRING CONFIGS ───────────────────────── */
const spring = { type: "spring" as const, stiffness: 100, damping: 20 };
const springFast = { type: "spring" as const, stiffness: 200, damping: 25 };

/* ───────────────────────── COLORS ───────────────────────── */
const CHARCOAL = "#1a1a1a";
const DEFAULT_GREEN = "#15803d";
const EARTH_BROWN = "#92400e";

function getAccent(accentColor?: string) {
  const c = accentColor || DEFAULT_GREEN;
  return {
    PRIMARY: c,
    PRIMARY_GLOW: `${c}26`,
    EARTH: EARTH_BROWN,
  };
}

/* ───────────────────────── SERVICE ICON MAP ───────────────────────── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SERVICE_ICON_MAP: Record<string, any> = {
  lawn: Park,
  mow: Park,
  tree: Tree,
  shrub: Tree,
  prun: Tree,
  plant: Flower,
  garden: Flower,
  irrig: Drop,
  sprinkler: Drop,
  water: Drop,
  patio: Mountains,
  hardscape: Mountains,
  mulch: Shovel,
  soil: Shovel,
  grade: Shovel,
  drain: Drop,
  landscape: Mountains,
  design: Mountains,
  snow: Shovel,
  fence: Park,
  light: Sun,
  season: Leaf,
};

function getServiceIcon(serviceName: string) {
  const lower = serviceName.toLowerCase();
  for (const [key, Icon] of Object.entries(SERVICE_ICON_MAP)) {
    if (lower.includes(key)) return Icon;
  }
  return Tree;
}

/* ───────────────────────── STOCK FALLBACK IMAGES ───────────────────────── */
const STOCK_HERO = "https://images.unsplash.com/photo-1558904541-efa843a96f01?w=1400&q=80";
const STOCK_ABOUT = "https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?w=600&q=80";
const STOCK_GALLERY = [
  "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=600&q=80",
  "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80",
  "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80",
  "https://images.unsplash.com/photo-1558904541-efa843a96f01?w=800&q=80",
  "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80",
  "https://images.unsplash.com/photo-1560749003-f4b1e17e2dff?w=600&q=80",
  "https://images.unsplash.com/photo-1588880331179-bc9b93a8cb5e?w=600&q=80",
  "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&q=80",
];
/* Before/After pairs for showcase */
const STOCK_BEFORE_AFTER = [
  { before: "https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?w=600&q=80", after: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=600&q=80" },
  { before: "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=600&q=80", after: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80" },
];

/* ───────────────────────── FLOATING LEAF PARTICLES ───────────────────────── */
function FloatingLeaves({ accent }: { accent: string }) {
  const particles = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 8,
    duration: 7 + Math.random() * 8,
    size: 2 + Math.random() * 4,
    opacity: 0.1 + Math.random() * 0.25,
    isBrown: Math.random() > 0.6,
  }));

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden hidden md:block">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{ left: `${p.x}%`, width: p.size, height: p.size, background: p.isBrown ? EARTH_BROWN : accent, willChange: "transform, opacity" }}
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

/* ───────────────────────── LEAF NATURE SVG PATTERN ───────────────────────── */
function NaturePattern({ opacity = 0.03, accent }: { opacity?: number; accent: string }) {
  const patternId = `naturePatternV2Prev-${accent.replace("#", "")}`;
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }}>
      <defs>
        <pattern id={patternId} width="100" height="100" patternUnits="userSpaceOnUse">
          <path d="M50 10 Q30 30 50 50 Q70 30 50 10Z" fill="none" stroke={accent} strokeWidth="0.5" />
          <path d="M20 60 Q10 75 20 90 Q30 75 20 60Z" fill="none" stroke={accent} strokeWidth="0.4" />
          <path d="M80 55 Q70 70 80 85 Q90 70 80 55Z" fill="none" stroke={accent} strokeWidth="0.4" />
          <circle cx="50" cy="50" r="1.5" fill={accent} opacity="0.3" />
          <circle cx="20" cy="75" r="1" fill={accent} opacity="0.2" />
          <circle cx="80" cy="70" r="1" fill={accent} opacity="0.2" />
          <line x1="50" y1="50" x2="50" y2="10" stroke={accent} strokeWidth="0.3" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  );
}

/* ───────────────────────── ORGANIC WAVE SVG ───────────────────────── */
function OrganicWave({ opacity = 0.03, accent }: { opacity?: number; accent: string }) {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }} viewBox="0 0 1000 600" preserveAspectRatio="none">
      <path d="M0 400 C 200 350 400 450 600 380 C 800 310 900 420 1000 370" stroke={accent} strokeWidth="1.5" fill="none" />
      <path d="M0 500 C 300 460 500 530 700 480 C 850 440 950 510 1000 490" stroke={EARTH_BROWN} strokeWidth="1" fill="none" />
    </svg>
  );
}

/* ───────────────────────── HERO NATURE SVG ───────────────────────── */
function HeroNatureSVG({ accent }: { accent: string }) {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1200 800" preserveAspectRatio="none" style={{ opacity: 0.04 }}>
      <motion.path d="M200 700 L200 400 Q200 300 250 350 Q300 400 300 350 Q350 200 200 400" stroke={accent} strokeWidth="2" fill="none" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2.5, ease: "easeInOut" }} />
      <motion.path d="M800 700 C800 500 750 400 820 350 C890 300 850 450 900 350" stroke={EARTH_BROWN} strokeWidth="1.5" fill="none" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2, ease: "easeInOut", delay: 0.4 }} />
      <motion.circle cx="250" cy="300" r="5" fill={accent} animate={{ opacity: [0, 1, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 2.5 }} />
      <motion.circle cx="850" cy="320" r="4" fill={EARTH_BROWN} animate={{ opacity: [0, 1, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 3 }} />
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
    return (<motion.a href={href} ref={ref as unknown as React.Ref<HTMLAnchorElement>} style={{ x: springX, y: springY, willChange: "transform", ...style }} onMouseMove={handleMouseMove as unknown as React.MouseEventHandler<HTMLAnchorElement>} onMouseLeave={handleMouseLeave} className={className} whileTap={{ scale: 0.97 }}>{children}</motion.a>);
  }
  return (<motion.button ref={ref} style={{ x: springX, y: springY, willChange: "transform", ...style }} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} onClick={onClick} className={className} whileTap={{ scale: 0.97 }}>{children}</motion.button>);
}

/* ───────────────────────── SHIMMER BORDER ───────────────────────── */
function ShimmerBorder({ children, className = "", accent }: { children: React.ReactNode; className?: string; accent: string }) {
  return (
    <div className={`relative rounded-2xl p-[1px] overflow-hidden ${className}`}>
      <motion.div className="absolute inset-0 rounded-2xl" style={{ background: `conic-gradient(from 0deg, transparent, ${accent}, transparent, ${EARTH_BROWN}, transparent)`, willChange: "transform" }} animate={{ rotate: [0, 360] }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} />
      <div className="relative rounded-2xl bg-[#141414] z-10">{children}</div>
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
        {isOpen && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={spring} className="overflow-hidden"><p className="px-5 pb-5 md:px-6 md:pb-6 text-slate-400 leading-relaxed">{answer}</p></motion.div>)}
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

/* ───────────────────────── CLAIM BANNER ───────────────────────── */
function ClaimBanner({ businessName, accentColor, prospectId }: { businessName: string; accentColor: string; prospectId: string }) {
  const [timeLeft, setTimeLeft] = useState("");
  useEffect(() => {
    const expiry = new Date(); expiry.setDate(expiry.getDate() + 7);
    const tick = () => { const diff = expiry.getTime() - Date.now(); if (diff <= 0) { setTimeLeft("EXPIRED"); return; } setTimeLeft(`${Math.floor(diff / 86400000)}d ${Math.floor((diff % 86400000) / 3600000)}h ${Math.floor((diff % 3600000) / 60000)}m`); };
    tick(); const interval = setInterval(tick, 60000); return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="bg-[#1a1a1a]/90 backdrop-blur-sm border-t border-white/10 px-4 py-2 flex items-center justify-center gap-4">
        <p className="text-xs text-slate-400"><span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1.5 animate-pulse" />47 businesses in your area upgraded their website this month</p>
        {timeLeft && timeLeft !== "EXPIRED" && <p className="text-xs font-bold" style={{ color: accentColor }}>Preview expires in {timeLeft}</p>}
      </div>
      <div className="px-6 py-4 flex items-center justify-between gap-4" style={{ background: `linear-gradient(135deg, ${accentColor}20, ${accentColor}10)`, borderTop: `1px solid ${accentColor}30` }}>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">This website was built for {businessName}</p>
          <p className="text-xs text-slate-400">Claim it before we offer it to a competitor</p>
        </div>
        <a href={`/claim/${prospectId}`} className="shrink-0 h-11 px-6 rounded-full text-white text-sm font-bold flex items-center gap-2 hover:shadow-lg transition-all duration-300" style={{ background: accentColor }}>
          Claim Your Website
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
        </a>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN PREVIEW COMPONENT — GALLERY-HEAVY LANDSCAPING WITH BEFORE/AFTER
   ═══════════════════════════════════════════════════════════════════ */
export default function V2LandscapingPreview({ data }: { data: GeneratedSiteData }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const { PRIMARY, PRIMARY_GLOW } = getAccent(data.accentColor);

  const heroImage = data.photos?.[0] || STOCK_HERO;
  const aboutImage = data.photos?.[1] || STOCK_ABOUT;
  const galleryImages = data.photos?.length > 2 ? data.photos.slice(2, 10) : STOCK_GALLERY;

  const processSteps = [
    { step: "01", title: "Free Estimate", desc: `We visit your property, discuss your vision, and provide a detailed, no-obligation quote.` },
    { step: "02", title: "Custom Design", desc: `Our designers create a landscape plan tailored to your property, style, and budget.` },
    { step: "03", title: "Professional Install", desc: `Our experienced crew transforms your outdoor space with precision and craftsmanship.` },
    { step: "04", title: "Ongoing Care", desc: `We offer maintenance plans to keep your landscape looking pristine year-round.` },
  ];

  const faqs = [
    { q: `What landscaping services does ${data.businessName} offer?`, a: `We provide a comprehensive range of services including ${data.services.slice(0, 3).map(s => s.name).join(", ")}, and more. From design to maintenance, we handle it all.` },
    { q: "Do you offer free estimates?", a: `Absolutely! ${data.businessName} provides free, no-obligation estimates for all landscaping projects. We'll visit your property and discuss your goals before providing a transparent quote.` },
    { q: "How long does a typical landscaping project take?", a: "Project timelines vary based on scope. A basic lawn renovation might take 1-2 days, while a full landscape redesign can take 1-3 weeks. We'll provide a clear timeline with your estimate." },
    { q: "Do you offer seasonal maintenance plans?", a: `Yes! We offer weekly, bi-weekly, and seasonal maintenance packages to keep your landscape looking its best year-round. Contact ${data.businessName} for plan details and pricing.` },
  ];

  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden" style={{ background: CHARCOAL, color: "#f1f5f9" }}>
      <FloatingLeaves accent={PRIMARY} />

      {/* ══════════════════ 1. NAV ══════════════════ */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-4">
          <GlassCard className="flex items-center justify-between px-4 md:px-6 py-3">
            <div className="flex items-center gap-2">
              <Tree size={24} weight="fill" style={{ color: PRIMARY }} />
              <span className="text-lg font-bold tracking-tight text-white">{data.businessName}</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
              <a href="#portfolio" className="hover:text-white transition-colors">Portfolio</a>
              <a href="#services" className="hover:text-white transition-colors">Services</a>
              <a href="#about" className="hover:text-white transition-colors">About</a>
              <a href="#contact" className="hover:text-white transition-colors">Contact</a>
            </div>
            <div className="flex items-center gap-3">
              <MagneticButton className="px-4 md:px-5 py-2 rounded-full text-sm font-semibold text-white transition-colors cursor-pointer" style={{ background: PRIMARY } as React.CSSProperties}>
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
                  {[{ label: "Portfolio", href: "#portfolio" }, { label: "Services", href: "#services" }, { label: "About", href: "#about" }, { label: "Contact", href: "#contact" }].map((link) => (
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
          <img src={heroImage} alt={`${data.businessName} landscaping`} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-transparent to-transparent" />
        </div>
        <HeroNatureSVG accent={PRIMARY} />

        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6 w-full">
          <div className="max-w-2xl space-y-8">
            <div>
              <p className="text-sm uppercase tracking-widest mb-4" style={{ color: PRIMARY }}>Professional Landscaping</p>
              <h1 className="text-3xl md:text-6xl tracking-tighter leading-none font-bold text-white" style={{ textShadow: "0 2px 20px rgba(0,0,0,0.7)" }}>{data.tagline}</h1>
            </div>
            <p className="text-lg text-slate-300 max-w-md leading-relaxed">{data.about.length > 160 ? data.about.slice(0, 160).trim() + "..." : data.about}</p>
            <div className="flex flex-wrap gap-4">
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white flex items-center gap-2 cursor-pointer" style={{ background: PRIMARY } as React.CSSProperties}>
                Get Free Estimate <ArrowRight size={18} weight="bold" />
              </MagneticButton>
              <MagneticButton href={`tel:${data.phone.replace(/\D/g, "")}`} className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/20 flex items-center gap-2 cursor-pointer backdrop-blur-sm">
                <Phone size={18} weight="duotone" /><PhoneLink phone={data.phone} />
              </MagneticButton>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-slate-300">
              <span className="flex items-center gap-2"><MapPin size={16} weight="duotone" style={{ color: PRIMARY }} /><MapLink address={data.address} /></span>
              <span className="flex items-center gap-2"><Leaf size={16} weight="duotone" style={{ color: PRIMARY }} />Licensed &amp; Insured</span>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════ 3. STATS ══════════════════ */}
      <section className="relative z-10 py-16 overflow-hidden border-y" style={{ borderColor: `${PRIMARY}1a` }}>
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #111510 0%, #1a1a1a 100%)" }} />
        <NaturePattern opacity={0.02} accent={PRIMARY} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] rounded-full blur-[180px]" style={{ background: `${PRIMARY}08` }} /></div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {data.stats.map((stat, i) => {
              const statIcons = [Tree, Leaf, Star, CheckCircle];
              const Icon = statIcons[i % statIcons.length];
              return (<div key={stat.label} className="text-center"><div className="flex items-center justify-center gap-2 mb-2"><Icon size={22} weight="fill" style={{ color: PRIMARY }} /><span className="text-3xl md:text-4xl font-extrabold text-white">{stat.value}</span></div><span className="text-slate-500 text-sm font-medium tracking-wide uppercase">{stat.label}</span></div>);
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════ 4. BEFORE / AFTER SHOWCASE ══════════════════ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0e140d 50%, #1a1a1a 100%)" }} />
        <NaturePattern opacity={0.02} accent={PRIMARY} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[20%] left-[10%] w-[500px] h-[500px] rounded-full blur-[200px]" style={{ background: `${PRIMARY}06` }} /></div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Transformations" title="Before & After" subtitle={`See the dramatic transformations ${data.businessName} delivers for our clients.`} accent={PRIMARY} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {STOCK_BEFORE_AFTER.map((pair, i) => (
              <div key={i} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative rounded-xl overflow-hidden border border-white/[0.06]">
                    <img src={pair.before} alt={`Before ${i + 1}`} className="w-full h-48 object-cover" />
                    <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold bg-red-500/80 text-white backdrop-blur-sm">Before</div>
                  </div>
                  <div className="relative rounded-xl overflow-hidden border border-white/[0.06]">
                    <img src={pair.after} alt={`After ${i + 1}`} className="w-full h-48 object-cover" />
                    <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold text-white backdrop-blur-sm" style={{ background: `${PRIMARY}cc` }}>After</div>
                  </div>
                </div>
                <p className="text-sm text-slate-400 text-center">Complete landscape transformation by {data.businessName}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ 5. PORTFOLIO GALLERY ══════════════════ */}
      <section id="portfolio" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #11150e 50%, #1a1a1a 100%)" }} />
        <NaturePattern opacity={0.02} accent={PRIMARY} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[20%] right-[10%] w-[500px] h-[500px] rounded-full blur-[200px]" style={{ background: `${PRIMARY}06` }} /></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Our Work" title="Project Gallery" subtitle={`Browse our portfolio of completed landscaping projects by ${data.businessName}.`} accent={PRIMARY} />
          <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
            {galleryImages.map((src, i) => (
              <div key={i} className="group relative rounded-2xl overflow-hidden border border-white/[0.06] hover:border-opacity-30 transition-all duration-500 break-inside-avoid">
                <img src={src} alt={`Landscape project ${i + 1}`} className={`w-full object-cover transition-transform duration-700 group-hover:scale-105 ${i % 3 === 0 ? "h-80" : i % 3 === 1 ? "h-64" : "h-72"}`} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="flex items-center gap-2"><Tree size={14} weight="fill" style={{ color: PRIMARY }} /><span className="text-xs text-white/80 font-medium">{data.businessName}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ 6. SERVICES ══════════════════ */}
      <section id="services" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #121510 50%, #1a1a1a 100%)" }} />
        <OrganicWave opacity={0.025} accent={PRIMARY} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[10%] right-[5%] w-[500px] h-[500px] rounded-full blur-[160px]" style={{ background: `${PRIMARY}08` }} />
        </div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Services" title="Landscaping Services" subtitle={`${data.businessName} provides expert outdoor solutions from design to ongoing maintenance.`} accent={PRIMARY} />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.services.map((service, i) => {
              const Icon = getServiceIcon(service.name);
              return (
                <div key={service.name} className="group relative p-7 rounded-2xl border border-white/[0.06] hover:border-opacity-30 transition-all duration-500 overflow-hidden bg-white/[0.02]">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: `radial-gradient(circle at 50% 0%, ${PRIMARY}15, transparent 70%)` }} />
                  <div className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `linear-gradient(to right, transparent, ${PRIMARY}4d, transparent)` }} />
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-5">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center border" style={{ background: PRIMARY_GLOW, borderColor: `${PRIMARY}33` }}><Icon size={24} weight="duotone" style={{ color: PRIMARY }} /></div>
                      <span className="text-xs font-mono text-slate-600">{String(i + 1).padStart(2, "0")}</span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{service.name}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{service.description || ""}</p>
                    {service.price && <p className="text-sm font-semibold mt-3" style={{ color: PRIMARY }}>{service.price}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════ 7. ABOUT ══════════════════ */}
      <section id="about" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0d120b 50%, #1a1a1a 100%)" }} />
        <OrganicWave opacity={0.02} accent={PRIMARY} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[20%] left-[10%] w-[500px] h-[500px] rounded-full blur-[180px]" style={{ background: `${PRIMARY}06` }} /></div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="relative">
              <div className="rounded-2xl overflow-hidden border border-white/10"><img src={aboutImage} alt={`${data.businessName} team`} className="w-full h-[400px] object-cover" /></div>
              <div className="absolute -bottom-4 -right-4 md:bottom-6 md:-right-6">
                <div className="px-5 py-3 rounded-xl backdrop-blur-md border text-white font-bold text-sm shadow-lg" style={{ background: `${PRIMARY}e6`, borderColor: `${PRIMARY}80` }}>
                  {data.stats[0] ? `${data.stats[0].value} ${data.stats[0].label}` : "Trusted Experts"}
                </div>
              </div>
            </div>
            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: PRIMARY, borderColor: `${PRIMARY}33`, background: `${PRIMARY}0d` }}>About Us</span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6 text-white">Crafting Outdoor Paradise</h2>
              <p className="text-slate-400 leading-relaxed mb-8">{data.about}</p>
              <div className="grid grid-cols-2 gap-4">
                {[{ icon: ShieldCheck, label: "Licensed & Insured" }, { icon: Leaf, label: "Eco-Friendly" }, { icon: Star, label: "5-Star Rated" }, { icon: Clock, label: "On-Time, Always" }].map((badge) => (
                  <GlassCard key={badge.label} className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: PRIMARY_GLOW }}><badge.icon size={20} weight="duotone" style={{ color: PRIMARY }} /></div>
                    <span className="text-sm font-semibold text-white">{badge.label}</span>
                  </GlassCard>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════ 8. PROCESS ══════════════════ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #121510 50%, #1a1a1a 100%)" }} />
        <NaturePattern opacity={0.025} accent={PRIMARY} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] rounded-full blur-[180px]" style={{ background: `${EARTH_BROWN}06` }} /></div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Our Process" title="How We Work" accent={PRIMARY} />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {processSteps.map((step, i) => (
              <div key={step.step} className="relative">
                {i < processSteps.length - 1 && <div className="hidden lg:block absolute top-10 left-[calc(50%+40px)] w-[calc(100%-80px)] h-px" style={{ background: `linear-gradient(to right, ${PRIMARY}33, ${PRIMARY}11)` }} />}
                <GlassCard className="p-6 text-center relative">
                  <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-black" style={{ background: `linear-gradient(135deg, ${PRIMARY}22, ${PRIMARY}0a)`, color: PRIMARY, border: `1px solid ${PRIMARY}33` }}>{step.step}</div>
                  <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
                </GlassCard>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ 9. TESTIMONIALS ══════════════════ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #121510 50%, #1a1a1a 100%)" }} />
        <NaturePattern opacity={0.02} accent={PRIMARY} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[20%] right-[15%] w-[400px] h-[400px] rounded-full blur-[160px]" style={{ background: `${PRIMARY}06` }} /></div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Testimonials" title="What Homeowners Say" accent={PRIMARY} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {data.testimonials.map((t, i) => (
              <GlassCard key={i} className="p-6 h-full flex flex-col">
                <div className="flex gap-0.5 mb-4">{Array.from({ length: t.rating || 5 }).map((_, j) => (<Star key={j} size={16} weight="fill" style={{ color: PRIMARY }} />))}</div>
                <p className="text-slate-300 leading-relaxed flex-1 text-sm mb-4">&ldquo;{t.text}&rdquo;</p>
                <div className="pt-4 border-t border-white/5"><span className="text-sm font-semibold text-white">{t.name}</span></div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ 10. CTA ══════════════════ */}
      <section className="relative z-10 py-20 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${PRIMARY}, ${PRIMARY}cc, ${PRIMARY})` }} />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='40' height='40' fill='none'/%3E%3Cpath d='M0 0L40 40M40 0L0 40' stroke='%23000' stroke-width='0.5'/%3E%3C/svg%3E\")" }} />
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <Tree size={48} weight="fill" className="mx-auto mb-6 text-white/70" />
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-4">Transform Your Outdoor Space Today</h2>
          <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">Ready for the yard of your dreams? {data.businessName} delivers stunning results with every project. Call now for a free estimate.</p>
          <PhoneLink phone={data.phone} className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-white font-bold text-lg hover:bg-white/90 transition-colors" style={{ color: PRIMARY }}>
            <Phone size={22} weight="fill" />{data.phone}
          </PhoneLink>
        </div>
      </section>

      {/* ══════════════════ 11. SERVICE AREAS ══════════════════ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0d120b 50%, #1a1a1a 100%)" }} />
        <NaturePattern opacity={0.02} accent={PRIMARY} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Coverage Area" title="Areas We Serve" accent={PRIMARY} />
          <div className="text-center">
            <GlassCard className="p-8 inline-block">
              <div className="flex items-center gap-3 text-lg"><MapPin size={24} weight="duotone" style={{ color: PRIMARY }} /><MapLink address={data.address} className="text-white font-semibold" /></div>
              <p className="text-slate-400 text-sm mt-2">&amp; Surrounding Communities</p>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* ══════════════════ 12. HOURS ══════════════════ */}
      {data.hours && (
        <section className="relative z-10 py-24 md:py-32 overflow-hidden">
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #121510 50%, #1a1a1a 100%)" }} />
          <OrganicWave opacity={0.02} accent={PRIMARY} />
          <div className="max-w-3xl mx-auto px-6 relative z-10">
            <SectionHeader badge="Hours" title="Business Hours" accent={PRIMARY} />
            <div className="text-center">
              <ShimmerBorder accent={PRIMARY}><div className="p-8"><Clock size={32} weight="duotone" style={{ color: PRIMARY }} className="mx-auto mb-4" /><p className="text-slate-300 leading-relaxed whitespace-pre-line text-lg">{data.hours}</p><p className="text-sm mt-4 font-semibold" style={{ color: PRIMARY }}>Seasonal hours may vary</p></div></ShimmerBorder>
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════ 13. FAQ ══════════════════ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #121510 50%, #1a1a1a 100%)" }} />
        <OrganicWave opacity={0.02} accent={PRIMARY} />
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <SectionHeader badge="FAQ" title="Common Questions" accent={PRIMARY} />
          <div className="space-y-3">
            {faqs.map((faq, i) => (<AccordionItem key={i} question={faq.q} answer={faq.a} isOpen={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} />))}
          </div>
        </div>
      </section>

      {/* ══════════════════ 14. CONTACT ══════════════════ */}
      <section id="contact" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0d120b 50%, #1a1a1a 100%)" }} />
        <NaturePattern opacity={0.02} accent={PRIMARY} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: PRIMARY, borderColor: `${PRIMARY}33`, background: `${PRIMARY}0d` }}>Contact Us</span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6 text-white">Get Your Free Estimate</h2>
              <p className="text-slate-400 leading-relaxed mb-8">Ready to transform your property? Contact {data.businessName} today for a free, no-obligation estimate.</p>
              <div className="space-y-5">
                <div className="flex items-start gap-4"><div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: PRIMARY_GLOW }}><MapPin size={20} weight="duotone" style={{ color: PRIMARY }} /></div><div><p className="text-sm font-semibold text-white">Address</p><MapLink address={data.address} className="text-sm text-slate-400" /></div></div>
                <div className="flex items-start gap-4"><div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: PRIMARY_GLOW }}><Phone size={20} weight="duotone" style={{ color: PRIMARY }} /></div><div><p className="text-sm font-semibold text-white">Phone</p><PhoneLink phone={data.phone} className="text-sm text-slate-400" /></div></div>
                <div className="flex items-start gap-4"><div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: PRIMARY_GLOW }}><Tree size={20} weight="duotone" style={{ color: PRIMARY }} /></div><div><p className="text-sm font-semibold text-white">Free Estimates</p><p className="text-sm text-slate-400">No-obligation quotes for all projects</p></div></div>
                {data.hours && (<div className="flex items-start gap-4"><div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: PRIMARY_GLOW }}><Clock size={20} weight="duotone" style={{ color: PRIMARY }} /></div><div><p className="text-sm font-semibold text-white">Hours</p><p className="text-sm text-slate-400 whitespace-pre-line">{data.hours}</p></div></div>)}
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
                <div><label className="block text-sm text-slate-400 mb-1.5">Service Needed</label>
                  <select className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none text-sm">
                    <option value="" className="bg-neutral-900">Select a service</option>
                    {data.services.map((s) => (<option key={s.name} value={s.name.toLowerCase().replace(/\s+/g, "-")} className="bg-neutral-900">{s.name}</option>))}
                  </select>
                </div>
                <div><label className="block text-sm text-slate-400 mb-1.5">Tell Us About Your Project</label><textarea rows={4} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none text-sm resize-none" placeholder="Describe your landscaping goals..." /></div>
                <MagneticButton className="w-full py-4 rounded-xl text-base font-semibold text-white flex items-center justify-center gap-2 cursor-pointer" style={{ background: PRIMARY } as React.CSSProperties}>
                  Get Free Estimate <ArrowRight size={18} weight="bold" />
                </MagneticButton>
              </form>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* ══════════════════ 15. FOOTER ══════════════════ */}
      <footer className="relative z-10 border-t border-white/5 py-10 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #111 100%)" }} />
        <NaturePattern opacity={0.015} accent={PRIMARY} />
        <div className="mx-auto max-w-6xl px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3"><Tree size={22} weight="fill" style={{ color: PRIMARY }} /><span className="text-lg font-bold text-white">{data.businessName}</span></div>
              <p className="text-sm text-slate-500 leading-relaxed">{data.about.length > 120 ? data.about.slice(0, 120).trim() + "..." : data.about}</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-3">Quick Links</h4>
              <div className="space-y-2">{["Portfolio", "Services", "About", "Contact"].map((link) => (<a key={link} href={`#${link.toLowerCase()}`} className="block text-sm text-slate-500 hover:text-white transition-colors">{link}</a>))}</div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-3">Contact</h4>
              <div className="space-y-2 text-sm text-slate-500">
                <p><PhoneLink phone={data.phone} /></p>
                <p><MapLink address={data.address} /></p>
                {data.socialLinks && Object.entries(data.socialLinks).map(([platform, url]) => (<a key={platform} href={url} target="_blank" rel="noopener noreferrer" className="block hover:text-white transition-colors capitalize">{platform}</a>))}
              </div>
            </div>
          </div>
          <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-500"><Tree size={14} weight="fill" style={{ color: PRIMARY }} /><span>{data.businessName} &copy; {new Date().getFullYear()}</span></div>
            <div className="flex items-center gap-2 text-xs text-slate-600"><BluejayLogo className="w-4 h-4" /><span>Website created by Bluejay Business Solutions</span></div>
          </div>
        </div>
      </footer>

      <ClaimBanner businessName={data.businessName} accentColor={PRIMARY} prospectId={data.id} />
      <div className="h-28" />
    </main>
  );
}
