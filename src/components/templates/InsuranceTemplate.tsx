"use client";

import { motion } from "framer-motion";
import TemplateLayout from "./TemplateLayout";

/* ───────────────────────── SVG Icons ───────────────────────── */

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const UmbrellaIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M23 12a11 11 0 00-22 0" />
    <path d="M12 12v9a2 2 0 004 0" />
    <line x1="12" y1="1" x2="12" y2="3" />
  </svg>
);

const FamilyIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <circle cx="9" cy="7" r="3" />
    <circle cx="17" cy="9" r="2.5" />
    <path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" />
    <path d="M21 21v-1.5a3 3 0 00-3-3h-1" />
  </svg>
);

const CarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M5 17h14M5 17a2 2 0 01-2-2V9a2 2 0 012-2h1l2-3h8l2 3h1a2 2 0 012 2v6a2 2 0 01-2 2M5 17a2 2 0 100 4 2 2 0 000-4zm14 0a2 2 0 100 4 2 2 0 000-4z" />
  </svg>
);

const HomeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const HeartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
    <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
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

const AwardIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
    <circle cx="12" cy="8" r="6" />
    <path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12" />
  </svg>
);

const DollarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
  </svg>
);

/* ───────────────────────── Grid Pattern ───────────────────────── */

const GridPattern = ({ opacity = 0.03 }: { opacity?: number }) => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }}>
    <defs>
      <pattern id="insGrid" width="60" height="60" patternUnits="userSpaceOnUse">
        <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#0ea5e9" strokeWidth="0.5" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#insGrid)" />
  </svg>
);

/* ───────────────────────── Insurance SVG Background ───────────────────────── */

const InsuranceBgPattern = ({ opacity = 0.03 }: { opacity?: number }) => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }} viewBox="0 0 800 600">
    {/* Shield outlines */}
    <path d="M100 100 L100 200 Q100 260 150 280 Q200 260 200 200 L200 100 L150 80 Z" stroke="#0ea5e9" strokeWidth="0.8" fill="none" />
    <path d="M600 50 L600 130 Q600 175 640 190 Q680 175 680 130 L680 50 L640 35 Z" stroke="#0ea5e9" strokeWidth="0.5" fill="none" />
    {/* Umbrella outlines */}
    <path d="M380 350 A80 80 0 01540 350" stroke="#0ea5e9" strokeWidth="0.6" fill="none" />
    <line x1="460" y1="350" x2="460" y2="440" stroke="#0ea5e9" strokeWidth="0.6" />
    {/* Circles */}
    <circle cx="700" cy="400" r="60" stroke="#0ea5e9" strokeWidth="0.4" fill="none" />
    <circle cx="700" cy="400" r="40" stroke="#0ea5e9" strokeWidth="0.3" fill="none" />
    {/* Dotted lines */}
    <line x1="50" y1="500" x2="750" y2="500" stroke="#0ea5e9" strokeWidth="0.3" strokeDasharray="4 8" />
    <line x1="50" y1="520" x2="750" y2="520" stroke="#0ea5e9" strokeWidth="0.2" strokeDasharray="2 6" />
  </svg>
);

/* ───────────────────────── Data ───────────────────────── */

const services = [
  {
    name: "Home Insurance",
    desc: "Protect your most valuable asset from fire, theft, natural disasters, and liability claims with comprehensive homeowner coverage.",
    icon: <HomeIcon />,
    tags: ["Dwelling", "Personal Property", "Liability"],
  },
  {
    name: "Auto Insurance",
    desc: "Full-spectrum vehicle protection including collision, comprehensive, uninsured motorist, and roadside assistance coverage.",
    icon: <CarIcon />,
    tags: ["Collision", "Comprehensive", "Roadside"],
  },
  {
    name: "Life Insurance",
    desc: "Secure your family&apos;s financial future with term, whole life, and universal life policies tailored to your needs and goals.",
    icon: <HeartIcon />,
    tags: ["Term Life", "Whole Life", "Universal"],
  },
  {
    name: "Business Insurance",
    desc: "From general liability to workers&apos; compensation, we build custom commercial packages that keep your business protected.",
    icon: <ShieldIcon />,
    tags: ["General Liability", "Workers Comp", "Property"],
  },
  {
    name: "Health Insurance",
    desc: "Navigate the healthcare landscape with confidence. Individual, family, and group plans from top-rated carriers at competitive rates.",
    icon: <FamilyIcon />,
    tags: ["Individual", "Family", "Group Plans"],
  },
  {
    name: "Umbrella Insurance",
    desc: "Extra liability protection that kicks in where other policies end. Shield your assets beyond standard coverage limits.",
    icon: <UmbrellaIcon />,
    tags: ["Excess Liability", "Asset Protection", "Peace of Mind"],
  },
];

const agents = [
  {
    name: "David Nakamura",
    title: "Principal Agent",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80",
    specialties: ["Home", "Life", "Business"],
    yearsExp: 22,
  },
  {
    name: "Sarah Mitchell",
    title: "Senior Agent",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80",
    specialties: ["Auto", "Health", "Umbrella"],
    yearsExp: 16,
  },
  {
    name: "Michael Torres",
    title: "Commercial Specialist",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80",
    specialties: ["Business", "Workers Comp"],
    yearsExp: 12,
  },
];

const testimonials = [
  {
    name: "Karen B.",
    text: "After a tree fell on our roof, Cascade handled everything. The claim was processed in days and we were fully covered. I cannot imagine going through that without them.",
    coverageType: "Home Insurance",
    rating: 5,
  },
  {
    name: "James T.",
    text: "They saved us over $2,000 a year on our auto and home bundle. Same coverage, way less money. Wish I had switched sooner.",
    coverageType: "Auto & Home Bundle",
    rating: 5,
  },
  {
    name: "Lisa M.",
    text: "David sat down with us and explained every option for life insurance. No pressure, just honest advice. We finally feel secure about our family&apos;s future.",
    coverageType: "Life Insurance",
    rating: 5,
  },
];

const faqs = [
  {
    q: "How much does a consultation cost?",
    a: "Every consultation is 100% free with no obligation. We review your current coverage, identify gaps, and present options that fit your budget.",
  },
  {
    q: "Can you bundle my home and auto insurance?",
    a: "Absolutely. Bundling home and auto is one of the easiest ways to save. Most clients see savings of 15-25% when they combine policies through our carriers.",
  },
  {
    q: "How fast can I get a quote?",
    a: "Most quotes are ready within 15 minutes. For more complex commercial policies, we typically deliver options within 24 hours.",
  },
  {
    q: "Do you work with multiple insurance carriers?",
    a: "Yes. As an independent agency, we partner with over 30 top-rated carriers. This means we shop the market for you and find the best coverage at the best price.",
  },
  {
    q: "What happens if I need to file a claim?",
    a: "Call us first. We act as your advocate throughout the entire claims process, helping you document the loss, communicate with adjusters, and get the fastest possible resolution.",
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
        className="inline-block text-[#0ea5e9] text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border border-[#0ea5e9]/20 bg-[#0ea5e9]/5"
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
        <span className="text-[#0ea5e9]">{highlightWord}</span>
        {parts[1] || ""}
      </motion.h2>
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className={`h-0.5 w-16 bg-gradient-to-r from-[#0ea5e9] to-transparent mt-4 ${center ? "mx-auto" : ""}`}
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

export default function InsuranceTemplate() {
  return (
    <TemplateLayout
      businessName="Cascade Insurance Partners"
      tagline="Protection for everything that matters. Your family, your home, your future."
      accentColor="#0ea5e9"
      accentColorLight="#38bdf8"
      heroGradient="linear-gradient(135deg, #0a1628 0%, #0c1a2e 100%)"
      heroImage="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1400&q=80"
      phone="(425) 555-0130"
      address="200 Bellevue Way NE, Bellevue, WA 98004"
    >
      {/* ════════════════ Trust Bar ════════════════ */}
      <section className="py-3 bg-gradient-to-r from-[#0ea5e9] via-[#0284c7] to-[#0ea5e9] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9Im5vbmUiLz48cGF0aCBkPSJNMCAwTDQwIDQwTTQwIDBMMCA0MCIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjAuMyIgb3BhY2l0eT0iMC4xIi8+PC9zdmc+')] opacity-30" />
        <div className="max-w-6xl mx-auto px-6 flex flex-wrap items-center justify-center gap-6 relative z-10">
          <div className="flex items-center gap-3">
            <ShieldIcon />
            <p className="text-sm font-bold tracking-wide">PROTECTION &mdash; FAMILY SECURITY &mdash; PEACE OF MIND</p>
          </div>
          <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm px-5 py-2 rounded-full border border-white/20">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
            </span>
            <span className="text-xs font-bold tracking-wider">FREE QUOTES: (425) 555-0130</span>
          </div>
        </div>
      </section>

      {/* ════════════════ Stats Banner ════════════════ */}
      <section className="py-12 relative overflow-hidden bg-[#070e19] border-b border-[#0ea5e9]/10">
        <GridPattern opacity={0.02} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] rounded-full blur-[180px] bg-[#0ea5e9]/5" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "10,000+", label: "Families Protected", icon: <FamilyIcon /> },
              { value: "30+", label: "Carrier Partners", icon: <ShieldIcon /> },
              { value: "25+", label: "Years of Trust", icon: <ClockIcon /> },
              { value: "98%", label: "Renewal Rate", icon: <CheckCircleIcon /> },
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
                  <span className="text-[#0ea5e9]">{stat.icon}</span>
                  <span className="text-3xl md:text-4xl font-extrabold text-white">{stat.value}</span>
                </div>
                <span className="text-muted text-sm font-medium tracking-wide uppercase">{stat.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ Services (6 Numbered) ════════════════ */}
      <section
        id="services"
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #060d17 0%, #0a1425 50%, #060d17 100%)" }}
      >
        <GridPattern />
        <InsuranceBgPattern opacity={0.025} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[10%] right-[5%] w-[500px] h-[500px] rounded-full blur-[160px] bg-[#0ea5e9]/6" />
          <div className="absolute bottom-[10%] left-[5%] w-[400px] h-[400px] rounded-full blur-[140px] bg-[#0ea5e9]/4" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="WHAT WE COVER"
            title="Our Coverage Options"
            highlightWord="Coverage Options"
            subtitle="Comprehensive protection tailored to your life. Every policy is built around your unique risks, goals, and budget."
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, i) => (
              <motion.div
                key={service.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group relative p-7 rounded-2xl border border-white/[0.06] hover:border-[#0ea5e9]/30 transition-all duration-500 overflow-hidden bg-white/[0.02]"
              >
                {/* Hover glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,#0ea5e915,transparent_70%)]" />
                {/* Top accent line */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#0ea5e9]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  {/* Number + Icon row */}
                  <div className="flex items-start justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl bg-[#0ea5e9]/10 border border-[#0ea5e9]/20 flex items-center justify-center text-[#0ea5e9] group-hover:bg-[#0ea5e9]/20 group-hover:border-[#0ea5e9]/40 transition-all duration-300">
                      {service.icon}
                    </div>
                    <span className="text-4xl font-extrabold text-white/[0.04] group-hover:text-[#0ea5e9]/10 transition-colors duration-300 leading-none">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold mb-3 group-hover:text-[#0ea5e9] transition-colors duration-300">{service.name}</h3>
                  <p className="text-muted text-sm leading-relaxed mb-5">{service.desc}</p>
                  {/* Feature tags */}
                  <div className="flex flex-wrap gap-2">
                    {service.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-semibold uppercase tracking-wider text-[#0ea5e9]/70 bg-[#0ea5e9]/8 border border-[#0ea5e9]/10 px-2.5 py-1 rounded-full"
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

      {/* ════════════════ Free Quote Calculator ════════════════ */}
      <section
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0a1425 0%, #0d1a30 50%, #0a1425 100%)" }}
      >
        <GridPattern opacity={0.02} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-[200px] bg-[#0ea5e9]/6" />
        </div>
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-8 md:p-12 rounded-2xl border border-[#0ea5e9]/20 relative overflow-hidden bg-gradient-to-b from-[#0ea5e9]/[0.06] to-transparent"
          >
            {/* Inner glow */}
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,#0ea5e915,transparent_60%)]" />
            {/* Corner decorations */}
            <div className="absolute top-0 left-0 w-20 h-20 border-t border-l border-[#0ea5e9]/30 rounded-tl-2xl" />
            <div className="absolute bottom-0 right-0 w-20 h-20 border-b border-r border-[#0ea5e9]/30 rounded-br-2xl" />
            <div className="relative z-10">
              <div className="text-center mb-8">
                <span className="inline-flex items-center gap-2 bg-[#0ea5e9]/10 text-[#0ea5e9] text-xs font-bold uppercase tracking-[0.2em] px-4 py-2 rounded-full mb-4 border border-[#0ea5e9]/20">
                  <DollarIcon />
                  FREE QUOTE IN MINUTES
                </span>
                <h2 className="text-3xl md:text-4xl font-extrabold mb-3">
                  Get Your <span className="text-[#0ea5e9]">Free Quote</span>
                </h2>
                <p className="text-muted max-w-lg mx-auto">
                  Tell us what you need to protect. We compare rates from 30+ carriers and find the best coverage at the lowest price.
                </p>
              </div>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Your Name"
                    className="w-full h-13 px-5 rounded-xl bg-white/5 border border-[#0ea5e9]/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#0ea5e9]/50 transition-colors"
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    className="w-full h-13 px-5 rounded-xl bg-white/5 border border-[#0ea5e9]/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#0ea5e9]/50 transition-colors"
                  />
                </div>
                <input
                  type="tel"
                  placeholder="Phone Number"
                  className="w-full h-13 px-5 rounded-xl bg-white/5 border border-[#0ea5e9]/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#0ea5e9]/50 transition-colors"
                />
                <select
                  className="w-full h-13 px-5 rounded-xl bg-white/5 border border-[#0ea5e9]/15 text-white/60 text-sm focus:outline-none focus:border-[#0ea5e9]/50 transition-colors appearance-none"
                >
                  <option value="">Select Coverage Type</option>
                  <option value="home">Home Insurance</option>
                  <option value="auto">Auto Insurance</option>
                  <option value="life">Life Insurance</option>
                  <option value="business">Business Insurance</option>
                  <option value="health">Health Insurance</option>
                  <option value="umbrella">Umbrella Insurance</option>
                  <option value="bundle">Bundle (Home + Auto)</option>
                </select>
                <textarea
                  placeholder="Tell us about your current coverage or what you need..."
                  rows={3}
                  className="w-full px-5 py-4 rounded-xl bg-white/5 border border-[#0ea5e9]/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#0ea5e9]/50 resize-none transition-colors"
                />
                <button
                  type="button"
                  className="w-full h-14 rounded-xl bg-gradient-to-r from-[#0ea5e9] to-[#0284c7] text-white font-bold text-lg hover:from-[#38bdf8] hover:to-[#0ea5e9] transition-all duration-300 shadow-lg shadow-[#0ea5e9]/20"
                >
                  Get My Free Quote
                </button>
                <p className="text-center text-white/30 text-xs">
                  No obligation. No spam. Your information is 100% confidential.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ════════════════ About / Why Choose Us ════════════════ */}
      <section
        id="about"
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #060d17 0%, #091320 50%, #060d17 100%)" }}
      >
        <GridPattern />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] left-[5%] w-[500px] h-[500px] rounded-full blur-[160px] bg-[#0ea5e9]/5" />
          <div className="absolute bottom-[10%] right-[10%] w-[350px] h-[350px] rounded-full blur-[140px] bg-[#0ea5e9]/4" />
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
                    src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&q=80"
                    alt="Family home"
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Secondary image */}
                <div className="absolute bottom-0 right-0 w-[65%] h-[55%] rounded-2xl overflow-hidden border-2 border-white/[0.06] shadow-2xl z-20">
                  <img
                    src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80"
                    alt="Insurance agent"
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Accent badge */}
                <div className="absolute top-[55%] left-[60%] z-30 bg-[#0ea5e9] rounded-2xl px-5 py-4 shadow-xl shadow-[#0ea5e9]/20 border border-[#38bdf8]/30">
                  <span className="block text-3xl font-extrabold text-white leading-none">25+</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-white/80">Years of<br />Protection</span>
                </div>
                {/* Decorative corner lines */}
                <div className="absolute -top-3 -left-3 w-16 h-16 border-t-2 border-l-2 border-[#0ea5e9]/20 rounded-tl-xl" />
                <div className="absolute -bottom-3 -right-3 w-16 h-16 border-b-2 border-r-2 border-[#0ea5e9]/20 rounded-br-xl" />
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
                title="Your Protection Partner"
                highlightWord="Protection"
                center={false}
              />
              <p className="text-muted leading-relaxed mb-6 text-lg -mt-8">
                At Cascade Insurance Partners, we believe everyone deserves coverage they can understand and afford. As an independent agency in Bellevue, we shop 30+ carriers so you never overpay.
              </p>
              <p className="text-muted leading-relaxed mb-8">
                We are not captive to one company. We work for you &mdash; comparing rates, identifying gaps in your current coverage, and building a protection plan that actually fits your life. When you need to file a claim, we are the call you make first.
              </p>
              {/* Feature list */}
              <div className="space-y-4">
                {[
                  { icon: <ShieldIcon />, title: "Independent Agency", desc: "We represent you, not the insurance company. 30+ carriers competing for your business." },
                  { icon: <DollarIcon />, title: "Save 15-40%", desc: "Clients save an average of $800/year when they switch to our recommended policies." },
                  { icon: <PhoneIcon />, title: "Claims Advocacy", desc: "When disaster strikes, call us first. We handle the paperwork and fight for fair payouts." },
                ].map((feature) => (
                  <div key={feature.title} className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-[#0ea5e9]/20 transition-colors duration-300">
                    <div className="w-10 h-10 rounded-lg bg-[#0ea5e9]/10 border border-[#0ea5e9]/20 flex items-center justify-center text-[#0ea5e9] shrink-0">
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

      {/* ════════════════ Team / Agent Cards ════════════════ */}
      <section
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0a1425 0%, #0d1a30 50%, #0a1425 100%)" }}
      >
        <GridPattern opacity={0.025} />
        <InsuranceBgPattern opacity={0.015} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] right-[10%] w-[500px] h-[500px] rounded-full blur-[180px] bg-[#0ea5e9]/5" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="OUR TEAM"
            title="Meet Your Agents"
            highlightWord="Agents"
            subtitle="Licensed professionals who take the time to understand your risks and build coverage around your life."
          />
          <div className="grid md:grid-cols-3 gap-8">
            {agents.map((agent, i) => (
              <motion.div
                key={agent.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="group relative rounded-2xl border border-white/[0.06] hover:border-[#0ea5e9]/30 transition-all duration-500 overflow-hidden bg-white/[0.02]"
              >
                {/* Photo */}
                <div className="relative aspect-[3/4] overflow-hidden">
                  <img
                    src={agent.image}
                    alt={agent.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#060d17] via-[#060d17]/30 to-transparent" />
                  {/* Years badge */}
                  <div className="absolute top-4 right-4 bg-[#0ea5e9]/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full border border-[#38bdf8]/30">
                    {agent.yearsExp}+ YRS
                  </div>
                  {/* Info overlay at bottom */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-xl font-bold mb-1">{agent.name}</h3>
                    <p className="text-[#0ea5e9] text-sm font-semibold mb-3">{agent.title}</p>
                    <div className="flex flex-wrap gap-2">
                      {agent.specialties.map((s) => (
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
      <section className="py-20 relative overflow-hidden bg-gradient-to-b from-[#0ea5e9]/10 to-[#060d17]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#0ea5e9]/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#0ea5e9]/10 to-transparent" />
          <svg className="absolute inset-0 w-full h-full opacity-[0.04]" viewBox="0 0 1000 400">
            <path d="M0 200 Q250 100 500 200 Q750 300 1000 200" stroke="#0ea5e9" strokeWidth="1" fill="none" />
            <path d="M0 250 Q250 150 500 250 Q750 350 1000 250" stroke="#0ea5e9" strokeWidth="0.5" fill="none" />
            <circle cx="500" cy="200" r="80" stroke="#0ea5e9" strokeWidth="0.3" fill="none" />
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
              WHY CHOOSE <span className="text-[#0ea5e9]">CASCADE INSURANCE?</span>
            </h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <ShieldIcon />, title: "Independent", desc: "30+ carriers competing for your business means you get the best rate, every time" },
              { icon: <AwardIcon />, title: "A+ Rated", desc: "Every carrier we recommend holds an A.M. Best rating of A or higher" },
              { icon: <PhoneIcon />, title: "Claims Help", desc: "We handle the entire claims process as your personal advocate from start to finish" },
              { icon: <DollarIcon />, title: "Save More", desc: "Clients save an average of $800 per year when they switch to our recommended plans" },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group text-center p-6 rounded-2xl border border-white/[0.06] hover:border-[#0ea5e9]/30 bg-white/[0.02] transition-all duration-500"
              >
                <div className="w-14 h-14 mx-auto rounded-xl bg-[#0ea5e9]/10 border border-[#0ea5e9]/20 flex items-center justify-center text-[#0ea5e9] mb-4 group-hover:bg-[#0ea5e9]/20 group-hover:scale-110 transition-all duration-300">
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
        style={{ background: "linear-gradient(180deg, #060d17 0%, #091320 50%, #060d17 100%)" }}
      >
        <GridPattern />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[30%] left-[40%] w-[600px] h-[400px] rounded-full blur-[180px] bg-[#0ea5e9]/5" />
          <svg className="absolute inset-0 w-full h-full opacity-[0.025]" viewBox="0 0 800 400">
            <circle cx="400" cy="200" r="100" stroke="#0ea5e9" strokeWidth="0.5" fill="none" />
            <circle cx="400" cy="200" r="180" stroke="#0ea5e9" strokeWidth="0.3" fill="none" />
            <circle cx="400" cy="200" r="260" stroke="#0ea5e9" strokeWidth="0.2" fill="none" />
          </svg>
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="CLIENT TESTIMONIALS"
            title="Trusted by Thousands"
            highlightWord="Thousands"
            subtitle="Real stories from real clients who trust Cascade to protect what matters most."
          />
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative p-7 rounded-2xl border border-white/[0.06] hover:border-[#0ea5e9]/30 transition-all duration-500 overflow-hidden bg-white/[0.02]"
              >
                {/* Top accent line */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-[#0ea5e9]/40 via-[#0ea5e9]/10 to-transparent" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_0%_0%,#0ea5e910,transparent_70%)]" />
                <div className="relative z-10">
                  {/* Coverage type tag */}
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0ea5e9]/70 bg-[#0ea5e9]/8 border border-[#0ea5e9]/10 px-2.5 py-1 rounded-full">
                    {t.coverageType}
                  </span>
                  {/* Stars */}
                  <div className="flex items-center gap-0.5 text-[#0ea5e9] mt-4 mb-4">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <StarIcon key={j} />
                    ))}
                  </div>
                  {/* Quote */}
                  <p className="text-muted leading-relaxed mb-6 text-sm">&ldquo;{t.text}&rdquo;</p>
                  {/* Author */}
                  <div className="flex items-center gap-3 pt-4 border-t border-white/[0.06]">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0ea5e9]/30 to-[#0ea5e9]/10 flex items-center justify-center text-sm font-bold text-[#0ea5e9]">
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

      {/* ════════════════ FAQ ════════════════ */}
      <section
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0a1425 0%, #0d1a30 50%, #0a1425 100%)" }}
      >
        <GridPattern />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] left-[10%] w-[400px] h-[400px] rounded-full blur-[140px] bg-[#0ea5e9]/5" />
          <div className="absolute bottom-[15%] right-[10%] w-[350px] h-[350px] rounded-full blur-[120px] bg-[#0ea5e9]/4" />
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
                className="group p-6 rounded-2xl border border-white/[0.06] hover:border-[#0ea5e9]/20 transition-all duration-500 overflow-hidden relative bg-white/[0.02]"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_0%_50%,#0ea5e910,transparent_70%)]" />
                <div className="relative z-10 flex gap-4">
                  <div className="w-8 h-8 shrink-0 rounded-lg bg-[#0ea5e9]/10 border border-[#0ea5e9]/20 flex items-center justify-center text-[#0ea5e9] text-xs font-bold mt-0.5">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div>
                    <h3 className="font-bold mb-2 text-white group-hover:text-[#0ea5e9] transition-colors duration-300">{faq.q}</h3>
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
        <div className="absolute inset-0 bg-gradient-to-b from-[#0ea5e9]/10 via-[#0ea5e9]/5 to-[#060d17]" />
        <GridPattern opacity={0.03} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#0ea5e9]/30 to-transparent" />
          <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full blur-[180px] bg-[#0ea5e9]/8" />
        </div>
        <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block text-[#0ea5e9] text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border border-[#0ea5e9]/20 bg-[#0ea5e9]/5">
              GET STARTED
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold mb-4 tracking-tight">
              Protect What <span className="text-[#0ea5e9]">Matters Most</span>
            </h2>
            <p className="text-muted text-lg mb-10 max-w-xl mx-auto leading-relaxed">
              Every day without proper coverage is a day your family is at risk. Get a free, no-obligation quote from Cascade Insurance Partners today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#contact"
                className="group inline-flex h-14 px-10 rounded-full bg-gradient-to-r from-[#0ea5e9] to-[#0284c7] text-white font-bold items-center justify-center text-lg hover:from-[#38bdf8] hover:to-[#0ea5e9] transition-all duration-300 shadow-lg shadow-[#0ea5e9]/25 gap-2"
              >
                <span>Free Consultation</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:translate-x-1 transition-transform">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
              <a
                href="tel:4255550130"
                className="inline-flex h-14 px-10 rounded-full border-2 border-[#0ea5e9]/30 text-[#0ea5e9] font-bold items-center justify-center text-lg hover:bg-[#0ea5e9]/10 hover:border-[#0ea5e9]/50 transition-all duration-300 gap-2"
              >
                <PhoneIcon />
                <span>(425) 555-0130</span>
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </TemplateLayout>
  );
}
