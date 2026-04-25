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
  PaintRoller,
  PaintBucket,
  House,
  Buildings,
  Palette,
  Phone,
  MapPin,
  Clock,
  ArrowRight,
  CaretDown,
  Quotes,
  CalendarCheck,
  CheckCircle,
  Wrench,
  ShieldCheck,
  X,
  List,
  Drop,
  Eye,
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
const BG = "#0f0a1e";
const PURPLE = "#8b5cf6";
const PURPLE_LIGHT = "#a78bfa";
const PURPLE_GLOW = "rgba(139, 92, 246, 0.15)";
const SPLASH_PINK = "#ec4899";
const SPLASH_BLUE = "#3b82f6";

/* ───────────────────────── FLOATING PAINT DROPS ───────────────────────── */
function FloatingPaintDrops() {
  const particles = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 8,
    duration: 6 + Math.random() * 6,
    size: 3 + Math.random() * 5,
    opacity: 0.15 + Math.random() * 0.35,
    color: [PURPLE_LIGHT, SPLASH_PINK, SPLASH_BLUE, "#facc15"][Math.floor(Math.random() * 4)],
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
            height: p.size * 1.3,
            background: p.color,
            borderRadius: "50% 50% 50% 50% / 40% 40% 60% 60%",
            willChange: "transform, opacity",
          }}
          animate={{
            y: ["-10vh", "110vh"],
            rotate: [0, 180],
            opacity: [0, p.opacity, p.opacity, 0],
          }}
          transition={{
            y: { duration: p.duration, repeat: Infinity, delay: p.delay, ease: "linear" },
            rotate: { duration: p.duration, repeat: Infinity, delay: p.delay, ease: "linear" },
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
function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-white/15 bg-white/[0.08] backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] ${className}`}>
      {children}
    </div>
  );
}

/* ───────────────────────── MAGNETIC BUTTON ───────────────────────── */
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

/* ───────────────────────── SHIMMER BORDER ───────────────────────── */
function ShimmerBorder({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative rounded-2xl p-[1px] overflow-hidden ${className}`}>
      <motion.div className="absolute inset-0 rounded-2xl" style={{ background: `conic-gradient(from 0deg, transparent, ${PURPLE}, transparent, ${SPLASH_PINK}, transparent)`, willChange: "transform" }} animate={{ rotate: [0, 360] }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} />
      <div className="relative rounded-2xl z-10" style={{ background: BG }}>{children}</div>
    </div>
  );
}

/* ───────────────────────── PAINT ROLLER SVG ───────────────────────── */
function PaintRollerSVG() {
  return (
    <div className="relative flex items-center justify-center">
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{ background: `radial-gradient(circle, ${PURPLE_GLOW} 0%, transparent 70%)`, filter: "blur(40px)" }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      <svg viewBox="0 0 200 240" className="relative z-10 w-48 h-56 md:w-56 md:h-72" fill="none">
        <motion.circle cx="100" cy="115" r="92" stroke={PURPLE} strokeWidth="0.5" opacity={0.12}
          animate={{ r: [90, 94, 90] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} />

        {/* Paint roller - main cylinder */}
        <motion.rect x="45" y="40" width="110" height="35" rx="17" fill={`${PURPLE}22`} stroke={PURPLE} strokeWidth="2.5"
          initial={{ scaleX: 0, opacity: 0 }} animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "backOut" }} />
        <rect x="52" y="45" width="96" height="22" rx="11" fill={`${PURPLE}0d`} />

        {/* Roller texture lines */}
        {[60, 72, 84, 96, 108, 120, 132, 144].map((x, i) => (
          <motion.line key={i} x1={x} y1="45" x2={x} y2="70" stroke={PURPLE_LIGHT} strokeWidth="0.5" opacity={0.3}
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.8 + i * 0.05 }} />
        ))}

        {/* Handle connection */}
        <motion.path d="M100 75 L100 95 Q100 105 110 105 L120 105"
          stroke={PURPLE} strokeWidth="3" fill="none" strokeLinecap="round"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6, delay: 0.8 }} />

        {/* Handle grip */}
        <motion.rect x="120" y="95" width="45" height="20" rx="10" fill={`${PURPLE}18`} stroke={PURPLE} strokeWidth="2"
          initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} style={{ transformOrigin: "left center" }}
          transition={{ duration: 0.5, delay: 1.2 }} />
        <rect x="125" y="99" width="35" height="12" rx="6" fill={`${PURPLE}0d`} />

        {/* Paint drips from roller */}
        <motion.path d="M60 75 C60 75 58 95 62 110 C64 118 60 120 60 120"
          stroke={SPLASH_PINK} strokeWidth="2" strokeLinecap="round" fill={`${SPLASH_PINK}15`}
          initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 0.7 }}
          transition={{ duration: 1, delay: 1.5, ease: "easeOut" }} />
        <motion.circle cx="60" cy="122" r="4" fill={`${SPLASH_PINK}44`}
          initial={{ scale: 0 }} animate={{ scale: [0, 1.2, 1] }}
          transition={{ delay: 2.3, duration: 0.5 }} />

        <motion.path d="M85 75 C85 75 83 100 87 120 C89 130 85 135 85 135"
          stroke={SPLASH_BLUE} strokeWidth="2" strokeLinecap="round" fill={`${SPLASH_BLUE}15`}
          initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 0.7 }}
          transition={{ duration: 1.2, delay: 1.7, ease: "easeOut" }} />
        <motion.circle cx="85" cy="137" r="5" fill={`${SPLASH_BLUE}44`}
          initial={{ scale: 0 }} animate={{ scale: [0, 1.3, 1] }}
          transition={{ delay: 2.5, duration: 0.5 }} />

        <motion.path d="M115 75 C115 75 117 92 113 108"
          stroke={PURPLE_LIGHT} strokeWidth="2" strokeLinecap="round" fill="none"
          initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 0.6 }}
          transition={{ duration: 0.8, delay: 1.9, ease: "easeOut" }} />
        <motion.circle cx="113" cy="110" r="3.5" fill={`${PURPLE_LIGHT}44`}
          initial={{ scale: 0 }} animate={{ scale: [0, 1.2, 1] }}
          transition={{ delay: 2.4, duration: 0.5 }} />

        {/* Color palette at bottom */}
        <motion.circle cx="50" cy="175" r="12" fill={`${SPLASH_PINK}22`} stroke={SPLASH_PINK} strokeWidth="1.5"
          initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 2.5, ease: "backOut" }} />
        <circle cx="50" cy="173" r="6" fill={`${SPLASH_PINK}0d`} />
        <motion.circle cx="85" cy="180" r="14" fill={`${PURPLE}22`} stroke={PURPLE} strokeWidth="1.5"
          initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 2.6, ease: "backOut" }} />
        <circle cx="85" cy="177" r="7" fill={`${PURPLE}0d`} />
        <motion.circle cx="120" cy="175" r="12" fill={`${SPLASH_BLUE}22`} stroke={SPLASH_BLUE} strokeWidth="1.5"
          initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 2.7, ease: "backOut" }} />
        <circle cx="120" cy="173" r="6" fill={`${SPLASH_BLUE}0d`} />
        <motion.circle cx="150" cy="178" r="10" fill="#facc1522" stroke="#facc15" strokeWidth="1.5"
          initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 2.8, ease: "backOut" }} />
        <circle cx="150" cy="176" r="5" fill="#facc150d" />

        {/* Sparkle accents */}
        <motion.circle cx="170" cy="30" r="3" fill={PURPLE_LIGHT}
          animate={{ opacity: [0.2, 1, 0.2], scale: [0.7, 1.3, 0.7] }}
          transition={{ duration: 2.5, repeat: Infinity }} />
        <motion.circle cx="25" cy="55" r="2" fill={SPLASH_PINK}
          animate={{ opacity: [0.1, 0.8, 0.1], scale: [0.5, 1.2, 0.5] }}
          transition={{ duration: 3, repeat: Infinity, delay: 0.8 }} />
        <motion.circle cx="180" cy="120" r="2.5" fill={SPLASH_BLUE}
          animate={{ opacity: [0.15, 0.7, 0.15] }}
          transition={{ duration: 2, repeat: Infinity, delay: 1.2 }} />
        <motion.circle cx="20" cy="140" r="2" fill={PURPLE_LIGHT}
          animate={{ opacity: [0.1, 0.6, 0.1] }}
          transition={{ duration: 2.5, repeat: Infinity, delay: 0.4 }} />
      </svg>
    </div>
  );
}

/* ───────────────────────── ACCORDION ───────────────────────── */
function AccordionItem({ title, description, isOpen, onToggle }: { title: string; description: string; isOpen: boolean; onToggle: () => void }) {
  return (
    <GlassCard className="overflow-hidden">
      <button onClick={onToggle} className="w-full flex items-center justify-between p-5 md:p-6 text-left group cursor-pointer">
        <span className="text-lg font-semibold text-white">{title}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={spring}><CaretDown size={20} className="text-slate-400" /></motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={spring} className="overflow-hidden">
            <p className="px-5 pb-5 md:px-6 md:pb-6 text-slate-400 leading-relaxed">{description}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
}

/* ───────────────────────── DATA ───────────────────────── */
const services = [
  { title: "Interior Painting", description: "Walls, ceilings, trim, and accent walls with premium zero-VOC paints. Flawless prep, clean edges, and furniture protection included.", icon: House },
  { title: "Exterior Painting", description: "Complete exterior transformations including siding, fascia, soffits, and shutters. Weather-resistant coatings that last 10+ years.", icon: Buildings },
  { title: "Commercial Painting", description: "Office spaces, retail stores, warehouses, and restaurants. We work around your schedule to minimize disruption to your business.", icon: Buildings },
  { title: "Deck Staining", description: "Restore and protect your outdoor living spaces with professional-grade stains and sealants. Pressure washing and prep included.", icon: Wrench },
  { title: "Cabinet Refinishing", description: "Transform your kitchen without a full remodel. Sanding, priming, painting, and new hardware installation for a fraction of the cost.", icon: PaintBucket },
  { title: "Color Consulting", description: "Not sure what colors to choose? Our certified color consultants help you find the perfect palette for your space and style.", icon: Palette },
];

const stats = [
  { value: "2,500+", label: "Projects Completed" },
  { value: "15+", label: "Years in Business" },
  { value: "4.9", label: "Star Rating" },
  { value: "100%", label: "Satisfaction Guarantee" },
];

const galleryPhotos = [
  { src: "https://images.unsplash.com/photo-1717281234297-3def5ae3eee1?w=600&q=80", alt: "Painter rolling fresh coat on wall" },
  { src: "https://images.unsplash.com/photo-1574359411659-15573a27fd0c?w=600&q=80", alt: "Exterior house painting" },
  { src: "https://images.unsplash.com/photo-1671681739893-e8d027788284?w=600&q=80", alt: "Painter finishing a colored wall" },
  { src: "https://images.unsplash.com/photo-1613844044163-1ad2f2d0b152?w=600&q=80", alt: "Painter on ladder on exterior" },
  { src: "https://images.unsplash.com/photo-1688372198189-de6a51777a81?w=600&q=80", alt: "Professional painter at work" },
  { src: "https://images.unsplash.com/photo-1742900280864-bcc27353ceba?w=600&q=80", alt: "Exterior painter with roller pole" },
];

const processSteps = [
  { step: "01", title: "Free Consultation", description: "We visit your property, discuss your vision, and provide a detailed written estimate with no obligations." },
  { step: "02", title: "Color Selection", description: "Our color consultant helps you choose the perfect palette. We provide large samples so you can see colors in your lighting." },
  { step: "03", title: "Surface Preparation", description: "Thorough cleaning, sanding, patching, priming, and taping. Prep is 80% of a great paint job and we never cut corners." },
  { step: "04", title: "Professional Application", description: "Two premium coats applied with precision. We protect your floors, furniture, and landscaping throughout the process." },
  { step: "05", title: "Final Walkthrough", description: "We walk through every room with you, touch up any imperfections, and make sure you are completely satisfied before we leave." },
];

const testimonials = [
  { name: "Karen & Steve H.", text: "They transformed our entire first floor in just three days. The attention to detail was incredible — perfect lines, zero mess. Our home feels brand new.", rating: 5 },
  { name: "David L.", text: "I hired them for a commercial repaint of our restaurant. They worked overnight so we never had to close. Professional, fast, and the result is stunning.", rating: 5 },
  { name: "Michelle T.", text: "The color consulting service was worth every penny. They helped us pick the perfect palette and the execution was flawless. We get compliments daily.", rating: 5 },
];

const faqData = [
  { title: "How long does a typical interior paint job take?", description: "Most residential interiors are completed in 2-4 days depending on scope. A single room can often be done in one day. We provide a timeline in our estimate so you know exactly what to expect." },
  { title: "What type of paint do you use?", description: "We use premium, low-VOC and zero-VOC paints from Sherwin-Williams and Benjamin Moore. These provide superior coverage, durability, and are safe for your family and pets." },
  { title: "Do you move furniture?", description: "Yes. We carefully move and cover all furniture. Large items are shifted to the center of the room and covered with drop cloths. Everything is returned to its original position when we finish." },
  { title: "Is your work guaranteed?", description: "Absolutely. We offer a 3-year workmanship warranty on all interior projects and a 5-year warranty on exteriors. If anything peels, chips, or blisters due to our work, we fix it free of charge." },
  { title: "How soon can you start?", description: "We typically begin within 1-2 weeks of signing the estimate. For urgent projects, we can often accommodate rush scheduling. Contact us for current availability." },
];

/* ═══════════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════════ */
export default function V2PaintingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden" style={{ background: BG, color: "#f1f5f9" }}>
      <FloatingPaintDrops />

      {/* ─── NAV ─── */}
      <motion.nav initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-4">
          <GlassCard className="flex items-center justify-between px-4 md:px-6 py-3">
            <div className="flex items-center gap-2">
              <PaintRoller size={24} weight="duotone" style={{ color: PURPLE }} />
              <span className="text-lg font-bold tracking-tight text-white">Spectrum Painting</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
              <a href="#services" className="hover:text-white transition-colors">Services</a>
              <a href="#gallery" className="hover:text-white transition-colors">Gallery</a>
              <a href="#process" className="hover:text-white transition-colors">Process</a>
              <a href="#testimonials" className="hover:text-white transition-colors">Reviews</a>
            </div>
            <div className="flex items-center gap-3">
              <MagneticButton className="px-4 md:px-5 py-2 rounded-full text-sm font-semibold text-white transition-colors" style={{ background: PURPLE } as React.CSSProperties}>
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
                  {[{ label: "Services", href: "#services" }, { label: "Gallery", href: "#gallery" }, { label: "Process", href: "#process" }, { label: "Reviews", href: "#testimonials" }, { label: "Free Estimate", href: "#estimate" }].map((link) => (
                    <a key={link.label} href={link.href} onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors">{link.label}</a>
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
          <img src="https://images.unsplash.com/photo-1595640115473-714d7e80cb48?w=1400&q=80" alt="Professional painter at work" className="w-full h-full object-cover object-center" />
          <div className="absolute inset-0" style={{ background: `linear-gradient(to right, ${BG} 45%, transparent 100%)` }} />
          <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${BG} 10%, transparent 50%)` }} />
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          <div className="space-y-8">
            <motion.p initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ ...spring, delay: 0.1 }} className="text-sm uppercase tracking-widest" style={{ color: PURPLE }}>
              Professional Painting Contractors
            </motion.p>
            <h1 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white" style={{ textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>
              <WordReveal text="Transform Every Surface" />
            </h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.6 }} className="text-lg text-slate-300 max-w-md leading-relaxed">
              Premium residential and commercial painting with meticulous
              preparation, expert color consulting, and a 100% satisfaction
              guarantee on every project.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.8 }} className="flex flex-wrap gap-4">
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white flex items-center gap-2 cursor-pointer" style={{ background: PURPLE } as React.CSSProperties}>
                Get Free Estimate <ArrowRight size={18} weight="bold" />
              </MagneticButton>
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/15 flex items-center gap-2 cursor-pointer">
                <Phone size={18} weight="duotone" /> (206) 743-2190
              </MagneticButton>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ ...spring, delay: 1 }} className="flex flex-wrap gap-3">
              {/* fictional license — replace per-prospect on signup */}
              <span className="px-4 py-2 rounded-full text-xs font-semibold text-white flex items-center gap-2" style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${PURPLE}50` }}><ShieldCheck size={14} weight="duotone" style={{ color: PURPLE_LIGHT }} />WA L&amp;I #PAINTPC783LM</span>
              <span className="px-4 py-2 rounded-full text-xs font-semibold text-white flex items-center gap-2" style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${SPLASH_PINK}50` }}><Star size={14} weight="fill" style={{ color: SPLASH_PINK }} />4.9-Star Rated</span>
              <span className="px-4 py-2 rounded-full text-xs font-semibold text-white flex items-center gap-2" style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${SPLASH_BLUE}50` }}><CheckCircle size={14} weight="duotone" style={{ color: SPLASH_BLUE }} />Free Color Consultation</span>
              <span className="px-4 py-2 rounded-full text-xs font-semibold text-white flex items-center gap-2" style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${PURPLE}50` }}><ShieldCheck size={14} weight="duotone" style={{ color: PURPLE_LIGHT }} />5-Year Warranty</span>
            </motion.div>
          </div>
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ ...spring, delay: 0.3 }} className="hidden md:flex items-center justify-center lg:justify-end">
            <PaintRollerSVG />
          </motion.div>
        </div>
      </section>

      {/* ─── 2. STATS ─── */}
      <SectionReveal className="relative z-10 pb-8">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <GlassCard className="p-6 md:p-8">
            <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
              {stats.map((stat, i) => (
                <motion.div key={i} variants={fadeUp} className="text-center">
                  <p className="text-3xl md:text-4xl font-bold" style={{ color: PURPLE }}>{stat.value}</p>
                  <p className="text-sm text-slate-400 mt-1">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </GlassCard>
        </div>
      </SectionReveal>

      {/* ─── 3. SERVICES ─── */}
      <SectionReveal id="services" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: PURPLE }}>Our Services</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Every Surface, Perfected" />
            </h2>
          </div>
          <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {services.map((svc, i) => (
              <motion.div key={i} variants={fadeUp}>
                <motion.div whileHover={{ scale: 1.03 }} transition={springGentle} style={{ willChange: "transform" }}>
                  <GlassCard className="p-6 h-full">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: PURPLE_GLOW }}>
                      <svc.icon size={24} weight="duotone" style={{ color: PURPLE }} />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{svc.title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{svc.description}</p>
                  </GlassCard>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── 4. PROJECT GALLERY ─── */}
      <SectionReveal id="gallery" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: PURPLE }}>Our Work</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Our Recent Work" />
            </h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="rounded-2xl overflow-hidden">
              <img src="https://images.unsplash.com/photo-1655665151765-98a95126ba41?w=800&q=80" alt="Interior painting project" className="w-full aspect-[16/10] object-cover" />
            </div>
            <div className="rounded-2xl overflow-hidden">
              <img src="https://images.unsplash.com/photo-1761986757577-140af8859587?w=800&q=80" alt="Exterior painting project" className="w-full aspect-[16/10] object-cover" />
            </div>
          </div>
          <motion.div className="grid grid-cols-2 md:grid-cols-3 gap-4" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {galleryPhotos.map((photo, i) => (
              <motion.div key={i} variants={fadeUp} className="rounded-2xl overflow-hidden">
                <motion.div whileHover={{ scale: 1.05 }} transition={springGentle} style={{ willChange: "transform" }}>
                  <img src={photo.src} alt={photo.alt} className="w-full aspect-square object-cover object-center" />
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── 5. ABOUT ─── */}
      <SectionReveal id="about" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="rounded-2xl overflow-hidden aspect-[4/5]">
              <img src="https://plus.unsplash.com/premium_photo-1723867371537-a185781be154?w=700&q=80" alt="Painting team at work" className="w-full h-full object-cover object-top" />
            </div>
            <div>
              <p className="text-sm uppercase tracking-widest mb-3" style={{ color: PURPLE }}>About Spectrum</p>
              <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white mb-6">
                <WordReveal text="Craft Meets Color" />
              </h2>
              <div className="space-y-4 text-slate-400 leading-relaxed">
                <p>
                  Spectrum Painting has served homeowners and businesses for over
                  15 years with a simple promise: impeccable preparation,
                  premium materials, and craftsmanship you can see in every
                  brushstroke.
                </p>
                <p>
                  Our team of certified painters is trained in the latest
                  techniques and committed to leaving your space cleaner than
                  we found it. From color selection to final walkthrough, we
                  handle every detail.
                </p>
              </div>
              <div className="mt-8 flex flex-wrap gap-4">
                {[
                  { icon: ShieldCheck, label: "Licensed & Insured" },
                  { icon: CheckCircle, label: "3-5 Year Warranty" },
                  { icon: Drop, label: "Zero-VOC Paints" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <item.icon size={18} weight="duotone" style={{ color: PURPLE }} />
                    <span className="text-sm text-slate-300">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* ─── 6. PROCESS ─── */}
      <SectionReveal id="process" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: PURPLE }}>How It Works</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Our Proven Process" />
            </h2>
          </div>
          <motion.div className="space-y-4" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {processSteps.map((step, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="p-6 flex items-start gap-6">
                  <div className="text-3xl font-bold shrink-0" style={{ color: PURPLE, opacity: 0.5 }}>{step.step}</div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">{step.title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{step.description}</p>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── GOOGLE REVIEWS HEADER ─── */}
      <SectionReveal className="relative z-10 py-8">
        <div className="mx-auto max-w-4xl px-4 md:px-6">
          <GlassCard className="px-6 py-5 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
            <div className="flex items-center gap-3">
              <svg width="32" height="32" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
              </svg>
              <div className="text-left">
                <p className="text-sm text-slate-400">Google Reviews</p>
                <p className="text-lg font-bold text-white">Homeowner Ratings</p>
              </div>
            </div>
            <div className="hidden sm:block w-px h-12 bg-white/10" />
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                {[0,1,2,3,4].map((i) => (<Star key={i} size={20} weight="fill" style={{ color: SPLASH_PINK }} />))}
              </div>
              <p className="text-sm text-slate-400"><span className="text-white font-bold">4.9</span> out of 5 &bull; <span className="text-white font-bold">276</span> reviews</p>
            </div>
          </GlassCard>
        </div>
      </SectionReveal>

      {/* ─── 7. TESTIMONIALS ─── */}
      <SectionReveal id="testimonials" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: PURPLE }}>Client Reviews</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="What Our Clients Say" />
            </h2>
          </div>
          <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {testimonials.map((t, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="p-6 h-full flex flex-col relative overflow-hidden">
                  <Quotes size={60} weight="fill" style={{ color: PURPLE }} className="absolute -top-2 -right-2 opacity-10" />
                  <Quotes size={28} weight="fill" style={{ color: PURPLE }} className="mb-3 opacity-60" />
                  <p className="text-slate-300 leading-relaxed flex-1 text-sm">{t.text}</p>
                  <div className="mt-4 pt-4 border-t border-white/8 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">{t.name}</span>
                      <CheckCircle size={14} weight="fill" style={{ color: PURPLE_LIGHT }} />
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider">Verified</span>
                    </div>
                    <div className="flex gap-0.5">{Array.from({ length: t.rating }).map((_, j) => (<Star key={j} size={18} weight="fill" style={{ color: SPLASH_PINK }} />))}</div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── INTERIOR/EXTERIOR TIERS ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 60% 40% at 50% 50%, ${PURPLE_GLOW} 0%, transparent 70%)` }} />
        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: PURPLE }}>Service Tiers</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white"><WordReveal text="Interior, Exterior & Specialty" /></h2>
            <p className="text-slate-400 mt-4 max-w-2xl mx-auto">Upfront pricing per room and per square foot. Exact quote after a free in-home estimate with color consultation.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "Interior Room", price: "$550 – $950", desc: "Full interior room repaint — walls, trim, doors, and ceiling prep included.", features: ["Walls + trim + ceiling", "Full prep + patching", "Premium Sherwin/Benjamin Moore", "2-coat application", "Drop cloth + furniture move"], highlight: false },
              { name: "Whole House Exterior", price: "$4,500 – $9,800", desc: "Power wash, prep, 2-coat exterior on siding, trim, doors, and shutters.", features: ["Full power wash + prep", "Scrape + prime bare wood", "2 coats premium paint", "5-year warranty", "Most homes: 3–5 days"], highlight: true },
              { name: "Cabinet Refinishing", price: "$2,800 – $6,500", desc: "Transform kitchen or bath without replacing — spray finish looks factory-new.", features: ["Doors removed + sprayed off-site", "Full surface prep + grain fill", "Factory-quality spray", "Soft-close hinge upgrade", "3-year warranty"], highlight: false },
            ].map((tier, i) => (
              <div key={i} className={`relative rounded-2xl ${tier.highlight ? 'p-[2px]' : ''}`} style={tier.highlight ? { background: `linear-gradient(135deg, ${PURPLE}, ${SPLASH_PINK})` } : {}}>
                {tier.highlight && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white" style={{ background: PURPLE }}>Most Popular</div>}
                <GlassCard className="p-6 h-full">
                  <h3 className="text-xl font-bold text-white">{tier.name}</h3>
                  <p className="text-xs text-slate-400 mt-1">{tier.desc}</p>
                  <div className="mt-6 flex items-end gap-1">
                    <span className="text-4xl font-black text-white">{tier.price}</span>
                  </div>
                  <ul className="mt-6 space-y-3">
                    {tier.features.map((f, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-slate-300">
                        <CheckCircle size={18} weight="fill" style={{ color: tier.highlight ? SPLASH_PINK : PURPLE_LIGHT }} className="shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <button className="mt-6 w-full px-6 py-3 rounded-full text-sm font-semibold text-white" style={{ background: tier.highlight ? PURPLE : "rgba(255,255,255,0.05)", border: tier.highlight ? "none" : "1px solid rgba(255,255,255,0.1)" }}>Get Estimate</button>
                </GlassCard>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-slate-500 mt-8">Financing available — 0% for 12 months on projects over $5K with approved credit.</p>
        </div>
      </SectionReveal>

      {/* ─── COLOR CONSULT ─── */}
      <SectionReveal className="relative z-10 py-8">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <GlassCard className="p-6 md:p-8 flex flex-col md:flex-row items-center gap-6">
            <div className="relative shrink-0">
              <motion.div className="absolute inset-0 rounded-full" style={{ background: SPLASH_PINK }} animate={{ scale: [1, 1.6, 1], opacity: [0.5, 0, 0.5] }} transition={{ duration: 2, repeat: Infinity }} />
              <div className="relative w-4 h-4 rounded-full" style={{ background: SPLASH_PINK }} />
            </div>
            <div className="flex-1 text-center md:text-left">
              <p className="text-xs uppercase tracking-widest mb-1" style={{ color: SPLASH_PINK }}>Free With Every Quote</p>
              <h3 className="text-2xl md:text-3xl font-bold text-white">Professional Color Consultation Included</h3>
              <p className="text-sm text-slate-400 mt-2">Our certified color consultants bring physical swatches to your home, consider your lighting, and help you pick the perfect palette — free.</p>
            </div>
            <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white flex items-center gap-2 shrink-0 cursor-pointer" style={{ background: PURPLE } as React.CSSProperties}>
              <CalendarCheck size={18} weight="duotone" /> Book Consultation
            </MagneticButton>
          </GlassCard>
        </div>
      </SectionReveal>

      {/* ─── VIDEO ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: PURPLE }}>On The Job</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white"><WordReveal text="See A Project Transformation" /></h2>
          </div>
          <div className="relative rounded-2xl overflow-hidden aspect-video group cursor-pointer">
            <img src="https://images.unsplash.com/photo-1700588080759-fcc5f249c321?w=1600&q=80" alt="Freshly painted interior" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div className="w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center shadow-2xl" style={{ background: PURPLE } as React.CSSProperties} animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
                <svg width="28" height="32" viewBox="0 0 24 28" fill="white" className="ml-1">
                  <path d="M0 0L24 14L0 28Z" />
                </svg>
              </motion.div>
            </div>
            <div className="absolute bottom-6 left-6 right-6">
              <p className="text-xs uppercase tracking-widest" style={{ color: SPLASH_PINK }}>Whole Interior &bull; 4:05</p>
              <p className="text-xl md:text-2xl font-bold text-white mt-1">Watch a full interior repaint from prep day to final reveal — including color consult.</p>
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* ─── QUIZ ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="relative z-10 mx-auto max-w-5xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: PURPLE }}>Project Scope</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white"><WordReveal text="What Are You Painting?" /></h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { color: PURPLE, label: "Interior Rooms", detail: "One or more rooms, hallways, trim, or a full interior refresh. Usually 2–5 days.", rec: "Interior Package + Color Consult", icon: Palette },
              { color: SPLASH_PINK, label: "Whole House", detail: "Exterior siding, trim, doors, shutters — full house repaint. 5-year warranty.", rec: "Exterior Package — 3 to 5 days", icon: ShieldCheck },
              { color: SPLASH_BLUE, label: "Cabinets / Specialty", detail: "Kitchen cabinets, deck staining, wrought iron, or a specific accent project.", rec: "Specialty Refinishing Quote", icon: Palette },
            ].map((opt, i) => (
              <GlassCard key={i} className="p-6 h-full flex flex-col items-start relative overflow-hidden group cursor-pointer">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: `radial-gradient(circle at 50% 0%, ${opt.color}22, transparent 60%)` }} />
                <div className="relative w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: `${opt.color}22` }}>
                  <opt.icon size={22} weight="duotone" style={{ color: opt.color }} />
                </div>
                <p className="relative text-xs uppercase tracking-widest font-bold" style={{ color: opt.color }}>{opt.label}</p>
                <p className="relative text-sm text-slate-300 mt-2 leading-relaxed flex-1">{opt.detail}</p>
                <div className="relative mt-6 pt-4 border-t border-white/15 w-full">
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-1">We Recommend</p>
                  <p className="text-sm font-semibold text-white">{opt.rec}</p>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ─── COMPARISON ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: PURPLE }}>The Difference</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white"><WordReveal text="Us vs. Craigslist Painter" /></h2>
          </div>
          <GlassCard className="overflow-hidden">
            <div className="grid grid-cols-[1.5fr_1fr_1fr] items-center border-b border-white/15">
              <div className="p-4 md:p-6 text-xs uppercase tracking-widest text-slate-400">What Matters</div>
              <div className="p-4 md:p-6 text-center" style={{ background: `${PURPLE}25` }}>
                <p className="text-sm md:text-base font-bold" style={{ color: PURPLE_LIGHT }}>Our Shop</p>
              </div>
              <div className="p-4 md:p-6 text-center">
                <p className="text-sm md:text-base font-semibold text-slate-400">Cheap Quote</p>
              </div>
            </div>
            {[
              { feature: "Licensed + insured crews", us: "$1M liability", them: "Rarely" },
              { feature: "Full prep + patching", us: "Days of prep", them: "Quick + dirty" },
              { feature: "Premium Sherwin/Benjamin Moore", us: "Standard", them: "Home center specials" },
              { feature: "2-coat application", us: "Always", them: "1-coat shortcut" },
              { feature: "Color consultation", us: "Free", them: "Your problem" },
              { feature: "5-year workmanship warranty", us: "Written", them: "Cash + disappeared" },
              { feature: "Clean job site daily", us: "Every night", them: "Paint everywhere" },
            ].map((row, i) => (
              <div key={i} className="grid grid-cols-[1.5fr_1fr_1fr] items-center border-b border-white/8 last:border-b-0">
                <div className="p-4 md:p-6 text-sm text-white">{row.feature}</div>
                <div className="p-4 md:p-6 text-center" style={{ background: `${PURPLE}10` }}>
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle size={18} weight="fill" style={{ color: PURPLE_LIGHT }} />
                    <span className="text-sm text-white font-semibold hidden sm:inline">{row.us}</span>
                  </div>
                </div>
                <div className="p-4 md:p-6 text-center text-sm text-slate-500 italic">{row.them}</div>
              </div>
            ))}
          </GlassCard>
        </div>
      </SectionReveal>

      {/* ─── CERTIFICATIONS ─── */}
      <SectionReveal className="relative z-10 py-8">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <p className="text-center text-xs uppercase tracking-widest text-slate-500 mb-6">Partners &amp; Credentials</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {[
              { label: "PDCA Member", icon: ShieldCheck },
              { label: "Sherwin Pro", icon: Palette },
              { label: "Benjamin Moore Pro", icon: CheckCircle },
              { label: "EPA Lead-Safe", icon: ShieldCheck },
              { label: "BBB A+", icon: Star },
              { label: "5-Year Warranty", icon: CheckCircle },
            ].map((cert, i) => (
              <GlassCard key={i} className="px-4 py-3 flex items-center gap-2 justify-center">
                <cert.icon size={18} weight="duotone" style={{ color: i % 2 === 0 ? PURPLE_LIGHT : SPLASH_PINK }} />
                <span className="text-xs font-semibold text-slate-300">{cert.label}</span>
              </GlassCard>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ─── SERVICE AREA ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: PURPLE }}>Coverage</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white"><WordReveal text="Service Area & Schedule" /></h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <GlassCard className="p-6 text-center">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: PURPLE_GLOW }}>
                <MapPin size={26} weight="duotone" style={{ color: PURPLE_LIGHT }} />
              </div>
              <p className="text-xs uppercase tracking-widest mb-2" style={{ color: PURPLE_LIGHT }}>Coverage</p>
              <p className="text-3xl font-black text-white">40 Miles</p>
              <p className="text-sm text-slate-400 mt-2">Metro and suburbs, with commercial + multi-family across the region. Residential lead time 2–3 weeks.</p>
            </GlassCard>
            <GlassCard className="p-6 text-center">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: `${SPLASH_PINK}22` }}>
                <Clock size={26} weight="duotone" style={{ color: SPLASH_PINK }} />
              </div>
              <p className="text-xs uppercase tracking-widest mb-2" style={{ color: SPLASH_PINK }}>Project Timeline</p>
              <p className="text-3xl font-black text-white">2–7 Days</p>
              <p className="text-sm text-slate-400 mt-2">Interior rooms same-day. Whole-house exterior 3–5 days. Cabinet jobs 4–6 day turnaround.</p>
            </GlassCard>
            <GlassCard className="p-6 text-center">
              <div className="relative w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: PURPLE_GLOW }}>
                <motion.div className="absolute inset-0 rounded-full" style={{ background: PURPLE_LIGHT }} animate={{ scale: [1, 1.6, 1], opacity: [0.4, 0, 0.4] }} transition={{ duration: 2, repeat: Infinity }} />
                <CheckCircle size={26} weight="duotone" style={{ color: PURPLE_LIGHT }} className="relative" />
              </div>
              <p className="text-xs uppercase tracking-widest mb-2" style={{ color: PURPLE_LIGHT }}>Booking</p>
              <p className="text-3xl font-black text-white">Spring Filling</p>
              <p className="text-sm text-slate-400 mt-2">Exterior crews booking 3–4 weeks out. Interior jobs still available this month.</p>
            </GlassCard>
          </div>
        </div>
      </SectionReveal>

      {/* ─── 8. FAQ ─── */}
      <SectionReveal id="faq" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            <div className="lg:sticky lg:top-32">
              <p className="text-sm uppercase tracking-widest mb-3" style={{ color: PURPLE }}>Common Questions</p>
              <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white mb-6">
                <WordReveal text="Frequently Asked" />
              </h2>
              <p className="text-slate-400 leading-relaxed max-w-md">Everything you need to know about our painting services, materials, and process.</p>
            </div>
            <motion.div className="space-y-3" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
              {faqData.map((faq, i) => (
                <motion.div key={i} variants={fadeUp}>
                  <AccordionItem title={faq.title} description={faq.description} isOpen={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </SectionReveal>

      {/* ─── 9. FREE ESTIMATE CTA ─── */}
      <SectionReveal id="estimate" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4 md:px-6">
          <ShimmerBorder>
            <div className="p-8 md:p-12 text-center">
              <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={spring}>
                <p className="text-sm uppercase tracking-widest mb-3" style={{ color: PURPLE }}>Ready to Transform Your Space?</p>
                <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white mb-4">Get Your Free Estimate</h2>
                <p className="text-slate-400 text-lg mb-8 max-w-lg mx-auto">
                  No obligation, no pressure. We will visit your property,
                  discuss your vision, and provide a detailed written quote
                  within 24 hours.
                </p>
                <div className="flex flex-wrap gap-4 justify-center">
                  <MagneticButton className="px-10 py-4 rounded-full text-base font-semibold text-white inline-flex items-center gap-2 cursor-pointer" style={{ background: PURPLE } as React.CSSProperties}>
                    <CalendarCheck size={20} weight="duotone" /> Schedule Estimate
                  </MagneticButton>
                  <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/15 flex items-center gap-2 cursor-pointer">
                    <Phone size={18} weight="duotone" /> Call Now
                  </MagneticButton>
                </div>
              </motion.div>
            </div>
          </ShimmerBorder>
        </div>
      </SectionReveal>

      {/* ─── PREP WORK DETAIL ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: PURPLE }}>The Prep Matters Most</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white"><WordReveal text="Our 9-Step Prep Process" /></h2>
            <p className="text-slate-400 mt-4 max-w-2xl mx-auto">Great paint jobs are 70% prep, 30% application. We never skip steps.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { step: "1", title: "Wash + Clean", desc: "Power wash exterior, TSP interior to remove grease and oil." },
              { step: "2", title: "Scrape + Sand", desc: "Remove loose paint, smooth transitions, sand glossy surfaces." },
              { step: "3", title: "Patch + Fill", desc: "Fill nail holes, dings, and cracks with premium compound." },
              { step: "4", title: "Caulk + Seal", desc: "Re-caulk every gap, seal knots, and address water damage." },
              { step: "5", title: "Prime Bare Spots", desc: "Stain-blocking primer on bare wood, drywall repairs, and dark colors." },
              { step: "6", title: "Mask + Protect", desc: "Drop cloths, tape windows + fixtures, protect landscaping with tarps." },
              { step: "7", title: "First Coat", desc: "Apply even first coat with the best tool for the job (brush, roller, spray)." },
              { step: "8", title: "Inspect + Second Coat", desc: "Check for coverage, touch up, apply full second coat for depth + durability." },
              { step: "9", title: "Clean + Walk", desc: "Clean up every drop, pick up every tape strip, and walk the job with you." },
              { step: "10", title: "Warranty Packet", desc: "Leave you with touch-up paint, color codes, and a written warranty certificate." },
              { step: "11", title: "30-Day Check-In", desc: "A follow-up call to confirm the paint cured cleanly and address any small touch-up needs." },
              { step: "12", title: "5-Year Warranty", desc: "Call us anytime in the next 5 years for free warranty repair on our workmanship." },
              { step: "13", title: "Referral Program", desc: "Refer a neighbor and earn $250 credit toward your next project — everyone wins." },
              { step: "14", title: "Maintenance Plan", desc: "Annual inspection + touch-up service to keep exteriors looking freshly painted for years." },
              { step: "15", title: "Color Update Offer", desc: "Ready for a refresh? Repeat customers get 15% off every subsequent project." },
              { step: "16", title: "Satisfaction Promise", desc: "If you are not happy when we walk, we don't leave. Every brush stroke, every corner." },
            ].map((step, i) => (
              <GlassCard key={i} className="p-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-sm font-black" style={{ background: PURPLE_GLOW, color: PURPLE_LIGHT }}>{step.step}</div>
                  <div>
                    <p className="text-base font-bold text-white">{step.title}</p>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ─── FINAL CTA ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-4 md:px-6">
          <GlassCard className="p-8 md:p-12 text-center">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: PURPLE }}>Ready For A Fresh Look?</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white mb-4">Free Estimate + Color Consult</h2>
            <p className="text-slate-400 text-lg mb-8 max-w-lg mx-auto">Our estimator brings color swatches, walks your space, and writes up a line-item quote. Free, no pressure to hire.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <MagneticButton className="px-10 py-4 rounded-full text-base font-semibold text-white inline-flex items-center gap-2 cursor-pointer" style={{ background: PURPLE } as React.CSSProperties}>
                <CalendarCheck size={20} weight="duotone" /> Book Estimate
              </MagneticButton>
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/15 inline-flex items-center gap-2 cursor-pointer">
                <Phone size={18} weight="duotone" /> (206) 743-2190
              </MagneticButton>
            </div>
            <p className="mt-6 text-xs text-slate-500">WA L&amp;I #PAINTPC783LM &bull; Insured &bull; EPA Lead-Safe &bull; PDCA Member &bull; 5-Year Warranty</p>
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              {[
                { label: "Homes Painted", value: "2,400+" },
                { label: "Years In Business", value: "15+" },
                { label: "Workmanship Warranty", value: "5 Years" },
                { label: "Customer Rating", value: "4.9 / 5" },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <p className="text-xs text-slate-500 uppercase tracking-widest">{stat.label}</p>
                  <p className="text-2xl font-black mt-1" style={{ color: PURPLE_LIGHT }}>{stat.value}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </SectionReveal>

      {/* ─── FOOTER ─── */}
      <footer className="relative z-10 border-t border-white/8 py-8">
        <div className="mx-auto max-w-7xl px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <PaintRoller size={16} weight="duotone" style={{ color: PURPLE }} />
            <span>Spectrum Painting &copy; {new Date().getFullYear()}</span>
          </div>
          <p className="text-xs text-slate-600 flex items-center gap-1.5"><svg width="14" height="14" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-sky-500"><path d="M24.3 4.2c-1.5-.4-3.2.1-4.5 1.1-1-.7-2.3-1-3.5-.8-2.4.4-4.2 2.5-4.2 4.9v.6c-3.2.8-6 2.8-7.8 5.6-.3.5-.1 1.1.4 1.4.5.3 1.1.1 1.4-.4 1.5-2.3 3.7-4 6.3-4.7.5-.1 1-.1 1.5 0 .8.2 1.4.8 1.7 1.5.3.8.2 1.6-.2 2.3l-2.8 4.3c-.6.9-.4 2.1.4 2.8l2.5 2.1c.4.3.8.5 1.3.5h5.2c.5 0 1-.2 1.3-.5l1.2-1c.6-.5.8-1.3.6-2l-1-3.2c-.2-.5 0-1.1.4-1.4l3.8-2.5c1.3-.9 2.1-2.3 2.1-3.9V9.6c0-2.5-1.7-4.7-4.1-5.3v-.1z" fill="currentColor"/></svg>Created by <a href="https://bluejayportfolio.com" target="_blank" rel="noopener noreferrer" style={{textDecoration:"underline"}}>bluejayportfolio.com</a></p>
        </div>
      </footer>
    </main>
  );
}
