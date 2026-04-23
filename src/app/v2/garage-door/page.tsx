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

function QuizOption({ opt }: { opt: { label: string; urgency: string; color: string; action: string } }) {
  const [selected, setSelected] = useState(false);
  return (
    <div>
      <button onClick={() => setSelected(!selected)} className="w-full text-left p-4 rounded-xl border transition-all cursor-pointer" style={{ borderColor: selected ? opt.color : "rgba(255,255,255,0.1)", background: selected ? `${opt.color}15` : "rgba(255,255,255,0.03)" }}>
        <p className="text-sm font-semibold text-white mb-1">{opt.label}</p>
        <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: `${opt.color}22`, color: opt.color }}>{opt.urgency}</span>
      </button>
      <AnimatePresence initial={false}>
        {selected && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
            <div className="mt-2 p-3 rounded-xl text-sm text-slate-300 flex items-center justify-between gap-3" style={{ background: "rgba(255,255,255,0.04)", borderLeft: `3px solid ${opt.color}` }}>
              <span>{opt.action}</span>
              <a href="tel:+12064823917" className="shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold text-white" style={{ background: opt.color }}>Call Now</a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/10 flex items-center gap-2 cursor-pointer">
                <Phone size={18} weight="duotone" /> (206) 482-3917
              </MagneticButton>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ ...spring, delay: 1 }} className="flex flex-wrap gap-6 text-sm text-slate-400">
              <span className="flex items-center gap-2"><MapPin size={16} weight="duotone" style={{ color: ACCENT }} />Serving King, Pierce &amp; Snohomish</span>
              <span className="flex items-center gap-2"><Clock size={16} weight="duotone" style={{ color: ACCENT }} />24/7 Emergency Available</span>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ ...spring, delay: 1.1 }} className="flex flex-wrap gap-2">
              {["Licensed & Insured", "Factory Certified", "Free Estimates", "Satisfaction Guaranteed", "Background-Checked Techs"].map((b, i) => (
                <span key={i} className="px-3 py-1 rounded-full text-xs font-medium border" style={{ borderColor: `${ACCENT}55`, color: ACCENT_LIGHT, background: `${ACCENT}15` }}>{b}</span>
              ))}
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ ...spring, delay: 1.2 }} className="flex items-center gap-2 text-sm" style={{ color: ACCENT }}>
              <motion.div className="w-2 h-2 rounded-full bg-green-400" animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
              <span className="text-green-400 font-medium">Techs available now</span>
              <span className="text-slate-500">— Call for immediate dispatch</span>
            </motion.div>
          </div>
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ ...spring, delay: 0.3 }} className="hidden lg:flex items-center justify-center">
            <div className="relative w-full max-w-sm">
              <motion.div className="absolute -inset-8 rounded-full" style={{ background: `radial-gradient(circle, ${ACCENT_GLOW} 0%, transparent 70%)`, filter: "blur(50px)" }} animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} />
              <GlassCard className="p-8 relative z-10">
                <Garage size={48} weight="duotone" style={{ color: ACCENT }} className="mb-6" />
                <div className="space-y-4">
                  {[
                    { label: "Response Time", value: "Under 2 Hours" },
                    { label: "Satisfaction Rate", value: "98.7%" },
                    { label: "Repairs Completed", value: "12,000+" },
                    { label: "Years in Business", value: "15 Years" },
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

      {/* ─── EMERGENCY STRIP ─── */}
      <div className="relative z-10 w-full" style={{ background: ACCENT }}>
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <motion.div className="w-2.5 h-2.5 rounded-full bg-white" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.2, repeat: Infinity }} />
            <span className="text-white text-sm font-semibold">Technicians Available Now — Same-Day Response</span>
          </div>
          <a href="tel:+12064823917" className="text-white font-bold text-sm underline underline-offset-2">(206) 482-3917</a>
        </div>
      </div>

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
              "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&q=80",
              "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&q=80",
              "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=600&q=80",
              "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80",
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

      {/* ─── DOOR TYPES ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ACCENT }}>Installation Options</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter font-bold text-white"><WordReveal text="Doors for Every Home & Budget" /></h2>
          </div>
          <motion.div className="grid grid-cols-2 sm:grid-cols-4 gap-4" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {[
              { type: "Steel", range: "$799–$1,800", note: "Best value, durable, low-maintenance" },
              { type: "Wood", range: "$1,200–$3,500", note: "Classic look, custom paint, premium appeal" },
              { type: "Carriage House", range: "$1,400–$4,000", note: "Curb appeal king, period-correct styling" },
              { type: "Aluminum & Glass", range: "$2,000–$5,500", note: "Modern, frost-resistant, natural light" },
              { type: "Insulated Steel", range: "$1,000–$2,500", note: "Energy savings, quieter, all-weather" },
              { type: "Composite Wood", range: "$1,300–$3,200", note: "Wood look, no warping, rot-proof" },
              { type: "Custom", range: "Call for quote", note: "Any design, material, or size you need" },
              { type: "Commercial", range: "Call for quote", note: "Heavy-duty, high-cycle, industrial rated" },
            ].map((d, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="p-4 h-full">
                  <p className="text-sm font-bold text-white mb-1">{d.type}</p>
                  <p className="text-xs font-semibold mb-2" style={{ color: ACCENT }}>{d.range}</p>
                  <p className="text-xs text-slate-400 leading-relaxed">{d.note}</p>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── SAFETY SECTION ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ACCENT }}>Safety First</p>
              <h2 className="text-4xl md:text-5xl tracking-tighter font-bold text-white mb-6"><WordReveal text="Your Family's Safety Matters" /></h2>
              <p className="text-slate-400 leading-relaxed mb-6">Garage doors are the largest moving part in most homes and cause thousands of injuries annually. A worn spring or misaligned sensor puts your family at risk. Our annual safety inspection covers all critical systems.</p>
              <div className="space-y-3">
                {["Auto-reverse sensor test", "Spring tension and balance check", "Cable and drum inspection", "Opener force calibration", "Safety edge and photo-eye alignment", "Manual release operation test"].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-slate-300">
                    <CheckCircle size={16} weight="fill" style={{ color: ACCENT }} className="shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <GlassCard className="p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: ACCENT_GLOW }}>
                  <Warning size={24} weight="duotone" style={{ color: ACCENT }} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">Warning Signs</h3>
                  <p className="text-sm text-slate-400">Act immediately if you notice any of these</p>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { sign: "Door reverses before hitting the floor", level: "High" },
                  { sign: "Visible gaps in cable or spring", level: "Critical" },
                  { sign: "Door shakes or jerks during operation", level: "High" },
                  { sign: "Grinding noise during movement", level: "Medium" },
                ].map((w, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg" style={{ background: "rgba(255,255,255,0.04)" }}>
                    <span className="text-sm text-slate-300">{w.sign}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${w.level === "Critical" ? "bg-red-500/20 text-red-400" : w.level === "High" ? "bg-amber-500/20 text-amber-400" : "bg-yellow-500/20 text-yellow-400"}`}>{w.level}</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        </div>
      </SectionReveal>

      {/* ─── OUR PROMISE ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ACCENT }}>Our Commitment</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter font-bold text-white"><WordReveal text="The IronGate Promise" /></h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: ShieldCheck, title: "Honest Diagnosis First", desc: "We show you the problem before we fix it. Photos, explanation, and an itemized quote — before a single tool comes out. No pressure, no surprises." },
              { icon: Medal, title: "Work Guaranteed or Free", desc: "Every repair is backed by our labor warranty. If something we fix fails within 12 months, we come back and make it right at zero cost to you." },
              { icon: Users, title: "Techs You Can Trust", desc: "Every IronGate technician is background-checked, uniformed, and factory-trained. We treat your home like our own — shoes off at the door, workspace cleaned before we leave." },
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

      {/* ─── 7. TESTIMONIALS ─── */}
      <SectionReveal id="testimonials" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ACCENT }}>Customer Reviews</p>
            <div className="flex justify-center mb-6">
              <div className="inline-flex items-center gap-3 px-5 py-3 rounded-full border" style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)" }}>
                <div className="flex">{[...Array(5)].map((_, i) => <Star key={i} size={16} weight="fill" className="text-yellow-400" />)}</div>
                <span className="text-white font-bold">4.9</span>
                <span className="text-slate-400 text-sm">· 284 Google reviews</span>
                <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" fill="none"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              </div>
            </div>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="What Our Customers Say" />
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

      {/* ─── 8. COMPARISON TABLE ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ACCENT }}>Why Choose Us</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="IronGate vs. The Competition" />
            </h2>
          </div>
          <GlassCard className="overflow-hidden">
            <div className="grid grid-cols-3 text-sm font-semibold border-b border-white/10">
              <div className="p-4 text-slate-400">Feature</div>
              <div className="p-4 text-center text-white" style={{ background: `${ACCENT}22` }}>IronGate Doors</div>
              <div className="p-4 text-center text-slate-500">Other Companies</div>
            </div>
            {[
              ["Same-Day Service", "✓ Guaranteed", "Sometimes"],
              ["Upfront Pricing", "✓ Always", "Varies"],
              ["24/7 Emergency", "✓ Yes", "No"],
              ["Factory Certified", "✓ All Brands", "Limited"],
              ["Background-Checked Techs", "✓ Every Tech", "Not always"],
              ["Written Warranty", "✓ Parts & Labor", "Parts only"],
              ["Locally Owned", "✓ 15+ Years Local", "Often franchises"],
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

      {/* ─── 9. PRICING ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ACCENT }}>Transparent Pricing</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Upfront, No-Surprise Quotes" />
            </h2>
          </div>
          <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {[
              { tier: "Service Call", price: "$79", note: "Applied to any repair", features: ["Diagnosis included", "Upfront quote", "No hidden fees", "Same-day available"] },
              { tier: "Spring Replacement", price: "$189", note: "Most common repair", features: ["Torsion or extension", "Premium springs", "1-year warranty", "Tech balances door"], highlight: true },
              { tier: "New Door Install", price: "From $799", note: "Installed & ready", features: ["All major brands", "Removal included", "Opener available", "Full warranty"] },
            ].map((plan, i) => (
              <motion.div key={i} variants={fadeUp}>
                {plan.highlight ? (
                  <ShimmerBorder>
                    <div className="p-6 h-full flex flex-col">
                      <div className="text-xs uppercase tracking-widest mb-2" style={{ color: ACCENT }}>Most Popular</div>
                      <p className="text-lg font-bold text-white mb-1">{plan.tier}</p>
                      <p className="text-3xl font-black text-white mb-1">{plan.price}</p>
                      <p className="text-xs text-slate-400 mb-4">{plan.note}</p>
                      <ul className="space-y-2 flex-1">{plan.features.map((f, j) => (<li key={j} className="flex items-center gap-2 text-sm text-slate-300"><CheckCircle size={14} weight="fill" style={{ color: ACCENT }} />{f}</li>))}</ul>
                      <MagneticButton className="mt-6 w-full py-3 rounded-full text-sm font-semibold text-white cursor-pointer" style={{ background: ACCENT } as React.CSSProperties}>Book Now</MagneticButton>
                    </div>
                  </ShimmerBorder>
                ) : (
                  <GlassCard className="p-6 h-full flex flex-col">
                    <p className="text-lg font-bold text-white mb-1">{plan.tier}</p>
                    <p className="text-3xl font-black text-white mb-1">{plan.price}</p>
                    <p className="text-xs text-slate-400 mb-4">{plan.note}</p>
                    <ul className="space-y-2 flex-1">{plan.features.map((f, j) => (<li key={j} className="flex items-center gap-2 text-sm text-slate-300"><CheckCircle size={14} weight="fill" style={{ color: ACCENT }} />{f}</li>))}</ul>
                    <MagneticButton className="mt-6 w-full py-3 rounded-full text-sm font-semibold text-white border border-white/10 cursor-pointer">Get Quote</MagneticButton>
                  </GlassCard>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── 10. VIDEO ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-4 md:px-6">
          <div className="text-center mb-10">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ACCENT }}>See Our Work</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Watch Us In Action" />
            </h2>
          </div>
          <div className="relative rounded-2xl overflow-hidden aspect-video cursor-pointer group">
            <img src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&q=80" alt="Garage door installation crew" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <motion.div whileHover={{ scale: 1.1 }} transition={spring} className="flex flex-col items-center gap-4">
                <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: ACCENT }}>
                  <svg viewBox="0 0 24 24" fill="white" className="w-8 h-8 ml-1"><path d="M8 5v14l11-7z"/></svg>
                </div>
                <span className="text-white font-semibold text-lg">Installation Process Tour</span>
              </motion.div>
            </div>
            <motion.div className="absolute inset-0 rounded-2xl border-2 pointer-events-none" style={{ borderColor: ACCENT }} animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ duration: 2, repeat: Infinity }} />
          </div>
        </div>
      </SectionReveal>

      {/* ─── 11. QUIZ ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-4 md:px-6">
          <div className="text-center mb-10">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ACCENT }}>Quick Diagnosis</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="What Does Your Door Need?" />
            </h2>
          </div>
          <GlassCard className="p-6 md:p-8">
            <p className="text-slate-400 text-center mb-6">Select the issue closest to what you are experiencing:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { label: "Door won't open or close", urgency: "Emergency", color: "#ef4444", action: "Call now — this needs same-day service." },
                { label: "Loud grinding / banging noise", urgency: "Urgent", color: ACCENT, action: "Schedule this week before more damage occurs." },
                { label: "Door moves slowly or unevenly", urgency: "Schedule Soon", color: "#22c55e", action: "Book a tune-up — likely a balance or roller issue." },
                { label: "Looking to upgrade / replace", urgency: "No Rush", color: "#3b82f6", action: "Request a free in-home estimate and style consult." },
              ].map((opt, i) => (
                <QuizOption key={i} opt={opt} />
              ))}
            </div>
          </GlassCard>
        </div>
      </SectionReveal>

      {/* ─── 12. BRANDS CARRIED ─── */}
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

      {/* ─── MAINTENANCE PLAN ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-4 md:px-6">
          <ShimmerBorder>
            <div className="p-8 md:p-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                <div>
                  <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ACCENT }}>Annual Plan</p>
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Protect Your Investment</h2>
                  <p className="text-slate-400 leading-relaxed mb-6">Most garage door problems are preventable. Our annual maintenance plan keeps your door running safely year-round and catches issues before they become costly repairs.</p>
                  <ul className="space-y-2">
                    {["Full safety inspection", "Lubrication of all moving parts", "Hardware tightening & adjustment", "10% discount on any repairs needed", "Priority scheduling — moved to front of line"].map((f, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-slate-300">
                        <CheckCircle size={14} weight="fill" style={{ color: ACCENT }} />{f}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="text-center">
                  <p className="text-6xl font-black text-white mb-2">$129</p>
                  <p className="text-slate-400 mb-6">per year, per door</p>
                  <MagneticButton className="px-10 py-4 rounded-full text-base font-semibold text-white cursor-pointer" style={{ background: ACCENT } as React.CSSProperties}>
                    Sign Up for Annual Plan
                  </MagneticButton>
                  <p className="text-xs text-slate-500 mt-3">30-day cancellation policy. No contracts. Includes one free service call per year.</p>
                </div>
              </div>
            </div>
          </ShimmerBorder>
        </div>
      </SectionReveal>

      {/* ─── CERTIFICATIONS ─── */}
      <SectionReveal className="relative z-10 py-12">
        <div className="mx-auto max-w-5xl px-4 md:px-6">
          <div className="text-center mb-8">
            <p className="text-sm uppercase tracking-widest" style={{ color: ACCENT }}>Our Credentials</p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {["LiftMaster Certified", "Clopay Authorized", "IDA Member", "BBB Accredited", "Licensed WA #GD-2047", "OSHA Compliant", "Bonded & Insured", "Satisfaction Guaranteed"].map((cert, i) => (
              <motion.span key={i} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ ...spring, delay: i * 0.05 }}
                className="px-4 py-2 rounded-full text-sm font-medium border" style={{ borderColor: `${ACCENT}44`, color: ACCENT_LIGHT, background: `${ACCENT}10` }}>
                {cert}
              </motion.span>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ─── SERVICE AREA ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ACCENT }}>Coverage</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter font-bold text-white"><WordReveal text="We Come to You" /></h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { area: "Seattle", time: "Under 60 min", status: "Available Now" },
              { area: "Bellevue", time: "Under 60 min", status: "Available Now" },
              { area: "Tacoma", time: "Under 90 min", status: "Available Now" },
              { area: "Everett", time: "Under 90 min", status: "Available Now" },
            ].map((area, i) => (
              <GlassCard key={i} className="p-5 text-center">
                <p className="text-base font-bold text-white mb-1">{area.area}</p>
                <p className="text-xs text-slate-400 mb-2">{area.time}</p>
                <div className="flex items-center justify-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  <span className="text-xs text-green-400">{area.status}</span>
                </div>
              </GlassCard>
            ))}
          </div>
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
                  <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/10 inline-flex items-center gap-2 cursor-pointer">
                    <Phone size={18} weight="duotone" /> (206) 482-3917
                  </MagneticButton>
                </div>
              </motion.div>
            </div>
          </ShimmerBorder>
        </div>
      </SectionReveal>

      {/* ─── CONTACT FORM ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4 md:px-6">
          <div className="text-center mb-10">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ACCENT }}>Free Quote</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter font-bold text-white"><WordReveal text="Request a Service Quote" /></h2>
          </div>
          <GlassCard className="p-6 md:p-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-slate-400 mb-2">Your Name</label>
                  <input type="text" placeholder="John Smith" className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 border border-white/10 outline-none focus:border-amber-500/50 transition-colors" style={{ background: "rgba(255,255,255,0.04)" }} />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-slate-400 mb-2">Phone Number</label>
                  <input type="tel" placeholder="(206) 555-0100" className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 border border-white/10 outline-none focus:border-amber-500/50 transition-colors" style={{ background: "rgba(255,255,255,0.04)" }} />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-slate-400 mb-2">Service Type</label>
                  <select className="w-full rounded-xl px-4 py-3 text-sm text-white border border-white/10 outline-none" style={{ background: "#1f1a0f" }}>
                    <option>Spring Replacement</option>
                    <option>Door Repair</option>
                    <option>New Installation</option>
                    <option>Opener Service</option>
                    <option>Emergency Repair</option>
                  </select>
                </div>
              </div>
              <div className="space-y-4">
                <div className="h-full flex flex-col">
                  <label className="block text-xs uppercase tracking-widest text-slate-400 mb-2">Describe the Issue</label>
                  <textarea rows={5} placeholder="Tell us what's happening with your door..." className="flex-1 w-full rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 border border-white/10 outline-none focus:border-amber-500/50 transition-colors resize-none" style={{ background: "rgba(255,255,255,0.04)" }} />
                </div>
              </div>
            </div>
            <div className="mt-6 flex flex-col sm:flex-row items-center gap-4">
              <MagneticButton className="w-full sm:w-auto px-10 py-4 rounded-full text-base font-semibold text-white cursor-pointer" style={{ background: ACCENT } as React.CSSProperties}>
                Request Quote <ArrowRight size={18} weight="bold" className="inline ml-1" />
              </MagneticButton>
              <p className="text-xs text-slate-500">We respond within 30 minutes during business hours. Emergency calls answered 24/7.</p>
            </div>
          </GlassCard>
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
                  <div><p className="text-sm font-semibold text-white">Location</p><p className="text-sm text-slate-400">8219 Rainier Ave S, Suite 101<br />Seattle, WA 98118</p></div>
                </div>
                <div className="flex items-start gap-4">
                  <Phone size={20} weight="duotone" style={{ color: ACCENT }} className="mt-0.5 shrink-0" />
                  <div><p className="text-sm font-semibold text-white">Phone</p><p className="text-sm text-slate-400">(206) 482-3917</p></div>
                </div>
                <div className="flex items-start gap-4">
                  <Clock size={20} weight="duotone" style={{ color: ACCENT }} className="mt-0.5 shrink-0" />
                  <div><p className="text-sm font-semibold text-white">Hours</p><p className="text-sm text-slate-400">Monday - Friday: 7:00 AM - 7:00 PM<br />Saturday: 8:00 AM - 4:00 PM<br />Emergency: 24/7</p></div>
                </div>
                <div className="flex items-start gap-4">
                  <CheckCircle size={20} weight="duotone" style={{ color: ACCENT }} className="mt-0.5 shrink-0" />
                  <div><p className="text-sm font-semibold text-white">Service Area</p><p className="text-sm text-slate-400">King, Pierce &amp; Snohomish Counties</p></div>
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
            <Garage size={16} weight="duotone" style={{ color: ACCENT }} />
            <span>IronGate Doors &copy; {new Date().getFullYear()}</span>
            <span className="text-slate-700">·</span>
            <span>Licensed WA #GD-2047</span>
          </div>
          <p className="text-xs text-slate-600 flex items-center gap-1.5"><svg width="14" height="14" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-sky-500"><path d="M24.3 4.2c-1.5-.4-3.2.1-4.5 1.1-1-.7-2.3-1-3.5-.8-2.4.4-4.2 2.5-4.2 4.9v.6c-3.2.8-6 2.8-7.8 5.6-.3.5-.1 1.1.4 1.4.5.3 1.1.1 1.4-.4 1.5-2.3 3.7-4 6.3-4.7.5-.1 1-.1 1.5 0 .8.2 1.4.8 1.7 1.5.3.8.2 1.6-.2 2.3l-2.8 4.3c-.6.9-.4 2.1.4 2.8l2.5 2.1c.4.3.8.5 1.3.5h5.2c.5 0 1-.2 1.3-.5l1.2-1c.6-.5.8-1.3.6-2l-1-3.2c-.2-.5 0-1.1.4-1.4l3.8-2.5c1.3-.9 2.1-2.3 2.1-3.9V9.6c0-2.5-1.7-4.7-4.1-5.3v-.1z" fill="currentColor"/></svg>Created by <a href="https://bluejayportfolio.com" target="_blank" rel="noopener noreferrer" style={{textDecoration:"underline"}}>bluejayportfolio.com</a></p>
        </div>
      </footer>
    </main>
  );
}
