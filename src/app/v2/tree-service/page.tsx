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
  { src: "https://images.unsplash.com/photo-1754321871548-61bdbc6f1506?w=600&q=80", alt: "Large tree trimming" },
  { src: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=600&q=80", alt: "Healthy trees in landscape" },
  { src: "https://images.unsplash.com/photo-1754321902809-5c21cbc67228?w=600&q=80", alt: "Forest canopy care" },
  { src: "https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=600&q=80", alt: "Sunlight through trees" },
  { src: "https://images.unsplash.com/photo-1754322449185-31f56117ed87?w=600&q=80", alt: "Professional tree work" },
  { src: "https://images.unsplash.com/photo-1476231682828-37e571bc172f?w=600&q=80", alt: "Pacific Northwest forest landscape" },
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
          <img src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1400&q=80" alt="Professional arborist tree work" className="w-full h-full object-cover object-center" />
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
                <Phone size={18} weight="duotone" /> (206) 318-7620
              </MagneticButton>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ ...spring, delay: 0.95 }} className="flex flex-wrap gap-3">
              <span className="px-4 py-2 rounded-full text-xs font-semibold text-white flex items-center gap-2" style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${GREEN}50` }}><ShieldCheck size={14} weight="duotone" style={{ color: GREEN_LIGHT }} />ISA Certified Arborists</span>
              <span className="px-4 py-2 rounded-full text-xs font-semibold text-white flex items-center gap-2" style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${BROWN_LIGHT}50` }}><Star size={14} weight="fill" style={{ color: BROWN_LIGHT }} />4.9-Star Rated</span>
              <span className="px-4 py-2 rounded-full text-xs font-semibold text-white flex items-center gap-2" style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${GREEN}50` }}><CheckCircle size={14} weight="duotone" style={{ color: GREEN_LIGHT }} />Free Estimates</span>
              <span className="px-4 py-2 rounded-full text-xs font-semibold text-white flex items-center gap-2" style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${BROWN_LIGHT}50` }}><Warning size={14} weight="duotone" style={{ color: BROWN_LIGHT }} />24/7 Storm Response</span>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ ...spring, delay: 1 }} className="flex items-center gap-3 text-sm text-slate-400">
              <Warning size={16} weight="duotone" style={{ color: GREEN_LIGHT }} />
              <span>24/7 Emergency Storm Response Available</span>
            </motion.div>
          </div>
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ ...spring, delay: 0.3 }} className="hidden md:flex items-center justify-center lg:justify-end">
            <TreeSVG />
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
                  <p className="text-3xl md:text-4xl font-bold" style={{ color: GREEN_LIGHT }}>{stat.value}</p>
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
              <img src="https://images.unsplash.com/photo-1754321895426-68b04ba453e3?w=700&q=80" alt="Tree care team at work" className="w-full h-full object-cover object-top" />
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
                {[0,1,2,3,4].map((i) => (<Star key={i} size={20} weight="fill" style={{ color: GREEN_LIGHT }} />))}
              </div>
              <p className="text-sm text-slate-400"><span className="text-white font-bold">4.9</span> out of 5 &bull; <span className="text-white font-bold">312</span> reviews</p>
            </div>
          </GlassCard>
        </div>
      </SectionReveal>

      {/* ─── 7. TESTIMONIALS ─── */}
      <SectionReveal id="testimonials" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GREEN_LIGHT }}>Client Reviews</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="What Our Clients Say" />
            </h2>
          </div>
          <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {testimonials.map((t, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="p-6 h-full flex flex-col relative overflow-hidden">
                  <Quotes size={60} weight="fill" style={{ color: GREEN_LIGHT }} className="absolute -top-2 -right-2 opacity-10" />
                  <Quotes size={28} weight="fill" style={{ color: GREEN_LIGHT }} className="mb-3 opacity-60" />
                  <p className="text-slate-300 leading-relaxed flex-1 text-sm">{t.text}</p>
                  <div className="mt-4 pt-4 border-t border-white/8 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">{t.name}</span>
                      <CheckCircle size={14} weight="fill" style={{ color: GREEN_LIGHT }} />
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider">Verified</span>
                    </div>
                    <div className="flex gap-0.5">{Array.from({ length: t.rating }).map((_, j) => (<Star key={j} size={18} weight="fill" style={{ color: BROWN_LIGHT }} />))}</div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── EMERGENCY STORM ─── */}
      <SectionReveal className="relative z-10 py-8">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <GlassCard className="p-6 md:p-8 flex flex-col md:flex-row items-center gap-6">
            <div className="relative shrink-0">
              <motion.div className="absolute inset-0 rounded-full" style={{ background: GREEN_LIGHT }} animate={{ scale: [1, 1.6, 1], opacity: [0.5, 0, 0.5] }} transition={{ duration: 2, repeat: Infinity }} />
              <div className="relative w-4 h-4 rounded-full" style={{ background: GREEN_LIGHT }} />
            </div>
            <div className="flex-1 text-center md:text-left">
              <p className="text-xs uppercase tracking-widest mb-1" style={{ color: GREEN_LIGHT }}>Fallen Tree? Storm Damage?</p>
              <h3 className="text-2xl md:text-3xl font-bold text-white">24/7 Emergency Response Crews</h3>
              <p className="text-sm text-slate-400 mt-2">Certified arborists with bucket trucks and chainsaws on call. Storm-damaged trees cleared in under 2 hours from the call.</p>
            </div>
            <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white flex items-center gap-2 shrink-0 cursor-pointer" style={{ background: GREEN } as React.CSSProperties}>
              <Phone size={18} weight="duotone" /> Emergency Line
            </MagneticButton>
          </GlassCard>
        </div>
      </SectionReveal>

      {/* ─── PRICING ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 60% 40% at 50% 50%, ${GREEN_GLOW} 0%, transparent 70%)` }} />
        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GREEN_LIGHT }}>Transparent Pricing</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white"><WordReveal text="Service Estimates" /></h2>
            <p className="text-slate-400 mt-4 max-w-2xl mx-auto">Prices depend on tree size, access, and location — but these are real averages from last season.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "Tree Trimming", price: "$250 – $750", desc: "Seasonal pruning, deadwood removal, canopy thinning, and crown reduction.", features: ["Per-tree pricing", "ISA pruning standards", "Debris haul-away", "Free site assessment", "Bundle discounts"], highlight: false },
              { name: "Tree Removal", price: "$450 – $2,800", desc: "Small or massive — we remove dead, diseased, or unwanted trees safely.", features: ["Crane service if needed", "Stump grinding add-on", "Full insurance coverage", "Same-week for urgent jobs", "Clean-up included"], highlight: true },
              { name: "Stump Grinding", price: "$150 – $400", desc: "Grind stumps 6 inches below grade to allow regrowth of grass or new plantings.", features: ["Professional stump grinder", "Debris removed or mulched on site", "Paint/marking-included", "Property protection", "Same-day with other service"], highlight: false },
            ].map((tier, i) => (
              <div key={i} className={`relative rounded-2xl ${tier.highlight ? 'p-[2px]' : ''}`} style={tier.highlight ? { background: `linear-gradient(135deg, ${GREEN}, ${BROWN_LIGHT})` } : {}}>
                {tier.highlight && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white" style={{ background: GREEN }}>Most Requested</div>}
                <GlassCard className="p-6 h-full">
                  <h3 className="text-xl font-bold text-white">{tier.name}</h3>
                  <p className="text-xs text-slate-400 mt-1">{tier.desc}</p>
                  <div className="mt-6 flex items-end gap-1">
                    <span className="text-4xl font-black text-white">{tier.price}</span>
                  </div>
                  <ul className="mt-6 space-y-3">
                    {tier.features.map((f, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-slate-300">
                        <CheckCircle size={18} weight="fill" style={{ color: tier.highlight ? GREEN_LIGHT : BROWN_LIGHT }} className="shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <button className="mt-6 w-full px-6 py-3 rounded-full text-sm font-semibold text-white" style={{ background: tier.highlight ? GREEN : "rgba(255,255,255,0.05)", border: tier.highlight ? "none" : "1px solid rgba(255,255,255,0.1)" }}>Get Estimate</button>
                </GlassCard>
              </div>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ─── VIDEO ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GREEN_LIGHT }}>On The Job</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white"><WordReveal text="Watch A Tree Removal" /></h2>
          </div>
          <div className="relative rounded-2xl overflow-hidden aspect-video group cursor-pointer">
            <img src="https://images.unsplash.com/photo-1754321889123-0485c7fea5f1?w=1600&q=80" alt="Arborist climbing for tree removal" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div className="w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center shadow-2xl" style={{ background: GREEN } as React.CSSProperties} animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
                <svg width="28" height="32" viewBox="0 0 24 28" fill="white" className="ml-1">
                  <path d="M0 0L24 14L0 28Z" />
                </svg>
              </motion.div>
            </div>
            <div className="absolute bottom-6 left-6 right-6">
              <p className="text-xs uppercase tracking-widest" style={{ color: BROWN_LIGHT }}>80ft Oak Removal &bull; 3:40</p>
              <p className="text-xl md:text-2xl font-bold text-white mt-1">Watch a certified climber safely remove a massive oak near the house.</p>
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* ─── QUIZ ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="relative z-10 mx-auto max-w-5xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GREEN_LIGHT }}>Quick Assessment</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white"><WordReveal text="What's Your Tree Situation?" /></h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { color: "#22c55e", label: "Routine Care", detail: "Trees are healthy — just need seasonal trimming, pruning, or shape maintenance.", rec: "Seasonal Trim Package", icon: CheckCircle },
              { color: BROWN_LIGHT, label: "Concern", detail: "Dead limbs, leaning tree, or signs of disease. Worth a free assessment from an arborist.", rec: "Free Arborist Consult", icon: Warning },
              { color: "#ef4444", label: "Emergency", detail: "Fallen tree, storm damage, or tree threatening a structure — need help today.", rec: "24/7 Storm Crew Dispatch", icon: Phone },
            ].map((opt, i) => (
              <GlassCard key={i} className="p-6 h-full flex flex-col items-start relative overflow-hidden group cursor-pointer">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: `radial-gradient(circle at 50% 0%, ${opt.color}22, transparent 60%)` }} />
                <div className="relative w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: `${opt.color}22` }}>
                  <opt.icon size={22} weight="duotone" style={{ color: opt.color }} />
                </div>
                <p className="relative text-xs uppercase tracking-widest font-bold" style={{ color: opt.color }}>{opt.label}</p>
                <p className="relative text-sm text-slate-300 mt-2 leading-relaxed flex-1">{opt.detail}</p>
                <div className="relative mt-6 pt-4 border-t border-white/15 w-full">
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-1">Recommended</p>
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
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GREEN_LIGHT }}>The Difference</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white"><WordReveal text="Us vs. The Guy With a Truck" /></h2>
          </div>
          <GlassCard className="overflow-hidden">
            <div className="grid grid-cols-[1.5fr_1fr_1fr] items-center border-b border-white/15">
              <div className="p-4 md:p-6 text-xs uppercase tracking-widest text-slate-400">What Matters</div>
              <div className="p-4 md:p-6 text-center" style={{ background: `${GREEN}25` }}>
                <p className="text-sm md:text-base font-bold" style={{ color: GREEN_LIGHT }}>Our Crew</p>
              </div>
              <div className="p-4 md:p-6 text-center">
                <p className="text-sm md:text-base font-semibold text-slate-400">Chainsaw Cowboy</p>
              </div>
            </div>
            {[
              { feature: "ISA-certified arborists", us: "Every crew", them: "No" },
              { feature: "Full liability + workers comp", us: "$2M coverage", them: "None" },
              { feature: "Proper climbing + rigging gear", us: "Modern fleet", them: "Ladder + hope" },
              { feature: "Crane service for large removals", us: "In-house", them: "No" },
              { feature: "Stump grinding included option", us: "Same-day", them: "Separate trip" },
              { feature: "Written estimates + warranty", us: "Always", them: "Cash + crossed fingers" },
              { feature: "Tree health diagnostics", us: "Arborist report", them: "Guess" },
            ].map((row, i) => (
              <div key={i} className="grid grid-cols-[1.5fr_1fr_1fr] items-center border-b border-white/8 last:border-b-0">
                <div className="p-4 md:p-6 text-sm text-white">{row.feature}</div>
                <div className="p-4 md:p-6 text-center" style={{ background: `${GREEN}10` }}>
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle size={18} weight="fill" style={{ color: GREEN_LIGHT }} />
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
          <p className="text-center text-xs uppercase tracking-widest text-slate-500 mb-6">Credentials &amp; Insurance</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {[
              { label: "ISA Certified", icon: ShieldCheck },
              { label: "TCIA Accredited", icon: Star },
              { label: "BBB A+", icon: CheckCircle },
              { label: "$2M Liability", icon: ShieldCheck },
              { label: "OSHA Safety", icon: Warning },
              { label: "State Licensed", icon: CheckCircle },
            ].map((cert, i) => (
              <GlassCard key={i} className="px-4 py-3 flex items-center gap-2 justify-center">
                <cert.icon size={18} weight="duotone" style={{ color: i % 2 === 0 ? GREEN_LIGHT : BROWN_LIGHT }} />
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
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GREEN_LIGHT }}>Coverage</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white"><WordReveal text="Service Area & Response" /></h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <GlassCard className="p-6 text-center">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: GREEN_GLOW }}>
                <MapPin size={26} weight="duotone" style={{ color: GREEN_LIGHT }} />
              </div>
              <p className="text-xs uppercase tracking-widest mb-2" style={{ color: GREEN_LIGHT }}>Coverage</p>
              <p className="text-3xl font-black text-white">50 Miles</p>
              <p className="text-sm text-slate-400 mt-2">Metro, suburbs, and rural properties. Remote jobs considered for large removal projects.</p>
            </GlassCard>
            <GlassCard className="p-6 text-center">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: BROWN_GLOW }}>
                <Warning size={26} weight="duotone" style={{ color: BROWN_LIGHT }} />
              </div>
              <p className="text-xs uppercase tracking-widest mb-2" style={{ color: BROWN_LIGHT }}>Storm Response</p>
              <p className="text-3xl font-black text-white">Under 2 Hrs</p>
              <p className="text-sm text-slate-400 mt-2">Crews staged during major weather events. Emergency callouts prioritized year-round.</p>
            </GlassCard>
            <GlassCard className="p-6 text-center">
              <div className="relative w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: GREEN_GLOW }}>
                <motion.div className="absolute inset-0 rounded-full" style={{ background: GREEN_LIGHT }} animate={{ scale: [1, 1.6, 1], opacity: [0.4, 0, 0.4] }} transition={{ duration: 2, repeat: Infinity }} />
                <CheckCircle size={26} weight="duotone" style={{ color: GREEN_LIGHT }} className="relative" />
              </div>
              <p className="text-xs uppercase tracking-widest mb-2" style={{ color: GREEN_LIGHT }}>Booking</p>
              <p className="text-3xl font-black text-white">This Week</p>
              <p className="text-sm text-slate-400 mt-2">Standard jobs scheduled within 7 days. Emergency storm response same-day, 24/7.</p>
            </GlassCard>
          </div>
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

      {/* ─── 9. FAQ ─── */}
      <SectionReveal id="faq" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            <div className="lg:sticky lg:top-32">
              <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GREEN_LIGHT }}>Common Questions</p>
              <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white mb-6">
                <WordReveal text="Frequently Asked" />
              </h2>
              <p className="text-slate-400 leading-relaxed max-w-md">Everything you need to know about our tree services, pricing, and what to expect.</p>
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

      {/* ─── FINAL CTA ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-4 md:px-6">
          <GlassCard className="p-8 md:p-12 text-center">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GREEN_LIGHT }}>Ready To Start</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white mb-4">Book Your Free Arborist Visit</h2>
            <p className="text-slate-400 text-lg mb-8 max-w-lg mx-auto">ISA-certified arborist walks the property, identifies risks, and gives you a written estimate — free, no obligation.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <MagneticButton className="px-10 py-4 rounded-full text-base font-semibold text-white inline-flex items-center gap-2 cursor-pointer" style={{ background: GREEN } as React.CSSProperties}>
                <CalendarCheck size={20} weight="duotone" /> Schedule Estimate
              </MagneticButton>
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/15 inline-flex items-center gap-2 cursor-pointer">
                <Phone size={18} weight="duotone" /> (206) 318-7620
              </MagneticButton>
            </div>
            <p className="mt-6 text-xs text-slate-500">ISA Certified &bull; $2M Liability &bull; OSHA Trained &bull; 25+ Years</p>
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              {[
                { label: "Trees Removed", value: "12K+" },
                { label: "Bucket Trucks", value: "4" },
                { label: "Years In Business", value: "25+" },
                { label: "Storm Response", value: "Under 2 hr" },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <p className="text-xs text-slate-500 uppercase tracking-widest">{stat.label}</p>
                  <p className="text-2xl font-black mt-1" style={{ color: GREEN_LIGHT }}>{stat.value}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </SectionReveal>

      {/* ─── TREE TYPES WE SERVICE ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GREEN_LIGHT }}>Expertise Across Species</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white"><WordReveal text="Trees We Know Best" /></h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: "Oak", desc: "Long-lived hardwoods susceptible to oak wilt. Pruning windows matter." },
              { name: "Maple", desc: "Shade-tree favorite with soft wood — careful timing during sap season." },
              { name: "Pine + Evergreen", desc: "Year-round care. Topping and limb management for safety near structures." },
              { name: "Ash", desc: "Emerald ash borer vulnerable. Early detection and removal save neighboring trees." },
              { name: "Birch", desc: "Beautiful but brittle. Regular thinning prevents storm-damage limb loss." },
              { name: "Fruit Trees", desc: "Apple, pear, plum, and cherry pruning on proper seasonal schedule." },
              { name: "Palm", desc: "Specialized palm trimming and frond removal on a set schedule." },
              { name: "Cottonwood + Willow", desc: "Fast-growing, brittle — need regular management to prevent limb drop." },
            ].map((tree, i) => (
              <GlassCard key={i} className="p-5">
                <p className="text-sm font-bold text-white">{tree.name}</p>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">{tree.desc}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ─── EXTENDED FAQ ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4 md:px-6">
          <div className="text-center mb-10">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GREEN_LIGHT }}>Quick Answers</p>
            <h2 className="text-3xl md:text-4xl tracking-tighter font-bold text-white"><WordReveal text="Tree Care FAQ" /></h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { q: "How do I know a tree needs removal?", a: "Dead limbs, leaning, bark peeling, fungus at the base, or root damage are all red flags. Free arborist consult will assess it." },
              { q: "Do you grind stumps?", a: "Yes — stumps ground 6 inches below grade. Debris removed or left as mulch at your request." },
              { q: "When is the best time to prune?", a: "Late winter / early spring is ideal for most trees, before new growth starts. Emergency pruning any time." },
              { q: "Can you handle tall trees near houses?", a: "Yes — our certified climbers and bucket trucks handle trees up to 100 feet. Crane service for removals over structures." },
              { q: "Do you haul away the debris?", a: "Always included in our quote. Chips go to mulch centers or landscape companies for reuse." },
              { q: "Do you offer tree preservation?", a: "Yes — bracing, cabling, soil amendment, and deep-root fertilization for historic or high-value trees." },
            ].map((faq, i) => (
              <GlassCard key={i} className="p-5">
                <p className="text-sm font-bold text-white mb-2">{faq.q}</p>
                <p className="text-sm text-slate-400 leading-relaxed">{faq.a}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ─── FOOTER ─── */}
      <footer className="relative z-10 border-t border-white/8 py-8">
        <div className="mx-auto max-w-7xl px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Tree size={16} weight="duotone" style={{ color: GREEN_LIGHT }} />
            <span>Canopy Tree Experts &copy; {new Date().getFullYear()}</span>
          </div>
          <p className="text-xs text-slate-600 flex items-center gap-1.5"><svg width="14" height="14" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-sky-500"><path d="M24.3 4.2c-1.5-.4-3.2.1-4.5 1.1-1-.7-2.3-1-3.5-.8-2.4.4-4.2 2.5-4.2 4.9v.6c-3.2.8-6 2.8-7.8 5.6-.3.5-.1 1.1.4 1.4.5.3 1.1.1 1.4-.4 1.5-2.3 3.7-4 6.3-4.7.5-.1 1-.1 1.5 0 .8.2 1.4.8 1.7 1.5.3.8.2 1.6-.2 2.3l-2.8 4.3c-.6.9-.4 2.1.4 2.8l2.5 2.1c.4.3.8.5 1.3.5h5.2c.5 0 1-.2 1.3-.5l1.2-1c.6-.5.8-1.3.6-2l-1-3.2c-.2-.5 0-1.1.4-1.4l3.8-2.5c1.3-.9 2.1-2.3 2.1-3.9V9.6c0-2.5-1.7-4.7-4.1-5.3v-.1z" fill="currentColor"/></svg>Created by <a href="https://bluejayportfolio.com" target="_blank" rel="noopener noreferrer" style={{textDecoration:"underline"}}>bluejayportfolio.com</a></p>
        </div>
      </footer>
    </main>
  );
}
