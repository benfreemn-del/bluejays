"use client";

/* eslint-disable @next/next/no-img-element */

import { useState, useRef, useEffect } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  Cross,
  BookOpen,
  Heart,
  UsersThree,
  HandsPraying,
  MusicNotes,
  Baby,
  Handshake,
  List,
  X,
  MapPin,
  Phone,
  Clock,
  CalendarBlank,
  ArrowRight,
  Quotes,
  Envelope,
  Play,
  Users,
  CurrencyDollar,
  HandHeart,
  Coffee,
  Church,
  Star,
  CaretRight,
  NavigationArrow,
  Wheelchair,
  Car,
  YoutubeLogo,
  FacebookLogo,
  InstagramLogo,
} from "@phosphor-icons/react";

/* ───────────────────────── SPRING + ANIMATION CONFIG ───────────────────────── */
const spring = { type: "spring" as const, stiffness: 100, damping: 20 };

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: spring },
};

/* ───────────────────────── COLORS ───────────────────────── */
const CREAM = "#faf9f6";
const AMBER = "#d97706";
const AMBER_LIGHT = "#f59e0b";
const AMBER_GLOW = "rgba(217, 119, 6, 0.10)";
const DARK = "#1c1917";
const BODY = "#78716c";
const CARD_BORDER = "#e7e5e4";

/* ───────────────────────── DATA ───────────────────────── */
const serviceTimes = [
  { day: "Sunday", time: "9:00 AM", label: "Traditional Worship", icon: Cross, desc: "Hymns, choir, and liturgical readings in a reverent atmosphere." },
  { day: "Sunday", time: "11:00 AM", label: "Contemporary Worship", icon: MusicNotes, desc: "Full band, modern songs, and a relaxed, come-as-you-are vibe." },
  { day: "Wednesday", time: "7:00 PM", label: "Midweek Study", icon: BookOpen, desc: "Verse-by-verse Bible study and small-group prayer time." },
];

const ministries = [
  { name: "Children's Ministry", icon: Baby, desc: "Age-appropriate Bible lessons, crafts, and activities every Sunday for ages 0-11." },
  { name: "Youth Group", icon: UsersThree, desc: "Middle and high schoolers meet Wednesdays for worship, games, and real conversations." },
  { name: "Small Groups", icon: Users, desc: "Neighborhood groups of 8-12 people meeting weekly in homes for fellowship and study." },
  { name: "Worship Team", icon: MusicNotes, desc: "Vocalists, musicians, and tech volunteers leading the congregation in worship." },
  { name: "Community Outreach", icon: HandHeart, desc: "Monthly food drives, shelter partnerships, and neighborhood service projects." },
  { name: "Women's Ministry", icon: Heart, desc: "Bible studies, retreats, and mentorship circles for women of all ages and stages." },
];

const events = [
  { title: "Easter Sunrise Service", date: "April 20", time: "6:30 AM", location: "Ballard Locks Waterfront", color: "#fbbf24" },
  { title: "Community BBQ", date: "May 3", time: "12:00 PM", location: "Church Lawn", color: "#f97316" },
  { title: "VBS Registration", date: "June 1-5", time: "9 AM - 12 PM", location: "Main Campus", color: "#34d399" },
  { title: "Marriage Enrichment", date: "May 17", time: "6:30 PM", location: "Fellowship Hall", color: "#f472b6" },
];

const sermons = [
  { title: "Finding Peace in the Storm", speaker: "Pastor David Kim", date: "Apr 6, 2026", series: "Anchored", img: "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=600&q=80" },
  { title: "Love Your Neighbor", speaker: "Rachel Kim", date: "Mar 30, 2026", series: "Better Together", img: "https://images.unsplash.com/photo-1445445290350-18a3b86e0b5a?w=600&q=80" },
  { title: "Faith Over Fear", speaker: "Guest Speaker", date: "Mar 23, 2026", series: "Anchored", img: "https://images.unsplash.com/photo-1507692049790-de58290a4334?w=600&q=80" },
];

const stats = [
  { value: 300, suffix: "+", label: "Weekly Attendees" },
  { value: 45, suffix: "", label: "Small Groups" },
  { value: 125, suffix: "K", label: "Given to Local Causes", prefix: "$" },
  { value: 2000, suffix: "+", label: "Meals Served Annually" },
];

const testimonials = [
  { quote: "We walked in knowing nobody. Within a month, we had dinner invitations from 3 families.", author: "The Martinez Family", img: "https://images.unsplash.com/photo-1609220136736-443140cffec6?w=400&q=80" },
  { quote: "My teenage son actually WANTS to go to church now. The youth group changed everything.", author: "Angela S.", img: "https://images.unsplash.com/photo-1573497019236-17f8177b81e8?w=400&q=80" },
  { quote: "After losing my husband, this community carried me. Literally \u2014 meals for 6 months straight.", author: "Margaret O.", img: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400&q=80" },
  { quote: "I was skeptical of organized religion. Grace changed my mind. It\u2019s not about religion \u2014 it\u2019s about people.", author: "Jake T.", img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80" },
  { quote: "Moved from another state during COVID. Grace was the first place that felt like home.", author: "Sarah & Brandon L.", img: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&q=80" },
];

const NAV_LINKS = [
  { label: "Services", href: "#services" },
  { label: "About", href: "#about" },
  { label: "Ministries", href: "#ministries" },
  { label: "Events", href: "#events" },
  { label: "Sermons", href: "#sermons" },
  { label: "I\u2019m New", href: "#new-here" },
  { label: "Give", href: "#give" },
  { label: "Contact", href: "#contact" },
];

/* ───────────────────────── SECTION REVEAL ───────────────────────── */
function SectionReveal({ children, className = "", id, style }: { children: React.ReactNode; className?: string; id?: string; style?: React.CSSProperties }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.section
      ref={ref}
      id={id}
      className={className}
      style={style}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={spring}
    >
      {children}
    </motion.section>
  );
}

/* ───────────────────────── COUNTER ANIMATION ───────────────────────── */
function AnimatedCounter({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const duration = 2000;
    const step = Math.ceil(value / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, value]);

  return (
    <span ref={ref}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
}

/* ───────────────────────── SUBTLE CROSS PATTERN SVG ───────────────────────── */
function CrossPattern({ opacity = 0.03 }: { opacity?: number }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ opacity }}>
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="crossPattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M28 10 L32 10 L32 28 L50 28 L50 32 L32 32 L32 50 L28 50 L28 32 L10 32 L10 28 L28 28Z" fill={AMBER} />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#crossPattern)" />
      </svg>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   MAIN PAGE COMPONENT
   ═══════════════════════════════════════════════════════════════════════ */
export default function ChurchShowcase() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  /* Auto-rotate testimonials */
  useEffect(() => {
    const t = setInterval(() => setActiveTestimonial((p) => (p + 1) % testimonials.length), 6000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="relative min-h-screen overflow-x-hidden" style={{ background: CREAM, color: DARK }}>

      {/* ═══════════════ NAVBAR ═══════════════ */}
      <nav className="fixed top-0 inset-x-0 z-50 backdrop-blur-md border-b" style={{ background: "rgba(250,249,246,0.92)", borderColor: CARD_BORDER }}>
        <div className="mx-auto max-w-7xl px-4 md:px-6 flex items-center justify-between h-16">
          <a href="#" className="flex items-center gap-2">
            <Cross size={28} weight="duotone" style={{ color: AMBER }} />
            <span className="text-lg font-bold tracking-tight" style={{ color: DARK }}>Grace Community Church</span>
          </a>
          <div className="hidden lg:flex items-center gap-6">
            {NAV_LINKS.map((l) => (
              <a key={l.href} href={l.href} className="text-sm font-medium transition-colors hover:opacity-80" style={{ color: BODY }}>
                {l.label}
              </a>
            ))}
            <a href="#contact" className="ml-2 rounded-full px-5 py-2 text-sm font-semibold text-white transition-transform hover:scale-105" style={{ background: AMBER }}>
              Plan Your Visit
            </a>
          </div>
          <button className="lg:hidden p-2" onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <List size={26} style={{ color: DARK }} />
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-[60] flex flex-col"
            style={{ background: CREAM }}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="flex items-center justify-between px-4 h-16 border-b" style={{ borderColor: CARD_BORDER }}>
              <span className="text-lg font-bold" style={{ color: DARK }}>Grace Community</span>
              <button onClick={() => setMobileOpen(false)} aria-label="Close menu">
                <X size={26} style={{ color: DARK }} />
              </button>
            </div>
            <div className="flex flex-col gap-1 p-6">
              {NAV_LINKS.map((l) => (
                <a key={l.href} href={l.href} onClick={() => setMobileOpen(false)} className="text-lg font-medium py-3 border-b transition-colors" style={{ color: DARK, borderColor: CARD_BORDER }}>
                  {l.label}
                </a>
              ))}
              <a href="#contact" onClick={() => setMobileOpen(false)} className="mt-4 rounded-full px-6 py-3 text-center text-white font-semibold" style={{ background: AMBER }}>
                Plan Your Visit
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════ HERO ═══════════════ */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-16 overflow-hidden">
        {/* Background community photo */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=1920&q=80"
            alt="Community gathering"
            className="w-full h-full object-cover"
          />
          {/* Warm golden overlay */}
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(217,119,6,0.35) 0%, rgba(245,158,11,0.25) 40%, rgba(250,249,246,0.95) 100%)" }} />
        </div>

        <div className="relative z-10 text-center px-4 py-20 md:py-32 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6 text-sm font-medium border" style={{ background: "rgba(255,255,255,0.85)", borderColor: CARD_BORDER, color: AMBER }}>
              <Cross size={16} weight="fill" />
              Grace Community Church
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.95] mb-6" style={{ color: DARK }}>
              A Place to{" "}
              <span style={{ color: AMBER }}>Belong</span>
            </h1>
            <p className="text-lg md:text-xl max-w-2xl mx-auto mb-8 leading-relaxed" style={{ color: DARK, textShadow: "0 1px 8px rgba(255,255,255,0.8), 0 0 20px rgba(255,255,255,0.5)" }}>
              A diverse, multigenerational community in the heart of Ballard, Seattle.
              Everyone is welcome here.
            </p>
          </motion.div>

          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold" style={{ background: "rgba(255,255,255,0.9)", color: DARK, border: `1px solid ${CARD_BORDER}` }}>
              <Clock size={18} style={{ color: AMBER }} />
              Sundays 9 AM & 11 AM
            </div>
            <a href="#new-here" className="inline-flex items-center gap-2 rounded-full px-7 py-3 text-white font-semibold shadow-lg transition-all hover:scale-105 hover:shadow-xl" style={{ background: AMBER }}>
              Plan Your Visit
              <ArrowRight size={18} weight="bold" />
            </a>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════ SERVICE TIMES ═══════════════ */}
      <SectionReveal id="services" className="relative py-20 md:py-28">
        <CrossPattern opacity={0.02} />
        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-14">
            <p className="text-sm uppercase tracking-widest mb-2 font-semibold" style={{ color: AMBER }}>Join Us</p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight" style={{ color: DARK }}>Service Times</h2>
          </div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
          >
            {serviceTimes.map((svc, i) => (
              <motion.div key={i} variants={fadeUp} className="bg-white rounded-2xl shadow-sm border p-8 text-center hover:shadow-md transition-shadow" style={{ borderColor: CARD_BORDER }}>
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-5" style={{ background: AMBER_GLOW }}>
                  <svc.icon size={28} weight="duotone" style={{ color: AMBER }} />
                </div>
                <p className="text-sm font-semibold uppercase tracking-wider mb-1" style={{ color: AMBER }}>{svc.day}</p>
                <h3 className="text-2xl font-bold mb-1" style={{ color: DARK }}>{svc.time}</h3>
                <p className="text-base font-semibold mb-3" style={{ color: DARK }}>{svc.label}</p>
                <p className="text-sm leading-relaxed" style={{ color: BODY }}>{svc.desc}</p>
              </motion.div>
            ))}
          </motion.div>

          <div className="mt-8 text-center">
            <p className="inline-flex items-center gap-2 text-sm" style={{ color: BODY }}>
              <MapPin size={16} style={{ color: AMBER }} />
              6201 15th Ave NW, Seattle, WA 98107
            </p>
          </div>
        </div>
      </SectionReveal>

      {/* ═══════════════ ABOUT GRACE ═══════════════ */}
      <SectionReveal id="about" className="relative py-20 md:py-28 overflow-hidden" style={{ background: "linear-gradient(180deg, #f5f0eb 0%, #faf9f6 100%)" }}>
        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <p className="text-sm uppercase tracking-widest mb-2 font-semibold" style={{ color: AMBER }}>Our Story</p>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6" style={{ color: DARK }}>
                Welcome to <span style={{ color: AMBER }}>Grace</span>
              </h2>
              <div className="space-y-4 text-base leading-relaxed" style={{ color: BODY }}>
                <p>
                  Grace Community Church is a diverse, multigenerational family in the Ballard neighborhood of Seattle.
                  We believe that church should feel less like an obligation and more like coming home.
                </p>
                <p>
                  Founded in 2014 by Pastor David and Rachel Kim, Grace started as a living-room gathering of 12 people
                  with a simple dream: create a space where anyone, regardless of background, could experience authentic
                  community and encounter the love of God.
                </p>
                <p>
                  Today, over 300 people call Grace home. We worship together, serve our neighbors, raise our kids side by side,
                  and carry each other through life's hardest chapters.
                </p>
              </div>
              <a href="#new-here" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold transition-colors hover:opacity-80" style={{ color: AMBER }}>
                Learn what to expect
                <ArrowRight size={16} weight="bold" />
              </a>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&q=80"
                alt="Grace Community Church family gathering"
                className="w-full rounded-2xl shadow-lg object-cover aspect-[4/3]"
              />
              <div className="absolute -bottom-4 -left-4 rounded-xl bg-white shadow-md border px-5 py-3 flex items-center gap-3" style={{ borderColor: CARD_BORDER }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: AMBER_GLOW }}>
                  <Heart size={20} weight="fill" style={{ color: AMBER }} />
                </div>
                <div>
                  <p className="text-sm font-bold" style={{ color: DARK }}>Since 2014</p>
                  <p className="text-xs" style={{ color: BODY }}>10 years of community</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* ═══════════════ MINISTRIES ═══════════════ */}
      <SectionReveal id="ministries" className="relative py-20 md:py-28">
        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-14">
            <p className="text-sm uppercase tracking-widest mb-2 font-semibold" style={{ color: AMBER }}>Get Involved</p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight" style={{ color: DARK }}>Ministries</h2>
          </div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
          >
            {ministries.map((m, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className="bg-white rounded-2xl shadow-sm border p-7 hover:shadow-md transition-all hover:-translate-y-1 group"
                style={{ borderColor: CARD_BORDER }}
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors" style={{ background: AMBER_GLOW }}>
                  <m.icon size={24} weight="duotone" style={{ color: AMBER }} />
                </div>
                <h3 className="text-lg font-bold mb-2" style={{ color: DARK }}>{m.name}</h3>
                <p className="text-sm leading-relaxed" style={{ color: BODY }}>{m.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ═══════════════ UPCOMING EVENTS ═══════════════ */}
      <SectionReveal id="events" className="relative py-20 md:py-28" style={{ background: "linear-gradient(180deg, #f5f0eb 0%, #faf9f6 100%)" }}>
        <CrossPattern opacity={0.015} />
        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-14">
            <p className="text-sm uppercase tracking-widest mb-2 font-semibold" style={{ color: AMBER }}>What&apos;s Happening</p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight" style={{ color: DARK }}>Upcoming Events</h2>
          </div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 gap-6"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
          >
            {events.map((e, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className="bg-white rounded-2xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow group"
                style={{ borderColor: CARD_BORDER }}
              >
                <div className="flex items-stretch">
                  <div className="w-2 shrink-0" style={{ background: e.color }} />
                  <div className="p-6 flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-bold mb-1" style={{ color: DARK }}>{e.title}</h3>
                        <div className="flex flex-wrap items-center gap-3 text-sm" style={{ color: BODY }}>
                          <span className="inline-flex items-center gap-1">
                            <CalendarBlank size={14} style={{ color: AMBER }} />
                            {e.date}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Clock size={14} style={{ color: AMBER }} />
                            {e.time}
                          </span>
                        </div>
                        <p className="mt-2 text-sm inline-flex items-center gap-1" style={{ color: BODY }}>
                          <MapPin size={14} style={{ color: AMBER }} />
                          {e.location}
                        </p>
                      </div>
                      <div className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: AMBER_GLOW }}>
                        <ArrowRight size={18} style={{ color: AMBER }} />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ═══════════════ SERMON ARCHIVE ═══════════════ */}
      <SectionReveal id="sermons" className="relative py-20 md:py-28">
        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-14">
            <p className="text-sm uppercase tracking-widest mb-2 font-semibold" style={{ color: AMBER }}>Listen Again</p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight" style={{ color: DARK }}>Recent Sermons</h2>
          </div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
          >
            {sermons.map((s, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className="bg-white rounded-2xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow group"
                style={{ borderColor: CARD_BORDER }}
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img src={s.img} alt={s.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                      <Play size={24} weight="fill" style={{ color: AMBER }} />
                    </div>
                  </div>
                  <div className="absolute top-3 left-3 rounded-full px-3 py-1 text-xs font-semibold bg-white/90 backdrop-blur-sm" style={{ color: AMBER }}>
                    {s.series}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-base font-bold mb-1" style={{ color: DARK }}>{s.title}</h3>
                  <p className="text-sm" style={{ color: BODY }}>{s.speaker}</p>
                  <p className="text-xs mt-1" style={{ color: BODY }}>{s.date}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ═══════════════ MEET THE PASTORS ═══════════════ */}
      <SectionReveal className="relative py-20 md:py-28" style={{ background: "linear-gradient(180deg, #f5f0eb 0%, #faf9f6 100%)" }}>
        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-14">
            <p className="text-sm uppercase tracking-widest mb-2 font-semibold" style={{ color: AMBER }}>Our Shepherds</p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight" style={{ color: DARK }}>Meet the Pastors</h2>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border overflow-hidden" style={{ borderColor: CARD_BORDER }}>
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="relative aspect-[4/3] lg:aspect-auto">
                <img
                  src="https://images.unsplash.com/photo-1543269664-56d93c1b41a6?w=800&q=80"
                  alt="Pastor David and Rachel Kim"
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <div className="p-8 md:p-12 flex flex-col justify-center">
                <h3 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: DARK }}>Pastor David & Rachel Kim</h3>
                <p className="text-sm font-medium mb-6" style={{ color: AMBER }}>Lead Pastors</p>
                <div className="space-y-4 text-base leading-relaxed" style={{ color: BODY }}>
                  <p>
                    David and Rachel met at Dallas Theological Seminary, married 22 years ago, and
                    have three kids who keep life interesting. In 2014, they packed up their Texas
                    lives and moved to Seattle with a wild idea: plant a church that felt like family.
                  </p>
                  <p>
                    David preaches with warmth and humor. Rachel leads worship and the women&apos;s ministry.
                    Together, they set the tone for everything Grace is: honest, joyful, and unapologetically
                    welcoming.
                  </p>
                </div>
                <div className="mt-6 flex items-center gap-3">
                  <a href="#contact" className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-105" style={{ background: AMBER }}>
                    <Envelope size={16} />
                    Say Hello
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* ═══════════════ COMMUNITY IMPACT ═══════════════ */}
      <SectionReveal className="relative py-20 md:py-28">
        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-14">
            <p className="text-sm uppercase tracking-widest mb-2 font-semibold" style={{ color: AMBER }}>By the Numbers</p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight" style={{ color: DARK }}>Community Impact</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((s, i) => (
              <motion.div
                key={i}
                className="bg-white rounded-2xl shadow-sm border p-6 md:p-8 text-center hover:shadow-md transition-shadow"
                style={{ borderColor: CARD_BORDER }}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, ...spring }}
              >
                <p className="text-3xl md:text-4xl font-bold mb-2" style={{ color: AMBER }}>
                  <AnimatedCounter value={s.value} prefix={s.prefix} suffix={s.suffix} />
                </p>
                <p className="text-sm font-medium" style={{ color: BODY }}>{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ═══════════════ I'M NEW HERE ═══════════════ */}
      <SectionReveal id="new-here" className="relative py-20 md:py-28" style={{ background: "linear-gradient(180deg, #fef3c7 0%, #faf9f6 100%)" }}>
        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-14">
            <p className="text-sm uppercase tracking-widest mb-2 font-semibold" style={{ color: AMBER }}>First Visit?</p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight" style={{ color: DARK }}>
              I&apos;m <span style={{ color: AMBER }}>New</span> Here
            </h2>
            <p className="mt-4 text-lg max-w-2xl mx-auto" style={{ color: BODY }}>
              We know walking into a new church can feel intimidating. Here&apos;s what to expect so you can relax and enjoy.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Coffee, title: "Coffee Bar", desc: "Grab a free latte or drip coffee in the lobby. We take coffee seriously." },
              { icon: UsersThree, title: "Casual Dress", desc: "Jeans, shorts, sundresses \u2014 whatever you\u2019re comfortable in. No dress code." },
              { icon: Clock, title: "75-Minute Service", desc: "Music, a message, and you\u2019re out in time for lunch. We respect your time." },
              { icon: Baby, title: "Kids Program", desc: "Safe, fun, age-appropriate classes during every service. From nursery to 5th grade." },
            ].map((item, i) => (
              <motion.div
                key={i}
                className="bg-white rounded-2xl shadow-sm border p-7 text-center hover:shadow-md transition-shadow"
                style={{ borderColor: CARD_BORDER }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, ...spring }}
              >
                <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: AMBER_GLOW }}>
                  <item.icon size={28} weight="duotone" style={{ color: AMBER }} />
                </div>
                <h3 className="text-base font-bold mb-2" style={{ color: DARK }}>{item.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: BODY }}>{item.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <div className="inline-flex items-center gap-2 rounded-full px-6 py-3 bg-white shadow-sm border" style={{ borderColor: CARD_BORDER }}>
              <HandsPraying size={20} weight="duotone" style={{ color: AMBER }} />
              <span className="text-sm font-medium" style={{ color: DARK }}>We save you a seat. Just show up.</span>
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* ═══════════════ TESTIMONIALS ═══════════════ */}
      <SectionReveal className="relative py-20 md:py-28">
        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-14">
            <p className="text-sm uppercase tracking-widest mb-2 font-semibold" style={{ color: AMBER }}>Real Stories</p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight" style={{ color: DARK }}>What People Are Saying</h2>
          </div>

          {/* Desktop: Story cards grid */}
          <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                className="relative rounded-2xl overflow-hidden shadow-md group"
                style={{ minHeight: 280 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, ...spring }}
              >
                <img src={t.img} alt={t.author} className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(28,25,23,0.85) 0%, rgba(28,25,23,0.3) 100%)" }} />
                <div className="relative z-10 flex flex-col justify-end h-full p-6">
                  <Quotes size={28} weight="fill" className="mb-3" style={{ color: AMBER_LIGHT }} />
                  <p className="text-white text-sm leading-relaxed mb-3">{t.quote}</p>
                  <p className="text-xs font-semibold" style={{ color: AMBER_LIGHT }}>\u2014 {t.author}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Mobile: Carousel */}
          <div className="md:hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTestimonial}
                className="relative rounded-2xl overflow-hidden shadow-md"
                style={{ minHeight: 320 }}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3 }}
              >
                <img src={testimonials[activeTestimonial].img} alt={testimonials[activeTestimonial].author} className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(28,25,23,0.85) 0%, rgba(28,25,23,0.3) 100%)" }} />
                <div className="relative z-10 flex flex-col justify-end h-full p-6">
                  <Quotes size={28} weight="fill" className="mb-3" style={{ color: AMBER_LIGHT }} />
                  <p className="text-white text-base leading-relaxed mb-3">{testimonials[activeTestimonial].quote}</p>
                  <p className="text-sm font-semibold" style={{ color: AMBER_LIGHT }}>\u2014 {testimonials[activeTestimonial].author}</p>
                </div>
              </motion.div>
            </AnimatePresence>
            <div className="flex items-center justify-center gap-2 mt-4">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTestimonial(i)}
                  className="w-2.5 h-2.5 rounded-full transition-all"
                  style={{ background: i === activeTestimonial ? AMBER : CARD_BORDER }}
                  aria-label={`Testimonial ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* ═══════════════ GIVE / DONATE ═══════════════ */}
      <SectionReveal id="give" className="relative py-20 md:py-28" style={{ background: "linear-gradient(180deg, #f5f0eb 0%, #faf9f6 100%)" }}>
        <CrossPattern opacity={0.02} />
        <div className="relative z-10 mx-auto max-w-5xl px-4 md:px-6 text-center">
          <p className="text-sm uppercase tracking-widest mb-2 font-semibold" style={{ color: AMBER }}>Generosity</p>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6" style={{ color: DARK }}>
            Partner <span style={{ color: AMBER }}>With Us</span>
          </h2>
          <p className="text-lg max-w-2xl mx-auto mb-10 leading-relaxed" style={{ color: BODY }}>
            Your generosity fuels everything we do. Every dollar goes toward building a community
            where people can find hope, healing, and belonging.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
            {[
              { icon: HandHeart, title: "Local Outreach", desc: "Food banks, shelters, and neighborhood partnerships across Seattle." },
              { icon: Church, title: "Building Fund", desc: "Expanding our campus to serve more families and host more programs." },
              { icon: Heart, title: "Global Missions", desc: "Clean water projects, school building, and church planting worldwide." },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm border p-6" style={{ borderColor: CARD_BORDER }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ background: AMBER_GLOW }}>
                  <item.icon size={24} weight="duotone" style={{ color: AMBER }} />
                </div>
                <h3 className="text-sm font-bold mb-1" style={{ color: DARK }}>{item.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: BODY }}>{item.desc}</p>
              </div>
            ))}
          </div>

          <a href="#" className="inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-white font-semibold shadow-lg transition-all hover:scale-105" style={{ background: AMBER }}>
            <CurrencyDollar size={20} weight="bold" />
            Give Online
          </a>
        </div>
      </SectionReveal>

      {/* ═══════════════ LOCATION & DIRECTIONS ═══════════════ */}
      <SectionReveal className="relative py-20 md:py-28">
        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-14">
            <p className="text-sm uppercase tracking-widest mb-2 font-semibold" style={{ color: AMBER }}>Find Us</p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight" style={{ color: DARK }}>Location & Directions</h2>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border overflow-hidden" style={{ borderColor: CARD_BORDER }}>
            <div className="grid grid-cols-1 lg:grid-cols-2">
              {/* Map placeholder */}
              <div className="relative aspect-[4/3] lg:aspect-auto overflow-hidden" style={{ background: "#e7e5e4", minHeight: 320 }}>
                <img
                  src="https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&q=80"
                  alt="Ballard, Seattle aerial view"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(28,25,23,0.25)" }}>
                  <a
                    href="https://maps.google.com/?q=6201+15th+Ave+NW+Seattle+WA+98107"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full px-6 py-3 bg-white shadow-lg font-semibold text-sm transition-transform hover:scale-105"
                    style={{ color: DARK }}
                  >
                    <NavigationArrow size={18} style={{ color: AMBER }} />
                    Get Directions
                  </a>
                </div>
              </div>
              <div className="p-8 md:p-12 flex flex-col justify-center">
                <h3 className="text-xl font-bold mb-6" style={{ color: DARK }}>Located in the Heart of Ballard</h3>
                <div className="space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: AMBER_GLOW }}>
                      <MapPin size={20} weight="duotone" style={{ color: AMBER }} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: DARK }}>Address</p>
                      <a href="https://maps.google.com/?q=6201+15th+Ave+NW+Seattle+WA+98107" target="_blank" rel="noopener noreferrer" className="text-sm hover:underline" style={{ color: BODY }}>
                        6201 15th Ave NW, Seattle, WA 98107
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: AMBER_GLOW }}>
                      <Car size={20} weight="duotone" style={{ color: AMBER }} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: DARK }}>Parking</p>
                      <p className="text-sm" style={{ color: BODY }}>Free lot behind the building + street parking on 15th Ave.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: AMBER_GLOW }}>
                      <Wheelchair size={20} weight="duotone" style={{ color: AMBER }} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: DARK }}>Accessibility</p>
                      <p className="text-sm" style={{ color: BODY }}>Fully ADA accessible. Ramp entrance, elevator, reserved seating.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* ═══════════════ CONTACT ═══════════════ */}
      <SectionReveal id="contact" className="relative py-20 md:py-28" style={{ background: "linear-gradient(180deg, #f5f0eb 0%, #faf9f6 100%)" }}>
        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-14">
            <p className="text-sm uppercase tracking-widest mb-2 font-semibold" style={{ color: AMBER }}>Reach Out</p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight" style={{ color: DARK }}>Contact Us</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Form */}
            <div className="bg-white rounded-2xl shadow-sm border p-8" style={{ borderColor: CARD_BORDER }}>
              <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: DARK }}>Your Name</label>
                  <input type="text" placeholder="Full name" className="w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 transition-shadow" style={{ borderColor: CARD_BORDER, background: CREAM }} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: DARK }}>Email</label>
                  <input type="email" placeholder="your@email.com" className="w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 transition-shadow" style={{ borderColor: CARD_BORDER, background: CREAM }} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: DARK }}>How can we help?</label>
                  <select className="w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 transition-shadow" style={{ borderColor: CARD_BORDER, background: CREAM, color: BODY }}>
                    <option>General question</option>
                    <option>Prayer request</option>
                    <option>Plan my first visit</option>
                    <option>Join a small group</option>
                    <option>Volunteer</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: DARK }}>Message</label>
                  <textarea rows={4} placeholder="Tell us what's on your heart..." className="w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 transition-shadow resize-none" style={{ borderColor: CARD_BORDER, background: CREAM }} />
                </div>
                <button type="submit" className="w-full rounded-xl px-6 py-3.5 text-white font-semibold transition-all hover:scale-[1.02]" style={{ background: AMBER }}>
                  Send Message
                </button>
              </form>
            </div>

            {/* Contact info */}
            <div className="flex flex-col gap-6">
              <div className="bg-white rounded-2xl shadow-sm border p-6" style={{ borderColor: CARD_BORDER }}>
                <h3 className="text-lg font-bold mb-4" style={{ color: DARK }}>Contact Information</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: AMBER_GLOW }}>
                      <Phone size={18} weight="duotone" style={{ color: AMBER }} />
                    </div>
                    <a href="tel:2065550285" className="text-sm font-medium hover:underline" style={{ color: DARK }}>(206) 555-0285</a>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: AMBER_GLOW }}>
                      <Envelope size={18} weight="duotone" style={{ color: AMBER }} />
                    </div>
                    <a href="mailto:hello@graceseattle.org" className="text-sm font-medium hover:underline" style={{ color: DARK }}>hello@graceseattle.org</a>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: AMBER_GLOW }}>
                      <MapPin size={18} weight="duotone" style={{ color: AMBER }} />
                    </div>
                    <a href="https://maps.google.com/?q=6201+15th+Ave+NW+Seattle+WA+98107" target="_blank" rel="noopener noreferrer" className="text-sm font-medium hover:underline" style={{ color: DARK }}>
                      6201 15th Ave NW, Seattle, WA 98107
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border p-6" style={{ borderColor: CARD_BORDER }}>
                <h3 className="text-lg font-bold mb-4" style={{ color: DARK }}>Office Hours</h3>
                <div className="space-y-2 text-sm" style={{ color: BODY }}>
                  <div className="flex justify-between"><span>Monday - Thursday</span><span className="font-medium" style={{ color: DARK }}>9:00 AM - 4:00 PM</span></div>
                  <div className="flex justify-between"><span>Friday</span><span className="font-medium" style={{ color: DARK }}>9:00 AM - 12:00 PM</span></div>
                  <div className="flex justify-between"><span>Saturday - Sunday</span><span className="font-medium" style={{ color: DARK }}>By appointment</span></div>
                </div>
              </div>

              <div className="rounded-2xl p-6 text-center" style={{ background: AMBER_GLOW, border: `1px solid rgba(217,119,6,0.15)` }}>
                <HandsPraying size={32} weight="duotone" style={{ color: AMBER }} className="mx-auto mb-3" />
                <h3 className="text-base font-bold mb-1" style={{ color: DARK }}>Need Prayer?</h3>
                <p className="text-sm mb-3" style={{ color: BODY }}>
                  Submit a prayer request and our pastoral team will pray over it within 24 hours.
                </p>
                <a href="#" className="text-sm font-semibold inline-flex items-center gap-1 transition-colors hover:opacity-80" style={{ color: AMBER }}>
                  Submit Prayer Request <ArrowRight size={14} weight="bold" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* ═══════════════ FOOTER ═══════════════ */}
      <footer className="relative py-16 border-t" style={{ background: CREAM, borderColor: CARD_BORDER }}>
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <Cross size={24} weight="duotone" style={{ color: AMBER }} />
                <span className="text-base font-bold" style={{ color: DARK }}>Grace Community</span>
              </div>
              <p className="text-sm leading-relaxed mb-4" style={{ color: BODY }}>
                A Place to Belong. Sundays at 9 AM & 11 AM in Ballard, Seattle.
              </p>
              <div className="flex items-center gap-3">
                <a href="#" className="w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:opacity-80" style={{ background: AMBER_GLOW }}>
                  <YoutubeLogo size={18} weight="fill" style={{ color: AMBER }} />
                </a>
                <a href="#" className="w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:opacity-80" style={{ background: AMBER_GLOW }}>
                  <FacebookLogo size={18} weight="fill" style={{ color: AMBER }} />
                </a>
                <a href="#" className="w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:opacity-80" style={{ background: AMBER_GLOW }}>
                  <InstagramLogo size={18} weight="fill" style={{ color: AMBER }} />
                </a>
              </div>
            </div>

            {/* Service Times */}
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: DARK }}>Service Times</h4>
              <div className="space-y-2 text-sm" style={{ color: BODY }}>
                <p>Sunday 9:00 AM - Traditional</p>
                <p>Sunday 11:00 AM - Contemporary</p>
                <p>Wednesday 7:00 PM - Midweek Study</p>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: DARK }}>Quick Links</h4>
              <div className="space-y-2 text-sm" style={{ color: BODY }}>
                {["About", "Ministries", "Events", "Sermons", "Give", "Contact"].map((l) => (
                  <a key={l} href={`#${l.toLowerCase()}`} className="block hover:underline">{l}</a>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: DARK }}>Get in Touch</h4>
              <div className="space-y-2 text-sm" style={{ color: BODY }}>
                <p className="flex items-center gap-2">
                  <Phone size={14} style={{ color: AMBER }} />
                  <a href="tel:2065550285" className="hover:underline">(206) 555-0285</a>
                </p>
                <p className="flex items-center gap-2">
                  <Envelope size={14} style={{ color: AMBER }} />
                  <a href="mailto:hello@graceseattle.org" className="hover:underline">hello@graceseattle.org</a>
                </p>
                <p className="flex items-center gap-2">
                  <MapPin size={14} style={{ color: AMBER }} />
                  <a href="https://maps.google.com/?q=6201+15th+Ave+NW+Seattle+WA+98107" target="_blank" rel="noopener noreferrer" className="hover:underline">
                    6201 15th Ave NW, Seattle, WA 98107
                  </a>
                </p>
              </div>
            </div>
          </div>

          <div className="border-t pt-8 flex flex-col md:flex-row items-center justify-between gap-4" style={{ borderColor: CARD_BORDER }}>
            <p className="text-xs" style={{ color: BODY }}>
              &copy; {new Date().getFullYear()} Grace Community Church. All rights reserved.
            </p>
            <p className="text-xs" style={{ color: BODY }}>
              Created by{" "}
              <a href="https://bluejayportfolio.com" target="_blank" rel="noopener noreferrer" className="font-medium hover:underline" style={{ color: AMBER }}>
                bluejayportfolio.com
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
