"use client";

/* eslint-disable @next/next/no-img-element -- Static marketing showcase intentionally uses plain img tags */
/* eslint-disable react-hooks/purity -- Decorative values are intentionally randomized for static visual effects */

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, useMotionValue, useSpring, useInView, AnimatePresence } from "framer-motion";
import {
  BookOpen, GraduationCap, MathOperations, Atom, PencilLine, Flask,
  Brain, Star, ShieldCheck, Clock, Phone, MapPin, ArrowRight, CheckCircle,
  CaretDown, List, X, Users, Quotes, ChalkboardTeacher, Trophy,
  CalendarCheck, Lightbulb, Target, Exam, Student, CursorClick,
  UserCircle, Certificate, Timer, Notebook, Backpack, ChartLineUp,
} from "@phosphor-icons/react";

/* ───────────────────────── DESIGN TOKENS ───────────────────────── */
const PURPLE = "#7c3aed";
const YELLOW = "#eab308";
const BG = "#ffffff";
const DARK = "#1e1b3a";

const spring = { type: "spring" as const, stiffness: 100, damping: 20 };
const springFast = { type: "spring" as const, stiffness: 200, damping: 25 };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const fadeUp = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: spring } };

/* ───────────────────────── REUSABLE COMPONENTS ───────────────────────── */

function SectionReveal({ children, className = "", id }: { children: React.ReactNode; className?: string; id?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.section ref={ref} id={id} className={className}
      initial={{ opacity: 0, y: 50 }} animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={spring}>{children}</motion.section>
  );
}

function WordReveal({ text, className = "" }: { text: string; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  return (
    <motion.span ref={ref} className={`inline-flex flex-wrap gap-x-3 ${className}`}
      variants={stagger} initial="hidden" animate={isInView ? "show" : "hidden"}>
      {text.split(" ").map((w, i) => <motion.span key={i} variants={fadeUp} className="inline-block">{w}</motion.span>)}
    </motion.span>
  );
}

function MagneticButton({ children, className = "", onClick, style }: { children: React.ReactNode; className?: string; onClick?: () => void; style?: React.CSSProperties }) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0); const y = useMotionValue(0);
  const sx = useSpring(x, springFast); const sy = useSpring(y, springFast);
  const isTD = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
  const mm = useCallback((e: React.MouseEvent) => { if (!ref.current || isTD) return; const r = ref.current.getBoundingClientRect(); x.set((e.clientX - (r.left + r.width / 2)) * 0.25); y.set((e.clientY - (r.top + r.height / 2)) * 0.25); }, [x, y, isTD]);
  const ml = useCallback(() => { x.set(0); y.set(0); }, [x, y]);
  return <motion.button ref={ref} style={{ x: sx, y: sy, willChange: "transform", ...style }} onMouseMove={mm} onMouseLeave={ml} onClick={onClick} className={className} whileTap={{ scale: 0.97 }}>{children}</motion.button>;
}

function ShimmerBorder({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative rounded-2xl p-[1px] overflow-hidden ${className}`}>
      <motion.div className="absolute inset-0 rounded-2xl"
        style={{ background: `conic-gradient(from 0deg, transparent, ${PURPLE}, transparent, ${YELLOW}, transparent)`, willChange: "transform" }}
        animate={{ rotate: [0, 360] }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} />
      <div className="relative rounded-2xl bg-white z-10">{children}</div>
    </div>
  );
}

function SectionBadge({ text, color = PURPLE }: { text: string; color?: string }) {
  return <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color, borderColor: `${color}33`, background: `${color}0d` }}>{text}</span>;
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight" style={{ color: DARK }}>{children}</h2>;
}

function AccentLine({ color = PURPLE }: { color?: string }) {
  return <div className="h-1 w-16 mx-auto mt-4 rounded-full" style={{ background: `linear-gradient(to right, ${color}, ${color}44)` }} />;
}

/* ───────────────────────── TYPEWRITER HOOK ───────────────────────── */
function useTypewriter(text: string, speed = 80, delay = 500) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => {
    let i = 0;
    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        i++;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) { clearInterval(interval); setDone(true); }
      }, speed);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timeout);
  }, [text, speed, delay]);
  return { displayed, done };
}

/* ───────────────────────── GEOMETRIC PATTERN BG ───────────────────────── */
function GridPattern({ opacity = 0.04 }: { opacity?: number }) {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }}>
      <defs>
        <pattern id="acadGrid" width="60" height="60" patternUnits="userSpaceOnUse">
          <path d="M 60 0 L 0 0 0 60" fill="none" stroke={PURPLE} strokeWidth="0.4" />
          <circle cx="30" cy="30" r="1" fill={YELLOW} opacity="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#acadGrid)" />
    </svg>
  );
}

/* ───────────────────────── DATA ───────────────────────── */
const subjects = [
  { name: "Math", desc: "Algebra, geometry, calculus, and statistics for every level. We make numbers make sense.", icon: MathOperations },
  { name: "Reading & Writing", desc: "Comprehension, essays, grammar, and creative writing. Build strong communication skills.", icon: PencilLine },
  { name: "Science", desc: "Biology, chemistry, physics, and earth science through hands-on learning and critical thinking.", icon: Flask },
  { name: "SAT/ACT Prep", desc: "Proven strategies that boost scores. Practice tests, timed drills, and personalized study plans.", icon: Exam },
  { name: "AP Courses", desc: "AP Calculus, AP English, AP Biology, AP History, and more. Earn college credit in high school.", icon: Certificate },
  { name: "Study Skills", desc: "Time management, note-taking, test-taking strategies, and organizational skills that last a lifetime.", icon: Lightbulb },
  { name: "College Prep", desc: "College essays, application strategy, scholarship research, and admissions coaching.", icon: GraduationCap },
  { name: "Special Needs", desc: "Specialized support for students with ADHD, dyslexia, and learning differences. Patience-first.", icon: Brain },
];

const tutors = [
  { name: "Dr. Rachel Torres", role: "Founder & Lead Educator", specialty: "Math & SAT Prep", bio: "PhD in Education, 11 years of AP teaching experience. Former curriculum developer for Seattle Public Schools.", img: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&q=80" },
  { name: "Marcus Chen", role: "Science & AP Instructor", specialty: "Physics & Chemistry", bio: "MS in Physics from UW. Makes complex concepts click with real-world experiments and visual learning.", img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80" },
  { name: "Priya Patel", role: "Reading & Writing Specialist", specialty: "English & College Essays", bio: "MFA in Creative Writing. Published author who transforms reluctant writers into confident communicators.", img: "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=400&q=80" },
  { name: "James Okafor", role: "Test Prep Strategist", specialty: "SAT/ACT & Study Skills", bio: "Perfect SAT scorer. Developed a test-taking methodology that has helped 500+ students improve by 200+ points.", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80" },
];

const gradeLevels = [
  { level: "Elementary", range: "K-5", desc: "Build strong foundations in reading, math, and study habits early.", icon: Backpack, color: YELLOW },
  { level: "Middle School", range: "6-8", desc: "Bridge the gap between elementary and high school with targeted support.", icon: Notebook, color: PURPLE },
  { level: "High School", range: "9-12", desc: "Excel in AP courses, prepare for SAT/ACT, and build college-ready skills.", icon: GraduationCap, color: YELLOW },
  { level: "College", range: "Undergrad", desc: "Get support with college-level coursework, writing, and exam preparation.", icon: Certificate, color: PURPLE },
];

const successStories = [
  { name: "Emma W.", before: "SAT: 1180", after: "SAT: 1420", improvement: "+240 points", subject: "SAT Prep", quote: "Dr. Torres made test prep actually enjoyable. I never thought I could break 1400." },
  { name: "Jayden M.", before: "Algebra: D+", after: "Algebra: A-", improvement: "3 grade levels", subject: "Math", quote: "Marcus explained things in a way that finally clicked. Math isn't scary anymore." },
  { name: "Sofia R.", before: "Reading: Below grade", after: "Reading: Above grade", improvement: "2 grade levels", subject: "Reading", quote: "Priya turned my daughter into a bookworm. She reads for fun now." },
  { name: "Aiden K.", before: "ACT: 24", after: "ACT: 32", improvement: "+8 points", subject: "ACT Prep", quote: "James taught me strategies I never learned in school. My score opened doors to scholarships." },
];

const testimonials = [
  { name: "Jennifer Park", role: "Parent of 10th Grader", text: "My daughter went from a C- to an A in algebra in just two months. The tutors genuinely care about each student.", rating: 5 },
  { name: "David & Kim Liu", role: "Parents of SAT Student", text: "SAT prep was a game-changer. Our son scored 280 points higher and got into his top-choice university. Worth every penny.", rating: 5 },
  { name: "Maria Gonzalez", role: "Parent of 6th Grader", text: "Finding the right support for my child with ADHD was crucial. They understand learning differences and my son actually looks forward to sessions.", rating: 5 },
  { name: "Robert Chen", role: "Parent of AP Student", text: "Three AP 5s this year. Dr. Torres and her team know exactly how to prepare students for the highest levels of academic achievement.", rating: 5 },
  { name: "Amara Johnson", role: "College Freshman", text: "The college prep program helped me write an essay that got me into three Ivy League schools. I could not have done it alone.", rating: 5 },
];

const pricing = [
  { name: "1-on-1 Tutoring", price: "$60", unit: "/hr", desc: "Personalized sessions tailored to your student's specific needs and learning style.", features: ["Custom learning plan", "Progress reports", "Homework help between sessions", "Flexible scheduling"], popular: false },
  { name: "Small Group", price: "$35", unit: "/hr per student", desc: "2-4 students learning together. Great for study groups and peer motivation.", features: ["Groups of 2-4 students", "Collaborative learning", "Subject-focused sessions", "Sibling discounts available"], popular: true },
  { name: "SAT Prep Package", price: "$799", unit: "", desc: "Complete 8-week intensive program with practice tests and score guarantee.", features: ["16 one-on-one sessions", "4 full practice tests", "Custom study plan", "200+ point guarantee"], popular: false },
];

const comparisonRows = [
  { feature: "Certified, background-checked tutors", us: true, them: "Sometimes" },
  { feature: "Personalized learning plans", us: true, them: "No" },
  { feature: "Progress tracking & parent reports", us: true, them: "Rarely" },
  { feature: "Score improvement guarantee", us: true, them: "No" },
  { feature: "In-person AND online options", us: true, them: "Varies" },
  { feature: "All subjects K-12 + College", us: true, them: "Limited" },
  { feature: "Free initial assessment", us: true, them: "No" },
];

const faqs = [
  { q: "What ages and grades do you tutor?", a: "We tutor students from kindergarten through 12th grade, plus college-level support for select subjects. Our tutors are matched based on age, subject expertise, and learning style compatibility." },
  { q: "How are your tutors selected?", a: "All tutors hold advanced degrees in their subject area, pass thorough background checks, and complete our proprietary training program. Many are former AP teachers and certified educators with 5+ years of experience." },
  { q: "What is the session format?", a: "Sessions are 60 minutes, available in-person at our University Way center or online via Zoom. We recommend 1-2 sessions per week for optimal progress, with homework support available between sessions." },
  { q: "Do you offer a satisfaction guarantee?", a: "Yes. If your child does not improve by at least one letter grade within the first 12 sessions, the 13th session is on us. For SAT/ACT prep, we guarantee a 200+ point improvement or additional sessions free." },
  { q: "Can I switch tutors if it is not a good fit?", a: "Absolutely. We want the best match for your student. If the pairing is not working, let us know and we will reassign a new tutor within 48 hours at no extra charge." },
];

const quizOptions = [
  { label: "Falling behind in class", emoji: "Struggling", recommendation: "1-on-1 tutoring to catch up and build confidence", urgency: "high" },
  { label: "Preparing for SAT/ACT", emoji: "Test Prep", recommendation: "Our SAT Prep Package with guaranteed score improvement", urgency: "medium" },
  { label: "Wants to get ahead", emoji: "Accelerate", recommendation: "AP course prep and enrichment sessions", urgency: "low" },
];

const schedule = [
  { day: "Monday", hours: "3:00 PM - 8:00 PM", available: true },
  { day: "Tuesday", hours: "3:00 PM - 8:00 PM", available: true },
  { day: "Wednesday", hours: "3:00 PM - 8:00 PM", available: true },
  { day: "Thursday", hours: "3:00 PM - 8:00 PM", available: true },
  { day: "Friday", hours: "3:00 PM - 7:00 PM", available: true },
  { day: "Saturday", hours: "9:00 AM - 4:00 PM", available: true },
  { day: "Sunday", hours: "Closed", available: false },
];

/* ───────────────────────── MAIN COMPONENT ───────────────────────── */
export default function V2TutoringShowcase() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [activeGrade, setActiveGrade] = useState(0);

  const { displayed: typedText, done: typingDone } = useTypewriter("Understanding", 90, 600);

  return (
    <main className="tutor-v2 relative min-h-[100dvh] overflow-x-hidden" style={{ background: BG, color: DARK }}>

      {/* ──── NAV ──── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b" style={{ borderColor: `${PURPLE}15` }}>
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen size={26} weight="fill" style={{ color: PURPLE }} />
            <span className="text-lg font-bold tracking-tight" style={{ color: DARK }}>Bright Minds Tutoring</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-slate-500">
            {["Subjects", "Tutors", "Pricing", "Results", "Contact"].map((l) => (
              <a key={l} href={`#${l.toLowerCase()}`} className="hover:text-purple-700 transition-colors font-medium">{l}</a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <MagneticButton className="px-5 py-2.5 rounded-full text-sm font-semibold text-white cursor-pointer shadow-lg shadow-purple-500/20" style={{ background: PURPLE }}>
              Book a Free Assessment
            </MagneticButton>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-lg hover:bg-purple-50 transition-colors" style={{ color: DARK }}>
              {mobileMenuOpen ? <X size={24} /> : <List size={24} />}
            </button>
          </div>
        </div>
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="md:hidden overflow-hidden bg-white border-t" style={{ borderColor: `${PURPLE}15` }}>
              <div className="flex flex-col gap-1 px-4 py-4">
                {["Subjects", "Tutors", "Pricing", "Results", "Contact"].map((l) => (
                  <a key={l} href={`#${l.toLowerCase()}`} onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-lg text-sm text-slate-600 hover:text-purple-700 hover:bg-purple-50 transition-colors font-medium">{l}</a>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ──── HERO — TYPEWRITER TEXT REVEAL ──── */}
      <section className="relative min-h-[100dvh] flex items-center pt-20 pb-16 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, #f8f6ff 0%, ${BG} 50%, #fffef5 100%)` }} />
        <GridPattern opacity={0.035} />
        <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] rounded-full blur-[200px] pointer-events-none" style={{ background: `${PURPLE}0c` }} />
        <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] rounded-full blur-[160px] pointer-events-none" style={{ background: `${YELLOW}0a` }} />

        <div className="relative z-10 mx-auto max-w-4xl px-6 w-full text-center">
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.2 }}
            className="text-sm uppercase tracking-[0.3em] mb-6 font-semibold" style={{ color: PURPLE }}>
            Where
          </motion.p>

          <div className="mb-4">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-none" style={{ color: DARK }}>
              {typedText}
              <motion.span animate={{ opacity: [1, 0] }} transition={{ duration: 0.6, repeat: Infinity, ease: "steps(1)" }}
                className="inline-block w-[3px] h-[0.85em] ml-1 align-baseline rounded-sm" style={{ background: PURPLE }} />
            </h1>
          </div>

          <AnimatePresence>
            {typingDone && (
              <motion.h2 initial={{ opacity: 0, y: 20, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 150, damping: 15 }}
                className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-none" style={{ color: PURPLE }}>
                Clicks.
              </motion.h2>
            )}
          </AnimatePresence>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5 }} className="mt-8 flex flex-wrap justify-center gap-3">
            {["K-12", "SAT/ACT", "AP Courses", "College Prep"].map((pill) => (
              <span key={pill} className="px-4 py-2 rounded-full text-sm font-semibold border" style={{ color: PURPLE, borderColor: `${PURPLE}30`, background: `${PURPLE}08` }}>{pill}</span>
            ))}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 3 }} className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <MagneticButton className="px-8 py-4 rounded-full text-base font-bold text-white flex items-center gap-2 cursor-pointer shadow-xl shadow-purple-500/25" style={{ background: PURPLE }}>
              Book a Free Assessment <ArrowRight size={18} weight="bold" />
            </MagneticButton>
            <a href="tel:+12063748295" className="flex items-center gap-2 px-6 py-4 rounded-full text-base font-semibold border-2 hover:bg-purple-50 transition-colors" style={{ color: PURPLE, borderColor: `${PURPLE}30` }}>
              <Phone size={18} weight="fill" /> (206) 374-8295
            </a>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3.5 }} className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-slate-500">
            <span className="flex items-center gap-2"><MapPin size={16} weight="fill" style={{ color: PURPLE }} /> University District, Seattle</span>
            <span className="flex items-center gap-2"><Clock size={16} weight="fill" style={{ color: PURPLE }} /> In-Person & Online</span>
            <span className="flex items-center gap-2"><Star size={16} weight="fill" style={{ color: YELLOW }} /> 4.9 Rating (280+ Reviews)</span>
          </motion.div>
        </div>
      </section>

      {/* ──── TRUST BAR ──── */}
      <SectionReveal className="relative z-10 py-6 border-y overflow-hidden" style={{ borderColor: `${PURPLE}10`, background: `${PURPLE}04` } as React.CSSProperties}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: "3,000+", label: "Students Tutored", icon: Users },
              { value: "95%", label: "Grade Improvement", icon: ChartLineUp },
              { value: "200+", label: "Avg SAT Boost", icon: Trophy },
              { value: "4.9★", label: "Parent Rating", icon: Star },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center gap-1">
                <stat.icon size={20} weight="fill" style={{ color: PURPLE }} />
                <span className="text-2xl md:text-3xl font-black" style={{ color: DARK }}>{stat.value}</span>
                <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ──── SUBJECT GRID ──── */}
      <SectionReveal id="subjects" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <GridPattern opacity={0.025} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <SectionBadge text="Subjects" />
            <SectionHeading>What We Teach</SectionHeading>
            <AccentLine />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {subjects.map((sub, i) => {
              const Icon = sub.icon;
              const isYellow = i % 3 === 1;
              const accent = isYellow ? YELLOW : PURPLE;
              return (
                <motion.div key={sub.name} whileHover={{ y: -6, scale: 1.02 }} transition={spring}
                  className="group relative p-6 rounded-2xl border bg-white shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
                  style={{ borderColor: `${accent}20` }}>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: `radial-gradient(circle at 50% 0%, ${accent}10, transparent 70%)` }} />
                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: `${accent}15` }}>
                      <Icon size={24} weight="duotone" style={{ color: accent }} />
                    </div>
                    <h3 className="text-base font-bold mb-2" style={{ color: DARK }}>{sub.name}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">{sub.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </SectionReveal>

      {/* ──── GRADE LEVEL SELECTOR ──── */}
      <SectionReveal className="relative z-10 py-24 md:py-32 overflow-hidden" style={{ background: `linear-gradient(180deg, #f8f6ff 0%, ${BG} 100%)` } as React.CSSProperties}>
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <div className="text-center mb-12">
            <SectionBadge text="Grade Levels" color={YELLOW} />
            <SectionHeading>Every Age. Every Stage.</SectionHeading>
            <AccentLine color={YELLOW} />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {gradeLevels.map((gl, i) => {
              const Icon = gl.icon;
              const isActive = activeGrade === i;
              return (
                <button key={gl.level} onClick={() => setActiveGrade(i)}
                  className={`p-5 rounded-2xl border-2 text-left transition-all duration-300 cursor-pointer ${isActive ? "shadow-lg scale-[1.03]" : "hover:shadow-md"}`}
                  style={{ borderColor: isActive ? gl.color : `${gl.color}20`, background: isActive ? `${gl.color}10` : "white" }}>
                  <Icon size={28} weight={isActive ? "fill" : "duotone"} style={{ color: gl.color }} className="mb-3" />
                  <p className="text-lg font-bold" style={{ color: DARK }}>{gl.level}</p>
                  <p className="text-sm font-semibold" style={{ color: gl.color }}>{gl.range}</p>
                </button>
              );
            })}
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={activeGrade} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={spring}
              className="p-8 rounded-2xl border bg-white shadow-sm text-center" style={{ borderColor: `${gradeLevels[activeGrade].color}30` }}>
              <p className="text-lg text-slate-600 leading-relaxed max-w-xl mx-auto">{gradeLevels[activeGrade].desc}</p>
              <MagneticButton className="mt-6 px-6 py-3 rounded-full text-sm font-bold text-white cursor-pointer" style={{ background: gradeLevels[activeGrade].color }}>
                Enroll {gradeLevels[activeGrade].level} Student <ArrowRight size={16} weight="bold" className="inline ml-1" />
              </MagneticButton>
            </motion.div>
          </AnimatePresence>
        </div>
      </SectionReveal>

      {/* ──── ABOUT DR. RACHEL TORRES ──── */}
      <SectionReveal id="about" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <GridPattern opacity={0.02} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="relative">
              <div className="rounded-2xl overflow-hidden border shadow-lg" style={{ borderColor: `${PURPLE}20` }}>
                <img src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&q=80" alt="Dr. Rachel Torres teaching students" className="w-full h-[420px] object-cover" />
              </div>
              <div className="absolute -bottom-4 -right-4 md:bottom-6 md:-right-6">
                <div className="px-5 py-3 rounded-xl border text-white font-bold text-sm shadow-lg" style={{ background: PURPLE, borderColor: `${PURPLE}80` }}>
                  <GraduationCap size={16} weight="fill" className="inline mr-2" />PhD in Education
                </div>
              </div>
              <div className="absolute -top-3 -left-3">
                <div className="px-4 py-2 rounded-lg border text-sm font-bold shadow-md" style={{ background: YELLOW, color: DARK, borderColor: `${YELLOW}80` }}>
                  11 Years Teaching
                </div>
              </div>
            </div>
            <div>
              <SectionBadge text="About Us" />
              <SectionHeading>Led by Dr. Rachel Torres</SectionHeading>
              <p className="text-slate-500 leading-relaxed mt-6 mb-4">
                Bright Minds Tutoring was founded by Dr. Rachel Torres, a former AP teacher with a PhD in Education and 11 years of classroom experience in Seattle. After watching too many bright students fall through the cracks of one-size-fits-all education, she built something better.
              </p>
              <p className="text-slate-500 leading-relaxed mb-8">
                Our University District center brings together certified educators who share one belief: every student can succeed when they get the right support at the right time. We do not just help with homework. We build learners.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Certificate, label: "PhD-Led Team" },
                  { icon: CheckCircle, label: "Proven Methods" },
                  { icon: Star, label: "4.9 Star Rated" },
                  { icon: Users, label: "All Ages K-College" },
                ].map((b) => (
                  <div key={b.label} className="p-4 rounded-xl border flex items-center gap-3 bg-white shadow-sm" style={{ borderColor: `${PURPLE}15` }}>
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${PURPLE}12` }}>
                      <b.icon size={20} weight="duotone" style={{ color: PURPLE }} />
                    </div>
                    <span className="text-sm font-semibold" style={{ color: DARK }}>{b.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* ──── TUTOR PROFILES ──── */}
      <SectionReveal id="tutors" className="relative z-10 py-24 md:py-32 overflow-hidden" style={{ background: `linear-gradient(180deg, ${BG} 0%, #fffef5 50%, ${BG} 100%)` } as React.CSSProperties}>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <SectionBadge text="Our Tutors" color={YELLOW} />
            <SectionHeading>Meet the Team</SectionHeading>
            <AccentLine color={YELLOW} />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tutors.map((tutor) => (
              <motion.div key={tutor.name} whileHover={{ y: -8 }} transition={spring}
                className="rounded-2xl border bg-white overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300" style={{ borderColor: `${PURPLE}15` }}>
                <div className="relative h-52 overflow-hidden">
                  <img src={tutor.img} alt={tutor.name} className="w-full h-full object-cover object-top" />
                  <div className="absolute bottom-0 left-0 right-0 p-3" style={{ background: `linear-gradient(to top, ${DARK}ee, transparent)` }}>
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-bold text-white" style={{ background: `${PURPLE}cc` }}>{tutor.specialty}</span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-base font-bold" style={{ color: DARK }}>{tutor.name}</h3>
                  <p className="text-xs font-semibold mb-2" style={{ color: PURPLE }}>{tutor.role}</p>
                  <p className="text-sm text-slate-500 leading-relaxed">{tutor.bio}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ──── OUR APPROACH (4-STEP) ──── */}
      <SectionReveal className="relative z-10 py-24 md:py-32 overflow-hidden">
        <GridPattern opacity={0.02} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <SectionBadge text="Our Process" />
            <SectionHeading>How We Help Students Succeed</SectionHeading>
            <AccentLine />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: "01", title: "Free Assessment", desc: "We evaluate learning style, strengths, and gaps with a comprehensive diagnostic test.", icon: Target },
              { step: "02", title: "Custom Plan", desc: "Your child gets a personalized learning plan aligned with school curriculum and goals.", icon: Notebook },
              { step: "03", title: "Expert Tutoring", desc: "Engaging, interactive 1-on-1 sessions tailored to your child's pace and learning style.", icon: ChalkboardTeacher },
              { step: "04", title: "Track Progress", desc: "Regular reports, parent conferences, and measurable improvement in grades and confidence.", icon: ChartLineUp },
            ].map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={step.step} className="relative">
                  {i < 3 && <div className="hidden lg:block absolute top-12 left-[calc(50%+50px)] w-[calc(100%-100px)] h-[2px]" style={{ background: `linear-gradient(to right, ${PURPLE}30, ${PURPLE}08)` }} />}
                  <div className="p-6 rounded-2xl border bg-white text-center shadow-sm hover:shadow-lg transition-shadow" style={{ borderColor: `${PURPLE}15` }}>
                    <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-xl font-black" style={{ background: `${PURPLE}10`, color: PURPLE, border: `2px solid ${PURPLE}25` }}>
                      {step.step}
                    </div>
                    <Icon size={24} weight="duotone" style={{ color: YELLOW }} className="mx-auto mb-3" />
                    <h3 className="text-lg font-bold mb-2" style={{ color: DARK }}>{step.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </SectionReveal>

      {/* ──── WHY BRIGHT MINDS (DIFFERENTIATORS) ──── */}
      <SectionReveal className="relative z-10 py-24 md:py-32 overflow-hidden" style={{ background: `linear-gradient(180deg, #fffef5 0%, ${BG} 100%)` } as React.CSSProperties}>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <SectionBadge text="Why Us" color={YELLOW} />
            <SectionHeading>Why Families Choose Bright Minds</SectionHeading>
            <AccentLine color={YELLOW} />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Certificate,
                title: "PhD-Led Instruction",
                desc: "Every learning plan is designed or reviewed by Dr. Torres. Our tutors hold advanced degrees and complete 40+ hours of proprietary training before their first session.",
              },
              {
                icon: Target,
                title: "Diagnostic-First Approach",
                desc: "We do not guess. Every student starts with a comprehensive diagnostic that identifies exact gaps, learning style, and strengths. Then we build a plan around the data.",
              },
              {
                icon: ChartLineUp,
                title: "Measurable Progress",
                desc: "Parents receive detailed progress reports every four sessions. We track grades, test scores, homework completion, and confidence levels so you can see the growth.",
              },
              {
                icon: Users,
                title: "Matched Tutor Pairing",
                desc: "We do not just assign the next available tutor. We match based on subject expertise, teaching style, personality, and your student's learning preferences.",
              },
              {
                icon: Lightbulb,
                title: "Beyond Homework Help",
                desc: "We teach students HOW to learn, not just what to memorize. Study skills, time management, and test-taking strategies that carry into college and beyond.",
              },
              {
                icon: ShieldCheck,
                title: "Grade Improvement Guarantee",
                desc: "If your child does not improve by at least one letter grade in 12 sessions, the 13th session is free. For SAT/ACT, we guarantee 200+ point improvement.",
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <motion.div key={item.title} whileHover={{ y: -4 }} transition={spring}
                  className="p-7 rounded-2xl border bg-white shadow-sm hover:shadow-lg transition-all" style={{ borderColor: `${PURPLE}12` }}>
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5" style={{ background: `linear-gradient(135deg, ${PURPLE}15, ${YELLOW}15)` }}>
                    <Icon size={28} weight="duotone" style={{ color: PURPLE }} />
                  </div>
                  <h3 className="text-lg font-bold mb-2" style={{ color: DARK }}>{item.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </SectionReveal>

      {/* ──── LEARNING ENVIRONMENT GALLERY ──── */}
      <SectionReveal className="relative z-10 py-24 md:py-32 overflow-hidden">
        <GridPattern opacity={0.02} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <SectionBadge text="Our Space" />
            <SectionHeading>A Space Designed for Learning</SectionHeading>
            <AccentLine />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { src: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=500&q=80", alt: "Student studying at desk", span: "col-span-2 md:col-span-1 row-span-2" },
              { src: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=500&q=80", alt: "Group study session", span: "" },
              { src: "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?w=500&q=80", alt: "Tutoring library corner", span: "" },
              { src: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=500&q=80", alt: "Students collaborating", span: "col-span-2 md:col-span-1" },
              { src: "https://images.unsplash.com/photo-1577896851231-70ef18881754?w=500&q=80", alt: "One-on-one tutoring session", span: "col-span-2 md:col-span-2" },
            ].map((img, i) => (
              <div key={i} className={`rounded-2xl overflow-hidden border shadow-sm hover:shadow-lg transition-shadow group ${img.span}`} style={{ borderColor: `${PURPLE}15` }}>
                <img src={img.src} alt={img.alt} className="w-full h-full min-h-[180px] object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ──── SUBJECTS WE COVER (DETAILED) ──── */}
      <SectionReveal className="relative z-10 py-24 md:py-32 overflow-hidden" style={{ background: `linear-gradient(180deg, #f8f6ff 0%, ${BG} 100%)` } as React.CSSProperties}>
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <div className="text-center mb-12">
            <SectionBadge text="Curriculum" />
            <SectionHeading>What We Cover in Each Subject</SectionHeading>
            <AccentLine />
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                subject: "Math",
                topics: ["Algebra I & II", "Geometry & Trigonometry", "Pre-Calculus & Calculus", "Statistics & Probability", "AP Calculus AB/BC"],
                color: PURPLE,
              },
              {
                subject: "Reading & Writing",
                topics: ["Reading Comprehension", "Essay Writing & Structure", "Grammar & Mechanics", "AP English Language/Literature", "College Application Essays"],
                color: YELLOW,
              },
              {
                subject: "Science",
                topics: ["Biology & AP Biology", "Chemistry & AP Chemistry", "Physics & AP Physics", "Earth & Environmental Science", "Lab Skills & Scientific Method"],
                color: PURPLE,
              },
              {
                subject: "Test Prep",
                topics: ["SAT Math & Verbal", "ACT Composite Strategy", "PSAT / National Merit", "AP Exam Preparation", "Timed Practice & Analysis"],
                color: YELLOW,
              },
            ].map((sub) => (
              <div key={sub.subject} className="p-6 rounded-2xl border bg-white shadow-sm" style={{ borderColor: `${sub.color}20` }}>
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: DARK }}>
                  <span className="w-2 h-8 rounded-full" style={{ background: sub.color }} />
                  {sub.subject}
                </h3>
                <ul className="space-y-2.5">
                  {sub.topics.map((topic) => (
                    <li key={topic} className="flex items-center gap-3 text-sm text-slate-600">
                      <CheckCircle size={16} weight="fill" style={{ color: sub.color }} />
                      {topic}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ──── ENROLLMENT URGENCY BANNER ──── */}
      <SectionReveal className="relative z-10 py-12 overflow-hidden" style={{ background: `${YELLOW}0c` } as React.CSSProperties}>
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 rounded-2xl border bg-white shadow-md" style={{ borderColor: `${YELLOW}30` }}>
            <div className="flex items-center gap-4">
              <div className="relative flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: YELLOW }} />
                <span className="relative inline-flex rounded-full h-4 w-4" style={{ background: YELLOW }} />
              </div>
              <div>
                <p className="text-base font-bold" style={{ color: DARK }}>Limited Spots for Summer SAT Prep</p>
                <p className="text-sm text-slate-500">Our 8-week intensive program fills fast. Only 12 seats per cohort.</p>
              </div>
            </div>
            <MagneticButton className="px-6 py-3 rounded-full text-sm font-bold text-white cursor-pointer whitespace-nowrap shadow-lg" style={{ background: PURPLE }}>
              Reserve Your Spot
            </MagneticButton>
          </div>
        </div>
      </SectionReveal>

      {/* ──── SUCCESS STORIES (SCORE IMPROVEMENTS) ──── */}
      <SectionReveal id="results" className="relative z-10 py-24 md:py-32 overflow-hidden" style={{ background: `linear-gradient(180deg, #f8f6ff 0%, ${BG} 100%)` } as React.CSSProperties}>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <SectionBadge text="Results" color={YELLOW} />
            <SectionHeading>Real Students. Real Results.</SectionHeading>
            <AccentLine color={YELLOW} />
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {successStories.map((story) => (
              <motion.div key={story.name} whileHover={{ scale: 1.02 }} transition={spring}
                className="p-6 rounded-2xl border bg-white shadow-sm hover:shadow-lg transition-all" style={{ borderColor: `${PURPLE}15` }}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium px-3 py-1 rounded-full bg-red-50 text-red-600 line-through">{story.before}</span>
                    <ArrowRight size={16} style={{ color: PURPLE }} />
                    <span className="text-sm font-bold px-3 py-1 rounded-full" style={{ background: `${PURPLE}12`, color: PURPLE }}>{story.after}</span>
                  </div>
                  <span className="ml-auto px-3 py-1 rounded-full text-xs font-black" style={{ background: `${YELLOW}20`, color: "#92710a" }}>{story.improvement}</span>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed mb-3 italic">&ldquo;{story.quote}&rdquo;</p>
                <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: `${PURPLE}10` }}>
                  <span className="text-sm font-bold" style={{ color: DARK }}>{story.name}</span>
                  <span className="text-xs font-semibold px-2 py-1 rounded" style={{ background: `${PURPLE}08`, color: PURPLE }}>{story.subject}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ──── PRICING ──── */}
      <SectionReveal id="pricing" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <GridPattern opacity={0.02} />
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <SectionBadge text="Pricing" />
            <SectionHeading>Simple, Transparent Pricing</SectionHeading>
            <AccentLine />
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {pricing.map((plan) => (
              <motion.div key={plan.name} whileHover={{ y: -6 }} transition={spring}
                className={`p-7 rounded-2xl border bg-white shadow-sm hover:shadow-xl transition-all relative ${plan.popular ? "ring-2" : ""}`}
                style={{ borderColor: `${PURPLE}15`, ...(plan.popular ? { ["--tw-ring-color" as string]: PURPLE } : {}) }}>
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold text-white" style={{ background: PURPLE }}>Most Popular</span>
                )}
                <h3 className="text-lg font-bold mb-1" style={{ color: DARK }}>{plan.name}</h3>
                <div className="mb-3">
                  <span className="text-4xl font-black" style={{ color: PURPLE }}>{plan.price}</span>
                  <span className="text-sm text-slate-400 ml-1">{plan.unit}</span>
                </div>
                <p className="text-sm text-slate-500 mb-5">{plan.desc}</p>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                      <CheckCircle size={16} weight="fill" style={{ color: PURPLE }} />{f}
                    </li>
                  ))}
                </ul>
                <MagneticButton className="w-full py-3 rounded-xl text-sm font-bold cursor-pointer text-white" style={{ background: plan.popular ? PURPLE : `${PURPLE}15`, color: plan.popular ? "white" : PURPLE }}>
                  Get Started
                </MagneticButton>
              </motion.div>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ──── COMPETITOR COMPARISON ──── */}
      <SectionReveal className="relative z-10 py-24 md:py-32 overflow-hidden" style={{ background: `linear-gradient(180deg, #fffef5 0%, ${BG} 100%)` } as React.CSSProperties}>
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <div className="text-center mb-12">
            <SectionBadge text="Compare" color={YELLOW} />
            <SectionHeading>Bright Minds vs. The Competition</SectionHeading>
            <AccentLine color={YELLOW} />
          </div>
          <div className="rounded-2xl border overflow-hidden bg-white shadow-sm" style={{ borderColor: `${PURPLE}15` }}>
            <div className="grid grid-cols-3 text-center text-sm font-bold py-4 border-b" style={{ background: `${PURPLE}06`, borderColor: `${PURPLE}10` }}>
              <span className="text-slate-500">Feature</span>
              <span style={{ color: PURPLE }}>Bright Minds</span>
              <span className="text-slate-400">Others</span>
            </div>
            {comparisonRows.map((row, i) => (
              <div key={row.feature} className={`grid grid-cols-3 text-center text-sm py-4 px-4 ${i < comparisonRows.length - 1 ? "border-b" : ""}`} style={{ borderColor: `${PURPLE}08` }}>
                <span className="text-left text-slate-600 font-medium">{row.feature}</span>
                <span><CheckCircle size={20} weight="fill" style={{ color: PURPLE }} className="mx-auto" /></span>
                <span className="text-slate-400">{row.them}</span>
              </div>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ──── GOOGLE REVIEWS HEADER + TESTIMONIALS ──── */}
      <SectionReveal className="relative z-10 py-24 md:py-32 overflow-hidden">
        <GridPattern opacity={0.02} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-6">
            <SectionBadge text="Reviews" />
            <SectionHeading>What Parents &amp; Students Say</SectionHeading>
            <AccentLine />
          </div>
          {/* Google reviews summary */}
          <div className="flex items-center justify-center gap-3 mb-12">
            <div className="flex gap-0.5">{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={22} weight="fill" style={{ color: YELLOW }} />)}</div>
            <span className="text-lg font-bold" style={{ color: DARK }}>4.9</span>
            <span className="text-sm text-slate-400">from 280+ Google reviews</span>
          </div>
          {/* Staggered masonry-like grid */}
          <div className="columns-1 md:columns-2 lg:columns-3 gap-5 space-y-5">
            {testimonials.map((t, i) => (
              <div key={i} className="break-inside-avoid p-6 rounded-2xl border bg-white shadow-sm hover:shadow-lg transition-shadow" style={{ borderColor: `${PURPLE}12` }}>
                <Quotes size={24} weight="fill" style={{ color: PURPLE }} className="mb-3 opacity-30" />
                <div className="flex gap-0.5 mb-3">{Array.from({ length: t.rating }).map((_, j) => <Star key={j} size={14} weight="fill" style={{ color: YELLOW }} />)}</div>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">&ldquo;{t.text}&rdquo;</p>
                <div className="pt-3 border-t flex items-center gap-2" style={{ borderColor: `${PURPLE}08` }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: PURPLE }}>{t.name[0]}</div>
                  <div>
                    <p className="text-sm font-bold" style={{ color: DARK }}>{t.name}</p>
                    <p className="text-xs text-slate-400">{t.role}</p>
                  </div>
                  <CheckCircle size={14} weight="fill" style={{ color: PURPLE }} className="ml-auto" title="Verified Review" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ──── "WHAT DOES YOUR STUDENT NEED?" QUIZ ──── */}
      <SectionReveal className="relative z-10 py-24 md:py-32 overflow-hidden" style={{ background: `linear-gradient(180deg, #f8f6ff 0%, ${BG} 100%)` } as React.CSSProperties}>
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <div className="text-center mb-12">
            <SectionBadge text="Quick Quiz" color={YELLOW} />
            <SectionHeading>What Does Your Student Need?</SectionHeading>
            <AccentLine color={YELLOW} />
          </div>
          <div className="grid gap-4">
            {quizOptions.map((opt, i) => {
              const isSelected = quizAnswer === i;
              const urgencyColors = { high: "#dc2626", medium: YELLOW, low: PURPLE };
              const color = urgencyColors[opt.urgency as keyof typeof urgencyColors];
              return (
                <button key={opt.label} onClick={() => setQuizAnswer(i)}
                  className={`w-full p-5 rounded-2xl border-2 text-left transition-all duration-300 cursor-pointer ${isSelected ? "shadow-lg" : "hover:shadow-md bg-white"}`}
                  style={{ borderColor: isSelected ? color : `${PURPLE}15`, background: isSelected ? `${color}08` : undefined }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-base font-bold" style={{ color: DARK }}>{opt.label}</p>
                      {isSelected && <p className="text-sm mt-1" style={{ color }}>{opt.recommendation}</p>}
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors`} style={{ borderColor: isSelected ? color : "#d1d5db" }}>
                      {isSelected && <div className="w-3 h-3 rounded-full" style={{ background: color }} />}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          <AnimatePresence>
            {quizAnswer !== null && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="mt-8 text-center">
                <MagneticButton className="px-8 py-4 rounded-full text-base font-bold text-white cursor-pointer shadow-xl shadow-purple-500/25" style={{ background: PURPLE }}>
                  <Phone size={18} weight="fill" className="inline mr-2" />Book a Free Assessment — (206) 374-8295
                </MagneticButton>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </SectionReveal>

      {/* ──── SCHEDULE / AVAILABILITY ──── */}
      <SectionReveal className="relative z-10 py-24 md:py-32 overflow-hidden">
        <GridPattern opacity={0.02} />
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <div className="text-center mb-12">
            <SectionBadge text="Schedule" />
            <SectionHeading>Session Availability</SectionHeading>
            <AccentLine />
          </div>
          <div className="rounded-2xl border overflow-hidden bg-white shadow-sm" style={{ borderColor: `${PURPLE}15` }}>
            {schedule.map((s, i) => (
              <div key={s.day} className={`flex items-center justify-between p-4 px-6 ${i < schedule.length - 1 ? "border-b" : ""}`} style={{ borderColor: `${PURPLE}08` }}>
                <span className="text-sm font-bold" style={{ color: DARK }}>{s.day}</span>
                <span className="text-sm text-slate-500">{s.hours}</span>
                {s.available ? (
                  <span className="flex items-center gap-1.5 text-xs font-bold" style={{ color: PURPLE }}>
                    <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: PURPLE }} /><span className="relative inline-flex rounded-full h-2 w-2" style={{ background: PURPLE }} /></span>
                    Available
                  </span>
                ) : (
                  <span className="text-xs font-medium text-slate-400">Closed</span>
                )}
              </div>
            ))}
          </div>
          <div className="mt-6 flex items-center justify-center gap-3 p-4 rounded-xl border" style={{ borderColor: `${YELLOW}30`, background: `${YELLOW}08` }}>
            <Timer size={20} weight="fill" style={{ color: YELLOW }} />
            <span className="text-sm font-semibold" style={{ color: "#92710a" }}>Online sessions available nationwide — flexible evening hours</span>
          </div>
        </div>
      </SectionReveal>

      {/* ──── CERTIFICATION & TRUST BADGES ──── */}
      <SectionReveal className="relative z-10 py-16 overflow-hidden" style={{ background: `${PURPLE}04` } as React.CSSProperties}>
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <div className="flex flex-wrap justify-center gap-4">
            {["Background Checked", "Certified Educators", "PhD-Led Team", "Score Guarantee", "Free Assessment", "Flexible Scheduling"].map((badge) => (
              <span key={badge} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold border bg-white shadow-sm" style={{ color: PURPLE, borderColor: `${PURPLE}20` }}>
                <ShieldCheck size={16} weight="fill" /> {badge}
              </span>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ──── FAQ ──── */}
      <SectionReveal className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <SectionBadge text="FAQ" color={YELLOW} />
            <SectionHeading>Common Questions</SectionHeading>
            <AccentLine color={YELLOW} />
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="rounded-2xl border overflow-hidden bg-white shadow-sm" style={{ borderColor: `${PURPLE}12` }}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 md:p-6 text-left group cursor-pointer">
                  <span className="text-base font-semibold pr-4" style={{ color: DARK }}>{faq.q}</span>
                  <motion.div animate={{ rotate: openFaq === i ? 180 : 0 }} transition={spring}>
                    <CaretDown size={20} className="text-slate-400 shrink-0" />
                  </motion.div>
                </button>
                <AnimatePresence initial={false}>
                  {openFaq === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={spring} className="overflow-hidden">
                      <p className="px-5 pb-5 md:px-6 md:pb-6 text-slate-500 leading-relaxed">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ──── VIDEO TESTIMONIAL PLACEHOLDER ──── */}
      <SectionReveal className="relative z-10 py-24 md:py-32 overflow-hidden" style={{ background: `linear-gradient(180deg, #fffef5 0%, ${BG} 100%)` } as React.CSSProperties}>
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <SectionBadge text="Virtual Tour" />
          <SectionHeading>See Our Learning Center</SectionHeading>
          <AccentLine />
          <div className="relative mt-10 rounded-2xl overflow-hidden border shadow-lg group cursor-pointer" style={{ borderColor: `${PURPLE}20` }}>
            <img src="https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=900&q=80" alt="Bright Minds Tutoring center" className="w-full h-[360px] object-cover" />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/40 transition-colors">
              <div className="w-20 h-20 rounded-full bg-white/90 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                <div className="w-0 h-0 border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent border-l-[20px] ml-1" style={{ borderLeftColor: PURPLE }} />
              </div>
            </div>
          </div>
          <p className="mt-4 text-sm text-slate-400">Take a virtual tour of our University District learning center</p>
        </div>
      </SectionReveal>

      {/* ──── ENHANCED SERVICE AREA ──── */}
      <SectionReveal className="relative z-10 py-24 md:py-32 overflow-hidden">
        <GridPattern opacity={0.02} />
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <div className="text-center mb-12">
            <SectionBadge text="Service Area" />
            <SectionHeading>Serving the Greater Seattle Area</SectionHeading>
            <AccentLine />
          </div>
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="p-6 rounded-2xl border bg-white shadow-sm mb-6" style={{ borderColor: `${PURPLE}15` }}>
                <div className="flex items-center gap-3 mb-4">
                  <MapPin size={24} weight="fill" style={{ color: PURPLE }} />
                  <div>
                    <p className="text-base font-bold" style={{ color: DARK }}>University District Center</p>
                    <a href="https://maps.google.com/?q=4801+University+Way+NE+Seattle+WA+98105" target="_blank" rel="noopener noreferrer" className="text-sm hover:underline" style={{ color: PURPLE }}>
                      4801 University Way NE, Seattle, WA 98105
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <Timer size={24} weight="fill" style={{ color: YELLOW }} />
                  <div>
                    <p className="text-sm font-bold" style={{ color: DARK }}>Response Time</p>
                    <p className="text-sm text-slate-500">Assessment scheduled within 48 hours</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative flex h-4 w-4 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: PURPLE }} />
                    <span className="relative inline-flex rounded-full h-4 w-4" style={{ background: PURPLE }} />
                  </div>
                  <p className="text-sm font-semibold" style={{ color: PURPLE }}>Currently Accepting New Students</p>
                </div>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">
                Our University District center is conveniently located near UW campus, accessible by Link Light Rail and multiple bus routes. Free street parking available on evenings and weekends.
              </p>
            </div>
            <div>
              <p className="text-sm font-bold mb-3 uppercase tracking-wide" style={{ color: PURPLE }}>In-Person Coverage</p>
              <div className="grid grid-cols-2 gap-2 mb-6">
                {["University District", "Wallingford", "Fremont", "Ravenna", "Green Lake", "Roosevelt", "Wedgwood", "Laurelhurst"].map((area) => (
                  <div key={area} className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle size={14} weight="fill" style={{ color: PURPLE }} />{area}
                  </div>
                ))}
              </div>
              <div className="p-4 rounded-xl border" style={{ borderColor: `${YELLOW}30`, background: `${YELLOW}08` }}>
                <p className="text-sm font-bold" style={{ color: "#92710a" }}>
                  <Lightbulb size={16} weight="fill" className="inline mr-1" style={{ color: YELLOW }} />
                  Online tutoring available nationwide
                </p>
                <p className="text-xs text-slate-500 mt-1">Same quality, same tutors, from anywhere with an internet connection.</p>
              </div>
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* ──── PARENT RESOURCES & TIPS ──── */}
      <SectionReveal className="relative z-10 py-24 md:py-32 overflow-hidden" style={{ background: `linear-gradient(180deg, #f8f6ff 0%, ${BG} 100%)` } as React.CSSProperties}>
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <div className="text-center mb-12">
            <SectionBadge text="For Parents" color={YELLOW} />
            <SectionHeading>Resources for Academic Success</SectionHeading>
            <AccentLine color={YELLOW} />
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Notebook,
                title: "Study Habits Guide",
                desc: "Our free guide covers the 10 most effective study techniques backed by cognitive science research. Download after your assessment.",
                tag: "Free Resource",
              },
              {
                icon: CalendarCheck,
                title: "Academic Planning Calendar",
                desc: "Key dates for SAT/ACT registration, AP exam deadlines, and college application timelines. Stay ahead of every deadline.",
                tag: "Free Resource",
              },
              {
                icon: ChartLineUp,
                title: "Progress Dashboard",
                desc: "Every parent gets access to our online portal showing session notes, grade trends, and tutor recommendations in real time.",
                tag: "Included",
              },
            ].map((resource) => {
              const Icon = resource.icon;
              return (
                <motion.div key={resource.title} whileHover={{ y: -4 }} transition={spring}
                  className="p-6 rounded-2xl border bg-white shadow-sm hover:shadow-lg transition-all" style={{ borderColor: `${PURPLE}12` }}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${PURPLE}10` }}>
                      <Icon size={24} weight="duotone" style={{ color: PURPLE }} />
                    </div>
                    <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: `${YELLOW}15`, color: "#92710a" }}>{resource.tag}</span>
                  </div>
                  <h3 className="text-base font-bold mb-2" style={{ color: DARK }}>{resource.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{resource.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </SectionReveal>

      {/* ──── FREE ASSESSMENT CTA ──── */}
      <section className="relative z-10 py-20 overflow-hidden" style={{ background: `linear-gradient(135deg, ${PURPLE}, ${PURPLE}dd)` }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(circle at 30% 50%, ${YELLOW}15, transparent 60%)` }} />
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <GraduationCap size={48} weight="fill" className="mx-auto mb-6 text-white/70" />
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-4">Start with a Free Assessment</h2>
          <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
            Discover exactly where your child stands and get a personalized learning plan. Completely free, no obligation.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="tel:+12063748295" className="inline-flex items-center gap-3 px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-xl" style={{ background: YELLOW, color: DARK }}>
              <Phone size={20} weight="fill" /> (206) 374-8295
            </a>
            <a href="mailto:learn@brightmindstutoring.com" className="inline-flex items-center gap-2 px-6 py-4 rounded-full font-semibold text-white border-2 border-white/30 hover:border-white/60 transition-colors text-base">
              learn@brightmindstutoring.com
            </a>
          </div>
        </div>
      </section>

      {/* ──── CONTACT + FORM ──── */}
      <SectionReveal id="contact" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <GridPattern opacity={0.02} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <SectionBadge text="Contact Us" />
              <SectionHeading>Get Started Today</SectionHeading>
              <p className="text-slate-500 leading-relaxed mt-4 mb-8">Schedule a free assessment and discover how Bright Minds can help your student reach their full potential.</p>
              <div className="space-y-5">
                {[
                  { icon: MapPin, title: "Location", text: "4801 University Way NE, Seattle, WA 98105", link: "https://maps.google.com/?q=4801+University+Way+NE+Seattle+WA+98105" },
                  { icon: Phone, title: "Phone", text: "(206) 374-8295", link: "tel:+12063748295" },
                  { icon: Clock, title: "Hours", text: "Mon-Fri 3-8PM, Sat 9AM-4PM" },
                  { icon: ChalkboardTeacher, title: "Online", text: "Virtual sessions available nationwide" },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${PURPLE}12` }}>
                      <item.icon size={20} weight="duotone" style={{ color: PURPLE }} />
                    </div>
                    <div>
                      <p className="text-sm font-bold" style={{ color: DARK }}>{item.title}</p>
                      {"link" in item && item.link ? (
                        <a href={item.link} target={item.link.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="text-sm hover:underline" style={{ color: PURPLE }}>{item.text}</a>
                      ) : (
                        <p className="text-sm text-slate-500">{item.text}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border bg-white p-8 shadow-lg" style={{ borderColor: `${PURPLE}15` }}>
              <h3 className="text-xl font-bold mb-6" style={{ color: DARK }}>Request Free Assessment</h3>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-500 mb-1.5 font-medium">Parent Name</label>
                    <input type="text" className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2" style={{ borderColor: `${PURPLE}20`, ["--tw-ring-color" as string]: PURPLE } as React.CSSProperties} placeholder="Your name" />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-500 mb-1.5 font-medium">Student Grade</label>
                    <input type="text" className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2" style={{ borderColor: `${PURPLE}20`, ["--tw-ring-color" as string]: PURPLE } as React.CSSProperties} placeholder="e.g., 8th grade" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-slate-500 mb-1.5 font-medium">Phone</label>
                  <input type="tel" className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2" style={{ borderColor: `${PURPLE}20`, ["--tw-ring-color" as string]: PURPLE } as React.CSSProperties} placeholder="(555) 123-4567" />
                </div>
                <div>
                  <label className="block text-sm text-slate-500 mb-1.5 font-medium">Subject Needed</label>
                  <select className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2" style={{ borderColor: `${PURPLE}20`, ["--tw-ring-color" as string]: PURPLE } as React.CSSProperties}>
                    <option value="">Select subject</option>
                    {subjects.map((s) => <option key={s.name} value={s.name.toLowerCase()}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-500 mb-1.5 font-medium">Anything else we should know?</label>
                  <textarea className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 resize-none" rows={3} style={{ borderColor: `${PURPLE}20`, ["--tw-ring-color" as string]: PURPLE } as React.CSSProperties} placeholder="Learning goals, concerns, etc." />
                </div>
                <MagneticButton className="w-full py-4 rounded-xl text-base font-bold text-white flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-purple-500/20" style={{ background: PURPLE }}>
                  Get Free Assessment <ArrowRight size={18} weight="bold" />
                </MagneticButton>
              </form>
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* ──── GUARANTEE ──── */}
      <SectionReveal className="relative z-10 py-16 overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <ShimmerBorder>
            <div className="p-8 md:p-12">
              <ShieldCheck size={48} weight="fill" style={{ color: PURPLE }} className="mx-auto mb-4" />
              <h2 className="text-2xl md:text-4xl font-extrabold mb-4" style={{ color: DARK }}>Our Grade Improvement Guarantee</h2>
              <p className="text-slate-500 leading-relaxed max-w-2xl mx-auto text-lg mb-6">
                If your child does not improve by at least one letter grade within the first 12 sessions, the 13th session is free. For SAT/ACT, we guarantee 200+ point improvement.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {["Certified Tutors", "Free Assessment", "Grade Guarantee", "Score Guarantee", "Flexible Scheduling"].map((item) => (
                  <span key={item} className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border" style={{ color: PURPLE, borderColor: `${PURPLE}25`, background: `${PURPLE}08` }}>
                    <CheckCircle size={16} weight="fill" /> {item}
                  </span>
                ))}
              </div>
            </div>
          </ShimmerBorder>
        </div>
      </SectionReveal>

      {/* ──── FOOTER ──── */}
      <footer className="relative z-10 border-t py-10 overflow-hidden" style={{ borderColor: `${PURPLE}10`, background: "#faf9fc" }}>
        <div className="mx-auto max-w-6xl px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <BookOpen size={22} weight="fill" style={{ color: PURPLE }} />
                <span className="text-lg font-bold" style={{ color: DARK }}>Bright Minds Tutoring</span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">Where Understanding Clicks. Personalized tutoring for K-12, SAT/ACT prep, and college readiness in Seattle&apos;s University District.</p>
            </div>
            <div>
              <h4 className="text-sm font-bold mb-3" style={{ color: DARK }}>Quick Links</h4>
              <div className="space-y-2">
                {["Subjects", "Tutors", "Pricing", "Results", "Contact"].map((l) => (
                  <a key={l} href={`#${l.toLowerCase()}`} className="block text-sm text-slate-500 hover:text-purple-700 transition-colors">{l}</a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-bold mb-3" style={{ color: DARK }}>Contact</h4>
              <div className="space-y-2 text-sm text-slate-500">
                <p><a href="tel:+12063748295" className="hover:text-purple-700 transition-colors">(206) 374-8295</a></p>
                <p><a href="mailto:learn@brightmindstutoring.com" className="hover:text-purple-700 transition-colors">learn@brightmindstutoring.com</a></p>
                <p><a href="https://maps.google.com/?q=4801+University+Way+NE+Seattle+WA+98105" target="_blank" rel="noopener noreferrer" className="hover:text-purple-700 transition-colors">4801 University Way NE, Seattle, WA 98105</a></p>
              </div>
            </div>
          </div>
          <div className="border-t pt-6 flex flex-col md:flex-row items-center justify-between gap-4" style={{ borderColor: `${PURPLE}10` }}>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <BookOpen size={14} weight="fill" style={{ color: PURPLE }} />
              <span>Bright Minds Tutoring &copy; {new Date().getFullYear()}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" /></svg>
              <span className="flex items-center gap-1.5"><svg width="14" height="14" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-sky-500"><path d="M24.3 4.2c-1.5-.4-3.2.1-4.5 1.1-1-.7-2.3-1-3.5-.8-2.4.4-4.2 2.5-4.2 4.9v.6c-3.2.8-6 2.8-7.8 5.6-.3.5-.1 1.1.4 1.4.5.3 1.1.1 1.4-.4 1.5-2.3 3.7-4 6.3-4.7.5-.1 1-.1 1.5 0 .8.2 1.4.8 1.7 1.5.3.8.2 1.6-.2 2.3l-2.8 4.3c-.6.9-.4 2.1.4 2.8l2.5 2.1c.4.3.8.5 1.3.5h5.2c.5 0 1-.2 1.3-.5l1.2-1c.6-.5.8-1.3.6-2l-1-3.2c-.2-.5 0-1.1.4-1.4l3.8-2.5c1.3-.9 2.1-2.3 2.1-3.9V9.6c0-2.5-1.7-4.7-4.1-5.3v-.1z" fill="currentColor"/></svg>Created by <a href="https://bluejayportfolio.com" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "underline" }}>bluejayportfolio.com</a></span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
