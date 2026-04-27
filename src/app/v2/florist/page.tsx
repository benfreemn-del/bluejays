"use client";

/* eslint-disable @next/next/no-img-element -- These static marketing and preview components intentionally use plain img tags to preserve existing markup and visual behavior during lint-only cleanup. */
/* eslint-disable react-hooks/purity -- Decorative particle values are intentionally randomized for static visual effects in these marketing pages and previews; this preserves existing appearance without changing business logic. */

import { useState, useRef, useCallback } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useInView,
  AnimatePresence,
} from "framer-motion";
import {
  Star,
  Flower,
  FlowerLotus,
  FlowerTulip,
  CaretDown,
  Phone,
  MapPin,
  Clock,
  ArrowRight,
  CheckCircle,
  Quotes,
  X,
  List,
  CalendarCheck,
  Heart,
  Sparkle,
  Gift,
  Truck,
  ShieldCheck,
  Leaf,
  Palette,
  Crown,
  Buildings,
  CalendarBlank,
  SunHorizon,
  Snowflake,
  ThermometerHot,
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
const BG = "#fdf9f7";
const ROSE = "#e11d48";
const ROSE_LIGHT = "#fb7185";
const ROSE_GLOW = "rgba(225, 29, 72, 0.12)";
const SAGE = "#65a30d";
const SAGE_GLOW = "rgba(101, 163, 13, 0.1)";

/* ───────────────────────── FLOATING PETAL PARTICLES ───────────────────────── */
function FloatingPetals() {
  const petals = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 10,
    duration: 8 + Math.random() * 8,
    size: 4 + Math.random() * 6,
    opacity: 0.1 + Math.random() * 0.2,
    rotation: Math.random() * 360,
    isRose: Math.random() > 0.4,
  }));
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden hidden md:block">
      {petals.map((p) => (
        <motion.div
          key={p.id}
          className="absolute"
          style={{
            left: `${p.x}%`,
            width: p.size,
            height: p.size * 0.7,
            borderRadius: "50% 50% 50% 0%",
            background: p.isRose ? ROSE_LIGHT : SAGE,
            willChange: "transform, opacity",
          }}
          animate={{
            y: ["-10vh", "110vh"],
            opacity: [0, p.opacity, p.opacity, 0],
            rotate: [p.rotation, p.rotation + 360],
            x: [0, Math.sin(p.id) * 30, 0],
          }}
          transition={{
            y: { duration: p.duration, repeat: Infinity, delay: p.delay, ease: "linear" },
            opacity: { duration: p.duration, repeat: Infinity, delay: p.delay, times: [0, 0.1, 0.9, 1] },
            rotate: { duration: p.duration * 1.5, repeat: Infinity, delay: p.delay, ease: "linear" },
            x: { duration: p.duration / 2, repeat: Infinity, delay: p.delay, ease: "easeInOut" },
          }}
        />
      ))}
    </div>
  );
}

/* ───────────────────────── UTILITY COMPONENTS ───────────────────────── */
function SectionReveal({ children, className = "", id }: { children: React.ReactNode; className?: string; id?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return <motion.section ref={ref} id={id} className={className} initial={{ opacity: 0, y: 50 }} animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }} transition={spring}>{children}</motion.section>;
}

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-gray-200 bg-white/70 backdrop-blur-xl shadow-sm ${className}`}>{children}</div>;
}

function MagneticButton({ children, className = "", onClick, style }: { children: React.ReactNode; className?: string; onClick?: () => void; style?: React.CSSProperties }) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, springFast);
  const springY = useSpring(y, springFast);
  const isTouchDevice = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
  const handleMouseMove = useCallback((e: React.MouseEvent) => { if (!ref.current || isTouchDevice) return; const rect = ref.current.getBoundingClientRect(); x.set((e.clientX - (rect.left + rect.width / 2)) * 0.25); y.set((e.clientY - (rect.top + rect.height / 2)) * 0.25); }, [x, y, isTouchDevice]);
  const handleMouseLeave = useCallback(() => { x.set(0); y.set(0); }, [x, y]);
  return <motion.button ref={ref} style={{ x: springX, y: springY, willChange: "transform", ...style }} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} onClick={onClick} className={className} whileTap={{ scale: 0.97 }}>{children}</motion.button>;
}

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

function ShimmerBorder({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative rounded-2xl p-[1px] overflow-hidden ${className}`}>
      <motion.div className="absolute inset-0 rounded-2xl" style={{ background: `conic-gradient(from 0deg, transparent, ${ROSE}, transparent, ${SAGE}, transparent)`, willChange: "transform" }} animate={{ rotate: [0, 360] }} transition={{ duration: 5, repeat: Infinity, ease: "linear" }} />
      <div className="relative rounded-2xl bg-white z-10">{children}</div>
    </div>
  );
}

/* ───────────────────────── FLOWER HERO SVG ───────────────────────── */
function FlowerHeroIcon() {
  return (
    <div className="relative flex items-center justify-center">
      {/* Pulsing glow behind */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{ background: `radial-gradient(circle, ${ROSE_GLOW} 0%, transparent 70%)`, filter: "blur(40px)" }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      <svg viewBox="0 0 200 220" className="relative z-10 w-52 h-60 md:w-64 md:h-72" fill="none">
        {/* Outer glow rings */}
        <motion.circle cx="100" cy="100" r="90" stroke={ROSE} strokeWidth="0.5" opacity={0.12}
          animate={{ r: [88, 92, 88] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} />
        <motion.circle cx="100" cy="100" r="80" stroke={ROSE} strokeWidth="0.3" opacity={0.08}
          animate={{ r: [78, 82, 78] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }} />

        {/* Outer petals — filled with gradient */}
        {[0, 60, 120, 180, 240, 300].map((angle, i) => (
          <motion.ellipse key={`outer-${i}`} cx="100" cy="52" rx="16" ry="38"
            fill={`${i % 2 === 0 ? ROSE : ROSE_LIGHT}18`}
            stroke={i % 2 === 0 ? ROSE : ROSE_LIGHT} strokeWidth="1.8"
            style={{ transformOrigin: "100px 100px", transform: `rotate(${angle}deg)` }}
            initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 0.8 }}
            transition={{ duration: 0.7, delay: i * 0.15, ease: "backOut" }}
          />
        ))}

        {/* Inner petal highlights */}
        {[0, 60, 120, 180, 240, 300].map((angle, i) => (
          <ellipse key={`inner-${i}`} cx="100" cy="62" rx="7" ry="20"
            fill={`${ROSE_LIGHT}0d`}
            style={{ transformOrigin: "100px 100px", transform: `rotate(${angle}deg)` }}
          />
        ))}

        {/* Center pistil ring */}
        <motion.circle cx="100" cy="100" r="18" fill={`${SAGE}22`} stroke={SAGE} strokeWidth="2"
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ duration: 0.8, delay: 1.2, ease: "backOut" }} />
        {/* Inner center highlight */}
        <circle cx="100" cy="98" r="10" fill={`${SAGE}15`} />
        {/* Center dot bloom */}
        <motion.circle cx="100" cy="100" r="6" fill={ROSE_LIGHT}
          animate={{ opacity: [0.5, 1, 0.5], scale: [0.9, 1.15, 0.9] }}
          transition={{ duration: 3, repeat: Infinity }} />

        {/* Stem */}
        <motion.line x1="100" y1="138" x2="100" y2="210" stroke={SAGE} strokeWidth="2.5" strokeLinecap="round"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, delay: 1.5, ease: "easeInOut" }} />
        {/* Stem leaves */}
        <motion.path d="M100 165 C88 155, 72 158, 68 170" stroke={SAGE} strokeWidth="1.5" fill={`${SAGE}18`} strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 0.7 }}
          transition={{ duration: 1, delay: 2 }} />
        <motion.path d="M100 185 C112 175, 128 178, 132 190" stroke={SAGE} strokeWidth="1.5" fill={`${SAGE}18`} strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 0.7 }}
          transition={{ duration: 1, delay: 2.2 }} />

        {/* Pollen sparkles */}
        <motion.circle cx="88" cy="88" r="2" fill={ROSE_LIGHT}
          animate={{ opacity: [0, 0.8, 0], cy: [88, 80, 88] }}
          transition={{ duration: 2.5, repeat: Infinity, delay: 1.5 }} />
        <motion.circle cx="112" cy="92" r="1.5" fill={ROSE_LIGHT}
          animate={{ opacity: [0, 0.6, 0], cy: [92, 84, 92] }}
          transition={{ duration: 3, repeat: Infinity, delay: 2 }} />
        <motion.circle cx="95" cy="110" r="1.5" fill={ROSE_LIGHT}
          animate={{ opacity: [0, 0.7, 0], cy: [110, 102, 110] }}
          transition={{ duration: 2.8, repeat: Infinity, delay: 2.5 }} />

        {/* Sparkle accents */}
        <motion.circle cx="165" cy="30" r="3" fill={ROSE_LIGHT}
          animate={{ opacity: [0.2, 1, 0.2], scale: [0.7, 1.3, 0.7] }}
          transition={{ duration: 2.5, repeat: Infinity }} />
        <motion.circle cx="30" cy="45" r="2" fill={SAGE}
          animate={{ opacity: [0.1, 0.8, 0.1], scale: [0.5, 1.2, 0.5] }}
          transition={{ duration: 3, repeat: Infinity, delay: 0.8 }} />
        <motion.circle cx="170" cy="130" r="2.5" fill={ROSE_LIGHT}
          animate={{ opacity: [0.15, 0.7, 0.15] }}
          transition={{ duration: 2, repeat: Infinity, delay: 1.2 }} />
        <motion.circle cx="25" cy="150" r="2" fill={SAGE}
          animate={{ opacity: [0.1, 0.6, 0.1] }}
          transition={{ duration: 2.5, repeat: Infinity, delay: 0.4 }} />
      </svg>
    </div>
  );
}

/* ───────────────────────── GALLERY DATA ───────────────────────── */
const galleryImages = [
  { src: "https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=800&q=80", alt: "Lush bridal bouquet with roses and peonies", span: "col-span-2 row-span-2" },
  { src: "https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=400&q=80", alt: "Elegant centerpiece arrangement", span: "col-span-1 row-span-1" },
  { src: "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=400&q=80", alt: "Spring wildflower bouquet", span: "col-span-1 row-span-1" },
  { src: "https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=400&q=80", alt: "Sunflower bouquet", span: "col-span-1 row-span-1" },
  { src: "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=400&q=80", alt: "Bridal couple with hand-tied bouquet", span: "col-span-1 row-span-1" },
  { src: "https://images.unsplash.com/photo-1591886960571-74d43a9d4166?w=600&q=80", alt: "Lush garden rose arrangement", span: "col-span-2 row-span-1" },
];

/* ───────────────────────── DATA ───────────────────────── */
const services = [
  { title: "Wedding Flowers", description: "Complete wedding floral design including bridal bouquets, bridesmaid flowers, boutonnieres, ceremony arches, reception centerpieces, and cake flowers. We work with your vision and venue.", icon: Heart },
  { title: "Funeral & Sympathy", description: "Tasteful tribute arrangements, standing sprays, casket pieces, and sympathy bouquets. We handle delivery directly to the funeral home with care and dignity.", icon: FlowerLotus },
  { title: "Event Florals", description: "Corporate events, galas, birthday parties, and celebrations. From table arrangements to grand installations, we create the atmosphere your event deserves.", icon: Sparkle },
  { title: "Daily Arrangements", description: "Fresh hand-tied bouquets, seasonal arrangements, and custom designs available daily for same-day delivery. Perfect for birthdays, anniversaries, or just because.", icon: Gift },
  { title: "Subscriptions", description: "Weekly or bi-weekly fresh flower deliveries for homes, offices, and restaurants. Curated seasonal blooms that brighten any space, hassle-free.", icon: CalendarBlank },
  { title: "Corporate Accounts", description: "Regular floral service for lobbies, conference rooms, and reception areas. Professional styling that elevates your brand and impresses clients.", icon: Buildings },
];

const stats = [
  { value: "8,000+", label: "Arrangements Created" },
  { value: "4.9", label: "Star Rating" },
  { value: "500+", label: "Weddings Designed" },
  { value: "15+", label: "Years of Bloom" },
];

const testimonials = [
  { name: "Emily & James R.", text: "Our wedding flowers were absolutely breathtaking. They captured our vision perfectly and the ceremony arch was the centerpiece of every photo. Pure magic.", rating: 5 },
  { name: "Catherine L.", text: "I have a weekly subscription for my home and I look forward to every delivery. The arrangements are always stunning, creative, and last beautifully all week.", rating: 5 },
  { name: "David M.", text: "They handled the funeral flowers for my mother with such grace and care. The arrangements were elegant and exactly what she would have loved. Thank you.", rating: 5 },
];

const seasonalCollections = [
  { season: "Spring", icon: Flower, blooms: "Peonies, tulips, ranunculus", description: "Soft pastels and vibrant fresh cuts celebrating renewal and warmth." },
  { season: "Summer", icon: ThermometerHot, blooms: "Dahlias, sunflowers, zinnias", description: "Bold, sun-soaked arrangements bursting with color and energy." },
  { season: "Fall", icon: SunHorizon, blooms: "Chrysanthemums, roses, berries", description: "Rich, warm tones with rustic textures and seasonal accents." },
  { season: "Winter", icon: Snowflake, blooms: "Amaryllis, evergreens, orchids", description: "Elegant, sophisticated designs with holiday and winter-white palettes." },
];

const faqItems = [
  { q: "How far in advance should I book for wedding flowers?", a: "We recommend booking 6-12 months in advance for weddings, especially during peak season (May-October). For smaller events, 2-4 weeks is usually sufficient." },
  { q: "Do you offer same-day delivery?", a: "Yes. Orders placed before 1:00 PM are eligible for same-day delivery within our service area. We deliver 7 days a week." },
  { q: "Can I request specific flowers?", a: "Absolutely. While availability depends on the season, we source from premium growers worldwide and can often procure special requests. We always discuss alternatives if needed." },
  { q: "What is your delivery area?", a: "We deliver within a 25-mile radius of our studio. Extended delivery is available for weddings and events. Delivery fees vary by distance." },
  { q: "Do you offer flower subscription discounts?", a: "Yes. Weekly subscribers receive 15% off each arrangement, and bi-weekly subscribers receive 10% off. Corporate accounts receive custom pricing based on volume." },
];

const deliveryInfo = [
  { label: "Same-Day", detail: "Order by 1:00 PM for same-day delivery", icon: Truck },
  { label: "Service Area", detail: "25-mile radius from our studio", icon: MapPin },
  { label: "Freshness", detail: "Guaranteed 7-day bloom life", icon: Leaf },
  { label: "Free Delivery", detail: "On orders over $75", icon: Gift },
];

/* ═══════════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════════ */
export default function V2FloristPage() {
  const [openService, setOpenService] = useState<number | null>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden" style={{ background: BG, color: "#1c1917" }}>
      <FloatingPetals />

      {/* ─── NAV ─── */}
      <motion.nav initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-4">
          <GlassCard className="flex items-center justify-between px-4 md:px-6 py-3">
            <div className="flex items-center gap-2">
              <FlowerTulip size={24} weight="duotone" style={{ color: ROSE }} />
              <span className="text-lg font-bold tracking-tight text-[#1c1917]">Petals & Bloom</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm text-[#6b7280]">
              <a href="#gallery" className="hover:text-[#1c1917] transition-colors">Gallery</a>
              <a href="#services" className="hover:text-[#1c1917] transition-colors">Services</a>
              <a href="#seasons" className="hover:text-[#1c1917] transition-colors">Seasonal</a>
              <a href="#testimonials" className="hover:text-[#1c1917] transition-colors">Reviews</a>
              <a href="#contact" className="hover:text-[#1c1917] transition-colors">Contact</a>
            </div>
            <div className="flex items-center gap-3">
              <MagneticButton className="px-4 md:px-5 py-2 rounded-full text-sm font-semibold text-[#1c1917]" style={{ background: ROSE }}>Order Now</MagneticButton>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-lg text-[#1c1917] hover:bg-gray-100 transition-colors">{mobileMenuOpen ? <X size={24} /> : <List size={24} />}</button>
            </div>
          </GlassCard>
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3, ease: "easeInOut" }} className="md:hidden mt-2 overflow-hidden">
                <GlassCard className="flex flex-col gap-1 px-4 py-4">
                  {[{ label: "Gallery", href: "#gallery" }, { label: "Services", href: "#services" }, { label: "Seasonal", href: "#seasons" }, { label: "Reviews", href: "#testimonials" }, { label: "Contact", href: "#contact" }].map((link) => (
                    <a key={link.label} href={link.href} onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-lg text-sm text-[#4b5563] hover:text-[#1c1917] hover:bg-gray-50 transition-colors">{link.label}</a>
                  ))}
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.nav>

      {/* ─── HERO ─── */}
      <section className="relative min-h-[100dvh] flex items-center pt-24 z-10">
        <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 60% 40% at 50% 30%, ${ROSE_GLOW} 0%, transparent 70%)` }} />
        <div className="mx-auto max-w-7xl px-4 md:px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-4 items-center">
          <div className="space-y-5 md:space-y-8">
            <div>
              <motion.p initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ ...spring, delay: 0.1 }} className="text-sm uppercase tracking-widest mb-4" style={{ color: ROSE }}>Artisan Floral Studio</motion.p>
              <h1 className="text-3xl md:text-6xl tracking-tighter leading-none font-bold text-[#1c1917]" style={{ textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>
                <WordReveal text="Where Every Petal Tells a Story" />
              </h1>
            </div>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.6 }} className="text-lg text-[#6b7280] max-w-md leading-relaxed">
              Hand-crafted floral arrangements for weddings, events, and everyday celebrations. Fresh, stunning, and designed with love for over 15 years.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.8 }} className="flex flex-wrap gap-4">
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-[#1c1917] flex items-center gap-2 cursor-pointer" style={{ background: ROSE }}>
                Shop Arrangements <ArrowRight size={18} weight="bold" />
              </MagneticButton>
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-[#1c1917] border border-gray-200 flex items-center gap-2 cursor-pointer">
                <Phone size={18} weight="duotone" /> (206) 876-5432
              </MagneticButton>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ ...spring, delay: 0.95 }} className="flex flex-wrap gap-3">
              <span className="px-4 py-2 rounded-full text-xs font-semibold text-[#1c1917] flex items-center gap-2" style={{ background: "white", border: `1px solid ${ROSE}40` }}><Star size={14} weight="fill" style={{ color: ROSE }} />4.9-Star Rated</span>
              <span className="px-4 py-2 rounded-full text-xs font-semibold text-[#1c1917] flex items-center gap-2" style={{ background: "white", border: `1px solid ${SAGE}40` }}><Truck size={14} weight="duotone" style={{ color: SAGE }} />Same-Day Delivery</span>
              <span className="px-4 py-2 rounded-full text-xs font-semibold text-[#1c1917] flex items-center gap-2" style={{ background: "white", border: `1px solid ${ROSE}40` }}><Leaf size={14} weight="duotone" style={{ color: SAGE }} />Locally Grown</span>
              <span className="px-4 py-2 rounded-full text-xs font-semibold text-[#1c1917] flex items-center gap-2" style={{ background: "white", border: `1px solid ${SAGE}40` }}><Heart size={14} weight="duotone" style={{ color: ROSE }} />Family-Owned</span>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ ...spring, delay: 1 }} className="flex flex-wrap gap-6 text-sm text-[#6b7280]">
              <span className="flex items-center gap-2"><Truck size={16} weight="duotone" style={{ color: ROSE }} />Same-Day Delivery</span>
              <span className="flex items-center gap-2"><Leaf size={16} weight="duotone" style={{ color: SAGE }} />Sustainably Sourced</span>
            </motion.div>
          </div>
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ ...spring, delay: 0.3 }} className="hidden md:flex items-center justify-center lg:justify-end">
            <FlowerHeroIcon />
          </motion.div>
        </div>
      </section>

      {/* ─── STATS ─── */}
      <SectionReveal className="relative z-10 pb-8">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <GlassCard className="p-6 md:p-8">
            <motion.div className="grid grid-cols-2 sm:grid-cols-4 gap-6 md:gap-8" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
              {stats.map((s, i) => (
                <motion.div key={i} variants={fadeUp} className="text-center">
                  <p className="text-3xl md:text-4xl font-bold tracking-tight" style={{ color: ROSE }}>{s.value}</p>
                  <p className="text-sm text-[#6b7280] mt-1">{s.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </GlassCard>
        </div>
      </SectionReveal>

      {/* ─── GALLERY SHOWCASE ─── */}
      <SectionReveal id="gallery" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ROSE }}>Our Creations</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-[#1c1917]"><WordReveal text="Gallery Showcase" /></h2>
          </div>
          <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 auto-rows-[200px] md:auto-rows-[250px]" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {galleryImages.map((img, i) => (
              <motion.div key={i} variants={fadeUp} className={`${img.span} group relative rounded-2xl overflow-hidden cursor-pointer`}>
                <img src={img.src} alt={img.alt} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <p className="text-sm text-[#1c1917] font-medium">{img.alt}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── SERVICES ─── */}
      <SectionReveal id="services" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            <div className="lg:sticky lg:top-32">
              <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ROSE }}>What We Create</p>
              <h2 className="text-3xl md:text-6xl tracking-tighter leading-none font-bold text-[#1c1917] mb-6"><WordReveal text="Floral Services for Every Occasion" /></h2>
              <p className="text-[#6b7280] leading-relaxed max-w-md">From intimate bouquets to grand wedding installations, every arrangement is hand-crafted with the freshest seasonal blooms and an eye for beauty.</p>
            </div>
            <motion.div className="space-y-3" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
              {services.map((svc, i) => (
                <motion.div key={i} variants={fadeUp}>
                  <GlassCard className="overflow-hidden">
                    <button onClick={() => setOpenService(openService === i ? null : i)} className="w-full flex items-center justify-between p-5 md:p-6 text-left cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: ROSE_GLOW }}><svc.icon size={20} weight="duotone" style={{ color: ROSE }} /></div>
                        <span className="text-lg font-semibold text-[#1c1917]">{svc.title}</span>
                      </div>
                      <motion.div animate={{ rotate: openService === i ? 180 : 0 }} transition={spring}><CaretDown size={20} className="text-[#6b7280]" /></motion.div>
                    </button>
                    <AnimatePresence initial={false}>
                      {openService === i && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={spring} className="overflow-hidden">
                          <p className="px-5 pb-5 md:px-6 md:pb-6 text-[#6b7280] leading-relaxed pl-[4.5rem]">{svc.description}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </GlassCard>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </SectionReveal>

      {/* ─── ABOUT ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 50% 50% at 20% 50%, ${SAGE_GLOW} 0%, transparent 70%)` }} />
        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ROSE }}>Our Story</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-[#1c1917] mb-6"><WordReveal text="15 Years of Floral Artistry" /></h2>
            <p className="text-[#6b7280] leading-relaxed mb-4">Petals & Bloom began as a small studio with a simple belief: flowers have the power to transform moments into memories. What started as a passion for beauty has grown into the area’s most trusted floral studio.</p>
            <p className="text-[#6b7280] leading-relaxed mb-6">Every arrangement is designed by our team of certified floral designers who source the finest blooms from local farms and premium international growers. We are committed to sustainability, freshness, and creating something truly special for every client.</p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-sm"><Crown size={18} weight="duotone" style={{ color: ROSE }} /><span className="text-[#4b5563]">Award-Winning Design</span></div>
              <div className="flex items-center gap-2 text-sm"><Palette size={18} weight="duotone" style={{ color: ROSE }} /><span className="text-[#4b5563]">5 Certified Designers</span></div>
              <div className="flex items-center gap-2 text-sm"><Leaf size={18} weight="duotone" style={{ color: SAGE }} /><span className="text-[#4b5563]">Locally Sourced</span></div>
            </div>
          </div>
          <div className="relative rounded-2xl overflow-hidden aspect-[4/3]">
            <img src="https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?w=800&q=80" alt="Studio single stem feature" className="w-full h-full object-cover object-top" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          </div>
        </div>
      </SectionReveal>

      {/* ─── GOOGLE REVIEWS HEADER ─── */}
      <SectionReveal className="relative z-10 py-8">
        <div className="mx-auto max-w-4xl px-4 md:px-6">
          <div className="rounded-2xl bg-white border border-gray-200 shadow-sm px-6 py-5 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
            <div className="flex items-center gap-3">
              <svg width="32" height="32" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
              </svg>
              <div className="text-left">
                <p className="text-sm text-[#6b7280]">Google Reviews</p>
                <p className="text-lg font-bold text-[#1c1917]">Loved By Our Community</p>
              </div>
            </div>
            <div className="hidden sm:block w-px h-12 bg-gray-200" />
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                {[0,1,2,3,4].map((i) => (<Star key={i} size={20} weight="fill" style={{ color: ROSE }} />))}
              </div>
              <p className="text-sm text-[#6b7280]"><span className="text-[#1c1917] font-bold">4.9</span> out of 5 &bull; <span className="text-[#1c1917] font-bold">321</span> reviews</p>
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* ─── TESTIMONIALS ─── */}
      <SectionReveal id="testimonials" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ROSE }}>Client Love</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-[#1c1917]"><WordReveal text="Words from Our Clients" /></h2>
          </div>
          <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {testimonials.map((t, i) => (
              <motion.div key={i} variants={fadeUp}>
                <div className="p-6 h-full flex flex-col rounded-2xl bg-white border border-gray-200 shadow-sm relative overflow-hidden">
                  <Quotes size={60} weight="fill" style={{ color: ROSE }} className="absolute -top-2 -right-2 opacity-10" />
                  <Quotes size={28} weight="fill" style={{ color: ROSE }} className="mb-3 opacity-60" />
                  <p className="text-[#4b5563] leading-relaxed flex-1 text-sm">{t.text}</p>
                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-[#1c1917]">{t.name}</span>
                      <CheckCircle size={14} weight="fill" style={{ color: ROSE }} />
                      <span className="text-[10px] text-[#6b7280] uppercase tracking-wider">Verified</span>
                    </div>
                    <div className="flex gap-0.5">{Array.from({ length: t.rating }).map((_, j) => (<Star key={j} size={18} weight="fill" style={{ color: ROSE }} />))}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── URGENCY / SAME-DAY ─── */}
      <SectionReveal className="relative z-10 py-8">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 rounded-2xl bg-white border border-gray-200 shadow-sm">
            <div className="relative shrink-0">
              <motion.div className="absolute inset-0 rounded-full" style={{ background: ROSE }} animate={{ scale: [1, 1.6, 1], opacity: [0.5, 0, 0.5] }} transition={{ duration: 2, repeat: Infinity }} />
              <div className="relative w-4 h-4 rounded-full" style={{ background: ROSE }} />
            </div>
            <div className="flex-1 text-center md:text-left">
              <p className="text-xs uppercase tracking-widest mb-1" style={{ color: ROSE }}>Order by 1pm for Today</p>
              <h3 className="text-2xl md:text-3xl font-bold text-[#1c1917]">Same-Day Delivery Available</h3>
              <p className="text-sm text-[#6b7280] mt-2">Hand-tied arrangements delivered across the metro. Flat delivery fee within 10 miles, surge-free on holidays.</p>
            </div>
            <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white flex items-center gap-2 shrink-0 cursor-pointer" style={{ background: ROSE } as React.CSSProperties}>
              <Truck size={18} weight="duotone" /> Order Now
            </MagneticButton>
          </div>
        </div>
      </SectionReveal>

      {/* ─── ARRANGEMENT TIERS ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ROSE }}>Signature Arrangements</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-[#1c1917]"><WordReveal text="Something For Every Occasion" /></h2>
            <p className="text-[#6b7280] mt-4 max-w-2xl mx-auto">Designer-made bouquets shipped in cooler-controlled trucks. Pricing is transparent — what you see is what arrives.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "Petite", price: "$55", desc: "A beautiful hand-tied bouquet of seasonal blooms, wrapped in kraft with a handwritten note.", features: ["15–20 stems", "Designer's choice palette", "Kraft + twine wrap", "Free delivery within 5 mi"], highlight: false },
              { name: "Classic", price: "$95", desc: "Our most-ordered bouquet. Premium roses, filler, and foliage arranged in a reusable vase.", features: ["30+ stems", "Premium roses + accent blooms", "Ceramic or glass vase", "Gift wrap + card", "Free metro delivery"], highlight: true },
              { name: "Statement", price: "$195+", desc: "A showstopping arrangement for anniversaries, celebrations, and sympathy.", features: ["60+ stems", "Hand-selected focal flowers", "Designer vessel included", "White-glove delivery", "Same-day confirmation"], highlight: false },
            ].map((tier, i) => (
              <div key={i} className={`relative rounded-2xl ${tier.highlight ? 'p-[2px]' : 'border border-gray-200'}`} style={tier.highlight ? { background: `linear-gradient(135deg, ${ROSE}, ${ROSE_LIGHT})` } : {}}>
                {tier.highlight && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white" style={{ background: ROSE }}>Most Popular</div>}
                <div className="rounded-2xl p-6 h-full bg-white shadow-sm">
                  <h3 className="text-xl font-bold text-[#1c1917]">{tier.name}</h3>
                  <p className="text-xs text-[#6b7280] mt-1">{tier.desc}</p>
                  <div className="mt-6 flex items-end gap-1">
                    <span className="text-5xl font-black text-[#1c1917]">{tier.price}</span>
                  </div>
                  <ul className="mt-6 space-y-3">
                    {tier.features.map((f, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-[#4b5563]">
                        <CheckCircle size={18} weight="fill" style={{ color: tier.highlight ? ROSE : SAGE }} className="shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <button className="mt-6 w-full px-6 py-3 rounded-full text-sm font-semibold" style={{ background: tier.highlight ? ROSE : "white", color: tier.highlight ? "white" : "#1c1917", border: tier.highlight ? "none" : "1px solid #e5e7eb" }}>Order Now</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ─── OCCASION CARDS ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ROSE }}>Every Moment</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-[#1c1917]"><WordReveal text="Designed For Every Occasion" /></h2>
          </div>
          <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-4" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
            {[
              { name: "Weddings", price: "From $1,500", icon: Heart, desc: "Full florals from bouquets to installations" },
              { name: "Sympathy", price: "From $95", icon: FlowerLotus, desc: "Standing sprays, caskets, and home bouquets" },
              { name: "Corporate", price: "From $195/wk", icon: Buildings, desc: "Weekly lobby + office arrangements" },
              { name: "Subscriptions", price: "From $65/mo", icon: Gift, desc: "Fresh blooms delivered to your door monthly" },
            ].map((occ, i) => (
              <motion.div key={i} variants={fadeUp} whileHover={{ y: -4 }} className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm h-full">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: ROSE_GLOW }}>
                  <occ.icon size={24} weight="duotone" style={{ color: ROSE }} />
                </div>
                <h3 className="text-lg font-bold text-[#1c1917]">{occ.name}</h3>
                <p className="text-xs font-semibold mt-1" style={{ color: ROSE }}>{occ.price}</p>
                <p className="text-sm text-[#6b7280] mt-3 leading-relaxed">{occ.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── VIDEO PLACEHOLDER ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ROSE }}>Studio Tour</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-[#1c1917]"><WordReveal text="Step Inside Our Shop" /></h2>
          </div>
          <div className="relative rounded-2xl overflow-hidden aspect-video group cursor-pointer">
            <img src="https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=1600&q=80" alt="Hand-crafted gift arrangement" className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div className="w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center shadow-2xl" style={{ background: ROSE }} animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
                <svg width="28" height="32" viewBox="0 0 24 28" fill="white" className="ml-1">
                  <path d="M0 0L24 14L0 28Z" />
                </svg>
              </motion.div>
            </div>
            <div className="absolute bottom-6 left-6 right-6">
              <p className="text-xs uppercase tracking-widest" style={{ color: "#fff" }}>Design Studio Tour &bull; 2:35</p>
              <p className="text-xl md:text-2xl font-bold text-white mt-1">See how our designers hand-craft every arrangement from stem to delivery.</p>
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* ─── OCCASION QUIZ ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="relative z-10 mx-auto max-w-5xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ROSE }}>Not Sure What To Send?</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-[#1c1917]"><WordReveal text="Let Us Help You Choose" /></h2>
            <p className="text-[#6b7280] mt-4 max-w-2xl mx-auto">Tell us the moment and we'll recommend an arrangement that fits the feeling.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { color: ROSE, label: "Celebration", detail: "Birthday, anniversary, promotion, or a thank-you — something bright and joyful.", rec: "Classic Bouquet + Add-On Chocolates", icon: Sparkle },
              { color: SAGE, label: "Sympathy", detail: "Funeral, memorial, or a gentle reminder of care during grief.", rec: "Sympathy Arrangement in White & Green", icon: FlowerLotus },
              { color: ROSE_LIGHT, label: "Romance", detail: "Date night, proposal, wedding gesture, or just-because flowers for your person.", rec: "Premium Red Rose Statement", icon: Heart },
            ].map((opt, i) => (
              <div key={i} className="p-6 h-full flex flex-col items-start relative overflow-hidden group cursor-pointer rounded-2xl bg-white border border-gray-200 shadow-sm">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: `radial-gradient(circle at 50% 0%, ${opt.color}15, transparent 60%)` }} />
                <div className="relative w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: `${opt.color}22` }}>
                  <opt.icon size={22} weight="duotone" style={{ color: opt.color }} />
                </div>
                <p className="relative text-xs uppercase tracking-widest font-bold" style={{ color: opt.color }}>{opt.label}</p>
                <p className="relative text-sm text-[#4b5563] mt-2 leading-relaxed flex-1">{opt.detail}</p>
                <div className="relative mt-6 pt-4 border-t border-gray-100 w-full">
                  <p className="text-[10px] uppercase tracking-widest text-[#6b7280] mb-1">We Recommend</p>
                  <p className="text-sm font-semibold text-[#1c1917]">{opt.rec}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ─── COMPETITOR COMPARISON ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ROSE }}>The Difference</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-[#1c1917]"><WordReveal text="Us vs. The Grocery Store" /></h2>
          </div>
          <div className="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden">
            <div className="grid grid-cols-[1.5fr_1fr_1fr] items-center border-b border-gray-200">
              <div className="p-4 md:p-6 text-xs uppercase tracking-widest text-[#6b7280]">What Matters</div>
              <div className="p-4 md:p-6 text-center" style={{ background: `${ROSE}10` }}>
                <p className="text-sm md:text-base font-bold" style={{ color: ROSE }}>Our Studio</p>
              </div>
              <div className="p-4 md:p-6 text-center">
                <p className="text-sm md:text-base font-semibold text-[#6b7280]">Grocery Store</p>
              </div>
            </div>
            {[
              { feature: "Designer-made arrangements", us: "Every order", them: "Pre-assembled" },
              { feature: "Fresh weekly deliveries from farms", us: "3x per week", them: "Unknown" },
              { feature: "Same-day + white-glove delivery", us: "Included", them: "Limited" },
              { feature: "Seasonal + locally grown stems", us: "Prioritized", them: "Mass import" },
              { feature: "Hand-written card + kraft wrap", us: "Standard", them: "Plastic clamshell" },
              { feature: "Wedding + event florals", us: "Full service", them: "No" },
              { feature: "Satisfaction guarantee", us: "100%", them: "Store credit only" },
            ].map((row, i) => (
              <div key={i} className="grid grid-cols-[1.5fr_1fr_1fr] items-center border-b border-gray-100 last:border-b-0">
                <div className="p-4 md:p-6 text-sm text-[#1c1917]">{row.feature}</div>
                <div className="p-4 md:p-6 text-center" style={{ background: `${ROSE}08` }}>
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle size={18} weight="fill" style={{ color: ROSE }} />
                    <span className="text-sm text-[#1c1917] font-semibold hidden sm:inline">{row.us}</span>
                  </div>
                </div>
                <div className="p-4 md:p-6 text-center text-sm text-[#6b7280] italic">{row.them}</div>
              </div>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ─── CERTIFICATIONS / PARTNERS ─── */}
      <SectionReveal className="relative z-10 py-8">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <p className="text-center text-xs uppercase tracking-widest text-[#6b7280] mb-6">Partners &amp; Memberships</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {[
              { label: "SAF Member", icon: Flower },
              { label: "Slow Flowers", icon: Leaf },
              { label: "BBB A+", icon: Star },
              { label: "AIFD Certified", icon: Palette },
              { label: "Fair Trade", icon: ShieldCheck },
              { label: "Local Farm Co-op", icon: Crown },
            ].map((cert, i) => (
              <div key={i} className="px-4 py-3 flex items-center gap-2 justify-center rounded-2xl bg-white border border-gray-200">
                <cert.icon size={18} weight="duotone" style={{ color: i % 2 === 0 ? ROSE : SAGE }} />
                <span className="text-xs font-semibold text-[#4b5563]">{cert.label}</span>
              </div>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ─── SERVICE AREA ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ROSE }}>Where We Deliver</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-[#1c1917]"><WordReveal text="Delivery Coverage" /></h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="p-6 text-center rounded-2xl bg-white border border-gray-200 shadow-sm">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: ROSE_GLOW }}>
                <MapPin size={26} weight="duotone" style={{ color: ROSE }} />
              </div>
              <p className="text-xs uppercase tracking-widest mb-2" style={{ color: ROSE }}>Delivery Radius</p>
              <p className="text-3xl font-black text-[#1c1917]">25 Miles</p>
              <p className="text-sm text-[#6b7280] mt-2">Metro and surrounding suburbs, with special-event florals delivered statewide for weddings and corporate installs.</p>
            </div>
            <div className="p-6 text-center rounded-2xl bg-white border border-gray-200 shadow-sm">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: SAGE_GLOW }}>
                <Clock size={26} weight="duotone" style={{ color: SAGE }} />
              </div>
              <p className="text-xs uppercase tracking-widest mb-2" style={{ color: SAGE }}>Cut-off Time</p>
              <p className="text-3xl font-black text-[#1c1917]">1:00 PM</p>
              <p className="text-sm text-[#6b7280] mt-2">Order by 1pm for same-day delivery. Guaranteed next-day delivery for orders placed up to midnight.</p>
            </div>
            <div className="p-6 text-center rounded-2xl bg-white border border-gray-200 shadow-sm">
              <div className="relative w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: ROSE_GLOW }}>
                <motion.div className="absolute inset-0 rounded-full" style={{ background: ROSE }} animate={{ scale: [1, 1.6, 1], opacity: [0.4, 0, 0.4] }} transition={{ duration: 2, repeat: Infinity }} />
                <CheckCircle size={26} weight="duotone" style={{ color: ROSE }} className="relative" />
              </div>
              <p className="text-xs uppercase tracking-widest mb-2" style={{ color: ROSE }}>Availability</p>
              <p className="text-3xl font-black text-[#1c1917]">Taking Orders</p>
              <p className="text-sm text-[#6b7280] mt-2">Studio is open 7 days a week. Valentine's, Mother's Day, and wedding season book out — order early.</p>
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* ─── SEASONAL COLLECTIONS ─── */}
      <SectionReveal id="seasons" className="relative z-10 py-16 md:py-24">
        <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 60% 40% at 50% 50%, ${ROSE_GLOW} 0%, transparent 70%)` }} />
        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ROSE }}>Year-Round Beauty</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-[#1c1917]"><WordReveal text="Seasonal Collections" /></h2>
          </div>
          <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {seasonalCollections.map((col, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="p-6 h-full text-center">
                  <col.icon size={32} weight="duotone" style={{ color: ROSE }} className="mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-[#1c1917] mb-1">{col.season}</h3>
                  <p className="text-xs uppercase tracking-widest mb-3" style={{ color: SAGE }}>{col.blooms}</p>
                  <p className="text-sm text-[#6b7280] leading-relaxed">{col.description}</p>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── FAQ ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ROSE }}>Common Questions</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-[#1c1917]"><WordReveal text="Frequently Asked Questions" /></h2>
          </div>
          <motion.div className="space-y-3" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
            {faqItems.map((faq, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="overflow-hidden">
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-5 text-left cursor-pointer">
                    <span className="text-base font-semibold text-[#1c1917] pr-4">{faq.q}</span>
                    <motion.div animate={{ rotate: openFaq === i ? 180 : 0 }} transition={spring}><CaretDown size={20} className="text-[#6b7280]" /></motion.div>
                  </button>
                  <AnimatePresence initial={false}>
                    {openFaq === i && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={spring} className="overflow-hidden">
                        <p className="px-5 pb-5 text-[#6b7280] leading-relaxed">{faq.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── DELIVERY INFO ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ROSE }}>Delivery</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-[#1c1917]"><WordReveal text="Fresh to Your Door" /></h2>
          </div>
          <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {deliveryInfo.map((info, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="p-6 text-center h-full">
                  <info.icon size={28} weight="duotone" style={{ color: ROSE }} className="mx-auto mb-3" />
                  <h3 className="text-base font-semibold text-[#1c1917] mb-1">{info.label}</h3>
                  <p className="text-sm text-[#6b7280]">{info.detail}</p>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── CONTACT ─── */}
      <SectionReveal id="contact" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-[#1c1917] mb-6"><WordReveal text="Send Something Beautiful" /></h2>
              <p className="text-[#6b7280] leading-relaxed max-w-md mb-8">Whether you need a stunning wedding design or a spontaneous bouquet to brighten someone’s day, we are here to create something unforgettable. Same-day delivery available.</p>
              <div className="flex flex-wrap gap-4">
                <MagneticButton className="px-10 py-4 rounded-full text-base font-semibold text-[#1c1917] inline-flex items-center gap-2 cursor-pointer" style={{ background: ROSE }}>
                  <CalendarCheck size={20} weight="duotone" /> Order Flowers
                </MagneticButton>
                <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-[#1c1917] border border-gray-200 flex items-center gap-2 cursor-pointer">
                  <Phone size={18} weight="duotone" /> Call Studio
                </MagneticButton>
              </div>
            </div>
            <GlassCard className="p-8">
              <h3 className="text-xl font-semibold text-[#1c1917] mb-6">Visit Our Studio</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4"><MapPin size={20} weight="duotone" style={{ color: ROSE }} className="mt-0.5 shrink-0" /><div><p className="text-sm font-semibold text-[#1c1917]">Studio</p><p className="text-sm text-[#6b7280]">128 Bloom Lane<br />Savannah, GA 31401</p></div></div>
                <div className="flex items-start gap-4"><Phone size={20} weight="duotone" style={{ color: ROSE }} className="mt-0.5 shrink-0" /><div><p className="text-sm font-semibold text-[#1c1917]">Phone</p><p className="text-sm text-[#6b7280]">(206) 876-5432</p></div></div>
                <div className="flex items-start gap-4"><Clock size={20} weight="duotone" style={{ color: ROSE }} className="mt-0.5 shrink-0" /><div><p className="text-sm font-semibold text-[#1c1917]">Hours</p><p className="text-sm text-[#6b7280]">Monday - Saturday: 8:00 AM - 6:00 PM<br />Sunday: 10:00 AM - 4:00 PM<br />Holiday hours may vary</p></div></div>
                <div className="flex items-start gap-4"><Heart size={20} weight="duotone" style={{ color: ROSE }} className="mt-0.5 shrink-0" /><div><p className="text-sm font-semibold text-[#1c1917]">Wedding Consultations</p><p className="text-sm text-[#6b7280]">By appointment, evenings available<br />Complimentary for events over $2,000</p></div></div>
              </div>
            </GlassCard>
          </div>
        </div>
      </SectionReveal>

      {/* ─── SEASONAL BLOOMS ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ROSE }}>Seasonal Picks</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-[#1c1917]"><WordReveal text="What's Blooming Now" /></h2>
            <p className="text-[#6b7280] mt-4 max-w-2xl mx-auto">Fresh stems rotate with the seasons. Here's what's looking its best in our coolers this month.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: "Peonies", season: "May – June", icon: Flower, desc: "Lush, romantic, and fleeting — peak for weddings and spring celebrations." },
              { name: "Garden Roses", season: "Year Round", icon: FlowerTulip, desc: "Our farm partners grow fragrant Davids and Juliets in a dozen colors." },
              { name: "Dahlias", season: "Aug – Oct", icon: Sparkle, desc: "Showstoppers from pompoms to dinnerplates — the fall wedding essential." },
              { name: "Anemones", season: "Nov – Apr", icon: FlowerLotus, desc: "Cool-season blooms with a dramatic dark center — stunning in monochrome bouquets." },
              { name: "Ranunculus", season: "Feb – May", icon: Flower, desc: "Ruffly, romantic layers in blush, coral, butter, and deep burgundy — bridal dream." },
              { name: "Tulips", season: "Jan – May", icon: FlowerTulip, desc: "Dutch imports plus local Pacific Northwest growers. Cheerful, affordable, endless colors." },
              { name: "Sunflowers", season: "Jul – Sep", icon: SunHorizon, desc: "Bright cheerful faces with natural greens and rustic foliage — summer favorites." },
              { name: "Hydrangea", season: "Jun – Oct", icon: FlowerLotus, desc: "Full blowsy heads in blue, green, pink, and white — instant lush garden feel." },
            ].map((bloom, i) => (
              <div key={i} className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3" style={{ background: ROSE_GLOW }}>
                  <bloom.icon size={22} weight="duotone" style={{ color: ROSE }} />
                </div>
                <p className="text-xs uppercase tracking-widest font-bold" style={{ color: SAGE }}>{bloom.season}</p>
                <p className="text-lg font-bold text-[#1c1917] mt-1">{bloom.name}</p>
                <p className="text-xs text-[#6b7280] mt-2 leading-relaxed">{bloom.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ─── GUARANTEES ─── */}
      <SectionReveal className="relative z-10 py-16">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="text-center mb-10">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ROSE }}>Our Promise</p>
            <h2 className="text-3xl md:text-4xl tracking-tighter font-bold text-[#1c1917]"><WordReveal text="Every Stem Handled With Care" /></h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { title: "Fresh Guarantee", desc: "If anything wilts in under 5 days, we replace it free — no photos or questions.", icon: Leaf },
              { title: "Cooler-Controlled", desc: "Delivery vans maintain florist-cooler temperature, even in summer heat.", icon: Truck },
              { title: "Designer-Made", desc: "Real people hand-tie every order. No warehouse fulfillment, no shortcuts.", icon: Heart },
              { title: "Local Growers", desc: "We buy direct from 12 regional farms — fresher, sustainable, your dollars stay local.", icon: ShieldCheck },
            ].map((item, i) => (
              <div key={i} className="p-5 text-center rounded-2xl bg-white border border-gray-200 shadow-sm">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: ROSE_GLOW }}>
                  <item.icon size={22} weight="duotone" style={{ color: ROSE }} />
                </div>
                <p className="text-sm font-bold text-[#1c1917]">{item.title}</p>
                <p className="text-xs text-[#6b7280] mt-1 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ─── EXTENDED FAQ ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4 md:px-6">
          <div className="text-center mb-10">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ROSE }}>Quick Answers</p>
            <h2 className="text-3xl md:text-4xl tracking-tighter font-bold text-[#1c1917]"><WordReveal text="Good To Know" /></h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { q: "What if my arrangement arrives damaged?", a: "We replace or refund within 5 days, no questions. Just reply to your order confirmation with a photo." },
              { q: "Do you do weddings and events?", a: "Yes — full-service wedding florals starting at $1,500. We offer free consultations with our event designer." },
              { q: "Can I customize the flowers?", a: "Absolutely. Swap stems, adjust colors, pick a specific palette. Mention it in the order notes or call us." },
              { q: "Do you offer subscription delivery?", a: "Yes — weekly, bi-weekly, or monthly subscription arrangements from $65/month, cancel anytime." },
            ].map((faq, i) => (
              <div key={i} className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm">
                <p className="text-sm font-bold text-[#1c1917] mb-2">{faq.q}</p>
                <p className="text-sm text-[#6b7280] leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ─── FINAL CTA ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-4 md:px-6">
          <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-8 md:p-12 text-center">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ROSE }}>Make Someone's Day</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-[#1c1917] mb-4">Send Something Beautiful</h2>
            <p className="text-[#4b5563] text-lg mb-8 max-w-lg mx-auto">Same-day delivery across the metro. Choose a designer-made bouquet or work with us on something custom — both arrive just as stunning.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <MagneticButton className="px-10 py-4 rounded-full text-base font-semibold text-white inline-flex items-center gap-2 cursor-pointer" style={{ background: ROSE } as React.CSSProperties}>
                <CalendarCheck size={20} weight="duotone" /> Order Now
              </MagneticButton>
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-[#1c1917] border border-gray-200 inline-flex items-center gap-2 cursor-pointer">
                <Phone size={18} weight="duotone" /> (206) 876-5432
              </MagneticButton>
            </div>
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-xl mx-auto">
              {[
                { label: "Same-Day By", value: "1:00 PM" },
                { label: "Years In Business", value: "12+" },
                { label: "Weddings Per Year", value: "180+" },
                { label: "Happy Recipients", value: "12K+" },
                { label: "Local Growers", value: "12" },
                { label: "Satisfaction Rate", value: "100%" },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <p className="text-xs text-[#6b7280] uppercase tracking-widest">{stat.label}</p>
                  <p className="text-2xl font-black mt-1" style={{ color: ROSE }}>{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* ─── FOOTER ─── */}
      <footer className="relative z-10 border-t border-gray-100 py-8">
        <div className="mx-auto max-w-7xl px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-[#9ca3af]">
            <FlowerTulip size={16} weight="duotone" style={{ color: ROSE }} />
            <span>Petals & Bloom &copy; {new Date().getFullYear()}</span>
          </div>
          <p className="text-xs text-[#6b7280] flex items-center gap-1.5"><svg width="14" height="14" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-sky-500"><path d="M24.3 4.2c-1.5-.4-3.2.1-4.5 1.1-1-.7-2.3-1-3.5-.8-2.4.4-4.2 2.5-4.2 4.9v.6c-3.2.8-6 2.8-7.8 5.6-.3.5-.1 1.1.4 1.4.5.3 1.1.1 1.4-.4 1.5-2.3 3.7-4 6.3-4.7.5-.1 1-.1 1.5 0 .8.2 1.4.8 1.7 1.5.3.8.2 1.6-.2 2.3l-2.8 4.3c-.6.9-.4 2.1.4 2.8l2.5 2.1c.4.3.8.5 1.3.5h5.2c.5 0 1-.2 1.3-.5l1.2-1c.6-.5.8-1.3.6-2l-1-3.2c-.2-.5 0-1.1.4-1.4l3.8-2.5c1.3-.9 2.1-2.3 2.1-3.9V9.6c0-2.5-1.7-4.7-4.1-5.3v-.1z" fill="currentColor"/></svg>Built by <a href="https://bluejayportfolio.com/audit" target="_blank" rel="noopener noreferrer" style={{textDecoration:"underline"}}>BlueJays</a>{" "}— get your free site audit</p>
        </div>
      </footer>
    </main>
  );
}
