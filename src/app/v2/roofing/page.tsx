"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useInView,
  AnimatePresence,
} from "framer-motion";
import {
  House,
  ShieldCheck,
  Star,
  Phone,
  MapPin,
  Clock,
  ArrowRight,
  CaretDown,
  CheckCircle,
  Quotes,
  X,
  List,
  Wrench,
  Lightning,
  HardHat,
  Drop,
  MagnifyingGlass,
  Buildings,
  Certificate,
  Handshake,
  ClipboardText,
  Hammer,
  Eye,
  Warning,
  Question,
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
const CHARCOAL = "#111827";
const SLATE_BLUE = "#475569";
const BRICK = "#dc2626";
const BRICK_LIGHT = "#ef4444";
const BRICK_GLOW = "rgba(220, 38, 38, 0.15)";
const SLATE_GLOW = "rgba(71, 85, 105, 0.2)";

/* ───────────────────────── FLOATING RAIN PARTICLES ───────────────────────── */
function FloatingParticles() {
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 6,
    duration: 3 + Math.random() * 4,
    size: 1 + Math.random() * 2,
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
            height: p.size * 3,
            background: `linear-gradient(to bottom, transparent, ${SLATE_BLUE})`,
            willChange: "transform, opacity",
          }}
          animate={{
            y: ["-5vh", "110vh"],
            opacity: [0, p.opacity, p.opacity, 0],
          }}
          transition={{
            y: {
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              ease: "linear",
            },
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

/* ───────────────────────── ROOFLINE SVG PATTERN ───────────────────────── */
function RooflinePattern() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.06]">
      <svg
        viewBox="0 0 1440 400"
        className="absolute bottom-0 w-full"
        preserveAspectRatio="none"
        fill="none"
      >
        {/* Row of rooflines */}
        <path
          d="M0,350 L80,280 L160,350 L240,260 L320,350 L400,270 L480,350 L560,250 L640,350 L720,280 L800,350 L880,260 L960,350 L1040,270 L1120,350 L1200,250 L1280,350 L1360,280 L1440,350"
          stroke={SLATE_BLUE}
          strokeWidth="2"
        />
        <path
          d="M0,380 L120,300 L240,380 L360,290 L480,380 L600,300 L720,380 L840,290 L960,380 L1080,300 L1200,380 L1320,290 L1440,380"
          stroke={SLATE_BLUE}
          strokeWidth="1.5"
        />
        {/* Chimney accents */}
        <rect x="70" y="260" width="20" height="30" stroke={BRICK} strokeWidth="1" />
        <rect x="390" y="250" width="20" height="30" stroke={BRICK} strokeWidth="1" />
        <rect x="710" y="260" width="20" height="30" stroke={BRICK} strokeWidth="1" />
        <rect x="1030" y="250" width="20" height="30" stroke={BRICK} strokeWidth="1" />
        <rect x="1350" y="260" width="20" height="30" stroke={BRICK} strokeWidth="1" />
      </svg>
    </div>
  );
}

/* ───────────────────────── WORD REVEAL ───────────────────────── */
function WordReveal({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
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

  const isTouchDevice =
    typeof window !== "undefined" &&
    window.matchMedia("(pointer: coarse)").matches;

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
function ShimmerBorder({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative rounded-2xl p-[1px] overflow-hidden ${className}`}
    >
      <motion.div
        className="absolute inset-0 rounded-2xl"
        style={{
          background: `conic-gradient(from 0deg, transparent, ${BRICK}, transparent, ${SLATE_BLUE}, transparent)`,
          willChange: "transform",
        }}
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      />
      <div className="relative rounded-2xl bg-gray-900 z-10">{children}</div>
    </div>
  );
}

/* ───────────────────────── ACCORDION ITEM ───────────────────────── */
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
        <div className="flex items-center gap-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: BRICK_GLOW }}
          >
            <Question size={20} weight="duotone" style={{ color: BRICK }} />
          </div>
          <span className="text-lg font-semibold text-white">{title}</span>
        </div>
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
            <p className="px-5 pb-5 md:px-6 md:pb-6 text-slate-400 leading-relaxed pl-[4.5rem]">
              {description}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
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
      {/* "After" side — beautiful new roof */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80"
          alt="After — pristine new roof installation"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-full bg-red-600/80 backdrop-blur-sm text-white text-sm font-bold">
          After
        </div>
      </div>
      {/* "Before" side — damaged roof */}
      <div
        className="absolute inset-0"
        style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
      >
        <img
          src="https://images.unsplash.com/photo-1632149877166-f75d49000351?w=800&q=80"
          alt="Before — roof needing replacement"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-full bg-slate-700/80 backdrop-blur-sm text-white text-sm font-bold">
          Before
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

/* ───────────────────────── SERVICES DATA ───────────────────────── */
const services = [
  {
    title: "Roof Replacement",
    description:
      "Complete tear-off and replacement with premium architectural shingles, metal roofing, or tile. We handle everything from permits to final inspection with zero hassle.",
    icon: House,
  },
  {
    title: "Roof Repair",
    description:
      "Fast, reliable repairs for leaks, missing shingles, flashing damage, and general wear. We diagnose the root cause and fix it right the first time.",
    icon: Wrench,
  },
  {
    title: "Storm Damage",
    description:
      "Emergency response for hail, wind, and storm damage. We work directly with your insurance company to maximize your claim and restore your roof fast.",
    icon: Lightning,
  },
  {
    title: "Gutter Installation",
    description:
      "Seamless aluminum gutters, gutter guards, and downspout systems engineered to protect your home from water damage year-round.",
    icon: Drop,
  },
  {
    title: "Inspections",
    description:
      "Comprehensive 21-point roof inspections with detailed reports and drone photography. Know exactly what condition your roof is in before issues become emergencies.",
    icon: MagnifyingGlass,
  },
  {
    title: "Commercial Roofing",
    description:
      "Flat roofs, TPO, EPDM, and modified bitumen systems for commercial properties. Minimized downtime and warranties that protect your business investment.",
    icon: Buildings,
  },
];

/* ───────────────────────── TESTIMONIALS DATA ───────────────────────── */
const testimonials = [
  {
    name: "Robert M.",
    text: "Summit replaced our entire roof after a major hailstorm. They handled the insurance claim, showed up on time, and the new roof looks incredible. True professionals from start to finish.",
    rating: 5,
  },
  {
    name: "Jennifer P.",
    text: "We got quotes from five different roofers and Summit was the most thorough. Their inspection report was incredibly detailed. The crew was clean, efficient, and respectful of our property.",
    rating: 5,
  },
  {
    name: "Mark & Susan T.",
    text: "After our old roofer ghosted us mid-job, Summit came in and made everything right. They stand behind their work with a real warranty. Cannot recommend them enough.",
    rating: 5,
  },
];

/* ───────────────────────── MATERIALS DATA ───────────────────────── */
const materials = [
  {
    name: "Architectural Shingles",
    description:
      "Premium dimensional shingles with enhanced wind resistance and a rich, layered look. 30-50 year lifespan.",
    image:
      "https://images.unsplash.com/photo-1575517111478-7f6afd0973db?w=400&q=80",
  },
  {
    name: "Standing Seam Metal",
    description:
      "Sleek, modern metal roofing with interlocking panels. Energy efficient, fire resistant, and built to last 50+ years.",
    image:
      "https://images.unsplash.com/photo-1558036117-15d82a90b9b1?w=400&q=80",
  },
  {
    name: "Cedar Shake",
    description:
      "Natural wood shakes delivering timeless beauty and excellent insulation. Hand-split for an authentic rustic aesthetic.",
    image:
      "https://images.unsplash.com/photo-1575517111478-7f6afd0973db?w=400&q=80",
  },
  {
    name: "Slate & Tile",
    description:
      "The gold standard of roofing. Natural slate and clay tiles that can last over 100 years with proper installation.",
    image:
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=400&q=80",
  },
];

/* ───────────────────────── FAQ DATA ───────────────────────── */
const faqs = [
  {
    title: "How long does a typical roof replacement take?",
    description:
      "Most residential roof replacements are completed in 1-3 days depending on the size and complexity. We always provide a clear timeline before work begins and communicate any changes immediately.",
  },
  {
    title: "Do you work with insurance companies?",
    description:
      "Absolutely. We have extensive experience working with all major insurance providers. Our team will document the damage, meet with your adjuster, and help ensure your claim covers the full scope of work.",
  },
  {
    title: "What warranty do you offer?",
    description:
      "We provide a 10-year workmanship warranty on all installations in addition to manufacturer warranties that range from 25 to 50 years depending on the material. Your investment is fully protected.",
  },
  {
    title: "How do I know if my roof needs replacement or just repair?",
    description:
      "Our free 21-point inspection will tell you exactly. We check age, granule loss, flashing condition, ventilation, decking integrity, and more. We will always recommend repair if it is the smarter long-term option.",
  },
];

/* ═══════════════════════════════════════════════════════════════════
   MAIN PAGE COMPONENT
   ═══════════════════════════════════════════════════════════════════ */
export default function V2RoofingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <main
      className="relative min-h-[100dvh] overflow-x-hidden"
      style={{ background: CHARCOAL, color: "#f1f5f9" }}
    >
      <FloatingParticles />

      {/* ─── 1. NAV ─── */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={spring}
        className="fixed top-0 left-0 right-0 z-50"
      >
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-4">
          <GlassCard className="flex items-center justify-between px-4 md:px-6 py-3">
            <div className="flex items-center gap-2">
              <House size={24} weight="duotone" style={{ color: BRICK }} />
              <span className="text-lg font-bold tracking-tight text-white">
                Summit Roofing NW
              </span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
              <a
                href="#services"
                className="hover:text-white transition-colors"
              >
                Services
              </a>
              <a href="#about" className="hover:text-white transition-colors">
                About
              </a>
              <a href="#gallery" className="hover:text-white transition-colors">
                Gallery
              </a>
              <a href="#contact" className="hover:text-white transition-colors">
                Contact
              </a>
            </div>
            <div className="flex items-center gap-3">
              <MagneticButton
                className="px-4 md:px-5 py-2 rounded-full text-sm font-semibold text-white transition-colors"
                style={{ background: BRICK } as React.CSSProperties}
              >
                Free Inspection
              </MagneticButton>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
              >
                {mobileMenuOpen ? <X size={24} /> : <List size={24} />}
              </button>
            </div>
          </GlassCard>

          {/* Mobile Menu */}
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
                    { label: "Gallery", href: "#gallery" },
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

      {/* ─── 2. HERO ─── */}
      <section className="relative min-h-[100dvh] flex items-center pt-24 z-10">
        {/* Dark sky gradient background */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(180deg, #0a0f1a 0%, ${CHARCOAL} 50%, #1a1f2e 100%)`,
          }}
        />
        {/* Storm cloud overlay */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background:
              "radial-gradient(ellipse at 30% 20%, rgba(71,85,105,0.4) 0%, transparent 60%), radial-gradient(ellipse at 70% 30%, rgba(71,85,105,0.3) 0%, transparent 50%)",
          }}
        />
        <RooflinePattern />
        {/* Red glow accent */}
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full blur-[120px] opacity-20"
          style={{ background: BRICK }}
        />
        <div className="relative mx-auto max-w-7xl px-4 md:px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-4 items-center">
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ ...spring, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-red-500/20 bg-red-500/10 text-red-400 text-sm font-medium"
            >
              <ShieldCheck size={16} weight="fill" />
              Licensed &bull; Bonded &bull; Insured
            </motion.div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.08] tracking-tight">
              <WordReveal text="Protecting What Matters Most" />
            </h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-lg md:text-xl text-slate-400 max-w-lg"
            >
              Pacific Northwest&apos;s most trusted roofing contractor. From
              emergency storm repairs to full roof replacements, we deliver
              quality that stands the test of time.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring, delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <MagneticButton
                className="px-8 py-4 rounded-full text-base font-bold text-white flex items-center justify-center gap-2"
                style={{ background: BRICK } as React.CSSProperties}
              >
                Get Free Estimate
                <ArrowRight size={18} weight="bold" />
              </MagneticButton>
              <MagneticButton
                className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/20 flex items-center justify-center gap-2 hover:bg-white/5 transition-colors"
              >
                <Phone size={18} />
                (253) 555-ROOF
              </MagneticButton>
            </motion.div>
          </div>

          {/* Hero visual — animated house/roof SVG */}
          <motion.div
            className="relative flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ ...spring, delay: 0.4 }}
          >
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background: `radial-gradient(circle, ${BRICK_GLOW} 0%, transparent 70%)`,
                filter: "blur(40px)",
                willChange: "transform",
              }}
              animate={{ scale: [1, 1.15, 1] }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <svg
              viewBox="0 0 200 180"
              className="relative z-10 w-64 h-56 md:w-80 md:h-72"
              fill="none"
            >
              {/* Roof outline */}
              <motion.path
                d="M100 20 L180 90 L170 90 L170 160 L30 160 L30 90 L20 90 Z"
                stroke={SLATE_BLUE}
                strokeWidth="2"
                fill="none"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 2, ease: "easeInOut" }}
              />
              {/* Roof shingles */}
              <motion.path
                d="M100 20 L180 90 L20 90 Z"
                fill={BRICK}
                fillOpacity="0.15"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 1 }}
              />
              {/* Chimney */}
              <motion.rect
                x="140"
                y="35"
                width="20"
                height="40"
                stroke={SLATE_BLUE}
                strokeWidth="1.5"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 1, duration: 1 }}
              />
              {/* Door */}
              <motion.rect
                x="85"
                y="115"
                width="30"
                height="45"
                rx="2"
                stroke={SLATE_BLUE}
                strokeWidth="1.5"
                fill="none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                transition={{ delay: 1.8, duration: 0.8 }}
              />
              {/* Windows */}
              <motion.rect
                x="50"
                y="105"
                width="22"
                height="22"
                rx="2"
                stroke={SLATE_BLUE}
                strokeWidth="1.5"
                fill={SLATE_GLOW}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2, duration: 0.8 }}
              />
              <motion.rect
                x="128"
                y="105"
                width="22"
                height="22"
                rx="2"
                stroke={SLATE_BLUE}
                strokeWidth="1.5"
                fill={SLATE_GLOW}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.2, duration: 0.8 }}
              />
              {/* Shield check on roof */}
              <motion.circle
                cx="100"
                cy="65"
                r="12"
                fill={BRICK}
                fillOpacity="0.3"
                stroke={BRICK}
                strokeWidth="1"
                animate={{ opacity: [0.3, 0.7, 0.3] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <motion.path
                d="M95 65 L99 69 L106 61"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 2.5, duration: 0.6 }}
              />
            </svg>
          </motion.div>
        </div>
      </section>

      {/* ─── 3. STATS ─── */}
      <SectionReveal className="relative z-10 py-20">
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(180deg, ${CHARCOAL} 0%, #1a1f2e 100%)`,
          }}
        />
        <div className="absolute inset-0 opacity-5">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `repeating-linear-gradient(90deg, ${SLATE_BLUE} 0px, ${SLATE_BLUE} 1px, transparent 1px, transparent 80px), repeating-linear-gradient(0deg, ${SLATE_BLUE} 0px, ${SLATE_BLUE} 1px, transparent 1px, transparent 80px)`,
            }}
          />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {[
              { value: "25+", label: "Years in Business" },
              { value: "4,800+", label: "Roofs Completed" },
              { value: "10", label: "Warranty Years" },
              { value: "4.9", label: "Customer Rating" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ ...spring, delay: i * 0.1 }}
                className="text-center"
              >
                <ShimmerBorder>
                  <div className="p-6 md:p-8">
                    <div
                      className="text-3xl md:text-4xl font-extrabold mb-2"
                      style={{ color: BRICK }}
                    >
                      {stat.value}
                    </div>
                    <div className="text-sm text-slate-400">{stat.label}</div>
                  </div>
                </ShimmerBorder>
              </motion.div>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ─── 4. SERVICES ─── */}
      <SectionReveal id="services" className="relative z-10 py-24">
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(180deg, #1a1f2e 0%, ${CHARCOAL} 100%)`,
          }}
        />
        {/* Diagonal shingle pattern */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.03]">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern
                id="shingles"
                width="60"
                height="30"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M0,15 Q15,0 30,15 Q45,30 60,15"
                  fill="none"
                  stroke={SLATE_BLUE}
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#shingles)" />
          </svg>
        </div>
        <div className="relative mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="inline-block text-sm font-semibold tracking-widest uppercase mb-4"
              style={{ color: BRICK }}
            >
              Our Services
            </motion.span>
            <h2 className="text-3xl md:text-5xl font-extrabold">
              <WordReveal text="Complete Roofing Solutions" />
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, i) => {
              const Icon = service.icon;
              return (
                <motion.div
                  key={service.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ ...spring, delay: i * 0.08 }}
                  whileHover={{ scale: 1.03 }}
                  style={{ willChange: "transform" }}
                >
                  <GlassCard className="p-6 md:p-8 h-full group">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-colors"
                      style={{ background: BRICK_GLOW }}
                    >
                      <Icon
                        size={28}
                        weight="duotone"
                        style={{ color: BRICK }}
                      />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">
                      {service.title}
                    </h3>
                    <p className="text-slate-400 leading-relaxed text-sm">
                      {service.description}
                    </p>
                  </GlassCard>
                </motion.div>
              );
            })}
          </div>
        </div>
      </SectionReveal>

      {/* ─── 5. BEFORE/AFTER ─── */}
      <SectionReveal id="gallery" className="relative z-10 py-24">
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(180deg, ${CHARCOAL} 0%, #0f1420 50%, ${CHARCOAL} 100%)`,
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[150px] opacity-10"
          style={{ background: BRICK }}
        />
        <div className="relative mx-auto max-w-4xl px-4 md:px-6">
          <div className="text-center mb-12">
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="inline-block text-sm font-semibold tracking-widest uppercase mb-4"
              style={{ color: BRICK }}
            >
              Our Work
            </motion.span>
            <h2 className="text-3xl md:text-5xl font-extrabold">
              <WordReveal text="See the Difference" />
            </h2>
            <p className="mt-4 text-slate-400 max-w-lg mx-auto">
              Drag the slider to compare our roof transformations. Real
              projects, real results.
            </p>
          </div>
          <BeforeAfterSlider />
        </div>
      </SectionReveal>

      {/* ─── 6. WHY CHOOSE US ─── */}
      <SectionReveal id="about" className="relative z-10 py-24">
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(180deg, #0f1420 0%, #1a1f2e 100%)`,
          }}
        />
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.04]">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern
                id="dots"
                width="30"
                height="30"
                patternUnits="userSpaceOnUse"
              >
                <circle cx="15" cy="15" r="1.5" fill={SLATE_BLUE} />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>
        </div>
        <div className="relative mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="inline-block text-sm font-semibold tracking-widest uppercase mb-4"
              style={{ color: BRICK }}
            >
              Why Summit
            </motion.span>
            <h2 className="text-3xl md:text-5xl font-extrabold">
              <WordReveal text="Built on Trust" />
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Certificate,
                title: "Licensed",
                desc: "Fully licensed general contractor with active bonding in WA, OR, and ID.",
              },
              {
                icon: ShieldCheck,
                title: "Insured",
                desc: "Full liability and workers comp coverage protects you and your property.",
              },
              {
                icon: Handshake,
                title: "Warranty",
                desc: "10-year workmanship warranty plus manufacturer-backed material warranties.",
              },
              {
                icon: MapPin,
                title: "Local",
                desc: "Family-owned and operated in the Pacific Northwest for over 25 years.",
              },
            ].map((badge, i) => {
              const Icon = badge.icon;
              return (
                <motion.div
                  key={badge.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ ...spring, delay: i * 0.1 }}
                  whileHover={{ scale: 1.04 }}
                  style={{ willChange: "transform" }}
                >
                  <GlassCard className="p-6 text-center h-full">
                    <div
                      className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                      style={{ background: BRICK_GLOW }}
                    >
                      <Icon
                        size={32}
                        weight="duotone"
                        style={{ color: BRICK }}
                      />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">
                      {badge.title}
                    </h3>
                    <p className="text-sm text-slate-400">{badge.desc}</p>
                  </GlassCard>
                </motion.div>
              );
            })}
          </div>
        </div>
      </SectionReveal>

      {/* ─── 7. PROCESS ─── */}
      <SectionReveal className="relative z-10 py-24">
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(180deg, #1a1f2e 0%, ${CHARCOAL} 100%)`,
          }}
        />
        {/* Subtle grid */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `repeating-linear-gradient(90deg, ${SLATE_BLUE} 0px, ${SLATE_BLUE} 1px, transparent 1px, transparent 60px), repeating-linear-gradient(0deg, ${SLATE_BLUE} 0px, ${SLATE_BLUE} 1px, transparent 1px, transparent 60px)`,
            }}
          />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="inline-block text-sm font-semibold tracking-widest uppercase mb-4"
              style={{ color: BRICK }}
            >
              How It Works
            </motion.span>
            <h2 className="text-3xl md:text-5xl font-extrabold">
              <WordReveal text="Our Simple Process" />
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-4">
            {[
              {
                step: "01",
                icon: MagnifyingGlass,
                title: "Free Inspection",
                desc: "We send a certified inspector to evaluate your roof with drone photography and a detailed 21-point assessment.",
              },
              {
                step: "02",
                icon: ClipboardText,
                title: "Detailed Quote",
                desc: "You receive a transparent, itemized quote with material options, timeline, and zero hidden fees.",
              },
              {
                step: "03",
                icon: Hammer,
                title: "Expert Installation",
                desc: "Our trained crews install your new roof with precision, keeping your property clean and secure throughout.",
              },
              {
                step: "04",
                icon: Eye,
                title: "Final Walkthrough",
                desc: "We walk the project with you, ensure everything is perfect, and activate your warranty protection.",
              },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ ...spring, delay: i * 0.12 }}
                >
                  <GlassCard className="p-6 md:p-8 h-full relative overflow-hidden">
                    <div
                      className="absolute top-4 right-4 text-5xl font-black opacity-[0.06]"
                      style={{ color: BRICK }}
                    >
                      {item.step}
                    </div>
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                      style={{ background: BRICK_GLOW }}
                    >
                      <Icon
                        size={24}
                        weight="duotone"
                        style={{ color: BRICK }}
                      />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-slate-400 leading-relaxed">
                      {item.desc}
                    </p>
                    {i < 3 && (
                      <div className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-20">
                        <ArrowRight
                          size={20}
                          weight="bold"
                          style={{ color: SLATE_BLUE }}
                        />
                      </div>
                    )}
                  </GlassCard>
                </motion.div>
              );
            })}
          </div>
        </div>
      </SectionReveal>

      {/* ─── 8. TESTIMONIALS ─── */}
      <SectionReveal id="testimonials" className="relative z-10 py-24">
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(180deg, ${CHARCOAL} 0%, #0f1420 100%)`,
          }}
        />
        <div
          className="absolute top-0 left-1/4 w-[400px] h-[400px] rounded-full blur-[120px] opacity-10"
          style={{ background: SLATE_BLUE }}
        />
        <div className="relative mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="inline-block text-sm font-semibold tracking-widest uppercase mb-4"
              style={{ color: BRICK }}
            >
              Testimonials
            </motion.span>
            <h2 className="text-3xl md:text-5xl font-extrabold">
              <WordReveal text="What Our Clients Say" />
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ ...spring, delay: i * 0.1 }}
                whileHover={{ scale: 1.03 }}
                style={{ willChange: "transform" }}
              >
                <GlassCard className="p-6 md:p-8 h-full flex flex-col">
                  <Quotes
                    size={32}
                    weight="fill"
                    className="mb-4 opacity-30"
                    style={{ color: BRICK }}
                  />
                  <p className="text-slate-300 leading-relaxed flex-1 text-sm">
                    &ldquo;{t.text}&rdquo;
                  </p>
                  <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                    <span className="font-semibold text-white">{t.name}</span>
                    <div className="flex gap-0.5">
                      {Array.from({ length: t.rating }).map((_, j) => (
                        <Star
                          key={j}
                          size={14}
                          weight="fill"
                          style={{ color: "#facc15" }}
                        />
                      ))}
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ─── 9. EMERGENCY CTA ─── */}
      <SectionReveal className="relative z-10 py-20">
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, #1a0000 0%, ${CHARCOAL} 40%, #1a0000 100%)`,
          }}
        />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: `radial-gradient(ellipse at center, ${BRICK_GLOW} 0%, transparent 70%)`,
          }}
        />
        <div className="relative mx-auto max-w-4xl px-4 md:px-6 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={spring}
          >
            <div
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border mb-8 text-sm font-semibold"
              style={{
                borderColor: "rgba(220, 38, 38, 0.3)",
                background: "rgba(220, 38, 38, 0.1)",
                color: BRICK_LIGHT,
              }}
            >
              <Warning size={18} weight="fill" />
              24/7 Emergency Response
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold mb-6">
              <WordReveal text="Storm Damage? We Respond Fast" />
            </h2>
            <p className="text-lg text-slate-400 mb-10 max-w-2xl mx-auto">
              Hail, wind, fallen trees — we have seen it all. Our emergency
              response team is ready around the clock. Call now for immediate
              assistance and free damage assessment.
            </p>
            <MagneticButton
              className="px-10 py-5 rounded-full text-lg font-bold text-white flex items-center gap-3 mx-auto"
              style={{ background: BRICK } as React.CSSProperties}
            >
              <Phone size={22} weight="fill" />
              Call (253) 555-ROOF Now
            </MagneticButton>
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── 10. MATERIALS ─── */}
      <SectionReveal className="relative z-10 py-24">
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(180deg, ${CHARCOAL} 0%, #1a1f2e 100%)`,
          }}
        />
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.03]">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern
                id="cross"
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M20,16 L20,24 M16,20 L24,20"
                  stroke={SLATE_BLUE}
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#cross)" />
          </svg>
        </div>
        <div className="relative mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="inline-block text-sm font-semibold tracking-widest uppercase mb-4"
              style={{ color: BRICK }}
            >
              Premium Materials
            </motion.span>
            <h2 className="text-3xl md:text-5xl font-extrabold">
              <WordReveal text="Quality You Can Trust" />
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {materials.map((m, i) => (
              <motion.div
                key={m.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ ...spring, delay: i * 0.1 }}
                whileHover={{ scale: 1.03 }}
                style={{ willChange: "transform" }}
              >
                <GlassCard className="overflow-hidden h-full">
                  <div className="h-40 overflow-hidden">
                    <img
                      src={m.image}
                      alt={m.name}
                      className="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-110"
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-white mb-2">
                      {m.name}
                    </h3>
                    <p className="text-sm text-slate-400 leading-relaxed">
                      {m.description}
                    </p>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ─── 11. FAQ ─── */}
      <SectionReveal className="relative z-10 py-24">
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(180deg, #1a1f2e 0%, ${CHARCOAL} 100%)`,
          }}
        />
        <div
          className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full blur-[120px] opacity-10"
          style={{ background: SLATE_BLUE }}
        />
        <div className="relative mx-auto max-w-3xl px-4 md:px-6">
          <div className="text-center mb-16">
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="inline-block text-sm font-semibold tracking-widest uppercase mb-4"
              style={{ color: BRICK }}
            >
              FAQ
            </motion.span>
            <h2 className="text-3xl md:text-5xl font-extrabold">
              <WordReveal text="Common Questions" />
            </h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ ...spring, delay: i * 0.08 }}
              >
                <AccordionItem
                  title={faq.title}
                  description={faq.description}
                  isOpen={openFaq === i}
                  onToggle={() => setOpenFaq(openFaq === i ? null : i)}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ─── 12. CONTACT ─── */}
      <SectionReveal id="contact" className="relative z-10 py-24">
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(180deg, ${CHARCOAL} 0%, #0f1420 100%)`,
          }}
        />
        <div
          className="absolute top-1/2 left-1/4 w-[300px] h-[300px] rounded-full blur-[100px] opacity-10"
          style={{ background: BRICK }}
        />
        <div className="relative mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="inline-block text-sm font-semibold tracking-widest uppercase mb-4"
              style={{ color: BRICK }}
            >
              Get In Touch
            </motion.span>
            <h2 className="text-3xl md:text-5xl font-extrabold">
              <WordReveal text="Ready to Get Started?" />
            </h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Contact Info */}
            <div className="space-y-6">
              <GlassCard className="p-6">
                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: BRICK_GLOW }}
                  >
                    <Phone
                      size={24}
                      weight="duotone"
                      style={{ color: BRICK }}
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">
                      Call Us
                    </h3>
                    <p className="text-slate-400">(253) 555-ROOF</p>
                    <p className="text-sm text-slate-500 mt-1">
                      Available 24/7 for emergencies
                    </p>
                  </div>
                </div>
              </GlassCard>
              <GlassCard className="p-6">
                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: BRICK_GLOW }}
                  >
                    <MapPin
                      size={24}
                      weight="duotone"
                      style={{ color: BRICK }}
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">
                      Visit Us
                    </h3>
                    <p className="text-slate-400">
                      4521 Pacific Ave, Suite 200
                    </p>
                    <p className="text-slate-400">Tacoma, WA 98402</p>
                  </div>
                </div>
              </GlassCard>
              <GlassCard className="p-6">
                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: BRICK_GLOW }}
                  >
                    <Clock
                      size={24}
                      weight="duotone"
                      style={{ color: BRICK }}
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">Hours</h3>
                    <p className="text-slate-400">Mon - Fri: 7:00am - 6:00pm</p>
                    <p className="text-slate-400">Sat: 8:00am - 2:00pm</p>
                    <p className="text-sm text-slate-500 mt-1">
                      Emergency services available 24/7
                    </p>
                  </div>
                </div>
              </GlassCard>
            </div>
            {/* Contact Form */}
            <GlassCard className="p-6 md:p-8">
              <h3 className="text-xl font-bold text-white mb-6">
                Request Your Free Inspection
              </h3>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Full Name"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-red-500/50 transition-colors"
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-red-500/50 transition-colors"
                  />
                </div>
                <input
                  type="email"
                  placeholder="Email Address"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-red-500/50 transition-colors"
                />
                <select className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-500 focus:outline-none focus:border-red-500/50 transition-colors">
                  <option value="">Select Service Needed</option>
                  <option value="replacement">Roof Replacement</option>
                  <option value="repair">Roof Repair</option>
                  <option value="storm">Storm Damage</option>
                  <option value="gutters">Gutter Installation</option>
                  <option value="inspection">Inspection</option>
                  <option value="commercial">Commercial Roofing</option>
                </select>
                <textarea
                  placeholder="Tell us about your project..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-red-500/50 transition-colors resize-none"
                />
                <MagneticButton
                  className="w-full px-6 py-4 rounded-xl text-base font-bold text-white flex items-center justify-center gap-2"
                  style={{ background: BRICK } as React.CSSProperties}
                >
                  Schedule Free Inspection
                  <ArrowRight size={18} weight="bold" />
                </MagneticButton>
              </form>
            </GlassCard>
          </div>
        </div>
      </SectionReveal>

      {/* ─── 13. FOOTER ─── */}
      <footer className="relative z-10 border-t border-white/5 py-8">
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(180deg, #0f1420 0%, #0a0d14 100%)` }}
        />
        <div className="relative mx-auto max-w-7xl px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <House size={16} weight="duotone" style={{ color: BRICK }} />
            <span>Summit Roofing NW &copy; {new Date().getFullYear()}</span>
          </div>
          <p className="text-xs text-slate-600">
            Website created by Bluejay Business Solutions
          </p>
        </div>
      </footer>
    </main>
  );
}
