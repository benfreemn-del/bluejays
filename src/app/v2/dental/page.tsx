"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  useSpring,
  useInView,
  AnimatePresence,
  useScroll,
  useMotionTemplate,
} from "framer-motion";
import {
  Star,
  ShieldCheck,
  UserPlus,
  Tooth,
  Sparkle,
  CaretDown,
  Phone,
  MapPin,
  Clock,
  ArrowRight,
  Heart,
  Syringe,
  FirstAidKit,
  SmileyWink,
  Users,
  CalendarCheck,
  CheckCircle,
  Quotes,
  X,
} from "@phosphor-icons/react";

/* ───────────────────────── SPRING CONFIG ───────────────────────── */
const spring = { type: "spring" as const, stiffness: 100, damping: 20 };
const springFast = { type: "spring" as const, stiffness: 200, damping: 25 };
const springGentle = { type: "spring" as const, stiffness: 60, damping: 18 };

const stagger = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: spring },
};

/* ───────────────────────── COLORS ───────────────────────── */
const SLATE = "#0f172a";
const TEAL = "#0d9488";
const TEAL_LIGHT = "#14b8a6";
const TEAL_GLOW = "rgba(13, 148, 136, 0.15)";

/* ───────────────────────── FLOATING SPARKLES ───────────────────────── */
function FloatingSparkles() {
  const particles = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 8,
    duration: 6 + Math.random() * 6,
    size: 2 + Math.random() * 3,
    opacity: 0.15 + Math.random() * 0.35,
  }));

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
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

/* ───────────────────────── TOOTH SVG ───────────────────────── */
function RotatingTooth() {
  return (
    <motion.div
      className="relative flex items-center justify-center"
      animate={{ rotateY: [0, 360] }}
      transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
      style={{ perspective: 800, willChange: "transform" }}
    >
      {/* Soft glow behind tooth */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle, ${TEAL_GLOW} 0%, transparent 70%)`,
          filter: "blur(30px)",
          willChange: "transform",
        }}
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      <svg
        viewBox="0 0 120 150"
        className="relative z-10 w-48 h-60 md:w-64 md:h-80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Tooth outline - clean lines */}
        <motion.path
          d="M60 10 C30 10, 10 30, 15 60 C18 75, 25 85, 30 100 C35 115, 38 135, 42 145 C44 148, 48 148, 50 145 C54 130, 56 115, 60 100 C64 115, 66 130, 70 145 C72 148, 76 148, 78 145 C82 135, 85 115, 90 100 C95 85, 102 75, 105 60 C110 30, 90 10, 60 10Z"
          stroke={TEAL}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2.5, ease: "easeInOut" }}
        />
        {/* Inner detail lines */}
        <motion.path
          d="M40 45 C45 50, 55 52, 60 50 C65 48, 75 50, 80 45"
          stroke={TEAL_LIGHT}
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
          opacity={0.5}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, delay: 1, ease: "easeInOut" }}
        />
        <motion.path
          d="M45 55 C50 58, 55 60, 60 58 C65 56, 70 58, 75 55"
          stroke={TEAL_LIGHT}
          strokeWidth="1"
          strokeLinecap="round"
          fill="none"
          opacity={0.3}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, delay: 1.5, ease: "easeInOut" }}
        />
        {/* Sparkle accent */}
        <motion.circle
          cx="85"
          cy="30"
          r="3"
          fill={TEAL_LIGHT}
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </svg>
    </motion.div>
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

/* ───────────────────────── LIQUID GLASS CARD ───────────────────────── */
function GlassCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] ${className}`}
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

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      x.set((e.clientX - cx) * 0.25);
      y.set((e.clientY - cy) * 0.25);
    },
    [x, y]
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
      <div className="relative rounded-2xl bg-slate-900 z-10">{children}</div>
    </div>
  );
}

/* ───────────────────────── ACCORDION ITEM ───────────────────────── */
function AccordionItem({
  title,
  description,
  icon: Icon,
  isOpen,
  onToggle,
}: {
  title: string;
  description: string;
  icon: React.ElementType;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <GlassCard className="overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-5 md:p-6 text-left group cursor-pointer"
      >
        <div className="flex items-center gap-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: TEAL_GLOW }}
          >
            <Icon size={20} weight="duotone" style={{ color: TEAL }} />
          </div>
          <span className="text-lg font-semibold text-white">{title}</span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={spring}
        >
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
            <p className="px-5 pb-5 md:px-6 md:pb-6 text-slate-400 leading-relaxed pl-[4.5rem]">
              {description}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
}

/* ───────────────────────── TEAM CARD ───────────────────────── */
function TeamCard({
  name,
  role,
  initials,
}: {
  name: string;
  role: string;
  initials: string;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      transition={springGentle}
      className="cursor-default"
      style={{ willChange: "transform" }}
    >
      <GlassCard className="p-6 text-center">
        <div
          className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold"
          style={{ background: TEAL_GLOW, color: TEAL }}
        >
          {initials}
        </div>
        <h3 className="text-lg font-semibold text-white">{name}</h3>
        <p className="text-sm text-slate-400 mt-1">{role}</p>
      </GlassCard>
    </motion.div>
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
    const handleUp = () => {
      isDragging.current = false;
    };
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
      className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden cursor-ew-resize select-none"
      onMouseDown={handleMouseDown}
      onTouchStart={handleMouseDown}
    >
      {/* "After" side */}
      <div className="absolute inset-0 bg-gradient-to-br from-teal-900/40 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <SmileyWink size={64} weight="duotone" style={{ color: TEAL }} className="mx-auto mb-2" />
          <span className="text-xl font-semibold text-white">After</span>
          <p className="text-slate-400 text-sm mt-1">Bright, confident smile</p>
        </div>
      </div>
      {/* "Before" side */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center"
        style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
      >
        <div className="text-center">
          <Tooth size={64} weight="duotone" className="mx-auto mb-2 text-slate-400" />
          <span className="text-xl font-semibold text-slate-300">Before</span>
          <p className="text-slate-500 text-sm mt-1">Ready for transformation</p>
        </div>
      </div>
      {/* Slider line */}
      <div
        className="absolute top-0 bottom-0 w-[2px] bg-white/80 z-10"
        style={{ left: `${sliderPos}%` }}
      >
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

/* ───────────────────────── WAVE BG ───────────────────────── */
function WaveBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
      <motion.svg
        viewBox="0 0 1440 320"
        className="absolute bottom-0 w-full"
        preserveAspectRatio="none"
      >
        <motion.path
          fill={TEAL}
          fillOpacity="0.3"
          animate={{
            d: [
              "M0,224L48,213.3C96,203,192,181,288,186.7C384,192,480,224,576,229.3C672,235,768,213,864,197.3C960,181,1056,171,1152,181.3C1248,192,1344,224,1392,240L1440,256L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
              "M0,256L48,240C96,224,192,192,288,192C384,192,480,224,576,234.7C672,245,768,235,864,218.7C960,203,1056,181,1152,186.7C1248,192,1344,224,1392,240L1440,256L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
              "M0,224L48,213.3C96,203,192,181,288,186.7C384,192,480,224,576,229.3C672,235,768,213,864,197.3C960,181,1056,171,1152,181.3C1248,192,1344,224,1392,240L1440,256L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
            ],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.svg>
      <motion.svg
        viewBox="0 0 1440 320"
        className="absolute bottom-0 w-full"
        preserveAspectRatio="none"
      >
        <motion.path
          fill={TEAL}
          fillOpacity="0.15"
          animate={{
            d: [
              "M0,288L48,272C96,256,192,224,288,218.7C384,213,480,235,576,245.3C672,256,768,256,864,240C960,224,1056,192,1152,186.7C1248,181,1344,203,1392,213.3L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
              "M0,256L48,261.3C96,267,192,277,288,272C384,267,480,245,576,234.7C672,224,768,224,864,234.7C960,245,1056,267,1152,261.3C1248,256,1344,224,1392,208L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
              "M0,288L48,272C96,256,192,224,288,218.7C384,213,480,235,576,245.3C672,256,768,256,864,240C960,224,1056,192,1152,186.7C1248,181,1344,203,1392,213.3L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
            ],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
      </motion.svg>
    </div>
  );
}

/* ───────────────────────── SERVICES DATA ───────────────────────── */
const services = [
  {
    title: "General Dentistry",
    description:
      "Comprehensive exams, professional cleanings, fillings, and preventive care to keep your smile healthy year-round. We use the latest digital imaging for precise diagnostics.",
    icon: Tooth,
  },
  {
    title: "Cosmetic Dentistry",
    description:
      "Teeth whitening, porcelain veneers, bonding, and smile makeovers designed to give you the confidence to show off your smile. Custom treatment plans for every patient.",
    icon: Sparkle,
  },
  {
    title: "Restorative Care",
    description:
      "Dental implants, crowns, bridges, and full-mouth rehabilitation. We restore function and beauty with biocompatible materials and precision-guided placement.",
    icon: FirstAidKit,
  },
  {
    title: "Pediatric Dentistry",
    description:
      "Gentle, fun dental care for children of all ages. From first visits to sealants and orthodontic evaluations, we make dental visits something kids look forward to.",
    icon: Heart,
  },
  {
    title: "Oral Surgery",
    description:
      "Wisdom teeth extraction, dental implant placement, and corrective procedures performed with sedation options for maximum comfort and minimal recovery time.",
    icon: Syringe,
  },
  {
    title: "Emergency Dental",
    description:
      "Same-day appointments for dental emergencies including severe toothaches, broken teeth, lost fillings, and dental trauma. We are here when you need us most.",
    icon: FirstAidKit,
  },
];

/* ───────────────────────── TEAM DATA ───────────────────────── */
const team = [
  { name: "Dr. Sarah Mitchell", role: "Lead Dentist, DDS", initials: "SM" },
  { name: "Dr. James Park", role: "Cosmetic Specialist", initials: "JP" },
  { name: "Dr. Emily Chen", role: "Pediatric Dentist", initials: "EC" },
  { name: "Lisa Rodriguez", role: "Dental Hygienist", initials: "LR" },
];

/* ───────────────────────── TESTIMONIALS ───────────────────────── */
const testimonials = [
  {
    name: "Margaret T.",
    text: "I have never felt so comfortable at a dentist. The entire team is incredibly warm and professional. My smile has never looked better.",
    rating: 5,
  },
  {
    name: "David K.",
    text: "After years of dental anxiety, I finally found a practice that puts me at ease. The technology they use is impressive and everything is painless.",
    rating: 5,
  },
  {
    name: "Sarah L.",
    text: "My kids actually look forward to their dental appointments now. The pediatric team is amazing with children. Highly recommend this practice.",
    rating: 5,
  },
];

/* ═══════════════════════════════════════════════════════════════════
   MAIN PAGE COMPONENT
   ═══════════════════════════════════════════════════════════════════ */
export default function V2DentalPage() {
  const [openService, setOpenService] = useState<number | null>(0);
  const heroRef = useRef(null);

  return (
    <main
      className="relative min-h-[100dvh] overflow-x-hidden"
      style={{ background: SLATE, color: "#f1f5f9" }}
    >
      <FloatingSparkles />

      {/* ─── NAV ─── */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={spring}
        className="fixed top-0 left-0 right-0 z-50"
      >
        <div className="mx-auto max-w-7xl px-6 py-4">
          <GlassCard className="flex items-center justify-between px-6 py-3">
            <div className="flex items-center gap-2">
              <Tooth size={24} weight="duotone" style={{ color: TEAL }} />
              <span className="text-lg font-bold tracking-tight text-white">
                Pristine Dental
              </span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
              <a href="#services" className="hover:text-white transition-colors">
                Services
              </a>
              <a href="#team" className="hover:text-white transition-colors">
                Team
              </a>
              <a href="#gallery" className="hover:text-white transition-colors">
                Gallery
              </a>
              <a href="#testimonials" className="hover:text-white transition-colors">
                Reviews
              </a>
            </div>
            <MagneticButton
              className="px-5 py-2 rounded-full text-sm font-semibold text-white transition-colors"
              style={{ background: TEAL } as React.CSSProperties}
            >
              Book Now
            </MagneticButton>
          </GlassCard>
        </div>
      </motion.nav>

      {/* ─── HERO ─── */}
      <section
        ref={heroRef}
        className="relative min-h-[100dvh] flex items-center pt-24 z-10"
      >
        <div className="mx-auto max-w-7xl px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-4 items-center">
          {/* Left: text */}
          <div className="space-y-8">
            <div>
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ ...spring, delay: 0.1 }}
                className="text-sm uppercase tracking-widest mb-4"
                style={{ color: TEAL }}
              >
                Precision Dental Care
              </motion.p>
              <h1 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold">
                <WordReveal text="Your Smile, Perfected" />
              </h1>
            </div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring, delay: 0.6 }}
              className="text-lg text-slate-400 max-w-md leading-relaxed"
            >
              Advanced dental care meets genuine compassion. From routine
              cleanings to complete smile transformations, your comfort and
              confidence are our priority.
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
              <MagneticButton
                className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/10 flex items-center gap-2 cursor-pointer"
              >
                <Phone size={18} weight="duotone" />
                (555) 234-5678
              </MagneticButton>
            </motion.div>

            {/* Quick info */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ ...spring, delay: 1 }}
              className="flex flex-wrap gap-6 text-sm text-slate-400"
            >
              <span className="flex items-center gap-2">
                <MapPin size={16} weight="duotone" style={{ color: TEAL }} />
                123 Smile Ave, Suite 200
              </span>
              <span className="flex items-center gap-2">
                <Clock size={16} weight="duotone" style={{ color: TEAL }} />
                Mon-Fri 8am-6pm
              </span>
            </motion.div>
          </div>

          {/* Right: rotating tooth */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ ...spring, delay: 0.3 }}
            className="flex items-center justify-center lg:justify-end"
          >
            <RotatingTooth />
          </motion.div>
        </div>
      </section>

      {/* ─── TRUST INDICATORS ─── */}
      <SectionReveal className="relative z-10 pb-8">
        <div className="mx-auto max-w-7xl px-6">
          <GlassCard className="p-6 md:p-8">
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8"
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-50px" }}
            >
              <motion.div variants={fadeUp} className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: TEAL_GLOW }}
                >
                  <Star size={24} weight="fill" style={{ color: TEAL }} />
                </div>
                <div>
                  <div className="flex items-center gap-1 mb-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={14} weight="fill" style={{ color: TEAL }} />
                    ))}
                  </div>
                  <p className="text-sm text-slate-400">4.9 stars across 300+ reviews</p>
                </div>
              </motion.div>

              <motion.div variants={fadeUp} className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: TEAL_GLOW }}
                >
                  <ShieldCheck size={24} weight="duotone" style={{ color: TEAL }} />
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">Insurance Accepted</p>
                  <p className="text-sm text-slate-400">All major providers welcomed</p>
                </div>
              </motion.div>

              <motion.div variants={fadeUp} className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: TEAL_GLOW }}
                >
                  <UserPlus size={24} weight="duotone" style={{ color: TEAL }} />
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">New Patients Welcome</p>
                  <p className="text-sm text-slate-400">Same-week appointments available</p>
                </div>
              </motion.div>
            </motion.div>
          </GlassCard>
        </div>
      </SectionReveal>

      {/* ─── SERVICES ACCORDION ─── */}
      <SectionReveal id="services" className="relative z-10 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            <div className="lg:sticky lg:top-32">
              <p
                className="text-sm uppercase tracking-widest mb-3"
                style={{ color: TEAL }}
              >
                What We Offer
              </p>
              <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white mb-6">
                <WordReveal text="Comprehensive Dental Services" />
              </h2>
              <p className="text-slate-400 leading-relaxed max-w-md">
                From preventive care to advanced restorations, every treatment is
                delivered with precision technology and a gentle touch. Click any
                service to learn more.
              </p>
            </div>

            <motion.div
              className="space-y-3"
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-50px" }}
            >
              {services.map((svc, i) => (
                <motion.div key={i} variants={fadeUp}>
                  <AccordionItem
                    title={svc.title}
                    description={svc.description}
                    icon={svc.icon}
                    isOpen={openService === i}
                    onToggle={() =>
                      setOpenService(openService === i ? null : i)
                    }
                  />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </SectionReveal>

      {/* ─── TEAM ─── */}
      <SectionReveal id="team" className="relative z-10 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <p
              className="text-sm uppercase tracking-widest mb-3"
              style={{ color: TEAL }}
            >
              Our Team
            </p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Meet Your Care Team" />
            </h2>
          </div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
          >
            {team.map((member, i) => (
              <motion.div key={i} variants={fadeUp}>
                <TeamCard {...member} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── BEFORE / AFTER GALLERY ─── */}
      <SectionReveal id="gallery" className="relative z-10 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <p
                className="text-sm uppercase tracking-widest mb-3"
                style={{ color: TEAL }}
              >
                Smile Gallery
              </p>
              <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white mb-6">
                <WordReveal text="See the Difference" />
              </h2>
              <p className="text-slate-400 leading-relaxed max-w-md mb-6">
                Drag the slider to reveal the transformative results our
                patients have experienced. Every smile tells a story of renewed
                confidence.
              </p>
              <div className="flex items-center gap-3 text-sm text-slate-400">
                <CheckCircle size={18} weight="duotone" style={{ color: TEAL }} />
                <span>Real patient results shown with permission</span>
              </div>
            </div>
            <BeforeAfterSlider />
          </div>
        </div>
      </SectionReveal>

      {/* ─── PATIENT COMFORT (WAVE BG) ─── */}
      <SectionReveal className="relative z-10 py-24 overflow-hidden">
        <WaveBackground />
        <div className="relative z-10 mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              className="grid grid-cols-2 gap-4"
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
            >
              {[
                { icon: Heart, label: "Gentle Care", desc: "Anxiety-free visits" },
                { icon: Sparkle, label: "Modern Tech", desc: "Digital-first approach" },
                { icon: ShieldCheck, label: "Sterilized", desc: "Hospital-grade protocols" },
                { icon: SmileyWink, label: "Comfort", desc: "Sedation options available" },
              ].map((item, i) => (
                <motion.div key={i} variants={fadeUp}>
                  <GlassCard className="p-5 text-center">
                    <item.icon
                      size={28}
                      weight="duotone"
                      style={{ color: TEAL }}
                      className="mx-auto mb-2"
                    />
                    <p className="text-sm font-semibold text-white">{item.label}</p>
                    <p className="text-xs text-slate-400 mt-1">{item.desc}</p>
                  </GlassCard>
                </motion.div>
              ))}
            </motion.div>

            <div>
              <p
                className="text-sm uppercase tracking-widest mb-3"
                style={{ color: TEAL }}
              >
                Patient Experience
              </p>
              <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white mb-6">
                <WordReveal text="Your Comfort Comes First" />
              </h2>
              <p className="text-slate-400 leading-relaxed max-w-md">
                We understand dental anxiety is real. That is why every detail of
                our practice, from the calming environment to our gentle
                techniques, is designed to put you completely at ease. Sedation
                options are available for every procedure.
              </p>
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* ─── TESTIMONIALS ─── */}
      <SectionReveal id="testimonials" className="relative z-10 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <p
              className="text-sm uppercase tracking-widest mb-3"
              style={{ color: TEAL }}
            >
              Patient Stories
            </p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Trusted by Families" />
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
                  <p className="text-slate-300 leading-relaxed flex-1 text-sm">
                    {t.text}
                  </p>
                  <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                    <span className="text-sm font-semibold text-white">
                      {t.name}
                    </span>
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

      {/* ─── NEW PATIENT OFFER ─── */}
      <SectionReveal className="relative z-10 py-24">
        <div className="mx-auto max-w-4xl px-6">
          <ShimmerBorder>
            <div className="p-8 md:p-12 text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={spring}
              >
                <p
                  className="text-sm uppercase tracking-widest mb-3"
                  style={{ color: TEAL }}
                >
                  Limited Time Offer
                </p>
                <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white mb-4">
                  New Patient Special
                </h2>
                <p className="text-slate-400 text-lg mb-2">
                  Comprehensive exam, full digital X-rays, and professional
                  cleaning
                </p>
                <p className="text-5xl md:text-6xl font-bold tracking-tighter mb-6" style={{ color: TEAL }}>
                  $99
                </p>
                <p className="text-slate-500 text-sm mb-8">
                  Regular value $350 &mdash; save over 70% on your first visit
                </p>
                <MagneticButton
                  className="px-10 py-4 rounded-full text-base font-semibold text-white inline-flex items-center gap-2 cursor-pointer"
                  style={{ background: TEAL } as React.CSSProperties}
                >
                  <CalendarCheck size={20} weight="duotone" />
                  Claim This Offer
                </MagneticButton>
              </motion.div>
            </div>
          </ShimmerBorder>
        </div>
      </SectionReveal>

      {/* ─── BOOKING CTA ─── */}
      <SectionReveal className="relative z-10 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white mb-6">
                <WordReveal text="Ready for Your Best Smile?" />
              </h2>
              <p className="text-slate-400 leading-relaxed max-w-md mb-8">
                Book your appointment today and take the first step toward the
                healthy, beautiful smile you deserve. New patients are always
                welcome.
              </p>
              <div className="flex flex-wrap gap-4">
                <MagneticButton
                  className="px-10 py-4 rounded-full text-base font-semibold text-white inline-flex items-center gap-2 cursor-pointer"
                  style={{ background: TEAL } as React.CSSProperties}
                >
                  <CalendarCheck size={20} weight="duotone" />
                  Book Appointment
                </MagneticButton>
                <MagneticButton
                  className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/10 flex items-center gap-2 cursor-pointer"
                >
                  <Phone size={18} weight="duotone" />
                  Call Us
                </MagneticButton>
              </div>
            </div>

            <GlassCard className="p-8">
              <h3 className="text-xl font-semibold text-white mb-6">
                Get in Touch
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <MapPin size={20} weight="duotone" style={{ color: TEAL }} className="mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-white">Location</p>
                    <p className="text-sm text-slate-400">
                      123 Smile Avenue, Suite 200
                      <br />
                      Portland, OR 97201
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Phone size={20} weight="duotone" style={{ color: TEAL }} className="mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-white">Phone</p>
                    <p className="text-sm text-slate-400">(555) 234-5678</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Clock size={20} weight="duotone" style={{ color: TEAL }} className="mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-white">Hours</p>
                    <p className="text-sm text-slate-400">
                      Monday - Friday: 8:00 AM - 6:00 PM
                      <br />
                      Saturday: 9:00 AM - 2:00 PM
                      <br />
                      Sunday: Closed
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Users size={20} weight="duotone" style={{ color: TEAL }} className="mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-white">Emergency</p>
                    <p className="text-sm text-slate-400">
                      Same-day emergency appointments available.
                      <br />
                      Call us for immediate assistance.
                    </p>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </SectionReveal>

      {/* ─── FOOTER ─── */}
      <footer className="relative z-10 border-t border-white/5 py-8">
        <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Tooth size={16} weight="duotone" style={{ color: TEAL }} />
            <span>Pristine Dental &copy; {new Date().getFullYear()}</span>
          </div>
          <p className="text-xs text-slate-600">
            Website created by Bluejay Business Solutions
          </p>
        </div>
      </footer>
    </main>
  );
}
