"use client";

/* eslint-disable @next/next/no-img-element */

import { useState, useRef, useEffect, useCallback } from "react";
import {
  motion,
  useInView,
  useMotionValue,
  useSpring,
  AnimatePresence,
} from "framer-motion";
import {
  Barbell,
  Lightning,
  Users,
  Timer,
  ArrowRight,
  Phone,
  MapPin,
  Clock,
  Fire,
  PersonSimpleRun,
  Medal,
  X,
  List,
  Star,
  CheckCircle,
  XCircle,
  Play,
  Quotes,
  Heart,
  Trophy,
  Envelope,
  CalendarBlank,
  ArrowUp,
  Scales,
  CaretDown,
} from "@phosphor-icons/react";

/* ───────────────────────── SPRING / ANIMATION CONFIGS ───────────────────────── */
const spring = { type: "spring" as const, stiffness: 100, damping: 20 };
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: spring },
};
const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.6 } },
};
const scaleIn = {
  hidden: { opacity: 0, scale: 1.5 },
  show: { opacity: 1, scale: 1, transition: { ...spring, stiffness: 60 } },
};

/* ───────────────────────── COLORS ───────────────────────── */
const BLACK = "#0a0a0a";
const LIME = "#84cc16";
const LIME_DIM = "rgba(132, 204, 22, 0.15)";
const LIME_GLOW = "rgba(132, 204, 22, 0.25)";
const CARD_BG = "rgba(255,255,255,0.08)";
const CARD_BORDER = "rgba(255,255,255,0.06)";

/* ───────────────────────── DATA ───────────────────────── */
const MEMBERSHIP_TIERS = [
  {
    name: "Basic",
    price: 49,
    annual: 39,
    features: ["Full gym access", "Locker room", "Free parking", "Open 5am-10pm"],
    missing: ["Group classes", "Sauna & steam", "Personal training", "Nutrition coaching"],
    featured: false,
  },
  {
    name: "Premium",
    price: 89,
    annual: 69,
    features: ["Full gym access", "All group classes", "Sauna & steam room", "Towel service", "Free parking", "Guest passes (2/mo)"],
    missing: ["Personal training", "Nutrition coaching"],
    featured: true,
  },
  {
    name: "Elite",
    price: 129,
    annual: 99,
    features: ["Full gym access", "All group classes", "Sauna & steam room", "Towel service", "2x personal training/mo", "Nutrition coaching", "InBody scans", "Priority booking"],
    missing: [],
    featured: false,
  },
];

const SCHEDULE: Record<string, { morning: string; afternoon: string; evening: string }> = {
  Monday: { morning: "HIIT — 6:00am — Coach Marcus", afternoon: "Yoga — 12:00pm — Lena", evening: "Strength — 6:30pm — Dre" },
  Tuesday: { morning: "Spin — 6:00am — Priya", afternoon: "Boxing — 12:30pm — Dre", evening: "CrossFit — 6:30pm — Marcus" },
  Wednesday: { morning: "Strength — 6:00am — Dre", afternoon: "Yoga — 12:00pm — Lena", evening: "HIIT — 6:30pm — Marcus" },
  Thursday: { morning: "Boxing — 6:00am — Dre", afternoon: "Spin — 12:30pm — Priya", evening: "Yoga — 7:00pm — Lena" },
  Friday: { morning: "CrossFit — 6:00am — Marcus", afternoon: "HIIT — 12:00pm — Priya", evening: "Strength — 6:00pm — Dre" },
  Saturday: { morning: "Community WOD — 8:00am — All Coaches", afternoon: "Open Gym — 12:00pm", evening: "—" },
};

const PROGRAMS = [
  { title: "HIIT Training", desc: "30-minute explosive intervals that torch fat and build athleticism. No two classes are the same.", icon: Lightning, difficulty: "Advanced" },
  { title: "Strength & Power", desc: "Barbell-focused compound lifts with progressive overload. Squat, bench, deadlift, overhead.", icon: Barbell, difficulty: "Intermediate" },
  { title: "Olympic Lifting", desc: "Clean & jerk, snatch, and accessory work. Coached technique from the platform up.", icon: Trophy, difficulty: "Advanced" },
  { title: "Boxing & Kickboxing", desc: "Heavy bag work, pad drills, and footwork. Real technique — not cardio kickboxing.", icon: Fire, difficulty: "All Levels" },
  { title: "Yoga & Mobility", desc: "Active recovery, deep stretching, and breathwork. Essential for longevity in the gym.", icon: Heart, difficulty: "All Levels" },
  { title: "Personal Training", desc: "One-on-one coaching with a certified trainer. Custom programming, nutrition guidance, accountability.", icon: PersonSimpleRun, difficulty: "Custom" },
];

const TRANSFORMATIONS = [
  { name: "Jake", result: "Lost 47 lbs in 6 months", program: "HIIT + Nutrition Coaching", timeline: "6 months", stat: 47, suffix: "lbs lost", image: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=500&h=600&fit=crop" },
  { name: "Maria", result: "Gained 15 lbs of muscle", program: "Strength & Power", timeline: "8 months", stat: 15, suffix: "lbs gained", image: "https://images.unsplash.com/photo-1550345332-09e3ac987658?w=500&h=600&fit=crop" },
  { name: "Tom", result: "Marathon-ready in 16 weeks", program: "HIIT + Personal Training", timeline: "16 weeks", stat: 16, suffix: "weeks", image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=500&h=600&fit=crop" },
];

const TRAINERS = [
  { name: "Coach Dre Washington", specialty: "Strength & Powerlifting", cert: "CSCS, USA Weightlifting L2", years: 12, image: "https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=400&h=500&fit=crop" },
  { name: "Coach Priya Shah", specialty: "HIIT & Conditioning", cert: "NASM-CPT, CrossFit L2", years: 8, image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=500&fit=crop" },
  { name: "Lena Kowalski", specialty: "Yoga & Mobility", cert: "RYT-500, FMS", years: 10, image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=500&fit=crop" },
  { name: "Coach Dre Mitchell", specialty: "Boxing & Martial Arts", cert: "USA Boxing Coach, ACE-CPT", years: 14, image: "https://images.unsplash.com/photo-1517438322307-e67111335449?w=400&h=500&fit=crop" },
];

const TESTIMONIALS = [
  { text: "I have tried every gym in Seattle. Iron & Oak is the only one that stuck. The coaches actually know your name.", author: "Alex P.", years: "Member since 2022" },
  { text: "Marcus pushed me to my first pull-up at age 42. I cried. He almost did too.", author: "Diane K.", years: "Member since 2023" },
  { text: "Lost 30 lbs and gained confidence I did not know I was missing. This place changed my life.", author: "Chris M.", years: "Member since 2021" },
  { text: "The 6am crew is my family now. We hold each other accountable every single morning.", author: "Jordan & Sam T.", years: "Members since 2022" },
  { text: "I came for the free trial. That was 3 years ago. Best decision I ever made.", author: "Nina R.", years: "Member since 2021" },
];

const PILLARS = [
  { title: "Real Equipment, Not Machines", desc: "Barbells, dumbbells, kettlebells, rigs. We believe in free weights and functional movement — not seated machines that do the work for you." },
  { title: "Community, Not Crowds", desc: "Every class is capped at 16. You will never compete for a squat rack or feel lost in a sea of strangers." },
  { title: "Results, Not Gimmicks", desc: "No 30-day miracle programs. We use proven, progressive training methods that have worked for decades." },
  { title: "Coaches, Not Attendants", desc: "Every session is led by a certified coach who corrects your form, pushes your limits, and knows your goals." },
];

const COMPARISON_ROWS = [
  { feature: "Personal Coaching Every Class", us: true, them: false },
  { feature: "Capped Class Sizes (16 max)", us: true, them: false },
  { feature: "Free Weights Focus", us: true, them: false },
  { feature: "Nutrition Guidance Included", us: true, them: false },
  { feature: "Community Events & Challenges", us: true, them: false },
  { feature: "No Long-Term Contract", us: true, them: false },
  { feature: "Results Tracking & InBody Scans", us: true, them: false },
];

/* ───────────────────────── PARTICLES ───────────────────────── */
function Particles() {
  const [dots] = useState(() =>
    Array.from({ length: 24 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 8,
      dur: 6 + Math.random() * 8,
      size: 1 + Math.random() * 2,
      op: 0.1 + Math.random() * 0.2,
    }))
  );
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden hidden md:block">
      {dots.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{ left: `${p.x}%`, width: p.size, height: p.size, background: LIME, opacity: p.op }}
          animate={{ y: ["-10vh", "110vh"] }}
          transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: "linear" }}
        />
      ))}
    </div>
  );
}

/* ───────────────────────── COUNTER HOOK ───────────────────────── */
function useCounter(target: number, inView: boolean) {
  const motionVal = useMotionValue(0);
  const springVal = useSpring(motionVal, { stiffness: 40, damping: 20 });
  const [display, setDisplay] = useState(0);
  useEffect(() => { if (inView) motionVal.set(target); }, [inView, target, motionVal]);
  useEffect(() => {
    const unsub = springVal.on("change", (v) => setDisplay(Math.round(v)));
    return unsub;
  }, [springVal]);
  return display;
}

/* ───────────────────────── SECTION WRAPPER ───────────────────────── */
function Section({ children, className = "", id }: { children: React.ReactNode; className?: string; id?: string }) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.15 });
  return (
    <motion.section
      ref={ref}
      id={id}
      initial="hidden"
      animate={inView ? "show" : "hidden"}
      variants={stagger}
      className={`relative py-20 md:py-28 px-4 sm:px-6 lg:px-8 overflow-hidden ${className}`}
    >
      {children}
    </motion.section>
  );
}

/* ───────────────────────── SHIMMERBORDER ───────────────────────── */
function ShimmerBorder({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative rounded-2xl p-[1px] overflow-hidden ${className}`}>
      <motion.div
        className="absolute inset-0 rounded-2xl"
        style={{ background: `conic-gradient(from 0deg, transparent, ${LIME}, transparent, rgba(132,204,22,0.4), transparent)`, willChange: "transform" }}
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      />
      <div className="relative rounded-2xl z-10" style={{ background: "#0a0a0a" }}>{children}</div>
    </div>
  );
}

/* ───────────────────────── GLASS CARD ───────────────────────── */
function GlassCard({ children, className = "", featured = false }: { children: React.ReactNode; className?: string; featured?: boolean }) {
  return (
    <motion.div
      variants={fadeUp}
      className={`rounded-2xl p-6 md:p-8 backdrop-blur-sm transition-all duration-300 ${featured ? "border-2 ring-1" : "border"} ${className}`}
      style={{
        background: featured ? "rgba(132,204,22,0.06)" : CARD_BG,
        borderColor: featured ? LIME : CARD_BORDER,
        ...(featured ? { boxShadow: `0 0 40px ${LIME_DIM}`, ringColor: LIME_DIM } : {}),
      }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      {children}
    </motion.div>
  );
}

/* ───────────────────────── NAV ───────────────────────── */
function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);
  const links = ["Programs", "Schedule", "Pricing", "Results", "Trainers", "Contact"];
  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={spring}
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? "bg-black/90 backdrop-blur-md shadow-lg shadow-black/30" : "bg-transparent"}`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between h-16 md:h-20 px-4 sm:px-6">
        <a href="#" className="flex items-center gap-2">
          <Barbell size={28} weight="bold" style={{ color: LIME }} />
          <span className="font-black text-lg md:text-xl tracking-tight text-white">
            IRON<span style={{ color: LIME }}>&</span>OAK
          </span>
        </a>
        <div className="hidden md:flex items-center gap-6">
          {links.map((l) => (
            <a key={l} href={`#${l.toLowerCase()}`} className="text-sm font-semibold text-white/70 hover:text-white transition-colors uppercase tracking-wider">
              {l}
            </a>
          ))}
          <a href="#trial" className="ml-2 px-5 py-2.5 rounded-lg text-sm font-bold text-black transition-all hover:scale-105" style={{ background: LIME }}>
            Free Trial
          </a>
        </div>
        <button onClick={() => setOpen(!open)} className="md:hidden text-white" aria-label="Menu">
          {open ? <X size={28} weight="bold" /> : <List size={28} weight="bold" />}
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-black/95 backdrop-blur-md border-t border-white/8"
          >
            <div className="px-4 py-6 flex flex-col gap-4">
              {links.map((l) => (
                <a key={l} href={`#${l.toLowerCase()}`} onClick={() => setOpen(false)} className="text-white/80 font-semibold uppercase tracking-wider text-sm">
                  {l}
                </a>
              ))}
              <a href="#trial" onClick={() => setOpen(false)} className="mt-2 text-center px-5 py-3 rounded-lg font-bold text-black" style={{ background: LIME }}>
                Start Free Trial
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

const FITNESS_FAQS = [
  { q: "What's included in the free trial?", a: "Your free trial includes unlimited access for 7 days — every class, every piece of equipment, every amenity. No credit card required. Show up at the front desk, we'll set you up with a guest pass and give you a quick tour so you feel right at home." },
  { q: "Do I need to be in shape before I start?", a: "Absolutely not — Iron & Oak is for every fitness level. Our coaches scale every workout to meet you where you are. Whether you're a competitive athlete or haven't worked out in years, you'll get an experience designed for your current ability and goals." },
  { q: "What types of classes and programs do you offer?", a: "We offer HIIT, strength training, yoga, functional fitness, boxing fundamentals, and open gym hours. All classes run 45–60 minutes. Our weekly schedule has 30+ sessions to fit any schedule — early mornings, lunch, evenings, and weekends." },
  { q: "Do you offer personal training?", a: "Yes — certified personal trainers are available for one-on-one and semi-private sessions. Personal training is available as an add-on to any membership or as standalone packages. Your trainer will build a custom plan based on your goals, timeline, and injury history." },
  { q: "Is there a long-term contract?", a: "No contracts, ever. Our memberships are month-to-month and you can cancel anytime with 30 days notice. We believe in earning your business every month, not locking you in. Most members stay because they love the results — not because they have to." },
  { q: "What should I bring to my first workout?", a: "Just bring athletic clothes, cross-training shoes, and a water bottle. We provide fresh towels, shampoo, conditioner, and a secure locker. If you're doing a class for the first time, arrive 10 minutes early so your coach can introduce you to the movements." },
];

/* ═══════════════════════════════════════════════════════════════
   ██   MAIN PAGE
   ═══════════════════════════════════════════════════════════════ */
export default function IronAndOakFitness() {
  /* ── membership toggle ── */
  const [annual, setAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  /* ── BMI calculator ── */
  const [heightFt, setHeightFt] = useState(5);
  const [heightIn, setHeightIn] = useState(10);
  const [weightLbs, setWeightLbs] = useState(180);
  const totalInches = heightFt * 12 + heightIn;
  const bmi = totalInches > 0 ? ((weightLbs / (totalInches * totalInches)) * 703).toFixed(1) : "0";
  const bmiNum = parseFloat(bmi);
  const bmiCategory = bmiNum < 18.5 ? "Underweight" : bmiNum < 25 ? "Normal" : bmiNum < 30 ? "Overweight" : "Obese";
  const bmiColor = bmiNum < 18.5 ? "#60a5fa" : bmiNum < 25 ? LIME : bmiNum < 30 ? "#f59e0b" : "#ef4444";
  const bmiProgram = bmiNum < 18.5 ? "Strength & Power" : bmiNum < 25 ? "HIIT Training" : "Personal Training + Nutrition";

  /* ── schedule hover ── */
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);

  /* ── quiz ── */
  const [openQuiz, setOpenQuiz] = useState<number | null>(null);

  /* ── email capture ── */
  const [email, setEmail] = useState("");

  return (
    <main className="fit-v2 relative min-h-screen text-white overflow-x-hidden" style={{ background: BLACK }}>
      {/* grain overlay */}
      <div className="fixed inset-0 pointer-events-none z-[1] opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E\")", backgroundRepeat: "repeat", backgroundSize: "256px" }} />
      <Particles />
      <Nav />

      {/* ═══════════════════════════════════════════════════════════
         1. HERO — Full-bleed with massive outlined "STRONGER" text
         ═══════════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
        {/* bg photo */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920&h=1080&fit=crop"
            alt="Iron & Oak Fitness gym interior"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/70" />
          <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${BLACK} 0%, transparent 40%)` }} />
        </div>

        <div className="relative z-10 flex flex-col items-center text-center px-4 pt-24 pb-16 md:pb-24">
          {/* massive outlined STRONGER */}
          <motion.h1
            variants={scaleIn}
            initial="hidden"
            animate="show"
            className="font-black uppercase leading-[0.85] tracking-tighter select-none"
            style={{
              fontSize: "clamp(4rem, 18vw, 16rem)",
              WebkitTextStroke: "2px rgba(255,255,255,0.8)",
              WebkitTextFillColor: "transparent",
              textShadow: `0 0 80px ${LIME_DIM}`,
            }}
          >
            STRONGER
          </motion.h1>

          {/* solid "Every Day" */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, ...spring }}
            className="font-black text-3xl md:text-5xl lg:text-6xl uppercase tracking-tight text-white mt-2"
          >
            Every Day
          </motion.p>

          {/* subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-6 text-white/60 text-base md:text-lg max-w-xl leading-relaxed"
          >
            Seattle&apos;s premier strength and conditioning facility. Coached classes, real equipment, zero gimmicks.
          </motion.p>

          {/* CTA */}
          <motion.a
            href="#trial"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, ...spring }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="mt-8 inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base md:text-lg font-black uppercase tracking-wide text-black"
            style={{ background: LIME, boxShadow: `0 0 30px ${LIME_DIM}` }}
          >
            Start Your Free 7-Day Trial <ArrowRight size={20} weight="bold" />
          </motion.a>

          {/* trust pills */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3 }}
            className="mt-8 flex flex-wrap justify-center gap-3"
          >
            {["No Contracts", "Cancel Anytime", "First Class Free"].map((pill) => (
              <span key={pill} className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border" style={{ borderColor: "rgba(132,204,22,0.3)", color: LIME, background: "rgba(132,204,22,0.08)" }}>
                {pill}
              </span>
            ))}
          </motion.div>
        </div>

        {/* scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        >
          <div className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center pt-2">
            <div className="w-1.5 h-2.5 rounded-full" style={{ background: LIME }} />
          </div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
         STATS TRUST BAR
         ═══════════════════════════════════════════════════════════ */}
      <section className="relative z-10 py-8 border-y border-white/[0.10]" style={{ background: "rgba(132,204,22,0.03)" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: "Active Members", value: 850, suffix: "+" },
              { label: "Weekly Classes", value: 42, suffix: "" },
              { label: "Certified Coaches", value: 8, suffix: "" },
              { label: "Years Strong", value: 10, suffix: "" },
            ].map((stat) => {
              const ref = useRef<HTMLDivElement>(null);
              const inView = useInView(ref, { once: true, amount: 0.5 });
              const count = useCounter(stat.value, inView);
              return (
                <div ref={ref} key={stat.label} className="text-center">
                  <p className="text-3xl md:text-4xl font-black" style={{ color: LIME }}>
                    {count}{stat.suffix}
                  </p>
                  <p className="text-xs font-bold uppercase tracking-wider text-white/40 mt-1">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
         2. MEMBERSHIP TIERS
         ═══════════════════════════════════════════════════════════ */}
      <Section id="pricing">
        <div className="max-w-6xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-12">
            <p className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: LIME }}>Membership</p>
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight">Choose Your <span style={{ color: LIME }}>Level</span></h2>
          </motion.div>

          {/* toggle */}
          <motion.div variants={fadeUp} className="flex justify-center mb-10">
            <div className="flex items-center gap-4 p-1 rounded-full border border-white/15 bg-white/[0.08]">
              <button onClick={() => setAnnual(false)} className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${!annual ? "text-black" : "text-white/50"}`} style={!annual ? { background: LIME } : {}}>
                Monthly
              </button>
              <button onClick={() => setAnnual(true)} className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${annual ? "text-black" : "text-white/50"}`} style={annual ? { background: LIME } : {}}>
                Annual <span className="text-xs ml-1 opacity-70">Save 20%</span>
              </button>
            </div>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {MEMBERSHIP_TIERS.map((tier) => {
              const cardContent = (
                <GlassCard key={tier.name} featured={tier.featured} className={tier.featured ? "md:-mt-4 md:mb-0 h-full" : "h-full"}>
                  {tier.featured && (
                    <div className="text-center mb-4">
                      <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider text-black" style={{ background: LIME }}>Most Popular</span>
                    </div>
                  )}
                  <h3 className="text-xl font-black uppercase tracking-wide text-white">{tier.name}</h3>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-4xl md:text-5xl font-black" style={{ color: LIME }}>${annual ? tier.annual : tier.price}</span>
                    <span className="text-white/40 text-sm">/mo</span>
                  </div>
                  {annual && (
                    <p className="text-xs mt-1" style={{ color: LIME }}>Billed annually &middot; Save ${(tier.price - tier.annual) * 12}/yr</p>
                  )}
                  <ul className="mt-6 space-y-3">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-white/80">
                        <CheckCircle size={16} weight="fill" style={{ color: LIME, flexShrink: 0 }} /> {f}
                      </li>
                    ))}
                    {tier.missing.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-white/30">
                        <XCircle size={16} weight="fill" className="text-white/20 flex-shrink-0" /> {f}
                      </li>
                    ))}
                  </ul>
                  <a href="#trial" className={`mt-8 block text-center px-6 py-3 rounded-xl font-bold uppercase text-sm tracking-wide transition-all hover:scale-105 ${tier.featured ? "text-black" : "text-white border border-white/20 hover:border-white/40"}`} style={tier.featured ? { background: LIME } : {}}>
                    {tier.featured ? "Start Free Trial" : "Get Started"}
                  </a>
                </GlassCard>
              );
              return tier.featured ? (
                <ShimmerBorder key={tier.name} className="md:-mt-4">{cardContent}</ShimmerBorder>
              ) : (
                <div key={tier.name}>{cardContent}</div>
              );
            })}
          </div>
        </div>

        {/* bg glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none" style={{ background: `radial-gradient(circle, ${LIME_DIM} 0%, transparent 70%)` }} />
      </Section>

      {/* ═══════════════════════════════════════════════════════════
         3. CLASS SCHEDULE
         ═══════════════════════════════════════════════════════════ */}
      <Section id="schedule">
        <div className="max-w-6xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-12">
            <p className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: LIME }}>Weekly Schedule</p>
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight">Class <span style={{ color: LIME }}>Schedule</span></h2>
          </motion.div>

          <motion.div variants={fadeUp} className="overflow-x-auto">
            <table className="w-full min-w-[700px] border-collapse">
              <thead>
                <tr>
                  <th className="text-left text-xs font-bold uppercase tracking-wider text-white/40 pb-4 pr-4">Day</th>
                  {["Morning", "Afternoon", "Evening"].map((t) => (
                    <th key={t} className="text-left text-xs font-bold uppercase tracking-wider pb-4 px-2" style={{ color: LIME }}>{t}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(SCHEDULE).map(([day, slots]) => (
                  <tr key={day} className="border-t border-white/[0.10]">
                    <td className="py-4 pr-4 font-bold text-sm text-white uppercase tracking-wide">{day}</td>
                    {(["morning", "afternoon", "evening"] as const).map((slot) => {
                      const cellId = `${day}-${slot}`;
                      const val = slots[slot];
                      return (
                        <td
                          key={slot}
                          className="py-4 px-2"
                          onMouseEnter={() => setHoveredCell(cellId)}
                          onMouseLeave={() => setHoveredCell(null)}
                        >
                          <div
                            className="rounded-lg px-3 py-2 text-xs font-medium transition-all duration-200 cursor-default"
                            style={{
                              background: hoveredCell === cellId ? LIME_DIM : "rgba(255,255,255,0.06)",
                              border: `1px solid ${hoveredCell === cellId ? LIME : "rgba(255,255,255,0.06)"}`,
                              color: val === "—" ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.7)",
                            }}
                          >
                            {val}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════════════════
         4. PROGRAMS
         ═══════════════════════════════════════════════════════════ */}
      <Section id="programs">
        <div className="max-w-6xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-12">
            <p className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: LIME }}>Training</p>
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight">Our <span style={{ color: LIME }}>Programs</span></h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {PROGRAMS.map((p) => (
              <GlassCard key={p.title}>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: LIME_DIM }}>
                    <p.icon size={24} weight="bold" style={{ color: LIME }} />
                  </div>
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border" style={{ borderColor: "rgba(132,204,22,0.3)", color: LIME }}>
                    {p.difficulty}
                  </span>
                </div>
                <h3 className="text-lg font-black uppercase tracking-wide text-white">{p.title}</h3>
                <p className="mt-2 text-sm text-white/50 leading-relaxed">{p.desc}</p>
              </GlassCard>
            ))}
          </div>
        </div>
        {/* subtle bg pattern */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full pointer-events-none" style={{ background: `radial-gradient(circle, ${LIME_DIM} 0%, transparent 70%)`, filter: "blur(80px)" }} />
      </Section>

      {/* ═══════════════════════════════════════════════════════════
         5. TRANSFORMATION GALLERY
         ═══════════════════════════════════════════════════════════ */}
      <Section id="results">
        <div className="max-w-6xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-12">
            <p className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: LIME }}>Proof</p>
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight">Real <span style={{ color: LIME }}>Results</span></h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {TRANSFORMATIONS.map((t) => {
              const ref = useRef<HTMLDivElement>(null);
              const inView = useInView(ref, { once: true, amount: 0.5 });
              const count = useCounter(t.stat, inView);
              return (
                <GlassCard key={t.name}>
                  <div ref={ref}>
                    <img src={t.image} alt={t.name} className="w-full h-48 object-cover object-top rounded-xl mb-4" />
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-4xl font-black" style={{ color: LIME }}>{count}</span>
                      <span className="text-sm font-bold text-white/50 uppercase">{t.suffix}</span>
                    </div>
                    <h3 className="text-lg font-black uppercase text-white">{t.name}</h3>
                    <p className="text-sm text-white/50 mt-1">{t.result}</p>
                    <div className="mt-4 flex items-center gap-4 text-xs text-white/40">
                      <span className="flex items-center gap-1"><Timer size={14} /> {t.timeline}</span>
                      <span className="flex items-center gap-1"><Lightning size={14} /> {t.program}</span>
                    </div>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════════════════
         6. MEET COACH MARCUS
         ═══════════════════════════════════════════════════════════ */}
      <Section>
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <motion.div variants={fadeUp}>
              <img
                src="https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=700&h=800&fit=crop"
                alt="Coach Marcus Reed"
                className="w-full h-[500px] object-cover object-top rounded-2xl"
                style={{ border: `2px solid ${CARD_BORDER}` }}
              />
            </motion.div>
            <motion.div variants={fadeUp}>
              <p className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: LIME }}>Founder</p>
              <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight">Coach Marcus <span style={{ color: LIME }}>Reed</span></h2>
              <p className="mt-6 text-white/60 leading-relaxed">
                Former University of Washington linebacker turned NASM-certified personal trainer. Marcus founded Iron & Oak in 2016 with one squat rack, three clients, and a philosophy that still drives every session today.
              </p>
              <p className="mt-4 text-white/60 leading-relaxed">
                10 years of coaching. Thousands of athletes, weekend warriors, and first-timers transformed. His approach is simple but uncompromising.
              </p>
              <blockquote className="mt-6 pl-4 py-2 text-lg font-bold italic text-white/90" style={{ borderLeft: `3px solid ${LIME}` }}>
                &ldquo;I don&apos;t believe in shortcuts. I believe in showing up.&rdquo;
              </blockquote>
              <div className="mt-6 flex flex-wrap gap-3">
                {["NASM-CPT", "D1 Athlete", "10+ Years", "1,500+ Clients"].map((b) => (
                  <span key={b} className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border" style={{ borderColor: CARD_BORDER, color: "rgba(255,255,255,0.6)" }}>
                    {b}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════════════════
         7. TRAINERS
         ═══════════════════════════════════════════════════════════ */}
      <Section id="trainers">
        <div className="max-w-6xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-12">
            <p className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: LIME }}>The Team</p>
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight">Our <span style={{ color: LIME }}>Coaches</span></h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TRAINERS.map((t) => (
              <GlassCard key={t.name}>
                <img src={t.image} alt={t.name} className="w-full h-56 object-cover object-top rounded-xl mb-4" />
                <h3 className="text-base font-black uppercase tracking-wide text-white">{t.name}</h3>
                <p className="text-sm mt-1" style={{ color: LIME }}>{t.specialty}</p>
                <p className="text-xs text-white/40 mt-2">{t.cert}</p>
                <p className="text-xs text-white/40">{t.years} years coaching</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════════════════
         8. WHY IRON & OAK
         ═══════════════════════════════════════════════════════════ */}
      <Section>
        <div className="max-w-6xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-12">
            <p className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: LIME }}>Philosophy</p>
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight">Why <span style={{ color: LIME }}>Iron & Oak</span></h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 gap-6">
            {PILLARS.map((p, i) => (
              <GlassCard key={p.title}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black" style={{ background: LIME, color: BLACK }}>
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <h3 className="text-base font-black uppercase tracking-wide text-white">{p.title}</h3>
                </div>
                <p className="text-sm text-white/50 leading-relaxed">{p.desc}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════════════════
         9. TESTIMONIALS — Vertical Timeline
         ═══════════════════════════════════════════════════════════ */}
      <Section>
        <div className="max-w-3xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-6">
            <p className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: LIME }}>Community</p>
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight">Member <span style={{ color: LIME }}>Stories</span></h2>
          </motion.div>

          {/* Google reviews header */}
          <motion.div variants={fadeUp} className="flex items-center justify-center gap-3 mb-14">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={20} weight="fill" style={{ color: LIME }} />
              ))}
            </div>
            <span className="text-sm font-bold text-white">4.9</span>
            <span className="text-sm text-white/40">from 127 Google Reviews</span>
          </motion.div>

          {/* timeline */}
          <div className="relative">
            {/* vertical line */}
            <div className="absolute left-4 md:left-6 top-0 bottom-0 w-px" style={{ background: `linear-gradient(to bottom, transparent, ${LIME}, transparent)` }} />

            <div className="space-y-8">
              {TESTIMONIALS.map((t, i) => {
                const ref = useRef<HTMLDivElement>(null);
                const inView = useInView(ref, { once: true, amount: 0.4 });
                return (
                  <motion.div
                    ref={ref}
                    key={i}
                    initial={{ opacity: 0, x: -30 }}
                    animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className="relative pl-12 md:pl-16"
                  >
                    {/* dot on timeline */}
                    <div className="absolute left-2.5 md:left-4.5 top-3 w-3 h-3 rounded-full border-2" style={{ borderColor: LIME, background: inView ? LIME : "transparent" }} />

                    <div className="rounded-2xl p-6 border" style={{ background: CARD_BG, borderColor: CARD_BORDER }}>
                      <Quotes size={20} weight="fill" style={{ color: LIME, opacity: 0.4 }} className="mb-3" />
                      <p className="text-white/80 text-sm leading-relaxed italic">&ldquo;{t.text}&rdquo;</p>
                      <div className="mt-4 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-bold text-white">{t.author}</p>
                          <p className="text-xs text-white/40">{t.years}</p>
                        </div>
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, s) => (
                            <Star key={s} size={14} weight="fill" style={{ color: LIME }} />
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════════════════
         9B. FACILITY & EQUIPMENT
         ═══════════════════════════════════════════════════════════ */}
      <Section>
        <div className="max-w-6xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-12">
            <p className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: LIME }}>The Space</p>
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight">Built for <span style={{ color: LIME }}>Performance</span></h2>
            <p className="mt-3 text-white/40 max-w-xl mx-auto text-sm">6,000 sq ft of dedicated training space. No treadmill farms. No Smith machines. Every square foot designed to make you stronger.</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Olympic Lifting Platforms",
                desc: "4 dedicated platforms with Eleiko bars and bumper plates. Drop your lifts — the floor can take it.",
                image: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=500&h=350&fit=crop",
              },
              {
                title: "Squat Racks & Power Cages",
                desc: "8 Rogue squat racks with safety catches, band pegs, and pull-up bars. Never wait for a rack.",
                image: "https://images.unsplash.com/photo-1623874514711-0f321325f318?w=500&h=350&fit=crop",
              },
              {
                title: "Functional Training Zone",
                desc: "Battle ropes, sleds, plyo boxes, TRX, assault bikes. The corner where excuses go to die.",
                image: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=500&h=350&fit=crop",
              },
              {
                title: "Heavy Bag Room",
                desc: "6 Everlast heavy bags, double-end bags, and speed bags. Full boxing and kickboxing setup.",
                image: "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=500&h=350&fit=crop",
              },
              {
                title: "Yoga & Mobility Studio",
                desc: "Heated studio with cork flooring, mirrors, and sound system. Quiet space for focused recovery work.",
                image: "https://images.unsplash.com/photo-1588286840104-8957b019727f?w=500&h=350&fit=crop",
              },
              {
                title: "Sauna & Recovery",
                desc: "Infrared sauna, cold plunge, and foam rolling station. Recovery is half the battle.",
                image: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=500&h=350&fit=crop",
              },
            ].map((item) => (
              <GlassCard key={item.title}>
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-40 object-cover rounded-xl mb-4"
                />
                <h3 className="text-base font-black uppercase tracking-wide text-white">{item.title}</h3>
                <p className="mt-2 text-sm text-white/50 leading-relaxed">{item.desc}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════════════════
         9C. CERTIFICATIONS & PARTNERS
         ═══════════════════════════════════════════════════════════ */}
      <Section>
        <div className="max-w-4xl mx-auto text-center">
          <motion.div variants={fadeUp}>
            <p className="text-sm font-bold uppercase tracking-widest mb-6" style={{ color: LIME }}>Trusted & Certified</p>
            <div className="flex flex-wrap justify-center gap-3">
              {[
                "NASM Certified",
                "NSCA Recognized",
                "USA Weightlifting",
                "CrossFit Affiliate",
                "TRX Certified",
                "CPR / AED Certified",
                "Rogue Equipped",
                "Eleiko Partner",
              ].map((badge) => (
                <motion.span
                  key={badge}
                  variants={fadeUp}
                  className="px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider border"
                  style={{
                    borderColor: "rgba(132,204,22,0.2)",
                    color: "rgba(255,255,255,0.5)",
                    background: "rgba(132,204,22,0.05)",
                  }}
                >
                  {badge}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════════════════
         10. BMI / FITNESS CALCULATOR
         ═══════════════════════════════════════════════════════════ */}
      <Section>
        <div className="max-w-4xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-12">
            <p className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: LIME }}>Tools</p>
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight">BMI <span style={{ color: LIME }}>Calculator</span></h2>
            <p className="mt-3 text-white/40 text-sm">Get your baseline and find the right program for your goals.</p>
          </motion.div>

          <GlassCard>
            <div className="grid md:grid-cols-2 gap-8">
              {/* inputs */}
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-white/50 mb-2">Height</label>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <input
                        type="number"
                        min={3}
                        max={8}
                        value={heightFt}
                        onChange={(e) => setHeightFt(Number(e.target.value))}
                        className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/15 text-white text-center font-bold focus:outline-none focus:border-lime-500"
                      />
                      <p className="text-center text-[10px] text-white/30 mt-1">feet</p>
                    </div>
                    <div className="flex-1">
                      <input
                        type="number"
                        min={0}
                        max={11}
                        value={heightIn}
                        onChange={(e) => setHeightIn(Number(e.target.value))}
                        className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/15 text-white text-center font-bold focus:outline-none focus:border-lime-500"
                      />
                      <p className="text-center text-[10px] text-white/30 mt-1">inches</p>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-white/50 mb-2">Weight (lbs)</label>
                  <input
                    type="number"
                    min={80}
                    max={500}
                    value={weightLbs}
                    onChange={(e) => setWeightLbs(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/15 text-white text-center font-bold focus:outline-none focus:border-lime-500"
                  />
                </div>
              </div>

              {/* result */}
              <div className="flex flex-col items-center justify-center text-center">
                <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-2">Your BMI</p>
                <p className="text-6xl font-black" style={{ color: bmiColor }}>{bmi}</p>
                <p className="text-sm font-bold uppercase tracking-wider mt-2" style={{ color: bmiColor }}>{bmiCategory}</p>
                <div className="w-full h-2 rounded-full bg-white/10 mt-6 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    animate={{ width: `${Math.min((bmiNum / 40) * 100, 100)}%` }}
                    transition={spring}
                    style={{ background: bmiColor }}
                  />
                </div>
                <div className="mt-6 p-4 rounded-xl w-full" style={{ background: LIME_DIM, border: `1px solid rgba(132,204,22,0.2)` }}>
                  <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: LIME }}>Recommended Program</p>
                  <p className="text-base font-black text-white">{bmiProgram}</p>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════════════════
         11. FREE TRIAL CTA
         ═══════════════════════════════════════════════════════════ */}
      <Section id="trial">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div variants={fadeUp}>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight">
              Your First 7 Days — <span style={{ color: LIME }}>Free</span>
            </h2>
            <p className="mt-4 text-xl md:text-2xl font-bold text-white/50 uppercase tracking-wide">
              No Commitment. No Excuses.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full sm:flex-1 px-5 py-4 rounded-xl bg-white/[0.06] border border-white/15 text-white placeholder:text-white/30 font-medium focus:outline-none focus:border-lime-500"
              />
              <button className="w-full sm:w-auto px-8 py-4 rounded-xl font-black uppercase tracking-wide text-black text-sm hover:scale-105 transition-transform" style={{ background: LIME }}>
                Claim Trial
              </button>
            </div>
            <p className="mt-4 text-xs text-white/30">No credit card required. Show up and train.</p>
          </motion.div>
        </div>
        {/* big bg glow */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse at center, ${LIME_DIM} 0%, transparent 60%)` }} />
      </Section>

      {/* ═══════════════════════════════════════════════════════════
         12. COMPETITOR COMPARISON
         ═══════════════════════════════════════════════════════════ */}
      <Section>
        <div className="max-w-4xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-12">
            <p className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: LIME }}>The Difference</p>
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight">Iron & Oak vs <span style={{ color: LIME }}>Big Box Gyms</span></h2>
          </motion.div>

          <GlassCard>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px]">
                <thead>
                  <tr className="border-b border-white/15">
                    <th className="text-left text-xs font-bold uppercase tracking-wider text-white/40 pb-4">Feature</th>
                    <th className="text-center text-xs font-bold uppercase tracking-wider pb-4" style={{ color: LIME }}>Iron & Oak</th>
                    <th className="text-center text-xs font-bold uppercase tracking-wider text-white/40 pb-4">Big Box Gym</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_ROWS.map((row, i) => (
                    <tr key={i} className="border-b border-white/[0.04]">
                      <td className="py-4 text-sm font-medium text-white/70">{row.feature}</td>
                      <td className="py-4 text-center">
                        <CheckCircle size={22} weight="fill" style={{ color: LIME }} className="mx-auto" />
                      </td>
                      <td className="py-4 text-center">
                        <XCircle size={22} weight="fill" className="mx-auto text-white/20" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════════════════
         12B. URGENCY STRIP
         ═══════════════════════════════════════════════════════════ */}
      <section className="relative py-6 overflow-hidden" style={{ background: `linear-gradient(90deg, ${BLACK} 0%, rgba(132,204,22,0.08) 50%, ${BLACK} 100%)` }}>
        <div className="max-w-4xl mx-auto px-4 flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 text-center md:text-left">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-3 h-3 rounded-full animate-ping absolute" style={{ background: LIME, opacity: 0.5 }} />
              <div className="w-3 h-3 rounded-full relative" style={{ background: LIME }} />
            </div>
            <span className="text-sm font-bold text-white uppercase tracking-wider">Spots Open</span>
          </div>
          <p className="text-sm text-white/50">
            January cohort is <span className="font-bold text-white">73% full</span>. Only <span className="font-bold" style={{ color: LIME }}>7 spots remaining</span> for new members this month.
          </p>
          <a
            href="#trial"
            className="px-5 py-2 rounded-lg text-xs font-black uppercase tracking-wider text-black flex-shrink-0 hover:scale-105 transition-transform"
            style={{ background: LIME }}
          >
            Claim Yours
          </a>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
         13. VIDEO PLACEHOLDER
         ═══════════════════════════════════════════════════════════ */}
      <Section>
        <div className="max-w-5xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-10">
            <p className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: LIME }}>Inside the Gym</p>
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight">See What Training <span style={{ color: LIME }}>Looks Like</span></h2>
          </motion.div>
          <motion.div variants={fadeUp} className="relative rounded-2xl overflow-hidden group cursor-pointer" style={{ border: `1px solid ${CARD_BORDER}` }}>
            <img
              src="https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=1200&h=600&fit=crop"
              alt="Training at Iron & Oak Fitness"
              className="w-full h-64 md:h-96 object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center group-hover:bg-black/40 transition-colors">
              <div className="w-20 h-20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform" style={{ background: LIME }}>
                <Play size={36} weight="fill" className="text-black ml-1" />
              </div>
            </div>
          </motion.div>
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════════════════
         14A. TRAINING PROGRAM QUIZ
         ═══════════════════════════════════════════════════════════ */}
      <Section>
        <div className="max-w-3xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-10">
            <p className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: LIME }}>Find Your Fit</p>
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight">What Training Program Is <span style={{ color: LIME }}>Right For You?</span></h2>
            <p className="mt-3 text-white/40 text-sm">Select your goal — we'll point you to the perfect program.</p>
          </motion.div>
          <motion.div className="space-y-3" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {[
              {
                label: "I want to lose weight and build confidence",
                answer: "Our Foundations class is perfect — 45-minute full-body sessions designed for all fitness levels. Most members see results in 30 days.",
                cta: "Try Foundations Free",
              },
              {
                label: "I'm serious about getting strong",
                answer: "Iron & Oak's Strength Program runs 4x/week with progressive overload. You'll hit PRs you didn't think possible.",
                cta: "Start the Strength Program",
              },
              {
                label: "I need flexibility and stress relief",
                answer: "Our Recovery & Mobility classes complement any training style. 60 minutes of movement therapy that makes everything else better.",
                cta: "Join a Mobility Class",
              },
              {
                label: "I want accountability and community",
                answer: "Group fitness is our DNA. Our coaches know your name, your goals, and won't let you quit. Try a class free this week.",
                cta: "Try a Group Class Free",
              },
            ].map((option, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="overflow-hidden cursor-pointer" onClick={() => setOpenQuiz(openQuiz === i ? null : i)}>
                  <button className="w-full flex items-center justify-between p-5 text-left">
                    <span className="text-base font-semibold text-white pr-4">{option.label}</span>
                    <motion.div animate={{ rotate: openQuiz === i ? 180 : 0 }} transition={spring}>
                      <CaretDown size={20} style={{ color: LIME }} className="shrink-0" />
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
                        <div className="px-5 pb-5 border-t border-white/[0.10] pt-4">
                          <p className="text-white/70 leading-relaxed mb-4">{option.answer}</p>
                          <a
                            href="#trial"
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-black uppercase tracking-wide text-black hover:scale-105 transition-transform"
                            style={{ background: LIME }}
                          >
                            {option.cta} <ArrowRight size={16} weight="bold" />
                          </a>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════════════════
         14B. SERVICE AREA GRID
         ═══════════════════════════════════════════════════════════ */}
      <Section>
        <div className="max-w-5xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-10">
            <p className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: LIME }}>Service Area</p>
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight">Training Members From <span style={{ color: LIME }}>Across Seattle</span></h2>
            <p className="mt-3 text-white/40 text-sm">Iron & Oak draws members from every corner of the city. Is your neighborhood on the list?</p>
          </motion.div>
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-4 gap-4"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
          >
            {[
              "Capitol Hill",
              "South Lake Union",
              "Beacon Hill",
              "Columbia City",
              "Rainier Valley",
              "Mt. Baker",
              "Georgetown",
              "SODO",
            ].map((hood) => (
              <motion.div key={hood} variants={fadeUp}>
                <GlassCard className="text-center py-5">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <div className="relative">
                      <div className="w-2 h-2 rounded-full animate-ping absolute" style={{ background: LIME, opacity: 0.5 }} />
                      <div className="w-2 h-2 rounded-full relative" style={{ background: LIME }} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Active Members</span>
                  </div>
                  <p className="text-sm font-black uppercase tracking-wide text-white">{hood}</p>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════════════════
         14. FAQ
         ═══════════════════════════════════════════════════════════ */}
      <Section>
        <div className="max-w-3xl mx-auto px-4">
          <motion.div variants={fadeUp} className="text-center mb-10">
            <p className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: LIME }}>Common Questions</p>
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white">Frequently <span style={{ color: LIME }}>Asked</span></h2>
          </motion.div>
          <motion.div className="space-y-3" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {FITNESS_FAQS.map((faq, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between p-5 text-left cursor-pointer"
                  >
                    <span className="text-base font-semibold text-white pr-4">{faq.q}</span>
                    <motion.div animate={{ rotate: openFaq === i ? 180 : 0 }} transition={spring}>
                      <CaretDown size={20} style={{ color: LIME }} className="shrink-0" />
                    </motion.div>
                  </button>
                  <AnimatePresence initial={false}>
                    {openFaq === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={spring}
                        className="overflow-hidden"
                      >
                        <p className="px-5 pb-5 text-slate-400 leading-relaxed">{faq.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
          <p className="text-center mt-8 text-slate-400">Still have questions? <a href="tel:2066194382" className="font-semibold" style={{ color: LIME }}>Call (206) 619-4382</a> or stop by for a free trial.</p>
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════════════════
         15. CONTACT / LOCATION
         ═══════════════════════════════════════════════════════════ */}
      <Section id="contact">
        <div className="max-w-6xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-12">
            <p className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: LIME }}>Location</p>
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight">Find <span style={{ color: LIME }}>Us</span></h2>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-6">
            {/* map placeholder */}
            <GlassCard>
              <div className="rounded-xl overflow-hidden h-72 bg-white/[0.07]">
                <img
                  src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&h=500&fit=crop"
                  alt="Seattle Eastlake neighborhood"
                  className="w-full h-full object-cover opacity-60"
                />
              </div>
            </GlassCard>

            {/* info */}
            <GlassCard>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: LIME_DIM }}>
                    <MapPin size={20} weight="bold" style={{ color: LIME }} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Address</p>
                    <a href="https://maps.google.com/?q=2847+Eastlake+Ave+E+Seattle+WA+98102" target="_blank" rel="noopener noreferrer" className="text-sm text-white/50 hover:text-white/70 transition-colors underline underline-offset-2">
                      2847 Eastlake Ave E, Seattle, WA 98102
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: LIME_DIM }}>
                    <Phone size={20} weight="bold" style={{ color: LIME }} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Phone</p>
                    <a href="tel:+12066194382" className="text-sm text-white/50 hover:text-white/70 transition-colors">(206) 619-4382</a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: LIME_DIM }}>
                    <Envelope size={20} weight="bold" style={{ color: LIME }} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Email</p>
                    <a href="mailto:train@ironandoakfitness.com" className="text-sm text-white/50 hover:text-white/70 transition-colors">train@ironandoakfitness.com</a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: LIME_DIM }}>
                    <Clock size={20} weight="bold" style={{ color: LIME }} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Hours</p>
                    <p className="text-sm text-white/50">Monday - Friday: 5:00 AM - 10:00 PM</p>
                    <p className="text-sm text-white/50">Saturday: 7:00 AM - 6:00 PM</p>
                    <p className="text-sm text-white/50">Sunday: 8:00 AM - 4:00 PM</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: LIME_DIM }}>
                    <CalendarBlank size={20} weight="bold" style={{ color: LIME }} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Parking</p>
                    <p className="text-sm text-white/50">Free dedicated lot behind the building. Street parking also available on Eastlake Ave.</p>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════════════════
         15. FOOTER
         ═══════════════════════════════════════════════════════════ */}
      <footer className="relative border-t border-white/[0.10] py-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-10">
            {/* brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Barbell size={24} weight="bold" style={{ color: LIME }} />
                <span className="font-black text-lg tracking-tight text-white">IRON<span style={{ color: LIME }}>&</span>OAK</span>
              </div>
              <p className="text-sm text-white/40 leading-relaxed">Stronger Every Day. Seattle&apos;s premier strength and conditioning facility since 2016.</p>
              <div className="flex gap-3 mt-4">
                {["Instagram", "Facebook", "YouTube"].map((social) => (
                  <span
                    key={social}
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-[10px] font-bold uppercase tracking-wider cursor-pointer hover:scale-110 transition-transform"
                    style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    {social[0]}
                  </span>
                ))}
              </div>
            </div>
            {/* quick links */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-white/50 mb-4">Quick Links</p>
              <ul className="space-y-2">
                {["Programs", "Schedule", "Pricing", "Trainers", "Contact"].map((l) => (
                  <li key={l}><a href={`#${l.toLowerCase()}`} className="text-sm text-white/40 hover:text-white transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>
            {/* contact */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-white/50 mb-4">Contact</p>
              <div className="space-y-2 text-sm text-white/40">
                <p>(206) 619-4382</p>
                <p>train@ironandoakfitness.com</p>
                <p>2847 Eastlake Ave E, Seattle, WA 98102</p>
              </div>
            </div>
          </div>
          <div className="border-t border-white/[0.10] pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/30">
            <p>&copy; {new Date().getFullYear()} Iron & Oak Fitness. All rights reserved.</p>
            <p className="flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-sky-500"><path d="M24.3 4.2c-1.5-.4-3.2.1-4.5 1.1-1-.7-2.3-1-3.5-.8-2.4.4-4.2 2.5-4.2 4.9v.6c-3.2.8-6 2.8-7.8 5.6-.3.5-.1 1.1.4 1.4.5.3 1.1.1 1.4-.4 1.5-2.3 3.7-4 6.3-4.7.5-.1 1-.1 1.5 0 .8.2 1.4.8 1.7 1.5.3.8.2 1.6-.2 2.3l-2.8 4.3c-.6.9-.4 2.1.4 2.8l2.5 2.1c.4.3.8.5 1.3.5h5.2c.5 0 1-.2 1.3-.5l1.2-1c.6-.5.8-1.3.6-2l-1-3.2c-.2-.5 0-1.1.4-1.4l3.8-2.5c1.3-.9 2.1-2.3 2.1-3.9V9.6c0-2.5-1.7-4.7-4.1-5.3v-.1z" fill="currentColor"/></svg>Created by{" "}
              <a href="https://bluejayportfolio.com" target="_blank" rel="noopener noreferrer" className="hover:text-white/50 transition-colors underline underline-offset-2" style={{ color: LIME }}>
                bluejayportfolio.com
              </a>
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
