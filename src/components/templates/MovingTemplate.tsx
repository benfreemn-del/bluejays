"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import TemplateLayout from "./TemplateLayout";

/* ───────────────────────── SVG Icons ───────────────────────── */

const TruckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M1 3h15v13H1zM16 8h4l3 4v5h-7V8z" />
    <circle cx="5.5" cy="18.5" r="2.5" />
    <circle cx="18.5" cy="18.5" r="2.5" />
  </svg>
);

const BoxIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
    <path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" />
  </svg>
);

const DollyIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M10 2v14M6 6h8M10 16l-6 4m6-4l6 4" />
    <circle cx="4" cy="20" r="2" />
    <circle cx="16" cy="20" r="2" />
    <rect x="6" y="2" width="8" height="8" rx="1" />
  </svg>
);

const HouseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
    <rect x="7" y="14" width="3" height="3" rx="0.5" />
  </svg>
);

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
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

/* ───────────────────────── Road Pattern ───────────────────────── */

const RoadPattern = ({ opacity = 0.03 }: { opacity?: number }) => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }}>
    <defs>
      <pattern id="movingRoad" width="100" height="60" patternUnits="userSpaceOnUse">
        <path d="M 0 30 L 40 30 M 60 30 L 100 30" fill="none" stroke="#f97316" strokeWidth="0.6" strokeDasharray="4 8" />
        <path d="M 0 60 L 100 60" fill="none" stroke="#f97316" strokeWidth="0.3" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#movingRoad)" />
  </svg>
);

/* ───────────────────────── Data ───────────────────────── */

const services = [
  {
    name: "Local Moving",
    desc: "Full-service residential moves anywhere in the Tacoma-Seattle metro. Door-to-door protection for every piece of furniture you own.",
    icon: <HouseIcon />,
    tags: ["Same-Day", "Apartment", "Full Home"],
  },
  {
    name: "Long-Distance Moving",
    desc: "Cross-state and cross-country relocations with GPS-tracked trucks, dedicated crews, and guaranteed delivery windows. No surprises.",
    icon: <TruckIcon />,
    tags: ["Interstate", "Cross-Country", "GPS Tracked"],
  },
  {
    name: "Commercial Moving",
    desc: "Office relocations planned around your schedule. Minimal downtime, IT equipment handling, and weekend availability to keep your business running.",
    icon: <CalendarIcon />,
    tags: ["Office", "IT Equipment", "Weekend Moves"],
  },
  {
    name: "Packing Services",
    desc: "Professional packing with premium materials. We wrap, box, and label everything so it arrives exactly as it left. White-glove treatment for fragiles.",
    icon: <BoxIcon />,
    tags: ["Full Packing", "Fragile Items", "Labeling"],
  },
  {
    name: "Storage Solutions",
    desc: "Climate-controlled, secure storage facilities for short-term or long-term needs. Flexible month-to-month plans with 24/7 surveillance.",
    icon: <ShieldIcon />,
    tags: ["Climate-Controlled", "Secure", "Flexible"],
  },
  {
    name: "Specialty Items",
    desc: "Pianos, antiques, artwork, gun safes, and hot tubs. Custom crating and specialized equipment for items that demand extra care and expertise.",
    icon: <DollyIcon />,
    tags: ["Pianos", "Antiques", "Heavy Items"],
  },
];

const processSteps = [
  {
    step: "01",
    title: "Get Your Free Quote",
    desc: "Call or fill out our form. We will assess your move and deliver a transparent, binding estimate with zero hidden fees.",
    icon: <PhoneIcon />,
  },
  {
    step: "02",
    title: "We Plan Everything",
    desc: "Our moving coordinator creates a detailed plan covering timeline, crew size, materials, and logistics tailored to your needs.",
    icon: <CalendarIcon />,
  },
  {
    step: "03",
    title: "Moving Day",
    desc: "Our uniformed crew arrives on time with the right truck and equipment. We protect floors, wrap furniture, and load with precision.",
    icon: <TruckIcon />,
  },
  {
    step: "04",
    title: "Delivered & Done",
    desc: "Everything placed exactly where you want it. We reassemble furniture, remove packing materials, and do a final walkthrough with you.",
    icon: <CheckCircleIcon />,
  },
];

const trustBadges = [
  { label: "Licensed & Insured", icon: <ShieldIcon /> },
  { label: "On-Time Guarantee", icon: <ClockIcon /> },
  { label: "No Hidden Fees", icon: <CheckCircleIcon /> },
  { label: "Background-Checked Crews", icon: <ShieldIcon /> },
];

const testimonials = [
  {
    name: "Amanda K.",
    text: "They moved our entire 4-bedroom house in under 6 hours. Not a single scratch on anything. The crew was polite, fast, and incredibly careful with our belongings.",
    service: "Local Moving",
    rating: 5,
  },
  {
    name: "Derek S.",
    text: "We relocated our office over a weekend and were fully operational Monday morning. Cascadia handled the server racks and all our IT equipment without a hitch.",
    service: "Commercial Moving",
    rating: 5,
  },
  {
    name: "Rachel M.",
    text: "Moving cross-country was terrifying until these guys took over. Everything arrived on the exact day they promised, and nothing was damaged. Worth every penny.",
    service: "Long-Distance",
    rating: 5,
  },
];

const serviceAreas = [
  "Tacoma", "Seattle", "Bellevue", "Olympia", "Lakewood",
  "Puyallup", "Federal Way", "Kent", "Renton", "Auburn",
  "Everett", "Redmond",
];

/* ───────────────────────── Section Header ───────────────────────── */

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
        className="inline-block text-[#f97316] text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border border-[#f97316]/20 bg-[#f97316]/5"
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
        <span className="text-[#f97316]">{highlightWord}</span>
        {parts[1] || ""}
      </motion.h2>
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className={`h-0.5 w-16 bg-gradient-to-r from-[#f97316] to-transparent mt-4 ${center ? "mx-auto" : ""}`}
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

/* ───────────────────────── Quote Calculator ───────────────────────── */

function QuoteCalculator() {
  const [bedrooms, setBedrooms] = useState(2);
  const [distance, setDistance] = useState("local");
  const [packing, setPacking] = useState(false);

  const baseRates: Record<string, number> = { local: 400, regional: 1200, longDistance: 3000 };
  const bedroomRate = 250;
  const packingRate = 350;
  const estimate = baseRates[distance] + bedrooms * bedroomRate + (packing ? packingRate : 0);

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-semibold mb-3 text-white">Number of Bedrooms</label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setBedrooms(n)}
              className={`flex-1 h-12 rounded-xl text-sm font-bold transition-all duration-300 border ${
                bedrooms === n
                  ? "bg-[#f97316] border-[#f97316] text-white shadow-lg shadow-[#f97316]/20"
                  : "bg-white/5 border-white/10 text-white/60 hover:border-[#f97316]/30"
              }`}
            >
              {n}{n === 5 ? "+" : ""}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-3 text-white">Move Distance</label>
        <div className="flex gap-2">
          {[
            { key: "local", label: "Local" },
            { key: "regional", label: "Regional" },
            { key: "longDistance", label: "Long-Distance" },
          ].map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => setDistance(opt.key)}
              className={`flex-1 h-12 rounded-xl text-sm font-bold transition-all duration-300 border ${
                distance === opt.key
                  ? "bg-[#f97316] border-[#f97316] text-white shadow-lg shadow-[#f97316]/20"
                  : "bg-white/5 border-white/10 text-white/60 hover:border-[#f97316]/30"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <button
          type="button"
          onClick={() => setPacking(!packing)}
          className={`w-full h-12 rounded-xl text-sm font-bold transition-all duration-300 border flex items-center justify-center gap-2 ${
            packing
              ? "bg-[#f97316]/15 border-[#f97316]/40 text-[#f97316]"
              : "bg-white/5 border-white/10 text-white/60 hover:border-[#f97316]/30"
          }`}
        >
          <BoxIcon />
          <span>Add Professional Packing (+$350)</span>
        </button>
      </div>

      <div className="p-6 rounded-2xl bg-gradient-to-b from-[#f97316]/10 to-transparent border border-[#f97316]/20 text-center">
        <p className="text-sm text-muted mb-2">Estimated Cost</p>
        <p className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-white to-[#f97316] leading-none mb-2">
          ${estimate.toLocaleString()}
        </p>
        <p className="text-xs text-white/40">Final price confirmed after in-home or virtual survey</p>
      </div>
    </div>
  );
}

/* ───────────────────────── Main Component ───────────────────────── */

export default function MovingTemplate() {
  return (
    <TemplateLayout
      businessName="Cascadia Moving Co."
      tagline="Stress-free residential and commercial moving across the Pacific Northwest. Licensed, insured, and careful with every box."
      accentColor="#f97316"
      accentColorLight="#fb923c"
      heroGradient="linear-gradient(135deg, #1a1510 0%, #0f0d0a 100%)"
      heroImage="https://images.unsplash.com/photo-1600518464441-9154a4dea21b?w=1400&q=80"
      phone="(253) 555-0112"
      address="Tacoma, WA"
    >
      {/* ════════════════ Urgency Bar ════════════════ */}
      <section className="py-3 bg-gradient-to-r from-[#f97316] via-[#ea580c] to-[#f97316] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9Im5vbmUiLz48cGF0aCBkPSJNMCAwTDQwIDQwTTQwIDBMMCA0MCIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjAuMyIgb3BhY2l0eT0iMC4xIi8+PC9zdmc+')] opacity-30" />
        <div className="max-w-6xl mx-auto px-6 flex flex-wrap items-center justify-center gap-6 relative z-10">
          <div className="flex items-center gap-3">
            <TruckIcon />
            <p className="text-sm font-bold tracking-wide">FREE ESTIMATES &mdash; STRESS-FREE GUARANTEED</p>
          </div>
          <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm px-5 py-2 rounded-full border border-white/20">
            <PhoneIcon />
            <span className="text-xs font-bold tracking-wider">(253) 555-0112</span>
          </div>
        </div>
      </section>

      {/* ════════════════ Stats Banner ════════════════ */}
      <section className="py-12 relative overflow-hidden bg-[#0c0a08] border-b border-[#f97316]/10">
        <RoadPattern opacity={0.02} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] rounded-full blur-[180px] bg-[#f97316]/5" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "12,000+", label: "Moves Completed", icon: <TruckIcon /> },
              { value: "0", label: "Items Damaged", icon: <ShieldIcon /> },
              { value: "10+", label: "Years in Business", icon: <ClockIcon /> },
              { value: "4.9/5", label: "Customer Rating", icon: <StarIcon /> },
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
                  <span className="text-[#f97316]">{stat.icon}</span>
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
        style={{ background: "linear-gradient(180deg, #0a0908 0%, #0f0c08 50%, #0a0908 100%)" }}
      >
        <RoadPattern />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[10%] right-[5%] w-[500px] h-[500px] rounded-full blur-[160px] bg-[#f97316]/6" />
          <div className="absolute bottom-[10%] left-[5%] w-[400px] h-[400px] rounded-full blur-[140px] bg-[#f97316]/4" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="OUR SERVICES"
            title="Moving Services You Can Trust"
            highlightWord="You Can Trust"
            subtitle="From a studio apartment to an entire corporate office, we handle every move with the same level of care, precision, and reliability."
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, i) => (
              <motion.div
                key={service.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group relative p-7 rounded-2xl border border-white/[0.06] hover:border-[#f97316]/30 transition-all duration-500 overflow-hidden bg-white/[0.02]"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,#f9731615,transparent_70%)]" />
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#f97316]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl bg-[#f97316]/10 border border-[#f97316]/20 flex items-center justify-center text-[#f97316] group-hover:bg-[#f97316]/20 group-hover:border-[#f97316]/40 transition-all duration-300">
                      {service.icon}
                    </div>
                    <span className="text-4xl font-extrabold text-white/[0.04] group-hover:text-[#f97316]/10 transition-colors duration-300 leading-none">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold mb-3 group-hover:text-[#f97316] transition-colors duration-300">{service.name}</h3>
                  <p className="text-muted text-sm leading-relaxed mb-5">{service.desc}</p>
                  <div className="flex flex-wrap gap-2">
                    {service.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-semibold uppercase tracking-wider text-[#f97316]/70 bg-[#f97316]/8 border border-[#f97316]/10 px-2.5 py-1 rounded-full"
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

      {/* ════════════════ Moving Process ════════════════ */}
      <section
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0f0c08 0%, #130f08 50%, #0f0c08 100%)" }}
      >
        <RoadPattern opacity={0.025} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[30%] left-[50%] -translate-x-1/2 w-[700px] h-[400px] rounded-full blur-[180px] bg-[#f97316]/6" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="HOW IT WORKS"
            title="Our Moving Process"
            highlightWord="Process"
            subtitle="Four simple steps from first call to final box. We handle the chaos so you do not have to."
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {processSteps.map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative text-center p-8 rounded-2xl border border-white/[0.06] hover:border-[#f97316]/30 transition-all duration-500 overflow-hidden bg-white/[0.02]"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,#f9731610,transparent_70%)]" />
                <div className="relative z-10">
                  <span className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-[#f97316]/20 to-transparent leading-none block mb-4">
                    {step.step}
                  </span>
                  <div className="w-14 h-14 mx-auto rounded-xl bg-[#f97316]/10 border border-[#f97316]/20 flex items-center justify-center text-[#f97316] mb-5 group-hover:bg-[#f97316]/20 group-hover:scale-110 transition-all duration-300">
                    {step.icon}
                  </div>
                  <h3 className="text-lg font-bold mb-3 group-hover:text-[#f97316] transition-colors duration-300">{step.title}</h3>
                  <p className="text-muted text-sm leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ Instant Quote Calculator ════════════════ */}
      <section
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0a0908 0%, #0d0b06 50%, #0a0908 100%)" }}
      >
        <RoadPattern />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-[200px] bg-[#f97316]/6" />
        </div>
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-8 md:p-12 rounded-2xl border border-[#f97316]/20 relative overflow-hidden bg-gradient-to-b from-[#f97316]/[0.06] to-transparent"
          >
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,#f9731615,transparent_60%)]" />
            <div className="absolute top-0 left-0 w-20 h-20 border-t border-l border-[#f97316]/30 rounded-tl-2xl" />
            <div className="absolute bottom-0 right-0 w-20 h-20 border-b border-r border-[#f97316]/30 rounded-br-2xl" />
            <div className="relative z-10">
              <div className="text-center mb-8">
                <span className="inline-flex items-center gap-2 bg-[#f97316]/10 text-[#f97316] text-xs font-bold uppercase tracking-[0.2em] px-4 py-2 rounded-full mb-4 border border-[#f97316]/20">
                  <CalendarIcon />
                  INSTANT ESTIMATE
                </span>
                <h2 className="text-3xl md:text-4xl font-extrabold mb-3">
                  Get Your <span className="text-[#f97316]">Quick Quote</span>
                </h2>
                <p className="text-muted max-w-lg mx-auto">
                  Select your move details below for an instant ballpark estimate. We will confirm the final price after a free in-home or virtual survey.
                </p>
              </div>
              <QuoteCalculator />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ════════════════ Trust Badges ════════════════ */}
      <section className="py-20 relative overflow-hidden bg-gradient-to-b from-[#f97316]/10 to-[#0a0908]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#f97316]/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#f97316]/10 to-transparent" />
          <svg className="absolute inset-0 w-full h-full opacity-[0.04]" viewBox="0 0 1000 400">
            <path d="M0 200 Q250 100 500 200 Q750 300 1000 200" stroke="#f97316" strokeWidth="1" fill="none" />
            <path d="M0 250 Q250 150 500 250 Q750 350 1000 250" stroke="#f97316" strokeWidth="0.5" fill="none" />
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
              WHY CHOOSE <span className="text-[#f97316]">CASCADIA?</span>
            </h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trustBadges.map((badge, i) => (
              <motion.div
                key={badge.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group text-center p-6 rounded-2xl border border-white/[0.06] hover:border-[#f97316]/30 bg-white/[0.02] transition-all duration-500"
              >
                <div className="w-14 h-14 mx-auto rounded-xl bg-[#f97316]/10 border border-[#f97316]/20 flex items-center justify-center text-[#f97316] mb-4 group-hover:bg-[#f97316]/20 group-hover:scale-110 transition-all duration-300">
                  {badge.icon}
                </div>
                <h4 className="font-bold mb-1">{badge.label}</h4>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ Testimonials ════════════════ */}
      <section
        id="testimonials"
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0a0908 0%, #0d0b06 50%, #0a0908 100%)" }}
      >
        <RoadPattern />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[30%] left-[40%] w-[600px] h-[400px] rounded-full blur-[180px] bg-[#f97316]/5" />
          <svg className="absolute inset-0 w-full h-full opacity-[0.025]" viewBox="0 0 800 400">
            <circle cx="400" cy="200" r="100" stroke="#f97316" strokeWidth="0.5" fill="none" />
            <circle cx="400" cy="200" r="180" stroke="#f97316" strokeWidth="0.3" fill="none" />
            <circle cx="400" cy="200" r="260" stroke="#f97316" strokeWidth="0.2" fill="none" />
          </svg>
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="HAPPY CUSTOMERS"
            title="Trusted by Thousands"
            highlightWord="Thousands"
            subtitle="Real reviews from real families and businesses who moved with Cascadia."
          />
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative p-7 rounded-2xl border border-white/[0.06] hover:border-[#f97316]/30 transition-all duration-500 overflow-hidden bg-white/[0.02]"
              >
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-[#f97316]/40 via-[#f97316]/10 to-transparent" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_0%_0%,#f9731610,transparent_70%)]" />
                <div className="relative z-10">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#f97316]/70 bg-[#f97316]/8 border border-[#f97316]/10 px-2.5 py-1 rounded-full">
                    {t.service}
                  </span>
                  <div className="flex items-center gap-0.5 text-[#f97316] mt-4 mb-4">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <StarIcon key={j} />
                    ))}
                  </div>
                  <p className="text-muted leading-relaxed mb-6 text-sm">&ldquo;{t.text}&rdquo;</p>
                  <div className="flex items-center gap-3 pt-4 border-t border-white/[0.06]">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#f97316]/30 to-[#f97316]/10 flex items-center justify-center text-sm font-bold text-[#f97316]">
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
        style={{ background: "linear-gradient(180deg, #0f0c08 0%, #110d08 50%, #0f0c08 100%)" }}
      >
        <RoadPattern opacity={0.025} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] right-[10%] w-[500px] h-[500px] rounded-full blur-[180px] bg-[#f97316]/5" />
        </div>
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="SERVICE AREA"
            title="Where We Move"
            highlightWord="We Move"
            subtitle="Serving the entire Puget Sound region and beyond. Long-distance moves available nationwide."
          />
          <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
            {serviceAreas.map((area, i) => (
              <motion.div
                key={area}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                className="group text-center p-4 rounded-xl border border-white/[0.06] hover:border-[#f97316]/30 bg-white/[0.02] transition-all duration-300"
              >
                <p className="font-semibold text-sm group-hover:text-[#f97316] transition-colors duration-300">{area}</p>
              </motion.div>
            ))}
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center text-muted text-sm mt-6"
          >
            Plus all surrounding communities. Long-distance moves available to all 50 states.
          </motion.p>
        </div>
      </section>

      {/* ════════════════ Free Estimate CTA ════════════════ */}
      <section
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0a0908 0%, #0d0b06 50%, #0a0908 100%)" }}
      >
        <RoadPattern opacity={0.02} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-[200px] bg-[#f97316]/6" />
        </div>
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-8 md:p-12 rounded-2xl border border-[#f97316]/20 relative overflow-hidden bg-gradient-to-b from-[#f97316]/[0.06] to-transparent"
          >
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,#f9731615,transparent_60%)]" />
            <div className="absolute top-0 left-0 w-20 h-20 border-t border-l border-[#f97316]/30 rounded-tl-2xl" />
            <div className="absolute bottom-0 right-0 w-20 h-20 border-b border-r border-[#f97316]/30 rounded-br-2xl" />
            <div className="relative z-10">
              <div className="text-center mb-8">
                <span className="inline-flex items-center gap-2 bg-[#f97316]/10 text-[#f97316] text-xs font-bold uppercase tracking-[0.2em] px-4 py-2 rounded-full mb-4 border border-[#f97316]/20">
                  <TruckIcon />
                  FREE ESTIMATE
                </span>
                <h2 className="text-3xl md:text-4xl font-extrabold mb-3">
                  Ready to <span className="text-[#f97316]">Get Moving?</span>
                </h2>
                <p className="text-muted max-w-lg mx-auto">
                  Tell us about your move. We will get back to you within 2 hours with a free, no-obligation estimate.
                </p>
              </div>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Your Name"
                    className="w-full h-13 px-5 rounded-xl bg-white/5 border border-[#f97316]/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#f97316]/50 transition-colors"
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    className="w-full h-13 px-5 rounded-xl bg-white/5 border border-[#f97316]/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#f97316]/50 transition-colors"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    className="w-full h-13 px-5 rounded-xl bg-white/5 border border-[#f97316]/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#f97316]/50 transition-colors"
                  />
                  <input
                    type="text"
                    placeholder="Moving Date (approx.)"
                    className="w-full h-13 px-5 rounded-xl bg-white/5 border border-[#f97316]/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#f97316]/50 transition-colors"
                  />
                </div>
                <textarea
                  placeholder="Tell us about your move (from, to, size of home, any special items)..."
                  rows={4}
                  className="w-full px-5 py-4 rounded-xl bg-white/5 border border-[#f97316]/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#f97316]/50 resize-none transition-colors"
                />
                <button
                  type="button"
                  className="w-full h-14 rounded-xl bg-gradient-to-r from-[#f97316] to-[#ea580c] text-white font-bold text-lg hover:from-[#fb923c] hover:to-[#f97316] transition-all duration-300 shadow-lg shadow-[#f97316]/20"
                >
                  Get My Free Estimate
                </button>
                <p className="text-center text-white/30 text-xs">
                  No obligation. No hidden fees. Just an honest price for an honest move.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ════════════════ Final CTA ════════════════ */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#f97316]/10 via-[#f97316]/5 to-[#0a0908]" />
        <RoadPattern opacity={0.03} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#f97316]/30 to-transparent" />
          <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full blur-[180px] bg-[#f97316]/8" />
        </div>
        <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block text-[#f97316] text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border border-[#f97316]/20 bg-[#f97316]/5">
              BOOK TODAY
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold mb-4 tracking-tight">
              Your Stress-Free Move <span className="text-[#f97316]">Starts Here</span>
            </h2>
            <p className="text-muted text-lg mb-10 max-w-xl mx-auto leading-relaxed">
              The best moving dates fill up fast. Lock in your preferred date and let Cascadia handle the heavy lifting &mdash; literally.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#contact"
                className="group inline-flex h-14 px-10 rounded-full bg-gradient-to-r from-[#f97316] to-[#ea580c] text-white font-bold items-center justify-center text-lg hover:from-[#fb923c] hover:to-[#f97316] transition-all duration-300 shadow-lg shadow-[#f97316]/25 gap-2"
              >
                <span>Free Estimate</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:translate-x-1 transition-transform">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
              <a
                href="tel:2535550112"
                className="inline-flex h-14 px-10 rounded-full border-2 border-[#f97316]/30 text-[#f97316] font-bold items-center justify-center text-lg hover:bg-[#f97316]/10 hover:border-[#f97316]/50 transition-all duration-300 gap-2"
              >
                <PhoneIcon />
                <span>(253) 555-0112</span>
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </TemplateLayout>
  );
}
