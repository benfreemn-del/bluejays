"use client";

/* eslint-disable @next/next/no-img-element -- These static marketing and preview components intentionally use plain img tags to preserve existing markup and visual behavior during lint-only cleanup. */
/* eslint-disable react-hooks/purity -- Decorative particle values are intentionally randomized for static visual effects in these marketing pages and previews; this preserves existing appearance without changing business logic. */

import { useState, useRef, useCallback } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  AnimatePresence,
} from "framer-motion";
import {
  Truck,
  Recycle,
  Clock,
  Phone,
  MapPin,
  CaretDown,
  List,
  X,
  Star,
  ArrowRight,
  CheckCircle,
  ShieldCheck,
  Trash,
  House,
  Buildings,
  Broom,
  Play,
  NavigationArrow,
  Leaf,
  Package,
  Couch,
  Tree,
} from "@phosphor-icons/react";
import type { GeneratedSiteData } from "@/lib/generator";
import BluejayLogo from "../BluejayLogo";
import { MapLink, PhoneLink } from "@/components/templates/MapLink";
import ClaimBanner from "@/components/ClaimBanner";
import { pickFromPool, pickGallery } from "@/lib/stock-image-picker";

const spring = { type: "spring" as const, stiffness: 100, damping: 20 };
const springFast = { type: "spring" as const, stiffness: 200, damping: 25 };

const CHARCOAL = "#1a1a1a";
const DEFAULT_GREEN = "#22c55e";
const GREEN_LIGHT = "#86efac";
const FOREST_ACCENT = "#166534";

function getAccent(accentColor?: string) {
  const c = accentColor || DEFAULT_GREEN;
  return {
    ACCENT: c,
    ACCENT_GLOW: `${c}26`,
    ACCENT_LIGHT: GREEN_LIGHT,
    FOREST: FOREST_ACCENT,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SERVICE_ICON_MAP: Record<string, any> = {
  junk: Trash,
  residential: House,
  commercial: Buildings,
  estate: House,
  furniture: Couch,
  appliance: Recycle,
  construction: Trash,
  yard: Tree,
  cleanout: Broom,
  debris: Trash,
  haul: Truck,
  demo: Trash,
  hoarding: Broom,
  garage: House,
  office: Buildings,
  storage: Package,
};

function getServiceIcon(n: string) {
  const l = n.toLowerCase();
  for (const [k, I] of Object.entries(SERVICE_ICON_MAP)) {
    if (l.includes(k)) return I;
  }
  return Truck;
}

const STOCK_HERO_POOL = [
  "https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=1400&q=80",
];
const STOCK_ABOUT_POOL = [
  "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600&q=80",
];
const STOCK_GALLERY = [
  "https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=600&q=80",
  "https://images.unsplash.com/photo-1590496793929-36417d3117de?w=600&q=80",
  "https://images.unsplash.com/photo-1616627547584-bf28cee262db?w=600&q=80",
  "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600&q=80",
];

/* ── decorative backgrounds ── */

function FloatingParticles({ accent }: { accent: string }) {
  const particles = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 8,
    duration: 5 + Math.random() * 7,
    size: 2 + Math.random() * 3,
    opacity: 0.12 + Math.random() * 0.25,
    isForest: Math.random() > 0.6,
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
            background: p.isForest ? FOREST_ACCENT : accent,
            willChange: "transform, opacity",
          }}
          animate={{
            y: ["-10vh", "110vh"],
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

function RecyclePattern({ opacity = 0.03, accent }: { opacity?: number; accent: string }) {
  const patternId = `recycleV2-${accent.replace("#", "")}`;
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }}>
      <defs>
        <pattern id={patternId} width="80" height="80" patternUnits="userSpaceOnUse">
          <path d="M20 20 L30 10 L40 20 L35 20 L35 35 L25 35 L25 20 Z" fill="none" stroke={accent} strokeWidth="0.5" opacity="0.2" />
          <circle cx="60" cy="60" r="8" fill="none" stroke={accent} strokeWidth="0.3" opacity="0.15" />
          <path d="M56 60 L60 55 L64 60" fill="none" stroke={accent} strokeWidth="0.4" opacity="0.2" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  );
}

function LeafTrail({ opacity = 0.03, accent }: { opacity?: number; accent: string }) {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }} viewBox="0 0 1000 600" preserveAspectRatio="none">
      <motion.path d="M100 0 Q120 100 100 200 Q80 300 100 400 Q120 500 100 600" fill="none" stroke={accent} strokeWidth="2" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} />
      <motion.path d="M500 0 Q480 150 500 300 Q520 450 500 600" fill="none" stroke={FOREST_ACCENT} strokeWidth="1.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }} />
    </svg>
  );
}

/* ── shared UI components ── */

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-white/15 bg-white/[0.08] backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] ${className}`}>{children}</div>;
}

function MagneticButton({ children, className = "", onClick, style, href }: { children: React.ReactNode; className?: string; onClick?: () => void; style?: React.CSSProperties; href?: string }) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, springFast);
  const springY = useSpring(y, springFast);
  const isTouchDevice = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
  const handleMouseMove = useCallback((e: React.MouseEvent) => { if (!ref.current || isTouchDevice) return; const rect = ref.current.getBoundingClientRect(); x.set((e.clientX - (rect.left + rect.width / 2)) * 0.25); y.set((e.clientY - (rect.top + rect.height / 2)) * 0.25); }, [x, y, isTouchDevice]);
  const handleMouseLeave = useCallback(() => { x.set(0); y.set(0); }, [x, y]);
  if (href) return <motion.a href={href} ref={ref as unknown as React.Ref<HTMLAnchorElement>} style={{ x: springX, y: springY, willChange: "transform", ...style }} onMouseMove={handleMouseMove as unknown as React.MouseEventHandler<HTMLAnchorElement>} onMouseLeave={handleMouseLeave} className={className} whileTap={{ scale: 0.97 }}>{children}</motion.a>;
  return <motion.button ref={ref} style={{ x: springX, y: springY, willChange: "transform", ...style }} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} onClick={onClick} className={className} whileTap={{ scale: 0.97 }}>{children}</motion.button>;
}

function ShimmerBorder({ children, className = "", accent }: { children: React.ReactNode; className?: string; accent: string }) {
  return (
    <div className={`relative rounded-2xl p-[1px] overflow-hidden ${className}`}>
      <motion.div className="absolute inset-0 rounded-2xl" style={{ background: `conic-gradient(from 0deg, transparent, ${accent}, transparent, ${FOREST_ACCENT}, transparent)`, willChange: "transform" }} animate={{ rotate: [0, 360] }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} />
      <div className="relative rounded-2xl bg-[#141414] z-10">{children}</div>
    </div>
  );
}

function AccordionItem({ question, answer, isOpen, onToggle }: { question: string; answer: string; isOpen: boolean; onToggle: () => void }) {
  return (
    <GlassCard className="overflow-hidden">
      <button onClick={onToggle} className="w-full flex items-center justify-between p-5 md:p-6 text-left group cursor-pointer">
        <span className="text-lg font-semibold text-white pr-4">{question}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={spring}><CaretDown size={20} className="text-slate-400 shrink-0" /></motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={spring} className="overflow-hidden">
            <p className="px-5 pb-5 md:px-6 md:pb-6 text-slate-400 leading-relaxed">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
}

function SectionHeader({ badge, title, subtitle, accent }: { badge: string; title: string; subtitle?: string; accent: string }) {
  return (
    <div className="text-center mb-16">
      <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: accent, borderColor: `${accent}33`, background: `${accent}0d` }}>{badge}</span>
      <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white">{title}</h2>
      <div className="h-0.5 w-16 mx-auto mt-4" style={{ background: `linear-gradient(to right, ${accent}, transparent)` }} />
      {subtitle && <p className="text-slate-400 mt-4 max-w-2xl text-lg leading-relaxed mx-auto">{subtitle}</p>}
    </div>
  );
}

/* ── constants ── */

const ITEM_TYPES = [
  { icon: Couch, title: "Furniture", desc: "Sofas, mattresses, tables, dressers, desks" },
  { icon: Recycle, title: "Appliances", desc: "Fridges, washers, dryers, AC units, water heaters" },
  { icon: Trash, title: "Construction Debris", desc: "Drywall, lumber, flooring, roofing materials" },
  { icon: Tree, title: "Yard Waste", desc: "Branches, stumps, leaves, dirt, sod" },
  { icon: Package, title: "Electronics", desc: "TVs, computers, monitors, printers" },
  { icon: House, title: "Estate Cleanouts", desc: "Full property cleanouts for moving or inheritance" },
  { icon: Buildings, title: "Office Cleanouts", desc: "Cubicles, filing cabinets, commercial equipment" },
  { icon: Broom, title: "Hoarding Cleanup", desc: "Compassionate, discreet full-home cleaning" },
];

const TRUCK_SIZES = [
  {
    title: "1/4 Truck Load",
    price: "$149",
    desc: "Perfect for a few items — a couch, mattress, or small pile",
    items: "2-4 items",
  },
  {
    title: "1/2 Truck Load",
    price: "$249",
    desc: "Great for a garage cleanout or small room clearance",
    items: "5-10 items",
    popular: true,
  },
  {
    title: "Full Truck Load",
    price: "$399",
    desc: "Full estate cleanout, renovation debris, or major declutter",
    items: "15+ items",
  },
];

const ECO_STATS = [
  { label: "Donated", pct: 40, color: "#22c55e", desc: "Usable items donated to local charities" },
  { label: "Recycled", pct: 35, color: "#3b82f6", desc: "Materials properly sorted and recycled" },
  { label: "Landfill", pct: 25, color: "#6b7280", desc: "Only what cannot be reused or recycled" },
];

const COMPARISON_ROWS = [
  { feature: "Same-Day Pickup Available", us: true, them: "No" },
  { feature: "Upfront Pricing (No Surprises)", us: true, them: "Varies" },
  { feature: "Eco-Friendly Disposal", us: true, them: "No" },
  { feature: "Licensed & Insured", us: true, them: "Sometimes" },
  { feature: "We Do the Heavy Lifting", us: true, them: "DIY" },
  { feature: "Donation Drop-off Included", us: true, them: "Extra Cost" },
  { feature: "Construction Debris OK", us: true, them: "Limited" },
];

const VOLUME_OPTIONS = [
  { label: "A Few Items", emoji: "📦", result: "Our 1/4 truck load is perfect. Starting at just $149." },
  { label: "A Room or Garage", emoji: "🏠", result: "A 1/2 truck load will handle this easily. Starting at $249." },
  { label: "Whole Property", emoji: "🏗️", result: "Full truck load or multiple trips. We'll give you a custom quote!" },
];

/* ── main component ── */

export default function V2JunkRemovalPreview({ data }: { data: GeneratedSiteData }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const { ACCENT, ACCENT_GLOW } = getAccent(data.accentColor);
  const uniquePhotos = data.photos ? [...new Set(data.photos)] : [];
  const heroImage = uniquePhotos[0] || pickFromPool(STOCK_HERO_POOL, data.businessName);
  const heroCardImage = uniquePhotos[1] || pickFromPool(STOCK_ABOUT_POOL, data.businessName);
  const aboutImage = uniquePhotos[2] || pickFromPool(STOCK_ABOUT_POOL, data.businessName);
  const galleryImages = data.photos?.length > 2 ? data.photos.slice(2, 6) : pickGallery(STOCK_GALLERY, data.businessName);
  const phoneDigits = data.phone.replace(/\D/g, "");

  const processSteps = [
    { step: "01", title: "Call or Book Online", desc: "Tell us what you need removed and we'll give you an instant estimate." },
    { step: "02", title: "We Show Up", desc: "Our crew arrives on time with the right truck for the job." },
    { step: "03", title: "We Load Everything", desc: "We do all the heavy lifting — you just point and we haul." },
    { step: "04", title: "Eco-Friendly Disposal", desc: "We donate, recycle, and responsibly dispose of everything." },
  ];

  const faqs = [
    { q: "What items do you accept?", a: `${data.businessName} takes almost everything — furniture, appliances, yard waste, construction debris, electronics, and more. The only things we can't take are hazardous materials like paint, chemicals, and asbestos.` },
    { q: "How does pricing work?", a: "We price by volume (how much space your items take in our truck), not by item count. You'll get an upfront quote before we start — no surprises." },
    { q: "Do you offer same-day service?", a: `Yes! ${data.businessName} offers same-day pickup in most areas. Call before noon and we can usually be there the same afternoon.` },
    { q: "What happens to my items after pickup?", a: "We sort everything. Usable items are donated to local charities, recyclable materials go to recycling facilities, and only what's truly waste goes to the landfill." },
    { q: "Do I need to be home during pickup?", a: "Not always! If items are accessible (driveway, garage, curb), we can handle it without you. We'll confirm details during booking." },
  ];

  const fallbackTestimonials = [
    { name: "Mike T.", text: "Cleared out my entire garage in under an hour. These guys were fast, friendly, and surprisingly affordable. Love that they donate usable items!", rating: 5 },
    { name: "Sarah L.", text: "Handled my mom's estate cleanout with care and respect. They even swept up after. Couldn't have asked for a better experience.", rating: 5 },
    { name: "James R.", text: "Construction debris from our bathroom remodel — gone in 30 minutes. Fair price, hard workers, and they recycled what they could.", rating: 5 },
  ];

  const testimonials = data.testimonials?.length > 0 ? data.testimonials : fallbackTestimonials;

  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden" style={{ background: CHARCOAL, color: "#f1f5f9" }}>
      <FloatingParticles accent={ACCENT} />

      {/* ── NAV ── */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-4">
          <GlassCard className="flex items-center justify-between px-4 md:px-6 py-3">
            <div className="flex items-center gap-2">
              <Truck size={24} weight="fill" style={{ color: ACCENT }} />
              <span className="text-lg font-bold tracking-tight text-white">{data.businessName}</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
              <a href="#services" className="hover:text-white transition-colors">Services</a>
              <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
              <a href="#about" className="hover:text-white transition-colors">About</a>
              <a href="#contact" className="hover:text-white transition-colors">Contact</a>
            </div>
            <div className="flex items-center gap-3">
              <MagneticButton className="px-4 md:px-5 py-2 rounded-full text-sm font-semibold text-white transition-colors cursor-pointer" style={{ background: ACCENT } as React.CSSProperties}>
                Free Quote
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
                  {[{ label: "Services", href: "#services" }, { label: "Pricing", href: "#pricing" }, { label: "About", href: "#about" }, { label: "Contact", href: "#contact" }].map((link) => (
                    <a key={link.label} href={link.href} onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors">{link.label}</a>
                  ))}
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* ── 1. HERO ── */}
      <section className="relative min-h-[100dvh] flex items-center pt-24 z-10 overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImage} alt={data.businessName} className="w-full h-full object-cover object-center" />
          <div className="absolute inset-0 bg-black/70" />
        </div>
        <RecyclePattern opacity={0.04} accent={ACCENT} />
        <LeafTrail opacity={0.04} accent={ACCENT} />
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full blur-[200px] pointer-events-none" style={{ background: `${ACCENT}08` }} />
        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          <div className="space-y-8">
            <div>
              <p className="text-sm uppercase tracking-widest mb-4" style={{ color: ACCENT }}>Junk Removal Experts</p>
              <h1 className="text-3xl md:text-6xl tracking-tighter leading-none font-bold text-white" style={{ textShadow: "0 2px 20px rgba(0,0,0,0.8), 0 4px 40px rgba(0,0,0,0.5)" }}>
                {data.tagline}
              </h1>
            </div>
            <p className="text-lg text-white/80 max-w-md leading-relaxed" style={{ textShadow: "0 1px 8px rgba(0,0,0,0.6)" }}>
              {(() => { const t = data.about; if (t.length <= 180) return t; const dot = t.indexOf(".", 80); return dot > 0 && dot < 220 ? t.slice(0, dot + 1) : t.slice(0, 180).trim() + "..."; })()}
            </p>
            <div className="flex flex-wrap gap-4">
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white flex items-center gap-2 cursor-pointer" style={{ background: ACCENT } as React.CSSProperties}>
                Get Free Quote <ArrowRight size={18} weight="bold" />
              </MagneticButton>
              <MagneticButton href={`tel:${phoneDigits}`} className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/15 flex items-center gap-2 cursor-pointer">
                <Phone size={18} weight="duotone" /> <PhoneLink phone={data.phone} />
              </MagneticButton>
            </div>
            <div className="flex flex-wrap gap-3">
              {["Eco-Friendly", data.googleRating ? `${data.googleRating}-Star Rated` : "5-Star Rated", "Same-Day Service"].map((badge) => (
                <span key={badge} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border backdrop-blur-md" style={{ color: ACCENT, borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}>
                  <CheckCircle size={14} weight="fill" /> {badge}
                </span>
              ))}
            </div>
          </div>
          <div className="hidden md:block relative">
            <div className="relative rounded-2xl overflow-hidden border border-white/15">
              <img src={heroCardImage} alt={`${data.businessName} junk removal`} className="w-full h-[500px] object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6">
                <div className="px-4 py-2 rounded-full backdrop-blur-md bg-black/50 border flex items-center gap-2" style={{ borderColor: `${ACCENT}4d` }}>
                  <Recycle size={18} weight="fill" style={{ color: ACCENT }} />
                  <span className="text-sm font-semibold text-white">75% Diverted from Landfill</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. STATS BAR ── */}
      <section className="relative z-10 py-16 overflow-hidden border-y" style={{ borderColor: `${ACCENT}1a` }}>
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #0a120a 0%, #1a1a1a 100%)" }} />
        <RecyclePattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {data.stats.map((stat, i) => {
              const statIcons = [Truck, Recycle, Star, ShieldCheck];
              const Icon = statIcons[i % statIcons.length];
              return (
                <div key={stat.label} className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Icon size={22} weight="fill" style={{ color: ACCENT }} />
                    <span className="text-3xl md:text-4xl font-extrabold text-white">{stat.value}</span>
                  </div>
                  <span className="text-slate-500 text-sm font-medium tracking-wide uppercase">{stat.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 3. ITEM TYPES GRID ── */}
      <section id="services" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0a0e18 50%, #1a1a1a 100%)" }} />
        <RecyclePattern accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="What We Take" title="Items We Remove" subtitle="If it fits in our truck, we take it. Almost nothing is off-limits." accent={ACCENT} />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {ITEM_TYPES.map((item) => {
              const Icon = item.icon;
              return (
                <GlassCard key={item.title} className="p-5 text-center group hover:border-white/20 transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 border" style={{ background: ACCENT_GLOW, borderColor: `${ACCENT}33` }}>
                    <Icon size={24} weight="duotone" style={{ color: ACCENT }} />
                  </div>
                  <h3 className="text-white font-bold text-sm mb-1">{item.title}</h3>
                  <p className="text-xs text-slate-500">{item.desc}</p>
                </GlassCard>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 4. SERVICES ── */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0a120a 50%, #1a1a1a 100%)" }} />
        <LeafTrail opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Our Services" title="Junk Removal Services" subtitle={`${data.businessName} handles jobs of every size — from single items to full property cleanouts.`} accent={ACCENT} />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.services.map((service, i) => {
              const Icon = getServiceIcon(service.name);
              return (
                <div key={service.name} className="group relative p-7 rounded-2xl border border-white/[0.10] hover:border-opacity-30 transition-all duration-500 overflow-hidden bg-white/[0.07]">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: `radial-gradient(circle at 50% 0%, ${ACCENT}15, transparent 70%)` }} />
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-5">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center border" style={{ background: ACCENT_GLOW, borderColor: `${ACCENT}33` }}>
                        <Icon size={24} weight="duotone" style={{ color: ACCENT }} />
                      </div>
                      <span className="text-xs font-mono text-slate-600">{String(i + 1).padStart(2, "0")}</span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{service.name}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{service.description || ""}</p>
                    {service.price && <p className="text-sm font-semibold mt-3" style={{ color: ACCENT }}>{service.price}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 5. TRUCK SIZE PRICING ── */}
      <section id="pricing" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0a0e18 50%, #1a1a1a 100%)" }} />
        <RecyclePattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Pricing" title="Simple Truck-Based Pricing" subtitle="No hidden fees. We price by volume, not by item count." accent={ACCENT} />
          <div className="grid md:grid-cols-3 gap-6">
            {TRUCK_SIZES.map((tier) => (
              <div key={tier.title} className="relative">
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold text-white z-20" style={{ background: ACCENT }}>Most Popular</div>
                )}
                <GlassCard className={`p-8 h-full flex flex-col ${tier.popular ? "border-2" : ""}`} {...(tier.popular ? { style: { borderColor: `${ACCENT}4d` } } : {})}>
                  <Truck size={32} weight="duotone" style={{ color: ACCENT }} className="mb-4" />
                  <h3 className="text-lg font-bold text-white mb-1">{tier.title}</h3>
                  <p className="text-xs text-slate-500 mb-1">{tier.items}</p>
                  <p className="text-4xl font-black mb-4" style={{ color: ACCENT }}>{tier.price}</p>
                  <p className="text-sm text-slate-400 leading-relaxed flex-1">{tier.desc}</p>
                  <MagneticButton className="w-full mt-6 py-3 rounded-xl text-sm font-semibold text-white cursor-pointer text-center" style={{ background: tier.popular ? ACCENT : `${ACCENT}22`, border: tier.popular ? "none" : `1px solid ${ACCENT}33` } as React.CSSProperties}>
                    Book Now
                  </MagneticButton>
                </GlassCard>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. ECO COMMITMENT ── */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0a120a 50%, #1a1a1a 100%)" }} />
        <LeafTrail opacity={0.02} accent={ACCENT} />
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Eco-Friendly" title="Our Commitment to the Planet" subtitle="We don't just haul junk — we sort, donate, and recycle as much as possible." accent={ACCENT} />
          <div className="space-y-6">
            {ECO_STATS.map((stat) => (
              <div key={stat.label}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <Leaf size={18} weight="fill" style={{ color: stat.color }} />
                    <span className="text-white font-semibold">{stat.label}</span>
                  </div>
                  <span className="text-2xl font-black" style={{ color: stat.color }}>{stat.pct}%</span>
                </div>
                <div className="w-full h-3 rounded-full bg-white/5 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: stat.color }}
                    initial={{ width: 0 }}
                    whileInView={{ width: `${stat.pct}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">{stat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. ABOUT ── */}
      <section id="about" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0a0e18 50%, #1a1a1a 100%)" }} />
        <RecyclePattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="relative">
              <div className="rounded-2xl overflow-hidden border border-white/15">
                <img src={aboutImage} alt={`${data.businessName} team`} className="w-full h-[400px] object-cover" />
              </div>
              <div className="absolute -bottom-4 -right-4 md:bottom-6 md:-right-6">
                <div className="px-5 py-3 rounded-xl backdrop-blur-md border text-white font-bold text-sm shadow-lg" style={{ background: `${ACCENT}e6`, borderColor: `${ACCENT}80` }}>
                  {data.stats[0] ? `${data.stats[0].value} ${data.stats[0].label}` : "Loads Hauled"}
                </div>
              </div>
            </div>
            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: ACCENT, borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}>About Us</span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6 text-white">Junk Gone. Stress Gone.</h2>
              <p className="text-slate-400 leading-relaxed mb-8">{data.about}</p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: ShieldCheck, label: "Licensed & Insured" },
                  { icon: Recycle, label: "Eco-Friendly" },
                  { icon: Star, label: "Top Rated" },
                  { icon: CheckCircle, label: "Satisfaction Guaranteed" },
                ].map((badge) => (
                  <GlassCard key={badge.label} className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: ACCENT_GLOW }}>
                      <badge.icon size={20} weight="duotone" style={{ color: ACCENT }} />
                    </div>
                    <span className="text-sm font-semibold text-white">{badge.label}</span>
                  </GlassCard>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. PROCESS ── */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0a120a 50%, #1a1a1a 100%)" }} />
        <LeafTrail opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Our Process" title="How It Works" accent={ACCENT} />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {processSteps.map((step, i) => (
              <div key={step.step} className="relative">
                {i < processSteps.length - 1 && <div className="hidden lg:block absolute top-10 left-[calc(50%+40px)] w-[calc(100%-80px)] h-px" style={{ background: `linear-gradient(to right, ${ACCENT}33, ${ACCENT}11)` }} />}
                <GlassCard className="p-6 text-center relative">
                  <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-black" style={{ background: `linear-gradient(135deg, ${ACCENT}22, ${ACCENT}0a)`, color: ACCENT, border: `1px solid ${ACCENT}33` }}>{step.step}</div>
                  <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
                </GlassCard>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 9. GALLERY ── */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0a0e18 50%, #1a1a1a 100%)" }} />
        <RecyclePattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Our Work" title="Recent Cleanouts" accent={ACCENT} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {galleryImages.map((src, i) => {
              const titles = ["Garage Cleanout", "Estate Clearing", "Construction Debris", "Office Cleanout"];
              return (
                <div key={i} className="group relative rounded-2xl overflow-hidden border border-white/[0.10] hover:border-opacity-30 transition-all duration-500">
                  <img src={src} alt={titles[i]} className="w-full h-64 object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-lg font-bold text-white mb-1">{titles[i]}</h3>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 10. VIDEO PLACEHOLDER ── */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0a120a 50%, #1a1a1a 100%)" }} />
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <SectionHeader badge="See It In Action" title="Watch Our Crew Work" accent={ACCENT} />
          <div className="relative rounded-2xl overflow-hidden border border-white/15">
            <img src={heroImage} alt="Junk removal in action" className="w-full h-[350px] object-cover" />
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full flex items-center justify-center cursor-pointer border-2" style={{ background: `${ACCENT}cc`, borderColor: ACCENT }}>
                <Play size={36} weight="fill" className="text-white ml-1" />
              </div>
            </div>
            <div className="absolute bottom-6 left-6">
              <p className="text-white font-semibold text-lg">Cleanout Timelapse</p>
              <p className="text-white/60 text-sm">See a full garage cleanout in under 60 seconds</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 11. GOOGLE REVIEWS + TESTIMONIALS ── */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0a0e18 50%, #1a1a1a 100%)" }} />
        <RecyclePattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border backdrop-blur-md" style={{ borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}>
              <div className="flex gap-0.5">{Array.from({ length: 5 }).map((_, j) => <Star key={j} size={18} weight="fill" style={{ color: ACCENT }} />)}</div>
              <span className="text-white font-semibold text-sm">{data.googleRating || "5.0"} Rating</span>
              {data.reviewCount && <span className="text-slate-400 text-sm">({data.reviewCount}+ reviews)</span>}
            </div>
          </div>
          <SectionHeader badge="Reviews" title="What Our Customers Say" accent={ACCENT} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <GlassCard key={i} className="p-6 h-full flex flex-col">
                <div className="text-4xl mb-4" style={{ color: `${ACCENT}33` }}>&ldquo;</div>
                <div className="flex gap-0.5 mb-4">{Array.from({ length: t.rating || 5 }).map((_, j) => <Star key={j} size={16} weight="fill" style={{ color: ACCENT }} />)}</div>
                <p className="text-slate-300 leading-relaxed flex-1 text-sm mb-4">{t.text}</p>
                <div className="pt-4 border-t border-white/8 flex items-center gap-2">
                  <CheckCircle size={14} weight="fill" style={{ color: ACCENT }} />
                  <span className="text-sm font-semibold text-white">{t.name}</span>
                  <span className="text-xs text-slate-500">Verified Customer</span>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* ── 12. COMPETITOR COMPARISON ── */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0a120a 50%, #1a1a1a 100%)" }} />
        <LeafTrail opacity={0.02} accent={ACCENT} />
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Why Us" title={`${data.businessName} vs. DIY & Dumpster Rental`} accent={ACCENT} />
          <GlassCard className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/15">
                    <th className="text-left p-4 text-slate-400 font-medium">Feature</th>
                    <th className="text-center p-4 font-bold" style={{ color: ACCENT }}>{data.businessName}</th>
                    <th className="text-center p-4 text-slate-500 font-medium">Others</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_ROWS.map((row) => (
                    <tr key={row.feature} className="border-b border-white/8 hover:bg-white/[0.07] transition-colors">
                      <td className="p-4 text-slate-300">{row.feature}</td>
                      <td className="p-4 text-center"><CheckCircle size={20} weight="fill" className="mx-auto" style={{ color: "#22c55e" }} /></td>
                      <td className="p-4 text-center text-slate-500 text-xs">{row.them}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* ── 13. VOLUME ESTIMATOR QUIZ ── */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0a0e18 50%, #1a1a1a 100%)" }} />
        <RecyclePattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Estimate" title="How Much Junk Do You Have?" accent={ACCENT} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {VOLUME_OPTIONS.map((opt, i) => (
              <button key={opt.label} onClick={() => setQuizAnswer(i)} className={`p-6 rounded-2xl border text-left transition-all duration-300 cursor-pointer ${quizAnswer === i ? "border-opacity-100 bg-white/[0.06]" : "border-white/15 bg-white/[0.07] hover:bg-white/[0.07]"}`} style={quizAnswer === i ? { borderColor: ACCENT } : undefined}>
                <span className="text-2xl mb-3 block">{opt.emoji}</span>
                <h3 className="text-white font-semibold text-sm">{opt.label}</h3>
              </button>
            ))}
          </div>
          <AnimatePresence>
            {quizAnswer !== null && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}>
                <ShimmerBorder accent={ACCENT}>
                  <div className="p-6 text-center">
                    <p className="text-white text-lg mb-4">{VOLUME_OPTIONS[quizAnswer].result}</p>
                    <MagneticButton href={`tel:${phoneDigits}`} className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white cursor-pointer" style={{ background: ACCENT } as React.CSSProperties}>
                      <Phone size={16} weight="fill" /> Call for Exact Quote
                    </MagneticButton>
                  </div>
                </ShimmerBorder>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ── 14. CERTIFICATIONS ── */}
      <section className="relative z-10 py-16 overflow-hidden border-y" style={{ borderColor: `${ACCENT}1a` }}>
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #0a120a 0%, #1a1a1a 100%)" }} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="flex flex-wrap justify-center gap-4">
            {["Licensed & Insured", "BBB Accredited", "Eco-Friendly Certified", "Background Checked", "Same-Day Available", "5-Star Google Rating"].map((badge) => (
              <span key={badge} className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium border" style={{ color: ACCENT, borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}>
                <ShieldCheck size={14} weight="fill" /> {badge}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── 15. MID-PAGE CTA ── */}
      <section className="relative z-10 py-20 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT}cc, ${ACCENT})` }} />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='40' height='40' fill='none'/%3E%3Cpath d='M0 0L40 40M40 0L0 40' stroke='%23000' stroke-width='0.5'/%3E%3C/svg%3E\")" }} />
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <Truck size={48} weight="fill" className="mx-auto mb-6 text-white/70" />
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-4">Ready to Clear the Clutter?</h2>
          <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">We do the heavy lifting. You just point and we haul.</p>
          <PhoneLink phone={data.phone} className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-white text-black font-bold text-lg hover:bg-white/90 transition-colors">
            <Phone size={22} weight="fill" /> Call {data.phone}
          </PhoneLink>
        </div>
      </section>

      {/* ── 16. SERVICE AREA ── */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0a120a 50%, #1a1a1a 100%)" }} />
        <RecyclePattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Service Area" title="Areas We Serve" accent={ACCENT} />
          <div className="flex flex-col items-center gap-6">
            <GlassCard className="p-8 inline-block">
              <div className="flex items-center gap-3 text-lg">
                <MapPin size={24} weight="duotone" style={{ color: ACCENT }} />
                <MapLink address={data.address} className="text-white font-semibold" />
              </div>
              <p className="text-slate-400 text-sm mt-2">&amp; Surrounding Areas</p>
            </GlassCard>
            <div className="flex flex-wrap justify-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full border" style={{ borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}>
                <NavigationArrow size={14} weight="fill" style={{ color: ACCENT }} />
                <span className="text-sm text-slate-300">Same-day pickup available</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full border" style={{ borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}>
                <div className="relative">
                  <div className="w-2 h-2 rounded-full animate-ping absolute" style={{ background: `${ACCENT}80` }} />
                  <div className="w-2 h-2 rounded-full relative" style={{ background: ACCENT }} />
                </div>
                <span className="text-sm text-slate-300">Trucks available now</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 17. HOURS ── */}
      {data.hours && (
        <section className="relative z-10 py-24 md:py-32 overflow-hidden">
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0a0e18 50%, #1a1a1a 100%)" }} />
          <LeafTrail opacity={0.02} accent={ACCENT} />
          <div className="max-w-3xl mx-auto px-6 relative z-10">
            <SectionHeader badge="Hours" title="When We're Available" accent={ACCENT} />
            <div className="text-center">
              <ShimmerBorder accent={ACCENT}>
                <div className="p-8">
                  <Clock size={32} weight="duotone" style={{ color: ACCENT }} className="mx-auto mb-4" />
                  <p className="text-slate-300 leading-relaxed whitespace-pre-line text-lg">{data.hours}</p>
                </div>
              </ShimmerBorder>
            </div>
          </div>
        </section>
      )}

      {/* ── 18. FAQ ── */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0a120a 50%, #1a1a1a 100%)" }} />
        <RecyclePattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <SectionHeader badge="FAQ" title="Common Questions" accent={ACCENT} />
          <div className="space-y-3">
            {faqs.map((faq, i) => <AccordionItem key={i} question={faq.q} answer={faq.a} isOpen={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} />)}
          </div>
        </div>
      </section>

      {/* ── 19. CONTACT ── */}
      <section id="contact" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0a0e18 50%, #1a1a1a 100%)" }} />
        <RecyclePattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: ACCENT, borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}>Contact Us</span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6 text-white">Get Your Free Quote</h2>
              <p className="text-slate-400 leading-relaxed mb-8">Ready to clear the clutter? Contact {data.businessName} today for a free, no-obligation quote.</p>
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: ACCENT_GLOW }}><MapPin size={20} weight="duotone" style={{ color: ACCENT }} /></div>
                  <div><p className="text-sm font-semibold text-white">Address</p><MapLink address={data.address} className="text-sm text-slate-400" /></div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: ACCENT_GLOW }}><Phone size={20} weight="duotone" style={{ color: ACCENT }} /></div>
                  <div><p className="text-sm font-semibold text-white">Phone</p><PhoneLink phone={data.phone} className="text-sm text-slate-400" /></div>
                </div>
                {data.hours && <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: ACCENT_GLOW }}><Clock size={20} weight="duotone" style={{ color: ACCENT }} /></div>
                  <div><p className="text-sm font-semibold text-white">Hours</p><p className="text-sm text-slate-400 whitespace-pre-line">{data.hours}</p></div>
                </div>}
              </div>
            </div>
            <GlassCard className="p-8">
              <h3 className="text-xl font-semibold text-white mb-6">Request a Free Quote</h3>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className="block text-sm text-slate-400 mb-1.5">First Name</label><input type="text" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 focus:outline-none text-sm" placeholder="John" /></div>
                  <div><label className="block text-sm text-slate-400 mb-1.5">Last Name</label><input type="text" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 focus:outline-none text-sm" placeholder="Doe" /></div>
                </div>
                <div><label className="block text-sm text-slate-400 mb-1.5">Phone</label><input type="tel" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 focus:outline-none text-sm" placeholder="(555) 123-4567" /></div>
                <div><label className="block text-sm text-slate-400 mb-1.5">What Needs to Go?</label><textarea rows={3} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 focus:outline-none text-sm resize-none" placeholder="Old furniture, appliances, yard waste..." /></div>
                <MagneticButton className="w-full py-4 rounded-xl text-base font-semibold text-white flex items-center justify-center gap-2 cursor-pointer" style={{ background: ACCENT } as React.CSSProperties}>
                  Get My Free Quote <ArrowRight size={18} weight="bold" />
                </MagneticButton>
              </form>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* ── 20. GUARANTEE ── */}
      <section className="relative z-10 py-16 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0a120a 100%)" }} />
        <RecyclePattern opacity={0.015} accent={ACCENT} />
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <ShimmerBorder accent={ACCENT}>
            <div className="p-8 md:p-12">
              <ShieldCheck size={48} weight="fill" style={{ color: ACCENT }} className="mx-auto mb-4" />
              <h2 className="text-2xl md:text-4xl font-extrabold text-white mb-4">Our Clean Sweep Guarantee</h2>
              <p className="text-slate-400 leading-relaxed max-w-2xl mx-auto text-lg">{data.businessName} guarantees a clean, thorough removal every time. If you&apos;re not 100% satisfied, we&apos;ll make it right.</p>
              <div className="flex flex-wrap justify-center gap-4 mt-8">
                {["Licensed & Insured", "Eco-Friendly", "Free Quotes", "Satisfaction Guaranteed"].map((item) => (
                  <span key={item} className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border" style={{ color: ACCENT, borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}>
                    <CheckCircle size={16} weight="fill" /> {item}
                  </span>
                ))}
              </div>
            </div>
          </ShimmerBorder>
        </div>
      </section>

      {/* ── ITEMS WE TAKE EXPANDED ── */}
      <section className="relative z-10 py-20 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #111827 0%, #0f172a 50%, #111827 100%)" }} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-12">
            <Package size={40} weight="duotone" style={{ color: ACCENT }} className="mx-auto mb-3" />
            <h2 className="text-3xl md:text-4xl font-extrabold text-white">What We Take</h2>
            <p className="text-slate-400 mt-3 max-w-xl mx-auto">If you can point to it, we can haul it. Here&apos;s just a sample of what we remove daily.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {[
              "Old Furniture", "Mattresses", "Appliances", "Electronics",
              "Construction Debris", "Yard Waste", "Hot Tubs", "Pianos",
              "Exercise Equipment", "Office Furniture", "Carpeting", "Tires",
              "Sheds & Playsets", "Fencing", "Concrete & Brick", "Storage Units",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 rounded-xl border border-white/15 px-4 py-3" style={{ background: "rgba(255,255,255,0.06)" }}>
                <CheckCircle size={16} weight="fill" style={{ color: ACCENT }} className="shrink-0" />
                <span className="text-sm text-white">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ECO STATS ── */}
      <section className="relative z-10 py-20 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #0f172a 0%, #111827 100%)" }} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-12">
            <Recycle size={40} weight="duotone" style={{ color: ACCENT }} className="mx-auto mb-3" />
            <h2 className="text-3xl md:text-4xl font-extrabold text-white">Our Eco Commitment</h2>
            <div className="w-16 h-1 mx-auto mt-3 rounded-full" style={{ background: ACCENT }} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {[
              { pct: "60%", label: "Donated", desc: "Usable items donated to local charities, shelters, and families in need" },
              { pct: "30%", label: "Recycled", desc: "Metals, electronics, wood, and recyclable materials processed responsibly" },
              { pct: "10%", label: "Landfill", desc: "Only what can't be donated or recycled goes to the landfill — our last resort" },
            ].map((e) => (
              <div key={e.label} className="rounded-2xl border border-white/15 p-6 text-center" style={{ background: "rgba(255,255,255,0.06)" }}>
                <p className="text-4xl font-extrabold mb-1" style={{ color: ACCENT }}>{e.pct}</p>
                <p className="text-lg font-bold text-white mb-2">{e.label}</p>
                <p className="text-sm text-slate-400 leading-relaxed">{e.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MID-PAGE CTA ── */}
      <section className="relative z-10 py-16 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${ACCENT}15 0%, #111827 50%, ${ACCENT}08 100%)` }} />
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <Truck size={44} weight="fill" style={{ color: ACCENT }} className="mx-auto mb-4" />
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">Ready to Reclaim Your Space?</h2>
          <p className="text-slate-400 max-w-2xl mx-auto mb-8 text-lg">
            {data.businessName} makes junk removal simple. Point at what goes, we handle the rest. Same-day service available.
          </p>
          <a href={`tel:${data.phone}`} className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-white font-bold text-lg transition-transform hover:scale-105" style={{ background: ACCENT }}>
            <Phone size={20} weight="fill" /> Get a Free Quote
          </a>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="relative z-10 border-t border-white/8 py-10 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #111 100%)" }} />
        <RecyclePattern opacity={0.015} accent={ACCENT} />
        <div className="mx-auto max-w-6xl px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Truck size={22} weight="fill" style={{ color: ACCENT }} />
                <span className="text-lg font-bold text-white">{data.businessName}</span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">{data.about.length > 120 ? data.about.slice(0, 120).trim() + "..." : data.about}</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-3">Quick Links</h4>
              <div className="space-y-2">
                {["Services", "Pricing", "About", "Contact"].map((link) => (
                  <a key={link} href={`#${link.toLowerCase()}`} className="block text-sm text-slate-500 hover:text-white transition-colors">{link}</a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-3">Contact</h4>
              <div className="space-y-2 text-sm text-slate-500">
                <p><PhoneLink phone={data.phone} /></p>
                <p><MapLink address={data.address} /></p>
                {data.socialLinks && Object.entries(data.socialLinks).map(([platform, url]) => (
                  <a key={platform} href={url} target="_blank" rel="noopener noreferrer" className="block hover:text-white transition-colors capitalize">{platform}</a>
                ))}
              </div>
            </div>
          </div>
          <div className="border-t border-white/8 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Truck size={14} weight="fill" style={{ color: ACCENT }} />
              <span>{data.businessName} &copy; {new Date().getFullYear()}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <BluejayLogo className="w-4 h-4" />
              <span>Created by <a href="https://bluejayportfolio.com" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "underline" }}>bluejayportfolio.com</a></span>
            </div>
          </div>
        </div>
      </footer>

      <ClaimBanner businessName={data.businessName} accentColor={ACCENT} prospectId={data.id} />
      <div className="h-14 md:h-28" />
    </main>
  );
}
