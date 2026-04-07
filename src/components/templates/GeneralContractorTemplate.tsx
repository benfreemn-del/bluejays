"use client";

import { motion } from "framer-motion";
import TemplateLayout from "./TemplateLayout";

/* ───────────────────────── SVG Icons ───────────────────────── */

const HammerIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
  </svg>
);

const BlueprintIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    <path d="M9 8h2" />
  </svg>
);

const HardHatIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M2 18h20M4 18v-3a8 8 0 0116 0v3" />
    <path d="M12 3v4M8 7.5A4.97 4.97 0 0012 7c1.5 0 2.87.53 3.94 1.41" />
    <path d="M3 15h18" />
  </svg>
);

const RulerIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M3 5h18v14H3z" />
    <path d="M7 5v4M11 5v6M15 5v4M19 5v3" />
  </svg>
);

const HouseFrameIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const HandshakeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M7 11l3.5 3.5L17 8" />
    <path d="M20.42 4.58a5.4 5.4 0 00-7.65 0l-.77.78-.77-.78a5.4 5.4 0 00-7.65 0A5.4 5.4 0 003.58 12L12 20.42 20.42 12a5.4 5.4 0 000-7.42z" />
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

const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
    <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
    <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const TrophyIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
    <path d="M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
  </svg>
);

/* ───────────────────────── Blueprint Grid Pattern ───────────────────────── */

const BlueprintGrid = ({ opacity = 0.03 }: { opacity?: number }) => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }}>
    <defs>
      <pattern id="contractorGrid" width="80" height="80" patternUnits="userSpaceOnUse">
        <path d="M 80 0 L 0 0 0 80" fill="none" stroke="#78716c" strokeWidth="0.5" />
        <path d="M 40 0 L 40 80" fill="none" stroke="#78716c" strokeWidth="0.2" />
        <path d="M 0 40 L 80 40" fill="none" stroke="#78716c" strokeWidth="0.2" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#contractorGrid)" />
  </svg>
);

/* ───────────────────────── Data ───────────────────────── */

const services = [
  {
    name: "Kitchen Remodeling",
    desc: "Complete kitchen transformations from concept to completion. Custom cabinetry, countertops, tile, plumbing, electrical, and appliance integration done right.",
    icon: <HouseFrameIcon />,
    tags: ["Custom Cabinets", "Countertops", "Full Gut Reno"],
  },
  {
    name: "Bathroom Remodeling",
    desc: "Spa-inspired bathroom renovations that elevate daily living. Walk-in showers, soaker tubs, heated floors, and premium tile work with flawless craftsmanship.",
    icon: <RulerIcon />,
    tags: ["Walk-in Shower", "Tile Work", "Custom Vanity"],
  },
  {
    name: "Home Additions",
    desc: "Expand your living space without the hassle of moving. Second stories, bump-outs, sunrooms, and garage conversions that blend seamlessly with your existing home.",
    icon: <BlueprintIcon />,
    tags: ["Second Story", "Bump-Outs", "Sunrooms"],
  },
  {
    name: "Whole-Home Renovation",
    desc: "Full-scale home transformations that modernize every corner. Open floor plans, structural modifications, new systems, and designer finishes throughout.",
    icon: <HammerIcon />,
    tags: ["Open Concept", "Structural", "Full Systems"],
  },
  {
    name: "Commercial Build-Outs",
    desc: "Office renovations, retail spaces, and restaurant build-outs delivered on schedule and on budget. Tenant improvements and ground-up commercial construction.",
    icon: <HardHatIcon />,
    tags: ["Office TI", "Retail", "Restaurant"],
  },
  {
    name: "ADU & Tiny Homes",
    desc: "Accessory dwelling units and backyard cottages that maximize your property value. Permitted, code-compliant ADUs designed for rental income or multigenerational living.",
    icon: <HandshakeIcon />,
    tags: ["DADU", "Backyard Cottage", "Rental Income"],
  },
];

const portfolioItems = [
  {
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80",
    title: "Modern Kitchen Transformation",
    desc: "Complete gut renovation with custom walnut cabinetry",
    category: "Kitchen Remodel",
  },
  {
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80",
    title: "Craftsman Home Addition",
    desc: "700 sq ft second-story addition matching original style",
    category: "Addition",
  },
  {
    image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=600&q=80",
    title: "Spa Bathroom Suite",
    desc: "Master bath with heated floors and walk-in rain shower",
    category: "Bathroom Remodel",
  },
  {
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&q=80",
    title: "Backyard ADU",
    desc: "600 sq ft permitted ADU with full kitchen and bath",
    category: "ADU",
  },
];

const processSteps = [
  {
    step: "01",
    name: "Discovery & Consultation",
    desc: "We visit your site, listen to your vision, assess the existing conditions, and discuss budget and timeline to ensure we are fully aligned before a single nail is driven.",
  },
  {
    step: "02",
    name: "Design & Engineering",
    desc: "Our in-house design team creates detailed plans, 3D renderings, and engineering documents. You see exactly what you are getting before construction begins.",
  },
  {
    step: "03",
    name: "Permitting & Approvals",
    desc: "We handle all permits, HOA approvals, and code compliance. Our strong relationships with Seattle building officials keep the process moving efficiently.",
  },
  {
    step: "04",
    name: "Construction & Craftsmanship",
    desc: "Our skilled crews execute the build with precision. Weekly updates, clean job sites, and a dedicated project manager keep you informed and stress-free.",
  },
  {
    step: "05",
    name: "Final Walkthrough & Warranty",
    desc: "A meticulous punch-list walkthrough ensures every detail meets our standards and yours. Backed by our comprehensive 5-year craftsmanship warranty.",
  },
];

const testimonials = [
  {
    name: "Karen & Tom H.",
    text: "Puget Builders transformed our 1960s kitchen into a modern showpiece. They finished on time, on budget, and the quality is exceptional. We have already hired them for our bathroom next.",
    project: "Kitchen Remodel",
    rating: 5,
  },
  {
    name: "Michael S.",
    text: "Adding a second story to our bungalow was a huge undertaking. They managed every detail from permits to final paint. The new space blends perfectly with the original character of the home.",
    project: "Home Addition",
    rating: 5,
  },
  {
    name: "Lisa & Dan P.",
    text: "Our ADU is generating rental income that covers our mortgage. The design is beautiful, permitting was handled completely by their team, and tenants love living there. Best investment ever.",
    project: "ADU Build",
    rating: 5,
  },
];

const faqs = [
  {
    q: "How much does a kitchen remodel cost?",
    a: "Kitchen remodels in the Seattle area typically range from $45,000 to $150,000+ depending on scope, materials, and layout changes. We provide detailed, transparent estimates during your free consultation so there are never surprises.",
  },
  {
    q: "How long will my project take?",
    a: "Timelines vary by project scope. A bathroom remodel averages 4 to 6 weeks, kitchen remodels 8 to 12 weeks, and additions 12 to 20 weeks. We provide a detailed construction schedule before breaking ground and keep you updated weekly.",
  },
  {
    q: "Do you handle permits?",
    a: "Absolutely. We manage the entire permitting process including plan submittal, revisions, inspections, and final sign-off. Our team has deep experience with Seattle DCI and surrounding jurisdictions.",
  },
  {
    q: "Are you licensed and insured?",
    a: "Yes. We are a fully licensed general contractor (WA #PUGETBG882QK), bonded, and carry comprehensive general liability and workers compensation insurance. Copies are provided upon request.",
  },
  {
    q: "Do you offer a warranty?",
    a: "Every project comes with our 5-year craftsmanship warranty covering workmanship and materials. Major structural work includes a 10-year structural warranty for complete peace of mind.",
  },
  {
    q: "Can I live in my home during renovation?",
    a: "In most cases, yes. We plan phased construction to minimize disruption. For whole-home renovations, we will discuss the best approach during planning. Many clients stay in their home throughout the entire project.",
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
        className="inline-block text-[#78716c] text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border border-[#78716c]/20 bg-[#78716c]/5"
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
        <span className="text-[#a8a29e]">{highlightWord}</span>
        {parts[1] || ""}
      </motion.h2>
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className={`h-0.5 w-16 bg-gradient-to-r from-[#a8a29e] to-transparent mt-4 ${center ? "mx-auto" : ""}`}
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

export default function GeneralContractorTemplate() {
  return (
    <TemplateLayout
      businessName="Puget Builders Group"
      tagline="Seattle's premier general contractor. Quality craftsmanship, on time and on budget since 2008."
      accentColor="#78716c"
      accentColorLight="#a8a29e"
      heroGradient="linear-gradient(135deg, #1c1917 0%, #0f0e0d 100%)"
      heroImage="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1400&q=80"
      phone="(206) 555-0137"
      address="1520 Western Ave, Seattle, WA 98101"
    >
      {/* ════════════════ Builder Bar ════════════════ */}
      <section className="py-3 bg-gradient-to-r from-[#78716c] via-[#57534e] to-[#78716c] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9Im5vbmUiLz48cGF0aCBkPSJNMCAwTDQwIDQwTTQwIDBMMCA0MCIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjAuMyIgb3BhY2l0eT0iMC4xIi8+PC9zdmc+')] opacity-30" />
        <div className="max-w-6xl mx-auto px-6 flex flex-wrap items-center justify-center gap-6 relative z-10">
          <div className="flex items-center gap-3">
            <HammerIcon />
            <p className="text-sm font-bold tracking-wide">FREE ESTIMATES &mdash; LICENSED, BONDED &amp; INSURED</p>
          </div>
          <a href="tel:2065550137" className="flex items-center gap-2 bg-white/15 backdrop-blur-sm px-5 py-2 rounded-full border border-white/20 hover:bg-white/25 transition-colors">
            <PhoneIcon />
            <span className="text-xs font-bold tracking-wider">(206) 555-0137</span>
          </a>
        </div>
      </section>

      {/* ════════════════ Stats Banner ════════════════ */}
      <section className="py-12 relative overflow-hidden bg-[#0c0b0a] border-b border-[#78716c]/10">
        <BlueprintGrid opacity={0.02} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] rounded-full blur-[180px] bg-[#78716c]/5" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "500+", label: "Projects Completed", icon: <TrophyIcon /> },
              { value: "17+", label: "Years Experience", icon: <ClockIcon /> },
              { value: "$85M+", label: "In Construction", icon: <HammerIcon /> },
              { value: "100%", label: "Permit Approval Rate", icon: <ShieldIcon /> },
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
                  <span className="text-[#a8a29e]">{stat.icon}</span>
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
        style={{ background: "linear-gradient(180deg, #0a0908 0%, #121110 50%, #0a0908 100%)" }}
      >
        <BlueprintGrid />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[10%] right-[5%] w-[500px] h-[500px] rounded-full blur-[160px] bg-[#78716c]/6" />
          <div className="absolute bottom-[10%] left-[5%] w-[400px] h-[400px] rounded-full blur-[140px] bg-[#78716c]/4" />
        </div>
        {/* Construction silhouette */}
        <svg className="absolute bottom-0 left-0 w-full opacity-[0.02] pointer-events-none" viewBox="0 0 1200 200">
          <path d="M0 200 L0 120 L50 120 L50 80 L100 80 L100 120 L200 120 L200 60 L250 40 L300 60 L300 120 L400 120 L400 100 L450 100 L450 120 L600 120 L600 70 L650 50 L700 70 L700 120 L800 120 L800 90 L850 90 L850 120 L1000 120 L1000 80 L1050 60 L1100 80 L1100 120 L1200 120 L1200 200Z" stroke="#78716c" strokeWidth="0.5" fill="none" />
        </svg>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="WHAT WE BUILD"
            title="Our Construction Services"
            highlightWord="Construction Services"
            subtitle="From kitchen remodels to ground-up construction, we deliver quality craftsmanship that stands the test of time."
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, i) => (
              <motion.div
                key={service.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group relative p-7 rounded-2xl border border-white/[0.06] hover:border-[#78716c]/30 transition-all duration-500 overflow-hidden bg-white/[0.02]"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,#78716c15,transparent_70%)]" />
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#78716c]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl bg-[#78716c]/10 border border-[#78716c]/20 flex items-center justify-center text-[#a8a29e] group-hover:bg-[#78716c]/20 group-hover:border-[#78716c]/40 transition-all duration-300">
                      {service.icon}
                    </div>
                    <span className="text-4xl font-extrabold text-white/[0.04] group-hover:text-[#78716c]/10 transition-colors duration-300 leading-none">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold mb-3 group-hover:text-[#a8a29e] transition-colors duration-300">{service.name}</h3>
                  <p className="text-muted text-sm leading-relaxed mb-5">{service.desc}</p>
                  <div className="flex flex-wrap gap-2">
                    {service.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-semibold uppercase tracking-wider text-[#a8a29e]/70 bg-[#78716c]/8 border border-[#78716c]/10 px-2.5 py-1 rounded-full"
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

      {/* ════════════════ Project Portfolio ════════════════ */}
      <section
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #121110 0%, #16140f 50%, #121110 100%)" }}
      >
        <BlueprintGrid opacity={0.025} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] left-[5%] w-[500px] h-[500px] rounded-full blur-[160px] bg-[#78716c]/5" />
          <div className="absolute bottom-[10%] right-[10%] w-[350px] h-[350px] rounded-full blur-[140px] bg-[#78716c]/4" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="OUR WORK"
            title="Project Portfolio"
            highlightWord="Portfolio"
            subtitle="A showcase of our finest builds across the greater Seattle area. Every project delivered on time, on budget, and built to last."
          />
          <div className="grid md:grid-cols-2 gap-6">
            {portfolioItems.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative rounded-2xl overflow-hidden border border-white/[0.06] hover:border-[#78716c]/30 transition-all duration-500"
              >
                <div className="aspect-[16/10] overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0908] via-[#0a0908]/30 to-transparent" />
                </div>
                <div className="absolute top-4 right-4">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a8a29e] bg-[#78716c]/20 backdrop-blur-sm border border-[#78716c]/20 px-3 py-1.5 rounded-full">
                    {item.category}
                  </span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-lg font-bold mb-1 group-hover:text-[#a8a29e] transition-colors duration-300">{item.title}</h3>
                  <p className="text-muted text-sm">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ Our Process ════════════════ */}
      <section
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0a0908 0%, #0e0d0c 50%, #0a0908 100%)" }}
      >
        <BlueprintGrid />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[30%] left-[50%] -translate-x-1/2 w-[700px] h-[400px] rounded-full blur-[180px] bg-[#78716c]/6" />
        </div>
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="HOW WE WORK"
            title="Our Proven Process"
            highlightWord="Proven Process"
            subtitle="A systematic approach refined over 500+ projects that delivers predictable results and eliminates surprises."
          />
          <div className="space-y-6">
            {processSteps.map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative flex gap-6 p-6 rounded-2xl border border-white/[0.06] hover:border-[#78716c]/30 transition-all duration-500 overflow-hidden bg-white/[0.02]"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_0%_50%,#78716c10,transparent_70%)]" />
                <div className="relative z-10 flex gap-6 items-start">
                  <div className="w-14 h-14 shrink-0 rounded-xl bg-[#78716c]/10 border border-[#78716c]/20 flex items-center justify-center text-[#a8a29e] text-lg font-extrabold group-hover:bg-[#78716c]/20 group-hover:border-[#78716c]/40 transition-all duration-300">
                    {step.step}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-2 group-hover:text-[#a8a29e] transition-colors duration-300">{step.name}</h3>
                    <p className="text-muted text-sm leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ Licensing & Permits ════════════════ */}
      <section className="py-20 relative overflow-hidden bg-gradient-to-b from-[#78716c]/10 to-[#0a0908]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#78716c]/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#78716c]/10 to-transparent" />
          <svg className="absolute inset-0 w-full h-full opacity-[0.04]" viewBox="0 0 1000 400">
            <path d="M0 200 Q250 100 500 200 Q750 300 1000 200" stroke="#78716c" strokeWidth="1" fill="none" />
            <path d="M0 250 Q250 150 500 250 Q750 350 1000 250" stroke="#78716c" strokeWidth="0.5" fill="none" />
            <rect x="420" y="120" width="160" height="160" stroke="#78716c" strokeWidth="0.3" fill="none" rx="8" />
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
              FULLY LICENSED &amp; <span className="text-[#a8a29e]">INSURED</span>
            </h2>
            <p className="text-muted mt-4 max-w-2xl mx-auto">
              Your project is protected by comprehensive licensing, bonding, and insurance. We handle all permits and code compliance so you never have to worry.
            </p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <ShieldIcon />, title: "Licensed GC", desc: "Washington State General Contractor License #PUGETBG882QK" },
              { icon: <CheckCircleIcon />, title: "Fully Bonded", desc: "Contractor's bond protects you from financial loss on every project" },
              { icon: <HardHatIcon />, title: "Workers Comp", desc: "Full workers compensation coverage for every crew member on site" },
              { icon: <BlueprintIcon />, title: "Permit Experts", desc: "100% permit approval rate across Seattle, Bellevue, and King County" },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group text-center p-6 rounded-2xl border border-white/[0.06] hover:border-[#78716c]/30 bg-white/[0.02] transition-all duration-500"
              >
                <div className="w-14 h-14 mx-auto rounded-xl bg-[#78716c]/10 border border-[#78716c]/20 flex items-center justify-center text-[#a8a29e] mb-4 group-hover:bg-[#78716c]/20 group-hover:scale-110 transition-all duration-300">
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
        style={{ background: "linear-gradient(180deg, #0a0908 0%, #0e0d0c 50%, #0a0908 100%)" }}
      >
        <BlueprintGrid />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[30%] left-[40%] w-[600px] h-[400px] rounded-full blur-[180px] bg-[#78716c]/5" />
          <svg className="absolute inset-0 w-full h-full opacity-[0.025]" viewBox="0 0 800 400">
            <circle cx="400" cy="200" r="100" stroke="#78716c" strokeWidth="0.5" fill="none" />
            <circle cx="400" cy="200" r="180" stroke="#78716c" strokeWidth="0.3" fill="none" />
            <circle cx="400" cy="200" r="260" stroke="#78716c" strokeWidth="0.2" fill="none" />
          </svg>
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="CLIENT TESTIMONIALS"
            title="Built on Trust"
            highlightWord="Trust"
            subtitle="Real feedback from homeowners and businesses who chose Puget Builders for their most important projects."
          />
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative p-7 rounded-2xl border border-white/[0.06] hover:border-[#78716c]/30 transition-all duration-500 overflow-hidden bg-white/[0.02]"
              >
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-[#78716c]/40 via-[#78716c]/10 to-transparent" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_0%_0%,#78716c10,transparent_70%)]" />
                <div className="relative z-10">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a8a29e]/70 bg-[#78716c]/8 border border-[#78716c]/10 px-2.5 py-1 rounded-full">
                    {t.project}
                  </span>
                  <div className="flex items-center gap-0.5 text-[#a8a29e] mt-4 mb-4">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <StarIcon key={j} />
                    ))}
                  </div>
                  <p className="text-muted leading-relaxed mb-6 text-sm">&ldquo;{t.text}&rdquo;</p>
                  <div className="flex items-center gap-3 pt-4 border-t border-white/[0.06]">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#78716c]/30 to-[#78716c]/10 flex items-center justify-center text-sm font-bold text-[#a8a29e]">
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

      {/* ════════════════ Free Estimate Form ════════════════ */}
      <section
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #121110 0%, #16140f 50%, #121110 100%)" }}
      >
        <BlueprintGrid opacity={0.02} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-[200px] bg-[#78716c]/6" />
        </div>
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-8 md:p-12 rounded-2xl border border-[#78716c]/20 relative overflow-hidden bg-gradient-to-b from-[#78716c]/[0.06] to-transparent"
          >
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,#78716c15,transparent_60%)]" />
            <div className="absolute top-0 left-0 w-20 h-20 border-t border-l border-[#78716c]/30 rounded-tl-2xl" />
            <div className="absolute bottom-0 right-0 w-20 h-20 border-b border-r border-[#78716c]/30 rounded-br-2xl" />
            <div className="relative z-10">
              <div className="text-center mb-8">
                <span className="inline-flex items-center gap-2 bg-[#78716c]/10 text-[#a8a29e] text-xs font-bold uppercase tracking-[0.2em] px-4 py-2 rounded-full mb-4 border border-[#78716c]/20">
                  <HammerIcon />
                  FREE ESTIMATE
                </span>
                <h2 className="text-3xl md:text-4xl font-extrabold mb-3">
                  Ready to <span className="text-[#a8a29e]">Build?</span>
                </h2>
                <p className="text-muted max-w-lg mx-auto">
                  Tell us about your project and we will provide a detailed, no-obligation estimate. Most estimates delivered within 48 hours.
                </p>
              </div>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Your Name"
                    className="w-full h-13 px-5 rounded-xl bg-white/5 border border-[#78716c]/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#78716c]/50 transition-colors"
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    className="w-full h-13 px-5 rounded-xl bg-white/5 border border-[#78716c]/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#78716c]/50 transition-colors"
                  />
                </div>
                <input
                  type="tel"
                  placeholder="Phone Number"
                  className="w-full h-13 px-5 rounded-xl bg-white/5 border border-[#78716c]/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#78716c]/50 transition-colors"
                />
                <select className="w-full h-13 px-5 rounded-xl bg-white/5 border border-[#78716c]/15 text-white/50 text-sm focus:outline-none focus:border-[#78716c]/50 transition-colors appearance-none">
                  <option value="">Select Project Type</option>
                  <option value="kitchen">Kitchen Remodel</option>
                  <option value="bathroom">Bathroom Remodel</option>
                  <option value="addition">Home Addition</option>
                  <option value="wholehome">Whole-Home Renovation</option>
                  <option value="commercial">Commercial Build-Out</option>
                  <option value="adu">ADU / Tiny Home</option>
                </select>
                <textarea
                  placeholder="Describe your project vision, scope, and approximate budget..."
                  rows={4}
                  className="w-full px-5 py-4 rounded-xl bg-white/5 border border-[#78716c]/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#78716c]/50 resize-none transition-colors"
                />
                <button
                  type="button"
                  className="w-full h-14 rounded-xl bg-gradient-to-r from-[#78716c] to-[#57534e] text-white font-bold text-lg hover:from-[#a8a29e] hover:to-[#78716c] transition-all duration-300 shadow-lg shadow-[#78716c]/20"
                >
                  Request Free Estimate
                </button>
                <p className="text-center text-white/30 text-xs">
                  No obligation. Your information is kept confidential and never shared with third parties.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ════════════════ FAQ ════════════════ */}
      <section
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0a0908 0%, #0e0d0c 50%, #0a0908 100%)" }}
      >
        <BlueprintGrid />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] left-[10%] w-[400px] h-[400px] rounded-full blur-[140px] bg-[#78716c]/5" />
          <div className="absolute bottom-[15%] right-[10%] w-[350px] h-[350px] rounded-full blur-[120px] bg-[#78716c]/4" />
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
                className="group p-6 rounded-2xl border border-white/[0.06] hover:border-[#78716c]/20 transition-all duration-500 overflow-hidden relative bg-white/[0.02]"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_0%_50%,#78716c10,transparent_70%)]" />
                <div className="relative z-10 flex gap-4">
                  <div className="w-8 h-8 shrink-0 rounded-lg bg-[#78716c]/10 border border-[#78716c]/20 flex items-center justify-center text-[#a8a29e] text-xs font-bold mt-0.5">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div>
                    <h3 className="font-bold mb-2 text-white group-hover:text-[#a8a29e] transition-colors duration-300">{faq.q}</h3>
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
        <div className="absolute inset-0 bg-gradient-to-b from-[#78716c]/10 via-[#78716c]/5 to-[#0a0908]" />
        <BlueprintGrid opacity={0.03} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#78716c]/30 to-transparent" />
          <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full blur-[180px] bg-[#78716c]/8" />
        </div>
        <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block text-[#a8a29e] text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border border-[#78716c]/20 bg-[#78716c]/5">
              START YOUR PROJECT
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold mb-4 tracking-tight">
              Let&apos;s Build <span className="text-[#a8a29e]">Something Great</span>
            </h2>
            <p className="text-muted text-lg mb-10 max-w-xl mx-auto leading-relaxed">
              Whether it is a dream kitchen, a new addition, or a complete transformation, Puget Builders delivers craftsmanship you can trust. On time. On budget. Built to last.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#contact"
                className="group inline-flex h-14 px-10 rounded-full bg-gradient-to-r from-[#78716c] to-[#57534e] text-white font-bold items-center justify-center text-lg hover:from-[#a8a29e] hover:to-[#78716c] transition-all duration-300 shadow-lg shadow-[#78716c]/25 gap-2"
              >
                <span>Free Estimate</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:translate-x-1 transition-transform">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
              <a
                href="tel:2065550137"
                className="inline-flex h-14 px-10 rounded-full border-2 border-[#78716c]/30 text-[#a8a29e] font-bold items-center justify-center text-lg hover:bg-[#78716c]/10 hover:border-[#78716c]/50 transition-all duration-300 gap-2"
              >
                <PhoneIcon />
                <span>(206) 555-0137</span>
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </TemplateLayout>
  );
}
