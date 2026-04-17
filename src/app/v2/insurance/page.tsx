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
  Shield,
  ShieldCheck,
  ShieldPlus,
  House,
  Car,
  Heart,
  Briefcase,
  Umbrella,
  Star,
  Phone,
  MapPin,
  Clock,
  ArrowRight,
  CaretDown,
  CaretRight,
  Quotes,
  CalendarCheck,
  Users,
  CheckCircle,
  Handshake,
  FileText,
  Scales,
  X,
  List,
  Buildings,
  Envelope,
  Globe,
  Certificate,
  SealCheck,
  Lightning,
  Calculator,
  Warning,
  Question,
  Target,
  ListChecks,
  CurrencyDollar,
  TrendUp,
  ChartLine,
  Lifebuoy,
  HandHeart,
  Bank,
  Wallet,
  Percent,
  Timer,
  Medal,
  Info,
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
const BG = "#0f172a";
const BLUE = "#1d4ed8";
const BLUE_LIGHT = "#60a5fa";
const EMERALD = "#059669";
const GOLD = "#ca8a04";
const BLUE_GLOW = "rgba(29, 78, 216, 0.15)";
const EMERALD_GLOW = "rgba(5, 150, 105, 0.12)";
const GOLD_GLOW = "rgba(202, 138, 4, 0.10)";

/* ───────────────────────── DATA ───────────────────────── */
const BIZ_NAME = "Puget Sound Insurance Group";
const OWNER = "Lisa Park";
const PHONE = "(206) 555-0187";
const ADDRESS = "4201 Rainier Ave S, Suite 310, Seattle, WA 98118";
const MAP_LINK = `https://maps.google.com/?q=${encodeURIComponent(ADDRESS)}`;

const COVERAGE_TYPES = [
  { icon: Car, label: "Auto Insurance", desc: "Liability, collision, comprehensive, and uninsured motorist coverage tailored to your driving needs.", color: BLUE },
  { icon: House, label: "Home Insurance", desc: "Protect your most valuable asset with dwelling, personal property, and liability coverage.", color: EMERALD },
  { icon: Heart, label: "Life Insurance", desc: "Term and whole life options to secure your family's financial future no matter what.", color: GOLD },
  { icon: Briefcase, label: "Business Insurance", desc: "General liability, commercial property, and workers' comp for Seattle businesses.", color: BLUE },
  { icon: Umbrella, label: "Umbrella Insurance", desc: "Extra liability protection beyond your auto and home policies for total peace of mind.", color: EMERALD },
  { icon: Buildings, label: "Renters Insurance", desc: "Affordable coverage for your belongings, liability, and temporary living expenses.", color: GOLD },
];

const PROCESS_STEPS = [
  { icon: Phone, label: "Free Consultation", desc: "Call or visit us. We listen to your situation, goals, and budget." },
  { icon: FileText, label: "Coverage Review", desc: "We shop 15+ carriers to find the best rates and coverage for you." },
  { icon: Target, label: "Custom Plan", desc: "We build a personalized protection plan that covers every gap." },
  { icon: ShieldCheck, label: "You're Protected", desc: "Enjoy peace of mind knowing your family and assets are fully covered." },
];

const TRUST_STATS = [
  { value: "30+", label: "Years Serving Seattle", icon: Clock },
  { value: "5,000+", label: "Families Protected", icon: Users },
  { value: "A+", label: "BBB Rated", icon: Medal },
  { value: "98%", label: "Claim Approval", icon: CheckCircle },
];

const CARRIERS = ["Progressive", "Safeco", "Travelers", "The Hartford", "Nationwide", "Liberty Mutual", "Allstate", "PEMCO"];

const FAQ_DATA = [
  { q: "How is an independent agent different from a captive agent?", a: "We shop 15+ carriers to find you the best rate. Captive agents can only offer one company's products, so you might overpay." },
  { q: "How much can I save by bundling?", a: "Most families save 15-25% by bundling auto and home policies. Some carriers offer up to 30% multi-policy discounts." },
  { q: "Do you help with claims?", a: "Absolutely. We advocate on your behalf through the entire claims process, from filing to final settlement." },
  { q: "What does umbrella insurance cover?", a: "Umbrella policies provide extra liability coverage beyond your auto and home limits. They protect your assets from lawsuits and large claims." },
  { q: "How quickly can I get a quote?", a: "Most quotes take 15-20 minutes. Call us at (206) 555-0187 or fill out our contact form and we will get back to you within one business day." },
  { q: "Do you offer renters insurance?", a: "Yes. Renters insurance is affordable, typically $15-30 per month, and covers your belongings, liability, and temporary housing if needed." },
];

const COMPARISON_ROWS = [
  { feature: "Shops Multiple Carriers", us: true, them: false },
  { feature: "Personalized Service", us: true, them: false },
  { feature: "Claims Advocacy", us: true, them: false },
  { feature: "Annual Policy Review", us: true, them: false },
  { feature: "Bundle Discounts", us: true, them: true },
  { feature: "Local Office You Can Visit", us: true, them: false },
  { feature: "Licensed Professional Advice", us: true, them: false },
];

const TESTIMONIALS_DATA: Record<string, { name: string; text: string; saved: string; rating: number }[]> = {
  Auto: [
    { name: "Marcus T.", text: "Lisa found me a policy that saved me over $600 a year with better coverage than I had before. Could not believe it.", saved: "$612/yr", rating: 5 },
    { name: "Priya S.", text: "After my accident, Lisa handled everything with the insurance company. I never had to argue with anyone.", saved: "$1,200 claim", rating: 5 },
    { name: "David K.", text: "I was paying way too much for liability-only. Lisa got me full coverage for less than my old premium.", saved: "$480/yr", rating: 5 },
  ],
  Home: [
    { name: "Jennifer & Ryan M.", text: "Our home policy was full of gaps we did not know about. Lisa reviewed everything and fixed it at a lower rate.", saved: "$340/yr", rating: 5 },
    { name: "Angela W.", text: "When a tree fell on our garage, Lisa had a claims adjuster out the next day. She fought for every dollar.", saved: "$8,500 claim", rating: 5 },
  ],
  Life: [
    { name: "Thomas H.", text: "Lisa helped us set up term life policies for both my wife and me. The peace of mind is incredible.", saved: "$45/mo", rating: 5 },
    { name: "Sarah & Mike L.", text: "We put off life insurance for years. Lisa made the process painless and surprisingly affordable.", saved: "$32/mo", rating: 5 },
  ],
};

const QUIZ_QUESTIONS = [
  { q: "Do you own or rent your home?", options: ["Own", "Rent", "Neither"] },
  { q: "How many vehicles do you insure?", options: ["0", "1-2", "3+"] },
  { q: "Do you have dependents (kids, spouse)?", options: ["Yes", "No"] },
  { q: "Do you own a small business?", options: ["Yes", "No"] },
];

const RISK_CHECKLIST = [
  "Liability lawsuit from a car accident",
  "Fire or storm damage to your home",
  "Theft of personal belongings",
  "Medical bills from a workplace injury",
  "Income loss if you pass away unexpectedly",
  "A visitor injured on your property",
  "Water damage from a burst pipe",
  "Identity theft and fraud",
];

/* ───────────────────────── FLOATING PARTICLES ───────────────────────── */
function FloatingParticles() {
  const particles = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 8,
    duration: 7 + Math.random() * 6,
    size: 2 + Math.random() * 3,
    opacity: 0.08 + Math.random() * 0.15,
    color: i % 3 === 0 ? BLUE_LIGHT : i % 3 === 1 ? EMERALD : GOLD,
  }));
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden hidden md:block">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{ left: `${p.x}%`, width: p.size, height: p.size, background: p.color, willChange: "transform, opacity" }}
          animate={{ y: ["-10vh", "110vh"], opacity: [0, p.opacity, p.opacity, 0] }}
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
function SectionReveal({ children, className = "", id }: { children: React.ReactNode; className?: string; id?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.section ref={ref} id={id} className={className} initial={{ opacity: 0, y: 50 }} animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }} transition={spring}>
      {children}
    </motion.section>
  );
}

function GlassCard({ children, className = "", glow, style, id, onClick, href }: { children: React.ReactNode; className?: string; glow?: string; style?: React.CSSProperties; id?: string; onClick?: () => void; href?: string }) {
  const mergedStyle: React.CSSProperties = { ...(glow ? { boxShadow: `0 0 40px ${glow}` } : {}), ...(style ?? {}) };
  if (href) {
    return (
      <a href={href} id={id} onClick={onClick} className={`relative rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-md ${className}`} style={mergedStyle}>
        {children}
      </a>
    );
  }
  return (
    <div id={id} onClick={onClick} className={`relative rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-md ${className}`} style={mergedStyle}>
      {children}
    </div>
  );
}

function ShimmerBorder({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative rounded-2xl p-[1px] overflow-hidden ${className}`}>
      <motion.div
        className="absolute inset-0 rounded-2xl"
        style={{ background: `conic-gradient(from 0deg, ${BLUE}, ${EMERALD}, ${GOLD}, ${BLUE})` }}
        animate={{ rotate: 360 }}
        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
      />
      <div className="relative rounded-2xl bg-[#0f172a]">{children}</div>
    </div>
  );
}

function MagneticButton({ children, className = "", onClick, href, style }: { children: React.ReactNode; className?: string; onClick?: () => void; href?: string; style?: React.CSSProperties }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, springFast);
  const sy = useSpring(y, springFast);
  const handleMouse = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left - rect.width / 2) * 0.25);
    y.set((e.clientY - rect.top - rect.height / 2) * 0.25);
  }, [x, y]);
  const reset = useCallback(() => { x.set(0); y.set(0); }, [x, y]);
  const Tag = href ? motion.a : motion.button;
  return (
    <Tag
      href={href}
      onClick={onClick}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      style={{ x: sx, y: sy, ...(style ?? {}) }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.97 }}
      className={`inline-flex items-center gap-2 font-semibold transition-shadow ${className}`}
    >
      {children}
    </Tag>
  );
}

function WordReveal({ text, className = "" }: { text: string; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const words = text.split(" ");
  return (
    <span ref={ref} className={className}>
      {words.map((w, i) => (
        <motion.span
          key={i}
          className="inline-block mr-[0.3em]"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: i * 0.06, ...spring }}
        >
          {w}
        </motion.span>
      ))}
    </span>
  );
}

function SectionHeader({ tag, title, accent, subtitle }: { tag: string; title: string; accent: string; subtitle?: string }) {
  return (
    <div className="text-center mb-12 md:mb-16">
      <span className="inline-block text-xs font-bold tracking-[0.25em] uppercase px-4 py-1.5 rounded-full border border-white/10 bg-white/[0.04] mb-4" style={{ color: BLUE_LIGHT }}>{tag}</span>
      <h2 className="text-3xl md:text-5xl font-extrabold text-white leading-tight">
        {title} <span style={{ color: accent }}>{""}</span>
      </h2>
      {subtitle && <p className="mt-4 text-slate-400 max-w-2xl mx-auto text-lg">{subtitle}</p>}
    </div>
  );
}

/* ───────────────────────── HERO: SHIELD PROTECTION LAYERS ───────────────────────── */
const SHIELD_RINGS = [
  { label: "Auto", color: BLUE_LIGHT, delay: 0.2, size: 120 },
  { label: "Home", color: EMERALD, delay: 0.6, size: 200 },
  { label: "Life", color: GOLD, delay: 1.0, size: 280 },
  { label: "Business", color: BLUE, delay: 1.4, size: 360 },
];

function ShieldHero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden" style={{ background: `linear-gradient(135deg, ${BG} 0%, #1e293b 50%, ${BG} 100%)` }}>
      {/* Shield SVG background */}
      <div className="absolute inset-0 flex items-center justify-center">
        <svg viewBox="0 0 800 800" className="w-[600px] h-[600px] md:w-[800px] md:h-[800px] opacity-5">
          <path d="M400 50 L700 200 L700 450 C700 600 400 750 400 750 C400 750 100 600 100 450 L100 200 Z" fill="none" stroke="white" strokeWidth="2" />
        </svg>
      </div>

      {/* Animated concentric shield rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {SHIELD_RINGS.map((ring, i) => (
          <motion.div
            key={ring.label}
            className="absolute rounded-full border-2"
            style={{
              width: ring.size,
              height: ring.size,
              borderColor: ring.color,
              boxShadow: `0 0 30px ${ring.color}40, inset 0 0 20px ${ring.color}20`,
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.2, 1], opacity: [0, 0.8, 0.4] }}
            transition={{ delay: ring.delay, duration: 1.5, ease: "easeOut" }}
          />
        ))}
        {SHIELD_RINGS.map((ring) => (
          <motion.span
            key={`label-${ring.label}`}
            className="absolute text-xs md:text-sm font-bold tracking-widest uppercase"
            style={{
              color: ring.color,
              top: `calc(50% - ${ring.size / 2 + 20}px)`,
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: ring.delay + 0.8, duration: 0.6 }}
          >
            {ring.label}
          </motion.span>
        ))}
        {/* Central pulsing shield */}
        <motion.div
          className="absolute flex items-center justify-center"
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <Shield size={56} weight="fill" style={{ color: BLUE_LIGHT, filter: `drop-shadow(0 0 20px ${BLUE_LIGHT})` }} />
        </motion.div>
      </div>

      {/* Hero content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-32 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ ...spring, delay: 0.3 }}>
            <span className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded-full border mb-6" style={{ color: BLUE_LIGHT, borderColor: `${BLUE_LIGHT}40`, background: `${BLUE}20` }}>
              <ShieldCheck size={16} weight="fill" /> Independent Insurance Agency
            </span>
          </motion.div>
          <motion.h1 className="text-4xl md:text-6xl font-extrabold text-white leading-[1.1] mb-6" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.5 }}>
            Protection That <br />
            <span style={{ color: BLUE_LIGHT }}>Covers Every</span>{" "}
            <span style={{ color: EMERALD }}>Layer</span>
          </motion.h1>
          <motion.p className="text-slate-400 text-lg md:text-xl mb-8 max-w-lg" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.7 }}>
            {OWNER} and the {BIZ_NAME} team shop 15+ carriers so you get the best rates and coverage in Seattle. Over 30 years of protecting Pacific Northwest families.
          </motion.p>
          <motion.div className="flex flex-wrap gap-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.9 }}>
            <MagneticButton href={`tel:${PHONE.replace(/\D/g, "")}`} className="px-8 py-4 rounded-xl text-white shadow-lg" style={{ background: `linear-gradient(135deg, ${BLUE}, ${EMERALD})` }}>
              <Phone size={20} weight="fill" /> Get Free Quote
            </MagneticButton>
            <MagneticButton href="#coverage-quiz" className="px-8 py-4 rounded-xl text-white border border-white/20 hover:bg-white/5">
              <Question size={20} /> What Do I Need?
            </MagneticButton>
          </motion.div>
          {/* Trust pills */}
          <motion.div className="flex flex-wrap gap-3 mt-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}>
            {["Licensed Agent", "A+ BBB Rated", "15+ Carriers"].map((pill) => (
              <span key={pill} className="text-xs px-3 py-1 rounded-full border border-white/10 text-slate-400 bg-white/[0.03]">
                <SealCheck size={12} weight="fill" className="inline mr-1" style={{ color: EMERALD }} />{pill}
              </span>
            ))}
          </motion.div>
        </div>

        {/* Right side glass card */}
        <motion.div className="hidden md:block" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ ...spring, delay: 0.8 }}>
          <GlassCard className="p-8" glow={BLUE_GLOW}>
            <div className="text-center mb-6">
              <span className="text-6xl font-black" style={{ color: GOLD }}>$427</span>
              <p className="text-slate-400 mt-1">Average Annual Savings</p>
            </div>
            <div className="space-y-3">
              {[{ label: "Auto + Home Bundle", save: "Save 25%" }, { label: "Multi-Vehicle Discount", save: "Save 15%" }, { label: "Claims-Free Bonus", save: "Save 10%" }].map((item) => (
                <div key={item.label} className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/[0.04] border border-white/5">
                  <span className="text-white text-sm">{item.label}</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ color: EMERALD, background: `${EMERALD}20` }}>{item.save}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Gradient fade to BG */}
      <div className="absolute bottom-0 left-0 right-0 h-32" style={{ background: `linear-gradient(transparent, ${BG})` }} />
    </section>
  );
}

/* ───────────────────────── NAV ───────────────────────── */
function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  const links = [
    { label: "Coverage", href: "#coverage" },
    { label: "About", href: "#about" },
    { label: "Quiz", href: "#coverage-quiz" },
    { label: "Reviews", href: "#testimonials" },
    { label: "FAQ", href: "#faq" },
    { label: "Contact", href: "#contact" },
  ];
  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 transition-all"
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={spring}
    >
      <div className={`mx-4 md:mx-8 mt-3 rounded-2xl border backdrop-blur-xl transition-all ${scrolled ? "border-white/10 bg-[#0f172a]/90 shadow-2xl" : "border-transparent bg-transparent"}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
          <a href="#" className="flex items-center gap-2">
            <Shield size={28} weight="fill" style={{ color: BLUE_LIGHT }} />
            <span className="text-white font-bold text-lg hidden sm:inline">{BIZ_NAME}</span>
            <span className="text-white font-bold text-lg sm:hidden">PSIG</span>
          </a>
          <div className="hidden md:flex items-center gap-6">
            {links.map((l) => (
              <a key={l.label} href={l.href} className="text-sm text-slate-300 hover:text-white transition-colors">{l.label}</a>
            ))}
            <a href={`tel:${PHONE.replace(/\D/g, "")}`} className="ml-2 px-5 py-2 rounded-xl text-white text-sm font-semibold" style={{ background: BLUE }}>
              <Phone size={16} weight="fill" className="inline mr-1" /> {PHONE}
            </a>
          </div>
          <button onClick={() => setOpen(!open)} className="md:hidden text-white p-2">
            {open ? <X size={24} /> : <List size={24} />}
          </button>
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            className="md:hidden mx-4 mt-1 rounded-2xl border border-white/10 bg-[#0f172a]/95 backdrop-blur-xl p-6"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {links.map((l) => (
              <a key={l.label} href={l.href} onClick={() => setOpen(false)} className="block py-3 text-slate-300 hover:text-white border-b border-white/5 last:border-0">{l.label}</a>
            ))}
            <a href={`tel:${PHONE.replace(/\D/g, "")}`} className="mt-4 block text-center px-5 py-3 rounded-xl text-white font-semibold" style={{ background: BLUE }}>
              {PHONE}
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

/* ───────────────────────── TRUST BAR ───────────────────────── */
function TrustBar() {
  return (
    <SectionReveal className="relative py-10" id="trust">
      <div className="absolute inset-0" style={{ background: `linear-gradient(90deg, ${BLUE}15, ${EMERALD}10, ${BLUE}15)` }} />
      <div className="relative max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6">
        {TRUST_STATS.map((s) => (
          <div key={s.label} className="text-center">
            <s.icon size={28} weight="fill" className="mx-auto mb-2" style={{ color: BLUE_LIGHT }} />
            <div className="text-3xl md:text-4xl font-black text-white">{s.value}</div>
            <div className="text-xs text-slate-400 mt-1 uppercase tracking-wider">{s.label}</div>
          </div>
        ))}
      </div>
    </SectionReveal>
  );
}

/* ───────────────────────── COVERAGE TYPES ───────────────────────── */
function CoverageGrid() {
  return (
    <SectionReveal className="py-20 md:py-28 relative" id="coverage">
      <div className="absolute inset-0 opacity-30" style={{ background: `radial-gradient(ellipse at 30% 50%, ${BLUE_GLOW}, transparent 60%), radial-gradient(ellipse at 70% 50%, ${EMERALD_GLOW}, transparent 60%)` }} />
      <div className="relative max-w-7xl mx-auto px-6">
        <SectionHeader tag="What We Cover" title="Comprehensive Coverage" accent={BLUE_LIGHT} subtitle="From your car to your family's future, we protect what matters most." />
        <motion.div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
          {COVERAGE_TYPES.map((c) => (
            <motion.div key={c.label} variants={fadeUp}>
              <GlassCard className="p-6 hover:border-white/20 transition-all group cursor-default">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: `${c.color}20` }}>
                  <c.icon size={24} weight="fill" style={{ color: c.color }} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{c.label}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{c.desc}</p>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </SectionReveal>
  );
}

/* ───────────────────────── ABOUT ───────────────────────── */
function AboutSection() {
  return (
    <SectionReveal className="py-20 md:py-28 relative" id="about">
      <div className="absolute inset-0 opacity-20" style={{ background: `radial-gradient(ellipse at 50% 0%, ${GOLD_GLOW}, transparent 60%)` }} />
      <div className="relative max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <GlassCard className="aspect-[4/5] overflow-hidden" glow={BLUE_GLOW}>
            <img
              src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&h=750&fit=crop"
              alt={OWNER}
              className="w-full h-full object-cover object-top"
            />
          </GlassCard>
        </div>
        <div>
          <span className="inline-block text-xs font-bold tracking-[0.25em] uppercase px-4 py-1.5 rounded-full border border-white/10 bg-white/[0.04] mb-4" style={{ color: GOLD }}>About Us</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-6">
            Meet <span style={{ color: BLUE_LIGHT }}>{OWNER}</span>
          </h2>
          <p className="text-slate-400 leading-relaxed mb-4">
            With over 30 years serving Seattle and the greater Puget Sound area, {OWNER} founded {BIZ_NAME} on a simple belief: insurance should protect people, not confuse them.
          </p>
          <p className="text-slate-400 leading-relaxed mb-4">
            As an independent agent, Lisa is not beholden to any single carrier. She shops 15+ top-rated insurance companies to find the perfect fit for your coverage needs and budget. Her approach is personal: every client gets a dedicated annual review, claims advocacy, and a direct phone line.
          </p>
          <p className="text-slate-400 leading-relaxed mb-6">
            From first-time renters to established business owners, Lisa has helped over 5,000 families find peace of mind across auto, home, life, and commercial coverage.
          </p>
          <div className="flex flex-wrap gap-3">
            {["Licensed Agent", "30+ Years", "5,000+ Clients", "15+ Carriers"].map((badge) => (
              <span key={badge} className="text-xs px-3 py-1.5 rounded-full font-semibold" style={{ color: BLUE_LIGHT, background: `${BLUE}20`, border: `1px solid ${BLUE}40` }}>
                {badge}
              </span>
            ))}
          </div>
        </div>
      </div>
    </SectionReveal>
  );
}

/* ───────────────────────── COVERAGE QUIZ ───────────────────────── */
function CoverageQuiz() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [result, setResult] = useState<string | null>(null);

  const handleAnswer = (answer: string) => {
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);
    if (step < QUIZ_QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      // Compute recommendation
      const ownsHome = newAnswers[0] === "Own";
      const hasVehicles = newAnswers[1] !== "0";
      const hasDependents = newAnswers[2] === "Yes";
      const hasBusiness = newAnswers[3] === "Yes";
      let rec = "";
      if (ownsHome && hasVehicles && hasDependents) rec = "Full Family Bundle: Auto + Home + Life + Umbrella";
      else if (ownsHome && hasVehicles) rec = "Homeowner Bundle: Auto + Home";
      else if (hasVehicles && hasDependents) rec = "Family Protection: Auto + Life";
      else if (hasBusiness) rec = "Business Owner Package: Commercial + Auto + Umbrella";
      else if (hasVehicles) rec = "Auto Coverage with multi-vehicle discount";
      else rec = "Renters + Life: affordable protection to start";
      setResult(rec);
    }
  };

  const reset = () => { setStep(0); setAnswers([]); setResult(null); };

  return (
    <SectionReveal className="py-20 md:py-28 relative" id="coverage-quiz">
      <div className="absolute inset-0 opacity-20" style={{ background: `radial-gradient(ellipse at 50% 50%, ${BLUE_GLOW}, transparent 70%)` }} />
      <div className="relative max-w-3xl mx-auto px-6">
        <SectionHeader tag="Interactive Tool" title="What Coverage Do You Need?" accent={BLUE_LIGHT} subtitle="Answer 4 quick questions and we will recommend the right protection plan." />
        <ShimmerBorder>
          <div className="p-8 md:p-12">
            <AnimatePresence mode="wait">
              {result === null ? (
                <motion.div key={`q-${step}`} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
                  <div className="flex items-center gap-2 mb-6">
                    {QUIZ_QUESTIONS.map((_, i) => (
                      <div key={i} className="h-1.5 flex-1 rounded-full" style={{ background: i <= step ? BLUE : "rgba(255,255,255,0.1)" }} />
                    ))}
                  </div>
                  <p className="text-sm text-slate-400 mb-2">Question {step + 1} of {QUIZ_QUESTIONS.length}</p>
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-8">{QUIZ_QUESTIONS[step].q}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {QUIZ_QUESTIONS[step].options.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => handleAnswer(opt)}
                        className="px-6 py-4 rounded-xl border border-white/10 text-white font-semibold hover:border-blue-500/50 hover:bg-blue-500/10 transition-all text-center"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={spring}>
                  <div className="text-center">
                    <ShieldCheck size={56} weight="fill" className="mx-auto mb-4" style={{ color: EMERALD }} />
                    <h3 className="text-2xl font-bold text-white mb-2">Your Recommended Coverage</h3>
                    <p className="text-lg mb-6" style={{ color: BLUE_LIGHT }}>{result}</p>
                    <p className="text-slate-400 mb-8">Call {OWNER} for a free personalized quote based on your specific situation.</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <MagneticButton href={`tel:${PHONE.replace(/\D/g, "")}`} className="px-8 py-4 rounded-xl text-white" style={{ background: BLUE }}>
                        <Phone size={20} weight="fill" /> Call {PHONE}
                      </MagneticButton>
                      <button onClick={reset} className="px-6 py-4 rounded-xl border border-white/10 text-slate-300 hover:text-white transition-colors">
                        Retake Quiz
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </ShimmerBorder>
      </div>
    </SectionReveal>
  );
}

/* ───────────────────────── BUNDLE SAVINGS CALCULATOR ───────────────────────── */
function BundleCalculator() {
  const [selected, setSelected] = useState<string[]>(["Auto"]);
  const [premium, setPremium] = useState(200);

  const coverages = ["Auto", "Home", "Life", "Business", "Umbrella", "Renters"];
  const discountPercent = selected.length >= 3 ? 25 : selected.length === 2 ? 15 : 0;
  const monthlySavings = Math.round(premium * (discountPercent / 100));
  const annualSavings = monthlySavings * 12;

  const toggleCoverage = (c: string) => {
    setSelected((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]);
  };

  return (
    <SectionReveal className="py-20 md:py-28 relative" id="savings">
      <div className="absolute inset-0 opacity-15" style={{ background: `radial-gradient(ellipse at 50% 50%, ${EMERALD_GLOW}, transparent 70%)` }} />
      <div className="relative max-w-4xl mx-auto px-6">
        <SectionHeader tag="Savings Tool" title="Bundle & Save Calculator" accent={EMERALD} subtitle="See how much you could save by bundling your policies with one agent." />
        <GlassCard className="p-8 md:p-12" glow={EMERALD_GLOW}>
          <div className="grid md:grid-cols-2 gap-10">
            <div>
              <h3 className="text-white font-bold mb-4">Select Your Coverage Types</h3>
              <div className="grid grid-cols-2 gap-3">
                {coverages.map((c) => {
                  const isActive = selected.includes(c);
                  return (
                    <button
                      key={c}
                      onClick={() => toggleCoverage(c)}
                      className="flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-semibold transition-all"
                      style={{
                        borderColor: isActive ? EMERALD : "rgba(255,255,255,0.1)",
                        background: isActive ? `${EMERALD}20` : "transparent",
                        color: isActive ? EMERALD : "#94a3b8",
                      }}
                    >
                      <CheckCircle size={16} weight={isActive ? "fill" : "regular"} />
                      {c}
                    </button>
                  );
                })}
              </div>
              <div className="mt-6">
                <label className="text-sm text-slate-400 block mb-2">Current Monthly Premium: <span className="text-white font-bold">${premium}</span></label>
                <input
                  type="range"
                  min={50}
                  max={800}
                  step={10}
                  value={premium}
                  onChange={(e) => setPremium(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>$50/mo</span><span>$800/mo</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center text-center">
              <div className="mb-4">
                <Percent size={40} weight="fill" style={{ color: EMERALD }} />
              </div>
              <div className="text-sm text-slate-400 mb-1">Bundle Discount</div>
              <div className="text-5xl font-black text-white mb-2">{discountPercent}%</div>
              <div className="text-sm text-slate-400 mb-4">
                {selected.length < 2 ? "Add more coverage types to unlock savings" : `${selected.length} policies bundled`}
              </div>
              <div className="w-full p-4 rounded-xl bg-white/[0.04] border border-white/5">
                <div className="flex justify-between mb-2">
                  <span className="text-slate-400 text-sm">Monthly Savings</span>
                  <span className="text-white font-bold" style={{ color: EMERALD }}>${monthlySavings}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 text-sm">Annual Savings</span>
                  <span className="text-white font-bold text-lg" style={{ color: GOLD }}>${annualSavings}</span>
                </div>
              </div>
              {selected.length >= 2 && (
                <MagneticButton href={`tel:${PHONE.replace(/\D/g, "")}`} className="mt-6 px-8 py-3 rounded-xl text-white text-sm" style={{ background: EMERALD }}>
                  <Phone size={18} weight="fill" /> Get Your Custom Quote
                </MagneticButton>
              )}
            </div>
          </div>
        </GlassCard>
      </div>
    </SectionReveal>
  );
}

/* ───────────────────────── ARE YOU COVERED? CHECKLIST ───────────────────────── */
function CoverageChecklist() {
  const [checked, setChecked] = useState<boolean[]>(new Array(RISK_CHECKLIST.length).fill(false));
  const coveredCount = checked.filter(Boolean).length;
  const gapCount = RISK_CHECKLIST.length - coveredCount;

  const toggle = (i: number) => {
    setChecked((prev) => { const n = [...prev]; n[i] = !n[i]; return n; });
  };

  return (
    <SectionReveal className="py-20 md:py-28 relative" id="checklist">
      <div className="absolute inset-0 opacity-15" style={{ background: `radial-gradient(ellipse at 30% 50%, ${GOLD_GLOW}, transparent 50%)` }} />
      <div className="relative max-w-4xl mx-auto px-6">
        <SectionHeader tag="Risk Assessment" title="Are You Fully Covered?" accent={GOLD} subtitle="Check each risk you are currently insured against. See where you might have gaps." />
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-3">
            {RISK_CHECKLIST.map((risk, i) => (
              <button
                key={i}
                onClick={() => toggle(i)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all"
                style={{
                  borderColor: checked[i] ? `${EMERALD}60` : "rgba(255,255,255,0.08)",
                  background: checked[i] ? `${EMERALD}10` : "rgba(255,255,255,0.02)",
                }}
              >
                <div className="w-5 h-5 rounded flex-shrink-0 flex items-center justify-center border" style={{ borderColor: checked[i] ? EMERALD : "rgba(255,255,255,0.2)", background: checked[i] ? EMERALD : "transparent" }}>
                  {checked[i] && <CheckCircle size={14} weight="fill" className="text-white" />}
                </div>
                <span className={`text-sm ${checked[i] ? "text-slate-300" : "text-slate-400"}`}>{risk}</span>
              </button>
            ))}
          </div>
          <div className="flex items-center justify-center">
            <GlassCard className="p-8 text-center w-full" glow={gapCount > 3 ? "rgba(220,38,38,0.15)" : gapCount > 0 ? GOLD_GLOW : EMERALD_GLOW}>
              <div className="mb-4">
                {gapCount === 0 ? (
                  <ShieldCheck size={56} weight="fill" style={{ color: EMERALD }} />
                ) : gapCount <= 3 ? (
                  <Warning size={56} weight="fill" style={{ color: GOLD }} />
                ) : (
                  <Warning size={56} weight="fill" style={{ color: "#dc2626" }} />
                )}
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                {gapCount === 0 ? "Fully Protected!" : `${gapCount} Coverage Gap${gapCount > 1 ? "s" : ""} Found`}
              </h3>
              <p className="text-slate-400 text-sm mb-2">
                {coveredCount} of {RISK_CHECKLIST.length} risks covered
              </p>
              <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden mb-6">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: gapCount === 0 ? EMERALD : gapCount <= 3 ? GOLD : "#dc2626" }}
                  animate={{ width: `${(coveredCount / RISK_CHECKLIST.length) * 100}%` }}
                  transition={spring}
                />
              </div>
              {gapCount > 0 && (
                <>
                  <p className="text-slate-400 text-sm mb-4">A free coverage review can identify and close these gaps.</p>
                  <MagneticButton href={`tel:${PHONE.replace(/\D/g, "")}`} className="px-6 py-3 rounded-xl text-white text-sm" style={{ background: BLUE }}>
                    <Phone size={18} weight="fill" /> Free Coverage Review
                  </MagneticButton>
                </>
              )}
            </GlassCard>
          </div>
        </div>
      </div>
    </SectionReveal>
  );
}

/* ───────────────────────── PROCESS ───────────────────────── */
function ProcessSection() {
  return (
    <SectionReveal className="py-20 md:py-28 relative" id="process">
      <div className="absolute inset-0 opacity-20" style={{ background: `radial-gradient(ellipse at 60% 50%, ${BLUE_GLOW}, transparent 60%)` }} />
      <div className="relative max-w-6xl mx-auto px-6">
        <SectionHeader tag="How It Works" title="4 Steps to Peace of Mind" accent={BLUE_LIGHT} />
        <div className="grid md:grid-cols-4 gap-6">
          {PROCESS_STEPS.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15, ...spring }}>
              <GlassCard className="p-6 text-center h-full">
                <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3 text-xs font-black text-white" style={{ background: `linear-gradient(135deg, ${BLUE}, ${EMERALD})` }}>
                  {i + 1}
                </div>
                <s.icon size={32} weight="fill" className="mx-auto mb-3" style={{ color: BLUE_LIGHT }} />
                <h3 className="text-white font-bold mb-2">{s.label}</h3>
                <p className="text-sm text-slate-400">{s.desc}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </SectionReveal>
  );
}

/* ───────────────────────── TESTIMONIALS: COVERAGE-GROUPED TABS ───────────────────────── */
function TestimonialsSection() {
  const tabs = Object.keys(TESTIMONIALS_DATA);
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const tabIcons: Record<string, React.ElementType> = { Auto: Car, Home: House, Life: Heart };

  return (
    <SectionReveal className="py-20 md:py-28 relative" id="testimonials">
      <div className="absolute inset-0 opacity-15" style={{ background: `radial-gradient(ellipse at 50% 30%, ${GOLD_GLOW}, transparent 60%)` }} />
      <div className="relative max-w-6xl mx-auto px-6">
        <SectionHeader tag="Client Stories" title="What Our Clients Say" accent={GOLD} subtitle="Real savings, real claims, real protection. Grouped by coverage type." />
        {/* Google Reviews Header */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => <Star key={s} size={20} weight="fill" style={{ color: GOLD }} />)}
          </div>
          <span className="text-white font-bold">4.9</span>
          <span className="text-slate-400 text-sm">from 312 reviews</span>
        </div>
        {/* Tabs */}
        <div className="flex justify-center gap-3 mb-10">
          {tabs.map((tab) => {
            const Icon = tabIcons[tab] || Shield;
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all border"
                style={{
                  borderColor: isActive ? BLUE : "rgba(255,255,255,0.1)",
                  background: isActive ? `${BLUE}25` : "transparent",
                  color: isActive ? BLUE_LIGHT : "#94a3b8",
                }}
              >
                <Icon size={18} weight={isActive ? "fill" : "regular"} />
                {tab}
              </button>
            );
          })}
        </div>
        {/* Reviews */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {TESTIMONIALS_DATA[activeTab].map((t, i) => (
              <GlassCard key={i} className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ color: BLUE_LIGHT, background: `${BLUE}20` }}>{activeTab}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ color: EMERALD, background: `${EMERALD}20` }}>Saved {t.saved}</span>
                </div>
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: t.rating }, (_, s) => <Star key={s} size={16} weight="fill" style={{ color: GOLD }} />)}
                </div>
                <Quotes size={20} weight="fill" className="mb-2" style={{ color: `${BLUE_LIGHT}40` }} />
                <p className="text-slate-300 text-sm leading-relaxed mb-4">{t.text}</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: `${BLUE}30`, color: BLUE_LIGHT }}>
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">{t.name}</p>
                    <div className="flex items-center gap-1">
                      <SealCheck size={12} weight="fill" style={{ color: EMERALD }} />
                      <span className="text-xs text-slate-500">Verified Client</span>
                    </div>
                  </div>
                </div>
              </GlassCard>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </SectionReveal>
  );
}

/* ───────────────────────── WHY INDEPENDENT AGENT ───────────────────────── */
function WhyIndependent() {
  return (
    <SectionReveal className="py-20 md:py-28 relative" id="why-independent">
      <div className="absolute inset-0 opacity-15" style={{ background: `radial-gradient(ellipse at 40% 60%, ${BLUE_GLOW}, transparent 60%)` }} />
      <div className="relative max-w-6xl mx-auto px-6">
        <SectionHeader tag="Why Choose Us" title="{BIZ_NAME} vs. The Competition" accent={BLUE_LIGHT} subtitle="See why an independent agent saves you money and delivers better service." />
        <GlassCard className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left px-6 py-4 text-sm text-slate-400 font-medium">Feature</th>
                  <th className="text-center px-6 py-4 text-sm font-bold" style={{ color: BLUE_LIGHT }}>Independent Agent</th>
                  <th className="text-center px-6 py-4 text-sm text-slate-400 font-medium">Direct / Online</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row, i) => (
                  <tr key={i} className="border-b border-white/5 last:border-0">
                    <td className="px-6 py-4 text-sm text-slate-300">{row.feature}</td>
                    <td className="text-center px-6 py-4">
                      <CheckCircle size={22} weight="fill" style={{ color: EMERALD }} className="mx-auto" />
                    </td>
                    <td className="text-center px-6 py-4">
                      {row.them ? <span className="text-xs text-slate-500">Sometimes</span> : <X size={18} className="mx-auto text-slate-600" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>
    </SectionReveal>
  );
}

/* ───────────────────────── CARRIER PARTNERS ───────────────────────── */
function CarrierPartners() {
  return (
    <SectionReveal className="py-16 relative">
      <div className="max-w-6xl mx-auto px-6">
        <SectionHeader tag="Our Partners" title="Top-Rated Carriers We Represent" accent={EMERALD} />
        <div className="flex flex-wrap justify-center gap-4">
          {CARRIERS.map((c) => (
            <div key={c} className="px-6 py-3 rounded-xl border border-white/10 bg-white/[0.03] text-slate-300 text-sm font-semibold">
              <Certificate size={16} weight="fill" className="inline mr-2" style={{ color: BLUE_LIGHT }} />{c}
            </div>
          ))}
        </div>
      </div>
    </SectionReveal>
  );
}

/* ───────────────────────── FAQ ACCORDION ───────────────────────── */
function FAQSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <SectionReveal className="py-20 md:py-28 relative" id="faq">
      <div className="absolute inset-0 opacity-15" style={{ background: `radial-gradient(ellipse at 60% 40%, ${EMERALD_GLOW}, transparent 60%)` }} />
      <div className="relative max-w-3xl mx-auto px-6">
        <SectionHeader tag="Common Questions" title="Frequently Asked Questions" accent={EMERALD} />
        <div className="space-y-3">
          {FAQ_DATA.map((faq, i) => {
            const isOpen = openIdx === i;
            return (
              <GlassCard key={i} className="overflow-hidden">
                <button onClick={() => setOpenIdx(isOpen ? null : i)} className="w-full flex items-center justify-between px-6 py-4 text-left">
                  <span className="text-white font-semibold text-sm pr-4">{faq.q}</span>
                  <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <CaretDown size={18} className="text-slate-400 flex-shrink-0" />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-4 text-sm text-slate-400 leading-relaxed">{faq.a}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </GlassCard>
            );
          })}
        </div>
      </div>
    </SectionReveal>
  );
}

/* ───────────────────────── SERVICE AREA ───────────────────────── */
function ServiceArea() {
  const areas = ["Seattle", "Bellevue", "Tacoma", "Redmond", "Kirkland", "Renton", "Federal Way", "Kent", "Everett", "Shoreline", "Burien", "Tukwila"];
  return (
    <SectionReveal className="py-20 md:py-28 relative" id="service-area">
      <div className="absolute inset-0 opacity-15" style={{ background: `radial-gradient(ellipse at 50% 50%, ${BLUE_GLOW}, transparent 60%)` }} />
      <div className="relative max-w-6xl mx-auto px-6">
        <SectionHeader tag="Service Area" title="Serving the Puget Sound Region" accent={BLUE_LIGHT} subtitle="In-office, phone, or video consultations available throughout the Seattle metro." />
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <GlassCard className="p-8" glow={BLUE_GLOW}>
            <div className="flex items-start gap-3 mb-6">
              <MapPin size={24} weight="fill" style={{ color: BLUE_LIGHT }} />
              <div>
                <p className="text-white font-semibold mb-1">Visit Our Office</p>
                <a href={MAP_LINK} target="_blank" rel="noopener noreferrer" className="text-slate-400 text-sm hover:text-blue-400 transition-colors underline">
                  {ADDRESS}
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3 mb-6">
              <Phone size={24} weight="fill" style={{ color: EMERALD }} />
              <div>
                <p className="text-white font-semibold mb-1">Call Us</p>
                <a href={`tel:${PHONE.replace(/\D/g, "")}`} className="text-slate-400 text-sm hover:text-emerald-400 transition-colors">{PHONE}</a>
              </div>
            </div>
            <div className="flex items-start gap-3 mb-6">
              <Clock size={24} weight="fill" style={{ color: GOLD }} />
              <div>
                <p className="text-white font-semibold mb-1">Office Hours</p>
                <p className="text-slate-400 text-sm">Mon-Fri 8:30am - 5:30pm</p>
                <p className="text-slate-400 text-sm">Saturday by appointment</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4 p-3 rounded-xl" style={{ background: `${EMERALD}15` }}>
              <Lightning size={18} weight="fill" style={{ color: EMERALD }} />
              <span className="text-xs font-semibold" style={{ color: EMERALD }}>Most quotes delivered within 24 hours</span>
            </div>
          </GlassCard>
          <div>
            <h3 className="text-white font-bold mb-4">Communities We Protect</h3>
            <div className="flex flex-wrap gap-2">
              {areas.map((a) => (
                <span key={a} className="px-3 py-1.5 rounded-full text-xs font-semibold border border-white/10 bg-white/[0.03] text-slate-300">
                  <MapPin size={10} weight="fill" className="inline mr-1" style={{ color: BLUE_LIGHT }} />{a}
                </span>
              ))}
            </div>
            <p className="text-slate-500 text-xs mt-4">Licensed to write policies throughout Washington State.</p>
          </div>
        </div>
      </div>
    </SectionReveal>
  );
}

/* ───────────────────────── CONTACT FORM ───────────────────────── */
function ContactForm() {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", coverageType: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <SectionReveal className="py-20 md:py-28 relative" id="contact">
      <div className="absolute inset-0 opacity-20" style={{ background: `radial-gradient(ellipse at 50% 50%, ${BLUE_GLOW}, transparent 60%)` }} />
      <div className="relative max-w-4xl mx-auto px-6">
        <SectionHeader tag="Get Started" title="Request Your Free Quote" accent={BLUE_LIGHT} subtitle="Fill out the form and Lisa will get back to you within one business day." />
        <GlassCard className="p-8 md:p-12" glow={BLUE_GLOW}>
          {submitted ? (
            <motion.div className="text-center py-12" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={spring}>
              <ShieldCheck size={64} weight="fill" className="mx-auto mb-4" style={{ color: EMERALD }} />
              <h3 className="text-2xl font-bold text-white mb-2">Quote Request Received</h3>
              <p className="text-slate-400">Lisa will review your information and contact you within one business day.</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/[0.04] text-white placeholder-slate-600 focus:border-blue-500/50 focus:outline-none transition-colors"
                  placeholder="John Smith"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/[0.04] text-white placeholder-slate-600 focus:border-blue-500/50 focus:outline-none transition-colors"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/[0.04] text-white placeholder-slate-600 focus:border-blue-500/50 focus:outline-none transition-colors"
                  placeholder="(206) 555-1234"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Coverage Needed</label>
                <select
                  value={formData.coverageType}
                  onChange={(e) => setFormData({ ...formData, coverageType: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/[0.04] text-white focus:border-blue-500/50 focus:outline-none transition-colors"
                >
                  <option value="" className="bg-slate-900">Select coverage type...</option>
                  <option value="auto" className="bg-slate-900">Auto Insurance</option>
                  <option value="home" className="bg-slate-900">Home Insurance</option>
                  <option value="life" className="bg-slate-900">Life Insurance</option>
                  <option value="business" className="bg-slate-900">Business Insurance</option>
                  <option value="bundle" className="bg-slate-900">Bundle / Multiple</option>
                  <option value="other" className="bg-slate-900">Other</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-slate-400 mb-2">Message (optional)</label>
                <textarea
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/[0.04] text-white placeholder-slate-600 focus:border-blue-500/50 focus:outline-none transition-colors resize-none"
                  placeholder="Tell us about your coverage needs..."
                />
              </div>
              <div className="md:col-span-2">
                <MagneticButton className="w-full px-8 py-4 rounded-xl text-white font-bold text-center justify-center" style={{ background: `linear-gradient(135deg, ${BLUE}, ${EMERALD})` }}>
                  <Envelope size={20} /> Submit Quote Request
                </MagneticButton>
              </div>
            </form>
          )}
        </GlassCard>
      </div>
    </SectionReveal>
  );
}

/* ───────────────────────── FINAL CTA ───────────────────────── */
function FinalCTA() {
  return (
    <SectionReveal className="py-20 md:py-28 relative">
      <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${BLUE}20, ${EMERALD}15, ${GOLD}10)` }} />
      <div className="relative max-w-4xl mx-auto px-6 text-center">
        <ShimmerBorder>
          <div className="p-10 md:p-16">
            <Shield size={48} weight="fill" className="mx-auto mb-6" style={{ color: BLUE_LIGHT }} />
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4">
              <WordReveal text="Stop Overpaying for Insurance" />
            </h2>
            <p className="text-slate-400 text-lg mb-4 max-w-xl mx-auto">
              Seattle families save an average of <span className="font-bold text-white">$427 per year</span> when they switch to {BIZ_NAME}.
            </p>
            <p className="text-slate-500 text-sm mb-8">Free quotes. No obligation. No pressure.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <MagneticButton href={`tel:${PHONE.replace(/\D/g, "")}`} className="px-10 py-5 rounded-xl text-white text-lg shadow-xl" style={{ background: `linear-gradient(135deg, ${BLUE}, ${EMERALD})` }}>
                <Phone size={22} weight="fill" /> Call {PHONE}
              </MagneticButton>
              <MagneticButton href="#contact" className="px-10 py-5 rounded-xl text-white text-lg border border-white/20 hover:bg-white/5">
                <Envelope size={22} /> Request Quote Online
              </MagneticButton>
            </div>
          </div>
        </ShimmerBorder>
      </div>
    </SectionReveal>
  );
}

/* ───────────────────────── FOOTER ───────────────────────── */
function Footer() {
  return (
    <footer className="border-t border-white/5 py-12" style={{ background: BG }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Shield size={24} weight="fill" style={{ color: BLUE_LIGHT }} />
              <span className="text-white font-bold">{BIZ_NAME}</span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed">
              Independent insurance agency serving Seattle and the greater Puget Sound area for over 30 years.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Coverage</h4>
            <div className="space-y-2">
              {["Auto Insurance", "Home Insurance", "Life Insurance", "Business Insurance", "Umbrella Insurance", "Renters Insurance"].map((c) => (
                <a key={c} href="#coverage" className="block text-slate-500 text-sm hover:text-slate-300 transition-colors">{c}</a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Contact</h4>
            <div className="space-y-2">
              <a href={`tel:${PHONE.replace(/\D/g, "")}`} className="flex items-center gap-2 text-slate-500 text-sm hover:text-slate-300 transition-colors">
                <Phone size={14} /> {PHONE}
              </a>
              <a href={MAP_LINK} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-slate-500 text-sm hover:text-slate-300 transition-colors">
                <MapPin size={14} /> {ADDRESS}
              </a>
              <div className="flex items-center gap-2 text-slate-500 text-sm">
                <Clock size={14} /> Mon-Fri 8:30am - 5:30pm
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-600 text-xs">
            &copy; {new Date().getFullYear()} {BIZ_NAME}. All rights reserved.
          </p>
          <p className="text-slate-600 text-xs flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-sky-500"><path d="M24.3 4.2c-1.5-.4-3.2.1-4.5 1.1-1-.7-2.3-1-3.5-.8-2.4.4-4.2 2.5-4.2 4.9v.6c-3.2.8-6 2.8-7.8 5.6-.3.5-.1 1.1.4 1.4.5.3 1.1.1 1.4-.4 1.5-2.3 3.7-4 6.3-4.7.5-.1 1-.1 1.5 0 .8.2 1.4.8 1.7 1.5.3.8.2 1.6-.2 2.3l-2.8 4.3c-.6.9-.4 2.1.4 2.8l2.5 2.1c.4.3.8.5 1.3.5h5.2c.5 0 1-.2 1.3-.5l1.2-1c.6-.5.8-1.3.6-2l-1-3.2c-.2-.5 0-1.1.4-1.4l3.8-2.5c1.3-.9 2.1-2.3 2.1-3.9V9.6c0-2.5-1.7-4.7-4.1-5.3v-.1z" fill="currentColor"/></svg>Created by{" "}
            <a href="https://bluejayportfolio.com" target="_blank" rel="noopener noreferrer" className="hover:text-slate-400 transition-colors underline">
              bluejayportfolio.com
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

/* ───────────────────────── MAIN PAGE ───────────────────────── */
export default function InsuranceShowcase() {
  return (
    <main className="relative overflow-x-hidden" style={{ background: BG, color: "#e2e8f0" }}>
      <FloatingParticles />
      <Nav />
      <ShieldHero />
      <TrustBar />
      <CoverageGrid />
      <AboutSection />
      <CoverageQuiz />
      <BundleCalculator />
      <CoverageChecklist />
      <ProcessSection />
      <TestimonialsSection />
      <WhyIndependent />
      <CarrierPartners />
      <FAQSection />
      <ServiceArea />
      <ContactForm />
      <FinalCTA />
      <Footer />
    </main>
  );
}
