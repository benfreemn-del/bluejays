"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  AnimatePresence,
} from "framer-motion";
import {
  PawPrint,
  Heart,
  Stethoscope,
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
  Syringe,
  FirstAidKit,
  Dog,
  Cat,
  Scissors,
  Pill,
} from "@phosphor-icons/react";
import type { GeneratedSiteData } from "@/lib/generator";
import BluejayLogo from "../BluejayLogo";
import { MapLink, PhoneLink } from "@/components/templates/MapLink";

/* ───────────────────────── SPRING CONFIGS ───────────────────────── */
const spring = { type: "spring" as const, stiffness: 100, damping: 20 };
const springFast = { type: "spring" as const, stiffness: 200, damping: 25 };

/* ───────────────────────── COLORS ───────────────────────── */
const CHARCOAL = "#f7faf8";
const DEFAULT_GREEN = "#16a34a";
const WARM_ROSE = "#e11d48";

function getAccent(accentColor?: string) {
  const c = accentColor || DEFAULT_GREEN;
  return {
    PRIMARY: c,
    PRIMARY_GLOW: `${c}26`,
    WARM: WARM_ROSE,
  };
}

/* ───────────────────────── SERVICE ICON MAP ───────────────────────── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SERVICE_ICON_MAP: Record<string, any> = {
  vaccine: Syringe,
  vaccination: Syringe,
  surgery: Stethoscope,
  dental: Stethoscope,
  emergency: FirstAidKit,
  wellness: Heart,
  exam: Stethoscope,
  groom: Scissors,
  spay: Syringe,
  neuter: Syringe,
  medic: Pill,
  pharma: Pill,
  dog: Dog,
  cat: Cat,
  boarding: PawPrint,
  nutrition: Heart,
};

function getServiceIcon(serviceName: string) {
  const lower = serviceName.toLowerCase();
  for (const [key, Icon] of Object.entries(SERVICE_ICON_MAP)) {
    if (lower.includes(key)) return Icon;
  }
  return PawPrint;
}

/* ───────────────────────── STOCK FALLBACK IMAGES ───────────────────────── */
const STOCK_HERO = "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1400&q=80";
const STOCK_ABOUT = "https://images.unsplash.com/photo-1629740067905-bd3f515aa739?w=600&q=80";
const STOCK_GALLERY = [
  "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&q=80",
  "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&q=80",
  "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=80",
  "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&q=80",
];

/* ───────────────────────── FLOATING PAW PARTICLES ───────────────────────── */
function FloatingPaws({ accent }: { accent: string }) {
  const particles = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 8,
    duration: 6 + Math.random() * 7,
    size: 2 + Math.random() * 3,
    opacity: 0.12 + Math.random() * 0.3,
    isRose: Math.random() > 0.65,
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
            background: p.isRose ? WARM_ROSE : accent,
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

/* ───────────────────────── PAW PRINT SVG PATTERN ───────────────────────── */
function PawPattern({ opacity = 0.03, accent }: { opacity?: number; accent: string }) {
  const patternId = `pawPatternV2Prev-${accent.replace("#", "")}`;
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }}>
      <defs>
        <pattern id={patternId} width="90" height="90" patternUnits="userSpaceOnUse">
          <circle cx="45" cy="30" r="6" fill={accent} opacity="0.4" />
          <circle cx="32" cy="18" r="3.5" fill={accent} opacity="0.3" />
          <circle cx="58" cy="18" r="3.5" fill={accent} opacity="0.3" />
          <circle cx="28" cy="32" r="3" fill={accent} opacity="0.3" />
          <circle cx="62" cy="32" r="3" fill={accent} opacity="0.3" />
          <circle cx="45" cy="70" r="5" fill={accent} opacity="0.2" />
          <circle cx="35" cy="60" r="3" fill={accent} opacity="0.15" />
          <circle cx="55" cy="60" r="3" fill={accent} opacity="0.15" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  );
}

/* ───────────────────────── HEARTBEAT LINE SVG ───────────────────────── */
function HeartbeatLine({ opacity = 0.03, accent }: { opacity?: number; accent: string }) {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }} viewBox="0 0 1000 600" preserveAspectRatio="none">
      <path d="M0 300 L200 300 L250 200 L300 400 L350 250 L400 350 L450 300 L1000 300" stroke={accent} strokeWidth="1.5" fill="none" />
      <path d="M0 350 L300 350 L340 280 L380 420 L420 310 L460 380 L500 350 L1000 350" stroke={WARM_ROSE} strokeWidth="1" fill="none" />
    </svg>
  );
}

/* ───────────────────────── HERO PET SVG ───────────────────────── */
function HeroPetSVG({ accent }: { accent: string }) {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1200 800" preserveAspectRatio="none" style={{ opacity: 0.05 }}>
      <motion.path d="M100 400 L250 400 L300 250 L350 550 L400 350 L450 450 L500 400 L700 400" stroke={accent} strokeWidth="2" fill="none" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2.5, ease: "easeInOut" }} />
      <motion.circle cx="600" cy="300" r="40" stroke={accent} strokeWidth="1.5" fill="none" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2, ease: "easeInOut", delay: 0.5 }} />
      <motion.circle cx="300" cy="250" r="5" fill={accent} animate={{ opacity: [0, 1, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 2.5 }} />
      <motion.circle cx="700" cy="400" r="4" fill={WARM_ROSE} animate={{ opacity: [0, 1, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 3 }} />
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
          background: `conic-gradient(from 0deg, transparent, ${accent}, transparent, ${WARM_ROSE}, transparent)`,
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
        <span className="text-lg font-semibold text-[#1c1917] pr-4">{question}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={spring}>
          <CaretDown size={20} className="text-[#6b7280] shrink-0" />
        </motion.div>
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
function SectionHeader({ badge, title, subtitle, accent }: {
  badge: string;
  title: string;
  subtitle?: string;
  accent: string;
}) {
  return (
    <div className="text-center mb-16">
      <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: accent, borderColor: `${accent}33`, background: `${accent}0d` }}>
        {badge}
      </span>
      <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-[#1c1917]">{title}</h2>
      <div className="h-0.5 w-16 mx-auto mt-4" style={{ background: `linear-gradient(to right, ${accent}, transparent)` }} />
      {subtitle && <p className="text-[#6b7280] mt-4 max-w-2xl text-lg leading-relaxed mx-auto">{subtitle}</p>}
    </div>
  );
}

/* ───────────────────────── CLAIM BANNER ───────────────────────── */
function ClaimBanner({ businessName, accentColor, prospectId }: {
  businessName: string;
  accentColor: string;
  prospectId: string;
}) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 7);
    const tick = () => {
      const diff = expiry.getTime() - Date.now();
      if (diff <= 0) { setTimeLeft("EXPIRED"); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setTimeLeft(`${d}d ${h}h ${m}m`);
    };
    tick();
    const interval = setInterval(tick, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="bg-white/90 backdrop-blur-sm border-t border-gray-200 px-4 py-2 flex items-center justify-center gap-4">
        <p className="text-xs text-[#6b7280]">
          <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1.5 animate-pulse" />
          Custom-built preview for this business
        </p>
        {timeLeft && timeLeft !== "EXPIRED" && (
          <p className="text-xs font-bold" style={{ color: accentColor }}>Preview expires in {timeLeft}</p>
        )}
      </div>
      <div className="px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4" style={{ background: `linear-gradient(135deg, ${accentColor}20, ${accentColor}10)`, borderTop: `1px solid ${accentColor}30` }}>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#1c1917] truncate">This website was built for {businessName}</p>
          <p className="text-xs text-[#6b7280]">Limited time — claim your free website today</p>
        </div>
        <a href={`/claim/${prospectId}`} className="shrink-0 h-11 px-6 rounded-full text-[#1c1917] text-sm font-bold flex items-center gap-2 hover:shadow-lg transition-all duration-300" style={{ background: accentColor }}>
          Claim Your Website
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
        </a>
      </div>
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
      initial={ opacity: 0, y: 40 }
      whileInView={ opacity: 1, y: 0 }
      viewport={{ once: true, margin: "-80px" }}
      transition={ duration: 0.6, ease: "easeOut" as const }
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function V2VeterinaryPreview({ data }: { data: GeneratedSiteData }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const { PRIMARY, PRIMARY_GLOW } = getAccent(data.accentColor);

  const heroImage = data.photos?.[0] || STOCK_HERO;
  const aboutImage = data.photos?.[1] || STOCK_ABOUT;
  const galleryImages = data.photos?.length > 2 ? data.photos.slice(2, 6) : STOCK_GALLERY;

  const processSteps = [
    { step: "01", title: "Schedule a Visit", desc: `Book an appointment online or by phone. We accommodate same-day urgent care needs.` },
    { step: "02", title: "Thorough Examination", desc: `Our veterinarians perform a comprehensive physical exam and discuss your pet's health history.` },
    { step: "03", title: "Personalized Plan", desc: `We create a tailored treatment or preventive care plan specific to your pet's needs.` },
    { step: "04", title: "Follow-Up Care", desc: `We stay connected with progress checks and adjust care plans to keep your pet thriving.` },
  ];

  const faqs = [
    { q: `What services does ${data.businessName} offer?`, a: `We provide a full range of veterinary services including ${data.services.slice(0, 3).map(s => s.name).join(", ")}, and more. Our team is dedicated to keeping your pets healthy and happy.` },
    { q: "Do you handle pet emergencies?", a: `Yes, ${data.businessName} offers urgent care during business hours. For after-hours emergencies, we can direct you to the nearest emergency animal hospital.` },
    { q: "What should I bring to my pet's first visit?", a: "Please bring any previous medical records, vaccination history, and a list of current medications. If your pet is anxious, a favorite toy or blanket can help them feel at ease." },
    { q: "Do you see exotic pets?", a: `Our team primarily treats dogs and cats, but we also have experience with many other companion animals. Call ${data.businessName} to ask about your specific pet.` },
  ];

  /* Fallback testimonials */
  const fallbackTestimonials = [
    { name: "Heather R.", text: "They saved our dog's life with quick diagnosis and expert care. We trust them completely.", rating: 5 },
    { name: "Patrick M.", text: "The whole staff is gentle and caring with our anxious cat. Best vet experience we've had.", rating: 5 },
    { name: "Allison T.", text: "Affordable, thorough, and they truly love animals. Our pets are always in great hands here.", rating: 5 }
  ];
  const testimonials = data.testimonials?.length > 0 ? data.testimonials : fallbackTestimonials;

  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden" style={{ background: CHARCOAL, color: "#1c1917" }}>
      <FloatingPaws accent={PRIMARY} />

      {/* ══════════════════ 1. NAV ══════════════════ */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-4">
          <GlassCard className="flex items-center justify-between px-4 md:px-6 py-3">
            <div className="flex items-center gap-2">
              <PawPrint size={24} weight="fill" style={{ color: PRIMARY }} />
              <span className="text-lg font-bold tracking-tight text-[#1c1917]">{data.businessName}</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm text-[#6b7280]">
              <a href="#services" className="hover:text-[#1c1917] transition-colors">Services</a>
              <a href="#about" className="hover:text-[#1c1917] transition-colors">About</a>
              <a href="#gallery" className="hover:text-[#1c1917] transition-colors">Gallery</a>
              <a href="#contact" className="hover:text-[#1c1917] transition-colors">Contact</a>
            </div>
            <div className="flex items-center gap-3">
              <MagneticButton className="px-4 md:px-5 py-2 rounded-full text-sm font-semibold text-[#1c1917] transition-colors cursor-pointer" style={{ background: PRIMARY } as React.CSSProperties}>
                Book Appointment
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
                  {[{ label: "Services", href: "#services" }, { label: "About", href: "#about" }, { label: "Gallery", href: "#gallery" }, { label: "Contact", href: "#contact" }].map((link) => (
                    <a key={link.label} href={link.href} onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-lg text-sm text-[#4b5563] hover:text-[#1c1917] hover:bg-gray-50 transition-colors">{link.label}</a>
                  ))}
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* ══════════════════ 2. HERO ══════════════════ */}
      <section className="relative min-h-[100dvh] flex items-center pt-24 z-10 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #0a150e 0%, #0d120f 50%, #f7faf8 100%)" }} />
        <PawPattern opacity={0.04} accent={PRIMARY} />
        <HeroPetSVG accent={PRIMARY} />
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full blur-[200px] pointer-events-none" style={{ background: `${PRIMARY}08` }} />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full blur-[160px] pointer-events-none" style={{ background: `${WARM_ROSE}06` }} />

        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          <div className="space-y-8">
            <div>
              <p className="text-sm uppercase tracking-widest mb-4" style={{ color: PRIMARY }}>Compassionate Veterinary Care</p>
              <h1 className="text-3xl md:text-6xl tracking-tighter leading-none font-bold text-[#1c1917]" style={{ textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>
                {data.tagline}
              </h1>
            </div>
            <p className="text-lg text-[#6b7280] max-w-md leading-relaxed">
              {data.about.length > 160 ? data.about.slice(0, 160).trim() + "..." : data.about}
            </p>
            <div className="flex flex-wrap gap-4">
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-[#1c1917] flex items-center gap-2 cursor-pointer" style={{ background: PRIMARY } as React.CSSProperties}>
                Schedule a Visit
                <ArrowRight size={18} weight="bold" />
              </MagneticButton>
              <MagneticButton href={`tel:${data.phone.replace(/\D/g, "")}`} className="px-8 py-4 rounded-full text-base font-semibold text-[#1c1917] border border-gray-200 flex items-center gap-2 cursor-pointer">
                <Phone size={18} weight="duotone" />
                <PhoneLink phone={data.phone} />
              </MagneticButton>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-[#6b7280]">
              <span className="flex items-center gap-2">
                <MapPin size={16} weight="duotone" style={{ color: PRIMARY }} />
                <MapLink address={data.address} />
              </span>
              <span className="flex items-center gap-2">
                <Heart size={16} weight="duotone" style={{ color: PRIMARY }} />
                Caring for Pets Since Day One
              </span>
            </div>
          </div>

          <div className="hidden md:block relative">
            <div className="relative rounded-2xl overflow-hidden border border-gray-200">
              <img src={heroImage} alt={`${data.businessName} veterinary care`} className="w-full h-[500px] object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#f7faf8] via-transparent to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#f7faf8]/40 to-transparent" />
              <div className="absolute bottom-6 left-6 flex items-center gap-3">
                <div className="px-4 py-2 rounded-full backdrop-blur-md bg-black/50 border flex items-center gap-2" style={{ borderColor: `${PRIMARY}4d` }}>
                  <Heart size={18} weight="fill" style={{ color: WARM_ROSE }} />
                  <span className="text-sm font-semibold text-[#1c1917]">Your Pet&apos;s Best Friend</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════ 3. STATS ══════════════════ */}
      <section className="relative z-10 py-16 overflow-hidden border-y" style={{ borderColor: `${PRIMARY}1a` }}>
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #111512 0%, #f7faf8 100%)" }} />
        <PawPattern opacity={0.02} accent={PRIMARY} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] rounded-full blur-[180px]" style={{ background: `${PRIMARY}08` }} />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {data.stats.map((stat, i) => {
              const statIcons = [PawPrint, Heart, Clock, Star];
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

      {/* ══════════════════ 4. SERVICES ══════════════════ */}
      <section id="services" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #f7faf8 0%, #0d140f 50%, #f7faf8 100%)" }} />
        <PawPattern accent={PRIMARY} />
        <HeartbeatLine opacity={0.025} accent={PRIMARY} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[10%] right-[5%] w-[500px] h-[500px] rounded-full blur-[160px]" style={{ background: `${PRIMARY}08` }} />
          <div className="absolute bottom-[10%] left-[5%] w-[400px] h-[400px] rounded-full blur-[140px]" style={{ background: `${WARM_ROSE}05` }} />
        </div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Our Services" title="Complete Pet Healthcare" subtitle={`${data.businessName} provides comprehensive veterinary services to keep your furry family members healthy and happy.`} accent={PRIMARY} />

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.services.map((service, i) => {
              const Icon = getServiceIcon(service.name);
              return (
                <div key={service.name} className="group relative p-7 rounded-2xl border border-gray-200/60 hover:border-opacity-30 transition-all duration-500 overflow-hidden bg-white/60">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: `radial-gradient(circle at 50% 0%, ${PRIMARY}15, transparent 70%)` }} />
                  <div className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `linear-gradient(to right, transparent, ${PRIMARY}4d, transparent)` }} />
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-5">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 border" style={{ background: PRIMARY_GLOW, borderColor: `${PRIMARY}33` }}>
                        <Icon size={24} weight="duotone" style={{ color: PRIMARY }} />
                      </div>
                      <span className="text-xs font-mono text-[#6b7280]">{String(i + 1).padStart(2, "0")}</span>
                    </div>
                    <h3 className="text-lg font-bold text-[#1c1917] mb-2">{service.name}</h3>
                    <p className="text-sm text-[#6b7280] leading-relaxed">{service.description || ""}</p>
                    {service.price && <p className="text-sm font-semibold mt-3" style={{ color: PRIMARY }}>{service.price}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════ 5. ABOUT ══════════════════ */}
      <section id="about" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #f7faf8 0%, #0b120e 50%, #f7faf8 100%)" }} />
        <HeartbeatLine opacity={0.02} accent={PRIMARY} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] left-[10%] w-[500px] h-[500px] rounded-full blur-[180px]" style={{ background: `${PRIMARY}06` }} />
        </div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="relative">
              <div className="rounded-2xl overflow-hidden border border-gray-200">
                <img src={aboutImage} alt={`${data.businessName} team`} className="w-full h-[400px] object-cover" />
              </div>
              <div className="absolute -bottom-4 -right-4 md:bottom-6 md:-right-6">
                <div className="px-5 py-3 rounded-xl backdrop-blur-md border text-[#1c1917] font-bold text-sm shadow-lg" style={{ background: `${PRIMARY}e6`, borderColor: `${PRIMARY}80` }}>
                  {data.stats[0] ? `${data.stats[0].value} ${data.stats[0].label}` : "Trusted Vets"}
                </div>
              </div>
            </div>
            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: PRIMARY, borderColor: `${PRIMARY}33`, background: `${PRIMARY}0d` }}>Why Choose Us</span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6 text-[#1c1917]">Where Pets Are Family</h2>
              <p className="text-[#6b7280] leading-relaxed mb-8">{data.about}</p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Stethoscope, label: "Licensed DVMs" },
                  { icon: Heart, label: "Compassionate Care" },
                  { icon: Star, label: "5-Star Rated" },
                  { icon: Clock, label: "Same-Day Urgent" },
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

      {/* ══════════════════ 6. PROCESS ══════════════════ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #f7faf8 0%, #111512 50%, #f7faf8 100%)" }} />
        <PawPattern opacity={0.025} accent={PRIMARY} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] rounded-full blur-[180px]" style={{ background: `${WARM_ROSE}06` }} />
        </div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <AnimatedSection>          <SectionHeader badge="Your Visit" title="What to Expect" accent={PRIMARY} /></AnimatedSection>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {processSteps.map((step, i) => (
              <div key={step.step} className="relative">
                {i < processSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-10 left-[calc(50%+40px)] w-[calc(100%-80px)] h-px" style={{ background: `linear-gradient(to right, ${PRIMARY}33, ${PRIMARY}11)` }} />
                )}
                <GlassCard className="p-6 text-center relative">
                  <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-black" style={{ background: `linear-gradient(135deg, ${PRIMARY}22, ${PRIMARY}0a)`, color: PRIMARY, border: `1px solid ${PRIMARY}33` }}>
                    {step.step}
                  </div>
                  <h3 className="text-lg font-bold text-[#1c1917] mb-2">{step.title}</h3>
                  <p className="text-sm text-[#6b7280] leading-relaxed">{step.desc}</p>
                </GlassCard>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ 7. GALLERY ══════════════════ */}
      <section id="gallery" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #f7faf8 0%, #0b120e 50%, #f7faf8 100%)" }} />
        <HeartbeatLine opacity={0.02} accent={PRIMARY} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[30%] left-[20%] w-[500px] h-[500px] rounded-full blur-[200px]" style={{ background: `${PRIMARY}06` }} />
        </div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <AnimatedSection>          <SectionHeader badge="Our Family" title="Happy Patients" accent={PRIMARY} /></AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {galleryImages.map((src, i) => {
              const titles = ["Wellness Checkups", "Playful Patients", "State-of-the-Art Facility", "Happy & Healthy Pets"];
              const descs = ["Routine exams to keep your pet in peak health.", "We love meeting all the furry friends!", "Modern equipment for the best diagnostics.", "Helping pets live their best lives."];
              return (
                <div key={i} className="group relative rounded-2xl overflow-hidden border border-gray-200/60 hover:border-opacity-30 transition-all duration-500">
                  <img src={src} alt={titles[i] || `Gallery ${i + 1}`} className="w-full h-64 object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-lg font-bold text-[#1c1917] mb-1">{titles[i] || `Gallery ${i + 1}`}</h3>
                    <p className="text-sm text-[#4b5563]">{descs[i] || ""}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════ 8. TESTIMONIALS ══════════════════ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #f7faf8 0%, #111512 50%, #f7faf8 100%)" }} />
        <PawPattern opacity={0.02} accent={PRIMARY} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] right-[15%] w-[400px] h-[400px] rounded-full blur-[160px]" style={{ background: `${PRIMARY}06` }} />
        </div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <AnimatedSection>          <SectionHeader badge="Testimonials" title="What Pet Parents Say" accent={PRIMARY} /></AnimatedSection>
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

      {/* ══════════════════ 9. PET CARE CTA ══════════════════ */}
      <section className="relative z-10 py-20 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${PRIMARY}, ${PRIMARY}cc, ${PRIMARY})` }} />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='40' height='40' fill='none'/%3E%3Cpath d='M0 0L40 40M40 0L0 40' stroke='%23000' stroke-width='0.5'/%3E%3C/svg%3E\")" }} />

        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <PawPrint size={48} weight="fill" className="mx-auto mb-6 text-white/70" />
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-[#1c1917] mb-4">Your Pet Deserves the Best Care</h2>
          <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
            Don&apos;t wait until something&apos;s wrong. Schedule a wellness visit with {data.businessName} and give your pet the care they deserve.
          </p>
          <PhoneLink phone={data.phone} className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-white font-bold text-lg hover:bg-white/90 transition-colors" style={{ color: PRIMARY }}>
            <Phone size={22} weight="fill" />
            {data.phone}
          </PhoneLink>
        </div>
      </section>

      {/* ══════════════════ 10. SERVICE AREAS ══════════════════ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #f7faf8 0%, #0b120e 50%, #f7faf8 100%)" }} />
        <PawPattern opacity={0.02} accent={PRIMARY} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[40%] right-[20%] w-[400px] h-[400px] rounded-full blur-[180px]" style={{ background: `${WARM_ROSE}06` }} />
        </div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <AnimatedSection>          <SectionHeader badge="Coverage Area" title="Areas We Serve" accent={PRIMARY} /></AnimatedSection>
          <div className="text-center">
            <GlassCard className="p-8 inline-block">
              <div className="flex items-center gap-3 text-lg">
                <MapPin size={24} weight="duotone" style={{ color: PRIMARY }} />
                <MapLink address={data.address} className="text-[#1c1917] font-semibold" />
              </div>
              <p className="text-[#6b7280] text-sm mt-2">&amp; Surrounding Communities</p>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* ══════════════════ 11. HOURS ══════════════════ */}
      {data.hours && (
        <section className="relative z-10 py-24 md:py-32 overflow-hidden">
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #f7faf8 0%, #111512 50%, #f7faf8 100%)" }} />
          <HeartbeatLine opacity={0.02} accent={PRIMARY} />
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-[20%] left-[15%] w-[400px] h-[400px] rounded-full blur-[160px]" style={{ background: `${PRIMARY}06` }} />
          </div>

          <div className="max-w-3xl mx-auto px-6 relative z-10">
            <AnimatedSection>          <SectionHeader badge="Clinic Hours" title="When We&apos;re Open" accent={PRIMARY} /></AnimatedSection>
            <div className="text-center">
              <ShimmerBorder accent={PRIMARY}>
                <div className="p-8">
                  <Clock size={32} weight="duotone" style={{ color: PRIMARY }} className="mx-auto mb-4" />
                  <p className="text-[#4b5563] leading-relaxed whitespace-pre-line text-lg">{data.hours}</p>
                  <p className="text-sm mt-4 font-semibold" style={{ color: WARM_ROSE }}>Urgent care available during business hours</p>
                </div>
              </ShimmerBorder>
            </div>
          </div>
        </section>
      )}

      
      {/* ══════════════════ MID-PAGE CTA ══════════════════ */}
      <section className="relative z-10 py-12 sm:py-16 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${ACCENT}15, ${ACCENT}08)` }} />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: ACCENT }}>
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
            style={{ background: ACCENT }}
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
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #f7faf8 0%, #111512 50%, #f7faf8 100%)" }} />
        <HeartbeatLine opacity={0.02} accent={PRIMARY} />
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
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #f7faf8 0%, #0b120e 50%, #f7faf8 100%)" }} />
        <PawPattern opacity={0.02} accent={PRIMARY} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] rounded-full blur-[180px]" style={{ background: `${PRIMARY}06` }} />
        </div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: PRIMARY, borderColor: `${PRIMARY}33`, background: `${PRIMARY}0d` }}>Contact Us</span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6 text-[#1c1917]">Book Your Pet&apos;s Visit</h2>
              <p className="text-[#6b7280] leading-relaxed mb-8">
                Ready to give your pet the best care? Contact {data.businessName} today. New patients and furry friends of all kinds are welcome.
              </p>
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: PRIMARY_GLOW }}>
                    <MapPin size={20} weight="duotone" style={{ color: PRIMARY }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#1c1917]">Address</p>
                    <MapLink address={data.address} className="text-sm text-[#6b7280]" />
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: PRIMARY_GLOW }}>
                    <Phone size={20} weight="duotone" style={{ color: PRIMARY }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#1c1917]">Phone</p>
                    <PhoneLink phone={data.phone} className="text-sm text-[#6b7280]" />
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: PRIMARY_GLOW }}>
                    <PawPrint size={20} weight="duotone" style={{ color: PRIMARY }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#1c1917]">New Patients</p>
                    <p className="text-sm text-[#6b7280]">Always accepting new furry patients</p>
                  </div>
                </div>
                {data.hours && (
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: PRIMARY_GLOW }}>
                      <Clock size={20} weight="duotone" style={{ color: PRIMARY }} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#1c1917]">Hours</p>
                      <p className="text-sm text-[#6b7280] whitespace-pre-line">{data.hours}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <GlassCard className="p-8">
              <h3 className="text-xl font-semibold text-[#1c1917] mb-6">Request an Appointment</h3>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-[#6b7280] mb-1.5">Your Name</label>
                    <input type="text" className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-[#1c1917] placeholder-gray-400 focus:outline-none transition-colors text-sm" placeholder="Jane Smith" />
                  </div>
                  <div>
                    <label className="block text-sm text-[#6b7280] mb-1.5">Pet&apos;s Name</label>
                    <input type="text" className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-[#1c1917] placeholder-gray-400 focus:outline-none transition-colors text-sm" placeholder="Buddy" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-[#6b7280] mb-1.5">Phone</label>
                  <input type="tel" className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-[#1c1917] placeholder-gray-400 focus:outline-none transition-colors text-sm" placeholder="(555) 123-4567" />
                </div>
                <div>
                  <label className="block text-sm text-[#6b7280] mb-1.5">Service Needed</label>
                  <select className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-[#1c1917] focus:outline-none transition-colors text-sm">
                    <option value="" className="bg-white">Select a service</option>
                    {data.services.map((s) => (
                      <option key={s.name} value={s.name.toLowerCase().replace(/\s+/g, "-")} className="bg-white">{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-[#6b7280] mb-1.5">Message</label>
                  <textarea rows={4} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-[#1c1917] placeholder-gray-400 focus:outline-none transition-colors text-sm resize-none" placeholder="Tell us about your pet's needs..." />
                </div>
                <MagneticButton className="w-full py-4 rounded-xl text-base font-semibold text-[#1c1917] flex items-center justify-center gap-2 cursor-pointer" style={{ background: PRIMARY } as React.CSSProperties}>
                  Request Appointment
                  <ArrowRight size={18} weight="bold" />
                </MagneticButton>
              </form>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* ══════════════════ 14. GUARANTEE ══════════════════ */}
      <section className="relative z-10 py-16 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #f7faf8 0%, #111512 100%)" }} />
        <PawPattern opacity={0.015} accent={PRIMARY} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full blur-[180px]" style={{ background: `${PRIMARY}06` }} />
        </div>

        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <ShimmerBorder accent={PRIMARY}>
            <div className="p-8 md:p-12">
              <ShieldCheck size={48} weight="fill" style={{ color: PRIMARY }} className="mx-auto mb-4" />
              <h2 className="text-2xl md:text-4xl font-extrabold text-[#1c1917] mb-4">Our Promise to You &amp; Your Pet</h2>
              <p className="text-[#6b7280] leading-relaxed max-w-2xl mx-auto text-lg">
                At {data.businessName}, we treat every pet like our own. Our experienced veterinary team uses the latest technology and gentle techniques to provide the highest standard of care.
              </p>
              <div className="flex flex-wrap justify-center gap-4 mt-8">
                {["Licensed Veterinarians", "Modern Facilities", "Compassionate Staff", "Affordable Care"].map((item) => (
                  <span key={item} className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border" style={{ color: PRIMARY, borderColor: `${PRIMARY}33`, background: `${PRIMARY}0d` }}>
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
      <footer className="relative z-10 border-t border-gray-100 py-10 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #f7faf8 0%, #f0f7f2 100%)" }} />
        <PawPattern opacity={0.015} accent={PRIMARY} />
        <div className="mx-auto max-w-6xl px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <PawPrint size={22} weight="fill" style={{ color: PRIMARY }} />
                <span className="text-lg font-bold text-[#1c1917]">{data.businessName}</span>
              </div>
              <p className="text-sm text-[#9ca3af] leading-relaxed">{data.about.length > 120 ? data.about.slice(0, 120).trim() + "..." : data.about}</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[#1c1917] mb-3">Quick Links</h4>
              <div className="space-y-2">
                {["Services", "About", "Gallery", "Contact"].map((link) => (
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
              <PawPrint size={14} weight="fill" style={{ color: PRIMARY }} />
              <span>{data.businessName} &copy; {new Date().getFullYear()}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#6b7280]">
              <BluejayLogo className="w-4 h-4" />
              <span>Created by <a href="https://bluejayportfolio.com" target="_blank" rel="noopener noreferrer" style={{textDecoration:"underline"}}>bluejayportfolio.com</a></span>
            </div>
          </div>
        </div>
      </footer>

      <ClaimBanner businessName={data.businessName} accentColor={PRIMARY} prospectId={data.id} />
      <div className="h-28" />
    </main>
  );
}
