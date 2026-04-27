"use client";

/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/purity */

import { useState, useRef, useCallback } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useInView,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import {
  Star,
  ShieldCheck,
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
  Brain,
  Lightning,
  Stethoscope,
  Certificate,
  Trophy,
  Target,
  SealCheck,
  Sparkle,
  CaretRight,
  Warning,
  ChartLineUp,
  Timer,
  Wheelchair,
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
  const particles = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 8,
    duration: 7 + Math.random() * 6,
    size: 3 + Math.random() * 5,
    opacity: 0.08 + Math.random() * 0.18,
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

/* ───────────────────────── SPINE ALIGNMENT SVG (Hero) ───────────────────────── */
function SpineAlignmentHero() {
  const ref = useRef(null);

  const vertebrae = [
    { cy: 30, rx: 18, offset: -12 },
    { cy: 60, rx: 17, offset: -8 },
    { cy: 90, rx: 16, offset: -4 },
    { cy: 120, rx: 15, offset: 0 },
    { cy: 150, rx: 14, offset: 3 },
    { cy: 180, rx: 13, offset: 5 },
    { cy: 210, rx: 12, offset: 2 },
  ];

  return (
    <div ref={ref} className="relative flex items-center justify-center">
      {/* Pulsing glow behind */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 320, height: 420,
          background: `radial-gradient(ellipse, ${TEAL_GLOW} 0%, transparent 70%)`,
          filter: "blur(50px)",
        }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.9, 0.5] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <svg viewBox="0 0 160 260" className="relative z-10 w-48 h-80 md:w-64 md:h-[420px]" fill="none">
        {/* Outer aura rings */}
        <motion.ellipse cx="80" cy="130" rx="70" ry="120" stroke={TEAL} strokeWidth="0.4" opacity={0.08}
          animate={{ rx: [68, 72, 68], ry: [118, 122, 118] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} />

        {/* Vertebrae — animate from misaligned to aligned */}
        {vertebrae.map((v, i) => (
          <motion.g key={i}>
            <motion.ellipse
              cx="80" cy={v.cy} rx={v.rx} ry="10"
              fill={`${TEAL}22`} stroke={TEAL_LIGHT} strokeWidth="1.5"
              initial={{ cx: 80 + v.offset, opacity: 0 }}
              animate={{ cx: 80, opacity: 1 }}
              transition={{ duration: 1.2, delay: i * 0.12, ease: "backOut" }}
            />
            <motion.ellipse
              cx="80" cy={v.cy - 1} rx={v.rx * 0.5} ry="4"
              fill={`${TEAL_LIGHT}12`}
              initial={{ cx: 80 + v.offset }}
              animate={{ cx: 80 }}
              transition={{ duration: 1.2, delay: i * 0.12, ease: "backOut" }}
            />
            <motion.line
              x1={80 - v.rx} y1={v.cy} x2={80 - v.rx - 8} y2={v.cy - 4}
              stroke={TEAL} strokeWidth="1" strokeLinecap="round" opacity={0.4}
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
              transition={{ duration: 0.8, delay: i * 0.12 + 0.4 }}
            />
            <motion.line
              x1={80 + v.rx} y1={v.cy} x2={80 + v.rx + 8} y2={v.cy - 4}
              stroke={TEAL} strokeWidth="1" strokeLinecap="round" opacity={0.4}
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
              transition={{ duration: 0.8, delay: i * 0.12 + 0.4 }}
            />
            {i < 6 && (
              <motion.rect
                x="77" y={v.cy + 10} width="6" height={16} rx="3"
                fill={`${TEAL}18`} stroke={TEAL} strokeWidth="0.6" opacity={0.35}
                initial={{ scaleY: 0 }} animate={{ scaleY: 1 }}
                transition={{ duration: 0.5, delay: i * 0.12 + 0.5 }}
                style={{ transformOrigin: `80px ${v.cy + 10}px` }}
              />
            )}
          </motion.g>
        ))}

        {/* Nerve branches */}
        {[
          "M62 60 C44 64, 28 74, 20 88",
          "M98 60 C116 64, 132 74, 140 88",
          "M66 150 C48 156, 30 170, 22 188",
          "M94 150 C112 156, 130 170, 138 188",
        ].map((d, i) => (
          <motion.path key={i} d={d} stroke={AMBER_LIGHT} strokeWidth="0.8" strokeLinecap="round" fill="none" opacity={0.25}
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, delay: 1.5 + i * 0.2 }} />
        ))}

        {/* Healing pulse traveling down spine */}
        <motion.circle cx="80" cy="30" r="6" fill={AMBER_LIGHT} opacity={0.5}
          animate={{ cy: [30, 210, 30], opacity: [0.6, 0.2, 0.6], scale: [1.3, 0.7, 1.3] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} />

        {/* Central energy node */}
        <motion.circle cx="80" cy="120" r="8" fill={`${AMBER}33`}
          animate={{ r: [6, 10, 6], opacity: [0.2, 0.6, 0.2] }}
          transition={{ duration: 3, repeat: Infinity }} />
        <motion.circle cx="80" cy="120" r="3" fill={AMBER_LIGHT}
          animate={{ opacity: [0.4, 1, 0.4], scale: [0.8, 1.4, 0.8] }}
          transition={{ duration: 2, repeat: Infinity }} />

        {/* Sparkles */}
        <motion.circle cx="135" cy="42" r="2.5" fill={TEAL_LIGHT}
          animate={{ opacity: [0.15, 0.8, 0.15], scale: [0.6, 1.2, 0.6] }}
          transition={{ duration: 2.5, repeat: Infinity }} />
        <motion.circle cx="25" cy="65" r="2" fill={AMBER_LIGHT}
          animate={{ opacity: [0.1, 0.7, 0.1] }}
          transition={{ duration: 3, repeat: Infinity, delay: 0.6 }} />
        <motion.circle cx="140" cy="165" r="2" fill={TEAL_LIGHT}
          animate={{ opacity: [0.1, 0.6, 0.1] }}
          transition={{ duration: 2.5, repeat: Infinity, delay: 1 }} />

        {/* Medical cross */}
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5 }}>
          <rect x="122" y="215" width="14" height="3.5" rx="1.75" fill={TEAL_LIGHT} opacity={0.35} />
          <rect x="127.25" y="209.75" width="3.5" height="14" rx="1.75" fill={TEAL_LIGHT} opacity={0.35} />
        </motion.g>
      </svg>
    </div>
  );
}

/* ───────────────────────── SHARED COMPONENTS ───────────────────────── */
function WordReveal({ text, className = "" }: { text: string; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const words = text.split(" ");

  return (
    <motion.span ref={ref} className={`inline-flex flex-wrap gap-x-3 ${className}`} variants={stagger} initial="hidden" animate={isInView ? "show" : "hidden"}>
      {words.map((word, i) => (
        <motion.span key={i} variants={fadeUp} className="inline-block">{word}</motion.span>
      ))}
    </motion.span>
  );
}

function SectionReveal({ children, className = "", id }: { children: React.ReactNode; className?: string; id?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.section ref={ref} id={id} className={className}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={spring}>
      {children}
    </motion.section>
  );
}

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-white/15 bg-white/[0.08] backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] ${className}`}>
      {children}
    </div>
  );
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
    x.set((e.clientX - (rect.left + rect.width / 2)) * 0.25);
    y.set((e.clientY - (rect.top + rect.height / 2)) * 0.25);
  }, [x, y]);

  const handleMouseLeave = useCallback(() => { x.set(0); y.set(0); }, [x, y]);

  return (
    <motion.button ref={ref} style={{ x: springX, y: springY, willChange: "transform", ...style }}
      onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} onClick={onClick}
      className={className} whileTap={{ scale: 0.97 }}>
      {children}
    </motion.button>
  );
}

function ShimmerBorder({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative rounded-2xl p-[1px] overflow-hidden ${className}`}>
      <motion.div className="absolute inset-0 rounded-2xl"
        style={{ background: `conic-gradient(from 0deg, transparent, ${TEAL}, transparent, ${AMBER}, transparent)`, willChange: "transform" }}
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }} />
      <div className="relative rounded-2xl z-10" style={{ background: BG }}>{children}</div>
    </div>
  );
}

/* ───────────────────────── PAIN SCALE BAR ───────────────────────── */
function PainScale({ before, after }: { before: number; after: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-30px" });
  const colors = ["#22c55e", "#22c55e", "#84cc16", "#eab308", "#f59e0b", "#f97316", "#f97316", "#ef4444", "#dc2626", "#dc2626"];

  return (
    <div ref={ref} className="space-y-2">
      <div className="flex items-center gap-3">
        <span className="text-xs text-slate-500 w-14 shrink-0">Before</span>
        <div className="flex-1 flex gap-1">
          {Array.from({ length: 10 }).map((_, i) => (
            <motion.div
              key={i}
              className="h-3 flex-1 rounded-sm"
              style={{ background: i < before ? colors[i] : `${colors[i]}22` }}
              initial={{ scaleX: 0 }}
              animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
            />
          ))}
        </div>
        <span className="text-sm font-bold w-8 text-right" style={{ color: colors[before - 1] }}>{before}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs text-slate-500 w-14 shrink-0">After</span>
        <div className="flex-1 flex gap-1">
          {Array.from({ length: 10 }).map((_, i) => (
            <motion.div
              key={i}
              className="h-3 flex-1 rounded-sm"
              style={{ background: i < after ? colors[i] : `${colors[i]}22` }}
              initial={{ scaleX: 0 }}
              animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
              transition={{ duration: 0.3, delay: 0.4 + i * 0.04 }}
            />
          ))}
        </div>
        <span className="text-sm font-bold w-8 text-right" style={{ color: colors[Math.max(0, after - 1)] }}>{after}</span>
      </div>
    </div>
  );
}

/* ───────────────────────── BODY MAP QUIZ ───────────────────────── */
const bodyAreas = [
  { id: "neck", label: "Neck & Upper Back", icon: Bone, conditions: ["Cervical strain", "Text neck", "Torticollis"], treatment: "Cervical adjustments + posture correction" },
  { id: "mid", label: "Mid Back", icon: Heartbeat, conditions: ["Thoracic pain", "Rib misalignment", "Muscle spasms"], treatment: "Thoracic mobilization + soft tissue therapy" },
  { id: "lower", label: "Lower Back", icon: Lightning, conditions: ["Sciatica", "Herniated disc", "Lumbar strain"], treatment: "Spinal decompression + core strengthening" },
  { id: "head", label: "Head & Jaw", icon: Brain, conditions: ["Migraines", "TMJ dysfunction", "Tension headaches"], treatment: "Upper cervical adjustment + trigger point therapy" },
  { id: "shoulder", label: "Shoulders & Arms", icon: Barbell, conditions: ["Frozen shoulder", "Carpal tunnel", "Tennis elbow"], treatment: "Extremity adjustments + rehabilitation exercises" },
  { id: "hip", label: "Hips & Legs", icon: Wheelchair, conditions: ["Hip pain", "Knee issues", "Plantar fasciitis"], treatment: "Pelvic alignment + gait analysis correction" },
];

function BodyMapQuiz() {
  const [selected, setSelected] = useState<string | null>(null);
  const active = bodyAreas.find((a) => a.id === selected);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      <motion.div className="grid grid-cols-2 sm:grid-cols-3 gap-3" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
        {bodyAreas.map((area) => (
          <motion.button
            key={area.id}
            variants={fadeUp}
            onClick={() => setSelected(area.id === selected ? null : area.id)}
            className="p-4 rounded-xl border text-left transition-all cursor-pointer"
            style={{
              background: selected === area.id ? `${TEAL}22` : "rgba(255,255,255,0.02)",
              borderColor: selected === area.id ? TEAL_LIGHT : "rgba(255,255,255,0.08)",
            }}
          >
            <area.icon size={24} weight="duotone" style={{ color: selected === area.id ? TEAL_LIGHT : "#64748b" }} className="mb-2" />
            <span className="text-sm font-medium text-white block">{area.label}</span>
          </motion.button>
        ))}
      </motion.div>

      <AnimatePresence mode="wait">
        {active ? (
          <motion.div
            key={active.id}
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            transition={spring}
          >
            <GlassCard className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: TEAL_GLOW }}>
                  <active.icon size={22} weight="duotone" style={{ color: TEAL_LIGHT }} />
                </div>
                <h4 className="text-lg font-semibold text-white">{active.label}</h4>
              </div>
              <div className="mb-4">
                <p className="text-xs uppercase tracking-widest mb-2" style={{ color: AMBER }}>Common Conditions</p>
                <div className="flex flex-wrap gap-2">
                  {active.conditions.map((c) => (
                    <span key={c} className="px-3 py-1 rounded-full text-xs font-medium border" style={{ borderColor: `${TEAL}44`, color: TEAL_LIGHT, background: `${TEAL}11` }}>{c}</span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest mb-2" style={{ color: AMBER }}>Recommended Treatment</p>
                <p className="text-sm text-slate-300 leading-relaxed">{active.treatment}</p>
              </div>
              <MagneticButton className="mt-4 px-5 py-2.5 rounded-full text-sm font-semibold text-white flex items-center gap-2 cursor-pointer" style={{ background: TEAL } as React.CSSProperties}>
                Book for {active.label} <ArrowRight size={14} weight="bold" />
              </MagneticButton>
            </GlassCard>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-full py-12 text-center">
            <Target size={48} weight="duotone" className="mb-4" style={{ color: `${TEAL_LIGHT}44` }} />
            <p className="text-slate-500 text-sm">Select an area to see conditions & treatments</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ───────────────────────── SPINAL HEALTH ASSESSMENT ───────────────────────── */
const assessmentQuestions = [
  { question: "How often do you experience back or neck pain?", options: ["Rarely", "A few times a month", "Weekly", "Daily"] },
  { question: "Do you sit at a desk for more than 6 hours daily?", options: ["No", "Sometimes", "Most days", "Every day"] },
  { question: "Have you ever been in a car accident or sports injury?", options: ["Never", "Minor, years ago", "Yes, still affects me", "Multiple incidents"] },
  { question: "How would you rate your current posture?", options: ["Excellent", "Good", "Fair", "Poor"] },
];

function SpinalAssessment() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);

  const handleAnswer = (value: number) => {
    const newAnswers = [...answers, value];
    setAnswers(newAnswers);
    if (step < assessmentQuestions.length - 1) {
      setStep(step + 1);
    } else {
      setShowResult(true);
    }
  };

  const score = answers.reduce((a, b) => a + b, 0);
  const maxScore = assessmentQuestions.length * 3;
  const percentage = Math.round((1 - score / maxScore) * 100);

  const getResult = () => {
    if (percentage >= 80) return { label: "Excellent", color: "#22c55e", text: "Your spine health looks great! Regular wellness visits can help maintain this." };
    if (percentage >= 60) return { label: "Good", color: "#eab308", text: "Minor concerns detected. A consultation could help prevent future issues." };
    if (percentage >= 40) return { label: "Fair", color: "#f97316", text: "Several risk factors present. We recommend a comprehensive evaluation." };
    return { label: "Needs Attention", color: "#ef4444", text: "Multiple indicators suggest you would benefit significantly from chiropractic care." };
  };

  const reset = () => { setStep(0); setAnswers([]); setShowResult(false); };

  return (
    <GlassCard className="p-6 md:p-8">
      <AnimatePresence mode="wait">
        {!showResult ? (
          <motion.div key={`q-${step}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={spring}>
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs uppercase tracking-widest" style={{ color: AMBER }}>Question {step + 1} of {assessmentQuestions.length}</span>
              <div className="flex gap-1">
                {assessmentQuestions.map((_, i) => (
                  <div key={i} className="w-8 h-1.5 rounded-full transition-colors" style={{ background: i <= step ? TEAL_LIGHT : "rgba(255,255,255,0.1)" }} />
                ))}
              </div>
            </div>
            <h4 className="text-lg font-semibold text-white mb-6">{assessmentQuestions[step].question}</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {assessmentQuestions[step].options.map((opt, i) => (
                <button
                  key={opt}
                  onClick={() => handleAnswer(i)}
                  className="p-4 rounded-xl border border-white/15 text-left text-sm text-slate-300 hover:border-teal-500/40 hover:bg-white/5 transition-all cursor-pointer"
                >
                  {opt}
                </button>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={spring}>
            <div className="text-center">
              <div className="relative w-32 h-32 mx-auto mb-6">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
                  <motion.circle
                    cx="50" cy="50" r="42" fill="none" stroke={getResult().color} strokeWidth="8" strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 42}`}
                    initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - percentage / 100) }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-white">{percentage}%</span>
                  <span className="text-xs text-slate-400">Score</span>
                </div>
              </div>
              <h4 className="text-xl font-bold mb-2" style={{ color: getResult().color }}>{getResult().label}</h4>
              <p className="text-sm text-slate-400 mb-6 max-w-sm mx-auto">{getResult().text}</p>
              <div className="flex flex-wrap justify-center gap-3">
                <MagneticButton className="px-6 py-3 rounded-full text-sm font-semibold text-white flex items-center gap-2 cursor-pointer" style={{ background: TEAL } as React.CSSProperties}>
                  Book Free Consultation <ArrowRight size={14} weight="bold" />
                </MagneticButton>
                <button onClick={reset} className="px-6 py-3 rounded-full text-sm font-medium text-slate-400 border border-white/15 hover:bg-white/5 transition-colors cursor-pointer">
                  Retake Quiz
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
}

/* ───────────────────────── DATA ───────────────────────── */
const services = [
  { title: "Spinal Adjustments", description: "Precise, gentle spinal adjustments to restore proper alignment using both manual and instrument-assisted techniques tailored to your comfort level.", icon: Bone, price: "From $65" },
  { title: "Sports Rehabilitation", description: "Comprehensive sports rehab combining chiropractic care with corrective exercises. Get back stronger with injury recovery and performance optimization.", icon: Barbell, price: "From $85" },
  { title: "Prenatal Chiropractic", description: "Specialized prenatal adjustments using the Webster technique to support comfortable pregnancies throughout every trimester.", icon: Baby, price: "From $75" },
  { title: "Pediatric Care", description: "Gentle, age-appropriate care for children from newborns to teens. We address growing pains, posture issues, and sports injuries.", icon: Heart, price: "From $55" },
  { title: "Massage Therapy", description: "Therapeutic massage integrated with chiropractic adjustments. Deep tissue, trigger point, and myofascial release available.", icon: HandPalm, price: "From $70" },
  { title: "Digital X-Rays & Scans", description: "State-of-the-art low-radiation digital imaging for precise diagnosis and targeted treatment planning.", icon: Scan, price: "Included" },
];

const processSteps = [
  { step: "01", title: "Consultation", description: "In-depth discussion about your health history, goals, and current concerns. We listen first.", icon: Stethoscope, time: "30 min" },
  { step: "02", title: "Examination", description: "Comprehensive physical exam including posture analysis, range of motion tests, and digital X-rays if needed.", icon: Scan, time: "45 min" },
  { step: "03", title: "Treatment Plan", description: "Personalized treatment plan with gentle adjustments, therapeutic exercises, and lifestyle recommendations.", icon: FirstAidKit, time: "Review" },
  { step: "04", title: "Adjustment", description: "Your first spinal adjustment — most patients feel relief immediately. We work at your pace.", icon: Bone, time: "20 min" },
  { step: "05", title: "Maintenance", description: "Ongoing wellness care to maintain alignment, prevent future issues, and optimize your overall health.", icon: ShieldCheck, time: "Ongoing" },
];

const conditions = [
  "Back Pain", "Neck Pain", "Headaches & Migraines", "Sciatica",
  "Herniated Discs", "Whiplash", "Scoliosis", "Carpal Tunnel",
  "Shoulder Pain", "Hip Pain", "Sports Injuries", "Fibromyalgia",
  "TMJ Disorders", "Pregnancy Discomfort", "Arthritis", "Pinched Nerves",
  "Plantar Fasciitis", "Tennis Elbow", "Posture Correction", "Auto Accident Injuries",
];

const testimonials = [
  { name: "Michael R.", text: "After years of chronic back pain, I finally found relief. The team here truly cares about getting to the root cause, not just masking symptoms. I went from barely being able to tie my shoes to running 5Ks again.", rating: 5, painBefore: 8, painAfter: 2, visits: 12 },
  { name: "Jennifer K.", text: "The prenatal chiropractic care made such a difference during my pregnancy. Less discomfort, smoother delivery than my first. My OB was impressed with my mobility at 38 weeks.", rating: 5, painBefore: 7, painAfter: 1, visits: 16 },
  { name: "Carlos M.", text: "As a competitive CrossFit athlete, I need my body in peak condition. The sports rehab program got me back to competing in 6 weeks instead of the 12 my orthopedic predicted.", rating: 5, painBefore: 9, painAfter: 1, visits: 8 },
  { name: "Sarah W.", text: "I was skeptical about chiropractic care until my migraines went from 4-5 per week to maybe 1 per month. My neurologist reduced my medication because of the improvement.", rating: 5, painBefore: 8, painAfter: 2, visits: 10 },
  { name: "David L.", text: "Desk job destroyed my posture and gave me constant neck pain. After 3 months of care, my coworkers noticed I was standing taller. The ergonomic recommendations alone were worth it.", rating: 5, painBefore: 6, painAfter: 1, visits: 14 },
];

const faqs = [
  { q: "Is chiropractic care safe?", a: "Yes. Chiropractic care is widely recognized as one of the safest, drug-free, non-invasive therapies available. Our doctors are extensively trained and use gentle techniques appropriate for each patient." },
  { q: "Do I need a referral from my doctor?", a: "No referral is needed. You can schedule directly with us. We accept most major insurance plans and offer affordable self-pay options starting at $49 for new patients." },
  { q: "How many visits will I need?", a: "Treatment plans vary by condition. Some patients feel significant relief after just one visit, while chronic conditions may require a series of treatments over several weeks. We create a personalized plan during your first visit." },
  { q: "Does the adjustment hurt?", a: "Most patients feel immediate relief after an adjustment. You may hear a popping sound, which is simply gas releasing from the joint. Our doctors use gentle techniques and always work within your comfort zone." },
  { q: "Do you treat children?", a: "Absolutely. We provide gentle, age-appropriate chiropractic care for children of all ages. Pediatric adjustments use very light pressure and are completely safe and effective for growing bodies." },
  { q: "What should I wear to my appointment?", a: "Comfortable, loose-fitting clothing is ideal. Athletic wear works great. We provide gowns if needed for examination purposes." },
];

const insuranceProviders = [
  "Blue Cross Blue Shield", "Aetna", "UnitedHealthcare", "Cigna",
  "Humana", "Medicare", "Kaiser Permanente", "Tricare",
];

const comfortFeatures = [
  { icon: Heart, title: "Gentle Techniques", description: "Multiple adjustment methods — find the one that works best for your comfort level" },
  { icon: Brain, title: "No Surprises", description: "We explain everything before we do it. You stay in control of your care at all times" },
  { icon: Timer, title: "Same-Day Relief", description: "Most patients experience noticeable improvement after their very first adjustment" },
  { icon: Baby, title: "Family-Friendly", description: "From infants to grandparents — we treat all ages with specialized approaches" },
];

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════ */
export default function V2ChiropracticPage() {
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
              <a href="#quiz" className="hover:text-white transition-colors">Pain Quiz</a>
              <a href="#testimonials" className="hover:text-white transition-colors">Reviews</a>
              <a href="#contact" className="hover:text-white transition-colors">Contact</a>
            </div>
            <div className="flex items-center gap-3">
              <MagneticButton className="px-4 md:px-5 py-2 rounded-full text-sm font-semibold text-white transition-colors cursor-pointer" style={{ background: TEAL } as React.CSSProperties}>
                Book Now
              </MagneticButton>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors cursor-pointer">
                {mobileMenuOpen ? <X size={24} /> : <List size={24} />}
              </button>
            </div>
          </GlassCard>

          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3, ease: "easeInOut" }} className="md:hidden mt-2 overflow-hidden">
                <GlassCard className="flex flex-col gap-1 px-4 py-4">
                  {[{ label: "Services", href: "#services" }, { label: "About", href: "#about" }, { label: "Process", href: "#process" }, { label: "Pain Quiz", href: "#quiz" }, { label: "Reviews", href: "#testimonials" }, { label: "Contact", href: "#contact" }].map((link) => (
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

      {/* ═══ HERO — Spine Alignment Reveal ═══ */}
      <section className="relative min-h-[100dvh] flex items-center pt-24 z-10">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20" style={{ background: `radial-gradient(circle, ${TEAL} 0%, transparent 70%)`, filter: "blur(80px)" }} />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-15" style={{ background: `radial-gradient(circle, ${AMBER} 0%, transparent 70%)`, filter: "blur(60px)" }} />
        </div>

        <div className="mx-auto max-w-7xl px-4 md:px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-4 items-center">
          <div className="space-y-8">
            <div>
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ ...spring, delay: 0.1 }} className="flex items-center gap-3 mb-4">
                <span className="text-sm uppercase tracking-widest" style={{ color: AMBER }}>Natural Healing</span>
                <span className="w-8 h-px" style={{ background: AMBER }} />
                <span className="text-sm uppercase tracking-widest" style={{ color: AMBER }}>Total Alignment</span>
              </motion.div>
              <h1 className="text-3xl md:text-6xl tracking-tighter leading-none font-bold text-white" style={{ textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>
                <WordReveal text="Align Your Body, Transform Your Life" />
              </h1>
            </div>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.6 }} className="text-lg text-slate-400 max-w-md leading-relaxed">
              Expert chiropractic care that goes beyond symptom relief. We restore your body&apos;s natural alignment so you can live pain-free and move with confidence.
            </motion.p>

            {/* Hero trust badges */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.7 }} className="flex flex-wrap gap-3">
              {[
                { icon: SealCheck, text: "Board Certified" },
                { icon: Certificate, text: "15+ Years" },
                { icon: ShieldCheck, text: "Insurance Accepted" },
                { icon: Lightning, text: "Same-Day Appointments" },
              ].map((badge, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/15 bg-white/[0.08]">
                  <badge.icon size={14} weight="duotone" style={{ color: TEAL_LIGHT }} />
                  <span className="text-xs text-slate-400">{badge.text}</span>
                </div>
              ))}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.8 }} className="flex flex-wrap gap-4">
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white flex items-center gap-2 cursor-pointer" style={{ background: TEAL } as React.CSSProperties}>
                Schedule Consultation <ArrowRight size={18} weight="bold" />
              </MagneticButton>
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/15 flex items-center gap-2 cursor-pointer">
                <Phone size={18} weight="duotone" /> <a href="tel:+12067412963">(206) 741-2963</a>
              </MagneticButton>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ ...spring, delay: 1 }} className="flex flex-wrap gap-6 text-sm text-slate-400">
              <a href="https://maps.google.com/?q=1428+NW+56th+St+Seattle+WA" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-white transition-colors">
                <MapPin size={16} weight="duotone" style={{ color: TEAL_LIGHT }} />1428 NW 56th St, Seattle
              </a>
              <span className="flex items-center gap-2"><Clock size={16} weight="duotone" style={{ color: TEAL_LIGHT }} />Mon-Sat 8am-7pm</span>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ ...spring, delay: 0.3 }} className="hidden md:flex items-center justify-center lg:justify-end">
            <SpineAlignmentHero />
          </motion.div>
        </div>
      </section>

      {/* ═══ STATS BAR ═══ */}
      <SectionReveal className="relative z-10 pb-8">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <GlassCard className="p-6 md:p-8">
            <motion.div className="grid grid-cols-2 sm:grid-cols-4 gap-6 md:gap-8" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
              {[
                { value: "15+", label: "Years Experience", icon: Trophy },
                { value: "12,000+", label: "Patients Treated", icon: Users },
                { value: "4.9", label: "Google Rating", icon: Star },
                { value: "98%", label: "Patient Satisfaction", icon: ChartLineUp },
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

      {/* ═══ NEW PATIENT SPECIAL ═══ */}
      <SectionReveal className="relative z-10 py-8">
        <div className="mx-auto max-w-3xl px-4 md:px-6">
          <ShimmerBorder>
            <div className="p-6 md:p-8 text-center">
              <motion.div initial={{ scale: 0.9 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={spring}>
                <Sparkle size={28} weight="duotone" style={{ color: AMBER }} className="mx-auto mb-3" />
                <p className="text-xs uppercase tracking-widest mb-2" style={{ color: AMBER }}>New Patient Special</p>
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">Complete Exam + X-Rays + First Adjustment</h3>
                <div className="flex items-center justify-center gap-3 mb-4">
                  <span className="text-slate-500 line-through text-lg">$350</span>
                  <span className="text-4xl font-black" style={{ color: AMBER }}>$49</span>
                </div>
                <p className="text-sm text-slate-400 mb-4">Limited availability — new patients only. Insurance may cover your visit.</p>
                <MagneticButton className="px-8 py-3 rounded-full text-sm font-semibold text-white inline-flex items-center gap-2 cursor-pointer" style={{ background: AMBER } as React.CSSProperties}>
                  Claim This Offer <ArrowRight size={14} weight="bold" />
                </MagneticButton>
              </motion.div>
            </div>
          </ShimmerBorder>
        </div>
      </SectionReveal>

      {/* ═══ SERVICES ═══ */}
      <SectionReveal id="services" className="relative z-10 py-16 md:py-24">
        <div className="absolute inset-0 pointer-events-none opacity-5">
          <svg width="100%" height="100%"><pattern id="chiro-grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke={TEAL_LIGHT} strokeWidth="0.5" /></pattern><rect width="100%" height="100%" fill="url(#chiro-grid)" /></svg>
        </div>
        <div className="mx-auto max-w-7xl px-4 md:px-6 relative">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: AMBER }}>What We Offer</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Comprehensive Chiropractic Services" />
            </h2>
          </div>
          <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {services.map((svc, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="p-6 h-full flex flex-col group hover:border-teal-500/30 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: i % 2 === 0 ? TEAL_GLOW : AMBER_GLOW }}>
                      <svc.icon size={24} weight="duotone" style={{ color: i % 2 === 0 ? TEAL_LIGHT : AMBER_LIGHT }} />
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ background: `${TEAL}22`, color: TEAL_LIGHT }}>{svc.price}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{svc.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed flex-1">{svc.description}</p>
                  <div className="mt-4 pt-4 border-t border-white/8">
                    <span className="text-xs font-medium flex items-center gap-1 cursor-pointer group-hover:gap-2 transition-all" style={{ color: TEAL_LIGHT }}>
                      Learn More <CaretRight size={12} weight="bold" />
                    </span>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ═══ ABOUT ═══ */}
      <SectionReveal id="about" className="relative z-10 py-16 md:py-24">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10" style={{ background: `radial-gradient(circle, ${AMBER} 0%, transparent 70%)`, filter: "blur(80px)" }} />
        </div>
        <div className="mx-auto max-w-7xl px-4 md:px-6 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative rounded-2xl overflow-hidden aspect-[4/3]">
              <img src="https://images.unsplash.com/photo-1706353399656-210cca727a33?w=800&q=80" alt="Chiropractic office" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <GlassCard className="px-4 py-3 inline-flex items-center gap-3">
                  <Heartbeat size={20} weight="duotone" style={{ color: TEAL_LIGHT }} />
                  <span className="text-sm text-white font-medium">Dr. James Chen — Serving Seattle since 2009</span>
                </GlassCard>
              </div>
            </div>
            <div>
              <p className="text-sm uppercase tracking-widest mb-3" style={{ color: AMBER }}>About Our Practice</p>
              <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white mb-6">
                <WordReveal text="Healing Through Alignment" />
              </h2>
              <div className="space-y-4 text-slate-400 leading-relaxed">
                <p>At Align Chiropractic, Dr. James Chen and our team of experienced practitioners believe true health starts with proper spinal alignment. We combine time-tested techniques with modern technology to deliver care that addresses the root cause of your discomfort — not just the symptoms.</p>
                <p>We take a whole-body approach, considering how your spine affects your nervous system, mobility, and overall quality of life. Whether you are recovering from an injury, managing chronic pain, or seeking preventive wellness care, we create personalized treatment plans that get real, measurable results.</p>
              </div>
              <div className="mt-8 grid grid-cols-2 gap-4">
                {[
                  { icon: Certificate, label: "Board Certified Doctors" },
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

      {/* ═══ PATIENT COMFORT ═══ */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: AMBER }}>First Visit?</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Nervous? We Get It." />
            </h2>
            <p className="text-slate-400 mt-4 max-w-lg mx-auto">Many of our most loyal patients were nervous before their first visit. Here is what makes us different.</p>
          </div>
          <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {comfortFeatures.map((f, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="p-6 text-center h-full">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: TEAL_GLOW }}>
                    <f.icon size={28} weight="duotone" style={{ color: TEAL_LIGHT }} />
                  </div>
                  <h3 className="text-base font-semibold text-white mb-2">{f.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{f.description}</p>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ═══ WHERE DOES IT HURT — Body Map Quiz ═══ */}
      <SectionReveal id="quiz" className="relative z-10 py-16 md:py-24">
        <div className="absolute inset-0 pointer-events-none opacity-5">
          <svg width="100%" height="100%"><pattern id="chiro-dots2" width="30" height="30" patternUnits="userSpaceOnUse"><circle cx="15" cy="15" r="1" fill={TEAL_LIGHT} /></pattern><rect width="100%" height="100%" fill="url(#chiro-dots2)" /></svg>
        </div>
        <div className="mx-auto max-w-7xl px-4 md:px-6 relative">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: AMBER }}>Interactive Tool</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Where Does It Hurt?" />
            </h2>
            <p className="text-slate-400 mt-4 max-w-lg mx-auto">Click an area to see common conditions and our recommended treatment approach.</p>
          </div>
          <BodyMapQuiz />
        </div>
      </SectionReveal>

      {/* ═══ PROCESS TIMELINE ═══ */}
      <SectionReveal id="process" className="relative z-10 py-16 md:py-24 overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 md:px-6 relative">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: AMBER }}>How It Works</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Your Path to Wellness" />
            </h2>
          </div>

          <div className="relative max-w-3xl mx-auto">
            <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px" style={{ background: `${TEAL}33` }} />

            <motion.div className="space-y-12" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
              {processSteps.map((step, i) => (
                <motion.div key={i} variants={fadeUp} className={`relative flex items-start gap-6 md:gap-12 ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}>
                  <div className="absolute left-6 md:left-1/2 w-3 h-3 rounded-full -translate-x-1/2 mt-6 z-10" style={{ background: TEAL_LIGHT, boxShadow: `0 0 12px ${TEAL}` }} />

                  <div className={`ml-12 md:ml-0 md:w-[calc(50%-2rem)] ${i % 2 === 0 ? "" : "md:ml-auto"}`}>
                    <GlassCard className="p-5 md:p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: i % 2 === 0 ? TEAL_GLOW : AMBER_GLOW }}>
                          <step.icon size={20} weight="duotone" style={{ color: i % 2 === 0 ? TEAL_LIGHT : AMBER_LIGHT }} />
                        </div>
                        <div>
                          <div className="text-xs font-bold uppercase tracking-widest" style={{ color: AMBER }}>{step.step}</div>
                          <h3 className="text-base font-semibold text-white">{step.title}</h3>
                        </div>
                        <span className="ml-auto px-2 py-1 rounded-lg text-xs" style={{ background: `${TEAL}22`, color: TEAL_LIGHT }}>{step.time}</span>
                      </div>
                      <p className="text-sm text-slate-400 leading-relaxed">{step.description}</p>
                    </GlassCard>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </SectionReveal>

      {/* ═══ SPINAL HEALTH ASSESSMENT ═══ */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: AMBER }}>Self-Assessment</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Check Your Spinal Health" />
            </h2>
            <p className="text-slate-400 mt-4 max-w-md mx-auto">Answer 4 quick questions to get a personalized spinal health score and recommendation.</p>
          </div>
          <SpinalAssessment />
        </div>
      </SectionReveal>

      {/* ═══ CONDITIONS TREATED ═══ */}
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
                <GlassCard className="p-4 flex items-center gap-3 hover:border-teal-500/30 transition-colors">
                  <CheckCircle size={18} weight="duotone" style={{ color: TEAL_LIGHT }} className="shrink-0" />
                  <span className="text-sm text-slate-300">{condition}</span>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ═══ COMPARISON TABLE ═══ */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: AMBER }}>Why Chiropractic?</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Chiropractic vs Pain Medication" />
            </h2>
          </div>
          <GlassCard className="overflow-hidden overflow-x-auto">
            <div className="grid min-w-[440px] grid-cols-3 text-center text-sm">
              <div className="p-4 border-b border-white/15 text-slate-500 font-medium">Feature</div>
              <div className="p-4 border-b border-l border-white/15 font-semibold" style={{ color: TEAL_LIGHT, background: `${TEAL}11` }}>Chiropractic</div>
              <div className="p-4 border-b border-l border-white/15 text-slate-400 font-medium">Medication</div>
              {[
                ["Treats Root Cause", true, false],
                ["Drug-Free", true, false],
                ["Long-Term Relief", true, false],
                ["No Side Effects", true, false],
                ["Improves Mobility", true, false],
                ["Addiction Risk", false, true],
                ["Covered by Insurance", true, true],
                ["Same-Day Results", true, true],
              ].map(([label, chiro, med], i) => (
                <div key={i} className="contents">
                  <div className="p-3 border-b border-white/8 text-slate-400 text-left pl-6">{label as string}</div>
                  <div className="p-3 border-b border-l border-white/8 flex items-center justify-center" style={{ background: `${TEAL}08` }}>
                    {chiro ? <CheckCircle size={18} weight="fill" style={{ color: TEAL_LIGHT }} /> : <X size={18} className="text-slate-600" />}
                  </div>
                  <div className="p-3 border-b border-l border-white/8 flex items-center justify-center">
                    {med ? (
                      (label as string) === "Addiction Risk" ? <Warning size={18} weight="fill" className="text-red-400" /> : <CheckCircle size={18} weight="fill" className="text-slate-500" />
                    ) : <X size={18} className="text-slate-600" />}
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </SectionReveal>

      {/* ═══ TESTIMONIALS — Pain Journey Cards ═══ */}
      <SectionReveal id="testimonials" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/15 bg-white/[0.08] mb-6">
              <Star size={16} weight="fill" style={{ color: AMBER }} />
              <span className="text-sm text-white font-medium">4.9</span>
              <span className="text-xs text-slate-400">from 380+ Google Reviews</span>
            </div>
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: AMBER }}>Patient Stories</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Real Results, Real Relief" />
            </h2>
          </div>

          <motion.div className="space-y-6 mt-12" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {testimonials.map((t, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="p-6 md:p-8">
                  <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-6 items-center">
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ background: TEAL }}>
                          {t.name.charAt(0)}
                        </div>
                        <div>
                          <span className="text-sm font-semibold text-white block">{t.name}</span>
                          <span className="text-xs text-slate-500">{t.visits} visits</span>
                        </div>
                        <div className="ml-auto flex gap-0.5">
                          {Array.from({ length: t.rating }).map((_, j) => (
                            <Star key={j} size={12} weight="fill" style={{ color: AMBER }} />
                          ))}
                        </div>
                      </div>
                      <Quotes size={24} weight="fill" style={{ color: TEAL_LIGHT }} className="mb-2 opacity-30" />
                      <p className="text-slate-300 leading-relaxed text-sm">{t.text}</p>
                    </div>
                    <div className="border-t md:border-t-0 md:border-l border-white/15 pt-4 md:pt-0 md:pl-6">
                      <p className="text-xs uppercase tracking-widest mb-3" style={{ color: AMBER }}>Pain Journey</p>
                      <PainScale before={t.painBefore} after={t.painAfter} />
                      <div className="mt-3 text-center">
                        <span className="text-lg font-bold" style={{ color: TEAL_LIGHT }}>{Math.round(((t.painBefore - t.painAfter) / t.painBefore) * 100)}%</span>
                        <span className="text-xs text-slate-500 ml-1">improvement</span>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ═══ CTA BANNER ═══ */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="rounded-2xl p-8 md:p-12 text-center relative overflow-hidden" style={{ background: TEAL }}>
            <div className="absolute inset-0 opacity-10">
              <svg width="100%" height="100%"><pattern id="cta-dots" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1.5" fill="white" /></pattern><rect width="100%" height="100%" fill="url(#cta-dots)" /></svg>
            </div>
            <div className="relative z-10">
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Live Pain-Free?</h3>
              <p className="text-white/80 mb-6 max-w-md mx-auto">Join 12,000+ patients who chose a better path to wellness. Your first visit is just $49.</p>
              <div className="flex flex-wrap justify-center gap-4">
                <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-teal-900 bg-white flex items-center gap-2 cursor-pointer">
                  Schedule Today <ArrowRight size={18} weight="bold" />
                </MagneticButton>
                <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white border-2 border-white/30 flex items-center gap-2 cursor-pointer">
                  <Phone size={18} weight="duotone" /> (206) 741-2963
                </MagneticButton>
              </div>
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* ═══ FAQ ═══ */}
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

      {/* ═══ INSURANCE ACCEPTED ═══ */}
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
              <p className="text-center text-sm text-slate-500 mt-6">Do not see your provider? Contact us — we work with most plans and offer flexible payment options.</p>
            </div>
          </ShimmerBorder>
        </div>
      </SectionReveal>

      {/* ═══ SERVICE AREAS ═══ */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: AMBER }}>Proudly Serving</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Greater Seattle Area" />
            </h2>
          </div>
          <motion.div className="flex flex-wrap justify-center gap-3" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
            {["Capitol Hill", "Ballard", "Fremont", "Queen Anne", "Wallingford", "Green Lake", "University District", "Ravenna", "Laurelhurst", "Montlake", "Madison Park", "Beacon Hill"].map((area) => (
              <motion.div key={area} variants={fadeUp}>
                <div className="px-4 py-2 rounded-full border border-white/15 bg-white/[0.08] text-sm text-slate-400 flex items-center gap-2">
                  <MapPin size={14} weight="duotone" style={{ color: TEAL_LIGHT }} />
                  {area}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ═══ CONTACT ═══ */}
      <SectionReveal id="contact" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <p className="text-sm uppercase tracking-widest mb-3" style={{ color: AMBER }}>Get Started</p>
              <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white mb-6">
                <WordReveal text="Ready to Feel Better?" />
              </h2>
              <p className="text-slate-400 leading-relaxed max-w-md mb-8">
                Book your first consultation and start your journey to better alignment, less pain, and a healthier life. New patients always welcome — $49 first visit special.
              </p>
              <div className="space-y-4">
                {[
                  { icon: MapPin, label: "Location", value: "1428 NW 56th St\nSeattle, WA 98107", href: "https://maps.google.com/?q=1428+NW+56th+St+Seattle+WA+98107" },
                  { icon: Phone, label: "Phone", value: "(206) 741-2963", href: "tel:+12067412963" },
                  { icon: Clock, label: "Hours", value: "Mon-Fri 8am-7pm\nSaturday 9am-3pm\nSunday Closed" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <item.icon size={20} weight="duotone" style={{ color: TEAL_LIGHT }} className="mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-white">{item.label}</p>
                      {item.href ? (
                        <a href={item.href} target={item.href.startsWith("https") ? "_blank" : undefined} rel="noopener noreferrer" className="text-sm text-slate-400 whitespace-pre-line hover:text-white transition-colors">{item.value}</a>
                      ) : (
                        <p className="text-sm text-slate-400 whitespace-pre-line">{item.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <GlassCard className="p-6 md:p-8">
              <h3 className="text-xl font-semibold text-white mb-6">Request an Appointment</h3>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input type="text" placeholder="First Name" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-teal-500/50" />
                  <input type="text" placeholder="Last Name" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-teal-500/50" />
                </div>
                <input type="email" placeholder="Email Address" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-teal-500/50" />
                <input type="tel" placeholder="Phone Number" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-teal-500/50" />
                <select className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-slate-500 text-sm focus:outline-none focus:border-teal-500/50">
                  <option value="">Select Service</option>
                  {services.map((s, i) => (<option key={i} value={s.title}>{s.title}</option>))}
                </select>
                <textarea placeholder="Describe your condition or concerns..." rows={4} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-teal-500/50 resize-none" />
                <MagneticButton className="w-full py-3 rounded-xl text-sm font-semibold text-white cursor-pointer" style={{ background: TEAL } as React.CSSProperties}>
                  <span className="flex items-center justify-center gap-2"><CalendarCheck size={18} weight="duotone" /> Request Appointment</span>
                </MagneticButton>
              </form>
            </GlassCard>
          </div>
        </div>
      </SectionReveal>

      {/* ═══ FINAL CTA ═══ */}
      <SectionReveal className="relative z-10 py-8 pb-16">
        <div className="mx-auto max-w-3xl px-4 md:px-6">
          <ShimmerBorder>
            <div className="p-6 md:p-8 text-center">
              <h3 className="text-xl font-bold text-white mb-2">Pain-Free Guarantee</h3>
              <p className="text-sm text-slate-400 mb-4">If you do not feel improvement after your first visit, your $49 exam is on us. Zero risk.</p>
              <MagneticButton className="px-8 py-3 rounded-full text-sm font-semibold text-white inline-flex items-center gap-2 cursor-pointer" style={{ background: TEAL } as React.CSSProperties}>
                Claim Your $49 First Visit <ArrowRight size={14} weight="bold" />
              </MagneticButton>
            </div>
          </ShimmerBorder>
        </div>
      </SectionReveal>

      {/* ═══ FOOTER ═══ */}
      <footer className="relative z-10 border-t border-white/8 py-12">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Bone size={24} weight="duotone" style={{ color: TEAL_LIGHT }} />
                <span className="text-lg font-bold text-white">Align Chiropractic</span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed max-w-sm">Expert chiropractic care serving the Greater Seattle area since 2009. We help you move better, feel better, live better.</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-3">Quick Links</h4>
              <div className="space-y-2 text-sm text-slate-400">
                <a href="#services" className="block hover:text-white transition-colors">Services</a>
                <a href="#about" className="block hover:text-white transition-colors">About Us</a>
                <a href="#quiz" className="block hover:text-white transition-colors">Pain Quiz</a>
                <a href="#testimonials" className="block hover:text-white transition-colors">Reviews</a>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-3">Contact</h4>
              <div className="space-y-2 text-sm text-slate-400">
                <a href="tel:+12067412963" className="block hover:text-white transition-colors">(206) 741-2963</a>
                <a href="https://maps.google.com/?q=1428+NW+56th+St+Seattle+WA+98107" target="_blank" rel="noopener noreferrer" className="block hover:text-white transition-colors">1428 NW 56th St</a>
                <p>Seattle, WA 98107</p>
              </div>
            </div>
          </div>
          <div className="border-t border-white/8 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-500">Align Chiropractic &copy; {new Date().getFullYear()}. All rights reserved.</p>
            <p className="text-xs text-slate-600 flex items-center gap-1.5"><svg width="14" height="14" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-sky-500"><path d="M24.3 4.2c-1.5-.4-3.2.1-4.5 1.1-1-.7-2.3-1-3.5-.8-2.4.4-4.2 2.5-4.2 4.9v.6c-3.2.8-6 2.8-7.8 5.6-.3.5-.1 1.1.4 1.4.5.3 1.1.1 1.4-.4 1.5-2.3 3.7-4 6.3-4.7.5-.1 1-.1 1.5 0 .8.2 1.4.8 1.7 1.5.3.8.2 1.6-.2 2.3l-2.8 4.3c-.6.9-.4 2.1.4 2.8l2.5 2.1c.4.3.8.5 1.3.5h5.2c.5 0 1-.2 1.3-.5l1.2-1c.6-.5.8-1.3.6-2l-1-3.2c-.2-.5 0-1.1.4-1.4l3.8-2.5c1.3-.9 2.1-2.3 2.1-3.9V9.6c0-2.5-1.7-4.7-4.1-5.3v-.1z" fill="currentColor"/></svg>Built by <a href="https://bluejayportfolio.com/audit" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "underline" }}>BlueJays</a>{" "}— get your free site audit</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
