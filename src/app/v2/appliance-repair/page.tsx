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
  Wrench,
  Gear,
  Thermometer,
  Drop,
  Fire,
  Snowflake,
  Lightning,
  CheckCircle,
  Certificate,
  Medal,
  Timer,
  Users,
  CalendarCheck,
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
const BG = "#0f1720";
const ACCENT = "#3b82f6";
const ACCENT_LIGHT = "#93c5fd";
const ACCENT_GLOW = "rgba(59, 130, 246, 0.15)";

/* ───────────────────────── WRENCH/GEAR NAV ICON ───────────────────────── */
function WrenchIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path d="M22 10C22 12.2091 20.2091 14 18 14C15.7909 14 14 12.2091 14 10C14 7.79086 15.7909 6 18 6C20.2091 6 22 7.79086 22 10Z" stroke={ACCENT} strokeWidth="2" />
      <path d="M15.5 12.5L6 22C5.44772 22.5523 5.44772 23.4477 6 24V26H8C8.55228 26 9.44772 26.5523 10 26L19.5 16.5" stroke={ACCENT_LIGHT} strokeWidth="2" strokeLinecap="round" />
      <path d="M24 8L26 6" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" />
      <path d="M20 4L22 2" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" />
      <circle cx="18" cy="10" r="1.5" fill={ACCENT} />
    </svg>
  );
}

/* ───────────────────────── CIRCUIT BOARD PATTERN ───────────────────────── */
function CircuitPattern() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden hidden md:block opacity-[0.04]">
      <svg width="100%" height="100%">
        <defs>
          <pattern id="circuit-grid" width="100" height="100" patternUnits="userSpaceOnUse">
            <path d="M 0 50 L 30 50 L 40 40 L 60 40 L 70 50 L 100 50" fill="none" stroke={ACCENT_LIGHT} strokeWidth="0.5" />
            <path d="M 50 0 L 50 30 L 40 40" fill="none" stroke={ACCENT_LIGHT} strokeWidth="0.5" />
            <path d="M 50 100 L 50 70 L 60 60 L 80 60" fill="none" stroke={ACCENT_LIGHT} strokeWidth="0.5" />
            <circle cx="30" cy="50" r="2" fill={ACCENT} />
            <circle cx="70" cy="50" r="2" fill={ACCENT} />
            <circle cx="50" cy="30" r="2" fill={ACCENT} />
            <circle cx="50" cy="70" r="2" fill={ACCENT} />
            <circle cx="80" cy="60" r="2" fill={ACCENT} />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#circuit-grid)" />
      </svg>
    </div>
  );
}

/* ───────────────────────── FLOATING PARTICLES ───────────────────────── */
function TechParticles() {
  const particles = Array.from({ length: 25 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 10,
    duration: 10 + Math.random() * 10,
    size: 1 + Math.random() * 3,
    opacity: 0.1 + Math.random() * 0.2,
  }));

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden hidden md:block">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-sm"
          style={{ left: `${p.x}%`, width: p.size, height: p.size, background: ACCENT_LIGHT, willChange: "transform, opacity" }}
          animate={{ y: ["110vh", "-10vh"], opacity: [0, p.opacity, p.opacity, 0], rotate: [0, 180, 360] }}
          transition={{
            y: { duration: p.duration, repeat: Infinity, delay: p.delay, ease: "linear" },
            opacity: { duration: p.duration, repeat: Infinity, delay: p.delay, times: [0, 0.1, 0.9, 1] },
            rotate: { duration: p.duration * 1.5, repeat: Infinity, ease: "linear" }
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

function GlassCard({ children, className = "", style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (<div className={`rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] ${className}`} style={style}>{children}</div>);
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
  { title: "Refrigerator Repair", description: "Expert diagnostics and repair for all major refrigerator brands. We fix cooling issues, ice makers, leaks, and strange noises quickly to save your food.", icon: Snowflake },
  { title: "Washer & Dryer", description: "Fast solutions for washing machines that won't drain or spin, and dryers that aren't heating. We service both front-load and top-load models.", icon: Drop },
  { title: "Dishwasher Repair", description: "Stop hand-washing your dishes. We repair dishwashers that won't start, aren't cleaning properly, or are leaking water onto your floor.", icon: Lightning },
  { title: "Oven & Range", description: "Whether it's gas or electric, we fix ovens that won't heat, burners that won't ignite, and erratic temperature controls so you can get back to cooking.", icon: Fire },
  { title: "Microwave Repair", description: "Professional repair for built-in and over-the-range microwaves. We handle issues with heating, turntables, and control panels safely.", icon: Thermometer },
  { title: "Ice Maker Repair", description: "Don't settle for warm drinks. We repair built-in and freestanding ice makers, fixing water line issues, freezing problems, and mechanical failures.", icon: Gear },
];

const testimonials = [
  { name: "Sarah Jenkins", text: "Our refrigerator stopped cooling right after a huge grocery trip. ProFix sent someone out within hours. The technician was polite, diagnosed the bad compressor quickly, and had it running the same day.", rating: 5 },
  { name: "Mark T.", text: "I thought I needed a new washing machine, but the tech from ProFix found a simple clogged pump. Saved me hundreds of dollars. Honest, reliable, and very professional service.", rating: 5 },
  { name: "The Miller Family", text: "We've used ProFix for our oven and our dishwasher over the past two years. They are always on time, explain the costs upfront, and leave the work area spotless. Highly recommend!", rating: 5 },
];

const certifications = [
  "EPA Certified Technicians", "Factory Authorized Service", "Licensed & Insured", "Background Checked Techs", "Same-Day Service Available", "90-Day Parts Warranty", "Upfront Flat-Rate Pricing", "Local Family Owned",
];

const faqData = [
  { q: "Do you offer same-day appliance repair?", a: "Yes, we offer same-day service for most calls received before 12:00 PM. We prioritize emergency repairs like refrigerators that have stopped cooling." },
  { q: "What brands of appliances do you service?", a: "We service all major brands including Whirlpool, GE, Samsung, LG, Maytag, KitchenAid, Bosch, Frigidaire, Sub-Zero, and many more." },
  { q: "How much does a service call cost?", a: "Our diagnostic fee is $89, which covers the technician's trip to your home and a complete diagnosis of the problem. If you choose to proceed with the repair, this fee is waived." },
  { q: "Do you provide a warranty on your repairs?", a: "Absolutely. We provide a 90-day warranty on all parts we install and a 30-day warranty on our labor. If the same part fails within that time, we'll replace it for free." },
  { q: "Should I repair or replace my appliance?", a: "Our technicians will give you an honest assessment. As a general rule, if the repair costs more than 50% of the price of a new appliance, or if the unit is nearing the end of its expected lifespan, replacement might be the better option." },
  { q: "Are your technicians licensed and insured?", a: "Yes, all our technicians are fully licensed, insured, and background-checked. They also undergo continuous training to stay updated on the latest appliance technologies." },
];

const portfolioImages = [
  "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=600&q=80",
  "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=600&q=80",
  "https://images.unsplash.com/photo-1581092335397-9583eb92d232?w=600&q=80",
  "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=600&q=80",
  "https://images.unsplash.com/photo-1581092162384-8987c1d64718?w=600&q=80",
  "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=600&q=80",
];

/* ───────────────────────── MAIN COMPONENT ───────────────────────── */
export default function V2ApplianceRepairPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [expandedService, setExpandedService] = useState<number | null>(null);

  return (
    <main className="min-h-screen selection:bg-blue-500/30 selection:text-blue-200" style={{ backgroundColor: BG, color: "#f8fafc" }}>
      <CircuitPattern />
      <TechParticles />

      {/* ─── 1. STICKY NAVIGATION ─── */}
      <motion.nav initial={{ y: -100 }} animate={{ y: 0 }} transition={spring} className="fixed top-0 left-0 right-0 z-50 px-4 py-4 md:px-6 md:py-6 pointer-events-none">
        <div className="mx-auto max-w-7xl">
          <GlassCard className="pointer-events-auto flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <WrenchIcon size={28} />
              <span className="text-xl font-bold tracking-tight text-white">ProFix</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              {["Services", "Process", "Testimonials", "FAQ"].map((item) => (
                <a key={item} href={`#${item.toLowerCase()}`} className="text-sm font-medium text-slate-300 hover:text-white transition-colors">{item}</a>
              ))}
            </div>
            <div className="hidden md:flex items-center gap-4">
              <a href="tel:555-123-4567" className="text-sm font-semibold flex items-center gap-2" style={{ color: ACCENT_LIGHT }}>
                <Phone size={16} weight="duotone" /> (555) 123-4567
              </a>
              <MagneticButton className="px-5 py-2.5 rounded-full text-sm font-semibold text-white cursor-pointer" style={{ background: ACCENT } as React.CSSProperties}>
                Book Repair
              </MagneticButton>
            </div>
            <button className="md:hidden text-white p-2" onClick={() => setIsMenuOpen(true)}>
              <List size={24} />
            </button>
          </GlassCard>
        </div>
      </motion.nav>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] bg-slate-900/95 backdrop-blur-xl flex flex-col p-6">
            <div className="flex justify-end">
              <button onClick={() => setIsMenuOpen(false)} className="p-2 text-white"><X size={32} /></button>
            </div>
            <div className="flex flex-col items-center justify-center flex-1 gap-8">
              {["Services", "Process", "Testimonials", "FAQ"].map((item) => (
                <a key={item} href={`#${item.toLowerCase()}`} onClick={() => setIsMenuOpen(false)} className="text-3xl font-bold text-white">{item}</a>
              ))}
              <div className="mt-8 flex flex-col items-center gap-4">
                <a href="tel:555-123-4567" className="text-xl font-semibold flex items-center gap-2" style={{ color: ACCENT_LIGHT }}>
                  <Phone size={24} weight="duotone" /> (555) 123-4567
                </a>
                <button className="px-8 py-4 rounded-full text-lg font-semibold text-white w-full max-w-xs" style={{ background: ACCENT }}>
                  Book Repair Now
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── 2. HERO SECTION ─── */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/60 to-slate-900/90 z-10" />
          <motion.img initial={{ scale: 1.1 }} animate={{ scale: 1 }} transition={{ duration: 20, ease: "linear", repeat: Infinity, repeatType: "reverse" }} src="https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=1600&q=80" alt="Appliance Repair Professional" className="w-full h-full object-cover" />
        </div>
        <div className="relative z-10 mx-auto max-w-5xl px-4 md:px-6 text-center mt-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8">
            <span className="flex h-2 w-2 rounded-full" style={{ background: ACCENT_LIGHT, boxShadow: `0 0 10px ${ACCENT_LIGHT}` }} />
            <span className="text-xs font-medium tracking-wide text-white uppercase">Fast, Reliable Appliance Repair</span>
          </motion.div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl tracking-tighter leading-[1.1] font-bold text-white mb-6">
            <WordReveal text="Don't Let a Broken Appliance Ruin Your Day." />
          </h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            Expert diagnostics and repair for all major brands. Same-day service available to get your household running smoothly again.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <MagneticButton className="w-full sm:w-auto px-8 py-4 rounded-full text-base font-semibold text-white flex items-center justify-center gap-2 cursor-pointer" style={{ background: ACCENT } as React.CSSProperties}>
              Schedule Service <ArrowRight size={18} weight="bold" />
            </MagneticButton>
            <MagneticButton className="w-full sm:w-auto px-8 py-4 rounded-full text-base font-semibold text-white border border-white/20 bg-white/5 backdrop-blur-md flex items-center justify-center gap-2 cursor-pointer hover:bg-white/10 transition-colors">
              <Phone size={18} weight="duotone" /> Call (555) 123-4567
            </MagneticButton>
          </motion.div>
        </div>
      </section>

      {/* ─── 3. STATS / TRUST BAR ─── */}
      <div className="relative z-20 -mt-12 mx-auto max-w-6xl px-4 md:px-6">
        <GlassCard className="p-6 md:p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 divide-x divide-white/10">
            {[
              { label: "Years Experience", value: "15+", icon: Timer },
              { label: "Repairs Completed", value: "10k+", icon: Wrench },
              { label: "Happy Customers", value: "99%", icon: Users },
              { label: "Satisfaction Guarantee", value: "100%", icon: ShieldCheck },
            ].map((stat, i) => (
              <div key={i} className={`flex flex-col items-center text-center ${i % 2 !== 0 ? "pl-6 md:pl-8" : ""} ${i > 1 ? "mt-6 md:mt-0 pt-6 md:pt-0 border-t border-white/10 md:border-t-0" : ""}`}>
                <stat.icon size={28} weight="duotone" style={{ color: ACCENT_LIGHT }} className="mb-3" />
                <span className="text-3xl md:text-4xl font-bold text-white mb-1">{stat.value}</span>
                <span className="text-xs md:text-sm text-slate-400 font-medium uppercase tracking-wider">{stat.label}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* ─── 4. SERVICES GRID ─── */}
      <SectionReveal id="services" className="relative z-10 py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3 font-semibold" style={{ color: ACCENT_LIGHT }}>What We Fix</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white mb-6">
              <WordReveal text="Comprehensive Appliance Repair" />
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">From refrigerators that won’t cool to washers that won’t spin, our expert technicians can fix it all.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, i) => (
              <GlassCard key={i} className="overflow-hidden flex flex-col">
                <button onClick={() => setExpandedService(expandedService === i ? null : i)} className="p-8 text-left w-full flex-1 flex flex-col cursor-pointer group">
                  <div className="h-14 w-14 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3" style={{ background: ACCENT_GLOW, border: `1px solid ${ACCENT}40` }}>
                    <service.icon size={28} weight="duotone" style={{ color: ACCENT_LIGHT }} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 flex items-center justify-between w-full">
                    {service.title}
                    <motion.div animate={{ rotate: expandedService === i ? 180 : 0 }} transition={spring}><CaretDown size={20} className="text-slate-500" /></motion.div>
                  </h3>
                  <AnimatePresence initial={false}>
                    {expandedService === i ? (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={spring} className="overflow-hidden">
                        <p className="text-slate-400 leading-relaxed pt-2">{service.description}</p>
                      </motion.div>
                    ) : (
                      <p className="text-slate-400 leading-relaxed line-clamp-2">{service.description}</p>
                    )}
                  </AnimatePresence>
                </button>
              </GlassCard>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ─── 5. PORTFOLIO / GALLERY ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24 bg-slate-900/50 border-y border-white/5">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <p className="text-sm uppercase tracking-widest mb-3 font-semibold" style={{ color: ACCENT_LIGHT }}>Our Work</p>
              <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white">
                <WordReveal text="Professional Repairs in Action" />
              </h2>
            </div>
            <MagneticButton className="px-6 py-3 rounded-full text-sm font-semibold text-white border border-white/10 bg-white/5 flex items-center gap-2 cursor-pointer whitespace-nowrap">
              View Full Gallery <ArrowRight size={16} />
            </MagneticButton>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {portfolioImages.map((src, i) => (
              <motion.div key={i} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} custom={i} className="group relative aspect-square rounded-2xl overflow-hidden bg-slate-800">
                <img src={src} alt={`Appliance repair work ${i + 1}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-1 opacity-80 group-hover:opacity-100" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                  <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <p className="text-white font-semibold">Expert Diagnostics</p>
                    <p className="text-sm text-slate-300">Precision repair work</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ─── 6. ABOUT SECTION ─── */}
      <SectionReveal className="relative z-10 py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="aspect-[4/5] rounded-3xl overflow-hidden relative z-10 border border-white/10">
                <img src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&q=80" alt="Appliance Repair Technician" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent" />
              </div>
              <GlassCard className="absolute -bottom-8 -right-8 p-6 z-20 max-w-xs hidden md:block">
                <div className="flex items-center gap-4 mb-2">
                  <div className="h-12 w-12 rounded-full flex items-center justify-center" style={{ background: ACCENT_GLOW }}>
                    <Medal size={24} weight="duotone" style={{ color: ACCENT_LIGHT }} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">15+ Years</p>
                    <p className="text-xs text-slate-400 uppercase tracking-wider">Serving the Community</p>
                  </div>
                </div>
              </GlassCard>
            </div>
            <div>
              <p className="text-sm uppercase tracking-widest mb-3 font-semibold" style={{ color: ACCENT_LIGHT }}>About ProFix</p>
              <h2 className="text-4xl md:text-5xl tracking-tighter leading-tight font-bold text-white mb-6">
                <WordReveal text="Your Trusted Local Appliance Experts." />
              </h2>
              <div className="space-y-6 text-slate-400 text-lg leading-relaxed mb-8">
                <p>
                  At ProFix Appliance Repair, we understand how disruptive a broken appliance can be to your daily routine. That’s why we’ve dedicated ourselves to providing fast, reliable, and honest repair services to our community for over 15 years.
                </p>
                <p>
                  Our team of factory-trained technicians arrives fully equipped with the tools and common parts needed to fix most issues on the first visit. We believe in transparent pricing, clear communication, and treating your home with the utmost respect.
                </p>
              </div>
              <ul className="space-y-4 mb-10">
                {[
                  "Upfront, flat-rate pricing with no hidden fees",
                  "Fully stocked service vehicles for faster repairs",
                  "Respectful technicians who clean up after themselves",
                  "Locally owned and operated family business"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle size={24} weight="fill" style={{ color: ACCENT }} className="shrink-0 mt-0.5" />
                    <span className="text-slate-300">{item}</span>
                  </li>
                ))}
              </ul>
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white inline-flex items-center gap-2 cursor-pointer" style={{ background: ACCENT } as React.CSSProperties}>
                Learn More About Us
              </MagneticButton>
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* ─── 7. 4-STEP PROCESS ─── */}
      <SectionReveal id="process" className="relative z-10 py-24 md:py-32 bg-slate-900/30">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3 font-semibold" style={{ color: ACCENT_LIGHT }}>How It Works</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white mb-6">
              <WordReveal text="Our Simple Repair Process" />
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-transparent via-slate-700 to-transparent z-0" />
            {[
              { step: "01", title: "Schedule", desc: "Book online or call us. We offer flexible scheduling including same-day service for emergencies.", icon: CalendarCheck },
              { step: "02", title: "Diagnose", desc: "Our technician arrives on time, inspects the appliance, and identifies the exact cause of the problem.", icon: Wrench },
              { step: "03", title: "Quote", desc: "We provide a clear, upfront price for the repair before any work begins. No surprises.", icon: List },
              { step: "04", title: "Repair", desc: "We fix the issue using quality parts, test the appliance thoroughly, and clean up our workspace.", icon: CheckCircle },
            ].map((item, i) => (
              <div key={i} className="relative z-10 flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center mb-6 relative shadow-xl">
                  <div className="absolute inset-2 rounded-full border border-dashed border-slate-700 animate-[spin_20s_linear_infinite]" />
                  <item.icon size={32} weight="duotone" style={{ color: ACCENT_LIGHT }} />
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: ACCENT }}>
                    {item.step}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ─── 8. TESTIMONIALS ─── */}
      <SectionReveal id="testimonials" className="relative z-10 py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3 font-semibold" style={{ color: ACCENT_LIGHT }}>Customer Reviews</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white mb-6">
              <WordReveal text="What Our Clients Say" />
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, i) => (
              <GlassCard key={i} className="p-8 flex flex-col h-full relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Quotes size={64} weight="fill" style={{ color: ACCENT }} />
                </div>
                <div className="flex gap-1 mb-6 relative z-10">
                  {[...Array(testimonial.rating)].map((_, j) => (
                    <Star key={j} size={18} weight="fill" style={{ color: ACCENT_LIGHT }} />
                  ))}
                </div>
                <p className="text-slate-300 leading-relaxed mb-8 flex-1 relative z-10 italic">&ldquo;{testimonial.text}&rdquo;</p>
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-white font-bold border border-white/10">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{testimonial.name}</p>
                    <p className="text-slate-500 text-xs">Verified Customer</p>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ─── 9. GUARANTEE / CERTIFICATIONS ─── */}
      <SectionReveal className="relative z-10 py-16 border-y border-white/5 bg-slate-900/50">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-6 md:w-1/3">
              <ShieldCheck size={64} weight="duotone" style={{ color: ACCENT }} className="shrink-0" />
              <div>
                <h3 className="text-xl font-bold text-white mb-1">90-Day Guarantee</h3>
                <p className="text-sm text-slate-400">Parts and labor guaranteed.</p>
              </div>
            </div>
            <div className="flex flex-wrap justify-center md:justify-end gap-3 md:w-2/3">
              {certifications.map((cert, i) => (
                <div key={i} className="px-4 py-2 rounded-full border border-white/10 bg-white/5 text-xs font-medium text-slate-300 flex items-center gap-2">
                  <Certificate size={14} style={{ color: ACCENT_LIGHT }} /> {cert}
                </div>
              ))}
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* ─── 10. FAQ ACCORDION ─── */}
      <SectionReveal id="faq" className="relative z-10 py-24 md:py-32">
        <div className="mx-auto max-w-3xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3 font-semibold" style={{ color: ACCENT_LIGHT }}>Questions</p>
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

      {/* ─── 11. CTA BANNER ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4 md:px-6">
          <ShimmerBorder>
            <div className="p-8 md:p-12 text-center">
              <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={spring}>
                <p className="text-sm uppercase tracking-widest mb-3 font-semibold" style={{ color: ACCENT_LIGHT }}>Fast Service</p>
                <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white mb-4">Need a Repair Today?</h2>
                <p className="text-slate-400 text-lg mb-8 max-w-lg mx-auto">Don’t wait days for a technician. Call now to schedule same-day service and get your appliance working again.</p>
                <div className="flex flex-wrap justify-center gap-4">
                  <MagneticButton className="px-10 py-4 rounded-full text-base font-semibold text-white inline-flex items-center gap-2 cursor-pointer" style={{ background: ACCENT } as React.CSSProperties}>
                    <CalendarCheck size={20} weight="duotone" /> Book Online
                  </MagneticButton>
                  <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/10 inline-flex items-center gap-2 cursor-pointer hover:bg-white/5 transition-colors">
                    <Phone size={18} weight="duotone" /> (555) 123-4567
                  </MagneticButton>
                </div>
              </motion.div>
            </div>
          </ShimmerBorder>
        </div>
      </SectionReveal>

      {/* ─── 12. CONTACT SECTION ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24 bg-slate-900/30">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white mb-6">
                <WordReveal text="We're Here to Help." />
              </h2>
              <p className="text-slate-400 leading-relaxed max-w-md mb-8">
                Contact ProFix Appliance Repair today. Our friendly dispatchers are ready to answer your questions and schedule your service appointment.
              </p>
            </div>
            <GlassCard className="p-8">
              <h3 className="text-xl font-semibold text-white mb-6">Contact Information</h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <MapPin size={24} weight="duotone" style={{ color: ACCENT_LIGHT }} className="mt-0.5 shrink-0" />
                  <div><p className="text-sm font-semibold text-white mb-1">Service Area</p><p className="text-sm text-slate-400">Serving the Greater Metro Area<br />and surrounding suburbs</p></div>
                </div>
                <div className="flex items-start gap-4">
                  <Phone size={24} weight="duotone" style={{ color: ACCENT_LIGHT }} className="mt-0.5 shrink-0" />
                  <div><p className="text-sm font-semibold text-white mb-1">Phone</p><p className="text-sm text-slate-400">(555) 123-4567<br />24/7 Emergency Answering</p></div>
                </div>
                <div className="flex items-start gap-4">
                  <Clock size={24} weight="duotone" style={{ color: ACCENT_LIGHT }} className="mt-0.5 shrink-0" />
                  <div><p className="text-sm font-semibold text-white mb-1">Operating Hours</p><p className="text-sm text-slate-400">Monday - Friday: 8:00 AM - 6:00 PM<br />Saturday: 9:00 AM - 2:00 PM</p></div>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </SectionReveal>

      {/* ─── 13. FOOTER ─── */}
      <footer className="relative z-10 border-t border-white/5 py-8 pb-24 md:pb-8">
        <div className="mx-auto max-w-7xl px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <WrenchIcon size={16} />
            <span>ProFix Appliance Repair &copy; {new Date().getFullYear()}</span>
          </div>
          <p className="text-xs text-slate-600">Created by <a href="https://bluejayportfolio.com" target="_blank" rel="noopener noreferrer" className="hover:text-slate-400 transition-colors" style={{textDecoration:"underline"}}>bluejayportfolio.com</a></p>
        </div>
      </footer>

      {/* ─── 14. FIXED CLAIM BANNER ─── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pointer-events-none">
        <div className="mx-auto max-w-3xl">
          <GlassCard className="pointer-events-auto p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xl border-t border-white/20" style={{ background: "rgba(15, 23, 32, 0.85)" }}>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full flex items-center justify-center shrink-0" style={{ background: ACCENT_GLOW }}>
                <Timer size={20} weight="duotone" style={{ color: ACCENT_LIGHT }} />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Need it fixed today?</p>
                <p className="text-xs text-slate-400">Same-day service available in your area.</p>
              </div>
            </div>
            <MagneticButton className="w-full sm:w-auto px-6 py-2.5 rounded-full text-sm font-semibold text-white whitespace-nowrap cursor-pointer" style={{ background: ACCENT } as React.CSSProperties}>
              Claim $20 Off Repair
            </MagneticButton>
          </GlassCard>
        </div>
      </div>
    </main>
  );
}
