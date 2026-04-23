"use client";

/* eslint-disable @next/next/no-img-element -- Static marketing showcase uses plain img tags intentionally. */
/* eslint-disable react-hooks/purity -- Decorative particle values are intentionally randomized for visual effects. */

import { useState, useRef, useCallback, useEffect } from "react";
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
  Timer,
  Users,
  CurrencyDollar,
  Gauge,
  Play,
  Envelope,
  Warning,
  Trophy,
  HandCoins,
  Scales,
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
const BG = "#111111";
const ACCENT = "#f97316";
const ACCENT_LIGHT = "#fdba74";
const STEEL = "#64748b";
const STEEL_LIGHT = "#94a3b8";
const ACCENT_GLOW = "rgba(249, 115, 22, 0.15)";
const STEEL_GLOW = "rgba(100, 116, 139, 0.12)";

/* ───────────────────────── WRENCH SVG LOGO ───────────────────────── */
function LogoIcon({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect x="4" y="12" width="24" height="8" rx="2" fill={ACCENT} opacity="0.2" />
      <path d="M8 14L14 8L18 12L24 6" stroke={ACCENT} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="24" cy="6" r="3" fill={ACCENT} opacity="0.4" />
      <circle cx="24" cy="6" r="1.5" fill={ACCENT} />
      <path d="M6 20L12 26" stroke={STEEL_LIGHT} strokeWidth="2" strokeLinecap="round" />
      <path d="M12 20L18 26" stroke={STEEL_LIGHT} strokeWidth="2" strokeLinecap="round" />
      <path d="M18 20L24 26" stroke={ACCENT_LIGHT} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/* ───────────────────────── BOLT GRID PATTERN ───────────────────────── */
function BoltGrid() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden hidden md:block opacity-[0.03]">
      <svg width="100%" height="100%">
        <defs>
          <pattern id="bolt-grid" width="80" height="80" patternUnits="userSpaceOnUse">
            <path d="M40 10L36 25H44L40 40" fill="none" stroke={ACCENT_LIGHT} strokeWidth="0.6" />
            <circle cx="40" cy="10" r="1.5" fill={ACCENT} opacity="0.6" />
            <path d="M10 40H30M50 40H70" fill="none" stroke={STEEL} strokeWidth="0.4" />
            <path d="M40 50V70" fill="none" stroke={STEEL} strokeWidth="0.4" />
            <rect x="38" y="68" width="4" height="4" rx="1" fill={STEEL} opacity="0.3" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#bolt-grid)" />
      </svg>
    </div>
  );
}

/* ───────────────────────── FLOATING SPARKS ───────────────────────── */
function FloatingSparks() {
  const sparks = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 12,
    duration: 14 + Math.random() * 10,
    size: 1 + Math.random() * 2.5,
    opacity: 0.08 + Math.random() * 0.18,
  }));

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden hidden md:block">
      {sparks.map((s) => (
        <motion.div
          key={s.id}
          className="absolute rounded-full"
          style={{ left: `${s.x}%`, width: s.size, height: s.size, background: ACCENT_LIGHT, willChange: "transform, opacity" }}
          animate={{ y: ["110vh", "-10vh"], opacity: [0, s.opacity, s.opacity, 0] }}
          transition={{
            y: { duration: s.duration, repeat: Infinity, delay: s.delay, ease: "linear" },
            opacity: { duration: s.duration, repeat: Infinity, delay: s.delay, times: [0, 0.1, 0.9, 1] },
          }}
        />
      ))}
    </div>
  );
}

/* ───────────────────────── SHARED COMPONENTS ───────────────────────── */
function SectionReveal({ children, className = "", id, style }: { children: React.ReactNode; className?: string; id?: string; style?: React.CSSProperties }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.section ref={ref} id={id} className={className} style={style} initial={{ opacity: 0, y: 50 }} animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }} transition={spring}>
      {children}
    </motion.section>
  );
}

function GlassCard({ children, className = "", style, id, onClick, href }: { children: React.ReactNode; className?: string; style?: React.CSSProperties; id?: string; onClick?: () => void; href?: string }) {
  if (href) {
    return (
      <a href={href} id={id} onClick={onClick} className={`rounded-2xl border border-white/15 bg-white/[0.07] backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)] ${className}`} style={style}>
        {children}
      </a>
    );
  }
  return (
    <div id={id} onClick={onClick} className={`rounded-2xl border border-white/15 bg-white/[0.07] backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)] ${className}`} style={style}>
      {children}
    </div>
  );
}

function MagneticButton({ children, className = "", onClick, href, style }: { children: React.ReactNode; className?: string; onClick?: () => void; href?: string; style?: React.CSSProperties }) {
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

  if (href) {
    return (
      <motion.a ref={ref as unknown as React.Ref<HTMLAnchorElement>} href={href} style={{ x: springX, y: springY, willChange: "transform", ...style } as React.CSSProperties} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} className={className}>
        {children}
      </motion.a>
    );
  }

  return (
    <motion.button ref={ref} style={{ x: springX, y: springY, willChange: "transform", ...style }} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} onClick={onClick} className={className} whileTap={{ scale: 0.97 }}>
      {children}
    </motion.button>
  );
}

function ShimmerBorder({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative rounded-2xl p-[1px] overflow-hidden ${className}`}>
      <motion.div className="absolute inset-0 rounded-2xl" style={{ background: `conic-gradient(from 0deg, transparent, ${ACCENT}, transparent, ${STEEL_LIGHT}, transparent)`, willChange: "transform" }} animate={{ rotate: [0, 360] }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} />
      <div className="relative rounded-2xl z-10" style={{ background: BG }}>{children}</div>
    </div>
  );
}

function SectionHeader({ label, title, accent, subtitle }: { label: string; title: string; accent: string; subtitle?: string }) {
  return (
    <div className="text-center mb-16">
      <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-4" style={{ background: ACCENT_GLOW, color: ACCENT_LIGHT }}>{label}</span>
      <h2 className="text-3xl md:text-5xl font-extrabold text-white">
        {title} <span style={{ color: ACCENT }}>{accent}</span>
      </h2>
      {subtitle && <p className="mt-4 text-lg max-w-2xl mx-auto" style={{ color: STEEL_LIGHT }}>{subtitle}</p>}
    </div>
  );
}

/* ───────────────────────── ANIMATED COUNTER HOOK ───────────────────────── */
function useCounter(target: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const startTime = performance.now();
    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      start = Math.floor(eased * target);
      setCount(start);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [isInView, target, duration]);

  return { count, ref };
}

/* ───────────────────────── DATA ───────────────────────── */
const SERVICES = [
  { title: "Washer Repair", desc: "Front-load, top-load, and stackable washers. We fix drainage failures, spin cycle issues, leaks, and error codes for every major brand.", icon: Drop },
  { title: "Dryer Repair", desc: "Gas and electric dryers that won't heat, tumble, or vent properly. We diagnose thermal fuses, heating elements, and motor problems fast.", icon: Fire },
  { title: "Refrigerator Repair", desc: "Cooling failures, ice buildup, compressor issues, and water leaks. We save your food and your appliance with same-day diagnostics.", icon: Snowflake },
  { title: "Dishwasher Repair", desc: "Units that won't drain, clean, or start. We handle pump failures, spray arm blockages, door latch issues, and electronic control faults.", icon: Lightning },
  { title: "Oven & Range Repair", desc: "Gas igniters, electric elements, faulty thermostats, and self-clean malfunctions. We restore your cooking power quickly and safely.", icon: Thermometer },
  { title: "Microwave Repair", desc: "Built-in and over-the-range units. Magnetron failures, turntable problems, control board issues, and door switch replacements.", icon: Gear },
  { title: "Ice Maker Repair", desc: "Standalone and built-in ice makers. Water line blockages, freezing failures, slow production, and mechanical jams diagnosed on-site.", icon: Gauge },
  { title: "Garbage Disposal Repair", desc: "Jammed, leaking, or humming disposals. We clear obstructions, replace worn components, and install new units when repair isn't viable.", icon: Wrench },
];

const BRANDS = [
  "Samsung", "LG", "Whirlpool", "GE", "Bosch", "Sub-Zero", "Viking", "KitchenAid",
];

const PRICING = [
  { tier: "Diagnostic Visit", price: "$89", desc: "Complete inspection and diagnosis. Waived if you proceed with repair.", badge: "Most Popular", highlight: false },
  { tier: "Standard Repair", price: "$149–$249", desc: "Common fixes: thermostats, pumps, belts, igniters, door latches, and switches.", badge: null, highlight: true },
  { tier: "Major Repair", price: "$249–$349", desc: "Compressors, control boards, motors, and sealed-system work on premium brands.", badge: null, highlight: false },
];

const TESTIMONIALS = [
  { name: "Rachel Kim", text: "Steve came out within two hours of my call. My fridge compressor was failing and he had the part on his truck. Fixed the same afternoon. This guy is the real deal.", rating: 5, appliance: "Refrigerator" },
  { name: "Derek & Amy Hollis", text: "Our Samsung washer was throwing error codes nonstop. ProFix diagnosed a faulty control board, ordered the exact OEM part, and installed it two days later. Runs perfectly now.", rating: 5, appliance: "Washer" },
  { name: "Margaret Liu", text: "I called three companies before ProFix. The others wanted to charge me just to show up. Steve's $89 diagnostic was waived once I approved the repair. Honest and fair.", rating: 5, appliance: "Dishwasher" },
  { name: "Tom Briggs", text: "My Viking range wasn't heating evenly. Steve identified a cracked igniter in under fifteen minutes. He had a replacement in stock and I was cooking dinner that night.", rating: 5, appliance: "Oven" },
];

const COMPARISON_ROWS = [
  { feature: "Same-Day Service", us: true, them: "2-5 Days" },
  { feature: "Upfront Pricing", us: true, them: "Hidden Fees" },
  { feature: "EPA Certified Techs", us: true, them: "Varies" },
  { feature: "Factory-Trained", us: true, them: "Sometimes" },
  { feature: "90-Day Parts Warranty", us: true, them: "30 Days" },
  { feature: "Evening Appointments", us: true, them: "No" },
  { feature: "Free Follow-Up", us: true, them: "Extra Charge" },
];

const CERTIFICATIONS = [
  "EPA Certified", "Factory Trained", "Licensed & Insured", "Background Checked", "BBB A+ Rated", "90-Day Warranty",
];

const HERO_STATS = [
  { value: "15,000+", label: "Appliances Fixed" },
  { value: "98%", label: "Same-Day Service" },
  { value: "4.9", label: "Star Rating" },
  { value: "15", label: "Years Experience" },
];

const QUIZ_OPTIONS = [
  { label: "Not Cooling / Heating", icon: Snowflake, severity: "urgent", desc: "Food or comfort at risk. We prioritize these calls." },
  { label: "Strange Noises", icon: Warning, severity: "moderate", desc: "Mechanical issue developing. Best to catch it early." },
  { label: "Won't Start / No Power", icon: Lightning, severity: "urgent", desc: "Could be electrical or control board. We diagnose on-site." },
  { label: "Leaking Water", icon: Drop, severity: "moderate", desc: "Water damage risk. Schedule today to avoid costly cleanup." },
];

const FINANCING_TIERS = [
  { name: "Quick Fix", monthly: "$25/mo", total: "For repairs under $200", icon: Wrench },
  { name: "Standard Plan", monthly: "$45/mo", total: "For repairs $200-$349", icon: Gear },
  { name: "Premium Service", monthly: "$65/mo", total: "For major repairs $349+", icon: Trophy },
];

/* ───────────────────────── MAIN COMPONENT ───────────────────────── */
export default function V2ApplianceRepairPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeStatIndex, setActiveStatIndex] = useState(0);
  const [quizChoice, setQuizChoice] = useState<number | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  /* cycle hero stats */
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStatIndex((prev) => (prev + 1) % HERO_STATS.length);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  const counterData = useCounter(15000, 2200);

  return (
    <main className="min-h-screen selection:bg-orange-500/30 selection:text-orange-200" style={{ backgroundColor: BG, color: "#f8fafc" }}>
      <BoltGrid />
      <FloatingSparks />

      {/* ═══════════════════ 1. STICKY NAVIGATION ═══════════════════ */}
      <motion.nav initial={{ y: -100 }} animate={{ y: 0 }} transition={spring} className="fixed top-0 left-0 right-0 z-50 px-4 py-4 md:px-6 md:py-5 pointer-events-none">
        <div className="mx-auto max-w-7xl">
          <GlassCard className="pointer-events-auto flex items-center justify-between px-6 py-3.5">
            <div className="flex items-center gap-3">
              <LogoIcon size={28} />
              <span className="text-xl font-bold tracking-tight text-white">ProFix</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              {["Services", "Pricing", "About", "Reviews", "Contact"].map((item) => (
                <a key={item} href={`#${item.toLowerCase()}`} className="text-sm font-medium text-slate-300 hover:text-white transition-colors">{item}</a>
              ))}
            </div>
            <div className="hidden md:flex items-center gap-4">
              <a href="tel:2065550519" className="text-sm font-semibold flex items-center gap-2" style={{ color: ACCENT_LIGHT }}>
                <Phone size={16} weight="duotone" /> (206) 555-0519
              </a>
              <MagneticButton className="px-5 py-2.5 rounded-full text-sm font-semibold text-white cursor-pointer" style={{ background: ACCENT }}>
                Book Repair
              </MagneticButton>
            </div>
            {/* mobile burger */}
            <button className="md:hidden text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X size={24} /> : <List size={24} />}
            </button>
          </GlassCard>
        </div>
      </motion.nav>

      {/* mobile menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="fixed inset-x-0 top-[76px] z-40 px-4">
            <GlassCard className="p-6 flex flex-col gap-4">
              {["Services", "Pricing", "About", "Reviews", "Contact"].map((item) => (
                <a key={item} href={`#${item.toLowerCase()}`} onClick={() => setIsMenuOpen(false)} className="text-base font-medium text-slate-200 hover:text-white transition-colors">{item}</a>
              ))}
              <a href="tel:2065550519" className="text-base font-semibold flex items-center gap-2 mt-2" style={{ color: ACCENT }}>
                <Phone size={18} weight="duotone" /> (206) 555-0519
              </a>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════ 2. HERO #19 — COUNTER STAT HERO ═══════════════════ */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center text-center px-4 pt-28 pb-16 overflow-hidden">
        {/* radial glow */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 60% 40% at 50% 45%, ${ACCENT_GLOW}, transparent 70%)` }} />

        {/* subtle top line decoration */}
        <motion.div className="absolute top-32 left-1/2 -translate-x-1/2 w-px h-24" style={{ background: `linear-gradient(to bottom, transparent, ${STEEL}, transparent)` }} initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ duration: 1.2, delay: 0.3 }} />

        <div className="relative z-10 max-w-4xl mx-auto">
          {/* cycling stat counter */}
          <div className="relative mb-8" ref={counterData.ref}>
            <AnimatePresence mode="wait">
              <motion.div key={activeStatIndex} initial={{ opacity: 0, y: 30, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -30, scale: 0.95 }} transition={{ duration: 0.5 }}>
                <div className="text-7xl sm:text-8xl md:text-9xl font-black tracking-tight" style={{ color: ACCENT, textShadow: `0 0 80px ${ACCENT_GLOW}` }}>
                  {HERO_STATS[activeStatIndex].value}
                </div>
                <div className="text-xl md:text-2xl font-medium tracking-wide uppercase mt-2" style={{ color: STEEL_LIGHT }}>
                  {HERO_STATS[activeStatIndex].label}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* stat dots indicator */}
          <div className="flex items-center justify-center gap-2.5 mb-10">
            {HERO_STATS.map((_, i) => (
              <button key={i} onClick={() => setActiveStatIndex(i)} className="w-2.5 h-2.5 rounded-full transition-all duration-300 cursor-pointer" style={{ background: i === activeStatIndex ? ACCENT : STEEL, transform: i === activeStatIndex ? "scale(1.3)" : "scale(1)" }} />
            ))}
          </div>

          {/* same-day badge */}
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6 }} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border mb-10" style={{ borderColor: `${ACCENT}44`, background: `${ACCENT}15` }}>
            <motion.span className="w-2.5 h-2.5 rounded-full" style={{ background: ACCENT }} animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
            <span className="text-sm font-bold tracking-wide uppercase" style={{ color: ACCENT_LIGHT }}>Same-Day Service Available</span>
          </motion.div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight mb-5">
            Same-Day Appliance Repair. <span style={{ color: ACCENT }}>Guaranteed.</span>
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10" style={{ color: STEEL_LIGHT }}>
            Steve Park and the ProFix team have been keeping Seattle&apos;s kitchens and laundry rooms running for 15 years. EPA certified. Factory trained. One call, one fix.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <MagneticButton href="tel:2065550519" className="px-8 py-4 rounded-full text-lg font-bold text-white flex items-center gap-3 cursor-pointer" style={{ background: ACCENT }}>
              <Phone size={22} weight="bold" /> Call Now
            </MagneticButton>
            <MagneticButton href="#services" className="px-8 py-4 rounded-full text-lg font-bold border-2 flex items-center gap-3 cursor-pointer" style={{ borderColor: STEEL, color: STEEL_LIGHT }}>
              View Services <ArrowRight size={20} />
            </MagneticButton>
          </div>
        </div>

        {/* trust badges row */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }} className="flex flex-wrap items-center justify-center gap-3 mt-14">
          {["EPA Certified", "4.9 Stars", "15 Years", "Same-Day"].map((badge) => (
            <span key={badge} className="px-4 py-2 rounded-full text-xs font-bold tracking-wide uppercase border" style={{ borderColor: `${STEEL}55`, color: STEEL_LIGHT, background: `${STEEL}15` }}>
              {badge}
            </span>
          ))}
        </motion.div>
      </section>

      {/* ═══════════════════ 2.5. EMERGENCY URGENCY STRIP ═══════════════════ */}
      <div className="relative z-10 py-5 px-4" style={{ background: `linear-gradient(90deg, ${ACCENT}18, ${ACCENT}08, ${ACCENT}18)`, borderTop: `1px solid ${ACCENT}22`, borderBottom: `1px solid ${ACCENT}22` }}>
        <div className="mx-auto max-w-5xl flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-10 text-center">
          <div className="flex items-center gap-2">
            <motion.div animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }} transition={{ duration: 1.2, repeat: Infinity }} className="w-2.5 h-2.5 rounded-full" style={{ background: "#22c55e" }} />
            <span className="text-sm font-bold" style={{ color: "#22c55e" }}>Techs Available Now</span>
          </div>
          <div className="flex items-center gap-2">
            <Timer size={16} weight="bold" style={{ color: ACCENT_LIGHT }} />
            <span className="text-sm font-semibold" style={{ color: STEEL_LIGHT }}>Average Response: <span className="text-white font-bold">Under 2 Hours</span></span>
          </div>
          <div className="flex items-center gap-2">
            <Phone size={16} weight="bold" style={{ color: ACCENT_LIGHT }} />
            <a href="tel:2065550519" className="text-sm font-bold" style={{ color: ACCENT }}>(206) 555-0519</a>
          </div>
        </div>
      </div>

      {/* ═══════════════════ 3. SERVICES ═══════════════════ */}
      <SectionReveal id="services" className="relative z-10 py-24 px-4">
        <div className="mx-auto max-w-7xl">
          <SectionHeader label="Our Expertise" title="8 Appliances." accent="One Call." subtitle="From washers to garbage disposals, our factory-trained technicians diagnose and repair every major household appliance." />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {SERVICES.map((svc, i) => {
              const Icon = svc.icon;
              return (
                <GlassCard key={i} className="p-6 group hover:border-orange-500/30 transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: ACCENT_GLOW }}>
                    <Icon size={26} weight="duotone" style={{ color: ACCENT }} />
                  </div>
                  <div className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: STEEL }}>0{i + 1}</div>
                  <h3 className="text-lg font-bold text-white mb-2">{svc.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: STEEL_LIGHT }}>{svc.desc}</p>
                </GlassCard>
              );
            })}
          </div>
        </div>
      </SectionReveal>

      {/* ═══════════════════ 4. SAME-DAY GUARANTEE ═══════════════════ */}
      <SectionReveal className="relative z-10 py-24 px-4">
        <div className="mx-auto max-w-5xl">
          <ShimmerBorder>
            <div className="p-10 md:p-16 text-center">
              <motion.div animate={{ scale: [1, 1.15, 1], opacity: [1, 0.7, 1] }} transition={{ duration: 2, repeat: Infinity }} className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ background: ACCENT_GLOW }}>
                <Timer size={32} weight="duotone" style={{ color: ACCENT }} />
              </motion.div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
                Same-Day Service <span style={{ color: ACCENT }}>Guarantee</span>
              </h2>
              <p className="text-lg max-w-2xl mx-auto mb-8" style={{ color: STEEL_LIGHT }}>
                Call before noon and we guarantee a technician at your door the same day. If we can&apos;t make it, your diagnostic fee is on us. No excuses, no reschedules, no runaround.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[
                  { stat: "< 2 hrs", label: "Average Response" },
                  { stat: "98%", label: "Same-Day Rate" },
                  { stat: "$0", label: "If We're Late" },
                ].map((item, i) => (
                  <div key={i} className="text-center">
                    <div className="text-3xl font-black" style={{ color: ACCENT }}>{item.stat}</div>
                    <div className="text-sm mt-1" style={{ color: STEEL_LIGHT }}>{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </ShimmerBorder>
        </div>
      </SectionReveal>

      {/* ═══════════════════ 4.5. STAT COUNTER STRIP ═══════════════════ */}
      <SectionReveal className="relative z-10 py-16 px-4">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: "15,000+", label: "Appliances Repaired", icon: Wrench },
              { value: "98%", label: "First-Visit Fix Rate", icon: CheckCircle },
              { value: "4.9", label: "Google Star Rating", icon: Star },
              { value: "287", label: "Verified Reviews", icon: Users },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="text-center p-6 rounded-2xl" style={{ background: `${STEEL}08`, border: `1px solid ${STEEL}15` }}>
                  <Icon size={28} weight="duotone" style={{ color: ACCENT }} className="mx-auto mb-3" />
                  <div className="text-3xl md:text-4xl font-black mb-1" style={{ color: ACCENT }}>{stat.value}</div>
                  <div className="text-xs font-medium uppercase tracking-wider" style={{ color: STEEL_LIGHT }}>{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </SectionReveal>

      {/* ═══════════════════ 5. UPFRONT PRICING ═══════════════════ */}
      <SectionReveal id="pricing" className="relative z-10 py-24 px-4">
        <div className="mx-auto max-w-7xl">
          <SectionHeader label="Transparent Pricing" title="No Surprises." accent="Ever." subtitle="Our flat-rate pricing means you know the cost before we start. The $89 diagnostic is waived when you approve the repair." />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {PRICING.map((tier, i) => (
              <div key={i} className={`relative rounded-2xl p-8 text-center transition-all duration-300 ${tier.highlight ? "scale-105 border-2" : "border border-white/15"}`} style={{ background: tier.highlight ? `linear-gradient(135deg, ${BG}, #1a1a1a)` : `${BG}`, borderColor: tier.highlight ? ACCENT : undefined }}>
                {tier.badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold text-white" style={{ background: ACCENT }}>{tier.badge}</span>
                )}
                <h3 className="text-lg font-bold text-white mt-2 mb-3">{tier.tier}</h3>
                <div className="text-4xl font-black mb-4" style={{ color: ACCENT }}>{tier.price}</div>
                <p className="text-sm" style={{ color: STEEL_LIGHT }}>{tier.desc}</p>
              </div>
            ))}
          </div>
          <p className="text-center mt-8 text-sm" style={{ color: STEEL }}>All prices include parts and labor. 90-day warranty on every repair.</p>
        </div>
      </SectionReveal>

      {/* ═══════════════════ 6. BRANDS WE SERVICE ═══════════════════ */}
      <SectionReveal className="relative z-10 py-24 px-4" style={{ background: `linear-gradient(180deg, transparent, ${STEEL_GLOW}, transparent)` }}>
        <div className="mx-auto max-w-6xl">
          <SectionHeader label="All Major Brands" title="Factory Trained on" accent="Your Brand." subtitle="Our technicians hold factory certifications and carry OEM parts for the most popular appliance manufacturers." />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
            {BRANDS.map((brand, i) => (
              <GlassCard key={i} className="p-6 text-center hover:border-orange-500/30 transition-all duration-300">
                <div className="text-xl font-bold text-white mb-1">{brand}</div>
                <div className="text-xs font-medium uppercase tracking-wider" style={{ color: STEEL }}>Authorized Service</div>
              </GlassCard>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ═══════════════════ 7. REPAIR PROCESS ═══════════════════ */}
      <SectionReveal className="relative z-10 py-24 px-4">
        <div className="mx-auto max-w-6xl">
          <SectionHeader label="How It Works" title="4 Steps to a" accent="Working Appliance" subtitle="No runaround. No hidden fees. Just a straightforward process from first call to finished repair." />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: "01", title: "Call ProFix", desc: "Describe the problem over the phone. We'll give you a time window — usually the same day.", icon: Phone },
              { step: "02", title: "We Diagnose", desc: "Our tech inspects the appliance on-site and tells you exactly what's wrong and what it costs. No surprises.", icon: Gauge },
              { step: "03", title: "We Repair", desc: "Most fixes happen in one visit. We carry the most common OEM parts on every truck for fast turnarounds.", icon: Wrench },
              { step: "04", title: "We Guarantee", desc: "Every repair is backed by a 90-day parts warranty and 30-day labor warranty. If it breaks again, we come back free.", icon: ShieldCheck },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="relative">
                  {/* connector line */}
                  {i < 3 && (
                    <div className="hidden md:block absolute top-10 left-full w-full h-px z-0" style={{ background: `linear-gradient(to right, ${ACCENT}44, transparent)` }} />
                  )}
                  <div className="relative z-10">
                    <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5 mx-auto md:mx-0" style={{ background: `linear-gradient(135deg, ${ACCENT}20, ${ACCENT}08)`, border: `1px solid ${ACCENT}33` }}>
                      <Icon size={32} weight="duotone" style={{ color: ACCENT }} />
                    </div>
                    <div className="text-xs font-black tracking-widest uppercase mb-2 text-center md:text-left" style={{ color: ACCENT }}>Step {item.step}</div>
                    <h3 className="text-xl font-bold text-white mb-2 text-center md:text-left">{item.title}</h3>
                    <p className="text-sm leading-relaxed text-center md:text-left" style={{ color: STEEL_LIGHT }}>{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </SectionReveal>

      {/* ═══════════════════ 8. OWNER SPOTLIGHT ═══════════════════ */}
      <SectionReveal id="about" className="relative z-10 py-24 px-4">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-6" style={{ background: ACCENT_GLOW, color: ACCENT_LIGHT }}>Meet Your Tech</span>
              <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6">
                Steve Park. <span style={{ color: ACCENT }}>15 Years.</span>
              </h2>
              <p className="text-lg leading-relaxed mb-6" style={{ color: STEEL_LIGHT }}>
                Steve founded ProFix Appliance Repair in Seattle&apos;s Greenwood neighborhood because he was tired of watching big-box repair chains overcharge his neighbors. Fifteen years, three EPA certifications, and thousands of house calls later, the mission is the same: fix it right, fix it fast, charge a fair price.
              </p>
              <p className="text-base leading-relaxed mb-8" style={{ color: STEEL }}>
                Every technician on the ProFix team is factory-trained, background-checked, and carries the most common OEM parts on their truck so the majority of repairs happen in one visit.
              </p>
              <div className="flex flex-wrap gap-3">
                {["EPA Certified", "Factory Trained", "15 Years Experience"].map((badge) => (
                  <span key={badge} className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border" style={{ borderColor: `${ACCENT}44`, color: ACCENT_LIGHT, background: `${ACCENT}10` }}>
                    <Certificate size={16} weight="duotone" style={{ color: ACCENT }} /> {badge}
                  </span>
                ))}
              </div>
            </div>
            <div className="relative">
              <GlassCard className="p-8 md:p-10">
                <div className="text-center">
                  <div className="w-28 h-28 rounded-full mx-auto mb-6 flex items-center justify-center text-5xl font-black" style={{ background: `linear-gradient(135deg, ${ACCENT}, #ea580c)`, color: "white" }}>
                    SP
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-1">Steve Park</h3>
                  <p className="text-sm mb-6" style={{ color: STEEL }}>Owner & Lead Technician</p>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { val: "15,000+", lbl: "Repairs" },
                      { val: "15 yrs", lbl: "Experience" },
                      { val: "4.9", lbl: "Google Rating" },
                      { val: "98%", lbl: "Same-Day" },
                    ].map((s, i) => (
                      <div key={i} className="p-3 rounded-xl" style={{ background: `${STEEL}15` }}>
                        <div className="text-xl font-black" style={{ color: ACCENT }}>{s.val}</div>
                        <div className="text-xs" style={{ color: STEEL_LIGHT }}>{s.lbl}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </GlassCard>
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* ═══════════════════ 8. "WHAT'S BROKEN?" QUIZ ═══════════════════ */}
      <SectionReveal className="relative z-10 py-24 px-4">
        <div className="mx-auto max-w-4xl">
          <SectionHeader label="Quick Diagnosis" title="What's" accent="Broken?" subtitle="Select the symptom that best describes your appliance problem and we'll prioritize your call." />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {QUIZ_OPTIONS.map((opt, i) => {
              const Icon = opt.icon;
              const isSelected = quizChoice === i;
              return (
                <button key={i} onClick={() => setQuizChoice(i)} className={`text-left p-6 rounded-2xl border-2 transition-all duration-300 cursor-pointer ${isSelected ? "scale-[1.02]" : "hover:scale-[1.01]"}`} style={{ borderColor: isSelected ? ACCENT : `${STEEL}33`, background: isSelected ? `${ACCENT}10` : `${STEEL}08` }}>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: isSelected ? ACCENT_GLOW : `${STEEL}20` }}>
                      <Icon size={24} weight="duotone" style={{ color: isSelected ? ACCENT : STEEL_LIGHT }} />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-white mb-1">{opt.label}</h4>
                      <p className="text-sm" style={{ color: STEEL_LIGHT }}>{opt.desc}</p>
                      {isSelected && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-3">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase ${opt.severity === "urgent" ? "bg-red-500/20 text-red-400" : "bg-yellow-500/20 text-yellow-400"}`}>
                            {opt.severity === "urgent" ? "Priority Response" : "Schedule Today"}
                          </span>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          {quizChoice !== null && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center mt-8">
              <MagneticButton href="tel:2065550519" className="px-8 py-4 rounded-full text-lg font-bold text-white inline-flex items-center gap-3 cursor-pointer" style={{ background: ACCENT }}>
                <Phone size={22} weight="bold" /> Call ProFix Now
              </MagneticButton>
            </motion.div>
          )}
        </div>
      </SectionReveal>

      {/* ═══════════════════ 9.5. HONEST REPAIR PROMISE ═══════════════════ */}
      <SectionReveal className="relative z-10 py-24 px-4" style={{ background: `linear-gradient(180deg, transparent, ${STEEL_GLOW}, transparent)` }}>
        <div className="mx-auto max-w-6xl">
          <SectionHeader label="Our Promise" title="The Honest" accent="Mechanic Guarantee" subtitle="We built ProFix on trust. Here's what that means in practice." />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "We Show the Problem", desc: "Before we fix anything, we show you exactly what's wrong. Photos, explanations, no jargon. You understand it, then you decide.", icon: Gauge },
              { title: "Upfront Pricing", desc: "You get the full cost before we start. No hourly rates that balloon. No 'oh, we found another issue' surprises at the end.", icon: CurrencyDollar },
              { title: "No Upselling", desc: "If your appliance only needs a $30 part, we'll say so. We'll never push a $300 repair when a simple fix does the job.", icon: HandCoins },
              { title: "Replace Honestly", desc: "If repair costs more than 50% of a new unit, we'll tell you to replace it. We lose the sale, but you save money. That's the deal.", icon: Scales },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <GlassCard key={i} className="p-6">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: `${STEEL}20` }}>
                    <Icon size={26} weight="duotone" style={{ color: STEEL_LIGHT }} />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: STEEL_LIGHT }}>{item.desc}</p>
                </GlassCard>
              );
            })}
          </div>
        </div>
      </SectionReveal>

      {/* ═══════════════════ 10. COMPETITOR COMPARISON ═══════════════════ */}
      <SectionReveal className="relative z-10 py-24 px-4" style={{ background: `linear-gradient(180deg, transparent, ${ACCENT_GLOW}, transparent)` }}>
        <div className="mx-auto max-w-4xl">
          <SectionHeader label="Why ProFix" title="ProFix vs." accent="Big-Box Repair" subtitle="The chains send a stranger with a clipboard. We send Steve with a truck full of parts." />
          <GlassCard className="overflow-hidden">
            <div className="grid grid-cols-3 text-center py-4 px-6 border-b border-white/15">
              <div className="text-sm font-bold" style={{ color: STEEL_LIGHT }}>Feature</div>
              <div className="text-sm font-bold" style={{ color: ACCENT }}>ProFix</div>
              <div className="text-sm font-bold" style={{ color: STEEL }}>Big-Box</div>
            </div>
            {COMPARISON_ROWS.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 text-center py-4 px-6 ${i < COMPARISON_ROWS.length - 1 ? "border-b border-white/8" : ""}`}>
                <div className="text-sm text-left font-medium text-white">{row.feature}</div>
                <div>
                  <CheckCircle size={22} weight="fill" style={{ color: "#22c55e" }} className="mx-auto" />
                </div>
                <div className="text-sm" style={{ color: STEEL }}>{row.them}</div>
              </div>
            ))}
          </GlassCard>
        </div>
      </SectionReveal>

      {/* ═══════════════════ 10. GOOGLE REVIEWS HEADER + TESTIMONIALS ═══════════════════ */}
      <SectionReveal id="reviews" className="relative z-10 py-24 px-4">
        <div className="mx-auto max-w-7xl">
          {/* Google Reviews summary */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-1.5 mb-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={24} weight="fill" style={{ color: "#facc15" }} />
              ))}
            </div>
            <p className="text-lg font-semibold text-white">4.9 out of 5 <span style={{ color: STEEL_LIGHT }}>based on 287 Google reviews</span></p>
          </div>
          <SectionHeader label="Real Reviews" title="Seattle Trusts" accent="ProFix." />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {TESTIMONIALS.map((t, i) => (
              <GlassCard key={i} className="p-8 hover:border-orange-500/20 transition-all duration-300">
                <div className="flex items-center gap-1.5 mb-3">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} size={18} weight="fill" style={{ color: "#facc15" }} />
                  ))}
                </div>
                <Quotes size={28} weight="fill" style={{ color: `${ACCENT}40` }} className="mb-3" />
                <p className="text-base leading-relaxed mb-5" style={{ color: STEEL_LIGHT }}>{t.text}</p>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-white">{t.name}</div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <CheckCircle size={14} weight="fill" style={{ color: "#22c55e" }} />
                      <span className="text-xs" style={{ color: STEEL }}>Verified Customer</span>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: `${ACCENT}15`, color: ACCENT_LIGHT }}>{t.appliance}</span>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ═══════════════════ 11. FINANCING ═══════════════════ */}
      <SectionReveal className="relative z-10 py-24 px-4">
        <div className="mx-auto max-w-5xl">
          <SectionHeader label="Flexible Payment" title="Fix Now." accent="Pay Later." subtitle="We offer financing on repairs over $149 so a broken appliance doesn't break your budget." />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FINANCING_TIERS.map((tier, i) => {
              const Icon = tier.icon;
              return (
                <GlassCard key={i} className="p-8 text-center hover:border-orange-500/30 transition-all duration-300">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ background: ACCENT_GLOW }}>
                    <Icon size={28} weight="duotone" style={{ color: ACCENT }} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{tier.name}</h3>
                  <div className="text-3xl font-black mb-2" style={{ color: ACCENT }}>{tier.monthly}</div>
                  <p className="text-sm" style={{ color: STEEL_LIGHT }}>{tier.total}</p>
                </GlassCard>
              );
            })}
          </div>
          <p className="text-center text-sm mt-6" style={{ color: STEEL }}>0% interest for 6 months on approved credit. No prepayment penalty.</p>
        </div>
      </SectionReveal>

      {/* ═══════════════════ 12. COMMON ISSUES / EDUCATION ═══════════════════ */}
      <SectionReveal className="relative z-10 py-24 px-4" style={{ background: `linear-gradient(180deg, transparent, ${ACCENT_GLOW}, transparent)` }}>
        <div className="mx-auto max-w-6xl">
          <SectionHeader label="Know the Signs" title="When to Call a" accent="Professional" subtitle="Some problems get worse fast. Here are the warning signs that mean you should pick up the phone today." />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { title: "Fridge Running Constantly", desc: "If your refrigerator never cycles off, the compressor, condenser coils, or thermostat may be failing. Running nonstop burns energy and wears out the motor.", icon: Snowflake, urgency: "High" },
              { title: "Washer Vibrating Violently", desc: "Excessive shaking during spin cycles usually means worn shock absorbers or an unbalanced drum. Left unchecked, it can damage the floor and surrounding cabinetry.", icon: Drop, urgency: "Medium" },
              { title: "Gas Smell from Range", desc: "A faint gas odor near your stove could be a loose connection or a cracked valve. Don't ignore it. Call immediately and open a window while you wait.", icon: Fire, urgency: "Critical" },
              { title: "Dishwasher Not Draining", desc: "Standing water at the bottom of your dishwasher is usually a clogged drain hose, bad pump, or blocked air gap. Easy fix if caught early, expensive if it overflows.", icon: Lightning, urgency: "Medium" },
              { title: "Dryer Takes Multiple Cycles", desc: "If clothes are still damp after a full cycle, the heating element, thermal fuse, or vent may be blocked. This is also a fire hazard from lint buildup.", icon: Fire, urgency: "High" },
              { title: "Ice Maker Leaking", desc: "Water pooling under your fridge usually points to a cracked water line or defective inlet valve. Water damage to flooring adds up fast.", icon: Gauge, urgency: "Medium" },
            ].map((issue, i) => {
              const Icon = issue.icon;
              const urgencyColor = issue.urgency === "Critical" ? "#ef4444" : issue.urgency === "High" ? ACCENT : "#eab308";
              return (
                <GlassCard key={i} className="p-6 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${urgencyColor}15` }}>
                    <Icon size={24} weight="duotone" style={{ color: urgencyColor }} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-bold text-white">{issue.title}</h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase" style={{ background: `${urgencyColor}20`, color: urgencyColor }}>{issue.urgency}</span>
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: STEEL_LIGHT }}>{issue.desc}</p>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        </div>
      </SectionReveal>

      {/* ═══════════════════ 13. VIDEO PLACEHOLDER ═══════════════════ */}
      <SectionReveal className="relative z-10 py-24 px-4" style={{ background: `linear-gradient(180deg, transparent, ${STEEL_GLOW}, transparent)` }}>
        <div className="mx-auto max-w-4xl">
          <SectionHeader label="See Our Work" title="Watch ProFix" accent="In Action" />
          <div className="relative rounded-2xl overflow-hidden aspect-video cursor-pointer group" style={{ background: `linear-gradient(135deg, #1a1a1a, #222)` }}>
            <img
              src="https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=900&q=80"
              alt="Appliance repair technician at work"
              className="w-full h-full object-cover opacity-60 group-hover:opacity-70 transition-opacity duration-300"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300" style={{ background: ACCENT }}>
                <Play size={36} weight="fill" className="text-white ml-1" />
              </div>
            </div>
            <div className="absolute bottom-6 left-6">
              <div className="text-lg font-bold text-white">Behind the Service Call</div>
              <div className="text-sm" style={{ color: STEEL_LIGHT }}>See how Steve diagnoses and repairs in a single visit</div>
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* ═══════════════════ 14. NEIGHBORHOODS WE SERVE ═══════════════════ */}
      <SectionReveal className="relative z-10 py-24 px-4">
        <div className="mx-auto max-w-6xl">
          <SectionHeader label="Local Experts" title="Your Neighborhood" accent="Repair Team" subtitle="Steve and the ProFix crew know Seattle inside and out. We've made house calls in every corner of the city." />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              "Greenwood", "Ballard", "Fremont", "Wallingford",
              "Phinney Ridge", "Ravenna", "University District", "Roosevelt",
              "Shoreline", "Lake City", "Northgate", "Maple Leaf",
              "Green Lake", "Wedgwood", "Sand Point", "Laurelhurst",
            ].map((hood, i) => (
              <div key={i} className="px-5 py-3.5 rounded-xl text-center border transition-all duration-300 hover:border-orange-500/30" style={{ borderColor: `${STEEL}22`, background: `${STEEL}08` }}>
                <div className="text-sm font-semibold text-white">{hood}</div>
                <div className="text-xs mt-0.5" style={{ color: STEEL }}>Same-Day Available</div>
              </div>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ═══════════════════ 15. CERTIFICATIONS BADGE ROW ═══════════════════ */}
      <SectionReveal className="relative z-10 py-20 px-4">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-extrabold text-white">Credentials That <span style={{ color: ACCENT }}>Matter</span></h2>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {CERTIFICATIONS.map((cert, i) => (
              <span key={i} className="flex items-center gap-2 px-5 py-3 rounded-full text-sm font-bold border" style={{ borderColor: `${ACCENT}33`, color: ACCENT_LIGHT, background: `${ACCENT}08` }}>
                <ShieldCheck size={18} weight="duotone" style={{ color: ACCENT }} />
                {cert}
              </span>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ═══════════════════ 14. SERVICE AREA ═══════════════════ */}
      <SectionReveal className="relative z-10 py-24 px-4">
        <div className="mx-auto max-w-5xl">
          <SectionHeader label="Coverage" title="Serving All of" accent="Greater Seattle" subtitle="From Greenwood to Ballard, Fremont to Shoreline, and everywhere in between." />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <GlassCard className="p-8 text-center">
              <MapPin size={32} weight="duotone" style={{ color: ACCENT }} className="mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Coverage Area</h3>
              <p className="text-sm" style={{ color: STEEL_LIGHT }}>All of Seattle and surrounding neighborhoods within a 20-mile radius of Greenwood</p>
            </GlassCard>
            <GlassCard className="p-8 text-center">
              <Clock size={32} weight="duotone" style={{ color: ACCENT }} className="mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Response Time</h3>
              <p className="text-sm" style={{ color: STEEL_LIGHT }}>Under 2 hours for most calls received before noon. Evening slots available.</p>
            </GlassCard>
            <GlassCard className="p-8 text-center">
              <div className="mx-auto mb-4 flex items-center justify-center">
                <motion.div animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="w-3 h-3 rounded-full mr-2" style={{ background: "#22c55e" }} />
                <span className="text-sm font-bold" style={{ color: "#22c55e" }}>Crews Available Now</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Availability</h3>
              <p className="text-sm" style={{ color: STEEL_LIGHT }}>Mon-Sat 7am-8pm. Emergency calls accepted Sundays and holidays.</p>
            </GlassCard>
          </div>
        </div>
      </SectionReveal>

      {/* ═══════════════════ 15. FAQ ═══════════════════ */}
      <SectionReveal className="relative z-10 py-24 px-4" style={{ background: `linear-gradient(180deg, transparent, ${ACCENT_GLOW}, transparent)` }}>
        <div className="mx-auto max-w-3xl">
          <SectionHeader label="Common Questions" title="Got" accent="Questions?" />
          <div className="space-y-3">
            {[
              { q: "Do you offer same-day appliance repair?", a: "Yes. Call before noon and we guarantee a technician at your door the same day. Most calls are answered within two hours." },
              { q: "How much does a service call cost?", a: "Our diagnostic fee is $89, which covers the trip and full diagnosis. If you approve the repair, the $89 is waived entirely." },
              { q: "What brands do you service?", a: "All major brands: Samsung, LG, Whirlpool, GE, Bosch, Sub-Zero, Viking, KitchenAid, Maytag, Frigidaire, and many more." },
              { q: "Do you warranty your repairs?", a: "Every repair comes with a 90-day parts warranty and 30-day labor warranty. If the same part fails, we replace it free." },
              { q: "Should I repair or replace my appliance?", a: "Our technicians give honest assessments. If the repair exceeds 50% of a new unit's cost, or the appliance is past its expected lifespan, we'll tell you to replace." },
              { q: "Are your technicians background-checked?", a: "Yes. Every ProFix tech is licensed, insured, EPA certified, and has passed a full background check." },
            ].map((faq, i) => (
              <GlassCard key={i} className="overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full text-left px-6 py-5 flex items-center justify-between cursor-pointer">
                  <span className="text-base font-semibold text-white pr-4">{faq.q}</span>
                  <motion.span animate={{ rotate: openFaq === i ? 180 : 0 }} transition={{ duration: 0.3 }}>
                    <CaretDown size={20} style={{ color: ACCENT }} />
                  </motion.span>
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}>
                      <div className="px-6 pb-5 text-sm leading-relaxed" style={{ color: STEEL_LIGHT }}>{faq.a}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </GlassCard>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ═══════════════════ 18.5. APPLIANCE LIFESPAN GUIDE ═══════════════════ */}
      <SectionReveal className="relative z-10 py-24 px-4" style={{ background: `linear-gradient(180deg, transparent, ${STEEL_GLOW}, transparent)` }}>
        <div className="mx-auto max-w-5xl">
          <SectionHeader label="Know Your Appliances" title="Repair or" accent="Replace?" subtitle="Average lifespans for major household appliances. When repair costs exceed 50% of replacement, we'll tell you honestly." />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { name: "Refrigerator", years: "13-17 yrs", icon: Snowflake },
              { name: "Washer", years: "10-14 yrs", icon: Drop },
              { name: "Dryer", years: "10-13 yrs", icon: Fire },
              { name: "Dishwasher", years: "9-13 yrs", icon: Lightning },
              { name: "Oven / Range", years: "13-20 yrs", icon: Thermometer },
              { name: "Microwave", years: "7-10 yrs", icon: Gear },
              { name: "Ice Maker", years: "8-12 yrs", icon: Gauge },
              { name: "Garbage Disposal", years: "8-15 yrs", icon: Wrench },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <GlassCard key={i} className="p-5 text-center hover:border-orange-500/20 transition-all duration-300">
                  <Icon size={24} weight="duotone" style={{ color: ACCENT }} className="mx-auto mb-3" />
                  <div className="text-sm font-bold text-white mb-1">{item.name}</div>
                  <div className="text-lg font-black" style={{ color: ACCENT }}>{item.years}</div>
                  <div className="text-[10px] uppercase tracking-wider mt-1" style={{ color: STEEL }}>Avg Lifespan</div>
                </GlassCard>
              );
            })}
          </div>
          <p className="text-center text-sm mt-8" style={{ color: STEEL }}>
            Source: U.S. Department of Energy appliance lifespan estimates. Actual lifespan depends on usage, maintenance, and brand quality.
          </p>
        </div>
      </SectionReveal>

      {/* ═══════════════════ 19. CONTACT / CTA ═══════════════════ */}
      <SectionReveal id="contact" className="relative z-10 py-24 px-4">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-6" style={{ background: ACCENT_GLOW, color: ACCENT_LIGHT }}>Get In Touch</span>
              <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6">
                One Call. <span style={{ color: ACCENT }}>One Fix.</span>
              </h2>
              <p className="text-lg mb-10" style={{ color: STEEL_LIGHT }}>
                Reach Steve and the ProFix team for same-day appliance repair anywhere in Seattle. No voicemail trees, no hold music. A real person answers.
              </p>
              <div className="space-y-5">
                <a href="tel:2065550519" className="flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: ACCENT_GLOW }}>
                    <Phone size={24} weight="duotone" style={{ color: ACCENT }} />
                  </div>
                  <div>
                    <div className="text-sm" style={{ color: STEEL }}>Call or Text</div>
                    <div className="text-lg font-bold text-white group-hover:text-orange-300 transition-colors">(206) 555-0519</div>
                  </div>
                </a>
                <a href="mailto:fix@profixappliance.com" className="flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: ACCENT_GLOW }}>
                    <Envelope size={24} weight="duotone" style={{ color: ACCENT }} />
                  </div>
                  <div>
                    <div className="text-sm" style={{ color: STEEL }}>Email</div>
                    <div className="text-lg font-bold text-white group-hover:text-orange-300 transition-colors">fix@profixappliance.com</div>
                  </div>
                </a>
                <a href="https://maps.google.com/?q=6730+Greenwood+Ave+N+Seattle+WA+98103" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: ACCENT_GLOW }}>
                    <MapPin size={24} weight="duotone" style={{ color: ACCENT }} />
                  </div>
                  <div>
                    <div className="text-sm" style={{ color: STEEL }}>Visit</div>
                    <div className="text-lg font-bold text-white group-hover:text-orange-300 transition-colors">6730 Greenwood Ave N, Seattle WA 98103</div>
                  </div>
                </a>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: ACCENT_GLOW }}>
                    <Clock size={24} weight="duotone" style={{ color: ACCENT }} />
                  </div>
                  <div>
                    <div className="text-sm" style={{ color: STEEL }}>Hours</div>
                    <div className="text-lg font-bold text-white">Mon-Sat 7am-8pm</div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <ShimmerBorder>
                <div className="p-10 text-center">
                  <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${ACCENT}, #ea580c)` }}>
                    <Phone size={36} weight="bold" className="text-white" />
                  </div>
                  <h3 className="text-2xl font-extrabold text-white mb-3">Book Your Repair</h3>
                  <p className="text-base mb-8" style={{ color: STEEL_LIGHT }}>
                    Call now for same-day service. Your $89 diagnostic is waived with every approved repair.
                  </p>
                  <MagneticButton href="tel:2065550519" className="w-full px-8 py-5 rounded-xl text-xl font-bold text-white flex items-center justify-center gap-3 cursor-pointer" style={{ background: ACCENT }}>
                    <Phone size={24} weight="bold" /> (206) 555-0519
                  </MagneticButton>
                  <p className="text-sm mt-4" style={{ color: STEEL }}>No voicemail. A real person answers.</p>
                </div>
              </ShimmerBorder>
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* ═══════════════════ FOOTER ═══════════════════ */}
      <footer className="relative z-10 py-16 px-4 border-t border-white/8">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <LogoIcon size={24} />
                <span className="text-lg font-bold text-white">ProFix Appliance Repair</span>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: STEEL }}>
                Same-day appliance repair in Seattle since 2011. EPA certified, factory trained, and committed to honest pricing.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Services</h4>
              <div className="grid grid-cols-2 gap-2">
                {SERVICES.map((svc, i) => (
                  <a key={i} href="#services" className="text-sm hover:text-white transition-colors" style={{ color: STEEL_LIGHT }}>{svc.title}</a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Contact</h4>
              <div className="space-y-2">
                <a href="tel:2065550519" className="text-sm flex items-center gap-2 hover:text-white transition-colors" style={{ color: STEEL_LIGHT }}>
                  <Phone size={14} weight="duotone" /> (206) 555-0519
                </a>
                <a href="mailto:fix@profixappliance.com" className="text-sm flex items-center gap-2 hover:text-white transition-colors" style={{ color: STEEL_LIGHT }}>
                  <Envelope size={14} weight="duotone" /> fix@profixappliance.com
                </a>
                <a href="https://maps.google.com/?q=6730+Greenwood+Ave+N+Seattle+WA+98103" target="_blank" rel="noopener noreferrer" className="text-sm flex items-center gap-2 hover:text-white transition-colors" style={{ color: STEEL_LIGHT }}>
                  <MapPin size={14} weight="duotone" /> 6730 Greenwood Ave N, Seattle WA 98103
                </a>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-white/8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs" style={{ color: STEEL }}>
              &copy; {new Date().getFullYear()} ProFix Appliance Repair. All rights reserved.
            </p>
            <p className="text-xs flex items-center gap-1.5" style={{ color: STEEL }}>
              <svg width="14" height="14" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-sky-500"><path d="M24.3 4.2c-1.5-.4-3.2.1-4.5 1.1-1-.7-2.3-1-3.5-.8-2.4.4-4.2 2.5-4.2 4.9v.6c-3.2.8-6 2.8-7.8 5.6-.3.5-.1 1.1.4 1.4.5.3 1.1.1 1.4-.4 1.5-2.3 3.7-4 6.3-4.7.5-.1 1-.1 1.5 0 .8.2 1.4.8 1.7 1.5.3.8.2 1.6-.2 2.3l-2.8 4.3c-.6.9-.4 2.1.4 2.8l2.5 2.1c.4.3.8.5 1.3.5h5.2c.5 0 1-.2 1.3-.5l1.2-1c.6-.5.8-1.3.6-2l-1-3.2c-.2-.5 0-1.1.4-1.4l3.8-2.5c1.3-.9 2.1-2.3 2.1-3.9V9.6c0-2.5-1.7-4.7-4.1-5.3v-.1z" fill="currentColor"/></svg>Created by{" "}
              <a href="https://bluejayportfolio.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-white transition-colors" style={{ color: STEEL_LIGHT }}>
                bluejayportfolio.com
              </a>
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
