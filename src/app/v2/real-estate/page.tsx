"use client";

/* eslint-disable @next/next/no-img-element -- Static marketing showcase page uses plain img tags intentionally */
/* eslint-disable react-hooks/purity -- Decorative particle values randomized for static visual effects */

import { useRef, useState, useEffect, useMemo, useCallback } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  useSpring,
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
  MagnifyingGlass,
  CaretDown,
  Trophy,
  Shield,
  Handshake,
  Lightning,
  CheckCircle,
  Quotes,
  PlayCircle,
  Timer,
  Globe,
  Heart,
  SlidersHorizontal,
  FacebookLogo,
  InstagramLogo,
  LinkedinLogo,
  YoutubeLogo,
  Mountains,
  TreeEvergreen,
  Sparkle,
  Clock,
} from "@phosphor-icons/react";

/* ─── spring / stagger ─── */
const spring = { type: "spring" as const, stiffness: 100, damping: 20 };
const gentleSpring = { type: "spring" as const, stiffness: 60, damping: 18 };
const stagger = { visible: { transition: { staggerChildren: 0.12 } } };
const cardReveal = {
  hidden: { y: 40, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: gentleSpring },
};

/* ─── colours ─── */
const GOLD = "#b8860b";
const GOLD_LIGHT = "#d4a017";
const BLACK = "#09090b";

/* ─── property data ─── */
const properties = [
  {
    title: "Capitol Hill Craftsman",
    price: "$875,000",
    address: "1432 E Pine St, Seattle, WA 98122",
    beds: 3,
    baths: 2,
    sqft: "2,100",
    image: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&h=500&fit=crop",
    tag: "New Listing",
  },
  {
    title: "Bellevue Modern Estate",
    price: "$3,200,000",
    address: "8901 SE 42nd Pl, Bellevue, WA 98006",
    beds: 5,
    baths: 4,
    sqft: "4,800",
    image: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=800&h=500&fit=crop",
    tag: "Open House",
  },
  {
    title: "Green Lake Bungalow",
    price: "$485,000",
    address: "7215 Woodlawn Ave NE, Seattle, WA 98115",
    beds: 2,
    baths: 1,
    sqft: "1,250",
    image: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=500&fit=crop",
    tag: "Price Reduced",
  },
  {
    title: "Mercer Island Waterfront",
    price: "$2,750,000",
    address: "3210 72nd Ave SE, Mercer Island, WA 98040",
    beds: 4,
    baths: 3,
    sqft: "3,600",
    image: "https://images.unsplash.com/photo-1564013434775-f71db0030976?w=800&h=500&fit=crop",
    tag: "Under Contract",
  },
  {
    title: "Kirkland Tudor Revival",
    price: "$1,150,000",
    address: "542 3rd Ave S, Kirkland, WA 98033",
    beds: 4,
    baths: 3,
    sqft: "2,900",
    image: "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=800&h=500&fit=crop",
    tag: "New Listing",
  },
  {
    title: "Fremont Modern Single-Family Home",
    price: "$725,000",
    address: "3818 Fremont Ave N, Seattle, WA 98103",
    beds: 3,
    baths: 2,
    sqft: "1,800",
    image: "https://images.unsplash.com/photo-1591474204534-44c50b1cb88e?w=800&h=500&fit=crop",
    tag: "Open House",
  },
];

/* ─── neighborhoods ─── */
const neighborhoods = [
  {
    name: "Capitol Hill",
    vibe: "Urban & Vibrant",
    avgPrice: "$620K",
    detail: "Walk Score 94",
    image: "https://images.unsplash.com/photo-1527030280862-64139fba04ca?w=600&h=400&fit=crop",
  },
  {
    name: "Bellevue",
    vibe: "Tech Hub Living",
    avgPrice: "$1.1M",
    detail: "Top-Rated Schools",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&h=400&fit=crop",
  },
  {
    name: "Mercer Island",
    vibe: "Island Paradise",
    avgPrice: "$2.4M",
    detail: "Waterfront Living",
    image: "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=600&h=400&fit=crop",
  },
  {
    name: "Kirkland",
    vibe: "Lakeside Charm",
    avgPrice: "$890K",
    detail: "Growing Market",
    image: "https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5?w=600&h=400&fit=crop",
  },
];

/* ─── why us data ─── */
const whyUs = [
  { icon: Mountains, title: "Local Market Mastery", desc: "15 years navigating Seattle's micro-markets. From Ballard to Bellevue, we know every block." },
  { icon: Trophy, title: "Negotiation Power", desc: "Our sellers average 4.2% above asking price. Our buyers close 12 days faster than market average." },
  { icon: Handshake, title: "White-Glove Service", desc: "From first showing to closing day, one dedicated team handles every detail of your transaction." },
  { icon: Lightning, title: "Technology Forward", desc: "3D virtual tours, drone photography, AI-powered pricing analysis, and targeted digital marketing." },
];

/* ─── testimonials ─── */
const testimonials = [
  { text: "Sarah found us our dream home in Capitol Hill in just 2 weeks. She knew exactly which listings to show us before they even hit the market. We couldn't be happier.", author: "Michael & Amy T.", date: "March 2026", stars: 5 },
  { text: "After 3 failed offers with another agent, Sarah got us under contract on the first try. Her strategy and market knowledge are unmatched in King County.", author: "David L.", date: "January 2026", stars: 5 },
  { text: "She negotiated $47,000 off the asking price on our Kirkland home. That alone paid for years of mortgage payments. Sarah is worth every penny.", author: "Jennifer K.", date: "November 2025", stars: 5 },
  { text: "The entire process was seamless. Sarah's team handled the inspections, negotiations, and closing paperwork while we focused on packing. True professionals.", author: "Robert & Maria S.", date: "February 2026", stars: 5 },
  { text: "Best real estate experience we've ever had. Period. This was our fourth home purchase and nobody has come close to Sarah's level of service.", author: "Tanya W.", date: "December 2025", stars: 5 },
];

/* ─── service areas ─── */
const serviceAreas = [
  "Seattle", "Bellevue", "Kirkland", "Redmond",
  "Mercer Island", "Issaquah", "Sammamish", "Woodinville",
];

/* ─── market stats ─── */
const marketStats = [
  { label: "Median Home Price", value: 785000, prefix: "$", suffix: "", barPct: 78 },
  { label: "Avg Days on Market", value: 14, prefix: "", suffix: " days", barPct: 28 },
  { label: "Homes Sold This Year", value: 47, prefix: "", suffix: "+", barPct: 65 },
  { label: "Client Satisfaction", value: 98, prefix: "", suffix: "%", barPct: 98 },
];

/* ═══════════════════════════════════════════════════════════════
   COMPONENTS
   ═══════════════════════════════════════════════════════════════ */

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

/* ─── Animated Bar ─── */
function AnimatedBar({ pct, delay = 0 }: { pct: number; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  return (
    <div ref={ref} className="h-2 rounded-full bg-white/5 overflow-hidden w-full">
      <motion.div
        className="h-full rounded-full"
        style={{ background: `linear-gradient(90deg, ${GOLD}, ${GOLD_LIGHT})` }}
        initial={{ width: 0 }}
        animate={isInView ? { width: `${pct}%` } : {}}
        transition={{ ...spring, delay }}
      />
    </div>
  );
}

/* ─── Animated Counter ─── */
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

/* ─── Section Header ─── */
function SectionLabel({ label }: { label: string }) {
  return (
    <p
      className="text-sm font-semibold tracking-[0.3em] uppercase mb-3"
      style={{ color: GOLD }}
    >
      {label}
    </p>
  );
}

/* ─── Mortgage Calculator ─── */
function MortgageCalculator() {
  const [homePrice, setHomePrice] = useState(600000);
  const [downPct, setDownPct] = useState(20);
  const [rate, setRate] = useState(6.5);

  const monthly = useMemo(() => {
    const principal = homePrice * (1 - downPct / 100);
    const monthlyRate = rate / 100 / 12;
    const n = 30 * 12;
    if (monthlyRate === 0) return Math.round(principal / n);
    const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1);
    return Math.round(payment);
  }, [homePrice, downPct, rate]);

  return (
    <div className="space-y-8">
      {/* Home Price */}
      <div>
        <div className="flex justify-between mb-2">
          <span className="text-sm text-zinc-400">Home Price</span>
          <span className="text-sm font-bold" style={{ color: GOLD }}>${homePrice.toLocaleString()}</span>
        </div>
        <input
          type="range"
          min={200000}
          max={2000000}
          step={10000}
          value={homePrice}
          onChange={(e) => setHomePrice(Number(e.target.value))}
          className="w-full accent-[#b8860b] h-2 rounded-full appearance-none bg-white/10 cursor-pointer"
        />
        <div className="flex justify-between text-xs text-zinc-600 mt-1">
          <span>$200K</span>
          <span>$2M</span>
        </div>
      </div>
      {/* Down Payment */}
      <div>
        <div className="flex justify-between mb-2">
          <span className="text-sm text-zinc-400">Down Payment</span>
          <span className="text-sm font-bold" style={{ color: GOLD }}>{downPct}% (${(homePrice * downPct / 100).toLocaleString()})</span>
        </div>
        <input
          type="range"
          min={5}
          max={30}
          step={1}
          value={downPct}
          onChange={(e) => setDownPct(Number(e.target.value))}
          className="w-full accent-[#b8860b] h-2 rounded-full appearance-none bg-white/10 cursor-pointer"
        />
        <div className="flex justify-between text-xs text-zinc-600 mt-1">
          <span>5%</span>
          <span>30%</span>
        </div>
      </div>
      {/* Interest Rate */}
      <div>
        <div className="flex justify-between mb-2">
          <span className="text-sm text-zinc-400">Interest Rate</span>
          <span className="text-sm font-bold" style={{ color: GOLD }}>{rate.toFixed(1)}%</span>
        </div>
        <input
          type="range"
          min={5.5}
          max={8}
          step={0.1}
          value={rate}
          onChange={(e) => setRate(Number(e.target.value))}
          className="w-full accent-[#b8860b] h-2 rounded-full appearance-none bg-white/10 cursor-pointer"
        />
        <div className="flex justify-between text-xs text-zinc-600 mt-1">
          <span>5.5%</span>
          <span>8.0%</span>
        </div>
      </div>
      {/* Result */}
      <div className="pt-6 border-t border-white/15 text-center">
        <p className="text-sm text-zinc-500 mb-2">Estimated Monthly Payment</p>
        <p className="text-5xl font-black tracking-tighter" style={{ color: GOLD }}>
          ${monthly.toLocaleString()}
        </p>
        <p className="text-xs text-zinc-600 mt-2">30-year fixed rate. Taxes and insurance not included.</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════ */
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
  const [searchFocus, setSearchFocus] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  /* auto-rotate testimonials */
  useEffect(() => {
    const t = setInterval(() => setActiveTestimonial((p) => (p + 1) % testimonials.length), 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-[100dvh] bg-[#09090b] text-white overflow-x-hidden">
      <GoldParticles />

      {/* ═══════ NAV ═══════ */}
      <motion.nav
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={spring}
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-[#09090b]/70 border-b border-white/8"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 md:px-6 py-4">
          <div className="flex items-center gap-3">
            <House size={28} weight="bold" color={GOLD} />
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight leading-none">PUGET SOUND</span>
              <span className="text-[10px] tracking-[0.35em] uppercase text-zinc-500 leading-none">Realty</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-zinc-400">
            {["Properties", "Neighborhoods", "About", "Calculator", "Contact"].map((l) => (
              <a
                key={l}
                href={`#${l.toLowerCase()}`}
                className="hover:text-white transition-colors duration-300"
              >
                {l}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <motion.a
              href="#contact"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="hidden sm:inline-flex px-5 py-2.5 text-sm font-semibold rounded-lg text-black"
              style={{ backgroundColor: GOLD }}
            >
              Free Consultation
            </motion.a>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
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
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="md:hidden overflow-hidden border-t border-white/8"
            >
              <div className="flex flex-col gap-1 px-4 py-4 bg-[#09090b]/95 backdrop-blur-xl">
                {["Properties", "Neighborhoods", "About", "Calculator", "Contact"].map((l) => (
                  <a
                    key={l}
                    href={`#${l.toLowerCase()}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3 rounded-lg text-sm text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    {l}
                  </a>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* ═══════ HERO — centered with search bar ═══════ */}
      <motion.section
        ref={heroRef}
        className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden"
      >
        {/* background image with parallax zoom */}
        <motion.div className="absolute inset-0" style={{ scale: heroScale }}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2, delay: 0.5 }}
            className="absolute inset-0"
          >
            <img
              src="https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?w=1920&h=1080&fit=crop"
              alt="Luxury Seattle home interior"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-[#09090b]/70" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-transparent to-[#09090b]/60" />
          </motion.div>
        </motion.div>

        {/* Cinematic black reveal */}
        <motion.div
          className="absolute inset-0 bg-[#09090b] z-10"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />

        <motion.div
          style={{ opacity: heroOpacity }}
          className="relative z-20 w-full max-w-4xl mx-auto px-4 md:px-6 pt-20 text-center"
        >
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ ...spring, delay: 1.2 }}
            className="text-sm font-semibold tracking-[0.4em] uppercase mb-8"
            style={{ color: GOLD }}
          >
            Puget Sound Realty
          </motion.p>

          <div className="overflow-hidden mb-6">
            <motion.h1
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              transition={{ duration: 1, delay: 1.5, ease: [0.22, 1, 0.36, 1] }}
              className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.9]"
            >
              Where Seattle
              <br />
              <span style={{ color: GOLD }}>Finds Home</span>
            </motion.h1>
          </div>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ ...spring, delay: 2.2 }}
            className="text-lg text-zinc-400 leading-relaxed mb-10 max-w-xl mx-auto"
          >
            Top 1% agent in King County with 15 years of experience and $420M+ in closed transactions.
            Your next chapter starts here.
          </motion.p>

          {/* Search Bar */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ ...spring, delay: 2.6 }}
            className={`p-2 rounded-2xl backdrop-blur-xl border transition-all duration-500 ${
              searchFocus
                ? "bg-white/[0.08] border-[#b8860b]/40 shadow-[0_0_40px_rgba(184,134,11,0.15)]"
                : "bg-white/[0.07] border-white/[0.13]"
            }`}
          >
            <div className="flex flex-col sm:flex-row gap-2">
              <div
                className="flex-1 relative"
                onFocus={() => setSearchFocus(true)}
                onBlur={() => setSearchFocus(false)}
              >
                <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                <select className="w-full bg-white/[0.08] border border-white/[0.10] rounded-xl pl-10 pr-4 py-3.5 text-sm text-zinc-300 appearance-none cursor-pointer focus:outline-none focus:border-[#b8860b]/30">
                  <option>All Neighborhoods</option>
                  <option>Capitol Hill</option>
                  <option>Bellevue</option>
                  <option>Mercer Island</option>
                  <option>Kirkland</option>
                  <option>Fremont</option>
                  <option>Green Lake</option>
                </select>
                <CaretDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
              </div>
              <div className="flex-1 relative">
                <CurrencyDollar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                <select className="w-full bg-white/[0.08] border border-white/[0.10] rounded-xl pl-10 pr-4 py-3.5 text-sm text-zinc-300 appearance-none cursor-pointer focus:outline-none focus:border-[#b8860b]/30">
                  <option>Any Price</option>
                  <option>Under $500K</option>
                  <option>$500K - $1M</option>
                  <option>$1M - $2M</option>
                  <option>$2M - $3M</option>
                  <option>$3M+</option>
                </select>
                <CaretDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
              </div>
              <div className="flex-1 relative">
                <Bed size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                <select className="w-full bg-white/[0.08] border border-white/[0.10] rounded-xl pl-10 pr-4 py-3.5 text-sm text-zinc-300 appearance-none cursor-pointer focus:outline-none focus:border-[#b8860b]/30">
                  <option>Bedrooms</option>
                  <option>1+</option>
                  <option>2+</option>
                  <option>3+</option>
                  <option>4+</option>
                  <option>5+</option>
                </select>
                <CaretDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
              </div>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-8 py-3.5 font-bold rounded-xl text-black flex items-center justify-center gap-2"
                style={{ backgroundColor: GOLD }}
              >
                <MagnifyingGlass size={18} weight="bold" />
                <span className="sm:inline">Search</span>
              </motion.button>
            </div>
          </motion.div>
        </motion.div>

        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#09090b] to-transparent z-20" />
      </motion.section>

      {/* ═══════ TRUST BAR ═══════ */}
      <section className="relative z-10 py-6 border-y border-white/8">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-7xl mx-auto px-4 md:px-6"
        >
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-zinc-400">
            {[
              "Licensed Since 2008",
              "Top 1% Agent",
              "$420M+ Sold",
              "340+ Homes Closed",
              "5.0 Google Rating",
            ].map((item, i) => (
              <span key={i} className="flex items-center gap-3">
                {i > 0 && <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-[#b8860b]" />}
                <span className="whitespace-nowrap">{item}</span>
              </span>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ═══════ FEATURED PROPERTIES — draggable gallery ═══════ */}
      <section id="properties" className="relative z-10 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={spring}
            className="mb-12"
          >
            <SectionLabel label="Portfolio" />
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
              transition={{ ...spring, delay: i * 0.06 }}
              whileHover={{ y: -8, transition: spring }}
              className="flex-shrink-0 w-[300px] md:w-[400px] rounded-2xl overflow-hidden backdrop-blur-md bg-white/[0.08] border border-white/[0.10] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] group"
            >
              <div className="relative h-56 overflow-hidden">
                <img
                  src={p.image}
                  alt={p.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute top-4 left-4">
                  <span
                    className="px-3 py-1 text-xs font-bold rounded-full text-black"
                    style={{ backgroundColor: p.tag === "Under Contract" ? "#ef4444" : p.tag === "Price Reduced" ? "#f59e0b" : GOLD }}
                  >
                    {p.tag}
                  </span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#09090b]/70 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="font-bold text-xl" style={{ color: GOLD }}>
                    {p.price}
                  </p>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold leading-tight mb-2">{p.title}</h3>
                <p className="text-sm text-zinc-500 flex items-center gap-1.5 mb-4">
                  <MapPin size={14} /> {p.address}
                </p>
                <div className="flex items-center gap-5 text-xs text-zinc-500 border-t border-white/8 pt-4">
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

      {/* ═══════ NEIGHBORHOOD SPOTLIGHT ═══════ */}
      <section id="neighborhoods" className="relative z-10 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={spring}
            className="mb-14"
          >
            <SectionLabel label="Explore" />
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-none">
              Neighborhood
              <br />
              <span className="text-zinc-700">Spotlight</span>
            </h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {neighborhoods.map((n, i) => (
              <motion.div
                key={i}
                variants={cardReveal}
                whileHover={{ y: -6, transition: spring }}
                className="rounded-2xl overflow-hidden backdrop-blur-md bg-white/[0.08] border border-white/[0.10] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] group cursor-pointer"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={n.image}
                    alt={n.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/40 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <p className="text-xs font-semibold tracking-wider uppercase" style={{ color: GOLD }}>{n.vibe}</p>
                    <h3 className="text-xl font-black tracking-tight">{n.name}</h3>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-xs text-zinc-600">Avg. Price</p>
                      <p className="text-lg font-bold" style={{ color: GOLD }}>{n.avgPrice}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-zinc-600">Highlight</p>
                      <p className="text-sm font-medium text-zinc-300">{n.detail}</p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full py-2.5 text-sm font-semibold rounded-xl border border-white/15 text-zinc-300 hover:border-[#b8860b]/30 hover:text-white transition-all"
                  >
                    View Homes
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════ WHY PUGET SOUND REALTY ═══════ */}
      <section className="relative z-10 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={spring}
            className="text-center mb-14"
          >
            <SectionLabel label="Why Us" />
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-none">
              The Puget Sound
              <br />
              <span style={{ color: GOLD }}>Advantage</span>
            </h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {whyUs.map((item, i) => (
              <motion.div
                key={i}
                variants={cardReveal}
                whileHover={{ y: -6, transition: spring }}
                className="p-8 rounded-2xl backdrop-blur-md bg-white/[0.08] border border-white/[0.10] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] text-center group"
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5 transition-colors duration-300"
                  style={{ backgroundColor: `${GOLD}15` }}
                >
                  <item.icon size={28} weight="duotone" color={GOLD} />
                </div>
                <h3 className="text-lg font-bold mb-3">{item.title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════ AGENT SPOTLIGHT ═══════ */}
      <section id="about" className="relative z-10 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
            {/* Photo */}
            <motion.div
              initial={{ x: -60, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={spring}
              className="lg:col-span-2 relative"
            >
              <div className="relative rounded-2xl overflow-hidden aspect-[3/4]">
                <img
                  src="https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=600&h=800&fit=crop"
                  alt="Sarah Mitchell, Lead Agent"
                  className="w-full h-full object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#09090b]/60 to-transparent" />
              </div>
              {/* floating badge */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ ...spring, delay: 0.3 }}
                className="absolute -bottom-4 -right-2 md:right-4 px-5 py-3 rounded-xl backdrop-blur-xl bg-white/[0.06] border border-white/[0.13] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]"
              >
                <div className="flex items-center gap-3">
                  <Star size={20} weight="fill" color={GOLD} />
                  <div>
                    <p className="font-bold text-sm">Top 1% in King County</p>
                    <p className="text-xs text-zinc-500">15 Consecutive Years</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Text */}
            <motion.div
              initial={{ x: 60, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ ...spring, delay: 0.2 }}
              className="lg:col-span-3"
            >
              <SectionLabel label="Your Agent" />
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-none mb-2">
                Sarah
                <br />
                <span className="text-zinc-600">Mitchell</span>
              </h2>
              <p className="text-sm text-zinc-500 mb-6">Lead Broker | Puget Sound Realty</p>
              <div className="h-px w-16 mb-6" style={{ backgroundColor: GOLD }} />
              <p className="text-zinc-400 leading-relaxed mb-4">
                Born and raised in Seattle, Sarah knows every neighborhood from the waterfront
                condos of Belltown to the sprawling estates of Medina. With a background in
                architecture and 15 years of real estate expertise, she brings a rare combination
                of design eye and market intelligence to every transaction.
              </p>
              <p className="text-zinc-400 leading-relaxed mb-8">
                Her clients consistently close faster and at better prices because Sarah treats
                every deal like her own. Whether you are a first-time buyer navigating a
                competitive market or selling a multi-million dollar waterfront property, she
                delivers the same relentless dedication.
              </p>

              {/* Stats row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                {[
                  { val: "15", label: "Years Experience" },
                  { val: "340+", label: "Homes Sold" },
                  { val: "$420M+", label: "Sales Volume" },
                  { val: "98%", label: "Satisfaction" },
                ].map((s, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl bg-white/[0.08] border border-white/8 text-center"
                  >
                    <p className="text-2xl font-black" style={{ color: GOLD }}>{s.val}</p>
                    <p className="text-xs text-zinc-500 mt-1">{s.label}</p>
                  </div>
                ))}
              </div>

              <motion.a
                href="tel:2065550147"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex px-6 py-3 font-bold rounded-xl text-black"
                style={{ backgroundColor: GOLD }}
              >
                <span className="flex items-center gap-2">
                  <Phone size={16} weight="bold" /> Call Sarah Directly
                </span>
              </motion.a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════ MARKET STATS DASHBOARD ═══════ */}
      <section id="market" className="relative z-10 py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-4 md:px-6">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={spring}
            className="mb-16"
          >
            <SectionLabel label="Market Insights" />
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-none">
              By the
              <br />
              <span className="text-zinc-700">Numbers</span>
            </h2>
            <p className="text-zinc-500 mt-4 max-w-lg">
              Real-time metrics from the greater Seattle market, updated quarterly by our research team.
            </p>
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
                variants={cardReveal}
                className="p-6 rounded-2xl backdrop-blur-md bg-white/[0.08] border border-white/[0.10] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]"
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

      {/* ═══════ MORTGAGE CALCULATOR ═══════ */}
      <section id="calculator" className="relative z-10 py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-4 md:px-6">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={spring}
            className="text-center mb-12"
          >
            <SectionLabel label="Plan Ahead" />
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-none mb-4">
              Mortgage
              <br />
              <span style={{ color: GOLD }}>Calculator</span>
            </h2>
            <p className="text-zinc-500 max-w-md mx-auto">
              Get an estimate of your monthly payment before you start your home search.
            </p>
          </motion.div>

          <motion.div
            initial={{ y: 40, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={spring}
            className="p-8 md:p-12 rounded-3xl backdrop-blur-xl bg-white/[0.07] border border-white/[0.13] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]"
          >
            <MortgageCalculator />
          </motion.div>
        </div>
      </section>

      {/* ═══════ TESTIMONIALS ═══════ */}
      <section className="relative z-10 py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-4 md:px-6">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={spring}
            className="text-center mb-14"
          >
            <SectionLabel label="Client Stories" />
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-none mb-4">
              What Our
              <br />
              <span className="text-zinc-700">Clients Say</span>
            </h2>
            <div className="flex items-center justify-center gap-2 mt-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={20} weight="fill" color={GOLD} />
              ))}
              <span className="text-sm text-zinc-400 ml-2">5.0 from 340+ reviews</span>
            </div>
          </motion.div>

          {/* Testimonial carousel */}
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTestimonial}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="p-8 md:p-12 rounded-3xl backdrop-blur-xl bg-white/[0.07] border border-white/[0.13] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] text-center"
              >
                <Quotes size={40} weight="fill" color={GOLD} className="mx-auto mb-6 opacity-40" />
                <p className="text-lg md:text-xl text-zinc-300 leading-relaxed mb-8 max-w-2xl mx-auto">
                  &ldquo;{testimonials[activeTestimonial].text}&rdquo;
                </p>
                <div className="flex items-center justify-center gap-2 mb-3">
                  {Array.from({ length: testimonials[activeTestimonial].stars }).map((_, i) => (
                    <Star key={i} size={16} weight="fill" color={GOLD} />
                  ))}
                </div>
                <p className="font-bold text-white">{testimonials[activeTestimonial].author}</p>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <CheckCircle size={14} weight="fill" color={GOLD} />
                  <span className="text-xs text-zinc-500">Verified Client | {testimonials[activeTestimonial].date}</span>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Dots */}
            <div className="flex items-center justify-center gap-2 mt-6">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTestimonial(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    i === activeTestimonial ? "w-8" : "bg-white/20"
                  }`}
                  style={i === activeTestimonial ? { backgroundColor: GOLD } : undefined}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ VIDEO TOUR PLACEHOLDER ═══════ */}
      <section className="relative z-10 py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-4 md:px-6">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={spring}
            className="relative rounded-3xl overflow-hidden aspect-video group cursor-pointer"
          >
            <img
              src="https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1400&h=800&fit=crop"
              alt="Luxury home interior for video tour"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-[#09090b]/50 group-hover:bg-[#09090b]/40 transition-colors duration-300" />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center mb-4 border-2"
                style={{ backgroundColor: `${GOLD}20`, borderColor: `${GOLD}50` }}
              >
                <PlayCircle size={48} weight="fill" color={GOLD} />
              </motion.div>
              <p className="text-xl md:text-2xl font-bold">See Our Listings Come to Life</p>
              <p className="text-sm text-zinc-400 mt-2">3D tours, drone footage, and neighborhood walkthroughs</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════ SERVICE AREAS ═══════ */}
      <section className="relative z-10 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={spring}
            className="text-center mb-14"
          >
            <SectionLabel label="Coverage" />
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-none">
              Areas We
              <br />
              <span style={{ color: GOLD }}>Serve</span>
            </h2>
          </motion.div>

          {/* Stylized map background */}
          <div className="relative">
            <div className="absolute inset-0 overflow-hidden opacity-10 rounded-3xl">
              <svg viewBox="0 0 800 400" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
                {Array.from({ length: 20 }, (_, i) => (
                  <line key={`h${i}`} x1="0" y1={i * 20} x2="800" y2={i * 20} stroke={GOLD} strokeWidth="0.5" opacity="0.3" />
                ))}
                {Array.from({ length: 40 }, (_, i) => (
                  <line key={`v${i}`} x1={i * 20} y1="0" x2={i * 20} y2="400" stroke={GOLD} strokeWidth="0.5" opacity="0.3" />
                ))}
                <path d="M100 200 Q300 100 500 200 T800 180" fill="none" stroke={GOLD} strokeWidth="1.5" opacity="0.4" />
                <path d="M0 100 Q200 250 400 100 T800 150" fill="none" stroke={GOLD} strokeWidth="1" opacity="0.3" />
              </svg>
            </div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              variants={stagger}
              className="relative grid grid-cols-2 sm:grid-cols-4 gap-4"
            >
              {serviceAreas.map((area, i) => (
                <motion.div
                  key={i}
                  variants={cardReveal}
                  whileHover={{ y: -4, transition: spring }}
                  className="p-6 rounded-2xl backdrop-blur-md bg-white/[0.08] border border-white/[0.10] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] text-center group cursor-pointer hover:border-[#b8860b]/20 transition-colors"
                >
                  <MapPin size={24} color={GOLD} className="mx-auto mb-3" />
                  <p className="font-bold text-base">{area}</p>
                  <p className="text-xs text-zinc-600 mt-1">Active Listings</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════ CONTACT SECTION ═══════ */}
      <section id="contact" className="relative z-10 py-16 md:py-32">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={spring}
            className="text-center mb-14"
          >
            <SectionLabel label="Get Started" />
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-none mb-4">
              Schedule a Free
              <br />
              <span style={{ color: GOLD }}>Consultation</span>
            </h2>
            <p className="text-zinc-500 max-w-lg mx-auto">
              Whether buying, selling, or just exploring, Sarah and her team are ready to help
              you navigate the Seattle market.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Form */}
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={spring}
              className="lg:col-span-3 p-8 md:p-10 rounded-3xl backdrop-blur-xl bg-white/[0.07] border border-white/[0.13] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]"
            >
              <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-zinc-500 uppercase tracking-wider mb-1.5 block">Name</label>
                    <input
                      type="text"
                      placeholder="Your full name"
                      className="w-full bg-white/[0.08] border border-white/[0.13] rounded-xl px-4 py-3 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-[#b8860b]/40 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 uppercase tracking-wider mb-1.5 block">Email</label>
                    <input
                      type="email"
                      placeholder="you@email.com"
                      className="w-full bg-white/[0.08] border border-white/[0.13] rounded-xl px-4 py-3 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-[#b8860b]/40 transition-colors"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-zinc-500 uppercase tracking-wider mb-1.5 block">Phone</label>
                    <input
                      type="tel"
                      placeholder="(206) 555-0000"
                      className="w-full bg-white/[0.08] border border-white/[0.13] rounded-xl px-4 py-3 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-[#b8860b]/40 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 uppercase tracking-wider mb-1.5 block">I&apos;m looking to...</label>
                    <div className="relative">
                      <select className="w-full bg-white/[0.08] border border-white/[0.13] rounded-xl px-4 py-3 text-sm text-zinc-300 appearance-none cursor-pointer focus:outline-none focus:border-[#b8860b]/40 transition-colors">
                        <option>Buy a Home</option>
                        <option>Sell My Home</option>
                        <option>Both</option>
                      </select>
                      <CaretDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-zinc-500 uppercase tracking-wider mb-1.5 block">Message</label>
                  <textarea
                    rows={4}
                    placeholder="Tell us about your ideal home, timeline, or any questions..."
                    className="w-full bg-white/[0.08] border border-white/[0.13] rounded-xl px-4 py-3 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-[#b8860b]/40 transition-colors resize-none"
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4 font-bold rounded-xl text-black text-lg"
                  style={{ backgroundColor: GOLD }}
                >
                  <span className="flex items-center justify-center gap-2">
                    Schedule Free Consultation <ArrowRight size={20} weight="bold" />
                  </span>
                </motion.button>
              </form>
            </motion.div>

            {/* Office Info */}
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ ...spring, delay: 0.15 }}
              className="lg:col-span-2 flex flex-col gap-4"
            >
              {[
                { icon: Phone, label: "Call Us", value: "(206) 555-0147", href: "tel:2065550147" },
                { icon: Envelope, label: "Email", value: "hello@pugetsoundrealty.com", href: "mailto:hello@pugetsoundrealty.com" },
                { icon: MapPin, label: "Office", value: "1847 Westlake Ave N, Suite 200, Seattle, WA 98109", href: "https://maps.google.com/?q=1847+Westlake+Ave+N+Suite+200+Seattle+WA+98109" },
                { icon: Clock, label: "Hours", value: "Mon-Fri 9am-6pm, Sat 10am-4pm", href: undefined },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 p-5 rounded-xl bg-white/[0.08] border border-white/8"
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${GOLD}15` }}
                  >
                    <item.icon size={20} color={GOLD} />
                  </div>
                  <div>
                    <p className="text-xs text-zinc-600">{item.label}</p>
                    {item.href ? (
                      <a href={item.href} target={item.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="text-sm font-medium text-zinc-200 hover:text-white transition-colors">
                        {item.value}
                      </a>
                    ) : (
                      <p className="text-sm font-medium text-zinc-200">{item.value}</p>
                    )}
                  </div>
                </div>
              ))}

              {/* Quick CTA */}
              <div
                className="p-6 rounded-xl border text-center mt-auto"
                style={{ borderColor: `${GOLD}30`, background: `linear-gradient(135deg, ${GOLD}08, ${GOLD}03)` }}
              >
                <Sparkle size={24} weight="fill" color={GOLD} className="mx-auto mb-3" />
                <p className="font-bold text-sm mb-1">Free Home Valuation</p>
                <p className="text-xs text-zinc-500 mb-4">Find out what your property is worth in today&apos;s market.</p>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full py-2.5 text-sm font-semibold rounded-lg border border-[#b8860b]/30 text-[#b8860b] hover:bg-[#b8860b]/10 transition-colors"
                >
                  Get Your Valuation
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════ FOOTER ═══════ */}
      <footer className="relative z-10 border-t border-white/8 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <House size={24} weight="bold" color={GOLD} />
                <div>
                  <span className="text-lg font-bold tracking-tight leading-none block">PUGET SOUND</span>
                  <span className="text-[10px] tracking-[0.35em] uppercase text-zinc-500 leading-none">Realty</span>
                </div>
              </div>
              <p className="text-sm text-zinc-500 leading-relaxed mb-4">
                Where Seattle Finds Home. Serving the Puget Sound region with integrity and expertise since 2008.
              </p>
              <div className="flex items-center gap-3">
                {[FacebookLogo, InstagramLogo, LinkedinLogo, YoutubeLogo].map((Icon, i) => (
                  <a
                    key={i}
                    href="#"
                    className="w-9 h-9 rounded-lg bg-white/[0.08] border border-white/8 flex items-center justify-center hover:border-[#b8860b]/30 transition-colors"
                  >
                    <Icon size={18} color="#a1a1aa" />
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: GOLD }}>Quick Links</h4>
              <div className="flex flex-col gap-2.5">
                {["Featured Listings", "Neighborhoods", "About Sarah", "Mortgage Calculator", "Contact Us"].map((link) => (
                  <a key={link} href="#" className="text-sm text-zinc-500 hover:text-white transition-colors">{link}</a>
                ))}
              </div>
            </div>

            {/* Services */}
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: GOLD }}>Services</h4>
              <div className="flex flex-col gap-2.5">
                {["Buyer Representation", "Seller Representation", "Market Analysis", "Home Valuation", "Relocation Assistance"].map((s) => (
                  <a key={s} href="#" className="text-sm text-zinc-500 hover:text-white transition-colors">{s}</a>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: GOLD }}>Contact</h4>
              <div className="flex flex-col gap-3 text-sm text-zinc-500">
                <a href="tel:2065550147" className="hover:text-white transition-colors flex items-center gap-2">
                  <Phone size={14} color={GOLD} /> (206) 555-0147
                </a>
                <a href="mailto:hello@pugetsoundrealty.com" className="hover:text-white transition-colors flex items-center gap-2">
                  <Envelope size={14} color={GOLD} /> hello@pugetsoundrealty.com
                </a>
                <a
                  href="https://maps.google.com/?q=1847+Westlake+Ave+N+Suite+200+Seattle+WA+98109"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors flex items-start gap-2"
                >
                  <MapPin size={14} color={GOLD} className="flex-shrink-0 mt-0.5" />
                  <span>1847 Westlake Ave N, Ste 200<br />Seattle, WA 98109</span>
                </a>
              </div>
            </div>
          </div>

          {/* Bottom */}
          <div className="border-t border-white/8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-2 text-xs text-zinc-600">
              <span>Licensed in WA State #12345</span>
              <span className="hidden sm:inline">|</span>
              <span>2026 Puget Sound Realty. All rights reserved.</span>
            </div>
            <div className="text-xs text-zinc-600 flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-sky-500"><path d="M24.3 4.2c-1.5-.4-3.2.1-4.5 1.1-1-.7-2.3-1-3.5-.8-2.4.4-4.2 2.5-4.2 4.9v.6c-3.2.8-6 2.8-7.8 5.6-.3.5-.1 1.1.4 1.4.5.3 1.1.1 1.4-.4 1.5-2.3 3.7-4 6.3-4.7.5-.1 1-.1 1.5 0 .8.2 1.4.8 1.7 1.5.3.8.2 1.6-.2 2.3l-2.8 4.3c-.6.9-.4 2.1.4 2.8l2.5 2.1c.4.3.8.5 1.3.5h5.2c.5 0 1-.2 1.3-.5l1.2-1c.6-.5.8-1.3.6-2l-1-3.2c-.2-.5 0-1.1.4-1.4l3.8-2.5c1.3-.9 2.1-2.3 2.1-3.9V9.6c0-2.5-1.7-4.7-4.1-5.3v-.1z" fill="currentColor"/></svg>Created by{" "}
              <a
                href="https://bluejayportfolio.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-zinc-400 transition-colors"
              >
                bluejayportfolio.com
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
