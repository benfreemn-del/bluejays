"use client";

/* eslint-disable @next/next/no-img-element -- Static marketing showcase page uses plain img tags intentionally. */
/* eslint-disable react-hooks/purity -- Decorative particle values are intentionally randomized for static visual effects. */

import { useState, useRef, useCallback, useEffect } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useInView,
  AnimatePresence,
} from "framer-motion";
import {
  Truck,
  Package,
  House,
  MapPin,
  Phone,
  Clock,
  ArrowRight,
  Star,
  ShieldCheck,
  Users,
  CheckCircle,
  CaretDown,
  Quotes,
  CalendarCheck,
  Warehouse,
  Buildings,
  CubeTransparent,
  Path,
  ListChecks,
  Handshake,
  X,
  List,
  Envelope,
  Timer,
  Calculator,
  CaretRight,
  Lightning,
  Medal,
  SealCheck,
  ClipboardText,
  Barbell,
  PencilSimple,
  NavigationArrow,
  Calendar,
  Key,
  Heart,
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
const BG = "#111111";
const ORANGE = "#f97316";
const ORANGE_LIGHT = "#fb923c";
const BROWN = "#92400e";
const SLATE_LIGHT = "#94a3b8";
const ORANGE_GLOW = "rgba(249, 115, 22, 0.15)";
const CARD_BG = "#1a1a1a";

/* ───────────────────────── FLOATING PARTICLES ───────────────────────── */
function FloatingParticles() {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 8,
    duration: 7 + Math.random() * 6,
    size: 2 + Math.random() * 3,
    opacity: 0.12 + Math.random() * 0.25,
  }));
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden hidden md:block">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{ left: `${p.x}%`, width: p.size, height: p.size, background: ORANGE_LIGHT, willChange: "transform, opacity" }}
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
  return <div className={`rounded-2xl border border-white/15 bg-white/[0.07] backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] ${className}`}>{children}</div>;
}

function MagneticButton({ children, className = "", onClick, href, style }: { children: React.ReactNode; className?: string; onClick?: () => void; href?: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, springFast);
  const springY = useSpring(y, springFast);
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left - rect.width / 2) * 0.25);
    y.set((e.clientY - rect.top - rect.height / 2) * 0.25);
  }, [x, y]);
  const handleMouseLeave = useCallback(() => { x.set(0); y.set(0); }, [x, y]);
  if (href) {
    return (
      <motion.a ref={ref as unknown as React.Ref<HTMLAnchorElement>} href={href} style={{ x: springX, y: springY, willChange: "transform", ...style } as React.CSSProperties} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} className={className}>
        {children}
      </motion.a>
    );
  }
  return (
    <motion.button ref={ref} style={{ x: springX, y: springY, willChange: "transform", ...style }} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} onClick={onClick} className={className} whileTap={{ scale: 0.97 }}>
      {children}
    </motion.button>
  );
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
      <motion.div className="absolute inset-0 rounded-2xl" style={{ background: `conic-gradient(from 0deg, transparent, ${ORANGE}, transparent, ${ORANGE_LIGHT}, transparent)`, willChange: "transform" }} animate={{ rotate: [0, 360] }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} />
      <div className="relative rounded-2xl z-10" style={{ background: CARD_BG }}>{children}</div>
    </div>
  );
}

function AccordionItem({ title, description, icon: Icon, isOpen, onToggle }: { title: string; description: string; icon: React.ElementType; isOpen: boolean; onToggle: () => void }) {
  return (
    <GlassCard className="overflow-hidden">
      <button onClick={onToggle} className="w-full flex items-center justify-between p-5 md:p-6 text-left group cursor-pointer">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: ORANGE_GLOW }}>
            <Icon size={20} weight="duotone" style={{ color: ORANGE }} />
          </div>
          <span className="text-lg font-semibold text-white">{title}</span>
        </div>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={spring}>
          <CaretDown size={20} className="text-slate-400" />
        </motion.div>
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

/* ───────────────────────── HERO: MOVING TRUCK JOURNEY SVG ───────────────────────── */
function MovingTruckJourney() {
  const [progress, setProgress] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    let frame: number;
    let start: number | null = null;
    const duration = 4000;
    const animate = (ts: number) => {
      if (!start) start = ts;
      const elapsed = ts - start;
      const p = Math.min(elapsed / duration, 1);
      setProgress(p);
      if (p < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [isInView]);

  const roadPath = "M 40,140 C 120,140 140,60 220,60 C 300,60 320,140 400,140 C 480,140 500,80 580,80 C 660,80 680,140 760,140";
  const progressPoints = [0.0, 0.2, 0.4, 0.6, 0.8, 1.0];

  const getPointOnPath = (t: number) => {
    const segments = [
      { x0: 40, y0: 140, cx1: 120, cy1: 140, cx2: 140, cy2: 60, x3: 220, y3: 60 },
      { x0: 220, y0: 60, cx1: 300, cy1: 60, cx2: 320, cy2: 140, x3: 400, y3: 140 },
      { x0: 400, y0: 140, cx1: 480, cy1: 140, cx2: 500, cy2: 80, x3: 580, y3: 80 },
      { x0: 580, y0: 80, cx1: 660, cy1: 80, cx2: 680, cy2: 140, x3: 760, y3: 140 },
    ];
    const totalT = t * segments.length;
    const segIdx = Math.min(Math.floor(totalT), segments.length - 1);
    const localT = totalT - segIdx;
    const s = segments[segIdx];
    const mt = 1 - localT;
    const x = mt * mt * mt * s.x0 + 3 * mt * mt * localT * s.cx1 + 3 * mt * localT * localT * s.cx2 + localT * localT * localT * s.x3;
    const y = mt * mt * mt * s.y0 + 3 * mt * mt * localT * s.cy1 + 3 * mt * localT * localT * s.cy2 + localT * localT * localT * s.y3;
    return { x, y };
  };

  const truckPos = getPointOnPath(progress);

  return (
    <div ref={ref} className="w-full max-w-3xl mx-auto">
      <svg viewBox="0 0 800 200" className="w-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Road background */}
        <path d={roadPath} stroke="#333" strokeWidth="28" strokeLinecap="round" fill="none" />
        {/* Dotted center line */}
        <path d={roadPath} stroke="#555" strokeWidth="2" strokeLinecap="round" strokeDasharray="8 12" fill="none" />
        {/* Lit-up road behind truck */}
        <motion.path d={roadPath} stroke={ORANGE} strokeWidth="28" strokeLinecap="round" fill="none" style={{ opacity: 0.15 }} pathLength={progress} strokeDasharray="1" strokeDashoffset={1 - progress} />

        {/* Progress dots */}
        {progressPoints.map((pt, i) => {
          const pos = getPointOnPath(pt);
          const lit = progress >= pt;
          return (
            <circle key={i} cx={pos.x} cy={pos.y} r={5} fill={lit ? ORANGE : "#444"} stroke={lit ? ORANGE_LIGHT : "#555"} strokeWidth={1.5}>
              {lit && <animate attributeName="r" values="5;7;5" dur="2s" repeatCount="indefinite" />}
            </circle>
          );
        })}

        {/* Start label: Your Old Home */}
        <g transform="translate(40, 170)">
          <House size={16} />
          <rect x="-30" y="2" width="60" height="18" rx="4" fill={BROWN} opacity={0.8} />
          <text x="0" y="15" textAnchor="middle" fill="white" fontSize="8" fontWeight="600">Old Home</text>
        </g>

        {/* End label: Your New Home */}
        <g transform="translate(760, 170)">
          <rect x="-30" y="2" width="60" height="18" rx="4" fill={ORANGE} opacity={0.9} />
          <text x="0" y="15" textAnchor="middle" fill="white" fontSize="8" fontWeight="600">New Home</text>
        </g>

        {/* House icon at start */}
        <g transform="translate(25, 118)">
          <path d="M0,12 L8,4 L16,12 L16,22 L0,22 Z" fill={BROWN} opacity={0.6} />
          <path d="M0,12 L8,4 L16,12" stroke={ORANGE_LIGHT} strokeWidth="1.5" fill="none" />
        </g>

        {/* House icon at end */}
        <g transform="translate(750, 118)">
          <path d="M0,12 L8,4 L16,12 L16,22 L0,22 Z" fill={ORANGE} opacity={0.7} />
          <path d="M0,12 L8,4 L16,12" stroke={ORANGE_LIGHT} strokeWidth="1.5" fill="none" />
          <rect x="5" y="15" width="6" height="7" fill={ORANGE_LIGHT} opacity={0.5} />
        </g>

        {/* Moving Truck */}
        <g transform={`translate(${truckPos.x - 20}, ${truckPos.y - 28})`}>
          {/* Truck glow */}
          <ellipse cx="20" cy="30" rx="22" ry="10" fill={ORANGE} opacity={0.2} />
          {/* Truck body (cargo box) */}
          <rect x="0" y="4" width="28" height="18" rx="3" fill={ORANGE} />
          <rect x="2" y="6" width="24" height="14" rx="2" fill={BROWN} opacity={0.3} />
          {/* Cab */}
          <path d="M28,8 L38,8 L40,16 L40,22 L28,22 Z" fill={ORANGE_LIGHT} />
          {/* Windshield */}
          <path d="M30,10 L36,10 L38,16 L30,16 Z" fill="#222" opacity={0.6} />
          {/* Wheels */}
          <circle cx="10" cy="24" r="4" fill="#333" stroke={ORANGE_LIGHT} strokeWidth="1.5" />
          <circle cx="35" cy="24" r="4" fill="#333" stroke={ORANGE_LIGHT} strokeWidth="1.5" />
          {/* Headlight */}
          <rect x="39" y="14" width="2" height="4" rx="1" fill="#fbbf24" />
        </g>
      </svg>
    </div>
  );
}

/* ───────────────────────── DATA ───────────────────────── */
const PHONE = "(206) 555-8274";
const ADDRESS = "4821 Rainier Ave S, Seattle, WA 98118";
const MAPS_LINK = `https://maps.google.com/?q=${encodeURIComponent(ADDRESS)}`;

const services = [
  { title: "Local Moving", description: "Efficient same-city relocations across the greater Seattle area. Our trained crews ensure everything arrives safely at your new home, on time and within budget.", icon: House },
  { title: "Long-Distance Moving", description: "Cross-state and nationwide moves with GPS tracking, dedicated trucks, and guaranteed delivery windows. We handle the logistics so you can focus on your fresh start.", icon: Path },
  { title: "Packing Services", description: "Professional packing with premium materials. From fragile china to bulky furniture, our expert packers protect every item with custom wrapping and labeled inventory systems.", icon: Package },
  { title: "Storage Solutions", description: "Climate-controlled, secure storage facilities in Seattle for short or long-term needs. Perfect for staged moves, renovations, or downsizing with flexible month-to-month plans.", icon: Warehouse },
  { title: "Office Moving", description: "Office and business relocations with minimal downtime. We work after hours and weekends to keep your business running while we handle the heavy lifting.", icon: Buildings },
  { title: "Senior Moving", description: "Compassionate, patient moving services designed for seniors. We handle downsizing, estate moves, and assisted living transitions with extra care and empathy.", icon: Heart },
];

const stats = [
  { value: "12,000+", label: "Moves Completed" },
  { value: "4.9", label: "Star Rating" },
  { value: "98%", label: "On-Time Delivery" },
  { value: "18+", label: "Years in Seattle" },
];

const processSteps = [
  { step: "01", title: "Free Quote", description: "We visit your home or do a virtual walkthrough. You get a detailed, binding estimate with zero hidden fees.", icon: CalendarCheck },
  { step: "02", title: "Pack & Prep", description: "Our team arrives with premium materials. Every item is wrapped, labeled, and inventoried for a seamless transition.", icon: Package },
  { step: "03", title: "Load & Protect", description: "Trained movers use blankets, straps, and custom crating. Your furniture and valuables are secured for the journey.", icon: Truck },
  { step: "04", title: "Transport", description: "GPS-tracked trucks take the safest route. You follow along in real time from your phone.", icon: NavigationArrow },
  { step: "05", title: "Unload & Settle", description: "We unpack, assemble furniture, and place everything exactly where you want it. Walk into your new home ready to live.", icon: House },
];

const testimonials = [
  { name: "Sarah W.", origin: "Ballard", destination: "Capitol Hill", moveType: "2BR Apartment", hours: "4 hours", text: "Ryan and his crew were incredible. They wrapped every piece of furniture, labeled every box, and finished an hour ahead of schedule. Not a single scratch on our hardwood floors.", rating: 5 },
  { name: "Marcus J.", origin: "Queen Anne", destination: "Bellevue", moveType: "3BR House", hours: "7 hours", text: "We had a piano, a pool table, and a 200-gallon fish tank. Cascade Movers handled all three without breaking a sweat. These guys are the real deal.", rating: 5 },
  { name: "Linda & Tom P.", origin: "Fremont", destination: "Kirkland", moveType: "4BR House", hours: "Full day", text: "After two bad experiences with other movers, Cascade restored our faith. Ryan personally oversaw the move and his team treated our antiques like museum pieces.", rating: 5 },
  { name: "David K.", origin: "Pioneer Square", destination: "Tacoma", moveType: "Studio", hours: "2.5 hours", text: "Moved my entire studio for less than I expected. The crew was fast, friendly, and careful with my music equipment. Would recommend to anyone.", rating: 5 },
  { name: "Aisha M.", origin: "Columbia City", destination: "West Seattle", moveType: "1BR Apartment", hours: "3 hours", text: "Booked them for a last-minute move and they showed up on time with a smile. Everything was handled with care. Ryan even called to follow up the next day.", rating: 5 },
];

const faqs = [
  { q: "How far in advance should I book?", a: "We recommend booking 2-4 weeks ahead for local Seattle moves and 4-8 weeks for long-distance. Peak season (May-September) fills up fast, so earlier is better." },
  { q: "Are my belongings insured during the move?", a: "Yes. Every move includes basic valuation coverage at no extra cost. We also offer full replacement value protection for complete peace of mind." },
  { q: "Do you disassemble and reassemble furniture?", a: "Absolutely. Our crews bring all necessary tools and hardware. We disassemble at origin and reassemble at destination at no additional charge." },
  { q: "What items can you not move?", a: "For safety and legal reasons, we cannot transport hazardous materials, perishable foods, or live plants across state lines. We provide a complete list during your estimate." },
  { q: "How do you handle fragile or valuable items?", a: "Specialty items receive custom crating, padding, and white-glove handling. We use climate-controlled trucks for art, antiques, and electronics." },
  { q: "Do you offer military or senior discounts?", a: "Yes. We offer 10% off for active military, veterans, and seniors 65+. Mention your discount when requesting your free quote." },
];

const comparisonRows = [
  { feature: "Transparent Pricing", us: true, them: "Hidden fees" },
  { feature: "Background-Checked Crews", us: true, them: "Varies" },
  { feature: "GPS Real-Time Tracking", us: true, them: "No" },
  { feature: "Damage-Free Guarantee", us: true, them: "Sometimes" },
  { feature: "Same-Day Estimates", us: true, them: "3-5 days" },
  { feature: "No Surprise Charges", us: true, them: "Common" },
  { feature: "Senior Moving Specialists", us: true, them: "No" },
];

const serviceAreas = [
  "Downtown Seattle", "Capitol Hill", "Ballard", "Fremont",
  "Queen Anne", "West Seattle", "Bellevue", "Kirkland",
  "Redmond", "Tacoma", "Everett", "Renton",
];

/* Cost estimator data */
const homeSizes = [
  { label: "Studio", rooms: "Studio", baseLocal: 299, baseLong: 1499 },
  { label: "1 Bedroom", rooms: "1BR", baseLocal: 449, baseLong: 2199 },
  { label: "2 Bedrooms", rooms: "2BR", baseLocal: 649, baseLong: 3499 },
  { label: "3 Bedrooms", rooms: "3BR", baseLocal: 899, baseLong: 4799 },
  { label: "4+ Bedrooms", rooms: "4BR+", baseLocal: 1299, baseLong: 6499 },
];

const addOns = [
  { id: "packing", label: "Full Packing Service", price: 350 },
  { id: "storage", label: "1 Month Storage", price: 199 },
  { id: "piano", label: "Piano Moving", price: 275 },
];

/* Truck size quiz data */
const truckQuizQuestions = [
  {
    question: "How big is your current home?",
    options: [
      { label: "Studio / 1BR", value: "small" },
      { label: "2-3 Bedrooms", value: "medium" },
      { label: "4+ Bedrooms", value: "large" },
    ],
  },
  {
    question: "How much large furniture do you have?",
    options: [
      { label: "Minimal (bed, desk, couch)", value: "small" },
      { label: "Moderate (dining set, bookshelves, dressers)", value: "medium" },
      { label: "A lot (piano, pool table, multiple sets)", value: "large" },
    ],
  },
  {
    question: "Do you have a garage, shed, or storage unit to move?",
    options: [
      { label: "No extra storage", value: "small" },
      { label: "Small garage or closet unit", value: "medium" },
      { label: "Full garage, shed, or storage unit", value: "large" },
    ],
  },
];

const truckResults: Record<string, { truck: string; length: string; description: string }> = {
  small: { truck: "Cargo Van", length: "12 ft", description: "Perfect for studios and small 1BR apartments. Fits a bed, desk, small couch, and about 20 boxes." },
  medium: { truck: "Standard Moving Truck", length: "20 ft", description: "Ideal for 2-3BR homes. Fits a full living room, bedroom sets, dining table, and 40-60 boxes." },
  large: { truck: "Full-Size Semi", length: "26 ft", description: "Built for 4BR+ homes with garages. Fits everything including oversized items, outdoor furniture, and 80+ boxes." },
};

/* Moving day countdown milestones */
const milestones = [
  { weeks: 8, label: "8 Weeks Before", tasks: ["Research and book your moving company", "Start decluttering room by room", "Create a moving binder or folder for documents"] },
  { weeks: 4, label: "4 Weeks Before", tasks: ["Begin packing non-essential items", "Notify utilities, banks, and subscriptions of address change", "Order packing supplies if self-packing"] },
  { weeks: 2, label: "2 Weeks Before", tasks: ["Confirm moving date and crew details", "Pack most rooms, leaving only daily essentials", "Transfer prescriptions and medical records"] },
  { weeks: 1, label: "1 Week Before", tasks: ["Finish packing everything except essentials box", "Defrost freezer and prep appliances", "Take photos of electronics before disconnecting"] },
  { weeks: 0, label: "Moving Day", tasks: ["Do a final walkthrough of your old home", "Keep essentials bag accessible (phone charger, snacks, documents)", "Meet the crew and walk through placement instructions"] },
];

/* ═══════════════════════════════════════════════════════════════════
   INTERACTIVE: COST ESTIMATOR
   ═══════════════════════════════════════════════════════════════════ */
function CostEstimator() {
  const [sizeIdx, setSizeIdx] = useState(2);
  const [isLongDistance, setIsLongDistance] = useState(false);
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);

  const toggleAddOn = (id: string) => {
    setSelectedAddOns((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const base = isLongDistance ? homeSizes[sizeIdx].baseLong : homeSizes[sizeIdx].baseLocal;
  const addOnTotal = selectedAddOns.reduce((sum, id) => {
    const a = addOns.find((ao) => ao.id === id);
    return sum + (a ? a.price : 0);
  }, 0);
  const total = base + addOnTotal;

  return (
    <GlassCard className="p-6 md:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: ORANGE_GLOW }}>
          <Calculator size={22} weight="duotone" style={{ color: ORANGE }} />
        </div>
        <h3 className="text-xl font-bold text-white">Moving Cost Estimator</h3>
      </div>

      {/* Home size */}
      <p className="text-sm text-slate-400 mb-3 font-medium">Home Size</p>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-6">
        {homeSizes.map((hs, i) => (
          <button key={i} onClick={() => setSizeIdx(i)} className={`px-3 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${sizeIdx === i ? "text-white" : "text-slate-400 border border-white/15 hover:border-white/20"}`} style={sizeIdx === i ? { background: ORANGE } : {}}>
            {hs.rooms}
          </button>
        ))}
      </div>

      {/* Distance toggle */}
      <p className="text-sm text-slate-400 mb-3 font-medium">Distance</p>
      <div className="flex gap-2 mb-6">
        {[false, true].map((ld) => (
          <button key={String(ld)} onClick={() => setIsLongDistance(ld)} className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${isLongDistance === ld ? "text-white" : "text-slate-400 border border-white/15"}`} style={isLongDistance === ld ? { background: ORANGE } : {}}>
            {ld ? "Long-Distance" : "Local (Seattle)"}
          </button>
        ))}
      </div>

      {/* Add-ons */}
      <p className="text-sm text-slate-400 mb-3 font-medium">Add-Ons</p>
      <div className="space-y-2 mb-8">
        {addOns.map((a) => {
          const selected = selectedAddOns.includes(a.id);
          return (
            <button key={a.id} onClick={() => toggleAddOn(a.id)} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-all cursor-pointer ${selected ? "border-2 text-white" : "border border-white/15 text-slate-400 hover:border-white/20"}`} style={selected ? { borderColor: ORANGE, background: "rgba(249,115,22,0.08)" } : {}}>
              <span className="flex items-center gap-2">
                {selected ? <CheckCircle size={18} weight="fill" style={{ color: ORANGE }} /> : <div className="w-[18px] h-[18px] rounded-full border border-white/20" />}
                {a.label}
              </span>
              <span className="font-semibold" style={{ color: selected ? ORANGE : SLATE_LIGHT }}>+${a.price}</span>
            </button>
          );
        })}
      </div>

      {/* Total */}
      <div className="rounded-xl p-5 text-center" style={{ background: "rgba(249,115,22,0.1)", border: `1px solid ${ORANGE}33` }}>
        <p className="text-sm text-slate-400 mb-1">Estimated Total</p>
        <p className="text-4xl font-bold text-white">${total.toLocaleString()}</p>
        <p className="text-xs text-slate-500 mt-2">Final price confirmed after free in-home estimate</p>
      </div>
    </GlassCard>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   INTERACTIVE: MOVING DAY COUNTDOWN
   ═══════════════════════════════════════════════════════════════════ */
function MovingCountdown() {
  const [moveDate, setMoveDate] = useState("");
  const [daysLeft, setDaysLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!moveDate) { setDaysLeft(null); return; }
    const diff = Math.ceil((new Date(moveDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    setDaysLeft(diff >= 0 ? diff : 0);
  }, [moveDate]);

  const currentMilestoneIdx = daysLeft !== null
    ? milestones.findIndex((m) => daysLeft >= m.weeks * 7)
    : -1;

  return (
    <GlassCard className="p-6 md:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: ORANGE_GLOW }}>
          <Timer size={22} weight="duotone" style={{ color: ORANGE }} />
        </div>
        <h3 className="text-xl font-bold text-white">Moving Day Countdown</h3>
      </div>

      <label className="block text-sm text-slate-400 mb-2 font-medium">When is your move date?</label>
      <input
        type="date"
        value={moveDate}
        onChange={(e) => setMoveDate(e.target.value)}
        className="w-full px-4 py-3 rounded-xl border border-white/15 bg-white/[0.07] text-white text-sm mb-6 focus:outline-none focus:border-orange-500 transition-colors"
        style={{ colorScheme: "dark" }}
      />

      {daysLeft !== null && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={spring}>
          <div className="text-center mb-6 p-4 rounded-xl" style={{ background: "rgba(249,115,22,0.1)", border: `1px solid ${ORANGE}33` }}>
            <p className="text-4xl font-bold" style={{ color: ORANGE }}>{daysLeft}</p>
            <p className="text-sm text-slate-400">days until your move</p>
          </div>

          <div className="space-y-4">
            {milestones.map((m, i) => {
              const active = currentMilestoneIdx === i;
              const past = daysLeft !== null && daysLeft < m.weeks * 7;
              return (
                <div key={i} className={`rounded-xl p-4 transition-all ${active ? "border-2" : "border border-white/15"}`} style={active ? { borderColor: ORANGE, background: "rgba(249,115,22,0.06)" } : {}}>
                  <div className="flex items-center gap-2 mb-2">
                    {past ? <CheckCircle size={18} weight="fill" style={{ color: ORANGE }} /> : active ? <Lightning size={18} weight="fill" style={{ color: ORANGE }} /> : <Clock size={18} weight="duotone" className="text-slate-500" />}
                    <span className={`text-sm font-semibold ${active ? "text-white" : past ? "text-slate-500 line-through" : "text-slate-400"}`}>{m.label}</span>
                  </div>
                  <ul className="space-y-1 ml-6">
                    {m.tasks.map((t, j) => (
                      <li key={j} className={`text-xs ${past ? "text-slate-600 line-through" : "text-slate-400"} flex items-start gap-2`}>
                        <span className="mt-1.5 w-1 h-1 rounded-full shrink-0" style={{ background: active ? ORANGE : "#555" }} />
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </GlassCard>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   INTERACTIVE: TRUCK SIZE QUIZ
   ═══════════════════════════════════════════════════════════════════ */
function TruckSizeQuiz() {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [result, setResult] = useState<string | null>(null);

  const handleAnswer = (value: string) => {
    const newAnswers = [...answers, value];
    setAnswers(newAnswers);
    if (newAnswers.length === truckQuizQuestions.length) {
      const counts: Record<string, number> = { small: 0, medium: 0, large: 0 };
      newAnswers.forEach((a) => { counts[a]++; });
      const winner = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
      setResult(winner);
    } else {
      setCurrentQ(currentQ + 1);
    }
  };

  const reset = () => {
    setCurrentQ(0);
    setAnswers([]);
    setResult(null);
  };

  const truckInfo = result ? truckResults[result] : null;

  return (
    <GlassCard className="p-6 md:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: ORANGE_GLOW }}>
          <Truck size={22} weight="duotone" style={{ color: ORANGE }} />
        </div>
        <h3 className="text-xl font-bold text-white">What Size Truck Do You Need?</h3>
      </div>

      {!result ? (
        <AnimatePresence mode="wait">
          <motion.div key={currentQ} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={spring}>
            <p className="text-xs text-slate-500 mb-2">Question {currentQ + 1} of {truckQuizQuestions.length}</p>
            <p className="text-white font-semibold mb-4">{truckQuizQuestions[currentQ].question}</p>
            <div className="space-y-2">
              {truckQuizQuestions[currentQ].options.map((opt) => (
                <button key={opt.value} onClick={() => handleAnswer(opt.value)} className="w-full text-left px-4 py-3 rounded-xl border border-white/15 text-sm text-slate-300 hover:border-orange-500/50 hover:bg-white/[0.08] transition-all cursor-pointer flex items-center justify-between group">
                  {opt.label}
                  <CaretRight size={16} className="text-slate-600 group-hover:text-orange-400 transition-colors" />
                </button>
              ))}
            </div>
            {/* Progress bar */}
            <div className="mt-4 h-1 rounded-full bg-white/10 overflow-hidden">
              <motion.div className="h-full rounded-full" style={{ background: ORANGE }} initial={{ width: 0 }} animate={{ width: `${((currentQ) / truckQuizQuestions.length) * 100}%` }} transition={spring} />
            </div>
          </motion.div>
        </AnimatePresence>
      ) : truckInfo && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={spring}>
          <div className="text-center p-6 rounded-xl mb-4" style={{ background: "rgba(249,115,22,0.1)", border: `1px solid ${ORANGE}33` }}>
            {/* Truck visual */}
            <svg viewBox="0 0 200 80" className="w-40 h-20 mx-auto mb-3" fill="none">
              <rect x="10" y="15" width={result === "large" ? 120 : result === "medium" ? 90 : 60} height="35" rx="4" fill={ORANGE} opacity={0.8} />
              <path d={`M${result === "large" ? 130 : result === "medium" ? 100 : 70},25 L${result === "large" ? 160 : result === "medium" ? 130 : 100},25 L${result === "large" ? 170 : result === "medium" ? 140 : 110},40 L${result === "large" ? 170 : result === "medium" ? 140 : 110},50 L${result === "large" ? 130 : result === "medium" ? 100 : 70},50 Z`} fill={ORANGE_LIGHT} />
              <circle cx="35" cy="55" r="7" fill="#333" stroke={ORANGE_LIGHT} strokeWidth="2" />
              <circle cx={result === "large" ? 150 : result === "medium" ? 120 : 90} cy="55" r="7" fill="#333" stroke={ORANGE_LIGHT} strokeWidth="2" />
            </svg>
            <p className="text-2xl font-bold text-white">{truckInfo.truck}</p>
            <p className="text-sm font-semibold" style={{ color: ORANGE }}>{truckInfo.length}</p>
          </div>
          <p className="text-sm text-slate-400 text-center mb-4">{truckInfo.description}</p>
          <div className="flex gap-3">
            <button onClick={reset} className="flex-1 py-2.5 rounded-xl border border-white/15 text-sm text-slate-400 hover:text-white transition-colors cursor-pointer">Retake Quiz</button>
            <a href={`tel:${PHONE.replace(/[^\d]/g, "")}`} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white text-center transition-colors" style={{ background: ORANGE }}>Book This Truck</a>
          </div>
        </motion.div>
      )}
    </GlassCard>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════════ */
export default function V2MovingPage() {
  const [openService, setOpenService] = useState<number | null>(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [contactForm, setContactForm] = useState({ name: "", phone: "", email: "", moveDate: "", details: "" });

  const navLinks = [
    { label: "Services", href: "#services" },
    { label: "About", href: "#about" },
    { label: "Estimator", href: "#estimator" },
    { label: "Process", href: "#process" },
    { label: "Reviews", href: "#testimonials" },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden" style={{ background: BG, color: "#f1f5f9" }}>
      <FloatingParticles />

      {/* ─── NAV ─── */}
      <motion.nav initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-4">
          <GlassCard className="flex items-center justify-between px-4 md:px-6 py-3">
            <div className="flex items-center gap-2">
              <Truck size={24} weight="duotone" style={{ color: ORANGE }} />
              <span className="text-lg font-bold tracking-tight text-white">Cascade Movers</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
              {navLinks.map((link) => (
                <a key={link.label} href={link.href} className="hover:text-white transition-colors">{link.label}</a>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <MagneticButton href={`tel:${PHONE.replace(/[^\d]/g, "")}`} className="px-4 md:px-5 py-2 rounded-full text-sm font-semibold text-white transition-colors" style={{ background: ORANGE }}>
                <span className="hidden sm:inline">Get Quote</span>
                <span className="sm:hidden"><Phone size={16} weight="bold" /></span>
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
                  {navLinks.map((link) => (
                    <a key={link.label} href={link.href} onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors">{link.label}</a>
                  ))}
                  <a href={`tel:${PHONE.replace(/[^\d]/g, "")}`} className="block px-4 py-3 rounded-lg text-sm font-semibold mt-2" style={{ color: ORANGE }}>{PHONE}</a>
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.nav>

      {/* ─── HERO: Moving Truck Journey ─── */}
      <section className="relative min-h-[100dvh] flex flex-col items-center justify-center pt-28 pb-12 z-10">
        <div className="absolute inset-0 z-0" style={{ background: `radial-gradient(ellipse at 50% 30%, rgba(249,115,22,0.08) 0%, transparent 60%)` }} />
        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6 w-full text-center mb-8">
          <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.1 }} className="text-sm uppercase tracking-widest mb-4" style={{ color: ORANGE }}>
            Seattle&apos;s Most Trusted Moving Company
          </motion.p>
          <h1 className="text-4xl md:text-7xl tracking-tighter leading-none font-bold text-white mb-6" style={{ textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>
            <WordReveal text="Your Move, Our Mission" />
          </h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.6 }} className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed mb-8">
            From your first box to your last, Cascade Movers handles every detail with care and precision. Local or long-distance across the Pacific Northwest.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.8 }} className="flex flex-wrap justify-center gap-4 mb-8">
            <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white flex items-center gap-2 cursor-pointer" style={{ background: ORANGE }}>
              Get Free Estimate <ArrowRight size={18} weight="bold" />
            </MagneticButton>
            <MagneticButton href={`tel:${PHONE.replace(/[^\d]/g, "")}`} className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/15 flex items-center gap-2 cursor-pointer">
              <Phone size={18} weight="duotone" /> {PHONE}
            </MagneticButton>
          </motion.div>
        </div>

        {/* Animated truck journey */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ ...springGentle, delay: 1 }} className="relative z-10 w-full px-4 md:px-6">
          <MovingTruckJourney />
        </motion.div>

        {/* Trust pills */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ ...spring, delay: 1.2 }} className="flex flex-wrap justify-center gap-3 mt-8 px-4">
          {[
            { icon: ShieldCheck, text: "Licensed & Insured" },
            { icon: Star, text: "4.9-Star Rated" },
            { icon: SealCheck, text: "BBB Accredited" },
            { icon: Users, text: "Background-Checked Crews" },
          ].map((badge, i) => (
            <span key={i} className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold border border-white/15 bg-white/[0.07] text-slate-300">
              <badge.icon size={14} weight="duotone" style={{ color: ORANGE }} />
              {badge.text}
            </span>
          ))}
        </motion.div>
      </section>

      {/* ─── TRUST BAR / STATS ─── */}
      <SectionReveal className="relative z-10 pb-8">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <GlassCard className="p-6 md:p-8">
            <motion.div className="grid grid-cols-2 sm:grid-cols-4 gap-6 md:gap-8" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
              {stats.map((s, i) => (
                <motion.div key={i} variants={fadeUp} className="text-center">
                  <p className="text-3xl md:text-4xl font-bold tracking-tight" style={{ color: ORANGE }}>{s.value}</p>
                  <p className="text-sm text-slate-400 mt-1">{s.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </GlassCard>
        </div>
      </SectionReveal>

      {/* ─── SERVICES ─── */}
      <SectionReveal id="services" className="relative z-10 py-16 md:py-24">
        <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at 80% 50%, rgba(249,115,22,0.05) 0%, transparent 50%)` }} />
        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            <div className="lg:sticky lg:top-32">
              <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ORANGE }}>Our Services</p>
              <h2 className="text-3xl md:text-6xl tracking-tighter leading-none font-bold text-white mb-6">
                <WordReveal text="Full-Service Moving Solutions" />
              </h2>
              <p className="text-slate-400 leading-relaxed max-w-md mb-6">Whether you are moving across Seattle or across the country, our trained professionals handle every aspect of your relocation with precision and care.</p>
              <div className="flex flex-wrap gap-3">
                {["Bonded", "Insured", "Licensed", "DOT Certified"].map((badge) => (
                  <span key={badge} className="px-3 py-1.5 rounded-full text-xs font-semibold border border-orange-500/30 text-orange-300" style={{ background: "rgba(249,115,22,0.08)" }}>{badge}</span>
                ))}
              </div>
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

      {/* ─── ABOUT RYAN TORRES ─── */}
      <SectionReveal id="about" className="relative z-10 py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, rgba(146,64,14,0.08) 0%, transparent 50%, rgba(249,115,22,0.05) 100%)` }} />
        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ORANGE }}>About Cascade Movers</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white mb-6">
              <WordReveal text="Built on Trust, One Move at a Time" />
            </h2>
            <p className="text-slate-400 leading-relaxed mb-4">
              Ryan Torres founded Cascade Movers in 2008 with a single truck and a simple belief: every family deserves a stress-free move. Born and raised in Seattle, Ryan spent his early career in logistics before realizing that the moving industry was broken by hidden fees, damaged belongings, and no-show crews.
            </p>
            <p className="text-slate-400 leading-relaxed mb-4">
              Today, Cascade Movers operates a fleet of 30+ trucks across the Pacific Northwest. Every crew member is background-checked, drug-tested, and trained in Ryan&apos;s signature &ldquo;white-glove&rdquo; method. The result? Over 12,000 successful moves and a 4.9-star rating that speaks for itself.
            </p>
            <p className="text-slate-400 leading-relaxed">
              &ldquo;A move is one of the most stressful days in someone&apos;s life,&rdquo; Ryan says. &ldquo;Our job is to turn it into one of the easiest.&rdquo;
            </p>
          </div>
          <motion.div className="grid grid-cols-2 gap-4" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
            {[
              { icon: ShieldCheck, label: "Fully Insured", desc: "Complete coverage on every move" },
              { icon: Users, label: "30+ Crew Members", desc: "Background-checked pros" },
              { icon: Truck, label: "30+ Trucks", desc: "Modern GPS-tracked fleet" },
              { icon: Handshake, label: "No Hidden Fees", desc: "Binding estimates, period" },
              { icon: Medal, label: "BBB A+ Rated", desc: "Accredited since 2012" },
              { icon: Heart, label: "Community First", desc: "Free moves for veterans annually" },
            ].map((item, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="p-5 text-center">
                  <item.icon size={28} weight="duotone" style={{ color: ORANGE }} className="mx-auto mb-2" />
                  <p className="text-sm font-semibold text-white">{item.label}</p>
                  <p className="text-xs text-slate-400 mt-1">{item.desc}</p>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── COST ESTIMATOR + COUNTDOWN + TRUCK QUIZ ─── */}
      <SectionReveal id="estimator" className="relative z-10 py-16 md:py-24">
        <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at 20% 50%, rgba(249,115,22,0.06) 0%, transparent 50%)` }} />
        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ORANGE }}>Plan Your Move</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Interactive Moving Tools" />
            </h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <CostEstimator />
            <MovingCountdown />
            <TruckSizeQuiz />
          </div>
        </div>
      </SectionReveal>

      {/* ─── PROCESS (5 Steps) ─── */}
      <SectionReveal id="process" className="relative z-10 py-16 md:py-24">
        <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at 50% 0%, rgba(146,64,14,0.08) 0%, transparent 50%)` }} />
        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ORANGE }}>How It Works</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Quote, Pack, Load, Transport, Unload" />
            </h2>
          </div>
          <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {processSteps.map((p, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="p-6 h-full relative overflow-hidden">
                  <div className="absolute top-4 right-4 text-5xl font-black opacity-5 text-white">{p.step}</div>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: ORANGE_GLOW }}>
                    <p.icon size={24} weight="duotone" style={{ color: ORANGE }} />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{p.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{p.description}</p>
                  {i < processSteps.length - 1 && (
                    <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                      <ArrowRight size={20} style={{ color: ORANGE }} className="opacity-40" />
                    </div>
                  )}
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── TESTIMONIALS: Move Summary Cards ─── */}
      <SectionReveal id="testimonials" className="relative z-10 py-16 md:py-24">
        <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at 70% 50%, rgba(249,115,22,0.05) 0%, transparent 50%)` }} />
        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-6">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ORANGE }}>Customer Stories</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white mb-4">
              <WordReveal text="Real Moves, Real Reviews" />
            </h2>
          </div>

          {/* Google Reviews Header */}
          <div className="flex items-center justify-center gap-3 mb-12">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={20} weight="fill" style={{ color: ORANGE }} />
              ))}
            </div>
            <span className="text-white font-semibold">4.9</span>
            <span className="text-slate-400 text-sm">based on 340+ Google reviews</span>
          </div>

          <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {testimonials.map((t, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="p-6 h-full flex flex-col">
                  {/* Move summary header */}
                  <div className="flex items-center gap-2 mb-3 pb-3 border-b border-white/15">
                    <NavigationArrow size={16} weight="fill" style={{ color: ORANGE }} />
                    <span className="text-xs font-semibold" style={{ color: ORANGE }}>{t.origin}</span>
                    <ArrowRight size={12} className="text-slate-500" />
                    <span className="text-xs font-semibold" style={{ color: ORANGE_LIGHT }}>{t.destination}</span>
                    <span className="ml-auto text-xs text-slate-500 bg-white/[0.06] px-2 py-0.5 rounded-full">{t.moveType}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <Clock size={12} className="text-slate-500" />
                    <span className="text-xs text-slate-500">Completed in {t.hours}</span>
                  </div>
                  <Quotes size={24} weight="fill" style={{ color: ORANGE }} className="mb-2 opacity-40" />
                  <p className="text-slate-300 leading-relaxed flex-1 text-sm">{t.text}</p>
                  <div className="mt-4 pt-4 border-t border-white/8 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">{t.name}</span>
                      <SealCheck size={14} weight="fill" style={{ color: ORANGE }} />
                    </div>
                    <div className="flex gap-0.5">{Array.from({ length: t.rating }).map((_, j) => (<Star key={j} size={12} weight="fill" style={{ color: ORANGE }} />))}</div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── WHY CHOOSE US (Comparison Table) ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at 30% 50%, rgba(146,64,14,0.06) 0%, transparent 50%)` }} />
        <div className="relative z-10 mx-auto max-w-4xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ORANGE }}>The Cascade Difference</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Cascade vs. Typical Movers" />
            </h2>
          </div>
          <GlassCard className="overflow-hidden overflow-x-auto">
            <div className="grid min-w-[440px] grid-cols-3 text-sm font-semibold border-b border-white/15">
              <div className="p-4 text-slate-400">Feature</div>
              <div className="p-4 text-center" style={{ color: ORANGE }}>Cascade Movers</div>
              <div className="p-4 text-center text-slate-500">Typical Movers</div>
            </div>
            {comparisonRows.map((row, i) => (
              <div key={i} className={`grid min-w-[440px] grid-cols-3 text-sm ${i < comparisonRows.length - 1 ? "border-b border-white/8" : ""}`}>
                <div className="p-4 text-slate-300">{row.feature}</div>
                <div className="p-4 text-center">
                  <CheckCircle size={20} weight="fill" style={{ color: "#22c55e" }} className="mx-auto" />
                </div>
                <div className="p-4 text-center text-slate-500 text-xs">{row.them}</div>
              </div>
            ))}
          </GlassCard>
        </div>
      </SectionReveal>

      {/* ─── PRICING TRANSPARENCY ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at 60% 30%, rgba(249,115,22,0.06) 0%, transparent 50%)` }} />
        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ORANGE }}>Transparent Pricing</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white mb-4">
              <WordReveal text="No Hidden Fees. Ever." />
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">Every estimate is binding. The price we quote is the price you pay. No surprise charges on moving day.</p>
          </div>
          <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
            {[
              { title: "Studio / 1BR", price: "$349", subtitle: "Starting at", features: ["2 movers, 3 hours", "Blankets & straps included", "Disassembly & reassembly", "Local Seattle area"] },
              { title: "2-3 Bedroom", price: "$599", subtitle: "Starting at", features: ["3 movers, 5 hours", "Full furniture protection", "Loading & unloading", "GPS tracking included"], featured: true },
              { title: "4BR+ / House", price: "$999", subtitle: "Starting at", features: ["4+ movers, full day", "Custom crating available", "Specialty item handling", "Multi-stop capability"] },
            ].map((tier, i) => (
              <motion.div key={i} variants={fadeUp}>
                {tier.featured ? (
                  <ShimmerBorder>
                    <div className="p-6 md:p-8">
                      <div className="text-center mb-6">
                        <span className="text-xs uppercase tracking-wider font-semibold px-3 py-1 rounded-full mb-3 inline-block" style={{ background: ORANGE, color: "white" }}>Most Popular</span>
                        <p className="text-xs text-slate-400 mt-3">{tier.subtitle}</p>
                        <p className="text-4xl font-bold text-white mt-1">{tier.price}</p>
                        <p className="text-lg font-semibold text-white mt-1">{tier.title}</p>
                      </div>
                      <ul className="space-y-3 mb-6">
                        {tier.features.map((f, j) => (
                          <li key={j} className="flex items-center gap-2 text-sm text-slate-300">
                            <CheckCircle size={16} weight="fill" style={{ color: ORANGE }} />
                            {f}
                          </li>
                        ))}
                      </ul>
                      <a href={`tel:${PHONE.replace(/[^\d]/g, "")}`} className="block w-full py-3 rounded-xl text-center text-sm font-semibold text-white transition-colors" style={{ background: ORANGE }}>Get This Quote</a>
                    </div>
                  </ShimmerBorder>
                ) : (
                  <GlassCard className="p-6 md:p-8 h-full flex flex-col">
                    <div className="text-center mb-6">
                      <p className="text-xs text-slate-400">{tier.subtitle}</p>
                      <p className="text-4xl font-bold text-white mt-1">{tier.price}</p>
                      <p className="text-lg font-semibold text-white mt-1">{tier.title}</p>
                    </div>
                    <ul className="space-y-3 mb-6 flex-1">
                      {tier.features.map((f, j) => (
                        <li key={j} className="flex items-center gap-2 text-sm text-slate-300">
                          <CheckCircle size={16} weight="fill" style={{ color: ORANGE }} />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <a href={`tel:${PHONE.replace(/[^\d]/g, "")}`} className="block w-full py-3 rounded-xl text-center text-sm font-semibold text-white border border-white/15 hover:border-white/20 transition-colors">Get This Quote</a>
                  </GlassCard>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── FAQ ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ORANGE }}>Common Questions</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Frequently Asked Questions" />
            </h2>
          </div>
          <motion.div className="space-y-3" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {faqs.map((faq, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="overflow-hidden">
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-5 md:p-6 text-left cursor-pointer">
                    <span className="text-lg font-semibold text-white pr-4">{faq.q}</span>
                    <motion.div animate={{ rotate: openFaq === i ? 180 : 0 }} transition={spring}><CaretDown size={20} className="text-slate-400" /></motion.div>
                  </button>
                  <AnimatePresence initial={false}>
                    {openFaq === i && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={spring} className="overflow-hidden">
                        <p className="px-5 pb-5 md:px-6 md:pb-6 text-slate-400 leading-relaxed">{faq.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── SERVICE AREA ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at 50% 80%, rgba(249,115,22,0.05) 0%, transparent 50%)` }} />
        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ORANGE }}>Where We Serve</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white mb-4">
              <WordReveal text="Seattle & Beyond" />
            </h2>
            <p className="text-slate-400 max-w-lg mx-auto">We cover the entire Puget Sound region with dedicated crews in every major neighborhood. Long-distance moves across the Pacific Northwest and nationwide.</p>
          </div>
          <motion.div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {serviceAreas.map((area, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="p-4 text-center group hover:border-orange-500/30 transition-colors">
                  <MapPin size={20} weight="duotone" style={{ color: ORANGE }} className="mx-auto mb-2" />
                  <p className="text-sm font-semibold text-white">{area}</p>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
          {/* Pulsing availability */}
          <div className="flex items-center justify-center gap-3 mt-8">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: "#22c55e" }} />
              <span className="relative inline-flex rounded-full h-3 w-3" style={{ background: "#22c55e" }} />
            </span>
            <span className="text-sm text-slate-400">Crews available now in Seattle metro</span>
          </div>
        </div>
      </SectionReveal>

      {/* ─── CONTACT FORM ─── */}
      <SectionReveal id="contact" className="relative z-10 py-16 md:py-24">
        <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at 40% 50%, rgba(146,64,14,0.06) 0%, transparent 50%)` }} />
        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left: Info */}
            <div>
              <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ORANGE }}>Get In Touch</p>
              <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white mb-6">
                <WordReveal text="Request Your Free Quote" />
              </h2>
              <p className="text-slate-400 leading-relaxed mb-8">Tell us about your move and receive a detailed, binding estimate within 24 hours. No hidden fees, no surprises, no obligation.</p>

              <div className="space-y-4">
                <a href={`tel:${PHONE.replace(/[^\d]/g, "")}`} className="flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: ORANGE_GLOW }}>
                    <Phone size={22} weight="duotone" style={{ color: ORANGE }} />
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Call us</p>
                    <p className="text-white font-semibold group-hover:underline">{PHONE}</p>
                  </div>
                </a>
                <a href={`mailto:info@cascademovers.com`} className="flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: ORANGE_GLOW }}>
                    <Envelope size={22} weight="duotone" style={{ color: ORANGE }} />
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Email</p>
                    <p className="text-white font-semibold group-hover:underline">info@cascademovers.com</p>
                  </div>
                </a>
                <a href={MAPS_LINK} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: ORANGE_GLOW }}>
                    <MapPin size={22} weight="duotone" style={{ color: ORANGE }} />
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Visit us</p>
                    <p className="text-white font-semibold group-hover:underline">{ADDRESS}</p>
                  </div>
                </a>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: ORANGE_GLOW }}>
                    <Clock size={22} weight="duotone" style={{ color: ORANGE }} />
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Hours</p>
                    <p className="text-white font-semibold">Mon-Sat 7:00 AM - 7:00 PM</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Form */}
            <GlassCard className="p-6 md:p-8">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5 font-medium">Full Name</label>
                  <input type="text" value={contactForm.name} onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })} placeholder="Your name" className="w-full px-4 py-3 rounded-xl border border-white/15 bg-white/[0.07] text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-orange-500 transition-colors" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-1.5 font-medium">Phone</label>
                    <input type="tel" value={contactForm.phone} onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })} placeholder="(206) 555-0000" className="w-full px-4 py-3 rounded-xl border border-white/15 bg-white/[0.07] text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-orange-500 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1.5 font-medium">Email</label>
                    <input type="email" value={contactForm.email} onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })} placeholder="you@email.com" className="w-full px-4 py-3 rounded-xl border border-white/15 bg-white/[0.07] text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-orange-500 transition-colors" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5 font-medium">Preferred Move Date</label>
                  <input type="date" value={contactForm.moveDate} onChange={(e) => setContactForm({ ...contactForm, moveDate: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-white/15 bg-white/[0.07] text-white text-sm focus:outline-none focus:border-orange-500 transition-colors" style={{ colorScheme: "dark" }} />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5 font-medium">Move Details</label>
                  <textarea value={contactForm.details} onChange={(e) => setContactForm({ ...contactForm, details: e.target.value })} rows={4} placeholder="Tell us about your move: current location, destination, home size, any specialty items..." className="w-full px-4 py-3 rounded-xl border border-white/15 bg-white/[0.07] text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-orange-500 transition-colors resize-none" />
                </div>
                <MagneticButton className="w-full py-3.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 cursor-pointer" style={{ background: ORANGE }}>
                  Request Free Estimate <ArrowRight size={16} weight="bold" />
                </MagneticButton>
                <p className="text-xs text-slate-500 text-center">We respond within 2 hours during business hours.</p>
              </div>
            </GlassCard>
          </div>
        </div>
      </SectionReveal>

      {/* ─── FINAL CTA ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4 md:px-6">
          <ShimmerBorder>
            <div className="p-8 md:p-12 text-center">
              <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={spring}>
                <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ORANGE }}>Ready to Move?</p>
                <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white mb-4">Your Stress-Free Move Starts Here</h2>
                <p className="text-slate-400 text-lg mb-8 max-w-lg mx-auto">Join 12,000+ happy customers who trusted Cascade Movers with their most important day. Call Ryan&apos;s team today.</p>
                <div className="flex flex-wrap justify-center gap-4">
                  <MagneticButton className="px-10 py-4 rounded-full text-base font-semibold text-white inline-flex items-center gap-2 cursor-pointer" style={{ background: ORANGE }}>
                    <CalendarCheck size={20} weight="duotone" /> Get Free Estimate
                  </MagneticButton>
                  <MagneticButton href={`tel:${PHONE.replace(/[^\d]/g, "")}`} className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/15 inline-flex items-center gap-2 cursor-pointer">
                    <Phone size={18} weight="duotone" /> {PHONE}
                  </MagneticButton>
                </div>
              </motion.div>
            </div>
          </ShimmerBorder>
        </div>
      </SectionReveal>

      {/* ─── FOOTER ─── */}
      <footer className="relative z-10 border-t border-white/8 py-12">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Truck size={24} weight="duotone" style={{ color: ORANGE }} />
                <span className="text-lg font-bold tracking-tight text-white">Cascade Movers</span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">Seattle&apos;s most trusted moving company. Licensed, bonded, and insured. Serving the Pacific Northwest since 2008.</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-white mb-3">Services</p>
              <ul className="space-y-2 text-sm text-slate-500">
                <li>Local Moving</li>
                <li>Long-Distance Moving</li>
                <li>Packing Services</li>
                <li>Storage Solutions</li>
                <li>Office Moving</li>
                <li>Senior Moving</li>
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold text-white mb-3">Company</p>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><a href="#about" className="hover:text-white transition-colors">About Ryan Torres</a></li>
                <li><a href="#testimonials" className="hover:text-white transition-colors">Customer Reviews</a></li>
                <li><a href="#services" className="hover:text-white transition-colors">Our Services</a></li>
                <li><a href="#contact" className="hover:text-white transition-colors">Contact Us</a></li>
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold text-white mb-3">Contact</p>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><a href={`tel:${PHONE.replace(/[^\d]/g, "")}`} className="hover:text-white transition-colors">{PHONE}</a></li>
                <li><a href="mailto:info@cascademovers.com" className="hover:text-white transition-colors">info@cascademovers.com</a></li>
                <li><a href={MAPS_LINK} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">{ADDRESS}</a></li>
                <li>Mon-Sat 7 AM - 7 PM</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/8 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-600">&copy; {new Date().getFullYear()} Cascade Movers. All rights reserved.</p>
            <p className="text-xs text-slate-600 flex items-center gap-1.5"><svg width="14" height="14" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-sky-500"><path d="M24.3 4.2c-1.5-.4-3.2.1-4.5 1.1-1-.7-2.3-1-3.5-.8-2.4.4-4.2 2.5-4.2 4.9v.6c-3.2.8-6 2.8-7.8 5.6-.3.5-.1 1.1.4 1.4.5.3 1.1.1 1.4-.4 1.5-2.3 3.7-4 6.3-4.7.5-.1 1-.1 1.5 0 .8.2 1.4.8 1.7 1.5.3.8.2 1.6-.2 2.3l-2.8 4.3c-.6.9-.4 2.1.4 2.8l2.5 2.1c.4.3.8.5 1.3.5h5.2c.5 0 1-.2 1.3-.5l1.2-1c.6-.5.8-1.3.6-2l-1-3.2c-.2-.5 0-1.1.4-1.4l3.8-2.5c1.3-.9 2.1-2.3 2.1-3.9V9.6c0-2.5-1.7-4.7-4.1-5.3v-.1z" fill="currentColor"/></svg>Built by <a href="https://bluejayportfolio.com/audit" target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-400 transition-colors">BlueJays</a>{" "}— get your free site audit</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
