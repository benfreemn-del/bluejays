"use client";

/* eslint-disable @next/next/no-img-element -- These static marketing and preview components intentionally use plain img tags to preserve existing markup and visual behavior during lint-only cleanup. */

import { motion } from "framer-motion";
import TemplateLayout from "./TemplateLayout";

/* ───────────────────────── SVG Icons ───────────────────────── */

const LightningBoltIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M13 2L4.09 12.63a1 1 0 00.78 1.62H11l-1 7.75L19.91 11.37a1 1 0 00-.78-1.62H13l1-7.75z" />
  </svg>
);

const WireIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M4 12h3c1 0 1.5-3 3-3s2 6 4 6 2-3 3-3h3" />
    <circle cx="2" cy="12" r="1.5" />
    <circle cx="22" cy="12" r="1.5" />
  </svg>
);

const OutletIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <rect x="4" y="3" width="16" height="18" rx="3" />
    <circle cx="9.5" cy="10" r="1.2" />
    <circle cx="14.5" cy="10" r="1.2" />
    <path d="M10 15h4" strokeLinecap="round" />
  </svg>
);

const PanelIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <rect x="4" y="2" width="16" height="20" rx="2" />
    <path d="M4 7h16M4 12h16M4 17h16" />
    <circle cx="8" cy="9.5" r="0.8" fill="currentColor" />
    <circle cx="8" cy="14.5" r="0.8" fill="currentColor" />
    <circle cx="8" cy="19.5" r="0.8" fill="currentColor" />
  </svg>
);

const EVChargerIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <rect x="3" y="4" width="12" height="16" rx="2" />
    <path d="M7 12h4M9 10v4" />
    <path d="M15 8h2a2 2 0 012 2v4a2 2 0 01-2 2h-2" />
    <path d="M19 11v2" />
    <path d="M6 4V2M12 4V2" />
  </svg>
);

const LightBulbIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M9 21h6M12 3a6 6 0 014 10.47V17a1 1 0 01-1 1H9a1 1 0 01-1-1v-3.53A6 6 0 0112 3z" />
    <path d="M9.5 14h5" />
  </svg>
);

const ShieldBadgeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
    <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
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

const CertificateIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
    <path d="M12 15l-3 5 1-3.5L7 16l2.5-1L7 12.5 12 15zm0 0l3 5-1-3.5L17 16l-2.5-1L17 12.5 12 15z" />
    <circle cx="12" cy="9" r="6" />
    <path d="M9 9l2 2 4-4" />
  </svg>
);

/* ───────────────────────── Circuit Board Pattern ───────────────────────── */

const CircuitPattern = ({ opacity = 0.03 }: { opacity?: number }) => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }}>
    <defs>
      <pattern id="circuitGrid" width="80" height="80" patternUnits="userSpaceOnUse">
        <path d="M 0 40 L 20 40 L 20 20 L 40 20" fill="none" stroke="#f59e0b" strokeWidth="0.5" />
        <path d="M 40 0 L 40 20 L 60 20 L 60 40 L 80 40" fill="none" stroke="#f59e0b" strokeWidth="0.5" />
        <path d="M 40 80 L 40 60 L 60 60 L 60 40" fill="none" stroke="#f59e0b" strokeWidth="0.5" />
        <path d="M 0 60 L 20 60 L 20 80" fill="none" stroke="#f59e0b" strokeWidth="0.5" />
        <circle cx="20" cy="20" r="2" fill="#f59e0b" opacity="0.4" />
        <circle cx="60" cy="40" r="2" fill="#f59e0b" opacity="0.4" />
        <circle cx="40" cy="60" r="1.5" fill="#f59e0b" opacity="0.3" />
        <circle cx="20" cy="60" r="1.5" fill="#f59e0b" opacity="0.3" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#circuitGrid)" />
  </svg>
);

/* Lightning Bolt Background Outlines */
const LightningBackground = ({ opacity = 0.03 }: { opacity?: number }) => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }} viewBox="0 0 1000 600" preserveAspectRatio="none">
    <path d="M150 0 L100 250 L180 250 L80 600" stroke="#f59e0b" strokeWidth="2" fill="none" />
    <path d="M850 0 L900 250 L820 250 L920 600" stroke="#f59e0b" strokeWidth="1.5" fill="none" />
    <path d="M500 0 L470 200 L530 200 L460 500" stroke="#f59e0b" strokeWidth="1" fill="none" />
  </svg>
);

/* ───────────────────────── Data ───────────────────────── */

const services = [
  {
    name: "Residential Wiring",
    desc: "Full-home rewiring, new construction wiring, and circuit additions. We bring your home up to code with meticulous craftsmanship.",
    icon: <WireIcon />,
    tags: ["Rewiring", "New Construction", "Code Compliance"],
  },
  {
    name: "Panel Upgrades",
    desc: "Upgrade aging fuse boxes to modern breaker panels. Increase capacity safely for today&apos;s power demands.",
    icon: <PanelIcon />,
    tags: ["200 Amp", "Breaker Panels", "Fuse Replacement"],
  },
  {
    name: "EV Charger Install",
    desc: "Level 2 home charging stations installed fast and to code. Power your electric vehicle from the comfort of your garage.",
    icon: <EVChargerIcon />,
    tags: ["Level 2", "Tesla", "Home Charging"],
  },
  {
    name: "Commercial Electric",
    desc: "Office build-outs, retail lighting, industrial wiring. Scalable electrical solutions for businesses of every size.",
    icon: <LightningBoltIcon />,
    tags: ["Office Build-Out", "Industrial", "Retail"],
  },
  {
    name: "Emergency Service",
    desc: "Power outages, sparking outlets, tripped breakers at 2 AM. Our emergency crew responds fast, 24 hours a day, 7 days a week.",
    icon: <OutletIcon />,
    tags: ["24/7 Response", "Power Outage", "Urgent Repair"],
  },
  {
    name: "Landscape Lighting",
    desc: "Architectural accent lighting, pathway illumination, and outdoor entertaining setups that transform your property after dark.",
    icon: <LightBulbIcon />,
    tags: ["LED Design", "Pathways", "Accent Lighting"],
  },
];

const teamMembers = [
  {
    name: "Ryan Mitchell",
    title: "Owner / Master Electrician",
    image: "https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=400&q=80",
    specialties: ["Residential", "Panel Upgrades"],
    yearsExp: 18,
  },
  {
    name: "David Park",
    title: "Lead Journeyman",
    image: "https://images.unsplash.com/photo-1463453091185-61582044d556?w=400&q=80",
    specialties: ["Commercial", "EV Chargers"],
    yearsExp: 12,
  },
  {
    name: "Carlos Mendez",
    title: "Senior Electrician",
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80",
    specialties: ["Emergency Service", "Lighting"],
    yearsExp: 9,
  },
];

const testimonials = [
  {
    name: "Sarah K.",
    text: "They upgraded our entire panel in one day. Showed up on time, explained everything, and left the place spotless. Best electricians we have ever hired.",
    serviceType: "Panel Upgrade",
    rating: 5,
  },
  {
    name: "Mike T.",
    text: "Had a power outage at midnight and they were at my door within 45 minutes. Fixed the issue fast and the price was more than fair. True professionals.",
    serviceType: "Emergency Service",
    rating: 5,
  },
  {
    name: "Jennifer & Dan L.",
    text: "Cascade Electric installed our Tesla charger and rewired our garage. The work was flawless and they handled the permit. Could not recommend them more.",
    serviceType: "EV Charger Install",
    rating: 5,
  },
];

const faqs = [
  {
    q: "How much does it cost to upgrade an electrical panel?",
    a: "Panel upgrades typically range from $1,500 to $4,000 depending on the amperage and complexity. We provide free on-site estimates so you know the exact cost upfront with no surprises.",
  },
  {
    q: "Do you handle permits and inspections?",
    a: "Absolutely. We pull all required permits and schedule city inspections as part of every job. You never have to worry about code compliance when Cascade Electric is on the job.",
  },
  {
    q: "How fast can you respond to an emergency?",
    a: "Our emergency team typically arrives within 60 minutes for urgent calls in the greater Seattle area. We are available 24 hours a day, 7 days a week, 365 days a year.",
  },
  {
    q: "Are your electricians licensed and insured?",
    a: "Every technician on our team holds a valid Washington State Journeyman or Master Electrician license. We carry full liability insurance and bonding for your protection.",
  },
  {
    q: "Can you install an EV charger at my home?",
    a: "Yes. We are certified installers for all major EV charger brands including Tesla, ChargePoint, and JuiceBox. We handle everything from the panel assessment to the final installation.",
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
        className="inline-block text-[#f59e0b] text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border border-[#f59e0b]/20 bg-[#f59e0b]/5"
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
        <span className="text-[#f59e0b]">{highlightWord}</span>
        {parts[1] || ""}
      </motion.h2>
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className={`h-0.5 w-16 bg-gradient-to-r from-[#f59e0b] to-transparent mt-4 ${center ? "mx-auto" : ""}`}
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

export default function ElectricianTemplate() {
  return (
    <TemplateLayout
      businessName="Cascade Electric Co."
      tagline="Licensed master electricians delivering safe, reliable power to Seattle homes and businesses."
      accentColor="#f59e0b"
      accentColorLight="#fbbf24"
      heroGradient="linear-gradient(135deg, #1a1408 0%, #0f0d08 100%)"
      heroImage="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=1400&q=80"
      phone="(206) 555-0103"
      address="Seattle, WA"
    >
      {/* ════════════════ Emergency Banner ════════════════ */}
      <section className="py-3 bg-gradient-to-r from-[#f59e0b] via-[#d97706] to-[#f59e0b] text-black relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9Im5vbmUiLz48cGF0aCBkPSJNMCAwTDQwIDQwTTQwIDBMMCA0MCIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjAuMyIgb3BhY2l0eT0iMC4wOCIvPjwvc3ZnPg==')] opacity-40" />
        <div className="max-w-6xl mx-auto px-6 flex flex-wrap items-center justify-center gap-6 relative z-10">
          <div className="flex items-center gap-3">
            <LightningBoltIcon />
            <p className="text-sm font-bold tracking-wide">24/7 EMERGENCY SERVICE &mdash; CALL NOW</p>
          </div>
          <a
            href="tel:2065550103"
            className="flex items-center gap-2 bg-black/15 backdrop-blur-sm px-5 py-2 rounded-full border border-black/20 hover:bg-black/25 transition-colors"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-600 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-700" />
            </span>
            <span className="text-xs font-bold tracking-wider">(206) 555-0103</span>
          </a>
        </div>
      </section>

      {/* ════════════════ Stats Banner ════════════════ */}
      <section className="py-12 relative overflow-hidden bg-[#0c0a06] border-b border-[#f59e0b]/10">
        <CircuitPattern opacity={0.02} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] rounded-full blur-[180px] bg-[#f59e0b]/5" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "2,000+", label: "Jobs Completed", icon: <LightningBoltIcon /> },
              { value: "15+", label: "Years Experience", icon: <ClockIcon /> },
              { value: "24/7", label: "Available", icon: <PhoneIcon /> },
              { value: "5.0", label: "Star Rating", icon: <StarIcon /> },
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
                  <span className="text-[#f59e0b]">{stat.icon}</span>
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
        style={{ background: "linear-gradient(180deg, #0a0906 0%, #100d06 50%, #0a0906 100%)" }}
      >
        <CircuitPattern />
        <LightningBackground opacity={0.025} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[10%] right-[5%] w-[500px] h-[500px] rounded-full blur-[160px] bg-[#f59e0b]/6" />
          <div className="absolute bottom-[10%] left-[5%] w-[400px] h-[400px] rounded-full blur-[140px] bg-[#f59e0b]/4" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="OUR SERVICES"
            title="Electrical Services"
            highlightWord="Services"
            subtitle="From residential rewiring to commercial build-outs, our master electricians deliver safe, code-compliant work every time."
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, i) => (
              <motion.div
                key={service.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group relative p-7 rounded-2xl border border-white/[0.06] hover:border-[#f59e0b]/30 transition-all duration-500 overflow-hidden bg-white/[0.02]"
              >
                {/* Hover glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,#f59e0b15,transparent_70%)]" />
                {/* Top accent line */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#f59e0b]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  {/* Number + Icon row */}
                  <div className="flex items-start justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl bg-[#f59e0b]/10 border border-[#f59e0b]/20 flex items-center justify-center text-[#f59e0b] group-hover:bg-[#f59e0b]/20 group-hover:border-[#f59e0b]/40 transition-all duration-300">
                      {service.icon}
                    </div>
                    <span className="text-4xl font-extrabold text-white/[0.04] group-hover:text-[#f59e0b]/10 transition-colors duration-300 leading-none">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold mb-3 group-hover:text-[#f59e0b] transition-colors duration-300">{service.name}</h3>
                  <p className="text-muted text-sm leading-relaxed mb-5">{service.desc}</p>
                  {/* Feature tags */}
                  <div className="flex flex-wrap gap-2">
                    {service.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-semibold uppercase tracking-wider text-[#f59e0b]/70 bg-[#f59e0b]/8 border border-[#f59e0b]/10 px-2.5 py-1 rounded-full"
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

      {/* ════════════════ Why Choose Us ════════════════ */}
      <section
        id="about"
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0f0d06 0%, #110e06 50%, #0f0d06 100%)" }}
      >
        <CircuitPattern opacity={0.025} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] left-[5%] w-[500px] h-[500px] rounded-full blur-[160px] bg-[#f59e0b]/5" />
          <div className="absolute bottom-[10%] right-[10%] w-[350px] h-[350px] rounded-full blur-[140px] bg-[#f59e0b]/4" />
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
                    src="https://images.unsplash.com/photo-1551218808-94e220e084d2?w=600&q=80"
                    alt="Electrician at work"
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Secondary image */}
                <div className="absolute bottom-0 right-0 w-[65%] h-[55%] rounded-2xl overflow-hidden border-2 border-white/[0.06] shadow-2xl z-20">
                  <img
                    src="https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=400&q=80"
                    alt="Electrical panel"
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Accent badge */}
                <div className="absolute top-[55%] left-[60%] z-30 bg-[#f59e0b] rounded-2xl px-5 py-4 shadow-xl shadow-[#f59e0b]/20 border border-[#fbbf24]/30">
                  <span className="block text-3xl font-extrabold text-black leading-none">15+</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-black/70">Years of<br />Excellence</span>
                </div>
                {/* Decorative corner lines */}
                <div className="absolute -top-3 -left-3 w-16 h-16 border-t-2 border-l-2 border-[#f59e0b]/20 rounded-tl-xl" />
                <div className="absolute -bottom-3 -right-3 w-16 h-16 border-b-2 border-r-2 border-[#f59e0b]/20 rounded-br-xl" />
              </div>
            </motion.div>

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <SectionHeader
                tag="WHY CHOOSE US"
                title="Power You Can Trust"
                highlightWord="Trust"
                center={false}
              />
              <p className="text-muted leading-relaxed mb-6 text-lg -mt-8">
                At Cascade Electric Co., every job gets the attention of a master electrician. We do not cut corners and we never leave a job site until the work meets our exacting standards.
              </p>
              <p className="text-muted leading-relaxed mb-8">
                From a single outlet repair to a full commercial build-out, our crew treats your property with respect and your electrical system with precision. Licensed, bonded, and insured &mdash; we stand behind every wire we pull.
              </p>
              {/* Feature list */}
              <div className="space-y-4">
                {[
                  { icon: <ShieldBadgeIcon />, title: "Licensed & Bonded", desc: "Full WA State licensing with comprehensive liability coverage" },
                  { icon: <CertificateIcon />, title: "Master Electrician", desc: "Owner-operated by a certified Master Electrician since 2011" },
                  { icon: <PhoneIcon />, title: "24/7 Emergency", desc: "Round-the-clock emergency response across greater Seattle" },
                ].map((feature) => (
                  <div key={feature.title} className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-[#f59e0b]/20 transition-colors duration-300">
                    <div className="w-10 h-10 rounded-lg bg-[#f59e0b]/10 border border-[#f59e0b]/20 flex items-center justify-center text-[#f59e0b] shrink-0">
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

      {/* ════════════════ Trust Badges Banner ════════════════ */}
      <section className="py-20 relative overflow-hidden bg-gradient-to-b from-[#f59e0b]/10 to-[#0a0906]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#f59e0b]/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#f59e0b]/10 to-transparent" />
          {/* Lightning silhouette background */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.04]" viewBox="0 0 1000 400">
            <path d="M200 0 L170 160 L230 160 L150 400" stroke="#f59e0b" strokeWidth="2" fill="none" />
            <path d="M800 0 L830 160 L770 160 L850 400" stroke="#f59e0b" strokeWidth="1.5" fill="none" />
            <path d="M0 200 Q250 100 500 200 Q750 300 1000 200" stroke="#f59e0b" strokeWidth="0.5" fill="none" />
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
              TRUSTED BY <span className="text-[#f59e0b]">HOMEOWNERS</span>
            </h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <ShieldBadgeIcon />, title: "Licensed & Bonded", desc: "WA State licensed with full liability insurance and bonding for your protection" },
              { icon: <CertificateIcon />, title: "Master Electrician", desc: "Every job overseen by a certified Master Electrician with 15+ years" },
              { icon: <ClockIcon />, title: "24/7 Emergency", desc: "Around-the-clock emergency response for urgent electrical issues" },
              { icon: <CheckCircleIcon />, title: "Satisfaction Guaranteed", desc: "We stand behind every job. Not satisfied? We make it right, period." },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group text-center p-6 rounded-2xl border border-white/[0.06] hover:border-[#f59e0b]/30 bg-white/[0.02] transition-all duration-500"
              >
                <div className="w-14 h-14 mx-auto rounded-xl bg-[#f59e0b]/10 border border-[#f59e0b]/20 flex items-center justify-center text-[#f59e0b] mb-4 group-hover:bg-[#f59e0b]/20 group-hover:scale-110 transition-all duration-300">
                  {item.icon}
                </div>
                <h4 className="font-bold mb-2">{item.title}</h4>
                <p className="text-muted text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ Team ════════════════ */}
      <section
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0a0906 0%, #0d0b06 50%, #0a0906 100%)" }}
      >
        <CircuitPattern opacity={0.025} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] right-[10%] w-[500px] h-[500px] rounded-full blur-[180px] bg-[#f59e0b]/5" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="OUR TEAM"
            title="Meet Your Electricians"
            highlightWord="Electricians"
            subtitle="A crew of licensed professionals who take pride in delivering safe, clean, code-compliant electrical work."
          />
          <div className="grid md:grid-cols-3 gap-8">
            {teamMembers.map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="group relative rounded-2xl border border-white/[0.06] hover:border-[#f59e0b]/30 transition-all duration-500 overflow-hidden bg-white/[0.02]"
              >
                {/* Photo */}
                <div className="relative aspect-[3/4] overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0906] via-[#0a0906]/30 to-transparent" />
                  {/* Years badge */}
                  <div className="absolute top-4 right-4 bg-[#f59e0b]/90 backdrop-blur-sm text-black text-xs font-bold px-3 py-1.5 rounded-full border border-[#fbbf24]/30">
                    {member.yearsExp}+ YRS
                  </div>
                  {/* Info overlay at bottom */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                    <p className="text-[#f59e0b] text-sm font-semibold mb-3">{member.title}</p>
                    <div className="flex flex-wrap gap-2">
                      {member.specialties.map((s) => (
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

      {/* ════════════════ Testimonials ════════════════ */}
      <section
        id="testimonials"
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0f0d06 0%, #120f06 50%, #0f0d06 100%)" }}
      >
        <CircuitPattern />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[30%] left-[40%] w-[600px] h-[400px] rounded-full blur-[180px] bg-[#f59e0b]/5" />
          <svg className="absolute inset-0 w-full h-full opacity-[0.025]" viewBox="0 0 800 400">
            <circle cx="400" cy="200" r="100" stroke="#f59e0b" strokeWidth="0.5" fill="none" />
            <circle cx="400" cy="200" r="180" stroke="#f59e0b" strokeWidth="0.3" fill="none" />
            <circle cx="400" cy="200" r="260" stroke="#f59e0b" strokeWidth="0.2" fill="none" />
          </svg>
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="CLIENT TESTIMONIALS"
            title="Trusted by Homeowners"
            highlightWord="Homeowners"
            subtitle="Real reviews from real customers who trust Cascade Electric with their homes and businesses."
          />
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative p-7 rounded-2xl border border-white/[0.06] hover:border-[#f59e0b]/30 transition-all duration-500 overflow-hidden bg-white/[0.02]"
              >
                {/* Top accent line */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-[#f59e0b]/40 via-[#f59e0b]/10 to-transparent" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_0%_0%,#f59e0b10,transparent_70%)]" />
                <div className="relative z-10">
                  {/* Service type tag */}
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#f59e0b]/70 bg-[#f59e0b]/8 border border-[#f59e0b]/10 px-2.5 py-1 rounded-full">
                    {t.serviceType}
                  </span>
                  {/* Stars */}
                  <div className="flex items-center gap-0.5 text-[#f59e0b] mt-4 mb-4">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <StarIcon key={j} />
                    ))}
                  </div>
                  {/* Quote */}
                  <p className="text-muted leading-relaxed mb-6 text-sm">&ldquo;{t.text}&rdquo;</p>
                  {/* Author */}
                  <div className="flex items-center gap-3 pt-4 border-t border-white/[0.06]">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#f59e0b]/30 to-[#f59e0b]/10 flex items-center justify-center text-sm font-bold text-[#f59e0b]">
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

      {/* ════════════════ Get a Free Estimate Form ════════════════ */}
      <section
        id="contact"
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0a0906 0%, #100e06 50%, #0a0906 100%)" }}
      >
        <CircuitPattern opacity={0.02} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-[200px] bg-[#f59e0b]/6" />
        </div>
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-8 md:p-12 rounded-2xl border border-[#f59e0b]/20 relative overflow-hidden bg-gradient-to-b from-[#f59e0b]/[0.06] to-transparent"
          >
            {/* Inner glow */}
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,#f59e0b15,transparent_60%)]" />
            {/* Corner decorations */}
            <div className="absolute top-0 left-0 w-20 h-20 border-t border-l border-[#f59e0b]/30 rounded-tl-2xl" />
            <div className="absolute bottom-0 right-0 w-20 h-20 border-b border-r border-[#f59e0b]/30 rounded-br-2xl" />
            <div className="relative z-10">
              <div className="text-center mb-8">
                <span className="inline-flex items-center gap-2 bg-[#f59e0b]/10 text-[#f59e0b] text-xs font-bold uppercase tracking-[0.2em] px-4 py-2 rounded-full mb-4 border border-[#f59e0b]/20">
                  <LightningBoltIcon />
                  FREE ESTIMATE
                </span>
                <h2 className="text-3xl md:text-4xl font-extrabold mb-3">
                  Get a Free <span className="text-[#f59e0b]">Estimate</span>
                </h2>
                <p className="text-muted max-w-lg mx-auto">
                  Tell us about your electrical project. We respond within 2 hours during business hours and provide upfront pricing with no hidden fees.
                </p>
              </div>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Your Name"
                    className="w-full h-13 px-5 rounded-xl bg-white/5 border border-[#f59e0b]/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#f59e0b]/50 transition-colors"
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    className="w-full h-13 px-5 rounded-xl bg-white/5 border border-[#f59e0b]/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#f59e0b]/50 transition-colors"
                  />
                </div>
                <input
                  type="tel"
                  placeholder="Phone Number"
                  className="w-full h-13 px-5 rounded-xl bg-white/5 border border-[#f59e0b]/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#f59e0b]/50 transition-colors"
                />
                <select className="w-full h-13 px-5 rounded-xl bg-white/5 border border-[#f59e0b]/15 text-white/50 text-sm focus:outline-none focus:border-[#f59e0b]/50 transition-colors appearance-none">
                  <option value="">Select Service Needed</option>
                  <option value="residential">Residential Wiring</option>
                  <option value="panel">Panel Upgrade</option>
                  <option value="ev">EV Charger Install</option>
                  <option value="commercial">Commercial Electric</option>
                  <option value="emergency">Emergency Service</option>
                  <option value="lighting">Landscape Lighting</option>
                  <option value="other">Other</option>
                </select>
                <textarea
                  placeholder="Describe your electrical project or issue..."
                  rows={4}
                  className="w-full px-5 py-4 rounded-xl bg-white/5 border border-[#f59e0b]/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#f59e0b]/50 resize-none transition-colors"
                />
                <button
                  type="button"
                  className="w-full h-14 rounded-xl bg-gradient-to-r from-[#f59e0b] to-[#d97706] text-black font-bold text-lg hover:from-[#fbbf24] hover:to-[#f59e0b] transition-all duration-300 shadow-lg shadow-[#f59e0b]/20"
                >
                  Request Free Estimate
                </button>
                <p className="text-center text-white/30 text-xs">
                  Your information is never shared. We respond within 2 business hours.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ════════════════ FAQ ════════════════ */}
      <section
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0f0d06 0%, #120f06 50%, #0f0d06 100%)" }}
      >
        <CircuitPattern />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] left-[10%] w-[400px] h-[400px] rounded-full blur-[140px] bg-[#f59e0b]/5" />
          <div className="absolute bottom-[15%] right-[10%] w-[350px] h-[350px] rounded-full blur-[120px] bg-[#f59e0b]/4" />
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
                className="group p-6 rounded-2xl border border-white/[0.06] hover:border-[#f59e0b]/20 transition-all duration-500 overflow-hidden relative bg-white/[0.02]"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_0%_50%,#f59e0b10,transparent_70%)]" />
                <div className="relative z-10 flex gap-4">
                  <div className="w-8 h-8 shrink-0 rounded-lg bg-[#f59e0b]/10 border border-[#f59e0b]/20 flex items-center justify-center text-[#f59e0b] text-xs font-bold mt-0.5">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div>
                    <h3 className="font-bold mb-2 text-white group-hover:text-[#f59e0b] transition-colors duration-300">{faq.q}</h3>
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
        <div className="absolute inset-0 bg-gradient-to-b from-[#f59e0b]/10 via-[#f59e0b]/5 to-[#0a0906]" />
        <CircuitPattern opacity={0.03} />
        <LightningBackground opacity={0.04} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#f59e0b]/30 to-transparent" />
          <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full blur-[180px] bg-[#f59e0b]/8" />
        </div>
        <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block text-[#f59e0b] text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border border-[#f59e0b]/20 bg-[#f59e0b]/5">
              GET STARTED TODAY
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold mb-4 tracking-tight">
              Power Up Your <span className="text-[#f59e0b]">Property</span>
            </h2>
            <p className="text-muted text-lg mb-10 max-w-xl mx-auto leading-relaxed">
              Whether it is a panel upgrade, EV charger, or a 2 AM emergency, Cascade Electric has you covered. Get your free estimate today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#contact"
                className="group inline-flex h-14 px-10 rounded-full bg-gradient-to-r from-[#f59e0b] to-[#d97706] text-black font-bold items-center justify-center text-lg hover:from-[#fbbf24] hover:to-[#f59e0b] transition-all duration-300 shadow-lg shadow-[#f59e0b]/25 gap-2"
              >
                <span>Free Estimate</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:translate-x-1 transition-transform">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
              <a
                href="tel:2065550103"
                className="inline-flex h-14 px-10 rounded-full border-2 border-[#f59e0b]/30 text-[#f59e0b] font-bold items-center justify-center text-lg hover:bg-[#f59e0b]/10 hover:border-[#f59e0b]/50 transition-all duration-300 gap-2"
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
