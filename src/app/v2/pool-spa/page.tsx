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
  Drop,
  SwimmingPool,
  Star,
  ShieldCheck,
  Thermometer,
  Wrench,
  Sun,
  Phone,
  MapPin,
  Clock,
  ArrowRight,
  CaretDown,
  Quotes,
  CalendarCheck,
  Leaf,
  Waves,
  CheckCircle,
  Sparkle,
  Fire,
  Users,
  Hammer,
  X,
  List,
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
const BG = "#0a1a20";
const CYAN = "#0891b2";
const CYAN_LIGHT = "#22d3ee";
const SAND = "#d4a853";
const SAND_LIGHT = "#e5c07b";
const CYAN_GLOW = "rgba(8, 145, 178, 0.15)";
const SAND_GLOW = "rgba(212, 168, 83, 0.12)";

/* ───────────────────────── FLOATING BUBBLES ───────────────────────── */
function FloatingBubbles() {
  const bubbles = Array.from({ length: 22 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 10,
    duration: 8 + Math.random() * 8,
    size: 4 + Math.random() * 8,
    opacity: 0.08 + Math.random() * 0.15,
  }));
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden hidden md:block">
      {bubbles.map((b) => (
        <motion.div
          key={b.id}
          className="absolute rounded-full border"
          style={{
            left: `${b.x}%`,
            width: b.size,
            height: b.size,
            borderColor: CYAN_LIGHT,
            background: `radial-gradient(circle at 30% 30%, rgba(34,211,238,0.15), transparent)`,
            willChange: "transform, opacity",
          }}
          animate={{
            y: ["110vh", "-10vh"],
            x: [0, Math.random() * 30 - 15, 0],
            opacity: [0, b.opacity, b.opacity, 0],
          }}
          transition={{
            y: { duration: b.duration, repeat: Infinity, delay: b.delay, ease: "linear" },
            x: { duration: b.duration / 2, repeat: Infinity, delay: b.delay, ease: "easeInOut" },
            opacity: { duration: b.duration, repeat: Infinity, delay: b.delay, times: [0, 0.1, 0.9, 1] },
          }}
        />
      ))}
    </div>
  );
}

/* ───────────────────────── SHARED COMPONENTS ───────────────────────── */
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
  return <div className={`rounded-2xl border border-white/15 bg-white/[0.08] backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] ${className}`}>{children}</div>;
}

function MagneticButton({ children, className = "", onClick, style }: { children: React.ReactNode; className?: string; onClick?: () => void; style?: React.CSSProperties }) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, springFast);
  const springY = useSpring(y, springFast);
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left - rect.width / 2) * 0.25);
    y.set((e.clientY - rect.top - rect.height / 2) * 0.25);
  }, [x, y]);
  const handleMouseLeave = useCallback(() => { x.set(0); y.set(0); }, [x, y]);
  return (
    <motion.button ref={ref} style={{ x: springX, y: springY, willChange: "transform", ...style }} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} onClick={onClick} className={className} whileTap={{ scale: 0.97 }}>
      {children}
    </motion.button>
  );
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
      <motion.div className="absolute inset-0 rounded-2xl" style={{ background: `conic-gradient(from 0deg, transparent, ${CYAN}, transparent, ${SAND}, transparent)`, willChange: "transform" }} animate={{ rotate: [0, 360] }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} />
      <div className="relative rounded-2xl z-10" style={{ background: "#0d1e25" }}>{children}</div>
    </div>
  );
}

/* ───────────────────────── WAVE BG ───────────────────────── */
function WaveBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
      <motion.svg viewBox="0 0 1440 320" className="absolute bottom-0 w-full" preserveAspectRatio="none">
        <motion.path
          fill={CYAN}
          fillOpacity="0.3"
          animate={{
            d: [
              "M0,224L48,213.3C96,203,192,181,288,186.7C384,192,480,224,576,229.3C672,235,768,213,864,197.3C960,181,1056,171,1152,181.3C1248,192,1344,224,1392,240L1440,256L1440,320L0,320Z",
              "M0,256L48,240C96,224,192,192,288,192C384,192,480,224,576,234.7C672,245,768,235,864,218.7C960,203,1056,181,1152,186.7C1248,192,1344,224,1392,240L1440,256L1440,320L0,320Z",
              "M0,224L48,213.3C96,203,192,181,288,186.7C384,192,480,224,576,229.3C672,235,768,213,864,197.3C960,181,1056,171,1152,181.3C1248,192,1344,224,1392,240L1440,256L1440,320L0,320Z",
            ],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.svg>
    </div>
  );
}

/* ───────────────────────── DATA ───────────────────────── */
const services = [
  { title: "Pool Cleaning", description: "Weekly and bi-weekly cleaning services including skimming, vacuuming, tile scrubbing, filter cleaning, and water chemistry balancing to keep your pool crystal clear year-round.", icon: Sparkle },
  { title: "Pool Repair", description: "Expert diagnosis and repair of pumps, filters, heaters, plumbing leaks, liner tears, and equipment malfunctions. We service all brands and models with same-week availability.", icon: Wrench },
  { title: "Pool Installation", description: "Custom in-ground pool design and installation from concept to completion. Gunite, fiberglass, and vinyl options with 3D design visualization before you commit.", icon: SwimmingPool },
  { title: "Pool Renovation", description: "Transform your aging pool with resurfacing, new tile, updated coping, LED lighting, water features, and modern automation systems that bring your backyard to life.", icon: Hammer },
  { title: "Hot Tub & Spa", description: "Installation, maintenance, and repair of hot tubs and spas. From selecting the perfect model to ongoing water care, we are your complete spa solution.", icon: Fire },
  { title: "Chemical Balance", description: "Precise water chemistry management including pH, chlorine, alkalinity, and calcium hardness testing and adjustment. Automated monitoring systems available.", icon: Thermometer },
];

const stats = [
  { value: "2,500+", label: "Pools Serviced" },
  { value: "4.9", label: "Star Rating" },
  { value: "18+", label: "Years Experience" },
  { value: "100%", label: "Satisfaction Rate" },
];

const processSteps = [
  { step: "01", title: "Free Consultation", description: "We visit your property, assess your pool or discuss your vision for a new build. Detailed written estimate provided within 48 hours.", icon: CalendarCheck },
  { step: "02", title: "Custom Plan", description: "Our designers create a tailored service plan or 3D pool design. We walk you through every detail, timeline, and investment before any work begins.", icon: SwimmingPool },
  { step: "03", title: "Expert Execution", description: "Our certified technicians deliver flawless work on schedule. Regular updates and photos keep you informed throughout the entire project.", icon: Wrench },
  { step: "04", title: "Ongoing Care", description: "After completion, we offer maintenance plans to keep everything pristine. Seasonal openings, closings, and equipment check-ups included.", icon: Sparkle },
];

const seasonalPlans = [
  { season: "Spring Opening", desc: "Remove cover, clean and inspect equipment, balance chemistry, check for winter damage, start filtration system.", icon: Leaf },
  { season: "Summer Maintenance", desc: "Weekly cleaning, chemical balance monitoring, equipment checks, algae prevention, filter maintenance.", icon: Sun },
  { season: "Fall Preparation", desc: "Reduce service frequency, lower water level, prepare equipment for cooler temps, leaf management.", icon: Leaf },
  { season: "Winter Closing", desc: "Winterize plumbing, add antifreeze, install safety cover, drain equipment, final chemical treatment.", icon: Waves },
];

const testimonials = [
  { name: "Katherine R.", text: "They built our dream pool from scratch. The 3D design process was incredible, we knew exactly what we were getting. The result exceeded our expectations. Our backyard is now a resort.", rating: 5 },
  { name: "Michael & Jen S.", text: "After years of green pools with other companies, we switched. Our pool has never looked better. Their weekly service is thorough, reliable, and we never worry about it anymore.", rating: 5 },
  { name: "Thomas H.", text: "Our 20-year-old pool looked brand new after their renovation. New plaster, LED lights, and a waterfall feature. They finished on time and on budget. Truly professionals.", rating: 5 },
];

const galleryImages = [
  { src: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=600&q=80", alt: "Luxury infinity pool" },
  { src: "https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?w=600&q=80", alt: "Pool with water feature" },
  { src: "https://images.unsplash.com/photo-1562778612-e1e0cda9915c?w=600&q=80", alt: "Evening pool lighting" },
  { src: "https://images.unsplash.com/photo-1694885190541-40037b8a6b13?w=600&q=80", alt: "Resort-style backyard pool" },
  { src: "https://images.unsplash.com/photo-1694885090746-d90472e11c0e?w=600&q=80", alt: "Outdoor entertaining space" },
  { src: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&q=80", alt: "Backyard pool installation" },
];

const faqs = [
  { q: "How often should my pool be serviced?", a: "We recommend weekly service for optimal water quality and equipment longevity. Bi-weekly is available for pools with lower usage, though weekly ensures consistently crystal-clear water." },
  { q: "How long does a pool installation take?", a: "A typical in-ground pool installation takes 6-10 weeks depending on design complexity, permitting, and weather. We provide a detailed timeline during the design phase." },
  { q: "Do you service hot tubs and spas?", a: "Absolutely. We install, maintain, and repair all major hot tub brands. Our spa services include water chemistry, jet cleaning, cover replacement, and equipment repair." },
  { q: "What is included in your maintenance plans?", a: "Our plans include weekly skimming, vacuuming, chemical testing and balancing, filter cleaning, equipment inspection, and seasonal opening/closing services." },
  { q: "Can you renovate my existing pool?", a: "Yes. We specialize in pool renovations including resurfacing, new tile and coping, LED lighting upgrades, water features, automation systems, and complete deck remodeling." },
];

/* ═══════════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════════ */
export default function V2PoolSpaPage() {
  const [openService, setOpenService] = useState<number | null>(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden" style={{ background: BG, color: "#f1f5f9" }}>
      <FloatingBubbles />

      {/* ─── NAV ─── */}
      <motion.nav initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-4">
          <GlassCard className="flex items-center justify-between px-4 md:px-6 py-3">
            <div className="flex items-center gap-2">
              <Drop size={24} weight="duotone" style={{ color: CYAN }} />
              <span className="text-lg font-bold tracking-tight text-white">AquaLux Pools & Spa</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
              <a href="#services" className="hover:text-white transition-colors">Services</a>
              <a href="#gallery" className="hover:text-white transition-colors">Gallery</a>
              <a href="#testimonials" className="hover:text-white transition-colors">Reviews</a>
              <a href="#contact" className="hover:text-white transition-colors">Contact</a>
            </div>
            <div className="flex items-center gap-3">
              <MagneticButton className="px-4 md:px-5 py-2 rounded-full text-sm font-semibold text-white transition-colors" style={{ background: CYAN }}>Free Consult</MagneticButton>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors">
                {mobileMenuOpen ? <X size={24} /> : <List size={24} />}
              </button>
            </div>
          </GlassCard>
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3, ease: "easeInOut" }} className="md:hidden mt-2 overflow-hidden">
                <GlassCard className="flex flex-col gap-1 px-4 py-4">
                  {[{ label: "Services", href: "#services" }, { label: "Gallery", href: "#gallery" }, { label: "Reviews", href: "#testimonials" }, { label: "Contact", href: "#contact" }].map((link) => (
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
        <div className="absolute inset-0 z-0">
          <img src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600&q=80" alt="" className="w-full h-full object-cover opacity-15" />
          <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, ${BG}, transparent 30%, ${BG})` }} />
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-4 items-center">
          <div className="space-y-8">
            <div>
              <motion.p initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ ...spring, delay: 0.1 }} className="text-sm uppercase tracking-widest mb-4" style={{ color: SAND }}>Premium Pool & Spa Services</motion.p>
              <h1 className="text-3xl md:text-6xl tracking-tighter leading-none font-bold text-white" style={{ textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>
                <WordReveal text="Crystal Clear Luxury" />
              </h1>
            </div>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.6 }} className="text-lg text-slate-400 max-w-md leading-relaxed">
              From custom pool installations to weekly maintenance, we deliver resort-quality water care that transforms your backyard into a personal oasis. Dive into luxury.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.8 }} className="flex flex-wrap gap-4">
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white flex items-center gap-2 cursor-pointer" style={{ background: CYAN }}>
                Free Consultation <ArrowRight size={18} weight="bold" />
              </MagneticButton>
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/15 flex items-center gap-2 cursor-pointer">
                <Phone size={18} weight="duotone" /> (425) 852-9630
              </MagneticButton>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ ...spring, delay: 1 }} className="flex flex-wrap gap-3">
              <span className="px-4 py-2 rounded-full text-xs font-semibold text-white flex items-center gap-2" style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${CYAN}40` }}><ShieldCheck size={14} weight="duotone" style={{ color: CYAN }} />Licensed & Insured</span>
              <span className="px-4 py-2 rounded-full text-xs font-semibold text-white flex items-center gap-2" style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${SAND}40` }}><Star size={14} weight="fill" style={{ color: SAND }} />4.9-Star Rated</span>
              <span className="px-4 py-2 rounded-full text-xs font-semibold text-white flex items-center gap-2" style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${CYAN}40` }}><CheckCircle size={14} weight="duotone" style={{ color: CYAN }} />Free Consultation</span>
              <span className="px-4 py-2 rounded-full text-xs font-semibold text-white flex items-center gap-2" style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${SAND}40` }}><Leaf size={14} weight="duotone" style={{ color: SAND }} />Eco-Friendly</span>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ ...spring, delay: 1.1 }} className="flex flex-wrap gap-6 text-sm text-slate-400">
              <span className="flex items-center gap-2"><MapPin size={16} weight="duotone" style={{ color: CYAN }} />12047 NE 1st St, Bellevue</span>
              <span className="flex items-center gap-2"><Clock size={16} weight="duotone" style={{ color: CYAN }} />Mon-Sat 7am-6pm</span>
            </motion.div>
          </div>
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ ...spring, delay: 0.3 }} className="hidden md:flex items-center justify-center lg:justify-end">
            <div className="relative">
              <motion.div className="absolute inset-0 rounded-full" style={{ background: `radial-gradient(circle, ${CYAN_GLOW} 0%, transparent 70%)`, filter: "blur(50px)" }} animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} />
              <svg viewBox="0 0 200 200" className="relative z-10 w-56 h-56 md:w-72 md:h-72" fill="none" xmlns="http://www.w3.org/2000/svg">
                <motion.ellipse cx="100" cy="120" rx="85" ry="45" stroke={CYAN} strokeWidth="2.5" fill="none" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 2, ease: "easeInOut" }} />
                <motion.path d="M30 110 Q50 95 70 110 Q90 125 110 110 Q130 95 150 110 Q170 125 180 115" stroke={CYAN_LIGHT} strokeWidth="1.5" fill="none" opacity={0.5} animate={{ d: ["M30 110 Q50 95 70 110 Q90 125 110 110 Q130 95 150 110 Q170 125 180 115", "M30 115 Q50 125 70 115 Q90 95 110 115 Q130 125 150 115 Q170 95 180 110", "M30 110 Q50 95 70 110 Q90 125 110 110 Q130 95 150 110 Q170 125 180 115"] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} />
                <motion.path d="M40 120 Q60 105 80 120 Q100 135 120 120 Q140 105 160 120" stroke={CYAN_LIGHT} strokeWidth="1" fill="none" opacity={0.3} animate={{ d: ["M40 120 Q60 105 80 120 Q100 135 120 120 Q140 105 160 120", "M40 125 Q60 135 80 125 Q100 105 120 125 Q140 135 160 125", "M40 120 Q60 105 80 120 Q100 135 120 120 Q140 105 160 120"] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }} />
                {[{ cx: 50, cy: 100 }, { cx: 100, cy: 90 }, { cx: 150, cy: 100 }].map((dot, i) => (
                  <motion.circle key={i} cx={dot.cx} cy={dot.cy} r="2" fill={CYAN_LIGHT} animate={{ opacity: [0.2, 0.8, 0.2], cy: [dot.cy, dot.cy - 15, dot.cy - 30] }} transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.5, ease: "easeOut" }} />
                ))}
              </svg>
            </div>
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
                  <p className="text-3xl md:text-4xl font-bold tracking-tight" style={{ color: CYAN }}>{s.value}</p>
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
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: SAND }}>What We Do</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Premium Pool Services" />
            </h2>
          </div>
          <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {services.map((svc, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="p-6 h-full">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: i % 2 === 0 ? CYAN_GLOW : SAND_GLOW }}>
                    <svc.icon size={24} weight="duotone" style={{ color: i % 2 === 0 ? CYAN : SAND }} />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{svc.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{svc.description}</p>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── ABOUT ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24 overflow-hidden">
        <WaveBackground />
        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: SAND }}>About AquaLux</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white mb-6">
              <WordReveal text="Your Backyard, Our Passion" />
            </h2>
            <p className="text-slate-400 leading-relaxed mb-4">
              For over 18 years, AquaLux Pools & Spa has been the trusted name in premium pool services. From stunning custom installations to reliable weekly maintenance, we treat every pool like our own.
            </p>
            <p className="text-slate-400 leading-relaxed">
              Our certified technicians use state-of-the-art equipment and eco-friendly products to deliver consistently crystal-clear results. We are fully licensed, bonded, and insured, and we stand behind every job with our satisfaction guarantee.
            </p>
          </div>
          <motion.div className="grid grid-cols-2 gap-4" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
            {[
              { icon: ShieldCheck, label: "Fully Licensed", desc: "Bonded & insured" },
              { icon: Users, label: "Expert Techs", desc: "CPO certified" },
              { icon: Sparkle, label: "Eco-Friendly", desc: "Green products" },
              { icon: Star, label: "Guaranteed", desc: "100% satisfaction" },
            ].map((item, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="p-5 text-center">
                  <item.icon size={28} weight="duotone" style={{ color: i % 2 === 0 ? CYAN : SAND }} className="mx-auto mb-2" />
                  <p className="text-sm font-semibold text-white">{item.label}</p>
                  <p className="text-xs text-slate-400 mt-1">{item.desc}</p>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── PROCESS ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: SAND }}>How It Works</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Our Process" />
            </h2>
          </div>
          <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {processSteps.map((p, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="p-6 h-full relative overflow-hidden">
                  <div className="absolute top-4 right-4 text-5xl font-black opacity-5 text-white">{p.step}</div>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: CYAN_GLOW }}>
                    <p.icon size={24} weight="duotone" style={{ color: CYAN }} />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{p.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{p.description}</p>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
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
                <p className="text-lg font-bold text-white">Rated by Our Clients</p>
              </div>
            </div>
            <div className="hidden sm:block w-px h-12 bg-white/10" />
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                {[0,1,2,3,4].map((i) => (<Star key={i} size={20} weight="fill" style={{ color: SAND }} />))}
              </div>
              <p className="text-sm text-slate-400"><span className="text-white font-bold">4.9</span> out of 5 &bull; <span className="text-white font-bold">287</span> reviews</p>
            </div>
          </GlassCard>
        </div>
      </SectionReveal>

      {/* ─── TESTIMONIALS ─── */}
      <SectionReveal id="testimonials" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: SAND }}>Client Stories</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Happy Pool Owners" />
            </h2>
          </div>
          <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {testimonials.map((t, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="p-6 h-full flex flex-col relative overflow-hidden">
                  <Quotes size={60} weight="fill" style={{ color: CYAN }} className="absolute -top-2 -right-2 opacity-10" />
                  <Quotes size={28} weight="fill" style={{ color: CYAN }} className="mb-3 opacity-60" />
                  <p className="text-slate-300 leading-relaxed flex-1 text-sm">{t.text}</p>
                  <div className="mt-4 pt-4 border-t border-white/8 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">{t.name}</span>
                      <CheckCircle size={14} weight="fill" style={{ color: CYAN }} />
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider">Verified</span>
                    </div>
                    <div className="flex gap-0.5">{Array.from({ length: t.rating }).map((_, j) => (<Star key={j} size={18} weight="fill" style={{ color: SAND }} />))}</div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── EMERGENCY/URGENCY ─── */}
      <SectionReveal className="relative z-10 py-8">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <GlassCard className="p-6 md:p-8 flex flex-col md:flex-row items-center gap-6">
            <div className="relative shrink-0">
              <motion.div className="absolute inset-0 rounded-full" style={{ background: CYAN }} animate={{ scale: [1, 1.6, 1], opacity: [0.5, 0, 0.5] }} transition={{ duration: 2, repeat: Infinity }} />
              <div className="relative w-4 h-4 rounded-full" style={{ background: CYAN }} />
            </div>
            <div className="flex-1 text-center md:text-left">
              <p className="text-xs uppercase tracking-widest mb-1" style={{ color: CYAN_LIGHT }}>Pool Technicians On Standby</p>
              <h3 className="text-2xl md:text-3xl font-bold text-white">Same-Week Service Guaranteed</h3>
              <p className="text-sm text-slate-400 mt-2">Green pool? Broken pump? Equipment failure before your pool party? We dispatch certified technicians within 48 hours, 7 days a week.</p>
            </div>
            <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white flex items-center gap-2 shrink-0 cursor-pointer" style={{ background: CYAN }}>
              <Phone size={18} weight="duotone" /> Request Service
            </MagneticButton>
          </GlassCard>
        </div>
      </SectionReveal>

      {/* ─── FINANCING / PRICING TIERS ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 60% 40% at 50% 50%, ${CYAN_GLOW} 0%, transparent 70%)` }} />
        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: SAND }}>Maintenance Plans</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white"><WordReveal text="Transparent Pricing" /></h2>
            <p className="text-slate-400 mt-4 max-w-2xl mx-auto">Pick the plan that matches your pool and your lifestyle. All plans include chemical balancing, equipment checks, and satisfaction guarantee.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "Essential", price: "$189", period: "/month", desc: "Bi-weekly service for lightly used pools", features: ["2 visits per month", "Skim & surface cleaning", "Chemical testing & balancing", "Filter basket emptying", "Equipment visual check", "Email service reports"], highlight: false },
              { name: "Premium", price: "$289", period: "/month", desc: "Most popular — crystal clear year-round", features: ["4 weekly visits", "Full vacuum & brush", "Advanced chemistry + stabilizer", "Filter deep clean every visit", "Priority repair scheduling", "Seasonal opening + closing included", "Equipment replacement warranty"], highlight: true },
              { name: "White Glove", price: "$449", period: "/month", desc: "Concierge-level service for luxury pools", features: ["Weekly visits + on-demand", "Automation system monitoring", "Salt cell + heater tuning", "Tile detailing every visit", "Waterfall + feature care", "24/7 emergency response", "Quarterly deep clean"], highlight: false },
            ].map((tier, i) => (
              <div key={i} className={`relative rounded-2xl ${tier.highlight ? 'p-[2px]' : ''}`} style={tier.highlight ? { background: `linear-gradient(135deg, ${CYAN}, ${SAND})` } : {}}>
                {tier.highlight && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white" style={{ background: CYAN }}>Most Popular</div>}
                <GlassCard className="p-6 h-full relative overflow-hidden" >
                  <h3 className="text-xl font-bold text-white">{tier.name}</h3>
                  <p className="text-xs text-slate-400 mt-1">{tier.desc}</p>
                  <div className="mt-6 flex items-end gap-1">
                    <span className="text-5xl font-black text-white">{tier.price}</span>
                    <span className="text-sm text-slate-400 mb-2">{tier.period}</span>
                  </div>
                  <ul className="mt-6 space-y-3">
                    {tier.features.map((f, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-slate-300">
                        <CheckCircle size={18} weight="fill" style={{ color: tier.highlight ? SAND : CYAN }} className="shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <button className="mt-6 w-full px-6 py-3 rounded-full text-sm font-semibold text-white" style={{ background: tier.highlight ? CYAN : "rgba(255,255,255,0.05)", border: tier.highlight ? "none" : "1px solid rgba(255,255,255,0.1)" }}>Get Started</button>
                </GlassCard>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-slate-500 mt-8">Financing available for new builds and renovations — 0% APR for qualified buyers up to 84 months.</p>
        </div>
      </SectionReveal>

      {/* ─── INSTALLATION PRICING / SPA TIERS ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-sm uppercase tracking-widest mb-3" style={{ color: SAND }}>Build Your Dream</p>
              <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white mb-6"><WordReveal text="Installation & Renovation Estimates" /></h2>
              <p className="text-slate-400 leading-relaxed mb-8">Every pool is custom — but transparent budget tiers help you plan. Final quotes after free on-site assessment with 3D rendering.</p>
              <div className="space-y-4">
                {[
                  { label: "Vinyl Liner Replacement", price: "$4,500 – $8,200", note: "New liner, water fill, chemical start-up" },
                  { label: "Pool Resurface (plaster)", price: "$7,500 – $14,000", note: "Pebble-tec options available" },
                  { label: "Full Renovation Package", price: "$28,000 – $65,000", note: "New tile, coping, lights, decking" },
                  { label: "New Gunite In-Ground Pool", price: "$55,000 – $120,000+", note: "Fully custom design, 8-14 week build" },
                  { label: "Hot Tub Installation", price: "$6,500 – $22,000", note: "Delivery, setup, chemistry, warranty" },
                ].map((row, i) => (
                  <GlassCard key={i} className="p-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-white">{row.label}</p>
                      <p className="text-xs text-slate-400">{row.note}</p>
                    </div>
                    <span className="text-sm font-bold whitespace-nowrap" style={{ color: SAND }}>{row.price}</span>
                  </GlassCard>
                ))}
              </div>
            </div>
            <div className="relative rounded-2xl overflow-hidden aspect-[4/5]">
              <img src="https://plus.unsplash.com/premium_photo-1733514692229-8aaede3df1ba?w=900&q=80" alt="Luxury pool installation project" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <p className="text-xs uppercase tracking-widest" style={{ color: CYAN_LIGHT }}>Featured Build</p>
                <p className="text-xl font-bold text-white mt-1">Willow Estate Infinity Pool</p>
                <p className="text-sm text-slate-300">Custom gunite &bull; 14 weeks &bull; LED + waterfall</p>
              </div>
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* ─── VIDEO TESTIMONIAL PLACEHOLDER ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: SAND }}>Behind The Scenes</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white"><WordReveal text="See Our Crew In Action" /></h2>
          </div>
          <div className="relative rounded-2xl overflow-hidden aspect-video group cursor-pointer">
            <img src="https://images.unsplash.com/photo-1774109556498-652c0458d4af?w=1600&q=80" alt="Pool service crew workshop" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20" />
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div className="w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center shadow-2xl" style={{ background: CYAN }} animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
                <svg width="28" height="32" viewBox="0 0 24 28" fill="white" className="ml-1">
                  <path d="M0 0L24 14L0 28Z" />
                </svg>
              </motion.div>
            </div>
            <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
              <div>
                <p className="text-xs uppercase tracking-widest" style={{ color: SAND }}>Studio Tour &bull; 2:48</p>
                <p className="text-xl md:text-2xl font-bold text-white mt-1">Meet the AquaLux team &amp; see how we deliver resort-grade care.</p>
              </div>
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* ─── INTERACTIVE QUIZ ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 50% 60% at 20% 50%, ${SAND_GLOW} 0%, transparent 70%)` }} />
        <div className="relative z-10 mx-auto max-w-5xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: SAND }}>Quick Diagnosis</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white"><WordReveal text="What Does Your Pool Need?" /></h2>
            <p className="text-slate-400 mt-4 max-w-2xl mx-auto">Answer one question and we will recommend the right service tier and next step.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { color: "#22c55e", label: "Looking Good", detail: "Water is clear, equipment works — just wants to keep it that way.", rec: "Premium Maintenance Plan", icon: Sparkle },
              { color: SAND, label: "Some Issues", detail: "Cloudy water, rising chemical costs, or slow filtration for weeks.", rec: "Diagnostic + Tune-Up Visit", icon: Thermometer },
              { color: "#ef4444", label: "Major Problem", detail: "Green water, broken pump, leaks, or outdated 15+ year system.", rec: "Emergency Service + Rebuild Quote", icon: Wrench },
            ].map((opt, i) => (
              <GlassCard key={i} className="p-6 h-full flex flex-col items-start relative overflow-hidden group cursor-pointer">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: `radial-gradient(circle at 50% 0%, ${opt.color}22, transparent 60%)` }} />
                <div className="relative w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: `${opt.color}22` }}>
                  <opt.icon size={22} weight="duotone" style={{ color: opt.color }} />
                </div>
                <p className="relative text-xs uppercase tracking-widest font-bold" style={{ color: opt.color }}>{opt.label}</p>
                <p className="relative text-sm text-slate-300 mt-2 leading-relaxed flex-1">{opt.detail}</p>
                <div className="relative mt-6 pt-4 border-t border-white/15 w-full">
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-1">We Recommend</p>
                  <p className="text-sm font-semibold text-white">{opt.rec}</p>
                </div>
              </GlassCard>
            ))}
          </div>
          <div className="text-center mt-8">
            <MagneticButton className="px-10 py-4 rounded-full text-base font-semibold text-white inline-flex items-center gap-2 cursor-pointer" style={{ background: CYAN }}>
              <Phone size={18} weight="duotone" /> Talk to a Pool Expert
            </MagneticButton>
          </div>
        </div>
      </SectionReveal>

      {/* ─── COMPETITOR COMPARISON ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: SAND }}>The Difference</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white"><WordReveal text="AquaLux vs. The Competition" /></h2>
          </div>
          <GlassCard className="overflow-hidden">
            <div className="grid grid-cols-[1.5fr_1fr_1fr] items-center border-b border-white/15">
              <div className="p-4 md:p-6 text-xs uppercase tracking-widest text-slate-400">What Matters</div>
              <div className="p-4 md:p-6 text-center" style={{ background: `${CYAN}15` }}>
                <p className="text-sm md:text-base font-bold" style={{ color: CYAN_LIGHT }}>AquaLux</p>
              </div>
              <div className="p-4 md:p-6 text-center">
                <p className="text-sm md:text-base font-semibold text-slate-400">Other Pool Co.</p>
              </div>
            </div>
            {[
              { feature: "CPO-certified technicians", us: "Every tech", them: "Varies" },
              { feature: "Same-week emergency service", us: "Guaranteed", them: "1-2 weeks" },
              { feature: "Detailed digital service reports", us: "Every visit", them: "Rarely" },
              { feature: "Eco-friendly chemical programs", us: "Included", them: "Upgrade fee" },
              { feature: "Licensed + bonded + insured", us: "Fully covered", them: "Sometimes" },
              { feature: "3D design for new builds", us: "Free", them: "$500+" },
              { feature: "Transparent flat-rate pricing", us: "Always", them: "Hidden fees" },
            ].map((row, i) => (
              <div key={i} className="grid grid-cols-[1.5fr_1fr_1fr] items-center border-b border-white/8 last:border-b-0">
                <div className="p-4 md:p-6 text-sm text-white">{row.feature}</div>
                <div className="p-4 md:p-6 text-center" style={{ background: `${CYAN}08` }}>
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle size={18} weight="fill" style={{ color: CYAN }} />
                    <span className="text-sm text-white font-semibold hidden sm:inline">{row.us}</span>
                  </div>
                </div>
                <div className="p-4 md:p-6 text-center text-sm text-slate-500 italic">{row.them}</div>
              </div>
            ))}
          </GlassCard>
        </div>
      </SectionReveal>

      {/* ─── CERTIFICATIONS ROW ─── */}
      <SectionReveal className="relative z-10 py-8">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <p className="text-center text-xs uppercase tracking-widest text-slate-500 mb-6">Certified By Industry Leaders</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {[
              { label: "CPO Certified", icon: ShieldCheck },
              { label: "APSP Member", icon: Drop },
              { label: "Pentair Pro", icon: SwimmingPool },
              { label: "Hayward Partner", icon: Waves },
              { label: "BBB A+ Rating", icon: Star },
              { label: "Licensed Contractor", icon: CheckCircle },
            ].map((cert, i) => (
              <GlassCard key={i} className="px-4 py-3 flex items-center gap-2 justify-center">
                <cert.icon size={18} weight="duotone" style={{ color: i % 2 === 0 ? CYAN : SAND }} />
                <span className="text-xs font-semibold text-slate-300">{cert.label}</span>
              </GlassCard>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ─── ENHANCED SERVICE AREA ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: SAND }}>Coverage Map</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white"><WordReveal text="Service Area & Response Times" /></h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <GlassCard className="p-6 text-center">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: CYAN_GLOW }}>
                <MapPin size={26} weight="duotone" style={{ color: CYAN }} />
              </div>
              <p className="text-xs uppercase tracking-widest mb-2" style={{ color: CYAN_LIGHT }}>Coverage Radius</p>
              <p className="text-3xl font-black text-white">35 Miles</p>
              <p className="text-sm text-slate-400 mt-2">From downtown to foothill estates — we serve the entire metro area and surrounding communities.</p>
            </GlassCard>
            <GlassCard className="p-6 text-center">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: SAND_GLOW }}>
                <Clock size={26} weight="duotone" style={{ color: SAND }} />
              </div>
              <p className="text-xs uppercase tracking-widest mb-2" style={{ color: SAND }}>Response Time</p>
              <p className="text-3xl font-black text-white">Under 48 Hrs</p>
              <p className="text-sm text-slate-400 mt-2">Scheduled weekly visits arrive the same day each week. Emergency calls receive a tech within two business days.</p>
            </GlassCard>
            <GlassCard className="p-6 text-center">
              <div className="relative w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: CYAN_GLOW }}>
                <motion.div className="absolute inset-0 rounded-full" style={{ background: CYAN }} animate={{ scale: [1, 1.6, 1], opacity: [0.4, 0, 0.4] }} transition={{ duration: 2, repeat: Infinity }} />
                <CheckCircle size={26} weight="duotone" style={{ color: CYAN }} className="relative" />
              </div>
              <p className="text-xs uppercase tracking-widest mb-2" style={{ color: CYAN_LIGHT }}>Availability</p>
              <p className="text-3xl font-black text-white">Now Booking</p>
              <p className="text-sm text-slate-400 mt-2">New maintenance clients welcomed year-round. New builds: 4-week lead time for spring & summer installs.</p>
            </GlassCard>
          </div>
          <div className="mt-8">
            <GlassCard className="p-6">
              <p className="text-xs uppercase tracking-widest text-slate-400 mb-3">Neighborhoods We Serve</p>
              <div className="flex flex-wrap gap-2">
                {["Sunset Hills", "Willow Estates", "Lakewood", "Mountain Ridge", "Oakmont", "Valley Vista", "The Preserve", "Harbor Point", "Meadowbrook", "Riverside", "Fairway Heights", "Country Club Estates"].map((n, i) => (
                  <span key={i} className="px-3 py-1.5 rounded-full text-xs font-medium text-slate-300" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.08)" }}>{n}</span>
                ))}
              </div>
            </GlassCard>
          </div>
        </div>
      </SectionReveal>

      {/* ─── SEASONAL MAINTENANCE ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-sm uppercase tracking-widest mb-3" style={{ color: SAND }}>Year-Round Care</p>
              <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white mb-6">
                <WordReveal text="Seasonal Maintenance Plans" />
              </h2>
              <p className="text-slate-400 leading-relaxed max-w-md">Keep your pool in perfect condition all year. Our seasonal plans cover everything from spring openings to winter closings so you never have to worry.</p>
            </div>
            <motion.div className="space-y-4" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
              {seasonalPlans.map((plan, i) => (
                <motion.div key={i} variants={fadeUp}>
                  <GlassCard className="p-5 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: i % 2 === 0 ? CYAN_GLOW : SAND_GLOW }}>
                      <plan.icon size={20} weight="duotone" style={{ color: i % 2 === 0 ? CYAN : SAND }} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{plan.season}</p>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">{plan.desc}</p>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </SectionReveal>

      {/* ─── GALLERY ─── */}
      <SectionReveal id="gallery" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: SAND }}>Our Work</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Pool Gallery" />
            </h2>
          </div>
          <motion.div className="grid grid-cols-2 md:grid-cols-3 gap-4" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {galleryImages.map((img, i) => (
              <motion.div key={i} variants={fadeUp} whileHover={{ scale: 1.03 }} transition={springFast} className="rounded-2xl overflow-hidden aspect-[4/3]">
                <img src={img.src} alt={img.alt} className="w-full h-full object-cover" />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── CHEMICAL TREATMENT PROGRAM ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
            <div className="lg:col-span-2">
              <p className="text-sm uppercase tracking-widest mb-3" style={{ color: SAND }}>Water Science</p>
              <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white mb-6"><WordReveal text="Advanced Chemical Program" /></h2>
              <p className="text-slate-400 leading-relaxed mb-6">Healthy water is invisible chemistry. Every visit, our techs test seven parameters, adjust precisely, and log readings so you always know your pool is protected.</p>
              <div className="flex flex-wrap gap-3">
                <span className="px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: CYAN_GLOW, color: CYAN_LIGHT }}>Eco-friendly</span>
                <span className="px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: SAND_GLOW, color: SAND_LIGHT }}>Low-chlorine</span>
                <span className="px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: CYAN_GLOW, color: CYAN_LIGHT }}>Salt-system ready</span>
              </div>
            </div>
            <motion.div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
              {[
                { name: "Free Chlorine", range: "1.0 – 3.0 ppm", purpose: "Kills bacteria and algae before they bloom." },
                { name: "pH Level", range: "7.4 – 7.6", purpose: "Keeps water comfortable and equipment safe." },
                { name: "Total Alkalinity", range: "80 – 120 ppm", purpose: "Buffers pH swings from rain or bather load." },
                { name: "Calcium Hardness", range: "200 – 400 ppm", purpose: "Protects plaster and equipment surfaces." },
                { name: "Cyanuric Acid", range: "30 – 50 ppm", purpose: "Shields chlorine from UV degradation." },
                { name: "TDS / Salinity", range: "< 1500 ppm fresh", purpose: "Monitors mineral buildup and salt system health." },
              ].map((chem, i) => (
                <motion.div key={i} variants={fadeUp}>
                  <GlassCard className="p-5 h-full">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <p className="text-sm font-bold text-white">{chem.name}</p>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: CYAN_GLOW, color: CYAN_LIGHT }}>{chem.range}</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{chem.purpose}</p>
                  </GlassCard>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </SectionReveal>

      {/* ─── SPA & HOT TUB DETAIL ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 50% 40% at 80% 50%, ${SAND_GLOW} 0%, transparent 70%)` }} />
        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative rounded-2xl overflow-hidden aspect-[4/5]">
              <img src="https://images.unsplash.com/photo-1603077864615-538e955d1ad1?w=900&q=80" alt="Luxury outdoor spa and hot tub installation" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <p className="text-xs uppercase tracking-widest" style={{ color: SAND }}>Spa Collection</p>
                <p className="text-xl font-bold text-white mt-1">Premium hot tubs for every backyard</p>
              </div>
            </div>
            <div>
              <p className="text-sm uppercase tracking-widest mb-3" style={{ color: SAND }}>Spa Expertise</p>
              <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white mb-6"><WordReveal text="Hot Tubs & Spas, Installed Right" /></h2>
              <p className="text-slate-400 leading-relaxed mb-8">From compact 2-person plug-and-play tubs to built-in swim spas with hydrotherapy jets, we handle selection, delivery, electrical coordination, and lifetime service.</p>
              <div className="space-y-3">
                {[
                  { label: "Site Assessment & Selection", desc: "Free in-home visit to match tub size, seating, and features to your space." },
                  { label: "Delivery & Placement", desc: "Crane-assisted delivery for tight yards. Concrete pad or deck prep available." },
                  { label: "Electrical Coordination", desc: "Licensed electrician partners handle 240V GFCI breaker installations." },
                  { label: "Chemistry Start-Up & Training", desc: "First fill, balance, and a hands-on walkthrough of your new spa." },
                  { label: "Lifetime Service Plan", desc: "Annual inspections, cover care, and priority repair for your investment." },
                ].map((step, i) => (
                  <GlassCard key={i} className="p-4 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold" style={{ background: SAND_GLOW, color: SAND }}>{i + 1}</div>
                    <div>
                      <p className="text-sm font-semibold text-white">{step.label}</p>
                      <p className="text-xs text-slate-400 mt-1">{step.desc}</p>
                    </div>
                  </GlassCard>
                ))}
              </div>
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* ─── FAQ ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: SAND }}>Common Questions</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Frequently Asked Questions" />
            </h2>
          </div>
          <motion.div className="space-y-3" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {faqs.map((faq, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="overflow-hidden">
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-5 md:p-6 text-left cursor-pointer">
                    <span className="text-lg font-semibold text-white pr-4">{faq.q}</span>
                    <motion.div animate={{ rotate: openFaq === i ? 180 : 0 }} transition={spring}><CaretDown size={20} className="text-slate-400" /></motion.div>
                  </button>
                  <AnimatePresence initial={false}>
                    {openFaq === i && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={spring} className="overflow-hidden">
                        <p className="px-5 pb-5 md:px-6 md:pb-6 text-slate-400 leading-relaxed">{faq.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── CONTACT CTA ─── */}
      <SectionReveal id="contact" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4 md:px-6">
          <ShimmerBorder>
            <div className="p-8 md:p-12 text-center">
              <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={spring}>
                <p className="text-sm uppercase tracking-widest mb-3" style={{ color: SAND }}>Dive In</p>
                <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white mb-4">Free Pool Consultation</h2>
                <p className="text-slate-400 text-lg mb-8 max-w-lg mx-auto">Whether you need weekly cleaning, a complete renovation, or a brand new pool, we will create a custom plan that fits your vision and budget.</p>
                <div className="flex flex-wrap justify-center gap-4">
                  <MagneticButton className="px-10 py-4 rounded-full text-base font-semibold text-white inline-flex items-center gap-2 cursor-pointer" style={{ background: CYAN }}>
                    <CalendarCheck size={20} weight="duotone" /> Book Consultation
                  </MagneticButton>
                  <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/15 inline-flex items-center gap-2 cursor-pointer">
                    <Phone size={18} weight="duotone" /> Call Us
                  </MagneticButton>
                </div>
              </motion.div>
            </div>
          </ShimmerBorder>
        </div>
      </SectionReveal>

      {/* ─── EXTENDED FAQ ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4 md:px-6">
          <div className="text-center mb-10">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: SAND }}>Quick Answers</p>
            <h2 className="text-3xl md:text-4xl tracking-tighter font-bold text-white"><WordReveal text="More Questions, Answered" /></h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { q: "Do you offer one-time pool cleanings?", a: "Yes — we offer one-time deep cleans, green-to-clean rescues, and pre-party detail service. Most one-time jobs scheduled within a week." },
              { q: "Are you licensed, bonded, and insured?", a: "Absolutely. Full state contractor license, $2M liability coverage, and CPO-certified technicians on every job." },
              { q: "Can you fix a green pool?", a: "Green pool rescues are a specialty. Most pools are swim-ready within 3–5 days of our treatment and daily chemistry checks." },
              { q: "Do you work with HOAs or commercial properties?", a: "Yes — we service apartment complexes, HOAs, gyms, and boutique hotels. Multi-pool route discounts available." },
            ].map((faq, i) => (
              <GlassCard key={i} className="p-5">
                <p className="text-sm font-bold text-white mb-2">{faq.q}</p>
                <p className="text-sm text-slate-400 leading-relaxed">{faq.a}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ─── NEIGHBORHOODS FINAL CTA ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <ShimmerBorder>
            <div className="p-8 md:p-12 text-center">
              <p className="text-sm uppercase tracking-widest mb-3" style={{ color: SAND }}>Start This Week</p>
              <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white mb-4">Ready For A Better Pool Experience?</h2>
              <p className="text-slate-400 text-lg mb-8 max-w-lg mx-auto">Join hundreds of neighbors who trust AquaLux for weekly care, seasonal work, and dream-pool builds. Consultations are always free.</p>
              <div className="flex flex-wrap justify-center gap-4">
                <MagneticButton className="px-10 py-4 rounded-full text-base font-semibold text-white inline-flex items-center gap-2 cursor-pointer" style={{ background: CYAN }}>
                  <CalendarCheck size={20} weight="duotone" /> Schedule Free Consult
                </MagneticButton>
                <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/15 inline-flex items-center gap-2 cursor-pointer">
                  <Phone size={18} weight="duotone" /> (425) 852-9630
                </MagneticButton>
              </div>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                {["Licensed & Insured", "18+ Years Experience", "CPO Certified Techs", "Eco-Friendly Chemistry", "Satisfaction Guaranteed"].map((b, i) => (
                  <span key={i} className="px-4 py-2 rounded-full text-xs font-semibold" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.08)", color: "#cbd5e1" }}>{b}</span>
                ))}
              </div>
            </div>
          </ShimmerBorder>
        </div>
      </SectionReveal>

      {/* ─── FOOTER ─── */}
      <footer className="relative z-10 border-t border-white/8 py-8">
        <div className="mx-auto max-w-7xl px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Drop size={16} weight="duotone" style={{ color: CYAN }} />
            <span>AquaLux Pools & Spa &copy; {new Date().getFullYear()}</span>
          </div>
          <p className="text-xs text-slate-600 flex items-center gap-1.5"><svg width="14" height="14" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-sky-500"><path d="M24.3 4.2c-1.5-.4-3.2.1-4.5 1.1-1-.7-2.3-1-3.5-.8-2.4.4-4.2 2.5-4.2 4.9v.6c-3.2.8-6 2.8-7.8 5.6-.3.5-.1 1.1.4 1.4.5.3 1.1.1 1.4-.4 1.5-2.3 3.7-4 6.3-4.7.5-.1 1-.1 1.5 0 .8.2 1.4.8 1.7 1.5.3.8.2 1.6-.2 2.3l-2.8 4.3c-.6.9-.4 2.1.4 2.8l2.5 2.1c.4.3.8.5 1.3.5h5.2c.5 0 1-.2 1.3-.5l1.2-1c.6-.5.8-1.3.6-2l-1-3.2c-.2-.5 0-1.1.4-1.4l3.8-2.5c1.3-.9 2.1-2.3 2.1-3.9V9.6c0-2.5-1.7-4.7-4.1-5.3v-.1z" fill="currentColor"/></svg>Built by <a href="https://bluejayportfolio.com/audit" target="_blank" rel="noopener noreferrer" style={{textDecoration:"underline"}}>BlueJays</a>{" "}— get your free site audit</p>
        </div>
      </footer>
    </main>
  );
}
