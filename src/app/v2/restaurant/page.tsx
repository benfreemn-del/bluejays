"use client";

/* eslint-disable @next/next/no-img-element -- These static marketing and preview components intentionally use plain img tags to preserve existing markup and visual behavior during lint-only cleanup. */
/* eslint-disable react-hooks/purity -- Decorative particle values are intentionally randomized for static visual effects in these marketing pages and previews; this preserves existing appearance without changing business logic. */

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
  ForkKnife,
  Wine,
  CookingPot,
  Fire,
  Clock,
  Phone,
  MapPin,
  ArrowRight,
  CaretDown,
  Quotes,
  CalendarCheck,
  Users,
  Leaf,
  X,
  List,
  EnvelopeSimple,
  ShieldCheck,
  Timer,
  Champagne,
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
const BG = "#1a0a0a";
const RED = "#dc2626";
const RED_LIGHT = "#ef4444";
const GOLD = "#d4a846";
const GOLD_LIGHT = "#e5c464";
const RED_GLOW = "rgba(220, 38, 38, 0.15)";
const GOLD_GLOW = "rgba(212, 168, 70, 0.15)";

/* ───────────────────────── FLOATING EMBERS ───────────────────────── */
function FloatingEmbers() {
  const particles = Array.from({ length: 28 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 8,
    duration: 5 + Math.random() * 7,
    size: 2 + Math.random() * 4,
    opacity: 0.2 + Math.random() * 0.4,
    isGold: Math.random() > 0.5,
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
            background: p.isGold ? GOLD_LIGHT : RED_LIGHT,
            willChange: "transform, opacity",
          }}
          animate={{
            y: ["110vh", "-10vh"],
            x: [0, (Math.random() - 0.5) * 40],
            opacity: [0, p.opacity, p.opacity, 0],
          }}
          transition={{
            y: { duration: p.duration, repeat: Infinity, delay: p.delay, ease: "linear" },
            x: { duration: p.duration * 0.8, repeat: Infinity, delay: p.delay, ease: "easeInOut" },
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
function GlassCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] ${className}`}
    >
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

  const isTouchDevice =
    typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;

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
          background: `conic-gradient(from 0deg, transparent, ${RED}, transparent, ${GOLD}, transparent)`,
          willChange: "transform",
        }}
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      />
      <div className="relative rounded-2xl z-10" style={{ background: BG }}>{children}</div>
    </div>
  );
}

/* ───────────────────────── PLATE SETTING SVG ───────────────────────── */
function PlateSettingSVG() {
  return (
    <div className="relative flex items-center justify-center">
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{ background: `radial-gradient(circle, ${RED_GLOW} 0%, transparent 70%)`, filter: "blur(40px)" }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      <svg viewBox="0 0 200 220" className="relative z-10 w-48 h-56 md:w-56 md:h-72" fill="none">
        <motion.circle cx="100" cy="110" r="92" stroke={RED} strokeWidth="0.5" opacity={0.12}
          animate={{ r: [90, 94, 90] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} />

        {/* Plate outer ring */}
        <motion.circle cx="100" cy="115" r="60" fill={`${RED}0d`} stroke={RED} strokeWidth="2"
          initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "backOut" }} />
        <motion.circle cx="100" cy="115" r="52" fill={`${RED}08`} stroke={GOLD} strokeWidth="1"
          initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.5, ease: "backOut" }} />
        <circle cx="100" cy="112" r="40" fill={`${RED}06`} />
        {/* Plate inner highlight */}
        <circle cx="95" cy="108" r="22" fill={`${GOLD}08`} />

        {/* Fork (left) */}
        <motion.g initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1, duration: 0.5 }}>
          <line x1="25" y1="55" x2="25" y2="65" stroke={GOLD} strokeWidth="1.5" />
          <line x1="29" y1="55" x2="29" y2="65" stroke={GOLD} strokeWidth="1.5" />
          <line x1="33" y1="55" x2="33" y2="65" stroke={GOLD} strokeWidth="1.5" />
          <line x1="37" y1="55" x2="37" y2="65" stroke={GOLD} strokeWidth="1.5" />
          <rect x="24" y="65" width="14" height="5" rx="2" fill={`${GOLD}33`} />
          <line x1="31" y1="70" x2="31" y2="185" stroke={GOLD} strokeWidth="2.5" strokeLinecap="round" />
          <path d="M24 55 Q24 48 31 48 Q38 48 38 55" fill="none" stroke={GOLD} strokeWidth="1.5" />
        </motion.g>

        {/* Knife (right) */}
        <motion.g initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.2, duration: 0.5 }}>
          <path d="M169 48 Q176 48 176 58 L176 70 Q176 72 173 72 L169 72 L169 48Z" fill={`${GOLD}22`} stroke={GOLD} strokeWidth="1.5" />
          <line x1="169" y1="72" x2="169" y2="185" stroke={GOLD} strokeWidth="2.5" strokeLinecap="round" />
          <path d="M170 50 L174 55 L174 68" stroke={`${GOLD}44`} strokeWidth="0.5" fill="none" />
        </motion.g>

        {/* Flame above plate */}
        <motion.path d="M100 35 C95 25 85 20 90 8 C92 15 100 10 100 0 C100 10 108 15 110 8 C115 20 105 25 100 35Z"
          fill={`${RED}22`} stroke={RED_LIGHT} strokeWidth="1.5"
          initial={{ opacity: 0, y: 10, scale: 0.5 }} animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 1.5, duration: 0.5 }} />
        <motion.path d="M100 30 C97 22 92 18 95 10 C96 16 100 13 100 8 C100 13 104 16 105 10 C108 18 103 22 100 30Z"
          fill={`${GOLD}22`}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8 }} />
        {/* Flame glow */}
        <motion.circle cx="100" cy="20" r="12" fill={RED_LIGHT}
          animate={{ opacity: [0.05, 0.15, 0.05], r: [10, 14, 10] }}
          transition={{ duration: 2, repeat: Infinity }} />

        {/* Steam wisps from plate */}
        <motion.path d="M85 70 C82 60 88 55 85 48" stroke={GOLD} strokeWidth="1" strokeLinecap="round" fill="none" opacity={0.4}
          animate={{ opacity: [0, 0.4, 0], y: [0, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity }} />
        <motion.path d="M115 68 C118 58 112 52 115 45" stroke={GOLD} strokeWidth="1" strokeLinecap="round" fill="none" opacity={0.4}
          animate={{ opacity: [0, 0.4, 0], y: [0, -5, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, delay: 0.5 }} />

        {/* Sparkle accents */}
        <motion.circle cx="170" cy="30" r="3" fill={GOLD_LIGHT}
          animate={{ opacity: [0.2, 1, 0.2], scale: [0.7, 1.3, 0.7] }}
          transition={{ duration: 2.5, repeat: Infinity }} />
        <motion.circle cx="25" cy="35" r="2" fill={RED_LIGHT}
          animate={{ opacity: [0.1, 0.8, 0.1], scale: [0.5, 1.2, 0.5] }}
          transition={{ duration: 3, repeat: Infinity, delay: 0.8 }} />
        <motion.circle cx="185" cy="130" r="2.5" fill={GOLD_LIGHT}
          animate={{ opacity: [0.15, 0.7, 0.15] }}
          transition={{ duration: 2, repeat: Infinity, delay: 1.2 }} />
        <motion.circle cx="15" cy="130" r="2" fill={RED_LIGHT}
          animate={{ opacity: [0.1, 0.6, 0.1] }}
          transition={{ duration: 2.5, repeat: Infinity, delay: 0.4 }} />
      </svg>
    </div>
  );
}

/* ───────────────────────── FAQ ACCORDION ───────────────────────── */
function AccordionItem({
  title,
  description,
  isOpen,
  onToggle,
}: {
  title: string;
  description: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <GlassCard className="overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-5 md:p-6 text-left group cursor-pointer"
      >
        <span className="text-lg font-semibold text-white">{title}</span>
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
            <p className="px-5 pb-5 md:px-6 md:pb-6 text-slate-400 leading-relaxed">
              {description}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
}

/* ───────────────────────── DATA ───────────────────────── */
const menuHighlights = [
  {
    title: "Pan-Seared Sea Bass",
    description: "Wild-caught Chilean sea bass with saffron risotto, broccolini, and lemon beurre blanc.",
    price: "$42",
    photo: "https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?w=600&q=80",
  },
  {
    title: "Wagyu Beef Tenderloin",
    description: "A5 wagyu with black truffle mash, roasted bone marrow, and port wine reduction.",
    price: "$68",
    photo: "https://images.unsplash.com/photo-1558030006-450675393462?w=600&q=80",
  },
  {
    title: "Lobster Ravioli",
    description: "House-made pasta filled with Maine lobster, mascarpone cream, and micro-basil.",
    price: "$38",
    photo: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=600&q=80",
  },
];

const galleryPhotos = [
  { src: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80", alt: "Restaurant interior dining room" },
  { src: "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=600&q=80", alt: "Plated fine dining dish" },
  { src: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80", alt: "Bar area and cocktails" },
  { src: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600&q=80", alt: "Chef plating a dish" },
  { src: "https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?w=600&q=80", alt: "Dessert presentation" },
  { src: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80", alt: "Curated wine and private dining atmosphere" }
];

const testimonials = [
  {
    name: "Victoria M.",
    text: "An unforgettable evening. The wagyu was perfection and the ambiance transported us to another world. Already planning our next visit.",
    rating: 5,
  },
  {
    name: "James & Laura P.",
    text: "We celebrated our anniversary here and it exceeded every expectation. The staff made us feel like royalty from the moment we walked in.",
    rating: 5,
  },
  {
    name: "Michael R.",
    text: "The chef's tasting menu was a journey. Each course was a masterpiece. This is easily the best restaurant in the city.",
    rating: 5,
  },
];

const faqData = [
  { title: "Do you accommodate dietary restrictions?", description: "Absolutely. Our kitchen team is experienced with vegan, vegetarian, gluten-free, and allergy-specific preparations. Please inform us when you reserve and we will tailor your experience." },
  { title: "Is there a dress code?", description: "We ask guests to observe smart casual to formal attire. Jackets are encouraged for gentlemen but not required. We want every guest to feel comfortable and elegant." },
  { title: "Can I book a private event?", description: "Yes. Our private dining room seats up to 40 guests and is perfect for celebrations, corporate dinners, and intimate gatherings. Contact our events team for custom menus and pricing." },
  { title: "Do you offer takeout or delivery?", description: "We offer a curated takeout menu on weekends. Each dish is packaged with care to preserve the restaurant experience at home. Order by phone or through our website." },
  { title: "What is your cancellation policy?", description: "We kindly ask for 24 hours notice for cancellations. For parties of 6 or more, 48 hours notice is appreciated. A credit card hold may apply for large reservations." },
];

/* ═══════════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════════ */
export default function V2RestaurantPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <main
      className="relative min-h-[100dvh] overflow-x-hidden"
      style={{ background: BG, color: "#f1f5f9" }}
    >
      <FloatingEmbers />

      {/* ─── NAV ─── */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={spring}
        className="fixed top-0 left-0 right-0 z-50"
      >
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-4">
          <GlassCard className="flex items-center justify-between px-4 md:px-6 py-3">
            <div className="flex items-center gap-2">
              <ForkKnife size={24} weight="duotone" style={{ color: GOLD }} />
              <span className="text-lg font-bold tracking-tight text-white">
                Ember & Oak
              </span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
              <a href="#menu" className="hover:text-white transition-colors">Menu</a>
              <a href="#gallery" className="hover:text-white transition-colors">Gallery</a>
              <a href="#about" className="hover:text-white transition-colors">Our Story</a>
              <a href="#testimonials" className="hover:text-white transition-colors">Reviews</a>
            </div>
            <div className="flex items-center gap-3">
              <MagneticButton
                className="px-4 md:px-5 py-2 rounded-full text-sm font-semibold text-white transition-colors"
                style={{ background: RED } as React.CSSProperties}
              >
                Reserve a Table
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
                    { label: "Menu", href: "#menu" },
                    { label: "Gallery", href: "#gallery" },
                    { label: "Our Story", href: "#about" },
                    { label: "Reviews", href: "#testimonials" },
                    { label: "Reserve", href: "#reservation" },
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
      </motion.nav>

      {/* ─── 1. HERO ─── */}
      <section className="relative min-h-[100dvh] flex items-center pt-24 z-10">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1544025162-d76694265947?w=1400&q=80"
            alt="Restaurant ambiance"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0" style={{ background: `linear-gradient(to right, ${BG} 40%, transparent 100%)` }} />
          <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${BG} 10%, transparent 50%)` }} />
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          <div className="space-y-8">
            <motion.p initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ ...spring, delay: 0.1 }}
              className="text-sm uppercase tracking-widest" style={{ color: GOLD }}>
              Fine Dining Experience
            </motion.p>
            <h1 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white"
              style={{ textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>
              <WordReveal text="Where Fire Meets Flavor" />
            </h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.6 }}
              className="text-lg text-slate-300 max-w-md leading-relaxed">
              An intimate culinary journey crafted from the finest seasonal
              ingredients, open flame, and decades of passion. Every dish tells
              a story.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.8 }}
              className="flex flex-wrap gap-4">
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white flex items-center gap-2 cursor-pointer"
                style={{ background: RED } as React.CSSProperties}>
                Reserve a Table <ArrowRight size={18} weight="bold" />
              </MagneticButton>
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/10 flex items-center gap-2 cursor-pointer">
                <Phone size={18} weight="duotone" /> (555) 867-5309
              </MagneticButton>
            </motion.div>
          </div>
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ ...spring, delay: 0.3 }} className="hidden md:flex items-center justify-center lg:justify-end">
            <PlateSettingSVG />
          </motion.div>
        </div>
      </section>

      {/* ─── 2. MENU HIGHLIGHTS ─── */}
      <SectionReveal id="menu" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GOLD }}>
              Signature Dishes
            </p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="From Our Kitchen" />
            </h2>
          </div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
          >
            {menuHighlights.map((item, i) => (
              <motion.div key={i} variants={fadeUp}>
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  transition={springGentle}
                  style={{ willChange: "transform" }}
                >
                  <GlassCard className="overflow-hidden">
                    <div className="aspect-[4/3] overflow-hidden">
                      <img
                        src={item.photo}
                        alt={item.title}
                        className="w-full h-full object-cover object-center hover:scale-110 transition-transform duration-700"
                      />
                    </div>
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                        <span className="text-lg font-bold" style={{ color: GOLD }}>{item.price}</span>
                      </div>
                      <p className="text-sm text-slate-400 leading-relaxed">{item.description}</p>
                    </div>
                  </GlassCard>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── 3. ABOUT / CHEF STORY ─── */}
      <SectionReveal id="about" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="relative rounded-2xl overflow-hidden aspect-[4/5]">
              <img
                src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=700&q=80"
                alt="Head Chef in kitchen"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6">
                <p className="text-white font-semibold text-lg">Chef Marcus Laurent</p>
                <p className="text-slate-300 text-sm">Executive Chef, 20+ Years</p>
              </div>
            </div>
            <div>
              <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GOLD }}>
                Our Story
              </p>
              <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white mb-6">
                <WordReveal text="A Legacy of Flavor" />
              </h2>
              <div className="space-y-4 text-slate-400 leading-relaxed">
                <p>
                  Ember & Oak was born from a simple belief: that the best meals
                  happen when the finest ingredients meet an open flame and an
                  unwavering commitment to craft. Chef Marcus Laurent brings two
                  decades of Michelin-starred experience to every plate.
                </p>
                <p>
                  Our kitchen sources from local farms, sustainable fisheries,
                  and artisan purveyors. Every menu change reflects what is
                  freshest and most inspired. The result is a dining experience
                  that is deeply personal, seasonally driven, and always
                  memorable.
                </p>
              </div>
              <div className="mt-8 flex flex-wrap gap-6">
                {[
                  { value: "20+", label: "Years of Experience" },
                  { value: "4.9", label: "Average Rating" },
                  { value: "50K+", label: "Guests Served" },
                ].map((stat, i) => (
                  <div key={i}>
                    <p className="text-2xl font-bold" style={{ color: GOLD }}>{stat.value}</p>
                    <p className="text-sm text-slate-500">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* ─── 4. GALLERY ─── */}
      <SectionReveal id="gallery" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GOLD }}>
              Visual Journey
            </p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="A Feast for the Eyes" />
            </h2>
          </div>

          <motion.div
            className="grid grid-cols-2 md:grid-cols-3 gap-4"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
          >
            {galleryPhotos.map((photo, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className={`rounded-2xl overflow-hidden ${i === 0 ? "md:row-span-2" : ""}`}
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={springGentle}
                  className="w-full h-full"
                  style={{ willChange: "transform" }}
                >
                  <img
                    src={photo.src}
                    alt={photo.alt}
                    className={`w-full object-cover object-center ${i === 0 ? "h-full" : "aspect-square"}`}
                  />
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── 5. SPECIALS ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GOLD }}>
                Weekly Features
              </p>
              <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white mb-6">
                <WordReveal text="This Week at Ember" />
              </h2>
              <p className="text-slate-400 leading-relaxed max-w-md mb-8">
                Our chef creates limited specials each week using peak-season
                ingredients. Available while they last.
              </p>
            </div>

            <motion.div
              className="space-y-4"
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
            >
              {[
                { day: "Tuesday", name: "Truffle Risotto Night", desc: "Black truffle shaved tableside", icon: CookingPot },
                { day: "Thursday", name: "Seafood Tower", desc: "Oysters, crab, lobster, and shrimp", icon: Fire },
                { day: "Saturday", name: "Chef's Tasting Menu", desc: "7-course journey with wine pairings", icon: Wine },
              ].map((special, i) => (
                <motion.div key={i} variants={fadeUp}>
                  <GlassCard className="p-5 flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: RED_GLOW }}
                    >
                      <special.icon size={24} weight="duotone" style={{ color: RED }} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-white">{special.name}</p>
                      <p className="text-xs text-slate-400">{special.desc}</p>
                    </div>
                    <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ background: GOLD_GLOW, color: GOLD }}>
                      {special.day}
                    </span>
                  </GlassCard>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </SectionReveal>

      {/* ─── 6. TESTIMONIALS ─── */}
      <SectionReveal id="testimonials" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GOLD }}>
              Guest Experiences
            </p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="What Our Guests Say" />
            </h2>
          </div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
          >
            {testimonials.map((t, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="p-6 h-full flex flex-col">
                  <Quotes size={28} weight="fill" style={{ color: GOLD }} className="mb-3 opacity-50" />
                  <p className="text-slate-300 leading-relaxed flex-1 text-sm">{t.text}</p>
                  <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                    <span className="text-sm font-semibold text-white">{t.name}</span>
                    <div className="flex gap-0.5">
                      {Array.from({ length: t.rating }).map((_, j) => (
                        <Star key={j} size={12} weight="fill" style={{ color: GOLD }} />
                      ))}
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── 7. HOURS & LOCATION ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GOLD }}>
                Visit Us
              </p>
              <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white mb-8">
                <WordReveal text="Hours & Location" />
              </h2>
              <GlassCard className="p-6 space-y-4">
                <div className="flex items-start gap-4">
                  <Clock size={20} weight="duotone" style={{ color: GOLD }} className="mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-white">Dinner Service</p>
                    <p className="text-sm text-slate-400">
                      Tuesday - Thursday: 5:00 PM - 10:00 PM<br />
                      Friday - Saturday: 5:00 PM - 11:00 PM<br />
                      Sunday: 4:00 PM - 9:00 PM<br />
                      Monday: Closed
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <MapPin size={20} weight="duotone" style={{ color: GOLD }} className="mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-white">Location</p>
                    <p className="text-sm text-slate-400">742 Ember Lane, Portland, OR 97205</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Phone size={20} weight="duotone" style={{ color: GOLD }} className="mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-white">Reservations</p>
                    <p className="text-sm text-slate-400">(555) 867-5309</p>
                  </div>
                </div>
              </GlassCard>
            </div>

            <div className="rounded-2xl overflow-hidden aspect-[4/3]">
              <img
                src="https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800&q=80"
                alt="Restaurant exterior at night"
                className="w-full h-full object-cover object-center"
              />
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* ─── 8. PRIVATE EVENTS ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 30% 50%, ${RED_GLOW} 0%, transparent 50%), radial-gradient(circle at 70% 50%, ${GOLD_GLOW} 0%, transparent 50%)`,
          }} />
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="rounded-2xl overflow-hidden aspect-[4/3]">
              <img
                src="https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=800&q=80"
                alt="Private dining event"
                className="w-full h-full object-cover object-center"
              />
            </div>
            <div>
              <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GOLD }}>
                Private Events
              </p>
              <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white mb-6">
                <WordReveal text="Celebrate With Us" />
              </h2>
              <p className="text-slate-400 leading-relaxed mb-6">
                Our private dining room offers an exclusive setting for your most
                important occasions. Custom menus, dedicated service staff, and
                curated wine selections create an unforgettable experience for up
                to 40 guests.
              </p>
              <motion.div
                className="grid grid-cols-2 gap-4"
                variants={stagger}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
              >
                {[
                  { icon: Champagne, label: "Custom Menus" },
                  { icon: Users, label: "Up to 40 Guests" },
                  { icon: Wine, label: "Wine Pairings" },
                  { icon: Leaf, label: "Seasonal Options" },
                ].map((item, i) => (
                  <motion.div key={i} variants={fadeUp}>
                    <GlassCard className="p-4 text-center">
                      <item.icon size={24} weight="duotone" style={{ color: GOLD }} className="mx-auto mb-2" />
                      <p className="text-sm font-semibold text-white">{item.label}</p>
                    </GlassCard>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* ─── 9. FAQ ─── */}
      <SectionReveal id="faq" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            <div className="lg:sticky lg:top-32">
              <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GOLD }}>
                Common Questions
              </p>
              <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white mb-6">
                <WordReveal text="Frequently Asked" />
              </h2>
              <p className="text-slate-400 leading-relaxed max-w-md">
                Everything you need to know before your visit. If you have
                additional questions, our team is always happy to help.
              </p>
            </div>

            <motion.div
              className="space-y-3"
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-50px" }}
            >
              {faqData.map((faq, i) => (
                <motion.div key={i} variants={fadeUp}>
                  <AccordionItem
                    title={faq.title}
                    description={faq.description}
                    isOpen={openFaq === i}
                    onToggle={() => setOpenFaq(openFaq === i ? null : i)}
                  />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </SectionReveal>

      {/* ─── 10. RESERVATION FORM CTA ─── */}
      <SectionReveal id="reservation" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4 md:px-6">
          <ShimmerBorder>
            <div className="p-8 md:p-12 text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={spring}
              >
                <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GOLD }}>
                  Join Us Tonight
                </p>
                <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white mb-4">
                  Reserve Your Table
                </h2>
                <p className="text-slate-400 text-lg mb-8 max-w-lg mx-auto">
                  Secure your evening at Ember & Oak. Walk-ins are welcome but
                  reservations are recommended, especially on weekends.
                </p>
                <div className="flex flex-wrap gap-4 justify-center">
                  <MagneticButton
                    className="px-10 py-4 rounded-full text-base font-semibold text-white inline-flex items-center gap-2 cursor-pointer"
                    style={{ background: RED } as React.CSSProperties}
                  >
                    <CalendarCheck size={20} weight="duotone" />
                    Book Online
                  </MagneticButton>
                  <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/10 flex items-center gap-2 cursor-pointer">
                    <Phone size={18} weight="duotone" />
                    Call to Reserve
                  </MagneticButton>
                </div>
              </motion.div>
            </div>
          </ShimmerBorder>
        </div>
      </SectionReveal>

      {/* ─── FOOTER ─── */}
      <footer className="relative z-10 border-t border-white/5 py-8">
        <div className="mx-auto max-w-7xl px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <ForkKnife size={16} weight="duotone" style={{ color: GOLD }} />
            <span>Ember & Oak &copy; {new Date().getFullYear()}</span>
          </div>
          <p className="text-xs text-slate-600">
            Created by <a href="https://bluejayportfolio.com" target="_blank" rel="noopener noreferrer" style={{textDecoration:"underline"}}>bluejayportfolio.com</a>
          </p>
        </div>
      </footer>
    </main>
  );
}
