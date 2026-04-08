"use client";

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
  CaretDown,
  Phone,
  MapPin,
  Clock,
  ArrowRight,
  House,
  PaintBrush,
  Palette,
  Quotes,
  X,
  List,
  CalendarCheck,
  Trophy,
  Sparkle,
  Eye,
  Buildings,
  Armchair,
  Ruler,
  Lightbulb,
  Wrench,
  MagnifyingGlass,
  PencilSimple,
  Hammer,
  CheckCircle,
} from "@phosphor-icons/react";

/* ───────────────────────── SPRING CONFIG ───────────────────────── */
const spring = { type: "spring" as const, stiffness: 100, damping: 20 };
const springFast = { type: "spring" as const, stiffness: 200, damping: 25 };

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: spring },
};

/* ───────────────────────── COLORS ───────────────────────── */
const BG = "#0d0d0d";
const GOLD = "#b8860b";
const GOLD_LIGHT = "#d4a017";
const CHARCOAL = "#1a1a1a";
const GOLD_GLOW = "rgba(184, 134, 11, 0.12)";

/* ───────────────────────── FLOATING GOLD DUST ───────────────────────── */
function FloatingGoldDust() {
  const particles = Array.from({ length: 22 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 10,
    duration: 8 + Math.random() * 7,
    size: 2 + Math.random() * 3,
    opacity: 0.1 + Math.random() * 0.2,
  }));

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden hidden md:block">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{ left: `${p.x}%`, width: p.size, height: p.size, background: GOLD_LIGHT, willChange: "transform, opacity" }}
          animate={{ y: ["-10vh", "110vh"], opacity: [0, p.opacity, p.opacity, 0] }}
          transition={{
            y: { duration: p.duration, repeat: Infinity, delay: p.delay, ease: "linear" },
            opacity: { duration: p.duration, repeat: Infinity, delay: p.delay, times: [0, 0.1, 0.9, 1] },
          }}
        />
      ))}
    </div>
  );
}

/* ───────────────────────── REUSABLE COMPONENTS ───────────────────────── */
function WordReveal({ text, className = "" }: { text: string; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  return (
    <motion.span ref={ref} className={`inline-flex flex-wrap gap-x-3 ${className}`} variants={stagger} initial="hidden" animate={isInView ? "show" : "hidden"}>
      {text.split(" ").map((word, i) => (<motion.span key={i} variants={fadeUp} className="inline-block">{word}</motion.span>))}
    </motion.span>
  );
}

function SectionReveal({ children, className = "", id }: { children: React.ReactNode; className?: string; id?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.section ref={ref} id={id} className={className} initial={{ opacity: 0, y: 50 }} animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }} transition={spring}>
      {children}
    </motion.section>
  );
}

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] ${className}`}>{children}</div>;
}

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

function ShimmerBorder({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative rounded-2xl p-[1px] overflow-hidden ${className}`}>
      <motion.div className="absolute inset-0 rounded-2xl" style={{ background: `conic-gradient(from 0deg, transparent, ${GOLD}, transparent, ${GOLD_LIGHT}, transparent)`, willChange: "transform" }} animate={{ rotate: [0, 360] }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} />
      <div className="relative rounded-2xl z-10" style={{ background: BG }}>{children}</div>
    </div>
  );
}

/* ───────────────────────── CHANDELIER SVG ───────────────────────── */
function ChandelierSVG() {
  return (
    <div className="relative flex items-center justify-center">
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{ background: `radial-gradient(circle, ${GOLD_GLOW} 0%, transparent 70%)`, filter: "blur(40px)" }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      <svg viewBox="0 0 200 240" className="relative z-10 w-48 h-56 md:w-56 md:h-72" fill="none">
        {/* Outer glow rings */}
        <motion.circle cx="100" cy="120" r="92" stroke={GOLD} strokeWidth="0.5" opacity={0.12}
          animate={{ r: [90, 94, 90] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} />
        <motion.circle cx="100" cy="120" r="82" stroke={GOLD_LIGHT} strokeWidth="0.3" opacity={0.08}
          animate={{ r: [80, 84, 80] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }} />

        {/* Ceiling mount */}
        <motion.rect x="90" y="10" width="20" height="8" rx="4" fill={`${GOLD}22`} stroke={GOLD} strokeWidth="1.5"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} />
        {/* Chain/rod */}
        <motion.line x1="100" y1="18" x2="100" y2="55" stroke={GOLD} strokeWidth="1.5"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.2 }} />

        {/* Main body - elegant bowl shape */}
        <motion.path d="M60 55 Q60 45 100 45 Q140 45 140 55 L145 70 Q145 80 100 85 Q55 80 55 70 Z"
          fill={`${GOLD}18`} stroke={GOLD} strokeWidth="2"
          initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.5, delay: 0.5 }} />
        <path d="M68 52 Q68 48 100 48 Q132 48 132 52 L135 65 Q135 72 100 76 Q65 72 65 65 Z" fill={`${GOLD}0d`} />

        {/* Crystal tier 1 - curved arms */}
        <motion.path d="M55 70 Q30 85 25 100" stroke={GOLD} strokeWidth="1.5" fill="none" strokeLinecap="round"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6, delay: 1 }} />
        <motion.path d="M145 70 Q170 85 175 100" stroke={GOLD} strokeWidth="1.5" fill="none" strokeLinecap="round"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6, delay: 1.1 }} />
        <motion.path d="M65 75 Q45 92 40 110" stroke={GOLD} strokeWidth="1.5" fill="none" strokeLinecap="round"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6, delay: 1.2 }} />
        <motion.path d="M135 75 Q155 92 160 110" stroke={GOLD} strokeWidth="1.5" fill="none" strokeLinecap="round"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6, delay: 1.3 }} />

        {/* Light bulb glow points */}
        {[{cx: 25, cy: 100}, {cx: 175, cy: 100}, {cx: 40, cy: 110}, {cx: 160, cy: 110}].map((p, i) => (
          <motion.g key={i}>
            <motion.circle cx={p.cx} cy={p.cy} r="6" fill={`${GOLD}22`}
              animate={{ r: [5, 8, 5], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }} />
            <motion.circle cx={p.cx} cy={p.cy} r="3" fill={`${GOLD}44`}
              animate={{ opacity: [0.4, 0.9, 0.4] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }} />
          </motion.g>
        ))}

        {/* Crystal drops - tier 1 */}
        {[{x: 70, y: 90}, {x: 85, y: 95}, {x: 100, y: 98}, {x: 115, y: 95}, {x: 130, y: 90}].map((p, i) => (
          <motion.g key={`c1${i}`}>
            <motion.path d={`M${p.x} ${p.y} L${p.x - 3} ${p.y + 15} L${p.x} ${p.y + 20} L${p.x + 3} ${p.y + 15} Z`}
              fill={`${GOLD_LIGHT}22`} stroke={GOLD_LIGHT} strokeWidth="0.8"
              initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5 + i * 0.1, duration: 0.5 }} />
          </motion.g>
        ))}

        {/* Crystal drops - tier 2, longer */}
        {[{x: 60, y: 105}, {x: 80, y: 112}, {x: 100, y: 115}, {x: 120, y: 112}, {x: 140, y: 105}].map((p, i) => (
          <motion.g key={`c2${i}`}>
            <motion.line x1={p.x} y1={p.y - 5} x2={p.x} y2={p.y + 5} stroke={GOLD} strokeWidth="0.5" opacity={0.4}
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1.8 + i * 0.08 }} />
            <motion.path d={`M${p.x} ${p.y + 5} L${p.x - 3} ${p.y + 22} L${p.x} ${p.y + 28} L${p.x + 3} ${p.y + 22} Z`}
              fill={`${GOLD_LIGHT}18`} stroke={GOLD_LIGHT} strokeWidth="0.8"
              initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.8 + i * 0.1, duration: 0.5 }} />
            <motion.circle cx={p.x} cy={p.y + 30} r="2" fill={`${GOLD_LIGHT}33`}
              animate={{ opacity: [0.2, 0.6, 0.2] }}
              transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.3 }} />
          </motion.g>
        ))}

        {/* Bottom crystal pendant */}
        <motion.line x1="100" y1="98" x2="100" y2="165" stroke={GOLD} strokeWidth="0.8"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8, delay: 2 }} />
        <motion.path d="M100 158 L93 175 L100 185 L107 175 Z"
          fill={`${GOLD}22`} stroke={GOLD} strokeWidth="1.5"
          initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 2.5, duration: 0.5, ease: "backOut" }} />
        <path d="M100 162 L96 172 L100 178 L104 172 Z" fill={`${GOLD}0d`} />
        <motion.circle cx="100" cy="188" r="3" fill={GOLD_LIGHT}
          animate={{ opacity: [0.3, 0.8, 0.3], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 2, repeat: Infinity }} />

        {/* Sparkle accents */}
        <motion.circle cx="170" cy="30" r="3" fill={GOLD_LIGHT}
          animate={{ opacity: [0.2, 1, 0.2], scale: [0.7, 1.3, 0.7] }}
          transition={{ duration: 2.5, repeat: Infinity }} />
        <motion.circle cx="25" cy="55" r="2" fill={GOLD}
          animate={{ opacity: [0.1, 0.8, 0.1], scale: [0.5, 1.2, 0.5] }}
          transition={{ duration: 3, repeat: Infinity, delay: 0.8 }} />
        <motion.circle cx="185" cy="140" r="2.5" fill={GOLD_LIGHT}
          animate={{ opacity: [0.15, 0.7, 0.15] }}
          transition={{ duration: 2, repeat: Infinity, delay: 1.2 }} />
        <motion.circle cx="15" cy="130" r="2" fill={GOLD}
          animate={{ opacity: [0.1, 0.6, 0.1] }}
          transition={{ duration: 2.5, repeat: Infinity, delay: 0.4 }} />

        {/* Light shimmer effect */}
        <motion.ellipse cx="100" cy="200" rx="50" ry="6" fill={GOLD}
          animate={{ opacity: [0.03, 0.1, 0.03], rx: [45, 55, 45] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} />
      </svg>
    </div>
  );
}

/* ───────────────────────── DATA ───────────────────────── */
const portfolioGallery = [
  { src: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=80", alt: "Modern minimalist living room", span: "col-span-2 row-span-2" },
  { src: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600&q=80", alt: "Luxury bedroom suite", span: "col-span-1 row-span-1" },
  { src: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600&q=80", alt: "Contemporary kitchen", span: "col-span-1 row-span-1" },
  { src: "https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=600&q=80", alt: "Designer bathroom", span: "col-span-1 row-span-1" },
  { src: "https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=600&q=80", alt: "Home office design", span: "col-span-1 row-span-1" },
  { src: "https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?w=800&q=80", alt: "Open concept dining", span: "col-span-2 row-span-1" },
];

const services = [
  { title: "Residential Design", description: "Full-service interior design for homes, condos, and apartments. From single rooms to complete renovations, we create spaces that reflect your personality and lifestyle.", icon: House },
  { title: "Commercial Interiors", description: "Offices, restaurants, hotels, and retail spaces designed to impress clients and boost productivity. We understand how space affects business success.", icon: Buildings },
  { title: "Home Staging", description: "Strategic staging that helps properties sell faster and for more. We transform lived-in spaces into aspirational homes that buyers fall in love with instantly.", icon: Eye },
  { title: "Design Consultation", description: "One-on-one consultations for those who want professional guidance but prefer a DIY approach. Get a curated plan, mood boards, and sourcing lists.", icon: Lightbulb },
  { title: "Renovation Management", description: "End-to-end project management for renovations and remodels. We coordinate contractors, timelines, and budgets so you do not have to stress.", icon: Wrench },
  { title: "Furniture Sourcing", description: "Access to exclusive trade-only showrooms and custom fabrication. We source unique pieces that are not available to the public for a truly one-of-a-kind look.", icon: Armchair },
];

const processSteps = [
  { step: "01", title: "Discover", description: "We start with an in-depth consultation to understand your vision, lifestyle, preferences, and budget.", icon: MagnifyingGlass },
  { step: "02", title: "Design", description: "Our team creates detailed design concepts, 3D renderings, material palettes, and furniture plans for your approval.", icon: PencilSimple },
  { step: "03", title: "Develop", description: "Once approved, we manage procurement, custom fabrication, contractor coordination, and quality control.", icon: Hammer },
  { step: "04", title: "Deliver", description: "Final installation, styling, and reveal. We handle every detail so you walk into a finished, picture-perfect space.", icon: CheckCircle },
];

const testimonials = [
  { name: "Victoria & Charles K.", text: "They completely transformed our brownstone into a space that feels both luxurious and livable. The attention to detail is extraordinary. Every guest asks who our designer is.", rating: 5 },
  { name: "Rachel M., Restaurant Owner", text: "The restaurant redesign increased our bookings by 40 percent. They understood our brand perfectly and created an atmosphere that our customers absolutely love.", rating: 5 },
  { name: "David L.", text: "Working with this team was the best investment we made in our home. They listened to exactly what we wanted and delivered something even better than we imagined.", rating: 5 },
];

const awards = [
  "Architectural Digest Top 100",
  "Elle Decor A-List Designer",
  "Best of Houzz Design 2024",
  "ASID Design Excellence Award",
  "Luxe Interiors Gold List",
  "House Beautiful Next Wave",
];

const faqs = [
  { q: "What is your design fee structure?", a: "We offer both flat-fee and hourly rates depending on the project scope. Residential projects typically start at $5,000 for a single room and scale from there. A detailed proposal is provided after our initial consultation." },
  { q: "How long does a typical project take?", a: "Single rooms usually take 6-8 weeks from concept to completion. Full home designs range from 3-6 months. Large renovations can take 6-12 months depending on construction scope." },
  { q: "Do you work with existing furniture?", a: "Absolutely. We love incorporating meaningful pieces into new designs. We will help you identify what to keep, what to reupholster, and what to replace for the best overall result." },
  { q: "Can you work within my budget?", a: "Yes. We work across a range of budgets and are transparent about costs from day one. Our job is to maximize the impact of every dollar you invest in your space." },
  { q: "Do you offer virtual design services?", a: "We do. Our virtual design packages include video consultations, digital mood boards, 3D renderings, detailed shopping lists, and placement guides so you can execute the design yourself." },
];

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════ */
export default function V2InteriorDesignPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden" style={{ background: BG, color: "#f1f5f9" }}>
      <FloatingGoldDust />

      {/* ─── NAV ─── */}
      <motion.nav initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-4">
          <GlassCard className="flex items-center justify-between px-4 md:px-6 py-3">
            <div className="flex items-center gap-2">
              <PaintBrush size={24} weight="duotone" style={{ color: GOLD }} />
              <span className="text-lg font-bold tracking-tight text-white">Atelier Noir</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
              <a href="#portfolio" className="hover:text-white transition-colors">Portfolio</a>
              <a href="#services" className="hover:text-white transition-colors">Services</a>
              <a href="#about" className="hover:text-white transition-colors">About</a>
              <a href="#process" className="hover:text-white transition-colors">Process</a>
              <a href="#contact" className="hover:text-white transition-colors">Contact</a>
            </div>
            <div className="flex items-center gap-3">
              <MagneticButton className="px-4 md:px-5 py-2 rounded-full text-sm font-semibold text-black" style={{ background: GOLD_LIGHT } as React.CSSProperties}>
                Get Started
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
                  {[{ label: "Portfolio", href: "#portfolio" }, { label: "Services", href: "#services" }, { label: "About", href: "#about" }, { label: "Process", href: "#process" }, { label: "Contact", href: "#contact" }].map((link) => (
                    <a key={link.label} href={link.href} onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors">{link.label}</a>
                  ))}
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.nav>

      {/* ─── HERO ─── */}
      <section className="relative min-h-[100dvh] flex items-center pt-24 z-10">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full opacity-15" style={{ background: `radial-gradient(circle, ${GOLD} 0%, transparent 70%)`, filter: "blur(100px)" }} />
        </div>
        {/* Hero background image with overlay */}
        <div className="absolute inset-0 z-0">
          <img src="https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?w=1920&q=80" alt="Luxury interior" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, ${BG} 0%, transparent 30%, transparent 70%, ${BG} 100%)` }} />
        </div>
        <div className="mx-auto max-w-7xl px-4 md:px-6 w-full relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          <div className="space-y-8">
            <motion.p initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ ...spring, delay: 0.1 }} className="text-sm uppercase tracking-[0.3em] mb-4" style={{ color: GOLD }}>
              Luxury Interior Design Studio
            </motion.p>
            <h1 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white" style={{ textShadow: "0 2px 20px rgba(0,0,0,0.5)" }}>
              <WordReveal text="Spaces That Inspire. Interiors That Transform." />
            </h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.6 }} className="text-lg text-slate-400 max-w-lg leading-relaxed">
              We create bespoke interiors that marry sophistication with soul. Every space we design tells a story of refined taste and purposeful living.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.8 }} className="flex flex-wrap gap-4">
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-black flex items-center gap-2 cursor-pointer" style={{ background: GOLD_LIGHT } as React.CSSProperties}>
                View Our Work <ArrowRight size={18} weight="bold" />
              </MagneticButton>
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/10 flex items-center gap-2 cursor-pointer">
                <Phone size={18} weight="duotone" /> (555) 891-7654
              </MagneticButton>
            </motion.div>
          </div>
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ ...spring, delay: 0.3 }} className="hidden md:flex items-center justify-center lg:justify-end">
            <ChandelierSVG />
          </motion.div>
        </div>
      </section>

      {/* ─── PORTFOLIO SHOWCASE GRID ─── */}
      <SectionReveal id="portfolio" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GOLD }}>Our Work</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Curated Spaces" />
            </h2>
          </div>
          <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 auto-rows-[200px] md:auto-rows-[250px]" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {portfolioGallery.map((img, i) => (
              <motion.div key={i} variants={fadeUp} className={`${img.span} rounded-2xl overflow-hidden relative group cursor-default`}>
                <img src={img.src} alt={img.alt} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-end">
                  <div className="p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <p className="text-white text-sm font-medium">{img.alt}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── SERVICES ─── */}
      <SectionReveal id="services" className="relative z-10 py-16 md:py-24">
        <div className="absolute inset-0 pointer-events-none opacity-5">
          <svg width="100%" height="100%"><pattern id="id-grid" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M 60 0 L 0 0 0 60" fill="none" stroke={GOLD} strokeWidth="0.5" /></pattern><rect width="100%" height="100%" fill="url(#id-grid)" /></svg>
        </div>
        <div className="mx-auto max-w-7xl px-4 md:px-6 relative">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GOLD }}>What We Do</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Design Services" />
            </h2>
          </div>
          <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {services.map((svc, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="p-6 h-full">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: GOLD_GLOW }}>
                    <svc.icon size={24} weight="duotone" style={{ color: GOLD_LIGHT }} />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{svc.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{svc.description}</p>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── ABOUT / PHILOSOPHY ─── */}
      <SectionReveal id="about" className="relative z-10 py-16 md:py-24">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full opacity-10" style={{ background: `radial-gradient(circle, ${GOLD} 0%, transparent 70%)`, filter: "blur(80px)" }} />
        </div>
        <div className="mx-auto max-w-7xl px-4 md:px-6 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GOLD }}>Our Philosophy</p>
              <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white mb-6">
                <WordReveal text="Where Art Meets Function" />
              </h2>
              <div className="space-y-4 text-slate-400 leading-relaxed">
                <p>At Atelier Noir, we believe great design is invisible. It does not shout; it speaks. Our approach balances aesthetics with practicality, creating spaces that are as beautiful to live in as they are to look at.</p>
                <p>With over 15 years of experience and a portfolio spanning residential, commercial, and hospitality projects, we bring a global perspective to every design. Each project is a collaboration between our vision and your lifestyle.</p>
              </div>
              <div className="mt-8 grid grid-cols-2 gap-4">
                {[
                  { icon: Palette, label: "Bespoke Designs" },
                  { icon: Ruler, label: "Precision Planning" },
                  { icon: Trophy, label: "Award-Winning Studio" },
                  { icon: Sparkle, label: "Trade Access" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: GOLD_GLOW }}>
                      <item.icon size={16} weight="duotone" style={{ color: GOLD }} />
                    </div>
                    <span className="text-sm text-slate-300">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative rounded-2xl overflow-hidden aspect-[3/4]">
              <img src="https://images.unsplash.com/photo-1504615755583-2916b52192a3?w=800&q=80" alt="Luxury living room interior" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* ─── PROCESS ─── */}
      <SectionReveal id="process" className="relative z-10 py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-10">
          <svg width="100%" height="100%"><pattern id="id-dots" width="30" height="30" patternUnits="userSpaceOnUse"><circle cx="15" cy="15" r="1" fill={GOLD} /></pattern><rect width="100%" height="100%" fill="url(#id-dots)" /></svg>
        </div>
        <div className="mx-auto max-w-7xl px-4 md:px-6 relative">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GOLD }}>How We Work</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Our Design Process" />
            </h2>
          </div>
          <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {processSteps.map((step, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="p-6 h-full relative overflow-hidden">
                  <div className="absolute top-4 right-4 text-5xl font-black opacity-5 text-white">{step.step}</div>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: GOLD_GLOW }}>
                    <step.icon size={24} weight="duotone" style={{ color: GOLD_LIGHT }} />
                  </div>
                  <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: GOLD }}>{step.step}</div>
                  <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{step.description}</p>
                  {i < processSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-6 z-10">
                      <ArrowRight size={20} style={{ color: GOLD }} className="opacity-40" />
                    </div>
                  )}
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── TESTIMONIALS ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GOLD }}>Client Stories</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="What Our Clients Say" />
            </h2>
          </div>
          <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {testimonials.map((t, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="p-6 h-full flex flex-col">
                  <Quotes size={28} weight="fill" style={{ color: GOLD }} className="mb-3 opacity-50" />
                  <p className="text-slate-300 leading-relaxed flex-1 text-sm">{t.text}</p>
                  <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                    <span className="text-sm font-semibold text-white">{t.name}</span>
                    <div className="flex gap-0.5">{Array.from({ length: t.rating }).map((_, j) => (<Star key={j} size={12} weight="fill" style={{ color: GOLD }} />))}</div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── AWARDS / PRESS ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GOLD }}>Recognition</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Awards & Press" />
            </h2>
          </div>
          <ShimmerBorder>
            <div className="p-8 md:p-12">
              <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
                {awards.map((award, i) => (
                  <motion.div key={i} variants={fadeUp} className="flex items-center gap-3 py-3 px-4 rounded-xl bg-white/5">
                    <Trophy size={18} weight="duotone" style={{ color: GOLD }} className="shrink-0" />
                    <span className="text-sm text-slate-300">{award}</span>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </ShimmerBorder>
        </div>
      </SectionReveal>

      {/* ─── FAQ ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GOLD }}>Common Questions</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Frequently Asked Questions" />
            </h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <GlassCard key={i} className="overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-5 text-left cursor-pointer">
                  <span className="text-base font-semibold text-white pr-4">{faq.q}</span>
                  <motion.div animate={{ rotate: openFaq === i ? 180 : 0 }} transition={spring}>
                    <CaretDown size={20} className="text-slate-400 shrink-0" />
                  </motion.div>
                </button>
                <AnimatePresence initial={false}>
                  {openFaq === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={spring} className="overflow-hidden">
                      <p className="px-5 pb-5 text-slate-400 leading-relaxed">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </GlassCard>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ─── CONTACT ─── */}
      <SectionReveal id="contact" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GOLD }}>Start Your Project</p>
              <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white mb-6">
                <WordReveal text="Let Us Design Your Dream Space" />
              </h2>
              <p className="text-slate-400 leading-relaxed max-w-md mb-8">
                Every extraordinary space begins with a conversation. Tell us about your vision and let&apos;s create something remarkable together.
              </p>
              <div className="space-y-4">
                {[
                  { icon: MapPin, label: "Studio", value: "550 Design District\nNew York, NY 10013" },
                  { icon: Phone, label: "Phone", value: "(555) 891-7654" },
                  { icon: Clock, label: "Hours", value: "Mon-Fri 9am-6pm\nSaturday by appointment" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <item.icon size={20} weight="duotone" style={{ color: GOLD }} className="mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-white">{item.label}</p>
                      <p className="text-sm text-slate-400 whitespace-pre-line">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <GlassCard className="p-6 md:p-8">
              <h3 className="text-xl font-semibold text-white mb-6">Schedule a Consultation</h3>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input type="text" placeholder="First Name" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-yellow-600/50" />
                  <input type="text" placeholder="Last Name" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-yellow-600/50" />
                </div>
                <input type="email" placeholder="Email Address" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-yellow-600/50" />
                <input type="tel" placeholder="Phone Number" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-yellow-600/50" />
                <select className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-500 text-sm focus:outline-none focus:border-yellow-600/50">
                  <option value="">Project Type</option>
                  {services.map((s, i) => (<option key={i} value={s.title}>{s.title}</option>))}
                </select>
                <textarea placeholder="Tell us about your project..." rows={4} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-yellow-600/50 resize-none" />
                <MagneticButton className="w-full py-3 rounded-xl text-sm font-semibold text-black cursor-pointer" style={{ background: GOLD_LIGHT } as React.CSSProperties}>
                  <span className="flex items-center justify-center gap-2"><CalendarCheck size={18} /> Request Consultation</span>
                </MagneticButton>
              </form>
            </GlassCard>
          </div>
        </div>
      </SectionReveal>

      {/* ─── FOOTER ─── */}
      <footer className="relative z-10 border-t border-white/5 py-8">
        <div className="mx-auto max-w-7xl px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <PaintBrush size={16} weight="duotone" style={{ color: GOLD }} />
            <span>Atelier Noir &copy; {new Date().getFullYear()}</span>
          </div>
          <p className="text-xs text-slate-600">Website created by Bluejay Business Solutions</p>
        </div>
      </footer>
    </main>
  );
}
