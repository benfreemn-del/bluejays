"use client";

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
  Hammer,
  PhoneCall,
  MagnifyingGlass,
  ThumbsUp,
  CurrencyDollar,
  Envelope,
  ChatCircleDots,
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

/* ───────────────────────── FLOATING WATER DROPS ───────────────────────── */
function FloatingWaterDrops() {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 10,
    duration: 7 + Math.random() * 7,
    size: 3 + Math.random() * 5,
    opacity: 0.1 + Math.random() * 0.25,
  }));

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden hidden md:block">
      {particles.map((p) => (
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

/* ───────────────────────── WRENCH + DROP SVG ───────────────────────── */
function WrenchDropIcon({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
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

/* ───────────────────────── WATER WAVE SVG BG ───────────────────────── */
function WaterWaveBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
      <motion.svg
        viewBox="0 0 1440 320"
        className="absolute bottom-0 w-full"
        preserveAspectRatio="none"
      >
        <motion.path
          fill={DEEP_BLUE}
          fillOpacity="0.4"
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
          fill={TEAL}
          fillOpacity="0.2"
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

/* ───────────────────────── DATA ───────────────────────── */
const services = [
  {
    title: "Emergency Plumbing",
    description: "Burst pipes, major leaks, and flooding handled fast. Our emergency crew is on call 24/7 to protect your home from water damage.",
    icon: Drop,
    number: "01",
  },
  {
    title: "Drain Cleaning",
    description: "Stubborn clogs eliminated with hydro-jetting and camera inspections. We clear kitchen, bathroom, and main sewer lines.",
    icon: Wrench,
    number: "02",
  },
  {
    title: "Water Heater",
    description: "Tankless and traditional water heater installation, repair, and maintenance. Energy-efficient upgrades that cut your utility bills.",
    icon: Flame,
    number: "03",
  },
  {
    title: "Bathroom Remodel",
    description: "Full bathroom renovations from fixtures to tile. We handle plumbing rough-in, shower installs, and luxury upgrades.",
    icon: Bathtub,
    number: "04",
  },
  {
    title: "Pipe Repair",
    description: "Trenchless pipe repair and repiping for aging systems. We fix leaks, corrosion, and low water pressure without tearing up your yard.",
    icon: Pipe,
    number: "05",
  },
  {
    title: "Sewer Line",
    description: "Sewer line inspection, cleaning, and replacement. Video camera diagnostics to find the problem before we dig.",
    icon: Warning,
    number: "06",
  },
];

const stats = [
  { value: "30", label: "Minute Emergency Response", suffix: "min", icon: Timer },
  { value: "25", label: "Years Licensed & Insured", suffix: "+", icon: Certificate },
  { value: "15,000", label: "Jobs Completed", suffix: "+", icon: Hammer },
  { value: "4.9", label: "Average Customer Rating", suffix: "/5", icon: Star },
];

const testimonials = [
  {
    name: "Robert M.",
    text: "Burst pipe at 2 AM and they were at our door in under 30 minutes. Fixed everything, cleaned up, and the price was exactly what they quoted. Absolutely the best plumber we have ever used.",
    rating: 5,
  },
  {
    name: "Jennifer K.",
    text: "Had them do a complete bathroom remodel. The attention to detail was incredible. Every pipe, every fitting, perfect. They treated our home like it was their own.",
    rating: 5,
  },
  {
    name: "Carlos D.",
    text: "After three other plumbers could not find our leak, Emerald City used camera inspection and found it in minutes. Honest pricing, no upselling, just great work. Highly recommend.",
    rating: 5,
  },
];

const processSteps = [
  { step: "01", title: "Call Us", description: "Reach us 24/7 by phone or online. We will ask a few questions to understand your issue.", icon: PhoneCall },
  { step: "02", title: "We Arrive Fast", description: "A licensed plumber arrives at your door promptly with a fully-stocked truck ready to work.", icon: Timer },
  { step: "03", title: "Diagnose", description: "We inspect, use camera diagnostics if needed, and explain the problem before any work starts.", icon: MagnifyingGlass },
  { step: "04", title: "Fix It Right", description: "We complete the repair with quality parts and leave your home clean. Backed by our satisfaction guarantee.", icon: ThumbsUp },
];

const faqData = [
  {
    question: "Do you offer 24/7 emergency plumbing services?",
    answer: "Yes. Our emergency team is available 24 hours a day, 7 days a week, including holidays. We typically arrive within 30 minutes for emergency calls in our service area.",
  },
  {
    question: "How much does a typical plumbing repair cost?",
    answer: "We provide upfront, flat-rate pricing before any work begins. Common repairs range from $150 to $500 depending on the issue. We never charge hidden fees or surprise you with a bigger bill.",
  },
  {
    question: "Are your plumbers licensed and insured?",
    answer: "Absolutely. Every technician on our team is fully licensed, bonded, and insured. We carry comprehensive liability coverage to protect your home and our team.",
  },
  {
    question: "Do you offer warranties on your work?",
    answer: "Yes. All our repairs come with a 1-year labor warranty and we honor all manufacturer warranties on parts. Water heater installations include an extended 5-year warranty.",
  },
];

const pricingItems = [
  { service: "Drain Cleaning", range: "$99 - $250" },
  { service: "Water Heater Repair", range: "$150 - $500" },
  { service: "Pipe Leak Repair", range: "$175 - $450" },
  { service: "Toilet Repair/Replace", range: "$150 - $400" },
  { service: "Faucet Installation", range: "$125 - $300" },
  { service: "Sewer Line Camera Inspection", range: "$200 - $500" },
];

const galleryImages = [
  { src: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=600&q=80", alt: "Modern bathroom remodel with walk-in shower" },
  { src: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=600&q=80", alt: "Copper pipe installation work" },
  { src: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&q=80", alt: "Luxury bathroom renovation" },
  { src: "https://images.unsplash.com/photo-1564540586988-aa4e53ab3394?w=600&q=80", alt: "Kitchen sink plumbing installation" },
  { src: "https://images.unsplash.com/photo-1613685703305-38ca3a68f878?w=600&q=80", alt: "New tankless water heater installed" },
  { src: "https://images.unsplash.com/photo-1504973960431-1c1c6e3c3e6f?w=600&q=80", alt: "Complete residential plumbing project" },
];

/* ═══════════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════════ */
export default function V2PlumberPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <main
      className="relative min-h-[100dvh] overflow-x-hidden"
      style={{ background: SLATE, color: "#f1f5f9" }}
    >
      <FloatingWaterDrops />

      {/* ─── 1. NAV ─── */}
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
              <a href="#emergency" className="hover:text-white transition-colors">Emergency</a>
              <a href="#contact" className="hover:text-white transition-colors">Contact</a>
            </div>
            <div className="flex items-center gap-3">
              <MagneticButton
                className="px-4 md:px-5 py-2 rounded-full text-sm font-semibold text-white transition-colors cursor-pointer"
                style={{ background: TEAL } as React.CSSProperties}
              >
                <span className="flex items-center gap-2">
                  <Phone size={16} weight="bold" />
                  Call Now
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
                    { label: "Emergency", href: "#emergency" },
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

      {/* ─── 2. HERO ─── */}
      <section className="relative min-h-[100dvh] flex items-center pt-24 z-10 overflow-hidden">
        {/* Water flow SVG wave patterns */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.svg
            viewBox="0 0 1440 400"
            className="absolute bottom-0 w-full opacity-15"
            preserveAspectRatio="none"
          >
            <motion.path
              fill={DEEP_BLUE}
              animate={{
                d: [
                  "M0,300L60,285C120,270,240,240,360,235C480,230,600,250,720,265C840,280,960,290,1080,275C1200,260,1320,220,1380,200L1440,180L1440,400L0,400Z",
                  "M0,270L60,280C120,290,240,270,360,255C480,240,600,260,720,275C840,290,960,280,1080,260C1200,240,1320,250,1380,260L1440,270L1440,400L0,400Z",
                  "M0,300L60,285C120,270,240,240,360,235C480,230,600,250,720,265C840,280,960,290,1080,275C1200,260,1320,220,1380,200L1440,180L1440,400L0,400Z",
                ],
              }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.svg>
          <motion.svg
            viewBox="0 0 1440 400"
            className="absolute bottom-0 w-full opacity-10"
            preserveAspectRatio="none"
          >
            <motion.path
              fill={TEAL}
              animate={{
                d: [
                  "M0,320L60,310C120,300,240,280,360,270C480,260,600,280,720,290C840,300,960,310,1080,295C1200,280,1320,260,1380,250L1440,240L1440,400L0,400Z",
                  "M0,290L60,300C120,310,240,300,360,285C480,270,600,275,720,285C840,295,960,305,1080,290C1200,275,1320,270,1380,275L1440,280L1440,400L0,400Z",
                  "M0,320L60,310C120,300,240,280,360,270C480,260,600,280,720,290C840,300,960,310,1080,295C1200,280,1320,260,1380,250L1440,240L1440,400L0,400Z",
                ],
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            />
          </motion.svg>
        </div>

        {/* Deep blue gradient overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at 30% 20%, rgba(30, 64, 175, 0.2) 0%, transparent 60%),
                          radial-gradient(ellipse at 70% 80%, rgba(13, 148, 136, 0.1) 0%, transparent 50%)`,
          }}
        />

        <div className="relative mx-auto max-w-7xl px-4 md:px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-4 items-center">
          <div className="space-y-8">
            <div>
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ ...spring, delay: 0.1 }}
                className="text-sm uppercase tracking-widest mb-4"
                style={{ color: TEAL }}
              >
                Licensed &amp; Insured Since 2001
              </motion.p>
              <h1
                className="text-4xl md:text-7xl tracking-tighter leading-none font-bold text-white"
                style={{ textShadow: "0 2px 20px rgba(0,0,0,0.6)" }}
              >
                <WordReveal text="Fast. Reliable. Done Right." />
              </h1>
            </div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring, delay: 0.6 }}
              className="text-lg text-slate-400 max-w-md leading-relaxed"
            >
              From emergency repairs to full bathroom remodels, Emerald City
              Plumbing delivers expert service with upfront pricing and a
              satisfaction guarantee on every job.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring, delay: 0.8 }}
              className="flex flex-wrap gap-4"
            >
              <MagneticButton
                className="px-8 py-4 rounded-full text-base font-semibold text-white flex items-center gap-2 cursor-pointer"
                style={{ background: TEAL } as React.CSSProperties}
              >
                Get a Free Estimate
                <ArrowRight size={18} weight="bold" />
              </MagneticButton>
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/10 flex items-center gap-2 cursor-pointer">
                <Phone size={18} weight="duotone" />
                (555) 847-3200
              </MagneticButton>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ ...spring, delay: 1 }}
              className="flex flex-wrap gap-6 text-sm text-slate-400"
            >
              <span className="flex items-center gap-2">
                <MapPin size={16} weight="duotone" style={{ color: TEAL }} />
                Seattle, WA &amp; Surrounding Areas
              </span>
              <span className="flex items-center gap-2">
                <Clock size={16} weight="duotone" style={{ color: TEAL }} />
                24/7 Emergency Service
              </span>
            </motion.div>
          </div>

          {/* Right: animated pipe/wrench SVG */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ ...spring, delay: 0.3 }}
            className="hidden md:flex items-center justify-center lg:justify-end"
          >
            <div className="relative flex items-center justify-center">
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background: `radial-gradient(circle, ${BLUE_GLOW} 0%, transparent 70%)`,
                  filter: "blur(40px)",
                  willChange: "transform",
                }}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.svg
                viewBox="0 0 200 200"
                className="relative z-10 w-48 h-48 md:w-72 md:h-72"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Wrench */}
                <motion.path
                  d="M60 140L120 80C125 75 128 68 128 60C128 44 115 31 99 31C91 31 84 34 79 40L40 100"
                  stroke={TEAL}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                />
                <motion.path
                  d="M40 100L30 125C28 131 30 138 35 142L58 165C62 170 69 172 75 170L100 160L60 140Z"
                  stroke={TEAL}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 2, delay: 0.5, ease: "easeInOut" }}
                />
                {/* Water drop */}
                <motion.path
                  d="M150 90C150 90 135 115 135 130C135 138 138 145 143 150C148 155 155 158 162 155C169 152 174 146 175 139C176 130 168 115 155 95C153 92 151 90 150 90Z"
                  stroke={DEEP_BLUE}
                  strokeWidth="2.5"
                  fill={`${DEEP_BLUE}33`}
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 2, delay: 1, ease: "easeInOut" }}
                />
                {/* Sparkle accents */}
                <motion.circle
                  cx="160"
                  cy="75"
                  r="3"
                  fill={TEAL_LIGHT}
                  animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.3, 0.8] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                />
                <motion.circle
                  cx="75"
                  cy="50"
                  r="2"
                  fill={TEAL_LIGHT}
                  animate={{ opacity: [0.2, 0.9, 0.2], scale: [0.6, 1.2, 0.6] }}
                  transition={{ duration: 3, repeat: Infinity, delay: 0.8 }}
                />
              </motion.svg>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── 3. STATS ─── */}
      <SectionReveal className="relative z-10 pb-8">
        <PipeGridPattern />
        <div className="relative mx-auto max-w-7xl px-4 md:px-6">
          <GlassCard className="p-6 md:p-8">
            <motion.div
              className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8"
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-50px" }}
            >
              {stats.map((stat, i) => (
                <motion.div key={i} variants={fadeUp} className="text-center">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
                    style={{ background: BLUE_GLOW }}
                  >
                    <stat.icon size={24} weight="duotone" style={{ color: TEAL }} />
                  </div>
                  <p className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                    {stat.value}
                    <span style={{ color: TEAL }}>{stat.suffix}</span>
                  </p>
                  <p className="text-xs md:text-sm text-slate-400 mt-1">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </GlassCard>
        </div>
      </SectionReveal>

      {/* ─── 4. SERVICES ─── */}
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
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
          >
            {services.map((svc, i) => (
              <motion.div key={i} variants={fadeUp}>
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  transition={springGentle}
                  style={{ willChange: "transform" }}
                >
                  <GlassCard className="p-6 h-full relative overflow-hidden group">
                    {/* Number watermark */}
                    <span
                      className="absolute top-3 right-4 text-6xl font-black opacity-[0.04] tracking-tighter"
                      style={{ color: TEAL_LIGHT }}
                    >
                      {svc.number}
                    </span>
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                      style={{ background: BLUE_GLOW }}
                    >
                      <svc.icon size={24} weight="duotone" style={{ color: TEAL }} />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{svc.title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">
                      {svc.description}
                    </p>
                    {/* Bottom accent line on hover */}
                    <div
                      className="absolute bottom-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ background: `linear-gradient(90deg, ${DEEP_BLUE}, ${TEAL})` }}
                    />
                  </GlassCard>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── 5. EMERGENCY BANNER ─── */}
      <SectionReveal id="emergency" className="relative z-10 py-12 md:py-16">
        <div className="mx-auto max-w-5xl px-4 md:px-6">
          <ShimmerBorder>
            <div
              className="p-8 md:p-12 text-center relative overflow-hidden"
              style={{
                background: `radial-gradient(ellipse at center, rgba(30, 64, 175, 0.15) 0%, transparent 70%)`,
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={spring}
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="inline-block mb-4"
                >
                  <Warning size={48} weight="duotone" style={{ color: TEAL }} />
                </motion.div>
                <h2 className="text-3xl md:text-5xl tracking-tighter leading-none font-bold text-white mb-4">
                  24/7 Emergency Service
                </h2>
                <p className="text-slate-400 text-lg mb-6 max-w-xl mx-auto">
                  Burst pipe? Flooding? Gas leak smell? Do not wait. Our emergency
                  team responds fast, day or night, weekends and holidays.
                </p>
                <p
                  className="text-4xl md:text-5xl font-bold tracking-tight mb-6"
                  style={{ color: TEAL }}
                >
                  (555) 847-3200
                </p>
                <MagneticButton
                  className="px-10 py-4 rounded-full text-base font-semibold text-white inline-flex items-center gap-2 cursor-pointer"
                  style={{ background: DEEP_BLUE } as React.CSSProperties}
                >
                  <Phone size={20} weight="bold" />
                  Call Emergency Line
                </MagneticButton>
              </motion.div>
            </div>
          </ShimmerBorder>
        </div>
      </SectionReveal>

      {/* ─── 6. WHY CHOOSE US ─── */}
      <SectionReveal id="about" className="relative z-10 py-16 md:py-24 overflow-hidden">
        <WaterWaveBackground />
        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Trust badges grid */}
            <motion.div
              className="grid grid-cols-2 gap-4"
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
            >
              {[
                { icon: ShieldCheck, label: "Licensed & Bonded", desc: "Full coverage protection" },
                { icon: Timer, label: "30-Min Response", desc: "Emergency arrivals guaranteed" },
                { icon: CurrencyDollar, label: "Upfront Pricing", desc: "No surprises, ever" },
                { icon: CheckCircle, label: "Satisfaction Guarantee", desc: "100% money-back promise" },
              ].map((item, i) => (
                <motion.div key={i} variants={fadeUp}>
                  <GlassCard className="p-5 text-center">
                    <item.icon
                      size={28}
                      weight="duotone"
                      style={{ color: TEAL }}
                      className="mx-auto mb-2"
                    />
                    <p className="text-sm font-semibold text-white">{item.label}</p>
                    <p className="text-xs text-slate-400 mt-1">{item.desc}</p>
                  </GlassCard>
                </motion.div>
              ))}
            </motion.div>

            <div>
              <p className="text-sm uppercase tracking-widest mb-3" style={{ color: TEAL }}>
                Why Choose Us
              </p>
              <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white mb-6">
                <WordReveal text="Trusted by Homeowners for 25 Years" />
              </h2>
              <p className="text-slate-400 leading-relaxed max-w-md mb-6">
                We built our reputation on showing up on time, doing the job right
                the first time, and charging a fair price. Every technician on our
                team is background-checked, licensed, and committed to leaving your
                home better than we found it.
              </p>
              <div className="space-y-3">
                {["Background-checked technicians", "Clean, uniformed, shoe-covered", "Written estimates before work begins", "Drug-free workplace policy"].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-slate-300">
                    <CheckCircle size={18} weight="duotone" style={{ color: TEAL }} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* ─── 7. PROCESS ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <PipeGridPattern />
        <div className="relative mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: TEAL }}>
              How It Works
            </p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white">
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
            {processSteps.map((step, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="p-6 text-center relative h-full">
                  <span
                    className="absolute top-3 right-4 text-5xl font-black opacity-[0.05] tracking-tighter"
                    style={{ color: TEAL_LIGHT }}
                  >
                    {step.step}
                  </span>
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                    style={{ background: BLUE_GLOW }}
                  >
                    <step.icon size={28} weight="duotone" style={{ color: TEAL }} />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{step.description}</p>
                  {i < processSteps.length - 1 && (
                    <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-20">
                      <ArrowRight size={20} style={{ color: TEAL }} className="opacity-40" />
                    </div>
                  )}
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── 8. GALLERY ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at 50% 50%, rgba(30, 64, 175, 0.08) 0%, transparent 60%)`,
          }}
        />
        <div className="relative mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: TEAL }}>
              Our Work
            </p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Recent Projects" />
            </h2>
          </div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
          >
            {galleryImages.map((img, i) => (
              <motion.div key={i} variants={fadeUp}>
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  transition={springGentle}
                  className="rounded-2xl overflow-hidden border border-white/10"
                  style={{ willChange: "transform" }}
                >
                  <img
                    src={img.src}
                    alt={img.alt}
                    className="w-full aspect-[4/3] object-cover"
                  />
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── 9. TESTIMONIALS ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <PipeGridPattern />
        <div className="relative mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: TEAL }}>
              Customer Reviews
            </p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white">
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
                <GlassCard className="p-6 h-full flex flex-col">
                  <Quotes size={28} weight="fill" style={{ color: TEAL }} className="mb-3 opacity-50" />
                  <p className="text-slate-300 leading-relaxed flex-1 text-sm">
                    {t.text}
                  </p>
                  <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                    <span className="text-sm font-semibold text-white">{t.name}</span>
                    <div className="flex gap-0.5">
                      {Array.from({ length: t.rating }).map((_, j) => (
                        <Star key={j} size={12} weight="fill" style={{ color: TEAL }} />
                      ))}
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── 10. PRICING TRANSPARENCY ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at 70% 30%, rgba(13, 148, 136, 0.08) 0%, transparent 60%)`,
          }}
        />
        <div className="relative mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <p className="text-sm uppercase tracking-widest mb-3" style={{ color: TEAL }}>
                Transparent Pricing
              </p>
              <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white mb-6">
                <WordReveal text="No Hidden Fees. Ever." />
              </h2>
              <p className="text-slate-400 leading-relaxed max-w-md mb-6">
                We believe in honest, upfront pricing. Before we start any work,
                you will receive a written estimate with the total cost. If the job
                changes scope, we discuss it with you first. The price we quote is
                the price you pay.
              </p>
              <div className="flex items-center gap-3 text-sm text-slate-400">
                <CurrencyDollar size={18} weight="duotone" style={{ color: TEAL }} />
                <span>Free estimates on all non-emergency services</span>
              </div>
            </div>

            <div className="space-y-3">
              {pricingItems.map((item, i) => (
                <GlassCard key={i} className="flex items-center justify-between p-4 md:p-5">
                  <span className="text-sm font-medium text-white">{item.service}</span>
                  <span className="text-sm font-bold" style={{ color: TEAL }}>
                    {item.range}
                  </span>
                </GlassCard>
              ))}
              <p className="text-xs text-slate-500 mt-3 text-center">
                * Prices are estimates. Final pricing provided after inspection.
              </p>
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* ─── 11. FAQ ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <PipeGridPattern />
        <div className="relative mx-auto max-w-3xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: TEAL }}>
              Common Questions
            </p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Frequently Asked" />
            </h2>
          </div>

          <motion.div
            className="space-y-3"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
          >
            {faqData.map((item, i) => (
              <motion.div key={i} variants={fadeUp}>
                <AccordionItem
                  question={item.question}
                  answer={item.answer}
                  isOpen={openFaq === i}
                  onToggle={() => setOpenFaq(openFaq === i ? null : i)}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── 12. CONTACT ─── */}
      <SectionReveal id="contact" className="relative z-10 py-16 md:py-24">
        <WaterWaveBackground />
        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white mb-6">
                <WordReveal text="Ready to Fix It Right?" />
              </h2>
              <p className="text-slate-400 leading-relaxed max-w-md mb-8">
                Whether it is a dripping faucet or a plumbing emergency, we are
                here for you. Call us anytime or send a message and we will get
                back to you within the hour.
              </p>
              <div className="flex flex-wrap gap-4">
                <MagneticButton
                  className="px-10 py-4 rounded-full text-base font-semibold text-white inline-flex items-center gap-2 cursor-pointer"
                  style={{ background: TEAL } as React.CSSProperties}
                >
                  <Phone size={20} weight="duotone" />
                  Call Now
                </MagneticButton>
                <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/10 flex items-center gap-2 cursor-pointer">
                  <Envelope size={18} weight="duotone" />
                  Email Us
                </MagneticButton>
              </div>
            </div>

            <GlassCard className="p-8">
              <h3 className="text-xl font-semibold text-white mb-6">Get in Touch</h3>
              <div className="space-y-4">
                {/* Emergency hotline prominent */}
                <div
                  className="flex items-start gap-4 p-4 rounded-xl"
                  style={{ background: `rgba(30, 64, 175, 0.1)`, border: `1px solid rgba(30, 64, 175, 0.2)` }}
                >
                  <Warning size={22} weight="duotone" style={{ color: TEAL }} className="mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-bold" style={{ color: TEAL }}>Emergency Hotline</p>
                    <p className="text-lg font-bold text-white">(555) 847-3200</p>
                    <p className="text-xs text-slate-400">Available 24/7 including holidays</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <MapPin size={20} weight="duotone" style={{ color: TEAL }} className="mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-white">Location</p>
                    <p className="text-sm text-slate-400">
                      4521 Rainier Ave S<br />Seattle, WA 98118
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Phone size={20} weight="duotone" style={{ color: TEAL }} className="mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-white">Office</p>
                    <p className="text-sm text-slate-400">(555) 847-3200</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Envelope size={20} weight="duotone" style={{ color: TEAL }} className="mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-white">Email</p>
                    <p className="text-sm text-slate-400">info@emeraldcityplumbing.com</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Clock size={20} weight="duotone" style={{ color: TEAL }} className="mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-white">Hours</p>
                    <p className="text-sm text-slate-400">
                      Monday - Friday: 7:00 AM - 7:00 PM<br />
                      Saturday: 8:00 AM - 4:00 PM<br />
                      Emergency: 24/7
                    </p>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </SectionReveal>

      {/* ─── 13. FOOTER ─── */}
      <footer className="relative z-10 border-t border-white/5 py-8" style={{ background: `linear-gradient(to top, rgba(15, 23, 42, 1), rgba(15, 23, 42, 0.95))` }}>
        <div className="mx-auto max-w-7xl px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <WrenchDropIcon size={18} />
            <span>Emerald City Plumbing &copy; {new Date().getFullYear()}</span>
          </div>
          <p className="text-xs text-slate-600">
            Website created by Bluejay Business Solutions
          </p>
        </div>
      </footer>
    </main>
  );
}
