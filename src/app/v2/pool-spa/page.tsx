"use client";

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
  return <div className={`rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] ${className}`}>{children}</div>;
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
  { src: "https://images.unsplash.com/photo-1540539234-c14a20fb7c7b?w=600&q=80", alt: "Resort-style backyard pool" },
  { src: "https://images.unsplash.com/photo-1583922606661-0822ed0bd916?w=600&q=80", alt: "Modern pool design" },
  { src: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=600&q=80", alt: "Outdoor spa and hot tub" },
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
          <img src="https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=1600&q=80" alt="" className="w-full h-full object-cover opacity-15" />
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
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/10 flex items-center gap-2 cursor-pointer">
                <Phone size={18} weight="duotone" /> (555) 852-9630
              </MagneticButton>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ ...spring, delay: 1 }} className="flex flex-wrap gap-6 text-sm text-slate-400">
              <span className="flex items-center gap-2"><MapPin size={16} weight="duotone" style={{ color: CYAN }} />456 Poolside Drive</span>
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
                <GlassCard className="p-6 h-full flex flex-col">
                  <Quotes size={28} weight="fill" style={{ color: CYAN }} className="mb-3 opacity-50" />
                  <p className="text-slate-300 leading-relaxed flex-1 text-sm">{t.text}</p>
                  <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                    <span className="text-sm font-semibold text-white">{t.name}</span>
                    <div className="flex gap-0.5">{Array.from({ length: t.rating }).map((_, j) => (<Star key={j} size={12} weight="fill" style={{ color: SAND }} />))}</div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
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
                  <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/10 inline-flex items-center gap-2 cursor-pointer">
                    <Phone size={18} weight="duotone" /> Call Us
                  </MagneticButton>
                </div>
              </motion.div>
            </div>
          </ShimmerBorder>
        </div>
      </SectionReveal>

      {/* ─── FOOTER ─── */}
      <footer className="relative z-10 border-t border-white/5 py-8">
        <div className="mx-auto max-w-7xl px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Drop size={16} weight="duotone" style={{ color: CYAN }} />
            <span>AquaLux Pools & Spa &copy; {new Date().getFullYear()}</span>
          </div>
          <p className="text-xs text-slate-600">Created by <a href="https://bluejayportfolio.com" target="_blank" rel="noopener noreferrer" style={{textDecoration:"underline"}}>bluejayportfolio.com</a></p>
        </div>
      </footer>
    </main>
  );
}
