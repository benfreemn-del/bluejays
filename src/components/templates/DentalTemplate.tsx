"use client";

/* eslint-disable @next/next/no-img-element -- These static marketing and preview components intentionally use plain img tags to preserve existing markup and visual behavior during lint-only cleanup. */

import { motion } from "framer-motion";
import TemplateLayout from "./TemplateLayout";

/* ───────────────────────── SVG Icons ───────────────────────── */

const ToothIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M12 2C9.5 2 7 3.5 6 6c-1.5 3.5-.5 6 0 8 .5 2 1 4.5 2 6 .5.8 1.2 1 1.8.5.5-.5.8-1.5 1.2-3 .3-1 .7-1.5 1-1.5s.7.5 1 1.5c.4 1.5.7 2.5 1.2 3 .6.5 1.3.3 1.8-.5 1-1.5 1.5-4 2-6s1.5-4.5 0-8c-1-2.5-3.5-4-6-4z" />
  </svg>
);

const SmileIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <circle cx="12" cy="12" r="10" />
    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
    <line x1="9" y1="9" x2="9.01" y2="9" strokeLinecap="round" />
    <line x1="15" y1="9" x2="15.01" y2="9" strokeLinecap="round" />
  </svg>
);

const SparkleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M12 3l1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3z" />
    <path d="M18 14l.75 2.25L21 17l-2.25.75L18 20l-.75-2.25L15 17l2.25-.75L18 14z" />
  </svg>
);

const BracesIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <rect x="3" y="9" width="18" height="6" rx="1" />
    <rect x="6" y="10.5" width="3" height="3" rx="0.5" />
    <rect x="10.5" y="10.5" width="3" height="3" rx="0.5" />
    <rect x="15" y="10.5" width="3" height="3" rx="0.5" />
    <line x1="7.5" y1="9" x2="7.5" y2="7" />
    <line x1="12" y1="9" x2="12" y2="7" />
    <line x1="16.5" y1="9" x2="16.5" y2="7" />
    <line x1="7.5" y1="15" x2="7.5" y2="17" />
    <line x1="12" y1="15" x2="12" y2="17" />
    <line x1="16.5" y1="15" x2="16.5" y2="17" />
  </svg>
);

const ImplantIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M9 2h6v4c0 1-1 2-2 2h-2c-1 0-2-1-2-2V2z" />
    <path d="M10 8l-.5 2M14 8l.5 2" />
    <path d="M9.5 10l-.5 2.5M14.5 10l.5 2.5" />
    <path d="M9 12.5L8.5 15M15 12.5l.5 2.5" />
    <path d="M8.5 15l-.5 2M15.5 15l.5 2" />
    <path d="M8 17l.5 2.5c.2 1 .8 1.5 1.5 1.5h4c.7 0 1.3-.5 1.5-1.5L16 17" />
  </svg>
);

const EmergencyIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M12 2L2 7l10 5 10-5-10-5z" />
    <path d="M2 17l10 5 10-5" />
    <path d="M2 12l10 5 10-5" />
    <line x1="12" y1="8" x2="12" y2="13" strokeLinecap="round" />
    <circle cx="12" cy="15" r="0.5" fill="currentColor" />
  </svg>
);

const KidToothIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M12 2C9.5 2 7 3.5 6 6c-1.5 3.5-.5 6 0 8 .5 2 1 4.5 2 6 .5.8 1.2 1 1.8.5.5-.5.8-1.5 1.2-3 .3-1 .7-1.5 1-1.5s.7.5 1 1.5c.4 1.5.7 2.5 1.2 3 .6.5 1.3.3 1.8-.5 1-1.5 1.5-4 2-6s1.5-4.5 0-8c-1-2.5-3.5-4-6-4z" />
    <circle cx="10" cy="8" r="0.7" fill="currentColor" />
    <circle cx="14" cy="8" r="0.7" fill="currentColor" />
    <path d="M10 11c.5.8 1.2 1 2 1s1.5-.2 2-1" />
  </svg>
);

const SedationIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <circle cx="12" cy="12" r="10" />
    <path d="M8 15c1 1.5 2.5 2 4 2s3-.5 4-2" />
    <path d="M8.5 9.5c.5-.3 1-.5 1.5-.5s1 .2 1.5.5" />
    <path d="M12.5 9.5c.5-.3 1-.5 1.5-.5s1 .2 1.5.5" />
    <path d="M3 8l1.5-1L6 8" />
    <path d="M1 6l1.5-1L4 6" />
  </svg>
);

const EquipmentIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <rect x="4" y="3" width="16" height="12" rx="2" />
    <line x1="8" y1="19" x2="16" y2="19" />
    <line x1="12" y1="15" x2="12" y2="19" />
    <path d="M8 7h2v4H8zM11 9h2v2h-2zM14 6h2v5h-2z" />
  </svg>
);

const HeartHandIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M12 5.5C10.5 3.5 7 3 5.5 5.5 4 8 5.5 10 12 14.5c6.5-4.5 8-6.5 6.5-9C17 3 13.5 3.5 12 5.5z" />
    <path d="M4 18h2l1.5-1.5L9 18h2l2 2h4c1 0 2 .5 2 1.5" />
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

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
    <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
    <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

/* ───────────────────────── Tooth Outline Pattern ───────────────────────── */

const ToothPattern = ({ opacity = 0.03 }: { opacity?: number }) => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }}>
    <defs>
      <pattern id="dentalPattern" width="80" height="90" patternUnits="userSpaceOnUse">
        <path
          d="M40 5c-5 0-10 3-12 8-3 7-1 12 0 16s2 9 4 12c1 1.5 2.5 2 3.5 1 1-1 1.5-3 2.5-6 .5-2 1.5-3 2-3s1.5 1 2 3c1 3 1.5 5 2.5 6 1 1 2.5.5 3.5-1 2-3 3-8 4-12s3-9 0-16c-2-5-7-8-12-8z"
          fill="none"
          stroke="#10b981"
          strokeWidth="0.4"
        />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#dentalPattern)" />
  </svg>
);

const CrossPattern = ({ opacity = 0.02 }: { opacity?: number }) => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }}>
    <defs>
      <pattern id="crossPattern" width="50" height="50" patternUnits="userSpaceOnUse">
        <line x1="25" y1="15" x2="25" y2="35" stroke="#10b981" strokeWidth="0.5" />
        <line x1="15" y1="25" x2="35" y2="25" stroke="#10b981" strokeWidth="0.5" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#crossPattern)" />
  </svg>
);

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
        className="inline-block text-[#10b981] text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border border-[#10b981]/20 bg-[#10b981]/5"
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
        <span className="text-[#10b981]">{highlightWord}</span>
        {parts[1] || ""}
      </motion.h2>
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className={`h-0.5 w-16 bg-gradient-to-r from-[#10b981] to-transparent mt-4 ${center ? "mx-auto" : ""}`}
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

/* ───────────────────────── Data ───────────────────────── */

const services = [
  {
    name: "General Dentistry",
    desc: "Comprehensive exams, professional cleanings, fillings, and preventive care to keep your whole family smiling.",
    icon: <ToothIcon />,
    tags: ["Exams", "Cleanings", "Fillings"],
  },
  {
    name: "Cosmetic Dentistry",
    desc: "Professional whitening, porcelain veneers, and complete smile makeovers designed to transform your confidence.",
    icon: <SparkleIcon />,
    tags: ["Whitening", "Veneers", "Bonding"],
  },
  {
    name: "Orthodontics",
    desc: "Invisalign clear aligners and traditional braces for a perfectly aligned, magazine-worthy smile.",
    icon: <BracesIcon />,
    tags: ["Invisalign", "Braces", "Retainers"],
  },
  {
    name: "Implants & Crowns",
    desc: "Permanent, natural-looking solutions for missing or damaged teeth. Restore your smile and your confidence.",
    icon: <ImplantIcon />,
    tags: ["Implants", "Crowns", "Bridges"],
  },
  {
    name: "Emergency Care",
    desc: "Same-day appointments for dental emergencies. Severe pain, broken teeth, infections treated immediately.",
    icon: <EmergencyIcon />,
    tags: ["Same-Day", "Trauma", "Pain Relief"],
  },
  {
    name: "Pediatric Dentistry",
    desc: "Gentle, fun dental care designed specifically for kids. Building healthy habits that last a lifetime.",
    icon: <KidToothIcon />,
    tags: ["Kids", "Sealants", "Fluoride"],
  },
];

const insurances = [
  { name: "Delta Dental", abbr: "DD" },
  { name: "Cigna", abbr: "CG" },
  { name: "Aetna", abbr: "AE" },
  { name: "MetLife", abbr: "ML" },
  { name: "United Healthcare", abbr: "UH" },
  { name: "Guardian", abbr: "GD" },
  { name: "BlueCross", abbr: "BC" },
  { name: "Humana", abbr: "HU" },
];

const teamMembers = [
  {
    name: "Dr. Sarah Chen",
    title: "Lead Dentist, DDS",
    specialty: "Cosmetic & Restorative",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&q=80",
    yearsExp: 14,
  },
  {
    name: "Dr. James Park",
    title: "Orthodontist, DMD",
    specialty: "Invisalign Certified",
    image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&q=80",
    yearsExp: 10,
  },
  {
    name: "Dr. Maria Lopez",
    title: "Pediatric Specialist, DDS",
    specialty: "Children & Sedation",
    image: "https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?w=400&q=80",
    yearsExp: 8,
  },
];

const testimonials = [
  {
    name: "Amanda T.",
    text: "Best dental experience I have ever had. The staff is incredibly friendly, the office is beautiful, and I felt zero anxiety the entire time.",
    visitType: "Cosmetic",
    rating: 5,
  },
  {
    name: "Michael B.",
    text: "My kids actually look forward to their dental visits now. That says everything about how welcoming and gentle this team is.",
    visitType: "Pediatric",
    rating: 5,
  },
  {
    name: "Rachel S.",
    text: "Got my Invisalign here and the results are incredible. The whole process was smooth, fast, and completely painless.",
    visitType: "Orthodontics",
    rating: 5,
  },
];

/* ───────────────────────── Main Component ───────────────────────── */

export default function DentalTemplate() {
  return (
    <TemplateLayout
      businessName="Bright Smile Dental"
      tagline="Modern dental care for the whole family. Gentle, compassionate, and always accepting new patients."
      accentColor="#10b981"
      accentColorLight="#34d399"
      heroGradient="linear-gradient(135deg, #0a1f1a 0%, #071510 100%)"
      heroImage="https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=1400&q=80"
      phone="(555) 234-5678"
      address="123 Health Ave, Your City"
    >
      {/* ════════════════ Trust Bar ════════════════ */}
      <section className="py-3 bg-gradient-to-r from-[#10b981] via-[#059669] to-[#10b981] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9Im5vbmUiLz48cGF0aCBkPSJNMCAwTDQwIDQwTTQwIDBMMCA0MCIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjAuMyIgb3BhY2l0eT0iMC4xIi8+PC9zdmc+')] opacity-30" />
        <div className="max-w-6xl mx-auto px-6 flex flex-wrap items-center justify-center gap-6 relative z-10">
          <div className="flex items-center gap-3">
            <ToothIcon />
            <p className="text-sm font-bold tracking-wide">ACCEPTING NEW PATIENTS &mdash; BOOK YOUR VISIT TODAY</p>
          </div>
          <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm px-5 py-2 rounded-full border border-white/20">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
            </span>
            <span className="text-xs font-bold tracking-wider">SAME-DAY EMERGENCIES: (555) 234-5678</span>
          </div>
        </div>
      </section>

      {/* ════════════════ Stats Banner ════════════════ */}
      <section className="py-12 relative overflow-hidden bg-[#0a100e] border-b border-[#10b981]/10">
        <CrossPattern opacity={0.025} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] rounded-full blur-[180px] bg-[#10b981]/5" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "15K+", label: "Happy Patients", icon: <SmileIcon /> },
              { value: "14+", label: "Years Experience", icon: <ClockIcon /> },
              { value: "99%", label: "Would Recommend", icon: <ShieldIcon /> },
              { value: "4.9", label: "Google Rating", icon: <StarIcon /> },
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
                  <span className="text-[#10b981]">{stat.icon}</span>
                  <span className="text-3xl md:text-4xl font-extrabold text-white">{stat.value}</span>
                </div>
                <span className="text-muted text-sm font-medium tracking-wide uppercase">{stat.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ New Patient Special ════════════════ */}
      <section
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0a0a0c 0%, #0a1210 50%, #0a0a0c 100%)" }}
      >
        <ToothPattern opacity={0.02} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full blur-[200px] bg-[#10b981]/6" />
        </div>
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-8 md:p-14 rounded-2xl border border-[#10b981]/20 text-center relative overflow-hidden bg-gradient-to-b from-[#10b981]/[0.06] to-transparent"
          >
            {/* Inner glow */}
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,#10b98118,transparent_60%)]" />
            {/* Corner decorations */}
            <div className="absolute top-0 left-0 w-20 h-20 border-t border-l border-[#10b981]/30 rounded-tl-2xl" />
            <div className="absolute bottom-0 right-0 w-20 h-20 border-b border-r border-[#10b981]/30 rounded-br-2xl" />
            {/* Decorative tooth outlines */}
            <svg className="absolute top-6 right-8 w-16 h-16 text-[#10b981]/[0.06]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8">
              <path d="M12 2C9.5 2 7 3.5 6 6c-1.5 3.5-.5 6 0 8 .5 2 1 4.5 2 6 .5.8 1.2 1 1.8.5.5-.5.8-1.5 1.2-3 .3-1 .7-1.5 1-1.5s.7.5 1 1.5c.4 1.5.7 2.5 1.2 3 .6.5 1.3.3 1.8-.5 1-1.5 1.5-4 2-6s1.5-4.5 0-8c-1-2.5-3.5-4-6-4z" />
            </svg>
            <svg className="absolute bottom-8 left-10 w-12 h-12 text-[#10b981]/[0.05] rotate-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8">
              <path d="M12 2C9.5 2 7 3.5 6 6c-1.5 3.5-.5 6 0 8 .5 2 1 4.5 2 6 .5.8 1.2 1 1.8.5.5-.5.8-1.5 1.2-3 .3-1 .7-1.5 1-1.5s.7.5 1 1.5c.4 1.5.7 2.5 1.2 3 .6.5 1.3.3 1.8-.5 1-1.5 1.5-4 2-6s1.5-4.5 0-8c-1-2.5-3.5-4-6-4z" />
            </svg>
            <div className="relative z-10">
              <span className="inline-flex items-center gap-2 bg-[#10b981]/10 text-[#10b981] text-xs font-bold uppercase tracking-[0.2em] px-4 py-2 rounded-full mb-6 border border-[#10b981]/20">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                  <path d="M12 8v4l2 2m4-2a6 6 0 11-12 0 6 6 0 0112 0z" />
                </svg>
                LIMITED TIME OFFER
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold mb-3">
                New Patient <span className="text-[#10b981]">Special</span>
              </h2>
              <p className="text-6xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-[#10b981] to-[#34d399] mb-3 leading-none py-1">
                $99
              </p>
              <p className="text-muted leading-relaxed mb-2 max-w-lg mx-auto text-lg">
                Comprehensive exam, full set of X-rays, and professional cleaning &mdash; a $350 value.
              </p>
              <p className="text-muted/50 text-sm mb-8">No insurance required. Valid for new patients only.</p>
              <a
                href="#contact"
                className="group inline-flex h-14 px-10 rounded-full bg-gradient-to-r from-[#10b981] to-[#059669] text-white font-bold items-center text-lg hover:from-[#34d399] hover:to-[#10b981] transition-all duration-300 shadow-lg shadow-[#10b981]/25 gap-2"
              >
                <span>Claim Your $99 Visit</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:translate-x-1 transition-transform">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ════════════════ Services ════════════════ */}
      <section
        id="services"
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0a0a0c 0%, #0a1210 50%, #0a0a0c 100%)" }}
      >
        <ToothPattern />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[10%] right-[5%] w-[500px] h-[500px] rounded-full blur-[160px] bg-[#10b981]/6" />
          <div className="absolute bottom-[10%] left-[5%] w-[400px] h-[400px] rounded-full blur-[140px] bg-[#10b981]/4" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="OUR SERVICES"
            title="Complete Dental Care"
            highlightWord="Dental Care"
            subtitle="From routine checkups to transformative cosmetic work, everything your family needs under one roof."
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, i) => (
              <motion.div
                key={service.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group relative p-7 rounded-2xl border border-white/[0.10] hover:border-[#10b981]/30 transition-all duration-500 overflow-hidden bg-white/[0.07]"
              >
                {/* Hover glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,#10b98115,transparent_70%)]" />
                {/* Top accent line */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#10b981]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  {/* Number + Icon row */}
                  <div className="flex items-start justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl bg-[#10b981]/10 border border-[#10b981]/20 flex items-center justify-center text-[#10b981] group-hover:bg-[#10b981]/20 group-hover:border-[#10b981]/40 transition-all duration-300">
                      {service.icon}
                    </div>
                    <span className="text-4xl font-extrabold text-white/[0.04] group-hover:text-[#10b981]/10 transition-colors duration-300 leading-none">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold mb-3 group-hover:text-[#10b981] transition-colors duration-300">{service.name}</h3>
                  <p className="text-muted text-sm leading-relaxed mb-5">{service.desc}</p>
                  {/* Feature tags */}
                  <div className="flex flex-wrap gap-2">
                    {service.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-semibold uppercase tracking-wider text-[#10b981]/70 bg-[#10b981]/8 border border-[#10b981]/10 px-2.5 py-1 rounded-full"
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

      {/* ════════════════ Patient Comfort ════════════════ */}
      <section
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0a1210 0%, #0d1a16 50%, #0a1210 100%)" }}
      >
        <CrossPattern />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] right-[10%] w-[500px] h-[500px] rounded-full blur-[180px] bg-[#10b981]/5" />
          <div className="absolute bottom-[15%] left-[5%] w-[400px] h-[400px] rounded-full blur-[140px] bg-[#10b981]/4" />
          <svg className="absolute inset-0 w-full h-full opacity-[0.025]" viewBox="0 0 1000 400">
            <path d="M0 200 Q250 100 500 200 Q750 300 1000 200" stroke="#10b981" strokeWidth="1" fill="none" />
            <path d="M0 250 Q250 150 500 250 Q750 350 1000 250" stroke="#10b981" strokeWidth="0.5" fill="none" />
          </svg>
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="YOUR COMFORT MATTERS"
            title="A Stress-Free Experience"
            highlightWord="Stress-Free"
            subtitle="We understand dental anxiety is real. Every detail of our practice is designed around your comfort and peace of mind."
          />
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <SedationIcon />,
                title: "Sedation Dentistry",
                desc: "Oral and nitrous oxide sedation options for completely anxiety-free treatment. Relax while we take care of everything.",
                highlight: "Anxiety-Free",
              },
              {
                icon: <EquipmentIcon />,
                title: "Modern Equipment",
                desc: "Digital X-rays with 80% less radiation, intraoral cameras, and laser dentistry for precise, comfortable care.",
                highlight: "80% Less Radiation",
              },
              {
                icon: <HeartHandIcon />,
                title: "Gentle Care Promise",
                desc: "Our team is trained in gentle techniques. We go at your pace and always explain what to expect before we begin.",
                highlight: "Your Pace",
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="group relative text-center p-8 rounded-2xl border border-white/[0.10] hover:border-[#10b981]/30 transition-all duration-500 overflow-hidden bg-white/[0.07]"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,#10b98115,transparent_70%)]" />
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#10b981]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-[#10b981]/10 border border-[#10b981]/20 flex items-center justify-center text-[#10b981] mb-6 group-hover:bg-[#10b981]/20 group-hover:scale-110 transition-all duration-300">
                    {item.icon}
                  </div>
                  <span className="inline-block text-[10px] font-bold uppercase tracking-[0.2em] text-[#10b981]/70 bg-[#10b981]/8 border border-[#10b981]/10 px-2.5 py-1 rounded-full mb-4">
                    {item.highlight}
                  </span>
                  <h3 className="text-xl font-bold mb-3 group-hover:text-[#10b981] transition-colors duration-300">{item.title}</h3>
                  <p className="text-muted text-sm leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-12">
            <a
              href="#contact"
              className="group inline-flex h-14 px-10 rounded-full bg-gradient-to-r from-[#10b981] to-[#059669] text-white font-bold items-center text-lg hover:from-[#34d399] hover:to-[#10b981] transition-all duration-300 shadow-lg shadow-[#10b981]/25 gap-2"
            >
              <span>Book Your Appointment</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:translate-x-1 transition-transform">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* ════════════════ About / Why Us ════════════════ */}
      <section
        id="about"
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0a0a0c 0%, #0a1210 50%, #0a0a0c 100%)" }}
      >
        <ToothPattern opacity={0.02} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] left-[5%] w-[500px] h-[500px] rounded-full blur-[160px] bg-[#10b981]/5" />
          <div className="absolute bottom-[10%] right-[10%] w-[350px] h-[350px] rounded-full blur-[140px] bg-[#10b981]/4" />
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
                <div className="absolute top-0 left-0 w-[75%] h-[70%] rounded-2xl overflow-hidden border-2 border-white/[0.10] shadow-2xl z-10">
                  <img
                    src="https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=600&q=80"
                    alt="Modern dental office"
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Secondary image */}
                <div className="absolute bottom-0 right-0 w-[65%] h-[55%] rounded-2xl overflow-hidden border-2 border-white/[0.10] shadow-2xl z-20">
                  <img
                    src="https://images.unsplash.com/photo-1606811971618-4486d14f3f99?w=400&q=80"
                    alt="Patient smiling"
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Accent badge */}
                <div className="absolute top-[55%] left-[60%] z-30 bg-[#10b981] rounded-2xl px-5 py-4 shadow-xl shadow-[#10b981]/20 border border-[#34d399]/30">
                  <span className="block text-3xl font-extrabold text-white leading-none">15K+</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-white/80">Happy<br />Smiles</span>
                </div>
                {/* Decorative corner lines */}
                <div className="absolute -top-3 -left-3 w-16 h-16 border-t-2 border-l-2 border-[#10b981]/20 rounded-tl-xl" />
                <div className="absolute -bottom-3 -right-3 w-16 h-16 border-b-2 border-r-2 border-[#10b981]/20 rounded-br-xl" />
              </div>
            </motion.div>

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <SectionHeader
                tag="ABOUT OUR PRACTICE"
                title="A Dental Experience You&apos;ll Actually Enjoy"
                highlightWord="Enjoy"
                center={false}
              />
              <p className="text-muted leading-relaxed mb-6 text-lg -mt-8">
                At Bright Smile Dental, we believe visiting the dentist should be comfortable, not stressful. Our modern office features the latest technology, a warm and friendly team, and a commitment to gentle care.
              </p>
              <p className="text-muted leading-relaxed mb-8">
                From routine cleanings to complex restorations, every treatment is personalized to your unique needs and goals. Your comfort is our top priority &mdash; always.
              </p>
              {/* Feature list */}
              <div className="space-y-4">
                {[
                  { icon: <CheckCircleIcon />, title: "Family-Friendly", desc: "Welcoming environment for patients of all ages, from toddlers to seniors" },
                  { icon: <ClockIcon />, title: "Flexible Hours", desc: "Evening and weekend appointments available to fit your busy schedule" },
                  { icon: <PhoneIcon />, title: "Same-Day Emergency", desc: "Dental emergencies happen. We are here when you need us most" },
                ].map((feature) => (
                  <div key={feature.title} className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.07] border border-white/[0.04] hover:border-[#10b981]/20 transition-colors duration-300">
                    <div className="w-10 h-10 rounded-lg bg-[#10b981]/10 border border-[#10b981]/20 flex items-center justify-center text-[#10b981] shrink-0">
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

      {/* ════════════════ Meet the Team ════════════════ */}
      <section
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0a1210 0%, #0d1a16 50%, #0a1210 100%)" }}
      >
        <CrossPattern opacity={0.025} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] right-[10%] w-[500px] h-[500px] rounded-full blur-[180px] bg-[#10b981]/5" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="MEET THE TEAM"
            title="Your Dental Experts"
            highlightWord="Experts"
            subtitle="A caring team of dental professionals dedicated to your health, comfort, and beautiful smile."
          />
          <div className="grid md:grid-cols-3 gap-8">
            {teamMembers.map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="group relative rounded-2xl border border-white/[0.10] hover:border-[#10b981]/30 transition-all duration-500 overflow-hidden bg-white/[0.07]"
              >
                {/* Photo */}
                <div className="relative aspect-[3/4] overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a100e] via-[#0a100e]/30 to-transparent" />
                  {/* Years badge */}
                  <div className="absolute top-4 right-4 bg-[#10b981]/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full border border-[#34d399]/30">
                    {member.yearsExp}+ YRS
                  </div>
                  {/* Info overlay at bottom */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                    <p className="text-[#10b981] text-sm font-semibold mb-3">{member.title}</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-white/60 bg-white/10 border border-white/15 px-2.5 py-1 rounded-full">
                        {member.specialty}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ Insurance Section ════════════════ */}
      <section className="py-20 relative overflow-hidden bg-gradient-to-b from-[#10b981]/10 to-[#0a0a0c]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#10b981]/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#10b981]/10 to-transparent" />
          <svg className="absolute inset-0 w-full h-full opacity-[0.03]" viewBox="0 0 1000 400">
            <circle cx="500" cy="200" r="80" stroke="#10b981" strokeWidth="0.3" fill="none" />
            <circle cx="500" cy="200" r="150" stroke="#10b981" strokeWidth="0.2" fill="none" />
          </svg>
        </div>
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <span className="inline-block text-[#10b981] text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border border-[#10b981]/20 bg-[#10b981]/5">
              INSURANCE ACCEPTED
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              We Work With <span className="text-[#10b981]">Your Insurance</span>
            </h2>
            <p className="text-muted mt-3 max-w-lg mx-auto">Most major dental plans accepted. No insurance? Ask about our affordable payment plans and in-house membership.</p>
          </motion.div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {insurances.map((ins, i) => (
              <motion.div
                key={ins.name}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="group flex items-center gap-3 p-4 rounded-xl border border-white/[0.10] hover:border-[#10b981]/30 bg-white/[0.07] transition-all duration-500"
              >
                <div className="w-10 h-10 shrink-0 rounded-lg bg-[#10b981]/10 border border-[#10b981]/20 flex items-center justify-center text-[#10b981] text-xs font-extrabold group-hover:bg-[#10b981]/20 transition-all duration-300">
                  {ins.abbr}
                </div>
                <span className="text-sm font-medium text-muted group-hover:text-white transition-colors duration-300">{ins.name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ Patient Stories ════════════════ */}
      <section
        id="testimonials"
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0a0a0c 0%, #0a1210 50%, #0a0a0c 100%)" }}
      >
        <ToothPattern />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[30%] left-[40%] w-[600px] h-[400px] rounded-full blur-[180px] bg-[#10b981]/5" />
          <svg className="absolute inset-0 w-full h-full opacity-[0.025]" viewBox="0 0 800 400">
            <circle cx="400" cy="200" r="100" stroke="#10b981" strokeWidth="0.5" fill="none" />
            <circle cx="400" cy="200" r="180" stroke="#10b981" strokeWidth="0.3" fill="none" />
            <circle cx="400" cy="200" r="260" stroke="#10b981" strokeWidth="0.2" fill="none" />
          </svg>
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="PATIENT STORIES"
            title="Smiles Speak Louder"
            highlightWord="Louder"
            subtitle="Real stories from real patients who trust us with their family&apos;s dental health."
          />
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative p-7 rounded-2xl border border-white/[0.10] hover:border-[#10b981]/30 transition-all duration-500 overflow-hidden bg-white/[0.07]"
              >
                {/* Top accent line */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-[#10b981]/40 via-[#10b981]/10 to-transparent" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_0%_0%,#10b98110,transparent_70%)]" />
                <div className="relative z-10">
                  {/* Visit type tag */}
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#10b981]/70 bg-[#10b981]/8 border border-[#10b981]/10 px-2.5 py-1 rounded-full">
                    {t.visitType}
                  </span>
                  {/* Stars */}
                  <div className="flex items-center gap-0.5 text-[#10b981] mt-4 mb-4">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <StarIcon key={j} />
                    ))}
                  </div>
                  {/* Quote */}
                  <p className="text-muted leading-relaxed mb-6 text-sm">&ldquo;{t.text}&rdquo;</p>
                  {/* Author */}
                  <div className="flex items-center gap-3 pt-4 border-t border-white/[0.10]">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#10b981]/30 to-[#10b981]/10 flex items-center justify-center text-sm font-bold text-[#10b981]">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-sm">{t.name}</p>
                      <p className="text-muted text-xs">Verified Patient</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ Final CTA ════════════════ */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#10b981]/10 via-[#10b981]/5 to-[#0a0a0c]" />
        <CrossPattern opacity={0.03} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#10b981]/30 to-transparent" />
          <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full blur-[180px] bg-[#10b981]/8" />
          {/* Decorative tooth outlines */}
          <svg className="absolute top-[15%] left-[8%] w-20 h-20 text-[#10b981]/[0.04]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.6">
            <path d="M12 2C9.5 2 7 3.5 6 6c-1.5 3.5-.5 6 0 8 .5 2 1 4.5 2 6 .5.8 1.2 1 1.8.5.5-.5.8-1.5 1.2-3 .3-1 .7-1.5 1-1.5s.7.5 1 1.5c.4 1.5.7 2.5 1.2 3 .6.5 1.3.3 1.8-.5 1-1.5 1.5-4 2-6s1.5-4.5 0-8c-1-2.5-3.5-4-6-4z" />
          </svg>
          <svg className="absolute bottom-[20%] right-[12%] w-16 h-16 text-[#10b981]/[0.04] rotate-[-15deg]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.6">
            <path d="M12 2C9.5 2 7 3.5 6 6c-1.5 3.5-.5 6 0 8 .5 2 1 4.5 2 6 .5.8 1.2 1 1.8.5.5-.5.8-1.5 1.2-3 .3-1 .7-1.5 1-1.5s.7.5 1 1.5c.4 1.5.7 2.5 1.2 3 .6.5 1.3.3 1.8-.5 1-1.5 1.5-4 2-6s1.5-4.5 0-8c-1-2.5-3.5-4-6-4z" />
          </svg>
        </div>
        <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block text-[#10b981] text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border border-[#10b981]/20 bg-[#10b981]/5">
              SCHEDULE TODAY
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold mb-4 tracking-tight">
              Ready for a <span className="text-[#10b981]">Healthier Smile?</span>
            </h2>
            <p className="text-muted text-lg mb-10 max-w-xl mx-auto leading-relaxed">
              New patients are always welcome. We offer flexible scheduling including evenings and weekends. Your perfect smile is one appointment away.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#contact"
                className="group inline-flex h-14 px-10 rounded-full bg-gradient-to-r from-[#10b981] to-[#059669] text-white font-bold items-center justify-center text-lg hover:from-[#34d399] hover:to-[#10b981] transition-all duration-300 shadow-lg shadow-[#10b981]/25 gap-2"
              >
                <span>Book Your Appointment</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:translate-x-1 transition-transform">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
              <a
                href="tel:5552345678"
                className="inline-flex h-14 px-10 rounded-full border-2 border-[#10b981]/30 text-[#10b981] font-bold items-center justify-center text-lg hover:bg-[#10b981]/10 hover:border-[#10b981]/50 transition-all duration-300 gap-2"
              >
                <PhoneIcon />
                <span>Call (555) 234-5678</span>
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </TemplateLayout>
  );
}
