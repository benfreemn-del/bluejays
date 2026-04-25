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
  ShieldCheck,
  CaretDown,
  Phone,
  MapPin,
  Clock,
  ArrowRight,
  Quotes,
  X,
  List,
  Truck,
  Recycle,
  Trash,
  House,
  Buildings,
  TreeEvergreen,
  CalendarCheck,
  Timer,
  CheckCircle,
  Package,
  Leaf,
  Lightning,
  Desktop,
  Bathtub,
  Envelope,
  Medal,
  Certificate,
  Broom,
  Gauge,
  HandHeart,
  ArrowsClockwise,
  Question,
  UsersThree,
  Heart,
  Globe,
  Warning,
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
const BG = "#111827";
const ACCENT = "#22c55e";
const ACCENT_LIGHT = "#86efac";
const ACCENT_GLOW = "rgba(34, 197, 94, 0.15)";
const AMBER = "#f59e0b";
const AMBER_GLOW = "rgba(245, 158, 11, 0.15)";

/* ───────────────────────── TRUCK NAV ICON ───────────────────────── */
function TruckIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect x="3" y="10" width="18" height="12" rx="2" stroke={ACCENT} strokeWidth="2" />
      <path d="M21 14H26L29 18V22H21V14Z" stroke={ACCENT_LIGHT} strokeWidth="2" strokeLinejoin="round" />
      <circle cx="9" cy="24" r="2.5" fill={ACCENT} />
      <circle cx="25" cy="24" r="2.5" fill={ACCENT} />
      <path d="M7 14H17" stroke={ACCENT_LIGHT} strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}

/* ───────────────────────── RECYCLING ARROW PATTERN ───────────────────────── */
function RecyclePattern() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden hidden md:block opacity-[0.03]">
      <svg width="100%" height="100%">
        <defs>
          <pattern id="recycle-grid" width="80" height="80" patternUnits="userSpaceOnUse">
            <path d="M40 10 L55 30 L45 30 L45 50 L35 50 L35 30 L25 30 Z" fill="none" stroke={ACCENT_LIGHT} strokeWidth="0.5" />
            <circle cx="40" cy="60" r="8" fill="none" stroke={ACCENT_LIGHT} strokeWidth="0.3" />
            <path d="M36 60 L40 56 L44 60 L40 64 Z" fill="none" stroke={ACCENT_LIGHT} strokeWidth="0.3" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#recycle-grid)" />
      </svg>
    </div>
  );
}

/* ───────────────────────── FLOATING LEAF PARTICLES ───────────────────────── */
function FloatingParticles() {
  const particles = Array.from({ length: 22 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 10,
    duration: 8 + Math.random() * 6,
    size: 1.5 + Math.random() * 2.5,
    opacity: 0.06 + Math.random() * 0.15,
  }));

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden hidden md:block">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{ left: `${p.x}%`, width: p.size, height: p.size, background: ACCENT_LIGHT, willChange: "transform, opacity" }}
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

/* ───────────────────────── SHARED COMPONENTS ───────────────────────── */
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
  return (<div className={`rounded-2xl border border-white/15 bg-white/[0.08] backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] ${className}`}>{children}</div>);
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
      <motion.div className="absolute inset-0 rounded-2xl" style={{ background: `conic-gradient(from 0deg, transparent, ${ACCENT}, transparent, ${AMBER}, transparent)`, willChange: "transform" }} animate={{ rotate: [0, 360] }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} />
      <div className="relative rounded-2xl z-10" style={{ background: BG }}>{children}</div>
    </div>
  );
}

/* ───────────────────────── DATA ───────────────────────── */
const haulItems = [
  { title: "Furniture", desc: "Couches, tables, mattresses, dressers, desks, chairs, bookshelves", icon: House },
  { title: "Appliances", desc: "Refrigerators, washers, dryers, dishwashers, microwaves, water heaters", icon: Lightning },
  { title: "Construction Debris", desc: "Drywall, lumber, concrete, roofing shingles, renovation waste", icon: Trash },
  { title: "Yard Waste", desc: "Branches, stumps, soil, old fencing, sod, landscape debris", icon: TreeEvergreen },
  { title: "Electronics", desc: "TVs, monitors, computers, printers, stereos, gaming consoles", icon: Desktop },
  { title: "Hot Tubs & Spas", desc: "Full disassembly and removal, decking cleanup included", icon: Bathtub },
  { title: "Office Cleanouts", desc: "Cubicles, filing cabinets, old equipment, warehouse debris", icon: Buildings },
  { title: "Estate Cleanouts", desc: "Compassionate whole-home clearing, donation sorting included", icon: Package },
];

const testimonials = [
  { name: "Jennifer Huang", text: "Called at 8 AM, Marcus and his crew were at my door by 10. They cleared out a two-car garage packed floor to ceiling in under 90 minutes. The quote was spot-on. No surprises, no haggling.", rating: 5, role: "Homeowner, Capitol Hill" },
  { name: "Robert & Susan Tran", text: "We hired CleanSlate for our father's estate cleanout. Marcus personally walked through the home with us, separated sentimental items, and donated everything usable. Made a devastating process feel manageable.", rating: 5, role: "Estate Cleanout, Beacon Hill" },
  { name: "David Kowalski", text: "As a general contractor, I need reliable debris hauling. CleanSlate shows up on time every time, handles everything in one trip, and their per-truck pricing saves me money versus a dumpster rental. Best in Seattle.", rating: 5, role: "GC, South Seattle" },
  { name: "Maria Gonzalez", text: "I had an old hot tub that three other companies refused to touch. Marcus quoted it over the phone, his crew dismantled it in 45 minutes, and they even swept the deck after. Worth every penny of the $399.", rating: 5, role: "Homeowner, West Seattle" },
  { name: "Tom Ainsworth", text: "The donation tracking is what sets them apart. I got a detailed receipt showing exactly which items went to Goodwill and which were recycled. As someone who cares about the environment, that transparency means everything.", rating: 5, role: "Homeowner, Ballard" },
];

const comparisonRows = [
  { feature: "Heavy Lifting Handled", us: true, them: false, usText: "We handle everything", themText: "You load it yourself" },
  { feature: "Same-Day Pickup", us: true, them: false, usText: "Call before noon", themText: "3-7 day delivery" },
  { feature: "Eco-Friendly Disposal", us: true, them: false, usText: "60% donated, 30% recycled", themText: "All goes to landfill" },
  { feature: "Upfront Flat Pricing", us: true, them: false, usText: "Quote before we start", themText: "Hidden overage fees" },
  { feature: "No Permit Needed", us: true, them: false, usText: "We bring our truck", themText: "Street permit required" },
  { feature: "Cleanup Included", us: true, them: false, usText: "We sweep behind us", themText: "Debris left behind" },
  { feature: "Done in Under an Hour", us: true, them: false, usText: "Average job: 45 min", themText: "Sits for 5-10 days" },
];

const serviceAreas = [
  "Capitol Hill", "Beacon Hill", "West Seattle", "Ballard",
  "Fremont", "Georgetown", "SoDo", "Columbia City",
  "Rainier Valley", "Green Lake", "Wallingford", "University District",
];

const faqData = [
  { q: "How does pricing work?", a: "We price by truck volume, not weight or item count. Our crew gives you an exact quote on-site before any work begins. That price is locked in. No hidden fees, no overages, no surprises. If you don't like the quote, you pay nothing." },
  { q: "What happens to my stuff after you take it?", a: "Everything is sorted by hand. 60% of items go to local charities like Goodwill and Habitat for Humanity ReStore. 30% goes to certified recycling facilities. Only 10% — true waste — goes to the landfill. We provide a donation receipt for your records." },
  { q: "Do I need to be home during the removal?", a: "Not necessarily. As long as we can access the items and you've approved the quote, we can complete the job. We send before-and-after photos when we're done so you can see the results even if you're at work." },
  { q: "Can you handle hazardous materials?", a: "We cannot haul hazardous waste like paint, chemicals, or asbestos. However, we partner with licensed hazardous waste services in King County and can refer you. We handle everything else on the same trip." },
  { q: "How quickly can you come out?", a: "Same-day service is available when you call before noon. Next-day appointments are almost always open. For large estate or commercial cleanouts, we recommend booking 2-3 days ahead so we can bring the right crew size." },
  { q: "Is there anything you won't take?", a: "Beyond hazardous waste, we also can't haul cars (but can refer a tow service), medical waste, or anything requiring specialized contamination cleanup. Basically if it fits in a truck and isn't toxic, we'll take it." },
];

const quizOptions = [
  { label: "A few items (couch, mattress, appliances)", level: "light", color: ACCENT, recommendation: "1/4 Truck Load — $149", icon: Package },
  { label: "A room or garage full of stuff", level: "medium", color: AMBER, recommendation: "1/2 Truck Load — $249", icon: House },
  { label: "Full property / estate cleanout", level: "heavy", color: "#ef4444", recommendation: "Full Truck Load — $399", icon: Buildings },
];

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════ */
export default function V2JunkRemovalPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [wipeComplete, setWipeComplete] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setWipeComplete(true), 1800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden" style={{ background: BG, color: "#f1f5f9" }}>
      <RecyclePattern />
      <FloatingParticles />

      {/* ─── NAV ─── */}
      <motion.nav initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-4">
          <GlassCard className="flex items-center justify-between px-4 md:px-6 py-3">
            <div className="flex items-center gap-2">
              <TruckIcon size={24} />
              <span className="text-lg font-bold tracking-tight text-white">CleanSlate</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
              <a href="#services" className="hover:text-white transition-colors">Services</a>
              <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
              <a href="#eco" className="hover:text-white transition-colors">Eco Impact</a>
              <a href="#about" className="hover:text-white transition-colors">About</a>
              <a href="#reviews" className="hover:text-white transition-colors">Reviews</a>
            </div>
            <div className="flex items-center gap-3">
              <MagneticButton className="px-4 md:px-5 py-2 rounded-full text-sm font-semibold text-white transition-colors" style={{ background: ACCENT } as React.CSSProperties}>
                Book a Pickup
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
                  {[{ label: "Services", href: "#services" }, { label: "Pricing", href: "#pricing" }, { label: "Eco Impact", href: "#eco" }, { label: "About", href: "#about" }, { label: "Reviews", href: "#reviews" }].map((link) => (
                    <a key={link.label} href={link.href} onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors">{link.label}</a>
                  ))}
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.nav>

      {/* ─── 1. HERO — BEFORE/AFTER SPLIT WIPE ─── */}
      <section className="relative min-h-[100dvh] flex items-center pt-24 z-10 overflow-hidden">
        {/* BEFORE side — cluttered garage */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=1600&q=80"
            alt="Cluttered garage before cleanup"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${BG}ee 0%, ${BG}cc 50%, ${BG}99 100%)` }} />
        </div>

        {/* AFTER side — clean space revealed via CSS wipe */}
        <motion.div
          className="absolute inset-0 z-[1] overflow-hidden"
          initial={{ clipPath: "inset(0 100% 0 0)" }}
          animate={{ clipPath: "inset(0 0% 0 0)" }}
          transition={{ duration: 1.6, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <img
            src="https://images.unsplash.com/photo-1592595896551-12b371d546d5?w=1600&q=80"
            alt="Tidy front yard after junk removal"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${BG}dd 0%, ${BG}bb 50%, ${BG}88 100%)` }} />
        </motion.div>

        {/* The clip-path on the AFTER image already produces the swoosh
            reveal — a separate vertical wipe-line indicator on top of it
            doubled the green flash and read as two animations. Removed. */}

        {/* Before/After labels */}
        <motion.div
          className="absolute top-32 left-6 md:left-12 z-[3] hidden md:block"
          initial={{ opacity: 0 }}
          animate={{ opacity: wipeComplete ? 0 : 0.6 }}
          transition={{ duration: 0.5 }}
        >
          <span className="text-xs uppercase tracking-widest text-red-400 font-bold bg-black/40 px-3 py-1 rounded-full">Before</span>
        </motion.div>
        <motion.div
          className="absolute top-32 right-6 md:right-12 z-[3] hidden md:block"
          initial={{ opacity: 0 }}
          animate={{ opacity: wipeComplete ? 0.6 : 0 }}
          transition={{ duration: 0.5, delay: 2 }}
        >
          <span className="text-xs uppercase tracking-widest font-bold bg-black/40 px-3 py-1 rounded-full" style={{ color: ACCENT }}>After</span>
        </motion.div>

        {/* Hero text content */}
        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6 w-full">
          <div className="max-w-2xl space-y-8">
            <div>
              <motion.p initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ ...spring, delay: 2.2 }} className="text-sm uppercase tracking-widest mb-4" style={{ color: AMBER }}>
                Seattle&apos;s Eco-Friendly Junk Removal
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...spring, delay: 2.4 }}
                className="text-4xl md:text-7xl tracking-tighter leading-none font-bold text-white"
                style={{ textShadow: "0 2px 20px rgba(0,0,0,0.6)" }}
              >
                Gone Today.<br />
                <span style={{ color: ACCENT }}>Green Tomorrow.</span>
              </motion.h1>
            </div>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 2.8 }} className="text-lg text-slate-300 max-w-lg leading-relaxed">
              8 years of hauling Seattle&apos;s clutter. 60% donated, 30% recycled, 10% landfill. Upfront pricing, same-day service, and crews that leave your space spotless.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 3.0 }} className="flex flex-wrap gap-4">
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white flex items-center gap-2 cursor-pointer" style={{ background: ACCENT } as React.CSSProperties}>
                Book a Pickup <ArrowRight size={18} weight="bold" />
              </MagneticButton>
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/15 flex items-center gap-2 cursor-pointer">
                <Phone size={18} weight="duotone" /> (206) 555-0637
              </MagneticButton>
            </motion.div>
            {/* Trust pills */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ ...spring, delay: 3.2 }} className="flex flex-wrap gap-3">
              {["8 Years in Seattle", "4.9-Star Rated", "Same-Day Service", "Eco-Certified"].map((badge) => (
                <span key={badge} className="text-xs font-semibold px-3 py-1.5 rounded-full border border-white/15 text-slate-300" style={{ background: "rgba(255,255,255,0.08)" }}>
                  <CheckCircle size={12} weight="fill" style={{ color: ACCENT }} className="inline mr-1 -mt-0.5" />
                  {badge}
                </span>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── 2. TRUST BAR ─── */}
      <SectionReveal className="relative z-10 -mt-4 pb-8">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <GlassCard className="p-6 md:p-8">
            <motion.div className="grid grid-cols-2 sm:grid-cols-4 gap-6 md:gap-8" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
              {[
                { icon: Star, label: "4.9 Star Rating", desc: "200+ five-star reviews" },
                { icon: Timer, label: "Same-Day Service", desc: "Call before noon" },
                { icon: Recycle, label: "90% Diverted", desc: "From landfills" },
                { icon: Medal, label: "8 Years", desc: "Serving Seattle" },
              ].map((stat, i) => (
                <motion.div key={i} variants={fadeUp} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: ACCENT_GLOW }}>
                    <stat.icon size={20} weight="duotone" style={{ color: ACCENT }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{stat.label}</p>
                    <p className="text-xs text-slate-400">{stat.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </GlassCard>
        </div>
      </SectionReveal>

      {/* ─── 3. WHAT WE HAUL ─── */}
      <SectionReveal id="services" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ACCENT }}>What We Haul</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="If You Can Point To It, We'll Haul It" />
            </h2>
          </div>
          <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {haulItems.map((item, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="p-6 h-full group hover:border-white/20 transition-colors">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: i % 2 === 0 ? ACCENT_GLOW : AMBER_GLOW }}>
                    <item.icon size={24} weight="duotone" style={{ color: i % 2 === 0 ? ACCENT : AMBER }} />
                  </div>
                  <h3 className="text-base font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── 4. PRICING ─── */}
      <SectionReveal id="pricing" className="relative z-10 py-16 md:py-24">
        <div className="absolute inset-0 z-0" style={{ background: `radial-gradient(ellipse at center, ${ACCENT_GLOW} 0%, transparent 70%)` }} />
        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: AMBER }}>Transparent Pricing</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Simple Truck-Based Pricing" />
            </h2>
            <p className="text-slate-400 mt-4 max-w-lg mx-auto">No hidden fees. No weight calculations. Just how much space your stuff takes up in our truck.</p>
          </div>
          <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {[
              { tier: "1/4 Truck", price: "$149", desc: "A few bulky items", items: "1-3 large items (couch, mattress, appliance)", ideal: "Single item removal, small cleanups", popular: false },
              { tier: "1/2 Truck", price: "$249", desc: "Room or garage cleanup", items: "Equivalent to a 10x10 room of stuff", ideal: "Garage cleanout, office furniture, downsizing", popular: true },
              { tier: "Full Truck", price: "$399", desc: "Major cleanout", items: "Fills our entire 16-yard truck", ideal: "Estate cleanout, renovation debris, whole rooms", popular: false },
            ].map((plan, i) => (
              <motion.div key={i} variants={fadeUp}>
                {plan.popular ? (
                  <ShimmerBorder>
                    <div className="p-6 md:p-8 relative">
                      <span className="absolute top-4 right-4 text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded-full" style={{ background: AMBER, color: "#000" }}>Most Popular</span>
                      <p className="text-sm font-semibold mb-1" style={{ color: ACCENT }}>{plan.tier}</p>
                      <p className="text-4xl font-black text-white mb-1">{plan.price}</p>
                      <p className="text-sm text-slate-400 mb-6">{plan.desc}</p>
                      <div className="space-y-3 mb-6">
                        <div className="flex items-start gap-2"><CheckCircle size={16} weight="fill" style={{ color: ACCENT }} className="mt-0.5 shrink-0" /><span className="text-sm text-slate-300">{plan.items}</span></div>
                        <div className="flex items-start gap-2"><CheckCircle size={16} weight="fill" style={{ color: ACCENT }} className="mt-0.5 shrink-0" /><span className="text-sm text-slate-300">{plan.ideal}</span></div>
                        <div className="flex items-start gap-2"><CheckCircle size={16} weight="fill" style={{ color: ACCENT }} className="mt-0.5 shrink-0" /><span className="text-sm text-slate-300">Eco-friendly disposal included</span></div>
                        <div className="flex items-start gap-2"><CheckCircle size={16} weight="fill" style={{ color: ACCENT }} className="mt-0.5 shrink-0" /><span className="text-sm text-slate-300">All labor and cleanup included</span></div>
                      </div>
                      <MagneticButton className="w-full py-3 rounded-xl text-sm font-bold text-white" style={{ background: ACCENT } as React.CSSProperties}>
                        Book This Size
                      </MagneticButton>
                    </div>
                  </ShimmerBorder>
                ) : (
                  <GlassCard className="p-6 md:p-8 h-full">
                    <p className="text-sm font-semibold mb-1" style={{ color: ACCENT }}>{plan.tier}</p>
                    <p className="text-4xl font-black text-white mb-1">{plan.price}</p>
                    <p className="text-sm text-slate-400 mb-6">{plan.desc}</p>
                    <div className="space-y-3 mb-6">
                      <div className="flex items-start gap-2"><CheckCircle size={16} weight="fill" style={{ color: ACCENT }} className="mt-0.5 shrink-0" /><span className="text-sm text-slate-300">{plan.items}</span></div>
                      <div className="flex items-start gap-2"><CheckCircle size={16} weight="fill" style={{ color: ACCENT }} className="mt-0.5 shrink-0" /><span className="text-sm text-slate-300">{plan.ideal}</span></div>
                      <div className="flex items-start gap-2"><CheckCircle size={16} weight="fill" style={{ color: ACCENT }} className="mt-0.5 shrink-0" /><span className="text-sm text-slate-300">Eco-friendly disposal included</span></div>
                      <div className="flex items-start gap-2"><CheckCircle size={16} weight="fill" style={{ color: ACCENT }} className="mt-0.5 shrink-0" /><span className="text-sm text-slate-300">All labor and cleanup included</span></div>
                    </div>
                    <MagneticButton className="w-full py-3 rounded-xl text-sm font-bold text-white border border-white/15">
                      Book This Size
                    </MagneticButton>
                  </GlassCard>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── 5. ECO COMMITMENT ─── */}
      <SectionReveal id="eco" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ACCENT }}>Our Green Promise</p>
              <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white mb-6">
                <WordReveal text="Your Junk Doesn't End Up in a Landfill" />
              </h2>
              <p className="text-slate-400 leading-relaxed mb-8">
                Every truckload we pick up is sorted by hand at our facility on Airport Way. Marcus and his crew separate donations from recyclables from true waste. We track every item so you know exactly where your stuff went.
              </p>
              <div className="space-y-4">
                {[
                  { pct: "60%", label: "Donated", desc: "Usable items go to Goodwill, Habitat ReStore, and local shelters", color: ACCENT },
                  { pct: "30%", label: "Recycled", desc: "Metals, electronics, and materials sent to certified recycling centers", color: AMBER },
                  { pct: "10%", label: "Landfill", desc: "Only true waste that cannot be reused or recycled", color: "#ef4444" },
                ].map((row, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl flex items-center justify-center shrink-0 text-2xl font-black" style={{ background: `${row.color}15`, color: row.color }}>
                      {row.pct}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{row.label}</p>
                      <p className="text-xs text-slate-400">{row.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <motion.div className="relative" initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={spring}>
              <div className="aspect-square rounded-2xl overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&q=80"
                  alt="Sorted recycling bins for responsible disposal"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 rounded-2xl" style={{ background: `linear-gradient(to top, ${BG}ee 0%, transparent 50%)` }} />
              </div>
              <div className="absolute bottom-6 left-6 right-6">
                <GlassCard className="p-4 text-center">
                  <p className="text-2xl font-black text-white">2,400+</p>
                  <p className="text-xs text-slate-400">Tons diverted from landfills since 2018</p>
                </GlassCard>
              </div>
            </motion.div>
          </div>
        </div>
      </SectionReveal>

      {/* ─── 6. SAME-DAY SERVICE ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <ShimmerBorder>
            <div className="p-8 md:p-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <motion.div
                      className="w-3 h-3 rounded-full"
                      style={{ background: ACCENT }}
                      animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                    <span className="text-sm font-bold uppercase tracking-widest" style={{ color: ACCENT }}>Crews Available Now</span>
                  </div>
                  <h2 className="text-3xl md:text-5xl tracking-tighter leading-none font-bold text-white mb-4">
                    Same-Day Junk Removal
                  </h2>
                  <p className="text-slate-400 leading-relaxed">
                    Call before noon, and we&apos;ll be at your door today. Most jobs are quoted and completed in under an hour. No waiting around for a dumpster delivery, no doing the work yourself.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: Phone, label: "Call By Noon", desc: "Same-day guarantee" },
                    { icon: Gauge, label: "45 Min Average", desc: "Most jobs completed" },
                    { icon: Clock, label: "2-Hour Window", desc: "Arrival guarantee" },
                    { icon: Broom, label: "Clean Sweep", desc: "We sweep behind us" },
                  ].map((item, i) => (
                    <GlassCard key={i} className="p-4 text-center">
                      <item.icon size={24} weight="duotone" style={{ color: AMBER }} className="mx-auto mb-2" />
                      <p className="text-sm font-semibold text-white">{item.label}</p>
                      <p className="text-xs text-slate-400">{item.desc}</p>
                    </GlassCard>
                  ))}
                </div>
              </div>
            </div>
          </ShimmerBorder>
        </div>
      </SectionReveal>

      {/* ─── 7. "WHAT NEEDS TO GO?" QUIZ ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: AMBER }}>Quick Estimate</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="What Needs to Go?" />
            </h2>
            <p className="text-slate-400 mt-4">Select your situation for an instant ballpark estimate.</p>
          </div>
          <motion.div className="space-y-3" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
            {quizOptions.map((opt, i) => (
              <motion.div key={i} variants={fadeUp}>
                <button
                  onClick={() => setQuizAnswer(i)}
                  className="w-full text-left cursor-pointer"
                >
                  <GlassCard className={`p-5 flex items-center gap-4 transition-all ${quizAnswer === i ? "border-white/30 shadow-lg" : "hover:border-white/15"}`}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${opt.color}20` }}>
                      <opt.icon size={20} weight="duotone" style={{ color: opt.color }} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-white">{opt.label}</p>
                    </div>
                    <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0" style={{ borderColor: quizAnswer === i ? opt.color : "rgba(255,255,255,0.2)" }}>
                      {quizAnswer === i && <div className="w-2.5 h-2.5 rounded-full" style={{ background: opt.color }} />}
                    </div>
                  </GlassCard>
                </button>
              </motion.div>
            ))}
          </motion.div>
          <AnimatePresence>
            {quizAnswer !== null && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={spring}
                className="mt-6"
              >
                <GlassCard className="p-6 text-center">
                  <p className="text-sm text-slate-400 mb-2">Estimated cost:</p>
                  <p className="text-2xl font-black text-white mb-3">{quizOptions[quizAnswer].recommendation}</p>
                  <p className="text-xs text-slate-400 mb-4">Final price confirmed on-site. No obligation.</p>
                  <MagneticButton className="px-8 py-3 rounded-full text-sm font-bold text-white inline-flex items-center gap-2" style={{ background: ACCENT } as React.CSSProperties}>
                    <Phone size={16} weight="duotone" /> Call (206) 555-0637
                  </MagneticButton>
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </SectionReveal>

      {/* ─── 8. PROCESS ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ACCENT }}>How It Works</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Book. Show Up. Haul. Done." />
            </h2>
            <p className="text-slate-400 mt-4">Most jobs completed start to finish in under 15 minutes.</p>
          </div>
          <motion.div className="grid grid-cols-1 md:grid-cols-4 gap-6" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {[
              { step: "01", title: "Book Online or Call", desc: "Schedule your free on-site estimate. We offer same-day and 2-hour arrival windows.", icon: CalendarCheck, color: ACCENT },
              { step: "02", title: "We Show Up On Time", desc: "Our crew arrives, assesses the job, and gives you a firm, no-obligation price on the spot.", icon: Truck, color: AMBER },
              { step: "03", title: "We Haul Everything", desc: "Say the word and we load it all. You don't lift a finger. We handle all the heavy lifting and loading.", icon: Package, color: ACCENT },
              { step: "04", title: "Done in 15 Minutes", desc: "We sweep the area clean, sort everything for donation and recycling, and you're clutter-free.", icon: Broom, color: AMBER },
            ].map((item, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="p-6 h-full relative overflow-hidden group">
                  <span className="text-6xl font-black absolute top-2 right-3 opacity-[0.03] text-white">{item.step}</span>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: `${item.color}15` }}>
                    <item.icon size={24} weight="duotone" style={{ color: item.color }} />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
                  {i < 3 && (
                    <ArrowRight size={16} weight="bold" className="absolute top-1/2 -right-3 hidden md:block text-slate-600" />
                  )}
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── 9. COMPARISON: US vs DUMPSTER RENTAL ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: AMBER }}>Why Choose Us</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="CleanSlate vs. Dumpster Rental" />
            </h2>
          </div>
          <GlassCard className="overflow-hidden">
            <div className="grid grid-cols-3 gap-0 text-center p-4 border-b border-white/8">
              <span className="text-sm font-semibold text-slate-400">Feature</span>
              <span className="text-sm font-bold" style={{ color: ACCENT }}>CleanSlate</span>
              <span className="text-sm font-semibold text-slate-400">Dumpster Rental</span>
            </div>
            {comparisonRows.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 gap-0 text-center p-4 ${i % 2 === 0 ? "bg-white/[0.07]" : ""}`}>
                <span className="text-sm text-slate-300 text-left">{row.feature}</span>
                <span className="text-sm" style={{ color: ACCENT }}>
                  {row.us ? <CheckCircle size={18} weight="fill" className="inline" style={{ color: ACCENT }} /> : <X size={18} weight="bold" className="inline text-red-400" />}
                  <span className="hidden sm:inline ml-1 text-xs text-slate-400">{row.usText}</span>
                </span>
                <span className="text-sm text-slate-500">
                  {row.them ? <CheckCircle size={18} weight="fill" className="inline text-slate-500" /> : <X size={18} weight="bold" className="inline text-red-400/50" />}
                  <span className="hidden sm:inline ml-1 text-xs">{row.themText}</span>
                </span>
              </div>
            ))}
          </GlassCard>
        </div>
      </SectionReveal>

      {/* ─── 10. ABOUT MARCUS / THE STORY ─── */}
      <SectionReveal id="about" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ACCENT }}>About CleanSlate</p>
              <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white mb-6">
                <WordReveal text="Built by Marcus Williams" />
              </h2>
              <p className="text-slate-400 leading-relaxed mb-4">
                Marcus started CleanSlate Junk Removal in 2018 with a single truck and a conviction that hauling junk doesn&apos;t mean trashing the planet. Eight years later, his crew has completed over 3,000 pickups across Seattle and diverted more than 2,400 tons from landfills.
              </p>
              <p className="text-slate-400 leading-relaxed mb-6">
                Operating out of 4218 Airport Way S in Georgetown, CleanSlate has become Seattle&apos;s most trusted eco-friendly junk removal service. Marcus personally oversees the sorting process, making sure every usable item finds a second home through partnerships with Goodwill, Habitat ReStore, and local shelters.
              </p>
              <div className="flex flex-wrap gap-3">
                {["Licensed & Insured", "Background-Checked Crews", "BBB A+ Rated", "Eco-Certified"].map((badge) => (
                  <span key={badge} className="text-xs font-semibold px-3 py-1.5 rounded-full border" style={{ borderColor: `${ACCENT}40`, color: ACCENT, background: ACCENT_GLOW }}>
                    {badge}
                  </span>
                ))}
              </div>
            </div>
            <motion.div className="grid grid-cols-2 gap-4" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
              {[
                { icon: HandHeart, label: "60% Donated", desc: "Items find second homes" },
                { icon: ShieldCheck, label: "Fully Insured", desc: "Complete liability coverage" },
                { icon: UsersThree, label: "12-Person Crew", desc: "Trained, vetted, friendly" },
                { icon: Certificate, label: "3,000+ Jobs", desc: "Since 2018 in Seattle" },
              ].map((item, i) => (
                <motion.div key={i} variants={fadeUp}>
                  <GlassCard className="p-5 text-center">
                    <item.icon size={28} weight="duotone" style={{ color: i % 2 === 0 ? ACCENT : AMBER }} className="mx-auto mb-2" />
                    <p className="text-sm font-semibold text-white">{item.label}</p>
                    <p className="text-xs text-slate-400 mt-1">{item.desc}</p>
                  </GlassCard>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </SectionReveal>

      {/* ─── 11. GOOGLE REVIEWS HEADER + TESTIMONIALS ─── */}
      <SectionReveal id="reviews" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          {/* Google reviews summary */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/15 bg-white/[0.08] mb-6">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, j) => (<Star key={j} size={16} weight="fill" style={{ color: AMBER }} />))}
              </div>
              <span className="text-sm font-semibold text-white">4.9</span>
              <span className="text-sm text-slate-400">from 200+ Google reviews</span>
            </div>
          </div>
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ACCENT }}>Customer Reviews</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Cleared Out & Stress-Free" />
            </h2>
          </div>
          {/* Testimonial cards — staggered masonry-style with varied heights */}
          <motion.div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {testimonials.map((t, i) => (
              <motion.div key={i} variants={fadeUp} className="break-inside-avoid">
                <GlassCard className="p-6">
                  <Quotes size={24} weight="fill" style={{ color: ACCENT }} className="mb-3 opacity-40" />
                  <p className="text-slate-300 leading-relaxed text-sm mb-4">{t.text}</p>
                  <div className="flex items-center justify-between pt-3 border-t border-white/8">
                    <div>
                      <p className="text-sm font-semibold text-white">{t.name}</p>
                      <p className="text-xs text-slate-500">{t.role}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="flex gap-0.5">{Array.from({ length: t.rating }).map((_, j) => (<Star key={j} size={14} weight="fill" style={{ color: AMBER }} />))}</div>
                      <CheckCircle size={14} weight="fill" style={{ color: ACCENT }} className="ml-1" />
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── 12. VIDEO TESTIMONIAL PLACEHOLDER ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4 md:px-6">
          <div className="relative aspect-video rounded-2xl overflow-hidden group cursor-pointer">
            <img
              src="https://images.unsplash.com/photo-1614201991207-765637dd6183?w=1200&q=80"
              alt="CleanSlate crew at work"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${BG}ee 0%, ${BG}66 40%, ${BG}33 100%)` }} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.div
                className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
                style={{ background: ACCENT, boxShadow: `0 0 40px ${ACCENT}60` }}
                whileHover={{ scale: 1.1 }}
              >
                <ArrowRight size={32} weight="fill" className="text-white ml-1" />
              </motion.div>
              <p className="text-lg font-bold text-white">Watch Our Crew in Action</p>
              <p className="text-sm text-slate-400">See a full garage cleanout in under 60 seconds</p>
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* ─── 13. RESULTS GALLERY ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ACCENT }}>Our Results</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Clean Spaces, Happy Clients" />
            </h2>
          </div>
          <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {[
              { src: "https://images.unsplash.com/photo-1635510952461-1fc1b7c96314?w=600&q=80", label: "Beach Cleanup — Ballard" },
              { src: "https://images.unsplash.com/photo-1667318243261-af1026f4195b?w=600&q=80", label: "Estate Cleanout — Capitol Hill" },
              { src: "https://images.unsplash.com/photo-1712252036653-fe3a6c503692?w=600&q=80", label: "Industrial Salvage — SoDo" },
              { src: "https://images.unsplash.com/photo-1588829297835-5f3492a4cf9d?w=600&q=80", label: "Renovation Debris — Fremont" },
              { src: "https://images.unsplash.com/photo-1706773184955-c45fac9e0528?w=600&q=80", label: "Appliance Haul — Green Lake" },
              { src: "https://plus.unsplash.com/premium_photo-1683141120496-f5921a97f5c4?w=600&q=80", label: "Full Property Clear — Beacon Hill" },
            ].map((img, i) => (
              <motion.div key={i} variants={fadeUp} className="aspect-[4/3] rounded-xl overflow-hidden relative group">
                <motion.img src={img.src} alt={img.label} className="w-full h-full object-cover" whileHover={{ scale: 1.05 }} transition={{ duration: 0.4 }} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <p className="text-sm font-semibold text-white">{img.label}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── 14. WHY NOT DIY? ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: AMBER }}>Save Your Back</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Why Hire CleanSlate Instead of DIY?" />
            </h2>
          </div>
          <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {[
              {
                icon: Warning,
                title: "Risk of Injury",
                desc: "Heavy furniture, sharp debris, and awkward loads cause thousands of back injuries every year. Our insured crews are trained for safe, efficient hauling.",
                color: "#ef4444",
              },
              {
                icon: Clock,
                title: "Your Time is Worth More",
                desc: "Between loading, driving to the dump, paying disposal fees, and cleaning up, a DIY haul eats an entire weekend. We finish most jobs in under an hour.",
                color: AMBER,
              },
              {
                icon: Recycle,
                title: "We Sort, You Don't",
                desc: "The dump takes everything to landfill. We hand-sort every load — donating 60%, recycling 30%, and only landfilling 10%. Better for the planet, zero effort from you.",
                color: ACCENT,
              },
            ].map((item, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="p-6 h-full">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: `${item.color}15` }}>
                    <item.icon size={24} weight="duotone" style={{ color: item.color }} />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── 15. CERTIFICATIONS & PARTNER BADGES ─── */}
      <SectionReveal className="relative z-10 py-12">
        <div className="mx-auto max-w-5xl px-4 md:px-6">
          <div className="text-center mb-8">
            <p className="text-sm uppercase tracking-widest" style={{ color: ACCENT }}>Trusted & Certified</p>
          </div>
          <motion.div className="flex flex-wrap justify-center gap-3" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
            {[
              { icon: ShieldCheck, label: "Licensed & Insured" },
              { icon: Certificate, label: "BBB A+ Rated" },
              { icon: Recycle, label: "Eco-Certified" },
              { icon: Globe, label: "Goodwill Partner" },
              { icon: Heart, label: "Habitat ReStore" },
              { icon: Medal, label: "King County Approved" },
            ].map((badge, i) => (
              <motion.div key={i} variants={fadeUp}>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/15 bg-white/[0.08]">
                  <badge.icon size={16} weight="duotone" style={{ color: ACCENT }} />
                  <span className="text-xs font-semibold text-slate-300">{badge.label}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── 16. SERVICE AREAS ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-sm uppercase tracking-widest mb-3" style={{ color: AMBER }}>Where We Serve</p>
              <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white mb-4">
                <WordReveal text="All of Seattle & Surrounding Areas" />
              </h2>
              <p className="text-slate-400 leading-relaxed mb-6">
                Based out of Georgetown, we serve all Seattle neighborhoods and surrounding communities within a 30-mile radius. Same-day service available across our entire coverage area.
              </p>
              <div className="flex items-center gap-3 mb-4">
                <motion.div
                  className="w-3 h-3 rounded-full"
                  style={{ background: ACCENT }}
                  animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <span className="text-sm font-semibold" style={{ color: ACCENT }}>Crews available now across Seattle</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin size={18} weight="duotone" style={{ color: AMBER }} />
                <a href="https://maps.google.com/?q=4218+Airport+Way+S+Seattle+WA+98108" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-400 hover:text-white transition-colors underline">
                  4218 Airport Way S, Seattle, WA 98108
                </a>
              </div>
            </div>
            <motion.div className="grid grid-cols-3 gap-3" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
              {serviceAreas.map((area, i) => (
                <motion.div key={i} variants={fadeUp}>
                  <GlassCard className="p-3 text-center hover:border-white/20 transition-colors">
                    <MapPin size={14} weight="duotone" style={{ color: ACCENT }} className="mx-auto mb-1" />
                    <p className="text-xs font-semibold text-white">{area}</p>
                  </GlassCard>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </SectionReveal>

      {/* ─── 17. THE CLEANSLATE GUARANTEE ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ACCENT }}>Our Promise</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="The CleanSlate Guarantee" />
            </h2>
          </div>
          <motion.div className="grid grid-cols-2 sm:grid-cols-4 gap-4" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {[
              { icon: CheckCircle, label: "Upfront Pricing", desc: "No hidden fees ever" },
              { icon: Timer, label: "Same-Day Available", desc: "Call before noon" },
              { icon: Recycle, label: "Eco-Friendly", desc: "90% diverted from landfill" },
              { icon: ShieldCheck, label: "Licensed & Insured", desc: "Full liability coverage" },
              { icon: HandHeart, label: "We Donate Items", desc: "60% goes to charity" },
              { icon: Broom, label: "Clean Sweep", desc: "We sweep after every job" },
              { icon: Certificate, label: "Vetted Crews", desc: "Background-checked" },
              { icon: ArrowsClockwise, label: "Free Estimates", desc: "No obligation quotes" },
            ].map((item, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="p-4 text-center h-full">
                  <item.icon size={22} weight="duotone" style={{ color: i % 2 === 0 ? ACCENT : AMBER }} className="mx-auto mb-2" />
                  <p className="text-xs font-semibold text-white">{item.label}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{item.desc}</p>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── 18. FAQ ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ACCENT }}>Questions</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Frequently Asked Questions" />
            </h2>
          </div>
          <motion.div className="space-y-3" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {faqData.map((item, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="overflow-hidden">
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-5 text-left cursor-pointer">
                    <span className="text-sm md:text-base font-semibold text-white pr-4">{item.q}</span>
                    <motion.div animate={{ rotate: openFaq === i ? 180 : 0 }} transition={spring}><CaretDown size={18} className="text-slate-400 shrink-0" /></motion.div>
                  </button>
                  <AnimatePresence initial={false}>
                    {openFaq === i && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={spring} className="overflow-hidden">
                        <p className="px-5 pb-5 text-sm text-slate-400 leading-relaxed">{item.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── 19. CTA BANNER ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4 md:px-6">
          <ShimmerBorder>
            <div className="p-8 md:p-12 text-center">
              <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={spring}>
                <p className="text-sm uppercase tracking-widest mb-3" style={{ color: AMBER }}>Ready to Clear the Clutter?</p>
                <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white mb-4">Gone Today. Green Tomorrow.</h2>
                <p className="text-slate-400 text-lg mb-6 max-w-lg mx-auto">Same-day service. Upfront pricing. 60% of your stuff goes to charity. Let Marcus and the crew handle it.</p>
                <div className="flex flex-wrap justify-center gap-4">
                  <MagneticButton className="px-10 py-4 rounded-full text-base font-semibold text-white inline-flex items-center gap-2 cursor-pointer" style={{ background: ACCENT } as React.CSSProperties}>
                    <CalendarCheck size={20} weight="duotone" /> Book a Pickup
                  </MagneticButton>
                  <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/15 inline-flex items-center gap-2 cursor-pointer">
                    <Phone size={18} weight="duotone" /> (206) 555-0637
                  </MagneticButton>
                </div>
              </motion.div>
            </div>
          </ShimmerBorder>
        </div>
      </SectionReveal>

      {/* ─── 20. CONTACT FORM ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white mb-6">
                <WordReveal text="Let Us Clear It Out" />
              </h2>
              <p className="text-slate-400 leading-relaxed max-w-md mb-8">
                Tell us what you need gone and we&apos;ll give you an honest, upfront quote. Most jobs completed same-day or next-day.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <MapPin size={20} weight="duotone" style={{ color: ACCENT }} className="mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-white">Service Area</p>
                    <p className="text-sm text-slate-400">
                      <a href="https://maps.google.com/?q=4218+Airport+Way+S+Seattle+WA+98108" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors underline">4218 Airport Way S, Seattle, WA 98108</a>
                      <br />Serving all of Seattle &amp; 30-mile radius
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Phone size={20} weight="duotone" style={{ color: ACCENT }} className="mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-white">Phone</p>
                    <p className="text-sm text-slate-400"><a href="tel:2065550637" className="hover:text-white transition-colors">(206) 555-0637</a></p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Envelope size={20} weight="duotone" style={{ color: ACCENT }} className="mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-white">Email</p>
                    <p className="text-sm text-slate-400"><a href="mailto:go@cleanslateseattle.com" className="hover:text-white transition-colors">go@cleanslateseattle.com</a></p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Clock size={20} weight="duotone" style={{ color: ACCENT }} className="mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-white">Hours</p>
                    <p className="text-sm text-slate-400">7 Days a Week: 7:00 AM - 7:00 PM<br />Same-day service when you call before noon</p>
                  </div>
                </div>
              </div>
            </div>
            <GlassCard className="p-6 md:p-8">
              <h3 className="text-xl font-bold text-white mb-6">Request Your Free Quote</h3>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input type="text" placeholder="Full Name" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-green-500/50 transition-colors" />
                  <input type="tel" placeholder="Phone Number" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-green-500/50 transition-colors" />
                </div>
                <input type="email" placeholder="Email Address" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-green-500/50 transition-colors" />
                <select className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-slate-500 focus:outline-none focus:border-green-500/50 transition-colors">
                  <option value="">What do you need removed?</option>
                  <option value="furniture">Furniture &amp; Household Items</option>
                  <option value="appliances">Appliances</option>
                  <option value="garage">Garage / Basement Cleanout</option>
                  <option value="estate">Estate Cleanout</option>
                  <option value="construction">Construction Debris</option>
                  <option value="yard">Yard Waste</option>
                  <option value="hottub">Hot Tub / Spa Removal</option>
                  <option value="office">Office / Commercial Cleanout</option>
                  <option value="electronics">Electronics &amp; E-Waste</option>
                  <option value="other">Other</option>
                </select>
                <textarea placeholder="Tell us about the job (what items, location, access, etc.)..." rows={4} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-green-500/50 transition-colors resize-none" />
                <MagneticButton className="w-full px-6 py-4 rounded-xl text-base font-bold text-white flex items-center justify-center gap-2" style={{ background: ACCENT } as React.CSSProperties}>
                  Get My Free Quote <ArrowRight size={18} weight="bold" />
                </MagneticButton>
              </form>
            </GlassCard>
          </div>
        </div>
      </SectionReveal>

      {/* ─── 21. FOOTER ─── */}
      <footer className="relative z-10 border-t border-white/8 py-8">
        <div className="mx-auto max-w-7xl px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Truck size={16} weight="duotone" style={{ color: ACCENT }} />
            <span>CleanSlate Junk Removal &copy; {new Date().getFullYear()}</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <a href="tel:2065550637" className="hover:text-white transition-colors">(206) 555-0637</a>
            <span className="text-slate-700">|</span>
            <a href="mailto:go@cleanslateseattle.com" className="hover:text-white transition-colors">go@cleanslateseattle.com</a>
          </div>
          <p className="text-xs text-slate-600 flex items-center gap-1.5"><svg width="14" height="14" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-sky-500"><path d="M24.3 4.2c-1.5-.4-3.2.1-4.5 1.1-1-.7-2.3-1-3.5-.8-2.4.4-4.2 2.5-4.2 4.9v.6c-3.2.8-6 2.8-7.8 5.6-.3.5-.1 1.1.4 1.4.5.3 1.1.1 1.4-.4 1.5-2.3 3.7-4 6.3-4.7.5-.1 1-.1 1.5 0 .8.2 1.4.8 1.7 1.5.3.8.2 1.6-.2 2.3l-2.8 4.3c-.6.9-.4 2.1.4 2.8l2.5 2.1c.4.3.8.5 1.3.5h5.2c.5 0 1-.2 1.3-.5l1.2-1c.6-.5.8-1.3.6-2l-1-3.2c-.2-.5 0-1.1.4-1.4l3.8-2.5c1.3-.9 2.1-2.3 2.1-3.9V9.6c0-2.5-1.7-4.7-4.1-5.3v-.1z" fill="currentColor"/></svg>Created by <a href="https://bluejayportfolio.com" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "underline" }}>bluejayportfolio.com</a></p>
        </div>
      </footer>

      {/* ─── 22. FIXED CLAIM BANNER ─── */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-auto">
        <GlassCard className="px-5 py-3">
          <p className="text-xs text-center text-slate-300">
            Claim your FREE website at{" "}
            <a href="https://bluejayportfolio.com" target="_blank" rel="noopener noreferrer" className="font-bold text-white underline">
              bluejayportfolio.com
            </a>
          </p>
        </GlassCard>
      </div>
    </main>
  );
}
