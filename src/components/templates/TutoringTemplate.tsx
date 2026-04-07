"use client";

import { motion } from "framer-motion";
import TemplateLayout from "./TemplateLayout";

/* ───────────────────────── SVG Icons ───────────────────────── */

const BookIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

const PencilIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const BrainIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M12 2a5 5 0 00-4.9 4.1A4.5 4.5 0 004 10.5a4.5 4.5 0 001.3 3.2A5 5 0 004 17a5 5 0 005 5h.1A5 5 0 0012 21m0-19a5 5 0 014.9 4.1A4.5 4.5 0 0120 10.5a4.5 4.5 0 01-1.3 3.2A5 5 0 0120 17a5 5 0 01-5 5h-.1A5 5 0 0112 21m0-19v19" />
  </svg>
);

const GradCapIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3z" />
    <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" />
  </svg>
);

const LightbulbIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M9 21h6m-3-3v3m-4-8a5 5 0 1110 0c0 1.7-.83 3.21-2.12 4.13A2 2 0 0014 19h-4a2 2 0 01-1.88-1.31A5.97 5.97 0 016 13z" />
  </svg>
);

const ChartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V5a2 2 0 00-2-2H6a2 2 0 00-2 2v14a2 2 0 002 2z" />
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

const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
    <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const StarIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const TrophyIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
    <path d="M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
  </svg>
);

const UsersIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
    <path d="M5 13l4 4L19 7" />
  </svg>
);

/* ───────────────────────── Grid Pattern ───────────────────────── */

const GridPattern = ({ opacity = 0.03 }: { opacity?: number }) => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }}>
    <defs>
      <pattern id="tutorGrid" width="60" height="60" patternUnits="userSpaceOnUse">
        <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#818cf8" strokeWidth="0.5" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#tutorGrid)" />
  </svg>
);

/* ───────────────────────── Notebook Pattern ───────────────────────── */

const NotebookPattern = () => (
  <svg className="absolute inset-0 w-full h-full opacity-[0.02] pointer-events-none" viewBox="0 0 800 600">
    {/* Notebook lines */}
    {[100, 140, 180, 220, 260, 300, 340, 380, 420, 460, 500].map((y) => (
      <line key={y} x1="100" y1={y} x2="700" y2={y} stroke="#818cf8" strokeWidth="0.3" />
    ))}
    {/* Margin line */}
    <line x1="150" y1="60" x2="150" y2="560" stroke="#818cf8" strokeWidth="0.5" strokeDasharray="8 4" />
    {/* Math symbols */}
    <text x="250" y="150" fill="#818cf8" fontSize="24" opacity="0.3">+</text>
    <text x="450" y="280" fill="#818cf8" fontSize="24" opacity="0.3">=</text>
    <text x="600" y="200" fill="#818cf8" fontSize="20" opacity="0.3">x</text>
    {/* Lightbulb outline */}
    <circle cx="650" cy="100" r="20" stroke="#818cf8" strokeWidth="0.3" fill="none" />
    <path d="M650 120v10M643 128h14" stroke="#818cf8" strokeWidth="0.3" fill="none" />
  </svg>
);

/* ───────────────────────── Data ───────────────────────── */

const subjects = [
  {
    name: "Mathematics",
    desc: "From foundational arithmetic through AP Calculus. We break down complex concepts into clear, manageable steps that build lasting understanding.",
    icon: <ChartIcon />,
    tags: ["Algebra", "Geometry", "Calculus"],
  },
  {
    name: "Science",
    desc: "Biology, chemistry, and physics brought to life through hands-on problem solving and real-world applications that spark genuine curiosity.",
    icon: <BrainIcon />,
    tags: ["Biology", "Chemistry", "Physics"],
  },
  {
    name: "English & Writing",
    desc: "Reading comprehension, essay writing, grammar, and literary analysis. Build the communication skills that open every door.",
    icon: <PencilIcon />,
    tags: ["Essay Writing", "Grammar", "Literature"],
  },
  {
    name: "Test Preparation",
    desc: "Proven strategies for SAT, ACT, AP exams, and state assessments. Practice tests, score analysis, and targeted review for maximum improvement.",
    icon: <GradCapIcon />,
    tags: ["SAT / ACT", "AP Exams", "State Tests"],
  },
  {
    name: "Coding & Technology",
    desc: "Python, JavaScript, Scratch, and computational thinking. Prepare students for the future with project-based programming courses.",
    icon: <LightbulbIcon />,
    tags: ["Python", "JavaScript", "Scratch"],
  },
  {
    name: "Music Theory & Performance",
    desc: "Piano, guitar, and music theory instruction. Develop musicianship, reading skills, and performance confidence at every level.",
    icon: <BookIcon />,
    tags: ["Piano", "Guitar", "Theory"],
  },
];

const gradeLevels = [
  { level: "Elementary (K-5)", desc: "Building strong foundations in reading, writing, and math with engaging, age-appropriate methods." },
  { level: "Middle School (6-8)", desc: "Bridging the gap to high school with study skills, critical thinking, and subject mastery." },
  { level: "High School (9-12)", desc: "Advanced coursework support, AP preparation, and college application guidance." },
  { level: "College & Adult", desc: "University-level tutoring, professional certifications, and lifelong learning support." },
];

const tutors = [
  {
    name: "Dr. Amanda Foster",
    title: "Lead Tutor, Math & Science",
    image: "https://images.unsplash.com/photo-1573496799652-408c2ac9fe98?w=400&q=80",
    specialties: ["AP Calculus", "Physics"],
    yearsExp: 14,
  },
  {
    name: "Ryan Chen, M.Ed.",
    title: "English & Test Prep Specialist",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&q=80",
    specialties: ["SAT/ACT", "Essay Writing"],
    yearsExp: 10,
  },
  {
    name: "Priya Sharma, M.S.",
    title: "Coding & STEM Instructor",
    image: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&q=80",
    specialties: ["Python", "Comp Sci"],
    yearsExp: 8,
  },
];

const successStories = [
  { name: "Jason M.", subject: "SAT Prep", before: "1180", after: "1420", improvement: "+240 points", period: "3 months" },
  { name: "Emma L.", subject: "Algebra II", before: "C-", after: "A", improvement: "+3 letter grades", period: "1 semester" },
  { name: "Aiden K.", subject: "AP Chemistry", before: "2", after: "5", improvement: "Perfect AP score", period: "4 months" },
  { name: "Sophia R.", subject: "English", before: "D+", after: "B+", improvement: "+2 letter grades", period: "1 semester" },
];

const pricingPlans = [
  {
    name: "Starter",
    price: "$45",
    unit: "/session",
    desc: "Perfect for occasional help with homework and specific concepts",
    features: [
      "1 session per week (60 min)",
      "One subject focus",
      "Session notes & recap",
      "Email support between sessions",
    ],
    highlighted: false,
  },
  {
    name: "Growth",
    price: "$39",
    unit: "/session",
    desc: "Our most popular plan for consistent academic improvement",
    features: [
      "2 sessions per week (60 min)",
      "Up to 2 subjects",
      "Personalized study plan",
      "Progress reports bi-weekly",
      "Priority scheduling",
      "Parent dashboard access",
    ],
    highlighted: true,
  },
  {
    name: "Accelerator",
    price: "$35",
    unit: "/session",
    desc: "Intensive support for major test prep or rapid grade recovery",
    features: [
      "3+ sessions per week (60 min)",
      "Unlimited subjects",
      "Custom curriculum design",
      "Weekly progress reports",
      "Direct tutor messaging",
      "Practice test library",
      "College prep guidance",
    ],
    highlighted: false,
  },
];

const faqs = [
  {
    q: "How do you match students with tutors?",
    a: "We consider the student's learning style, personality, subject needs, and schedule. Every match starts with a free assessment so both the student and tutor can ensure it is a great fit before committing.",
  },
  {
    q: "Are sessions online or in-person?",
    a: "We offer both. In-person sessions take place at our Redmond learning center. Online sessions use our interactive virtual classroom with shared whiteboard, screen sharing, and session recording.",
  },
  {
    q: "What if my child does not improve?",
    a: "We stand behind our results. If you do not see measurable improvement within the first 8 sessions, we will adjust the plan at no cost or provide a full refund. Our 98 percent satisfaction rate speaks for itself.",
  },
  {
    q: "Can I switch tutors or subjects?",
    a: "Absolutely. We want the best fit for your student. You can switch tutors or add subjects at any time with no penalty. Just let your academic coordinator know.",
  },
  {
    q: "Do you offer group tutoring?",
    a: "Yes. Small group sessions of 2 to 4 students are available at a reduced rate. Group sessions work well for study groups, test prep, and collaborative learning.",
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
        className="inline-block text-[#818cf8] text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border border-[#818cf8]/20 bg-[#818cf8]/5"
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
        <span className="text-[#818cf8]">{highlightWord}</span>
        {parts[1] || ""}
      </motion.h2>
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className={`h-0.5 w-16 bg-gradient-to-r from-[#818cf8] to-transparent mt-4 ${center ? "mx-auto" : ""}`}
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

export default function TutoringTemplate() {
  return (
    <TemplateLayout
      businessName="Bright Minds Tutoring"
      tagline="Personalized tutoring that builds confidence, boosts grades, and unlocks every student's potential."
      accentColor="#818cf8"
      accentColorLight="#a5b4fc"
      heroGradient="linear-gradient(135deg, #141726 0%, #0e1019 100%)"
      heroImage="https://images.unsplash.com/photo-1523050854058-8df90110c476?w=1400&q=80"
      phone="(425) 555-0135"
      address="320 Education Way, Redmond, WA 98052"
    >
      {/* ════════════════ Education Bar ════════════════ */}
      <section className="py-3 bg-gradient-to-r from-[#818cf8] via-[#6366f1] to-[#818cf8] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9Im5vbmUiLz48cGF0aCBkPSJNMCAwTDQwIDQwTTQwIDBMMCA0MCIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjAuMyIgb3BhY2l0eT0iMC4xIi8+PC9zdmc+')] opacity-30" />
        <div className="max-w-6xl mx-auto px-6 flex flex-wrap items-center justify-center gap-6 relative z-10">
          <div className="flex items-center gap-3">
            <GradCapIcon />
            <p className="text-sm font-bold tracking-wide">EDUCATION &middot; GROWTH &middot; CONFIDENCE &middot; SUCCESS</p>
          </div>
          <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm px-5 py-2 rounded-full border border-white/20">
            <LightbulbIcon />
            <span className="text-xs font-bold tracking-wider">FREE ASSESSMENT: (425) 555-0135</span>
          </div>
        </div>
      </section>

      {/* ════════════════ Stats Banner ════════════════ */}
      <section className="py-12 relative overflow-hidden bg-[#0c0d16] border-b border-[#818cf8]/10">
        <GridPattern opacity={0.02} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] rounded-full blur-[180px] bg-[#818cf8]/5" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "2,500+", label: "Students Tutored", icon: <UsersIcon /> },
              { value: "98%", label: "Grade Improvement", icon: <ChartIcon /> },
              { value: "12+", label: "Years Experience", icon: <ClockIcon /> },
              { value: "4.9/5", label: "Parent Rating", icon: <TrophyIcon /> },
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
                  <span className="text-[#818cf8]">{stat.icon}</span>
                  <span className="text-3xl md:text-4xl font-extrabold text-white">{stat.value}</span>
                </div>
                <span className="text-muted text-sm font-medium tracking-wide uppercase">{stat.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ Subjects ════════════════ */}
      <section
        id="services"
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0b0c15 0%, #0f1020 50%, #0b0c15 100%)" }}
      >
        <GridPattern />
        <NotebookPattern />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[10%] right-[5%] w-[500px] h-[500px] rounded-full blur-[160px] bg-[#818cf8]/6" />
          <div className="absolute bottom-[10%] left-[5%] w-[400px] h-[400px] rounded-full blur-[140px] bg-[#818cf8]/4" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="WHAT WE TEACH"
            title="Our Subjects"
            highlightWord="Subjects"
            subtitle="Expert tutoring across core academics, test prep, and enrichment -- all personalized to your student's unique learning style."
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((subj, i) => (
              <motion.div
                key={subj.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group relative p-7 rounded-2xl border border-white/[0.06] hover:border-[#818cf8]/30 transition-all duration-500 overflow-hidden bg-white/[0.02]"
              >
                {/* Hover glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,#818cf815,transparent_70%)]" />
                {/* Top accent line */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#818cf8]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  {/* Number + Icon row */}
                  <div className="flex items-start justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl bg-[#818cf8]/10 border border-[#818cf8]/20 flex items-center justify-center text-[#818cf8] group-hover:bg-[#818cf8]/20 group-hover:border-[#818cf8]/40 transition-all duration-300">
                      {subj.icon}
                    </div>
                    <span className="text-4xl font-extrabold text-white/[0.04] group-hover:text-[#818cf8]/10 transition-colors duration-300 leading-none">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold mb-3 group-hover:text-[#818cf8] transition-colors duration-300">{subj.name}</h3>
                  <p className="text-muted text-sm leading-relaxed mb-5">{subj.desc}</p>
                  {/* Feature tags */}
                  <div className="flex flex-wrap gap-2">
                    {subj.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-semibold uppercase tracking-wider text-[#818cf8]/70 bg-[#818cf8]/8 border border-[#818cf8]/10 px-2.5 py-1 rounded-full"
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

      {/* ════════════════ Grade Levels ════════════════ */}
      <section
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0f1020 0%, #121428 50%, #0f1020 100%)" }}
      >
        <GridPattern opacity={0.025} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[30%] left-[50%] -translate-x-1/2 w-[700px] h-[400px] rounded-full blur-[180px] bg-[#818cf8]/6" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="ALL AGES"
            title="Every Grade Level"
            highlightWord="Level"
            subtitle="From kindergarten through college, we meet students where they are and take them where they need to go."
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {gradeLevels.map((gl, i) => (
              <motion.div
                key={gl.level}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative text-center p-8 rounded-2xl border border-white/[0.06] hover:border-[#818cf8]/30 transition-all duration-500 overflow-hidden bg-white/[0.02]"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,#818cf812,transparent_70%)]" />
                <div className="relative z-10">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#818cf8]/50 mb-3 block">LEVEL {String(i + 1).padStart(2, "0")}</span>
                  <p className="text-xl font-extrabold text-white mb-3 leading-tight">{gl.level}</p>
                  <div className="w-8 h-px bg-[#818cf8]/30 mx-auto mb-3" />
                  <p className="text-muted text-sm leading-relaxed">{gl.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ Tutor Profiles ════════════════ */}
      <section
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0b0c15 0%, #0e0f1c 50%, #0b0c15 100%)" }}
      >
        <GridPattern opacity={0.025} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] right-[10%] w-[500px] h-[500px] rounded-full blur-[180px] bg-[#818cf8]/5" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="EXPERT EDUCATORS"
            title="Meet Your Tutors"
            highlightWord="Tutors"
            subtitle="Credentialed educators with advanced degrees, teaching certifications, and a genuine passion for student success."
          />
          <div className="grid md:grid-cols-3 gap-8">
            {tutors.map((tutor, i) => (
              <motion.div
                key={tutor.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="group relative rounded-2xl border border-white/[0.06] hover:border-[#818cf8]/30 transition-all duration-500 overflow-hidden bg-white/[0.02]"
              >
                {/* Photo */}
                <div className="relative aspect-[3/4] overflow-hidden">
                  <img
                    src={tutor.image}
                    alt={tutor.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0b0c15] via-[#0b0c15]/30 to-transparent" />
                  {/* Years badge */}
                  <div className="absolute top-4 right-4 bg-[#818cf8]/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full border border-[#a5b4fc]/30">
                    {tutor.yearsExp}+ YRS
                  </div>
                  {/* Info overlay at bottom */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-xl font-bold mb-1">{tutor.name}</h3>
                    <p className="text-[#818cf8] text-sm font-semibold mb-3">{tutor.title}</p>
                    <div className="flex flex-wrap gap-2">
                      {tutor.specialties.map((s) => (
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

      {/* ════════════════ Success Stories ════════════════ */}
      <section
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0f1020 0%, #121428 50%, #0f1020 100%)" }}
      >
        <GridPattern opacity={0.025} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[30%] left-[50%] -translate-x-1/2 w-[700px] h-[400px] rounded-full blur-[180px] bg-[#818cf8]/6" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="PROVEN RESULTS"
            title="Student Success Stories"
            highlightWord="Success"
            subtitle="Real grade improvements from real students. These results speak louder than any promise."
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {successStories.map((story, i) => (
              <motion.div
                key={story.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative text-center p-8 rounded-2xl border border-white/[0.06] hover:border-[#818cf8]/30 transition-all duration-500 overflow-hidden bg-white/[0.02]"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,#818cf812,transparent_70%)]" />
                <div className="relative z-10">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#818cf8]/50 mb-3 block">{story.subject}</span>
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <span className="text-xl font-bold text-white/40 line-through">{story.before}</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" className="w-5 h-5">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                    <span className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-white to-[#818cf8]">{story.after}</span>
                  </div>
                  <p className="text-[#818cf8] text-sm font-bold mb-1">{story.improvement}</p>
                  <div className="w-8 h-px bg-[#818cf8]/30 mx-auto mb-3" />
                  <p className="text-muted text-sm font-medium">{story.name} &middot; {story.period}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ About / Our Approach ════════════════ */}
      <section
        id="about"
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0b0c15 0%, #0e0f1c 50%, #0b0c15 100%)" }}
      >
        <GridPattern />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] left-[5%] w-[500px] h-[500px] rounded-full blur-[160px] bg-[#818cf8]/5" />
          <div className="absolute bottom-[10%] right-[10%] w-[350px] h-[350px] rounded-full blur-[140px] bg-[#818cf8]/4" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Image Stack */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative w-full aspect-[4/5] max-w-md mx-auto">
                {/* Main image */}
                <div className="absolute top-0 left-0 w-[75%] h-[70%] rounded-2xl overflow-hidden border-2 border-white/[0.06] shadow-2xl z-10">
                  <img
                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&q=80"
                    alt="Students learning together"
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Secondary image */}
                <div className="absolute bottom-0 right-0 w-[65%] h-[55%] rounded-2xl overflow-hidden border-2 border-white/[0.06] shadow-2xl z-20">
                  <img
                    src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&q=80"
                    alt="Student studying"
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Accent badge */}
                <div className="absolute top-[55%] left-[60%] z-30 bg-[#818cf8] rounded-2xl px-5 py-4 shadow-xl shadow-[#818cf8]/20 border border-[#a5b4fc]/30">
                  <span className="block text-3xl font-extrabold text-white leading-none">98%</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-white/80">Grade<br />Improvement</span>
                </div>
                {/* Decorative corner lines */}
                <div className="absolute -top-3 -left-3 w-16 h-16 border-t-2 border-l-2 border-[#818cf8]/20 rounded-tl-xl" />
                <div className="absolute -bottom-3 -right-3 w-16 h-16 border-b-2 border-r-2 border-[#818cf8]/20 rounded-br-xl" />
              </div>
            </motion.div>

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <SectionHeader
                tag="WHY BRIGHT MINDS"
                title="The Bright Minds Difference"
                highlightWord="Difference"
                center={false}
              />
              <p className="text-muted leading-relaxed mb-6 text-lg -mt-8">
                We do not just help with homework. We teach students how to learn, building the skills and confidence they need to succeed independently.
              </p>
              <p className="text-muted leading-relaxed mb-8">
                Every student gets a personalized learning plan based on a thorough diagnostic assessment. Our tutors adapt in real time to the student&apos;s pace, ensuring concepts stick before moving forward. That is why our students do not just pass &mdash; they excel.
              </p>
              {/* Feature list */}
              <div className="space-y-4">
                {[
                  { icon: <BrainIcon />, title: "Diagnostic Assessment", desc: "Identify gaps and build a custom roadmap for success" },
                  { icon: <BookIcon />, title: "1-on-1 Instruction", desc: "Undivided attention from a credentialed educator" },
                  { icon: <ChartIcon />, title: "Progress Tracking", desc: "Bi-weekly reports so parents see measurable improvement" },
                ].map((feature) => (
                  <div key={feature.title} className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-[#818cf8]/20 transition-colors duration-300">
                    <div className="w-10 h-10 rounded-lg bg-[#818cf8]/10 border border-[#818cf8]/20 flex items-center justify-center text-[#818cf8] shrink-0">
                      {feature.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm mb-0.5">{feature.title}</h4>
                      <p className="text-muted text-sm">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ════════════════ Pricing Plans ════════════════ */}
      <section
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0f1020 0%, #121428 50%, #0f1020 100%)" }}
      >
        <GridPattern opacity={0.025} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] right-[10%] w-[600px] h-[500px] rounded-full blur-[180px] bg-[#818cf8]/5" />
          <div className="absolute bottom-[10%] left-[10%] w-[400px] h-[400px] rounded-full blur-[140px] bg-[#818cf8]/4" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="INVESTMENT IN SUCCESS"
            title="Simple, Transparent Pricing"
            highlightWord="Pricing"
            subtitle="No hidden fees, no long-term contracts. Cancel anytime. Every plan includes a free initial assessment."
          />
          <div className="grid md:grid-cols-3 gap-6">
            {pricingPlans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className={`group relative p-8 rounded-2xl border transition-all duration-500 overflow-hidden ${
                  plan.highlighted
                    ? "border-[#818cf8]/40 bg-gradient-to-b from-[#818cf8]/[0.08] to-transparent"
                    : "border-white/[0.06] hover:border-[#818cf8]/30 bg-white/[0.02]"
                }`}
              >
                {plan.highlighted && (
                  <>
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#818cf8]/60 to-transparent" />
                    <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,#818cf815,transparent_60%)]" />
                  </>
                )}
                <div className="relative z-10">
                  {plan.highlighted && (
                    <span className="inline-block text-[10px] font-bold uppercase tracking-[0.2em] text-[#818cf8] bg-[#818cf8]/10 border border-[#818cf8]/20 px-3 py-1 rounded-full mb-4">
                      MOST POPULAR
                    </span>
                  )}
                  <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mb-3">
                    <span className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-white to-[#818cf8]">{plan.price}</span>
                    <span className="text-muted text-sm">{plan.unit}</span>
                  </div>
                  <p className="text-muted text-sm mb-6 leading-relaxed">{plan.desc}</p>
                  <div className="space-y-3 mb-8">
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-[#818cf8]/10 flex items-center justify-center text-[#818cf8] shrink-0">
                          <CheckIcon />
                        </div>
                        <span className="text-sm text-white/80">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    className={`w-full h-12 rounded-xl font-bold text-sm transition-all duration-300 ${
                      plan.highlighted
                        ? "bg-gradient-to-r from-[#818cf8] to-[#6366f1] text-white hover:from-[#a5b4fc] hover:to-[#818cf8] shadow-lg shadow-[#818cf8]/20"
                        : "border border-[#818cf8]/30 text-[#818cf8] hover:bg-[#818cf8]/10 hover:border-[#818cf8]/50"
                    }`}
                  >
                    Get Started
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ FAQ ════════════════ */}
      <section
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0b0c15 0%, #0e0f1c 50%, #0b0c15 100%)" }}
      >
        <GridPattern />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] left-[10%] w-[400px] h-[400px] rounded-full blur-[140px] bg-[#818cf8]/5" />
          <div className="absolute bottom-[15%] right-[10%] w-[350px] h-[350px] rounded-full blur-[120px] bg-[#818cf8]/4" />
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
                className="group p-6 rounded-2xl border border-white/[0.06] hover:border-[#818cf8]/20 transition-all duration-500 overflow-hidden relative bg-white/[0.02]"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_0%_50%,#818cf810,transparent_70%)]" />
                <div className="relative z-10 flex gap-4">
                  <div className="w-8 h-8 shrink-0 rounded-lg bg-[#818cf8]/10 border border-[#818cf8]/20 flex items-center justify-center text-[#818cf8] text-xs font-bold mt-0.5">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div>
                    <h3 className="font-bold mb-2 text-white group-hover:text-[#818cf8] transition-colors duration-300">{faq.q}</h3>
                    <p className="text-muted text-sm leading-relaxed">{faq.a}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ Free Assessment CTA ════════════════ */}
      <section
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0f1020 0%, #141730 50%, #0f1020 100%)" }}
      >
        <GridPattern opacity={0.02} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-[200px] bg-[#818cf8]/6" />
        </div>
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-8 md:p-12 rounded-2xl border border-[#818cf8]/20 relative overflow-hidden bg-gradient-to-b from-[#818cf8]/[0.06] to-transparent"
          >
            {/* Inner glow */}
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,#818cf815,transparent_60%)]" />
            {/* Corner decorations */}
            <div className="absolute top-0 left-0 w-20 h-20 border-t border-l border-[#818cf8]/30 rounded-tl-2xl" />
            <div className="absolute bottom-0 right-0 w-20 h-20 border-b border-r border-[#818cf8]/30 rounded-br-2xl" />
            <div className="relative z-10">
              <div className="text-center mb-8">
                <span className="inline-flex items-center gap-2 bg-[#818cf8]/10 text-[#818cf8] text-xs font-bold uppercase tracking-[0.2em] px-4 py-2 rounded-full mb-4 border border-[#818cf8]/20">
                  <LightbulbIcon />
                  100% FREE
                </span>
                <h2 className="text-3xl md:text-4xl font-extrabold mb-3">
                  Free Academic <span className="text-[#818cf8]">Assessment</span>
                </h2>
                <p className="text-muted max-w-lg mx-auto">
                  Discover your student&apos;s strengths, identify gaps, and get a personalized learning plan &mdash; all at no cost and no obligation.
                </p>
              </div>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Parent / Guardian Name"
                    className="w-full h-13 px-5 rounded-xl bg-white/5 border border-[#818cf8]/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#818cf8]/50 transition-colors"
                  />
                  <input
                    type="text"
                    placeholder="Student Name"
                    className="w-full h-13 px-5 rounded-xl bg-white/5 border border-[#818cf8]/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#818cf8]/50 transition-colors"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="email"
                    placeholder="Email Address"
                    className="w-full h-13 px-5 rounded-xl bg-white/5 border border-[#818cf8]/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#818cf8]/50 transition-colors"
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    className="w-full h-13 px-5 rounded-xl bg-white/5 border border-[#818cf8]/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#818cf8]/50 transition-colors"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Grade Level"
                    className="w-full h-13 px-5 rounded-xl bg-white/5 border border-[#818cf8]/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#818cf8]/50 transition-colors"
                  />
                  <input
                    type="text"
                    placeholder="Subject(s) Needed"
                    className="w-full h-13 px-5 rounded-xl bg-white/5 border border-[#818cf8]/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#818cf8]/50 transition-colors"
                  />
                </div>
                <textarea
                  placeholder="Tell us about your student's goals or challenges..."
                  rows={3}
                  className="w-full px-5 py-4 rounded-xl bg-white/5 border border-[#818cf8]/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#818cf8]/50 resize-none transition-colors"
                />
                <button
                  type="button"
                  className="w-full h-14 rounded-xl bg-gradient-to-r from-[#818cf8] to-[#6366f1] text-white font-bold text-lg hover:from-[#a5b4fc] hover:to-[#818cf8] transition-all duration-300 shadow-lg shadow-[#818cf8]/20"
                >
                  Schedule Free Assessment
                </button>
                <p className="text-center text-white/30 text-xs">
                  No obligation. No credit card required. We will contact you within 24 hours.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ════════════════ Final CTA ════════════════ */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#818cf8]/10 via-[#818cf8]/5 to-[#0b0c15]" />
        <GridPattern opacity={0.03} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#818cf8]/30 to-transparent" />
          <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full blur-[180px] bg-[#818cf8]/8" />
        </div>
        <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block text-[#818cf8] text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border border-[#818cf8]/20 bg-[#818cf8]/5">
              UNLOCK THEIR POTENTIAL
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold mb-4 tracking-tight">
              Every Student Can <span className="text-[#818cf8]">Succeed.</span>
            </h2>
            <p className="text-muted text-lg mb-10 max-w-xl mx-auto leading-relaxed">
              Do not let academic struggles define your student&apos;s future. Our expert tutors are ready to build a plan that transforms potential into achievement.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#contact"
                className="group inline-flex h-14 px-10 rounded-full bg-gradient-to-r from-[#818cf8] to-[#6366f1] text-white font-bold items-center justify-center text-lg hover:from-[#a5b4fc] hover:to-[#818cf8] transition-all duration-300 shadow-lg shadow-[#818cf8]/25 gap-2"
              >
                <span>Free Assessment</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:translate-x-1 transition-transform">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
              <a
                href="tel:4255550135"
                className="inline-flex h-14 px-10 rounded-full border-2 border-[#818cf8]/30 text-[#818cf8] font-bold items-center justify-center text-lg hover:bg-[#818cf8]/10 hover:border-[#818cf8]/50 transition-all duration-300 gap-2"
              >
                <PhoneIcon />
                <span>Call (425) 555-0135</span>
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </TemplateLayout>
  );
}
