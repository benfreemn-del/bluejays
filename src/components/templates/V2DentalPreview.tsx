"use client";

/* eslint-disable @next/next/no-img-element -- These static marketing and preview components intentionally use plain img tags to preserve existing markup and visual behavior during lint-only cleanup. */
/* eslint-disable react-hooks/purity -- Decorative particle values are intentionally randomized for static visual effects in these marketing pages and previews; this preserves existing appearance without changing business logic. */

import { useState, useEffect, useRef, useCallback } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  AnimatePresence,
} from "framer-motion";
import {
  Tooth,
  Sparkle,
  ShieldCheck,
  Star,
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
  CaretDown,
  X,
  List,
  CurrencyDollar,
  Play,
  Timer,
  NavigationArrow,
  Eyeglasses,
  Monitor,
  Scan,
  Smiley,
} from "@phosphor-icons/react";
import type { GeneratedSiteData } from "@/lib/generator";
import BluejayLogo from "../BluejayLogo";
import { MapLink, PhoneLink } from "@/components/templates/MapLink";
import ClaimBanner from "@/components/ClaimBanner";
import { pickFromPool, pickGallery } from "@/lib/stock-image-picker";

/* ───────────────────────── SPRING CONFIGS ───────────────────────── */
const spring = { type: "spring" as const, stiffness: 100, damping: 20 };
const springFast = { type: "spring" as const, stiffness: 200, damping: 25 };

/* ───────────────────────── COLORS ───────────────────────── */
const SLATE = "#faf9f6";  /* warm off-white base — friendly, not clinical */
const DEFAULT_TEAL = "#0d9488";
const TEAL_LIGHT = "#14b8a6";

function getAccent(accentColor?: string) {
  const c = accentColor || DEFAULT_TEAL;
  return {
    TEAL: c,
    TEAL_GLOW: `${c}26`,
    TEAL_LIGHT,
  };
}

// Rotating palette for service tile iconography — the brand TEAL stays on
// section headers, CTAs, and structural accents. Each service card gets a
// different color so the grid feels alive.
const PALETTE = ["#0d9488", "#34d399", "#0ea5e9", "#a78bfa", "#fb7185", "#5eead4"];
const pickPaletteColor = (i: number) => PALETTE[i % PALETTE.length];

/* ───────────────────────── SERVICE ICON MAP ───────────────────────── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SERVICE_ICON_MAP: Record<string, any> = {
  cleaning: Sparkle,
  whitening: Sparkle,
  cosmetic: SmileyWink,
  implant: Tooth,
  crown: Tooth,
  emergency: FirstAidKit,
  orthodon: Syringe,
  braces: Syringe,
  pediatric: Heart,
  filling: Tooth,
  root: FirstAidKit,
  extraction: Syringe,
  veneer: SmileyWink,
  denture: Tooth,
  checkup: CalendarCheck,
  exam: CalendarCheck,
};

function getServiceIcon(serviceName: string) {
  const lower = serviceName.toLowerCase();
  for (const [key, Icon] of Object.entries(SERVICE_ICON_MAP)) {
    if (lower.includes(key)) return Icon;
  }
  return Tooth;
}

/* ───────────────────────── INSURANCE BADGES ───────────────────────── */
const INSURANCE_BADGES = [
  { icon: CheckCircle, label: "Most Insurance Accepted" },
  { icon: CurrencyDollar, label: "Flexible Payment Plans" },
  { icon: ShieldCheck, label: "CareCredit" },
  { icon: Heart, label: "In-House Savings Plan" },
];

/* ───────────────────────── PRICING CARDS ───────────────────────── */
const PRICING_CARDS = [
  { title: "Basic Cleaning", price: "$99", desc: "Professional cleaning, exam & polish", featured: false },
  { title: "Cosmetic Consult", price: "Free", desc: "Explore your smile transformation options", featured: true },
  { title: "Payment Plans", price: "From $49/mo", desc: "Flexible financing for any treatment", featured: false },
];

/* ───────────────────────── DENTAL TECHNOLOGY ───────────────────────── */
const DENTAL_TECH = [
  { icon: Scan, title: "Digital X-Rays", desc: "Up to 90% less radiation than traditional film" },
  { icon: Eyeglasses, title: "Intraoral Cameras", desc: "See exactly what we see in real time" },
  { icon: Sparkle, title: "Laser Dentistry", desc: "Minimally invasive, pain-free treatments" },
  { icon: Monitor, title: "3D Imaging", desc: "Precise treatment planning with CBCT technology" },
];

/* ───────────────────────── COMFORT FEATURES ───────────────────────── */
const COMFORT_FEATURES = [
  { icon: Smiley, title: "Sedation Options", desc: "Oral and nitrous oxide sedation available for anxious patients" },
  { icon: Heart, title: "Gentle Techniques", desc: "Our team is trained in the latest comfort-focused methods" },
  { icon: Monitor, title: "Warm Blankets & TV", desc: "Relax with Netflix, a warm blanket, and noise-canceling headphones" },
  { icon: Timer, title: "No-Rush Appointments", desc: "We take our time so you never feel hurried through care" },
];

/* ───────────────────────── COMPARISON ROWS ───────────────────────── */
const COMPARISON_ROWS = [
  { feature: "Same-Day Emergency", us: true, them: "Sometimes" },
  { feature: "Insurance Filing Help", us: true, them: "Varies" },
  { feature: "Sedation Available", us: true, them: "Sometimes" },
  { feature: "Evening/Weekend Hours", us: true, them: "Rarely" },
  { feature: "Digital X-Rays", us: true, them: "Sometimes" },
  { feature: "Payment Plans", us: true, them: "Varies" },
  { feature: "New Patient Specials", us: true, them: "Rarely" },
];

/* ───────────────────────── CHECKUP QUIZ OPTIONS ───────────────────────── */
const QUIZ_OPTIONS = [
  { label: "Less than 6 months", color: "#22c55e", bg: "#22c55e15", border: "#22c55e33", response: "Great! Keep up the good work." },
  { label: "6-12 months ago", color: "#f59e0b", bg: "#f59e0b15", border: "#f59e0b33", response: "Time to schedule your next visit!" },
  { label: "Over a year ago", color: "#ef4444", bg: "#ef444415", border: "#ef444433", response: "Don\u2019t wait \u2014 book today!" },
];

/* ───────────────────────── STOCK FALLBACK IMAGES (UNIQUE TO DENTAL) ───────────────────────── */
/* Dental-specific stock images — 5 hero, 5 about, 10 gallery (no cross-category overlap) */
const STOCK_HERO_POOL = [
  "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=1400&q=80",   // dental chair modern
  "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=1400&q=80",   // dentist with patient
  "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=1400&q=80",   // bright smile closeup
  "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=1400&q=80",   // patient smiling
  "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=1400&q=80",   // dental tools clean
];
const STOCK_ABOUT_POOL = [
  "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=600&q=80",    // dentist working
  "https://images.unsplash.com/photo-1598256989800-fe5f95da9787?w=600&q=80",    // dental team
  "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=600&q=80",    // patient smiling
  "https://images.unsplash.com/photo-1571772996211-2f02c9727629?w=600&q=80",    // dental exam
  "https://images.unsplash.com/photo-1629909615184-74f495363b67?w=600&q=80",    // modern operatory
];
const STOCK_GALLERY = [
  "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=600&q=80",    // smile
  "https://images.unsplash.com/photo-1598256989800-fe5f95da9787?w=600&q=80",    // team
  "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=600&q=80",    // patient
  "https://images.unsplash.com/photo-1571772996211-2f02c9727629?w=600&q=80",    // exam
  "https://images.unsplash.com/photo-1629909615184-74f495363b67?w=600&q=80",    // operatory
  "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=600&q=80",    // bright smile
  "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=600&q=80",    // tools
  "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=600&q=80",    // chair
  "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=600&q=80",    // dentist
  "https://images.unsplash.com/photo-1628771065518-0d82f1938462?w=600&q=80",    // whitening
];

/* ───────────────────────── FLOATING SPARKLE PARTICLES ───────────────────────── */
function FloatingSparkles({ accent }: { accent: string }) {
  const particles = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 8,
    duration: 6 + Math.random() * 6,
    size: 2 + Math.random() * 3,
    opacity: 0.15 + Math.random() * 0.35,
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
            background: accent,
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

/* ───────────────────────── ROTATING TOOTH SVG ───────────────────────── */
function RotatingTooth({ accent }: { accent: string }) {
  return (
    <motion.div
      className="relative flex items-center justify-center"
      animate={{ rotateY: [0, 360] }}
      transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
      style={{ perspective: 800, willChange: "transform" }}
    >
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle, ${accent}26 0%, transparent 70%)`,
          filter: "blur(30px)",
          willChange: "transform",
        }}
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      <svg viewBox="0 0 120 150" className="relative z-10 w-48 h-60 md:w-64 md:h-80" fill="none">
        <motion.path
          d="M60 10 C30 10, 10 30, 15 60 C18 75, 25 85, 30 100 C35 115, 38 135, 42 145 C44 148, 48 148, 50 145 C54 130, 56 115, 60 100 C64 115, 66 130, 70 145 C72 148, 76 148, 78 145 C82 135, 85 115, 90 100 C95 85, 102 75, 105 60 C110 30, 90 10, 60 10Z"
          stroke={accent}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2.5, ease: "easeInOut" }}
        />
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

/* ───────────────────────── DENTAL PATTERN SVG ───────────────────────── */
function DentalPattern({ opacity = 0.03, accent }: { opacity?: number; accent: string }) {
  const pid = `dentalPatPrev-${accent.replace("#", "")}`;
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }}>
      <defs>
        <pattern id={pid} width="60" height="60" patternUnits="userSpaceOnUse">
          <circle cx="30" cy="30" r="8" fill="none" stroke={accent} strokeWidth="0.5" />
          <circle cx="30" cy="30" r="2" fill={accent} opacity="0.3" />
          <path d="M10 10 L20 20 M50 10 L40 20 M10 50 L20 40 M50 50 L40 40" stroke={accent} strokeWidth="0.3" opacity="0.4" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${pid})`} />
    </svg>
  );
}

/* ───────────────────────── GLASS CARD ───────────────────────── */
function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-xl shadow-sm ${className}`}>
      {children}
    </div>
  );
}

/* ───────────────────────── MAGNETIC BUTTON ───────────────────────── */
function MagneticButton({ children, className = "", onClick, style, href }: {
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
  const isTouchDevice = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!ref.current || isTouchDevice) return;
      const rect = ref.current.getBoundingClientRect();
      x.set((e.clientX - rect.left - rect.width / 2) * 0.25);
      y.set((e.clientY - rect.top - rect.height / 2) * 0.25);
    },
    [x, y, isTouchDevice]
  );

  const handleMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  if (href) {
    return (
      <motion.a
        href={href}
        ref={ref as unknown as React.Ref<HTMLAnchorElement>}
        style={{ x: springX, y: springY, willChange: "transform", ...style }}
        onMouseMove={handleMouseMove as unknown as React.MouseEventHandler<HTMLAnchorElement>}
        onMouseLeave={handleMouseLeave}
        className={className}
        whileTap={{ scale: 0.97 }}
      >
        {children}
      </motion.a>
    );
  }

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
function ShimmerBorder({ children, className = "", accent }: { children: React.ReactNode; className?: string; accent: string }) {
  return (
    <div className={`relative rounded-2xl p-[1px] overflow-hidden ${className}`}>
      <motion.div
        className="absolute inset-0 rounded-2xl"
        style={{
          background: `conic-gradient(from 0deg, transparent, ${accent}, transparent, ${TEAL_LIGHT}, transparent)`,
          willChange: "transform",
        }}
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      />
      <div className="relative rounded-2xl bg-white z-10">{children}</div>
    </div>
  );
}

/* ───────────────────────── ACCORDION ITEM ───────────────────────── */
function AccordionItem({ question, answer, isOpen, onToggle }: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <GlassCard className="overflow-hidden">
      <button onClick={onToggle} className="w-full flex items-center justify-between p-5 md:p-6 text-left group cursor-pointer">
        <span className="text-lg font-semibold text-slate-900 pr-4">{question}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={spring}>
          <CaretDown size={20} className="text-slate-500 shrink-0" />
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
            <p className="px-5 pb-5 md:px-6 md:pb-6 text-slate-500 leading-relaxed">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
}

/* ───────────────────────── SECTION HEADER ───────────────────────── */
function SectionHeader({ badge, title, subtitle, accent }: {
  badge: string;
  title: string;
  subtitle?: string;
  accent: string;
}) {
  return (
    <div className="text-center mb-16">
      <span
        className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border"
        style={{ color: accent, borderColor: `${accent}33`, background: `${accent}0d` }}
      >
        {badge}
      </span>
      <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900">{title}</h2>
      <div className="h-0.5 w-16 mx-auto mt-4" style={{ background: `linear-gradient(to right, ${accent}, transparent)` }} />
      {subtitle && (
        <p className="text-slate-500 mt-4 max-w-2xl text-lg leading-relaxed mx-auto">{subtitle}</p>
      )}
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════════
   MAIN PREVIEW COMPONENT
   ═══════════════════════════════════════════════════════════════════ */
/* ───────────────────────── ANIMATED SECTION ───────────────────────── */
function AnimatedSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 1, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: "easeOut" as const }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function V2DentalPreview({ data }: { data: GeneratedSiteData }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [sliderPos, setSliderPos] = useState(50);
  const sliderRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const { TEAL, TEAL_GLOW } = getAccent(data.accentColor);

  /* Deduplicate scraped photos — ensure hero, card, and about are NEVER the same */
  const uniquePhotos = data.photos ? [...new Set(data.photos)] : [];
  const heroImage = uniquePhotos[0] || pickFromPool(STOCK_HERO_POOL, data.businessName);
  const heroCardImage = uniquePhotos[1] || pickFromPool(STOCK_ABOUT_POOL, data.businessName, 1);
  /* About MUST differ from BOTH hero and heroCard */
  const aboutImage = uniquePhotos[2]
    || (uniquePhotos[1] && uniquePhotos[1] !== uniquePhotos[0] ? undefined : undefined)
    || pickFromPool(STOCK_ABOUT_POOL, data.businessName, 3);
  const galleryImages = uniquePhotos.length > 2
    ? uniquePhotos.slice(2, 6)
    : pickGallery(STOCK_GALLERY, data.businessName);

  const phoneDigits = data.phone.replace(/\D/g, "");

  /* Before/After slider handlers */
  const handleSliderMove = useCallback((clientX: number) => {
    if (!sliderRef.current || !isDragging.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setSliderPos((x / rect.width) * 100);
  }, []);

  const handleMouseDown = useCallback(() => { isDragging.current = true; }, []);
  const handleMouseUp = useCallback(() => { isDragging.current = false; }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => handleSliderMove(e.clientX);
    const onTouchMove = (e: TouchEvent) => handleSliderMove(e.touches[0].clientX);
    const onUp = () => { isDragging.current = false; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onTouchMove);
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onUp);
    };
  }, [handleSliderMove]);

  const processSteps = [
    { step: "01", title: "Book Appointment", desc: "Schedule online or call us. We will find the perfect time for your visit." },
    { step: "02", title: "Comprehensive Exam", desc: "Our dentists perform a thorough evaluation using advanced digital imaging." },
    { step: "03", title: "Treatment Plan", desc: "We create a personalized plan that fits your needs, goals, and budget." },
    { step: "04", title: "Beautiful Results", desc: "Walk out with a healthier, more confident smile. We guarantee your satisfaction." },
  ];

  const faqs = [
    { q: `What dental services does ${data.businessName} offer?`, a: `We offer a comprehensive range of dental services including ${data.services.slice(0, 3).map(s => s.name).join(", ")}, and more. Contact us to schedule your consultation.` },
    { q: "Do you accept dental insurance?", a: "Yes, we accept most major dental insurance plans and offer flexible payment options including financing for larger treatments." },
    { q: "Is the first visit covered by insurance?", a: "Most insurance plans cover preventive visits including exams and cleanings at 80-100%. We verify your benefits before your appointment." },
    { q: "Do you offer emergency dental care?", a: `Yes. ${data.businessName} provides same-day emergency appointments for dental pain, broken teeth, and other urgent issues. Call us immediately if you have a dental emergency.` },
  ];

  /* Fallback testimonials */
  const fallbackTestimonials = [
    { name: "Sarah M.", text: "Best dental experience I've ever had. The whole team is gentle, professional, and thorough.", rating: 5 },
    { name: "David K.", text: "My kids actually look forward to their dental visits now. The staff is amazing with children.", rating: 5 },
    { name: "Laura P.", text: "Modern office, friendly team, and completely painless procedures. Finally found my forever dentist.", rating: 5 }
  ];
  const testimonials = data.testimonials?.length > 0 ? data.testimonials : fallbackTestimonials;

  return (
    <main
      className="relative min-h-[100dvh] overflow-x-hidden"
      style={{ fontFamily: "DM Sans, system-ui, sans-serif", background: SLATE, color: "#1c1917" }}
    >
      <FloatingSparkles accent={TEAL} />

      {/* ══════════════════ 1. NAV ══════════════════ */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-4">
          <GlassCard className="flex items-center justify-between px-4 md:px-6 py-3">
            <div className="flex items-center gap-2">
              <Tooth size={24} weight="fill" style={{ color: TEAL }} />
              <span className="text-lg font-bold tracking-tight text-slate-900">
                {data.businessName}
              </span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm text-slate-500">
              <a href="#services" className="hover:text-slate-900 transition-colors">Services</a>
              <a href="#about" className="hover:text-slate-900 transition-colors">About</a>
              <a href="#gallery" className="hover:text-slate-900 transition-colors">Gallery</a>
              <a href="#contact" className="hover:text-slate-900 transition-colors">Contact</a>
            </div>
            <div className="flex items-center gap-3">
              <MagneticButton
                className="px-4 md:px-5 py-2 rounded-full text-sm font-semibold text-slate-900 transition-colors cursor-pointer"
                style={{ background: TEAL } as React.CSSProperties}
              >
                Book Appointment
              </MagneticButton>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-slate-900 hover:bg-white/10 transition-colors"
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
                    { label: "Gallery", href: "#gallery" },
                    { label: "Contact", href: "#contact" },
                  ].map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-3 rounded-lg text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
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

      {/* ══════════════════ 2. HERO ══════════════════ */}
      <section className="relative min-h-[100dvh] flex items-center pt-24 z-10 overflow-hidden">
        {/* Clean white-dominant hero with subtle image peek */}
        <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-slate-50" />
        <div className="absolute right-0 top-0 w-1/2 h-full hidden lg:block">
          <img src={heroImage} alt="" className="w-full h-full object-cover" aria-hidden="true" />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent" />
        </div>
        <DentalPattern opacity={0.02} accent={TEAL} />

        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          <div className="space-y-8">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] px-4 py-2 rounded-full border mb-6" style={{ color: TEAL, borderColor: `${TEAL}33`, background: `${TEAL}0a` }}>
                <Sparkle size={14} weight="fill" />
                Award-Winning Dental Care
              </span>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-tight leading-[1.05] font-extrabold text-slate-900">
                {data.tagline}
              </h1>
            </div>
            <p className="text-lg text-slate-500 max-w-lg leading-relaxed">
              {data.about.length > 180 ? data.about.slice(0, 180).trim() + "..." : data.about}
            </p>
            <div className="flex flex-wrap gap-4">
              <MagneticButton
                className="px-8 py-4 rounded-full text-base font-semibold text-white flex items-center gap-2 cursor-pointer shadow-lg shadow-teal-500/25"
                style={{ background: TEAL } as React.CSSProperties}
              >
                Book Appointment
                <ArrowRight size={18} weight="bold" />
              </MagneticButton>
              <MagneticButton
                href={`tel:${phoneDigits}`}
                className="px-8 py-4 rounded-full text-base font-semibold text-slate-700 border border-slate-200 bg-white flex items-center gap-2 cursor-pointer shadow-sm hover:shadow-md transition-shadow"
              >
                <Phone size={18} weight="duotone" style={{ color: TEAL }} />
                <PhoneLink phone={data.phone} />
              </MagneticButton>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-slate-500">
              <span className="flex items-center gap-2">
                <MapPin size={16} weight="duotone" style={{ color: TEAL }} />
                <MapLink address={data.address} />
              </span>
              <span className="flex items-center gap-2">
                <Star size={16} weight="fill" className="text-amber-400" />
                {data.googleRating || "4.8"} Stars ({data.reviewCount || "100"}+ Reviews)
              </span>
            </div>
          </div>

          <div className="hidden lg:block relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-slate-900/10 border border-slate-100">
              <img src={heroCardImage} alt={`${data.businessName} team`} className="w-full h-[520px] object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
                <div className="flex items-center gap-3 px-4 py-2.5 rounded-full backdrop-blur-md bg-white/90 shadow-lg">
                  <div className="flex -space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} weight="fill" className="text-amber-400" />
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-slate-800">{data.googleRating || "4.8"} Rating</span>
                </div>
                <div className="px-4 py-2.5 rounded-full backdrop-blur-md bg-white/90 shadow-lg">
                  <span className="text-sm font-semibold text-slate-800">Accepting New Patients</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════ 3. STATS ══════════════════ */}
      <section className="relative z-10 py-16 overflow-hidden border-y" style={{ borderColor: `${TEAL}1a` }}>
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, #faf9f6 0%, ${TEAL}06 100%)` }} />
        <DentalPattern opacity={0.02} accent={TEAL} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] rounded-full blur-[180px]" style={{ background: `${TEAL}08` }} />
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
            {data.stats.map((stat, i) => {
              const statIcons = [Users, Sparkle, Heart, Star];
              const Icon = statIcons[i % statIcons.length];
              return (
                <div key={stat.label} className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Icon size={22} weight="fill" style={{ color: TEAL }} />
                    <span className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900">{stat.value}</span>
                  </div>
                  <span className="text-slate-500 text-sm font-medium tracking-wide uppercase">{stat.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════ NEW PATIENT SPECIAL BANNER ══════════════════ */}
      <section className="relative z-10 py-6 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${TEAL}15, ${TEAL}08)` }} />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0" style={{ background: `${TEAL}22`, border: `1px solid ${TEAL}33` }}>
                <Sparkle size={24} weight="fill" style={{ color: TEAL }} />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
                  New Patient Special: Exam, X-Rays &amp; Cleaning — <span style={{ color: TEAL }}>$99</span>
                </h3>
                <p className="text-sm text-slate-500">Limited availability this month — schedule now before spots fill up</p>
              </div>
            </div>
            <MagneticButton
              href={`tel:${phoneDigits}`}
              className="px-6 py-3 rounded-full text-sm font-bold text-white flex items-center gap-2 cursor-pointer shrink-0 shadow-lg"
              style={{ background: TEAL } as React.CSSProperties}
            >
              <Phone size={16} weight="bold" />
              Book Now
            </MagneticButton>
          </div>
        </div>
      </section>

      {/* ══════════════════ 4. SERVICES ══════════════════ */}
      <section id="services" className="relative z-10 py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, #faf9f6 0%, ${TEAL}08 50%, #faf9f6 100%)` }} />
        <DentalPattern accent={TEAL} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[10%] right-[5%] w-[500px] h-[500px] rounded-full blur-[160px]" style={{ background: `${TEAL}08` }} />
          <div className="absolute bottom-[10%] left-[5%] w-[400px] h-[400px] rounded-full blur-[140px]" style={{ background: `${TEAL_LIGHT}05` }} />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <AnimatedSection>
          <SectionHeader
            badge="Our Services"
            title="Comprehensive Dental Care"
            subtitle={`From routine cleanings to advanced cosmetic treatments, ${data.businessName} provides exceptional dental services for the whole family.`}
            accent={TEAL}
          />
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {data.services.map((service, i) => {
              const Icon = getServiceIcon(service.name);
              const tile = pickPaletteColor(i);
              return (
                <div
                  key={service.name}
                  className="group relative p-7 rounded-2xl border border-slate-200/60 hover:border-opacity-30 transition-all duration-500 overflow-hidden bg-white/60"
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: `radial-gradient(circle at 50% 0%, ${tile}22, transparent 70%)` }} />
                  <div className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `linear-gradient(to right, transparent, ${tile}66, transparent)` }} />
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-5">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 border"
                        style={{ background: `${tile}22`, borderColor: `${tile}55` }}
                      >
                        <Icon size={24} weight="duotone" style={{ color: tile }} />
                      </div>
                      <span className="text-xs font-mono" style={{ color: `${tile}99` }}>{String(i + 1).padStart(2, "0")}</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{service.name}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">{service.description || ""}</p>
                    {service.price && (
                      <p className="text-sm font-semibold mt-3" style={{ color: tile }}>{service.price}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════ INSURANCE ACCEPTED ══════════════════ */}
      <section className="relative z-10 py-16 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, #faf9f6 0%, #f5f0eb 50%, #faf9f6 100%)` }} />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">Affordable Care for Everyone</h2>
            <p className="text-slate-500 mt-2">We make it easy to get the dental care you deserve</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {INSURANCE_BADGES.map((badge) => (
              <GlassCard key={badge.label} className="p-5 text-center">
                <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ background: `${TEAL}15`, border: `1px solid ${TEAL}33` }}>
                  <badge.icon size={24} weight="duotone" style={{ color: TEAL }} />
                </div>
                <span className="text-sm font-semibold text-slate-900">{badge.label}</span>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ FINANCING / PAYMENT PLANS ══════════════════ */}
      <section className="relative z-10 py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, #faf9f6 0%, ${TEAL}06 50%, #faf9f6 100%)` }} />
        <DentalPattern opacity={0.02} accent={TEAL} />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
          <SectionHeader badge="Pricing" title="Transparent & Affordable" subtitle="No surprises — just honest pricing and flexible options to fit your budget." accent={TEAL} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PRICING_CARDS.map((card) => (
              <div key={card.title}>
                {card.featured ? (
                  <ShimmerBorder accent={TEAL}>
                    <div className="p-7 text-center">
                      <span className="inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full text-white mb-4" style={{ background: TEAL }}>Most Popular</span>
                      <h3 className="text-xl font-bold text-slate-900 mb-1">{card.title}</h3>
                      <p className="text-3xl font-extrabold mb-2" style={{ color: TEAL }}>{card.price}</p>
                      <p className="text-sm text-slate-500">{card.desc}</p>
                      <MagneticButton
                        href={`tel:${phoneDigits}`}
                        className="mt-6 w-full py-3 rounded-full text-sm font-bold text-white flex items-center justify-center gap-2 cursor-pointer"
                        style={{ background: TEAL } as React.CSSProperties}
                      >
                        <Phone size={16} weight="bold" />
                        Schedule Now
                      </MagneticButton>
                    </div>
                  </ShimmerBorder>
                ) : (
                  <GlassCard className="p-7 text-center h-full flex flex-col">
                    <h3 className="text-xl font-bold text-slate-900 mb-1">{card.title}</h3>
                    <p className="text-3xl font-extrabold mb-2" style={{ color: TEAL }}>{card.price}</p>
                    <p className="text-sm text-slate-500 flex-1">{card.desc}</p>
                    <MagneticButton
                      href={`tel:${phoneDigits}`}
                      className="mt-6 w-full py-3 rounded-full text-sm font-bold border flex items-center justify-center gap-2 cursor-pointer"
                      style={{ color: TEAL, borderColor: `${TEAL}33` } as React.CSSProperties}
                    >
                      <Phone size={16} weight="bold" />
                      Learn More
                    </MagneticButton>
                  </GlassCard>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ 5. WHY CHOOSE US / ABOUT ══════════════════ */}
      <section id="about" className="relative z-10 py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, #faf9f6 0%, #f5f0eb 50%, #faf9f6 100%)` }} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] left-[10%] w-[500px] h-[500px] rounded-full blur-[180px]" style={{ background: `${TEAL}06` }} />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="relative">
              <div className="rounded-2xl overflow-hidden border border-slate-200">
                <img src={aboutImage} alt={`${data.businessName} office`} className="w-full h-[400px] object-cover" />
              </div>
              <div className="absolute -bottom-4 -right-4 md:bottom-6 md:-right-6">
                <div className="px-5 py-3 rounded-xl backdrop-blur-md border text-white font-bold text-sm shadow-lg" style={{ background: `${TEAL}e6`, borderColor: `${TEAL}80` }}>
                  {data.stats[0] ? `${data.stats[0].value} ${data.stats[0].label}` : "Trusted Dental Care"}
                </div>
              </div>
            </div>

            <div>
              <span
                className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border"
                style={{ color: TEAL, borderColor: `${TEAL}33`, background: `${TEAL}0d` }}
              >
                Why Choose Us
              </span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6 text-slate-900">
                Your Smile Deserves the Best
              </h2>
              <p className="text-slate-500 leading-relaxed mb-8">
                {data.about}
              </p>

              <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4">
                {[
                  { icon: ShieldCheck, label: "Certified Dentists" },
                  { icon: Sparkle, label: "Modern Technology" },
                  { icon: Star, label: "5-Star Reviews" },
                  { icon: Heart, label: "Gentle Approach" },
                ].map((badge) => (
                  <GlassCard key={badge.label} className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: TEAL_GLOW }}>
                      <badge.icon size={20} weight="duotone" style={{ color: TEAL }} />
                    </div>
                    <span className="text-sm font-semibold text-slate-900">{badge.label}</span>
                  </GlassCard>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════ SMILE TRANSFORMATION BEFORE/AFTER ══════════════════ */}
      <section className="relative z-10 py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, #faf9f6 0%, ${TEAL}06 50%, #faf9f6 100%)` }} />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
          <SectionHeader badge="Transformations" title="Smile Makeover Results" subtitle="Real results from cosmetic dental treatments — the confidence boost is priceless." accent={TEAL} />
          <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-lg">
            <img src="/images/dental-before-after.png" alt="Smile transformation before and after" className="w-full h-auto" />
            <div className="absolute bottom-0 left-0 right-0 flex">
              <div className="flex-1 py-3 text-center bg-slate-800/80 backdrop-blur-sm border-r border-white/15">
                <span className="text-sm font-bold text-white">Before</span>
              </div>
              <div className="flex-1 py-3 text-center backdrop-blur-sm" style={{ background: `${TEAL}cc` }}>
                <span className="text-sm font-bold text-white">After</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════ PATIENT COMFORT ══════════════════ */}
      <section className="relative z-10 py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, #f5f0eb 0%, #faf9f6 50%, #f5f0eb 100%)` }} />
        <DentalPattern opacity={0.02} accent={TEAL} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[30%] right-[10%] w-[500px] h-[500px] rounded-full blur-[180px]" style={{ background: `${TEAL}06` }} />
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <SectionHeader badge="Your Comfort" title="We Know Dental Anxiety Is Real" subtitle="That's why we've designed every part of your experience around your comfort and peace of mind." accent={TEAL} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {COMFORT_FEATURES.map((feat) => (
              <GlassCard key={feat.title} className="p-6 flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${TEAL}15`, border: `1px solid ${TEAL}33` }}>
                  <feat.icon size={24} weight="duotone" style={{ color: TEAL }} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">{feat.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{feat.desc}</p>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ 6. PROCESS ══════════════════ */}
      <section className="relative z-10 py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, #faf9f6 0%, ${TEAL}08 50%, #faf9f6 100%)` }} />
        <DentalPattern opacity={0.025} accent={TEAL} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] rounded-full blur-[180px]" style={{ background: `${TEAL_LIGHT}06` }} />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <AnimatedSection>          <SectionHeader badge="Our Process" title="Your Visit, Step by Step" accent={TEAL} /></AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {processSteps.map((step, i) => (
              <div key={step.step} className="relative">
                {i < processSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-10 left-[calc(50%+40px)] w-[calc(100%-80px)] h-px" style={{ background: `linear-gradient(to right, ${TEAL}33, ${TEAL}11)` }} />
                )}
                <GlassCard className="p-6 text-center relative">
                  <div
                    className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-black"
                    style={{ background: `linear-gradient(135deg, ${TEAL}22, ${TEAL}0a)`, color: TEAL, border: `1px solid ${TEAL}33` }}
                  >
                    {step.step}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
                </GlassCard>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ DENTAL TECHNOLOGY ══════════════════ */}
      <section className="relative z-10 py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, #faf9f6 0%, ${TEAL}06 50%, #faf9f6 100%)` }} />
        <DentalPattern opacity={0.02} accent={TEAL} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-[20%] left-[15%] w-[500px] h-[500px] rounded-full blur-[180px]" style={{ background: `${TEAL}06` }} />
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <SectionHeader badge="Technology" title="Advanced Dental Technology" subtitle="We invest in the latest technology so you get faster, more comfortable, and more precise care." accent={TEAL} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {DENTAL_TECH.map((tech) => (
              <GlassCard key={tech.title} className="p-6 text-center group hover:shadow-md transition-all duration-300">
                <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center transition-all duration-300" style={{ background: `${TEAL}15`, border: `1px solid ${TEAL}33` }}>
                  <tech.icon size={28} weight="duotone" style={{ color: TEAL }} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{tech.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{tech.desc}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ COMPETITOR COMPARISON TABLE ══════════════════ */}
      <section className="relative z-10 py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, #f5f0eb 0%, #faf9f6 50%, #f5f0eb 100%)` }} />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
          <SectionHeader badge="Why Us" title={`${data.businessName} vs Average Dental Office`} accent={TEAL} />
          <GlassCard className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr style={{ background: `${TEAL}0d` }}>
                    <th className="px-6 py-4 text-sm font-semibold text-slate-900">Feature</th>
                    <th className="px-6 py-4 text-sm font-semibold text-center" style={{ color: TEAL }}>{data.businessName}</th>
                    <th className="px-6 py-4 text-sm font-semibold text-slate-400 text-center">Average Office</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_ROWS.map((row, i) => (
                    <tr key={row.feature} className={i % 2 === 0 ? "bg-white/40" : "bg-white/20"}>
                      <td className="px-6 py-4 text-sm text-slate-700 font-medium">{row.feature}</td>
                      <td className="px-6 py-4 text-center">
                        <CheckCircle size={22} weight="fill" style={{ color: TEAL }} className="mx-auto" />
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-slate-400">{row.them}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* ══════════════════ VIDEO TOUR PLACEHOLDER ══════════════════ */}
      <section className="relative z-10 py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, #faf9f6 0%, ${TEAL}06 50%, #faf9f6 100%)` }} />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
          <SectionHeader badge="Virtual Tour" title="Take a Look Around" subtitle={`See why patients love the ${data.businessName} experience.`} accent={TEAL} />
          <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-lg group cursor-pointer" style={{ aspectRatio: "16/9" }}>
            <img
              src={galleryImages[0] || heroImage}
              alt={`${data.businessName} office tour`}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors duration-300" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full flex items-center justify-center bg-white/90 shadow-xl group-hover:scale-110 transition-transform duration-300">
                <Play size={36} weight="fill" style={{ color: TEAL }} className="ml-1" />
              </div>
            </div>
            <div className="absolute bottom-6 left-6">
              <p className="text-white text-lg font-bold">Virtual Office Tour</p>
              <p className="text-white/70 text-sm">2 min walkthrough</p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════ 7. GALLERY ══════════════════ */}
      <section id="gallery" className="relative z-10 py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, #faf9f6 0%, #f5f0eb 50%, #faf9f6 100%)` }} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[30%] left-[20%] w-[500px] h-[500px] rounded-full blur-[200px]" style={{ background: `${TEAL}06` }} />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <AnimatedSection>          <SectionHeader badge="Our Practice" title="See Our Modern Facility" accent={TEAL} /></AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {galleryImages.map((src, i) => {
              const titles = ["State-of-the-Art Treatment Room", "Comfortable Patient Lounge", "Digital Imaging Suite", "Family-Friendly Reception"];
              return (
                <div key={i} className="group relative rounded-2xl overflow-hidden border border-slate-200 hover:shadow-lg transition-all duration-500">
                  <img src={src} alt={titles[i] || `Gallery ${i + 1}`} className="w-full h-64 object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-lg font-bold text-white mb-1">{titles[i] || `Gallery ${i + 1}`}</h3>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════ 8. TESTIMONIALS ══════════════════ */}
      <section className="relative z-10 py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, #faf9f6 0%, ${TEAL}08 50%, #faf9f6 100%)` }} />
        <DentalPattern opacity={0.02} accent={TEAL} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] right-[15%] w-[400px] h-[400px] rounded-full blur-[160px]" style={{ background: `${TEAL}06` }} />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          {/* Google Reviews Header */}
          <div className="text-center mb-4">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border bg-white/80 backdrop-blur-sm shadow-sm" style={{ borderColor: `${TEAL}33` }}>
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={18} weight="fill" className="text-amber-400" />
                ))}
              </div>
              <span className="text-sm font-bold text-slate-900">{data.googleRating || "4.9"}</span>
              <span className="text-sm text-slate-500">from {data.reviewCount || "200"}+ Google Reviews</span>
            </div>
          </div>
          <AnimatedSection>          <SectionHeader badge="Testimonials" title="What Our Patients Say" accent={TEAL} /></AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <GlassCard key={i} className="p-6 h-full flex flex-col">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.rating || 5 }).map((_, j) => (
                    <Star key={j} size={16} weight="fill" style={{ color: TEAL }} />
                  ))}
                </div>
                <p className="text-slate-600 leading-relaxed flex-1 text-sm mb-4">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="pt-4 border-t border-white/8 flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-900">{t.name}</span>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ CHECKUP QUIZ ══════════════════ */}
      <section className="relative z-10 py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, #f5f0eb 0%, #faf9f6 50%, #f5f0eb 100%)` }} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[30%] left-[20%] w-[400px] h-[400px] rounded-full blur-[180px]" style={{ background: `${TEAL}06` }} />
        </div>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          <SectionHeader badge="Quick Check" title="When Was Your Last Checkup?" subtitle="Regular dental visits prevent small problems from becoming big ones." accent={TEAL} />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {QUIZ_OPTIONS.map((opt, i) => (
              <button
                key={opt.label}
                onClick={() => setQuizAnswer(i)}
                className="p-6 rounded-2xl border-2 text-center transition-all duration-300 cursor-pointer hover:shadow-md"
                style={{
                  background: quizAnswer === i ? opt.bg : "rgba(255,255,255,0.8)",
                  borderColor: quizAnswer === i ? opt.color : "#e2e8f0",
                }}
              >
                <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ background: opt.bg, border: `1px solid ${opt.border}` }}>
                  <CalendarCheck size={24} weight="duotone" style={{ color: opt.color }} />
                </div>
                <p className="text-sm font-bold text-slate-900 mb-1">{opt.label}</p>
                {quizAnswer === i && (
                  <p className="text-sm font-semibold mt-2" style={{ color: opt.color }}>{opt.response}</p>
                )}
              </button>
            ))}
          </div>
          {quizAnswer !== null && (
            <div className="mt-8">
              <MagneticButton
                href={`tel:${phoneDigits}`}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-base font-bold text-white cursor-pointer shadow-lg"
                style={{ background: TEAL } as React.CSSProperties}
              >
                <Phone size={18} weight="bold" />
                Schedule Your Visit Today
              </MagneticButton>
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════ 9. NEW PATIENT CTA ══════════════════ */}
      <section className="relative z-10 py-20 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${TEAL}, ${TEAL}cc, ${TEAL})` }} />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='40' height='40' fill='none'/%3E%3Cpath d='M0 0L40 40M40 0L0 40' stroke='%23000' stroke-width='0.5'/%3E%3C/svg%3E\")" }} />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          <SmileyWink size={48} weight="fill" className="mx-auto mb-6 text-slate-900/80" />
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 mb-4">
            New Patients Welcome
          </h2>
          <p className="text-lg text-slate-900/80 mb-8 max-w-xl mx-auto">
            We are accepting new patients of all ages. Schedule your first visit today and experience the {data.businessName} difference.
          </p>
          <PhoneLink
            phone={data.phone}
            className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-white font-bold text-lg hover:bg-white/90 transition-colors"
          >
            <Phone size={20} weight="bold" />
            {data.phone}
          </PhoneLink>
        </div>
      </section>

      {/* ══════════════════ 10. SERVICE AREAS ══════════════════ */}
      <section className="relative z-10 py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, #faf9f6 0%, #f5f0eb 50%, #faf9f6 100%)` }} />
        <DentalPattern opacity={0.02} accent={TEAL} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[40%] right-[20%] w-[400px] h-[400px] rounded-full blur-[180px]" style={{ background: `${TEAL_LIGHT}06` }} />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <AnimatedSection>          <SectionHeader badge="Location" title="Conveniently Located" accent={TEAL} /></AnimatedSection>

          <div className="text-center">
            <GlassCard className="p-8 inline-block">
              <div className="flex items-center gap-3 text-lg">
                <MapPin size={24} weight="duotone" style={{ color: TEAL }} />
                <MapLink address={data.address} className="text-slate-900 font-semibold" />
              </div>
              <p className="text-slate-500 text-sm mt-2">Serving families throughout the area</p>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* ══════════════════ 11. HOURS ══════════════════ */}
      {data.hours && (
        <section className="relative z-10 py-16 md:py-24 overflow-hidden">
          <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, #faf9f6 0%, ${TEAL}08 50%, #faf9f6 100%)` }} />
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-[20%] left-[15%] w-[400px] h-[400px] rounded-full blur-[160px]" style={{ background: `${TEAL}06` }} />
          </div>

          <div className="max-w-3xl mx-auto px-4 sm:px-6 relative z-10">
            <AnimatedSection>          <SectionHeader badge="Office Hours" title="When We Are Available" accent={TEAL} /></AnimatedSection>
            <div className="text-center">
              <ShimmerBorder accent={TEAL}>
                <div className="p-8">
                  <Clock size={32} weight="duotone" style={{ color: TEAL }} className="mx-auto mb-4" />
                  <p className="text-slate-600 leading-relaxed whitespace-pre-line text-lg">{data.hours}</p>
                  <p className="text-sm mt-4 font-semibold" style={{ color: TEAL }}>Same-Day Emergency Appointments Available</p>
                </div>
              </ShimmerBorder>
            </div>
          </div>
        </section>
      )}

      
      {/* ══════════════════ MID-PAGE CTA ══════════════════ */}
      <section className="relative z-10 py-12 sm:py-16 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${TEAL}15, ${TEAL}08)` }} />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: TEAL }}>
            Don&apos;t Miss Out
          </p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 mb-3">
            Ready to Get Started?
          </h2>
          <p className="text-slate-500 mb-6 text-sm sm:text-base">
            Limited time — claim your free professional website today before it&apos;s offered to a competitor.
          </p>
          <a
            href={`/claim/${data.id}`}
            className="inline-flex items-center gap-2 min-h-[48px] px-8 py-3 rounded-full text-slate-900 font-bold text-base hover:shadow-lg transition-all duration-300"
            style={{ background: TEAL }}
          >
            Claim This Website
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </a>
        </div>
      </section>

      {/* ══════════════════ 12. FAQ ══════════════════ */}
      <section className="relative z-10 py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, #faf9f6 0%, ${TEAL}08 50%, #faf9f6 100%)` }} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] left-[15%] w-[400px] h-[400px] rounded-full blur-[160px]" style={{ background: `${TEAL}06` }} />
        </div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 relative z-10">
          <AnimatedSection>          <SectionHeader badge="FAQ" title="Common Questions" accent={TEAL} /></AnimatedSection>

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

      {/* ══════════════════ 13. CONTACT ══════════════════ */}
      <section id="contact" className="relative z-10 py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, #faf9f6 0%, #f5f0eb 50%, #faf9f6 100%)` }} />
        <DentalPattern opacity={0.02} accent={TEAL} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] rounded-full blur-[180px]" style={{ background: `${TEAL}06` }} />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <span
                className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border"
                style={{ color: TEAL, borderColor: `${TEAL}33`, background: `${TEAL}0d` }}
              >
                Contact Us
              </span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6 text-slate-900">
                Schedule Your Visit
              </h2>
              <p className="text-slate-500 leading-relaxed mb-8">
                Ready for a brighter, healthier smile? Contact {data.businessName} today to schedule your appointment. We look forward to welcoming you.
              </p>

              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: TEAL_GLOW }}>
                    <MapPin size={20} weight="duotone" style={{ color: TEAL }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Address</p>
                    <MapLink address={data.address} className="text-sm text-slate-500" />
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: TEAL_GLOW }}>
                    <Phone size={20} weight="duotone" style={{ color: TEAL }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Phone</p>
                    <PhoneLink phone={data.phone} className="text-sm text-slate-500" />
                  </div>
                </div>
                {data.hours && (
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: TEAL_GLOW }}>
                      <Clock size={20} weight="duotone" style={{ color: TEAL }} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Hours</p>
                      <p className="text-sm text-slate-500 whitespace-pre-line">{data.hours}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <GlassCard className="p-8">
              <h3 className="text-xl font-semibold text-slate-900 mb-6">Request an Appointment</h3>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-500 mb-1.5">First Name</label>
                    <input type="text" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none transition-colors text-sm" placeholder="John" />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-500 mb-1.5">Last Name</label>
                    <input type="text" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none transition-colors text-sm" placeholder="Doe" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-slate-500 mb-1.5">Phone</label>
                  <input type="tel" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none transition-colors text-sm" placeholder="(555) 123-4567" />
                </div>
                <div>
                  <label className="block text-sm text-slate-500 mb-1.5">Service Needed</label>
                  <select className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none transition-colors text-sm">
                    <option value="" className="bg-white">Select a service</option>
                    {data.services.map((s) => (
                      <option key={s.name} value={s.name.toLowerCase().replace(/\s+/g, "-")} className="bg-white">
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-500 mb-1.5">Message</label>
                  <textarea rows={4} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none transition-colors text-sm resize-none" placeholder="Tell us about your dental needs..." />
                </div>
                <MagneticButton
                  className="w-full py-4 rounded-xl text-base font-semibold text-white flex items-center justify-center gap-2 cursor-pointer"
                  style={{ background: TEAL } as React.CSSProperties}
                >
                  Request Appointment
                  <ArrowRight size={18} weight="bold" />
                </MagneticButton>
              </form>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* ══════════════════ 14. GUARANTEE / TRUST ══════════════════ */}
      <section className="relative z-10 py-16 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, #faf9f6 0%, ${TEAL}06 100%)` }} />
        <DentalPattern opacity={0.015} accent={TEAL} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full blur-[180px]" style={{ background: `${TEAL}06` }} />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          <ShimmerBorder accent={TEAL}>
            <div className="p-8 md:p-12">
              <ShieldCheck size={48} weight="fill" style={{ color: TEAL }} className="mx-auto mb-4" />
              <h2 className="text-2xl md:text-4xl font-extrabold text-slate-900 mb-4">Our Patient Promise</h2>
              <p className="text-slate-500 leading-relaxed max-w-2xl mx-auto text-lg">
                At {data.businessName}, your comfort and satisfaction are our top priorities. We stand behind every treatment with our patient satisfaction guarantee and use only the highest quality materials.
              </p>
              <div className="flex flex-wrap justify-center gap-4 mt-8">
                {["Gentle Care", "Modern Technology", "Insurance Accepted", "Same-Day Emergency"].map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border"
                    style={{ color: TEAL, borderColor: `${TEAL}33`, background: `${TEAL}0d` }}
                  >
                    <CheckCircle size={16} weight="fill" />
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </ShimmerBorder>
        </div>
      </section>

      {/* ══════════════════ 15. FOOTER ══════════════════ */}
      <footer className="relative z-10 border-t border-white/8 py-10 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, #faf9f6 0%, #f0ede8 100%)` }} />
        <DentalPattern opacity={0.015} accent={TEAL} />
        <div className="mx-auto max-w-6xl px-4 sm:px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Tooth size={22} weight="fill" style={{ color: TEAL }} />
                <span className="text-lg font-bold text-slate-900">{data.businessName}</span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">
                {data.about.length > 120 ? data.about.slice(0, 120).trim() + "..." : data.about}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-3">Quick Links</h4>
              <div className="space-y-2">
                {["Services", "About", "Gallery", "Contact"].map((link) => (
                  <a key={link} href={`#${link.toLowerCase()}`} className="block text-sm text-slate-500 hover:text-slate-900 transition-colors">
                    {link}
                  </a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-3">Contact</h4>
              <div className="space-y-2 text-sm text-slate-500">
                <p><PhoneLink phone={data.phone} /></p>
                <p><MapLink address={data.address} /></p>
                {data.socialLinks && Object.entries(data.socialLinks).map(([platform, url]) => (
                  <a key={platform} href={url} target="_blank" rel="noopener noreferrer" className="block hover:text-slate-900 transition-colors capitalize">
                    {platform}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-white/8 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Tooth size={14} weight="fill" style={{ color: TEAL }} />
              <span>{data.businessName} &copy; {new Date().getFullYear()}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <span className="flex items-center gap-1.5"><BluejayLogo size={14} className="text-sky-500" /> Created by <a href="https://bluejayportfolio.com" target="_blank" rel="noopener noreferrer" style={{textDecoration:"underline"}}>bluejayportfolio.com</a></span>
            </div>
          </div>
        </div>
      </footer>

      <ClaimBanner businessName={data.businessName} accentColor={TEAL} prospectId={data.id} />
      <div className="h-14 md:h-28" />
    </main>
  );
}
