"use client";

/* eslint-disable @next/next/no-img-element -- These static marketing and preview components intentionally use plain img tags to preserve existing markup and visual behavior during lint-only cleanup. */

import { motion } from "framer-motion";
import TemplateLayout from "./TemplateLayout";

/* ───────────────────────── SVG Icons ───────────────────────── */

const NeedleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M4 20L20 4M15 4l5 5M4 20l3-8 5 5-8 3z" />
    <path d="M16.5 7.5l-2 2" strokeLinecap="round" />
  </svg>
);

const InkDropIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M12 2C12 2 5 11 5 15a7 7 0 0014 0c0-4-7-13-7-13z" />
    <path d="M9 16a3 3 0 003 3" strokeLinecap="round" />
  </svg>
);

const SkullIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M12 2C7 2 3 6.5 3 11c0 3 1.5 5.5 4 7v2a1 1 0 001 1h8a1 1 0 001-1v-2c2.5-1.5 4-4 4-7 0-4.5-4-9-9-9z" />
    <circle cx="9" cy="10" r="1.5" fill="currentColor" />
    <circle cx="15" cy="10" r="1.5" fill="currentColor" />
    <path d="M10 20v-2M14 20v-2M10 15h4" strokeLinecap="round" />
  </svg>
);

const RoseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M12 3c-2 2-4 4-4 7s2 5 4 5 4-2 4-5-2-5-4-7z" />
    <path d="M8.5 8C6 9 4 11 4 14c0 2 1 3.5 2.5 4.5" />
    <path d="M15.5 8c2.5 1 4.5 3 4.5 6 0 2-1 3.5-2.5 4.5" />
    <path d="M12 15v7M9 19l3-2 3 2" strokeLinecap="round" />
  </svg>
);

const AnchorIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <circle cx="12" cy="5" r="3" />
    <path d="M12 8v13M5 12H2l3 9h14l3-9h-3" />
    <path d="M12 21c-4 0-7-3-7-7" />
    <path d="M12 21c4 0 7-3 7-7" />
  </svg>
);

const StarIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
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

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const QuoteIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 opacity-20">
    <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5 3.871 3.871 0 01-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5 3.871 3.871 0 01-2.748-1.179z" />
  </svg>
);

/* ───────────────────────── SVG Patterns ───────────────────────── */

const TattooGridPattern = ({ opacity = 0.03 }: { opacity?: number }) => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }}>
    <defs>
      <pattern id="tattooGrid" width="80" height="80" patternUnits="userSpaceOnUse">
        <path d="M 80 0 L 0 0 0 80" fill="none" stroke="#a3a3a3" strokeWidth="0.3" />
        <circle cx="40" cy="40" r="1" fill="#a3a3a3" opacity="0.3" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#tattooGrid)" />
  </svg>
);

const FlashSheetPattern = ({ opacity = 0.03 }: { opacity?: number }) => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }} viewBox="0 0 800 600">
    {/* Roses */}
    <circle cx="100" cy="80" r="20" stroke="#a3a3a3" strokeWidth="0.5" fill="none" />
    <path d="M95 80 Q100 65 105 80 Q100 70 95 80" stroke="#a3a3a3" strokeWidth="0.4" fill="none" />
    <path d="M100 100 L100 130 M95 120 L100 115 L105 120" stroke="#a3a3a3" strokeWidth="0.4" fill="none" />
    {/* Skull */}
    <ellipse cx="700" cy="100" rx="22" ry="28" stroke="#a3a3a3" strokeWidth="0.5" fill="none" />
    <circle cx="693" cy="92" r="5" stroke="#a3a3a3" strokeWidth="0.4" fill="none" />
    <circle cx="707" cy="92" r="5" stroke="#a3a3a3" strokeWidth="0.4" fill="none" />
    <path d="M695 108 h10" stroke="#a3a3a3" strokeWidth="0.4" />
    {/* Anchor */}
    <circle cx="400" cy="500" r="8" stroke="#a3a3a3" strokeWidth="0.5" fill="none" />
    <path d="M400 508 V540 M388 530 Q388 540 400 540 Q412 540 412 530" stroke="#a3a3a3" strokeWidth="0.4" fill="none" />
    {/* Dagger */}
    <path d="M200 450 L200 520 M192 470 L208 470 M195 520 L200 535 L205 520" stroke="#a3a3a3" strokeWidth="0.4" fill="none" />
    {/* Stars scattered */}
    <path d="M600 300 l2 6 6 0 -5 4 2 6 -5-3 -5 3 2-6 -5-4 6 0z" stroke="#a3a3a3" strokeWidth="0.3" fill="none" />
    <path d="M150 350 l1.5 4.5 4.5 0 -3.7 3 1.5 4.5 -3.8-2.3 -3.8 2.3 1.5-4.5 -3.7-3 4.5 0z" stroke="#a3a3a3" strokeWidth="0.3" fill="none" />
    {/* Snake */}
    <path d="M550 150 Q570 130 590 150 Q610 170 590 190 Q570 210 550 190" stroke="#a3a3a3" strokeWidth="0.4" fill="none" />
  </svg>
);

/* ───────────────────────── Data ───────────────────────── */

const artists = [
  {
    name: "Jake &ldquo;Viper&rdquo; Morrison",
    title: "Owner / Lead Artist",
    image: "https://images.unsplash.com/photo-1531891437562-4301cf35b7e4?w=400&q=80",
    specialties: ["Japanese", "Realism", "Cover-ups"],
    yearsExp: 16,
  },
  {
    name: "Luna Reyes",
    title: "Senior Artist",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80",
    specialties: ["Watercolor", "Neo-Traditional", "Floral"],
    yearsExp: 11,
  },
  {
    name: "Marcus &ldquo;Ink&rdquo; Chen",
    title: "Artist",
    image: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400&q=80",
    specialties: ["Blackwork", "Geometric", "Dotwork"],
    yearsExp: 8,
  },
  {
    name: "Raven Blackwood",
    title: "Artist",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80",
    specialties: ["Traditional", "Old School", "Lettering"],
    yearsExp: 9,
  },
];

const styles = [
  {
    name: "Traditional",
    desc: "Bold outlines, vivid color, and timeless American flash. Anchors, eagles, roses, and skulls that never go out of style.",
    icon: <AnchorIcon />,
  },
  {
    name: "Neo-Traditional",
    desc: "Classic motifs reborn with modern detail, richer palettes, and illustrative depth that turns skin into a gallery wall.",
    icon: <RoseIcon />,
  },
  {
    name: "Realism",
    desc: "Photographic precision etched into skin. Portraits, wildlife, and hyper-detailed pieces that blur the line between art and reality.",
    icon: <NeedleIcon />,
  },
  {
    name: "Blackwork",
    desc: "Pure black ink pushed to its limits. Heavy coverage, ornamental patterns, and stark contrasts that command attention.",
    icon: <SkullIcon />,
  },
  {
    name: "Watercolor",
    desc: "Flowing pigment, painterly splashes, and no hard lines. Artistic, expressive pieces that look like living paintings.",
    icon: <InkDropIcon />,
  },
  {
    name: "Geometric",
    desc: "Sacred geometry, mandalas, and mathematically precise patterns. Clean lines and symmetry that satisfy the perfectionist.",
    icon: <AnchorIcon />,
  },
];

const bookingSteps = [
  { step: "01", title: "Consultation", desc: "Walk in or book online. Tell us your vision, placement, and size. We will pair you with the right artist." },
  { step: "02", title: "Custom Design", desc: "Your artist creates an original drawing tailored to your body and concept. Revisions are included until you love it." },
  { step: "03", title: "Session Day", desc: "Relax in a private suite while your artist brings the design to life. Large pieces may be split across sessions." },
  { step: "04", title: "Aftercare", desc: "We send you home with a detailed care kit and follow-up instructions. Touch-ups within 90 days are always free." },
];

const aftercareTips = [
  "Keep bandage on for 2-4 hours after your session",
  "Wash gently with fragrance-free soap and lukewarm water",
  "Apply a thin layer of recommended aftercare ointment 2-3 times daily",
  "Avoid direct sunlight, pools, and hot tubs for 2-3 weeks",
  "Do not scratch or pick at scabbing &mdash; let it heal naturally",
  "Wear loose, breathable clothing over the tattooed area",
  "Stay hydrated and avoid alcohol for the first 48 hours",
  "Free touch-ups within 90 days if needed",
];

const testimonials = [
  {
    name: "Derek H.",
    text: "Jake did a full sleeve that took four sessions. Every line is razor sharp and the shading is unreal. People stop me on the street to ask who did it.",
    style: "Japanese Sleeve",
    rating: 5,
  },
  {
    name: "Amber T.",
    text: "Luna turned my rough sketch into the most beautiful watercolor peony. The colors are still vibrant two years later. Already booked my next piece.",
    style: "Watercolor",
    rating: 5,
  },
  {
    name: "Chris M.",
    text: "Marcus covered an old regrettable tattoo with a geometric mandala that is absolutely flawless. You would never know anything was there before.",
    style: "Geometric Cover-up",
    rating: 5,
  },
];

const faqs = [
  {
    q: "How much does a tattoo cost?",
    a: "Pricing depends on size, detail, and placement. Small pieces start around $150. Larger custom work is billed at an hourly rate. We provide exact quotes during your free consultation.",
  },
  {
    q: "Does it hurt?",
    a: "Pain varies by placement and personal tolerance. Most clients describe it as a scratching or vibrating sensation. We offer numbing cream for sensitive areas at no extra charge.",
  },
  {
    q: "How old do I have to be?",
    a: "You must be 18 or older with valid government-issued photo ID. We do not tattoo minors under any circumstances, even with parental consent.",
  },
  {
    q: "Can you cover an existing tattoo?",
    a: "Absolutely. Cover-ups are one of our specialties. Bring your existing piece to the consultation and we will design something that transforms it completely.",
  },
  {
    q: "How long does a tattoo session last?",
    a: "Small pieces take 1-2 hours. Larger custom work runs 3-5 hours per session. We schedule breaks and never rush the process.",
  },
  {
    q: "Do you do walk-ins?",
    a: "Yes, walk-ins are welcome based on artist availability. However, custom pieces require a consultation and design appointment to ensure the best result.",
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
        className="inline-block text-[#a3a3a3] text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border border-[#a3a3a3]/20 bg-[#a3a3a3]/5"
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
        <span className="text-[#a3a3a3]">{highlightWord}</span>
        {parts[1] || ""}
      </motion.h2>
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className={`h-0.5 w-16 bg-gradient-to-r from-[#a3a3a3] to-transparent mt-4 ${center ? "mx-auto" : ""}`}
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

export default function TattooTemplate() {
  return (
    <TemplateLayout
      businessName="Black Ink Collective"
      tagline="Custom tattoo art from Seattle&apos;s most fearless artists. Walk-ins welcome."
      accentColor="#a3a3a3"
      accentColorLight="#d4d4d4"
      heroGradient="linear-gradient(135deg, #0a0a0a 0%, #111111 50%, #0a0a0a 100%)"
      heroImage="https://images.unsplash.com/photo-1562962230-16e4623d36e6?w=1400&q=80"
      phone="(206) 555-0132"
      address="Capitol Hill, Seattle, WA"
    >
      {/* ════════════════ Walk-In Bar ════════════════ */}
      <section className="py-3 bg-gradient-to-r from-[#1a1a1a] via-[#222222] to-[#1a1a1a] text-white relative overflow-hidden border-y border-[#a3a3a3]/10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9Im5vbmUiLz48cGF0aCBkPSJNMCAwTDQwIDQwTTQwIDBMMCA0MCIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjAuMyIgb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')] opacity-30" />
        <div className="max-w-6xl mx-auto px-6 flex flex-wrap items-center justify-center gap-6 relative z-10">
          <div className="flex items-center gap-3">
            <NeedleIcon />
            <p className="text-sm font-bold tracking-wide uppercase">Walk-ins Welcome &mdash; Custom Tattoos By Appointment</p>
          </div>
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-5 py-2 rounded-full border border-[#a3a3a3]/20">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
            </span>
            <span className="text-xs font-bold tracking-wider">OPEN TODAY: 12PM - 10PM</span>
          </div>
        </div>
      </section>

      {/* ════════════════ Stats Banner ════════════════ */}
      <section className="py-12 relative overflow-hidden bg-[#0a0a0a] border-b border-[#a3a3a3]/10">
        <TattooGridPattern opacity={0.02} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] rounded-full blur-[180px] bg-[#a3a3a3]/5" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "10,000+", label: "Tattoos Done", icon: <NeedleIcon /> },
              { value: "16+", label: "Years Open", icon: <ClockIcon /> },
              { value: "4.9", label: "Google Rating", icon: <StarIcon /> },
              { value: "4", label: "Resident Artists", icon: <InkDropIcon /> },
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
                  <span className="text-[#a3a3a3]">{stat.icon}</span>
                  <span className="text-3xl md:text-4xl font-extrabold text-white">{stat.value}</span>
                </div>
                <span className="text-muted text-sm font-medium tracking-wide uppercase">{stat.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ Artist Gallery ════════════════ */}
      <section
        id="services"
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0a0a0a 0%, #111111 50%, #0a0a0a 100%)" }}
      >
        <FlashSheetPattern />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] right-[10%] w-[500px] h-[500px] rounded-full blur-[180px] bg-[#a3a3a3]/5" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="THE CREW"
            title="Meet Your Artists"
            highlightWord="Artists"
            subtitle="Every artist at Black Ink Collective is handpicked for raw talent, relentless dedication, and a vision that pushes boundaries."
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {artists.map((artist, i) => (
              <motion.div
                key={artist.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative rounded-2xl border border-white/[0.06] hover:border-[#a3a3a3]/30 transition-all duration-500 overflow-hidden bg-white/[0.02]"
              >
                {/* Photo */}
                <div className="relative aspect-[3/4] overflow-hidden">
                  <img
                    src={artist.image}
                    alt={artist.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 grayscale group-hover:grayscale-0"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/40 to-transparent" />
                  {/* Years badge */}
                  <div className="absolute top-4 right-4 bg-[#a3a3a3]/90 backdrop-blur-sm text-black text-xs font-bold px-3 py-1.5 rounded-full">
                    {artist.yearsExp}+ YRS
                  </div>
                  {/* Info overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <h3 className="text-lg font-bold mb-1" dangerouslySetInnerHTML={{ __html: artist.name }} />
                    <p className="text-[#a3a3a3] text-sm font-semibold mb-3">{artist.title}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {artist.specialties.map((s) => (
                        <span key={s} className="text-[9px] font-semibold uppercase tracking-wider text-white/60 bg-white/10 border border-white/10 px-2 py-0.5 rounded-full">
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

      {/* ════════════════ Style Showcase ════════════════ */}
      <section
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #111111 0%, #0d0d0d 50%, #111111 100%)" }}
      >
        <TattooGridPattern />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[10%] left-[5%] w-[500px] h-[500px] rounded-full blur-[160px] bg-[#a3a3a3]/4" />
          <div className="absolute bottom-[10%] right-[5%] w-[400px] h-[400px] rounded-full blur-[140px] bg-[#a3a3a3]/3" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="WHAT WE DO"
            title="Tattoo Styles"
            highlightWord="Styles"
            subtitle="From old-school flash to cutting-edge technique. Whatever your vision, we have an artist who lives and breathes it."
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {styles.map((style, i) => (
              <motion.div
                key={style.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group relative p-7 rounded-2xl border border-white/[0.06] hover:border-[#a3a3a3]/30 transition-all duration-500 overflow-hidden bg-white/[0.02]"
              >
                {/* Hover glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,#a3a3a315,transparent_70%)]" />
                {/* Top accent line */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#a3a3a3]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  {/* Number + Icon row */}
                  <div className="flex items-start justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl bg-[#a3a3a3]/10 border border-[#a3a3a3]/20 flex items-center justify-center text-[#a3a3a3] group-hover:bg-[#a3a3a3]/20 group-hover:border-[#a3a3a3]/40 transition-all duration-300">
                      {style.icon}
                    </div>
                    <span className="text-4xl font-extrabold text-white/[0.04] group-hover:text-[#a3a3a3]/10 transition-colors duration-300 leading-none">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold mb-3 group-hover:text-[#a3a3a3] transition-colors duration-300">{style.name}</h3>
                  <p className="text-muted text-sm leading-relaxed">{style.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ Booking Process ════════════════ */}
      <section
        id="about"
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0a0a0a 0%, #0e0e0e 50%, #0a0a0a 100%)" }}
      >
        <TattooGridPattern />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[30%] left-[50%] -translate-x-1/2 w-[700px] h-[400px] rounded-full blur-[180px] bg-[#a3a3a3]/5" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="HOW IT WORKS"
            title="The Booking Process"
            highlightWord="Process"
            subtitle="From concept to healed art. Four simple steps to a tattoo you will wear with pride for a lifetime."
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {bookingSteps.map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative p-7 rounded-2xl border border-white/[0.06] hover:border-[#a3a3a3]/30 transition-all duration-500 overflow-hidden bg-white/[0.02] text-center"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,#a3a3a312,transparent_70%)]" />
                <div className="relative z-10">
                  <span className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-[#a3a3a3]/30 to-transparent mb-4 block leading-none">
                    {item.step}
                  </span>
                  <h3 className="text-lg font-bold mb-3 group-hover:text-[#a3a3a3] transition-colors duration-300">{item.title}</h3>
                  <p className="text-muted text-sm leading-relaxed">{item.desc}</p>
                </div>
                {/* Connecting line on desktop */}
                {i < bookingSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-px bg-gradient-to-r from-[#a3a3a3]/20 to-transparent" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ Aftercare Guide ════════════════ */}
      <section
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #111111 0%, #0c0c0c 50%, #111111 100%)" }}
      >
        <FlashSheetPattern opacity={0.02} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] left-[10%] w-[500px] h-[400px] rounded-full blur-[160px] bg-[#a3a3a3]/4" />
          <div className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] rounded-full blur-[140px] bg-[#a3a3a3]/3" />
        </div>
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="HEALING RIGHT"
            title="Aftercare Guide"
            highlightWord="Aftercare"
            subtitle="Your tattoo is an investment. Follow these steps to keep it looking sharp for decades."
          />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-8 md:p-10 rounded-2xl border border-[#a3a3a3]/15 bg-white/[0.02] relative overflow-hidden"
          >
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,#a3a3a310,transparent_60%)]" />
            <div className="absolute top-0 left-0 w-20 h-20 border-t border-l border-[#a3a3a3]/20 rounded-tl-2xl" />
            <div className="absolute bottom-0 right-0 w-20 h-20 border-b border-r border-[#a3a3a3]/20 rounded-br-2xl" />
            <div className="relative z-10 grid md:grid-cols-2 gap-4">
              {aftercareTips.map((tip, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-[#a3a3a3]/20 transition-colors duration-300"
                >
                  <div className="w-7 h-7 rounded-lg bg-[#a3a3a3]/10 border border-[#a3a3a3]/20 flex items-center justify-center text-[#a3a3a3] shrink-0 mt-0.5">
                    <CheckIcon />
                  </div>
                  <p className="text-muted text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: tip }} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ════════════════ Testimonials ════════════════ */}
      <section
        id="testimonials"
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0a0a0a 0%, #0e0e0e 50%, #0a0a0a 100%)" }}
      >
        <TattooGridPattern />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[30%] left-[40%] w-[600px] h-[400px] rounded-full blur-[180px] bg-[#a3a3a3]/4" />
          <svg className="absolute inset-0 w-full h-full opacity-[0.02]" viewBox="0 0 800 400">
            <circle cx="400" cy="200" r="100" stroke="#a3a3a3" strokeWidth="0.5" fill="none" />
            <circle cx="400" cy="200" r="180" stroke="#a3a3a3" strokeWidth="0.3" fill="none" />
            <circle cx="400" cy="200" r="260" stroke="#a3a3a3" strokeWidth="0.2" fill="none" />
          </svg>
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="INK REVIEWS"
            title="Client Stories"
            highlightWord="Stories"
            subtitle="Real ink, real people, real reactions. Hear from our collectors."
          />
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative p-7 rounded-2xl border border-white/[0.06] hover:border-[#a3a3a3]/30 transition-all duration-500 overflow-hidden bg-white/[0.02]"
              >
                {/* Top accent line */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-[#a3a3a3]/40 via-[#a3a3a3]/10 to-transparent" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_0%_0%,#a3a3a310,transparent_70%)]" />
                <div className="relative z-10">
                  {/* Style tag */}
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a3a3a3]/70 bg-[#a3a3a3]/8 border border-[#a3a3a3]/10 px-2.5 py-1 rounded-full">
                    {t.style}
                  </span>
                  {/* Stars */}
                  <div className="flex items-center gap-0.5 text-[#a3a3a3] mt-4 mb-4">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <StarIcon key={j} />
                    ))}
                  </div>
                  {/* Quote icon */}
                  <div className="text-[#a3a3a3] mb-2"><QuoteIcon /></div>
                  {/* Quote */}
                  <p className="text-muted leading-relaxed mb-6 text-sm">&ldquo;{t.text}&rdquo;</p>
                  {/* Author */}
                  <div className="flex items-center gap-3 pt-4 border-t border-white/[0.06]">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#a3a3a3]/30 to-[#a3a3a3]/10 flex items-center justify-center text-sm font-bold text-[#a3a3a3]">
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
        style={{ background: "linear-gradient(180deg, #111111 0%, #0d0d0d 50%, #111111 100%)" }}
      >
        <TattooGridPattern />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] left-[10%] w-[400px] h-[400px] rounded-full blur-[140px] bg-[#a3a3a3]/4" />
          <div className="absolute bottom-[15%] right-[10%] w-[350px] h-[350px] rounded-full blur-[120px] bg-[#a3a3a3]/3" />
        </div>
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="GOT QUESTIONS"
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
                className="group p-6 rounded-2xl border border-white/[0.06] hover:border-[#a3a3a3]/20 transition-all duration-500 overflow-hidden relative bg-white/[0.02]"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_0%_50%,#a3a3a310,transparent_70%)]" />
                <div className="relative z-10 flex gap-4">
                  <div className="w-8 h-8 shrink-0 rounded-lg bg-[#a3a3a3]/10 border border-[#a3a3a3]/20 flex items-center justify-center text-[#a3a3a3] text-xs font-bold mt-0.5">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div>
                    <h3 className="font-bold mb-2 text-white group-hover:text-[#a3a3a3] transition-colors duration-300">{faq.q}</h3>
                    <p className="text-muted text-sm leading-relaxed">{faq.a}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ Booking CTA ════════════════ */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#a3a3a3]/8 via-[#a3a3a3]/3 to-[#0a0a0a]" />
        <TattooGridPattern opacity={0.03} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#a3a3a3]/30 to-transparent" />
          <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full blur-[180px] bg-[#a3a3a3]/6" />
        </div>
        <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block text-[#a3a3a3] text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border border-[#a3a3a3]/20 bg-[#a3a3a3]/5">
              YOUR NEXT PIECE STARTS HERE
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold mb-4 tracking-tight">
              Ready to Get <span className="text-[#a3a3a3]">Inked?</span>
            </h2>
            <p className="text-muted text-lg mb-10 max-w-xl mx-auto leading-relaxed">
              Walk in today or book a free consultation online. Custom designs, world-class artists, and an experience you will never forget.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#contact"
                className="group inline-flex h-14 px-10 rounded-full bg-gradient-to-r from-[#a3a3a3] to-[#888888] text-black font-bold items-center justify-center text-lg hover:from-[#d4d4d4] hover:to-[#a3a3a3] transition-all duration-300 shadow-lg shadow-[#a3a3a3]/15 gap-2"
              >
                <span>Book Consultation</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:translate-x-1 transition-transform">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
              <a
                href="tel:2065550132"
                className="inline-flex h-14 px-10 rounded-full border-2 border-[#a3a3a3]/30 text-[#a3a3a3] font-bold items-center justify-center text-lg hover:bg-[#a3a3a3]/10 hover:border-[#a3a3a3]/50 transition-all duration-300 gap-2"
              >
                <PhoneIcon />
                <span>(206) 555-0132</span>
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </TemplateLayout>
  );
}
