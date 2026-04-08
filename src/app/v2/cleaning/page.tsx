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
  ShieldCheck,
  SprayBottle,
  Broom,
  House,
  Buildings,
  Sparkle,
  CaretDown,
  Phone,
  MapPin,
  Clock,
  ArrowRight,
  CheckCircle,
  Quotes,
  X,
  List,
  Leaf,
  UsersFour,
  CalendarCheck,
  CurrencyDollar,
  Drop,
  WindowsLogo,
  Truck,
  ListChecks,
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
const BG = "#0a1520";
const BLUE = "#0284c7";
const BLUE_LIGHT = "#38bdf8";
const BLUE_GLOW = "rgba(2, 132, 199, 0.15)";

/* ───────────────────────── FLOATING SPARKLE PARTICLES ───────────────────────── */
function FloatingSparkles() {
  const particles = Array.from({ length: 26 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 8,
    duration: 5 + Math.random() * 7,
    size: 2 + Math.random() * 4,
    opacity: 0.15 + Math.random() * 0.35,
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
            background: BLUE_LIGHT,
            willChange: "transform, opacity",
          }}
          animate={{
            y: ["-10vh", "110vh"],
            opacity: [0, p.opacity, p.opacity, 0],
          }}
          transition={{
            y: { duration: p.duration, repeat: Infinity, delay: p.delay, ease: "linear" },
            opacity: { duration: p.duration, repeat: Infinity, delay: p.delay, times: [0, 0.1, 0.9, 1] },
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
      <motion.div className="absolute inset-0 rounded-2xl" style={{ background: `conic-gradient(from 0deg, transparent, ${BLUE}, transparent, ${BLUE_LIGHT}, transparent)`, willChange: "transform" }} animate={{ rotate: [0, 360] }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} />
      <div className="relative rounded-2xl z-10" style={{ background: BG }}>{children}</div>
    </div>
  );
}

function AccordionItem({ title, description, icon: Icon, isOpen, onToggle }: { title: string; description: string; icon: React.ElementType; isOpen: boolean; onToggle: () => void }) {
  return (
    <GlassCard className="overflow-hidden">
      <button onClick={onToggle} className="w-full flex items-center justify-between p-5 md:p-6 text-left group cursor-pointer">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: BLUE_GLOW }}><Icon size={20} weight="duotone" style={{ color: BLUE }} /></div>
          <span className="text-lg font-semibold text-white">{title}</span>
        </div>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={spring}><CaretDown size={20} className="text-slate-400" /></motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={spring} className="overflow-hidden">
            <p className="px-5 pb-5 md:px-6 md:pb-6 text-slate-400 leading-relaxed pl-[4.5rem]">{description}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
}

/* ───────────────────────── SPARKLE SVG HERO ───────────────────────── */
function SparkleHeroIcon() {
  return (
    <div className="relative flex items-center justify-center">
      {/* Pulsing glow behind */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{ background: `radial-gradient(circle, ${BLUE_GLOW} 0%, transparent 70%)`, filter: "blur(40px)" }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      <svg viewBox="0 0 200 200" className="relative z-10 w-52 h-52 md:w-64 md:h-64" fill="none">
        {/* Outer glow rings */}
        <motion.circle cx="100" cy="100" r="90" stroke={BLUE} strokeWidth="0.5" opacity={0.12}
          animate={{ r: [88, 92, 88] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} />
        <motion.circle cx="100" cy="100" r="80" stroke={BLUE} strokeWidth="0.3" opacity={0.08}
          animate={{ r: [78, 82, 78] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }} />

        {/* Main sparkle star — filled */}
        <motion.path
          d="M100 20 L112 72 L165 72 L122 100 L135 152 L100 125 L65 152 L78 100 L35 72 L88 72Z"
          fill={`${BLUE}22`} stroke={BLUE} strokeWidth="2" strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2.5, ease: "easeInOut" }}
        />
        {/* Inner star highlight */}
        <path d="M100 45 L108 78 L140 78 L114 96 L122 130 L100 112 L78 130 L86 96 L60 78 L92 78Z"
          fill={`${BLUE}0d`} />

        {/* Center circle glow */}
        <motion.circle cx="100" cy="90" r="16" fill={`${BLUE}18`} stroke={BLUE_LIGHT} strokeWidth="1.5"
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ duration: 0.8, delay: 1.2, ease: "backOut" }} />
        <motion.circle cx="100" cy="90" r="8" fill={`${BLUE_LIGHT}30`}
          animate={{ r: [7, 10, 7], opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }} />

        {/* Spray mist arcs */}
        <motion.path d="M55 55 C40 40, 25 50, 20 65" stroke={BLUE_LIGHT} strokeWidth="1" strokeLinecap="round" fill="none" opacity={0.3}
          initial={{ pathLength: 0 }} animate={{ pathLength: [0, 1, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} />
        <motion.path d="M145 55 C160 40, 175 50, 180 65" stroke={BLUE_LIGHT} strokeWidth="1" strokeLinecap="round" fill="none" opacity={0.3}
          initial={{ pathLength: 0 }} animate={{ pathLength: [0, 1, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }} />

        {/* Bubble effects */}
        <motion.circle cx="35" cy="75" r="6" fill={`${BLUE}15`} stroke={BLUE_LIGHT} strokeWidth="0.8"
          animate={{ cy: [75, 65, 75], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} />
        <motion.circle cx="165" cy="80" r="5" fill={`${BLUE}12`} stroke={BLUE_LIGHT} strokeWidth="0.6"
          animate={{ cy: [80, 68, 80], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.6 }} />
        <motion.circle cx="50" cy="140" r="4" fill={`${BLUE}10`} stroke={BLUE_LIGHT} strokeWidth="0.5"
          animate={{ cy: [140, 130, 140], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: 1.2 }} />
        <motion.circle cx="155" cy="145" r="3.5" fill={`${BLUE}10`} stroke={BLUE_LIGHT} strokeWidth="0.5"
          animate={{ cy: [145, 136, 145], opacity: [0.15, 0.35, 0.15] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", delay: 0.9 }} />

        {/* Sparkle accents */}
        <motion.circle cx="170" cy="35" r="3" fill={BLUE_LIGHT}
          animate={{ opacity: [0.2, 1, 0.2], scale: [0.7, 1.3, 0.7] }}
          transition={{ duration: 2.5, repeat: Infinity }} />
        <motion.circle cx="25" cy="40" r="2" fill={BLUE_LIGHT}
          animate={{ opacity: [0.1, 0.8, 0.1], scale: [0.5, 1.2, 0.5] }}
          transition={{ duration: 3, repeat: Infinity, delay: 0.8 }} />
        <motion.circle cx="175" cy="160" r="2.5" fill={BLUE_LIGHT}
          animate={{ opacity: [0.15, 0.7, 0.15] }}
          transition={{ duration: 2, repeat: Infinity, delay: 1.2 }} />
        <motion.circle cx="22" cy="155" r="2" fill={BLUE_LIGHT}
          animate={{ opacity: [0.1, 0.6, 0.1] }}
          transition={{ duration: 2.5, repeat: Infinity, delay: 0.4 }} />

        {/* Tiny sparkle crosses */}
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}>
          <rect x="28" y="118" width="10" height="2.5" rx="1.25" fill={BLUE_LIGHT} opacity={0.35} />
          <rect x="31.75" y="114.25" width="2.5" height="10" rx="1.25" fill={BLUE_LIGHT} opacity={0.35} />
        </motion.g>
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.3 }}>
          <rect x="158" y="110" width="8" height="2" rx="1" fill={BLUE_LIGHT} opacity={0.3} />
          <rect x="161" y="107" width="2" height="8" rx="1" fill={BLUE_LIGHT} opacity={0.3} />
        </motion.g>
      </svg>
    </div>
  );
}

/* ───────────────────────── WAVE BG ───────────────────────── */
function WaveBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
      <motion.svg viewBox="0 0 1440 320" className="absolute bottom-0 w-full" preserveAspectRatio="none">
        <motion.path fill={BLUE} fillOpacity="0.3" animate={{ d: ["M0,224L48,213.3C96,203,192,181,288,186.7C384,192,480,224,576,229.3C672,235,768,213,864,197.3C960,181,1056,171,1152,181.3C1248,192,1344,224,1392,240L1440,256L1440,320L0,320Z", "M0,256L48,240C96,224,192,192,288,192C384,192,480,224,576,234.7C672,245,768,235,864,218.7C960,203,1056,181,1152,186.7C1248,192,1344,224,1392,240L1440,256L1440,320L0,320Z", "M0,224L48,213.3C96,203,192,181,288,186.7C384,192,480,224,576,229.3C672,235,768,213,864,197.3C960,181,1056,171,1152,181.3C1248,192,1344,224,1392,240L1440,256L1440,320L0,320Z"] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} />
      </motion.svg>
    </div>
  );
}

/* ───────────────────────── DATA ───────────────────────── */
const services = [
  { title: "Residential Cleaning", description: "Thorough top-to-bottom home cleaning including dusting, vacuuming, mopping, kitchen and bathroom sanitation. We bring our own eco-friendly supplies and leave your home sparkling.", icon: House },
  { title: "Commercial Cleaning", description: "Professional office and commercial space cleaning with flexible scheduling. Lobbies, workstations, break rooms, and restrooms maintained to the highest hygiene standards.", icon: Buildings },
  { title: "Deep Cleaning", description: "Intensive cleaning for homes that need extra attention. Baseboards, inside appliances, light fixtures, window sills, grout scrubbing, and behind-furniture cleaning included.", icon: SprayBottle },
  { title: "Move-In/Move-Out", description: "Get your security deposit back or start fresh in your new home. We clean every surface, inside cabinets, appliances, closets, and garage floors.", icon: Truck },
  { title: "Carpet Cleaning", description: "Professional steam cleaning and stain removal for carpets and upholstery. We use truck-mounted extraction equipment for deep, lasting results.", icon: Broom },
  { title: "Window Cleaning", description: "Crystal-clear windows inside and out. We handle screens, sills, tracks, and hard-to-reach glass with professional squeegee techniques and eco-safe solutions.", icon: WindowsLogo },
];

const stats = [
  { value: "2,500+", label: "Homes Cleaned" },
  { value: "4.9", label: "Star Rating" },
  { value: "100%", label: "Satisfaction Rate" },
  { value: "12+", label: "Years in Business" },
];

const testimonials = [
  { name: "Jennifer M.", text: "The deep cleaning was incredible. They got stains out of our carpet that we thought were permanent. Our home has never looked this good.", rating: 5 },
  { name: "Marcus T.", text: "We use their commercial service for our office weekly. Consistent, thorough, and the team is always professional. Highly recommend.", rating: 5 },
  { name: "Patricia W.", text: "The move-out cleaning saved our security deposit. They cleaned things we did not even think about. Worth every penny.", rating: 5 },
];

const processSteps = [
  { step: "01", title: "Free Estimate", description: "Tell us about your space and we provide a transparent, no-obligation quote within hours." },
  { step: "02", title: "Customize", description: "Choose your services, schedule, and any special requests. We tailor everything to your needs." },
  { step: "03", title: "We Clean", description: "Our trained, insured team arrives on time with professional-grade equipment and eco-friendly products." },
  { step: "04", title: "Walk-Through", description: "We do a final walk-through to ensure everything meets our quality standards and your satisfaction." },
];

const checklist = [
  "Bonded & insured team members",
  "Eco-friendly, non-toxic products",
  "Background-checked employees",
  "100% satisfaction guarantee",
  "Same-day service available",
  "No hidden fees or surprises",
  "Consistent team assignment",
  "Pet-friendly cleaning solutions",
];

const faqItems = [
  { q: "Do I need to be home during the cleaning?", a: "Not at all. Many clients provide a key or access code. We are fully bonded and insured for your peace of mind." },
  { q: "What products do you use?", a: "We use eco-friendly, non-toxic cleaning products that are safe for children, pets, and the environment while still delivering a deep clean." },
  { q: "How do you price your services?", a: "Pricing is based on square footage, number of rooms, and the type of cleaning requested. We always provide a free estimate before starting." },
  { q: "Can I customize what gets cleaned?", a: "Absolutely. We offer fully customizable cleaning plans. Want us to focus on kitchens and bathrooms? No problem. Need laundry folded? We can do that too." },
  { q: "What if I am not satisfied?", a: "We offer a 100% satisfaction guarantee. If anything is not up to your standards, we will return within 24 hours to re-clean at no extra charge." },
];

const packages = [
  { name: "Essential", price: "$149", period: "/visit", features: ["General tidying & dusting", "Kitchen & bathroom cleaning", "Vacuuming & mopping", "Trash removal", "Surface sanitization"], highlighted: false },
  { name: "Premium", price: "$249", period: "/visit", features: ["Everything in Essential", "Deep appliance cleaning", "Baseboards & light fixtures", "Inside cabinet wipe-down", "Window interior cleaning", "Laundry folding"], highlighted: true },
  { name: "Luxury", price: "$399", period: "/visit", features: ["Everything in Premium", "Carpet steam cleaning", "Grout & tile restoration", "Closet organization", "Garage sweep & mop", "Refrigerator deep clean", "Priority scheduling"], highlighted: false },
];

/* ═══════════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════════ */
export default function V2CleaningPage() {
  const [openService, setOpenService] = useState<number | null>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden" style={{ background: BG, color: "#f1f5f9" }}>
      <FloatingSparkles />

      {/* ─── NAV ─── */}
      <motion.nav initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-4">
          <GlassCard className="flex items-center justify-between px-4 md:px-6 py-3">
            <div className="flex items-center gap-2">
              <Sparkle size={24} weight="duotone" style={{ color: BLUE }} />
              <span className="text-lg font-bold tracking-tight text-white">Crystal Clean Co.</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
              <a href="#services" className="hover:text-white transition-colors">Services</a>
              <a href="#process" className="hover:text-white transition-colors">Process</a>
              <a href="#testimonials" className="hover:text-white transition-colors">Reviews</a>
              <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
              <a href="#contact" className="hover:text-white transition-colors">Contact</a>
            </div>
            <div className="flex items-center gap-3">
              <MagneticButton className="px-4 md:px-5 py-2 rounded-full text-sm font-semibold text-white transition-colors" style={{ background: BLUE }}>Get a Quote</MagneticButton>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors">{mobileMenuOpen ? <X size={24} /> : <List size={24} />}</button>
            </div>
          </GlassCard>
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3, ease: "easeInOut" }} className="md:hidden mt-2 overflow-hidden">
                <GlassCard className="flex flex-col gap-1 px-4 py-4">
                  {[{ label: "Services", href: "#services" }, { label: "Process", href: "#process" }, { label: "Reviews", href: "#testimonials" }, { label: "Pricing", href: "#pricing" }, { label: "Contact", href: "#contact" }].map((link) => (
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
        {/* Radial glow background */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 60% 40% at 50% 30%, ${BLUE_GLOW} 0%, transparent 70%)` }} />
        <div className="mx-auto max-w-7xl px-4 md:px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-4 items-center">
          <div className="space-y-8">
            <div>
              <motion.p initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ ...spring, delay: 0.1 }} className="text-sm uppercase tracking-widest mb-4" style={{ color: BLUE }}>Professional Cleaning Services</motion.p>
              <h1 className="text-3xl md:text-6xl tracking-tighter leading-none font-bold text-white" style={{ textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>
                <WordReveal text="Sparkling Clean, Every Time" />
              </h1>
            </div>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.6 }} className="text-lg text-slate-400 max-w-md leading-relaxed">
              From weekly home cleaning to deep commercial sanitation, we deliver spotless results with eco-friendly products and meticulous attention to detail.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.8 }} className="flex flex-wrap gap-4">
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white flex items-center gap-2 cursor-pointer" style={{ background: BLUE }}>
                Get Free Estimate <ArrowRight size={18} weight="bold" />
              </MagneticButton>
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/10 flex items-center gap-2 cursor-pointer">
                <Phone size={18} weight="duotone" /> (555) 789-0123
              </MagneticButton>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ ...spring, delay: 1 }} className="flex flex-wrap gap-6 text-sm text-slate-400">
              <span className="flex items-center gap-2"><Leaf size={16} weight="duotone" style={{ color: BLUE }} />Eco-Friendly Products</span>
              <span className="flex items-center gap-2"><ShieldCheck size={16} weight="duotone" style={{ color: BLUE }} />Bonded & Insured</span>
            </motion.div>
          </div>
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ ...spring, delay: 0.3 }} className="hidden md:flex items-center justify-center lg:justify-end">
            <SparkleHeroIcon />
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
                  <p className="text-3xl md:text-4xl font-bold tracking-tight" style={{ color: BLUE }}>{s.value}</p>
                  <p className="text-sm text-slate-400 mt-1">{s.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </GlassCard>
        </div>
      </SectionReveal>

      {/* ─── SERVICES ACCORDION ─── */}
      <SectionReveal id="services" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            <div className="lg:sticky lg:top-32">
              <p className="text-sm uppercase tracking-widest mb-3" style={{ color: BLUE }}>What We Offer</p>
              <h2 className="text-3xl md:text-6xl tracking-tighter leading-none font-bold text-white mb-6"><WordReveal text="Professional Cleaning Services" /></h2>
              <p className="text-slate-400 leading-relaxed max-w-md">From routine home maintenance to intensive deep cleans, every service is delivered with professional-grade equipment and eco-friendly products. Click any service to learn more.</p>
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

      {/* ─── ABOUT ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 50% 50% at 80% 50%, ${BLUE_GLOW} 0%, transparent 70%)` }} />
        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative rounded-2xl overflow-hidden aspect-[4/3]">
            <img src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=80" alt="Professional cleaning team at work" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          </div>
          <div>
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: BLUE }}>About Us</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white mb-6"><WordReveal text="12 Years of Spotless Results" /></h2>
            <p className="text-slate-400 leading-relaxed mb-4">Crystal Clean Co. was founded with a simple mission: deliver consistently exceptional cleaning with honest pricing and genuine care for our clients and the environment.</p>
            <p className="text-slate-400 leading-relaxed mb-6">Every team member is background-checked, trained in our proprietary methods, and committed to leaving every space cleaner than you imagined possible. We use only eco-friendly, non-toxic products that are safe for your family, pets, and the planet.</p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-sm"><Recycle size={18} weight="duotone" style={{ color: BLUE }} /><span className="text-slate-300">Green Certified</span></div>
              <div className="flex items-center gap-2 text-sm"><UsersFour size={18} weight="duotone" style={{ color: BLUE }} /><span className="text-slate-300">50+ Team Members</span></div>
              <div className="flex items-center gap-2 text-sm"><ShieldCheck size={18} weight="duotone" style={{ color: BLUE }} /><span className="text-slate-300">Fully Insured</span></div>
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* ─── PROCESS ─── */}
      <SectionReveal id="process" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: BLUE }}>How It Works</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white"><WordReveal text="Simple 4-Step Process" /></h2>
          </div>
          <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {processSteps.map((step, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="p-6 h-full relative overflow-hidden">
                  <div className="absolute top-4 right-4 text-5xl font-black opacity-5 text-white">{step.step}</div>
                  <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: BLUE }}>Step {step.step}</p>
                  <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{step.description}</p>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── TESTIMONIALS ─── */}
      <SectionReveal id="testimonials" className="relative z-10 py-16 md:py-24">
        <WaveBackground />
        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: BLUE }}>Client Stories</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white"><WordReveal text="Loved by Homeowners" /></h2>
          </div>
          <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {testimonials.map((t, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="p-6 h-full flex flex-col">
                  <Quotes size={28} weight="fill" style={{ color: BLUE }} className="mb-3 opacity-50" />
                  <p className="text-slate-300 leading-relaxed flex-1 text-sm">{t.text}</p>
                  <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                    <span className="text-sm font-semibold text-white">{t.name}</span>
                    <div className="flex gap-0.5">{Array.from({ length: t.rating }).map((_, j) => (<Star key={j} size={12} weight="fill" style={{ color: BLUE }} />))}</div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── CHECKLIST GUARANTEE ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-sm uppercase tracking-widest mb-3" style={{ color: BLUE }}>Our Promise</p>
              <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white mb-6"><WordReveal text="The Crystal Clean Guarantee" /></h2>
              <p className="text-slate-400 leading-relaxed max-w-md mb-8">Every cleaning comes with our ironclad satisfaction guarantee. If any area does not meet your standards, we return within 24 hours to make it right, no questions asked.</p>
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white flex items-center gap-2 cursor-pointer" style={{ background: BLUE }}>
                <ListChecks size={20} weight="duotone" /> Book With Confidence
              </MagneticButton>
            </div>
            <motion.div className="grid grid-cols-1 sm:grid-cols-2 gap-3" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
              {checklist.map((item, i) => (
                <motion.div key={i} variants={fadeUp}>
                  <GlassCard className="p-4 flex items-center gap-3">
                    <CheckCircle size={20} weight="duotone" style={{ color: BLUE }} className="shrink-0" />
                    <span className="text-sm text-slate-300">{item}</span>
                  </GlassCard>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </SectionReveal>

      {/* ─── FAQ ─── */}
      <SectionReveal id="faq" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: BLUE }}>Common Questions</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white"><WordReveal text="Frequently Asked Questions" /></h2>
          </div>
          <motion.div className="space-y-3" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
            {faqItems.map((faq, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="overflow-hidden">
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-5 text-left cursor-pointer">
                    <span className="text-base font-semibold text-white pr-4">{faq.q}</span>
                    <motion.div animate={{ rotate: openFaq === i ? 180 : 0 }} transition={spring}><CaretDown size={20} className="text-slate-400" /></motion.div>
                  </button>
                  <AnimatePresence initial={false}>
                    {openFaq === i && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={spring} className="overflow-hidden">
                        <p className="px-5 pb-5 text-slate-400 leading-relaxed">{faq.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
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
              <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white mb-6"><WordReveal text="Ready for a Spotless Space?" /></h2>
              <p className="text-slate-400 leading-relaxed max-w-md mb-8">Get your free estimate today. We respond within 2 hours and can often schedule service for the same week.</p>
              <div className="flex flex-wrap gap-4">
                <MagneticButton className="px-10 py-4 rounded-full text-base font-semibold text-white inline-flex items-center gap-2 cursor-pointer" style={{ background: BLUE }}>
                  <CalendarCheck size={20} weight="duotone" /> Schedule Cleaning
                </MagneticButton>
                <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/10 flex items-center gap-2 cursor-pointer">
                  <Phone size={18} weight="duotone" /> Call Us
                </MagneticButton>
              </div>
            </div>
            <GlassCard className="p-8">
              <h3 className="text-xl font-semibold text-white mb-6">Contact Info</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4"><MapPin size={20} weight="duotone" style={{ color: BLUE }} className="mt-0.5 shrink-0" /><div><p className="text-sm font-semibold text-white">Location</p><p className="text-sm text-slate-400">456 Clean Street, Suite 100<br />Seattle, WA 98101</p></div></div>
                <div className="flex items-start gap-4"><Phone size={20} weight="duotone" style={{ color: BLUE }} className="mt-0.5 shrink-0" /><div><p className="text-sm font-semibold text-white">Phone</p><p className="text-sm text-slate-400">(555) 789-0123</p></div></div>
                <div className="flex items-start gap-4"><Clock size={20} weight="duotone" style={{ color: BLUE }} className="mt-0.5 shrink-0" /><div><p className="text-sm font-semibold text-white">Hours</p><p className="text-sm text-slate-400">Monday - Friday: 7:00 AM - 7:00 PM<br />Saturday: 8:00 AM - 5:00 PM<br />Sunday: Closed</p></div></div>
                <div className="flex items-start gap-4"><Drop size={20} weight="duotone" style={{ color: BLUE }} className="mt-0.5 shrink-0" /><div><p className="text-sm font-semibold text-white">Service Area</p><p className="text-sm text-slate-400">Greater Seattle Metro Area<br />Up to 30 miles from downtown</p></div></div>
              </div>
            </GlassCard>
          </div>
        </div>
      </SectionReveal>

      {/* ─── PRICING PACKAGES ─── */}
      <SectionReveal id="pricing" className="relative z-10 py-16 md:py-24">
        <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 60% 40% at 50% 50%, ${BLUE_GLOW} 0%, transparent 70%)` }} />
        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: BLUE }}>Pricing</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white"><WordReveal text="Transparent Pricing Plans" /></h2>
          </div>
          <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {packages.map((pkg, i) => (
              <motion.div key={i} variants={fadeUp}>
                {pkg.highlighted ? (
                  <ShimmerBorder>
                    <div className="p-8 text-center">
                      <p className="text-xs uppercase tracking-widest font-bold mb-2" style={{ color: BLUE }}>Most Popular</p>
                      <h3 className="text-2xl font-bold text-white mb-2">{pkg.name}</h3>
                      <p className="text-4xl font-bold tracking-tight mb-1" style={{ color: BLUE }}>{pkg.price}<span className="text-base font-normal text-slate-400">{pkg.period}</span></p>
                      <ul className="mt-6 space-y-3 text-left">
                        {pkg.features.map((f, j) => (<li key={j} className="flex items-center gap-3 text-sm text-slate-300"><CheckCircle size={16} weight="duotone" style={{ color: BLUE }} className="shrink-0" />{f}</li>))}
                      </ul>
                      <MagneticButton className="mt-8 w-full py-3 rounded-full text-sm font-semibold text-white cursor-pointer" style={{ background: BLUE }}>Choose {pkg.name}</MagneticButton>
                    </div>
                  </ShimmerBorder>
                ) : (
                  <GlassCard className="p-8 text-center h-full flex flex-col">
                    <h3 className="text-2xl font-bold text-white mb-2">{pkg.name}</h3>
                    <p className="text-4xl font-bold tracking-tight mb-1" style={{ color: BLUE }}>{pkg.price}<span className="text-base font-normal text-slate-400">{pkg.period}</span></p>
                    <ul className="mt-6 space-y-3 text-left flex-1">
                      {pkg.features.map((f, j) => (<li key={j} className="flex items-center gap-3 text-sm text-slate-300"><CheckCircle size={16} weight="duotone" style={{ color: BLUE }} className="shrink-0" />{f}</li>))}
                    </ul>
                    <MagneticButton className="mt-8 w-full py-3 rounded-full text-sm font-semibold text-white border border-white/10 cursor-pointer">Choose {pkg.name}</MagneticButton>
                  </GlassCard>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── FOOTER ─── */}
      <footer className="relative z-10 border-t border-white/5 py-8">
        <div className="mx-auto max-w-7xl px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Sparkle size={16} weight="duotone" style={{ color: BLUE }} />
            <span>Crystal Clean Co. &copy; {new Date().getFullYear()}</span>
          </div>
          <p className="text-xs text-slate-600">Created by <a href="https://bluejayportfolio.com" target="_blank" rel="noopener noreferrer" style={{textDecoration:"underline"}}>bluejayportfolio.com</a></p>
        </div>
      </footer>
    </main>
  );
}
