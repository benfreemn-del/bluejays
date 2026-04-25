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
  SealCheck,
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
  return (<div className={`rounded-2xl border border-white/15 bg-white/[0.08] backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] ${className}`}>{children}</div>);
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
  "https://images.unsplash.com/photo-1531834685032-c34bf0d84c77?w=600&q=80",
  "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=600&q=80",
  "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&q=80",
  "https://images.unsplash.com/photo-1429497419816-9ca5cfb4571a?w=600&q=80",
  "https://images.unsplash.com/photo-1504149269576-9900c81eb84d?w=600&q=80",
  "https://images.unsplash.com/photo-1504149730145-54e4ebcaf03e?w=600&q=80",
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
          <img src="https://images.unsplash.com/photo-1516216628859-9bccecab13ca?w=1600&q=80" alt="" className="w-full h-full object-cover object-center" />
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
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/15 flex items-center gap-2 cursor-pointer">
                <Phone size={18} weight="duotone" /> (206) 742-2845
              </MagneticButton>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ ...spring, delay: 0.95 }} className="flex flex-wrap gap-3">
              <span className="px-4 py-2 rounded-full text-xs font-semibold text-white flex items-center gap-2" style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${ACCENT}40` }}><ShieldCheck size={14} weight="duotone" style={{ color: ACCENT }} />Licensed &amp; Bonded</span>
              <span className="px-4 py-2 rounded-full text-xs font-semibold text-white flex items-center gap-2" style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${ACCENT_LIGHT}40` }}><Star size={14} weight="fill" style={{ color: ACCENT_LIGHT }} />4.9-Star Rated</span>
              <span className="px-4 py-2 rounded-full text-xs font-semibold text-white flex items-center gap-2" style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${ACCENT}40` }}><CheckCircle size={14} weight="duotone" style={{ color: ACCENT }} />Free Estimates</span>
              {/* fictional license — replace per-prospect on signup */}
              <span className="px-4 py-2 rounded-full text-xs font-semibold text-white flex items-center gap-2" style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${ACCENT_LIGHT}40` }}><Certificate size={14} weight="duotone" style={{ color: ACCENT_LIGHT }} />WA L&amp;I #CONSTRWA487BK</span>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ ...spring, delay: 1 }} className="flex flex-wrap gap-6 text-sm text-slate-400">
              <span className="flex items-center gap-2"><MapPin size={16} weight="duotone" style={{ color: ACCENT }} />Metro &amp; Surrounding Counties</span>
              <span className="flex items-center gap-2"><Clock size={16} weight="duotone" style={{ color: ACCENT }} />Mon-Fri 7am-5pm</span>
            </motion.div>
          </div>
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ ...spring, delay: 0.3 }} className="hidden lg:flex items-center justify-center">
            <div className="relative">
              <motion.div className="absolute inset-0 rounded-full" style={{ background: `radial-gradient(circle, ${ACCENT_GLOW} 0%, transparent 70%)`, filter: "blur(40px)" }} animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} />
              <HardHat size={200} weight="duotone" style={{ color: ACCENT }} className="relative z-10" />
            </div>
          </motion.div>
        </div>
      </section>

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

      {/* ─── PROJECT INVESTMENT GUIDE ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 60% 40% at 50% 50%, ${ACCENT_GLOW} 0%, transparent 70%)` }} />
        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ACCENT }}>Budget Planning</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white"><WordReveal text="Project Investment Guide" /></h2>
            <p className="text-slate-400 mt-4 max-w-2xl mx-auto">Every build is unique — but these investment tiers help you plan. Final quotes after a free on-site consultation and scope walkthrough.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "Renovation", price: "$15K+", desc: "Bathroom remodels, kitchen updates, basement finish, or single-room scope.", features: ["Full design + permit package", "Licensed trades coordinated", "6–8 week typical timeline", "Fixture + finish selections", "1-year workmanship warranty"], highlight: false },
              { name: "Addition", price: "$35K+", desc: "Second story, primary suite, garage conversion, or full kitchen-down-to-studs.", features: ["Architectural drawings included", "Structural engineering stamped", "10–16 week typical timeline", "All permits handled", "2-year workmanship warranty"], highlight: true },
              { name: "New Build", price: "$75K+", desc: "Custom homes, ADUs, and ground-up commercial projects with full project management.", features: ["Lot prep + foundation + framing", "Dedicated project manager", "6–12 month timeline", "Transparent cost-plus billing", "5-year warranty + 10-year structural"], highlight: false },
            ].map((tier, i) => (
              <div key={i} className={`relative rounded-2xl ${tier.highlight ? 'p-[2px]' : ''}`} style={tier.highlight ? { background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_LIGHT})` } : {}}>
                {tier.highlight && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white" style={{ background: ACCENT }}>Most Popular</div>}
                <GlassCard className="p-6 h-full">
                  <h3 className="text-xl font-bold text-white">{tier.name}</h3>
                  <p className="text-xs text-slate-400 mt-1">{tier.desc}</p>
                  <div className="mt-6 flex items-end gap-1">
                    <span className="text-5xl font-black text-white">{tier.price}</span>
                  </div>
                  <ul className="mt-6 space-y-3">
                    {tier.features.map((f, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-slate-300">
                        <CheckCircle size={18} weight="fill" style={{ color: tier.highlight ? ACCENT_LIGHT : ACCENT }} className="shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <button className="mt-6 w-full px-6 py-3 rounded-full text-sm font-semibold text-white" style={{ background: tier.highlight ? ACCENT : "rgba(255,255,255,0.05)", border: tier.highlight ? "none" : "1px solid rgba(255,255,255,0.1)" }}>Get An Estimate</button>
                </GlassCard>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-slate-500 mt-8">Financing through partner lenders available for qualifying projects — 0% interest for the first 12 months.</p>
        </div>
      </SectionReveal>

      {/* ─── 5-STEP BUILD TIMELINE ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ACCENT }}>Our Process</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white"><WordReveal text="5 Steps, Built Right" /></h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              { step: "01", title: "Free Consult", desc: "Walk-through of your space, scope goals, and budget. No fees, no pressure." },
              { step: "02", title: "Design & Bid", desc: "Detailed drawings, material choices, and a line-item written quote." },
              { step: "03", title: "Permits & Prep", desc: "We pull every required permit and schedule inspections so you do not have to." },
              { step: "04", title: "Build Phase", desc: "Licensed trades executing with weekly photo updates and clear milestones." },
              { step: "05", title: "Final Walkthrough", desc: "Punch list, warranty docs, and a handoff package with all paperwork." },
            ].map((p, i) => (
              <GlassCard key={i} className="p-5 h-full relative overflow-hidden">
                <div className="absolute top-3 right-3 text-5xl font-black opacity-5 text-white">{p.step}</div>
                <div className="relative w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: ACCENT_GLOW }}>
                  <span className="text-sm font-black" style={{ color: ACCENT }}>{p.step}</span>
                </div>
                <h3 className="relative text-base font-bold text-white mb-2">{p.title}</h3>
                <p className="relative text-xs text-slate-400 leading-relaxed">{p.desc}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ─── EMERGENCY STRIP ─── */}
      <SectionReveal className="relative z-10 py-8">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <GlassCard className="p-6 md:p-8 flex flex-col md:flex-row items-center gap-6">
            <div className="relative shrink-0">
              <motion.div className="absolute inset-0 rounded-full" style={{ background: ACCENT_LIGHT }} animate={{ scale: [1, 1.6, 1], opacity: [0.5, 0, 0.5] }} transition={{ duration: 2, repeat: Infinity }} />
              <div className="relative w-4 h-4 rounded-full" style={{ background: ACCENT_LIGHT }} />
            </div>
            <div className="flex-1 text-center md:text-left">
              <p className="text-xs uppercase tracking-widest mb-1" style={{ color: ACCENT_LIGHT }}>Booking Spring Projects Now</p>
              <h3 className="text-2xl md:text-3xl font-bold text-white">Crews Available Within 4 Weeks</h3>
              <p className="text-sm text-slate-400 mt-2">Build calendars are filling for the season. Lock your project in with a free on-site estimate this week.</p>
            </div>
            <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white flex items-center gap-2 shrink-0 cursor-pointer" style={{ background: ACCENT } as React.CSSProperties}>
              <CalendarCheck size={18} weight="duotone" /> Schedule Estimate
            </MagneticButton>
          </GlassCard>
        </div>
      </SectionReveal>

      {/* ─── GOOGLE REVIEWS HEADER ─── */}
      <SectionReveal className="relative z-10 py-8">
        <div className="mx-auto max-w-4xl px-4 md:px-6">
          <GlassCard className="px-6 py-5 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
            <div className="flex items-center gap-3">
              <svg width="32" height="32" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
              </svg>
              <div className="text-left">
                <p className="text-sm text-slate-400">Google Reviews</p>
                <p className="text-lg font-bold text-white">Verified Homeowner Ratings</p>
              </div>
            </div>
            <div className="hidden sm:block w-px h-12 bg-white/10" />
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                {[0,1,2,3,4].map((i) => (<Star key={i} size={20} weight="fill" style={{ color: ACCENT_LIGHT }} />))}
              </div>
              <p className="text-sm text-slate-400"><span className="text-white font-bold">4.9</span> out of 5 &bull; <span className="text-white font-bold">214</span> reviews</p>
            </div>
          </GlassCard>
        </div>
      </SectionReveal>

      {/* ─── 7. TESTIMONIALS ─── */}
      <SectionReveal id="testimonials" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ACCENT }}>Client Testimonials</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Built on Trust" />
            </h2>
          </div>
          <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {testimonials.map((t, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="p-6 h-full flex flex-col relative overflow-hidden">
                  <Quotes size={60} weight="fill" style={{ color: ACCENT }} className="absolute -top-2 -right-2 opacity-10" />
                  <Quotes size={28} weight="fill" style={{ color: ACCENT }} className="mb-3 opacity-60" />
                  <p className="text-slate-300 leading-relaxed flex-1 text-sm">{t.text}</p>
                  <div className="mt-4 pt-4 border-t border-white/8 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">{t.name}</span>
                      <CheckCircle size={14} weight="fill" style={{ color: ACCENT }} />
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider">Verified</span>
                    </div>
                    <div className="flex gap-0.5">{Array.from({ length: t.rating }).map((_, j) => (<Star key={j} size={18} weight="fill" style={{ color: ACCENT_LIGHT }} />))}</div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── PROJECT QUIZ ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 50% 60% at 20% 50%, ${ACCENT_GLOW} 0%, transparent 70%)` }} />
        <div className="relative z-10 mx-auto max-w-5xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ACCENT }}>Let's Scope It</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white"><WordReveal text="What's Your Project?" /></h2>
            <p className="text-slate-400 mt-4 max-w-2xl mx-auto">Pick the closest match and we'll route you to the right project manager.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { color: "#22c55e", label: "Single Room", detail: "Kitchen, bath, basement, or single-room renovation — usually under 90 days.", rec: "Renovation Team", icon: House },
              { color: ACCENT_LIGHT, label: "Major Addition", detail: "Second story, primary suite, full gut, or whole-house remodel with permits.", rec: "Addition Team + Architect", icon: Hammer },
              { color: ACCENT, label: "New Build", detail: "Custom home, ADU, or ground-up commercial. 6–12 month timeline.", rec: "Custom Build Division", icon: Buildings },
            ].map((opt, i) => (
              <GlassCard key={i} className="p-6 h-full flex flex-col items-start relative overflow-hidden group cursor-pointer">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: `radial-gradient(circle at 50% 0%, ${opt.color}22, transparent 60%)` }} />
                <div className="relative w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: `${opt.color}22` }}>
                  <opt.icon size={22} weight="duotone" style={{ color: opt.color }} />
                </div>
                <p className="relative text-xs uppercase tracking-widest font-bold" style={{ color: opt.color }}>{opt.label}</p>
                <p className="relative text-sm text-slate-300 mt-2 leading-relaxed flex-1">{opt.detail}</p>
                <div className="relative mt-6 pt-4 border-t border-white/15 w-full">
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-1">Route to</p>
                  <p className="text-sm font-semibold text-white">{opt.rec}</p>
                </div>
              </GlassCard>
            ))}
          </div>
          <div className="text-center mt-8">
            <MagneticButton className="px-10 py-4 rounded-full text-base font-semibold text-white inline-flex items-center gap-2 cursor-pointer" style={{ background: ACCENT } as React.CSSProperties}>
              <Phone size={18} weight="duotone" /> Call The Office
            </MagneticButton>
          </div>
        </div>
      </SectionReveal>

      {/* ─── VIDEO PLACEHOLDER ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ACCENT }}>On The Jobsite</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white"><WordReveal text="Tour A Recent Build" /></h2>
          </div>
          <div className="relative rounded-2xl overflow-hidden aspect-video group cursor-pointer">
            <img src="https://images.unsplash.com/photo-1742112125567-3e8967bad60f?w=1600&q=80" alt="Construction crew at job site" className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div className="w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center shadow-2xl" style={{ background: ACCENT }} animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
                <svg width="28" height="32" viewBox="0 0 24 28" fill="white" className="ml-1">
                  <path d="M0 0L24 14L0 28Z" />
                </svg>
              </motion.div>
            </div>
            <div className="absolute bottom-6 left-6 right-6">
              <p className="text-xs uppercase tracking-widest" style={{ color: ACCENT_LIGHT }}>Foundation To Finish &bull; 4:10</p>
              <p className="text-xl md:text-2xl font-bold text-white mt-1">Walk a full custom home build — foundation to keys, in four minutes.</p>
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* ─── COMPETITOR COMPARISON ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ACCENT }}>The Difference</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white"><WordReveal text="Apex vs. The Handyman" /></h2>
          </div>
          <GlassCard className="overflow-hidden">
            <div className="grid grid-cols-[1.5fr_1fr_1fr] items-center border-b border-white/15">
              <div className="p-4 md:p-6 text-xs uppercase tracking-widest text-slate-400">What Matters</div>
              <div className="p-4 md:p-6 text-center" style={{ background: `${ACCENT}15` }}>
                <p className="text-sm md:text-base font-bold" style={{ color: ACCENT_LIGHT }}>Apex</p>
              </div>
              <div className="p-4 md:p-6 text-center">
                <p className="text-sm md:text-base font-semibold text-slate-400">Unlicensed Handyman</p>
              </div>
            </div>
            {[
              { feature: "State-licensed GC", us: "CCB #217840", them: "No" },
              { feature: "Bonded + insured", us: "$1M liability", them: "Rarely" },
              { feature: "Permits pulled correctly", us: "Every job", them: "Often skipped" },
              { feature: "Licensed subcontractors", us: "All trades", them: "DIY quality" },
              { feature: "Written contracts + scope", us: "Always", them: "Handshake" },
              { feature: "Workmanship warranty", us: "1–5 years", them: "None" },
              { feature: "Change order process", us: "Transparent", them: "Surprise bills" },
            ].map((row, i) => (
              <div key={i} className="grid grid-cols-[1.5fr_1fr_1fr] items-center border-b border-white/8 last:border-b-0">
                <div className="p-4 md:p-6 text-sm text-white">{row.feature}</div>
                <div className="p-4 md:p-6 text-center" style={{ background: `${ACCENT}08` }}>
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle size={18} weight="fill" style={{ color: ACCENT }} />
                    <span className="text-sm text-white font-semibold hidden sm:inline">{row.us}</span>
                  </div>
                </div>
                <div className="p-4 md:p-6 text-center text-sm text-slate-500 italic">{row.them}</div>
              </div>
            ))}
          </GlassCard>
        </div>
      </SectionReveal>

      {/* ─── CERTIFICATIONS ─── */}
      <SectionReveal className="relative z-10 py-8">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <p className="text-center text-xs uppercase tracking-widest text-slate-500 mb-6">Credentials &amp; Partnerships</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {[
              { label: "CCB Licensed", icon: Certificate },
              { label: "NAHB Member", icon: Medal },
              { label: "BBB A+", icon: Star },
              { label: "OSHA Certified", icon: ShieldCheck },
              { label: "Energy Star Partner", icon: CheckCircle },
              { label: "EPA Lead-Safe", icon: SealCheck },
            ].map((cert, i) => (
              <GlassCard key={i} className="px-4 py-3 flex items-center gap-2 justify-center">
                <cert.icon size={18} weight="duotone" style={{ color: i % 2 === 0 ? ACCENT : ACCENT_LIGHT }} />
                <span className="text-xs font-semibold text-slate-300">{cert.label}</span>
              </GlassCard>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ─── SERVICE AREA ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ACCENT }}>Where We Build</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white"><WordReveal text="Coverage & Availability" /></h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <GlassCard className="p-6 text-center">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: ACCENT_GLOW }}>
                <MapPin size={26} weight="duotone" style={{ color: ACCENT }} />
              </div>
              <p className="text-xs uppercase tracking-widest mb-2" style={{ color: ACCENT_LIGHT }}>Service Radius</p>
              <p className="text-3xl font-black text-white">50 Miles</p>
              <p className="text-sm text-slate-400 mt-2">Metro plus three surrounding counties. Larger custom builds considered further on request.</p>
            </GlassCard>
            <GlassCard className="p-6 text-center">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: ACCENT_GLOW }}>
                <Timer size={26} weight="duotone" style={{ color: ACCENT_LIGHT }} />
              </div>
              <p className="text-xs uppercase tracking-widest mb-2" style={{ color: ACCENT_LIGHT }}>Lead Time</p>
              <p className="text-3xl font-black text-white">4–8 Weeks</p>
              <p className="text-sm text-slate-400 mt-2">From contract to boots on site. Emergency repair work fits in sooner — ask about our jump-in crew.</p>
            </GlassCard>
            <GlassCard className="p-6 text-center">
              <div className="relative w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: ACCENT_GLOW }}>
                <motion.div className="absolute inset-0 rounded-full" style={{ background: ACCENT }} animate={{ scale: [1, 1.6, 1], opacity: [0.4, 0, 0.4] }} transition={{ duration: 2, repeat: Infinity }} />
                <CheckCircle size={26} weight="duotone" style={{ color: ACCENT }} className="relative" />
              </div>
              <p className="text-xs uppercase tracking-widest mb-2" style={{ color: ACCENT_LIGHT }}>Availability</p>
              <p className="text-3xl font-black text-white">Booking Now</p>
              <p className="text-sm text-slate-400 mt-2">Taking new-build consults through the end of the year. Smaller renos moving fastest.</p>
            </GlassCard>
          </div>
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

      {/* ─── PROJECT PORTFOLIO ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ACCENT }}>Recent Work</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white"><WordReveal text="Featured Projects" /></h2>
          </div>
          <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
            {[
              { title: "Modern Farmhouse Build", scope: "4,200 sq ft new build", duration: "9 months", src: "https://images.unsplash.com/photo-1521783988139-89397d761dce?w=800&q=80" },
              { title: "Whole-Home Remodel", scope: "1920s craftsman gut renovation", duration: "6 months", src: "https://images.unsplash.com/photo-1723107638858-331404b1a09a?w=800&q=80" },
              { title: "Master Bedroom Finish-Out", scope: "Second-story 700 sq ft addition", duration: "4 months", src: "https://images.unsplash.com/photo-1502005097973-6a7082348e28?w=800&q=80" },
            ].map((proj, i) => (
              <motion.div key={i} variants={fadeUp} className="group relative rounded-2xl overflow-hidden aspect-[4/5] cursor-pointer">
                <img src={proj.src} alt={proj.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <p className="text-xs uppercase tracking-widest" style={{ color: ACCENT_LIGHT }}>{proj.duration}</p>
                  <p className="text-xl font-bold text-white mt-1">{proj.title}</p>
                  <p className="text-sm text-slate-300 mt-1">{proj.scope}</p>
                </div>
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
                  <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/15 inline-flex items-center gap-2 cursor-pointer">
                    <Phone size={18} weight="duotone" /> (206) 742-2845
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
                  <div><p className="text-sm font-semibold text-white">Office</p><p className="text-sm text-slate-400">555 Builder Way, Suite 300<br />Nashville, TN 37201</p></div>
                </div>
                <div className="flex items-start gap-4">
                  <Phone size={20} weight="duotone" style={{ color: ACCENT }} className="mt-0.5 shrink-0" />
                  <div><p className="text-sm font-semibold text-white">Phone</p><p className="text-sm text-slate-400">(206) 742-2845</p></div>
                </div>
                <div className="flex items-start gap-4">
                  <Clock size={20} weight="duotone" style={{ color: ACCENT }} className="mt-0.5 shrink-0" />
                  <div><p className="text-sm font-semibold text-white">Hours</p><p className="text-sm text-slate-400">Monday - Friday: 7:00 AM - 5:00 PM<br />Saturday: By appointment</p></div>
                </div>
                <div className="flex items-start gap-4">
                  <CheckCircle size={20} weight="duotone" style={{ color: ACCENT }} className="mt-0.5 shrink-0" />
                  <div><p className="text-sm font-semibold text-white">Service Area</p><p className="text-sm text-slate-400">Metro Nashville &amp; surrounding counties<br />Up to 75-mile radius</p></div>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </SectionReveal>

      {/* ─── FINAL CTA ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-4 md:px-6">
          <GlassCard className="p-8 md:p-12 text-center">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ACCENT }}>Start With An Estimate</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white mb-4">Let's Build Something Great</h2>
            <p className="text-slate-400 text-lg mb-8 max-w-lg mx-auto">Free on-site consultation, line-item quote, and no obligation to hire. We handle everything from permits to punch list — you enjoy the result.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <MagneticButton className="px-10 py-4 rounded-full text-base font-semibold text-white inline-flex items-center gap-2 cursor-pointer" style={{ background: ACCENT } as React.CSSProperties}>
                <CalendarCheck size={20} weight="duotone" /> Schedule Estimate
              </MagneticButton>
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/15 inline-flex items-center gap-2 cursor-pointer">
                <Phone size={18} weight="duotone" /> (206) 742-2845
              </MagneticButton>
            </div>
            <p className="mt-6 text-xs text-slate-500">Licensed GC WA L&amp;I #CONSTRWA487BK &bull; Bonded &bull; Fully Insured</p>
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              {[
                { label: "Licensed GC", value: "WA L&I #CONSTRWA487BK" },
                { label: "Years In Business", value: "18+" },
                { label: "Projects Completed", value: "340+" },
                { label: "Customer Rating", value: "4.9 / 5" },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <p className="text-xs text-slate-500 uppercase tracking-widest">{stat.label}</p>
                  <p className="text-2xl font-black mt-1" style={{ color: ACCENT_LIGHT }}>{stat.value}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </SectionReveal>

      {/* ─── WARRANTY PROMISE ─── */}
      <SectionReveal className="relative z-10 py-16">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="text-center mb-10">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ACCENT }}>Our Promise</p>
            <h2 className="text-3xl md:text-4xl tracking-tighter font-bold text-white"><WordReveal text="Built With Guarantees" /></h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { title: "On-Time Completion", desc: "We publish the timeline, track it weekly, and hit it — or you get paid.", icon: Timer },
              { title: "Fixed-Price Contracts", desc: "No cost-plus fog. You approve every scope + change in writing.", icon: ShieldCheck },
              { title: "Licensed &amp; Bonded", desc: "State GC license, $2M liability, OSHA-trained crews on every site.", icon: Certificate },
              { title: "5-Year Workmanship", desc: "5-year warranty on all trades, 10-year structural on custom builds.", icon: Medal },
            ].map((item, i) => (
              <GlassCard key={i} className="p-5 text-center">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: ACCENT_GLOW }}>
                  <item.icon size={22} weight="duotone" style={{ color: ACCENT_LIGHT }} />
                </div>
                <p className="text-sm font-bold text-white" dangerouslySetInnerHTML={{ __html: item.title }} />
                <p className="text-xs text-slate-400 mt-1 leading-relaxed" dangerouslySetInnerHTML={{ __html: item.desc }} />
              </GlassCard>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ─── EXTENDED FAQ ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4 md:px-6">
          <div className="text-center mb-10">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ACCENT }}>Quick Answers</p>
            <h2 className="text-3xl md:text-4xl tracking-tighter font-bold text-white"><WordReveal text="Frequently Asked" /></h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { q: "Do you pull permits for me?", a: "Yes — every job includes all required permits, inspections, and code reviews. You never deal with the city." },
              { q: "Do you do design + build?", a: "Yes. We can take you from concept to keys, including architectural drawings, engineering stamps, and interior finish selections." },
              { q: "What is the deposit structure?", a: "10% at contract, progressive draws tied to milestones, and final payment at walk-through. Never pay for work that is not yet complete." },
              { q: "Can you coordinate with my architect?", a: "Absolutely. We partner with outside architects and designers regularly. We also have in-house options if you need a full team." },
            ].map((faq, i) => (
              <GlassCard key={i} className="p-5">
                <p className="text-sm font-bold text-white mb-2">{faq.q}</p>
                <p className="text-sm text-slate-400 leading-relaxed">{faq.a}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ─── 12. FOOTER ─── */}
      <footer className="relative z-10 border-t border-white/8 py-8">
        <div className="mx-auto max-w-7xl px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <HardHat size={16} weight="duotone" style={{ color: ACCENT }} />
            <span>Apex Construction &copy; {new Date().getFullYear()}</span>
          </div>
          <p className="text-xs text-slate-600 flex items-center gap-1.5"><svg width="14" height="14" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-sky-500"><path d="M24.3 4.2c-1.5-.4-3.2.1-4.5 1.1-1-.7-2.3-1-3.5-.8-2.4.4-4.2 2.5-4.2 4.9v.6c-3.2.8-6 2.8-7.8 5.6-.3.5-.1 1.1.4 1.4.5.3 1.1.1 1.4-.4 1.5-2.3 3.7-4 6.3-4.7.5-.1 1-.1 1.5 0 .8.2 1.4.8 1.7 1.5.3.8.2 1.6-.2 2.3l-2.8 4.3c-.6.9-.4 2.1.4 2.8l2.5 2.1c.4.3.8.5 1.3.5h5.2c.5 0 1-.2 1.3-.5l1.2-1c.6-.5.8-1.3.6-2l-1-3.2c-.2-.5 0-1.1.4-1.4l3.8-2.5c1.3-.9 2.1-2.3 2.1-3.9V9.6c0-2.5-1.7-4.7-4.1-5.3v-.1z" fill="currentColor"/></svg>Created by <a href="https://bluejayportfolio.com" target="_blank" rel="noopener noreferrer" style={{textDecoration:"underline"}}>bluejayportfolio.com</a></p>
        </div>
      </footer>
    </main>
  );
}
