"use client";

/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/purity */

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
  ShieldCheck,
  Broom,
  House,
  Buildings,
  CaretDown,
  Phone,
  MapPin,
  Clock,
  ArrowRight,
  Heart,
  Users,
  CalendarCheck,
  CheckCircle,
  Quotes,
  X,
  List,
  Sparkle,
  Drop,
  Leaf,
  HandSoap,
  CurrencyDollar,
  SealCheck,
  Certificate,
  Trophy,
  Bathtub,
  CookingPot,
  Bed,
  Couch,
  Broom as BroomIcon,
  Lightning,
  Timer,
  Recycle,
  ChartLineUp,
  CaretRight,
  Check,
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
const BG = "#0a1520";
const SURFACE = "#0f1d2d";
const BLUE = "#0284c7";
const BLUE_LIGHT = "#38bdf8";
const MINT = "#34d399";
const MINT_GLOW = "rgba(52, 211, 153, 0.12)";
const BLUE_GLOW = "rgba(2, 132, 199, 0.15)";

/* ───────────────────────── FLOATING BUBBLES ───────────────────────── */
function FloatingBubbles() {
  const particles = Array.from({ length: 16 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 8,
    duration: 8 + Math.random() * 6,
    size: 4 + Math.random() * 8,
    opacity: 0.05 + Math.random() * 0.15,
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
            background: p.id % 2 === 0 ? BLUE_LIGHT : MINT,
            filter: "blur(1px)",
            willChange: "transform, opacity",
          }}
          animate={{
            y: ["110vh", "-10vh"],
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

/* ───────────────────────── SHARED COMPONENTS ───────────────────────── */
function WordReveal({ text, className = "" }: { text: string; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const words = text.split(" ");

  return (
    <motion.span ref={ref} className={`inline-flex flex-wrap gap-x-3 ${className}`} variants={stagger} initial="hidden" animate={isInView ? "show" : "hidden"}>
      {words.map((word, i) => (
        <motion.span key={i} variants={fadeUp} className="inline-block">{word}</motion.span>
      ))}
    </motion.span>
  );
}

function SectionReveal({ children, className = "", id }: { children: React.ReactNode; className?: string; id?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.section ref={ref} id={id} className={className}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={spring}>
      {children}
    </motion.section>
  );
}

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-white/15 bg-white/[0.08] backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] ${className}`}>
      {children}
    </div>
  );
}

function MagneticButton({ children, className = "", onClick, style }: { children: React.ReactNode; className?: string; onClick?: () => void; style?: React.CSSProperties }) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, springFast);
  const springY = useSpring(y, springFast);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - (rect.left + rect.width / 2)) * 0.25);
    y.set((e.clientY - (rect.top + rect.height / 2)) * 0.25);
  }, [x, y]);

  const handleMouseLeave = useCallback(() => { x.set(0); y.set(0); }, [x, y]);

  return (
    <motion.button ref={ref} style={{ x: springX, y: springY, willChange: "transform", ...style }}
      onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} onClick={onClick}
      className={className} whileTap={{ scale: 0.97 }}>
      {children}
    </motion.button>
  );
}

function ShimmerBorder({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative rounded-2xl p-[1px] overflow-hidden ${className}`}>
      <motion.div className="absolute inset-0 rounded-2xl"
        style={{ background: `conic-gradient(from 0deg, transparent, ${BLUE}, transparent, ${MINT}, transparent)`, willChange: "transform" }}
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }} />
      <div className="relative rounded-2xl z-10" style={{ background: BG }}>{children}</div>
    </div>
  );
}

/* ───────────────────────── ROTATING ROOM CARDS (Hero) ───────────────────────── */
const heroRooms = [
  { name: "Kitchen", icon: CookingPot, color: BLUE_LIGHT, tasks: ["Counters & appliances", "Cabinet fronts", "Floor deep-scrub"] },
  { name: "Bathroom", icon: Bathtub, color: MINT, tasks: ["Tile & grout", "Fixtures polished", "Mirror streak-free"] },
  { name: "Living Room", icon: Couch, color: BLUE_LIGHT, tasks: ["Dust all surfaces", "Vacuum & mop", "Window sills"] },
  { name: "Bedroom", icon: Bed, color: MINT, tasks: ["Linens freshened", "Under-bed cleaned", "Closet organized"] },
];

function RotatingRoomCards() {
  const [activeRoom, setActiveRoom] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveRoom((prev) => (prev + 1) % heroRooms.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full max-w-sm mx-auto">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeRoom}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={spring}
        >
          <GlassCard className="p-6">
            <div className="flex items-center gap-3 mb-4">
              {(() => {
                const Icon = heroRooms[activeRoom].icon;
                return (
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${heroRooms[activeRoom].color}22` }}>
                    <Icon size={26} weight="duotone" style={{ color: heroRooms[activeRoom].color }} />
                  </div>
                );
              })()}
              <div>
                <h3 className="text-lg font-semibold text-white">{heroRooms[activeRoom].name}</h3>
                <div className="flex items-center gap-1.5">
                  <CheckCircle size={14} weight="fill" style={{ color: MINT }} />
                  <span className="text-xs font-medium" style={{ color: MINT }}>Cleaned</span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              {heroRooms[activeRoom].tasks.map((task, i) => (
                <motion.div
                  key={task}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.15 }}
                  className="flex items-center gap-2"
                >
                  <Check size={14} weight="bold" style={{ color: MINT }} />
                  <span className="text-sm text-slate-300">{task}</span>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </AnimatePresence>

      {/* Room indicators */}
      <div className="flex justify-center gap-2 mt-4">
        {heroRooms.map((room, i) => (
          <button
            key={room.name}
            onClick={() => setActiveRoom(i)}
            className="w-2.5 h-2.5 rounded-full transition-all cursor-pointer"
            style={{ background: i === activeRoom ? BLUE_LIGHT : "rgba(255,255,255,0.15)", transform: i === activeRoom ? "scale(1.3)" : "scale(1)" }}
          />
        ))}
      </div>
    </div>
  );
}

/* ───────────────────────── INSTANT ESTIMATE CALCULATOR ───────────────────────── */
function EstimateCalculator() {
  const [bedrooms, setBedrooms] = useState(2);
  const [bathrooms, setBathrooms] = useState(1);
  const [extras, setExtras] = useState<string[]>([]);

  const basePrice = 99;
  const bedroomPrice = 35;
  const bathroomPrice = 25;
  const extraPrices: Record<string, number> = {
    "Deep Clean": 75,
    "Inside Fridge": 30,
    "Inside Oven": 30,
    "Laundry": 25,
    "Interior Windows": 40,
    "Organizing": 50,
  };

  const total = basePrice + (bedrooms * bedroomPrice) + (bathrooms * bathroomPrice) + extras.reduce((sum, e) => sum + (extraPrices[e] || 0), 0);

  const toggleExtra = (name: string) => {
    setExtras(prev => prev.includes(name) ? prev.filter(e => e !== name) : [...prev, name]);
  };

  return (
    <GlassCard className="p-6 md:p-8">
      <h3 className="text-xl font-semibold text-white mb-6">Instant Estimate Calculator</h3>
      <div className="space-y-6">
        {/* Bedrooms */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Bedrooms</span>
            <span className="text-sm font-semibold text-white">{bedrooms}</span>
          </div>
          <input
            type="range" min="1" max="6" value={bedrooms}
            onChange={(e) => setBedrooms(Number(e.target.value))}
            className="w-full accent-sky-500"
          />
        </div>

        {/* Bathrooms */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Bathrooms</span>
            <span className="text-sm font-semibold text-white">{bathrooms}</span>
          </div>
          <input
            type="range" min="1" max="4" value={bathrooms}
            onChange={(e) => setBathrooms(Number(e.target.value))}
            className="w-full accent-sky-500"
          />
        </div>

        {/* Extras */}
        <div>
          <p className="text-sm text-slate-400 mb-3">Add-Ons</p>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(extraPrices).map(([name, price]) => (
              <button
                key={name}
                onClick={() => toggleExtra(name)}
                className="p-3 rounded-xl border text-left text-sm transition-all cursor-pointer"
                style={{
                  background: extras.includes(name) ? `${BLUE}22` : "rgba(255,255,255,0.02)",
                  borderColor: extras.includes(name) ? BLUE_LIGHT : "rgba(255,255,255,0.08)",
                  color: extras.includes(name) ? "#fff" : "#94a3b8",
                }}
              >
                <span className="block">{name}</span>
                <span className="text-xs" style={{ color: MINT }}>+${price}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Total */}
        <div className="border-t border-white/15 pt-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-slate-400">Estimated Total</span>
            <motion.span
              key={total}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              className="text-3xl font-black"
              style={{ color: MINT }}
            >
              ${total}
            </motion.span>
          </div>
          <MagneticButton className="w-full py-3 rounded-xl text-sm font-semibold text-white cursor-pointer" style={{ background: BLUE } as React.CSSProperties}>
            <span className="flex items-center justify-center gap-2"><CalendarCheck size={18} /> Book This Cleaning</span>
          </MagneticButton>
        </div>
      </div>
    </GlassCard>
  );
}

/* ───────────────────────── ECO COMMITMENT ───────────────────────── */
function EcoCommitment() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const stats = [
    { label: "Plant-Based Products", pct: 100, color: MINT },
    { label: "Recyclable Packaging", pct: 95, color: BLUE_LIGHT },
    { label: "Carbon Neutral Operations", pct: 85, color: MINT },
  ];

  return (
    <div ref={ref} className="space-y-4">
      {stats.map((stat, i) => (
        <div key={i}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm text-slate-300">{stat.label}</span>
            <span className="text-sm font-bold" style={{ color: stat.color }}>{stat.pct}%</span>
          </div>
          <div className="h-2 rounded-full bg-white/5 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: stat.color }}
              initial={{ width: 0 }}
              animate={isInView ? { width: `${stat.pct}%` } : { width: 0 }}
              transition={{ duration: 1.2, delay: i * 0.2, ease: "easeOut" }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ───────────────────────── DATA ───────────────────────── */
const services = [
  { title: "Residential Cleaning", description: "Thorough home cleaning tailored to your needs. Every surface, every room, every time. We bring all supplies and equipment.", icon: House, price: "From $149" },
  { title: "Commercial Cleaning", description: "Professional office and retail space cleaning. After-hours scheduling available to keep your business running smooth.", icon: Buildings, price: "From $199" },
  { title: "Deep Cleaning", description: "Intensive top-to-bottom cleaning for homes that need extra attention. Baseboards, light fixtures, inside appliances — nothing missed.", icon: Sparkle, price: "From $299" },
  { title: "Move-In/Out Cleaning", description: "Get your full deposit back. We clean every inch — inside cabinets, closets, window tracks, appliance interiors.", icon: Broom, price: "From $349" },
  { title: "Post-Construction", description: "Dust, debris, and residue removal after renovations. We make your newly built or remodeled space move-in ready.", icon: Drop, price: "From $399" },
  { title: "Recurring Service", description: "Weekly, bi-weekly, or monthly plans with consistent teams. The more often we come, the less each visit costs.", icon: CalendarCheck, price: "From $119/visit" },
];

const processSteps = [
  { step: "01", title: "Free Estimate", description: "Tell us about your space — size, rooms, and any special requests. Get an instant quote online or by phone.", icon: CurrencyDollar, time: "2 min" },
  { step: "02", title: "Customize", description: "Choose your cleaning level, add-ons, and preferred schedule. We match you with the perfect team.", icon: CheckCircle, time: "Pick your plan" },
  { step: "03", title: "We Clean", description: "Our trained, background-checked team arrives on time with everything needed. You relax.", icon: Sparkle, time: "2-4 hours" },
  { step: "04", title: "Walk-Through", description: "Final inspection together. If anything is not perfect, we re-clean it on the spot. 100% satisfaction guaranteed.", icon: SealCheck, time: "Done" },
];

const guarantees = [
  { icon: ShieldCheck, text: "Bonded & Insured — $2M coverage" },
  { icon: SealCheck, text: "Background-checked teams" },
  { icon: Leaf, text: "100% eco-friendly products" },
  { icon: Heart, text: "200% satisfaction guarantee" },
  { icon: Timer, text: "On-time, every time" },
  { icon: Recycle, text: "Zero-waste cleaning supplies" },
  { icon: Users, text: "Same team every visit" },
  { icon: Lightning, text: "Same-day availability" },
];

const testimonials = [
  {
    name: "Amanda R.",
    text: "Crystal Clean has been cleaning our home bi-weekly for 2 years. They are consistent, thorough, and trustworthy. I gave them a key and never worried once.",
    rating: 5,
    rooms: ["Kitchen", "3 Bathrooms", "Living Areas", "Master Bedroom"],
    service: "Bi-Weekly Residential",
  },
  {
    name: "Tom & Lisa H.",
    text: "We hired them for our move-out clean and got our FULL $2,400 deposit back. The landlord said it was the cleanest unit they had ever seen returned. Worth every penny.",
    rating: 5,
    rooms: ["Full Apartment", "Appliance Interiors", "Window Tracks", "Closets"],
    service: "Move-Out Deep Clean",
  },
  {
    name: "Dr. Sarah K.",
    text: "They clean our dental office 5 nights a week. Professional, reliable, and the eco-friendly products are a must for us. Patients always comment on how clean the office looks.",
    rating: 5,
    rooms: ["Waiting Room", "Exam Rooms", "Restrooms", "Reception"],
    service: "Commercial — 5x Weekly",
  },
  {
    name: "Marcus J.",
    text: "Post-construction cleaning after our kitchen remodel. They got sawdust out of places I did not even know sawdust could reach. Three of my neighbors have hired them since.",
    rating: 5,
    rooms: ["Kitchen", "Adjacent Rooms", "Ductwork Areas", "All Surfaces"],
    service: "Post-Construction",
  },
];

const pricingTiers = [
  { name: "Essential", price: 149, frequency: "per visit", description: "Standard cleaning for maintained homes", features: ["All rooms dusted & vacuumed", "Bathrooms sanitized", "Kitchen surfaces cleaned", "Floors mopped", "Trash removed"], popular: false },
  { name: "Premium", price: 249, frequency: "per visit", description: "Deep attention to every detail", features: ["Everything in Essential", "Inside microwave & oven", "Baseboards & light fixtures", "Window sills & tracks", "Cabinet front wipe-down", "Detailed bathroom scrub"], popular: true },
  { name: "Luxury", price: 399, frequency: "per visit", description: "White-glove comprehensive service", features: ["Everything in Premium", "Inside fridge & freezer", "Inside all cabinets", "Wall spot cleaning", "Laundry wash & fold", "Interior windows", "Organizing service"], popular: false },
];

const faqs = [
  { q: "What products do you use?", a: "We use 100% plant-based, EPA Safer Choice certified cleaning products. They are tough on grime but safe for kids, pets, and the environment. We can also accommodate specific product requests." },
  { q: "Do I need to be home?", a: "Not at all. Many of our clients give us a key or garage code. We are fully bonded and insured with $2M coverage, and every team member passes a thorough background check." },
  { q: "How long does a cleaning take?", a: "A standard 3-bedroom home takes 2-3 hours with our team of 2. Deep cleans may take 3-4 hours. Move-out cleans for larger homes can take a full day." },
  { q: "Can I customize my cleaning?", a: "Absolutely. Use our online estimator or tell us exactly what you need. We can focus on specific rooms, add extras like interior windows or organizing, and skip areas you handle yourself." },
  { q: "What if I am not satisfied?", a: "We offer a 200% satisfaction guarantee. If anything is not right, we re-clean it free. If you are still not happy, we refund your cleaning AND send a competitor to clean for free on us. We are that confident." },
  { q: "How do recurring discounts work?", a: "Weekly service gets 20% off, bi-weekly gets 15% off, monthly gets 10% off. The more frequently we clean, the less time each visit takes, and we pass those savings to you." },
];

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════ */
export default function V2CleaningPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden" style={{ background: BG, color: "#f1f5f9" }}>
      <FloatingBubbles />

      {/* ─── NAV ─── */}
      <motion.nav initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-4">
          <GlassCard className="flex items-center justify-between px-4 md:px-6 py-3">
            <div className="flex items-center gap-2">
              <Sparkle size={24} weight="duotone" style={{ color: BLUE_LIGHT }} />
              <span className="text-lg font-bold tracking-tight text-white">Crystal Clean Co.</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
              <a href="#services" className="hover:text-white transition-colors">Services</a>
              <a href="#estimate" className="hover:text-white transition-colors">Estimate</a>
              <a href="#process" className="hover:text-white transition-colors">Process</a>
              <a href="#reviews" className="hover:text-white transition-colors">Reviews</a>
              <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
              <a href="#contact" className="hover:text-white transition-colors">Contact</a>
            </div>
            <div className="flex items-center gap-3">
              <MagneticButton className="px-4 md:px-5 py-2 rounded-full text-sm font-semibold text-white cursor-pointer" style={{ background: BLUE } as React.CSSProperties}>
                Free Estimate
              </MagneticButton>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors cursor-pointer">
                {mobileMenuOpen ? <X size={24} /> : <List size={24} />}
              </button>
            </div>
          </GlassCard>

          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3, ease: "easeInOut" }} className="md:hidden mt-2 overflow-hidden">
                <GlassCard className="flex flex-col gap-1 px-4 py-4">
                  {[{ label: "Services", href: "#services" }, { label: "Estimate", href: "#estimate" }, { label: "Process", href: "#process" }, { label: "Reviews", href: "#reviews" }, { label: "Pricing", href: "#pricing" }, { label: "Contact", href: "#contact" }].map((link) => (
                    <a key={link.label} href={link.href} onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors">
                      {link.label}
                    </a>
                  ))}
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.nav>

      {/* ═══ HERO — Rotating Room Cards ═══ */}
      <section className="relative min-h-[100dvh] flex items-center pt-24 z-10">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full opacity-15" style={{ background: `radial-gradient(circle, ${BLUE} 0%, transparent 70%)`, filter: "blur(80px)" }} />
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full opacity-10" style={{ background: `radial-gradient(circle, ${MINT} 0%, transparent 70%)`, filter: "blur(60px)" }} />
        </div>

        <div className="mx-auto max-w-7xl px-4 md:px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          <div className="space-y-8">
            <div>
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ ...spring, delay: 0.1 }} className="flex items-center gap-3 mb-4">
                <span className="text-sm uppercase tracking-widest" style={{ color: MINT }}>Eco-Friendly</span>
                <span className="w-8 h-px" style={{ background: MINT }} />
                <span className="text-sm uppercase tracking-widest" style={{ color: MINT }}>Spotless Results</span>
              </motion.div>
              <h1 className="text-3xl md:text-6xl tracking-tighter leading-none font-bold text-white" style={{ textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>
                <WordReveal text="A Cleaner Home, A Better Life" />
              </h1>
            </div>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.6 }} className="text-lg text-slate-400 max-w-md leading-relaxed">
              Professional house cleaning that gives you back your weekends. Eco-friendly products, background-checked teams, and a 200% satisfaction guarantee.
            </motion.p>

            {/* Trust badges */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.7 }} className="flex flex-wrap gap-3">
              {[
                { icon: Leaf, text: "100% Eco-Friendly" },
                { icon: ShieldCheck, text: "Bonded & Insured" },
                { icon: SealCheck, text: "Background Checked" },
                { icon: Lightning, text: "Same-Day Available" },
              ].map((badge, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/15 bg-white/[0.08]">
                  <badge.icon size={14} weight="duotone" style={{ color: MINT }} />
                  <span className="text-xs text-slate-400">{badge.text}</span>
                </div>
              ))}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.8 }} className="flex flex-wrap gap-4">
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white flex items-center gap-2 cursor-pointer" style={{ background: BLUE } as React.CSSProperties}>
                Get Free Estimate <ArrowRight size={18} weight="bold" />
              </MagneticButton>
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/15 flex items-center gap-2 cursor-pointer">
                <Phone size={18} weight="duotone" /> <a href="tel:+12068349275">(206) 834-9275</a>
              </MagneticButton>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ ...spring, delay: 1 }} className="flex flex-wrap gap-6 text-sm text-slate-400">
              <a href="https://maps.google.com/?q=Crystal+Clean+Co+Seattle+WA" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-white transition-colors">
                <MapPin size={16} weight="duotone" style={{ color: BLUE_LIGHT }} />Serving Greater Seattle
              </a>
              <span className="flex items-center gap-2"><Clock size={16} weight="duotone" style={{ color: BLUE_LIGHT }} />7 Days a Week, 7am-8pm</span>
            </motion.div>
          </div>

          {/* Right side — rotating room cards */}
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ ...spring, delay: 0.3 }} className="hidden md:block">
            <RotatingRoomCards />
          </motion.div>
        </div>
      </section>

      {/* ═══ STATS BAR ═══ */}
      <SectionReveal className="relative z-10 pb-8">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <GlassCard className="p-6 md:p-8">
            <motion.div className="grid grid-cols-2 sm:grid-cols-4 gap-6 md:gap-8" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
              {[
                { value: "2,500+", label: "Homes Cleaned", icon: House },
                { value: "4.9", label: "Google Rating", icon: Star },
                { value: "200%", label: "Satisfaction Guarantee", icon: Heart },
                { value: "12+", label: "Years in Business", icon: Trophy },
              ].map((stat, i) => (
                <motion.div key={i} variants={fadeUp} className="text-center">
                  <stat.icon size={24} weight="duotone" style={{ color: BLUE_LIGHT }} className="mx-auto mb-2" />
                  <div className="text-2xl md:text-3xl font-bold text-white">{stat.value}</div>
                  <div className="text-xs text-slate-400 mt-1">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </GlassCard>
        </div>
      </SectionReveal>

      {/* ═══ SERVICES ═══ */}
      <SectionReveal id="services" className="relative z-10 py-16 md:py-24">
        <div className="absolute inset-0 pointer-events-none opacity-5">
          <svg width="100%" height="100%"><pattern id="clean-grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke={BLUE_LIGHT} strokeWidth="0.5" /></pattern><rect width="100%" height="100%" fill="url(#clean-grid)" /></svg>
        </div>
        <div className="mx-auto max-w-7xl px-4 md:px-6 relative">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: MINT }}>Our Services</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Every Space, Spotless" />
            </h2>
          </div>
          <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {services.map((svc, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="p-6 h-full flex flex-col group hover:border-sky-500/30 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: i % 2 === 0 ? BLUE_GLOW : MINT_GLOW }}>
                      <svc.icon size={24} weight="duotone" style={{ color: i % 2 === 0 ? BLUE_LIGHT : MINT }} />
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ background: `${BLUE}22`, color: BLUE_LIGHT }}>{svc.price}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{svc.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed flex-1">{svc.description}</p>
                  <div className="mt-4 pt-4 border-t border-white/8">
                    <span className="text-xs font-medium flex items-center gap-1 cursor-pointer group-hover:gap-2 transition-all" style={{ color: BLUE_LIGHT }}>
                      Book Now <CaretRight size={12} weight="bold" />
                    </span>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ═══ ABOUT + ECO ═══ */}
      <SectionReveal id="about" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-sm uppercase tracking-widest mb-3" style={{ color: MINT }}>About Crystal Clean</p>
              <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white mb-6">
                <WordReveal text="Clean Homes, Clean Conscience" />
              </h2>
              <div className="space-y-4 text-slate-400 leading-relaxed">
                <p>Founded in 2012 by Maria Santos, Crystal Clean Co. started with one van and a commitment to doing things differently — no harsh chemicals, no cutting corners, no strangers in your home without a thorough background check.</p>
                <p>Today we are Seattle&apos;s top-rated cleaning service with over 2,500 homes served. Every product we use is EPA Safer Choice certified. Every team member is vetted, trained, and part of our family. Your home deserves that.</p>
              </div>
              <div className="mt-8">
                <p className="text-xs uppercase tracking-widest mb-4" style={{ color: MINT }}>Our Eco Commitment</p>
                <EcoCommitment />
              </div>
            </div>
            <div className="relative rounded-2xl overflow-hidden aspect-[4/3]">
              <img src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=80" alt="Professional cleaning team" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <GlassCard className="px-4 py-3 inline-flex items-center gap-3">
                  <Leaf size={20} weight="duotone" style={{ color: MINT }} />
                  <span className="text-sm text-white font-medium">Maria Santos — Founder & CEO</span>
                </GlassCard>
              </div>
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* ═══ INSTANT ESTIMATE CALCULATOR ═══ */}
      <SectionReveal id="estimate" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <p className="text-sm uppercase tracking-widest mb-3" style={{ color: MINT }}>Get Your Price</p>
              <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white mb-6">
                <WordReveal text="Instant Online Estimate" />
              </h2>
              <p className="text-slate-400 leading-relaxed mb-8">No hidden fees. No surprises. Customize your cleaning plan and see your price before you book. Recurring customers save up to 20%.</p>
              <div className="space-y-3">
                {[
                  "Transparent, upfront pricing",
                  "No contracts — cancel anytime",
                  "Recurring discounts: 10-20% off",
                  "All supplies and equipment included",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle size={18} weight="duotone" style={{ color: MINT }} />
                    <span className="text-sm text-slate-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <EstimateCalculator />
          </div>
        </div>
      </SectionReveal>

      {/* ═══ GUARANTEES ═══ */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: MINT }}>Our Promise</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="The Crystal Clean Guarantee" />
            </h2>
          </div>
          <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {guarantees.map((g, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="p-5 flex items-center gap-3">
                  <g.icon size={22} weight="duotone" style={{ color: MINT }} className="shrink-0" />
                  <span className="text-sm text-slate-300">{g.text}</span>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ═══ PROCESS ═══ */}
      <SectionReveal id="process" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: MINT }}>How It Works</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Simple as 1-2-3-4" />
            </h2>
          </div>
          <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {processSteps.map((step, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="p-6 h-full relative overflow-hidden">
                  <div className="absolute top-4 right-4 text-5xl font-black opacity-5 text-white">{step.step}</div>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: i % 2 === 0 ? BLUE_GLOW : MINT_GLOW }}>
                    <step.icon size={24} weight="duotone" style={{ color: i % 2 === 0 ? BLUE_LIGHT : MINT }} />
                  </div>
                  <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: MINT }}>{step.step}</div>
                  <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{step.description}</p>
                  <div className="mt-3">
                    <span className="text-xs px-2 py-1 rounded-lg" style={{ background: `${BLUE}22`, color: BLUE_LIGHT }}>{step.time}</span>
                  </div>
                  {i < processSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-6 z-10">
                      <ArrowRight size={20} style={{ color: BLUE_LIGHT }} className="opacity-40" />
                    </div>
                  )}
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ═══ TESTIMONIALS — Checklist-Style Reviews ═══ */}
      <SectionReveal id="reviews" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/15 bg-white/[0.08] mb-6">
              <Star size={16} weight="fill" style={{ color: BLUE_LIGHT }} />
              <span className="text-sm text-white font-medium">4.9</span>
              <span className="text-xs text-slate-400">from 420+ Google Reviews</span>
            </div>
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: MINT }}>Happy Clients</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Spotless Reviews" />
            </h2>
          </div>

          <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {testimonials.map((t, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="p-6 h-full">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ background: BLUE }}>
                        {t.name.charAt(0)}
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-white block">{t.name}</span>
                        <span className="text-xs" style={{ color: MINT }}>{t.service}</span>
                      </div>
                    </div>
                    <div className="flex gap-0.5">
                      {Array.from({ length: t.rating }).map((_, j) => (
                        <Star key={j} size={12} weight="fill" style={{ color: BLUE_LIGHT }} />
                      ))}
                    </div>
                  </div>
                  <Quotes size={20} weight="fill" style={{ color: BLUE_LIGHT }} className="mb-2 opacity-30" />
                  <p className="text-sm text-slate-300 leading-relaxed mb-4">{t.text}</p>
                  <div className="border-t border-white/8 pt-3">
                    <p className="text-xs uppercase tracking-widest mb-2" style={{ color: MINT }}>Rooms Cleaned</p>
                    <div className="flex flex-wrap gap-2">
                      {t.rooms.map((room) => (
                        <span key={room} className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border" style={{ borderColor: `${BLUE}33`, color: BLUE_LIGHT, background: `${BLUE}11` }}>
                          <Check size={10} weight="bold" /> {room}
                        </span>
                      ))}
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ═══ PRICING TIERS ═══ */}
      <SectionReveal id="pricing" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: MINT }}>Transparent Pricing</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Choose Your Clean" />
            </h2>
            <p className="text-slate-400 mt-4 max-w-md mx-auto">3-bedroom home pricing shown. Recurring customers save 10-20% per visit.</p>
          </div>
          <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {pricingTiers.map((tier, i) => (
              <motion.div key={i} variants={fadeUp} className="h-full">
                {tier.popular ? (
                  <ShimmerBorder className="h-full">
                    <div className="p-6 md:p-8 h-full flex flex-col">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-white">{tier.name}</h3>
                        <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ background: `${MINT}22`, color: MINT }}>Most Popular</span>
                      </div>
                      <p className="text-sm text-slate-400 mb-4">{tier.description}</p>
                      <div className="mb-6">
                        <span className="text-4xl font-black" style={{ color: BLUE_LIGHT }}>${tier.price}</span>
                        <span className="text-sm text-slate-500 ml-1">{tier.frequency}</span>
                      </div>
                      <ul className="space-y-3 flex-1">
                        {tier.features.map((f) => (
                          <li key={f} className="flex items-start gap-2 text-sm text-slate-300">
                            <CheckCircle size={16} weight="fill" style={{ color: MINT }} className="mt-0.5 shrink-0" />
                            {f}
                          </li>
                        ))}
                      </ul>
                      <MagneticButton className="w-full mt-6 py-3 rounded-xl text-sm font-semibold text-white cursor-pointer" style={{ background: BLUE } as React.CSSProperties}>
                        Book Premium Clean
                      </MagneticButton>
                    </div>
                  </ShimmerBorder>
                ) : (
                  <GlassCard className="p-6 md:p-8 h-full flex flex-col">
                    <h3 className="text-xl font-bold text-white mb-1">{tier.name}</h3>
                    <p className="text-sm text-slate-400 mb-4">{tier.description}</p>
                    <div className="mb-6">
                      <span className="text-4xl font-black text-white">${tier.price}</span>
                      <span className="text-sm text-slate-500 ml-1">{tier.frequency}</span>
                    </div>
                    <ul className="space-y-3 flex-1">
                      {tier.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-sm text-slate-300">
                          <CheckCircle size={16} weight="duotone" style={{ color: BLUE_LIGHT }} className="mt-0.5 shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <MagneticButton className="w-full mt-6 py-3 rounded-xl text-sm font-semibold text-white border border-white/15 cursor-pointer">
                      Book {tier.name}
                    </MagneticButton>
                  </GlassCard>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ═══ CTA BANNER ═══ */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="rounded-2xl p-8 md:p-12 text-center relative overflow-hidden" style={{ background: BLUE }}>
            <div className="absolute inset-0 opacity-10">
              <svg width="100%" height="100%"><pattern id="cta-dots-c" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1.5" fill="white" /></pattern><rect width="100%" height="100%" fill="url(#cta-dots-c)" /></svg>
            </div>
            <div className="relative z-10">
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">Your Cleanest Home Ever Awaits</h3>
              <p className="text-white/80 mb-6 max-w-md mx-auto">First-time customers get 20% off their initial cleaning. No contracts, cancel anytime.</p>
              <div className="flex flex-wrap justify-center gap-4">
                <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold bg-white flex items-center gap-2 cursor-pointer" style={{ color: BLUE }}>
                  Book Your First Clean <ArrowRight size={18} weight="bold" />
                </MagneticButton>
                <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white border-2 border-white/30 flex items-center gap-2 cursor-pointer">
                  <Phone size={18} weight="duotone" /> (206) 834-9275
                </MagneticButton>
              </div>
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* ═══ FAQ ═══ */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: MINT }}>Questions?</p>
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

      {/* ═══ SERVICE AREA ═══ */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: MINT }}>Coverage Area</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Serving Greater Seattle" />
            </h2>
          </div>
          <motion.div className="flex flex-wrap justify-center gap-3" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
            {["Capitol Hill", "Ballard", "Fremont", "Queen Anne", "Wallingford", "Green Lake", "Ravenna", "University District", "Beacon Hill", "Columbia City", "West Seattle", "Magnolia", "Bellevue", "Kirkland", "Redmond"].map((area) => (
              <motion.div key={area} variants={fadeUp}>
                <div className="px-4 py-2 rounded-full border border-white/15 bg-white/[0.08] text-sm text-slate-400 flex items-center gap-2">
                  <MapPin size={14} weight="duotone" style={{ color: BLUE_LIGHT }} />
                  {area}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ═══ CONTACT ═══ */}
      <SectionReveal id="contact" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <p className="text-sm uppercase tracking-widest mb-3" style={{ color: MINT }}>Let&apos;s Talk</p>
              <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white mb-6">
                <WordReveal text="Get Your Free Estimate" />
              </h2>
              <p className="text-slate-400 leading-relaxed max-w-md mb-8">
                Ready for a cleaner home? Reach out for a free, no-obligation estimate. We respond within 1 hour during business hours.
              </p>
              <div className="space-y-4">
                {[
                  { icon: Phone, label: "Phone", value: "(206) 834-9275", href: "tel:+12068349275" },
                  { icon: MapPin, label: "Service Area", value: "Greater Seattle & Eastside", href: "https://maps.google.com/?q=Seattle+WA" },
                  { icon: Clock, label: "Hours", value: "7 Days a Week\n7:00 AM - 8:00 PM" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <item.icon size={20} weight="duotone" style={{ color: BLUE_LIGHT }} className="mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-white">{item.label}</p>
                      {item.href ? (
                        <a href={item.href} target={item.href.startsWith("https") ? "_blank" : undefined} rel="noopener noreferrer" className="text-sm text-slate-400 whitespace-pre-line hover:text-white transition-colors">{item.value}</a>
                      ) : (
                        <p className="text-sm text-slate-400 whitespace-pre-line">{item.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <GlassCard className="p-6 md:p-8">
              <h3 className="text-xl font-semibold text-white mb-6">Request a Quote</h3>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input type="text" placeholder="First Name" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500/50" />
                  <input type="text" placeholder="Last Name" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500/50" />
                </div>
                <input type="email" placeholder="Email Address" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500/50" />
                <input type="tel" placeholder="Phone Number" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500/50" />
                <select className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-slate-500 text-sm focus:outline-none focus:border-sky-500/50">
                  <option value="">Select Service</option>
                  {services.map((s, i) => (<option key={i} value={s.title}>{s.title}</option>))}
                </select>
                <textarea placeholder="Tell us about your space (bedrooms, bathrooms, special requests)..." rows={4} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500/50 resize-none" />
                <MagneticButton className="w-full py-3 rounded-xl text-sm font-semibold text-white cursor-pointer" style={{ background: BLUE } as React.CSSProperties}>
                  <span className="flex items-center justify-center gap-2"><CalendarCheck size={18} weight="duotone" /> Get Free Quote</span>
                </MagneticButton>
              </form>
            </GlassCard>
          </div>
        </div>
      </SectionReveal>

      {/* ═══ FINAL CTA ═══ */}
      <SectionReveal className="relative z-10 py-8 pb-16">
        <div className="mx-auto max-w-3xl px-4 md:px-6">
          <ShimmerBorder>
            <div className="p-6 md:p-8 text-center">
              <h3 className="text-xl font-bold text-white mb-2">200% Satisfaction Guarantee</h3>
              <p className="text-sm text-slate-400 mb-4">Not happy? We re-clean for free. Still not happy? Full refund AND a free clean from a competitor. We are that confident.</p>
              <MagneticButton className="px-8 py-3 rounded-full text-sm font-semibold text-white inline-flex items-center gap-2 cursor-pointer" style={{ background: BLUE } as React.CSSProperties}>
                Book Risk-Free <ArrowRight size={14} weight="bold" />
              </MagneticButton>
            </div>
          </ShimmerBorder>
        </div>
      </SectionReveal>

      {/* ═══ FOOTER ═══ */}
      <footer className="relative z-10 border-t border-white/8 py-12">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Sparkle size={24} weight="duotone" style={{ color: BLUE_LIGHT }} />
                <span className="text-lg font-bold text-white">Crystal Clean Co.</span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed max-w-sm">Seattle&apos;s top-rated eco-friendly cleaning service. Serving homes and businesses since 2012 with plant-based products and background-checked teams.</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-3">Quick Links</h4>
              <div className="space-y-2 text-sm text-slate-400">
                <a href="#services" className="block hover:text-white transition-colors">Services</a>
                <a href="#estimate" className="block hover:text-white transition-colors">Estimate</a>
                <a href="#pricing" className="block hover:text-white transition-colors">Pricing</a>
                <a href="#reviews" className="block hover:text-white transition-colors">Reviews</a>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-3">Contact</h4>
              <div className="space-y-2 text-sm text-slate-400">
                <a href="tel:+12068349275" className="block hover:text-white transition-colors">(206) 834-9275</a>
                <p>Serving Greater Seattle</p>
                <p>7 days a week, 7am-8pm</p>
              </div>
            </div>
          </div>
          <div className="border-t border-white/8 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-500">Crystal Clean Co. &copy; {new Date().getFullYear()}. All rights reserved.</p>
            <p className="text-xs text-slate-600 flex items-center gap-1.5"><svg width="14" height="14" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-sky-500"><path d="M24.3 4.2c-1.5-.4-3.2.1-4.5 1.1-1-.7-2.3-1-3.5-.8-2.4.4-4.2 2.5-4.2 4.9v.6c-3.2.8-6 2.8-7.8 5.6-.3.5-.1 1.1.4 1.4.5.3 1.1.1 1.4-.4 1.5-2.3 3.7-4 6.3-4.7.5-.1 1-.1 1.5 0 .8.2 1.4.8 1.7 1.5.3.8.2 1.6-.2 2.3l-2.8 4.3c-.6.9-.4 2.1.4 2.8l2.5 2.1c.4.3.8.5 1.3.5h5.2c.5 0 1-.2 1.3-.5l1.2-1c.6-.5.8-1.3.6-2l-1-3.2c-.2-.5 0-1.1.4-1.4l3.8-2.5c1.3-.9 2.1-2.3 2.1-3.9V9.6c0-2.5-1.7-4.7-4.1-5.3v-.1z" fill="currentColor"/></svg>Created by <a href="https://bluejayportfolio.com" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "underline" }}>bluejayportfolio.com</a></p>
          </div>
        </div>
      </footer>
    </main>
  );
}
