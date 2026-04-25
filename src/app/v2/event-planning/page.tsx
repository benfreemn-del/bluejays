/* eslint-disable @next/next/no-img-element -- Static marketing showcase uses plain img tags intentionally */
/* eslint-disable react-hooks/purity -- Decorative particle values randomized for static visual effects */

"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useInView,
  AnimatePresence,
} from "framer-motion";
import {
  Star,
  ShieldCheck,
  CaretDown,
  Phone,
  MapPin,
  Clock,
  ArrowRight,
  Quotes,
  X,
  List,
  Sparkle,
  CalendarCheck,
  Users,
  Timer,
  Medal,
  Certificate,
  CheckCircle,
  Champagne,
  Crown,
  Buildings,
  Handshake,
  Heart,
  Gift,
  Rocket,
  Trophy,
  Flower,
  MusicNotes,
  Envelope,
  CaretRight,
  Lightning,
} from "@phosphor-icons/react";

/* ───────────────────────── SPRING CONFIG ───────────────────────── */
const spring = { type: "spring" as const, stiffness: 100, damping: 20 };
const springFast = { type: "spring" as const, stiffness: 200, damping: 25 };

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: spring },
};

/* ───────────────────────── COLORS ───────────────────────── */
const BG = "#0a0a0a";
const BG_CARD = "#111111";
const GOLD = "#d4a853";
const GOLD_LIGHT = "#e8c87a";
const GOLD_GLOW = "rgba(212, 168, 83, 0.12)";
const GOLD_GLOW_STRONG = "rgba(212, 168, 83, 0.25)";

/* ───────────────────────── NAV ICON ───────────────────────── */
function EventIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path d="M16 2L20 12L30 16L20 20L16 30L12 20L2 16L12 12L16 2Z" fill={GOLD} fillOpacity="0.15" stroke={GOLD} strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="16" cy="16" r="4" fill={GOLD} fillOpacity="0.3" />
      <path d="M16 6L18 12L24 14L18 16L16 22L14 16L8 14L14 12L16 6Z" fill={GOLD_LIGHT} fillOpacity="0.5" />
    </svg>
  );
}

/* ───────────────────────── BOKEH HERO BACKGROUND ───────────────────────── */
function BokehBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Base dark */}
      <div className="absolute inset-0" style={{ background: BG }} />
      {/* Animated radial gradients simulating moving gala lights */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 600px 600px at 20% 30%, rgba(212,168,83,0.15), transparent 70%),
            radial-gradient(ellipse 400px 400px at 70% 60%, rgba(212,168,83,0.1), transparent 60%),
            radial-gradient(ellipse 300px 300px at 50% 80%, rgba(232,200,122,0.08), transparent 50%)
          `,
          willChange: "background",
        }}
        animate={{
          background: [
            `radial-gradient(ellipse 600px 600px at 20% 30%, rgba(212,168,83,0.15), transparent 70%),
             radial-gradient(ellipse 400px 400px at 70% 60%, rgba(212,168,83,0.1), transparent 60%),
             radial-gradient(ellipse 300px 300px at 50% 80%, rgba(232,200,122,0.08), transparent 50%)`,
            `radial-gradient(ellipse 600px 600px at 60% 50%, rgba(212,168,83,0.18), transparent 70%),
             radial-gradient(ellipse 400px 400px at 30% 20%, rgba(212,168,83,0.12), transparent 60%),
             radial-gradient(ellipse 300px 300px at 80% 70%, rgba(232,200,122,0.1), transparent 50%)`,
            `radial-gradient(ellipse 600px 600px at 40% 70%, rgba(212,168,83,0.12), transparent 70%),
             radial-gradient(ellipse 400px 400px at 80% 30%, rgba(212,168,83,0.15), transparent 60%),
             radial-gradient(ellipse 300px 300px at 20% 50%, rgba(232,200,122,0.08), transparent 50%)`,
            `radial-gradient(ellipse 600px 600px at 20% 30%, rgba(212,168,83,0.15), transparent 70%),
             radial-gradient(ellipse 400px 400px at 70% 60%, rgba(212,168,83,0.1), transparent 60%),
             radial-gradient(ellipse 300px 300px at 50% 80%, rgba(232,200,122,0.08), transparent 50%)`,
          ],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
      />
      {/* Bokeh circles */}
      {[
        { size: 200, x: "15%", y: "25%", delay: 0, dur: 8 },
        { size: 140, x: "72%", y: "35%", delay: 2, dur: 10 },
        { size: 100, x: "45%", y: "70%", delay: 4, dur: 7 },
        { size: 160, x: "85%", y: "65%", delay: 1, dur: 9 },
        { size: 120, x: "30%", y: "55%", delay: 3, dur: 11 },
        { size: 80, x: "60%", y: "20%", delay: 5, dur: 8 },
      ].map((b, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: b.size,
            height: b.size,
            left: b.x,
            top: b.y,
            background: `radial-gradient(circle, rgba(212,168,83,${0.04 + i * 0.01}), transparent 70%)`,
            filter: "blur(30px)",
            willChange: "transform, opacity",
          }}
          animate={{
            x: [0, 30, -20, 0],
            y: [0, -25, 15, 0],
            opacity: [0.3, 0.6, 0.4, 0.3],
          }}
          transition={{
            duration: b.dur,
            repeat: Infinity,
            delay: b.delay,
            ease: "easeInOut",
          }}
        />
      ))}
      {/* Subtle noise overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E\")" }} />
    </div>
  );
}

/* ───────────────────────── SPARKLE PARTICLES ───────────────────────── */
function GoldSparkles() {
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 15,
    duration: 8 + Math.random() * 8,
    size: 1 + Math.random() * 2.5,
    opacity: 0.08 + Math.random() * 0.15,
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
            boxShadow: `0 0 ${p.size * 3}px ${GOLD}`,
            willChange: "transform, opacity",
          }}
          animate={{
            y: ["110vh", "-10vh"],
            opacity: [0, p.opacity, p.opacity, 0],
          }}
          transition={{
            y: { duration: p.duration, repeat: Infinity, delay: p.delay, ease: "linear" },
            opacity: { duration: p.duration, repeat: Infinity, delay: p.delay, times: [0, 0.1, 0.9, 1] },
          }}
        />
      ))}
    </div>
  );
}

/* ───────────────────────── SHARED COMPONENTS ───────────────────────── */
function WordReveal({ text, className = "" }: { text: string; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const words = text.split(" ");
  return (
    <motion.span ref={ref} className={`inline-flex flex-wrap gap-x-3 ${className}`} variants={stagger} initial="hidden" animate={isInView ? "show" : "hidden"}>
      {words.map((word, i) => (<motion.span key={i} variants={fadeUp} className="inline-block">{word}</motion.span>))}
    </motion.span>
  );
}

function SectionReveal({ children, className = "", id }: { children: React.ReactNode; className?: string; id?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.section ref={ref} id={id} className={className} initial={{ opacity: 0, y: 50 }} animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }} transition={spring}>
      {children}
    </motion.section>
  );
}

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-white/[0.13] bg-white/[0.08] backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)] ${className}`}>
      {children}
    </div>
  );
}

function MagneticButton({ children, className = "", onClick, style }: { children: React.ReactNode; className?: string; onClick?: () => void; style?: React.CSSProperties }) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, springFast);
  const springY = useSpring(y, springFast);
  const isTouchDevice = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current || isTouchDevice) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - (rect.left + rect.width / 2)) * 0.25);
    y.set((e.clientY - (rect.top + rect.height / 2)) * 0.25);
  }, [x, y, isTouchDevice]);
  const handleMouseLeave = useCallback(() => { x.set(0); y.set(0); }, [x, y]);
  return (
    <motion.button ref={ref} style={{ x: springX, y: springY, willChange: "transform", ...style }} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} onClick={onClick} className={className} whileTap={{ scale: 0.97 }}>
      {children}
    </motion.button>
  );
}

function ShimmerBorder({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative rounded-2xl p-[1px] overflow-hidden ${className}`}>
      <motion.div className="absolute inset-0 rounded-2xl" style={{ background: `conic-gradient(from 0deg, transparent, ${GOLD}, transparent, ${GOLD_LIGHT}, transparent)`, willChange: "transform" }} animate={{ rotate: [0, 360] }} transition={{ duration: 5, repeat: Infinity, ease: "linear" }} />
      <div className="relative rounded-2xl z-10" style={{ background: BG }}>{children}</div>
    </div>
  );
}

/* ───────────────────────── DATA ───────────────────────── */
const eventTypes = [
  { title: "Weddings", description: "From intimate elopements to lavish ballroom affairs, we craft every detail of your love story into an unforgettable celebration.", icon: Heart, image: "https://images.unsplash.com/photo-1525772764200-be829a350797?w=600&q=80" },
  { title: "Corporate Galas", description: "Black-tie fundraisers, award ceremonies, and annual galas that elevate your brand and leave lasting impressions on every guest.", icon: Buildings, image: "https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=600&q=80" },
  { title: "Private Parties", description: "Milestone birthdays, anniversaries, and intimate soirees designed around your personality and your guest list.", icon: Gift, image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600&q=80" },
  { title: "Non-Profit Fundraisers", description: "Charity galas, silent auctions, and benefit dinners that inspire generosity and maximize your mission's impact.", icon: Handshake, image: "https://images.unsplash.com/photo-1530023367847-a683933f4172?w=600&q=80" },
  { title: "Product Launches", description: "High-energy brand reveals, media events, and experiential activations that generate buzz and media coverage.", icon: Rocket, image: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=600&q=80" },
  { title: "Birthdays & Anniversaries", description: "Milestone birthdays, anniversaries, and once-in-a-lifetime occasions that deserve a truly spectacular celebration.", icon: Trophy, image: "https://images.unsplash.com/photo-1464347744102-11db6282f854?w=600&q=80" },
];

const planningProcess = [
  { step: "01", title: "Vision", subtitle: "Discovery Session", desc: "We sit down together to uncover your dream, your style, your must-haves, and your budget. Every great event starts with a conversation." },
  { step: "02", title: "Design", subtitle: "Creative Concept", desc: "Our design team crafts a bespoke concept complete with mood boards, floor plans, color palettes, and a curated vendor shortlist." },
  { step: "03", title: "Coordinate", subtitle: "Vendor Management", desc: "We negotiate contracts, manage timelines, coordinate logistics, and handle every moving piece so you never have to." },
  { step: "04", title: "Execute", subtitle: "Flawless Delivery", desc: "On event day, our production team oversees setup, manages vendors, troubleshoots in real-time, and ensures perfection." },
  { step: "05", title: "Celebrate", subtitle: "Your Moment", desc: "You enjoy every second of your event knowing that every detail has been handled. Afterwards, we wrap up vendor payments and deliverables." },
];

const venues = [
  { name: "The Fairmont Olympic", type: "Historic Ballroom", capacity: "500 guests", image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=500&q=80" },
  { name: "Downtown Loft", type: "Urban Patio Venue", capacity: "300 guests", image: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=500&q=80" },
  { name: "The Waterfront", type: "Hotel Ballroom", capacity: "250 guests", image: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=500&q=80" },
  { name: "Lakeside Pavilion", type: "Outdoor Reception", capacity: "150 guests", image: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=500&q=80" },
  { name: "Sodo Park", type: "Industrial Loft", capacity: "400 guests", image: "https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=500&q=80" },
  { name: "The Ruins", type: "Garden Estate", capacity: "200 guests", image: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=500&q=80" },
];

const packages = [
  { tier: "Intimate", price: "$5,000", desc: "Perfect for smaller gatherings up to 50 guests", features: ["Dedicated planner", "Venue selection assistance", "Vendor recommendations", "Day-of coordination", "2-hour rehearsal", "Timeline management"], highlight: false },
  { tier: "Grand", price: "$15,000", desc: "Full-service planning for events up to 200 guests", features: ["Lead planner + assistant", "Full vendor management", "Custom design concept", "Budget management", "Rehearsal + event day", "Guest experience design", "Post-event wrap-up"], highlight: true },
  { tier: "Luxury", price: "$30,000+", desc: "White-glove service for extraordinary occasions", features: ["Senior planner team", "Unlimited consultations", "Bespoke design & decor", "Destination coordination", "Multi-day event support", "Concierge guest services", "Floral & lighting design", "Live entertainment booking"], highlight: false },
];

const portfolioImages = [
  { src: "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=700&q=80", label: "Waterfront Wedding" },
  { src: "https://images.unsplash.com/photo-1571645163064-77faa9676a46?w=700&q=80", label: "Conference" },
  { src: "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=700&q=80", label: "Cocktail Reception" },
  { src: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=700&q=80", label: "Celebration Moment" },
  { src: "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=700&q=80", label: "Product Launch" },
  { src: "https://images.unsplash.com/photo-1551818255-e6e10975bc17?w=700&q=80", label: "Milestone Celebration" },
];

const testimonials = [
  { name: "Amanda & Brian K.", role: "Wedding Couple", text: "Sophia and James turned our dream wedding into reality. Every detail was perfect, from the floral arrangements to the surprise fireworks. Our guests are still talking about it six months later.", rating: 5 },
  { name: "David Chen", role: "CEO, Apex Technologies", text: "Elevate handled our 500-person product launch flawlessly. The branding integration, media coordination, and guest experience were world-class. Our board was incredibly impressed.", rating: 5 },
  { name: "Rachel & Marcus T.", role: "Anniversary Celebration", text: "For our 25th anniversary, Sophia recreated elements from our original wedding with a modern twist. We laughed, we cried, and we danced until midnight. Absolutely magical.", rating: 5 },
  { name: "Katherine Yamada", role: "Director, Seattle Children's Fund", text: "Our annual fundraiser raised 40% more than last year thanks to Elevate's event design and donor experience strategy. They understand that every detail drives the mission forward.", rating: 5 },
];

const quizOptions = [
  { label: "Wedding", icon: Heart, color: "#f0abcf", reco: "Our wedding packages start at $5,000 for intimate ceremonies and scale to full destination experiences." },
  { label: "Corporate Event", icon: Buildings, color: "#7ec8e3", reco: "We specialize in corporate galas, product launches, and conferences. Let's discuss your brand vision." },
  { label: "Private Party", icon: Champagne, color: "#d4a853", reco: "From milestone birthdays to elegant dinner parties, we create celebrations as unique as you are." },
];

const comparisonRows = [
  { feature: "Dedicated planning team", us: true, them: "No" },
  { feature: "Vendor negotiation & management", us: true, them: "DIY" },
  { feature: "Custom design concepts", us: true, them: "Templates" },
  { feature: "Day-of coordination", us: true, them: "You manage" },
  { feature: "Budget tracking & optimization", us: true, them: "Spreadsheets" },
  { feature: "Emergency contingency plans", us: true, them: "Hope for best" },
  { feature: "Post-event wrap-up & payments", us: true, them: "You handle" },
];

const dayOfTimeline = [
  { time: "7:00 AM", task: "Venue access & setup begins", icon: Clock },
  { time: "10:00 AM", task: "Floral & decor installation", icon: Flower },
  { time: "12:00 PM", task: "Vendor check-in & sound check", icon: MusicNotes },
  { time: "2:00 PM", task: "Final walkthrough with client", icon: CheckCircle },
  { time: "4:00 PM", task: "Guest arrival & welcome experience", icon: Champagne },
  { time: "11:00 PM", task: "Grand finale & elegant send-off", icon: Sparkle },
];

const teamMembers = [
  { name: "Sophia Park", title: "Co-Founder & Lead Planner", bio: "15 years in luxury events. Former Four Seasons events director. CSEP certified with a passion for creating breathtaking celebrations.", image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&q=80" },
  { name: "James Park", title: "Co-Founder & Creative Director", bio: "Former Four Seasons events team. CMP certified with expertise in venue design, lighting architecture, and immersive guest experiences.", image: "https://images.unsplash.com/photo-1595152772835-219674b2a8a6?w=400&q=80" },
];

const vendorCategories = [
  { name: "Florists", count: 12 }, { name: "Caterers", count: 18 }, { name: "Photographers", count: 15 },
  { name: "Bands & DJs", count: 10 }, { name: "Lighting Designers", count: 8 }, { name: "Rental Companies", count: 14 },
  { name: "Bakeries", count: 9 }, { name: "Invitation Designers", count: 7 },
];

const certifications = [
  "CSEP Certified", "CMP Certified", "The Knot Best of Weddings", "WeddingWire Couples' Choice",
  "BBB A+ Accredited", "Licensed & Insured", "ILEA Member", "5-Star Google Rated",
];

/* ───────────────────────── MAIN PAGE ───────────────────────── */
export default function V2EventPlanningPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  /* Auto-rotate testimonials */
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden" style={{ background: BG, color: "#f1f0ec" }}>
      <GoldSparkles />

      {/* ═══════════════════════ NAV ═══════════════════════ */}
      <motion.nav initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-4">
          <GlassCard className="flex items-center justify-between px-4 md:px-6 py-3">
            <div className="flex items-center gap-2">
              <EventIcon size={24} />
              <span className="text-lg font-bold tracking-tight text-white" style={{ fontFamily: "'Georgia', serif" }}>Elevate Events</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
              {[
                { label: "Events", href: "#events" },
                { label: "Process", href: "#process" },
                { label: "Gallery", href: "#gallery" },
                { label: "Packages", href: "#packages" },
                { label: "Reviews", href: "#testimonials" },
              ].map((link) => (
                <a key={link.label} href={link.href} className="hover:text-white transition-colors">{link.label}</a>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <MagneticButton className="px-5 py-2 rounded-full text-sm font-semibold text-white transition-colors cursor-pointer" style={{ background: GOLD } as React.CSSProperties}>
                Start Planning
              </MagneticButton>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors">
                {mobileMenuOpen ? <X size={24} /> : <List size={24} />}
              </button>
            </div>
          </GlassCard>
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3, ease: "easeInOut" }} className="md:hidden mt-2 overflow-hidden">
                <GlassCard className="flex flex-col gap-1 px-4 py-4">
                  {[
                    { label: "Events", href: "#events" },
                    { label: "Process", href: "#process" },
                    { label: "Gallery", href: "#gallery" },
                    { label: "Packages", href: "#packages" },
                    { label: "Reviews", href: "#testimonials" },
                  ].map((link) => (
                    <a key={link.label} href={link.href} onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors">{link.label}</a>
                  ))}
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.nav>

      {/* ═══════════════════════ 1. HERO — THE GALA ENTRANCE ═══════════════════════ */}
      <section className="relative min-h-[100dvh] flex items-center justify-center pt-24 z-10">
        <BokehBackground />
        {/* Gold vignette at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-40 z-[1]" style={{ background: `linear-gradient(to top, ${BG}, transparent)` }} />
        <div className="relative z-10 mx-auto max-w-5xl px-4 md:px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.2 }} className="mb-6">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs uppercase tracking-widest border" style={{ color: GOLD, borderColor: `${GOLD}33`, background: GOLD_GLOW }}>
              <Sparkle size={14} weight="fill" /> Sophia & James Park, Seattle
            </span>
          </motion.div>
          <h1 className="mb-4" style={{ fontFamily: "'Georgia', serif" }}>
            <motion.span initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.4 }} className="block text-5xl md:text-8xl font-normal tracking-tight text-white leading-[0.95]">
              Unforgettable Moments
            </motion.span>
            <motion.span initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.6 }} className="block text-2xl md:text-4xl font-light mt-3 tracking-wide" style={{ color: GOLD_LIGHT }}>
              Flawlessly Executed
            </motion.span>
          </h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.8 }} className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            For 15 years, Elevate Events has designed and produced Seattle&apos;s most celebrated weddings, galas, and private occasions with meticulous attention to every detail.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 1.0 }} className="flex flex-wrap justify-center gap-4">
            <MagneticButton className="px-10 py-4 rounded-full text-base font-semibold text-white flex items-center gap-2 cursor-pointer shadow-lg" style={{ background: GOLD, boxShadow: `0 0 40px ${GOLD_GLOW_STRONG}` } as React.CSSProperties}>
              Start Planning <ArrowRight size={18} weight="bold" />
            </MagneticButton>
            <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/15 flex items-center gap-2 cursor-pointer backdrop-blur-sm">
              <Phone size={18} weight="duotone" /> (206) 555-0915
            </MagneticButton>
          </motion.div>
          {/* Gold sparkle accents flanking the CTA */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2, duration: 1.5 }} className="flex justify-center gap-16 mt-8">
            {[0, 1, 2].map((i) => (
              <motion.div key={i} animate={{ opacity: [0.3, 0.8, 0.3], scale: [1, 1.3, 1] }} transition={{ duration: 2 + i * 0.5, repeat: Infinity, ease: "easeInOut" }}>
                <Sparkle size={16} weight="fill" style={{ color: GOLD_LIGHT }} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════ 2. TRUST BAR ═══════════════════════ */}
      <SectionReveal className="relative z-10 -mt-8 pb-8">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <GlassCard className="p-6 md:p-8">
            <motion.div className="grid grid-cols-2 sm:grid-cols-4 gap-6 md:gap-8" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
              {[
                { icon: Star, label: "5-Star Rated", desc: "The Knot & WeddingWire" },
                { icon: Timer, label: "15+ Years", desc: "Former Four Seasons team" },
                { icon: Certificate, label: "CSEP & CMP", desc: "Dual certified planners" },
                { icon: Medal, label: "500+ Events", desc: "Flawlessly produced" },
              ].map((stat, i) => (
                <motion.div key={i} variants={fadeUp} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: GOLD_GLOW }}>
                    <stat.icon size={20} weight="duotone" style={{ color: GOLD }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{stat.label}</p>
                    <p className="text-xs text-slate-400">{stat.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </GlassCard>
        </div>
      </SectionReveal>

      {/* ═══════════════════════ 3. EVENT TYPES ═══════════════════════ */}
      <SectionReveal id="events" className="relative z-10 py-16 md:py-24">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `radial-gradient(${GOLD} 1px, transparent 1px)`, backgroundSize: "40px 40px" }} />
        <div className="relative mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GOLD }}>What We Create</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white" style={{ fontFamily: "'Georgia', serif" }}>
              <WordReveal text="Events We Specialize In" />
            </h2>
          </div>
          <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {eventTypes.map((evt, i) => (
              <motion.div key={i} variants={fadeUp} className="group">
                <GlassCard className="overflow-hidden h-full">
                  <div className="aspect-[16/10] overflow-hidden relative">
                    <img src={evt.image} alt={evt.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${BG}ee 0%, transparent 60%)` }} />
                    <div className="absolute bottom-4 left-4 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: GOLD_GLOW_STRONG }}>
                        <evt.icon size={16} weight="duotone" style={{ color: GOLD }} />
                      </div>
                      <h3 className="text-lg font-semibold text-white">{evt.title}</h3>
                    </div>
                  </div>
                  <div className="p-5">
                    <p className="text-sm text-slate-400 leading-relaxed">{evt.description}</p>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ═══════════════════════ 4. PLANNING PROCESS (5 steps) ═══════════════════════ */}
      <SectionReveal id="process" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GOLD }}>Our Process</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white" style={{ fontFamily: "'Georgia', serif" }}>
              <WordReveal text="Vision to Celebration" />
            </h2>
          </div>
          <div className="relative">
            {/* Vertical connector line */}
            <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px hidden md:block" style={{ background: `linear-gradient(to bottom, transparent, ${GOLD}44, ${GOLD}44, transparent)` }} />
            <motion.div className="space-y-8 md:space-y-12" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
              {planningProcess.map((step, i) => (
                <motion.div key={i} variants={fadeUp} className={`relative flex flex-col md:flex-row items-start gap-6 ${i % 2 === 1 ? "md:flex-row-reverse" : ""}`}>
                  {/* Step number bubble */}
                  <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-12 h-12 rounded-full items-center justify-center text-sm font-bold z-10 border-2" style={{ background: BG, borderColor: GOLD, color: GOLD }}>
                    {step.step}
                  </div>
                  {/* Content card */}
                  <div className={`w-full md:w-[calc(50%-40px)] ${i % 2 === 0 ? "md:pr-0" : "md:pl-0"}`}>
                    <GlassCard className="p-6 md:p-8">
                      <div className="flex items-center gap-3 mb-3 md:hidden">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: GOLD, color: "white" }}>{step.step}</div>
                        <p className="text-xs uppercase tracking-widest" style={{ color: GOLD }}>{step.subtitle}</p>
                      </div>
                      <p className="text-xs uppercase tracking-widest mb-2 hidden md:block" style={{ color: GOLD }}>{step.subtitle}</p>
                      <h3 className="text-xl md:text-2xl font-bold text-white mb-3" style={{ fontFamily: "'Georgia', serif" }}>{step.title}</h3>
                      <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
                    </GlassCard>
                  </div>
                  {/* Spacer for the other side */}
                  <div className="hidden md:block w-[calc(50%-40px)]" />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </SectionReveal>

      {/* ═══════════════════════ 5. VENUE PARTNERSHIPS ═══════════════════════ */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, transparent 0%, ${GOLD_GLOW} 50%, transparent 100%)` }} />
        <div className="relative mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GOLD }}>Preferred Venues</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white" style={{ fontFamily: "'Georgia', serif" }}>
              <WordReveal text="Seattle's Finest Venues" />
            </h2>
            <p className="text-slate-400 mt-4 max-w-xl mx-auto">Our partnerships with Seattle's premier venues mean preferred pricing, priority dates, and seamless coordination for your event.</p>
          </div>
          <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {venues.map((venue, i) => (
              <motion.div key={i} variants={fadeUp} className="group">
                <div className="aspect-[4/3] rounded-2xl overflow-hidden relative">
                  <img src={venue.image} alt={venue.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${BG}ee 0%, ${BG}66 40%, transparent 100%)` }} />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-lg font-semibold text-white">{venue.name}</h3>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-slate-300">{venue.type}</p>
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: GOLD_GLOW, color: GOLD }}>{venue.capacity}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ═══════════════════════ 6. PRICING PACKAGES ═══════════════════════ */}
      <SectionReveal id="packages" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GOLD }}>Investment</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white" style={{ fontFamily: "'Georgia', serif" }}>
              <WordReveal text="Planning Packages" />
            </h2>
          </div>
          <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {packages.map((pkg, i) => (
              <motion.div key={i} variants={fadeUp} className="h-full">
                {pkg.highlight ? (
                  <ShimmerBorder className="h-full">
                    <div className="p-8 h-full flex flex-col">
                      <div className="flex items-center gap-2 mb-2">
                        <Crown size={18} weight="fill" style={{ color: GOLD }} />
                        <span className="text-xs uppercase tracking-widest font-semibold" style={{ color: GOLD }}>Most Popular</span>
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "'Georgia', serif" }}>{pkg.tier}</h3>
                      <p className="text-3xl font-bold mb-2" style={{ color: GOLD }}>{pkg.price}</p>
                      <p className="text-sm text-slate-400 mb-6">{pkg.desc}</p>
                      <ul className="space-y-3 flex-1">
                        {pkg.features.map((f, j) => (
                          <li key={j} className="flex items-center gap-3 text-sm text-slate-300">
                            <CheckCircle size={16} weight="fill" style={{ color: GOLD }} className="shrink-0" />{f}
                          </li>
                        ))}
                      </ul>
                      <MagneticButton className="mt-8 w-full py-3 rounded-full text-sm font-semibold text-white cursor-pointer" style={{ background: GOLD } as React.CSSProperties}>
                        Get Started
                      </MagneticButton>
                    </div>
                  </ShimmerBorder>
                ) : (
                  <GlassCard className="p-8 h-full flex flex-col">
                    <h3 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "'Georgia', serif" }}>{pkg.tier}</h3>
                    <p className="text-3xl font-bold mb-2" style={{ color: GOLD }}>{pkg.price}</p>
                    <p className="text-sm text-slate-400 mb-6">{pkg.desc}</p>
                    <ul className="space-y-3 flex-1">
                      {pkg.features.map((f, j) => (
                        <li key={j} className="flex items-center gap-3 text-sm text-slate-300">
                          <CheckCircle size={16} weight="duotone" style={{ color: GOLD }} className="shrink-0" />{f}
                        </li>
                      ))}
                    </ul>
                    <MagneticButton className="mt-8 w-full py-3 rounded-full text-sm font-semibold text-white border border-white/15 cursor-pointer">
                      Learn More
                    </MagneticButton>
                  </GlassCard>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ═══════════════════════ 7. PORTFOLIO GALLERY ═══════════════════════ */}
      <SectionReveal id="gallery" className="relative z-10 py-16 md:py-24">
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: `radial-gradient(${GOLD} 1px, transparent 1px)`, backgroundSize: "30px 30px" }} />
        <div className="relative mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GOLD }}>Our Work</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white" style={{ fontFamily: "'Georgia', serif" }}>
              <WordReveal text="Portfolio" />
            </h2>
          </div>
          <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {portfolioImages.map((img, i) => (
              <motion.div key={i} variants={fadeUp} className="group aspect-[4/3] rounded-xl overflow-hidden relative cursor-pointer">
                <img src={img.src} alt={img.label} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-500" />
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                  <p className="text-sm font-semibold text-white">{img.label}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ═══════════════════════ 8. ABOUT — THE STORY ═══════════════════════ */}
      <SectionReveal id="about" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GOLD }}>Our Story</p>
              <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white mb-6" style={{ fontFamily: "'Georgia', serif" }}>
                <WordReveal text="Passion Meets Precision" />
              </h2>
              <p className="text-slate-400 leading-relaxed mb-4">
                Sophia and James Park spent a decade on the Four Seasons events team, producing over 300 luxury weddings, galas, and corporate events before founding Elevate Events in 2011. Their philosophy is simple: every event should feel as magical for the hosts as it does for the guests.
              </p>
              <p className="text-slate-400 leading-relaxed mb-4">
                Based in downtown Seattle, their boutique studio takes on a limited number of events each year to ensure every client receives the white-glove attention they deserve. With dual CSEP and CMP certifications and relationships with over 100 premium vendors, they bring an unmatched level of expertise to every celebration.
              </p>
              <p className="text-slate-400 leading-relaxed">
                From a 30-person rooftop dinner party to a 500-guest charity gala, Elevate Events treats every event as a once-in-a-lifetime occasion, because for their clients, it truly is.
              </p>
            </div>
            <motion.div className="grid grid-cols-2 gap-4" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
              {[
                { icon: ShieldCheck, label: "15+ Years", desc: "Luxury event experience" },
                { icon: Users, label: "500+ Events", desc: "Flawlessly executed" },
                { icon: Sparkle, label: "100+ Vendors", desc: "Trusted partner network" },
                { icon: Certificate, label: "Dual Certified", desc: "CSEP & CMP professionals" },
                { icon: Heart, label: "Boutique Studio", desc: "Limited events per year" },
                { icon: Star, label: "5-Star Rated", desc: "The Knot & WeddingWire" },
              ].map((item, i) => (
                <motion.div key={i} variants={fadeUp}>
                  <GlassCard className="p-5 text-center">
                    <item.icon size={28} weight="duotone" style={{ color: GOLD }} className="mx-auto mb-2" />
                    <p className="text-sm font-semibold text-white">{item.label}</p>
                    <p className="text-xs text-slate-400 mt-1">{item.desc}</p>
                  </GlassCard>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </SectionReveal>

      {/* ═══════════════════════ 9. "WHAT'S YOUR EVENT?" QUIZ ═══════════════════════ */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GOLD }}>Find Your Package</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white" style={{ fontFamily: "'Georgia', serif" }}>
              <WordReveal text="What's Your Event?" />
            </h2>
          </div>
          <motion.div className="grid grid-cols-1 sm:grid-cols-3 gap-4" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
            {quizOptions.map((opt, i) => (
              <motion.div key={i} variants={fadeUp}>
                <button
                  onClick={() => setQuizAnswer(i)}
                  className="w-full text-left rounded-2xl p-6 border transition-all duration-300 cursor-pointer"
                  style={{
                    background: quizAnswer === i ? GOLD_GLOW_STRONG : "rgba(255,255,255,0.02)",
                    borderColor: quizAnswer === i ? GOLD : "rgba(255,255,255,0.08)",
                  }}
                >
                  <opt.icon size={32} weight="duotone" style={{ color: opt.color }} className="mb-3" />
                  <p className="text-lg font-semibold text-white">{opt.label}</p>
                </button>
              </motion.div>
            ))}
          </motion.div>
          <AnimatePresence mode="wait">
            {quizAnswer !== null && (
              <motion.div initial={{ opacity: 0, y: 20, height: 0 }} animate={{ opacity: 1, y: 0, height: "auto" }} exit={{ opacity: 0, y: -10, height: 0 }} transition={spring} className="mt-6">
                <GlassCard className="p-6 text-center">
                  <p className="text-slate-300 mb-4">{quizOptions[quizAnswer].reco}</p>
                  <MagneticButton className="px-8 py-3 rounded-full text-sm font-semibold text-white inline-flex items-center gap-2 cursor-pointer" style={{ background: GOLD } as React.CSSProperties}>
                    <Phone size={16} weight="duotone" /> Call (206) 555-0915
                  </MagneticButton>
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </SectionReveal>

      {/* ═══════════════════════ 9. VENDOR COORDINATION ═══════════════════════ */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GOLD }}>Our Network</p>
              <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white mb-6" style={{ fontFamily: "'Georgia', serif" }}>
                <WordReveal text="100+ Trusted Vendors" />
              </h2>
              <p className="text-slate-400 leading-relaxed mb-6">
                Over 15 years, Sophia and James have cultivated relationships with Seattle's most talented vendors. Our clients receive preferred rates, priority booking, and a curated team that has worked together flawlessly on hundreds of events.
              </p>
              <p className="text-slate-400 leading-relaxed">
                From James Beard-nominated caterers to Grammy-winning musicians, our vendor network ensures your event features the very best talent available in the Pacific Northwest.
              </p>
            </div>
            <motion.div className="grid grid-cols-2 gap-3" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
              {vendorCategories.map((v, i) => (
                <motion.div key={i} variants={fadeUp}>
                  <GlassCard className="p-4 flex items-center justify-between">
                    <span className="text-sm text-white font-medium">{v.name}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: GOLD_GLOW, color: GOLD }}>{v.count}+</span>
                  </GlassCard>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </SectionReveal>

      {/* ═══════════════════════ 10. COMPARISON: ELEVATE VS DIY ═══════════════════════ */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GOLD }}>Why Hire Us</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white" style={{ fontFamily: "'Georgia', serif" }}>
              <WordReveal text="Elevate Events vs. DIY" />
            </h2>
          </div>
          <GlassCard className="overflow-hidden">
            <div className="grid grid-cols-3 text-center text-sm font-semibold p-4 border-b border-white/8">
              <span className="text-slate-400">Feature</span>
              <span style={{ color: GOLD }}>Elevate Events</span>
              <span className="text-slate-500">DIY Planning</span>
            </div>
            {comparisonRows.map((row, i) => (
              <div key={i} className="grid grid-cols-3 text-center text-sm p-4 border-b border-white/[0.03] last:border-0">
                <span className="text-slate-300 text-left">{row.feature}</span>
                <span><CheckCircle size={18} weight="fill" style={{ color: GOLD }} className="mx-auto" /></span>
                <span className="text-slate-500">{row.them}</span>
              </div>
            ))}
          </GlassCard>
        </div>
      </SectionReveal>

      {/* ═══════════════════════ 11. TESTIMONIALS (Auto-rotating) ═══════════════════════ */}
      <SectionReveal id="testimonials" className="relative z-10 py-16 md:py-24">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, transparent 0%, ${GOLD_GLOW} 50%, transparent 100%)` }} />
        <div className="relative mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-6">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GOLD }}>Client Love</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white" style={{ fontFamily: "'Georgia', serif" }}>
              <WordReveal text="Words From Our Clients" />
            </h2>
          </div>
          {/* Google Reviews Header */}
          <div className="flex justify-center items-center gap-2 mb-12">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, j) => (<Star key={j} size={18} weight="fill" style={{ color: GOLD }} />))}
            </div>
            <span className="text-sm text-slate-400">5.0 from 127 reviews</span>
          </div>
          {/* Single rotating testimonial */}
          <div className="max-w-3xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div key={activeTestimonial} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5 }}>
                <GlassCard className="p-8 md:p-12 text-center">
                  <Quotes size={40} weight="fill" style={{ color: GOLD }} className="mx-auto mb-6 opacity-40" />
                  <p className="text-lg md:text-xl text-slate-200 leading-relaxed mb-8 italic" style={{ fontFamily: "'Georgia', serif" }}>
                    &ldquo;{testimonials[activeTestimonial].text}&rdquo;
                  </p>
                  <div className="flex items-center justify-center gap-1 mb-3">
                    {Array.from({ length: testimonials[activeTestimonial].rating }).map((_, j) => (
                      <Star key={j} size={14} weight="fill" style={{ color: GOLD }} />
                    ))}
                  </div>
                  <p className="text-base font-semibold text-white">{testimonials[activeTestimonial].name}</p>
                  <p className="text-xs text-slate-400 mt-1">{testimonials[activeTestimonial].role}</p>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <CheckCircle size={12} weight="fill" style={{ color: GOLD }} />
                    <span className="text-xs" style={{ color: GOLD }}>Verified Client</span>
                  </div>
                </GlassCard>
              </motion.div>
            </AnimatePresence>
            {/* Dot navigation */}
            <div className="flex justify-center gap-2 mt-6">
              {testimonials.map((_, i) => (
                <button key={i} onClick={() => setActiveTestimonial(i)} className="w-2.5 h-2.5 rounded-full transition-all duration-300 cursor-pointer" style={{ background: activeTestimonial === i ? GOLD : "rgba(255,255,255,0.15)" }} />
              ))}
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* ═══════════════════════ 12. DAY-OF TIMELINE ═══════════════════════ */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GOLD }}>Event Day</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white" style={{ fontFamily: "'Georgia', serif" }}>
              <WordReveal text="A Day in Our Hands" />
            </h2>
            <p className="text-slate-400 mt-4 max-w-xl mx-auto">Here is what a typical event day looks like when Elevate Events is running the show.</p>
          </div>
          <motion.div className="space-y-4" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {dayOfTimeline.map((item, i) => (
              <motion.div key={i} variants={fadeUp} className="flex items-center gap-4 md:gap-6">
                <div className="w-20 md:w-24 shrink-0 text-right">
                  <span className="text-sm font-bold" style={{ color: GOLD }}>{item.time}</span>
                </div>
                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 border" style={{ borderColor: `${GOLD}44`, background: GOLD_GLOW }}>
                  <item.icon size={18} weight="duotone" style={{ color: GOLD }} />
                </div>
                <GlassCard className="flex-1 px-5 py-4">
                  <p className="text-sm text-slate-200">{item.task}</p>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ═══════════════════════ 13. TEAM PROFILES ═══════════════════════ */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${GOLD_GLOW} 0%, transparent 50%)` }} />
        <div className="relative mx-auto max-w-5xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GOLD }}>Meet the Team</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white" style={{ fontFamily: "'Georgia', serif" }}>
              <WordReveal text="Sophia & James Park" />
            </h2>
          </div>
          <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-8" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
            {teamMembers.map((member, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="overflow-hidden">
                  <div className="aspect-[4/3] overflow-hidden">
                    <img src={member.image} alt={member.name} className="w-full h-full object-cover object-top" />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white" style={{ fontFamily: "'Georgia', serif" }}>{member.name}</h3>
                    <p className="text-sm mb-3" style={{ color: GOLD }}>{member.title}</p>
                    <p className="text-sm text-slate-400 leading-relaxed">{member.bio}</p>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ═══════════════════════ 14. CERTIFICATIONS & BADGES ═══════════════════════ */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GOLD }}>Credentials</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white" style={{ fontFamily: "'Georgia', serif" }}>
              <WordReveal text="Certified & Recognized" />
            </h2>
          </div>
          <motion.div className="flex flex-wrap justify-center gap-3" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
            {certifications.map((cert, i) => (
              <motion.div key={i} variants={fadeUp}>
                <div className="px-4 py-2 rounded-full border text-sm text-slate-300 flex items-center gap-2" style={{ borderColor: `${GOLD}33`, background: GOLD_GLOW }}>
                  <ShieldCheck size={14} weight="duotone" style={{ color: GOLD }} />{cert}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ═══════════════════════ 15. FINANCING / PAYMENT FLEXIBILITY ═══════════════════════ */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GOLD }}>Flexible Payment</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white" style={{ fontFamily: "'Georgia', serif" }}>
              <WordReveal text="Investment Made Easy" />
            </h2>
            <p className="text-slate-400 mt-4 max-w-lg mx-auto">We believe exceptional events should be accessible. We offer flexible payment plans for all packages.</p>
          </div>
          <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
            {[
              { title: "Deposit & Balance", rate: "50/50", desc: "50% deposit to secure your date, balance due 30 days before the event." },
              { title: "Monthly Payments", rate: "3-12 mo", desc: "Spread your investment over 3 to 12 monthly installments with no interest." },
              { title: "Custom Schedule", rate: "Flexible", desc: "For Luxury packages, we create a payment timeline that works with your planning horizon." },
            ].map((plan, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="p-6 text-center h-full">
                  <p className="text-3xl font-bold mb-2" style={{ color: GOLD }}>{plan.rate}</p>
                  <h3 className="text-base font-semibold text-white mb-3">{plan.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{plan.desc}</p>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ═══════════════════════ 16. VIDEO TESTIMONIAL PLACEHOLDER ═══════════════════════ */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4 md:px-6">
          <div className="relative aspect-video rounded-2xl overflow-hidden group cursor-pointer">
            <img src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80" alt="Event highlights" className="w-full h-full object-cover" />
            <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${BG}cc, ${BG}88)` }} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.div className="w-20 h-20 rounded-full flex items-center justify-center border-2 mb-6" style={{ borderColor: GOLD, background: `${GOLD}22` }} animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
                <CaretRight size={32} weight="fill" style={{ color: GOLD }} />
              </motion.div>
              <p className="text-xl font-bold text-white" style={{ fontFamily: "'Georgia', serif" }}>Watch Our Event Highlights</p>
              <p className="text-sm text-slate-400 mt-2">A look behind the scenes at our recent celebrations</p>
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* ═══════════════════════ 16. LIMITED AVAILABILITY URGENCY ═══════════════════════ */}
      <SectionReveal className="relative z-10 py-12 md:py-16">
        <div className="mx-auto max-w-4xl px-4 md:px-6">
          <GlassCard className="p-6 md:p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1" style={{ background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)` }} />
            <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
              <div className="flex items-center gap-3 shrink-0">
                <motion.div
                  className="w-4 h-4 rounded-full"
                  style={{ background: GOLD, boxShadow: `0 0 12px ${GOLD}` }}
                  animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <span className="text-sm font-bold uppercase tracking-widest" style={{ color: GOLD }}>Limited Availability</span>
              </div>
              <div className="flex-1">
                <p className="text-white font-semibold">We accept only 24 events per year to maintain our standard of excellence.</p>
                <p className="text-sm text-slate-400 mt-1">2026 dates are filling fast. Secure your date with a complimentary consultation.</p>
              </div>
              <MagneticButton className="px-6 py-3 rounded-full text-sm font-semibold text-white shrink-0 cursor-pointer" style={{ background: GOLD } as React.CSSProperties}>
                Check Availability
              </MagneticButton>
            </div>
          </GlassCard>
        </div>
      </SectionReveal>

      {/* ═══════════════════════ 17. EVENT ESSENTIALS — WHAT'S INCLUDED ═══════════════════════ */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GOLD }}>Every Event Includes</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white" style={{ fontFamily: "'Georgia', serif" }}>
              <WordReveal text="The Elevate Standard" />
            </h2>
            <p className="text-slate-400 mt-4 max-w-xl mx-auto">No matter the package, every Elevate Events client receives these essentials as part of our commitment to excellence.</p>
          </div>
          <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {[
              { icon: CalendarCheck, title: "Detailed Timeline", desc: "Minute-by-minute event schedule shared with all vendors" },
              { icon: Users, title: "On-Site Team", desc: "Professional coordinators managing every aspect day-of" },
              { icon: ShieldCheck, title: "Vendor Insurance", desc: "All recommended vendors are vetted, licensed, and insured" },
              { icon: Sparkle, title: "Design Mockups", desc: "Visual renderings of your event layout before the big day" },
              { icon: Phone, title: "24/7 Access", desc: "Direct line to your planner throughout the entire process" },
              { icon: Handshake, title: "Contract Review", desc: "We review and negotiate every vendor contract on your behalf" },
              { icon: Gift, title: "Welcome Gifts", desc: "Custom welcome packages for overnight guests and VIPs" },
              { icon: CheckCircle, title: "Post-Event Care", desc: "Vendor tip distribution, rental returns, and final payments" },
            ].map((item, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="p-6 h-full text-center">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ background: GOLD_GLOW }}>
                    <item.icon size={22} weight="duotone" style={{ color: GOLD }} />
                  </div>
                  <h3 className="text-sm font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ═══════════════════════ 18. FAQ ═══════════════════════ */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GOLD }}>Questions</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white" style={{ fontFamily: "'Georgia', serif" }}>
              <WordReveal text="Frequently Asked" />
            </h2>
          </div>
          <motion.div className="space-y-3" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {[
              { q: "How far in advance should we book?", a: "For weddings and large galas, we recommend 12-18 months. For corporate events and private parties, 3-6 months is ideal. For last-minute events, contact us to discuss availability." },
              { q: "Do you handle destination events?", a: "Absolutely. Sophia and James have coordinated events throughout the Pacific Northwest, Hawaii, and internationally. Our vendor network extends beyond Seattle." },
              { q: "What is included in day-of coordination?", a: "Our day-of package includes a rehearsal walkthrough, vendor timeline management, on-site production coordination, troubleshooting, and post-event wrap-up. We handle everything so you enjoy every moment." },
              { q: "Can you work within our budget?", a: "Yes. We pride ourselves on maximizing impact within any budget. During our consultation, we allocate funds strategically and present creative solutions that deliver a premium experience." },
              { q: "Do you manage vendor contracts?", a: "In our Grand and Luxury packages, we negotiate all vendor contracts, manage payment schedules, and ensure deliverables are met. We leverage our longstanding relationships for preferred rates." },
              { q: "What makes Elevate Events different?", a: "Fifteen years of experience, dual CSEP and CMP certifications, a former Four Seasons background, and a network of 100+ trusted vendors. We treat every event as if it were our own." },
            ].map((item, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="overflow-hidden">
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-5 text-left cursor-pointer">
                    <span className="text-sm md:text-base font-semibold text-white pr-4">{item.q}</span>
                    <motion.div animate={{ rotate: openFaq === i ? 180 : 0 }} transition={spring}>
                      <CaretDown size={18} className="text-slate-400 shrink-0" />
                    </motion.div>
                  </button>
                  <AnimatePresence initial={false}>
                    {openFaq === i && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={spring} className="overflow-hidden">
                        <p className="px-5 pb-5 text-sm text-slate-400 leading-relaxed">{item.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ═══════════════════════ 17. CTA BANNER ═══════════════════════ */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4 md:px-6">
          <ShimmerBorder>
            <div className="p-8 md:p-14 text-center relative overflow-hidden">
              {/* Decorative bokeh inside the CTA */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute w-40 h-40 rounded-full -top-10 -left-10" style={{ background: `radial-gradient(circle, ${GOLD_GLOW_STRONG}, transparent 70%)`, filter: "blur(40px)" }} />
                <div className="absolute w-32 h-32 rounded-full -bottom-8 -right-8" style={{ background: `radial-gradient(circle, ${GOLD_GLOW_STRONG}, transparent 70%)`, filter: "blur(30px)" }} />
              </div>
              <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={spring} className="relative z-10">
                <div className="flex justify-center mb-6">
                  <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
                    <Champagne size={48} weight="duotone" style={{ color: GOLD }} />
                  </motion.div>
                </div>
                <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white mb-4" style={{ fontFamily: "'Georgia', serif" }}>Ready to Elevate Your Event?</h2>
                <p className="text-slate-400 text-lg mb-8 max-w-lg mx-auto">Schedule a complimentary consultation with Sophia and James. Let&apos;s create something unforgettable together.</p>
                <div className="flex flex-wrap justify-center gap-4">
                  <MagneticButton className="px-10 py-4 rounded-full text-base font-semibold text-white inline-flex items-center gap-2 cursor-pointer shadow-lg" style={{ background: GOLD, boxShadow: `0 0 40px ${GOLD_GLOW_STRONG}` } as React.CSSProperties}>
                    <CalendarCheck size={20} weight="duotone" /> Free Consultation
                  </MagneticButton>
                  <a href="tel:2065550915" className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/15 inline-flex items-center gap-2 backdrop-blur-sm hover:bg-white/5 transition-colors">
                    <Phone size={18} weight="duotone" /> (206) 555-0915
                  </a>
                </div>
              </motion.div>
            </div>
          </ShimmerBorder>
        </div>
      </SectionReveal>

      {/* ═══════════════════════ 18. CONTACT & SERVICE AREA ═══════════════════════ */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GOLD }}>Contact</p>
              <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white mb-6" style={{ fontFamily: "'Georgia', serif" }}>
                <WordReveal text="Let's Connect" />
              </h2>
              <p className="text-slate-400 leading-relaxed mb-8">
                Whether you are planning a wedding, a corporate gala, or a private celebration, we would love to hear your vision. Reach out to start the conversation.
              </p>
              {/* Pulsing availability */}
              <div className="flex items-center gap-3 mb-8">
                <motion.div className="w-3 h-3 rounded-full" style={{ background: "#22c55e" }} animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }} transition={{ duration: 2, repeat: Infinity }} />
                <span className="text-sm text-slate-300">Now Booking 2026 & 2027 Events</span>
              </div>
              {/* Email CTA */}
              <a href="mailto:hello@elevateeventsseattle.com" className="inline-flex items-center gap-2 text-sm font-medium transition-colors hover:underline" style={{ color: GOLD }}>
                <Envelope size={16} weight="duotone" /> hello@elevateeventsseattle.com
              </a>
            </div>
            <GlassCard className="p-8">
              <h3 className="text-xl font-semibold text-white mb-6" style={{ fontFamily: "'Georgia', serif" }}>Contact Details</h3>
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <MapPin size={20} weight="duotone" style={{ color: GOLD }} className="mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-white">Studio</p>
                    <a href="https://maps.google.com/?q=1420+5th+Ave+Suite+2200+Seattle+WA+98101" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-400 hover:text-white transition-colors">
                      1420 5th Ave, Suite 2200<br />Seattle, WA 98101
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Phone size={20} weight="duotone" style={{ color: GOLD }} className="mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-white">Phone</p>
                    <a href="tel:2065550915" className="text-sm text-slate-400 hover:text-white transition-colors">(206) 555-0915</a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Clock size={20} weight="duotone" style={{ color: GOLD }} className="mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-white">Hours</p>
                    <p className="text-sm text-slate-400">Monday - Friday: 9:00 AM - 6:00 PM<br />Weekends: By appointment</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Lightning size={20} weight="duotone" style={{ color: GOLD }} className="mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-white">Service Area</p>
                    <p className="text-sm text-slate-400">Greater Seattle, Pacific Northwest<br />Destination events worldwide</p>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </SectionReveal>

      {/* ═══════════════════════ FOOTER ═══════════════════════ */}
      <footer className="relative z-10 border-t border-white/8 py-8">
        <div className="mx-auto max-w-7xl px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <EventIcon size={16} />
            <span style={{ fontFamily: "'Georgia', serif" }}>Elevate Events &copy; {new Date().getFullYear()}</span>
          </div>
          <p className="text-xs text-slate-600 flex items-center gap-1.5"><svg width="14" height="14" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-sky-500"><path d="M24.3 4.2c-1.5-.4-3.2.1-4.5 1.1-1-.7-2.3-1-3.5-.8-2.4.4-4.2 2.5-4.2 4.9v.6c-3.2.8-6 2.8-7.8 5.6-.3.5-.1 1.1.4 1.4.5.3 1.1.1 1.4-.4 1.5-2.3 3.7-4 6.3-4.7.5-.1 1-.1 1.5 0 .8.2 1.4.8 1.7 1.5.3.8.2 1.6-.2 2.3l-2.8 4.3c-.6.9-.4 2.1.4 2.8l2.5 2.1c.4.3.8.5 1.3.5h5.2c.5 0 1-.2 1.3-.5l1.2-1c.6-.5.8-1.3.6-2l-1-3.2c-.2-.5 0-1.1.4-1.4l3.8-2.5c1.3-.9 2.1-2.3 2.1-3.9V9.6c0-2.5-1.7-4.7-4.1-5.3v-.1z" fill="currentColor"/></svg>Created by <a href="https://bluejayportfolio.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-400 transition-colors">bluejayportfolio.com</a></p>
        </div>
      </footer>

      {/* ═══════════════════════ FIXED CLAIM BANNER ═══════════════════════ */}
      <div className="fixed bottom-4 right-4 z-50">
        <GlassCard className="px-4 py-2 text-xs text-slate-400">
          Claim this site at <a href="https://bluejayportfolio.com" target="_blank" rel="noopener noreferrer" className="font-bold" style={{ color: GOLD_LIGHT }}>bluejayportfolio.com</a>
        </GlassCard>
      </div>
    </main>
  );
}
