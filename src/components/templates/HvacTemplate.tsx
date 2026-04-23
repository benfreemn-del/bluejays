"use client";

import { motion } from "framer-motion";
import TemplateLayout from "./TemplateLayout";

/* ───────────────────────── SVG Icons ───────────────────────── */

const SnowflakeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M19.07 4.93L4.93 19.07M12 6l-2-2m2 2l2-2m-2 16l-2 2m2-2l2 2M6 12l-2-2m2 2l-2 2m16-2l2-2m-2 2l2 2" />
  </svg>
);

const FlameIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M12 22c4.418 0 8-3.582 8-8 0-4-2.5-7.5-4-9-.667 2-2.5 3.5-4 3.5C10.5 8.5 9.667 6 9 4c-1.5 2-5 5.5-5 10 0 4.418 3.582 8 8 8z" />
    <path d="M12 22c2.21 0 4-1.79 4-4 0-2-1.25-3.75-2-4.5-.333 1-1.25 1.75-2 1.75s-1.667-1-2-2C9.25 14.25 8 16 8 18c0 2.21 1.79 4 4 4z" />
  </svg>
);

const ThermometerIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M14 14.76V3.5a2.5 2.5 0 00-5 0v11.26a4.5 4.5 0 105 0z" />
    <circle cx="11.5" cy="17.5" r="1.5" fill="currentColor" />
    <path d="M11.5 14V8" strokeLinecap="round" />
  </svg>
);

const FanIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <circle cx="12" cy="12" r="2" />
    <path d="M12 10c0-4-1.5-7-5-8 2 3 1 6-1 8s-6 1-8 1c1 3.5 4 5 8 5m0 0c0 4 1.5 7 5 8-2-3-1-6 1-8s6-1 8-1c-1-3.5-4-5-8-5" />
  </svg>
);

const AcUnitIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <rect x="2" y="4" width="20" height="12" rx="2" />
    <path d="M6 20h12M9 16v4m6-4v4" />
    <path d="M6 10h12M6 8h12" />
  </svg>
);

const DuctIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M3 8h6l3 3h9v6H12l-3-3H3V8z" />
    <path d="M6 8V5h4l2 2M18 17v3h-4l-2-2" />
    <path d="M3 11h5M16 14h5" strokeLinecap="round" />
  </svg>
);

const WrenchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
  </svg>
);

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
    <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
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

const StarIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const LeafIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75" />
  </svg>
);

const DollarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const XMarkIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
    <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* ───────────────────────── Background Patterns ───────────────────────── */

const SnowflakePattern = ({ opacity = 0.03 }: { opacity?: number }) => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }}>
    <defs>
      <pattern id="hvacSnowflake" width="100" height="100" patternUnits="userSpaceOnUse">
        <path d="M50 10v80M10 50h80M21.72 21.72l56.56 56.56M78.28 21.72L21.72 78.28" stroke="#06b6d4" strokeWidth="0.3" fill="none" />
        <circle cx="50" cy="50" r="3" stroke="#06b6d4" strokeWidth="0.3" fill="none" />
        <path d="M50 20l-3-4m3 4l3-4M50 80l-3 4m3-4l3 4M20 50l-4-3m4 3l-4 3M80 50l4-3m-4 3l4 3" stroke="#06b6d4" strokeWidth="0.3" fill="none" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#hvacSnowflake)" />
  </svg>
);

const ThermoPattern = ({ opacity = 0.03 }: { opacity?: number }) => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }}>
    <defs>
      <pattern id="hvacThermo" width="80" height="120" patternUnits="userSpaceOnUse">
        <rect x="35" y="10" width="10" height="80" rx="5" stroke="#06b6d4" strokeWidth="0.4" fill="none" />
        <circle cx="40" cy="100" r="12" stroke="#06b6d4" strokeWidth="0.4" fill="none" />
        <path d="M55 30h10M55 45h15M55 60h10" stroke="#06b6d4" strokeWidth="0.3" fill="none" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#hvacThermo)" />
  </svg>
);

const AirflowPattern = ({ opacity = 0.04 }: { opacity?: number }) => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }}>
    <defs>
      <pattern id="hvacAirflow" width="200" height="60" patternUnits="userSpaceOnUse">
        <path d="M0 30 Q50 10 100 30 Q150 50 200 30" stroke="#06b6d4" strokeWidth="0.4" fill="none" />
        <path d="M0 45 Q50 25 100 45 Q150 65 200 45" stroke="#06b6d4" strokeWidth="0.3" fill="none" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#hvacAirflow)" />
  </svg>
);

/* ───────────────────────── Data ───────────────────────── */

const services = [
  {
    name: "AC Repair",
    desc: "Fast, reliable air conditioning repair for all makes and models. We diagnose and fix the problem the first time, every time.",
    icon: <AcUnitIcon />,
    tags: ["Same-Day Service", "All Brands", "Warranty Work"],
  },
  {
    name: "Heating Service",
    desc: "Furnace repair, boiler service, and radiant heating solutions to keep your home warm when temperatures drop.",
    icon: <FlameIcon />,
    tags: ["Furnace Repair", "Boiler Service", "Radiant Heat"],
  },
  {
    name: "Heat Pump Install",
    desc: "High-efficiency heat pump installation for year-round comfort. Cut heating and cooling costs by up to 50%.",
    icon: <ThermometerIcon />,
    tags: ["Carrier", "Lennox", "High SEER"],
  },
  {
    name: "Duct Cleaning",
    desc: "Professional air duct cleaning to improve indoor air quality. Remove dust, allergens, and contaminants from your system.",
    icon: <DuctIcon />,
    tags: ["Air Quality", "Allergen Removal", "Sanitization"],
  },
  {
    name: "Maintenance Plans",
    desc: "Preventive maintenance programs that extend equipment life, reduce breakdowns, and maximize energy efficiency.",
    icon: <WrenchIcon />,
    tags: ["Bi-Annual Tune-Up", "Priority Service", "Discounts"],
  },
  {
    name: "New System Design",
    desc: "Custom HVAC system design and installation for new construction and major renovations. Engineered for your space.",
    icon: <FanIcon />,
    tags: ["Load Calculation", "Zoning", "Smart Thermostat"],
  },
];

const trustBadges = [
  { label: "Carrier Certified", icon: <ShieldIcon /> },
  { label: "Lennox Dealer", icon: <ShieldIcon /> },
  { label: "24/7 Emergency", icon: <ClockIcon /> },
  { label: "Financing Available", icon: <DollarIcon /> },
];

const testimonials = [
  {
    name: "Sarah K.",
    text: "Our AC died on the hottest day of summer. Alpine had a technician here within two hours and had us back to cool in no time. Absolutely incredible service.",
    serviceType: "AC Repair",
    rating: 5,
  },
  {
    name: "David M.",
    text: "They installed a new heat pump system for our entire home. The difference in our energy bills is night and day. Professional crew and spotless cleanup.",
    serviceType: "Heat Pump Install",
    rating: 5,
  },
  {
    name: "Lisa T.",
    text: "Been on their maintenance plan for three years. Never had a single breakdown. They catch problems before they become emergencies. Worth every penny.",
    serviceType: "Maintenance Plan",
    rating: 5,
  },
];

const maintenancePlans = [
  {
    name: "Basic",
    price: "$149",
    period: "/year",
    features: [
      { text: "1 Annual Tune-Up", included: true },
      { text: "Filter Replacement", included: true },
      { text: "Safety Inspection", included: true },
      { text: "Priority Scheduling", included: false },
      { text: "Parts Discount", included: false },
      { text: "Emergency Service", included: false },
    ],
  },
  {
    name: "Premium",
    price: "$299",
    period: "/year",
    popular: true,
    features: [
      { text: "2 Annual Tune-Ups", included: true },
      { text: "Filter Replacement", included: true },
      { text: "Safety Inspection", included: true },
      { text: "Priority Scheduling", included: true },
      { text: "15% Parts Discount", included: true },
      { text: "Emergency Service", included: false },
    ],
  },
  {
    name: "Ultimate",
    price: "$499",
    period: "/year",
    features: [
      { text: "2 Annual Tune-Ups", included: true },
      { text: "Filter Replacement", included: true },
      { text: "Safety Inspection", included: true },
      { text: "Priority Scheduling", included: true },
      { text: "25% Parts Discount", included: true },
      { text: "24/7 Emergency Service", included: true },
    ],
  },
];

const faqs = [
  {
    q: "How quickly can you respond to an AC emergency?",
    a: "We offer same-day emergency service throughout Bellevue and the Eastside. In most cases, a certified technician arrives within 2-4 hours of your call.",
  },
  {
    q: "What brands do you install and service?",
    a: "We are authorized dealers for Carrier and Lennox, and we service all major brands including Trane, Rheem, Goodman, Daikin, and more.",
  },
  {
    q: "How often should I have my HVAC system serviced?",
    a: "We recommend professional maintenance twice per year: once before cooling season and once before heating season. This keeps your system running at peak efficiency and prevents costly breakdowns.",
  },
  {
    q: "Do you offer financing for new systems?",
    a: "Yes. We offer flexible financing options with approved credit, including 0% interest for up to 18 months on qualifying systems. Ask about our current promotions.",
  },
  {
    q: "How do I know if I need a new system or just a repair?",
    a: "If your system is over 12-15 years old, requires frequent repairs, or your energy bills keep climbing, a new high-efficiency system may save you money long-term. We provide honest assessments with no pressure to buy.",
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
        className="inline-block text-[#06b6d4] text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border border-[#06b6d4]/20 bg-[#06b6d4]/5"
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
        <span className="text-[#06b6d4]">{highlightWord}</span>
        {parts[1] || ""}
      </motion.h2>
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className={`h-0.5 w-16 bg-gradient-to-r from-[#06b6d4] to-transparent mt-4 ${center ? "mx-auto" : ""}`}
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

/* ───────────────────────── Cool Air Animation ───────────────────────── */

function CoolAirFlow() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Flowing air wisps — background only, behind all content */}
      <style>{`
        @keyframes airFlow1 { 0% { transform: translateX(-100%) translateY(0); opacity: 0; } 10% { opacity: 0.15; } 80% { opacity: 0.1; } 100% { transform: translateX(120vw) translateY(-30px); opacity: 0; } }
        @keyframes airFlow2 { 0% { transform: translateX(-100%) translateY(0); opacity: 0; } 15% { opacity: 0.12; } 75% { opacity: 0.08; } 100% { transform: translateX(120vw) translateY(-50px); opacity: 0; } }
        @keyframes airFlow3 { 0% { transform: translateX(-100%) translateY(0); opacity: 0; } 12% { opacity: 0.1; } 85% { opacity: 0.06; } 100% { transform: translateX(120vw) translateY(-20px); opacity: 0; } }
        @keyframes airFlow4 { 0% { transform: translateX(120vw) translateY(0); opacity: 0; } 10% { opacity: 0.12; } 80% { opacity: 0.08; } 100% { transform: translateX(-100%) translateY(-40px); opacity: 0; } }
        @keyframes mistPulse { 0% { opacity: 0.03; transform: scale(1); } 50% { opacity: 0.08; transform: scale(1.1); } 100% { opacity: 0.03; transform: scale(1); } }
      `}</style>

      {/* Air wisp 1 — slow, high */}
      <svg className="absolute top-[15%] w-[600px] h-[80px]" viewBox="0 0 600 80" fill="none"
        style={{ animation: "airFlow1 12s ease-in-out infinite" }}>
        <path d="M0 40 Q100 20 200 40 Q300 60 400 35 Q500 15 600 40" stroke="#06b6d4" strokeWidth="2" opacity="0.5" />
        <path d="M0 45 Q100 25 200 45 Q300 65 400 40 Q500 20 600 45" stroke="#22d3ee" strokeWidth="1.5" opacity="0.3" />
        <path d="M0 50 Q100 30 200 50 Q300 70 400 45 Q500 25 600 50" stroke="#67e8f9" strokeWidth="1" opacity="0.2" />
      </svg>

      {/* Air wisp 2 — medium speed, middle */}
      <svg className="absolute top-[40%] w-[500px] h-[60px]" viewBox="0 0 500 60" fill="none"
        style={{ animation: "airFlow2 9s ease-in-out infinite 3s" }}>
        <path d="M0 30 Q80 10 160 30 Q240 50 320 25 Q400 5 500 30" stroke="#06b6d4" strokeWidth="2" opacity="0.4" />
        <path d="M0 35 Q80 15 160 35 Q240 55 320 30 Q400 10 500 35" stroke="#22d3ee" strokeWidth="1" opacity="0.25" />
      </svg>

      {/* Air wisp 3 — fast, low */}
      <svg className="absolute top-[65%] w-[700px] h-[70px]" viewBox="0 0 700 70" fill="none"
        style={{ animation: "airFlow3 8s ease-in-out infinite 1.5s" }}>
        <path d="M0 35 Q120 15 240 35 Q360 55 480 30 Q600 10 700 35" stroke="#67e8f9" strokeWidth="1.5" opacity="0.35" />
        <path d="M0 40 Q120 20 240 40 Q360 60 480 35 Q600 15 700 40" stroke="#a5f3fc" strokeWidth="1" opacity="0.2" />
      </svg>

      {/* Air wisp 4 — reverse direction, subtle */}
      <svg className="absolute top-[85%] w-[550px] h-[50px]" viewBox="0 0 550 50" fill="none"
        style={{ animation: "airFlow4 14s ease-in-out infinite 5s" }}>
        <path d="M0 25 Q100 10 200 25 Q300 40 400 20 Q500 5 550 25" stroke="#06b6d4" strokeWidth="1.5" opacity="0.3" />
      </svg>

      {/* Mist/fog patches */}
      <div className="absolute top-[20%] left-[10%] w-[300px] h-[150px] rounded-full bg-cyan-400/[0.04] blur-[80px]" style={{ animation: "mistPulse 6s ease-in-out infinite" }} />
      <div className="absolute top-[50%] right-[15%] w-[250px] h-[120px] rounded-full bg-cyan-300/[0.03] blur-[70px]" style={{ animation: "mistPulse 8s ease-in-out infinite 2s" }} />
      <div className="absolute top-[75%] left-[30%] w-[350px] h-[130px] rounded-full bg-sky-400/[0.03] blur-[90px]" style={{ animation: "mistPulse 7s ease-in-out infinite 4s" }} />
    </div>
  );
}

export default function HvacTemplate() {
  return (
    <TemplateLayout
      businessName="Alpine HVAC Solutions"
      tagline="Premium climate control for Bellevue homes and businesses. Carrier certified, same-day service, 12+ years of trusted comfort."
      accentColor="#06b6d4"
      accentColorLight="#22d3ee"
      heroGradient="linear-gradient(135deg, #0a1628 0%, #0c1a2e 50%, #061220 100%)"
      heroImage="https://images.unsplash.com/photo-1600210492493-0946911123ea?w=1400&q=80"
      phone="(425) 555-0104"
      address="1240 Main St, Bellevue, WA 98004"
    >
      {/* ════════════════ Emergency Banner ════════════════ */}
      <section className="py-3 bg-gradient-to-r from-[#06b6d4] via-[#0891b2] to-[#06b6d4] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9Im5vbmUiLz48cGF0aCBkPSJNMCAwTDQwIDQwTTQwIDBMMCA0MCIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjAuMyIgb3BhY2l0eT0iMC4xIi8+PC9zdmc+')] opacity-30" />
        <div className="max-w-6xl mx-auto px-6 flex flex-wrap items-center justify-center gap-6 relative z-10">
          <div className="flex items-center gap-3">
            <SnowflakeIcon />
            <p className="text-sm font-bold tracking-wide">AC EMERGENCY? SAME-DAY REPAIR &mdash; CALL NOW</p>
          </div>
          <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm px-5 py-2 rounded-full border border-white/20">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
            </span>
            <span className="text-xs font-bold tracking-wider">24/7 EMERGENCY: (425) 555-0104</span>
          </div>
        </div>
      </section>

      {/* ════════════════ Trust Badges ════════════════ */}
      <section className="py-6 relative overflow-hidden bg-[#0a1628]/80 border-b border-[#06b6d4]/10">
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
            {trustBadges.map((badge, i) => (
              <motion.div
                key={badge.label}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="flex items-center gap-2 text-white/60"
              >
                <span className="text-[#06b6d4]">{badge.icon}</span>
                <span className="text-xs font-bold uppercase tracking-wider">{badge.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ Stats Banner ════════════════ */}
      <section className="py-12 relative overflow-hidden bg-[#0b1525] border-b border-[#06b6d4]/10">
        <SnowflakePattern opacity={0.02} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] rounded-full blur-[180px] bg-[#06b6d4]/5" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "3000+", label: "Systems Installed", icon: <AcUnitIcon /> },
              { value: "12+", label: "Years Experience", icon: <ClockIcon /> },
              { value: "Same-Day", label: "Service Available", icon: <WrenchIcon /> },
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
                  <span className="text-[#06b6d4]">{stat.icon}</span>
                  <span className="text-3xl md:text-4xl font-extrabold text-white">{stat.value}</span>
                </div>
                <span className="text-muted text-sm font-medium tracking-wide uppercase">{stat.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ Services ════════════════ */}
      <section
        id="services"
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0a1020 0%, #0d1528 50%, #0a1020 100%)" }}
      >
        <SnowflakePattern />
        <CoolAirFlow />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[10%] right-[5%] w-[500px] h-[500px] rounded-full blur-[160px] bg-[#06b6d4]/6" />
          <div className="absolute bottom-[10%] left-[5%] w-[400px] h-[400px] rounded-full blur-[140px] bg-[#06b6d4]/4" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="OUR SERVICES"
            title="Climate Control Services"
            highlightWord="Services"
            subtitle="From emergency repairs to complete system design, we deliver precision climate solutions backed by industry-leading warranties."
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, i) => (
              <motion.div
                key={service.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group relative p-7 rounded-2xl border border-white/[0.10] hover:border-[#06b6d4]/30 transition-all duration-500 overflow-hidden bg-white/[0.07]"
              >
                {/* Hover glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,#06b6d415,transparent_70%)]" />
                {/* Top accent line */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#06b6d4]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  {/* Number + Icon row */}
                  <div className="flex items-start justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl bg-[#06b6d4]/10 border border-[#06b6d4]/20 flex items-center justify-center text-[#06b6d4] group-hover:bg-[#06b6d4]/20 group-hover:border-[#06b6d4]/40 transition-all duration-300">
                      {service.icon}
                    </div>
                    <span className="text-4xl font-extrabold text-white/[0.04] group-hover:text-[#06b6d4]/10 transition-colors duration-300 leading-none">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold mb-3 group-hover:text-[#06b6d4] transition-colors duration-300">{service.name}</h3>
                  <p className="text-muted text-sm leading-relaxed mb-5">{service.desc}</p>
                  {/* Feature tags */}
                  <div className="flex flex-wrap gap-2">
                    {service.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-semibold uppercase tracking-wider text-[#06b6d4]/70 bg-[#06b6d4]/8 border border-[#06b6d4]/10 px-2.5 py-1 rounded-full"
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

      {/* ════════════════ Energy Efficiency Section ════════════════ */}
      <section
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0d1528 0%, #0f1a30 50%, #0d1528 100%)" }}
      >
        <ThermoPattern opacity={0.025} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[30%] left-[50%] -translate-x-1/2 w-[700px] h-[400px] rounded-full blur-[180px] bg-[#06b6d4]/6" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: visual */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative w-full max-w-md mx-auto">
                {/* Main gradient card */}
                <div className="aspect-square rounded-3xl bg-gradient-to-br from-[#06b6d4]/20 via-[#06b6d4]/5 to-transparent border border-[#06b6d4]/20 p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
                  <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_30%_20%,#06b6d420,transparent_60%)]" />
                  {/* Animated temperature visual */}
                  <svg viewBox="0 0 200 200" className="w-40 h-40 mb-6 relative z-10">
                    <defs>
                      <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#22d3ee" />
                        <stop offset="100%" stopColor="#06b6d4" />
                      </linearGradient>
                    </defs>
                    <circle cx="100" cy="100" r="90" stroke="#06b6d4" strokeWidth="1" fill="none" opacity="0.2" />
                    <circle cx="100" cy="100" r="75" stroke="#06b6d4" strokeWidth="0.5" fill="none" opacity="0.1" />
                    <text x="100" y="90" textAnchor="middle" fill="url(#tempGrad)" fontSize="48" fontWeight="800" fontFamily="system-ui">50%</text>
                    <text x="100" y="120" textAnchor="middle" fill="#06b6d4" fontSize="12" fontWeight="600" opacity="0.7" fontFamily="system-ui">ENERGY SAVINGS</text>
                    {/* Snowflake icon at top */}
                    <path d="M100 20v12M100 20l-3-4m3 4l3-4" stroke="#22d3ee" strokeWidth="1" fill="none" />
                    {/* Flame icon at bottom */}
                    <path d="M100 168v12M100 180l-3 4m3-4l3 4" stroke="#f97316" strokeWidth="1" fill="none" />
                  </svg>
                  <p className="text-2xl font-extrabold text-white relative z-10">Save Up to 50%</p>
                  <p className="text-muted text-sm mt-2 relative z-10">on heating &amp; cooling costs with a high-efficiency system upgrade</p>
                </div>
                {/* Floating stat cards */}
                <div className="absolute -top-4 -right-4 bg-[#0d1528] border border-[#06b6d4]/20 rounded-xl px-4 py-3 shadow-xl shadow-[#06b6d4]/10">
                  <span className="block text-xl font-extrabold text-[#06b6d4] leading-none">20+</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted">SEER Rating</span>
                </div>
                <div className="absolute -bottom-4 -left-4 bg-[#0d1528] border border-[#06b6d4]/20 rounded-xl px-4 py-3 shadow-xl shadow-[#06b6d4]/10">
                  <span className="block text-xl font-extrabold text-[#22d3ee] leading-none">$2,400</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted">Avg. Annual Savings</span>
                </div>
                {/* Corner decorations */}
                <div className="absolute -top-3 -left-3 w-16 h-16 border-t-2 border-l-2 border-[#06b6d4]/20 rounded-tl-xl" />
                <div className="absolute -bottom-3 -right-3 w-16 h-16 border-b-2 border-r-2 border-[#06b6d4]/20 rounded-br-xl" />
              </div>
            </motion.div>

            {/* Right: content */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <SectionHeader
                tag="SAVE MONEY"
                title="Energy Efficiency Experts"
                highlightWord="Efficiency"
                center={false}
              />
              <p className="text-muted leading-relaxed mb-6 text-lg -mt-8">
                Upgrading to a modern HVAC system isn&apos;t just about comfort &mdash; it&apos;s about slashing your energy bills. Today&apos;s high-efficiency systems deliver the same comfort using up to 50% less energy.
              </p>
              <p className="text-muted leading-relaxed mb-8">
                Our energy consultants perform detailed load calculations and recommend the right system for your space. No overselling, no guesswork &mdash; just honest, engineered solutions that pay for themselves.
              </p>
              {/* Feature list */}
              <div className="space-y-4">
                {[
                  { icon: <LeafIcon />, title: "High SEER Systems", desc: "20+ SEER rated equipment for maximum energy savings" },
                  { icon: <DollarIcon />, title: "Utility Rebates", desc: "We help you claim every available rebate and incentive" },
                  { icon: <ThermometerIcon />, title: "Smart Thermostats", desc: "WiFi-enabled controls that learn your schedule and save money" },
                ].map((feature) => (
                  <div key={feature.title} className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.07] border border-white/[0.04] hover:border-[#06b6d4]/20 transition-colors duration-300">
                    <div className="w-10 h-10 rounded-lg bg-[#06b6d4]/10 border border-[#06b6d4]/20 flex items-center justify-center text-[#06b6d4] shrink-0">
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

      {/* ════════════════ Why Choose Us Banner ════════════════ */}
      <section className="py-20 relative overflow-hidden bg-gradient-to-b from-[#06b6d4]/10 to-[#0a1020]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#06b6d4]/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#06b6d4]/10 to-transparent" />
          <svg className="absolute inset-0 w-full h-full opacity-[0.04]" viewBox="0 0 1000 400">
            <path d="M0 200 Q250 100 500 200 Q750 300 1000 200" stroke="#06b6d4" strokeWidth="1" fill="none" />
            <path d="M0 250 Q250 150 500 250 Q750 350 1000 250" stroke="#06b6d4" strokeWidth="0.5" fill="none" />
            <circle cx="500" cy="200" r="80" stroke="#06b6d4" strokeWidth="0.3" fill="none" />
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
              WHY CHOOSE <span className="text-[#06b6d4]">ALPINE HVAC?</span>
            </h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <ShieldIcon />, title: "Certified Pros", desc: "Carrier and Lennox certified technicians with EPA certification" },
              { icon: <ClockIcon />, title: "Same-Day Service", desc: "Emergency AC and heating repair available 24 hours a day" },
              { icon: <CheckCircleIcon />, title: "Guaranteed Work", desc: "100% satisfaction guarantee on every repair and installation" },
              { icon: <DollarIcon />, title: "Fair Pricing", desc: "Upfront, transparent pricing. No hidden fees or surprise charges." },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group text-center p-6 rounded-2xl border border-white/[0.10] hover:border-[#06b6d4]/30 bg-white/[0.07] transition-all duration-500"
              >
                <div className="w-14 h-14 mx-auto rounded-xl bg-[#06b6d4]/10 border border-[#06b6d4]/20 flex items-center justify-center text-[#06b6d4] mb-4 group-hover:bg-[#06b6d4]/20 group-hover:scale-110 transition-all duration-300">
                  {item.icon}
                </div>
                <h4 className="font-bold mb-2">{item.title}</h4>
                <p className="text-muted text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ Maintenance Plans Comparison ════════════════ */}
      <section
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0a1020 0%, #0d1528 50%, #0a1020 100%)" }}
      >
        <AirflowPattern />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] right-[10%] w-[500px] h-[500px] rounded-full blur-[180px] bg-[#06b6d4]/5" />
          <div className="absolute bottom-[10%] left-[10%] w-[400px] h-[400px] rounded-full blur-[140px] bg-[#06b6d4]/4" />
        </div>
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="MAINTENANCE PLANS"
            title="Seasonal Protection Plans"
            highlightWord="Protection"
            subtitle="Prevent costly breakdowns and extend the life of your system with a maintenance plan tailored to your needs."
          />
          <div className="grid md:grid-cols-3 gap-6">
            {maintenancePlans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`group relative p-7 rounded-2xl border transition-all duration-500 overflow-hidden ${
                  plan.popular
                    ? "border-[#06b6d4]/40 bg-gradient-to-b from-[#06b6d4]/[0.08] to-transparent scale-[1.02]"
                    : "border-white/[0.10] bg-white/[0.07] hover:border-[#06b6d4]/20"
                }`}
              >
                {plan.popular && (
                  <>
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#06b6d4]/60 to-transparent" />
                    <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,#06b6d415,transparent_60%)]" />
                    <span className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-[0.15em] text-[#06b6d4] bg-[#06b6d4]/10 border border-[#06b6d4]/20 px-3 py-1 rounded-full">
                      Most Popular
                    </span>
                  </>
                )}
                <div className="relative z-10">
                  <h3 className="text-lg font-bold mb-1">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-4xl font-extrabold text-[#06b6d4]">{plan.price}</span>
                    <span className="text-muted text-sm">{plan.period}</span>
                  </div>
                  <div className="space-y-3 mb-8">
                    {plan.features.map((feature) => (
                      <div key={feature.text} className="flex items-center gap-3">
                        <span className={feature.included ? "text-[#06b6d4]" : "text-white/20"}>
                          {feature.included ? <CheckIcon /> : <XMarkIcon />}
                        </span>
                        <span className={`text-sm ${feature.included ? "text-white/80" : "text-white/30"}`}>
                          {feature.text}
                        </span>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    className={`w-full h-12 rounded-xl font-bold text-sm transition-all duration-300 ${
                      plan.popular
                        ? "bg-gradient-to-r from-[#06b6d4] to-[#0891b2] text-white hover:from-[#22d3ee] hover:to-[#06b6d4] shadow-lg shadow-[#06b6d4]/20"
                        : "bg-white/5 border border-[#06b6d4]/20 text-[#06b6d4] hover:bg-[#06b6d4]/10"
                    }`}
                  >
                    Choose {plan.name}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ Testimonials ════════════════ */}
      <section
        id="testimonials"
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0d1528 0%, #0f1a30 50%, #0d1528 100%)" }}
      >
        <SnowflakePattern />
        <CoolAirFlow />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[30%] left-[40%] w-[600px] h-[400px] rounded-full blur-[180px] bg-[#06b6d4]/5" />
          <svg className="absolute inset-0 w-full h-full opacity-[0.025]" viewBox="0 0 800 400">
            <circle cx="400" cy="200" r="100" stroke="#06b6d4" strokeWidth="0.5" fill="none" />
            <circle cx="400" cy="200" r="180" stroke="#06b6d4" strokeWidth="0.3" fill="none" />
            <circle cx="400" cy="200" r="260" stroke="#06b6d4" strokeWidth="0.2" fill="none" />
          </svg>
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="CLIENT TESTIMONIALS"
            title="Trusted by Thousands"
            highlightWord="Thousands"
            subtitle="Real reviews from Bellevue homeowners who trust Alpine HVAC with their comfort."
          />
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative p-7 rounded-2xl border border-white/[0.10] hover:border-[#06b6d4]/30 transition-all duration-500 overflow-hidden bg-white/[0.07]"
              >
                {/* Top accent line */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-[#06b6d4]/40 via-[#06b6d4]/10 to-transparent" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_0%_0%,#06b6d410,transparent_70%)]" />
                <div className="relative z-10">
                  {/* Service type tag */}
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#06b6d4]/70 bg-[#06b6d4]/8 border border-[#06b6d4]/10 px-2.5 py-1 rounded-full">
                    {t.serviceType}
                  </span>
                  {/* Stars */}
                  <div className="flex items-center gap-0.5 text-[#06b6d4] mt-4 mb-4">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <StarIcon key={j} />
                    ))}
                  </div>
                  {/* Quote */}
                  <p className="text-muted leading-relaxed mb-6 text-sm">&ldquo;{t.text}&rdquo;</p>
                  {/* Author */}
                  <div className="flex items-center gap-3 pt-4 border-t border-white/[0.10]">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#06b6d4]/30 to-[#06b6d4]/10 flex items-center justify-center text-sm font-bold text-[#06b6d4]">
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

      {/* ════════════════ Free Estimate CTA ════════════════ */}
      <section
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0a1020 0%, #0e1830 50%, #0a1020 100%)" }}
      >
        <ThermoPattern opacity={0.02} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-[200px] bg-[#06b6d4]/6" />
        </div>
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-8 md:p-12 rounded-2xl border border-[#06b6d4]/20 relative overflow-hidden bg-gradient-to-b from-[#06b6d4]/[0.06] to-transparent"
          >
            {/* Inner glow */}
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,#06b6d415,transparent_60%)]" />
            {/* Corner decorations */}
            <div className="absolute top-0 left-0 w-20 h-20 border-t border-l border-[#06b6d4]/30 rounded-tl-2xl" />
            <div className="absolute bottom-0 right-0 w-20 h-20 border-b border-r border-[#06b6d4]/30 rounded-br-2xl" />
            <div className="relative z-10">
              <div className="text-center mb-8">
                <span className="inline-flex items-center gap-2 bg-[#06b6d4]/10 text-[#06b6d4] text-xs font-bold uppercase tracking-[0.2em] px-4 py-2 rounded-full mb-4 border border-[#06b6d4]/20">
                  <SnowflakeIcon />
                  FREE ESTIMATE
                </span>
                <h2 className="text-3xl md:text-4xl font-extrabold mb-3">
                  Get Your Free <span className="text-[#06b6d4]">Comfort Consultation</span>
                </h2>
                <p className="text-muted max-w-lg mx-auto">
                  Tell us about your home&apos;s comfort needs. We&apos;ll provide a detailed, no-obligation estimate within 24 hours.
                </p>
              </div>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Your Name"
                    className="w-full h-13 px-5 rounded-xl bg-white/5 border border-[#06b6d4]/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#06b6d4]/50 transition-colors"
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    className="w-full h-13 px-5 rounded-xl bg-white/5 border border-[#06b6d4]/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#06b6d4]/50 transition-colors"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    className="w-full h-13 px-5 rounded-xl bg-white/5 border border-[#06b6d4]/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#06b6d4]/50 transition-colors"
                  />
                  <select className="w-full h-13 px-5 rounded-xl bg-white/5 border border-[#06b6d4]/15 text-white/50 text-sm focus:outline-none focus:border-[#06b6d4]/50 transition-colors appearance-none">
                    <option value="">Service Needed</option>
                    <option value="ac-repair">AC Repair</option>
                    <option value="heating">Heating Service</option>
                    <option value="heat-pump">Heat Pump Install</option>
                    <option value="duct-cleaning">Duct Cleaning</option>
                    <option value="maintenance">Maintenance Plan</option>
                    <option value="new-system">New System Design</option>
                  </select>
                </div>
                <textarea
                  placeholder="Tell us about your comfort needs..."
                  rows={4}
                  className="w-full px-5 py-4 rounded-xl bg-white/5 border border-[#06b6d4]/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#06b6d4]/50 resize-none transition-colors"
                />
                <button
                  type="button"
                  className="w-full h-14 rounded-xl bg-gradient-to-r from-[#06b6d4] to-[#0891b2] text-white font-bold text-lg hover:from-[#22d3ee] hover:to-[#06b6d4] transition-all duration-300 shadow-lg shadow-[#06b6d4]/20"
                >
                  Get My Free Estimate
                </button>
                <p className="text-center text-white/30 text-xs">
                  No obligation. No pressure. Just honest answers from certified HVAC professionals.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ════════════════ FAQ ════════════════ */}
      <section
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0d1528 0%, #0f1a30 50%, #0d1528 100%)" }}
      >
        <SnowflakePattern />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] left-[10%] w-[400px] h-[400px] rounded-full blur-[140px] bg-[#06b6d4]/5" />
          <div className="absolute bottom-[15%] right-[10%] w-[350px] h-[350px] rounded-full blur-[120px] bg-[#06b6d4]/4" />
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
                className="group p-6 rounded-2xl border border-white/[0.10] hover:border-[#06b6d4]/20 transition-all duration-500 overflow-hidden relative bg-white/[0.07]"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_0%_50%,#06b6d410,transparent_70%)]" />
                <div className="relative z-10 flex gap-4">
                  <div className="w-8 h-8 shrink-0 rounded-lg bg-[#06b6d4]/10 border border-[#06b6d4]/20 flex items-center justify-center text-[#06b6d4] text-xs font-bold mt-0.5">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div>
                    <h3 className="font-bold mb-2 text-white group-hover:text-[#06b6d4] transition-colors duration-300">{faq.q}</h3>
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
        <div className="absolute inset-0 bg-gradient-to-b from-[#06b6d4]/10 via-[#06b6d4]/5 to-[#0a1020]" />
        <AirflowPattern opacity={0.03} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#06b6d4]/30 to-transparent" />
          <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full blur-[180px] bg-[#06b6d4]/8" />
        </div>
        <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block text-[#06b6d4] text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border border-[#06b6d4]/20 bg-[#06b6d4]/5">
              STAY COMFORTABLE
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold mb-4 tracking-tight">
              Don&apos;t Sweat It &mdash; <span className="text-[#06b6d4]">Call Alpine Today</span>
            </h2>
            <p className="text-muted text-lg mb-10 max-w-xl mx-auto leading-relaxed">
              Whether it&apos;s an emergency repair or a brand-new system, our certified technicians are ready to deliver comfort you can count on. Free estimates, same-day service.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#contact"
                className="group inline-flex h-14 px-10 rounded-full bg-gradient-to-r from-[#06b6d4] to-[#0891b2] text-white font-bold items-center justify-center text-lg hover:from-[#22d3ee] hover:to-[#06b6d4] transition-all duration-300 shadow-lg shadow-[#06b6d4]/25 gap-2"
              >
                <span>Free Estimate</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:translate-x-1 transition-transform">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
              <a
                href="tel:4255550104"
                className="inline-flex h-14 px-10 rounded-full border-2 border-[#06b6d4]/30 text-[#06b6d4] font-bold items-center justify-center text-lg hover:bg-[#06b6d4]/10 hover:border-[#06b6d4]/50 transition-all duration-300 gap-2"
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
