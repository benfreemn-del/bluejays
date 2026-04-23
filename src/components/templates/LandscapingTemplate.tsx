"use client";

/* eslint-disable @next/next/no-img-element -- These static marketing and preview components intentionally use plain img tags to preserve existing markup and visual behavior during lint-only cleanup. */

import { motion } from "framer-motion";
import TemplateLayout from "./TemplateLayout";

/* ───────────────────────── SVG Icons ───────────────────────── */

const LeafIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75" />
  </svg>
);

const TreeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M12 22V8M7 22h10M12 8L8 2h8l-4 6zM12 14L6 8h12l-6 6z" />
  </svg>
);

const ShovelIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M2 22l6-6M8 16l-2-2M17.5 2.5l4 4-3 3-4-4 3-3zM10 13l4 4M6.5 17.5L14 10" />
  </svg>
);

const SunIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <circle cx="12" cy="12" r="5" />
    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
  </svg>
);

const DropletIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z" />
  </svg>
);

const FlowerIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2a4 4 0 014 4 4 4 0 014 4 4 4 0 01-4 4 4 4 0 01-4 4 4 4 0 01-4-4 4 4 0 01-4-4 4 4 0 014-4 4 4 0 014-4z" />
  </svg>
);

const FenceIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M4 3v18M10 3v18M16 3v18M22 3v18M4 9h6M16 9h6M4 15h6M16 15h6" />
  </svg>
);

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
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

const RecycleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
    <path d="M7 19H4.815a1.83 1.83 0 01-1.57-.881 1.785 1.785 0 01-.004-1.784L7.196 9.5M11.5 3l3.679 6.196M16.803 9.5l3.959 6.835a1.796 1.796 0 01-.004 1.784A1.83 1.83 0 0119.185 19H12" />
    <path d="M14 16l-2 3-2-3M10 8l-3-1.5L5.5 8M18.5 8l-1.5 1.5-3-1.5" />
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

const MapPinIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const SnowflakeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M19.07 4.93L4.93 19.07" />
    <path d="M12 6l-2-2M12 6l2-2M12 18l-2 2M12 18l2 2M6 12l-2-2M6 12l-2 2M18 12l2-2M18 12l2 2" />
  </svg>
);

const WindIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M9.59 4.59A2 2 0 1111 8H2m10.59 11.41A2 2 0 1014 16H2m15.73-8.27A2.5 2.5 0 1119.5 12H2" />
  </svg>
);

/* ───────────────────────── Leaf Pattern ───────────────────────── */

const LeafPattern = ({ opacity = 0.03 }: { opacity?: number }) => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }}>
    <defs>
      <pattern id="leafGrid" width="80" height="80" patternUnits="userSpaceOnUse">
        <path d="M40 10c-5 0-10 5-10 15s10 15 10 15 10-5 10-15-5-15-10-15z" fill="none" stroke="#22c55e" strokeWidth="0.5" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#leafGrid)" />
  </svg>
);

/* ───────────────────────── Data ───────────────────────── */

const services = [
  {
    name: "Lawn Maintenance",
    desc: "Weekly mowing, edging, fertilization, and weed control that keeps your lawn looking magazine-worthy all season long.",
    icon: <LeafIcon />,
    tags: ["Mowing", "Fertilization", "Weed Control"],
  },
  {
    name: "Landscape Design",
    desc: "Custom garden blueprints, plant selection, and full installation by certified landscape architects who bring your vision to life.",
    icon: <FlowerIcon />,
    tags: ["Garden Design", "Plant Selection", "Installation"],
  },
  {
    name: "Hardscaping",
    desc: "Patios, walkways, retaining walls, and outdoor kitchens engineered to last decades and elevate your outdoor living.",
    icon: <FenceIcon />,
    tags: ["Patios", "Walkways", "Retaining Walls"],
  },
  {
    name: "Tree Services",
    desc: "Expert trimming, safe removal, stump grinding, and health assessments for trees of every species and size.",
    icon: <TreeIcon />,
    tags: ["Trimming", "Removal", "Health Assessment"],
  },
  {
    name: "Irrigation Systems",
    desc: "Smart sprinkler installation, seasonal calibration, and water management systems that save up to 40% on water bills.",
    icon: <DropletIcon />,
    tags: ["Sprinklers", "Smart Systems", "Water Mgmt"],
  },
  {
    name: "Outdoor Living",
    desc: "Fire pits, pergolas, lighting, and complete backyard transformations that turn your yard into a personal resort.",
    icon: <SunIcon />,
    tags: ["Fire Pits", "Pergolas", "Lighting"],
  },
];

const projects = [
  {
    name: "Backyard Paradise",
    type: "Full Transformation",
    image: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=600&q=80",
    detail: "Complete backyard overhaul with custom water feature, native plantings, and an outdoor kitchen.",
    area: "2,400 sq ft",
  },
  {
    name: "Modern Patio Build",
    type: "Hardscaping",
    image: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=600&q=80",
    detail: "600 sq ft travertine patio with built-in fire pit and integrated LED path lighting.",
    area: "600 sq ft",
  },
  {
    name: "Cottage Garden",
    type: "Planting Design",
    image: "https://images.unsplash.com/photo-1558904541-efa843a96f01?w=600&q=80",
    detail: "English cottage-style garden with perennial beds, winding stone paths, and a charming arbor.",
    area: "1,800 sq ft",
  },
  {
    name: "Commercial Campus",
    type: "Maintenance",
    image: "https://images.unsplash.com/photo-1592150621744-aca64f48394a?w=600&q=80",
    detail: "Year-round maintenance for a 5-acre commercial campus including full irrigation management.",
    area: "5 acres",
  },
  {
    name: "Poolside Retreat",
    type: "Full Transformation",
    image: "https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?w=600&q=80",
    detail: "Tropical poolside paradise with palm trees, ornamental grasses, and natural stone edging.",
    area: "3,200 sq ft",
  },
  {
    name: "Drought-Smart Front Yard",
    type: "Curb Appeal",
    image: "https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=600&q=80",
    detail: "Zero-waste front yard redesign with decorative rock, succulents, and solar pathway lighting.",
    area: "900 sq ft",
  },
];

const testimonials = [
  {
    name: "Karen P.",
    text: "Our backyard went from embarrassing to the envy of the neighborhood. They transformed every inch into something we could never have imagined.",
    projectType: "Backyard Redesign",
    rating: 5,
  },
  {
    name: "Steve & Maria D.",
    text: "Three years running and our property has never looked better. Always reliable, always meticulous, always professional.",
    projectType: "Ongoing Maintenance",
    rating: 5,
  },
  {
    name: "Chris L.",
    text: "The patio they built exceeded every expectation. We practically live outside now. Best investment we have ever made in our home.",
    projectType: "Patio Installation",
    rating: 5,
  },
];

const faqs = [
  {
    q: "How much does a landscaping project cost?",
    a: "Every property is unique. We provide free, detailed estimates after an on-site assessment. Most residential projects range from $2,000 to $25,000 depending on scope.",
  },
  {
    q: "Do you offer ongoing maintenance plans?",
    a: "Absolutely. We offer weekly, bi-weekly, and monthly maintenance packages that cover mowing, edging, fertilization, irrigation checks, and seasonal cleanups.",
  },
  {
    q: "Are you licensed and insured?",
    a: "Yes. We carry full general liability insurance and workers compensation coverage. We are also licensed in all municipalities we serve.",
  },
  {
    q: "How long does a typical project take?",
    a: "Maintenance starts same-week. Design projects typically take 2-6 weeks from concept to completion. We will give you a clear timeline during your free consultation.",
  },
  {
    q: "Do you use eco-friendly practices?",
    a: "Sustainability is core to our approach. We use organic fertilizers, native plant species, smart irrigation to reduce water waste, and electric equipment where possible.",
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
        className="inline-block text-[#22c55e] text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border border-[#22c55e]/20 bg-[#22c55e]/5"
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
        <span className="text-[#22c55e]">{highlightWord}</span>
        {parts[1] || ""}
      </motion.h2>
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className={`h-0.5 w-16 bg-gradient-to-r from-[#22c55e] to-transparent mt-4 ${center ? "mx-auto" : ""}`}
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

export default function LandscapingTemplate() {
  return (
    <TemplateLayout
      businessName="GreenScape Pro"
      tagline="Transform your outdoor space into something extraordinary. Professional landscaping for homes and businesses."
      accentColor="#22c55e"
      accentColorLight="#4ade80"
      heroGradient="linear-gradient(135deg, #1a2e1a 0%, #0f1f0f 100%)"
      heroImage="https://images.unsplash.com/photo-1584738766473-61c083514bf4?w=1400&q=80"
      phone="(555) 456-7890"
      address="789 Garden Way, Your City"
    >
      {/* ════════════════ Free Estimate Bar ════════════════ */}
      <section className="py-3 bg-gradient-to-r from-[#22c55e] via-[#16a34a] to-[#22c55e] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9Im5vbmUiLz48cGF0aCBkPSJNMCAwTDQwIDQwTTQwIDBMMCA0MCIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjAuMyIgb3BhY2l0eT0iMC4xIi8+PC9zdmc+')] opacity-30" />
        <div className="max-w-6xl mx-auto px-6 flex flex-wrap items-center justify-center gap-6 relative z-10">
          <div className="flex items-center gap-3">
            <LeafIcon />
            <p className="text-sm font-bold tracking-wide">FREE ESTIMATES ON ALL PROJECTS &mdash; CALL TODAY!</p>
          </div>
          <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm px-5 py-2 rounded-full border border-white/20">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-300 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-yellow-400" />
            </span>
            <span className="text-xs font-bold tracking-wider">SPRING BOOKINGS OPEN: (555) 456-7890</span>
          </div>
        </div>
      </section>

      {/* ════════════════ Trust Badges ════════════════ */}
      <section className="py-10 relative overflow-hidden bg-[#0c140c] border-b border-[#22c55e]/10">
        <LeafPattern opacity={0.02} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] rounded-full blur-[180px] bg-[#22c55e]/5" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: <ShieldIcon />, label: "Licensed & Insured", sub: "Full Liability Coverage" },
              { icon: <CheckCircleIcon />, label: "Satisfaction Guaranteed", sub: "100% or Money Back" },
              { icon: <TrophyIcon />, label: "Award Winning", sub: "Best of 2024 Landscaping" },
              { icon: <RecycleIcon />, label: "Eco-Friendly", sub: "Sustainable Practices" },
            ].map((badge, i) => (
              <motion.div
                key={badge.label}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="flex items-center gap-3 px-5 py-4 rounded-2xl border border-[#22c55e]/15 bg-white/[0.07] hover:border-[#22c55e]/30 transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-xl bg-[#22c55e]/10 border border-[#22c55e]/20 flex items-center justify-center text-[#22c55e] shrink-0">
                  {badge.icon}
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{badge.label}</p>
                  <p className="text-xs text-muted">{badge.sub}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ Stats Banner ════════════════ */}
      <section className="py-14 relative overflow-hidden bg-[#0a120a] border-b border-[#22c55e]/10">
        <LeafPattern opacity={0.015} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[300px] rounded-full blur-[200px] bg-[#22c55e]/5" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "500+", label: "Projects Completed", icon: <ShovelIcon /> },
              { value: "12+", label: "Years in Business", icon: <TreeIcon /> },
              { value: "4.9", label: "Average Rating", icon: <StarIcon /> },
              { value: "100%", label: "Licensed & Insured", icon: <ShieldIcon /> },
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
                  <span className="text-[#22c55e]">{stat.icon}</span>
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
        style={{ background: "linear-gradient(180deg, #0a0a0a 0%, #0a140a 50%, #0a0a0a 100%)" }}
      >
        <LeafPattern />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[10%] right-[5%] w-[500px] h-[500px] rounded-full blur-[160px] bg-[#22c55e]/6" />
          <div className="absolute bottom-[10%] left-[5%] w-[400px] h-[400px] rounded-full blur-[140px] bg-[#22c55e]/4" />
          {/* Organic wave shapes */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.03]" viewBox="0 0 1000 600">
            <path d="M0 300 Q250 200 500 300 Q750 400 1000 300" stroke="#22c55e" strokeWidth="1" fill="none" />
            <path d="M0 350 Q250 250 500 350 Q750 450 1000 350" stroke="#22c55e" strokeWidth="0.5" fill="none" />
            <path d="M200 150 Q220 100 240 150 Q260 100 280 150" stroke="#22c55e" strokeWidth="0.5" fill="none" />
            <path d="M750 180 Q770 130 790 180 Q810 130 830 180" stroke="#22c55e" strokeWidth="0.5" fill="none" />
          </svg>
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="OUR SERVICES"
            title="Complete Outdoor Solutions"
            highlightWord="Solutions"
            subtitle="From weekly maintenance to full property transformations, we handle every detail so you can enjoy your space."
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, i) => (
              <motion.div
                key={service.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group relative p-7 rounded-2xl border border-white/[0.10] hover:border-[#22c55e]/30 transition-all duration-500 overflow-hidden bg-white/[0.07]"
              >
                {/* Hover glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,#22c55e15,transparent_70%)]" />
                {/* Top accent line */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#22c55e]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  {/* Number + Icon row */}
                  <div className="flex items-start justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl bg-[#22c55e]/10 border border-[#22c55e]/20 flex items-center justify-center text-[#22c55e] group-hover:bg-[#22c55e]/20 group-hover:border-[#22c55e]/40 transition-all duration-300">
                      {service.icon}
                    </div>
                    <span className="text-4xl font-extrabold text-white/[0.04] group-hover:text-[#22c55e]/10 transition-colors duration-300 leading-none">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold mb-3 group-hover:text-[#22c55e] transition-colors duration-300">{service.name}</h3>
                  <p className="text-muted text-sm leading-relaxed mb-5">{service.desc}</p>
                  {/* Feature tags */}
                  <div className="flex flex-wrap gap-2">
                    {service.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-semibold uppercase tracking-wider text-[#22c55e]/70 bg-[#22c55e]/8 border border-[#22c55e]/10 px-2.5 py-1 rounded-full"
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

      {/* ════════════════ Project Gallery / Transformations ════════════════ */}
      <section
        id="about"
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0a140a 0%, #0d1a0d 50%, #0a140a 100%)" }}
      >
        <LeafPattern opacity={0.025} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[25%] left-[8%] w-[500px] h-[500px] rounded-full blur-[160px] bg-[#22c55e]/6" />
          <div className="absolute bottom-[15%] right-[10%] w-[400px] h-[400px] rounded-full blur-[140px] bg-[#22c55e]/4" />
          {/* Organic bottom wave */}
          <svg className="absolute bottom-0 left-0 w-full opacity-[0.04]" viewBox="0 0 1440 200" fill="none">
            <path d="M0 100 C360 0 720 200 1080 100 C1260 50 1440 100 1440 100 V200 H0Z" fill="#22c55e" />
          </svg>
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="TRANSFORMATIONS"
            title="Recent Projects"
            highlightWord="Projects"
            subtitle="Every yard has potential. See how we have turned ordinary outdoor spaces into breathtaking landscapes."
          />
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((project, i) => (
              <motion.div
                key={project.name}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group relative aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer border border-white/[0.10] hover:border-[#22c55e]/30 transition-all duration-500"
              >
                <img
                  src={project.image}
                  alt={project.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                {/* Always-visible bottom info */}
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <span className="inline-block text-[10px] font-bold uppercase tracking-[0.15em] text-[#22c55e] bg-[#22c55e]/15 border border-[#22c55e]/25 px-2.5 py-1 rounded-full mb-2">
                    {project.type}
                  </span>
                  <h3 className="text-white font-bold text-lg leading-tight">{project.name}</h3>
                </div>
                {/* Hover overlay with full details */}
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center p-6">
                  <div className="text-center">
                    <span className="inline-block text-[10px] font-bold uppercase tracking-[0.15em] text-[#22c55e] bg-[#22c55e]/15 border border-[#22c55e]/25 px-3 py-1 rounded-full mb-3">
                      {project.type}
                    </span>
                    <h3 className="text-white font-bold text-xl mb-2">{project.name}</h3>
                    <p className="text-white/60 text-sm leading-relaxed mb-3">{project.detail}</p>
                    <span className="text-[#22c55e] text-xs font-bold">{project.area}</span>
                    <div className="mt-4">
                      <span className="inline-block text-[#22c55e] text-xs font-semibold border border-[#22c55e]/40 px-4 py-1.5 rounded-full hover:bg-[#22c55e]/10 transition-colors">
                        View Full Project
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ Why Choose Us ════════════════ */}
      <section
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0a0a0a 0%, #0c160c 50%, #0a0a0a 100%)" }}
      >
        <LeafPattern />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] left-[5%] w-[500px] h-[500px] rounded-full blur-[160px] bg-[#22c55e]/5" />
          <div className="absolute bottom-[10%] right-[10%] w-[350px] h-[350px] rounded-full blur-[140px] bg-[#22c55e]/4" />
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
                    src="https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=600&q=80"
                    alt="Beautiful landscaped garden"
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Secondary image */}
                <div className="absolute bottom-0 right-0 w-[65%] h-[55%] rounded-2xl overflow-hidden border-2 border-white/[0.10] shadow-2xl z-20">
                  <img
                    src="https://images.unsplash.com/photo-1567521464027-f127ff144326?w=400&q=80"
                    alt="Completed patio project"
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Accent badge */}
                <div className="absolute top-[55%] left-[60%] z-30 bg-[#22c55e] rounded-2xl px-5 py-4 shadow-xl shadow-[#22c55e]/20 border border-[#4ade80]/30">
                  <span className="block text-3xl font-extrabold text-white leading-none">12+</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-white/80">Years of<br />Excellence</span>
                </div>
                {/* Decorative corner lines */}
                <div className="absolute -top-3 -left-3 w-16 h-16 border-t-2 border-l-2 border-[#22c55e]/20 rounded-tl-xl" />
                <div className="absolute -bottom-3 -right-3 w-16 h-16 border-b-2 border-r-2 border-[#22c55e]/20 rounded-br-xl" />
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
                title="Your Yard Deserves the Best"
                highlightWord="Best"
                center={false}
              />
              <p className="text-muted leading-relaxed mb-6 text-lg -mt-8">
                We are not just lawn mowers &mdash; we are outdoor living experts. From initial design to installation to year-round maintenance, we handle every detail so you can enjoy your space.
              </p>
              <p className="text-muted leading-relaxed mb-8">
                When you hire GreenScape Pro, you get a dedicated crew that treats your property like their own. We invest in the latest equipment, ongoing training, and sustainable practices that deliver results you can see and feel.
              </p>
              {/* Feature list */}
              <div className="space-y-4">
                {[
                  { icon: <ShovelIcon />, title: "Expert Craftsmen", desc: "Certified landscapers with decades of combined experience" },
                  { icon: <RecycleIcon />, title: "Eco-Friendly Approach", desc: "Organic products, native plants, and water-smart designs" },
                  { icon: <PhoneIcon />, title: "Responsive Service", desc: "Same-day estimates and dedicated project managers" },
                ].map((feature) => (
                  <div key={feature.title} className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.07] border border-white/[0.04] hover:border-[#22c55e]/20 transition-colors duration-300">
                    <div className="w-10 h-10 rounded-lg bg-[#22c55e]/10 border border-[#22c55e]/20 flex items-center justify-center text-[#22c55e] shrink-0">
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

      {/* ════════════════ Seasonal Services ════════════════ */}
      <section
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0a140a 0%, #0d1a0d 50%, #0a140a 100%)" }}
      >
        <LeafPattern opacity={0.025} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[30%] left-[15%] w-[400px] h-[400px] rounded-full blur-[150px] bg-[#22c55e]/6" />
          <div className="absolute bottom-[20%] right-[10%] w-[350px] h-[350px] rounded-full blur-[130px] bg-[#22c55e]/4" />
          <svg className="absolute inset-0 w-full h-full opacity-[0.025]" viewBox="0 0 1000 400">
            <path d="M0 200 Q250 100 500 200 Q750 300 1000 200" stroke="#22c55e" strokeWidth="0.5" fill="none" />
            <path d="M0 250 Q250 150 500 250 Q750 350 1000 250" stroke="#22c55e" strokeWidth="0.3" fill="none" />
          </svg>
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="YEAR-ROUND CARE"
            title="Seasonal Services"
            highlightWord="Seasonal"
            subtitle="Your landscape needs different care throughout the year. We have every season covered."
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                season: "Spring",
                icon: <FlowerIcon />,
                color: "#22c55e",
                services: ["Spring cleanup & debris removal", "Mulching & bed preparation", "Fertilization programs", "New plantings & sod installation"],
              },
              {
                season: "Summer",
                icon: <SunIcon />,
                color: "#eab308",
                services: ["Weekly mowing & edging", "Irrigation monitoring", "Pest & weed control", "Hedge & shrub trimming"],
              },
              {
                season: "Fall",
                icon: <WindIcon />,
                color: "#f97316",
                services: ["Leaf removal & cleanup", "Aeration & overseeding", "Fall fertilization", "Garden winterization"],
              },
              {
                season: "Winter",
                icon: <SnowflakeIcon />,
                color: "#38bdf8",
                services: ["Snow removal & de-icing", "Holiday light installation", "Dormant pruning", "Winter landscape planning"],
              },
            ].map((s, i) => (
              <motion.div
                key={s.season}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative p-7 rounded-2xl border border-white/[0.10] hover:border-[#22c55e]/30 transition-all duration-500 overflow-hidden bg-white/[0.07]"
              >
                {/* Hover glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: `radial-gradient(circle at 50% 0%, ${s.color}15, transparent 70%)` }} />
                {/* Top accent line */}
                <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl" style={{ background: `linear-gradient(90deg, transparent, ${s.color}50, transparent)` }} />
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl border flex items-center justify-center mb-4 transition-all duration-300" style={{ background: `${s.color}10`, borderColor: `${s.color}20`, color: s.color }}>
                    {s.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-5" style={{ color: s.color }}>{s.season}</h3>
                  <ul className="space-y-3">
                    {s.services.map((svc) => (
                      <li key={svc} className="flex items-start gap-2.5 text-sm text-muted">
                        <svg viewBox="0 0 24 24" fill="none" stroke={s.color} strokeWidth="2" className="w-4 h-4 mt-0.5 shrink-0 opacity-60">
                          <path d="M9 12l2 2 4-4" />
                        </svg>
                        <span>{svc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ Why GreenScape Pro Banner ════════════════ */}
      <section className="py-20 relative overflow-hidden bg-gradient-to-b from-[#22c55e]/10 to-[#0a0a0a]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#22c55e]/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#22c55e]/10 to-transparent" />
          <svg className="absolute inset-0 w-full h-full opacity-[0.04]" viewBox="0 0 1000 400">
            <path d="M0 200 Q250 100 500 200 Q750 300 1000 200" stroke="#22c55e" strokeWidth="1" fill="none" />
            <path d="M0 250 Q250 150 500 250 Q750 350 1000 250" stroke="#22c55e" strokeWidth="0.5" fill="none" />
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
              THE <span className="text-[#22c55e]">GREENSCAPE PRO</span> DIFFERENCE
            </h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <ShovelIcon />, title: "Master Craftsmen", desc: "Certified professionals with years of hands-on landscaping expertise" },
              { icon: <LeafIcon />, title: "Eco-Conscious", desc: "Organic products, native plants, and sustainable water management" },
              { icon: <PhoneIcon />, title: "Always Available", desc: "Same-day estimates, dedicated project managers, and responsive support" },
              { icon: <ShieldIcon />, title: "Fully Protected", desc: "Licensed, insured, and backed by our 100% satisfaction guarantee" },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group text-center p-6 rounded-2xl border border-white/[0.10] hover:border-[#22c55e]/30 bg-white/[0.07] transition-all duration-500"
              >
                <div className="w-14 h-14 mx-auto rounded-xl bg-[#22c55e]/10 border border-[#22c55e]/20 flex items-center justify-center text-[#22c55e] mb-4 group-hover:bg-[#22c55e]/20 group-hover:scale-110 transition-all duration-300">
                  {item.icon}
                </div>
                <h4 className="font-bold mb-2">{item.title}</h4>
                <p className="text-muted text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ Testimonials / Client Reviews ════════════════ */}
      <section
        id="testimonials"
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0a0a0a 0%, #0c160c 50%, #0a0a0a 100%)" }}
      >
        <LeafPattern />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[30%] left-[40%] w-[600px] h-[400px] rounded-full blur-[180px] bg-[#22c55e]/5" />
          <svg className="absolute inset-0 w-full h-full opacity-[0.025]" viewBox="0 0 800 400">
            <circle cx="400" cy="200" r="100" stroke="#22c55e" strokeWidth="0.5" fill="none" />
            <circle cx="400" cy="200" r="180" stroke="#22c55e" strokeWidth="0.3" fill="none" />
            <circle cx="400" cy="200" r="260" stroke="#22c55e" strokeWidth="0.2" fill="none" />
          </svg>
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="CLIENT REVIEWS"
            title="Trusted by Hundreds"
            highlightWord="Hundreds"
            subtitle="Real stories from real homeowners who trusted us with their outdoor spaces."
          />
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative p-7 rounded-2xl border border-white/[0.10] hover:border-[#22c55e]/30 transition-all duration-500 overflow-hidden bg-white/[0.07]"
              >
                {/* Top accent line */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-[#22c55e]/40 via-[#22c55e]/10 to-transparent" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_0%_0%,#22c55e10,transparent_70%)]" />
                <div className="relative z-10">
                  {/* Project type tag */}
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#22c55e]/70 bg-[#22c55e]/8 border border-[#22c55e]/10 px-2.5 py-1 rounded-full">
                    {t.projectType}
                  </span>
                  {/* Stars */}
                  <div className="flex items-center gap-0.5 text-[#22c55e] mt-4 mb-4">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <StarIcon key={j} />
                    ))}
                  </div>
                  {/* Quote */}
                  <p className="text-muted leading-relaxed mb-6 text-sm">&ldquo;{t.text}&rdquo;</p>
                  {/* Author */}
                  <div className="flex items-center gap-3 pt-4 border-t border-white/[0.10]">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#22c55e]/30 to-[#22c55e]/10 flex items-center justify-center text-sm font-bold text-[#22c55e]">
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

      {/* ════════════════ Service Area ════════════════ */}
      <section
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0a140a 0%, #0f1f0f 50%, #0a140a 100%)" }}
      >
        <LeafPattern opacity={0.02} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[40%] right-[15%] w-[500px] h-[500px] rounded-full blur-[180px] bg-[#22c55e]/6" />
          <svg className="absolute inset-0 w-full h-full opacity-[0.03]" viewBox="0 0 1000 400">
            <circle cx="500" cy="200" r="100" stroke="#22c55e" strokeWidth="0.5" fill="none" />
            <circle cx="500" cy="200" r="160" stroke="#22c55e" strokeWidth="0.3" fill="none" />
            <circle cx="500" cy="200" r="220" stroke="#22c55e" strokeWidth="0.2" fill="none" />
            <circle cx="500" cy="200" r="5" fill="#22c55e" fillOpacity="0.3" />
          </svg>
        </div>
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <SectionHeader
            tag="SERVICE AREA"
            title="Where We Work"
            highlightWord="Work"
            subtitle="We proudly serve the following communities and surrounding areas. Don&apos;t see your neighborhood? Give us a call."
          />
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {[
              "Downtown", "Westlake Hills", "Lakewood", "Maplewood", "Sunset Ridge",
              "Crestview", "Oak Park", "Riverside", "Cedar Heights", "Greenfield",
              "Willow Creek", "Summit Glen", "Brookside", "Heritage Hills", "Pine Valley",
            ].map((area, i) => (
              <motion.span
                key={area}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.03 }}
                className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#22c55e]/15 text-sm font-medium text-muted hover:text-[#22c55e] hover:border-[#22c55e]/40 hover:bg-[#22c55e]/5 transition-all duration-300 cursor-default"
              >
                <span className="text-[#22c55e]/40 group-hover:text-[#22c55e]/70 transition-colors">
                  <MapPinIcon />
                </span>
                {area}
              </motion.span>
            ))}
          </div>
          <p className="text-muted/60 text-xs">Serving a 30-mile radius from downtown. Commercial contracts available region-wide.</p>
        </div>
      </section>

      {/* ════════════════ Free Estimate Form ════════════════ */}
      <section
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0a0a0a 0%, #0d1a0d 50%, #0a0a0a 100%)" }}
      >
        <LeafPattern opacity={0.02} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-[200px] bg-[#22c55e]/6" />
        </div>
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-8 md:p-12 rounded-2xl border border-[#22c55e]/20 relative overflow-hidden bg-gradient-to-b from-[#22c55e]/[0.06] to-transparent"
          >
            {/* Inner glow */}
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,#22c55e15,transparent_60%)]" />
            {/* Corner decorations */}
            <div className="absolute top-0 left-0 w-20 h-20 border-t border-l border-[#22c55e]/30 rounded-tl-2xl" />
            <div className="absolute bottom-0 right-0 w-20 h-20 border-b border-r border-[#22c55e]/30 rounded-br-2xl" />
            <div className="relative z-10">
              <div className="text-center mb-8">
                <span className="inline-flex items-center gap-2 bg-[#22c55e]/10 text-[#22c55e] text-xs font-bold uppercase tracking-[0.2em] px-4 py-2 rounded-full mb-4 border border-[#22c55e]/20">
                  <LeafIcon />
                  FREE ESTIMATE
                </span>
                <h2 className="text-3xl md:text-4xl font-extrabold mb-3">
                  Get Your Free <span className="text-[#22c55e]">Project Quote</span>
                </h2>
                <p className="text-muted max-w-lg mx-auto">
                  Tell us about your outdoor space. We will schedule a free on-site assessment and deliver a detailed estimate within 24 hours.
                </p>
              </div>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Your Name"
                    className="w-full h-13 px-5 rounded-xl bg-white/5 border border-[#22c55e]/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#22c55e]/50 transition-colors"
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    className="w-full h-13 px-5 rounded-xl bg-white/5 border border-[#22c55e]/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#22c55e]/50 transition-colors"
                  />
                </div>
                <input
                  type="tel"
                  placeholder="Phone Number"
                  className="w-full h-13 px-5 rounded-xl bg-white/5 border border-[#22c55e]/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#22c55e]/50 transition-colors"
                />
                <textarea
                  placeholder="Describe your project or what you need help with..."
                  rows={4}
                  className="w-full px-5 py-4 rounded-xl bg-white/5 border border-[#22c55e]/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#22c55e]/50 resize-none transition-colors"
                />
                <button
                  type="button"
                  className="w-full h-14 rounded-xl bg-gradient-to-r from-[#22c55e] to-[#16a34a] text-white font-bold text-lg hover:from-[#4ade80] hover:to-[#22c55e] transition-all duration-300 shadow-lg shadow-[#22c55e]/20"
                >
                  Get My Free Estimate
                </button>
                <p className="text-center text-white/30 text-xs">
                  No spam, no pressure. Just an honest quote for your project.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ════════════════ FAQ ════════════════ */}
      <section
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0a140a 0%, #0c160c 50%, #0a140a 100%)" }}
      >
        <LeafPattern />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] left-[10%] w-[400px] h-[400px] rounded-full blur-[140px] bg-[#22c55e]/5" />
          <div className="absolute bottom-[15%] right-[10%] w-[350px] h-[350px] rounded-full blur-[120px] bg-[#22c55e]/4" />
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
                className="group p-6 rounded-2xl border border-white/[0.10] hover:border-[#22c55e]/20 transition-all duration-500 overflow-hidden relative bg-white/[0.07]"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_0%_50%,#22c55e10,transparent_70%)]" />
                <div className="relative z-10 flex gap-4">
                  <div className="w-8 h-8 shrink-0 rounded-lg bg-[#22c55e]/10 border border-[#22c55e]/20 flex items-center justify-center text-[#22c55e] text-xs font-bold mt-0.5">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div>
                    <h3 className="font-bold mb-2 text-white group-hover:text-[#22c55e] transition-colors duration-300">{faq.q}</h3>
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
        <div className="absolute inset-0 bg-gradient-to-b from-[#22c55e]/10 via-[#22c55e]/5 to-[#0a0a0a]" />
        <LeafPattern opacity={0.03} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#22c55e]/30 to-transparent" />
          <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full blur-[180px] bg-[#22c55e]/8" />
        </div>
        <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block text-[#22c55e] text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border border-[#22c55e]/20 bg-[#22c55e]/5">
              LET&apos;S GET STARTED
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold mb-4 tracking-tight">
              Ready to <span className="text-[#22c55e]">Transform Your Yard?</span>
            </h2>
            <p className="text-muted text-lg mb-10 max-w-xl mx-auto leading-relaxed">
              Spring slots fill fast. Lock in your project today with a free, no-obligation estimate from our expert team.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#contact"
                className="group inline-flex h-14 px-10 rounded-full bg-gradient-to-r from-[#22c55e] to-[#16a34a] text-white font-bold items-center justify-center text-lg hover:from-[#4ade80] hover:to-[#22c55e] transition-all duration-300 shadow-lg shadow-[#22c55e]/25 gap-2"
              >
                <span>Free Estimate</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:translate-x-1 transition-transform">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
              <a
                href="tel:5554567890"
                className="inline-flex h-14 px-10 rounded-full border-2 border-[#22c55e]/30 text-[#22c55e] font-bold items-center justify-center text-lg hover:bg-[#22c55e]/10 hover:border-[#22c55e]/50 transition-all duration-300 gap-2"
              >
                <PhoneIcon />
                <span>Call Now</span>
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </TemplateLayout>
  );
}
