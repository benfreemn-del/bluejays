"use client";

/* eslint-disable @next/next/no-img-element -- Static marketing showcase uses plain img tags */
/* eslint-disable react-hooks/purity -- Decorative particle values are intentionally randomized */

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
  Leaf,
  Fire,
  Envelope,
  Heart,
  Medal,
  Play,
  Lightning,
  HandHeart,
  Crown,
  GraduationCap,
} from "@phosphor-icons/react";

/* ───────────────── SPRING / ANIMATION ───────────────── */
const spring = { type: "spring" as const, stiffness: 100, damping: 20 };
const springFast = { type: "spring" as const, stiffness: 200, damping: 25 };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const fadeUp = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: spring } };

/* ───────────────── COLORS ───────────────── */
const BG = "#1c1917";
const BG_LIGHT = "#292524";
const COPPER = "#c2703e";
const COPPER_GLOW = "#d4874f";
const CREAM = "#f5efe6";
const WARM_GRAY = "#a8a29e";

/* ───────────────── PARTICLES ───────────────── */
function FloatingEmbers() {
  const embers = Array.from({ length: 18 }, (_, i) => ({
    id: i, x: Math.random() * 100, delay: Math.random() * 8, duration: 7 + Math.random() * 7,
    size: 2 + Math.random() * 3, opacity: 0.1 + Math.random() * 0.2, isCopper: Math.random() > 0.4,
  }));
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden hidden md:block">
      {embers.map((p) => (
        <motion.div key={p.id} className="absolute rounded-full"
          style={{ left: `${p.x}%`, width: p.size, height: p.size, background: p.isCopper ? `${COPPER}88` : `${CREAM}44`, willChange: "transform, opacity" }}
          animate={{ y: ["110vh", "-10vh"], opacity: [0, p.opacity, p.opacity, 0] }}
          transition={{ y: { duration: p.duration, repeat: Infinity, delay: p.delay, ease: "linear" }, opacity: { duration: p.duration, repeat: Infinity, delay: p.delay, times: [0, 0.1, 0.9, 1] } }}
        />
      ))}
    </div>
  );
}

/* ───────────────── WOOD GRAIN PATTERN ───────────────── */
function WoodGrainPattern({ opacity = 0.03 }: { opacity?: number }) {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }}>
      <defs>
        <pattern id="woodGrain" width="80" height="80" patternUnits="userSpaceOnUse">
          <path d="M0 20 Q40 15 80 20" fill="none" stroke={COPPER} strokeWidth="0.5" />
          <path d="M0 40 Q40 35 80 40" fill="none" stroke={COPPER} strokeWidth="0.3" />
          <path d="M0 60 Q40 55 80 60" fill="none" stroke={COPPER} strokeWidth="0.5" />
          <circle cx="20" cy="40" r="1.5" fill={COPPER} opacity="0.2" />
          <circle cx="60" cy="20" r="1" fill={COPPER} opacity="0.15" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#woodGrain)" />
    </svg>
  );
}

/* ───────────────── UTILITY COMPONENTS ───────────────── */
function GlassCard({ children, className = "", style, id, onClick, href }: { children: React.ReactNode; className?: string; style?: React.CSSProperties; id?: string; onClick?: () => void; href?: string }) {
  if (href) {
    return <a href={href} id={id} onClick={onClick} className={`rounded-2xl border border-white/[0.13] bg-white/[0.07] backdrop-blur-xl ${className}`} style={style}>{children}</a>;
  }
  return <div id={id} onClick={onClick} className={`rounded-2xl border border-white/[0.13] bg-white/[0.07] backdrop-blur-xl ${className}`} style={style}>{children}</div>;
}

function SectionReveal({ children, className = "", id, style }: { children: React.ReactNode; className?: string; id?: string; style?: React.CSSProperties }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return <motion.section ref={ref} id={id} className={className} style={style} initial={{ opacity: 0, y: 50 }} animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }} transition={spring}>{children}</motion.section>;
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
      <motion.div className="absolute inset-0 rounded-2xl" style={{ background: `conic-gradient(from 0deg, transparent, ${COPPER}, transparent, ${COPPER_GLOW}, transparent)`, willChange: "transform" }} animate={{ rotate: [0, 360] }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} />
      <div className="relative rounded-2xl z-10" style={{ background: BG_LIGHT }}>{children}</div>
    </div>
  );
}

function SectionBadge({ text }: { text: string }) {
  return <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: COPPER, borderColor: `${COPPER}44`, background: `${COPPER}15` }}>{text}</span>;
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <>
      <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight" style={{ color: CREAM }}>{children}</h2>
      <div className="h-0.5 w-16 mx-auto mt-4" style={{ background: `linear-gradient(to right, ${COPPER}, transparent)` }} />
    </>
  );
}

function CopperDivider() {
  return <div className="w-full h-px" style={{ background: `linear-gradient(to right, transparent, ${COPPER}44, transparent)` }} />;
}

/* ───────────────── DATA ───────────────── */
const eventTypes = [
  { name: "Weddings", desc: "Bespoke menus for your most unforgettable day, from cocktail hour through the last dance.", icon: Heart, img: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600&q=80" },
  { name: "Corporate Events", desc: "Professional catering for conferences, product launches, and annual galas that impress.", icon: Users, img: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80" },
  { name: "Private Dining", desc: "Intimate chef-driven dinners in your home with white-glove service and curated wine pairings.", icon: ForkKnife, img: "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=600&q=80" },
  { name: "Holiday Parties", desc: "Festive seasonal celebrations with themed menus, signature cocktails, and stunning presentation.", icon: Champagne, img: "https://images.unsplash.com/photo-1482275548304-a58859dc31b7?w=600&q=80" },
  { name: "Non-Profit Galas", desc: "Elegant fundraiser dining that elevates your mission with world-class cuisine and service.", icon: HandHeart, img: "https://images.unsplash.com/photo-1529543544282-ea669407fca3?w=600&q=80" },
];

const menuItems = {
  appetizers: [
    "Seared Ahi Tuna on Crispy Wonton",
    "Truffle Burrata with Heirloom Tomatoes",
    "Smoked Salmon Blini with Creme Fraiche",
    "Wild Mushroom Arancini with Saffron Aioli",
  ],
  mains: [
    "Pan-Roasted Pacific Halibut, Beurre Blanc",
    "Herb-Crusted Rack of Lamb, Mint Gremolata",
    "Filet Mignon with Cognac Peppercorn Sauce",
    "Wild King Salmon, Cedar Plank Roasted",
  ],
  desserts: [
    "Valrhona Chocolate Lava Cake",
    "Lavender Creme Brulee",
    "Seasonal Fruit Tart, Frangipane",
    "Espresso Panna Cotta, Amaretti Crumble",
  ],
};

const stats = [
  { value: "2,000+", label: "Events Catered" },
  { value: "12", label: "Years Experience" },
  { value: "50-500", label: "Guest Capacity" },
  { value: "4.9", label: "Google Rating" },
];

const galleryImages = [
  {
    src: "https://images.unsplash.com/photo-1555244162-803834f70033?w=600&q=80",
    caption: "Plated Entree",
    desc: "Pan-seared halibut with seasonal vegetables",
  },
  {
    src: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600&q=80",
    caption: "Appetizer Course",
    desc: "Artisan charcuterie and crostini display",
  },
  {
    src: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80",
    caption: "Chef Preparation",
    desc: "Chef Adriana plating in our kitchen",
  },
  {
    src: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600&q=80",
    caption: "Dessert Presentation",
    desc: "Handcrafted seasonal dessert course",
  },
  {
    src: "https://images.unsplash.com/photo-1547573854-74d2a71d0826?w=600&q=80",
    caption: "Elegant Table Setting",
    desc: "Custom tablescaping for a 200-guest gala",
  },
  {
    src: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&q=80",
    caption: "Gala Event Service",
    desc: "White-glove service at Museum of Pop Culture",
  },
];

const testimonials = [
  { name: "Amanda & James W.", role: "Wedding, 320 Guests", text: "Chef Adriana catered our wedding and every single dish was perfection. Our guests are still raving about the food months later. The truffle risotto was unforgettable.", rating: 5 },
  { name: "Robert Chen", role: "Tech Summit, 200 Guests", text: "We have used Ember & Oak for three corporate galas now. The presentation is stunning and the food is consistently exceptional. True professionals who understand the corporate event world.", rating: 5 },
  { name: "Lisa Martinez", role: "Anniversary Dinner, 12 Guests", text: "The private dinner party they did for our anniversary was magical. It felt like having a Michelin-star restaurant in our home. Chef Adriana personally designed every course.", rating: 5 },
  { name: "David Nakamura", role: "Non-Profit Gala, 400 Guests", text: "Ember & Oak elevated our annual fundraiser to another level. The passed appetizers, the plated dinner, the dessert bar — every detail was flawless. Our donors were thrilled.", rating: 5 },
];

const dietaryBadges = [
  { label: "Vegan", icon: Leaf },
  { label: "Gluten-Free", icon: ShieldCheck },
  { label: "Kosher", icon: Star },
  { label: "Halal", icon: CheckCircle },
  { label: "Nut-Free", icon: ShieldCheck },
];

const packages = [
  { tier: "Cocktail Hour", price: "35", unit: "/person", features: ["3 Passed Appetizers", "Charcuterie Display", "Signature Cocktail", "Service Staff", "2-Hour Service"], popular: false },
  { tier: "Full Service", price: "75", unit: "/person", features: ["Cocktail Hour + Dinner", "3-Course Plated Meal", "Wine Service", "Full Staff & Setup", "Cleanup Included"], popular: true },
  { tier: "Premium Experience", price: "125", unit: "/person", features: ["Everything in Full Service", "5-Course Tasting Menu", "Sommelier Wine Pairings", "Tableside Preparations", "Custom Dessert Bar"], popular: false },
];

const processSteps = [
  { step: "01", title: "Tasting Consultation", desc: "We meet to discuss your vision, sample dishes, and design a menu that reflects your style and palette." },
  { step: "02", title: "Menu Design", desc: "Chef Adriana crafts a custom menu with seasonal ingredients, dietary accommodations, and beautiful presentation." },
  { step: "03", title: "Event Coordination", desc: "We handle staffing, rentals, timing, and logistics so you can focus on enjoying your event." },
  { step: "04", title: "Flawless Execution", desc: "Our team delivers an impeccable experience from setup to the last plate, leaving your guests amazed." },
];

const comparisonRows = [
  { feature: "Custom Menu Design", us: true, them: "Template menus" },
  { feature: "Le Cordon Bleu Trained Chef", us: true, them: "No" },
  { feature: "Complimentary Tasting", us: true, them: "Sometimes" },
  { feature: "Dietary Accommodation", us: true, them: "Limited" },
  { feature: "Full Setup & Cleanup", us: true, them: "Extra charge" },
  { feature: "On-Site Chef Service", us: true, them: "Varies" },
  { feature: "Sommelier Wine Pairing", us: true, them: "No" },
];

const quizOptions = [
  { label: "Wedding", emoji: "Ring", desc: "Intimate ceremony to grand reception", color: `${COPPER}` },
  { label: "Corporate", emoji: "Briefcase", desc: "Conferences, galas, team events", color: `${COPPER}cc` },
  { label: "Private Dining", emoji: "Candle", desc: "Dinner parties and celebrations", color: `${COPPER}99` },
  { label: "Holiday Party", emoji: "Sparkle", desc: "Seasonal and festive gatherings", color: `${COPPER}ee` },
];

const faqs = [
  { q: "How far in advance should I book?", a: "We recommend booking 3-6 months in advance for weddings and large events. Corporate events can often be arranged with 2-4 weeks notice depending on scale." },
  { q: "Do you accommodate dietary restrictions?", a: "Absolutely. Chef Adriana specializes in crafting menus that accommodate vegan, gluten-free, kosher, halal, and allergy-specific needs without compromising flavor or presentation." },
  { q: "What is included in your catering packages?", a: "Our packages include menu planning, food preparation, professional service staff, setup, cleanup, and all necessary equipment. Premium packages add wine service and tableside preparations." },
  { q: "Can we schedule a tasting?", a: "Yes! We offer complimentary tastings for events over 50 guests. Smaller events can arrange tastings for a nominal fee that is applied to your final booking." },
  { q: "Do you provide bar service?", a: "We offer full bar service including signature cocktails, wine pairings, and craft beverage stations. Our sommelier can curate a wine menu to complement your courses." },
  { q: "What is your cancellation policy?", a: "We understand plans change. Events cancelled 60+ days out receive a full refund minus the tasting fee. 30-60 days out receives a 50% refund. Under 30 days, the deposit is non-refundable but can be applied to a rescheduled date within 12 months." },
  { q: "Do you handle rentals and decor?", a: "We partner with Seattle's top rental companies for tables, chairs, linens, flatware, and glassware. We coordinate all rental logistics as part of our Full Service and Premium packages." },
];

/* ═══════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════ */
export default function V2CateringShowcase() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [activeMenu, setActiveMenu] = useState<"appetizers" | "mains" | "desserts">("appetizers");
  const [quizChoice, setQuizChoice] = useState<number | null>(null);

  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden" style={{ background: BG, color: CREAM, fontFamily: "'Georgia', 'Times New Roman', serif" }}>
      <FloatingEmbers />

      {/* ══════ 1. NAV ══════ */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-4">
          <GlassCard className="flex items-center justify-between px-4 md:px-6 py-3">
            <div className="flex items-center gap-2">
              <Fire size={24} weight="fill" style={{ color: COPPER }} />
              <span className="text-lg font-bold tracking-tight" style={{ color: CREAM, fontFamily: "'Georgia', serif" }}>Ember &amp; Oak</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm" style={{ color: WARM_GRAY, fontFamily: "system-ui, sans-serif" }}>
              <a href="#events" className="hover:text-white transition-colors">Events</a>
              <a href="#menu" className="hover:text-white transition-colors">Menu</a>
              <a href="#gallery" className="hover:text-white transition-colors">Gallery</a>
              <a href="#chef" className="hover:text-white transition-colors">Chef</a>
              <a href="#contact" className="hover:text-white transition-colors">Contact</a>
            </div>
            <div className="flex items-center gap-3">
              <MagneticButton className="px-4 md:px-5 py-2 rounded-full text-sm font-semibold text-white transition-colors cursor-pointer" style={{ background: COPPER }}>
                Request a Tasting
              </MagneticButton>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors" style={{ color: CREAM }}>
                {mobileMenuOpen ? <X size={24} /> : <List size={24} />}
              </button>
            </div>
          </GlassCard>
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="md:hidden mt-2 overflow-hidden">
                <GlassCard className="flex flex-col gap-1 px-4 py-4">
                  {["Events", "Menu", "Gallery", "Chef", "Contact"].map((l) => (
                    <a key={l} href={`#${l.toLowerCase()}`} onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-lg text-sm hover:bg-white/10 transition-colors" style={{ color: WARM_GRAY }}>{l}</a>
                  ))}
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* ══════ 2. HERO — SPLIT-SCREEN WITH FOOD PHOTOGRAPHY ══════ */}
      <section className="relative min-h-[100dvh] flex items-stretch pt-20 z-10 overflow-hidden">
        <div className="absolute inset-0" style={{ background: BG }} />
        {/* Left half — food photo edge-to-edge */}
        <div className="hidden lg:block absolute top-0 left-0 w-1/2 h-full">
          <img
            src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=900&q=80"
            alt="Beautifully plated dish by Ember and Oak Catering"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0" style={{ background: `linear-gradient(to right, transparent 60%, ${BG} 100%)` }} />
          <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${BG}99 0%, transparent 30%)` }} />
        </div>
        {/* Copper divider line */}
        <div className="hidden lg:block absolute top-0 left-1/2 w-px h-full z-20" style={{ background: `linear-gradient(to bottom, transparent, ${COPPER}, ${COPPER}, transparent)` }} />
        {/* Right half — content */}
        <div className="relative z-10 w-full lg:w-1/2 lg:ml-auto flex items-center">
          <div className="px-6 md:px-12 lg:px-16 py-20 w-full max-w-2xl">
            {/* Mobile hero image */}
            <div className="lg:hidden mb-8 rounded-2xl overflow-hidden border border-white/15">
              <img src="https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&q=80" alt="Beautifully plated dish" className="w-full h-64 object-cover" />
            </div>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.1 }} className="text-sm uppercase tracking-[0.3em] mb-6" style={{ color: COPPER, fontFamily: "system-ui, sans-serif" }}>
              Ember &amp; Oak Catering
            </motion.p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl tracking-tight leading-[1.1] font-bold mb-6" style={{ color: CREAM }}>
              <WordReveal text="Elevated Dining, Anywhere You Want It" />
            </h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.4 }} className="text-lg mb-8 leading-relaxed" style={{ color: WARM_GRAY, fontFamily: "system-ui, sans-serif" }}>
              From intimate dinner parties to 500-guest galas, Chef Adriana Reyes and our team craft unforgettable culinary experiences with the finest Pacific Northwest ingredients.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.6 }} className="flex flex-wrap gap-4 mb-10">
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white flex items-center gap-2 cursor-pointer" style={{ background: COPPER }}>
                Request a Tasting <ArrowRight size={18} weight="bold" />
              </MagneticButton>
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold border flex items-center gap-2 cursor-pointer" style={{ color: CREAM, borderColor: `${COPPER}66` }}>
                <Phone size={18} weight="duotone" /> (206) 555-0731
              </MagneticButton>
            </motion.div>
            {/* Trust badges */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="flex flex-wrap gap-3">
              {["Le Cordon Bleu Trained", "4.9-Star Rated", "12 Years Experience"].map((badge) => (
                <span key={badge} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border" style={{ color: COPPER, borderColor: `${COPPER}33`, background: `${COPPER}0d`, fontFamily: "system-ui, sans-serif" }}>
                  <CheckCircle size={14} weight="fill" /> {badge}
                </span>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════ 3. STATS BAR ══════ */}
      <SectionReveal className="relative z-10 py-16 overflow-hidden border-y" style={{ borderColor: `${COPPER}22` }}>
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG_LIGHT} 0%, ${BG} 100%)` }} />
        <WoodGrainPattern opacity={0.02} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => {
              const icons = [ForkKnife, Clock, Users, Star];
              const Icon = icons[i];
              return (
                <div key={stat.label} className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Icon size={22} weight="fill" style={{ color: COPPER }} />
                    <span className="text-3xl md:text-4xl font-extrabold" style={{ color: CREAM }}>{stat.value}</span>
                  </div>
                  <span className="text-sm font-medium tracking-wide uppercase" style={{ color: WARM_GRAY, fontFamily: "system-ui, sans-serif" }}>{stat.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </SectionReveal>

      {/* ══════ 4. EVENT TYPE CARDS ══════ */}
      <SectionReveal id="events" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, ${BG_LIGHT} 50%, ${BG} 100%)` }} />
        <WoodGrainPattern />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <SectionBadge text="Events We Cater" />
            <SectionHeading>Every Occasion, Elevated</SectionHeading>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {eventTypes.map((event) => {
              const Icon = event.icon;
              return (
                <div key={event.name} className="group relative rounded-2xl overflow-hidden border border-white/[0.10] hover:border-white/15 transition-all duration-500">
                  <img src={event.img} alt={event.name} className="w-full h-52 object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon size={20} weight="fill" style={{ color: COPPER }} />
                      <h3 className="text-lg font-bold text-white">{event.name}</h3>
                    </div>
                    <p className="text-sm text-white/70 leading-relaxed" style={{ fontFamily: "system-ui, sans-serif" }}>{event.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </SectionReveal>

      {/* ══════ 5. SAMPLE MENU ══════ */}
      <SectionReveal id="menu" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, ${BG_LIGHT} 50%, ${BG} 100%)` }} />
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <SectionBadge text="Sample Menu" />
            <SectionHeading>A Taste of What Awaits</SectionHeading>
          </div>
          {/* Menu tabs */}
          <div className="flex justify-center gap-2 mb-12">
            {(["appetizers", "mains", "desserts"] as const).map((cat) => (
              <button key={cat} onClick={() => setActiveMenu(cat)} className="px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 cursor-pointer capitalize" style={{ background: activeMenu === cat ? COPPER : `${COPPER}15`, color: activeMenu === cat ? "white" : COPPER, border: `1px solid ${activeMenu === cat ? COPPER : `${COPPER}33`}`, fontFamily: "system-ui, sans-serif" }}>
                {cat}
              </button>
            ))}
          </div>
          {/* Menu items */}
          <AnimatePresence mode="wait">
            <motion.div key={activeMenu} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={spring} className="space-y-0">
              {menuItems[activeMenu].map((item, i) => (
                <div key={item} className="flex items-center gap-4 py-5 border-b" style={{ borderColor: `${COPPER}15` }}>
                  <span className="text-xs font-mono shrink-0" style={{ color: COPPER }}>{String(i + 1).padStart(2, "0")}</span>
                  <div className="flex-1 h-px" style={{ background: `repeating-linear-gradient(to right, ${COPPER}22, ${COPPER}22 2px, transparent 2px, transparent 8px)` }} />
                  <span className="text-lg font-medium" style={{ color: CREAM }}>{item}</span>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
          <p className="text-center mt-8 text-sm" style={{ color: WARM_GRAY, fontFamily: "system-ui, sans-serif" }}>
            All menus are fully customizable. Chef Adriana designs each course around your preferences, dietary needs, and seasonal availability.
          </p>
        </div>
      </SectionReveal>

      {/* ══════ 6. CHEF ADRIANA SPOTLIGHT ══════ */}
      <SectionReveal id="chef" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, ${BG_LIGHT} 50%, ${BG} 100%)` }} />
        <WoodGrainPattern opacity={0.02} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="relative">
              <div className="rounded-2xl overflow-hidden border border-white/[0.13]">
                <img src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=600&q=80" alt="Chef Adriana Reyes" className="w-full h-[450px] object-cover object-top" />
              </div>
              <div className="absolute -bottom-4 -right-4 md:bottom-6 md:-right-6">
                <div className="px-5 py-3 rounded-xl backdrop-blur-md border text-white font-bold text-sm shadow-lg" style={{ background: `${COPPER}dd`, borderColor: `${COPPER}80` }}>
                  <GraduationCap size={16} weight="fill" className="inline mr-1.5" style={{ verticalAlign: "text-bottom" }} />
                  Le Cordon Bleu Trained
                </div>
              </div>
              <div className="absolute -top-3 -left-3 md:top-6 md:-left-6">
                <div className="px-4 py-2 rounded-xl backdrop-blur-md border text-white font-bold text-xs shadow-lg" style={{ background: `${BG}dd`, borderColor: `${COPPER}44` }}>
                  Former Canlis Sous Chef
                </div>
              </div>
            </div>
            <div>
              <SectionBadge text="Meet the Chef" />
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6" style={{ color: CREAM }}>Chef Adriana Reyes</h2>
              <p className="leading-relaxed mb-4" style={{ color: WARM_GRAY, fontFamily: "system-ui, sans-serif" }}>
                With 12 years of culinary mastery, Chef Adriana brings Le Cordon Bleu training and her experience as sous chef at Seattle&apos;s legendary Canlis restaurant to every event she touches.
              </p>
              <p className="leading-relaxed mb-8" style={{ color: WARM_GRAY, fontFamily: "system-ui, sans-serif" }}>
                Her philosophy is simple: honor the ingredient, elevate the experience, and craft menus that tell a story. Every dish at Ember &amp; Oak reflects her commitment to seasonal Pacific Northwest sourcing and global culinary technique.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: GraduationCap, label: "Le Cordon Bleu" },
                  { icon: Crown, label: "Former Canlis Chef" },
                  { icon: Medal, label: "Award-Winning" },
                  { icon: Leaf, label: "Farm-to-Table" },
                ].map((badge) => (
                  <GlassCard key={badge.label} className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${COPPER}22` }}>
                      <badge.icon size={20} weight="duotone" style={{ color: COPPER }} />
                    </div>
                    <span className="text-sm font-semibold" style={{ color: CREAM, fontFamily: "system-ui, sans-serif" }}>{badge.label}</span>
                  </GlassCard>
                ))}
              </div>
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* ══════ 7. DIETARY ACCOMMODATIONS ══════ */}
      <SectionReveal className="relative z-10 py-16 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, ${BG_LIGHT} 100%)` }} />
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <div className="text-center mb-10">
            <SectionBadge text="Dietary Accommodations" />
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight" style={{ color: CREAM }}>Every Guest Deserves an Extraordinary Meal</h2>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {dietaryBadges.map((badge) => {
              const Icon = badge.icon;
              return (
                <div key={badge.label} className="flex items-center gap-3 px-6 py-4 rounded-2xl border" style={{ borderColor: `${COPPER}33`, background: `${COPPER}0a` }}>
                  <Icon size={22} weight="duotone" style={{ color: COPPER }} />
                  <span className="text-sm font-semibold" style={{ color: CREAM, fontFamily: "system-ui, sans-serif" }}>{badge.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </SectionReveal>

      {/* ══════ 8. CUISINE STYLES WE OFFER ══════ */}
      <SectionReveal className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG_LIGHT} 0%, ${BG} 50%, ${BG_LIGHT} 100%)` }} />
        <WoodGrainPattern opacity={0.02} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <SectionBadge text="Our Cuisine" />
            <SectionHeading>Global Techniques, Local Ingredients</SectionHeading>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: "Pacific Northwest", desc: "Wild salmon, Dungeness crab, foraged mushrooms, Walla Walla onions" },
              { name: "French Classical", desc: "Le Cordon Bleu technique with modern Northwest interpretation" },
              { name: "Mediterranean", desc: "Olive oils, fresh herbs, grilled seafood, seasonal vegetables" },
              { name: "Asian Fusion", desc: "Japanese precision meets Pacific Rim flavors and local ingredients" },
              { name: "Italian Rustic", desc: "Handmade pastas, wood-fired inspirations, artisanal cheeses" },
              { name: "Farm-to-Table", desc: "Direct from Washington and Oregon farms to your plate" },
              { name: "Latin American", desc: "Bold flavors, fresh ceviches, mole traditions reimagined" },
              { name: "Plant-Forward", desc: "Elevated vegetable-centric cuisine that satisfies every palate" },
            ].map((style) => (
              <GlassCard key={style.name} className="p-5 text-center hover:border-white/15 transition-all duration-300">
                <h4 className="text-sm font-bold mb-2" style={{ color: COPPER }}>{style.name}</h4>
                <p className="text-xs leading-relaxed" style={{ color: WARM_GRAY, fontFamily: "system-ui, sans-serif" }}>{style.desc}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ══════ 9. PACKAGE PRICING ══════ */}
      <SectionReveal className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG_LIGHT} 0%, ${BG} 50%, ${BG_LIGHT} 100%)` }} />
        <WoodGrainPattern opacity={0.02} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <SectionBadge text="Packages" />
            <SectionHeading>Catering Packages</SectionHeading>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {packages.map((pkg) => (
              <div key={pkg.tier} className={pkg.popular ? "" : ""}>
                {pkg.popular ? (
                  <ShimmerBorder>
                    <div className="p-8 rounded-2xl relative">
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold" style={{ background: COPPER, color: "white", fontFamily: "system-ui, sans-serif" }}>Most Popular</div>
                      <h3 className="text-lg font-bold mb-2" style={{ color: CREAM }}>{pkg.tier}</h3>
                      <div className="flex items-baseline gap-1 mb-6">
                        <span className="text-xs" style={{ color: COPPER, fontFamily: "system-ui, sans-serif" }}>from</span>
                        <span className="text-4xl font-extrabold" style={{ color: COPPER }}>${pkg.price}</span>
                        <span className="text-sm" style={{ color: WARM_GRAY, fontFamily: "system-ui, sans-serif" }}>{pkg.unit}</span>
                      </div>
                      <ul className="space-y-3 mb-8">
                        {pkg.features.map((f) => (
                          <li key={f} className="flex items-center gap-2 text-sm" style={{ color: WARM_GRAY, fontFamily: "system-ui, sans-serif" }}>
                            <CheckCircle size={16} weight="fill" style={{ color: COPPER }} /> {f}
                          </li>
                        ))}
                      </ul>
                      <MagneticButton className="w-full py-3 rounded-full text-sm font-semibold text-white cursor-pointer" style={{ background: COPPER }}>
                        Request Quote
                      </MagneticButton>
                    </div>
                  </ShimmerBorder>
                ) : (
                  <GlassCard className="p-8 h-full flex flex-col">
                    <h3 className="text-lg font-bold mb-2" style={{ color: CREAM }}>{pkg.tier}</h3>
                    <div className="flex items-baseline gap-1 mb-6">
                      <span className="text-xs" style={{ color: COPPER, fontFamily: "system-ui, sans-serif" }}>from</span>
                      <span className="text-4xl font-extrabold" style={{ color: COPPER }}>${pkg.price}</span>
                      <span className="text-sm" style={{ color: WARM_GRAY, fontFamily: "system-ui, sans-serif" }}>{pkg.unit}</span>
                    </div>
                    <ul className="space-y-3 mb-8 flex-1">
                      {pkg.features.map((f) => (
                        <li key={f} className="flex items-center gap-2 text-sm" style={{ color: WARM_GRAY, fontFamily: "system-ui, sans-serif" }}>
                          <CheckCircle size={16} weight="fill" style={{ color: COPPER }} /> {f}
                        </li>
                      ))}
                    </ul>
                    <MagneticButton className="w-full py-3 rounded-full text-sm font-semibold cursor-pointer border" style={{ color: COPPER, borderColor: `${COPPER}44` }}>
                      Request Quote
                    </MagneticButton>
                  </GlassCard>
                )}
              </div>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ══════ 9. EVENT GALLERY ══════ */}
      <SectionReveal id="gallery" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, ${BG_LIGHT} 50%, ${BG} 100%)` }} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <SectionBadge text="Gallery" />
            <SectionHeading>A Feast for the Eyes</SectionHeading>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {galleryImages.map((img, i) => (
              <div key={i} className={`group relative rounded-2xl overflow-hidden border border-white/[0.10] ${i === 0 || i === 3 ? "md:row-span-2" : ""}`}>
                <img src={img.src} alt={img.caption} className={`w-full object-cover transition-transform duration-700 group-hover:scale-105 ${i === 0 || i === 3 ? "h-64 md:h-full" : "h-48 md:h-56"}`} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <span className="text-sm font-medium text-white" style={{ fontFamily: "system-ui, sans-serif" }}>{img.caption}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ══════ 10. GOOGLE REVIEWS HEADER + TESTIMONIALS ══════ */}
      <SectionReveal className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG_LIGHT} 0%, ${BG} 50%, ${BG_LIGHT} 100%)` }} />
        <WoodGrainPattern opacity={0.015} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          {/* Google Reviews Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border mb-6" style={{ borderColor: `${COPPER}33`, background: `${COPPER}0a` }}>
              <div className="flex gap-0.5">{Array.from({ length: 5 }).map((_, j) => <Star key={j} size={18} weight="fill" style={{ color: COPPER }} />)}</div>
              <span className="text-sm font-semibold" style={{ color: CREAM, fontFamily: "system-ui, sans-serif" }}>4.9 from 180+ Reviews</span>
            </div>
          </div>
          <div className="text-center mb-16">
            <SectionBadge text="Testimonials" />
            <SectionHeading>What Our Clients Say</SectionHeading>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {testimonials.map((t, i) => (
              <GlassCard key={i} className="p-7 h-full flex flex-col">
                <Quotes size={28} weight="fill" style={{ color: COPPER }} className="mb-4 opacity-40" />
                <div className="flex gap-0.5 mb-4">{Array.from({ length: t.rating }).map((_, j) => <Star key={j} size={16} weight="fill" style={{ color: COPPER }} />)}</div>
                <p className="leading-relaxed flex-1 text-sm mb-5" style={{ color: WARM_GRAY, fontFamily: "system-ui, sans-serif" }}>&ldquo;{t.text}&rdquo;</p>
                <div className="pt-4 border-t" style={{ borderColor: `${COPPER}15` }}>
                  <span className="text-sm font-semibold" style={{ color: CREAM }}>{t.name}</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <CheckCircle size={14} weight="fill" style={{ color: COPPER }} />
                    <span className="text-xs" style={{ color: WARM_GRAY, fontFamily: "system-ui, sans-serif" }}>{t.role}</span>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ══════ 11. PROCESS ══════ */}
      <SectionReveal className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, ${BG_LIGHT} 50%, ${BG} 100%)` }} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <SectionBadge text="Our Process" />
            <SectionHeading>From Vision to Table</SectionHeading>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {processSteps.map((step, i) => (
              <div key={step.step} className="relative">
                {i < processSteps.length - 1 && <div className="hidden lg:block absolute top-10 left-[calc(50%+40px)] w-[calc(100%-80px)] h-px" style={{ background: `linear-gradient(to right, ${COPPER}44, ${COPPER}11)` }} />}
                <GlassCard className="p-6 text-center relative">
                  <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-black" style={{ background: `linear-gradient(135deg, ${COPPER}22, ${COPPER}0a)`, color: COPPER, border: `1px solid ${COPPER}33` }}>{step.step}</div>
                  <h3 className="text-lg font-bold mb-2" style={{ color: CREAM }}>{step.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: WARM_GRAY, fontFamily: "system-ui, sans-serif" }}>{step.desc}</p>
                </GlassCard>
              </div>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ══════ 12. COMPETITOR COMPARISON ══════ */}
      <SectionReveal className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG_LIGHT} 0%, ${BG} 100%)` }} />
        <WoodGrainPattern opacity={0.02} />
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <SectionBadge text="Why Choose Us" />
            <SectionHeading>Ember &amp; Oak vs. The Competition</SectionHeading>
          </div>
          <GlassCard className="overflow-hidden">
            <div className="grid grid-cols-3 text-center py-4 px-4 border-b" style={{ borderColor: `${COPPER}22` }}>
              <span className="text-sm font-semibold" style={{ color: WARM_GRAY, fontFamily: "system-ui, sans-serif" }}>Feature</span>
              <span className="text-sm font-bold" style={{ color: COPPER }}>Ember &amp; Oak</span>
              <span className="text-sm font-semibold" style={{ color: WARM_GRAY, fontFamily: "system-ui, sans-serif" }}>Others</span>
            </div>
            {comparisonRows.map((row) => (
              <div key={row.feature} className="grid grid-cols-3 text-center py-4 px-4 border-b last:border-b-0" style={{ borderColor: `${COPPER}11` }}>
                <span className="text-sm text-left" style={{ color: CREAM, fontFamily: "system-ui, sans-serif" }}>{row.feature}</span>
                <span><CheckCircle size={20} weight="fill" style={{ color: "#22c55e" }} className="mx-auto" /></span>
                <span className="text-sm" style={{ color: WARM_GRAY, fontFamily: "system-ui, sans-serif" }}>{row.them}</span>
              </div>
            ))}
          </GlassCard>
        </div>
      </SectionReveal>

      {/* ══════ 13. VIDEO TESTIMONIAL PLACEHOLDER ══════ */}
      <SectionReveal className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, ${BG_LIGHT} 50%, ${BG} 100%)` }} />
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <div className="text-center mb-12">
            <SectionBadge text="Behind the Scenes" />
            <SectionHeading>Watch Our Team in Action</SectionHeading>
          </div>
          <div className="relative rounded-2xl overflow-hidden border border-white/[0.13] group cursor-pointer">
            <img src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=900&q=80" alt="Chef team preparing an event" className="w-full h-[400px] object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <motion.div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: `${COPPER}dd` }} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <Play size={32} weight="fill" className="text-white ml-1" />
              </motion.div>
            </div>
            <div className="absolute bottom-6 left-6 right-6">
              <p className="text-lg font-bold text-white">From Kitchen to Table</p>
              <p className="text-sm text-white/70" style={{ fontFamily: "system-ui, sans-serif" }}>See how Chef Adriana and our team prepare for a 300-guest gala event</p>
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* ══════ 14. OUR CATERING PROMISE ══════ */}
      <SectionReveal className="relative z-10 py-20 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, ${BG_LIGHT} 100%)` }} />
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <ShimmerBorder>
            <div className="p-8 md:p-12">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <Fire size={36} weight="fill" style={{ color: COPPER }} className="mb-4" />
                  <h3 className="text-2xl md:text-3xl font-extrabold mb-4" style={{ color: CREAM }}>The Ember &amp; Oak Promise</h3>
                  <p className="leading-relaxed mb-6" style={{ color: WARM_GRAY, fontFamily: "system-ui, sans-serif" }}>
                    Every event we touch receives the same level of care, creativity, and culinary excellence — whether it is a dinner for twelve or a gala for five hundred. If any aspect does not meet your expectations, we make it right.
                  </p>
                  <ul className="space-y-3">
                    {[
                      "Complimentary tasting for events over 50 guests",
                      "Dedicated event coordinator from start to finish",
                      "Satisfaction guarantee on every dish served",
                      "No hidden fees — transparent pricing always",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm" style={{ color: WARM_GRAY, fontFamily: "system-ui, sans-serif" }}>
                        <CheckCircle size={18} weight="fill" style={{ color: COPPER }} className="shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { value: "100%", label: "Satisfaction Rate" },
                    { value: "48hr", label: "Proposal Delivery" },
                    { value: "12+", label: "Years of Excellence" },
                    { value: "500+", label: "Max Guest Capacity" },
                  ].map((stat) => (
                    <div key={stat.label} className="text-center p-4 rounded-xl" style={{ background: `${COPPER}0a`, border: `1px solid ${COPPER}15` }}>
                      <div className="text-2xl font-extrabold" style={{ color: COPPER }}>{stat.value}</div>
                      <div className="text-xs mt-1" style={{ color: WARM_GRAY, fontFamily: "system-ui, sans-serif" }}>{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ShimmerBorder>
        </div>
      </SectionReveal>

      {/* ══════ 15. TRUSTED BY ══════ */}
      <SectionReveal className="relative z-10 py-16 overflow-hidden">
        <div className="absolute inset-0" style={{ background: BG }} />
        <CopperDivider />
        <div className="max-w-5xl mx-auto px-6 py-10 relative z-10">
          <div className="text-center mb-8">
            <p className="text-xs uppercase tracking-[0.2em] font-bold mb-2" style={{ color: COPPER }}>Trusted By</p>
            <p className="text-sm" style={{ color: WARM_GRAY, fontFamily: "system-ui, sans-serif" }}>Proudly serving Seattle&apos;s premier venues and organizations</p>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            {["Seattle Art Museum", "Fairmont Olympic Hotel", "Museum of Pop Culture", "Pike Place Market Events", "Washington State Convention Center", "Woodland Park Zoo"].map((client) => (
              <span key={client} className="px-5 py-2.5 rounded-full text-xs font-medium border" style={{ color: CREAM, borderColor: `${COPPER}22`, background: `${COPPER}08`, fontFamily: "system-ui, sans-serif" }}>
                {client}
              </span>
            ))}
          </div>
        </div>
        <CopperDivider />
      </SectionReveal>

      {/* ══════ 16. "WHAT'S YOUR EVENT?" QUIZ ══════ */}
      <SectionReveal className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG_LIGHT} 0%, ${BG} 100%)` }} />
        <WoodGrainPattern opacity={0.015} />
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <div className="text-center mb-12">
            <SectionBadge text="Get Started" />
            <SectionHeading>What&apos;s Your Event?</SectionHeading>
            <p className="mt-4 text-sm" style={{ color: WARM_GRAY, fontFamily: "system-ui, sans-serif" }}>Select your event type and we&apos;ll recommend the perfect package.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {quizOptions.map((opt, i) => (
              <button key={opt.label} onClick={() => setQuizChoice(i)} className="p-6 rounded-2xl border text-center transition-all duration-300 cursor-pointer" style={{ borderColor: quizChoice === i ? COPPER : `${COPPER}22`, background: quizChoice === i ? `${COPPER}15` : `${COPPER}05` }}>
                <div className="text-3xl mb-3">{opt.label === "Wedding" ? "\u2728" : opt.label === "Corporate" ? "\uD83C\uDFE2" : opt.label === "Private Dining" ? "\uD83C\uDF7D\uFE0F" : "\uD83C\uDF89"}</div>
                <h4 className="text-sm font-bold mb-1" style={{ color: CREAM }}>{opt.label}</h4>
                <p className="text-xs" style={{ color: WARM_GRAY, fontFamily: "system-ui, sans-serif" }}>{opt.desc}</p>
              </button>
            ))}
          </div>
          <AnimatePresence>
            {quizChoice !== null && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={spring}>
                <GlassCard className="p-6 text-center">
                  <Lightning size={28} weight="fill" style={{ color: COPPER }} className="mx-auto mb-3" />
                  <p className="font-bold mb-2" style={{ color: CREAM }}>
                    {quizChoice === 0 ? "We recommend our Full Service or Premium Experience package for weddings." : quizChoice === 1 ? "Our Corporate packages include Full Service with custom branding options." : quizChoice === 2 ? "Our Cocktail Hour or Full Service package is perfect for intimate gatherings." : "Holiday parties shine with our Full Service package and signature cocktails."}
                  </p>
                  <p className="text-sm mb-4" style={{ color: WARM_GRAY, fontFamily: "system-ui, sans-serif" }}>Book a complimentary tasting consultation to explore your options.</p>
                  <MagneticButton className="px-8 py-3 rounded-full text-sm font-semibold text-white cursor-pointer" style={{ background: COPPER }}>
                    Schedule a Tasting <ArrowRight size={16} weight="bold" className="inline ml-1" />
                  </MagneticButton>
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </SectionReveal>

      {/* ══════ 15. WHAT SETS US APART ══════ */}
      <SectionReveal className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, ${BG_LIGHT} 50%, ${BG} 100%)` }} />
        <WoodGrainPattern opacity={0.02} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <SectionBadge text="The Ember & Oak Difference" />
            <SectionHeading>What Sets Us Apart</SectionHeading>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Leaf, title: "Pacific NW Sourced", desc: "We partner with local farms, fisheries, and artisan producers to bring the freshest seasonal ingredients to your event. Every dish tells a story of our region." },
              { icon: Wine, title: "Sommelier Wine Service", desc: "Our in-house sommelier curates wine pairings for every course, sourcing from Washington and Oregon vineyards alongside international selections." },
              { icon: CookingPot, title: "On-Site Chef Experience", desc: "Chef Adriana or a senior chef is always on-site at your event, overseeing every plate and providing a live culinary experience for your guests." },
              { icon: Users, title: "Dedicated Event Team", desc: "Every event gets a dedicated coordinator, from initial consultation through the last plate. One point of contact who knows your vision inside and out." },
              { icon: Star, title: "Custom Everything", desc: "No template menus. Every dish, presentation style, and service detail is designed from scratch around your preferences, dietary needs, and budget." },
              { icon: ShieldCheck, title: "Full-Service Execution", desc: "We handle staffing, rentals, setup, service, and complete cleanup. You show up to your own event as a guest, not a coordinator." },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <GlassCard key={item.title} className="p-7">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ background: `${COPPER}22`, border: `1px solid ${COPPER}33` }}>
                    <Icon size={24} weight="duotone" style={{ color: COPPER }} />
                  </div>
                  <h3 className="text-lg font-bold mb-2" style={{ color: CREAM }}>{item.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: WARM_GRAY, fontFamily: "system-ui, sans-serif" }}>{item.desc}</p>
                </GlassCard>
              );
            })}
          </div>
        </div>
      </SectionReveal>

      {/* ══════ 16. ENHANCED SERVICE AREA ══════ */}
      <SectionReveal className="relative z-10 py-20 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG_LIGHT} 0%, ${BG} 100%)` }} />
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <div className="text-center mb-12">
            <SectionBadge text="Service Area" />
            <SectionHeading>Serving Greater Seattle</SectionHeading>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <GlassCard className="p-6 text-center">
              <MapPin size={32} weight="duotone" style={{ color: COPPER }} className="mx-auto mb-4" />
              <h3 className="text-lg font-bold mb-2" style={{ color: CREAM }}>Coverage Area</h3>
              <p className="text-sm" style={{ color: WARM_GRAY, fontFamily: "system-ui, sans-serif" }}>Seattle, Bellevue, Kirkland, Redmond, Tacoma, Mercer Island, and surrounding areas within 50 miles of downtown Seattle.</p>
            </GlassCard>
            <GlassCard className="p-6 text-center">
              <Clock size={32} weight="duotone" style={{ color: COPPER }} className="mx-auto mb-4" />
              <h3 className="text-lg font-bold mb-2" style={{ color: CREAM }}>Response Time</h3>
              <p className="text-sm" style={{ color: WARM_GRAY, fontFamily: "system-ui, sans-serif" }}>Proposals delivered within 48 hours of consultation. Rush planning available for events within 2 weeks for corporate clients.</p>
            </GlassCard>
            <GlassCard className="p-6 text-center">
              <div className="relative mx-auto w-fit mb-4">
                <CalendarCheck size={32} weight="duotone" style={{ color: COPPER }} />
                <motion.div className="absolute -top-1 -right-1 w-3 h-3 rounded-full" style={{ background: "#22c55e" }} animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }} transition={{ duration: 2, repeat: Infinity }} />
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: CREAM }}>Availability</h3>
              <p className="text-sm" style={{ color: WARM_GRAY, fontFamily: "system-ui, sans-serif" }}>Currently booking for Summer and Fall 2026. Weekend dates fill quickly. Contact us early for the best availability.</p>
            </GlassCard>
          </div>
        </div>
      </SectionReveal>

      {/* ══════ 17. URGENCY / BOOKING STRIP ══════ */}
      <div className="relative z-10 py-6 overflow-hidden border-y" style={{ borderColor: `${COPPER}22`, background: `linear-gradient(90deg, ${BG_LIGHT}, ${BG}, ${BG_LIGHT})` }}>
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <motion.div className="w-3 h-3 rounded-full" style={{ background: COPPER }} animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
            <span className="text-sm font-semibold" style={{ color: CREAM, fontFamily: "system-ui, sans-serif" }}>Limited Summer 2026 Dates Available</span>
          </div>
          <div className="flex items-center gap-2 text-sm" style={{ color: WARM_GRAY, fontFamily: "system-ui, sans-serif" }}>
            <Phone size={16} weight="fill" style={{ color: COPPER }} />
            <span>Call now to reserve your date:</span>
            <a href="tel:+12065550731" className="font-bold hover:underline" style={{ color: COPPER }}>(206) 555-0731</a>
          </div>
        </div>
      </div>

      {/* ══════ 18. CERTIFICATIONS / PARTNER BADGES ══════ */}
      <SectionReveal className="relative z-10 py-16 overflow-hidden">
        <div className="absolute inset-0" style={{ background: BG }} />
        <CopperDivider />
        <div className="max-w-5xl mx-auto px-6 py-10 relative z-10">
          <div className="text-center mb-8">
            <p className="text-xs uppercase tracking-[0.2em] font-bold" style={{ color: COPPER }}>Trusted &amp; Certified</p>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {["Licensed & Insured", "ServSafe Certified", "Health Dept. A-Rating", "WACS Member", "Local Sourcing Partner", "Green Business Certified"].map((cert) => (
              <span key={cert} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium border" style={{ color: WARM_GRAY, borderColor: `${COPPER}22`, background: `${COPPER}08`, fontFamily: "system-ui, sans-serif" }}>
                <ShieldCheck size={14} weight="fill" style={{ color: COPPER }} /> {cert}
              </span>
            ))}
          </div>
        </div>
        <CopperDivider />
      </SectionReveal>

      {/* ══════ SEASONAL HIGHLIGHTS ══════ */}
      <SectionReveal className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, ${BG_LIGHT} 50%, ${BG} 100%)` }} />
        <WoodGrainPattern opacity={0.015} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <SectionBadge text="Seasonal Menus" />
            <SectionHeading>Inspired by the Seasons</SectionHeading>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                season: "Spring",
                months: "Mar - May",
                highlights: ["Dungeness Crab", "Morel Mushrooms", "Ramps & Fiddleheads", "Pacific Halibut"],
                color: "#6ee7b7",
              },
              {
                season: "Summer",
                months: "Jun - Aug",
                highlights: ["Copper River Salmon", "Heirloom Tomatoes", "Stone Fruit", "Fresh Herbs"],
                color: "#fbbf24",
              },
              {
                season: "Autumn",
                months: "Sep - Nov",
                highlights: ["Wild Mushrooms", "Butternut Squash", "Pear & Apple", "Venison"],
                color: COPPER,
              },
              {
                season: "Winter",
                months: "Dec - Feb",
                highlights: ["Root Vegetables", "Truffles", "Citrus", "Braised Short Rib"],
                color: "#93c5fd",
              },
            ].map((s) => (
              <GlassCard key={s.season} className="p-6 hover:border-white/15 transition-all duration-300">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 rounded-full" style={{ background: s.color }} />
                  <h3 className="text-lg font-bold" style={{ color: CREAM }}>{s.season}</h3>
                </div>
                <p className="text-xs mb-4" style={{ color: WARM_GRAY, fontFamily: "system-ui, sans-serif" }}>{s.months}</p>
                <ul className="space-y-2">
                  {s.highlights.map((h) => (
                    <li key={h} className="flex items-center gap-2 text-sm" style={{ color: WARM_GRAY, fontFamily: "system-ui, sans-serif" }}>
                      <Leaf size={14} weight="fill" style={{ color: s.color }} />
                      {h}
                    </li>
                  ))}
                </ul>
              </GlassCard>
            ))}
          </div>
          <p className="text-center mt-8 text-sm" style={{ color: WARM_GRAY, fontFamily: "system-ui, sans-serif" }}>
            Chef Adriana sources ingredients at their peak, building each menu around what the Pacific Northwest offers that season.
          </p>
        </div>
      </SectionReveal>

      {/* ══════ FAQ ══════ */}
      <SectionReveal className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, ${BG_LIGHT} 50%, ${BG} 100%)` }} />
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <SectionBadge text="FAQ" />
            <SectionHeading>Questions &amp; Answers</SectionHeading>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <GlassCard key={i} className="overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-5 md:p-6 text-left group cursor-pointer">
                  <span className="text-lg font-semibold pr-4" style={{ color: CREAM }}>{faq.q}</span>
                  <motion.div animate={{ rotate: openFaq === i ? 180 : 0 }} transition={spring}><CaretDown size={20} style={{ color: WARM_GRAY }} className="shrink-0" /></motion.div>
                </button>
                <AnimatePresence initial={false}>
                  {openFaq === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={spring} className="overflow-hidden">
                      <p className="px-5 pb-5 md:px-6 md:pb-6 leading-relaxed" style={{ color: WARM_GRAY, fontFamily: "system-ui, sans-serif" }}>{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </GlassCard>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ══════ 17. CTA BANNER ══════ */}
      <section className="relative z-10 py-20 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${COPPER}, #a85d32, ${COPPER})` }} />
        <WoodGrainPattern opacity={0.06} />
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <Champagne size={48} weight="fill" className="mx-auto mb-6 text-white/70" />
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-4">Let&apos;s Create Something Delicious</h2>
          <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto" style={{ fontFamily: "system-ui, sans-serif" }}>Book your complimentary tasting consultation today and let Chef Adriana design the perfect menu for your event.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="tel:+12065550731" className="inline-flex items-center gap-3 px-8 py-4 rounded-full font-bold text-lg hover:bg-white/90 transition-colors" style={{ background: "white", color: COPPER }}>
              <Phone size={20} weight="fill" /> (206) 555-0731
            </a>
            <a href="mailto:events@emberandoak.com" className="inline-flex items-center gap-3 px-8 py-4 rounded-full font-bold text-lg border-2 border-white/40 text-white hover:bg-white/10 transition-colors" style={{ fontFamily: "system-ui, sans-serif" }}>
              <Envelope size={20} weight="fill" /> Email Us
            </a>
          </div>
        </div>
      </section>

      {/* ══════ 18. CONTACT / BOOKING FORM ══════ */}
      <SectionReveal id="contact" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, ${BG_LIGHT} 50%, ${BG} 100%)` }} />
        <WoodGrainPattern opacity={0.015} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <SectionBadge text="Book Your Event" />
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6" style={{ color: CREAM }}>Request a Tasting</h2>
              <p className="leading-relaxed mb-8" style={{ color: WARM_GRAY, fontFamily: "system-ui, sans-serif" }}>Ready to create an unforgettable culinary experience? Tell us about your event and Chef Adriana will craft a personalized proposal.</p>
              <div className="space-y-5">
                {[
                  { icon: MapPin, title: "Location", text: "2340 Western Ave, Seattle, WA 98121", href: "https://maps.google.com/?q=2340+Western+Ave+Seattle+WA+98121" },
                  { icon: Phone, title: "Phone", text: "(206) 555-0731", href: "tel:+12065550731" },
                  { icon: Envelope, title: "Email", text: "events@emberandoak.com", href: "mailto:events@emberandoak.com" },
                  { icon: Clock, title: "Consultations", text: "Mon-Fri 10AM-6PM, Sat by appointment" },
                  { icon: CalendarCheck, title: "Booking", text: "Book 3-6 months ahead for best availability" },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${COPPER}22` }}>
                      <item.icon size={20} weight="duotone" style={{ color: COPPER }} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: CREAM }}>{item.title}</p>
                      {"href" in item && item.href ? (
                        <a href={item.href} target={item.href.startsWith("http") ? "_blank" : undefined} rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined} className="text-sm hover:underline" style={{ color: WARM_GRAY, fontFamily: "system-ui, sans-serif" }}>{item.text}</a>
                      ) : (
                        <p className="text-sm" style={{ color: WARM_GRAY, fontFamily: "system-ui, sans-serif" }}>{item.text}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <GlassCard className="p-8">
              <h3 className="text-xl font-semibold mb-6" style={{ color: CREAM }}>Tasting Inquiry</h3>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-1.5" style={{ color: WARM_GRAY, fontFamily: "system-ui, sans-serif" }}>Name</label>
                    <input type="text" className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none" style={{ background: `${BG}`, borderColor: `${COPPER}22`, color: CREAM }} placeholder="Your name" />
                  </div>
                  <div>
                    <label className="block text-sm mb-1.5" style={{ color: WARM_GRAY, fontFamily: "system-ui, sans-serif" }}>Phone</label>
                    <input type="tel" className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none" style={{ background: `${BG}`, borderColor: `${COPPER}22`, color: CREAM }} placeholder="(555) 123-4567" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm mb-1.5" style={{ color: WARM_GRAY, fontFamily: "system-ui, sans-serif" }}>Email</label>
                  <input type="email" className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none" style={{ background: `${BG}`, borderColor: `${COPPER}22`, color: CREAM }} placeholder="you@email.com" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-1.5" style={{ color: WARM_GRAY, fontFamily: "system-ui, sans-serif" }}>Event Type</label>
                    <select className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none" style={{ background: `${BG}`, borderColor: `${COPPER}22`, color: CREAM }}>
                      <option value="">Select type</option>
                      {eventTypes.map((e) => <option key={e.name} value={e.name.toLowerCase()}>{e.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm mb-1.5" style={{ color: WARM_GRAY, fontFamily: "system-ui, sans-serif" }}>Event Date</label>
                    <input type="date" className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none" style={{ background: `${BG}`, borderColor: `${COPPER}22`, color: CREAM }} />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-1.5" style={{ color: WARM_GRAY, fontFamily: "system-ui, sans-serif" }}>Guest Count</label>
                    <input type="number" className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none" style={{ background: `${BG}`, borderColor: `${COPPER}22`, color: CREAM }} placeholder="Estimated guests" />
                  </div>
                  <div>
                    <label className="block text-sm mb-1.5" style={{ color: WARM_GRAY, fontFamily: "system-ui, sans-serif" }}>Budget Range</label>
                    <select className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none" style={{ background: `${BG}`, borderColor: `${COPPER}22`, color: CREAM }}>
                      <option value="">Select range</option>
                      <option value="under5k">Under $5,000</option>
                      <option value="5k-10k">$5,000 - $10,000</option>
                      <option value="10k-25k">$10,000 - $25,000</option>
                      <option value="25k+">$25,000+</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm mb-1.5" style={{ color: WARM_GRAY, fontFamily: "system-ui, sans-serif" }}>Dietary Needs &amp; Details</label>
                  <textarea rows={4} className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none resize-none" style={{ background: `${BG}`, borderColor: `${COPPER}22`, color: CREAM }} placeholder="Tell us about dietary restrictions, vision for the event, special requests..." />
                </div>
                <MagneticButton className="w-full py-4 rounded-xl text-base font-semibold text-white flex items-center justify-center gap-2 cursor-pointer" style={{ background: COPPER }}>
                  Request Tasting Consultation <ArrowRight size={18} weight="bold" />
                </MagneticButton>
              </form>
            </GlassCard>
          </div>
        </div>
      </SectionReveal>

      {/* ══════ 19. FOOTER ══════ */}
      <footer className="relative z-10 border-t py-10 overflow-hidden" style={{ borderColor: `${COPPER}22` }}>
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #0f0d0a 100%)` }} />
        <WoodGrainPattern opacity={0.015} />
        <div className="mx-auto max-w-6xl px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Fire size={22} weight="fill" style={{ color: COPPER }} />
                <span className="text-lg font-bold" style={{ color: CREAM }}>Ember &amp; Oak Catering</span>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: WARM_GRAY, fontFamily: "system-ui, sans-serif" }}>Elevated dining for Seattle&apos;s finest events. Chef-driven catering for weddings, corporate events, and private dining.</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-3" style={{ color: CREAM }}>Quick Links</h4>
              <div className="space-y-2" style={{ fontFamily: "system-ui, sans-serif" }}>
                {["Events", "Menu", "Gallery", "Chef", "Contact"].map((link) => <a key={link} href={`#${link.toLowerCase()}`} className="block text-sm hover:text-white transition-colors" style={{ color: WARM_GRAY }}>{link}</a>)}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-3" style={{ color: CREAM }}>Contact</h4>
              <div className="space-y-2 text-sm" style={{ color: WARM_GRAY, fontFamily: "system-ui, sans-serif" }}>
                <p><a href="tel:+12065550731" className="hover:text-white transition-colors">(206) 555-0731</a></p>
                <p><a href="mailto:events@emberandoak.com" className="hover:text-white transition-colors">events@emberandoak.com</a></p>
                <p><a href="https://maps.google.com/?q=2340+Western+Ave+Seattle+WA+98121" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">2340 Western Ave, Seattle, WA 98121</a></p>
              </div>
            </div>
          </div>
          <div className="border-t pt-6 flex flex-col md:flex-row items-center justify-between gap-4" style={{ borderColor: `${COPPER}15` }}>
            <div className="flex items-center gap-2 text-sm" style={{ color: WARM_GRAY }}>
              <Fire size={14} weight="fill" style={{ color: COPPER }} />
              <span>Ember &amp; Oak Catering &copy; {new Date().getFullYear()}</span>
            </div>
            <div className="flex items-center gap-2 text-xs" style={{ color: WARM_GRAY }}>
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" /></svg>
              <span className="flex items-center gap-1.5"><svg width="14" height="14" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-sky-500"><path d="M24.3 4.2c-1.5-.4-3.2.1-4.5 1.1-1-.7-2.3-1-3.5-.8-2.4.4-4.2 2.5-4.2 4.9v.6c-3.2.8-6 2.8-7.8 5.6-.3.5-.1 1.1.4 1.4.5.3 1.1.1 1.4-.4 1.5-2.3 3.7-4 6.3-4.7.5-.1 1-.1 1.5 0 .8.2 1.4.8 1.7 1.5.3.8.2 1.6-.2 2.3l-2.8 4.3c-.6.9-.4 2.1.4 2.8l2.5 2.1c.4.3.8.5 1.3.5h5.2c.5 0 1-.2 1.3-.5l1.2-1c.6-.5.8-1.3.6-2l-1-3.2c-.2-.5 0-1.1.4-1.4l3.8-2.5c1.3-.9 2.1-2.3 2.1-3.9V9.6c0-2.5-1.7-4.7-4.1-5.3v-.1z" fill="currentColor"/></svg>Created by <a href="https://bluejayportfolio.com" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "underline" }}>bluejayportfolio.com</a></span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
