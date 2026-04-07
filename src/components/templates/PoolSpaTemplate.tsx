"use client";

import { motion } from "framer-motion";
import TemplateLayout from "./TemplateLayout";

/* ───────────────────────── SVG Icons ───────────────────────── */

const PoolWaterIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M2 12c1.5-1.5 3-2 4.5-2s3 .5 4.5 2c1.5 1.5 3 2 4.5 2s3-.5 4.5-2" />
    <path d="M2 17c1.5-1.5 3-2 4.5-2s3 .5 4.5 2c1.5 1.5 3 2 4.5 2s3-.5 4.5-2" />
    <path d="M2 7c1.5-1.5 3-2 4.5-2s3 .5 4.5 2c1.5 1.5 3 2 4.5 2s3-.5 4.5-2" />
  </svg>
);

const ThermometerIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M14 14.76V3.5a2.5 2.5 0 00-5 0v11.26a4.5 4.5 0 105 0z" />
    <circle cx="11.5" cy="17.5" r="1.5" fill="currentColor" />
  </svg>
);

const LeafIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75" />
  </svg>
);

const WrenchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
  </svg>
);

const SunIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <circle cx="12" cy="12" r="5" />
    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
  </svg>
);

const UmbrellaIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M23 12a11.05 11.05 0 00-22 0zm-5 7a3 3 0 01-6 0v-7" />
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

const DropletIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
    <path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z" />
  </svg>
);

/* ───────────────────────── Water Ripple Pattern ───────────────────────── */

const WaterRipplePattern = ({ opacity = 0.03 }: { opacity?: number }) => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }}>
    <defs>
      <pattern id="poolWaves" width="120" height="40" patternUnits="userSpaceOnUse">
        <path d="M0 20 Q30 10 60 20 Q90 30 120 20" fill="none" stroke="#22d3ee" strokeWidth="0.5" />
        <path d="M0 30 Q30 20 60 30 Q90 40 120 30" fill="none" stroke="#22d3ee" strokeWidth="0.3" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#poolWaves)" />
  </svg>
);

/* ───────────────────────── Data ───────────────────────── */

const services = [
  {
    name: "Pool Cleaning & Maintenance",
    desc: "Crystal clear water, every time. Regular skimming, vacuuming, chemical balancing, and filter cleaning to keep your pool pristine all season long.",
    icon: <PoolWaterIcon />,
    tags: ["Weekly Service", "Chemical Balance", "Filter Clean"],
  },
  {
    name: "Hot Tub & Spa Service",
    desc: "Complete hot tub care from water chemistry to jet maintenance. Relax knowing your spa is perfectly maintained and ready whenever you are.",
    icon: <ThermometerIcon />,
    tags: ["Water Chemistry", "Jet Service", "Cover Care"],
  },
  {
    name: "Equipment Repair",
    desc: "Pumps, filters, heaters, chlorinators, and automation systems. Our certified technicians diagnose and repair all major brands fast.",
    icon: <WrenchIcon />,
    tags: ["Pumps & Motors", "Heaters", "Automation"],
  },
  {
    name: "New Pool Installation",
    desc: "From design to first dive. Gunite, fiberglass, and vinyl liner pools custom-built to transform your backyard into a private paradise.",
    icon: <SunIcon />,
    tags: ["Custom Design", "Gunite", "Fiberglass"],
  },
  {
    name: "Pool Renovation",
    desc: "Replastering, tile replacement, coping upgrades, and complete pool makeovers that breathe new life into aging pools and dramatically boost curb appeal.",
    icon: <UmbrellaIcon />,
    tags: ["Replaster", "Tile & Coping", "LED Upgrades"],
  },
  {
    name: "Winterization & Opening",
    desc: "Protect your investment through the cold months and get it swim-ready when spring arrives. Full winterization and seasonal opening services.",
    icon: <LeafIcon />,
    tags: ["Winter Closing", "Spring Opening", "Freeze Guard"],
  },
];

const maintenancePlans = [
  {
    name: "Essential",
    price: "$149",
    period: "/month",
    features: [
      "Weekly chemical testing & balancing",
      "Surface skimming & debris removal",
      "Filter inspection monthly",
      "Basic equipment check",
      "Email support",
    ],
    popular: false,
  },
  {
    name: "Premium",
    price: "$249",
    period: "/month",
    features: [
      "Everything in Essential, plus:",
      "Full vacuum & brushing weekly",
      "Filter deep-clean monthly",
      "Pump & heater inspection",
      "Priority scheduling",
      "10% off repairs",
    ],
    popular: true,
  },
  {
    name: "Ultimate",
    price: "$399",
    period: "/month",
    features: [
      "Everything in Premium, plus:",
      "Twice-weekly service visits",
      "Complete equipment maintenance",
      "Tile & waterline cleaning",
      "Free winterization & opening",
      "24/7 emergency support",
      "20% off all repairs",
    ],
    popular: false,
  },
];

const galleryItems = [
  {
    image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&q=80",
    title: "Infinity Edge Paradise",
    desc: "Custom gunite with vanishing edge",
  },
  {
    image: "https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?w=600&q=80",
    title: "Resort-Style Retreat",
    desc: "Complete backyard transformation",
  },
  {
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80",
    title: "Spa & Pool Combo",
    desc: "Integrated hot tub with waterfall",
  },
  {
    image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&q=80",
    title: "Modern Lap Pool",
    desc: "Sleek design with LED lighting",
  },
];

const seasonalTips = [
  { season: "Spring", tip: "Test water chemistry early. Clean filters and inspect equipment before the first swim of the season.", icon: <LeafIcon /> },
  { season: "Summer", tip: "Run your pump 8-12 hours daily. Check chlorine levels twice weekly during heavy use periods.", icon: <SunIcon /> },
  { season: "Fall", tip: "Remove debris daily as leaves fall. Consider a safety cover to reduce maintenance and protect your pool.", icon: <LeafIcon /> },
  { season: "Winter", tip: "Proper winterization prevents costly freeze damage. Lower water level, add antifreeze to plumbing, and cover securely.", icon: <PoolWaterIcon /> },
];

const testimonials = [
  {
    name: "David & Sarah K.",
    text: "Crystal Clear transformed our backyard completely. The pool installation was flawless and they finished ahead of schedule. Our neighbors are jealous and we live out there now.",
    service: "New Installation",
    rating: 5,
  },
  {
    name: "Michelle R.",
    text: "Switched to their Premium plan last year and it has been night and day. The water is always perfect, the equipment runs like new, and I never have to think about it.",
    service: "Maintenance Plan",
    rating: 5,
  },
  {
    name: "James T.",
    text: "Our 15-year-old pool looked brand new after their renovation. New plaster, tile, LED lights, and a resurfaced deck. Worth every single penny we spent.",
    service: "Pool Renovation",
    rating: 5,
  },
];

const faqs = [
  {
    q: "How often should I have my pool serviced?",
    a: "We recommend weekly service during swimming season for optimal water quality and equipment longevity. During off-season, bi-weekly or monthly visits are typically sufficient to keep everything in top condition.",
  },
  {
    q: "How long does a new pool installation take?",
    a: "Most custom pool installations take 8 to 12 weeks from permit approval to completion. Factors like design complexity, weather, and permitting timelines can affect the schedule. We provide a detailed timeline during your consultation.",
  },
  {
    q: "Do you service all pool types?",
    a: "Yes. We service gunite, fiberglass, vinyl liner, and above-ground pools. We also maintain all hot tub and spa brands including Jacuzzi, Hot Spring, Sundance, Bullfrog, and more.",
  },
  {
    q: "What chemicals do you use?",
    a: "We use professional-grade, EPA-approved chemicals. We also offer salt-chlorine, UV, and ozone alternatives for clients who prefer reduced chemical options. We will recommend the best system for your pool and preferences.",
  },
  {
    q: "Are you licensed and insured?",
    a: "Absolutely. We are fully licensed, bonded, and insured in Washington State. All technicians are CPO (Certified Pool Operator) certified and undergo ongoing training.",
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
        className="inline-block text-[#22d3ee] text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border border-[#22d3ee]/20 bg-[#22d3ee]/5"
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
        <span className="text-[#22d3ee]">{highlightWord}</span>
        {parts[1] || ""}
      </motion.h2>
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className={`h-0.5 w-16 bg-gradient-to-r from-[#22d3ee] to-transparent mt-4 ${center ? "mx-auto" : ""}`}
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

export default function PoolSpaTemplate() {
  return (
    <TemplateLayout
      businessName="Crystal Clear Pools & Spas"
      tagline="Luxury pool and spa services for the ultimate outdoor living experience. Kirkland's premier aquatic specialists."
      accentColor="#22d3ee"
      accentColorLight="#67e8f9"
      heroGradient="linear-gradient(135deg, #0a1a2e 0%, #0c1220 100%)"
      heroImage="https://images.unsplash.com/photo-1562778612-e1e0cda9915c?w=1400&q=80"
      phone="(425) 555-0136"
      address="412 Lake St, Kirkland, WA 98033"
    >
      {/* ════════════════ Crystal Clear Bar ════════════════ */}
      <section className="py-3 bg-gradient-to-r from-[#22d3ee] via-[#06b6d4] to-[#22d3ee] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9Im5vbmUiLz48cGF0aCBkPSJNMCAwTDQwIDQwTTQwIDBMMCA0MCIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjAuMyIgb3BhY2l0eT0iMC4xIi8+PC9zdmc+')] opacity-30" />
        <div className="max-w-6xl mx-auto px-6 flex flex-wrap items-center justify-center gap-6 relative z-10">
          <div className="flex items-center gap-3">
            <PoolWaterIcon />
            <p className="text-sm font-bold tracking-wide">FREE CONSULTATION &mdash; TRANSFORM YOUR BACKYARD INTO A PARADISE</p>
          </div>
          <a href="tel:4255550136" className="flex items-center gap-2 bg-white/15 backdrop-blur-sm px-5 py-2 rounded-full border border-white/20 hover:bg-white/25 transition-colors">
            <PhoneIcon />
            <span className="text-xs font-bold tracking-wider">(425) 555-0136</span>
          </a>
        </div>
      </section>

      {/* ════════════════ Stats Banner ════════════════ */}
      <section className="py-12 relative overflow-hidden bg-[#070e18] border-b border-[#22d3ee]/10">
        <WaterRipplePattern opacity={0.02} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] rounded-full blur-[180px] bg-[#22d3ee]/5" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "1,200+", label: "Pools Serviced", icon: <PoolWaterIcon /> },
              { value: "15+", label: "Years Experience", icon: <CheckCircleIcon /> },
              { value: "98%", label: "Client Retention", icon: <StarIcon /> },
              { value: "350+", label: "Pools Built", icon: <SunIcon /> },
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
                  <span className="text-[#22d3ee]">{stat.icon}</span>
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
        style={{ background: "linear-gradient(180deg, #060d17 0%, #0a1525 50%, #060d17 100%)" }}
      >
        <WaterRipplePattern />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[10%] right-[5%] w-[500px] h-[500px] rounded-full blur-[160px] bg-[#22d3ee]/6" />
          <div className="absolute bottom-[10%] left-[5%] w-[400px] h-[400px] rounded-full blur-[140px] bg-[#22d3ee]/4" />
        </div>
        {/* Pool silhouette SVG background */}
        <svg className="absolute bottom-0 left-0 w-full opacity-[0.02] pointer-events-none" viewBox="0 0 1200 200">
          <ellipse cx="600" cy="150" rx="500" ry="80" stroke="#22d3ee" strokeWidth="1" fill="none" />
          <path d="M100 150 Q350 70 600 150 Q850 230 1100 150" stroke="#22d3ee" strokeWidth="0.5" fill="none" />
        </svg>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="WHAT WE DO"
            title="Our Premium Services"
            highlightWord="Premium Services"
            subtitle="From weekly maintenance to custom installations, we deliver crystal clear results with white-glove service every single time."
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, i) => (
              <motion.div
                key={service.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group relative p-7 rounded-2xl border border-white/[0.06] hover:border-[#22d3ee]/30 transition-all duration-500 overflow-hidden bg-white/[0.02]"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,#22d3ee15,transparent_70%)]" />
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#22d3ee]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl bg-[#22d3ee]/10 border border-[#22d3ee]/20 flex items-center justify-center text-[#22d3ee] group-hover:bg-[#22d3ee]/20 group-hover:border-[#22d3ee]/40 transition-all duration-300">
                      {service.icon}
                    </div>
                    <span className="text-4xl font-extrabold text-white/[0.04] group-hover:text-[#22d3ee]/10 transition-colors duration-300 leading-none">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold mb-3 group-hover:text-[#22d3ee] transition-colors duration-300">{service.name}</h3>
                  <p className="text-muted text-sm leading-relaxed mb-5">{service.desc}</p>
                  <div className="flex flex-wrap gap-2">
                    {service.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-semibold uppercase tracking-wider text-[#22d3ee]/70 bg-[#22d3ee]/8 border border-[#22d3ee]/10 px-2.5 py-1 rounded-full"
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

      {/* ════════════════ Maintenance Plans ════════════════ */}
      <section
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0a1525 0%, #0d1a2f 50%, #0a1525 100%)" }}
      >
        <WaterRipplePattern opacity={0.025} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[30%] left-[50%] -translate-x-1/2 w-[700px] h-[400px] rounded-full blur-[180px] bg-[#22d3ee]/6" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="MAINTENANCE PLANS"
            title="Choose Your Plan"
            highlightWord="Your Plan"
            subtitle="Hassle-free maintenance plans designed to keep your pool and spa in perfect condition year-round."
          />
          <div className="grid md:grid-cols-3 gap-8">
            {maintenancePlans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className={`group relative p-8 rounded-2xl border transition-all duration-500 overflow-hidden ${
                  plan.popular
                    ? "border-[#22d3ee]/40 bg-gradient-to-b from-[#22d3ee]/[0.08] to-transparent scale-[1.02]"
                    : "border-white/[0.06] hover:border-[#22d3ee]/30 bg-white/[0.02]"
                }`}
              >
                {plan.popular && (
                  <>
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#22d3ee]/60 to-transparent" />
                    <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,#22d3ee12,transparent_60%)]" />
                    <span className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#22d3ee] bg-[#22d3ee]/10 border border-[#22d3ee]/20 px-3 py-1 rounded-full">
                      MOST POPULAR
                    </span>
                  </>
                )}
                <div className="relative z-10">
                  <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-white to-[#22d3ee]">{plan.price}</span>
                    <span className="text-muted text-sm">{plan.period}</span>
                  </div>
                  <div className="space-y-3 mb-8">
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex items-start gap-3">
                        <span className="text-[#22d3ee] mt-0.5 shrink-0"><CheckCircleIcon /></span>
                        <span className="text-muted text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    className={`w-full h-12 rounded-xl font-bold text-sm transition-all duration-300 ${
                      plan.popular
                        ? "bg-gradient-to-r from-[#22d3ee] to-[#06b6d4] text-white hover:from-[#67e8f9] hover:to-[#22d3ee] shadow-lg shadow-[#22d3ee]/20"
                        : "border border-[#22d3ee]/30 text-[#22d3ee] hover:bg-[#22d3ee]/10 hover:border-[#22d3ee]/50"
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

      {/* ════════════════ Project Gallery ════════════════ */}
      <section
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #060d17 0%, #091420 50%, #060d17 100%)" }}
      >
        <WaterRipplePattern />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] left-[5%] w-[500px] h-[500px] rounded-full blur-[160px] bg-[#22d3ee]/5" />
          <div className="absolute bottom-[10%] right-[10%] w-[350px] h-[350px] rounded-full blur-[140px] bg-[#22d3ee]/4" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="OUR WORK"
            title="Project Gallery"
            highlightWord="Gallery"
            subtitle="Every pool tells a story. Here are some of our proudest transformations across the greater Kirkland area."
          />
          <div className="grid md:grid-cols-2 gap-6">
            {galleryItems.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative rounded-2xl overflow-hidden border border-white/[0.06] hover:border-[#22d3ee]/30 transition-all duration-500"
              >
                <div className="aspect-[16/10] overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#060d17] via-[#060d17]/30 to-transparent" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-lg font-bold mb-1 group-hover:text-[#22d3ee] transition-colors duration-300">{item.title}</h3>
                  <p className="text-muted text-sm">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ Seasonal Tips ════════════════ */}
      <section
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0a1525 0%, #0d1a30 50%, #0a1525 100%)" }}
      >
        <WaterRipplePattern opacity={0.025} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] right-[10%] w-[500px] h-[500px] rounded-full blur-[180px] bg-[#22d3ee]/5" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="POOL CARE TIPS"
            title="Seasonal Pool Guide"
            highlightWord="Seasonal"
            subtitle="Expert advice to keep your pool in peak condition through every season of the Pacific Northwest year."
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {seasonalTips.map((tip, i) => (
              <motion.div
                key={tip.season}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group text-center p-6 rounded-2xl border border-white/[0.06] hover:border-[#22d3ee]/30 bg-white/[0.02] transition-all duration-500"
              >
                <div className="w-14 h-14 mx-auto rounded-xl bg-[#22d3ee]/10 border border-[#22d3ee]/20 flex items-center justify-center text-[#22d3ee] mb-4 group-hover:bg-[#22d3ee]/20 group-hover:scale-110 transition-all duration-300">
                  {tip.icon}
                </div>
                <h4 className="font-bold mb-2 text-lg">{tip.season}</h4>
                <p className="text-muted text-sm leading-relaxed">{tip.tip}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ Why Choose Us Banner ════════════════ */}
      <section className="py-20 relative overflow-hidden bg-gradient-to-b from-[#22d3ee]/10 to-[#060d17]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#22d3ee]/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#22d3ee]/10 to-transparent" />
          <svg className="absolute inset-0 w-full h-full opacity-[0.04]" viewBox="0 0 1000 400">
            <path d="M0 200 Q250 100 500 200 Q750 300 1000 200" stroke="#22d3ee" strokeWidth="1" fill="none" />
            <path d="M0 250 Q250 150 500 250 Q750 350 1000 250" stroke="#22d3ee" strokeWidth="0.5" fill="none" />
            <circle cx="500" cy="200" r="80" stroke="#22d3ee" strokeWidth="0.3" fill="none" />
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
              WHY CHOOSE <span className="text-[#22d3ee]">CRYSTAL CLEAR?</span>
            </h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <DropletIcon />, title: "Crystal Clear Water", desc: "Advanced chemical balancing and filtration for water so clear it sparkles" },
              { icon: <WrenchIcon />, title: "Certified Techs", desc: "Every technician is CPO-certified with hands-on manufacturer training" },
              { icon: <PhoneIcon />, title: "Same-Day Service", desc: "Emergency repairs and same-day response when your equipment goes down" },
              { icon: <CheckCircleIcon />, title: "Satisfaction Guaranteed", desc: "100% satisfaction guarantee on every service call and installation" },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group text-center p-6 rounded-2xl border border-white/[0.06] hover:border-[#22d3ee]/30 bg-white/[0.02] transition-all duration-500"
              >
                <div className="w-14 h-14 mx-auto rounded-xl bg-[#22d3ee]/10 border border-[#22d3ee]/20 flex items-center justify-center text-[#22d3ee] mb-4 group-hover:bg-[#22d3ee]/20 group-hover:scale-110 transition-all duration-300">
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
        style={{ background: "linear-gradient(180deg, #060d17 0%, #0a1525 50%, #060d17 100%)" }}
      >
        <WaterRipplePattern />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[30%] left-[40%] w-[600px] h-[400px] rounded-full blur-[180px] bg-[#22d3ee]/5" />
          <svg className="absolute inset-0 w-full h-full opacity-[0.025]" viewBox="0 0 800 400">
            <circle cx="400" cy="200" r="100" stroke="#22d3ee" strokeWidth="0.5" fill="none" />
            <circle cx="400" cy="200" r="180" stroke="#22d3ee" strokeWidth="0.3" fill="none" />
            <circle cx="400" cy="200" r="260" stroke="#22d3ee" strokeWidth="0.2" fill="none" />
          </svg>
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="CLIENT TESTIMONIALS"
            title="What Our Clients Say"
            highlightWord="Clients Say"
            subtitle="Real reviews from real homeowners who trust Crystal Clear with their pools and spas."
          />
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative p-7 rounded-2xl border border-white/[0.06] hover:border-[#22d3ee]/30 transition-all duration-500 overflow-hidden bg-white/[0.02]"
              >
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-[#22d3ee]/40 via-[#22d3ee]/10 to-transparent" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_0%_0%,#22d3ee10,transparent_70%)]" />
                <div className="relative z-10">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#22d3ee]/70 bg-[#22d3ee]/8 border border-[#22d3ee]/10 px-2.5 py-1 rounded-full">
                    {t.service}
                  </span>
                  <div className="flex items-center gap-0.5 text-[#22d3ee] mt-4 mb-4">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <StarIcon key={j} />
                    ))}
                  </div>
                  <p className="text-muted leading-relaxed mb-6 text-sm">&ldquo;{t.text}&rdquo;</p>
                  <div className="flex items-center gap-3 pt-4 border-t border-white/[0.06]">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#22d3ee]/30 to-[#22d3ee]/10 flex items-center justify-center text-sm font-bold text-[#22d3ee]">
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

      {/* ════════════════ Free Consultation CTA ════════════════ */}
      <section
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0a1525 0%, #0d1a30 50%, #0a1525 100%)" }}
      >
        <WaterRipplePattern opacity={0.02} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-[200px] bg-[#22d3ee]/6" />
        </div>
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-8 md:p-12 rounded-2xl border border-[#22d3ee]/20 relative overflow-hidden bg-gradient-to-b from-[#22d3ee]/[0.06] to-transparent"
          >
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,#22d3ee15,transparent_60%)]" />
            <div className="absolute top-0 left-0 w-20 h-20 border-t border-l border-[#22d3ee]/30 rounded-tl-2xl" />
            <div className="absolute bottom-0 right-0 w-20 h-20 border-b border-r border-[#22d3ee]/30 rounded-br-2xl" />
            <div className="relative z-10">
              <div className="text-center mb-8">
                <span className="inline-flex items-center gap-2 bg-[#22d3ee]/10 text-[#22d3ee] text-xs font-bold uppercase tracking-[0.2em] px-4 py-2 rounded-full mb-4 border border-[#22d3ee]/20">
                  <DropletIcon />
                  FREE CONSULTATION
                </span>
                <h2 className="text-3xl md:text-4xl font-extrabold mb-3">
                  Ready for <span className="text-[#22d3ee]">Crystal Clear</span> Water?
                </h2>
                <p className="text-muted max-w-lg mx-auto">
                  Tell us about your pool or spa project. We will provide a free on-site assessment and detailed quote within 48 hours.
                </p>
              </div>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Your Name"
                    className="w-full h-13 px-5 rounded-xl bg-white/5 border border-[#22d3ee]/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#22d3ee]/50 transition-colors"
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    className="w-full h-13 px-5 rounded-xl bg-white/5 border border-[#22d3ee]/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#22d3ee]/50 transition-colors"
                  />
                </div>
                <input
                  type="tel"
                  placeholder="Phone Number"
                  className="w-full h-13 px-5 rounded-xl bg-white/5 border border-[#22d3ee]/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#22d3ee]/50 transition-colors"
                />
                <select className="w-full h-13 px-5 rounded-xl bg-white/5 border border-[#22d3ee]/15 text-white/50 text-sm focus:outline-none focus:border-[#22d3ee]/50 transition-colors appearance-none">
                  <option value="">Select Service Needed</option>
                  <option value="cleaning">Pool Cleaning & Maintenance</option>
                  <option value="hottub">Hot Tub & Spa Service</option>
                  <option value="repair">Equipment Repair</option>
                  <option value="installation">New Pool Installation</option>
                  <option value="renovation">Pool Renovation</option>
                  <option value="winterization">Winterization & Opening</option>
                </select>
                <textarea
                  placeholder="Tell us about your pool or spa needs..."
                  rows={4}
                  className="w-full px-5 py-4 rounded-xl bg-white/5 border border-[#22d3ee]/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#22d3ee]/50 resize-none transition-colors"
                />
                <button
                  type="button"
                  className="w-full h-14 rounded-xl bg-gradient-to-r from-[#22d3ee] to-[#06b6d4] text-white font-bold text-lg hover:from-[#67e8f9] hover:to-[#22d3ee] transition-all duration-300 shadow-lg shadow-[#22d3ee]/20"
                >
                  Request Free Consultation
                </button>
                <p className="text-center text-white/30 text-xs">
                  No obligation. We will contact you within 24 hours to schedule your free on-site assessment.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ════════════════ FAQ ════════════════ */}
      <section
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #060d17 0%, #0a1525 50%, #060d17 100%)" }}
      >
        <WaterRipplePattern />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] left-[10%] w-[400px] h-[400px] rounded-full blur-[140px] bg-[#22d3ee]/5" />
          <div className="absolute bottom-[15%] right-[10%] w-[350px] h-[350px] rounded-full blur-[120px] bg-[#22d3ee]/4" />
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
                className="group p-6 rounded-2xl border border-white/[0.06] hover:border-[#22d3ee]/20 transition-all duration-500 overflow-hidden relative bg-white/[0.02]"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_0%_50%,#22d3ee10,transparent_70%)]" />
                <div className="relative z-10 flex gap-4">
                  <div className="w-8 h-8 shrink-0 rounded-lg bg-[#22d3ee]/10 border border-[#22d3ee]/20 flex items-center justify-center text-[#22d3ee] text-xs font-bold mt-0.5">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div>
                    <h3 className="font-bold mb-2 text-white group-hover:text-[#22d3ee] transition-colors duration-300">{faq.q}</h3>
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
        <div className="absolute inset-0 bg-gradient-to-b from-[#22d3ee]/10 via-[#22d3ee]/5 to-[#060d17]" />
        <WaterRipplePattern opacity={0.03} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#22d3ee]/30 to-transparent" />
          <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full blur-[180px] bg-[#22d3ee]/8" />
        </div>
        <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block text-[#22d3ee] text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border border-[#22d3ee]/20 bg-[#22d3ee]/5">
              DIVE IN TODAY
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold mb-4 tracking-tight">
              Your Dream Pool <span className="text-[#22d3ee]">Starts Here</span>
            </h2>
            <p className="text-muted text-lg mb-10 max-w-xl mx-auto leading-relaxed">
              Whether it is a sparkling new installation, a complete renovation, or hassle-free maintenance, Crystal Clear delivers luxury you can see and feel.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#contact"
                className="group inline-flex h-14 px-10 rounded-full bg-gradient-to-r from-[#22d3ee] to-[#06b6d4] text-white font-bold items-center justify-center text-lg hover:from-[#67e8f9] hover:to-[#22d3ee] transition-all duration-300 shadow-lg shadow-[#22d3ee]/25 gap-2"
              >
                <span>Free Consultation</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:translate-x-1 transition-transform">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
              <a
                href="tel:4255550136"
                className="inline-flex h-14 px-10 rounded-full border-2 border-[#22d3ee]/30 text-[#22d3ee] font-bold items-center justify-center text-lg hover:bg-[#22d3ee]/10 hover:border-[#22d3ee]/50 transition-all duration-300 gap-2"
              >
                <PhoneIcon />
                <span>(425) 555-0136</span>
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </TemplateLayout>
  );
}
