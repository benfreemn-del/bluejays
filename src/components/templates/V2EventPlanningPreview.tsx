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
  Champagne,
  CalendarCheck,
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
  Gift,
  Confetti,
  MusicNote,
  Broom,
  Truck,
  Play,
  Users,
  Sparkle,
  Heart,
  NavigationArrow,
  HandHeart,
  CrownSimple,
} from "@phosphor-icons/react";
import type { GeneratedSiteData } from "@/lib/generator";
import BluejayLogo from "../BluejayLogo";
import { MapLink, PhoneLink } from "@/components/templates/MapLink";
import ClaimBanner from "@/components/ClaimBanner";

const spring = { type: "spring" as const, stiffness: 100, damping: 20 };
const springFast = { type: "spring" as const, stiffness: 200, damping: 25 };

const CHARCOAL = "#1a1a1a";
const DEFAULT_GOLD = "#f59e0b";
const GOLD_LIGHT = "#fde68a";
const WARM_ACCENT = "#b45309";

function getAccent(accentColor?: string) {
  const c = accentColor || DEFAULT_GOLD;
  return {
    ACCENT: c,
    ACCENT_GLOW: `${c}26`,
    ACCENT_LIGHT: GOLD_LIGHT,
    WARM: WARM_ACCENT,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SERVICE_ICON_MAP: Record<string, any> = {
  wedding: Champagne,
  corporate: CalendarCheck,
  birthday: Gift,
  party: Confetti,
  gala: Champagne,
  conference: CalendarCheck,
  celebration: Confetti,
  reception: Champagne,
  ceremony: Champagne,
  design: MusicNote,
  decor: Gift,
  venue: CalendarCheck,
  catering: HandHeart,
  entertainment: MusicNote,
  floral: Heart,
  coordination: Broom,
  planning: CalendarCheck,
  photo: Sparkle,
};

function getServiceIcon(n: string) {
  const l = n.toLowerCase();
  for (const [k, I] of Object.entries(SERVICE_ICON_MAP)) {
    if (l.includes(k)) return I;
  }
  return Champagne;
}

const STOCK_HERO =
  "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1400&q=80";
const STOCK_ABOUT =
  "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=600&q=80";
const STOCK_GALLERY = [
  "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=600&q=80",
  "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=600&q=80",
  "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&q=80",
  "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=600&q=80",
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
    isWarm: Math.random() > 0.6,
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
            background: p.isWarm ? WARM_ACCENT : accent,
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

function ConfettiPattern({
  opacity = 0.03,
  accent,
}: {
  opacity?: number;
  accent: string;
}) {
  const patternId = `confettiV2-${accent.replace("#", "")}`;
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity }}
    >
      <defs>
        <pattern
          id={patternId}
          width="80"
          height="80"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="20" cy="20" r="3" fill={accent} opacity="0.2" />
          <circle cx="25" cy="15" r="1.5" fill={accent} opacity="0.3" />
          <circle cx="15" cy="25" r="2" fill={WARM_ACCENT} opacity="0.15" />
          <circle cx="60" cy="50" r="2.5" fill={accent} opacity="0.2" />
          <circle cx="55" cy="55" r="1" fill={WARM_ACCENT} opacity="0.25" />
          <circle cx="40" cy="70" r="2" fill={accent} opacity="0.15" />
          <circle cx="70" cy="30" r="1.5" fill={accent} opacity="0.2" />
          <path
            d="M30 40 Q35 35 40 40"
            fill="none"
            stroke={accent}
            strokeWidth="0.5"
            opacity="0.2"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  );
}

function SparkleTrail({
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
      <motion.path
        d="M100 0 Q120 100 100 200 Q80 300 100 400 Q120 500 100 600"
        fill="none"
        stroke={accent}
        strokeWidth="2"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.path
        d="M500 0 Q480 150 500 300 Q520 450 500 600"
        fill="none"
        stroke={WARM_ACCENT}
        strokeWidth="1.5"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{
          duration: 3.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5,
        }}
      />
      <motion.path
        d="M850 0 Q870 100 850 200 Q830 300 850 400"
        fill="none"
        stroke={accent}
        strokeWidth="1"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
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
      className={`rounded-2xl border border-white/15 bg-white/[0.08] backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] ${className}`}
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
          background: `conic-gradient(from 0deg, transparent, ${accent}, transparent, ${WARM_ACCENT}, transparent)`,
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

const EVENT_TYPES = [
  {
    icon: Champagne,
    title: "Weddings",
    desc: "Elegant ceremonies and receptions tailored to your love story",
  },
  {
    icon: CalendarCheck,
    title: "Corporate Events",
    desc: "Professional conferences, galas, and team-building retreats",
  },
  {
    icon: Gift,
    title: "Birthday Parties",
    desc: "Milestone celebrations from intimate dinners to grand bashes",
  },
  {
    icon: CrownSimple,
    title: "Galas & Fundraisers",
    desc: "Black-tie affairs and charity events with flawless execution",
  },
  {
    icon: Users,
    title: "Social Gatherings",
    desc: "Reunions, holiday parties, anniversaries, and more",
  },
  {
    icon: MusicNote,
    title: "Entertainment Events",
    desc: "Live music showcases, award ceremonies, and launch parties",
  },
];

const VENUE_PARTNERS = [
  "Grand Ballroom",
  "Waterfront Estate",
  "Rooftop Terrace",
  "Garden Pavilion",
  "Historic Manor",
  "Modern Loft",
];

const VENDOR_CATEGORIES = [
  { icon: MusicNote, label: "DJs & Bands", count: "15+" },
  { icon: Sparkle, label: "Florists", count: "12+" },
  { icon: HandHeart, label: "Caterers", count: "20+" },
  { icon: Gift, label: "Photographers", count: "18+" },
  { icon: Broom, label: "Decorators", count: "10+" },
  { icon: Truck, label: "Rentals", count: "8+" },
];

const TIMELINE_STEPS = [
  {
    time: "8:00 AM",
    title: "Venue Setup Begins",
    desc: "Our team arrives early to transform the space",
  },
  {
    time: "12:00 PM",
    title: "Vendor Coordination",
    desc: "Florists, caterers, and entertainers get staged",
  },
  {
    time: "3:00 PM",
    title: "Final Walkthrough",
    desc: "Every detail checked and perfected before guests arrive",
  },
  {
    time: "5:00 PM",
    title: "Guests Arrive",
    desc: "Seamless welcome experience with on-site coordination",
  },
  {
    time: "11:00 PM",
    title: "Grand Finale & Cleanup",
    desc: "We handle teardown so you can celebrate to the last moment",
  },
];

const COMPARISON_ROWS = [
  { feature: "Dedicated Day-of Coordinator", us: true, them: "Extra Cost" },
  { feature: "100+ Vetted Vendor Network", us: true, them: "No" },
  { feature: "Custom Design & Décor", us: true, them: "Basic" },
  { feature: "Emergency Backup Plans", us: true, them: "No" },
  { feature: "Unlimited Consultations", us: true, them: "Limited" },
  { feature: "Transparent Flat-Rate Pricing", us: true, them: "Hourly" },
  { feature: "Post-Event Cleanup Included", us: true, them: "Extra Cost" },
];

const PRICING_TIERS = [
  {
    title: "Day-of Coordination",
    price: "$2,500",
    subtitle: "starting at",
    features: [
      "8-hour coordinator on-site",
      "Vendor timeline management",
      "Setup & teardown oversight",
      "Emergency kit on hand",
    ],
  },
  {
    title: "Partial Planning",
    price: "$5,000",
    subtitle: "starting at",
    popular: true,
    features: [
      "Everything in Day-of",
      "Venue & vendor sourcing",
      "Design consultation",
      "Budget management",
      "Monthly check-ins",
    ],
  },
  {
    title: "Full-Service Planning",
    price: "$10,000",
    subtitle: "starting at",
    features: [
      "Everything in Partial",
      "Complete event design",
      "Guest management",
      "Travel & accommodation",
      "Unlimited revisions",
      "Post-event wrap-up",
    ],
  },
];

/* ── main component ── */

export default function V2EventPlanningPreview({
  data,
}: {
  data: GeneratedSiteData;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const { ACCENT, ACCENT_GLOW } = getAccent(data.accentColor);
  const uniquePhotos = data.photos ? [...new Set(data.photos)] : [];
  const heroImage = uniquePhotos[0] || STOCK_HERO;
  const heroCardImage = uniquePhotos[1] || STOCK_ABOUT;
  const aboutImage = uniquePhotos[2] || STOCK_ABOUT;
  const galleryImages =
    data.photos?.length > 2 ? data.photos.slice(2, 6) : STOCK_GALLERY;
  const phoneDigits = data.phone.replace(/\D/g, "");

  const processSteps = [
    {
      step: "01",
      title: "Discovery Call",
      desc: "We learn your vision, style, budget, and every detail that matters to you.",
    },
    {
      step: "02",
      title: "Custom Proposal",
      desc: "Receive a tailored event plan with venue options, vendor picks, and design concepts.",
    },
    {
      step: "03",
      title: "Design & Coordinate",
      desc: "We manage every vendor, timeline, and detail while you enjoy the journey.",
    },
    {
      step: "04",
      title: "Flawless Execution",
      desc: "On event day, our team ensures everything runs perfectly from start to finish.",
    },
  ];

  const faqs = [
    {
      q: `How far in advance should I book ${data.businessName}?`,
      a: "For weddings and large events, we recommend 6-12 months in advance. For smaller gatherings, 2-3 months is usually sufficient. However, we do accommodate last-minute events when our calendar allows.",
    },
    {
      q: "Do you handle destination events?",
      a: `Yes! ${data.businessName} plans events both locally and at destination venues. Travel and accommodation coordination is included in our full-service packages.`,
    },
    {
      q: "Can you work within a specific budget?",
      a: "Absolutely. We pride ourselves on transparent budgeting. During our discovery call, we'll understand your budget and create a plan that maximizes every dollar without compromising on the experience.",
    },
    {
      q: "What happens if something goes wrong on event day?",
      a: `Our coordinators always have a Plan B (and C). ${data.businessName} carries emergency kits, backup vendor contacts, and years of experience handling the unexpected seamlessly.`,
    },
    {
      q: "Do you provide rental items and décor?",
      a: "We work with an extensive network of rental partners for everything from linens and centerpieces to lighting and furniture. Design and décor sourcing is included in our partial and full-service packages.",
    },
  ];

  const fallbackTestimonials = [
    {
      name: "Olivia W.",
      text: "Our wedding was a fairy tale come true. Every single detail was handled flawlessly — we didn't worry about a thing all night.",
      rating: 5,
    },
    {
      name: "Nathan C.",
      text: "They planned our company gala and it was our best corporate event ever. Incredible attention to detail and seamless vendor coordination.",
      rating: 5,
    },
    {
      name: "Samantha R.",
      text: "Threw my daughter the birthday party of her dreams. Creative, organized, and so much fun. The kids are still talking about it!",
      rating: 5,
    },
  ];

  const testimonials =
    data.testimonials?.length > 0 ? data.testimonials : fallbackTestimonials;

  const quizOptions = [
    {
      label: "Wedding or Engagement",
      emoji: "💍",
      result:
        "Our full-service wedding planning is perfect for you. Let's create your dream day!",
    },
    {
      label: "Corporate or Conference",
      emoji: "🏢",
      result:
        "Our corporate event team specializes in professional, polished experiences.",
    },
    {
      label: "Birthday or Social Event",
      emoji: "🎉",
      result:
        "From intimate dinners to blow-out parties, we make every celebration unforgettable.",
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
              <Champagne
                size={24}
                weight="fill"
                style={{ color: ACCENT }}
              />
              <span className="text-lg font-bold tracking-tight text-white">
                {data.businessName}
              </span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
              <a
                href="#services"
                className="hover:text-white transition-colors"
              >
                Services
              </a>
              <a href="#events" className="hover:text-white transition-colors">
                Events
              </a>
              <a href="#about" className="hover:text-white transition-colors">
                About
              </a>
              <a href="#contact" className="hover:text-white transition-colors">
                Contact
              </a>
            </div>
            <div className="flex items-center gap-3">
              <MagneticButton
                className="px-4 md:px-5 py-2 rounded-full text-sm font-semibold text-white transition-colors cursor-pointer"
                style={{ background: ACCENT } as React.CSSProperties}
              >
                Free Consultation
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
                    { label: "Events", href: "#events" },
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
          <img
            src={heroImage}
            alt={data.businessName}
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-black/70" />
        </div>
        <ConfettiPattern opacity={0.04} accent={ACCENT} />
        <SparkleTrail opacity={0.04} accent={ACCENT} />
        <div
          className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full blur-[200px] pointer-events-none"
          style={{ background: `${ACCENT}08` }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full blur-[160px] pointer-events-none"
          style={{ background: `${WARM_ACCENT}06` }}
        />
        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          <div className="space-y-8">
            <div>
              <p
                className="text-sm uppercase tracking-widest mb-4"
                style={{ color: ACCENT }}
              >
                Premier Event Planning
              </p>
              <h1
                className="text-3xl md:text-6xl tracking-tighter leading-none font-bold text-white"
                style={{
                  textShadow:
                    "0 2px 20px rgba(0,0,0,0.8), 0 4px 40px rgba(0,0,0,0.5)",
                }}
              >
                {data.tagline}
              </h1>
            </div>
            <p className="text-lg text-white/80 max-w-md leading-relaxed" style={{ textShadow: "0 1px 8px rgba(0,0,0,0.6)" }}>
              {(() => {
                const t = data.about;
                if (t.length <= 180) return t;
                const dot = t.indexOf(".", 80);
                return dot > 0 && dot < 220
                  ? t.slice(0, dot + 1)
                  : t.slice(0, 180).trim() + "...";
              })()}
            </p>
            <div className="flex flex-wrap gap-4">
              <MagneticButton
                className="px-8 py-4 rounded-full text-base font-semibold text-white flex items-center gap-2 cursor-pointer"
                style={{ background: ACCENT } as React.CSSProperties}
              >
                Plan My Event <ArrowRight size={18} weight="bold" />
              </MagneticButton>
              <MagneticButton
                href={`tel:${phoneDigits}`}
                className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/15 flex items-center gap-2 cursor-pointer"
              >
                <Phone size={18} weight="duotone" />{" "}
                <PhoneLink phone={data.phone} />
              </MagneticButton>
            </div>
            {/* Trust badges on hero */}
            <div className="flex flex-wrap gap-3">
              {[
                "Award-Winning",
                data.googleRating
                  ? `${data.googleRating}-Star Rated`
                  : "5-Star Rated",
                "Free Consultation",
              ].map((badge) => (
                <span
                  key={badge}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border backdrop-blur-md"
                  style={{
                    color: ACCENT,
                    borderColor: `${ACCENT}33`,
                    background: `${ACCENT}0d`,
                  }}
                >
                  <CheckCircle size={14} weight="fill" /> {badge}
                </span>
              ))}
            </div>
          </div>
          <div className="hidden md:block relative">
            <div className="relative rounded-2xl overflow-hidden border border-white/15">
              <img
                src={heroCardImage}
                alt={`${data.businessName} event`}
                className="w-full h-[500px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6">
                <div
                  className="px-4 py-2 rounded-full backdrop-blur-md bg-black/50 border flex items-center gap-2"
                  style={{ borderColor: `${ACCENT}4d` }}
                >
                  <Champagne
                    size={18}
                    weight="fill"
                    style={{ color: ACCENT }}
                  />
                  <span className="text-sm font-semibold text-white">
                    Unforgettable Events
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. STATS BAR ── */}
      <section
        className="relative z-10 py-16 overflow-hidden border-y"
        style={{ borderColor: `${ACCENT}1a` }}
      >
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(180deg, #120e18 0%, #1a1a1a 100%)",
          }}
        />
        <ConfettiPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {data.stats.map((stat, i) => {
              const statIcons = [Champagne, Clock, Star, ShieldCheck];
              const Icon = statIcons[i % statIcons.length];
              return (
                <div key={stat.label} className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Icon
                      size={22}
                      weight="fill"
                      style={{ color: ACCENT }}
                    />
                    <span className="text-3xl md:text-4xl font-extrabold text-white">
                      {stat.value}
                    </span>
                  </div>
                  <span className="text-slate-500 text-sm font-medium tracking-wide uppercase">
                    {stat.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 3. EVENT TYPES GRID ── */}
      <section
        id="events"
        className="relative z-10 py-24 md:py-32 overflow-hidden"
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, #1a1a1a 0%, #0a0e18 50%, #1a1a1a 100%)",
          }}
        />
        <ConfettiPattern accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            badge="What We Plan"
            title="Events We Specialize In"
            subtitle="From intimate gatherings to grand celebrations, every event gets the royal treatment."
            accent={ACCENT}
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {EVENT_TYPES.map((evt) => {
              const Icon = evt.icon;
              return (
                <GlassCard
                  key={evt.title}
                  className="p-7 group hover:border-white/20 transition-all duration-500"
                >
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-5 border"
                    style={{
                      background: ACCENT_GLOW,
                      borderColor: `${ACCENT}33`,
                    }}
                  >
                    <Icon
                      size={28}
                      weight="duotone"
                      style={{ color: ACCENT }}
                    />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">
                    {evt.title}
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {evt.desc}
                  </p>
                </GlassCard>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 4. SERVICES ── */}
      <section
        id="services"
        className="relative z-10 py-24 md:py-32 overflow-hidden"
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, #1a1a1a 0%, #120e18 50%, #1a1a1a 100%)",
          }}
        />
        <SparkleTrail opacity={0.02} accent={ACCENT} />
        <div
          className="absolute inset-0 pointer-events-none"
        >
          <div
            className="absolute top-[10%] right-[5%] w-[500px] h-[500px] rounded-full blur-[160px]"
            style={{ background: `${ACCENT}08` }}
          />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            badge="Our Services"
            title="Event Services"
            subtitle={`${data.businessName} provides professional event planning services you can trust.`}
            accent={ACCENT}
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.services.map((service, i) => {
              const Icon = getServiceIcon(service.name);
              return (
                <div
                  key={service.name}
                  className="group relative p-7 rounded-2xl border border-white/[0.10] hover:border-opacity-30 transition-all duration-500 overflow-hidden bg-white/[0.07]"
                >
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{
                      background: `radial-gradient(circle at 50% 0%, ${ACCENT}15, transparent 70%)`,
                    }}
                  />
                  <div
                    className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: `linear-gradient(to right, transparent, ${ACCENT}4d, transparent)`,
                    }}
                  />
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-5">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 border"
                        style={{
                          background: ACCENT_GLOW,
                          borderColor: `${ACCENT}33`,
                        }}
                      >
                        <Icon
                          size={24}
                          weight="duotone"
                          style={{ color: ACCENT }}
                        />
                      </div>
                      <span className="text-xs font-mono text-slate-600">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">
                      {service.name}
                    </h3>
                    <p className="text-sm text-slate-400 leading-relaxed">
                      {service.description || ""}
                    </p>
                    {service.price && (
                      <p
                        className="text-sm font-semibold mt-3"
                        style={{ color: ACCENT }}
                      >
                        {service.price}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 5. VENUE PARTNERSHIPS ── */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, #1a1a1a 0%, #0a0e18 50%, #1a1a1a 100%)",
          }}
        />
        <ConfettiPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            badge="Venue Network"
            title="Exclusive Venue Partners"
            subtitle="We've built relationships with the finest venues so you get priority access and special rates."
            accent={ACCENT}
          />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {VENUE_PARTNERS.map((venue) => (
              <GlassCard
                key={venue}
                className="p-6 text-center group hover:border-white/20 transition-all duration-300"
              >
                <MapPin
                  size={28}
                  weight="duotone"
                  style={{ color: ACCENT }}
                  className="mx-auto mb-3"
                />
                <h3 className="text-white font-semibold text-sm">{venue}</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Preferred Partner
                </p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. VENDOR NETWORK ── */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, #1a1a1a 0%, #120e18 50%, #1a1a1a 100%)",
          }}
        />
        <SparkleTrail opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            badge="Vendor Network"
            title="100+ Trusted Vendors"
            subtitle="Our vetted vendor network ensures every aspect of your event is handled by the best in the business."
            accent={ACCENT}
          />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {VENDOR_CATEGORIES.map((vendor) => {
              const Icon = vendor.icon;
              return (
                <GlassCard
                  key={vendor.label}
                  className="p-6 flex items-center gap-4"
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border"
                    style={{
                      background: ACCENT_GLOW,
                      borderColor: `${ACCENT}33`,
                    }}
                  >
                    <Icon
                      size={24}
                      weight="duotone"
                      style={{ color: ACCENT }}
                    />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-sm">
                      {vendor.label}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {vendor.count} partners
                    </p>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 7. ABOUT ── */}
      <section
        id="about"
        className="relative z-10 py-24 md:py-32 overflow-hidden"
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, #1a1a1a 0%, #120e18 50%, #1a1a1a 100%)",
          }}
        />
        <SparkleTrail opacity={0.02} accent={ACCENT} />
        <div
          className="absolute inset-0 pointer-events-none"
        >
          <div
            className="absolute top-[20%] left-[10%] w-[500px] h-[500px] rounded-full blur-[180px]"
            style={{ background: `${ACCENT}06` }}
          />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="relative">
              <div className="rounded-2xl overflow-hidden border border-white/15">
                <img
                  src={aboutImage}
                  alt={`${data.businessName} team`}
                  className="w-full h-[400px] object-cover"
                />
              </div>
              <div className="absolute -bottom-4 -right-4 md:bottom-6 md:-right-6">
                <div
                  className="px-5 py-3 rounded-xl backdrop-blur-md border text-white font-bold text-sm shadow-lg"
                  style={{
                    background: `${ACCENT}e6`,
                    borderColor: `${ACCENT}80`,
                  }}
                >
                  {data.stats[0]
                    ? `${data.stats[0].value} ${data.stats[0].label}`
                    : "Events Perfected"}
                </div>
              </div>
            </div>
            <div>
              <span
                className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border"
                style={{
                  color: ACCENT,
                  borderColor: `${ACCENT}33`,
                  background: `${ACCENT}0d`,
                }}
              >
                About Us
              </span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6 text-white">
                Your Vision, Our Expertise
              </h2>
              <p className="text-slate-400 leading-relaxed mb-8">
                {data.about}
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: ShieldCheck, label: "Fully Insured" },
                  { icon: Champagne, label: "Full Service" },
                  { icon: Star, label: "Award Winning" },
                  { icon: CheckCircle, label: "Satisfaction Guaranteed" },
                ].map((badge) => (
                  <GlassCard
                    key={badge.label}
                    className="p-4 flex items-center gap-3"
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: ACCENT_GLOW }}
                    >
                      <badge.icon
                        size={20}
                        weight="duotone"
                        style={{ color: ACCENT }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-white">
                      {badge.label}
                    </span>
                  </GlassCard>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. DAY-OF TIMELINE ── */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, #1a1a1a 0%, #0a0e18 50%, #1a1a1a 100%)",
          }}
        />
        <ConfettiPattern opacity={0.025} accent={ACCENT} />
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <SectionHeader
            badge="Day-of Timeline"
            title="How Your Event Day Unfolds"
            subtitle="A peek behind the curtain at how we orchestrate perfection."
            accent={ACCENT}
          />
          <div className="relative">
            {/* Vertical line */}
            <div
              className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px hidden md:block"
              style={{
                background: `linear-gradient(to bottom, transparent, ${ACCENT}33, transparent)`,
              }}
            />
            <div className="space-y-8">
              {TIMELINE_STEPS.map((step, i) => (
                <div
                  key={step.time}
                  className={`flex items-start gap-6 md:gap-12 ${
                    i % 2 === 0
                      ? "md:flex-row"
                      : "md:flex-row-reverse md:text-right"
                  }`}
                >
                  <div className="flex-1">
                    <GlassCard className="p-6">
                      <span
                        className="text-xs font-bold uppercase tracking-widest"
                        style={{ color: ACCENT }}
                      >
                        {step.time}
                      </span>
                      <h3 className="text-lg font-bold text-white mt-2 mb-1">
                        {step.title}
                      </h3>
                      <p className="text-sm text-slate-400 leading-relaxed">
                        {step.desc}
                      </p>
                    </GlassCard>
                  </div>
                  <div className="hidden md:block flex-1" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 9. PLANNING PROCESS ── */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, #1a1a1a 0%, #120e18 50%, #1a1a1a 100%)",
          }}
        />
        <SparkleTrail opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            badge="Our Process"
            title="Planning Made Simple"
            accent={ACCENT}
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {processSteps.map((step, i) => (
              <div key={step.step} className="relative">
                {i < processSteps.length - 1 && (
                  <div
                    className="hidden lg:block absolute top-10 left-[calc(50%+40px)] w-[calc(100%-80px)] h-px"
                    style={{
                      background: `linear-gradient(to right, ${ACCENT}33, ${ACCENT}11)`,
                    }}
                  />
                )}
                <GlassCard className="p-6 text-center relative">
                  <div
                    className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-black"
                    style={{
                      background: `linear-gradient(135deg, ${ACCENT}22, ${ACCENT}0a)`,
                      color: ACCENT,
                      border: `1px solid ${ACCENT}33`,
                    }}
                  >
                    {step.step}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {step.desc}
                  </p>
                </GlassCard>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 10. PRICING / PACKAGES ── */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, #1a1a1a 0%, #0a0e18 50%, #1a1a1a 100%)",
          }}
        />
        <ConfettiPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            badge="Packages"
            title="Event Planning Packages"
            subtitle="Transparent pricing with no hidden fees. Every package is customized to your vision."
            accent={ACCENT}
          />
          <div className="grid md:grid-cols-3 gap-6">
            {PRICING_TIERS.map((tier) => (
              <div key={tier.title} className="relative">
                {tier.popular && (
                  <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold text-white z-20"
                    style={{ background: ACCENT }}
                  >
                    Most Popular
                  </div>
                )}
                <GlassCard
                  className={`p-8 h-full flex flex-col ${
                    tier.popular ? "border-2" : ""
                  }`}
                  {...(tier.popular
                    ? {
                        style: { borderColor: `${ACCENT}4d` },
                      }
                    : {})}
                >
                  <h3 className="text-lg font-bold text-white mb-1">
                    {tier.title}
                  </h3>
                  <p className="text-xs text-slate-500 mb-3">
                    {tier.subtitle}
                  </p>
                  <p
                    className="text-4xl font-black mb-6"
                    style={{ color: ACCENT }}
                  >
                    {tier.price}
                  </p>
                  <ul className="space-y-3 flex-1">
                    {tier.features.map((f) => (
                      <li
                        key={f}
                        className="flex items-start gap-2 text-sm text-slate-300"
                      >
                        <CheckCircle
                          size={16}
                          weight="fill"
                          style={{ color: ACCENT }}
                          className="shrink-0 mt-0.5"
                        />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <MagneticButton
                    className="w-full mt-6 py-3 rounded-xl text-sm font-semibold text-white cursor-pointer text-center"
                    style={
                      {
                        background: tier.popular
                          ? ACCENT
                          : `${ACCENT}22`,
                        border: tier.popular
                          ? "none"
                          : `1px solid ${ACCENT}33`,
                      } as React.CSSProperties
                    }
                  >
                    Get Started
                  </MagneticButton>
                </GlassCard>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 11. LIMITED AVAILABILITY ── */}
      <section
        className="relative z-10 py-16 overflow-hidden border-y"
        style={{ borderColor: `${ACCENT}1a` }}
      >
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(180deg, #120e18 0%, #1a1a1a 100%)",
          }}
        />
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div
                  className="w-4 h-4 rounded-full animate-ping absolute"
                  style={{ background: `${ACCENT}80` }}
                />
                <div
                  className="w-4 h-4 rounded-full relative"
                  style={{ background: ACCENT }}
                />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  Limited Availability
                </h3>
                <p className="text-sm text-slate-400">
                  We accept only 24 events per year to ensure each one gets our
                  full attention
                </p>
              </div>
            </div>
            <MagneticButton
              className="px-6 py-3 rounded-full text-sm font-semibold text-white cursor-pointer whitespace-nowrap"
              style={{ background: ACCENT } as React.CSSProperties}
            >
              Check Availability
            </MagneticButton>
          </div>
        </div>
      </section>

      {/* ── 12. GALLERY ── */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, #1a1a1a 0%, #120e18 50%, #1a1a1a 100%)",
          }}
        />
        <SparkleTrail opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            badge="Our Work"
            title="Recent Events"
            accent={ACCENT}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {galleryImages.map((src, i) => {
              const titles = [
                "Elegant Wedding Reception",
                "Corporate Gala Night",
                "Garden Birthday Celebration",
                "Luxury Venue Styling",
              ];
              return (
                <div
                  key={i}
                  className="group relative rounded-2xl overflow-hidden border border-white/[0.10] hover:border-opacity-30 transition-all duration-500"
                >
                  <img
                    src={src}
                    alt={titles[i]}
                    className="w-full h-64 object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-lg font-bold text-white mb-1">
                      {titles[i]}
                    </h3>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 13. VIDEO TESTIMONIAL PLACEHOLDER ── */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, #1a1a1a 0%, #0a0e18 50%, #1a1a1a 100%)",
          }}
        />
        <ConfettiPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <SectionHeader
            badge="See Our Work"
            title="Watch Our Events Come to Life"
            accent={ACCENT}
          />
          <div className="relative rounded-2xl overflow-hidden border border-white/15">
            <img
              src={heroImage}
              alt="Event highlight reel"
              className="w-full h-[350px] object-cover"
            />
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center cursor-pointer border-2"
                style={{
                  background: `${ACCENT}cc`,
                  borderColor: `${ACCENT}`,
                }}
              >
                <Play size={36} weight="fill" className="text-white ml-1" />
              </div>
            </div>
            <div className="absolute bottom-6 left-6">
              <p className="text-white font-semibold text-lg">
                Event Highlight Reel
              </p>
              <p className="text-white/60 text-sm">
                See why clients trust us with their most important moments
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 14. GOOGLE REVIEWS HEADER + TESTIMONIALS ── */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, #1a1a1a 0%, #120e18 50%, #1a1a1a 100%)",
          }}
        />
        <ConfettiPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          {/* Google Reviews Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border backdrop-blur-md" style={{ borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}>
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} size={18} weight="fill" style={{ color: ACCENT }} />
                ))}
              </div>
              <span className="text-white font-semibold text-sm">
                {data.googleRating || "5.0"} Rating
              </span>
              {data.reviewCount && (
                <span className="text-slate-400 text-sm">
                  ({data.reviewCount}+ reviews)
                </span>
              )}
            </div>
          </div>
          <SectionHeader
            badge="Reviews"
            title="What Our Clients Say"
            accent={ACCENT}
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <GlassCard key={i} className="p-6 h-full flex flex-col">
                <div className="text-4xl mb-4" style={{ color: `${ACCENT}33` }}>
                  &ldquo;
                </div>
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.rating || 5 }).map((_, j) => (
                    <Star
                      key={j}
                      size={16}
                      weight="fill"
                      style={{ color: ACCENT }}
                    />
                  ))}
                </div>
                <p className="text-slate-300 leading-relaxed flex-1 text-sm mb-4">
                  {t.text}
                </p>
                <div className="pt-4 border-t border-white/8 flex items-center gap-2">
                  <CheckCircle size={14} weight="fill" style={{ color: ACCENT }} />
                  <span className="text-sm font-semibold text-white">
                    {t.name}
                  </span>
                  <span className="text-xs text-slate-500">Verified Client</span>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* ── 15. COMPETITOR COMPARISON ── */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, #1a1a1a 0%, #0a0e18 50%, #1a1a1a 100%)",
          }}
        />
        <SparkleTrail opacity={0.02} accent={ACCENT} />
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <SectionHeader
            badge="Why Us"
            title={`${data.businessName} vs. The Competition`}
            accent={ACCENT}
          />
          <GlassCard className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/15">
                    <th className="text-left p-4 text-slate-400 font-medium">
                      Feature
                    </th>
                    <th
                      className="text-center p-4 font-bold"
                      style={{ color: ACCENT }}
                    >
                      {data.businessName}
                    </th>
                    <th className="text-center p-4 text-slate-500 font-medium">
                      Others
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_ROWS.map((row) => (
                    <tr
                      key={row.feature}
                      className="border-b border-white/8 hover:bg-white/[0.07] transition-colors"
                    >
                      <td className="p-4 text-slate-300">{row.feature}</td>
                      <td className="p-4 text-center">
                        <CheckCircle
                          size={20}
                          weight="fill"
                          className="mx-auto"
                          style={{ color: "#22c55e" }}
                        />
                      </td>
                      <td className="p-4 text-center text-slate-500 text-xs">
                        {row.them}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* ── 16. EVENT QUIZ ── */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, #1a1a1a 0%, #120e18 50%, #1a1a1a 100%)",
          }}
        />
        <ConfettiPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <SectionHeader
            badge="Find Your Fit"
            title="What Type of Event Are You Planning?"
            accent={ACCENT}
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {quizOptions.map((opt, i) => (
              <button
                key={opt.label}
                onClick={() => setQuizAnswer(i)}
                className={`p-6 rounded-2xl border text-left transition-all duration-300 cursor-pointer ${
                  quizAnswer === i
                    ? "border-opacity-100 bg-white/[0.06]"
                    : "border-white/15 bg-white/[0.07] hover:bg-white/[0.07]"
                }`}
                style={
                  quizAnswer === i ? { borderColor: ACCENT } : undefined
                }
              >
                <span className="text-2xl mb-3 block">{opt.emoji}</span>
                <h3 className="text-white font-semibold text-sm">
                  {opt.label}
                </h3>
              </button>
            ))}
          </div>
          <AnimatePresence>
            {quizAnswer !== null && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
              >
                <ShimmerBorder accent={ACCENT}>
                  <div className="p-6 text-center">
                    <p className="text-white text-lg mb-4">
                      {quizOptions[quizAnswer].result}
                    </p>
                    <MagneticButton
                      href={`tel:${phoneDigits}`}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white cursor-pointer"
                      style={{ background: ACCENT } as React.CSSProperties}
                    >
                      <Phone size={16} weight="fill" /> Call Now to Book
                    </MagneticButton>
                  </div>
                </ShimmerBorder>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ── 17. CERTIFICATIONS / TRUST BADGES ROW ── */}
      <section
        className="relative z-10 py-16 overflow-hidden border-y"
        style={{ borderColor: `${ACCENT}1a` }}
      >
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(180deg, #120e18 0%, #1a1a1a 100%)",
          }}
        />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="flex flex-wrap justify-center gap-4">
            {[
              "Licensed & Insured",
              "BBB Accredited",
              "Award-Winning Planner",
              "100+ Events",
              "5-Star Google Rating",
              "Certified Event Professional",
            ].map((badge) => (
              <span
                key={badge}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium border"
                style={{
                  color: ACCENT,
                  borderColor: `${ACCENT}33`,
                  background: `${ACCENT}0d`,
                }}
              >
                <ShieldCheck size={14} weight="fill" /> {badge}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── 18. MID-PAGE CTA ── */}
      <section className="relative z-10 py-20 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT}cc, ${ACCENT})`,
          }}
        />
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='40' height='40' fill='none'/%3E%3Cpath d='M0 0L40 40M40 0L0 40' stroke='%23000' stroke-width='0.5'/%3E%3C/svg%3E\")",
          }}
        />
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <Champagne
            size={48}
            weight="fill"
            className="mx-auto mb-6 text-white/70"
          />
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-4">
            Start Planning Your Event
          </h2>
          <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
            From intimate gatherings to grand celebrations, we bring your vision
            to life.
          </p>
          <PhoneLink
            phone={data.phone}
            className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-white text-black font-bold text-lg hover:bg-white/90 transition-colors"
          >
            <Phone size={22} weight="fill" /> Call {data.phone}
          </PhoneLink>
        </div>
      </section>

      {/* ── 19. ENHANCED SERVICE AREA ── */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, #1a1a1a 0%, #120e18 50%, #1a1a1a 100%)",
          }}
        />
        <ConfettiPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            badge="Service Area"
            title="Areas We Serve"
            accent={ACCENT}
          />
          <div className="flex flex-col items-center gap-6">
            <GlassCard className="p-8 inline-block">
              <div className="flex items-center gap-3 text-lg">
                <MapPin
                  size={24}
                  weight="duotone"
                  style={{ color: ACCENT }}
                />
                <MapLink
                  address={data.address}
                  className="text-white font-semibold"
                />
              </div>
              <p className="text-slate-400 text-sm mt-2">
                &amp; Surrounding Areas
              </p>
            </GlassCard>
            <div className="flex flex-wrap justify-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full border" style={{ borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}>
                <NavigationArrow size={14} weight="fill" style={{ color: ACCENT }} />
                <span className="text-sm text-slate-300">Destination events available</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full border" style={{ borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}>
                <div className="relative">
                  <div className="w-2 h-2 rounded-full animate-ping absolute" style={{ background: `${ACCENT}80` }} />
                  <div className="w-2 h-2 rounded-full relative" style={{ background: ACCENT }} />
                </div>
                <span className="text-sm text-slate-300">Currently booking events</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 20. HOURS ── */}
      {data.hours && (
        <section className="relative z-10 py-24 md:py-32 overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, #1a1a1a 0%, #0a0e18 50%, #1a1a1a 100%)",
            }}
          />
          <SparkleTrail opacity={0.02} accent={ACCENT} />
          <div className="max-w-3xl mx-auto px-6 relative z-10">
            <SectionHeader
              badge="Hours"
              title="When We're Available"
              accent={ACCENT}
            />
            <div className="text-center">
              <ShimmerBorder accent={ACCENT}>
                <div className="p-8">
                  <Clock
                    size={32}
                    weight="duotone"
                    style={{ color: ACCENT }}
                    className="mx-auto mb-4"
                  />
                  <p className="text-slate-300 leading-relaxed whitespace-pre-line text-lg">
                    {data.hours}
                  </p>
                </div>
              </ShimmerBorder>
            </div>
          </div>
        </section>
      )}

      {/* ── 21. FAQ ── */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, #1a1a1a 0%, #0a0e18 50%, #1a1a1a 100%)",
          }}
        />
        <ConfettiPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <SectionHeader
            badge="FAQ"
            title="Common Questions"
            accent={ACCENT}
          />
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                question={faq.q}
                answer={faq.a}
                isOpen={openFaq === i}
                onToggle={() => setOpenFaq(openFaq === i ? null : i)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── 22. CONTACT ── */}
      <section
        id="contact"
        className="relative z-10 py-24 md:py-32 overflow-hidden"
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, #1a1a1a 0%, #120e18 50%, #1a1a1a 100%)",
          }}
        />
        <ConfettiPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <span
                className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border"
                style={{
                  color: ACCENT,
                  borderColor: `${ACCENT}33`,
                  background: `${ACCENT}0d`,
                }}
              >
                Contact Us
              </span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6 text-white">
                Let&apos;s Plan Something Extraordinary
              </h2>
              <p className="text-slate-400 leading-relaxed mb-8">
                Ready to start planning? Contact {data.businessName} today for a
                free consultation.
              </p>
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: ACCENT_GLOW }}
                  >
                    <MapPin
                      size={20}
                      weight="duotone"
                      style={{ color: ACCENT }}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Address</p>
                    <MapLink
                      address={data.address}
                      className="text-sm text-slate-400"
                    />
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: ACCENT_GLOW }}
                  >
                    <Phone
                      size={20}
                      weight="duotone"
                      style={{ color: ACCENT }}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Phone</p>
                    <PhoneLink
                      phone={data.phone}
                      className="text-sm text-slate-400"
                    />
                  </div>
                </div>
                {data.hours && (
                  <div className="flex items-start gap-4">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: ACCENT_GLOW }}
                    >
                      <Clock
                        size={20}
                        weight="duotone"
                        style={{ color: ACCENT }}
                      />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">Hours</p>
                      <p className="text-sm text-slate-400 whitespace-pre-line">
                        {data.hours}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <GlassCard className="p-8">
              <h3 className="text-xl font-semibold text-white mb-6">
                Request a Free Consultation
              </h3>
              <form
                className="space-y-4"
                onSubmit={(e) => e.preventDefault()}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-1.5">
                      First Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 focus:outline-none text-sm"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1.5">
                      Last Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 focus:outline-none text-sm"
                      placeholder="Doe"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">
                    Phone
                  </label>
                  <input
                    type="tel"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 focus:outline-none text-sm"
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">
                    Event Type
                  </label>
                  <select className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white focus:outline-none text-sm">
                    <option value="" className="bg-neutral-900">
                      Select an event type
                    </option>
                    {EVENT_TYPES.map((evt) => (
                      <option
                        key={evt.title}
                        value={evt.title
                          .toLowerCase()
                          .replace(/\s+/g, "-")}
                        className="bg-neutral-900"
                      >
                        {evt.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">
                    Tell Us About Your Event
                  </label>
                  <textarea
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 focus:outline-none text-sm resize-none"
                    placeholder="Date, guest count, venue ideas..."
                  />
                </div>
                <MagneticButton
                  className="w-full py-4 rounded-xl text-base font-semibold text-white flex items-center justify-center gap-2 cursor-pointer"
                  style={{ background: ACCENT } as React.CSSProperties}
                >
                  Send Request <ArrowRight size={18} weight="bold" />
                </MagneticButton>
              </form>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* ── 23. GUARANTEE ── */}
      <section className="relative z-10 py-16 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, #1a1a1a 0%, #0a0e18 100%)",
          }}
        />
        <ConfettiPattern opacity={0.015} accent={ACCENT} />
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <ShimmerBorder accent={ACCENT}>
            <div className="p-8 md:p-12">
              <ShieldCheck
                size={48}
                weight="fill"
                style={{ color: ACCENT }}
                className="mx-auto mb-4"
              />
              <h2 className="text-2xl md:text-4xl font-extrabold text-white mb-4">
                Our Promise to You
              </h2>
              <p className="text-slate-400 leading-relaxed max-w-2xl mx-auto text-lg">
                {data.businessName} is committed to making your event
                unforgettable. Fully insured, meticulously planned, and executed
                with passion.
              </p>
              <div className="flex flex-wrap justify-center gap-4 mt-8">
                {[
                  "Full Service Planning",
                  "Licensed & Insured",
                  "Free Consultations",
                  "Satisfaction Guaranteed",
                ].map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border"
                    style={{
                      color: ACCENT,
                      borderColor: `${ACCENT}33`,
                      background: `${ACCENT}0d`,
                    }}
                  >
                    <CheckCircle size={16} weight="fill" /> {item}
                  </span>
                ))}
              </div>
            </div>
          </ShimmerBorder>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="relative z-10 border-t border-white/8 py-10 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(180deg, #1a1a1a 0%, #111 100%)",
          }}
        />
        <ConfettiPattern opacity={0.015} accent={ACCENT} />
        <div className="mx-auto max-w-6xl px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Champagne
                  size={22}
                  weight="fill"
                  style={{ color: ACCENT }}
                />
                <span className="text-lg font-bold text-white">
                  {data.businessName}
                </span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">
                {data.about.length > 120
                  ? data.about.slice(0, 120).trim() + "..."
                  : data.about}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-3">
                Quick Links
              </h4>
              <div className="space-y-2">
                {["Services", "Events", "About", "Contact"].map((link) => (
                  <a
                    key={link}
                    href={`#${link.toLowerCase()}`}
                    className="block text-sm text-slate-500 hover:text-white transition-colors"
                  >
                    {link}
                  </a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-3">
                Contact
              </h4>
              <div className="space-y-2 text-sm text-slate-500">
                <p>
                  <PhoneLink phone={data.phone} />
                </p>
                <p>
                  <MapLink address={data.address} />
                </p>
                {data.socialLinks &&
                  Object.entries(data.socialLinks).map(([platform, url]) => (
                    <a
                      key={platform}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block hover:text-white transition-colors capitalize"
                    >
                      {platform}
                    </a>
                  ))}
              </div>
            </div>
          </div>
          <div className="border-t border-white/8 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Champagne
                size={14}
                weight="fill"
                style={{ color: ACCENT }}
              />
              <span>
                {data.businessName} &copy; {new Date().getFullYear()}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <BluejayLogo className="w-4 h-4" />
              <span>
                Created by{" "}
                <a
                  href="https://bluejayportfolio.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: "underline" }}
                >
                  bluejayportfolio.com
                </a>
              </span>
            </div>
          </div>
        </div>
      </footer>

      <ClaimBanner
        businessName={data.businessName}
        accentColor={ACCENT}
        prospectId={data.id}
      />
      <div className="h-14 md:h-28" />
    </main>
  );
}
