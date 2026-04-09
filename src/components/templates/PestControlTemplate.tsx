"use client";

import { motion } from "framer-motion";
import TemplateLayout from "./TemplateLayout";

/* ───────────────────────── SVG Icons ───────────────────────── */

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const BugIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M12 2a3 3 0 00-3 3v1H6a1 1 0 00-1 1v1h2v1a5 5 0 003 4.58V18a2 2 0 104 0v-5.42A5 5 0 0017 8V7h2V6a1 1 0 00-1-1h-3V5a3 3 0 00-3-3z" />
    <path d="M5 11H3m18 0h-2M5 15H3m18 0h-2" strokeLinecap="round" />
  </svg>
);

const MouseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M12 18c4-1 7-4 7-8a7 7 0 00-14 0c0 4 3 7 7 8z" />
    <circle cx="9.5" cy="9" r="0.5" fill="currentColor" />
    <path d="M12 12v6m-3 0c-3 0-4 2-4 2m10-2c3 0 4 2 4 2" strokeLinecap="round" />
    <path d="M5 6L3 4m16 2l2-2" strokeLinecap="round" />
  </svg>
);

const LeafIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75" />
  </svg>
);

const HouseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const SprayIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M15 3h-2v3h-2V3H9l1 3H8v2h8V6h-2l1-3z" />
    <path d="M10 8v1a1 1 0 00-1 1v10a2 2 0 002 2h2a2 2 0 002-2V10a1 1 0 00-1-1V8" />
    <path d="M17 5l2-1m-2 3l2 1m-2-1h2" strokeLinecap="round" />
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

const CheckCircleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const StarIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const WaspIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <ellipse cx="12" cy="7" rx="4" ry="3" />
    <ellipse cx="12" cy="15" rx="5" ry="4" />
    <path d="M12 10v2" />
    <path d="M8 7l-3-3m11 3l3-3" strokeLinecap="round" />
    <path d="M7 14l-2 3m12-3l2 3" strokeLinecap="round" />
    <path d="M9 15h6M9 17h6" strokeLinecap="round" strokeWidth="1" />
  </svg>
);

const MosquitoIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <circle cx="12" cy="14" r="4" />
    <path d="M12 10V3m0 0L9 5m3-2l3 2" strokeLinecap="round" />
    <path d="M8 12l-4-2m12 2l4-2M8 16l-4 2m12-2l4 2" strokeLinecap="round" />
    <path d="M10 18l-1 3m5-3l1 3" strokeLinecap="round" />
  </svg>
);

/* ───────────────────────── Hex Pattern ───────────────────────── */

const HexPattern = ({ opacity = 0.03 }: { opacity?: number }) => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }}>
    <defs>
      <pattern id="pestHex" width="56" height="100" patternUnits="userSpaceOnUse" patternTransform="scale(1.2)">
        <path d="M28 66L0 50V16L28 0l28 16v34L28 66z" fill="none" stroke="#84cc16" strokeWidth="0.5" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#pestHex)" />
  </svg>
);

/* ───────────────────────── Data ───────────────────────── */

const services = [
  {
    name: "Ant Control",
    desc: "Sugar ants, carpenter ants, odorous ants. We trace the colony, eliminate it at the source, and seal entry points for lasting protection.",
    icon: <BugIcon />,
    tags: ["Carpenter Ants", "Sugar Ants", "Pavement Ants"],
  },
  {
    name: "Rodent Control",
    desc: "Mice, rats, and other rodents removed humanely and effectively. We seal entry points and prevent future infestations.",
    icon: <MouseIcon />,
    tags: ["Mice", "Rats", "Exclusion"],
  },
  {
    name: "Termite Treatment",
    desc: "Protect your largest investment. Our advanced baiting and barrier systems eliminate termites and guard against future damage.",
    icon: <HouseIcon />,
    tags: ["Inspections", "Baiting", "Barrier Systems"],
  },
  {
    name: "Wildlife Removal",
    desc: "Raccoons, squirrels, opossums, and birds removed safely and relocated humanely. Full attic and crawl space restoration available.",
    icon: <ShieldIcon />,
    tags: ["Raccoons", "Squirrels", "Birds"],
  },
  {
    name: "Wasp & Bee Removal",
    desc: "Yellow jackets, paper wasps, hornets, and bee hives removed safely. We suit up so you do not have to.",
    icon: <WaspIcon />,
    tags: ["Yellow Jackets", "Hornets", "Bee Hives"],
  },
  {
    name: "Mosquito Treatment",
    desc: "Take back your yard with our barrier spray program. Reduce mosquito populations by up to 90% for the entire season.",
    icon: <MosquitoIcon />,
    tags: ["Yard Spray", "Seasonal", "Larvicide"],
  },
];

const pestGuide = [
  {
    pest: "Carpenter Ants",
    sign: "Sawdust-like shavings near wood structures, rustling sounds in walls",
    risk: "Structural damage to wood framing and supports",
    icon: <BugIcon />,
  },
  {
    pest: "Norway Rats",
    sign: "Droppings along walls, gnaw marks on wires and pipes, grease rubs",
    risk: "Disease transmission, fire hazard from chewed wiring",
    icon: <MouseIcon />,
  },
  {
    pest: "Subterranean Termites",
    sign: "Mud tubes on foundation walls, hollow-sounding wood, shed wings",
    risk: "Severe structural damage if left untreated",
    icon: <HouseIcon />,
  },
  {
    pest: "Yellow Jackets",
    sign: "Increased wasp activity near eaves, ground nests, aggressive behavior",
    risk: "Painful stings, allergic reactions, nest expansion",
    icon: <WaspIcon />,
  },
];

const processSteps = [
  {
    step: "01",
    title: "Free Inspection",
    desc: "A certified technician visits your property, identifies all pest activity, and maps entry points at no cost to you.",
  },
  {
    step: "02",
    title: "Custom Plan",
    desc: "We design a targeted treatment plan using the safest, most effective methods for your specific pest problem.",
  },
  {
    step: "03",
    title: "Safe Treatment",
    desc: "Our eco-friendly products eliminate pests while keeping your family, pets, and garden completely safe.",
  },
  {
    step: "04",
    title: "Ongoing Protection",
    desc: "Scheduled follow-ups and preventive barriers ensure pests never return. Guaranteed results or we re-treat free.",
  },
];

const testimonials = [
  {
    name: "Chris M.",
    text: "Had a massive carpenter ant problem destroying our deck. They came out same day, identified every colony, and the ants were gone within a week. Incredible service.",
    service: "Ant Control",
    rating: 5,
  },
  {
    name: "Diana P.",
    text: "Mice were getting into our kitchen every winter. They sealed every entry point and set up monitoring stations. Two years and not a single mouse since. Worth every penny.",
    service: "Rodent Control",
    rating: 5,
  },
  {
    name: "Jake W.",
    text: "Found termite damage during a remodel and panicked. These folks calmed us down, treated the entire foundation, and saved us from tens of thousands in structural repair.",
    service: "Termite Treatment",
    rating: 5,
  },
];

const serviceAreas = [
  "Olympia", "Lacey", "Tumwater", "Shelton", "Centralia",
  "Yelm", "Tenino", "Rainier", "Chehalis", "DuPont",
  "Joint Base Lewis-McChord", "Rochester",
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
        className="inline-block text-[#84cc16] text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border border-[#84cc16]/20 bg-[#84cc16]/5"
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
        <span className="text-[#84cc16]">{highlightWord}</span>
        {parts[1] || ""}
      </motion.h2>
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className={`h-0.5 w-16 bg-gradient-to-r from-[#84cc16] to-transparent mt-4 ${center ? "mx-auto" : ""}`}
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

export default function PestControlTemplate() {
  return (
    <TemplateLayout
      businessName="Puget Sound Pest Control"
      tagline="Safe, effective, eco-friendly pest control for homes and businesses across Western Washington."
      accentColor="#84cc16"
      accentColorLight="#a3e635"
      heroGradient="linear-gradient(135deg, #111a0a 0%, #0d1408 100%)"
      heroImage="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1400&q=80"
      phone="(360) 555-0108"
      address="Olympia, WA"
    >
      {/* ════════════════ Trust Bar ════════════════ */}
      <section className="py-3 bg-gradient-to-r from-[#84cc16] via-[#65a30d] to-[#84cc16] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9Im5vbmUiLz48cGF0aCBkPSJNMjAgMEwyNiAxMEgyMFYwek0yMCA0MEwyNiAzMEgyMFY0MHoiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIwLjMiIG9wYWNpdHk9IjAuMTUiLz48L3N2Zz4=')] opacity-30" />
        <div className="max-w-6xl mx-auto px-6 flex flex-wrap items-center justify-center gap-6 relative z-10">
          <div className="flex items-center gap-3">
            <ShieldIcon />
            <p className="text-sm font-bold tracking-wide">SAFE, EFFECTIVE, ECO-FRIENDLY</p>
          </div>
          <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm px-5 py-2 rounded-full border border-white/20">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
            </span>
            <span className="text-xs font-bold tracking-wider">FREE INSPECTION: (360) 555-0108</span>
          </div>
        </div>
      </section>

      {/* ════════════════ Stats Banner ════════════════ */}
      <section className="py-12 relative overflow-hidden bg-[#0d1408] border-b border-[#84cc16]/10">
        <HexPattern opacity={0.02} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] rounded-full blur-[180px] bg-[#84cc16]/5" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "10,000+", label: "Homes Protected", icon: <HouseIcon /> },
              { value: "100%", label: "Eco-Friendly", icon: <LeafIcon /> },
              { value: "15+", label: "Years Experience", icon: <ClockIcon /> },
              { value: "4.9", label: "Google Rating", icon: <StarIcon /> },
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
                  <span className="text-[#84cc16]">{stat.icon}</span>
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
        style={{ background: "linear-gradient(180deg, #0a1006 0%, #111a0a 50%, #0a1006 100%)" }}
      >
        <HexPattern />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[10%] right-[5%] w-[500px] h-[500px] rounded-full blur-[160px] bg-[#84cc16]/6" />
          <div className="absolute bottom-[10%] left-[5%] w-[400px] h-[400px] rounded-full blur-[140px] bg-[#84cc16]/4" />
        </div>
        {/* Industry SVG silhouette - leaves and insects */}
        <svg className="absolute bottom-0 right-0 w-96 h-96 opacity-[0.02] pointer-events-none" viewBox="0 0 400 400">
          <path d="M200 50c-50 30-80 100-60 180s80 120 140 140c-20-60-10-130 30-180S350 80 350 50c-60 10-110 30-150 0z" fill="#84cc16" />
        </svg>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="WHAT WE ELIMINATE"
            title="Our Pest Control Services"
            highlightWord="Services"
            subtitle="From tiny ants to large wildlife, we handle every pest with safe, proven methods that protect your family and property."
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((svc, i) => (
              <motion.div
                key={svc.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group relative p-7 rounded-2xl border border-white/[0.06] hover:border-[#84cc16]/30 transition-all duration-500 overflow-hidden bg-white/[0.02]"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,#84cc1615,transparent_70%)]" />
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#84cc16]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl bg-[#84cc16]/10 border border-[#84cc16]/20 flex items-center justify-center text-[#84cc16] group-hover:bg-[#84cc16]/20 group-hover:border-[#84cc16]/40 transition-all duration-300">
                      {svc.icon}
                    </div>
                    <span className="text-4xl font-extrabold text-white/[0.04] group-hover:text-[#84cc16]/10 transition-colors duration-300 leading-none">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold mb-3 group-hover:text-[#84cc16] transition-colors duration-300">{svc.name}</h3>
                  <p className="text-muted text-sm leading-relaxed mb-5">{svc.desc}</p>
                  <div className="flex flex-wrap gap-2">
                    {svc.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-semibold uppercase tracking-wider text-[#84cc16]/70 bg-[#84cc16]/8 border border-[#84cc16]/10 px-2.5 py-1 rounded-full"
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

      {/* ════════════════ Pest Identification Guide ════════════════ */}
      <section
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #111a0a 0%, #152010 50%, #111a0a 100%)" }}
      >
        <HexPattern opacity={0.025} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[30%] left-[50%] -translate-x-1/2 w-[700px] h-[400px] rounded-full blur-[180px] bg-[#84cc16]/6" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="KNOW YOUR ENEMY"
            title="Pest Identification Guide"
            highlightWord="Guide"
            subtitle="Recognize the warning signs early. Here are the most common pests we encounter in Western Washington."
          />
          <div className="grid md:grid-cols-2 gap-6">
            {pestGuide.map((pest, i) => (
              <motion.div
                key={pest.pest}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative p-7 rounded-2xl border border-white/[0.06] hover:border-[#84cc16]/30 transition-all duration-500 overflow-hidden bg-white/[0.02]"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_0%_0%,#84cc1610,transparent_70%)]" />
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-[#84cc16]/30 via-[#84cc16]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10 flex gap-5">
                  <div className="w-14 h-14 shrink-0 rounded-xl bg-[#84cc16]/10 border border-[#84cc16]/20 flex items-center justify-center text-[#84cc16] group-hover:bg-[#84cc16]/20 group-hover:scale-110 transition-all duration-300">
                    {pest.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-2 group-hover:text-[#84cc16] transition-colors duration-300">{pest.pest}</h3>
                    <div className="mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#84cc16]/60 block mb-1">Warning Signs</span>
                      <p className="text-muted text-sm leading-relaxed">{pest.sign}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-400/60 block mb-1">Risk Level</span>
                      <p className="text-red-300/70 text-sm leading-relaxed">{pest.risk}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ Eco-Friendly Promise ════════════════ */}
      <section
        id="about"
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0a1006 0%, #0d1408 50%, #0a1006 100%)" }}
      >
        <HexPattern />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] left-[5%] w-[500px] h-[500px] rounded-full blur-[160px] bg-[#84cc16]/5" />
          <div className="absolute bottom-[10%] right-[10%] w-[350px] h-[350px] rounded-full blur-[140px] bg-[#84cc16]/4" />
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
                <div className="absolute top-0 left-0 w-[75%] h-[70%] rounded-2xl overflow-hidden border-2 border-white/[0.06] shadow-2xl z-10">
                  <img
                    src="https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80"
                    alt="Eco-friendly pest control"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute bottom-0 right-0 w-[65%] h-[55%] rounded-2xl overflow-hidden border-2 border-white/[0.06] shadow-2xl z-20">
                  <img
                    src="https://images.unsplash.com/photo-1609710228159-0fa9bd7c0827?w=400&q=80"
                    alt="Pest control technician"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute top-[55%] left-[60%] z-30 bg-[#84cc16] rounded-2xl px-5 py-4 shadow-xl shadow-[#84cc16]/20 border border-[#a3e635]/30">
                  <span className="block text-3xl font-extrabold text-white leading-none">100%</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-white/80">Eco<br />Friendly</span>
                </div>
                <div className="absolute -top-3 -left-3 w-16 h-16 border-t-2 border-l-2 border-[#84cc16]/20 rounded-tl-xl" />
                <div className="absolute -bottom-3 -right-3 w-16 h-16 border-b-2 border-r-2 border-[#84cc16]/20 rounded-br-xl" />
              </div>
            </motion.div>

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <SectionHeader
                tag="OUR PROMISE"
                title="Eco-Friendly Protection"
                highlightWord="Protection"
                center={false}
              />
              <p className="text-muted leading-relaxed mb-6 text-lg -mt-8">
                At Puget Sound Pest Control, we believe you should never have to choose between a pest-free home and a safe environment. Our treatments are designed to eliminate pests while protecting your family, pets, and the beautiful Pacific Northwest ecosystem.
              </p>
              <p className="text-muted leading-relaxed mb-8">
                We use EPA-registered products with the lowest toxicity profiles available. Our Integrated Pest Management approach means we treat the root cause, not just the symptoms, reducing the need for chemical intervention over time.
              </p>
              <div className="space-y-4">
                {[
                  { icon: <LeafIcon />, title: "Green Certified", desc: "EPA-registered, low-toxicity products safe for families and pets" },
                  { icon: <ShieldIcon />, title: "Guaranteed Results", desc: "If pests return between treatments, we re-treat at no extra cost" },
                  { icon: <SprayIcon />, title: "IPM Approach", desc: "Integrated Pest Management targets root causes, not just symptoms" },
                ].map((feature) => (
                  <div key={feature.title} className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-[#84cc16]/20 transition-colors duration-300">
                    <div className="w-10 h-10 rounded-lg bg-[#84cc16]/10 border border-[#84cc16]/20 flex items-center justify-center text-[#84cc16] shrink-0">
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

      {/* ════════════════ Service Process ════════════════ */}
      <section className="py-20 relative overflow-hidden bg-gradient-to-b from-[#84cc16]/10 to-[#0a1006]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#84cc16]/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#84cc16]/10 to-transparent" />
          <svg className="absolute inset-0 w-full h-full opacity-[0.03]" viewBox="0 0 1000 400">
            <path d="M0 200 Q250 100 500 200 Q750 300 1000 200" stroke="#84cc16" strokeWidth="1" fill="none" />
            <path d="M0 250 Q250 150 500 250 Q750 350 1000 250" stroke="#84cc16" strokeWidth="0.5" fill="none" />
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
              HOW WE <span className="text-[#84cc16]">PROTECT YOUR HOME</span>
            </h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {processSteps.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group text-center p-6 rounded-2xl border border-white/[0.06] hover:border-[#84cc16]/30 bg-white/[0.02] transition-all duration-500 relative overflow-hidden"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,#84cc1612,transparent_70%)]" />
                <div className="relative z-10">
                  <span className="block text-4xl font-extrabold text-[#84cc16]/15 group-hover:text-[#84cc16]/30 transition-colors duration-300 mb-3">{item.step}</span>
                  <h4 className="font-bold mb-2 group-hover:text-[#84cc16] transition-colors duration-300">{item.title}</h4>
                  <p className="text-muted text-sm leading-relaxed">{item.desc}</p>
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
        style={{ background: "linear-gradient(180deg, #0a1006 0%, #0d1408 50%, #0a1006 100%)" }}
      >
        <HexPattern />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[30%] left-[40%] w-[600px] h-[400px] rounded-full blur-[180px] bg-[#84cc16]/5" />
          <svg className="absolute inset-0 w-full h-full opacity-[0.025]" viewBox="0 0 800 400">
            <circle cx="400" cy="200" r="100" stroke="#84cc16" strokeWidth="0.5" fill="none" />
            <circle cx="400" cy="200" r="180" stroke="#84cc16" strokeWidth="0.3" fill="none" />
            <circle cx="400" cy="200" r="260" stroke="#84cc16" strokeWidth="0.2" fill="none" />
          </svg>
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="CLIENT TESTIMONIALS"
            title="Trusted by Thousands"
            highlightWord="Thousands"
            subtitle="Real stories from homeowners who trust us to keep their families safe from pests."
          />
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative p-7 rounded-2xl border border-white/[0.06] hover:border-[#84cc16]/30 transition-all duration-500 overflow-hidden bg-white/[0.02]"
              >
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-[#84cc16]/40 via-[#84cc16]/10 to-transparent" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_0%_0%,#84cc1610,transparent_70%)]" />
                <div className="relative z-10">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#84cc16]/70 bg-[#84cc16]/8 border border-[#84cc16]/10 px-2.5 py-1 rounded-full">
                    {t.service}
                  </span>
                  <div className="flex items-center gap-0.5 text-[#84cc16] mt-4 mb-4">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <StarIcon key={j} />
                    ))}
                  </div>
                  <p className="text-muted leading-relaxed mb-6 text-sm">&ldquo;{t.text}&rdquo;</p>
                  <div className="flex items-center gap-3 pt-4 border-t border-white/[0.06]">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#84cc16]/30 to-[#84cc16]/10 flex items-center justify-center text-sm font-bold text-[#84cc16]">
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
        style={{ background: "linear-gradient(180deg, #111a0a 0%, #152010 50%, #111a0a 100%)" }}
      >
        <HexPattern opacity={0.02} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] left-[10%] w-[400px] h-[400px] rounded-full blur-[140px] bg-[#84cc16]/5" />
          <div className="absolute bottom-[15%] right-[10%] w-[350px] h-[350px] rounded-full blur-[120px] bg-[#84cc16]/4" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="WHERE WE SERVE"
            title="Our Service Area"
            highlightWord="Service Area"
            subtitle="Proudly protecting homes and businesses across the greater Olympia region and Western Washington."
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {serviceAreas.map((area, i) => (
              <motion.div
                key={area}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                className="group flex items-center gap-3 p-4 rounded-xl border border-white/[0.06] hover:border-[#84cc16]/30 bg-white/[0.02] transition-all duration-300"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5 text-[#84cc16] shrink-0">
                  <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-sm font-medium group-hover:text-[#84cc16] transition-colors duration-300">{area}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ Free Inspection CTA ════════════════ */}
      <section
        id="contact"
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0a1006 0%, #0e1a0c 50%, #0a1006 100%)" }}
      >
        <HexPattern opacity={0.02} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-[200px] bg-[#84cc16]/6" />
        </div>
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-8 md:p-12 rounded-2xl border border-[#84cc16]/20 relative overflow-hidden bg-gradient-to-b from-[#84cc16]/[0.06] to-transparent"
          >
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,#84cc1615,transparent_60%)]" />
            <div className="absolute top-0 left-0 w-20 h-20 border-t border-l border-[#84cc16]/30 rounded-tl-2xl" />
            <div className="absolute bottom-0 right-0 w-20 h-20 border-b border-r border-[#84cc16]/30 rounded-br-2xl" />
            <div className="relative z-10">
              <div className="text-center mb-8">
                <span className="inline-flex items-center gap-2 bg-[#84cc16]/10 text-[#84cc16] text-xs font-bold uppercase tracking-[0.2em] px-4 py-2 rounded-full mb-4 border border-[#84cc16]/20">
                  <ShieldIcon />
                  FREE INSPECTION
                </span>
                <h2 className="text-3xl md:text-4xl font-extrabold mb-3">
                  Schedule Your Free <span className="text-[#84cc16]">Inspection</span>
                </h2>
                <p className="text-muted max-w-lg mx-auto">
                  A certified technician will inspect your property, identify any pest activity, and provide a no-obligation treatment plan.
                </p>
              </div>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Your Name"
                    className="w-full h-13 px-5 rounded-xl bg-white/5 border border-[#84cc16]/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#84cc16]/50 transition-colors"
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    className="w-full h-13 px-5 rounded-xl bg-white/5 border border-[#84cc16]/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#84cc16]/50 transition-colors"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    className="w-full h-13 px-5 rounded-xl bg-white/5 border border-[#84cc16]/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#84cc16]/50 transition-colors"
                  />
                  <select className="w-full h-13 px-5 rounded-xl bg-white/5 border border-[#84cc16]/15 text-white/50 text-sm focus:outline-none focus:border-[#84cc16]/50 transition-colors appearance-none">
                    <option value="">Select Pest Type</option>
                    <option value="ants">Ants</option>
                    <option value="rodents">Rodents</option>
                    <option value="termites">Termites</option>
                    <option value="wildlife">Wildlife</option>
                    <option value="wasps">Wasps / Bees</option>
                    <option value="mosquitoes">Mosquitoes</option>
                    <option value="other">Other / Not Sure</option>
                  </select>
                </div>
                <textarea
                  placeholder="Describe the pest activity you are experiencing (where, when, how severe)..."
                  rows={4}
                  className="w-full px-5 py-4 rounded-xl bg-white/5 border border-[#84cc16]/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#84cc16]/50 resize-none transition-colors"
                />
                <button
                  type="button"
                  className="w-full h-14 rounded-xl bg-gradient-to-r from-[#84cc16] to-[#65a30d] text-white font-bold text-lg hover:from-[#a3e635] hover:to-[#84cc16] transition-all duration-300 shadow-lg shadow-[#84cc16]/20"
                >
                  Book Free Inspection
                </button>
                <p className="text-center text-white/30 text-xs">
                  We respond within 1 hour during business hours. Same-day emergency service available.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ════════════════ Final CTA ════════════════ */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#84cc16]/10 via-[#84cc16]/5 to-[#0a1006]" />
        <HexPattern opacity={0.03} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#84cc16]/30 to-transparent" />
          <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full blur-[180px] bg-[#84cc16]/8" />
        </div>
        <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block text-[#84cc16] text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border border-[#84cc16]/20 bg-[#84cc16]/5">
              ACT NOW
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold mb-4 tracking-tight">
              Take Back Your Home <span className="text-[#84cc16]">Today</span>
            </h2>
            <p className="text-muted text-lg mb-10 max-w-xl mx-auto leading-relaxed">
              Every day you wait, pests multiply. Get ahead of the problem with a free professional inspection and same-day treatment options.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#contact"
                className="group inline-flex h-14 px-10 rounded-full bg-gradient-to-r from-[#84cc16] to-[#65a30d] text-white font-bold items-center justify-center text-lg hover:from-[#a3e635] hover:to-[#84cc16] transition-all duration-300 shadow-lg shadow-[#84cc16]/25 gap-2"
              >
                <span>Free Inspection</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:translate-x-1 transition-transform">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
              <a
                href="tel:3605550108"
                className="inline-flex h-14 px-10 rounded-full border-2 border-[#84cc16]/30 text-[#84cc16] font-bold items-center justify-center text-lg hover:bg-[#84cc16]/10 hover:border-[#84cc16]/50 transition-all duration-300 gap-2"
              >
                <PhoneIcon />
                <span>(360) 555-0108</span>
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </TemplateLayout>
  );
}
