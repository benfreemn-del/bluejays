"use client";

/* eslint-disable @next/next/no-img-element -- These static marketing and preview components intentionally use plain img tags to preserve existing markup and visual behavior during lint-only cleanup. */
/* eslint-disable react-hooks/purity -- Decorative particle values are intentionally randomized for static visual effects in these marketing pages and previews; this preserves existing appearance without changing business logic. */

import { useState, useRef, useCallback } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useInView,
  AnimatePresence,
} from "framer-motion";
import {
  Star,
  ShieldCheck,
  CaretDown,
  Phone,
  MapPin,
  Clock,
  ArrowRight,
  Quotes,
  X,
  List,
  HardHat,
  Hammer,
  Wrench,
  House,
  Buildings,
  Ruler,
  CalendarCheck,
  Users,
  Timer,
  Medal,
  Certificate,
  CheckCircle,
  Wall,
} from "@phosphor-icons/react";

/* ───────────────────────── SPRING CONFIG ───────────────────────── */
const spring = { type: "spring" as const, stiffness: 100, damping: 20 };
const springFast = { type: "spring" as const, stiffness: 200, damping: 25 };

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: spring },
};

/* ───────────────────────── COLORS ───────────────────────── */
const BG = "#1a1208";
const ACCENT = "#ea580c";
const ACCENT_LIGHT = "#fb923c";
const ACCENT_GLOW = "rgba(234, 88, 12, 0.15)";

/* ───────────────────────── HARD HAT NAV ICON ───────────────────────── */
function HardHatIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path d="M6 22H26" stroke={ACCENT} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M8 22V16C8 11.58 11.58 8 16 8C20.42 8 24 11.58 24 16V22" stroke={ACCENT_LIGHT} strokeWidth="2" />
      <rect x="14" y="4" width="4" height="4" rx="1" fill={ACCENT} opacity="0.6" />
      <path d="M6 22V24C6 25.1 6.9 26 8 26H24C25.1 26 26 25.1 26 24V22" stroke={ACCENT} strokeWidth="1.5" />
    </svg>
  );
}

/* ───────────────────────── BLUEPRINT SVG PATTERN ───────────────────────── */
function BlueprintPattern() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden hidden md:block opacity-[0.03]">
      <svg width="100%" height="100%">
        <defs>
          <pattern id="blueprint-grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke={ACCENT_LIGHT} strokeWidth="0.5" />
            <path d="M 30 0 L 30 60" fill="none" stroke={ACCENT_LIGHT} strokeWidth="0.25" />
            <path d="M 0 30 L 60 30" fill="none" stroke={ACCENT_LIGHT} strokeWidth="0.25" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#blueprint-grid)" />
      </svg>
    </div>
  );
}

/* ───────────────────────── CONSTRUCTION DUST PARTICLES ───────────────────────── */
function ConstructionParticles() {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 10,
    duration: 8 + Math.random() * 6,
    size: 1 + Math.random() * 2.5,
    opacity: 0.06 + Math.random() * 0.15,
  }));

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden hidden md:block">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{ left: `${p.x}%`, width: p.size, height: p.size, background: ACCENT_LIGHT, willChange: "transform, opacity" }}
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

/* ───────────────────────── SHARED COMPONENTS ───────────────────────── */
function WordReveal({ text, className = "" }: { text: string; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const words = text.split(" ");
  return (
    <motion.span ref={ref} className={`inline-flex flex-wrap gap-x-3 ${className}`} variants={stagger} initial="hidden" animate={isInView ? "show" : "hidden"}>
      {words.map((word, i) => (<motion.span key={i} variants={fadeUp} className="inline-block">{word}</motion.span>))}
    </motion.span>
  );
}

function SectionReveal({ children, className = "", id }: { children: React.ReactNode; className?: string; id?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.section ref={ref} id={id} className={className} initial={{ opacity: 0, y: 50 }} animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }} transition={spring}>
      {children}
    </motion.section>
  );
}

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (<div className={`rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] ${className}`}>{children}</div>);
}

function MagneticButton({ children, className = "", onClick, style }: { children: React.ReactNode; className?: string; onClick?: () => void; style?: React.CSSProperties }) {
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
  return (
    <motion.button ref={ref} style={{ x: springX, y: springY, willChange: "transform", ...style }} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} onClick={onClick} className={className} whileTap={{ scale: 0.97 }}>
      {children}
    </motion.button>
  );
}

function ShimmerBorder({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative rounded-2xl p-[1px] overflow-hidden ${className}`}>
      <motion.div className="absolute inset-0 rounded-2xl" style={{ background: `conic-gradient(from 0deg, transparent, ${ACCENT}, transparent, ${ACCENT_LIGHT}, transparent)`, willChange: "transform" }} animate={{ rotate: [0, 360] }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} />
      <div className="relative rounded-2xl z-10" style={{ background: BG }}>{children}</div>
    </div>
  );
}

function ConstructionQuizOption({ opt }: { opt: { label: string; note: string; color: string } }) {
  const [selected, setSelected] = useState(false);
  return (
    <div>
      <button onClick={() => setSelected(!selected)} className="w-full text-left p-4 rounded-xl border transition-all cursor-pointer" style={{ borderColor: selected ? opt.color : "rgba(255,255,255,0.1)", background: selected ? `${opt.color}15` : "rgba(255,255,255,0.03)" }}>
        <p className="text-sm font-semibold text-white mb-1">{opt.label}</p>
        <p className="text-xs text-slate-400">{opt.note}</p>
      </button>
      <AnimatePresence initial={false}>
        {selected && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
            <div className="mt-2 p-3 rounded-xl text-sm text-slate-300 flex items-center justify-between gap-3" style={{ background: "rgba(255,255,255,0.04)", borderLeft: `3px solid ${opt.color}` }}>
              <span>Great choice! Let us schedule a free on-site consultation to discuss scope, budget, and timeline.</span>
              <a href="tel:+12067394582" className="shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold text-white" style={{ background: opt.color }}>Call Now</a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ───────────────────────── DATA ───────────────────────── */
const services = [
  { title: "Residential Construction", description: "Custom home builds, additions, and major renovations from foundation to finish. We manage every trade, permit, and inspection so you get a turnkey result.", icon: House },
  { title: "Commercial Construction", description: "Office buildings, retail spaces, warehouses, and tenant improvements. We deliver on time and on budget with dedicated project managers for every job.", icon: Buildings },
  { title: "Remodeling & Renovation", description: "Kitchen and bath remodels, basement finishing, whole-home renovations, and structural modifications. We transform existing spaces into something extraordinary.", icon: Hammer },
  { title: "Concrete & Foundation", description: "Foundations, slabs, driveways, retaining walls, and decorative concrete. Our crews handle everything from formwork to finishing with precision.", icon: Wall },
  { title: "Steel & Structural", description: "Structural steel erection, welding, metal buildings, and reinforcement. We work with architects and engineers to bring complex designs to life safely.", icon: Wrench },
  { title: "Project Management", description: "Full-service construction management including budgeting, scheduling, subcontractor coordination, quality control, and owner representation.", icon: Ruler },
];

const testimonials = [
  { name: "Richard & Sara K.", text: "They built our dream home from the ground up. Every detail was handled with care and the communication throughout the 10-month build was exceptional. Could not be happier.", rating: 5 },
  { name: "Thompson Corp.", text: "Apex completed our 20,000 sqft office build two weeks ahead of schedule and under budget. Their project management is top-notch and their crews are professional.", rating: 5 },
  { name: "Lisa M.", text: "Our kitchen and bathroom remodel exceeded all expectations. The quality of craftsmanship is evident in every corner. They treated our home like it was their own.", rating: 5 },
];

const certifications = [
  "OSHA 30-Hour Certified", "EPA Lead-Safe Certified", "ICC Building Inspector", "LEED Certified Builder", "BBB A+ Accredited", "Licensed General Contractor", "Bonded & Insured", "Workers Comp Coverage",
];

const faqData = [
  { q: "How long does a typical home build take?", a: "A standard custom home takes 8-14 months depending on size and complexity. We provide a detailed timeline before breaking ground and keep you updated weekly." },
  { q: "Do you handle all permits and inspections?", a: "Yes. We manage all permitting, zoning applications, and building inspections from start to finish. You never have to visit a government office." },
  { q: "Can I make changes during construction?", a: "Change orders are common and we handle them smoothly. We provide a written cost and timeline impact for any changes before proceeding, so there are no surprises." },
  { q: "Do you offer financing?", a: "We work with several construction lenders and can recommend financing options. We also structure payment schedules around project milestones." },
  { q: "What warranty do you provide?", a: "All our work comes with a 2-year workmanship warranty and we pass through all manufacturer warranties on materials and systems, typically 10-25 years." },
  { q: "Are you licensed and insured?", a: "Absolutely. We are a fully licensed general contractor with comprehensive liability insurance, workers compensation, and bonding. Documentation available on request." },
];

const portfolioImages = [
  "https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=600&q=80",
  "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=600&q=80",
  "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&q=80",
  "https://images.unsplash.com/photo-1429497419816-9ca5cfb4571a?w=600&q=80",
  "https://images.unsplash.com/photo-1590644365607-1c5e52a0baa7?w=600&q=80",
  "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600&q=80",
];

/* ═══════════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════════ */
export default function V2ConstructionPage() {
  const [openService, setOpenService] = useState<number | null>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden" style={{ background: BG, color: "#f1f5f9" }}>
      <BlueprintPattern />
      <ConstructionParticles />

      {/* ─── NAV ─── */}
      <motion.nav initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-4">
          <GlassCard className="flex items-center justify-between px-4 md:px-6 py-3">
            <div className="flex items-center gap-2">
              <HardHatIcon size={24} />
              <span className="text-lg font-bold tracking-tight text-white">Apex Construction</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
              <a href="#services" className="hover:text-white transition-colors">Services</a>
              <a href="#portfolio" className="hover:text-white transition-colors">Portfolio</a>
              <a href="#about" className="hover:text-white transition-colors">About</a>
              <a href="#testimonials" className="hover:text-white transition-colors">Reviews</a>
            </div>
            <div className="flex items-center gap-3">
              <MagneticButton className="px-4 md:px-5 py-2 rounded-full text-sm font-semibold text-white transition-colors" style={{ background: ACCENT } as React.CSSProperties}>
                Get Quote
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
                  {[{ label: "Services", href: "#services" }, { label: "Portfolio", href: "#portfolio" }, { label: "About", href: "#about" }, { label: "Reviews", href: "#testimonials" }].map((link) => (
                    <a key={link.label} href={link.href} onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors">{link.label}</a>
                  ))}
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.nav>

      {/* ─── 1. HERO ─── */}
      <section className="relative min-h-[100dvh] flex items-center pt-24 z-10">
        <div className="absolute inset-0 z-0">
          <img src="https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=1600&q=80" alt="" className="w-full h-full object-cover object-center" />
          <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${BG}f0 0%, ${BG}dd 50%, ${BG}aa 100%)` }} />
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div>
              <motion.p initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ ...spring, delay: 0.1 }} className="text-sm uppercase tracking-widest mb-4" style={{ color: ACCENT }}>
                Licensed General Contractor
              </motion.p>
              <h1 className="text-3xl md:text-6xl tracking-tighter leading-none font-bold text-white" style={{ textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>
                <WordReveal text="Building Your Vision, On Time" />
              </h1>
            </div>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.6 }} className="text-lg text-slate-300 max-w-md leading-relaxed">
              From custom homes to commercial projects, Apex Construction delivers exceptional craftsmanship, transparent pricing, and reliable timelines. Your project is in expert hands.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.8 }} className="flex flex-wrap gap-4">
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white flex items-center gap-2 cursor-pointer" style={{ background: ACCENT } as React.CSSProperties}>
                Start Your Project <ArrowRight size={18} weight="bold" />
              </MagneticButton>
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/10 flex items-center gap-2 cursor-pointer">
                <Phone size={18} weight="duotone" /> (206) 739-4582
              </MagneticButton>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ ...spring, delay: 1 }} className="flex flex-wrap gap-6 text-sm text-slate-400">
              <span className="flex items-center gap-2"><MapPin size={16} weight="duotone" style={{ color: ACCENT }} />Greater Seattle Metro</span>
              <span className="flex items-center gap-2"><Clock size={16} weight="duotone" style={{ color: ACCENT }} />Mon-Fri 7am-5pm</span>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ ...spring, delay: 1.1 }} className="flex flex-wrap gap-2">
              {["Licensed GC", "Bonded & Insured", "Free Estimates", "2-Year Warranty", "25+ Years Experience", "LEED Certified"].map((b, i) => (
                <span key={i} className="px-3 py-1 rounded-full text-xs font-medium border" style={{ borderColor: `${ACCENT}55`, color: ACCENT_LIGHT, background: `${ACCENT}15` }}>{b}</span>
              ))}
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ ...spring, delay: 1.2 }} className="flex items-center gap-2 text-sm">
              <motion.div className="w-2 h-2 rounded-full bg-green-400" animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
              <span className="text-green-400 font-medium">Accepting new projects for Q1 2026</span>
              <span className="text-slate-500">— Limited slots available, book early</span>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ ...spring, delay: 1.3 }} className="text-xs text-slate-500">
              Licensed General Contractor · Washington State License #APEXC-2049 · BBB A+ Rated · OSHA 30-Hour Certified
            </motion.div>
          </div>
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ ...spring, delay: 0.3 }} className="hidden lg:flex items-center justify-center">
            <div className="relative w-full max-w-sm">
              <motion.div className="absolute -inset-8 rounded-full" style={{ background: `radial-gradient(circle, ${ACCENT_GLOW} 0%, transparent 70%)`, filter: "blur(50px)" }} animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} />
              <GlassCard className="p-8 relative z-10">
                <HardHat size={48} weight="duotone" style={{ color: ACCENT }} className="mb-6" />
                <div className="space-y-4">
                  {[
                    { label: "Projects Completed", value: "350+" },
                    { label: "On-Time Delivery", value: "97%" },
                    { label: "Client Satisfaction", value: "4.9 / 5.0" },
                    { label: "Years in Business", value: "25 Years" },
                  ].map((s, i) => (
                    <div key={i} className="flex items-center justify-between border-b border-white/5 pb-3 last:border-0 last:pb-0">
                      <span className="text-sm text-slate-400">{s.label}</span>
                      <span className="text-sm font-bold" style={{ color: ACCENT_LIGHT }}>{s.value}</span>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── URGENCY STRIP ─── */}
      <div className="relative z-10 w-full" style={{ background: ACCENT }}>
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <motion.div className="w-2.5 h-2.5 rounded-full bg-white" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.2, repeat: Infinity }} />
            <span className="text-white text-sm font-semibold">Limited slots for Q1 2026 — Book your free consultation today</span>
          </div>
          <a href="tel:+12067394582" className="text-white font-bold text-sm underline underline-offset-2">(206) 739-4582</a>
        </div>
      </div>

      {/* ─── 2. STATS ─── */}
      <SectionReveal className="relative z-10 pb-8">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <GlassCard className="p-6 md:p-8">
            <motion.div className="grid grid-cols-2 sm:grid-cols-4 gap-6 md:gap-8" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
              {[
                { icon: Star, label: "4.9 Star Rating", desc: "350+ projects" },
                { icon: Timer, label: "On Time", desc: "97% completion rate" },
                { icon: Certificate, label: "Fully Licensed", desc: "Bonded & insured" },
                { icon: Medal, label: "25+ Years", desc: "Building excellence" },
              ].map((stat, i) => (
                <motion.div key={i} variants={fadeUp} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: ACCENT_GLOW }}>
                    <stat.icon size={20} weight="duotone" style={{ color: ACCENT }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{stat.label}</p>
                    <p className="text-xs text-slate-400">{stat.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </GlassCard>
        </div>
      </SectionReveal>

      {/* ─── 3. SERVICES ─── */}
      <SectionReveal id="services" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            <div className="lg:sticky lg:top-32">
              <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ACCENT }}>What We Build</p>
              <h2 className="text-3xl md:text-6xl tracking-tighter leading-none font-bold text-white mb-6">
                <WordReveal text="Full-Service Construction" />
              </h2>
              <p className="text-slate-400 leading-relaxed max-w-md">
                From residential dream homes to large-scale commercial projects, our team brings decades of experience, the best tradespeople, and meticulous project management to every build.
              </p>
            </div>
            <motion.div className="space-y-3" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
              {services.map((svc, i) => (
                <motion.div key={i} variants={fadeUp}>
                  <GlassCard className="overflow-hidden">
                    <button onClick={() => setOpenService(openService === i ? null : i)} className="w-full flex items-center justify-between p-5 md:p-6 text-left group cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: ACCENT_GLOW }}>
                          <svc.icon size={20} weight="duotone" style={{ color: ACCENT }} />
                        </div>
                        <span className="text-lg font-semibold text-white">{svc.title}</span>
                      </div>
                      <motion.div animate={{ rotate: openService === i ? 180 : 0 }} transition={spring}><CaretDown size={20} className="text-slate-400" /></motion.div>
                    </button>
                    <AnimatePresence initial={false}>
                      {openService === i && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={spring} className="overflow-hidden">
                          <p className="px-5 pb-5 md:px-6 md:pb-6 text-slate-400 leading-relaxed pl-[4.5rem]">{svc.description}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </GlassCard>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </SectionReveal>

      {/* ─── 4. PORTFOLIO GALLERY ─── */}
      <SectionReveal id="portfolio" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ACCENT }}>Our Work</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Project Portfolio" />
            </h2>
          </div>
          <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {portfolioImages.map((img, i) => (
              <motion.div key={i} variants={fadeUp} className="aspect-[4/3] rounded-xl overflow-hidden">
                <motion.img src={img} alt={`Construction project ${i + 1}`} className="w-full h-full object-cover" whileHover={{ scale: 1.05 }} transition={{ duration: 0.4 }} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── 5. ABOUT ─── */}
      <SectionReveal id="about" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ACCENT }}>About Apex</p>
              <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white mb-6">
                <WordReveal text="25 Years of Building Trust" />
              </h2>
              <p className="text-slate-400 leading-relaxed mb-6">
                Apex Construction was founded on a simple principle: build it right, on time, and at a fair price. Over 25 years and 350+ completed projects later, that principle still drives everything we do.
              </p>
              <p className="text-slate-400 leading-relaxed">
                Our team includes licensed builders, certified project managers, and the best tradespeople in the region. We handle every phase — from permitting and design coordination to final punch list and warranty.
              </p>
            </div>
            <motion.div className="grid grid-cols-2 gap-4" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
              {[
                { icon: ShieldCheck, label: "Safety Record", desc: "Zero incidents 5yr" },
                { icon: Users, label: "Expert Team", desc: "Licensed builders" },
                { icon: Timer, label: "On Schedule", desc: "97% on-time delivery" },
                { icon: Certificate, label: "Fully Bonded", desc: "Complete coverage" },
              ].map((item, i) => (
                <motion.div key={i} variants={fadeUp}>
                  <GlassCard className="p-5 text-center">
                    <item.icon size={28} weight="duotone" style={{ color: ACCENT }} className="mx-auto mb-2" />
                    <p className="text-sm font-semibold text-white">{item.label}</p>
                    <p className="text-xs text-slate-400 mt-1">{item.desc}</p>
                  </GlassCard>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </SectionReveal>

      {/* ─── BUILD GUARANTEE ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-4 md:px-6">
          <ShimmerBorder>
            <div className="p-8 md:p-12">
              <div className="text-center mb-10">
                <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ACCENT }}>Our Commitment</p>
                <h2 className="text-3xl md:text-4xl font-bold text-white">The Apex Build Guarantee</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { icon: Timer, title: "On Time or We Pay", desc: "If we miss the agreed substantial completion date due to our scheduling (not weather or owner changes), we credit you $500 for every week delayed." },
                  { icon: CheckCircle, title: "On Budget Promise", desc: "Fixed-price contracts mean no surprise invoices. Any scope change gets a written change order with cost and timeline impact before we proceed." },
                  { icon: ShieldCheck, title: "2-Year Workmanship Warranty", desc: "All labor is covered for two full years post-completion. Manufacturer warranties on materials are passed through — often 10-25 years." },
                ].map((item, i) => (
                  <div key={i} className="text-center">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: ACCENT_GLOW }}>
                      <item.icon size={28} weight="duotone" style={{ color: ACCENT }} />
                    </div>
                    <h3 className="text-base font-bold text-white mb-2">{item.title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </ShimmerBorder>
        </div>
      </SectionReveal>

      {/* ─── FINANCING ─── */}
      <SectionReveal className="relative z-10 py-8">
        <div className="mx-auto max-w-5xl px-4 md:px-6">
          <GlassCard className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-white mb-1">Construction Financing Available</p>
                <p className="text-xs text-slate-400">We work with local lenders to help you finance your build. Construction loans, renovation loans, and HELOCs — ask us for referrals to trusted local mortgage partners. No-obligation consultations available with our preferred lenders in King and Snohomish counties.</p>
              </div>
              <MagneticButton className="shrink-0 px-6 py-3 rounded-full text-sm font-semibold text-white cursor-pointer" style={{ background: ACCENT } as React.CSSProperties}>
                Ask About Financing
              </MagneticButton>
            </div>
          </GlassCard>
        </div>
      </SectionReveal>

      {/* ─── PROJECT TYPES GRID ─── */}
      <SectionReveal className="relative z-10 py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-8">
            <p className="text-sm uppercase tracking-widest mb-2" style={{ color: ACCENT }}>What We Build</p>
            <h2 className="text-3xl font-bold text-white">Project Types</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { type: "Custom Homes", range: "$350K–$800K" },
              { type: "Home Additions", range: "$80K–$200K" },
              { type: "Kitchen Remodels", range: "$35K–$90K" },
              { type: "Bathroom Remodels", range: "$15K–$55K" },
              { type: "Basement Finish", range: "$25K–$70K" },
              { type: "Commercial TI", range: "$50K–$500K" },
              { type: "Office Build-Out", range: "$75K–$250K" },
              { type: "Accessory Dwellings", range: "$120K–$280K" },
            ].map((p, i) => (
              <GlassCard key={i} className="p-4">
                <p className="text-sm font-bold text-white mb-1">{p.type}</p>
                <p className="text-xs font-medium" style={{ color: ACCENT_LIGHT }}>{p.range}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ─── 6. PROCESS ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ACCENT }}>Our Process</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="How We Build" />
            </h2>
          </div>
          <motion.div className="grid grid-cols-1 md:grid-cols-4 gap-6" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {[
              { step: "01", title: "Consultation", desc: "We meet on-site, review your vision, discuss budget, and develop a preliminary scope of work." },
              { step: "02", title: "Design & Permits", desc: "We coordinate with architects, engineers, and local authorities to finalize plans and secure all permits." },
              { step: "03", title: "Construction", desc: "Our crews execute the build with weekly updates, quality inspections at every milestone, and transparent budgeting." },
              { step: "04", title: "Handover", desc: "Final walkthrough, punch list completion, warranty documentation, and keys in your hand." },
            ].map((item, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="p-6 h-full relative overflow-hidden">
                  <span className="text-5xl font-black absolute top-3 right-4 opacity-5 text-white">{item.step}</span>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold mb-4" style={{ background: ACCENT, color: "white" }}>{item.step}</div>
                  <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── 7. TESTIMONIALS ─── */}
      <SectionReveal id="testimonials" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ACCENT }}>Client Testimonials</p>
            <div className="flex justify-center mb-6">
              <div className="inline-flex items-center gap-3 px-5 py-3 rounded-full border" style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)" }}>
                <div className="flex">{[...Array(5)].map((_, i) => <Star key={i} size={16} weight="fill" className="text-yellow-400" />)}</div>
                <span className="text-white font-bold">4.9</span>
                <span className="text-slate-400 text-sm">· 194 Google reviews</span>
                <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" fill="none"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              </div>
            </div>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Built on Trust" />
            </h2>
          </div>
          <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {testimonials.map((t, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="p-6 h-full flex flex-col">
                  <Quotes size={28} weight="fill" style={{ color: ACCENT }} className="mb-3 opacity-50" />
                  <p className="text-slate-300 leading-relaxed flex-1 text-sm">{t.text}</p>
                  <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                    <span className="text-sm font-semibold text-white">{t.name}</span>
                    <div className="flex gap-0.5">{Array.from({ length: t.rating }).map((_, j) => (<Star key={j} size={12} weight="fill" style={{ color: ACCENT }} />))}</div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── COMPARISON TABLE ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ACCENT }}>Why Apex</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter font-bold text-white"><WordReveal text="Apex vs. The Competition" /></h2>
          </div>
          <GlassCard className="overflow-hidden">
            <div className="grid grid-cols-3 text-sm font-semibold border-b border-white/10">
              <div className="p-4 text-slate-400">Feature</div>
              <div className="p-4 text-center text-white" style={{ background: `${ACCENT}22` }}>Apex Construction</div>
              <div className="p-4 text-center text-slate-500">Typical GC</div>
            </div>
            {[
              ["Written Fixed-Price Contract", "✓ Always", "Sometimes"],
              ["Weekly Progress Updates", "✓ Guaranteed", "Varies"],
              ["In-House Licensed Team", "✓ Every Trade", "Uses subs only"],
              ["2-Year Workmanship Warranty", "✓ Standard", "1 year or less"],
              ["Permit Management", "✓ We Handle All", "Extra charge"],
              ["Safety-Certified Crews", "✓ OSHA 30-Hour", "OSHA 10 only"],
              ["Post-Project Support", "✓ Lifetime Advice", "No"],
            ].map(([feature, us, them], i) => (
              <div key={i} className={`grid grid-cols-3 text-sm ${i % 2 === 0 ? "bg-white/[0.02]" : ""} border-b border-white/5 last:border-0`}>
                <div className="p-4 text-slate-300">{feature}</div>
                <div className="p-4 text-center font-semibold" style={{ color: ACCENT_LIGHT }}>{us}</div>
                <div className="p-4 text-center text-slate-500">{them}</div>
              </div>
            ))}
          </GlassCard>
        </div>
      </SectionReveal>

      {/* ─── PROJECT INVESTMENT GUIDE ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ACCENT }}>Investment Guide</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter font-bold text-white"><WordReveal text="Project Budgets & Scope" /></h2>
          </div>
          <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {[
              { tier: "Remodel / Renovation", price: "$25K–$75K", note: "Kitchen, bath, basement, or addition", features: ["Single-trade or multi-trade", "Permit included", "Design coordination", "Milestone payments"] },
              { tier: "Custom Home", price: "$350K–$800K", note: "Ground-up residential construction", features: ["Full turnkey build", "Architect coordination", "All permits & inspections", "Move-in ready guarantee"], highlight: true },
              { tier: "Commercial Build", price: "$200K–$2M+", note: "Office, retail, warehouse, TI", features: ["Dedicated PM assigned", "ADA & code compliance", "Weekly owner meetings", "Phased construction options"] },
            ].map((plan, i) => (
              <motion.div key={i} variants={fadeUp}>
                {plan.highlight ? (
                  <ShimmerBorder>
                    <div className="p-6 h-full flex flex-col">
                      <div className="text-xs uppercase tracking-widest mb-2" style={{ color: ACCENT }}>Most Popular</div>
                      <p className="text-lg font-bold text-white mb-1">{plan.tier}</p>
                      <p className="text-2xl font-black text-white mb-1">{plan.price}</p>
                      <p className="text-xs text-slate-400 mb-4">{plan.note}</p>
                      <ul className="space-y-2 flex-1">{plan.features.map((f, j) => (<li key={j} className="flex items-center gap-2 text-sm text-slate-300"><CheckCircle size={14} weight="fill" style={{ color: ACCENT }} />{f}</li>))}</ul>
                      <MagneticButton className="mt-6 w-full py-3 rounded-full text-sm font-semibold text-white cursor-pointer" style={{ background: ACCENT } as React.CSSProperties}>Free Consultation</MagneticButton>
                    </div>
                  </ShimmerBorder>
                ) : (
                  <GlassCard className="p-6 h-full flex flex-col">
                    <p className="text-lg font-bold text-white mb-1">{plan.tier}</p>
                    <p className="text-2xl font-black text-white mb-1">{plan.price}</p>
                    <p className="text-xs text-slate-400 mb-4">{plan.note}</p>
                    <ul className="space-y-2 flex-1">{plan.features.map((f, j) => (<li key={j} className="flex items-center gap-2 text-sm text-slate-300"><CheckCircle size={14} weight="fill" style={{ color: ACCENT }} />{f}</li>))}</ul>
                    <MagneticButton className="mt-6 w-full py-3 rounded-full text-sm font-semibold text-white border border-white/10 cursor-pointer">Get Estimate</MagneticButton>
                  </GlassCard>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── VIDEO PLACEHOLDER ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-4 md:px-6">
          <div className="text-center mb-10">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ACCENT }}>Watch Our Work</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter font-bold text-white"><WordReveal text="See a Build Come to Life" /></h2>
          </div>
          <div className="relative rounded-2xl overflow-hidden aspect-video cursor-pointer">
            <img src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1200&q=80" alt="Construction crew at work" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/55 flex items-center justify-center">
              <motion.div whileHover={{ scale: 1.1 }} transition={spring} className="flex flex-col items-center gap-4">
                <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: ACCENT }}>
                  <svg viewBox="0 0 24 24" fill="white" className="w-8 h-8 ml-1"><path d="M8 5v14l11-7z"/></svg>
                </div>
                <span className="text-white font-semibold text-lg">Time-Lapse: Full Home Build</span>
              </motion.div>
            </div>
            <motion.div className="absolute inset-0 rounded-2xl border-2 pointer-events-none" style={{ borderColor: ACCENT }} animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ duration: 2, repeat: Infinity }} />
          </div>
        </div>
      </SectionReveal>

      {/* ─── PROJECT QUIZ ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-4 md:px-6">
          <div className="text-center mb-10">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ACCENT }}>Get Started</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter font-bold text-white"><WordReveal text="What's Your Project?" /></h2>
          </div>
          <GlassCard className="p-6 md:p-8">
            <p className="text-slate-400 text-center mb-6">Tell us about your project type and we will connect you with the right team:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { label: "Custom Home Build", note: "Ground-up new construction", color: ACCENT },
                { label: "Major Renovation", note: "Whole-home or large remodel", color: "#3b82f6" },
                { label: "Kitchen or Bath", note: "Focused interior upgrade", color: "#22c55e" },
                { label: "Commercial / Office", note: "Business or tenant improvement", color: "#a855f7" },
              ].map((opt, i) => (
                <ConstructionQuizOption key={i} opt={opt} />
              ))}
            </div>
          </GlassCard>
        </div>
      </SectionReveal>

      {/* ─── 8. SAFETY & CERTIFICATIONS ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ACCENT }}>Safety & Compliance</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Certifications & Credentials" />
            </h2>
          </div>
          <motion.div className="grid grid-cols-2 sm:grid-cols-4 gap-4" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {certifications.map((cert, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="p-4 text-center">
                  <CheckCircle size={20} weight="duotone" style={{ color: ACCENT }} className="mx-auto mb-2" />
                  <p className="text-xs font-semibold text-white">{cert}</p>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── 9. FAQ ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ACCENT }}>Questions</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Frequently Asked Questions" />
            </h2>
          </div>
          <motion.div className="space-y-3" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {faqData.map((item, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="overflow-hidden">
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-5 text-left cursor-pointer">
                    <span className="text-sm md:text-base font-semibold text-white pr-4">{item.q}</span>
                    <motion.div animate={{ rotate: openFaq === i ? 180 : 0 }} transition={spring}><CaretDown size={18} className="text-slate-400 shrink-0" /></motion.div>
                  </button>
                  <AnimatePresence initial={false}>
                    {openFaq === i && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={spring} className="overflow-hidden">
                        <p className="px-5 pb-5 text-sm text-slate-400 leading-relaxed">{item.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── SUSTAINABILITY & GREEN ─── */}
      <SectionReveal className="relative z-10 py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ACCENT }}>Green Building</p>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4"><WordReveal text="Sustainable Construction Practices" /></h2>
              <p className="text-slate-400 leading-relaxed mb-6">We are committed to building homes and businesses that are energy-efficient, durable, and kind to the environment. Our LEED-certified team incorporates green practices on every project.</p>
              <div className="grid grid-cols-2 gap-3">
                {["Energy-Star Windows & Doors", "High-Efficiency HVAC Systems", "Spray Foam Insulation", "Solar-Ready Electrical", "Low-VOC Materials", "Sustainable Lumber Sourcing"].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-slate-300">
                    <CheckCircle size={14} weight="fill" style={{ color: ACCENT }} className="shrink-0" />{item}
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Energy Savings", value: "Up to 40%", note: "vs. standard builds" },
                { label: "Waste Diverted", value: "85%+", note: "Recycled or reused" },
                { label: "LEED Certified", value: "12 Projects", note: "Gold & Silver" },
                { label: "Solar Installs", value: "47 Homes", note: "Since 2019" },
              ].map((s, i) => (
                <GlassCard key={i} className="p-5 text-center">
                  <p className="text-2xl font-black mb-1" style={{ color: ACCENT_LIGHT }}>{s.value}</p>
                  <p className="text-xs font-semibold text-white">{s.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{s.note}</p>
                </GlassCard>
              ))}
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* ─── WHY CHOOSE A GC ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ACCENT }}>The Apex Advantage</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter font-bold text-white"><WordReveal text="Why a Licensed GC Matters" /></h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: ShieldCheck, title: "Single Point of Contact", desc: "No chasing subcontractors. We manage every trade — plumbing, electrical, framing, roofing, finish work — so you have one person responsible for the whole project." },
              { icon: Medal, title: "Permit & Code Expertise", desc: "Building codes change constantly. We have a dedicated team that manages all permits, inspections, and code compliance for every jurisdiction we work in." },
              { icon: Certificate, title: "Quality Control at Every Phase", desc: "We inspect work before it gets covered up. Rough-in inspections, framing checks, envelope reviews — problems caught early cost a fraction of what they cost later." },
            ].map((item, i) => (
              <GlassCard key={i} className="p-6 flex gap-5">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: ACCENT_GLOW }}>
                  <item.icon size={24} weight="duotone" style={{ color: ACCENT }} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ─── SERVICE AREA ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ACCENT }}>Coverage</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter font-bold text-white"><WordReveal text="Where We Build" /></h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { area: "Seattle", type: "Residential & Commercial" },
              { area: "Bellevue", type: "Custom Homes & TI" },
              { area: "Kirkland", type: "Residential" },
              { area: "Redmond", type: "Commercial & Office" },
              { area: "Tacoma", type: "All Project Types" },
              { area: "Everett", type: "Industrial & Residential" },
              { area: "Renton", type: "Commercial Build-Out" },
              { area: "Issaquah", type: "Custom Homes" },
            ].map((area, i) => (
              <GlassCard key={i} className="p-4 text-center">
                <p className="text-sm font-bold text-white mb-1">{area.area}</p>
                <p className="text-xs text-slate-400">{area.type}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ─── CONTACT FORM ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4 md:px-6">
          <div className="text-center mb-10">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ACCENT }}>Free Estimate</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter font-bold text-white"><WordReveal text="Tell Us About Your Project" /></h2>
          </div>
          <GlassCard className="p-6 md:p-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-slate-400 mb-2">Your Name</label>
                  <input type="text" placeholder="John Smith" className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 border border-white/10 outline-none" style={{ background: "rgba(255,255,255,0.04)" }} />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-slate-400 mb-2">Phone Number</label>
                  <input type="tel" placeholder="(206) 555-0100" className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 border border-white/10 outline-none" style={{ background: "rgba(255,255,255,0.04)" }} />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-slate-400 mb-2">Project Type</label>
                  <select className="w-full rounded-xl px-4 py-3 text-sm text-white border border-white/10 outline-none" style={{ background: "#1a1208" }}>
                    <option>Custom Home</option>
                    <option>Home Renovation</option>
                    <option>Commercial Build</option>
                    <option>Kitchen / Bath</option>
                    <option>Addition</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-slate-400 mb-2">Project Description</label>
                <textarea rows={7} placeholder="Describe your project, timeline, and rough budget..." className="w-full h-full rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 border border-white/10 outline-none resize-none" style={{ background: "rgba(255,255,255,0.04)" }} />
              </div>
            </div>
            <div className="mt-6">
              <MagneticButton className="px-10 py-4 rounded-full text-base font-semibold text-white cursor-pointer" style={{ background: ACCENT } as React.CSSProperties}>
                Request Free Consultation <ArrowRight size={18} weight="bold" className="inline ml-1" />
              </MagneticButton>
            </div>
          </GlassCard>
        </div>
      </SectionReveal>

      {/* ─── 10. CONTACT CTA ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4 md:px-6">
          <ShimmerBorder>
            <div className="p-8 md:p-12 text-center">
              <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={spring}>
                <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ACCENT }}>Start Building</p>
                <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white mb-4">Ready to Break Ground?</h2>
                <p className="text-slate-400 text-lg mb-6 max-w-lg mx-auto">Schedule a free consultation and let us show you why Apex is the region&apos;s most trusted construction company.</p>
                <div className="flex flex-wrap justify-center gap-4">
                  <MagneticButton className="px-10 py-4 rounded-full text-base font-semibold text-white inline-flex items-center gap-2 cursor-pointer" style={{ background: ACCENT } as React.CSSProperties}>
                    <CalendarCheck size={20} weight="duotone" /> Free Consultation
                  </MagneticButton>
                  <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/10 inline-flex items-center gap-2 cursor-pointer">
                    <Phone size={18} weight="duotone" /> (206) 739-4582
                  </MagneticButton>
                </div>
              </motion.div>
            </div>
          </ShimmerBorder>
        </div>
      </SectionReveal>

      {/* ─── 11. CONTACT INFO ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white mb-6">
                <WordReveal text="Let Us Build Something Great" />
              </h2>
              <p className="text-slate-400 leading-relaxed max-w-md mb-8">
                From initial concept to final walkthrough, Apex Construction is your partner in building. Contact us to discuss your next project.
              </p>
            </div>
            <GlassCard className="p-8">
              <h3 className="text-xl font-semibold text-white mb-6">Contact Us</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <MapPin size={20} weight="duotone" style={{ color: ACCENT }} className="mt-0.5 shrink-0" />
                  <div><p className="text-sm font-semibold text-white">Office</p><p className="text-sm text-slate-400">1842 Airport Way S, Suite 200<br />Seattle, WA 98134</p></div>
                </div>
                <div className="flex items-start gap-4">
                  <Phone size={20} weight="duotone" style={{ color: ACCENT }} className="mt-0.5 shrink-0" />
                  <div><p className="text-sm font-semibold text-white">Phone</p><p className="text-sm text-slate-400">(206) 739-4582</p></div>
                </div>
                <div className="flex items-start gap-4">
                  <Clock size={20} weight="duotone" style={{ color: ACCENT }} className="mt-0.5 shrink-0" />
                  <div><p className="text-sm font-semibold text-white">Hours</p><p className="text-sm text-slate-400">Monday - Friday: 7:00 AM - 5:00 PM<br />Saturday: By appointment</p></div>
                </div>
                <div className="flex items-start gap-4">
                  <CheckCircle size={20} weight="duotone" style={{ color: ACCENT }} className="mt-0.5 shrink-0" />
                  <div><p className="text-sm font-semibold text-white">Service Area</p><p className="text-sm text-slate-400">Greater Seattle Metro<br />King, Snohomish &amp; Pierce Counties</p></div>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </SectionReveal>

      {/* ─── 12. FOOTER ─── */}
      <footer className="relative z-10 border-t border-white/5 py-8">
        <div className="mx-auto max-w-7xl px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <HardHat size={16} weight="duotone" style={{ color: ACCENT }} />
            <span>Apex Construction &copy; {new Date().getFullYear()}</span>
            <span className="text-slate-700">·</span>
            <span>Licensed WA GC #APEXC-2049</span>
            <span className="text-slate-700">·</span>
            <span>OSHA 30 Certified</span>
          </div>
          <p className="text-xs text-slate-600 flex items-center gap-1.5"><svg width="14" height="14" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-sky-500"><path d="M24.3 4.2c-1.5-.4-3.2.1-4.5 1.1-1-.7-2.3-1-3.5-.8-2.4.4-4.2 2.5-4.2 4.9v.6c-3.2.8-6 2.8-7.8 5.6-.3.5-.1 1.1.4 1.4.5.3 1.1.1 1.4-.4 1.5-2.3 3.7-4 6.3-4.7.5-.1 1-.1 1.5 0 .8.2 1.4.8 1.7 1.5.3.8.2 1.6-.2 2.3l-2.8 4.3c-.6.9-.4 2.1.4 2.8l2.5 2.1c.4.3.8.5 1.3.5h5.2c.5 0 1-.2 1.3-.5l1.2-1c.6-.5.8-1.3.6-2l-1-3.2c-.2-.5 0-1.1.4-1.4l3.8-2.5c1.3-.9 2.1-2.3 2.1-3.9V9.6c0-2.5-1.7-4.7-4.1-5.3v-.1z" fill="currentColor"/></svg>Created by <a href="https://bluejayportfolio.com" target="_blank" rel="noopener noreferrer" style={{textDecoration:"underline"}}>bluejayportfolio.com</a></p>
        </div>
      </footer>
    </main>
  );
}
