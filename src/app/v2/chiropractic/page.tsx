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
  UserPlus,
  Bone,
  Heartbeat,
  CaretDown,
  Phone,
  MapPin,
  Clock,
  ArrowRight,
  Heart,
  FirstAidKit,
  Users,
  CalendarCheck,
  CheckCircle,
  Quotes,
  X,
  List,
  Baby,
  Barbell,
  HandPalm,
  Scan,
  Person,
  Brain,
  Lightning,
  Stethoscope,
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
const BG = "#0c1a1a";
const TEAL = "#0f766e";
const TEAL_LIGHT = "#14b8a6";
const AMBER = "#d97706";
const AMBER_LIGHT = "#f59e0b";
const TEAL_GLOW = "rgba(15, 118, 110, 0.15)";
const AMBER_GLOW = "rgba(217, 119, 6, 0.15)";

/* ───────────────────────── FLOATING PARTICLES ───────────────────────── */
function FloatingHealingOrbs() {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 8,
    duration: 7 + Math.random() * 6,
    size: 4 + Math.random() * 6,
    opacity: 0.1 + Math.random() * 0.25,
    color: i % 3 === 0 ? AMBER_LIGHT : TEAL_LIGHT,
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
            background: p.color,
            filter: "blur(1px)",
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

/* ───────────────────────── SPINE SVG ───────────────────────── */
function SpineSVG() {
  return (
    <div className="relative flex items-center justify-center">
      {/* Pulsing glow behind */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{ background: `radial-gradient(circle, ${TEAL_GLOW} 0%, transparent 70%)`, filter: "blur(40px)" }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      <svg viewBox="0 0 140 240" className="relative z-10 w-44 h-72 md:w-56 md:h-96" fill="none">
        {/* Outer glow rings */}
        <motion.ellipse cx="70" cy="120" rx="62" ry="105" stroke={TEAL} strokeWidth="0.5" opacity={0.12}
          animate={{ rx: [60, 64, 60], ry: [103, 107, 103] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} />
        <motion.ellipse cx="70" cy="120" rx="55" ry="95" stroke={TEAL} strokeWidth="0.3" opacity={0.08}
          animate={{ rx: [53, 57, 53], ry: [93, 97, 93] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }} />

        {/* Spine vertebrae with fills */}
        {[22, 46, 70, 94, 118, 142, 166].map((cy, i) => (
          <motion.g key={i}>
            {/* Vertebra body — filled */}
            <motion.ellipse
              cx="70" cy={cy} rx={16 - i * 0.6} ry="9"
              fill={`${TEAL}22`} stroke={TEAL_LIGHT} strokeWidth="1.8"
              initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: i * 0.15, ease: "backOut" }}
            />
            {/* Inner vertebra highlight */}
            <ellipse cx="70" cy={cy - 1} rx={8 - i * 0.3} ry="4" fill={`${TEAL_LIGHT}15`} />
            {/* Spinous process — small wing shapes */}
            <motion.line x1={70 - (16 - i * 0.6)} y1={cy} x2={70 - (22 - i * 0.6)} y2={cy - 3}
              stroke={TEAL} strokeWidth="1.2" strokeLinecap="round" opacity={0.5}
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
              transition={{ duration: 0.8, delay: i * 0.15 + 0.3 }} />
            <motion.line x1={70 + (16 - i * 0.6)} y1={cy} x2={70 + (22 - i * 0.6)} y2={cy - 3}
              stroke={TEAL} strokeWidth="1.2" strokeLinecap="round" opacity={0.5}
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
              transition={{ duration: 0.8, delay: i * 0.15 + 0.3 }} />
            {/* Disc connector */}
            {i < 6 && (
              <motion.rect x="67" y={cy + 9} width="6" height={14} rx="3"
                fill={`${TEAL}18`} stroke={TEAL} strokeWidth="0.8" opacity={0.4}
                initial={{ scaleY: 0 }} animate={{ scaleY: 1 }}
                transition={{ duration: 0.5, delay: i * 0.15 + 0.5 }}
                style={{ transformOrigin: `70px ${cy + 9}px` }} />
            )}
          </motion.g>
        ))}

        {/* Nerve lines branching out */}
        <motion.path d="M56 46 C40 50, 25 58, 18 70" stroke={AMBER_LIGHT} strokeWidth="1" strokeLinecap="round" fill="none" opacity={0.3}
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, delay: 1.5 }} />
        <motion.path d="M84 46 C100 50, 115 58, 122 70" stroke={AMBER_LIGHT} strokeWidth="1" strokeLinecap="round" fill="none" opacity={0.3}
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, delay: 1.7 }} />
        <motion.path d="M54 94 C38 100, 22 112, 15 128" stroke={AMBER_LIGHT} strokeWidth="1" strokeLinecap="round" fill="none" opacity={0.3}
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, delay: 1.9 }} />
        <motion.path d="M86 94 C102 100, 118 112, 125 128" stroke={AMBER_LIGHT} strokeWidth="1" strokeLinecap="round" fill="none" opacity={0.3}
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, delay: 2.1 }} />

        {/* Healing energy pulse traveling down spine */}
        <motion.circle cx="70" cy="22" r="5" fill={AMBER_LIGHT} opacity={0.6}
          animate={{ cy: [22, 166, 22], opacity: [0.7, 0.3, 0.7], scale: [1.2, 0.8, 1.2] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} />

        {/* Central glow dot */}
        <motion.circle cx="70" cy="94" r="6" fill={`${AMBER}44`}
          animate={{ r: [5, 8, 5], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 2.5, repeat: Infinity }} />
        <motion.circle cx="70" cy="94" r="3" fill={AMBER_LIGHT}
          animate={{ opacity: [0.5, 1, 0.5], scale: [0.8, 1.3, 0.8] }}
          transition={{ duration: 2, repeat: Infinity }} />

        {/* Sparkle accents */}
        <motion.circle cx="125" cy="35" r="3" fill={TEAL_LIGHT}
          animate={{ opacity: [0.2, 1, 0.2], scale: [0.7, 1.3, 0.7] }}
          transition={{ duration: 2.5, repeat: Infinity }} />
        <motion.circle cx="15" cy="55" r="2" fill={AMBER_LIGHT}
          animate={{ opacity: [0.1, 0.8, 0.1], scale: [0.5, 1.2, 0.5] }}
          transition={{ duration: 3, repeat: Infinity, delay: 0.8 }} />
        <motion.circle cx="130" cy="140" r="2.5" fill={TEAL_LIGHT}
          animate={{ opacity: [0.15, 0.7, 0.15] }}
          transition={{ duration: 2, repeat: Infinity, delay: 1.2 }} />
        <motion.circle cx="12" cy="175" r="2" fill={AMBER_LIGHT}
          animate={{ opacity: [0.1, 0.6, 0.1] }}
          transition={{ duration: 2.5, repeat: Infinity, delay: 0.4 }} />

        {/* Small plus/cross medical symbol */}
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5 }}>
          <rect x="112" y="190" width="14" height="3.5" rx="1.75" fill={TEAL_LIGHT} opacity={0.4} />
          <rect x="117.25" y="184.75" width="3.5" height="14" rx="1.75" fill={TEAL_LIGHT} opacity={0.4} />
        </motion.g>
      </svg>
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
function SectionReveal({ children, className = "", id }: { children: React.ReactNode; className?: string; id?: string }) {
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
    <div className={`rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] ${className}`}>
      {children}
    </div>
  );
}

/* ───────────────────────── MAGNETIC BUTTON ───────────────────────── */
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

/* ───────────────────────── SHIMMER BORDER ───────────────────────── */
function ShimmerBorder({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative rounded-2xl p-[1px] overflow-hidden ${className}`}>
      <motion.div
        className="absolute inset-0 rounded-2xl"
        style={{ background: `conic-gradient(from 0deg, transparent, ${TEAL}, transparent, ${AMBER}, transparent)`, willChange: "transform" }}
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      />
      <div className="relative rounded-2xl z-10" style={{ background: BG }}>{children}</div>
    </div>
  );
}

/* ───────────────────────── ACCORDION ITEM ───────────────────────── */
function AccordionItem({ title, description, icon: Icon, isOpen, onToggle }: { title: string; description: string; icon: React.ElementType; isOpen: boolean; onToggle: () => void }) {
  return (
    <GlassCard className="overflow-hidden">
      <button onClick={onToggle} className="w-full flex items-center justify-between p-5 md:p-6 text-left group cursor-pointer">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: TEAL_GLOW }}>
            <Icon size={20} weight="duotone" style={{ color: TEAL_LIGHT }} />
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

/* ───────────────────────── SERVICES DATA ───────────────────────── */
const services = [
  { title: "Spinal Adjustments", description: "Precise, gentle spinal adjustments to restore proper alignment. Our doctors use both manual and instrument-assisted techniques tailored to your comfort level and condition.", icon: Bone },
  { title: "Sports Rehabilitation", description: "Comprehensive sports rehab programs combining chiropractic care with corrective exercises. Get back in the game stronger with injury recovery and performance optimization.", icon: Barbell },
  { title: "Prenatal Chiropractic", description: "Specialized prenatal adjustments using the Webster technique to support comfortable pregnancies. Safe, gentle care for expecting mothers throughout every trimester.", icon: Baby },
  { title: "Pediatric Care", description: "Gentle, age-appropriate chiropractic care for children. From newborns to teens, we address growing pains, posture issues, and sports injuries with kid-friendly techniques.", icon: Heart },
  { title: "Massage Therapy", description: "Therapeutic massage integrated with chiropractic adjustments for complete muscle and joint relief. Deep tissue, trigger point, and myofascial release techniques available.", icon: HandPalm },
  { title: "Digital X-Rays", description: "State-of-the-art digital imaging for precise diagnosis. Low radiation digital X-rays help us see exactly what is happening with your spine and create targeted treatment plans.", icon: Scan },
];

/* ───────────────────────── PROCESS DATA ───────────────────────── */
const processSteps = [
  { step: "01", title: "Consultation", description: "In-depth discussion about your health history, goals, and current concerns. We listen first.", icon: Stethoscope },
  { step: "02", title: "Examination", description: "Comprehensive physical exam including posture analysis, range of motion tests, and digital X-rays if needed.", icon: Scan },
  { step: "03", title: "Treatment", description: "Personalized treatment plan with gentle adjustments, therapeutic exercises, and lifestyle recommendations.", icon: FirstAidKit },
  { step: "04", title: "Maintenance", description: "Ongoing wellness care to maintain alignment, prevent future issues, and optimize your overall health.", icon: ShieldCheck },
];

/* ───────────────────────── CONDITIONS DATA ───────────────────────── */
const conditions = [
  "Back Pain", "Neck Pain", "Headaches & Migraines", "Sciatica",
  "Herniated Discs", "Whiplash", "Scoliosis", "Carpal Tunnel",
  "Shoulder Pain", "Hip Pain", "Sports Injuries", "Fibromyalgia",
  "TMJ Disorders", "Pregnancy Discomfort", "Arthritis", "Pinched Nerves",
];

/* ───────────────────────── TESTIMONIALS ───────────────────────── */
const testimonials = [
  { name: "Michael R.", text: "After years of chronic back pain, I finally found relief. The team here is incredible and truly cares about getting to the root cause, not just masking symptoms.", rating: 5 },
  { name: "Jennifer K.", text: "The prenatal chiropractic care made such a difference during my pregnancy. I had less discomfort and my delivery was smoother than my first. Highly recommend.", rating: 5 },
  { name: "Carlos M.", text: "As an athlete, I need my body in peak condition. The sports rehab program here got me back to competing faster than I expected. Top-notch care.", rating: 5 },
];

/* ───────────────────────── FAQ DATA ───────────────────────── */
const faqs = [
  { q: "Is chiropractic care safe?", a: "Yes. Chiropractic care is widely recognized as one of the safest, drug-free, non-invasive therapies available. Our doctors are extensively trained and use gentle techniques appropriate for each patient." },
  { q: "Do I need a referral?", a: "No referral is needed. You can schedule directly with us. We accept most insurance plans and offer affordable self-pay options for those without coverage." },
  { q: "How many visits will I need?", a: "Treatment plans vary by condition. Some patients feel relief after just one visit, while chronic conditions may require a series of treatments. We will create a personalized plan during your first visit." },
  { q: "Does the adjustment hurt?", a: "Most patients feel immediate relief after an adjustment. You may hear a popping sound, which is simply gas releasing from the joint. Our doctors use gentle techniques and always work within your comfort zone." },
  { q: "Do you treat children?", a: "Absolutely. We provide gentle, age-appropriate chiropractic care for children of all ages. Pediatric adjustments use very light pressure and are safe and effective." },
];

/* ───────────────────────── INSURANCE DATA ───────────────────────── */
const insuranceProviders = [
  "Blue Cross Blue Shield", "Aetna", "UnitedHealthcare", "Cigna",
  "Humana", "Medicare", "Kaiser Permanente", "Tricare",
];

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════ */
export default function V2ChiropracticPage() {
  const [openService, setOpenService] = useState<number | null>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden" style={{ background: BG, color: "#f1f5f9" }}>
      <FloatingHealingOrbs />

      {/* ─── NAV ─── */}
      <motion.nav initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-4">
          <GlassCard className="flex items-center justify-between px-4 md:px-6 py-3">
            <div className="flex items-center gap-2">
              <Bone size={24} weight="duotone" style={{ color: TEAL_LIGHT }} />
              <span className="text-lg font-bold tracking-tight text-white">Align Chiropractic</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
              <a href="#services" className="hover:text-white transition-colors">Services</a>
              <a href="#about" className="hover:text-white transition-colors">About</a>
              <a href="#process" className="hover:text-white transition-colors">Process</a>
              <a href="#testimonials" className="hover:text-white transition-colors">Reviews</a>
              <a href="#contact" className="hover:text-white transition-colors">Contact</a>
            </div>
            <div className="flex items-center gap-3">
              <MagneticButton className="px-4 md:px-5 py-2 rounded-full text-sm font-semibold text-white transition-colors" style={{ background: TEAL } as React.CSSProperties}>
                Book Now
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
                  {[{ label: "Services", href: "#services" }, { label: "About", href: "#about" }, { label: "Process", href: "#process" }, { label: "Reviews", href: "#testimonials" }, { label: "Contact", href: "#contact" }].map((link) => (
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

      {/* ─── HERO ─── */}
      <section className="relative min-h-[100dvh] flex items-center pt-24 z-10">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20" style={{ background: `radial-gradient(circle, ${TEAL} 0%, transparent 70%)`, filter: "blur(80px)" }} />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-15" style={{ background: `radial-gradient(circle, ${AMBER} 0%, transparent 70%)`, filter: "blur(60px)" }} />
        </div>

        <div className="mx-auto max-w-7xl px-4 md:px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-4 items-center">
          <div className="space-y-8">
            <div>
              <motion.p initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ ...spring, delay: 0.1 }} className="text-sm uppercase tracking-widest mb-4" style={{ color: AMBER }}>
                Natural Healing &bull; Total Alignment
              </motion.p>
              <h1 className="text-3xl md:text-6xl tracking-tighter leading-none font-bold text-white" style={{ textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>
                <WordReveal text="Align Your Body, Transform Your Life" />
              </h1>
            </div>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.6 }} className="text-lg text-slate-400 max-w-md leading-relaxed">
              Expert chiropractic care that goes beyond symptom relief. We restore your body&apos;s natural alignment so you can live pain-free and move with confidence.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.8 }} className="flex flex-wrap gap-4">
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white flex items-center gap-2 cursor-pointer" style={{ background: TEAL } as React.CSSProperties}>
                Schedule Consultation <ArrowRight size={18} weight="bold" />
              </MagneticButton>
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/10 flex items-center gap-2 cursor-pointer">
                <Phone size={18} weight="duotone" /> (555) 741-2963
              </MagneticButton>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ ...spring, delay: 1 }} className="flex flex-wrap gap-6 text-sm text-slate-400">
              <span className="flex items-center gap-2"><MapPin size={16} weight="duotone" style={{ color: TEAL_LIGHT }} />456 Wellness Blvd, Suite 100</span>
              <span className="flex items-center gap-2"><Clock size={16} weight="duotone" style={{ color: TEAL_LIGHT }} />Mon-Sat 8am-7pm</span>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ ...spring, delay: 0.3 }} className="hidden md:flex items-center justify-center lg:justify-end">
            <SpineSVG />
          </motion.div>
        </div>
      </section>

      {/* ─── STATS ─── */}
      <SectionReveal className="relative z-10 pb-8">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <GlassCard className="p-6 md:p-8">
            <motion.div className="grid grid-cols-2 sm:grid-cols-4 gap-6 md:gap-8" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
              {[
                { value: "15+", label: "Years Experience", icon: Star },
                { value: "12,000+", label: "Patients Treated", icon: Users },
                { value: "4.9", label: "Google Rating", icon: Star },
                { value: "98%", label: "Patient Satisfaction", icon: Heart },
              ].map((stat, i) => (
                <motion.div key={i} variants={fadeUp} className="text-center">
                  <stat.icon size={24} weight="duotone" style={{ color: AMBER }} className="mx-auto mb-2" />
                  <div className="text-2xl md:text-3xl font-bold text-white">{stat.value}</div>
                  <div className="text-xs text-slate-400 mt-1">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </GlassCard>
        </div>
      </SectionReveal>

      {/* ─── SERVICES ─── */}
      <SectionReveal id="services" className="relative z-10 py-16 md:py-24">
        {/* Background pattern */}
        <div className="absolute inset-0 pointer-events-none opacity-5">
          <svg width="100%" height="100%"><pattern id="chiro-grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke={TEAL_LIGHT} strokeWidth="0.5" /></pattern><rect width="100%" height="100%" fill="url(#chiro-grid)" /></svg>
        </div>
        <div className="mx-auto max-w-7xl px-4 md:px-6 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            <div className="lg:sticky lg:top-32">
              <p className="text-sm uppercase tracking-widest mb-3" style={{ color: AMBER }}>What We Offer</p>
              <h2 className="text-3xl md:text-6xl tracking-tighter leading-none font-bold text-white mb-6">
                <WordReveal text="Comprehensive Chiropractic Services" />
              </h2>
              <p className="text-slate-400 leading-relaxed max-w-md">
                From spinal adjustments to sports rehabilitation, every treatment is personalized to your body&apos;s unique needs. Click any service to learn more.
              </p>
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
      <SectionReveal id="about" className="relative z-10 py-16 md:py-24">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10" style={{ background: `radial-gradient(circle, ${AMBER} 0%, transparent 70%)`, filter: "blur(80px)" }} />
        </div>
        <div className="mx-auto max-w-7xl px-4 md:px-6 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative rounded-2xl overflow-hidden aspect-[4/3]">
              <img src="https://images.unsplash.com/photo-1519824145371-296894a0daa9?w=800&q=80" alt="Chiropractic office" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <GlassCard className="px-4 py-3 inline-flex items-center gap-3">
                  <Heartbeat size={20} weight="duotone" style={{ color: TEAL_LIGHT }} />
                  <span className="text-sm text-white font-medium">Serving the community since 2009</span>
                </GlassCard>
              </div>
            </div>
            <div>
              <p className="text-sm uppercase tracking-widest mb-3" style={{ color: AMBER }}>About Our Practice</p>
              <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white mb-6">
                <WordReveal text="Healing Through Alignment" />
              </h2>
              <div className="space-y-4 text-slate-400 leading-relaxed">
                <p>At Align Chiropractic, we believe true health starts with proper spinal alignment. Our team of experienced doctors of chiropractic combines time-tested techniques with modern technology to deliver care that addresses the root cause of your discomfort.</p>
                <p>We take a whole-body approach, considering how your spine affects your nervous system, mobility, and overall quality of life. Whether you are recovering from an injury or seeking preventive wellness care, we create personalized treatment plans that get real results.</p>
              </div>
              <div className="mt-8 grid grid-cols-2 gap-4">
                {[
                  { icon: Person, label: "Board Certified Doctors" },
                  { icon: Brain, label: "Advanced Techniques" },
                  { icon: Lightning, label: "Same-Day Relief" },
                  { icon: ShieldCheck, label: "Insurance Accepted" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: TEAL_GLOW }}>
                      <item.icon size={16} weight="duotone" style={{ color: TEAL_LIGHT }} />
                    </div>
                    <span className="text-sm text-slate-300">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* ─── PROCESS ─── */}
      <SectionReveal id="process" className="relative z-10 py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-10">
          <svg width="100%" height="100%"><pattern id="chiro-dots" width="30" height="30" patternUnits="userSpaceOnUse"><circle cx="15" cy="15" r="1" fill={TEAL_LIGHT} /></pattern><rect width="100%" height="100%" fill="url(#chiro-dots)" /></svg>
        </div>
        <div className="mx-auto max-w-7xl px-4 md:px-6 relative">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: AMBER }}>How It Works</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Your Path to Wellness" />
            </h2>
          </div>
          <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {processSteps.map((step, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="p-6 h-full relative overflow-hidden">
                  <div className="absolute top-4 right-4 text-5xl font-black opacity-5 text-white">{step.step}</div>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: i % 2 === 0 ? TEAL_GLOW : AMBER_GLOW }}>
                    <step.icon size={24} weight="duotone" style={{ color: i % 2 === 0 ? TEAL_LIGHT : AMBER_LIGHT }} />
                  </div>
                  <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: AMBER }}>{step.step}</div>
                  <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{step.description}</p>
                  {i < processSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-6 z-10">
                      <ArrowRight size={20} style={{ color: TEAL_LIGHT }} className="opacity-40" />
                    </div>
                  )}
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── TESTIMONIALS ─── */}
      <SectionReveal id="testimonials" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: AMBER }}>Patient Stories</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Real Results, Real Relief" />
            </h2>
          </div>
          <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {testimonials.map((t, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="p-6 h-full flex flex-col">
                  <Quotes size={28} weight="fill" style={{ color: TEAL_LIGHT }} className="mb-3 opacity-50" />
                  <p className="text-slate-300 leading-relaxed flex-1 text-sm">{t.text}</p>
                  <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                    <span className="text-sm font-semibold text-white">{t.name}</span>
                    <div className="flex gap-0.5">
                      {Array.from({ length: t.rating }).map((_, j) => (
                        <Star key={j} size={12} weight="fill" style={{ color: AMBER }} />
                      ))}
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── CONDITIONS TREATED ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 left-1/4 w-96 h-96 rounded-full opacity-10" style={{ background: `radial-gradient(circle, ${TEAL} 0%, transparent 70%)`, filter: "blur(80px)" }} />
        </div>
        <div className="mx-auto max-w-7xl px-4 md:px-6 relative">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: AMBER }}>We Can Help</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Conditions We Treat" />
            </h2>
          </div>
          <motion.div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {conditions.map((condition, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="p-4 flex items-center gap-3">
                  <CheckCircle size={18} weight="duotone" style={{ color: TEAL_LIGHT }} className="shrink-0" />
                  <span className="text-sm text-slate-300">{condition}</span>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── FAQ ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: AMBER }}>Common Questions</p>
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

      {/* ─── CONTACT WITH FORM ─── */}
      <SectionReveal id="contact" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <p className="text-sm uppercase tracking-widest mb-3" style={{ color: AMBER }}>Get Started</p>
              <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white mb-6">
                <WordReveal text="Ready to Feel Better?" />
              </h2>
              <p className="text-slate-400 leading-relaxed max-w-md mb-8">
                Book your first consultation and start your journey to better alignment, less pain, and a healthier life. New patients are always welcome.
              </p>
              <div className="space-y-4">
                {[
                  { icon: MapPin, label: "Location", value: "456 Wellness Blvd, Suite 100\nAustin, TX 78701" },
                  { icon: Phone, label: "Phone", value: "(555) 741-2963" },
                  { icon: Clock, label: "Hours", value: "Mon-Fri 8am-7pm\nSaturday 9am-3pm\nSunday Closed" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <item.icon size={20} weight="duotone" style={{ color: TEAL_LIGHT }} className="mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-white">{item.label}</p>
                      <p className="text-sm text-slate-400 whitespace-pre-line">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <GlassCard className="p-6 md:p-8">
              <h3 className="text-xl font-semibold text-white mb-6">Request an Appointment</h3>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input type="text" placeholder="First Name" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-teal-500/50" />
                  <input type="text" placeholder="Last Name" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-teal-500/50" />
                </div>
                <input type="email" placeholder="Email Address" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-teal-500/50" />
                <input type="tel" placeholder="Phone Number" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-teal-500/50" />
                <select className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-500 text-sm focus:outline-none focus:border-teal-500/50">
                  <option value="">Select Service</option>
                  {services.map((s, i) => (<option key={i} value={s.title}>{s.title}</option>))}
                </select>
                <textarea placeholder="Describe your condition or concerns..." rows={4} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-teal-500/50 resize-none" />
                <MagneticButton className="w-full py-3 rounded-xl text-sm font-semibold text-white cursor-pointer" style={{ background: TEAL } as React.CSSProperties}>
                  <span className="flex items-center justify-center gap-2"><CalendarCheck size={18} weight="duotone" /> Request Appointment</span>
                </MagneticButton>
              </form>
            </GlassCard>
          </div>
        </div>
      </SectionReveal>

      {/* ─── INSURANCE ACCEPTED ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: AMBER }}>Coverage</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Insurance We Accept" />
            </h2>
          </div>
          <ShimmerBorder>
            <div className="p-8 md:p-12">
              <motion.div className="grid grid-cols-2 sm:grid-cols-4 gap-4" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
                {insuranceProviders.map((provider, i) => (
                  <motion.div key={i} variants={fadeUp} className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white/5">
                    <ShieldCheck size={16} weight="duotone" style={{ color: TEAL_LIGHT }} />
                    <span className="text-sm text-slate-300">{provider}</span>
                  </motion.div>
                ))}
              </motion.div>
              <p className="text-center text-sm text-slate-500 mt-6">Do not see your provider? Contact us &mdash; we work with most insurance plans and offer flexible payment options.</p>
            </div>
          </ShimmerBorder>
        </div>
      </SectionReveal>

      {/* ─── FOOTER ─── */}
      <footer className="relative z-10 border-t border-white/5 py-8">
        <div className="mx-auto max-w-7xl px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Bone size={16} weight="duotone" style={{ color: TEAL_LIGHT }} />
            <span>Align Chiropractic &copy; {new Date().getFullYear()}</span>
          </div>
          <p className="text-xs text-slate-600">Website created by Bluejay Business Solutions</p>
        </div>
      </footer>
    </main>
  );
}
