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
  Quotes,
  Warehouse,
} from "@phosphor-icons/react";

/* ───────────────── SPRING / ANIMATION ───────────────── */
const spring = { type: "spring" as const, stiffness: 100, damping: 20 };
const springFast = { type: "spring" as const, stiffness: 200, damping: 25 };

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const fadeUp = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: spring } };

/* ───────────────── COLORS ───────────────── */
const STEEL = "#475569";
const ORANGE = "#ea580c";
const ORANGE_LIGHT = "#f97316";
const BG = "#0f1215";
const ORANGE_GLOW = "rgba(234,88,12,0.15)";

/* ───────────────── FLOATING PARTICLES ───────────────── */
function FloatingParticles() {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 8,
    duration: 6 + Math.random() * 6,
    size: 2 + Math.random() * 3,
    opacity: 0.12 + Math.random() * 0.25,
    isSteel: Math.random() > 0.6,
  }));

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden hidden md:block">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{ left: `${p.x}%`, width: p.size, height: p.size, background: p.isSteel ? STEEL : ORANGE, willChange: "transform, opacity" }}
          animate={{ y: ["-10vh", "110vh"], opacity: [0, p.opacity, p.opacity, 0] }}
          transition={{ y: { duration: p.duration, repeat: Infinity, delay: p.delay, ease: "linear" }, opacity: { duration: p.duration, repeat: Infinity, delay: p.delay, times: [0, 0.1, 0.9, 1] } }}
        />
      ))}
    </div>
  );
}

/* ───────────────── BLUEPRINT GRID SVG ───────────────── */
function BlueprintGrid({ opacity = 0.03 }: { opacity?: number }) {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }}>
      <defs>
        <pattern id="blueprintGrid" width="80" height="80" patternUnits="userSpaceOnUse">
          <rect width="80" height="80" fill="none" stroke={STEEL} strokeWidth="0.5" />
          <rect width="40" height="40" fill="none" stroke={STEEL} strokeWidth="0.25" />
          <circle cx="0" cy="0" r="1.5" fill={ORANGE} opacity="0.3" />
          <circle cx="80" cy="80" r="1.5" fill={ORANGE} opacity="0.3" />
          <circle cx="40" cy="40" r="1" fill={STEEL} opacity="0.4" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#blueprintGrid)" />
    </svg>
  );
}

/* ───────────────── CONSTRUCTION BEAMS SVG ───────────────── */
function ConstructionBeams({ opacity = 0.04 }: { opacity?: number }) {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }} viewBox="0 0 1000 600" preserveAspectRatio="none">
      <path d="M0 300 L500 100 L1000 300" stroke={STEEL} strokeWidth="2" fill="none" />
      <path d="M100 600 L100 200 L200 150 L200 600" stroke={ORANGE} strokeWidth="1" fill="none" />
      <path d="M800 600 L800 200 L900 150 L900 600" stroke={ORANGE} strokeWidth="1" fill="none" />
      <path d="M200 250 L800 250" stroke={STEEL} strokeWidth="0.5" fill="none" strokeDasharray="8 4" />
    </svg>
  );
}

/* ───────────────── UTILITY COMPONENTS ───────────────── */
function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] ${className}`}>
      {children}
    </div>
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

function WordReveal({ text, className = "" }: { text: string; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const words = text.split(" ");
  return (
    <motion.span ref={ref} className={`inline-flex flex-wrap gap-x-3 ${className}`} variants={stagger} initial="hidden" animate={isInView ? "show" : "hidden"}>
      {words.map((word, i) => (
        <motion.span key={i} variants={fadeUp} className="inline-block">{word}</motion.span>
      ))}
    </motion.span>
  );
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
      <motion.div className="absolute inset-0 rounded-2xl" style={{ background: `conic-gradient(from 0deg, transparent, ${ORANGE}, transparent, ${STEEL}, transparent)`, willChange: "transform" }} animate={{ rotate: [0, 360] }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} />
      <div className="relative rounded-2xl bg-[#0f1215] z-10">{children}</div>
    </div>
  );
}

/* ───────────────── SERVICES DATA ───────────────── */
const services = [
  { name: "Kitchen & Bath Remodeling", desc: "Complete kitchen and bathroom renovations with custom cabinetry, premium countertops, and modern fixtures.", icon: Wrench },
  { name: "Home Additions", desc: "Seamless room additions, second stories, and in-law suites that blend perfectly with your existing home.", icon: House },
  { name: "New Construction", desc: "Ground-up custom home building with meticulous attention to detail, from foundation to final finishes.", icon: Buildings },
  { name: "Commercial Build-Outs", desc: "Office renovations, retail spaces, and commercial tenant improvements delivered on time and on budget.", icon: Warehouse },
  { name: "Structural Restoration", desc: "Foundation repair, structural reinforcement, and disaster restoration to protect your investment.", icon: HardHat },
  { name: "Project Management", desc: "Full-service project management including permits, scheduling, subcontractor coordination, and inspections.", icon: ClipboardText },
];

const stats = [
  { value: "500+", label: "Projects Completed" },
  { value: "25+", label: "Years Experience" },
  { value: "100%", label: "Licensed & Bonded" },
  { value: "4.9★", label: "Client Rating" },
];

const processSteps = [
  { step: "01", title: "Free Consultation", desc: "We visit your site, discuss your vision, timeline, and budget. No obligation." },
  { step: "02", title: "Design & Planning", desc: "Our team creates detailed plans, 3D renderings, and handles all permits." },
  { step: "03", title: "Construction", desc: "Expert crews execute with precision, daily updates, and clean job sites." },
  { step: "04", title: "Final Walkthrough", desc: "We walk every inch together. We don't finish until you're 100% satisfied." },
];

const testimonials = [
  { name: "Michael R.", text: "They completely transformed our 1970s kitchen into a modern masterpiece. On time, on budget, and the crew was incredibly professional.", rating: 5 },
  { name: "Sarah & Tom K.", text: "Built our dream home from the ground up. The attention to detail was extraordinary — every corner, every finish, perfect.", rating: 5 },
  { name: "David L.", text: "Our commercial renovation was complex, but they managed every subcontractor seamlessly. Couldn't have asked for a better experience.", rating: 5 },
];

const faqs = [
  { q: "How long does a typical kitchen remodel take?", a: "A standard kitchen remodel takes 6-10 weeks. We provide a detailed timeline during consultation and keep you updated daily on progress." },
  { q: "Do you handle permits and inspections?", a: "Absolutely. We pull all necessary permits, coordinate every inspection, and ensure full code compliance on every project." },
  { q: "What's your warranty on completed work?", a: "All our projects come with a comprehensive 5-year workmanship warranty. We stand behind every nail, joint, and finish." },
  { q: "Can you work with my architect's plans?", a: "Yes! We regularly collaborate with architects and designers. We can also provide our own design team if needed." },
];

const galleryImages = [
  "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80", // kitchen remodel
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80", // custom home exterior
  "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=600&q=80", // living room
  "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=600&q=80", // luxury home exterior
  "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=600&q=80", // bathroom
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&q=80", // open concept interior
];

/* ═══════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════ */
export default function V2GeneralContractorShowcase() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden" style={{ background: BG, color: "#f1f5f9" }}>
      <FloatingParticles />

      {/* ══════ 1. NAV ══════ */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-4">
          <GlassCard className="flex items-center justify-between px-4 md:px-6 py-3">
            <div className="flex items-center gap-2">
              <Hammer size={24} weight="fill" style={{ color: ORANGE }} />
              <span className="text-lg font-bold tracking-tight text-white">Summit Builders NW</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
              <a href="#services" className="hover:text-white transition-colors">Services</a>
              <a href="#about" className="hover:text-white transition-colors">About</a>
              <a href="#gallery" className="hover:text-white transition-colors">Gallery</a>
              <a href="#contact" className="hover:text-white transition-colors">Contact</a>
            </div>
            <div className="flex items-center gap-3">
              <MagneticButton className="px-4 md:px-5 py-2 rounded-full text-sm font-semibold text-white transition-colors cursor-pointer" style={{ background: ORANGE }}>
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
                  {["Services", "About", "Gallery", "Contact"].map((l) => (
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
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, #1a1510 0%, ${BG} 50%, #12151a 100%)` }} />
        <BlueprintGrid opacity={0.05} />
        <ConstructionBeams opacity={0.04} />
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full blur-[200px] pointer-events-none" style={{ background: `${ORANGE}08` }} />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full blur-[160px] pointer-events-none" style={{ background: `${STEEL}08` }} />

        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          <div className="space-y-8">
            <div>
              <p className="text-sm uppercase tracking-widest mb-4" style={{ color: ORANGE }}>Licensed General Contractor</p>
              <h1 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white" style={{ textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>
                <WordReveal text="Building Dreams Into Reality" />
              </h1>
            </div>
            <p className="text-lg text-slate-400 max-w-md leading-relaxed">
              From custom homes to commercial build-outs, Summit Builders NW delivers exceptional craftsmanship with 25+ years of experience. Your vision, built right.
            </p>
            <div className="flex flex-wrap gap-4">
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white flex items-center gap-2 cursor-pointer" style={{ background: ORANGE }}>
                Get Free Estimate <ArrowRight size={18} weight="bold" />
              </MagneticButton>
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/10 flex items-center gap-2 cursor-pointer">
                <Phone size={18} weight="duotone" /> (253) 555-0147
              </MagneticButton>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-slate-400">
              <span className="flex items-center gap-2"><MapPin size={16} weight="duotone" style={{ color: ORANGE }} /> Tacoma, WA</span>
              <span className="flex items-center gap-2"><Clock size={16} weight="duotone" style={{ color: ORANGE }} /> Mon-Sat 7AM-6PM</span>
            </div>
          </div>
          <div className="hidden md:block relative">
            <div className="relative rounded-2xl overflow-hidden border border-white/10">
              <img src="https://images.unsplash.com/photo-1590856029826-c7a73142bbf1?w=1400&q=80" alt="Construction project" className="w-full h-[500px] object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f1215] via-transparent to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0f1215]/40 to-transparent" />
              <div className="absolute bottom-6 left-6 flex items-center gap-3">
                <div className="px-4 py-2 rounded-full backdrop-blur-md bg-black/50 border flex items-center gap-2" style={{ borderColor: `${ORANGE}4d` }}>
                  <ShieldCheck size={18} weight="fill" style={{ color: ORANGE }} />
                  <span className="text-sm font-semibold text-white">Licensed &amp; Bonded</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════ 3. STATS ══════ */}
      <SectionReveal className="relative z-10 py-16 overflow-hidden border-y border-white/10" id="stats">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, #12141a 0%, ${BG} 100%)` }} />
        <BlueprintGrid opacity={0.02} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => {
              const icons = [Hammer, Clock, ShieldCheck, Star];
              const Icon = icons[i];
              return (
                <div key={stat.label} className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Icon size={22} weight="fill" style={{ color: ORANGE }} />
                    <span className="text-3xl md:text-4xl font-extrabold text-white">{stat.value}</span>
                  </div>
                  <span className="text-slate-500 text-sm font-medium tracking-wide uppercase">{stat.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </SectionReveal>

      {/* ══════ 4. SERVICES ══════ */}
      <SectionReveal id="services" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #12141a 50%, ${BG} 100%)` }} />
        <BlueprintGrid />
        <ConstructionBeams opacity={0.025} />
        <div className="absolute top-[10%] right-[5%] w-[500px] h-[500px] rounded-full blur-[160px] pointer-events-none" style={{ background: `${ORANGE}08` }} />

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: ORANGE, borderColor: `${ORANGE}33`, background: `${ORANGE}0d` }}>Our Services</span>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white">Comprehensive Construction Services</h2>
            <div className="h-0.5 w-16 mx-auto mt-4" style={{ background: `linear-gradient(to right, ${ORANGE}, transparent)` }} />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, i) => {
              const Icon = service.icon;
              return (
                <div key={service.name} className="group relative p-7 rounded-2xl border border-white/[0.06] hover:border-opacity-30 transition-all duration-500 overflow-hidden bg-white/[0.02]">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: `radial-gradient(circle at 50% 0%, ${ORANGE}15, transparent 70%)` }} />
                  <div className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `linear-gradient(to right, transparent, ${ORANGE}4d, transparent)` }} />
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-5">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 border" style={{ background: ORANGE_GLOW, borderColor: `${ORANGE}33` }}>
                        <Icon size={24} weight="duotone" style={{ color: ORANGE }} />
                      </div>
                      <span className="text-xs font-mono text-slate-600">{String(i + 1).padStart(2, "0")}</span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{service.name}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{service.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </SectionReveal>

      {/* ══════ 5. ABOUT ══════ */}
      <SectionReveal id="about" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #10121a 50%, ${BG} 100%)` }} />
        <ConstructionBeams opacity={0.02} />
        <div className="absolute top-[20%] left-[10%] w-[500px] h-[500px] rounded-full blur-[180px] pointer-events-none" style={{ background: `${ORANGE}06` }} />

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="relative">
              <div className="rounded-2xl overflow-hidden border border-white/10">
                <img src="https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=600&q=80" alt="Construction team at work" className="w-full h-[400px] object-cover" />
              </div>
              <div className="absolute -bottom-4 -right-4 md:bottom-6 md:-right-6">
                <div className="px-5 py-3 rounded-xl backdrop-blur-md border text-white font-bold text-sm shadow-lg" style={{ background: `${ORANGE}e6`, borderColor: `${ORANGE}80` }}>500+ Projects Completed</div>
              </div>
            </div>
            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: ORANGE, borderColor: `${ORANGE}33`, background: `${ORANGE}0d` }}>Why Choose Us</span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6 text-white">Build It Right the First Time</h2>
              <p className="text-slate-400 leading-relaxed mb-8">
                Summit Builders NW has been the Pacific Northwest&apos;s trusted general contractor for over 25 years. We bring an unwavering commitment to quality, transparent communication, and meticulous project management to every build.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: ShieldCheck, label: "Fully Licensed" },
                  { icon: CheckCircle, label: "Bonded & Insured" },
                  { icon: Star, label: "5-Star Rated" },
                  { icon: Users, label: "Expert Crews" },
                ].map((badge) => (
                  <GlassCard key={badge.label} className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: ORANGE_GLOW }}>
                      <badge.icon size={20} weight="duotone" style={{ color: ORANGE }} />
                    </div>
                    <span className="text-sm font-semibold text-white">{badge.label}</span>
                  </GlassCard>
                ))}
              </div>
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* ══════ 6. PROCESS ══════ */}
      <SectionReveal className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #12141a 50%, ${BG} 100%)` }} />
        <BlueprintGrid opacity={0.025} />
        <div className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] rounded-full blur-[180px] pointer-events-none" style={{ background: `${STEEL}06` }} />

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: ORANGE, borderColor: `${ORANGE}33`, background: `${ORANGE}0d` }}>Our Process</span>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white">How We Build</h2>
            <div className="h-0.5 w-16 mx-auto mt-4" style={{ background: `linear-gradient(to right, ${ORANGE}, transparent)` }} />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {processSteps.map((step, i) => (
              <div key={step.step} className="relative">
                {i < processSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-10 left-[calc(50%+40px)] w-[calc(100%-80px)] h-px" style={{ background: `linear-gradient(to right, ${ORANGE}33, ${ORANGE}11)` }} />
                )}
                <GlassCard className="p-6 text-center relative">
                  <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-black" style={{ background: `linear-gradient(135deg, ${ORANGE}22, ${ORANGE}0a)`, color: ORANGE, border: `1px solid ${ORANGE}33` }}>
                    {step.step}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
                </GlassCard>
              </div>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ══════ 7. GALLERY ══════ */}
      <SectionReveal id="gallery" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #10121a 50%, ${BG} 100%)` }} />
        <ConstructionBeams opacity={0.02} />
        <div className="absolute top-[30%] left-[20%] w-[500px] h-[500px] rounded-full blur-[200px] pointer-events-none" style={{ background: `${ORANGE}06` }} />

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: ORANGE, borderColor: `${ORANGE}33`, background: `${ORANGE}0d` }}>Our Work</span>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white">Project Gallery</h2>
            <div className="h-0.5 w-16 mx-auto mt-4" style={{ background: `linear-gradient(to right, ${ORANGE}, transparent)` }} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleryImages.map((src, i) => {
              const titles = ["Modern Kitchen Remodel", "Custom Home Build", "Living Room Renovation", "Luxury Home Exterior", "Bathroom Transformation", "Open Concept Design"];
              return (
                <div key={i} className="group relative rounded-2xl overflow-hidden border border-white/[0.06] hover:border-opacity-30 transition-all duration-500">
                  <img src={src} alt={titles[i]} className="w-full h-64 object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-lg font-bold text-white mb-1">{titles[i]}</h3>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </SectionReveal>

      {/* ══════ 8. TESTIMONIALS ══════ */}
      <SectionReveal className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #12141a 50%, ${BG} 100%)` }} />
        <BlueprintGrid opacity={0.02} />
        <div className="absolute top-[20%] right-[15%] w-[400px] h-[400px] rounded-full blur-[160px] pointer-events-none" style={{ background: `${ORANGE}06` }} />

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: ORANGE, borderColor: `${ORANGE}33`, background: `${ORANGE}0d` }}>Testimonials</span>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white">What Our Clients Say</h2>
            <div className="h-0.5 w-16 mx-auto mt-4" style={{ background: `linear-gradient(to right, ${ORANGE}, transparent)` }} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <GlassCard key={i} className="p-6 h-full flex flex-col">
                <Quotes size={28} weight="fill" style={{ color: ORANGE }} className="mb-4 opacity-40" />
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} size={16} weight="fill" style={{ color: ORANGE }} />
                  ))}
                </div>
                <p className="text-slate-300 leading-relaxed flex-1 text-sm mb-4">&ldquo;{t.text}&rdquo;</p>
                <div className="pt-4 border-t border-white/5">
                  <span className="text-sm font-semibold text-white">{t.name}</span>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ══════ 9. FAQ ══════ */}
      <SectionReveal className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #12141a 50%, ${BG} 100%)` }} />
        <ConstructionBeams opacity={0.02} />
        <div className="absolute top-[20%] left-[15%] w-[400px] h-[400px] rounded-full blur-[160px] pointer-events-none" style={{ background: `${ORANGE}06` }} />

        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: ORANGE, borderColor: `${ORANGE}33`, background: `${ORANGE}0d` }}>FAQ</span>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white">Common Questions</h2>
            <div className="h-0.5 w-16 mx-auto mt-4" style={{ background: `linear-gradient(to right, ${ORANGE}, transparent)` }} />
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <GlassCard key={i} className="overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-5 md:p-6 text-left group cursor-pointer">
                  <span className="text-lg font-semibold text-white pr-4">{faq.q}</span>
                  <motion.div animate={{ rotate: openFaq === i ? 180 : 0 }} transition={spring}>
                    <CaretDown size={20} className="text-slate-400 shrink-0" />
                  </motion.div>
                </button>
                <AnimatePresence initial={false}>
                  {openFaq === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={spring} className="overflow-hidden">
                      <p className="px-5 pb-5 md:px-6 md:pb-6 text-slate-400 leading-relaxed">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </GlassCard>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ══════ 10. CTA BANNER ══════ */}
      <section className="relative z-10 py-20 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${ORANGE}, ${ORANGE}cc, ${ORANGE})` }} />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='40' height='40' fill='none'/%3E%3Cpath d='M0 0L40 40M40 0L0 40' stroke='%23000' stroke-width='0.5'/%3E%3C/svg%3E\")" }} />
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <Hammer size={48} weight="fill" className="mx-auto mb-6 text-white/70" />
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-4">Ready to Start Your Project?</h2>
          <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">Get a free, no-obligation consultation. We&apos;ll discuss your vision, timeline, and budget — then deliver a detailed proposal.</p>
          <a href="tel:+12535550147" className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-white text-black font-bold text-lg hover:bg-white/90 transition-colors">
            <Phone size={20} weight="fill" /> (253) 555-0147
          </a>
        </div>
      </section>

      {/* ══════ 11. CONTACT ══════ */}
      <SectionReveal id="contact" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #10121a 50%, ${BG} 100%)` }} />
        <BlueprintGrid opacity={0.02} />
        <div className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] rounded-full blur-[180px] pointer-events-none" style={{ background: `${ORANGE}06` }} />

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: ORANGE, borderColor: `${ORANGE}33`, background: `${ORANGE}0d` }}>Contact Us</span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6 text-white">Let&apos;s Build Something Great</h2>
              <p className="text-slate-400 leading-relaxed mb-8">Ready to start your project? Contact Summit Builders NW today for a free consultation and detailed estimate.</p>
              <div className="space-y-5">
                {[
                  { icon: MapPin, title: "Address", text: "1234 Builder Way, Tacoma, WA 98402" },
                  { icon: Phone, title: "Phone", text: "(253) 555-0147" },
                  { icon: Clock, title: "Hours", text: "Mon-Sat: 7AM-6PM" },
                  { icon: Ruler, title: "Free Estimates", text: "On-site visits within 48 hours" },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: ORANGE_GLOW }}>
                      <item.icon size={20} weight="duotone" style={{ color: ORANGE }} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{item.title}</p>
                      <p className="text-sm text-slate-400">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <GlassCard className="p-8">
              <h3 className="text-xl font-semibold text-white mb-6">Request a Free Estimate</h3>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-1.5">First Name</label>
                    <input type="text" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none text-sm" placeholder="John" />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1.5">Last Name</label>
                    <input type="text" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none text-sm" placeholder="Doe" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">Phone</label>
                  <input type="tel" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none text-sm" placeholder="(555) 123-4567" />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">Project Type</label>
                  <select className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none text-sm">
                    <option value="" className="bg-neutral-900">Select a service</option>
                    {services.map((s) => <option key={s.name} value={s.name.toLowerCase()} className="bg-neutral-900">{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">Project Description</label>
                  <textarea rows={4} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none text-sm resize-none" placeholder="Tell us about your project..." />
                </div>
                <MagneticButton className="w-full py-4 rounded-xl text-base font-semibold text-white flex items-center justify-center gap-2 cursor-pointer" style={{ background: ORANGE }}>
                  Send Request <ArrowRight size={18} weight="bold" />
                </MagneticButton>
              </form>
            </GlassCard>
          </div>
        </div>
      </SectionReveal>

      {/* ══════ 12. GUARANTEE ══════ */}
      <SectionReveal className="relative z-10 py-16 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #12141a 100%)` }} />
        <BlueprintGrid opacity={0.015} />
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <ShimmerBorder>
            <div className="p-8 md:p-12">
              <ShieldCheck size={48} weight="fill" style={{ color: ORANGE }} className="mx-auto mb-4" />
              <h2 className="text-2xl md:text-4xl font-extrabold text-white mb-4">Our Guarantee</h2>
              <p className="text-slate-400 leading-relaxed max-w-2xl mx-auto text-lg">
                Every project comes with a 5-year workmanship warranty. We stand behind our craftsmanship and your satisfaction is guaranteed.
              </p>
              <div className="flex flex-wrap justify-center gap-4 mt-8">
                {["Licensed Contractor", "Free Estimates", "5-Year Warranty", "Satisfaction Guaranteed"].map((item) => (
                  <span key={item} className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border" style={{ color: ORANGE, borderColor: `${ORANGE}33`, background: `${ORANGE}0d` }}>
                    <CheckCircle size={16} weight="fill" /> {item}
                  </span>
                ))}
              </div>
            </div>
          </ShimmerBorder>
        </div>
      </SectionReveal>

      {/* ══════ 13. FOOTER ══════ */}
      <footer className="relative z-10 border-t border-white/5 py-10 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #0a0c10 100%)` }} />
        <BlueprintGrid opacity={0.015} />
        <div className="mx-auto max-w-6xl px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Hammer size={22} weight="fill" style={{ color: ORANGE }} />
                <span className="text-lg font-bold text-white">Summit Builders NW</span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">Pacific Northwest&apos;s trusted general contractor. 25+ years of exceptional craftsmanship.</p>
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
                <p>(253) 555-0147</p>
                <p>1234 Builder Way, Tacoma, WA 98402</p>
              </div>
            </div>
          </div>
          <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Hammer size={14} weight="fill" style={{ color: ORANGE }} />
              <span>Summit Builders NW &copy; {new Date().getFullYear()}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" /></svg>
              <span>Created by <a href="https://bluejayportfolio.com" target="_blank" rel="noopener noreferrer" style={{textDecoration:"underline"}}>bluejayportfolio.com</a></span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
