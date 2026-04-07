"use client";

import { motion } from "framer-motion";
import TemplateLayout from "./TemplateLayout";

/* ───────────────────────── SVG Icons ───────────────────────── */

const FistIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M7 11V6a1 1 0 012 0V4a1 1 0 012 0v2a1 1 0 012 0V5a1 1 0 012 0v5" />
    <path d="M15 11v1a1 1 0 011 0v1a4 4 0 01-4 4H9a4 4 0 01-4-4v-2a1 1 0 012 0" />
    <path d="M5 13v4a5 5 0 005 5h4a5 5 0 005-5v-6" />
  </svg>
);

const BeltIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <rect x="2" y="9" width="20" height="6" rx="1" />
    <path d="M12 9v6" />
    <path d="M10 15l-2 5M14 15l2 5M10 20h4" strokeLinecap="round" />
  </svg>
);

const MedalIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <circle cx="12" cy="15" r="6" />
    <path d="M8.21 13.89L7 2h10l-1.21 11.89" />
    <path d="M12 12v3M10 14.5h4" strokeLinecap="round" />
    <path d="M9 2l1.5 5M15 2l-1.5 5" />
  </svg>
);

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
  </svg>
);

const SwordIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M14.5 17.5L3 6V3h3l11.5 11.5" />
    <path d="M13 19l6-6M16 16l4 4M8 8l-3 3" strokeLinecap="round" />
    <path d="M20 4l-9.5 9.5" />
  </svg>
);

const FlameIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M12 22c4-2 7-5.5 7-10 0-3-2-5.5-4-7.5C13 2.5 12 2 12 2s-1 .5-3 2.5C7 6.5 5 9 5 12c0 4.5 3 8 7 10z" />
    <path d="M12 22c-2-1.5-3.5-3.5-3.5-6 0-2 1-3.5 2-4.5.5-.5 1-.8 1.5-1 .5.2 1 .5 1.5 1 1 1 2 2.5 2 4.5 0 2.5-1.5 4.5-3.5 6z" />
  </svg>
);

const StarIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
    <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
    <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const TrophyIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
    <path d="M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
  </svg>
);

/* ───────────────────────── SVG Patterns ───────────────────────── */

const DojoGridPattern = ({ opacity = 0.03 }: { opacity?: number }) => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }}>
    <defs>
      <pattern id="dojoGrid" width="60" height="60" patternUnits="userSpaceOnUse">
        <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#dc2626" strokeWidth="0.4" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#dojoGrid)" />
  </svg>
);

const MartialArtsPattern = ({ opacity = 0.03 }: { opacity?: number }) => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }} viewBox="0 0 800 600">
    {/* Yin-yang */}
    <circle cx="400" cy="300" r="60" stroke="#dc2626" strokeWidth="0.5" fill="none" />
    <path d="M400 240 A30 30 0 0 1 400 300 A30 30 0 0 0 400 360" stroke="#dc2626" strokeWidth="0.5" fill="none" />
    <circle cx="400" cy="270" r="5" stroke="#dc2626" strokeWidth="0.4" fill="none" />
    <circle cx="400" cy="330" r="5" stroke="#dc2626" strokeWidth="0.4" fill="none" />
    {/* Katana */}
    <path d="M100 100 L250 100 M100 100 L90 95 M90 95 L90 105 M90 105 L100 100" stroke="#dc2626" strokeWidth="0.4" fill="none" />
    <path d="M150 95 L150 105" stroke="#dc2626" strokeWidth="0.4" />
    {/* Rising sun rays */}
    <circle cx="680" cy="120" r="25" stroke="#dc2626" strokeWidth="0.5" fill="none" />
    <path d="M680 85 V70 M700 95 L712 85 M710 120 H725 M700 145 L712 155 M680 155 V170" stroke="#dc2626" strokeWidth="0.3" />
    {/* Mountain / dojo */}
    <path d="M50 500 L150 420 L250 500" stroke="#dc2626" strokeWidth="0.4" fill="none" />
    <path d="M130 420 L150 400 L170 420" stroke="#dc2626" strokeWidth="0.3" fill="none" />
    {/* Dragon silhouette (simplified) */}
    <path d="M550 450 Q580 420 610 440 Q630 450 640 430 Q650 410 670 420 Q690 430 680 450" stroke="#dc2626" strokeWidth="0.4" fill="none" />
  </svg>
);

/* ───────────────────────── Data ───────────────────────── */

const programs = [
  {
    name: "Little Dragons (Ages 4-7)",
    desc: "Foundational movement, coordination, and confidence building. Kids learn respect, focus, and basic self-defense in a fun, structured environment.",
    icon: <FlameIcon />,
    tags: ["Coordination", "Confidence", "Discipline"],
  },
  {
    name: "Youth Warriors (Ages 8-13)",
    desc: "Structured martial arts training that builds character, anti-bullying resilience, physical fitness, and real self-defense skills.",
    icon: <ShieldIcon />,
    tags: ["Self-Defense", "Fitness", "Anti-Bully"],
  },
  {
    name: "Adult Martial Arts",
    desc: "Comprehensive training in striking, grappling, and weapons. Build elite fitness, mental toughness, and combat-ready skill regardless of experience.",
    icon: <FistIcon />,
    tags: ["Karate", "Jiu-Jitsu", "Kickboxing"],
  },
  {
    name: "Competition Team",
    desc: "For dedicated fighters who want to test themselves in tournament combat. Advanced sparring, strategy, and conditioning for regional and national events.",
    icon: <MedalIcon />,
    tags: ["Tournament", "Sparring", "Elite"],
  },
];

const beltRanks = [
  { belt: "White Belt", color: "#ffffff", desc: "The beginning. Open mind, empty cup. Learn foundational stances, basic strikes, and dojo etiquette." },
  { belt: "Yellow Belt", color: "#facc15", desc: "First light of knowledge. Demonstrate basic forms, improved balance, and understanding of core principles." },
  { belt: "Orange Belt", color: "#f97316", desc: "Growing strength. Execute combination techniques, basic sparring, and show consistent attendance and effort." },
  { belt: "Green Belt", color: "#22c55e", desc: "Intermediate growth. Refined technique, introduction to weapons forms, and assistant instructor duties begin." },
  { belt: "Blue Belt", color: "#3b82f6", desc: "Deepening wisdom. Advanced forms, competitive sparring readiness, and mentoring of lower belts." },
  { belt: "Brown Belt", color: "#92400e", desc: "Approaching mastery. Leadership on the mat, advanced self-defense, and preparation for black belt examination." },
  { belt: "Black Belt", color: "#dc2626", desc: "Mastery and new beginning. Technical excellence, teaching certification, and lifelong commitment to the art." },
];

const instructors = [
  {
    name: "Sensei David Tanaka",
    title: "Head Instructor / 5th Dan",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
    specialties: ["Shotokan Karate", "Weapons", "Competition Coaching"],
    yearsExp: 28,
  },
  {
    name: "Sensei Maria Santos",
    title: "Senior Instructor / 3rd Dan",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80",
    specialties: ["Jiu-Jitsu", "Women's Self-Defense", "Youth Programs"],
    yearsExp: 15,
  },
  {
    name: "Coach Alex Kim",
    title: "Competition Coach / 2nd Dan",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80",
    specialties: ["Kickboxing", "MMA Conditioning", "Tournament Prep"],
    yearsExp: 12,
  },
];

const schedule = [
  { day: "Monday", classes: [{ time: "4:00 PM", name: "Little Dragons", level: "Ages 4-7" }, { time: "5:00 PM", name: "Youth Karate", level: "Ages 8-13" }, { time: "6:30 PM", name: "Adult Karate", level: "All Levels" }, { time: "7:30 PM", name: "Jiu-Jitsu", level: "All Levels" }] },
  { day: "Tuesday", classes: [{ time: "5:00 PM", name: "Youth Jiu-Jitsu", level: "Ages 8-13" }, { time: "6:00 PM", name: "Kickboxing", level: "Adults" }, { time: "7:30 PM", name: "Competition Team", level: "Invite Only" }] },
  { day: "Wednesday", classes: [{ time: "4:00 PM", name: "Little Dragons", level: "Ages 4-7" }, { time: "5:00 PM", name: "Youth Karate", level: "Ages 8-13" }, { time: "6:30 PM", name: "Adult Karate", level: "All Levels" }, { time: "7:30 PM", name: "Open Mat", level: "All Levels" }] },
  { day: "Thursday", classes: [{ time: "5:00 PM", name: "Youth Jiu-Jitsu", level: "Ages 8-13" }, { time: "6:00 PM", name: "Kickboxing", level: "Adults" }, { time: "7:30 PM", name: "Competition Team", level: "Invite Only" }] },
  { day: "Saturday", classes: [{ time: "9:00 AM", name: "Family Karate", level: "All Ages" }, { time: "10:30 AM", name: "Advanced Sparring", level: "Green Belt+" }, { time: "12:00 PM", name: "Weapons Training", level: "Blue Belt+" }] },
];

const testimonials = [
  {
    name: "Sarah P.",
    text: "My son was being bullied at school. After six months of training, his confidence is through the roof. He carries himself differently. Sensei Tanaka changed his life.",
    program: "Youth Warriors",
    rating: 5,
  },
  {
    name: "Marcus J.",
    text: "I started at 35 with zero experience. Two years later I earned my blue belt and lost 40 pounds. This place pushes you hard but the community is incredible.",
    program: "Adult Karate",
    rating: 5,
  },
  {
    name: "Lisa and Tom K.",
    text: "We enrolled our whole family in the Saturday class. It is the best decision we ever made. Real discipline, real respect, and we actually look forward to training together.",
    program: "Family Program",
    rating: 5,
  },
];

const faqs = [
  {
    q: "Do I need prior experience to start?",
    a: "Absolutely not. Our beginner programs are designed for people with zero martial arts experience. Every black belt in our dojo started as a white belt.",
  },
  {
    q: "What should I wear to my first class?",
    a: "Comfortable athletic clothing is fine for your free trial. If you decide to enroll, we will fit you with a proper gi (uniform) included with your membership.",
  },
  {
    q: "Is martial arts safe for my child?",
    a: "Safety is our top priority. All classes are supervised by certified instructors. We use age-appropriate techniques, padded equipment, and strict sparring rules. Injuries are extremely rare.",
  },
  {
    q: "How long does it take to earn a black belt?",
    a: "Typically 4-6 years of consistent training. We do not hand out belts easily. Each promotion is earned through demonstrated skill, knowledge, character, and dedication.",
  },
  {
    q: "What styles do you teach?",
    a: "Our core curriculum is Shotokan Karate, supplemented with Brazilian Jiu-Jitsu, kickboxing, and weapons training. Competition team members also train in point sparring and submission grappling.",
  },
  {
    q: "Do you offer family discounts?",
    a: "Yes. We offer significant discounts for families with two or more members enrolled. Ask about our family membership package during your free trial visit.",
  },
];

/* ───────────────────────── Section Header Component ───────────────────────── */

function SectionHeader({
  tag,
  title,
  highlightWord,
  subtitle,
  center = true,
}: {
  tag: string;
  title: string;
  highlightWord: string;
  subtitle?: string;
  center?: boolean;
}) {
  const parts = title.split(highlightWord);
  return (
    <div className={`mb-16 ${center ? "text-center" : ""}`}>
      <motion.span
        initial={{ opacity: 0, y: -10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="inline-block text-[#dc2626] text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border border-[#dc2626]/20 bg-[#dc2626]/5"
      >
        {tag}
      </motion.span>
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        className="text-3xl md:text-5xl font-extrabold tracking-tight"
      >
        {parts[0]}
        <span className="text-[#dc2626]">{highlightWord}</span>
        {parts[1] || ""}
      </motion.h2>
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className={`h-0.5 w-16 bg-gradient-to-r from-[#dc2626] to-transparent mt-4 ${center ? "mx-auto" : ""}`}
      />
      {subtitle && (
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-muted mt-4 max-w-2xl text-lg leading-relaxed mx-auto"
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
}

/* ───────────────────────── Main Component ───────────────────────── */

export default function MartialArtsTemplate() {
  return (
    <TemplateLayout
      businessName="Pacific Martial Arts Academy"
      tagline="Discipline. Power. Respect. Training warriors of all ages since 1998."
      accentColor="#dc2626"
      accentColorLight="#ef4444"
      heroGradient="linear-gradient(135deg, #1a0a0a 0%, #0f0808 50%, #1a0a0a 100%)"
      heroImage="https://images.unsplash.com/photo-1555597673-b21d5c935865?w=1400&q=80"
      phone="(253) 555-0133"
      address="Downtown Tacoma, WA"
    >
      {/* ════════════════ Free Trial Bar ════════════════ */}
      <section className="py-3 bg-gradient-to-r from-[#dc2626] via-[#b91c1c] to-[#dc2626] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9Im5vbmUiLz48cGF0aCBkPSJNMCAwTDQwIDQwTTQwIDBMMCA0MCIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjAuMyIgb3BhY2l0eT0iMC4xIi8+PC9zdmc+')] opacity-30" />
        <div className="max-w-6xl mx-auto px-6 flex flex-wrap items-center justify-center gap-6 relative z-10">
          <div className="flex items-center gap-3">
            <FistIcon />
            <p className="text-sm font-bold tracking-wide uppercase">First Class Free &mdash; No Experience Required</p>
          </div>
          <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm px-5 py-2 rounded-full border border-white/20">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-yellow-400" />
            </span>
            <span className="text-xs font-bold tracking-wider">NOW ENROLLING ALL PROGRAMS</span>
          </div>
        </div>
      </section>

      {/* ════════════════ Stats Banner ════════════════ */}
      <section className="py-12 relative overflow-hidden bg-[#0c0808] border-b border-[#dc2626]/10">
        <DojoGridPattern opacity={0.02} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] rounded-full blur-[180px] bg-[#dc2626]/5" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "2,500+", label: "Students Trained", icon: <TrophyIcon /> },
              { value: "28+", label: "Years Teaching", icon: <ClockIcon /> },
              { value: "150+", label: "Tournament Medals", icon: <MedalIcon /> },
              { value: "98%", label: "Parent Approval", icon: <CheckCircleIcon /> },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-[#dc2626]">{stat.icon}</span>
                  <span className="text-3xl md:text-4xl font-extrabold text-white">{stat.value}</span>
                </div>
                <span className="text-muted text-sm font-medium tracking-wide uppercase">{stat.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ Programs ════════════════ */}
      <section
        id="services"
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0a0808 0%, #100c0c 50%, #0a0808 100%)" }}
      >
        <MartialArtsPattern />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[10%] right-[5%] w-[500px] h-[500px] rounded-full blur-[160px] bg-[#dc2626]/5" />
          <div className="absolute bottom-[10%] left-[5%] w-[400px] h-[400px] rounded-full blur-[140px] bg-[#dc2626]/3" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="OUR PROGRAMS"
            title="Training Programs"
            highlightWord="Programs"
            subtitle="From your child's first martial arts class to elite tournament competition. Every program is built on discipline, respect, and relentless improvement."
          />
          <div className="grid md:grid-cols-2 gap-6">
            {programs.map((program, i) => (
              <motion.div
                key={program.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group relative p-7 rounded-2xl border border-white/[0.06] hover:border-[#dc2626]/30 transition-all duration-500 overflow-hidden bg-white/[0.02]"
              >
                {/* Hover glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,#dc262615,transparent_70%)]" />
                {/* Top accent line */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#dc2626]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  {/* Number + Icon row */}
                  <div className="flex items-start justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl bg-[#dc2626]/10 border border-[#dc2626]/20 flex items-center justify-center text-[#dc2626] group-hover:bg-[#dc2626]/20 group-hover:border-[#dc2626]/40 transition-all duration-300">
                      {program.icon}
                    </div>
                    <span className="text-4xl font-extrabold text-white/[0.04] group-hover:text-[#dc2626]/10 transition-colors duration-300 leading-none">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold mb-3 group-hover:text-[#dc2626] transition-colors duration-300">{program.name}</h3>
                  <p className="text-muted text-sm leading-relaxed mb-5">{program.desc}</p>
                  {/* Feature tags */}
                  <div className="flex flex-wrap gap-2">
                    {program.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-semibold uppercase tracking-wider text-[#dc2626]/70 bg-[#dc2626]/8 border border-[#dc2626]/10 px-2.5 py-1 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ Belt Ranking System ════════════════ */}
      <section
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #100c0c 0%, #130e0e 50%, #100c0c 100%)" }}
      >
        <DojoGridPattern opacity={0.025} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[30%] left-[50%] -translate-x-1/2 w-[700px] h-[400px] rounded-full blur-[180px] bg-[#dc2626]/5" />
        </div>
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="THE PATH"
            title="Belt Ranking System"
            highlightWord="Ranking"
            subtitle="Every promotion is earned, never given. This is the path from white belt to black belt mastery."
          />
          <div className="space-y-4">
            {beltRanks.map((rank, i) => (
              <motion.div
                key={rank.belt}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group relative p-5 rounded-2xl border border-white/[0.06] hover:border-[#dc2626]/20 transition-all duration-500 overflow-hidden bg-white/[0.02] flex items-center gap-5"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_0%_50%,#dc262610,transparent_70%)]" />
                {/* Belt color indicator */}
                <div className="relative z-10 shrink-0">
                  <div
                    className="w-14 h-5 rounded-sm border border-white/10 shadow-md"
                    style={{ backgroundColor: rank.color, boxShadow: `0 0 15px ${rank.color}30` }}
                  />
                </div>
                <div className="relative z-10 flex-1">
                  <h3 className="font-bold text-sm group-hover:text-[#dc2626] transition-colors duration-300">{rank.belt}</h3>
                  <p className="text-muted text-sm leading-relaxed">{rank.desc}</p>
                </div>
                <div className="relative z-10 shrink-0">
                  <span className="text-3xl font-extrabold text-white/[0.04] group-hover:text-[#dc2626]/10 transition-colors duration-300 leading-none">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ Instructors ════════════════ */}
      <section
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0a0808 0%, #0e0b0b 50%, #0a0808 100%)" }}
      >
        <MartialArtsPattern opacity={0.025} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] right-[10%] w-[500px] h-[500px] rounded-full blur-[180px] bg-[#dc2626]/5" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="YOUR SENSEIS"
            title="Meet the Instructors"
            highlightWord="Instructors"
            subtitle="World-class martial artists and dedicated educators who lead by example on and off the mat."
          />
          <div className="grid md:grid-cols-3 gap-8">
            {instructors.map((instructor, i) => (
              <motion.div
                key={instructor.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="group relative rounded-2xl border border-white/[0.06] hover:border-[#dc2626]/30 transition-all duration-500 overflow-hidden bg-white/[0.02]"
              >
                {/* Photo */}
                <div className="relative aspect-[3/4] overflow-hidden">
                  <img
                    src={instructor.image}
                    alt={instructor.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0808] via-[#0a0808]/30 to-transparent" />
                  {/* Years badge */}
                  <div className="absolute top-4 right-4 bg-[#dc2626]/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full border border-[#ef4444]/30">
                    {instructor.yearsExp}+ YRS
                  </div>
                  {/* Info overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-xl font-bold mb-1">{instructor.name}</h3>
                    <p className="text-[#dc2626] text-sm font-semibold mb-3">{instructor.title}</p>
                    <div className="flex flex-wrap gap-2">
                      {instructor.specialties.map((s) => (
                        <span key={s} className="text-[10px] font-semibold uppercase tracking-wider text-white/60 bg-white/10 border border-white/10 px-2.5 py-1 rounded-full">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ Class Schedule ════════════════ */}
      <section
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #100c0c 0%, #140f0f 50%, #100c0c 100%)" }}
      >
        <DojoGridPattern opacity={0.02} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[800px] h-[500px] rounded-full blur-[200px] bg-[#dc2626]/4" />
        </div>
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="WEEKLY CLASSES"
            title="Class Schedule"
            highlightWord="Schedule"
            subtitle="Consistent training builds champions. Find the class that fits your life."
          />
          <div className="space-y-6">
            {schedule.map((day, dayIdx) => (
              <motion.div
                key={day.day}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: dayIdx * 0.08 }}
                className="rounded-2xl border border-white/[0.06] overflow-hidden bg-white/[0.02]"
              >
                {/* Day header */}
                <div className="px-6 py-3 bg-[#dc2626]/10 border-b border-[#dc2626]/15 flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#dc2626]" />
                  <h3 className="font-bold text-sm uppercase tracking-wider text-[#dc2626]">{day.day}</h3>
                </div>
                {/* Classes grid */}
                <div className="divide-y divide-white/[0.04]">
                  {day.classes.map((cls, clsIdx) => (
                    <div key={clsIdx} className="px-6 py-3 flex items-center gap-4 hover:bg-white/[0.02] transition-colors duration-200">
                      <span className="text-sm font-mono text-[#dc2626] w-20 shrink-0">{cls.time}</span>
                      <span className="font-semibold text-sm flex-1">{cls.name}</span>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-white/50 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">
                        {cls.level}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ Why Choose Us Banner ════════════════ */}
      <section className="py-20 relative overflow-hidden bg-gradient-to-b from-[#dc2626]/10 to-[#0a0808]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#dc2626]/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#dc2626]/10 to-transparent" />
          <svg className="absolute inset-0 w-full h-full opacity-[0.03]" viewBox="0 0 1000 400">
            <path d="M0 200 Q250 100 500 200 Q750 300 1000 200" stroke="#dc2626" strokeWidth="1" fill="none" />
            <path d="M0 250 Q250 150 500 250 Q750 350 1000 250" stroke="#dc2626" strokeWidth="0.5" fill="none" />
            <circle cx="500" cy="200" r="80" stroke="#dc2626" strokeWidth="0.3" fill="none" />
          </svg>
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              THE <span className="text-[#dc2626]">PACIFIC DIFFERENCE</span>
            </h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <SwordIcon />, title: "Real Martial Arts", desc: "No watered-down cardio kickboxing. Authentic technique from certified masters." },
              { icon: <ShieldIcon />, title: "Safe Training", desc: "Padded mats, proper equipment, and strict safety protocols for every class." },
              { icon: <BeltIcon />, title: "Earned Belts", desc: "No participation trophies. Every promotion reflects genuine skill and dedication." },
              { icon: <FlameIcon />, title: "Character First", desc: "We build warriors with integrity. Respect, humility, and discipline above all." },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group text-center p-6 rounded-2xl border border-white/[0.06] hover:border-[#dc2626]/30 bg-white/[0.02] transition-all duration-500"
              >
                <div className="w-14 h-14 mx-auto rounded-xl bg-[#dc2626]/10 border border-[#dc2626]/20 flex items-center justify-center text-[#dc2626] mb-4 group-hover:bg-[#dc2626]/20 group-hover:scale-110 transition-all duration-300">
                  {item.icon}
                </div>
                <h4 className="font-bold mb-2">{item.title}</h4>
                <p className="text-muted text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ Testimonials ════════════════ */}
      <section
        id="testimonials"
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0a0808 0%, #0e0b0b 50%, #0a0808 100%)" }}
      >
        <DojoGridPattern />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[30%] left-[40%] w-[600px] h-[400px] rounded-full blur-[180px] bg-[#dc2626]/4" />
          <svg className="absolute inset-0 w-full h-full opacity-[0.02]" viewBox="0 0 800 400">
            <circle cx="400" cy="200" r="100" stroke="#dc2626" strokeWidth="0.5" fill="none" />
            <circle cx="400" cy="200" r="180" stroke="#dc2626" strokeWidth="0.3" fill="none" />
            <circle cx="400" cy="200" r="260" stroke="#dc2626" strokeWidth="0.2" fill="none" />
          </svg>
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="STUDENT VOICES"
            title="What Families Say"
            highlightWord="Families"
            subtitle="Real transformations from real students and parents. Our results speak through their stories."
          />
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative p-7 rounded-2xl border border-white/[0.06] hover:border-[#dc2626]/30 transition-all duration-500 overflow-hidden bg-white/[0.02]"
              >
                {/* Top accent line */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-[#dc2626]/40 via-[#dc2626]/10 to-transparent" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_0%_0%,#dc262610,transparent_70%)]" />
                <div className="relative z-10">
                  {/* Program tag */}
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#dc2626]/70 bg-[#dc2626]/8 border border-[#dc2626]/10 px-2.5 py-1 rounded-full">
                    {t.program}
                  </span>
                  {/* Stars */}
                  <div className="flex items-center gap-0.5 text-[#dc2626] mt-4 mb-4">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <StarIcon key={j} />
                    ))}
                  </div>
                  {/* Quote */}
                  <p className="text-muted leading-relaxed mb-6 text-sm">&ldquo;{t.text}&rdquo;</p>
                  {/* Author */}
                  <div className="flex items-center gap-3 pt-4 border-t border-white/[0.06]">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#dc2626]/30 to-[#dc2626]/10 flex items-center justify-center text-sm font-bold text-[#dc2626]">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-sm">{t.name}</p>
                      <p className="text-muted text-xs">Verified Student</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ FAQ ════════════════ */}
      <section
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #100c0c 0%, #0d0a0a 50%, #100c0c 100%)" }}
      >
        <DojoGridPattern />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] left-[10%] w-[400px] h-[400px] rounded-full blur-[140px] bg-[#dc2626]/4" />
          <div className="absolute bottom-[15%] right-[10%] w-[350px] h-[350px] rounded-full blur-[120px] bg-[#dc2626]/3" />
        </div>
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="COMMON QUESTIONS"
            title="Frequently Asked Questions"
            highlightWord="Questions"
          />
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="group p-6 rounded-2xl border border-white/[0.06] hover:border-[#dc2626]/20 transition-all duration-500 overflow-hidden relative bg-white/[0.02]"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_0%_50%,#dc262610,transparent_70%)]" />
                <div className="relative z-10 flex gap-4">
                  <div className="w-8 h-8 shrink-0 rounded-lg bg-[#dc2626]/10 border border-[#dc2626]/20 flex items-center justify-center text-[#dc2626] text-xs font-bold mt-0.5">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div>
                    <h3 className="font-bold mb-2 text-white group-hover:text-[#dc2626] transition-colors duration-300">{faq.q}</h3>
                    <p className="text-muted text-sm leading-relaxed">{faq.a}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ Free Trial CTA ════════════════ */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#dc2626]/10 via-[#dc2626]/5 to-[#0a0808]" />
        <DojoGridPattern opacity={0.03} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#dc2626]/30 to-transparent" />
          <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full blur-[180px] bg-[#dc2626]/8" />
        </div>
        <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block text-[#dc2626] text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border border-[#dc2626]/20 bg-[#dc2626]/5">
              BEGIN YOUR JOURNEY
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold mb-4 tracking-tight">
              Your First Class Is <span className="text-[#dc2626]">Free</span>
            </h2>
            <p className="text-muted text-lg mb-10 max-w-xl mx-auto leading-relaxed">
              No contracts. No pressure. Walk in, try a class, and see for yourself why hundreds of Tacoma families train with us. Your transformation starts today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#contact"
                className="group inline-flex h-14 px-10 rounded-full bg-gradient-to-r from-[#dc2626] to-[#b91c1c] text-white font-bold items-center justify-center text-lg hover:from-[#ef4444] hover:to-[#dc2626] transition-all duration-300 shadow-lg shadow-[#dc2626]/25 gap-2"
              >
                <span>Claim Free Trial</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:translate-x-1 transition-transform">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
              <a
                href="tel:2535550133"
                className="inline-flex h-14 px-10 rounded-full border-2 border-[#dc2626]/30 text-[#dc2626] font-bold items-center justify-center text-lg hover:bg-[#dc2626]/10 hover:border-[#dc2626]/50 transition-all duration-300 gap-2"
              >
                <PhoneIcon />
                <span>(253) 555-0133</span>
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </TemplateLayout>
  );
}
