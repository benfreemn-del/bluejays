"use client";

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
  Drop,
  House,
  CaretDown,
  Phone,
  MapPin,
  Clock,
  ArrowRight,
  CheckCircle,
  Quotes,
  X,
  List,
  CarSimple,
  Tree,
  Buildings,
  Truck,
  Umbrella,
  CalendarCheck,
  Leaf,
  Sun,
  Snowflake,
  CloudRain,
  Certificate,
  Users,
  Timer,
  Medal,
} from "@phosphor-icons/react";

/* ───────────────────────── SPRING CONFIG ───────────────────────── */
const spring = { type: "spring" as const, stiffness: 100, damping: 20 };
const springFast = { type: "spring" as const, stiffness: 200, damping: 25 };
const springGentle = { type: "spring" as const, stiffness: 60, damping: 18 };

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: spring },
};

/* ───────────────────────── COLORS ───────────────────────── */
const BG = "#0a1520";
const ACCENT = "#0284c7";
const ACCENT_LIGHT = "#38bdf8";
const ACCENT_GLOW = "rgba(2, 132, 199, 0.15)";

/* ───────────────────────── WATER MIST PARTICLES ───────────────────────── */
function WaterMistParticles() {
  const particles = Array.from({ length: 28 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 8,
    duration: 5 + Math.random() * 5,
    size: 2 + Math.random() * 4,
    opacity: 0.1 + Math.random() * 0.3,
    drift: -30 + Math.random() * 60,
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
            background: ACCENT_LIGHT,
            filter: "blur(1px)",
            willChange: "transform, opacity",
          }}
          animate={{
            y: ["-5vh", "110vh"],
            x: [0, p.drift],
            opacity: [0, p.opacity, p.opacity, 0],
          }}
          transition={{
            y: { duration: p.duration, repeat: Infinity, delay: p.delay, ease: "linear" },
            x: { duration: p.duration, repeat: Infinity, delay: p.delay, ease: "easeInOut" },
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

/* ───────────────────────── WATER SPRAY SVG ───────────────────────── */
function WaterSprayIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path d="M8 28L8 14C8 14 12 8 16 6C20 8 24 14 24 14L24 28" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="3" r="1.5" fill={ACCENT_LIGHT} opacity="0.7" />
      <circle cx="16" cy="1.5" r="1.5" fill={ACCENT_LIGHT} />
      <circle cx="20" cy="3" r="1.5" fill={ACCENT_LIGHT} opacity="0.7" />
      <circle cx="10" cy="5" r="1" fill={ACCENT_LIGHT} opacity="0.5" />
      <circle cx="22" cy="5" r="1" fill={ACCENT_LIGHT} opacity="0.5" />
      <line x1="16" y1="14" x2="16" y2="28" stroke={ACCENT} strokeWidth="1.5" opacity="0.3" />
    </svg>
  );
}

/* ───────────────────────── WORD REVEAL ───────────────────────── */
function WordReveal({ text, className = "" }: { text: string; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const words = text.split(" ");

  return (
    <motion.span
      ref={ref}
      className={`inline-flex flex-wrap gap-x-3 ${className}`}
      variants={stagger}
      initial="hidden"
      animate={isInView ? "show" : "hidden"}
    >
      {words.map((word, i) => (
        <motion.span key={i} variants={fadeUp} className="inline-block">
          {word}
        </motion.span>
      ))}
    </motion.span>
  );
}

/* ───────────────────────── SECTION REVEAL ───────────────────────── */
function SectionReveal({
  children,
  className = "",
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.section
      ref={ref}
      id={id}
      className={className}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={spring}
    >
      {children}
    </motion.section>
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

/* ───────────────────────── SHIMMER BORDER ───────────────────────── */
function ShimmerBorder({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative rounded-2xl p-[1px] overflow-hidden ${className}`}>
      <motion.div
        className="absolute inset-0 rounded-2xl"
        style={{
          background: `conic-gradient(from 0deg, transparent, ${ACCENT}, transparent, ${ACCENT_LIGHT}, transparent)`,
          willChange: "transform",
        }}
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      />
      <div className="relative rounded-2xl z-10" style={{ background: BG }}>{children}</div>
    </div>
  );
}

/* ───────────────────────── ACCORDION ITEM ───────────────────────── */
function AccordionItem({
  title,
  description,
  icon: Icon,
  isOpen,
  onToggle,
}: {
  title: string;
  description: string;
  icon: React.ElementType;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <GlassCard className="overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-5 md:p-6 text-left group cursor-pointer"
      >
        <div className="flex items-center gap-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: ACCENT_GLOW }}
          >
            <Icon size={20} weight="duotone" style={{ color: ACCENT }} />
          </div>
          <span className="text-lg font-semibold text-white">{title}</span>
        </div>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={spring}>
          <CaretDown size={20} className="text-slate-400" />
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
            <p className="px-5 pb-5 md:px-6 md:pb-6 text-slate-400 leading-relaxed pl-[4.5rem]">
              {description}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
}

/* ───────────────────────── BEFORE/AFTER SLIDER ───────────────────────── */
function BeforeAfterSlider({ beforeImg, afterImg, beforeLabel = "Before", afterLabel = "After" }: { beforeImg: string; afterImg: string; beforeLabel?: string; afterLabel?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [sliderPos, setSliderPos] = useState(50);
  const isDragging = useRef(false);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current || !isDragging.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pos = ((clientX - rect.left) / rect.width) * 100;
    setSliderPos(Math.max(5, Math.min(95, pos)));
  }, []);

  const handleMouseDown = useCallback(() => { isDragging.current = true; }, []);

  useEffect(() => {
    const handleUp = () => { isDragging.current = false; };
    const handleMoveGlobal = (e: MouseEvent) => handleMove(e.clientX);
    const handleTouchMove = (e: TouchEvent) => { if (e.touches[0]) handleMove(e.touches[0].clientX); };
    window.addEventListener("mouseup", handleUp);
    window.addEventListener("mousemove", handleMoveGlobal);
    window.addEventListener("touchend", handleUp);
    window.addEventListener("touchmove", handleTouchMove);
    return () => {
      window.removeEventListener("mouseup", handleUp);
      window.removeEventListener("mousemove", handleMoveGlobal);
      window.removeEventListener("touchend", handleUp);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, [handleMove]);

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden cursor-ew-resize select-none"
      onMouseDown={handleMouseDown}
      onTouchStart={handleMouseDown}
    >
      <div className="absolute inset-0">
        <img src={afterImg} alt={afterLabel} className="w-full h-full object-cover object-center" />
        <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-full backdrop-blur-sm text-white text-sm font-bold" style={{ background: `${ACCENT}cc` }}>{afterLabel}</div>
      </div>
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}>
        <img src={beforeImg} alt={beforeLabel} className="w-full h-full object-cover object-center" />
        <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-full bg-slate-700/80 backdrop-blur-sm text-white text-sm font-bold">{beforeLabel}</div>
      </div>
      <div className="absolute top-0 bottom-0 w-[2px] bg-white/80 z-10" style={{ left: `${sliderPos}%` }}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center">
          <div className="flex gap-0.5">
            <CaretDown size={12} className="text-slate-800 -rotate-90" />
            <CaretDown size={12} className="text-slate-800 rotate-90" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── WAVE BG ───────────────────────── */
function WaveBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
      <motion.svg viewBox="0 0 1440 320" className="absolute bottom-0 w-full" preserveAspectRatio="none">
        <motion.path
          fill={ACCENT}
          fillOpacity="0.3"
          animate={{
            d: [
              "M0,224L48,213.3C96,203,192,181,288,186.7C384,192,480,224,576,229.3C672,235,768,213,864,197.3C960,181,1056,171,1152,181.3C1248,192,1344,224,1392,240L1440,256L1440,320L0,320Z",
              "M0,256L48,240C96,224,192,192,288,192C384,192,480,224,576,234.7C672,245,768,235,864,218.7C960,203,1056,181,1152,186.7C1248,192,1344,224,1392,240L1440,256L1440,320L0,320Z",
              "M0,224L48,213.3C96,203,192,181,288,186.7C384,192,480,224,576,229.3C672,235,768,213,864,197.3C960,181,1056,171,1152,181.3C1248,192,1344,224,1392,240L1440,256L1440,320L0,320Z",
            ],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.svg>
    </div>
  );
}

/* ───────────────────────── FAQ DATA ───────────────────────── */
const faqData = [
  { q: "How often should I pressure wash my house?", a: "We recommend a full exterior wash once a year to prevent mold, mildew, and algae buildup. High-traffic areas like driveways may benefit from bi-annual cleaning." },
  { q: "Will pressure washing damage my siding?", a: "No. We use soft-wash techniques for delicate surfaces like vinyl and wood siding, adjusting PSI and using biodegradable detergents to protect your home while delivering a deep clean." },
  { q: "Do you provide free estimates?", a: "Absolutely. We offer free on-site estimates for all residential and commercial projects. We will assess the surfaces, square footage, and recommend the best approach." },
  { q: "Is pressure washing safe for my roof?", a: "Yes. We use a specialized soft-wash method for roofs that removes algae and moss without damaging shingles. High-pressure is never applied directly to roofing materials." },
  { q: "How long does a typical job take?", a: "Most residential jobs are completed in 2-4 hours. Larger commercial properties may take a full day. We always provide a time estimate before starting." },
  { q: "Are your cleaning solutions eco-friendly?", a: "Yes. All our detergents are 100% biodegradable and safe for plants, pets, and waterways. We follow EPA guidelines for responsible wastewater management." },
];

/* ───────────────────────── SERVICES DATA ───────────────────────── */
const services = [
  { title: "House Washing", description: "Complete exterior soft-wash for siding, brick, stucco, and stone. We remove years of grime, mold, and mildew to restore your home's curb appeal without damaging delicate surfaces.", icon: House },
  { title: "Driveway & Walkway", description: "High-pressure surface cleaning for concrete, pavers, and asphalt. We eliminate oil stains, tire marks, and embedded dirt to make your driveway look brand new.", icon: CarSimple },
  { title: "Deck & Patio", description: "Gentle yet effective cleaning for wood, composite, and stone decks. We prep surfaces for staining or sealing and remove slippery algae for safer outdoor spaces.", icon: Tree },
  { title: "Roof Cleaning", description: "Soft-wash roof treatment to remove black streaks, algae, and moss. Our method extends shingle life and restores your roof's appearance without voiding warranties.", icon: Umbrella },
  { title: "Commercial Properties", description: "Storefront, parking lot, and building exterior cleaning for businesses. We work after hours to minimize disruption and help you maintain a professional image.", icon: Buildings },
  { title: "Fleet Washing", description: "On-site vehicle fleet cleaning for trucks, vans, and heavy equipment. Regular washing protects your fleet's finish and keeps your brand looking sharp on the road.", icon: Truck },
];

/* ───────────────────────── TESTIMONIALS ───────────────────────── */
const testimonials = [
  { name: "Robert M.", text: "Our house looks like we just painted it. The team was professional, on time, and the results were incredible. Best investment we have made for our curb appeal.", rating: 5 },
  { name: "Jennifer L.", text: "They transformed our grimy driveway into something we are actually proud of. The before and after was night and day. Highly recommend their services.", rating: 5 },
  { name: "Tom & Karen S.", text: "We have used them three years running for our spring cleaning. Consistent quality every single time. The deck looks amazing and the kids can play on it safely.", rating: 5 },
];

/* ───────────────────────── SEASONAL PACKAGES ───────────────────────── */
const packages = [
  { season: "Spring Revival", icon: Leaf, price: "$299", desc: "House wash + driveway + walkways. Kick off the season with a fresh exterior.", color: "#22c55e" },
  { season: "Summer Shine", icon: Sun, price: "$349", desc: "Full exterior + deck/patio cleaning. Get ready for outdoor entertaining.", color: "#eab308" },
  { season: "Fall Prep", icon: CloudRain, price: "$279", desc: "Gutter brightening + roof soft-wash. Protect your home before winter.", color: "#f97316" },
  { season: "Winter Guard", icon: Snowflake, price: "$199", desc: "Concrete sealing + spot treatment. Prevent freeze-thaw damage all season.", color: "#38bdf8" },
];

/* ───────────────────────── BEFORE/AFTER DATA ───────────────────────── */
const galleryItems = [
  {
    before: "https://images.unsplash.com/photo-1603796846097-bee99e4a601f?w=800&q=80",
    after: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&q=80",
    label: "House Exterior",
  },
  {
    before: "https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=800&q=80",
    after: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&q=80",
    label: "Driveway Clean",
  },
];

/* ═══════════════════════════════════════════════════════════════════
   MAIN PAGE COMPONENT
   ═══════════════════════════════════════════════════════════════════ */
export default function V2PressureWashingPage() {
  const [openService, setOpenService] = useState<number | null>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activeGallery, setActiveGallery] = useState(0);

  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden" style={{ background: BG, color: "#f1f5f9" }}>
      <WaterMistParticles />

      {/* ─── NAV ─── */}
      <motion.nav initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-4">
          <GlassCard className="flex items-center justify-between px-4 md:px-6 py-3">
            <div className="flex items-center gap-2">
              <WaterSprayIcon size={24} />
              <span className="text-lg font-bold tracking-tight text-white">AquaForce</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
              <a href="#services" className="hover:text-white transition-colors">Services</a>
              <a href="#gallery" className="hover:text-white transition-colors">Gallery</a>
              <a href="#about" className="hover:text-white transition-colors">About</a>
              <a href="#testimonials" className="hover:text-white transition-colors">Reviews</a>
            </div>
            <div className="flex items-center gap-3">
              <MagneticButton className="px-4 md:px-5 py-2 rounded-full text-sm font-semibold text-white transition-colors" style={{ background: ACCENT } as React.CSSProperties}>
                Free Estimate
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
                  {[{ label: "Services", href: "#services" }, { label: "Gallery", href: "#gallery" }, { label: "About", href: "#about" }, { label: "Reviews", href: "#testimonials" }].map((link) => (
                    <a key={link.label} href={link.href} onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors">
                      {link.label}
                    </a>
                  ))}
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.nav>

      {/* ─── 1. HERO ─── */}
      <section className="relative min-h-[100dvh] flex items-center pt-24 z-10">
        {/* Background image overlay */}
        <div className="absolute inset-0 z-0">
          <img src="https://images.unsplash.com/photo-1528740561666-dc2479dc08ab?w=1600&q=80" alt="" className="w-full h-full object-cover object-center" />
          <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${BG}ee 0%, ${BG}cc 50%, ${BG}99 100%)` }} />
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div>
              <motion.p initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ ...spring, delay: 0.1 }} className="text-sm uppercase tracking-widest mb-4" style={{ color: ACCENT }}>
                Professional Pressure Washing
              </motion.p>
              <h1 className="text-3xl md:text-6xl tracking-tighter leading-none font-bold text-white" style={{ textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>
                <WordReveal text="Restore Your Property's Brilliance" />
              </h1>
            </div>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.6 }} className="text-lg text-slate-300 max-w-md leading-relaxed">
              From grimy driveways to weathered siding, we blast away years of buildup and reveal the clean, beautiful surfaces underneath. Residential and commercial.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.8 }} className="flex flex-wrap gap-4">
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white flex items-center gap-2 cursor-pointer" style={{ background: ACCENT } as React.CSSProperties}>
                Get Free Estimate <ArrowRight size={18} weight="bold" />
              </MagneticButton>
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/10 flex items-center gap-2 cursor-pointer">
                <Phone size={18} weight="duotone" /> (555) 876-3200
              </MagneticButton>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ ...spring, delay: 1 }} className="flex flex-wrap gap-6 text-sm text-slate-400">
              <span className="flex items-center gap-2"><MapPin size={16} weight="duotone" style={{ color: ACCENT }} />Serving Metro &amp; Surrounding Areas</span>
              <span className="flex items-center gap-2"><Clock size={16} weight="duotone" style={{ color: ACCENT }} />Mon-Sat 7am-6pm</span>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ ...spring, delay: 0.3 }} className="hidden lg:flex items-center justify-center">
            <div className="relative">
              <motion.div className="absolute inset-0 rounded-full" style={{ background: `radial-gradient(circle, ${ACCENT_GLOW} 0%, transparent 70%)`, filter: "blur(40px)" }} animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} />
              <Drop size={200} weight="duotone" style={{ color: ACCENT }} className="relative z-10" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── 2. STATS / TRUST INDICATORS ─── */}
      <SectionReveal className="relative z-10 pb-8">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <GlassCard className="p-6 md:p-8">
            <motion.div className="grid grid-cols-2 sm:grid-cols-4 gap-6 md:gap-8" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
              {[
                { icon: Star, label: "4.9 Star Rating", desc: "500+ happy customers" },
                { icon: Timer, label: "Same-Week Service", desc: "Fast turnaround times" },
                { icon: Certificate, label: "Fully Insured", desc: "Licensed & bonded" },
                { icon: Medal, label: "10+ Years", desc: "Industry experience" },
              ].map((stat, i) => (
                <motion.div key={i} variants={fadeUp} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: ACCENT_GLOW }}>
                    <stat.icon size={20} weight="duotone" style={{ color: ACCENT }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{stat.label}</p>
                    <p className="text-xs text-slate-400">{stat.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </GlassCard>
        </div>
      </SectionReveal>

      {/* ─── 3. SERVICES ACCORDION ─── */}
      <SectionReveal id="services" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            <div className="lg:sticky lg:top-32">
              <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ACCENT }}>Our Services</p>
              <h2 className="text-3xl md:text-6xl tracking-tighter leading-none font-bold text-white mb-6">
                <WordReveal text="Complete Power Washing Solutions" />
              </h2>
              <p className="text-slate-400 leading-relaxed max-w-md">
                Whether it is your home, business, or fleet, we have the equipment, expertise, and eco-friendly solutions to handle any job. Click a service to learn more.
              </p>
            </div>
            <motion.div className="space-y-3" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
              {services.map((svc, i) => (
                <motion.div key={i} variants={fadeUp}>
                  <AccordionItem title={svc.title} description={svc.description} icon={svc.icon} isOpen={openService === i} onToggle={() => setOpenService(openService === i ? null : i)} />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </SectionReveal>

      {/* ─── 4. BEFORE / AFTER GALLERY ─── */}
      <SectionReveal id="gallery" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ACCENT }}>Results Gallery</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white mb-4">
              <WordReveal text="See the Transformation" />
            </h2>
            <div className="flex justify-center gap-3 mt-6">
              {galleryItems.map((item, i) => (
                <button key={i} onClick={() => setActiveGallery(i)} className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeGallery === i ? "text-white" : "text-slate-400 hover:text-white"}`} style={activeGallery === i ? { background: ACCENT } : { background: "rgba(255,255,255,0.05)" }}>
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          <div className="max-w-3xl mx-auto">
            <BeforeAfterSlider beforeImg={galleryItems[activeGallery].before} afterImg={galleryItems[activeGallery].after} />
          </div>
          <div className="flex items-center justify-center gap-3 text-sm text-slate-400 mt-6">
            <CheckCircle size={18} weight="duotone" style={{ color: ACCENT }} />
            <span>Real results from actual client properties</span>
          </div>
        </div>
      </SectionReveal>

      {/* ─── 5. ABOUT ─── */}
      <SectionReveal id="about" className="relative z-10 py-16 md:py-24 overflow-hidden">
        <WaveBackground />
        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ACCENT }}>About AquaForce</p>
              <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white mb-6">
                <WordReveal text="Clean Is What We Do" />
              </h2>
              <p className="text-slate-400 leading-relaxed mb-6">
                Founded over a decade ago, AquaForce has grown from a one-truck operation to the region&apos;s most trusted pressure washing company. We invest in commercial-grade equipment, ongoing training, and eco-friendly products because your property deserves the best.
              </p>
              <p className="text-slate-400 leading-relaxed">
                Every job is backed by our satisfaction guarantee. If you are not thrilled with the results, we come back and make it right — no questions asked.
              </p>
            </div>
            <motion.div className="grid grid-cols-2 gap-4" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
              {[
                { icon: ShieldCheck, label: "Satisfaction Guaranteed", desc: "100% or we redo it" },
                { icon: Drop, label: "Eco-Friendly", desc: "Biodegradable solutions" },
                { icon: Users, label: "Expert Crew", desc: "Trained & certified" },
                { icon: Certificate, label: "Fully Licensed", desc: "Insured & bonded" },
              ].map((item, i) => (
                <motion.div key={i} variants={fadeUp}>
                  <GlassCard className="p-5 text-center">
                    <item.icon size={28} weight="duotone" style={{ color: ACCENT }} className="mx-auto mb-2" />
                    <p className="text-sm font-semibold text-white">{item.label}</p>
                    <p className="text-xs text-slate-400 mt-1">{item.desc}</p>
                  </GlassCard>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </SectionReveal>

      {/* ─── 6. PROCESS ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ACCENT }}>How It Works</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Our Simple Process" />
            </h2>
          </div>
          <motion.div className="grid grid-cols-1 md:grid-cols-4 gap-6" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {[
              { step: "01", title: "Free Estimate", desc: "We visit your property, assess the surfaces, and provide a detailed no-obligation quote." },
              { step: "02", title: "Prep & Protect", desc: "We cover plants, tape off sensitive areas, and set up our commercial-grade equipment." },
              { step: "03", title: "Deep Clean", desc: "Using the right PSI and eco-friendly detergents, we clean every surface to perfection." },
              { step: "04", title: "Final Walkthrough", desc: "We do a thorough inspection with you to ensure every inch meets our high standards." },
            ].map((item, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="p-6 h-full relative overflow-hidden">
                  <span className="text-5xl font-black absolute top-3 right-4 opacity-5 text-white">{item.step}</span>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold mb-4" style={{ background: ACCENT, color: "white" }}>{item.step}</div>
                  <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── 7. TESTIMONIALS ─── */}
      <SectionReveal id="testimonials" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ACCENT }}>Customer Stories</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Trusted by Homeowners" />
            </h2>
          </div>
          <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {testimonials.map((t, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="p-6 h-full flex flex-col">
                  <Quotes size={28} weight="fill" style={{ color: ACCENT }} className="mb-3 opacity-50" />
                  <p className="text-slate-300 leading-relaxed flex-1 text-sm">{t.text}</p>
                  <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                    <span className="text-sm font-semibold text-white">{t.name}</span>
                    <div className="flex gap-0.5">
                      {Array.from({ length: t.rating }).map((_, j) => (
                        <Star key={j} size={12} weight="fill" style={{ color: ACCENT }} />
                      ))}
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── 8. SEASONAL PACKAGES ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ACCENT }}>Year-Round Care</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Seasonal Packages" />
            </h2>
          </div>
          <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {packages.map((pkg, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="p-6 h-full flex flex-col text-center">
                  <pkg.icon size={36} weight="duotone" style={{ color: pkg.color }} className="mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-white mb-1">{pkg.season}</h3>
                  <p className="text-3xl font-bold tracking-tight mb-3" style={{ color: ACCENT }}>{pkg.price}</p>
                  <p className="text-sm text-slate-400 leading-relaxed flex-1">{pkg.desc}</p>
                  <MagneticButton className="mt-4 px-6 py-2.5 rounded-full text-sm font-semibold text-white w-full cursor-pointer" style={{ background: ACCENT } as React.CSSProperties}>
                    Book Now
                  </MagneticButton>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── 9. FAQ ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ACCENT }}>Common Questions</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Frequently Asked Questions" />
            </h2>
          </div>
          <motion.div className="space-y-3" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {faqData.map((item, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="overflow-hidden">
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-5 text-left cursor-pointer">
                    <span className="text-sm md:text-base font-semibold text-white pr-4">{item.q}</span>
                    <motion.div animate={{ rotate: openFaq === i ? 180 : 0 }} transition={spring}>
                      <CaretDown size={18} className="text-slate-400 shrink-0" />
                    </motion.div>
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

      {/* ─── 10. FREE ESTIMATE CTA ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4 md:px-6">
          <ShimmerBorder>
            <div className="p-8 md:p-12 text-center">
              <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={spring}>
                <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ACCENT }}>No Obligation</p>
                <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white mb-4">Free On-Site Estimate</h2>
                <p className="text-slate-400 text-lg mb-6 max-w-lg mx-auto">
                  We will visit your property, assess every surface, and provide a detailed quote — completely free. No pressure, just clean results.
                </p>
                <MagneticButton className="px-10 py-4 rounded-full text-base font-semibold text-white inline-flex items-center gap-2 cursor-pointer" style={{ background: ACCENT } as React.CSSProperties}>
                  <CalendarCheck size={20} weight="duotone" /> Schedule Estimate
                </MagneticButton>
              </motion.div>
            </div>
          </ShimmerBorder>
        </div>
      </SectionReveal>

      {/* ─── 11. CONTACT ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white mb-6">
                <WordReveal text="Ready for a Cleaner Property?" />
              </h2>
              <p className="text-slate-400 leading-relaxed max-w-md mb-8">
                Call us today or request your free estimate online. We are ready to transform your home or business exterior.
              </p>
              <div className="flex flex-wrap gap-4">
                <MagneticButton className="px-10 py-4 rounded-full text-base font-semibold text-white inline-flex items-center gap-2 cursor-pointer" style={{ background: ACCENT } as React.CSSProperties}>
                  <CalendarCheck size={20} weight="duotone" /> Get Estimate
                </MagneticButton>
                <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/10 flex items-center gap-2 cursor-pointer">
                  <Phone size={18} weight="duotone" /> Call Us
                </MagneticButton>
              </div>
            </div>
            <GlassCard className="p-8">
              <h3 className="text-xl font-semibold text-white mb-6">Get in Touch</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <MapPin size={20} weight="duotone" style={{ color: ACCENT }} className="mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-white">Service Area</p>
                    <p className="text-sm text-slate-400">Greater Metro Area<br />Up to 50 miles out</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Phone size={20} weight="duotone" style={{ color: ACCENT }} className="mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-white">Phone</p>
                    <p className="text-sm text-slate-400">(555) 876-3200</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Clock size={20} weight="duotone" style={{ color: ACCENT }} className="mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-white">Hours</p>
                    <p className="text-sm text-slate-400">Monday - Saturday: 7:00 AM - 6:00 PM<br />Sunday: Closed</p>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </SectionReveal>

      {/* ─── 12. FOOTER ─── */}
      <footer className="relative z-10 border-t border-white/5 py-8">
        <div className="mx-auto max-w-7xl px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Drop size={16} weight="duotone" style={{ color: ACCENT }} />
            <span>AquaForce Pressure Washing &copy; {new Date().getFullYear()}</span>
          </div>
          <p className="text-xs text-slate-600">Website created by Bluejay Business Solutions</p>
        </div>
      </footer>
    </main>
  );
}
