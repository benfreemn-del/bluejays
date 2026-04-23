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
  const [openQuiz, setOpenQuiz] = useState<number | null>(null);

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
          <img src="https://images.unsplash.com/photo-1587616211892-f743fcca64f9?w=1600&q=80" alt="" className="w-full h-full object-cover opacity-12" />
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

      {/* ─── URGENCY STRIP ─── */}
      <div className="relative z-10 w-full py-4" style={{ background: PURPLE }}>
        <div className="mx-auto max-w-7xl px-4 md:px-6 flex items-center justify-center gap-4 flex-wrap text-center">
          <motion.div
            className="w-2.5 h-2.5 rounded-full bg-white"
            animate={{ scale: [1, 1.4, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
          />
          <p className="text-white font-semibold text-sm md:text-base tracking-wide">
            ⭐ Limited Enrollment Available — Schedule a Tour Today
          </p>
          <a
            href="tel:2063217890"
            className="text-white font-bold underline underline-offset-2 hover:no-underline transition-all text-sm md:text-base"
          >
            (206) 321-7890
          </a>
          <motion.div
            className="w-2.5 h-2.5 rounded-full bg-white"
            animate={{ scale: [1, 1.4, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut", delay: 0.7 }}
          />
        </div>
      </div>

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

      {/* ─── PRICING ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: YELLOW }}>Transparent Pricing</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-[#1c1917]">
              <WordReveal text="Simple, Clear Pricing" />
            </h2>
            <p className="mt-4 text-[#6b7280] max-w-xl mx-auto">No hidden fees. No surprises. Just great care at a fair price.</p>
          </div>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
          >
            {/* Part-Time */}
            <motion.div variants={fadeUp}>
              <GlassCard className="p-8 h-full flex flex-col border border-purple-100">
                <p className="text-xs uppercase tracking-widest font-semibold mb-2" style={{ color: PURPLE }}>Part-Time Care</p>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-4xl font-bold text-[#1c1917]">$950</span>
                  <span className="text-[#9ca3af] text-sm mb-1">/month</span>
                </div>
                <p className="text-xs text-[#9ca3af] mb-6">3 days per week</p>
                <ul className="space-y-3 flex-1 mb-8">
                  {["3 days per week", "7am – 5pm hours", "Meals & snacks included", "Age-appropriate activities", "Monthly progress updates"].map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-[#4b5563]">
                      <CheckCircle size={16} weight="fill" style={{ color: PURPLE }} />
                      {f}
                    </li>
                  ))}
                </ul>
                <MagneticButton
                  className="w-full py-3 rounded-full text-sm font-semibold border border-purple-200 text-center cursor-pointer"
                  style={{ color: PURPLE }}
                >
                  Enroll Part-Time
                </MagneticButton>
              </GlassCard>
            </motion.div>

            {/* Full-Time — Most Popular */}
            <motion.div variants={fadeUp}>
              <ShimmerBorder className="h-full">
                <div className="p-8 h-full flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs uppercase tracking-widest font-semibold" style={{ color: PURPLE }}>Full-Time Care</p>
                    <span className="text-xs px-2.5 py-1 rounded-full font-semibold text-white" style={{ background: YELLOW }}>Most Popular</span>
                  </div>
                  <div className="flex items-end gap-1 mb-1">
                    <span className="text-4xl font-bold text-[#1c1917]">$1,450</span>
                    <span className="text-[#9ca3af] text-sm mb-1">/month</span>
                  </div>
                  <p className="text-xs text-[#9ca3af] mb-6">5 days per week</p>
                  <ul className="space-y-3 flex-1 mb-8">
                    {["5 days per week", "7am – 5pm hours", "All meals included", "Extended curriculum", "Weekly progress reports", "Parent app updates daily"].map((f, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-[#4b5563]">
                        <CheckCircle size={16} weight="fill" style={{ color: PURPLE }} />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <MagneticButton
                    className="w-full py-3 rounded-full text-sm font-semibold text-white cursor-pointer"
                    style={{ background: PURPLE }}
                  >
                    Enroll Full-Time
                  </MagneticButton>
                </div>
              </ShimmerBorder>
            </motion.div>

            {/* Extended Day */}
            <motion.div variants={fadeUp}>
              <GlassCard className="p-8 h-full flex flex-col border border-purple-100">
                <p className="text-xs uppercase tracking-widest font-semibold mb-2" style={{ color: PURPLE }}>Extended Day</p>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-4xl font-bold text-[#1c1917]">$1,750</span>
                  <span className="text-[#9ca3af] text-sm mb-1">/month</span>
                </div>
                <p className="text-xs text-[#9ca3af] mb-6">5 days, extended hours</p>
                <ul className="space-y-3 flex-1 mb-8">
                  {["5 days per week", "6:30am – 6:00pm", "Premium curriculum", "Individualized learning plan", "Monthly parent meetings", "Priority enrollment renewal"].map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-[#4b5563]">
                      <CheckCircle size={16} weight="fill" style={{ color: PURPLE }} />
                      {f}
                    </li>
                  ))}
                </ul>
                <MagneticButton
                  className="w-full py-3 rounded-full text-sm font-semibold border border-purple-200 text-center cursor-pointer"
                  style={{ color: PURPLE }}
                >
                  Enroll Extended
                </MagneticButton>
              </GlassCard>
            </motion.div>
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── COMPETITOR COMPARISON TABLE ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: YELLOW }}>How We Compare</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-tight font-bold text-[#1c1917]">
              Sunshine Learning Center vs. The Rest
            </h2>
          </div>
          <GlassCard className="overflow-hidden border border-purple-100">
            {/* Table header */}
            <div className="grid grid-cols-3 px-6 py-4 border-b border-purple-50" style={{ background: "rgba(124,58,237,0.04)" }}>
              <p className="text-sm font-semibold text-[#6b7280]">Feature</p>
              <p className="text-sm font-bold text-center" style={{ color: PURPLE }}>Sunshine Learning</p>
              <p className="text-sm font-semibold text-center text-[#9ca3af]">Average Daycare</p>
            </div>
            {[
              { feature: "State Licensed & Inspected", us: "✓", them: "Required" },
              { feature: "Low Child-to-Teacher Ratio", us: "✓", them: "Varies" },
              { feature: "Curriculum-Based Learning", us: "✓", them: "Sometimes" },
              { feature: "Hot Meals Included", us: "✓", them: "Varies" },
              { feature: "Parent App Updates", us: "✓", them: "Rarely" },
              { feature: "CPR-Certified Staff", us: "✓", them: "Required" },
              { feature: "Outdoor Playtime Daily", us: "✓", them: "Varies" },
            ].map((row, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ ...spring, delay: i * 0.06 }}
                className={`grid grid-cols-3 px-6 py-4 items-center ${i % 2 === 0 ? "bg-white/60" : "bg-purple-50/30"} border-b border-purple-50 last:border-b-0`}
              >
                <p className="text-sm text-[#4b5563] font-medium">{row.feature}</p>
                <div className="flex items-center justify-center gap-1.5">
                  <CheckCircle size={18} weight="fill" className="text-green-500" />
                  <span className="text-sm font-semibold text-green-600">{row.us}</span>
                </div>
                <p className="text-sm text-center text-[#9ca3af]">{row.them}</p>
              </motion.div>
            ))}
          </GlassCard>
        </div>
      </SectionReveal>

      {/* ─── VIDEO PLACEHOLDER ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4 md:px-6">
          <div className="text-center mb-10">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: YELLOW }}>See It for Yourself</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-tight font-bold text-[#1c1917]">
              Take a Virtual Tour
            </h2>
            <p className="mt-3 text-[#6b7280] max-w-lg mx-auto">
              See our safe, nurturing learning environment and happy children at Sunshine Learning Center.
            </p>
          </div>
          <motion.div
            whileHover={{ scale: 1.01 }}
            transition={springFast}
            className="relative w-full rounded-2xl overflow-hidden border border-purple-200 cursor-pointer group"
            style={{ aspectRatio: "16/9", background: "#ede9fe" }}
          >
            <img
              src="https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=1200&q=80"
              alt="Children playing outdoors at Sunshine Learning Center"
              className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-50 transition-opacity duration-300"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              <motion.div
                whileHover={{ scale: 1.12 }}
                transition={springFast}
                className="w-20 h-20 rounded-full flex items-center justify-center shadow-xl"
                style={{ background: PURPLE }}
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </motion.div>
              <div className="text-center">
                <p className="text-white font-bold text-lg drop-shadow-lg">Watch Our Tour</p>
                <p className="text-white/80 text-sm drop-shadow">3 min · Meet our classrooms &amp; staff</p>
              </div>
            </div>
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── PROGRAM QUIZ ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: YELLOW }}>Find the Right Fit</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-tight font-bold text-[#1c1917]">
              Which Program Is Right for Your Child?
            </h2>
            <p className="mt-3 text-[#6b7280]">Tap an option to learn more and take the next step.</p>
          </div>
          <motion.div
            className="space-y-3"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
          >
            {[
              {
                label: "My child is an infant (0–12 months)",
                detail: "Our Infant Room has the lowest ratio in Seattle — 1 teacher per 3 babies. Structured sleep schedules, sensory play, and daily parent updates keep you connected every step of the way.",
                cta: "Learn About Infant Care",
              },
              {
                label: "My child is a toddler (1–2 years)",
                detail: "Toddler classrooms focus on the language explosion, social skills, and supervised exploration. Staff trained in positive redirection create a joyful, calm environment for this exciting stage.",
                cta: "Explore Toddler Program",
              },
              {
                label: "My child is a preschooler (3–5 years)",
                detail: "Our kindergarten-readiness curriculum covers letter recognition, counting, creative arts, and social-emotional learning — setting children up for lifelong academic success.",
                cta: "View Preschool Program",
              },
              {
                label: "I need before/after school care",
                detail: "Homework help, supervised activities, and a safe home-away-from-home for school-age kids ages 5–12. Drop off early, pick up late — we have it covered.",
                cta: "See School-Age Care",
              },
            ].map((item, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="overflow-hidden border border-purple-100">
                  <button
                    onClick={() => setOpenQuiz(openQuiz === i ? null : i)}
                    className="w-full flex items-center justify-between p-5 md:p-6 text-left cursor-pointer"
                  >
                    <span className="text-base font-semibold text-[#1c1917] pr-4">{item.label}</span>
                    <motion.div animate={{ rotate: openQuiz === i ? 180 : 0 }} transition={spring}>
                      <CaretDown size={20} className="text-[#9ca3af]" />
                    </motion.div>
                  </button>
                  <AnimatePresence initial={false}>
                    {openQuiz === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={spring}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-6 md:px-6 space-y-4">
                          <p className="text-[#6b7280] leading-relaxed text-sm">{item.detail}</p>
                          <MagneticButton
                            className="px-6 py-2.5 rounded-full text-sm font-semibold text-white inline-flex items-center gap-2 cursor-pointer"
                            style={{ background: PURPLE }}
                          >
                            {item.cta} <ArrowRight size={16} weight="bold" />
                          </MagneticButton>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── ABOUT / PHILOSOPHY ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-8">
          <img src="https://images.unsplash.com/photo-1544776193-352d25ca82cd?w=1600&q=80" alt="" className="w-full h-full object-cover" />
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
      <SectionReveal className="relative z-10 pt-12 pb-0">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <div className="flex items-center gap-1">
              {[0, 1, 2, 3, 4].map((i) => (
                <svg key={i} width="22" height="22" viewBox="0 0 24 24" fill="#eab308">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              ))}
            </div>
            <span className="text-2xl font-bold text-gray-700">4.9</span>
            <span className="text-gray-400 text-lg">·</span>
            <span className="text-gray-600 font-medium">89 Google reviews</span>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
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
                <GlassCard className="p-6 h-full flex flex-col">
                  <Quotes size={28} weight="fill" style={{ color: PURPLE }} className="mb-3 opacity-50" />
                  <p className="text-[#4b5563] leading-relaxed flex-1 text-sm">{t.text}</p>
                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-sm font-semibold text-[#1c1917]">{t.name}</span>
                    <div className="flex gap-0.5">{Array.from({ length: t.rating }).map((_, j) => (<Star key={j} size={12} weight="fill" style={{ color: YELLOW }} />))}</div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
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

      {/* ─── CERTIFICATIONS BADGE ROW ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-20">
        <div className="mx-auto max-w-5xl px-4 md:px-6">
          <div className="text-center mb-10">
            <p className="text-sm uppercase tracking-widest mb-2" style={{ color: YELLOW }}>You Can Trust Us</p>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1c1917] tracking-tight">Safe, Licensed &amp; Trusted</h2>
          </div>
          <motion.div
            className="flex flex-wrap justify-center gap-3"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
          >
            {[
              "WA DCYF Licensed",
              "NAEYC Accredited",
              "CPR Certified Staff",
              "Background-Checked",
              "First Aid Trained",
              "Nutritious USDA Meals",
            ].map((badge, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full border text-sm font-semibold"
                style={{ background: "#f5f3ff", borderColor: "#ddd6fe", color: PURPLE }}
              >
                <CheckCircle size={16} weight="fill" style={{ color: PURPLE }} />
                {badge}
              </motion.div>
            ))}
          </motion.div>
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

      {/* ─── SERVICE AREA GRID ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: YELLOW }}>Where We Serve</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-tight font-bold text-[#1c1917]">
              Serving Families Across{" "}
              <span style={{ color: PURPLE }}>Seattle</span>
            </h2>
            <p className="mt-4 text-[#6b7280] max-w-xl mx-auto">
              Families from across Seattle trust Sunshine Learning Center for premium early childhood care.
            </p>
          </div>
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-4 gap-4"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
          >
            {[
              "Queen Anne",
              "Magnolia",
              "Ballard",
              "Fremont",
              "Capitol Hill",
              "First Hill",
              "South Lake Union",
              "University District",
            ].map((neighborhood, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="p-5 text-center border border-purple-100 hover:border-purple-300 transition-colors">
                  <div className="flex items-center justify-center mb-3">
                    <motion.div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ background: PURPLE }}
                      animate={{ scale: [1, 1.35, 1], opacity: [0.6, 1, 0.6] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: i * 0.15 }}
                    />
                  </div>
                  <p className="text-sm font-semibold text-[#1c1917]">{neighborhood}</p>
                  <p className="text-xs text-[#9ca3af] mt-1">Families Enrolled Here</p>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>

          {/* Bottom CTA row */}
          <div className="mt-12 text-center">
            <GlassCard className="inline-flex items-center gap-4 px-6 py-4 border border-purple-100">
              <MapPin size={20} weight="duotone" style={{ color: PURPLE }} />
              <span className="text-sm text-[#4b5563]">
                <span className="font-semibold text-[#1c1917]">456 Sunshine Lane, Seattle, WA</span> — Accepting enrollments now
              </span>
              <a
                href="tel:2063217890"
                className="px-4 py-2 rounded-full text-sm font-semibold text-white whitespace-nowrap"
                style={{ background: PURPLE }}
              >
                Call Us
              </a>
            </GlassCard>
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
