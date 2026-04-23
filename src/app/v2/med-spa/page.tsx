"use client";

/* eslint-disable @next/next/no-img-element -- Static marketing showcase uses plain img tags */
/* eslint-disable react-hooks/purity -- Decorative particle values randomized for static visual effects */

import { useState, useRef, useCallback, useEffect } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useInView,
  AnimatePresence,
} from "framer-motion";
import {
  Star,
  ShieldCheck,
  CaretDown,
  Phone,
  MapPin,
  Clock,
  ArrowRight,
  Quotes,
  X,
  List,
  Sparkle,
  Heart,
  Drop,
  FlowerLotus,
  User,
  CalendarCheck,
  CheckCircle,
  Syringe,
  Eye,
  SunHorizon,
  Lightning,
  FirstAid,
  Certificate,
  PlayCircle,
  Envelope,
  InstagramLogo,
  Stethoscope,
  Timer,
  Trophy,
  Handshake,
} from "@phosphor-icons/react";

/* ───────────────────────── SPRING CONFIG ───────────────────────── */
const spring = { type: "spring" as const, stiffness: 100, damping: 20 };
const springFast = { type: "spring" as const, stiffness: 200, damping: 25 };

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: spring },
};

/* ───────────────────────── COLORS ───────────────────────── */
const BG = "#0a0a0a";
const BG_CARD = "#111111";
const BLUSH = "#f9a8d4";
const BLUSH_LIGHT = "#fce7f3";
const GOLD = "#d4a853";
const GOLD_LIGHT = "#f5e6c8";
const BLUSH_GLOW = "rgba(249, 168, 212, 0.10)";
const GOLD_GLOW = "rgba(212, 168, 83, 0.10)";

/* ───────────────────────── RADIANCE LOGO ICON ───────────────────────── */
function RadianceIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="8" stroke={BLUSH} strokeWidth="1.5" fill="none" />
      <circle cx="16" cy="16" r="4" fill={GOLD} opacity="0.6" />
      <line x1="16" y1="2" x2="16" y2="8" stroke={GOLD} strokeWidth="1" strokeLinecap="round" />
      <line x1="16" y1="24" x2="16" y2="30" stroke={GOLD} strokeWidth="1" strokeLinecap="round" />
      <line x1="2" y1="16" x2="8" y2="16" stroke={GOLD} strokeWidth="1" strokeLinecap="round" />
      <line x1="24" y1="16" x2="30" y2="16" stroke={GOLD} strokeWidth="1" strokeLinecap="round" />
      <line x1="6.1" y1="6.1" x2="10.3" y2="10.3" stroke={BLUSH} strokeWidth="0.75" strokeLinecap="round" />
      <line x1="21.7" y1="21.7" x2="25.9" y2="25.9" stroke={BLUSH} strokeWidth="0.75" strokeLinecap="round" />
      <line x1="25.9" y1="6.1" x2="21.7" y2="10.3" stroke={BLUSH} strokeWidth="0.75" strokeLinecap="round" />
      <line x1="10.3" y1="21.7" x2="6.1" y2="25.9" stroke={BLUSH} strokeWidth="0.75" strokeLinecap="round" />
    </svg>
  );
}

/* ───────────────────────── MORPHING SHAPE BG ───────────────────────── */
function MorphingShapeBG() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <svg viewBox="0 0 800 800" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] md:w-[110%] md:h-[110%] opacity-30">
        <defs>
          <linearGradient id="blob-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={BLUSH} />
            <stop offset="50%" stopColor="#f0abcf" />
            <stop offset="100%" stopColor={GOLD} />
          </linearGradient>
          <filter id="blob-blur">
            <feGaussianBlur in="SourceGraphic" stdDeviation="30" />
          </filter>
        </defs>
        <motion.path
          fill="url(#blob-grad)"
          filter="url(#blob-blur)"
          animate={{
            d: [
              "M400,280C480,200,620,220,660,320C700,420,660,520,580,560C500,600,420,620,340,580C260,540,200,480,220,380C240,280,320,360,400,280Z",
              "M400,260C500,180,640,240,680,340C720,440,640,540,560,580C480,620,380,640,300,580C220,520,180,440,220,360C260,280,300,340,400,260Z",
              "M400,300C460,220,600,200,660,300C720,400,680,520,600,570C520,620,440,600,360,560C280,520,220,460,240,370C260,280,340,380,400,300Z",
              "M400,280C480,200,620,220,660,320C700,420,660,520,580,560C500,600,420,620,340,580C260,540,200,480,220,380C240,280,320,360,400,280Z",
            ],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>
    </div>
  );
}

/* ───────────────────────── FLOATING PARTICLES ───────────────────────── */
function FloatingParticles() {
  const particles = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 10,
    duration: 14 + Math.random() * 8,
    size: 1.5 + Math.random() * 2.5,
    opacity: 0.04 + Math.random() * 0.08,
    color: i % 3 === 0 ? GOLD : BLUSH,
  }));

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden hidden md:block">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{ left: `${p.x}%`, width: p.size, height: p.size, background: p.color, willChange: "transform, opacity" }}
          animate={{ y: ["110vh", "-10vh"], opacity: [0, p.opacity, p.opacity, 0] }}
          transition={{
            y: { duration: p.duration, repeat: Infinity, delay: p.delay, ease: "linear" },
            opacity: { duration: p.duration, repeat: Infinity, delay: p.delay, times: [0, 0.1, 0.9, 1] },
          }}
        />
      ))}
    </div>
  );
}

/* ───────────────────────── SHARED COMPONENTS ───────────────────────── */
function WordReveal({ text, className = "" }: { text: string; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const words = text.split(" ");
  return (
    <motion.span ref={ref} className={`inline-flex flex-wrap gap-x-3 ${className}`} variants={stagger} initial="hidden" animate={isInView ? "show" : "hidden"}>
      {words.map((word, i) => (<motion.span key={i} variants={fadeUp} className="inline-block">{word}</motion.span>))}
    </motion.span>
  );
}

function SectionReveal({ children, className = "", id }: { children: React.ReactNode; className?: string; id?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.section ref={ref} id={id} className={className} initial={{ opacity: 0, y: 50 }} animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }} transition={spring}>
      {children}
    </motion.section>
  );
}

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (<div className={`rounded-2xl border border-white/15 bg-white/[0.07] backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)] ${className}`}>{children}</div>);
}

function MagneticButton({ children, className = "", onClick, style }: { children: React.ReactNode; className?: string; onClick?: () => void; style?: React.CSSProperties }) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, springFast);
  const springY = useSpring(y, springFast);
  const isTouchDevice = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current || isTouchDevice) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - (rect.left + rect.width / 2)) * 0.25);
    y.set((e.clientY - (rect.top + rect.height / 2)) * 0.25);
  }, [x, y, isTouchDevice]);
  const handleMouseLeave = useCallback(() => { x.set(0); y.set(0); }, [x, y]);
  return (
    <motion.button ref={ref} style={{ x: springX, y: springY, willChange: "transform", ...style }} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} onClick={onClick} className={className} whileTap={{ scale: 0.97 }}>
      {children}
    </motion.button>
  );
}

function ShimmerBorder({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative rounded-2xl p-[1px] overflow-hidden ${className}`}>
      <motion.div className="absolute inset-0 rounded-2xl" style={{ background: `conic-gradient(from 0deg, transparent, ${BLUSH}, transparent, ${GOLD}, transparent)`, willChange: "transform" }} animate={{ rotate: [0, 360] }} transition={{ duration: 5, repeat: Infinity, ease: "linear" }} />
      <div className="relative rounded-2xl z-10" style={{ background: BG }}>{children}</div>
    </div>
  );
}

/* ───────────────────────── DATA ───────────────────────── */
const treatmentCategories = [
  {
    category: "Face",
    icon: Eye,
    treatments: [
      { name: "Botox", price: "From $12/unit", desc: "Smooth fine lines and wrinkles with precision-placed injections for a refreshed, natural look." },
      { name: "Dermal Fillers", price: "From $650/syringe", desc: "Restore volume and contour cheeks, lips, and jawline with premium Juvederm and Restylane fillers." },
      { name: "HydraFacial", price: "From $175", desc: "Deep cleanse, exfoliate, and hydrate with our signature multi-step facial treatment." },
      { name: "Microneedling with PRP", price: "From $350", desc: "Stimulate collagen with micro-channels and platelet-rich plasma for dramatic skin renewal." },
    ],
  },
  {
    category: "Body",
    icon: User,
    treatments: [
      { name: "CoolSculpting", price: "From $750/area", desc: "FDA-cleared non-invasive fat reduction that freezes and eliminates stubborn fat cells permanently." },
      { name: "Laser Hair Removal", price: "From $150/session", desc: "Achieve smooth, hair-free skin with our advanced laser technology for all skin types." },
      { name: "Body Contouring", price: "From $500", desc: "Sculpt and tighten with radiofrequency and ultrasound treatments for a refined silhouette." },
    ],
  },
  {
    category: "Skin",
    icon: SunHorizon,
    treatments: [
      { name: "Chemical Peels", price: "From $175", desc: "Reveal brighter, smoother skin with medical-grade peels customized to your skin type." },
      { name: "IPL Photofacial", price: "From $300", desc: "Target sun damage, redness, and pigmentation with intense pulsed light therapy." },
      { name: "Laser Resurfacing", price: "From $800", desc: "Reduce scars, fine lines, and uneven texture with fractional CO2 or erbium lasers." },
    ],
  },
  {
    category: "Injectables",
    icon: Syringe,
    treatments: [
      { name: "Botox Cosmetic", price: "From $12/unit", desc: "The gold standard for dynamic wrinkles. Smooth forehead lines, crow's feet, and frown lines." },
      { name: "Juvederm Collection", price: "From $650", desc: "Voluma for cheeks, Volbella for lips, Vollure for nasolabial folds. Natural, lasting results." },
      { name: "Restylane Line", price: "From $600", desc: "Versatile hyaluronic acid fillers for lips, under-eyes, hands, and facial contours." },
      { name: "Kybella", price: "From $600/vial", desc: "Permanently dissolve submental fat for a defined chin and jawline without surgery." },
    ],
  },
];

const skinQuizOptions = [
  { label: "Anti-Aging", desc: "Fine lines, wrinkles, loss of volume", icon: Sparkle, color: BLUSH, rec: "Botox + Fillers + Microneedling" },
  { label: "Acne & Scarring", desc: "Active breakouts, acne scars, texture", icon: Drop, color: GOLD, rec: "Chemical Peels + Microneedling + IPL" },
  { label: "Pigmentation", desc: "Sun spots, melasma, uneven tone", icon: SunHorizon, color: BLUSH, rec: "IPL + Chemical Peels + Laser" },
  { label: "Body Contouring", desc: "Stubborn fat, skin laxity, cellulite", icon: Lightning, color: GOLD, rec: "CoolSculpting + Body Contouring" },
];

const testimonials = [
  { name: "Priya M.", text: "Dr. Kaur is a true artist. After my Juvederm treatment, I look like myself but 10 years younger. The results are so natural that my friends just think I look well-rested.", rating: 5, treatment: "Juvederm" },
  { name: "Chelsea W.", text: "I was terrified of Botox but the team at Radiance made me so comfortable. Zero pain, zero frozen look. I cannot stop smiling at my reflection. Absolute confidence boost.", rating: 5, treatment: "Botox" },
  { name: "Diana K.", text: "The CoolSculpting results blew my mind. I lost two inches off my waist without surgery or downtime. Worth every penny. I feel like a completely new woman.", rating: 5, treatment: "CoolSculpting" },
  { name: "Anika T.", text: "After years of struggling with acne scarring, the microneedling sessions with Dr. Kaur have completely transformed my skin. My confidence is through the roof.", rating: 5, treatment: "Microneedling" },
  { name: "Megan S.", text: "The HydraFacial at Radiance is unmatched. My skin literally glows for weeks after each session. I have tried every spa in Seattle and nothing compares.", rating: 5, treatment: "HydraFacial" },
];

const beforeAfterData = [
  { image: "/images/medspa-before-after-1.png", label: "Skin Rejuvenation", desc: "6 sessions of microneedling + chemical peels" },
  { image: "/images/medspa-before-after-2.png", label: "Facial Contouring", desc: "Juvederm cheek + jawline filler" },
  { image: "/images/medspa-before-after-3.png", label: "Anti-Aging Treatment", desc: "Botox + laser resurfacing protocol" },
];

const comparisonRows = [
  { feature: "Board-Certified Providers", us: true, them: "Varies" },
  { feature: "Personalized Treatment Plans", us: true, them: "No" },
  { feature: "Medical-Grade Products Only", us: true, them: "Sometimes" },
  { feature: "Complimentary Consultations", us: true, them: "No" },
  { feature: "Post-Treatment Follow-Up", us: true, them: "Rarely" },
  { feature: "Transparent Pricing", us: true, them: "Hidden Fees" },
  { feature: "16+ Years Medical Experience", us: true, them: "Varies" },
];

const products = [
  { name: "Allergan", desc: "Botox & Juvederm" },
  { name: "Galderma", desc: "Restylane & Sculptra" },
  { name: "SkinMedica", desc: "Clinical Skincare" },
  { name: "ZO Skin Health", desc: "Advanced Protocols" },
  { name: "SkinCeuticals", desc: "Antioxidant Defense" },
  { name: "CoolSculpting", desc: "Body Contouring" },
];

const certifications = [
  "Board-Certified Dermatologist",
  "Yale Medical School",
  "Advanced Injector Trained",
  "Laser Safety Certified",
  "HIPAA Compliant Facility",
  "AmSpa Member",
  "Allergan Diamond Provider",
  "Top-Rated in Seattle",
];

const faqData = [
  { q: "Is Botox safe? What are the side effects?", a: "Botox is FDA-approved and has an excellent safety profile when administered by qualified providers. Minor bruising or swelling may occur but resolves within days. Dr. Kaur has performed thousands of injections with a stellar safety record." },
  { q: "How do I know which treatment is right for me?", a: "Every new client receives a complimentary skin analysis and consultation with Dr. Kaur. We assess your skin health, discuss your goals, and create a personalized treatment plan tailored to your unique needs and timeline." },
  { q: "How long do results from fillers last?", a: "Results vary by product and treatment area. Juvederm Voluma can last up to 2 years in cheeks, while lip fillers typically last 6-12 months. We schedule follow-up appointments to maintain your optimal results." },
  { q: "Is there downtime after laser treatments?", a: "Downtime depends on treatment intensity. IPL photofacials have minimal downtime, while ablative laser resurfacing may require 5-7 days of healing. We provide detailed aftercare instructions for every procedure." },
  { q: "Do you offer financing or payment plans?", a: "Yes. We partner with Cherry and CareCredit to offer affordable monthly payment plans. We also offer treatment packages at discounted rates for multi-session protocols. Ask about our Radiance Rewards membership." },
  { q: "What makes Radiance Med Spa different?", a: "Dr. Kaur is a board-certified dermatologist with 16 years of experience and a Yale Medical School education. We combine clinical expertise with a luxury spa environment, using only premium medical-grade products and the latest technology." },
];

const pricingTiers = [
  { name: "Glow Starter", price: "$175", period: "per session", features: ["HydraFacial Treatment", "Skin Analysis", "Take-Home Serum", "Post-Care Instructions"], color: BLUSH },
  { name: "Radiance Signature", price: "$450", period: "per session", features: ["Botox (Up to 20 Units)", "Custom Facial", "LED Light Therapy", "Skincare Consultation", "Priority Booking"], color: GOLD, popular: true },
  { name: "Total Transformation", price: "$1,200", period: "per package", features: ["3 Microneedling Sessions", "Chemical Peel Series", "Medical-Grade Skincare Kit", "Dedicated Treatment Plan", "VIP Membership Benefits"], color: BLUSH },
];

const galleryImages = [
  "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&q=80",
  "https://images.unsplash.com/photo-1552693673-1bf958298935?w=600&q=80",
  "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&q=80",
  "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=600&q=80",
  "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=600&q=80",
  "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&q=80",
];

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export default function V2MedSpaPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [activeCategory, setActiveCategory] = useState(0);
  const [quizSelection, setQuizSelection] = useState<number | null>(null);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  /* Auto-rotate testimonials */
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const navLinks = [
    { href: "#treatments", label: "Treatments" },
    { href: "#about", label: "About" },
    { href: "#results", label: "Results" },
    { href: "#testimonials", label: "Reviews" },
    { href: "#contact", label: "Contact" },
  ];

  return (
    <main style={{ background: BG }} className="medspa-v2 text-slate-300 overflow-x-hidden">
      <FloatingParticles />

      {/* ─── 1. STICKY NAVIGATION ─── */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed inset-0 z-40 bg-black/80 backdrop-blur-lg md:hidden"
            onClick={() => setIsMenuOpen(false)}
          >
            <div className="mx-auto max-w-lg p-8">
              <div className="flex justify-end mb-8">
                <button onClick={() => setIsMenuOpen(false)} className="p-2">
                  <X size={24} className="text-white" />
                </button>
              </div>
              <nav className="flex flex-col items-center gap-6 text-center">
                {navLinks.map((link) => (
                  <a key={link.href} href={link.href} className="text-2xl font-medium text-white transition-colors" style={{ fontFamily: "'Georgia', serif" }}>
                    {link.label}
                  </a>
                ))}
                <MagneticButton className="mt-4 px-8 py-3 rounded-full text-lg font-semibold text-white" style={{ background: BLUSH } as React.CSSProperties}>
                  Book a Consultation
                </MagneticButton>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-5xl mx-auto">
        <GlassCard className="flex items-center justify-between p-3 md:p-4">
          <a href="#" className="flex items-center gap-2.5 shrink-0">
            <RadianceIcon />
            <span className="font-bold tracking-tight text-white text-lg" style={{ fontFamily: "'Georgia', serif" }}>Radiance Med Spa</span>
          </a>
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                {link.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <MagneticButton className="hidden md:block px-6 py-2.5 rounded-full text-sm font-semibold text-white cursor-pointer" style={{ background: BLUSH } as React.CSSProperties}>
              Book Now
            </MagneticButton>
            <button onClick={() => setIsMenuOpen(true)} className="p-2 md:hidden">
              <List size={24} className="text-white" />
            </button>
          </div>
        </GlassCard>
      </header>

      {/* ─── 2. HERO — MORPHING SHAPE BG (#18) ─── */}
      <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center">
        <MorphingShapeBG />
        {/* Radial vignette overlay */}
        <div className="absolute inset-0 z-[1]" style={{ background: `radial-gradient(ellipse at center, transparent 30%, ${BG} 80%)` }} />
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 pt-24 pb-16">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ ...spring, delay: 0.3 }} className="mb-6">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest border" style={{ borderColor: `${GOLD}40`, color: GOLD, background: GOLD_GLOW }}>
              <Sparkle size={14} weight="fill" /> Seattle&apos;s Premier Med Spa
            </span>
          </motion.div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl tracking-tighter leading-[0.95] font-bold text-white mb-6" style={{ fontFamily: "'Georgia', serif" }}>
            <WordReveal text="Your Best Skin Starts Here" />
          </h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mb-8">
            <WordReveal text="Board-certified dermatologist Dr. Priya Kaur combines 16 years of medical expertise with luxury aesthetics for results you can see and feel." className="gap-x-2" />
          </p>
          <motion.div className="flex flex-wrap justify-center gap-4 mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 1.2 }}>
            <MagneticButton className="px-10 py-4 rounded-full text-base font-semibold text-white inline-flex items-center gap-2 cursor-pointer" style={{ background: BLUSH } as React.CSSProperties}>
              <CalendarCheck size={20} weight="duotone" /> Book a Consultation
            </MagneticButton>
            <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white border inline-flex items-center gap-2 cursor-pointer" style={{ borderColor: `${GOLD}60` }}>
              <Phone size={18} weight="duotone" /> (206) 482-9371
            </MagneticButton>
          </motion.div>
          {/* Trust Badges */}
          <motion.div className="flex flex-wrap justify-center gap-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6, duration: 0.8 }}>
            {["Board-Certified MD", "16 Years Experience", "4.9 Stars (500+ Reviews)", "Free Consultations"].map((badge) => (
              <span key={badge} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border" style={{ borderColor: "rgba(255,255,255,0.1)", color: BLUSH_LIGHT, background: "rgba(255,255,255,0.06)" }}>
                <CheckCircle size={12} weight="fill" style={{ color: GOLD }} /> {badge}
              </span>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ─── 3. TRUST BAR / STATS ─── */}
      <SectionReveal className="relative z-10 py-12 md:py-16" style={{ background: `linear-gradient(180deg, ${BG} 0%, ${BG_CARD} 50%, ${BG} 100%)` } as React.CSSProperties}>
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-8" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {[
              { icon: Star, num: "500+", text: "5-Star Reviews", color: GOLD },
              { icon: User, num: "3,000+", text: "Happy Clients", color: BLUSH },
              { icon: Certificate, num: "16", text: "Years of Excellence", color: GOLD },
              { icon: Trophy, num: "#1", text: "Med Spa in Seattle", color: BLUSH },
            ].map((item, i) => (
              <motion.div key={i} variants={fadeUp} className="text-center">
                <item.icon size={36} weight="duotone" className="mx-auto mb-3" style={{ color: item.color }} />
                <p className="text-3xl md:text-4xl font-bold text-white" style={{ fontFamily: "'Georgia', serif" }}>{item.num}</p>
                <p className="text-sm text-slate-400">{item.text}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── 4. TREATMENT MENU WITH CATEGORIES ─── */}
      <SectionReveal id="treatments" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GOLD }}>Our Expertise</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white" style={{ fontFamily: "'Georgia', serif" }}>
              <WordReveal text="Treatment Menu" />
            </h2>
            <p className="text-slate-400 mt-4 max-w-xl mx-auto">Explore our comprehensive menu of medical-grade aesthetic treatments, each tailored to your unique goals.</p>
          </div>
          {/* Category Tabs */}
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {treatmentCategories.map((cat, i) => (
              <button
                key={cat.category}
                onClick={() => setActiveCategory(i)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all cursor-pointer"
                style={{
                  background: activeCategory === i ? (i % 2 === 0 ? BLUSH : GOLD) : "rgba(255,255,255,0.05)",
                  color: activeCategory === i ? "#0a0a0a" : "rgba(255,255,255,0.6)",
                  border: `1px solid ${activeCategory === i ? "transparent" : "rgba(255,255,255,0.1)"}`,
                }}
              >
                <cat.icon size={16} weight={activeCategory === i ? "fill" : "regular"} /> {cat.category}
              </button>
            ))}
          </div>
          {/* Treatment Cards */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={spring}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {treatmentCategories[activeCategory].treatments.map((t, i) => (
                <GlassCard key={i} className="p-6 hover:border-white/20 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-white" style={{ fontFamily: "'Georgia', serif" }}>{t.name}</h3>
                    <span className="text-sm font-semibold px-3 py-1 rounded-full shrink-0" style={{ background: BLUSH_GLOW, color: BLUSH }}>{t.price}</span>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed mb-4">{t.desc}</p>
                  <button className="flex items-center gap-1.5 text-sm font-medium cursor-pointer" style={{ color: GOLD }}>
                    Book This Treatment <ArrowRight size={14} />
                  </button>
                </GlassCard>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </SectionReveal>

      {/* ─── 5. BEFORE / AFTER TRANSFORMATION SHOWCASE ─── */}
      <SectionReveal id="results" className="relative z-10 py-16 md:py-24" style={{ background: `linear-gradient(180deg, transparent 0%, ${BG_CARD} 15%, ${BG_CARD} 85%, transparent 100%)` } as React.CSSProperties}>
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: BLUSH }}>Real Results</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white" style={{ fontFamily: "'Georgia', serif" }}>
              <WordReveal text="Transformations That Speak" />
            </h2>
          </div>
          <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-8" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {beforeAfterData.map((item, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="overflow-hidden">
                  <div className="relative">
                    <img src={item.image} alt={`${item.label} before and after`} className="w-full h-auto" />
                  </div>
                  <div className="p-4 text-center">
                    <h3 className="text-sm font-semibold text-white mb-1">{item.label}</h3>
                    <p className="text-xs text-slate-400">{item.desc}</p>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── 6. PROVIDER SPOTLIGHT — DR. PRIYA KAUR ─── */}
      <SectionReveal id="about" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div className="aspect-[3/4] rounded-2xl overflow-hidden relative" initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={spring}>
              <img src="https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=800&q=80" alt="Dr. Priya Kaur, MD" className="w-full h-full object-cover object-top" />
              <div className="absolute bottom-0 left-0 right-0 p-6" style={{ background: `linear-gradient(to top, ${BG}, transparent)` }}>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold" style={{ background: GOLD_GLOW, color: GOLD, border: `1px solid ${GOLD}30` }}>
                  <Stethoscope size={12} weight="fill" /> Board-Certified Dermatologist
                </span>
              </div>
            </motion.div>
            <div>
              <p className="text-sm uppercase tracking-widest mb-3" style={{ color: BLUSH }}>Meet Your Provider</p>
              <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white mb-2" style={{ fontFamily: "'Georgia', serif" }}>
                <WordReveal text="Dr. Priya Kaur, MD" />
              </h2>
              <p className="text-sm mb-6" style={{ color: GOLD }}>Board-Certified Dermatologist | Yale Medical School | 16 Years Experience</p>
              <p className="text-slate-400 leading-relaxed mb-4">
                Dr. Priya Kaur founded Radiance Med Spa in Seattle with a singular vision: to merge the precision of medical science with the artistry of aesthetic beauty. A graduate of Yale Medical School with 16 years of clinical dermatology experience, Dr. Kaur brings a level of expertise that sets Radiance apart from every other med spa in the Pacific Northwest.
              </p>
              <p className="text-slate-400 leading-relaxed mb-8">
                Her philosophy is simple: enhance your natural beauty, never mask it. Every treatment plan is crafted individually, drawing on advanced techniques and premium products to deliver results that are elegant, subtle, and unmistakably you. Under her leadership, Radiance has earned over 500 five-star reviews and a reputation as the most trusted name in Seattle aesthetics.
              </p>
              <div className="flex flex-wrap gap-2 mb-8">
                {["Yale Medical School", "Board-Certified", "Allergan Trainer", "16 Years", "3,000+ Clients"].map((cred) => (
                  <span key={cred} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border" style={{ borderColor: `${GOLD}30`, color: GOLD_LIGHT, background: GOLD_GLOW }}>
                    <ShieldCheck size={12} weight="fill" /> {cred}
                  </span>
                ))}
              </div>
              <MagneticButton className="px-8 py-3 rounded-full text-base font-semibold text-white inline-flex items-center gap-2 cursor-pointer" style={{ background: BLUSH } as React.CSSProperties}>
                Book with Dr. Kaur <ArrowRight size={18} />
              </MagneticButton>
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* ─── 7. SKIN CONCERN QUIZ ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24" style={{ background: `linear-gradient(180deg, transparent 0%, ${BG_CARD} 15%, ${BG_CARD} 85%, transparent 100%)` } as React.CSSProperties}>
        <div className="mx-auto max-w-4xl px-4 md:px-6">
          <div className="text-center mb-10">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GOLD }}>Personalized Care</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white" style={{ fontFamily: "'Georgia', serif" }}>
              <WordReveal text="What's Your Skin Goal?" />
            </h2>
            <p className="text-slate-400 mt-4">Select your primary concern and we will recommend the perfect treatment plan.</p>
          </div>
          <motion.div className="grid grid-cols-1 sm:grid-cols-2 gap-4" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {skinQuizOptions.map((opt, i) => (
              <motion.div key={i} variants={fadeUp}>
                <button
                  onClick={() => setQuizSelection(quizSelection === i ? null : i)}
                  className="w-full text-left cursor-pointer rounded-2xl p-6 transition-all border"
                  style={{
                    background: quizSelection === i ? `${opt.color}15` : "rgba(255,255,255,0.06)",
                    borderColor: quizSelection === i ? `${opt.color}50` : "rgba(255,255,255,0.08)",
                  }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <opt.icon size={24} weight="duotone" style={{ color: opt.color }} />
                    <h3 className="text-lg font-semibold text-white" style={{ fontFamily: "'Georgia', serif" }}>{opt.label}</h3>
                  </div>
                  <p className="text-sm text-slate-400 mb-3">{opt.desc}</p>
                  <AnimatePresence>
                    {quizSelection === i && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={spring} className="overflow-hidden">
                        <div className="pt-3 border-t border-white/15">
                          <p className="text-xs uppercase tracking-wider mb-1" style={{ color: opt.color }}>Recommended Treatment Plan</p>
                          <p className="text-sm text-white font-medium mb-3">{opt.rec}</p>
                          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold text-white" style={{ background: opt.color }}>
                            <CalendarCheck size={14} /> Book Consultation
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── 8. PRICING TIERS ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: BLUSH }}>Investment in You</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white" style={{ fontFamily: "'Georgia', serif" }}>
              <WordReveal text="Treatment Packages" />
            </h2>
            <p className="text-slate-400 mt-4 max-w-xl mx-auto">Affordable luxury. Premium results. Flexible financing available through Cherry and CareCredit.</p>
          </div>
          <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {pricingTiers.map((tier, i) => (
              <motion.div key={i} variants={fadeUp}>
                {tier.popular ? (
                  <ShimmerBorder>
                    <div className="p-8 text-center">
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 text-white" style={{ background: GOLD }}>Most Popular</span>
                      <h3 className="text-xl font-semibold text-white mb-2" style={{ fontFamily: "'Georgia', serif" }}>{tier.name}</h3>
                      <p className="text-4xl font-bold text-white mb-1" style={{ fontFamily: "'Georgia', serif" }}>{tier.price}</p>
                      <p className="text-xs text-slate-400 mb-6">{tier.period}</p>
                      <ul className="space-y-3 mb-8 text-left">
                        {tier.features.map((f, j) => (
                          <li key={j} className="flex items-center gap-2 text-sm text-slate-300">
                            <CheckCircle size={16} weight="fill" style={{ color: tier.color }} /> {f}
                          </li>
                        ))}
                      </ul>
                      <MagneticButton className="w-full py-3 rounded-full text-sm font-semibold text-white cursor-pointer" style={{ background: GOLD } as React.CSSProperties}>
                        Book Now
                      </MagneticButton>
                    </div>
                  </ShimmerBorder>
                ) : (
                  <GlassCard className="p-8 text-center h-full flex flex-col">
                    <h3 className="text-xl font-semibold text-white mb-2" style={{ fontFamily: "'Georgia', serif" }}>{tier.name}</h3>
                    <p className="text-4xl font-bold text-white mb-1" style={{ fontFamily: "'Georgia', serif" }}>{tier.price}</p>
                    <p className="text-xs text-slate-400 mb-6">{tier.period}</p>
                    <ul className="space-y-3 mb-8 text-left flex-grow">
                      {tier.features.map((f, j) => (
                        <li key={j} className="flex items-center gap-2 text-sm text-slate-300">
                          <CheckCircle size={16} weight="fill" style={{ color: tier.color }} /> {f}
                        </li>
                      ))}
                    </ul>
                    <MagneticButton className="w-full py-3 rounded-full text-sm font-semibold text-white cursor-pointer border" style={{ borderColor: `${tier.color}40` }}>
                      Get Started
                    </MagneticButton>
                  </GlassCard>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── 9. GOOGLE REVIEWS HEADER + TESTIMONIALS CAROUSEL ─── */}
      <SectionReveal id="testimonials" className="relative z-10 py-16 md:py-24" style={{ background: `linear-gradient(180deg, transparent 0%, ${BG_CARD} 15%, ${BG_CARD} 85%, transparent 100%)` } as React.CSSProperties}>
        <div className="mx-auto max-w-4xl px-4 md:px-6">
          {/* Google Reviews Header */}
          <div className="text-center mb-4">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="flex gap-0.5">{Array(5).fill(0).map((_, i) => <Star key={i} size={20} weight="fill" className="text-amber-400" />)}</div>
              <span className="text-sm font-semibold text-white">4.9</span>
              <span className="text-sm text-slate-400">from 500+ reviews</span>
            </div>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white" style={{ fontFamily: "'Georgia', serif" }}>
              <WordReveal text="Confidence, Restored" />
            </h2>
          </div>
          {/* Carousel */}
          <div className="relative mt-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTestimonial}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={spring}
              >
                <GlassCard className="p-8 md:p-10">
                  <Quotes size={36} weight="fill" className="mb-4" style={{ color: BLUSH }} />
                  <p className="text-lg md:text-xl text-slate-200 leading-relaxed mb-6" style={{ fontFamily: "'Georgia', serif" }}>
                    &quot;{testimonials[activeTestimonial].text}&quot;
                  </p>
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <span className="font-semibold text-white block">{testimonials[activeTestimonial].name}</span>
                      <span className="text-xs" style={{ color: GOLD }}>{testimonials[activeTestimonial].treatment} Client</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-0.5">{Array(testimonials[activeTestimonial].rating).fill(0).map((_, j) => <Star key={j} size={16} weight="fill" className="text-amber-400" />)}</div>
                      <CheckCircle size={16} weight="fill" style={{ color: GOLD }} />
                      <span className="text-xs text-slate-400">Verified</span>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            </AnimatePresence>
            {/* Dots */}
            <div className="flex justify-center gap-2 mt-6">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTestimonial(i)}
                  className="w-2.5 h-2.5 rounded-full transition-all cursor-pointer"
                  style={{ background: activeTestimonial === i ? BLUSH : "rgba(255,255,255,0.15)" }}
                />
              ))}
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* ─── 10. COMPETITOR COMPARISON TABLE ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-4 md:px-6">
          <div className="text-center mb-10">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GOLD }}>Why Radiance</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white" style={{ fontFamily: "'Georgia', serif" }}>
              <WordReveal text="Radiance vs. The Rest" />
            </h2>
          </div>
          <GlassCard className="overflow-hidden">
            <div className="grid grid-cols-3 gap-0 text-center text-sm font-semibold p-4 border-b border-white/15">
              <span className="text-slate-400">Feature</span>
              <span style={{ color: BLUSH }}>Radiance</span>
              <span className="text-slate-400">Others</span>
            </div>
            {comparisonRows.map((row, i) => (
              <div key={i} className="grid grid-cols-3 gap-0 text-center text-sm p-4 border-b border-white/8 last:border-b-0">
                <span className="text-slate-300 text-left">{row.feature}</span>
                <span><CheckCircle size={20} weight="fill" className="mx-auto" style={{ color: "#22c55e" }} /></span>
                <span className="text-slate-500">{row.them}</span>
              </div>
            ))}
          </GlassCard>
        </div>
      </SectionReveal>

      {/* ─── 11. VIDEO TESTIMONIAL PLACEHOLDER ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24" style={{ background: `linear-gradient(180deg, transparent 0%, ${BG_CARD} 15%, ${BG_CARD} 85%, transparent 100%)` } as React.CSSProperties}>
        <div className="mx-auto max-w-5xl px-4 md:px-6">
          <div className="relative rounded-2xl overflow-hidden aspect-video group cursor-pointer">
            <img src="https://images.unsplash.com/photo-1495837174058-628aafc7d610?w=1200&q=80" alt="Radiance Med Spa treatment room" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors flex items-center justify-center">
              <motion.div
                className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{ background: `${BLUSH}cc` }}
                whileHover={{ scale: 1.1 }}
                transition={springFast}
              >
                <PlayCircle size={48} weight="fill" className="text-white" />
              </motion.div>
            </div>
            <div className="absolute bottom-6 left-6">
              <p className="text-white text-lg font-semibold" style={{ fontFamily: "'Georgia', serif" }}>Take a Virtual Tour of Radiance</p>
              <p className="text-slate-300 text-sm">See our state-of-the-art facility in South Lake Union</p>
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* ─── 12. PRODUCTS WE USE ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: BLUSH }}>Premium Products</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white" style={{ fontFamily: "'Georgia', serif" }}>
              <WordReveal text="Trusted Brands We Use" />
            </h2>
            <p className="text-slate-400 mt-4 max-w-xl mx-auto">We exclusively partner with the most respected names in medical aesthetics to deliver safe, effective, and lasting results.</p>
          </div>
          <motion.div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {products.map((p, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="p-5 text-center h-full flex flex-col items-center justify-center">
                  <FirstAid size={28} weight="duotone" className="mb-3" style={{ color: i % 2 === 0 ? GOLD : BLUSH }} />
                  <h3 className="text-sm font-semibold text-white mb-1">{p.name}</h3>
                  <p className="text-xs text-slate-500">{p.desc}</p>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── 13. THE RADIANCE PROCESS ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24" style={{ background: `linear-gradient(180deg, transparent 0%, ${BG_CARD} 15%, ${BG_CARD} 85%, transparent 100%)` } as React.CSSProperties}>
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GOLD }}>Your Journey</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white" style={{ fontFamily: "'Georgia', serif" }}>
              <WordReveal text="The Radiance Experience" />
            </h2>
          </div>
          <motion.div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {[
              { title: "Consultation", desc: "Complimentary skin analysis with Dr. Kaur to understand your goals and craft a personalized plan.", icon: Handshake },
              { title: "Treatment", desc: "Relax in our luxury suite as our expert team performs your chosen treatment with precision and care.", icon: Sparkle },
              { title: "Aftercare", desc: "Detailed post-treatment instructions and a medical-grade skincare kit to optimize your results.", icon: Heart },
              { title: "Follow-Up", desc: "Scheduled check-in to assess results, refine your plan, and ensure your complete satisfaction.", icon: CalendarCheck },
            ].map((step, i) => (
              <motion.div key={i} variants={fadeUp} className="relative">
                <div className="flex items-center justify-center w-16 h-16 rounded-full mx-auto mb-4 border-2" style={{ borderColor: i % 2 === 0 ? BLUSH : GOLD, background: i % 2 === 0 ? BLUSH_GLOW : GOLD_GLOW }}>
                  <step.icon size={28} weight="duotone" style={{ color: i % 2 === 0 ? BLUSH : GOLD }} />
                </div>
                <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: i % 2 === 0 ? BLUSH : GOLD }}>Step {i + 1}</p>
                <h3 className="text-lg font-semibold text-white mb-2" style={{ fontFamily: "'Georgia', serif" }}>{step.title}</h3>
                <p className="text-sm text-slate-400">{step.desc}</p>
                {i < 3 && <div className="hidden md:block absolute top-8 left-1/2 w-full h-px border-t border-dashed border-white/15" style={{ transform: "translateX(50%)" }} />}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── 14. CERTIFICATIONS & PARTNERS BADGE ROW ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4 md:px-6 text-center">
          <p className="text-sm uppercase tracking-widest mb-3" style={{ color: BLUSH }}>Trust & Safety</p>
          <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white mb-6" style={{ fontFamily: "'Georgia', serif" }}>
            <WordReveal text="Credentials You Can Trust" />
          </h2>
          <p className="text-slate-400 leading-relaxed max-w-2xl mx-auto mb-10">
            Your safety is our highest priority. Radiance Med Spa is led by a board-certified dermatologist and upholds the strictest medical and safety standards in the industry.
          </p>
          <motion.div className="flex flex-wrap justify-center gap-3" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {certifications.map((cert, i) => (
              <motion.div key={i} variants={fadeUp} className="flex items-center gap-2 px-4 py-2 rounded-full border" style={{ borderColor: `${i % 2 === 0 ? GOLD : BLUSH}30`, background: i % 2 === 0 ? GOLD_GLOW : BLUSH_GLOW }}>
                <ShieldCheck size={16} weight="fill" style={{ color: i % 2 === 0 ? GOLD : BLUSH }} />
                <span className="text-sm font-medium text-white">{cert}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── 15. GALLERY ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24" style={{ background: `linear-gradient(180deg, transparent 0%, ${BG_CARD} 15%, ${BG_CARD} 85%, transparent 100%)` } as React.CSSProperties}>
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GOLD }}>Our Space</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white" style={{ fontFamily: "'Georgia', serif" }}>
              <WordReveal text="Inside Radiance" />
            </h2>
            <p className="text-slate-400 mt-4 max-w-xl mx-auto">
              Step inside our serene South Lake Union sanctuary. Every detail has been designed to make your visit an experience of calm, luxury, and transformation.
            </p>
          </div>
          <motion.div className="grid grid-cols-2 md:grid-cols-3 gap-4" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {galleryImages.map((src, i) => {
              const labels = [
                "Reception & Welcome Lounge",
                "Private Treatment Suite",
                "Consultation Room",
                "Skincare Product Bar",
                "Laser Treatment Room",
                "Relaxation Area",
              ];
              return (
                <motion.div key={i} variants={fadeUp} className="aspect-square overflow-hidden rounded-xl relative group">
                  <img src={src} alt={labels[i]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <span className="text-sm font-medium text-white">{labels[i]}</span>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── 16. PATIENT COMFORT & LUXURY EXPERIENCE ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-sm uppercase tracking-widest mb-3" style={{ color: BLUSH }}>Your Comfort</p>
              <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white mb-6" style={{ fontFamily: "'Georgia', serif" }}>
                <WordReveal text="A Luxury Experience, Start to Finish" />
              </h2>
              <p className="text-slate-400 leading-relaxed mb-8">
                We know that choosing a med spa is a deeply personal decision. At Radiance, we have designed every detail of your visit to feel effortless, comfortable, and luxurious. From the moment you walk through our doors, you are in expert hands.
              </p>
              <motion.div className="grid grid-cols-1 sm:grid-cols-2 gap-4" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
                {[
                  { icon: Heart, title: "Gentle Techniques", desc: "Advanced numbing and comfort protocols so you feel relaxed through every procedure." },
                  { icon: FlowerLotus, title: "Spa-Like Environment", desc: "Soft lighting, calming music, and aromatherapy in every treatment suite." },
                  { icon: ShieldCheck, title: "Medical Supervision", desc: "Every treatment overseen by Dr. Kaur, a board-certified dermatologist." },
                  { icon: Sparkle, title: "Premium Products Only", desc: "We never compromise. Only FDA-approved, medical-grade products are used." },
                ].map((item, i) => (
                  <motion.div key={i} variants={fadeUp} className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: i % 2 === 0 ? BLUSH_GLOW : GOLD_GLOW }}>
                      <item.icon size={20} weight="duotone" style={{ color: i % 2 === 0 ? BLUSH : GOLD }} />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white mb-1">{item.title}</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
            <motion.div className="aspect-square rounded-2xl overflow-hidden" initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={spring}>
              <img src="https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=800&q=80" alt="Luxury treatment room at Radiance Med Spa" className="w-full h-full object-cover" />
            </motion.div>
          </div>
        </div>
      </SectionReveal>

      {/* ─── 17. RADIANCE REWARDS MEMBERSHIP ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24" style={{ background: `linear-gradient(180deg, transparent 0%, ${BG_CARD} 15%, ${BG_CARD} 85%, transparent 100%)` } as React.CSSProperties}>
        <div className="mx-auto max-w-4xl px-4 md:px-6 text-center">
          <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GOLD }}>Exclusive Membership</p>
          <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white mb-4" style={{ fontFamily: "'Georgia', serif" }}>
            <WordReveal text="Radiance Rewards Club" />
          </h2>
          <p className="text-slate-400 leading-relaxed max-w-2xl mx-auto mb-10">
            Join our exclusive membership program and enjoy year-round savings, priority booking, and VIP access to new treatments and special events.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <GlassCard className="p-8 text-left">
              <div className="flex items-center gap-3 mb-4">
                <Star size={24} weight="fill" style={{ color: BLUSH }} />
                <h3 className="text-xl font-semibold text-white" style={{ fontFamily: "'Georgia', serif" }}>Gold Member</h3>
              </div>
              <p className="text-3xl font-bold text-white mb-1" style={{ fontFamily: "'Georgia', serif" }}>$99<span className="text-base font-normal text-slate-400">/month</span></p>
              <ul className="space-y-2.5 mt-6">
                {["15% off all treatments", "Monthly HydraFacial included", "Priority booking access", "Exclusive member events", "Birthday treatment bonus"].map((f, j) => (
                  <li key={j} className="flex items-center gap-2 text-sm text-slate-300">
                    <CheckCircle size={14} weight="fill" style={{ color: BLUSH }} /> {f}
                  </li>
                ))}
              </ul>
            </GlassCard>
            <GlassCard className="p-8 text-left relative overflow-hidden">
              <div className="absolute top-0 right-0 px-3 py-1 text-xs font-bold text-white" style={{ background: GOLD, borderBottomLeftRadius: 8 }}>BEST VALUE</div>
              <div className="flex items-center gap-3 mb-4">
                <Trophy size={24} weight="fill" style={{ color: GOLD }} />
                <h3 className="text-xl font-semibold text-white" style={{ fontFamily: "'Georgia', serif" }}>Platinum Member</h3>
              </div>
              <p className="text-3xl font-bold text-white mb-1" style={{ fontFamily: "'Georgia', serif" }}>$199<span className="text-base font-normal text-slate-400">/month</span></p>
              <ul className="space-y-2.5 mt-6">
                {["25% off all treatments", "Monthly treatment of choice", "First access to new services", "Complimentary skincare products", "VIP concierge scheduling", "Annual skin health assessment"].map((f, j) => (
                  <li key={j} className="flex items-center gap-2 text-sm text-slate-300">
                    <CheckCircle size={14} weight="fill" style={{ color: GOLD }} /> {f}
                  </li>
                ))}
              </ul>
            </GlassCard>
          </div>
        </div>
      </SectionReveal>

      {/* ─── 18. ENHANCED SERVICE AREA ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-4 md:px-6">
          <div className="text-center mb-10">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: BLUSH }}>Serving Seattle</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white mb-4" style={{ fontFamily: "'Georgia', serif" }}>
              <WordReveal text="Conveniently Located in South Lake Union" />
            </h2>
          </div>
          <GlassCard className="p-8 md:p-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <MapPin size={32} weight="duotone" className="mx-auto mb-3" style={{ color: BLUSH }} />
                <h4 className="text-sm font-semibold text-white mb-1">Service Area</h4>
                <p className="text-xs text-slate-400">Serving Seattle, Bellevue, Kirkland, Redmond, Mercer Island, and the greater Puget Sound area.</p>
              </div>
              <div>
                <Timer size={32} weight="duotone" className="mx-auto mb-3" style={{ color: GOLD }} />
                <h4 className="text-sm font-semibold text-white mb-1">Consultation Wait</h4>
                <p className="text-xs text-slate-400">Most new patient consultations are scheduled within 48 hours. Same-week availability for existing clients.</p>
              </div>
              <div>
                <div className="flex justify-center mb-3">
                  <motion.div
                    className="w-3 h-3 rounded-full mr-2 mt-2.5"
                    style={{ background: "#22c55e" }}
                    animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <CalendarCheck size={32} weight="duotone" style={{ color: BLUSH }} />
                </div>
                <h4 className="text-sm font-semibold text-white mb-1">Now Accepting Patients</h4>
                <p className="text-xs text-slate-400">Currently accepting new patients. Evening appointments available on select days.</p>
              </div>
            </div>
          </GlassCard>
        </div>
      </SectionReveal>

      {/* ─── 19. AVAILABILITY BANNER ─── */}
      <SectionReveal className="relative z-10 py-10">
        <div className="mx-auto max-w-4xl px-4 md:px-6">
          <GlassCard className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
              <div className="flex items-center gap-3 shrink-0">
                <motion.div
                  className="w-3 h-3 rounded-full"
                  style={{ background: "#22c55e" }}
                  animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <span className="text-sm font-semibold text-white">Appointments Available This Week</span>
              </div>
              <div className="flex-grow">
                <p className="text-sm text-slate-400">Same-week consultations available. New patients welcome. Evening appointments on Thursdays.</p>
              </div>
              <MagneticButton className="px-6 py-2.5 rounded-full text-sm font-semibold text-white cursor-pointer shrink-0" style={{ background: BLUSH } as React.CSSProperties}>
                <Timer size={16} weight="duotone" className="inline mr-1.5" /> Book Today
              </MagneticButton>
            </div>
          </GlassCard>
        </div>
      </SectionReveal>

      {/* ─── 20. FAQ ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GOLD }}>Common Questions</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white" style={{ fontFamily: "'Georgia', serif" }}>
              <WordReveal text="Frequently Asked Questions" />
            </h2>
          </div>
          <motion.div className="space-y-3" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {faqData.map((item, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="overflow-hidden">
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-5 text-left cursor-pointer">
                    <span className="text-sm md:text-base font-semibold text-white pr-4">{item.q}</span>
                    <motion.div animate={{ rotate: openFaq === i ? 180 : 0 }} transition={spring}><CaretDown size={18} className="text-slate-400 shrink-0" /></motion.div>
                  </button>
                  <AnimatePresence initial={false}>
                    {openFaq === i && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={spring} className="overflow-hidden">
                        <p className="px-5 pb-5 text-sm text-slate-400 leading-relaxed">{item.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── 21. CTA BANNER ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4 md:px-6">
          <ShimmerBorder>
            <div className="p-8 md:p-12 text-center">
              <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={spring}>
                <FlowerLotus size={48} weight="duotone" className="mx-auto mb-4" style={{ color: BLUSH }} />
                <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white mb-4" style={{ fontFamily: "'Georgia', serif" }}>Ready for Your Best Skin?</h2>
                <p className="text-slate-400 text-lg mb-8 max-w-lg mx-auto">Schedule your complimentary consultation with Dr. Kaur and discover a personalized plan designed just for you.</p>
                <div className="flex flex-wrap justify-center gap-4">
                  <MagneticButton className="px-10 py-4 rounded-full text-base font-semibold text-white inline-flex items-center gap-2 cursor-pointer" style={{ background: BLUSH } as React.CSSProperties}>
                    <CalendarCheck size={20} weight="duotone" /> Book Free Consultation
                  </MagneticButton>
                  <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white border inline-flex items-center gap-2 cursor-pointer" style={{ borderColor: `${GOLD}60` }}>
                    <Phone size={18} weight="duotone" /> (206) 482-9371
                  </MagneticButton>
                </div>
              </motion.div>
            </div>
          </ShimmerBorder>
        </div>
      </SectionReveal>

      {/* ─── 22. CONTACT SECTION ─── */}
      <SectionReveal id="contact" className="relative z-10 py-16 md:py-24" style={{ background: `linear-gradient(180deg, transparent 0%, ${BG_CARD} 15%, ${BG_CARD} 85%, transparent 100%)` } as React.CSSProperties}>
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GOLD }}>Visit Us</p>
              <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white mb-6" style={{ fontFamily: "'Georgia', serif" }}>
                <WordReveal text="Your Radiance Awaits" />
              </h2>
              <p className="text-slate-400 leading-relaxed max-w-md mb-8">
                Located in the heart of South Lake Union, Radiance Med Spa offers a serene escape where science meets beauty. We look forward to welcoming you.
              </p>
              <div className="flex gap-3">
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="p-3 rounded-full border border-white/15 hover:border-white/20 transition-colors" style={{ color: BLUSH }}>
                  <InstagramLogo size={20} weight="fill" />
                </a>
                <a href="mailto:glow@radiancemedspa.com" className="p-3 rounded-full border border-white/15 hover:border-white/20 transition-colors" style={{ color: GOLD }}>
                  <Envelope size={20} weight="fill" />
                </a>
              </div>
            </div>
            <GlassCard className="p-8">
              <h3 className="text-xl font-semibold text-white mb-6" style={{ fontFamily: "'Georgia', serif" }}>Contact & Location</h3>
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <MapPin size={20} weight="duotone" style={{ color: BLUSH }} className="mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-white">Address</p>
                    <a href="https://maps.google.com/?q=1515+Westlake+Ave+N+Suite+400+Seattle+WA+98109" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-400 hover:text-white transition-colors underline decoration-white/20">
                      1515 Westlake Ave N, Suite 400<br />Seattle, WA 98109
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Phone size={20} weight="duotone" style={{ color: BLUSH }} className="mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-white">Phone</p>
                    <a href="tel:+12064829371" className="text-sm text-slate-400 hover:text-white transition-colors">(206) 482-9371</a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Envelope size={20} weight="duotone" style={{ color: BLUSH }} className="mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-white">Email</p>
                    <a href="mailto:glow@radiancemedspa.com" className="text-sm text-slate-400 hover:text-white transition-colors">glow@radiancemedspa.com</a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Clock size={20} weight="duotone" style={{ color: BLUSH }} className="mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-white">Hours</p>
                    <p className="text-sm text-slate-400">Tuesday - Friday: 9:00 AM - 6:00 PM<br />Saturday: 10:00 AM - 4:00 PM<br />Closed Sunday & Monday</p>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </SectionReveal>

      {/* ─── 23. WHY SEATTLE TRUSTS RADIANCE ─── */}
      <SectionReveal className="relative z-10 py-12 md:py-16">
        <div className="mx-auto max-w-5xl px-4 md:px-6">
          <div className="text-center mb-8">
            <h3 className="text-2xl md:text-3xl tracking-tighter leading-none font-bold text-white" style={{ fontFamily: "'Georgia', serif" }}>
              Why Seattle Trusts Radiance
            </h3>
          </div>
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
          >
            {[
              { num: "3,000+", label: "Clients Treated" },
              { num: "500+", label: "5-Star Google Reviews" },
              { num: "16", label: "Years of Experience" },
              { num: "25,000+", label: "Treatments Performed" },
            ].map((stat, i) => (
              <motion.div key={i} variants={fadeUp} className="text-center p-4">
                <p className="text-2xl md:text-3xl font-bold mb-1" style={{ color: i % 2 === 0 ? BLUSH : GOLD, fontFamily: "'Georgia', serif" }}>
                  {stat.num}
                </p>
                <p className="text-xs text-slate-400">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── 24. FOOTER ─── */}
      <footer className="relative z-10 border-t border-white/8 py-8">
        <div className="mx-auto max-w-7xl px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <RadianceIcon size={16} />
            <span style={{ fontFamily: "'Georgia', serif" }}>Radiance Med Spa &copy; {new Date().getFullYear()}</span>
          </div>
          <p className="text-xs text-slate-600 flex items-center gap-1.5"><svg width="14" height="14" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-sky-500"><path d="M24.3 4.2c-1.5-.4-3.2.1-4.5 1.1-1-.7-2.3-1-3.5-.8-2.4.4-4.2 2.5-4.2 4.9v.6c-3.2.8-6 2.8-7.8 5.6-.3.5-.1 1.1.4 1.4.5.3 1.1.1 1.4-.4 1.5-2.3 3.7-4 6.3-4.7.5-.1 1-.1 1.5 0 .8.2 1.4.8 1.7 1.5.3.8.2 1.6-.2 2.3l-2.8 4.3c-.6.9-.4 2.1.4 2.8l2.5 2.1c.4.3.8.5 1.3.5h5.2c.5 0 1-.2 1.3-.5l1.2-1c.6-.5.8-1.3.6-2l-1-3.2c-.2-.5 0-1.1.4-1.4l3.8-2.5c1.3-.9 2.1-2.3 2.1-3.9V9.6c0-2.5-1.7-4.7-4.1-5.3v-.1z" fill="currentColor"/></svg>Created by <a href="https://bluejayportfolio.com" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "underline" }}>bluejayportfolio.com</a></p>
        </div>
      </footer>

      {/* ─── FIXED CLAIM BANNER ─── */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-auto">
        <GlassCard className="p-3">
          <p className="text-xs text-center text-slate-300">Claim your FREE website at <a href="https://bluejayportfolio.com" target="_blank" rel="noopener noreferrer" className="font-bold text-white underline">bluejayportfolio.com</a></p>
        </GlassCard>
      </div>
    </main>
  );
}
