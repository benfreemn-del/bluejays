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
  Hammer,
  HardHat,
  Ruler,
  House,
  Buildings,
  Wrench,
  ShieldCheck,
  Star,
  Clock,
  Phone,
  MapPin,
  ArrowRight,
  CheckCircle,
  CaretDown,
  List,
  X,
  Users,
  ClipboardText,
  Warehouse,
  Play,
  HouseSimple,
  Blueprint,
  CalendarCheck,
} from "@phosphor-icons/react";
import type { GeneratedSiteData } from "@/lib/generator";
import BluejayLogo from "../BluejayLogo";
import { MapLink, PhoneLink } from "@/components/templates/MapLink";
import ClaimBanner from "@/components/ClaimBanner";
import { pickFromPool, pickGallery } from "@/lib/stock-image-picker";

/* ───────────────── SPRING ───────────────── */
const spring = { type: "spring" as const, stiffness: 100, damping: 20 };
const springFast = { type: "spring" as const, stiffness: 200, damping: 25 };

/* ───────────────── COLORS ───────────────── */
const BG = "#1a2030";
const DEFAULT_ORANGE = "#ea580c";
const STEEL = "#475569";

function getAccent(accentColor?: string) {
  const c = accentColor || DEFAULT_ORANGE;
  return { ACCENT: c, ACCENT_GLOW: `${c}26`, STEEL };
}

/* ───────────────── SERVICE ICON MAP ───────────────── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SERVICE_ICON_MAP: Record<string, any> = {
  remodel: Wrench, kitchen: Wrench, bath: Wrench, renovation: Wrench,
  addition: House, room: House, home: House,
  new: Buildings, construction: Buildings, build: Buildings, custom: Buildings,
  commercial: Warehouse, office: Warehouse, retail: Warehouse, tenant: Warehouse,
  restoration: HardHat, structural: HardHat, foundation: HardHat, repair: HardHat,
  project: ClipboardText, management: ClipboardText, permit: ClipboardText,
};

function getServiceIcon(serviceName: string) {
  const lower = serviceName.toLowerCase();
  for (const [key, Icon] of Object.entries(SERVICE_ICON_MAP)) {
    if (lower.includes(key)) return Icon;
  }
  return Hammer;
}

/* ───────────────── STOCK IMAGES ───────────────── */
const STOCK_HERO_POOL = ["https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=1400&q=80"];
const STOCK_ABOUT_POOL = ["https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=600&q=80"];
const STOCK_PROJECTS = [
  "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&q=80",
  "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600&q=80",
  "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600&q=80",
  "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600&q=80",
];

/* ───────────────── PARTICLES ───────────────── */
function FloatingSparks({ accent }: { accent: string }) {
  const particles = Array.from({ length: 18 }, (_, i) => ({
    id: i, x: Math.random() * 100, delay: Math.random() * 8, duration: 5 + Math.random() * 7, size: 2 + Math.random() * 3, opacity: 0.12 + Math.random() * 0.3, isSteel: Math.random() > 0.6,
  }));
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden hidden md:block">
      {particles.map((p) => (
        <motion.div key={p.id} className="absolute rounded-full" style={{ left: `${p.x}%`, width: p.size, height: p.size, background: p.isSteel ? STEEL : accent, willChange: "transform, opacity" }}
          animate={{ y: ["-10vh", "110vh"], opacity: [0, p.opacity, p.opacity, 0] }}
          transition={{ y: { duration: p.duration, repeat: Infinity, delay: p.delay, ease: "linear" }, opacity: { duration: p.duration, repeat: Infinity, delay: p.delay, times: [0, 0.1, 0.9, 1] } }}
        />
      ))}
    </div>
  );
}

/* ───────────────── BLUEPRINT GRID ───────────────── */
function BlueprintGrid({ opacity = 0.03, accent }: { opacity?: number; accent: string }) {
  const pid = `blueprintV2Prev-${accent.replace("#", "")}`;
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }}>
      <defs>
        <pattern id={pid} width="80" height="80" patternUnits="userSpaceOnUse">
          <rect width="80" height="80" fill="none" stroke={STEEL} strokeWidth="0.5" />
          <rect width="40" height="40" fill="none" stroke={STEEL} strokeWidth="0.25" />
          <circle cx="0" cy="0" r="1.5" fill={accent} opacity="0.3" />
          <circle cx="80" cy="80" r="1.5" fill={accent} opacity="0.3" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${pid})`} />
    </svg>
  );
}

/* ───────────────── CONSTRUCTION BEAMS ───────────────── */
function ConstructionBeams({ opacity = 0.04, accent }: { opacity?: number; accent: string }) {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }} viewBox="0 0 1000 600" preserveAspectRatio="none">
      <path d="M0 300 L500 100 L1000 300" stroke={STEEL} strokeWidth="2" fill="none" />
      <path d="M100 600 L100 200 L200 150 L200 600" stroke={accent} strokeWidth="1" fill="none" />
      <path d="M800 600 L800 200 L900 150 L900 600" stroke={accent} strokeWidth="1" fill="none" />
    </svg>
  );
}

/* ───────────────── GLASS CARD ───────────────── */
function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-white/15 bg-white/[0.08] backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] ${className}`}>{children}</div>
  );
}

/* ───────────────── MAGNETIC BUTTON ───────────────── */
function MagneticButton({ children, className = "", onClick, style, href }: { children: React.ReactNode; className?: string; onClick?: () => void; style?: React.CSSProperties; href?: string }) {
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
    <motion.button ref={ref} style={{ x: springX, y: springY, willChange: "transform", ...style }} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} onClick={onClick} className={className} whileTap={{ scale: 0.97 }}>
      {children}
    </motion.button>
  );
}

/* ───────────────── SHIMMER BORDER ───────────────── */
function ShimmerBorder({ children, className = "", accent }: { children: React.ReactNode; className?: string; accent: string }) {
  return (
    <div className={`relative rounded-2xl p-[1px] overflow-hidden ${className}`}>
      <motion.div className="absolute inset-0 rounded-2xl" style={{ background: `conic-gradient(from 0deg, transparent, ${accent}, transparent, ${STEEL}, transparent)`, willChange: "transform" }} animate={{ rotate: [0, 360] }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} />
      <div className="relative rounded-2xl bg-[#1a2030] z-10">{children}</div>
    </div>
  );
}

/* ───────────────── ACCORDION ───────────────── */
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

/* ───────────────── SECTION HEADER ───────────────── */
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


/* ═══════════════════════════════════════════════════
   MAIN PREVIEW COMPONENT
   ═══════════════════════════════════════════════════ */
/* ───────────────────────── ANIMATED SECTION ───────────────────────── */
function AnimatedSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}

export default function V2GeneralContractorPreview({ data }: { data: GeneratedSiteData }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const { ACCENT, ACCENT_GLOW } = getAccent(data.accentColor);

  const uniquePhotos = data.photos ? [...new Set(data.photos)] : [];


  const heroImage = uniquePhotos[0] || pickFromPool(STOCK_HERO_POOL, data.businessName);


  const heroCardImage = uniquePhotos[1] || pickFromPool(STOCK_ABOUT_POOL, data.businessName, 1);


  const aboutImage = uniquePhotos[2] || pickFromPool(STOCK_ABOUT_POOL, data.businessName, 2);
  const projectImages = data.photos?.length > 2 ? data.photos.slice(2, 6) : pickGallery(STOCK_PROJECTS, data.businessName);

  const processSteps = [
    { step: "01", title: "Free Consultation", desc: `We visit your site, discuss your vision, timeline, and budget at no cost.` },
    { step: "02", title: "Design & Planning", desc: `Detailed plans, 3D renderings, permits — we handle it all.` },
    { step: "03", title: "Construction", desc: `Expert crews execute with precision, daily updates, and clean job sites.` },
    { step: "04", title: "Final Walkthrough", desc: `We walk every inch together. We don't finish until you're 100% satisfied.` },
  ];

  const faqs = [
    { q: `What services does ${data.businessName} offer?`, a: `We offer ${data.services.slice(0, 3).map(s => s.name).join(", ")}, and more. Contact us for a free estimate.` },
    { q: "Do you handle permits and inspections?", a: "Absolutely. We pull all necessary permits, coordinate every inspection, and ensure full code compliance on every project." },
    { q: "What's your warranty?", a: `All projects by ${data.businessName} come with a comprehensive workmanship warranty. We stand behind every detail.` },
    { q: "How long does a typical project take?", a: "Timelines vary by scope. We provide a detailed schedule during consultation and keep you updated daily." },
  ];

  /* Fallback testimonials */
  const fallbackTestimonials = [
    { name: "Andrew P.", text: "Managed our entire home renovation from start to finish. On budget and the quality is exceptional.", rating: 5 },
    { name: "Rebecca L.", text: "They coordinated all the subcontractors perfectly. Our bathroom remodel turned out stunning.", rating: 5 },
    { name: "Frank T.", text: "Honest, reliable, and skilled. They treat your home like it's their own.", rating: 5 }
  ];
  const testimonials = data.testimonials?.length > 0 ? data.testimonials : fallbackTestimonials;

  /* ───────── FEATURE DATA: Project Type Badges ───────── */
  const projectTypeBadges = [
    "Kitchen Remodels", "Bathroom Renovations", "Additions",
    "New Construction", "Commercial", "Outdoor Living",
  ];

  /* ───────── FEATURE DATA: Project Investment Guide ───────── */
  const investmentCards = [
    { title: "Bathroom Remodel", price: "From $15K", desc: "Complete tear-out and rebuild with premium finishes, modern fixtures, and expert tile work.", icon: Wrench },
    { title: "Kitchen Renovation", price: "From $35K", desc: "Custom cabinetry, countertops, appliances, and layouts designed for how you actually live.", icon: HouseSimple },
    { title: "Home Addition", price: "From $75K+", desc: "Expand your living space with a seamless addition — permitted, engineered, and built to last.", icon: Buildings },
  ];

  /* ───────── FEATURE DATA: Build Process (5-step) ───────── */
  const buildProcess = [
    { step: "01", title: "Free Consultation", desc: "We meet on-site, discuss your vision, evaluate the scope, and provide an honest assessment.", icon: Phone },
    { step: "02", title: "Design & Planning", desc: "Detailed plans, material selections, 3D renderings, and a locked-in budget — no surprises.", icon: Blueprint },
    { step: "03", title: "Permits & Approvals", desc: "We handle all permit applications, engineering reviews, and municipal approvals.", icon: ClipboardText },
    { step: "04", title: "Quality Construction", desc: "Expert crews execute with precision. Daily updates, clean job sites, and zero shortcuts.", icon: HardHat },
    { step: "05", title: "Final Walkthrough", desc: "We walk every inch together. Your project isn't done until you're 100% satisfied.", icon: CalendarCheck },
  ];

  /* ───────── FEATURE DATA: Why Licensed GC ───────── */
  const licensedPillars = [
    { icon: ShieldCheck, title: "Licensed, Bonded & Insured", desc: "Full liability coverage and state licensing protects your investment from day one." },
    { icon: ClipboardText, title: "Permit Management", desc: "We pull every permit, schedule every inspection, and ensure full code compliance." },
    { icon: Users, title: "Subcontractor Coordination", desc: "We vet, hire, and manage all trades — electrical, plumbing, HVAC, and more." },
    { icon: CheckCircle, title: "Warranty Protection", desc: "Comprehensive workmanship warranty on every project. We stand behind our work." },
  ];

  /* ───────── FEATURE DATA: Project Types Grid ───────── */
  const projectTypesGrid = [
    { name: "Kitchen Remodels", icon: Wrench },
    { name: "Bathroom Renovations", icon: HouseSimple },
    { name: "Room Additions", icon: House },
    { name: "Whole Home Remodels", icon: Ruler },
    { name: "Decks & Patios", icon: Hammer },
    { name: "ADUs & Guest Houses", icon: Buildings },
    { name: "Commercial Tenant Improvements", icon: Warehouse },
    { name: "Structural Repairs", icon: HardHat },
  ];

  /* ───────── FEATURE DATA: Competitor Comparison ───────── */
  const comparisonRows = [
    { label: "Licensed & Bonded", us: true, them: "No / Unknown" },
    { label: "Permit Management", us: true, them: "Risk" },
    { label: "Structural Engineering", us: true, them: "No" },
    { label: "Workmanship Warranty", us: true, them: "Varies" },
    { label: "Full Insurance Coverage", us: true, them: "Risk" },
    { label: "Vetted Subcontractors", us: true, them: "No" },
    { label: "Code Compliance Guarantee", us: true, them: "Risk" },
  ];

  /* ───────── FEATURE DATA: Project Quiz ───────── */
  const quizOptions = [
    { label: "Kitchen or Bath Remodel", tag: "Most Popular", desc: "Update the heart of your home with modern design and premium finishes.", icon: Wrench },
    { label: "Addition or ADU", tag: "Add Space", desc: "Expand your living area with a permitted, professionally built addition.", icon: Buildings },
    { label: "Whole Home Renovation", tag: "Transform Everything", desc: "Reimagine your entire home — layout, finishes, systems, and more.", icon: HouseSimple },
    { label: "Commercial Build-Out", tag: "Business Space", desc: "Professional tenant improvements and commercial construction.", icon: Warehouse },
  ];

  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden" style={{ background: BG, color: "#f1f5f9" }}>
      <FloatingSparks accent={ACCENT} />

      {/* ══════ 1. NAV ══════ */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-4">
          <GlassCard className="flex items-center justify-between px-4 md:px-6 py-3">
            <div className="flex items-center gap-2">
              <Hammer size={24} weight="fill" style={{ color: ACCENT }} />
              <span className="text-lg font-bold tracking-tight text-white">{data.businessName}</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
              <a href="#services" className="hover:text-white transition-colors">Services</a>
              <a href="#about" className="hover:text-white transition-colors">About</a>
              <a href="#projects" className="hover:text-white transition-colors">Projects</a>
              <a href="#contact" className="hover:text-white transition-colors">Contact</a>
            </div>
            <div className="flex items-center gap-3">
              <MagneticButton className="px-4 md:px-5 py-2 rounded-full text-sm font-semibold text-white transition-colors cursor-pointer" style={{ background: ACCENT } as React.CSSProperties}>Free Estimate</MagneticButton>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors">
                {mobileMenuOpen ? <X size={24} /> : <List size={24} />}
              </button>
            </div>
          </GlassCard>
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3, ease: "easeInOut" }} className="md:hidden mt-2 overflow-hidden">
                <GlassCard className="flex flex-col gap-1 px-4 py-4">
                  {["Services", "About", "Projects", "Contact"].map((l) => (
                    <a key={l} href={`#${l.toLowerCase()}`} onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors">{l}</a>
                  ))}
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* ══════ 2. HERO ══════ */}
      <section className="relative min-h-[100dvh] flex items-center pt-24 z-10 overflow-hidden">

        <div className="absolute inset-0">
          <img src={heroImage} alt={`${data.businessName}`} className="w-full h-full object-cover object-center" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        </div>
        <BlueprintGrid opacity={0.04} accent={ACCENT} />
        <ConstructionBeams opacity={0.04} accent={ACCENT} />

        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          <div className="space-y-8 rounded-2xl bg-black/50 backdrop-blur-md p-6 md:p-8 border border-white/8">
            <div>
              <p className="text-sm uppercase tracking-widest mb-4" style={{ color: ACCENT }}>Licensed General Contractor</p>
              <h1 className="text-3xl md:text-6xl tracking-tighter leading-none font-bold text-white" style={{ textShadow: "0 2px 20px rgba(0,0,0,0.8), 0 4px 40px rgba(0,0,0,0.5)" }}>{data.tagline}</h1>
            </div>
            <p className="text-lg text-slate-400 max-w-md leading-relaxed">{(() => { const t = data.about; if (t.length <= 180) return t; const dot = t.indexOf('.', 80); return dot > 0 && dot < 220 ? t.slice(0, dot + 1) : t.slice(0, 180).trim() + '...'; })()}</p>
            <div className="flex flex-wrap gap-4">
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white flex items-center gap-2 cursor-pointer" style={{ background: ACCENT } as React.CSSProperties}>
                Get Free Estimate <ArrowRight size={18} weight="bold" />
              </MagneticButton>
              <MagneticButton href={`tel:${data.phone.replace(/\D/g, "")}`} className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/15 flex items-center gap-2 cursor-pointer">
                <Phone size={18} weight="duotone" /> <PhoneLink phone={data.phone} />
              </MagneticButton>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-slate-400">
              <span className="flex items-center gap-2"><MapPin size={16} weight="duotone" style={{ color: ACCENT }} /> <MapLink address={data.address} /></span>
              <span className="flex items-center gap-2"><Clock size={16} weight="duotone" style={{ color: ACCENT }} /> {data.hours || "Mon-Sat 7AM-6PM"}</span>
            </div>
          </div>
          <div className="hidden md:block relative">
            <div className="relative rounded-2xl overflow-hidden border border-white/15">
              <img src={heroCardImage} alt={`${data.businessName} construction`} className="w-full h-[500px] object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a2030] via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6">
                <div className="px-4 py-2 rounded-full backdrop-blur-md bg-black/50 border flex items-center gap-2" style={{ borderColor: `${ACCENT}4d` }}>
                  <ShieldCheck size={18} weight="fill" style={{ color: ACCENT }} />
                  <span className="text-sm font-semibold text-white">Licensed &amp; Bonded</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════ 3. STATS ══════ */}
      <section className="relative z-10 py-16 overflow-hidden border-y" style={{ borderColor: `${ACCENT}1a` }}>
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, #12141a 0%, ${BG} 100%)` }} />
        <BlueprintGrid opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {data.stats.map((stat, i) => {
              const icons = [Hammer, Clock, ShieldCheck, Star];
              const Icon = icons[i % icons.length];
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

      {/* ══════ 3b. PROJECT TYPE BADGES ══════ */}
      <section className="relative z-10 py-10 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #12141a 100%)` }} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="flex flex-wrap justify-center gap-3">
            {projectTypeBadges.map((badge) => (
              <span key={badge} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold border transition-colors" style={{ color: ACCENT, borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}>
                <Hammer size={16} weight="duotone" /> {badge}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ 4. SERVICES ══════ */}
      <section id="services" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #12141a 50%, ${BG} 100%)` }} />
        <BlueprintGrid accent={ACCENT} />
        <ConstructionBeams opacity={0.025} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Our Services" title="Comprehensive Construction Services" subtitle={`From remodeling to new construction, ${data.businessName} delivers exceptional craftsmanship every time.`} accent={ACCENT} />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.services.map((service, i) => {
              const Icon = getServiceIcon(service.name);
              return (
                <div key={service.name} className="group relative p-7 rounded-2xl border border-white/[0.10] hover:border-opacity-30 transition-all duration-500 overflow-hidden bg-white/[0.07]">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: `radial-gradient(circle at 50% 0%, ${ACCENT}15, transparent 70%)` }} />
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

      {/* ══════ 4b. PROJECT INVESTMENT GUIDE ══════ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, #12141a 0%, ${BG} 50%, #12141a 100%)` }} />
        <BlueprintGrid opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Investment Guide" title="Transparent Project Pricing" subtitle="No hidden fees. No surprises. Know what to expect before you commit." accent={ACCENT} />
          <div className="grid md:grid-cols-3 gap-6">
            {investmentCards.map((card) => (
              <GlassCard key={card.title} className="p-8 text-center relative overflow-hidden group">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: `radial-gradient(circle at 50% 0%, ${ACCENT}12, transparent 70%)` }} />
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-2xl mx-auto mb-5 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${ACCENT}22, ${ACCENT}0a)`, border: `1px solid ${ACCENT}33` }}>
                    <card.icon size={28} weight="duotone" style={{ color: ACCENT }} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">{card.title}</h3>
                  <p className="text-2xl font-extrabold mb-3" style={{ color: ACCENT }}>{card.price}</p>
                  <p className="text-sm text-slate-400 leading-relaxed">{card.desc}</p>
                </div>
              </GlassCard>
            ))}
          </div>
          <p className="text-center text-slate-500 text-sm mt-6">Every project is unique — contact us for a detailed, no-obligation estimate tailored to your home.</p>
        </div>
      </section>

      {/* ══════ 5. ABOUT ══════ */}
      <section id="about" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #10121a 50%, ${BG} 100%)` }} />
        <ConstructionBeams opacity={0.02} accent={ACCENT} />
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
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6 text-white">Build It Right the First Time</h2>
              <p className="text-slate-400 leading-relaxed mb-8">{data.about}</p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: ShieldCheck, label: "Fully Licensed" },
                  { icon: CheckCircle, label: "Bonded & Insured" },
                  { icon: Star, label: "5-Star Rated" },
                  { icon: Users, label: "Expert Crews" },
                ].map((badge) => (
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

      {/* ══════ 5b. WHY CHOOSE A LICENSED GC ══════ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #12141a 50%, ${BG} 100%)` }} />
        <ConstructionBeams opacity={0.025} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Licensed Contractor" title="Why Hire a Licensed General Contractor?" subtitle="The difference between a professional operation and a contractor horror story." accent={ACCENT} />
          <div className="grid md:grid-cols-2 gap-6">
            {licensedPillars.map((pillar) => (
              <GlassCard key={pillar.title} className="p-7 flex items-start gap-5 group">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0" style={{ background: `linear-gradient(135deg, ${ACCENT}22, ${ACCENT}0a)`, border: `1px solid ${ACCENT}33` }}>
                  <pillar.icon size={28} weight="duotone" style={{ color: ACCENT }} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">{pillar.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{pillar.desc}</p>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ 6. PROCESS ══════ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #12141a 50%, ${BG} 100%)` }} />
        <BlueprintGrid opacity={0.025} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Our Build Process" title="From Vision to Completion" subtitle="A proven 5-step process that keeps your project on time, on budget, and stress-free." accent={ACCENT} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {buildProcess.map((step, i) => (
              <div key={step.step} className="relative">
                {i < buildProcess.length - 1 && <div className="hidden lg:block absolute top-10 left-[calc(50%+40px)] w-[calc(100%-80px)] h-px" style={{ background: `linear-gradient(to right, ${ACCENT}33, ${ACCENT}11)` }} />}
                <GlassCard className="p-6 text-center relative h-full">
                  <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${ACCENT}22, ${ACCENT}0a)`, border: `1px solid ${ACCENT}33` }}>
                    <step.icon size={24} weight="duotone" style={{ color: ACCENT }} />
                  </div>
                  <span className="text-xs font-mono mb-2 block" style={{ color: ACCENT }}>Step {step.step}</span>
                  <h3 className="text-base font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
                </GlassCard>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ 6b. PROJECT TYPES WE HANDLE ══════ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, #12141a 0%, ${BG} 50%, #12141a 100%)` }} />
        <ConstructionBeams opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="What We Build" title="Project Types We Handle" subtitle={`From small remodels to ground-up construction, ${data.businessName} has the experience to deliver.`} accent={ACCENT} />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {projectTypesGrid.map((pt) => (
              <GlassCard key={pt.name} className="p-5 text-center group hover:border-opacity-30 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center" style={{ background: ACCENT_GLOW, border: `1px solid ${ACCENT}33` }}>
                  <pt.icon size={24} weight="duotone" style={{ color: ACCENT }} />
                </div>
                <span className="text-sm font-semibold text-white">{pt.name}</span>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ 7. PROJECTS GALLERY ══════ */}
      <section id="projects" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #10121a 50%, ${BG} 100%)` }} />
        <ConstructionBeams opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <AnimatedSection>          <SectionHeader badge="Our Work" title="Recent Projects" accent={ACCENT} /></AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projectImages.map((src, i) => {
              const titles = ["Kitchen Remodel", "Custom Home Build", "Commercial Build-Out", "Bathroom Renovation"];
              return (
                <div key={i} className="group relative rounded-2xl overflow-hidden border border-white/[0.10]">
                  <img src={src} alt={titles[i] || `Project ${i + 1}`} className="w-full h-64 object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-lg font-bold text-white">{titles[i] || `Project ${i + 1}`}</h3>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════ 7b. COMPETITOR COMPARISON TABLE ══════ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #12141a 50%, ${BG} 100%)` }} />
        <BlueprintGrid opacity={0.02} accent={ACCENT} />
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <SectionHeader badge="The Difference" title={`${data.businessName} vs. Handyman / Unlicensed`} subtitle="Don't risk your biggest investment with an unlicensed contractor." accent={ACCENT} />
          <GlassCard className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/15">
                    <th className="px-6 py-4 text-slate-400 font-medium">Feature</th>
                    <th className="px-6 py-4 text-center font-bold text-white">{data.businessName}</th>
                    <th className="px-6 py-4 text-center font-medium text-slate-400">Unlicensed</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row, i) => (
                    <tr key={row.label} className={i < comparisonRows.length - 1 ? "border-b border-white/8" : ""}>
                      <td className="px-6 py-4 text-slate-300 font-medium">{row.label}</td>
                      <td className="px-6 py-4 text-center">
                        <CheckCircle size={22} weight="fill" className="inline-block" style={{ color: ACCENT }} />
                      </td>
                      <td className="px-6 py-4 text-center text-red-400 font-medium">{row.them}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* ══════ 7c. VIDEO PLACEHOLDER ══════ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, #12141a 0%, ${BG} 50%, #12141a 100%)` }} />
        <ConstructionBeams opacity={0.02} accent={ACCENT} />
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <SectionHeader badge="See Our Work" title="Tour Our Recent Projects" accent={ACCENT} />
          <div className="relative rounded-2xl overflow-hidden border border-white/15 group cursor-pointer">
            <img src={projectImages[0]} alt="Project tour" className="w-full h-64 md:h-96 object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full flex items-center justify-center border-2 transition-transform duration-300 group-hover:scale-110" style={{ background: `${ACCENT}cc`, borderColor: ACCENT }}>
                <Play size={36} weight="fill" className="text-white ml-1" />
              </div>
            </div>
            <div className="absolute bottom-6 left-6">
              <p className="text-white font-bold text-lg">Watch Our Craftsmanship in Action</p>
              <p className="text-slate-300 text-sm">See how {data.businessName} transforms spaces</p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════ 8. TESTIMONIALS ══════ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #12141a 50%, ${BG} 100%)` }} />
        <BlueprintGrid opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Testimonials" title="What Our Clients Say" accent={ACCENT} />
          {/* Google Reviews Header */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={24} weight="fill" style={{ color: "#facc15" }} />
              ))}
            </div>
            <span className="text-white font-bold text-lg">
              {data.googleRating || "4.9"} Rating
            </span>
            <span className="text-slate-400 text-sm">
              ({data.reviewCount || "100"}+ verified reviews on Google)
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <GlassCard key={i} className="p-6 h-full flex flex-col">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.rating || 5 }).map((_, j) => <Star key={j} size={16} weight="fill" style={{ color: ACCENT }} />)}
                </div>
                <p className="text-slate-300 leading-relaxed flex-1 text-sm mb-4">&ldquo;{t.text}&rdquo;</p>
                <div className="pt-4 border-t border-white/8"><span className="text-sm font-semibold text-white">{t.name}</span></div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      
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

      {/* ══════ 8b. "WHAT'S YOUR PROJECT?" QUIZ ══════ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #10121a 50%, ${BG} 100%)` }} />
        <BlueprintGrid opacity={0.02} accent={ACCENT} />
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Get Started" title="What's Your Project?" subtitle="Select your project type for a free, personalized estimate." accent={ACCENT} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {quizOptions.map((opt) => (
              <GlassCard key={opt.label} className="p-6 group cursor-pointer hover:border-opacity-30 transition-all duration-300 relative overflow-hidden">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: `radial-gradient(circle at 50% 0%, ${ACCENT}12, transparent 70%)` }} />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: ACCENT_GLOW, border: `1px solid ${ACCENT}33` }}>
                      <opt.icon size={24} weight="duotone" style={{ color: ACCENT }} />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full" style={{ color: ACCENT, background: `${ACCENT}0d`, border: `1px solid ${ACCENT}33` }}>{opt.tag}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{opt.label}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed mb-4">{opt.desc}</p>
                  <span className="inline-flex items-center gap-2 text-sm font-semibold" style={{ color: ACCENT }}>
                    Get Free Estimate <ArrowRight size={16} weight="bold" />
                  </span>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ 9. FAQ ══════ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #12141a 50%, ${BG} 100%)` }} />
        <ConstructionBeams opacity={0.02} accent={ACCENT} />
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <AnimatedSection>          <SectionHeader badge="FAQ" title="Common Questions" accent={ACCENT} /></AnimatedSection>
          <div className="space-y-3">
            {faqs.map((faq, i) => <AccordionItem key={i} question={faq.q} answer={faq.a} isOpen={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} />)}
          </div>
        </div>
      </section>

      {/* ══════ 10. CONTACT ══════ */}
      <section id="contact" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #10121a 50%, ${BG} 100%)` }} />
        <BlueprintGrid opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: ACCENT, borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}>Contact Us</span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6 text-white">Let&apos;s Build Something Great</h2>
              <p className="text-slate-400 leading-relaxed mb-8">Ready to start your project? Contact {data.businessName} today for a free, no-obligation estimate.</p>
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: ACCENT_GLOW }}><MapPin size={20} weight="duotone" style={{ color: ACCENT }} /></div>
                  <div><p className="text-sm font-semibold text-white">Address</p><MapLink address={data.address} className="text-sm text-slate-400" /></div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: ACCENT_GLOW }}><Phone size={20} weight="duotone" style={{ color: ACCENT }} /></div>
                  <div><p className="text-sm font-semibold text-white">Phone</p><PhoneLink phone={data.phone} className="text-sm text-slate-400" /></div>
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
                  <div><label className="block text-sm text-slate-400 mb-1.5">First Name</label><input type="text" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 focus:outline-none text-sm" placeholder="John" /></div>
                  <div><label className="block text-sm text-slate-400 mb-1.5">Last Name</label><input type="text" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 focus:outline-none text-sm" placeholder="Doe" /></div>
                </div>
                <div><label className="block text-sm text-slate-400 mb-1.5">Phone</label><input type="tel" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 focus:outline-none text-sm" placeholder="(555) 123-4567" /></div>
                <div><label className="block text-sm text-slate-400 mb-1.5">Project Type</label>
                  <select className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white focus:outline-none text-sm">
                    <option value="" className="bg-neutral-900">Select a service</option>
                    {data.services.map((s) => <option key={s.name} value={s.name.toLowerCase()} className="bg-neutral-900">{s.name}</option>)}
                  </select>
                </div>
                <div><label className="block text-sm text-slate-400 mb-1.5">Message</label><textarea rows={4} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 focus:outline-none text-sm resize-none" placeholder="Tell us about your project..." /></div>
                <MagneticButton className="w-full py-4 rounded-xl text-base font-semibold text-white flex items-center justify-center gap-2 cursor-pointer" style={{ background: ACCENT } as React.CSSProperties}>
                  Send Request <ArrowRight size={18} weight="bold" />
                </MagneticButton>
              </form>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* ══════ 11. PROJECT GUARANTEE CTA ══════ */}
      <section className="relative z-10 py-16 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #12141a 100%)` }} />
        <BlueprintGrid opacity={0.015} accent={ACCENT} />
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <ShimmerBorder accent={ACCENT}>
            <div className="p-8 md:p-14">
              <ShieldCheck size={56} weight="fill" style={{ color: ACCENT }} className="mx-auto mb-5" />
              <h2 className="text-2xl md:text-4xl font-extrabold text-white mb-3">Every Project On Time, On Budget, Guaranteed</h2>
              <p className="text-slate-400 leading-relaxed max-w-2xl mx-auto text-lg mb-6">
                {data.businessName} delivers craftsmanship you can count on. From the first consultation to the final walkthrough, your satisfaction is our priority.
              </p>
              <MagneticButton className="px-10 py-4 rounded-full text-base font-bold text-white flex items-center gap-2 mx-auto cursor-pointer" style={{ background: ACCENT } as React.CSSProperties}>
                Get Your Free Estimate <ArrowRight size={18} weight="bold" />
              </MagneticButton>
              <div className="flex flex-wrap justify-center gap-4 mt-8">
                {["Licensed & Bonded", "Free Estimates", "Workmanship Warranty", "On-Time Guarantee", "Satisfaction Guaranteed"].map((item) => (
                  <span key={item} className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border" style={{ color: ACCENT, borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}>
                    <CheckCircle size={16} weight="fill" /> {item}
                  </span>
                ))}
              </div>
              <p className="text-slate-500 text-xs mt-6 tracking-wide">
                <ShieldCheck size={14} weight="fill" className="inline-block mr-1" style={{ color: ACCENT }} />
                Licensed General Contractor &bull; Fully Bonded &amp; Insured
              </p>
            </div>
          </ShimmerBorder>
        </div>
      </section>

      {/* ══════ PROJECT GALLERY EXPANDED ══════ */}
      <section className="relative z-10 py-20 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #141c28 50%, ${BG} 100%)` }} />
        <BlueprintGrid opacity={0.01} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-12">
            <HouseSimple size={40} weight="duotone" style={{ color: ACCENT }} className="mx-auto mb-3" />
            <h2 className="text-3xl md:text-4xl font-extrabold text-white">Project Types We Excel At</h2>
            <p className="text-slate-400 mt-3 max-w-xl mx-auto">From kitchen remodels to ground-up construction, we deliver every project on time and on budget.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { type: "Kitchen Remodels", desc: "Custom cabinetry, countertops, backsplash, and layout redesign" },
              { type: "Bathroom Renovations", desc: "Walk-in showers, tile work, vanities, and plumbing upgrades" },
              { type: "Room Additions", desc: "Seamless extensions that match your home's existing architecture" },
              { type: "Whole-Home Remodels", desc: "Complete interior transformations from floor plan to finishes" },
              { type: "Outdoor Living", desc: "Decks, patios, pergolas, outdoor kitchens, and hardscaping" },
              { type: "New Construction", desc: "Custom homes built from the ground up to your specifications" },
              { type: "Commercial Build-Outs", desc: "Office spaces, retail stores, restaurants, and tenant improvements" },
              { type: "ADU & Garage Conversions", desc: "Accessory dwelling units and garage-to-living-space conversions" },
            ].map((p) => (
              <div key={p.type} className="rounded-2xl border border-white/15 p-5 text-center" style={{ background: "rgba(255,255,255,0.06)" }}>
                <Hammer size={24} weight="duotone" style={{ color: ACCENT }} className="mx-auto mb-2" />
                <h3 className="text-sm font-bold text-white mb-1">{p.type}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ WARRANTY SECTION ══════ */}
      <section className="relative z-10 py-20 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, #141c28 0%, ${BG} 100%)` }} />
        <BlueprintGrid opacity={0.012} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-12">
            <ShieldCheck size={40} weight="duotone" style={{ color: ACCENT }} className="mx-auto mb-3" />
            <h2 className="text-3xl md:text-4xl font-extrabold text-white">Our Warranty & Guarantees</h2>
            <div className="w-16 h-1 mx-auto mt-3 rounded-full" style={{ background: ACCENT }} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Workmanship Warranty", desc: "Every project backed by our comprehensive workmanship warranty. If something isn't right, we come back and fix it — no questions asked." },
              { title: "Material Guarantees", desc: "We only use premium materials from trusted manufacturers. All materials carry the manufacturer's full warranty and we handle any claims for you." },
              { title: "On-Time Completion", desc: "We commit to a completion date in writing. If we miss our deadline through any fault of our own, we'll make it right with a project discount." },
            ].map((w) => (
              <div key={w.title} className="rounded-2xl border border-white/15 p-6" style={{ background: "rgba(255,255,255,0.06)" }}>
                <CheckCircle size={24} weight="fill" style={{ color: ACCENT }} className="mb-3" />
                <h3 className="text-lg font-bold text-white mb-2">{w.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ MID-PAGE CTA ══════ */}
      <section className="relative z-10 py-16 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${ACCENT}15 0%, ${BG} 50%, ${ACCENT}08 100%)` }} />
        <BlueprintGrid opacity={0.02} accent={ACCENT} />
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <Hammer size={44} weight="fill" style={{ color: ACCENT }} className="mx-auto mb-4" />
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">Let&apos;s Build Something Great</h2>
          <p className="text-slate-400 max-w-2xl mx-auto mb-8 text-lg">
            {data.businessName} offers free consultations and transparent estimates. Tell us about your project and we&apos;ll create a detailed plan and timeline.
          </p>
          <a href={`tel:${data.phone}`} className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-white font-bold text-lg transition-transform hover:scale-105" style={{ background: ACCENT }}>
            <Phone size={20} weight="fill" /> Get a Free Estimate
          </a>
        </div>
      </section>

      {/* ══════ WHY CHOOSE US ══════ */}
      <section className="relative z-10 py-20 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #141c28 100%)` }} />
        <BlueprintGrid opacity={0.01} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white">Why Choose <span style={{ color: ACCENT }}>{data.businessName}</span></h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { title: "Licensed & Bonded", desc: "Fully licensed general contractor with comprehensive bonding and liability insurance" },
              { title: "Permit Handling", desc: "We pull all permits and manage inspections so you never have to visit city hall" },
              { title: "Transparent Bids", desc: "Detailed line-item estimates with no hidden costs. You see exactly where every dollar goes" },
              { title: "Clean Job Sites", desc: "Daily cleanup and professional job site management. Your home stays livable during construction" },
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

      {/* ══════ 12. FOOTER ══════ */}
      <footer className="relative z-10 border-t border-white/8 py-10 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #141c28 100%)` }} />
        <BlueprintGrid opacity={0.015} accent={ACCENT} />
        <div className="mx-auto max-w-6xl px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3"><Hammer size={22} weight="fill" style={{ color: ACCENT }} /><span className="text-lg font-bold text-white">{data.businessName}</span></div>
              <p className="text-sm text-slate-500 leading-relaxed">{data.about.length > 120 ? data.about.slice(0, 120).trim() + "..." : data.about}</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-3">Quick Links</h4>
              <div className="space-y-2">
                {["Services", "About", "Projects", "Contact"].map((link) => <a key={link} href={`#${link.toLowerCase()}`} className="block text-sm text-slate-500 hover:text-white transition-colors">{link}</a>)}
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
            <div className="flex items-center gap-2 text-sm text-slate-500"><Hammer size={14} weight="fill" style={{ color: ACCENT }} /><span>{data.businessName} &copy; {new Date().getFullYear()}</span></div>
            <div className="flex items-center gap-2 text-xs text-slate-600"><BluejayLogo className="w-4 h-4" /><span>Created by <a href="https://bluejayportfolio.com" target="_blank" rel="noopener noreferrer" style={{textDecoration:"underline"}}>bluejayportfolio.com</a></span></div>
          </div>
        </div>
      </footer>

      <ClaimBanner businessName={data.businessName} accentColor={ACCENT} prospectId={data.id} />
      <div className="h-14 md:h-28" />
    </main>
  );
}
