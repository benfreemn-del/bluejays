"use client";

/* eslint-disable @next/next/no-img-element -- These static marketing and preview components intentionally use plain img tags to preserve existing markup and visual behavior during lint-only cleanup. */
/* eslint-disable react-hooks/purity -- Decorative particle values are intentionally randomized for static visual effects in these marketing pages and previews; this preserves existing appearance without changing business logic. */
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import {
  Drop,
  Waves,
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
  Wrench,
  Broom,
  Leaf,
  SealCheck,
  CalendarBlank,
  ThumbsUp,
  Lightning,
  Users,
  PlayCircle,
  Quotes,
} from "@phosphor-icons/react";
import type { GeneratedSiteData } from "@/lib/generator";
import BluejayLogo from "../BluejayLogo";
import { MapLink, PhoneLink } from "@/components/templates/MapLink";
import ClaimBanner from "@/components/ClaimBanner";
import { pickFromPool, pickGallery } from "@/lib/stock-image-picker";

/* ─── CONSTANTS ─── */
const spring = { type: "spring" as const, stiffness: 100, damping: 20 };
const springFast = { type: "spring" as const, stiffness: 200, damping: 25 };
const CHARCOAL = "#1a1a1a";
const DEFAULT_ORANGE = "#ea580c";
const AMBER = "#f59e0b";
const CYAN_ACCENT = "#06b6d4";

function getAccent(accentColor?: string) {
  const c = accentColor || DEFAULT_ORANGE;
  return { ACCENT: c, ACCENT_GLOW: `${c}26`, AMBER, CYAN: CYAN_ACCENT };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SERVICE_ICON_MAP: Record<string, any> = {
  driveway: HouseLine,
  house: HouseLine,
  home: HouseLine,
  residential: HouseLine,
  commercial: Buildings,
  roof: HouseLine,
  deck: HouseLine,
  fence: HouseLine,
  concrete: HouseLine,
  gutter: Broom,
  soft: Drop,
  power: Drop,
  pressure: Drop,
  clean: Broom,
  wash: Drop,
  fleet: Buildings,
  building: Buildings,
  restore: Wrench,
  patio: HouseLine,
  sidewalk: HouseLine,
  siding: HouseLine,
};
function getServiceIcon(serviceName: string) {
  const lower = serviceName.toLowerCase();
  for (const [key, Icon] of Object.entries(SERVICE_ICON_MAP)) {
    if (lower.includes(key)) return Icon;
  }
  return Drop;
}

const STOCK_HERO_POOL = [
  "https://images.unsplash.com/photo-1523413555809-0fb1d4da238d?w=1400&q=80",
  "https://images.unsplash.com/photo-1582559934353-2e47140e7501?w=1400&q=80",
];
const STOCK_ABOUT_POOL = [
  "https://images.unsplash.com/photo-1528238646472-f2366160b6c1?w=600&q=80",
  "https://images.unsplash.com/photo-1580397581145-cdb6a35b7d3f?w=600&q=80",
];
const STOCK_GALLERY = [
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&q=80",
  "https://images.unsplash.com/photo-1580397581145-cdb6a35b7d3f?w=600&q=80",
  "https://images.unsplash.com/photo-1615529162924-f8605388461d?w=600&q=80",
  "https://images.unsplash.com/photo-1599619351208-3e6c839d6828?w=600&q=80",
  "https://images.unsplash.com/photo-1550358864-518f202c02ba?w=600&q=80",
  "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=600&q=80",
  "https://images.unsplash.com/photo-1528238646472-f2366160b6c1?w=600&q=80",
  "https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=600&q=80",
];

/* ─── SURFACE TYPES ─── */
const SURFACE_TYPES = [
  { name: "Driveways & Walkways", icon: HouseLine, psi: "3,000+", desc: "Concrete and paver restoration" },
  { name: "House Siding", icon: HouseLine, psi: "1,500", desc: "Soft wash for vinyl, wood & stucco" },
  { name: "Decks & Patios", icon: HouseLine, psi: "1,200", desc: "Wood, composite & stone surfaces" },
  { name: "Roofs", icon: HouseLine, psi: "Soft Wash", desc: "Gentle algae & moss removal" },
  { name: "Fences", icon: HouseLine, psi: "2,000", desc: "Wood, vinyl & metal restoration" },
  { name: "Commercial", icon: Buildings, psi: "4,000+", desc: "Storefronts, parking & loading zones" },
];

/* ─── COMPARISON TABLE ─── */
const COMPARISON_ROWS = [
  { feature: "Commercial-Grade Equipment", us: true, them: "Sometimes" },
  { feature: "Eco-Friendly Solutions", us: true, them: "Rarely" },
  { feature: "Licensed & Insured", us: true, them: "Varies" },
  { feature: "Free On-Site Estimates", us: true, them: "No" },
  { feature: "Surface-Specific PSI", us: true, them: "One Size Fits All" },
  { feature: "Satisfaction Guarantee", us: true, them: "No" },
  { feature: "Same-Week Scheduling", us: true, them: "2-3 Weeks" },
];

/* ─── ECO CLEANERS ─── */
const ECO_FEATURES = [
  { title: "Biodegradable Solutions", desc: "Plant-based formulas that break down safely in the environment." },
  { title: "Safe for Landscaping", desc: "Our products protect your plants, lawn, and garden beds." },
  { title: "Pet & Family Friendly", desc: "Non-toxic treatments safe for kids and pets after drying." },
  { title: "EPA Compliant", desc: "All solutions meet or exceed environmental safety standards." },
];

/* ─── PARTICLES ─── */
function FloatingParticles({ accent }: { accent: string }) {
  const particles = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 8,
    duration: 5 + Math.random() * 7,
    size: 2 + Math.random() * 3,
    opacity: 0.12 + Math.random() * 0.25,
    isAmber: Math.random() > 0.6,
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
            background: p.isAmber ? AMBER : accent,
            willChange: "transform, opacity",
          }}
          animate={{
            y: ["-10vh", "110vh"],
            opacity: [0, p.opacity, p.opacity, 0],
          }}
          transition={{
            y: { duration: p.duration, repeat: Infinity, delay: p.delay, ease: "linear" },
            opacity: { duration: p.duration, repeat: Infinity, delay: p.delay, times: [0, 0.1, 0.9, 1] },
          }}
        />
      ))}
    </div>
  );
}

function WaterSprayPattern({ opacity = 0.03, accent }: { opacity?: number; accent: string }) {
  const patternId = `waterSprayV2PW-${accent.replace("#", "")}`;
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }}>
      <defs>
        <pattern id={patternId} width="80" height="80" patternUnits="userSpaceOnUse">
          <circle cx="20" cy="20" r="3" fill={accent} opacity="0.2" />
          <circle cx="25" cy="15" r="1.5" fill={accent} opacity="0.3" />
          <circle cx="15" cy="25" r="2" fill={AMBER} opacity="0.15" />
          <circle cx="60" cy="50" r="2.5" fill={accent} opacity="0.2" />
          <circle cx="55" cy="55" r="1" fill={AMBER} opacity="0.25" />
          <circle cx="40" cy="70" r="2" fill={accent} opacity="0.15" />
          <circle cx="70" cy="30" r="1.5" fill={accent} opacity="0.2" />
          <path d="M30 40 Q35 35 40 40" fill="none" stroke={accent} strokeWidth="0.5" opacity="0.2" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  );
}

function WaterStreamBackground({ opacity = 0.03, accent }: { opacity?: number; accent: string }) {
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
        stroke={AMBER}
        strokeWidth="1.5"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      />
      <motion.path
        d="M850 0 Q870 100 850 200 Q830 300 850 400"
        fill="none"
        stroke={accent}
        strokeWidth="1"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
    </svg>
  );
}

/* ─── SHARED UI COMPONENTS ─── */
function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
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
    typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!ref.current || isTouchDevice) return;
      const rect = ref.current.getBoundingClientRect();
      x.set((e.clientX - (rect.left + rect.width / 2)) * 0.25);
      y.set((e.clientY - (rect.top + rect.height / 2)) * 0.25);
    },
    [x, y, isTouchDevice],
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
        onMouseMove={handleMouseMove as unknown as React.MouseEventHandler<HTMLAnchorElement>}
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
    <div className={`relative rounded-2xl p-[1px] overflow-hidden ${className}`}>
      <motion.div
        className="absolute inset-0 rounded-2xl"
        style={{
          background: `conic-gradient(from 0deg, transparent, ${accent}, transparent, ${AMBER}, transparent)`,
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
        <span className="text-lg font-semibold text-white pr-4">{question}</span>
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
            <p className="px-5 pb-5 md:px-6 md:pb-6 text-slate-400 leading-relaxed">{answer}</p>
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
        style={{ color: accent, borderColor: `${accent}33`, background: `${accent}0d` }}
      >
        {badge}
      </span>
      <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white">{title}</h2>
      <div
        className="h-0.5 w-16 mx-auto mt-4"
        style={{ background: `linear-gradient(to right, ${accent}, transparent)` }}
      />
      {subtitle && (
        <p className="text-slate-400 mt-4 max-w-2xl text-lg leading-relaxed mx-auto">{subtitle}</p>
      )}
    </div>
  );
}

function AnimatedSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 1, scale: 0.92 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, ease: "easeOut" as const }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════ */
export default function V2PressureWashingPreview({ data }: { data: GeneratedSiteData }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [quizAnswer, setQuizAnswer] = useState<string | null>(null);
  const { ACCENT, ACCENT_GLOW } = getAccent(data.accentColor);
  const uniquePhotos = data.photos ? [...new Set(data.photos)] : [];
  const heroImage = uniquePhotos[0] || pickFromPool(STOCK_HERO_POOL, data.businessName);
  const heroCardImage = uniquePhotos[1] || pickFromPool(STOCK_ABOUT_POOL, data.businessName, 1);
  const aboutImage = uniquePhotos[2] || pickFromPool(STOCK_ABOUT_POOL, data.businessName, 2);
  const galleryImages =
    data.photos?.length > 3 ? data.photos.slice(2, 6) : pickGallery(STOCK_GALLERY, data.businessName);
  const phoneDigits = data.phone.replace(/\D/g, "");

  const processSteps = [
    { step: "01", title: "Free Assessment", desc: "We evaluate your surfaces and recommend the right cleaning approach for optimal results." },
    { step: "02", title: "Clear Quote", desc: "Receive a detailed, no-surprise estimate covering the full scope of work." },
    { step: "03", title: "Pro Cleaning", desc: "Using commercial-grade equipment and eco-friendly solutions, we restore your surfaces." },
    { step: "04", title: "Final Review", desc: "We walk the property with you, ensure everything meets your expectations, and leave it spotless." },
  ];

  const faqs = [
    { q: `What surfaces does ${data.businessName} clean?`, a: `We clean all exterior surfaces including ${data.services.slice(0, 3).map((s) => s.name).join(", ")}, and more. Our team uses the right pressure and technique for each surface.` },
    { q: "Is pressure washing safe for all surfaces?", a: "We use soft washing for delicate surfaces like vinyl siding and roofs, and higher pressure for concrete and brick. Our technicians know exactly what each surface needs." },
    { q: "How often should I have my property pressure washed?", a: "We recommend annually for most homes and twice yearly for commercial properties. Regular cleaning prevents buildup that can cause permanent damage." },
    { q: "Do you use eco-friendly cleaning solutions?", a: `Yes! ${data.businessName} uses biodegradable, eco-friendly cleaning solutions that are safe for your landscaping, pets, and family.` },
    { q: "How long does a typical job take?", a: "Most residential jobs are completed in 2-4 hours. Larger commercial properties may take a full day. We always give you a time estimate before starting." },
  ];

  const fallbackTestimonials = [
    { name: "Larry D.", text: "Our driveway looks brand new. The difference is absolutely incredible — like night and day.", rating: 5 },
    { name: "Beth R.", text: "They pressure washed our entire house exterior and it looks like we just painted it. Amazing.", rating: 5 },
    { name: "Phil T.", text: "Deck was covered in algae and now it's spotless. Professional service and great results.", rating: 5 },
  ];
  const testimonials = data.testimonials?.length > 0 ? data.testimonials : fallbackTestimonials;

  const pricingTiers = [
    { name: "Driveway & Walkway", price: "$149", desc: "Up to 800 sq ft of concrete or paver cleaning" },
    { name: "Full House Wash", price: "$349", desc: "Complete exterior siding, soffit, and trim wash" },
    { name: "Property Package", price: "$599", desc: "House, driveway, deck, fence — the works" },
  ];

  const quizOptions = [
    { label: "Green algae or mold", color: "#ef4444", urgency: "High", rec: "Soft wash treatment needed soon to prevent damage." },
    { label: "General dirt buildup", color: AMBER, urgency: "Medium", rec: "Standard pressure wash will restore your surfaces." },
    { label: "Preparing to sell/paint", color: "#22c55e", urgency: "Planning", rec: "Pre-project cleaning ensures the best results." },
  ];

  const seasonalSchedule = [
    { season: "Spring", task: "Post-winter cleanup — remove grime, pollen, and debris", icon: Leaf },
    { season: "Summer", task: "Deck and patio prep — entertain on spotless surfaces", icon: Drop },
    { season: "Fall", task: "Pre-winter wash — prevent mold growth under leaves", icon: Leaf },
    { season: "Winter", task: "Commercial maintenance — keep walkways safe and clean", icon: Buildings },
  ];

  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden" style={{ fontFamily: "Barlow, system-ui, sans-serif", background: CHARCOAL, color: "#f1f5f9" }}>
      <FloatingParticles accent={ACCENT} />

      {/* ─── NAV ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-4">
          <GlassCard className="flex items-center justify-between px-4 md:px-6 py-3">
            <div className="flex items-center gap-2">
              <Drop size={24} weight="fill" style={{ color: ACCENT }} />
              <span className="text-lg font-bold tracking-tight text-white">{data.businessName}</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
              <a href="#services" className="hover:text-white transition-colors">Services</a>
              <a href="#surfaces" className="hover:text-white transition-colors">Surfaces</a>
              <a href="#about" className="hover:text-white transition-colors">About</a>
              <a href="#projects" className="hover:text-white transition-colors">Projects</a>
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
                  {["Services", "Surfaces", "About", "Projects", "Contact"].map((link) => (
                    <a
                      key={link}
                      href={`#${link.toLowerCase()}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-3 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      {link}
                    </a>
                  ))}
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section className="relative min-h-[100dvh] flex items-center pt-24 z-10 overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImage} alt={data.businessName} className="w-full h-full object-cover object-center" />
          <div className="absolute inset-0 bg-black/70" />
        </div>
        <WaterSprayPattern opacity={0.04} accent={ACCENT} />
        <WaterStreamBackground opacity={0.04} accent={ACCENT} />
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full blur-[200px] pointer-events-none" style={{ background: `${ACCENT}08` }} />
        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          <div className="space-y-8">
            <div>
              <p className="text-sm uppercase tracking-widest mb-4" style={{ color: AMBER }}>
                Professional Pressure Washing
              </p>
              <h1
                className="text-3xl md:text-6xl tracking-tighter leading-none font-bold text-white"
                style={{ textShadow: "0 2px 20px rgba(0,0,0,0.8), 0 4px 40px rgba(0,0,0,0.5)" }}
              >
                {data.tagline}
              </h1>
            </div>
            <p className="text-lg text-white/80 max-w-md leading-relaxed" style={{ textShadow: "0 1px 8px rgba(0,0,0,0.6)" }}>
              {(() => { const t = data.about; if (t.length <= 180) return t; const dot = t.indexOf(".", 80); return dot > 0 && dot < 220 ? t.slice(0, dot + 1) : t.slice(0, 180).trim() + "..."; })()}
            </p>
            {/* Trust badges */}
            <div className="flex flex-wrap gap-3">
              {["Licensed & Insured", `${data.googleRating || "5.0"}-Star Rated`, "Free Estimates"].map((badge) => (
                <span key={badge} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border backdrop-blur-md" style={{ color: ACCENT, borderColor: `${ACCENT}4d`, background: "rgba(0,0,0,0.4)" }}>
                  <CheckCircle size={14} weight="fill" /> {badge}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap gap-4">
              <MagneticButton
                className="px-8 py-4 rounded-full text-base font-semibold text-white flex items-center gap-2 cursor-pointer"
                style={{ background: ACCENT } as React.CSSProperties}
              >
                Get Free Estimate <ArrowRight size={18} weight="bold" />
              </MagneticButton>
              <MagneticButton
                href={`tel:${phoneDigits}`}
                className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/15 flex items-center gap-2 cursor-pointer"
              >
                <Phone size={18} weight="duotone" /> <PhoneLink phone={data.phone} />
              </MagneticButton>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-slate-400">
              <span className="flex items-center gap-2">
                <MapPin size={16} weight="duotone" style={{ color: ACCENT }} />
                <MapLink address={data.address} />
              </span>
              <span className="flex items-center gap-2">
                <Clock size={16} weight="duotone" style={{ color: ACCENT }} />
                {data.hours || "Mon-Sat 7AM-6PM"}
              </span>
            </div>
          </div>
          <div className="hidden md:block relative">
            <div className="relative rounded-2xl overflow-hidden border border-white/15">
              <img src={heroCardImage} alt={`${data.businessName} work`} className="w-full h-[500px] object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6">
                <div
                  className="px-4 py-2 rounded-full backdrop-blur-md bg-black/50 border flex items-center gap-2"
                  style={{ borderColor: `${ACCENT}4d` }}
                >
                  <Leaf size={18} weight="fill" style={{ color: AMBER }} />
                  <span className="text-sm font-semibold text-white">Eco-Friendly Solutions</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── STATS ─── */}
      <section className="relative z-10 py-16 overflow-hidden border-y" style={{ borderColor: `${ACCENT}1a` }}>
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #0a1218 0%, #1a1a1a 100%)" }} />
        <WaterSprayPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {data.stats.map((stat, i) => {
              const statIcons = [Drop, HouseLine, Star, ShieldCheck];
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

      {/* ─── SERVICES ─── */}
      <section id="services" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0a1218 50%, #1a1a1a 100%)" }} />
        <WaterSprayPattern accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            badge="Our Services"
            title="Pressure Washing Solutions"
            subtitle={`${data.businessName} restores the beauty of your property with professional-grade cleaning.`}
            accent={ACCENT}
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.services.map((service, i) => {
              const Icon = getServiceIcon(service.name);
              return (
                <div key={service.name} className="group relative p-7 rounded-2xl border border-white/[0.10] hover:border-opacity-30 transition-all duration-500 overflow-hidden bg-white/[0.07]">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: `radial-gradient(circle at 50% 0%, ${ACCENT}15, transparent 70%)` }} />
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-5">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center border" style={{ background: ACCENT_GLOW, borderColor: `${ACCENT}33` }}>
                        <Icon size={24} weight="duotone" style={{ color: ACCENT }} />
                      </div>
                      <span className="text-xs font-mono text-slate-600">{String(i + 1).padStart(2, "0")}</span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{service.name}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{service.description || ""}</p>
                    {service.price && (
                      <p className="text-sm font-semibold mt-3" style={{ color: ACCENT }}>{service.price}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── SURFACE TYPES GRID ─── */}
      <section id="surfaces" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0d1520 50%, #1a1a1a 100%)" }} />
        <WaterStreamBackground opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <AnimatedSection>
            <SectionHeader badge="Surface Types" title="We Clean Every Surface" subtitle="The right technique and PSI for every material." accent={ACCENT} />
          </AnimatedSection>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {SURFACE_TYPES.map((surface) => (
              <GlassCard key={surface.name} className="p-6 text-center group hover:border-white/20 transition-all duration-300">
                <div className="w-14 h-14 rounded-xl mx-auto mb-4 flex items-center justify-center" style={{ background: ACCENT_GLOW, border: `1px solid ${ACCENT}33` }}>
                  <surface.icon size={28} weight="duotone" style={{ color: ACCENT }} />
                </div>
                <h3 className="text-base font-bold text-white mb-1">{surface.name}</h3>
                <p className="text-xs text-slate-400 mb-3">{surface.desc}</p>
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold" style={{ color: AMBER, background: `${AMBER}1a`, border: `1px solid ${AMBER}33` }}>
                  {surface.psi} PSI
                </span>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* ─── ABOUT ─── */}
      <section id="about" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #081820 50%, #1a1a1a 100%)" }} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="relative">
              <div className="rounded-2xl overflow-hidden border border-white/15">
                <img src={aboutImage} alt={`${data.businessName} team`} className="w-full h-[400px] object-cover" />
              </div>
              <div className="absolute -bottom-4 -right-4 md:bottom-6 md:-right-6">
                <div className="px-5 py-3 rounded-xl backdrop-blur-md border text-white font-bold text-sm shadow-lg" style={{ background: `${ACCENT}e6`, borderColor: `${ACCENT}80` }}>
                  {data.stats[0] ? `${data.stats[0].value} ${data.stats[0].label}` : "Clean Results"}
                </div>
              </div>
            </div>
            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: ACCENT, borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}>About Us</span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6 text-white">Restoring Curb Appeal</h2>
              <p className="text-slate-400 leading-relaxed mb-8">{data.about}</p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: ShieldCheck, label: "Licensed & Insured" },
                  { icon: Leaf, label: "Eco-Friendly" },
                  { icon: Star, label: "5-Star Rated" },
                  { icon: CheckCircle, label: "Satisfaction Guaranteed" },
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

      {/* ─── ECO-FRIENDLY SECTION ─── */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0a1812 50%, #1a1a1a 100%)" }} />
        <WaterSprayPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <AnimatedSection>
            <SectionHeader badge="Eco-Friendly" title="Safe & Green Cleaning" subtitle="Protecting your property and the environment." accent={ACCENT} />
          </AnimatedSection>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {ECO_FEATURES.map((item, i) => (
              <GlassCard key={item.title} className="p-6">
                <div className="w-12 h-12 rounded-xl mb-4 flex items-center justify-center" style={{ background: `${AMBER}1a`, border: `1px solid ${AMBER}33` }}>
                  <Leaf size={24} weight="duotone" style={{ color: AMBER }} />
                </div>
                <h3 className="text-base font-bold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PROCESS ─── */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0a1218 50%, #1a1a1a 100%)" }} />
        <WaterStreamBackground opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <AnimatedSection>
            <SectionHeader badge="Our Process" title="How We Work" accent={ACCENT} />
          </AnimatedSection>
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

      {/* ─── SEASONAL SCHEDULING ─── */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0d1520 50%, #1a1a1a 100%)" }} />
        <WaterSprayPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <AnimatedSection>
            <SectionHeader badge="Seasonal" title="Year-Round Cleaning Schedule" accent={ACCENT} />
          </AnimatedSection>
          <div className="grid md:grid-cols-2 gap-6">
            {seasonalSchedule.map((item) => (
              <GlassCard key={item.season} className="p-6 flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: ACCENT_GLOW, border: `1px solid ${ACCENT}33` }}>
                  <item.icon size={24} weight="duotone" style={{ color: ACCENT }} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">{item.season}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{item.task}</p>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PROJECTS / GALLERY ─── */}
      <section id="projects" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #081820 50%, #1a1a1a 100%)" }} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <AnimatedSection>
            <SectionHeader badge="Our Work" title="Recent Transformations" accent={ACCENT} />
          </AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {galleryImages.map((src, i) => {
              const titles = ["Driveway Restoration", "House Wash", "Deck Revival", "Commercial Cleaning"];
              return (
                <div key={i} className="group relative rounded-2xl overflow-hidden border border-white/[0.10]">
                  <img src={src} alt={titles[i % titles.length]} className="w-full h-64 object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-lg font-bold text-white mb-1">{titles[i % titles.length]}</h3>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── VIDEO PLACEHOLDER ─── */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0a1218 50%, #1a1a1a 100%)" }} />
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <AnimatedSection>
            <SectionHeader badge="See Our Work" title="Watch the Transformation" accent={ACCENT} />
          </AnimatedSection>
          <div className="relative rounded-2xl overflow-hidden border border-white/15 group cursor-pointer">
            <img src={heroImage} alt="Watch our work" className="w-full h-[400px] object-cover" />
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center group-hover:bg-black/50 transition-colors">
              <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: `${ACCENT}cc` }}>
                <PlayCircle size={48} weight="fill" className="text-white" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0d1520 50%, #1a1a1a 100%)" }} />
        <WaterSprayPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <AnimatedSection>
            <SectionHeader badge="Pricing" title="Transparent Pricing" subtitle="No hidden fees. Free estimates for every job." accent={ACCENT} />
          </AnimatedSection>
          <div className="grid md:grid-cols-3 gap-6">
            {pricingTiers.map((tier, i) => (
              <GlassCard key={tier.name} className={`p-8 text-center ${i === 1 ? "ring-2 ring-offset-2 ring-offset-[#1a1a1a]" : ""}`}>
                {i === 1 && (
                  <span className="inline-block text-xs font-bold uppercase tracking-wider mb-4 px-3 py-1 rounded-full text-white" style={{ background: ACCENT }}>Most Popular</span>
                )}
                <h3 className="text-lg font-bold text-white mb-2">{tier.name}</h3>
                <p className="text-4xl font-black mb-2" style={{ color: ACCENT }}>
                  {tier.price}
                </p>
                <p className="text-sm text-slate-400 mb-6">{tier.desc}</p>
                <MagneticButton
                  className="w-full py-3 rounded-full text-sm font-semibold text-white cursor-pointer"
                  style={{ background: i === 1 ? ACCENT : `${ACCENT}33` } as React.CSSProperties}
                >
                  Get Quote
                </MagneticButton>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* ─── COMPARISON TABLE ─── */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0a1218 50%, #1a1a1a 100%)" }} />
        <WaterStreamBackground opacity={0.02} accent={ACCENT} />
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <AnimatedSection>
            <SectionHeader badge="Compare" title={`${data.businessName} vs. The Competition`} accent={ACCENT} />
          </AnimatedSection>
          <GlassCard className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/15">
                    <th className="text-left p-4 text-slate-400 font-medium">Feature</th>
                    <th className="text-center p-4 font-bold text-white">{data.businessName}</th>
                    <th className="text-center p-4 text-slate-400 font-medium">Others</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_ROWS.map((row, i) => (
                    <tr key={row.feature} className={i < COMPARISON_ROWS.length - 1 ? "border-b border-white/8" : ""}>
                      <td className="p-4 text-slate-300">{row.feature}</td>
                      <td className="p-4 text-center">
                        <CheckCircle size={20} weight="fill" style={{ color: "#22c55e" }} className="mx-auto" />
                      </td>
                      <td className="p-4 text-center text-slate-500">{row.them}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* ─── QUIZ ─── */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0d1520 50%, #1a1a1a 100%)" }} />
        <WaterSprayPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <AnimatedSection>
            <SectionHeader badge="Quick Check" title="What Does Your Property Need?" accent={ACCENT} />
          </AnimatedSection>
          <div className="grid gap-4">
            {quizOptions.map((opt) => (
              <button
                key={opt.label}
                onClick={() => setQuizAnswer(opt.label)}
                className={`w-full text-left p-5 rounded-2xl border transition-all duration-300 cursor-pointer ${quizAnswer === opt.label ? "border-white/30 bg-white/[0.06]" : "border-white/15 bg-white/[0.07] hover:bg-white/[0.07]"}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-white font-semibold">{opt.label}</span>
                  <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ color: opt.color, background: `${opt.color}1a`, border: `1px solid ${opt.color}33` }}>
                    {opt.urgency}
                  </span>
                </div>
                {quizAnswer === opt.label && (
                  <p className="text-sm text-slate-400 mt-3">{opt.rec}</p>
                )}
              </button>
            ))}
          </div>
          {quizAnswer && (
            <div className="mt-8 text-center">
              <MagneticButton
                href={`tel:${phoneDigits}`}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-base font-semibold text-white cursor-pointer"
                style={{ background: ACCENT } as React.CSSProperties}
              >
                <Phone size={18} weight="fill" /> Call for Free Estimate
              </MagneticButton>
            </div>
          )}
        </div>
      </section>

      {/* ─── GOOGLE REVIEWS HEADER + TESTIMONIALS ─── */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0a1218 50%, #1a1a1a 100%)" }} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <AnimatedSection>
            <SectionHeader badge="Reviews" title="What Our Clients Say" accent={ACCENT} />
          </AnimatedSection>
          {/* Google reviews summary */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border" style={{ borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}>
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={18} weight="fill" style={{ color: AMBER }} />
                ))}
              </div>
              <span className="text-white font-bold">{data.googleRating || "5.0"}</span>
              <span className="text-slate-400 text-sm">({data.reviewCount || "50"}+ reviews)</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <GlassCard key={i} className="p-6 h-full flex flex-col">
                <Quotes size={24} weight="fill" style={{ color: `${ACCENT}33` }} className="mb-3" />
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.rating || 5 }).map((_, j) => (
                    <Star key={j} size={16} weight="fill" style={{ color: AMBER }} />
                  ))}
                </div>
                <p className="text-slate-300 leading-relaxed flex-1 text-sm mb-4">&ldquo;{t.text}&rdquo;</p>
                <div className="pt-4 border-t border-white/8 flex items-center gap-2">
                  <SealCheck size={16} weight="fill" style={{ color: "#22c55e" }} />
                  <span className="text-sm font-semibold text-white">{t.name}</span>
                  <span className="text-xs text-slate-500">Verified</span>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SERVICE AREA ─── */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #081820 50%, #1a1a1a 100%)" }} />
        <WaterStreamBackground opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <AnimatedSection>
            <SectionHeader badge="Coverage" title="Service Area" accent={ACCENT} />
          </AnimatedSection>
          <div className="text-center">
            <GlassCard className="p-8 inline-block">
              <div className="flex items-center gap-3 text-lg mb-3">
                <MapPin size={24} weight="duotone" style={{ color: ACCENT }} />
                <MapLink address={data.address} className="text-white font-semibold" />
              </div>
              <p className="text-slate-400 text-sm mb-4">& Surrounding Areas</p>
              <div className="flex items-center justify-center gap-2">
                <motion.div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ background: "#22c55e" }}
                  animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <span className="text-sm font-semibold" style={{ color: "#22c55e" }}>Crews Available Now</span>
              </div>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="relative z-10 py-20 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT}cc)` }} />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='40' height='40' fill='none'/%3E%3Cpath d='M0 0L40 40M40 0L0 40' stroke='%23000' stroke-width='0.5'/%3E%3C/svg%3E\")" }} />
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <Drop size={48} weight="fill" className="mx-auto mb-6 text-white/70" />
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-4">Ready for a Cleaner Property?</h2>
          <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">Get a free estimate today. We will make your home or business look brand new.</p>
          <PhoneLink
            phone={data.phone}
            className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-white text-black font-bold text-lg hover:bg-white/90 transition-colors"
          >
            <Phone size={22} weight="fill" /> Call {data.phone}
          </PhoneLink>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0a1218 50%, #1a1a1a 100%)" }} />
        <WaterSprayPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <AnimatedSection>
            <SectionHeader badge="FAQ" title="Common Questions" accent={ACCENT} />
          </AnimatedSection>
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

      {/* ─── CONTACT ─── */}
      <section id="contact" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #081820 50%, #1a1a1a 100%)" }} />
        <WaterSprayPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: ACCENT, borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}>Contact Us</span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6 text-white">Get Your Free Estimate</h2>
              <p className="text-slate-400 leading-relaxed mb-8">Ready for a cleaner property? Contact {data.businessName} today for a free, no-obligation estimate.</p>
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
                    <input type="text" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 focus:outline-none text-sm" placeholder="John" />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1.5">Last Name</label>
                    <input type="text" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 focus:outline-none text-sm" placeholder="Doe" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">Phone</label>
                  <input type="tel" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 focus:outline-none text-sm" placeholder="(555) 123-4567" />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">Service Needed</label>
                  <select className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white focus:outline-none text-sm">
                    <option value="" className="bg-neutral-900">Select a service</option>
                    {data.services.map((s) => (
                      <option key={s.name} value={s.name.toLowerCase().replace(/\s+/g, "-")} className="bg-neutral-900">{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">Project Details</label>
                  <textarea rows={3} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 focus:outline-none text-sm resize-none" placeholder="Describe surfaces to be cleaned..." />
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

      {/* ─── CERTIFICATIONS BADGES ─── */}
      <section className="relative z-10 py-16 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0d1520 50%, #1a1a1a 100%)" }} />
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <div className="flex flex-wrap justify-center gap-4">
            {["Licensed", "Insured", "BBB Accredited", "EPA Compliant", "Eco-Certified", "Satisfaction Guaranteed"].map((cert) => (
              <span key={cert} className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border" style={{ color: ACCENT, borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}>
                <SealCheck size={16} weight="fill" /> {cert}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── GUARANTEE ─── */}
      <section className="relative z-10 py-16 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0a1218 100%)" }} />
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <ShimmerBorder accent={ACCENT}>
            <div className="p-8 md:p-12">
              <ShieldCheck size={48} weight="fill" style={{ color: ACCENT }} className="mx-auto mb-4" />
              <h2 className="text-2xl md:text-4xl font-extrabold text-white mb-4">Our Clean Guarantee</h2>
              <p className="text-slate-400 leading-relaxed max-w-2xl mx-auto text-lg">
                If you are not 100% satisfied with our work, {data.businessName} will come back and re-clean the area at no charge. That is our promise.
              </p>
              <div className="flex flex-wrap justify-center gap-4 mt-8">
                {["Eco-Friendly", "Licensed & Insured", "Free Estimates", "Satisfaction Guaranteed"].map((item) => (
                  <span key={item} className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border" style={{ color: ACCENT, borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}>
                    <CheckCircle size={16} weight="fill" /> {item}
                  </span>
                ))}
              </div>
            </div>
          </ShimmerBorder>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="relative z-10 border-t border-white/8 py-10 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #111 100%)" }} />
        <div className="mx-auto max-w-6xl px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Drop size={22} weight="fill" style={{ color: ACCENT }} />
                <span className="text-lg font-bold text-white">{data.businessName}</span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">
                {data.about.length > 120 ? data.about.slice(0, 120).trim() + "..." : data.about}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-3">Quick Links</h4>
              <div className="space-y-2">
                {["Services", "Surfaces", "About", "Projects", "Contact"].map((link) => (
                  <a key={link} href={`#${link.toLowerCase()}`} className="block text-sm text-slate-500 hover:text-white transition-colors">{link}</a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-3">Contact</h4>
              <div className="space-y-2 text-sm text-slate-500">
                <p><PhoneLink phone={data.phone} /></p>
                <p><MapLink address={data.address} /></p>
                {data.socialLinks &&
                  Object.entries(data.socialLinks).map(([platform, url]) => (
                    <a key={platform} href={url} target="_blank" rel="noopener noreferrer" className="block hover:text-white transition-colors capitalize">{platform}</a>
                  ))}
              </div>
            </div>
          </div>
          <div className="border-t border-white/8 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Drop size={14} weight="fill" style={{ color: ACCENT }} />
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
