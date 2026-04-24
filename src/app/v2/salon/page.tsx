"use client";

/* eslint-disable @next/next/no-img-element -- Static marketing showcase uses plain img tags intentionally */

import { useRef, useState, useCallback } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  AnimatePresence,
} from "framer-motion";
import {
  Scissors,
  Sparkle,
  Phone,
  EnvelopeSimple,
  MapPin,
  ArrowRight,
  Star,
  InstagramLogo,
  Clock,
  CalendarBlank,
  X,
  List,
  CheckCircle,
  Play,
  Heart,
  Drop,
  Flower,
  Crown,
  ChatCircleDots,
  Quotes,
  FacebookLogo,
  TiktokLogo,
} from "@phosphor-icons/react";

/* ─── color constants ─── */
const ROSE = "#b76e79";
const ROSE_LIGHT = "#d4a0a7";
const BG = "#faf8f5";
const TEXT_DARK = "#1a1a1a";
const TEXT_BODY = "#6b7280";

/* ─── spring configs ─── */
const spring = { type: "spring" as const, stiffness: 100, damping: 20 };
const springFast = { type: "spring" as const, stiffness: 200, damping: 25 };

/* ─── animation variants ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: spring },
};
const sectionStagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

/* ─── magnetic spring button ─── */
function SpringButton({
  children,
  className = "",
  onClick,
  style: externalStyle,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, springFast);
  const sy = useSpring(y, springFast);

  const handleMouse = useCallback(
    (e: React.MouseEvent) => {
      const el = ref.current;
      if (!el) return;
      if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) return;
      const rect = el.getBoundingClientRect();
      x.set((e.clientX - rect.left - rect.width / 2) * 0.2);
      y.set((e.clientY - rect.top - rect.height / 2) * 0.2);
    },
    [x, y]
  );

  return (
    <motion.button
      ref={ref}
      style={{ x: sx, y: sy, ...externalStyle }}
      onMouseMove={handleMouse}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`relative overflow-hidden group ${className}`}
    >
      {children}
    </motion.button>
  );
}

/* ─── section heading ─── */
function SectionHeading({ label, title, accent }: { label: string; title: string; accent: string }) {
  return (
    <motion.div
      variants={sectionStagger}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-100px" }}
      className="mb-14"
    >
      <motion.p variants={fadeUp} className="text-sm font-semibold uppercase tracking-[0.2em]" style={{ color: ROSE }}>
        {label}
      </motion.p>
      <motion.h2 variants={fadeUp} className="mt-3 text-4xl md:text-6xl tracking-tight leading-tight font-light" style={{ color: TEXT_DARK, fontFamily: "'Georgia', 'Times New Roman', serif" }}>
        {title} <span style={{ color: ROSE }} className="font-normal">{accent}</span>
      </motion.h2>
      <motion.div variants={fadeUp} className="mt-4 w-16 h-0.5" style={{ background: ROSE }} />
    </motion.div>
  );
}

/* ─── shimmer border card ─── */
function ShimmerBorder({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative rounded-2xl p-[1px] overflow-hidden ${className}`}>
      <motion.div
        className="absolute inset-0 rounded-2xl"
        style={{
          background: `conic-gradient(from 0deg, ${ROSE}, ${ROSE_LIGHT}, transparent, ${ROSE})`,
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
      />
      <div className="relative bg-white rounded-2xl">
        {children}
      </div>
    </div>
  );
}

/* ─── services data ─── */
const services = [
  { name: "Cut & Style", price: "from $75", icon: Scissors, desc: "Precision cuts tailored to your face shape, lifestyle, and hair texture." },
  { name: "Full Color", price: "from $150", icon: Drop, desc: "Rich, dimensional color using Kerastase and Redken professional-grade formulas." },
  { name: "Balayage", price: "from $225", icon: Sparkle, desc: "Hand-painted highlights for a sun-kissed, natural-looking finish." },
  { name: "Extensions", price: "from $400", icon: Flower, desc: "Seamless tape-in or fusion extensions for length and volume that lasts." },
  { name: "Bridal", price: "from $350", icon: Crown, desc: "Full trial and day-of styling for your most photographed moments." },
  { name: "Keratin Treatment", price: "from $200", icon: Heart, desc: "Smooth, frizz-free hair for up to 12 weeks with zero formaldehyde." },
];

/* ─── stylists data ─── */
const stylists = [
  { name: "Ava Laurent", role: "Owner & Color Specialist", years: "14 years", specialty: "Vidal Sassoon trained. Celebrity colorist known for dimensional brunettes and lived-in blondes.", photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&q=80" },
  { name: "Marcus Chen", role: "Precision Cut Specialist", years: "9 years", specialty: "Master of clean fades, textured bobs, and architectural cuts. Trained in Tokyo.", photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&q=80" },
  { name: "Sofia Rivera", role: "Bridal & Events Lead", years: "11 years", specialty: "Over 300 weddings styled. Expert in updos, braids, and vintage Hollywood waves.", photo: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=500&q=80" },
  { name: "Jess Kim", role: "Extensions & Texture Specialist", years: "7 years", specialty: "Certified Great Lengths and Bellami pro. Specializes in curly, coily, and natural hair.", photo: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=500&q=80" },
];

/* ─── velvet experience steps ─── */
const experienceSteps = [
  { step: "01", title: "Consultation", desc: "A one-on-one conversation about your hair history, lifestyle, and vision." },
  { step: "02", title: "Vision Board", desc: "We curate reference photos and build a personalized color and cut plan." },
  { step: "03", title: "The Transformation", desc: "Your stylist brings the vision to life with premium products and expert technique." },
  { step: "04", title: "Styling & Education", desc: "We teach you how to recreate your look at home with the right products and tools." },
  { step: "05", title: "Your New Confidence", desc: "Walk out feeling like the best version of yourself. That is the Velvet promise." },
];

/* ─── quiz data ─── */
const quizOptions = [
  { vibe: "Classic & Polished", desc: "Timeless blowouts, sleek bobs, and rich brunette tones.", service: "Cut & Style + Full Color", stylist: "Marcus Chen", color: "#c9a87c" },
  { vibe: "Bohemian & Effortless", desc: "Loose waves, lived-in balayage, and textured layers.", service: "Balayage + Styling", stylist: "Ava Laurent", color: "#d4a0a7" },
  { vibe: "Bold & Edgy", desc: "Asymmetric cuts, vivid colors, and statement transformations.", service: "Full Color + Cut & Style", stylist: "Marcus Chen", color: "#8b6f7e" },
  { vibe: "Natural & Healthy", desc: "Curl definition, deep conditioning, and protective styles.", service: "Keratin Treatment + Extensions", stylist: "Jess Kim", color: "#7a9e7e" },
];

/* ─── gallery data ─── */
const galleryItems = [
  { title: "Rose Gold Balayage", stylist: "Ava Laurent", service: "Balayage", image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80", tall: true },
  { title: "Textured Lob", stylist: "Marcus Chen", service: "Cut & Style", image: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600&q=80", tall: false },
  { title: "Bridal Updo", stylist: "Sofia Rivera", service: "Bridal", image: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=600&q=80", tall: true },
  { title: "Copper Highlights", stylist: "Ava Laurent", service: "Full Color", image: "https://plus.unsplash.com/premium_photo-1664048713258-a1844e3d337f?w=600&q=80", tall: false },
  { title: "Natural Curls Defined", stylist: "Jess Kim", service: "Keratin Treatment", image: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=600&q=80", tall: false },
  { title: "Platinum Transformation", stylist: "Ava Laurent", service: "Full Color", image: "https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?w=600&q=80", tall: true },
];

/* ─── testimonials ─── */
const testimonials = [
  { text: "Ava completely transformed my hair. I walked in with box-dyed damage and walked out feeling like myself again.", author: "Natalie W." },
  { text: "Marcus gave me the best haircut of my life. Clean lines, perfect fade, and he actually listened.", author: "Jordan P." },
  { text: "My wedding hair was absolutely flawless. Sofia pinned 200 tiny flowers and it lasted all night.", author: "Emma & Ryan K." },
  { text: "I have been to salons in LA, NYC, and Paris. Velvet is genuinely on that level.", author: "Priya M." },
  { text: "The consultation alone was worth it. Ava talked me out of a bad idea and into something 10x better.", author: "Sam T." },
];

/* ─── comparison data ─── */
const comparisonRows = [
  { feature: "Personalized Consultation", us: true, them: "Rarely" },
  { feature: "Premium Products (Olaplex, Kerastase)", us: true, them: "Generic" },
  { feature: "Dedicated Stylist Assigned", us: true, them: "Whoever is free" },
  { feature: "Relaxing Boutique Atmosphere", us: true, them: "Crowded" },
  { feature: "Post-Visit Styling Education", us: true, them: "No" },
  { feature: "Complimentary Deep Conditioning", us: true, them: "No" },
  { feature: "Online Booking & Reminders", us: true, them: "Sometimes" },
];

/* ─── product brands ─── */
const productBrands = ["Olaplex", "Kerastase", "Redken", "Aveda", "Moroccan Oil"];

/* ═══════════════════════════════════ MAIN PAGE ═══════════════════════════════════ */
export default function V2SalonPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, -80]);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [quizSelection, setQuizSelection] = useState<number | null>(null);

  return (
    <div className="min-h-[100dvh] overflow-x-hidden" style={{ background: BG, color: TEXT_DARK }}>

      {/* ══════════════ NAVIGATION ══════════════ */}
      <motion.nav
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={spring}
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/80 border-b border-rose-100/40 shadow-sm"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 md:px-6 py-4">
          <div className="flex items-center gap-3">
            <Scissors size={26} weight="duotone" style={{ color: ROSE }} />
            <span className="text-xl font-light tracking-wide" style={{ fontFamily: "'Georgia', serif", color: TEXT_DARK }}>
              Velvet <span className="font-normal">Hair Studio</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm" style={{ color: TEXT_BODY }}>
            {["Services", "Stylists", "Gallery", "Reviews", "Contact"].map((link) => (
              <a key={link} href={`#${link.toLowerCase()}`} className="hover:opacity-70 transition-opacity">{link}</a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <SpringButton
              className="px-5 py-2.5 text-white text-sm font-medium rounded-lg"
              style={{ background: ROSE } as React.CSSProperties}
            >
              <span className="relative z-10 flex items-center gap-2">
                <CalendarBlank weight="bold" size={16} /> Book Now
              </span>
            </SpringButton>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-rose-50 transition-colors"
              style={{ color: TEXT_DARK }}
            >
              {mobileMenuOpen ? <X size={24} /> : <List size={24} />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden overflow-hidden border-t border-rose-100/30"
            >
              <div className="flex flex-col gap-1 px-4 py-4 bg-white/95 backdrop-blur-xl">
                {["Services", "Stylists", "Gallery", "Reviews", "Contact"].map((link) => (
                  <a
                    key={link}
                    href={`#${link.toLowerCase()}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3 rounded-lg text-sm hover:bg-rose-50 transition-colors"
                    style={{ color: TEXT_BODY }}
                  >
                    {link}
                  </a>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* ══════════════ 1. HERO — ASYMMETRIC EDITORIAL GRID ══════════════ */}
      <section ref={heroRef} className="relative min-h-[100dvh] z-10 pt-24 md:pt-0">
        <motion.div
          style={{ y: heroY }}
          className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 min-h-[100dvh] flex items-center"
        >
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center py-16 lg:py-0">
            {/* Left: Text */}
            <div className="lg:col-span-5 flex flex-col justify-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...spring, delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-8 w-fit"
                style={{ borderColor: `${ROSE}40`, background: `${ROSE}08` }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: ROSE }} />
                <span className="text-xs font-medium tracking-wide" style={{ color: ROSE }}>Since 2012</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...spring, delay: 0.4 }}
                className="text-5xl md:text-7xl lg:text-8xl leading-[0.95] font-light tracking-tight"
                style={{ fontFamily: "'Georgia', 'Times New Roman', serif", color: TEXT_DARK }}
              >
                Where
                <br />
                <span className="font-normal italic" style={{ color: ROSE }}>Art</span> Meets
                <br />
                Hair
              </motion.h1>

              <motion.div
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ ...spring, delay: 0.7 }}
                className="w-20 h-[2px] mt-6 origin-left"
                style={{ background: ROSE }}
              />

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...spring, delay: 0.8 }}
                className="mt-6 text-lg leading-relaxed max-w-md"
                style={{ color: TEXT_BODY }}
              >
                A boutique salon in Pike Place Market led by Vidal Sassoon-trained
                stylist Ava Laurent. Fourteen years of artistry, one chair at a time.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...spring, delay: 1 }}
                className="mt-8 flex flex-wrap gap-4"
              >
                <SpringButton
                  className="px-8 py-4 text-white font-medium rounded-xl"
                  style={{ background: ROSE } as React.CSSProperties}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Book Your Transformation <ArrowRight weight="bold" size={18} />
                  </span>
                </SpringButton>
                <a
                  href="tel:2065550518"
                  className="px-8 py-4 border rounded-xl flex items-center gap-2 text-sm font-medium transition-colors hover:border-rose-300/60"
                  style={{ borderColor: `${ROSE}30`, color: TEXT_DARK }}
                >
                  <Phone weight="bold" size={18} style={{ color: ROSE }} /> (206) 555-0518
                </a>
              </motion.div>
            </div>

            {/* Right: Asymmetric Photo Grid (editorial mood board) */}
            <div className="lg:col-span-7 relative h-[500px] md:h-[600px] lg:h-[620px]">
              {/* Large photo — top-left */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9, x: -20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                transition={{ ...spring, delay: 0.5 }}
                className="absolute top-0 left-0 w-[60%] md:w-[55%] h-[65%] rounded-2xl overflow-hidden shadow-2xl z-10"
              >
                <img
                  src="https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80"
                  alt="Velvet Hair Studio interior"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
              </motion.div>

              {/* Medium photo — bottom-right, overlapping */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                transition={{ ...spring, delay: 0.7 }}
                className="absolute bottom-0 right-0 w-[55%] md:w-[50%] h-[55%] rounded-2xl overflow-hidden shadow-2xl z-20"
              >
                <img
                  src="https://images.unsplash.com/photo-1562322140-8baeececf3df?w=700&q=80"
                  alt="Hair coloring session"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
              </motion.div>

              {/* Small accent photo — top-right */}
              <motion.div
                initial={{ opacity: 0, scale: 0.85, y: -15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ ...spring, delay: 0.9 }}
                className="absolute top-6 right-4 md:right-8 w-[30%] md:w-[28%] h-[35%] rounded-xl overflow-hidden shadow-xl z-30 border-4 border-white"
              >
                <img
                  src="https://images.unsplash.com/photo-1554519515-242161756769?w=400&q=80"
                  alt="Beautiful hair result"
                  className="w-full h-full object-cover"
                />
              </motion.div>

              {/* Rose gold decorative line */}
              <motion.div
                initial={{ opacity: 0, scaleY: 0 }}
                animate={{ opacity: 0.4, scaleY: 1 }}
                transition={{ ...spring, delay: 1.1 }}
                className="absolute top-[30%] right-[42%] w-[2px] h-32 origin-top hidden lg:block"
                style={{ background: ROSE }}
              />
            </div>
          </div>
        </motion.div>

        <div className="absolute bottom-0 left-0 right-0 h-32 z-20" style={{ background: `linear-gradient(to top, ${BG}, transparent)` }} />
      </section>

      {/* ══════════════ 2. SERVICES MENU ══════════════ */}
      <section id="services" className="relative z-10 py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <SectionHeading label="Service Menu" title="Curated" accent="Services" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((svc, i) => (
              <motion.div
                key={svc.name}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ ...spring, delay: i * 0.08 }}
              >
                <motion.div
                  whileHover={{ y: -4 }}
                  transition={spring}
                  className="h-full p-7 rounded-2xl bg-white shadow-sm border"
                  style={{ borderColor: `${ROSE}18` }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: `${ROSE}10` }}>
                      <svc.icon size={22} weight="duotone" style={{ color: ROSE }} />
                    </div>
                    <span className="text-lg font-semibold" style={{ color: ROSE }}>{svc.price}</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: TEXT_DARK }}>{svc.name}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: TEXT_BODY }}>{svc.desc}</p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ 3. STYLIST PROFILES ══════════════ */}
      <section id="stylists" className="relative z-10 py-20 md:py-28" style={{ background: `${ROSE}06` }}>
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <SectionHeading label="Our Artists" title="Meet the" accent="Stylists" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {stylists.map((stylist, i) => (
              <motion.div
                key={stylist.name}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ ...spring, delay: i * 0.1 }}
              >
                <motion.div
                  whileHover={{ y: -6 }}
                  transition={spring}
                  className="rounded-2xl bg-white shadow-sm border overflow-hidden"
                  style={{ borderColor: `${ROSE}15` }}
                >
                  <div className="h-72 overflow-hidden">
                    <img
                      src={stylist.photo}
                      alt={stylist.name}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="font-semibold text-lg" style={{ color: TEXT_DARK }}>{stylist.name}</h3>
                    <p className="text-sm font-medium mt-0.5" style={{ color: ROSE }}>{stylist.role}</p>
                    <p className="text-xs mt-1" style={{ color: TEXT_BODY }}>{stylist.years}</p>
                    <p className="text-sm leading-relaxed mt-3" style={{ color: TEXT_BODY }}>{stylist.specialty}</p>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ 4. THE VELVET EXPERIENCE ══════════════ */}
      <section className="relative z-10 py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <SectionHeading label="The Journey" title="The Velvet" accent="Experience" />

          <div className="relative">
            {/* Vertical line for desktop */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2" style={{ background: `${ROSE}25` }} />

            <div className="space-y-12 md:space-y-0">
              {experienceSteps.map((step, i) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ ...spring, delay: i * 0.1 }}
                  className={`relative md:flex items-center md:py-10 ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}
                >
                  {/* Content */}
                  <div className={`md:w-1/2 ${i % 2 === 0 ? "md:pr-16 md:text-right" : "md:pl-16"}`}>
                    <span className="text-xs font-semibold tracking-[0.15em] uppercase" style={{ color: ROSE }}>
                      Step {step.step}
                    </span>
                    <h3 className="text-2xl font-light mt-2" style={{ fontFamily: "'Georgia', serif", color: TEXT_DARK }}>
                      {step.title}
                    </h3>
                    <p className="text-sm leading-relaxed mt-2" style={{ color: TEXT_BODY }}>{step.desc}</p>
                  </div>

                  {/* Center dot */}
                  <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-10 h-10 rounded-full items-center justify-center bg-white border-2 shadow-sm" style={{ borderColor: ROSE }}>
                    <span className="text-xs font-bold" style={{ color: ROSE }}>{step.step}</span>
                  </div>

                  {/* Spacer for other half */}
                  <div className="md:w-1/2" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════ 5. STYLE QUIZ ══════════════ */}
      <section className="relative z-10 py-20 md:py-28" style={{ background: `${ROSE}06` }}>
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <SectionHeading label="Discover" title="What's Your Hair" accent="Vibe?" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {quizOptions.map((opt, i) => (
              <motion.div
                key={opt.vibe}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ ...spring, delay: i * 0.08 }}
              >
                <motion.button
                  onClick={() => setQuizSelection(quizSelection === i ? null : i)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="w-full text-left rounded-2xl bg-white border shadow-sm p-6 transition-all"
                  style={{
                    borderColor: quizSelection === i ? ROSE : `${ROSE}18`,
                    boxShadow: quizSelection === i ? `0 0 0 2px ${ROSE}30` : undefined,
                  }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-4 h-4 rounded-full" style={{ background: opt.color }} />
                    <h3 className="font-semibold" style={{ color: TEXT_DARK }}>{opt.vibe}</h3>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: TEXT_BODY }}>{opt.desc}</p>

                  <AnimatePresence>
                    {quizSelection === i && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4 pt-4 border-t" style={{ borderColor: `${ROSE}20` }}>
                          <p className="text-sm font-medium" style={{ color: ROSE }}>Recommended:</p>
                          <p className="text-sm mt-1" style={{ color: TEXT_DARK }}>{opt.service}</p>
                          <p className="text-xs mt-1" style={{ color: TEXT_BODY }}>
                            Ask for <span className="font-medium">{opt.stylist}</span>
                          </p>
                          <a
                            href="#contact"
                            className="inline-flex items-center gap-1 mt-3 text-xs font-semibold"
                            style={{ color: ROSE }}
                          >
                            Book This Look <ArrowRight size={12} weight="bold" />
                          </a>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ 6. GALLERY — MASONRY ══════════════ */}
      <section id="gallery" className="relative z-10 py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <SectionHeading label="Portfolio" title="Our" accent="Work" />

          <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 space-y-5">
            {galleryItems.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ ...spring, delay: i * 0.08 }}
                className={`relative rounded-2xl overflow-hidden cursor-pointer group break-inside-avoid ${item.tall ? "h-80 md:h-96" : "h-56 md:h-64"}`}
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-5">
                  <div>
                    <p className="text-white font-semibold text-sm">{item.title}</p>
                    <p className="text-white/70 text-xs mt-0.5">by {item.stylist} &middot; {item.service}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ 7. WHY VELVET ══════════════ */}
      <section className="relative z-10 py-20 md:py-28" style={{ background: `${ROSE}06` }}>
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <SectionHeading label="Why Us" title="The Velvet" accent="Difference" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Crown, title: "Vidal Sassoon Trained", desc: "Our founder trained at the world's most prestigious hairdressing academy. Technique matters." },
              { icon: Sparkle, title: "Premium Products Only", desc: "We exclusively use Olaplex, Kerastase, Redken, and Aveda. Your hair deserves the best." },
              { icon: ChatCircleDots, title: "Complimentary Consultation", desc: "Every new client gets a free 20-minute consultation before we ever pick up scissors." },
              { icon: Heart, title: "Boutique Atmosphere", desc: "No assembly lines. No rushing. Just a calm, beautiful space designed for your comfort." },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ ...spring, delay: i * 0.1 }}
                className="p-7 rounded-2xl bg-white shadow-sm border"
                style={{ borderColor: `${ROSE}15` }}
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ background: `${ROSE}10` }}>
                  <item.icon size={24} weight="duotone" style={{ color: ROSE }} />
                </div>
                <h3 className="font-semibold text-base mb-2" style={{ color: TEXT_DARK }}>{item.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: TEXT_BODY }}>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ 8. PRODUCTS WE USE ══════════════ */}
      <section className="relative z-10 py-14 md:py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 md:px-6 text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={spring}
            className="text-xs font-semibold uppercase tracking-[0.2em] mb-8"
            style={{ color: ROSE }}
          >
            Products We Trust
          </motion.p>
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
            {productBrands.map((brand, i) => (
              <motion.div
                key={brand}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ ...spring, delay: i * 0.08 }}
                className="px-6 py-3 rounded-full border text-sm font-medium"
                style={{ borderColor: `${ROSE}30`, color: TEXT_DARK, background: `${ROSE}05` }}
              >
                {brand}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ 9. TESTIMONIALS — QUOTE-ONLY MINIMAL ══════════════ */}
      <section id="reviews" className="relative z-10 py-20 md:py-28" style={{ background: BG }}>
        <div className="max-w-4xl mx-auto px-4 md:px-6">
          <SectionHeading label="Client Love" title="What They" accent="Say" />

          {/* Google reviews header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={spring}
            className="flex items-center gap-3 mb-12"
          >
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={18} weight="fill" style={{ color: ROSE }} />
              ))}
            </div>
            <span className="text-sm font-medium" style={{ color: TEXT_DARK }}>4.9 from 127 reviews</span>
          </motion.div>

          <div className="space-y-16">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.author}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ ...spring, delay: i * 0.08 }}
                className="relative"
              >
                <Quotes size={32} weight="fill" className="absolute -top-3 -left-2 opacity-10" style={{ color: ROSE }} />
                <p
                  className="text-xl md:text-2xl leading-relaxed font-light italic pl-6"
                  style={{ fontFamily: "'Georgia', serif", color: TEXT_DARK }}
                >
                  &ldquo;{t.text}&rdquo;
                </p>
                <p className="mt-4 text-sm font-medium pl-6" style={{ color: ROSE }}>
                  &mdash; {t.author}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ 10. NEW CLIENT SPECIAL ══════════════ */}
      <section className="relative z-10 py-20 md:py-28 bg-white">
        <div className="max-w-4xl mx-auto px-4 md:px-6">
          <ShimmerBorder>
            <div className="p-10 md:p-14 text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={spring}
              >
                <span className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: ROSE }}>
                  New Client Offer
                </span>
                <h2 className="mt-4 text-3xl md:text-5xl font-light tracking-tight" style={{ fontFamily: "'Georgia', serif", color: TEXT_DARK }}>
                  First Visit: <span className="font-normal" style={{ color: ROSE }}>20% Off</span>
                </h2>
                <p className="mt-3 text-lg" style={{ color: TEXT_BODY }}>
                  Plus a complimentary deep conditioning treatment
                </p>
                <div className="mt-2 w-12 h-px mx-auto" style={{ background: ROSE }} />
                <p className="mt-4 text-sm" style={{ color: TEXT_BODY }}>
                  Mention this offer when booking. Valid for all services.
                </p>
                <SpringButton
                  className="mt-8 px-8 py-4 text-white font-medium rounded-xl"
                  style={{ background: ROSE } as React.CSSProperties}
                >
                  <span className="relative z-10 flex items-center gap-2 justify-center">
                    Claim Your Offer <ArrowRight weight="bold" size={18} />
                  </span>
                </SpringButton>
              </motion.div>
            </div>
          </ShimmerBorder>
        </div>
      </section>

      {/* ══════════════ 11. COMPETITOR COMPARISON ══════════════ */}
      <section className="relative z-10 py-20 md:py-28" style={{ background: `${ROSE}06` }}>
        <div className="max-w-4xl mx-auto px-4 md:px-6">
          <SectionHeading label="Compare" title="Velvet vs" accent="Chain Salons" />

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={spring}
            className="rounded-2xl bg-white shadow-sm border overflow-hidden"
            style={{ borderColor: `${ROSE}15` }}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: `${ROSE}08` }}>
                    <th className="px-6 py-4 text-left font-medium" style={{ color: TEXT_DARK }}>Feature</th>
                    <th className="px-6 py-4 text-center font-medium" style={{ color: ROSE }}>Velvet Hair Studio</th>
                    <th className="px-6 py-4 text-center font-medium" style={{ color: TEXT_BODY }}>Chain Salons</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row, i) => (
                    <tr key={row.feature} className="border-t" style={{ borderColor: `${ROSE}10` }}>
                      <td className="px-6 py-4" style={{ color: TEXT_DARK }}>{row.feature}</td>
                      <td className="px-6 py-4 text-center">
                        <CheckCircle size={22} weight="fill" style={{ color: ROSE }} className="mx-auto" />
                      </td>
                      <td className="px-6 py-4 text-center" style={{ color: TEXT_BODY }}>{row.them}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════ 12. VIDEO PLACEHOLDER ══════════════ */}
      <section className="relative z-10 py-20 md:py-28 bg-white">
        <div className="max-w-5xl mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={spring}
            className="relative rounded-3xl overflow-hidden h-[320px] md:h-[450px] cursor-pointer group"
          >
            <img
              src="https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=1200&q=80"
              alt="Inside Velvet Hair Studio"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors duration-500 flex items-center justify-center flex-col gap-4">
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="w-20 h-20 rounded-full flex items-center justify-center border-2 border-white/80"
                style={{ background: `${ROSE}cc` }}
              >
                <Play size={32} weight="fill" className="text-white ml-1" />
              </motion.div>
              <p className="text-white font-light text-xl tracking-wide" style={{ fontFamily: "'Georgia', serif" }}>
                Step Inside Velvet
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════ 13. CONTACT / BOOKING ══════════════ */}
      <section id="contact" className="relative z-10 py-20 md:py-28" style={{ background: BG }}>
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <SectionHeading label="Book Now" title="Your" accent="Appointment" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Left — info */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={spring}
            >
              <div className="space-y-6">
                {[
                  { icon: Phone, label: "(206) 555-0518", href: "tel:2065550518" },
                  { icon: EnvelopeSimple, label: "book@velvethairsudio.com", href: "mailto:book@velvethairsudio.com" },
                  { icon: MapPin, label: "1924 Pike Place Market, Suite 3, Seattle, WA 98101", href: "https://maps.google.com/?q=1924+Pike+Place+Market+Suite+3+Seattle+WA+98101" },
                  { icon: Clock, label: "Tue - Sat: 9AM - 7PM  |  Closed Sun & Mon", href: undefined },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl flex-shrink-0 flex items-center justify-center" style={{ background: `${ROSE}10` }}>
                      <item.icon size={20} weight="duotone" style={{ color: ROSE }} />
                    </div>
                    {item.href ? (
                      <a href={item.href} target={item.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="text-sm leading-relaxed hover:opacity-70 transition-opacity" style={{ color: TEXT_DARK }}>
                        {item.label}
                      </a>
                    ) : (
                      <span className="text-sm leading-relaxed" style={{ color: TEXT_DARK }}>{item.label}</span>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-10 p-6 rounded-2xl border" style={{ borderColor: `${ROSE}20`, background: `${ROSE}05` }}>
                <h3 className="font-medium text-sm mb-2" style={{ color: TEXT_DARK }}>Getting Here</h3>
                <p className="text-sm leading-relaxed" style={{ color: TEXT_BODY }}>
                  Located inside Pike Place Market, Suite 3 on the second floor above the flower vendors.
                  Nearest parking at the Pike Place Market Garage on Western Avenue. The Westlake
                  light rail station is a 5-minute walk.
                </p>
              </div>
            </motion.div>

            {/* Right — booking form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={spring}
            >
              <div className="p-8 md:p-10 rounded-3xl bg-white shadow-sm border" style={{ borderColor: `${ROSE}15` }}>
                <h3 className="text-lg font-light mb-6" style={{ fontFamily: "'Georgia', serif", color: TEXT_DARK }}>
                  Request an Appointment
                </h3>
                <div className="space-y-5">
                  {[
                    { label: "Full Name", type: "text", placeholder: "Your name" },
                    { label: "Email", type: "email", placeholder: "you@email.com" },
                    { label: "Phone", type: "tel", placeholder: "(206) 000-0000" },
                  ].map((field) => (
                    <div key={field.label}>
                      <label className="block text-xs font-medium mb-2 uppercase tracking-wide" style={{ color: TEXT_BODY }}>
                        {field.label}
                      </label>
                      <input
                        type={field.type}
                        placeholder={field.placeholder}
                        className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all"
                        style={{
                          background: BG,
                          borderColor: `${ROSE}20`,
                          color: TEXT_DARK,
                        }}
                      />
                    </div>
                  ))}
                  <div>
                    <label className="block text-xs font-medium mb-2 uppercase tracking-wide" style={{ color: TEXT_BODY }}>
                      Service
                    </label>
                    <select
                      className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all appearance-none"
                      style={{ background: BG, borderColor: `${ROSE}20`, color: TEXT_BODY }}
                    >
                      <option value="">Select a service</option>
                      {services.map((s) => (
                        <option key={s.name} value={s.name}>{s.name} — {s.price}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-2 uppercase tracking-wide" style={{ color: TEXT_BODY }}>
                      Preferred Stylist
                    </label>
                    <select
                      className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all appearance-none"
                      style={{ background: BG, borderColor: `${ROSE}20`, color: TEXT_BODY }}
                    >
                      <option value="">No preference</option>
                      {stylists.map((s) => (
                        <option key={s.name} value={s.name}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-2 uppercase tracking-wide" style={{ color: TEXT_BODY }}>
                      Preferred Date
                    </label>
                    <input
                      type="date"
                      className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all"
                      style={{ background: BG, borderColor: `${ROSE}20`, color: TEXT_BODY }}
                    />
                  </div>
                  <SpringButton
                    className="w-full px-8 py-4 text-white font-medium rounded-xl mt-2"
                    style={{ background: ROSE } as React.CSSProperties}
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      Book Your Visit <ArrowRight weight="bold" size={18} />
                    </span>
                  </SpringButton>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════ 14. FOOTER ══════════════ */}
      <footer className="relative z-10 py-14 border-t bg-white" style={{ borderColor: `${ROSE}15` }}>
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-start">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Scissors size={24} weight="duotone" style={{ color: ROSE }} />
                <span className="text-lg font-light tracking-wide" style={{ fontFamily: "'Georgia', serif", color: TEXT_DARK }}>
                  Velvet <span className="font-normal">Hair Studio</span>
                </span>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: TEXT_BODY }}>
                Where art meets hair. A boutique salon experience in the heart of Seattle.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-[0.15em] mb-4" style={{ color: TEXT_DARK }}>Quick Links</h4>
              <div className="space-y-2">
                {["Services", "Stylists", "Gallery", "Reviews", "Contact"].map((link) => (
                  <a key={link} href={`#${link.toLowerCase()}`} className="block text-sm hover:opacity-70 transition-opacity" style={{ color: TEXT_BODY }}>
                    {link}
                  </a>
                ))}
              </div>
            </div>

            {/* Social & Contact */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-[0.15em] mb-4" style={{ color: TEXT_DARK }}>Connect</h4>
              <div className="flex items-center gap-3 mb-4">
                <a href="#" className="w-9 h-9 rounded-full flex items-center justify-center transition-colors" style={{ background: `${ROSE}10`, color: ROSE }}>
                  <InstagramLogo size={18} weight="bold" />
                </a>
                <a href="#" className="w-9 h-9 rounded-full flex items-center justify-center transition-colors" style={{ background: `${ROSE}10`, color: ROSE }}>
                  <FacebookLogo size={18} weight="bold" />
                </a>
                <a href="#" className="w-9 h-9 rounded-full flex items-center justify-center transition-colors" style={{ background: `${ROSE}10`, color: ROSE }}>
                  <TiktokLogo size={18} weight="bold" />
                </a>
              </div>
              <a href="tel:2065550518" className="text-sm block mb-1" style={{ color: TEXT_BODY }}>(206) 555-0518</a>
              <a href="mailto:book@velvethairsudio.com" className="text-sm block" style={{ color: TEXT_BODY }}>book@velvethairsudio.com</a>
            </div>
          </div>

          <div className="border-t mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-3" style={{ borderColor: `${ROSE}10` }}>
            <p className="text-xs" style={{ color: TEXT_BODY }}>
              &copy; {new Date().getFullYear()} Velvet Hair Studio. All rights reserved.
            </p>
            <p className="text-xs flex items-center gap-1.5" style={{ color: TEXT_BODY }}>
              <svg width="14" height="14" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-sky-500"><path d="M24.3 4.2c-1.5-.4-3.2.1-4.5 1.1-1-.7-2.3-1-3.5-.8-2.4.4-4.2 2.5-4.2 4.9v.6c-3.2.8-6 2.8-7.8 5.6-.3.5-.1 1.1.4 1.4.5.3 1.1.1 1.4-.4 1.5-2.3 3.7-4 6.3-4.7.5-.1 1-.1 1.5 0 .8.2 1.4.8 1.7 1.5.3.8.2 1.6-.2 2.3l-2.8 4.3c-.6.9-.4 2.1.4 2.8l2.5 2.1c.4.3.8.5 1.3.5h5.2c.5 0 1-.2 1.3-.5l1.2-1c.6-.5.8-1.3.6-2l-1-3.2c-.2-.5 0-1.1.4-1.4l3.8-2.5c1.3-.9 2.1-2.3 2.1-3.9V9.6c0-2.5-1.7-4.7-4.1-5.3v-.1z" fill="currentColor"/></svg>Created by{" "}
              <a href="https://bluejayportfolio.com" target="_blank" rel="noopener noreferrer" className="underline hover:opacity-70 transition-opacity">
                bluejayportfolio.com
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
