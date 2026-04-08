"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  useMotionValue,
  useSpring,
  AnimatePresence,
} from "framer-motion";
import {
  Scales,
  Gavel,
  ShieldCheck,
  Briefcase,
  Buildings,
  Handshake,
  Phone,
  EnvelopeSimple,
  MapPin,
  ArrowRight,
  Star,
  CaretLeft,
  CaretRight,
  Trophy,
  Users,
  Clock,
  Certificate,
  X,
  List,
} from "@phosphor-icons/react";

/* ─── spring config ─── */
const spring = { type: "spring" as const, stiffness: 100, damping: 20 };
const springFast = { type: "spring" as const, stiffness: 200, damping: 25 };

/* ─── stagger container ─── */
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: spring },
};

/* ─── floating document particle ─── */
function FloatingDoc({ delay, x, size }: { delay: number; x: number; size: number }) {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{ left: `${x}%`, top: "-5%" }}
      animate={{
        y: ["0vh", "110vh"],
        rotate: [0, 360],
        opacity: [0, 0.15, 0.15, 0],
      }}
      transition={{
        duration: 18 + delay * 3,
        repeat: Infinity,
        delay,
        ease: "linear",
      }}
    >
      <svg
        width={size}
        height={size * 1.3}
        viewBox="0 0 40 52"
        fill="none"
        className="text-emerald-400/20"
      >
        <rect x="2" y="2" width="36" height="48" rx="3" stroke="currentColor" strokeWidth="1.5" />
        <line x1="10" y1="14" x2="30" y2="14" stroke="currentColor" strokeWidth="1" />
        <line x1="10" y1="20" x2="26" y2="20" stroke="currentColor" strokeWidth="1" />
        <line x1="10" y1="26" x2="28" y2="26" stroke="currentColor" strokeWidth="1" />
        <line x1="10" y1="32" x2="22" y2="32" stroke="currentColor" strokeWidth="1" />
        <path d="M26 2 L36 12 L26 12 Z" stroke="currentColor" strokeWidth="1" fill="currentColor" fillOpacity="0.3" />
      </svg>
    </motion.div>
  );
}

/* ─── animated scale of justice ─── */
function ScaleOfJustice() {
  const EMERALD = "#059669";
  const EMERALD_LIGHT = "#10b981";
  const GOLD_ACCENT = "#ca8a04";
  const tilt = useMotionValue(0);
  const smoothTilt = useSpring(tilt, { stiffness: 40, damping: 12 });

  useEffect(() => {
    let dir = 1;
    const interval = setInterval(() => {
      tilt.set(dir * 8);
      dir *= -1;
    }, 3000);
    return () => clearInterval(interval);
  }, [tilt]);

  return (
    <div className="relative w-full max-w-md mx-auto aspect-square flex items-center justify-center">
      {/* Pulsing glow behind */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(5,150,105,0.12) 0%, transparent 70%)", filter: "blur(40px)" }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      <svg viewBox="0 0 300 300" className="relative z-10 w-full h-full" fill="none">
        {/* Outer glow rings */}
        <motion.circle cx="150" cy="150" r="140" stroke={EMERALD} strokeWidth="0.5" opacity={0.1}
          animate={{ r: [138, 142, 138] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} />
        <motion.circle cx="150" cy="150" r="130" stroke={EMERALD} strokeWidth="0.3" opacity={0.06}
          animate={{ r: [128, 132, 128] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }} />

        {/* Ornate base pedestal */}
        <motion.path d="M110 268 L120 258 L180 258 L190 268 Z" fill={`${EMERALD}22`} stroke={EMERALD} strokeWidth="2"
          initial={{ opacity: 0, scaleX: 0 }} animate={{ opacity: 1, scaleX: 1 }}
          transition={{ ...spring, delay: 0.4 }} />
        <motion.rect x="125" y="256" width="50" height="4" rx="2" fill={`${EMERALD}30`}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} />
        <rect x="130" y="253" width="40" height="3" rx="1.5" fill={`${EMERALD}15`} />

        {/* Pillar with gradient fill */}
        <motion.rect
          x="145" y="100" width="10" height="156" rx="5"
          fill={`${EMERALD}22`} stroke={EMERALD} strokeWidth="1.5"
          initial={{ opacity: 0, scaleY: 0 }} animate={{ opacity: 1, scaleY: 1 }}
          transition={{ ...spring, delay: 0.3 }}
          style={{ transformOrigin: "150px 256px" }}
        />
        {/* Pillar inner highlight */}
        <rect x="148" y="105" width="4" height="148" rx="2" fill={`${EMERALD}0d`} />

        {/* Beam with detail */}
        <motion.g style={{ rotate: smoothTilt, transformOrigin: "150px 100px" }}>
          <rect x="45" y="95" width="210" height="10" rx="5" fill={`${EMERALD}22`} stroke={EMERALD} strokeWidth="1.5" />
          <rect x="50" y="97" width="200" height="4" rx="2" fill={`${EMERALD}0d`} />

          {/* Left chain links */}
          <motion.circle cx="70" cy="115" r="4" stroke={EMERALD_LIGHT} strokeWidth="1.2" fill="none" opacity={0.5}
            initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 0.8 }} />
          <motion.circle cx="70" cy="125" r="4" stroke={EMERALD_LIGHT} strokeWidth="1.2" fill="none" opacity={0.5}
            initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 0.9 }} />
          <motion.circle cx="70" cy="135" r="4" stroke={EMERALD_LIGHT} strokeWidth="1.2" fill="none" opacity={0.5}
            initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.0 }} />
          {/* Left pan — detailed */}
          <line x1="70" y1="105" x2="42" y2="155" stroke={EMERALD} strokeWidth="1.5" />
          <line x1="70" y1="105" x2="98" y2="155" stroke={EMERALD} strokeWidth="1.5" />
          <path d="M32 155 Q70 180 108 155" stroke={EMERALD} strokeWidth="2.5"
            fill={`${EMERALD}18`} />
          <path d="M42 155 Q70 170 98 155" fill={`${EMERALD}0d`} />

          {/* Right chain links */}
          <motion.circle cx="230" cy="115" r="4" stroke={EMERALD_LIGHT} strokeWidth="1.2" fill="none" opacity={0.5}
            initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 0.8 }} />
          <motion.circle cx="230" cy="125" r="4" stroke={EMERALD_LIGHT} strokeWidth="1.2" fill="none" opacity={0.5}
            initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 0.9 }} />
          <motion.circle cx="230" cy="135" r="4" stroke={EMERALD_LIGHT} strokeWidth="1.2" fill="none" opacity={0.5}
            initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.0 }} />
          {/* Right pan — detailed */}
          <line x1="230" y1="105" x2="202" y2="155" stroke={EMERALD} strokeWidth="1.5" />
          <line x1="230" y1="105" x2="258" y2="155" stroke={EMERALD} strokeWidth="2" />
          <path d="M192 155 Q230 180 268 155" stroke={EMERALD} strokeWidth="2.5"
            fill={`${EMERALD}18`} />
          <path d="M202 155 Q230 170 258 155" fill={`${EMERALD}0d`} />
        </motion.g>

        {/* Top ornament — detailed */}
        <motion.circle cx="150" cy="88" r="16" fill={`${EMERALD}22`} stroke={EMERALD} strokeWidth="2.5"
          initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ ...spring, delay: 0.7 }} />
        <circle cx="150" cy="86" r="8" fill={`${EMERALD}15`} />
        <motion.circle cx="150" cy="88" r="4" fill={EMERALD_LIGHT}
          animate={{ opacity: [0.4, 0.9, 0.4], scale: [0.9, 1.1, 0.9] }}
          transition={{ duration: 3, repeat: Infinity }} />

        {/* Justice glow pulse */}
        <motion.circle cx="150" cy="88" r="22" fill={`${EMERALD}08`}
          animate={{ r: [20, 28, 20], opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: 2.5, repeat: Infinity }} />

        {/* Sparkle accents */}
        <motion.circle cx="270" cy="55" r="3" fill={EMERALD_LIGHT}
          animate={{ opacity: [0.2, 1, 0.2], scale: [0.7, 1.3, 0.7] }}
          transition={{ duration: 2.5, repeat: Infinity }} />
        <motion.circle cx="25" cy="70" r="2" fill={GOLD_ACCENT}
          animate={{ opacity: [0.1, 0.8, 0.1], scale: [0.5, 1.2, 0.5] }}
          transition={{ duration: 3, repeat: Infinity, delay: 0.8 }} />
        <motion.circle cx="275" cy="200" r="2.5" fill={EMERALD_LIGHT}
          animate={{ opacity: [0.15, 0.7, 0.15] }}
          transition={{ duration: 2, repeat: Infinity, delay: 1.2 }} />
        <motion.circle cx="20" cy="220" r="2" fill={GOLD_ACCENT}
          animate={{ opacity: [0.1, 0.6, 0.1] }}
          transition={{ duration: 2.5, repeat: Infinity, delay: 0.4 }} />
      </svg>
    </div>
  );
}

/* ─── counter ─── */
function Counter({ end, label, suffix = "" }: { end: number; label: string; suffix?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = Math.max(1, Math.floor(end / 60));
    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 25);
    return () => clearInterval(timer);
  }, [inView, end]);

  return (
    <div ref={ref} className="text-center">
      <div className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-emerald-400">
        {count.toLocaleString()}
        {suffix}
      </div>
      <div className="mt-2 text-sm uppercase tracking-widest text-slate-400">{label}</div>
    </div>
  );
}

/* ─── magnetic button ─── */
function MagneticButton({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, springFast);
  const sy = useSpring(y, springFast);

  const isTouchDevice = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;

  const handleMouse = useCallback(
    (e: React.MouseEvent) => {
      const el = ref.current;
      if (!el || isTouchDevice) return;
      const rect = el.getBoundingClientRect();
      x.set((e.clientX - rect.left - rect.width / 2) * 0.3);
      y.set((e.clientY - rect.top - rect.height / 2) * 0.3);
    },
    [x, y, isTouchDevice]
  );

  return (
    <motion.button
      ref={ref}
      style={{ x: sx, y: sy }}
      onMouseMove={handleMouse}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.97 }}
      className={`relative overflow-hidden group ${className}`}
    >
      {children}
      <motion.div
        className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
      />
    </motion.button>
  );
}

/* ─── services ─── */
const services = [
  { icon: Gavel, title: "Criminal Defense", desc: "Aggressive defense strategies for all criminal charges." },
  { icon: Briefcase, title: "Corporate Law", desc: "Business formation, contracts, and compliance." },
  { icon: ShieldCheck, title: "Personal Injury", desc: "Maximum compensation for your injuries." },
  { icon: Buildings, title: "Real Estate", desc: "Property transactions, disputes, and zoning." },
  { icon: Handshake, title: "Family Law", desc: "Divorce, custody, and mediation services." },
  { icon: Certificate, title: "Estate Planning", desc: "Wills, trusts, and asset protection." },
];

/* ─── testimonials ─── */
const testimonials = [
  {
    name: "Sarah Mitchell",
    role: "Personal Injury Client",
    text: "They fought relentlessly for my case and secured a settlement that changed my life. Professional, compassionate, and incredibly skilled.",
    rating: 5,
  },
  {
    name: "David Chen",
    role: "Corporate Client",
    text: "Our business relies on their counsel for every major decision. Their expertise in corporate law is unmatched in this region.",
    rating: 5,
  },
  {
    name: "Maria Rodriguez",
    role: "Family Law Client",
    text: "During the most difficult time of my life, they provided clarity, empathy, and a winning strategy. Truly grateful.",
    rating: 5,
  },
];

/* ═══════ MAIN PAGE ═══════ */
export default function V2LawFirmPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroParallax = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const checkScroll = useCallback(() => {
    const el = carouselRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }, []);

  const scroll = useCallback((dir: number) => {
    carouselRef.current?.scrollBy({ left: dir * 360, behavior: "smooth" });
    setTimeout(checkScroll, 400);
  }, [checkScroll]);

  /* floating docs */
  const docs = Array.from({ length: 8 }, (_, i) => ({
    delay: i * 2.2,
    x: 5 + i * 12,
    size: 20 + (i % 3) * 10,
  }));

  return (
    <div className="min-h-[100dvh] bg-[#0f172a] text-slate-100 overflow-x-hidden">
      {/* ── floating documents — hidden on mobile for performance ── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden hidden md:block">
        {docs.map((d, i) => (
          <FloatingDoc key={i} {...d} />
        ))}
      </div>

      {/* ══════ NAV ══════ */}
      <motion.nav
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={spring}
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-[#0f172a]/70 border-b border-white/5"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 md:px-6 py-4">
          <div className="flex items-center gap-3">
            <Scales size={28} weight="duotone" className="text-emerald-400" />
            <span className="text-xl font-bold tracking-tight">Carter & Associates</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
            <a href="#services" className="hover:text-white transition-colors">Services</a>
            <a href="#why-us" className="hover:text-white transition-colors">Why Us</a>
            <a href="#testimonials" className="hover:text-white transition-colors">Testimonials</a>
            <a href="#contact" className="hover:text-white transition-colors">Contact</a>
          </div>
          <div className="flex items-center gap-3">
            <MagneticButton className="px-5 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-lg">
              <span className="relative z-10">Free Consultation</span>
            </MagneticButton>
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
              <div className="flex flex-col gap-1 px-4 py-4 bg-[#0f172a]/95 backdrop-blur-xl">
                {[
                  { label: "Services", href: "#services" },
                  { label: "Why Us", href: "#why-us" },
                  { label: "Testimonials", href: "#testimonials" },
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
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* ══════ HERO ══════ */}
      <section ref={heroRef} className="relative min-h-[100dvh] z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] via-[#0f172a] to-emerald-950/30" />
        <motion.div
          style={{ y: heroParallax }}
          className="relative z-10 grid grid-cols-1 lg:grid-cols-2 min-h-[100dvh] max-w-7xl mx-auto px-4 md:px-6"
        >
          {/* left — typography */}
          <div className="flex flex-col justify-center py-24 lg:py-0">
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="show"
              className="space-y-2"
            >
              {["Justice.", "Delivered."].map((word, i) => (
                <motion.div key={word} variants={fadeUp}>
                  <span
                    className={`block text-4xl md:text-7xl lg:text-8xl tracking-tighter leading-none font-bold ${
                      i === 1 ? "text-emerald-400" : "text-white"
                    }`}
                    style={{ textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}
                  >
                    {word}
                  </span>
                </motion.div>
              ))}
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring, delay: 0.5 }}
              className="mt-8 text-lg text-slate-400 max-w-md leading-relaxed"
            >
              Over two decades of relentless advocacy. We do not just practice law
              — we redefine outcomes for families, businesses, and individuals.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring, delay: 0.7 }}
              className="mt-8 flex flex-wrap gap-4"
            >
              <MagneticButton className="px-8 py-4 bg-emerald-600 text-white font-semibold rounded-xl">
                <span className="relative z-10 flex items-center gap-2">
                  Free Consultation <ArrowRight weight="bold" size={18} />
                </span>
              </MagneticButton>
              <MagneticButton className="px-8 py-4 border border-slate-600 text-slate-300 rounded-xl hover:border-emerald-500/50 transition-colors">
                <span className="relative z-10 flex items-center gap-2">
                  <Phone weight="bold" size={18} /> (555) 234-5678
                </span>
              </MagneticButton>
            </motion.div>
          </div>

          {/* right — scale of justice — hidden on mobile */}
          <div className="hidden md:flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ ...spring, delay: 0.3 }}
              className="w-full max-w-lg"
            >
              <ScaleOfJustice />
            </motion.div>
          </div>
        </motion.div>

        {/* bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0f172a] to-transparent z-20" />
      </section>

      {/* ══════ CASE RESULTS COUNTERS ══════ */}
      <section className="relative z-10 py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-12">
            <Counter end={2500} label="Cases Won" suffix="+" />
            <Counter end={98} label="Success Rate" suffix="%" />
            <Counter end={150} label="Million Recovered" suffix="M" />
            <Counter end={25} label="Years of Experience" suffix="+" />
          </div>
        </div>
        {/* decorative line */}
        <div className="mt-16 max-w-6xl mx-auto px-4 md:px-6">
          <div className="h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
        </div>
      </section>

      {/* ══════ SERVICES CAROUSEL ══════ */}
      <section className="relative z-10 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.p variants={fadeUp} className="text-emerald-400 text-sm font-semibold uppercase tracking-widest">
              Our Practice Areas
            </motion.p>
            <motion.h2 variants={fadeUp} className="mt-3 text-4xl md:text-6xl tracking-tighter leading-none font-bold">
              How We <span className="text-emerald-400">Fight</span> for You
            </motion.h2>
          </motion.div>

          {/* carousel controls */}
          <div className="flex justify-end gap-2 mt-8 mb-6">
            <button
              onClick={() => scroll(-1)}
              disabled={!canScrollLeft}
              className="p-3 rounded-xl border border-slate-700 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/50 disabled:opacity-30 transition-all"
            >
              <CaretLeft size={20} weight="bold" />
            </button>
            <button
              onClick={() => scroll(1)}
              disabled={!canScrollRight}
              className="p-3 rounded-xl border border-slate-700 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/50 disabled:opacity-30 transition-all"
            >
              <CaretRight size={20} weight="bold" />
            </button>
          </div>

          {/* carousel */}
          <div
            ref={carouselRef}
            onScroll={checkScroll}
            className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 snap-x snap-mandatory"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {services.map((svc, i) => (
              <motion.div
                key={svc.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ ...spring, delay: i * 0.04 }}
                className="flex-shrink-0 w-72 md:w-80 snap-start"
              >
                <motion.div
                  whileHover={{ y: -6, scale: 1.02 }}
                  transition={spring}
                  className="h-full p-8 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] hover:border-emerald-500/30 transition-colors"
                >
                  <div className="w-14 h-14 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-6">
                    <svc.icon size={28} weight="duotone" className="text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{svc.title}</h3>
                  <p className="text-slate-400 leading-relaxed text-sm">{svc.desc}</p>
                  <motion.div
                    className="mt-6 flex items-center gap-2 text-emerald-400 text-sm font-medium cursor-pointer"
                    whileHover={{ x: 4 }}
                    transition={spring}
                  >
                    Learn More <ArrowRight size={16} weight="bold" />
                  </motion.div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ WHY CHOOSE US ══════ */}
      <section className="relative z-10 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* left — glass card */}
            <motion.div
              initial={{ opacity: 0, x: -60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={spring}
              className="relative"
            >
              <div className="p-10 rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-md shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]">
                <Scales size={48} weight="duotone" className="text-emerald-400 mb-6" />
                <h3 className="text-3xl md:text-4xl tracking-tighter leading-none font-bold mb-4">
                  Why Clients <span className="text-emerald-400">Trust</span> Us
                </h3>
                <p className="text-slate-400 leading-relaxed mb-8">
                  We combine legal brilliance with genuine care for every client.
                  Our track record speaks for itself.
                </p>
                <div className="space-y-4">
                  {[
                    { icon: Trophy, text: "Award-winning trial attorneys" },
                    { icon: Users, text: "Dedicated team for every case" },
                    { icon: Clock, text: "24/7 client availability" },
                    { icon: ShieldCheck, text: "No fees unless we win" },
                  ].map((item, i) => (
                    <motion.div
                      key={item.text}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ ...spring, delay: 0.2 + i * 0.1 }}
                      className="flex items-center gap-4"
                    >
                      <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                        <item.icon size={20} weight="duotone" className="text-emerald-400" />
                      </div>
                      <span className="text-slate-200">{item.text}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
              {/* decorative glow */}
              <div className="absolute -bottom-8 -right-8 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl" />
            </motion.div>

            {/* right — big quote */}
            <motion.div
              initial={{ opacity: 0, x: 60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={spring}
              className="space-y-8"
            >
              <div className="text-6xl text-emerald-500/30 font-serif leading-none">&ldquo;</div>
              <p className="text-2xl md:text-3xl tracking-tight leading-snug text-slate-200 font-light">
                The measure of a great law firm is not just
                in cases won, but in lives changed.
              </p>
              <div>
                <p className="text-emerald-400 font-semibold">James Carter</p>
                <p className="text-slate-500 text-sm">Founding Partner</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════ TESTIMONIALS ══════ */}
      <section className="relative z-10 py-16 md:py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="mb-16"
          >
            <motion.p variants={fadeUp} className="text-emerald-400 text-sm font-semibold uppercase tracking-widest">
              Testimonials
            </motion.p>
            <motion.h2 variants={fadeUp} className="mt-3 text-4xl md:text-6xl tracking-tighter leading-none font-bold">
              Client <span className="text-emerald-400">Stories</span>
            </motion.h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ ...spring, delay: i * 0.05 }}
              >
                <motion.div
                  whileHover={{ y: -4 }}
                  transition={spring}
                  className="h-full p-8 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]"
                >
                  <div className="flex gap-1 mb-6">
                    {Array.from({ length: t.rating }).map((_, s) => (
                      <Star key={s} size={18} weight="fill" className="text-emerald-400" />
                    ))}
                  </div>
                  <p className="text-slate-300 leading-relaxed mb-6">&ldquo;{t.text}&rdquo;</p>
                  <div className="pt-4 border-t border-white/5">
                    <p className="font-semibold text-white">{t.name}</p>
                    <p className="text-sm text-slate-500">{t.role}</p>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ CONTACT ══════ */}
      <section className="relative z-10 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16">
            {/* left */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={spring}
            >
              <p className="text-emerald-400 text-sm font-semibold uppercase tracking-widest">
                Get In Touch
              </p>
              <h2 className="mt-3 text-4xl md:text-6xl tracking-tighter leading-none font-bold">
                Your Fight <span className="text-emerald-400">Starts Here</span>
              </h2>
              <p className="mt-6 text-slate-400 max-w-md leading-relaxed">
                Schedule a free consultation. We will review your case, explain
                your options, and build a strategy to win.
              </p>
              <div className="mt-10 space-y-6">
                {[
                  { icon: Phone, text: "(555) 234-5678" },
                  { icon: EnvelopeSimple, text: "intake@carterlaw.com" },
                  { icon: MapPin, text: "120 Justice Blvd, Suite 400" },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-4 text-slate-300">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                      <item.icon size={22} weight="duotone" className="text-emerald-400" />
                    </div>
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* right — form */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={spring}
            >
              <div className="p-8 md:p-10 rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-md shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]">
                <div className="space-y-5">
                  {[
                    { label: "Full Name", type: "text", placeholder: "John Smith" },
                    { label: "Email", type: "email", placeholder: "john@example.com" },
                    { label: "Phone", type: "tel", placeholder: "(555) 000-0000" },
                  ].map((field) => (
                    <div key={field.label}>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        {field.label}
                      </label>
                      <input
                        type={field.type}
                        placeholder={field.placeholder}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-600 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 outline-none transition-all"
                      />
                    </div>
                  ))}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Describe Your Case
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Brief description of your legal matter..."
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-600 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 outline-none transition-all resize-none"
                    />
                  </div>
                  <MagneticButton className="w-full px-8 py-4 bg-emerald-600 text-white font-semibold rounded-xl">
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      Request Free Consultation <ArrowRight weight="bold" size={18} />
                    </span>
                  </MagneticButton>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════ FOOTER ══════ */}
      <footer className="relative z-10 py-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Scales size={24} weight="duotone" className="text-emerald-400" />
            <span className="font-bold text-lg tracking-tight">Carter & Associates</span>
          </div>
          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} Carter & Associates. All rights reserved.
          </p>
        </div>
        <div className="border-t border-white/5 mt-8 pt-4 text-center">
          <p className="text-xs text-slate-600">Website created by Bluejay Business Solutions</p>
        </div>
      </footer>
    </div>
  );
}
