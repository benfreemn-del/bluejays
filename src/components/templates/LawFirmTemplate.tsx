"use client";

import { motion } from "framer-motion";
import TemplateLayout from "./TemplateLayout";

/* ───────────────────────── SVG Icons ───────────────────────── */

const ScalesIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M12 3v18M4 7l8-4 8 4M4 7l-2 8h8L8 7M20 7l2 8h-8l2-8" />
  </svg>
);

const ShieldCheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const GavelIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M14.121 14.121L7.05 21.192a1 1 0 01-1.414 0l-.828-.828a1 1 0 010-1.414l7.07-7.071m2.243 2.242l2.829-2.829a1 1 0 000-1.414l-4.243-4.243a1 1 0 00-1.414 0L8.464 8.464m5.657 5.657l-5.657-5.657" />
    <path d="M3 21h18" strokeLinecap="round" />
  </svg>
);

const DocumentIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const BuildingIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

const HomeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const UsersIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
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

const TrophyIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
    <path d="M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
  </svg>
);

const StarIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

/* ───────────────────────── Grid Pattern ───────────────────────── */

const GridPattern = ({ opacity = 0.03 }: { opacity?: number }) => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }}>
    <defs>
      <pattern id="lawGrid" width="60" height="60" patternUnits="userSpaceOnUse">
        <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#8b5cf6" strokeWidth="0.5" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#lawGrid)" />
  </svg>
);

/* ───────────────────────── Data ───────────────────────── */

const practiceAreas = [
  {
    name: "Personal Injury",
    desc: "Car accidents, slip and fall, medical malpractice. We fight relentlessly for maximum compensation on your behalf.",
    icon: <ScalesIcon />,
    tags: ["Auto Accidents", "Med-Mal", "Wrongful Death"],
  },
  {
    name: "Family Law",
    desc: "Divorce, custody, adoption, and prenuptial agreements handled with discretion and unwavering advocacy.",
    icon: <UsersIcon />,
    tags: ["Divorce", "Child Custody", "Adoption"],
  },
  {
    name: "Criminal Defense",
    desc: "DUI, misdemeanors, felonies. Aggressive defense strategies built on decades of courtroom experience.",
    icon: <ShieldCheckIcon />,
    tags: ["DUI Defense", "Felony", "White Collar"],
  },
  {
    name: "Estate Planning",
    desc: "Wills, trusts, and power of attorney. Protect what matters most with iron-clad estate strategies.",
    icon: <DocumentIcon />,
    tags: ["Wills & Trusts", "Probate", "Asset Protection"],
  },
  {
    name: "Business Law",
    desc: "Formation, contracts, disputes, and compliance for businesses from startups to enterprises.",
    icon: <BuildingIcon />,
    tags: ["Contracts", "Litigation", "Compliance"],
  },
  {
    name: "Real Estate Law",
    desc: "Closings, disputes, landlord-tenant issues, and title review with meticulous attention to detail.",
    icon: <HomeIcon />,
    tags: ["Closings", "Disputes", "Title Review"],
  },
];

const caseResults = [
  { amount: "$4.2M", type: "Medical Malpractice Verdict", year: "2024" },
  { amount: "$2.8M", type: "Trucking Accident Settlement", year: "2024" },
  { amount: "$1.9M", type: "Workplace Injury Award", year: "2023" },
  { amount: "$1.2M", type: "Wrongful Death Settlement", year: "2023" },
];

const attorneys = [
  {
    name: "Marcus D. Carter",
    title: "Founding Partner",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
    specialties: ["Personal Injury", "Trial Law"],
    yearsExp: 24,
  },
  {
    name: "Victoria L. Chen",
    title: "Senior Partner",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80",
    specialties: ["Family Law", "Estate Planning"],
    yearsExp: 18,
  },
  {
    name: "James R. Holloway",
    title: "Partner",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80",
    specialties: ["Criminal Defense", "DUI"],
    yearsExp: 15,
  },
];

const testimonials = [
  {
    name: "Thomas W.",
    text: "After my accident, they took care of everything. I got a settlement far beyond what I expected. Truly world-class representation.",
    caseType: "Personal Injury",
    rating: 5,
  },
  {
    name: "Jennifer L.",
    text: "Going through a divorce was the hardest time of my life, but they made the legal side painless. Compassionate, strategic, and professional.",
    caseType: "Family Law",
    rating: 5,
  },
  {
    name: "Robert M.",
    text: "They took my case when others wouldn&apos;t. Fought hard and won. I owe my freedom and my future to this team. Cannot recommend them enough.",
    caseType: "Criminal Defense",
    rating: 5,
  },
];

const faqs = [
  {
    q: "How much does a consultation cost?",
    a: "Your initial consultation is completely free. We will review the details of your case and advise you on your legal options with no obligation.",
  },
  {
    q: 'What does "no fee unless we win" mean?',
    a: "For personal injury and many other case types, we work on a contingency basis. You pay nothing upfront and we only collect a fee if we successfully recover compensation for you.",
  },
  {
    q: "How long will my case take?",
    a: "Every case is unique. Some settle in weeks, while complex litigation can take months or longer. During your consultation, we will give you an honest timeline based on your specific situation.",
  },
  {
    q: "Do I have to go to court?",
    a: "Not necessarily. Many cases are resolved through negotiation and settlement. However, if a fair settlement cannot be reached, we are fully prepared to take your case to trial.",
  },
  {
    q: "What should I bring to my first meeting?",
    a: "Bring any relevant documents such as police reports, medical records, contracts, or correspondence related to your case. If you do not have these, we can help you obtain them.",
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
        className="inline-block text-[#8b5cf6] text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border border-[#8b5cf6]/20 bg-[#8b5cf6]/5"
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
        <span className="text-[#8b5cf6]">{highlightWord}</span>
        {parts[1] || ""}
      </motion.h2>
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className={`h-0.5 w-16 bg-gradient-to-r from-[#8b5cf6] to-transparent mt-4 ${center ? "mx-auto" : ""}`}
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

export default function LawFirmTemplate() {
  return (
    <TemplateLayout
      businessName="Carter & Associates"
      tagline="Experienced attorneys fighting for your rights. Over 20 years of proven results."
      accentColor="#8b5cf6"
      accentColorLight="#a78bfa"
      heroGradient="linear-gradient(135deg, #1f1a2e 0%, #13101f 100%)"
      heroImage="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1400&q=80"
      phone="(555) 345-6789"
      address="456 Justice Blvd, Your City"
    >
      {/* ════════════════ Emergency Bar ════════════════ */}
      <section className="py-3 bg-gradient-to-r from-[#8b5cf6] via-[#7c3aed] to-[#8b5cf6] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9Im5vbmUiLz48cGF0aCBkPSJNMCAwTDQwIDQwTTQwIDBMMCA0MCIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjAuMyIgb3BhY2l0eT0iMC4xIi8+PC9zdmc+')] opacity-30" />
        <div className="max-w-6xl mx-auto px-6 flex flex-wrap items-center justify-center gap-6 relative z-10">
          <div className="flex items-center gap-3">
            <ScalesIcon />
            <p className="text-sm font-bold tracking-wide">FREE INITIAL CONSULTATION &mdash; NO FEE UNLESS WE WIN</p>
          </div>
          <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm px-5 py-2 rounded-full border border-white/20">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
            </span>
            <span className="text-xs font-bold tracking-wider">24/7 EMERGENCY LINE: (555) 345-6789</span>
          </div>
        </div>
      </section>

      {/* ════════════════ Stats Banner ════════════════ */}
      <section className="py-12 relative overflow-hidden bg-[#0c0a14] border-b border-[#8b5cf6]/10">
        <GridPattern opacity={0.02} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] rounded-full blur-[180px] bg-[#8b5cf6]/5" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "500+", label: "Cases Won", icon: <TrophyIcon /> },
              { value: "$50M+", label: "Recovered", icon: <ScalesIcon /> },
              { value: "20+", label: "Years Experience", icon: <ClockIcon /> },
              { value: "98%", label: "Client Satisfaction", icon: <CheckCircleIcon /> },
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
                  <span className="text-[#8b5cf6]">{stat.icon}</span>
                  <span className="text-3xl md:text-4xl font-extrabold text-white">{stat.value}</span>
                </div>
                <span className="text-muted text-sm font-medium tracking-wide uppercase">{stat.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ Practice Areas ════════════════ */}
      <section
        id="services"
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0a0a12 0%, #0f0b1a 50%, #0a0a12 100%)" }}
      >
        <GridPattern />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[10%] right-[5%] w-[500px] h-[500px] rounded-full blur-[160px] bg-[#8b5cf6]/6" />
          <div className="absolute bottom-[10%] left-[5%] w-[400px] h-[400px] rounded-full blur-[140px] bg-[#8b5cf6]/4" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="WHAT WE DO"
            title="Our Practice Areas"
            highlightWord="Practice Areas"
            subtitle="Comprehensive legal representation backed by decades of courtroom victories and relentless client advocacy."
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {practiceAreas.map((area, i) => (
              <motion.div
                key={area.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group relative p-7 rounded-2xl border border-white/[0.06] hover:border-[#8b5cf6]/30 transition-all duration-500 overflow-hidden bg-white/[0.02]"
              >
                {/* Hover glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,#8b5cf615,transparent_70%)]" />
                {/* Top accent line */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#8b5cf6]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  {/* Number + Icon row */}
                  <div className="flex items-start justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl bg-[#8b5cf6]/10 border border-[#8b5cf6]/20 flex items-center justify-center text-[#8b5cf6] group-hover:bg-[#8b5cf6]/20 group-hover:border-[#8b5cf6]/40 transition-all duration-300">
                      {area.icon}
                    </div>
                    <span className="text-4xl font-extrabold text-white/[0.04] group-hover:text-[#8b5cf6]/10 transition-colors duration-300 leading-none">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold mb-3 group-hover:text-[#8b5cf6] transition-colors duration-300">{area.name}</h3>
                  <p className="text-muted text-sm leading-relaxed mb-5">{area.desc}</p>
                  {/* Feature tags */}
                  <div className="flex flex-wrap gap-2">
                    {area.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-semibold uppercase tracking-wider text-[#8b5cf6]/70 bg-[#8b5cf6]/8 border border-[#8b5cf6]/10 px-2.5 py-1 rounded-full"
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

      {/* ════════════════ Case Results ════════════════ */}
      <section
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0f0b1a 0%, #130f20 50%, #0f0b1a 100%)" }}
      >
        <GridPattern opacity={0.025} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[30%] left-[50%] -translate-x-1/2 w-[700px] h-[400px] rounded-full blur-[180px] bg-[#8b5cf6]/6" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="PROVEN RESULTS"
            title="Millions Recovered"
            highlightWord="Recovered"
            subtitle="Our track record speaks louder than promises. These are real results for real clients."
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {caseResults.map((result, i) => (
              <motion.div
                key={result.type}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative text-center p-8 rounded-2xl border border-white/[0.06] hover:border-[#8b5cf6]/30 transition-all duration-500 overflow-hidden bg-white/[0.02]"
              >
                {/* Hover glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,#8b5cf612,transparent_70%)]" />
                <div className="relative z-10">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8b5cf6]/50 mb-3 block">{result.year}</span>
                  <p className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-white to-[#8b5cf6] mb-3 leading-none py-1">
                    {result.amount}
                  </p>
                  <div className="w-8 h-px bg-[#8b5cf6]/30 mx-auto mb-3" />
                  <p className="text-muted text-sm font-medium">{result.type}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ About / Why Choose Us ════════════════ */}
      <section
        id="about"
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0a0a12 0%, #0d0a18 50%, #0a0a12 100%)" }}
      >
        <GridPattern />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] left-[5%] w-[500px] h-[500px] rounded-full blur-[160px] bg-[#8b5cf6]/5" />
          <div className="absolute bottom-[10%] right-[10%] w-[350px] h-[350px] rounded-full blur-[140px] bg-[#8b5cf6]/4" />
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
                    src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&q=80"
                    alt="Courthouse"
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Secondary image */}
                <div className="absolute bottom-0 right-0 w-[65%] h-[55%] rounded-2xl overflow-hidden border-2 border-white/[0.06] shadow-2xl z-20">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80"
                    alt="Attorney portrait"
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Accent badge */}
                <div className="absolute top-[55%] left-[60%] z-30 bg-[#8b5cf6] rounded-2xl px-5 py-4 shadow-xl shadow-[#8b5cf6]/20 border border-[#a78bfa]/30">
                  <span className="block text-3xl font-extrabold text-white leading-none">20+</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-white/80">Years of<br />Justice</span>
                </div>
                {/* Decorative corner lines */}
                <div className="absolute -top-3 -left-3 w-16 h-16 border-t-2 border-l-2 border-[#8b5cf6]/20 rounded-tl-xl" />
                <div className="absolute -bottom-3 -right-3 w-16 h-16 border-b-2 border-r-2 border-[#8b5cf6]/20 rounded-br-xl" />
              </div>
            </motion.div>

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <SectionHeader
                tag="WHO WE ARE"
                title="Relentless Advocacy"
                highlightWord="Advocacy"
                center={false}
              />
              <p className="text-muted leading-relaxed mb-6 text-lg -mt-8">
                At Carter &amp; Associates, every case gets the senior partner&apos;s attention. We limit our caseload so we can give your matter the focus it deserves.
              </p>
              <p className="text-muted leading-relaxed mb-8">
                When you hire us, you get a team that fights as if the outcome were our own. We are not a case number factory &mdash; we are trial-tested advocates who have stood before judges and juries hundreds of times and won.
              </p>
              {/* Feature list */}
              <div className="space-y-4">
                {[
                  { icon: <GavelIcon />, title: "Trial-Tested", desc: "Hundreds of courtroom victories across all practice areas" },
                  { icon: <ShieldCheckIcon />, title: "No Fee Unless We Win", desc: "Contingency basis means zero financial risk to you" },
                  { icon: <PhoneIcon />, title: "24/7 Availability", desc: "Emergency line staffed around the clock for urgent matters" },
                ].map((feature) => (
                  <div key={feature.title} className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-[#8b5cf6]/20 transition-colors duration-300">
                    <div className="w-10 h-10 rounded-lg bg-[#8b5cf6]/10 border border-[#8b5cf6]/20 flex items-center justify-center text-[#8b5cf6] shrink-0">
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

      {/* ════════════════ Attorneys ════════════════ */}
      <section
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0f0b1a 0%, #110d1e 50%, #0f0b1a 100%)" }}
      >
        <GridPattern opacity={0.025} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] right-[10%] w-[500px] h-[500px] rounded-full blur-[180px] bg-[#8b5cf6]/5" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="OUR TEAM"
            title="Meet Your Attorneys"
            highlightWord="Attorneys"
            subtitle="A commanding team of legal professionals with the experience and tenacity to win your case."
          />
          <div className="grid md:grid-cols-3 gap-8">
            {attorneys.map((attorney, i) => (
              <motion.div
                key={attorney.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="group relative rounded-2xl border border-white/[0.06] hover:border-[#8b5cf6]/30 transition-all duration-500 overflow-hidden bg-white/[0.02]"
              >
                {/* Photo */}
                <div className="relative aspect-[3/4] overflow-hidden">
                  <img
                    src={attorney.image}
                    alt={attorney.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a12] via-[#0a0a12]/30 to-transparent" />
                  {/* Years badge */}
                  <div className="absolute top-4 right-4 bg-[#8b5cf6]/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full border border-[#a78bfa]/30">
                    {attorney.yearsExp}+ YRS
                  </div>
                  {/* Info overlay at bottom */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-xl font-bold mb-1">{attorney.name}</h3>
                    <p className="text-[#8b5cf6] text-sm font-semibold mb-3">{attorney.title}</p>
                    <div className="flex flex-wrap gap-2">
                      {attorney.specialties.map((s) => (
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

      {/* ════════════════ Why Choose Us Banner ════════════════ */}
      <section className="py-20 relative overflow-hidden bg-gradient-to-b from-[#8b5cf6]/10 to-[#0a0a12]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#8b5cf6]/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#8b5cf6]/10 to-transparent" />
          <svg className="absolute inset-0 w-full h-full opacity-[0.04]" viewBox="0 0 1000 400">
            <path d="M0 200 Q250 100 500 200 Q750 300 1000 200" stroke="#8b5cf6" strokeWidth="1" fill="none" />
            <path d="M0 250 Q250 150 500 250 Q750 350 1000 250" stroke="#8b5cf6" strokeWidth="0.5" fill="none" />
            <circle cx="500" cy="200" r="80" stroke="#8b5cf6" strokeWidth="0.3" fill="none" />
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
              WHY CHOOSE <span className="text-[#8b5cf6]">CARTER &amp; ASSOCIATES?</span>
            </h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <GavelIcon />, title: "Trial-Proven", desc: "Over 500 cases won with an aggressive, results-driven approach" },
              { icon: <ScalesIcon />, title: "Senior Focus", desc: "Every case gets direct attention from a named partner" },
              { icon: <PhoneIcon />, title: "24/7 Access", desc: "Emergency line answered around the clock, every day of the year" },
              { icon: <ShieldCheckIcon />, title: "No Risk", desc: "No fee unless we recover money for you. Zero financial risk." },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group text-center p-6 rounded-2xl border border-white/[0.06] hover:border-[#8b5cf6]/30 bg-white/[0.02] transition-all duration-500"
              >
                <div className="w-14 h-14 mx-auto rounded-xl bg-[#8b5cf6]/10 border border-[#8b5cf6]/20 flex items-center justify-center text-[#8b5cf6] mb-4 group-hover:bg-[#8b5cf6]/20 group-hover:scale-110 transition-all duration-300">
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
        style={{ background: "linear-gradient(180deg, #0a0a12 0%, #0d0a18 50%, #0a0a12 100%)" }}
      >
        <GridPattern />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[30%] left-[40%] w-[600px] h-[400px] rounded-full blur-[180px] bg-[#8b5cf6]/5" />
          <svg className="absolute inset-0 w-full h-full opacity-[0.025]" viewBox="0 0 800 400">
            <circle cx="400" cy="200" r="100" stroke="#8b5cf6" strokeWidth="0.5" fill="none" />
            <circle cx="400" cy="200" r="180" stroke="#8b5cf6" strokeWidth="0.3" fill="none" />
            <circle cx="400" cy="200" r="260" stroke="#8b5cf6" strokeWidth="0.2" fill="none" />
          </svg>
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="CLIENT TESTIMONIALS"
            title="Trusted by Hundreds"
            highlightWord="Hundreds"
            subtitle="Real stories from real clients who trusted us with their most critical legal matters."
          />
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative p-7 rounded-2xl border border-white/[0.06] hover:border-[#8b5cf6]/30 transition-all duration-500 overflow-hidden bg-white/[0.02]"
              >
                {/* Top accent line */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-[#8b5cf6]/40 via-[#8b5cf6]/10 to-transparent" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_0%_0%,#8b5cf610,transparent_70%)]" />
                <div className="relative z-10">
                  {/* Case type tag */}
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8b5cf6]/70 bg-[#8b5cf6]/8 border border-[#8b5cf6]/10 px-2.5 py-1 rounded-full">
                    {t.caseType}
                  </span>
                  {/* Stars */}
                  <div className="flex items-center gap-0.5 text-[#8b5cf6] mt-4 mb-4">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <StarIcon key={j} />
                    ))}
                  </div>
                  {/* Quote */}
                  <p className="text-muted leading-relaxed mb-6 text-sm">&ldquo;{t.text}&rdquo;</p>
                  {/* Author */}
                  <div className="flex items-center gap-3 pt-4 border-t border-white/[0.06]">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8b5cf6]/30 to-[#8b5cf6]/10 flex items-center justify-center text-sm font-bold text-[#8b5cf6]">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-sm">{t.name}</p>
                      <p className="text-muted text-xs">Verified Client</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ Confidential Case Review ════════════════ */}
      <section
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0f0b1a 0%, #130f22 50%, #0f0b1a 100%)" }}
      >
        <GridPattern opacity={0.02} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-[200px] bg-[#8b5cf6]/6" />
        </div>
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-8 md:p-12 rounded-2xl border border-[#8b5cf6]/20 relative overflow-hidden bg-gradient-to-b from-[#8b5cf6]/[0.06] to-transparent"
          >
            {/* Inner glow */}
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,#8b5cf615,transparent_60%)]" />
            {/* Corner decorations */}
            <div className="absolute top-0 left-0 w-20 h-20 border-t border-l border-[#8b5cf6]/30 rounded-tl-2xl" />
            <div className="absolute bottom-0 right-0 w-20 h-20 border-b border-r border-[#8b5cf6]/30 rounded-br-2xl" />
            <div className="relative z-10">
              <div className="text-center mb-8">
                <span className="inline-flex items-center gap-2 bg-[#8b5cf6]/10 text-[#8b5cf6] text-xs font-bold uppercase tracking-[0.2em] px-4 py-2 rounded-full mb-4 border border-[#8b5cf6]/20">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                    <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  100% CONFIDENTIAL
                </span>
                <h2 className="text-3xl md:text-4xl font-extrabold mb-3">
                  Free <span className="text-[#8b5cf6]">Case Review</span>
                </h2>
                <p className="text-muted max-w-lg mx-auto">
                  Tell us about your situation. All information is protected by attorney-client privilege. We respond within 24 hours.
                </p>
              </div>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Your Name"
                    className="w-full h-13 px-5 rounded-xl bg-white/5 border border-[#8b5cf6]/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#8b5cf6]/50 transition-colors"
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    className="w-full h-13 px-5 rounded-xl bg-white/5 border border-[#8b5cf6]/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#8b5cf6]/50 transition-colors"
                  />
                </div>
                <input
                  type="tel"
                  placeholder="Phone Number"
                  className="w-full h-13 px-5 rounded-xl bg-white/5 border border-[#8b5cf6]/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#8b5cf6]/50 transition-colors"
                />
                <textarea
                  placeholder="Briefly describe your legal situation..."
                  rows={4}
                  className="w-full px-5 py-4 rounded-xl bg-white/5 border border-[#8b5cf6]/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#8b5cf6]/50 resize-none transition-colors"
                />
                <button
                  type="button"
                  className="w-full h-14 rounded-xl bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] text-white font-bold text-lg hover:from-[#a78bfa] hover:to-[#8b5cf6] transition-all duration-300 shadow-lg shadow-[#8b5cf6]/20"
                >
                  Submit for Free Review
                </button>
                <p className="text-center text-white/30 text-xs">
                  Your information is protected by attorney-client privilege and will never be shared.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ════════════════ FAQ ════════════════ */}
      <section
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0a0a12 0%, #0d0a18 50%, #0a0a12 100%)" }}
      >
        <GridPattern />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] left-[10%] w-[400px] h-[400px] rounded-full blur-[140px] bg-[#8b5cf6]/5" />
          <div className="absolute bottom-[15%] right-[10%] w-[350px] h-[350px] rounded-full blur-[120px] bg-[#8b5cf6]/4" />
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
                className="group p-6 rounded-2xl border border-white/[0.06] hover:border-[#8b5cf6]/20 transition-all duration-500 overflow-hidden relative bg-white/[0.02]"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_0%_50%,#8b5cf610,transparent_70%)]" />
                <div className="relative z-10 flex gap-4">
                  <div className="w-8 h-8 shrink-0 rounded-lg bg-[#8b5cf6]/10 border border-[#8b5cf6]/20 flex items-center justify-center text-[#8b5cf6] text-xs font-bold mt-0.5">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div>
                    <h3 className="font-bold mb-2 text-white group-hover:text-[#8b5cf6] transition-colors duration-300">{faq.q}</h3>
                    <p className="text-muted text-sm leading-relaxed">{faq.a}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ Final CTA ════════════════ */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#8b5cf6]/10 via-[#8b5cf6]/5 to-[#0a0a12]" />
        <GridPattern opacity={0.03} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#8b5cf6]/30 to-transparent" />
          <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full blur-[180px] bg-[#8b5cf6]/8" />
        </div>
        <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block text-[#8b5cf6] text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border border-[#8b5cf6]/20 bg-[#8b5cf6]/5">
              ACT NOW
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold mb-4 tracking-tight">
              Don&apos;t Wait &mdash; <span className="text-[#8b5cf6]">Protect Your Rights</span>
            </h2>
            <p className="text-muted text-lg mb-10 max-w-xl mx-auto leading-relaxed">
              Time limits apply to most legal claims. The sooner you act, the stronger your case. Contact us now for your free, confidential consultation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#contact"
                className="group inline-flex h-14 px-10 rounded-full bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] text-white font-bold items-center justify-center text-lg hover:from-[#a78bfa] hover:to-[#8b5cf6] transition-all duration-300 shadow-lg shadow-[#8b5cf6]/25 gap-2"
              >
                <span>Free Consultation</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:translate-x-1 transition-transform">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
              <a
                href="tel:5553456789"
                className="inline-flex h-14 px-10 rounded-full border-2 border-[#8b5cf6]/30 text-[#8b5cf6] font-bold items-center justify-center text-lg hover:bg-[#8b5cf6]/10 hover:border-[#8b5cf6]/50 transition-all duration-300 gap-2"
              >
                <PhoneIcon />
                <span>Call 24/7</span>
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </TemplateLayout>
  );
}
