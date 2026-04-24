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
  CheckCircle,
  Quotes,
  X,
  List,
  Wrench,
  Gear,
  Lightning,
  Warning,
  Hammer,
  Garage,
  CalendarCheck,
  Users,
  Timer,
  Medal,
  Certificate,
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
const BG = "#1a1508";
const ACCENT = "#d97706";
const ACCENT_LIGHT = "#fbbf24";
const ACCENT_GLOW = "rgba(217, 119, 6, 0.15)";

/* ───────────────────────── GARAGE ICON SVG ───────────────────────── */
function GarageIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path d="M4 28V14L16 4L28 14V28H4Z" stroke={ACCENT} strokeWidth="2" strokeLinejoin="round" />
      <rect x="8" y="16" width="16" height="12" rx="1" stroke={ACCENT_LIGHT} strokeWidth="1.5" />
      <line x1="8" y1="20" x2="24" y2="20" stroke={ACCENT_LIGHT} strokeWidth="1" opacity="0.5" />
      <line x1="8" y1="24" x2="24" y2="24" stroke={ACCENT_LIGHT} strokeWidth="1" opacity="0.5" />
    </svg>
  );
}

/* ───────────────────────── STEEL PARTICLES ───────────────────────── */
function SteelParticles() {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 10,
    duration: 8 + Math.random() * 6,
    size: 1 + Math.random() * 2,
    opacity: 0.08 + Math.random() * 0.15,
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
  { title: "Door Repair", description: "Expert repair for all garage door types — panels, tracks, cables, rollers, and hinges. We diagnose fast and carry most parts on our trucks for same-day fixes.", icon: Wrench },
  { title: "New Installation", description: "Full garage door installation from leading manufacturers. We help you choose the perfect style, material, and insulation level for your home or business.", icon: Hammer },
  { title: "Opener Systems", description: "Belt-drive, chain-drive, and smart opener installation and repair. WiFi-enabled openers with smartphone control and battery backup options.", icon: Gear },
  { title: "Spring Replacement", description: "Torsion and extension spring replacement by certified technicians. Springs are under extreme tension — never attempt DIY. We ensure safe, precise replacement.", icon: Lightning },
  { title: "Panel Replacement", description: "Individual panel replacement for dented, cracked, or damaged sections. We match colors and styles to maintain a seamless look without replacing the entire door.", icon: Garage },
  { title: "Emergency Service", description: "24/7 emergency garage door repair when you are locked out, stuck, or have a door off its tracks. Fast response times, day or night, weekends and holidays.", icon: Warning },
];

const testimonials = [
  { name: "Mike R.", text: "Spring snapped at 6 AM and they had a tech here by 8. Professional, fair pricing, and the door works better than ever. These guys are the real deal.", rating: 5 },
  { name: "Amanda T.", text: "Replaced our 20-year-old door with a beautiful insulated one. The difference in noise and temperature is incredible. Installation was clean and fast.", rating: 5 },
  { name: "Steve & Linda K.", text: "Our opener died on a Saturday night. They came out Sunday morning and had us back in business within an hour. Cannot recommend them enough.", rating: 5 },
];

const brands = [
  "LiftMaster", "Chamberlain", "Clopay", "Amarr", "Wayne Dalton", "CHI Overhead", "Genie", "Raynor",
];

const faqData = [
  { q: "How long does a garage door installation take?", a: "Most single-door installations take 3-4 hours. A double door may take 4-6 hours. We handle everything from removal of the old door to full testing of the new system." },
  { q: "My garage door is making loud noises — what should I do?", a: "Grinding, squeaking, or banging can indicate worn rollers, loose hardware, or spring issues. We recommend scheduling an inspection. Continuing to operate a noisy door can lead to bigger problems." },
  { q: "How often should I service my garage door?", a: "We recommend annual maintenance including lubrication, balance testing, safety sensor checks, and hardware tightening. Regular maintenance extends the life of your door by years." },
  { q: "Do you offer warranties?", a: "Yes. We offer manufacturer warranties on all doors and openers, plus our own labor warranty. Parts we install are covered for a minimum of one year." },
  { q: "Can you match my existing door panels?", a: "In most cases, yes. We carry a large inventory and can order exact-match panels for most major brands. We will bring color samples to ensure a perfect match." },
  { q: "What should I do if my door is stuck?", a: "Do not try to force it. Disconnect the opener using the emergency release cord and call us. A stuck door can indicate broken springs or cable issues that require professional repair." },
];

/* ═══════════════════════════════════════════════════════════════════
   MAIN PAGE COMPONENT
   ═══════════════════════════════════════════════════════════════════ */
export default function V2GarageDoorPage() {
  const [openService, setOpenService] = useState<number | null>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden" style={{ background: BG, color: "#f1f5f9" }}>
      <SteelParticles />

      {/* ─── NAV ─── */}
      <motion.nav initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-4">
          <GlassCard className="flex items-center justify-between px-4 md:px-6 py-3">
            <div className="flex items-center gap-2">
              <GarageIcon size={24} />
              <span className="text-lg font-bold tracking-tight text-white">IronGate Doors</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
              <a href="#services" className="hover:text-white transition-colors">Services</a>
              <a href="#gallery" className="hover:text-white transition-colors">Gallery</a>
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
                  {[{ label: "Services", href: "#services" }, { label: "Gallery", href: "#gallery" }, { label: "About", href: "#about" }, { label: "Reviews", href: "#testimonials" }].map((link) => (
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
          <img src="https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1600&q=80" alt="" className="w-full h-full object-cover object-center" />
          <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${BG}ee 0%, ${BG}dd 50%, ${BG}aa 100%)` }} />
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div>
              <motion.p initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ ...spring, delay: 0.1 }} className="text-sm uppercase tracking-widest mb-4" style={{ color: ACCENT }}>
                Professional Garage Door Experts
              </motion.p>
              <h1 className="text-3xl md:text-6xl tracking-tighter leading-none font-bold text-white" style={{ textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>
                <WordReveal text="Built Strong, Opens Right" />
              </h1>
            </div>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.6 }} className="text-lg text-slate-300 max-w-md leading-relaxed">
              From emergency spring repairs to full custom installations, we keep your garage doors running smooth, safe, and looking sharp. Licensed and insured.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.8 }} className="flex flex-wrap gap-4">
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white flex items-center gap-2 cursor-pointer" style={{ background: ACCENT } as React.CSSProperties}>
                Request Service <ArrowRight size={18} weight="bold" />
              </MagneticButton>
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/15 flex items-center gap-2 cursor-pointer">
                <Phone size={18} weight="duotone" /> (555) 439-2100
              </MagneticButton>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ ...spring, delay: 0.95 }} className="flex flex-wrap gap-3">
              <span className="px-4 py-2 rounded-full text-xs font-semibold text-white flex items-center gap-2" style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${ACCENT}40` }}><ShieldCheck size={14} weight="duotone" style={{ color: ACCENT }} />Licensed &amp; Insured</span>
              <span className="px-4 py-2 rounded-full text-xs font-semibold text-white flex items-center gap-2" style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${ACCENT_LIGHT}40` }}><Star size={14} weight="fill" style={{ color: ACCENT_LIGHT }} />4.9-Star Rated</span>
              <span className="px-4 py-2 rounded-full text-xs font-semibold text-white flex items-center gap-2" style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${ACCENT}40` }}><CheckCircle size={14} weight="duotone" style={{ color: ACCENT }} />Free Estimates</span>
              <span className="px-4 py-2 rounded-full text-xs font-semibold text-white flex items-center gap-2" style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${ACCENT_LIGHT}40` }}><Timer size={14} weight="duotone" style={{ color: ACCENT_LIGHT }} />Same-Day Service</span>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ ...spring, delay: 1 }} className="flex flex-wrap gap-6 text-sm text-slate-400">
              <span className="flex items-center gap-2"><MapPin size={16} weight="duotone" style={{ color: ACCENT }} />Serving the Tri-County Area</span>
              <span className="flex items-center gap-2"><Clock size={16} weight="duotone" style={{ color: ACCENT }} />24/7 Emergency Available</span>
            </motion.div>
          </div>
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ ...spring, delay: 0.3 }} className="hidden lg:flex items-center justify-center">
            <div className="relative">
              <motion.div className="absolute inset-0 rounded-full" style={{ background: `radial-gradient(circle, ${ACCENT_GLOW} 0%, transparent 70%)`, filter: "blur(40px)" }} animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} />
              <Garage size={200} weight="duotone" style={{ color: ACCENT }} className="relative z-10" />
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
                { icon: Star, label: "4.9 Star Rating", desc: "400+ reviews" },
                { icon: Timer, label: "Same-Day Repair", desc: "90% of service calls" },
                { icon: Certificate, label: "Licensed & Insured", desc: "Full coverage" },
                { icon: Medal, label: "15+ Years", desc: "Serving the community" },
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
              <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ACCENT }}>What We Do</p>
              <h2 className="text-3xl md:text-6xl tracking-tighter leading-none font-bold text-white mb-6">
                <WordReveal text="Expert Garage Door Services" />
              </h2>
              <p className="text-slate-400 leading-relaxed max-w-md">
                Whether your door needs a quick fix or a complete replacement, our factory-trained technicians have the tools and expertise for every job.
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

      {/* ─── 4. GALLERY ─── */}
      <SectionReveal id="gallery" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ACCENT }}>Our Work</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Installation Gallery" />
            </h2>
          </div>
          <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {[
              "https://images.unsplash.com/photo-1675747158954-4a32e28812c0?w=600&q=80",
              "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&q=80",
              "https://images.unsplash.com/photo-1600577916048-804c9191e36c?w=600&q=80",
              "https://images.unsplash.com/photo-1599809275671-b5942cabc7a2?w=600&q=80",
              "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=600&q=80",
              "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=600&q=80",
            ].map((img, i) => (
              <motion.div key={i} variants={fadeUp} className="aspect-[4/3] rounded-xl overflow-hidden">
                <motion.img src={img} alt={`Garage door project ${i + 1}`} className="w-full h-full object-cover" whileHover={{ scale: 1.05 }} transition={{ duration: 0.4 }} />
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
              <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ACCENT }}>About IronGate</p>
              <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white mb-6">
                <WordReveal text="Strength You Can Trust" />
              </h2>
              <p className="text-slate-400 leading-relaxed mb-6">
                For over 15 years, IronGate Doors has been the go-to garage door company for homeowners and businesses across the tri-county area. We are factory-certified installers for every major brand and carry a massive parts inventory for fast same-day repairs.
              </p>
              <p className="text-slate-400 leading-relaxed">
                Every technician is background-checked, drug-tested, and continuously trained on the latest products and safety standards. Your home and family are in good hands.
              </p>
            </div>
            <motion.div className="grid grid-cols-2 gap-4" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
              {[
                { icon: ShieldCheck, label: "Safety First", desc: "OSHA compliant" },
                { icon: Users, label: "Expert Techs", desc: "Factory certified" },
                { icon: Timer, label: "Fast Response", desc: "Same-day service" },
                { icon: Certificate, label: "Full Warranty", desc: "Parts & labor" },
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
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ACCENT }}>How It Works</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Simple Service Process" />
            </h2>
          </div>
          <motion.div className="grid grid-cols-1 md:grid-cols-4 gap-6" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {[
              { step: "01", title: "Call or Book Online", desc: "Reach us anytime. Describe the issue and we will schedule a visit that works for you." },
              { step: "02", title: "On-Site Diagnosis", desc: "Our tech arrives with a fully stocked truck, inspects the problem, and gives you an upfront quote." },
              { step: "03", title: "Expert Repair", desc: "Most repairs are completed in a single visit. For installations, we schedule a dedicated time slot." },
              { step: "04", title: "Test & Guarantee", desc: "We test everything thoroughly and back our work with a written warranty. Your satisfaction is guaranteed." },
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

      {/* ─── EMERGENCY STRIP ─── */}
      <SectionReveal className="relative z-10 py-8">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <GlassCard className="p-6 md:p-8 flex flex-col md:flex-row items-center gap-6">
            <div className="relative shrink-0">
              <motion.div className="absolute inset-0 rounded-full" style={{ background: ACCENT_LIGHT }} animate={{ scale: [1, 1.6, 1], opacity: [0.5, 0, 0.5] }} transition={{ duration: 2, repeat: Infinity }} />
              <div className="relative w-4 h-4 rounded-full" style={{ background: ACCENT_LIGHT }} />
            </div>
            <div className="flex-1 text-center md:text-left">
              <p className="text-xs uppercase tracking-widest mb-1" style={{ color: ACCENT_LIGHT }}>Stuck Outside? Broken Spring?</p>
              <h3 className="text-2xl md:text-3xl font-bold text-white">24/7 Emergency Garage Door Service</h3>
              <p className="text-sm text-slate-400 mt-2">Live dispatch. Trucks in your neighborhood. Most calls resolved in under 90 minutes — even at 2am.</p>
            </div>
            <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white flex items-center gap-2 shrink-0 cursor-pointer" style={{ background: ACCENT } as React.CSSProperties}>
              <Phone size={18} weight="duotone" /> Call Now
            </MagneticButton>
          </GlassCard>
        </div>
      </SectionReveal>

      {/* ─── DOOR STYLES GALLERY ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ACCENT }}>Door Styles</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white"><WordReveal text="Garage Door Showcase" /></h2>
            <p className="text-slate-400 mt-4 max-w-2xl mx-auto">Traditional raised-panel, modern full-view, carriage-house, and custom woodgrain — shop by style and compare side-by-side.</p>
          </div>
          <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-4" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
            {[
              { src: "https://images.unsplash.com/photo-1558036117-15d82a90b9b1?w=600&q=80", label: "Carriage House" },
              { src: "https://images.unsplash.com/photo-1572120360610-d971b9d7767c?w=600&q=80", label: "Modern Full-View" },
              { src: "https://images.unsplash.com/photo-1605146769289-440113cc3d00?w=600&q=80", label: "Raised Panel" },
              { src: "https://images.unsplash.com/photo-1600566753151-384129cf4e3e?w=600&q=80", label: "Custom Woodgrain" },
            ].map((door, i) => (
              <motion.div key={i} variants={fadeUp} whileHover={{ scale: 1.03 }} className="rounded-2xl overflow-hidden aspect-square relative group cursor-pointer">
                <img src={door.src} alt={door.label} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <p className="absolute bottom-4 left-4 right-4 text-sm font-bold text-white">{door.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── TRANSPARENT PRICING ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 60% 40% at 50% 50%, ${ACCENT_GLOW} 0%, transparent 70%)` }} />
        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ACCENT }}>Upfront Pricing</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white"><WordReveal text="Transparent Flat-Rate Pricing" /></h2>
            <p className="text-slate-400 mt-4 max-w-2xl mx-auto">No surprise fees, no hourly games — you approve the price before we pick up a tool.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "Spring Replacement", price: "$189", desc: "Single torsion spring, OEM parts, adjustment, and safety test. Most common garage door call.", features: ["Lifetime spring warranty", "Balance + alignment check", "Quiet nylon rollers option", "Same-day scheduling"], highlight: false },
              { name: "New Opener Install", price: "$599", desc: "Belt-drive Wi-Fi opener with smartphone app, battery backup, and premium motor. Includes haul-away.", features: ["LiftMaster or Chamberlain", "MyQ smart home integration", "2 remotes + wall console", "10-year motor warranty"], highlight: true },
              { name: "Full Door Replacement", price: "$1,499", desc: "New insulated steel door (up to 16x7), hardware, installation, and haul-away of the old door.", features: ["R-18 insulated panels", "15-year finish warranty", "Wind-load rated options", "Color-matched trim"], highlight: false },
            ].map((tier, i) => (
              <div key={i} className={`relative rounded-2xl ${tier.highlight ? 'p-[2px]' : ''}`} style={tier.highlight ? { background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_LIGHT})` } : {}}>
                {tier.highlight && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white" style={{ background: ACCENT }}>Most Popular</div>}
                <GlassCard className="p-6 h-full">
                  <h3 className="text-xl font-bold text-white">{tier.name}</h3>
                  <p className="text-xs text-slate-400 mt-1">{tier.desc}</p>
                  <div className="mt-6 flex items-end gap-1">
                    <span className="text-5xl font-black text-white">{tier.price}</span>
                    <span className="text-sm text-slate-400 mb-2">+tax</span>
                  </div>
                  <ul className="mt-6 space-y-3">
                    {tier.features.map((f, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-slate-300">
                        <CheckCircle size={18} weight="fill" style={{ color: tier.highlight ? ACCENT_LIGHT : ACCENT }} className="shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <button className="mt-6 w-full px-6 py-3 rounded-full text-sm font-semibold text-white" style={{ background: tier.highlight ? ACCENT : "rgba(255,255,255,0.05)", border: tier.highlight ? "none" : "1px solid rgba(255,255,255,0.1)" }}>Book Now</button>
                </GlassCard>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-slate-500 mt-8">Financing available — 0% APR up to 18 months on qualifying full-door installations.</p>
        </div>
      </SectionReveal>

      {/* ─── OPENER BRANDS ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ACCENT }}>Trusted Brands</p>
              <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white mb-6"><WordReveal text="Openers, Doors & Parts We Service" /></h2>
              <p className="text-slate-400 leading-relaxed mb-8">Factory-trained on every major manufacturer. Whether you have a 20-year-old Genie or a brand-new MyQ Wi-Fi opener, we stock the parts to fix it today.</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {["LiftMaster", "Chamberlain", "Genie", "Clopay", "Wayne Dalton", "Amarr", "Raynor", "CHI Overhead", "Craftsman"].map((brand, i) => (
                  <GlassCard key={i} className="px-4 py-3 text-center">
                    <span className="text-sm font-semibold text-white">{brand}</span>
                  </GlassCard>
                ))}
              </div>
            </div>
            <div className="relative rounded-2xl overflow-hidden aspect-[4/5]">
              <img src="https://images.unsplash.com/photo-1586582636676-9ca2d4cedb9a?w=900&q=80" alt="Modern garage door opener install" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <p className="text-xs uppercase tracking-widest" style={{ color: ACCENT_LIGHT }}>Featured Install</p>
                <p className="text-xl font-bold text-white mt-1">MyQ Wi-Fi Belt Drive</p>
                <p className="text-sm text-slate-300">Ultra-quiet &bull; smartphone app &bull; battery backup</p>
              </div>
            </div>
          </div>
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
                <p className="text-lg font-bold text-white">Rated by Our Customers</p>
              </div>
            </div>
            <div className="hidden sm:block w-px h-12 bg-white/10" />
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                {[0,1,2,3,4].map((i) => (<Star key={i} size={20} weight="fill" style={{ color: ACCENT_LIGHT }} />))}
              </div>
              <p className="text-sm text-slate-400"><span className="text-white font-bold">4.9</span> out of 5 &bull; <span className="text-white font-bold">412</span> reviews</p>
            </div>
          </GlassCard>
        </div>
      </SectionReveal>

      {/* ─── 7. TESTIMONIALS ─── */}
      <SectionReveal id="testimonials" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ACCENT }}>Customer Reviews</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="What Our Customers Say" />
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

      {/* ─── 8. BRANDS CARRIED ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ACCENT }}>Authorized Dealer</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Brands We Carry" />
            </h2>
          </div>
          <motion.div className="grid grid-cols-2 sm:grid-cols-4 gap-4" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {brands.map((brand, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="p-5 text-center">
                  <p className="text-lg font-bold text-white">{brand}</p>
                  <div className="w-8 h-0.5 mx-auto mt-2 rounded-full" style={{ background: ACCENT }} />
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── VIDEO PLACEHOLDER ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ACCENT }}>Behind The Scenes</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white"><WordReveal text="Watch Our Technicians Work" /></h2>
          </div>
          <div className="relative rounded-2xl overflow-hidden aspect-video group cursor-pointer">
            <img src="https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=1600&q=80" alt="Technician workshop tour" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20" />
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div className="w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center shadow-2xl" style={{ background: ACCENT }} animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
                <svg width="28" height="32" viewBox="0 0 24 28" fill="white" className="ml-1">
                  <path d="M0 0L24 14L0 28Z" />
                </svg>
              </motion.div>
            </div>
            <div className="absolute bottom-6 left-6 right-6">
              <p className="text-xs uppercase tracking-widest" style={{ color: ACCENT_LIGHT }}>Workshop Tour &bull; 3:22</p>
              <p className="text-xl md:text-2xl font-bold text-white mt-1">See how we replace a broken torsion spring in under 45 minutes.</p>
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* ─── INTERACTIVE QUIZ ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 50% 60% at 20% 50%, ${ACCENT_GLOW} 0%, transparent 70%)` }} />
        <div className="relative z-10 mx-auto max-w-5xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ACCENT }}>Quick Diagnosis</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white"><WordReveal text="What's Wrong With Your Garage Door?" /></h2>
            <p className="text-slate-400 mt-4 max-w-2xl mx-auto">Pick the symptom and we will tell you whether it is a 15-minute fix or a full replacement.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { color: ACCENT, label: "Won't Open or Close", detail: "Dead opener, snapped spring, or cables off the drum. Most common 2am call.", rec: "Emergency Spring/Cable Repair", icon: Warning },
              { color: ACCENT_LIGHT, label: "Loud or Grinding", detail: "Worn rollers, loose hardware, or unbalanced door. Usually repairable same-day.", rec: "Tune-Up + Hardware Package", icon: Gear },
              { color: "#dc2626", label: "Old or Damaged Door", detail: "Dented panels, rusted tracks, or a door older than 15 years. Time to upgrade.", rec: "Full Door Replacement Quote", icon: Hammer },
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
            <MagneticButton className="px-10 py-4 rounded-full text-base font-semibold text-white inline-flex items-center gap-2 cursor-pointer" style={{ background: ACCENT } as React.CSSProperties}>
              <Phone size={18} weight="duotone" /> Talk to a Technician
            </MagneticButton>
          </div>
        </div>
      </SectionReveal>

      {/* ─── COMPETITOR COMPARISON ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ACCENT }}>The Difference</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white"><WordReveal text="Us vs. The Competition" /></h2>
          </div>
          <GlassCard className="overflow-hidden">
            <div className="grid grid-cols-[1.5fr_1fr_1fr] items-center border-b border-white/15">
              <div className="p-4 md:p-6 text-xs uppercase tracking-widest text-slate-400">What Matters</div>
              <div className="p-4 md:p-6 text-center" style={{ background: `${ACCENT}15` }}>
                <p className="text-sm md:text-base font-bold" style={{ color: ACCENT_LIGHT }}>Our Shop</p>
              </div>
              <div className="p-4 md:p-6 text-center">
                <p className="text-sm md:text-base font-semibold text-slate-400">Cheap Handyman</p>
              </div>
            </div>
            {[
              { feature: "Factory-trained technicians", us: "Every tech", them: "No" },
              { feature: "Same-day emergency service", us: "Guaranteed", them: "Varies" },
              { feature: "Upfront flat-rate pricing", us: "Always", them: "Hourly + parts markup" },
              { feature: "OEM parts (not knockoffs)", us: "Standard", them: "Whatever is cheapest" },
              { feature: "Licensed + bonded + insured", us: "Fully covered", them: "Rarely" },
              { feature: "Lifetime spring warranty", us: "Included", them: "90 days max" },
              { feature: "MyQ + smart-home setup", us: "Included", them: "Extra charge" },
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
          <p className="text-center text-xs uppercase tracking-widest text-slate-500 mb-6">Certifications &amp; Partners</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {[
              { label: "IDEA Certified", icon: Certificate },
              { label: "LiftMaster Pro", icon: Medal },
              { label: "Chamberlain Dealer", icon: ShieldCheck },
              { label: "BBB A+ Rating", icon: Star },
              { label: "State Licensed", icon: CheckCircle },
              { label: "IDA Member", icon: Users },
            ].map((cert, i) => (
              <GlassCard key={i} className="px-4 py-3 flex items-center gap-2 justify-center">
                <cert.icon size={18} weight="duotone" style={{ color: i % 2 === 0 ? ACCENT : ACCENT_LIGHT }} />
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
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ACCENT }}>Where We Work</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white"><WordReveal text="Service Area & Response Time" /></h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <GlassCard className="p-6 text-center">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: ACCENT_GLOW }}>
                <MapPin size={26} weight="duotone" style={{ color: ACCENT }} />
              </div>
              <p className="text-xs uppercase tracking-widest mb-2" style={{ color: ACCENT_LIGHT }}>Coverage Radius</p>
              <p className="text-3xl font-black text-white">40 Miles</p>
              <p className="text-sm text-slate-400 mt-2">Tri-county dispatch with mobile shops in every major town — we get to you fast, even during peak hours.</p>
            </GlassCard>
            <GlassCard className="p-6 text-center">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: ACCENT_GLOW }}>
                <Timer size={26} weight="duotone" style={{ color: ACCENT_LIGHT }} />
              </div>
              <p className="text-xs uppercase tracking-widest mb-2" style={{ color: ACCENT_LIGHT }}>Average Response</p>
              <p className="text-3xl font-black text-white">Under 90 Min</p>
              <p className="text-sm text-slate-400 mt-2">For emergency calls, most customers see a truck pull up in well under two hours. Standard service same-day.</p>
            </GlassCard>
            <GlassCard className="p-6 text-center">
              <div className="relative w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: ACCENT_GLOW }}>
                <motion.div className="absolute inset-0 rounded-full" style={{ background: ACCENT }} animate={{ scale: [1, 1.6, 1], opacity: [0.4, 0, 0.4] }} transition={{ duration: 2, repeat: Infinity }} />
                <CheckCircle size={26} weight="duotone" style={{ color: ACCENT }} className="relative" />
              </div>
              <p className="text-xs uppercase tracking-widest mb-2" style={{ color: ACCENT_LIGHT }}>Availability</p>
              <p className="text-3xl font-black text-white">Trucks On Road</p>
              <p className="text-sm text-slate-400 mt-2">Live dispatch 24/7, 365 days a year. Holidays, weekends, middle of the night — we answer.</p>
            </GlassCard>
          </div>
          <div className="mt-8">
            <GlassCard className="p-6">
              <p className="text-xs uppercase tracking-widest text-slate-400 mb-3">Cities We Serve</p>
              <div className="flex flex-wrap gap-2">
                {["Downtown", "Northside", "Westbrook", "Summit Hills", "Lakeview", "Riverside", "Eastwood", "Ridgefield", "Pinewood", "Maplewood", "Oakdale", "Fairmont"].map((n, i) => (
                  <span key={i} className="px-3 py-1.5 rounded-full text-xs font-medium text-slate-300" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.08)" }}>{n}</span>
                ))}
              </div>
            </GlassCard>
          </div>
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
                <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ACCENT }}>Ready to Get Started?</p>
                <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white mb-4">Schedule Your Service</h2>
                <p className="text-slate-400 text-lg mb-6 max-w-lg mx-auto">Same-day service available. Call now or book online for a free estimate on repairs and installations.</p>
                <div className="flex flex-wrap justify-center gap-4">
                  <MagneticButton className="px-10 py-4 rounded-full text-base font-semibold text-white inline-flex items-center gap-2 cursor-pointer" style={{ background: ACCENT } as React.CSSProperties}>
                    <CalendarCheck size={20} weight="duotone" /> Book Service
                  </MagneticButton>
                  <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/15 inline-flex items-center gap-2 cursor-pointer">
                    <Phone size={18} weight="duotone" /> (555) 439-2100
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
                <WordReveal text="Your Door Experts Are Here" />
              </h2>
              <p className="text-slate-400 leading-relaxed max-w-md mb-8">
                Whether it is a broken spring at midnight or a brand new installation, we are just a call away. Fast, honest, and affordable.
              </p>
            </div>
            <GlassCard className="p-8">
              <h3 className="text-xl font-semibold text-white mb-6">Contact Us</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <MapPin size={20} weight="duotone" style={{ color: ACCENT }} className="mt-0.5 shrink-0" />
                  <div><p className="text-sm font-semibold text-white">Location</p><p className="text-sm text-slate-400">456 Industrial Blvd, Suite 100<br />Austin, TX 78701</p></div>
                </div>
                <div className="flex items-start gap-4">
                  <Phone size={20} weight="duotone" style={{ color: ACCENT }} className="mt-0.5 shrink-0" />
                  <div><p className="text-sm font-semibold text-white">Phone</p><p className="text-sm text-slate-400">(555) 439-2100</p></div>
                </div>
                <div className="flex items-start gap-4">
                  <Clock size={20} weight="duotone" style={{ color: ACCENT }} className="mt-0.5 shrink-0" />
                  <div><p className="text-sm font-semibold text-white">Hours</p><p className="text-sm text-slate-400">Monday - Friday: 7:00 AM - 7:00 PM<br />Saturday: 8:00 AM - 4:00 PM<br />Emergency: 24/7</p></div>
                </div>
                <div className="flex items-start gap-4">
                  <CheckCircle size={20} weight="duotone" style={{ color: ACCENT }} className="mt-0.5 shrink-0" />
                  <div><p className="text-sm font-semibold text-white">Service Area</p><p className="text-sm text-slate-400">Travis, Williamson &amp; Hays Counties</p></div>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </SectionReveal>

      {/* ─── WARRANTY PROMISE ─── */}
      <SectionReveal className="relative z-10 py-16">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { title: "Lifetime Springs", desc: "Our torsion springs carry a lifetime warranty — for real.", icon: ShieldCheck },
              { title: "10-Year Opener", desc: "Every new opener comes with a 10-year motor warranty.", icon: Medal },
              { title: "15-Year Finish", desc: "Full door installs warranty the paint + finish for 15 years.", icon: Star },
              { title: "No-Surprise Quote", desc: "Quoted price locked in writing before any work starts.", icon: CheckCircle },
            ].map((item, i) => (
              <GlassCard key={i} className="p-5 text-center">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: ACCENT_GLOW }}>
                  <item.icon size={22} weight="duotone" style={{ color: ACCENT_LIGHT }} />
                </div>
                <p className="text-sm font-bold text-white">{item.title}</p>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{item.desc}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ─── MAINTENANCE GUIDE ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ACCENT }}>Protect Your Investment</p>
              <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white mb-6"><WordReveal text="Annual Tune-Up Guide" /></h2>
              <p className="text-slate-400 leading-relaxed mb-8">A professional tune-up once a year catches 90% of problems before they become emergencies. We inspect every moving part and adjust spring tension, track alignment, and opener force.</p>
              <div className="space-y-3">
                {[
                  { label: "Spring Tension Check", desc: "Adjust tension to prevent premature wear and jerky operation." },
                  { label: "Track &amp; Hardware", desc: "Tighten bolts, inspect rollers, and check for bent tracks." },
                  { label: "Opener Safety Test", desc: "Test auto-reverse, safety sensors, and force settings." },
                  { label: "Lubrication &amp; Clean", desc: "Grease bearings, hinges, and rollers with weatherproof lubricant." },
                ].map((step, i) => (
                  <GlassCard key={i} className="p-4 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold" style={{ background: ACCENT_GLOW, color: ACCENT }}>{i + 1}</div>
                    <div>
                      <p className="text-sm font-semibold text-white">{step.label}</p>
                      <p className="text-xs text-slate-400 mt-1">{step.desc}</p>
                    </div>
                  </GlassCard>
                ))}
              </div>
              <p className="mt-6 text-xs text-slate-500">Annual tune-ups: <span className="font-bold" style={{ color: ACCENT_LIGHT }}>$99 flat rate</span>. Includes written condition report.</p>
            </div>
            <div className="relative rounded-2xl overflow-hidden aspect-[4/5]">
              <img src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=900&q=80" alt="Annual garage door tune-up service" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <p className="text-xs uppercase tracking-widest" style={{ color: ACCENT_LIGHT }}>Preventive Maintenance</p>
                <p className="text-xl font-bold text-white mt-1">$99 Annual Tune-Up Special</p>
              </div>
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* ─── EXTENDED FAQ ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4 md:px-6">
          <div className="text-center mb-10">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ACCENT }}>Quick Answers</p>
            <h2 className="text-3xl md:text-4xl tracking-tighter font-bold text-white"><WordReveal text="More Questions, Answered" /></h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { q: "Do you offer weekend or emergency service?", a: "Yes — 24/7 dispatch, every day of the year. Weekend and holiday calls are the same flat rate as weekdays." },
              { q: "What brands of openers do you install?", a: "LiftMaster, Chamberlain, Genie, and Craftsman. All come with MyQ Wi-Fi compatibility and factory warranties." },
              { q: "How long does a spring replacement take?", a: "Most torsion spring replacements complete in under 90 minutes. Double-spring setups take about 2 hours." },
              { q: "Do you warranty your work?", a: "Lifetime warranty on our torsion springs and 10 years on new openers. Full door installs come with 15-year finish warranty." },
            ].map((faq, i) => (
              <GlassCard key={i} className="p-5">
                <p className="text-sm font-bold text-white mb-2">{faq.q}</p>
                <p className="text-sm text-slate-400 leading-relaxed">{faq.a}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ─── FINAL CTA ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <GlassCard className="p-8 md:p-12 text-center">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ACCENT }}>Start Today</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white mb-4">Get Your Garage Door Working Right</h2>
            <p className="text-slate-400 text-lg mb-8 max-w-lg mx-auto">Broken spring, dead opener, or ready for a full upgrade? We dispatch a tech same-day, quote upfront, and stand behind every job.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <MagneticButton className="px-10 py-4 rounded-full text-base font-semibold text-white inline-flex items-center gap-2 cursor-pointer" style={{ background: ACCENT } as React.CSSProperties}>
                <CalendarCheck size={20} weight="duotone" /> Book Service
              </MagneticButton>
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/15 inline-flex items-center gap-2 cursor-pointer">
                <Phone size={18} weight="duotone" /> (555) 439-2100
              </MagneticButton>
            </div>
          </GlassCard>
        </div>
      </SectionReveal>

      {/* ─── 12. FOOTER ─── */}
      <footer className="relative z-10 border-t border-white/8 py-8">
        <div className="mx-auto max-w-7xl px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Garage size={16} weight="duotone" style={{ color: ACCENT }} />
            <span>IronGate Doors &copy; {new Date().getFullYear()}</span>
          </div>
          <p className="text-xs text-slate-600 flex items-center gap-1.5"><svg width="14" height="14" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-sky-500"><path d="M24.3 4.2c-1.5-.4-3.2.1-4.5 1.1-1-.7-2.3-1-3.5-.8-2.4.4-4.2 2.5-4.2 4.9v.6c-3.2.8-6 2.8-7.8 5.6-.3.5-.1 1.1.4 1.4.5.3 1.1.1 1.4-.4 1.5-2.3 3.7-4 6.3-4.7.5-.1 1-.1 1.5 0 .8.2 1.4.8 1.7 1.5.3.8.2 1.6-.2 2.3l-2.8 4.3c-.6.9-.4 2.1.4 2.8l2.5 2.1c.4.3.8.5 1.3.5h5.2c.5 0 1-.2 1.3-.5l1.2-1c.6-.5.8-1.3.6-2l-1-3.2c-.2-.5 0-1.1.4-1.4l3.8-2.5c1.3-.9 2.1-2.3 2.1-3.9V9.6c0-2.5-1.7-4.7-4.1-5.3v-.1z" fill="currentColor"/></svg>Created by <a href="https://bluejayportfolio.com" target="_blank" rel="noopener noreferrer" style={{textDecoration:"underline"}}>bluejayportfolio.com</a></p>
        </div>
      </footer>
    </main>
  );
}
