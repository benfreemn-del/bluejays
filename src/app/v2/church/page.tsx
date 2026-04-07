"use client";

import { useState, useRef, useCallback } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useInView,
  AnimatePresence,
} from "framer-motion";
import {
  Cross,
  BookOpen,
  Heart,
  UsersThree,
  HandsPraying,
  Bird,
  Church,
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
  Star,
} from "@phosphor-icons/react";

/* ───────────────────────── SPRING CONFIG ───────────────────────── */
const spring = { type: "spring" as const, stiffness: 100, damping: 20 };
const springFast = { type: "spring" as const, stiffness: 200, damping: 25 };
const springGentle = { type: "spring" as const, stiffness: 60, damping: 18 };

const stagger = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: spring },
};

/* ───────────────────────── COLORS ───────────────────────── */
const NAVY = "#1a1a2e";
const GOLD = "#d4a853";
const GOLD_LIGHT = "#e2c07a";
const GOLD_GLOW = "rgba(212, 168, 83, 0.15)";

/* ───────────────────────── FLOATING LIGHT PARTICLES ───────────────────────── */
function FloatingParticles() {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 8,
    duration: 7 + Math.random() * 7,
    size: 2 + Math.random() * 4,
    opacity: 0.12 + Math.random() * 0.28,
  }));

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden hidden md:block">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            width: p.size,
            height: p.size,
            background: GOLD_LIGHT,
            willChange: "transform, opacity",
          }}
          animate={{
            y: ["-10vh", "110vh"],
            opacity: [0, p.opacity, p.opacity, 0],
          }}
          transition={{
            y: { duration: p.duration, repeat: Infinity, delay: p.delay, ease: "linear" },
            opacity: {
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              times: [0, 0.1, 0.9, 1],
            },
          }}
        />
      ))}
    </div>
  );
}

/* ───────────────────────── WORD REVEAL ───────────────────────── */
function WordReveal({ text, className = "" }: { text: string; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const words = text.split(" ");

  return (
    <motion.span
      ref={ref}
      className={`inline-flex flex-wrap gap-x-3 ${className}`}
      variants={stagger}
      initial="hidden"
      animate={isInView ? "show" : "hidden"}
    >
      {words.map((word, i) => (
        <motion.span key={i} variants={fadeUp} className="inline-block">
          {word}
        </motion.span>
      ))}
    </motion.span>
  );
}

/* ───────────────────────── SECTION REVEAL ───────────────────────── */
function SectionReveal({
  children,
  className = "",
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.section
      ref={ref}
      id={id}
      className={className}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={spring}
    >
      {children}
    </motion.section>
  );
}

/* ───────────────────────── LIQUID GLASS CARD ───────────────────────── */
function GlassCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] ${className}`}
    >
      {children}
    </div>
  );
}

/* ───────────────────────── MAGNETIC BUTTON ───────────────────────── */
function MagneticButton({
  children,
  className = "",
  onClick,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, springFast);
  const springY = useSpring(y, springFast);

  const isTouchDevice =
    typeof window !== "undefined" &&
    window.matchMedia("(pointer: coarse)").matches;

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!ref.current || isTouchDevice) return;
      const rect = ref.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      x.set((e.clientX - cx) * 0.25);
      y.set((e.clientY - cy) * 0.25);
    },
    [x, y, isTouchDevice]
  );

  const handleMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  return (
    <motion.button
      ref={ref}
      style={{ x: springX, y: springY, willChange: "transform", ...style }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={className}
      whileTap={{ scale: 0.97 }}
    >
      {children}
    </motion.button>
  );
}

/* ───────────────────────── SHIMMER BORDER ───────────────────────── */
function ShimmerBorder({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`relative rounded-2xl p-[1px] overflow-hidden ${className}`}>
      <motion.div
        className="absolute inset-0 rounded-2xl"
        style={{
          background: `conic-gradient(from 0deg, transparent, ${GOLD}, transparent, ${GOLD_LIGHT}, transparent)`,
          willChange: "transform",
        }}
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      />
      <div className="relative rounded-2xl z-10" style={{ background: NAVY }}>
        {children}
      </div>
    </div>
  );
}

/* ───────────────────────── WAVE BACKGROUND ───────────────────────── */
function WaveBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
      <motion.svg
        viewBox="0 0 1440 320"
        className="absolute bottom-0 w-full"
        preserveAspectRatio="none"
      >
        <motion.path
          fill={GOLD}
          fillOpacity="0.3"
          animate={{
            d: [
              "M0,224L48,213.3C96,203,192,181,288,186.7C384,192,480,224,576,229.3C672,235,768,213,864,197.3C960,181,1056,171,1152,181.3C1248,192,1344,224,1392,240L1440,256L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
              "M0,256L48,240C96,224,192,192,288,192C384,192,480,224,576,234.7C672,245,768,235,864,218.7C960,203,1056,181,1152,186.7C1248,192,1344,224,1392,240L1440,256L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
              "M0,224L48,213.3C96,203,192,181,288,186.7C384,192,480,224,576,229.3C672,235,768,213,864,197.3C960,181,1056,171,1152,181.3C1248,192,1344,224,1392,240L1440,256L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
            ],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.svg>
    </div>
  );
}

/* ───────────────────────── DATA ───────────────────────── */
const serviceTimes = [
  {
    day: "Sunday Morning",
    time: "9:00 AM & 11:00 AM",
    description: "Join us for worship, prayer, and a powerful message. Children's ministry available during both services.",
    icon: Church,
  },
  {
    day: "Wednesday Evening",
    time: "7:00 PM",
    description: "Midweek Bible study and prayer meeting. A time to dive deeper into God's Word together.",
    icon: BookOpen,
  },
  {
    day: "Youth Group",
    time: "Friday 6:30 PM",
    description: "A vibrant community for teens to grow in faith, build friendships, and have fun together.",
    icon: UsersThree,
  },
];

const beliefs = [
  { title: "The Gospel", description: "We believe in the transformative power of Jesus Christ and His saving grace for all people.", icon: Cross },
  { title: "God's Word", description: "The Bible is our foundation — the inspired, authoritative guide for faith and daily living.", icon: BookOpen },
  { title: "Love in Action", description: "We are called to love God and love others through compassion, service, and generosity.", icon: Heart },
  { title: "Community", description: "We grow together as a family of believers, supporting one another through every season of life.", icon: UsersThree },
  { title: "Prayer", description: "Prayer is the heartbeat of our church. We believe in the power of coming before God together.", icon: HandsPraying },
  { title: "The Holy Spirit", description: "We are led and empowered by the Holy Spirit, who guides, comforts, and transforms us daily.", icon: Bird },
];

const ministries = [
  { title: "Children's Ministry", description: "A safe, fun environment where kids discover God's love through age-appropriate teaching, worship, and activities.", icon: Baby },
  { title: "Youth Group", description: "Dynamic gatherings for teens to explore their faith, build lasting friendships, and grow as future leaders.", icon: UsersThree },
  { title: "Worship Team", description: "Musicians and vocalists leading our congregation into God's presence through modern and traditional worship.", icon: MusicNotes },
  { title: "Small Groups", description: "Intimate gatherings in homes throughout the week for Bible study, prayer, and authentic community.", icon: BookOpen },
  { title: "Outreach", description: "Serving our neighbors and the nations through local missions, food drives, and global partnerships.", icon: Handshake },
  { title: "Prayer Ministry", description: "Dedicated teams interceding for our church, community, and world. Join us in the power of prayer.", icon: HandsPraying },
];

const pastors = [
  { name: "Pastor David Thompson", role: "Lead Pastor", photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80", initials: "DT" },
  { name: "Pastor Maria Gonzalez", role: "Worship & Care Pastor", photo: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&q=80", initials: "MG" },
  { name: "Pastor James Mitchell", role: "Youth & Outreach Pastor", photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80", initials: "JM" },
];

const events = [
  { date: "Apr 13", title: "Easter Celebration Service", description: "A special morning of worship, music, and the Easter message. Invite your family and friends to celebrate the risen King." },
  { date: "Apr 20", title: "Community Potluck Lunch", description: "Stay after the 11 AM service for food, fellowship, and fun. Bring a dish to share and enjoy time with your church family." },
  { date: "May 3", title: "Women's Conference", description: "A full day of worship, teaching, and encouragement for women of all ages. Guest speaker Pastor Linda Hayes." },
  { date: "May 17", title: "Men's Breakfast", description: "Start your Saturday morning with a hearty breakfast and a powerful devotional. All men and young men welcome." },
];

const testimonials = [
  {
    name: "Rebecca & Mark S.",
    text: "When we moved to a new city, we felt lost. Walking through the doors of Grace Community, we immediately felt at home. This church became our family.",
  },
  {
    name: "James W.",
    text: "After going through the hardest season of my life, the small group I joined here carried me through. I found hope again and a community that truly cares.",
  },
  {
    name: "Angela D.",
    text: "My kids absolutely love Sunday mornings now. The children's ministry is incredible, and as a single mom, I finally feel supported and encouraged in my faith.",
  },
];

const galleryImages = [
  { src: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=600&q=80", alt: "Worship service" },
  { src: "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=600&q=80", alt: "Bible study" },
  { src: "https://images.unsplash.com/photo-1544427920-c49ccfb85579?w=600&q=80", alt: "Community gathering" },
  { src: "https://images.unsplash.com/photo-1494972308805-463bc619d34e?w=600&q=80", alt: "Church interior" },
];

/* ═══════════════════════════════════════════════════════════════════
   MAIN PAGE COMPONENT
   ═══════════════════════════════════════════════════════════════════ */
export default function V2ChurchPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <main
      className="relative min-h-[100dvh] overflow-x-hidden"
      style={{ background: NAVY, color: "#f1f5f9" }}
    >
      <FloatingParticles />

      {/* ─── NAV ─── */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={spring}
        className="fixed top-0 left-0 right-0 z-50"
      >
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-4">
          <GlassCard className="flex items-center justify-between px-4 md:px-6 py-3">
            <div className="flex items-center gap-2">
              <Cross size={24} weight="duotone" style={{ color: GOLD }} />
              <span className="text-lg font-bold tracking-tight text-white">
                Grace Community Church
              </span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
              <a href="#services" className="hover:text-white transition-colors">Services</a>
              <a href="#about" className="hover:text-white transition-colors">About</a>
              <a href="#ministries" className="hover:text-white transition-colors">Ministries</a>
              <a href="#visit" className="hover:text-white transition-colors">Visit Us</a>
            </div>
            <div className="flex items-center gap-3">
              <MagneticButton
                className="px-4 md:px-5 py-2 rounded-full text-sm font-semibold text-white transition-colors cursor-pointer"
                style={{ background: GOLD } as React.CSSProperties}
              >
                Plan Your Visit
              </MagneticButton>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
              >
                {mobileMenuOpen ? <X size={24} /> : <List size={24} />}
              </button>
            </div>
          </GlassCard>

          {/* Mobile Menu */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="md:hidden mt-2 overflow-hidden"
              >
                <GlassCard className="flex flex-col gap-1 px-4 py-4">
                  {[
                    { label: "Services", href: "#services" },
                    { label: "About", href: "#about" },
                    { label: "Ministries", href: "#ministries" },
                    { label: "Visit Us", href: "#visit" },
                  ].map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-3 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      {link.label}
                    </a>
                  ))}
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.nav>

      {/* ─── HERO ─── */}
      <section className="relative min-h-[100dvh] flex items-center pt-24 z-10 overflow-hidden">
        {/* Warm gradient background */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 80% 60% at 50% 30%, ${GOLD_GLOW} 0%, transparent 70%), radial-gradient(ellipse 60% 50% at 80% 70%, rgba(212,168,83,0.08) 0%, transparent 60%)`,
          }}
        />
        {/* Subtle cross pattern */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M28 0h4v28h28v4H32v28h-4V32H0v-4h28V0z' fill='%23d4a853' fill-opacity='1'/%3E%3C/svg%3E")`,
            backgroundSize: "60px 60px",
          }}
        />
        <div className="mx-auto max-w-7xl px-4 md:px-6 w-full text-center relative z-10">
          <div className="max-w-3xl mx-auto space-y-8">
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring, delay: 0.1 }}
              className="text-sm uppercase tracking-widest"
              style={{ color: GOLD }}
            >
              Grace Community Church
            </motion.p>
            <h1
              className="text-4xl md:text-7xl tracking-tighter leading-none font-bold text-white"
              style={{ textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}
            >
              <WordReveal text="A Place to Belong" />
            </h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring, delay: 0.6 }}
              className="text-lg md:text-xl text-slate-400 max-w-xl mx-auto leading-relaxed"
            >
              A welcoming community where faith comes alive, lives are transformed,
              and everyone has a place at the table.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring, delay: 0.8 }}
              className="flex flex-wrap justify-center gap-4"
            >
              <MagneticButton
                className="px-8 py-4 rounded-full text-base font-semibold text-white flex items-center gap-2 cursor-pointer"
                style={{ background: GOLD } as React.CSSProperties}
              >
                Plan Your Visit
                <ArrowRight size={18} weight="bold" />
              </MagneticButton>
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/10 flex items-center gap-2 cursor-pointer">
                <Church size={18} weight="duotone" />
                Watch Online
              </MagneticButton>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── SERVICE TIMES ─── */}
      <SectionReveal id="services" className="relative z-10 py-16 md:py-24">
        {/* Section background glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 50% 40% at 50% 0%, ${GOLD_GLOW} 0%, transparent 70%)`,
          }}
        />
        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GOLD }}>
              Join Us
            </p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Service Times" />
            </h2>
          </div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
          >
            {serviceTimes.map((svc, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="p-6 md:p-8 text-center h-full">
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-5"
                    style={{ background: GOLD_GLOW }}
                  >
                    <svc.icon size={28} weight="duotone" style={{ color: GOLD }} />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-1">{svc.day}</h3>
                  <p className="text-lg font-bold mb-3" style={{ color: GOLD }}>{svc.time}</p>
                  <p className="text-sm text-slate-400 leading-relaxed">{svc.description}</p>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── ABOUT / WELCOME ─── */}
      <SectionReveal id="about" className="relative z-10 py-16 md:py-24 overflow-hidden">
        <WaveBackground />
        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GOLD }}>
                Welcome Home
              </p>
              <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white mb-6">
                <WordReveal text="Our Story, Your Story" />
              </h2>
              <div className="space-y-4 text-slate-400 leading-relaxed">
                <p>
                  Grace Community Church was founded on a simple belief: everyone
                  deserves a place where they are known, loved, and free to grow.
                  For over 25 years, we have been a home for families, individuals,
                  and seekers alike.
                </p>
                <p>
                  Whether you are taking your first steps in faith or have walked
                  with God for decades, you will find a warm, authentic community
                  here. We gather not as perfect people, but as a family learning
                  to love like Jesus — imperfectly, passionately, and without
                  reservation.
                </p>
                <p>
                  From Sunday worship to midweek groups, from mission trips to
                  neighborhood potlucks, everything we do is rooted in the belief
                  that life is better together.
                </p>
              </div>
            </div>

            <motion.div
              className="grid grid-cols-2 gap-4"
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
            >
              {[
                { icon: Heart, label: "25+ Years", desc: "Serving our community" },
                { icon: UsersThree, label: "800+ Members", desc: "One church family" },
                { icon: HandsPraying, label: "12 Small Groups", desc: "Growing together" },
                { icon: Handshake, label: "Global Outreach", desc: "3 mission partners" },
              ].map((item, i) => (
                <motion.div key={i} variants={fadeUp}>
                  <GlassCard className="p-5 text-center">
                    <item.icon
                      size={28}
                      weight="duotone"
                      style={{ color: GOLD }}
                      className="mx-auto mb-2"
                    />
                    <p className="text-sm font-semibold text-white">{item.label}</p>
                    <p className="text-xs text-slate-400 mt-1">{item.desc}</p>
                  </GlassCard>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </SectionReveal>

      {/* ─── BELIEFS ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 60% 50% at 20% 50%, ${GOLD_GLOW} 0%, transparent 60%), radial-gradient(ellipse 40% 40% at 80% 80%, rgba(212,168,83,0.06) 0%, transparent 50%)`,
          }}
        />
        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GOLD }}>
              What We Believe
            </p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Rooted in Faith" />
            </h2>
          </div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
          >
            {beliefs.map((belief, i) => (
              <motion.div key={i} variants={fadeUp}>
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  transition={springGentle}
                  style={{ willChange: "transform" }}
                >
                  <GlassCard className="p-6 h-full">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                      style={{ background: GOLD_GLOW }}
                    >
                      <belief.icon size={24} weight="duotone" style={{ color: GOLD }} />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{belief.title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{belief.description}</p>
                  </GlassCard>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── MINISTRIES ─── */}
      <SectionReveal id="ministries" className="relative z-10 py-16 md:py-24">
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='40' cy='40' r='2' fill='%23d4a853'/%3E%3C/svg%3E")`,
            backgroundSize: "80px 80px",
          }}
        />
        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GOLD }}>
              Get Involved
            </p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Our Ministries" />
            </h2>
          </div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
          >
            {ministries.map((ministry, i) => (
              <motion.div key={i} variants={fadeUp}>
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  transition={springGentle}
                  style={{ willChange: "transform" }}
                >
                  <GlassCard className="p-6 h-full">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                      style={{ background: GOLD_GLOW }}
                    >
                      <ministry.icon size={24} weight="duotone" style={{ color: GOLD }} />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{ministry.title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{ministry.description}</p>
                  </GlassCard>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── PASTORS / LEADERSHIP ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 50% 50% at 70% 30%, ${GOLD_GLOW} 0%, transparent 60%)`,
          }}
        />
        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GOLD }}>
              Our Shepherds
            </p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Meet Our Pastors" />
            </h2>
          </div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
          >
            {pastors.map((pastor, i) => (
              <motion.div key={i} variants={fadeUp}>
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  transition={springGentle}
                  className="cursor-default"
                  style={{ willChange: "transform" }}
                >
                  <GlassCard className="p-6 text-center">
                    <div className="w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden border-2" style={{ borderColor: GOLD_GLOW }}>
                      <img
                        src={pastor.photo}
                        alt={pastor.name}
                        className="w-full h-full object-cover object-center"
                      />
                    </div>
                    <h3 className="text-lg font-semibold text-white">{pastor.name}</h3>
                    <p className="text-sm mt-1" style={{ color: GOLD }}>{pastor.role}</p>
                  </GlassCard>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── EVENTS CALENDAR ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24 overflow-hidden">
        <WaveBackground />
        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            <div className="lg:sticky lg:top-32">
              <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GOLD }}>
                Upcoming
              </p>
              <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white mb-6">
                <WordReveal text="Events & Gatherings" />
              </h2>
              <p className="text-slate-400 leading-relaxed max-w-md">
                There is always something happening at Grace Community. From special
                services to fellowship events, find your next opportunity to connect.
              </p>
            </div>

            <motion.div
              className="space-y-4"
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-50px" }}
            >
              {events.map((event, i) => (
                <motion.div key={i} variants={fadeUp}>
                  <GlassCard className="p-5 md:p-6 flex gap-5">
                    <div
                      className="w-16 h-16 rounded-xl flex flex-col items-center justify-center shrink-0"
                      style={{ background: GOLD_GLOW }}
                    >
                      <CalendarBlank size={18} weight="duotone" style={{ color: GOLD }} className="mb-0.5" />
                      <span className="text-xs font-bold" style={{ color: GOLD }}>{event.date}</span>
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-white mb-1">{event.title}</h3>
                      <p className="text-sm text-slate-400 leading-relaxed">{event.description}</p>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </SectionReveal>

      {/* ─── GIVING ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 60% 50% at 50% 50%, ${GOLD_GLOW} 0%, transparent 60%)`,
          }}
        />
        <div className="relative z-10 mx-auto max-w-4xl px-4 md:px-6">
          <ShimmerBorder>
            <div className="p-8 md:p-12 text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={spring}
              >
                <HandsPraying size={48} weight="duotone" style={{ color: GOLD }} className="mx-auto mb-4" />
                <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GOLD }}>
                  Generosity
                </p>
                <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white mb-4">
                  Give with a Grateful Heart
                </h2>
                <p className="text-slate-400 text-lg mb-2 max-w-lg mx-auto">
                  Your generosity fuels our mission to serve this community and share
                  the love of Christ with the world.
                </p>
                <p className="text-slate-500 text-sm mb-8 max-w-md mx-auto">
                  Every gift — no matter the size — makes a lasting impact. Tithes and
                  offerings support our ministries, missions, and outreach programs.
                </p>
                <MagneticButton
                  className="px-10 py-4 rounded-full text-base font-semibold text-white inline-flex items-center gap-2 cursor-pointer"
                  style={{ background: GOLD } as React.CSSProperties}
                >
                  <Heart size={20} weight="duotone" />
                  Give Online
                </MagneticButton>
              </motion.div>
            </div>
          </ShimmerBorder>
        </div>
      </SectionReveal>

      {/* ─── TESTIMONIALS ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 50% 40% at 30% 60%, rgba(212,168,83,0.08) 0%, transparent 60%)`,
          }}
        />
        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GOLD }}>
              Stories of Faith
            </p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Lives Transformed" />
            </h2>
          </div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
          >
            {testimonials.map((t, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="p-6 h-full flex flex-col">
                  <Quotes size={28} weight="fill" style={{ color: GOLD }} className="mb-3 opacity-50" />
                  <p className="text-slate-300 leading-relaxed flex-1 text-sm">
                    {t.text}
                  </p>
                  <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                    <span className="text-sm font-semibold text-white">{t.name}</span>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Star key={j} size={12} weight="fill" style={{ color: GOLD }} />
                      ))}
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── GALLERY ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M28 0h4v28h28v4H32v28h-4V32H0v-4h28V0z' fill='%23d4a853' fill-opacity='1'/%3E%3C/svg%3E")`,
            backgroundSize: "60px 60px",
          }}
        />
        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GOLD }}>
              Church Life
            </p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="See Our Community" />
            </h2>
          </div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
          >
            {galleryImages.map((img, i) => (
              <motion.div key={i} variants={fadeUp}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={springGentle}
                  className="overflow-hidden rounded-2xl border border-white/10"
                  style={{ willChange: "transform" }}
                >
                  <img
                    src={img.src}
                    alt={img.alt}
                    className="w-full h-56 md:h-72 object-cover"
                  />
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── LOCATION / MAP ─── */}
      <SectionReveal id="visit" className="relative z-10 py-16 md:py-24">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 50% 50% at 50% 50%, ${GOLD_GLOW} 0%, transparent 60%)`,
          }}
        />
        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GOLD }}>
                Come As You Are
              </p>
              <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white mb-6">
                <WordReveal text="Plan Your Visit" />
              </h2>
              <p className="text-slate-400 leading-relaxed max-w-md mb-8">
                We would love to meet you. Whether it is your first time visiting a
                church or you are looking for a new home church, you are welcome here.
                Come as you are — we will save you a seat.
              </p>
              <div className="flex flex-wrap gap-4">
                <MagneticButton
                  className="px-10 py-4 rounded-full text-base font-semibold text-white inline-flex items-center gap-2 cursor-pointer"
                  style={{ background: GOLD } as React.CSSProperties}
                >
                  <MapPin size={20} weight="duotone" />
                  Get Directions
                </MagneticButton>
                <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/10 flex items-center gap-2 cursor-pointer">
                  <Phone size={18} weight="duotone" />
                  Call Us
                </MagneticButton>
              </div>
            </div>

            <GlassCard className="p-8">
              <h3 className="text-xl font-semibold text-white mb-6">Visit Information</h3>
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <MapPin size={20} weight="duotone" style={{ color: GOLD }} className="mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-white">Address</p>
                    <p className="text-sm text-slate-400">
                      4521 Faith Avenue
                      <br />
                      Springfield, IL 62704
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Phone size={20} weight="duotone" style={{ color: GOLD }} className="mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-white">Phone</p>
                    <p className="text-sm text-slate-400">(555) 821-3456</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Envelope size={20} weight="duotone" style={{ color: GOLD }} className="mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-white">Email</p>
                    <p className="text-sm text-slate-400">hello@gracecommunitychurch.org</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Clock size={20} weight="duotone" style={{ color: GOLD }} className="mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-white">Service Times</p>
                    <p className="text-sm text-slate-400">
                      Sunday: 9:00 AM & 11:00 AM
                      <br />
                      Wednesday: 7:00 PM
                      <br />
                      Friday Youth: 6:30 PM
                    </p>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </SectionReveal>

      {/* ─── FOOTER ─── */}
      <footer className="relative z-10 border-t border-white/5 py-10">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Cross size={20} weight="duotone" style={{ color: GOLD }} />
                <span className="text-lg font-bold text-white">Grace Community Church</span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">
                A welcoming community where faith comes alive and everyone has a place to belong.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-3">Quick Links</h4>
              <div className="space-y-2 text-sm text-slate-500">
                <a href="#services" className="block hover:text-white transition-colors">Service Times</a>
                <a href="#about" className="block hover:text-white transition-colors">About Us</a>
                <a href="#ministries" className="block hover:text-white transition-colors">Ministries</a>
                <a href="#visit" className="block hover:text-white transition-colors">Plan Your Visit</a>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-3">Connect</h4>
              <div className="space-y-2 text-sm text-slate-500">
                <p>(555) 821-3456</p>
                <p>hello@gracecommunitychurch.org</p>
                <p>4521 Faith Avenue, Springfield, IL</p>
              </div>
            </div>
          </div>
          <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Cross size={16} weight="duotone" style={{ color: GOLD }} />
              <span>Grace Community Church &copy; {new Date().getFullYear()}</span>
            </div>
            <p className="text-xs text-slate-600">
              Website created by Bluejay Business Solutions
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
