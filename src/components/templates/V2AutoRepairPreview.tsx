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
  Wrench,
  GasPump,
  Gear,
  CarSimple,
  Gauge,
  Drop,
  Thermometer,
  Fan,
  Star,
  ShieldCheck,
  Phone,
  MapPin,
  Clock,
  ArrowRight,
  CaretDown,
  X,
  List,
  CheckCircle,
  CalendarCheck,
  Certificate,
  Tag,
  Trophy,
  Lightning,
  Speedometer,
  Envelope,
  CurrencyDollar,
  Play,
  Timer,
  Engine,
  Warning,
  Eye,
  Handshake,
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
const DARK = "#111111";
const RED = "#dc2626";
const RED_LIGHT = "#ef4444";
const RED_GLOW = "rgba(220, 38, 38, 0.15)";
const SILVER = "#94a3b8";
const DARK_CARD = "#1a1a1a";

function getAccent(accentColor?: string) {
  const c = accentColor || RED;
  return { ACCENT: c, ACCENT_GLOW: `${c}26`, SILVER };
}

/* ───────────────────────── SERVICE ICON MAP ───────────────────────── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SERVICE_ICON_MAP: Record<string, any> = {
  oil: Drop, brake: Gauge, engine: Gear, transmission: Gear,
  tire: CarSimple, alignment: CarSimple, diagnostic: Speedometer,
  ac: Fan, heat: Thermometer, exhaust: GasPump, battery: Lightning,
  inspection: ShieldCheck, tune: Wrench, electric: Lightning,
  suspension: CarSimple, repair: Wrench,
};

function getServiceIcon(serviceName: string) {
  const lower = serviceName.toLowerCase();
  for (const [key, Icon] of Object.entries(SERVICE_ICON_MAP)) {
    if (lower.includes(key)) return Icon;
  }
  return Wrench;
}

/* ───────────────────────── STOCK FALLBACK IMAGES ───────────────────────── */
const STOCK_HERO_POOL = ["https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=1400&q=80"];
const STOCK_ABOUT_POOL = ["https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=600&q=80"];
const STOCK_PROJECTS = [
  "https://images.unsplash.com/photo-1625047509248-ec889cbff17f?w=600&q=80",
  "https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?w=600&q=80",
  "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=80",
  "https://images.unsplash.com/photo-1603386329225-868f9b1ee6c9?w=800&q=80",
];

/* ───────────────────────── SERVICE TYPE BADGES ───────────────────────── */
const SERVICE_BADGES = [
  { label: "Oil Changes", icon: Drop },
  { label: "Brake Service", icon: Gauge },
  { label: "Engine Repair", icon: Engine },
  { label: "Transmission", icon: Gear },
  { label: "Diagnostics", icon: Speedometer },
  { label: "A/C Service", icon: Fan },
];

/* ───────────────────────── TRANSPARENT PRICING ───────────────────────── */
const PRICING_CARDS = [
  { service: "Oil Change", price: "From $39.99", desc: "Conventional or synthetic — quick and affordable", icon: Drop },
  { service: "Brake Service", price: "From $149", desc: "Pads, rotors, calipers — stop safely every time", icon: Gauge },
  { service: "Full Diagnostic", price: "$89", desc: "Computer scan, visual inspection, written report", icon: Speedometer },
];

/* ───────────────────────── WHAT WE SERVICE ───────────────────────── */
const VEHICLE_TYPES = [
  { label: "Domestic Cars", icon: CarSimple },
  { label: "Import / Foreign", icon: CarSimple },
  { label: "SUVs & Trucks", icon: CarSimple },
  { label: "Diesel Engines", icon: Engine },
  { label: "Brakes & Rotors", icon: Gauge },
  { label: "Transmission", icon: Gear },
  { label: "Electrical Systems", icon: Lightning },
  { label: "Suspension", icon: CarSimple },
];

/* ───────────────────────── HONESTY GUARANTEE PILLARS ───────────────────────── */
const HONESTY_PILLARS = [
  { title: "No Unnecessary Repairs", desc: "We only fix what actually needs fixing. Period.", icon: ShieldCheck },
  { title: "Free Estimates", desc: "Know the cost before we start. No obligation, no pressure.", icon: CurrencyDollar },
  { title: "Parts & Labor Warranty", desc: "Every repair backed by our comprehensive warranty.", icon: Certificate },
  { title: "We Show You the Problem", desc: "We walk you through the issue so you understand exactly what's going on.", icon: Eye },
];

/* ───────────────────────── COMPETITOR COMPARISON ───────────────────────── */
const COMPARISON_ROWS = [
  { feature: "Honest, Transparent Pricing", us: true, them: "$$$" },
  { feature: "Free Estimates", us: true, them: "No" },
  { feature: "Same-Day Service", us: true, them: "Varies" },
  { feature: "OEM & Aftermarket Parts", us: true, them: "OEM Only ($$)" },
  { feature: "Warranty on All Repairs", us: true, them: "Limited" },
  { feature: "No Appointment Needed", us: true, them: "No" },
  { feature: "Owner On-Site", us: true, them: "No" },
];

/* ───────────────────────── CAR NEEDS QUIZ ───────────────────────── */
const QUIZ_OPTIONS = [
  { label: "Routine Maintenance", desc: "Oil changes, filters, fluids, tune-ups", icon: Drop, color: "#22c55e" },
  { label: "Something Sounds Wrong", desc: "Noises, vibrations, pulling — we'll diagnose it", icon: Warning, color: "#f59e0b" },
  { label: "Brakes Feel Off", desc: "Grinding, squealing, soft pedal — safety first", icon: Gauge, color: "#ef4444" },
  { label: "Check Engine Light", desc: "Don't ignore it — let us read the code", icon: Engine, color: "#3b82f6" },
];

/* ───────────────────────── FLOATING PARTICLES ───────────────────────── */
function FloatingParticles({ accent }: { accent: string }) {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i, x: Math.random() * 100, delay: Math.random() * 8,
    duration: 5 + Math.random() * 5, size: 1.5 + Math.random() * 2.5, opacity: 0.2 + Math.random() * 0.4,
  }));

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden hidden md:block">
      {particles.map((p) => (
        <motion.div key={p.id} className="absolute rounded-full"
          style={{ left: `${p.x}%`, width: p.size, height: p.size, background: `linear-gradient(135deg, ${RED_LIGHT}, ${SILVER})`, willChange: "transform, opacity" }}
          animate={{ y: ["110vh", "-10vh"], opacity: [0, p.opacity, p.opacity, 0] }}
          transition={{
            y: { duration: p.duration, repeat: Infinity, delay: p.delay, ease: "linear" },
            opacity: { duration: p.duration, repeat: Infinity, delay: p.delay, times: [0, 0.1, 0.9, 1] },
          }}
        />
      ))}
    </div>
  );
}

/* ───────────────────────── GEAR PATTERN ───────────────────────── */
function GearPattern({ opacity = 0.03, accent }: { opacity?: number; accent: string }) {
  const patternId = `gearPatV2Prev-${accent.replace("#", "")}`;
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }}>
      <defs>
        <pattern id={patternId} width="100" height="100" patternUnits="userSpaceOnUse">
          <circle cx="50" cy="50" r="20" stroke={accent} strokeWidth="0.5" fill="none" />
          <circle cx="50" cy="50" r="8" stroke={SILVER} strokeWidth="0.5" fill="none" />
          <path d="M50 28 L53 30 L53 34 L50 36 L47 34 L47 30 Z" fill={accent} opacity="0.3" />
          <path d="M50 64 L53 66 L53 70 L50 72 L47 70 L47 66 Z" fill={accent} opacity="0.3" />
          <path d="M28 50 L30 47 L34 47 L36 50 L34 53 L30 53 Z" fill={SILVER} opacity="0.3" />
          <path d="M64 50 L66 47 L70 47 L72 50 L70 53 L66 53 Z" fill={SILVER} opacity="0.3" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  );
}

/* ───────────────────────── RACING STRIPE SVG ───────────────────────── */
function RacingStripes({ opacity = 0.04, accent }: { opacity?: number; accent: string }) {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }} viewBox="0 0 1000 600" preserveAspectRatio="none">
      <motion.line x1="0" y1="100" x2="1000" y2="100" stroke={accent} strokeWidth="2" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2, ease: "easeInOut" }} />
      <motion.line x1="0" y1="500" x2="1000" y2="500" stroke={SILVER} strokeWidth="1.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2.5, delay: 0.3, ease: "easeInOut" }} />
    </svg>
  );
}

/* ───────────────────────── GLASS CARD ───────────────────────── */
function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-white/15 bg-white/[0.08] backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] ${className}`}>{children}</div>;
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
      <motion.div className="absolute inset-0 rounded-2xl" style={{ background: `conic-gradient(from 0deg, transparent, ${accent}, transparent, ${SILVER}, transparent)`, willChange: "transform" }} animate={{ rotate: [0, 360] }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} />
      <div className="relative rounded-2xl z-10" style={{ background: DARK_CARD }}>{children}</div>
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

export default function V2AutoRepairPreview({ data }: { data: GeneratedSiteData }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const { ACCENT, ACCENT_GLOW } = getAccent(data.accentColor);

  const uniquePhotos = data.photos ? [...new Set(data.photos)] : [];


  const heroImage = uniquePhotos[0] || pickFromPool(STOCK_HERO_POOL, data.businessName);


  const heroCardImage = uniquePhotos[1] || pickFromPool(STOCK_ABOUT_POOL, data.businessName, 1);


  const aboutImage = uniquePhotos[2] || pickFromPool(STOCK_ABOUT_POOL, data.businessName, 2);
  const projectImages = data.photos?.length > 2 ? data.photos.slice(2, 6) : pickGallery(STOCK_PROJECTS, data.businessName);
  const phoneDigits = data.phone.replace(/\D/g, "");

  const processSteps = [
    { step: "01", title: "Drop Off or Schedule", desc: `Call, book online, or just drive in. ${data.businessName} makes it easy to get started.`, icon: CalendarCheck },
    { step: "02", title: "Free Inspection", desc: "Our certified technicians run a thorough inspection at no cost — you only pay for approved work.", icon: Eye },
    { step: "03", title: "Honest Estimate (No Surprises)", desc: "We show you exactly what needs fixing and give you a transparent quote before touching a wrench.", icon: CurrencyDollar },
    { step: "04", title: "Quality Repair & Warranty", desc: "We fix it right, test it thoroughly, and back it with our parts and labor warranty.", icon: ShieldCheck },
  ];

  const faqs = [
    { q: `What services does ${data.businessName} offer?`, a: `We provide full-service auto repair including ${data.services.slice(0, 3).map(s => s.name).join(", ")}, and more. We work on all makes and models.` },
    { q: "Do I need an appointment?", a: `While appointments are recommended, ${data.businessName} accepts walk-ins for many services. Call ahead for faster service.` },
    { q: "Do you offer a warranty on repairs?", a: `Absolutely. ${data.businessName} backs all repairs with a parts and labor warranty. Ask about our specific warranty terms for your service.` },
    { q: "What brands and models do you work on?", a: "We service all makes and models — domestic, import, and European. Our technicians have experience with every major manufacturer." },
  ];

  /* Fallback testimonials */
  const fallbackTestimonials = [
    { name: "James W.", text: "Honest mechanics are hard to find. These guys diagnosed the issue quickly and didn't try to upsell me.", rating: 5 },
    { name: "Rachel S.", text: "They've been maintaining my car for three years now. Always reliable and fairly priced.", rating: 5 },
    { name: "Tom H.", text: "Got my brakes done here and the price was half what the dealer quoted. Great work.", rating: 5 }
  ];
  const testimonials = data.testimonials?.length > 0 ? data.testimonials : fallbackTestimonials;

  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden" style={{ fontFamily: "Barlow, system-ui, sans-serif", background: DARK, color: "#f1f5f9" }}>
      <FloatingParticles accent={ACCENT} />

      {/* ══════════════════ 1. NAV ══════════════════ */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-4">
          <GlassCard className="flex items-center justify-between px-4 md:px-6 py-3">
            <div className="flex items-center gap-2">
              <Wrench size={24} weight="fill" style={{ color: ACCENT }} />
              <span className="text-lg font-bold tracking-tight text-white">{data.businessName}</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
              <a href="#services" className="hover:text-white transition-colors">Services</a>
              <a href="#about" className="hover:text-white transition-colors">About</a>
              <a href="#projects" className="hover:text-white transition-colors">Gallery</a>
              <a href="#contact" className="hover:text-white transition-colors">Contact</a>
            </div>
            <div className="flex items-center gap-3">
              <MagneticButton className="px-4 md:px-5 py-2 rounded-full text-sm font-semibold text-white transition-colors cursor-pointer" style={{ background: ACCENT } as React.CSSProperties}>Book Now</MagneticButton>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors">
                {mobileMenuOpen ? <X size={24} /> : <List size={24} />}
              </button>
            </div>
          </GlassCard>
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3, ease: "easeInOut" }} className="md:hidden mt-2 overflow-hidden">
                <GlassCard className="flex flex-col gap-1 px-4 py-4">
                  {[{ label: "Services", href: "#services" }, { label: "About", href: "#about" }, { label: "Gallery", href: "#projects" }, { label: "Contact", href: "#contact" }].map((link) => (
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
        <RacingStripes opacity={0.05} accent={ACCENT} />

        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          <div className="space-y-8 rounded-2xl bg-black/50 backdrop-blur-md p-6 md:p-8 border border-white/8">
            <div>
              <p className="text-sm uppercase tracking-widest mb-4" style={{ color: ACCENT }}>ASE Certified Technicians</p>
              <h1 className="text-3xl md:text-6xl tracking-tighter leading-none font-bold text-white" style={{ textShadow: "0 2px 20px rgba(0,0,0,0.8), 0 4px 40px rgba(0,0,0,0.5)" }}>{data.tagline}</h1>
            </div>
            <p className="text-lg text-slate-400 max-w-md leading-relaxed">{(() => { const t = data.about; if (t.length <= 180) return t; const dot = t.indexOf('.', 80); return dot > 0 && dot < 220 ? t.slice(0, dot + 1) : t.slice(0, 180).trim() + '...'; })()}</p>
            <div className="flex flex-wrap gap-4">
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white flex items-center gap-2 cursor-pointer" style={{ background: ACCENT } as React.CSSProperties}>
                Book an Appointment <ArrowRight size={18} weight="bold" />
              </MagneticButton>
              <MagneticButton href={`tel:${phoneDigits}`} className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/15 flex items-center gap-2 cursor-pointer">
                <Phone size={18} weight="duotone" /> <PhoneLink phone={data.phone} />
              </MagneticButton>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-slate-400">
              <span className="flex items-center gap-2"><MapPin size={16} weight="duotone" style={{ color: ACCENT }} /> <MapLink address={data.address} /></span>
              <span className="flex items-center gap-2"><Clock size={16} weight="duotone" style={{ color: ACCENT }} /> Walk-Ins Welcome</span>
            </div>
          </div>
          <div className="hidden md:block relative">
            <div className="relative rounded-2xl overflow-hidden border border-white/15">
              <img src={heroCardImage} alt={`${data.businessName} auto repair`} className="w-full h-[500px] object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-transparent to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#111111]/40 to-transparent" />
              <div className="absolute bottom-6 left-6">
                <div className="px-4 py-2 rounded-full backdrop-blur-md bg-black/50 border flex items-center gap-2" style={{ borderColor: `${ACCENT}4d` }}>
                  <ShieldCheck size={18} weight="fill" style={{ color: ACCENT }} />
                  <span className="text-sm font-semibold text-white">ASE Certified</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════ SERVICE TYPE BADGES ══════════════════ */}
      <section className="relative z-10 py-10 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, #0a0a0a 0%, ${DARK} 100%)` }} />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="flex flex-wrap justify-center gap-3">
            {SERVICE_BADGES.map((badge) => (
              <div key={badge.label} className="flex items-center gap-2 px-4 py-2.5 rounded-full border text-sm font-semibold" style={{ color: ACCENT, borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}>
                <badge.icon size={18} weight="duotone" />
                {badge.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ 3. STATS ══════════════════ */}
      <section className="relative z-10 py-16 overflow-hidden border-y" style={{ borderColor: `${ACCENT}1a` }}>
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #0e0e0e 0%, #111111 100%)" }} />
        <GearPattern opacity={0.02} accent={ACCENT} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] rounded-full blur-[180px]" style={{ background: `${ACCENT}08` }} /></div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {data.stats.map((stat, i) => {
              const statIcons = [Wrench, CarSimple, Clock, Star];
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
      <section id="services" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${DARK} 0%, #0e0e0e 50%, ${DARK} 100%)` }} />
        <GearPattern accent={ACCENT} />
        <RacingStripes opacity={0.025} accent={ACCENT} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[10%] right-[5%] w-[500px] h-[500px] rounded-full blur-[160px]" style={{ background: `${ACCENT}08` }} />
        </div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Our Services" title="Full-Service Auto Repair" subtitle={`From oil changes to engine rebuilds, ${data.businessName} keeps your vehicle running at peak performance.`} accent={ACCENT} />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.services.map((service, i) => {
              const Icon = getServiceIcon(service.name);
              return (
                <div key={service.name} className="group relative p-7 rounded-2xl border border-white/[0.10] hover:border-opacity-30 transition-all duration-500 overflow-hidden bg-white/[0.07]">
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
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════ TRANSPARENT PRICING ══════════════════ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${DARK} 0%, ${DARK_CARD} 50%, ${DARK} 100%)` }} />
        <RacingStripes opacity={0.02} accent={ACCENT} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[30%] left-[10%] w-[500px] h-[500px] rounded-full blur-[180px]" style={{ background: `${ACCENT}06` }} /></div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Transparent Pricing" title="Honest Prices — No Surprises" subtitle="We believe you deserve to know what you're paying before we start. No hidden fees, no unnecessary upsells." accent={ACCENT} />
          <div className="grid md:grid-cols-3 gap-6">
            {PRICING_CARDS.map((card) => (
              <GlassCard key={card.service} className="p-7 text-center group hover:border-opacity-30 transition-all duration-500">
                <div className="w-14 h-14 rounded-full mx-auto mb-5 flex items-center justify-center border" style={{ background: ACCENT_GLOW, borderColor: `${ACCENT}33` }}>
                  <card.icon size={28} weight="duotone" style={{ color: ACCENT }} />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">{card.service}</h3>
                <p className="text-2xl font-black mb-3" style={{ color: ACCENT }}>{card.price}</p>
                <p className="text-sm text-slate-400 leading-relaxed">{card.desc}</p>
              </GlassCard>
            ))}
          </div>
          <p className="text-center text-slate-500 text-sm mt-8">* Prices may vary by vehicle. Final quote provided before any work begins.</p>
        </div>
      </section>

      {/* ══════════════════ WHAT WE SERVICE ══════════════════ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${DARK} 0%, #0e0e0e 50%, ${DARK} 100%)` }} />
        <GearPattern opacity={0.025} accent={ACCENT} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[20%] right-[10%] w-[500px] h-[500px] rounded-full blur-[160px]" style={{ background: `${SILVER}06` }} /></div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Capability" title="What We Service" subtitle="From everyday sedans to heavy-duty trucks — our certified technicians handle it all." accent={ACCENT} />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {VEHICLE_TYPES.map((v) => (
              <GlassCard key={v.label} className="p-5 text-center group hover:border-opacity-30 transition-all duration-500">
                <div className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center border" style={{ background: ACCENT_GLOW, borderColor: `${ACCENT}33` }}>
                  <v.icon size={24} weight="duotone" style={{ color: ACCENT }} />
                </div>
                <span className="text-sm font-semibold text-white">{v.label}</span>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ 5. ABOUT ══════════════════ */}
      <section id="about" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${DARK} 0%, ${DARK_CARD} 50%, ${DARK} 100%)` }} />
        <RacingStripes opacity={0.02} accent={ACCENT} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[20%] left-[10%] w-[500px] h-[500px] rounded-full blur-[180px]" style={{ background: `${ACCENT}06` }} /></div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="relative">
              <div className="rounded-2xl overflow-hidden border border-white/15">
                <img src={aboutImage} alt={`${data.businessName} shop`} className="w-full h-[400px] object-cover" />
              </div>
              <div className="absolute -bottom-4 -right-4 md:bottom-6 md:-right-6">
                <div className="px-5 py-3 rounded-xl backdrop-blur-md border text-white font-bold text-sm shadow-lg" style={{ background: `${ACCENT}e6`, borderColor: `${ACCENT}80` }}>
                  {data.stats[0] ? `${data.stats[0].value} ${data.stats[0].label}` : "Trusted Mechanics"}
                </div>
              </div>
            </div>
            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: ACCENT, borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}>Why Choose Us</span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6 text-white">Honest Mechanics You Can Trust</h2>
              <p className="text-slate-400 leading-relaxed mb-8">{data.about}</p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: ShieldCheck, label: "ASE Certified" },
                  { icon: Certificate, label: "Fully Insured" },
                  { icon: Tag, label: "Fair Pricing" },
                  { icon: Trophy, label: "5-Star Rated" },
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

      {/* ══════════════════ HONESTY GUARANTEE ══════════════════ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${DARK} 0%, #0e0e0e 50%, ${DARK} 100%)` }} />
        <GearPattern opacity={0.025} accent={ACCENT} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[30%] right-[15%] w-[500px] h-[500px] rounded-full blur-[180px]" style={{ background: `${ACCENT}08` }} /></div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Our Promise" title="The Honest Mechanic Guarantee" subtitle="We know finding a trustworthy mechanic is hard. That's why we put our promise in writing." accent={ACCENT} />
          <div className="grid md:grid-cols-2 gap-6">
            {HONESTY_PILLARS.map((pillar) => (
              <GlassCard key={pillar.title} className="p-7 flex items-start gap-5 group hover:border-opacity-30 transition-all duration-500">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 border" style={{ background: ACCENT_GLOW, borderColor: `${ACCENT}33` }}>
                  <pillar.icon size={28} weight="duotone" style={{ color: ACCENT }} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">{pillar.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{pillar.desc}</p>
                </div>
              </GlassCard>
            ))}
          </div>
          <div className="text-center mt-10">
            <ShimmerBorder accent={ACCENT} className="inline-block">
              <div className="px-8 py-4 flex items-center gap-3">
                <Handshake size={24} weight="duotone" style={{ color: ACCENT }} />
                <span className="text-white font-bold text-lg">Your Trust Is Our Reputation</span>
              </div>
            </ShimmerBorder>
          </div>
        </div>
      </section>

      {/* ══════════════════ COMPETITOR COMPARISON ══════════════════ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${DARK} 0%, ${DARK_CARD} 50%, ${DARK} 100%)` }} />
        <RacingStripes opacity={0.02} accent={ACCENT} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[20%] left-[10%] w-[400px] h-[400px] rounded-full blur-[160px]" style={{ background: `${ACCENT}06` }} /></div>
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Why Us" title={`${data.businessName} vs. Dealership Service`} accent={ACCENT} />
          <GlassCard className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/15">
                    <th className="text-left p-4 text-slate-400 font-medium">Feature</th>
                    <th className="text-center p-4 font-bold" style={{ color: ACCENT }}>{data.businessName}</th>
                    <th className="text-center p-4 text-slate-500 font-medium">Dealership</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_ROWS.map((row, i) => (
                    <tr key={row.feature} className={i < COMPARISON_ROWS.length - 1 ? "border-b border-white/8" : ""}>
                      <td className="p-4 text-white font-medium">{row.feature}</td>
                      <td className="p-4 text-center">
                        <CheckCircle size={22} weight="fill" style={{ color: "#22c55e" }} className="mx-auto" />
                      </td>
                      <td className="p-4 text-center text-slate-500 text-xs font-medium">{row.them}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* ══════════════════ VIDEO PLACEHOLDER ══════════════════ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${DARK} 0%, #0e0e0e 50%, ${DARK} 100%)` }} />
        <GearPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Virtual Tour" title="See Our Shop" accent={ACCENT} />
          <div className="relative rounded-2xl overflow-hidden border border-white/15 group cursor-pointer">
            <img src={projectImages[0] || heroImage} alt={`${data.businessName} shop tour`} className="w-full h-[300px] md:h-[450px] object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-black/50 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full flex items-center justify-center border-2 border-white/30 group-hover:border-white/60 transition-colors duration-300" style={{ background: `${ACCENT}cc` }}>
                <Play size={36} weight="fill" className="text-white ml-1" />
              </div>
            </div>
            <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
              <span className="text-white font-bold text-lg">Take a Tour of Our Facility</span>
              <span className="text-white/60 text-sm">2:30</span>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════ 6. PROCESS ══════════════════ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${DARK} 0%, #0e0e0e 50%, ${DARK} 100%)` }} />
        <GearPattern opacity={0.025} accent={ACCENT} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] rounded-full blur-[180px]" style={{ background: `${SILVER}06` }} /></div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Our Process" title="How We Work — No Surprises" subtitle="A straightforward process built on transparency. You always know what's happening with your vehicle." accent={ACCENT} />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {processSteps.map((step, i) => (
              <div key={step.step} className="relative">
                {i < processSteps.length - 1 && <div className="hidden lg:block absolute top-10 left-[calc(50%+40px)] w-[calc(100%-80px)] h-px" style={{ background: `linear-gradient(to right, ${ACCENT}33, ${ACCENT}11)` }} />}
                <GlassCard className="p-6 text-center relative">
                  <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${ACCENT}22, ${ACCENT}0a)`, border: `1px solid ${ACCENT}33` }}>
                    <step.icon size={28} weight="duotone" style={{ color: ACCENT }} />
                  </div>
                  <span className="text-xs font-mono mb-2 block" style={{ color: ACCENT }}>Step {step.step}</span>
                  <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
                </GlassCard>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ 7. GALLERY ══════════════════ */}
      <section id="projects" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${DARK} 0%, ${DARK_CARD} 50%, ${DARK} 100%)` }} />
        <RacingStripes opacity={0.02} accent={ACCENT} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[30%] left-[20%] w-[500px] h-[500px] rounded-full blur-[200px]" style={{ background: `${ACCENT}06` }} /></div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <AnimatedSection>          <SectionHeader badge="Our Shop" title="Recent Work" accent={ACCENT} /></AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projectImages.map((src, i) => {
              const titles = ["Complete Engine Rebuild", "Brake System Overhaul", "Custom Performance Upgrade", "Full Vehicle Diagnostic"];
              const descs = ["Precision engine rebuild restoring factory performance.", "Complete brake pad, rotor, and caliper replacement.", "Performance intake and exhaust system installation.", "Comprehensive computer diagnostic and repair."];
              return (
                <div key={i} className="group relative rounded-2xl overflow-hidden border border-white/[0.10] hover:border-opacity-30 transition-all duration-500">
                  <img src={src} alt={titles[i]} className="w-full h-64 object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6"><h3 className="text-lg font-bold text-white mb-1">{titles[i]}</h3><p className="text-sm text-slate-300">{descs[i]}</p></div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════ CAR NEEDS QUIZ ══════════════════ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${DARK} 0%, ${DARK_CARD} 50%, ${DARK} 100%)` }} />
        <GearPattern opacity={0.025} accent={ACCENT} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[25%] right-[15%] w-[400px] h-[400px] rounded-full blur-[180px]" style={{ background: `${ACCENT}08` }} /></div>
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Quick Help" title="What Does Your Car Need?" subtitle="Not sure what service you need? Pick the option that best describes your situation." accent={ACCENT} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {QUIZ_OPTIONS.map((opt) => (
              <div key={opt.label} className="group relative p-6 rounded-2xl border border-white/[0.10] hover:border-opacity-40 transition-all duration-500 cursor-pointer overflow-hidden bg-white/[0.07]">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: `radial-gradient(circle at 50% 0%, ${opt.color}15, transparent 70%)` }} />
                <div className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `linear-gradient(to right, transparent, ${opt.color}4d, transparent)` }} />
                <div className="relative z-10 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border" style={{ background: `${opt.color}15`, borderColor: `${opt.color}33` }}>
                    <opt.icon size={24} weight="duotone" style={{ color: opt.color }} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white mb-1">{opt.label}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{opt.desc}</p>
                  </div>
                </div>
                <div className="relative z-10 mt-4 flex items-center gap-2 text-sm font-semibold" style={{ color: opt.color }}>
                  <Phone size={16} weight="fill" /> Call Now for Help
                  <ArrowRight size={14} weight="bold" />
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <MagneticButton href={`tel:${phoneDigits}`} className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-white font-bold text-base cursor-pointer" style={{ background: ACCENT } as React.CSSProperties}>
              <Phone size={20} weight="fill" /> <PhoneLink phone={data.phone} />
            </MagneticButton>
          </div>
        </div>
      </section>

      {/* ══════════════════ 8. TESTIMONIALS ══════════════════ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${DARK} 0%, #0e0e0e 50%, ${DARK} 100%)` }} />
        <GearPattern opacity={0.02} accent={ACCENT} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[20%] right-[15%] w-[400px] h-[400px] rounded-full blur-[160px]" style={{ background: `${ACCENT}06` }} /></div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Testimonials" title="What Our Customers Say" accent={ACCENT} />

          {/* Google Reviews Header */}
          <div className="flex flex-col items-center mb-10">
            <div className="flex items-center gap-2 mb-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={28} weight="fill" style={{ color: "#facc15" }} />
              ))}
            </div>
            <p className="text-white font-bold text-lg">
              {data.googleRating || "4.9"} out of 5
              <span className="text-slate-400 font-normal text-base ml-2">
                based on {data.reviewCount || "100+"} Google Reviews
              </span>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <GlassCard key={i} className="p-6 h-full flex flex-col">
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex gap-0.5">{Array.from({ length: t.rating || 5 }).map((_, j) => <Star key={j} size={16} weight="fill" style={{ color: "#facc15" }} />)}</div>
                  <CheckCircle size={16} weight="fill" className="text-green-500 ml-auto" />
                  <span className="text-xs text-green-400">Verified</span>
                </div>
                <p className="text-slate-300 leading-relaxed flex-1 text-sm mb-4">&ldquo;{t.text}&rdquo;</p>
                <div className="pt-4 border-t border-white/8"><span className="text-sm font-semibold text-white">{t.name}</span></div>
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
          <CarSimple size={48} weight="fill" className="mx-auto mb-6 text-white/70" />
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-4">Your Car Deserves the Best</h2>
          <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">Do not trust your vehicle to just anyone. {data.businessName} brings expertise, honesty, and fair pricing to every repair.</p>
          <PhoneLink phone={data.phone} className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-black text-white font-bold text-lg hover:bg-black/80 transition-colors">
            <Phone size={22} weight="fill" /> {data.phone}
          </PhoneLink>
        </div>
      </section>

      {/* ══════════════════ 10. SERVICE AREAS ══════════════════ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${DARK} 0%, ${DARK_CARD} 50%, ${DARK} 100%)` }} />
        <GearPattern opacity={0.02} accent={ACCENT} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[40%] right-[20%] w-[400px] h-[400px] rounded-full blur-[180px]" style={{ background: `${SILVER}06` }} /></div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <AnimatedSection>          <SectionHeader badge="Find Us" title="Our Location" accent={ACCENT} /></AnimatedSection>
          <div className="text-center">
            <GlassCard className="p-8 inline-block">
              <div className="flex items-center gap-3 text-lg"><MapPin size={24} weight="duotone" style={{ color: ACCENT }} /><MapLink address={data.address} className="text-white font-semibold" /></div>
              <p className="text-slate-400 text-sm mt-2">Serving customers across the area</p>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* ══════════════════ 11. HOURS ══════════════════ */}
      {data.hours && (
        <section className="relative z-10 py-24 md:py-32 overflow-hidden">
          <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${DARK} 0%, #0e0e0e 50%, ${DARK} 100%)` }} />
          <RacingStripes opacity={0.02} accent={ACCENT} />
          <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[20%] left-[15%] w-[400px] h-[400px] rounded-full blur-[160px]" style={{ background: `${ACCENT}06` }} /></div>
          <div className="max-w-3xl mx-auto px-6 relative z-10">
            <AnimatedSection>          <SectionHeader badge="Shop Hours" title="When We're Open" accent={ACCENT} /></AnimatedSection>
            <div className="text-center">
              <ShimmerBorder accent={ACCENT}>
                <div className="p-8">
                  <Clock size={32} weight="duotone" style={{ color: ACCENT }} className="mx-auto mb-4" />
                  <p className="text-slate-300 leading-relaxed whitespace-pre-line text-lg">{data.hours}</p>
                  <p className="text-sm mt-4 font-semibold" style={{ color: ACCENT }}>Walk-Ins Welcome During Business Hours</p>
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

      {/* ══════════════════ 12. FAQ ══════════════════ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${DARK} 0%, #0e0e0e 50%, ${DARK} 100%)` }} />
        <GearPattern opacity={0.02} accent={ACCENT} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[20%] left-[15%] w-[400px] h-[400px] rounded-full blur-[160px]" style={{ background: `${ACCENT}06` }} /></div>
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <AnimatedSection>          <SectionHeader badge="FAQ" title="Common Questions" accent={ACCENT} /></AnimatedSection>
          <div className="space-y-3">
            {faqs.map((faq, i) => <AccordionItem key={i} question={faq.q} answer={faq.a} isOpen={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} />)}
          </div>
        </div>
      </section>

      {/* ══════════════════ 13. CONTACT ══════════════════ */}
      <section id="contact" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${DARK} 0%, ${DARK_CARD} 50%, ${DARK} 100%)` }} />
        <GearPattern opacity={0.02} accent={ACCENT} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] rounded-full blur-[180px]" style={{ background: `${ACCENT}06` }} /></div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: ACCENT, borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}>Contact Us</span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6 text-white">Book Your Appointment</h2>
              <p className="text-slate-400 leading-relaxed mb-8">Need reliable auto repair? Contact {data.businessName} today. Walk-ins welcome or book ahead for faster service.</p>
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
                  { icon: CalendarCheck, label: "Walk-Ins", value: "Walk-ins welcome during business hours" },
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
              <h3 className="text-xl font-semibold text-white mb-6">Schedule Service</h3>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className="block text-sm text-slate-400 mb-1.5">Name</label><input type="text" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 focus:outline-none text-sm" placeholder="John Doe" /></div>
                  <div><label className="block text-sm text-slate-400 mb-1.5">Phone</label><input type="tel" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 focus:outline-none text-sm" placeholder="(555) 123-4567" /></div>
                </div>
                <div><label className="block text-sm text-slate-400 mb-1.5">Vehicle (Year, Make, Model)</label><input type="text" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 focus:outline-none text-sm" placeholder="2022 Toyota Camry" /></div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">Service Needed</label>
                  <select className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white focus:outline-none text-sm">
                    <option value="" className="bg-neutral-900">Select a service</option>
                    {data.services.map((s) => <option key={s.name} value={s.name.toLowerCase().replace(/\s+/g, "-")} className="bg-neutral-900">{s.name}</option>)}
                  </select>
                </div>
                <div><label className="block text-sm text-slate-400 mb-1.5">Describe the Issue</label><textarea rows={4} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 focus:outline-none text-sm resize-none" placeholder="What symptoms are you experiencing?" /></div>
                <MagneticButton className="w-full py-4 rounded-xl text-base font-semibold text-white flex items-center justify-center gap-2 cursor-pointer" style={{ background: ACCENT } as React.CSSProperties}>
                  Book Appointment <ArrowRight size={18} weight="bold" />
                </MagneticButton>
              </form>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* ══════════════════ 14. WARRANTY & TRUST CTA ══════════════════ */}
      <section className="relative z-10 py-16 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${DARK} 0%, #0e0e0e 100%)` }} />
        <GearPattern opacity={0.015} accent={ACCENT} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full blur-[180px]" style={{ background: `${ACCENT}06` }} /></div>
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <ShimmerBorder accent={ACCENT}>
            <div className="p-8 md:p-12">
              <ShieldCheck size={48} weight="fill" style={{ color: ACCENT }} className="mx-auto mb-4" />
              <h2 className="text-2xl md:text-4xl font-extrabold text-white mb-4">Every Repair Backed by Our Warranty</h2>
              <p className="text-xl font-semibold text-white/80 mb-2">Drive with Confidence</p>
              <p className="text-slate-400 leading-relaxed max-w-2xl mx-auto text-lg mb-8">Every repair by {data.businessName} is backed by our comprehensive parts and labor warranty. No fine print, no runaround. We stand behind our work because your trust is our most valuable asset.</p>
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                {["No Unnecessary Repairs", "Transparent Pricing", "Warranty Backed", "All Makes & Models"].map((item) => (
                  <span key={item} className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border" style={{ color: ACCENT, borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}>
                    <CheckCircle size={16} weight="fill" /> {item}
                  </span>
                ))}
              </div>
              <MagneticButton href={`tel:${phoneDigits}`} className="inline-flex items-center gap-3 px-8 py-4 rounded-full text-white font-bold text-lg cursor-pointer" style={{ background: ACCENT } as React.CSSProperties}>
                <Phone size={22} weight="fill" /> Schedule Your Repair Today
              </MagneticButton>
            </div>
          </ShimmerBorder>
        </div>
      </section>

      {/* ══════════════════ 15. FOOTER ══════════════════ */}
      <footer className="relative z-10 border-t border-white/8 py-10 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${DARK} 0%, #0a0a0a 100%)` }} />
        <GearPattern opacity={0.015} accent={ACCENT} />
        <div className="mx-auto max-w-6xl px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3"><Wrench size={22} weight="fill" style={{ color: ACCENT }} /><span className="text-lg font-bold text-white">{data.businessName}</span></div>
              <p className="text-sm text-slate-500 leading-relaxed">{data.about.length > 120 ? data.about.slice(0, 120).trim() + "..." : data.about}</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-3">Quick Links</h4>
              <div className="space-y-2">{["Services", "About", "Gallery", "Contact"].map((link) => <a key={link} href={`#${link.toLowerCase()}`} className="block text-sm text-slate-500 hover:text-white transition-colors">{link}</a>)}</div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-3">Contact</h4>
              <div className="space-y-2 text-sm text-slate-500">
                <p><PhoneLink phone={data.phone} /></p><p><MapLink address={data.address} /></p>
                {data.socialLinks && Object.entries(data.socialLinks).map(([platform, url]) => <a key={platform} href={url} target="_blank" rel="noopener noreferrer" className="block hover:text-white transition-colors capitalize">{platform}</a>)}
              </div>
            </div>
          </div>
          <div className="border-t border-white/8 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-500"><Wrench size={14} weight="fill" style={{ color: ACCENT }} /><span>{data.businessName} &copy; {new Date().getFullYear()}</span></div>
            <div className="flex items-center gap-2 text-xs text-slate-600"><BluejayLogo className="w-4 h-4" /><span>Created by <a href="https://bluejayportfolio.com" target="_blank" rel="noopener noreferrer" style={{textDecoration:"underline"}}>bluejayportfolio.com</a></span></div>
          </div>
        </div>
      </footer>

      <ClaimBanner businessName={data.businessName} accentColor={ACCENT} prospectId={data.id} />
      <div className="h-14 md:h-28" />
    </main>
  );
}
