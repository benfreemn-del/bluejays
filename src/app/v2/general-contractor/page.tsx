"use client";

/* eslint-disable @next/next/no-img-element -- Static marketing showcase uses plain img tags intentionally. */
/* eslint-disable react-hooks/purity -- Decorative particle values randomized for static visual effects. */

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
  ShieldCheck,
  Star,
  Clock,
  Phone,
  MapPin,
  ArrowRight,
  CheckCircle,
  XCircle,
  CaretDown,
  List,
  X,
  Users,
  ClipboardText,
  Quotes,
  Certificate,
  Play,
  TreeStructure,
  Timer,
  Bathtub,
  CookingPot,
  PlusCircle,
  Storefront,
  Tree,
  Envelope,
} from "@phosphor-icons/react";

/* ───────────────── SPRING / ANIMATION ───────────────── */
const spring = { type: "spring" as const, stiffness: 100, damping: 20 };
const springFast = { type: "spring" as const, stiffness: 200, damping: 25 };

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const fadeUp = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: spring } };

/* ───────────────── COLORS ───────────────── */
const AMBER = "#d97706";
const AMBER_LIGHT = "#f59e0b";
const BG = "#1a2030";
const BG_DARK = "#141a28";
const BG_DARKER = "#101620";
const AMBER_GLOW = "rgba(217,119,6,0.15)";
const STEEL = "#475569";

/* ───────────────── FLOATING PARTICLES ───────────────── */
function FloatingParticles() {
  const particles = Array.from({ length: 22 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 8,
    duration: 6 + Math.random() * 6,
    size: 2 + Math.random() * 3,
    opacity: 0.1 + Math.random() * 0.2,
    isAmber: Math.random() > 0.55,
  }));

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden hidden md:block">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{ left: `${p.x}%`, width: p.size, height: p.size, background: p.isAmber ? AMBER : STEEL, willChange: "transform, opacity" }}
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
        <pattern id="bpGrid" width="80" height="80" patternUnits="userSpaceOnUse">
          <rect width="80" height="80" fill="none" stroke={STEEL} strokeWidth="0.5" />
          <rect width="40" height="40" fill="none" stroke={STEEL} strokeWidth="0.25" />
          <circle cx="0" cy="0" r="1.5" fill={AMBER} opacity="0.3" />
          <circle cx="80" cy="80" r="1.5" fill={AMBER} opacity="0.3" />
          <circle cx="40" cy="40" r="1" fill={STEEL} opacity="0.4" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#bpGrid)" />
    </svg>
  );
}

/* ───────────────── CONSTRUCTION BEAMS SVG ───────────────── */
function ConstructionBeams({ opacity = 0.04 }: { opacity?: number }) {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }} viewBox="0 0 1000 600" preserveAspectRatio="none">
      <path d="M0 300 L500 100 L1000 300" stroke={STEEL} strokeWidth="2" fill="none" />
      <path d="M100 600 L100 200 L200 150 L200 600" stroke={AMBER} strokeWidth="1" fill="none" />
      <path d="M800 600 L800 200 L900 150 L900 600" stroke={AMBER} strokeWidth="1" fill="none" />
      <path d="M200 250 L800 250" stroke={STEEL} strokeWidth="0.5" fill="none" strokeDasharray="8 4" />
      <path d="M300 400 L700 400" stroke={STEEL} strokeWidth="0.3" fill="none" strokeDasharray="4 8" />
    </svg>
  );
}

/* ───────────────── UTILITY COMPONENTS ───────────────── */
function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-white/15 bg-white/[0.07] backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)] ${className}`}>
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
      <motion.div className="absolute inset-0 rounded-2xl" style={{ background: `conic-gradient(from 0deg, transparent, ${AMBER}, transparent, ${STEEL}, transparent)`, willChange: "transform" }} animate={{ rotate: [0, 360] }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} />
      <div className="relative rounded-2xl z-10" style={{ background: BG }}>{children}</div>
    </div>
  );
}

function SectionLabel({ text }: { text: string }) {
  return (
    <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: AMBER, borderColor: `${AMBER}33`, background: `${AMBER}0d` }}>{text}</span>
  );
}

function AccentLine() {
  return <div className="h-0.5 w-16 mx-auto mt-4" style={{ background: `linear-gradient(to right, ${AMBER}, transparent)` }} />;
}

/* ───────────────── DATA ───────────────── */
const services = [
  { name: "Kitchen Remodeling", desc: "Complete kitchen renovations with custom cabinetry, quartz countertops, and designer fixtures that transform your daily life.", icon: CookingPot },
  { name: "Bathroom Renovations", desc: "Luxury bathroom overhauls with heated floors, walk-in showers, and spa-quality finishes for your private retreat.", icon: Bathtub },
  { name: "Home Additions", desc: "Seamless room additions, second stories, and in-law suites that blend perfectly with your existing architecture.", icon: PlusCircle },
  { name: "ADU Construction", desc: "Accessory dwelling units designed and built to Seattle code, from detached cottages to garage conversions.", icon: House },
  { name: "Commercial Build-Outs", desc: "Office renovations, retail spaces, and commercial tenant improvements delivered on schedule and within budget.", icon: Storefront },
  { name: "Decks & Outdoor Living", desc: "Custom decks, covered patios, and outdoor kitchens built with premium materials to withstand PNW weather.", icon: Tree },
];

const stats = [
  { value: "200+", label: "Projects Completed" },
  { value: "22", label: "Years Experience" },
  { value: "4.9", label: "Google Rating" },
  { value: "100%", label: "Licensed & Bonded" },
];

const processSteps = [
  { step: "01", title: "Free Consultation", desc: "Chris visits your site personally. We discuss your vision, timeline, and realistic budget. No pressure, no obligation.", icon: ClipboardText },
  { step: "02", title: "Design & Planning", desc: "Our team creates detailed plans, 3D renderings, and material selections. We collaborate until you love every detail.", icon: Ruler },
  { step: "03", title: "Permits & Approvals", desc: "We handle all Seattle permitting, HOA approvals, and code compliance. You never visit city hall.", icon: Certificate },
  { step: "04", title: "Build Phase", desc: "Expert crews execute with daily updates, clean job sites, and transparent progress tracking. Quality at every step.", icon: Hammer },
  { step: "05", title: "Final Walkthrough", desc: "We walk every inch together. Punch list completed on the spot. We don't finish until you're 100% satisfied.", icon: CheckCircle },
];

const testimonials = [
  { name: "Michael & Janet R.", location: "Wallingford", text: "Chris and his crew completely reimagined our 1960s kitchen. They managed every subcontractor, kept us informed daily, and finished two days ahead of schedule. The result is stunning.", rating: 5, project: "Kitchen Remodel — $42K" },
  { name: "Sarah & Tom K.", location: "Green Lake", text: "Summit built our dream ADU from the ground up. Every permit handled, every inspection passed first time. Our rental income now covers our mortgage. Best investment we ever made.", rating: 5, project: "Detached ADU — $185K" },
  { name: "David L.", location: "Ballard", text: "We needed a commercial build-out for our restaurant space. Complex plumbing, hood ventilation, ADA compliance — they managed it all seamlessly. Opened on time.", rating: 5, project: "Commercial Build-Out — $95K" },
  { name: "Patricia W.", location: "Ravenna", text: "After three contractors gave us the runaround, Summit Builders delivered our bathroom renovation on time and on budget. Chris personally checked on the project every single day.", rating: 5, project: "Master Bath — $28K" },
];

const faqs = [
  { q: "How long does a typical kitchen remodel take?", a: "A standard Seattle kitchen remodel runs 8-12 weeks depending on scope. We provide a detailed timeline with milestones during consultation, plus daily updates via our client portal." },
  { q: "Do you handle permits and inspections?", a: "Absolutely. We pull all permits through the City of Seattle, coordinate every inspection, and ensure full code compliance. You never need to visit city hall." },
  { q: "What's your warranty on completed work?", a: "All projects come with a comprehensive 5-year workmanship warranty backed by our WA contractor bond. We stand behind every joint, finish, and system we install." },
  { q: "Can you work with my architect's plans?", a: "Yes! We regularly collaborate with local architects and designers. We can also provide in-house design services or connect you with our preferred architects for a full design-build experience." },
  { q: "What sets you apart from a handyman?", a: "As a licensed general contractor (WA #SUMMBW*891QP), we carry full liability insurance, pull permits, coordinate licensed subcontractors, and guarantee our work. A handyman legally cannot do most of what we do." },
];

const projectTypes = [
  { name: "Kitchen Remodels", icon: CookingPot, desc: "Custom cabinetry, countertops, and modern fixtures" },
  { name: "Bathroom Renovations", icon: Bathtub, desc: "Luxury spa-quality upgrades and accessibility retrofits" },
  { name: "Room Additions", icon: PlusCircle, desc: "Seamless additions that match your existing home" },
  { name: "ADU / DADUs", icon: House, desc: "Detached & attached accessory dwelling units" },
  { name: "Commercial TIs", icon: Storefront, desc: "Tenant improvements and commercial build-outs" },
  { name: "Decks & Patios", icon: Tree, desc: "Covered decks, pergolas, and outdoor kitchens" },
  { name: "Structural Work", icon: HardHat, desc: "Foundation repair, load-bearing walls, and reinforcement" },
  { name: "Whole-Home Renovations", icon: Buildings, desc: "Complete gut-renovations and historic restorations" },
];

const portfolioProjects = [
  { title: "Modern Wallingford Kitchen", neighborhood: "Wallingford", image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80", type: "Kitchen Remodel" },
  { title: "Green Lake ADU", neighborhood: "Green Lake", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80", type: "ADU Construction" },
  { title: "Ballard Loft Conversion", neighborhood: "Ballard", image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=600&q=80", type: "Addition" },
  { title: "Capitol Hill Townhome", neighborhood: "Capitol Hill", image: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=600&q=80", type: "New Construction" },
  { title: "Ravenna Master Suite", neighborhood: "Ravenna", image: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=600&q=80", type: "Bathroom Renovation" },
  { title: "Fremont Open Concept", neighborhood: "Fremont", image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&q=80", type: "Whole-Home Renovation" },
];

const comparisonRows = [
  { feature: "Licensed & Bonded (WA State)", us: true, them: "Rarely" },
  { feature: "Pulls Permits & Passes Inspections", us: true, them: "No" },
  { feature: "Coordinates Licensed Subcontractors", us: true, them: "No" },
  { feature: "5-Year Workmanship Warranty", us: true, them: "No" },
  { feature: "Liability Insurance ($2M+)", us: true, them: "Varies" },
  { feature: "Daily Progress Updates", us: true, them: "Rarely" },
  { feature: "Handles Complex Structural Work", us: true, them: "No" },
];

const investmentTiers = [
  { tier: "Refresh", range: "$15K - $35K", desc: "Kitchen facelift, bathroom upgrade, or single-room renovation with new fixtures and finishes.", examples: ["Kitchen cabinet refacing", "Bathroom tile & fixtures", "Flooring replacement", "Interior painting"], popular: false },
  { tier: "Transform", range: "$35K - $75K", desc: "Full kitchen or bathroom remodel, deck construction, or multi-room renovation with structural updates.", examples: ["Full kitchen remodel", "Master suite renovation", "Custom deck & patio", "Basement finishing"], popular: true },
  { tier: "Build", range: "$75K+", desc: "ADU construction, home additions, whole-home renovations, or commercial build-outs from the ground up.", examples: ["Detached ADU", "Second-story addition", "Whole-home gut renovation", "Commercial tenant improvement"], popular: false },
];

const certifications = ["WA Licensed GC", "Bonded & Insured", "BBB A+ Rated", "Seattle Permit Expert", "EPA Lead-Safe Certified", "OSHA Compliant"];

/* ═══════════════════════════════════════════════════
   MAIN PAGE — Summit Builders NW
   ═══════════════════════════════════════════════════ */
export default function V2GeneralContractorShowcase() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [quizStep, setQuizStep] = useState<number | null>(null);

  return (
    <main className="gc-v2 relative min-h-[100dvh] overflow-x-hidden" style={{ background: BG, color: "#f1f5f9" }}>
      <FloatingParticles />

      {/* ══════════════════════════════════════════════════
          1. NAV
          ══════════════════════════════════════════════════ */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-4">
          <GlassCard className="flex items-center justify-between px-4 md:px-6 py-3">
            <div className="flex items-center gap-2">
              <Hammer size={24} weight="fill" style={{ color: AMBER }} />
              <span className="text-lg font-bold tracking-tight text-white">Summit Builders NW</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
              {["Services", "Portfolio", "Process", "About", "Contact"].map((link) => (
                <a key={link} href={`#${link.toLowerCase()}`} className="hover:text-white transition-colors">{link}</a>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <MagneticButton className="px-4 md:px-5 py-2 rounded-full text-sm font-semibold text-white transition-colors cursor-pointer" style={{ background: AMBER }}>
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
                  {["Services", "Portfolio", "Process", "About", "Contact"].map((l) => (
                    <a key={l} href={`#${l.toLowerCase()}`} onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors">{l}</a>
                  ))}
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* ══════════════════════════════════════════════════
          2. HERO — ISOMETRIC 3D PERSPECTIVE
          ══════════════════════════════════════════════════ */}
      <section className="relative min-h-[100dvh] flex items-center pt-24 z-10 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(145deg, #161c2a 0%, ${BG} 40%, #1e2538 100%)` }} />
        <BlueprintGrid opacity={0.04} />
        <ConstructionBeams opacity={0.035} />
        {/* Ambient glows */}
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full blur-[200px] pointer-events-none" style={{ background: `${AMBER}0a` }} />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full blur-[160px] pointer-events-none" style={{ background: `${STEEL}08` }} />

        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6 w-full">
          {/* 3D perspective photo behind text */}
          <div className="hidden lg:block absolute top-1/2 right-0 -translate-y-1/2 w-[55%]" style={{ perspective: "1200px" }}>
            <motion.div
              className="rounded-2xl overflow-hidden border border-white/15 shadow-2xl"
              style={{ transformStyle: "preserve-3d" }}
              initial={{ rotateX: 8, rotateY: -12, scale: 0.95 }}
              animate={{ rotateX: 8, rotateY: -12, scale: 0.95 }}
              whileHover={{ rotateX: 3, rotateY: -5, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <img src="https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1400&q=80" alt="Beautiful custom home built by Summit Builders NW" className="w-full h-[520px] object-cover" />
              <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-[#1a2030]/90" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a2030]/70 via-transparent to-transparent" />
            </motion.div>
          </div>

          {/* Hero text content — in front of the tilted photo */}
          <div className="relative z-10 max-w-xl space-y-8 py-8 lg:py-0">
            <div>
              <motion.p initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="text-sm uppercase tracking-widest mb-5 font-semibold" style={{ color: AMBER }}>
                Licensed General Contractor &mdash; Seattle, WA
              </motion.p>
              <h1 className="text-4xl md:text-6xl lg:text-7xl tracking-tighter leading-[0.95] font-black text-white" style={{ textShadow: "0 4px 30px rgba(0,0,0,0.6)" }}>
                <WordReveal text="Building Seattle's Future, One Home at a Time" />
              </h1>
            </div>

            {/* Trust pills */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="flex flex-wrap gap-3">
              {["22 Years Experience", "200+ Projects", "WA #SUMMBW*891QP"].map((pill) => (
                <span key={pill} className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold border backdrop-blur-md" style={{ color: AMBER, borderColor: `${AMBER}40`, background: `${AMBER}15` }}>
                  <ShieldCheck size={14} weight="fill" /> {pill}
                </span>
              ))}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }} className="flex flex-wrap gap-4">
              <MagneticButton className="px-8 py-4 rounded-full text-base font-bold text-white flex items-center gap-2 cursor-pointer shadow-lg" style={{ background: AMBER, boxShadow: `0 0 40px ${AMBER}40` }}>
                Get Free Estimate <ArrowRight size={18} weight="bold" />
              </MagneticButton>
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/15 flex items-center gap-2 cursor-pointer backdrop-blur-md bg-white/5">
                <Phone size={18} weight="duotone" /> (206) 782-9345
              </MagneticButton>
            </motion.div>

            <div className="flex flex-wrap gap-6 text-sm text-slate-400">
              <span className="flex items-center gap-2"><MapPin size={16} weight="duotone" style={{ color: AMBER }} /> 8901 Roosevelt Way NE, Seattle</span>
              <span className="flex items-center gap-2"><Clock size={16} weight="duotone" style={{ color: AMBER }} /> Mon-Sat 7AM-6PM</span>
            </div>
          </div>

          {/* Mobile hero image (no 3D tilt on mobile) */}
          <div className="lg:hidden mt-8 rounded-2xl overflow-hidden border border-white/15">
            <img src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=900&q=80" alt="Stunning custom home exterior" className="w-full h-72 object-cover" />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          3. TRUST BAR / STATS
          ══════════════════════════════════════════════════ */}
      <SectionReveal className="relative z-10 py-14 overflow-hidden border-y border-white/15" id="stats">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG_DARK} 0%, ${BG} 100%)` }} />
        <BlueprintGrid opacity={0.02} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => {
              const icons = [Hammer, Clock, Star, ShieldCheck];
              const Icon = icons[i];
              return (
                <div key={stat.label} className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Icon size={22} weight="fill" style={{ color: AMBER }} />
                    <span className="text-3xl md:text-4xl font-extrabold text-white">{stat.value}</span>
                  </div>
                  <span className="text-slate-500 text-sm font-medium tracking-wide uppercase">{stat.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </SectionReveal>

      {/* ══════════════════════════════════════════════════
          4. SERVICES
          ══════════════════════════════════════════════════ */}
      <SectionReveal id="services" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, ${BG_DARK} 50%, ${BG} 100%)` }} />
        <BlueprintGrid />
        <ConstructionBeams opacity={0.02} />
        <div className="absolute top-[10%] right-[5%] w-[500px] h-[500px] rounded-full blur-[160px] pointer-events-none" style={{ background: `${AMBER}08` }} />

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <SectionLabel text="Our Services" />
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white">Comprehensive Construction Services</h2>
            <AccentLine />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, i) => {
              const Icon = service.icon;
              return (
                <div key={service.name} className="group relative p-7 rounded-2xl border border-white/[0.10] hover:border-opacity-30 transition-all duration-500 overflow-hidden bg-white/[0.07]">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: `radial-gradient(circle at 50% 0%, ${AMBER}15, transparent 70%)` }} />
                  <div className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `linear-gradient(to right, transparent, ${AMBER}4d, transparent)` }} />
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-5">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 border" style={{ background: AMBER_GLOW, borderColor: `${AMBER}33` }}>
                        <Icon size={24} weight="duotone" style={{ color: AMBER }} />
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

      {/* ══════════════════════════════════════════════════
          5. PROJECT INVESTMENT GUIDE
          ══════════════════════════════════════════════════ */}
      <SectionReveal className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, ${BG_DARKER} 50%, ${BG} 100%)` }} />
        <BlueprintGrid opacity={0.025} />
        <div className="absolute top-[20%] left-[10%] w-[500px] h-[500px] rounded-full blur-[180px] pointer-events-none" style={{ background: `${AMBER}06` }} />

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <SectionLabel text="Investment Guide" />
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white">What Does Your Project Cost?</h2>
            <p className="text-slate-400 mt-4 max-w-2xl mx-auto">Transparent pricing ranges for Seattle-area projects. Every estimate is custom — these ranges give you a realistic starting point.</p>
            <AccentLine />
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {investmentTiers.map((tier) => (
              <div key={tier.tier} className={`relative rounded-2xl border overflow-hidden transition-all duration-300 ${tier.popular ? "border-amber-500/40 shadow-lg" : "border-white/15"}`} style={{ background: tier.popular ? `linear-gradient(180deg, ${AMBER}0d, ${BG_DARK})` : `${BG_DARK}` }}>
                {tier.popular && (
                  <div className="absolute top-0 left-0 right-0 h-1" style={{ background: AMBER }} />
                )}
                <div className="p-8">
                  {tier.popular && (
                    <span className="inline-block text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full mb-4" style={{ color: BG, background: AMBER }}>Most Popular</span>
                  )}
                  <h3 className="text-xl font-bold text-white mb-1">{tier.tier}</h3>
                  <p className="text-3xl font-black mb-3" style={{ color: AMBER }}>{tier.range}</p>
                  <p className="text-sm text-slate-400 leading-relaxed mb-6">{tier.desc}</p>
                  <ul className="space-y-2">
                    {tier.examples.map((ex) => (
                      <li key={ex} className="flex items-center gap-2 text-sm text-slate-300">
                        <CheckCircle size={16} weight="fill" style={{ color: AMBER }} /> {ex}
                      </li>
                    ))}
                  </ul>
                  <MagneticButton className="w-full mt-6 py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 cursor-pointer border" style={tier.popular ? { background: AMBER, borderColor: AMBER } : { borderColor: `${AMBER}40`, background: `${AMBER}15` }}>
                    Get Estimate <ArrowRight size={16} weight="bold" />
                  </MagneticButton>
                </div>
              </div>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ══════════════════════════════════════════════════
          6. 5-STEP BUILD PROCESS
          ══════════════════════════════════════════════════ */}
      <SectionReveal id="process" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, ${BG_DARK} 50%, ${BG} 100%)` }} />
        <ConstructionBeams opacity={0.02} />
        <div className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] rounded-full blur-[180px] pointer-events-none" style={{ background: `${STEEL}06` }} />

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <SectionLabel text="Our Process" />
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white">How We Build Your Project</h2>
            <AccentLine />
          </div>

          {/* Vertical timeline on desktop, stack on mobile */}
          <div className="relative">
            {/* Vertical line */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2" style={{ background: `linear-gradient(to bottom, ${AMBER}33, ${AMBER}11)` }} />

            <div className="space-y-12 md:space-y-16">
              {processSteps.map((step, i) => {
                const Icon = step.icon;
                const isLeft = i % 2 === 0;
                return (
                  <div key={step.step} className={`relative md:flex items-center ${isLeft ? "md:flex-row" : "md:flex-row-reverse"}`}>
                    {/* Timeline dot */}
                    <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-12 h-12 rounded-full items-center justify-center text-lg font-black z-10 border-2" style={{ background: BG, color: AMBER, borderColor: `${AMBER}66` }}>
                      {step.step}
                    </div>
                    {/* Content */}
                    <div className={`md:w-[45%] ${isLeft ? "md:pr-16 md:text-right" : "md:pl-16"}`}>
                      <GlassCard className="p-6 relative">
                        <div className={`flex items-center gap-3 mb-3 ${isLeft ? "md:flex-row-reverse" : ""}`}>
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: AMBER_GLOW }}>
                            <Icon size={20} weight="duotone" style={{ color: AMBER }} />
                          </div>
                          <span className="md:hidden text-xs font-mono" style={{ color: AMBER }}>Step {step.step}</span>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                        <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
                      </GlassCard>
                    </div>
                    {/* Spacer for the other side */}
                    <div className="hidden md:block md:w-[45%]" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* ══════════════════════════════════════════════════
          7. WHY CHOOSE A LICENSED GC
          ══════════════════════════════════════════════════ */}
      <SectionReveal className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, ${BG_DARKER} 50%, ${BG} 100%)` }} />
        <BlueprintGrid opacity={0.02} />
        <div className="absolute top-[20%] right-[15%] w-[400px] h-[400px] rounded-full blur-[160px] pointer-events-none" style={{ background: `${AMBER}06` }} />

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <SectionLabel text="Why Licensed?" />
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white">Why Choose a Licensed General Contractor</h2>
            <AccentLine />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: ShieldCheck, title: "Legal Protection", desc: "Licensed contractors carry bonds and insurance protecting you if anything goes wrong. Unlicensed work has zero recourse." },
              { icon: Certificate, title: "Permit Expertise", desc: "We pull all permits through Seattle DCI. Unpermitted work can void your insurance and kill resale value." },
              { icon: TreeStructure, title: "Sub Coordination", desc: "We manage licensed electricians, plumbers, and HVAC pros. One point of contact, one warranty, one schedule." },
              { icon: ShieldCheck, title: "Warranty Backed", desc: "Our 5-year warranty is backed by our WA contractor bond. A handyman's verbal promise holds zero legal weight." },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <GlassCard key={item.title} className="p-6 text-center">
                  <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${AMBER}22, ${AMBER}0a)`, border: `1px solid ${AMBER}33` }}>
                    <Icon size={26} weight="duotone" style={{ color: AMBER }} />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
                </GlassCard>
              );
            })}
          </div>
        </div>
      </SectionReveal>

      {/* ══════════════════════════════════════════════════
          8. PROJECT TYPES GRID
          ══════════════════════════════════════════════════ */}
      <SectionReveal className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, ${BG_DARK} 50%, ${BG} 100%)` }} />
        <ConstructionBeams opacity={0.02} />
        <div className="absolute bottom-[20%] left-[15%] w-[500px] h-[500px] rounded-full blur-[180px] pointer-events-none" style={{ background: `${AMBER}06` }} />

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <SectionLabel text="Project Types" />
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white">What We Build</h2>
            <AccentLine />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {projectTypes.map((pt) => {
              const Icon = pt.icon;
              return (
                <div key={pt.name} className="group relative p-5 rounded-2xl border border-white/[0.10] hover:border-amber-500/30 transition-all duration-400 text-center overflow-hidden bg-white/[0.07]">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: `radial-gradient(circle at 50% 30%, ${AMBER}12, transparent 70%)` }} />
                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center" style={{ background: AMBER_GLOW, border: `1px solid ${AMBER}33` }}>
                      <Icon size={24} weight="duotone" style={{ color: AMBER }} />
                    </div>
                    <h3 className="text-sm font-bold text-white mb-1">{pt.name}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">{pt.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </SectionReveal>

      {/* ══════════════════════════════════════════════════
          9. PROJECT PORTFOLIO
          ══════════════════════════════════════════════════ */}
      <SectionReveal id="portfolio" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, ${BG_DARKER} 50%, ${BG} 100%)` }} />
        <BlueprintGrid opacity={0.02} />
        <div className="absolute top-[30%] left-[20%] w-[500px] h-[500px] rounded-full blur-[200px] pointer-events-none" style={{ background: `${AMBER}06` }} />

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <SectionLabel text="Our Work" />
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white">Project Portfolio</h2>
            <p className="text-slate-400 mt-4 max-w-xl mx-auto">Recent builds across Seattle neighborhoods. Every project managed by Chris Dalton personally.</p>
            <AccentLine />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {portfolioProjects.map((proj, i) => (
              <div key={i} className="group relative rounded-2xl overflow-hidden border border-white/[0.10] hover:border-amber-500/30 transition-all duration-500">
                <img src={proj.image} alt={proj.title} className="w-full h-64 object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold backdrop-blur-md border" style={{ color: AMBER, borderColor: `${AMBER}40`, background: `${AMBER}20` }}>{proj.type}</span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <h3 className="text-lg font-bold text-white mb-1">{proj.title}</h3>
                  <span className="flex items-center gap-1.5 text-xs text-slate-300">
                    <MapPin size={12} weight="fill" style={{ color: AMBER }} /> {proj.neighborhood}, Seattle
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ══════════════════════════════════════════════════
          10. MEET THE TEAM
          ══════════════════════════════════════════════════ */}
      <SectionReveal id="about" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, ${BG_DARK} 50%, ${BG} 100%)` }} />
        <ConstructionBeams opacity={0.02} />
        <div className="absolute top-[20%] left-[10%] w-[500px] h-[500px] rounded-full blur-[180px] pointer-events-none" style={{ background: `${AMBER}06` }} />

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-14">
            <SectionLabel text="Our Team" />
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white">The People Behind Summit Builders</h2>
            <AccentLine />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Chris Dalton",
                role: "Owner & Licensed GC",
                bio: "22 years building in the Pacific Northwest. Chris personally oversees every project — no middlemen, no surprises. WA #SUMMBW*891QP.",
                credentials: ["WA Licensed GC", "Bonded & Insured"],
                img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
                isOwner: true,
              },
              {
                name: "Mike Forsythe",
                role: "Project Manager",
                bio: "Coordinates all subcontractors, permits, and daily site operations. Fifteen years managing Seattle-area residential and commercial builds.",
                credentials: ["OSHA 30 Certified", "15 Yrs Experience"],
                img: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80",
                isOwner: false,
              },
              {
                name: "Sandra Reyes",
                role: "Design & Client Lead",
                bio: "Guides homeowners through material selections, 3D renderings, and design decisions. The friendly face you'll work with from first meeting to final walkthrough.",
                credentials: ["Interior Design Cert.", "3D Rendering Specialist"],
                img: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&q=80",
                isOwner: false,
              },
            ].map((member) => (
              <GlassCard key={member.name} className="overflow-hidden group">
                <div className="relative">
                  <img
                    src={member.img}
                    alt={member.name}
                    className="w-full h-[260px] object-cover object-top transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  {member.isOwner && (
                    <div className="absolute top-3 right-3">
                      <span className="px-3 py-1 rounded-full text-xs font-bold text-white" style={{ background: AMBER }}>
                        Owner
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-white mb-1">{member.name}</h3>
                  <p className="text-sm font-semibold mb-3" style={{ color: AMBER }}>{member.role}</p>
                  <p className="text-sm text-slate-400 leading-relaxed mb-4">{member.bio}</p>
                  <div className="flex flex-wrap gap-2">
                    {member.credentials.map(c => (
                      <span key={c} className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full border" style={{ borderColor: `${AMBER}33`, background: `${AMBER}0d`, color: AMBER }}>
                        <ShieldCheck size={11} weight="fill" />{c}
                      </span>
                    ))}
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ══════════════════════════════════════════════════
          11. COMPETITOR COMPARISON
          ══════════════════════════════════════════════════ */}
      <SectionReveal className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, ${BG_DARKER} 50%, ${BG} 100%)` }} />
        <BlueprintGrid opacity={0.02} />
        <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] rounded-full blur-[160px] pointer-events-none" style={{ background: `${AMBER}06` }} />

        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <SectionLabel text="Compare" />
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white">Summit Builders vs. Handyman / Unlicensed</h2>
            <AccentLine />
          </div>

          <GlassCard className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/15">
                    <th className="px-6 py-4 text-sm font-semibold text-slate-400">Feature</th>
                    <th className="px-6 py-4 text-sm font-semibold text-center" style={{ color: AMBER }}>Summit Builders NW</th>
                    <th className="px-6 py-4 text-sm font-semibold text-center text-slate-500">Handyman / Unlicensed</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row, i) => (
                    <tr key={row.feature} className={i % 2 === 0 ? "bg-white/[0.07]" : ""}>
                      <td className="px-6 py-4 text-sm text-slate-300">{row.feature}</td>
                      <td className="px-6 py-4 text-center">
                        {row.us && <CheckCircle size={22} weight="fill" className="mx-auto" style={{ color: "#22c55e" }} />}
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-slate-500">
                        {row.them === "No" ? <XCircle size={22} weight="fill" className="mx-auto text-red-500/60" /> : <span>{row.them}</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      </SectionReveal>

      {/* ══════════════════════════════════════════════════
          12. "WHAT'S YOUR PROJECT?" QUIZ
          ══════════════════════════════════════════════════ */}
      <SectionReveal className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, ${BG_DARK} 50%, ${BG} 100%)` }} />
        <ConstructionBeams opacity={0.02} />
        <div className="absolute bottom-[20%] left-[20%] w-[500px] h-[500px] rounded-full blur-[180px] pointer-events-none" style={{ background: `${AMBER}06` }} />

        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <div className="text-center mb-12">
            <SectionLabel text="Quick Quiz" />
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white">What&apos;s Your Project?</h2>
            <p className="text-slate-400 mt-4">Select the option that best describes your needs and we&apos;ll point you in the right direction.</p>
            <AccentLine />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { label: "Kitchen or Bath Remodel", color: "#22c55e", rec: "Our most popular service. Average project: $25K-$55K. Most kitchens completed in 8-10 weeks.", icon: CookingPot },
              { label: "Room Addition or ADU", color: AMBER, rec: "Additions start at $75K. ADUs from $120K. We handle all Seattle permitting and design.", icon: PlusCircle },
              { label: "Whole-Home Renovation", color: "#ef4444", rec: "Major renovations require a licensed GC. We coordinate all trades under one warranty.", icon: Buildings },
              { label: "Commercial Build-Out", color: "#8b5cf6", rec: "Tenant improvements, restaurants, offices. We manage permits, inspections, and ADA compliance.", icon: Storefront },
            ].map((opt, i) => (
              <button key={opt.label} onClick={() => setQuizStep(quizStep === i ? null : i)} className={`text-left p-5 rounded-2xl border transition-all duration-300 cursor-pointer ${quizStep === i ? "border-amber-500/40" : "border-white/15 hover:border-white/20"}`} style={quizStep === i ? { background: `${AMBER}0d` } : { background: "rgba(255,255,255,0.02)" }}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${opt.color}20`, border: `1px solid ${opt.color}40` }}>
                    <opt.icon size={20} weight="duotone" style={{ color: opt.color }} />
                  </div>
                  <h3 className="text-sm font-bold text-white">{opt.label}</h3>
                </div>
                <AnimatePresence>
                  {quizStep === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={spring} className="overflow-hidden">
                      <p className="text-xs text-slate-400 leading-relaxed mt-2 mb-3">{opt.rec}</p>
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold" style={{ color: AMBER }}>
                        <Phone size={12} weight="fill" /> Call (206) 782-9345 for a Free Estimate
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ══════════════════════════════════════════════════
          13. VIDEO PLACEHOLDER
          ══════════════════════════════════════════════════ */}
      <SectionReveal className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, ${BG_DARKER} 50%, ${BG} 100%)` }} />
        <BlueprintGrid opacity={0.02} />

        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <div className="text-center mb-12">
            <SectionLabel text="See Our Work" />
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white">Tour Our Projects</h2>
            <AccentLine />
          </div>

          <div className="relative rounded-2xl overflow-hidden border border-white/15 group cursor-pointer">
            <img src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80" alt="Summit Builders project showcase" className="w-full h-80 md:h-[420px] object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors duration-300" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full flex items-center justify-center backdrop-blur-md border transition-transform duration-300 group-hover:scale-110" style={{ background: `${AMBER}cc`, borderColor: `${AMBER}` }}>
                <Play size={32} weight="fill" className="text-white ml-1" />
              </div>
            </div>
            <div className="absolute bottom-6 left-6 right-6 text-center">
              <p className="text-white text-lg font-semibold">Watch: Green Lake ADU Build — Start to Finish</p>
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* ══════════════════════════════════════════════════
          14. GOOGLE REVIEWS + TESTIMONIALS
          ══════════════════════════════════════════════════ */}
      <SectionReveal className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, ${BG_DARK} 50%, ${BG} 100%)` }} />
        <ConstructionBeams opacity={0.015} />
        <div className="absolute top-[20%] right-[15%] w-[400px] h-[400px] rounded-full blur-[160px] pointer-events-none" style={{ background: `${AMBER}06` }} />

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          {/* Google Reviews Header */}
          <div className="text-center mb-12">
            <SectionLabel text="Client Reviews" />
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} size={24} weight="fill" style={{ color: AMBER }} />
                ))}
              </div>
              <span className="text-2xl font-extrabold text-white">4.9</span>
              <span className="text-slate-400 text-sm">from 87 Google Reviews</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white">What Seattle Homeowners Say</h2>
            <AccentLine />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {testimonials.map((t, i) => (
              <GlassCard key={i} className="p-6 h-full flex flex-col">
                <Quotes size={28} weight="fill" style={{ color: AMBER }} className="mb-3 opacity-40" />
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} size={18} weight="fill" style={{ color: AMBER }} />
                  ))}
                </div>
                <p className="text-slate-300 leading-relaxed flex-1 text-sm mb-4">&ldquo;{t.text}&rdquo;</p>
                <div className="pt-4 border-t border-white/8 flex items-center justify-between">
                  <div>
                    <span className="text-sm font-semibold text-white block">{t.name}</span>
                    <span className="text-xs text-slate-500">{t.location}, Seattle</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs" style={{ color: AMBER }}>
                    <CheckCircle size={14} weight="fill" /> Verified
                  </div>
                </div>
                <p className="text-[11px] mt-2 font-medium" style={{ color: `${AMBER}99` }}>{t.project}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ══════════════════════════════════════════════════
          15. CERTIFICATIONS / PARTNER BADGES
          ══════════════════════════════════════════════════ */}
      <SectionReveal className="relative z-10 py-16 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, ${BG_DARK} 100%)` }} />
        <BlueprintGrid opacity={0.015} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-10">
            <SectionLabel text="Certifications" />
            <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight text-white">Trusted Credentials</h2>
            <AccentLine />
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {certifications.map((cert) => (
              <span key={cert} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium border backdrop-blur-md" style={{ color: AMBER, borderColor: `${AMBER}33`, background: `${AMBER}0d` }}>
                <Certificate size={16} weight="fill" /> {cert}
              </span>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ══════════════════════════════════════════════════
          16. EMERGENCY / AVAILABILITY
          ══════════════════════════════════════════════════ */}
      <SectionReveal className="relative z-10 py-12 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(90deg, ${BG_DARK}, ${BG}, ${BG_DARK})` }} />
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <GlassCard className="p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 md:gap-10">
            <div className="flex items-center gap-4 shrink-0">
              <motion.div
                className="w-4 h-4 rounded-full"
                style={{ background: "#22c55e" }}
                animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="text-lg font-bold text-white">Crews Available Now</span>
            </div>
            <div className="flex-1 text-center md:text-left">
              <p className="text-sm text-slate-400">We have open slots for new projects starting in the next 2-4 weeks. Schedule your free on-site consultation today.</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Timer size={20} weight="duotone" style={{ color: AMBER }} />
              <span className="text-sm font-semibold text-white">Response within 24 hours</span>
            </div>
          </GlassCard>
        </div>
      </SectionReveal>

      {/* ══════════════════════════════════════════════════
          17. FAQ
          ══════════════════════════════════════════════════ */}
      <SectionReveal className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, ${BG_DARK} 50%, ${BG} 100%)` }} />
        <ConstructionBeams opacity={0.015} />
        <div className="absolute top-[20%] left-[15%] w-[400px] h-[400px] rounded-full blur-[160px] pointer-events-none" style={{ background: `${AMBER}06` }} />

        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <SectionLabel text="FAQ" />
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white">Common Questions</h2>
            <AccentLine />
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

      {/* ══════════════════════════════════════════════════
          18. CTA BANNER
          ══════════════════════════════════════════════════ */}
      <section className="relative z-10 py-20 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${AMBER}, ${AMBER}cc, ${AMBER})` }} />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='40' height='40' fill='none'/%3E%3Cpath d='M0 0L40 40M40 0L0 40' stroke='%23000' stroke-width='0.5'/%3E%3C/svg%3E\")" }} />
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <Hammer size={48} weight="fill" className="mx-auto mb-6 text-white/70" />
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-4">Ready to Start Your Project?</h2>
          <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">Get a free, no-obligation on-site consultation. We&apos;ll discuss your vision, timeline, and budget — then deliver a detailed proposal within 48 hours.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="tel:+12067829345" className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-white text-black font-bold text-lg hover:bg-white/90 transition-colors">
              <Phone size={20} weight="fill" /> (206) 782-9345
            </a>
            <a href="mailto:build@summitbuildersnw.com" className="inline-flex items-center gap-3 px-8 py-4 rounded-full border-2 border-white/30 text-white font-bold text-lg hover:bg-white/10 transition-colors">
              <Envelope size={20} weight="fill" /> Email Us
            </a>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          19. CONTACT + FORM
          ══════════════════════════════════════════════════ */}
      <SectionReveal id="contact" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, ${BG_DARK} 50%, ${BG} 100%)` }} />
        <BlueprintGrid opacity={0.02} />
        <div className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] rounded-full blur-[180px] pointer-events-none" style={{ background: `${AMBER}06` }} />

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <SectionLabel text="Contact Us" />
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6 text-white">Let&apos;s Build Something Great</h2>
              <p className="text-slate-400 leading-relaxed mb-8">Ready to start your project? Contact Summit Builders NW today for a free on-site consultation and detailed estimate.</p>
              <div className="space-y-5">
                {[
                  { icon: MapPin, title: "Office", text: "8901 Roosevelt Way NE, Seattle, WA 98115", href: "https://maps.google.com/?q=8901+Roosevelt+Way+NE+Seattle+WA+98115" },
                  { icon: Phone, title: "Phone", text: "(206) 782-9345", href: "tel:+12067829345" },
                  { icon: Envelope, title: "Email", text: "build@summitbuildersnw.com", href: "mailto:build@summitbuildersnw.com" },
                  { icon: Clock, title: "Hours", text: "Mon-Sat: 7AM-6PM", href: undefined },
                  { icon: ShieldCheck, title: "License", text: "WA #SUMMBW*891QP", href: undefined },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: AMBER_GLOW }}>
                      <item.icon size={20} weight="duotone" style={{ color: AMBER }} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{item.title}</p>
                      {item.href ? (
                        <a href={item.href} target={item.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="text-sm text-slate-400 hover:text-white transition-colors">{item.text}</a>
                      ) : (
                        <p className="text-sm text-slate-400">{item.text}</p>
                      )}
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
                    <input type="text" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 focus:outline-none text-sm" placeholder="Chris" />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1.5">Last Name</label>
                    <input type="text" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 focus:outline-none text-sm" placeholder="Dalton" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">Phone</label>
                  <input type="tel" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 focus:outline-none text-sm" placeholder="(206) 555-1234" />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">Project Type</label>
                  <select className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white focus:outline-none text-sm">
                    <option value="" className="bg-neutral-900">Select a project type</option>
                    {services.map((s) => <option key={s.name} value={s.name.toLowerCase()} className="bg-neutral-900">{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">Project Description</label>
                  <textarea rows={4} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 focus:outline-none text-sm resize-none" placeholder="Tell us about your project — scope, timeline, budget range..." />
                </div>
                <MagneticButton className="w-full py-4 rounded-xl text-base font-semibold text-white flex items-center justify-center gap-2 cursor-pointer" style={{ background: AMBER }}>
                  Send Request <ArrowRight size={18} weight="bold" />
                </MagneticButton>
              </form>
            </GlassCard>
          </div>
        </div>
      </SectionReveal>

      {/* ══════════════════════════════════════════════════
          20. GUARANTEE
          ══════════════════════════════════════════════════ */}
      <SectionReveal className="relative z-10 py-16 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, ${BG_DARK} 100%)` }} />
        <BlueprintGrid opacity={0.015} />
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <ShimmerBorder>
            <div className="p-8 md:p-12">
              <ShieldCheck size={48} weight="fill" style={{ color: AMBER }} className="mx-auto mb-4" />
              <h2 className="text-2xl md:text-4xl font-extrabold text-white mb-4">The Summit Builders Guarantee</h2>
              <p className="text-slate-400 leading-relaxed max-w-2xl mx-auto text-lg mb-4">
                Every project comes with a 5-year workmanship warranty backed by our Washington State contractor bond. On time. On budget. Built to last.
              </p>
              <p className="text-sm font-semibold mb-6" style={{ color: AMBER }}>WA License #SUMMBW*891QP</p>
              <div className="flex flex-wrap justify-center gap-3">
                {["Licensed Contractor", "Free On-Site Estimates", "5-Year Warranty", "Satisfaction Guaranteed", "Bonded & Insured"].map((item) => (
                  <span key={item} className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border" style={{ color: AMBER, borderColor: `${AMBER}33`, background: `${AMBER}0d` }}>
                    <CheckCircle size={16} weight="fill" /> {item}
                  </span>
                ))}
              </div>
            </div>
          </ShimmerBorder>
        </div>
      </SectionReveal>

      {/* ══════════════════════════════════════════════════
          21. FOOTER
          ══════════════════════════════════════════════════ */}
      <footer className="relative z-10 border-t border-white/8 py-10 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #0e1420 100%)` }} />
        <BlueprintGrid opacity={0.015} />
        <div className="mx-auto max-w-6xl px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Hammer size={22} weight="fill" style={{ color: AMBER }} />
                <span className="text-lg font-bold text-white">Summit Builders NW</span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed mb-2">Seattle&apos;s trusted general contractor. 22 years of exceptional craftsmanship in the Pacific Northwest.</p>
              <p className="text-xs text-slate-600">WA License #SUMMBW*891QP</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-3">Quick Links</h4>
              <div className="space-y-2">
                {["Services", "Portfolio", "Process", "About", "Contact"].map((link) => (
                  <a key={link} href={`#${link.toLowerCase()}`} className="block text-sm text-slate-500 hover:text-white transition-colors">{link}</a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-3">Contact</h4>
              <div className="space-y-2 text-sm text-slate-500">
                <p><a href="tel:+12067829345" className="hover:text-white transition-colors">(206) 782-9345</a></p>
                <p><a href="mailto:build@summitbuildersnw.com" className="hover:text-white transition-colors">build@summitbuildersnw.com</a></p>
                <p><a href="https://maps.google.com/?q=8901+Roosevelt+Way+NE+Seattle+WA+98115" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">8901 Roosevelt Way NE, Seattle, WA 98115</a></p>
              </div>
            </div>
          </div>
          <div className="border-t border-white/8 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Hammer size={14} weight="fill" style={{ color: AMBER }} />
              <span>Summit Builders NW &copy; {new Date().getFullYear()}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" /></svg>
              <span className="flex items-center gap-1.5"><svg width="14" height="14" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-sky-500"><path d="M24.3 4.2c-1.5-.4-3.2.1-4.5 1.1-1-.7-2.3-1-3.5-.8-2.4.4-4.2 2.5-4.2 4.9v.6c-3.2.8-6 2.8-7.8 5.6-.3.5-.1 1.1.4 1.4.5.3 1.1.1 1.4-.4 1.5-2.3 3.7-4 6.3-4.7.5-.1 1-.1 1.5 0 .8.2 1.4.8 1.7 1.5.3.8.2 1.6-.2 2.3l-2.8 4.3c-.6.9-.4 2.1.4 2.8l2.5 2.1c.4.3.8.5 1.3.5h5.2c.5 0 1-.2 1.3-.5l1.2-1c.6-.5.8-1.3.6-2l-1-3.2c-.2-.5 0-1.1.4-1.4l3.8-2.5c1.3-.9 2.1-2.3 2.1-3.9V9.6c0-2.5-1.7-4.7-4.1-5.3v-.1z" fill="currentColor"/></svg>Created by <a href="https://bluejayportfolio.com" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "underline" }}>bluejayportfolio.com</a></span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
