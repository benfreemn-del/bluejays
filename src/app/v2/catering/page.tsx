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
  ForkKnife,
  Wine,
  CookingPot,
  Star,
  ShieldCheck,
  Clock,
  Phone,
  MapPin,
  ArrowRight,
  CheckCircle,
  CaretDown,
  List,
  X,
  Users,
  CalendarCheck,
  Quotes,
  Champagne,
} from "@phosphor-icons/react";

/* ───────────────── SPRING ───────────────── */
const spring = { type: "spring" as const, stiffness: 100, damping: 20 };
const springFast = { type: "spring" as const, stiffness: 200, damping: 25 };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const fadeUp = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: spring } };

/* ───────────────── COLORS ───────────────── */
const BURGUNDY = "#881337";
const CREAM = "#4a2c1a";
const GOLD = "#d4a574";
const BG = "#faf8f6";

/* ───────────────── PARTICLES ───────────────── */
function FloatingParticles() {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i, x: Math.random() * 100, delay: Math.random() * 8, duration: 6 + Math.random() * 6,
    size: 2 + Math.random() * 3, opacity: 0.12 + Math.random() * 0.25, isGold: Math.random() > 0.5,
  }));
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden hidden md:block">
      {particles.map((p) => (
        <motion.div key={p.id} className="absolute rounded-full"
          style={{ left: `${p.x}%`, width: p.size, height: p.size, background: p.isGold ? `${GOLD}88` : `${BURGUNDY}66`, willChange: "transform, opacity" }}
          animate={{ y: ["-10vh", "110vh"], opacity: [0, p.opacity, p.opacity, 0] }}
          transition={{ y: { duration: p.duration, repeat: Infinity, delay: p.delay, ease: "linear" }, opacity: { duration: p.duration, repeat: Infinity, delay: p.delay, times: [0, 0.1, 0.9, 1] } }}
        />
      ))}
    </div>
  );
}

/* ───────────────── ELEGANT PATTERN ───────────────── */
function ElegantPattern({ opacity = 0.03 }: { opacity?: number }) {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }}>
      <defs>
        <pattern id="elegantDiamond" width="60" height="60" patternUnits="userSpaceOnUse">
          <path d="M30 0 L60 30 L30 60 L0 30Z" fill="none" stroke={BURGUNDY} strokeWidth="0.5" />
          <circle cx="30" cy="30" r="2" fill={GOLD} opacity="0.3" />
          <circle cx="0" cy="0" r="1" fill={BURGUNDY} opacity="0.2" />
          <circle cx="60" cy="60" r="1" fill={BURGUNDY} opacity="0.2" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#elegantDiamond)" />
    </svg>
  );
}

/* ───────────────── CHEF HAT SVG ───────────────── */
function ChefHatSVG() {
  return (
    <div className="relative flex items-center justify-center">
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{ background: `radial-gradient(circle, rgba(136,19,55,0.15) 0%, transparent 70%)`, filter: "blur(40px)" }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      <svg viewBox="0 0 200 240" className="relative z-10 w-48 h-56 md:w-56 md:h-72" fill="none">
        {/* Outer glow rings */}
        <motion.circle cx="100" cy="110" r="95" stroke={BURGUNDY} strokeWidth="0.5" opacity={0.12}
          animate={{ r: [93, 97, 93] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} />
        <motion.circle cx="100" cy="110" r="85" stroke={GOLD} strokeWidth="0.3" opacity={0.08}
          animate={{ r: [83, 87, 83] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }} />

        {/* Chef hat top puffs */}
        <motion.ellipse cx="60" cy="55" rx="28" ry="30" fill={`${BURGUNDY}18`} stroke={BURGUNDY} strokeWidth="2"
          initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "backOut" }} />
        <motion.ellipse cx="100" cy="40" rx="30" ry="32" fill={`${BURGUNDY}18`} stroke={BURGUNDY} strokeWidth="2"
          initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4, ease: "backOut" }} />
        <motion.ellipse cx="140" cy="55" rx="28" ry="30" fill={`${BURGUNDY}18`} stroke={BURGUNDY} strokeWidth="2"
          initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6, ease: "backOut" }} />

        {/* Inner highlights on puffs */}
        <ellipse cx="60" cy="50" rx="12" ry="14" fill={`${BURGUNDY}0d`} />
        <ellipse cx="100" cy="35" rx="14" ry="15" fill={`${BURGUNDY}0d`} />
        <ellipse cx="140" cy="50" rx="12" ry="14" fill={`${BURGUNDY}0d`} />

        {/* Hat band */}
        <motion.rect x="55" y="80" width="90" height="20" rx="4" fill={`${GOLD}22`} stroke={GOLD} strokeWidth="1.5"
          initial={{ scaleX: 0, opacity: 0 }} animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }} />
        <rect x="55" y="83" width="90" height="10" rx="3" fill={`${GOLD}0d`} />

        {/* Hat body */}
        <motion.path
          d="M55 100 L55 80 C55 70 55 65 60 60 M145 100 L145 80 C145 70 145 65 140 60"
          stroke={BURGUNDY} strokeWidth="2" fill="none"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 1, delay: 0.5 }} />

        {/* Hat brim */}
        <motion.path
          d="M45 100 L155 100 C155 100 158 110 155 115 L45 115 C42 110 45 100 45 100Z"
          fill={`${BURGUNDY}18`} stroke={BURGUNDY} strokeWidth="2" strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.2, delay: 1 }} />
        <path d="M50 103 L150 103 C150 103 152 108 150 112 L50 112 C48 108 50 103 50 103Z" fill={`${BURGUNDY}0d`} />

        {/* Steam lines rising from plate */}
        <motion.path d="M80 145 C80 135 70 130 75 120" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round" fill="none"
          initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: [0, 1, 1, 0], opacity: [0, 0.6, 0.6, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", times: [0, 0.3, 0.7, 1] }} />
        <motion.path d="M100 150 C100 138 90 132 95 120" stroke={BURGUNDY} strokeWidth="1.5" strokeLinecap="round" fill="none"
          initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: [0, 1, 1, 0], opacity: [0, 0.5, 0.5, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5, times: [0, 0.3, 0.7, 1] }} />
        <motion.path d="M120 145 C120 135 130 130 125 120" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round" fill="none"
          initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: [0, 1, 1, 0], opacity: [0, 0.6, 0.6, 0] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", delay: 1, times: [0, 0.3, 0.7, 1] }} />

        {/* Plate / serving dome base */}
        <motion.path
          d="M45 180 Q100 160 155 180"
          stroke={GOLD} strokeWidth="2" fill="none" strokeLinecap="round"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 1, delay: 1.5 }} />
        <motion.ellipse cx="100" cy="182" rx="55" ry="8" fill={`${GOLD}15`} stroke={GOLD} strokeWidth="1.5"
          initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 1.8 }} />
        <ellipse cx="100" cy="180" rx="40" ry="4" fill={`${GOLD}0d`} />

        {/* Fork and knife crossed */}
        <motion.path d="M70 200 L70 215 M66 200 L66 203 M70 200 L70 203 M74 200 L74 203" stroke={CREAM} strokeWidth="1" strokeLinecap="round"
          initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ delay: 2.2, duration: 0.5 }} />
        <motion.path d="M130 200 L130 215 M128 200 Q130 208 130 200" stroke={CREAM} strokeWidth="1" strokeLinecap="round"
          initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ delay: 2.4, duration: 0.5 }} />

        {/* Sparkle accents */}
        <motion.circle cx="165" cy="30" r="3" fill={GOLD}
          animate={{ opacity: [0.2, 1, 0.2], scale: [0.7, 1.3, 0.7] }}
          transition={{ duration: 2.5, repeat: Infinity }} />
        <motion.circle cx="30" cy="50" r="2" fill={CREAM}
          animate={{ opacity: [0.1, 0.8, 0.1], scale: [0.5, 1.2, 0.5] }}
          transition={{ duration: 3, repeat: Infinity, delay: 0.8 }} />
        <motion.circle cx="175" cy="100" r="2.5" fill={GOLD}
          animate={{ opacity: [0.15, 0.7, 0.15] }}
          transition={{ duration: 2, repeat: Infinity, delay: 1.2 }} />
        <motion.circle cx="25" cy="120" r="2" fill={CREAM}
          animate={{ opacity: [0.1, 0.6, 0.1] }}
          transition={{ duration: 2.5, repeat: Infinity, delay: 0.4 }} />

        {/* Small star accent */}
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}>
          <motion.circle cx="160" cy="160" r="4" fill={GOLD} opacity={0.3}
            animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 2, repeat: Infinity }} />
        </motion.g>
      </svg>
    </div>
  );
}

/* ───────────────── VINE SVG ───────────────── */
function VineDecor({ opacity = 0.04 }: { opacity?: number }) {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }} viewBox="0 0 1000 600" preserveAspectRatio="none">
      <path d="M0 300 Q250 200 500 300 T1000 300" stroke={BURGUNDY} strokeWidth="1.5" fill="none" />
      <path d="M0 350 Q250 250 500 350 T1000 350" stroke={GOLD} strokeWidth="1" fill="none" />
    </svg>
  );
}

/* ───────────────── UTILITY COMPONENTS ───────────────── */
function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-gray-200 bg-white/70 backdrop-blur-xl shadow-sm ${className}`}>{children}</div>;
}

function SectionReveal({ children, className = "", id }: { children: React.ReactNode; className?: string; id?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return <motion.section ref={ref} id={id} className={className} initial={{ opacity: 0, y: 50 }} animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }} transition={spring}>{children}</motion.section>;
}

function WordReveal({ text, className = "" }: { text: string; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  return (
    <motion.span ref={ref} className={`inline-flex flex-wrap gap-x-3 ${className}`} variants={stagger} initial="hidden" animate={isInView ? "show" : "hidden"}>
      {text.split(" ").map((word, i) => <motion.span key={i} variants={fadeUp} className="inline-block">{word}</motion.span>)}
    </motion.span>
  );
}

function MagneticButton({ children, className = "", onClick, style }: { children: React.ReactNode; className?: string; onClick?: () => void; style?: React.CSSProperties }) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0); const y = useMotionValue(0);
  const springX = useSpring(x, springFast); const springY = useSpring(y, springFast);
  const isTouchDevice = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
  const handleMouseMove = useCallback((e: React.MouseEvent) => { if (!ref.current || isTouchDevice) return; const rect = ref.current.getBoundingClientRect(); x.set((e.clientX - (rect.left + rect.width / 2)) * 0.25); y.set((e.clientY - (rect.top + rect.height / 2)) * 0.25); }, [x, y, isTouchDevice]);
  const handleMouseLeave = useCallback(() => { x.set(0); y.set(0); }, [x, y]);
  return <motion.button ref={ref} style={{ x: springX, y: springY, willChange: "transform", ...style }} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} onClick={onClick} className={className} whileTap={{ scale: 0.97 }}>{children}</motion.button>;
}

function ShimmerBorder({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative rounded-2xl p-[1px] overflow-hidden ${className}`}>
      <motion.div className="absolute inset-0 rounded-2xl" style={{ background: `conic-gradient(from 0deg, transparent, ${BURGUNDY}, transparent, ${GOLD}, transparent)`, willChange: "transform" }} animate={{ rotate: [0, 360] }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} />
      <div className="relative rounded-2xl bg-white z-10">{children}</div>
    </div>
  );
}

/* ───────────────── DATA ───────────────── */
const services = [
  { name: "Wedding Catering", desc: "Bespoke wedding menus crafted to make your special day unforgettable — from cocktail hour to the last dance.", icon: Champagne },
  { name: "Corporate Events", desc: "Professional catering for conferences, galas, and corporate gatherings that impress clients and colleagues.", icon: Users },
  { name: "Private Dining", desc: "Intimate dinner parties with personal chef service — a restaurant-quality experience in your own home.", icon: ForkKnife },
  { name: "Buffet Service", desc: "Elegant buffet spreads with carving stations, live cooking, and beautiful presentation for any event size.", icon: CookingPot },
  { name: "Plated Service", desc: "Multi-course plated dinners with white-glove service for the most elegant and refined affairs.", icon: Wine },
  { name: "Specialty Cuisine", desc: "From farm-to-table organic to international fusion — our chefs craft menus that tell a culinary story.", icon: Star },
];

const stats = [
  { value: "2,000+", label: "Events Catered" },
  { value: "15+", label: "Years Experience" },
  { value: "50-500", label: "Guest Capacity" },
  { value: "4.9★", label: "Client Rating" },
];

const galleryImages = [
  "https://images.unsplash.com/photo-1555244162-803834f70033?w=600&q=80",
  "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80",
  "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600&q=80",
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80",
  "https://images.unsplash.com/photo-1530062845289-9109b2c9c868?w=600&q=80",
  "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&q=80",
  "https://images.unsplash.com/photo-1547573854-74d2a71d0826?w=600&q=80",
  "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600&q=80",
];

const testimonials = [
  { name: "Amanda & James W.", text: "They catered our wedding for 300 guests and every single dish was perfection. Our guests are still raving about the food months later.", rating: 5 },
  { name: "Robert Chen", text: "We've used them for three corporate galas now. The presentation is stunning and the food is consistently exceptional. True professionals.", rating: 5 },
  { name: "Lisa Martinez", text: "The private dinner party they did for our anniversary was magical. It felt like having a Michelin-star restaurant in our home.", rating: 5 },
];

const processSteps = [
  { step: "01", title: "Consultation", desc: "We meet to discuss your vision, dietary needs, guest count, and budget." },
  { step: "02", title: "Menu Design", desc: "Our chefs create a custom menu with tasting sessions to perfect every dish." },
  { step: "03", title: "Event Planning", desc: "We coordinate logistics, staffing, rentals, and setup for a seamless experience." },
  { step: "04", title: "Execution", desc: "Our team delivers a flawless event with beautiful presentation and impeccable service." },
];

const faqs = [
  { q: "How far in advance should I book?", a: "We recommend booking 3-6 months in advance for weddings and large events. Corporate events can often be arranged with 2-4 weeks notice." },
  { q: "Do you accommodate dietary restrictions?", a: "Absolutely. We specialize in crafting menus that accommodate vegan, gluten-free, kosher, halal, and allergy-specific needs without compromising flavor." },
  { q: "What's included in your catering packages?", a: "Our packages include menu planning, food preparation, professional service staff, setup, cleanup, and all necessary equipment. We handle everything." },
  { q: "Can we schedule a tasting?", a: "Yes! We offer complimentary tastings for events over 50 guests. Smaller events can arrange tastings for a nominal fee that's applied to your booking." },
];

/* ═══════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════ */
export default function V2CateringShowcase() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden" style={{ background: BG, color: "#1c1917" }}>
      <FloatingParticles />

      {/* ══════ 1. NAV ══════ */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-4">
          <GlassCard className="flex items-center justify-between px-4 md:px-6 py-3">
            <div className="flex items-center gap-2">
              <ForkKnife size={24} weight="fill" style={{ color: BURGUNDY }} />
              <span className="text-lg font-bold tracking-tight text-[#1c1917]">Ember &amp; Oak Catering</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm text-[#6b7280]">
              <a href="#services" className="hover:text-[#1c1917] transition-colors">Services</a>
              <a href="#gallery" className="hover:text-[#1c1917] transition-colors">Gallery</a>
              <a href="#about" className="hover:text-[#1c1917] transition-colors">About</a>
              <a href="#contact" className="hover:text-[#1c1917] transition-colors">Contact</a>
            </div>
            <div className="flex items-center gap-3">
              <MagneticButton className="px-4 md:px-5 py-2 rounded-full text-sm font-semibold text-[#1c1917] transition-colors cursor-pointer" style={{ background: BURGUNDY }}>
                Book Event
              </MagneticButton>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-lg text-[#1c1917] hover:bg-gray-100 transition-colors">
                {mobileMenuOpen ? <X size={24} /> : <List size={24} />}
              </button>
            </div>
          </GlassCard>
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="md:hidden mt-2 overflow-hidden">
                <GlassCard className="flex flex-col gap-1 px-4 py-4">
                  {["Services", "Gallery", "About", "Contact"].map((l) => (
                    <a key={l} href={`#${l.toLowerCase()}`} onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-lg text-sm text-[#4b5563] hover:text-[#1c1917] hover:bg-gray-50 transition-colors">{l}</a>
                  ))}
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* ══════ 2. HERO ══════ */}
      <section className="relative min-h-[100dvh] flex items-center pt-24 z-10 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, #fdf8f5 0%, ${BG} 50%, #f5efe8 100%)` }} />
        <ElegantPattern opacity={0.04} />
        <VineDecor />
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full blur-[200px] pointer-events-none" style={{ background: `${BURGUNDY}08` }} />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full blur-[160px] pointer-events-none" style={{ background: `${GOLD}06` }} />

        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          <div className="space-y-8">
            <div>
              <p className="text-sm uppercase tracking-widest mb-4" style={{ color: GOLD }}>Premium Catering Services</p>
              <h1 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold" style={{ color: "#1c1917", textShadow: "none" }}>
                <WordReveal text="Culinary Excellence for Every Occasion" />
              </h1>
            </div>
            <p className="text-lg text-[#6b7280] max-w-md leading-relaxed">
              From intimate gatherings to grand celebrations, Ember &amp; Oak creates unforgettable culinary experiences with the finest seasonal ingredients.
            </p>
            <div className="flex flex-wrap gap-4">
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-[#1c1917] flex items-center gap-2 cursor-pointer" style={{ background: BURGUNDY }}>
                Plan Your Event <ArrowRight size={18} weight="bold" />
              </MagneticButton>
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-[#1c1917] border border-gray-200 flex items-center gap-2 cursor-pointer">
                <Phone size={18} weight="duotone" /> (206) 555-0298
              </MagneticButton>
            </div>
          </div>
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ ...spring, delay: 0.3 }} className="hidden md:flex items-center justify-center lg:justify-end">
            <ChefHatSVG />
          </motion.div>
        </div>
      </section>

      {/* ══════ 3. STATS ══════ */}
      <SectionReveal className="relative z-10 py-16 overflow-hidden border-y border-gray-200">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, #f5efe8 0%, ${BG} 100%)` }} />
        <ElegantPattern opacity={0.02} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => {
              const icons = [ForkKnife, Clock, Users, Star];
              const Icon = icons[i];
              return (
                <div key={stat.label} className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Icon size={22} weight="fill" style={{ color: BURGUNDY }} />
                    <span className="text-3xl md:text-4xl font-extrabold text-[#1c1917]">{stat.value}</span>
                  </div>
                  <span className="text-[#9ca3af] text-sm font-medium tracking-wide uppercase">{stat.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </SectionReveal>

      {/* ══════ 4. SERVICES / MENU ══════ */}
      <SectionReveal id="services" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #f5efe8 50%, ${BG} 100%)` }} />
        <ElegantPattern />
        <VineDecor opacity={0.025} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: BURGUNDY, borderColor: `${BURGUNDY}33`, background: `${BURGUNDY}0d` }}>Our Services</span>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-[#1c1917]">Catering for Every Occasion</h2>
            <div className="h-0.5 w-16 mx-auto mt-4" style={{ background: `linear-gradient(to right, ${BURGUNDY}, transparent)` }} />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, i) => {
              const Icon = service.icon;
              return (
                <div key={service.name} className="group relative p-7 rounded-2xl border border-gray-200/60 hover:border-opacity-30 transition-all duration-500 overflow-hidden bg-white/[0.02]">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: `radial-gradient(circle at 50% 0%, ${BURGUNDY}15, transparent 70%)` }} />
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-5">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center border" style={{ background: `${BURGUNDY}26`, borderColor: `${BURGUNDY}33` }}>
                        <Icon size={24} weight="duotone" style={{ color: BURGUNDY }} />
                      </div>
                      <span className="text-xs font-mono text-[#6b7280]">{String(i + 1).padStart(2, "0")}</span>
                    </div>
                    <h3 className="text-lg font-bold text-[#1c1917] mb-2">{service.name}</h3>
                    <p className="text-sm text-[#6b7280] leading-relaxed">{service.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </SectionReveal>

      {/* ══════ 5. GALLERY SHOWCASE ══════ */}
      <SectionReveal id="gallery" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #f5efe8 50%, ${BG} 100%)` }} />
        <VineDecor opacity={0.02} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: BURGUNDY, borderColor: `${BURGUNDY}33`, background: `${BURGUNDY}0d` }}>Gallery</span>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-[#1c1917]">A Feast for the Eyes</h2>
            <div className="h-0.5 w-16 mx-auto mt-4" style={{ background: `linear-gradient(to right, ${BURGUNDY}, transparent)` }} />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {galleryImages.map((src, i) => (
              <div key={i} className={`group relative rounded-2xl overflow-hidden border border-gray-200/60 ${i < 2 ? "md:row-span-2" : ""}`}>
                <img src={src} alt={`Culinary creation ${i + 1}`} className={`w-full object-cover transition-transform duration-700 group-hover:scale-105 ${i < 2 ? "h-64 md:h-full" : "h-48 md:h-48"}`} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ══════ 6. ABOUT / CHEF ══════ */}
      <SectionReveal id="about" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #f5efe8 50%, ${BG} 100%)` }} />
        <ElegantPattern opacity={0.02} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="relative">
              <div className="rounded-2xl overflow-hidden border border-gray-200">
                <img src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=600&q=80" alt="Executive Chef" className="w-full h-[400px] object-cover" />
              </div>
              <div className="absolute -bottom-4 -right-4 md:bottom-6 md:-right-6">
                <div className="px-5 py-3 rounded-xl backdrop-blur-md border text-[#1c1917] font-bold text-sm shadow-lg" style={{ background: `${BURGUNDY}e6`, borderColor: `${BURGUNDY}80` }}>15+ Years of Excellence</div>
              </div>
            </div>
            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: BURGUNDY, borderColor: `${BURGUNDY}33`, background: `${BURGUNDY}0d` }}>Meet the Chef</span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6 text-[#1c1917]">Crafted with Passion</h2>
              <p className="text-[#6b7280] leading-relaxed mb-8">
                Led by Executive Chef Marcus Rivera, our team brings decades of culinary expertise from Michelin-starred restaurants to your table. Every dish tells a story of local ingredients, seasonal inspiration, and unwavering dedication to flavor.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Star, label: "Award-Winning" },
                  { icon: CheckCircle, label: "Farm-to-Table" },
                  { icon: Users, label: "Expert Team" },
                  { icon: ShieldCheck, label: "Fully Licensed" },
                ].map((badge) => (
                  <GlassCard key={badge.label} className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${BURGUNDY}26` }}>
                      <badge.icon size={20} weight="duotone" style={{ color: BURGUNDY }} />
                    </div>
                    <span className="text-sm font-semibold text-[#1c1917]">{badge.label}</span>
                  </GlassCard>
                ))}
              </div>
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* ══════ 7. TESTIMONIALS ══════ */}
      <SectionReveal className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #f5efe8 50%, ${BG} 100%)` }} />
        <ElegantPattern opacity={0.02} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: BURGUNDY, borderColor: `${BURGUNDY}33`, background: `${BURGUNDY}0d` }}>Testimonials</span>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-[#1c1917]">What Our Clients Say</h2>
            <div className="h-0.5 w-16 mx-auto mt-4" style={{ background: `linear-gradient(to right, ${BURGUNDY}, transparent)` }} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <GlassCard key={i} className="p-6 h-full flex flex-col">
                <Quotes size={28} weight="fill" style={{ color: BURGUNDY }} className="mb-4 opacity-40" />
                <div className="flex gap-0.5 mb-4">{Array.from({ length: t.rating }).map((_, j) => <Star key={j} size={16} weight="fill" style={{ color: GOLD }} />)}</div>
                <p className="text-[#4b5563] leading-relaxed flex-1 text-sm mb-4">&ldquo;{t.text}&rdquo;</p>
                <div className="pt-4 border-t border-gray-100"><span className="text-sm font-semibold text-[#1c1917]">{t.name}</span></div>
              </GlassCard>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ══════ 8. EVENT PLANNING PROCESS ══════ */}
      <SectionReveal className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #f5efe8 50%, ${BG} 100%)` }} />
        <VineDecor opacity={0.02} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: BURGUNDY, borderColor: `${BURGUNDY}33`, background: `${BURGUNDY}0d` }}>Our Process</span>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-[#1c1917]">From Vision to Table</h2>
            <div className="h-0.5 w-16 mx-auto mt-4" style={{ background: `linear-gradient(to right, ${BURGUNDY}, transparent)` }} />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {processSteps.map((step, i) => (
              <div key={step.step} className="relative">
                {i < processSteps.length - 1 && <div className="hidden lg:block absolute top-10 left-[calc(50%+40px)] w-[calc(100%-80px)] h-px" style={{ background: `linear-gradient(to right, ${BURGUNDY}33, ${BURGUNDY}11)` }} />}
                <GlassCard className="p-6 text-center relative">
                  <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-black" style={{ background: `linear-gradient(135deg, ${BURGUNDY}22, ${BURGUNDY}0a)`, color: BURGUNDY, border: `1px solid ${BURGUNDY}33` }}>{step.step}</div>
                  <h3 className="text-lg font-bold text-[#1c1917] mb-2">{step.title}</h3>
                  <p className="text-sm text-[#6b7280] leading-relaxed">{step.desc}</p>
                </GlassCard>
              </div>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ══════ 9. FAQ ══════ */}
      <SectionReveal className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #f5efe8 50%, ${BG} 100%)` }} />
        <ElegantPattern opacity={0.02} />
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: BURGUNDY, borderColor: `${BURGUNDY}33`, background: `${BURGUNDY}0d` }}>FAQ</span>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-[#1c1917]">Questions &amp; Answers</h2>
            <div className="h-0.5 w-16 mx-auto mt-4" style={{ background: `linear-gradient(to right, ${BURGUNDY}, transparent)` }} />
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <GlassCard key={i} className="overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-5 md:p-6 text-left group cursor-pointer">
                  <span className="text-lg font-semibold text-[#1c1917] pr-4">{faq.q}</span>
                  <motion.div animate={{ rotate: openFaq === i ? 180 : 0 }} transition={spring}><CaretDown size={20} className="text-[#6b7280] shrink-0" /></motion.div>
                </button>
                <AnimatePresence initial={false}>
                  {openFaq === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={spring} className="overflow-hidden">
                      <p className="px-5 pb-5 md:px-6 md:pb-6 text-[#6b7280] leading-relaxed">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </GlassCard>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ══════ 10. CTA ══════ */}
      <section className="relative z-10 py-20 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${BURGUNDY}, ${BURGUNDY}cc, ${BURGUNDY})` }} />
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <Champagne size={48} weight="fill" className="mx-auto mb-6 text-white/70" />
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-[#1c1917] mb-4">Let&apos;s Create Something Delicious</h2>
          <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">Book your complimentary tasting consultation today and let our chefs design the perfect menu for your event.</p>
          <a href="tel:+12065550298" className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-white text-[#881337] font-bold text-lg hover:bg-white/90 transition-colors">
            <Phone size={20} weight="fill" /> (206) 555-0298
          </a>
        </div>
      </section>

      {/* ══════ 11. CONTACT ══════ */}
      <SectionReveal id="contact" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #f5efe8 50%, ${BG} 100%)` }} />
        <ElegantPattern opacity={0.02} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: BURGUNDY, borderColor: `${BURGUNDY}33`, background: `${BURGUNDY}0d` }}>Contact Us</span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6 text-[#1c1917]">Plan Your Event</h2>
              <p className="text-[#6b7280] leading-relaxed mb-8">Ready to create an unforgettable culinary experience? Contact us to schedule your complimentary consultation.</p>
              <div className="space-y-5">
                {[
                  { icon: MapPin, title: "Location", text: "789 Culinary Blvd, Seattle, WA 98101" },
                  { icon: Phone, title: "Phone", text: "(206) 555-0298" },
                  { icon: Clock, title: "Consultations", text: "Mon-Fri 10AM-6PM, Sat by appointment" },
                  { icon: CalendarCheck, title: "Booking", text: "Book 3-6 months in advance for best availability" },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${BURGUNDY}26` }}>
                      <item.icon size={20} weight="duotone" style={{ color: BURGUNDY }} />
                    </div>
                    <div><p className="text-sm font-semibold text-[#1c1917]">{item.title}</p><p className="text-sm text-[#6b7280]">{item.text}</p></div>
                  </div>
                ))}
              </div>
            </div>
            <GlassCard className="p-8">
              <h3 className="text-xl font-semibold text-[#1c1917] mb-6">Request a Consultation</h3>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className="block text-sm text-[#6b7280] mb-1.5">Name</label><input type="text" className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-[#1c1917] placeholder-gray-400 focus:outline-none text-sm" placeholder="Your name" /></div>
                  <div><label className="block text-sm text-[#6b7280] mb-1.5">Phone</label><input type="tel" className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-[#1c1917] placeholder-gray-400 focus:outline-none text-sm" placeholder="(555) 123-4567" /></div>
                </div>
                <div><label className="block text-sm text-[#6b7280] mb-1.5">Event Type</label>
                  <select className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-[#1c1917] focus:outline-none text-sm">
                    <option value="" className="bg-white">Select event type</option>
                    {services.map((s) => <option key={s.name} value={s.name.toLowerCase()} className="bg-white">{s.name}</option>)}
                  </select>
                </div>
                <div><label className="block text-sm text-[#6b7280] mb-1.5">Event Details</label><textarea rows={4} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-[#1c1917] placeholder-gray-400 focus:outline-none text-sm resize-none" placeholder="Tell us about your event — date, guest count, dietary needs..." /></div>
                <MagneticButton className="w-full py-4 rounded-xl text-base font-semibold text-[#1c1917] flex items-center justify-center gap-2 cursor-pointer" style={{ background: BURGUNDY }}>
                  Schedule Consultation <ArrowRight size={18} weight="bold" />
                </MagneticButton>
              </form>
            </GlassCard>
          </div>
        </div>
      </SectionReveal>

      {/* ══════ 12. FOOTER ══════ */}
      <footer className="relative z-10 border-t border-gray-100 py-10 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #f0e8df 100%)` }} />
        <ElegantPattern opacity={0.015} />
        <div className="mx-auto max-w-6xl px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3"><ForkKnife size={22} weight="fill" style={{ color: BURGUNDY }} /><span className="text-lg font-bold text-[#1c1917]">Ember &amp; Oak Catering</span></div>
              <p className="text-sm text-[#9ca3af] leading-relaxed">Award-winning catering for weddings, corporate events, and private dining.</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[#1c1917] mb-3">Quick Links</h4>
              <div className="space-y-2">
                {["Services", "Gallery", "About", "Contact"].map((link) => <a key={link} href={`#${link.toLowerCase()}`} className="block text-sm text-[#9ca3af] hover:text-[#1c1917] transition-colors">{link}</a>)}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[#1c1917] mb-3">Contact</h4>
              <div className="space-y-2 text-sm text-[#9ca3af]">
                <p>(206) 555-0298</p>
                <p>789 Culinary Blvd, Seattle, WA 98101</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-100 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-[#9ca3af]"><ForkKnife size={14} weight="fill" style={{ color: BURGUNDY }} /><span>Ember &amp; Oak Catering &copy; {new Date().getFullYear()}</span></div>
            <div className="flex items-center gap-2 text-xs text-[#6b7280]">
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" /></svg>
              <span>Website created by Bluejay Business Solutions</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
