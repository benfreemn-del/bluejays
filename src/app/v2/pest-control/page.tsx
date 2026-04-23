"use client";

/* eslint-disable @next/next/no-img-element -- Showcase marketing page uses plain img tags intentionally. */
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
  Star,
  ShieldCheck,
  Bug,
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
  CalendarCheck,
  Warning,
  House,
  Users,
  Skull,
  Eye,
  Snowflake,
  Flower,
  ThermometerHot,
  Drop,
  Crosshair,
  Siren,
  PawPrint,
  Timer,
  CurrencyDollar,
  Buildings,
  Recycle,
  HandHeart,
  Envelope,
  Target,
  Binoculars,
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
const ORANGE = "#ea580c";
const ORANGE_LIGHT = "#fb923c";
const ORANGE_GLOW = "rgba(234, 88, 12, 0.15)";
const RED = "#ef4444";
const GREEN = "#22c55e";

/* ───────────────────────── DATA ───────────────────────── */
const SERVICES = [
  { title: "General Pest Control", desc: "Comprehensive ant, spider, cockroach, and silverfish elimination with quarterly prevention plans.", icon: Bug },
  { title: "Termite Treatment", desc: "Advanced liquid barrier and bait station systems to protect your home's structural integrity.", icon: Skull },
  { title: "Rodent Control", desc: "Humane trapping, exclusion sealing, and ongoing monitoring for mice and rats.", icon: Eye },
  { title: "Mosquito Management", desc: "Yard treatment and larvicide programs to reclaim your outdoor living spaces.", icon: Drop },
  { title: "Wildlife Removal", desc: "Safe, humane removal of raccoons, squirrels, opossums, and birds from your property.", icon: PawPrint },
  { title: "Commercial Services", desc: "Restaurant, warehouse, and office pest management with compliance documentation.", icon: Buildings },
];

const PEST_TYPES = [
  { name: "Ants", icon: Bug, color: "#f97316", danger: 2, treatment: "Liquid barrier + bait stations", prevention: "Seal cracks, remove food sources, trim vegetation from foundation.", info: "Carpenter ants can cause structural damage similar to termites. Odorous house ants are the most common PNW invader." },
  { name: "Rodents", icon: Eye, color: "#ef4444", danger: 4, treatment: "Snap traps + exclusion sealing", prevention: "Seal gaps larger than 1/4 inch, store food in containers, remove outdoor harborage.", info: "Mice can squeeze through a hole the size of a dime. They contaminate 10x more food than they eat." },
  { name: "Termites", icon: Skull, color: "#dc2626", danger: 5, treatment: "Liquid barrier + monitoring stations", prevention: "Eliminate wood-to-soil contact, fix leaks, ensure drainage away from foundation.", info: "Subterranean termites cause $5 billion in US property damage annually. Pacific dampwood termites thrive in our wet climate." },
  { name: "Wasps", icon: Warning, color: "#eab308", danger: 3, treatment: "Nest removal + perimeter spray", prevention: "Seal eaves and soffits, remove food attractants, treat early spring.", info: "Yellow jackets become aggressive in late summer. Paper wasps build under eaves and deck railings." },
  { name: "Spiders", icon: Bug, color: "#8b5cf6", danger: 2, treatment: "Web removal + residual spray", prevention: "Reduce outdoor lighting, clear clutter, seal entry points.", info: "Giant house spiders are common in PNW. Hobo spiders are often misidentified but rarely dangerous." },
  { name: "Cockroaches", icon: Bug, color: "#92400e", danger: 3, treatment: "Gel bait + growth regulator", prevention: "Fix moisture issues, deep clean kitchen, seal plumbing penetrations.", info: "German cockroaches reproduce rapidly indoors. One female can produce 300+ offspring in a year." },
  { name: "Bed Bugs", icon: Warning, color: "#be123c", danger: 4, treatment: "Heat treatment + residual spray", prevention: "Inspect second-hand furniture, use mattress encasements, vacuum frequently.", info: "Bed bugs can survive months without feeding. Heat treatment above 120F is the most effective elimination method." },
  { name: "Mosquitoes", icon: Drop, color: "#0ea5e9", danger: 2, treatment: "Larvicide + yard fogging", prevention: "Eliminate standing water, maintain gutters, use screen repairs.", info: "PNW mosquitoes are most active May through September. They breed in as little as a bottle cap of standing water." },
];

const PROCESS_STEPS = [
  { step: 1, title: "Free Inspection", desc: "Thorough assessment of your property to identify pest types, entry points, and harborage areas.", icon: Binoculars },
  { step: 2, title: "Custom Plan", desc: "Tailored treatment strategy based on your specific pest issues, property layout, and family needs.", icon: Target },
  { step: 3, title: "Safe Treatment", desc: "EPA-approved products applied by certified technicians with family and pet safety as top priority.", icon: ShieldCheck },
  { step: 4, title: "Monitor & Follow-Up", desc: "Scheduled re-inspections to ensure complete elimination and prevent re-infestation.", icon: Eye },
  { step: 5, title: "Prevention Program", desc: "Ongoing quarterly barrier treatments that stop pests before they start.", icon: CalendarCheck },
];

const TESTIMONIALS = [
  { name: "David Chen", text: "Found carpenter ants swarming in our kitchen wall. Jake's team came same day, identified the colony source in our crawlspace, and had it treated within hours. No ants since.", rating: 5, pest: "Ants", urgency: "Emergency", response: "2 hours", color: "#f97316" },
  { name: "Maria Gutierrez", text: "We had a mouse problem every fall for years. Evergreen sealed every entry point and set up monitoring. First winter with zero rodents in 8 years.", rating: 5, pest: "Rodents", urgency: "Standard", response: "Next day", color: "#ef4444" },
  { name: "Tom & Rachel W.", text: "Termite inspection before our home purchase found active damage. Jake gave us an honest assessment and treatment plan. Saved us from a costly mistake.", rating: 5, pest: "Termites", urgency: "Standard", response: "2 days", color: "#dc2626" },
  { name: "Sarah Kim", text: "Wasps built a massive nest under our deck right before a family BBQ. Called Saturday morning, Jake was there by noon. Kids could play outside again that afternoon.", rating: 5, pest: "Wasps", urgency: "Emergency", response: "3 hours", color: "#eab308" },
  { name: "James Olsen", text: "Quarterly preventive service keeps our rental properties pest-free year-round. Professional, always on time, and the tenants love the peace of mind.", rating: 5, pest: "General", urgency: "Preventive", response: "Scheduled", color: "#22c55e" },
  { name: "Linda Nakamura", text: "Bed bug nightmare at our B&B. Evergreen did the heat treatment, and follow-up inspections confirmed total elimination. They saved our business.", rating: 5, pest: "Bed Bugs", urgency: "Emergency", response: "Same day", color: "#be123c" },
];

const SEASONAL_DATA = [
  { season: "Spring", icon: Flower, color: "#22c55e", pests: ["Ants", "Termite swarmers", "Wasps (nest building)", "Spiders"], tip: "Schedule a perimeter treatment before colonies establish. Inspect foundation for new entry points after winter." },
  { season: "Summer", icon: ThermometerHot, color: "#f97316", pests: ["Mosquitoes", "Yellow jackets", "Fleas & ticks", "Carpenter ants"], tip: "Peak activity season. Eliminate standing water, keep yard trimmed, and maintain quarterly barrier treatments." },
  { season: "Fall", icon: Leaf, color: "#d97706", pests: ["Rodents (seeking warmth)", "Spiders (mating season)", "Stink bugs", "Cluster flies"], tip: "Rodents invade homes as temperatures drop. Seal gaps, clean gutters, and set monitoring stations." },
  { season: "Winter", icon: Snowflake, color: "#60a5fa", pests: ["Mice & rats", "Cockroaches", "Silverfish", "Overwintering wasps"], tip: "Indoor pests thrive in heated spaces. Check crawlspace, attic, and garage for signs of activity." },
];

const COMPARISON_ROWS = [
  { feature: "Licensed & insured technicians", us: true, diy: false, chain: true },
  { feature: "Pet & child-safe products", us: true, diy: "Varies", chain: "Sometimes" },
  { feature: "Same-day emergency response", us: true, diy: false, chain: false },
  { feature: "Free follow-up if pests return", us: true, diy: false, chain: "Extra cost" },
  { feature: "Custom treatment plans", us: true, diy: false, chain: false },
  { feature: "Eco-friendly options", us: true, diy: "Varies", chain: "Rarely" },
  { feature: "Local PNW pest expertise", us: true, diy: false, chain: false },
];

const FAQS = [
  { q: "Are your treatments safe for pets and children?", a: "Absolutely. We use EPA-approved products and apply them strategically to minimize exposure. We'll advise on any brief re-entry times, but most treatments are safe once dry (typically 30 minutes to 2 hours)." },
  { q: "How quickly can you respond to an emergency?", a: "For urgent pest situations like wasp nests near high-traffic areas or large rodent sightings, we offer same-day response. Most emergency calls are handled within 2-4 hours during business hours." },
  { q: "Do you offer free inspections?", a: "Yes. Every new customer receives a complimentary property inspection where we identify pest types, entry points, and harborage areas before recommending any treatment." },
  { q: "What does a quarterly prevention plan include?", a: "Our quarterly service includes a full exterior perimeter treatment, interior inspection, web and nest removal, rodent station monitoring, and a detailed report. We adjust products seasonally for the pests most active in the PNW at that time of year." },
  { q: "How long until I see results?", a: "Most customers notice a significant reduction within 24-48 hours. Complete elimination typically takes 1-2 weeks depending on the pest type and severity. Our guarantee covers free re-treatment if pests persist." },
  { q: "Do you handle commercial properties?", a: "Yes. We service restaurants, offices, warehouses, and multi-family properties. We provide compliance documentation and can work around business hours." },
];

const ECO_METHODS = [
  { title: "Targeted Application", desc: "We apply products precisely where pests live and travel, minimizing environmental impact.", icon: Target },
  { title: "Integrated Pest Management", desc: "Combining biological, physical, and chemical methods for the most sustainable results.", icon: Recycle },
  { title: "EPA-Approved Products", desc: "All our treatments use EPA-registered products that meet the highest safety standards.", icon: ShieldCheck },
  { title: "Pet & Child Safe", desc: "Products selected specifically for safety around families, pets, and sensitive environments.", icon: HandHeart },
];

/* ───────────────────────── FLOATING PARTICLES ───────────────────────── */
function FloatingParticles() {
  const particles = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 8,
    duration: 6 + Math.random() * 6,
    size: 2 + Math.random() * 3,
    opacity: 0.08 + Math.random() * 0.15,
  }));
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden hidden md:block">
      {particles.map((p) => (
        <motion.div key={p.id} className="absolute rounded-full" style={{ left: `${p.x}%`, width: p.size, height: p.size, background: ORANGE_LIGHT, willChange: "transform, opacity" }}
          animate={{ y: ["-10vh", "110vh"], opacity: [0, p.opacity, p.opacity, 0] }}
          transition={{ y: { duration: p.duration, repeat: Infinity, delay: p.delay, ease: "linear" }, opacity: { duration: p.duration, repeat: Infinity, delay: p.delay, times: [0, 0.1, 0.9, 1] } }}
        />
      ))}
    </div>
  );
}

/* ───────────────────────── UTILITY COMPONENTS ───────────────────────── */
function SectionReveal({ children, className = "", id }: { children: React.ReactNode; className?: string; id?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return <motion.section ref={ref} id={id} className={className} initial={{ opacity: 0, y: 50 }} animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }} transition={spring}>{children}</motion.section>;
}

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] ${className}`}>{children}</div>;
}

function MagneticButton({ children, className = "", onClick, href, style }: { children: React.ReactNode; className?: string; onClick?: () => void; href?: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, springFast);
  const springY = useSpring(y, springFast);
  const isTouchDevice = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
  const handleMouseMove = useCallback((e: React.MouseEvent) => { if (!ref.current || isTouchDevice) return; const rect = ref.current.getBoundingClientRect(); x.set((e.clientX - (rect.left + rect.width / 2)) * 0.25); y.set((e.clientY - (rect.top + rect.height / 2)) * 0.25); }, [x, y, isTouchDevice]);
  const handleMouseLeave = useCallback(() => { x.set(0); y.set(0); }, [x, y]);
  if (href) {
    return <motion.a ref={ref as unknown as React.Ref<HTMLAnchorElement>} href={href} style={{ x: springX, y: springY, willChange: "transform", ...style }} onMouseMove={handleMouseMove as unknown as React.MouseEventHandler<HTMLAnchorElement>} onMouseLeave={handleMouseLeave} className={className} whileTap={{ scale: 0.97 }}>{children}</motion.a>;
  }
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
      <motion.div className="absolute inset-0 rounded-2xl" style={{ background: `conic-gradient(from 0deg, transparent, ${ORANGE}, transparent, ${ORANGE_LIGHT}, transparent)`, willChange: "transform" }} animate={{ rotate: [0, 360] }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} />
      <div className="relative rounded-2xl z-10" style={{ background: BG }}>{children}</div>
    </div>
  );
}

function SectionHeader({ label, title, accent }: { label: string; title: string; accent: string }) {
  return (
    <div className="text-center mb-16">
      <motion.span className="inline-block text-xs font-bold tracking-[0.25em] uppercase px-4 py-1.5 rounded-full border mb-6" style={{ color: ORANGE_LIGHT, borderColor: `${ORANGE}40`, background: `${ORANGE}10` }}>{label}</motion.span>
      <h2 className="text-3xl md:text-5xl font-extrabold text-white">
        {title} <span style={{ color: ORANGE }}>{accent}</span>
      </h2>
    </div>
  );
}

/* ───────────────────────── PEST THREAT RADAR HERO ───────────────────────── */
function PestRadarHero() {
  const [eliminated, setEliminated] = useState<number[]>([]);
  const [scanComplete, setScanComplete] = useState(false);
  const [rotation, setRotation] = useState(0);

  const pestDots = [
    { id: 0, cx: 65, cy: 45, angle: 310 },
    { id: 1, cx: 140, cy: 70, angle: 30 },
    { id: 2, cx: 155, cy: 130, angle: 70 },
    { id: 3, cx: 130, cy: 170, angle: 120 },
    { id: 4, cx: 60, cy: 165, angle: 220 },
    { id: 5, cx: 40, cy: 110, angle: 250 },
    { id: 6, cx: 80, cy: 55, angle: 340 },
    { id: 7, cx: 160, cy: 100, angle: 50 },
  ];

  useEffect(() => {
    let angle = 0;
    const interval = setInterval(() => {
      angle = (angle + 3) % 360;
      setRotation(angle);

      pestDots.forEach((dot) => {
        const diff = Math.abs(angle - dot.angle);
        const wrapped = diff > 180 ? 360 - diff : diff;
        if (wrapped < 15 && !eliminated.includes(dot.id)) {
          setEliminated((prev) => {
            if (prev.includes(dot.id)) return prev;
            return [...prev, dot.id];
          });
        }
      });
    }, 30);

    const completeTimer = setTimeout(() => {
      setScanComplete(true);
      clearInterval(interval);
    }, 9000);

    return () => {
      clearInterval(interval);
      clearTimeout(completeTimer);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative flex items-center justify-center w-64 h-64 md:w-80 md:h-80">
      {/* Glow behind radar */}
      <motion.div className="absolute inset-0 rounded-full" style={{ background: `radial-gradient(circle, ${ORANGE_GLOW} 0%, transparent 70%)`, filter: "blur(50px)" }} animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }} transition={{ duration: 3, repeat: Infinity }} />

      <svg viewBox="0 0 200 200" className="relative z-10 w-full h-full" fill="none">
        {/* Radar rings */}
        <circle cx="100" cy="100" r="90" stroke={`${ORANGE}30`} strokeWidth="0.5" />
        <circle cx="100" cy="100" r="70" stroke={`${ORANGE}20`} strokeWidth="0.5" />
        <circle cx="100" cy="100" r="50" stroke={`${ORANGE}18`} strokeWidth="0.5" />
        <circle cx="100" cy="100" r="30" stroke={`${ORANGE}12`} strokeWidth="0.5" />

        {/* Crosshairs */}
        <line x1="100" y1="10" x2="100" y2="190" stroke={`${ORANGE}15`} strokeWidth="0.5" />
        <line x1="10" y1="100" x2="190" y2="100" stroke={`${ORANGE}15`} strokeWidth="0.5" />

        {/* House silhouette at center */}
        <path d="M100 60 L120 78 L120 105 L112 105 L112 90 L100 90 L88 90 L88 105 L80 105 L80 78 Z" fill={`${ORANGE}15`} stroke={ORANGE_LIGHT} strokeWidth="1" opacity={0.5} />
        {/* Chimney */}
        <rect x="112" y="65" width="5" height="12" fill={`${ORANGE}15`} stroke={ORANGE_LIGHT} strokeWidth="0.5" opacity={0.4} />
        {/* Door */}
        <rect x="95" y="92" width="10" height="13" fill={`${ORANGE}20`} stroke={ORANGE_LIGHT} strokeWidth="0.5" opacity={0.4} />

        {/* Radar sweep */}
        <g transform={`rotate(${rotation} 100 100)`}>
          <defs>
            <linearGradient id="sweepGrad" gradientUnits="userSpaceOnUse" x1="100" y1="100" x2="100" y2="10">
              <stop offset="0%" stopColor={ORANGE} stopOpacity="0" />
              <stop offset="100%" stopColor={ORANGE} stopOpacity="0.6" />
            </linearGradient>
          </defs>
          <path d={`M100 100 L100 10 A90 90 0 0 1 ${100 + 90 * Math.sin(Math.PI / 6)} ${100 - 90 * Math.cos(Math.PI / 6)} Z`} fill="url(#sweepGrad)" />
          <line x1="100" y1="100" x2="100" y2="10" stroke={ORANGE} strokeWidth="1.5" opacity={0.8} />
        </g>

        {/* Pest dots */}
        {pestDots.map((dot) => {
          const isEliminated = eliminated.includes(dot.id);
          return (
            <g key={dot.id}>
              {!isEliminated && (
                <>
                  <circle cx={dot.cx} cy={dot.cy} r="4" fill={RED} opacity={0.8}>
                    <animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite" />
                  </circle>
                  <circle cx={dot.cx} cy={dot.cy} r="7" fill="none" stroke={RED} strokeWidth="0.5" opacity={0.4}>
                    <animate attributeName="r" values="5;9;5" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.4;0;0.4" dur="2s" repeatCount="indefinite" />
                  </circle>
                </>
              )}
              {isEliminated && (
                <motion.g initial={{ scale: 2, opacity: 1 }} animate={{ scale: 0, opacity: 0 }} transition={{ duration: 0.6 }}>
                  <circle cx={dot.cx} cy={dot.cy} r="8" fill={RED} opacity={0.5} />
                  <line x1={dot.cx - 3} y1={dot.cy - 3} x2={dot.cx + 3} y2={dot.cy + 3} stroke="white" strokeWidth="1.5" />
                  <line x1={dot.cx + 3} y1={dot.cy - 3} x2={dot.cx - 3} y2={dot.cy + 3} stroke="white" strokeWidth="1.5" />
                </motion.g>
              )}
            </g>
          );
        })}

        {/* Center dot */}
        <circle cx="100" cy="100" r="3" fill={ORANGE}>
          <animate attributeName="r" values="2;4;2" dur="2s" repeatCount="indefinite" />
        </circle>
      </svg>

      {/* Status text */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center w-full">
        <AnimatePresence mode="wait">
          {scanComplete ? (
            <motion.div key="safe" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-center gap-2">
              <ShieldCheck size={18} weight="fill" style={{ color: GREEN }} />
              <span className="text-sm font-bold tracking-wider uppercase" style={{ color: GREEN }}>No Threats Detected</span>
            </motion.div>
          ) : (
            <motion.div key="scan" initial={{ opacity: 0 }} animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }} className="flex items-center justify-center gap-2">
              <Crosshair size={16} style={{ color: ORANGE_LIGHT }} />
              <span className="text-xs font-mono tracking-wider uppercase" style={{ color: ORANGE_LIGHT }}>Scanning... {eliminated.length}/{pestDots.length} eliminated</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ───────────────────────── NAV ───────────────────────── */
function Nav() {
  const [open, setOpen] = useState(false);
  const links = [
    { label: "Services", href: "#services" },
    { label: "About", href: "#about" },
    { label: "Pest ID", href: "#pest-id" },
    { label: "Process", href: "#process" },
    { label: "Reviews", href: "#reviews" },
    { label: "FAQ", href: "#faq" },
    { label: "Contact", href: "#contact" },
  ];
  return (
    <nav className="fixed top-0 inset-x-0 z-50 backdrop-blur-xl border-b border-white/10" style={{ background: `${BG}cc` }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        <a href="#" className="flex items-center gap-2">
          <ShieldCheck size={28} weight="fill" style={{ color: ORANGE }} />
          <span className="text-lg font-extrabold text-white">Evergreen <span style={{ color: ORANGE }}>Pest</span></span>
        </a>
        <div className="hidden md:flex items-center gap-6">
          {links.map((l) => (<a key={l.label} href={l.href} className="text-sm text-gray-300 hover:text-white transition-colors">{l.label}</a>))}
          <a href="tel:+12067483920" className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold text-white" style={{ background: ORANGE }}>
            <Phone size={16} weight="fill" /> (206) 748-3920
          </a>
        </div>
        <button className="md:hidden text-white" onClick={() => setOpen(!open)}>{open ? <X size={24} /> : <List size={24} />}</button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="md:hidden overflow-hidden border-t border-white/10" style={{ background: BG }}>
            <div className="px-4 py-4 flex flex-col gap-3">
              {links.map((l) => (<a key={l.label} href={l.href} onClick={() => setOpen(false)} className="text-sm text-gray-300 py-2">{l.label}</a>))}
              <a href="tel:+12067483920" className="flex items-center justify-center gap-2 px-4 py-3 rounded-full text-sm font-bold text-white mt-2" style={{ background: ORANGE }}>
                <Phone size={16} weight="fill" /> (206) 748-3920
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

/* ───────────────────────── PEST IDENTIFIER ───────────────────────── */
function PestIdentifier() {
  const [selected, setSelected] = useState<number | null>(null);
  const pest = selected !== null ? PEST_TYPES[selected] : null;
  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {PEST_TYPES.map((p, i) => (
          <button key={p.name} onClick={() => setSelected(i)} className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${selected === i ? "border-white/30 scale-[1.02]" : "border-white/10 hover:border-white/20"}`} style={{ background: selected === i ? `${p.color}15` : "rgba(255,255,255,0.03)" }}>
            <p.icon size={28} weight="fill" style={{ color: p.color }} />
            <span className="text-sm font-semibold text-white">{p.name}</span>
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        {pest && (
          <motion.div key={pest.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={spring}>
            <GlassCard className="p-6 md:p-8">
              <div className="flex items-center gap-3 mb-4">
                <pest.icon size={32} weight="fill" style={{ color: pest.color }} />
                <h4 className="text-xl font-bold text-white">{pest.name}</h4>
                <div className="ml-auto flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Danger:</span>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="w-5 h-2 rounded-full" style={{ background: i < pest.danger ? RED : "rgba(255,255,255,0.1)" }} />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-300 mb-5 leading-relaxed">{pest.info}</p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-white/10" style={{ background: `${ORANGE}08` }}>
                  <span className="text-xs font-bold uppercase tracking-wider mb-2 block" style={{ color: ORANGE_LIGHT }}>Treatment Method</span>
                  <p className="text-white text-sm">{pest.treatment}</p>
                </div>
                <div className="p-4 rounded-xl border border-white/10" style={{ background: `${GREEN}08` }}>
                  <span className="text-xs font-bold uppercase tracking-wider mb-2 block" style={{ color: GREEN }}>Prevention Tips</span>
                  <p className="text-white text-sm">{pest.prevention}</p>
                </div>
              </div>
              <div className="mt-5 flex items-center gap-2">
                <Phone size={16} style={{ color: ORANGE }} />
                <span className="text-sm text-gray-400">Need help with {pest.name.toLowerCase()}?</span>
                <a href="tel:+12067483920" className="text-sm font-bold ml-auto" style={{ color: ORANGE }}>Call (206) 748-3920</a>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ───────────────────────── TREATMENT ESTIMATOR ───────────────────────── */
function TreatmentEstimator() {
  const [homeSize, setHomeSize] = useState<string>("medium");
  const [pestType, setPestType] = useState<string>("general");
  const [frequency, setFrequency] = useState<string>("quarterly");

  const sizeMult: Record<string, number> = { small: 0.8, medium: 1, large: 1.3, xlarge: 1.6 };
  const pestMult: Record<string, number> = { general: 1, termite: 2.2, rodent: 1.4, mosquito: 0.9, bedbug: 2.5, wildlife: 1.8 };
  const freqPrice: Record<string, number> = { onetime: 199, quarterly: 99, monthly: 79 };

  const basePrice = freqPrice[frequency];
  const total = Math.round(basePrice * sizeMult[homeSize] * pestMult[pestType]);

  const sizes = [
    { val: "small", label: "Under 1,500 sqft" },
    { val: "medium", label: "1,500 - 2,500 sqft" },
    { val: "large", label: "2,500 - 4,000 sqft" },
    { val: "xlarge", label: "4,000+ sqft" },
  ];
  const pests = [
    { val: "general", label: "General Pests" },
    { val: "termite", label: "Termites" },
    { val: "rodent", label: "Rodents" },
    { val: "mosquito", label: "Mosquitoes" },
    { val: "bedbug", label: "Bed Bugs" },
    { val: "wildlife", label: "Wildlife" },
  ];
  const freqs = [
    { val: "onetime", label: "One-Time", sub: "Single treatment" },
    { val: "quarterly", label: "Quarterly", sub: "Best value" },
    { val: "monthly", label: "Monthly", sub: "Heavy infestations" },
  ];

  return (
    <GlassCard className="p-6 md:p-8">
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {/* Home Size */}
        <div>
          <label className="text-sm font-bold text-gray-300 mb-3 block">Home Size</label>
          <div className="flex flex-col gap-2">
            {sizes.map((s) => (
              <button key={s.val} onClick={() => setHomeSize(s.val)} className={`text-left px-4 py-2.5 rounded-lg border text-sm transition-all ${homeSize === s.val ? "border-white/30 text-white" : "border-white/10 text-gray-400 hover:border-white/20"}`} style={{ background: homeSize === s.val ? `${ORANGE}15` : "transparent" }}>
                {s.label}
              </button>
            ))}
          </div>
        </div>
        {/* Pest Type */}
        <div>
          <label className="text-sm font-bold text-gray-300 mb-3 block">Pest Type</label>
          <div className="flex flex-col gap-2">
            {pests.map((p) => (
              <button key={p.val} onClick={() => setPestType(p.val)} className={`text-left px-4 py-2.5 rounded-lg border text-sm transition-all ${pestType === p.val ? "border-white/30 text-white" : "border-white/10 text-gray-400 hover:border-white/20"}`} style={{ background: pestType === p.val ? `${ORANGE}15` : "transparent" }}>
                {p.label}
              </button>
            ))}
          </div>
        </div>
        {/* Frequency */}
        <div>
          <label className="text-sm font-bold text-gray-300 mb-3 block">Frequency</label>
          <div className="flex flex-col gap-2">
            {freqs.map((f) => (
              <button key={f.val} onClick={() => setFrequency(f.val)} className={`text-left px-4 py-2.5 rounded-lg border transition-all ${frequency === f.val ? "border-white/30" : "border-white/10 hover:border-white/20"}`} style={{ background: frequency === f.val ? `${ORANGE}15` : "transparent" }}>
                <span className={`text-sm font-semibold ${frequency === f.val ? "text-white" : "text-gray-400"}`}>{f.label}</span>
                <span className="block text-xs text-gray-500">{f.sub}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Result */}
      <div className="text-center p-6 rounded-xl border border-white/10" style={{ background: `${ORANGE}08` }}>
        <span className="text-sm text-gray-400 block mb-1">Estimated {frequency === "onetime" ? "Treatment" : "Per Service"} Cost</span>
        <div className="flex items-center justify-center gap-1">
          <CurrencyDollar size={28} style={{ color: ORANGE }} />
          <span className="text-4xl font-black text-white">{total}</span>
          {frequency !== "onetime" && <span className="text-sm text-gray-400 ml-1">/ {frequency === "quarterly" ? "quarter" : "month"}</span>}
        </div>
        <p className="text-xs text-gray-500 mt-2">Exact pricing determined after free inspection</p>
        <a href="tel:+12067483920" className="inline-flex items-center gap-2 mt-4 px-6 py-2.5 rounded-full text-sm font-bold text-white" style={{ background: ORANGE }}>
          <Phone size={16} weight="fill" /> Get Exact Quote
        </a>
      </div>
    </GlassCard>
  );
}

/* ───────────────────────── SEASONAL CALENDAR ───────────────────────── */
function SeasonalCalendar() {
  const [activeSeason, setActiveSeason] = useState(0);
  const s = SEASONAL_DATA[activeSeason];
  return (
    <div>
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {SEASONAL_DATA.map((season, i) => (
          <button key={season.season} onClick={() => setActiveSeason(i)} className={`flex items-center gap-2 px-5 py-3 rounded-xl border whitespace-nowrap transition-all ${activeSeason === i ? "border-white/30" : "border-white/10 hover:border-white/20"}`} style={{ background: activeSeason === i ? `${season.color}15` : "transparent" }}>
            <season.icon size={20} weight="fill" style={{ color: season.color }} />
            <span className={`text-sm font-semibold ${activeSeason === i ? "text-white" : "text-gray-400"}`}>{season.season}</span>
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={s.season} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
          <GlassCard className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <s.icon size={28} weight="fill" style={{ color: s.color }} />
              <h4 className="text-xl font-bold text-white">{s.season} Pests in the PNW</h4>
            </div>
            <div className="grid sm:grid-cols-2 gap-4 mb-5">
              {s.pests.map((pest) => (
                <div key={pest} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10" style={{ background: `${s.color}08` }}>
                  <Bug size={16} weight="fill" style={{ color: s.color }} />
                  <span className="text-sm text-white">{pest}</span>
                </div>
              ))}
            </div>
            <div className="p-4 rounded-xl" style={{ background: `${s.color}08`, border: `1px solid ${s.color}25` }}>
              <span className="text-xs font-bold uppercase tracking-wider block mb-1" style={{ color: s.color }}>Pro Tip</span>
              <p className="text-sm text-gray-300 leading-relaxed">{s.tip}</p>
            </div>
          </GlassCard>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ───────────────────────── PEST QUIZ ───────────────────────── */
const pestQuizOptions = [
  {
    label: "I see ants or spiders",
    result: "Common invaders! Our Perimeter Protection plan treats every entry point with pet-safe, family-safe barrier spray. One visit stops them for 90 days.",
    urgency: "Standard",
  },
  {
    label: "I suspect rodents (mice or rats)",
    result: "Rodents require immediate action — they contaminate food and chew wiring. We'll trap, seal entry points, and sanitize. Usually resolved in 2 visits.",
    urgency: "Urgent",
  },
  {
    label: "I found bed bugs",
    result: "Bed bugs need professional heat treatment — DIY sprays don't reach all hiding spots. Our heat treatment eliminates 100% in one day. Call us now.",
    urgency: "Emergency",
  },
  {
    label: "I have a wasp, hornet, or yellow jacket nest",
    result: "Never attempt nest removal yourself. Our certified technicians safely remove nests at any size — same-day emergency service available.",
    urgency: "Emergency",
  },
];

function PestQuizOption({ label, result, urgency }: { label: string; result: string; urgency: string }) {
  const [selected, setSelected] = useState(false);
  const urgencyColor = urgency === "Emergency" ? RED : urgency === "Urgent" ? ORANGE : GREEN;
  return (
    <div className="space-y-3">
      <button
        onClick={() => setSelected((prev) => !prev)}
        className="w-full p-5 rounded-xl border text-left transition-all cursor-pointer"
        style={{
          background: selected ? `${ORANGE}15` : "rgba(255,255,255,0.02)",
          borderColor: selected ? ORANGE : "rgba(255,255,255,0.08)",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors"
            style={{ borderColor: selected ? ORANGE_LIGHT : "rgba(255,255,255,0.2)", background: selected ? ORANGE : "transparent" }}
          >
            {selected && (
              <svg width="10" height="10" viewBox="0 0 12 12" fill="white">
                <path d="M10 3L5 8.5 2 5.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
            )}
          </div>
          <span className="text-sm font-medium text-white">{label}</span>
          <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full shrink-0" style={{ background: `${urgencyColor}20`, color: urgencyColor, border: `1px solid ${urgencyColor}40` }}>
            {urgency}
          </span>
        </div>
      </button>
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-4 rounded-xl border" style={{ background: `${ORANGE}10`, borderColor: `${ORANGE}30` }}>
              <p className="text-sm text-gray-300 leading-relaxed mb-3">{result}</p>
              <a
                href="tel:+12067483920"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold text-white"
                style={{ background: ORANGE }}
              >
                <Phone size={14} weight="fill" />
                {urgency === "Emergency" ? "Call Now — Emergency Line" : "Call (206) 748-3920"}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PestQuiz() {
  return (
    <div className="space-y-4">
      {pestQuizOptions.map((opt, i) => (
        <PestQuizOption key={i} label={opt.label} result={opt.result} urgency={opt.urgency} />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   MAIN PAGE COMPONENT
   ═══════════════════════════════════════════════════════════════════════ */
export default function PestControlShowcase() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <main className="pest-v2 relative min-h-screen overflow-x-hidden" style={{ background: BG, color: "white" }}>
      <FloatingParticles />
      <Nav />

      {/* ──────────── HERO ──────────── */}
      <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at 50% 40%, ${ORANGE}12 0%, transparent 60%)` }} />
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `linear-gradient(${ORANGE}30 1px, transparent 1px), linear-gradient(90deg, ${ORANGE}30 1px, transparent 1px)`, backgroundSize: "60px 60px" }} />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-20 flex flex-col lg:flex-row items-center gap-12">
          {/* Left text */}
          <div className="flex-1 text-center lg:text-left">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-6" style={{ borderColor: `${GREEN}40`, background: `${GREEN}10` }}>
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: GREEN }} />
              <span className="text-xs font-bold tracking-wider uppercase" style={{ color: GREEN }}>Seattle&apos;s Trusted Pest Experts</span>
            </motion.div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[0.95] mb-6">
              <WordReveal text="Your Home," className="text-white" />
              <br />
              <WordReveal text="Pest Free." className="block mt-2" />
            </h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="text-lg text-gray-400 max-w-lg mx-auto lg:mx-0 mb-8">
              Evergreen Pest Solutions protects Pacific Northwest homes and businesses with eco-friendly treatments, same-day emergency response, and guaranteed results.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <MagneticButton href="tel:+12067483920" className="flex items-center justify-center gap-2 px-8 py-4 rounded-full text-base font-bold text-white" style={{ background: ORANGE }}>
                <Phone size={20} weight="fill" /> Free Inspection
              </MagneticButton>
              <MagneticButton href="#pest-id" className="flex items-center justify-center gap-2 px-8 py-4 rounded-full text-base font-bold text-white border border-white/20 hover:border-white/40 transition-colors">
                What&apos;s Bugging You? <ArrowRight size={18} />
              </MagneticButton>
            </motion.div>

            {/* Trust pills */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="flex flex-wrap gap-3 mt-8 justify-center lg:justify-start">
              {[
                { icon: ShieldCheck, text: "Licensed & Insured" },
                { icon: Leaf, text: "Eco-Friendly" },
                { icon: Star, text: "4.9 Rating" },
              ].map((b) => (
                <span key={b.text} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold" style={{ borderColor: `${ORANGE}30`, background: `${ORANGE}08`, color: ORANGE_LIGHT }}>
                  <b.icon size={14} weight="fill" /> {b.text}
                </span>
              ))}
            </motion.div>
          </div>

          {/* Right radar */}
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, duration: 0.8 }} className="flex-shrink-0">
            <PestRadarHero />
          </motion.div>
        </div>

        {/* Emergency strip */}
        <motion.div className="absolute bottom-0 inset-x-0 py-3 border-t border-white/10" style={{ background: `${RED}10` }} animate={{ opacity: [0.7, 1, 0.7] }} transition={{ duration: 2, repeat: Infinity }}>
          <div className="max-w-7xl mx-auto px-4 flex items-center justify-center gap-3">
            <Siren size={18} weight="fill" style={{ color: RED }} />
            <span className="text-sm font-bold text-white">Emergency Pest Response</span>
            <span className="text-sm text-gray-400">Same-day service available</span>
            <a href="tel:+12067483920" className="text-sm font-bold ml-2" style={{ color: ORANGE }}>Call Now</a>
          </div>
        </motion.div>
      </section>

      {/* ──────────── TRUST BAR ──────────── */}
      <SectionReveal className="py-8 border-y border-white/10" style={{ background: `linear-gradient(135deg, ${BG}, rgba(234,88,12,0.04))` } as React.CSSProperties}>
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: "12+", label: "Years Serving PNW", icon: CalendarCheck },
            { value: "5,000+", label: "Homes Protected", icon: House },
            { value: "4.9", label: "Google Rating", icon: Star },
            { value: "<2hr", label: "Emergency Response", icon: Timer },
          ].map((s) => (
            <div key={s.label} className="flex flex-col items-center gap-2">
              <s.icon size={24} weight="fill" style={{ color: ORANGE }} />
              <span className="text-2xl md:text-3xl font-black text-white">{s.value}</span>
              <span className="text-xs text-gray-400 uppercase tracking-wider">{s.label}</span>
            </div>
          ))}
        </div>
      </SectionReveal>

      {/* ──────────── SERVICES ──────────── */}
      <SectionReveal id="services" className="py-24 relative">
        <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at 30% 50%, ${ORANGE}06 0%, transparent 50%)` }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <SectionHeader label="Our Services" title="Complete Pest" accent="Protection" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map((s, i) => (
              <motion.div key={s.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ ...spring, delay: i * 0.08 }}>
                <GlassCard className="p-6 h-full hover:border-white/20 transition-colors group">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${ORANGE}15` }}>
                      <s.icon size={24} weight="fill" style={{ color: ORANGE }} />
                    </div>
                    <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ background: `${ORANGE}15`, color: ORANGE_LIGHT }}>0{i + 1}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-orange-400 transition-colors">{s.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{s.desc}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ──────────── ABOUT ──────────── */}
      <SectionReveal id="about" className="py-24 relative">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, transparent, ${ORANGE}04, transparent)` }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <motion.span className="inline-block text-xs font-bold tracking-[0.25em] uppercase px-4 py-1.5 rounded-full border mb-6" style={{ color: ORANGE_LIGHT, borderColor: `${ORANGE}40`, background: `${ORANGE}10` }}>Meet the Owner</motion.span>
              <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6">
                Jake <span style={{ color: ORANGE }}>Mendez</span>
              </h2>
              <div className="space-y-4 text-gray-400 leading-relaxed">
                <p>
                  Growing up in the Pacific Northwest, Jake Mendez saw firsthand how our damp climate creates the perfect conditions for pests. After earning his entomology degree and spending five years with a national pest company, he knew Seattle deserved better — a local company that treats homes like their own.
                </p>
                <p>
                  Jake founded Evergreen Pest Solutions in 2014 with a simple promise: eco-friendly treatments that actually work, honest pricing with no hidden fees, and same-day emergency response because pests do not wait for business hours.
                </p>
                <p>
                  Today, Evergreen protects over 5,000 PNW homes and businesses. Every technician is state-certified, background-checked, and trained in Integrated Pest Management. The company is a member of the National Pest Management Association and the Washington State Pest Management Association.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 mt-6">
                {["EPA Certified", "NPMA Member", "WA Licensed", "BBB A+ Rated"].map((badge) => (
                  <span key={badge} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold" style={{ borderColor: `${GREEN}30`, background: `${GREEN}08`, color: GREEN }}>
                    <CheckCircle size={14} weight="fill" /> {badge}
                  </span>
                ))}
              </div>
            </div>
            <div className="relative">
              <GlassCard className="p-8">
                <div className="space-y-6">
                  <div className="flex items-center gap-4 p-4 rounded-xl border border-white/10" style={{ background: `${ORANGE}08` }}>
                    <ShieldCheck size={32} weight="fill" style={{ color: ORANGE }} />
                    <div>
                      <h4 className="text-white font-bold">Pest-Free Guarantee</h4>
                      <p className="text-sm text-gray-400">If pests return between treatments, so do we — free of charge</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 rounded-xl border border-white/10" style={{ background: `${GREEN}08` }}>
                    <Leaf size={32} weight="fill" style={{ color: GREEN }} />
                    <div>
                      <h4 className="text-white font-bold">Eco-Friendly First</h4>
                      <p className="text-sm text-gray-400">We use the least-toxic effective treatment every time</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 rounded-xl border border-white/10" style={{ background: `${ORANGE}08` }}>
                    <Users size={32} weight="fill" style={{ color: ORANGE_LIGHT }} />
                    <div>
                      <h4 className="text-white font-bold">Family Owned</h4>
                      <p className="text-sm text-gray-400">Local team, local knowledge, personal accountability</p>
                    </div>
                  </div>
                </div>
              </GlassCard>
              {/* Decorative glow */}
              <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full opacity-20" style={{ background: `radial-gradient(circle, ${ORANGE} 0%, transparent 70%)`, filter: "blur(60px)" }} />
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* ──────────── PEST IDENTIFIER TOOL ──────────── */}
      <SectionReveal id="pest-id" className="py-24 relative">
        <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at 70% 30%, ${ORANGE}06 0%, transparent 50%)` }} />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
          <SectionHeader label="Interactive Tool" title="What's Bugging" accent="You?" />
          <p className="text-center text-gray-400 max-w-xl mx-auto mb-10 -mt-8">Select a pest type to learn about danger levels, treatment methods, and prevention tips specific to the Pacific Northwest.</p>
          <PestIdentifier />
        </div>
      </SectionReveal>

      {/* ──────────── TREATMENT ESTIMATOR ──────────── */}
      <SectionReveal className="py-24 relative">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, transparent, ${ORANGE}04, transparent)` }} />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
          <SectionHeader label="Plan & Price" title="Treatment" accent="Estimator" />
          <p className="text-center text-gray-400 max-w-xl mx-auto mb-10 -mt-8">Get an instant estimate for your pest control needs. Final pricing is confirmed after your free inspection.</p>
          <TreatmentEstimator />
        </div>
      </SectionReveal>

      {/* ──────────── SEASONAL PEST CALENDAR ──────────── */}
      <SectionReveal className="py-24 relative">
        <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at 50% 80%, ${GREEN}06 0%, transparent 50%)` }} />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
          <SectionHeader label="PNW Knowledge" title="Seasonal Pest" accent="Calendar" />
          <p className="text-center text-gray-400 max-w-xl mx-auto mb-10 -mt-8">Know what to expect each season in the Pacific Northwest so you can stay one step ahead of pests.</p>
          <SeasonalCalendar />
        </div>
      </SectionReveal>

      {/* ──────────── PROCESS ──────────── */}
      <SectionReveal id="process" className="py-24 relative">
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, transparent, ${ORANGE}04)` }} />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
          <SectionHeader label="How It Works" title="Our 5-Step" accent="Process" />
          <div className="space-y-6">
            {PROCESS_STEPS.map((s, i) => (
              <motion.div key={s.step} initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ ...spring, delay: i * 0.1 }}>
                <GlassCard className="p-6 flex items-start gap-5">
                  <div className="flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center relative" style={{ background: `${ORANGE}15` }}>
                    <s.icon size={26} weight="fill" style={{ color: ORANGE }} />
                    <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full text-xs font-black text-white flex items-center justify-center" style={{ background: ORANGE }}>{s.step}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">{s.title}</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">{s.desc}</p>
                  </div>
                  {i < PROCESS_STEPS.length - 1 && (
                    <div className="hidden md:block absolute left-[43px] bottom-0 translate-y-full w-px h-6" style={{ background: `${ORANGE}30` }} />
                  )}
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ──────────── TESTIMONIALS — Pest Type + Urgency Cards ──────────── */}
      <SectionReveal id="reviews" className="py-24 relative">
        <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at 60% 30%, ${ORANGE}06 0%, transparent 50%)` }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <SectionHeader label="Customer Stories" title="Real Results," accent="Real Reviews" />
          {/* Google rating header */}
          <div className="flex items-center justify-center gap-3 mb-12 -mt-8">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={20} weight="fill" style={{ color: "#facc15" }} />
              ))}
            </div>
            <span className="text-white font-bold">4.9</span>
            <span className="text-gray-400 text-sm">from 287 Google reviews</span>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div key={t.name} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ ...spring, delay: i * 0.08 }}>
                <GlassCard className="p-6 h-full flex flex-col">
                  {/* Pest tag + urgency badge */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold" style={{ background: `${t.color}20`, color: t.color, border: `1px solid ${t.color}40` }}>
                      <Bug size={12} weight="fill" /> {t.pest}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${t.urgency === "Emergency" ? "bg-red-500/15 text-red-400 border border-red-500/30" : t.urgency === "Preventive" ? "bg-green-500/15 text-green-400 border border-green-500/30" : "bg-white/10 text-gray-300 border border-white/20"}`}>
                      {t.urgency === "Emergency" && <Siren size={12} weight="fill" />}
                      {t.urgency === "Preventive" && <ShieldCheck size={12} weight="fill" />}
                      {t.urgency === "Standard" && <Clock size={12} />}
                      {t.urgency}
                    </span>
                  </div>

                  {/* Stars */}
                  <div className="flex gap-0.5 mb-3">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star key={j} size={16} weight="fill" style={{ color: "#facc15" }} />
                    ))}
                  </div>

                  {/* Quote */}
                  <Quotes size={20} weight="fill" style={{ color: `${ORANGE}40` }} className="mb-2" />
                  <p className="text-sm text-gray-300 leading-relaxed flex-1">{t.text}</p>

                  {/* Footer */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                    <div className="flex items-center gap-2">
                      <CheckCircle size={16} weight="fill" style={{ color: GREEN }} />
                      <span className="text-sm font-semibold text-white">{t.name}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Timer size={12} /> {t.response}
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ──────────── ECO-FRIENDLY METHODS ──────────── */}
      <SectionReveal className="py-24 relative">
        <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at 40% 50%, ${GREEN}06 0%, transparent 50%)` }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <SectionHeader label="Our Approach" title="Eco-Friendly" accent="Methods" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {ECO_METHODS.map((m, i) => (
              <motion.div key={m.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ ...spring, delay: i * 0.08 }}>
                <GlassCard className="p-6 text-center h-full">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: `${GREEN}15` }}>
                    <m.icon size={26} weight="fill" style={{ color: GREEN }} />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{m.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{m.desc}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
          {/* IPM callout */}
          <ShimmerBorder className="mt-10 max-w-3xl mx-auto">
            <div className="p-6 md:p-8 text-center">
              <Leaf size={28} weight="fill" style={{ color: GREEN }} className="mx-auto mb-3" />
              <h3 className="text-xl font-bold text-white mb-2">Integrated Pest Management</h3>
              <p className="text-sm text-gray-400 leading-relaxed max-w-xl mx-auto">
                We follow IPM principles — using biological controls, habitat modification, and targeted treatments as a system. Chemical intervention is the last resort, not the first. This approach is better for your family, pets, and the environment.
              </p>
            </div>
          </ShimmerBorder>
        </div>
      </SectionReveal>

      {/* ──────────── COMPARISON ──────────── */}
      <SectionReveal className="py-24 relative">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, transparent, ${ORANGE}04, transparent)` }} />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
          <SectionHeader label="Why Choose Us" title="Evergreen vs." accent="The Rest" />
          <GlassCard className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left px-6 py-4 text-sm text-gray-400 font-medium">Feature</th>
                    <th className="px-6 py-4 text-sm font-bold text-center" style={{ color: ORANGE }}>Evergreen</th>
                    <th className="px-6 py-4 text-sm text-gray-400 text-center">DIY</th>
                    <th className="px-6 py-4 text-sm text-gray-400 text-center">Big Chains</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_ROWS.map((row, i) => (
                    <tr key={row.feature} className={`border-b border-white/5 ${i % 2 === 0 ? "" : "bg-white/[0.02]"}`}>
                      <td className="px-6 py-4 text-sm text-gray-300">{row.feature}</td>
                      <td className="px-6 py-4 text-center">
                        <CheckCircle size={20} weight="fill" style={{ color: GREEN }} className="mx-auto" />
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-500">
                        {row.diy === true ? <CheckCircle size={18} style={{ color: GREEN }} className="mx-auto" /> : row.diy === false ? <X size={18} style={{ color: RED }} className="mx-auto" /> : <span>{row.diy}</span>}
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-500">
                        {row.chain === true ? <CheckCircle size={18} style={{ color: GREEN }} className="mx-auto" /> : row.chain === false ? <X size={18} style={{ color: RED }} className="mx-auto" /> : <span>{row.chain}</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      </SectionReveal>

      {/* ──────────── VIDEO PLACEHOLDER ──────────── */}
      <SectionReveal className="py-24 relative">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, transparent, ${ORANGE}04, transparent)` }} />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center mb-10">
            <motion.span className="inline-block text-xs font-bold tracking-[0.25em] uppercase px-4 py-1.5 rounded-full border mb-6" style={{ color: ORANGE_LIGHT, borderColor: `${ORANGE}40`, background: `${ORANGE}10` }}>See Our Process</motion.span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white">
              Watch Our Pest Treatment <span style={{ color: ORANGE }}>Process</span>
            </h2>
            <p className="text-gray-400 mt-3 max-w-md mx-auto">See how we eliminate pests safely and effectively — from inspection to treatment to prevention</p>
          </div>
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden cursor-pointer group">
            <img
              src="https://images.unsplash.com/photo-1576919228236-a097c32a5cd4?w=1200&q=80"
              alt="Pest control technician at work"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/60" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <motion.div
                  className="absolute rounded-full"
                  style={{ background: `${ORANGE}40`, width: 88, height: 88, top: -12, left: -12 }}
                  animate={{ scale: [1, 1.5, 1], opacity: [0.6, 0, 0.6] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut" }}
                />
                <div className="relative w-16 h-16 rounded-full flex items-center justify-center shadow-lg" style={{ background: ORANGE }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="white" style={{ marginLeft: 3 }}>
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* ──────────── INTERACTIVE QUIZ — What's Invading? ──────────── */}
      <SectionReveal className="py-24 relative">
        <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at 50% 50%, ${ORANGE}06 0%, transparent 50%)` }} />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center mb-10">
            <motion.span className="inline-block text-xs font-bold tracking-[0.25em] uppercase px-4 py-1.5 rounded-full border mb-6" style={{ color: ORANGE_LIGHT, borderColor: `${ORANGE}40`, background: `${ORANGE}10` }}>Quick Help</motion.span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white">
              What&apos;s Invading <span style={{ color: ORANGE }}>Your Home?</span>
            </h2>
            <p className="text-gray-400 mt-3">Select your situation and we&apos;ll give you the fastest path to a pest-free home.</p>
          </div>
          <PestQuiz />
        </div>
      </SectionReveal>

      {/* ──────────── PRICING ──────────── */}
      <SectionReveal className="py-24 relative">
        <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at 50% 50%, ${ORANGE}06 0%, transparent 50%)` }} />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
          <SectionHeader label="Pricing" title="Protection" accent="Plans" />
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: "One-Time Treatment", price: "$149", sub: "Starting at", features: ["Full property inspection", "Targeted treatment", "30-day guarantee", "Follow-up check"], popular: false },
              { title: "Quarterly Plan", price: "$99", sub: "Per quarter", features: ["Perimeter barrier", "Interior inspection", "Rodent monitoring", "Web removal", "Seasonal adjustments", "Re-treatment guarantee"], popular: true },
              { title: "Monthly Plan", price: "$79", sub: "Per month", features: ["All quarterly features", "Monthly service visits", "Priority scheduling", "Emergency response", "Termite monitoring", "Unlimited callbacks"], popular: false },
            ].map((plan, i) => (
              <motion.div key={plan.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ ...spring, delay: i * 0.1 }}>
                {plan.popular ? (
                  <ShimmerBorder>
                    <div className="p-6">
                      <span className="inline-block text-xs font-bold tracking-wider uppercase px-3 py-1 rounded-full mb-4" style={{ background: ORANGE, color: "white" }}>Most Popular</span>
                      <h3 className="text-xl font-bold text-white mb-1">{plan.title}</h3>
                      <p className="text-xs text-gray-500 mb-3">{plan.sub}</p>
                      <div className="text-4xl font-black text-white mb-6">{plan.price}<span className="text-sm text-gray-400 font-normal">/qtr</span></div>
                      <ul className="space-y-3 mb-6">
                        {plan.features.map((f) => (
                          <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
                            <CheckCircle size={16} weight="fill" style={{ color: GREEN }} /> {f}
                          </li>
                        ))}
                      </ul>
                      <a href="tel:+12067483920" className="flex items-center justify-center gap-2 w-full py-3 rounded-full text-sm font-bold text-white" style={{ background: ORANGE }}>
                        <Phone size={16} weight="fill" /> Get Started
                      </a>
                    </div>
                  </ShimmerBorder>
                ) : (
                  <GlassCard className="p-6 h-full flex flex-col">
                    <h3 className="text-xl font-bold text-white mb-1">{plan.title}</h3>
                    <p className="text-xs text-gray-500 mb-3">{plan.sub}</p>
                    <div className="text-4xl font-black text-white mb-6">{plan.price}</div>
                    <ul className="space-y-3 mb-6 flex-1">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
                          <CheckCircle size={16} weight="fill" style={{ color: GREEN }} /> {f}
                        </li>
                      ))}
                    </ul>
                    <a href="tel:+12067483920" className="flex items-center justify-center gap-2 w-full py-3 rounded-full text-sm font-bold border border-white/20 text-white hover:border-white/40 transition-colors">
                      <Phone size={16} /> Learn More
                    </a>
                  </GlassCard>
                )}
              </motion.div>
            ))}
          </div>
          <p className="text-center text-xs text-gray-500 mt-6">All plans include free initial inspection. Exact pricing confirmed after assessment.</p>
        </div>
      </SectionReveal>

      {/* ──────────── FAQ ──────────── */}
      <SectionReveal id="faq" className="py-24 relative">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, transparent, ${ORANGE}04, transparent)` }} />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 relative z-10">
          <SectionHeader label="Questions" title="Frequently" accent="Asked" />
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <GlassCard key={i} className="overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between px-6 py-4 text-left">
                  <span className="text-sm font-semibold text-white pr-4">{faq.q}</span>
                  <motion.div animate={{ rotate: openFaq === i ? 180 : 0 }} transition={{ duration: 0.3 }}>
                    <CaretDown size={18} style={{ color: ORANGE }} />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}>
                      <p className="px-6 pb-4 text-sm text-gray-400 leading-relaxed">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </GlassCard>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ──────────── SERVICE AREA ──────────── */}
      <SectionReveal className="py-24 relative">
        <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at 50% 50%, ${ORANGE}06 0%, transparent 50%)` }} />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
          <SectionHeader label="Coverage" title="Service" accent="Area" />
          <GlassCard className="p-6 md:p-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-bold text-white mb-4">Serving the Greater Seattle Area</h3>
                <div className="grid grid-cols-2 gap-2">
                  {["Seattle", "Bellevue", "Kirkland", "Redmond", "Renton", "Bothell", "Shoreline", "Burien", "Tukwila", "Mercer Island", "Issaquah", "Woodinville"].map((area) => (
                    <div key={area} className="flex items-center gap-2 text-sm text-gray-300">
                      <CheckCircle size={14} weight="fill" style={{ color: GREEN }} /> {area}
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 rounded-xl border border-white/10" style={{ background: `${GREEN}08` }}>
                  <div className="w-3 h-3 rounded-full animate-pulse" style={{ background: GREEN }} />
                  <div>
                    <span className="text-sm font-bold text-white">Currently Available</span>
                    <p className="text-xs text-gray-400">Crews dispatching now</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-xl border border-white/10" style={{ background: `${ORANGE}08` }}>
                  <Timer size={24} weight="fill" style={{ color: ORANGE }} />
                  <div>
                    <span className="text-sm font-bold text-white">Under 2-Hour Emergency Response</span>
                    <p className="text-xs text-gray-400">During business hours (7am - 7pm)</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-xl border border-white/10" style={{ background: `${ORANGE}08` }}>
                  <MapPin size={24} weight="fill" style={{ color: ORANGE_LIGHT }} />
                  <div>
                    <span className="text-sm font-bold text-white">25-Mile Service Radius</span>
                    <p className="text-xs text-gray-400">From our Capitol Hill headquarters</p>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </SectionReveal>

      {/* ──────────── CTA ──────────── */}
      <SectionReveal className="py-24 relative">
        <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at 50% 50%, ${ORANGE}10 0%, transparent 50%)` }} />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          <ShimmerBorder>
            <div className="p-8 md:p-12">
              <ShieldCheck size={40} weight="fill" style={{ color: ORANGE }} className="mx-auto mb-4" />
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
                Ready for a <span style={{ color: ORANGE }}>Pest-Free</span> Home?
              </h2>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">Schedule your free inspection today. If pests return between treatments, so do we — at no cost.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <MagneticButton href="tel:+12067483920" className="flex items-center justify-center gap-2 px-8 py-4 rounded-full text-base font-bold text-white" style={{ background: ORANGE }}>
                  <Phone size={20} weight="fill" /> (206) 748-3920
                </MagneticButton>
                <MagneticButton href="#contact" className="flex items-center justify-center gap-2 px-8 py-4 rounded-full text-base font-bold text-white border border-white/20">
                  <Envelope size={20} /> Send a Message
                </MagneticButton>
              </div>
            </div>
          </ShimmerBorder>
        </div>
      </SectionReveal>

      {/* ──────────── CONTACT ──────────── */}
      <SectionReveal id="contact" className="py-24 relative">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, transparent, ${ORANGE}04, transparent)` }} />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
          <SectionHeader label="Get in Touch" title="Contact" accent="Us" />
          <div className="grid md:grid-cols-2 gap-8">
            <GlassCard className="p-6 md:p-8">
              <h3 className="text-xl font-bold text-white mb-6">Evergreen Pest Solutions</h3>
              <div className="space-y-5">
                <a href="tel:+12067483920" className="flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${ORANGE}15` }}>
                    <Phone size={22} weight="fill" style={{ color: ORANGE }} />
                  </div>
                  <div>
                    <span className="text-sm text-gray-400 block">Phone</span>
                    <span className="text-white font-bold group-hover:text-orange-400 transition-colors">(206) 748-3920</span>
                  </div>
                </a>
                <a href="https://maps.google.com/?q=1847+E+Pine+St,+Seattle,+WA+98122" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${ORANGE}15` }}>
                    <MapPin size={22} weight="fill" style={{ color: ORANGE }} />
                  </div>
                  <div>
                    <span className="text-sm text-gray-400 block">Address</span>
                    <span className="text-white font-bold group-hover:text-orange-400 transition-colors">1847 E Pine St, Seattle, WA 98122</span>
                  </div>
                </a>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${ORANGE}15` }}>
                    <Clock size={22} weight="fill" style={{ color: ORANGE }} />
                  </div>
                  <div>
                    <span className="text-sm text-gray-400 block">Hours</span>
                    <span className="text-white font-bold">Mon - Sat: 7:00 AM - 7:00 PM</span>
                    <span className="block text-xs text-gray-500">Emergency service available 24/7</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${ORANGE}15` }}>
                    <Envelope size={22} weight="fill" style={{ color: ORANGE }} />
                  </div>
                  <div>
                    <span className="text-sm text-gray-400 block">Email</span>
                    <span className="text-white font-bold">info@evergreenpest.com</span>
                  </div>
                </div>
              </div>
            </GlassCard>
            <GlassCard className="p-6 md:p-8 flex flex-col justify-center">
              <h3 className="text-xl font-bold text-white mb-2">Free Inspection Request</h3>
              <p className="text-sm text-gray-400 mb-6">Fill out the form and we will get back to you within 1 business hour.</p>
              <div className="space-y-4">
                <input type="text" placeholder="Your Name" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-orange-500/50" />
                <input type="tel" placeholder="Phone Number" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-orange-500/50" />
                <select className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-400 text-sm focus:outline-none focus:border-orange-500/50" style={{ background: BG }}>
                  <option value="">What pest are you dealing with?</option>
                  <option>Ants</option>
                  <option>Rodents</option>
                  <option>Termites</option>
                  <option>Wasps / Bees</option>
                  <option>Spiders</option>
                  <option>Cockroaches</option>
                  <option>Bed Bugs</option>
                  <option>Other</option>
                </select>
                <textarea placeholder="Describe your situation..." rows={3} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-orange-500/50 resize-none" />
                <button className="w-full py-3 rounded-full text-sm font-bold text-white" style={{ background: ORANGE }}>
                  Request Free Inspection
                </button>
              </div>
            </GlassCard>
          </div>
        </div>
      </SectionReveal>

      {/* ──────────── FOOTER ──────────── */}
      <footer className="border-t border-white/10 py-12" style={{ background: `linear-gradient(180deg, ${BG}, #0a0f1a)` }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck size={24} weight="fill" style={{ color: ORANGE }} />
                <span className="text-lg font-extrabold text-white">Evergreen <span style={{ color: ORANGE }}>Pest</span></span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">Protecting Pacific Northwest homes and businesses since 2014. Licensed, insured, and committed to eco-friendly pest solutions.</p>
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mb-4">Services</h4>
              <ul className="space-y-2">
                {SERVICES.slice(0, 4).map((s) => (
                  <li key={s.title}><a href="#services" className="text-sm text-gray-400 hover:text-white transition-colors">{s.title}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mb-4">Quick Links</h4>
              <ul className="space-y-2">
                {["About Us", "Our Process", "Reviews", "FAQ", "Contact"].map((l) => (
                  <li key={l}><a href={`#${l.toLowerCase().replace(/\s/g, "-")}`} className="text-sm text-gray-400 hover:text-white transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mb-4">Contact</h4>
              <ul className="space-y-2">
                <li><a href="tel:+12067483920" className="text-sm text-gray-400 hover:text-white transition-colors">(206) 748-3920</a></li>
                <li><a href="https://maps.google.com/?q=1847+E+Pine+St,+Seattle,+WA+98122" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-white transition-colors">1847 E Pine St, Seattle, WA 98122</a></li>
                <li><span className="text-sm text-gray-400">info@evergreenpest.com</span></li>
                <li><span className="text-sm text-gray-400">Mon-Sat 7am-7pm</span></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-500">
              &copy; {new Date().getFullYear()} Evergreen Pest Solutions. All rights reserved.
            </p>
            <p className="text-xs text-gray-500 flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-sky-500"><path d="M24.3 4.2c-1.5-.4-3.2.1-4.5 1.1-1-.7-2.3-1-3.5-.8-2.4.4-4.2 2.5-4.2 4.9v.6c-3.2.8-6 2.8-7.8 5.6-.3.5-.1 1.1.4 1.4.5.3 1.1.1 1.4-.4 1.5-2.3 3.7-4 6.3-4.7.5-.1 1-.1 1.5 0 .8.2 1.4.8 1.7 1.5.3.8.2 1.6-.2 2.3l-2.8 4.3c-.6.9-.4 2.1.4 2.8l2.5 2.1c.4.3.8.5 1.3.5h5.2c.5 0 1-.2 1.3-.5l1.2-1c.6-.5.8-1.3.6-2l-1-3.2c-.2-.5 0-1.1.4-1.4l3.8-2.5c1.3-.9 2.1-2.3 2.1-3.9V9.6c0-2.5-1.7-4.7-4.1-5.3v-.1z" fill="currentColor"/></svg>Created by{" "}
              <a href="https://bluejayportfolio.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" style={{ color: ORANGE_LIGHT }}>
                bluejayportfolio.com
              </a>
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
