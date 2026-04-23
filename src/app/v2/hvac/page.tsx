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
  Thermometer,
  Snowflake,
  Fan,
  Wind,
  Drop,
  ShieldCheck,
  Star,
  Phone,
  MapPin,
  Clock,
  ArrowRight,
  CaretDown,
  CheckCircle,
  Envelope,
  X,
  List,
  Wrench,
  Lightning,
  House,
  Medal,
  Users,
  CurrencyDollar,
  SealCheck,
  Leaf,
  Warning,
  Fire,
  SpeakerHigh,
  CloudSnow,
  Sun,
  TreeEvergreen,
  Timer,
  ArrowsClockwise,
  Gear,
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
const NAVY = "#0c1222";
const BLUE = "#0ea5e9";
const BLUE_LIGHT = "#38bdf8";
const ORANGE = "#f97316";
const ORANGE_LIGHT = "#fb923c";
const BLUE_GLOW = "rgba(14, 165, 233, 0.15)";
const ORANGE_GLOW = "rgba(249, 115, 22, 0.15)";

/* ───────────────────────── DATA ───────────────────────── */
const BUSINESS = "Summit Heating & Air";
const OWNER = "Dave Morrison";
const PHONE = "(206) 555-7834";
const ADDRESS = "4712 Rainier Ave S, Seattle, WA 98118";
const ADDRESS_ENCODED = encodeURIComponent(ADDRESS);

const SERVICES = [
  { icon: Snowflake, title: "AC Repair", desc: "Fast diagnostics and repair for all makes and models. We restore your cool when you need it most." },
  { icon: Fire, title: "Heating Repair", desc: "Furnace not firing? Boiler leaking? Our certified technicians fix it the same day you call." },
  { icon: Gear, title: "New Installation", desc: "Energy-efficient systems sized perfectly for your home. Includes permits, ductwork, and a 10-year warranty." },
  { icon: Wrench, title: "Maintenance", desc: "Annual tune-ups that extend system life by years. Prevent breakdowns before they happen." },
  { icon: Wind, title: "Duct Cleaning", desc: "Remove dust, allergens, and debris from your ductwork. Breathe cleaner air starting today." },
  { icon: Leaf, title: "Indoor Air Quality", desc: "HEPA filtration, UV purifiers, and whole-home humidifiers for healthier indoor air." },
];

const PROCESS_STEPS = [
  { step: "01", title: "Schedule", desc: "Book online or call. Same-day and weekend appointments available." },
  { step: "02", title: "Diagnose", desc: "Our tech arrives on time, inspects your system, and explains the issue clearly." },
  { step: "03", title: "Approve", desc: "You get upfront pricing before any work begins. No surprises, no hidden fees." },
  { step: "04", title: "Complete", desc: "We fix it right the first time, clean up, and test everything before we leave." },
  { step: "05", title: "Follow Up", desc: "We check in after 48 hours to make sure everything is running perfectly." },
];

const DIAGNOSTIC_SYMPTOMS = [
  { id: "noise", label: "Strange Noise", icon: SpeakerHigh, issue: "Could be a failing blower motor, loose belt, or worn bearings.", urgency: "yellow" as const, action: "Schedule a diagnostic within 1-2 weeks." },
  { id: "airflow", label: "Weak Airflow", icon: Wind, issue: "Likely a clogged filter, blocked duct, or failing compressor.", urgency: "yellow" as const, action: "Replace filter first. If unchanged, schedule service." },
  { id: "bills", label: "High Energy Bills", icon: CurrencyDollar, issue: "System running inefficiently. Could need maintenance or replacement.", urgency: "green" as const, action: "Schedule a tune-up and efficiency audit." },
  { id: "uneven", label: "Uneven Temperatures", icon: Thermometer, issue: "Ductwork leaks, zoning issues, or undersized system.", urgency: "yellow" as const, action: "Have a tech inspect your ductwork and airflow." },
  { id: "smell", label: "Bad Smell", icon: Warning, issue: "Burning smell = electrical issue. Musty = mold in ducts. Rotten egg = gas leak.", urgency: "red" as const, action: "If gas smell, evacuate and call 911. Otherwise call us ASAP." },
];

const SEASONAL_TASKS = [
  {
    season: "Spring",
    icon: TreeEvergreen,
    color: "#22c55e",
    tasks: ["Schedule AC tune-up", "Replace air filters", "Clear debris around outdoor unit", "Test thermostat cooling mode", "Check refrigerant levels"],
  },
  {
    season: "Summer",
    icon: Sun,
    color: ORANGE,
    tasks: ["Replace filters monthly", "Keep outdoor unit clear", "Check condensate drain", "Monitor energy bills for spikes", "Set thermostat to 78\u00B0F when away"],
  },
  {
    season: "Fall",
    icon: Leaf,
    color: "#f59e0b",
    tasks: ["Schedule furnace tune-up", "Replace air filter", "Test heating mode", "Seal windows and doors", "Check carbon monoxide detectors"],
  },
  {
    season: "Winter",
    icon: CloudSnow,
    color: BLUE_LIGHT,
    tasks: ["Replace filters every 60 days", "Keep vents unblocked", "Set fan to AUTO not ON", "Monitor for ice on outdoor unit", "Schedule mid-season checkup"],
  },
];

const TESTIMONIALS = [
  { name: "Karen & Jim Paulson", neighborhood: "Ballard", season: "Summer AC Repair", seasonIcon: Sun, seasonColor: ORANGE, rating: 5, savings: "$1,200", text: "Our AC died during a 95-degree week. Dave had a tech here in 2 hours. Saved us $1,200 compared to the quote we got from another company. Honest and fast." },
  { name: "Marcus Chen", neighborhood: "Capitol Hill", season: "Winter Furnace Install", seasonIcon: CloudSnow, seasonColor: BLUE_LIGHT, rating: 5, savings: "$3,400", text: "New furnace installed in one day. Our heating bill dropped 40% the first month. The crew was professional and left our basement spotless. $3,400 in savings the first year." },
  { name: "Diane Reeves", neighborhood: "Fremont", season: "Spring Tune-Up", seasonIcon: TreeEvergreen, seasonColor: "#22c55e", rating: 5, savings: "$800", text: "Spring maintenance caught a cracked heat exchanger before it became dangerous. Probably saved us $800 in emergency repairs. We're customers for life." },
  { name: "Tom & Lisa Nguyen", neighborhood: "Beacon Hill", season: "Fall Maintenance", seasonIcon: Leaf, seasonColor: "#f59e0b", rating: 5, savings: "$950", text: "Fall tune-up revealed our ducts were 30% blocked. After cleaning, our system runs so much quieter and our bills dropped $950 over the winter." },
  { name: "Rachel Hoffman", neighborhood: "Queen Anne", season: "Summer AC Repair", seasonIcon: Sun, seasonColor: ORANGE, rating: 5, savings: "$600", text: "Honest team. They fixed a capacitor for $180 when another company quoted me $600 for a full compressor replacement. Summit is the real deal." },
  { name: "Brian O'Malley", neighborhood: "Wallingford", season: "Winter Furnace Install", seasonIcon: CloudSnow, seasonColor: BLUE_LIGHT, rating: 5, savings: "$2,100", text: "Replaced our 25-year-old furnace with a high-efficiency model. The tax credit plus energy savings netted us $2,100 back in year one. Dave walked us through every option." },
];

const PLANS = [
  { name: "Basic", price: "$89", period: "/visit", features: ["Annual AC tune-up", "Annual furnace tune-up", "Filter replacement", "Priority scheduling", "10% off repairs"], popular: false },
  { name: "Comfort Club", price: "$149", period: "/year", features: ["2 tune-ups per year", "Filter replacements (4x)", "Priority 24/7 scheduling", "15% off all repairs", "No overtime charges", "Duct inspection"], popular: true },
  { name: "Premium", price: "$249", period: "/year", features: ["2 tune-ups per year", "Filter replacements (4x)", "Priority 24/7 scheduling", "20% off all repairs", "No overtime charges", "Annual duct cleaning", "Indoor air quality check", "Thermostat calibration"], popular: false },
];

const COMPARISON_ROWS = [
  { feature: "Same-Day Service", us: true, them: "2-3 day wait" },
  { feature: "Upfront Pricing", us: true, them: "Surprise fees" },
  { feature: "Licensed & Insured", us: true, them: "Sometimes" },
  { feature: "24/7 Emergency Line", us: true, them: "Business hours" },
  { feature: "10-Year Warranty", us: true, them: "1-year max" },
  { feature: "Free Second Opinions", us: true, them: "No" },
  { feature: "Financing Available", us: true, them: "Varies" },
];

const FAQ_DATA = [
  { q: "How often should I replace my air filter?", a: "Every 1-3 months depending on usage, pets, and allergies. During heavy use seasons (summer/winter), check monthly. A dirty filter makes your system work harder, increasing bills and reducing lifespan." },
  { q: "How long does a new HVAC system last?", a: "A well-maintained furnace lasts 15-20 years. Air conditioners typically last 12-15 years. Heat pumps average 10-15 years. Regular maintenance is the single biggest factor in extending system life." },
  { q: "Do you offer financing?", a: "Yes. We partner with GreenSky and Synchrony to offer 0% APR for 12 months on systems over $3,000. Longer terms available. No prepayment penalties." },
  { q: "What does a tune-up include?", a: "We inspect all components, clean coils and burners, check refrigerant levels, test electrical connections, calibrate the thermostat, and replace the filter. Takes about 60-90 minutes." },
  { q: "Is it worth repairing my old system or replacing it?", a: "Our rule of thumb: if the repair costs more than 50% of a new system AND the unit is over 10 years old, replacement usually makes more financial sense. We'll give you both options and the math." },
  { q: "Do you service all brands?", a: "Yes. Carrier, Lennox, Trane, Rheem, Goodman, Daikin, Mitsubishi, and more. Our techs are factory-trained on all major brands." },
];

const NEIGHBORHOODS = [
  "Ballard", "Capitol Hill", "Fremont", "Queen Anne", "Wallingford",
  "Beacon Hill", "Columbia City", "Ravenna", "Green Lake", "Magnolia",
  "West Seattle", "Georgetown", "University District", "Northgate", "Lake City",
];

/* ───────────────────────── FLOATING PARTICLES ───────────────────────── */
function FloatingParticles() {
  const particles = Array.from({ length: 28 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 8,
    duration: 7 + Math.random() * 6,
    size: 2 + Math.random() * 4,
    opacity: 0.12 + Math.random() * 0.3,
    isCool: i % 3 !== 0,
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
            background: p.isCool ? BLUE_LIGHT : ORANGE_LIGHT,
            willChange: "transform, opacity",
          }}
          animate={{
            y: p.isCool ? ["-10vh", "110vh"] : ["110vh", "-10vh"],
            opacity: [0, p.opacity, p.opacity, 0],
          }}
          transition={{
            y: { duration: p.duration, repeat: Infinity, delay: p.delay, ease: "linear" },
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

/* ───────────────────────── GLASS CARD ───────────────────────── */
function GlassCard({
  children,
  className = "",
  hover = true,
}: {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <div
      className={`relative rounded-2xl border border-white/15 bg-white/[0.07] backdrop-blur-md ${hover ? "transition-all duration-300 hover:border-white/20 hover:bg-white/[0.07]" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

/* ───────────────────────── SHIMMER BORDER ───────────────────────── */
function ShimmerBorder({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative rounded-2xl p-[1px] ${className}`}>
      <div
        className="absolute inset-0 rounded-2xl"
        style={{
          background: `conic-gradient(from var(--shimmer-angle, 0deg), transparent 40%, ${BLUE} 50%, ${ORANGE} 60%, transparent 70%)`,
          animation: "shimmer-spin 4s linear infinite",
        }}
      />
      <div className="relative rounded-2xl bg-[#0c1222]">{children}</div>
      <style>{`
        @property --shimmer-angle { syntax: "<angle>"; initial-value: 0deg; inherits: false; }
        @keyframes shimmer-spin { to { --shimmer-angle: 360deg; } }
      `}</style>
    </div>
  );
}

/* ───────────────────────── MAGNETIC BUTTON ───────────────────────── */
function MagneticButton({
  children,
  className = "",
  href,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  href?: string;
  onClick?: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mx = useSpring(x, springFast);
  const my = useSpring(y, springFast);

  const handleMouse = useCallback(
    (e: React.MouseEvent) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      x.set((e.clientX - rect.left - rect.width / 2) * 0.3);
      y.set((e.clientY - rect.top - rect.height / 2) * 0.3);
    },
    [x, y]
  );

  const reset = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  const Tag = href ? "a" : "button";

  return (
    <motion.div ref={ref} style={{ x: mx, y: my }} onMouseMove={handleMouse} onMouseLeave={reset} className="inline-block">
      <Tag href={href || undefined} onClick={onClick} className={className}>
        {children}
      </Tag>
    </motion.div>
  );
}

/* ───────────────────────── SECTION HEADER ───────────────────────── */
function SectionHeader({ label, title, accent }: { label: string; title: string; accent?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <div ref={ref} className="text-center mb-16">
      <motion.p
        initial={{ opacity: 0, y: 15 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ ...spring, delay: 0.05 }}
        className="uppercase tracking-[0.25em] text-sm font-semibold mb-3"
        style={{ color: BLUE_LIGHT }}
      >
        {label}
      </motion.p>
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ ...spring, delay: 0.15 }}
        className="text-3xl md:text-5xl font-bold text-white"
      >
        {title}{" "}
        {accent && <span style={{ color: ORANGE }}>{accent}</span>}
      </motion.h2>
      <motion.div
        initial={{ scaleX: 0 }}
        animate={inView ? { scaleX: 1 } : {}}
        transition={{ ...spring, delay: 0.25 }}
        className="mx-auto mt-4 h-1 w-24 rounded-full origin-left"
        style={{ background: `linear-gradient(90deg, ${BLUE}, ${ORANGE})` }}
      />
    </div>
  );
}

/* ───────────────────────── WORD REVEAL ───────────────────────── */
function WordReveal({ text, className = "" }: { text: string; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const words = text.split(" ");

  return (
    <span ref={ref} className={className}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
          animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
          transition={{ ...springGentle, delay: i * 0.06 }}
          className="inline-block mr-[0.3em]"
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
}

/* ───────────────────────── COMFORT GAUGE HERO ───────────────────────── */
function ComfortGauge() {
  const [temp, setTemp] = useState(50);
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    let frame: number;
    let start: number | null = null;
    const duration = 2800;
    const animate = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      // Sweep from 50 to 95, then settle at 72
      if (progress < 0.6) {
        const sweep = eased / 0.6;
        setTemp(Math.round(50 + sweep * 45));
      } else {
        const settle = (progress - 0.6) / 0.4;
        const settleEased = 1 - Math.pow(1 - settle, 2);
        setTemp(Math.round(95 - settleEased * 23));
      }
      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      } else {
        setTemp(72);
        setSettled(true);
      }
    };
    const timer = setTimeout(() => {
      frame = requestAnimationFrame(animate);
    }, 600);
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(frame);
    };
  }, []);

  // Gauge angles: 50F = -135deg, 95F = 135deg, 72F ~= comfort zone
  const getTempAngle = (t: number) => {
    return -135 + ((t - 50) / 45) * 270;
  };
  const angle = getTempAngle(temp);
  const needleRad = (angle - 90) * (Math.PI / 180);
  const needleLen = 70;
  const cx = 120;
  const cy = 120;
  const nx = cx + Math.cos(needleRad) * needleLen;
  const ny = cy + Math.sin(needleRad) * needleLen;

  // Color based on temp
  const getColor = (t: number) => {
    if (t <= 60) return BLUE;
    if (t <= 68) return BLUE_LIGHT;
    if (t >= 68 && t <= 76) return "#22c55e";
    if (t <= 85) return ORANGE;
    return "#ef4444";
  };
  const color = getColor(temp);

  // Arc segments
  const makeArc = (startAngle: number, endAngle: number, radius: number) => {
    const startRad = (startAngle - 90) * (Math.PI / 180);
    const endRad = (endAngle - 90) * (Math.PI / 180);
    const x1 = cx + Math.cos(startRad) * radius;
    const y1 = cy + Math.sin(startRad) * radius;
    const x2 = cx + Math.cos(endRad) * radius;
    const y2 = cy + Math.sin(endRad) * radius;
    const large = endAngle - startAngle > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${large} 1 ${x2} ${y2}`;
  };

  const badges = [
    { label: "Heating", icon: Fire, x: 20, y: 45 },
    { label: "Cooling", icon: Snowflake, x: 220, y: 45 },
    { label: "Air Quality", icon: Leaf, x: 120, y: 230 },
  ];

  return (
    <div className="relative w-[280px] h-[280px] mx-auto">
      <svg viewBox="0 0 240 260" className="w-full h-full">
        {/* Background arc track */}
        <path d={makeArc(-135, 135, 90)} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="14" strokeLinecap="round" />
        {/* Cold zone (blue) */}
        <path d={makeArc(-135, -75, 90)} fill="none" stroke={BLUE} strokeWidth="14" strokeLinecap="round" opacity={0.5} />
        {/* Comfort zone (green) */}
        <path d={makeArc(-15, 45, 90)} fill="none" stroke="#22c55e" strokeWidth="14" strokeLinecap="round" opacity={0.5} />
        {/* Hot zone (red/orange) */}
        <path d={makeArc(75, 135, 90)} fill="none" stroke="#ef4444" strokeWidth="14" strokeLinecap="round" opacity={0.5} />

        {/* Needle glow */}
        <line x1={cx} y1={cy} x2={nx} y2={ny} stroke={color} strokeWidth="5" strokeLinecap="round" opacity={0.3} />
        {/* Needle */}
        <line x1={cx} y1={cy} x2={nx} y2={ny} stroke={color} strokeWidth="3" strokeLinecap="round" />
        {/* Center dot */}
        <circle cx={cx} cy={cy} r="8" fill={NAVY} stroke={color} strokeWidth="2" />

        {/* Temperature readout */}
        <text x={cx} y={cy + 2} textAnchor="middle" dominantBaseline="central" fill="white" fontSize="24" fontWeight="700" fontFamily="monospace">
          {temp}&deg;F
        </text>

        {/* Comfort label */}
        {settled && (
          <text x={cx} y={cy + 52} textAnchor="middle" fill="#22c55e" fontSize="11" fontWeight="600" opacity={0.9}>
            COMFORT ZONE
          </text>
        )}

        {/* Scale labels */}
        <text x="22" y="165" fill="rgba(255,255,255,0.4)" fontSize="9">50&deg;</text>
        <text x="207" y="165" fill="rgba(255,255,255,0.4)" fontSize="9">95&deg;</text>
      </svg>

      {/* Badges around gauge */}
      {badges.map((b, i) => (
        <motion.div
          key={b.label}
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ ...spring, delay: 1.5 + i * 0.2 }}
          className="absolute flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-white/15 bg-white/[0.06] backdrop-blur-sm text-xs text-white/80"
          style={{ left: b.x - 30, top: b.y }}
        >
          <b.icon size={13} weight="fill" style={{ color: i === 0 ? ORANGE : i === 1 ? BLUE : "#22c55e" }} />
          {b.label}
        </motion.div>
      ))}
    </div>
  );
}

/* ───────────────────────── ENERGY CALCULATOR ───────────────────────── */
function EnergyCalculator() {
  const [systemAge, setSystemAge] = useState(12);
  const [systemType, setSystemType] = useState<"central-ac" | "furnace" | "heat-pump">("central-ac");

  const baseEfficiency: Record<string, number> = { "central-ac": 10, "furnace": 80, "heat-pump": 8 };
  const newEfficiency: Record<string, number> = { "central-ac": 18, "furnace": 97, "heat-pump": 15 };
  const avgAnnualCost: Record<string, number> = { "central-ac": 1800, "furnace": 2200, "heat-pump": 2000 };

  const degradation = Math.min(systemAge * 2, 40);
  const currentEffPct = (baseEfficiency[systemType] - (baseEfficiency[systemType] * degradation) / 100);
  const newEffPct = newEfficiency[systemType];
  const savingsPercent = Math.round(((newEffPct - currentEffPct) / newEffPct) * 100);
  const annualSavings = Math.round(avgAnnualCost[systemType] * (savingsPercent / 100));
  const monthlySavings = Math.round(annualSavings / 12);
  const systemCost = systemType === "heat-pump" ? 8000 : systemType === "furnace" ? 5500 : 6500;
  const paybackYears = annualSavings > 0 ? (systemCost / annualSavings).toFixed(1) : "N/A";

  return (
    <GlassCard className="p-6 md:p-8 max-w-2xl mx-auto">
      <div className="space-y-6">
        <div>
          <label className="block text-white/70 text-sm mb-2">System Type</label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { key: "central-ac" as const, label: "Central AC", icon: Snowflake },
              { key: "furnace" as const, label: "Furnace", icon: Fire },
              { key: "heat-pump" as const, label: "Heat Pump", icon: ArrowsClockwise },
            ].map((s) => (
              <button
                key={s.key}
                onClick={() => setSystemType(s.key)}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                  systemType === s.key
                    ? "border-sky-400 bg-sky-500/10 text-white"
                    : "border-white/15 bg-white/[0.08] text-white/50 hover:border-white/20"
                }`}
              >
                <s.icon size={22} weight={systemType === s.key ? "fill" : "regular"} />
                <span className="text-xs font-medium">{s.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-white/70 text-sm mb-2">
            System Age: <span className="text-white font-semibold">{systemAge} years</span>
          </label>
          <input
            type="range"
            min={1}
            max={30}
            value={systemAge}
            onChange={(e) => setSystemAge(Number(e.target.value))}
            className="w-full accent-sky-500"
          />
          <div className="flex justify-between text-xs text-white/40 mt-1">
            <span>1 year</span>
            <span>30 years</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/15">
          <div className="text-center">
            <p className="text-2xl md:text-3xl font-bold" style={{ color: "#22c55e" }}>
              ${annualSavings}
            </p>
            <p className="text-xs text-white/50 mt-1">Annual Savings</p>
          </div>
          <div className="text-center">
            <p className="text-2xl md:text-3xl font-bold" style={{ color: BLUE_LIGHT }}>
              ${monthlySavings}
            </p>
            <p className="text-xs text-white/50 mt-1">Monthly Savings</p>
          </div>
          <div className="text-center">
            <p className="text-2xl md:text-3xl font-bold" style={{ color: ORANGE }}>
              {paybackYears}
            </p>
            <p className="text-xs text-white/50 mt-1">Payback (Years)</p>
          </div>
        </div>

        <p className="text-xs text-white/40 text-center">
          *Estimates based on regional averages and ENERGY STAR data. Actual savings vary by usage patterns and home insulation.
        </p>
      </div>
    </GlassCard>
  );
}

/* ───────────────────────── DIAGNOSTIC QUIZ ───────────────────────── */
function DiagnosticQuiz() {
  const [selected, setSelected] = useState<string | null>(null);
  const symptom = DIAGNOSTIC_SYMPTOMS.find((s) => s.id === selected);
  const urgencyColors = { green: "#22c55e", yellow: "#eab308", red: "#ef4444" };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        {DIAGNOSTIC_SYMPTOMS.map((s) => (
          <button
            key={s.id}
            onClick={() => setSelected(s.id === selected ? null : s.id)}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
              selected === s.id
                ? "border-sky-400 bg-sky-500/10 text-white"
                : "border-white/15 bg-white/[0.08] text-white/60 hover:border-white/20 hover:text-white"
            }`}
          >
            <s.icon size={24} weight={selected === s.id ? "fill" : "regular"} />
            <span className="text-xs font-medium text-center">{s.label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {symptom && (
          <motion.div
            key={symptom.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={spring}
          >
            <GlassCard className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: urgencyColors[symptom.urgency], boxShadow: `0 0 12px ${urgencyColors[symptom.urgency]}` }}
                />
                <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: urgencyColors[symptom.urgency] }}>
                  {symptom.urgency === "red" ? "Urgent" : symptom.urgency === "yellow" ? "Moderate" : "Low"} Priority
                </span>
              </div>
              <p className="text-white/80 mb-2 text-sm leading-relaxed">{symptom.issue}</p>
              <p className="text-white font-medium text-sm">{symptom.action}</p>
              <div className="mt-4">
                <a
                  href={`tel:${PHONE.replace(/[^0-9+]/g, "")}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white"
                  style={{ background: symptom.urgency === "red" ? "#ef4444" : BLUE }}
                >
                  <Phone size={16} weight="fill" />
                  {symptom.urgency === "red" ? "Call Now" : "Schedule Service"}
                </a>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ───────────────────────── FAQ ACCORDION ───────────────────────── */
function FAQAccordion() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="max-w-3xl mx-auto space-y-3">
      {FAQ_DATA.map((faq, i) => (
        <GlassCard key={i} className="overflow-hidden" hover={false}>
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between p-5 text-left"
          >
            <span className="text-white font-medium pr-4">{faq.q}</span>
            <motion.div animate={{ rotate: open === i ? 180 : 0 }} transition={springFast}>
              <CaretDown size={20} className="text-white/50 flex-shrink-0" />
            </motion.div>
          </button>
          <AnimatePresence initial={false}>
            {open === i && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: "auto" }}
                exit={{ height: 0 }}
                transition={springGentle}
                className="overflow-hidden"
              >
                <p className="px-5 pb-5 text-white/60 text-sm leading-relaxed">{faq.a}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </GlassCard>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
/*                      MAIN PAGE COMPONENT                      */
/* ═══════════════════════════════════════════════════════════════ */
export default function HVACShowcase() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", phone: "", email: "", service: "", message: "" });

  const navLinks = [
    { label: "Services", href: "#services" },
    { label: "About", href: "#about" },
    { label: "Reviews", href: "#reviews" },
    { label: "Pricing", href: "#pricing" },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: NAVY, color: "white" }}>
      <FloatingParticles />

      {/* ──────────────── NAVIGATION ──────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-7xl px-4 py-3">
          <GlassCard className="flex items-center justify-between px-5 py-3" hover={false}>
            <a href="#" className="flex items-center gap-2">
              <Thermometer size={28} weight="fill" style={{ color: BLUE }} />
              <span className="font-bold text-lg text-white">{BUSINESS}</span>
            </a>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-6">
              {navLinks.map((l) => (
                <a key={l.label} href={l.href} className="text-sm text-white/70 hover:text-white transition-colors">
                  {l.label}
                </a>
              ))}
              <MagneticButton
                href={`tel:${PHONE.replace(/[^0-9+]/g, "")}`}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-white"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: "#22c55e" }} />
                  <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: "#22c55e" }} />
                </span>
                {PHONE}
              </MagneticButton>
            </div>

            {/* Mobile hamburger */}
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 text-white/80">
              {menuOpen ? <X size={24} /> : <List size={24} />}
            </button>
          </GlassCard>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={springFast}
              className="md:hidden mx-4 mt-1"
            >
              <GlassCard className="p-4 space-y-3" hover={false}>
                {navLinks.map((l) => (
                  <a
                    key={l.label}
                    href={l.href}
                    onClick={() => setMenuOpen(false)}
                    className="block text-white/70 hover:text-white py-2 transition-colors"
                  >
                    {l.label}
                  </a>
                ))}
                <a
                  href={`tel:${PHONE.replace(/[^0-9+]/g, "")}`}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold text-white justify-center"
                  style={{ background: BLUE }}
                >
                  <Phone size={16} weight="fill" /> {PHONE}
                </a>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ──────────────── HERO ──────────────── */}
      <section className="relative min-h-screen flex items-center pt-28 pb-16">
        {/* Gradient orbs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl" style={{ background: BLUE }} />
        <div className="absolute bottom-20 right-1/4 w-80 h-80 rounded-full opacity-15 blur-3xl" style={{ background: ORANGE }} />

        <div className="relative z-10 mx-auto max-w-7xl px-4 w-full">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left: Text */}
            <div className="order-2 md:order-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...spring, delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/15 bg-white/[0.07] text-sm text-white/70 mb-6"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: "#22c55e" }} />
                  <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: "#22c55e" }} />
                </span>
                24/7 Emergency Service Available
              </motion.div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                <WordReveal text="Seattle's Trusted" className="text-white" />
                <br />
                <WordReveal text="HVAC Experts" className="" />
              </h1>

              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...spring, delay: 0.6 }}
                className="text-lg text-white/60 max-w-lg mb-8 leading-relaxed"
              >
                From emergency repairs to full installations, {BUSINESS} keeps Seattle homes comfortable all year. Led by {OWNER} with 18 years of experience.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...spring, delay: 0.8 }}
                className="flex flex-wrap gap-4 mb-8"
              >
                <MagneticButton
                  href={`tel:${PHONE.replace(/[^0-9+]/g, "")}`}
                  className="flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-white text-sm"
                >
                  <Phone size={18} weight="fill" /> Call Now
                </MagneticButton>
                <MagneticButton
                  href="#contact"
                  className="flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm border border-white/20 text-white hover:bg-white/5 transition-colors"
                >
                  Get Free Estimate <ArrowRight size={16} />
                </MagneticButton>
              </motion.div>

              {/* Trust pills */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ ...spring, delay: 1 }}
                className="flex flex-wrap gap-2"
              >
                {[
                  { icon: ShieldCheck, text: "Licensed & Insured" },
                  { icon: Star, text: "4.9 Star Rating" },
                  { icon: Clock, text: "Same-Day Service" },
                ].map((b) => (
                  <span
                    key={b.text}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-white/15 bg-white/[0.07] text-white/70"
                  >
                    <b.icon size={14} weight="fill" style={{ color: BLUE_LIGHT }} />
                    {b.text}
                  </span>
                ))}
              </motion.div>
            </div>

            {/* Right: Comfort Gauge */}
            <motion.div
              className="order-1 md:order-2 flex justify-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ ...springGentle, delay: 0.3 }}
            >
              <div className="relative">
                {/* Glow behind gauge */}
                <div className="absolute inset-0 rounded-full blur-3xl opacity-20" style={{ background: `radial-gradient(circle, ${BLUE}, transparent 70%)` }} />
                <ComfortGauge />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ──────────────── TRUST BAR / STATS ──────────────── */}
      <section className="relative py-8 border-y border-white/8" style={{ background: "rgba(14,165,233,0.03)" }}>
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: "18+", label: "Years in Business", icon: Medal },
              { value: "4,200+", label: "Homes Served", icon: House },
              { value: "4.9", label: "Google Rating", icon: Star },
              { value: "60 min", label: "Avg Response Time", icon: Timer },
            ].map((stat, i) => {
              const ref = useRef(null);
              const inView = useInView(ref, { once: true });
              return (
                <motion.div
                  key={stat.label}
                  ref={ref}
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ ...spring, delay: i * 0.1 }}
                  className="text-center"
                >
                  <stat.icon size={24} weight="fill" style={{ color: BLUE_LIGHT }} className="mx-auto mb-2" />
                  <p className="text-2xl md:text-3xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-white/50 mt-1">{stat.label}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ──────────────── EMERGENCY CTA ──────────────── */}
      <section className="py-6">
        <div className="mx-auto max-w-5xl px-4">
          <ShimmerBorder>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-5 md:p-6">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full animate-ping opacity-30" style={{ background: "#ef4444" }} />
                  <div className="relative w-4 h-4 rounded-full" style={{ background: "#ef4444" }} />
                </div>
                <div>
                  <p className="text-white font-bold text-lg">No Heat? No AC? We&apos;re On Our Way.</p>
                  <p className="text-white/50 text-sm">24/7 emergency service. Average arrival: 60 minutes.</p>
                </div>
              </div>
              <a
                href={`tel:${PHONE.replace(/[^0-9+]/g, "")}`}
                className="flex items-center gap-2 px-6 py-3 rounded-full font-bold text-white whitespace-nowrap"
                style={{ background: "#ef4444" }}
              >
                <Phone size={18} weight="fill" /> Emergency Line
              </a>
            </div>
          </ShimmerBorder>
        </div>
      </section>

      {/* ──────────────── SERVICES ──────────────── */}
      <section id="services" className="relative py-24">
        <div className="absolute inset-0 opacity-30" style={{ background: `radial-gradient(ellipse at 50% 20%, ${BLUE_GLOW}, transparent 60%)` }} />
        <div className="relative z-10 mx-auto max-w-7xl px-4">
          <SectionHeader label="What We Do" title="Our" accent="Services" />

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {SERVICES.map((s, i) => (
              <motion.div key={s.title} variants={fadeUp}>
                <GlassCard className="p-6 h-full group">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors duration-300 group-hover:scale-110"
                    style={{ background: i % 2 === 0 ? `${BLUE}15` : `${ORANGE}15` }}
                  >
                    <s.icon size={24} weight="duotone" style={{ color: i % 2 === 0 ? BLUE : ORANGE }} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{s.title}</h3>
                  <p className="text-sm text-white/55 leading-relaxed">{s.desc}</p>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ──────────────── ABOUT ──────────────── */}
      <section id="about" className="relative py-24">
        <div className="absolute inset-0 opacity-20" style={{ background: `radial-gradient(ellipse at 70% 50%, ${ORANGE_GLOW}, transparent 60%)` }} />
        <div className="relative z-10 mx-auto max-w-6xl px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <GlassCard className="overflow-hidden" hover={false}>
                <img
                  src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop"
                  alt={`${OWNER} - Owner of ${BUSINESS}`}
                  className="w-full h-80 object-cover object-top"
                />
              </GlassCard>
            </div>
            <div>
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="uppercase tracking-[0.25em] text-sm font-semibold mb-3"
                style={{ color: BLUE_LIGHT }}
              >
                About Us
              </motion.p>
              <motion.h2
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={spring}
                className="text-3xl md:text-4xl font-bold text-white mb-6"
              >
                Meet <span style={{ color: ORANGE }}>{OWNER}</span>
              </motion.h2>
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ ...spring, delay: 0.15 }}
                className="space-y-4 text-white/60 leading-relaxed"
              >
                <p>
                  {OWNER} founded {BUSINESS} in 2008 after spending a decade working for one of Seattle&apos;s largest HVAC contractors. He saw an industry that overcharged, underdelivered, and treated homeowners like transactions instead of neighbors.
                </p>
                <p>
                  Today, Summit serves over 4,200 homes across Seattle with a simple promise: honest diagnostics, upfront pricing, and work we&apos;d be proud to put in our own homes. Our team of 12 certified technicians is EPA-certified, NATE-trained, and committed to getting the job right the first time.
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ ...spring, delay: 0.3 }}
                className="flex flex-wrap gap-2 mt-6"
              >
                {["EPA Certified", "NATE Trained", "BBB A+ Rated", "Carrier Dealer"].map((b) => (
                  <span key={b} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-white/15 bg-white/[0.07] text-white/70">
                    <SealCheck size={14} weight="fill" style={{ color: BLUE_LIGHT }} />
                    {b}
                  </span>
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────── DIAGNOSTIC QUIZ ──────────────── */}
      <section className="relative py-24">
        <div className="absolute inset-0 opacity-20" style={{ background: `radial-gradient(ellipse at 30% 50%, ${BLUE_GLOW}, transparent 60%)` }} />
        <div className="relative z-10 mx-auto max-w-7xl px-4">
          <SectionHeader label="Self-Diagnosis" title="What&apos;s Wrong With" accent="Your System?" />
          <p className="text-center text-white/50 text-sm -mt-10 mb-10 max-w-lg mx-auto">
            Select a symptom below to get an instant assessment and recommended next step.
          </p>
          <DiagnosticQuiz />
        </div>
      </section>

      {/* ──────────────── ENERGY CALCULATOR ──────────────── */}
      <section className="relative py-24">
        <div className="absolute inset-0 opacity-20" style={{ background: `radial-gradient(ellipse at 60% 50%, ${ORANGE_GLOW}, transparent 60%)` }} />
        <div className="relative z-10 mx-auto max-w-7xl px-4">
          <SectionHeader label="Save Money" title="Energy Savings" accent="Calculator" />
          <p className="text-center text-white/50 text-sm -mt-10 mb-10 max-w-lg mx-auto">
            See how much a new, energy-efficient system could save you every year.
          </p>
          <EnergyCalculator />
        </div>
      </section>

      {/* ──────────────── PROCESS TIMELINE ──────────────── */}
      <section className="relative py-24">
        <div className="absolute inset-0 opacity-15" style={{ background: `radial-gradient(ellipse at 40% 50%, ${BLUE_GLOW}, transparent 60%)` }} />
        <div className="relative z-10 mx-auto max-w-5xl px-4">
          <SectionHeader label="How It Works" title="Our" accent="Process" />

          <div className="space-y-0">
            {PROCESS_STEPS.map((s, i) => {
              const ref = useRef(null);
              const inView = useInView(ref, { once: true, margin: "-40px" });
              return (
                <motion.div
                  key={s.step}
                  ref={ref}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ ...spring, delay: 0.1 }}
                  className="flex items-start gap-6 pb-8 relative"
                >
                  {/* Connecting line */}
                  {i < PROCESS_STEPS.length - 1 && (
                    <div className="absolute left-[23px] top-12 bottom-0 w-px" style={{ background: `linear-gradient(to bottom, ${BLUE}40, transparent)` }} />
                  )}
                  <div
                    className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold border"
                    style={{ borderColor: `${BLUE}40`, background: `${BLUE}10`, color: BLUE_LIGHT }}
                  >
                    {s.step}
                  </div>
                  <div className="pt-1">
                    <h3 className="text-lg font-bold text-white mb-1">{s.title}</h3>
                    <p className="text-sm text-white/55 leading-relaxed">{s.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ──────────────── SEASONAL MAINTENANCE CALENDAR ──────────────── */}
      <section className="relative py-24">
        <div className="absolute inset-0 opacity-20" style={{ background: `radial-gradient(ellipse at 50% 30%, ${ORANGE_GLOW}, transparent 60%)` }} />
        <div className="relative z-10 mx-auto max-w-7xl px-4">
          <SectionHeader label="Year-Round Care" title="Seasonal Maintenance" accent="Calendar" />

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {SEASONAL_TASKS.map((s) => (
              <motion.div key={s.season} variants={fadeUp}>
                <GlassCard className="p-6 h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${s.color}15` }}>
                      <s.icon size={22} weight="fill" style={{ color: s.color }} />
                    </div>
                    <h3 className="text-lg font-bold text-white">{s.season}</h3>
                  </div>
                  <ul className="space-y-2">
                    {s.tasks.map((task) => (
                      <li key={task} className="flex items-start gap-2 text-sm text-white/55">
                        <CheckCircle size={16} weight="fill" style={{ color: s.color }} className="flex-shrink-0 mt-0.5" />
                        {task}
                      </li>
                    ))}
                  </ul>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ──────────────── TESTIMONIALS (SEASON-TAGGED) ──────────────── */}
      <section id="reviews" className="relative py-24">
        <div className="absolute inset-0 opacity-15" style={{ background: `radial-gradient(ellipse at 50% 50%, ${BLUE_GLOW}, transparent 60%)` }} />
        <div className="relative z-10 mx-auto max-w-7xl px-4">
          {/* Google Reviews header */}
          <div className="text-center mb-4">
            <div className="inline-flex items-center gap-2 text-sm text-white/60">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={18} weight="fill" style={{ color: "#facc15" }} />
                ))}
              </div>
              <span>4.9 rating from 340+ Google reviews</span>
            </div>
          </div>

          <SectionHeader label="What Homeowners Say" title="Season-Tagged" accent="Reviews" />

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {TESTIMONIALS.map((t, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="p-6 h-full flex flex-col">
                  {/* Season tag */}
                  <div className="flex items-center gap-2 mb-4">
                    <span
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                      style={{ background: `${t.seasonColor}15`, color: t.seasonColor, border: `1px solid ${t.seasonColor}30` }}
                    >
                      <t.seasonIcon size={13} weight="fill" />
                      {t.season}
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "#22c55e15", color: "#22c55e" }}>
                      Saved {t.savings}
                    </span>
                  </div>

                  {/* Stars */}
                  <div className="flex gap-0.5 mb-3">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star key={j} size={16} weight="fill" style={{ color: "#facc15" }} />
                    ))}
                  </div>

                  {/* Quote */}
                  <p className="text-sm text-white/60 leading-relaxed flex-grow italic">&ldquo;{t.text}&rdquo;</p>

                  {/* Name & neighborhood */}
                  <div className="mt-4 pt-4 border-t border-white/8 flex items-center gap-2">
                    <CheckCircle size={16} weight="fill" style={{ color: BLUE_LIGHT }} />
                    <div>
                      <p className="text-sm font-semibold text-white">{t.name}</p>
                      <p className="text-xs text-white/40">{t.neighborhood}, Seattle</p>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ──────────────── MAINTENANCE PLAN PRICING ──────────────── */}
      <section id="pricing" className="relative py-24">
        <div className="absolute inset-0 opacity-20" style={{ background: `radial-gradient(ellipse at 50% 50%, ${ORANGE_GLOW}, transparent 60%)` }} />
        <div className="relative z-10 mx-auto max-w-6xl px-4">
          <SectionHeader label="Maintenance Plans" title="Choose Your" accent="Comfort Plan" />

          <div className="grid md:grid-cols-3 gap-6">
            {PLANS.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ ...spring, delay: i * 0.12 }}
              >
                {plan.popular ? (
                  <ShimmerBorder className="h-full">
                    <div className="p-6 h-full flex flex-col">
                      <div className="text-center mb-6">
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-3" style={{ background: `${BLUE}20`, color: BLUE_LIGHT }}>
                          Most Popular
                        </span>
                        <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                        <div className="mt-2">
                          <span className="text-4xl font-bold text-white">{plan.price}</span>
                          <span className="text-white/40 text-sm">{plan.period}</span>
                        </div>
                      </div>
                      <ul className="space-y-3 flex-grow">
                        {plan.features.map((f) => (
                          <li key={f} className="flex items-center gap-2 text-sm text-white/70">
                            <CheckCircle size={16} weight="fill" style={{ color: BLUE_LIGHT }} />
                            {f}
                          </li>
                        ))}
                      </ul>
                      <MagneticButton
                        href="#contact"
                        className="flex items-center justify-center gap-2 w-full mt-6 px-5 py-3 rounded-full font-semibold text-sm text-white"
                      >
                        Get Started <ArrowRight size={16} />
                      </MagneticButton>
                    </div>
                  </ShimmerBorder>
                ) : (
                  <GlassCard className="p-6 h-full flex flex-col">
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                      <div className="mt-2">
                        <span className="text-4xl font-bold text-white">{plan.price}</span>
                        <span className="text-white/40 text-sm">{plan.period}</span>
                      </div>
                    </div>
                    <ul className="space-y-3 flex-grow">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-center gap-2 text-sm text-white/70">
                          <CheckCircle size={16} weight="fill" style={{ color: BLUE_LIGHT }} />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <MagneticButton
                      href="#contact"
                      className="flex items-center justify-center gap-2 w-full mt-6 px-5 py-3 rounded-full font-semibold text-sm text-white border border-white/20 hover:bg-white/5 transition-colors"
                    >
                      Learn More <ArrowRight size={16} />
                    </MagneticButton>
                  </GlassCard>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────── COMPARISON TABLE ──────────────── */}
      <section className="relative py-24">
        <div className="absolute inset-0 opacity-15" style={{ background: `radial-gradient(ellipse at 50% 50%, ${BLUE_GLOW}, transparent 60%)` }} />
        <div className="relative z-10 mx-auto max-w-3xl px-4">
          <SectionHeader label="Why Choose Us" title={`${BUSINESS} vs.`} accent="The Competition" />

          <GlassCard className="overflow-hidden" hover={false}>
            <div className="grid grid-cols-3 text-center border-b border-white/15 p-4">
              <div />
              <p className="text-sm font-bold" style={{ color: BLUE_LIGHT }}>{BUSINESS}</p>
              <p className="text-sm font-bold text-white/40">Others</p>
            </div>
            {COMPARISON_ROWS.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 text-center p-4 ${i < COMPARISON_ROWS.length - 1 ? "border-b border-white/8" : ""}`}>
                <p className="text-sm text-white/70 text-left">{row.feature}</p>
                <div className="flex justify-center">
                  <CheckCircle size={20} weight="fill" style={{ color: "#22c55e" }} />
                </div>
                <p className="text-xs text-white/40">{row.them}</p>
              </div>
            ))}
          </GlassCard>
        </div>
      </section>

      {/* ──────────────── FAQ ──────────────── */}
      <section className="relative py-24">
        <div className="absolute inset-0 opacity-15" style={{ background: `radial-gradient(ellipse at 40% 50%, ${ORANGE_GLOW}, transparent 60%)` }} />
        <div className="relative z-10 mx-auto max-w-7xl px-4">
          <SectionHeader label="Common Questions" title="Frequently" accent="Asked" />
          <FAQAccordion />
        </div>
      </section>

      {/* ──────────────── SERVICE AREA ──────────────── */}
      <section className="relative py-24">
        <div className="absolute inset-0 opacity-15" style={{ background: `radial-gradient(ellipse at 60% 50%, ${BLUE_GLOW}, transparent 60%)` }} />
        <div className="relative z-10 mx-auto max-w-5xl px-4">
          <SectionHeader label="Coverage" title="Seattle Neighborhoods" accent="We Serve" />

          <div className="flex flex-wrap justify-center gap-3">
            {NEIGHBORHOODS.map((n, i) => {
              const ref = useRef(null);
              const inView = useInView(ref, { once: true });
              return (
                <motion.span
                  key={n}
                  ref={ref}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={inView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ ...spring, delay: i * 0.04 }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm border border-white/15 bg-white/[0.08] text-white/60 hover:text-white hover:border-white/20 transition-all cursor-default"
                >
                  <MapPin size={14} style={{ color: BLUE_LIGHT }} />
                  {n}
                </motion.span>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={spring}
            className="text-center mt-8"
          >
            <p className="text-white/40 text-sm">
              Based at{" "}
              <a
                href={`https://maps.google.com/?q=${ADDRESS_ENCODED}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-white/60 transition-colors"
                style={{ color: BLUE_LIGHT }}
              >
                {ADDRESS}
              </a>
              {" "}&bull;{" "}Serving the greater Seattle metro area
            </p>
          </motion.div>
        </div>
      </section>

      {/* ──────────────── CONTACT FORM ──────────────── */}
      <section id="contact" className="relative py-24">
        <div className="absolute inset-0 opacity-20" style={{ background: `radial-gradient(ellipse at 50% 50%, ${ORANGE_GLOW}, transparent 60%)` }} />
        <div className="relative z-10 mx-auto max-w-3xl px-4">
          <SectionHeader label="Get In Touch" title="Request a Free" accent="Estimate" />

          <GlassCard className="p-6 md:p-8" hover={false}>
            <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs text-white/50 mb-1.5">Your Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.07] border border-white/15 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-sky-500/50 transition-colors"
                    placeholder="Dave Morrison"
                  />
                </div>
                <div>
                  <label className="block text-xs text-white/50 mb-1.5">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.07] border border-white/15 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-sky-500/50 transition-colors"
                    placeholder="(206) 555-1234"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-white/50 mb-1.5">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.07] border border-white/15 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-sky-500/50 transition-colors"
                  placeholder="dave@example.com"
                />
              </div>
              <div>
                <label className="block text-xs text-white/50 mb-1.5">Service Needed</label>
                <select
                  value={formData.service}
                  onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.07] border border-white/15 text-white text-sm focus:outline-none focus:border-sky-500/50 transition-colors"
                >
                  <option value="" className="bg-[#0c1222]">Select a service...</option>
                  <option value="ac-repair" className="bg-[#0c1222]">AC Repair</option>
                  <option value="heating" className="bg-[#0c1222]">Heating Repair</option>
                  <option value="installation" className="bg-[#0c1222]">New Installation</option>
                  <option value="maintenance" className="bg-[#0c1222]">Maintenance / Tune-Up</option>
                  <option value="ducts" className="bg-[#0c1222]">Duct Cleaning</option>
                  <option value="air-quality" className="bg-[#0c1222]">Indoor Air Quality</option>
                  <option value="emergency" className="bg-[#0c1222]">Emergency Service</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-white/50 mb-1.5">Message</label>
                <textarea
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.07] border border-white/15 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-sky-500/50 transition-colors resize-none"
                  placeholder="Tell us about your issue or what you need..."
                />
              </div>
              <MagneticButton className="flex items-center justify-center gap-2 w-full px-6 py-3.5 rounded-full font-semibold text-white text-sm">
                Send Request <ArrowRight size={16} />
              </MagneticButton>
            </form>
          </GlassCard>

          {/* Contact info below form */}
          <div className="grid sm:grid-cols-3 gap-4 mt-8">
            <GlassCard className="p-4 text-center">
              <Phone size={22} weight="fill" style={{ color: BLUE_LIGHT }} className="mx-auto mb-2" />
              <p className="text-xs text-white/40 mb-1">Call Us</p>
              <a href={`tel:${PHONE.replace(/[^0-9+]/g, "")}`} className="text-sm font-semibold text-white hover:underline">{PHONE}</a>
            </GlassCard>
            <GlassCard className="p-4 text-center">
              <Envelope size={22} weight="fill" style={{ color: BLUE_LIGHT }} className="mx-auto mb-2" />
              <p className="text-xs text-white/40 mb-1">Email Us</p>
              <a href="mailto:dave@summithvac.com" className="text-sm font-semibold text-white hover:underline">dave@summithvac.com</a>
            </GlassCard>
            <GlassCard className="p-4 text-center">
              <MapPin size={22} weight="fill" style={{ color: BLUE_LIGHT }} className="mx-auto mb-2" />
              <p className="text-xs text-white/40 mb-1">Visit Us</p>
              <a href={`https://maps.google.com/?q=${ADDRESS_ENCODED}`} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-white hover:underline">
                Rainier Valley
              </a>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* ──────────────── FINAL CTA ──────────────── */}
      <section className="relative py-24">
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${BLUE}10, ${ORANGE}10)` }} />
        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={spring}
          >
            <Thermometer size={48} weight="fill" style={{ color: BLUE }} className="mx-auto mb-6" />
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Ready for <span style={{ color: ORANGE }}>Year-Round Comfort</span>?
            </h2>
            <p className="text-lg text-white/50 max-w-xl mx-auto mb-8">
              Join 4,200+ Seattle homeowners who trust {BUSINESS} with their heating and cooling. Call now for a free estimate.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <MagneticButton
                href={`tel:${PHONE.replace(/[^0-9+]/g, "")}`}
                className="flex items-center gap-2 px-8 py-4 rounded-full font-bold text-white text-base"
              >
                <Phone size={20} weight="fill" /> {PHONE}
              </MagneticButton>
              <MagneticButton
                href="#contact"
                className="flex items-center gap-2 px-8 py-4 rounded-full font-bold text-base border border-white/20 text-white hover:bg-white/5 transition-colors"
              >
                Get Free Estimate <ArrowRight size={18} />
              </MagneticButton>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ──────────────── FOOTER ──────────────── */}
      <footer className="border-t border-white/8 py-12">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Thermometer size={24} weight="fill" style={{ color: BLUE }} />
                <span className="font-bold text-lg text-white">{BUSINESS}</span>
              </div>
              <p className="text-sm text-white/40 max-w-sm leading-relaxed">
                Seattle&apos;s trusted HVAC contractor since 2008. Honest diagnostics, upfront pricing, and comfort you can count on.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Quick Links</h4>
              <ul className="space-y-2">
                {navLinks.map((l) => (
                  <li key={l.label}>
                    <a href={l.href} className="text-sm text-white/40 hover:text-white transition-colors">{l.label}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-white/40">
                <li>
                  <a href={`tel:${PHONE.replace(/[^0-9+]/g, "")}`} className="hover:text-white transition-colors flex items-center gap-2">
                    <Phone size={14} /> {PHONE}
                  </a>
                </li>
                <li>
                  <a href="mailto:dave@summithvac.com" className="hover:text-white transition-colors flex items-center gap-2">
                    <Envelope size={14} /> dave@summithvac.com
                  </a>
                </li>
                <li>
                  <a href={`https://maps.google.com/?q=${ADDRESS_ENCODED}`} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-2">
                    <MapPin size={14} /> {ADDRESS}
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/8 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-white/30">
              &copy; {new Date().getFullYear()} {BUSINESS}. All rights reserved.
            </p>
            <p className="text-xs text-white/30 flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-sky-500"><path d="M24.3 4.2c-1.5-.4-3.2.1-4.5 1.1-1-.7-2.3-1-3.5-.8-2.4.4-4.2 2.5-4.2 4.9v.6c-3.2.8-6 2.8-7.8 5.6-.3.5-.1 1.1.4 1.4.5.3 1.1.1 1.4-.4 1.5-2.3 3.7-4 6.3-4.7.5-.1 1-.1 1.5 0 .8.2 1.4.8 1.7 1.5.3.8.2 1.6-.2 2.3l-2.8 4.3c-.6.9-.4 2.1.4 2.8l2.5 2.1c.4.3.8.5 1.3.5h5.2c.5 0 1-.2 1.3-.5l1.2-1c.6-.5.8-1.3.6-2l-1-3.2c-.2-.5 0-1.1.4-1.4l3.8-2.5c1.3-.9 2.1-2.3 2.1-3.9V9.6c0-2.5-1.7-4.7-4.1-5.3v-.1z" fill="currentColor"/></svg>Created by{" "}
              <a href="https://bluejayportfolio.com" target="_blank" rel="noopener noreferrer" className="hover:text-white/50 transition-colors underline">
                bluejayportfolio.com
              </a>
            </p>
          </div>
        </div>
      </footer>

      {/* ──────────────── GLOBAL BUTTON STYLES ──────────────── */}
      <style>{`
        a[class*="rounded-full"][class*="font-semibold"]:not([class*="border"]),
        button[class*="rounded-full"][class*="font-semibold"]:not([class*="border"]) {
          background: linear-gradient(135deg, ${BLUE}, ${BLUE_LIGHT});
        }
        a[class*="rounded-full"][class*="font-bold"]:not([class*="border"]),
        button[class*="rounded-full"][class*="font-bold"]:not([class*="border"]) {
          background: linear-gradient(135deg, ${BLUE}, ${BLUE_LIGHT});
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: ${BLUE};
          cursor: pointer;
          border: 2px solid white;
        }
        input[type="range"]::-webkit-slider-runnable-track {
          height: 6px;
          border-radius: 3px;
          background: rgba(255,255,255,0.1);
        }
      `}</style>
    </div>
  );
}
