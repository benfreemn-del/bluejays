"use client";

/* eslint-disable @next/next/no-img-element -- These static marketing and preview components intentionally use plain img tags to preserve existing markup and visual behavior during lint-only cleanup. */
/* eslint-disable react-hooks/purity -- Decorative particle values are intentionally randomized for static visual effects in these marketing pages and previews; this preserves existing appearance without changing business logic. */

import { useState, useRef, useCallback } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useInView,
  AnimatePresence,
} from "framer-motion";
import {
  Heart,
  Baby,
  Star,
  ShieldCheck,
  GraduationCap,
  SunHorizon,
  Users,
  Phone,
  MapPin,
  Clock,
  ArrowRight,
  CaretDown,
  Quotes,
  CalendarCheck,
  PaintBrush,
  MusicNotes,
  Tree,
  BookOpen,
  Certificate,
  CheckCircle,
  Camera,
  X,
  List,
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
const BG = "#faf9ff";
const PURPLE = "#7c3aed";
const PURPLE_LIGHT = "#a78bfa";
const YELLOW = "#eab308";
const YELLOW_LIGHT = "#facc15";
const PURPLE_GLOW = "rgba(124, 58, 237, 0.15)";
const YELLOW_GLOW = "rgba(234, 179, 8, 0.12)";

/* ───────────────────────── FLOATING STARS ───────────────────────── */
function FloatingStars() {
  const particles = Array.from({ length: 22 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 8,
    duration: 7 + Math.random() * 6,
    size: 3 + Math.random() * 4,
    opacity: 0.15 + Math.random() * 0.3,
    color: i % 3 === 0 ? YELLOW_LIGHT : PURPLE_LIGHT,
  }));
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden hidden md:block">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute"
          style={{ left: `${p.x}%`, width: p.size, height: p.size, willChange: "transform, opacity" }}
          animate={{ y: ["-10vh", "110vh"], opacity: [0, p.opacity, p.opacity, 0], rotate: [0, 360] }}
          transition={{
            y: { duration: p.duration, repeat: Infinity, delay: p.delay, ease: "linear" },
            opacity: { duration: p.duration, repeat: Infinity, delay: p.delay, times: [0, 0.1, 0.9, 1] },
            rotate: { duration: p.duration * 2, repeat: Infinity, ease: "linear" },
          }}
        >
          <Star size={p.size * 3} weight="fill" style={{ color: p.color }} />
        </motion.div>
      ))}
    </div>
  );
}

/* ───────────────────────── SUNSHINE SVG ───────────────────────── */
function SunshineSVG() {
  return (
    <div className="relative flex items-center justify-center">
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{ background: `radial-gradient(circle, ${YELLOW_GLOW} 0%, transparent 70%)`, filter: "blur(40px)" }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      <svg viewBox="0 0 200 220" className="relative z-10 w-48 h-56 md:w-56 md:h-72" fill="none">
        {/* Outer glow rings */}
        <motion.circle cx="100" cy="100" r="92" stroke={YELLOW} strokeWidth="0.5" opacity={0.12}
          animate={{ r: [90, 94, 90] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} />
        <motion.circle cx="100" cy="100" r="82" stroke={PURPLE} strokeWidth="0.3" opacity={0.08}
          animate={{ r: [80, 84, 80] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }} />

        {/* Sun rays */}
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, i) => (
          <motion.line key={i}
            x1={100 + 45 * Math.cos((angle * Math.PI) / 180)} y1={100 + 45 * Math.sin((angle * Math.PI) / 180)}
            x2={100 + 75 * Math.cos((angle * Math.PI) / 180)} y2={100 + 75 * Math.sin((angle * Math.PI) / 180)}
            stroke={YELLOW} strokeWidth="3" strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.1, ease: "easeInOut" }} />
        ))}
        {/* Shorter inner rays */}
        {[15, 45, 75, 105, 135, 165, 195, 225, 255, 285, 315, 345].map((angle, i) => (
          <motion.line key={`s${i}`}
            x1={100 + 42 * Math.cos((angle * Math.PI) / 180)} y1={100 + 42 * Math.sin((angle * Math.PI) / 180)}
            x2={100 + 58 * Math.cos((angle * Math.PI) / 180)} y2={100 + 58 * Math.sin((angle * Math.PI) / 180)}
            stroke={YELLOW_LIGHT} strokeWidth="2" strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: [0.2, 0.6, 0.2] }}
            transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.12 + 0.5, ease: "easeInOut" }} />
        ))}

        {/* Sun face circle */}
        <motion.circle cx="100" cy="100" r="38" fill={`${YELLOW}22`} stroke={YELLOW} strokeWidth="2.5"
          initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "backOut" }} />
        {/* Inner highlight */}
        <circle cx="100" cy="95" r="25" fill={`${YELLOW}0d`} />

        {/* Happy face - eyes */}
        <motion.circle cx="87" cy="93" r="4" fill={`${PURPLE}88`}
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ duration: 0.3, delay: 1.2 }} />
        <motion.circle cx="113" cy="93" r="4" fill={`${PURPLE}88`}
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ duration: 0.3, delay: 1.3 }} />
        {/* Eye sparkles */}
        <circle cx="89" cy="91" r="1.5" fill="white" opacity="0.6" />
        <circle cx="115" cy="91" r="1.5" fill="white" opacity="0.6" />

        {/* Happy smile */}
        <motion.path d="M85 105 Q100 118 115 105" stroke={`${PURPLE}88`} strokeWidth="2.5" strokeLinecap="round" fill="none"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 0.6, delay: 1.5 }} />

        {/* Rosy cheeks */}
        <motion.circle cx="80" cy="105" r="5" fill={`#ec489933`}
          initial={{ opacity: 0 }} animate={{ opacity: [0, 0.6, 0.4] }}
          transition={{ duration: 1, delay: 1.8 }} />
        <motion.circle cx="120" cy="105" r="5" fill={`#ec489933`}
          initial={{ opacity: 0 }} animate={{ opacity: [0, 0.6, 0.4] }}
          transition={{ duration: 1, delay: 1.9 }} />

        {/* Building blocks at bottom */}
        <motion.rect x="55" y="175" width="25" height="25" rx="4" fill={`${PURPLE}22`} stroke={PURPLE} strokeWidth="1.5"
          initial={{ y: 210, opacity: 0 }} animate={{ y: 175, opacity: 1 }}
          transition={{ duration: 0.5, delay: 2, ease: "backOut" }} />
        <rect x="60" y="178" width="15" height="15" rx="2" fill={`${PURPLE}0d`} />

        <motion.rect x="85" y="170" width="30" height="30" rx="4" fill={`${YELLOW}22`} stroke={YELLOW} strokeWidth="1.5"
          initial={{ y: 210, opacity: 0 }} animate={{ y: 170, opacity: 1 }}
          transition={{ duration: 0.5, delay: 2.2, ease: "backOut" }} />
        <rect x="91" y="174" width="18" height="18" rx="2" fill={`${YELLOW}0d`} />

        <motion.rect x="120" y="175" width="25" height="25" rx="4" fill={`${PURPLE_LIGHT}22`} stroke={PURPLE_LIGHT} strokeWidth="1.5"
          initial={{ y: 210, opacity: 0 }} animate={{ y: 175, opacity: 1 }}
          transition={{ duration: 0.5, delay: 2.4, ease: "backOut" }} />
        <rect x="125" y="178" width="15" height="15" rx="2" fill={`${PURPLE_LIGHT}0d`} />

        {/* ABC letters on blocks */}
        <motion.text x="67" y="193" textAnchor="middle" fill={PURPLE} fontSize="12" fontWeight="bold"
          initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} transition={{ delay: 2.5 }}>A</motion.text>
        <motion.text x="100" y="191" textAnchor="middle" fill={YELLOW} fontSize="14" fontWeight="bold"
          initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} transition={{ delay: 2.6 }}>B</motion.text>
        <motion.text x="132" y="193" textAnchor="middle" fill={PURPLE_LIGHT} fontSize="12" fontWeight="bold"
          initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} transition={{ delay: 2.7 }}>C</motion.text>

        {/* Sparkle accents */}
        <motion.circle cx="165" cy="35" r="3" fill={YELLOW_LIGHT}
          animate={{ opacity: [0.2, 1, 0.2], scale: [0.7, 1.3, 0.7] }}
          transition={{ duration: 2.5, repeat: Infinity }} />
        <motion.circle cx="30" cy="55" r="2" fill={PURPLE_LIGHT}
          animate={{ opacity: [0.1, 0.8, 0.1], scale: [0.5, 1.2, 0.5] }}
          transition={{ duration: 3, repeat: Infinity, delay: 0.8 }} />
        <motion.circle cx="175" cy="120" r="2.5" fill={YELLOW_LIGHT}
          animate={{ opacity: [0.15, 0.7, 0.15] }}
          transition={{ duration: 2, repeat: Infinity, delay: 1.2 }} />
        <motion.circle cx="25" cy="140" r="2" fill={PURPLE_LIGHT}
          animate={{ opacity: [0.1, 0.6, 0.1] }}
          transition={{ duration: 2.5, repeat: Infinity, delay: 0.4 }} />
      </svg>
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
  return <div className={`rounded-2xl border border-gray-200 bg-white/70 backdrop-blur-xl shadow-sm ${className}`}>{children}</div>;
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
    x.set((e.clientX - rect.left - rect.width / 2) * 0.25);
    y.set((e.clientY - rect.top - rect.height / 2) * 0.25);
  }, [x, y]);
  const handleMouseLeave = useCallback(() => { x.set(0); y.set(0); }, [x, y]);
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
      <motion.div className="absolute inset-0 rounded-2xl" style={{ background: `conic-gradient(from 0deg, transparent, ${PURPLE}, transparent, ${YELLOW}, transparent)`, willChange: "transform" }} animate={{ rotate: [0, 360] }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} />
      <div className="relative rounded-2xl z-10" style={{ background: "#ffffff" }}>{children}</div>
    </div>
  );
}

/* ───────────────────────── DATA ───────────────────────── */
const programs = [
  { title: "Infant Care", description: "Gentle, nurturing care for babies 6 weeks to 12 months with low caregiver-to-child ratios, tummy time, sensory play, and developmental milestones tracking in a warm, safe environment.", icon: Baby },
  { title: "Toddler Program", description: "Engaging activities for 1-2 year olds that foster language development, motor skills, and social interaction through structured play, music, and early learning exploration.", icon: MusicNotes },
  { title: "Preschool", description: "Kindergarten-ready curriculum for ages 3-5 with literacy, math, science, and art. Our play-based approach builds critical thinking, creativity, and a lifelong love of learning.", icon: GraduationCap },
  { title: "After-School", description: "Safe, supervised after-school programs for K-5 students with homework help, STEM activities, outdoor play, and enrichment classes to keep kids engaged and growing.", icon: BookOpen },
  { title: "Summer Camp", description: "Adventure-filled summer programs with weekly themes, field trips, water play, arts and crafts, and nature exploration. Active days create lasting memories and friendships.", icon: SunHorizon },
  { title: "Drop-In Care", description: "Flexible hourly care when you need it. Perfect for errands, appointments, or date nights. Same safe environment and qualified staff, no long-term commitment required.", icon: Heart },
];

const stats = [
  { value: "200+", label: "Happy Families" },
  { value: "4.9", label: "Star Rating" },
  { value: "15+", label: "Years Open" },
  { value: "1:4", label: "Staff Ratio" },
];

const schedule = [
  { time: "7:00 AM", activity: "Arrival & Free Play", icon: Heart },
  { time: "8:30 AM", activity: "Circle Time & Morning Song", icon: MusicNotes },
  { time: "9:00 AM", activity: "Learning Centers", icon: BookOpen },
  { time: "10:00 AM", activity: "Outdoor Play & Nature Walk", icon: Tree },
  { time: "11:00 AM", activity: "Art & Creative Expression", icon: PaintBrush },
  { time: "12:00 PM", activity: "Lunch & Rest Time", icon: SunHorizon },
  { time: "2:00 PM", activity: "STEM & Discovery", icon: GraduationCap },
  { time: "3:30 PM", activity: "Snack & Story Time", icon: BookOpen },
  { time: "4:30 PM", activity: "Free Play & Pickup", icon: Heart },
];

const testimonials = [
  { name: "Sarah M.", text: "My daughter absolutely loves going here every day. The teachers are warm, patient, and truly passionate about early childhood education. I could not ask for a better place.", rating: 5 },
  { name: "David R.", text: "The daily photos and progress reports give us so much peace of mind. We can see our son thriving, learning new things every week. The curriculum is impressive.", rating: 5 },
  { name: "Michelle K.", text: "After trying three other daycares, we finally found our forever home here. The safety standards, the cleanliness, and the genuine love the staff shows every child is unmatched.", rating: 5 },
];

const certifications = [
  "State Licensed & Accredited",
  "CPR & First Aid Certified Staff",
  "Background-Checked Employees",
  "24/7 Security Cameras",
  "Peanut-Free & Allergy-Aware Kitchen",
  "Annual Health & Safety Inspections",
  "Fire & Emergency Drill Training",
  "NAEYC Standards Aligned",
];

const faqs = [
  { q: "What ages do you accept?", a: "We accept children from 6 weeks to 12 years old. Our infant, toddler, preschool, and school-age programs are designed for each developmental stage." },
  { q: "What are your hours of operation?", a: "We are open Monday through Friday, 6:30 AM to 6:30 PM. Early drop-off and extended care options are available for families who need flexibility." },
  { q: "How do you handle food allergies?", a: "We maintain a peanut-free facility and work closely with parents on individual allergy action plans. All staff are trained in allergy awareness and emergency response." },
  { q: "What is your sick child policy?", a: "Children must be fever-free for 24 hours without medication before returning. We follow CDC guidelines and have strict sanitation protocols to keep all children healthy." },
  { q: "Can I tour the facility before enrolling?", a: "Absolutely! We encourage all families to schedule a tour. You will meet our teachers, see our classrooms, and get a feel for our warm, welcoming environment." },
];

const galleryImages = [
  { src: "https://images.unsplash.com/photo-1587616211892-f743fcca64f9?w=600&q=80", alt: "Children painting in art class" },
  { src: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=600&q=80", alt: "Child playing outdoors" },
  { src: "https://images.unsplash.com/photo-1544776193-352d25ca82cd?w=600&q=80", alt: "Reading circle time" },
  { src: "https://images.unsplash.com/photo-1560969184-10fe8719e047?w=600&q=80", alt: "Playground fun" },
  { src: "https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=600&q=80", alt: "Creative arts and crafts" },
  { src: "https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=600&q=80", alt: "Learning and discovery" },
];

/* ═══════════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════════ */
export default function V2DaycarePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden" style={{ background: BG, color: "#1c1917" }}>
      <FloatingStars />

      {/* ─── NAV ─── */}
      <motion.nav initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-4">
          <GlassCard className="flex items-center justify-between px-4 md:px-6 py-3">
            <div className="flex items-center gap-2">
              <Heart size={24} weight="duotone" style={{ color: PURPLE }} />
              <span className="text-lg font-bold tracking-tight text-[#1c1917]">Sunshine Kids Academy</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm text-[#6b7280]">
              <a href="#programs" className="hover:text-[#1c1917] transition-colors">Programs</a>
              <a href="#schedule" className="hover:text-[#1c1917] transition-colors">Schedule</a>
              <a href="#gallery" className="hover:text-[#1c1917] transition-colors">Gallery</a>
              <a href="#testimonials" className="hover:text-[#1c1917] transition-colors">Reviews</a>
            </div>
            <div className="flex items-center gap-3">
              <MagneticButton className="px-4 md:px-5 py-2 rounded-full text-sm font-semibold text-[#1c1917] transition-colors" style={{ background: PURPLE }}>Enroll Now</MagneticButton>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-lg text-[#1c1917] hover:bg-gray-100 transition-colors">
                {mobileMenuOpen ? <X size={24} /> : <List size={24} />}
              </button>
            </div>
          </GlassCard>
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3, ease: "easeInOut" }} className="md:hidden mt-2 overflow-hidden">
                <GlassCard className="flex flex-col gap-1 px-4 py-4">
                  {[{ label: "Programs", href: "#programs" }, { label: "Schedule", href: "#schedule" }, { label: "Gallery", href: "#gallery" }, { label: "Reviews", href: "#testimonials" }].map((link) => (
                    <a key={link.label} href={link.href} onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-lg text-sm text-[#4b5563] hover:text-[#1c1917] hover:bg-gray-50 transition-colors">{link.label}</a>
                  ))}
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.nav>

      {/* ─── HERO ─── */}
      <section className="relative min-h-[100dvh] flex items-center pt-24 z-10">
        <div className="absolute inset-0 z-0">
          <img src="https://images.unsplash.com/photo-1600132806370-bf17e65e942f?w=1600&q=80" alt="" className="w-full h-full object-cover opacity-12" />
          <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, ${BG}, transparent 30%, ${BG})` }} />
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-4 items-center">
          <div className="space-y-8">
            <div>
              <motion.p initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ ...spring, delay: 0.1 }} className="text-sm uppercase tracking-widest mb-4" style={{ color: YELLOW }}>Where Learning Meets Love</motion.p>
              <h1 className="text-3xl md:text-6xl tracking-tighter leading-none font-bold text-[#1c1917]" style={{ textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>
                <WordReveal text="A Safe Place to Grow" />
              </h1>
            </div>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.6 }} className="text-lg text-[#6b7280] max-w-md leading-relaxed">
              Every child deserves a nurturing environment where they feel safe, loved, and inspired to learn. Our dedicated educators create magical moments of discovery every single day.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.8 }} className="flex flex-wrap gap-4">
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-[#1c1917] flex items-center gap-2 cursor-pointer" style={{ background: PURPLE }}>
                Schedule a Tour <ArrowRight size={18} weight="bold" />
              </MagneticButton>
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-[#1c1917] border border-gray-200 flex items-center gap-2 cursor-pointer">
                <Phone size={18} weight="duotone" /> (555) 321-7890
              </MagneticButton>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ ...spring, delay: 0.95 }} className="flex flex-wrap gap-3">
              <span className="px-4 py-2 rounded-full text-xs font-semibold text-[#1c1917] flex items-center gap-2" style={{ background: "white", border: `1px solid ${PURPLE}40` }}><ShieldCheck size={14} weight="duotone" style={{ color: PURPLE }} />State Licensed</span>
              <span className="px-4 py-2 rounded-full text-xs font-semibold text-[#1c1917] flex items-center gap-2" style={{ background: "white", border: `1px solid ${YELLOW}40` }}><Star size={14} weight="fill" style={{ color: YELLOW }} />4.9-Star Rated</span>
              <span className="px-4 py-2 rounded-full text-xs font-semibold text-[#1c1917] flex items-center gap-2" style={{ background: "white", border: `1px solid ${PURPLE}40` }}><CheckCircle size={14} weight="duotone" style={{ color: PURPLE }} />Free Tour + Trial Day</span>
              <span className="px-4 py-2 rounded-full text-xs font-semibold text-[#1c1917] flex items-center gap-2" style={{ background: "white", border: `1px solid ${YELLOW}40` }}><Heart size={14} weight="duotone" style={{ color: YELLOW }} />CPR Certified Staff</span>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ ...spring, delay: 1 }} className="flex flex-wrap gap-6 text-sm text-[#6b7280]">
              <span className="flex items-center gap-2"><MapPin size={16} weight="duotone" style={{ color: PURPLE }} />456 Sunshine Lane</span>
              <span className="flex items-center gap-2"><Clock size={16} weight="duotone" style={{ color: PURPLE }} />Mon-Fri 6:30am-6:30pm</span>
            </motion.div>
          </div>
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ ...spring, delay: 0.3 }} className="hidden md:flex items-center justify-center lg:justify-end">
            <SunshineSVG />
          </motion.div>
        </div>
      </section>

      {/* ─── STATS ─── */}
      <SectionReveal className="relative z-10 pb-8">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <GlassCard className="p-6 md:p-8">
            <motion.div className="grid grid-cols-2 sm:grid-cols-4 gap-6 md:gap-8" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
              {stats.map((s, i) => (
                <motion.div key={i} variants={fadeUp} className="text-center">
                  <p className="text-3xl md:text-4xl font-bold tracking-tight" style={{ color: PURPLE }}>{s.value}</p>
                  <p className="text-sm text-[#6b7280] mt-1">{s.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </GlassCard>
        </div>
      </SectionReveal>

      {/* ─── PROGRAMS ─── */}
      <SectionReveal id="programs" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: YELLOW }}>Our Programs</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-[#1c1917]">
              <WordReveal text="Programs for Every Age" />
            </h2>
          </div>
          <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {programs.map((prog, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="p-6 h-full">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: i % 2 === 0 ? PURPLE_GLOW : YELLOW_GLOW }}>
                    <prog.icon size={24} weight="duotone" style={{ color: i % 2 === 0 ? PURPLE : YELLOW }} />
                  </div>
                  <h3 className="text-lg font-semibold text-[#1c1917] mb-2">{prog.title}</h3>
                  <p className="text-sm text-[#6b7280] leading-relaxed">{prog.description}</p>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── ABOUT / PHILOSOPHY ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-8">
          <img src="https://images.unsplash.com/photo-1587351021355-a479a299d2f9?w=1600&q=80" alt="" className="w-full h-full object-cover" />
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: YELLOW }}>Our Philosophy</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-[#1c1917] mb-6">
              <WordReveal text="Play, Learn, and Thrive" />
            </h2>
            <p className="text-[#6b7280] leading-relaxed mb-4">
              At Sunshine Kids Academy, we believe every child is naturally curious, capable, and creative. Our play-based curriculum follows the latest research in early childhood development, blending structured learning with joyful exploration.
            </p>
            <p className="text-[#6b7280] leading-relaxed">
              Our warm, home-like classrooms are designed to feel safe and inspiring. Small group sizes ensure every child gets the individual attention they deserve, building confidence and social skills that last a lifetime.
            </p>
          </div>
          <motion.div className="grid grid-cols-2 gap-4" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
            {[
              { icon: Heart, label: "Nurturing Care", desc: "Love in every moment" },
              { icon: GraduationCap, label: "Play-Based Learning", desc: "Research-backed methods" },
              { icon: Users, label: "Small Groups", desc: "Individual attention" },
              { icon: Tree, label: "Outdoor Play", desc: "Nature exploration daily" },
            ].map((item, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="p-5 text-center">
                  <item.icon size={28} weight="duotone" style={{ color: i % 2 === 0 ? PURPLE : YELLOW }} className="mx-auto mb-2" />
                  <p className="text-sm font-semibold text-[#1c1917]">{item.label}</p>
                  <p className="text-xs text-[#6b7280] mt-1">{item.desc}</p>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── DAILY SCHEDULE ─── */}
      <SectionReveal id="schedule" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div className="lg:sticky lg:top-32">
              <p className="text-sm uppercase tracking-widest mb-3" style={{ color: YELLOW }}>A Day at Sunshine</p>
              <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-[#1c1917] mb-6">
                <WordReveal text="Sample Daily Schedule" />
              </h2>
              <p className="text-[#6b7280] leading-relaxed max-w-md">Every day is thoughtfully planned to balance learning, play, creativity, and rest. Our routine provides structure while allowing flexibility for each child&apos;s needs.</p>
            </div>
            <motion.div className="space-y-3" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
              {schedule.map((item, i) => (
                <motion.div key={i} variants={fadeUp}>
                  <GlassCard className="p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: i % 2 === 0 ? PURPLE_GLOW : YELLOW_GLOW }}>
                      <item.icon size={20} weight="duotone" style={{ color: i % 2 === 0 ? PURPLE : YELLOW }} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold" style={{ color: PURPLE_LIGHT }}>{item.time}</p>
                      <p className="text-sm font-semibold text-[#1c1917]">{item.activity}</p>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </SectionReveal>

      {/* ─── GOOGLE REVIEWS HEADER ─── */}
      <SectionReveal className="relative z-10 py-8">
        <div className="mx-auto max-w-4xl px-4 md:px-6">
          <div className="rounded-2xl bg-white border border-gray-200 shadow-sm px-6 py-5 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
            <div className="flex items-center gap-3">
              <svg width="32" height="32" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
              </svg>
              <div className="text-left">
                <p className="text-sm text-[#6b7280]">Google Reviews</p>
                <p className="text-lg font-bold text-[#1c1917]">Parents Love Us</p>
              </div>
            </div>
            <div className="hidden sm:block w-px h-12 bg-gray-200" />
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                {[0,1,2,3,4].map((i) => (<Star key={i} size={20} weight="fill" style={{ color: YELLOW }} />))}
              </div>
              <p className="text-sm text-[#6b7280]"><span className="text-[#1c1917] font-bold">4.9</span> out of 5 &bull; <span className="text-[#1c1917] font-bold">152</span> reviews</p>
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* ─── TESTIMONIALS ─── */}
      <SectionReveal id="testimonials" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: YELLOW }}>Parent Stories</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-[#1c1917]">
              <WordReveal text="Loved by Families" />
            </h2>
          </div>
          <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {testimonials.map((t, i) => (
              <motion.div key={i} variants={fadeUp}>
                <div className="p-6 h-full flex flex-col rounded-2xl bg-white border border-gray-200 shadow-sm relative overflow-hidden">
                  <Quotes size={60} weight="fill" style={{ color: PURPLE }} className="absolute -top-2 -right-2 opacity-10" />
                  <Quotes size={28} weight="fill" style={{ color: PURPLE }} className="mb-3 opacity-60" />
                  <p className="text-[#4b5563] leading-relaxed flex-1 text-sm">{t.text}</p>
                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-[#1c1917]">{t.name}</span>
                      <CheckCircle size={14} weight="fill" style={{ color: PURPLE }} />
                      <span className="text-[10px] text-[#6b7280] uppercase tracking-wider">Verified</span>
                    </div>
                    <div className="flex gap-0.5">{Array.from({ length: t.rating }).map((_, j) => (<Star key={j} size={18} weight="fill" style={{ color: YELLOW }} />))}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── AGE GROUP CARDS ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: YELLOW }}>Every Age, Every Stage</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-[#1c1917]"><WordReveal text="Programs for Every Age" /></h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { age: "Infants", range: "6 wks – 12 mo", ratio: "1:4 ratio", color: PURPLE, desc: "Gentle routines, snuggles, tummy time, and bottle schedules shared with parents via our daily app." },
              { age: "Toddlers", range: "13 – 24 mo", ratio: "1:6 ratio", color: YELLOW, desc: "Sensory play, early words, movement, and potty-training support when you are ready at home." },
              { age: "Preschool", range: "2 – 4 yrs", ratio: "1:10 ratio", color: PURPLE_LIGHT, desc: "Letters, numbers, art projects, and kindergarten prep through play-based learning." },
              { age: "Pre-K", range: "4 – 5 yrs", ratio: "1:12 ratio", color: YELLOW_LIGHT, desc: "Full kindergarten-readiness curriculum including reading, writing, math, and social skills." },
            ].map((age, i) => (
              <div key={i} className="p-6 h-full rounded-2xl bg-white border border-gray-200 shadow-sm">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: `${age.color}22` }}>
                  <Heart size={22} weight="duotone" style={{ color: age.color }} />
                </div>
                <h3 className="text-xl font-bold text-[#1c1917]">{age.age}</h3>
                <p className="text-xs font-semibold mt-1" style={{ color: age.color }}>{age.range} &bull; {age.ratio}</p>
                <p className="text-sm text-[#4b5563] mt-3 leading-relaxed">{age.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ─── TUITION PRICING ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: YELLOW }}>Transparent Tuition</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-[#1c1917]"><WordReveal text="Weekly Tuition & Schedules" /></h2>
            <p className="text-[#4b5563] mt-4 max-w-2xl mx-auto">All tuition includes meals, snacks, diapers, and supplies — no hidden fees.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "Part-Time", price: "$245", period: "/week", desc: "3 days per week for families with flexible schedules or stay-at-home parents.", features: ["3 days per week (M/W/F or T/Th + one)", "Meals + snacks included", "All supplies + diapers", "Parent app with photos + updates"], highlight: false },
              { name: "Full-Time", price: "$385", period: "/week", desc: "Our most popular plan — Mon-Fri, 6:30am-6:30pm. Meals, snacks, and everything included.", features: ["Monday – Friday", "Breakfast, lunch, 2 snacks", "All diapers + wipes + supplies", "Enrichment classes included", "Parent app + daily report"], highlight: true },
              { name: "Extended Day", price: "$445", period: "/week", desc: "For early-drop and late-pickup families — 6:00am to 7:30pm with extra enrichment.", features: ["Extended 6:00am – 7:30pm", "All meals + snacks", "Spanish + music + yoga", "Before/after K drop-off available", "Sibling discount 15%"], highlight: false },
            ].map((tier, i) => (
              <div key={i} className={`relative rounded-2xl ${tier.highlight ? 'p-[2px]' : 'border border-gray-200'}`} style={tier.highlight ? { background: `linear-gradient(135deg, ${PURPLE}, ${YELLOW})` } : {}}>
                {tier.highlight && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white" style={{ background: PURPLE }}>Most Popular</div>}
                <div className="rounded-2xl p-6 h-full bg-white shadow-sm">
                  <h3 className="text-xl font-bold text-[#1c1917]">{tier.name}</h3>
                  <p className="text-xs text-[#6b7280] mt-1">{tier.desc}</p>
                  <div className="mt-6 flex items-end gap-1">
                    <span className="text-5xl font-black text-[#1c1917]">{tier.price}</span>
                    <span className="text-sm text-[#6b7280] mb-2">{tier.period}</span>
                  </div>
                  <ul className="mt-6 space-y-3">
                    {tier.features.map((f, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-[#4b5563]">
                        <CheckCircle size={18} weight="fill" style={{ color: tier.highlight ? PURPLE : YELLOW }} className="shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <button className="mt-6 w-full px-6 py-3 rounded-full text-sm font-semibold" style={{ background: tier.highlight ? PURPLE : "white", color: tier.highlight ? "white" : "#1c1917", border: tier.highlight ? "none" : "1px solid #e5e7eb" }}>Schedule A Tour</button>
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-[#6b7280] mt-8">Military, teacher, and sibling discounts available. Dependent-care FSA eligible. State subsidies accepted.</p>
        </div>
      </SectionReveal>

      {/* ─── ENROLLMENT URGENCY ─── */}
      <SectionReveal className="relative z-10 py-8">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 rounded-2xl bg-white border border-gray-200 shadow-sm">
            <div className="relative shrink-0">
              <motion.div className="absolute inset-0 rounded-full" style={{ background: PURPLE }} animate={{ scale: [1, 1.6, 1], opacity: [0.5, 0, 0.5] }} transition={{ duration: 2, repeat: Infinity }} />
              <div className="relative w-4 h-4 rounded-full" style={{ background: PURPLE }} />
            </div>
            <div className="flex-1 text-center md:text-left">
              <p className="text-xs uppercase tracking-widest mb-1" style={{ color: PURPLE }}>Limited Enrollment</p>
              <h3 className="text-2xl md:text-3xl font-bold text-[#1c1917]">Fall Spots Filling — Tour This Week</h3>
              <p className="text-sm text-[#4b5563] mt-2">Our infant and toddler rooms have limited openings for fall. Schedule a tour and reserve your spot with a $200 deposit.</p>
            </div>
            <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white flex items-center gap-2 shrink-0 cursor-pointer" style={{ background: PURPLE }}>
              <CalendarCheck size={18} weight="duotone" /> Schedule Tour
            </MagneticButton>
          </div>
        </div>
      </SectionReveal>

      {/* ─── VIDEO PLACEHOLDER ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: YELLOW }}>Virtual Tour</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-[#1c1917]"><WordReveal text="Take A Tour From Home" /></h2>
          </div>
          <div className="relative rounded-2xl overflow-hidden aspect-video group cursor-pointer">
            <img src="https://images.unsplash.com/photo-1541976590-713941681591?w=1600&q=80" alt="Daycare classroom tour" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div className="w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center shadow-2xl" style={{ background: PURPLE }} animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
                <svg width="28" height="32" viewBox="0 0 24 28" fill="white" className="ml-1">
                  <path d="M0 0L24 14L0 28Z" />
                </svg>
              </motion.div>
            </div>
            <div className="absolute bottom-6 left-6 right-6">
              <p className="text-xs uppercase tracking-widest text-white">Full Facility Walkthrough &bull; 3:45</p>
              <p className="text-xl md:text-2xl font-bold text-white mt-1">Step into our classrooms, outdoor playground, and kitchen — see exactly where your child will spend their day.</p>
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* ─── AGE QUIZ ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="relative z-10 mx-auto max-w-5xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: YELLOW }}>Which Room?</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-[#1c1917]"><WordReveal text="Find Your Child's Classroom" /></h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { color: PURPLE, label: "Under 2", detail: "Infants and young toddlers — gentle routines, sleep schedules, and one-on-one bonds.", rec: "Infant or Toddler Room — 1:4 / 1:6", icon: Heart },
              { color: YELLOW, label: "2–3", detail: "Older toddlers — ready for structured play, early language, and friendships.", rec: "Young Preschool — 1:8", icon: PaintBrush },
              { color: PURPLE_LIGHT, label: "4–5", detail: "Preparing for kindergarten — letters, numbers, and social skills through hands-on learning.", rec: "Pre-K — 1:12 with enrichment", icon: Star },
            ].map((opt, i) => (
              <div key={i} className="p-6 h-full flex flex-col items-start relative overflow-hidden group cursor-pointer rounded-2xl bg-white border border-gray-200 shadow-sm">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: `radial-gradient(circle at 50% 0%, ${opt.color}22, transparent 60%)` }} />
                <div className="relative w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: `${opt.color}22` }}>
                  <opt.icon size={22} weight="duotone" style={{ color: opt.color }} />
                </div>
                <p className="relative text-xs uppercase tracking-widest font-bold" style={{ color: opt.color }}>Age {opt.label}</p>
                <p className="relative text-sm text-[#4b5563] mt-2 leading-relaxed flex-1">{opt.detail}</p>
                <div className="relative mt-6 pt-4 border-t border-gray-100 w-full">
                  <p className="text-[10px] uppercase tracking-widest text-[#6b7280] mb-1">Matched Room</p>
                  <p className="text-sm font-semibold text-[#1c1917]">{opt.rec}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ─── COMPARISON ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: YELLOW }}>The Difference</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-[#1c1917]"><WordReveal text="Us vs. Corporate Daycare Chains" /></h2>
          </div>
          <div className="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden">
            <div className="grid grid-cols-[1.5fr_1fr_1fr] items-center border-b border-gray-200">
              <div className="p-4 md:p-6 text-xs uppercase tracking-widest text-[#6b7280]">What Matters</div>
              <div className="p-4 md:p-6 text-center" style={{ background: `${PURPLE}10` }}>
                <p className="text-sm md:text-base font-bold" style={{ color: PURPLE }}>Our Center</p>
              </div>
              <div className="p-4 md:p-6 text-center">
                <p className="text-sm md:text-base font-semibold text-[#6b7280]">Big Chain Daycare</p>
              </div>
            </div>
            {[
              { feature: "Low teacher:child ratios", us: "Below state minimums", them: "State minimum" },
              { feature: "Owner on-site daily", us: "Yes", them: "Corporate director" },
              { feature: "All supplies + meals included", us: "Zero extras", them: "Add-on fees" },
              { feature: "Daily photos + updates app", us: "Every child", them: "Varies" },
              { feature: "Play-based kindergarten prep", us: "Yes", them: "Rote" },
              { feature: "CPR + early childhood certified", us: "All teachers", them: "Some" },
              { feature: "Family-owned for 15+ years", us: "Yes", them: "Corporate" },
            ].map((row, i) => (
              <div key={i} className="grid grid-cols-[1.5fr_1fr_1fr] items-center border-b border-gray-100 last:border-b-0">
                <div className="p-4 md:p-6 text-sm text-[#1c1917]">{row.feature}</div>
                <div className="p-4 md:p-6 text-center" style={{ background: `${PURPLE}08` }}>
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle size={18} weight="fill" style={{ color: PURPLE }} />
                    <span className="text-sm text-[#1c1917] font-semibold hidden sm:inline">{row.us}</span>
                  </div>
                </div>
                <div className="p-4 md:p-6 text-center text-sm text-[#6b7280] italic">{row.them}</div>
              </div>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ─── SERVICE AREA ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: YELLOW }}>Location &amp; Hours</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-[#1c1917]"><WordReveal text="Where We Are & When" /></h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="p-6 text-center rounded-2xl bg-white border border-gray-200 shadow-sm">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: PURPLE_GLOW }}>
                <MapPin size={26} weight="duotone" style={{ color: PURPLE }} />
              </div>
              <p className="text-xs uppercase tracking-widest mb-2" style={{ color: PURPLE }}>Location</p>
              <p className="text-xl font-black text-[#1c1917]">Sunshine Lane</p>
              <p className="text-sm text-[#6b7280] mt-2">Brand-new facility with secure entry, outdoor playground, and drop-off parking. Easy commute access.</p>
            </div>
            <div className="p-6 text-center rounded-2xl bg-white border border-gray-200 shadow-sm">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: YELLOW_GLOW }}>
                <Clock size={26} weight="duotone" style={{ color: YELLOW }} />
              </div>
              <p className="text-xs uppercase tracking-widest mb-2" style={{ color: YELLOW }}>Operating Hours</p>
              <p className="text-xl font-black text-[#1c1917]">6:30am – 6:30pm</p>
              <p className="text-sm text-[#6b7280] mt-2">Monday through Friday. Extended Day program extends 6:00am – 7:30pm. Closed major holidays.</p>
            </div>
            <div className="p-6 text-center rounded-2xl bg-white border border-gray-200 shadow-sm">
              <div className="relative w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: PURPLE_GLOW }}>
                <motion.div className="absolute inset-0 rounded-full" style={{ background: PURPLE }} animate={{ scale: [1, 1.6, 1], opacity: [0.4, 0, 0.4] }} transition={{ duration: 2, repeat: Infinity }} />
                <CheckCircle size={26} weight="duotone" style={{ color: PURPLE }} className="relative" />
              </div>
              <p className="text-xs uppercase tracking-widest mb-2" style={{ color: PURPLE }}>Enrollment</p>
              <p className="text-xl font-black text-[#1c1917]">Openings Soon</p>
              <p className="text-sm text-[#6b7280] mt-2">Infant room has 2 openings, Preschool has 4. Schedule a tour this week to claim your spot.</p>
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* ─── SAFETY & CERTIFICATIONS ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-sm uppercase tracking-widest mb-3" style={{ color: YELLOW }}>Safety First</p>
              <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-[#1c1917] mb-6">
                <WordReveal text="Safety & Certifications" />
              </h2>
              <p className="text-[#6b7280] leading-relaxed max-w-md">Your child&apos;s safety is our top priority. We exceed all state licensing requirements and maintain the highest standards of care, cleanliness, and security.</p>
            </div>
            <motion.div className="space-y-3" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
              {certifications.map((cert, i) => (
                <motion.div key={i} variants={fadeUp} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: PURPLE_GLOW }}>
                    {i < 3 ? <Certificate size={16} weight="duotone" style={{ color: PURPLE }} /> : <ShieldCheck size={16} weight="duotone" style={{ color: PURPLE }} />}
                  </div>
                  <span className="text-[#4b5563] text-sm">{cert}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </SectionReveal>

      {/* ─── FAQ ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: YELLOW }}>Common Questions</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-[#1c1917]">
              <WordReveal text="Frequently Asked Questions" />
            </h2>
          </div>
          <motion.div className="space-y-3" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {faqs.map((faq, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="overflow-hidden">
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-5 md:p-6 text-left cursor-pointer">
                    <span className="text-lg font-semibold text-[#1c1917] pr-4">{faq.q}</span>
                    <motion.div animate={{ rotate: openFaq === i ? 180 : 0 }} transition={spring}><CaretDown size={20} className="text-[#6b7280]" /></motion.div>
                  </button>
                  <AnimatePresence initial={false}>
                    {openFaq === i && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={spring} className="overflow-hidden">
                        <p className="px-5 pb-5 md:px-6 md:pb-6 text-[#6b7280] leading-relaxed">{faq.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── ENROLLMENT CTA ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4 md:px-6">
          <ShimmerBorder>
            <div className="p-8 md:p-12 text-center">
              <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={spring}>
                <p className="text-sm uppercase tracking-widest mb-3" style={{ color: YELLOW }}>Join Our Family</p>
                <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-[#1c1917] mb-4">Enrollment is Open</h2>
                <p className="text-[#6b7280] text-lg mb-8 max-w-lg mx-auto">Schedule a tour today and see why families choose Sunshine Kids Academy. Limited spots available for the current term.</p>
                <div className="flex flex-wrap justify-center gap-4">
                  <MagneticButton className="px-10 py-4 rounded-full text-base font-semibold text-[#1c1917] inline-flex items-center gap-2 cursor-pointer" style={{ background: PURPLE }}>
                    <CalendarCheck size={20} weight="duotone" /> Schedule Tour
                  </MagneticButton>
                  <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-[#1c1917] border border-gray-200 inline-flex items-center gap-2 cursor-pointer">
                    <Phone size={18} weight="duotone" /> Call Us
                  </MagneticButton>
                </div>
              </motion.div>
            </div>
          </ShimmerBorder>
        </div>
      </SectionReveal>

      {/* ─── VIRTUAL TOUR GALLERY ─── */}
      <SectionReveal id="gallery" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: YELLOW }}>Take a Peek</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-[#1c1917]">
              <WordReveal text="Virtual Tour Gallery" />
            </h2>
          </div>
          <motion.div className="grid grid-cols-2 md:grid-cols-3 gap-4" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {galleryImages.map((img, i) => (
              <motion.div key={i} variants={fadeUp} whileHover={{ scale: 1.03 }} transition={springFast} className="rounded-2xl overflow-hidden aspect-[4/3]">
                <img src={img.src} alt={img.alt} className="w-full h-full object-cover" />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── DAILY SCHEDULE SAMPLE ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: YELLOW }}>A Day With Us</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-[#1c1917]"><WordReveal text="Sample Daily Schedule" /></h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { time: "7:00 – 9:00 AM", label: "Arrival + Free Play", desc: "Warm greetings, sign-in, breakfast service, and open-ended play with friends." },
              { time: "9:00 – 10:30 AM", label: "Circle Time + Lesson", desc: "Age-appropriate learning: letters, numbers, songs, and the topic of the week." },
              { time: "10:30 – 11:30 AM", label: "Outdoor Play", desc: "Structured and open play on our secure playground with shaded areas and soft surfaces." },
              { time: "11:30 – 12:15 PM", label: "Lunch + Stories", desc: "Nutritious home-cooked meals served family-style with read-aloud story time." },
              { time: "12:30 – 2:30 PM", label: "Rest / Quiet Time", desc: "Cot nap for younger children; quiet activities + books for non-nappers." },
              { time: "2:30 – 6:00 PM", label: "Art, Music, Snack, Pickup", desc: "Crafts, music class, healthy snack, outdoor play, and happy handoffs at pickup." },
              { time: "Throughout The Day", label: "Parent App Updates", desc: "Real-time photos, video clips, meal tracking, naps, and diaper logs so you never miss a moment." },
              { time: "Weekly Enrichment", label: "Music, Spanish, Yoga", desc: "Specialty enrichment classes rotate weekly with dedicated instructors at no extra charge." },
              { time: "Monthly", label: "Parent-Teacher Check-Ins", desc: "Short 1-on-1 meetings about development, milestones, and home-to-school continuity." },
              { time: "Seasonal", label: "Family Events", desc: "Family picnics, holiday shows, parent-and-me classes, and graduation celebrations each season." },
            ].map((slot, i) => (
              <div key={i} className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm">
                <p className="text-xs font-bold" style={{ color: PURPLE }}>{slot.time}</p>
                <p className="text-lg font-bold text-[#1c1917] mt-1">{slot.label}</p>
                <p className="text-sm text-[#6b7280] mt-2 leading-relaxed">{slot.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ─── EXTENDED FAQ ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4 md:px-6">
          <div className="text-center mb-10">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: YELLOW }}>Parent FAQ</p>
            <h2 className="text-3xl md:text-4xl tracking-tighter font-bold text-[#1c1917]"><WordReveal text="Common Parent Questions" /></h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { q: "Are meals included?", a: "Yes — breakfast, lunch, and 2 snacks daily. Our in-house kitchen follows USDA guidelines and accommodates dietary needs." },
              { q: "Do you provide diapers + supplies?", a: "Absolutely — all diapers, wipes, formula (we partner with Enfamil + Similac), and daily supplies are included in tuition." },
              { q: "What is your sick policy?", a: "Fever over 100°F, contagious illness, or green nasal drainage requires a 24-hour symptom-free period before return." },
              { q: "How do pickups and security work?", a: "Only pre-authorized adults with ID can pick up. Secure keypad entry, interior cameras, and locked exterior doors." },
              { q: "Do you have outdoor play?", a: "Twice daily, weather permitting. Our fenced playground has separate infant + toddler zones plus a preschool area." },
              { q: "Can I visit anytime?", a: "Yes — parents always welcome to drop in, nurse, or observe. We have nothing to hide." },
              { q: "What if my child has allergies?", a: "Our kitchen handles dairy-free, nut-free, gluten-free, and custom meals. Every child's allergy plan is posted in the kitchen and in their classroom." },
              { q: "Do you offer part-time options?", a: "Yes — part-time 3 days/week and mornings-only schedules available for families transitioning to childcare." },
              { q: "Is the staff CPR + first aid certified?", a: "Every teacher is CPR + first aid certified, and we have a registered nurse on staff for medical questions." },
              { q: "How do you track daily activities?", a: "Every child gets a daily digital report via our parent app with photos, meals, naps, diapers, and developmental notes." },
              { q: "What is your curriculum?", a: "Play-based, emergent curriculum aligned with state early-learning standards. Kindergarten readiness assessed each quarter." },
              { q: "Do you work with special needs?", a: "Yes — we partner with local therapists (OT, PT, speech) who come on site during the day to minimize disruption." },
            ].map((faq, i) => (
              <div key={i} className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm">
                <p className="text-sm font-bold text-[#1c1917] mb-2">{faq.q}</p>
                <p className="text-sm text-[#6b7280] leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ─── FINAL CTA ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-4 md:px-6">
          <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-8 md:p-12 text-center">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: PURPLE }}>Start The Conversation</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-[#1c1917] mb-4">Schedule Your Free Tour</h2>
            <p className="text-[#4b5563] text-lg mb-8 max-w-lg mx-auto">Come see the space, meet the teachers, and watch our program in action. Tours take 30 minutes and you bring your child.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <MagneticButton className="px-10 py-4 rounded-full text-base font-semibold text-white inline-flex items-center gap-2 cursor-pointer" style={{ background: PURPLE }}>
                <CalendarCheck size={20} weight="duotone" /> Book Tour
              </MagneticButton>
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-[#1c1917] border border-gray-200 inline-flex items-center gap-2 cursor-pointer">
                <Phone size={18} weight="duotone" /> (555) 321-7890
              </MagneticButton>
            </div>
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              {[
                { label: "Teacher:Child Ratio", value: "1:6 avg" },
                { label: "Years In Business", value: "15+" },
                { label: "Happy Families", value: "340+" },
                { label: "Staff Certified", value: "100%" },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <p className="text-xs text-[#6b7280] uppercase tracking-widest">{stat.label}</p>
                  <p className="text-2xl font-black mt-1" style={{ color: PURPLE }}>{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* ─── FOOTER ─── */}
      <footer className="relative z-10 border-t border-gray-100 py-8">
        <div className="mx-auto max-w-7xl px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-[#9ca3af]">
            <Heart size={16} weight="duotone" style={{ color: PURPLE }} />
            <span>Sunshine Kids Academy &copy; {new Date().getFullYear()}</span>
          </div>
          <p className="text-xs text-[#6b7280] flex items-center gap-1.5"><svg width="14" height="14" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-sky-500"><path d="M24.3 4.2c-1.5-.4-3.2.1-4.5 1.1-1-.7-2.3-1-3.5-.8-2.4.4-4.2 2.5-4.2 4.9v.6c-3.2.8-6 2.8-7.8 5.6-.3.5-.1 1.1.4 1.4.5.3 1.1.1 1.4-.4 1.5-2.3 3.7-4 6.3-4.7.5-.1 1-.1 1.5 0 .8.2 1.4.8 1.7 1.5.3.8.2 1.6-.2 2.3l-2.8 4.3c-.6.9-.4 2.1.4 2.8l2.5 2.1c.4.3.8.5 1.3.5h5.2c.5 0 1-.2 1.3-.5l1.2-1c.6-.5.8-1.3.6-2l-1-3.2c-.2-.5 0-1.1.4-1.4l3.8-2.5c1.3-.9 2.1-2.3 2.1-3.9V9.6c0-2.5-1.7-4.7-4.1-5.3v-.1z" fill="currentColor"/></svg>Created by <a href="https://bluejayportfolio.com" target="_blank" rel="noopener noreferrer" style={{textDecoration:"underline"}}>bluejayportfolio.com</a></p>
        </div>
      </footer>
    </main>
  );
}
