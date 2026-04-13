"use client";

/* eslint-disable @next/next/no-img-element -- Static marketing showcase uses plain img tags intentionally */
/* eslint-disable react-hooks/purity -- Decorative particle values are randomized for static visual effects */

import { useState, useRef, useCallback, type SVGProps } from "react";
import { motion, useMotionValue, useSpring, useInView, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Star, ShieldCheck, Phone, MapPin, Clock, ArrowRight, Quotes, X, List, Sparkle, Wind, Drop, Dog, Rug, BuildingOffice, CheckCircle, Leaf, Timer, Broom, MagnifyingGlass, SprayBottle, ThermometerHot, Fan, Bed, Warning, Lightning, Envelope, Question, Couch, Bathtub, Chair, Storefront, HandSoap, SealCheck } from "@phosphor-icons/react";

/* ───────────────────────── SPRING CONFIG ───────────────────────── */
const spring = { type: "spring" as const, stiffness: 100, damping: 20 };
const springFast = { type: "spring" as const, stiffness: 200, damping: 25 };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const fadeUp = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: spring } };

/* ───────────────────────── COLORS ───────────────────────── */
const BG = "#0f172a";
const ACCENT = "#06b6d4";
const ACCENT_LIGHT = "#67e8f9";
const ACCENT_GLOW = "rgba(6, 182, 212, 0.15)";

/* ───────────────────────── SPARKLE NAV ICON ───────────────────────── */
function SparkleIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path d="M16 4L18.6667 10.6667L25.3333 13.3333L18.6667 16L16 22.6667L13.3333 16L6.66667 13.3333L13.3333 10.6667L16 4Z" stroke={ACCENT_LIGHT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M25.3333 4L24 8L22.6667 4L24 0L25.3333 4Z" fill={ACCENT} />
      <path d="M9.33333 22.6667L8 26.6667L6.66667 22.6667L4 21.3333L6.66667 20L8 16L9.33333 20L12 21.3333L9.33333 22.6667Z" stroke={ACCENT} strokeWidth="1.5" />
    </svg>
  );
}

/* ───────────────────────── BUBBLE SVG PATTERN ───────────────────────── */
function BubblePattern() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden hidden md:block opacity-[0.04]">
      <svg width="100%" height="100%">
        <defs>
          <pattern id="carpet-bubble-pat" width="80" height="80" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="1.5" fill={ACCENT_LIGHT} />
            <circle cx="40" cy="50" r="2" fill={ACCENT_LIGHT} />
            <circle cx="70" cy="20" r="1" fill={ACCENT_LIGHT} />
            <circle cx="25" cy="70" r="2.5" fill={ACCENT_LIGHT} />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#carpet-bubble-pat)" />
      </svg>
    </div>
  );
}

/* ───────────────────────── FLOATING PARTICLES ───────────────────────── */
function FloatingParticles() {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i, x: Math.random() * 100, delay: Math.random() * 12,
    duration: 10 + Math.random() * 8, size: 1.5 + Math.random() * 3, opacity: 0.05 + Math.random() * 0.1,
  }));
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden hidden md:block">
      {particles.map((p) => (
        <motion.div key={p.id} className="absolute rounded-full"
          style={{ left: `${p.x}%`, width: p.size, height: p.size, background: ACCENT_LIGHT, willChange: "transform, opacity" }}
          animate={{ y: ["110vh", "-10vh"], opacity: [0, p.opacity, p.opacity, 0] }}
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

function GlassCard({ children, className = "", style, onClick }: { children: React.ReactNode; className?: string; style?: React.CSSProperties; onClick?: () => void }) {
  return (<div className={`rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] ${className}`} style={style} onClick={onClick}>{children}</div>);
}

function MagneticButton({ children, className = "", onClick, style, type }: { children: React.ReactNode; className?: string; onClick?: () => void; style?: React.CSSProperties; type?: "button" | "submit" | "reset" }) {
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
    <motion.button ref={ref} type={type} style={{ x: springX, y: springY, willChange: "transform", ...style }} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} onClick={onClick} className={className} whileTap={{ scale: 0.97 }}>
      {children}
    </motion.button>
  );
}

function ShimmerBorder({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative rounded-2xl p-[1px] overflow-hidden ${className}`}>
      <motion.div className="absolute inset-0 rounded-2xl" style={{ background: `conic-gradient(from 0deg, transparent, ${ACCENT}, transparent, ${ACCENT_LIGHT}, transparent)`, willChange: "transform" }} animate={{ rotate: [0, 360] }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} />
      <div className="relative rounded-2xl z-10" style={{ background: BG }}>{children}</div>
    </div>
  );
}

/* ───────────────────────── DATA ───────────────────────── */
const services = [
  { title: "Carpet Cleaning", description: "Truck-mounted hot water extraction penetrates deep into fibers, removing embedded dirt, allergens, and bacteria. IICRC-certified technicians handle every job.", icon: Broom },
  { title: "Upholstery Cleaning", description: "We safely clean sofas, loveseats, chairs, and sectionals using fabric-appropriate methods that restore color, freshness, and softness.", icon: Couch },
  { title: "Tile & Grout Cleaning", description: "High-pressure steam blasts away years of grime in tile and grout lines. We restore kitchens, bathrooms, and entryways to original shine.", icon: Bathtub },
  { title: "Area Rug Cleaning", description: "Specialized in-plant cleaning for wool, silk, synthetic, and oriental rugs. We handle delicate fibers with care and return them vibrant.", icon: Rug },
  { title: "Pet Stain & Odor Removal", description: "Our enzymatic bio-treatment breaks down pet urine, vomit, and odors at the molecular level. Permanent elimination, not masking.", icon: Dog },
  { title: "Commercial Cleaning", description: "Customized programs for offices, retail, restaurants, and apartment complexes. Flexible scheduling including nights and weekends.", icon: BuildingOffice },
  { title: "Water Damage Restoration", description: "Emergency water extraction and drying available same-day. Fast response prevents mold growth and structural damage.", icon: Warning },
  { title: "Mattress Cleaning", description: "Deep sanitization removes dust mites, dead skin cells, allergens, and stains from mattresses. Sleep healthier.", icon: Bed },
];

const testimonials = [
  { name: "Jessica Larsen", text: "We had red wine stains we thought were permanent. Dan and his team got them out completely. Our carpets look better than when we moved in five years ago.", rating: 5, location: "Greenwood" },
  { name: "Mark Thompson", role: "Property Manager", text: "We use FreshStart for all our apartment turnovers across 12 buildings. Reliable, competitively priced, and never let us down on tight timelines.", rating: 5, location: "Fremont" },
  { name: "The Rodriguez Family", text: "With two kids and a golden retriever, our carpets take a beating. Lisa was so kind explaining the process and the results were incredible.", rating: 5, location: "Ballard" },
  { name: "Sarah Chen", text: "Called at 8 AM about a pipe burst. Dan had a crew at our house by 10 AM. They extracted all the water and saved our floors. True professionals.", rating: 5, location: "Wallingford" },
  { name: "David Park", role: "Restaurant Owner", text: "FreshStart handles our commercial carpet and tile cleaning monthly. The difference is night and day. Customers notice and comment.", rating: 5, location: "Phinney Ridge" },
];

const processSteps = [
  { step: 1, title: "Inspect", description: "Walk through your home, identify problem areas, test fiber types, create a customized plan.", icon: MagnifyingGlass },
  { step: 2, title: "Pre-Treat", description: "Stubborn stains, high-traffic areas, and pet spots get targeted eco-friendly pre-treatment.", icon: SprayBottle },
  { step: 3, title: "Hot Water Extract", description: "Truck-mounted system injects 200-degree water deep into fibers and immediately extracts it with all the dirt.", icon: ThermometerHot },
  { step: 4, title: "Speed Dry", description: "Industrial air movers reduce dry time to 4-6 hours, not days. Walk on carpets the same evening.", icon: Fan },
];

const pricingPlans = [
  { title: "Single Room", price: "$99", subtitle: "Perfect for a quick refresh", features: ["1 room up to 200 sq ft", "Pre-treatment included", "Deodorizer application", "Speed drying", "Spot stain treatment"], popular: false },
  { title: "3 Rooms", price: "$179", subtitle: "Our most popular package", features: ["3 rooms up to 600 sq ft", "Pre-treatment on all areas", "Stain protection coating", "Speed drying", "Free hallway cleaning", "Furniture moving included"], popular: true },
  { title: "Whole House", price: "$349", subtitle: "Complete home transformation", features: ["Up to 1,500 sq ft", "All rooms + hallways + stairs", "Deep stain treatment", "Pet odor enzyme treatment", "Speed drying all areas", "All furniture moving", "Stain protection on high-traffic"], popular: false },
];

const certifications = ["IICRC Certified Firm", "Eco-Friendly Products", "Licensed & Insured", "100% Satisfaction Guarantee", "24-Hour Dry Guarantee", "Family Owned 14 Years", "Background-Checked Crew", "5-Star Google Rating"];

const diyComparison = [
  { feature: "Deep fiber extraction", us: true, them: "No" },
  { feature: "Professional pre-treatment", us: true, them: "No" },
  { feature: "Truck-mounted equipment (200+ PSI)", us: true, them: "Rental only" },
  { feature: "Stain protection coating", us: true, them: "No" },
  { feature: "Pet odor enzyme treatment", us: true, them: "No" },
  { feature: "Speed drying (4-6 hrs)", us: true, them: "24-48 hrs" },
  { feature: "Satisfaction guarantee", us: true, them: "No" },
];

const serviceAreas = ["Phinney Ridge", "Greenwood", "Fremont", "Ballard", "Wallingford", "Green Lake", "University District", "Ravenna", "Northgate", "Shoreline", "Lake City", "Loyal Heights"];

const quizOptions = [
  { label: "Carpet & Rugs", icon: Rug, color: ACCENT, recommendation: "Our hot water extraction is perfect for deep-cleaning carpets and area rugs. Book a 3-room package at $179 for the best value." },
  { label: "Upholstery & Furniture", icon: Couch, color: "#a78bfa", recommendation: "We use fabric-safe methods to clean sofas, chairs, and sectionals. Most pieces dry in 4-6 hours and look brand new." },
  { label: "Tile, Grout & Hard Floors", icon: Bathtub, color: "#34d399", recommendation: "Our high-pressure steam system restores tile and grout to like-new condition. Perfect for kitchens, bathrooms, and entryways." },
];

const beforeAfterImage = "/images/carpet-before-after.png";

const ecoProducts = [
  { title: "Non-Toxic Formula", description: "Free from harsh chemicals, completely safe for children, pets, and anyone with sensitivities.", icon: Leaf },
  { title: "Biodegradable", description: "Every product breaks down naturally. Zero chemical runoff from your carpet cleaning.", icon: Drop },
  { title: "Allergen Reduction", description: "Removes up to 98% of common allergens including dust mites, pollen, and pet dander.", icon: Wind },
  { title: "Green Seal Certified", description: "Products meeting the strictest environmental and health safety standards in the industry.", icon: ShieldCheck },
];

const whatWeClean = [
  { name: "Living Rooms", icon: Couch }, { name: "Bedrooms", icon: Bed },
  { name: "Hallways & Stairs", icon: Storefront }, { name: "Dining Rooms", icon: Chair },
  { name: "Offices", icon: BuildingOffice }, { name: "Bathrooms (Tile)", icon: Bathtub },
  { name: "Area Rugs", icon: Rug }, { name: "Upholstery", icon: HandSoap },
];

const faqData = [
  { q: "How long does it take for carpets to dry?", a: "Most carpets are dry within 4-6 hours thanks to our truck-mounted extraction system and industrial air movers. We guarantee fully dry carpets within 24 hours or we come back free." },
  { q: "Are your products safe for kids and pets?", a: "Absolutely. We use non-toxic, biodegradable cleaning solutions meeting Green Seal standards. Tough on dirt and allergens, completely safe for your family and pets." },
  { q: "Do I need to move my furniture?", a: "Move small items and breakables. Our team handles large furniture like sofas, tables, and beds. We place protective pads underneath after cleaning." },
  { q: "How often should carpets be cleaned?", a: "Manufacturers recommend professional cleaning every 12-18 months to maintain warranty. Homes with children or pets benefit from every 6-9 months." },
  { q: "What is your cancellation policy?", a: "Cancel or reschedule with 24 hours notice at no charge. Same-day cancellations may incur a small trip fee to cover crew time." },
  { q: "Do you offer commercial services?", a: "Yes. Customized cleaning programs for offices, retail, restaurants, and apartment complexes. Flexible scheduling including nights and weekends. Contact us for a free estimate." },
];

const cleaningChecklist = [
  "Vacuum and pre-inspect all carpet areas",
  "Identify and pre-treat all visible stains",
  "Apply eco-friendly pre-spray to high-traffic zones",
  "Hot water extraction with truck-mounted system",
  "Edge and corner detail cleaning by hand",
  "Spot treatment on remaining stubborn stains",
  "Apply stain protection coating (3-room+ packages)",
  "Deodorize and neutralize odors",
  "Set up industrial air movers for speed drying",
  "Final walkthrough inspection with homeowner",
];

const galleryImages = [
  "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=600&q=80",
  "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=600&q=80",
  "https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=600&q=80",
  "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=600&q=80",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&q=80",
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80",
];

const howOftenOptions = [
  { label: "Every 6 Months", color: "#34d399", desc: "Ideal for homes with pets, children, or allergy sufferers. Keeps carpets in top condition year-round.", icon: Dog },
  { label: "Every 12 Months", color: ACCENT, desc: "Perfect for most households. Maintains carpet warranty and keeps fibers looking fresh and clean.", icon: Sparkle },
  { label: "Every 18+ Months", color: "#f59e0b", desc: "Minimum recommended by manufacturers. If it has been longer, schedule a deep clean today.", icon: Warning },
];

const navLinks = [
  { name: "Services", id: "services" }, { name: "Pricing", id: "pricing" },
  { name: "Process", id: "process" }, { name: "Results", id: "results" },
  { name: "Reviews", id: "testimonials" }, { name: "Contact", id: "contact" },
];

/* ───────────────────────── HERO GRADIENT TEXT ───────────────────────── */
function HeroGradientReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const cleanWidth = useTransform(scrollYProgress, [0, 0.4], ["35%", "100%"]);
  const springCleanWidth = useSpring(cleanWidth, { stiffness: 80, damping: 30 });
  return (
    <div ref={ref} className="relative select-none">
      <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-none" style={{ color: "#3e2e1a", WebkitTextStroke: "1px rgba(62, 46, 26, 0.3)" }}>
        FRESH<br />START
      </h1>
      <motion.div className="absolute inset-0 overflow-hidden" style={{ width: springCleanWidth }}>
        <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-none whitespace-nowrap" style={{ color: "#ffffff", textShadow: `0 0 60px ${ACCENT_GLOW}, 0 0 120px ${ACCENT_GLOW}` }}>
          FRESH<br />START
        </h1>
      </motion.div>
    </div>
  );
}

const PlusIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
  </svg>
);

/* ═══════════════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════════════ */
export default function V2CarpetCleaningPage() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [quizChoice, setQuizChoice] = useState<number | null>(null);


  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
    setIsMenuOpen(false);
  };

  return (
    <div style={{ background: BG, color: "#e2e8f0" }} className="font-sans antialiased relative">
      <BubblePattern />
      <FloatingParticles />

      {/* ────────────────── HEADER & NAV ────────────────── */}
      <header className="fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-6xl mx-auto z-50">
        <GlassCard className="flex items-center justify-between p-3">
          <motion.div whileHover={{ scale: 1.05 }} transition={springFast} className="flex items-center gap-2 cursor-pointer" onClick={() => scrollTo("hero")}>
            <SparkleIcon size={32} />
            <span className="font-bold text-lg text-white">FreshStart</span>
          </motion.div>
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((l) => (
              <MagneticButton key={l.id} className="px-4 py-2 rounded-full text-sm font-medium text-slate-300 hover:text-white transition-colors" onClick={() => scrollTo(l.id)}>{l.name}</MagneticButton>
            ))}
          </nav>
          <MagneticButton className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-white" style={{ background: ACCENT }} onClick={() => scrollTo("contact")}>
            Book Now <ArrowRight />
          </MagneticButton>
          <div className="md:hidden">
            <MagneticButton onClick={() => setIsMenuOpen(true)} className="p-2 rounded-full"><List size={24} weight="bold" /></MagneticButton>
          </div>
        </GlassCard>
      </header>

      {/* ────────────────── MOBILE MENU ────────────────── */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div initial={{ opacity: 0, y: "-100%" }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: "-100%" }} transition={spring} className="fixed inset-0 z-50 bg-black/80 backdrop-blur-lg md:hidden">
            <div className="flex justify-between items-center p-4 border-b border-slate-700">
              <div className="flex items-center gap-2"><SparkleIcon size={28} /><span className="font-bold text-lg text-white">FreshStart</span></div>
              <MagneticButton onClick={() => setIsMenuOpen(false)} className="p-2 rounded-full"><X size={24} weight="bold" /></MagneticButton>
            </div>
            <div className="flex flex-col items-center justify-center h-[calc(100%-80px)] gap-6">
              {navLinks.map((l) => (<span key={l.id} onClick={() => scrollTo(l.id)} className="text-3xl font-semibold text-slate-200 cursor-pointer">{l.name}</span>))}
              <button onClick={() => scrollTo("contact")} className="mt-4 px-8 py-4 rounded-full text-xl font-semibold text-white" style={{ background: ACCENT }}>Book Now</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-6xl mx-auto px-4 pt-32 pb-12">

        {/* ═══════════════ 1. HERO — GRADIENT REVEAL ═══════════════ */}
        <section id="hero" className="relative min-h-[90vh] flex items-center justify-center text-center py-20">
          <div className="absolute inset-0 z-0" style={{ background: `radial-gradient(ellipse at 30% 50%, rgba(6,182,212,0.08) 0%, transparent 60%), radial-gradient(ellipse at 70% 30%, rgba(6,182,212,0.05) 0%, transparent 50%)` }} />
          <div className="absolute inset-0 z-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")", backgroundRepeat: "repeat", backgroundSize: "128px 128px" }} />
          <div className="relative z-10 flex flex-col items-center gap-8">
            <HeroGradientReveal />
            <p className="text-lg md:text-xl text-slate-300 max-w-xl tracking-wide">Professional Carpet &amp; Upholstery Cleaning</p>
            <p className="text-sm text-slate-400 max-w-md">Family-owned by Dan &amp; Lisa Kowalski. IICRC certified. Serving Seattle neighborhoods for 14 years.</p>
            <div className="flex flex-col sm:flex-row gap-4 mt-2">
              <MagneticButton className="px-8 py-4 rounded-full text-lg font-semibold text-white shadow-lg shadow-cyan-500/20" style={{ background: ACCENT }} onClick={() => scrollTo("contact")}>
                Book Now <ArrowRight className="inline ml-2" />
              </MagneticButton>
              <MagneticButton className="px-8 py-4 rounded-full text-lg font-semibold text-slate-300 border border-white/10 bg-white/5" onClick={() => scrollTo("pricing")}>
                View Pricing
              </MagneticButton>
            </div>
            <div className="flex flex-wrap justify-center gap-3 mt-4">
              {["IICRC Certified", "Eco-Friendly", "14 Years Trusted", "24hr Dry Guarantee"].map((b) => (
                <span key={b} className="px-3 py-1.5 rounded-full text-xs font-medium border border-white/10 bg-white/[0.04] text-slate-300 flex items-center gap-1.5">
                  <CheckCircle size={14} weight="fill" style={{ color: ACCENT }} />{b}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════ 2. TRUST BAR ═══════════════ */}
        <SectionReveal className="grid grid-cols-2 md:grid-cols-4 gap-8 my-20 text-center">
          {[
            { icon: Star, label: "5-Star Rated", sub: "200+ Google Reviews", c: "#f59e0b" },
            { icon: ShieldCheck, label: "IICRC Certified", sub: "Industry Gold Standard", c: ACCENT_LIGHT },
            { icon: Timer, label: "Same-Day Service", sub: "Book by Noon", c: "#34d399" },
            { icon: Leaf, label: "Eco-Friendly", sub: "Safe for Family & Pets", c: "#a3e635" },
          ].map((s, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <s.icon size={32} weight="fill" style={{ color: s.c }} />
              <p className="font-semibold text-white">{s.label}</p>
              <p className="text-sm text-slate-400">{s.sub}</p>
            </div>
          ))}
        </SectionReveal>

        {/* ═══════════════ 3. SERVICES ═══════════════ */}
        <SectionReveal id="services" className="py-20">
          <h2 className="text-4xl font-bold text-center text-white mb-3">Our <span style={{ color: ACCENT }}>Cleaning</span> Services</h2>
          <p className="text-lg text-center max-w-3xl mx-auto text-slate-300 mb-14">From a single room to commercial buildings, Dan and Lisa have the expertise and equipment to handle it all.</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {services.map((s, i) => (
              <GlassCard key={i} className="p-6 hover:border-cyan-500/30 transition-colors">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: ACCENT_GLOW }}>
                  <s.icon size={24} weight="duotone" style={{ color: ACCENT }} />
                </div>
                <h3 className="font-semibold text-lg text-white mb-2">{s.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{s.description}</p>
              </GlassCard>
            ))}
          </div>
        </SectionReveal>

        {/* ═══════════════ 4. PRICING ═══════════════ */}
        <SectionReveal id="pricing" className="py-20">
          <h2 className="text-4xl font-bold text-center text-white mb-3">Transparent <span style={{ color: ACCENT }}>Pricing</span></h2>
          <p className="text-lg text-center max-w-2xl mx-auto text-slate-300 mb-14">No hidden fees. No surprises. Just honest pricing for professional results.</p>
          <div className="grid md:grid-cols-3 gap-6">
            {pricingPlans.map((plan, i) => (
              <div key={i} className={plan.popular ? "relative" : ""}>
                {plan.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10"><span className="px-4 py-1 rounded-full text-xs font-bold text-white" style={{ background: ACCENT }}>MOST POPULAR</span></div>}
                <GlassCard className={`p-8 h-full flex flex-col ${plan.popular ? "border-cyan-500/40 ring-1 ring-cyan-500/20" : ""}`}>
                  <h3 className="text-xl font-bold text-white mb-1">{plan.title}</h3>
                  <p className="text-slate-400 text-sm mb-4">{plan.subtitle}</p>
                  <div className="mb-6"><span className="text-4xl font-black text-white">{plan.price}</span></div>
                  <ul className="space-y-3 flex-grow mb-6">
                    {plan.features.map((f, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-slate-300">
                        <CheckCircle size={18} weight="fill" style={{ color: ACCENT }} className="mt-0.5 shrink-0" />{f}
                      </li>
                    ))}
                  </ul>
                  <MagneticButton className={`w-full py-3 rounded-xl text-sm font-semibold ${plan.popular ? "text-white" : "text-white border border-white/10"}`} style={plan.popular ? { background: ACCENT } : { background: "rgba(255,255,255,0.05)" }} onClick={() => scrollTo("contact")}>
                    Book This Package
                  </MagneticButton>
                </GlassCard>
              </div>
            ))}
          </div>
        </SectionReveal>

        {/* ═══════════════ 5. 4-STEP PROCESS ═══════════════ */}
        <SectionReveal id="process" className="py-20">
          <h2 className="text-4xl font-bold text-center text-white mb-3">Our <span style={{ color: ACCENT }}>4-Step</span> Process</h2>
          <p className="text-lg text-center max-w-2xl mx-auto text-slate-300 mb-16">Every cleaning follows our proven system for guaranteed results.</p>
          <div className="grid md:grid-cols-4 gap-8 relative">
            <div className="absolute top-8 left-[12%] right-[12%] h-px hidden md:block" style={{ background: `linear-gradient(90deg, transparent, ${ACCENT}40, ${ACCENT}40, transparent)` }} />
            {processSteps.map((s) => (
              <div key={s.step} className="relative flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-5 border-2 relative z-10" style={{ borderColor: ACCENT, background: `linear-gradient(135deg, ${ACCENT_GLOW}, ${BG})` }}>
                  <s.icon size={28} weight="duotone" style={{ color: ACCENT_LIGHT }} />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: ACCENT }}>Step {s.step}</span>
                <h3 className="font-semibold text-lg text-white mb-2">{s.title}</h3>
                <p className="text-slate-400 text-sm">{s.description}</p>
              </div>
            ))}
          </div>
        </SectionReveal>

        {/* ═══════════════ 6. WHY CHOOSE FRESHSTART ═══════════════ */}
        <SectionReveal className="py-20">
          <h2 className="text-4xl font-bold text-center text-white mb-3">Why Seattle Families <span style={{ color: ACCENT }}>Choose Us</span></h2>
          <p className="text-lg text-center max-w-2xl mx-auto text-slate-300 mb-14">There are dozens of carpet cleaners in Seattle. Here is why over 200 families trust FreshStart.</p>
          <div className="grid md:grid-cols-2 gap-6">
            <GlassCard className="p-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)" }}>
                  <Leaf size={24} weight="duotone" style={{ color: "#22c55e" }} />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white mb-2">Safe for Your Family</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">Every product we use is non-toxic and biodegradable. No harsh chemical residues left behind on surfaces your kids and pets play on. We believe a clean home should also be a safe home.</p>
                </div>
              </div>
            </GlassCard>
            <GlassCard className="p-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: ACCENT_GLOW, border: `1px solid ${ACCENT}30` }}>
                  <ThermometerHot size={24} weight="duotone" style={{ color: ACCENT }} />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white mb-2">Truck-Mounted Power</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">Our truck-mounted extraction system generates 200+ degrees and 500 PSI of pressure, far exceeding portable rental units. This is the same equipment used in commercial and industrial settings.</p>
                </div>
              </div>
            </GlassCard>
            <GlassCard className="p-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)" }}>
                  <Star size={24} weight="duotone" style={{ color: "#f59e0b" }} />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white mb-2">14 Years of Trust</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">Dan and Lisa have built their reputation one clean at a time since 2012. Over 200 five-star Google reviews from real Seattle homeowners speak to their commitment to quality.</p>
                </div>
              </div>
            </GlassCard>
            <GlassCard className="p-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.2)" }}>
                  <ShieldCheck size={24} weight="duotone" style={{ color: "#a78bfa" }} />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white mb-2">IICRC Certified Crew</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">Every technician holds IICRC certification, the gold standard in the cleaning industry. They are trained in the latest techniques and background-checked for your peace of mind.</p>
                </div>
              </div>
            </GlassCard>
          </div>
        </SectionReveal>

        {/* ═══════════════ 7. ECO-FRIENDLY ═══════════════ */}
        <SectionReveal className="py-20">
          <div className="rounded-3xl p-8 md:p-12" style={{ background: `linear-gradient(135deg, rgba(6,182,212,0.08) 0%, rgba(6,182,212,0.02) 100%)`, border: "1px solid rgba(6,182,212,0.15)" }}>
            <h2 className="text-4xl font-bold text-center text-white mb-3"><Leaf size={36} weight="duotone" className="inline mr-2" style={{ color: "#a3e635" }} />Eco-Friendly <span style={{ color: "#a3e635" }}>Cleaning</span></h2>
            <p className="text-lg text-center max-w-2xl mx-auto text-slate-300 mb-12">A deep clean should never come with harsh chemicals. Every product is chosen for safety and effectiveness.</p>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {ecoProducts.map((ep, i) => (
                <div key={i} className="text-center">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(163,230,53,0.1)", border: "1px solid rgba(163,230,53,0.2)" }}>
                    <ep.icon size={24} weight="duotone" style={{ color: "#a3e635" }} />
                  </div>
                  <h3 className="font-semibold text-white mb-2">{ep.title}</h3>
                  <p className="text-slate-400 text-sm">{ep.description}</p>
                </div>
              ))}
            </div>
          </div>
        </SectionReveal>

        {/* ═══════════════ CARPET HEALTH FACTS ═══════════════ */}
        <SectionReveal className="py-20">
          <h2 className="text-4xl font-bold text-center text-white mb-3">Did You <span style={{ color: ACCENT }}>Know?</span></h2>
          <p className="text-lg text-center max-w-2xl mx-auto text-slate-300 mb-12">Your carpet may look clean, but here is what is hiding in the fibers.</p>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { stat: "200,000", label: "bacteria per sq inch live in the average carpet — 4,000x dirtier than a toilet seat", color: "#ef4444" },
              { stat: "40 lbs", label: "of dirt can accumulate in the average carpet per year, even with regular vacuuming", color: "#f59e0b" },
              { stat: "98%", label: "of allergens are removed by professional hot water extraction, providing relief for allergy sufferers", color: "#34d399" },
            ].map((fact, i) => (
              <GlassCard key={i} className="p-6 text-center">
                <p className="text-4xl font-black mb-2" style={{ color: fact.color }}>{fact.stat}</p>
                <p className="text-slate-400 text-sm leading-relaxed">{fact.label}</p>
              </GlassCard>
            ))}
          </div>
        </SectionReveal>

        {/* ═══════════════ BEFORE / AFTER ═══════════════ */}
        <SectionReveal id="results" className="py-20">
          <h2 className="text-4xl font-bold text-center text-white mb-3">See the <span style={{ color: ACCENT }}>Difference</span></h2>
          <p className="text-lg text-center max-w-2xl mx-auto text-slate-300 mb-12">Real results from real Seattle homes cleaned by the FreshStart team.</p>
          <div className="max-w-4xl mx-auto">
            <div className="relative rounded-2xl overflow-hidden">
              <img src={beforeAfterImage} alt="Carpet cleaning before and after" className="w-full h-auto object-cover" />
            </div>
            <p className="text-center text-sm text-slate-400 mt-4">Living room deep clean — stains removed, fibers restored, fresh and bright.</p>
          </div>
        </SectionReveal>

        {/* ═══════════════ 8. WHAT NEEDS CLEANING? QUIZ ═══════════════ */}
        <SectionReveal className="py-20">
          <ShimmerBorder>
            <div className="p-8 md:p-12">
              <h2 className="text-3xl font-bold text-center text-white mb-3"><Question size={32} weight="duotone" className="inline mr-2" style={{ color: ACCENT }} />What Needs <span style={{ color: ACCENT }}>Cleaning?</span></h2>
              <p className="text-center text-slate-300 mb-10">Select what you need cleaned and we&apos;ll recommend the best service.</p>
              <div className="grid md:grid-cols-3 gap-4 mb-8">
                {quizOptions.map((opt, i) => (
                  <GlassCard key={i} className={`p-6 text-center cursor-pointer transition-all hover:border-cyan-500/30 ${quizChoice === i ? "border-cyan-500/50 ring-1 ring-cyan-500/20" : ""}`} onClick={() => setQuizChoice(i)}>
                    <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: `${opt.color}15`, border: `1px solid ${opt.color}30` }}>
                      <opt.icon size={28} weight="duotone" style={{ color: opt.color }} />
                    </div>
                    <h3 className="font-semibold text-white">{opt.label}</h3>
                  </GlassCard>
                ))}
              </div>
              <AnimatePresence mode="wait">
                {quizChoice !== null && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={spring} className="text-center">
                    <GlassCard className="p-6 max-w-lg mx-auto border-cyan-500/20">
                      <p className="text-slate-300 mb-4">{quizOptions[quizChoice].recommendation}</p>
                      <MagneticButton className="px-6 py-3 rounded-full text-sm font-semibold text-white" style={{ background: ACCENT }} onClick={() => scrollTo("contact")}>
                        <Phone size={16} className="inline mr-2" /> Call (206) 555-0483
                      </MagneticButton>
                    </GlassCard>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </ShimmerBorder>
        </SectionReveal>

        {/* ═══════════════ 9. WHAT WE CLEAN GRID ═══════════════ */}
        <SectionReveal className="py-20">
          <h2 className="text-4xl font-bold text-center text-white mb-3">What We <span style={{ color: ACCENT }}>Clean</span></h2>
          <p className="text-lg text-center max-w-2xl mx-auto text-slate-300 mb-12">Every room in your home deserves the FreshStart treatment.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {whatWeClean.map((item, i) => (
              <GlassCard key={i} className="p-5 text-center hover:border-cyan-500/30 transition-colors">
                <item.icon size={32} weight="duotone" style={{ color: ACCENT }} className="mx-auto mb-3" />
                <p className="text-white font-medium text-sm">{item.name}</p>
              </GlassCard>
            ))}
          </div>
        </SectionReveal>

        {/* ═══════════════ 10. CLEANING CHECKLIST ═══════════════ */}
        <SectionReveal className="py-20">
          <h2 className="text-4xl font-bold text-center text-white mb-3">Included in <span style={{ color: ACCENT }}>Every</span> Clean</h2>
          <p className="text-lg text-center max-w-2xl mx-auto text-slate-300 mb-12">Our 10-point checklist ensures nothing gets missed. Every single time.</p>
          <div className="max-w-2xl mx-auto">
            {cleaningChecklist.map((item, i) => (
              <div key={i} className={`flex items-center gap-4 py-3 ${i < cleaningChecklist.length - 1 ? "border-b border-white/5" : ""}`}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold" style={{ background: ACCENT_GLOW, color: ACCENT_LIGHT, border: `1px solid ${ACCENT}30` }}>
                  {i + 1}
                </div>
                <span className="text-slate-300">{item}</span>
              </div>
            ))}
          </div>
        </SectionReveal>

        {/* ═══════════════ 11. GALLERY ═══════════════ */}
        <SectionReveal className="py-20">
          <h2 className="text-4xl font-bold text-center text-white mb-3">Our <span style={{ color: ACCENT }}>Recent</span> Work</h2>
          <p className="text-lg text-center max-w-2xl mx-auto text-slate-300 mb-12">Fresh, clean spaces across Seattle homes and businesses.</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {galleryImages.map((src, i) => (
              <motion.div key={i} className="relative aspect-square rounded-xl overflow-hidden" whileHover={{ scale: 1.03, zIndex: 10 }} transition={springFast}>
                <img src={src} alt={`Clean space ${i + 1}`} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </motion.div>
            ))}
          </div>
        </SectionReveal>

        {/* ═══════════════ 12. DIY COMPARISON ═══════════════ */}
        <SectionReveal className="py-20">
          <h2 className="text-4xl font-bold text-center text-white mb-3">FreshStart vs. <span style={{ color: ACCENT }}>DIY / Rental</span></h2>
          <p className="text-lg text-center max-w-2xl mx-auto text-slate-300 mb-12">Professional cleaning delivers results rental machines simply cannot match.</p>
          <GlassCard className="overflow-hidden max-w-3xl mx-auto">
            <div className="grid grid-cols-3 text-center font-semibold text-sm border-b border-white/10">
              <div className="p-4 text-slate-400">Feature</div>
              <div className="p-4 text-white" style={{ background: ACCENT_GLOW }}>FreshStart</div>
              <div className="p-4 text-slate-400">DIY / Rental</div>
            </div>
            {diyComparison.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 text-center text-sm ${i < diyComparison.length - 1 ? "border-b border-white/5" : ""}`}>
                <div className="p-4 text-slate-300 text-left pl-6">{row.feature}</div>
                <div className="p-4" style={{ background: i % 2 === 0 ? ACCENT_GLOW : "transparent" }}>
                  <CheckCircle size={20} weight="fill" style={{ color: "#34d399" }} className="mx-auto" />
                </div>
                <div className="p-4 text-slate-500">{row.them}</div>
              </div>
            ))}
          </GlassCard>
        </SectionReveal>

        {/* ═══════════════ 11. TESTIMONIALS ═══════════════ */}
        <SectionReveal id="testimonials" className="py-20">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="flex gap-0.5">{Array(5).fill(0).map((_, i) => <Star key={i} size={24} weight="fill" style={{ color: "#f59e0b" }} />)}</div>
            <span className="text-white font-semibold text-lg">4.9</span>
            <span className="text-slate-400">from 200+ Google Reviews</span>
          </div>
          <h2 className="text-4xl font-bold text-center text-white mb-14">What Seattle <span style={{ color: ACCENT }}>Homeowners</span> Say</h2>
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
            {testimonials.map((t, i) => (
              <GlassCard key={i} className="p-6 break-inside-avoid">
                <Quotes size={28} weight="fill" className="mb-3 shrink-0" style={{ color: ACCENT }} />
                <p className="text-slate-300 mb-5 leading-relaxed">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <div>
                    <p className="font-semibold text-white text-sm">{t.name}</p>
                    {t.role && <p className="text-xs text-slate-500">{t.role}</p>}
                    <p className="text-xs text-slate-400">{t.location}, Seattle</p>
                  </div>
                  <div className="flex gap-0.5">{Array(t.rating).fill(0).map((_, j) => <Star key={j} size={14} weight="fill" style={{ color: "#f59e0b" }} />)}</div>
                </div>
                <div className="flex items-center gap-1.5 mt-3">
                  <SealCheck size={14} weight="fill" style={{ color: "#34d399" }} />
                  <span className="text-xs text-slate-500">Verified Customer</span>
                </div>
              </GlassCard>
            ))}
          </div>
        </SectionReveal>

        {/* ═══════════════ 14. HOW OFTEN SHOULD YOU CLEAN? ═══════════════ */}
        <SectionReveal className="py-20">
          <h2 className="text-4xl font-bold text-center text-white mb-3">How <span style={{ color: ACCENT }}>Often</span> Should You Clean?</h2>
          <p className="text-lg text-center max-w-2xl mx-auto text-slate-300 mb-12">Most people wait too long. Here is what carpet manufacturers actually recommend.</p>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {howOftenOptions.map((opt, i) => (
              <GlassCard key={i} className="p-6 text-center" style={{ borderColor: `${opt.color}30` }}>
                <opt.icon size={32} weight="duotone" style={{ color: opt.color }} className="mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">{opt.label}</h3>
                <p className="text-slate-400 text-sm mb-4">{opt.desc}</p>
                <div className="w-full h-1 rounded-full" style={{ background: `${opt.color}30` }}>
                  <div className="h-1 rounded-full" style={{ background: opt.color, width: i === 0 ? "100%" : i === 1 ? "66%" : "33%" }} />
                </div>
              </GlassCard>
            ))}
          </div>
          <div className="text-center mt-8">
            <MagneticButton className="px-6 py-3 rounded-full text-sm font-semibold text-white" style={{ background: ACCENT }} onClick={() => scrollTo("contact")}>
              Schedule Your Deep Clean Today
            </MagneticButton>
          </div>
        </SectionReveal>

        {/* ═══════════════ 15. 24-HOUR DRY GUARANTEE ═══════════════ */}
        <SectionReveal className="py-20">
          <ShimmerBorder>
            <div className="p-8 md:p-12 grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
                    <Timer size={40} weight="fill" style={{ color: ACCENT }} />
                  </motion.div>
                  <h2 className="text-3xl font-bold text-white">24-Hour Dry <span style={{ color: ACCENT }}>Guarantee</span></h2>
                </div>
                <p className="text-slate-300 mb-6">Your carpets will be dry within 24 hours, or we come back to speed-dry for free. Most homes are completely dry in just 4-6 hours thanks to our truck-mounted extraction and industrial air movers.</p>
                <div className="flex flex-wrap gap-3">
                  {["Truck-mounted extraction", "Industrial air movers", "Low-moisture options", "Same-evening walkable"].map((f) => (
                    <span key={f} className="px-3 py-1.5 rounded-full text-xs font-medium border border-white/10 bg-white/[0.04] text-slate-300">
                      <CheckCircle size={12} weight="fill" style={{ color: ACCENT }} className="inline mr-1" />{f}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-center">
                <div className="w-40 h-40 rounded-full flex items-center justify-center mx-auto border-4" style={{ borderColor: ACCENT, background: ACCENT_GLOW }}>
                  <div><p className="text-5xl font-black text-white">24</p><p className="text-sm font-semibold uppercase tracking-wider" style={{ color: ACCENT_LIGHT }}>Hour Max</p></div>
                </div>
                <p className="mt-4 text-slate-400 text-sm">Average dry time: 4-6 hours</p>
              </div>
            </div>
          </ShimmerBorder>
        </SectionReveal>

        {/* ═══════════════ 13. ABOUT — DAN & LISA ═══════════════ */}
        <SectionReveal id="about" className="py-20 grid md:grid-cols-2 gap-12 items-center">
          <div className="relative rounded-2xl overflow-hidden aspect-[4/3]">
            <img src="https://images.unsplash.com/photo-1543269865-cbf427effbad?w=700&q=80" alt="Dan and Lisa Kowalski — FreshStart founders" className="w-full h-full object-cover object-center" />
            <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${BG}, transparent 50%)` }} />
            <div className="absolute bottom-4 left-4"><span className="px-3 py-1 rounded-full text-xs font-bold text-white" style={{ background: ACCENT }}>Family-Owned Since 2012</span></div>
          </div>
          <div>
            <h2 className="text-4xl font-bold text-white mb-4">Meet <span style={{ color: ACCENT }}>Dan &amp; Lisa</span></h2>
            <p className="text-slate-300 mb-4">Dan and Lisa Kowalski started FreshStart Carpet Cleaning in 2012 with a single truck and a commitment to honest, thorough work. Fourteen years later, they have grown into Seattle&apos;s most trusted carpet cleaning team, serving Phinney Ridge and surrounding neighborhoods.</p>
            <p className="text-slate-300 mb-6">Every technician is IICRC certified, background-checked, and trained in their proven 4-step process. They use only eco-friendly, non-toxic products because a healthy home starts with what goes into it.</p>
            <div className="flex flex-wrap gap-3">
              {["IICRC Certified", "Family-Owned", "Eco-Friendly", "14 Years Experience"].map((tag) => (
                <span key={tag} className="px-3 py-1.5 rounded-full text-xs font-medium text-white" style={{ background: ACCENT_GLOW, border: `1px solid ${ACCENT}30` }}>{tag}</span>
              ))}
            </div>
          </div>
        </SectionReveal>

        {/* ═══════════════ EMERGENCY RESPONSE ═══════════════ */}
        <SectionReveal className="py-20">
          <GlassCard className="p-8 md:p-12" style={{ border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.05)" }}>
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <motion.div className="w-4 h-4 rounded-full bg-red-500" animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }} transition={{ duration: 1.5, repeat: Infinity }} />
                  <span className="text-red-400 font-bold text-sm uppercase tracking-wider">Emergency Service Available</span>
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">Water Damage? <span className="text-red-400">Act Fast.</span></h2>
                <p className="text-slate-300 mb-6">Burst pipes, flooding, and water damage require immediate action to prevent mold and structural damage. Our emergency team responds same-day with professional water extraction and drying equipment.</p>
                <div className="flex flex-wrap gap-3 mb-6">
                  {["Same-day response", "Mold prevention", "Insurance documentation", "24/7 availability"].map((f) => (
                    <span key={f} className="px-3 py-1.5 rounded-full text-xs font-medium border border-red-500/20 bg-red-500/10 text-red-300">
                      <CheckCircle size={12} weight="fill" className="inline mr-1" style={{ color: "#ef4444" }} />{f}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-center">
                <MagneticButton className="px-8 py-4 rounded-full text-lg font-bold text-white shadow-lg" style={{ background: "#ef4444" }} onClick={() => window.location.href = "tel:2065550483"}>
                  <Phone size={20} className="inline mr-2" /> Emergency: (206) 555-0483
                </MagneticButton>
                <p className="text-slate-400 text-sm mt-3">Average response time: under 2 hours</p>
              </div>
            </div>
          </GlassCard>
        </SectionReveal>

        {/* ═══════════════ VIDEO PLACEHOLDER ═══════════════ */}
        <SectionReveal className="py-20">
          <div className="relative rounded-3xl overflow-hidden aspect-video max-w-4xl mx-auto">
            <img src="https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=1200&q=80" alt="Professional carpet cleaning" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <motion.div className="w-20 h-20 rounded-full flex items-center justify-center cursor-pointer" style={{ background: ACCENT }} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="white"><polygon points="8,5 19,12 8,19" /></svg>
              </motion.div>
            </div>
            <div className="absolute bottom-6 left-6">
              <p className="text-white font-semibold text-lg">Watch Our Process in Action</p>
              <p className="text-slate-300 text-sm">See how we transform carpets from stained to spotless</p>
            </div>
          </div>
        </SectionReveal>

        {/* ═══════════════ 15. CERTIFICATIONS ═══════════════ */}
        <SectionReveal className="py-20">
          <h2 className="text-4xl font-bold text-center text-white mb-3">Our <span style={{ color: ACCENT }}>Credentials</span></h2>
          <p className="text-lg text-center max-w-2xl mx-auto text-slate-300 mb-12">Backed by industry certifications and a commitment to quality you can trust.</p>
          <div className="flex flex-wrap justify-center gap-3">
            {certifications.map((cert, i) => (
              <span key={i} className="px-5 py-2.5 rounded-full text-sm font-medium border border-white/10 bg-white/[0.04] text-slate-300 flex items-center gap-2">
                <ShieldCheck size={16} weight="fill" style={{ color: ACCENT }} />{cert}
              </span>
            ))}
          </div>
        </SectionReveal>

        {/* ═══════════════ 16. SERVICE AREAS ═══════════════ */}
        <SectionReveal className="py-20">
          <h2 className="text-4xl font-bold text-center text-white mb-3">Serving <span style={{ color: ACCENT }}>Seattle</span> Neighborhoods</h2>
          <p className="text-lg text-center max-w-2xl mx-auto text-slate-300 mb-12">Fast response across North Seattle. Same-day service when you book by noon.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto">
            {serviceAreas.map((area, i) => (
              <GlassCard key={i} className="px-4 py-3 text-center text-sm">
                <MapPin size={14} weight="fill" style={{ color: ACCENT }} className="inline mr-1.5" />
                <span className="text-slate-300">{area}</span>
              </GlassCard>
            ))}
          </div>
          <div className="flex items-center justify-center mt-8 gap-3">
            <motion.div className="w-3 h-3 rounded-full" style={{ background: "#34d399" }} animate={{ scale: [1, 1.4, 1], opacity: [0.7, 1, 0.7] }} transition={{ duration: 2, repeat: Infinity }} />
            <span className="text-slate-300 text-sm font-medium">Crews Available Now — Response in Under 2 Hours</span>
          </div>
        </SectionReveal>

        {/* ═══════════════ 17. SATISFACTION GUARANTEE ═══════════════ */}
        <SectionReveal className="py-20">
          <GlassCard className="p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="text-center md:text-left">
                <h2 className="text-3xl font-bold text-white mb-4">100% Satisfaction <span style={{ color: ACCENT }}>Guarantee</span></h2>
                <p className="text-slate-300 mb-6">We stand behind every job. If you are not completely satisfied, let us know within 48 hours and we re-clean at no charge. Dan and Lisa personally oversee every job to ensure FreshStart quality.</p>
                <div className="flex justify-center md:justify-start"><ShieldCheck size={64} weight="duotone" style={{ color: ACCENT }} /></div>
              </div>
              <div>
                <h3 className="font-semibold text-xl text-white mb-6 text-center md:text-left">The FreshStart Promise</h3>
                <div className="space-y-4">
                  {["No hidden fees or surprise charges", "On-time arrival or we discount your service", "Eco-friendly products safe for kids and pets", "48-hour satisfaction re-clean guarantee", "Background-checked and uniformed technicians", "Fully licensed and insured in Washington"].map((pr, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <CheckCircle size={20} weight="fill" style={{ color: ACCENT_LIGHT }} className="shrink-0" />
                      <span className="text-slate-300 text-sm">{pr}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </GlassCard>
        </SectionReveal>

        {/* ═══════════════ 18. FAQ ═══════════════ */}
        <SectionReveal id="faq" className="py-20 max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-white mb-12">Frequently Asked <span style={{ color: ACCENT }}>Questions</span></h2>
          <div className="space-y-3">
            {faqData.map((faq, i) => (
              <GlassCard key={i} className="overflow-hidden">
                <button className="w-full flex justify-between items-center p-5 text-left" onClick={() => setOpenFAQ(openFAQ === i ? null : i)}>
                  <h3 className="font-semibold text-white pr-4">{faq.q}</h3>
                  <motion.div animate={{ rotate: openFAQ === i ? 45 : 0 }} transition={spring} className="shrink-0"><PlusIcon /></motion.div>
                </button>
                <AnimatePresence>
                  {openFAQ === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={spring}>
                      <p className="text-slate-300 px-5 pb-5">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </GlassCard>
            ))}
          </div>
        </SectionReveal>

        {/* ═══════════════ CARPET CARE TIPS ═══════════════ */}
        <SectionReveal className="py-20">
          <h2 className="text-4xl font-bold text-center text-white mb-3">Carpet Care <span style={{ color: ACCENT }}>Tips</span> from the Pros</h2>
          <p className="text-lg text-center max-w-2xl mx-auto text-slate-300 mb-12">Simple things you can do between professional cleanings to keep carpets looking great.</p>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              {
                title: "Vacuum Twice a Week",
                tip: "Regular vacuuming prevents dirt from grinding into carpet fibers. Focus on high-traffic areas like hallways and living rooms. Use a vacuum with a HEPA filter for best results.",
                icon: Broom,
              },
              {
                title: "Blot Spills Immediately",
                tip: "Never rub a spill — blot from the outside in with a clean white cloth. Rubbing pushes the stain deeper into fibers and can damage the carpet backing.",
                icon: Drop,
              },
              {
                title: "Remove Shoes at the Door",
                tip: "Up to 80% of carpet dirt comes from shoes. Place mats at every entrance and encourage a no-shoes policy indoors to dramatically reduce carpet soiling.",
                icon: Sparkle,
              },
              {
                title: "Rearrange Furniture Periodically",
                tip: "Heavy furniture creates permanent indentations over time. Rearranging every 6-12 months distributes wear evenly and prevents crushed fibers from becoming permanent.",
                icon: Rug,
              },
            ].map((tip, i) => (
              <GlassCard key={i} className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: ACCENT_GLOW }}>
                    <tip.icon size={20} weight="duotone" style={{ color: ACCENT }} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-2">{tip.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{tip.tip}</p>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </SectionReveal>

        {/* ═══════════════ COMMERCIAL SERVICES HIGHLIGHT ═══════════════ */}
        <SectionReveal className="py-20">
          <GlassCard className="p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <BuildingOffice size={40} weight="duotone" style={{ color: ACCENT }} className="mb-4" />
                <h2 className="text-3xl font-bold text-white mb-4">Commercial <span style={{ color: ACCENT }}>Cleaning</span> Programs</h2>
                <p className="text-slate-300 mb-4">FreshStart serves dozens of Seattle businesses with customized commercial carpet and tile cleaning programs. We work around your schedule with flexible hours including evenings and weekends.</p>
                <p className="text-slate-300 mb-6">Whether you manage office buildings, retail spaces, restaurants, or apartment complexes, we develop a cleaning plan tailored to your traffic patterns and budget.</p>
                <MagneticButton className="px-6 py-3 rounded-full text-sm font-semibold text-white" style={{ background: ACCENT }} onClick={() => scrollTo("contact")}>
                  Get a Commercial Quote
                </MagneticButton>
              </div>
              <div className="space-y-4">
                {[
                  { label: "Office Buildings", desc: "Cubicle areas, conference rooms, lobbies, and hallways" },
                  { label: "Retail Spaces", desc: "High-traffic sales floors, fitting rooms, and entrances" },
                  { label: "Restaurants & Cafes", desc: "Dining areas, kitchens (tile), and entryways" },
                  { label: "Apartment Complexes", desc: "Common areas, turnover cleaning, and tenant suites" },
                  { label: "Medical Offices", desc: "Waiting rooms, exam rooms, and reception areas" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle size={18} weight="fill" style={{ color: ACCENT }} className="mt-1 shrink-0" />
                    <div>
                      <p className="text-white font-medium text-sm">{item.label}</p>
                      <p className="text-slate-500 text-xs">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>
        </SectionReveal>

        {/* ═══════════════ CTA BANNER ═══════════════ */}
        <SectionReveal className="py-16">
          <ShimmerBorder>
            <div className="p-8 md:p-12 text-center">
              <Lightning size={40} weight="fill" style={{ color: ACCENT_LIGHT }} className="mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-white mb-3">Deep Clean. <span style={{ color: ACCENT }}>Fresh Start.</span></h2>
              <p className="text-slate-300 max-w-2xl mx-auto mb-8">Ready for carpets that look and feel brand new? Book your free estimate today and experience the FreshStart difference.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <MagneticButton className="px-8 py-4 rounded-full text-lg font-semibold text-white shadow-lg shadow-cyan-500/20" style={{ background: ACCENT }} onClick={() => scrollTo("contact")}>
                  Book My Free Estimate
                </MagneticButton>
                <MagneticButton className="px-8 py-4 rounded-full text-lg font-semibold text-slate-300 border border-white/10 bg-white/5" onClick={() => window.location.href = "tel:2065550483"}>
                  <Phone size={18} className="inline mr-2" /> (206) 555-0483
                </MagneticButton>
              </div>
            </div>
          </ShimmerBorder>
        </SectionReveal>

        {/* ═══════════════ 20. CONTACT ═══════════════ */}
        <SectionReveal id="contact" className="py-20 grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-4xl font-bold text-white mb-4">Get Your <span style={{ color: ACCENT }}>Free Estimate</span></h2>
            <p className="text-slate-300 mb-8">Ready to schedule or have questions? Dan and Lisa&apos;s team is here to help. We typically respond within the hour.</p>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <GlassCard className="p-3 rounded-full"><Phone size={24} style={{ color: ACCENT_LIGHT }} /></GlassCard>
                <div>
                  <p className="text-slate-400 text-sm">Call Us</p>
                  <a href="tel:2065550483" className="text-white font-semibold text-lg hover:text-cyan-300 transition-colors">(206) 555-0483</a>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <GlassCard className="p-3 rounded-full"><Envelope size={24} style={{ color: ACCENT_LIGHT }} /></GlassCard>
                <div>
                  <p className="text-slate-400 text-sm">Email</p>
                  <a href="mailto:clean@freshstartcarpets.com" className="text-white font-semibold text-lg hover:text-cyan-300 transition-colors">clean@freshstartcarpets.com</a>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <GlassCard className="p-3 rounded-full"><MapPin size={24} style={{ color: ACCENT_LIGHT }} /></GlassCard>
                <div>
                  <p className="text-slate-400 text-sm">Location</p>
                  <a href="https://maps.google.com/?q=5612+Phinney+Ave+N+Seattle+WA+98103" target="_blank" rel="noopener noreferrer" className="text-white font-semibold hover:text-cyan-300 transition-colors">5612 Phinney Ave N, Seattle WA 98103</a>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <GlassCard className="p-3 rounded-full"><Clock size={24} style={{ color: ACCENT_LIGHT }} /></GlassCard>
                <div>
                  <p className="text-slate-400 text-sm">Business Hours</p>
                  <p className="text-white font-semibold">Mon-Sat: 7:00 AM - 6:00 PM</p>
                </div>
              </div>
            </div>
          </div>
          <GlassCard className="p-8">
            <h3 className="text-2xl font-bold text-white mb-6">Request a Quote</h3>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <input type="text" placeholder="Your Name" className="w-full p-3 rounded-lg bg-slate-800/60 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent" />
              <input type="email" placeholder="Your Email" className="w-full p-3 rounded-lg bg-slate-800/60 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent" />
              <input type="tel" placeholder="Phone Number" className="w-full p-3 rounded-lg bg-slate-800/60 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent" />
              <select className="w-full p-3 rounded-lg bg-slate-800/60 border border-slate-700 text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent">
                <option value="">Select Service Needed</option>
                <option value="carpet">Carpet Cleaning</option>
                <option value="upholstery">Upholstery Cleaning</option>
                <option value="tile">Tile &amp; Grout</option>
                <option value="rug">Area Rug Cleaning</option>
                <option value="pet">Pet Stain &amp; Odor</option>
                <option value="commercial">Commercial Cleaning</option>
                <option value="water">Water Damage</option>
                <option value="mattress">Mattress Cleaning</option>
              </select>
              <textarea placeholder="Tell us about your cleaning needs..." rows={3} className="w-full p-3 rounded-lg bg-slate-800/60 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent" />
              <MagneticButton type="submit" className="w-full py-3 rounded-lg text-lg font-semibold text-white" style={{ background: ACCENT }}>
                Get My Free Estimate
              </MagneticButton>
            </form>
          </GlassCard>
        </SectionReveal>
      </main>

      {/* ────────────────── FOOTER ────────────────── */}
      <footer className="max-w-6xl mx-auto px-4 py-12 border-t border-white/10">
        <div className="grid md:grid-cols-4 gap-8 text-sm text-slate-400">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <SparkleIcon size={24} />
              <span className="font-bold text-white">FreshStart Carpet Cleaning</span>
            </div>
            <p className="mb-4">Family-owned and IICRC certified. Deep cleaning Seattle homes and businesses since 2012.</p>
            <p className="text-xs text-slate-500">Dan &amp; Lisa Kowalski, Owners</p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">Services</h4>
            <div className="space-y-2">
              <p><span className="hover:text-cyan-400 cursor-pointer transition-colors" onClick={() => scrollTo("services")}>Carpet Cleaning</span></p>
              <p><span className="hover:text-cyan-400 cursor-pointer transition-colors" onClick={() => scrollTo("services")}>Upholstery Cleaning</span></p>
              <p><span className="hover:text-cyan-400 cursor-pointer transition-colors" onClick={() => scrollTo("services")}>Tile &amp; Grout</span></p>
              <p><span className="hover:text-cyan-400 cursor-pointer transition-colors" onClick={() => scrollTo("services")}>Pet Stain Removal</span></p>
              <p><span className="hover:text-cyan-400 cursor-pointer transition-colors" onClick={() => scrollTo("services")}>Water Damage</span></p>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">Quick Links</h4>
            <div className="space-y-2">
              {navLinks.map((l) => (
                <p key={l.id}>
                  <span className="hover:text-cyan-400 cursor-pointer transition-colors" onClick={() => scrollTo(l.id)}>
                    {l.name}
                  </span>
                </p>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">Contact</h4>
            <div className="space-y-3">
              <p>
                <a href="tel:2065550483" className="hover:text-cyan-400 transition-colors flex items-center gap-2">
                  <Phone size={14} style={{ color: ACCENT }} />(206) 555-0483
                </a>
              </p>
              <p>
                <a href="mailto:clean@freshstartcarpets.com" className="hover:text-cyan-400 transition-colors flex items-center gap-2">
                  <Envelope size={14} style={{ color: ACCENT }} />clean@freshstartcarpets.com
                </a>
              </p>
              <p>
                <a href="https://maps.google.com/?q=5612+Phinney+Ave+N+Seattle+WA+98103" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors flex items-center gap-2">
                  <MapPin size={14} style={{ color: ACCENT }} />5612 Phinney Ave N, Seattle WA 98103
                </a>
              </p>
              <p className="flex items-center gap-2">
                <Clock size={14} style={{ color: ACCENT }} />Mon-Sat: 7:00 AM - 6:00 PM
              </p>
            </div>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-white/5 text-center text-slate-500 text-xs">
          <p>&copy; {new Date().getFullYear()} FreshStart Carpet Cleaning. All Rights Reserved.</p>
          <p className="mt-1">
            Created by{" "}
            <a href="https://bluejayportfolio.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-cyan-400 transition-colors">
              bluejayportfolio.com
            </a>
          </p>
        </div>
      </footer>

      {/* ────────────────── FIXED CLAIM BANNER ────────────────── */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40">
        <GlassCard className="px-4 py-2 flex items-center gap-3">
          <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }}>
            <Sparkle weight="fill" size={18} style={{ color: ACCENT }} />
          </motion.div>
          <p className="text-sm text-white font-medium">Deep Clean. Fresh Start.</p>
          <a href="tel:2065550483" className="text-xs font-semibold px-3 py-1 rounded-full text-white" style={{ background: ACCENT }}>Call Now</a>
        </GlassCard>
      </div>
    </div>
  );
}
