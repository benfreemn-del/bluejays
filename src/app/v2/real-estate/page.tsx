"use client";

import { useRef, useState, useEffect } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  useSpring,
  useMotionValue,
  AnimatePresence,
} from "framer-motion";
import {
  House,
  MapPin,
  Bed,
  Bathtub,
  ArrowsOutSimple,
  Phone,
  Envelope,
  ArrowRight,
  Buildings,
  ChartLineUp,
  CurrencyDollar,
  Star,
  Calendar,
  User,
  X,
  List,
} from "@phosphor-icons/react";
import BluejayLogo from "@/components/BluejayLogo";

/* ─── spring config ─── */
const spring = { type: "spring" as const, stiffness: 100, damping: 20 };
const stagger = { visible: { transition: { staggerChildren: 0.1 } } };

/* ─── colours ─── */
const GOLD = "#b8860b";
const GOLD_LIGHT = "#d4a017";
const BLACK = "#09090b";

/* ─── data ─── */
const properties = [
  {
    title: "The Meridian Penthouse",
    price: "$4,250,000",
    location: "Downtown Seattle",
    beds: 4,
    baths: 3,
    sqft: "3,800",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=500&fit=crop",
    tag: "Featured",
  },
  {
    title: "Lakefront Modern Estate",
    price: "$3,700,000",
    location: "Bellevue, WA",
    beds: 5,
    baths: 4,
    sqft: "4,200",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=500&fit=crop",
    tag: "New",
  },
  {
    title: "Emerald Heights Villa",
    price: "$2,950,000",
    location: "Mercer Island",
    beds: 4,
    baths: 3,
    sqft: "3,400",
    image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=500&fit=crop",
    tag: "Exclusive",
  },
  {
    title: "Summit View Residence",
    price: "$5,100,000",
    location: "Medina, WA",
    beds: 6,
    baths: 5,
    sqft: "5,600",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=500&fit=crop",
    tag: "Luxury",
  },
  {
    title: "Cascade Bay Retreat",
    price: "$3,200,000",
    location: "Kirkland, WA",
    beds: 4,
    baths: 4,
    sqft: "3,900",
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=500&fit=crop",
    tag: "Waterfront",
  },
];

const marketStats = [
  { label: "Avg. Sale Price", value: 1850000, prefix: "$", suffix: "", barPct: 82 },
  { label: "Days on Market", value: 18, prefix: "", suffix: " days", barPct: 35 },
  { label: "Properties Sold", value: 340, prefix: "", suffix: "+", barPct: 68 },
  { label: "Client Satisfaction", value: 98, prefix: "", suffix: "%", barPct: 98 },
];

/* ─── Gold Particles ─── */
function GoldParticles() {
  const [particles] = useState(() =>
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 10,
      duration: 8 + Math.random() * 10,
      size: 1 + Math.random() * 2,
      opacity: 0.1 + Math.random() * 0.2,
    }))
  );

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden hidden md:block">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            width: p.size,
            height: p.size,
            backgroundColor: GOLD,
            opacity: p.opacity,
          }}
          animate={{
            y: [800, -20],
            x: [0, Math.sin(p.id) * 30, 0],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}

/* ─── AnimatedBar ─── */
function AnimatedBar({ pct, delay = 0 }: { pct: number; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  return (
    <div ref={ref} className="h-2 rounded-full bg-white/5 overflow-hidden w-full">
      <motion.div
        className="h-full rounded-full"
        style={{ backgroundColor: GOLD }}
        initial={{ width: 0 }}
        animate={isInView ? { width: `${pct}%` } : {}}
        transition={{ ...spring, delay }}
      />
    </div>
  );
}

/* ─── Counter ─── */
function AnimatedCounter({
  value,
  prefix,
  suffix,
}: {
  value: number;
  prefix: string;
  suffix: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const motionVal = useSpring(0, { stiffness: 30, damping: 20 });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (isInView) motionVal.set(value);
  }, [isInView, value, motionVal]);

  useEffect(() => {
    const unsub = motionVal.on("change", (v) => setDisplay(Math.round(v)));
    return unsub;
  }, [motionVal]);

  return (
    <span ref={ref}>
      {prefix}
      {display.toLocaleString()}
      {suffix}
    </span>
  );
}

/* ─── MAIN PAGE ─── */
export default function V2RealEstatePage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: heroScroll } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroScale = useTransform(heroScroll, [0, 1], [1.15, 1]);
  const heroOpacity = useTransform(heroScroll, [0, 0.7], [1, 0]);
  const showcaseRef = useRef<HTMLDivElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-[100dvh] bg-[#09090b] text-white overflow-x-hidden">
      <GoldParticles />

      {/* ═══ NAV ═══ */}
      <motion.nav
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={spring}
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-[#09090b]/70 border-b border-white/5"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 md:px-6 py-4">
          <div className="flex items-center gap-3">
            <Buildings size={28} weight="bold" color={GOLD} />
            <span className="text-xl font-bold tracking-tight">PINNACLE</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-zinc-400">
            <a href="#properties" className="hover:text-white transition-colors">
              Properties
            </a>
            <a href="#agent" className="hover:text-white transition-colors">
              Our Agent
            </a>
            <a href="#market" className="hover:text-white transition-colors">
              Market
            </a>
            <a href="#contact" className="hover:text-white transition-colors">
              Contact
            </a>
          </div>
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-5 py-2.5 text-sm font-semibold rounded-lg text-black"
              style={{ backgroundColor: GOLD }}
            >
              Book Viewing
            </motion.button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
            >
              {mobileMenuOpen ? <X size={24} /> : <List size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="md:hidden overflow-hidden border-t border-white/5"
            >
              <div className="flex flex-col gap-1 px-4 py-4 bg-[#09090b]/95 backdrop-blur-xl">
                {[
                  { label: "Properties", href: "#properties" },
                  { label: "Our Agent", href: "#agent" },
                  { label: "Market", href: "#market" },
                  { label: "Contact", href: "#contact" },
                ].map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3 rounded-lg text-sm text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* ═══ HERO — cinematic reveal ═══ */}
      <motion.section
        ref={heroRef}
        className="relative min-h-[100dvh] flex items-center overflow-hidden"
      >
        {/* background image with zoom-out */}
        <motion.div
          className="absolute inset-0"
          style={{ scale: heroScale }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2, delay: 0.5 }}
            className="absolute inset-0"
          >
            <img
              src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&h=1080&fit=crop"
              alt="Luxury property"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#09090b] via-[#09090b]/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-transparent to-[#09090b]/40" />
          </motion.div>
        </motion.div>

        {/* Black overlay that fades away (cinematic reveal) */}
        <motion.div
          className="absolute inset-0 bg-[#09090b] z-10"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />

        <motion.div
          style={{ opacity: heroOpacity }}
          className="relative z-20 max-w-7xl mx-auto w-full px-4 md:px-6 pt-24"
        >
          <div className="max-w-2xl">
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ ...spring, delay: 1.2 }}
              className="text-sm font-semibold tracking-[0.3em] uppercase mb-6"
              style={{ color: GOLD }}
            >
              Pinnacle Estates
            </motion.p>

            {/* Mask reveal text */}
            <div className="overflow-hidden mb-6">
              <motion.h1
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                transition={{ duration: 1.2, delay: 1.5, ease: [0.22, 1, 0.36, 1] }}
                className="text-3xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-none"
                style={{ textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}
              >
                <span className="text-white">Your Dream</span>
                <br />
                <span style={{ color: GOLD }}>Home Awaits</span>
              </motion.h1>
            </div>

            <motion.div
              initial={{ width: 0 }}
              animate={{ width: 96 }}
              transition={{ duration: 0.8, delay: 2.2 }}
              className="h-px mb-8"
              style={{ backgroundColor: GOLD }}
            />

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ ...spring, delay: 2.5 }}
              className="text-lg text-zinc-400 leading-relaxed mb-8 max-w-lg"
            >
              Curated luxury properties in the Pacific Northwest. Exceptional homes for
              discerning buyers who settle for nothing less than extraordinary.
            </motion.p>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ ...spring, delay: 2.8 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 font-bold rounded-xl text-black"
                style={{ backgroundColor: GOLD }}
              >
                <span className="flex items-center gap-2">
                  Explore Properties <ArrowRight size={18} weight="bold" />
                </span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 font-bold rounded-xl border border-white/10 text-zinc-300 hover:border-white/20 transition-colors"
              >
                Schedule Consultation
              </motion.button>
            </motion.div>
          </div>
        </motion.div>

        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#09090b] to-transparent z-20" />
      </motion.section>

      {/* ═══ PROPERTY SHOWCASE — horizontal scroll with parallax ═══ */}
      <section id="properties" className="relative z-10 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={spring}
            className="mb-12"
          >
            <p
              className="text-sm font-semibold tracking-[0.3em] uppercase mb-3"
              style={{ color: GOLD }}
            >
              Portfolio
            </p>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-none">
              Featured
              <br />
              <span className="text-zinc-700">Listings</span>
            </h2>
          </motion.div>
        </div>

        <motion.div
          ref={showcaseRef}
          className="flex gap-4 md:gap-6 px-4 md:px-6 cursor-grab active:cursor-grabbing overflow-hidden pb-4"
          drag="x"
          dragConstraints={showcaseRef}
          dragElastic={0.1}
        >
          {properties.map((p, i) => (
            <motion.div
              key={i}
              initial={{ x: 80, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ ...spring, delay: i * 0.05 }}
              whileHover={{ y: -6, transition: spring }}
              className="flex-shrink-0 w-[300px] md:w-[400px] rounded-2xl overflow-hidden backdrop-blur-md bg-white/[0.03] border border-white/[0.06] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] group"
            >
              <div className="relative h-56 overflow-hidden">
                <motion.img
                  src={p.image}
                  alt={p.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute top-4 left-4">
                  <span
                    className="px-3 py-1 text-xs font-bold rounded-full text-black"
                    style={{ backgroundColor: GOLD }}
                  >
                    {p.tag}
                  </span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#09090b]/60 to-transparent" />
              </div>
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-bold leading-tight">{p.title}</h3>
                  <p className="font-bold text-lg" style={{ color: GOLD }}>
                    {p.price}
                  </p>
                </div>
                <p className="text-sm text-zinc-500 flex items-center gap-1 mb-4">
                  <MapPin size={14} /> {p.location}
                </p>
                <div className="flex items-center gap-5 text-xs text-zinc-500 border-t border-white/5 pt-4">
                  <span className="flex items-center gap-1.5">
                    <Bed size={14} /> {p.beds} Beds
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Bathtub size={14} /> {p.baths} Baths
                  </span>
                  <span className="flex items-center gap-1.5">
                    <ArrowsOutSimple size={14} /> {p.sqft} sqft
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ═══ AGENT SECTION — asymmetric layout ═══ */}
      <section id="agent" className="relative z-10 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
            {/* Left — large photo (3 cols) */}
            <motion.div
              initial={{ x: -60, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={spring}
              className="lg:col-span-3 relative"
            >
              <div className="relative rounded-2xl overflow-hidden aspect-[4/3]">
                <img
                  src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&h=600&fit=crop"
                  alt="Lead agent"
                  className="w-full h-full object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#09090b]/40 to-transparent" />
              </div>
              {/* floating badge */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ ...spring, delay: 0.3 }}
                className="absolute -bottom-6 right-8 px-6 py-4 rounded-xl backdrop-blur-xl bg-white/[0.05] border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]"
              >
                <div className="flex items-center gap-3">
                  <Star size={20} weight="fill" color={GOLD} />
                  <div>
                    <p className="font-bold text-sm">Top 1% Agent</p>
                    <p className="text-xs text-zinc-500">Pacific Northwest</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Right — text (2 cols) */}
            <motion.div
              initial={{ x: 60, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ ...spring, delay: 0.2 }}
              className="lg:col-span-2"
            >
              <p
                className="text-sm font-semibold tracking-[0.3em] uppercase mb-3"
                style={{ color: GOLD }}
              >
                Your Agent
              </p>
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-none mb-6">
                Alexander
                <br />
                <span className="text-zinc-600">Whitfield</span>
              </h2>
              <div className="h-px w-16 mb-6" style={{ backgroundColor: GOLD }} />
              <p className="text-zinc-400 leading-relaxed mb-6">
                With over 18 years of experience in luxury real estate, Alexander has
                closed $500M+ in transactions across the Pacific Northwest. His
                white-glove approach ensures every client finds not just a house, but a
                legacy.
              </p>
              <div className="flex flex-col gap-3 mb-8">
                <div className="flex items-center gap-3 text-sm text-zinc-500">
                  <Calendar size={16} color={GOLD} />
                  <span>18+ Years Experience</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-zinc-500">
                  <CurrencyDollar size={16} color={GOLD} />
                  <span>$500M+ in Sales</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-zinc-500">
                  <User size={16} color={GOLD} />
                  <span>200+ Satisfied Clients</span>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 font-bold rounded-xl text-black"
                style={{ backgroundColor: GOLD }}
              >
                <span className="flex items-center gap-2">
                  <Phone size={16} weight="bold" /> Contact Alexander
                </span>
              </motion.button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ MARKET STATS — animated bars ═══ */}
      <section id="market" className="relative z-10 py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-4 md:px-6">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={spring}
            className="mb-16"
          >
            <p
              className="text-sm font-semibold tracking-[0.3em] uppercase mb-3"
              style={{ color: GOLD }}
            >
              Market Insights
            </p>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-none">
              By the
              <br />
              <span className="text-zinc-700">Numbers</span>
            </h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {marketStats.map((s, i) => (
              <motion.div
                key={i}
                variants={{
                  hidden: { y: 30, opacity: 0 },
                  visible: { y: 0, opacity: 1, transition: spring },
                }}
                className="p-6 rounded-2xl backdrop-blur-md bg-white/[0.03] border border-white/[0.06] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]"
              >
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-zinc-500 uppercase tracking-wider">{s.label}</p>
                  <ChartLineUp size={20} color={GOLD} />
                </div>
                <p className="text-3xl md:text-4xl font-black tracking-tighter mb-4" style={{ color: GOLD }}>
                  <AnimatedCounter value={s.value} prefix={s.prefix} suffix={s.suffix} />
                </p>
                <AnimatedBar pct={s.barPct} delay={i * 0.1} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══ CONTACT — map-style background with liquid glass ═══ */}
      <section id="contact" className="relative z-10 py-16 md:py-32">
        {/* map-style background */}
        <div className="absolute inset-0 overflow-hidden opacity-10">
          <svg viewBox="0 0 800 400" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
            {/* grid lines */}
            {Array.from({ length: 20 }, (_, i) => (
              <line
                key={`h${i}`}
                x1="0"
                y1={i * 20}
                x2="800"
                y2={i * 20}
                stroke={GOLD}
                strokeWidth="0.5"
                opacity="0.3"
              />
            ))}
            {Array.from({ length: 40 }, (_, i) => (
              <line
                key={`v${i}`}
                x1={i * 20}
                y1="0"
                x2={i * 20}
                y2="400"
                stroke={GOLD}
                strokeWidth="0.5"
                opacity="0.3"
              />
            ))}
            {/* "roads" */}
            <path d="M100 200 Q300 150 500 200 T800 180" fill="none" stroke={GOLD} strokeWidth="1.5" opacity="0.4" />
            <path d="M0 100 Q200 250 400 100 T800 150" fill="none" stroke={GOLD} strokeWidth="1" opacity="0.3" />
            <path d="M200 0 L200 400" stroke={GOLD} strokeWidth="1" opacity="0.2" />
            <path d="M500 0 L500 400" stroke={GOLD} strokeWidth="1" opacity="0.2" />
            {/* location pins */}
            <circle cx="300" cy="180" r="4" fill={GOLD} opacity="0.6" />
            <circle cx="500" cy="200" r="4" fill={GOLD} opacity="0.6" />
            <circle cx="200" cy="150" r="4" fill={GOLD} opacity="0.6" />
          </svg>
        </div>

        <div className="relative max-w-3xl mx-auto px-4 md:px-6">
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={spring}
            className="p-6 md:p-14 rounded-3xl backdrop-blur-xl bg-white/[0.04] border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]"
          >
            <p
              className="text-sm font-semibold tracking-[0.3em] uppercase mb-4"
              style={{ color: GOLD }}
            >
              Get in Touch
            </p>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-none mb-4">
              Begin Your
              <br />
              <span style={{ color: GOLD }}>Journey</span>
            </h2>
            <div className="h-px w-16 mb-6" style={{ backgroundColor: GOLD }} />
            <p className="text-zinc-500 leading-relaxed mb-8 max-w-md">
              Whether buying or selling, our team is ready to deliver an unparalleled
              real estate experience tailored to your vision.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/5">
                <Phone size={20} color={GOLD} />
                <div>
                  <p className="text-xs text-zinc-600">Call Us</p>
                  <p className="text-sm font-medium">(206) 555-0199</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/5">
                <Envelope size={20} color={GOLD} />
                <div>
                  <p className="text-xs text-zinc-600">Email</p>
                  <p className="text-sm font-medium">hello@pinnacle.com</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/5">
                <MapPin size={20} color={GOLD} />
                <div>
                  <p className="text-xs text-zinc-600">Office</p>
                  <p className="text-sm font-medium">1200 5th Ave, Seattle</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/5">
                <House size={20} color={GOLD} />
                <div>
                  <p className="text-xs text-zinc-600">Active Listings</p>
                  <p className="text-sm font-medium">45+ Properties</p>
                </div>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 font-bold rounded-xl text-black"
              style={{ backgroundColor: GOLD }}
            >
              <span className="flex items-center gap-2">
                Schedule Private Viewing <ArrowRight size={18} weight="bold" />
              </span>
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="relative z-10 border-t border-white/5 py-10">
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Buildings size={20} weight="bold" color={GOLD} />
            <span className="font-bold tracking-tight">PINNACLE ESTATES</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-600">
            <span>Website created by</span>
            <BluejayLogo size={16} className="text-blue-400" />
            <span className="text-blue-400 font-medium">Bluejay Business Solutions</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
