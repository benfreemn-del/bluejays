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
  Bug,
  ShieldWarning,
  CaretDown,
  Phone,
  MapPin,
  Clock,
  ArrowRight,
  CheckCircle,
  Quotes,
  X,
  List,
  Leaf,
  CalendarCheck,
  Warning,
  House,
  Users,
  TreeEvergreen,
  Skull,
  Eye,
  FirstAidKit,
  SunHorizon,
  Snowflake,
  Flower,
  ThermometerHot,
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
const BG = "#0f1a0a";
const ORANGE = "#ea580c";
const ORANGE_LIGHT = "#fb923c";
const ORANGE_GLOW = "rgba(234, 88, 12, 0.15)";
const GREEN_DARK = "#166534";
const GREEN_GLOW = "rgba(22, 101, 52, 0.1)";

/* ───────────────────────── FLOATING PARTICLES ───────────────────────── */
function FloatingParticles() {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 8,
    duration: 6 + Math.random() * 6,
    size: 2 + Math.random() * 3,
    opacity: 0.1 + Math.random() * 0.25,
  }));
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden hidden md:block">
      {particles.map((p) => (
        <motion.div key={p.id} className="absolute rounded-full" style={{ left: `${p.x}%`, width: p.size, height: p.size, background: ORANGE_LIGHT, willChange: "transform, opacity" }}
          animate={{ y: ["-10vh", "110vh"], opacity: [0, p.opacity, p.opacity, 0] }}
          transition={{ y: { duration: p.duration, repeat: Infinity, delay: p.delay, ease: "linear" }, opacity: { duration: p.duration, repeat: Infinity, delay: p.delay, times: [0, 0.1, 0.9, 1] } }}
        />
      ))}
    </div>
  );
}

/* ───────────────────────── UTILITY COMPONENTS ───────────────────────── */
function SectionReveal({ children, className = "", id }: { children: React.ReactNode; className?: string; id?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return <motion.section ref={ref} id={id} className={className} initial={{ opacity: 0, y: 50 }} animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }} transition={spring}>{children}</motion.section>;
}

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] ${className}`}>{children}</div>;
}

function MagneticButton({ children, className = "", onClick, style }: { children: React.ReactNode; className?: string; onClick?: () => void; style?: React.CSSProperties }) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, springFast);
  const springY = useSpring(y, springFast);
  const isTouchDevice = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
  const handleMouseMove = useCallback((e: React.MouseEvent) => { if (!ref.current || isTouchDevice) return; const rect = ref.current.getBoundingClientRect(); x.set((e.clientX - (rect.left + rect.width / 2)) * 0.25); y.set((e.clientY - (rect.top + rect.height / 2)) * 0.25); }, [x, y, isTouchDevice]);
  const handleMouseLeave = useCallback(() => { x.set(0); y.set(0); }, [x, y]);
  return <motion.button ref={ref} style={{ x: springX, y: springY, willChange: "transform", ...style }} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} onClick={onClick} className={className} whileTap={{ scale: 0.97 }}>{children}</motion.button>;
}

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

function ShimmerBorder({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative rounded-2xl p-[1px] overflow-hidden ${className}`}>
      <motion.div className="absolute inset-0 rounded-2xl" style={{ background: `conic-gradient(from 0deg, transparent, ${ORANGE}, transparent, ${ORANGE_LIGHT}, transparent)`, willChange: "transform" }} animate={{ rotate: [0, 360] }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} />
      <div className="relative rounded-2xl z-10" style={{ background: BG }}>{children}</div>
    </div>
  );
}

/* ───────────────────────── HERO SHIELD SVG ───────────────────────── */
function ShieldHeroIcon() {
  return (
    <div className="relative flex items-center justify-center">
      {/* Pulsing glow behind */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{ background: `radial-gradient(circle, ${ORANGE_GLOW} 0%, transparent 70%)`, filter: "blur(40px)" }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      <svg viewBox="0 0 180 210" className="relative z-10 w-52 h-60 md:w-60 md:h-72" fill="none">
        {/* Outer glow rings */}
        <motion.circle cx="90" cy="100" r="88" stroke={ORANGE} strokeWidth="0.5" opacity={0.12}
          animate={{ r: [86, 90, 86] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} />
        <motion.circle cx="90" cy="100" r="78" stroke={ORANGE} strokeWidth="0.3" opacity={0.08}
          animate={{ r: [76, 80, 76] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }} />

        {/* Main shield — filled */}
        <motion.path
          d="M90 12 L155 42 C155 42 160 105 140 148 C125 178 90 195 90 195 C90 195 55 178 40 148 C20 105 25 42 25 42 Z"
          fill={`${ORANGE}18`} stroke={ORANGE} strokeWidth="2.5"
          initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />
        {/* Shield inner highlight */}
        <path
          d="M90 30 L140 52 C140 52 144 100 128 135 C118 158 90 172 90 172 C90 172 62 158 52 135 C36 100 40 52 40 52 Z"
          fill={`${ORANGE}0d`}
        />

        {/* Bug silhouette inside shield */}
        {/* Bug body */}
        <motion.ellipse cx="90" cy="95" rx="14" ry="20" fill={`${ORANGE}20`} stroke={ORANGE_LIGHT} strokeWidth="1.5"
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ duration: 0.8, delay: 1.2, ease: "backOut" }} />
        {/* Bug head */}
        <motion.circle cx="90" cy="72" r="8" fill={`${ORANGE}18`} stroke={ORANGE_LIGHT} strokeWidth="1.2"
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ duration: 0.6, delay: 1.4, ease: "backOut" }} />
        {/* Bug antennae */}
        <motion.path d="M85 65 C80 55, 72 50, 68 48" stroke={ORANGE_LIGHT} strokeWidth="1" strokeLinecap="round" fill="none" opacity={0.5}
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1.6, duration: 0.8 }} />
        <motion.path d="M95 65 C100 55, 108 50, 112 48" stroke={ORANGE_LIGHT} strokeWidth="1" strokeLinecap="round" fill="none" opacity={0.5}
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1.7, duration: 0.8 }} />
        {/* Bug legs */}
        <motion.path d="M78 85 L65 78 M78 95 L62 95 M78 105 L65 112" stroke={ORANGE_LIGHT} strokeWidth="1" strokeLinecap="round" opacity={0.4}
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1.8, duration: 0.8 }} />
        <motion.path d="M102 85 L115 78 M102 95 L118 95 M102 105 L115 112" stroke={ORANGE_LIGHT} strokeWidth="1" strokeLinecap="round" opacity={0.4}
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1.9, duration: 0.8 }} />

        {/* X mark over bug */}
        <motion.line x1="70" y1="70" x2="110" y2="115" stroke={ORANGE} strokeWidth="3" strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 0.8 }}
          transition={{ duration: 0.8, delay: 2.2, ease: "easeOut" }} />
        <motion.line x1="110" y1="70" x2="70" y2="115" stroke={ORANGE} strokeWidth="3" strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 0.8 }}
          transition={{ duration: 0.8, delay: 2.4, ease: "easeOut" }} />

        {/* Warning glow pulse */}
        <motion.circle cx="90" cy="92" r="28" fill={`${ORANGE}08`}
          animate={{ r: [26, 34, 26], opacity: [0.1, 0.25, 0.1] }}
          transition={{ duration: 2.5, repeat: Infinity }} />

        {/* Shield gradient band at bottom */}
        <motion.path d="M55 148 C70 165, 110 165, 125 148" stroke={ORANGE_LIGHT} strokeWidth="1" fill="none" opacity={0.25}
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 2.8 }} />

        {/* Sparkle accents */}
        <motion.circle cx="160" cy="25" r="3" fill={ORANGE_LIGHT}
          animate={{ opacity: [0.2, 1, 0.2], scale: [0.7, 1.3, 0.7] }}
          transition={{ duration: 2.5, repeat: Infinity }} />
        <motion.circle cx="18" cy="45" r="2" fill={ORANGE_LIGHT}
          animate={{ opacity: [0.1, 0.8, 0.1], scale: [0.5, 1.2, 0.5] }}
          transition={{ duration: 3, repeat: Infinity, delay: 0.8 }} />
        <motion.circle cx="165" cy="150" r="2.5" fill={ORANGE_LIGHT}
          animate={{ opacity: [0.15, 0.7, 0.15] }}
          transition={{ duration: 2, repeat: Infinity, delay: 1.2 }} />
        <motion.circle cx="15" cy="165" r="2" fill={ORANGE_LIGHT}
          animate={{ opacity: [0.1, 0.6, 0.1] }}
          transition={{ duration: 2.5, repeat: Infinity, delay: 0.4 }} />
      </svg>
    </div>
  );
}

/* ───────────────────────── DATA ───────────────────────── */
const services = [
  { title: "Termite Control", description: "Comprehensive termite inspection, treatment, and prevention using liquid barriers, bait stations, and fumigation. Protect your property from costly structural damage.", icon: Bug },
  { title: "Ant Elimination", description: "Targeted treatments for fire ants, carpenter ants, and household ant colonies. We locate the source and eliminate the entire colony, not just the scouts.", icon: Bug },
  { title: "Rodent Removal", description: "Humane and effective mouse and rat control including sealing entry points, trapping, and exclusion services. We prevent re-entry with structural modifications.", icon: Skull },
  { title: "Bed Bug Treatment", description: "Heat treatment and chemical solutions to completely eliminate bed bugs at every life stage. Includes follow-up inspection to ensure 100% eradication.", icon: Warning },
  { title: "Mosquito Control", description: "Yard treatments, misting systems, and larvicide applications to dramatically reduce mosquito populations. Enjoy your outdoor spaces again.", icon: Bug },
  { title: "Wildlife Management", description: "Safe removal of raccoons, squirrels, bats, and other wildlife from your property. Includes exclusion work and damage repair to prevent re-entry.", icon: TreeEvergreen },
];

const stats = [
  { value: "15,000+", label: "Homes Protected" },
  { value: "4.9", label: "Star Rating" },
  { value: "100%", label: "Pest-Free Guarantee" },
  { value: "25+", label: "Years Experience" },
];

const testimonials = [
  { name: "Robert H.", text: "We had a terrible termite problem and they handled it quickly and professionally. Two years later, still pest-free. Their guarantee is the real deal.", rating: 5 },
  { name: "Angela S.", text: "The mosquito treatment transformed our backyard. We can actually have dinner outside now without being eaten alive. Monthly service is worth every penny.", rating: 5 },
  { name: "James D.", text: "After two other companies failed to solve our rodent problem, these guys sealed every entry point and we have not seen a mouse since. Incredibly thorough.", rating: 5 },
];

const processSteps = [
  { step: "01", title: "Free Inspection", description: "Our licensed technician performs a thorough inspection of your property to identify pests, entry points, and conditions." },
  { step: "02", title: "Custom Plan", description: "We develop a targeted treatment plan based on the specific pests, severity, and your property's unique characteristics." },
  { step: "03", title: "Treatment", description: "Our trained team executes the treatment using EPA-approved products that are effective yet safe for your family and pets." },
  { step: "04", title: "Prevention", description: "We seal entry points, set up monitoring stations, and schedule follow-ups to ensure pests never return." },
];

const pestGuide = [
  { pest: "Termites", signs: "Mud tubes, hollow wood, discarded wings, frass piles", danger: "High", icon: Bug },
  { pest: "Bed Bugs", signs: "Bite marks, blood spots on sheets, musty odor", danger: "Medium", icon: Warning },
  { pest: "Rodents", signs: "Droppings, gnaw marks, scratching noises, grease trails", danger: "High", icon: Skull },
  { pest: "Cockroaches", signs: "Droppings, egg cases, musty smell, nighttime activity", danger: "Medium", icon: Bug },
  { pest: "Ants", signs: "Trails, small dirt mounds, wood shavings (carpenter ants)", danger: "Low-High", icon: Bug },
  { pest: "Mosquitoes", signs: "Standing water, buzzing, bite welts, dusk activity", danger: "Medium", icon: Bug },
];

const seasonalPlans = [
  { season: "Spring", icon: Flower, pests: "Ants, termites, wasps", description: "Colony prevention treatments as pests become active after winter dormancy." },
  { season: "Summer", icon: ThermometerHot, pests: "Mosquitoes, fleas, ticks", description: "Peak season protection with yard treatments and barrier applications." },
  { season: "Fall", icon: SunHorizon, pests: "Rodents, spiders, stink bugs", description: "Exclusion work to prevent pests from seeking shelter in your home." },
  { season: "Winter", icon: Snowflake, pests: "Mice, rats, cockroaches", description: "Interior monitoring and treatment for overwintering pests." },
];

const faqItems = [
  { q: "Are your treatments safe for children and pets?", a: "Yes. We use EPA-approved products and apply them in targeted areas. We provide specific re-entry guidelines for each treatment, typically 2-4 hours." },
  { q: "Do you offer a pest-free guarantee?", a: "Absolutely. If pests return between scheduled treatments, we come back at no additional charge. Our guarantee is backed by over 25 years of results." },
  { q: "How often should I have my home treated?", a: "We recommend quarterly treatments for general pest prevention. Some situations like termite monitoring require annual inspections, while mosquito control is monthly during warm months." },
  { q: "What should I do to prepare for a treatment?", a: "We provide a detailed prep checklist before each visit. Generally, we ask that food be stored, pets be relocated temporarily, and heavy furniture be accessible." },
  { q: "Do you handle commercial properties?", a: "Yes. We service restaurants, offices, warehouses, and multi-unit housing with customized IPM (Integrated Pest Management) programs that meet health code requirements." },
];

/* ═══════════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════════ */
export default function V2PestControlPage() {
  const [openService, setOpenService] = useState<number | null>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden" style={{ background: BG, color: "#f1f5f9" }}>
      <FloatingParticles />

      {/* ─── NAV ─── */}
      <motion.nav initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-4">
          <GlassCard className="flex items-center justify-between px-4 md:px-6 py-3">
            <div className="flex items-center gap-2">
              <ShieldWarning size={24} weight="duotone" style={{ color: ORANGE }} />
              <span className="text-lg font-bold tracking-tight text-white">Guardian Pest Defense</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
              <a href="#services" className="hover:text-white transition-colors">Services</a>
              <a href="#process" className="hover:text-white transition-colors">Process</a>
              <a href="#pest-guide" className="hover:text-white transition-colors">Pest Guide</a>
              <a href="#testimonials" className="hover:text-white transition-colors">Reviews</a>
              <a href="#contact" className="hover:text-white transition-colors">Contact</a>
            </div>
            <div className="flex items-center gap-3">
              <MagneticButton className="px-4 md:px-5 py-2 rounded-full text-sm font-semibold text-white" style={{ background: ORANGE }}>Free Inspection</MagneticButton>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors">{mobileMenuOpen ? <X size={24} /> : <List size={24} />}</button>
            </div>
          </GlassCard>
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3, ease: "easeInOut" }} className="md:hidden mt-2 overflow-hidden">
                <GlassCard className="flex flex-col gap-1 px-4 py-4">
                  {[{ label: "Services", href: "#services" }, { label: "Process", href: "#process" }, { label: "Pest Guide", href: "#pest-guide" }, { label: "Reviews", href: "#testimonials" }, { label: "Contact", href: "#contact" }].map((link) => (
                    <a key={link.label} href={link.href} onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors">{link.label}</a>
                  ))}
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.nav>

      {/* ─── HERO ─── */}
      <section className="relative min-h-[100dvh] flex items-center pt-24 z-10">
        <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 60% 40% at 50% 30%, ${ORANGE_GLOW} 0%, transparent 70%)` }} />
        <div className="mx-auto max-w-7xl px-4 md:px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-4 items-center">
          <div className="space-y-8">
            <div>
              <motion.p initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ ...spring, delay: 0.1 }} className="text-sm uppercase tracking-widest mb-4" style={{ color: ORANGE }}>Certified Pest Elimination</motion.p>
              <h1 className="text-3xl md:text-6xl tracking-tighter leading-none font-bold text-white" style={{ textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>
                <WordReveal text="Your Home, Pest-Free Guaranteed" />
              </h1>
            </div>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.6 }} className="text-lg text-slate-400 max-w-md leading-relaxed">
              From termites to wildlife, we eliminate pests at the source with EPA-approved treatments that are safe for your family and pets. 25+ years of protection.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.8 }} className="flex flex-wrap gap-4">
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white flex items-center gap-2 cursor-pointer" style={{ background: ORANGE }}>
                Get Free Inspection <ArrowRight size={18} weight="bold" />
              </MagneticButton>
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/10 flex items-center gap-2 cursor-pointer">
                <Phone size={18} weight="duotone" /> (555) 456-7890
              </MagneticButton>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ ...spring, delay: 1 }} className="flex flex-wrap gap-6 text-sm text-slate-400">
              <span className="flex items-center gap-2"><ShieldCheck size={16} weight="duotone" style={{ color: ORANGE }} />Licensed & Insured</span>
              <span className="flex items-center gap-2"><Leaf size={16} weight="duotone" style={{ color: ORANGE }} />EPA-Approved Products</span>
            </motion.div>
          </div>
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ ...spring, delay: 0.3 }} className="hidden md:flex items-center justify-center lg:justify-end">
            <ShieldHeroIcon />
          </motion.div>
        </div>
      </section>

      {/* ─── STATS ─── */}
      <SectionReveal className="relative z-10 pb-8">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <GlassCard className="p-6 md:p-8">
            <motion.div className="grid grid-cols-2 sm:grid-cols-4 gap-6 md:gap-8" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
              {stats.map((s, i) => (
                <motion.div key={i} variants={fadeUp} className="text-center">
                  <p className="text-3xl md:text-4xl font-bold tracking-tight" style={{ color: ORANGE }}>{s.value}</p>
                  <p className="text-sm text-slate-400 mt-1">{s.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </GlassCard>
        </div>
      </SectionReveal>

      {/* ─── SERVICES ─── */}
      <SectionReveal id="services" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            <div className="lg:sticky lg:top-32">
              <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ORANGE }}>Our Services</p>
              <h2 className="text-3xl md:text-6xl tracking-tighter leading-none font-bold text-white mb-6"><WordReveal text="Complete Pest Elimination" /></h2>
              <p className="text-slate-400 leading-relaxed max-w-md">We handle every type of pest with targeted, proven methods. Our IPM approach means fewer chemicals and better long-term results.</p>
            </div>
            <motion.div className="space-y-3" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
              {services.map((svc, i) => (
                <motion.div key={i} variants={fadeUp}>
                  <GlassCard className="overflow-hidden">
                    <button onClick={() => setOpenService(openService === i ? null : i)} className="w-full flex items-center justify-between p-5 md:p-6 text-left cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: ORANGE_GLOW }}><svc.icon size={20} weight="duotone" style={{ color: ORANGE }} /></div>
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

      {/* ─── ABOUT ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 50% 50% at 20% 50%, ${GREEN_GLOW} 0%, transparent 70%)` }} />
        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ORANGE }}>About Us</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white mb-6"><WordReveal text="25 Years Defending Homes" /></h2>
            <p className="text-slate-400 leading-relaxed mb-4">Guardian Pest Defense was built on a promise: your home should be a sanctuary, not a habitat for pests. For over two decades, we have protected thousands of families with science-based pest management.</p>
            <p className="text-slate-400 leading-relaxed mb-6">Every technician is state-licensed, background-checked, and continuously trained on the latest IPM (Integrated Pest Management) techniques. We combine preventive strategies with targeted treatments for lasting results.</p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-sm"><Eye size={18} weight="duotone" style={{ color: ORANGE }} /><span className="text-slate-300">Free Inspections</span></div>
              <div className="flex items-center gap-2 text-sm"><Users size={18} weight="duotone" style={{ color: ORANGE }} /><span className="text-slate-300">35+ Technicians</span></div>
              <div className="flex items-center gap-2 text-sm"><FirstAidKit size={18} weight="duotone" style={{ color: ORANGE }} /><span className="text-slate-300">Pet-Safe Methods</span></div>
            </div>
          </div>
          <div className="relative rounded-2xl overflow-hidden aspect-[4/3]">
            <img src="https://images.unsplash.com/photo-1563089145-599997674d42?w=800&q=80" alt="Pest control technician inspecting a home" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          </div>
        </div>
      </SectionReveal>

      {/* ─── PROCESS ─── */}
      <SectionReveal id="process" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ORANGE }}>How It Works</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white"><WordReveal text="Our 4-Step Defense Plan" /></h2>
          </div>
          <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {processSteps.map((step, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="p-6 h-full relative overflow-hidden">
                  <div className="absolute top-4 right-4 text-5xl font-black opacity-5 text-white">{step.step}</div>
                  <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: ORANGE }}>Step {step.step}</p>
                  <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{step.description}</p>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── TESTIMONIALS ─── */}
      <SectionReveal id="testimonials" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ORANGE }}>Client Stories</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white"><WordReveal text="Trusted by Homeowners" /></h2>
          </div>
          <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {testimonials.map((t, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="p-6 h-full flex flex-col">
                  <Quotes size={28} weight="fill" style={{ color: ORANGE }} className="mb-3 opacity-50" />
                  <p className="text-slate-300 leading-relaxed flex-1 text-sm">{t.text}</p>
                  <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                    <span className="text-sm font-semibold text-white">{t.name}</span>
                    <div className="flex gap-0.5">{Array.from({ length: t.rating }).map((_, j) => (<Star key={j} size={12} weight="fill" style={{ color: ORANGE }} />))}</div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── PEST IDENTIFICATION GUIDE ─── */}
      <SectionReveal id="pest-guide" className="relative z-10 py-16 md:py-24">
        <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 60% 40% at 50% 50%, ${GREEN_GLOW} 0%, transparent 70%)` }} />
        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ORANGE }}>Know Your Enemy</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white"><WordReveal text="Pest Identification Guide" /></h2>
          </div>
          <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {pestGuide.map((p, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="p-6 h-full">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: ORANGE_GLOW }}><p.icon size={20} weight="duotone" style={{ color: ORANGE }} /></div>
                      <h3 className="text-lg font-semibold text-white">{p.pest}</h3>
                    </div>
                    <span className={`text-xs font-bold uppercase px-2 py-1 rounded-full ${p.danger === "High" ? "bg-red-500/20 text-red-400" : p.danger === "Medium" ? "bg-yellow-500/20 text-yellow-400" : "bg-green-500/20 text-green-400"}`}>{p.danger} Risk</span>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed"><span className="text-slate-300 font-medium">Signs: </span>{p.signs}</p>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── FAQ ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ORANGE }}>Common Questions</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white"><WordReveal text="Frequently Asked Questions" /></h2>
          </div>
          <motion.div className="space-y-3" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
            {faqItems.map((faq, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="overflow-hidden">
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-5 text-left cursor-pointer">
                    <span className="text-base font-semibold text-white pr-4">{faq.q}</span>
                    <motion.div animate={{ rotate: openFaq === i ? 180 : 0 }} transition={spring}><CaretDown size={20} className="text-slate-400" /></motion.div>
                  </button>
                  <AnimatePresence initial={false}>
                    {openFaq === i && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={spring} className="overflow-hidden">
                        <p className="px-5 pb-5 text-slate-400 leading-relaxed">{faq.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── SEASONAL PROTECTION PLANS ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ORANGE }}>Year-Round Defense</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white"><WordReveal text="Seasonal Protection Plans" /></h2>
          </div>
          <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {seasonalPlans.map((plan, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="p-6 h-full text-center">
                  <plan.icon size={32} weight="duotone" style={{ color: ORANGE }} className="mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-1">{plan.season}</h3>
                  <p className="text-xs uppercase tracking-widest mb-3" style={{ color: ORANGE }}>{plan.pests}</p>
                  <p className="text-sm text-slate-400 leading-relaxed">{plan.description}</p>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
          <div className="text-center mt-10">
            <ShimmerBorder className="inline-block">
              <div className="px-8 py-4">
                <p className="text-sm text-slate-300">Annual protection plans start at <span className="text-2xl font-bold" style={{ color: ORANGE }}>$39</span><span className="text-slate-400">/month</span></p>
              </div>
            </ShimmerBorder>
          </div>
        </div>
      </SectionReveal>

      {/* ─── CONTACT ─── */}
      <SectionReveal id="contact" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white mb-6"><WordReveal text="Take Back Your Home" /></h2>
              <p className="text-slate-400 leading-relaxed max-w-md mb-8">Schedule your free inspection today. We will identify the problem, provide a transparent quote, and start protecting your home within 48 hours.</p>
              <div className="flex flex-wrap gap-4">
                <MagneticButton className="px-10 py-4 rounded-full text-base font-semibold text-white inline-flex items-center gap-2 cursor-pointer" style={{ background: ORANGE }}>
                  <CalendarCheck size={20} weight="duotone" /> Schedule Inspection
                </MagneticButton>
                <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/10 flex items-center gap-2 cursor-pointer">
                  <Phone size={18} weight="duotone" /> Call Us
                </MagneticButton>
              </div>
            </div>
            <GlassCard className="p-8">
              <h3 className="text-xl font-semibold text-white mb-6">Contact Info</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4"><MapPin size={20} weight="duotone" style={{ color: ORANGE }} className="mt-0.5 shrink-0" /><div><p className="text-sm font-semibold text-white">Location</p><p className="text-sm text-slate-400">789 Shield Drive<br />Dallas, TX 75201</p></div></div>
                <div className="flex items-start gap-4"><Phone size={20} weight="duotone" style={{ color: ORANGE }} className="mt-0.5 shrink-0" /><div><p className="text-sm font-semibold text-white">Phone</p><p className="text-sm text-slate-400">(555) 456-7890</p></div></div>
                <div className="flex items-start gap-4"><Clock size={20} weight="duotone" style={{ color: ORANGE }} className="mt-0.5 shrink-0" /><div><p className="text-sm font-semibold text-white">Hours</p><p className="text-sm text-slate-400">Monday - Friday: 7:00 AM - 6:00 PM<br />Saturday: 8:00 AM - 2:00 PM<br />Emergency: 24/7 Available</p></div></div>
                <div className="flex items-start gap-4"><House size={20} weight="duotone" style={{ color: ORANGE }} className="mt-0.5 shrink-0" /><div><p className="text-sm font-semibold text-white">Service Area</p><p className="text-sm text-slate-400">Dallas-Fort Worth Metroplex<br />Residential & Commercial</p></div></div>
              </div>
            </GlassCard>
          </div>
        </div>
      </SectionReveal>

      {/* ─── FOOTER ─── */}
      <footer className="relative z-10 border-t border-white/5 py-8">
        <div className="mx-auto max-w-7xl px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <ShieldWarning size={16} weight="duotone" style={{ color: ORANGE }} />
            <span>Guardian Pest Defense &copy; {new Date().getFullYear()}</span>
          </div>
          <p className="text-xs text-slate-600">Created by <a href="https://bluejayportfolio.com" target="_blank" rel="noopener noreferrer" style={{textDecoration:"underline"}}>bluejayportfolio.com</a></p>
        </div>
      </footer>
    </main>
  );
}
