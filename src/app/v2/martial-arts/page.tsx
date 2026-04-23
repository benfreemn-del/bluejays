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
  HandFist,
  Belt,
  Star,
  ShieldCheck,
  Users,
  Phone,
  MapPin,
  Clock,
  ArrowRight,
  CaretDown,
  Quotes,
  CalendarCheck,
  Lightning,
  Trophy,
  Fire,
  Person,
  PersonSimpleRun,
  Heart,
  Target,
  Barbell,
  CheckCircle,
  X,
  List,
  Play,
  SealCheck,
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
const BG = "#0a0505";
const RED = "#991b1b";
const RED_LIGHT = "#dc2626";
const GOLD = "#b8860b";
const GOLD_LIGHT = "#d4a843";
const RED_GLOW = "rgba(153, 27, 27, 0.18)";
const GOLD_GLOW = "rgba(184, 134, 11, 0.15)";

/* ───────────────────────── FLOATING ENERGY PARTICLES ───────────────────────── */
function FloatingEnergy() {
  const particles = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 8,
    duration: 5 + Math.random() * 5,
    size: 2 + Math.random() * 3,
    opacity: 0.15 + Math.random() * 0.3,
    color: i % 3 === 0 ? GOLD_LIGHT : RED_LIGHT,
  }));
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden hidden md:block">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{ left: `${p.x}%`, width: p.size, height: p.size, background: p.color, willChange: "transform, opacity" }}
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
  return <div className={`rounded-2xl border border-white/15 bg-white/[0.08] backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] ${className}`}>{children}</div>;
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
      <motion.div className="absolute inset-0 rounded-2xl" style={{ background: `conic-gradient(from 0deg, transparent, ${RED}, transparent, ${GOLD}, transparent)`, willChange: "transform" }} animate={{ rotate: [0, 360] }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} />
      <div className="relative rounded-2xl z-10" style={{ background: "#120808" }}>{children}</div>
    </div>
  );
}

/* ───────────────────────── FIST ENERGY SVG ───────────────────────── */
function FistEnergySVG() {
  return (
    <div className="relative flex items-center justify-center">
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{ background: `radial-gradient(circle, ${RED_GLOW} 0%, transparent 70%)`, filter: "blur(40px)" }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      <svg viewBox="0 0 200 240" className="relative z-10 w-48 h-56 md:w-56 md:h-72" fill="none">
        {/* Outer glow rings */}
        <motion.circle cx="100" cy="110" r="92" stroke={RED} strokeWidth="0.5" opacity={0.12}
          animate={{ r: [90, 94, 90] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} />
        <motion.circle cx="100" cy="110" r="82" stroke={GOLD} strokeWidth="0.3" opacity={0.08}
          animate={{ r: [80, 84, 80] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }} />

        {/* Energy burst lines radiating outward */}
        {[0, 40, 80, 120, 160, 200, 240, 280, 320].map((angle, i) => (
          <motion.line key={i}
            x1={100 + 55 * Math.cos((angle * Math.PI) / 180)} y1={110 + 55 * Math.sin((angle * Math.PI) / 180)}
            x2={100 + 85 * Math.cos((angle * Math.PI) / 180)} y2={110 + 85 * Math.sin((angle * Math.PI) / 180)}
            stroke={i % 2 === 0 ? RED_LIGHT : GOLD} strokeWidth="2" strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: [0, 1, 0], opacity: [0, 0.7, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }} />
        ))}

        {/* Yin-yang circle behind fist */}
        <motion.circle cx="100" cy="105" r="50" fill={`${RED}0d`} stroke={RED} strokeWidth="2"
          initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "backOut" }} />
        <circle cx="100" cy="105" r="42" fill={`${RED}08`} />

        {/* Yin-yang inner design */}
        <motion.path d="M100 55 A50 50 0 0 1 100 155 A25 25 0 0 0 100 105 A25 25 0 0 1 100 55"
          fill={`${RED}18`} stroke="none"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }} />
        <motion.circle cx="100" cy="80" r="7" fill={`${GOLD}33`}
          initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.2 }} />
        <motion.circle cx="100" cy="130" r="7" fill={`${RED}33`}
          initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.3 }} />

        {/* Fist outline */}
        <motion.path
          d="M80 85 L80 70 Q80 62 88 62 L92 62 Q96 62 96 66 L96 62 Q96 55 104 55 L104 55 Q112 55 112 62 L112 62 Q112 55 120 55 Q128 55 128 64 L128 75 Q136 72 136 82 L136 110 Q136 135 110 140 L90 140 Q72 135 72 115 L72 95 Q72 85 80 85Z"
          fill={`${RED}22`} stroke={RED_LIGHT} strokeWidth="2" strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2, delay: 0.5, ease: "easeInOut" }} />
        {/* Fist inner highlight */}
        <path d="M84 88 L84 74 Q84 68 90 68 L106 68 Q116 68 116 74 L116 84 Q120 78 124 82 L124 108 Q124 128 106 132 L94 132 Q80 128 80 112 L80 95 Q80 88 84 88Z" fill={`${RED}0d`} />

        {/* Belt below */}
        <motion.rect x="55" y="165" width="90" height="12" rx="3" fill={`${GOLD}22`} stroke={GOLD} strokeWidth="1.5"
          initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
          transition={{ duration: 0.6, delay: 2 }} />
        <rect x="60" y="167" width="80" height="6" rx="2" fill={`${GOLD}0d`} />
        {/* Belt knot */}
        <motion.circle cx="100" cy="171" r="5" fill={`${GOLD}33`} stroke={GOLD} strokeWidth="1"
          initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 2.3 }} />
        {/* Belt tails */}
        <motion.path d="M95 177 L88 200 L92 200 L98 180" stroke={GOLD} strokeWidth="1.5" fill={`${GOLD}15`}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.4 }} />
        <motion.path d="M105 177 L112 200 L108 200 L102 180" stroke={GOLD} strokeWidth="1.5" fill={`${GOLD}15`}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5 }} />

        {/* Kanji character */}
        <motion.text x="100" y="225" textAnchor="middle" fill={RED_LIGHT} fontSize="16" fontWeight="bold" fontFamily="serif"
          initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ delay: 2.8 }}>
          武道
        </motion.text>

        {/* Sparkle accents */}
        <motion.circle cx="165" cy="30" r="3" fill={GOLD_LIGHT}
          animate={{ opacity: [0.2, 1, 0.2], scale: [0.7, 1.3, 0.7] }}
          transition={{ duration: 2.5, repeat: Infinity }} />
        <motion.circle cx="30" cy="55" r="2" fill={RED_LIGHT}
          animate={{ opacity: [0.1, 0.8, 0.1], scale: [0.5, 1.2, 0.5] }}
          transition={{ duration: 3, repeat: Infinity, delay: 0.8 }} />
        <motion.circle cx="175" cy="130" r="2.5" fill={GOLD_LIGHT}
          animate={{ opacity: [0.15, 0.7, 0.15] }}
          transition={{ duration: 2, repeat: Infinity, delay: 1.2 }} />
        <motion.circle cx="25" cy="150" r="2" fill={RED_LIGHT}
          animate={{ opacity: [0.1, 0.6, 0.1] }}
          transition={{ duration: 2.5, repeat: Infinity, delay: 0.4 }} />
      </svg>
    </div>
  );
}

/* ───────────────────────── DATA ───────────────────────── */
const programs = [
  { title: "Karate", description: "Traditional Shotokan karate for all ages. Build discipline, focus, and powerful striking technique through kata, kumite, and kihon training with certified black belt instructors.", icon: HandFist },
  { title: "Brazilian Jiu-Jitsu", description: "Ground fighting and submission grappling in a safe, supportive environment. Learn the art that levels the playing field regardless of size or strength.", icon: PersonSimpleRun },
  { title: "Kickboxing", description: "High-energy striking classes combining boxing, Muay Thai kicks, knees, and elbows. Burn 800+ calories while learning devastating standup techniques.", icon: Lightning },
  { title: "Kids Martial Arts", description: "Age-appropriate classes for children ages 4-12. Build confidence, discipline, coordination, and anti-bullying skills in a fun, encouraging environment.", icon: Person },
  { title: "Self-Defense", description: "Practical, real-world self-defense techniques drawn from multiple disciplines. Learn situational awareness, de-escalation, and effective physical responses.", icon: ShieldCheck },
  { title: "Fitness & Conditioning", description: "Martial arts-inspired functional fitness. Bag work, bodyweight exercises, agility drills, and core training for peak athletic performance.", icon: Barbell },
];

const stats = [
  { value: "3,000+", label: "Students Trained" },
  { value: "4.9", label: "Star Rating" },
  { value: "20+", label: "Years Teaching" },
  { value: "50+", label: "Competition Titles" },
];

const beltSystem = [
  { belt: "White Belt", desc: "Beginning your journey. Learn fundamentals, stances, and basic strikes.", color: "#ffffff" },
  { belt: "Yellow Belt", desc: "Building foundations. Basic combinations, first kata, and partner drills.", color: "#eab308" },
  { belt: "Orange Belt", desc: "Growing confidence. Intermediate techniques, self-defense applications.", color: "#f97316" },
  { belt: "Green Belt", desc: "Developing skill. Advanced combinations, sparring introduction, leadership.", color: "#22c55e" },
  { belt: "Blue Belt", desc: "Refining technique. Complex kata, competition preparation, teaching basics.", color: "#3b82f6" },
  { belt: "Brown Belt", desc: "Near mastery. Advanced sparring, weapons introduction, mentoring juniors.", color: "#92400e" },
  { belt: "Black Belt", desc: "The true beginning. Mastery of fundamentals, leadership, lifelong learning.", color: "#1a1a1a" },
];

const testimonials = [
  { name: "Marcus J.", text: "I started at 35 with zero experience. Three years later, I have my brown belt, lost 40 pounds, and have more confidence than ever. This school changed my life.", rating: 5 },
  { name: "Jennifer P.", text: "My son was bullied at school. After six months of kids karate, his confidence skyrocketed. He carries himself differently now. The instructors are incredible with children.", rating: 5 },
  { name: "David & Sarah K.", text: "Our whole family trains here. Date night is Tuesday sparring class. The community is welcoming, the instruction is world-class, and we have never been healthier.", rating: 5 },
];

const scheduleData = [
  { time: "6:00 AM", classes: "Adult Fitness & Conditioning" },
  { time: "9:00 AM", classes: "Adult Karate (All Levels)" },
  { time: "3:30 PM", classes: "Kids Karate (Ages 4-7)" },
  { time: "4:30 PM", classes: "Kids Karate (Ages 8-12)" },
  { time: "5:30 PM", classes: "Adult Brazilian Jiu-Jitsu" },
  { time: "6:30 PM", classes: "Kickboxing" },
  { time: "7:30 PM", classes: "Advanced Sparring / Competition" },
  { time: "Saturday 9 AM", classes: "Open Mat & Self-Defense Workshop" },
];

const faqs = [
  { q: "Do I need experience to start?", a: "Absolutely not. Most of our students start with zero martial arts experience. Our beginner-friendly classes are designed to build skills gradually in a supportive environment." },
  { q: "What age can children start?", a: "Our Little Warriors program accepts children from age 4. We have age-appropriate classes for 4-7, 8-12, and teen groups, each designed for their developmental stage." },
  { q: "Will I get hurt?", a: "Safety is our number one priority. All sparring is controlled and supervised. You train at your own pace, and full protective gear is required for any contact work." },
  { q: "How long does it take to get a black belt?", a: "Typically 3-5 years of consistent training. But the journey is the reward. Every belt represents real growth in skill, discipline, and character." },
  { q: "What should I wear to my first class?", a: "Comfortable athletic clothing is fine for your first class. If you decide to continue, we will help you get a proper gi (uniform) that is included in your enrollment." },
];

/* ═══════════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════════ */
export default function V2MartialArtsPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openQuiz, setOpenQuiz] = useState<number | null>(null);

  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden" style={{ background: BG, color: "#f1f5f9" }}>
      <FloatingEnergy />

      {/* ─── NAV ─── */}
      <motion.nav initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-4">
          <GlassCard className="flex items-center justify-between px-4 md:px-6 py-3">
            <div className="flex items-center gap-2">
              <HandFist size={24} weight="duotone" style={{ color: RED_LIGHT }} />
              <span className="text-lg font-bold tracking-tight text-white">Iron Dragon Dojo</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
              <a href="#programs" className="hover:text-white transition-colors">Programs</a>
              <a href="#belts" className="hover:text-white transition-colors">Belt System</a>
              <a href="#schedule" className="hover:text-white transition-colors">Schedule</a>
              <a href="#trial" className="hover:text-white transition-colors">Free Trial</a>
            </div>
            <div className="flex items-center gap-3">
              <MagneticButton className="px-4 md:px-5 py-2 rounded-full text-sm font-semibold text-white transition-colors" style={{ background: RED }}>Free Trial</MagneticButton>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors">
                {mobileMenuOpen ? <X size={24} /> : <List size={24} />}
              </button>
            </div>
          </GlassCard>
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3, ease: "easeInOut" }} className="md:hidden mt-2 overflow-hidden">
                <GlassCard className="flex flex-col gap-1 px-4 py-4">
                  {[{ label: "Programs", href: "#programs" }, { label: "Belt System", href: "#belts" }, { label: "Schedule", href: "#schedule" }, { label: "Free Trial", href: "#trial" }].map((link) => (
                    <a key={link.label} href={link.href} onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors">{link.label}</a>
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
          <img src="https://images.unsplash.com/photo-1555597673-b21d5c935865?w=1600&q=80" alt="" className="w-full h-full object-cover opacity-15" />
          <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, ${BG}, transparent 30%, ${BG})` }} />
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-4 items-center">
          <div className="space-y-8">
            <div>
              <motion.p initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ ...spring, delay: 0.1 }} className="text-sm uppercase tracking-[0.25em] mb-4" style={{ color: GOLD }}>Discipline &bull; Strength &bull; Honor</motion.p>
              <h1 className="text-4xl md:text-7xl tracking-tighter leading-none font-black text-white" style={{ textShadow: "0 2px 20px rgba(153,27,27,0.4)" }}>
                <WordReveal text="Forge Your Inner Warrior" />
              </h1>
            </div>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.6 }} className="text-lg text-slate-400 max-w-md leading-relaxed">
              World-class martial arts instruction for all ages and skill levels. Build unshakable confidence, elite fitness, and the discipline that transforms every area of your life.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.8 }} className="flex flex-wrap gap-4">
              <MagneticButton className="px-8 py-4 rounded-full text-base font-bold text-white flex items-center gap-2 cursor-pointer" style={{ background: RED }}>
                Claim Free Trial <ArrowRight size={18} weight="bold" />
              </MagneticButton>
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/15 flex items-center gap-2 cursor-pointer">
                <Phone size={18} weight="duotone" /> (206) 741-8520
              </MagneticButton>
            </motion.div>
            {/* Hero trust badges */}
            <motion.div animate={{ opacity: 1, y: 0 }} className="flex flex-wrap gap-2">
              {["Certified Instructors", "All Ages Welcome", "Free Trial Class", "Family-Friendly Dojo"].map((badge) => (
                <span key={badge} className="border border-white/20 bg-white/10 text-white text-xs px-3 py-1 rounded-full">{badge}</span>
              ))}
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ ...spring, delay: 1 }} className="flex flex-wrap gap-6 text-sm text-slate-400">
              <span className="flex items-center gap-2"><MapPin size={16} weight="duotone" style={{ color: RED_LIGHT }} />4821 Stone Way N, Suite 201</span>
              <span className="flex items-center gap-2"><Clock size={16} weight="duotone" style={{ color: RED_LIGHT }} />Mon-Sat 6am-9pm</span>
            </motion.div>
          </div>
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ ...spring, delay: 0.3 }} className="hidden md:flex items-center justify-center lg:justify-end">
            <FistEnergySVG />
          </motion.div>
        </div>
      </section>

      {/* ─── URGENCY STRIP ─── */}
      <div className="relative z-10 w-full py-3 flex items-center justify-center gap-4" style={{ background: RED_LIGHT }}>
        <motion.div className="w-2.5 h-2.5 rounded-full bg-white" animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }} />
        <p className="text-white text-sm font-semibold tracking-wide text-center px-4">
          ⚡ Limited Enrollment — Only 8 Spots Left This Month &nbsp;&middot;&nbsp; Call <a href="tel:2067418520" className="underline font-bold">(206) 741-8520</a>
        </p>
        <motion.div className="w-2.5 h-2.5 rounded-full bg-white" animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.75 }} />
      </div>

      {/* ─── STATS ─── */}
      <SectionReveal className="relative z-10 pb-8">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <GlassCard className="p-6 md:p-8">
            <motion.div className="grid grid-cols-2 sm:grid-cols-4 gap-6 md:gap-8" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
              {stats.map((s, i) => (
                <motion.div key={i} variants={fadeUp} className="text-center">
                  <p className="text-3xl md:text-4xl font-black tracking-tight" style={{ color: RED_LIGHT }}>{s.value}</p>
                  <p className="text-sm text-slate-400 mt-1">{s.label}</p>
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
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GOLD }}>Our Disciplines</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-black text-white">
              <WordReveal text="Train Like a Champion" />
            </h2>
          </div>
          <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {programs.map((prog, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="p-6 h-full">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: i % 2 === 0 ? RED_GLOW : GOLD_GLOW }}>
                    <prog.icon size={24} weight="duotone" style={{ color: i % 2 === 0 ? RED_LIGHT : GOLD }} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{prog.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{prog.description}</p>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── ABOUT / MASTER INSTRUCTOR ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-8">
          <img src="https://images.unsplash.com/photo-1564415315949-7a0c4c73aab4?w=1600&q=80" alt="" className="w-full h-full object-cover" />
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GOLD }}>Our Founder</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-black text-white mb-6">
              <WordReveal text="Master Instructor" />
            </h2>
            <p className="text-slate-400 leading-relaxed mb-4">
              Sensei David Tanaka holds a 6th degree black belt in Shotokan Karate, a 3rd degree black belt in Brazilian Jiu-Jitsu, and has over 20 years of competitive and teaching experience. A former national champion, he founded Iron Dragon Dojo with a mission to make world-class martial arts accessible to everyone.
            </p>
            <p className="text-slate-400 leading-relaxed">
              Under his guidance, our instructors do not just teach techniques; they build character, resilience, and a warrior mindset that translates to every challenge in life.
            </p>
          </div>
          <motion.div className="grid grid-cols-2 gap-4" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
            {[
              { icon: Trophy, label: "National Champion", desc: "3x gold medalist" },
              { icon: Belt, label: "6th Degree", desc: "Shotokan Karate" },
              { icon: Users, label: "3,000+ Students", desc: "Trained & mentored" },
              { icon: Heart, label: "Community First", desc: "Youth scholarships" },
            ].map((item, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="p-5 text-center">
                  <item.icon size={28} weight="duotone" style={{ color: i % 2 === 0 ? RED_LIGHT : GOLD }} className="mx-auto mb-2" />
                  <p className="text-sm font-bold text-white">{item.label}</p>
                  <p className="text-xs text-slate-400 mt-1">{item.desc}</p>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── BELT SYSTEM ─── */}
      <SectionReveal id="belts" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GOLD }}>Your Journey</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-black text-white">
              <WordReveal text="Belt Progression System" />
            </h2>
          </div>
          <motion.div className="space-y-3 max-w-3xl mx-auto" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {beltSystem.map((b, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="p-5 flex items-center gap-4">
                  <div className="w-12 h-3 rounded-full shrink-0 border border-white/20" style={{ background: b.color }} />
                  <div>
                    <p className="text-sm font-bold text-white">{b.belt}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{b.desc}</p>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── TESTIMONIALS ─── */}
      <SectionReveal id="testimonials" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          {/* Google Reviews Header */}
          <div className="flex justify-center mb-10">
            <div className="inline-flex items-center gap-3 bg-white/5 border border-white/15 rounded-xl px-6 py-3">
              <div className="flex gap-0.5">{[...Array(5)].map((_, i) => (<svg key={i} viewBox="0 0 24 24" fill="#facc15" className="w-4 h-4"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>))}</div>
              <span className="text-white font-bold">4.9</span>
              <span className="text-slate-400 text-sm">· 187 Google reviews</span>
              <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            </div>
          </div>
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GOLD }}>Student Stories</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-black text-white">
              <WordReveal text="Transformed Lives" />
            </h2>
          </div>
          <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {testimonials.map((t, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="p-6 h-full flex flex-col">
                  <Quotes size={28} weight="fill" style={{ color: RED_LIGHT }} className="mb-3 opacity-50" />
                  <p className="text-slate-300 leading-relaxed flex-1 text-sm">{t.text}</p>
                  <div className="mt-4 pt-4 border-t border-white/8 flex items-center justify-between">
                    <span className="text-sm font-bold text-white">{t.name}</span>
                    <div className="flex gap-0.5">{Array.from({ length: t.rating }).map((_, j) => (<Star key={j} size={12} weight="fill" style={{ color: GOLD }} />))}</div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── SCHEDULE ─── */}
      <SectionReveal id="schedule" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div className="lg:sticky lg:top-32">
              <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GOLD }}>Train With Us</p>
              <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-black text-white mb-6">
                <WordReveal text="Class Schedule" />
              </h2>
              <p className="text-slate-400 leading-relaxed max-w-md">We offer classes from early morning to evening so you can train on your schedule. Drop-ins welcome for all experience levels.</p>
            </div>
            <motion.div className="space-y-3" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
              {scheduleData.map((item, i) => (
                <motion.div key={i} variants={fadeUp}>
                  <GlassCard className="p-4 flex items-center gap-4">
                    <div className="w-24 shrink-0">
                      <p className="text-xs font-bold" style={{ color: GOLD }}>{item.time}</p>
                    </div>
                    <p className="text-sm font-semibold text-white">{item.classes}</p>
                  </GlassCard>
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
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GOLD }}>Common Questions</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-black text-white">
              <WordReveal text="Frequently Asked Questions" />
            </h2>
          </div>
          <motion.div className="space-y-3" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {faqs.map((faq, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="overflow-hidden">
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-5 md:p-6 text-left cursor-pointer">
                    <span className="text-lg font-bold text-white pr-4">{faq.q}</span>
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

      {/* ─── PRICING ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GOLD }}>Membership Options</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-black text-white">Train Without Limits</h2>
            <p className="text-slate-400 mt-4 max-w-lg mx-auto">No long-term contracts. Cancel any time. First class always free.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <GlassCard className="p-8 text-center">
              <p className="text-sm uppercase tracking-widest mb-2" style={{ color: GOLD }}>Single Art</p>
              <p className="text-5xl font-black text-white mb-1">$129<span className="text-2xl">/mo</span></p>
              <p className="text-slate-400 text-sm mb-6">2 classes/week · one discipline</p>
              <ul className="text-left space-y-2 mb-8">
                {["One martial art discipline", "2 classes per week", "Open mat Saturdays", "Uniform included", "Monthly cancel anytime"].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-slate-300"><CheckCircle size={16} weight="fill" style={{ color: RED_LIGHT }} />{f}</li>
                ))}
              </ul>
              <MagneticButton className="w-full py-3 rounded-full text-sm font-semibold text-white border border-white/15 cursor-pointer">Get Started</MagneticButton>
            </GlassCard>
            <div className="relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 text-white text-xs font-bold px-4 py-1 rounded-full tracking-widest" style={{ background: RED }}>MOST POPULAR</div>
              <GlassCard className="p-8 text-center border-2" style={{ borderColor: RED_LIGHT }}>
                <p className="text-sm uppercase tracking-widest mb-2" style={{ color: GOLD }}>Unlimited Training</p>
                <p className="text-5xl font-black text-white mb-1">$199<span className="text-2xl">/mo</span></p>
                <p className="text-slate-400 text-sm mb-6">All classes · all disciplines</p>
                <ul className="text-left space-y-2 mb-8">
                  {["All martial arts disciplines", "Unlimited classes per week", "Competition prep included", "Community events access", "Priority class booking"].map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-300"><CheckCircle size={16} weight="fill" style={{ color: GOLD_LIGHT }} />{f}</li>
                  ))}
                </ul>
                <MagneticButton className="w-full py-3 rounded-full text-sm font-bold text-white cursor-pointer" style={{ background: RED }}>Join Now</MagneticButton>
              </GlassCard>
            </div>
            <GlassCard className="p-8 text-center">
              <p className="text-sm uppercase tracking-widest mb-2" style={{ color: GOLD }}>Elite Fighter</p>
              <p className="text-5xl font-black text-white mb-1">$349<span className="text-2xl">/mo</span></p>
              <p className="text-slate-400 text-sm mb-6">Private coaching · competition team</p>
              <ul className="text-left space-y-2 mb-8">
                {["Private 1-on-1 coaching 2x/week", "Competition team membership", "Video technique analysis", "Nutrition guidance", "VIP mat access anytime"].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-slate-300"><CheckCircle size={16} weight="fill" style={{ color: GOLD_LIGHT }} />{f}</li>
                ))}
              </ul>
              <MagneticButton className="w-full py-3 rounded-full text-sm font-semibold text-white border border-white/15 cursor-pointer">Apply Now</MagneticButton>
            </GlassCard>
          </div>
        </div>
      </SectionReveal>

      {/* ─── COMPETITOR COMPARISON ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GOLD }}>Why Train Here</p>
            <h2 className="text-4xl md:text-5xl font-black text-white">Dragon's Gate vs. Big Box Gyms</h2>
          </div>
          <GlassCard className="overflow-hidden">
            <div className="grid grid-cols-3 text-sm font-bold bg-white/5 px-6 py-3">
              <span className="text-slate-300">Feature</span>
              <span className="text-center" style={{ color: GOLD }}>Dragon's Gate</span>
              <span className="text-center text-slate-500">Big Box Gym</span>
            </div>
            {[
              ["Certified Black Belt Instructors", "✓", "Varies"],
              ["Small Class Sizes (max 15)", "✓", "No"],
              ["Traditional + Modern Methods", "✓", "Sometimes"],
              ["Competition Team Available", "✓", "Varies"],
              ["Kids & Adult Programs", "✓", "Adult Only"],
              ["No Long-Term Contracts", "✓", "Rarely"],
              ["Free Trial Class", "✓", "Sometimes"],
            ].map(([feature, us, them], i) => (
              <div key={i} className={`grid grid-cols-3 px-6 py-4 text-sm ${i % 2 === 0 ? "bg-white/[0.07]" : ""}`}>
                <span className="text-slate-300">{feature}</span>
                <span className="text-center font-bold" style={{ color: GOLD_LIGHT }}>{us}</span>
                <span className="text-center text-slate-500">{them}</span>
              </div>
            ))}
          </GlassCard>
        </div>
      </SectionReveal>

      {/* ─── VIDEO PLACEHOLDER ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-4 md:px-6 text-center">
          <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GOLD }}>See Us Train</p>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-8">Watch Our Classes in Action</h2>
          <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/15 cursor-pointer group">
            <img src="https://images.unsplash.com/photo-1555597673-b21d5c935865?w=1200&q=80" alt="Martial arts training" className="w-full h-full object-cover opacity-60 group-hover:opacity-70 transition-opacity" />
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div className="w-20 h-20 rounded-full flex items-center justify-center shadow-2xl relative" style={{ background: RED }} whileHover={{ scale: 1.1 }}>
                <motion.div className="absolute inset-0 rounded-full" style={{ background: RED }} animate={{ scale: [1, 1.5, 1], opacity: [0.6, 0, 0.6] }} transition={{ duration: 2, repeat: Infinity }} />
                <svg viewBox="0 0 24 24" fill="white" className="w-8 h-8 ml-1"><path d="M8 5v14l11-7z" /></svg>
              </motion.div>
            </div>
            <div className="absolute bottom-4 left-4 right-4 text-left">
              <p className="text-white font-semibold">See why hundreds of Seattle families train at Dragon's Gate</p>
              <p className="text-white/60 text-sm">All levels welcome · Kids & adults · Free trial class</p>
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* ─── TRAINING QUIZ ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GOLD }}>Find Your Path</p>
            <h2 className="text-4xl md:text-5xl font-black text-white">Which Program Is Right for You?</h2>
          </div>
          <div className="space-y-3">
            {[
              { label: "I want to get fit and learn self-defense", rec: "Kickboxing and Muay Thai build cardio, strength, and practical self-defense. No prior experience needed — our coaches meet you where you are.", badge: "Beginner-Friendly" },
              { label: "I want traditional martial arts discipline", rec: "Shotokan Karate and Taekwondo build mental discipline, respect, and technical precision through kata and forms. Great for adults and kids alike.", badge: "Traditional Arts" },
              { label: "I want to learn grappling and ground fighting", rec: "Brazilian Jiu-Jitsu is one of the most effective martial arts on the ground. Our BJJ program welcomes all levels from white to brown belt.", badge: "All Levels" },
              { label: "I want to enroll my child (ages 5–14)", rec: "Our Kids program builds confidence, focus, and bully-prevention skills in a safe, structured, and fun environment. Belt tests every 3 months.", badge: "Kids Ages 5-14" },
            ].map((opt, i) => (
                <GlassCard key={i} className="overflow-hidden cursor-pointer" onClick={() => setOpenQuiz(openQuiz === i ? null : i)}>
                  <div className="p-5 flex items-center justify-between">
                    <span className="text-white font-bold pr-4">{opt.label}</span>
                    <motion.div animate={{ rotate: openQuiz === i ? 180 : 0 }} transition={spring}><CaretDown size={20} className="text-slate-400 shrink-0" /></motion.div>
                  </div>
                  <AnimatePresence initial={false}>
                    {openQuiz === i && (
                      <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} transition={spring} className="overflow-hidden">
                        <div className="px-5 pb-5 border-t border-white/8 pt-4">
                          <p className="text-slate-300 text-sm leading-relaxed mb-3">{opt.rec}</p>
                          <div className="flex items-center gap-4">
                            <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: `${GOLD}22`, color: GOLD_LIGHT }}>{opt.badge}</span>
                            <MagneticButton className="text-sm font-bold text-white px-5 py-2 rounded-full cursor-pointer" style={{ background: RED }}>Claim Free Class</MagneticButton>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </GlassCard>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ─── MARTIAL ARTS BENEFITS ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GOLD }}>Transform Your Life</p>
            <h2 className="text-4xl md:text-5xl font-black text-white">Why Martial Arts Changes <span style={{ color: GOLD_LIGHT }}>Everything</span></h2>
            <p className="text-slate-400 mt-4 max-w-2xl mx-auto">Martial arts isn't just about fighting — it's about becoming a better version of yourself in every area of life.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: "💪", title: "Physical Fitness", desc: "Build functional strength, flexibility, coordination, and cardiovascular endurance through real movement — not machines.", badge: "Body" },
              { icon: "🧠", title: "Mental Clarity", desc: "The focus required to learn technique quiets mental noise. Students consistently report better sleep, less anxiety, and sharper concentration.", badge: "Mind" },
              { icon: "🛡️", title: "Real Self-Defense", desc: "Our curriculum is tested in real scenarios. You'll learn to handle confrontation confidently and defuse situations before they escalate.", badge: "Safety" },
              { icon: "🎯", title: "Goal Setting", desc: "Belt ranks give you a tangible progression system. Every stripe and promotion builds the habit of setting and achieving goals under pressure.", badge: "Growth" },
              { icon: "👨‍👩‍👧", title: "Family Bonding", desc: "Many of our students train with siblings, parents, or spouses. Shared training creates shared language and trust that extends beyond the dojo.", badge: "Community" },
              { icon: "🏆", title: "Competitive Edge", desc: "For those who want to compete, our tournament team prepares you to perform under pressure — a skill that transfers to school, work, and life.", badge: "Competition" },
            ].map((item, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="p-6 h-full">
                  <div className="text-3xl mb-3">{item.icon}</div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-bold text-white">{item.title}</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: `${GOLD}22`, color: GOLD_LIGHT }}>{item.badge}</span>
                  </div>
                  <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ─── DOJO PHILOSOPHY ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-4 md:px-6">
          <GlassCard className="p-8 md:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div>
                <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GOLD }}>Our Philosophy</p>
                <h2 className="text-4xl md:text-5xl font-black text-white mb-6">The Dragon's Gate Way</h2>
                <p className="text-slate-400 leading-relaxed mb-6">We teach traditional values within modern training methods. Respect, discipline, and perseverance aren't just words — they're practiced in every drill, every spar, and every bow.</p>
                <div className="space-y-4">
                  {[
                    ["礼 (Rei)", "Respect — for yourself, your partners, and the art"],
                    ["忍 (Nin)", "Perseverance — push through when it's hard"],
                    ["誠 (Makoto)", "Sincerity — honest effort in every session"],
                    ["剛 (Gō)", "Strength — physical and mental, built through training"],
                  ].map(([jp, en], i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="text-lg font-bold shrink-0" style={{ color: GOLD }}>{jp}</span>
                      <p className="text-slate-300 text-sm">{en}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-center">
                <div className="text-8xl mb-4" style={{ color: RED, opacity: 0.6 }}>龍</div>
                <p className="text-slate-400 text-sm">Dragon — strength, wisdom, and mastery</p>
                <div className="mt-6 flex flex-col gap-3">
                  <div className="flex justify-between text-sm"><span className="text-slate-400">Years in Seattle</span><span className="text-white font-bold" style={{ color: GOLD_LIGHT }}>18+</span></div>
                  <div className="flex justify-between text-sm"><span className="text-slate-400">Students Trained</span><span className="text-white font-bold" style={{ color: GOLD_LIGHT }}>2,000+</span></div>
                  <div className="flex justify-between text-sm"><span className="text-slate-400">Black Belts Awarded</span><span className="text-white font-bold" style={{ color: GOLD_LIGHT }}>140+</span></div>
                  <div className="flex justify-between text-sm"><span className="text-slate-400">Tournament Medals</span><span className="text-white font-bold" style={{ color: GOLD_LIGHT }}>380+</span></div>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </SectionReveal>

      {/* ─── CERTIFICATIONS ─── */}
      <SectionReveal className="relative z-10 py-12 md:py-16">
        <div className="mx-auto max-w-5xl px-4 md:px-6 text-center">
          <p className="text-sm uppercase tracking-widest mb-6 text-slate-400">Certified, Safe & Competition-Ready</p>
          <div className="flex flex-wrap justify-center gap-3">
            {["USMAF Certified", "USA Taekwondo Affiliated", "IBJJF Registered", "WA State Licensed", "Background-Checked Instructors", "Safe Sport Certified"].map(badge => (
              <span key={badge} className="border text-xs font-semibold px-4 py-2 rounded-full" style={{ borderColor: `${GOLD}50`, background: `${GOLD}15`, color: GOLD_LIGHT }}>{badge}</span>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ─── SERVICE AREA ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GOLD }}>Our Community</p>
            <h2 className="text-4xl md:text-5xl font-black text-white">Training Seattle's <span style={{ color: GOLD_LIGHT }}>Warriors</span> Citywide</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {["Fremont", "Wallingford", "Green Lake", "Roosevelt", "University District", "Ravenna", "Capitol Hill", "First Hill"].map(neighborhood => (
              <GlassCard key={neighborhood} className="p-4 text-center">
                <motion.div className="w-2 h-2 rounded-full mx-auto mb-2" style={{ background: RED_LIGHT }} animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 2, repeat: Infinity }} />
                <p className="text-sm font-bold text-white">{neighborhood}</p>
                <p className="text-xs mt-1" style={{ color: GOLD }}>Active Members</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ─── FREE TRIAL CTA ─── */}
      <SectionReveal id="trial" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4 md:px-6">
          <ShimmerBorder>
            <div className="p-8 md:p-12 text-center">
              <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={spring}>
                <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GOLD }}>Your Journey Starts Here</p>
                <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-black text-white mb-4">Free Trial Class</h2>
                <p className="text-slate-400 text-lg mb-8 max-w-lg mx-auto">No experience needed. No commitment required. Come see what martial arts can do for you or your child. Your first class is completely free.</p>
                <div className="flex flex-wrap justify-center gap-4">
                  <MagneticButton className="px-10 py-4 rounded-full text-base font-bold text-white inline-flex items-center gap-2 cursor-pointer" style={{ background: RED }}>
                    <Fire size={20} weight="duotone" /> Claim Free Class
                  </MagneticButton>
                  <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/15 inline-flex items-center gap-2 cursor-pointer">
                    <Phone size={18} weight="duotone" /> Call Us
                  </MagneticButton>
                </div>
              </motion.div>
            </div>
          </ShimmerBorder>
        </div>
      </SectionReveal>

      {/* ─── CONTACT ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-black text-white mb-6">
                <WordReveal text="Begin Your Training" />
              </h2>
              <p className="text-slate-400 leading-relaxed max-w-md mb-8">
                Visit our dojo, meet our instructors, and experience a class firsthand. The hardest part is walking through the door. We will handle the rest.
              </p>
              <MagneticButton className="px-10 py-4 rounded-full text-base font-bold text-white inline-flex items-center gap-2 cursor-pointer" style={{ background: RED }}>
                <CalendarCheck size={20} weight="duotone" /> Book Visit
              </MagneticButton>
            </div>
            <GlassCard className="p-8">
              <h3 className="text-xl font-bold text-white mb-6">Visit the Dojo</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <MapPin size={20} weight="duotone" style={{ color: RED_LIGHT }} className="mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-white">Location</p>
                    <p className="text-sm text-slate-400">4821 Stone Way N, Suite 201<br />Seattle, WA 98103</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Phone size={20} weight="duotone" style={{ color: RED_LIGHT }} className="mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-white">Phone</p>
                    <p className="text-sm text-slate-400">(206) 741-8520</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Clock size={20} weight="duotone" style={{ color: RED_LIGHT }} className="mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-white">Hours</p>
                    <p className="text-sm text-slate-400">Monday - Friday: 6:00 AM - 9:00 PM<br />Saturday: 8:00 AM - 2:00 PM<br />Sunday: Closed</p>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </SectionReveal>

      {/* ─── FOOTER ─── */}
      <footer className="relative z-10 border-t border-white/8 py-8">
        <div className="mx-auto max-w-7xl px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <HandFist size={16} weight="duotone" style={{ color: RED_LIGHT }} />
            <span>Iron Dragon Dojo &copy; {new Date().getFullYear()}</span>
          </div>
          <p className="text-xs text-slate-600 flex items-center gap-1.5"><svg width="14" height="14" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-sky-500"><path d="M24.3 4.2c-1.5-.4-3.2.1-4.5 1.1-1-.7-2.3-1-3.5-.8-2.4.4-4.2 2.5-4.2 4.9v.6c-3.2.8-6 2.8-7.8 5.6-.3.5-.1 1.1.4 1.4.5.3 1.1.1 1.4-.4 1.5-2.3 3.7-4 6.3-4.7.5-.1 1-.1 1.5 0 .8.2 1.4.8 1.7 1.5.3.8.2 1.6-.2 2.3l-2.8 4.3c-.6.9-.4 2.1.4 2.8l2.5 2.1c.4.3.8.5 1.3.5h5.2c.5 0 1-.2 1.3-.5l1.2-1c.6-.5.8-1.3.6-2l-1-3.2c-.2-.5 0-1.1.4-1.4l3.8-2.5c1.3-.9 2.1-2.3 2.1-3.9V9.6c0-2.5-1.7-4.7-4.1-5.3v-.1z" fill="currentColor"/></svg>Created by <a href="https://bluejayportfolio.com" target="_blank" rel="noopener noreferrer" style={{textDecoration:"underline"}}>bluejayportfolio.com</a></p>
        </div>
      </footer>
    </main>
  );
}
