"use client";

/* eslint-disable @next/next/no-img-element -- Preview templates use plain img tags */
/* eslint-disable react-hooks/purity -- Decorative particle values are intentionally randomized */

import { useState, useRef, useCallback } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  AnimatePresence,
} from "framer-motion";
import {
  Wrench,
  Thermometer,
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
  Oven,
  Drop,
  Snowflake,
  Truck,
  Lightning,
  Play,
  GoogleLogo,
  Toolbox,
  SealCheck,
  Warning,
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
const CHARCOAL = "#111111";
const DEFAULT_BLUE = "#f97316";
const BLUE_LIGHT = "#fb923c";
const STEEL = "#64748b";

function getAccent(accentColor?: string) {
  const c = accentColor || DEFAULT_BLUE;
  return { ACCENT: c, ACCENT_GLOW: `${c}26`, ACCENT_LIGHT: BLUE_LIGHT, STEEL };
}

/* ───────────────────────── SERVICE ICON MAP ───────────────────────── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SERVICE_ICON_MAP: Record<string, any> = {
  refrigerator: Snowflake,
  fridge: Snowflake,
  washer: Drop,
  washing: Drop,
  dryer: Thermometer,
  dishwasher: Drop,
  oven: Oven,
  range: Oven,
  stove: Oven,
  microwave: Oven,
  freezer: Snowflake,
  garbage: Wrench,
  disposal: Wrench,
  ice: Snowflake,
  hvac: Thermometer,
  air: Thermometer,
  heating: Thermometer,
};

function getServiceIcon(serviceName: string) {
  const lower = serviceName.toLowerCase();
  for (const [key, Icon] of Object.entries(SERVICE_ICON_MAP)) {
    if (lower.includes(key)) return Icon;
  }
  return Wrench;
}

/* ───────────────────────── STOCK FALLBACK IMAGES ───────────────────────── */
const STOCK_HERO_POOL = [
  "https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=1400&q=80",
  "https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=1400&q=80",
];
const STOCK_ABOUT_POOL = [
  "https://images.unsplash.com/photo-1556909211-36987daf7b4d?w=800&q=80",
  "https://images.unsplash.com/photo-1585515320310-259814833e62?w=800&q=80",
];
const STOCK_GALLERY = [
  "https://images.unsplash.com/photo-1626806819282-2c1dc01a5e0c?w=600&q=80",
  "https://images.unsplash.com/photo-1556909212-d5b604d0c90d?w=600&q=80",
  "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&q=80",
  "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=600&q=80",
  "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=600&q=80",
  "https://images.unsplash.com/photo-1556909114-44e3e70034e2?w=600&q=80",
  "https://images.unsplash.com/photo-1585515320310-259814833e62?w=600&q=80",
  "https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=600&q=80",
];

/* ───────────────────────── TRUST BADGES ───────────────────────── */
const TRUST_BADGES = [
  { icon: ShieldCheck, label: "Licensed & Insured", desc: "Full liability coverage on every repair visit" },
  { icon: CheckCircle, label: "Same-Day Service", desc: "Fast dispatch — most repairs completed same day" },
  { icon: Toolbox, label: "All Major Brands", desc: "Factory-trained on every major appliance manufacturer" },
  { icon: Star, label: "Satisfaction Guaranteed", desc: "Not happy? We'll make it right, no questions asked" },
];

/* ───────────────────────── PRICING PLANS ───────────────────────── */
const PRICING_PLANS = [
  {
    name: "Diagnostic Visit",
    price: "$49",
    period: "waived with repair",
    features: ["Full appliance inspection", "Problem identified", "Written estimate", "No obligation", "Applied to repair cost"],
    icon: Wrench,
    featured: false,
  },
  {
    name: "Standard Repair",
    price: "$149",
    period: "starting at",
    features: ["Diagnostic included", "OEM parts when available", "90-day labor warranty", "Same-day service", "All major brands", "Clean work area"],
    icon: Toolbox,
    featured: true,
  },
  {
    name: "Premium Service",
    price: "$249",
    period: "starting at",
    features: ["Everything in Standard", "Extended 1-year warranty", "Priority scheduling", "Preventive maintenance tips", "Follow-up check included", "Senior/military discount"],
    icon: ShieldCheck,
    featured: false,
  },
];

/* ───────────────────────── APPLIANCE TYPES ───────────────────────── */
const APPLIANCE_TYPES = [
  { name: "Refrigerators", icon: Snowflake, desc: "Not cooling, ice maker broken, water leaking, compressor issues" },
  { name: "Washers", icon: Drop, desc: "Won't drain, excessive vibration, leaking, not spinning" },
  { name: "Dryers", icon: Thermometer, desc: "Not heating, takes too long, strange noises, won't tumble" },
  { name: "Ovens & Ranges", icon: Oven, desc: "Uneven heating, burner issues, igniter problems, door won't close" },
  { name: "Dishwashers", icon: Drop, desc: "Not cleaning, won't drain, leaking, door latch broken" },
  { name: "Freezers", icon: Snowflake, desc: "Frost buildup, not freezing, temperature fluctuations, noisy" },
  { name: "Microwaves", icon: Oven, desc: "Not heating, turntable issues, sparking, display problems" },
  { name: "Garbage Disposals", icon: Wrench, desc: "Jammed, leaking, not turning on, grinding noises" },
];

/* ───────────────────────── BRANDS WE SERVICE ───────────────────────── */
const BRAND_NAMES = [
  "Whirlpool", "Samsung", "LG", "GE", "Maytag",
  "Frigidaire", "KitchenAid", "Bosch", "Kenmore", "Sub-Zero",
];

/* ───────────────────────── COMPARISON TABLE ───────────────────────── */
const COMPARISON_ROWS = [
  { feature: "Same-Day Service", us: true, them: "Rarely" },
  { feature: "Upfront Pricing", us: true, them: "Hidden Fees" },
  { feature: "All Major Brands", us: true, them: "Limited" },
  { feature: "Background-Checked Techs", us: true, them: "Sometimes" },
  { feature: "90-Day Warranty", us: true, them: "30 Days" },
  { feature: "Weekend Availability", us: true, them: "No" },
  { feature: "Diagnostic Fee Waived", us: true, them: "Never" },
];

/* ───────────────────────── QUIZ OPTIONS ───────────────────────── */
const QUIZ_OPTIONS = [
  { label: "Not Working At All", color: "#ef4444", desc: "Appliance is completely dead or unresponsive. Likely needs immediate repair.", tag: "Urgent" },
  { label: "Making Strange Noises", color: "#f59e0b", desc: "Unusual sounds often indicate a part wearing out. Best to catch it early.", tag: "Schedule Soon" },
  { label: "Just Needs a Tune-Up", color: "#22c55e", desc: "Preventive maintenance keeps your appliances running longer and more efficiently.", tag: "Maintenance" },
];

/* ───────────────────────── FLOATING PARTICLES ───────────────────────── */
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
            background: p.isSteel ? STEEL : accent,
            willChange: "transform, opacity",
          }}
          animate={{ y: ["-10vh", "110vh"], opacity: [0, p.opacity, p.opacity, 0] }}
          transition={{
            y: { duration: p.duration, repeat: Infinity, delay: p.delay, ease: "linear" },
            opacity: { duration: p.duration, repeat: Infinity, delay: p.delay, times: [0, 0.1, 0.9, 1] },
          }}
        />
      ))}
    </div>
  );
}

/* ───────────────────────── CIRCUIT PATTERN ───────────────────────── */
function CircuitPattern({ opacity = 0.03, accent }: { opacity?: number; accent: string }) {
  const patternId = `circuitApplianceV2-${accent.replace("#", "")}`;
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }}>
      <defs>
        <pattern id={patternId} width="80" height="80" patternUnits="userSpaceOnUse">
          <circle cx="20" cy="20" r="3" fill={accent} opacity="0.2" />
          <circle cx="60" cy="50" r="2.5" fill={accent} opacity="0.2" />
          <circle cx="40" cy="70" r="2" fill={STEEL} opacity="0.15" />
          <circle cx="70" cy="30" r="1.5" fill={accent} opacity="0.2" />
          <path d="M20 20 L60 20 L60 50" fill="none" stroke={accent} strokeWidth="0.5" opacity="0.15" />
          <path d="M40 70 L70 70 L70 30" fill="none" stroke={STEEL} strokeWidth="0.4" opacity="0.12" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  );
}

/* ───────────────────────── TECH GRID ───────────────────────── */
function TechGrid({ opacity = 0.03, accent }: { opacity?: number; accent: string }) {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }} viewBox="0 0 1000 600" preserveAspectRatio="none">
      <motion.path
        d="M100 0 Q120 100 100 200 Q80 300 100 400 Q120 500 100 600"
        fill="none" stroke={accent} strokeWidth="2"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.path
        d="M500 0 Q480 150 500 300 Q520 450 500 600"
        fill="none" stroke={STEEL} strokeWidth="1.5"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      />
      <motion.path
        d="M850 0 Q870 100 850 200 Q830 300 850 400"
        fill="none" stroke={accent} strokeWidth="1"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
    </svg>
  );
}

/* ───────────────────────── GLASS CARD ───────────────────────── */
function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-white/15 bg-white/[0.08] backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] ${className}`}>
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
    x.set((e.clientX - (rect.left + rect.width / 2)) * 0.25);
    y.set((e.clientY - (rect.top + rect.height / 2)) * 0.25);
  }, [x, y, isTouchDevice]);
  const handleMouseLeave = useCallback(() => { x.set(0); y.set(0); }, [x, y]);
  if (href) {
    return (
      <motion.a href={href} ref={ref as unknown as React.Ref<HTMLAnchorElement>}
        style={{ x: springX, y: springY, willChange: "transform", ...style }}
        onMouseMove={handleMouseMove as unknown as React.MouseEventHandler<HTMLAnchorElement>}
        onMouseLeave={handleMouseLeave} className={className} whileTap={{ scale: 0.97 }}>
        {children}
      </motion.a>
    );
  }
  return (
    <motion.button ref={ref} style={{ x: springX, y: springY, willChange: "transform", ...style }}
      onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} onClick={onClick}
      className={className} whileTap={{ scale: 0.97 }}>
      {children}
    </motion.button>
  );
}

/* ───────────────────────── SHIMMER BORDER ───────────────────────── */
function ShimmerBorder({ children, className = "", accent }: { children: React.ReactNode; className?: string; accent: string }) {
  return (
    <div className={`relative rounded-2xl p-[1px] overflow-hidden ${className}`}>
      <motion.div className="absolute inset-0 rounded-2xl"
        style={{ background: `conic-gradient(from 0deg, transparent, ${accent}, transparent, ${STEEL}, transparent)`, willChange: "transform" }}
        animate={{ rotate: [0, 360] }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} />
      <div className="relative rounded-2xl bg-[#141414] z-10">{children}</div>
    </div>
  );
}

/* ───────────────────────── ACCORDION ITEM ───────────────────────── */
function AccordionItem({ question, answer, isOpen, onToggle }: { question: string; answer: string; isOpen: boolean; onToggle: () => void }) {
  return (
    <GlassCard className="overflow-hidden">
      <button onClick={onToggle} className="w-full flex items-center justify-between p-5 md:p-6 text-left group cursor-pointer">
        <span className="text-lg font-semibold text-white pr-4">{question}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={spring}>
          <CaretDown size={20} className="text-slate-400 shrink-0" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={spring} className="overflow-hidden">
            <p className="px-5 pb-5 md:px-6 md:pb-6 text-slate-400 leading-relaxed">{answer}</p>
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
      <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border"
        style={{ color: accent, borderColor: `${accent}33`, background: `${accent}0d` }}>{badge}</span>
      <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white">{title}</h2>
      <div className="h-0.5 w-16 mx-auto mt-4" style={{ background: `linear-gradient(to right, ${accent}, transparent)` }} />
      {subtitle && <p className="text-slate-400 mt-4 max-w-2xl text-lg leading-relaxed mx-auto">{subtitle}</p>}
    </div>
  );
}

/* ───────────────────────── ANIMATED SECTION ───────────────────────── */
function AnimatedSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: "easeOut" as const }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════ */
export default function V2ApplianceRepairPreview({ data }: { data: GeneratedSiteData }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const { ACCENT, ACCENT_GLOW } = getAccent(data.accentColor);

  const uniquePhotos = data.photos ? [...new Set(data.photos)] : [];
  const heroImage = uniquePhotos[0] || pickFromPool(STOCK_HERO_POOL, data.businessName);
  const heroCardImage = uniquePhotos[1] || pickFromPool(STOCK_ABOUT_POOL, data.businessName, 1);
  const aboutImage = uniquePhotos[2] || pickFromPool(STOCK_ABOUT_POOL, data.businessName, 2);
  const galleryImages = uniquePhotos.length > 2 ? uniquePhotos.slice(2, 6) : pickGallery(STOCK_GALLERY, data.businessName);
  const phoneDigits = data.phone.replace(/\D/g, "");

  const processSteps = [
    { step: "01", title: "Call or Book Online", desc: "Describe your appliance issue and we'll schedule a convenient appointment time." },
    { step: "02", title: "Expert Diagnosis", desc: "Our certified technician arrives on time, inspects your appliance, and identifies the problem." },
    { step: "03", title: "Upfront Estimate", desc: "You receive a clear, written quote before any work begins. No surprises, no hidden fees." },
    { step: "04", title: "Fast Repair", desc: "Using quality OEM parts, we fix your appliance right the first time with a warranty on all work." },
  ];

  const faqs = [
    { q: `What appliance brands does ${data.businessName} repair?`, a: `We service all major brands including Whirlpool, Samsung, LG, GE, Maytag, Frigidaire, KitchenAid, Bosch, Kenmore, Sub-Zero, and many more. Our technicians are factory-trained across the board.` },
    { q: "How much does an appliance repair cost?", a: `Our diagnostic visit is just $49 and is waived if you proceed with the repair. Most common repairs range from $149 to $349 depending on the appliance and the parts needed. We always provide an upfront estimate.` },
    { q: "Do you offer same-day service?", a: `Yes! ${data.businessName} offers same-day service for most repair requests. Call before noon and we can typically have a technician at your door the same day.` },
    { q: "Is there a warranty on repairs?", a: "Absolutely. We stand behind every repair with a 90-day labor warranty and use OEM or manufacturer-equivalent parts that come with their own warranty." },
    { q: "Should I repair or replace my appliance?", a: "As a general rule, if the repair costs less than 50% of a new appliance and your unit is less than 8-10 years old, repair is usually the smarter choice. We'll always give you an honest recommendation." },
    { q: "Do your technicians bring parts with them?", a: "Our service vans are stocked with common parts for the most popular brands. For specialized parts, we can usually source them within 24-48 hours." },
  ];

  const fallbackTestimonials = [
    { name: "Mike T.", text: "Fixed our refrigerator the same day we called. Fair price and the technician was super professional.", rating: 5 },
    { name: "Linda K.", text: "Our washer was making terrible noises. They diagnosed it in minutes and had it running like new.", rating: 5 },
    { name: "Carlos P.", text: "Saved us from buying a new dishwasher. Quick, honest, and affordable repair.", rating: 5 },
  ];
  const testimonials = data.testimonials?.length > 0 ? data.testimonials : fallbackTestimonials;

  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden" style={{ background: CHARCOAL, color: "#f1f5f9" }}>
      <FloatingParticles accent={ACCENT} />

      {/* ══════════════════ 1. NAV ══════════════════ */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-4">
          <GlassCard className="flex items-center justify-between px-4 md:px-6 py-3">
            <div className="flex items-center gap-2">
              <Wrench size={24} weight="fill" style={{ color: ACCENT }} />
              <span className="text-lg font-bold tracking-tight text-white">{data.businessName}</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
              <a href="#services" className="hover:text-white transition-colors">Services</a>
              <a href="#about" className="hover:text-white transition-colors">About</a>
              <a href="#projects" className="hover:text-white transition-colors">Projects</a>
              <a href="#reviews" className="hover:text-white transition-colors">Reviews</a>
              <a href="#contact" className="hover:text-white transition-colors">Contact</a>
            </div>
            <div className="flex items-center gap-3">
              <MagneticButton className="px-4 md:px-5 py-2 rounded-full text-sm font-semibold text-white transition-colors cursor-pointer"
                style={{ background: ACCENT } as React.CSSProperties}>
                Book Repair
              </MagneticButton>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors">
                {mobileMenuOpen ? <X size={24} /> : <List size={24} />}
              </button>
            </div>
          </GlassCard>
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3, ease: "easeInOut" }}
                className="md:hidden mt-2 overflow-hidden">
                <GlassCard className="flex flex-col gap-1 px-4 py-4">
                  {[{ label: "Services", href: "#services" }, { label: "About", href: "#about" }, { label: "Projects", href: "#projects" }, { label: "Reviews", href: "#reviews" }, { label: "Contact", href: "#contact" }].map((link) => (
                    <a key={link.label} href={link.href} onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-3 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors">{link.label}</a>
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
          <img src={heroImage} alt={data.businessName} className="w-full h-full object-cover object-center" />
          <div className="absolute inset-0 bg-black/70" />
        </div>
        <CircuitPattern opacity={0.04} accent={ACCENT} />
        <TechGrid opacity={0.04} accent={ACCENT} />
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full blur-[200px] pointer-events-none" style={{ background: `${ACCENT}08` }} />

        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          <div className="space-y-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity }} className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-sm font-semibold text-green-400">Technicians Available Today</span>
              </div>
              <p className="text-sm uppercase tracking-widest mb-4" style={{ color: ACCENT }}>Professional Appliance Repair</p>
              <h1 className="text-3xl md:text-6xl tracking-tighter leading-none font-bold text-white"
                style={{ textShadow: "0 2px 20px rgba(0,0,0,0.8), 0 4px 40px rgba(0,0,0,0.5)" }}>
                {data.tagline}
              </h1>
            </div>
            <p className="text-lg text-white/80 max-w-md leading-relaxed" style={{ textShadow: "0 1px 8px rgba(0,0,0,0.6)" }}>
              {(() => { const t = data.about; if (t.length <= 180) return t; const dot = t.indexOf(".", 80); return dot > 0 && dot < 220 ? t.slice(0, dot + 1) : t.slice(0, 180).trim() + "..."; })()}
            </p>
            <div className="flex flex-wrap gap-3">
              {["Licensed & Insured", "Same-Day Service", "90-Day Warranty"].map((badge) => (
                <span key={badge} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border backdrop-blur-sm bg-black/30"
                  style={{ color: ACCENT, borderColor: `${ACCENT}4d` }}>
                  <CheckCircle size={14} weight="fill" /> {badge}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap gap-4">
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white flex items-center gap-2 cursor-pointer"
                style={{ background: ACCENT } as React.CSSProperties}>
                Get Free Estimate <ArrowRight size={18} weight="bold" />
              </MagneticButton>
              <MagneticButton href={`tel:${phoneDigits}`}
                className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/15 flex items-center gap-2 cursor-pointer">
                <Phone size={18} weight="duotone" /> <PhoneLink phone={data.phone} />
              </MagneticButton>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-slate-300">
              <span className="flex items-center gap-2"><MapPin size={16} weight="duotone" style={{ color: ACCENT }} /><MapLink address={data.address} /></span>
            </div>
          </div>
          <div className="hidden md:block relative">
            <div className="relative rounded-2xl overflow-hidden border border-white/15">
              <img src={heroCardImage} alt={`${data.businessName} technician`} className="w-full h-[500px] object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6">
                <div className="px-4 py-2 rounded-full backdrop-blur-md bg-black/50 border flex items-center gap-2" style={{ borderColor: `${ACCENT}4d` }}>
                  <Lightning size={18} weight="fill" style={{ color: ACCENT }} />
                  <span className="text-sm font-semibold text-white">Fast Same-Day Repairs</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════ 3. STATS BAR ══════════════════ */}
      <section className="relative z-10 py-16 overflow-hidden border-y" style={{ borderColor: `${ACCENT}1a` }}>
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #0a0a0a 0%, #111111 100%)" }} />
        <CircuitPattern opacity={0.02} accent={ACCENT} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] rounded-full blur-[180px]" style={{ background: `${ACCENT}08` }} />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {data.stats.map((stat, i) => {
              const statIcons = [Wrench, Clock, Star, ShieldCheck];
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

      {/* ══════════════════ 4. NEW CLIENT SPECIAL / EMERGENCY CTA ══════════════════ */}
      <section className="relative z-10 py-12 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT}dd)` }} />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='40' height='40' fill='none'/%3E%3Cpath d='M0 0L40 40M40 0L0 40' stroke='%23000' stroke-width='0.5'/%3E%3C/svg%3E\")" }} />
        <div className="max-w-4xl mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="w-3 h-3 rounded-full bg-white" />
              <Warning size={28} weight="fill" className="text-white" />
            </div>
            <div>
              <h3 className="text-xl md:text-2xl font-black text-white">$49 Diagnostic — Waived With Repair</h3>
              <p className="text-white/80 text-sm">Same-day appointments available. No hidden fees, no obligation.</p>
            </div>
          </div>
          <PhoneLink phone={data.phone} className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white text-black font-bold hover:bg-white/90 transition-colors whitespace-nowrap">
            <Phone size={20} weight="fill" /> Call Now
          </PhoneLink>
        </div>
      </section>

      {/* ══════════════════ 5. APPLIANCE TYPES GRID ══════════════════ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #111111 0%, #0a0a0a 50%, #111111 100%)" }} />
        <CircuitPattern accent={ACCENT} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[10%] right-[5%] w-[500px] h-[500px] rounded-full blur-[160px]" style={{ background: `${ACCENT}08` }} />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <AnimatedSection>
            <SectionHeader badge="What We Fix" title="Appliances We Repair" subtitle="From refrigerators to garbage disposals, our factory-trained technicians handle it all." accent={ACCENT} />
          </AnimatedSection>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {APPLIANCE_TYPES.map((item) => (
              <GlassCard key={item.name} className="p-5 text-center group hover:border-white/20 transition-all duration-300">
                <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${ACCENT}22, ${ACCENT}0a)`, border: `1px solid ${ACCENT}33` }}>
                  <item.icon size={28} weight="duotone" style={{ color: ACCENT }} />
                </div>
                <h3 className="text-sm font-bold text-white mb-1">{item.name}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ 6. SERVICES GRID ══════════════════ */}
      <section id="services" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #111111 0%, #0a0a0a 50%, #111111 100%)" }} />
        <TechGrid opacity={0.02} accent={ACCENT} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-[10%] left-[5%] w-[400px] h-[400px] rounded-full blur-[140px]" style={{ background: `${STEEL}05` }} />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Our Services" title="Expert Repair Services"
            subtitle={`${data.businessName} provides fast, reliable appliance repair you can count on.`} accent={ACCENT} />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.services.map((service, i) => {
              const Icon = getServiceIcon(service.name);
              return (
                <div key={service.name} className="group relative p-7 rounded-2xl border border-white/[0.10] hover:border-opacity-30 transition-all duration-500 overflow-hidden bg-white/[0.07]">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{ background: `radial-gradient(circle at 50% 0%, ${ACCENT}15, transparent 70%)` }} />
                  <div className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: `linear-gradient(to right, transparent, ${ACCENT}4d, transparent)` }} />
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-5">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 border"
                        style={{ background: ACCENT_GLOW, borderColor: `${ACCENT}33` }}>
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

      {/* ══════════════════ 7. ABOUT ══════════════════ */}
      <section id="about" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #111111 0%, #0a0a0a 50%, #111111 100%)" }} />
        <TechGrid opacity={0.02} accent={ACCENT} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] left-[10%] w-[500px] h-[500px] rounded-full blur-[180px]" style={{ background: `${ACCENT}06` }} />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="relative">
              <div className="rounded-2xl overflow-hidden border border-white/15">
                <img src={aboutImage} alt={`${data.businessName} team`} className="w-full h-[400px] object-cover" />
              </div>
              <div className="absolute -bottom-4 -right-4 md:bottom-6 md:-right-6">
                <div className="px-5 py-3 rounded-xl backdrop-blur-md border text-white font-bold text-sm shadow-lg"
                  style={{ background: `${ACCENT}e6`, borderColor: `${ACCENT}80` }}>
                  {data.stats[0] ? `${data.stats[0].value} ${data.stats[0].label}` : "Expert Repairs"}
                </div>
              </div>
            </div>
            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border"
                style={{ color: ACCENT, borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}>About Us</span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6 text-white">Your Trusted Repair Experts</h2>
              <p className="text-slate-400 leading-relaxed mb-8">{data.about}</p>
              <div className="grid grid-cols-2 gap-4">
                {TRUST_BADGES.map((badge) => (
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

      {/* ══════════════════ 8. PROCESS ══════════════════ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #111111 0%, #0a0a0a 50%, #111111 100%)" }} />
        <CircuitPattern opacity={0.025} accent={ACCENT} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] rounded-full blur-[180px]" style={{ background: `${STEEL}06` }} />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <AnimatedSection>
            <SectionHeader badge="How It Works" title="Our 4-Step Repair Process" accent={ACCENT} />
          </AnimatedSection>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {processSteps.map((step, i) => (
              <div key={step.step} className="relative">
                {i < processSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-10 left-[calc(50%+40px)] w-[calc(100%-80px)] h-px"
                    style={{ background: `linear-gradient(to right, ${ACCENT}33, ${ACCENT}11)` }} />
                )}
                <GlassCard className="p-6 text-center relative">
                  <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-black"
                    style={{ background: `linear-gradient(135deg, ${ACCENT}22, ${ACCENT}0a)`, color: ACCENT, border: `1px solid ${ACCENT}33` }}>
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

      {/* ══════════════════ 9. PRICING TIERS ══════════════════ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #111111 0%, #0a0a0a 50%, #111111 100%)" }} />
        <TechGrid opacity={0.02} accent={ACCENT} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[15%] left-[10%] w-[400px] h-[400px] rounded-full blur-[160px]" style={{ background: `${ACCENT}06` }} />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Transparent Pricing" title="Honest, Upfront Repair Costs" subtitle="No hidden fees. Know exactly what you'll pay before we start." accent={ACCENT} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PRICING_PLANS.map((plan) => (
              <div key={plan.name} className="relative">
                {plan.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 px-4 py-1 rounded-full text-xs font-bold text-white"
                    style={{ background: ACCENT }}>Most Popular</div>
                )}
                {plan.featured ? (
                  <ShimmerBorder accent={ACCENT}>
                    <div className="p-7">
                      <div className="w-12 h-12 rounded-xl mb-4 flex items-center justify-center" style={{ background: ACCENT_GLOW }}>
                        <plan.icon size={24} weight="duotone" style={{ color: ACCENT }} />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
                      <p className="text-slate-500 text-xs mb-3">{plan.period}</p>
                      <p className="text-4xl font-black mb-6" style={{ color: ACCENT }}>{plan.price}</p>
                      <ul className="space-y-2.5 mb-6">
                        {plan.features.map((f) => (
                          <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                            <CheckCircle size={16} weight="fill" style={{ color: ACCENT }} /> {f}
                          </li>
                        ))}
                      </ul>
                      <MagneticButton className="w-full py-3 rounded-xl text-sm font-semibold text-white cursor-pointer"
                        style={{ background: ACCENT } as React.CSSProperties}>
                        Book Now <ArrowRight size={16} weight="bold" />
                      </MagneticButton>
                    </div>
                  </ShimmerBorder>
                ) : (
                  <GlassCard className="p-7 h-full flex flex-col">
                    <div className="w-12 h-12 rounded-xl mb-4 flex items-center justify-center" style={{ background: ACCENT_GLOW }}>
                      <plan.icon size={24} weight="duotone" style={{ color: ACCENT }} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
                    <p className="text-slate-500 text-xs mb-3">{plan.period}</p>
                    <p className="text-4xl font-black mb-6" style={{ color: ACCENT }}>{plan.price}</p>
                    <ul className="space-y-2.5 mb-6 flex-1">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                          <CheckCircle size={16} weight="fill" style={{ color: ACCENT }} /> {f}
                        </li>
                      ))}
                    </ul>
                    <MagneticButton className="w-full py-3 rounded-xl text-sm font-semibold border border-white/15 text-white cursor-pointer">
                      Get Started
                    </MagneticButton>
                  </GlassCard>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ 10. BRANDS WE SERVICE ══════════════════ */}
      <section className="relative z-10 py-20 md:py-24 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #111111 0%, #0a0a0a 50%, #111111 100%)" }} />
        <CircuitPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <AnimatedSection>
            <SectionHeader badge="All Major Brands" title="Brands We Service" subtitle="Factory-trained technicians certified on every major manufacturer." accent={ACCENT} />
          </AnimatedSection>
          <div className="flex flex-wrap justify-center gap-4">
            {BRAND_NAMES.map((brand) => (
              <div key={brand} className="px-6 py-3 rounded-xl border border-white/15 bg-white/[0.07] text-sm font-semibold text-slate-300 hover:border-white/20 transition-colors">
                {brand}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ 11. COMPARISON TABLE ══════════════════ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #111111 0%, #0a0a0a 50%, #111111 100%)" }} />
        <TechGrid opacity={0.02} accent={ACCENT} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] right-[15%] w-[400px] h-[400px] rounded-full blur-[160px]" style={{ background: `${ACCENT}06` }} />
        </div>
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <AnimatedSection>
            <SectionHeader badge="Why Choose Us" title={`${data.businessName} vs. The Competition`} accent={ACCENT} />
          </AnimatedSection>
          <GlassCard className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/15">
                    <th className="text-left p-4 text-slate-400 font-medium">Feature</th>
                    <th className="text-center p-4 font-bold text-white" style={{ color: ACCENT }}>{data.businessName}</th>
                    <th className="text-center p-4 text-slate-500 font-medium">Others</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_ROWS.map((row, i) => (
                    <tr key={row.feature} className={i % 2 === 0 ? "bg-white/[0.01]" : ""}>
                      <td className="p-4 text-slate-300">{row.feature}</td>
                      <td className="p-4 text-center">
                        <CheckCircle size={20} weight="fill" className="mx-auto" style={{ color: "#22c55e" }} />
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

      {/* ══════════════════ 12. GOOGLE REVIEWS + TESTIMONIALS ══════════════════ */}
      <section id="reviews" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #111111 0%, #0a0a0a 50%, #111111 100%)" }} />
        <CircuitPattern opacity={0.02} accent={ACCENT} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] right-[15%] w-[400px] h-[400px] rounded-full blur-[160px]" style={{ background: `${ACCENT}06` }} />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <AnimatedSection>
            {/* Google Reviews Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full border border-white/15 bg-white/[0.08] mb-6">
                <GoogleLogo size={24} weight="bold" className="text-white" />
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={18} weight="fill" style={{ color: "#facc15" }} />
                  ))}
                </div>
                <span className="text-white font-bold">{data.stats.find(s => s.label.toLowerCase().includes("rating"))?.value || "4.9"}</span>
                <span className="text-slate-400 text-sm">on Google</span>
              </div>
              <SectionHeader badge="Customer Reviews" title="What Our Customers Say" accent={ACCENT} />
            </div>
          </AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <GlassCard key={i} className="p-6 h-full flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex gap-0.5">
                    {Array.from({ length: t.rating || 5 }).map((_, j) => (
                      <Star key={j} size={16} weight="fill" style={{ color: ACCENT }} />
                    ))}
                  </div>
                  <SealCheck size={16} weight="fill" className="text-blue-400" />
                  <span className="text-xs text-slate-500">Verified</span>
                </div>
                <p className="text-slate-300 leading-relaxed flex-1 text-sm mb-4">&ldquo;{t.text}&rdquo;</p>
                <div className="pt-4 border-t border-white/8">
                  <span className="text-sm font-semibold text-white">{t.name}</span>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ 13. DIAGNOSTIC QUIZ ══════════════════ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #111111 0%, #0a0a0a 50%, #111111 100%)" }} />
        <CircuitPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <AnimatedSection>
            <SectionHeader badge="Quick Assessment" title="What Does Your Appliance Need?" accent={ACCENT} />
          </AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {QUIZ_OPTIONS.map((opt, i) => (
              <button key={opt.label} onClick={() => setQuizAnswer(i)}
                className={`p-6 rounded-2xl border text-left transition-all duration-300 cursor-pointer ${quizAnswer === i ? "border-white/30 bg-white/[0.06]" : "border-white/15 bg-white/[0.07] hover:border-white/20"}`}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 rounded-full" style={{ background: opt.color }} />
                  <span className="text-xs font-bold uppercase tracking-wider" style={{ color: opt.color }}>{opt.tag}</span>
                </div>
                <h4 className="text-white font-semibold mb-2">{opt.label}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{opt.desc}</p>
              </button>
            ))}
          </div>
          <AnimatePresence>
            {quizAnswer !== null && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }} transition={spring} className="overflow-hidden">
                <ShimmerBorder accent={ACCENT}>
                  <div className="p-6 text-center">
                    <h4 className="text-lg font-bold text-white mb-2">
                      {quizAnswer === 0 ? "We Can Help — Call Now!" : quizAnswer === 1 ? "Don't Wait — Schedule Today" : "Smart Move — Book a Tune-Up"}
                    </h4>
                    <p className="text-slate-400 text-sm mb-4">
                      {quizAnswer === 0 ? "Our technicians handle urgent repairs same-day. Don't let a broken appliance ruin your day." : quizAnswer === 1 ? "Catching issues early prevents costly breakdowns. We'll diagnose and fix it fast." : "Regular maintenance extends appliance life by 30-50% and prevents unexpected failures."}
                    </p>
                    <MagneticButton href={`tel:${phoneDigits}`}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-white font-semibold cursor-pointer"
                      style={{ background: ACCENT } as React.CSSProperties}>
                      <Phone size={18} weight="fill" /> Call {data.phone}
                    </MagneticButton>
                  </div>
                </ShimmerBorder>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ══════════════════ 14. VIDEO PLACEHOLDER ══════════════════ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #111111 0%, #0a0a0a 50%, #111111 100%)" }} />
        <TechGrid opacity={0.02} accent={ACCENT} />
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <AnimatedSection>
            <SectionHeader badge="See Our Work" title="Watch Our Technicians in Action" accent={ACCENT} />
          </AnimatedSection>
          <div className="relative rounded-2xl overflow-hidden border border-white/15 group cursor-pointer">
            <img src={galleryImages[0]} alt="Appliance repair video" className="w-full h-[350px] md:h-[450px] object-cover" />
            <div className="absolute inset-0 bg-black/50 group-hover:bg-black/40 transition-colors flex items-center justify-center">
              <div className="w-20 h-20 rounded-full flex items-center justify-center border-2 border-white/30 bg-white/10 backdrop-blur-sm group-hover:scale-110 transition-transform">
                <Play size={36} weight="fill" className="text-white ml-1" />
              </div>
            </div>
            <div className="absolute bottom-6 left-6">
              <p className="text-white font-semibold text-lg">See How We Diagnose & Repair</p>
              <p className="text-white/60 text-sm">Professional appliance repair — start to finish</p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════ 15. GALLERY ══════════════════ */}
      <section id="projects" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #111111 0%, #0a0a0a 50%, #111111 100%)" }} />
        <CircuitPattern opacity={0.02} accent={ACCENT} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[30%] left-[20%] w-[500px] h-[500px] rounded-full blur-[200px]" style={{ background: `${ACCENT}06` }} />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <AnimatedSection>
            <SectionHeader badge="Our Work" title="Recent Repairs" accent={ACCENT} />
          </AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {galleryImages.slice(0, 4).map((src, i) => {
              const titles = ["Refrigerator Compressor Repair", "Washing Machine Motor Fix", "Oven Igniter Replacement", "Dryer Heating Element"];
              return (
                <div key={i} className="group relative rounded-2xl overflow-hidden border border-white/[0.10] hover:border-opacity-30 transition-all duration-500">
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

      {/* ══════════════════ 16. FAQ ══════════════════ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #111111 0%, #0a0a0a 50%, #111111 100%)" }} />
        <CircuitPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <AnimatedSection>
            <SectionHeader badge="FAQ" title="Common Questions" accent={ACCENT} />
          </AnimatedSection>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} question={faq.q} answer={faq.a} isOpen={openFaq === i}
                onToggle={() => setOpenFaq(openFaq === i ? null : i)} />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ 17. SERVICE AREA ══════════════════ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #111111 0%, #0a0a0a 50%, #111111 100%)" }} />
        <CircuitPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <AnimatedSection>
            <SectionHeader badge="Service Area" title="Areas We Serve" accent={ACCENT} />
          </AnimatedSection>
          <div className="text-center">
            <GlassCard className="p-8 inline-block">
              <div className="flex items-center gap-3 text-lg">
                <MapPin size={24} weight="duotone" style={{ color: ACCENT }} />
                <MapLink address={data.address} className="text-white font-semibold" />
              </div>
              <p className="text-slate-400 text-sm mt-2">&amp; Surrounding Areas</p>
              <div className="flex items-center justify-center gap-2 mt-4">
                <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity }} className="w-2.5 h-2.5 rounded-full bg-green-500" />
                <span className="text-green-400 text-sm font-medium">Technicians dispatched from your area</span>
              </div>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* ══════════════════ 18. MID-PAGE CTA ══════════════════ */}
      <section className="relative z-10 py-20 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT}cc, ${ACCENT})` }} />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='40' height='40' fill='none'/%3E%3Cpath d='M0 0L40 40M40 0L0 40' stroke='%23000' stroke-width='0.5'/%3E%3C/svg%3E\")" }} />
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <Wrench size={48} weight="fill" className="mx-auto mb-6 text-white/70" />
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-4">Appliance Acting Up? We Fix It Fast.</h2>
          <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">Same-day service, upfront pricing, and a warranty on every repair. Call now.</p>
          <PhoneLink phone={data.phone} className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-white text-black font-bold text-lg hover:bg-white/90 transition-colors">
            <Phone size={22} weight="fill" /> Call {data.phone}
          </PhoneLink>
        </div>
      </section>

      {/* ══════════════════ 19. HOURS ══════════════════ */}
      {data.hours && (
        <section className="relative z-10 py-24 md:py-32 overflow-hidden">
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #111111 0%, #0a0a0a 50%, #111111 100%)" }} />
          <TechGrid opacity={0.02} accent={ACCENT} />
          <div className="max-w-3xl mx-auto px-6 relative z-10">
            <AnimatedSection>
              <SectionHeader badge="Hours" title="When We&apos;re Available" accent={ACCENT} />
            </AnimatedSection>
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

      {/* ══════════════════ 20. CONTACT FORM ══════════════════ */}
      <section id="contact" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #111111 0%, #0a0a0a 50%, #111111 100%)" }} />
        <CircuitPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border"
                style={{ color: ACCENT, borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}>Contact Us</span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6 text-white">Schedule Your Repair</h2>
              <p className="text-slate-400 leading-relaxed mb-8">Appliance broken? Contact {data.businessName} today for fast, reliable repair service.</p>
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
              <h3 className="text-xl font-semibold text-white mb-6">Request a Repair</h3>
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
                  <label className="block text-sm text-slate-400 mb-1.5">Appliance Type</label>
                  <select className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white focus:outline-none text-sm">
                    <option value="" className="bg-neutral-900">Select an appliance</option>
                    {APPLIANCE_TYPES.map((a) => (
                      <option key={a.name} value={a.name.toLowerCase()} className="bg-neutral-900">{a.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">Describe the Issue</label>
                  <textarea rows={3} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 focus:outline-none text-sm resize-none" placeholder="What's happening with your appliance?" />
                </div>
                <MagneticButton className="w-full py-4 rounded-xl text-base font-semibold text-white flex items-center justify-center gap-2 cursor-pointer"
                  style={{ background: ACCENT } as React.CSSProperties}>
                  Schedule Repair <ArrowRight size={18} weight="bold" />
                </MagneticButton>
              </form>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* ══════════════════ 21. PROMISE / GUARANTEE ══════════════════ */}
      <section className="relative z-10 py-16 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #111111 0%, #0a0a0a 100%)" }} />
        <CircuitPattern opacity={0.015} accent={ACCENT} />
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <ShimmerBorder accent={ACCENT}>
            <div className="p-8 md:p-12">
              <ShieldCheck size={48} weight="fill" style={{ color: ACCENT }} className="mx-auto mb-4" />
              <h2 className="text-2xl md:text-4xl font-extrabold text-white mb-4">Our Repair Guarantee</h2>
              <p className="text-slate-400 leading-relaxed max-w-2xl mx-auto text-lg">
                {data.businessName} stands behind every repair. If we can&apos;t fix it, you don&apos;t pay. Every job backed by our 90-day warranty.
              </p>
              <div className="flex flex-wrap justify-center gap-4 mt-8">
                {["All Brands", "Licensed & Insured", "$49 Diagnostic", "90-Day Warranty"].map((item) => (
                  <span key={item} className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border"
                    style={{ color: ACCENT, borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}>
                    <CheckCircle size={16} weight="fill" /> {item}
                  </span>
                ))}
              </div>
            </div>
          </ShimmerBorder>
        </div>
      </section>

      {/* ══════════════════ 22. FOOTER ══════════════════ */}
      <footer className="relative z-10 border-t border-white/8 py-10 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #111111 0%, #0a0a0a 100%)" }} />
        <CircuitPattern opacity={0.015} accent={ACCENT} />
        <div className="mx-auto max-w-6xl px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Wrench size={22} weight="fill" style={{ color: ACCENT }} />
                <span className="text-lg font-bold text-white">{data.businessName}</span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">
                {data.about.length > 120 ? data.about.slice(0, 120).trim() + "..." : data.about}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-3">Quick Links</h4>
              <div className="space-y-2">
                {["Services", "About", "Projects", "Reviews", "Contact"].map((link) => (
                  <a key={link} href={`#${link.toLowerCase()}`} className="block text-sm text-slate-500 hover:text-white transition-colors">{link}</a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-3">Contact</h4>
              <div className="space-y-2 text-sm text-slate-500">
                <p><PhoneLink phone={data.phone} /></p>
                <p><MapLink address={data.address} /></p>
                {data.socialLinks && Object.entries(data.socialLinks).map(([platform, url]) => (
                  <a key={platform} href={url} target="_blank" rel="noopener noreferrer"
                    className="block hover:text-white transition-colors capitalize">{platform}</a>
                ))}
              </div>
            </div>
          </div>
          <div className="border-t border-white/8 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Wrench size={14} weight="fill" style={{ color: ACCENT }} />
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
