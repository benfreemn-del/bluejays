"use client";

import { motion } from "framer-motion";
import TemplateLayout from "./TemplateLayout";

/* ───────────────────────── SVG Icons ───────────────────────── */

const CarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M5 17h14M5 17a2 2 0 01-2-2v-3a1 1 0 011-1h1l2.5-5A2 2 0 019.3 5h5.4a2 2 0 011.8 1l2.5 5h1a1 1 0 011 1v3a2 2 0 01-2 2M5 17a2 2 0 002 2h1a2 2 0 002-2M14 17a2 2 0 002 2h1a2 2 0 002-2" />
  </svg>
);

const WrenchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
  </svg>
);

const EngineIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M7 10h10v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6z" />
    <path d="M10 10V7h4v3" />
    <path d="M5 13H3m18 0h-2" />
    <path d="M12 18v2m-3-2v1m6-1v1" />
    <path d="M8 7V5m8 2V5" />
    <rect x="9" y="12" width="6" height="2" rx="0.5" />
  </svg>
);

const BrakeDiscIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="5" />
    <circle cx="12" cy="12" r="1.5" />
    <path d="M12 3v2m0 14v2M3 12h2m14 0h2" />
  </svg>
);

const OilCanIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M5 18h10a2 2 0 002-2v-5l3-3-2-2-3 3H5a2 2 0 00-2 2v5a2 2 0 002 2z" />
    <path d="M7 11v-1a2 2 0 012-2h2a2 2 0 012 2v1" />
    <circle cx="19" cy="8" r="0.5" fill="currentColor" />
    <path d="M19.5 8.5l1 3" />
  </svg>
);

const TireIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="12" cy="12" r="1" fill="currentColor" />
    <path d="M12 3v5m0 8v5M3 12h5m8 0h5M5.63 5.63l3.54 3.54m5.66 5.66l3.54 3.54M5.63 18.37l3.54-3.54m5.66-5.66l3.54-3.54" />
  </svg>
);

const ACIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M12 3v18M5.5 7.5L12 12l6.5-4.5M5.5 16.5L12 12l6.5 4.5" />
    <path d="M9 2l3 2 3-2M9 22l3-2 3 2" />
  </svg>
);

const TransmissionIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <circle cx="6" cy="6" r="2" />
    <circle cx="18" cy="6" r="2" />
    <circle cx="6" cy="18" r="2" />
    <circle cx="18" cy="18" r="2" />
    <path d="M6 8v10m12-10v10M8 6h8M8 18h8" />
    <path d="M12 6v12" />
  </svg>
);

const InspectionIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
    <rect x="9" y="3" width="6" height="4" rx="1" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);

const CheckIcon = () => (
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

const TagIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
    <path d="M7 7h.01M2 12.5l9.1 9.1a2 2 0 002.8 0L22 13.4a2 2 0 000-2.8L13.4 2H5a3 3 0 00-3 3v7.5z" />
  </svg>
);

const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
    <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const WarningIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
    <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
  </svg>
);

const XIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

const CheckSmallIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
    <path d="M5 13l4 4L19 7" />
  </svg>
);

/* ───────────────────────── Background Patterns ───────────────────────── */

const GearPattern = ({ opacity = 0.03 }: { opacity?: number }) => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }}>
    <defs>
      <pattern id="autoGears" width="120" height="120" patternUnits="userSpaceOnUse">
        {/* Gear outline */}
        <circle cx="60" cy="60" r="20" stroke="#ef4444" strokeWidth="0.5" fill="none" />
        <circle cx="60" cy="60" r="8" stroke="#ef4444" strokeWidth="0.5" fill="none" />
        <path d="M60 38v4M60 78v4M38 60h4M78 60h4M45.9 45.9l2.8 2.8M71.3 71.3l2.8 2.8M45.9 74.1l2.8-2.8M71.3 48.7l2.8-2.8" stroke="#ef4444" strokeWidth="0.8" />
        {/* Wrench outline */}
        <path d="M15 105l10-10a5 5 0 017 7l-10 10" stroke="#ef4444" strokeWidth="0.4" fill="none" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#autoGears)" />
  </svg>
);

const SpeedometerPattern = ({ opacity = 0.025 }: { opacity?: number }) => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }} viewBox="0 0 1000 500">
    {/* Speedometer arcs */}
    <path d="M200 400 A200 200 0 0 1 600 400" stroke="#ef4444" strokeWidth="1" fill="none" />
    <path d="M250 400 A150 150 0 0 1 550 400" stroke="#ef4444" strokeWidth="0.5" fill="none" />
    {/* Tick marks */}
    {Array.from({ length: 11 }).map((_, i) => {
      const angle = Math.PI + (Math.PI * i) / 10;
      const x1 = 400 + 190 * Math.cos(angle);
      const y1 = 400 + 190 * Math.sin(angle);
      const x2 = 400 + 170 * Math.cos(angle);
      const y2 = 400 + 170 * Math.sin(angle);
      return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#ef4444" strokeWidth="0.8" />;
    })}
    {/* Gear at right */}
    <circle cx="800" cy="250" r="60" stroke="#ef4444" strokeWidth="0.5" fill="none" />
    <circle cx="800" cy="250" r="25" stroke="#ef4444" strokeWidth="0.5" fill="none" />
    {Array.from({ length: 8 }).map((_, i) => {
      const angle = (Math.PI * 2 * i) / 8;
      const x1 = 800 + 55 * Math.cos(angle);
      const y1 = 250 + 55 * Math.sin(angle);
      const x2 = 800 + 68 * Math.cos(angle);
      const y2 = 250 + 68 * Math.sin(angle);
      return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#ef4444" strokeWidth="1.5" />;
    })}
  </svg>
);

/* ───────────────────────── Data ───────────────────────── */

const services = [
  {
    name: "Engine Diagnostics",
    desc: "State-of-the-art OBD-II and manufacturer-level scanning. We pinpoint the exact issue before turning a single wrench, saving you time and money.",
    icon: <EngineIcon />,
    tags: ["Check Engine Light", "Electrical", "Computer Diagnostics"],
  },
  {
    name: "Brake Service",
    desc: "Pads, rotors, calipers, brake fluid flush. Your family's safety depends on stopping power, and we do not cut corners. Period.",
    icon: <BrakeDiscIcon />,
    tags: ["Pad Replacement", "Rotor Resurfacing", "ABS Repair"],
  },
  {
    name: "Oil Change",
    desc: "Conventional, synthetic blend, or full synthetic. Includes filter replacement, fluid top-off, and a free multi-point inspection every time.",
    icon: <OilCanIcon />,
    tags: ["Synthetic", "Conventional", "Diesel"],
  },
  {
    name: "AC / Heating",
    desc: "From refrigerant recharge to compressor replacement, we keep you comfortable year-round in Seattle's unpredictable weather.",
    icon: <ACIcon />,
    tags: ["AC Recharge", "Heater Core", "Climate Control"],
  },
  {
    name: "Transmission",
    desc: "Fluid exchange, solenoid repair, and full rebuilds. We handle both automatic and manual transmissions with surgeon-level precision.",
    icon: <TransmissionIcon />,
    tags: ["Automatic", "Manual", "CVT"],
  },
  {
    name: "Pre-Purchase Inspection",
    desc: "Buying a used car? We perform a brutal 150-point inspection so you know exactly what you're getting before you spend a dime.",
    icon: <InspectionIcon />,
    tags: ["150-Point Check", "Test Drive", "Written Report"],
  },
];

const trustBadges = [
  { icon: <ShieldIcon />, label: "ASE Certified" },
  { icon: <CarIcon />, label: "All Makes & Models" },
  { icon: <TagIcon />, label: "Fair Pricing" },
  { icon: <ShieldIcon />, label: "12-Month Warranty" },
];

const testimonials = [
  {
    name: "Marcus T.",
    text: "Took my truck here after the dealership quoted me $2,800. Pacific Auto Works fixed it for $900. Same problem, honest diagnosis. Never going back to the dealer.",
    service: "Engine Repair",
    rating: 5,
  },
  {
    name: "Sarah K.",
    text: "They found an issue during my oil change that could have left me stranded on I-5. Explained everything clearly, no pressure, fair price. These guys are the real deal.",
    service: "Oil Change",
    rating: 5,
  },
  {
    name: "David L.",
    text: "Pre-purchase inspection saved me from buying a lemon. Found frame damage the seller conveniently forgot to mention. Worth every penny ten times over.",
    service: "Pre-Purchase Inspection",
    rating: 5,
  },
];

const faqs = [
  {
    q: "Do you work on all makes and models?",
    a: "Yes. Domestic, Japanese, European, Korean -- we work on everything. Our ASE-certified techs have manufacturer-level scan tools for accurate diagnostics on any vehicle.",
  },
  {
    q: "How long does a typical repair take?",
    a: "Most standard services like oil changes and brake jobs are same-day. Engine and transmission work typically takes 1-3 days depending on parts availability. We always give you a timeline upfront.",
  },
  {
    q: "Do you offer any warranty on repairs?",
    a: "Every repair comes with our 12-month / 12,000-mile warranty on parts and labor. If something we fixed has an issue, bring it back and we make it right at no cost.",
  },
  {
    q: "Can I wait while my car is being serviced?",
    a: "Absolutely. We have a comfortable waiting area with Wi-Fi and coffee. For longer repairs, we can arrange a shuttle within the Seattle metro area.",
  },
  {
    q: "How is your pricing compared to dealerships?",
    a: "On average our customers save 30-50% compared to dealership pricing for the exact same repair, using OEM or equivalent quality parts. We provide a written estimate before any work begins.",
  },
];

const dealershipComparison = [
  { feature: "Diagnostic Fee", us: "FREE", dealer: "$150+" },
  { feature: "Hourly Labor Rate", us: "$95/hr", dealer: "$175+/hr" },
  { feature: "Parts Markup", us: "Fair Market", dealer: "2-3x Markup" },
  { feature: "Wait Time", us: "Same Day", dealer: "Days to Weeks" },
  { feature: "Transparency", us: "Full Explanation", dealer: "Service Writer Filter" },
  { feature: "Warranty", us: "12 Mo / 12K Mi", dealer: "Varies" },
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
        className="inline-block text-[#ef4444] text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border border-[#ef4444]/20 bg-[#ef4444]/5"
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
        <span className="text-[#ef4444]">{highlightWord}</span>
        {parts[1] || ""}
      </motion.h2>
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className={`h-0.5 w-16 bg-gradient-to-r from-[#ef4444] to-transparent mt-4 ${center ? "mx-auto" : ""}`}
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

export default function AutoRepairTemplate() {
  return (
    <TemplateLayout
      businessName="Pacific Auto Works"
      tagline="Honest repairs. Expert mechanics. No dealership markup. Seattle's most trusted independent shop for 18 years."
      accentColor="#ef4444"
      accentColorLight="#f87171"
      heroGradient="linear-gradient(135deg, #1a0a0a 0%, #0f0a0a 100%)"
      heroImage="https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=1400&q=80"
      phone="(206) 555-0106"
      address="Seattle, WA"
    >
      {/* ════════════════ Check Engine Banner ════════════════ */}
      <section className="py-3 bg-gradient-to-r from-[#ef4444] via-[#dc2626] to-[#ef4444] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9Im5vbmUiLz48cGF0aCBkPSJNMCAwTDQwIDQwTTQwIDBMMCA0MCIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjAuMyIgb3BhY2l0eT0iMC4xIi8+PC9zdmc+')] opacity-30" />
        <div className="max-w-6xl mx-auto px-6 flex flex-wrap items-center justify-center gap-6 relative z-10">
          <div className="flex items-center gap-3">
            <WarningIcon />
            <p className="text-sm font-bold tracking-wide">CHECK ENGINE LIGHT ON? FREE DIAGNOSTICS &mdash; NO OBLIGATION</p>
          </div>
          <a
            href="tel:2065550106"
            className="flex items-center gap-2 bg-white/15 backdrop-blur-sm px-5 py-2 rounded-full border border-white/20 hover:bg-white/25 transition-colors"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
            </span>
            <span className="text-xs font-bold tracking-wider">CALL NOW: (206) 555-0106</span>
          </a>
        </div>
      </section>

      {/* ════════════════ Trust Badges ════════════════ */}
      <section className="py-6 relative overflow-hidden bg-[#0c0a0a] border-b border-[#ef4444]/10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14">
            {trustBadges.map((badge, i) => (
              <motion.div
                key={badge.label}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="flex items-center gap-2.5 text-white/60"
              >
                <span className="text-[#ef4444]">{badge.icon}</span>
                <span className="text-xs font-bold uppercase tracking-wider">{badge.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ Stats Banner ════════════════ */}
      <section className="py-12 relative overflow-hidden bg-[#0c0a0a] border-b border-[#ef4444]/10">
        <GearPattern opacity={0.02} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] rounded-full blur-[180px] bg-[#ef4444]/5" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "10,000+", label: "Cars Fixed", icon: <CarIcon /> },
              { value: "18+", label: "Years Experience", icon: <ClockIcon /> },
              { value: "ASE", label: "Certified Techs", icon: <ShieldIcon /> },
              { value: "4.8", label: "Star Rating", icon: <StarIcon /> },
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
                  <span className="text-[#ef4444]">{stat.icon}</span>
                  <span className="text-3xl md:text-4xl font-extrabold text-white">{stat.value}</span>
                </div>
                <span className="text-muted text-sm font-medium tracking-wide uppercase">{stat.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ Services (Numbered 01-06) ════════════════ */}
      <section
        id="services"
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0a0808 0%, #100a0a 50%, #0a0808 100%)" }}
      >
        <GearPattern />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[10%] right-[5%] w-[500px] h-[500px] rounded-full blur-[160px] bg-[#ef4444]/6" />
          <div className="absolute bottom-[10%] left-[5%] w-[400px] h-[400px] rounded-full blur-[140px] bg-[#ef4444]/4" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="WHAT WE DO"
            title="Our Expert Services"
            highlightWord="Expert Services"
            subtitle="Full-service auto repair backed by ASE-certified technicians and thousands of five-star reviews."
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, i) => (
              <motion.div
                key={service.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group relative p-7 rounded-2xl border border-white/[0.10] hover:border-[#ef4444]/30 transition-all duration-500 overflow-hidden bg-white/[0.07]"
              >
                {/* Hover glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,#ef444415,transparent_70%)]" />
                {/* Top accent line */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#ef4444]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  {/* Number + Icon row */}
                  <div className="flex items-start justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl bg-[#ef4444]/10 border border-[#ef4444]/20 flex items-center justify-center text-[#ef4444] group-hover:bg-[#ef4444]/20 group-hover:border-[#ef4444]/40 transition-all duration-300">
                      {service.icon}
                    </div>
                    <span className="text-4xl font-extrabold text-white/[0.04] group-hover:text-[#ef4444]/10 transition-colors duration-300 leading-none">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold mb-3 group-hover:text-[#ef4444] transition-colors duration-300">{service.name}</h3>
                  <p className="text-muted text-sm leading-relaxed mb-5">{service.desc}</p>
                  {/* Feature tags */}
                  <div className="flex flex-wrap gap-2">
                    {service.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-semibold uppercase tracking-wider text-[#ef4444]/70 bg-[#ef4444]/8 border border-[#ef4444]/10 px-2.5 py-1 rounded-full"
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

      {/* ════════════════ Current Specials / Coupons ════════════════ */}
      <section
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #100a0a 0%, #140c0c 50%, #100a0a 100%)" }}
      >
        <SpeedometerPattern />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[30%] left-[50%] -translate-x-1/2 w-[700px] h-[400px] rounded-full blur-[180px] bg-[#ef4444]/6" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="LIMITED TIME OFFERS"
            title="Current Specials"
            highlightWord="Specials"
            subtitle="Real savings, no gimmicks. Print or show these offers on your phone when you visit."
          />
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: "Full Synthetic Oil Change",
                price: "$39.99",
                originalPrice: "$79.99",
                details: "Up to 5 quarts synthetic oil, new filter, multi-point inspection included.",
                badge: "MOST POPULAR",
              },
              {
                title: "Free Brake Inspection",
                price: "FREE",
                originalPrice: "$49.99",
                details: "Complete brake system check: pads, rotors, calipers, fluid level, and ABS diagnostics.",
                badge: "NO OBLIGATION",
              },
              {
                title: "AC Performance Check",
                price: "$29.99",
                originalPrice: "$89.99",
                details: "Refrigerant pressure test, leak detection, vent temperature check, and system evaluation.",
                badge: "SEASONAL",
              },
            ].map((special, i) => (
              <motion.div
                key={special.title}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative rounded-2xl border-2 border-dashed border-[#ef4444]/30 hover:border-[#ef4444]/60 transition-all duration-500 overflow-hidden bg-white/[0.07]"
              >
                {/* Coupon perforated edge effect */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#ef4444]/40 via-[#ef4444] to-[#ef4444]/40" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,#ef444412,transparent_70%)]" />
                <div className="relative z-10 p-7">
                  {/* Badge */}
                  <span className="inline-block text-[10px] font-bold uppercase tracking-[0.2em] text-white bg-[#ef4444] px-3 py-1 rounded-full mb-4">
                    {special.badge}
                  </span>
                  <h3 className="text-lg font-bold mb-3">{special.title}</h3>
                  <div className="flex items-baseline gap-3 mb-4">
                    <span className="text-4xl font-extrabold text-[#ef4444]">{special.price}</span>
                    <span className="text-muted line-through text-sm">{special.originalPrice}</span>
                  </div>
                  <p className="text-muted text-sm leading-relaxed mb-5">{special.details}</p>
                  <a
                    href="tel:2065550106"
                    className="inline-flex items-center gap-2 text-[#ef4444] text-sm font-bold hover:gap-3 transition-all duration-300"
                  >
                    <span>Book This Service</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
          {/* Coupon strip */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-10 p-6 rounded-2xl border border-[#ef4444]/20 bg-[#ef4444]/5 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,#ef444410,transparent_70%)]" />
            <div className="relative z-10">
              <p className="text-sm font-bold text-[#ef4444] uppercase tracking-wider mb-1">New Customer Coupon</p>
              <p className="text-2xl md:text-3xl font-extrabold mb-2">15% OFF Your First Repair</p>
              <p className="text-muted text-sm">Mention code <span className="text-[#ef4444] font-bold">PACIFIC15</span> when you call. Cannot be combined with other offers.</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ════════════════ Why Independent Over Dealership ════════════════ */}
      <section
        id="about"
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0a0808 0%, #0d0a0a 50%, #0a0808 100%)" }}
      >
        <GearPattern />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] left-[5%] w-[500px] h-[500px] rounded-full blur-[160px] bg-[#ef4444]/5" />
          <div className="absolute bottom-[10%] right-[10%] w-[350px] h-[350px] rounded-full blur-[140px] bg-[#ef4444]/4" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="THE HONEST TRUTH"
            title="Why Choose Independent Over Dealership"
            highlightWord="Independent"
            subtitle="Dealerships profit from your confusion. We profit from your trust. Here's the difference in black and white."
          />
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Comparison Table */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="rounded-2xl border border-white/[0.10] overflow-hidden bg-white/[0.07]"
            >
              {/* Table Header */}
              <div className="grid grid-cols-3 bg-[#ef4444]/10 border-b border-[#ef4444]/20">
                <div className="p-4 text-sm font-bold text-muted uppercase tracking-wider">Feature</div>
                <div className="p-4 text-sm font-bold text-[#ef4444] uppercase tracking-wider text-center">Pacific Auto</div>
                <div className="p-4 text-sm font-bold text-muted/50 uppercase tracking-wider text-center">Dealership</div>
              </div>
              {/* Table Rows */}
              {dealershipComparison.map((row, i) => (
                <div
                  key={row.feature}
                  className={`grid grid-cols-3 ${i % 2 === 0 ? "bg-white/[0.01]" : ""} ${i < dealershipComparison.length - 1 ? "border-b border-white/[0.04]" : ""}`}
                >
                  <div className="p-4 text-sm font-medium">{row.feature}</div>
                  <div className="p-4 text-sm text-center flex items-center justify-center gap-1.5">
                    <span className="text-green-400"><CheckSmallIcon /></span>
                    <span className="text-green-400 font-semibold">{row.us}</span>
                  </div>
                  <div className="p-4 text-sm text-center flex items-center justify-center gap-1.5">
                    <span className="text-red-400/50"><XIcon /></span>
                    <span className="text-muted/50">{row.dealer}</span>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Content side */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="mb-8">
                <h3 className="text-2xl font-extrabold mb-4">
                  Same Quality. <span className="text-[#ef4444]">Half the Price.</span>
                </h3>
                <p className="text-muted leading-relaxed text-lg mb-4">
                  Dealerships charge premium labor rates because of overhead, not skill. Our ASE-certified technicians use the same diagnostic tools and OEM-quality parts.
                </p>
                <p className="text-muted leading-relaxed">
                  The difference? We talk to you directly. No service writers filtering information. No upselling you on flushes you do not need. Just honest assessment, fair pricing, and work done right the first time.
                </p>
              </div>
              {/* Feature list */}
              <div className="space-y-4">
                {[
                  { icon: <WrenchIcon />, title: "ASE Master Certified", desc: "Our lead techs hold the highest certification in the industry" },
                  { icon: <TagIcon />, title: "Upfront Written Estimates", desc: "You approve the price before we touch your car. No surprises." },
                  { icon: <ShieldIcon />, title: "12-Month Warranty", desc: "Every repair backed by 12 months or 12,000 miles, whichever comes first" },
                ].map((feature) => (
                  <div key={feature.title} className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.07] border border-white/[0.04] hover:border-[#ef4444]/20 transition-colors duration-300">
                    <div className="w-10 h-10 rounded-lg bg-[#ef4444]/10 border border-[#ef4444]/20 flex items-center justify-center text-[#ef4444] shrink-0">
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

      {/* ════════════════ Testimonials ════════════════ */}
      <section
        id="testimonials"
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0a0808 0%, #0d0a0a 50%, #0a0808 100%)" }}
      >
        <GearPattern />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[30%] left-[40%] w-[600px] h-[400px] rounded-full blur-[180px] bg-[#ef4444]/5" />
          <svg className="absolute inset-0 w-full h-full opacity-[0.025]" viewBox="0 0 800 400">
            <circle cx="400" cy="200" r="100" stroke="#ef4444" strokeWidth="0.5" fill="none" />
            <circle cx="400" cy="200" r="180" stroke="#ef4444" strokeWidth="0.3" fill="none" />
            <circle cx="400" cy="200" r="260" stroke="#ef4444" strokeWidth="0.2" fill="none" />
          </svg>
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="REAL REVIEWS"
            title="Trusted by Thousands"
            highlightWord="Thousands"
            subtitle="Do not take our word for it. Here is what Seattle drivers say about Pacific Auto Works."
          />
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative p-7 rounded-2xl border border-white/[0.10] hover:border-[#ef4444]/30 transition-all duration-500 overflow-hidden bg-white/[0.07]"
              >
                {/* Top accent line */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-[#ef4444]/40 via-[#ef4444]/10 to-transparent" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_0%_0%,#ef444410,transparent_70%)]" />
                <div className="relative z-10">
                  {/* Service tag */}
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#ef4444]/70 bg-[#ef4444]/8 border border-[#ef4444]/10 px-2.5 py-1 rounded-full">
                    {t.service}
                  </span>
                  {/* Stars */}
                  <div className="flex items-center gap-0.5 text-[#ef4444] mt-4 mb-4">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <StarIcon key={j} />
                    ))}
                  </div>
                  {/* Quote */}
                  <p className="text-muted leading-relaxed mb-6 text-sm">&ldquo;{t.text}&rdquo;</p>
                  {/* Author */}
                  <div className="flex items-center gap-3 pt-4 border-t border-white/[0.10]">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#ef4444]/30 to-[#ef4444]/10 flex items-center justify-center text-sm font-bold text-[#ef4444]">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-sm">{t.name}</p>
                      <p className="text-muted text-xs">Verified Customer</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ Free Diagnostic CTA ════════════════ */}
      <section
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #100a0a 0%, #150d0d 50%, #100a0a 100%)" }}
      >
        <GearPattern opacity={0.02} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-[200px] bg-[#ef4444]/6" />
        </div>
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-8 md:p-12 rounded-2xl border border-[#ef4444]/20 relative overflow-hidden bg-gradient-to-b from-[#ef4444]/[0.06] to-transparent"
          >
            {/* Inner glow */}
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,#ef444415,transparent_60%)]" />
            {/* Corner decorations */}
            <div className="absolute top-0 left-0 w-20 h-20 border-t border-l border-[#ef4444]/30 rounded-tl-2xl" />
            <div className="absolute bottom-0 right-0 w-20 h-20 border-b border-r border-[#ef4444]/30 rounded-br-2xl" />
            <div className="relative z-10">
              <div className="text-center mb-8">
                <span className="inline-flex items-center gap-2 bg-[#ef4444]/10 text-[#ef4444] text-xs font-bold uppercase tracking-[0.2em] px-4 py-2 rounded-full mb-4 border border-[#ef4444]/20">
                  <WarningIcon />
                  FREE DIAGNOSTICS
                </span>
                <h2 className="text-3xl md:text-4xl font-extrabold mb-3">
                  Schedule Your <span className="text-[#ef4444]">Free Check</span>
                </h2>
                <p className="text-muted max-w-lg mx-auto">
                  Check engine light on? Strange noise? Something just feels off? Drop your info below and we will get you scheduled for a free diagnostic scan.
                </p>
              </div>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Your Name"
                    className="w-full h-13 px-5 rounded-xl bg-white/5 border border-[#ef4444]/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#ef4444]/50 transition-colors"
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    className="w-full h-13 px-5 rounded-xl bg-white/5 border border-[#ef4444]/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#ef4444]/50 transition-colors"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Year / Make / Model"
                    className="w-full h-13 px-5 rounded-xl bg-white/5 border border-[#ef4444]/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#ef4444]/50 transition-colors"
                  />
                  <input
                    type="text"
                    placeholder="Mileage (approx)"
                    className="w-full h-13 px-5 rounded-xl bg-white/5 border border-[#ef4444]/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#ef4444]/50 transition-colors"
                  />
                </div>
                <textarea
                  placeholder="Describe the issue (check engine light, noise, vibration, etc.)..."
                  rows={4}
                  className="w-full px-5 py-4 rounded-xl bg-white/5 border border-[#ef4444]/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#ef4444]/50 resize-none transition-colors"
                />
                <button
                  type="button"
                  className="w-full h-14 rounded-xl bg-gradient-to-r from-[#ef4444] to-[#dc2626] text-white font-bold text-lg hover:from-[#f87171] hover:to-[#ef4444] transition-all duration-300 shadow-lg shadow-[#ef4444]/20"
                >
                  Book Free Diagnostic
                </button>
                <p className="text-center text-white/30 text-xs">
                  No obligation. No credit card. We just scan your car and tell you what is going on.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ════════════════ FAQ ════════════════ */}
      <section
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0a0808 0%, #0d0a0a 50%, #0a0808 100%)" }}
      >
        <GearPattern />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] left-[10%] w-[400px] h-[400px] rounded-full blur-[140px] bg-[#ef4444]/5" />
          <div className="absolute bottom-[15%] right-[10%] w-[350px] h-[350px] rounded-full blur-[120px] bg-[#ef4444]/4" />
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
                className="group p-6 rounded-2xl border border-white/[0.10] hover:border-[#ef4444]/20 transition-all duration-500 overflow-hidden relative bg-white/[0.07]"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_0%_50%,#ef444410,transparent_70%)]" />
                <div className="relative z-10 flex gap-4">
                  <div className="w-8 h-8 shrink-0 rounded-lg bg-[#ef4444]/10 border border-[#ef4444]/20 flex items-center justify-center text-[#ef4444] text-xs font-bold mt-0.5">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div>
                    <h3 className="font-bold mb-2 text-white group-hover:text-[#ef4444] transition-colors duration-300">{faq.q}</h3>
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
        <div className="absolute inset-0 bg-gradient-to-b from-[#ef4444]/10 via-[#ef4444]/5 to-[#0a0808]" />
        <GearPattern opacity={0.03} />
        <SpeedometerPattern opacity={0.015} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#ef4444]/30 to-transparent" />
          <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full blur-[180px] bg-[#ef4444]/8" />
        </div>
        <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block text-[#ef4444] text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border border-[#ef4444]/20 bg-[#ef4444]/5">
              STOP OVERPAYING
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold mb-4 tracking-tight">
              Honest Repairs. <span className="text-[#ef4444]">Fair Prices.</span>
            </h2>
            <p className="text-muted text-lg mb-10 max-w-xl mx-auto leading-relaxed">
              Whether it is a check engine light, strange noise, or routine maintenance, Pacific Auto Works has you covered. Call today for your free diagnostic.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="tel:2065550106"
                className="group inline-flex h-14 px-10 rounded-full bg-gradient-to-r from-[#ef4444] to-[#dc2626] text-white font-bold items-center justify-center text-lg hover:from-[#f87171] hover:to-[#ef4444] transition-all duration-300 shadow-lg shadow-[#ef4444]/25 gap-2"
              >
                <PhoneIcon />
                <span>Call (206) 555-0106</span>
              </a>
              <a
                href="#contact"
                className="inline-flex h-14 px-10 rounded-full border-2 border-[#ef4444]/30 text-[#ef4444] font-bold items-center justify-center text-lg hover:bg-[#ef4444]/10 hover:border-[#ef4444]/50 transition-all duration-300 gap-2"
              >
                <span>Free Diagnostic</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:translate-x-1 transition-transform">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </TemplateLayout>
  );
}
