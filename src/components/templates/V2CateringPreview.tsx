"use client";

/* eslint-disable @next/next/no-img-element -- These static marketing and preview components intentionally use plain img tags to preserve existing markup and visual behavior during lint-only cleanup. */
/* eslint-disable react-hooks/purity -- Decorative particle values are intentionally randomized for static visual effects in these marketing pages and previews; this preserves existing appearance without changing business logic. */

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import { ForkKnife, Wine, CookingPot, Star, ShieldCheck, Clock, Phone, MapPin, ArrowRight, CheckCircle, CaretDown, List, X, Users, CalendarCheck, Champagne, Leaf, Fire, Heart, Timer, Trophy, Scroll } from "@phosphor-icons/react";
import type { GeneratedSiteData } from "@/lib/generator";
import BluejayLogo from "../BluejayLogo";
import { MapLink, PhoneLink } from "@/components/templates/MapLink";
import ClaimBanner from "@/components/ClaimBanner";
import { pickFromPool, pickGallery } from "@/lib/stock-image-picker";

const spring = { type: "spring" as const, stiffness: 100, damping: 20 };
const springFast = { type: "spring" as const, stiffness: 200, damping: 25 };

const DEFAULT_BURGUNDY = "#881337";
const GOLD = "#d4a574";
const BG = "#faf8f6";

function getAccent(accentColor?: string) {
  const c = accentColor || DEFAULT_BURGUNDY;
  return { ACCENT: c, ACCENT_GLOW: `${c}26`, GOLD };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SERVICE_ICON_MAP: Record<string, any> = {
  wedding: Champagne, bridal: Champagne, corporate: Users, conference: Users, gala: Users,
  private: ForkKnife, dinner: ForkKnife, intimate: ForkKnife, buffet: CookingPot,
  plated: Wine, specialty: Star, fusion: Star, organic: Star,
};
function getServiceIcon(name: string) {
  const lower = name.toLowerCase();
  for (const [key, Icon] of Object.entries(SERVICE_ICON_MAP)) { if (lower.includes(key)) return Icon; }
  return ForkKnife;
}

const STOCK_HERO_POOL = [
  "https://images.unsplash.com/photo-1555244162-803834f70033?w=1400&q=80",
  "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1400&q=80",
];
const STOCK_ABOUT_POOL = [
  "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=600&q=80",
  "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=600&q=80",
];
const STOCK_GALLERY = [
  "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600&q=80",
  "https://images.unsplash.com/photo-1530062845289-9109b2c9c868?w=600&q=80",
  "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80",
  "https://images.unsplash.com/photo-1547573854-74d2a71d0826?w=600&q=80",
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80",
  "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&q=80",
  "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=80",
  "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=600&q=80",
];

function FloatingSparks({ accent }: { accent: string }) {
  const particles = Array.from({ length: 18 }, (_, i) => ({ id: i, x: Math.random() * 100, delay: Math.random() * 8, duration: 5 + Math.random() * 7, size: 2 + Math.random() * 3, opacity: 0.12 + Math.random() * 0.3, isGold: Math.random() > 0.5 }));
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden hidden md:block">
      {particles.map((p) => (
        <motion.div key={p.id} className="absolute rounded-full" style={{ left: `${p.x}%`, width: p.size, height: p.size, background: p.isGold ? `${GOLD}88` : `${accent}66`, willChange: "transform, opacity" }}
          animate={{ y: ["-10vh", "110vh"], opacity: [0, p.opacity, p.opacity, 0] }}
          transition={{ y: { duration: p.duration, repeat: Infinity, delay: p.delay, ease: "linear" }, opacity: { duration: p.duration, repeat: Infinity, delay: p.delay, times: [0, 0.1, 0.9, 1] } }}
        />
      ))}
    </div>
  );
}

function ElegantPattern({ opacity = 0.03, accent }: { opacity?: number; accent: string }) {
  const pid = `elegantV2Prev-${accent.replace("#", "")}`;
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }}>
      <defs>
        <pattern id={pid} width="60" height="60" patternUnits="userSpaceOnUse">
          <path d="M30 0 L60 30 L30 60 L0 30Z" fill="none" stroke={accent} strokeWidth="0.5" />
          <circle cx="30" cy="30" r="2" fill={GOLD} opacity="0.3" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${pid})`} />
    </svg>
  );
}

function VineDecor({ opacity = 0.04, accent }: { opacity?: number; accent: string }) {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }} viewBox="0 0 1000 600" preserveAspectRatio="none">
      <path d="M0 300 Q250 200 500 300 T1000 300" stroke={accent} strokeWidth="1.5" fill="none" />
      <path d="M0 350 Q250 250 500 350 T1000 350" stroke={GOLD} strokeWidth="1" fill="none" />
    </svg>
  );
}

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-gray-200 bg-white/70 backdrop-blur-xl shadow-sm ${className}`}>{children}</div>;
}

function MagneticButton({ children, className = "", onClick, style, href }: { children: React.ReactNode; className?: string; onClick?: () => void; style?: React.CSSProperties; href?: string }) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0); const y = useMotionValue(0);
  const springX = useSpring(x, springFast); const springY = useSpring(y, springFast);
  const isTouchDevice = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
  const handleMouseMove = useCallback((e: React.MouseEvent) => { if (!ref.current || isTouchDevice) return; const rect = ref.current.getBoundingClientRect(); x.set((e.clientX - (rect.left + rect.width / 2)) * 0.25); y.set((e.clientY - (rect.top + rect.height / 2)) * 0.25); }, [x, y, isTouchDevice]);
  const handleMouseLeave = useCallback(() => { x.set(0); y.set(0); }, [x, y]);
  if (href) return <motion.a href={href} ref={ref as unknown as React.Ref<HTMLAnchorElement>} style={{ x: springX, y: springY, willChange: "transform", ...style }} onMouseMove={handleMouseMove as unknown as React.MouseEventHandler<HTMLAnchorElement>} onMouseLeave={handleMouseLeave} className={className} whileTap={{ scale: 0.97 }}>{children}</motion.a>;
  return <motion.button ref={ref} style={{ x: springX, y: springY, willChange: "transform", ...style }} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} onClick={onClick} className={className} whileTap={{ scale: 0.97 }}>{children}</motion.button>;
}

function ShimmerBorder({ children, className = "", accent }: { children: React.ReactNode; className?: string; accent: string }) {
  return (
    <div className={`relative rounded-2xl p-[1px] overflow-hidden ${className}`}>
      <motion.div className="absolute inset-0 rounded-2xl" style={{ background: `conic-gradient(from 0deg, transparent, ${accent}, transparent, ${GOLD}, transparent)`, willChange: "transform" }} animate={{ rotate: [0, 360] }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} />
      <div className="relative rounded-2xl bg-white z-10">{children}</div>
    </div>
  );
}

function SectionHeader({ badge, title, subtitle, accent }: { badge: string; title: string; subtitle?: string; accent: string }) {
  return (
    <div className="text-center mb-16">
      <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: accent, borderColor: `${accent}33`, background: `${accent}0d` }}>{badge}</span>
      <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-[#1c1917]">{title}</h2>
      <div className="h-0.5 w-16 mx-auto mt-4" style={{ background: `linear-gradient(to right, ${accent}, transparent)` }} />
      {subtitle && <p className="text-[#6b7280] mt-4 max-w-2xl text-lg leading-relaxed mx-auto">{subtitle}</p>}
    </div>
  );
}

function AccordionItem({ question, answer, isOpen, onToggle }: { question: string; answer: string; isOpen: boolean; onToggle: () => void }) {
  return (
    <GlassCard className="overflow-hidden">
      <button onClick={onToggle} className="w-full flex items-center justify-between p-5 md:p-6 text-left group cursor-pointer">
        <span className="text-lg font-semibold text-[#1c1917] pr-4">{question}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={spring}><CaretDown size={20} className="text-[#6b7280] shrink-0" /></motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={spring} className="overflow-hidden">
            <p className="px-5 pb-5 md:px-6 md:pb-6 text-[#6b7280] leading-relaxed">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
}

function AnimatedSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: "easeOut" as const }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════ */

const EVENT_TYPES = [
  { icon: Champagne, name: "Weddings", desc: "Elegant multi-course menus tailored to your celebration" },
  { icon: Users, name: "Corporate Events", desc: "Professional catering for conferences, galas, and retreats" },
  { icon: ForkKnife, name: "Private Dinners", desc: "Intimate chef-driven experiences in your home" },
  { icon: CalendarCheck, name: "Holiday Parties", desc: "Seasonal menus with festive flair and warm hospitality" },
  { icon: Fire, name: "BBQ & Outdoor", desc: "Smoky, bold flavors for casual outdoor gatherings" },
  { icon: Heart, name: "Milestone Events", desc: "Anniversaries, birthdays, and life's special moments" },
];

const MENU_TABS = ["Appetizers", "Mains", "Desserts"] as const;

const SAMPLE_MENU: Record<string, { name: string; desc: string; price: string }[]> = {
  Appetizers: [
    { name: "Seared Scallops", desc: "Cauliflower puree, micro herbs, lemon butter", price: "$16" },
    { name: "Heirloom Bruschetta", desc: "Vine-ripened tomatoes, basil, aged balsamic", price: "$12" },
    { name: "Stuffed Mushrooms", desc: "Goat cheese, fresh herbs, truffle drizzle", price: "$14" },
    { name: "Tuna Tartare", desc: "Sesame, avocado, crispy wonton, ponzu", price: "$18" },
  ],
  Mains: [
    { name: "Filet Mignon", desc: "8oz prime beef, red wine demi-glace, roasted root vegetables", price: "$48" },
    { name: "Pan-Seared Salmon", desc: "Wild-caught, dill cream, seasonal greens", price: "$38" },
    { name: "Braised Short Ribs", desc: "72-hour braised, polenta, gremolata", price: "$42" },
    { name: "Stuffed Chicken Roulade", desc: "Spinach, sundried tomato, parmesan crust", price: "$34" },
  ],
  Desserts: [
    { name: "Chocolate Fondant", desc: "Molten center, vanilla bean ice cream, berries", price: "$14" },
    { name: "Creme Brulee", desc: "Madagascar vanilla, caramelized sugar crust", price: "$12" },
    { name: "Tiramisu Tower", desc: "Espresso-soaked ladyfingers, mascarpone cream", price: "$13" },
    { name: "Seasonal Fruit Tart", desc: "Almond frangipane, fresh berries, honey glaze", price: "$11" },
  ],
};

const DIETARY_BADGES = [
  { label: "Vegan Options", icon: Leaf },
  { label: "Gluten-Free", icon: ShieldCheck },
  { label: "Kosher Available", icon: CheckCircle },
  { label: "Halal Available", icon: CheckCircle },
  { label: "Nut-Free", icon: ShieldCheck },
  { label: "Farm-to-Table", icon: Leaf },
];

const PRICING_TIERS = [
  { name: "Classic", price: "$45", per: "per person", desc: "Buffet-style with 3 entrees, 2 sides, dessert", features: ["3 Entree Choices", "2 Side Dishes", "Dessert Station", "Setup & Cleanup"] },
  { name: "Premium", price: "$75", per: "per person", desc: "Plated service with 4 courses, premium ingredients", features: ["4-Course Plated", "Premium Proteins", "Passed Appetizers", "Full Service Staff"], popular: true },
  { name: "Grand", price: "$110", per: "per person", desc: "White-glove chef's table with custom tasting menu", features: ["Custom Tasting Menu", "Live Chef Stations", "Sommelier Pairing", "Event Coordinator"] },
];

const COMPARISON_ROWS = [
  { feature: "Custom Menu Creation", us: true, them: "Limited" },
  { feature: "On-Site Chef", us: true, them: "No" },
  { feature: "Dietary Accommodations", us: true, them: "Basic" },
  { feature: "Full Service Staff", us: true, them: "Extra Cost" },
  { feature: "Tasting Sessions", us: true, them: "No" },
  { feature: "Event Coordination", us: true, them: "No" },
  { feature: "Setup & Cleanup", us: true, them: "Extra Cost" },
];

export default function V2CateringPreview({ data }: { data: GeneratedSiteData }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [activeMenuTab, setActiveMenuTab] = useState<typeof MENU_TABS[number]>("Appetizers");
  const { ACCENT, ACCENT_GLOW } = getAccent(data.accentColor);

  const uniquePhotos = data.photos ? [...new Set(data.photos)] : [];
  const heroImage = uniquePhotos[0] || pickFromPool(STOCK_HERO_POOL, data.businessName);
  const heroCardImage = uniquePhotos[1] || pickFromPool(STOCK_ABOUT_POOL, data.businessName, 1);
  const aboutImage = uniquePhotos[2] || pickFromPool(STOCK_ABOUT_POOL, data.businessName, 2);
  const galleryImages = data.photos?.length > 2 ? data.photos.slice(2, 8) : pickGallery(STOCK_GALLERY, data.businessName);

  const faqs = [
    { q: `What catering services does ${data.businessName} offer?`, a: `We offer ${data.services.slice(0, 3).map(s => s.name).join(", ")}, and more. Contact us for a custom menu consultation.` },
    { q: "Do you accommodate dietary restrictions?", a: "Absolutely. We craft menus that accommodate vegan, gluten-free, kosher, halal, and allergy-specific needs without compromising flavor." },
    { q: "How far in advance should I book?", a: "We recommend booking 3-6 months in advance for weddings and large events. Corporate events can often be arranged with 2-4 weeks notice." },
    { q: "Can we schedule a tasting?", a: `Yes! Contact ${data.businessName} to arrange a tasting session. We want every dish to be perfect for your event.` },
    { q: "What is included in the service?", a: "Depending on your package, service includes menu planning, food preparation, service staff, setup, tableware, linens, and full cleanup." },
    { q: "Do you provide bar service?", a: "Yes, we offer full bar packages including signature cocktails, wine pairings, and non-alcoholic craft beverages." },
  ];

  const fallbackTestimonials = [
    { name: "Emily C.", text: "They catered our wedding and every single guest raved about the food. Absolutely perfect.", rating: 5 },
    { name: "Marcus D.", text: "Best corporate event catering we've ever had. Professional, on time, and the food was outstanding.", rating: 5 },
    { name: "Sophia R.", text: "The presentation was as beautiful as the taste. They made our anniversary party unforgettable.", rating: 5 },
  ];
  const testimonials = data.testimonials?.length > 0 ? data.testimonials : fallbackTestimonials;

  const processSteps = [
    { step: "01", title: "Consultation", desc: "We discuss your vision, dietary needs, guest count, and budget.", icon: Phone },
    { step: "02", title: "Menu Design", desc: "Custom menu creation with optional tasting sessions.", icon: Scroll },
    { step: "03", title: "Event Planning", desc: "Logistics, staffing, rentals, and setup coordination.", icon: CalendarCheck },
    { step: "04", title: "Execution", desc: "Flawless delivery with beautiful presentation and service.", icon: Trophy },
  ];

  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden" style={{ background: BG, color: "#1c1917" }}>
      <FloatingSparks accent={ACCENT} />

      {/* 1. NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-4">
          <GlassCard className="flex items-center justify-between px-4 md:px-6 py-3">
            <div className="flex items-center gap-2"><ForkKnife size={24} weight="fill" style={{ color: ACCENT }} /><span className="text-lg font-bold tracking-tight text-[#1c1917]">{data.businessName}</span></div>
            <div className="hidden md:flex items-center gap-8 text-sm text-[#6b7280]">
              <a href="#services" className="hover:text-[#1c1917] transition-colors">Services</a>
              <a href="#menu" className="hover:text-[#1c1917] transition-colors">Menu</a>
              <a href="#gallery" className="hover:text-[#1c1917] transition-colors">Gallery</a>
              <a href="#about" className="hover:text-[#1c1917] transition-colors">About</a>
              <a href="#contact" className="hover:text-[#1c1917] transition-colors">Contact</a>
            </div>
            <div className="flex items-center gap-3">
              <MagneticButton className="px-4 md:px-5 py-2 rounded-full text-sm font-semibold text-white transition-colors cursor-pointer" style={{ background: ACCENT } as React.CSSProperties}>Book Event</MagneticButton>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-lg text-[#1c1917] hover:bg-gray-100 transition-colors">{mobileMenuOpen ? <X size={24} /> : <List size={24} />}</button>
            </div>
          </GlassCard>
          <AnimatePresence>{mobileMenuOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="md:hidden mt-2 overflow-hidden">
              <GlassCard className="flex flex-col gap-1 px-4 py-4">
                {["Services", "Menu", "Gallery", "About", "Contact"].map((l) => <a key={l} href={`#${l.toLowerCase()}`} onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-lg text-sm text-[#4b5563] hover:text-[#1c1917] hover:bg-gray-50 transition-colors">{l}</a>)}
              </GlassCard>
            </motion.div>
          )}</AnimatePresence>
        </div>
      </nav>

      {/* 2. HERO */}
      <section className="relative min-h-[100dvh] flex items-center pt-24 z-10 overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImage} alt={`${data.businessName}`} className="w-full h-full object-cover object-center" />
          <div className="absolute inset-0 bg-black/70" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          <div className="space-y-8 rounded-2xl bg-black/50 backdrop-blur-md p-6 md:p-8 border border-white/5">
            <div>
              <p className="text-sm uppercase tracking-widest mb-4" style={{ color: GOLD }}>Premium Catering</p>
              <h1 className="text-3xl md:text-6xl tracking-tighter leading-none font-bold text-white" style={{ textShadow: "0 2px 20px rgba(0,0,0,0.8)" }}>{data.tagline || `${data.businessName} — Exceptional Cuisine`}</h1>
            </div>
            <p className="text-lg text-white/70 max-w-md leading-relaxed">{(() => { const t = data.about; if (t.length <= 180) return t; const dot = t.indexOf('.', 80); return dot > 0 && dot < 220 ? t.slice(0, dot + 1) : t.slice(0, 180).trim() + '...'; })()}</p>
            <div className="flex flex-wrap gap-4">
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white flex items-center gap-2 cursor-pointer" style={{ background: ACCENT } as React.CSSProperties}>Plan Your Event <ArrowRight size={18} weight="bold" /></MagneticButton>
              <MagneticButton href={`tel:${data.phone.replace(/\D/g, "")}`} className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/20 flex items-center gap-2 cursor-pointer"><Phone size={18} weight="duotone" /> <PhoneLink phone={data.phone} className="text-white" /></MagneticButton>
            </div>
            <div className="flex flex-wrap gap-3">
              {["Award-Winning", `${data.googleRating || "5.0"}-Star Rated`, "Custom Menus"].map((badge) => (
                <span key={badge} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border border-white/10 bg-white/5 text-white/80"><CheckCircle size={14} weight="fill" style={{ color: GOLD }} /> {badge}</span>
              ))}
            </div>
          </div>
          <div className="hidden md:block relative">
            <div className="relative rounded-2xl overflow-hidden border border-gray-200">
              <img src={heroCardImage} alt={`${data.businessName} catering`} className="w-full h-[500px] object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6"><div className="px-4 py-2 rounded-full backdrop-blur-md bg-black/50 border flex items-center gap-2" style={{ borderColor: `${ACCENT}4d` }}><Star size={18} weight="fill" style={{ color: GOLD }} /><span className="text-sm font-semibold text-white">Award-Winning Cuisine</span></div></div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. STATS */}
      <section className="relative z-10 py-16 overflow-hidden border-y" style={{ borderColor: `${ACCENT}1a` }}>
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, #f5efe8 0%, ${BG} 100%)` }} />
        <ElegantPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {data.stats.map((stat, i) => {
              const icons = [ForkKnife, Clock, Users, Star];
              const Icon = icons[i % icons.length];
              return (<div key={stat.label} className="text-center"><div className="flex items-center justify-center gap-2 mb-2"><Icon size={22} weight="fill" style={{ color: ACCENT }} /><span className="text-3xl md:text-4xl font-extrabold text-[#1c1917]">{stat.value}</span></div><span className="text-[#9ca3af] text-sm font-medium tracking-wide uppercase">{stat.label}</span></div>);
            })}
          </div>
        </div>
      </section>

      {/* 4. EVENT TYPES */}
      <section id="services" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #f5efe8 50%, ${BG} 100%)` }} />
        <ElegantPattern accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Event Types" title="Catering for Every Occasion" subtitle={`${data.businessName} creates unforgettable culinary experiences for any event.`} accent={ACCENT} />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {EVENT_TYPES.map((evt, i) => (
              <div key={evt.name} className="group relative p-7 rounded-2xl border border-gray-200/60 hover:border-opacity-30 transition-all duration-500 overflow-hidden bg-white/60">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: `radial-gradient(circle at 50% 0%, ${ACCENT}15, transparent 70%)` }} />
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center border" style={{ background: ACCENT_GLOW, borderColor: `${ACCENT}33` }}><evt.icon size={24} weight="duotone" style={{ color: ACCENT }} /></div>
                    <span className="text-xs font-mono text-[#6b7280]">{String(i + 1).padStart(2, "0")}</span>
                  </div>
                  <h3 className="text-lg font-bold text-[#1c1917] mb-2">{evt.name}</h3>
                  <p className="text-sm text-[#6b7280] leading-relaxed">{evt.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. SERVICES */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #f5efe8 50%, ${BG} 100%)` }} />
        <VineDecor opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Our Services" title="What We Offer" accent={ACCENT} />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.services.map((service, i) => {
              const Icon = getServiceIcon(service.name);
              return (
                <div key={service.name} className="group relative p-7 rounded-2xl border border-gray-200/60 hover:border-opacity-30 transition-all duration-500 overflow-hidden bg-white/60">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: `radial-gradient(circle at 50% 0%, ${ACCENT}15, transparent 70%)` }} />
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-5">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center border" style={{ background: ACCENT_GLOW, borderColor: `${ACCENT}33` }}><Icon size={24} weight="duotone" style={{ color: ACCENT }} /></div>
                      <span className="text-xs font-mono text-[#6b7280]">{String(i + 1).padStart(2, "0")}</span>
                    </div>
                    <h3 className="text-lg font-bold text-[#1c1917] mb-2">{service.name}</h3>
                    <p className="text-sm text-[#6b7280] leading-relaxed">{service.description || ""}</p>
                    {service.price && <p className="text-sm font-semibold mt-3" style={{ color: ACCENT }}>{service.price}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. SAMPLE MENU WITH TABS */}
      <section id="menu" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, #f5efe8 0%, ${BG} 50%, #f5efe8 100%)` }} />
        <ElegantPattern opacity={0.025} accent={ACCENT} />
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Sample Menu" title="A Taste of Our Cuisine" subtitle="Seasonal ingredients, artisan preparation, extraordinary presentation." accent={ACCENT} />
          <div className="flex justify-center gap-2 mb-10">
            {MENU_TABS.map((tab) => (
              <button key={tab} onClick={() => setActiveMenuTab(tab)} className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 cursor-pointer ${activeMenuTab === tab ? "text-white shadow-lg" : "text-[#6b7280] bg-white/50 border border-gray-200 hover:bg-white/80"}`} style={activeMenuTab === tab ? { background: ACCENT } : undefined}>
                {tab}
              </button>
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={activeMenuTab} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.3 }}>
              <div className="space-y-4">
                {SAMPLE_MENU[activeMenuTab].map((item) => (
                  <GlassCard key={item.name} className="p-5 flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="text-base font-bold text-[#1c1917]">{item.name}</h4>
                      <p className="text-sm text-[#6b7280] mt-1">{item.desc}</p>
                    </div>
                    <span className="text-lg font-bold shrink-0" style={{ color: ACCENT }}>{item.price}</span>
                  </GlassCard>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
          <p className="text-center text-sm text-[#9ca3af] mt-8">Menus are customized for each event. Prices vary by guest count and selections.</p>
        </div>
      </section>

      {/* 7. DIETARY BADGES */}
      <section className="relative z-10 py-16 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #f5efe8 100%)` }} />
        <ElegantPattern opacity={0.015} accent={ACCENT} />
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <div className="text-center mb-10">
            <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-3 px-4 py-1.5 rounded-full border" style={{ color: ACCENT, borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}>Dietary Options</span>
            <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight text-[#1c1917]">We Accommodate Every Need</h2>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {DIETARY_BADGES.map((badge) => (
              <div key={badge.label} className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-gray-200 bg-white/60 backdrop-blur-sm text-sm font-medium text-[#1c1917]">
                <badge.icon size={18} weight="duotone" style={{ color: ACCENT }} />
                {badge.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. GALLERY */}
      <section id="gallery" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #f5efe8 50%, ${BG} 100%)` }} />
        <VineDecor opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <AnimatedSection><SectionHeader badge="Gallery" title="A Feast for the Eyes" accent={ACCENT} /></AnimatedSection>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {galleryImages.map((src, i) => (
              <div key={i} className="group relative rounded-2xl overflow-hidden border border-gray-200/60">
                <img src={src} alt={`Culinary creation ${i + 1}`} className="w-full h-48 md:h-56 object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. ABOUT + CHEF SPOTLIGHT */}
      <section id="about" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #f5efe8 50%, ${BG} 100%)` }} />
        <ElegantPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="relative">
              <div className="rounded-2xl overflow-hidden border border-gray-200"><img src={aboutImage} alt={`${data.businessName} team`} className="w-full h-[400px] object-cover" /></div>
              <div className="absolute -bottom-4 -right-4 md:bottom-6 md:-right-6"><div className="px-5 py-3 rounded-xl backdrop-blur-md border text-white font-bold text-sm shadow-lg" style={{ background: `${ACCENT}e6`, borderColor: `${ACCENT}80` }}>{data.stats[0] ? `${data.stats[0].value} ${data.stats[0].label}` : "Premium Catering"}</div></div>
            </div>
            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: ACCENT, borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}>About Us</span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6 text-[#1c1917]">Crafted with Passion</h2>
              <p className="text-[#6b7280] leading-relaxed mb-8">{data.about}</p>
              <div className="grid grid-cols-2 gap-4">
                {[{ icon: Star, label: "Award-Winning" }, { icon: CheckCircle, label: "Farm-to-Table" }, { icon: Users, label: "Expert Team" }, { icon: ShieldCheck, label: "Fully Licensed" }].map((badge) => (
                  <GlassCard key={badge.label} className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: ACCENT_GLOW }}><badge.icon size={20} weight="duotone" style={{ color: ACCENT }} /></div>
                    <span className="text-sm font-semibold text-[#1c1917]">{badge.label}</span>
                  </GlassCard>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 10. CHEF SPOTLIGHT */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, #f5efe8 0%, ${BG} 50%, #f5efe8 100%)` }} />
        <VineDecor opacity={0.025} accent={ACCENT} />
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Chef Spotlight" title="Meet Our Culinary Team" accent={ACCENT} />
          <ShimmerBorder accent={ACCENT}>
            <div className="p-8 md:p-10">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="w-32 h-32 rounded-full border-2 flex items-center justify-center shrink-0" style={{ borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}>
                  <CookingPot size={48} weight="duotone" style={{ color: ACCENT }} />
                </div>
                <div className="text-center md:text-left">
                  <h3 className="text-2xl font-bold text-[#1c1917] mb-2">Executive Chef</h3>
                  <p className="text-sm uppercase tracking-wider mb-4" style={{ color: ACCENT }}>Culinary Institute Graduate &bull; 15+ Years Experience</p>
                  <p className="text-[#6b7280] leading-relaxed">Our executive chef brings world-class technique and a passion for seasonal, locally-sourced ingredients. Every menu is personally curated to ensure an unforgettable dining experience that reflects your vision and delights every palate.</p>
                  <div className="flex flex-wrap gap-3 mt-5 justify-center md:justify-start">
                    {["Classical French", "Modern American", "Mediterranean", "Asian Fusion"].map((style) => (
                      <span key={style} className="px-3 py-1.5 rounded-full text-xs font-medium border" style={{ color: ACCENT, borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}>{style}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </ShimmerBorder>
        </div>
      </section>

      {/* 11. PER-PERSON PRICING */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #f5efe8 50%, ${BG} 100%)` }} />
        <ElegantPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Pricing" title="Catering Packages" subtitle="Per-person pricing for groups of 20+. Custom quotes available." accent={ACCENT} />
          <div className="grid md:grid-cols-3 gap-6">
            {PRICING_TIERS.map((tier) => (
              <div key={tier.name} className={`relative rounded-2xl border p-8 transition-all duration-300 ${tier.popular ? "border-2 shadow-xl bg-white" : "border-gray-200 bg-white/60"}`} style={tier.popular ? { borderColor: ACCENT } : undefined}>
                {tier.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold text-white" style={{ background: ACCENT }}>Most Popular</div>}
                <h3 className="text-xl font-bold text-[#1c1917] mb-1">{tier.name}</h3>
                <div className="flex items-baseline gap-1 mb-2"><span className="text-4xl font-extrabold" style={{ color: ACCENT }}>{tier.price}</span><span className="text-sm text-[#9ca3af]">{tier.per}</span></div>
                <p className="text-sm text-[#6b7280] mb-6">{tier.desc}</p>
                <ul className="space-y-3 mb-8">
                  {tier.features.map((f) => <li key={f} className="flex items-center gap-2 text-sm text-[#4b5563]"><CheckCircle size={16} weight="fill" style={{ color: ACCENT }} /> {f}</li>)}
                </ul>
                <MagneticButton className={`w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer ${tier.popular ? "text-white" : "text-[#1c1917] border border-gray-200"}`} style={tier.popular ? { background: ACCENT } as React.CSSProperties : undefined}>Get Quote <ArrowRight size={16} weight="bold" /></MagneticButton>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 12. GOOGLE REVIEWS + TESTIMONIALS */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #f5efe8 50%, ${BG} 100%)` }} />
        <ElegantPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          {(data.googleRating || data.reviewCount) && (
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full border border-gray-200 bg-white/80 backdrop-blur-sm">
                <div className="flex gap-0.5">{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={18} weight="fill" style={{ color: GOLD }} />)}</div>
                <span className="text-lg font-bold text-[#1c1917]">{data.googleRating || "5.0"}</span>
                {data.reviewCount && <span className="text-sm text-[#9ca3af]">({data.reviewCount} reviews)</span>}
              </div>
            </div>
          )}
          <AnimatedSection><SectionHeader badge="Testimonials" title="What Our Clients Say" accent={ACCENT} /></AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <GlassCard key={i} className="p-6 h-full flex flex-col">
                <div className="text-4xl mb-3" style={{ color: `${ACCENT}33` }}>&ldquo;</div>
                <div className="flex gap-0.5 mb-4">{Array.from({ length: t.rating || 5 }).map((_, j) => <Star key={j} size={16} weight="fill" style={{ color: GOLD }} />)}</div>
                <p className="text-[#4b5563] leading-relaxed flex-1 text-sm mb-4">{t.text}</p>
                <div className="pt-4 border-t border-gray-100 flex items-center gap-2">
                  <CheckCircle size={14} weight="fill" style={{ color: ACCENT }} />
                  <span className="text-sm font-semibold text-[#1c1917]">{t.name}</span>
                  <span className="text-xs text-[#9ca3af]">Verified</span>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* 13. COMPETITOR COMPARISON */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, #f5efe8 0%, ${BG} 50%, #f5efe8 100%)` }} />
        <VineDecor opacity={0.02} accent={ACCENT} />
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Why Us" title={`${data.businessName} vs. The Competition`} accent={ACCENT} />
          <GlassCard className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left p-4 font-semibold text-[#1c1917]">Feature</th>
                    <th className="text-center p-4 font-semibold" style={{ color: ACCENT }}>{data.businessName}</th>
                    <th className="text-center p-4 font-semibold text-[#9ca3af]">Others</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_ROWS.map((row, i) => (
                    <tr key={row.feature} className={i % 2 === 0 ? "bg-white/30" : ""}>
                      <td className="p-4 text-[#4b5563] font-medium">{row.feature}</td>
                      <td className="p-4 text-center"><CheckCircle size={20} weight="fill" style={{ color: ACCENT }} className="mx-auto" /></td>
                      <td className="p-4 text-center text-[#9ca3af]">{row.them}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* 14. PROCESS */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #f5efe8 50%, ${BG} 100%)` }} />
        <VineDecor opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <AnimatedSection><SectionHeader badge="Our Process" title="From Vision to Table" accent={ACCENT} /></AnimatedSection>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {processSteps.map((step, i) => (
              <div key={step.step} className="relative">
                {i < processSteps.length - 1 && <div className="hidden lg:block absolute top-10 left-[calc(50%+40px)] w-[calc(100%-80px)] h-px" style={{ background: `linear-gradient(to right, ${ACCENT}33, ${ACCENT}11)` }} />}
                <GlassCard className="p-6 text-center relative">
                  <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-black" style={{ background: `linear-gradient(135deg, ${ACCENT}22, ${ACCENT}0a)`, color: ACCENT, border: `1px solid ${ACCENT}33` }}><step.icon size={28} weight="duotone" /></div>
                  <h3 className="text-lg font-bold text-[#1c1917] mb-2">{step.title}</h3>
                  <p className="text-sm text-[#6b7280] leading-relaxed">{step.desc}</p>
                </GlassCard>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 15. VIDEO PLACEHOLDER */}
      <section className="relative z-10 py-20 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT}cc, ${ACCENT})` }} />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='40' height='40' fill='none'/%3E%3Cpath d='M0 0L40 40M40 0L0 40' stroke='%23000' stroke-width='0.5'/%3E%3C/svg%3E\")" }} />
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <div className="relative rounded-2xl overflow-hidden border border-white/20 aspect-video flex items-center justify-center" style={{ background: "rgba(0,0,0,0.3)" }}>
            <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 cursor-pointer hover:bg-white/30 transition-colors">
              <div className="w-0 h-0 border-l-[18px] border-l-white border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent ml-1.5" />
            </div>
            <p className="absolute bottom-6 text-white/60 text-sm font-medium">Watch Our Team in Action</p>
          </div>
        </div>
      </section>

      {/* 16. EVENT QUIZ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #f5efe8 50%, ${BG} 100%)` }} />
        <ElegantPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Get Started" title="What Type of Event?" subtitle="Select your event type and we'll create the perfect menu." accent={ACCENT} />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "Wedding / Celebration", color: "#10b981", rec: "Our Premium or Grand package is perfect for your special day." },
              { label: "Corporate / Conference", color: ACCENT, rec: "Classic or Premium packages deliver professional results." },
              { label: "Private / Intimate", color: GOLD, rec: "A custom chef's table experience is just what you need." },
            ].map((opt) => (
              <GlassCard key={opt.label} className="p-6 text-center hover:shadow-md transition-shadow cursor-pointer group">
                <div className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: `${opt.color}15`, border: `1px solid ${opt.color}33` }}>
                  <ForkKnife size={22} weight="duotone" style={{ color: opt.color }} />
                </div>
                <h4 className="text-sm font-bold text-[#1c1917] mb-2">{opt.label}</h4>
                <p className="text-xs text-[#6b7280] leading-relaxed">{opt.rec}</p>
              </GlassCard>
            ))}
          </div>
          <div className="text-center mt-8">
            <PhoneLink phone={data.phone} className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-white font-semibold text-base" style={{ background: ACCENT }}>
              <Phone size={20} weight="fill" /> Call to Discuss Your Event
            </PhoneLink>
          </div>
        </div>
      </section>

      {/* 17. FAQ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #f5efe8 50%, ${BG} 100%)` }} />
        <ElegantPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <AnimatedSection><SectionHeader badge="FAQ" title="Questions & Answers" accent={ACCENT} /></AnimatedSection>
          <div className="space-y-3">{faqs.map((faq, i) => <AccordionItem key={i} question={faq.q} answer={faq.a} isOpen={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} />)}</div>
        </div>
      </section>

      {/* 18. CONTACT */}
      <section id="contact" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #f5efe8 50%, ${BG} 100%)` }} />
        <ElegantPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: ACCENT, borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}>Contact Us</span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6 text-[#1c1917]">Plan Your Event</h2>
              <p className="text-[#6b7280] leading-relaxed mb-8">Contact {data.businessName} to schedule your complimentary consultation.</p>
              <div className="space-y-5">
                <div className="flex items-start gap-4"><div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: ACCENT_GLOW }}><MapPin size={20} weight="duotone" style={{ color: ACCENT }} /></div><div><p className="text-sm font-semibold text-[#1c1917]">Address</p><MapLink address={data.address} className="text-sm text-[#6b7280]" /></div></div>
                <div className="flex items-start gap-4"><div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: ACCENT_GLOW }}><Phone size={20} weight="duotone" style={{ color: ACCENT }} /></div><div><p className="text-sm font-semibold text-[#1c1917]">Phone</p><PhoneLink phone={data.phone} className="text-sm text-[#6b7280]" /></div></div>
                {data.hours && <div className="flex items-start gap-4"><div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: ACCENT_GLOW }}><Clock size={20} weight="duotone" style={{ color: ACCENT }} /></div><div><p className="text-sm font-semibold text-[#1c1917]">Hours</p><p className="text-sm text-[#6b7280] whitespace-pre-line">{data.hours}</p></div></div>}
              </div>
            </div>
            <GlassCard className="p-8">
              <h3 className="text-xl font-semibold text-[#1c1917] mb-6">Request a Consultation</h3>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className="block text-sm text-[#6b7280] mb-1.5">Name</label><input type="text" className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-[#1c1917] placeholder-gray-400 focus:outline-none text-sm" placeholder="Your name" /></div>
                  <div><label className="block text-sm text-[#6b7280] mb-1.5">Phone</label><input type="tel" className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-[#1c1917] placeholder-gray-400 focus:outline-none text-sm" placeholder="(555) 123-4567" /></div>
                </div>
                <div><label className="block text-sm text-[#6b7280] mb-1.5">Event Type</label><select className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-[#1c1917] focus:outline-none text-sm"><option value="" className="bg-white">Select event type</option>{EVENT_TYPES.map((e) => <option key={e.name} value={e.name.toLowerCase()} className="bg-white">{e.name}</option>)}</select></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className="block text-sm text-[#6b7280] mb-1.5">Guest Count</label><input type="number" className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-[#1c1917] placeholder-gray-400 focus:outline-none text-sm" placeholder="50" /></div>
                  <div><label className="block text-sm text-[#6b7280] mb-1.5">Event Date</label><input type="text" className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-[#1c1917] placeholder-gray-400 focus:outline-none text-sm" placeholder="MM/DD/YYYY" /></div>
                </div>
                <div><label className="block text-sm text-[#6b7280] mb-1.5">Event Details</label><textarea rows={4} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-[#1c1917] placeholder-gray-400 focus:outline-none text-sm resize-none" placeholder="Dietary needs, theme, special requests..." /></div>
                <MagneticButton className="w-full py-4 rounded-xl text-base font-semibold text-white flex items-center justify-center gap-2 cursor-pointer" style={{ background: ACCENT } as React.CSSProperties}>Schedule Consultation <ArrowRight size={18} weight="bold" /></MagneticButton>
              </form>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* 19. SERVICE AREA */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, #f5efe8 0%, ${BG} 50%, #f5efe8 100%)` }} />
        <ElegantPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Service Area" title="Where We Cater" accent={ACCENT} />
          <div className="text-center">
            <GlassCard className="p-8 inline-block">
              <div className="flex items-center gap-3 text-lg">
                <MapPin size={24} weight="duotone" style={{ color: ACCENT }} />
                <MapLink address={data.address} className="text-[#1c1917] font-semibold" />
              </div>
              <p className="text-[#6b7280] text-sm mt-2">&amp; Surrounding Areas Within 50 Miles</p>
              <div className="flex flex-wrap justify-center gap-3 mt-5">
                {["On-Site Catering", "Venue Partnerships", "Delivery Available", "Pickup Options"].map((area) => (
                  <span key={area} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border" style={{ color: ACCENT, borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}>
                    <CheckCircle size={12} weight="fill" /> {area}
                  </span>
                ))}
              </div>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* 20. HOURS */}
      {data.hours && (
        <section className="relative z-10 py-24 md:py-32 overflow-hidden">
          <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #f5efe8 50%, ${BG} 100%)` }} />
          <VineDecor opacity={0.02} accent={ACCENT} />
          <div className="max-w-3xl mx-auto px-6 relative z-10">
            <SectionHeader badge="Hours" title="When We're Available" accent={ACCENT} />
            <div className="text-center">
              <ShimmerBorder accent={ACCENT}>
                <div className="p-8">
                  <Clock size={32} weight="duotone" style={{ color: ACCENT }} className="mx-auto mb-4" />
                  <p className="text-[#4b5563] leading-relaxed whitespace-pre-line text-lg">{data.hours}</p>
                  <p className="text-sm mt-4 font-semibold" style={{ color: ACCENT }}>Free Event Consultations by Appointment</p>
                </div>
              </ShimmerBorder>
            </div>
          </div>
        </section>
      )}

      {/* 21. EMERGENCY / URGENCY */}
      <section className="relative z-10 py-16 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, #f5efe8 0%, ${BG} 100%)` }} />
        <ElegantPattern opacity={0.015} accent={ACCENT} />
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <GlassCard className="p-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="relative">
                <div className="w-3 h-3 rounded-full" style={{ background: ACCENT }} />
                <div className="absolute inset-0 w-3 h-3 rounded-full animate-ping" style={{ background: ACCENT, opacity: 0.4 }} />
              </div>
              <span className="text-sm font-bold uppercase tracking-wider" style={{ color: ACCENT }}>Now Booking Events</span>
            </div>
            <h3 className="text-2xl font-bold text-[#1c1917] mb-2">Limited Availability This Season</h3>
            <p className="text-[#6b7280] mb-6">Popular dates fill quickly. Secure your event date with a complimentary consultation today.</p>
            <PhoneLink phone={data.phone} className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-white font-semibold" style={{ background: ACCENT }}>
              <Phone size={20} weight="fill" /> Reserve Your Date
            </PhoneLink>
          </GlassCard>
        </div>
      </section>

      {/* 22. GUARANTEE */}
      <section className="relative z-10 py-16 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #f5efe8 100%)` }} />
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <ShimmerBorder accent={ACCENT}><div className="p-8 md:p-12">
            <ShieldCheck size={48} weight="fill" style={{ color: ACCENT }} className="mx-auto mb-4" />
            <h2 className="text-2xl md:text-4xl font-extrabold text-[#1c1917] mb-4">Our Promise</h2>
            <p className="text-[#6b7280] leading-relaxed max-w-2xl mx-auto text-lg">{data.businessName} guarantees exceptional cuisine, flawless service, and a stress-free experience for every event we cater.</p>
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              {["Award-Winning Cuisine", "Farm-to-Table Fresh", "Custom Menus", "Full Service", "Satisfaction Guaranteed"].map((item) => (
                <span key={item} className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border" style={{ color: ACCENT, borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}><CheckCircle size={16} weight="fill" /> {item}</span>
              ))}
            </div>
          </div></ShimmerBorder>
        </div>
      </section>

      {/* 20. FOOTER */}
      <footer className="relative z-10 border-t border-gray-100 py-10 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #f0e8df 100%)` }} />
        <ElegantPattern opacity={0.015} accent={ACCENT} />
        <div className="mx-auto max-w-6xl px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div><div className="flex items-center gap-2 mb-3"><ForkKnife size={22} weight="fill" style={{ color: ACCENT }} /><span className="text-lg font-bold text-[#1c1917]">{data.businessName}</span></div><p className="text-sm text-[#9ca3af] leading-relaxed">{data.about.length > 120 ? data.about.slice(0, 120).trim() + "..." : data.about}</p></div>
            <div><h4 className="text-sm font-semibold text-[#1c1917] mb-3">Quick Links</h4><div className="space-y-2">{["Services", "Menu", "Gallery", "About", "Contact"].map((link) => <a key={link} href={`#${link.toLowerCase()}`} className="block text-sm text-[#9ca3af] hover:text-[#1c1917] transition-colors">{link}</a>)}</div></div>
            <div><h4 className="text-sm font-semibold text-[#1c1917] mb-3">Contact</h4><div className="space-y-2 text-sm text-[#9ca3af]"><p><PhoneLink phone={data.phone} /></p><p><MapLink address={data.address} /></p>{data.socialLinks && Object.entries(data.socialLinks).map(([platform, url]) => <a key={platform} href={url} target="_blank" rel="noopener noreferrer" className="block hover:text-[#1c1917] transition-colors capitalize">{platform}</a>)}</div></div>
          </div>
          <div className="border-t border-gray-100 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-[#9ca3af]"><ForkKnife size={14} weight="fill" style={{ color: ACCENT }} /><span>{data.businessName} &copy; {new Date().getFullYear()}</span></div>
            <div className="flex items-center gap-2 text-xs text-[#6b7280]"><BluejayLogo className="w-4 h-4" /><span>Created by <a href="https://bluejayportfolio.com" target="_blank" rel="noopener noreferrer" style={{textDecoration:"underline"}}>bluejayportfolio.com</a></span></div>
          </div>
        </div>
      </footer>

      <ClaimBanner businessName={data.businessName} accentColor={ACCENT} prospectId={data.id} />
      <div className="h-14 md:h-28" />
    </main>
  );
}
