"use client";

/* eslint-disable @next/next/no-img-element -- These static marketing and preview components intentionally use plain img tags to preserve existing markup and visual behavior during lint-only cleanup. */

import { motion } from "framer-motion";
import TemplateLayout from "./TemplateLayout";

/* ───────────────────────── SVG Icons ───────────────────────── */

const ScissorsIcon = ({ className = "w-7 h-7" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
    <circle cx="6" cy="6" r="3" />
    <circle cx="6" cy="18" r="3" />
    <path d="M20 4L8.12 15.88M14.47 14.48L20 20M8.12 8.12L12 12" />
  </svg>
);

const CombIcon = ({ className = "w-7 h-7" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
    <path d="M4 2v20M4 4h6M4 7h6M4 10h6M4 13h6M4 16h6M4 19h6" strokeLinecap="round" />
  </svg>
);

const MirrorIcon = ({ className = "w-7 h-7" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
    <ellipse cx="12" cy="10" rx="7" ry="8" />
    <path d="M10 18l-1 4h6l-1-4" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8 22h8" strokeLinecap="round" />
  </svg>
);

const BrushIcon = ({ className = "w-7 h-7" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
    <path d="M20 4l-6 6M14 10l-2.5 2.5a2 2 0 01-2.83 0L7.5 11.3a2 2 0 010-2.83L10 6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8.5 12.5L4 20l7.5-4.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const DryerIcon = ({ className = "w-7 h-7" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
    <path d="M5 12a7 7 0 0114 0v1a3 3 0 01-3 3H8a3 3 0 01-3-3v-1z" />
    <path d="M12 5V2M9 6l-2-3M15 6l2-3" strokeLinecap="round" />
    <path d="M8 16v4a2 2 0 002 2h4a2 2 0 002-2v-4" />
  </svg>
);

const SparkleIcon = ({ className = "w-7 h-7" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
    <path d="M12 2l2 7h7l-5.5 4 2 7L12 16l-5.5 4 2-7L3 9h7l2-7z" strokeLinejoin="round" />
  </svg>
);

const HeartIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
  </svg>
);

const CalendarIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const StarIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const CameraIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);

/* ───────────────────────── Decorative Patterns ───────────────────────── */

const SalonPattern = ({ opacity = 0.03 }: { opacity?: number }) => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }}>
    <defs>
      <pattern id="salonDeco" width="120" height="120" patternUnits="userSpaceOnUse">
        {/* Scissors outline */}
        <circle cx="30" cy="30" r="8" fill="none" stroke="#ec4899" strokeWidth="0.4" />
        <circle cx="30" cy="50" r="8" fill="none" stroke="#ec4899" strokeWidth="0.4" />
        <line x1="38" y1="30" x2="55" y2="40" stroke="#ec4899" strokeWidth="0.4" />
        <line x1="38" y1="50" x2="55" y2="40" stroke="#ec4899" strokeWidth="0.4" />
        {/* Comb outline */}
        <line x1="80" y1="20" x2="80" y2="100" stroke="#ec4899" strokeWidth="0.3" />
        <line x1="80" y1="30" x2="95" y2="30" stroke="#ec4899" strokeWidth="0.3" />
        <line x1="80" y1="45" x2="95" y2="45" stroke="#ec4899" strokeWidth="0.3" />
        <line x1="80" y1="60" x2="95" y2="60" stroke="#ec4899" strokeWidth="0.3" />
        <line x1="80" y1="75" x2="95" y2="75" stroke="#ec4899" strokeWidth="0.3" />
        <line x1="80" y1="90" x2="95" y2="90" stroke="#ec4899" strokeWidth="0.3" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#salonDeco)" />
  </svg>
);

const CurvedLines = ({ opacity = 0.04 }: { opacity?: number }) => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }} viewBox="0 0 1000 600" preserveAspectRatio="none">
    <path d="M0 300 Q200 100 400 300 Q600 500 800 300 Q900 200 1000 300" stroke="#ec4899" strokeWidth="0.8" fill="none" />
    <path d="M0 350 Q200 150 400 350 Q600 550 800 350 Q900 250 1000 350" stroke="#ec4899" strokeWidth="0.4" fill="none" />
    <path d="M0 250 Q200 50 400 250 Q600 450 800 250 Q900 150 1000 250" stroke="#ec4899" strokeWidth="0.3" fill="none" />
  </svg>
);

/* ───────────────────────── Data ───────────────────────── */

const menuItems = [
  {
    category: "Hair",
    icon: <ScissorsIcon />,
    items: [
      { name: "Women's Cut & Style", price: "$65+", desc: "Consultation, shampoo, precision cut, blowout" },
      { name: "Men's Cut", price: "$35+", desc: "Classic or modern, hot towel finish" },
      { name: "Blowout & Styling", price: "$45+", desc: "Wash, round brush blowout, finishing" },
      { name: "Kids Cut (12 & under)", price: "$25+", desc: "Patient, fun, age-appropriate styling" },
      { name: "Special Occasion Updo", price: "$85+", desc: "Prom, gala, editorial updos" },
    ],
  },
  {
    category: "Color",
    icon: <BrushIcon />,
    items: [
      { name: "Full Color", price: "$120+", desc: "Root to tip, single process" },
      { name: "Highlights / Balayage", price: "$150+", desc: "Hand-painted or foil, customized" },
      { name: "Color Correction", price: "$200+", desc: "Multi-session transformations" },
      { name: "Gloss Treatment", price: "$55+", desc: "Shine-boosting demi-permanent glaze" },
      { name: "Vivid / Fashion Color", price: "$180+", desc: "Bold, editorial, creative color" },
    ],
  },
  {
    category: "Treatments",
    icon: <SparkleIcon />,
    items: [
      { name: "Keratin Smoothing", price: "$250+", desc: "3-month frizz elimination" },
      { name: "Deep Conditioning", price: "$40+", desc: "Intensive moisture & repair" },
      { name: "Scalp Detox", price: "$35+", desc: "Exfoliation, massage, hydration" },
      { name: "Bond Repair", price: "$50+", desc: "Olaplex or K18 strengthening" },
      { name: "Extensions Consultation", price: "Free", desc: "Tape-in, hand-tied, or fusion" },
    ],
  },
];

const stylists = [
  {
    name: "Jessica Martinez",
    title: "Owner / Master Stylist",
    image: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400&q=80",
    specialties: ["Balayage", "Bridal"],
    yearsExp: 14,
    quote: "Every client deserves to feel like they just walked off a magazine cover.",
  },
  {
    name: "Alex Reyes",
    title: "Senior Colorist",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80",
    specialties: ["Vivid Color", "Corrections"],
    yearsExp: 10,
    quote: "Color is my art and your hair is my canvas.",
  },
  {
    name: "Taylor Kim",
    title: "Stylist & Texture Specialist",
    image: "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=400&q=80",
    specialties: ["Curly Cuts", "Precision Bobs"],
    yearsExp: 8,
    quote: "A great haircut is the foundation of effortless confidence.",
  },
  {
    name: "Morgan Lee",
    title: "Extension & Bridal Artist",
    image: "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=400&q=80",
    specialties: ["Extensions", "Updos"],
    yearsExp: 6,
    quote: "Your wedding day hair should be as unforgettable as the moment.",
  },
];

const testimonials = [
  {
    name: "Emily H.",
    text: "Jessica is a magician with color. My balayage looks exactly like the Pinterest inspo I showed her. I have never loved my hair more.",
    service: "Balayage",
    rating: 5,
  },
  {
    name: "Priya S.",
    text: "The vibe here is so relaxing and upscale. I leave feeling like a completely new person every single time. Worth every penny.",
    service: "Full Color",
    rating: 5,
  },
  {
    name: "Lauren W.",
    text: "Finally found my forever salon. The whole team is talented, the space is gorgeous, and they truly listen to what you want.",
    service: "Cut & Style",
    rating: 5,
  },
];

const galleryImages = [
  "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&q=80",
  "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&q=80",
  "https://images.unsplash.com/photo-1574180566232-aaad1b5b8450?w=400&q=80",
  "https://images.unsplash.com/photo-1560869713-7d0a29430803?w=400&q=80",
  "https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?w=400&q=80",
  "https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=400&q=80",
  "https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=400&q=80",
  "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=400&q=80",
  "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=400&q=80",
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
        className="inline-block text-[#ec4899] text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border border-[#ec4899]/20 bg-[#ec4899]/5"
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
        <span className="text-[#ec4899]">{highlightWord}</span>
        {parts[1] || ""}
      </motion.h2>
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className={`h-0.5 w-16 bg-gradient-to-r from-[#ec4899] to-transparent mt-4 ${center ? "mx-auto" : ""}`}
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

export default function SalonTemplate() {
  return (
    <TemplateLayout
      businessName="Luxe Studio"
      tagline="Where artistry meets luxury. Premium hair and beauty services in a relaxing atmosphere."
      accentColor="#ec4899"
      accentColorLight="#f472b6"
      heroGradient="linear-gradient(135deg, #2e1a2a 0%, #1f101a 100%)"
      heroImage="https://images.unsplash.com/photo-1470259078422-826894b933aa?w=1400&q=80"
      phone="(555) 567-8901"
      address="321 Beauty Lane, Your City"
    >
      {/* ════════════════ Booking Bar ════════════════ */}
      <section className="py-3 bg-gradient-to-r from-[#ec4899] via-[#db2777] to-[#ec4899] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9Im5vbmUiLz48cGF0aCBkPSJNMCAwTDQwIDQwTTQwIDBMMCA0MCIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjAuMyIgb3BhY2l0eT0iMC4xIi8+PC9zdmc+')] opacity-30" />
        <div className="max-w-6xl mx-auto px-6 flex flex-wrap items-center justify-center gap-6 relative z-10">
          <div className="flex items-center gap-3">
            <ScissorsIcon className="w-5 h-5" />
            <p className="text-sm font-bold tracking-wide">NOW BOOKING &mdash; NEW CLIENTS GET 15% OFF FIRST VISIT</p>
          </div>
          <a
            href="#contact"
            className="flex items-center gap-2 bg-white/15 backdrop-blur-sm px-5 py-2 rounded-full border border-white/20 hover:bg-white/25 transition-colors"
          >
            <CalendarIcon className="w-4 h-4" />
            <span className="text-xs font-bold tracking-wider">BOOK YOUR APPOINTMENT</span>
          </a>
        </div>
      </section>

      {/* ════════════════ Stats Banner ════════════════ */}
      <section className="py-12 relative overflow-hidden bg-[#0c0a10] border-b border-[#ec4899]/10">
        <SalonPattern opacity={0.02} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] rounded-full blur-[180px] bg-[#ec4899]/5" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "5,000+", label: "Happy Clients", icon: <HeartIcon /> },
              { value: "14+", label: "Years Experience", icon: <ScissorsIcon className="w-5 h-5" /> },
              { value: "4.9", label: "Google Rating", icon: <StarIcon /> },
              { value: "30+", label: "Awards Won", icon: <SparkleIcon className="w-5 h-5" /> },
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
                  <span className="text-[#ec4899]">{stat.icon}</span>
                  <span className="text-3xl md:text-4xl font-extrabold text-white">{stat.value}</span>
                </div>
                <span className="text-muted text-sm font-medium tracking-wide uppercase">{stat.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ New Client Special ════════════════ */}
      <section
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0a0a10 0%, #1a0a18 50%, #0a0a10 100%)" }}
      >
        <SalonPattern opacity={0.015} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-[200px] bg-[#ec4899]/6" />
        </div>
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-8 md:p-14 rounded-2xl border border-[#ec4899]/20 relative overflow-hidden bg-gradient-to-b from-[#ec4899]/[0.06] to-transparent"
          >
            {/* Inner glow */}
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,#ec489918,transparent_60%)]" />
            {/* Corner decorations */}
            <div className="absolute top-0 left-0 w-20 h-20 border-t border-l border-[#ec4899]/30 rounded-tl-2xl" />
            <div className="absolute bottom-0 right-0 w-20 h-20 border-b border-r border-[#ec4899]/30 rounded-br-2xl" />
            <div className="relative z-10 text-center">
              <span className="inline-flex items-center gap-2 bg-[#ec4899]/10 text-[#ec4899] text-xs font-bold uppercase tracking-[0.2em] px-4 py-2 rounded-full mb-6 border border-[#ec4899]/20">
                <SparkleIcon className="w-4 h-4" />
                WELCOME OFFER
              </span>
              <h2 className="text-3xl md:text-5xl font-extrabold mb-3 tracking-tight">
                New Client <span className="text-[#ec4899]">Special</span>
              </h2>
              <p className="text-6xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-[#ec4899] to-[#db2777] mb-4 leading-none py-1">
                15% OFF
              </p>
              <div className="w-12 h-px bg-[#ec4899]/30 mx-auto mb-4" />
              <p className="text-muted leading-relaxed mb-2 max-w-lg mx-auto text-lg">
                Your first visit at Luxe Studio. Valid on any service &mdash; cuts, color, treatments, and more.
              </p>
              <p className="text-muted/60 text-sm mb-10">Mention this offer when booking. Cannot be combined with other promotions.</p>
              <a
                href="#contact"
                className="group inline-flex h-14 px-10 rounded-full bg-gradient-to-r from-[#ec4899] to-[#db2777] text-white font-bold items-center text-lg hover:from-[#f472b6] hover:to-[#ec4899] transition-all duration-300 shadow-lg shadow-[#ec4899]/25 gap-2"
              >
                <span>Book Your First Visit</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:translate-x-1 transition-transform">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ════════════════ Service Menu ════════════════ */}
      <section
        id="services"
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0a0a10 0%, #0f0a14 50%, #0a0a10 100%)" }}
      >
        <SalonPattern />
        <CurvedLines />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[10%] right-[5%] w-[500px] h-[500px] rounded-full blur-[160px] bg-[#ec4899]/6" />
          <div className="absolute bottom-[10%] left-[5%] w-[400px] h-[400px] rounded-full blur-[140px] bg-[#ec4899]/4" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="OUR MENU"
            title="Services & Pricing"
            highlightWord="Pricing"
            subtitle="A curated collection of premium hair and beauty services, each delivered with artistry and precision."
          />
          <div className="grid md:grid-cols-3 gap-8">
            {menuItems.map((section, i) => (
              <motion.div
                key={section.category}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="group relative rounded-2xl border border-white/[0.06] hover:border-[#ec4899]/30 transition-all duration-500 overflow-hidden bg-white/[0.02]"
              >
                {/* Hover glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,#ec489915,transparent_70%)]" />
                {/* Top accent line */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#ec4899]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative z-10 p-7">
                  {/* Category header */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-[#ec4899]/10 border border-[#ec4899]/20 flex items-center justify-center text-[#ec4899] group-hover:bg-[#ec4899]/20 group-hover:border-[#ec4899]/40 transition-all duration-300">
                      {section.icon}
                    </div>
                    <h3 className="text-xl font-extrabold text-[#ec4899] tracking-tight">{section.category}</h3>
                  </div>

                  {/* Divider */}
                  <div className="w-full h-px bg-gradient-to-r from-[#ec4899]/20 via-[#ec4899]/10 to-transparent mb-5" />

                  {/* Menu items */}
                  <div className="space-y-4">
                    {section.items.map((item) => (
                      <div key={item.name} className="group/item">
                        <div className="flex justify-between items-baseline gap-2">
                          <span className="text-sm font-semibold text-white/90">{item.name}</span>
                          <span className="text-sm font-bold text-[#ec4899] shrink-0">{item.price}</span>
                        </div>
                        <p className="text-muted/60 text-xs mt-0.5 leading-relaxed">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ About / Why Luxe ════════════════ */}
      <section
        id="about"
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0f0a14 0%, #150d1a 50%, #0f0a14 100%)" }}
      >
        <SalonPattern />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] left-[5%] w-[500px] h-[500px] rounded-full blur-[160px] bg-[#ec4899]/5" />
          <div className="absolute bottom-[10%] right-[10%] w-[350px] h-[350px] rounded-full blur-[140px] bg-[#ec4899]/4" />
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
                    src="https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=600&q=80"
                    alt="Salon interior"
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Secondary image */}
                <div className="absolute bottom-0 right-0 w-[65%] h-[55%] rounded-2xl overflow-hidden border-2 border-white/[0.06] shadow-2xl z-20">
                  <img
                    src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&q=80"
                    alt="Styling session"
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Accent badge */}
                <div className="absolute top-[55%] left-[60%] z-30 bg-[#ec4899] rounded-2xl px-5 py-4 shadow-xl shadow-[#ec4899]/20 border border-[#f472b6]/30">
                  <span className="block text-3xl font-extrabold text-white leading-none">14+</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-white/80">Years of<br />Artistry</span>
                </div>
                {/* Decorative corner lines */}
                <div className="absolute -top-3 -left-3 w-16 h-16 border-t-2 border-l-2 border-[#ec4899]/20 rounded-tl-xl" />
                <div className="absolute -bottom-3 -right-3 w-16 h-16 border-b-2 border-r-2 border-[#ec4899]/20 rounded-br-xl" />
              </div>
            </motion.div>

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <SectionHeader
                tag="OUR STORY"
                title="Beauty as Artistry"
                highlightWord="Artistry"
                center={false}
              />
              <p className="text-muted leading-relaxed mb-6 text-lg -mt-8">
                At Luxe Studio, we believe every visit should feel like an escape. From the moment you walk in, you are greeted by an atmosphere of calm luxury &mdash; warm lighting, curated music, and the scent of premium products.
              </p>
              <p className="text-muted leading-relaxed mb-8">
                Our team of award-winning stylists doesn&apos;t just cut and color hair &mdash; they listen, envision, and create. We are editorial artists who happen to work in a salon, and every chair is a canvas.
              </p>
              {/* Feature list */}
              <div className="space-y-4">
                {[
                  { icon: <ScissorsIcon className="w-5 h-5" />, title: "Award-Winning Team", desc: "Hand-selected stylists with national competition accolades" },
                  { icon: <SparkleIcon className="w-5 h-5" />, title: "Premium Products Only", desc: "Olaplex, Kerastase, Redken, and K18 exclusively" },
                  { icon: <MirrorIcon className="w-5 h-5" />, title: "Consultation-First", desc: "Every service begins with an in-depth hair consultation" },
                ].map((feature) => (
                  <div key={feature.title} className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-[#ec4899]/20 transition-colors duration-300">
                    <div className="w-10 h-10 rounded-lg bg-[#ec4899]/10 border border-[#ec4899]/20 flex items-center justify-center text-[#ec4899] shrink-0">
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

      {/* ════════════════ Meet Your Artists ════════════════ */}
      <section
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0a0a10 0%, #110d18 50%, #0a0a10 100%)" }}
      >
        <SalonPattern opacity={0.025} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] right-[10%] w-[500px] h-[500px] rounded-full blur-[180px] bg-[#ec4899]/5" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="MEET YOUR ARTISTS"
            title="Our Talented Team"
            highlightWord="Team"
            subtitle="Passionate beauty professionals with the skills and vision to bring your dream look to life."
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {stylists.map((stylist, i) => (
              <motion.div
                key={stylist.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="group relative rounded-2xl border border-white/[0.06] hover:border-[#ec4899]/30 transition-all duration-500 overflow-hidden bg-white/[0.02]"
              >
                {/* Photo */}
                <div className="relative aspect-[3/4] overflow-hidden">
                  <img
                    src={stylist.image}
                    alt={stylist.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a10] via-[#0a0a10]/30 to-transparent" />
                  {/* Years badge */}
                  <div className="absolute top-4 right-4 bg-[#ec4899]/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full border border-[#f472b6]/30">
                    {stylist.yearsExp}+ YRS
                  </div>
                  {/* Info overlay at bottom */}
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <h3 className="text-lg font-bold mb-1">{stylist.name}</h3>
                    <p className="text-[#ec4899] text-sm font-semibold mb-2">{stylist.title}</p>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {stylist.specialties.map((s) => (
                        <span key={s} className="text-[10px] font-semibold uppercase tracking-wider text-white/60 bg-white/10 border border-white/10 px-2.5 py-1 rounded-full">
                          {s}
                        </span>
                      ))}
                    </div>
                    <p className="text-white/50 text-xs italic leading-relaxed">&ldquo;{stylist.quote}&rdquo;</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ Portfolio / Gallery ════════════════ */}
      <section
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0f0a14 0%, #130d1a 50%, #0f0a14 100%)" }}
      >
        <SalonPattern opacity={0.02} />
        <CurvedLines opacity={0.025} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[600px] h-[600px] rounded-full blur-[180px] bg-[#ec4899]/5" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="PORTFOLIO"
            title="Our Latest Work"
            highlightWord="Work"
            subtitle="Every style tells a story. Browse transformations from our talented team of artists."
          />
          <div className="grid grid-cols-3 gap-3 md:gap-4">
            {galleryImages.map((src, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="group relative aspect-square rounded-xl overflow-hidden border border-white/[0.06] hover:border-[#ec4899]/30 transition-all duration-500"
              >
                <img
                  src={src}
                  alt={`Portfolio piece ${i + 1}`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-[#ec4899]/0 group-hover:bg-[#ec4899]/20 transition-colors duration-500 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-500 text-white">
                    <CameraIcon className="w-8 h-8" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ Why Choose Luxe Banner ════════════════ */}
      <section className="py-20 relative overflow-hidden bg-gradient-to-b from-[#ec4899]/10 to-[#0a0a10]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#ec4899]/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#ec4899]/10 to-transparent" />
          <svg className="absolute inset-0 w-full h-full opacity-[0.04]" viewBox="0 0 1000 400">
            <path d="M0 200 Q250 100 500 200 Q750 300 1000 200" stroke="#ec4899" strokeWidth="1" fill="none" />
            <path d="M0 250 Q250 150 500 250 Q750 350 1000 250" stroke="#ec4899" strokeWidth="0.5" fill="none" />
            <circle cx="500" cy="200" r="80" stroke="#ec4899" strokeWidth="0.3" fill="none" />
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
              THE <span className="text-[#ec4899]">LUXE STUDIO</span> DIFFERENCE
            </h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <ScissorsIcon className="w-7 h-7" />, title: "Master Artists", desc: "Award-winning stylists with 6-14+ years of editorial experience" },
              { icon: <MirrorIcon className="w-7 h-7" />, title: "Luxury Experience", desc: "Complimentary beverages, scalp massage, and a relaxing atmosphere" },
              { icon: <BrushIcon className="w-7 h-7" />, title: "Premium Products", desc: "Only the finest professional brands for color, care, and styling" },
              { icon: <HeartIcon className="w-7 h-7" />, title: "100% Satisfaction", desc: "Not in love with your look? We will make it right, guaranteed" },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group text-center p-6 rounded-2xl border border-white/[0.06] hover:border-[#ec4899]/30 bg-white/[0.02] transition-all duration-500"
              >
                <div className="w-14 h-14 mx-auto rounded-xl bg-[#ec4899]/10 border border-[#ec4899]/20 flex items-center justify-center text-[#ec4899] mb-4 group-hover:bg-[#ec4899]/20 group-hover:scale-110 transition-all duration-300">
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
        style={{ background: "linear-gradient(180deg, #0a0a10 0%, #0d0a14 50%, #0a0a10 100%)" }}
      >
        <SalonPattern />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[30%] left-[40%] w-[600px] h-[400px] rounded-full blur-[180px] bg-[#ec4899]/5" />
          <svg className="absolute inset-0 w-full h-full opacity-[0.025]" viewBox="0 0 800 400">
            <circle cx="400" cy="200" r="100" stroke="#ec4899" strokeWidth="0.5" fill="none" />
            <circle cx="400" cy="200" r="180" stroke="#ec4899" strokeWidth="0.3" fill="none" />
            <circle cx="400" cy="200" r="260" stroke="#ec4899" strokeWidth="0.2" fill="none" />
          </svg>
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="CLIENT LOVE"
            title="What Our Clients Say"
            highlightWord="Clients"
            subtitle="Real reviews from real people who trust Luxe Studio with their most important looks."
          />
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative p-7 rounded-2xl border border-white/[0.06] hover:border-[#ec4899]/30 transition-all duration-500 overflow-hidden bg-white/[0.02]"
              >
                {/* Top accent line */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-[#ec4899]/40 via-[#ec4899]/10 to-transparent" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_0%_0%,#ec489910,transparent_70%)]" />
                <div className="relative z-10">
                  {/* Service tag */}
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#ec4899]/70 bg-[#ec4899]/8 border border-[#ec4899]/10 px-2.5 py-1 rounded-full">
                    {t.service}
                  </span>
                  {/* Stars */}
                  <div className="flex items-center gap-0.5 text-[#ec4899] mt-4 mb-4">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <StarIcon key={j} />
                    ))}
                  </div>
                  {/* Quote */}
                  <p className="text-muted leading-relaxed mb-6 text-sm">&ldquo;{t.text}&rdquo;</p>
                  {/* Author */}
                  <div className="flex items-center gap-3 pt-4 border-t border-white/[0.06]">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#ec4899]/30 to-[#ec4899]/10 flex items-center justify-center text-sm font-bold text-[#ec4899]">
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

      {/* ════════════════ Instagram Section ════════════════ */}
      <section
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0f0a14 0%, #130d1a 50%, #0f0a14 100%)" }}
      >
        <SalonPattern opacity={0.02} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[180px] bg-[#ec4899]/6" />
          {/* Instagram camera outline */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.03]" viewBox="0 0 1000 400">
            <rect x="380" y="100" width="240" height="200" rx="40" stroke="#ec4899" strokeWidth="0.8" fill="none" />
            <circle cx="500" cy="200" r="50" stroke="#ec4899" strokeWidth="0.6" fill="none" />
            <circle cx="580" cy="130" r="8" stroke="#ec4899" strokeWidth="0.5" fill="none" />
          </svg>
        </div>
        <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block text-[#ec4899] text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border border-[#ec4899]/20 bg-[#ec4899]/5">
              STAY CONNECTED
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold mb-4 tracking-tight">
              Follow Us on <span className="text-[#ec4899]">Instagram</span>
            </h2>
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="h-0.5 w-16 bg-gradient-to-r from-[#ec4899] to-transparent mt-2 mb-6 mx-auto"
            />
            <p className="text-muted mb-10 max-w-md mx-auto text-lg leading-relaxed">
              See our latest transformations, behind-the-scenes moments, and styling tips. Join our community of beauty lovers.
            </p>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-3 px-8 py-4 rounded-full border-2 border-[#ec4899]/30 text-[#ec4899] font-bold text-lg hover:bg-[#ec4899]/10 hover:border-[#ec4899]/50 transition-all duration-300"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
              <span>@luxestudio</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:translate-x-1 transition-transform">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
          </motion.div>
        </div>
      </section>

      {/* ════════════════ Final CTA ════════════════ */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#ec4899]/10 via-[#ec4899]/5 to-[#0a0a10]" />
        <SalonPattern opacity={0.03} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#ec4899]/30 to-transparent" />
          <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full blur-[180px] bg-[#ec4899]/8" />
        </div>
        <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block text-[#ec4899] text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border border-[#ec4899]/20 bg-[#ec4899]/5">
              YOUR TRANSFORMATION AWAITS
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold mb-4 tracking-tight">
              Ready for Your <span className="text-[#ec4899]">Best Hair</span> Ever?
            </h2>
            <p className="text-muted text-lg mb-10 max-w-xl mx-auto leading-relaxed">
              Your perfect look is one appointment away. Book now and experience the Luxe Studio difference &mdash; where artistry meets luxury.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#contact"
                className="group inline-flex h-14 px-10 rounded-full bg-gradient-to-r from-[#ec4899] to-[#db2777] text-white font-bold items-center justify-center text-lg hover:from-[#f472b6] hover:to-[#ec4899] transition-all duration-300 shadow-lg shadow-[#ec4899]/25 gap-2"
              >
                <span>Book an Appointment</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:translate-x-1 transition-transform">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
              <a
                href="tel:5555678901"
                className="inline-flex h-14 px-10 rounded-full border-2 border-[#ec4899]/30 text-[#ec4899] font-bold items-center justify-center text-lg hover:bg-[#ec4899]/10 hover:border-[#ec4899]/50 transition-all duration-300 gap-2"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
                  <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>Call Us</span>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ════════════════ Floating Book Now Button ════════════════ */}
      <div className="fixed bottom-6 right-6 z-50">
        <a
          href="#contact"
          className="group flex items-center gap-2 h-14 px-8 rounded-full bg-gradient-to-r from-[#ec4899] to-[#db2777] text-white font-bold shadow-2xl shadow-[#ec4899]/30 hover:from-[#f472b6] hover:to-[#ec4899] transition-all duration-300 hover:scale-105 transform"
        >
          <CalendarIcon className="w-5 h-5" />
          <span>Book Now</span>
        </a>
      </div>
    </TemplateLayout>
  );
}
