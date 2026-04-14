"use client";

/* eslint-disable @next/next/no-img-element -- These static marketing and preview components intentionally use plain img tags to preserve existing markup and visual behavior during lint-only cleanup. */
/* eslint-disable react-hooks/purity -- Decorative particle values are intentionally randomized for static visual effects in these marketing pages and previews; this preserves existing appearance without changing business logic. */

import { useState, useRef, useCallback } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  AnimatePresence,
} from "framer-motion";
import {
  Garage,
  GearSix,
  Wrench,
  Clock,
  Phone,
  MapPin,
  CaretDown,
  List,
  X,
  Star,
  ArrowRight,
  CheckCircle,
  ShieldCheck,
  HouseLine,
  Buildings,
  Warning,
  Play,
  NavigationArrow,
  CalendarCheck,
  Toolbox,
  Circuitry,
  Lightning,
} from "@phosphor-icons/react";
import type { GeneratedSiteData } from "@/lib/generator";
import BluejayLogo from "../BluejayLogo";
import { MapLink, PhoneLink } from "@/components/templates/MapLink";
import ClaimBanner from "@/components/ClaimBanner";
import { pickFromPool, pickGallery } from "@/lib/stock-image-picker";

const spring = { type: "spring" as const, stiffness: 100, damping: 20 };
const springFast = { type: "spring" as const, stiffness: 200, damping: 25 };

const CHARCOAL = "#1a1a1a";
const DEFAULT_AMBER = "#d97706";
const AMBER_LIGHT = "#fbbf24";
const STEEL_ACCENT = "#6b7280";

function getAccent(accentColor?: string) {
  const c = accentColor || DEFAULT_AMBER;
  return {
    ACCENT: c,
    ACCENT_GLOW: `${c}26`,
    ACCENT_LIGHT: AMBER_LIGHT,
    STEEL: STEEL_ACCENT,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SERVICE_ICON_MAP: Record<string, any> = {
  install: Wrench,
  repair: Wrench,
  spring: GearSix,
  opener: GearSix,
  maintain: GearSix,
  commercial: Buildings,
  residential: HouseLine,
  emergency: Warning,
  gate: Garage,
  panel: Garage,
  custom: Garage,
  insulate: HouseLine,
  replace: Wrench,
  cable: Circuitry,
  track: GearSix,
};

function getServiceIcon(n: string) {
  const l = n.toLowerCase();
  for (const [k, I] of Object.entries(SERVICE_ICON_MAP)) {
    if (l.includes(k)) return I;
  }
  return Garage;
}

const STOCK_HERO_POOL = [
  "https://images.unsplash.com/photo-1558036117-15d82a90b9b1?w=1400&q=80",
];
const STOCK_ABOUT_POOL = [
  "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600&q=80",
];
const STOCK_GALLERY = [
  "https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=600&q=80",
  "https://images.unsplash.com/photo-1558036117-15d82a90b9b1?w=600&q=80",
  "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600&q=80",
  "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600&q=80",
];

/* ── decorative backgrounds ── */

function FloatingParticles({ accent }: { accent: string }) {
  const particles = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 8,
    duration: 5 + Math.random() * 7,
    size: 2 + Math.random() * 3,
    opacity: 0.12 + Math.random() * 0.25,
    isSteel: Math.random() > 0.6,
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
            background: p.isSteel ? STEEL_ACCENT : accent,
            willChange: "transform, opacity",
          }}
          animate={{
            y: ["-10vh", "110vh"],
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

function IndustrialGrid({
  opacity = 0.03,
  accent,
}: {
  opacity?: number;
  accent: string;
}) {
  const patternId = `industrialV2-${accent.replace("#", "")}`;
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity }}
    >
      <defs>
        <pattern
          id={patternId}
          width="60"
          height="60"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M0 0h60v60H0z"
            fill="none"
            stroke={accent}
            strokeWidth="0.3"
            opacity="0.3"
          />
          <circle cx="30" cy="30" r="2" fill={accent} opacity="0.15" />
          <path
            d="M15 0v60M45 0v60M0 15h60M0 45h60"
            fill="none"
            stroke={accent}
            strokeWidth="0.15"
            opacity="0.15"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  );
}

function GearTrail({
  opacity = 0.03,
  accent,
}: {
  opacity?: number;
  accent: string;
}) {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity }}
      viewBox="0 0 1000 600"
      preserveAspectRatio="none"
    >
      <motion.circle
        cx="200"
        cy="300"
        r="40"
        fill="none"
        stroke={accent}
        strokeWidth="1.5"
        initial={{ rotate: 0 }}
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      />
      <motion.circle
        cx="800"
        cy="200"
        r="30"
        fill="none"
        stroke={STEEL_ACCENT}
        strokeWidth="1"
        initial={{ rotate: 0 }}
        animate={{ rotate: -360 }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      />
    </svg>
  );
}

/* ── shared UI components ── */

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

function MagneticButton({
  children,
  className = "",
  onClick,
  style,
  href,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
  href?: string;
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
      x.set((e.clientX - (rect.left + rect.width / 2)) * 0.25);
      y.set((e.clientY - (rect.top + rect.height / 2)) * 0.25);
    },
    [x, y, isTouchDevice]
  );
  const handleMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);
  if (href)
    return (
      <motion.a
        href={href}
        ref={ref as unknown as React.Ref<HTMLAnchorElement>}
        style={{ x: springX, y: springY, willChange: "transform", ...style }}
        onMouseMove={
          handleMouseMove as unknown as React.MouseEventHandler<HTMLAnchorElement>
        }
        onMouseLeave={handleMouseLeave}
        className={className}
        whileTap={{ scale: 0.97 }}
      >
        {children}
      </motion.a>
    );
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

function ShimmerBorder({
  children,
  className = "",
  accent,
}: {
  children: React.ReactNode;
  className?: string;
  accent: string;
}) {
  return (
    <div
      className={`relative rounded-2xl p-[1px] overflow-hidden ${className}`}
    >
      <motion.div
        className="absolute inset-0 rounded-2xl"
        style={{
          background: `conic-gradient(from 0deg, transparent, ${accent}, transparent, ${STEEL_ACCENT}, transparent)`,
          willChange: "transform",
        }}
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      />
      <div className="relative rounded-2xl bg-[#141414] z-10">{children}</div>
    </div>
  );
}

function AccordionItem({
  question,
  answer,
  isOpen,
  onToggle,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <GlassCard className="overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-5 md:p-6 text-left group cursor-pointer"
      >
        <span className="text-lg font-semibold text-white pr-4">
          {question}
        </span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={spring}>
          <CaretDown size={20} className="text-slate-400 shrink-0" />
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
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
}

function SectionHeader({
  badge,
  title,
  subtitle,
  accent,
}: {
  badge: string;
  title: string;
  subtitle?: string;
  accent: string;
}) {
  return (
    <div className="text-center mb-16">
      <span
        className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border"
        style={{
          color: accent,
          borderColor: `${accent}33`,
          background: `${accent}0d`,
        }}
      >
        {badge}
      </span>
      <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white">
        {title}
      </h2>
      <div
        className="h-0.5 w-16 mx-auto mt-4"
        style={{
          background: `linear-gradient(to right, ${accent}, transparent)`,
        }}
      />
      {subtitle && (
        <p className="text-slate-400 mt-4 max-w-2xl text-lg leading-relaxed mx-auto">
          {subtitle}
        </p>
      )}
    </div>
  );
}

/* ── constants ── */

const DOOR_STYLES = [
  {
    title: "Traditional Raised Panel",
    desc: "Classic look with clean lines, available in steel, wood, and composite",
    material: "Steel / Wood",
  },
  {
    title: "Carriage House",
    desc: "Swing-out style charm with modern overhead convenience",
    material: "Composite / Wood",
  },
  {
    title: "Contemporary / Flush",
    desc: "Sleek, minimalist design with aluminum and glass options",
    material: "Aluminum / Glass",
  },
  {
    title: "Insulated Premium",
    desc: "Maximum energy efficiency with polyurethane core insulation",
    material: "Steel / Insulated",
  },
];

const MATERIAL_COMPARISON = [
  {
    material: "Steel",
    durability: "High",
    insulation: "Good (with foam)",
    maintenance: "Low",
    price: "$$",
  },
  {
    material: "Wood",
    durability: "Medium",
    insulation: "Excellent",
    maintenance: "High",
    price: "$$$",
  },
  {
    material: "Aluminum",
    durability: "High",
    insulation: "Fair",
    maintenance: "Low",
    price: "$$",
  },
  {
    material: "Composite",
    durability: "Very High",
    insulation: "Good",
    maintenance: "Very Low",
    price: "$$$",
  },
];

const REPAIR_TYPES = [
  {
    icon: GearSix,
    title: "Spring Replacement",
    desc: "Torsion and extension spring repairs with same-day service",
    urgent: true,
  },
  {
    icon: Circuitry,
    title: "Opener Repair",
    desc: "Belt, chain, and screw-drive opener diagnostics and repair",
    urgent: false,
  },
  {
    icon: Wrench,
    title: "Cable & Track Repair",
    desc: "Realignment, cable replacement, and track straightening",
    urgent: true,
  },
  {
    icon: Garage,
    title: "Panel Replacement",
    desc: "Individual panel swaps without replacing the entire door",
    urgent: false,
  },
  {
    icon: Lightning,
    title: "Sensor & Safety",
    desc: "Photo-eye sensors, auto-reverse testing, and safety upgrades",
    urgent: false,
  },
  {
    icon: Toolbox,
    title: "Preventive Maintenance",
    desc: "Annual tune-ups to extend door life and prevent breakdowns",
    urgent: false,
  },
];

const WARRANTY_TIERS = [
  {
    title: "Parts Warranty",
    duration: "1-5 Years",
    desc: "All replacement parts covered against defects",
  },
  {
    title: "Labor Warranty",
    duration: "90 Days",
    desc: "Full labor guarantee on every repair and installation",
  },
  {
    title: "Door Warranty",
    duration: "Lifetime",
    desc: "Manufacturer lifetime warranty on select premium doors",
  },
];

const COMPARISON_ROWS = [
  { feature: "Same-Day Emergency Service", us: true, them: "No" },
  { feature: "Upfront Flat-Rate Pricing", us: true, them: "Hourly" },
  { feature: "Licensed & Insured Technicians", us: true, them: "Varies" },
  { feature: "All Major Door Brands", us: true, them: "Limited" },
  { feature: "Lifetime Warranty on Doors", us: true, them: "1 Year" },
  { feature: "Free Safety Inspection", us: true, them: "Extra Cost" },
  { feature: "Weekend & Holiday Availability", us: true, them: "No" },
];

const PRICING_TIERS = [
  {
    title: "Spring Repair",
    price: "$149",
    subtitle: "starting at",
    features: [
      "Same-day service",
      "Torsion or extension springs",
      "Safety inspection included",
      "90-day labor warranty",
    ],
  },
  {
    title: "Opener Install",
    price: "$349",
    subtitle: "starting at",
    popular: true,
    features: [
      "Belt or chain drive",
      "Smart home compatible",
      "Battery backup option",
      "Old opener removal",
      "Full safety testing",
    ],
  },
  {
    title: "New Door Install",
    price: "$799",
    subtitle: "starting at",
    features: [
      "Wide style selection",
      "Insulated options available",
      "Old door haul-away",
      "Hardware included",
      "Lifetime door warranty",
      "Free design consultation",
    ],
  },
];

/* ── main component ── */

export default function V2GarageDoorPreview({
  data,
}: {
  data: GeneratedSiteData;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const { ACCENT, ACCENT_GLOW } = getAccent(data.accentColor);
  const uniquePhotos = data.photos ? [...new Set(data.photos)] : [];
  const heroImage =
    uniquePhotos[0] || pickFromPool(STOCK_HERO_POOL, data.businessName);
  const heroCardImage =
    uniquePhotos[1] || pickFromPool(STOCK_ABOUT_POOL, data.businessName);
  const aboutImage =
    uniquePhotos[2] || pickFromPool(STOCK_ABOUT_POOL, data.businessName);
  const galleryImages =
    data.photos?.length > 2
      ? data.photos.slice(2, 6)
      : pickGallery(STOCK_GALLERY, data.businessName);
  const phoneDigits = data.phone.replace(/\D/g, "");

  const processSteps = [
    {
      step: "01",
      title: "Call or Book Online",
      desc: "Describe your garage door issue and we'll schedule a convenient time.",
    },
    {
      step: "02",
      title: "Free Inspection",
      desc: "Our technician diagnoses the problem and provides an upfront quote.",
    },
    {
      step: "03",
      title: "Expert Repair",
      desc: "We fix it right the first time using premium parts and proven techniques.",
    },
    {
      step: "04",
      title: "Safety Check",
      desc: "Full safety and balance test before we leave, guaranteed to work perfectly.",
    },
  ];

  const faqs = [
    {
      q: "How long does a garage door spring replacement take?",
      a: `Most spring replacements take 45-90 minutes. ${data.businessName} carries common spring sizes on our trucks so we can complete most repairs in a single visit.`,
    },
    {
      q: "Should I replace one or both springs?",
      a: "We always recommend replacing both springs at the same time. They wear at the same rate, and replacing both prevents a second failure shortly after the first.",
    },
    {
      q: "How do I know if my garage door opener needs replacing?",
      a: "Signs include excessive noise, slow response, intermittent operation, or the opener being 15+ years old. We can diagnose whether a repair or replacement makes more sense.",
    },
    {
      q: `Does ${data.businessName} offer emergency service?`,
      a: "Yes! We provide same-day emergency service for broken springs, stuck doors, and off-track situations. Call us and we'll dispatch a technician as quickly as possible.",
    },
    {
      q: "What brands of garage doors do you install?",
      a: "We install all major brands including Clopay, Amarr, Wayne Dalton, CHI, and more. During your free consultation, we'll help you choose the best option for your home and budget.",
    },
  ];

  const fallbackTestimonials = [
    {
      name: "Robert K.",
      text: "Spring broke at 6 AM and they had it fixed by noon. Professional, fast, and fair pricing. Highly recommend!",
      rating: 5,
    },
    {
      name: "Jennifer M.",
      text: "Beautiful new carriage house door installed. Completely transformed our home's curb appeal. The team was outstanding.",
      rating: 5,
    },
    {
      name: "David L.",
      text: "Best garage door company in the area. Honest pricing, no upsells, and they stand behind their warranty. Five stars.",
      rating: 5,
    },
  ];

  const testimonials =
    data.testimonials?.length > 0 ? data.testimonials : fallbackTestimonials;

  const quizOptions = [
    {
      label: "Door Won't Open/Close",
      emoji: "🚨",
      color: "#ef4444",
      result:
        "This could be a spring, cable, or track issue. Call us for same-day emergency repair!",
    },
    {
      label: "Noisy or Slow Door",
      emoji: "🔧",
      color: "#f59e0b",
      result:
        "Likely needs lubrication, roller replacement, or opener adjustment. Schedule a tune-up!",
    },
    {
      label: "Want a New Door",
      emoji: "🏠",
      color: "#22c55e",
      result:
        "Great choice! A new door boosts curb appeal and home value. Book a free design consultation!",
    },
  ];

  return (
    <main
      className="relative min-h-[100dvh] overflow-x-hidden"
      style={{ background: CHARCOAL, color: "#f1f5f9" }}
    >
      <FloatingParticles accent={ACCENT} />

      {/* ── NAV ── */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-4">
          <GlassCard className="flex items-center justify-between px-4 md:px-6 py-3">
            <div className="flex items-center gap-2">
              <Garage size={24} weight="fill" style={{ color: ACCENT }} />
              <span className="text-lg font-bold tracking-tight text-white">
                {data.businessName}
              </span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
              <a href="#services" className="hover:text-white transition-colors">Services</a>
              <a href="#doors" className="hover:text-white transition-colors">Door Styles</a>
              <a href="#about" className="hover:text-white transition-colors">About</a>
              <a href="#contact" className="hover:text-white transition-colors">Contact</a>
            </div>
            <div className="flex items-center gap-3">
              <MagneticButton
                className="px-4 md:px-5 py-2 rounded-full text-sm font-semibold text-white transition-colors cursor-pointer"
                style={{ background: ACCENT } as React.CSSProperties}
              >
                Free Estimate
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
                    { label: "Door Styles", href: "#doors" },
                    { label: "About", href: "#about" },
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
      </nav>

      {/* ── 1. HERO ── */}
      <section className="relative min-h-[100dvh] flex items-center pt-24 z-10 overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImage} alt={data.businessName} className="w-full h-full object-cover object-center" />
          <div className="absolute inset-0 bg-black/70" />
        </div>
        <IndustrialGrid opacity={0.04} accent={ACCENT} />
        <GearTrail opacity={0.04} accent={ACCENT} />
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full blur-[200px] pointer-events-none" style={{ background: `${ACCENT}08` }} />
        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          <div className="space-y-8">
            <div>
              <p className="text-sm uppercase tracking-widest mb-4" style={{ color: ACCENT }}>
                Garage Door Experts
              </p>
              <h1
                className="text-3xl md:text-6xl tracking-tighter leading-none font-bold text-white"
                style={{ textShadow: "0 2px 20px rgba(0,0,0,0.8), 0 4px 40px rgba(0,0,0,0.5)" }}
              >
                {data.tagline}
              </h1>
            </div>
            <p className="text-lg text-white/80 max-w-md leading-relaxed" style={{ textShadow: "0 1px 8px rgba(0,0,0,0.6)" }}>
              {(() => {
                const t = data.about;
                if (t.length <= 180) return t;
                const dot = t.indexOf(".", 80);
                return dot > 0 && dot < 220 ? t.slice(0, dot + 1) : t.slice(0, 180).trim() + "...";
              })()}
            </p>
            <div className="flex flex-wrap gap-4">
              <MagneticButton
                className="px-8 py-4 rounded-full text-base font-semibold text-white flex items-center gap-2 cursor-pointer"
                style={{ background: ACCENT } as React.CSSProperties}
              >
                Get Free Estimate <ArrowRight size={18} weight="bold" />
              </MagneticButton>
              <MagneticButton
                href={`tel:${phoneDigits}`}
                className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/10 flex items-center gap-2 cursor-pointer"
              >
                <Phone size={18} weight="duotone" /> <PhoneLink phone={data.phone} />
              </MagneticButton>
            </div>
            {/* Trust badges */}
            <div className="flex flex-wrap gap-3">
              {[
                "Licensed & Insured",
                data.googleRating ? `${data.googleRating}-Star Rated` : "5-Star Rated",
                "Same-Day Service",
              ].map((badge) => (
                <span
                  key={badge}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border backdrop-blur-md"
                  style={{ color: ACCENT, borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}
                >
                  <CheckCircle size={14} weight="fill" /> {badge}
                </span>
              ))}
            </div>
          </div>
          <div className="hidden md:block relative">
            <div className="relative rounded-2xl overflow-hidden border border-white/10">
              <img src={heroCardImage} alt={`${data.businessName} garage door`} className="w-full h-[500px] object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6">
                <div className="px-4 py-2 rounded-full backdrop-blur-md bg-black/50 border flex items-center gap-2" style={{ borderColor: `${ACCENT}4d` }}>
                  <Garage size={18} weight="fill" style={{ color: ACCENT }} />
                  <span className="text-sm font-semibold text-white">Expert Installation & Repair</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. EMERGENCY SERVICE INDICATOR ── */}
      <section className="relative z-10 py-6 overflow-hidden border-y" style={{ borderColor: `${ACCENT}1a` }}>
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #120e08 0%, #1a1a1a 100%)" }} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-4 h-4 rounded-full animate-ping absolute" style={{ background: "#ef444480" }} />
                <div className="w-4 h-4 rounded-full relative" style={{ background: "#ef4444" }} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Emergency Garage Door Repair</h3>
                <p className="text-sm text-slate-400">Broken spring? Door off track? We offer same-day emergency service.</p>
              </div>
            </div>
            <MagneticButton
              href={`tel:${phoneDigits}`}
              className="px-6 py-3 rounded-full text-sm font-semibold text-white cursor-pointer whitespace-nowrap flex items-center gap-2"
              style={{ background: "#ef4444" } as React.CSSProperties}
            >
              <Phone size={16} weight="fill" /> Call Now
            </MagneticButton>
          </div>
        </div>
      </section>

      {/* ── 3. STATS BAR ── */}
      <section className="relative z-10 py-16 overflow-hidden border-b" style={{ borderColor: `${ACCENT}1a` }}>
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #120e08 100%)" }} />
        <IndustrialGrid opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {data.stats.map((stat, i) => {
              const statIcons = [Garage, Clock, Star, ShieldCheck];
              const Icon = statIcons[i % statIcons.length];
              return (
                <div key={stat.label} className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Icon size={22} weight="fill" style={{ color: ACCENT }} />
                    <span className="text-3xl md:text-4xl font-extrabold text-white">{stat.value}</span>
                  </div>
                  <span className="text-slate-500 text-sm font-medium tracking-wide uppercase">{stat.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 4. SERVICES (Repair Types) ── */}
      <section id="services" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0a0e18 50%, #1a1a1a 100%)" }} />
        <IndustrialGrid accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Our Services" title="Garage Door Services" subtitle={`${data.businessName} handles every type of garage door repair and installation.`} accent={ACCENT} />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.services.map((service, i) => {
              const Icon = getServiceIcon(service.name);
              return (
                <div key={service.name} className="group relative p-7 rounded-2xl border border-white/[0.06] hover:border-opacity-30 transition-all duration-500 overflow-hidden bg-white/[0.02]">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: `radial-gradient(circle at 50% 0%, ${ACCENT}15, transparent 70%)` }} />
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-5">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 border" style={{ background: ACCENT_GLOW, borderColor: `${ACCENT}33` }}>
                        <Icon size={24} weight="duotone" style={{ color: ACCENT }} />
                      </div>
                      <span className="text-xs font-mono text-slate-600">{String(i + 1).padStart(2, "0")}</span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{service.name}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{service.description || ""}</p>
                    {service.price && <p className="text-sm font-semibold mt-3" style={{ color: ACCENT }}>{service.price}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 5. SPRING & OPENER REPAIR FOCUS ── */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #120e18 50%, #1a1a1a 100%)" }} />
        <GearTrail opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Repair Specialists" title="Spring & Opener Experts" subtitle="The two most common garage door failures — and we fix both same-day." accent={ACCENT} />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {REPAIR_TYPES.map((repair) => {
              const Icon = repair.icon;
              return (
                <GlassCard key={repair.title} className="p-6 relative overflow-hidden">
                  {repair.urgent && (
                    <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                      URGENT
                    </div>
                  )}
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 border" style={{ background: ACCENT_GLOW, borderColor: `${ACCENT}33` }}>
                    <Icon size={24} weight="duotone" style={{ color: ACCENT }} />
                  </div>
                  <h3 className="text-white font-bold mb-2">{repair.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{repair.desc}</p>
                </GlassCard>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 6. DOOR STYLES GALLERY ── */}
      <section id="doors" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0a0e18 50%, #1a1a1a 100%)" }} />
        <IndustrialGrid opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Door Styles" title="Find Your Perfect Door" subtitle="From traditional to contemporary, we install every style of garage door." accent={ACCENT} />
          <div className="grid md:grid-cols-2 gap-6">
            {DOOR_STYLES.map((door) => (
              <GlassCard key={door.title} className="p-8 group hover:border-white/20 transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">{door.title}</h3>
                  <span className="px-3 py-1 rounded-full text-xs font-medium border" style={{ color: ACCENT, borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}>
                    {door.material}
                  </span>
                </div>
                <p className="text-slate-400 leading-relaxed">{door.desc}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. MATERIAL COMPARISON ── */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #120e18 50%, #1a1a1a 100%)" }} />
        <GearTrail opacity={0.02} accent={ACCENT} />
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Materials Guide" title="Door Material Comparison" subtitle="Choose the right material for your climate, budget, and style." accent={ACCENT} />
          <GlassCard className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-4 text-slate-400 font-medium">Material</th>
                    <th className="text-center p-4 text-slate-400 font-medium">Durability</th>
                    <th className="text-center p-4 text-slate-400 font-medium">Insulation</th>
                    <th className="text-center p-4 text-slate-400 font-medium">Maintenance</th>
                    <th className="text-center p-4 text-slate-400 font-medium">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {MATERIAL_COMPARISON.map((row) => (
                    <tr key={row.material} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 text-white font-semibold">{row.material}</td>
                      <td className="p-4 text-center text-slate-300">{row.durability}</td>
                      <td className="p-4 text-center text-slate-300">{row.insulation}</td>
                      <td className="p-4 text-center text-slate-300">{row.maintenance}</td>
                      <td className="p-4 text-center" style={{ color: ACCENT }}>{row.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* ── 8. ABOUT ── */}
      <section id="about" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0a0e18 50%, #1a1a1a 100%)" }} />
        <IndustrialGrid opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="relative">
              <div className="rounded-2xl overflow-hidden border border-white/10">
                <img src={aboutImage} alt={`${data.businessName} team`} className="w-full h-[400px] object-cover" />
              </div>
              <div className="absolute -bottom-4 -right-4 md:bottom-6 md:-right-6">
                <div className="px-5 py-3 rounded-xl backdrop-blur-md border text-white font-bold text-sm shadow-lg" style={{ background: `${ACCENT}e6`, borderColor: `${ACCENT}80` }}>
                  {data.stats[0] ? `${data.stats[0].value} ${data.stats[0].label}` : "Doors Installed"}
                </div>
              </div>
            </div>
            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: ACCENT, borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}>About Us</span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6 text-white">Your Garage Door Experts</h2>
              <p className="text-slate-400 leading-relaxed mb-8">{data.about}</p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: ShieldCheck, label: "Licensed & Insured" },
                  { icon: Garage, label: "All Door Types" },
                  { icon: Star, label: "Top Rated" },
                  { icon: CheckCircle, label: "Warranty Backed" },
                ].map((badge) => (
                  <GlassCard key={badge.label} className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: ACCENT_GLOW }}>
                      <badge.icon size={20} weight="duotone" style={{ color: ACCENT }} />
                    </div>
                    <span className="text-sm font-semibold text-white">{badge.label}</span>
                  </GlassCard>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 9. WARRANTY DISPLAY ── */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #120e18 50%, #1a1a1a 100%)" }} />
        <GearTrail opacity={0.02} accent={ACCENT} />
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Warranty" title="Our Warranty Coverage" subtitle="Every repair and installation is backed by our comprehensive warranty." accent={ACCENT} />
          <div className="grid md:grid-cols-3 gap-6">
            {WARRANTY_TIERS.map((w) => (
              <ShimmerBorder key={w.title} accent={ACCENT}>
                <div className="p-6 text-center">
                  <ShieldCheck size={32} weight="fill" style={{ color: ACCENT }} className="mx-auto mb-3" />
                  <h3 className="text-white font-bold text-lg mb-1">{w.title}</h3>
                  <p className="text-2xl font-black mb-3" style={{ color: ACCENT }}>{w.duration}</p>
                  <p className="text-sm text-slate-400">{w.desc}</p>
                </div>
              </ShimmerBorder>
            ))}
          </div>
        </div>
      </section>

      {/* ── 10. PRICING ── */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0a0e18 50%, #1a1a1a 100%)" }} />
        <IndustrialGrid opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Pricing" title="Transparent Pricing" subtitle="Upfront quotes with no hidden fees. What we quote is what you pay." accent={ACCENT} />
          <div className="grid md:grid-cols-3 gap-6">
            {PRICING_TIERS.map((tier) => (
              <div key={tier.title} className="relative">
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold text-white z-20" style={{ background: ACCENT }}>
                    Most Popular
                  </div>
                )}
                <GlassCard className={`p-8 h-full flex flex-col ${tier.popular ? "border-2" : ""}`} {...(tier.popular ? { style: { borderColor: `${ACCENT}4d` } } : {})}>
                  <h3 className="text-lg font-bold text-white mb-1">{tier.title}</h3>
                  <p className="text-xs text-slate-500 mb-3">{tier.subtitle}</p>
                  <p className="text-4xl font-black mb-6" style={{ color: ACCENT }}>{tier.price}</p>
                  <ul className="space-y-3 flex-1">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-slate-300">
                        <CheckCircle size={16} weight="fill" style={{ color: ACCENT }} className="shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <MagneticButton className="w-full mt-6 py-3 rounded-xl text-sm font-semibold text-white cursor-pointer text-center" style={{ background: tier.popular ? ACCENT : `${ACCENT}22`, border: tier.popular ? "none" : `1px solid ${ACCENT}33` } as React.CSSProperties}>
                    Get Quote
                  </MagneticButton>
                </GlassCard>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 11. PROCESS ── */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #120e18 50%, #1a1a1a 100%)" }} />
        <GearTrail opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Our Process" title="How It Works" accent={ACCENT} />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {processSteps.map((step, i) => (
              <div key={step.step} className="relative">
                {i < processSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-10 left-[calc(50%+40px)] w-[calc(100%-80px)] h-px" style={{ background: `linear-gradient(to right, ${ACCENT}33, ${ACCENT}11)` }} />
                )}
                <GlassCard className="p-6 text-center relative">
                  <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-black" style={{ background: `linear-gradient(135deg, ${ACCENT}22, ${ACCENT}0a)`, color: ACCENT, border: `1px solid ${ACCENT}33` }}>
                    {step.step}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
                </GlassCard>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 12. GALLERY ── */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0a0e18 50%, #1a1a1a 100%)" }} />
        <IndustrialGrid opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Our Work" title="Recent Projects" accent={ACCENT} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {galleryImages.map((src, i) => {
              const titles = ["Custom Carriage Door", "Steel Panel Replacement", "Opener Installation", "Spring Repair"];
              return (
                <div key={i} className="group relative rounded-2xl overflow-hidden border border-white/[0.06] hover:border-opacity-30 transition-all duration-500">
                  <img src={src} alt={titles[i]} className="w-full h-64 object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-lg font-bold text-white mb-1">{titles[i]}</h3>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 13. VIDEO PLACEHOLDER ── */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #120e18 50%, #1a1a1a 100%)" }} />
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <SectionHeader badge="See Our Work" title="Watch Our Team in Action" accent={ACCENT} />
          <div className="relative rounded-2xl overflow-hidden border border-white/10">
            <img src={heroImage} alt="Garage door installation" className="w-full h-[350px] object-cover" />
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full flex items-center justify-center cursor-pointer border-2" style={{ background: `${ACCENT}cc`, borderColor: ACCENT }}>
                <Play size={36} weight="fill" className="text-white ml-1" />
              </div>
            </div>
            <div className="absolute bottom-6 left-6">
              <p className="text-white font-semibold text-lg">Installation Showcase</p>
              <p className="text-white/60 text-sm">See how we transform your home&apos;s curb appeal</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 14. GOOGLE REVIEWS + TESTIMONIALS ── */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0a0e18 50%, #1a1a1a 100%)" }} />
        <IndustrialGrid opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border backdrop-blur-md" style={{ borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}>
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} size={18} weight="fill" style={{ color: ACCENT }} />
                ))}
              </div>
              <span className="text-white font-semibold text-sm">{data.googleRating || "5.0"} Rating</span>
              {data.reviewCount && <span className="text-slate-400 text-sm">({data.reviewCount}+ reviews)</span>}
            </div>
          </div>
          <SectionHeader badge="Reviews" title="What Our Customers Say" accent={ACCENT} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <GlassCard key={i} className="p-6 h-full flex flex-col">
                <div className="text-4xl mb-4" style={{ color: `${ACCENT}33` }}>&ldquo;</div>
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.rating || 5 }).map((_, j) => (
                    <Star key={j} size={16} weight="fill" style={{ color: ACCENT }} />
                  ))}
                </div>
                <p className="text-slate-300 leading-relaxed flex-1 text-sm mb-4">{t.text}</p>
                <div className="pt-4 border-t border-white/5 flex items-center gap-2">
                  <CheckCircle size={14} weight="fill" style={{ color: ACCENT }} />
                  <span className="text-sm font-semibold text-white">{t.name}</span>
                  <span className="text-xs text-slate-500">Verified Customer</span>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* ── 15. COMPETITOR COMPARISON ── */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #120e18 50%, #1a1a1a 100%)" }} />
        <GearTrail opacity={0.02} accent={ACCENT} />
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Why Us" title={`${data.businessName} vs. The Competition`} accent={ACCENT} />
          <GlassCard className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-4 text-slate-400 font-medium">Feature</th>
                    <th className="text-center p-4 font-bold" style={{ color: ACCENT }}>{data.businessName}</th>
                    <th className="text-center p-4 text-slate-500 font-medium">Others</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_ROWS.map((row) => (
                    <tr key={row.feature} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 text-slate-300">{row.feature}</td>
                      <td className="p-4 text-center"><CheckCircle size={20} weight="fill" className="mx-auto" style={{ color: "#22c55e" }} /></td>
                      <td className="p-4 text-center text-slate-500 text-xs">{row.them}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* ── 16. GARAGE DOOR QUIZ ── */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0a0e18 50%, #1a1a1a 100%)" }} />
        <IndustrialGrid opacity={0.02} accent={ACCENT} />
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Diagnose" title="What Does Your Garage Door Need?" accent={ACCENT} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {quizOptions.map((opt, i) => (
              <button
                key={opt.label}
                onClick={() => setQuizAnswer(i)}
                className={`p-6 rounded-2xl border text-left transition-all duration-300 cursor-pointer ${quizAnswer === i ? "border-opacity-100 bg-white/[0.06]" : "border-white/10 bg-white/[0.02] hover:bg-white/[0.04]"}`}
                style={quizAnswer === i ? { borderColor: opt.color } : undefined}
              >
                <span className="text-2xl mb-3 block">{opt.emoji}</span>
                <h3 className="text-white font-semibold text-sm">{opt.label}</h3>
              </button>
            ))}
          </div>
          <AnimatePresence>
            {quizAnswer !== null && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}>
                <ShimmerBorder accent={quizOptions[quizAnswer].color}>
                  <div className="p-6 text-center">
                    <p className="text-white text-lg mb-4">{quizOptions[quizAnswer].result}</p>
                    <MagneticButton
                      href={`tel:${phoneDigits}`}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white cursor-pointer"
                      style={{ background: ACCENT } as React.CSSProperties}
                    >
                      <Phone size={16} weight="fill" /> Call for Service
                    </MagneticButton>
                  </div>
                </ShimmerBorder>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ── 17. CERTIFICATIONS ── */}
      <section className="relative z-10 py-16 overflow-hidden border-y" style={{ borderColor: `${ACCENT}1a` }}>
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #120e08 0%, #1a1a1a 100%)" }} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="flex flex-wrap justify-center gap-4">
            {["Licensed & Insured", "BBB Accredited", "Clopay Dealer", "LiftMaster Pro", "Background Checked", "Manufacturer Certified"].map((badge) => (
              <span key={badge} className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium border" style={{ color: ACCENT, borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}>
                <ShieldCheck size={14} weight="fill" /> {badge}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── 18. MID-PAGE CTA ── */}
      <section className="relative z-10 py-20 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT}cc, ${ACCENT})` }} />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='40' height='40' fill='none'/%3E%3Cpath d='M0 0L40 40M40 0L0 40' stroke='%23000' stroke-width='0.5'/%3E%3C/svg%3E\")" }} />
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <Garage size={48} weight="fill" className="mx-auto mb-6 text-white/70" />
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-4">Need a Garage Door Expert?</h2>
          <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">From emergency repairs to beautiful new installations, we&apos;ve got you covered.</p>
          <PhoneLink phone={data.phone} className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-white text-black font-bold text-lg hover:bg-white/90 transition-colors">
            <Phone size={22} weight="fill" /> Call {data.phone}
          </PhoneLink>
        </div>
      </section>

      {/* ── 19. SERVICE AREA ── */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #120e18 50%, #1a1a1a 100%)" }} />
        <IndustrialGrid opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Service Area" title="Areas We Serve" accent={ACCENT} />
          <div className="flex flex-col items-center gap-6">
            <GlassCard className="p-8 inline-block">
              <div className="flex items-center gap-3 text-lg">
                <MapPin size={24} weight="duotone" style={{ color: ACCENT }} />
                <MapLink address={data.address} className="text-white font-semibold" />
              </div>
              <p className="text-slate-400 text-sm mt-2">&amp; Surrounding Areas</p>
            </GlassCard>
            <div className="flex flex-wrap justify-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full border" style={{ borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}>
                <NavigationArrow size={14} weight="fill" style={{ color: ACCENT }} />
                <span className="text-sm text-slate-300">Fast local response times</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full border" style={{ borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}>
                <div className="relative">
                  <div className="w-2 h-2 rounded-full animate-ping absolute" style={{ background: `${ACCENT}80` }} />
                  <div className="w-2 h-2 rounded-full relative" style={{ background: ACCENT }} />
                </div>
                <span className="text-sm text-slate-300">Technicians available now</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 20. HOURS ── */}
      {data.hours && (
        <section className="relative z-10 py-24 md:py-32 overflow-hidden">
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0a0e18 50%, #1a1a1a 100%)" }} />
          <GearTrail opacity={0.02} accent={ACCENT} />
          <div className="max-w-3xl mx-auto px-6 relative z-10">
            <SectionHeader badge="Hours" title="When We're Available" accent={ACCENT} />
            <div className="text-center">
              <ShimmerBorder accent={ACCENT}>
                <div className="p-8">
                  <Clock size={32} weight="duotone" style={{ color: ACCENT }} className="mx-auto mb-4" />
                  <p className="text-slate-300 leading-relaxed whitespace-pre-line text-lg">{data.hours}</p>
                </div>
              </ShimmerBorder>
            </div>
          </div>
        </section>
      )}

      {/* ── 21. FAQ ── */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #120e18 50%, #1a1a1a 100%)" }} />
        <IndustrialGrid opacity={0.02} accent={ACCENT} />
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <SectionHeader badge="FAQ" title="Common Questions" accent={ACCENT} />
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} question={faq.q} answer={faq.a} isOpen={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} />
            ))}
          </div>
        </div>
      </section>

      {/* ── 22. CONTACT ── */}
      <section id="contact" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #120e18 50%, #1a1a1a 100%)" }} />
        <IndustrialGrid opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: ACCENT, borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}>Contact Us</span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6 text-white">Get Your Free Estimate</h2>
              <p className="text-slate-400 leading-relaxed mb-8">Need a repair or new door? Contact {data.businessName} today for a free, no-obligation estimate.</p>
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: ACCENT_GLOW }}>
                    <MapPin size={20} weight="duotone" style={{ color: ACCENT }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Address</p>
                    <MapLink address={data.address} className="text-sm text-slate-400" />
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: ACCENT_GLOW }}>
                    <Phone size={20} weight="duotone" style={{ color: ACCENT }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Phone</p>
                    <PhoneLink phone={data.phone} className="text-sm text-slate-400" />
                  </div>
                </div>
                {data.hours && (
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: ACCENT_GLOW }}>
                      <Clock size={20} weight="duotone" style={{ color: ACCENT }} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">Hours</p>
                      <p className="text-sm text-slate-400 whitespace-pre-line">{data.hours}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <GlassCard className="p-8">
              <h3 className="text-xl font-semibold text-white mb-6">Request a Free Estimate</h3>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-1.5">First Name</label>
                    <input type="text" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none text-sm" placeholder="John" />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1.5">Last Name</label>
                    <input type="text" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none text-sm" placeholder="Doe" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">Phone</label>
                  <input type="tel" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none text-sm" placeholder="(555) 123-4567" />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">Service Needed</label>
                  <select className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none text-sm">
                    <option value="" className="bg-neutral-900">Select a service</option>
                    {data.services.map((s) => (
                      <option key={s.name} value={s.name.toLowerCase().replace(/\s+/g, "-")} className="bg-neutral-900">{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">Describe Your Issue</label>
                  <textarea rows={3} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none text-sm resize-none" placeholder="Broken spring, noisy opener, new door..." />
                </div>
                <MagneticButton className="w-full py-4 rounded-xl text-base font-semibold text-white flex items-center justify-center gap-2 cursor-pointer" style={{ background: ACCENT } as React.CSSProperties}>
                  Send Request <ArrowRight size={18} weight="bold" />
                </MagneticButton>
              </form>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* ── 23. GUARANTEE ── */}
      <section className="relative z-10 py-16 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0a0e08 100%)" }} />
        <IndustrialGrid opacity={0.015} accent={ACCENT} />
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <ShimmerBorder accent={ACCENT}>
            <div className="p-8 md:p-12">
              <ShieldCheck size={48} weight="fill" style={{ color: ACCENT }} className="mx-auto mb-4" />
              <h2 className="text-2xl md:text-4xl font-extrabold text-white mb-4">Our Guarantee</h2>
              <p className="text-slate-400 leading-relaxed max-w-2xl mx-auto text-lg">
                {data.businessName} stands behind every repair and installation. Fully insured, warranty-backed, and committed to your complete satisfaction.
              </p>
              <div className="flex flex-wrap justify-center gap-4 mt-8">
                {["Licensed & Insured", "Warranty Backed", "Free Estimates", "Satisfaction Guaranteed"].map((item) => (
                  <span key={item} className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border" style={{ color: ACCENT, borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}>
                    <CheckCircle size={16} weight="fill" /> {item}
                  </span>
                ))}
              </div>
            </div>
          </ShimmerBorder>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="relative z-10 border-t border-white/5 py-10 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #111 100%)" }} />
        <IndustrialGrid opacity={0.015} accent={ACCENT} />
        <div className="mx-auto max-w-6xl px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Garage size={22} weight="fill" style={{ color: ACCENT }} />
                <span className="text-lg font-bold text-white">{data.businessName}</span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">
                {data.about.length > 120 ? data.about.slice(0, 120).trim() + "..." : data.about}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-3">Quick Links</h4>
              <div className="space-y-2">
                {["Services", "Door Styles", "About", "Contact"].map((link) => (
                  <a key={link} href={`#${link.toLowerCase().replace(/\s+/g, "-")}`} className="block text-sm text-slate-500 hover:text-white transition-colors">{link}</a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-3">Contact</h4>
              <div className="space-y-2 text-sm text-slate-500">
                <p><PhoneLink phone={data.phone} /></p>
                <p><MapLink address={data.address} /></p>
                {data.socialLinks && Object.entries(data.socialLinks).map(([platform, url]) => (
                  <a key={platform} href={url} target="_blank" rel="noopener noreferrer" className="block hover:text-white transition-colors capitalize">{platform}</a>
                ))}
              </div>
            </div>
          </div>
          <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Garage size={14} weight="fill" style={{ color: ACCENT }} />
              <span>{data.businessName} &copy; {new Date().getFullYear()}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <BluejayLogo className="w-4 h-4" />
              <span>Created by <a href="https://bluejayportfolio.com" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "underline" }}>bluejayportfolio.com</a></span>
            </div>
          </div>
        </div>
      </footer>

      <ClaimBanner businessName={data.businessName} accentColor={ACCENT} prospectId={data.id} />
      <div className="h-14 md:h-28" />
    </main>
  );
}
