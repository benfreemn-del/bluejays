"use client";

/* eslint-disable @next/next/no-img-element -- These static marketing and preview components intentionally use plain img tags to preserve existing markup and visual behavior during lint-only cleanup. */

import { useState, useEffect, useRef, useCallback } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  AnimatePresence,
} from "framer-motion";
import {
  Scissors,
  PaintBrush,
  Sparkle,
  Drop,
  Flower,
  Heart,
  Phone,
  MapPin,
  Clock,
  ArrowRight,
  Star,
  InstagramLogo,
  CalendarBlank,
  CheckCircle,
  CaretDown,
  X,
  List,
  Play,
  Crown,
  CalendarCheck,
  MagicWand,
  Palette,
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
const DARK = "#1a0a10";
const DEFAULT_ROSE = "#e11d48";
const ROSE_LIGHT = "#fb7185";

function getAccent(accentColor?: string) {
  const c = accentColor || DEFAULT_ROSE;
  return { ROSE: c, ROSE_GLOW: `${c}26` };
}

/* ───────────────────────── SERVICE ICON MAP ───────────────────────── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SERVICE_ICON_MAP: Record<string, any> = {
  cut: Scissors,
  hair: Scissors,
  color: PaintBrush,
  highlight: PaintBrush,
  balayage: PaintBrush,
  nail: Drop,
  manicure: Drop,
  pedicure: Drop,
  facial: Sparkle,
  skin: Sparkle,
  wax: Heart,
  brow: Heart,
  lash: Heart,
  massage: Flower,
  bridal: Flower,
  style: Scissors,
  blowout: Scissors,
  extension: Scissors,
};

function getServiceIcon(serviceName: string) {
  const lower = serviceName.toLowerCase();
  for (const [key, Icon] of Object.entries(SERVICE_ICON_MAP)) {
    if (lower.includes(key)) return Icon;
  }
  return Scissors;
}

/* ───────────────────────── STOCK FALLBACK IMAGES (UNIQUE TO SALON) ───────────────────────── */
const STOCK_HERO_POOL = ["https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1400&q=80"];
const STOCK_ABOUT_POOL = ["https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80"];
const STOCK_GALLERY = [
  "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=600&q=80",
  "https://images.unsplash.com/photo-1559599101-f09722fb4948?w=600&q=80",
  "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=800&q=80",
  "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800&q=80",
];

/* ───────────────────────── FLOWING GRADIENT ───────────────────────── */
function FlowingGradient({ accent }: { accent: string }) {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden hidden md:block">
      <motion.div
        className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%]"
        animate={{
          background: [
            `radial-gradient(ellipse at 30% 40%, ${accent}0f 0%, transparent 60%)`,
            `radial-gradient(ellipse at 60% 50%, ${accent}0a 0%, transparent 60%)`,
            `radial-gradient(ellipse at 40% 60%, ${accent}08 0%, transparent 60%)`,
            `radial-gradient(ellipse at 30% 40%, ${accent}0f 0%, transparent 60%)`,
          ],
        }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

/* ───────────────────────── MORPHING BLOB ───────────────────────── */
function MorphingBlob({ accent }: { accent: string }) {
  return (
    <div className="relative w-full max-w-lg mx-auto aspect-square flex items-center justify-center">
      <svg viewBox="0 0 400 400" className="w-full h-full">
        <defs>
          <linearGradient id="blobGradPrev" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={accent} stopOpacity="0.6">
              <animate attributeName="stop-color" values={`${accent};${ROSE_LIGHT};${accent}`} dur="8s" repeatCount="indefinite" />
            </stop>
            <stop offset="100%" stopColor={ROSE_LIGHT} stopOpacity="0.3">
              <animate attributeName="stop-color" values={`${ROSE_LIGHT};${accent};${ROSE_LIGHT}`} dur="8s" repeatCount="indefinite" />
            </stop>
          </linearGradient>
        </defs>
        <motion.path
          fill="url(#blobGradPrev)"
          animate={{
            d: [
              "M200,50 C300,50 370,120 360,200 C350,300 280,370 200,360 C100,350 40,280 50,200 C60,100 120,50 200,50Z",
              "M200,60 C280,40 380,130 350,210 C320,310 260,380 180,350 C80,320 30,250 60,180 C90,90 140,70 200,60Z",
              "M210,55 C310,70 360,150 340,230 C310,330 240,370 170,340 C70,300 50,220 80,160 C110,80 150,45 210,55Z",
              "M200,50 C300,50 370,120 360,200 C350,300 280,370 200,360 C100,350 40,280 50,200 C60,100 120,50 200,50Z",
            ],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>
      <div className="absolute inset-12 rounded-full blur-3xl" style={{ background: `${accent}15` }} />
    </div>
  );
}

/* ───────────────────────── ROSE PATTERN ───────────────────────── */
function RosePattern({ opacity = 0.03, accent }: { opacity?: number; accent: string }) {
  const pid = `rosePatPrev-${accent.replace("#", "")}`;
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }}>
      <defs>
        <pattern id={pid} width="60" height="60" patternUnits="userSpaceOnUse">
          <circle cx="30" cy="30" r="12" fill="none" stroke={accent} strokeWidth="0.3" />
          <circle cx="30" cy="30" r="6" fill="none" stroke={accent} strokeWidth="0.3" />
          <circle cx="30" cy="30" r="2" fill={accent} opacity="0.2" />
          <circle cx="10" cy="10" r="1" fill={accent} opacity="0.15" />
          <circle cx="50" cy="50" r="1" fill={accent} opacity="0.15" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${pid})`} />
    </svg>
  );
}

/* ───────────────────────── GLASS CARD ───────────────────────── */
function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] ${className}`}>
      {children}
    </div>
  );
}

/* ───────────────────────── MAGNETIC BUTTON ───────────────────────── */
function MagneticButton({ children, className = "", onClick, style, href }: {
  children: React.ReactNode; className?: string; onClick?: () => void; style?: React.CSSProperties; href?: string;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, springFast);
  const springY = useSpring(y, springFast);
  const isTouchDevice = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current || isTouchDevice) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left - rect.width / 2) * 0.25);
    y.set((e.clientY - rect.top - rect.height / 2) * 0.25);
  }, [x, y, isTouchDevice]);

  const handleMouseLeave = useCallback(() => { x.set(0); y.set(0); }, [x, y]);

  if (href) {
    return <motion.a href={href} ref={ref as unknown as React.Ref<HTMLAnchorElement>} style={{ x: springX, y: springY, willChange: "transform", ...style }} onMouseMove={handleMouseMove as unknown as React.MouseEventHandler<HTMLAnchorElement>} onMouseLeave={handleMouseLeave} className={className} whileTap={{ scale: 0.97 }}>{children}</motion.a>;
  }
  return <motion.button ref={ref} style={{ x: springX, y: springY, willChange: "transform", ...style }} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} onClick={onClick} className={className} whileTap={{ scale: 0.97 }}>{children}</motion.button>;
}

/* ───────────────────────── SHIMMER BORDER ───────────────────────── */
function ShimmerBorder({ children, className = "", accent }: { children: React.ReactNode; className?: string; accent: string }) {
  return (
    <div className={`relative rounded-2xl p-[1px] overflow-hidden ${className}`}>
      <motion.div className="absolute inset-0 rounded-2xl" style={{ background: `conic-gradient(from 0deg, transparent, ${accent}, transparent, ${ROSE_LIGHT}, transparent)`, willChange: "transform" }} animate={{ rotate: [0, 360] }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} />
      <div className="relative rounded-2xl z-10" style={{ background: DARK }}>{children}</div>
    </div>
  );
}

/* ───────────────────────── ACCORDION ITEM ───────────────────────── */
function AccordionItem({ question, answer, isOpen, onToggle }: { question: string; answer: string; isOpen: boolean; onToggle: () => void }) {
  return (
    <GlassCard className="overflow-hidden">
      <button onClick={onToggle} className="w-full flex items-center justify-between p-5 md:p-6 text-left group cursor-pointer">
        <span className="text-lg font-semibold text-white pr-4">{question}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={spring}><CaretDown size={20} className="text-slate-400 shrink-0" /></motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={spring} className="overflow-hidden"><p className="px-5 pb-5 md:px-6 md:pb-6 text-slate-400 leading-relaxed">{answer}</p></motion.div>)}
      </AnimatePresence>
    </GlassCard>
  );
}

/* ───────────────────────── SECTION HEADER ───────────────────────── */
function SectionHeader({ badge, title, subtitle, accent }: { badge: string; title: string; subtitle?: string; accent: string }) {
  return (
    <div className="text-center mb-16">
      <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: accent, borderColor: `${accent}33`, background: `${accent}0d` }}>{badge}</span>
      <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white">{title}</h2>
      <div className="h-0.5 w-16 mx-auto mt-4" style={{ background: `linear-gradient(to right, ${accent}, transparent)` }} />
      {subtitle && <p className="text-slate-400 mt-4 max-w-2xl text-lg leading-relaxed mx-auto">{subtitle}</p>}
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
      initial={{ opacity: 0, x: 50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: "easeOut" as const }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function V2SalonPreview({ data }: { data: GeneratedSiteData }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const { ROSE, ROSE_GLOW } = getAccent(data.accentColor);

  const uniquePhotos = data.photos ? [...new Set(data.photos)] : [];


  const heroImage = uniquePhotos[0] || pickFromPool(STOCK_HERO_POOL, data.businessName);


  const heroCardImage = uniquePhotos[1] || pickFromPool(STOCK_ABOUT_POOL, data.businessName, 1);


  const aboutImage = uniquePhotos[2] || pickFromPool(STOCK_ABOUT_POOL, data.businessName, 2);
  const galleryImages = data.photos?.length > 2 ? data.photos.slice(2, 6) : pickGallery(STOCK_GALLERY, data.businessName);
  const phoneDigits = data.phone.replace(/\D/g, "");

  const processSteps = [
    { step: "01", title: "Book Online", desc: "Choose your service and preferred stylist. We will confirm your appointment instantly." },
    { step: "02", title: "Consultation", desc: "Your stylist discusses your goals, assesses your hair, and recommends the perfect look." },
    { step: "03", title: "The Experience", desc: "Relax and enjoy a premium salon experience with expert care and attention to detail." },
    { step: "04", title: "Stunning Results", desc: "Walk out feeling confident and beautiful. We guarantee you will love your new look." },
  ];

  const faqs = [
    { q: `What services does ${data.businessName} offer?`, a: `We provide a full range of beauty services including ${data.services.slice(0, 3).map(s => s.name).join(", ")}, and more. Book a consultation to find the perfect service for you.` },
    { q: "Do I need an appointment?", a: "We recommend booking appointments in advance to ensure availability. Walk-ins are welcome based on availability." },
    { q: "What products do you use?", a: "We use only premium, professional-grade products from top salon brands to ensure the best results and healthiest hair." },
    { q: "Do you offer gift cards?", a: `Yes! ${data.businessName} gift cards are available in any denomination and make the perfect gift for any occasion.` },
  ];

  /* Fallback testimonials */
  const fallbackTestimonials = [
    { name: "Jessica P.", text: "Best haircut I've ever had! The stylists here are true artists. I'll never go anywhere else.", rating: 5 },
    { name: "Brittany M.", text: "My color came out exactly how I wanted. They really listen and deliver beautiful results.", rating: 5 },
    { name: "Vanessa K.", text: "Made me feel like a princess for my wedding day. Hair and makeup were absolutely flawless.", rating: 5 }
  ];
  const testimonials = data.testimonials?.length > 0 ? data.testimonials : fallbackTestimonials;

  /* ── Service category badges ── */
  const serviceBadges = [
    { label: "Haircuts & Styling", icon: Scissors },
    { label: "Color & Highlights", icon: PaintBrush },
    { label: "Balayage", icon: Palette },
    { label: "Extensions", icon: MagicWand },
    { label: "Bridal", icon: Flower },
    { label: "Treatments", icon: Sparkle },
  ];

  /* ── Service menu pricing ── */
  const serviceMenuItems = [
    { title: "Haircut & Style", price: "from $55", desc: "Precision cut tailored to your face shape, finished with a professional blowout.", icon: Scissors },
    { title: "Full Color", price: "from $120", desc: "Rich, vibrant color using premium salon-grade products for lasting results.", icon: PaintBrush },
    { title: "Balayage", price: "from $200+", desc: "Hand-painted, sun-kissed highlights for a natural, radiant look.", icon: Palette },
  ];

  /* ── Stylist profiles ── */
  const stylistProfiles = [
    { name: "Color Specialist", specialty: "Precision color, balayage, and vivid fashion shades", icon: PaintBrush },
    { name: "Balayage Expert", specialty: "Natural, hand-painted highlights and dimensional color", icon: Palette },
    { name: "Bridal & Special Events", specialty: "Elegant updos, bridal styling, and occasion looks", icon: Crown },
    { name: "Texture & Curly Hair", specialty: "Curl-specific cuts, treatments, and styling techniques", icon: MagicWand },
  ];

  /* ── Salon experience steps ── */
  const salonExperience = [
    { step: "01", title: "Book Your Appointment", desc: "Choose your service and preferred stylist online or by phone.", icon: CalendarCheck },
    { step: "02", title: "Consultation & Vision", desc: "Share your goals and inspirations. Your stylist crafts the perfect plan.", icon: Heart },
    { step: "03", title: "The Transformation", desc: "Sit back and relax while our experts bring your vision to life.", icon: MagicWand },
    { step: "04", title: "Love Your New Look", desc: "Walk out feeling radiant, confident, and absolutely beautiful.", icon: Sparkle },
  ];

  /* ── Why choose us pillars ── */
  const whyChooseUs = [
    { title: "Award-Winning Stylists", desc: "Our team brings years of training and a passion for beauty to every appointment.", icon: Crown },
    { title: "Premium Products", desc: "We use only the finest professional-grade products for healthy, lasting results.", icon: Sparkle },
    { title: "Relaxing Atmosphere", desc: "From the moment you arrive, enjoy a calm, luxurious environment designed for you.", icon: Flower },
    { title: "Complimentary Consultation", desc: "Every visit begins with a personalized consultation to understand your unique style.", icon: Heart },
  ];

  /* ── Competitor comparison rows ── */
  const comparisonRows = [
    { feature: "Personal Consultation", us: true, them: "Rarely" },
    { feature: "Premium Products", us: true, them: "Generic" },
    { feature: "Consistent Stylist", us: true, them: "No" },
    { feature: "Relaxing Environment", us: true, them: "No" },
    { feature: "Online Booking", us: true, them: "Sometimes" },
    { feature: "Loyalty Rewards", us: true, them: "No" },
    { feature: "Custom Color Mixing", us: true, them: "No" },
  ];

  /* ── Quiz options ── */
  const quizOptions = [
    { title: "Haircut & Refresh", desc: "A quick transformation — new cut, fresh style", icon: Scissors, color: ROSE },
    { title: "Color Change", desc: "Bold or subtle — discover your perfect shade", icon: PaintBrush, color: ROSE_LIGHT },
    { title: "Special Occasion", desc: "Weddings, events, and unforgettable moments", icon: Crown, color: ROSE },
    { title: "Hair Repair", desc: "Deep treatments and restoration for healthy hair", icon: Sparkle, color: ROSE_LIGHT },
  ];

  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden" style={{ background: DARK, color: "#f1f5f9" }}>
      <FlowingGradient accent={ROSE} />

      {/* ══════════════════ 1. NAV ══════════════════ */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-4">
          <GlassCard className="flex items-center justify-between px-4 md:px-6 py-3">
            <div className="flex items-center gap-2">
              <Scissors size={24} weight="duotone" style={{ color: ROSE }} />
              <span className="text-lg font-bold tracking-tight text-white">{data.businessName}</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
              <a href="#services" className="hover:text-white transition-colors">Services</a>
              <a href="#about" className="hover:text-white transition-colors">About</a>
              <a href="#gallery" className="hover:text-white transition-colors">Gallery</a>
              <a href="#contact" className="hover:text-white transition-colors">Contact</a>
            </div>
            <div className="flex items-center gap-3">
              <MagneticButton className="px-4 md:px-5 py-2 rounded-full text-sm font-semibold text-white transition-colors cursor-pointer" style={{ background: ROSE } as React.CSSProperties}>
                Book Now
              </MagneticButton>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors">
                {mobileMenuOpen ? <X size={24} /> : <List size={24} />}
              </button>
            </div>
          </GlassCard>

          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3, ease: "easeInOut" }} className="md:hidden mt-2 overflow-hidden">
                <GlassCard className="flex flex-col gap-1 px-4 py-4">
                  {[{ label: "Services", href: "#services" }, { label: "About", href: "#about" }, { label: "Gallery", href: "#gallery" }, { label: "Contact", href: "#contact" }].map((link) => (
                    <a key={link.label} href={link.href} onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors">{link.label}</a>
                  ))}
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* ══════════════════ 2. HERO ══════════════════ */}
      <section className="relative min-h-[100dvh] flex items-center pt-24 z-10 overflow-hidden">

        <div className="absolute inset-0">
          <img src={heroImage} alt={`${data.businessName}`} className="w-full h-full object-cover object-center" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-black/10" />
          <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-transparent" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          <div className="space-y-8">
            <div>
              <p className="text-sm uppercase tracking-widest mb-4" style={{ color: ROSE }}>
                <Sparkle size={14} weight="fill" className="inline mr-2" />
                Premium Beauty Studio
              </p>
              <h1 className="text-3xl md:text-6xl tracking-tighter leading-none font-bold text-white" style={{ textShadow: "0 2px 20px rgba(0,0,0,0.8), 0 4px 40px rgba(0,0,0,0.5)" }}>
                {data.tagline}
              </h1>
            </div>
            <p className="text-lg text-slate-400 max-w-md leading-relaxed">
              {(() => { const t = data.about; if (t.length <= 180) return t; const dot = t.indexOf('.', 80); return dot > 0 && dot < 220 ? t.slice(0, dot + 1) : t.slice(0, 180).trim() + '...'; })()}
            </p>
            <div className="flex flex-wrap gap-4">
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white flex items-center gap-2 cursor-pointer" style={{ background: ROSE } as React.CSSProperties}>
                Book Appointment <ArrowRight size={18} weight="bold" />
              </MagneticButton>
              <MagneticButton href={`tel:${phoneDigits}`} className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/10 flex items-center gap-2 cursor-pointer">
                <Phone size={18} weight="duotone" /> <PhoneLink phone={data.phone} />
              </MagneticButton>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-slate-400">
              <span className="flex items-center gap-2"><MapPin size={16} weight="duotone" style={{ color: ROSE }} /><MapLink address={data.address} /></span>
              <span className="flex items-center gap-2"><CalendarBlank size={16} weight="duotone" style={{ color: ROSE }} />Online Booking Available</span>
            </div>
          </div>

          <div className="hidden md:flex items-center justify-center">
            <MorphingBlob accent={ROSE} />
          </div>
        </div>
      </section>

      {/* ══════════════════ 3. STATS ══════════════════ */}
      <section className="relative z-10 py-16 overflow-hidden border-y" style={{ borderColor: `${ROSE}1a` }}>
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, #150810 0%, ${DARK} 100%)` }} />
        <RosePattern opacity={0.02} accent={ROSE} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] rounded-full blur-[180px]" style={{ background: `${ROSE}08` }} /></div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {data.stats.map((stat, i) => {
              const statIcons = [Heart, Scissors, Star, Sparkle];
              const Icon = statIcons[i % statIcons.length];
              return (
                <div key={stat.label} className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Icon size={22} weight="fill" style={{ color: ROSE }} />
                    <span className="text-3xl md:text-4xl font-extrabold text-white">{stat.value}</span>
                  </div>
                  <span className="text-slate-500 text-sm font-medium tracking-wide uppercase">{stat.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════ FEATURE 1: SERVICE CATEGORY BADGES ══════════════════ */}
      <section className="relative z-10 py-16 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${DARK} 0%, #150810 100%)` }} />
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <div className="flex flex-wrap justify-center gap-3">
            {serviceBadges.map((badge) => (
              <div key={badge.label} className="flex items-center gap-2 px-5 py-2.5 rounded-full border text-sm font-medium transition-colors hover:bg-white/5" style={{ color: ROSE, borderColor: `${ROSE}33`, background: `${ROSE}0a` }}>
                <badge.icon size={16} weight="duotone" />
                {badge.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ FEATURE 9: GOOGLE REVIEWS HEADER ══════════════════ */}
      {(data.googleRating || data.reviewCount) && (
        <section className="relative z-10 py-10 overflow-hidden">
          <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, #150810 0%, ${DARK} 100%)` }} />
          <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full border" style={{ borderColor: `${ROSE}22`, background: `${ROSE}08` }}>
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={20} weight="fill" style={{ color: i < Math.round(data.googleRating || 5) ? "#facc15" : "#374151" }} />
                ))}
              </div>
              <span className="text-white font-bold text-lg">{data.googleRating || "5.0"}</span>
              {data.reviewCount && <span className="text-slate-400 text-sm">({data.reviewCount}+ reviews)</span>}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════ 4. TESTIMONIALS ══════════════════ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${DARK} 0%, #150810 50%, ${DARK} 100%)` }} />
        <RosePattern opacity={0.02} accent={ROSE} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[20%] right-[15%] w-[400px] h-[400px] rounded-full blur-[160px]" style={{ background: `${ROSE}06` }} /></div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <AnimatedSection>          <SectionHeader badge="Reviews" title="What Our Clients Say" accent={ROSE} /></AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <GlassCard key={i} className="p-6 h-full flex flex-col">
                <div className="flex gap-0.5 mb-4">{Array.from({ length: t.rating || 5 }).map((_, j) => <Star key={j} size={16} weight="fill" style={{ color: ROSE }} />)}</div>
                <p className="text-slate-300 leading-relaxed flex-1 text-sm mb-4">&ldquo;{t.text}&rdquo;</p>
                <div className="pt-4 border-t border-white/5 flex items-center justify-between"><span className="text-sm font-semibold text-white">{t.name}</span></div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ 5. SERVICES ══════════════════ */}
      <section id="services" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${DARK} 0%, #150810 50%, ${DARK} 100%)` }} />
        <RosePattern accent={ROSE} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[10%] right-[5%] w-[500px] h-[500px] rounded-full blur-[160px]" style={{ background: `${ROSE}08` }} /></div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Our Services" title="Beauty Services" subtitle={`From precision cuts to luxurious treatments, ${data.businessName} delivers an elevated beauty experience.`} accent={ROSE} />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.services.map((service, i) => {
              const Icon = getServiceIcon(service.name);
              return (
                <div key={service.name} className="group relative p-7 rounded-2xl border border-white/[0.06] hover:border-opacity-30 transition-all duration-500 overflow-hidden bg-white/[0.02]">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: `radial-gradient(circle at 50% 0%, ${ROSE}15, transparent 70%)` }} />
                  <div className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `linear-gradient(to right, transparent, ${ROSE}4d, transparent)` }} />
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-5">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 border" style={{ background: ROSE_GLOW, borderColor: `${ROSE}33` }}>
                        <Icon size={24} weight="duotone" style={{ color: ROSE }} />
                      </div>
                      <span className="text-xs font-mono text-slate-600">{String(i + 1).padStart(2, "0")}</span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{service.name}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{service.description || ""}</p>
                    {service.price && <p className="text-sm font-semibold mt-3" style={{ color: ROSE }}>{service.price}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════ FEATURE 2: SERVICE MENU / PRICING ══════════════════ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${DARK} 0%, #120910 50%, ${DARK} 100%)` }} />
        <RosePattern opacity={0.02} accent={ROSE} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[30%] left-[20%] w-[500px] h-[500px] rounded-full blur-[180px]" style={{ background: `${ROSE}06` }} /></div>
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Pricing" title="Service Menu" subtitle="Transparent pricing for our most popular services. Custom quotes available for specialized treatments." accent={ROSE} />
          <div className="grid md:grid-cols-3 gap-6">
            {serviceMenuItems.map((item, i) => (
              <GlassCard key={item.title} className="p-7 text-center group hover:border-opacity-30 transition-all duration-500">
                <div className="w-14 h-14 rounded-full mx-auto mb-5 flex items-center justify-center" style={{ background: `${ROSE}15`, border: `1px solid ${ROSE}33` }}>
                  <item.icon size={26} weight="duotone" style={{ color: ROSE }} />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">{item.title}</h3>
                <p className="text-2xl font-extrabold mb-3" style={{ color: ROSE }}>{item.price}</p>
                <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
              </GlassCard>
            ))}
          </div>
          <p className="text-center text-slate-500 text-sm mt-8">Prices vary based on hair length, thickness, and desired results. Contact us for a personalized quote.</p>
        </div>
      </section>

      {/* ══════════════════ FEATURE 3: STYLIST PROFILES ══════════════════ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${DARK} 0%, #150810 50%, ${DARK} 100%)` }} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] rounded-full blur-[160px]" style={{ background: `${ROSE_LIGHT}06` }} /></div>
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Our Team" title="Meet Our Stylists" subtitle="Each stylist brings unique expertise and a passion for making you look and feel your best." accent={ROSE} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stylistProfiles.map((stylist) => (
              <GlassCard key={stylist.name} className="p-6 text-center group hover:border-opacity-30 transition-all duration-500">
                <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${ROSE}22, ${ROSE}0a)`, border: `1px solid ${ROSE}33` }}>
                  <stylist.icon size={28} weight="duotone" style={{ color: ROSE }} />
                </div>
                <h3 className="text-base font-bold text-white mb-2">{stylist.name}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{stylist.specialty}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ 6. ABOUT ══════════════════ */}
      <section id="about" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${DARK} 0%, #120910 50%, ${DARK} 100%)` }} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[20%] left-[10%] w-[500px] h-[500px] rounded-full blur-[180px]" style={{ background: `${ROSE}06` }} /></div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="relative">
              <div className="rounded-2xl overflow-hidden border border-white/10">
                <img src={aboutImage} alt={`${data.businessName} salon`} className="w-full h-[400px] object-cover" />
              </div>
              <div className="absolute -bottom-4 -right-4 md:bottom-6 md:-right-6">
                <div className="px-5 py-3 rounded-xl backdrop-blur-md border text-white font-bold text-sm shadow-lg" style={{ background: `${ROSE}e6`, borderColor: `${ROSE}80` }}>
                  {data.stats[0] ? `${data.stats[0].value} ${data.stats[0].label}` : "Award-Winning Studio"}
                </div>
              </div>
            </div>
            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: ROSE, borderColor: `${ROSE}33`, background: `${ROSE}0d` }}>About Us</span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6 text-white">Where Beauty Meets Artistry</h2>
              <p className="text-slate-400 leading-relaxed mb-8">{data.about}</p>
              <div className="grid grid-cols-2 gap-4">
                {[{ icon: Scissors, label: "Expert Stylists" }, { icon: Sparkle, label: "Premium Products" }, { icon: Star, label: "5-Star Reviews" }, { icon: Heart, label: "Personalized Care" }].map((badge) => (
                  <GlassCard key={badge.label} className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: ROSE_GLOW }}><badge.icon size={20} weight="duotone" style={{ color: ROSE }} /></div>
                    <span className="text-sm font-semibold text-white">{badge.label}</span>
                  </GlassCard>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════ FEATURE 4: THE SALON EXPERIENCE ══════════════════ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${DARK} 0%, #150810 50%, ${DARK} 100%)` }} />
        <RosePattern opacity={0.025} accent={ROSE} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] rounded-full blur-[180px]" style={{ background: `${ROSE_LIGHT}06` }} /></div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Your Journey" title="The Salon Experience" subtitle="From booking to your stunning reveal, every step is designed for your comfort and delight." accent={ROSE} />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {salonExperience.map((step, i) => (
              <div key={step.step} className="relative">
                {i < salonExperience.length - 1 && <div className="hidden lg:block absolute top-10 left-[calc(50%+40px)] w-[calc(100%-80px)] h-px" style={{ background: `linear-gradient(to right, ${ROSE}33, ${ROSE}11)` }} />}
                <GlassCard className="p-6 text-center relative">
                  <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${ROSE}22, ${ROSE}0a)`, border: `1px solid ${ROSE}33` }}>
                    <step.icon size={28} weight="duotone" style={{ color: ROSE }} />
                  </div>
                  <span className="text-xs font-mono mb-2 block" style={{ color: ROSE }}>{step.step}</span>
                  <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
                </GlassCard>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ 8. GALLERY ══════════════════ */}
      <section id="gallery" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${DARK} 0%, #120910 50%, ${DARK} 100%)` }} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[30%] left-[20%] w-[500px] h-[500px] rounded-full blur-[200px]" style={{ background: `${ROSE}06` }} /></div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <AnimatedSection>          <SectionHeader badge="Portfolio" title="Our Work" accent={ROSE} /></AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {galleryImages.map((src, i) => {
              const titles = ["Signature Color Transformation", "Precision Styling", "Bridal Elegance", "Creative Artistry"];
              return (
                <div key={i} className="group relative rounded-2xl overflow-hidden border border-white/[0.06] hover:border-opacity-30 transition-all duration-500">
                  <img src={src} alt={titles[i] || `Work ${i + 1}`} className="w-full h-64 object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6"><h3 className="text-lg font-bold text-white mb-1">{titles[i] || `Work ${i + 1}`}</h3></div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════ FEATURE 5: WHY CHOOSE US ══════════════════ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${DARK} 0%, #150810 50%, ${DARK} 100%)` }} />
        <RosePattern opacity={0.02} accent={ROSE} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[20%] left-[10%] w-[500px] h-[500px] rounded-full blur-[180px]" style={{ background: `${ROSE}06` }} /></div>
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Why Us" title={`Why Choose ${data.businessName}`} subtitle="Experience the difference that dedication, talent, and premium care can make." accent={ROSE} />
          <div className="grid sm:grid-cols-2 gap-6">
            {whyChooseUs.map((item) => (
              <GlassCard key={item.title} className="p-7 flex items-start gap-5 group hover:border-opacity-30 transition-all duration-500">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${ROSE}15`, border: `1px solid ${ROSE}33` }}>
                  <item.icon size={26} weight="duotone" style={{ color: ROSE }} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ FEATURE 6: COMPETITOR COMPARISON ══════════════════ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${DARK} 0%, #120910 50%, ${DARK} 100%)` }} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[30%] right-[15%] w-[400px] h-[400px] rounded-full blur-[160px]" style={{ background: `${ROSE_LIGHT}06` }} /></div>
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Compare" title={`${data.businessName} vs Chain Salons`} accent={ROSE} />
          <GlassCard className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-6 py-4 text-slate-400 font-medium">Feature</th>
                    <th className="px-6 py-4 text-center font-bold text-white">{data.businessName}</th>
                    <th className="px-6 py-4 text-center font-medium text-slate-400">Chain Salons</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row, i) => (
                    <tr key={row.feature} className={i < comparisonRows.length - 1 ? "border-b border-white/5" : ""}>
                      <td className="px-6 py-4 text-slate-300 font-medium">{row.feature}</td>
                      <td className="px-6 py-4 text-center">
                        {row.us ? <CheckCircle size={22} weight="fill" className="inline" style={{ color: "#22c55e" }} /> : <X size={22} className="inline text-slate-600" />}
                      </td>
                      <td className="px-6 py-4 text-center text-slate-500">{row.them}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* ══════════════════ FEATURE 7: VIDEO PLACEHOLDER ══════════════════ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${DARK} 0%, #150810 50%, ${DARK} 100%)` }} />
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Virtual Tour" title="Tour Our Salon" subtitle="Step inside and see what makes our space so special." accent={ROSE} />
          <div className="relative rounded-2xl overflow-hidden border border-white/10 aspect-video group cursor-pointer">
            <img src={heroCardImage} alt={`${data.businessName} salon tour`} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300" style={{ background: `${ROSE}cc`, border: `2px solid ${ROSE}` }}>
                <Play size={36} weight="fill" className="text-white ml-1" />
              </div>
              <p className="text-white font-semibold text-lg">Watch Our Salon Tour</p>
              <p className="text-white/60 text-sm mt-1">See where the magic happens</p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════ FEATURE 8: SERVICE QUIZ ══════════════════ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${DARK} 0%, #120910 50%, ${DARK} 100%)` }} />
        <RosePattern opacity={0.02} accent={ROSE} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[40%] left-[20%] w-[400px] h-[400px] rounded-full blur-[180px]" style={{ background: `${ROSE}06` }} /></div>
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Find Your Service" title="What Are You Looking For?" subtitle="Select the service that best fits your needs and we will guide you to the perfect experience." accent={ROSE} />
          <div className="grid sm:grid-cols-2 gap-6">
            {quizOptions.map((option) => (
              <div key={option.title} className="group relative p-7 rounded-2xl border border-white/[0.06] hover:border-opacity-30 transition-all duration-500 cursor-pointer overflow-hidden bg-white/[0.02]">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: `radial-gradient(circle at 50% 0%, ${option.color}15, transparent 70%)` }} />
                <div className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `linear-gradient(to right, transparent, ${option.color}4d, transparent)` }} />
                <div className="relative z-10 flex items-start gap-5">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${option.color}15`, border: `1px solid ${option.color}33` }}>
                    <option.icon size={26} weight="duotone" style={{ color: option.color }} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">{option.title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{option.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white flex items-center gap-2 cursor-pointer mx-auto" style={{ background: ROSE } as React.CSSProperties}>
              Book a Consultation <ArrowRight size={18} weight="bold" />
            </MagneticButton>
          </div>
        </div>
      </section>

      {/* ══════════════════ 9. BOOKING CTA ══════════════════ */}
      <section className="relative z-10 py-20 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${ROSE}, ${ROSE}cc, ${ROSE})` }} />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='40' height='40' fill='none'/%3E%3Cpath d='M0 0L40 40M40 0L0 40' stroke='%23000' stroke-width='0.5'/%3E%3C/svg%3E\")" }} />
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <Flower size={48} weight="fill" className="mx-auto mb-6 text-white/80" />
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-4">Ready for a New Look?</h2>
          <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">Book your appointment today and let our expert stylists create the look you have been dreaming of.</p>
          <PhoneLink phone={data.phone} className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-white font-bold text-lg hover:bg-white/90 transition-colors" style={{ color: ROSE }}>
            <Phone size={20} weight="bold" /> {data.phone}
          </PhoneLink>
        </div>
      </section>

      {/* ══════════════════ 10. INSTAGRAM / SOCIAL ══════════════════ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${DARK} 0%, #120910 50%, ${DARK} 100%)` }} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[40%] right-[20%] w-[400px] h-[400px] rounded-full blur-[180px]" style={{ background: `${ROSE_LIGHT}06` }} /></div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <AnimatedSection>          <SectionHeader badge="Follow Us" title="Stay Connected" accent={ROSE} /></AnimatedSection>
          <div className="text-center">
            <GlassCard className="p-8 inline-block">
              <InstagramLogo size={32} weight="duotone" style={{ color: ROSE }} className="mx-auto mb-3" />
              <p className="text-white font-semibold text-lg mb-2">Follow us on social media</p>
              <p className="text-slate-400 text-sm">See our latest work, promotions, and behind-the-scenes content</p>
              {data.socialLinks && Object.entries(data.socialLinks).map(([platform, url]) => (
                <a key={platform} href={url} target="_blank" rel="noopener noreferrer" className="inline-block mt-3 px-4 py-2 rounded-full text-sm font-medium border transition-colors hover:bg-white/5 capitalize" style={{ color: ROSE, borderColor: `${ROSE}33` }}>
                  {platform}
                </a>
              ))}
            </GlassCard>
          </div>
        </div>
      </section>

      {/* ══════════════════ 11. HOURS ══════════════════ */}
      {data.hours && (
        <section className="relative z-10 py-24 md:py-32 overflow-hidden">
          <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${DARK} 0%, #150810 50%, ${DARK} 100%)` }} />
          <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[20%] left-[15%] w-[400px] h-[400px] rounded-full blur-[160px]" style={{ background: `${ROSE}06` }} /></div>
          <div className="max-w-3xl mx-auto px-6 relative z-10">
            <AnimatedSection>          <SectionHeader badge="Hours" title="When to Visit" accent={ROSE} /></AnimatedSection>
            <div className="text-center">
              <ShimmerBorder accent={ROSE}><div className="p-8"><Clock size={32} weight="duotone" style={{ color: ROSE }} className="mx-auto mb-4" /><p className="text-slate-300 leading-relaxed whitespace-pre-line text-lg">{data.hours}</p></div></ShimmerBorder>
            </div>
          </div>
        </section>
      )}

      
      {/* ══════════════════ MID-PAGE CTA ══════════════════ */}
      <section className="relative z-10 py-12 sm:py-16 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${ROSE}15, ${ROSE}08)` }} />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: ROSE }}>
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
            style={{ background: ROSE }}
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
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${DARK} 0%, #150810 50%, ${DARK} 100%)` }} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[20%] left-[15%] w-[400px] h-[400px] rounded-full blur-[160px]" style={{ background: `${ROSE}06` }} /></div>
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <AnimatedSection>          <SectionHeader badge="FAQ" title="Common Questions" accent={ROSE} /></AnimatedSection>
          <div className="space-y-3">{faqs.map((faq, i) => <AccordionItem key={i} question={faq.q} answer={faq.a} isOpen={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} />)}</div>
        </div>
      </section>

      {/* ══════════════════ 13. CONTACT ══════════════════ */}
      <section id="contact" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${DARK} 0%, #120910 50%, ${DARK} 100%)` }} />
        <RosePattern opacity={0.02} accent={ROSE} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] rounded-full blur-[180px]" style={{ background: `${ROSE}06` }} /></div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: ROSE, borderColor: `${ROSE}33`, background: `${ROSE}0d` }}>Contact</span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6 text-white">Book Your Visit</h2>
              <p className="text-slate-400 leading-relaxed mb-8">Ready to look and feel your best? Contact {data.businessName} today to schedule your appointment.</p>
              <div className="space-y-5">
                <div className="flex items-start gap-4"><div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: ROSE_GLOW }}><MapPin size={20} weight="duotone" style={{ color: ROSE }} /></div><div><p className="text-sm font-semibold text-white">Address</p><MapLink address={data.address} className="text-sm text-slate-400" /></div></div>
                <div className="flex items-start gap-4"><div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: ROSE_GLOW }}><Phone size={20} weight="duotone" style={{ color: ROSE }} /></div><div><p className="text-sm font-semibold text-white">Phone</p><PhoneLink phone={data.phone} className="text-sm text-slate-400" /></div></div>
                {data.hours && <div className="flex items-start gap-4"><div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: ROSE_GLOW }}><Clock size={20} weight="duotone" style={{ color: ROSE }} /></div><div><p className="text-sm font-semibold text-white">Hours</p><p className="text-sm text-slate-400 whitespace-pre-line">{data.hours}</p></div></div>}
              </div>
            </div>
            <GlassCard className="p-8">
              <h3 className="text-xl font-semibold text-white mb-6">Book an Appointment</h3>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className="block text-sm text-slate-400 mb-1.5">Name</label><input type="text" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none transition-colors text-sm" placeholder="Your name" /></div>
                  <div><label className="block text-sm text-slate-400 mb-1.5">Phone</label><input type="tel" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none transition-colors text-sm" placeholder="(555) 123-4567" /></div>
                </div>
                <div><label className="block text-sm text-slate-400 mb-1.5">Service</label>
                  <select className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none transition-colors text-sm">
                    <option value="" className="bg-neutral-900">Select a service</option>
                    {data.services.map((s) => <option key={s.name} value={s.name.toLowerCase().replace(/\s+/g, "-")} className="bg-neutral-900">{s.name}</option>)}
                  </select>
                </div>
                <div><label className="block text-sm text-slate-400 mb-1.5">Message</label><textarea rows={3} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none transition-colors text-sm resize-none" placeholder="Any preferences or requests..." /></div>
                <MagneticButton className="w-full py-4 rounded-xl text-base font-semibold text-white flex items-center justify-center gap-2 cursor-pointer" style={{ background: ROSE } as React.CSSProperties}>
                  Book Now <ArrowRight size={18} weight="bold" />
                </MagneticButton>
              </form>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* ══════════════════ FEATURE 10: NEW CLIENT SPECIAL CTA ══════════════════ */}
      <section className="relative z-10 py-20 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${DARK} 0%, #150810 100%)` }} />
        <RosePattern opacity={0.02} accent={ROSE} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full blur-[180px]" style={{ background: `${ROSE}0a` }} /></div>
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <ShimmerBorder accent={ROSE}>
            <div className="p-8 md:p-12">
              <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: ROSE, borderColor: `${ROSE}33`, background: `${ROSE}0d` }}>Limited Offer</span>
              <h2 className="text-2xl md:text-4xl font-extrabold text-white mb-4">New Client Special</h2>
              <p className="text-3xl md:text-5xl font-black mb-4" style={{ color: ROSE }}>First Visit 20% Off</p>
              <p className="text-slate-400 leading-relaxed max-w-xl mx-auto text-lg mb-8">Experience the {data.businessName} difference. Book your complimentary consultation and enjoy 20% off your first service.</p>
              <MagneticButton href={`tel:${phoneDigits}`} className="inline-flex items-center gap-3 px-8 py-4 rounded-full text-base font-semibold text-white cursor-pointer" style={{ background: ROSE } as React.CSSProperties}>
                <CalendarCheck size={20} weight="bold" /> Book Your Consultation
              </MagneticButton>
            </div>
          </ShimmerBorder>
        </div>
      </section>

      {/* ══════════════════ 14. TRUST ══════════════════ */}
      <section className="relative z-10 py-16 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${DARK} 0%, #150810 100%)` }} />
        <RosePattern opacity={0.015} accent={ROSE} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full blur-[180px]" style={{ background: `${ROSE}06` }} /></div>
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <ShimmerBorder accent={ROSE}>
            <div className="p-8 md:p-12">
              <Heart size={48} weight="fill" style={{ color: ROSE }} className="mx-auto mb-4" />
              <h2 className="text-2xl md:text-4xl font-extrabold text-white mb-4">Our Beauty Promise</h2>
              <p className="text-slate-400 leading-relaxed max-w-2xl mx-auto text-lg">At {data.businessName}, we are committed to making every client feel beautiful, confident, and cared for. Your satisfaction is our passion.</p>
              <div className="flex flex-wrap justify-center gap-4 mt-8">
                {["Expert Stylists", "Premium Products", "Relaxing Atmosphere", "100% Satisfaction"].map((item) => (
                  <span key={item} className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border" style={{ color: ROSE, borderColor: `${ROSE}33`, background: `${ROSE}0d` }}><CheckCircle size={16} weight="fill" />{item}</span>
                ))}
              </div>
            </div>
          </ShimmerBorder>
        </div>
      </section>

      {/* ══════════════════ 15. FOOTER ══════════════════ */}
      <footer className="relative z-10 border-t border-white/5 py-10 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${DARK} 0%, #0f0710 100%)` }} />
        <RosePattern opacity={0.015} accent={ROSE} />
        <div className="mx-auto max-w-6xl px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3"><Scissors size={22} weight="duotone" style={{ color: ROSE }} /><span className="text-lg font-bold text-white">{data.businessName}</span></div>
              <p className="text-sm text-slate-500 leading-relaxed">{data.about.length > 120 ? data.about.slice(0, 120).trim() + "..." : data.about}</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-3">Quick Links</h4>
              <div className="space-y-2">{["Services", "About", "Gallery", "Contact"].map((link) => <a key={link} href={`#${link.toLowerCase()}`} className="block text-sm text-slate-500 hover:text-white transition-colors">{link}</a>)}</div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-3">Contact</h4>
              <div className="space-y-2 text-sm text-slate-500">
                <p><PhoneLink phone={data.phone} /></p><p><MapLink address={data.address} /></p>
                {data.socialLinks && Object.entries(data.socialLinks).map(([platform, url]) => <a key={platform} href={url} target="_blank" rel="noopener noreferrer" className="block hover:text-white transition-colors capitalize">{platform}</a>)}
              </div>
            </div>
          </div>
          <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-500"><Scissors size={14} weight="duotone" style={{ color: ROSE }} /><span>{data.businessName} &copy; {new Date().getFullYear()}</span></div>
            <div className="flex items-center gap-2 text-xs text-slate-600"><BluejayLogo className="w-4 h-4" /><span>Created by <a href="https://bluejayportfolio.com" target="_blank" rel="noopener noreferrer" style={{textDecoration:"underline"}}>bluejayportfolio.com</a></span></div>
          </div>
        </div>
      </footer>

      <ClaimBanner businessName={data.businessName} accentColor={ROSE} prospectId={data.id} />
      <div className="h-14 md:h-28" />
    </main>
  );
}
