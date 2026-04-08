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

/* ───────────────────────── WORD REVEAL ───────────────────────── */
function WordReveal({ text, className = "" }: { text: string; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const words = text.split(" ");

  return (
    <motion.span
      ref={ref}
      className={`inline-flex flex-wrap gap-x-3 ${className}`}
      variants={stagger}
      initial="hidden"
      animate={isInView ? "show" : "hidden"}
    >
      {words.map((word, i) => (
        <motion.span key={i} variants={fadeUp} className="inline-block">
          {word}
        </motion.span>
      ))}
    </motion.span>
  );
}

/* ───────────────────────── SECTION REVEAL ───────────────────────── */
function SectionReveal({
  children,
  className = "",
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.section
      ref={ref}
      id={id}
      className={className}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={spring}
    >
      {children}
    </motion.section>
  );
}

/* ───────────────────────── GLASS CARD ───────────────────────── */
function GlassCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] ${className}`}
    >
      {children}
    </div>
  );
}

/* ───────────────────────── MAGNETIC BUTTON ───────────────────────── */
function MagneticButton({
  children,
  className = "",
  onClick,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, springFast);
  const springY = useSpring(y, springFast);

  const isTouchDevice =
    typeof window !== "undefined" &&
    window.matchMedia("(pointer: coarse)").matches;

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!ref.current || isTouchDevice) return;
      const rect = ref.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      x.set((e.clientX - cx) * 0.25);
      y.set((e.clientY - cy) * 0.25);
    },
    [x, y, isTouchDevice]
  );

  const handleMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  return (
    <motion.button
      ref={ref}
      style={{ x: springX, y: springY, willChange: "transform", ...style }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={className}
      whileTap={{ scale: 0.97 }}
    >
      {children}
    </motion.button>
  );
}

/* ───────────────────────── SHIMMER BORDER ───────────────────────── */
function ShimmerBorder({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`relative rounded-2xl p-[1px] overflow-hidden ${className}`}>
      <motion.div
        className="absolute inset-0 rounded-2xl"
        style={{
          background: `conic-gradient(from 0deg, transparent, ${BLUE}, transparent, ${ORANGE}, transparent)`,
          willChange: "transform",
        }}
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      />
      <div className="relative rounded-2xl z-10" style={{ background: NAVY }}>
        {children}
      </div>
    </div>
  );
}

/* ───────────────────────── ACCORDION ITEM ───────────────────────── */
function AccordionItem({
  title,
  answer,
  isOpen,
  onToggle,
}: {
  title: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <GlassCard className="overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-5 md:p-6 text-left group cursor-pointer"
      >
        <span className="text-lg font-semibold text-white pr-4">{title}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={spring}>
          <CaretDown size={20} className="text-slate-400" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={spring}
            className="overflow-hidden"
          >
            <p className="px-5 pb-5 md:px-6 md:pb-6 text-slate-400 leading-relaxed">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
}

/* ───────────────────────── AIRFLOW WAVE SVG ───────────────────────── */
function AirflowWaves() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
      <motion.svg
        viewBox="0 0 1440 320"
        className="absolute bottom-0 w-full"
        preserveAspectRatio="none"
      >
        <motion.path
          fill={BLUE}
          fillOpacity="0.3"
          animate={{
            d: [
              "M0,224L48,213.3C96,203,192,181,288,186.7C384,192,480,224,576,229.3C672,235,768,213,864,197.3C960,181,1056,171,1152,181.3C1248,192,1344,224,1392,240L1440,256L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
              "M0,256L48,240C96,224,192,192,288,192C384,192,480,224,576,234.7C672,245,768,235,864,218.7C960,203,1056,181,1152,186.7C1248,192,1344,224,1392,240L1440,256L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
              "M0,224L48,213.3C96,203,192,181,288,186.7C384,192,480,224,576,229.3C672,235,768,213,864,197.3C960,181,1056,171,1152,181.3C1248,192,1344,224,1392,240L1440,256L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
            ],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.svg>
      <motion.svg
        viewBox="0 0 1440 320"
        className="absolute bottom-0 w-full"
        preserveAspectRatio="none"
      >
        <motion.path
          fill={ORANGE}
          fillOpacity="0.15"
          animate={{
            d: [
              "M0,288L48,272C96,256,192,224,288,218.7C384,213,480,235,576,245.3C672,256,768,256,864,240C960,224,1056,192,1152,186.7C1248,181,1344,203,1392,213.3L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
              "M0,256L48,261.3C96,267,192,277,288,272C384,267,480,245,576,234.7C672,224,768,224,864,234.7C960,245,1056,267,1152,261.3C1248,256,1344,224,1392,208L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
              "M0,288L48,272C96,256,192,224,288,218.7C384,213,480,235,576,245.3C672,256,768,256,864,240C960,224,1056,192,1152,186.7C1248,181,1344,203,1392,213.3L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
            ],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
      </motion.svg>
    </div>
  );
}

/* ───────────────────────── ROTATING HVAC ICON ───────────────────────── */
function RotatingHvacIcon() {
  return (
    <motion.div
      className="relative flex items-center justify-center"
      style={{ perspective: 800, willChange: "transform" }}
    >
      {/* Dual glow — blue + orange */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 280,
          height: 280,
          background: `radial-gradient(circle, ${BLUE_GLOW} 0%, transparent 70%)`,
          filter: "blur(40px)",
          willChange: "transform",
        }}
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 220,
          height: 220,
          background: `radial-gradient(circle, ${ORANGE_GLOW} 0%, transparent 70%)`,
          filter: "blur(30px)",
          willChange: "transform",
        }}
        animate={{ scale: [1.1, 1, 1.1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Fan SVG */}
      <svg
        viewBox="0 0 200 200"
        className="relative z-10 w-48 h-48 md:w-64 md:h-64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer ring */}
        <motion.circle
          cx="100"
          cy="100"
          r="90"
          stroke={BLUE}
          strokeWidth="1.5"
          strokeDasharray="8 4"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.4, rotate: 360 }}
          transition={{
            pathLength: { duration: 2, ease: "easeInOut" },
            opacity: { duration: 2 },
            rotate: { duration: 30, repeat: Infinity, ease: "linear" },
          }}
          style={{ transformOrigin: "center" }}
        />
        {/* Spinning fan blades */}
        <motion.g
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: "100px 100px" }}
        >
          {[0, 90, 180, 270].map((angle) => (
            <motion.path
              key={angle}
              d="M100,100 C100,70 120,45 100,30 C80,45 100,70 100,100Z"
              fill={angle < 180 ? BLUE : ORANGE}
              fillOpacity={0.6}
              transform={`rotate(${angle} 100 100)`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: angle / 360 }}
            />
          ))}
        </motion.g>
        {/* Center hub */}
        <circle cx="100" cy="100" r="12" fill={BLUE} fillOpacity={0.8} />
        <circle cx="100" cy="100" r="6" fill="white" fillOpacity={0.9} />
        {/* Temperature indicators */}
        <motion.circle
          cx="40"
          cy="40"
          r="4"
          fill={BLUE_LIGHT}
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <motion.circle
          cx="160"
          cy="160"
          r="4"
          fill={ORANGE_LIGHT}
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 2, repeat: Infinity, delay: 1 }}
        />
      </svg>
    </motion.div>
  );
}

/* ───────────────────────── DATA ───────────────────────── */
const services = [
  {
    title: "AC Repair",
    description:
      "Fast, reliable air conditioning repair for all makes and models. Our certified technicians diagnose and fix issues the same day so you stay cool when it matters most.",
    icon: Snowflake,
  },
  {
    title: "Heating Service",
    description:
      "Comprehensive furnace and heat pump repair and maintenance. We keep your home warm and safe throughout the harshest winter months with expert diagnostics.",
    icon: Thermometer,
  },
  {
    title: "Installation",
    description:
      "Professional HVAC system installation including central air, ductless mini-splits, furnaces, and heat pumps. Energy-efficient solutions sized perfectly for your home.",
    icon: Fan,
  },
  {
    title: "Maintenance Plans",
    description:
      "Preventive maintenance programs that extend equipment life, improve efficiency, and catch problems before they become expensive emergencies.",
    icon: Wind,
  },
  {
    title: "Duct Cleaning",
    description:
      "Thorough air duct cleaning that removes dust, allergens, and contaminants. Improve your indoor air quality and system efficiency with professional duct services.",
    icon: Drop,
  },
  {
    title: "Indoor Air Quality",
    description:
      "Advanced air purification, humidity control, and ventilation solutions. Breathe easier with whole-home air quality systems tailored to your family's needs.",
    icon: ShieldCheck,
  },
];

const stats = [
  { value: "15,000+", label: "Homes Serviced", icon: House },
  { value: "25+", label: "Years Experience", icon: Medal },
  { value: "97%", label: "Same-Day Service", icon: Lightning },
  { value: "4.9", label: "Average Rating", icon: Star },
];

const testimonials = [
  {
    name: "Jennifer M.",
    text: "Our AC went out in the middle of July and they had a technician at our door within two hours. Professional, fast, and fair pricing. Cannot recommend them enough.",
    rating: 5,
  },
  {
    name: "Robert D.",
    text: "We have used them for our annual maintenance for three years now. Every visit is thorough and they always explain what they are doing. Our energy bills have dropped noticeably.",
    rating: 5,
  },
  {
    name: "Lisa K.",
    text: "They installed a completely new system in our home. The team was incredibly clean, efficient, and the new unit is whisper-quiet. Best HVAC experience we have ever had.",
    rating: 5,
  },
];

const processSteps = [
  {
    step: "01",
    title: "Call Us",
    description: "Reach out by phone or book online. We offer flexible scheduling including evenings and weekends.",
    icon: Phone,
  },
  {
    step: "02",
    title: "Diagnostic",
    description: "Our certified technician arrives on time, inspects your system, and provides an upfront quote with no hidden fees.",
    icon: Wrench,
  },
  {
    step: "03",
    title: "Repair / Install",
    description: "We complete the work efficiently using premium parts backed by manufacturer warranties.",
    icon: Fan,
  },
  {
    step: "04",
    title: "Comfort Guaranteed",
    description: "Enjoy perfect indoor comfort with our satisfaction guarantee and ongoing support.",
    icon: CheckCircle,
  },
];

const maintenancePlans = [
  {
    name: "Basic",
    price: "$14",
    period: "/month",
    features: [
      "Annual AC tune-up",
      "Annual heating inspection",
      "Priority scheduling",
      "10% parts discount",
    ],
    highlighted: false,
  },
  {
    name: "Premium",
    price: "$29",
    period: "/month",
    features: [
      "Bi-annual AC & heating tune-ups",
      "Priority same-day service",
      "15% parts & labor discount",
      "No overtime charges",
      "Duct inspection included",
    ],
    highlighted: true,
  },
  {
    name: "Elite",
    price: "$49",
    period: "/month",
    features: [
      "Quarterly system inspections",
      "VIP same-day guarantee",
      "25% parts & labor discount",
      "No overtime or trip charges",
      "Annual duct cleaning included",
      "Indoor air quality check",
    ],
    highlighted: false,
  },
];

const faqs = [
  {
    question: "How often should I have my HVAC system serviced?",
    answer:
      "We recommend professional maintenance at least twice a year — once in spring for your cooling system and once in fall for your heating system. Regular maintenance extends equipment life by up to 40% and keeps your energy bills low.",
  },
  {
    question: "What are signs my AC needs repair?",
    answer:
      "Common warning signs include warm air blowing from vents, unusual noises, frequent cycling on and off, rising energy bills, and excess humidity. If you notice any of these, call us for a diagnostic before the problem gets worse.",
  },
  {
    question: "How long does a typical HVAC installation take?",
    answer:
      "A standard residential installation usually takes one day for a straightforward replacement. New ductwork or complex systems may take two to three days. We always provide a detailed timeline before work begins.",
  },
  {
    question: "Do you offer financing for new systems?",
    answer:
      "Yes, we offer flexible financing options with approved credit, including 0% interest plans for qualifying customers. We believe everyone deserves comfortable indoor air regardless of budget.",
  },
];

/* ═══════════════════════════════════════════════════════════════════
   MAIN PAGE COMPONENT
   ═══════════════════════════════════════════════════════════════════ */
export default function V2HvacPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <main
      className="relative min-h-[100dvh] overflow-x-hidden"
      style={{ background: NAVY, color: "#f1f5f9" }}
    >
      <FloatingParticles />

      {/* ═══════════════════ 1. NAV ═══════════════════ */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={spring}
        className="fixed top-0 left-0 right-0 z-50"
      >
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-4">
          <GlassCard className="flex items-center justify-between px-4 md:px-6 py-3">
            <div className="flex items-center gap-2">
              <Thermometer size={22} weight="duotone" style={{ color: BLUE }} />
              <Snowflake size={16} weight="duotone" style={{ color: BLUE_LIGHT }} />
              <span className="text-lg font-bold tracking-tight text-white">
                Climate Control Pros
              </span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
              <a href="#services" className="hover:text-white transition-colors">Services</a>
              <a href="#about" className="hover:text-white transition-colors">About</a>
              <a href="#maintenance" className="hover:text-white transition-colors">Maintenance</a>
              <a href="#contact" className="hover:text-white transition-colors">Contact</a>
            </div>
            <div className="flex items-center gap-3">
              <MagneticButton
                className="px-4 md:px-5 py-2 rounded-full text-sm font-semibold text-white transition-colors cursor-pointer"
                style={{ background: ORANGE } as React.CSSProperties}
              >
                Schedule Service
              </MagneticButton>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
              >
                {mobileMenuOpen ? <X size={24} /> : <List size={24} />}
              </button>
            </div>
          </GlassCard>

          {/* Mobile Menu */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="md:hidden mt-2 overflow-hidden"
              >
                <GlassCard className="flex flex-col gap-1 px-4 py-4">
                  {[
                    { label: "Services", href: "#services" },
                    { label: "About", href: "#about" },
                    { label: "Maintenance", href: "#maintenance" },
                    { label: "Contact", href: "#contact" },
                  ].map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-3 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      {link.label}
                    </a>
                  ))}
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.nav>

      {/* ═══════════════════ 2. HERO ═══════════════════ */}
      <section className="relative min-h-[100dvh] flex items-center pt-24 z-10">
        {/* Gradient background — cool blue to warm orange */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 80% 60% at 30% 50%, rgba(14,165,233,0.12) 0%, transparent 60%),
                          radial-gradient(ellipse 70% 50% at 75% 60%, rgba(249,115,22,0.1) 0%, transparent 60%)`,
          }}
        />
        <AirflowWaves />

        <div className="mx-auto max-w-7xl px-4 md:px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-4 items-center">
          {/* Left: text */}
          <div className="space-y-8">
            <div>
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ ...spring, delay: 0.1 }}
                className="text-sm uppercase tracking-widest mb-4"
                style={{ color: BLUE }}
              >
                Heating &bull; Cooling &bull; Comfort
              </motion.p>
              <h1
                className="text-3xl md:text-6xl tracking-tighter leading-none font-bold text-white"
                style={{ textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}
              >
                <WordReveal text="Your Comfort, Our Mission" />
              </h1>
            </div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring, delay: 0.6 }}
              className="text-lg text-slate-400 max-w-md leading-relaxed"
            >
              From scorching summers to freezing winters, we keep your home at
              the perfect temperature year-round. Expert HVAC service you can
              trust.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring, delay: 0.8 }}
              className="flex flex-wrap gap-4"
            >
              <MagneticButton
                className="px-8 py-4 rounded-full text-base font-semibold text-white flex items-center gap-2 cursor-pointer"
                style={{ background: ORANGE } as React.CSSProperties}
              >
                Schedule Service
                <ArrowRight size={18} weight="bold" />
              </MagneticButton>
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/10 flex items-center gap-2 cursor-pointer">
                <Phone size={18} weight="duotone" />
                (555) 789-1234
              </MagneticButton>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ ...spring, delay: 1 }}
              className="flex flex-wrap gap-6 text-sm text-slate-400"
            >
              <span className="flex items-center gap-2">
                <MapPin size={16} weight="duotone" style={{ color: BLUE }} />
                456 Comfort Lane, Suite 100
              </span>
              <span className="flex items-center gap-2">
                <Clock size={16} weight="duotone" style={{ color: BLUE }} />
                24/7 Emergency Service
              </span>
            </motion.div>
          </div>

          {/* Right: HVAC icon */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ ...spring, delay: 0.3 }}
            className="hidden md:flex items-center justify-center lg:justify-end"
          >
            <RotatingHvacIcon />
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════ 3. STATS ═══════════════════ */}
      <SectionReveal className="relative z-10 pb-8">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 60% 40% at 50% 50%, rgba(14,165,233,0.06) 0%, transparent 70%)`,
          }}
        />
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <GlassCard className="p-6 md:p-8">
            <motion.div
              className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8"
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-50px" }}
            >
              {stats.map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={i}
                    variants={fadeUp}
                    className="text-center"
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
                      style={{ background: BLUE_GLOW }}
                    >
                      <Icon size={24} weight="duotone" style={{ color: BLUE }} />
                    </div>
                    <div
                      className="text-2xl md:text-3xl font-bold mb-1"
                      style={{ color: BLUE_LIGHT }}
                    >
                      {stat.value}
                    </div>
                    <p className="text-sm text-slate-400">{stat.label}</p>
                  </motion.div>
                );
              })}
            </motion.div>
          </GlassCard>
        </div>
      </SectionReveal>

      {/* ═══════════════════ 4. SERVICES ═══════════════════ */}
      <SectionReveal id="services" className="relative z-10 py-16 md:py-24">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 50% 50% at 20% 30%, rgba(14,165,233,0.05) 0%, transparent 70%),
                          radial-gradient(ellipse 40% 40% at 80% 70%, rgba(249,115,22,0.04) 0%, transparent 70%)`,
          }}
        />
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: BLUE }}>
              Our Services
            </p>
            <h2 className="text-3xl md:text-6xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Complete HVAC Solutions" />
            </h2>
          </div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
          >
            {services.map((svc, i) => {
              const Icon = svc.icon;
              return (
                <motion.div key={i} variants={fadeUp}>
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    transition={springGentle}
                    style={{ willChange: "transform" }}
                  >
                    <GlassCard className="p-6 md:p-8 h-full">
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
                        style={{
                          background:
                            i % 2 === 0
                              ? BLUE_GLOW
                              : ORANGE_GLOW,
                        }}
                      >
                        <Icon
                          size={28}
                          weight="duotone"
                          style={{
                            color: i % 2 === 0 ? BLUE : ORANGE,
                          }}
                        />
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-3">
                        {svc.title}
                      </h3>
                      <p className="text-slate-400 leading-relaxed text-sm">
                        {svc.description}
                      </p>
                    </GlassCard>
                  </motion.div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ═══════════════════ 5. WHY CHOOSE US ═══════════════════ */}
      <SectionReveal id="about" className="relative z-10 py-16 md:py-24">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(180deg, transparent 0%, rgba(14,165,233,0.03) 50%, transparent 100%)`,
          }}
        />
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left — Photo */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={spring}
            >
              <div className="relative rounded-2xl overflow-hidden aspect-[4/3]">
                <img
                  src="https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&q=80"
                  alt="HVAC technician performing maintenance"
                  className="w-full h-full object-cover"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(135deg, rgba(14,165,233,0.2) 0%, transparent 50%, rgba(249,115,22,0.15) 100%)`,
                  }}
                />
              </div>
            </motion.div>

            {/* Right — Trust points */}
            <div className="space-y-8">
              <div>
                <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ORANGE }}>
                  Why Choose Us
                </p>
                <h2 className="text-3xl md:text-5xl tracking-tighter leading-none font-bold text-white mb-6">
                  <WordReveal text="Trusted by Thousands of Homeowners" />
                </h2>
              </div>

              <motion.div
                className="space-y-5"
                variants={stagger}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-50px" }}
              >
                {[
                  {
                    title: "Licensed & Insured",
                    desc: "Fully licensed, bonded, and insured technicians you can trust in your home.",
                  },
                  {
                    title: "Upfront Pricing",
                    desc: "No surprise fees. We provide detailed quotes before any work begins.",
                  },
                  {
                    title: "Satisfaction Guarantee",
                    desc: "If you are not 100% satisfied, we will make it right at no extra cost.",
                  },
                  {
                    title: "24/7 Emergency Service",
                    desc: "Comfort emergencies do not wait — and neither do we. Available around the clock.",
                  },
                ].map((point, i) => (
                  <motion.div
                    key={i}
                    variants={fadeUp}
                    className="flex gap-4"
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                      style={{ background: BLUE_GLOW }}
                    >
                      <CheckCircle size={20} weight="duotone" style={{ color: BLUE }} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">
                        {point.title}
                      </h3>
                      <p className="text-sm text-slate-400 leading-relaxed">
                        {point.desc}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* ═══════════════════ 6. SEASONAL CTA ═══════════════════ */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(135deg, rgba(14,165,233,0.08) 0%, rgba(249,115,22,0.08) 100%)`,
          }}
        />
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <ShimmerBorder>
            <div className="p-8 md:p-12 lg:p-16 text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={spring}
              >
                <div className="flex items-center justify-center gap-3 mb-6">
                  <Snowflake size={32} weight="duotone" style={{ color: BLUE_LIGHT }} />
                  <Thermometer size={32} weight="duotone" style={{ color: ORANGE }} />
                </div>
                <h2 className="text-3xl md:text-5xl tracking-tighter leading-none font-bold text-white mb-4">
                  <WordReveal text="Don't Wait for the Heat or Cold" />
                </h2>
                <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-8 leading-relaxed">
                  The best time to service your HVAC system is before you need it
                  most. Schedule a tune-up now and avoid costly emergency repairs
                  when temperatures hit extremes.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <MagneticButton
                    className="px-8 py-4 rounded-full text-base font-semibold text-white flex items-center gap-2 cursor-pointer"
                    style={{ background: ORANGE } as React.CSSProperties}
                  >
                    Book Your Tune-Up
                    <ArrowRight size={18} weight="bold" />
                  </MagneticButton>
                  <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/10 flex items-center gap-2 cursor-pointer">
                    <Phone size={18} weight="duotone" />
                    Call Now
                  </MagneticButton>
                </div>
              </motion.div>
            </div>
          </ShimmerBorder>
        </div>
      </SectionReveal>

      {/* ═══════════════════ 7. PROCESS ═══════════════════ */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 50% 50% at 50% 50%, rgba(14,165,233,0.04) 0%, transparent 70%)`,
          }}
        />
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: BLUE }}>
              How It Works
            </p>
            <h2 className="text-3xl md:text-6xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Simple 4-Step Process" />
            </h2>
          </div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
          >
            {processSteps.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div key={i} variants={fadeUp}>
                  <GlassCard className="p-6 md:p-8 text-center h-full relative">
                    {/* Step number */}
                    <div
                      className="text-5xl font-black mb-4 opacity-10"
                      style={{ color: BLUE }}
                    >
                      {step.step}
                    </div>
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                      style={{
                        background: i === processSteps.length - 1 ? ORANGE_GLOW : BLUE_GLOW,
                      }}
                    >
                      <Icon
                        size={28}
                        weight="duotone"
                        style={{
                          color: i === processSteps.length - 1 ? ORANGE : BLUE,
                        }}
                      />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {step.title}
                    </h3>
                    <p className="text-sm text-slate-400 leading-relaxed">
                      {step.description}
                    </p>
                  </GlassCard>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ═══════════════════ 8. MAINTENANCE PLANS ═══════════════════ */}
      <SectionReveal id="maintenance" className="relative z-10 py-16 md:py-24">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 60% 40% at 50% 30%, rgba(249,115,22,0.05) 0%, transparent 70%)`,
          }}
        />
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ORANGE }}>
              Maintenance Plans
            </p>
            <h2 className="text-3xl md:text-6xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Protect Your Investment" />
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto mt-4 leading-relaxed">
              Our maintenance plans keep your system running at peak efficiency,
              reduce breakdowns, and extend equipment life — saving you money year
              after year.
            </p>
          </div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
          >
            {maintenancePlans.map((plan, i) => (
              <motion.div key={i} variants={fadeUp}>
                {plan.highlighted ? (
                  <ShimmerBorder className="h-full">
                    <div className="p-6 md:p-8 h-full flex flex-col">
                      <div className="text-center mb-6">
                        <p
                          className="text-xs uppercase tracking-widest font-semibold mb-2"
                          style={{ color: ORANGE }}
                        >
                          Most Popular
                        </p>
                        <h3 className="text-2xl font-bold text-white mb-2">
                          {plan.name}
                        </h3>
                        <div className="flex items-baseline justify-center gap-1">
                          <span
                            className="text-4xl font-bold"
                            style={{ color: ORANGE }}
                          >
                            {plan.price}
                          </span>
                          <span className="text-slate-400 text-sm">
                            {plan.period}
                          </span>
                        </div>
                      </div>
                      <ul className="space-y-3 flex-1">
                        {plan.features.map((f, j) => (
                          <li
                            key={j}
                            className="flex items-start gap-3 text-sm text-slate-300"
                          >
                            <CheckCircle
                              size={18}
                              weight="duotone"
                              style={{ color: ORANGE }}
                              className="shrink-0 mt-0.5"
                            />
                            {f}
                          </li>
                        ))}
                      </ul>
                      <MagneticButton
                        className="w-full mt-6 py-3 rounded-full text-sm font-semibold text-white cursor-pointer"
                        style={{ background: ORANGE } as React.CSSProperties}
                      >
                        Choose Premium
                      </MagneticButton>
                    </div>
                  </ShimmerBorder>
                ) : (
                  <GlassCard className="p-6 md:p-8 h-full flex flex-col">
                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-bold text-white mb-2">
                        {plan.name}
                      </h3>
                      <div className="flex items-baseline justify-center gap-1">
                        <span
                          className="text-4xl font-bold"
                          style={{ color: BLUE }}
                        >
                          {plan.price}
                        </span>
                        <span className="text-slate-400 text-sm">
                          {plan.period}
                        </span>
                      </div>
                    </div>
                    <ul className="space-y-3 flex-1">
                      {plan.features.map((f, j) => (
                        <li
                          key={j}
                          className="flex items-start gap-3 text-sm text-slate-300"
                        >
                          <CheckCircle
                            size={18}
                            weight="duotone"
                            style={{ color: BLUE }}
                            className="shrink-0 mt-0.5"
                          />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <MagneticButton
                      className="w-full mt-6 py-3 rounded-full text-sm font-semibold text-white border border-white/10 cursor-pointer"
                    >
                      Choose {plan.name}
                    </MagneticButton>
                  </GlassCard>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ═══════════════════ 9. TESTIMONIALS ═══════════════════ */}
      <SectionReveal id="testimonials" className="relative z-10 py-16 md:py-24">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 50% 50% at 50% 50%, rgba(14,165,233,0.04) 0%, transparent 70%)`,
          }}
        />
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: BLUE }}>
              Customer Reviews
            </p>
            <h2 className="text-3xl md:text-6xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="What Homeowners Say" />
            </h2>
          </div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
          >
            {testimonials.map((t, i) => (
              <motion.div key={i} variants={fadeUp}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={springGentle}
                  style={{ willChange: "transform" }}
                >
                  <GlassCard className="p-6 md:p-8 h-full flex flex-col">
                    {/* Stars */}
                    <div className="flex items-center gap-1 mb-4">
                      {Array.from({ length: t.rating }).map((_, j) => (
                        <Star
                          key={j}
                          size={16}
                          weight="fill"
                          style={{ color: ORANGE }}
                        />
                      ))}
                    </div>
                    <p className="text-slate-300 leading-relaxed text-sm flex-1 mb-4">
                      &ldquo;{t.text}&rdquo;
                    </p>
                    <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                        style={{ background: BLUE_GLOW, color: BLUE }}
                      >
                        {t.name.charAt(0)}
                      </div>
                      <span className="font-semibold text-white text-sm">
                        {t.name}
                      </span>
                    </div>
                  </GlassCard>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ═══════════════════ 10. ENERGY SAVINGS ═══════════════════ */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(180deg, transparent 0%, rgba(249,115,22,0.04) 50%, transparent 100%)`,
          }}
        />
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="space-y-8">
              <div>
                <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ORANGE }}>
                  Energy Efficiency
                </p>
                <h2 className="text-3xl md:text-5xl tracking-tighter leading-none font-bold text-white mb-6">
                  <WordReveal text="Save Money, Save Energy" />
                </h2>
                <p className="text-slate-400 leading-relaxed">
                  Modern HVAC systems can cut your energy bills dramatically. We
                  help you choose the right equipment and maintain it for maximum
                  efficiency, so your wallet and the planet both benefit.
                </p>
              </div>

              <motion.div
                className="grid grid-cols-2 gap-4"
                variants={stagger}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-50px" }}
              >
                {[
                  { value: "40%", label: "Average Energy Savings" },
                  { value: "$1,200", label: "Annual Bill Reduction" },
                  { value: "15+", label: "Year Equipment Lifespan" },
                  { value: "98%", label: "Customer Satisfaction" },
                ].map((s, i) => (
                  <motion.div key={i} variants={fadeUp}>
                    <GlassCard className="p-5 text-center">
                      <div
                        className="text-2xl md:text-3xl font-bold mb-1"
                        style={{ color: i % 2 === 0 ? ORANGE : BLUE_LIGHT }}
                      >
                        {s.value}
                      </div>
                      <p className="text-xs text-slate-400">{s.label}</p>
                    </GlassCard>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Right — photo */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={spring}
            >
              <div className="relative rounded-2xl overflow-hidden aspect-[4/3]">
                <img
                  src="https://images.unsplash.com/photo-1621460248083-6271cc4437a8?w=800&q=80"
                  alt="Modern energy-efficient HVAC system"
                  className="w-full h-full object-cover"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(135deg, rgba(249,115,22,0.15) 0%, transparent 50%, rgba(14,165,233,0.2) 100%)`,
                  }}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </SectionReveal>

      {/* ═══════════════════ 11. FAQ ═══════════════════ */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 60% 40% at 50% 50%, rgba(14,165,233,0.04) 0%, transparent 70%)`,
          }}
        />
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            <div className="lg:sticky lg:top-32">
              <p className="text-sm uppercase tracking-widest mb-3" style={{ color: BLUE }}>
                FAQ
              </p>
              <h2 className="text-3xl md:text-5xl tracking-tighter leading-none font-bold text-white mb-6">
                <WordReveal text="Common Questions" />
              </h2>
              <p className="text-slate-400 leading-relaxed max-w-md">
                Have a question we did not cover? Give us a call and our friendly
                team will be happy to help.
              </p>
            </div>

            <motion.div
              className="space-y-3"
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-50px" }}
            >
              {faqs.map((faq, i) => (
                <motion.div key={i} variants={fadeUp}>
                  <AccordionItem
                    title={faq.question}
                    answer={faq.answer}
                    isOpen={openFaq === i}
                    onToggle={() => setOpenFaq(openFaq === i ? null : i)}
                  />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </SectionReveal>

      {/* ═══════════════════ 12. CONTACT ═══════════════════ */}
      <SectionReveal id="contact" className="relative z-10 py-16 md:py-24">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(135deg, rgba(14,165,233,0.06) 0%, rgba(249,115,22,0.06) 100%)`,
          }}
        />
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Left — info */}
            <div className="space-y-8">
              <div>
                <p className="text-sm uppercase tracking-widest mb-3" style={{ color: BLUE }}>
                  Get In Touch
                </p>
                <h2 className="text-3xl md:text-5xl tracking-tighter leading-none font-bold text-white mb-6">
                  <WordReveal text="Schedule Your Service" />
                </h2>
                <p className="text-slate-400 leading-relaxed">
                  Ready for reliable HVAC service? Contact us today and
                  experience the comfort difference. We offer free estimates on
                  new installations.
                </p>
              </div>

              <motion.div
                className="space-y-4"
                variants={stagger}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-50px" }}
              >
                {[
                  {
                    icon: Phone,
                    label: "(555) 789-1234",
                    sub: "24/7 Emergency Line",
                  },
                  {
                    icon: Envelope,
                    label: "service@climatecontrolpros.com",
                    sub: "Email Us Anytime",
                  },
                  {
                    icon: MapPin,
                    label: "456 Comfort Lane, Suite 100",
                    sub: "Main Office Location",
                  },
                  {
                    icon: Clock,
                    label: "Mon-Sat 7am-8pm",
                    sub: "24/7 Emergency Available",
                  },
                ].map((info, i) => {
                  const Icon = info.icon;
                  return (
                    <motion.div
                      key={i}
                      variants={fadeUp}
                      className="flex items-center gap-4"
                    >
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: BLUE_GLOW }}
                      >
                        <Icon size={22} weight="duotone" style={{ color: BLUE }} />
                      </div>
                      <div>
                        <p className="font-semibold text-white text-sm">
                          {info.label}
                        </p>
                        <p className="text-xs text-slate-400">{info.sub}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </div>

            {/* Right — contact form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={spring}
            >
              <GlassCard className="p-6 md:p-8">
                <h3 className="text-xl font-semibold text-white mb-6">
                  Request a Free Estimate
                </h3>
                <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="First Name"
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-sky-500/50"
                    />
                    <input
                      type="text"
                      placeholder="Last Name"
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-sky-500/50"
                    />
                  </div>
                  <input
                    type="email"
                    placeholder="Email Address"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-sky-500/50"
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-sky-500/50"
                  />
                  <select className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-400 text-sm focus:outline-none focus:border-sky-500/50 appearance-none">
                    <option value="">Select Service Needed</option>
                    <option value="ac-repair">AC Repair</option>
                    <option value="heating">Heating Service</option>
                    <option value="installation">New Installation</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="duct-cleaning">Duct Cleaning</option>
                    <option value="air-quality">Indoor Air Quality</option>
                  </select>
                  <textarea
                    rows={4}
                    placeholder="Tell us about your issue..."
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-sky-500/50 resize-none"
                  />
                  <MagneticButton
                    className="w-full py-3.5 rounded-full text-sm font-semibold text-white flex items-center justify-center gap-2 cursor-pointer"
                    style={{ background: ORANGE } as React.CSSProperties}
                  >
                    Send Request
                    <ArrowRight size={16} weight="bold" />
                  </MagneticButton>
                </form>
              </GlassCard>
            </motion.div>
          </div>
        </div>
      </SectionReveal>

      {/* ═══════════════════ 13. FOOTER ═══════════════════ */}
      <footer className="relative z-10 border-t border-white/5 py-8">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(180deg, transparent 0%, rgba(12,18,34,0.8) 100%)`,
          }}
        />
        <div className="relative mx-auto max-w-7xl px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Thermometer size={16} weight="duotone" style={{ color: BLUE }} />
            <span>Climate Control Pros &copy; {new Date().getFullYear()}</span>
          </div>
          <p className="text-xs text-slate-600">
            Created by <a href="https://bluejayportfolio.com" target="_blank" rel="noopener noreferrer" style={{textDecoration:"underline"}}>bluejayportfolio.com</a>
          </p>
        </div>
      </footer>
    </main>
  );
}
