"use client";

/* eslint-disable @next/next/no-img-element -- Static marketing showcase uses plain img tags intentionally. */
/* eslint-disable react-hooks/purity -- Decorative particle values randomized for static visual effects. */

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
  CheckCircle,
  Quotes,
  X,
  List,
  Lightning,
  Drop,
  MagnifyingGlass,
  Buildings,
  Certificate,
  Hammer,
  Eye,
  Warning,
  Play,
  Envelope,
  Shield,
  Trophy,
  Users,
} from "@phosphor-icons/react";

/* ═══════════════════════════════════════════════════════════════════
   SPRING & ANIMATION CONFIG
   ═══════════════════════════════════════════════════════════════════ */
const spring = {
  type: "spring" as const,
  stiffness: 100,
  damping: 20,
};
const springFast = {
  type: "spring" as const,
  stiffness: 200,
  damping: 25,
};
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

/* ═══════════════════════════════════════════════════════════════════
   COLOR PALETTE
   ═══════════════════════════════════════════════════════════════════ */
const CHARCOAL = "#111827";
const CHARCOAL_DEEP = "#0a0f1a";
const SLATE_BLUE = "#475569";
const BRICK = "#dc2626";
const BRICK_LIGHT = "#ef4444";
const BRICK_GLOW = "rgba(220, 38, 38, 0.15)";
const GOLD = "#ca8a04";
const GOLD_GLOW = "rgba(202, 138, 4, 0.15)";

/* ═══════════════════════════════════════════════════════════════════
   DATA CONSTANTS
   ═══════════════════════════════════════════════════════════════════ */
const SERVICES = [
  {
    title: "Roof Replacement",
    description:
      "Complete tear-off and replacement with premium architectural shingles, metal, or tile. We handle permits, cleanup, and final inspection — zero hassle guaranteed.",
    icon: House,
  },
  {
    title: "Storm Damage Repair",
    description:
      "Emergency response for hail, wind, and fallen debris damage. We document everything and work directly with your insurance from day one.",
    icon: Lightning,
  },
  {
    title: "Commercial Roofing",
    description:
      "Flat roofs, TPO, EPDM, and modified bitumen systems for warehouses, offices, and retail. Minimal downtime, maximum protection for your business.",
    icon: Buildings,
  },
  {
    title: "Gutter Systems",
    description:
      "Seamless aluminum gutters, gutter guards, and downspout systems engineered to channel water away from your foundation year-round.",
    icon: Drop,
  },
  {
    title: "Roof Inspections",
    description:
      "Comprehensive 21-point inspection with drone photography and detailed digital reports. Know your roof's condition before small issues become emergencies.",
    icon: MagnifyingGlass,
  },
  {
    title: "Emergency Repairs",
    description:
      "Active leak? Missing shingles after a storm? Our 24/7 emergency crew is on-site within 2 hours, day or night, rain or shine.",
    icon: Warning,
  },
];

const INSURANCE_STEPS = [
  {
    step: "1",
    title: "Free Inspection",
    description: "We document every inch of damage with photos, measurements, and drone footage for your claim file.",
  },
  {
    step: "2",
    title: "File Claim",
    description: "We compile and submit all documentation to your insurance provider with a detailed scope of work.",
  },
  {
    step: "3",
    title: "Meet Adjuster",
    description: "We meet your adjuster on-site and walk them through every detail to ensure full coverage.",
  },
  {
    step: "4",
    title: "New Roof — $0 Out of Pocket",
    description: "Your roof restored to new. We handle everything so you pay nothing beyond your deductible.",
  },
];

const MATERIALS = [
  {
    name: "Architectural Shingles",
    warranty: "30-50 Year Warranty",
    description:
      "Premium dimensional shingles with enhanced wind resistance and rich, layered aesthetics. The most popular choice for Pacific Northwest homes.",
    icon: House,
  },
  {
    name: "Standing Seam Metal",
    warranty: "50+ Year Warranty",
    description:
      "Interlocking metal panels with concealed fasteners. Energy efficient, fire resistant, and virtually maintenance-free for decades.",
    icon: Shield,
  },
  {
    name: "Cedar Shake",
    warranty: "Eco-Friendly",
    description:
      "Hand-split natural wood shakes delivering timeless beauty, excellent insulation, and authentic Pacific Northwest character.",
    icon: Hammer,
  },
  {
    name: "Composite Tile",
    warranty: "Impact-Resistant",
    description:
      "Engineered for extreme Pacific Northwest weather. Class 4 impact rating with the elegant look of natural slate at a fraction of the weight.",
    icon: ShieldCheck,
  },
];

const TESTIMONIALS = [
  {
    name: "The Hendersons",
    text: "Jake's crew replaced our entire roof in one day. ONE DAY. We couldn't believe how fast and clean they were. Not a single nail left in the yard.",
    rating: 5,
  },
  {
    name: "Patricia R.",
    text: "Insurance tried to lowball us. Summit fought and got us $18K more than the initial offer. They handled everything — we barely had to lift a finger.",
    rating: 5,
  },
  {
    name: "Mike & Lisa T.",
    text: "Three quotes. Summit was the middle price but the only one with a 50-year warranty. That told us everything we needed to know about their confidence.",
    rating: 5,
  },
  {
    name: "Steven K.",
    text: "They fixed a leak 2 other roofers couldn't find. Problem solved in an hour. Incredible diagnostic skill — wish I'd called them first.",
    rating: 5,
  },
  {
    name: "Greg M.",
    text: "Commercial flat roof for our warehouse. Professional, fast, zero leaks since installation. Highly recommend Summit for business owners.",
    rating: 5,
  },
];

const COMPARISON_ROWS = [
  { feature: "Licensed & Bonded", us: true, them: "Sometimes" },
  { feature: "GAF Master Elite Certified", us: true, them: "No" },
  { feature: "50-Year Warranty Available", us: true, them: "No" },
  { feature: "Insurance Claim Assistance", us: true, them: "Varies" },
  { feature: "Drone Inspections", us: true, them: "No" },
  { feature: "Same-Day Emergency Response", us: true, them: "Varies" },
  { feature: "Transparent Upfront Pricing", us: true, them: "Sometimes" },
];

const SERVICE_AREAS = [
  "Seattle",
  "Bellevue",
  "Kirkland",
  "Redmond",
  "Bothell",
  "Shoreline",
  "Lynnwood",
  "Edmonds",
];

const FINANCING_PLANS = [
  {
    price: "$89",
    period: "/mo",
    title: "Roof Repair",
    features: [
      "Minor leak repairs",
      "Shingle replacement",
      "Flashing fixes",
    ],
    featured: false,
  },
  {
    price: "$149",
    period: "/mo",
    title: "Full Reroof",
    features: [
      "Complete tear-off & replace",
      "Premium materials included",
      "50-year warranty",
    ],
    featured: true,
  },
  {
    price: "$199",
    period: "/mo",
    title: "Premium Upgrade",
    features: [
      "Metal or tile roofing",
      "Custom gutter systems",
      "Lifetime warranty",
    ],
    featured: false,
  },
];

const QUIZ_OPTIONS = [
  {
    label: "Under 10 Years",
    color: "#22c55e",
    shortLabel: "<10",
    recommendation:
      "Your roof is likely in good shape. Schedule a free inspection to catch small issues before they grow into costly repairs. Preventive maintenance now can add years to your roof.",
  },
  {
    label: "10-20 Years",
    color: "#f59e0b",
    shortLabel: "10+",
    recommendation:
      "Time for a professional inspection. Many Seattle roofs in this age range need targeted repairs or maintenance to extend their lifespan through our rainy winters.",
  },
  {
    label: "20+ Years",
    color: "#ef4444",
    shortLabel: "20+",
    recommendation:
      "Your roof is likely approaching end of life. A free inspection will tell you exactly where you stand and whether replacement is needed before leaks start causing interior damage.",
  },
];

/* ═══════════════════════════════════════════════════════════════════
   FLOATING RAIN PARTICLES
   ═══════════════════════════════════════════════════════════════════ */
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

/* ═══════════════════════════════════════════════════════════════════
   ROOFLINE SVG PATTERN
   ═══════════════════════════════════════════════════════════════════ */
function RooflinePattern() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.06]">
      <svg
        viewBox="0 0 1440 400"
        className="absolute bottom-0 w-full"
        preserveAspectRatio="none"
        fill="none"
      >
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
        <rect x="70" y="260" width="20" height="30" stroke={BRICK} strokeWidth="1" />
        <rect x="390" y="250" width="20" height="30" stroke={BRICK} strokeWidth="1" />
        <rect x="710" y="260" width="20" height="30" stroke={BRICK} strokeWidth="1" />
        <rect x="1030" y="250" width="20" height="30" stroke={BRICK} strokeWidth="1" />
        <rect x="1350" y="260" width="20" height="30" stroke={BRICK} strokeWidth="1" />
      </svg>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   SECTION REVEAL
   ═══════════════════════════════════════════════════════════════════ */
function SectionReveal({
  children,
  className = "",
  id,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.section
      ref={ref}
      id={id}
      className={className}
      style={style}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={spring}
    >
      {children}
    </motion.section>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   GLASS CARD
   ═══════════════════════════════════════════════════════════════════ */
function GlassCard({
  children,
  className = "",
  style,
  id,
  onClick,
  href,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  id?: string;
  onClick?: () => void;
  href?: string;
}) {
  if (href) {
    return (
      <a
        href={href}
        id={id}
        onClick={onClick}
        className={`rounded-2xl border border-white/15 bg-white/[0.08] backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] ${className}`}
        style={style}
      >
        {children}
      </a>
    );
  }
  return (
    <div
      id={id}
      onClick={onClick}
      className={`rounded-2xl border border-white/15 bg-white/[0.08] backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MAGNETIC BUTTON
   ═══════════════════════════════════════════════════════════════════ */
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

/* ═══════════════════════════════════════════════════════════════════
   SHIMMER BORDER
   ═══════════════════════════════════════════════════════════════════ */
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
      <div className="relative rounded-2xl bg-gray-900 z-10">
        {children}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   COUNTER ANIMATION
   ═══════════════════════════════════════════════════════════════════ */
function AnimatedCounter({
  target,
  suffix = "",
}: {
  target: number;
  suffix?: string;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const end = target;
    const duration = 2000;
    const stepTime = 16;
    const steps = duration / stepTime;
    const increment = end / steps;
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, stepTime);
    return () => clearInterval(timer);
  }, [isInView, target]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   SECTION HEADER COMPONENT
   ═══════════════════════════════════════════════════════════════════ */
function SectionHeader({
  label,
  title,
  subtitle,
  labelColor = BRICK,
}: {
  label: string;
  title: string;
  subtitle?: string;
  labelColor?: string;
}) {
  return (
    <div className="text-center mb-14">
      <span
        className="text-xs font-semibold uppercase tracking-[0.2em] mb-3 block"
        style={{ color: labelColor }}
      >
        {label}
      </span>
      <h2 className="text-3xl md:text-4xl font-black tracking-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="text-slate-400 mt-3 max-w-xl mx-auto leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN PAGE COMPONENT
   ═══════════════════════════════════════════════════════════════════ */
export default function RoofingShowcase() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
  });

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileMenuOpen(false);
  };

  return (
    <div
      className="relative min-h-screen text-white overflow-x-hidden"
      style={{ background: CHARCOAL }}
    >
      <FloatingParticles />

      {/* ═══════════════════ NAVIGATION ═══════════════════ */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-gray-900/80 border-b border-white/8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: BRICK }}
            >
              <House size={18} weight="fill" className="text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              Summit Roofing NW
            </span>
          </div>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-6 text-sm text-slate-300">
            {["Services", "Materials", "Reviews", "Contact"].map((item) => (
              <button
                key={item}
                onClick={() => scrollTo(item.toLowerCase())}
                className="hover:text-white transition-colors cursor-pointer"
              >
                {item}
              </button>
            ))}
            <MagneticButton
              className="px-4 py-2 rounded-xl text-white font-semibold text-sm cursor-pointer"
              style={{ background: BRICK }}
              onClick={() => scrollTo("contact")}
            >
              Free Estimate
            </MagneticButton>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-white cursor-pointer"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <List size={24} />}
          </button>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={spring}
              className="md:hidden overflow-hidden bg-gray-900/95 border-t border-white/8"
            >
              <div className="px-4 py-4 flex flex-col gap-3">
                {["Services", "Materials", "Reviews", "Contact"].map(
                  (item) => (
                    <button
                      key={item}
                      onClick={() => scrollTo(item.toLowerCase())}
                      className="text-left text-slate-300 hover:text-white py-2 cursor-pointer"
                    >
                      {item}
                    </button>
                  )
                )}
                <button
                  onClick={() => scrollTo("contact")}
                  className="mt-2 px-4 py-3 rounded-xl text-white font-semibold text-center cursor-pointer"
                  style={{ background: BRICK }}
                >
                  Free Estimate
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ═══════════════════ SECTION 1 — SPLIT-SCREEN HERO ═══════════════════ */}
      <section className="relative pt-16 min-h-screen flex overflow-hidden">
        <RooflinePattern />

        {/* Hero image — background on mobile, right half on desktop */}
        <div className="absolute inset-0 lg:relative lg:w-1/2 lg:order-2">
          <img
            src="/images/roofing-hero.png"
            alt="Summit Roofing NW — professional roofer at work"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/70 lg:bg-gradient-to-r lg:from-gray-900/50 lg:to-transparent" />
        </div>

        {/* Left Half — Content */}
        <div className="relative z-10 w-full lg:w-1/2 lg:order-1 flex flex-col justify-center px-6 sm:px-10 lg:px-16 py-24 lg:py-0">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ...spring, delay: 0.2 }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/15 bg-white/[0.07] mb-6">
              <ShieldCheck
                size={16}
                weight="fill"
                style={{ color: BRICK }}
              />
              <span className="text-xs font-medium text-slate-300">
                GAF Master Elite Contractor
              </span>
            </div>

            {/* Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] mb-6">
              Seattle&apos;s Roof.{" "}
              <span style={{ color: BRICK }}>Built to Last.</span>
            </h1>

            {/* Subtext */}
            <p className="text-lg text-slate-400 max-w-lg mb-8 leading-relaxed">
              25 years protecting Pacific Northwest homes. From storm damage
              emergencies to complete replacements, Summit Roofing NW delivers
              craftsmanship you can trust — backed by a warranty that proves it.
            </p>

            {/* Stats Counter Row */}
            <div className="flex flex-wrap gap-8 mb-10">
              <div className="text-center">
                <div
                  className="text-2xl sm:text-3xl font-black"
                  style={{ color: BRICK }}
                >
                  <AnimatedCounter target={25} suffix=" Years" />
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Experience
                </div>
              </div>
              <div className="text-center">
                <div
                  className="text-2xl sm:text-3xl font-black"
                  style={{ color: BRICK }}
                >
                  <AnimatedCounter target={1200} suffix="+" />
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Roofs Completed
                </div>
              </div>
              <div className="text-center">
                <div
                  className="text-2xl sm:text-3xl font-black"
                  style={{ color: BRICK }}
                >
                  GAF
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Master Elite
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <MagneticButton
                className="px-6 py-3.5 rounded-xl text-white font-bold text-base cursor-pointer flex items-center gap-2"
                style={{ background: BRICK }}
                onClick={() => scrollTo("contact")}
              >
                Get Free Estimate
                <ArrowRight size={18} weight="bold" />
              </MagneticButton>
              <MagneticButton
                className="px-6 py-3.5 rounded-xl font-bold text-base cursor-pointer border border-white/20 text-white hover:bg-white/5 flex items-center gap-2"
                onClick={() => scrollTo("services")}
              >
                <Phone size={18} weight="fill" />
                (206) 555-0734
              </MagneticButton>
            </div>
          </motion.div>
        </div>

        {/* Vertical Divider */}
        <div className="hidden lg:block absolute left-1/2 top-16 bottom-0 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent z-20" />
      </section>

      {/* ═══════════════════ SECTION 2 — EMERGENCY STRIP ═══════════════════ */}
      <SectionReveal className="relative z-10">
        <div className="py-4" style={{ background: BRICK }}>
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-white">
            <div className="flex items-center gap-3">
              <motion.div
                className="w-3 h-3 rounded-full bg-white"
                animate={{
                  scale: [1, 1.4, 1],
                  opacity: [1, 0.5, 1],
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <span className="font-bold text-sm sm:text-base">
                Storm Damage? We&apos;re On-Site in 2 Hours
              </span>
            </div>
            <a
              href="tel:2065550734"
              className="flex items-center gap-2 font-black text-lg hover:underline"
            >
              <Phone size={20} weight="fill" />
              (206) 555-0734
            </a>
          </div>
        </div>
      </SectionReveal>

      {/* ═══════════════════ SECTION 3 — TRUST BAR ═══════════════════ */}
      <SectionReveal
        className="relative z-10 py-8 border-b border-white/8"
        style={{ background: "rgba(17,24,39,0.95)" }}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8">
            {[
              { icon: Clock, text: "25 Years" },
              { icon: Certificate, text: "GAF Master Elite" },
              { icon: House, text: "1,200+ Roofs" },
              // fictional license — replace per-prospect on signup
              { icon: ShieldCheck, text: "WA #SUMMITN897RZ" },
              { icon: Trophy, text: "A+ BBB Rating" },
            ].map((item) => (
              <div
                key={item.text}
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/15 bg-white/[0.08]"
              >
                <item.icon
                  size={16}
                  weight="duotone"
                  style={{ color: BRICK }}
                />
                <span className="text-sm font-medium text-slate-300">
                  {item.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ═══════════════════ SECTION 4 — SERVICES ═══════════════════ */}
      <SectionReveal
        id="services"
        className="relative z-10 py-20 md:py-28"
      >
        <RooflinePattern />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            label="What We Do"
            title="Roofing Services"
            subtitle="From emergency repairs to full commercial installations, we handle it all with precision and care."
          />
          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {SERVICES.map((svc, i) => (
              <motion.div key={svc.title} variants={fadeUp}>
                <GlassCard className="p-6 h-full hover:border-red-500/20 transition-colors group">
                  <div className="flex items-start gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors"
                      style={{ background: BRICK_GLOW }}
                    >
                      <svc.icon
                        size={24}
                        weight="duotone"
                        style={{ color: BRICK }}
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="text-xs font-bold px-2 py-0.5 rounded-md"
                          style={{
                            background: BRICK_GLOW,
                            color: BRICK_LIGHT,
                          }}
                        >
                          0{i + 1}
                        </span>
                        <h3 className="font-bold text-white text-lg">
                          {svc.title}
                        </h3>
                      </div>
                      <p className="text-sm text-slate-400 leading-relaxed mt-1">
                        {svc.description}
                      </p>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ═══════════════════ SECTION 5 — INSURANCE CLAIMS PROCESS ═══════════════════ */}
      <SectionReveal
        className="relative z-10 py-20 md:py-28"
        style={{
          background:
            "linear-gradient(180deg, rgba(17,24,39,1) 0%, rgba(30,30,30,1) 100%)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            label="Insurance Made Easy"
            title="We Handle Your Insurance Claim"
            subtitle="From inspection to installation. You pay nothing out of pocket beyond your deductible."
            labelColor={GOLD}
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {/* Connecting line */}
            <div
              className="hidden lg:block absolute top-14 left-[12.5%] right-[12.5%] h-px"
              style={{
                background: `linear-gradient(90deg, ${GOLD}33, ${GOLD}, ${GOLD}33)`,
              }}
            />
            {INSURANCE_STEPS.map((step) => (
              <motion.div
                key={step.step}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
              >
                <div className="text-center relative">
                  <div
                    className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center font-black text-xl text-white relative z-10"
                    style={{
                      background: `linear-gradient(135deg, ${GOLD}, ${GOLD}cc)`,
                      boxShadow: `0 0 30px ${GOLD}33`,
                    }}
                  >
                    {step.step}
                  </div>
                  <h3 className="font-bold text-white text-lg mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <ShimmerBorder className="inline-block">
              <div className="px-8 py-4 flex items-center gap-3">
                <Shield
                  size={24}
                  weight="fill"
                  style={{ color: GOLD }}
                />
                <span className="text-white font-bold">
                  Your Insurance Claim Handled Start to Finish
                </span>
              </div>
            </ShimmerBorder>
          </div>
        </div>
      </SectionReveal>

      {/* ═══════════════════ SECTION 6 — PREMIUM MATERIALS ═══════════════════ */}
      <SectionReveal
        id="materials"
        className="relative z-10 py-20 md:py-28"
      >
        <RooflinePattern />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            label="Built to Last"
            title="Premium Materials"
            subtitle="We only install materials we'd put on our own homes. Every option backed by manufacturer and workmanship warranties."
          />
          <motion.div
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {MATERIALS.map((mat) => (
              <motion.div key={mat.name} variants={fadeUp}>
                <GlassCard className="p-6 h-full text-center hover:border-red-500/20 transition-colors">
                  <div
                    className="w-14 h-14 rounded-xl mx-auto mb-4 flex items-center justify-center"
                    style={{ background: BRICK_GLOW }}
                  >
                    <mat.icon
                      size={28}
                      weight="duotone"
                      style={{ color: BRICK }}
                    />
                  </div>
                  <h3 className="font-bold text-white text-lg mb-1">
                    {mat.name}
                  </h3>
                  <span
                    className="text-xs font-semibold px-3 py-1 rounded-full inline-block mb-3"
                    style={{ background: GOLD_GLOW, color: GOLD }}
                  >
                    {mat.warranty}
                  </span>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {mat.description}
                  </p>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ═══════════════════ SECTION 7 — BEFORE / AFTER ═══════════════════ */}
      <SectionReveal
        className="relative z-10 py-20 md:py-28"
        style={{
          background:
            "linear-gradient(180deg, rgba(17,24,39,1) 0%, rgba(20,20,30,1) 100%)",
        }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            label="Real Results"
            title="Before & After"
            subtitle="See the transformation. Every project documented from start to finish."
          />
          <GlassCard className="overflow-hidden">
            <div className="relative w-full aspect-[16/10]">
              <img
                src="/images/roofing-before-after.jpg"
                alt="Summit Roofing NW before and after roof replacement"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <div className="absolute bottom-4 left-4 px-4 py-2 rounded-full bg-slate-800/80 backdrop-blur-sm text-white text-sm font-bold">
                Before
              </div>
              <div
                className="absolute bottom-4 right-4 px-4 py-2 rounded-full backdrop-blur-sm text-white text-sm font-bold"
                style={{ background: `${BRICK}cc` }}
              >
                After
              </div>
            </div>
          </GlassCard>
          <p className="text-center text-sm text-slate-500 mt-4">
            Complete tear-off and replacement with architectural shingles — Seattle, WA
          </p>
        </div>
      </SectionReveal>

      {/* ═══════════════════ SECTION 7.5 — PROJECT GALLERY ═══════════════════ */}
      <SectionReveal className="relative z-10 py-20 md:py-28">
        <RooflinePattern />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            label="Our Work"
            title="Recent Projects"
            subtitle="From shingle replacements to full commercial installations across the greater Seattle area."
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                src: "https://images.unsplash.com/photo-1633759593085-1eaeb724fc88?w=600&h=500&fit=crop&q=80",
                label: "Roof Inspection",
              },
              {
                src: "https://images.unsplash.com/photo-1635424824800-692767998d07?w=600&h=500&fit=crop&q=80",
                label: "Shingle Installation",
              },
              {
                src: "https://images.unsplash.com/photo-1635424824849-1b09bdcc55b1?w=600&h=500&fit=crop&q=80",
                label: "New Construction",
              },
              {
                src: "https://images.unsplash.com/photo-1635424709870-cdc6e64f0e20?w=600&h=500&fit=crop&q=80",
                label: "Completed Project",
              },
            ].map((project) => (
              <GlassCard
                key={project.label}
                className="overflow-hidden group"
              >
                <div className="relative aspect-[4/3]">
                  <img
                    src={project.src}
                    alt={`${project.label} — Summit Roofing NW`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <span className="text-sm font-bold text-white">
                      {project.label}
                    </span>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ═══════════════════ SECTION 8 — MEET JAKE MORRISON ═══════════════════ */}
      <SectionReveal className="relative z-10 py-20 md:py-28">
        <RooflinePattern />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Text side */}
            <div>
              <span
                className="text-xs font-semibold uppercase tracking-[0.2em] mb-3 block"
                style={{ color: BRICK }}
              >
                Owner Spotlight
              </span>
              <h2 className="text-3xl md:text-4xl font-black mb-6">
                Meet Jake Morrison
              </h2>
              <p className="text-slate-400 leading-relaxed mb-4">
                Started swinging a hammer at 16. Now leads a crew of 12
                across the greater Seattle area. Jake built Summit Roofing NW
                on a simple promise: treat every roof like it&apos;s your own
                home.
              </p>
              <p className="text-slate-400 leading-relaxed mb-6">
                With 25 years of hands-on experience and GAF Master Elite
                certification, Jake personally oversees every project from
                initial inspection to final walkthrough. No shortcuts, no
                excuses, no subcontractors you&apos;ve never met — just
                honest craftsmanship from a crew that takes pride in their
                work.
              </p>
              <div className="flex flex-wrap gap-3 mb-6">
                {[
                  "GAF Master Elite",
                  "A+ BBB",
                  "WA #SUMMITN897RZ",
                  "25 Years Experience",
                ].map((badge) => (
                  <span
                    key={badge}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold border border-white/15 bg-white/[0.07] text-slate-300"
                  >
                    <CheckCircle
                      size={12}
                      weight="fill"
                      className="inline mr-1"
                      style={{ color: BRICK }}
                    />
                    {badge}
                  </span>
                ))}
              </div>
              <MagneticButton
                className="px-6 py-3 rounded-xl text-white font-bold cursor-pointer flex items-center gap-2"
                style={{ background: BRICK }}
                onClick={() => scrollTo("contact")}
              >
                <Phone size={18} weight="fill" />
                Talk to Jake Directly
              </MagneticButton>
            </div>

            {/* Card side */}
            <div className="flex justify-center">
              <GlassCard className="p-8 text-center max-w-sm w-full">
                <img
                  src="https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=400&h=400&fit=crop&crop=faces&q=80"
                  alt="Jake Morrison — roofing team leader"
                  className="w-24 h-24 rounded-full mx-auto mb-4 object-cover object-top"
                />
                <h3 className="text-xl font-bold text-white mb-1">
                  Jake Morrison
                </h3>
                <p className="text-sm text-slate-400 mb-5">
                  Owner &amp; Master Roofer
                </p>
                <div className="space-y-3 text-sm text-slate-400">
                  <div className="flex items-center justify-center gap-2">
                    <Certificate
                      size={16}
                      style={{ color: GOLD }}
                    />
                    <span>GAF Master Elite Certified</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <ShieldCheck
                      size={16}
                      style={{ color: GOLD }}
                    />
                    <span>WA License #SUMMITN897RZ</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Trophy size={16} style={{ color: GOLD }} />
                    <span>A+ BBB Rating</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Users size={16} style={{ color: GOLD }} />
                    <span>Crew of 12 Professionals</span>
                  </div>
                </div>
              </GlassCard>
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* ═══════════════════ SECTION 9 — FINANCING ═══════════════════ */}
      <SectionReveal
        className="relative z-10 py-20 md:py-28"
        style={{
          background:
            "linear-gradient(180deg, rgba(17,24,39,1) 0%, rgba(30,30,30,1) 100%)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            label="Flexible Payments"
            title="Financing Available"
            subtitle="0% interest available on qualifying projects. Protect your home today, pay over time."
            labelColor={GOLD}
          />
          <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {FINANCING_PLANS.map((plan) => (
              <div key={plan.title} className={plan.featured ? "mt-4 sm:mt-0" : ""}>
                {plan.featured ? (
                  <ShimmerBorder>
                    <div className="p-6 text-center relative">
                      <span
                        className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold text-white"
                        style={{ background: GOLD }}
                      >
                        Most Popular
                      </span>
                      <h3 className="text-lg font-bold text-white mt-3 mb-2">
                        {plan.title}
                      </h3>
                      <div className="mb-4">
                        <span
                          className="text-4xl font-black"
                          style={{ color: GOLD }}
                        >
                          {plan.price}
                        </span>
                        <span className="text-slate-400 text-sm">
                          {plan.period}
                        </span>
                      </div>
                      <ul className="space-y-2 mb-6">
                        {plan.features.map((f) => (
                          <li
                            key={f}
                            className="text-sm text-slate-300 flex items-center gap-2"
                          >
                            <CheckCircle
                              size={16}
                              weight="fill"
                              style={{ color: GOLD }}
                            />
                            {f}
                          </li>
                        ))}
                      </ul>
                      <button
                        className="w-full py-3 rounded-xl font-bold text-white cursor-pointer"
                        style={{ background: GOLD }}
                      >
                        Get Started
                      </button>
                    </div>
                  </ShimmerBorder>
                ) : (
                  <GlassCard className="p-6 text-center h-full">
                    <h3 className="text-lg font-bold text-white mb-2">
                      {plan.title}
                    </h3>
                    <div className="mb-4">
                      <span className="text-4xl font-black text-white">
                        {plan.price}
                      </span>
                      <span className="text-slate-400 text-sm">
                        {plan.period}
                      </span>
                    </div>
                    <ul className="space-y-2 mb-6">
                      {plan.features.map((f) => (
                        <li
                          key={f}
                          className="text-sm text-slate-400 flex items-center gap-2"
                        >
                          <CheckCircle
                            size={16}
                            weight="fill"
                            className="text-slate-500"
                          />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <button className="w-full py-3 rounded-xl font-bold text-white border border-white/20 hover:bg-white/5 cursor-pointer">
                      Learn More
                    </button>
                  </GlassCard>
                )}
              </div>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ═══════════════════ SECTION 10 — TESTIMONIALS (CARD STACK) ═══════════════════ */}
      <SectionReveal
        id="reviews"
        className="relative z-10 py-20 md:py-28"
      >
        <RooflinePattern />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            label="Trusted by Homeowners"
            title="What Seattle Says About Us"
          />

          {/* Google rating header */}
          <div className="flex items-center justify-center gap-2 mb-10 -mt-6">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={22}
                  weight="fill"
                  className="text-yellow-400"
                />
              ))}
            </div>
            <span className="text-slate-400 text-sm font-medium ml-1">
              4.9 / 5.0 from 200+ reviews
            </span>
          </div>

          {/* Card Stack Layout — staggered cards with slight rotation */}
          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.name}
                variants={fadeUp}
                style={{
                  transform:
                    i % 2 === 1 ? "translateY(16px)" : undefined,
                  rotate: i % 3 === 0 ? -0.5 : i % 3 === 1 ? 0.5 : 0,
                }}
              >
                <GlassCard
                  className="p-6 h-full relative hover:border-red-500/20 transition-all hover:-translate-y-1"
                  style={{
                    boxShadow: `0 ${4 + i * 2}px ${20 + i * 4}px rgba(0,0,0,0.3)`,
                  }}
                >
                  <Quotes
                    size={32}
                    weight="fill"
                    className="mb-3 opacity-20"
                    style={{ color: BRICK }}
                  />
                  <p className="text-slate-300 leading-relaxed mb-5 italic">
                    &ldquo;{t.text}&rdquo;
                  </p>
                  <div className="flex items-center gap-3 pt-4 border-t border-white/8">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                      style={{
                        background: `linear-gradient(135deg, ${BRICK}, ${BRICK_LIGHT})`,
                      }}
                    >
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-white text-sm flex items-center gap-1.5">
                        {t.name}
                        <CheckCircle
                          size={14}
                          weight="fill"
                          className="text-green-400"
                        />
                      </div>
                      <div className="flex gap-0.5 mt-0.5">
                        {[...Array(t.rating)].map((_, j) => (
                          <Star
                            key={j}
                            size={12}
                            weight="fill"
                            className="text-yellow-400"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ═══════════════════ SECTION 11 — ROOF AGE QUIZ ═══════════════════ */}
      <SectionReveal
        className="relative z-10 py-20 md:py-28"
        style={{
          background:
            "linear-gradient(180deg, rgba(17,24,39,1) 0%, rgba(20,20,30,1) 100%)",
        }}
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <SectionHeader
            label="Quick Assessment"
            title="How Old Is Your Roof?"
            subtitle="Select your roof's age to see our recommendation for your situation."
          />
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            {QUIZ_OPTIONS.map((option, i) => (
              <button
                key={option.label}
                onClick={() => setQuizAnswer(i)}
                className={`p-6 rounded-2xl border-2 text-center cursor-pointer transition-all duration-300 ${
                  quizAnswer === i
                    ? "scale-[1.03]"
                    : "hover:scale-[1.02]"
                }`}
                style={{
                  borderColor:
                    quizAnswer === i
                      ? option.color
                      : "rgba(255,255,255,0.1)",
                  background:
                    quizAnswer === i
                      ? `${option.color}15`
                      : "rgba(255,255,255,0.06)",
                }}
              >
                <div
                  className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center font-bold text-white text-sm"
                  style={{ background: option.color }}
                >
                  {option.shortLabel}
                </div>
                <span className="font-semibold text-white text-sm block">
                  {option.label}
                </span>
                <span
                  className="text-xs mt-1 block"
                  style={{
                    color:
                      quizAnswer === i ? option.color : "transparent",
                  }}
                >
                  Selected
                </span>
              </button>
            ))}
          </div>

          <AnimatePresence>
            {quizAnswer !== null && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={spring}
              >
                <GlassCard className="p-6 text-left">
                  <div className="flex items-start gap-4">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                      style={{
                        background: QUIZ_OPTIONS[quizAnswer].color,
                      }}
                    >
                      <Eye
                        size={20}
                        weight="fill"
                        className="text-white"
                      />
                    </div>
                    <div>
                      <h4 className="font-bold text-white mb-2">
                        Our Recommendation
                      </h4>
                      <p className="text-slate-300 leading-relaxed mb-4">
                        {QUIZ_OPTIONS[quizAnswer].recommendation}
                      </p>
                      <MagneticButton
                        className="px-6 py-3 rounded-xl text-white font-bold cursor-pointer flex items-center gap-2"
                        style={{ background: BRICK }}
                        onClick={() => scrollTo("contact")}
                      >
                        Schedule Free Inspection
                        <ArrowRight size={16} weight="bold" />
                      </MagneticButton>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </SectionReveal>

      {/* ═══════════════════ SECTION 12 — COMPETITOR COMPARISON ═══════════════════ */}
      <SectionReveal className="relative z-10 py-20 md:py-28">
        <RooflinePattern />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            label="The Difference"
            title="Summit vs Average Roofers"
            subtitle="See why homeowners across Seattle choose Summit Roofing NW over the competition."
          />
          <GlassCard className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/15">
                    <th className="px-6 py-4 text-sm font-semibold text-slate-400">
                      Feature
                    </th>
                    <th
                      className="px-6 py-4 text-sm font-bold text-center"
                      style={{ color: BRICK }}
                    >
                      Summit Roofing NW
                    </th>
                    <th className="px-6 py-4 text-sm font-semibold text-slate-500 text-center">
                      Average Roofer
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_ROWS.map((row, i) => (
                    <tr
                      key={row.feature}
                      className={
                        i < COMPARISON_ROWS.length - 1
                          ? "border-b border-white/8"
                          : ""
                      }
                    >
                      <td className="px-6 py-4 text-sm text-slate-300">
                        {row.feature}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <CheckCircle
                          size={22}
                          weight="fill"
                          className="text-green-400 mx-auto"
                        />
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-slate-500">
                        {row.them}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      </SectionReveal>

      {/* ═══════════════════ SECTION 13 — VIDEO PLACEHOLDER ═══════════════════ */}
      <SectionReveal
        className="relative z-10 py-20 md:py-28"
        style={{
          background:
            "linear-gradient(180deg, rgba(17,24,39,1) 0%, rgba(30,30,30,1) 100%)",
        }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <SectionHeader
            label="See Us Work"
            title="Watch Our Crew in Action"
            subtitle="Full project walkthrough — from tear-off to final inspection."
          />
          <GlassCard className="aspect-video relative overflow-hidden group cursor-pointer">
            <div className="absolute inset-0 flex items-center justify-center">
              <img src="https://images.unsplash.com/photo-1755168648692-ef8937b7e63e?w=1200&q=80" alt="Summit Roofing NW shingle installation in progress" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
              <motion.div
                className="w-20 h-20 rounded-full flex items-center justify-center relative z-10"
                style={{
                  background: BRICK,
                  boxShadow: `0 0 40px ${BRICK}44`,
                }}
                whileHover={{ scale: 1.1 }}
                transition={spring}
              >
                <Play
                  size={36}
                  weight="fill"
                  className="text-white ml-1"
                />
              </motion.div>
            </div>
            <div className="absolute bottom-6 left-6 right-6 text-center">
              <span className="text-sm text-slate-400">
                Coming soon — full project documentary
              </span>
            </div>
          </GlassCard>
        </div>
      </SectionReveal>

      {/* ═══════════════════ SECTION 14 — SERVICE AREAS ═══════════════════ */}
      <SectionReveal className="relative z-10 py-20 md:py-28">
        <RooflinePattern />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            label="Coverage Area"
            title="Serving Greater Seattle"
            subtitle="Fast response times across the entire Puget Sound region."
          />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {SERVICE_AREAS.map((city) => (
              <GlassCard
                key={city}
                className="p-4 text-center hover:border-red-500/20 transition-colors"
              >
                <MapPin
                  size={18}
                  weight="fill"
                  className="mx-auto mb-2"
                  style={{ color: BRICK }}
                />
                <span className="text-sm font-semibold text-white">
                  {city}
                </span>
              </GlassCard>
            ))}
          </div>

          {/* Availability indicator */}
          <div className="text-center mt-10">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/15 bg-white/[0.08]">
              <motion.div
                className="w-2.5 h-2.5 rounded-full bg-green-400"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [1, 0.6, 1],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="text-sm text-slate-300 font-medium">
                Crews Available Now — Under 2hr Response Time
              </span>
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* ═══════════════════ SECTION 15 — CONTACT ═══════════════════ */}
      <SectionReveal
        id="contact"
        className="relative z-10 py-20 md:py-28"
        style={{
          background:
            "linear-gradient(180deg, rgba(17,24,39,1) 0%, rgba(10,10,20,1) 100%)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            label="Get in Touch"
            title="Request Your Free Estimate"
            subtitle="Fill out the form and we'll get back to you within 2 hours during business hours."
          />

          <div className="grid lg:grid-cols-2 gap-10 max-w-5xl mx-auto">
            {/* Contact Form */}
            <GlassCard className="p-6 md:p-8">
              <form
                onSubmit={(e) => e.preventDefault()}
                className="space-y-5"
              >
                <div>
                  <label className="text-sm font-semibold text-slate-300 mb-1.5 block">
                    Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="Your name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.08] border border-white/15 text-white placeholder:text-slate-600 focus:outline-none focus:border-red-500/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-300 mb-1.5 block">
                    Phone
                  </label>
                  <input
                    type="tel"
                    placeholder="(206) 555-0000"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        phone: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.08] border border-white/15 text-white placeholder:text-slate-600 focus:outline-none focus:border-red-500/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-300 mb-1.5 block">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="you@email.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        email: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.08] border border-white/15 text-white placeholder:text-slate-600 focus:outline-none focus:border-red-500/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-300 mb-1.5 block">
                    Tell Us About Your Roof
                  </label>
                  <textarea
                    placeholder="Describe the issue, your roof's age, or what service you need..."
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        message: e.target.value,
                      })
                    }
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.08] border border-white/15 text-white placeholder:text-slate-600 focus:outline-none focus:border-red-500/50 transition-colors resize-none"
                  />
                </div>
                <MagneticButton
                  className="w-full py-4 rounded-xl text-white font-bold text-base cursor-pointer flex items-center justify-center gap-2"
                  style={{ background: BRICK }}
                >
                  Request Free Estimate
                  <ArrowRight size={18} weight="bold" />
                </MagneticButton>
              </form>
            </GlassCard>

            {/* Info + Emergency CTA */}
            <div className="space-y-6">
              {/* Office info card */}
              <GlassCard className="p-6">
                <h3 className="text-lg font-bold text-white mb-5">
                  Office Information
                </h3>
                <div className="space-y-4">
                  <a
                    href="tel:2065550734"
                    className="flex items-center gap-3 text-slate-300 hover:text-white transition-colors"
                  >
                    <Phone
                      size={20}
                      weight="fill"
                      style={{ color: BRICK }}
                    />
                    <span>(206) 555-0734</span>
                  </a>
                  <a
                    href="mailto:info@summitrooofingnw.com"
                    className="flex items-center gap-3 text-slate-300 hover:text-white transition-colors"
                  >
                    <Envelope
                      size={20}
                      weight="fill"
                      style={{ color: BRICK }}
                    />
                    <span>info@summitrooofingnw.com</span>
                  </a>
                  <a
                    href="https://maps.google.com/?q=7340+35th+Ave+NE+Seattle+WA+98115"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-slate-300 hover:text-white transition-colors"
                  >
                    <MapPin
                      size={20}
                      weight="fill"
                      style={{ color: BRICK }}
                    />
                    <span>7340 35th Ave NE, Seattle, WA 98115</span>
                  </a>
                  <div className="flex items-center gap-3 text-slate-300">
                    <Clock
                      size={20}
                      weight="fill"
                      style={{ color: BRICK }}
                    />
                    <span>
                      Mon-Sat 7am-6pm | Emergency 24/7
                    </span>
                  </div>
                </div>
              </GlassCard>

              {/* Emergency CTA */}
              <ShimmerBorder>
                <div className="p-6 text-center">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <motion.div
                      className="w-3 h-3 rounded-full"
                      style={{ background: BRICK }}
                      animate={{
                        scale: [1, 1.4, 1],
                        opacity: [1, 0.5, 1],
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                      }}
                    />
                    <span
                      className="text-xs font-semibold uppercase tracking-widest"
                      style={{ color: BRICK }}
                    >
                      Storm Emergency?
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-white mb-2">
                    Skip the Form
                  </h3>
                  <p className="text-sm text-slate-400 mb-4">
                    Active leak or storm damage? Call now for immediate
                    same-day response from our emergency crew.
                  </p>
                  <a
                    href="tel:2065550734"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold cursor-pointer"
                    style={{ background: BRICK }}
                  >
                    <Phone size={20} weight="fill" />
                    Call (206) 555-0734 Now
                  </a>
                </div>
              </ShimmerBorder>

              {/* License badge */}
              <GlassCard className="p-5">
                <div className="flex items-center gap-3">
                  <ShieldCheck
                    size={20}
                    weight="fill"
                    style={{ color: GOLD }}
                  />
                  <span className="text-sm text-slate-300">
                    Licensed, Bonded &amp; Insured — WA #SUMMITN897RZ
                  </span>
                </div>
              </GlassCard>
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* ═══════════════════ SECTION 16 — FOOTER ═══════════════════ */}
      <footer
        className="relative z-10 py-12 border-t border-white/8"
        style={{ background: CHARCOAL_DEEP }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
            {/* Brand column */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: BRICK }}
                >
                  <House
                    size={18}
                    weight="fill"
                    className="text-white"
                  />
                </div>
                <span className="text-lg font-bold">
                  Summit Roofing NW
                </span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">
                Seattle&apos;s trusted roofing contractor for 25 years.
                GAF Master Elite Certified. Every roof built to last.
              </p>
            </div>

            {/* Services column */}
            <div>
              <h4 className="font-semibold text-white mb-3 text-sm">
                Services
              </h4>
              <ul className="space-y-2 text-sm text-slate-500">
                {SERVICES.map((s) => (
                  <li key={s.title}>{s.title}</li>
                ))}
              </ul>
            </div>

            {/* Contact column */}
            <div>
              <h4 className="font-semibold text-white mb-3 text-sm">
                Contact
              </h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li>
                  <a href="tel:2065550734" className="hover:text-slate-300 transition-colors">
                    (206) 555-0734
                  </a>
                </li>
                <li>
                  <a href="mailto:info@summitrooofingnw.com" className="hover:text-slate-300 transition-colors">
                    info@summitrooofingnw.com
                  </a>
                </li>
                <li>7340 35th Ave NE</li>
                <li>Seattle, WA 98115</li>
              </ul>
            </div>

            {/* Certifications column */}
            <div>
              <h4 className="font-semibold text-white mb-3 text-sm">
                Certifications
              </h4>
              <div className="flex flex-wrap gap-2">
                {[
                  "GAF Master Elite",
                  "A+ BBB",
                  "Licensed & Bonded",
                  "50-Year Warranty",
                  "WA #SUMMITN897RZ",
                ].map((cert) => (
                  <span
                    key={cert}
                    className="px-2 py-1 rounded-md text-xs border border-white/15 bg-white/[0.08] text-slate-400"
                  >
                    {cert}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="pt-6 border-t border-white/8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-600">
              WA License #SUMMITN897RZ | GAF Master Elite Contractor
            </p>
            <p className="text-xs text-slate-600 flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-sky-500"><path d="M24.3 4.2c-1.5-.4-3.2.1-4.5 1.1-1-.7-2.3-1-3.5-.8-2.4.4-4.2 2.5-4.2 4.9v.6c-3.2.8-6 2.8-7.8 5.6-.3.5-.1 1.1.4 1.4.5.3 1.1.1 1.4-.4 1.5-2.3 3.7-4 6.3-4.7.5-.1 1-.1 1.5 0 .8.2 1.4.8 1.7 1.5.3.8.2 1.6-.2 2.3l-2.8 4.3c-.6.9-.4 2.1.4 2.8l2.5 2.1c.4.3.8.5 1.3.5h5.2c.5 0 1-.2 1.3-.5l1.2-1c.6-.5.8-1.3.6-2l-1-3.2c-.2-.5 0-1.1.4-1.4l3.8-2.5c1.3-.9 2.1-2.3 2.1-3.9V9.6c0-2.5-1.7-4.7-4.1-5.3v-.1z" fill="currentColor"/></svg>Built by{" "}
              <a
                href="https://bluejayportfolio.com/audit"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-slate-400 transition-colors underline"
              >BlueJays</a>{" "}— get your free site audit
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
