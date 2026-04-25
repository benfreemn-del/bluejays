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
  Camera,
  Aperture,
  Image,
  ShieldCheck,
  Clock,
  Phone,
  MapPin,
  CaretDown,
  List,
  X,
  ArrowRight,
  Star,
  CheckCircle,
  FilmStrip,
  VideoCamera,
  SunHorizon,
  Mountains,
  User,
  Heart,
  Sparkle,
  Eye,
  SunDim,
  RocketLaunch,
  Folder,
  Printer,
  Lightning,
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
const CHARCOAL = "#faf9f7";
const DEFAULT_GOLD = "#ca8a04";
const COOL_SLATE = "#64748b";

function getAccent(accentColor?: string) {
  const c = accentColor || DEFAULT_GOLD;
  return {
    PRIMARY: c,
    PRIMARY_GLOW: `${c}26`,
    SECONDARY: COOL_SLATE,
  };
}

// Rotating color palette for service/feature icon tiles. The primary
// brand accent (PRIMARY) stays on section headers, CTAs, and nav — the
// palette only colors iconography and highlight accents so the grid
// feels alive without fighting the brand.
const PALETTE = ["#ca8a04", "#64748b", "#e11d48", "#6b7f5e", "#0d9488", "#b45309"];
const pickPaletteColor = (i: number) => PALETTE[i % PALETTE.length];

/* ───────────────────────── SERVICE ICON MAP ───────────────────────── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SERVICE_ICON_MAP: Record<string, any> = {
  wedding: SunHorizon,
  portrait: User,
  event: VideoCamera,
  commercial: Camera,
  product: Image,
  landscape: Mountains,
  headshot: User,
  family: User,
  real: Mountains,
  drone: SunHorizon,
  film: FilmStrip,
  video: VideoCamera,
  edit: Image,
  retouch: Image,
  studio: Aperture,
};

function getServiceIcon(serviceName: string) {
  const lower = serviceName.toLowerCase();
  for (const [key, Icon] of Object.entries(SERVICE_ICON_MAP)) {
    if (lower.includes(key)) return Icon;
  }
  return Camera;
}

/* ───────────────────────── STOCK FALLBACK IMAGES ───────────────────────── */
const STOCK_HERO_POOL = ["https://images.unsplash.com/photo-1471341971476-ae15ff5dd4ea?w=1400&q=80"];
const STOCK_ABOUT_POOL = ["https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=600&q=80"];
const STOCK_GALLERY = [
  "https://images.unsplash.com/photo-1554080353-a576cf803bda?w=600&q=80",
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80",
  "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=600&q=80",
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80",
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=80",
  "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=600&q=80",
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80",
  "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=800&q=80",
];

/* ───────────────────────── PHOTOGRAPHY STYLES DATA ───────────────────────── */
const PHOTOGRAPHY_STYLES = [
  { label: "Portraits", icon: User },
  { label: "Weddings", icon: Heart },
  { label: "Events", icon: VideoCamera },
  { label: "Commercial", icon: Camera },
  { label: "Family", icon: SunHorizon },
  { label: "Headshots", icon: Aperture },
];

/* ───────────────────────── SESSION PRICING DATA ───────────────────────── */
const SESSION_PACKAGES = [
  {
    name: "Mini Session",
    price: "From $199",
    duration: "30 minutes",
    details: ["10 edited photos", "1 outfit / 1 location", "Online gallery", "Print release included"],
    featured: false,
  },
  {
    name: "Standard Session",
    price: "From $499",
    duration: "1–2 hours",
    details: ["30+ edited photos", "Multiple outfits & locations", "Online gallery with download", "Full print rights", "Social media crops"],
    featured: true,
  },
  {
    name: "Full Coverage",
    price: "From $1,500+",
    duration: "Half or full day",
    details: ["Weddings & events", "All-day coverage", "Second shooter available", "Custom album design", "Rush delivery option"],
    featured: false,
  },
];

/* ───────────────────────── SESSION PROCESS STEPS ───────────────────────── */
const SESSION_PROCESS = [
  { step: "01", title: "Consultation & Vision", desc: "We discuss your style, mood, and creative direction to plan the perfect session.", icon: Eye },
  { step: "02", title: "Location Scouting", desc: "We find or recommend the ideal setting — golden hour meadow, urban backdrop, or studio.", icon: MapPin },
  { step: "03", title: "The Session", desc: "A relaxed, guided experience where we capture authentic moments and stunning compositions.", icon: Camera },
  { step: "04", title: "Artful Editing", desc: "Each image is carefully retouched and color-graded to match your unique aesthetic.", icon: Sparkle },
  { step: "05", title: "Gallery Delivery", desc: "Your curated gallery is delivered online — ready to download, share, and print.", icon: Folder },
];

/* ───────────────────────── GALLERY SESSION TYPES ───────────────────────── */
const GALLERY_SESSION_TYPES = ["Portrait Session", "Wedding Day", "Family Session", "Editorial", "Engagement", "Event Coverage"];

/* ───────────────────────── WHAT MAKES US DIFFERENT ───────────────────────── */
const DIFFERENTIATORS = [
  { title: "Artistic Eye", desc: "Every frame is composed with intention — capturing emotion, light, and story in a single click.", icon: Eye },
  { title: "Natural Light Specialist", desc: "We chase the golden hour and know how to harness beautiful, soft light in any environment.", icon: SunDim },
  { title: "Fast Turnaround", desc: "Your gallery is delivered within 2 weeks — because you shouldn't have to wait months for memories.", icon: RocketLaunch },
  { title: "Full Print Rights", desc: "Every package includes a print release so you can print, share, and display your images freely.", icon: Printer },
];

/* ───────────────────────── INVESTMENT GUIDE DELIVERABLES ───────────────────────── */
const INVESTMENT_DELIVERABLES = [
  { item: "Professionally Edited Images", icon: Image },
  { item: "Online Gallery with Download", icon: Folder },
  { item: "Print Release", icon: Printer },
  { item: "Social Media Crops", icon: Sparkle },
  { item: "Optional Albums & Prints", icon: FilmStrip },
  { item: "Rush Delivery Available", icon: Lightning },
];

/* ───────────────────────── COMPARISON TABLE ROWS ───────────────────────── */
const COMPARISON_ROWS = [
  { feature: "Full Print Rights", us: true, them: "Extra Cost" },
  { feature: "Online Gallery", us: true, them: "Sometimes" },
  { feature: "Professional Editing", us: true, them: "Varies" },
  { feature: "Location Flexibility", us: true, them: "Limited" },
  { feature: "Quick Turnaround", us: true, them: "No" },
  { feature: "Outfit Change Guidance", us: true, them: "No" },
  { feature: "Backup Camera Equipment", us: true, them: "Sometimes" },
];

/* ───────────────────────── SESSION TYPE QUIZ OPTIONS ───────────────────────── */
const SESSION_QUIZ_OPTIONS = [
  { type: "Portraits & Headshots", desc: "Perfect for personal branding, LinkedIn, or creative expression.", icon: User, cta: "Book a Portrait Session" },
  { type: "Family & Kids", desc: "Capture milestones, holidays, and the moments that matter most.", icon: Heart, cta: "Book a Family Session" },
  { type: "Wedding & Engagement", desc: "Timeless coverage of your love story — from proposal to reception.", icon: SunHorizon, cta: "Book Wedding Coverage" },
  { type: "Commercial & Product", desc: "Elevate your brand with stunning product, food, or corporate photography.", icon: Camera, cta: "Book a Commercial Shoot" },
];

/* ───────────────────────── FLOATING PARTICLES ───────────────────────── */
function FloatingBokeh({ accent }: { accent: string }) {
  const particles = Array.from({ length: 16 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 8,
    duration: 7 + Math.random() * 8,
    size: 3 + Math.random() * 5,
    opacity: 0.08 + Math.random() * 0.2,
    isSlate: Math.random() > 0.6,
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
            background: p.isSlate ? COOL_SLATE : accent,
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

/* ───────────────────────── APERTURE SVG PATTERN ───────────────────────── */
function AperturePattern({ opacity = 0.03, accent }: { opacity?: number; accent: string }) {
  const patternId = `aperturePatternV2Prev-${accent.replace("#", "")}`;
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }}>
      <defs>
        <pattern id={patternId} width="100" height="100" patternUnits="userSpaceOnUse">
          <circle cx="50" cy="50" r="20" fill="none" stroke={accent} strokeWidth="0.5" />
          <circle cx="50" cy="50" r="14" fill="none" stroke={accent} strokeWidth="0.3" />
          <line x1="50" y1="30" x2="50" y2="36" stroke={accent} strokeWidth="0.5" />
          <line x1="50" y1="64" x2="50" y2="70" stroke={accent} strokeWidth="0.5" />
          <line x1="30" y1="50" x2="36" y2="50" stroke={accent} strokeWidth="0.5" />
          <line x1="64" y1="50" x2="70" y2="50" stroke={accent} strokeWidth="0.5" />
          <line x1="36" y1="36" x2="40" y2="40" stroke={accent} strokeWidth="0.4" />
          <line x1="60" y1="60" x2="64" y2="64" stroke={accent} strokeWidth="0.4" />
          <line x1="64" y1="36" x2="60" y2="40" stroke={accent} strokeWidth="0.4" />
          <line x1="36" y1="64" x2="40" y2="60" stroke={accent} strokeWidth="0.4" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  );
}

/* ───────────────────────── FILM STRIP SVG ───────────────────────── */
function FilmStripBG({ opacity = 0.03, accent }: { opacity?: number; accent: string }) {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }} viewBox="0 0 1000 600" preserveAspectRatio="none">
      <rect x="50" y="0" width="40" height="600" fill="none" stroke={accent} strokeWidth="0.5" />
      <rect x="910" y="0" width="40" height="600" fill="none" stroke={accent} strokeWidth="0.5" />
      {Array.from({ length: 10 }).map((_, i) => (
        <g key={i}>
          <rect x="55" y={i * 60 + 5} width="12" height="20" rx="2" fill={accent} opacity="0.3" />
          <rect x="73" y={i * 60 + 5} width="12" height="20" rx="2" fill={accent} opacity="0.3" />
          <rect x="915" y={i * 60 + 5} width="12" height="20" rx="2" fill={accent} opacity="0.3" />
          <rect x="933" y={i * 60 + 5} width="12" height="20" rx="2" fill={accent} opacity="0.3" />
        </g>
      ))}
    </svg>
  );
}

/* ───────────────────────── HERO SVG ───────────────────────── */
function HeroCameraSVG({ accent }: { accent: string }) {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1200 800" preserveAspectRatio="none" style={{ opacity: 0.04 }}>
      <motion.circle cx="600" cy="400" r="120" stroke={accent} strokeWidth="2" fill="none" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2.5, ease: "easeInOut" }} />
      <motion.circle cx="600" cy="400" r="80" stroke={accent} strokeWidth="1.5" fill="none" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2, ease: "easeInOut", delay: 0.3 }} />
      <motion.circle cx="600" cy="400" r="40" stroke={COOL_SLATE} strokeWidth="1" fill="none" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, ease: "easeInOut", delay: 0.6 }} />
      <motion.circle cx="600" cy="400" r="5" fill={accent} animate={{ opacity: [0, 1, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 2.5 }} />
    </svg>
  );
}

/* ───────────────────────── GLASS CARD ───────────────────────── */
function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-gray-200 bg-white/70 backdrop-blur-xl shadow-sm ${className}`}>
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
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      x.set((e.clientX - cx) * 0.25);
      y.set((e.clientY - cy) * 0.25);
    },
    [x, y, isTouchDevice]
  );

  const handleMouseLeave = useCallback(() => { x.set(0); y.set(0); }, [x, y]);

  if (href) {
    return (
      <motion.a href={href} ref={ref as unknown as React.Ref<HTMLAnchorElement>} style={{ x: springX, y: springY, willChange: "transform", ...style }} onMouseMove={handleMouseMove as unknown as React.MouseEventHandler<HTMLAnchorElement>} onMouseLeave={handleMouseLeave} className={className} whileTap={{ scale: 0.97 }}>
        {children}
      </motion.a>
    );
  }

  return (
    <motion.button ref={ref} style={{ x: springX, y: springY, willChange: "transform", ...style }} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} onClick={onClick} className={className} whileTap={{ scale: 0.97 }}>
      {children}
    </motion.button>
  );
}

/* ───────────────────────── SHIMMER BORDER ───────────────────────── */
function ShimmerBorder({ children, className = "", accent }: { children: React.ReactNode; className?: string; accent: string }) {
  return (
    <div className={`relative rounded-2xl p-[1px] overflow-hidden ${className}`}>
      <motion.div className="absolute inset-0 rounded-2xl" style={{ background: `conic-gradient(from 0deg, transparent, ${accent}, transparent, ${COOL_SLATE}, transparent)`, willChange: "transform" }} animate={{ rotate: [0, 360] }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} />
      <div className="relative rounded-2xl bg-white z-10">{children}</div>
    </div>
  );
}

/* ───────────────────────── ACCORDION ITEM ───────────────────────── */
function AccordionItem({ question, answer, isOpen, onToggle }: { question: string; answer: string; isOpen: boolean; onToggle: () => void }) {
  return (
    <GlassCard className="overflow-hidden">
      <button onClick={onToggle} className="w-full flex items-center justify-between p-5 md:p-6 text-left group cursor-pointer">
        <span className="text-lg font-semibold text-[#1c1917] pr-4">{question}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={spring}><CaretDown size={20} className="text-[#6b7280] shrink-0" /></motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={spring} className="overflow-hidden">
            <p className="px-5 pb-5 md:px-6 md:pb-6 text-[#6b7280] leading-relaxed">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
}

/* ───────────────────────── SECTION HEADER ───────────────────────── */
function SectionHeader({ badge, title, subtitle, accent }: { badge: string; title: string; subtitle?: string; accent: string }) {
  return (
    <div className="text-center mb-16">
      <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: accent, borderColor: `${accent}33`, background: `${accent}0d` }}>{badge}</span>
      <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-[#1c1917]">{title}</h2>
      <div className="h-0.5 w-16 mx-auto mt-4" style={{ background: `linear-gradient(to right, ${accent}, transparent)` }} />
      {subtitle && <p className="text-[#6b7280] mt-4 max-w-2xl text-lg leading-relaxed mx-auto">{subtitle}</p>}
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════════
   MAIN PREVIEW COMPONENT — GALLERY-HEAVY PHOTOGRAPHY
   ═══════════════════════════════════════════════════════════════════ */
/* ───────────────────────── ANIMATED SECTION ───────────────────────── */
function AnimatedSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 1, x: 50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: "easeOut" as const }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function V2PhotographyPreview({ data }: { data: GeneratedSiteData }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const { PRIMARY, PRIMARY_GLOW } = getAccent(data.accentColor);

  const uniquePhotos = data.photos ? [...new Set(data.photos)] : [];


  const heroImage = uniquePhotos[0] || pickFromPool(STOCK_HERO_POOL, data.businessName);


  const heroCardImage = uniquePhotos[1] || pickFromPool(STOCK_ABOUT_POOL, data.businessName, 1);


  const aboutImage = uniquePhotos[2] || pickFromPool(STOCK_ABOUT_POOL, data.businessName, 2);
  const usedUrls = new Set([heroImage, heroCardImage, aboutImage].filter(Boolean));
  const galleryFromReal = uniquePhotos.slice(3).filter((u) => !usedUrls.has(u));
  const galleryImages =
    galleryFromReal.length >= 8
      ? galleryFromReal.slice(0, 8)
      : [
          ...galleryFromReal,
          ...pickGallery(STOCK_GALLERY, data.businessName).filter(
            (u) => !usedUrls.has(u) && !galleryFromReal.includes(u)
          ),
        ].slice(0, 8);

  const faqs = [
    { q: `What types of photography does ${data.businessName} offer?`, a: `We specialize in ${data.services.slice(0, 3).map(s => s.name).join(", ")}, and more. Every shoot is tailored to your unique vision and needs.` },
    { q: "How far in advance should I book?", a: `We recommend booking 2-4 weeks ahead for portrait sessions and 3-6 months for weddings and large events. Contact ${data.businessName} to check availability.` },
    { q: "Do you provide edited photos?", a: "Absolutely. Every package includes professional editing and retouching. We deliver a curated gallery of high-resolution images within 2-3 weeks." },
    { q: "Can I request a specific style or location?", a: `Yes! We love collaborating with clients on creative direction. Whether you have a mood board or a dream location, ${data.businessName} will bring your vision to life.` },
  ];

  /* Fallback testimonials */
  const fallbackTestimonials = [
    { name: "Natalie S.", text: "Our wedding photos are absolutely breathtaking. Every moment was captured perfectly.", rating: 5 },
    { name: "Derek J.", text: "The family portraits turned out better than we could have imagined. A true artist behind the lens.", rating: 5 },
    { name: "Alicia W.", text: "Professional, creative, and made us feel so comfortable during the shoot. Stunning results.", rating: 5 }
  ];
  const testimonials = data.testimonials?.length > 0 ? data.testimonials : fallbackTestimonials;

  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden" style={{ fontFamily: "Raleway, system-ui, sans-serif", background: CHARCOAL, color: "#1c1917" }}>
      <FloatingBokeh accent={PRIMARY} />

      {/* ══════════════════ 1. NAV ══════════════════ */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-4">
          <GlassCard className="flex items-center justify-between px-4 md:px-6 py-3">
            <div className="flex items-center gap-2">
              <Aperture size={24} weight="fill" style={{ color: PRIMARY }} />
              <span className="text-lg font-bold tracking-tight text-[#1c1917]">{data.businessName}</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm text-[#6b7280]">
              <a href="#portfolio" className="hover:text-[#1c1917] transition-colors">Portfolio</a>
              <a href="#services" className="hover:text-[#1c1917] transition-colors">Services</a>
              <a href="#about" className="hover:text-[#1c1917] transition-colors">About</a>
              <a href="#contact" className="hover:text-[#1c1917] transition-colors">Contact</a>
            </div>
            <div className="flex items-center gap-3">
              <MagneticButton className="px-4 md:px-5 py-2 rounded-full text-sm font-semibold text-black transition-colors cursor-pointer" style={{ background: PRIMARY } as React.CSSProperties}>
                Book a Session
              </MagneticButton>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-lg text-[#1c1917] hover:bg-gray-100 transition-colors">
                {mobileMenuOpen ? <X size={24} /> : <List size={24} />}
              </button>
            </div>
          </GlassCard>
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3, ease: "easeInOut" }} className="md:hidden mt-2 overflow-hidden">
                <GlassCard className="flex flex-col gap-1 px-4 py-4">
                  {[{ label: "Portfolio", href: "#portfolio" }, { label: "Services", href: "#services" }, { label: "About", href: "#about" }, { label: "Contact", href: "#contact" }].map((link) => (
                    <a key={link.label} href={link.href} onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-lg text-sm text-[#4b5563] hover:text-[#1c1917] hover:bg-gray-50 transition-colors">{link.label}</a>
                  ))}
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* ══════════════════ 2. HERO — FULL-BLEED IMAGE ══════════════════ */}
      <section className="relative min-h-[100dvh] flex items-center pt-24 z-10 overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImage} alt={`${data.businessName} photography`} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#faf9f7] via-transparent to-transparent" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6 w-full">
          <div className="max-w-2xl space-y-8">
            <div>
              <p className="text-sm uppercase tracking-widest mb-4" style={{ color: PRIMARY }}>Professional Photography</p>
              <h1 className="text-3xl md:text-6xl tracking-tighter leading-none font-bold text-white" style={{ textShadow: "0 2px 20px rgba(0,0,0,0.7)" }}>
                {data.tagline}
              </h1>
            </div>
            <p className="text-lg text-white/70 max-w-md leading-relaxed">
              {(() => { const t = data.about; if (t.length <= 180) return t; const dot = t.indexOf('.', 80); return dot > 0 && dot < 220 ? t.slice(0, dot + 1) : t.slice(0, 180).trim() + '...'; })()}
            </p>
            <div className="flex flex-wrap gap-4">
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-black flex items-center gap-2 cursor-pointer" style={{ background: PRIMARY } as React.CSSProperties}>
                View Portfolio
                <ArrowRight size={18} weight="bold" />
              </MagneticButton>
              <MagneticButton href={`tel:${data.phone.replace(/\D/g, "")}`} className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/20 flex items-center gap-2 cursor-pointer backdrop-blur-sm">
                <Phone size={18} weight="duotone" />
                <PhoneLink phone={data.phone} />
              </MagneticButton>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-white/70">
              <span className="flex items-center gap-2">
                <MapPin size={16} weight="duotone" style={{ color: PRIMARY }} />
                <MapLink address={data.address} />
              </span>
              <span className="flex items-center gap-2">
                <Camera size={16} weight="duotone" style={{ color: PRIMARY }} />
                Capturing Life&apos;s Best Moments
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════ 3. STATS ══════════════════ */}
      <section className="relative z-10 py-16 overflow-hidden border-y" style={{ borderColor: `${PRIMARY}1a` }}>
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #151310 0%, #faf9f7 100%)" }} />
        <AperturePattern opacity={0.02} accent={PRIMARY} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] rounded-full blur-[180px]" style={{ background: `${PRIMARY}08` }} />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {data.stats.map((stat, i) => {
              const statIcons = [Camera, Image, Star, CheckCircle];
              const Icon = statIcons[i % statIcons.length];
              return (
                <div key={stat.label} className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Icon size={22} weight="fill" style={{ color: PRIMARY }} />
                    <span className="text-3xl md:text-4xl font-extrabold text-[#1c1917]">{stat.value}</span>
                  </div>
                  <span className="text-[#9ca3af] text-sm font-medium tracking-wide uppercase">{stat.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════ PHOTOGRAPHY STYLES SHOWCASE ══════════════════ */}
      <section className="relative z-10 py-16 md:py-20 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #faf9f7 0%, #f5f3ef 100%)" }} />
        <AperturePattern opacity={0.02} accent={PRIMARY} />
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Specialties" title="Photography We Love" subtitle="From intimate portraits to grand celebrations — we bring artistry to every genre." accent={PRIMARY} />
          <div className="flex flex-wrap justify-center gap-3 md:gap-4">
            {PHOTOGRAPHY_STYLES.map((s) => (
              <div key={s.label} className="flex items-center gap-2.5 px-5 py-3 rounded-full border bg-white/70 backdrop-blur-sm shadow-sm transition-all duration-300 hover:shadow-md" style={{ borderColor: `${PRIMARY}33` }}>
                <s.icon size={20} weight="duotone" style={{ color: PRIMARY }} />
                <span className="text-sm font-semibold text-[#1c1917]">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ 4. PORTFOLIO GALLERY — PRIMARY SECTION ══════════════════ */}
      <section id="portfolio" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #faf9f7 0%, #12100e 50%, #faf9f7 100%)" }} />
        <AperturePattern opacity={0.02} accent={PRIMARY} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] right-[10%] w-[500px] h-[500px] rounded-full blur-[200px]" style={{ background: `${PRIMARY}06` }} />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Portfolio" title="Selected Work" subtitle={`A curated collection of recent work by ${data.businessName}. Every frame tells a story.`} accent={PRIMARY} />

          {/* Masonry-style gallery */}
          <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
            {galleryImages.map((src, i) => (
              <div key={i} className="group relative rounded-2xl overflow-hidden border border-gray-200/60 hover:border-opacity-30 transition-all duration-500 break-inside-avoid">
                <img
                  src={src}
                  alt={`Portfolio piece ${i + 1}`}
                  className={`w-full object-cover transition-transform duration-700 group-hover:scale-105 ${i % 3 === 0 ? "h-80" : i % 3 === 1 ? "h-64" : "h-72"}`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-white/90 px-2.5 py-1 rounded-full mb-1.5" style={{ background: `${PRIMARY}cc` }}>{GALLERY_SESSION_TYPES[i % GALLERY_SESSION_TYPES.length]}</span>
                  <div className="flex items-center gap-2">
                    <Camera size={14} weight="fill" style={{ color: PRIMARY }} />
                    <span className="text-xs text-white/80 font-medium">{data.businessName}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ 5. TESTIMONIALS ══════════════════ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #faf9f7 0%, #141210 50%, #faf9f7 100%)" }} />
        <AperturePattern opacity={0.02} accent={PRIMARY} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] right-[15%] w-[400px] h-[400px] rounded-full blur-[160px]" style={{ background: `${PRIMARY}06` }} />
        </div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <AnimatedSection>          <SectionHeader badge="Testimonials" title="Client Love" accent={PRIMARY} /></AnimatedSection>

          {/* Google Reviews Header */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={22} weight="fill" style={{ color: PRIMARY }} />
              ))}
            </div>
            <div className="text-center sm:text-left">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <span className="text-lg font-bold text-[#1c1917]">{(data as any).googleRating || "5.0"}</span>
              <span className="text-[#6b7280] text-sm ml-1.5">out of 5</span>
              <span className="text-[#9ca3af] text-sm ml-2">·</span>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <span className="text-[#6b7280] text-sm ml-2">{(data as any).reviewCount || "50"}+ reviews on Google</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <GlassCard key={i} className="p-6 h-full flex flex-col">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.rating || 5 }).map((_, j) => (
                    <Star key={j} size={16} weight="fill" style={{ color: PRIMARY }} />
                  ))}
                </div>
                <p className="text-[#4b5563] leading-relaxed flex-1 text-sm mb-4">&ldquo;{t.text}&rdquo;</p>
                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-sm font-semibold text-[#1c1917]">{t.name}</span>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ 6. SERVICES ══════════════════ */}
      <section id="services" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #faf9f7 0%, #141210 50%, #faf9f7 100%)" }} />
        <FilmStripBG opacity={0.025} accent={PRIMARY} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[10%] right-[5%] w-[500px] h-[500px] rounded-full blur-[160px]" style={{ background: `${PRIMARY}08` }} />
          <div className="absolute bottom-[10%] left-[5%] w-[400px] h-[400px] rounded-full blur-[140px]" style={{ background: `${COOL_SLATE}05` }} />
        </div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Services" title="Photography Services" subtitle={`From intimate portraits to grand events, ${data.businessName} delivers stunning imagery for every occasion.`} accent={PRIMARY} />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.services.map((service, i) => {
              const tile = pickPaletteColor(i);
              const Icon = getServiceIcon(service.name);
              return (
                <div key={service.name} className="group relative p-7 rounded-2xl border border-gray-200/60 hover:border-opacity-30 transition-all duration-500 overflow-hidden bg-white/60">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: `radial-gradient(circle at 50% 0%, ${tile}15, transparent 70%)` }} />
                  <div className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `linear-gradient(to right, transparent, ${tile}4d, transparent)` }} />
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-5">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 border" style={{ background: `${tile}22`, borderColor: `${tile}55` }}>
                        <Icon size={24} weight="duotone" style={{ color: tile }} />
                      </div>
                      <span className="text-xs font-mono" style={{ color: `${tile}99` }}>{String(i + 1).padStart(2, "0")}</span>
                    </div>
                    <h3 className="text-lg font-bold text-[#1c1917] mb-2">{service.name}</h3>
                    <p className="text-sm text-[#6b7280] leading-relaxed">{service.description || ""}</p>
                    {service.price && <p className="text-sm font-semibold mt-3" style={{ color: tile }}>{service.price}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════ THE EXPERIENCE — SESSION PROCESS ══════════════════ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #faf9f7 0%, #12100e 50%, #faf9f7 100%)" }} />
        <AperturePattern opacity={0.02} accent={PRIMARY} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[30%] left-[10%] w-[500px] h-[500px] rounded-full blur-[200px]" style={{ background: `${PRIMARY}06` }} />
        </div>

        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <SectionHeader badge="The Experience" title="Your Session Journey" subtitle="From first conversation to final gallery — every step is designed to feel effortless and exciting." accent={PRIMARY} />

          <div className="relative">
            {/* Vertical timeline line — desktop only */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2" style={{ background: `linear-gradient(to bottom, transparent, ${PRIMARY}33, transparent)` }} />

            <div className="space-y-8 md:space-y-0">
              {SESSION_PROCESS.map((step, i) => {
                const isLeft = i % 2 === 0;
                return (
                  <div key={step.step} className={`relative md:flex items-center ${isLeft ? "md:flex-row" : "md:flex-row-reverse"} md:gap-8`}>
                    {/* Content card */}
                    <div className={`md:w-[calc(50%-2rem)] ${isLeft ? "md:text-right" : "md:text-left"}`}>
                      <GlassCard className="p-6">
                        <div className={`flex items-center gap-3 mb-3 ${isLeft ? "md:flex-row-reverse" : ""}`}>
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: PRIMARY_GLOW }}>
                            <step.icon size={20} weight="duotone" style={{ color: PRIMARY }} />
                          </div>
                          <span className="text-xs font-mono font-bold tracking-wider" style={{ color: PRIMARY }}>STEP {step.step}</span>
                        </div>
                        <h3 className="text-lg font-bold text-[#1c1917] mb-1.5">{step.title}</h3>
                        <p className="text-sm text-[#6b7280] leading-relaxed">{step.desc}</p>
                      </GlassCard>
                    </div>

                    {/* Center dot */}
                    <div className="hidden md:flex w-4 h-4 rounded-full border-2 shrink-0 z-10" style={{ borderColor: PRIMARY, background: `${PRIMARY}33` }} />

                    {/* Spacer for the other side */}
                    <div className="hidden md:block md:w-[calc(50%-2rem)]" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════ 7. ABOUT ══════════════════ */}
      <section id="about" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #faf9f7 0%, #0f0e0c 50%, #faf9f7 100%)" }} />
        <FilmStripBG opacity={0.02} accent={PRIMARY} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] left-[10%] w-[500px] h-[500px] rounded-full blur-[180px]" style={{ background: `${PRIMARY}06` }} />
        </div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="relative">
              <div className="rounded-2xl overflow-hidden border border-gray-200">
                <img src={aboutImage} alt={`${data.businessName} photographer`} className="w-full h-[400px] object-cover" />
              </div>
              <div className="absolute -bottom-4 -right-4 md:bottom-6 md:-right-6">
                <div className="px-5 py-3 rounded-xl backdrop-blur-md border text-black font-bold text-sm shadow-lg" style={{ background: `${PRIMARY}e6`, borderColor: `${PRIMARY}80` }}>
                  {data.stats[0] ? `${data.stats[0].value} ${data.stats[0].label}` : "Award-Winning"}
                </div>
              </div>
            </div>
            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: PRIMARY, borderColor: `${PRIMARY}33`, background: `${PRIMARY}0d` }}>About the Artist</span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6 text-[#1c1917]">Every Frame Has a Story</h2>
              <p className="text-[#6b7280] leading-relaxed mb-8">{data.about}</p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Camera, label: "Professional Gear" },
                  { icon: Image, label: "Expert Editing" },
                  { icon: Star, label: "5-Star Reviews" },
                  { icon: Clock, label: "Fast Turnaround" },
                ].map((badge) => (
                  <GlassCard key={badge.label} className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: PRIMARY_GLOW }}>
                      <badge.icon size={20} weight="duotone" style={{ color: PRIMARY }} />
                    </div>
                    <span className="text-sm font-semibold text-[#1c1917]">{badge.label}</span>
                  </GlassCard>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════ WHAT MAKES US DIFFERENT ══════════════════ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #faf9f7 0%, #141210 50%, #faf9f7 100%)" }} />
        <FilmStripBG opacity={0.02} accent={PRIMARY} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-[20%] right-[15%] w-[400px] h-[400px] rounded-full blur-[180px]" style={{ background: `${PRIMARY}06` }} />
        </div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Why Us" title="What Sets Us Apart" subtitle={`${data.businessName} delivers more than just photos — we deliver an experience.`} accent={PRIMARY} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {DIFFERENTIATORS.map((d, i) => {
              const tile = pickPaletteColor(i + 2);
              return (
                <GlassCard key={d.title} className="p-6 text-center group hover:shadow-md transition-shadow duration-300">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all duration-300" style={{ background: `${tile}22`, border: `1px solid ${tile}55` }}>
                    <d.icon size={28} weight="duotone" style={{ color: tile }} />
                  </div>
                  <h3 className="text-base font-bold text-[#1c1917] mb-2">{d.title}</h3>
                  <p className="text-sm text-[#6b7280] leading-relaxed">{d.desc}</p>
                </GlassCard>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════ 8. FEATURED GALLERY ROW ══════════════════ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #faf9f7 0%, #12100e 50%, #faf9f7 100%)" }} />
        <AperturePattern opacity={0.02} accent={PRIMARY} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] rounded-full blur-[180px]" style={{ background: `${COOL_SLATE}06` }} />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <AnimatedSection>          <SectionHeader badge="Featured" title="Recent Sessions" accent={PRIMARY} /></AnimatedSection>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {galleryImages.slice(0, 4).map((src, i) => (
              <div key={i} className="group relative aspect-square rounded-2xl overflow-hidden border border-gray-200/60 hover:border-opacity-30 transition-all duration-500">
                <img src={src} alt={`Featured ${i + 1}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                  <Aperture size={32} weight="duotone" style={{ color: PRIMARY }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ SESSION PRICING PACKAGES ══════════════════ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #faf9f7 0%, #12100e 50%, #faf9f7 100%)" }} />
        <AperturePattern opacity={0.02} accent={PRIMARY} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] left-[20%] w-[500px] h-[500px] rounded-full blur-[200px]" style={{ background: `${PRIMARY}06` }} />
        </div>

        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Investment" title="Session Packages" subtitle="Beautiful imagery is an investment in memories that last a lifetime." accent={PRIMARY} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SESSION_PACKAGES.map((pkg) => (
              <div key={pkg.name} className="relative">
                {pkg.featured ? (
                  <ShimmerBorder accent={PRIMARY}>
                    <div className="p-7 text-center">
                      <span className="inline-block text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4 text-white" style={{ background: PRIMARY }}>Most Popular</span>
                      <h3 className="text-xl font-bold text-[#1c1917] mb-1">{pkg.name}</h3>
                      <p className="text-2xl font-extrabold mb-1" style={{ color: PRIMARY }}>{pkg.price}</p>
                      <p className="text-xs text-[#9ca3af] mb-5">{pkg.duration}</p>
                      <ul className="space-y-2.5 text-left">
                        {pkg.details.map((d) => (
                          <li key={d} className="flex items-center gap-2.5 text-sm text-[#4b5563]">
                            <CheckCircle size={16} weight="fill" style={{ color: PRIMARY }} className="shrink-0" />
                            {d}
                          </li>
                        ))}
                      </ul>
                      <MagneticButton className="w-full mt-6 py-3 rounded-xl text-sm font-semibold text-black cursor-pointer" style={{ background: PRIMARY } as React.CSSProperties}>
                        Book This Session
                      </MagneticButton>
                    </div>
                  </ShimmerBorder>
                ) : (
                  <GlassCard className="p-7 text-center h-full flex flex-col">
                    <h3 className="text-xl font-bold text-[#1c1917] mb-1">{pkg.name}</h3>
                    <p className="text-2xl font-extrabold mb-1" style={{ color: PRIMARY }}>{pkg.price}</p>
                    <p className="text-xs text-[#9ca3af] mb-5">{pkg.duration}</p>
                    <ul className="space-y-2.5 text-left flex-1">
                      {pkg.details.map((d) => (
                        <li key={d} className="flex items-center gap-2.5 text-sm text-[#4b5563]">
                          <CheckCircle size={16} weight="fill" style={{ color: `${PRIMARY}80` }} className="shrink-0" />
                          {d}
                        </li>
                      ))}
                    </ul>
                    <MagneticButton className="w-full mt-6 py-3 rounded-xl text-sm font-semibold border cursor-pointer" style={{ borderColor: `${PRIMARY}33`, color: PRIMARY } as React.CSSProperties}>
                      Learn More
                    </MagneticButton>
                  </GlassCard>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ INVESTMENT GUIDE ══════════════════ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #faf9f7 0%, #0f0e0c 50%, #faf9f7 100%)" }} />
        <FilmStripBG opacity={0.02} accent={PRIMARY} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[30%] right-[10%] w-[400px] h-[400px] rounded-full blur-[160px]" style={{ background: `${COOL_SLATE}06` }} />
        </div>

        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <SectionHeader badge="What You Get" title="Every Session Includes" subtitle="No hidden fees, no surprise costs — just beautiful images and an incredible experience." accent={PRIMARY} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {INVESTMENT_DELIVERABLES.map((d) => (
              <GlassCard key={d.item} className="p-5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: PRIMARY_GLOW }}>
                  <d.icon size={20} weight="duotone" style={{ color: PRIMARY }} />
                </div>
                <span className="text-sm font-semibold text-[#1c1917]">{d.item}</span>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ COMPETITOR COMPARISON TABLE ══════════════════ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #faf9f7 0%, #141210 50%, #faf9f7 100%)" }} />
        <AperturePattern opacity={0.02} accent={PRIMARY} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-[20%] left-[15%] w-[500px] h-[500px] rounded-full blur-[180px]" style={{ background: `${PRIMARY}06` }} />
        </div>

        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Comparison" title={`${data.businessName} vs Average Photographers`} accent={PRIMARY} />
          <GlassCard className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left p-4 font-semibold text-[#1c1917]">Feature</th>
                    <th className="text-center p-4 font-semibold" style={{ color: PRIMARY }}>{data.businessName.length > 15 ? "Us" : data.businessName}</th>
                    <th className="text-center p-4 font-semibold text-[#9ca3af]">Others</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_ROWS.map((row, i) => (
                    <tr key={row.feature} className={i < COMPARISON_ROWS.length - 1 ? "border-b border-gray-50" : ""}>
                      <td className="p-4 text-[#4b5563]">{row.feature}</td>
                      <td className="p-4 text-center">
                        <CheckCircle size={20} weight="fill" style={{ color: PRIMARY }} className="mx-auto" />
                      </td>
                      <td className="p-4 text-center text-xs text-[#9ca3af] font-medium">{row.them}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* ══════════════════ SESSION TYPE QUIZ ══════════════════ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #faf9f7 0%, #12100e 50%, #faf9f7 100%)" }} />
        <FilmStripBG opacity={0.02} accent={PRIMARY} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] right-[20%] w-[400px] h-[400px] rounded-full blur-[180px]" style={{ background: `${PRIMARY}06` }} />
        </div>

        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Find Your Session" title="What Type of Session Are You Looking For?" subtitle="Select the style that best matches your vision — we'll take it from there." accent={PRIMARY} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {SESSION_QUIZ_OPTIONS.map((opt) => (
              <GlassCard key={opt.type} className="p-6 group hover:shadow-md transition-all duration-300 cursor-pointer">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300" style={{ background: PRIMARY_GLOW }}>
                    <opt.icon size={24} weight="duotone" style={{ color: PRIMARY }} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-[#1c1917] mb-1">{opt.type}</h3>
                    <p className="text-sm text-[#6b7280] leading-relaxed mb-3">{opt.desc}</p>
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold" style={{ color: PRIMARY }}>
                      {opt.cta}
                      <ArrowRight size={14} weight="bold" />
                    </span>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ 9. LIMITED AVAILABILITY CTA ══════════════════ */}
      <section className="relative z-10 py-20 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${PRIMARY}, ${PRIMARY}cc, ${PRIMARY})` }} />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='40' height='40' fill='none'/%3E%3Cpath d='M0 0L40 40M40 0L0 40' stroke='%23000' stroke-width='0.5'/%3E%3C/svg%3E\")" }} />

        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          {/* Pulsing availability indicator */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black/40" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-black/70" />
            </span>
            <span className="text-sm font-semibold text-black/70 uppercase tracking-widest">Limited Availability</span>
          </div>
          <Camera size={48} weight="fill" className="mx-auto mb-6 text-black/70" />
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-black mb-4">
            Now Booking {new Date().getMonth() < 5 ? "Spring & Summer" : new Date().getMonth() < 8 ? "Summer & Fall" : "Fall & Winter"} Sessions
          </h2>
          <p className="text-lg text-black/70 mb-3 max-w-xl mx-auto">
            Limited spots available — {data.businessName} books up fast during peak season.
          </p>
          <p className="text-sm text-black/50 mb-8">
            Secure your date before the calendar fills up.
          </p>
          <PhoneLink phone={data.phone} className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-black text-white font-bold text-lg hover:bg-black/80 transition-colors">
            <Phone size={22} weight="fill" />
            {data.phone}
          </PhoneLink>
        </div>
      </section>

      {/* ══════════════════ 10. SERVICE AREAS ══════════════════ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #faf9f7 0%, #0f0e0c 50%, #faf9f7 100%)" }} />
        <AperturePattern opacity={0.02} accent={PRIMARY} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[40%] right-[20%] w-[400px] h-[400px] rounded-full blur-[180px]" style={{ background: `${COOL_SLATE}06` }} />
        </div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <AnimatedSection>          <SectionHeader badge="Location" title="Areas We Serve" accent={PRIMARY} /></AnimatedSection>
          <div className="text-center">
            <GlassCard className="p-8 inline-block">
              <div className="flex items-center gap-3 text-lg">
                <MapPin size={24} weight="duotone" style={{ color: PRIMARY }} />
                <MapLink address={data.address} className="text-[#1c1917] font-semibold" />
              </div>
              <p className="text-[#6b7280] text-sm mt-2">Available for travel &amp; destination shoots</p>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* ══════════════════ 11. HOURS ══════════════════ */}
      {data.hours && (
        <section className="relative z-10 py-24 md:py-32 overflow-hidden">
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #faf9f7 0%, #141210 50%, #faf9f7 100%)" }} />
          <FilmStripBG opacity={0.02} accent={PRIMARY} />
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-[20%] left-[15%] w-[400px] h-[400px] rounded-full blur-[160px]" style={{ background: `${PRIMARY}06` }} />
          </div>
          <div className="max-w-3xl mx-auto px-6 relative z-10">
            <AnimatedSection>          <SectionHeader badge="Availability" title="Studio Hours" accent={PRIMARY} /></AnimatedSection>
            <div className="text-center">
              <ShimmerBorder accent={PRIMARY}>
                <div className="p-8">
                  <Clock size={32} weight="duotone" style={{ color: PRIMARY }} className="mx-auto mb-4" />
                  <p className="text-[#4b5563] leading-relaxed whitespace-pre-line text-lg">{data.hours}</p>
                  <p className="text-sm mt-4 font-semibold" style={{ color: PRIMARY }}>Weekend &amp; evening sessions by appointment</p>
                </div>
              </ShimmerBorder>
            </div>
          </div>
        </section>
      )}

      
      {/* ══════════════════ MID-PAGE CTA ══════════════════ */}
      <section className="relative z-10 py-12 sm:py-16 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${PRIMARY}15, ${PRIMARY}08)` }} />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: PRIMARY }}>
            Don&apos;t Miss Out
          </p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-3">
            Ready to Get Started?
          </h2>
          <p className="text-slate-400 mb-6 text-sm sm:text-base">
            Limited time — claim your free professional website today before it&apos;s offered to a competitor.
          </p>
          <a
            href={`/claim/${data.id}`}
            className="inline-flex items-center gap-2 min-h-[48px] px-8 py-3 rounded-full text-white font-bold text-base hover:shadow-lg transition-all duration-300"
            style={{ background: PRIMARY }}
          >
            Claim This Website
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </a>
        </div>
      </section>

      {/* ══════════════════ 12. FAQ ══════════════════ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #faf9f7 0%, #141210 50%, #faf9f7 100%)" }} />
        <FilmStripBG opacity={0.02} accent={PRIMARY} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] left-[15%] w-[400px] h-[400px] rounded-full blur-[160px]" style={{ background: `${PRIMARY}06` }} />
        </div>
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <AnimatedSection>          <SectionHeader badge="FAQ" title="Common Questions" accent={PRIMARY} /></AnimatedSection>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} question={faq.q} answer={faq.a} isOpen={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ 13. CONTACT ══════════════════ */}
      <section id="contact" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #faf9f7 0%, #0f0e0c 50%, #faf9f7 100%)" }} />
        <AperturePattern opacity={0.02} accent={PRIMARY} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] rounded-full blur-[180px]" style={{ background: `${PRIMARY}06` }} />
        </div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: PRIMARY, borderColor: `${PRIMARY}33`, background: `${PRIMARY}0d` }}>Contact</span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6 text-[#1c1917]">Let&apos;s Create Together</h2>
              <p className="text-[#6b7280] leading-relaxed mb-8">
                Ready to capture your special moments? Reach out to {data.businessName} to discuss your vision and book your session.
              </p>
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: PRIMARY_GLOW }}><MapPin size={20} weight="duotone" style={{ color: PRIMARY }} /></div>
                  <div><p className="text-sm font-semibold text-[#1c1917]">Studio</p><MapLink address={data.address} className="text-sm text-[#6b7280]" /></div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: PRIMARY_GLOW }}><Phone size={20} weight="duotone" style={{ color: PRIMARY }} /></div>
                  <div><p className="text-sm font-semibold text-[#1c1917]">Phone</p><PhoneLink phone={data.phone} className="text-sm text-[#6b7280]" /></div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: PRIMARY_GLOW }}><Camera size={20} weight="duotone" style={{ color: PRIMARY }} /></div>
                  <div><p className="text-sm font-semibold text-[#1c1917]">Booking</p><p className="text-sm text-[#6b7280]">Now accepting bookings for all seasons</p></div>
                </div>
                {data.hours && (
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: PRIMARY_GLOW }}><Clock size={20} weight="duotone" style={{ color: PRIMARY }} /></div>
                    <div><p className="text-sm font-semibold text-[#1c1917]">Hours</p><p className="text-sm text-[#6b7280] whitespace-pre-line">{data.hours}</p></div>
                  </div>
                )}
              </div>
            </div>

            <GlassCard className="p-8">
              <h3 className="text-xl font-semibold text-[#1c1917] mb-6">Book Your Session</h3>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className="block text-sm text-[#6b7280] mb-1.5">First Name</label><input type="text" className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-[#1c1917] placeholder-gray-400 focus:outline-none text-sm" placeholder="Jane" /></div>
                  <div><label className="block text-sm text-[#6b7280] mb-1.5">Last Name</label><input type="text" className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-[#1c1917] placeholder-gray-400 focus:outline-none text-sm" placeholder="Smith" /></div>
                </div>
                <div><label className="block text-sm text-[#6b7280] mb-1.5">Phone</label><input type="tel" className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-[#1c1917] placeholder-gray-400 focus:outline-none text-sm" placeholder="(555) 123-4567" /></div>
                <div>
                  <label className="block text-sm text-[#6b7280] mb-1.5">Service</label>
                  <select className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-[#1c1917] focus:outline-none text-sm">
                    <option value="" className="bg-white">Select a service</option>
                    {data.services.map((s) => (<option key={s.name} value={s.name.toLowerCase().replace(/\s+/g, "-")} className="bg-white">{s.name}</option>))}
                  </select>
                </div>
                <div><label className="block text-sm text-[#6b7280] mb-1.5">Tell Us About Your Vision</label><textarea rows={4} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-[#1c1917] placeholder-gray-400 focus:outline-none text-sm resize-none" placeholder="Describe the shoot you're envisioning..." /></div>
                <MagneticButton className="w-full py-4 rounded-xl text-base font-semibold text-black flex items-center justify-center gap-2 cursor-pointer" style={{ background: PRIMARY } as React.CSSProperties}>
                  Send Inquiry
                  <ArrowRight size={18} weight="bold" />
                </MagneticButton>
              </form>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* ══════════════════ 14. GUARANTEE ══════════════════ */}
      <section className="relative z-10 py-16 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #faf9f7 0%, #141210 100%)" }} />
        <AperturePattern opacity={0.015} accent={PRIMARY} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full blur-[180px]" style={{ background: `${PRIMARY}06` }} />
        </div>

        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <ShimmerBorder accent={PRIMARY}>
            <div className="p-8 md:p-12">
              <ShieldCheck size={48} weight="fill" style={{ color: PRIMARY }} className="mx-auto mb-4" />
              <h2 className="text-2xl md:text-4xl font-extrabold text-[#1c1917] mb-4">Our Guarantee</h2>
              <p className="text-[#6b7280] leading-relaxed max-w-2xl mx-auto text-lg">
                {data.businessName} is committed to delivering images you&apos;ll treasure forever. If you&apos;re not thrilled with your gallery, we&apos;ll make it right with a complimentary re-shoot.
              </p>
              <div className="flex flex-wrap justify-center gap-4 mt-8">
                {["Professional Equipment", "Expert Editing", "Satisfaction Guaranteed", "Fast Delivery"].map((item) => (
                  <span key={item} className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border" style={{ color: PRIMARY, borderColor: `${PRIMARY}33`, background: `${PRIMARY}0d` }}>
                    <CheckCircle size={16} weight="fill" />{item}
                  </span>
                ))}
              </div>
            </div>
          </ShimmerBorder>
        </div>
      </section>

      {/* ══════════════════ 15. FOOTER ══════════════════ */}
      <footer className="relative z-10 border-t border-gray-100 py-10 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #faf9f7 0%, #f5f3ef 100%)" }} />
        <AperturePattern opacity={0.015} accent={PRIMARY} />
        <div className="mx-auto max-w-6xl px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Aperture size={22} weight="fill" style={{ color: PRIMARY }} />
                <span className="text-lg font-bold text-[#1c1917]">{data.businessName}</span>
              </div>
              <p className="text-sm text-[#9ca3af] leading-relaxed">{data.about.length > 120 ? data.about.slice(0, 120).trim() + "..." : data.about}</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[#1c1917] mb-3">Quick Links</h4>
              <div className="space-y-2">
                {["Portfolio", "Services", "About", "Contact"].map((link) => (
                  <a key={link} href={`#${link.toLowerCase()}`} className="block text-sm text-[#9ca3af] hover:text-[#1c1917] transition-colors">{link}</a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[#1c1917] mb-3">Contact</h4>
              <div className="space-y-2 text-sm text-[#9ca3af]">
                <p><PhoneLink phone={data.phone} /></p>
                <p><MapLink address={data.address} /></p>
                {data.socialLinks && Object.entries(data.socialLinks).map(([platform, url]) => (
                  <a key={platform} href={url} target="_blank" rel="noopener noreferrer" className="block hover:text-[#1c1917] transition-colors capitalize">{platform}</a>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-[#9ca3af]">
              <Aperture size={14} weight="fill" style={{ color: PRIMARY }} />
              <span>{data.businessName} &copy; {new Date().getFullYear()}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#6b7280]">
              <span className="flex items-center gap-1.5"><BluejayLogo size={14} className="text-sky-500" /> Created by <a href="https://bluejayportfolio.com" target="_blank" rel="noopener noreferrer" style={{textDecoration:"underline"}}>bluejayportfolio.com</a></span>
            </div>
          </div>
        </div>
      </footer>

      <ClaimBanner businessName={data.businessName} accentColor={PRIMARY} prospectId={data.id} />
      <div className="h-14 md:h-28" />
    </main>
  );
}
