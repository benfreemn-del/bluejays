"use client";

import { motion } from "framer-motion";
import TemplateLayout from "./TemplateLayout";

/* ───────────────────────── SVG Icons ───────────────────────── */

const CouchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M4 11V8a4 4 0 014-4h8a4 4 0 014 4v3" />
    <path d="M2 11a2 2 0 012-2h1v6H3a1 1 0 01-1-1v-3zM19 9h1a2 2 0 012 2v3a1 1 0 01-1 1h-2V9z" />
    <path d="M5 15h14v2a2 2 0 01-2 2H7a2 2 0 01-2-2v-2z" />
    <path d="M5 11v4h14v-4" />
  </svg>
);

const LampIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M9 2l-3 9h12L15 2H9z" />
    <line x1="12" y1="11" x2="12" y2="18" />
    <path d="M8 18h8" />
    <path d="M10 18v3h4v-3" />
  </svg>
);

const RulerIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M21.707 6.293l-4-4a1 1 0 00-1.414 0L2.293 16.293a1 1 0 000 1.414l4 4a1 1 0 001.414 0L21.707 7.707a1 1 0 000-1.414z" />
    <line x1="7" y1="13" x2="10" y2="10" />
    <line x1="11" y1="9" x2="13" y2="7" />
    <line x1="5" y1="15" x2="7" y2="13" />
  </svg>
);

const PaintRollerIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <rect x="2" y="3" width="16" height="6" rx="1" />
    <path d="M18 6h2a1 1 0 011 1v4a1 1 0 01-1 1h-8" />
    <line x1="12" y1="12" x2="12" y2="22" />
    <rect x="10" y="20" width="4" height="2" rx="0.5" />
  </svg>
);

const FrameIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <rect x="6" y="6" width="12" height="12" rx="1" />
    <path d="M6 18l4-5 3 3 2-2 3 4" />
    <circle cx="10" cy="9" r="1.5" />
  </svg>
);

const PlantIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M12 22V10" />
    <path d="M12 10C12 6 7 3 4 5c-1 .7-1.5 2-.5 4 1 2 4 3 8 1" />
    <path d="M12 10c0-4 5-7 8-5 1 .7 1.5 2 .5 4-1 2-4 3-8 1" />
    <path d="M8 22h8" />
    <path d="M9 22l1-5h4l1 5" />
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

const SparklesIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
    <path d="M5 3v4M3 5h4M6 17v4M4 19h4M13 3l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);

const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
    <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const AwardIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
    <circle cx="12" cy="8" r="6" />
    <path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12" />
  </svg>
);

/* ───────────────────────── Grid Pattern ───────────────────────── */

const GridPattern = ({ opacity = 0.03 }: { opacity?: number }) => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }}>
    <defs>
      <pattern id="designGrid" width="60" height="60" patternUnits="userSpaceOnUse">
        <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#e879f9" strokeWidth="0.5" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#designGrid)" />
  </svg>
);

/* ───────────────────────── Interior Design SVG Background ───────────────────────── */

const DesignBgPattern = ({ opacity = 0.03 }: { opacity?: number }) => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }} viewBox="0 0 800 600">
    {/* Geometric frames */}
    <rect x="80" y="80" width="120" height="90" rx="2" stroke="#e879f9" strokeWidth="0.6" fill="none" />
    <rect x="90" y="90" width="100" height="70" rx="1" stroke="#e879f9" strokeWidth="0.3" fill="none" />
    {/* Diamond shapes */}
    <path d="M650 120 L680 90 L710 120 L680 150 Z" stroke="#e879f9" strokeWidth="0.5" fill="none" />
    <path d="M650 120 L680 100 L710 120 L680 140 Z" stroke="#e879f9" strokeWidth="0.3" fill="none" />
    {/* Arch / doorway */}
    <path d="M350 450 L350 350 A50 50 0 01450 350 L450 450" stroke="#e879f9" strokeWidth="0.6" fill="none" />
    {/* Curves and lines */}
    <path d="M100 500 Q400 420 700 500" stroke="#e879f9" strokeWidth="0.4" fill="none" />
    <path d="M100 520 Q400 440 700 520" stroke="#e879f9" strokeWidth="0.25" fill="none" />
    {/* Circles */}
    <circle cx="600" cy="350" r="50" stroke="#e879f9" strokeWidth="0.3" fill="none" />
    <circle cx="600" cy="350" r="35" stroke="#e879f9" strokeWidth="0.2" fill="none" />
  </svg>
);

/* ───────────────────────── Data ───────────────────────── */

const portfolioItems = [
  {
    title: "Modern Living Room",
    category: "Living Room",
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80",
    desc: "Clean lines, warm textures, and a curated palette that turns everyday living into an experience.",
  },
  {
    title: "Chef&apos;s Kitchen Redesign",
    category: "Kitchen",
    image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=600&q=80",
    desc: "Custom cabinetry, marble countertops, and intelligent layouts that make cooking a joy.",
  },
  {
    title: "Serene Master Suite",
    category: "Bedroom",
    image: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=600&q=80",
    desc: "A sanctuary of calm with bespoke headboard, layered lighting, and luxurious textiles.",
  },
  {
    title: "Spa-Inspired Bathroom",
    category: "Bathroom",
    image: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=600&q=80",
    desc: "Freestanding tub, rain shower, and natural stone finishes that evoke a five-star retreat.",
  },
];

const designProcess = [
  {
    step: "Discovery",
    desc: "We begin with a deep-dive consultation to understand your lifestyle, taste, and vision. Every great space starts with listening.",
    icon: <SparklesIcon />,
  },
  {
    step: "Concept",
    desc: "Mood boards, 3D renderings, and material samples bring your vision to life before a single piece is moved or purchased.",
    icon: <FrameIcon />,
  },
  {
    step: "Design",
    desc: "Detailed floor plans, custom furniture selections, and a comprehensive design package with every specification documented.",
    icon: <RulerIcon />,
  },
  {
    step: "Installation",
    desc: "Our white-glove team manages every delivery, placement, and finishing touch. You walk into your completed space, stress-free.",
    icon: <PlantIcon />,
  },
];

const packages = [
  {
    name: "Refresh",
    price: "$2,500",
    desc: "Perfect for a single room that needs a new direction",
    features: [
      "1 room redesign",
      "Custom mood board",
      "Shopping list with links",
      "2 revision rounds",
      "Color palette guide",
    ],
    popular: false,
  },
  {
    name: "Signature",
    price: "$7,500",
    desc: "Our most popular package for full-home transformations",
    features: [
      "Up to 3 rooms",
      "3D renderings",
      "Custom furniture sourcing",
      "Project management",
      "Unlimited revisions",
      "Vendor coordination",
    ],
    popular: true,
  },
  {
    name: "Luxe",
    price: "$15,000+",
    desc: "Bespoke, end-to-end design for discerning clients",
    features: [
      "Unlimited rooms",
      "Custom millwork design",
      "Art curation",
      "Full renovation oversight",
      "White-glove installation",
      "Priority scheduling",
      "Ongoing styling support",
    ],
    popular: false,
  },
];

const testimonials = [
  {
    name: "Rachel H.",
    text: "Aria transformed our dated condo into something out of a magazine. Every detail was considered. We get compliments from everyone who visits.",
    projectType: "Full Home Design",
    rating: 5,
  },
  {
    name: "Daniel K.",
    text: "The 3D renderings were so accurate that the final result matched perfectly. No surprises, just a beautiful living space we absolutely love.",
    projectType: "Living Room",
    rating: 5,
  },
  {
    name: "Megan T.",
    text: "Working with Sophia felt effortless. She understood our style immediately and delivered a kitchen that is both stunning and incredibly functional.",
    projectType: "Kitchen Redesign",
    rating: 5,
  },
];

const faqs = [
  {
    q: "How much does interior design cost?",
    a: "Our packages start at $2,500 for a single room refresh. Full-home projects vary based on scope. Every project begins with a free consultation where we provide a detailed proposal with transparent pricing.",
  },
  {
    q: "Do you work with my existing furniture?",
    a: "Absolutely. We love blending new pieces with existing favorites. During the discovery phase, we identify which items stay, which get reimagined, and which get replaced.",
  },
  {
    q: "How long does a typical project take?",
    a: "A single room refresh takes 4-6 weeks. Full-home transformations typically run 3-6 months depending on scope and custom orders. We provide a detailed timeline before starting.",
  },
  {
    q: "Do you offer virtual design services?",
    a: "Yes. Our Refresh package is available as a fully virtual experience. We use video calls, 3D tools, and curated shopping links to design your space from anywhere.",
  },
  {
    q: "What areas do you serve?",
    a: "We are based in Seattle and serve the greater Puget Sound area including Bellevue, Kirkland, Tacoma, and Mercer Island. For larger projects, we travel throughout the Pacific Northwest.",
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
        className="inline-block text-[#e879f9] text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border border-[#e879f9]/20 bg-[#e879f9]/5"
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
        <span className="text-[#e879f9]">{highlightWord}</span>
        {parts[1] || ""}
      </motion.h2>
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className={`h-0.5 w-16 bg-gradient-to-r from-[#e879f9] to-transparent mt-4 ${center ? "mx-auto" : ""}`}
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

export default function InteriorDesignTemplate() {
  return (
    <TemplateLayout
      businessName="Aria Interiors"
      tagline="Transforming spaces into extraordinary experiences. Elegance, style, and soul in every room."
      accentColor="#e879f9"
      accentColorLight="#f0abfc"
      heroGradient="linear-gradient(135deg, #faf5ff 0%, #f5f0ff 100%)"
      themeMode="light"
      heroImage="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1400&q=80"
      phone="(206) 555-0131"
      address="412 Pine Street, Seattle, WA 98101"
    >
      {/* ════════════════ Style Bar ════════════════ */}
      <section className="py-3 bg-gradient-to-r from-[#e879f9] via-[#d946ef] to-[#e879f9] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9Im5vbmUiLz48cGF0aCBkPSJNMCAwTDQwIDQwTTQwIDBMMCA0MCIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjAuMyIgb3BhY2l0eT0iMC4xIi8+PC9zdmc+')] opacity-30" />
        <div className="max-w-6xl mx-auto px-6 flex flex-wrap items-center justify-center gap-6 relative z-10">
          <div className="flex items-center gap-3">
            <CouchIcon />
            <p className="text-sm font-bold tracking-wide">ELEGANCE &mdash; STYLE &mdash; TRANSFORMATION</p>
          </div>
          <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm px-5 py-2 rounded-full border border-white/20">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-yellow-500" />
            </span>
            <span className="text-xs font-bold tracking-wider">FREE CONSULTATION: (206) 555-0131</span>
          </div>
        </div>
      </section>

      {/* ════════════════ Stats Banner ════════════════ */}
      <section className="py-12 relative overflow-hidden bg-[#faf9f7] border-b border-[#e879f9]/10">
        <GridPattern opacity={0.02} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] rounded-full blur-[180px] bg-[#e879f9]/5" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "200+", label: "Spaces Transformed", icon: <SparklesIcon /> },
              { value: "12", label: "Design Awards", icon: <AwardIcon /> },
              { value: "8+", label: "Years of Design", icon: <ClockIcon /> },
              { value: "100%", label: "Client Satisfaction", icon: <CheckCircleIcon /> },
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
                  <span className="text-[#e879f9]">{stat.icon}</span>
                  <span className="text-3xl md:text-4xl font-extrabold text-[#1c1917]">{stat.value}</span>
                </div>
                <span className="text-muted text-sm font-medium tracking-wide uppercase">{stat.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ Portfolio Gallery ════════════════ */}
      <section
        id="services"
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #ffffff 0%, #faf9f7 50%, #ffffff 100%)" }}
      >
        <GridPattern />
        <DesignBgPattern opacity={0.02} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[10%] right-[5%] w-[500px] h-[500px] rounded-full blur-[160px] bg-[#e879f9]/6" />
          <div className="absolute bottom-[10%] left-[5%] w-[400px] h-[400px] rounded-full blur-[140px] bg-[#e879f9]/4" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="OUR WORK"
            title="Featured Portfolio"
            highlightWord="Portfolio"
            subtitle="A curated selection of our most breathtaking transformations. Every space tells a story of style and intention."
          />
          <div className="grid md:grid-cols-2 gap-6">
            {portfolioItems.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative rounded-2xl border border-gray-200 hover:border-[#e879f9]/30 transition-all duration-500 overflow-hidden bg-white shadow-sm hover:shadow-md"
              >
                {/* Image */}
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#faf9f7] via-[#faf9f7]/60 to-transparent" />
                  {/* Category badge */}
                  <div className="absolute top-4 right-4 bg-[#e879f9]/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full border border-[#f0abfc]/30">
                    {item.category}
                  </div>
                  {/* Number */}
                  <span className="absolute top-4 left-4 text-5xl font-extrabold text-gray-100 group-hover:text-[#e879f9]/15 transition-colors duration-300 leading-none">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {/* Info overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-xl font-bold mb-2 group-hover:text-[#e879f9] transition-colors duration-300">{item.title}</h3>
                    <p className="text-muted text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ Design Process (4 Steps) ════════════════ */}
      <section
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #faf9f7 0%, #faf5ff 50%, #faf9f7 100%)" }}
      >
        <GridPattern opacity={0.025} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[30%] left-[50%] -translate-x-1/2 w-[700px] h-[400px] rounded-full blur-[180px] bg-[#e879f9]/6" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="HOW IT WORKS"
            title="Our Design Process"
            highlightWord="Process"
            subtitle="Four seamless steps from inspiration to installation. We handle everything so you can enjoy the transformation."
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {designProcess.map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative p-7 rounded-2xl border border-gray-200 hover:border-[#e879f9]/30 transition-all duration-500 overflow-hidden bg-white shadow-sm hover:shadow-md"
              >
                {/* Hover glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,#e879f915,transparent_70%)]" />
                {/* Top accent line */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#e879f9]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl bg-[#e879f9]/10 border border-[#e879f9]/20 flex items-center justify-center text-[#e879f9] group-hover:bg-[#e879f9]/20 group-hover:border-[#e879f9]/40 transition-all duration-300">
                      {step.icon}
                    </div>
                    <span className="text-4xl font-extrabold text-gray-100 group-hover:text-[#e879f9]/10 transition-colors duration-300 leading-none">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold mb-3 group-hover:text-[#e879f9] transition-colors duration-300">
                    Step {i + 1}: {step.step}
                  </h3>
                  <p className="text-muted text-sm leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ Packages (3-Tier Pricing) ════════════════ */}
      <section
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #ffffff 0%, #faf9f7 50%, #ffffff 100%)" }}
      >
        <GridPattern />
        <DesignBgPattern opacity={0.015} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] left-[10%] w-[500px] h-[500px] rounded-full blur-[160px] bg-[#e879f9]/5" />
          <div className="absolute bottom-[15%] right-[10%] w-[400px] h-[400px] rounded-full blur-[140px] bg-[#e879f9]/4" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="PRICING"
            title="Design Packages"
            highlightWord="Packages"
            subtitle="Transparent pricing for every scope. Choose the level that matches your vision."
          />
          <div className="grid md:grid-cols-3 gap-6">
            {packages.map((pkg, i) => (
              <motion.div
                key={pkg.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`group relative p-8 rounded-2xl border transition-all duration-500 overflow-hidden ${
                  pkg.popular
                    ? "border-[#e879f9]/40 bg-gradient-to-b from-[#e879f9]/[0.08] to-transparent scale-[1.02]"
                    : "border-gray-200 hover:border-[#e879f9]/30 bg-white"
                }`}
              >
                {/* Hover glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,#e879f912,transparent_70%)]" />
                {/* Popular badge */}
                {pkg.popular && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#e879f9] text-white text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full border border-[#f0abfc]/30 shadow-lg shadow-[#e879f9]/20">
                    Most Popular
                  </div>
                )}
                {/* Top accent line */}
                {pkg.popular && (
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#e879f9]/50 to-transparent" />
                )}
                <div className="relative z-10">
                  <h3 className="text-xl font-bold mb-2 group-hover:text-[#e879f9] transition-colors duration-300">{pkg.name}</h3>
                  <div className="flex items-baseline gap-1 mb-3">
                    <span className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-white to-[#e879f9]">{pkg.price}</span>
                  </div>
                  <p className="text-muted text-sm mb-6 leading-relaxed">{pkg.desc}</p>
                  <div className="space-y-3 mb-8">
                    {pkg.features.map((feature) => (
                      <div key={feature} className="flex items-center gap-3">
                        <div className="text-[#e879f9]">
                          <CheckCircleIcon />
                        </div>
                        <span className="text-sm text-muted">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    className={`w-full h-12 rounded-xl font-bold text-sm transition-all duration-300 ${
                      pkg.popular
                        ? "bg-gradient-to-r from-[#e879f9] to-[#d946ef] text-white hover:from-[#f0abfc] hover:to-[#e879f9] shadow-lg shadow-[#e879f9]/20"
                        : "border border-[#e879f9]/30 text-[#e879f9] hover:bg-[#e879f9]/10 hover:border-[#e879f9]/50"
                    }`}
                  >
                    Book Consultation
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ About the Designer ════════════════ */}
      <section
        id="about"
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #faf9f7 0%, #faf5ff 50%, #faf9f7 100%)" }}
      >
        <GridPattern />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] left-[5%] w-[500px] h-[500px] rounded-full blur-[160px] bg-[#e879f9]/5" />
          <div className="absolute bottom-[10%] right-[10%] w-[350px] h-[350px] rounded-full blur-[140px] bg-[#e879f9]/4" />
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
                <div className="absolute top-0 left-0 w-[75%] h-[70%] rounded-2xl overflow-hidden border-2 border-gray-200 shadow-2xl z-10">
                  <img
                    src="https://images.unsplash.com/photo-1599351431613-18ef1fdd27e1?w=600&q=80"
                    alt="Design studio"
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Secondary image */}
                <div className="absolute bottom-0 right-0 w-[65%] h-[55%] rounded-2xl overflow-hidden border-2 border-gray-200 shadow-2xl z-20">
                  <img
                    src="https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=400&q=80"
                    alt="Lead designer"
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Accent badge */}
                <div className="absolute top-[55%] left-[60%] z-30 bg-[#e879f9] rounded-2xl px-5 py-4 shadow-xl shadow-[#e879f9]/20 border border-[#f0abfc]/30">
                  <span className="block text-3xl font-extrabold text-[#1c1917] leading-none">200+</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#4b5563]">Spaces<br />Designed</span>
                </div>
                {/* Decorative corner lines */}
                <div className="absolute -top-3 -left-3 w-16 h-16 border-t-2 border-l-2 border-[#e879f9]/20 rounded-tl-xl" />
                <div className="absolute -bottom-3 -right-3 w-16 h-16 border-b-2 border-r-2 border-[#e879f9]/20 rounded-br-xl" />
              </div>
            </motion.div>

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <SectionHeader
                tag="ABOUT THE DESIGNER"
                title="Meet Sophia Aria"
                highlightWord="Sophia"
                center={false}
              />
              <p className="text-muted leading-relaxed mb-6 text-lg -mt-8">
                With over 8 years of experience and a background in architecture, Sophia founded Aria Interiors to bring high-end design to homes across the Pacific Northwest.
              </p>
              <p className="text-muted leading-relaxed mb-8">
                Her philosophy is simple: great design should feel effortless. Every space she creates balances beauty with function, personality with timelessness. She has been featured in regional design publications and holds certifications from the National Council for Interior Design Qualification.
              </p>
              {/* Feature list */}
              <div className="space-y-4">
                {[
                  { icon: <AwardIcon />, title: "Award-Winning", desc: "12 regional design awards including Best Residential Interior two years running" },
                  { icon: <RulerIcon />, title: "Architecture Background", desc: "Degree in architecture ensures every design is structurally informed" },
                  { icon: <PlantIcon />, title: "Sustainable Focus", desc: "Commitment to eco-friendly materials and local artisan partnerships" },
                ].map((feature) => (
                  <div key={feature.title} className="flex items-start gap-4 p-4 rounded-xl bg-white border border-gray-100 hover:border-[#e879f9]/20 transition-colors duration-300">
                    <div className="w-10 h-10 rounded-lg bg-[#e879f9]/10 border border-[#e879f9]/20 flex items-center justify-center text-[#e879f9] shrink-0">
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
        style={{ background: "linear-gradient(180deg, #ffffff 0%, #faf9f7 50%, #ffffff 100%)" }}
      >
        <GridPattern />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[30%] left-[40%] w-[600px] h-[400px] rounded-full blur-[180px] bg-[#e879f9]/5" />
          <svg className="absolute inset-0 w-full h-full opacity-[0.025]" viewBox="0 0 800 400">
            <circle cx="400" cy="200" r="100" stroke="#e879f9" strokeWidth="0.5" fill="none" />
            <circle cx="400" cy="200" r="180" stroke="#e879f9" strokeWidth="0.3" fill="none" />
            <circle cx="400" cy="200" r="260" stroke="#e879f9" strokeWidth="0.2" fill="none" />
          </svg>
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="CLIENT LOVE"
            title="What Clients Say"
            highlightWord="Clients"
            subtitle="Real transformations. Real reactions. Hear from the people who trusted us to reimagine their spaces."
          />
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative p-7 rounded-2xl border border-gray-200 hover:border-[#e879f9]/30 transition-all duration-500 overflow-hidden bg-white shadow-sm hover:shadow-md"
              >
                {/* Top accent line */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-[#e879f9]/40 via-[#e879f9]/10 to-transparent" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_0%_0%,#e879f910,transparent_70%)]" />
                <div className="relative z-10">
                  {/* Project type tag */}
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#e879f9]/70 bg-[#e879f9]/8 border border-[#e879f9]/10 px-2.5 py-1 rounded-full">
                    {t.projectType}
                  </span>
                  {/* Stars */}
                  <div className="flex items-center gap-0.5 text-[#e879f9] mt-4 mb-4">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <StarIcon key={j} />
                    ))}
                  </div>
                  {/* Quote */}
                  <p className="text-muted leading-relaxed mb-6 text-sm">&ldquo;{t.text}&rdquo;</p>
                  {/* Author */}
                  <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#e879f9]/30 to-[#e879f9]/10 flex items-center justify-center text-sm font-bold text-[#e879f9]">
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
        style={{ background: "linear-gradient(180deg, #faf9f7 0%, #faf5ff 50%, #faf9f7 100%)" }}
      >
        <GridPattern />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] left-[10%] w-[400px] h-[400px] rounded-full blur-[140px] bg-[#e879f9]/5" />
          <div className="absolute bottom-[15%] right-[10%] w-[350px] h-[350px] rounded-full blur-[120px] bg-[#e879f9]/4" />
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
                className="group p-6 rounded-2xl border border-gray-200 hover:border-[#e879f9]/20 transition-all duration-500 overflow-hidden relative bg-white shadow-sm hover:shadow-md"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_0%_50%,#e879f910,transparent_70%)]" />
                <div className="relative z-10 flex gap-4">
                  <div className="w-8 h-8 shrink-0 rounded-lg bg-[#e879f9]/10 border border-[#e879f9]/20 flex items-center justify-center text-[#e879f9] text-xs font-bold mt-0.5">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div>
                    <h3 className="font-bold mb-2 text-[#1c1917] group-hover:text-[#e879f9] transition-colors duration-300">{faq.q}</h3>
                    <p className="text-muted text-sm leading-relaxed">{faq.a}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ Consultation CTA ════════════════ */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#e879f9]/5 via-[#e879f9]/[0.02] to-white" />
        <GridPattern opacity={0.03} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#e879f9]/30 to-transparent" />
          <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full blur-[180px] bg-[#e879f9]/8" />
        </div>
        <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block text-[#e879f9] text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border border-[#e879f9]/20 bg-[#e879f9]/5">
              START YOUR TRANSFORMATION
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold mb-4 tracking-tight">
              Ready for a Space You <span className="text-[#e879f9]">Love?</span>
            </h2>
            <p className="text-muted text-lg mb-10 max-w-xl mx-auto leading-relaxed">
              Book a complimentary design consultation and discover how Aria Interiors can transform your space into something truly extraordinary.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#contact"
                className="group inline-flex h-14 px-10 rounded-full bg-gradient-to-r from-[#e879f9] to-[#d946ef] text-white font-bold items-center justify-center text-lg hover:from-[#f0abfc] hover:to-[#e879f9] transition-all duration-300 shadow-lg shadow-[#e879f9]/25 gap-2"
              >
                <span>Free Consultation</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:translate-x-1 transition-transform">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
              <a
                href="tel:2065550131"
                className="inline-flex h-14 px-10 rounded-full border-2 border-[#e879f9]/30 text-[#e879f9] font-bold items-center justify-center text-lg hover:bg-[#e879f9]/10 hover:border-[#e879f9]/50 transition-all duration-300 gap-2"
              >
                <PhoneIcon />
                <span>(206) 555-0131</span>
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </TemplateLayout>
  );
}
