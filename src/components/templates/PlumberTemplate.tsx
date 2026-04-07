"use client";

import { motion } from "framer-motion";
import TemplateLayout from "./TemplateLayout";

/* ───────────────────────── SVG Icons ───────────────────────── */

const WrenchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
  </svg>
);

const PipeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M4 6h4v4H4zM16 6h4v4h-4zM8 8h8M4 14h4v4H4zM16 14h4v4h-4zM8 16h8M6 10v4M18 10v4" />
  </svg>
);

const FaucetIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M12 2v4M8 6h8l-1 4H9L8 6zM10 10v2a2 2 0 004 0v-2M12 14v3M8 17h8a2 2 0 012 2v1H6v-1a2 2 0 012-2z" />
  </svg>
);

const WaterHeaterIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <rect x="5" y="3" width="14" height="18" rx="2" />
    <circle cx="12" cy="14" r="3" />
    <path d="M9 7h6M12 11v-1M10 2v1M14 2v1" />
    <path d="M10 17.5c.5.5 1 1 2 1s1.5-.5 2-1" />
  </svg>
);

const DrainIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 3c0 3-3 5-3 9s3 6 3 9M12 3c0 3 3 5 3 9s-3 6-3 9M3 12h18" />
  </svg>
);

const ToiletIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M6 12h12a1 1 0 011 1v1a5 5 0 01-5 5h-4a5 5 0 01-5-5v-1a1 1 0 011-1zM7 12V5a2 2 0 012-2h6a2 2 0 012 2v7M10 19v2M14 19v2M8 22h8" />
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

const ShieldCheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
    <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const DollarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
    <path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
  </svg>
);

const StarIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const MapPinIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

/* ───────────────────────── Pipe Grid Pattern ───────────────────────── */

const PipeGridPattern = ({ opacity = 0.03 }: { opacity?: number }) => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }}>
    <defs>
      <pattern id="plumbGrid" width="80" height="80" patternUnits="userSpaceOnUse">
        <path d="M0 40h30M50 40h30M40 0v30M40 50v30" stroke="#3b82f6" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <circle cx="40" cy="40" r="5" stroke="#3b82f6" strokeWidth="0.8" fill="none" />
        <circle cx="0" cy="40" r="2" fill="#3b82f6" fillOpacity="0.3" />
        <circle cx="80" cy="40" r="2" fill="#3b82f6" fillOpacity="0.3" />
        <circle cx="40" cy="0" r="2" fill="#3b82f6" fillOpacity="0.3" />
        <circle cx="40" cy="80" r="2" fill="#3b82f6" fillOpacity="0.3" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#plumbGrid)" />
  </svg>
);

/* ───────────────────────── Water Drop Pattern ───────────────────────── */

const WaterDropPattern = ({ opacity = 0.04 }: { opacity?: number }) => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }}>
    <defs>
      <pattern id="waterDrops" width="120" height="120" patternUnits="userSpaceOnUse">
        <path d="M60 20c0 0-15 20-15 30a15 15 0 0030 0c0-10-15-30-15-30z" stroke="#3b82f6" strokeWidth="0.5" fill="none" />
        <path d="M20 70c0 0-8 12-8 18a8 8 0 0016 0c0-6-8-18-8-18z" stroke="#3b82f6" strokeWidth="0.4" fill="none" />
        <path d="M100 75c0 0-6 9-6 13a6 6 0 0012 0c0-4-6-13-6-13z" stroke="#3b82f6" strokeWidth="0.4" fill="none" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#waterDrops)" />
  </svg>
);

/* ───────────────────────── Data ───────────────────────── */

const services = [
  {
    name: "Emergency Plumbing",
    desc: "Burst pipes, flooding, or no water at 2 AM? Our emergency crews are dispatched within minutes and arrive fast to stop the damage.",
    icon: <WrenchIcon />,
    tags: ["Burst Pipes", "Flooding", "No Hot Water"],
  },
  {
    name: "Drain Cleaning",
    desc: "Slow drains, recurring clogs, and sewer backups eliminated with professional hydro-jetting and camera inspection technology.",
    icon: <DrainIcon />,
    tags: ["Hydro-Jetting", "Camera Inspection", "Clog Removal"],
  },
  {
    name: "Water Heater",
    desc: "Installation, repair, and replacement of tank and tankless water heaters. Restore hot water to your home the same day.",
    icon: <WaterHeaterIcon />,
    tags: ["Tankless", "Tank Repair", "Same-Day Install"],
  },
  {
    name: "Bathroom Remodel",
    desc: "Full bathroom renovations from rough-in plumbing to fixture installation. We handle every pipe so your contractor stays on schedule.",
    icon: <FaucetIcon />,
    tags: ["Fixture Install", "Rough-In", "Shower Systems"],
  },
  {
    name: "Sewer Line",
    desc: "Trenchless sewer repair and replacement that saves your yard. Video inspection finds the problem; our team fixes it permanently.",
    icon: <PipeIcon />,
    tags: ["Trenchless Repair", "Video Inspection", "Root Removal"],
  },
  {
    name: "Leak Detection",
    desc: "Hidden leaks destroy homes silently. Our electronic leak detection pinpoints the exact source without tearing apart your walls.",
    icon: <ToiletIcon />,
    tags: ["Electronic Detection", "Slab Leaks", "Non-Invasive"],
  },
];

const testimonials = [
  {
    name: "David R.",
    text: "Pipe burst at midnight on a Sunday. They were at my door in 40 minutes and had the water shut off and repaired before dawn. Saved my basement from total destruction.",
    jobType: "Emergency Pipe Repair",
    rating: 5,
  },
  {
    name: "Sarah M.",
    text: "Our water heater died in January with a newborn in the house. Emerald City had a new tankless unit installed the same day. The crew was clean, fast, and the price was exactly what they quoted.",
    jobType: "Water Heater Install",
    rating: 5,
  },
  {
    name: "Tom & Linda K.",
    text: "We had a sewer line that kept backing up every few months. They ran a camera, found tree root intrusion, and did a trenchless replacement. Two years later, zero problems.",
    jobType: "Sewer Line Replacement",
    rating: 5,
  },
];

const serviceAreas = [
  "Seattle", "Bellevue", "Kirkland", "Redmond", "Renton",
  "Kent", "Federal Way", "Tacoma", "Everett", "Bothell",
  "Issaquah", "Sammamish", "Mercer Island", "Burien", "Shoreline",
];

const faqs = [
  {
    q: "Do you offer 24/7 emergency service?",
    a: "Absolutely. Our emergency plumbers are available 24 hours a day, 7 days a week, 365 days a year. Call (206) 555-0102 any time and a real person answers the phone.",
  },
  {
    q: "How fast can you get to my home?",
    a: "For emergencies, our average response time is under 60 minutes across the greater Seattle area. Non-emergency appointments are typically available same-day or next-day.",
  },
  {
    q: "Do you provide upfront pricing?",
    a: "Yes. Before any work begins, you receive a written estimate with the full cost. No hidden fees, no surprise charges. The price we quote is the price you pay.",
  },
  {
    q: "Are your plumbers licensed and insured?",
    a: "Every plumber on our team holds a valid Washington State plumbing license and is fully insured. We also conduct background checks on all technicians for your peace of mind.",
  },
  {
    q: "Do you offer financing?",
    a: "Yes. We partner with top financing providers to offer 0% interest plans on qualifying jobs. Ask about our financing options when you schedule your estimate.",
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
        className="inline-block text-[#3b82f6] text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border border-[#3b82f6]/20 bg-[#3b82f6]/5"
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
        <span className="text-[#3b82f6]">{highlightWord}</span>
        {parts[1] || ""}
      </motion.h2>
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className={`h-0.5 w-16 bg-gradient-to-r from-[#3b82f6] to-transparent mt-4 ${center ? "mx-auto" : ""}`}
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

export default function PlumberTemplate() {
  return (
    <TemplateLayout
      businessName="Emerald City Plumbing"
      tagline="Seattle's most trusted plumbing experts. 24/7 emergency service, upfront pricing, and a 100% satisfaction guarantee on every job."
      accentColor="#3b82f6"
      accentColorLight="#60a5fa"
      heroGradient="linear-gradient(135deg, #0c1929 0%, #0a1220 100%)"
      heroImage="https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=1400&q=80"
      phone="(206) 555-0102"
      address="4712 Rainier Ave S, Seattle, WA 98118"
    >
      {/* ════════════════ Emergency Call Banner ════════════════ */}
      <section className="py-3 bg-gradient-to-r from-[#dc2626] via-[#ef4444] to-[#dc2626] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9Im5vbmUiLz48cGF0aCBkPSJNMCAwTDQwIDQwTTQwIDBMMCA0MCIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjAuMyIgb3BhY2l0eT0iMC4xIi8+PC9zdmc+')] opacity-30" />
        <div className="max-w-6xl mx-auto px-6 flex flex-wrap items-center justify-center gap-6 relative z-10">
          <div className="flex items-center gap-3">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6 animate-pulse">
              <path d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <p className="text-sm font-bold tracking-wide">EMERGENCY PLUMBING? CALL NOW!</p>
          </div>
          <a
            href="tel:2065550102"
            className="flex items-center gap-2 bg-white/15 backdrop-blur-sm px-5 py-2 rounded-full border border-white/20 hover:bg-white/25 transition-colors"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
            </span>
            <span className="text-xs font-bold tracking-wider">24/7 HOTLINE: (206) 555-0102</span>
          </a>
        </div>
      </section>

      {/* ════════════════ Trust Badges ════════════════ */}
      <section className="py-5 relative overflow-hidden bg-[#0c1929] border-b border-[#3b82f6]/10">
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: <ShieldCheckIcon />, label: "Licensed & Insured" },
              { icon: <ClockIcon />, label: "60-Min Response" },
              { icon: <DollarIcon />, label: "Upfront Pricing" },
              { icon: <CheckCircleIcon />, label: "Satisfaction Guaranteed" },
            ].map((badge, i) => (
              <motion.div
                key={badge.label}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#3b82f6]/5 border border-[#3b82f6]/10"
              >
                <span className="text-[#3b82f6]">{badge.icon}</span>
                <span className="text-white/80 text-xs font-bold uppercase tracking-wider">{badge.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ Stats Banner ════════════════ */}
      <section className="py-12 relative overflow-hidden bg-[#0a1220] border-b border-[#3b82f6]/10">
        <PipeGridPattern opacity={0.02} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] rounded-full blur-[180px] bg-[#3b82f6]/5" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "5,000+", label: "Jobs Completed", icon: <WrenchIcon /> },
              { value: "14+", label: "Years in Business", icon: <ShieldCheckIcon /> },
              { value: "60 Min", label: "Avg Response Time", icon: <ClockIcon /> },
              { value: "4.9", label: "Star Rating", icon: <StarIcon /> },
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
                  <span className="text-[#3b82f6]">{stat.icon}</span>
                  <span className="text-3xl md:text-4xl font-extrabold text-white">{stat.value}</span>
                </div>
                <span className="text-muted text-sm font-medium tracking-wide uppercase">{stat.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ Services (01-06) ════════════════ */}
      <section
        id="services"
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #080e18 0%, #0c1525 50%, #080e18 100%)" }}
      >
        <PipeGridPattern />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[10%] right-[5%] w-[500px] h-[500px] rounded-full blur-[160px] bg-[#3b82f6]/6" />
          <div className="absolute bottom-[10%] left-[5%] w-[400px] h-[400px] rounded-full blur-[140px] bg-[#3b82f6]/4" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="OUR SERVICES"
            title="Expert Plumbing Solutions"
            highlightWord="Solutions"
            subtitle="From emergency repairs to full remodels, our licensed plumbers handle every job with precision, speed, and upfront pricing."
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, i) => (
              <motion.div
                key={service.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group relative p-7 rounded-2xl border border-white/[0.06] hover:border-[#3b82f6]/30 transition-all duration-500 overflow-hidden bg-white/[0.02]"
              >
                {/* Hover glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,#3b82f615,transparent_70%)]" />
                {/* Top accent line */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#3b82f6]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  {/* Number + Icon row */}
                  <div className="flex items-start justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl bg-[#3b82f6]/10 border border-[#3b82f6]/20 flex items-center justify-center text-[#3b82f6] group-hover:bg-[#3b82f6]/20 group-hover:border-[#3b82f6]/40 transition-all duration-300">
                      {service.icon}
                    </div>
                    <span className="text-4xl font-extrabold text-white/[0.04] group-hover:text-[#3b82f6]/10 transition-colors duration-300 leading-none">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold mb-3 group-hover:text-[#3b82f6] transition-colors duration-300">{service.name}</h3>
                  <p className="text-muted text-sm leading-relaxed mb-5">{service.desc}</p>
                  {/* Feature tags */}
                  <div className="flex flex-wrap gap-2">
                    {service.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-semibold uppercase tracking-wider text-[#3b82f6]/70 bg-[#3b82f6]/8 border border-[#3b82f6]/10 px-2.5 py-1 rounded-full"
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

      {/* ════════════════ About / Why Choose Us ════════════════ */}
      <section
        id="about"
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0a1220 0%, #0d1628 50%, #0a1220 100%)" }}
      >
        <WaterDropPattern />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] left-[5%] w-[500px] h-[500px] rounded-full blur-[160px] bg-[#3b82f6]/5" />
          <div className="absolute bottom-[10%] right-[10%] w-[350px] h-[350px] rounded-full blur-[140px] bg-[#3b82f6]/4" />
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
                    src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&q=80"
                    alt="Professional plumber at work"
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Secondary image */}
                <div className="absolute bottom-0 right-0 w-[65%] h-[55%] rounded-2xl overflow-hidden border-2 border-white/[0.06] shadow-2xl z-20">
                  <img
                    src="https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&q=80"
                    alt="Plumbing tools and equipment"
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Accent badge */}
                <div className="absolute top-[55%] left-[60%] z-30 bg-[#3b82f6] rounded-2xl px-5 py-4 shadow-xl shadow-[#3b82f6]/20 border border-[#60a5fa]/30">
                  <span className="block text-3xl font-extrabold text-white leading-none">14+</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-white/80">Years of<br />Service</span>
                </div>
                {/* Decorative corner lines */}
                <div className="absolute -top-3 -left-3 w-16 h-16 border-t-2 border-l-2 border-[#3b82f6]/20 rounded-tl-xl" />
                <div className="absolute -bottom-3 -right-3 w-16 h-16 border-b-2 border-r-2 border-[#3b82f6]/20 rounded-br-xl" />
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
                title="Seattle's Trusted Plumbers"
                highlightWord="Trusted"
                center={false}
              />
              <p className="text-muted leading-relaxed mb-6 text-lg -mt-8">
                Emerald City Plumbing has been keeping Seattle&apos;s water flowing since 2012. We are a family-owned company built on a simple promise: show up fast, fix it right, and charge a fair price.
              </p>
              <p className="text-muted leading-relaxed mb-8">
                Every plumber on our team is licensed, background-checked, and trained to treat your home like their own. We don&apos;t leave until the job is perfect and you&apos;re completely satisfied.
              </p>
              {/* Feature list */}
              <div className="space-y-4">
                {[
                  { icon: <ClockIcon />, title: "60-Minute Response", desc: "Emergency crews dispatched immediately, on-site within the hour" },
                  { icon: <DollarIcon />, title: "Upfront Pricing", desc: "Written quote before work begins. No hidden fees, ever." },
                  { icon: <ShieldCheckIcon />, title: "Licensed & Insured", desc: "WA State licensed plumbers with full liability coverage" },
                ].map((feature) => (
                  <div key={feature.title} className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-[#3b82f6]/20 transition-colors duration-300">
                    <div className="w-10 h-10 rounded-lg bg-[#3b82f6]/10 border border-[#3b82f6]/20 flex items-center justify-center text-[#3b82f6] shrink-0">
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
      <section className="py-20 relative overflow-hidden bg-gradient-to-b from-[#3b82f6]/10 to-[#080e18]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#3b82f6]/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#3b82f6]/10 to-transparent" />
          {/* Wrench / pipe decorative SVG */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.04]" viewBox="0 0 1000 400">
            <path d="M100 200 L300 200 L300 150 L400 150 L400 250 L300 250 L300 200" stroke="#3b82f6" strokeWidth="1" fill="none" />
            <path d="M600 200 L800 200 L800 150 L900 150 L900 250 L800 250 L800 200" stroke="#3b82f6" strokeWidth="0.8" fill="none" />
            <circle cx="500" cy="200" r="40" stroke="#3b82f6" strokeWidth="0.5" fill="none" />
            <circle cx="500" cy="200" r="70" stroke="#3b82f6" strokeWidth="0.3" fill="none" />
            <path d="M480 180 L520 220 M520 180 L480 220" stroke="#3b82f6" strokeWidth="0.5" />
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
              WHY SEATTLE TRUSTS <span className="text-[#3b82f6]">EMERALD CITY PLUMBING</span>
            </h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <ShieldCheckIcon />, title: "Licensed Pros", desc: "Every technician is WA State licensed with 5+ years of field experience" },
              { icon: <ClockIcon />, title: "60-Min Guarantee", desc: "If we are not there in 60 minutes, the service call fee is waived" },
              { icon: <DollarIcon />, title: "No Surprise Bills", desc: "Flat-rate pricing locked in writing before a single wrench turns" },
              { icon: <CheckCircleIcon />, title: "100% Guaranteed", desc: "Not happy? We come back and make it right at no additional charge" },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group text-center p-6 rounded-2xl border border-white/[0.06] hover:border-[#3b82f6]/30 bg-white/[0.02] transition-all duration-500"
              >
                <div className="w-14 h-14 mx-auto rounded-xl bg-[#3b82f6]/10 border border-[#3b82f6]/20 flex items-center justify-center text-[#3b82f6] mb-4 group-hover:bg-[#3b82f6]/20 group-hover:scale-110 transition-all duration-300">
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
        style={{ background: "linear-gradient(180deg, #080e18 0%, #0c1525 50%, #080e18 100%)" }}
      >
        <PipeGridPattern />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[30%] left-[40%] w-[600px] h-[400px] rounded-full blur-[180px] bg-[#3b82f6]/5" />
          {/* Decorative water ripple circles */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.025]" viewBox="0 0 800 400">
            <circle cx="400" cy="200" r="100" stroke="#3b82f6" strokeWidth="0.5" fill="none" />
            <circle cx="400" cy="200" r="180" stroke="#3b82f6" strokeWidth="0.3" fill="none" />
            <circle cx="400" cy="200" r="260" stroke="#3b82f6" strokeWidth="0.2" fill="none" />
          </svg>
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="REAL REVIEWS"
            title="Trusted by Thousands"
            highlightWord="Thousands"
            subtitle="Real stories from real homeowners across the Seattle area who called us in their time of need."
          />
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative p-7 rounded-2xl border border-white/[0.06] hover:border-[#3b82f6]/30 transition-all duration-500 overflow-hidden bg-white/[0.02]"
              >
                {/* Top accent line */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-[#3b82f6]/40 via-[#3b82f6]/10 to-transparent" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_0%_0%,#3b82f610,transparent_70%)]" />
                <div className="relative z-10">
                  {/* Job type tag */}
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#3b82f6]/70 bg-[#3b82f6]/8 border border-[#3b82f6]/10 px-2.5 py-1 rounded-full">
                    {t.jobType}
                  </span>
                  {/* Stars */}
                  <div className="flex items-center gap-0.5 text-[#3b82f6] mt-4 mb-4">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <StarIcon key={j} />
                    ))}
                  </div>
                  {/* Quote */}
                  <p className="text-muted leading-relaxed mb-6 text-sm">&ldquo;{t.text}&rdquo;</p>
                  {/* Author */}
                  <div className="flex items-center gap-3 pt-4 border-t border-white/[0.06]">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#3b82f6]/30 to-[#3b82f6]/10 flex items-center justify-center text-sm font-bold text-[#3b82f6]">
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

      {/* ════════════════ Service Area ════════════════ */}
      <section
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0a1220 0%, #0d1628 50%, #0a1220 100%)" }}
      >
        <WaterDropPattern opacity={0.03} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[30%] right-[10%] w-[500px] h-[500px] rounded-full blur-[180px] bg-[#3b82f6]/5" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="WHERE WE WORK"
            title="Our Service Area"
            highlightWord="Service Area"
            subtitle="Proudly serving the greater Seattle metro area and surrounding communities with fast, reliable plumbing service."
          />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative p-8 md:p-12 rounded-2xl border border-[#3b82f6]/15 bg-gradient-to-b from-[#3b82f6]/[0.04] to-transparent overflow-hidden"
          >
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,#3b82f610,transparent_60%)]" />
            <div className="relative z-10">
              <div className="flex items-center justify-center gap-2 mb-8">
                <span className="text-[#3b82f6]"><MapPinIcon /></span>
                <span className="text-white font-bold text-lg">Greater Seattle Metro Area</span>
              </div>
              <div className="flex flex-wrap justify-center gap-3">
                {serviceAreas.map((area, i) => (
                  <motion.span
                    key={area}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.03 }}
                    className="px-4 py-2 rounded-full text-sm font-medium bg-white/[0.04] border border-white/[0.08] hover:border-[#3b82f6]/30 hover:bg-[#3b82f6]/10 transition-all duration-300 text-white/70 hover:text-white"
                  >
                    {area}
                  </motion.span>
                ))}
              </div>
              <p className="text-center text-muted text-sm mt-8">
                Don&apos;t see your area? Call us at <span className="text-[#3b82f6] font-bold">(206) 555-0102</span> &mdash; we may still be able to help.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ════════════════ FAQ ════════════════ */}
      <section
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #080e18 0%, #0c1525 50%, #080e18 100%)" }}
      >
        <PipeGridPattern />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] left-[10%] w-[400px] h-[400px] rounded-full blur-[140px] bg-[#3b82f6]/5" />
          <div className="absolute bottom-[15%] right-[10%] w-[350px] h-[350px] rounded-full blur-[120px] bg-[#3b82f6]/4" />
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
                className="group p-6 rounded-2xl border border-white/[0.06] hover:border-[#3b82f6]/20 transition-all duration-500 overflow-hidden relative bg-white/[0.02]"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_0%_50%,#3b82f610,transparent_70%)]" />
                <div className="relative z-10 flex gap-4">
                  <div className="w-8 h-8 shrink-0 rounded-lg bg-[#3b82f6]/10 border border-[#3b82f6]/20 flex items-center justify-center text-[#3b82f6] text-xs font-bold mt-0.5">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div>
                    <h3 className="font-bold mb-2 text-white group-hover:text-[#3b82f6] transition-colors duration-300">{faq.q}</h3>
                    <p className="text-muted text-sm leading-relaxed">{faq.a}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ Free Estimate Form ════════════════ */}
      <section
        id="contact"
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0a1220 0%, #0f1a30 50%, #0a1220 100%)" }}
      >
        <WaterDropPattern opacity={0.02} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-[200px] bg-[#3b82f6]/6" />
        </div>
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-8 md:p-12 rounded-2xl border border-[#3b82f6]/20 relative overflow-hidden bg-gradient-to-b from-[#3b82f6]/[0.06] to-transparent"
          >
            {/* Inner glow */}
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,#3b82f615,transparent_60%)]" />
            {/* Corner decorations */}
            <div className="absolute top-0 left-0 w-20 h-20 border-t border-l border-[#3b82f6]/30 rounded-tl-2xl" />
            <div className="absolute bottom-0 right-0 w-20 h-20 border-b border-r border-[#3b82f6]/30 rounded-br-2xl" />
            <div className="relative z-10">
              <div className="text-center mb-8">
                <span className="inline-flex items-center gap-2 bg-[#3b82f6]/10 text-[#3b82f6] text-xs font-bold uppercase tracking-[0.2em] px-4 py-2 rounded-full mb-4 border border-[#3b82f6]/20">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  FREE &mdash; NO OBLIGATION
                </span>
                <h2 className="text-3xl md:text-4xl font-extrabold mb-3">
                  Get Your Free <span className="text-[#3b82f6]">Estimate</span>
                </h2>
                <p className="text-muted max-w-lg mx-auto">
                  Tell us about your plumbing issue. We respond within 1 hour during business hours and provide a detailed, no-obligation quote.
                </p>
              </div>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Your Name"
                    className="w-full h-13 px-5 rounded-xl bg-white/5 border border-[#3b82f6]/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#3b82f6]/50 transition-colors"
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    className="w-full h-13 px-5 rounded-xl bg-white/5 border border-[#3b82f6]/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#3b82f6]/50 transition-colors"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    className="w-full h-13 px-5 rounded-xl bg-white/5 border border-[#3b82f6]/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#3b82f6]/50 transition-colors"
                  />
                  <select
                    className="w-full h-13 px-5 rounded-xl bg-white/5 border border-[#3b82f6]/15 text-white/50 text-sm focus:outline-none focus:border-[#3b82f6]/50 transition-colors appearance-none"
                  >
                    <option value="">Select Service Needed</option>
                    <option value="emergency">Emergency Plumbing</option>
                    <option value="drain">Drain Cleaning</option>
                    <option value="waterheater">Water Heater</option>
                    <option value="remodel">Bathroom Remodel</option>
                    <option value="sewer">Sewer Line</option>
                    <option value="leak">Leak Detection</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <textarea
                  placeholder="Describe your plumbing issue..."
                  rows={4}
                  className="w-full px-5 py-4 rounded-xl bg-white/5 border border-[#3b82f6]/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#3b82f6]/50 resize-none transition-colors"
                />
                <button
                  type="button"
                  className="w-full h-14 rounded-xl bg-gradient-to-r from-[#3b82f6] to-[#2563eb] text-white font-bold text-lg hover:from-[#60a5fa] hover:to-[#3b82f6] transition-all duration-300 shadow-lg shadow-[#3b82f6]/20"
                >
                  Request Free Estimate
                </button>
                <p className="text-center text-white/30 text-xs">
                  Or call us directly at <span className="text-[#3b82f6] font-semibold">(206) 555-0102</span> for immediate assistance. Available 24/7.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ════════════════ Final CTA ════════════════ */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#3b82f6]/10 via-[#3b82f6]/5 to-[#080e18]" />
        <PipeGridPattern opacity={0.03} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#3b82f6]/30 to-transparent" />
          <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full blur-[180px] bg-[#3b82f6]/8" />
        </div>
        <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block text-[#3b82f6] text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border border-[#3b82f6]/20 bg-[#3b82f6]/5">
              DON&apos;T WAIT FOR WATER DAMAGE
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold mb-4 tracking-tight">
              Plumbing Emergency? <span className="text-[#3b82f6]">We&apos;re On Our Way.</span>
            </h2>
            <p className="text-muted text-lg mb-10 max-w-xl mx-auto leading-relaxed">
              Every minute counts when pipes burst. Our emergency crews are standing by 24/7, 365 days a year. One call and we are on the road.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#contact"
                className="group inline-flex h-14 px-10 rounded-full bg-gradient-to-r from-[#3b82f6] to-[#2563eb] text-white font-bold items-center justify-center text-lg hover:from-[#60a5fa] hover:to-[#3b82f6] transition-all duration-300 shadow-lg shadow-[#3b82f6]/25 gap-2"
              >
                <span>Free Estimate</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:translate-x-1 transition-transform">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
              <a
                href="tel:2065550102"
                className="inline-flex h-14 px-10 rounded-full border-2 border-[#3b82f6]/30 text-[#3b82f6] font-bold items-center justify-center text-lg hover:bg-[#3b82f6]/10 hover:border-[#3b82f6]/50 transition-all duration-300 gap-2"
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
