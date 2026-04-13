"use client";

/* eslint-disable @next/next/no-img-element */

import { useState, useRef, useCallback, useEffect } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useInView,
  AnimatePresence,
} from "framer-motion";
import {
  Drop,
  Wrench,
  Flame,
  Bathtub,
  Pipe,
  Warning,
  Phone,
  MapPin,
  Clock,
  ArrowRight,
  Star,
  ShieldCheck,
  CaretDown,
  Quotes,
  CheckCircle,
  X,
  List,
  Timer,
  Certificate,
  PhoneCall,
  MagnifyingGlass,
  ThumbsUp,
  CurrencyDollar,
  Envelope,
  ChatCircleDots,
  Play,
  Users,
  XCircle,
  Gauge,
  FirstAid,
  HandCoins,
  Broom,
  SealCheck,
  GasPump,
  Funnel,
  Toilet,
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
const DEEP_BLUE = "#1e40af";
const TEAL = "#0d9488";
const TEAL_LIGHT = "#14b8a6";
const SLATE = "#0f172a";
const BLUE_GLOW = "rgba(30, 64, 175, 0.15)";
const TEAL_GLOW = "rgba(13, 148, 136, 0.15)";
const RED_EMERGENCY = "#ef4444";

/* ───────────────────────── WATER DROP DRIP ANIMATION ───────────────────────── */
function WaterDropDrip() {
  return (
    <div className="absolute left-6 md:left-12 top-0 bottom-0 pointer-events-none z-20 hidden lg:block">
      <svg width="24" height="100%" viewBox="0 0 24 800" preserveAspectRatio="xMidYMin slice" className="h-full">
        <defs>
          <linearGradient id="dripGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={TEAL} stopOpacity="0" />
            <stop offset="30%" stopColor={TEAL} stopOpacity="0.3" />
            <stop offset="100%" stopColor={TEAL} stopOpacity="0" />
          </linearGradient>
        </defs>
        <line x1="12" y1="0" x2="12" y2="800" stroke={TEAL} strokeWidth="1" opacity="0.08" />
        <motion.g
          animate={{ y: ["-100", "900"] }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear", delay: 0 }}
        >
          <ellipse cx="12" cy="0" rx="6" ry="9" fill={TEAL} opacity="0.35" />
          <ellipse cx="12" cy="-2" rx="3" ry="4" fill={TEAL_LIGHT} opacity="0.5" />
        </motion.g>
        <motion.g
          animate={{ y: ["-100", "900"] }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear", delay: 3 }}
        >
          <ellipse cx="12" cy="0" rx="5" ry="7" fill={TEAL} opacity="0.25" />
          <ellipse cx="12" cy="-2" rx="2.5" ry="3.5" fill={TEAL_LIGHT} opacity="0.4" />
        </motion.g>
      </svg>
    </div>
  );
}

/* ───────────────────────── FLOATING WATER DROPS ───────────────────────── */
function FloatingWaterDrops() {
  const drops = [
    { id: 0, x: 5, delay: 0, dur: 9, size: 4, op: 0.15 },
    { id: 1, x: 12, delay: 2, dur: 11, size: 3, op: 0.1 },
    { id: 2, x: 22, delay: 4, dur: 8, size: 5, op: 0.12 },
    { id: 3, x: 35, delay: 1, dur: 10, size: 3, op: 0.14 },
    { id: 4, x: 48, delay: 6, dur: 9, size: 4, op: 0.1 },
    { id: 5, x: 55, delay: 3, dur: 12, size: 6, op: 0.13 },
    { id: 6, x: 65, delay: 5, dur: 8, size: 3, op: 0.15 },
    { id: 7, x: 72, delay: 0.5, dur: 10, size: 5, op: 0.11 },
    { id: 8, x: 80, delay: 7, dur: 9, size: 4, op: 0.12 },
    { id: 9, x: 88, delay: 2.5, dur: 11, size: 3, op: 0.14 },
    { id: 10, x: 93, delay: 4.5, dur: 8, size: 5, op: 0.1 },
    { id: 11, x: 17, delay: 8, dur: 10, size: 4, op: 0.13 },
    { id: 12, x: 42, delay: 1.5, dur: 7, size: 3, op: 0.15 },
    { id: 13, x: 60, delay: 6.5, dur: 9, size: 6, op: 0.11 },
    { id: 14, x: 97, delay: 3.5, dur: 12, size: 4, op: 0.12 },
  ];

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden hidden md:block">
      {drops.map((p) => (
        <motion.div
          key={p.id}
          className="absolute"
          style={{
            left: `${p.x}%`,
            width: p.size,
            height: p.size * 1.4,
            background: TEAL_LIGHT,
            borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
            willChange: "transform, opacity",
          }}
          animate={{
            y: ["-10vh", "110vh"],
            opacity: [0, p.op, p.op, 0],
          }}
          transition={{
            y: { duration: p.dur, repeat: Infinity, delay: p.delay, ease: "linear" },
            opacity: {
              duration: p.dur,
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

/* ───────────────────────── WRENCH + DROP SVG ───────────────────────── */
function WrenchDropIcon({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M8 24l12-12a6 6 0 00-8.49-8.49L8 7v4H4l-3.5 3.51A6 6 0 008 24z"
        stroke={TEAL}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M25 14c0 5-5 10-5 10s-5-5-5-10a5 5 0 0110 0z"
        fill={DEEP_BLUE}
        opacity="0.7"
      />
      <circle cx="25" cy="14" r="2" fill={TEAL_LIGHT} opacity="0.9" />
    </svg>
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
function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] ${className}`}>
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
    typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;

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
function ShimmerBorder({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative rounded-2xl p-[1px] overflow-hidden ${className}`}>
      <motion.div
        className="absolute inset-0 rounded-2xl"
        style={{
          background: `conic-gradient(from 0deg, transparent, ${DEEP_BLUE}, transparent, ${TEAL}, transparent)`,
          willChange: "transform",
        }}
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      />
      <div className="relative rounded-2xl bg-slate-900 z-10">{children}</div>
    </div>
  );
}

/* ───────────────────────── RIPPLE BORDER CARD ───────────────────────── */
function RippleBorderCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative rounded-2xl p-[2px] overflow-hidden ${className}`}>
      <motion.div
        className="absolute inset-0 rounded-2xl"
        style={{
          background: `conic-gradient(from 0deg, ${TEAL}44, ${DEEP_BLUE}66, ${TEAL}22, transparent, ${TEAL}44, ${DEEP_BLUE}44, ${TEAL}66, transparent)`,
          willChange: "transform",
        }}
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
      />
      <div className="absolute inset-[2px] rounded-2xl" style={{ background: "rgba(15,23,42,0.97)" }} />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

/* ───────────────────────── ACCORDION ITEM ───────────────────────── */
function AccordionItem({
  question,
  answer,
  isOpen,
  onToggle,
}: {
  question: string;
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
        <span className="text-lg font-semibold text-white pr-4">{question}</span>
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

/* ───────────────────────── PIPE GRID BG PATTERN ───────────────────────── */
function PipeGridPattern() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.04]">
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="pipeGrid" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
            <path d="M0 40h80M40 0v80" stroke={TEAL_LIGHT} strokeWidth="2" fill="none" />
            <circle cx="40" cy="40" r="4" fill={TEAL_LIGHT} />
            <circle cx="0" cy="40" r="3" fill={DEEP_BLUE} />
            <circle cx="80" cy="40" r="3" fill={DEEP_BLUE} />
            <circle cx="40" cy="0" r="3" fill={DEEP_BLUE} />
            <circle cx="40" cy="80" r="3" fill={DEEP_BLUE} />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#pipeGrid)" />
      </svg>
    </div>
  );
}

/* ───────────────────────── WATER WAVE BG ───────────────────────── */
function WaterWaveBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
      <motion.svg viewBox="0 0 1440 320" className="absolute bottom-0 w-full" preserveAspectRatio="none">
        <motion.path
          fill={DEEP_BLUE}
          fillOpacity="0.4"
          animate={{
            d: [
              "M0,224L48,213.3C96,203,192,181,288,186.7C384,192,480,224,576,229.3C672,235,768,213,864,197.3C960,181,1056,171,1152,181.3C1248,192,1344,224,1392,240L1440,256L1440,320L0,320Z",
              "M0,256L48,240C96,224,192,192,288,192C384,192,480,224,576,234.7C672,245,768,235,864,218.7C960,203,1056,181,1152,186.7C1248,192,1344,224,1392,240L1440,256L1440,320L0,320Z",
              "M0,224L48,213.3C96,203,192,181,288,186.7C384,192,480,224,576,229.3C672,235,768,213,864,197.3C960,181,1056,171,1152,181.3C1248,192,1344,224,1392,240L1440,256L1440,320L0,320Z",
            ],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.svg>
    </div>
  );
}

/* ───────────────────────── DATA ───────────────────────── */
const SERVICES = [
  { title: "Emergency Plumbing", desc: "Burst pipes, flooding, and major leaks handled 24/7. Our emergency crew arrives within 60 minutes to protect your home.", icon: Warning, number: "01" },
  { title: "Drain Cleaning", desc: "Stubborn clogs eliminated with hydro-jetting and camera inspections. Kitchen, bathroom, and main sewer lines cleared fast.", icon: Funnel, number: "02" },
  { title: "Water Heater Install", desc: "Tankless and traditional water heater installation and repair. Energy-efficient upgrades that slash your utility bills.", icon: Flame, number: "03" },
  { title: "Sewer Line Repair", desc: "Video camera diagnostics and trenchless repair technology. We fix sewer problems without tearing up your yard.", icon: Pipe, number: "04" },
  { title: "Repiping", desc: "Complete copper and PEX repiping for aging homes. Upgrade corroded pipes and restore strong, clean water flow throughout.", icon: Wrench, number: "05" },
  { title: "Leak Detection", desc: "Advanced electronic and thermal leak detection finds hidden leaks behind walls, under slabs, and in crawl spaces.", icon: MagnifyingGlass, number: "06" },
  { title: "Toilet & Faucet Repair", desc: "Running toilets, dripping faucets, and fixture upgrades. Fast repairs that stop wasting water and money.", icon: Drop, number: "07" },
  { title: "Gas Line Service", desc: "Licensed gas line installation, repair, and leak testing. Safety-first approach for furnaces, stoves, and outdoor grills.", icon: GasPump, number: "08" },
];

const COMMON_ISSUES = [
  { title: "Clogged Drains", icon: Funnel },
  { title: "Leaking Pipes", icon: Drop },
  { title: "No Hot Water", icon: Flame },
  { title: "Running Toilets", icon: Toilet },
  { title: "Low Water Pressure", icon: Gauge },
  { title: "Sewer Backup", icon: Warning },
  { title: "Dripping Faucets", icon: Bathtub },
  { title: "Gas Leaks", icon: GasPump },
];

const QUIZ_OPTIONS = [
  { label: "Clogged Drain", color: "#22c55e", severity: "Common Fix", recommendation: "Most drain clogs are resolved same-day with our hydro-jetting service. Book a $99 drain cleaning.", cta: "Book Drain Cleaning" },
  { label: "Leak or Burst Pipe", color: RED_EMERGENCY, severity: "Emergency!", recommendation: "Water damage gets worse every minute. Call now for our 60-minute emergency response.", cta: "Call Now (206) 555-0893" },
  { label: "Water Heater Problem", color: "#f59e0b", severity: "No Hot Water?", recommendation: "Could be a simple thermostat fix or time for a new unit. We diagnose before we quote.", cta: "Schedule Diagnosis" },
  { label: "Sewer / Main Line", color: RED_EMERGENCY, severity: "Serious", recommendation: "Sewer backups need immediate camera inspection. We use trenchless repair to minimize disruption.", cta: "Get Camera Inspection" },
];

const COMPARISON_ROWS = [
  { feature: "Licensed Master Plumber", us: true, them: "Varies" },
  { feature: "24/7 Emergency Response", us: true, them: "No" },
  { feature: "Upfront Flat-Rate Pricing", us: true, them: "Sometimes" },
  { feature: "Same-Day Service", us: true, them: "Varies" },
  { feature: "Clean Up After Every Job", us: true, them: "No" },
  { feature: "1-Year Labor Warranty", us: true, them: "No" },
  { feature: "Camera Diagnostics Included", us: true, them: "Extra Charge" },
];

const TESTIMONIALS = [
  { name: "Patrick O.", text: "Ryan found the leak in 10 minutes that two other plumbers missed for weeks. Saved us thousands in potential water damage. Absolutely the best diagnostic plumber in Seattle.", rating: 5 },
  { name: "The Nguyen Family", text: "Water heater died on Christmas Eve. Ryan had a new one installed by 9am Christmas Day. That kind of dedication is rare. We are customers for life.", rating: 5 },
  { name: "Carol & Jim S.", text: "Repiped our entire 1940s house. Zero damage to the walls. The crew was professional, clean, and finished ahead of schedule. Incredible craftsmanship.", rating: 5 },
  { name: "Aisha M.", text: "Called at 2am for a burst pipe. Ryan was there in 35 minutes. Saved our kitchen from serious flooding. Could not be more grateful for the fast response.", rating: 5 },
  { name: "Dave T.", text: "Fair pricing, fast work, and he actually cleaned up after himself. That NEVER happens with plumbers. Ryan has earned a customer for life.", rating: 5 },
];

const SERVICE_AREAS = [
  "Capitol Hill", "Ballard", "Fremont", "Beacon Hill",
  "Columbia City", "Wallingford", "Green Lake", "Rainier Valley",
];

const HERO_IMG = "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=900&q=80";
const ABOUT_IMG = "/images/plumber-owner.png";

/* ═══════════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════════ */
export default function V2PlumberPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [quizSelected, setQuizSelected] = useState<number | null>(null);
  const testimonialRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  /* Testimonial drag scroll */
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!testimonialRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - testimonialRef.current.offsetLeft);
    setScrollLeft(testimonialRef.current.scrollLeft);
  };
  const handleMouseUp = () => setIsDragging(false);
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !testimonialRef.current) return;
    e.preventDefault();
    const x = e.pageX - testimonialRef.current.offsetLeft;
    testimonialRef.current.scrollLeft = scrollLeft - (x - startX) * 1.5;
  };

  return (
    <main
      className="relative min-h-[100dvh] overflow-x-hidden"
      style={{ background: SLATE, color: "#f1f5f9" }}
    >
      <FloatingWaterDrops />
      <WaterDropDrip />

      {/* ────────────────────────── NAV ────────────────────────── */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={spring}
        className="fixed top-0 left-0 right-0 z-50"
      >
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-4">
          <GlassCard className="flex items-center justify-between px-4 md:px-6 py-3">
            <div className="flex items-center gap-2">
              <WrenchDropIcon size={28} />
              <span className="text-lg font-bold tracking-tight text-white">
                Emerald City Plumbing
              </span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
              <a href="#services" className="hover:text-white transition-colors">Services</a>
              <a href="#about" className="hover:text-white transition-colors">About</a>
              <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
              <a href="#reviews" className="hover:text-white transition-colors">Reviews</a>
              <a href="#contact" className="hover:text-white transition-colors">Contact</a>
            </div>
            <div className="flex items-center gap-3">
              <MagneticButton
                className="px-4 md:px-5 py-2 rounded-full text-sm font-semibold text-white cursor-pointer"
                style={{ background: TEAL } as React.CSSProperties}
              >
                <span className="flex items-center gap-2">
                  <Phone size={16} weight="bold" />
                  (206) 555-0893
                </span>
              </MagneticButton>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
              >
                {mobileMenuOpen ? <X size={24} /> : <List size={24} />}
              </button>
            </div>
          </GlassCard>

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
                    { label: "Pricing", href: "#pricing" },
                    { label: "Reviews", href: "#reviews" },
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

      {/* ────────────────────────── 1. HERO — OVERLAPPING CARD ────────────────────────── */}
      <section className="relative min-h-[100dvh] flex items-center pt-28 pb-16 z-10 overflow-hidden">
        {/* Background gradients */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at 20% 30%, rgba(30, 64, 175, 0.2) 0%, transparent 60%),
                          radial-gradient(ellipse at 80% 70%, rgba(13, 148, 136, 0.1) 0%, transparent 50%)`,
          }}
        />

        <div className="relative mx-auto max-w-7xl px-4 md:px-6 w-full">
          <div className="relative flex flex-col lg:flex-row items-center lg:items-stretch gap-8 lg:gap-0">
            {/* Glass Card — overlaps the image on desktop */}
            <div className="relative z-20 lg:w-[48%] lg:mr-[-8%]">
              <RippleBorderCard className="h-full">
                <div className="p-8 md:p-10 lg:p-12 space-y-6">
                  <motion.p
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ ...spring, delay: 0.1 }}
                    className="text-sm uppercase tracking-widest"
                    style={{ color: TEAL }}
                  >
                    Seattle&apos;s Most Trusted Plumber Since 2004
                  </motion.p>

                  <h1 className="text-4xl md:text-6xl tracking-tighter leading-[1.05] font-bold text-white">
                    <WordReveal text="Expert Plumbing, Honest Pricing." />
                  </h1>

                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...spring, delay: 0.6 }}
                    className="text-lg text-slate-400 leading-relaxed max-w-md"
                  >
                    Master plumber Ryan Kowalski and his crew deliver fast, reliable
                    plumbing with upfront pricing and a satisfaction guarantee on every job.
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...spring, delay: 0.8 }}
                    className="flex flex-wrap gap-4"
                  >
                    <MagneticButton
                      className="px-7 py-3.5 rounded-full text-base font-semibold text-white flex items-center gap-2 cursor-pointer"
                      style={{ background: TEAL } as React.CSSProperties}
                    >
                      Free Estimate
                      <ArrowRight size={18} weight="bold" />
                    </MagneticButton>
                    <MagneticButton className="px-7 py-3.5 rounded-full text-base font-semibold text-white border border-white/15 flex items-center gap-2 cursor-pointer">
                      <Phone size={18} weight="duotone" />
                      Call Now
                    </MagneticButton>
                  </motion.div>

                  {/* Badges below CTAs */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ ...spring, delay: 1.0 }}
                    className="flex flex-wrap gap-3 pt-2"
                  >
                    {/* Emergency pulsing badge */}
                    <span className="relative flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold text-white" style={{ background: "rgba(239,68,68,0.2)", border: "1px solid rgba(239,68,68,0.4)" }}>
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
                      </span>
                      24/7 Emergency
                    </span>
                    <span className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold text-white" style={{ background: TEAL_GLOW, border: `1px solid ${TEAL}44` }}>
                      <Clock size={14} weight="bold" style={{ color: TEAL }} />
                      Same-Day Service
                    </span>
                  </motion.div>
                </div>
              </RippleBorderCard>
            </div>

            {/* Hero Image — 60% width on desktop, behind the card overlap */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ ...spring, delay: 0.3 }}
              className="relative z-10 lg:w-[60%] rounded-2xl overflow-hidden"
              style={{ minHeight: 400 }}
            >
              <img
                src={HERO_IMG}
                alt="Professional plumber working on modern residential plumbing installation"
                className="w-full h-full object-cover rounded-2xl"
                style={{ minHeight: 400, maxHeight: 560 }}
              />
              <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-[#0f172a]/60 rounded-2xl" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ────────────────────────── 2. EMERGENCY STRIP ────────────────────────── */}
      <SectionReveal className="relative z-10">
        <div
          className="py-4 text-center relative overflow-hidden"
          style={{ background: `linear-gradient(90deg, ${DEEP_BLUE}, ${TEAL})` }}
        >
          <motion.div
            className="absolute inset-0"
            style={{ background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)` }}
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
          <p className="relative z-10 text-white font-bold text-sm md:text-base tracking-wide flex items-center justify-center gap-3 flex-wrap px-4">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
            </span>
            Burst Pipe? Flooding? We&apos;re There in 60 Minutes &mdash;
            <a href="tel:2065550893" className="underline underline-offset-2 font-extrabold">(206) 555-0893</a>
          </p>
        </div>
      </SectionReveal>

      {/* ────────────────────────── 3. TRUST BAR ────────────────────────── */}
      <SectionReveal className="relative z-10 py-8">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <GlassCard className="p-5 md:p-6">
            <motion.div
              className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm md:text-base"
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-50px" }}
            >
              {[
                { icon: Certificate, label: "Master Plumber" },
                { icon: Clock, label: "20 Years Experience" },
                { icon: ThumbsUp, label: "3,000+ Jobs" },
                { icon: SealCheck, label: "WA #EMERACPL847DK" },
                { icon: Star, label: "4.9 Stars" },
              ].map((item, i) => (
                <motion.div key={i} variants={fadeUp} className="flex items-center gap-2 text-slate-300">
                  <item.icon size={20} weight="duotone" style={{ color: TEAL }} />
                  <span className="font-medium">{item.label}</span>
                  {i < 4 && <span className="hidden md:inline text-slate-600 ml-4">|</span>}
                </motion.div>
              ))}
            </motion.div>
          </GlassCard>
        </div>
      </SectionReveal>

      {/* ────────────────────────── 4. SERVICES — OFFSET GRID ────────────────────────── */}
      <SectionReveal id="services" className="relative z-10 py-16 md:py-24">
        <PipeGridPattern />
        <div className="relative mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: TEAL }}>
              What We Do
            </p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Our Plumbing Services" />
            </h2>
          </div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
          >
            {SERVICES.map((svc, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className={i % 2 === 1 ? "lg:mt-8" : ""}
              >
                <motion.div whileHover={{ scale: 1.03, y: -4 }} transition={springGentle} style={{ willChange: "transform" }}>
                  <GlassCard className="p-6 h-full relative overflow-hidden group">
                    <span className="absolute top-3 right-4 text-5xl font-black opacity-[0.04] tracking-tighter" style={{ color: TEAL_LIGHT }}>
                      {svc.number}
                    </span>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: BLUE_GLOW }}>
                      <svc.icon size={24} weight="duotone" style={{ color: TEAL }} />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{svc.title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{svc.desc}</p>
                    <div className="absolute bottom-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: `linear-gradient(90deg, ${DEEP_BLUE}, ${TEAL})` }} />
                  </GlassCard>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ────────────────────────── 5. UPFRONT PRICING ────────────────────────── */}
      <SectionReveal id="pricing" className="relative z-10 py-16 md:py-24">
        <WaterWaveBackground />
        <div className="relative mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-14">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: TEAL }}>Transparent Pricing</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="No Surprises. Ever." />
            </h2>
          </div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
          >
            {[
              { service: "Drain Cleaning", price: "$99", note: "Most clogs cleared same-day", icon: Funnel },
              { service: "Water Heater Install", price: "$1,200", note: "Tankless & traditional, fully permitted", icon: Flame, featured: true },
              { service: "Leak Repair", price: "$149", note: "Find it, fix it, guarantee it", icon: Drop },
            ].map((item, i) => (
              <motion.div key={i} variants={fadeUp}>
                {item.featured ? (
                  <ShimmerBorder>
                    <div className="p-8 text-center space-y-4">
                      <div className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto" style={{ background: TEAL_GLOW }}>
                        <item.icon size={28} weight="duotone" style={{ color: TEAL }} />
                      </div>
                      <h3 className="text-lg font-semibold text-white">{item.service}</h3>
                      <p className="text-4xl font-bold text-white">from <span style={{ color: TEAL }}>{item.price}</span></p>
                      <p className="text-sm text-slate-400">{item.note}</p>
                    </div>
                  </ShimmerBorder>
                ) : (
                  <GlassCard className="p-8 text-center space-y-4 h-full">
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto" style={{ background: BLUE_GLOW }}>
                      <item.icon size={28} weight="duotone" style={{ color: TEAL }} />
                    </div>
                    <h3 className="text-lg font-semibold text-white">{item.service}</h3>
                    <p className="text-4xl font-bold text-white">from <span style={{ color: TEAL }}>{item.price}</span></p>
                    <p className="text-sm text-slate-400">{item.note}</p>
                  </GlassCard>
                )}
              </motion.div>
            ))}
          </motion.div>

          <p className="text-center text-slate-500 text-sm mt-8">
            All pricing is upfront and flat-rate. You approve the price before we start work.
          </p>
        </div>
      </SectionReveal>

      {/* ────────────────────────── 6. HONEST PLUMBER PROMISE ────────────────────────── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <PipeGridPattern />
        <div className="relative mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-14">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: TEAL }}>Our Guarantee</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="The Honest Plumber Promise" />
            </h2>
          </div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
          >
            {[
              { title: "We Show You the Problem First", desc: "Camera inspection footage so you see exactly what we see. No guesswork, no trust-me pricing.", icon: MagnifyingGlass },
              { title: "Upfront Pricing Before We Start", desc: "You approve a flat-rate price before any wrench turns. The price on the invoice matches the price we quoted.", icon: CurrencyDollar },
              { title: "Clean Up After Every Job", desc: "We lay down drop cloths, wear boot covers, and leave your home cleaner than we found it. Every time.", icon: Broom },
              { title: "Can't Fix It? You Don't Pay", desc: "If we cannot solve the problem, you owe us nothing. That is our satisfaction guarantee, no asterisks.", icon: ShieldCheck },
            ].map((item, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="p-6 h-full text-center space-y-4">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto" style={{ background: TEAL_GLOW }}>
                    <item.icon size={28} weight="duotone" style={{ color: TEAL }} />
                  </div>
                  <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ────────────────────────── 7. MEET RYAN ────────────────────────── */}
      <SectionReveal id="about" className="relative z-10 py-16 md:py-24">
        <WaterWaveBackground />
        <div className="relative mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Photo */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={spring}
              className="relative"
            >
              <div className="rounded-2xl overflow-hidden">
                <img
                  src={ABOUT_IMG}
                  alt="Ryan Kowalski, Master Plumber and owner of Emerald City Plumbing"
                  className="w-full h-auto rounded-2xl object-cover object-top"
                  style={{ maxHeight: 500 }}
                />
              </div>
              {/* License badge overlay */}
              <div className="absolute bottom-4 left-4 right-4 md:left-6 md:bottom-6 md:right-auto">
                <GlassCard className="px-4 py-3 flex items-center gap-3">
                  <Certificate size={24} weight="duotone" style={{ color: TEAL }} />
                  <div>
                    <p className="text-xs text-slate-400">WA License</p>
                    <p className="text-sm font-bold text-white">#EMERACPL847DK</p>
                  </div>
                </GlassCard>
              </div>
            </motion.div>

            {/* Text */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={spring}
              className="space-y-6"
            >
              <p className="text-sm uppercase tracking-widest" style={{ color: TEAL }}>Meet the Owner</p>
              <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white">
                Ryan Kowalski
              </h2>
              <p className="text-slate-400 leading-relaxed text-lg">
                Ryan started as a plumbing apprentice at 18, earning his journeyman license by
                22 and his Master Plumber certification by 25. After working for some of
                Seattle&apos;s largest plumbing companies, he founded Emerald City Plumbing in 2004
                with one truck and a simple promise: honest work at fair prices.
              </p>
              <p className="text-slate-400 leading-relaxed">
                Twenty years and over 3,000 jobs later, that promise has not changed. Ryan still
                personally oversees every major project and answers his phone 24/7 for emergencies.
                When he is not under a sink, he coaches his daughter&apos;s soccer team in Beacon Hill.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                {["Master Plumber", "20 Years", "3,000+ Jobs", "WA Licensed"].map((badge) => (
                  <span key={badge} className="px-4 py-2 rounded-full text-xs font-semibold text-white" style={{ background: TEAL_GLOW, border: `1px solid ${TEAL}33` }}>
                    {badge}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </SectionReveal>

      {/* ────────────────────────── 8. WHAT WE FIX ────────────────────────── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <PipeGridPattern />
        <div className="relative mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-14">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: TEAL }}>Common Problems</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="What We Fix" />
            </h2>
          </div>

          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
          >
            {COMMON_ISSUES.map((issue, i) => (
              <motion.div key={i} variants={fadeUp}>
                <motion.div whileHover={{ scale: 1.05, y: -4 }} transition={springGentle} style={{ willChange: "transform" }}>
                  <GlassCard className="p-5 md:p-6 text-center space-y-3 cursor-pointer group">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform" style={{ background: BLUE_GLOW }}>
                      <issue.icon size={24} weight="duotone" style={{ color: TEAL }} />
                    </div>
                    <p className="text-sm md:text-base font-semibold text-white">{issue.title}</p>
                  </GlassCard>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ────────────────────────── 9. DIAGNOSTIC QUIZ ────────────────────────── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <WaterWaveBackground />
        <div className="relative mx-auto max-w-4xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: TEAL }}>Quick Diagnostic</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="What's Your Plumbing Issue?" />
            </h2>
          </div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
          >
            {QUIZ_OPTIONS.map((opt, i) => (
              <motion.div key={i} variants={fadeUp}>
                <motion.button
                  onClick={() => setQuizSelected(i)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full text-left cursor-pointer"
                >
                  <GlassCard className={`p-6 h-full transition-all ${quizSelected === i ? "ring-2" : ""}`} >
                    <div className="flex items-start gap-4" style={quizSelected === i ? { } : {}}>
                      <div
                        className="w-3 h-3 rounded-full mt-1.5 shrink-0"
                        style={{ background: opt.color, boxShadow: `0 0 12px ${opt.color}66` }}
                      />
                      <div>
                        <p className="text-lg font-semibold text-white">{opt.label}</p>
                        <p className="text-xs font-bold mt-1" style={{ color: opt.color }}>{opt.severity}</p>
                      </div>
                    </div>
                  </GlassCard>
                </motion.button>
              </motion.div>
            ))}
          </motion.div>

          <AnimatePresence>
            {quizSelected !== null && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={spring}
                className="mt-8"
              >
                <ShimmerBorder>
                  <div className="p-8 text-center space-y-4">
                    <p className="text-lg text-slate-300 leading-relaxed">
                      {QUIZ_OPTIONS[quizSelected].recommendation}
                    </p>
                    <MagneticButton
                      className="px-8 py-3.5 rounded-full text-base font-semibold text-white cursor-pointer"
                      style={{ background: QUIZ_OPTIONS[quizSelected].color } as React.CSSProperties}
                    >
                      {QUIZ_OPTIONS[quizSelected].cta}
                    </MagneticButton>
                  </div>
                </ShimmerBorder>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </SectionReveal>

      {/* ────────────────────────── 10. COMPETITOR COMPARISON ────────────────────────── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <PipeGridPattern />
        <div className="relative mx-auto max-w-4xl px-4 md:px-6">
          <div className="text-center mb-14">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: TEAL }}>Why Choose Us</p>
            <h2 className="text-3xl md:text-5xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Emerald City vs. Handyman Plumbing" />
            </h2>
          </div>

          <GlassCard className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px]">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-4 md:p-5 text-sm text-slate-400 font-medium">Feature</th>
                    <th className="p-4 md:p-5 text-sm font-bold text-center" style={{ color: TEAL }}>Emerald City</th>
                    <th className="p-4 md:p-5 text-sm text-slate-500 text-center font-medium">Others</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_ROWS.map((row, i) => (
                    <tr key={i} className={i < COMPARISON_ROWS.length - 1 ? "border-b border-white/5" : ""}>
                      <td className="p-4 md:p-5 text-sm text-slate-300">{row.feature}</td>
                      <td className="p-4 md:p-5 text-center">
                        <CheckCircle size={22} weight="fill" style={{ color: TEAL }} className="mx-auto" />
                      </td>
                      <td className="p-4 md:p-5 text-center text-sm text-slate-500">{row.them}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      </SectionReveal>

      {/* ────────────────────────── 11. TESTIMONIALS — HORIZONTAL SCROLL ────────────────────────── */}
      <SectionReveal id="reviews" className="relative z-10 py-16 md:py-24">
        <WaterWaveBackground />
        <div className="relative mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-4">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: TEAL }}>Customer Reviews</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white mb-4">
              <WordReveal text="What Seattle Says" />
            </h2>
            {/* Google Reviews Header */}
            <div className="flex items-center justify-center gap-2 mb-10">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={20} weight="fill" style={{ color: "#facc15" }} />
                ))}
              </div>
              <span className="text-slate-300 text-sm font-medium">4.9 / 5.0 &middot; 380+ Reviews</span>
            </div>
          </div>

          {/* Horizontal scroll container */}
          <div
            ref={testimonialRef}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onMouseMove={handleMouseMove}
            className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide cursor-grab active:cursor-grabbing select-none"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ ...spring, delay: i * 0.1 }}
                className="flex-none w-[340px] md:w-[380px]"
              >
                <GlassCard className="p-6 md:p-8 h-full space-y-4">
                  <Quotes size={32} weight="fill" style={{ color: TEAL }} className="opacity-30" />
                  <div className="flex gap-0.5 mb-2">
                    {Array.from({ length: t.rating }).map((_, s) => (
                      <Star key={s} size={16} weight="fill" style={{ color: "#facc15" }} />
                    ))}
                  </div>
                  <p className="text-slate-300 leading-relaxed text-sm">&ldquo;{t.text}&rdquo;</p>
                  <div className="flex items-center gap-2 pt-2">
                    <CheckCircle size={16} weight="fill" style={{ color: TEAL }} />
                    <p className="text-sm font-semibold text-white">{t.name}</p>
                    <span className="text-xs text-slate-500">Verified</span>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>

          <p className="text-center text-slate-500 text-xs mt-4">Drag to scroll &rarr;</p>
        </div>
      </SectionReveal>

      {/* ────────────────────────── 12. FINANCING ────────────────────────── */}
      <SectionReveal className="relative z-10 py-12 md:py-16">
        <div className="mx-auto max-w-4xl px-4 md:px-6">
          <ShimmerBorder>
            <div className="p-8 md:p-12 text-center space-y-4" style={{ background: `radial-gradient(ellipse at center, ${BLUE_GLOW} 0%, transparent 70%)` }}>
              <HandCoins size={48} weight="duotone" style={{ color: TEAL }} className="mx-auto" />
              <h2 className="text-3xl md:text-4xl tracking-tighter font-bold text-white">
                Big Job? No Problem.
              </h2>
              <p className="text-xl text-slate-300">
                0% financing for 12 months on water heater installs, repiping, and sewer line replacement.
              </p>
              <p className="text-slate-500 text-sm">Subject to credit approval. Ask about our payment plans.</p>
              <MagneticButton
                className="px-8 py-3.5 rounded-full text-base font-semibold text-white cursor-pointer mt-2"
                style={{ background: TEAL } as React.CSSProperties}
              >
                Learn About Financing
              </MagneticButton>
            </div>
          </ShimmerBorder>
        </div>
      </SectionReveal>

      {/* ────────────────────────── 13. VIDEO PLACEHOLDER ────────────────────────── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <PipeGridPattern />
        <div className="relative mx-auto max-w-5xl px-4 md:px-6">
          <div className="text-center mb-10">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: TEAL }}>See Our Work</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Quality You Can See" />
            </h2>
          </div>

          <motion.div
            whileHover={{ scale: 1.01 }}
            transition={springGentle}
            className="relative rounded-2xl overflow-hidden cursor-pointer group"
            style={{ aspectRatio: "16/9" }}
          >
            <img
              src="https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=1200&q=80"
              alt="Professional plumbing work in progress"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors flex items-center justify-center">
              <motion.div
                className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{ background: `${TEAL}cc` }}
                whileHover={{ scale: 1.1 }}
                animate={{ boxShadow: [`0 0 0 0px ${TEAL}44`, `0 0 0 20px ${TEAL}00`] }}
                transition={{ boxShadow: { duration: 1.5, repeat: Infinity } }}
              >
                <Play size={32} weight="fill" className="text-white ml-1" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </SectionReveal>

      {/* ────────────────────────── 14. SERVICE AREAS ────────────────────────── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <WaterWaveBackground />
        <div className="relative mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-14">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: TEAL }}>Where We Work</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Serving Greater Seattle" />
            </h2>
          </div>

          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
          >
            {SERVICE_AREAS.map((area, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="p-4 md:p-5 text-center group hover:border-white/20 transition-colors">
                  <MapPin size={20} weight="duotone" style={{ color: TEAL }} className="mx-auto mb-2" />
                  <p className="text-sm font-medium text-white">{area}</p>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>

          <div className="text-center mt-8">
            <p className="text-slate-400 text-sm">
              Plus Shoreline, Lake City, Tukwila, Renton, Burien, and surrounding King County communities.
            </p>
            {/* Pulsing availability indicator */}
            <div className="flex items-center justify-center gap-2 mt-4">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: TEAL }} />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ background: TEAL }} />
              </span>
              <span className="text-sm font-medium" style={{ color: TEAL }}>Crews Available Now</span>
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* ────────────────────────── 15. CONTACT ────────────────────────── */}
      <SectionReveal id="contact" className="relative z-10 py-16 md:py-24">
        <PipeGridPattern />
        <div className="relative mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Form */}
            <div>
              <p className="text-sm uppercase tracking-widest mb-3" style={{ color: TEAL }}>Get in Touch</p>
              <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white mb-8">
                Request a Free Estimate
              </h2>

              <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Full Name</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-500/50 transition-colors"
                      placeholder="John Smith"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-500/50 transition-colors"
                      placeholder="(206) 555-1234"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Email</label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-500/50 transition-colors"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Service Needed</label>
                  <select className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-white focus:outline-none focus:border-teal-500/50 transition-colors">
                    <option value="">Select a service...</option>
                    <option value="emergency">Emergency Plumbing</option>
                    <option value="drain">Drain Cleaning</option>
                    <option value="water-heater">Water Heater</option>
                    <option value="sewer">Sewer Line</option>
                    <option value="repiping">Repiping</option>
                    <option value="leak">Leak Detection</option>
                    <option value="fixture">Toilet / Faucet</option>
                    <option value="gas">Gas Line</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Describe the Issue</label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-500/50 transition-colors resize-none"
                    placeholder="Tell us about the problem..."
                  />
                </div>
                <MagneticButton
                  className="w-full py-4 rounded-xl text-base font-semibold text-white cursor-pointer"
                  style={{ background: TEAL } as React.CSSProperties}
                >
                  Send Request
                </MagneticButton>
              </form>
            </div>

            {/* Office Info */}
            <div className="space-y-8">
              {/* Emergency CTA */}
              <ShimmerBorder>
                <div className="p-6 md:p-8 text-center space-y-3" style={{ background: `radial-gradient(ellipse at center, rgba(239,68,68,0.1) 0%, transparent 70%)` }}>
                  <Warning size={36} weight="duotone" style={{ color: RED_EMERGENCY }} />
                  <h3 className="text-xl font-bold text-white">Plumbing Emergency?</h3>
                  <p className="text-slate-400 text-sm">Skip the form. Call now for immediate help.</p>
                  <a href="tel:2065550893" className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-lg font-bold text-white" style={{ background: RED_EMERGENCY }}>
                    <Phone size={20} weight="bold" />
                    (206) 555-0893
                  </a>
                </div>
              </ShimmerBorder>

              {/* Office details */}
              <GlassCard className="p-6 md:p-8 space-y-5">
                <h3 className="text-xl font-bold text-white">Office Info</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin size={20} weight="duotone" style={{ color: TEAL }} className="mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm text-slate-400">Address</p>
                      <a href="https://maps.google.com/?q=5612+Rainier+Ave+S+Seattle+WA+98118" target="_blank" rel="noopener noreferrer" className="text-white hover:underline">
                        5612 Rainier Ave S, Seattle, WA 98118
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone size={20} weight="duotone" style={{ color: TEAL }} className="mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm text-slate-400">Phone</p>
                      <a href="tel:2065550893" className="text-white hover:underline">(206) 555-0893</a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Envelope size={20} weight="duotone" style={{ color: TEAL }} className="mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm text-slate-400">Email</p>
                      <a href="mailto:help@emeraldcityplumbing.com" className="text-white hover:underline">help@emeraldcityplumbing.com</a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock size={20} weight="duotone" style={{ color: TEAL }} className="mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm text-slate-400">Hours</p>
                      <p className="text-white">Mon-Sat 7am-7pm &middot; 24/7 Emergency</p>
                    </div>
                  </div>
                </div>
              </GlassCard>

              {/* Certifications */}
              <GlassCard className="p-5 flex flex-wrap items-center justify-center gap-3">
                {["Master Plumber", "Licensed & Bonded", "Insured", "BBB A+", "WA State License"].map((cert) => (
                  <span key={cert} className="px-3 py-1.5 rounded-full text-xs font-semibold text-slate-300 border border-white/10 bg-white/[0.03]">
                    {cert}
                  </span>
                ))}
              </GlassCard>
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* ────────────────────────── 16. FOOTER ────────────────────────── */}
      <footer className="relative z-10 border-t border-white/[0.06] py-12">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <WrenchDropIcon size={24} />
                <span className="text-lg font-bold text-white">Emerald City Plumbing</span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                Seattle&apos;s most trusted plumber since 2004. Licensed, bonded, and insured.
                WA #EMERACPL847DK.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Services</h4>
              <div className="grid grid-cols-2 gap-2">
                {SERVICES.slice(0, 6).map((svc) => (
                  <a key={svc.title} href="#services" className="text-sm text-slate-400 hover:text-white transition-colors">
                    {svc.title}
                  </a>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Contact</h4>
              <div className="space-y-2 text-sm text-slate-400">
                <a href="tel:2065550893" className="block hover:text-white transition-colors">(206) 555-0893</a>
                <a href="mailto:help@emeraldcityplumbing.com" className="block hover:text-white transition-colors">help@emeraldcityplumbing.com</a>
                <p>5612 Rainier Ave S, Seattle, WA 98118</p>
                <p>Mon-Sat 7am-7pm &middot; 24/7 Emergency</p>
              </div>
            </div>
          </div>

          <div className="border-t border-white/[0.06] pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500">
              &copy; {new Date().getFullYear()} Emerald City Plumbing. All rights reserved. WA License #EMERACPL847DK.
            </p>
            <p className="text-sm text-slate-500">
              Created by{" "}
              <a
                href="https://bluejayportfolio.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
                style={{ color: TEAL }}
              >
                bluejayportfolio.com
              </a>
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
