"use client";

/* eslint-disable @next/next/no-img-element -- These static marketing and preview components intentionally use plain img tags to preserve existing markup and visual behavior during lint-only cleanup. */

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
  Wall,
  ShieldCheck,
  Phone,
  MapPin,
  Clock,
  ArrowRight,
  CaretDown,
  Quotes,
  CalendarCheck,
  CheckCircle,
  Wrench,
  Hammer,
  X,
  List,
  TreeStructure,
  Lock,
  HouseLine,
  Medal,
  Certificate,
  Ruler,
  Timer,
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
const BG = "#1a1816";
const STONE = "#78716c";
const STONE_LIGHT = "#a8a29e";
const WOOD = "#92400e";
const WOOD_LIGHT = "#b45309";
const STONE_GLOW = "rgba(120, 113, 108, 0.15)";
const WOOD_GLOW = "rgba(146, 64, 14, 0.15)";

/* ───────────────────────── WORD REVEAL ───────────────────────── */
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

/* ───────────────────────── SECTION REVEAL ───────────────────────── */
function SectionReveal({ children, className = "", id }: { children: React.ReactNode; className?: string; id?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.section ref={ref} id={id} className={className} initial={{ opacity: 0, y: 50 }} animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }} transition={spring}>
      {children}
    </motion.section>
  );
}

/* ───────────────────────── GLASS CARD ───────────────────────── */
function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] ${className}`}>{children}</div>;
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
    <motion.button ref={ref} style={{ x: springX, y: springY, willChange: "transform", ...style }} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} onClick={onClick} className={className} whileTap={{ scale: 0.97 }}>{children}</motion.button>
  );
}

/* ───────────────────────── SHIMMER BORDER ───────────────────────── */
function ShimmerBorder({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative rounded-2xl p-[1px] overflow-hidden ${className}`}>
      <motion.div className="absolute inset-0 rounded-2xl" style={{ background: `conic-gradient(from 0deg, transparent, ${WOOD_LIGHT}, transparent, ${STONE_LIGHT}, transparent)`, willChange: "transform" }} animate={{ rotate: [0, 360] }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} />
      <div className="relative rounded-2xl z-10" style={{ background: BG }}>{children}</div>
    </div>
  );
}

/* ───────────────────────── FENCE GATE SVG ───────────────────────── */
function FenceGateSVG() {
  return (
    <div className="relative flex items-center justify-center">
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{ background: `radial-gradient(circle, ${WOOD_GLOW} 0%, transparent 70%)`, filter: "blur(40px)" }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      <svg viewBox="0 0 200 220" className="relative z-10 w-48 h-56 md:w-56 md:h-72" fill="none">
        {/* Outer glow rings */}
        <motion.circle cx="100" cy="110" r="92" stroke={WOOD_LIGHT} strokeWidth="0.5" opacity={0.12}
          animate={{ r: [90, 94, 90] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} />

        {/* Decorative iron arch gate top */}
        <motion.path d="M40 80 Q40 25 100 25 Q160 25 160 80"
          stroke={STONE_LIGHT} strokeWidth="2.5" fill={`${STONE}0d`}
          initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }} />
        {/* Inner arch */}
        <motion.path d="M52 80 Q52 40 100 40 Q148 40 148 80"
          stroke={STONE} strokeWidth="1.5" fill={`${STONE}08`}
          initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.3, ease: "easeInOut" }} />

        {/* Decorative scrollwork at arch top */}
        <motion.path d="M80 45 Q90 30 100 40 Q110 30 120 45" stroke={WOOD_LIGHT} strokeWidth="1.5" fill="none" strokeLinecap="round"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }} />

        {/* Left gate panel */}
        <motion.rect x="42" y="80" width="52" height="110" rx="2" fill={`${WOOD}18`} stroke={WOOD} strokeWidth="2"
          initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} style={{ transformOrigin: "50% 100%" }}
          transition={{ duration: 0.8, delay: 0.5, ease: "backOut" }} />
        <rect x="48" y="85" width="40" height="100" rx="1" fill={`${WOOD}0d`} />

        {/* Right gate panel */}
        <motion.rect x="106" y="80" width="52" height="110" rx="2" fill={`${WOOD}18`} stroke={WOOD} strokeWidth="2"
          initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} style={{ transformOrigin: "50% 100%" }}
          transition={{ duration: 0.8, delay: 0.7, ease: "backOut" }} />
        <rect x="112" y="85" width="40" height="100" rx="1" fill={`${WOOD}0d`} />

        {/* Vertical bars on left panel */}
        {[52, 62, 72, 82].map((x, i) => (
          <motion.line key={`l${i}`} x1={x} y1="85" x2={x} y2="185" stroke={WOOD_LIGHT} strokeWidth="1.5"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, delay: 1 + i * 0.1 }} />
        ))}
        {/* Vertical bars on right panel */}
        {[118, 128, 138, 148].map((x, i) => (
          <motion.line key={`r${i}`} x1={x} y1="85" x2={x} y2="185" stroke={WOOD_LIGHT} strokeWidth="1.5"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, delay: 1.2 + i * 0.1 }} />
        ))}

        {/* Horizontal rails */}
        <motion.line x1="42" y1="120" x2="94" y2="120" stroke={WOOD_LIGHT} strokeWidth="1.5"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 1.5 }} />
        <motion.line x1="106" y1="120" x2="158" y2="120" stroke={WOOD_LIGHT} strokeWidth="1.5"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 1.6 }} />
        <motion.line x1="42" y1="155" x2="94" y2="155" stroke={WOOD_LIGHT} strokeWidth="1.5"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 1.7 }} />
        <motion.line x1="106" y1="155" x2="158" y2="155" stroke={WOOD_LIGHT} strokeWidth="1.5"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 1.8 }} />

        {/* Gate post caps - decorative finials */}
        <motion.path d="M35 80 L35 75 L40 68 L45 75 L45 80" fill={`${STONE}22`} stroke={STONE} strokeWidth="1.5"
          initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.8, duration: 0.5 }} />
        <motion.path d="M155 80 L155 75 L160 68 L165 75 L165 80" fill={`${STONE}22`} stroke={STONE} strokeWidth="1.5"
          initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2, duration: 0.5 }} />

        {/* Gate handle/latch */}
        <motion.circle cx="94" cy="135" r="3" fill={`${STONE_LIGHT}44`} stroke={STONE_LIGHT} strokeWidth="1.5"
          initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 2.2 }} />
        <motion.circle cx="106" cy="135" r="3" fill={`${STONE_LIGHT}44`} stroke={STONE_LIGHT} strokeWidth="1.5"
          initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 2.3 }} />

        {/* Stone base */}
        <motion.rect x="30" y="190" width="140" height="12" rx="3" fill={`${STONE}18`} stroke={STONE} strokeWidth="1.5"
          initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.6, delay: 0.3 }} />
        <rect x="35" y="192" width="130" height="6" rx="2" fill={`${STONE}0d`} />

        {/* Sparkle accents */}
        <motion.circle cx="170" cy="35" r="3" fill={WOOD_LIGHT}
          animate={{ opacity: [0.2, 1, 0.2], scale: [0.7, 1.3, 0.7] }}
          transition={{ duration: 2.5, repeat: Infinity }} />
        <motion.circle cx="25" cy="50" r="2" fill={STONE_LIGHT}
          animate={{ opacity: [0.1, 0.8, 0.1], scale: [0.5, 1.2, 0.5] }}
          transition={{ duration: 3, repeat: Infinity, delay: 0.8 }} />
        <motion.circle cx="180" cy="110" r="2.5" fill={WOOD_LIGHT}
          animate={{ opacity: [0.15, 0.7, 0.15] }}
          transition={{ duration: 2, repeat: Infinity, delay: 1.2 }} />
        <motion.circle cx="18" cy="130" r="2" fill={STONE_LIGHT}
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
  { title: "Wood Fencing", description: "Classic cedar and redwood privacy fences, picket fences, and board-on-board designs. Custom staining and sealing included for long-lasting beauty.", icon: TreeStructure },
  { title: "Vinyl Fencing", description: "Maintenance-free vinyl in privacy, semi-privacy, and picket styles. Lifetime warranty against cracking, peeling, and discoloration.", icon: ShieldCheck },
  { title: "Chain Link Fencing", description: "Durable galvanized and vinyl-coated chain link for commercial properties, sports fields, and pet enclosures. Quick installation.", icon: Lock },
  { title: "Wrought Iron Fencing", description: "Elegant ornamental iron fencing for front yards, pool enclosures, and estate perimeters. Custom designs with powder-coated finishes.", icon: HouseLine },
  { title: "Gates & Access", description: "Swing gates, sliding gates, and automated entry systems. From simple garden gates to motorized driveway systems with keypads and remotes.", icon: Lock },
  { title: "Fence Repair", description: "Storm damage repair, post replacement, leaning fence correction, and panel replacement. Fast response times to restore your property's security.", icon: Wrench },
];

const stats = [
  { value: "3,000+", label: "Fences Installed" },
  { value: "18+", label: "Years Experience" },
  { value: "4.9", label: "Star Rating" },
  { value: "Lifetime", label: "Warranty Available" },
];

const galleryPhotos = [
  { src: "https://images.unsplash.com/photo-1595356700395-6f14b5c1f33f?w=600&q=80", alt: "Cedar privacy fence installation" },
  { src: "https://images.unsplash.com/photo-1622372738946-62e02505feb3?w=600&q=80", alt: "White vinyl fence with gate" },
  { src: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&q=80", alt: "Ornamental iron fencing" },
  { src: "https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=600&q=80", alt: "Wood fence in backyard" },
  { src: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&q=80", alt: "Beautiful home with fence" },
  { src: "https://images.unsplash.com/photo-1558882224-dda166733046?w=600&q=80", alt: "Property with iron gate" },
];

const processSteps = [
  { step: "01", title: "Free On-Site Estimate", description: "We measure your property, discuss material options, mark utility lines, and provide a detailed written quote within 24 hours." },
  { step: "02", title: "Material Selection", description: "Choose from our showroom of wood, vinyl, iron, and chain link samples. We help you match the perfect style to your property." },
  { step: "03", title: "Permit & HOA Coordination", description: "We handle all permit applications and HOA submissions. We know local codes inside and out so your fence passes inspection every time." },
  { step: "04", title: "Professional Installation", description: "Our experienced crews install your fence with precision. Concrete-set posts, level panels, and clean lines every time." },
  { step: "05", title: "Final Walkthrough", description: "We inspect every post, panel, and gate with you. We clean up completely and make sure you are 100% satisfied before we leave." },
];

const materials = [
  { name: "Cedar Wood", durability: "15-20 years", maintenance: "Moderate", price: "$$", best: "Privacy & aesthetics" },
  { name: "Vinyl", durability: "25-30 years", maintenance: "Very Low", price: "$$$", best: "Zero maintenance" },
  { name: "Chain Link", durability: "20+ years", maintenance: "Low", price: "$", best: "Budget & security" },
  { name: "Wrought Iron", durability: "50+ years", maintenance: "Low", price: "$$$$", best: "Curb appeal & durability" },
];

const testimonials = [
  { name: "Tom & Becky R.", text: "They installed a beautiful cedar fence around our entire backyard in just two days. The crew was professional, the fence is gorgeous, and it feels incredibly solid.", rating: 5 },
  { name: "Greg M.", text: "After getting three quotes, these guys were the best value by far. The vinyl fence they installed looks amazing and the lifetime warranty gives us peace of mind.", rating: 5 },
  { name: "Patricia S.", text: "The wrought iron fence around our pool exceeded our expectations. It is beautiful and meets all safety codes. They even helped with the permit process.", rating: 5 },
];

const faqData = [
  { title: "Do I need a permit for a fence?", description: "Most municipalities require a permit for new fences. We handle the entire permitting process for you, including applications, surveys, and inspections. This is included in our service at no extra charge." },
  { title: "How long does installation take?", description: "A typical residential fence (150-200 linear feet) is installed in 1-3 days depending on material and terrain. We provide a timeline in your estimate so you can plan accordingly." },
  { title: "What about underground utilities?", description: "We coordinate with your local utility locating service (811) before any digging. This is a critical safety step that we handle as part of every project. Never dig without calling 811." },
  { title: "Do you offer financing?", description: "Yes. We offer 0% interest financing for 12 months and extended payment plans up to 60 months through our lending partners. Apply during your free estimate with no impact on your credit." },
  { title: "What warranty do you provide?", description: "We provide a 5-year workmanship warranty on all installations. Material warranties vary: cedar (limited lifetime), vinyl (lifetime), chain link (20-year), wrought iron (lifetime). Full details are in your contract." },
];

/* ═══════════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════════ */
export default function V2FencingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden" style={{ background: BG, color: "#f1f5f9" }}>

      {/* ─── NAV ─── */}
      <motion.nav initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-4">
          <GlassCard className="flex items-center justify-between px-4 md:px-6 py-3">
            <div className="flex items-center gap-2">
              <Wall size={24} weight="duotone" style={{ color: WOOD_LIGHT }} />
              <span className="text-lg font-bold tracking-tight text-white">Ironwood Fencing</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
              <a href="#services" className="hover:text-white transition-colors">Services</a>
              <a href="#gallery" className="hover:text-white transition-colors">Gallery</a>
              <a href="#materials" className="hover:text-white transition-colors">Materials</a>
              <a href="#testimonials" className="hover:text-white transition-colors">Reviews</a>
            </div>
            <div className="flex items-center gap-3">
              <MagneticButton className="px-4 md:px-5 py-2 rounded-full text-sm font-semibold text-white transition-colors" style={{ background: WOOD } as React.CSSProperties}>
                Free Quote
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
                  {[{ label: "Services", href: "#services" }, { label: "Gallery", href: "#gallery" }, { label: "Materials", href: "#materials" }, { label: "Reviews", href: "#testimonials" }, { label: "Free Quote", href: "#quote" }].map((link) => (
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
          <img src="https://images.unsplash.com/photo-1597047084897-51e81819a499?w=1400&q=80" alt="Beautiful wood fence" className="w-full h-full object-cover object-center" />
          <div className="absolute inset-0" style={{ background: `linear-gradient(to right, ${BG} 45%, transparent 100%)` }} />
          <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${BG} 10%, transparent 50%)` }} />
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          <div className="max-w-2xl space-y-8">
            <motion.p initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ ...spring, delay: 0.1 }} className="text-sm uppercase tracking-widest" style={{ color: WOOD_LIGHT }}>
              Premium Fence Installation
            </motion.p>
            <h1 className="text-4xl md:text-7xl tracking-tighter leading-none font-bold text-white" style={{ textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>
              <WordReveal text="Built to Last a Lifetime" />
            </h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.6 }} className="text-lg text-slate-300 max-w-md leading-relaxed">
              Expert fence installation using premium materials, precision
              craftsmanship, and deep knowledge of local codes. Your property
              deserves a fence that is as beautiful as it is strong.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.8 }} className="flex flex-wrap gap-4">
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white flex items-center gap-2 cursor-pointer" style={{ background: WOOD } as React.CSSProperties}>
                Get Free Quote <ArrowRight size={18} weight="bold" />
              </MagneticButton>
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/10 flex items-center gap-2 cursor-pointer">
                <Phone size={18} weight="duotone" /> (555) 629-4150
              </MagneticButton>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ ...spring, delay: 1 }} className="flex flex-wrap gap-3">
              <span className="px-4 py-2 rounded-full text-xs font-semibold text-white flex items-center gap-2" style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${WOOD}50` }}><ShieldCheck size={14} weight="duotone" style={{ color: WOOD_LIGHT }} />Licensed &amp; Bonded</span>
              <span className="px-4 py-2 rounded-full text-xs font-semibold text-white flex items-center gap-2" style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${STONE}50` }}><Star size={14} weight="fill" style={{ color: STONE_LIGHT }} />4.9-Star Rated</span>
              <span className="px-4 py-2 rounded-full text-xs font-semibold text-white flex items-center gap-2" style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${WOOD}50` }}><CheckCircle size={14} weight="duotone" style={{ color: WOOD_LIGHT }} />Free On-Site Estimates</span>
              <span className="px-4 py-2 rounded-full text-xs font-semibold text-white flex items-center gap-2" style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${STONE}50` }}><Medal size={14} weight="duotone" style={{ color: STONE_LIGHT }} />Lifetime Warranty</span>
            </motion.div>
          </div>
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ ...spring, delay: 0.3 }} className="hidden md:flex items-center justify-center lg:justify-end">
            <FenceGateSVG />
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
                  <p className="text-3xl md:text-4xl font-bold" style={{ color: WOOD_LIGHT }}>{stat.value}</p>
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
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: WOOD_LIGHT }}>Our Services</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Every Fence, Every Style" />
            </h2>
          </div>
          <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {services.map((svc, i) => (
              <motion.div key={i} variants={fadeUp}>
                <motion.div whileHover={{ scale: 1.03 }} transition={springGentle} style={{ willChange: "transform" }}>
                  <GlassCard className="p-6 h-full">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: WOOD_GLOW }}>
                      <svc.icon size={24} weight="duotone" style={{ color: WOOD_LIGHT }} />
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

      {/* ─── 4. GALLERY ─── */}
      <SectionReveal id="gallery" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: WOOD_LIGHT }}>Our Work</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Craftsmanship on Display" />
            </h2>
          </div>
          <motion.div className="grid grid-cols-2 md:grid-cols-3 gap-4" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {galleryPhotos.map((photo, i) => (
              <motion.div key={i} variants={fadeUp} className={`rounded-2xl overflow-hidden ${i === 0 ? "md:row-span-2" : ""}`}>
                <motion.div whileHover={{ scale: 1.05 }} transition={springGentle} className="w-full h-full" style={{ willChange: "transform" }}>
                  <img src={photo.src} alt={photo.alt} className={`w-full object-cover object-center ${i === 0 ? "h-full" : "aspect-square"}`} />
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
            <div>
              <p className="text-sm uppercase tracking-widest mb-3" style={{ color: WOOD_LIGHT }}>About Ironwood</p>
              <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white mb-6">
                <WordReveal text="Rooted in Craftsmanship" />
              </h2>
              <div className="space-y-4 text-slate-400 leading-relaxed">
                <p>
                  Ironwood Fencing was started 18 years ago by two brothers who
                  believed that a fence should be more than a boundary line. It
                  should add beauty, value, and security to your property for
                  decades.
                </p>
                <p>
                  Today, our team of skilled installers brings that same
                  philosophy to every project. We source premium materials,
                  set every post in concrete, and stand behind our work with
                  industry-leading warranties.
                </p>
              </div>
              <div className="mt-8 flex flex-wrap gap-4">
                {[{ icon: ShieldCheck, label: "Licensed & Insured" }, { icon: CheckCircle, label: "Lifetime Warranty" }, { icon: Hammer, label: "Concrete-Set Posts" }].map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <item.icon size={18} weight="duotone" style={{ color: WOOD_LIGHT }} />
                    <span className="text-sm text-slate-300">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden aspect-[4/5]">
              <img src="https://images.unsplash.com/photo-1621274147744-cfb5694bb233?w=700&q=80" alt="Fence installation crew" className="w-full h-full object-cover object-center" />
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* ─── 6. PROCESS ─── */}
      <SectionReveal id="process" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: WOOD_LIGHT }}>How It Works</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="From Quote to Completion" />
            </h2>
          </div>
          <motion.div className="space-y-4" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {processSteps.map((step, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="p-6 flex items-start gap-6">
                  <div className="text-3xl font-bold shrink-0" style={{ color: WOOD_LIGHT, opacity: 0.5 }}>{step.step}</div>
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
                <p className="text-lg font-bold text-white">Verified Homeowner Ratings</p>
              </div>
            </div>
            <div className="hidden sm:block w-px h-12 bg-white/10" />
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                {[0,1,2,3,4].map((i) => (<Star key={i} size={20} weight="fill" style={{ color: WOOD_LIGHT }} />))}
              </div>
              <p className="text-sm text-slate-400"><span className="text-white font-bold">4.9</span> out of 5 &bull; <span className="text-white font-bold">189</span> reviews</p>
            </div>
          </GlassCard>
        </div>
      </SectionReveal>

      {/* ─── 7. TESTIMONIALS ─── */}
      <SectionReveal id="testimonials" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: WOOD_LIGHT }}>Client Reviews</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="What Our Clients Say" />
            </h2>
          </div>
          <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {testimonials.map((t, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="p-6 h-full flex flex-col relative overflow-hidden">
                  <Quotes size={60} weight="fill" style={{ color: WOOD_LIGHT }} className="absolute -top-2 -right-2 opacity-10" />
                  <Quotes size={28} weight="fill" style={{ color: WOOD_LIGHT }} className="mb-3 opacity-60" />
                  <p className="text-slate-300 leading-relaxed flex-1 text-sm">{t.text}</p>
                  <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">{t.name}</span>
                      <CheckCircle size={14} weight="fill" style={{ color: WOOD_LIGHT }} />
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider">Verified</span>
                    </div>
                    <div className="flex gap-0.5">{Array.from({ length: t.rating }).map((_, j) => (<Star key={j} size={18} weight="fill" style={{ color: WOOD_LIGHT }} />))}</div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── LINEAR FOOT PRICING ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 60% 40% at 50% 50%, ${WOOD_GLOW} 0%, transparent 70%)` }} />
        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: WOOD_LIGHT }}>Transparent Pricing</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white"><WordReveal text="Fence Pricing by Material" /></h2>
            <p className="text-slate-400 mt-4 max-w-2xl mx-auto">Installed prices per linear foot. Exact quote depends on terrain, access, and finish options — but these are real averages from last quarter.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "Chain Link", price: "$18 – $32", desc: "Galvanized or vinyl-coated. Great for pets, budget security, and large commercial runs.", features: ["Galvanized or black vinyl", "4–8 ft height options", "Top rail + tension wire", "Walk gate included in standard runs", "5-year workmanship warranty"], highlight: false },
              { name: "Cedar Privacy", price: "$42 – $68", desc: "Our bestselling residential style. Pressure-treated posts, premium cedar pickets.", features: ["6 ft standard, up to 8 ft", "Cedar or composite caps", "Stain package available", "HOA compliance review", "10-year workmanship warranty"], highlight: true },
              { name: "Wrought Iron / Aluminum", price: "$55 – $120", desc: "Ornamental fencing for pools, estate perimeters, and curb-appeal upgrades.", features: ["Powder-coated aluminum or steel", "Multiple picket + cap styles", "Custom gate automation option", "Pool-code compliant", "Lifetime finish warranty"], highlight: false },
            ].map((tier, i) => (
              <div key={i} className={`relative rounded-2xl ${tier.highlight ? 'p-[2px]' : ''}`} style={tier.highlight ? { background: `linear-gradient(135deg, ${WOOD}, ${WOOD_LIGHT})` } : {}}>
                {tier.highlight && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white" style={{ background: WOOD }}>Most Popular</div>}
                <GlassCard className="p-6 h-full">
                  <h3 className="text-xl font-bold text-white">{tier.name}</h3>
                  <p className="text-xs text-slate-400 mt-1">{tier.desc}</p>
                  <div className="mt-6 flex items-end gap-1">
                    <span className="text-4xl font-black text-white">{tier.price}</span>
                    <span className="text-sm text-slate-400 mb-1">/ linear ft</span>
                  </div>
                  <ul className="mt-6 space-y-3">
                    {tier.features.map((f, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-slate-300">
                        <CheckCircle size={18} weight="fill" style={{ color: tier.highlight ? WOOD_LIGHT : STONE_LIGHT }} className="shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <button className="mt-6 w-full px-6 py-3 rounded-full text-sm font-semibold text-white" style={{ background: tier.highlight ? WOOD : "rgba(255,255,255,0.05)", border: tier.highlight ? "none" : "1px solid rgba(255,255,255,0.1)" }}>Get A Quote</button>
                </GlassCard>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-slate-500 mt-8">HOA / code review included free with every estimate. Financing available for fence + gate packages over $8K.</p>
        </div>
      </SectionReveal>

      {/* ─── HOA COMPLIANCE ─── */}
      <SectionReveal className="relative z-10 py-8">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <GlassCard className="p-6 md:p-8 flex flex-col md:flex-row items-center gap-6">
            <div className="relative shrink-0">
              <motion.div className="absolute inset-0 rounded-full" style={{ background: WOOD_LIGHT }} animate={{ scale: [1, 1.6, 1], opacity: [0.5, 0, 0.5] }} transition={{ duration: 2, repeat: Infinity }} />
              <div className="relative w-4 h-4 rounded-full" style={{ background: WOOD_LIGHT }} />
            </div>
            <div className="flex-1 text-center md:text-left">
              <p className="text-xs uppercase tracking-widest mb-1" style={{ color: WOOD_LIGHT }}>HOA &amp; Code Compliance</p>
              <h3 className="text-2xl md:text-3xl font-bold text-white">We Handle Permits, HOA Approvals, and Setbacks</h3>
              <p className="text-sm text-slate-400 mt-2">You get a drawn-to-scale plan, submittal packet, and setback review — free with every estimate. No fights with the board.</p>
            </div>
            <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white flex items-center gap-2 shrink-0 cursor-pointer" style={{ background: WOOD } as React.CSSProperties}>
              <CalendarCheck size={18} weight="duotone" /> Start HOA Review
            </MagneticButton>
          </GlassCard>
        </div>
      </SectionReveal>

      {/* ─── VIDEO PLACEHOLDER ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: WOOD_LIGHT }}>On The Job</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white"><WordReveal text="Watch a Full Fence Install" /></h2>
          </div>
          <div className="relative rounded-2xl overflow-hidden aspect-video group cursor-pointer">
            <img src="https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=1600&q=80" alt="Fencing crew installation" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div className="w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center shadow-2xl" style={{ background: WOOD } as React.CSSProperties} animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
                <svg width="28" height="32" viewBox="0 0 24 28" fill="white" className="ml-1">
                  <path d="M0 0L24 14L0 28Z" />
                </svg>
              </motion.div>
            </div>
            <div className="absolute bottom-6 left-6 right-6">
              <p className="text-xs uppercase tracking-widest" style={{ color: STONE_LIGHT }}>150 LF Privacy Fence &bull; 3:48</p>
              <p className="text-xl md:text-2xl font-bold text-white mt-1">See how we install a 150-foot cedar privacy fence in under 2 days.</p>
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* ─── QUIZ ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="relative z-10 mx-auto max-w-5xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: WOOD_LIGHT }}>Pick The Right Fence</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white"><WordReveal text="What's Your Goal?" /></h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { color: "#22c55e", label: "Privacy", detail: "Block sightlines from neighbors or streets, wind protection, kid + pet containment.", rec: "Cedar Privacy 6–8 ft", icon: Lock },
              { color: WOOD_LIGHT, label: "Security", detail: "Commercial perimeter, utility yards, storage, or high-security residential.", rec: "Chain Link + Privacy Slats / Wrought Iron", icon: ShieldCheck },
              { color: STONE_LIGHT, label: "Curb Appeal", detail: "Accent fencing, pool code, front-yard style, and landscape definition.", rec: "Aluminum Ornamental + Gate", icon: HouseLine },
            ].map((opt, i) => (
              <GlassCard key={i} className="p-6 h-full flex flex-col items-start relative overflow-hidden group cursor-pointer">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: `radial-gradient(circle at 50% 0%, ${opt.color}22, transparent 60%)` }} />
                <div className="relative w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: `${opt.color}22` }}>
                  <opt.icon size={22} weight="duotone" style={{ color: opt.color }} />
                </div>
                <p className="relative text-xs uppercase tracking-widest font-bold" style={{ color: opt.color }}>{opt.label}</p>
                <p className="relative text-sm text-slate-300 mt-2 leading-relaxed flex-1">{opt.detail}</p>
                <div className="relative mt-6 pt-4 border-t border-white/10 w-full">
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-1">We Recommend</p>
                  <p className="text-sm font-semibold text-white">{opt.rec}</p>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ─── COMPETITOR COMPARISON ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: WOOD_LIGHT }}>The Difference</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white"><WordReveal text="Us vs. The Big Box Installer" /></h2>
          </div>
          <GlassCard className="overflow-hidden">
            <div className="grid grid-cols-[1.5fr_1fr_1fr] items-center border-b border-white/10">
              <div className="p-4 md:p-6 text-xs uppercase tracking-widest text-slate-400">What Matters</div>
              <div className="p-4 md:p-6 text-center" style={{ background: `${WOOD}25` }}>
                <p className="text-sm md:text-base font-bold" style={{ color: WOOD_LIGHT }}>Our Crew</p>
              </div>
              <div className="p-4 md:p-6 text-center">
                <p className="text-sm md:text-base font-semibold text-slate-400">Big Box Store</p>
              </div>
            </div>
            {[
              { feature: "In-house install crews (not subs)", us: "Always", them: "Mostly subcontracted" },
              { feature: "HOA + permit handled for you", us: "Free", them: "Your problem" },
              { feature: "Drawn-to-scale layout", us: "Included", them: "Rarely" },
              { feature: "Premium materials stocked", us: "No substitutions", them: "Limited options" },
              { feature: "Fixed price before digging", us: "Guaranteed", them: "Change orders common" },
              { feature: "Lifetime workmanship on key items", us: "Included", them: "90 days" },
              { feature: "Scheduled same-week start", us: "When booking", them: "4–8 weeks out" },
            ].map((row, i) => (
              <div key={i} className="grid grid-cols-[1.5fr_1fr_1fr] items-center border-b border-white/5 last:border-b-0">
                <div className="p-4 md:p-6 text-sm text-white">{row.feature}</div>
                <div className="p-4 md:p-6 text-center" style={{ background: `${WOOD}10` }}>
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle size={18} weight="fill" style={{ color: WOOD_LIGHT }} />
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
          <p className="text-center text-xs uppercase tracking-widest text-slate-500 mb-6">Credentials &amp; Warranties</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {[
              { label: "Licensed Contractor", icon: Certificate },
              { label: "AFA Member", icon: Medal },
              { label: "BBB A+", icon: Star },
              { label: "OSHA Trained Crews", icon: ShieldCheck },
              { label: "Manufacturer Certified", icon: CheckCircle },
              { label: "Lifetime Warranty", icon: Timer },
            ].map((cert, i) => (
              <GlassCard key={i} className="px-4 py-3 flex items-center gap-2 justify-center">
                <cert.icon size={18} weight="duotone" style={{ color: i % 2 === 0 ? WOOD_LIGHT : STONE_LIGHT }} />
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
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: WOOD_LIGHT }}>Where We Build</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white"><WordReveal text="Service Area & Schedule" /></h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <GlassCard className="p-6 text-center">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: WOOD_GLOW }}>
                <MapPin size={26} weight="duotone" style={{ color: WOOD_LIGHT }} />
              </div>
              <p className="text-xs uppercase tracking-widest mb-2" style={{ color: WOOD_LIGHT }}>Coverage Radius</p>
              <p className="text-3xl font-black text-white">60 Miles</p>
              <p className="text-sm text-slate-400 mt-2">Metro, suburbs, and outlying rural towns. Larger runs considered throughout the state.</p>
            </GlassCard>
            <GlassCard className="p-6 text-center">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: STONE_GLOW }}>
                <Ruler size={26} weight="duotone" style={{ color: STONE_LIGHT }} />
              </div>
              <p className="text-xs uppercase tracking-widest mb-2" style={{ color: STONE_LIGHT }}>Average Job</p>
              <p className="text-3xl font-black text-white">1–3 Days</p>
              <p className="text-sm text-slate-400 mt-2">Most residential jobs done in 1–3 days. Commercial and estate runs scheduled on timeline.</p>
            </GlassCard>
            <GlassCard className="p-6 text-center">
              <div className="relative w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: WOOD_GLOW }}>
                <motion.div className="absolute inset-0 rounded-full" style={{ background: WOOD_LIGHT }} animate={{ scale: [1, 1.6, 1], opacity: [0.4, 0, 0.4] }} transition={{ duration: 2, repeat: Infinity }} />
                <CheckCircle size={26} weight="duotone" style={{ color: WOOD_LIGHT }} className="relative" />
              </div>
              <p className="text-xs uppercase tracking-widest mb-2" style={{ color: WOOD_LIGHT }}>Scheduling</p>
              <p className="text-3xl font-black text-white">Starting Soon</p>
              <p className="text-sm text-slate-400 mt-2">Booking installs for next month. Emergency repairs fit in sooner — call for rush availability.</p>
            </GlassCard>
          </div>
        </div>
      </SectionReveal>

      {/* ─── 8. MATERIALS COMPARISON ─── */}
      <SectionReveal id="materials" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: WOOD_LIGHT }}>Compare Options</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Find Your Perfect Fence" />
            </h2>
          </div>
          <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {materials.map((mat, i) => (
              <motion.div key={i} variants={fadeUp}>
                <motion.div whileHover={{ scale: 1.03 }} transition={springGentle} style={{ willChange: "transform" }}>
                  <GlassCard className="p-6 h-full">
                    <h3 className="text-lg font-semibold text-white mb-4">{mat.name}</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between"><span className="text-slate-500">Durability</span><span className="text-slate-300">{mat.durability}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">Maintenance</span><span className="text-slate-300">{mat.maintenance}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">Price Range</span><span style={{ color: WOOD_LIGHT }}>{mat.price}</span></div>
                      <div className="pt-3 border-t border-white/5">
                        <span className="text-slate-500">Best for: </span>
                        <span className="text-slate-300">{mat.best}</span>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── 9. FAQ ─── */}
      <SectionReveal id="faq" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            <div className="lg:sticky lg:top-32">
              <p className="text-sm uppercase tracking-widest mb-3" style={{ color: WOOD_LIGHT }}>Common Questions</p>
              <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white mb-6">
                <WordReveal text="Frequently Asked" />
              </h2>
              <p className="text-slate-400 leading-relaxed max-w-md">Everything you need to know about our fencing services, materials, and installation process.</p>
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

      {/* ─── 10. FREE QUOTE CTA ─── */}
      <SectionReveal id="quote" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4 md:px-6">
          <ShimmerBorder>
            <div className="p-8 md:p-12 text-center">
              <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={spring}>
                <p className="text-sm uppercase tracking-widest mb-3" style={{ color: WOOD_LIGHT }}>Ready to Get Started?</p>
                <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white mb-4">Get Your Free Quote</h2>
                <p className="text-slate-400 text-lg mb-8 max-w-lg mx-auto">
                  We will visit your property, discuss your options, and provide
                  a detailed written estimate. No pressure, no obligation.
                </p>
                <div className="flex flex-wrap gap-4 justify-center">
                  <MagneticButton className="px-10 py-4 rounded-full text-base font-semibold text-white inline-flex items-center gap-2 cursor-pointer" style={{ background: WOOD } as React.CSSProperties}>
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

      {/* ─── MATERIAL DEEP DIVE ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: WOOD_LIGHT }}>Material Guide</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white"><WordReveal text="Choosing The Right Material" /></h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: "Cedar", lifespan: "15–25 yrs", maintenance: "Stain every 2–3 yrs", cost: "$$", best: "Warm, natural look" },
              { name: "Vinyl", lifespan: "30+ yrs", maintenance: "Hose wash yearly", cost: "$$$", best: "Zero upkeep" },
              { name: "Chain Link", lifespan: "20+ yrs", maintenance: "Inspect for rust", cost: "$", best: "Budget + security" },
              { name: "Aluminum", lifespan: "30+ yrs", maintenance: "Virtually none", cost: "$$$$", best: "Ornamental + pools" },
              { name: "Composite", lifespan: "25+ yrs", maintenance: "Occasional wash", cost: "$$$", best: "Modern + low-upkeep" },
              { name: "Wrought Iron", lifespan: "Lifetime", maintenance: "Repaint every 8–10 yrs", cost: "$$$$$", best: "Estate + security" },
              { name: "Shadowbox", lifespan: "15–20 yrs", maintenance: "Stain every 2–3 yrs", cost: "$$", best: "Privacy + airflow" },
              { name: "Split Rail", lifespan: "15–20 yrs", maintenance: "Replace posts PRN", cost: "$", best: "Property lines + rustic" },
            ].map((mat, i) => (
              <GlassCard key={i} className="p-5">
                <p className="text-lg font-bold text-white">{mat.name}</p>
                <div className="mt-3 space-y-2 text-xs">
                  <div className="flex items-start justify-between gap-2"><span className="text-slate-500">Lifespan</span><span className="text-white font-semibold">{mat.lifespan}</span></div>
                  <div className="flex items-start justify-between gap-2"><span className="text-slate-500">Maintenance</span><span className="text-white font-semibold text-right">{mat.maintenance}</span></div>
                  <div className="flex items-start justify-between gap-2"><span className="text-slate-500">Cost</span><span className="font-bold" style={{ color: WOOD_LIGHT }}>{mat.cost}</span></div>
                </div>
                <p className="mt-4 pt-4 border-t border-white/5 text-xs text-slate-300">Best for: <span className="font-semibold text-white">{mat.best}</span></p>
              </GlassCard>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ─── GUARANTEES ─── */}
      <SectionReveal className="relative z-10 py-16">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="text-center mb-10">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: WOOD_LIGHT }}>The Promise</p>
            <h2 className="text-3xl md:text-4xl tracking-tighter font-bold text-white"><WordReveal text="Built To Last, Backed By Us" /></h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { title: "Fixed-Price Contracts", desc: "Quoted price is locked before we dig the first post. No change orders without your sign-off.", icon: ShieldCheck },
              { title: "Lifetime Posts", desc: "Pressure-treated posts carry a lifetime replacement against rot and warping.", icon: Medal },
              { title: "Call Before You Dig", desc: "Free utility locate + call-before-you-dig scheduled on every job — safety first.", icon: CheckCircle },
              { title: "HOA Approval Support", desc: "We handle your HOA packet, setbacks, and code review for free with every estimate.", icon: Certificate },
            ].map((item, i) => (
              <GlassCard key={i} className="p-5 text-center">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: WOOD_GLOW }}>
                  <item.icon size={22} weight="duotone" style={{ color: WOOD_LIGHT }} />
                </div>
                <p className="text-sm font-bold text-white">{item.title}</p>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{item.desc}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ─── EXTENDED FAQ ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4 md:px-6">
          <div className="text-center mb-10">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: WOOD_LIGHT }}>Quick Answers</p>
            <h2 className="text-3xl md:text-4xl tracking-tighter font-bold text-white"><WordReveal text="Before You Book" /></h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { q: "How long does a fence install take?", a: "Most residential installs finish in 1–3 days. Large runs or wrought iron can stretch to a week." },
              { q: "Do you remove my old fence?", a: "Yes — removal, disposal, and post-hole repair are all included in our quote. No separate fees." },
              { q: "Can I stain or paint my wood fence myself?", a: "Absolutely. We recommend waiting 30–60 days for the wood to dry, then apply your preferred stain or sealer." },
              { q: "What about HOA / city permits?", a: "We pull every permit required and submit HOA packets on your behalf. You focus on picking the style." },
              { q: "Do you guarantee your gates?", a: "Yes — gates include 3 years of hardware warranty, with lifetime service on our gate-automation installs." },
              { q: "What if my yard has a slope?", a: "We rack or step the fence to match terrain. Rolling hills get a stepped look; gentle slopes rack beautifully." },
              { q: "Can you build automated gates?", a: "Yes — we install sliding, swing, and bi-parting gates with keypads, remotes, or smartphone apps. Full electrical included." },
              { q: "Do I need a permit for a fence?", a: "Most jurisdictions require a permit for fences over 6 ft or on property lines. We handle the paperwork in every case." },
              { q: "How far in advance should I book?", a: "Peak season (spring/fall) books 3–4 weeks out. Off-season we can often start within a week of signing." },
              { q: "Do you offer financing?", a: "Yes — 0% APR for 12 months on qualifying installs over $5K. Longer terms available with partner lenders." },
              { q: "Do you repair existing fences?", a: "Yes, from single post replacements to full re-decking. Most repairs scheduled within a week." },
              { q: "Can you match an existing fence?", a: "We try hard — bring us photos, and we'll match the stain, post style, and picket profile as closely as possible." },
            ].map((faq, i) => (
              <GlassCard key={i} className="p-5">
                <p className="text-sm font-bold text-white mb-2">{faq.q}</p>
                <p className="text-sm text-slate-400 leading-relaxed">{faq.a}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ─── FINAL CTA ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-4 md:px-6">
          <GlassCard className="p-8 md:p-12 text-center">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: WOOD_LIGHT }}>Ready To Start</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white mb-4">Get A Free On-Site Estimate</h2>
            <p className="text-slate-400 text-lg mb-8 max-w-lg mx-auto">Our estimator walks your property, measures, and gives you a written quote in 30 minutes. Free, no obligation.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <MagneticButton className="px-10 py-4 rounded-full text-base font-semibold text-white inline-flex items-center gap-2 cursor-pointer" style={{ background: WOOD } as React.CSSProperties}>
                <CalendarCheck size={20} weight="duotone" /> Book Estimate
              </MagneticButton>
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/10 inline-flex items-center gap-2 cursor-pointer">
                <Phone size={18} weight="duotone" /> (555) 629-4150
              </MagneticButton>
            </div>
            <p className="mt-6 text-xs text-slate-500">Licensed Contractor &bull; Bonded &bull; Fully Insured &bull; 20+ Years</p>
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              {[
                { label: "Fences Installed", value: "5,200+" },
                { label: "Miles of Fencing", value: "Over 600" },
                { label: "Years In Business", value: "20+" },
                { label: "Customer Rating", value: "4.9 / 5" },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <p className="text-xs text-slate-500 uppercase tracking-widest">{stat.label}</p>
                  <p className="text-2xl font-black mt-1" style={{ color: WOOD_LIGHT }}>{stat.value}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </SectionReveal>

      {/* ─── FOOTER ─── */}
      <footer className="relative z-10 border-t border-white/5 py-8">
        <div className="mx-auto max-w-7xl px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Wall size={16} weight="duotone" style={{ color: WOOD_LIGHT }} />
            <span>Ironwood Fencing &copy; {new Date().getFullYear()}</span>
          </div>
          <p className="text-xs text-slate-600 flex items-center gap-1.5"><svg width="14" height="14" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-sky-500"><path d="M24.3 4.2c-1.5-.4-3.2.1-4.5 1.1-1-.7-2.3-1-3.5-.8-2.4.4-4.2 2.5-4.2 4.9v.6c-3.2.8-6 2.8-7.8 5.6-.3.5-.1 1.1.4 1.4.5.3 1.1.1 1.4-.4 1.5-2.3 3.7-4 6.3-4.7.5-.1 1-.1 1.5 0 .8.2 1.4.8 1.7 1.5.3.8.2 1.6-.2 2.3l-2.8 4.3c-.6.9-.4 2.1.4 2.8l2.5 2.1c.4.3.8.5 1.3.5h5.2c.5 0 1-.2 1.3-.5l1.2-1c.6-.5.8-1.3.6-2l-1-3.2c-.2-.5 0-1.1.4-1.4l3.8-2.5c1.3-.9 2.1-2.3 2.1-3.9V9.6c0-2.5-1.7-4.7-4.1-5.3v-.1z" fill="currentColor"/></svg>Created by <a href="https://bluejayportfolio.com" target="_blank" rel="noopener noreferrer" style={{textDecoration:"underline"}}>bluejayportfolio.com</a></p>
        </div>
      </footer>
    </main>
  );
}
