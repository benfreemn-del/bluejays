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
    <div className={`rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] ${className}`}>
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
  { src: "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=600&q=80", alt: "Freshly painted living room" },
  { src: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&q=80", alt: "Exterior house painting" },
  { src: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=600&q=80", alt: "Modern kitchen cabinets painted white" },
  { src: "https://images.unsplash.com/photo-1534430480872-3498386e7856?w=600&q=80", alt: "Paint color samples on wall" },
  { src: "https://images.unsplash.com/photo-1576153192396-180ecef2a715?w=600&q=80", alt: "Professional painter at work" },
  { src: "https://images.unsplash.com/photo-1525909002-1b05e0c869d8?w=600&q=80", alt: "Beautiful bedroom accent wall" },
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
          <img src="https://images.unsplash.com/photo-1507652955-f3dcef5a3be5?w=1400&q=80" alt="Beautiful painted interior" className="w-full h-full object-cover object-center" />
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
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/10 flex items-center gap-2 cursor-pointer">
                <Phone size={18} weight="duotone" /> (555) 743-2190
              </MagneticButton>
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
              <img src="https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&q=80" alt="Interior painting project" className="w-full aspect-[16/10] object-cover" />
            </div>
            <div className="rounded-2xl overflow-hidden">
              <img src="https://images.unsplash.com/photo-1600210492493-0946911123ea?w=800&q=80" alt="Exterior painting project" className="w-full aspect-[16/10] object-cover" />
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
              <img src="https://images.unsplash.com/photo-1618220179428-22790b461013?w=700&q=80" alt="Painting team at work" className="w-full h-full object-cover object-center" />
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
                <GlassCard className="p-6 h-full flex flex-col">
                  <Quotes size={28} weight="fill" style={{ color: PURPLE }} className="mb-3 opacity-50" />
                  <p className="text-slate-300 leading-relaxed flex-1 text-sm">{t.text}</p>
                  <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                    <span className="text-sm font-semibold text-white">{t.name}</span>
                    <div className="flex gap-0.5">{Array.from({ length: t.rating }).map((_, j) => (<Star key={j} size={12} weight="fill" style={{ color: PURPLE }} />))}</div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
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
                  <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/10 flex items-center gap-2 cursor-pointer">
                    <Phone size={18} weight="duotone" /> Call Now
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
            <PaintRoller size={16} weight="duotone" style={{ color: PURPLE }} />
            <span>Spectrum Painting &copy; {new Date().getFullYear()}</span>
          </div>
          <p className="text-xs text-slate-600 flex items-center gap-1.5"><svg width="14" height="14" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-sky-500"><path d="M24.3 4.2c-1.5-.4-3.2.1-4.5 1.1-1-.7-2.3-1-3.5-.8-2.4.4-4.2 2.5-4.2 4.9v.6c-3.2.8-6 2.8-7.8 5.6-.3.5-.1 1.1.4 1.4.5.3 1.1.1 1.4-.4 1.5-2.3 3.7-4 6.3-4.7.5-.1 1-.1 1.5 0 .8.2 1.4.8 1.7 1.5.3.8.2 1.6-.2 2.3l-2.8 4.3c-.6.9-.4 2.1.4 2.8l2.5 2.1c.4.3.8.5 1.3.5h5.2c.5 0 1-.2 1.3-.5l1.2-1c.6-.5.8-1.3.6-2l-1-3.2c-.2-.5 0-1.1.4-1.4l3.8-2.5c1.3-.9 2.1-2.3 2.1-3.9V9.6c0-2.5-1.7-4.7-4.1-5.3v-.1z" fill="currentColor"/></svg>Created by <a href="https://bluejayportfolio.com" target="_blank" rel="noopener noreferrer" style={{textDecoration:"underline"}}>bluejayportfolio.com</a></p>
        </div>
      </footer>
    </main>
  );
}
