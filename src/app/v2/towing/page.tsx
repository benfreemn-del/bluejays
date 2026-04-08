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
  Truck,
  Car,
  Motorcycle,
  Warning,
  Wrench,
  Path,
  CalendarCheck,
  Users,
  Timer,
  Medal,
  Certificate,
  Siren,
  MapTrifold,
  CheckCircle,
  Lightning,
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
const BG = "#1a0f0f";
const ACCENT = "#ef4444";
const ACCENT_LIGHT = "#f87171";
const ACCENT_GLOW = "rgba(239, 68, 68, 0.15)";

/* ───────────────────────── TOW TRUCK NAV ICON ───────────────────────── */
function TowTruckIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect x="2" y="14" width="18" height="10" rx="2" stroke={ACCENT} strokeWidth="2" />
      <path d="M20 18H26L30 22V24H20V18Z" stroke={ACCENT_LIGHT} strokeWidth="2" strokeLinejoin="round" />
      <circle cx="8" cy="26" r="2.5" stroke={ACCENT_LIGHT} strokeWidth="1.5" />
      <circle cx="25" cy="26" r="2.5" stroke={ACCENT_LIGHT} strokeWidth="1.5" />
      <path d="M6 14L10 6H16" stroke={ACCENT} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="10" y1="6" x2="10" y2="14" stroke={ACCENT} strokeWidth="1.5" />
    </svg>
  );
}

/* ───────────────────────── EMERGENCY PULSE PARTICLES ───────────────────────── */
function EmergencyParticles() {
  const particles = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 8,
    duration: 6 + Math.random() * 5,
    size: 2 + Math.random() * 3,
    opacity: 0.08 + Math.random() * 0.2,
    isBlue: i % 3 === 0,
  }));

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden hidden md:block">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{ left: `${p.x}%`, width: p.size, height: p.size, background: p.isBlue ? "#3b82f6" : ACCENT_LIGHT, willChange: "transform, opacity" }}
          animate={{ y: ["-5vh", "110vh"], opacity: [0, p.opacity, p.opacity, 0] }}
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
      <motion.div className="absolute inset-0 rounded-2xl" style={{ background: `conic-gradient(from 0deg, transparent, ${ACCENT}, transparent, #3b82f6, transparent)`, willChange: "transform" }} animate={{ rotate: [0, 360] }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} />
      <div className="relative rounded-2xl z-10" style={{ background: BG }}>{children}</div>
    </div>
  );
}

/* ───────────────────────── DATA ───────────────────────── */
const services = [
  { title: "Roadside Assistance", description: "Flat tires, dead batteries, fuel delivery, and lockouts. We handle the most common roadside emergencies fast so you can get back on the road without a tow.", icon: Wrench },
  { title: "Standard Towing", description: "Safe, reliable towing for sedans, SUVs, and pickups. Our wheel-lift and dolly systems protect your vehicle during transport to any destination you choose.", icon: Car },
  { title: "Flatbed Towing", description: "The safest option for luxury, lowered, AWD, and damaged vehicles. Your car rides on top of the truck, completely off the ground, eliminating any risk of further damage.", icon: Truck },
  { title: "Motorcycle Towing", description: "Specialized motorcycle towing with soft straps and wheel chocks. We handle sport bikes, cruisers, and trikes with the care they deserve.", icon: Motorcycle },
  { title: "Accident Recovery", description: "Post-accident vehicle recovery including winch-outs, roll-overs, and ditch extractions. We work with law enforcement and insurance companies to clear the scene safely.", icon: Warning },
  { title: "Long Distance", description: "Interstate and cross-country vehicle transport on enclosed or open flatbeds. Fully insured door-to-door service with GPS tracking so you always know where your vehicle is.", icon: Path },
];

const testimonials = [
  { name: "Chris D.", text: "Blew a tire on the highway at 11 PM. They were there in under 20 minutes and had me on my way. Professional, fast, and the driver was incredibly friendly.", rating: 5 },
  { name: "Maria S.", text: "My car was totaled in an accident and they handled the recovery with such care. They dealt with the insurance and police on-site. Took so much stress off me.", rating: 5 },
  { name: "Brandon T.", text: "Needed my classic car moved across state. They used an enclosed flatbed and it arrived in perfect condition. Fair price and great communication the entire way.", rating: 5 },
];

const coverageAreas = [
  "Downtown Core", "North Highway Corridor", "South Interstate", "East Industrial", "West Suburbs", "Airport Area", "University District", "Waterfront",
];

const faqData = [
  { q: "How fast can you get to me?", a: "Our average response time is 15-30 minutes within our primary service area. Highway calls are often faster due to our strategically positioned units." },
  { q: "Do you tow all vehicle types?", a: "Yes. We tow cars, trucks, SUVs, motorcycles, RVs, and light commercial vehicles. For heavy-duty equipment, we have specialized rigs available on request." },
  { q: "Will my vehicle be damaged during towing?", a: "No. We use modern equipment designed to protect your vehicle. Flatbed towing keeps your car completely off the ground. All tows are fully insured." },
  { q: "Do you work with insurance companies?", a: "Absolutely. We work with all major insurance providers and can bill them directly for covered towing and roadside services. We also accept AAA." },
  { q: "What if I do not know where to have my car towed?", a: "We can recommend trusted repair shops in the area. If you need time to decide, we can store your vehicle securely at our yard until you are ready." },
  { q: "Is there a charge if I just need a jump start?", a: "We offer competitive flat rates for roadside services like jump starts, tire changes, and fuel delivery. No hidden fees — the price quoted on the phone is the price you pay." },
];

/* ═══════════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════════ */
export default function V2TowingPage() {
  const [openService, setOpenService] = useState<number | null>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden" style={{ background: BG, color: "#f1f5f9" }}>
      <EmergencyParticles />

      {/* ─── NAV ─── */}
      <motion.nav initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-4">
          <GlassCard className="flex items-center justify-between px-4 md:px-6 py-3">
            <div className="flex items-center gap-2">
              <TowTruckIcon size={26} />
              <span className="text-lg font-bold tracking-tight text-white">Rapid Rescue Towing</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
              <a href="#services" className="hover:text-white transition-colors">Services</a>
              <a href="#emergency" className="hover:text-white transition-colors">Emergency</a>
              <a href="#coverage" className="hover:text-white transition-colors">Coverage</a>
              <a href="#testimonials" className="hover:text-white transition-colors">Reviews</a>
            </div>
            <div className="flex items-center gap-3">
              <MagneticButton className="px-4 md:px-5 py-2 rounded-full text-sm font-semibold text-white transition-colors" style={{ background: ACCENT } as React.CSSProperties}>
                Call Now
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
                  {[{ label: "Services", href: "#services" }, { label: "Emergency", href: "#emergency" }, { label: "Coverage", href: "#coverage" }, { label: "Reviews", href: "#testimonials" }].map((link) => (
                    <a key={link.label} href={link.href} onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors">{link.label}</a>
                  ))}
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.nav>

      {/* ─── 1. HERO (with urgency) ─── */}
      <section className="relative min-h-[100dvh] flex items-center pt-24 z-10">
        <div className="absolute inset-0 z-0">
          <img src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1600&q=80" alt="" className="w-full h-full object-cover object-center" />
          <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${BG}f2 0%, ${BG}dd 50%, ${BG}bb 100%)` }} />
        </div>
        {/* Pulsing emergency bar */}
        <motion.div className="absolute top-0 left-0 right-0 h-1 z-20" style={{ background: ACCENT }} animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />

        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div>
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ ...spring, delay: 0.1 }} className="flex items-center gap-2 mb-4">
                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1, repeat: Infinity }}>
                  <Siren size={20} weight="duotone" style={{ color: ACCENT }} />
                </motion.div>
                <span className="text-sm uppercase tracking-widest font-bold" style={{ color: ACCENT }}>24/7 Emergency Towing</span>
              </motion.div>
              <h1 className="text-3xl md:text-6xl tracking-tighter leading-none font-bold text-white" style={{ textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>
                <WordReveal text="Stranded? Help Is Minutes Away." />
              </h1>
            </div>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.6 }} className="text-lg text-slate-300 max-w-md leading-relaxed">
              Fast, professional towing and roadside assistance when you need it most. We dispatch the nearest truck to your location immediately. No waiting, no hassle.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.8 }} className="flex flex-wrap gap-4">
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white flex items-center gap-2 cursor-pointer" style={{ background: ACCENT } as React.CSSProperties}>
                <Lightning size={18} weight="fill" /> Request Tow Now
              </MagneticButton>
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/10 flex items-center gap-2 cursor-pointer">
                <Phone size={18} weight="duotone" /> (555) 911-TOWS
              </MagneticButton>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ ...spring, delay: 1 }} className="flex flex-wrap gap-6 text-sm text-slate-400">
              <span className="flex items-center gap-2"><Timer size={16} weight="duotone" style={{ color: ACCENT }} />15-30 Min ETA</span>
              <span className="flex items-center gap-2"><Clock size={16} weight="duotone" style={{ color: ACCENT }} />24/7/365 Dispatch</span>
            </motion.div>
          </div>
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ ...spring, delay: 0.3 }} className="hidden lg:flex items-center justify-center">
            <div className="relative">
              <motion.div className="absolute inset-0 rounded-full" style={{ background: `radial-gradient(circle, ${ACCENT_GLOW} 0%, transparent 70%)`, filter: "blur(40px)" }} animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} />
              <Truck size={200} weight="duotone" style={{ color: ACCENT }} className="relative z-10" />
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
                { icon: Star, label: "4.8 Star Rating", desc: "800+ reviews" },
                { icon: Timer, label: "15-30 Min", desc: "Average response" },
                { icon: Certificate, label: "Fully Insured", desc: "Licensed fleet" },
                { icon: Medal, label: "20+ Years", desc: "On the road" },
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
              <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ACCENT }}>Our Services</p>
              <h2 className="text-3xl md:text-6xl tracking-tighter leading-none font-bold text-white mb-6">
                <WordReveal text="Towing & Roadside Solutions" />
              </h2>
              <p className="text-slate-400 leading-relaxed max-w-md">
                From a simple jump start to a cross-country transport, our fleet of modern trucks and trained operators handle every situation with speed and care.
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

      {/* ─── 4. 24/7 EMERGENCY CTA ─── */}
      <SectionReveal id="emergency" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4 md:px-6">
          <ShimmerBorder>
            <div className="p-8 md:p-12 text-center relative overflow-hidden">
              {/* Pulsing background glow */}
              <motion.div className="absolute inset-0" style={{ background: `radial-gradient(circle at center, ${ACCENT_GLOW} 0%, transparent 60%)` }} animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 2, repeat: Infinity }} />
              <motion.div className="relative z-10" initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={spring}>
                <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="inline-block mb-4">
                  <Siren size={56} weight="duotone" style={{ color: ACCENT }} />
                </motion.div>
                <p className="text-sm uppercase tracking-widest mb-3 font-bold" style={{ color: ACCENT }}>Emergency? Do Not Wait.</p>
                <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white mb-4">Dispatch a Truck Now</h2>
                <p className="text-slate-400 text-lg mb-6 max-w-lg mx-auto">
                  Stranded on the highway? Involved in an accident? Locked out? One call and we dispatch the nearest truck to your exact GPS location.
                </p>
                <MagneticButton className="px-12 py-5 rounded-full text-lg font-bold text-white inline-flex items-center gap-3 cursor-pointer" style={{ background: ACCENT } as React.CSSProperties}>
                  <Phone size={24} weight="fill" /> (555) 911-TOWS
                </MagneticButton>
              </motion.div>
            </div>
          </ShimmerBorder>
        </div>
      </SectionReveal>

      {/* ─── 5. ABOUT ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ACCENT }}>About Rapid Rescue</p>
              <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white mb-6">
                <WordReveal text="20 Years of Roadside Rescue" />
              </h2>
              <p className="text-slate-400 leading-relaxed mb-6">
                Rapid Rescue Towing started with a single truck and a commitment to fast, honest service. Today, our fleet of 25+ trucks covers the entire metro area and beyond, responding to thousands of calls each year.
              </p>
              <p className="text-slate-400 leading-relaxed">
                Every driver is CDL licensed, background-checked, and trained in vehicle recovery and roadside safety. We work with all major insurance companies and motor clubs.
              </p>
            </div>
            <motion.div className="grid grid-cols-2 gap-4" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
              {[
                { icon: ShieldCheck, label: "Fully Insured", desc: "Comprehensive coverage" },
                { icon: Users, label: "25+ Trucks", desc: "Metro-wide fleet" },
                { icon: Timer, label: "Fast Dispatch", desc: "GPS-tracked units" },
                { icon: Certificate, label: "CDL Licensed", desc: "Professional drivers" },
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

      {/* ─── 6. COVERAGE MAP / AREAS ─── */}
      <SectionReveal id="coverage" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ACCENT }}>Coverage Area</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white mb-4">
              <WordReveal text="Where We Operate" />
            </h2>
            <p className="text-slate-400 max-w-lg mx-auto">Our trucks are strategically positioned throughout the region for the fastest possible response times.</p>
          </div>
          <motion.div className="grid grid-cols-2 sm:grid-cols-4 gap-4" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {coverageAreas.map((area, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="p-4 text-center">
                  <MapTrifold size={20} weight="duotone" style={{ color: ACCENT }} className="mx-auto mb-2" />
                  <p className="text-sm font-semibold text-white">{area}</p>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
          <p className="text-center text-sm text-slate-400 mt-6">
            <CheckCircle size={16} weight="duotone" style={{ color: ACCENT }} className="inline mr-1 -mt-0.5" />
            Long-distance towing available statewide and beyond
          </p>
        </div>
      </SectionReveal>

      {/* ─── 7. TESTIMONIALS ─── */}
      <SectionReveal id="testimonials" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ACCENT }}>Customer Stories</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Trusted on the Road" />
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

      {/* ─── 8. FAQ ─── */}
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

      {/* ─── 9. CONTACT ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white mb-6">
                <WordReveal text="Need a Tow? Call Right Now." />
              </h2>
              <p className="text-slate-400 leading-relaxed max-w-md mb-8">
                Do not wait on the side of the road. One call dispatches the nearest truck to your location. We handle the rest.
              </p>
              <div className="flex flex-wrap gap-4">
                <MagneticButton className="px-10 py-4 rounded-full text-base font-semibold text-white inline-flex items-center gap-2 cursor-pointer" style={{ background: ACCENT } as React.CSSProperties}>
                  <Phone size={20} weight="fill" /> Emergency Call
                </MagneticButton>
                <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/10 flex items-center gap-2 cursor-pointer">
                  <CalendarCheck size={18} weight="duotone" /> Schedule Ahead
                </MagneticButton>
              </div>
            </div>
            <GlassCard className="p-8">
              <h3 className="text-xl font-semibold text-white mb-6">Dispatch Center</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <MapPin size={20} weight="duotone" style={{ color: ACCENT }} className="mt-0.5 shrink-0" />
                  <div><p className="text-sm font-semibold text-white">Headquarters</p><p className="text-sm text-slate-400">321 Rescue Blvd<br />Phoenix, AZ 85001</p></div>
                </div>
                <div className="flex items-start gap-4">
                  <Phone size={20} weight="duotone" style={{ color: ACCENT }} className="mt-0.5 shrink-0" />
                  <div><p className="text-sm font-semibold text-white">Dispatch Line</p><p className="text-sm text-slate-400">(555) 911-TOWS (8697)</p></div>
                </div>
                <div className="flex items-start gap-4">
                  <Clock size={20} weight="duotone" style={{ color: ACCENT }} className="mt-0.5 shrink-0" />
                  <div><p className="text-sm font-semibold text-white">Availability</p><p className="text-sm text-slate-400">Emergency: 24/7/365<br />Office: Mon-Fri 8am-6pm</p></div>
                </div>
                <div className="flex items-start gap-4">
                  <Warning size={20} weight="duotone" style={{ color: ACCENT }} className="mt-0.5 shrink-0" />
                  <div><p className="text-sm font-semibold text-white">Accident?</p><p className="text-sm text-slate-400">Call 911 first, then call us.<br />We coordinate with emergency services.</p></div>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </SectionReveal>

      {/* ─── 10. FOOTER ─── */}
      <footer className="relative z-10 border-t border-white/5 py-8">
        <div className="mx-auto max-w-7xl px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Truck size={16} weight="duotone" style={{ color: ACCENT }} />
            <span>Rapid Rescue Towing &copy; {new Date().getFullYear()}</span>
          </div>
          <p className="text-xs text-slate-600">Website created by Bluejay Business Solutions</p>
        </div>
      </footer>
    </main>
  );
}
