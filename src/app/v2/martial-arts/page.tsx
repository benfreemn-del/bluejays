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
  return <div className={`rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] ${className}`}>{children}</div>;
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
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/10 flex items-center gap-2 cursor-pointer">
                <Phone size={18} weight="duotone" /> (555) 741-8520
              </MagneticButton>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ ...spring, delay: 0.95 }} className="flex flex-wrap gap-3">
              <span className="px-4 py-2 rounded-full text-xs font-semibold text-white flex items-center gap-2" style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${RED}50` }}><Trophy size={14} weight="duotone" style={{ color: GOLD_LIGHT }} />Certified Black Belts</span>
              <span className="px-4 py-2 rounded-full text-xs font-semibold text-white flex items-center gap-2" style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${GOLD}50` }}><Star size={14} weight="fill" style={{ color: GOLD_LIGHT }} />4.9-Star Rated</span>
              <span className="px-4 py-2 rounded-full text-xs font-semibold text-white flex items-center gap-2" style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${RED}50` }}><CheckCircle size={14} weight="duotone" style={{ color: RED_LIGHT }} />Free Trial Week</span>
              <span className="px-4 py-2 rounded-full text-xs font-semibold text-white flex items-center gap-2" style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${GOLD}50` }}><ShieldCheck size={14} weight="duotone" style={{ color: GOLD_LIGHT }} />All Ages Welcome</span>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ ...spring, delay: 1 }} className="flex flex-wrap gap-6 text-sm text-slate-400">
              <span className="flex items-center gap-2"><MapPin size={16} weight="duotone" style={{ color: RED_LIGHT }} />1200 Dragon Way</span>
              <span className="flex items-center gap-2"><Clock size={16} weight="duotone" style={{ color: RED_LIGHT }} />Mon-Sat 6am-9pm</span>
            </motion.div>
          </div>
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ ...spring, delay: 0.3 }} className="hidden md:flex items-center justify-center lg:justify-end">
            <FistEnergySVG />
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

      {/* ─── GOOGLE REVIEWS HEADER ─── */}
      <SectionReveal className="relative z-10 py-8">
        <div className="mx-auto max-w-4xl px-4 md:px-6">
          <GlassCard className="px-6 py-5 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
            <div className="flex items-center gap-3">
              <svg width="32" height="32" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
              </svg>
              <div className="text-left">
                <p className="text-sm text-slate-400">Google Reviews</p>
                <p className="text-lg font-bold text-white">Verified Student Ratings</p>
              </div>
            </div>
            <div className="hidden sm:block w-px h-12 bg-white/10" />
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                {[0,1,2,3,4].map((i) => (<Star key={i} size={20} weight="fill" style={{ color: GOLD_LIGHT }} />))}
              </div>
              <p className="text-sm text-slate-400"><span className="text-white font-bold">4.9</span> out of 5 &bull; <span className="text-white font-bold">198</span> reviews</p>
            </div>
          </GlassCard>
        </div>
      </SectionReveal>

      {/* ─── TESTIMONIALS ─── */}
      <SectionReveal id="testimonials" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GOLD }}>Student Stories</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-black text-white">
              <WordReveal text="Transformed Lives" />
            </h2>
          </div>
          <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {testimonials.map((t, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="p-6 h-full flex flex-col relative overflow-hidden">
                  <Quotes size={60} weight="fill" style={{ color: RED_LIGHT }} className="absolute -top-2 -right-2 opacity-10" />
                  <Quotes size={28} weight="fill" style={{ color: RED_LIGHT }} className="mb-3 opacity-60" />
                  <p className="text-slate-300 leading-relaxed flex-1 text-sm">{t.text}</p>
                  <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{t.name}</span>
                      <CheckCircle size={14} weight="fill" style={{ color: GOLD }} />
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider">Verified</span>
                    </div>
                    <div className="flex gap-0.5">{Array.from({ length: t.rating }).map((_, j) => (<Star key={j} size={18} weight="fill" style={{ color: GOLD_LIGHT }} />))}</div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── MEMBERSHIP PRICING ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 60% 40% at 50% 50%, ${RED_GLOW} 0%, transparent 70%)` }} />
        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GOLD }}>Membership</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-black text-white"><WordReveal text="Training Plans For Every Student" /></h2>
            <p className="text-slate-400 mt-4 max-w-2xl mx-auto">Month-to-month or save with annual. Free trial week included with every new enrollment.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "Kids (4–12)", price: "$149", desc: "Structured kids program with belt progression, focus, and confidence building.", features: ["2 classes per week", "Belt testing included", "Uniform at signup", "Birthday party discount"], highlight: false },
              { name: "Unlimited Adult", price: "$199", desc: "Unlimited access to BJJ, Muay Thai, and all conditioning classes. Most popular.", features: ["Unlimited daily classes", "All disciplines included", "Open mat access", "Guest pass monthly", "Seminar discounts"], highlight: true },
              { name: "Family Plan", price: "$349", desc: "Train as a family — up to 4 members. Great for parents and kids training together.", features: ["Up to 4 members", "All classes unlimited", "Family locker access", "Private lesson credits", "First uniform free per member"], highlight: false },
            ].map((tier, i) => (
              <div key={i} className={`relative rounded-2xl ${tier.highlight ? 'p-[2px]' : ''}`} style={tier.highlight ? { background: `linear-gradient(135deg, ${RED}, ${GOLD})` } : {}}>
                {tier.highlight && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-white" style={{ background: RED }}>Most Popular</div>}
                <GlassCard className="p-6 h-full">
                  <h3 className="text-xl font-black text-white">{tier.name}</h3>
                  <p className="text-xs text-slate-400 mt-1">{tier.desc}</p>
                  <div className="mt-6 flex items-end gap-1">
                    <span className="text-5xl font-black text-white">{tier.price}</span>
                    <span className="text-sm text-slate-400 mb-2">/mo</span>
                  </div>
                  <ul className="mt-6 space-y-3">
                    {tier.features.map((f, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-slate-300">
                        <CheckCircle size={18} weight="fill" style={{ color: tier.highlight ? GOLD : RED_LIGHT }} className="shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <button className="mt-6 w-full px-6 py-3 rounded-full text-sm font-bold text-white" style={{ background: tier.highlight ? RED : "rgba(255,255,255,0.05)", border: tier.highlight ? "none" : "1px solid rgba(255,255,255,0.1)" }}>Start Free Week</button>
                </GlassCard>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-slate-500 mt-8">Save 15% with annual prepay. Military, first responders, and teachers save an additional 10%.</p>
        </div>
      </SectionReveal>

      {/* ─── VIDEO PLACEHOLDER ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GOLD }}>Inside The Dojo</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-black text-white"><WordReveal text="Watch A Class In Action" /></h2>
          </div>
          <div className="relative rounded-2xl overflow-hidden aspect-video group cursor-pointer">
            <img src="https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=1600&q=80" alt="Martial arts training session" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div className="w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center shadow-2xl" style={{ background: RED } as React.CSSProperties} animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
                <svg width="28" height="32" viewBox="0 0 24 28" fill="white" className="ml-1">
                  <path d="M0 0L24 14L0 28Z" />
                </svg>
              </motion.div>
            </div>
            <div className="absolute bottom-6 left-6 right-6">
              <p className="text-xs uppercase tracking-widest" style={{ color: GOLD_LIGHT }}>BJJ + Muay Thai Class &bull; 4:22</p>
              <p className="text-xl md:text-2xl font-black text-white mt-1">Real footage from a typical week — kids program, beginner classes, and competition team.</p>
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* ─── QUIZ ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="relative z-10 mx-auto max-w-5xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GOLD }}>Start Here</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-black text-white"><WordReveal text="Which Program Fits You?" /></h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { color: GOLD, label: "Kids 4–12", detail: "Focus, confidence, anti-bullying, and discipline. Belt progression keeps kids engaged.", rec: "Little Tigers / Junior Grapplers", icon: Trophy },
              { color: RED_LIGHT, label: "Fitness Adults", detail: "Get in the best shape of your life while learning real self-defense and technique.", rec: "Unlimited Adult BJJ + Muay Thai", icon: ShieldCheck },
              { color: GOLD_LIGHT, label: "Competitors", detail: "Ready to test your skills on the mat or in the cage. Competition team training.", rec: "Competition Team Tryout", icon: Star },
            ].map((opt, i) => (
              <GlassCard key={i} className="p-6 h-full flex flex-col items-start relative overflow-hidden group cursor-pointer">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: `radial-gradient(circle at 50% 0%, ${opt.color}22, transparent 60%)` }} />
                <div className="relative w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: `${opt.color}22` }}>
                  <opt.icon size={22} weight="duotone" style={{ color: opt.color }} />
                </div>
                <p className="relative text-xs uppercase tracking-widest font-black" style={{ color: opt.color }}>{opt.label}</p>
                <p className="relative text-sm text-slate-300 mt-2 leading-relaxed flex-1">{opt.detail}</p>
                <div className="relative mt-6 pt-4 border-t border-white/10 w-full">
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-1">Recommended</p>
                  <p className="text-sm font-bold text-white">{opt.rec}</p>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ─── COMPETITOR COMPARISON ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GOLD }}>The Difference</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-black text-white"><WordReveal text="Us vs. The Strip Mall Dojo" /></h2>
          </div>
          <GlassCard className="overflow-hidden">
            <div className="grid grid-cols-[1.5fr_1fr_1fr] items-center border-b border-white/10">
              <div className="p-4 md:p-6 text-xs uppercase tracking-widest text-slate-400">What Matters</div>
              <div className="p-4 md:p-6 text-center" style={{ background: `${RED}25` }}>
                <p className="text-sm md:text-base font-black" style={{ color: GOLD_LIGHT }}>Our Academy</p>
              </div>
              <div className="p-4 md:p-6 text-center">
                <p className="text-sm md:text-base font-bold text-slate-400">Franchise Dojo</p>
              </div>
            </div>
            {[
              { feature: "Multi-discipline curriculum", us: "BJJ + Muay Thai + Wrestling", them: "Single style" },
              { feature: "Competition-tested instructors", us: "Champion lineage", them: "Franchise training" },
              { feature: "Kids anti-bullying program", us: "Built in", them: "Add-on" },
              { feature: "No-contract month-to-month", us: "Always option", them: "Locked contracts" },
              { feature: "Free uniform at signup", us: "Included", them: "$60+" },
              { feature: "Family plan discount", us: "Up to 40% off", them: "Full price" },
              { feature: "Open mat / sparring nights", us: "Weekly", them: "Rarely" },
            ].map((row, i) => (
              <div key={i} className="grid grid-cols-[1.5fr_1fr_1fr] items-center border-b border-white/5 last:border-b-0">
                <div className="p-4 md:p-6 text-sm text-white">{row.feature}</div>
                <div className="p-4 md:p-6 text-center" style={{ background: `${GOLD}10` }}>
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle size={18} weight="fill" style={{ color: GOLD_LIGHT }} />
                    <span className="text-sm text-white font-bold hidden sm:inline">{row.us}</span>
                  </div>
                </div>
                <div className="p-4 md:p-6 text-center text-sm text-slate-500 italic">{row.them}</div>
              </div>
            ))}
          </GlassCard>
        </div>
      </SectionReveal>

      {/* ─── CERTIFICATIONS ─── */}
      <SectionReveal className="relative z-10 py-8">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <p className="text-center text-xs uppercase tracking-widest text-slate-500 mb-6">Lineage &amp; Credentials</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {[
              { label: "BJJ Black Belt", icon: Trophy },
              { label: "IBJJF Sanctioned", icon: ShieldCheck },
              { label: "Muay Thai Kru", icon: Star },
              { label: "USA Boxing Cert", icon: CheckCircle },
              { label: "SafeSport Certified", icon: ShieldCheck },
              { label: "CPR/First Aid", icon: CheckCircle },
            ].map((cert, i) => (
              <GlassCard key={i} className="px-4 py-3 flex items-center gap-2 justify-center">
                <cert.icon size={18} weight="duotone" style={{ color: i % 2 === 0 ? GOLD_LIGHT : RED_LIGHT }} />
                <span className="text-xs font-bold text-slate-300">{cert.label}</span>
              </GlassCard>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ─── SERVICE AREA ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GOLD }}>Train With Us</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-black text-white"><WordReveal text="Location & Availability" /></h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <GlassCard className="p-6 text-center">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: RED_GLOW }}>
                <MapPin size={26} weight="duotone" style={{ color: RED_LIGHT }} />
              </div>
              <p className="text-xs uppercase tracking-widest mb-2" style={{ color: GOLD_LIGHT }}>Location</p>
              <p className="text-xl font-black text-white">Dragon Way</p>
              <p className="text-sm text-slate-400 mt-2">Ground-floor studio with free parking, family viewing area, and showers on site.</p>
            </GlassCard>
            <GlassCard className="p-6 text-center">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: GOLD_GLOW }}>
                <Clock size={26} weight="duotone" style={{ color: GOLD_LIGHT }} />
              </div>
              <p className="text-xs uppercase tracking-widest mb-2" style={{ color: GOLD_LIGHT }}>Class Schedule</p>
              <p className="text-xl font-black text-white">30+ Per Week</p>
              <p className="text-sm text-slate-400 mt-2">Kids, teens, and adults — morning, noon, and evening. First class free any day.</p>
            </GlassCard>
            <GlassCard className="p-6 text-center">
              <div className="relative w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: RED_GLOW }}>
                <motion.div className="absolute inset-0 rounded-full" style={{ background: RED_LIGHT }} animate={{ scale: [1, 1.6, 1], opacity: [0.4, 0, 0.4] }} transition={{ duration: 2, repeat: Infinity }} />
                <CheckCircle size={26} weight="duotone" style={{ color: RED_LIGHT }} className="relative" />
              </div>
              <p className="text-xs uppercase tracking-widest mb-2" style={{ color: GOLD_LIGHT }}>Enrollment</p>
              <p className="text-xl font-black text-white">Now Enrolling</p>
              <p className="text-sm text-slate-400 mt-2">New student intro: free trial week + no commitment. Kids program has waitlist — secure your spot.</p>
            </GlassCard>
          </div>
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
                  <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/10 inline-flex items-center gap-2 cursor-pointer">
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
                    <p className="text-sm text-slate-400">1200 Dragon Way<br />Portland, OR 97205</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Phone size={20} weight="duotone" style={{ color: RED_LIGHT }} className="mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-white">Phone</p>
                    <p className="text-sm text-slate-400">(555) 741-8520</p>
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

      {/* ─── FINAL CTA ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-4 md:px-6">
          <GlassCard className="p-8 md:p-12 text-center">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GOLD }}>Free Trial Week</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-black text-white mb-4">Try Seven Days On Us</h2>
            <p className="text-slate-400 text-lg mb-8 max-w-lg mx-auto">Seven days, unlimited classes, zero commitment. Try every discipline, meet the instructors, and see if the academy is your fit.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <MagneticButton className="px-10 py-4 rounded-full text-base font-semibold text-white inline-flex items-center gap-2 cursor-pointer" style={{ background: RED }}>
                <CalendarCheck size={20} weight="duotone" /> Claim Free Week
              </MagneticButton>
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/10 inline-flex items-center gap-2 cursor-pointer">
                <Phone size={18} weight="duotone" /> Call The Dojo
              </MagneticButton>
            </div>
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              {[
                { label: "Active Students", value: "280+" },
                { label: "Black Belts Trained", value: "34" },
                { label: "Classes Per Week", value: "30+" },
                { label: "Years Open", value: "12" },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <p className="text-xs text-slate-500 uppercase tracking-widest">{stat.label}</p>
                  <p className="text-2xl font-black mt-1" style={{ color: GOLD_LIGHT }}>{stat.value}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </SectionReveal>

      {/* ─── BELT TIER EXPLAINER ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GOLD }}>The Journey</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-black text-white"><WordReveal text="From White Belt To Black Belt" /></h2>
            <p className="text-slate-400 mt-4 max-w-2xl mx-auto">Our structured curriculum guides students from day one through black belt. Every rank earned, not given.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              { belt: "White", color: "#f1f5f9", desc: "Fundamentals. Stance, basic strikes, first grappling positions." },
              { belt: "Blue", color: "#3b82f6", desc: "Intermediate techniques. Sparring introduction, drills under pressure." },
              { belt: "Purple", color: "#a855f7", desc: "Advanced applications. Competition prep, technical depth." },
              { belt: "Brown", color: "#92400e", desc: "Teaching readiness. Assistant instructor role, sharpening all techniques." },
              { belt: "Black", color: "#0a0a0a", desc: "Mastery + mentorship. Begin teaching, compete at advanced level, continued growth." },
              { belt: "Coral", color: "#f97316", desc: "15+ years post-black. Senior instructor and lifelong student. Rare honor." },
              { belt: "Red", color: "#dc2626", desc: "30+ years post-black. Grand master rank with demonstrated contribution to the art." },
              { belt: "Eternal", color: "#ca8a04", desc: "A lifetime of discipline, mentorship, and carrying the lineage forward." },
            ].map((belt, i) => (
              <GlassCard key={i} className="p-5">
                <div className="w-full h-3 rounded-full mb-4" style={{ background: belt.color, border: belt.color === "#f1f5f9" ? "1px solid rgba(255,255,255,0.2)" : "none" }} />
                <p className="text-xs uppercase tracking-widest font-black" style={{ color: GOLD_LIGHT }}>Rank {i + 1}</p>
                <p className="text-lg font-black text-white mt-1">{belt.belt} Belt</p>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">{belt.desc}</p>
              </GlassCard>
            ))}
          </div>
          <p className="text-center text-xs text-slate-500 mt-8">Most students earn a blue belt in 18 months, black belt in 8–10 years. Consistency beats intensity every time.</p>
        </div>
      </SectionReveal>

      {/* ─── DISCIPLINES OFFERED ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GOLD }}>What You'll Train</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-black text-white"><WordReveal text="Disciplines Under One Roof" /></h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: "Brazilian Jiu-Jitsu", desc: "Ground-focused grappling. Leverage over strength. Elite sparring with belt ranks." },
              { name: "Muay Thai", desc: "Stand-up striking with punches, kicks, knees, and elbows. Conditioning that transforms bodies." },
              { name: "MMA / Wrestling", desc: "Takedowns, clinch, and integrated fight game. Drill partners at every skill level." },
              { name: "Boxing", desc: "Pure Western boxing — footwork, head movement, and combinations for fitness or competition." },
              { name: "Kickboxing / Cardio", desc: "Bag-focused conditioning class. High-energy workouts without contact sparring." },
              { name: "Women's Self-Defense", desc: "Monthly free clinics + ongoing class. Real-world techniques, non-intimidating environment." },
              { name: "Yoga & Recovery", desc: "Stretch + mobility sessions pair perfectly with hard training. Included free with unlimited memberships." },
              { name: "Strength + Conditioning", desc: "Barbell + kettlebell classes specifically built for combat athletes and fitness enthusiasts." },
              { name: "Open Mat Nights", desc: "Weekly free drill and roll sessions with students from across the gym. No instructor, pure practice." },
            ].map((disc, i) => (
              <GlassCard key={i} className="p-6">
                <p className="text-xs uppercase tracking-widest font-black" style={{ color: GOLD_LIGHT }}>Discipline {i + 1}</p>
                <p className="text-xl font-black text-white mt-2">{disc.name}</p>
                <p className="text-sm text-slate-300 mt-3 leading-relaxed">{disc.desc}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ─── EXTENDED FAQ ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4 md:px-6">
          <div className="text-center mb-10">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GOLD }}>Parent + Student FAQ</p>
            <h2 className="text-3xl md:text-4xl tracking-tighter font-black text-white"><WordReveal text="Common Questions" /></h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { q: "Do I need experience to start?", a: "Zero experience required. Most students walk in with none — you will be paired with patient training partners and fundamentals classes." },
              { q: "What should I wear my first day?", a: "Athletic clothes and a water bottle. We provide a loaner gi on your free trial week." },
              { q: "Do you have kids-only classes?", a: "Yes — separate Little Tigers (4–7), Junior (8–12), and Teen classes. Kids never train with adults." },
              { q: "Do you do private lessons?", a: "Yes. 30-min and 60-min private sessions available with any instructor. Great for competitors and beginners alike." },
              { q: "What if I miss a class?", a: "No penalty — unlimited members can drop in anytime that fits. Part-time members get makeup classes within 30 days." },
              { q: "Can adults start too?", a: "Absolutely. About half our adult students start in their 30s–50s. It is never too late to get fit and learn real self-defense." },
              { q: "Do you compete?", a: "Yes — we have a competition team that trains 4x/week for BJJ, Muay Thai, and MMA events. Optional, but elite coaching is available for those who want it." },
              { q: "Is there a contract?", a: "No long contracts. Month-to-month and annual options with clear cancellation terms. You are always in control." },
              { q: "What is the age cutoff for kids?", a: "Little Tigers for ages 4–7, Junior for 8–12, Teen for 13–15. Adult classes start at 16. We keep age groups separate." },
              { q: "Can parents watch?", a: "Absolutely. The family lounge has full viewing of the main mat, plus Wi-Fi and coffee." },
              { q: "Do you offer military + first responder discounts?", a: "Yes — 10% off every membership tier with valid ID. Also applies to teachers and nurses." },
              { q: "What if I have an injury or limitation?", a: "Talk to our coaching team. We modify for prior injuries, chronic conditions, and limited mobility. Nobody is left out." },
              { q: "Do you sell gear?", a: "Pro shop on site with gis, rash guards, shorts, gloves, and mouthguards — members save 15%." },
              { q: "Do you host seminars + camps?", a: "Yes — monthly guest seminars with world champions, plus summer + winter camps for kids and adults." },
              { q: "What if I want to compete someday?", a: "Our competition team coaches take you from first match to regional and national tournaments." },
              { q: "How big are your classes?", a: "Adult classes average 15–25 students. Kids classes capped at 12 per coach for personal attention." },
              { q: "Do you have showers?", a: "Full locker rooms with showers, sauna, and secure lockers. Towel service available for premium members." },
            ].map((faq, i) => (
              <GlassCard key={i} className="p-5">
                <p className="text-sm font-bold text-white mb-2">{faq.q}</p>
                <p className="text-sm text-slate-400 leading-relaxed">{faq.a}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ─── FOOTER ─── */}
      <footer className="relative z-10 border-t border-white/5 py-8">
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
