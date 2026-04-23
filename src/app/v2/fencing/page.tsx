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
  return <div className={`rounded-2xl border border-white/15 bg-white/[0.08] backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] ${className}`}>{children}</div>;
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

/* ───────────────────────── COMPARISON DATA ───────────────────────── */
const comparisonRows = [
  { feature: "Premium-Grade Materials", us: true, them: "Sometimes" },
  { feature: "Licensed & Insured Installers", us: true, them: "Varies" },
  { feature: "Free On-Site Estimates", us: true, them: "Sometimes" },
  { feature: "5-Year Workmanship Warranty", us: true, them: "Rarely" },
  { feature: "Design Consultation Included", us: true, them: "No" },
  { feature: "Full Post-Install Cleanup", us: true, them: "Varies" },
  { feature: "Locally Owned & Operated", us: true, them: "No" },
];

/* ───────────────────────── PRICING DATA ───────────────────────── */
const pricingTiers = [
  {
    name: "Wood Privacy",
    price: "$22–35",
    unit: "per linear ft",
    description: "Classic cedar or redwood privacy fence. Custom staining and sealing included for lasting beauty.",
    features: ["Cedar or Redwood", "Concrete-set posts", "Custom stain/seal", "5-yr workmanship warranty"],
    highlight: false,
  },
  {
    name: "Chain Link",
    price: "$12–18",
    unit: "per linear ft",
    description: "Durable galvanized or vinyl-coated chain link. Ideal for security, pets, and large perimeters.",
    features: ["Galvanized or vinyl-coated", "Fastest installation", "20-yr material warranty", "Commercial grade available"],
    highlight: false,
  },
  {
    name: "Ornamental Iron",
    price: "$35–55",
    unit: "per linear ft",
    description: "Elegant powder-coated wrought iron for maximum curb appeal and a 50+ year lifespan.",
    features: ["Powder-coated finish", "Custom scroll designs", "Pool-code compliant", "Lifetime material warranty"],
    highlight: true,
  },
];

/* ───────────────────────── QUIZ DATA ───────────────────────── */
const quizOptions = [
  {
    label: "Privacy",
    icon: "🪵",
    description: "Maximum seclusion from neighbors and the street.",
    recommendation: "We recommend our Cedar Privacy Fence or Vinyl Privacy panels — 6-ft height, board-on-board design, no gaps. Most popular choice for backyard enclosures.",
  },
  {
    label: "Security",
    icon: "🔒",
    description: "Keeping property secure and deterring trespassers.",
    recommendation: "Chain link with barbed-wire topper or wrought iron with spear finials is your best bet. Both are low-climb and extremely durable. We can add a motorized gate.",
  },
  {
    label: "Decorative",
    icon: "✨",
    description: "Boosting curb appeal and home value.",
    recommendation: "Ornamental iron or vinyl picket fencing elevates your property instantly. We'll match the style to your home's architecture and suggest custom scroll designs.",
  },
  {
    label: "Pet / Child Safe",
    icon: "🐾",
    description: "Keeping pets in and hazards out.",
    recommendation: "We suggest a 4–5 ft vinyl or aluminum fence with no-gap bottom rails. We can bury mesh along the base for dig-proof protection — perfect for dogs of all sizes.",
  },
];

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
  { src: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&q=80", alt: "Property with iron gate" },
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
  const [quizOpenIndex, setQuizOpenIndex] = useState<number | null>(null);

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

      {/* ─── URGENCY STRIP ─── */}
      <div className="fixed top-[72px] left-0 right-0 z-40 flex items-center justify-center gap-3 py-2 px-4" style={{ background: WOOD, opacity: 0.95 }}>
        <span className="relative flex h-2.5 w-2.5 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-60" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
        </span>
        <span className="text-xs font-semibold text-white tracking-wide">Free Estimates Available This Week — Call (206) 381-7429 to Book</span>
      </div>

      {/* ─── 1. HERO ─── */}
      <section className="relative min-h-[100dvh] flex items-center pt-24 z-10">
        <div className="absolute inset-0 z-0">
          <img src="https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=1400&q=80" alt="Beautiful wood fence" className="w-full h-full object-cover object-center" />
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
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/15 flex items-center gap-2 cursor-pointer">
                <Phone size={18} weight="duotone" /> (206) 381-7429
              </MagneticButton>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 1.0 }} className="flex flex-wrap gap-2">
              {["Licensed & Insured", "4.9★ Rated", "Free Estimates", "Lifetime Warranty"].map((badge) => (
                <span key={badge} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold border" style={{ borderColor: `${WOOD_LIGHT}44`, color: WOOD_LIGHT, background: `${WOOD}22` }}>{badge}</span>
              ))}
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

      {/* ─── 7. TESTIMONIALS ─── */}
      <SectionReveal id="testimonials" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: WOOD_LIGHT }}>Client Reviews</p>
            {/* Google Reviews header */}
            <div className="flex items-center justify-center gap-3 mb-5">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/15 bg-white/[0.07] text-sm font-medium text-white">
                {/* Google G SVG */}
                <svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span className="flex gap-0.5">{[1,2,3,4,5].map((s) => (<Star key={s} size={13} weight="fill" style={{ color: "#facc15" }} />))}</span>
                <span className="text-slate-300">4.9 · 218 Google reviews</span>
              </span>
            </div>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="What Our Clients Say" />
            </h2>
          </div>
          <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {testimonials.map((t, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="p-6 h-full flex flex-col">
                  <Quotes size={28} weight="fill" style={{ color: WOOD_LIGHT }} className="mb-3 opacity-50" />
                  <p className="text-slate-300 leading-relaxed flex-1 text-sm">{t.text}</p>
                  <div className="mt-4 pt-4 border-t border-white/8 flex items-center justify-between">
                    <span className="text-sm font-semibold text-white">{t.name}</span>
                    <div className="flex gap-0.5">{Array.from({ length: t.rating }).map((_, j) => (<Star key={j} size={12} weight="fill" style={{ color: WOOD_LIGHT }} />))}</div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
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
                      <div className="pt-3 border-t border-white/8">
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

      {/* ─── 10. COMPARISON TABLE ─── */}
      <SectionReveal id="compare" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: WOOD_LIGHT }}>Why Choose Us</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white">Ironwood vs. The Competition</h2>
          </div>
          <GlassCard className="overflow-hidden">
            <div className="grid grid-cols-3 px-6 py-4 border-b border-white/15 text-sm font-semibold text-slate-400">
              <span>Feature</span>
              <span className="text-center" style={{ color: WOOD_LIGHT }}>Ironwood Fencing</span>
              <span className="text-center">Other Companies</span>
            </div>
            {comparisonRows.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 px-6 py-4 text-sm ${i % 2 === 0 ? "bg-white/[0.07]" : ""} ${i < comparisonRows.length - 1 ? "border-b border-white/8" : ""}`}>
                <span className="text-slate-300">{row.feature}</span>
                <span className="text-center">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full" style={{ background: `${WOOD}33` }}>
                    <CheckCircle size={14} weight="fill" style={{ color: WOOD_LIGHT }} />
                  </span>
                </span>
                <span className="text-center text-slate-500 text-xs self-center">{row.them}</span>
              </div>
            ))}
          </GlassCard>
        </div>
      </SectionReveal>

      {/* ─── 11. PRICING TIERS ─── */}
      <SectionReveal id="pricing" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: WOOD_LIGHT }}>Transparent Pricing</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white">Pricing by Material Type</h2>
            <p className="text-slate-400 mt-3 max-w-lg mx-auto">Every estimate is free and itemized. No surprise charges — just honest pricing upfront.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pricingTiers.map((tier, i) => (
              <div key={i} className={`relative rounded-2xl overflow-hidden ${tier.highlight ? "ring-2" : "border border-white/15"}`} style={tier.highlight ? { ringColor: WOOD_LIGHT } as React.CSSProperties : {}}>
                {tier.highlight && (
                  <div className="absolute inset-0 rounded-2xl ring-2 ring-inset pointer-events-none" style={{ borderColor: WOOD_LIGHT, boxShadow: `0 0 24px ${WOOD_GLOW}` }} />
                )}
                {tier.highlight && (
                  <div className="text-center py-1.5 text-xs font-bold tracking-widest uppercase text-white" style={{ background: WOOD }}>Most Popular</div>
                )}
                <GlassCard className={`p-7 h-full flex flex-col ${tier.highlight ? "rounded-t-none" : ""}`}>
                  <h3 className="text-xl font-bold text-white mb-1">{tier.name}</h3>
                  <div className="flex items-end gap-1 mb-1">
                    <span className="text-3xl font-extrabold" style={{ color: WOOD_LIGHT }}>{tier.price}</span>
                    <span className="text-slate-400 text-sm mb-1">{tier.unit}</span>
                  </div>
                  <p className="text-sm text-slate-400 mb-6 leading-relaxed">{tier.description}</p>
                  <ul className="space-y-3 flex-1">
                    {tier.features.map((feat, j) => (
                      <li key={j} className="flex items-center gap-2 text-sm text-slate-300">
                        <CheckCircle size={16} weight="fill" style={{ color: WOOD_LIGHT }} className="shrink-0" />
                        {feat}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8">
                    <MagneticButton className="w-full py-3 rounded-xl text-sm font-semibold text-white text-center cursor-pointer" style={{ background: tier.highlight ? WOOD : "rgba(255,255,255,0.06)", border: tier.highlight ? "none" : "1px solid rgba(255,255,255,0.1)" } as React.CSSProperties}>
                      Get Free Quote
                    </MagneticButton>
                  </div>
                </GlassCard>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-slate-500 mt-6">Prices are estimates. Final pricing depends on property terrain, gate count, and local permit fees. All quotes are written and itemized.</p>
        </div>
      </SectionReveal>

      {/* ─── 12. VIDEO PLACEHOLDER ─── */}
      <SectionReveal id="video" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-4 md:px-6">
          <div className="text-center mb-10">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: WOOD_LIGHT }}>See Our Work</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white">Watch Our Crew in Action</h2>
          </div>
          <div className="relative rounded-2xl overflow-hidden aspect-video group cursor-pointer">
            <img
              src="https://images.unsplash.com/photo-1621274147744-cfb5694bb233?w=1200&q=80"
              alt="Fencing crew installing cedar fence"
              className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.2) 100%)" }} />
            {/* Play button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                transition={springFast}
                className="w-20 h-20 rounded-full flex items-center justify-center shadow-2xl"
                style={{ background: WOOD, boxShadow: `0 0 40px ${WOOD_GLOW}` }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="white" className="ml-1.5">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </motion.div>
            </div>
            <div className="absolute bottom-6 left-0 right-0 text-center">
              <p className="text-white font-semibold text-lg drop-shadow-lg">Ironwood Fencing — Installation Process</p>
              <p className="text-slate-300 text-sm mt-1">From estimate to completion in 3 days</p>
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* ─── 13. FENCE TYPE QUIZ ─── */}
      <SectionReveal id="quiz" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4 md:px-6">
          <div className="text-center mb-10">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: WOOD_LIGHT }}>Find Your Fence</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white">What Type of Fence Do You Need?</h2>
            <p className="text-slate-400 mt-3">Select your primary goal and we&apos;ll recommend the perfect fence type for your property.</p>
          </div>
          <div className="space-y-3">
            {quizOptions.map((opt, i) => (
              <div key={i}>
                <button
                  onClick={() => setQuizOpenIndex(quizOpenIndex === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 rounded-2xl text-left transition-all cursor-pointer"
                  style={{
                    background: quizOpenIndex === i ? `${WOOD}22` : "rgba(255,255,255,0.06)",
                    border: `1px solid ${quizOpenIndex === i ? `${WOOD_LIGHT}44` : "rgba(255,255,255,0.08)"}`,
                  }}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{opt.icon}</span>
                    <div className="text-left">
                      <p className="font-semibold text-white text-base">{opt.label}</p>
                      <p className="text-sm text-slate-400 mt-0.5">{opt.description}</p>
                    </div>
                  </div>
                  <motion.div animate={{ rotate: quizOpenIndex === i ? 180 : 0 }} transition={spring} className="shrink-0 ml-4">
                    <CaretDown size={20} style={{ color: quizOpenIndex === i ? WOOD_LIGHT : "#64748b" }} />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {quizOpenIndex === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={spring}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pt-3 pb-5 rounded-b-2xl -mt-2" style={{ background: `${WOOD}11`, borderLeft: `2px solid ${WOOD_LIGHT}55`, marginLeft: "1px", marginRight: "1px" }}>
                        <div className="flex items-start gap-3">
                          <CheckCircle size={20} weight="fill" style={{ color: WOOD_LIGHT }} className="shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-semibold text-white mb-1">Our Recommendation</p>
                            <p className="text-sm text-slate-400 leading-relaxed">{opt.recommendation}</p>
                            <MagneticButton className="mt-4 px-6 py-2.5 rounded-full text-xs font-semibold text-white inline-flex items-center gap-2 cursor-pointer" style={{ background: WOOD } as React.CSSProperties}>
                              Get Free Estimate <ArrowRight size={14} weight="bold" />
                            </MagneticButton>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ─── 14. CERTIFICATIONS BADGE ROW ─── */}
      <SectionReveal className="relative z-10 py-10 md:py-14">
        <div className="mx-auto max-w-5xl px-4 md:px-6">
          <p className="text-center text-xs uppercase tracking-widest text-slate-500 mb-6">Certifications &amp; Affiliations</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {[
              "WA State Licensed #IRONWF894BX",
              "Fully Bonded & Insured",
              "BBB Accredited A+",
              "AFA Member",
              "OSHA Safety Certified",
              "Free 811 Utility Locate",
            ].map((cert) => (
              <span key={cert} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-semibold" style={{ borderColor: `${STONE}55`, color: STONE_LIGHT, background: `${STONE}11` }}>
                <ShieldCheck size={13} weight="fill" style={{ color: WOOD_LIGHT }} />
                {cert}
              </span>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ─── 15. SERVICE AREA ─── */}
      <SectionReveal id="service-area" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-4 md:px-6">
          <div className="text-center mb-10">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: WOOD_LIGHT }}>Where We Work</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white">Service Area</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { area: "Seattle & Eastside", detail: "King County — Bellevue, Kirkland, Redmond, Renton", time: "Same-day available" },
              { area: "Snohomish County", detail: "Everett, Lynnwood, Marysville, Edmonds, Shoreline", time: "Next-day available" },
              { area: "Pierce County", detail: "Tacoma, Puyallup, Federal Way, Lakewood, Sumner", time: "2–3 day lead time" },
              { area: "Kitsap Peninsula", detail: "Bremerton, Port Orchard, Silverdale, Poulsbo, Bainbridge", time: "3–5 day lead time" },
            ].map((zone, i) => (
              <GlassCard key={i} className="p-6">
                <div className="flex items-start gap-3">
                  <MapPin size={20} weight="fill" style={{ color: WOOD_LIGHT }} className="shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-white text-sm">{zone.area}</h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{zone.detail}</p>
                    <div className="flex items-center gap-1.5 mt-3">
                      <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: WOOD_LIGHT }} />
                      <span className="text-xs font-medium" style={{ color: WOOD_LIGHT }}>{zone.time}</span>
                    </div>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 text-sm text-slate-400">
            <span className="flex items-center gap-2"><Clock size={16} style={{ color: WOOD_LIGHT }} /> Mon–Sat 7 am – 6 pm</span>
            <span className="hidden sm:block text-slate-600">·</span>
            <span className="flex items-center gap-2"><Phone size={16} style={{ color: WOOD_LIGHT }} /> (206) 381-7429</span>
          </div>
        </div>
      </SectionReveal>

      {/* ─── 16. CONTACT FORM ─── */}
      <SectionReveal id="contact" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4 md:px-6">
          <div className="text-center mb-10">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: WOOD_LIGHT }}>Get in Touch</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white">Request Your Free Estimate</h2>
            <p className="text-slate-400 mt-3">We&apos;ll come to your property, take measurements, and email you a detailed written quote within 24 hours.</p>
          </div>
          <GlassCard className="p-8 md:p-10">
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
                  <input
                    type="text"
                    placeholder="Jane Smith"
                    className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition-all"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = `${WOOD_LIGHT}66`; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="(206) 555-0100"
                    className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition-all"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = `${WOOD_LIGHT}66`; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Fence Type</label>
                <select
                  className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none transition-all appearance-none cursor-pointer"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#cbd5e1" }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = `${WOOD_LIGHT}66`; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
                >
                  <option value="" style={{ background: "#1a1816" }}>Select fence type…</option>
                  <option value="wood" style={{ background: "#1a1816" }}>Wood Privacy Fence</option>
                  <option value="vinyl" style={{ background: "#1a1816" }}>Vinyl Fence</option>
                  <option value="chain-link" style={{ background: "#1a1816" }}>Chain Link Fence</option>
                  <option value="iron" style={{ background: "#1a1816" }}>Ornamental Iron / Wrought Iron</option>
                  <option value="gate" style={{ background: "#1a1816" }}>Gate Installation</option>
                  <option value="repair" style={{ background: "#1a1816" }}>Fence Repair</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Project Details</label>
                <textarea
                  rows={4}
                  placeholder="Describe your project — approximate linear footage, property type, any HOA or permit requirements…"
                  className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition-all resize-none"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = `${WOOD_LIGHT}66`; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
                />
              </div>
              <MagneticButton
                className="w-full py-4 rounded-xl text-base font-semibold text-white flex items-center justify-center gap-2 cursor-pointer"
                style={{ background: WOOD } as React.CSSProperties}
              >
                <CalendarCheck size={20} weight="duotone" />
                Request Free Estimate
              </MagneticButton>
              <p className="text-center text-xs text-slate-500">No spam, no pressure. We respond within 2 hours during business hours.</p>
            </form>
          </GlassCard>
        </div>
      </SectionReveal>

      {/* ─── 17. FREE QUOTE CTA ─── */}
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
                  <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/15 flex items-center gap-2 cursor-pointer">
                    <Phone size={18} weight="duotone" /> Call Now
                  </MagneticButton>
                </div>
              </motion.div>
            </div>
          </ShimmerBorder>
        </div>
      </SectionReveal>

      {/* ─── FOOTER ─── */}
      <footer className="relative z-10 border-t border-white/8 py-8">
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
