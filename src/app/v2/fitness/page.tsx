"use client";

/* eslint-disable @next/next/no-img-element -- These static marketing and preview components intentionally use plain img tags to preserve existing markup and visual behavior during lint-only cleanup. */
/* eslint-disable react-hooks/purity -- Decorative particle values are intentionally randomized for static visual effects in these marketing pages and previews; this preserves existing appearance without changing business logic. */

import { useRef, useState, useEffect } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  useSpring,
  useMotionValue,
  useMotionTemplate,
  AnimatePresence,
} from "framer-motion";
import {
  Barbell,
  Heartbeat,
  Lightning,
  Users,
  Timer,
  ArrowRight,
  Phone,
  MapPin,
  Clock,
  Fire,
  PersonSimpleRun,
  Medal,
  X,
  List,
} from "@phosphor-icons/react";

/* ─── spring config ─── */
const spring = { type: "spring" as const, stiffness: 100, damping: 20 };
const stagger = { visible: { transition: { staggerChildren: 0.1 } } };

/* ─── colours ─── */
const RED = "#ef4444";
const CHARCOAL = "#0a0a0a";

/* ─── data ─── */
const programs = [
  {
    title: "HIIT Blitz",
    desc: "30-minute high-intensity intervals that torch calories and build explosive power.",
    icon: Lightning,
    duration: "30 min",
    level: "Advanced",
  },
  {
    title: "Iron Foundation",
    desc: "Structured strength program focused on compound lifts and progressive overload.",
    icon: Barbell,
    duration: "60 min",
    level: "Intermediate",
  },
  {
    title: "Cardio Surge",
    desc: "Heart-pumping sessions mixing treadmill, rowing, and battle ropes.",
    icon: Heartbeat,
    duration: "45 min",
    level: "All Levels",
  },
  {
    title: "Sprint Lab",
    desc: "Track-style sprint training for speed, agility, and athletic performance.",
    icon: PersonSimpleRun,
    duration: "40 min",
    level: "Intermediate",
  },
  {
    title: "Burn Circuit",
    desc: "Full-body circuit training with minimal rest for maximum metabolic impact.",
    icon: Fire,
    duration: "50 min",
    level: "Advanced",
  },
  {
    title: "Endurance Elite",
    desc: "Long-form training designed for stamina, mental grit, and competition prep.",
    icon: Medal,
    duration: "75 min",
    level: "Advanced",
  },
];

const stats = [
  { label: "Active Members", value: 2400, suffix: "+" },
  { label: "Weekly Classes", value: 85, suffix: "" },
  { label: "Expert Trainers", value: 24, suffix: "" },
  { label: "Years Running", value: 12, suffix: "" },
];

const trainers = [
  {
    name: "Marcus Cole",
    specialty: "Strength & Conditioning",
    exp: "14 years",
    image: "https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=400&h=500&fit=crop",
  },
  {
    name: "Aisha Patel",
    specialty: "HIIT & Functional",
    exp: "9 years",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=500&fit=crop",
  },
  {
    name: "Jake Morrison",
    specialty: "Athletic Performance",
    exp: "11 years",
    image: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&h=500&fit=crop",
  },
  {
    name: "Nina Torres",
    specialty: "Yoga & Mobility",
    exp: "8 years",
    image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=500&fit=crop",
  },
];

const schedule = [
  { time: "6:00 AM", class: "Iron Foundation", trainer: "Marcus Cole", type: "Strength" },
  { time: "7:30 AM", class: "HIIT Blitz", trainer: "Aisha Patel", type: "Cardio" },
  { time: "9:00 AM", class: "Burn Circuit", trainer: "Jake Morrison", type: "Circuit" },
  { time: "12:00 PM", class: "Sprint Lab", trainer: "Marcus Cole", type: "Speed" },
  { time: "5:30 PM", class: "Cardio Surge", trainer: "Nina Torres", type: "Cardio" },
  { time: "7:00 PM", class: "Endurance Elite", trainer: "Aisha Patel", type: "Endurance" },
];

/* ─── Particles ─── */
function Particles() {
  const [particles] = useState(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 8,
      duration: 6 + Math.random() * 8,
      size: 1 + Math.random() * 2,
      opacity: 0.15 + Math.random() * 0.25,
    }))
  );

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden hidden md:block">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            width: p.size,
            height: p.size,
            backgroundColor: RED,
            opacity: p.opacity,
          }}
          animate={{ y: [800, -20] }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}

/* ─── BarbellSVG ─── */
function RunnerSVG() {
  return (
    <div className="relative w-72 h-80 md:w-96 md:h-[28rem] mx-auto">
      {/* Pulsing energy glow */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(220,38,38,0.25) 0%, transparent 70%)", filter: "blur(40px)" }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      <svg viewBox="0 0 340 300" className="w-full h-full relative z-10" fill="none">
        <defs>
          <linearGradient id="barbellGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#dc2626" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
          <linearGradient id="metalGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#94a3b8" />
            <stop offset="50%" stopColor="#cbd5e1" />
            <stop offset="100%" stopColor="#94a3b8" />
          </linearGradient>
        </defs>

        {/* Glow ring */}
        <motion.circle cx="170" cy="150" r="130" stroke="#dc2626" strokeWidth="0.5" opacity={0.1}
          animate={{ r: [128, 132, 128] }} transition={{ duration: 4, repeat: Infinity }} />

        {/* ── BARBELL BAR ── */}
        <motion.rect x="40" y="142" width="260" height="16" rx="8" fill="url(#metalGrad)" stroke="#64748b" strokeWidth="1"
          initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 1, ease: "easeOut" }}
          style={{ transformOrigin: "170px 150px" }} />
        {/* Bar highlight */}
        <rect x="60" y="146" width="220" height="4" rx="2" fill="white" opacity={0.15} />
        {/* Bar grip texture (center) */}
        {[140, 148, 156, 164, 172, 180, 188, 196].map((x, i) => (
          <motion.line key={`grip-${i}`} x1={x} y1="144" x2={x} y2="156" stroke="#475569" strokeWidth="1" opacity={0.3}
            initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} transition={{ delay: 1 + i * 0.05 }} />
        ))}

        {/* ── LEFT WEIGHT PLATES ── */}
        {/* Outer plate (45lb) */}
        <motion.rect x="20" y="100" width="28" height="100" rx="6" fill="url(#barbellGrad)" stroke="#b91c1c" strokeWidth="1.5"
          initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ delay: 0.5, duration: 0.6, ease: "backOut" }}
          style={{ transformOrigin: "34px 150px" }} />
        <rect x="26" y="108" width="16" height="84" rx="3" fill="#ef4444" opacity={0.2} />
        {/* Inner plate (25lb) */}
        <motion.rect x="50" y="115" width="22" height="70" rx="5" fill="#991b1b" stroke="#7f1d1d" strokeWidth="1"
          initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ delay: 0.7, duration: 0.5, ease: "backOut" }}
          style={{ transformOrigin: "61px 150px" }} />
        <rect x="55" y="121" width="12" height="58" rx="3" fill="#b91c1c" opacity={0.2} />
        {/* Collar */}
        <motion.rect x="74" y="135" width="12" height="30" rx="3" fill="#64748b" stroke="#475569" strokeWidth="1"
          initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.9 }} />

        {/* ── RIGHT WEIGHT PLATES ── */}
        {/* Outer plate (45lb) */}
        <motion.rect x="292" y="100" width="28" height="100" rx="6" fill="url(#barbellGrad)" stroke="#b91c1c" strokeWidth="1.5"
          initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ delay: 0.5, duration: 0.6, ease: "backOut" }}
          style={{ transformOrigin: "306px 150px" }} />
        <rect x="298" y="108" width="16" height="84" rx="3" fill="#ef4444" opacity={0.2} />
        {/* Inner plate (25lb) */}
        <motion.rect x="268" y="115" width="22" height="70" rx="5" fill="#991b1b" stroke="#7f1d1d" strokeWidth="1"
          initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ delay: 0.7, duration: 0.5, ease: "backOut" }}
          style={{ transformOrigin: "279px 150px" }} />
        <rect x="273" y="121" width="12" height="58" rx="3" fill="#b91c1c" opacity={0.2} />
        {/* Collar */}
        <motion.rect x="254" y="135" width="12" height="30" rx="3" fill="#64748b" stroke="#475569" strokeWidth="1"
          initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.9 }} />

        {/* ── WEIGHT LABELS ── */}
        <text x="34" y="155" textAnchor="middle" fill="white" fontSize="10" fontWeight="800" opacity={0.6}>45</text>
        <text x="306" y="155" textAnchor="middle" fill="white" fontSize="10" fontWeight="800" opacity={0.6}>45</text>

        {/* ── POWER LINES (energy radiating) ── */}
        <motion.line x1="170" y1="90" x2="170" y2="60" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" opacity={0.4}
          animate={{ y1: [90, 85, 90], opacity: [0.2, 0.6, 0.2] }} transition={{ duration: 1.5, repeat: Infinity }} />
        <motion.line x1="150" y1="95" x2="135" y2="70" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round" opacity={0.3}
          animate={{ opacity: [0.1, 0.5, 0.1] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }} />
        <motion.line x1="190" y1="95" x2="205" y2="70" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round" opacity={0.3}
          animate={{ opacity: [0.1, 0.5, 0.1] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }} />

        {/* ── SUBTLE LIFT ANIMATION ── */}
        <motion.g animate={{ y: [0, -8, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
          {/* Shadow under barbell */}
          <ellipse cx="170" cy="220" rx="100" ry="8" fill="#dc2626" opacity={0.08} />
        </motion.g>

        {/* Sparkle accents */}
        <motion.circle cx="50" cy="60" r="3" fill="#ef4444"
          animate={{ opacity: [0.2, 1, 0.2], scale: [0.7, 1.3, 0.7] }} transition={{ duration: 2.5, repeat: Infinity }} />
        <motion.circle cx="290" cy="70" r="2.5" fill="#f87171"
          animate={{ opacity: [0.1, 0.8, 0.1] }} transition={{ duration: 3, repeat: Infinity, delay: 0.8 }} />
        <motion.circle cx="40" cy="230" r="2" fill="#dc2626"
          animate={{ opacity: [0.15, 0.6, 0.15] }} transition={{ duration: 2, repeat: Infinity, delay: 1.2 }} />
        <motion.circle cx="300" cy="240" r="3" fill="#ef4444"
          animate={{ opacity: [0.1, 0.7, 0.1] }} transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }} />

        {/* End of barbell SVG */}
      </svg>
    </div>
  );
}

/* ─── HeartbeatSVG ─── */
function HeartbeatLine() {
  return (
    <div className="absolute inset-0 flex items-center pointer-events-none overflow-hidden opacity-20">
      <svg
        viewBox="0 0 1200 200"
        className="w-full h-32"
        preserveAspectRatio="none"
      >
        <motion.path
          d="M0 100 L200 100 L230 100 L250 40 L270 160 L290 60 L310 140 L330 80 L350 100 L600 100 L630 100 L650 30 L670 170 L690 50 L710 150 L730 70 L750 100 L1000 100 L1030 100 L1050 40 L1070 160 L1090 60 L1110 140 L1130 80 L1150 100 L1200 100"
          fill="none"
          stroke={RED}
          strokeWidth="2"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />
      </svg>
    </div>
  );
}

/* ─── Counter ─── */
function AnimatedCounter({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const motionVal = useSpring(0, { stiffness: 40, damping: 20 });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (isInView) motionVal.set(value);
  }, [isInView, value, motionVal]);

  useEffect(() => {
    const unsub = motionVal.on("change", (v) => setDisplay(Math.round(v)));
    return unsub;
  }, [motionVal]);

  return (
    <span ref={ref}>
      {display.toLocaleString()}
      {suffix}
    </span>
  );
}

/* ─── Tilt Card ─── */
function TiltCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-0.5, 0.5], [8, -8]);
  const rotateY = useTransform(x, [-0.5, 0.5], [-8, 8]);
  const isTouchDevice = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;

  function handleMouse(e: React.MouseEvent<HTMLDivElement>) {
    if (isTouchDevice) return;
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  function handleLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
      style={{ rotateX: isTouchDevice ? 0 : rotateX, rotateY: isTouchDevice ? 0 : rotateY, transformStyle: "preserve-3d", perspective: 800 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── MAIN PAGE ─── */
export default function V2FitnessPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-[100dvh] bg-[#0a0a0a] text-white overflow-x-hidden">
      <Particles />

      {/* ═══ NAV ═══ */}
      <motion.nav
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={spring}
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-[#0a0a0a]/70 border-b border-white/5"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 md:px-6 py-4">
          <div className="flex items-center gap-3">
            <Barbell size={28} weight="bold" color={RED} />
            <span className="text-xl font-bold tracking-tight">FORGE</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-zinc-400">
            <a href="#programs" className="hover:text-white transition-colors">Programs</a>
            <a href="#trainers" className="hover:text-white transition-colors">Trainers</a>
            <a href="#schedule" className="hover:text-white transition-colors">Schedule</a>
            <a href="#contact" className="hover:text-white transition-colors">Contact</a>
          </div>
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-5 py-2.5 text-sm font-semibold rounded-lg"
              style={{ backgroundColor: RED }}
            >
              Start Free Trial
            </motion.button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
            >
              {mobileMenuOpen ? <X size={24} /> : <List size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="md:hidden overflow-hidden border-t border-white/5"
            >
              <div className="flex flex-col gap-1 px-4 py-4 bg-[#0a0a0a]/95 backdrop-blur-xl">
                {[
                  { label: "Programs", href: "#programs" },
                  { label: "Trainers", href: "#trainers" },
                  { label: "Schedule", href: "#schedule" },
                  { label: "Contact", href: "#contact" },
                ].map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3 rounded-lg text-sm text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* ═══ HERO ═══ */}
      <motion.section
        ref={heroRef}
        style={{ y: heroY, opacity: heroOpacity }}
        className="relative min-h-[100dvh] flex items-center"
      >
        <HeartbeatLine />
        <div className="relative z-10 max-w-7xl mx-auto w-full px-4 md:px-6 grid grid-cols-1 lg:grid-cols-5 gap-8 items-center pt-24">
          {/* Left — oversized text (60%) */}
          <div className="lg:col-span-3">
            <motion.p
              initial={{ x: -40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ ...spring, delay: 0.1 }}
              className="text-sm font-semibold tracking-[0.3em] uppercase mb-4"
              style={{ color: RED }}
            >
              Forge Athletics
            </motion.p>
            <motion.h1
              initial={{ x: -60, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ ...spring, delay: 0.2 }}
              className="text-[4rem] md:text-[12rem] lg:text-[14rem] font-black tracking-tighter leading-none select-none"
              style={{ WebkitTextStroke: `2px ${RED}`, color: "transparent" }}
            >
              TRAIN
            </motion.h1>
            <motion.div
              initial={{ x: -40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ ...spring, delay: 0.35 }}
              className="h-1 w-24 rounded-full mt-4"
              style={{ backgroundColor: RED }}
            />
          </div>

          {/* Right — Runner Animation + tagline + CTA (40%) */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ ...spring, delay: 0.3 }}
            >
              <RunnerSVG />
            </motion.div>
            <motion.p
              initial={{ x: 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ ...spring, delay: 0.4 }}
              className="text-lg md:text-xl text-zinc-400 leading-relaxed"
            >
              Push past every limit. World-class trainers, cutting-edge programs, and a community
              that refuses to quit.
            </motion.p>
            <motion.div
              initial={{ x: 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ ...spring, delay: 0.55 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative px-8 py-4 font-bold rounded-xl text-white overflow-hidden"
                style={{ backgroundColor: RED }}
              >
                {/* pulsing glow ring */}
                <motion.span
                  className="absolute inset-0 rounded-xl"
                  style={{ boxShadow: `0 0 30px ${RED}` }}
                  animate={{ opacity: [0.4, 0.8, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <span className="relative flex items-center gap-2">
                  Get Started <ArrowRight size={18} weight="bold" />
                </span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 font-bold rounded-xl border border-white/10 text-zinc-300 hover:border-white/30 transition-colors"
              >
                View Programs
              </motion.button>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="flex items-center gap-6 mt-4 text-sm text-zinc-500"
            >
              <span className="flex items-center gap-2">
                <MapPin size={16} /> Seattle, WA
              </span>
              <span className="flex items-center gap-2">
                <Clock size={16} /> 5AM - 11PM
              </span>
            </motion.div>
          </div>
        </div>

        {/* bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
      </motion.section>

      {/* ═══ STATS ═══ */}
      <section className="relative z-10 py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {stats.map((s, i) => (
              <motion.div
                key={i}
                variants={{
                  hidden: { y: 30, opacity: 0 },
                  visible: { y: 0, opacity: 1, transition: spring },
                }}
                className="text-center p-6 rounded-2xl backdrop-blur-md bg-white/[0.03] border border-white/[0.06] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]"
              >
                <div className="text-4xl md:text-5xl font-black tracking-tighter" style={{ color: RED }}>
                  <AnimatedCounter value={s.value} suffix={s.suffix} />
                </div>
                <p className="text-sm text-zinc-500 mt-2 uppercase tracking-wider">{s.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══ PROGRAMS CAROUSEL ═══ */}
      <section id="programs" className="relative z-10 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={spring}
            className="mb-12"
          >
            <p className="text-sm font-semibold tracking-[0.3em] uppercase mb-3" style={{ color: RED }}>
              Our Programs
            </p>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-none">
              Built to Break
              <br />
              <span className="text-zinc-600">Your Limits</span>
            </h2>
          </motion.div>
        </div>

        <motion.div
          ref={carouselRef}
          className="flex gap-4 md:gap-6 px-4 md:px-6 cursor-grab active:cursor-grabbing overflow-hidden"
          drag="x"
          dragConstraints={carouselRef}
          dragElastic={0.1}
        >
          {programs.map((p, i) => {
            const Icon = p.icon;
            return (
              <motion.div
                key={i}
                initial={{ x: 60, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ ...spring, delay: i * 0.04 }}
                whileHover={{ y: -8, transition: { ...spring } }}
                className="flex-shrink-0 w-[280px] md:w-[320px] p-6 rounded-2xl backdrop-blur-md bg-white/[0.03] border border-white/[0.06] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] group"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                  style={{ backgroundColor: `${RED}15` }}
                >
                  <Icon size={24} weight="bold" color={RED} />
                </div>
                <h3 className="text-xl font-bold mb-2">{p.title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed mb-4">{p.desc}</p>
                <div className="flex items-center gap-4 text-xs text-zinc-600">
                  <span className="flex items-center gap-1">
                    <Timer size={14} /> {p.duration}
                  </span>
                  <span className="px-2 py-0.5 rounded-full border border-white/10 text-zinc-500">
                    {p.level}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* ═══ TRAINERS ═══ */}
      <section id="trainers" className="relative z-10 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={spring}
            className="mb-12"
          >
            <p className="text-sm font-semibold tracking-[0.3em] uppercase mb-3" style={{ color: RED }}>
              Meet the Team
            </p>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-none">
              Your Coaches,
              <br />
              <span className="text-zinc-600">Your Edge</span>
            </h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {trainers.map((t, i) => (
              <motion.div
                key={i}
                variants={{
                  hidden: { y: 40, opacity: 0 },
                  visible: { y: 0, opacity: 1, transition: spring },
                }}
              >
                <TiltCard className="rounded-2xl overflow-hidden backdrop-blur-md bg-white/[0.03] border border-white/[0.06] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]">
                  <div className="h-64 overflow-hidden">
                    <img
                      src={t.image}
                      alt={t.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-bold">{t.name}</h3>
                    <p className="text-sm mt-1" style={{ color: RED }}>
                      {t.specialty}
                    </p>
                    <p className="text-xs text-zinc-600 mt-1">{t.exp} experience</p>
                  </div>
                </TiltCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══ SCHEDULE TIMELINE ═══ */}
      <section id="schedule" className="relative z-10 py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 md:px-6">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={spring}
            className="mb-12"
          >
            <p className="text-sm font-semibold tracking-[0.3em] uppercase mb-3" style={{ color: RED }}>
              Today&apos;s Schedule
            </p>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-none">
              Class
              <br />
              <span className="text-zinc-600">Timeline</span>
            </h2>
          </motion.div>

          <div className="relative">
            {/* vertical line */}
            <div
              className="absolute left-[22px] top-0 bottom-0 w-px"
              style={{ backgroundColor: `${RED}30` }}
            />

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
              className="flex flex-col gap-6"
            >
              {schedule.map((s, i) => (
                <motion.div
                  key={i}
                  variants={{
                    hidden: { x: -30, opacity: 0 },
                    visible: { x: 0, opacity: 1, transition: spring },
                  }}
                  className="flex items-start gap-6 group"
                >
                  {/* dot */}
                  <div className="relative flex-shrink-0">
                    <div
                      className="w-[10px] h-[10px] rounded-full mt-2 ring-4 ring-[#0a0a0a]"
                      style={{ backgroundColor: RED }}
                    />
                  </div>
                  {/* card */}
                  <div className="flex-1 p-5 rounded-xl backdrop-blur-md bg-white/[0.03] border border-white/[0.06] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] group-hover:border-white/10 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-lg">{s.class}</p>
                        <p className="text-sm text-zinc-500 mt-1">with {s.trainer}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-sm" style={{ color: RED }}>
                          {s.time}
                        </p>
                        <span className="text-xs px-2 py-0.5 rounded-full border border-white/10 text-zinc-500 mt-1 inline-block">
                          {s.type}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section id="contact" className="relative z-10 py-16 md:py-32">
        <div className="max-w-4xl mx-auto px-4 md:px-6 text-center">
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={spring}
          >
            <h2 className="text-3xl md:text-6xl font-black tracking-tighter leading-none mb-6">
              Ready to
              <br />
              <span style={{ color: RED }}>Transform?</span>
            </h2>
            <p className="text-zinc-500 text-lg mb-10 max-w-xl mx-auto">
              Your first week is on us. No contracts, no pressure. Just results.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative px-10 py-5 font-bold text-lg rounded-xl text-white"
              style={{ backgroundColor: RED }}
            >
              <motion.span
                className="absolute inset-0 rounded-xl"
                style={{ boxShadow: `0 0 40px ${RED}` }}
                animate={{ opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="relative flex items-center gap-3">
                <Phone size={20} weight="bold" />
                Claim Free Trial
              </span>
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="relative z-10 border-t border-white/5 py-10">
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Barbell size={20} weight="bold" color={RED} />
            <span className="font-bold tracking-tight">FORGE ATHLETICS</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-600">
            <span>Created by <a href="https://bluejayportfolio.com" target="_blank" rel="noopener noreferrer" style={{textDecoration:"underline"}}>bluejayportfolio.com</a></span>
          </div>
        </div>
      </footer>
    </div>
  );
}
