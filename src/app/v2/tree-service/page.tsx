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
  Tree,
  Leaf,
  Axe,
  ShieldCheck,
  Phone,
  MapPin,
  Clock,
  ArrowRight,
  CaretDown,
  Quotes,
  CalendarCheck,
  CheckCircle,
  Warning,
  Lightning,
  X,
  List,
  SealCheck,
  Recycle,
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
const BG = "#0a1a0f";
const GREEN = "#15803d";
const GREEN_LIGHT = "#22c55e";
const BROWN = "#78350f";
const BROWN_LIGHT = "#a16207";
const GREEN_GLOW = "rgba(21, 128, 61, 0.15)";
const BROWN_GLOW = "rgba(120, 53, 15, 0.15)";

/* ───────────────────────── FLOATING LEAVES ───────────────────────── */
function FloatingLeaves() {
  const particles = Array.from({ length: 22 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 8,
    duration: 7 + Math.random() * 6,
    size: 4 + Math.random() * 6,
    opacity: 0.15 + Math.random() * 0.3,
    color: [GREEN_LIGHT, "#86efac", BROWN_LIGHT, "#a3e635"][Math.floor(Math.random() * 4)],
    rotate: Math.random() * 360,
  }));

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden hidden md:block">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute"
          style={{
            left: `${p.x}%`,
            width: p.size,
            height: p.size * 1.4,
            background: p.color,
            borderRadius: "50% 0% 50% 50%",
            willChange: "transform, opacity",
          }}
          animate={{
            y: ["-10vh", "110vh"],
            x: [0, (Math.random() - 0.5) * 60],
            rotate: [p.rotate, p.rotate + 360],
            opacity: [0, p.opacity, p.opacity, 0],
          }}
          transition={{
            y: { duration: p.duration, repeat: Infinity, delay: p.delay, ease: "linear" },
            x: { duration: p.duration * 0.7, repeat: Infinity, delay: p.delay, ease: "easeInOut" },
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
      <motion.div className="absolute inset-0 rounded-2xl" style={{ background: `conic-gradient(from 0deg, transparent, ${GREEN}, transparent, ${GREEN_LIGHT}, transparent)`, willChange: "transform" }} animate={{ rotate: [0, 360] }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} />
      <div className="relative rounded-2xl z-10" style={{ background: BG }}>{children}</div>
    </div>
  );
}

/* ───────────────────────── TREE SVG ───────────────────────── */
function TreeSVG() {
  return (
    <div className="relative flex items-center justify-center">
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{ background: `radial-gradient(circle, ${GREEN_GLOW} 0%, transparent 70%)`, filter: "blur(40px)" }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      <svg viewBox="0 0 200 240" className="relative z-10 w-48 h-56 md:w-56 md:h-72" fill="none">
        <motion.circle cx="100" cy="110" r="92" stroke={GREEN} strokeWidth="0.5" opacity={0.12}
          animate={{ r: [90, 94, 90] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} />

        {/* Tree trunk */}
        <motion.path d="M90 140 L88 210 L112 210 L110 140"
          fill={`${BROWN}22`} stroke={BROWN} strokeWidth="2" strokeLinejoin="round"
          initial={{ scaleY: 0, opacity: 0 }} animate={{ scaleY: 1, opacity: 1 }}
          style={{ transformOrigin: "50% 100%" }}
          transition={{ duration: 0.8, delay: 0.2 }} />
        <path d="M93 145 L92 205 L108 205 L107 145" fill={`${BROWN}0d`} />

        {/* Trunk texture lines */}
        {[155, 170, 185, 195].map((y, i) => (
          <motion.path key={i} d={`M92 ${y} Q100 ${y + 3} 108 ${y}`} stroke={BROWN_LIGHT} strokeWidth="0.5" opacity={0.3}
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.8 + i * 0.1 }} />
        ))}

        {/* Root base */}
        <motion.path d="M85 210 C80 212 70 215 68 218 M115 210 C120 212 130 215 132 218"
          stroke={BROWN} strokeWidth="2" fill="none" strokeLinecap="round"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.6, duration: 0.5 }} />

        {/* Crown layer 1 (bottom, widest) */}
        <motion.path d="M40 145 L100 80 L160 145 Z"
          fill={`${GREEN}22`} stroke={GREEN} strokeWidth="2" strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }} />
        <path d="M55 140 L100 92 L145 140 Z" fill={`${GREEN}0d`} />

        {/* Crown layer 2 (middle) */}
        <motion.path d="M50 110 L100 50 L150 110 Z"
          fill={`${GREEN}22`} stroke={GREEN} strokeWidth="2" strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }} />
        <path d="M62 105 L100 60 L138 105 Z" fill={`${GREEN}0d`} />

        {/* Crown layer 3 (top) */}
        <motion.path d="M62 75 L100 22 L138 75 Z"
          fill={`${GREEN}22`} stroke={GREEN_LIGHT} strokeWidth="2" strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1, delay: 1.6 }} />
        <path d="M72 70 L100 32 L128 70 Z" fill={`${GREEN_LIGHT}0d`} />

        {/* Falling leaves */}
        {[{x: 35, delay: 2}, {x: 155, delay: 2.3}, {x: 50, delay: 2.6}, {x: 140, delay: 2.9}].map((leaf, i) => (
          <motion.g key={i}>
            <motion.path d={`M${leaf.x} 60 Q${leaf.x + 5} 55 ${leaf.x + 8} 60 Q${leaf.x + 5} 65 ${leaf.x} 60`}
              fill={i % 2 === 0 ? `${GREEN_LIGHT}44` : `${BROWN_LIGHT}44`}
              animate={{
                y: [0, 80, 160],
                x: [0, (i % 2 === 0 ? 15 : -15), (i % 2 === 0 ? -5 : 5)],
                rotate: [0, 180, 360],
                opacity: [0.8, 0.5, 0],
              }}
              transition={{ duration: 4, repeat: Infinity, delay: leaf.delay, ease: "easeIn" }} />
          </motion.g>
        ))}

        {/* Ground line */}
        <motion.line x1="40" y1="220" x2="160" y2="220" stroke={BROWN} strokeWidth="1" opacity={0.3}
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.4, duration: 0.6 }} />
        <motion.path d="M45 220 Q100 225 155 220" stroke={GREEN} strokeWidth="1" opacity={0.2} fill="none"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.5, duration: 0.6 }} />

        {/* Sparkle accents */}
        <motion.circle cx="170" cy="30" r="3" fill={GREEN_LIGHT}
          animate={{ opacity: [0.2, 1, 0.2], scale: [0.7, 1.3, 0.7] }}
          transition={{ duration: 2.5, repeat: Infinity }} />
        <motion.circle cx="25" cy="55" r="2" fill={BROWN_LIGHT}
          animate={{ opacity: [0.1, 0.8, 0.1], scale: [0.5, 1.2, 0.5] }}
          transition={{ duration: 3, repeat: Infinity, delay: 0.8 }} />
        <motion.circle cx="180" cy="130" r="2.5" fill={GREEN_LIGHT}
          animate={{ opacity: [0.15, 0.7, 0.15] }}
          transition={{ duration: 2, repeat: Infinity, delay: 1.2 }} />
        <motion.circle cx="18" cy="150" r="2" fill={BROWN_LIGHT}
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
  { title: "Tree Removal", description: "Safe, efficient removal of dead, diseased, or hazardous trees of any size. Crane-assisted removals for tight spaces. Stump included or optional.", icon: Axe },
  { title: "Tree Trimming", description: "Crown thinning, deadwooding, shaping, and structural pruning by ISA-certified arborists. Proper cuts that promote healthy growth.", icon: Tree },
  { title: "Stump Grinding", description: "Complete stump removal below grade level using commercial grinders. Backfill with clean wood chips and topsoil. Ready for replanting or landscaping.", icon: Recycle },
  { title: "Emergency Service", description: "24/7 storm damage response. Fallen trees on structures, power lines, or roadways. Fast, safe, insured removal when it matters most.", icon: Lightning },
  { title: "Arborist Consultation", description: "Tree health assessments, disease diagnosis, risk evaluations, and preservation plans from ISA-certified arborists. Written reports for insurance or permits.", icon: SealCheck },
  { title: "Land Clearing", description: "Residential lot clearing, brush removal, and selective thinning for new construction, firebreaks, or property improvement. Eco-friendly disposal.", icon: Leaf },
];

const stats = [
  { value: "10K+", label: "Trees Serviced" },
  { value: "20+", label: "Years Experience" },
  { value: "4.9", label: "Star Rating" },
  { value: "24/7", label: "Emergency Response" },
];

const galleryPhotos = [
  { src: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&q=80", alt: "Large tree trimming" },
  { src: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=600&q=80", alt: "Healthy trees in landscape" },
  { src: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=600&q=80", alt: "Forest canopy care" },
  { src: "https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=600&q=80", alt: "Sunlight through trees" },
  { src: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=80", alt: "Professional tree work" },
  { src: "https://images.unsplash.com/photo-1476231682828-37e571bc172f?w=600&q=80", alt: "Managed tree landscape" },
];

const processSteps = [
  { step: "01", title: "Free On-Site Assessment", description: "Our certified arborist visits your property, evaluates tree health and risk, and provides a detailed written estimate with options." },
  { step: "02", title: "Planning & Permits", description: "We coordinate any required permits, check for protected species, and plan the safest approach for your property and surroundings." },
  { step: "03", title: "Professional Execution", description: "Our experienced crew uses industry-standard rigging, climbing, and crane techniques to complete the work safely and efficiently." },
  { step: "04", title: "Complete Cleanup", description: "We chip all brush on-site, haul away debris, rake the area clean, and leave your property looking better than we found it." },
];

const seasonalTips = [
  { season: "Spring", tip: "Inspect trees for winter damage. Schedule pruning for flowering trees after blooms fade. Watch for early pest activity." },
  { season: "Summer", tip: "Deep water during drought. Watch for signs of stress like wilting or early leaf drop. Avoid heavy pruning in extreme heat." },
  { season: "Fall", tip: "Best time for major pruning on most species. Remove dead branches before winter storms. Schedule stump grinding." },
  { season: "Winter", tip: "Inspect for structural issues visible without foliage. Remove hazardous limbs before ice storms. Plan spring plantings." },
];

const testimonials = [
  { name: "Daniel & Susan W.", text: "A massive oak was leaning toward our house after the storm. They responded within two hours and had it safely removed by sunset. Absolutely incredible team.", rating: 5 },
  { name: "Mark P.", text: "Their arborist saved a 100-year-old maple we thought was dying. Six months later, it is healthier than ever. True tree experts who care about preservation.", rating: 5 },
  { name: "Lisa H.", text: "They cleared half an acre for our new home build. The crew was efficient, respectful of the trees we wanted to keep, and cleaned up perfectly.", rating: 5 },
];

const faqData = [
  { title: "Do I need a permit to remove a tree?", description: "It depends on your municipality and the tree species. Many cities require permits for trees above a certain diameter. Our team handles the entire permit process and knows local regulations for every area we serve." },
  { title: "Is tree removal covered by insurance?", description: "If a tree falls on a structure, most homeowner policies cover removal. For preventive removal, some policies cover hazardous trees with an arborist report. We provide detailed assessments that insurance companies accept." },
  { title: "What happens to the wood after removal?", description: "We can chip branches for mulch, cut firewood-length logs for you to keep, or haul everything away. For large hardwood trees, we can coordinate with local mills if you want the lumber." },
  { title: "How much does tree removal cost?", description: "Costs vary based on tree size, location, complexity, and whether stump grinding is included. Small trees start around $300, large removals can range from $1,000 to $3,000+. We always provide a free, no-obligation estimate." },
  { title: "Are you insured?", description: "Yes. We carry $2 million in general liability, workers compensation, and commercial auto insurance. We are happy to provide certificates of insurance to you or your HOA upon request." },
];

/* ───────────────────────── COMPARISON DATA ───────────────────────── */
const comparisonRows = [
  { feature: "ISA-Certified Arborists On Every Job", them: "Sometimes" },
  { feature: "Free On-Site Written Estimate", them: "Phone Quote Only" },
  { feature: "Stump Grinding Included Option", them: "Always Extra Fee" },
  { feature: "$2M General Liability Insurance", them: "Often Underinsured" },
  { feature: "24/7 Emergency Storm Response", them: "Business Hours" },
  { feature: "Complete Cleanup & Debris Hauled", them: "Extra Charge" },
  { feature: "Permit Coordination Handled for You", them: "You Handle It" },
];

/* ───────────────────────── PRICING DATA ───────────────────────── */
const pricingTiers = [
  {
    title: "Tree Trimming",
    price: "$199+",
    unit: "per tree",
    desc: "Crown cleaning, deadwooding, and shaping by ISA-certified arborists using proper cut techniques.",
    features: ["ISA-certified arborist on-site", "All cuts follow ANSI A300", "Debris chipped on-site", "Written work order provided"],
    cta: "Get Estimate",
    highlight: false,
  },
  {
    title: "Tree Removal",
    price: "$450+",
    unit: "per tree",
    desc: "Safe removal of any size tree with complete cleanup, stump option, and all debris hauled off your property.",
    features: ["Any size tree handled", "Stump grinding available", "Crane-assisted if needed", "Fully insured + permitted"],
    cta: "Free Quote",
    highlight: true,
  },
  {
    title: "Arborist Report",
    price: "$199",
    unit: "written report",
    desc: "Certified tree health assessment accepted by insurance companies, city permits, and HOAs.",
    features: ["Insurance-accepted format", "Full risk assessment", "Preservation plan options", "City permit support"],
    cta: "Schedule Visit",
    highlight: false,
  },
];

/* ───────────────────────── QUIZ DATA ───────────────────────── */
const treeQuizOptions = [
  { label: "Tree Needs Removing", urgency: "Priority Service", color: GREEN, action: "We assess and can often respond within 48 hours. For hazardous trees near structures, call now for an emergency same-day consult at (206) 471-8349." },
  { label: "Branches Need Trimming", urgency: "Preventive Care", color: GREEN_LIGHT, action: "Regular pruning extends tree life and prevents storm damage. Best done in fall or winter. We send a certified arborist for a free on-site assessment." },
  { label: "Tree Looks Unhealthy", urgency: "Arborist Needed", color: BROWN_LIGHT, action: "Disease, pests, or root issues — our ISA arborists can diagnose and prescribe treatment before the tree is lost. Early intervention saves trees." },
  { label: "Storm Damage / Emergency", urgency: "CALL NOW", color: "#ef4444", action: "Fallen trees on structures need immediate attention. We respond 24/7 to storm emergencies with full insurance coordination and city communication." },
];

/* ───────────────────────── QUIZ OPTION COMPONENT ───────────────────────── */
function TreeQuizOption({ opt }: { opt: { label: string; urgency: string; color: string; action: string } }) {
  const [selected, setSelected] = useState(false);
  return (
    <div>
      <button
        onClick={() => setSelected(!selected)}
        className="w-full text-left p-4 rounded-xl border transition-all cursor-pointer"
        style={{
          borderColor: selected ? opt.color : "rgba(255,255,255,0.1)",
          background: selected ? `${opt.color}18` : "rgba(255,255,255,0.06)",
        }}
      >
        <p className="text-sm font-semibold text-white mb-1">{opt.label}</p>
        <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: `${opt.color}22`, color: opt.color }}>{opt.urgency}</span>
      </button>
      <AnimatePresence initial={false}>
        {selected && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="mt-2 p-3 rounded-xl text-sm text-slate-300 flex items-center justify-between gap-3" style={{ background: "rgba(255,255,255,0.08)", borderLeft: `3px solid ${opt.color}` }}>
              <span>{opt.action}</span>
              <a href="tel:+12064718349" className="shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold text-white" style={{ background: opt.color }}>Call Now</a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════════ */
export default function V2TreeServicePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden" style={{ background: BG, color: "#f1f5f9" }}>
      <FloatingLeaves />

      {/* ─── NAV ─── */}
      <motion.nav initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-4">
          <GlassCard className="flex items-center justify-between px-4 md:px-6 py-3">
            <div className="flex items-center gap-2">
              <Tree size={24} weight="duotone" style={{ color: GREEN_LIGHT }} />
              <span className="text-lg font-bold tracking-tight text-white">Canopy Tree Experts</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
              <a href="#services" className="hover:text-white transition-colors">Services</a>
              <a href="#gallery" className="hover:text-white transition-colors">Gallery</a>
              <a href="#process" className="hover:text-white transition-colors">Process</a>
              <a href="#testimonials" className="hover:text-white transition-colors">Reviews</a>
            </div>
            <div className="flex items-center gap-3">
              <MagneticButton className="px-4 md:px-5 py-2 rounded-full text-sm font-semibold text-white transition-colors" style={{ background: GREEN } as React.CSSProperties}>
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
          <img src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1400&q=80" alt="Majestic tree canopy" className="w-full h-full object-cover object-center" />
          <div className="absolute inset-0" style={{ background: `linear-gradient(to right, ${BG} 45%, transparent 100%)` }} />
          <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${BG} 10%, transparent 50%)` }} />
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          <div className="space-y-8">
            <motion.p initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ ...spring, delay: 0.1 }} className="text-sm uppercase tracking-widest" style={{ color: GREEN_LIGHT }}>
              ISA-Certified Arborists
            </motion.p>
            <h1 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white" style={{ textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>
              <WordReveal text="Expert Tree Care You Can Trust" />
            </h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.6 }} className="text-lg text-slate-300 max-w-md leading-relaxed">
              From precise trimming to complete removal, our certified arborists
              deliver safe, professional tree services backed by decades of
              experience and fully insured work.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.8 }} className="flex flex-wrap gap-4">
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white flex items-center gap-2 cursor-pointer" style={{ background: GREEN } as React.CSSProperties}>
                Get Free Estimate <ArrowRight size={18} weight="bold" />
              </MagneticButton>
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/15 flex items-center gap-2 cursor-pointer">
                <Phone size={18} weight="duotone" /> (206) 471-8349
              </MagneticButton>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 1 }} className="flex flex-wrap gap-2">
              {["ISA-Certified Arborists", "$2M Insured", "Free Estimates", "24/7 Emergency"].map((badge) => (
                <span key={badge} className="px-3 py-1.5 text-xs font-medium rounded-full" style={{ background: "rgba(21,128,61,0.2)", color: GREEN_LIGHT, border: "1px solid rgba(21,128,61,0.3)" }}>{badge}</span>
              ))}
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ ...spring, delay: 1.1 }} className="flex items-center gap-3 text-sm text-slate-400">
              <Warning size={16} weight="duotone" style={{ color: GREEN_LIGHT }} />
              <span>24/7 Emergency Storm Response Available</span>
            </motion.div>
          </div>
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ ...spring, delay: 0.3 }} className="hidden md:flex items-center justify-center lg:justify-end">
            <TreeSVG />
          </motion.div>
        </div>
      </section>

      {/* ─── URGENCY STRIP ─── */}
      <div className="relative z-10 py-3" style={{ background: GREEN }}>
        <div className="mx-auto max-w-7xl px-4 md:px-6 flex items-center justify-center gap-3 text-white text-sm font-medium flex-wrap text-center">
          <motion.div className="w-2 h-2 rounded-full bg-white shrink-0" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
          <span>Storm Damage? Same-Day Emergency Response · Call <a href="tel:+12064718349" className="underline font-bold">(206) 471-8349</a></span>
          <motion.div className="w-2 h-2 rounded-full bg-white shrink-0" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.75 }} />
        </div>
      </div>

      {/* ─── 2. STATS ─── */}
      <SectionReveal className="relative z-10 pb-8">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <GlassCard className="p-6 md:p-8">
            <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
              {stats.map((stat, i) => (
                <motion.div key={i} variants={fadeUp} className="text-center">
                  <p className="text-3xl md:text-4xl font-bold" style={{ color: GREEN_LIGHT }}>{stat.value}</p>
                  <p className="text-sm text-slate-400 mt-1">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </GlassCard>
        </div>
      </SectionReveal>

      {/* ─── CERTIFICATIONS ─── */}
      <SectionReveal className="relative z-10 py-10 md:py-14">
        <div className="mx-auto max-w-5xl px-4 md:px-6">
          <div className="text-center mb-8">
            <p className="text-sm uppercase tracking-widest" style={{ color: GREEN_LIGHT }}>Licensed, Certified &amp; Trusted</p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {["ISA-Certified Arborists", "TCIA Member", "BBB Accredited", "$2M General Liability", "Workers Comp", "WA Contractor License", "Fully Bonded"].map((cert) => (
              <span key={cert} className="flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium text-slate-300" style={{ borderColor: "rgba(21,128,61,0.35)", background: "rgba(21,128,61,0.08)" }}>
                <SealCheck size={14} weight="duotone" style={{ color: GREEN_LIGHT }} />
                {cert}
              </span>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ─── 3. SERVICES ─── */}
      <SectionReveal id="services" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GREEN_LIGHT }}>Our Services</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Complete Tree Solutions" />
            </h2>
          </div>
          <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {services.map((svc, i) => (
              <motion.div key={i} variants={fadeUp}>
                <motion.div whileHover={{ scale: 1.03 }} transition={springGentle} style={{ willChange: "transform" }}>
                  <GlassCard className="p-6 h-full">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: GREEN_GLOW }}>
                      <svc.icon size={24} weight="duotone" style={{ color: GREEN_LIGHT }} />
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

      {/* ─── PRICING TIERS ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GREEN_LIGHT }}>Transparent Pricing</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white mb-4">
              <WordReveal text="Free Estimates — No Surprises" />
            </h2>
            <p className="text-slate-400 max-w-md mx-auto text-sm">Every job starts with a free on-site assessment. You get a written quote before any work begins.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pricingTiers.map((tier, i) => (
              <motion.div key={i} initial="hidden" variants={fadeUp} whileInView="show" viewport={{ once: true }}>
                {tier.highlight ? (
                  <ShimmerBorder className="h-full">
                    <div className="p-6 h-full flex flex-col">
                      <span className="text-xs font-bold px-3 py-1 rounded-full mb-4 self-start" style={{ background: GREEN, color: "white" }}>Most Requested</span>
                      <h3 className="text-xl font-bold text-white mb-1">{tier.title}</h3>
                      <p className="text-3xl font-black tracking-tight mb-1" style={{ color: GREEN_LIGHT }}>{tier.price}</p>
                      <p className="text-xs text-slate-400 mb-4">{tier.unit}</p>
                      <p className="text-sm text-slate-400 leading-relaxed mb-6 flex-1">{tier.desc}</p>
                      <ul className="space-y-2 mb-6">
                        {tier.features.map((f, j) => <li key={j} className="flex items-center gap-2 text-sm text-slate-300"><CheckCircle size={14} weight="fill" style={{ color: "#4ade80" }} />{f}</li>)}
                      </ul>
                      <MagneticButton className="w-full py-3 rounded-full text-sm font-semibold text-white cursor-pointer" style={{ background: GREEN } as React.CSSProperties}>{tier.cta}</MagneticButton>
                    </div>
                  </ShimmerBorder>
                ) : (
                  <GlassCard className="p-6 h-full flex flex-col">
                    <h3 className="text-xl font-bold text-white mb-1">{tier.title}</h3>
                    <p className="text-3xl font-black tracking-tight mb-1" style={{ color: GREEN_LIGHT }}>{tier.price}</p>
                    <p className="text-xs text-slate-400 mb-4">{tier.unit}</p>
                    <p className="text-sm text-slate-400 leading-relaxed mb-6 flex-1">{tier.desc}</p>
                    <ul className="space-y-2 mb-6">
                      {tier.features.map((f, j) => <li key={j} className="flex items-center gap-2 text-sm text-slate-300"><CheckCircle size={14} weight="fill" style={{ color: "#4ade80" }} />{f}</li>)}
                    </ul>
                    <MagneticButton className="w-full py-3 rounded-full text-sm font-semibold text-white border border-white/15 cursor-pointer">{tier.cta}</MagneticButton>
                  </GlassCard>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ─── 4. GALLERY ─── */}
      <SectionReveal id="gallery" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GREEN_LIGHT }}>Our Work</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Trees We Have Cared For" />
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

      {/* ─── VIDEO PLACEHOLDER ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GREEN_LIGHT }}>See Our Work</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Watch Our Crew in Action" />
            </h2>
          </div>
          <div className="relative rounded-2xl overflow-hidden aspect-video cursor-pointer group">
            <img src="https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=1200&q=80" alt="Arborist team at work" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-black/55 flex items-center justify-center">
              <motion.div className="relative flex items-center justify-center" whileHover={{ scale: 1.1 }} transition={springFast}>
                <motion.div className="absolute w-28 h-28 rounded-full border-2 border-white/40" animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }} transition={{ duration: 2, repeat: Infinity }} />
                <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
                  <div className="w-0 h-0 ml-1" style={{ borderTop: "12px solid transparent", borderBottom: "12px solid transparent", borderLeft: "20px solid white" }} />
                </div>
              </motion.div>
            </div>
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
              <GlassCard className="px-4 py-2 text-sm text-white font-medium">Large Oak Removal — Capitol Hill, Seattle</GlassCard>
              <GlassCard className="px-3 py-2 text-xs text-white">4:18</GlassCard>
            </div>
          </div>
          <p className="text-center text-slate-400 text-sm mt-4">Real job footage — professional rigging, clean cuts, and complete site restoration.</p>
        </div>
      </SectionReveal>

      {/* ─── 5. ABOUT ─── */}
      <SectionReveal id="about" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GREEN_LIGHT }}>About Canopy</p>
              <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white mb-6">
                <WordReveal text="Rooted in Expertise" />
              </h2>
              <div className="space-y-4 text-slate-400 leading-relaxed">
                <p>
                  Canopy Tree Experts was founded 20 years ago by a certified
                  arborist who believed tree care should be science-driven, not
                  guesswork. Every decision we make is informed by arboriculture
                  best practices and a genuine respect for the trees we serve.
                </p>
                <p>
                  Our team includes ISA-certified arborists, experienced
                  climbers, and trained ground crews who work together to deliver
                  safe, efficient, and environmentally responsible tree care for
                  residential and commercial properties.
                </p>
              </div>
              <div className="mt-8 flex flex-wrap gap-4">
                {[{ icon: SealCheck, label: "ISA Certified" }, { icon: ShieldCheck, label: "$2M Insured" }, { icon: Recycle, label: "Eco-Friendly" }].map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <item.icon size={18} weight="duotone" style={{ color: GREEN_LIGHT }} />
                    <span className="text-sm text-slate-300">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden aspect-[4/5]">
              <img src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=700&q=80" alt="Tree care team at work" className="w-full h-full object-cover object-center" />
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* ─── 6. PROCESS ─── */}
      <SectionReveal id="process" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GREEN_LIGHT }}>How It Works</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Our Proven Process" />
            </h2>
          </div>
          <motion.div className="space-y-4" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {processSteps.map((step, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="p-6 flex items-start gap-6">
                  <div className="text-3xl font-bold shrink-0" style={{ color: GREEN_LIGHT, opacity: 0.5 }}>{step.step}</div>
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
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GREEN_LIGHT }}>Client Reviews</p>
            {/* Google Reviews Header */}
            <div className="flex items-center justify-center gap-2 mb-4 flex-wrap">
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map((s) => <Star key={s} size={16} weight="fill" style={{ color: "#facc15" }} />)}
              </div>
              <span className="text-white font-semibold text-sm">4.9</span>
              <span className="text-slate-400 text-sm">· 384 Google reviews</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="ml-1 shrink-0"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            </div>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="What Our Clients Say" />
            </h2>
          </div>
          <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {testimonials.map((t, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="p-6 h-full flex flex-col">
                  <Quotes size={28} weight="fill" style={{ color: GREEN_LIGHT }} className="mb-3 opacity-50" />
                  <p className="text-slate-300 leading-relaxed flex-1 text-sm">{t.text}</p>
                  <div className="mt-4 pt-4 border-t border-white/8 flex items-center justify-between">
                    <span className="text-sm font-semibold text-white">{t.name}</span>
                    <div className="flex gap-0.5">{Array.from({ length: t.rating }).map((_, j) => (<Star key={j} size={12} weight="fill" style={{ color: GREEN_LIGHT }} />))}</div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── COMPARISON TABLE ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GREEN_LIGHT }}>Why We Win</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white mb-4">
              <WordReveal text="Canopy vs. Average Tree Company" />
            </h2>
            <p className="text-slate-400 max-w-md mx-auto text-sm">Not all tree companies are equal. ISA certification and proper insurance make all the difference.</p>
          </div>
          <GlassCard className="overflow-hidden">
            <div className="grid grid-cols-3 p-4 md:p-5 border-b border-white/8 text-sm font-semibold">
              <span className="text-slate-400">What Matters</span>
              <span className="text-center" style={{ color: GREEN_LIGHT }}>Canopy</span>
              <span className="text-center text-slate-500">Average Co.</span>
            </div>
            {comparisonRows.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 items-center p-4 md:p-5 text-sm border-b border-white/8 last:border-0 ${i % 2 === 0 ? "bg-white/[0.01]" : ""}`}>
                <span className="text-slate-300 pr-4">{row.feature}</span>
                <div className="flex justify-center">
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: "rgba(34,197,94,0.15)", color: "#4ade80" }}>
                    <CheckCircle size={12} weight="fill" /> Yes
                  </span>
                </div>
                <div className="flex justify-center">
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: "rgba(239,68,68,0.1)", color: "#f87171" }}>
                    <X size={12} weight="bold" /> {row.them}
                  </span>
                </div>
              </div>
            ))}
          </GlassCard>
        </div>
      </SectionReveal>

      {/* ─── SERVICE AREA ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GREEN_LIGHT }}>Where We Work</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white mb-4">
              <WordReveal text="Seattle & Puget Sound Service Area" />
            </h2>
            <p className="text-slate-400 max-w-md mx-auto text-sm">Serving residential and commercial properties across King, Snohomish, and Pierce Counties.</p>
          </div>
          <motion.div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {["Seattle", "Bellevue", "Kirkland", "Redmond", "Everett", "Tacoma", "Renton", "Shoreline"].map((city, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="p-4 text-center">
                  <div className="w-2 h-2 rounded-full mx-auto mb-2" style={{ background: GREEN_LIGHT, boxShadow: `0 0 8px ${GREEN_LIGHT}` }} />
                  <p className="text-sm font-semibold text-white">{city}</p>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── 8. SEASONAL TIPS ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 30% 50%, ${GREEN_GLOW} 0%, transparent 50%), radial-gradient(circle at 70% 50%, ${BROWN_GLOW} 0%, transparent 50%)`,
          }} />
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GREEN_LIGHT }}>Year-Round Care</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Seasonal Tree Care Tips" />
            </h2>
          </div>
          <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {seasonalTips.map((tip, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="p-6 h-full">
                  <Leaf size={24} weight="duotone" style={{ color: GREEN_LIGHT }} className="mb-3" />
                  <h3 className="text-lg font-semibold text-white mb-2">{tip.season}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{tip.tip}</p>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── QUIZ ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GREEN_LIGHT }}>What Do You Need?</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white mb-4">
              <WordReveal text="Tell Us About Your Tree" />
            </h2>
            <p className="text-slate-400 max-w-md mx-auto text-sm">Select your situation and we will show you the best path forward and expected timeline.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {treeQuizOptions.map((opt, i) => (
              <TreeQuizOption key={i} opt={opt} />
            ))}
          </div>
          <p className="text-center text-slate-400 text-sm mt-6">Not sure? <a href="tel:+12064718349" className="underline" style={{ color: GREEN_LIGHT }}>Call (206) 471-8349</a> and our arborist will assess your trees over the phone.</p>
        </div>
      </SectionReveal>

      {/* ─── 9. FAQ ─── */}
      <SectionReveal id="faq" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            <div className="lg:sticky lg:top-32">
              <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GREEN_LIGHT }}>Common Questions</p>
              <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white mb-6">
                <WordReveal text="Frequently Asked" />
              </h2>
              <p className="text-slate-400 leading-relaxed max-w-md">Everything you need to know about our tree services, pricing, insurance requirements, and what to expect from your first call through cleanup.</p>
            </div>
            <motion.div className="space-y-3" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
              {faqData.map((faq, i) => (
                <motion.div key={i} variants={fadeUp}>
                  <AccordionItem title={faq.title} description={faq.description} isOpen={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} />
                </motion.div>
              ))}
            </motion.div>
          </div>
          <p className="text-center text-slate-500 text-xs mt-8">Have a question not listed here? Call <a href="tel:+12064718349" className="underline" style={{ color: GREEN_LIGHT }}>(206) 471-8349</a> for a direct answer from our certified arborist.</p>
        </div>
      </SectionReveal>

      {/* ─── 10. FREE ESTIMATE CTA ─── */}
      <SectionReveal id="estimate" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4 md:px-6">
          <ShimmerBorder>
            <div className="p-8 md:p-12 text-center">
              <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={spring}>
                <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GREEN_LIGHT }}>Ready to Get Started?</p>
                <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white mb-4">Get Your Free Estimate</h2>
                <p className="text-slate-400 text-lg mb-8 max-w-lg mx-auto">
                  Our certified arborist will assess your trees, discuss your
                  options, and provide a detailed quote. No pressure, no
                  obligation.
                </p>
                <div className="flex flex-wrap gap-4 justify-center">
                  <MagneticButton className="px-10 py-4 rounded-full text-base font-semibold text-white inline-flex items-center gap-2 cursor-pointer" style={{ background: GREEN } as React.CSSProperties}>
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

      {/* ─── CONTACT FORM ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GREEN_LIGHT }}>Get in Touch</p>
              <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white mb-6">
                <WordReveal text="Request Your Free Estimate" />
              </h2>
              <p className="text-slate-400 leading-relaxed max-w-md mb-6">Our certified arborist will visit your property, assess your trees, and provide a written quote — completely free with no obligation.</p>
              <div className="space-y-4">
                <div className="flex items-center gap-3"><MapPin size={18} weight="duotone" style={{ color: GREEN_LIGHT }} /><span className="text-sm text-slate-400">Serving Seattle Metro, King, Snohomish &amp; Pierce Counties</span></div>
                <div className="flex items-center gap-3"><Phone size={18} weight="duotone" style={{ color: GREEN_LIGHT }} /><a href="tel:+12064718349" className="text-sm text-slate-400 hover:text-white transition-colors">(206) 471-8349</a></div>
                <div className="flex items-center gap-3"><Clock size={18} weight="duotone" style={{ color: GREEN_LIGHT }} /><span className="text-sm text-slate-400">Mon–Sat 7am–6pm · Emergency 24/7</span></div>
              </div>
            </div>
            <GlassCard className="p-8">
              <h3 className="text-xl font-semibold text-white mb-6">Tell Us About Your Tree</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5 font-medium uppercase tracking-wide">Name</label>
                    <input type="text" placeholder="Your name" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-white/30 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5 font-medium uppercase tracking-wide">Phone</label>
                    <input type="tel" placeholder="(206) 000-0000" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-white/30 transition-colors" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5 font-medium uppercase tracking-wide">Service Needed</label>
                  <select className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-slate-400 text-sm focus:outline-none focus:border-white/30 transition-colors">
                    <option value="">Select a service...</option>
                    <option>Tree Removal</option>
                    <option>Tree Trimming</option>
                    <option>Stump Grinding</option>
                    <option>Emergency / Storm Damage</option>
                    <option>Arborist Consultation</option>
                    <option>Land Clearing</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5 font-medium uppercase tracking-wide">Tell Us More</label>
                  <textarea rows={3} placeholder="Describe the tree and any concerns..." className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-white/30 transition-colors resize-none" />
                </div>
                <MagneticButton className="w-full py-3.5 rounded-full text-sm font-semibold text-white cursor-pointer flex items-center justify-center gap-2" style={{ background: GREEN } as React.CSSProperties}>
                  <CalendarCheck size={18} weight="duotone" /> Request Free Estimate
                </MagneticButton>
              </div>
            </GlassCard>
          </div>
        </div>
      </SectionReveal>

      {/* ─── FOOTER ─── */}
      <footer className="relative z-10 border-t border-white/8 py-8">
        <div className="mx-auto max-w-7xl px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <Tree size={16} weight="duotone" style={{ color: GREEN_LIGHT }} />
              <span>Canopy Tree Experts &copy; {new Date().getFullYear()}</span>
            </div>
            <span className="hidden sm:block text-slate-700">·</span>
            <span className="text-slate-600">WA Contractor License #CANOPT-4821 · ISA Certified · $2M General Liability</span>
          </div>
          <p className="text-xs text-slate-600 flex items-center gap-1.5"><svg width="14" height="14" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-sky-500"><path d="M24.3 4.2c-1.5-.4-3.2.1-4.5 1.1-1-.7-2.3-1-3.5-.8-2.4.4-4.2 2.5-4.2 4.9v.6c-3.2.8-6 2.8-7.8 5.6-.3.5-.1 1.1.4 1.4.5.3 1.1.1 1.4-.4 1.5-2.3 3.7-4 6.3-4.7.5-.1 1-.1 1.5 0 .8.2 1.4.8 1.7 1.5.3.8.2 1.6-.2 2.3l-2.8 4.3c-.6.9-.4 2.1.4 2.8l2.5 2.1c.4.3.8.5 1.3.5h5.2c.5 0 1-.2 1.3-.5l1.2-1c.6-.5.8-1.3.6-2l-1-3.2c-.2-.5 0-1.1.4-1.4l3.8-2.5c1.3-.9 2.1-2.3 2.1-3.9V9.6c0-2.5-1.7-4.7-4.1-5.3v-.1z" fill="currentColor"/></svg>Created by <a href="https://bluejayportfolio.com" target="_blank" rel="noopener noreferrer" style={{textDecoration:"underline"}}>bluejayportfolio.com</a></p>
        </div>
      </footer>
    </main>
  );
}
