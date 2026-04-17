"use client";

/* eslint-disable @next/next/no-img-element -- Static marketing showcase uses plain img tags intentionally */

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
  Tooth,
  Phone,
  MapPin,
  Clock,
  ArrowRight,
  Heart,
  FirstAidKit,
  SmileyWink,
  Users,
  CalendarCheck,
  CheckCircle,
  Quotes,
  X,
  List,
  CaretDown,
  Envelope,
  Camera,
  Lightning,
  Baby,
  PlayCircle,
  CreditCard,
  Sparkle,
  Timer,
  Heartbeat,
  Certificate,
  Scan,
  Brain,
  Monitor,
  FacebookLogo,
  InstagramLogo,
  LinkedinLogo,
  YoutubeLogo,
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
const TEAL = "#0d9488";
const TEAL_LIGHT = "#14b8a6";
const TEAL_GLOW = "rgba(13, 148, 136, 0.12)";
const CREAM = "#faf9f6";

/* ───────────────────────── DATA ───────────────────────── */
const SERVICES = [
  { title: "Preventive Care", desc: "Comprehensive exams, cleanings, and digital X-rays to keep your smile healthy for life.", icon: ShieldCheck },
  { title: "Cosmetic Dentistry", desc: "Veneers, whitening, and smile makeovers that transform confidence.", icon: Sparkle },
  { title: "Restorative", desc: "Crowns, bridges, implants, and fillings that look and feel completely natural.", icon: Tooth },
  { title: "Emergency Care", desc: "Same-day appointments for toothaches, broken teeth, and urgent dental needs.", icon: FirstAidKit },
  { title: "Pediatric Dentistry", desc: "Gentle, kid-friendly care that makes dental visits something to look forward to.", icon: Baby },
  { title: "Orthodontics", desc: "Invisalign and clear aligners for straighter teeth without the metal.", icon: SmileyWink },
];

const TECH = [
  { title: "Digital X-Rays", desc: "80% less radiation than traditional film. Instant, crystal-clear images.", icon: Scan },
  { title: "Intraoral Cameras", desc: "See exactly what we see. HD images of every tooth on a chairside monitor.", icon: Camera },
  { title: "Laser Dentistry", desc: "Minimally invasive gum treatment with faster healing and less discomfort.", icon: Lightning },
  { title: "3D CBCT Imaging", desc: "Three-dimensional scans for precise implant placement and complex cases.", icon: Brain },
];

const COMFORT = [
  { title: "Sedation Options", desc: "Oral and nitrous sedation so you can relax through any procedure.", icon: Heartbeat },
  { title: "Gentle Techniques", desc: "Trained in minimal-force methods. You will barely feel a thing.", icon: Heart },
  { title: "Warm Blankets & TV", desc: "Heated blankets and ceiling-mounted TVs in every treatment room.", icon: Monitor },
  { title: "No-Rush Appointments", desc: "We never double-book. Your time and comfort matter here.", icon: Timer },
];

const TESTIMONIALS = [
  { text: "Dr. Park is the first dentist I have actually looked forward to visiting. The whole team makes you feel like family.", name: "Sarah M.", stars: 5 },
  { text: "They got me in same day for a broken tooth. No lecture, just compassion and a perfect crown in one visit.", name: "James T.", stars: 5 },
  { text: "My kids BEG to go to the dentist now. That says everything about how Dr. Park runs her practice.", name: "Lisa & Tom K.", stars: 5 },
  { text: "The Invisalign results exceeded my expectations. 8 months and done. My smile has never looked this good.", name: "Rachel W.", stars: 5 },
  { text: "I avoided the dentist for 6 years. Dr. Park made me feel zero judgment. Just kindness and a solid plan.", name: "Marcus D.", stars: 5 },
];

const COMPARISON_ROWS = [
  { label: "Personal Dentist Relationship", us: true, them: "Varies" },
  { label: "Same-Day Emergency", us: true, them: "No" },
  { label: "Sedation Options", us: true, them: "Limited" },
  { label: "Insurance Filing Help", us: true, them: "Sometimes" },
  { label: "Evening & Weekend Hours", us: true, them: "No" },
  { label: "Digital X-Rays", us: true, them: "Sometimes" },
  { label: "Flexible Payment Plans", us: true, them: "No" },
];

const INSURANCE_CARRIERS = ["Delta Dental", "Cigna", "Aetna", "MetLife", "Premera"];

/* ───────────────────────── SECTION REVEAL ───────────────────────── */
function SectionReveal({ children, className = "", id, style }: { children: React.ReactNode; className?: string; id?: string; style?: React.CSSProperties }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.section
      ref={ref}
      id={id}
      className={className}
      style={style}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={spring}
    >
      {children}
    </motion.section>
  );
}

/* ───────────────────────── WARM CARD ───────────────────────── */
function WarmCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-white/80 shadow-sm hover:shadow-md transition-shadow duration-300 ${className}`}>
      {children}
    </div>
  );
}

/* ───────────────────────── MAGNETIC BUTTON ───────────────────────── */
function MagneticButton({ children, className = "", onClick, style }: { children: React.ReactNode; className?: string; onClick?: () => void; style?: React.CSSProperties }) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, springFast);
  const springY = useSpring(y, springFast);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!ref.current) return;
      if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) return;
      const rect = ref.current.getBoundingClientRect();
      x.set((e.clientX - (rect.left + rect.width / 2)) * 0.2);
      y.set((e.clientY - (rect.top + rect.height / 2)) * 0.2);
    },
    [x, y]
  );

  return (
    <motion.button
      ref={ref}
      style={{ x: springX, y: springY, willChange: "transform", ...style }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      onClick={onClick}
      className={className}
      whileTap={{ scale: 0.97 }}
    >
      {children}
    </motion.button>
  );
}

/* ───────────────────────── SHIMMER BORDER ───────────────────────── */
function ShimmerBorder({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative rounded-2xl p-[1px] overflow-hidden ${className}`}>
      <motion.div
        className="absolute inset-0 rounded-2xl"
        style={{
          background: `conic-gradient(from 0deg, transparent, ${TEAL}, transparent, ${TEAL_LIGHT}, transparent)`,
          willChange: "transform",
        }}
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      />
      <div className="relative rounded-2xl z-10 bg-white">{children}</div>
    </div>
  );
}

/* ───────────────────────── BEFORE/AFTER SLIDER ───────────────────────── */
function BeforeAfterSlider() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [sliderPos, setSliderPos] = useState(50);
  const isDragging = useRef(false);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current || !isDragging.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pos = ((clientX - rect.left) / rect.width) * 100;
    setSliderPos(Math.max(5, Math.min(95, pos)));
  }, []);

  const handleMouseDown = useCallback(() => {
    isDragging.current = true;
  }, []);

  useEffect(() => {
    const handleUp = () => { isDragging.current = false; };
    const handleMoveGlobal = (e: MouseEvent) => handleMove(e.clientX);
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) handleMove(e.touches[0].clientX);
    };
    window.addEventListener("mouseup", handleUp);
    window.addEventListener("mousemove", handleMoveGlobal);
    window.addEventListener("touchend", handleUp);
    window.addEventListener("touchmove", handleTouchMove);
    return () => {
      window.removeEventListener("mouseup", handleUp);
      window.removeEventListener("mousemove", handleMoveGlobal);
      window.removeEventListener("touchend", handleUp);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, [handleMove]);

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden cursor-ew-resize select-none shadow-lg"
      onMouseDown={handleMouseDown}
      onTouchStart={handleMouseDown}
    >
      {/* After side */}
      <div className="absolute inset-0">
        <img
          src="/images/dental-before-after.png"
          alt="After — beautiful bright smile"
          className="w-full h-full object-cover object-right"
        />
        <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-full text-white text-sm font-bold" style={{ background: TEAL }}>After</div>
      </div>
      {/* Before side */}
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}>
        <img
          src="/images/dental-before-after.png"
          alt="Before — dental transformation"
          className="w-full h-full object-cover object-left"
        />
        <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-full bg-slate-700/80 backdrop-blur-sm text-white text-sm font-bold">Before</div>
      </div>
      {/* Slider handle */}
      <div className="absolute top-0 bottom-0 w-[2px] bg-white/90 z-10" style={{ left: `${sliderPos}%` }}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center">
          <div className="flex gap-0.5">
            <CaretDown size={12} className="text-slate-800 -rotate-90" />
            <CaretDown size={12} className="text-slate-800 rotate-90" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── SECTION HEADER ───────────────────────── */
function SectionHeader({ label, title, accent }: { label: string; title: string; accent?: string }) {
  return (
    <div className="text-center mb-12 md:mb-16">
      <motion.span
        className="inline-block text-sm font-semibold tracking-widest uppercase mb-3 px-4 py-1.5 rounded-full"
        style={{ color: TEAL, background: TEAL_GLOW }}
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
      >
        {label}
      </motion.span>
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight">
        {title}{" "}
        {accent && <span style={{ color: TEAL }}>{accent}</span>}
      </h2>
    </div>
  );
}

/* ───────────────────────── SUBTLE TOOTH PATTERN BG ───────────────────────── */
function ToothPatternBg() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.035]">
      <svg width="100%" height="100%">
        <defs>
          <pattern id="toothGrid" width="80" height="100" patternUnits="userSpaceOnUse">
            <path
              d="M40 5 C25 5 10 15 12 30 C14 38 18 43 21 50 C24 58 26 68 28 73 C29 75 31 75 32 73 C34 65 36 58 40 50 C44 58 46 65 48 73 C49 75 51 75 52 73 C54 68 56 58 59 50 C62 43 66 38 68 30 C70 15 55 5 40 5Z"
              fill="currentColor"
              className="text-teal-600"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#toothGrid)" />
      </svg>
    </div>
  );
}

/* ───────────────────────── CHECKUP QUIZ ───────────────────────── */
function CheckupQuiz() {
  const [selected, setSelected] = useState<number | null>(null);

  const options = [
    { label: "Under 6 Months", color: "#22c55e", bg: "#f0fdf4", border: "#bbf7d0", emoji: "Great job!", cta: "Keep it up. Schedule your next visit to stay on track." },
    { label: "6-12 Months", color: "#f59e0b", bg: "#fffbeb", border: "#fde68a", emoji: "Time to schedule!", cta: "A quick cleaning now prevents bigger issues later." },
    { label: "Over a Year", color: "#ef4444", bg: "#fef2f2", border: "#fecaca", emoji: "Don't wait.", cta: "No judgment here. Let's get you back on track today." },
  ];

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {options.map((opt, i) => (
        <motion.button
          key={i}
          onClick={() => setSelected(i)}
          className="rounded-2xl p-6 text-left transition-all duration-300 border-2 cursor-pointer"
          style={{
            background: selected === i ? opt.bg : "white",
            borderColor: selected === i ? opt.color : "#e2e8f0",
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="text-lg font-bold mb-2" style={{ color: opt.color }}>{opt.label}</div>
          <AnimatePresence>
            {selected === i && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <p className="text-xl font-bold mb-2" style={{ color: opt.color }}>{opt.emoji}</p>
                <p className="text-slate-600 text-sm mb-4">{opt.cta}</p>
                <a
                  href="tel:2065550238"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-white text-sm font-semibold"
                  style={{ background: TEAL }}
                >
                  <Phone size={16} weight="bold" /> Book Now
                </a>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════════ */
export default function DentalShowcasePage() {
  const [mobileNav, setMobileNav] = useState(false);
  const [contactForm, setContactForm] = useState({ name: "", email: "", phone: "", service: "", message: "" });

  const NAV_LINKS = [
    { label: "Services", href: "#services" },
    { label: "About", href: "#about" },
    { label: "Testimonials", href: "#testimonials" },
    { label: "Insurance", href: "#insurance" },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <div className="relative min-h-screen overflow-x-hidden" style={{ background: CREAM }}>

      {/* ─── NAV ─── */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-slate-200/60 bg-white/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-16">
          <a href="#" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: TEAL }}>
              <Tooth size={18} weight="fill" className="text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900">Emerald City Dental</span>
          </a>
          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((l) => (
              <a key={l.label} href={l.href} className="text-sm font-medium text-slate-600 hover:text-teal-600 transition-colors">{l.label}</a>
            ))}
            <a
              href="tel:2065550238"
              className="px-5 py-2 rounded-full text-sm font-semibold text-white transition-transform hover:scale-105"
              style={{ background: TEAL }}
            >
              (206) 555-0238
            </a>
          </div>
          {/* Mobile hamburger */}
          <button onClick={() => setMobileNav(!mobileNav)} className="md:hidden p-2 rounded-lg text-slate-700">
            {mobileNav ? <X size={24} /> : <List size={24} />}
          </button>
        </div>
        {/* Mobile menu */}
        <AnimatePresence>
          {mobileNav && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-t border-slate-200 overflow-hidden"
            >
              <div className="px-6 py-4 space-y-4">
                {NAV_LINKS.map((l) => (
                  <a key={l.label} href={l.href} onClick={() => setMobileNav(false)} className="block text-slate-700 font-medium">{l.label}</a>
                ))}
                <a href="tel:2065550238" className="block text-center px-5 py-3 rounded-full text-white font-semibold" style={{ background: TEAL }}>
                  Call (206) 555-0238
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ═══════════════════════════════════════════
          SECTION 1 — HERO (Split layout, warm light)
          ═══════════════════════════════════════════ */}
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden" style={{ background: CREAM }}>
        <ToothPatternBg />
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left — Text */}
            <motion.div variants={stagger} initial="hidden" animate="show">
              <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-teal-200 bg-teal-50 mb-6">
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                <span className="text-sm font-medium text-teal-700">Accepting New Patients</span>
              </motion.div>
              <motion.h1 variants={fadeUp} className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 leading-[1.1] mb-6">
                Seattle Smiles{" "}
                <span style={{ color: TEAL }}>Start Here</span>
              </motion.h1>
              <motion.p variants={fadeUp} className="text-lg text-slate-500 leading-relaxed mb-8 max-w-lg">
                Dr. Megan Park and her team have been crafting confident smiles in Seattle for over 12 years. Gentle care, modern technology, and a practice that feels like home.
              </motion.p>
              <motion.div variants={fadeUp} className="flex flex-wrap gap-4 mb-10">
                <MagneticButton className="px-8 py-4 rounded-full text-white font-semibold text-base shadow-lg shadow-teal-500/20 hover:shadow-teal-500/40 transition-shadow" style={{ background: TEAL }}>
                  <span className="flex items-center gap-2">
                    <CalendarCheck size={20} weight="bold" /> Book Appointment
                  </span>
                </MagneticButton>
                <a
                  href="tel:2065550238"
                  className="flex items-center gap-2 px-8 py-4 rounded-full border-2 border-slate-300 text-slate-700 font-semibold hover:border-teal-400 hover:text-teal-700 transition-colors"
                >
                  <Phone size={20} weight="bold" /> (206) 555-0238
                </a>
              </motion.div>
              {/* Trust pills */}
              <motion.div variants={fadeUp} className="flex flex-wrap gap-3">
                {[
                  { icon: Star, text: "4.9 Stars on Google" },
                  { icon: Users, text: "Accepting New Patients" },
                  { icon: ShieldCheck, text: "Insurance Welcome" },
                ].map((pill) => (
                  <div key={pill.text} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm">
                    <pill.icon size={16} weight="fill" style={{ color: TEAL }} />
                    <span className="text-sm font-medium text-slate-600">{pill.text}</span>
                  </div>
                ))}
              </motion.div>
            </motion.div>
            {/* Right — Photo */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-teal-500/10">
                <img
                  src="https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=700&q=80"
                  alt="Beautiful confident smile from Emerald City Dental patient"
                  className="w-full aspect-[4/5] object-cover object-top"
                />
                {/* Floating stat card */}
                <motion.div
                  className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-white/90 backdrop-blur-lg border border-white/60 shadow-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1, duration: 0.6 }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-500">Trusted by</p>
                      <p className="text-2xl font-bold text-slate-900">2,000+ Patients</p>
                    </div>
                    <div className="flex -space-x-2">
                      {[0, 1, 2, 3].map((i) => (
                        <div key={i} className="w-9 h-9 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-white" style={{ background: i % 2 === 0 ? TEAL : TEAL_LIGHT }}>
                          {["SM", "JT", "LK", "RW"][i]}
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </div>
              {/* Decorative teal blob */}
              <div className="absolute -z-10 -top-8 -right-8 w-48 h-48 rounded-full opacity-20" style={{ background: TEAL, filter: "blur(60px)" }} />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 2 — TRUST BAR
          ═══════════════════════════════════════════ */}
      <SectionReveal className="py-6 border-y border-slate-200/60 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm font-semibold text-slate-500">
            {["12 Years Experience", "UW Trained", "Fellow of AGD", "2,000+ Smiles", "Same-Day Emergency"].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <CheckCircle size={16} weight="fill" style={{ color: TEAL }} />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ═══════════════════════════════════════════
          SECTION 3 — SERVICES SHOWCASE (2x3 grid)
          ═══════════════════════════════════════════ */}
      <SectionReveal id="services" className="py-20 md:py-28" style={{ background: CREAM }}>
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeader label="What We Offer" title="Complete Dental" accent="Care" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map((svc, i) => (
              <motion.div
                key={svc.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, ...spring }}
              >
                <WarmCard className="p-6 md:p-8 h-full group hover:border-teal-300 transition-colors duration-300">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ background: TEAL_GLOW }}>
                    <svc.icon size={24} weight="duotone" style={{ color: TEAL }} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{svc.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed mb-4">{svc.desc}</p>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold group-hover:gap-2 transition-all" style={{ color: TEAL }}>
                    Learn More <ArrowRight size={14} weight="bold" />
                  </span>
                </WarmCard>
              </motion.div>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ═══════════════════════════════════════════
          SECTION 4 — SMILE TRANSFORMATION (Before/After)
          ═══════════════════════════════════════════ */}
      <SectionReveal className="py-20 md:py-28 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <SectionHeader label="Real Results" title="Smile" accent="Transformations" />
          <BeforeAfterSlider />
          <p className="text-center text-slate-500 text-sm mt-6">Drag the slider to see the transformation. Results from actual Emerald City Dental patients.</p>
        </div>
      </SectionReveal>

      {/* ═══════════════════════════════════════════
          SECTION 5 — INSURANCE & PAYMENT
          ═══════════════════════════════════════════ */}
      <SectionReveal id="insurance" className="py-20 md:py-28" style={{ background: CREAM }}>
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeader label="Affordable Care" title="We Accept Most" accent="Insurance" />
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Carrier badges */}
            <div>
              <p className="text-slate-600 mb-6">We work with all major insurance carriers and handle the paperwork for you.</p>
              <div className="flex flex-wrap gap-3 mb-8">
                {INSURANCE_CARRIERS.map((name) => (
                  <div key={name} className="px-5 py-3 rounded-xl bg-white border border-slate-200 shadow-sm text-sm font-semibold text-slate-700 hover:border-teal-300 transition-colors">
                    {name}
                  </div>
                ))}
              </div>
              <p className="text-sm text-slate-500">
                Don&apos;t see your carrier? Call us at{" "}
                <a href="tel:2065550238" className="font-semibold underline" style={{ color: TEAL }}>(206) 555-0238</a>{" "}
                and we will check for you.
              </p>
            </div>
            {/* Payment options */}
            <div className="space-y-4">
              {[
                { title: "Flexible Payment Plans", desc: "Monthly payments starting at $49/mo with 0% interest options.", icon: CreditCard },
                { title: "CareCredit Accepted", desc: "Apply in office and get an answer in minutes. No awkward conversations.", icon: Certificate },
                { title: "In-House Savings Plan", desc: "No insurance? Our membership plan covers cleanings, exams, and 15% off all treatments.", icon: Heart },
              ].map((item) => (
                <WarmCard key={item.title} className="p-5 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: TEAL_GLOW }}>
                    <item.icon size={20} weight="duotone" style={{ color: TEAL }} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 mb-1">{item.title}</h4>
                    <p className="text-sm text-slate-500">{item.desc}</p>
                  </div>
                </WarmCard>
              ))}
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* ═══════════════════════════════════════════
          SECTION 6 — PATIENT COMFORT
          ═══════════════════════════════════════════ */}
      <SectionReveal className="py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeader label="Your Comfort Matters" title="We Know Dental Anxiety" accent="Is Real" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {COMFORT.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, ...spring }}
              >
                <WarmCard className="p-6 text-center h-full">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: TEAL_GLOW }}>
                    <item.icon size={28} weight="duotone" style={{ color: TEAL }} />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                </WarmCard>
              </motion.div>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ═══════════════════════════════════════════
          SECTION 7 — MEET DR. PARK
          ═══════════════════════════════════════════ */}
      <SectionReveal id="about" className="py-20 md:py-28" style={{ background: CREAM }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-5 gap-12 items-center">
            {/* Photo — 2 columns */}
            <div className="lg:col-span-2">
              <div className="relative rounded-3xl overflow-hidden shadow-xl">
                <img
                  src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600&q=80"
                  alt="Dr. Megan Park, DDS — Lead Dentist at Emerald City Dental"
                  className="w-full aspect-[3/4] object-cover object-top"
                />
                <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black/70 to-transparent">
                  <p className="text-white font-bold text-xl">Dr. Megan Park, DDS</p>
                  <p className="text-white/80 text-sm">Lead Dentist, Fellow of AGD</p>
                </div>
              </div>
            </div>
            {/* Bio — 3 columns */}
            <div className="lg:col-span-3">
              <motion.span
                className="inline-block text-sm font-semibold tracking-widest uppercase mb-4 px-4 py-1.5 rounded-full"
                style={{ color: TEAL, background: TEAL_GLOW }}
              >
                Meet Your Dentist
              </motion.span>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                A Dentist Who Actually{" "}
                <span style={{ color: TEAL }}>Listens</span>
              </h2>
              <p className="text-slate-500 leading-relaxed mb-4">
                Dr. Park grew up in Bellevue, graduated from UW School of Dentistry, and has spent the last 12 years building a practice rooted in one belief: no one should dread going to the dentist. She is a Fellow of the Academy of General Dentistry and completes over 100 hours of continuing education every year to bring Seattle the latest in gentle, effective care.
              </p>
              <p className="text-slate-500 leading-relaxed mb-8">
                When she is not in the office, you will find her hiking with her golden retriever, exploring Pike Place Market, or volunteering dental care through Seattle&apos;s Mission of Mercy program.
              </p>
              {/* Stat boxes */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { num: "12+", label: "Years" },
                  { num: "2,000+", label: "Patients" },
                  { num: "100+", label: "CE Hours/yr" },
                  { num: "4.9", label: "Google Rating" },
                ].map((s) => (
                  <div key={s.label} className="text-center p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
                    <p className="text-2xl font-bold" style={{ color: TEAL }}>{s.num}</p>
                    <p className="text-xs text-slate-500 font-medium">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* ═══════════════════════════════════════════
          SECTION 8 — TECHNOLOGY
          ═══════════════════════════════════════════ */}
      <SectionReveal className="py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeader label="Modern Practice" title="Advanced Dental" accent="Technology" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TECH.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, ...spring }}
              >
                <WarmCard className="p-6 h-full hover:border-teal-300 transition-colors duration-300">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: TEAL_GLOW }}>
                    <item.icon size={24} weight="duotone" style={{ color: TEAL }} />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                </WarmCard>
              </motion.div>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ═══════════════════════════════════════════
          SECTION 9 — TESTIMONIALS (Staggered Grid)
          ═══════════════════════════════════════════ */}
      <SectionReveal id="testimonials" className="py-20 md:py-28" style={{ background: CREAM }}>
        <div className="max-w-7xl mx-auto px-6">
          {/* Google reviews header */}
          <div className="text-center mb-4">
            <div className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={18} weight="fill" className="text-amber-400" />
                ))}
              </div>
              <span>4.9 out of 5 from 127 Google Reviews</span>
            </div>
          </div>
          <SectionHeader label="Patient Stories" title="Hear From Our" accent="Patients" />
          {/* Staggered grid — different from Real Estate carousel */}
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, ...spring }}
                className="break-inside-avoid"
              >
                <WarmCard className="p-6">
                  <Quotes size={24} weight="fill" className="mb-3 opacity-20" style={{ color: TEAL }} />
                  <p className="text-slate-700 leading-relaxed mb-4">&ldquo;{t.text}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ background: TEAL }}>
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">{t.name}</p>
                      <div className="flex gap-0.5">
                        {[...Array(t.stars)].map((_, j) => (
                          <Star key={j} size={12} weight="fill" className="text-amber-400" />
                        ))}
                      </div>
                    </div>
                    <CheckCircle size={16} weight="fill" className="ml-auto text-teal-500" />
                  </div>
                </WarmCard>
              </motion.div>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ═══════════════════════════════════════════
          SECTION 10 — NEW PATIENT SPECIAL
          ═══════════════════════════════════════════ */}
      <SectionReveal className="py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-6">
          <ShimmerBorder>
            <div className="p-8 md:p-12 text-center">
              <motion.div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-teal-200 bg-teal-50 mb-6"
                animate={{ scale: [1, 1.03, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkle size={16} weight="fill" style={{ color: TEAL }} />
                <span className="text-sm font-semibold" style={{ color: TEAL }}>Limited Availability This Month</span>
              </motion.div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                New Patient Special:{" "}
                <span style={{ color: TEAL }}>$99</span>
              </h2>
              <p className="text-lg text-slate-500 mb-8">Comprehensive Exam, Full Digital X-Rays & Professional Cleaning</p>
              <div className="flex flex-wrap justify-center gap-4">
                <MagneticButton className="px-8 py-4 rounded-full text-white font-semibold shadow-lg shadow-teal-500/20" style={{ background: TEAL }}>
                  <span className="flex items-center gap-2"><CalendarCheck size={20} weight="bold" /> Claim This Offer</span>
                </MagneticButton>
                <a href="tel:2065550238" className="flex items-center gap-2 px-8 py-4 rounded-full border-2 border-slate-300 text-slate-700 font-semibold hover:border-teal-400 transition-colors">
                  <Phone size={20} weight="bold" /> Call Now
                </a>
              </div>
            </div>
          </ShimmerBorder>
        </div>
      </SectionReveal>

      {/* ═══════════════════════════════════════════
          SECTION 11 — CHECKUP QUIZ
          ═══════════════════════════════════════════ */}
      <SectionReveal className="py-20 md:py-28 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <SectionHeader label="Quick Check" title="When Was Your Last" accent="Checkup?" />
          <CheckupQuiz />
        </div>
      </SectionReveal>

      {/* ═══════════════════════════════════════════
          SECTION 12 — COMPETITOR COMPARISON
          ═══════════════════════════════════════════ */}
      <SectionReveal className="py-20 md:py-28" style={{ background: CREAM }}>
        <div className="max-w-4xl mx-auto px-6">
          <SectionHeader label="Why Us" title="Emerald City Dental vs" accent="Chain Dentistry" />
          <WarmCard className="overflow-hidden">
            {/* Header row */}
            <div className="grid grid-cols-3 border-b border-slate-200 font-bold text-sm">
              <div className="p-4 text-slate-900">Feature</div>
              <div className="p-4 text-center text-white" style={{ background: TEAL }}>Emerald City</div>
              <div className="p-4 text-center text-slate-500 bg-slate-50">Chain Office</div>
            </div>
            {COMPARISON_ROWS.map((row, i) => (
              <div key={row.label} className={`grid grid-cols-3 text-sm ${i < COMPARISON_ROWS.length - 1 ? "border-b border-slate-100" : ""}`}>
                <div className="p-4 text-slate-700 font-medium">{row.label}</div>
                <div className="p-4 text-center">
                  <CheckCircle size={20} weight="fill" className="inline-block text-teal-500" />
                </div>
                <div className="p-4 text-center text-slate-400 bg-slate-50/50">{row.them}</div>
              </div>
            ))}
          </WarmCard>
        </div>
      </SectionReveal>

      {/* ═══════════════════════════════════════════
          SECTION 13 — VIDEO TOUR PLACEHOLDER
          ═══════════════════════════════════════════ */}
      <SectionReveal className="py-20 md:py-28 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <SectionHeader label="Our Space" title="Take a Virtual" accent="Office Tour" />
          <div className="relative rounded-3xl overflow-hidden shadow-xl group cursor-pointer">
            <img
              src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=900&q=80"
              alt="Emerald City Dental office interior — modern, warm, and welcoming"
              className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/40 transition-colors">
              <motion.div
                className="w-20 h-20 rounded-full bg-white/90 flex items-center justify-center shadow-xl"
                whileHover={{ scale: 1.1 }}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <PlayCircle size={48} weight="fill" style={{ color: TEAL }} />
              </motion.div>
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* ═══════════════════════════════════════════
          SECTION 14 — CONTACT SECTION
          ═══════════════════════════════════════════ */}
      <SectionReveal id="contact" className="py-20 md:py-28" style={{ background: CREAM }}>
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeader label="Get In Touch" title="Schedule Your" accent="Visit" />
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Form */}
            <WarmCard className="p-8">
              <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-400 transition-colors"
                    placeholder="Your name"
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-400 transition-colors"
                      placeholder="email@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={contactForm.phone}
                      onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-400 transition-colors"
                      placeholder="(206) 555-0000"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Service Needed</label>
                  <select
                    value={contactForm.service}
                    onChange={(e) => setContactForm({ ...contactForm, service: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-400 transition-colors"
                  >
                    <option value="">Select a service...</option>
                    <option value="cleaning">Cleaning & Exam</option>
                    <option value="cosmetic">Cosmetic Dentistry</option>
                    <option value="emergency">Emergency Care</option>
                    <option value="invisalign">Invisalign / Orthodontics</option>
                    <option value="restorative">Restorative (Crowns, Implants)</option>
                    <option value="pediatric">Pediatric Dentistry</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
                  <textarea
                    rows={4}
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-400 transition-colors resize-none"
                    placeholder="Tell us how we can help..."
                  />
                </div>
                <MagneticButton className="w-full py-4 rounded-xl text-white font-semibold text-base shadow-lg shadow-teal-500/20" style={{ background: TEAL }}>
                  <span className="flex items-center justify-center gap-2"><CalendarCheck size={20} weight="bold" /> Request Appointment</span>
                </MagneticButton>
              </form>
            </WarmCard>
            {/* Office info */}
            <div className="space-y-6">
              <WarmCard className="p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Office Information</h3>
                <div className="space-y-4">
                  <a href="https://maps.google.com/?q=4215+Stone+Way+N+Suite+101+Seattle+WA+98103" target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 text-slate-600 hover:text-teal-600 transition-colors">
                    <MapPin size={20} weight="fill" style={{ color: TEAL }} className="shrink-0 mt-0.5" />
                    <span>4215 Stone Way N, Suite 101<br />Seattle, WA 98103</span>
                  </a>
                  <a href="tel:2065550238" className="flex items-center gap-3 text-slate-600 hover:text-teal-600 transition-colors">
                    <Phone size={20} weight="fill" style={{ color: TEAL }} />
                    <span>(206) 555-0238</span>
                  </a>
                  <a href="mailto:smile@emeraldcitydental.com" className="flex items-center gap-3 text-slate-600 hover:text-teal-600 transition-colors">
                    <Envelope size={20} weight="fill" style={{ color: TEAL }} />
                    <span>smile@emeraldcitydental.com</span>
                  </a>
                </div>
              </WarmCard>
              <WarmCard className="p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Office Hours</h3>
                <div className="space-y-2 text-sm">
                  {[
                    { day: "Monday - Thursday", hours: "8:00 AM - 6:00 PM" },
                    { day: "Friday", hours: "8:00 AM - 4:00 PM" },
                    { day: "Saturday", hours: "9:00 AM - 2:00 PM" },
                    { day: "Sunday", hours: "Closed" },
                  ].map((h) => (
                    <div key={h.day} className="flex justify-between">
                      <span className="text-slate-600">{h.day}</span>
                      <span className="font-semibold text-slate-900">{h.hours}</span>
                    </div>
                  ))}
                </div>
              </WarmCard>
              {/* Emergency CTA */}
              <div className="p-6 rounded-2xl border-2 border-red-200 bg-red-50">
                <div className="flex items-center gap-3 mb-3">
                  <motion.div
                    className="w-3 h-3 rounded-full bg-red-500"
                    animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  <h3 className="text-lg font-bold text-red-800">Same-Day Emergency?</h3>
                </div>
                <p className="text-red-700 text-sm mb-4">Broken tooth, severe pain, or dental trauma? We reserve emergency slots every day.</p>
                <a
                  href="tel:2065550238"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors"
                >
                  <Phone size={18} weight="bold" /> Call Now - (206) 555-0238
                </a>
              </div>
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* ═══════════════════════════════════════════
          SECTION 15 — FOOTER
          ═══════════════════════════════════════════ */}
      <footer className="py-16 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: TEAL }}>
                  <Tooth size={18} weight="fill" className="text-white" />
                </div>
                <span className="text-lg font-bold">Emerald City Dental</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Seattle Smiles Start Here. Gentle, modern dental care for the whole family.
              </p>
              <div className="flex gap-3">
                {[FacebookLogo, InstagramLogo, LinkedinLogo, YoutubeLogo].map((Icon, i) => (
                  <a key={i} href="#" className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-teal-500/20 transition-colors">
                    <Icon size={18} className="text-slate-300" />
                  </a>
                ))}
              </div>
            </div>
            {/* Quick Links */}
            <div>
              <h4 className="font-bold text-sm uppercase tracking-wider mb-4 text-slate-300">Quick Links</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                {["Services", "About Dr. Park", "Patient Stories", "Insurance", "New Patient Special", "Contact"].map((link) => (
                  <li key={link}><a href="#" className="hover:text-teal-400 transition-colors">{link}</a></li>
                ))}
              </ul>
            </div>
            {/* Services */}
            <div>
              <h4 className="font-bold text-sm uppercase tracking-wider mb-4 text-slate-300">Services</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                {SERVICES.map((s) => (
                  <li key={s.title}><a href="#" className="hover:text-teal-400 transition-colors">{s.title}</a></li>
                ))}
              </ul>
            </div>
            {/* Contact */}
            <div>
              <h4 className="font-bold text-sm uppercase tracking-wider mb-4 text-slate-300">Contact</h4>
              <div className="space-y-3 text-sm text-slate-400">
                <a href="https://maps.google.com/?q=4215+Stone+Way+N+Suite+101+Seattle+WA+98103" target="_blank" rel="noopener noreferrer" className="flex items-start gap-2 hover:text-teal-400 transition-colors">
                  <MapPin size={16} className="shrink-0 mt-0.5" />
                  <span>4215 Stone Way N, Suite 101<br />Seattle, WA 98103</span>
                </a>
                <a href="tel:2065550238" className="flex items-center gap-2 hover:text-teal-400 transition-colors">
                  <Phone size={16} />
                  <span>(206) 555-0238</span>
                </a>
                <a href="mailto:smile@emeraldcitydental.com" className="flex items-center gap-2 hover:text-teal-400 transition-colors">
                  <Envelope size={16} />
                  <span>smile@emeraldcitydental.com</span>
                </a>
              </div>
            </div>
          </div>
          {/* Bottom bar */}
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div className="flex flex-wrap items-center gap-4">
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={14} style={{ color: TEAL }} /> ADA Member Practice
              </span>
              <span>WA State License #DT-00482913</span>
            </div>
            <p className="flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-sky-500"><path d="M24.3 4.2c-1.5-.4-3.2.1-4.5 1.1-1-.7-2.3-1-3.5-.8-2.4.4-4.2 2.5-4.2 4.9v.6c-3.2.8-6 2.8-7.8 5.6-.3.5-.1 1.1.4 1.4.5.3 1.1.1 1.4-.4 1.5-2.3 3.7-4 6.3-4.7.5-.1 1-.1 1.5 0 .8.2 1.4.8 1.7 1.5.3.8.2 1.6-.2 2.3l-2.8 4.3c-.6.9-.4 2.1.4 2.8l2.5 2.1c.4.3.8.5 1.3.5h5.2c.5 0 1-.2 1.3-.5l1.2-1c.6-.5.8-1.3.6-2l-1-3.2c-.2-.5 0-1.1.4-1.4l3.8-2.5c1.3-.9 2.1-2.3 2.1-3.9V9.6c0-2.5-1.7-4.7-4.1-5.3v-.1z" fill="currentColor"/></svg>Created by{" "}
              <a href="https://bluejayportfolio.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-teal-400 transition-colors">
                bluejayportfolio.com
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
