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
  Heartbeat,
  Stethoscope,
  FirstAidKit,
  Syringe,
  ShieldCheck,
  Phone,
  MapPin,
  Clock,
  ArrowRight,
  CaretDown,
  Quotes,
  CalendarCheck,
  Users,
  VideoCamera,
  Flask,
  UserCircle,
  Clipboard,
  X,
  List,
  CheckCircle,
  Pulse,
} from "@phosphor-icons/react";

/* ───────────────────────── SPRING CONFIG ───────────────────────── */
const spring = { type: "spring" as const, stiffness: 100, damping: 20 };
const springFast = { type: "spring" as const, stiffness: 200, damping: 25 };
const springGentle = { type: "spring" as const, stiffness: 60, damping: 18 };

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
const TEAL = "#0891b2";
const TEAL_LIGHT = "#22d3ee";
const TEAL_GLOW = "rgba(8, 145, 178, 0.15)";
const WHITE = "#ffffff";

/* ───────────────────────── FLOATING PULSE PARTICLES ───────────────────────── */
function FloatingPulses() {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 8,
    duration: 7 + Math.random() * 6,
    size: 2 + Math.random() * 3,
    opacity: 0.1 + Math.random() * 0.25,
  }));

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden hidden md:block">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            width: p.size,
            height: p.size,
            background: TEAL_LIGHT,
            willChange: "transform, opacity",
          }}
          animate={{
            y: ["-10vh", "110vh"],
            opacity: [0, p.opacity, p.opacity, 0],
          }}
          transition={{
            y: { duration: p.duration, repeat: Infinity, delay: p.delay, ease: "linear" },
            opacity: {
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              times: [0, 0.1, 0.9, 1],
            },
          }}
        />
      ))}
    </div>
  );
}

/* ───────────────────────── WORD REVEAL ───────────────────────── */
function WordReveal({ text, className = "" }: { text: string; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const words = text.split(" ");

  return (
    <motion.span
      ref={ref}
      className={`inline-flex flex-wrap gap-x-3 ${className}`}
      variants={stagger}
      initial="hidden"
      animate={isInView ? "show" : "hidden"}
    >
      {words.map((word, i) => (
        <motion.span key={i} variants={fadeUp} className="inline-block">
          {word}
        </motion.span>
      ))}
    </motion.span>
  );
}

/* ───────────────────────── SECTION REVEAL ───────────────────────── */
function SectionReveal({
  children,
  className = "",
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.section
      ref={ref}
      id={id}
      className={className}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={spring}
    >
      {children}
    </motion.section>
  );
}

/* ───────────────────────── GLASS CARD ───────────────────────── */
function GlassCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-white/15 bg-white/[0.08] backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] ${className}`}
    >
      {children}
    </div>
  );
}

/* ───────────────────────── MAGNETIC BUTTON ───────────────────────── */
function MagneticButton({
  children,
  className = "",
  onClick,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, springFast);
  const springY = useSpring(y, springFast);

  const isTouchDevice =
    typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!ref.current || isTouchDevice) return;
      const rect = ref.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      x.set((e.clientX - cx) * 0.25);
      y.set((e.clientY - cy) * 0.25);
    },
    [x, y, isTouchDevice]
  );

  const handleMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  return (
    <motion.button
      ref={ref}
      style={{ x: springX, y: springY, willChange: "transform", ...style }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
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
      <div className="relative rounded-2xl z-10" style={{ background: BG }}>{children}</div>
    </div>
  );
}

/* ───────────────────────── STETHOSCOPE SVG ───────────────────────── */
function StethoscopeSVG() {
  return (
    <div className="relative flex items-center justify-center">
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{ background: `radial-gradient(circle, ${TEAL_GLOW} 0%, transparent 70%)`, filter: "blur(40px)" }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      <svg viewBox="0 0 200 240" className="relative z-10 w-48 h-56 md:w-56 md:h-72" fill="none">
        <motion.circle cx="100" cy="115" r="92" stroke={TEAL} strokeWidth="0.5" opacity={0.12}
          animate={{ r: [90, 94, 90] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} />
        <motion.circle cx="100" cy="115" r="82" stroke={TEAL_LIGHT} strokeWidth="0.3" opacity={0.08}
          animate={{ r: [80, 84, 80] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }} />

        {/* Earpieces */}
        <motion.circle cx="55" cy="30" r="8" fill={`${TEAL}22`} stroke={TEAL} strokeWidth="2"
          initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, ease: "backOut" }} />
        <circle cx="55" cy="28" rx="3" ry="4" fill={`${TEAL}0d`} />
        <motion.circle cx="145" cy="30" r="8" fill={`${TEAL}22`} stroke={TEAL} strokeWidth="2"
          initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.4, ease: "backOut" }} />
        <circle cx="145" cy="28" rx="3" ry="4" fill={`${TEAL}0d`} />

        {/* Tubes from earpieces */}
        <motion.path d="M55 38 L55 55 Q55 75 75 85" stroke={TEAL} strokeWidth="2.5" fill="none" strokeLinecap="round"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8, delay: 0.5 }} />
        <motion.path d="M145 38 L145 55 Q145 75 125 85" stroke={TEAL} strokeWidth="2.5" fill="none" strokeLinecap="round"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8, delay: 0.6 }} />

        {/* Y-junction */}
        <motion.path d="M75 85 Q100 95 125 85" stroke={TEAL} strokeWidth="2.5" fill="none" strokeLinecap="round"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 1 }} />

        {/* Main tube going down */}
        <motion.path d="M100 90 L100 140 Q100 170 120 180 Q145 192 145 165 L145 145"
          stroke={TEAL} strokeWidth="2.5" fill="none" strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.5, delay: 1.2 }} />

        {/* Chest piece (diaphragm) */}
        <motion.circle cx="145" cy="140" r="18" fill={`${TEAL}22`} stroke={TEAL} strokeWidth="2.5"
          initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 2, ease: "backOut" }} />
        <circle cx="145" cy="137" r="10" fill={`${TEAL}0d`} />
        <motion.circle cx="145" cy="140" r="6" fill={`${TEAL}15`} stroke={TEAL_LIGHT} strokeWidth="1"
          initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 2.3 }} />

        {/* Heartbeat line through center */}
        <motion.path
          d="M30 155 L55 155 L62 142 L70 165 L78 130 L86 170 L92 142 L100 155 L170 155"
          stroke={TEAL_LIGHT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: [0, 1, 1, 0], opacity: [0, 1, 1, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", times: [0, 0.4, 0.6, 1] }} />

        {/* Medical cross */}
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5 }}>
          <rect x="45" y="195" width="20" height="6" rx="2" fill={TEAL_LIGHT} opacity={0.3} />
          <rect x="52" y="188" width="6" height="20" rx="2" fill={TEAL_LIGHT} opacity={0.3} />
        </motion.g>

        {/* Sparkle accents */}
        <motion.circle cx="170" cy="50" r="3" fill={TEAL_LIGHT}
          animate={{ opacity: [0.2, 1, 0.2], scale: [0.7, 1.3, 0.7] }}
          transition={{ duration: 2.5, repeat: Infinity }} />
        <motion.circle cx="25" cy="70" r="2" fill={TEAL}
          animate={{ opacity: [0.1, 0.8, 0.1], scale: [0.5, 1.2, 0.5] }}
          transition={{ duration: 3, repeat: Infinity, delay: 0.8 }} />
        <motion.circle cx="180" cy="120" r="2.5" fill={TEAL_LIGHT}
          animate={{ opacity: [0.15, 0.7, 0.15] }}
          transition={{ duration: 2, repeat: Infinity, delay: 1.2 }} />
        <motion.circle cx="20" cy="140" r="2" fill={TEAL}
          animate={{ opacity: [0.1, 0.6, 0.1] }}
          transition={{ duration: 2.5, repeat: Infinity, delay: 0.4 }} />
      </svg>
    </div>
  );
}

/* ───────────────────────── ACCORDION ───────────────────────── */
function AccordionItem({
  title,
  description,
  isOpen,
  onToggle,
}: {
  title: string;
  description: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <GlassCard className="overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-5 md:p-6 text-left group cursor-pointer"
      >
        <span className="text-lg font-semibold text-white">{title}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={spring}>
          <CaretDown size={20} className="text-slate-400" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={spring}
            className="overflow-hidden"
          >
            <p className="px-5 pb-5 md:px-6 md:pb-6 text-slate-400 leading-relaxed">
              {description}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
}

/* ───────────────────────── DATA ───────────────────────── */
const services = [
  { title: "Primary Care", description: "Comprehensive health management including annual physicals, chronic disease management, preventive screenings, and personalized wellness plans.", icon: Heartbeat },
  { title: "Urgent Care", description: "Walk-in treatment for non-life-threatening conditions including minor injuries, infections, allergies, and acute illnesses. No appointment needed.", icon: FirstAidKit },
  { title: "Specialists", description: "In-house cardiology, dermatology, orthopedics, and endocrinology. Seamless referrals and coordinated care under one roof.", icon: Stethoscope },
  { title: "Lab & Diagnostics", description: "On-site blood work, imaging, X-rays, ultrasound, and advanced diagnostic testing with rapid results delivered to your patient portal.", icon: Flask },
  { title: "Preventive Care", description: "Immunizations, health screenings, wellness exams, and lifestyle counseling designed to catch issues early and keep you at your healthiest.", icon: ShieldCheck },
  { title: "Telehealth", description: "Virtual appointments from the comfort of home. Consult with your physician via secure video for follow-ups, prescriptions, and non-emergency concerns.", icon: VideoCamera },
];

const stats = [
  { value: "25+", label: "Years Serving Our Community" },
  { value: "50K+", label: "Patients Cared For" },
  { value: "4.9", label: "Average Patient Rating" },
  { value: "98%", label: "Patient Satisfaction" },
];

const insuranceProviders = [
  "Blue Cross Blue Shield", "Aetna", "UnitedHealthcare", "Cigna",
  "Humana", "Kaiser Permanente", "Medicare", "Medicaid",
];

const testimonials = [
  {
    name: "Robert T.",
    text: "After years of feeling like just a number, I finally found a practice that truly listens. The doctors here take the time to understand my concerns and explain everything clearly.",
    rating: 5,
  },
  {
    name: "Sandra M.",
    text: "The telehealth option has been a game changer for our family. We can consult with our doctor without missing work or school. Incredibly convenient and professional.",
    rating: 5,
  },
  {
    name: "William & Grace K.",
    text: "Our entire family sees doctors here. From our kids' check-ups to our own specialist visits, the coordinated care is seamless. We trust them completely.",
    rating: 5,
  },
];

const faqData = [
  { title: "Are you accepting new patients?", description: "Yes! We are currently welcoming new patients of all ages. You can schedule your first appointment online or by calling our office. We recommend arriving 15 minutes early to complete intake forms." },
  { title: "What insurance plans do you accept?", description: "We accept most major insurance plans including Blue Cross, Aetna, UnitedHealthcare, Cigna, Humana, Medicare, and Medicaid. Contact our billing team to verify your specific plan coverage." },
  { title: "Do you offer same-day appointments?", description: "Yes. Our urgent care clinic accepts walk-ins and same-day appointments for acute conditions. For primary care, same-day availability depends on scheduling but we always accommodate urgent needs." },
  { title: "How does your patient portal work?", description: "Our secure online portal lets you view lab results, request prescription refills, message your care team, schedule appointments, and access your complete medical records anytime." },
  { title: "What should I bring to my first visit?", description: "Please bring your photo ID, insurance card, a list of current medications, and any relevant medical records or imaging from previous providers. Arriving 15 minutes early helps us get you started on time." },
];

/* ═══════════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════════ */
export default function V2MedicalPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <main
      className="relative min-h-[100dvh] overflow-x-hidden"
      style={{ background: BG, color: "#f1f5f9" }}
    >
      <FloatingPulses />

      {/* ─── NAV ─── */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={spring}
        className="fixed top-0 left-0 right-0 z-50"
      >
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-4">
          <GlassCard className="flex items-center justify-between px-4 md:px-6 py-3">
            <div className="flex items-center gap-2">
              <Heartbeat size={24} weight="duotone" style={{ color: TEAL }} />
              <span className="text-lg font-bold tracking-tight text-white">
                Pinnacle Health
              </span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
              <a href="#services" className="hover:text-white transition-colors">Services</a>
              <a href="#about" className="hover:text-white transition-colors">About</a>
              <a href="#testimonials" className="hover:text-white transition-colors">Reviews</a>
              <a href="#contact" className="hover:text-white transition-colors">Contact</a>
            </div>
            <div className="flex items-center gap-3">
              <MagneticButton
                className="px-4 md:px-5 py-2 rounded-full text-sm font-semibold text-white transition-colors"
                style={{ background: TEAL } as React.CSSProperties}
              >
                Book Appointment
              </MagneticButton>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
              >
                {mobileMenuOpen ? <X size={24} /> : <List size={24} />}
              </button>
            </div>
          </GlassCard>

          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="md:hidden mt-2 overflow-hidden"
              >
                <GlassCard className="flex flex-col gap-1 px-4 py-4">
                  {[
                    { label: "Services", href: "#services" },
                    { label: "About", href: "#about" },
                    { label: "Reviews", href: "#testimonials" },
                    { label: "Contact", href: "#contact" },
                  ].map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-3 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      {link.label}
                    </a>
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
          <img
            src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1400&q=80"
            alt="Modern medical facility"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0" style={{ background: `linear-gradient(to right, ${BG} 45%, transparent 100%)` }} />
          <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${BG} 10%, transparent 50%)` }} />
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          <div className="max-w-2xl space-y-8">
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ ...spring, delay: 0.1 }}
              className="text-sm uppercase tracking-widest"
              style={{ color: TEAL }}
            >
              Comprehensive Medical Care
            </motion.p>
            <h1
              className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white"
              style={{ textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}
            >
              <WordReveal text="Your Health, Our Priority" />
            </h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring, delay: 0.6 }}
              className="text-lg text-slate-300 max-w-md leading-relaxed"
            >
              From routine check-ups to specialized care, our board-certified
              physicians deliver personalized medicine with compassion and the
              latest technology.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring, delay: 0.8 }}
              className="flex flex-wrap gap-4"
            >
              <MagneticButton
                className="px-8 py-4 rounded-full text-base font-semibold text-white flex items-center gap-2 cursor-pointer"
                style={{ background: TEAL } as React.CSSProperties}
              >
                Schedule a Visit
                <ArrowRight size={18} weight="bold" />
              </MagneticButton>
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/15 flex items-center gap-2 cursor-pointer">
                <Phone size={18} weight="duotone" />
                (555) 412-7890
              </MagneticButton>
            </motion.div>
          </div>
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ ...spring, delay: 0.3 }} className="hidden md:flex items-center justify-center lg:justify-end">
            <StethoscopeSVG />
          </motion.div>
        </div>
      </section>

      {/* ─── 2. STATS ─── */}
      <SectionReveal className="relative z-10 pb-8">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <GlassCard className="p-6 md:p-8">
            <motion.div
              className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8"
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-50px" }}
            >
              {stats.map((stat, i) => (
                <motion.div key={i} variants={fadeUp} className="text-center">
                  <p className="text-3xl md:text-4xl font-bold" style={{ color: TEAL }}>{stat.value}</p>
                  <p className="text-sm text-slate-400 mt-1">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </GlassCard>
        </div>
      </SectionReveal>

      {/* ─── 3. SERVICES ─── */}
      <SectionReveal id="services" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: TEAL }}>
              Our Services
            </p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Complete Care Under One Roof" />
            </h2>
          </div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
          >
            {services.map((svc, i) => (
              <motion.div key={i} variants={fadeUp}>
                <motion.div whileHover={{ scale: 1.03 }} transition={springGentle} style={{ willChange: "transform" }}>
                  <GlassCard className="p-6 h-full">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                      style={{ background: TEAL_GLOW }}
                    >
                      <svc.icon size={24} weight="duotone" style={{ color: TEAL }} />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{svc.title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{svc.description}</p>
                  </GlassCard>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── 4. ABOUT ─── */}
      <SectionReveal id="about" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <p className="text-sm uppercase tracking-widest mb-3" style={{ color: TEAL }}>
                About Our Practice
              </p>
              <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white mb-6">
                <WordReveal text="Medicine With Heart" />
              </h2>
              <div className="space-y-4 text-slate-400 leading-relaxed">
                <p>
                  Pinnacle Health was founded on a simple principle: every patient
                  deserves attentive, expert medical care. For over 25 years, our
                  team of board-certified physicians has served our community with
                  an unwavering commitment to clinical excellence and compassion.
                </p>
                <p>
                  Our state-of-the-art facility houses everything you need for
                  comprehensive care, from advanced diagnostics to specialist
                  consultations, all in one location. We believe coordinated care
                  leads to better outcomes.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl overflow-hidden aspect-[3/4]">
                <img
                  src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=500&q=80"
                  alt="Doctor consulting with patient"
                  className="w-full h-full object-cover object-center"
                />
              </div>
              <div className="rounded-2xl overflow-hidden aspect-[3/4] mt-8">
                <img
                  src="https://images.unsplash.com/photo-1504439468489-c8920d796a29?w=500&q=80"
                  alt="Modern medical equipment"
                  className="w-full h-full object-cover object-center"
                />
              </div>
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* ─── 5. PATIENT PORTAL CTA ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 30% 50%, ${TEAL_GLOW} 0%, transparent 50%), radial-gradient(circle at 70% 50%, rgba(34, 211, 238, 0.1) 0%, transparent 50%)`,
          }} />
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              className="grid grid-cols-2 gap-4"
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
            >
              {[
                { icon: Clipboard, label: "View Results", desc: "Lab results in 24 hours" },
                { icon: CalendarCheck, label: "Book Online", desc: "24/7 scheduling" },
                { icon: Pulse, label: "Health Records", desc: "Complete history access" },
                { icon: VideoCamera, label: "Telehealth", desc: "Video visits available" },
              ].map((item, i) => (
                <motion.div key={i} variants={fadeUp}>
                  <GlassCard className="p-5 text-center">
                    <item.icon size={28} weight="duotone" style={{ color: TEAL }} className="mx-auto mb-2" />
                    <p className="text-sm font-semibold text-white">{item.label}</p>
                    <p className="text-xs text-slate-400 mt-1">{item.desc}</p>
                  </GlassCard>
                </motion.div>
              ))}
            </motion.div>
            <div>
              <p className="text-sm uppercase tracking-widest mb-3" style={{ color: TEAL }}>
                Patient Portal
              </p>
              <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white mb-6">
                <WordReveal text="Your Health at Your Fingertips" />
              </h2>
              <p className="text-slate-400 leading-relaxed max-w-md mb-6">
                Access your medical records, view lab results, request
                prescription refills, and schedule appointments all from our
                secure patient portal. Available 24/7 on any device.
              </p>
              <MagneticButton
                className="px-8 py-4 rounded-full text-base font-semibold text-white flex items-center gap-2 cursor-pointer"
                style={{ background: TEAL } as React.CSSProperties}
              >
                <UserCircle size={20} weight="duotone" />
                Access Patient Portal
              </MagneticButton>
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* ─── 6. TESTIMONIALS ─── */}
      <SectionReveal id="testimonials" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: TEAL }}>
              Patient Stories
            </p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Trusted by Thousands" />
            </h2>
          </div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
          >
            {testimonials.map((t, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="p-6 h-full flex flex-col">
                  <Quotes size={28} weight="fill" style={{ color: TEAL }} className="mb-3 opacity-50" />
                  <p className="text-slate-300 leading-relaxed flex-1 text-sm">{t.text}</p>
                  <div className="mt-4 pt-4 border-t border-white/8 flex items-center justify-between">
                    <span className="text-sm font-semibold text-white">{t.name}</span>
                    <div className="flex gap-0.5">
                      {Array.from({ length: t.rating }).map((_, j) => (
                        <Star key={j} size={12} weight="fill" style={{ color: TEAL }} />
                      ))}
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── 7. INSURANCE ACCEPTED ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: TEAL }}>
              Insurance
            </p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="We Accept Your Plan" />
            </h2>
          </div>

          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
          >
            {insuranceProviders.map((provider, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="p-4 text-center">
                  <ShieldCheck size={24} weight="duotone" style={{ color: TEAL }} className="mx-auto mb-2" />
                  <p className="text-sm font-semibold text-white">{provider}</p>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
          <p className="text-center text-sm text-slate-500 mt-6">
            Do not see your plan? Contact us — we work with most providers and can verify your coverage.
          </p>
        </div>
      </SectionReveal>

      {/* ─── 8. FAQ ─── */}
      <SectionReveal id="faq" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            <div className="lg:sticky lg:top-32">
              <p className="text-sm uppercase tracking-widest mb-3" style={{ color: TEAL }}>
                Common Questions
              </p>
              <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white mb-6">
                <WordReveal text="Frequently Asked" />
              </h2>
              <p className="text-slate-400 leading-relaxed max-w-md">
                Find answers to common questions about our practice, insurance,
                and what to expect at your first visit.
              </p>
            </div>

            <motion.div
              className="space-y-3"
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-50px" }}
            >
              {faqData.map((faq, i) => (
                <motion.div key={i} variants={fadeUp}>
                  <AccordionItem
                    title={faq.title}
                    description={faq.description}
                    isOpen={openFaq === i}
                    onToggle={() => setOpenFaq(openFaq === i ? null : i)}
                  />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </SectionReveal>

      {/* ─── 9. CONTACT / APPOINTMENT ─── */}
      <SectionReveal id="contact" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white mb-6">
                <WordReveal text="Schedule Your Visit" />
              </h2>
              <p className="text-slate-400 leading-relaxed max-w-md mb-8">
                New patients welcome. Book your appointment today and experience
                healthcare the way it should be — personal, thorough, and
                compassionate.
              </p>
              <div className="flex flex-wrap gap-4">
                <MagneticButton
                  className="px-10 py-4 rounded-full text-base font-semibold text-white inline-flex items-center gap-2 cursor-pointer"
                  style={{ background: TEAL } as React.CSSProperties}
                >
                  <CalendarCheck size={20} weight="duotone" />
                  Book Appointment
                </MagneticButton>
                <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/15 flex items-center gap-2 cursor-pointer">
                  <Phone size={18} weight="duotone" />
                  Call Us
                </MagneticButton>
              </div>
            </div>

            <GlassCard className="p-8">
              <h3 className="text-xl font-semibold text-white mb-6">Contact Information</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <MapPin size={20} weight="duotone" style={{ color: TEAL }} className="mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-white">Location</p>
                    <p className="text-sm text-slate-400">8500 Health Parkway, Suite 100<br />Portland, OR 97210</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Phone size={20} weight="duotone" style={{ color: TEAL }} className="mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-white">Phone</p>
                    <p className="text-sm text-slate-400">(555) 412-7890</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Clock size={20} weight="duotone" style={{ color: TEAL }} className="mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-white">Hours</p>
                    <p className="text-sm text-slate-400">
                      Monday - Friday: 7:00 AM - 6:00 PM<br />
                      Saturday: 8:00 AM - 1:00 PM<br />
                      Sunday: Closed
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Users size={20} weight="duotone" style={{ color: TEAL }} className="mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-white">Walk-In Urgent Care</p>
                    <p className="text-sm text-slate-400">Open 7 days a week, 8 AM - 8 PM</p>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </SectionReveal>

      {/* ─── 10. NEW PATIENT CTA ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4 md:px-6">
          <ShimmerBorder>
            <div className="p-8 md:p-12 text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={spring}
              >
                <p className="text-sm uppercase tracking-widest mb-3" style={{ color: TEAL }}>
                  New Patients
                </p>
                <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white mb-4">
                  Welcome to Better Health
                </h2>
                <p className="text-slate-400 text-lg mb-8 max-w-lg mx-auto">
                  Your first visit includes a comprehensive exam, health
                  assessment, and personalized care plan. Most insurance accepted.
                </p>
                <MagneticButton
                  className="px-10 py-4 rounded-full text-base font-semibold text-white inline-flex items-center gap-2 cursor-pointer"
                  style={{ background: TEAL } as React.CSSProperties}
                >
                  <CheckCircle size={20} weight="duotone" />
                  Become a Patient
                </MagneticButton>
              </motion.div>
            </div>
          </ShimmerBorder>
        </div>
      </SectionReveal>

      {/* ─── FOOTER ─── */}
      <footer className="relative z-10 border-t border-white/8 py-8">
        <div className="mx-auto max-w-7xl px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Heartbeat size={16} weight="duotone" style={{ color: TEAL }} />
            <span>Pinnacle Health &copy; {new Date().getFullYear()}</span>
          </div>
          <p className="text-xs text-slate-600 flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-sky-500"><path d="M24.3 4.2c-1.5-.4-3.2.1-4.5 1.1-1-.7-2.3-1-3.5-.8-2.4.4-4.2 2.5-4.2 4.9v.6c-3.2.8-6 2.8-7.8 5.6-.3.5-.1 1.1.4 1.4.5.3 1.1.1 1.4-.4 1.5-2.3 3.7-4 6.3-4.7.5-.1 1-.1 1.5 0 .8.2 1.4.8 1.7 1.5.3.8.2 1.6-.2 2.3l-2.8 4.3c-.6.9-.4 2.1.4 2.8l2.5 2.1c.4.3.8.5 1.3.5h5.2c.5 0 1-.2 1.3-.5l1.2-1c.6-.5.8-1.3.6-2l-1-3.2c-.2-.5 0-1.1.4-1.4l3.8-2.5c1.3-.9 2.1-2.3 2.1-3.9V9.6c0-2.5-1.7-4.7-4.1-5.3v-.1z" fill="currentColor"/></svg>Created by <a href="https://bluejayportfolio.com" target="_blank" rel="noopener noreferrer" style={{textDecoration:"underline"}}>bluejayportfolio.com</a>
          </p>
        </div>
      </footer>
    </main>
  );
}
