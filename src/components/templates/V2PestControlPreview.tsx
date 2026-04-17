"use client";

/* eslint-disable @next/next/no-img-element -- These static marketing and preview components intentionally use plain img tags to preserve existing markup and visual behavior during lint-only cleanup. */
/* eslint-disable react-hooks/purity -- Decorative particle values are intentionally randomized for static visual effects in these marketing pages and previews; this preserves existing appearance without changing business logic. */

import { useState, useEffect, useRef, useCallback } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  AnimatePresence,
} from "framer-motion";
import {
  Bug,
  ShieldCheck,
  Clock,
  Phone,
  MapPin,
  CaretDown,
  List,
  X,
  Warning,
  House,
  Buildings,
  CheckCircle,
  ArrowRight,
  Star,
  Users,
  Skull,
  Leaf,
  Shield,
  SprayBottle,
  Play,
  NavigationArrow,
  CalendarCheck,
} from "@phosphor-icons/react";
import type { GeneratedSiteData } from "@/lib/generator";
import BluejayLogo from "../BluejayLogo";
import { MapLink, PhoneLink } from "@/components/templates/MapLink";
import ClaimBanner from "@/components/ClaimBanner";
import { pickFromPool, pickGallery } from "@/lib/stock-image-picker";

const spring = { type: "spring" as const, stiffness: 100, damping: 20 };
const springFast = { type: "spring" as const, stiffness: 200, damping: 25 };

const CHARCOAL = "#1a1a1a";
const DEFAULT_ORANGE = "#ea580c";
const ORANGE_LIGHT = "#fb923c";
const RED_WARN = "#ef4444";

function getAccent(accentColor?: string) {
  const c = accentColor || DEFAULT_ORANGE;
  return { ACCENT: c, ACCENT_GLOW: `${c}26`, ACCENT_LIGHT: ORANGE_LIGHT, RED_WARN };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SERVICE_ICON_MAP: Record<string, any> = {
  termite: Bug, ant: Bug, roach: Bug, cockroach: Bug, spider: Bug, rodent: Skull, rat: Skull, mouse: Skull,
  mosquito: Bug, wasp: Warning, bee: Warning, bed: Bug, wildlife: Skull, commercial: Buildings, residential: House,
  fumigat: SprayBottle, spray: SprayBottle,
};

function getServiceIcon(serviceName: string) {
  const lower = serviceName.toLowerCase();
  for (const [key, Icon] of Object.entries(SERVICE_ICON_MAP)) { if (lower.includes(key)) return Icon; }
  return Shield;
}

/* ── PREMIUM FEATURE DATA CONSTANTS ── */

const TRUST_BADGES = [
  { icon: ShieldCheck, label: "Licensed & Insured" },
  { icon: Leaf, label: "EPA-Approved Products" },
  { icon: Shield, label: "Pet & Child Safe" },
  { icon: CheckCircle, label: "Satisfaction Guaranteed" },
];

const PRICING_TIERS = [
  { title: "One-Time Treatment", price: "From $149", period: "one-time", features: ["Full property inspection", "Targeted treatment", "48-hour follow-up", "30-day guarantee"], featured: false },
  { title: "Quarterly Plan", price: "$99", period: "/quarter", features: ["Seasonal inspections", "Preventive treatments", "Interior & exterior", "Priority scheduling", "90-day guarantee"], featured: true },
  { title: "Annual Protection", price: "$79", period: "/month", features: ["Year-round coverage", "Monthly monitoring", "Unlimited callbacks", "Termite protection", "Full guarantee"], featured: false },
];

const COMMON_PESTS = [
  { name: "Ants", icon: Bug, desc: "Carpenter ants, fire ants, and common household ants eliminated at the colony." },
  { name: "Rodents", icon: Skull, desc: "Mice and rats trapped, removed, and entry points sealed permanently." },
  { name: "Spiders", icon: Bug, desc: "Brown recluse, black widows, and common spiders cleared from your property." },
  { name: "Wasps & Bees", icon: Warning, desc: "Nests safely removed from eaves, attics, and outdoor structures." },
  { name: "Bed Bugs", icon: Bug, desc: "Heat treatment and chemical solutions for complete bed bug elimination." },
  { name: "Cockroaches", icon: Bug, desc: "German, American, and Oriental roaches eliminated with bait and barrier methods." },
  { name: "Termites", icon: Bug, desc: "Subterranean and drywood termite treatment with long-term barrier protection." },
  { name: "Wildlife", icon: Skull, desc: "Humane removal of raccoons, squirrels, opossums, and other nuisance wildlife." },
];

const ECO_FEATURES = [
  { icon: Leaf, title: "Green Products", desc: "We use botanically-derived and low-toxicity formulations that are effective against pests." },
  { icon: NavigationArrow, title: "Targeted Application", desc: "Precise application to affected areas minimizes product usage and environmental impact." },
  { icon: House, title: "No Harsh Chemicals Indoors", desc: "Our indoor treatments use gel baits, traps, and low-odor products safe for enclosed spaces." },
  { icon: Shield, title: "Safe for Kids & Pets", desc: "All products are applied in child- and pet-safe concentrations with proper drying times." },
];

const PEST_QUIZ_OPTIONS = [
  { label: "Ants / Spiders", urgency: "Common", color: "#22c55e", desc: "Easy fix — one treatment usually does it." },
  { label: "Rodents", urgency: "Act Fast", color: "#f59e0b", desc: "They multiply quickly. Don't wait." },
  { label: "Bed Bugs", urgency: "Call Now", color: "#ef4444", desc: "Immediate professional treatment needed." },
  { label: "Not Sure", urgency: "Free Inspection", color: "#3b82f6", desc: "We'll identify it and create a plan." },
];

const STOCK_HERO_POOL = ["https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=1400&q=80","https://images.unsplash.com/photo-1632571401005-458e9d244591?w=1400&q=80"];
const STOCK_ABOUT_POOL = ["https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=800&q=80","https://images.unsplash.com/photo-1604014237800-1c9102c219da?w=800&q=80"];
const STOCK_PROJECTS = [
  "https://images.unsplash.com/photo-1583947581924-860bda6a26df?w=600&q=80",
  "https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=600&q=80",
  "https://images.unsplash.com/photo-1590856029826-c7a73142bbf1?w=800&q=80",
  "https://images.unsplash.com/photo-1621619856624-42fd193a0661?w=800&q=80",
];

function FloatingBugs({ accent }: { accent: string }) {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i, x: Math.random() * 100, delay: Math.random() * 8, duration: 5 + Math.random() * 7,
    size: 2 + Math.random() * 3, opacity: 0.15 + Math.random() * 0.35, isRed: Math.random() > 0.65,
  }));
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden hidden md:block">
      {particles.map((p) => (
        <motion.div key={p.id} className="absolute rounded-full"
          style={{ left: `${p.x}%`, width: p.size, height: p.size, background: p.isRed ? RED_WARN : accent, willChange: "transform, opacity" }}
          animate={{ y: ["-10vh", "110vh"], opacity: [0, p.opacity, p.opacity, 0] }}
          transition={{ y: { duration: p.duration, repeat: Infinity, delay: p.delay, ease: "linear" }, opacity: { duration: p.duration, repeat: Infinity, delay: p.delay, times: [0, 0.1, 0.9, 1] } }}
        />
      ))}
    </div>
  );
}

function ShieldPattern({ opacity = 0.03, accent }: { opacity?: number; accent: string }) {
  const patternId = `shieldPestV2-${accent.replace("#", "")}`;
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }}>
      <defs>
        <pattern id={patternId} width="90" height="90" patternUnits="userSpaceOnUse">
          <path d="M45 10 L60 25 L60 50 L45 65 L30 50 L30 25 Z" fill="none" stroke={accent} strokeWidth="0.5" />
          <circle cx="15" cy="75" r="2" fill={accent} opacity="0.3" />
          <circle cx="75" cy="15" r="1.5" fill={accent} opacity="0.25" />
          <path d="M10 10 L15 5 L20 10 L15 15 Z" fill={accent} opacity="0.15" />
          <path d="M70 70 L75 65 L80 70 L75 75 Z" fill={RED_WARN} opacity="0.1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  );
}

function BugBackground({ opacity = 0.03, accent }: { opacity?: number; accent: string }) {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }} viewBox="0 0 1000 600" preserveAspectRatio="none">
      <circle cx="200" cy="150" r="4" fill={accent} /><circle cx="800" cy="100" r="3" fill={RED_WARN} />
      <circle cx="500" cy="450" r="5" fill={accent} /><circle cx="150" cy="500" r="3" fill={accent} />
      <path d="M300 300 Q320 280 340 300 Q320 320 300 300 Z" fill={accent} opacity="0.5" />
      <path d="M700 200 Q720 180 740 200 Q720 220 700 200 Z" fill={RED_WARN} opacity="0.4" />
    </svg>
  );
}

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] ${className}`}>{children}</div>;
}

function MagneticButton({ children, className = "", onClick, style, href }: { children: React.ReactNode; className?: string; onClick?: () => void; style?: React.CSSProperties; href?: string }) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0); const y = useMotionValue(0);
  const springX = useSpring(x, springFast); const springY = useSpring(y, springFast);
  const isTouchDevice = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current || isTouchDevice) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - (rect.left + rect.width / 2)) * 0.25); y.set((e.clientY - (rect.top + rect.height / 2)) * 0.25);
  }, [x, y, isTouchDevice]);
  const handleMouseLeave = useCallback(() => { x.set(0); y.set(0); }, [x, y]);
  if (href) return <motion.a href={href} ref={ref as unknown as React.Ref<HTMLAnchorElement>} style={{ x: springX, y: springY, willChange: "transform", ...style }} onMouseMove={handleMouseMove as unknown as React.MouseEventHandler<HTMLAnchorElement>} onMouseLeave={handleMouseLeave} className={className} whileTap={{ scale: 0.97 }}>{children}</motion.a>;
  return <motion.button ref={ref} style={{ x: springX, y: springY, willChange: "transform", ...style }} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} onClick={onClick} className={className} whileTap={{ scale: 0.97 }}>{children}</motion.button>;
}

function ShimmerBorder({ children, className = "", accent }: { children: React.ReactNode; className?: string; accent: string }) {
  return (
    <div className={`relative rounded-2xl p-[1px] overflow-hidden ${className}`}>
      <motion.div className="absolute inset-0 rounded-2xl" style={{ background: `conic-gradient(from 0deg, transparent, ${accent}, transparent, ${RED_WARN}, transparent)`, willChange: "transform" }} animate={{ rotate: [0, 360] }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} />
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


/* ───────────────────────── ANIMATED SECTION ───────────────────────── */
function AnimatedSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 1, x: -50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: "easeOut" as const }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function V2PestControlPreview({ data }: { data: GeneratedSiteData }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const { ACCENT, ACCENT_GLOW } = getAccent(data.accentColor);

  const uniquePhotos = data.photos ? [...new Set(data.photos)] : [];


  const heroImage = uniquePhotos[0] || pickFromPool(STOCK_HERO_POOL, data.businessName);


  const heroCardImage = uniquePhotos[1] || pickFromPool(STOCK_ABOUT_POOL, data.businessName, 1);


  const aboutImage = uniquePhotos[2] || pickFromPool(STOCK_ABOUT_POOL, data.businessName, 2);
  const projectImages = data.photos?.length > 2 ? data.photos.slice(2, 6) : pickGallery(STOCK_PROJECTS, data.businessName);

  const processSteps = [
    { step: "01", title: "Free Inspection", desc: "Our licensed technicians inspect your property to identify the pest problem and entry points.", icon: ShieldCheck },
    { step: "02", title: "Custom Plan", desc: "We create a targeted treatment plan specific to your infestation type and property layout.", icon: CalendarCheck },
    { step: "03", title: "Treatment Day", desc: "Our team applies safe, effective treatments using the latest pest control technology.", icon: SprayBottle },
    { step: "04", title: "Follow-Up Guarantee", desc: "We seal entry points and schedule follow-up visits to ensure pests stay gone — guaranteed.", icon: CheckCircle },
  ];

  const faqs = [
    { q: `What pests does ${data.businessName} handle?`, a: `We handle a wide range of pests including ${data.services.slice(0, 3).map(s => s.name).join(", ")}, and more. No job is too big or small.` },
    { q: "Are your treatments safe for kids and pets?", a: `Absolutely. ${data.businessName} uses EPA-approved products that are safe for families and pets while remaining lethal to pests. We also offer green treatment options.` },
    { q: "How fast can you respond?", a: "We offer same-day and next-day service for most pest emergencies. Our emergency team is available 24/7 for urgent infestations." },
    { q: "Do you offer a guarantee?", a: "Yes! All our treatments come with a satisfaction guarantee. If pests return between scheduled visits, we re-treat at no additional cost." },
    { q: "How often should I have pest control service?", a: "We recommend quarterly treatments for year-round protection. Monthly service is available for severe infestations or high-risk areas." },
    { q: "Do I need to leave during treatment?", a: "For most treatments, you can stay home. For fumigation or heavy treatments, we will advise if temporary relocation is needed. We always prioritize your safety." },
    { q: "What is Integrated Pest Management?", a: "IPM combines prevention, monitoring, and targeted treatment to minimize chemical use while maximizing pest control effectiveness. It is our primary approach." },
    { q: "Do you treat commercial properties?", a: `Yes! ${data.businessName} provides commercial pest control for restaurants, offices, warehouses, and retail spaces. We offer discreet service and flexible scheduling.` },
  ];

  /* Fallback testimonials */
  const fallbackTestimonials = [
    { name: "Roger B.", text: "Ant problem gone after one treatment. They were thorough and explained everything they did.", rating: 5 },
    { name: "Cindy L.", text: "Monthly service keeps our home completely pest-free. Worth every penny for peace of mind.", rating: 5 },
    { name: "Wayne S.", text: "Had a serious termite issue and they handled it expertly. Saved our home from major damage.", rating: 5 }
  ];
  const testimonials = data.testimonials?.length > 0 ? data.testimonials : fallbackTestimonials;

  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden" style={{ fontFamily: "Inter, system-ui, sans-serif", background: CHARCOAL, color: "#f1f5f9" }}>
      <FloatingBugs accent={ACCENT} />

      {/* 1. NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-4">
          <GlassCard className="flex items-center justify-between px-4 md:px-6 py-3">
            <div className="flex items-center gap-2"><Shield size={24} weight="fill" style={{ color: ACCENT }} /><span className="text-lg font-bold tracking-tight text-white">{data.businessName}</span></div>
            <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
              <a href="#services" className="hover:text-white transition-colors">Services</a><a href="#about" className="hover:text-white transition-colors">About</a>
              <a href="#results" className="hover:text-white transition-colors">Results</a><a href="#contact" className="hover:text-white transition-colors">Contact</a>
            </div>
            <div className="flex items-center gap-3">
              <MagneticButton className="px-4 md:px-5 py-2 rounded-full text-sm font-semibold text-white transition-colors cursor-pointer" style={{ background: ACCENT } as React.CSSProperties}>Free Inspection</MagneticButton>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors">{mobileMenuOpen ? <X size={24} /> : <List size={24} />}</button>
            </div>
          </GlassCard>
          <AnimatePresence>{mobileMenuOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3, ease: "easeInOut" }} className="md:hidden mt-2 overflow-hidden">
              <GlassCard className="flex flex-col gap-1 px-4 py-4">
                {[{ label: "Services", href: "#services" }, { label: "About", href: "#about" }, { label: "Results", href: "#results" }, { label: "Contact", href: "#contact" }].map((link) => (
                  <a key={link.label} href={link.href} onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors">{link.label}</a>
                ))}
              </GlassCard>
            </motion.div>
          )}</AnimatePresence>
        </div>
      </nav>

      {/* 2. HERO */}
      <section className="relative min-h-[100dvh] flex items-center pt-24 z-10 overflow-hidden">

        <div className="absolute inset-0">
          <img src={heroImage} alt={`${data.businessName}`} className="w-full h-full object-cover object-center" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          <div className="space-y-8">
            <div>
              <p className="text-sm uppercase tracking-widest mb-4" style={{ color: ACCENT }}>Licensed Pest Control Experts</p>
              <h1 className="text-3xl md:text-6xl tracking-tighter leading-none font-bold text-white" style={{ textShadow: "0 2px 20px rgba(0,0,0,0.8), 0 4px 40px rgba(0,0,0,0.5)" }}>{data.tagline}</h1>
            </div>
            <p className="text-lg text-slate-400 max-w-md leading-relaxed">{(() => { const t = data.about; if (t.length <= 180) return t; const dot = t.indexOf('.', 80); return dot > 0 && dot < 220 ? t.slice(0, dot + 1) : t.slice(0, 180).trim() + '...'; })()}</p>
            <div className="flex flex-wrap gap-4">
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white flex items-center gap-2 cursor-pointer" style={{ background: ACCENT } as React.CSSProperties}>Free Inspection <ArrowRight size={18} weight="bold" /></MagneticButton>
              <MagneticButton href={`tel:${data.phone.replace(/\D/g, "")}`} className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/10 flex items-center gap-2 cursor-pointer"><Phone size={18} weight="duotone" /><PhoneLink phone={data.phone} /></MagneticButton>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-slate-400">
              <span className="flex items-center gap-2"><MapPin size={16} weight="duotone" style={{ color: ACCENT }} /><MapLink address={data.address} /></span>
              <span className="flex items-center gap-2"><Warning size={16} weight="duotone" style={{ color: ACCENT }} />Same-Day Emergency Service</span>
            </div>
          </div>
          <div className="hidden md:block relative">
            <div className="relative rounded-2xl overflow-hidden border border-white/10">
              <img src={heroCardImage} alt={`${data.businessName} pest control`} className="w-full h-[500px] object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-transparent to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#1a1a1a]/40 to-transparent" />
              <div className="absolute bottom-6 left-6 flex items-center gap-3">
                <div className="px-4 py-2 rounded-full backdrop-blur-md bg-black/50 border flex items-center gap-2" style={{ borderColor: `${ACCENT}4d` }}>
                  <ShieldCheck size={18} weight="fill" style={{ color: ACCENT }} /><span className="text-sm font-semibold text-white">Licensed &amp; Insured</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. STATS */}
      <section className="relative z-10 py-16 overflow-hidden border-y" style={{ borderColor: `${ACCENT}1a` }}>
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1208 0%, #1a1a1a 100%)" }} />
        <ShieldPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {data.stats.map((stat, i) => { const icons = [Shield, Bug, Clock, Star]; const Icon = icons[i % icons.length]; return (
              <div key={stat.label} className="text-center"><div className="flex items-center justify-center gap-2 mb-2"><Icon size={22} weight="fill" style={{ color: ACCENT }} /><span className="text-3xl md:text-4xl font-extrabold text-white">{stat.value}</span></div><span className="text-slate-500 text-sm font-medium tracking-wide uppercase">{stat.label}</span></div>
            ); })}
          </div>
        </div>
      </section>

      {/* 4. SERVICES */}
      <section id="services" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #1a1208 50%, #1a1a1a 100%)" }} />
        <ShieldPattern accent={ACCENT} /><BugBackground opacity={0.025} accent={ACCENT} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[10%] right-[5%] w-[500px] h-[500px] rounded-full blur-[160px]" style={{ background: `${ACCENT}08` }} /></div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Our Services" title="Complete Pest Elimination" subtitle={`From termites to rodents, ${data.businessName} eliminates every pest threat with proven, safe methods.`} accent={ACCENT} />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.services.map((service, i) => { const Icon = getServiceIcon(service.name); return (
              <div key={service.name} className="group relative p-7 rounded-2xl border border-white/[0.06] hover:border-opacity-30 transition-all duration-500 overflow-hidden bg-white/[0.02]">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: `radial-gradient(circle at 50% 0%, ${ACCENT}15, transparent 70%)` }} />
                <div className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `linear-gradient(to right, transparent, ${ACCENT}4d, transparent)` }} />
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center border" style={{ background: ACCENT_GLOW, borderColor: `${ACCENT}33` }}><Icon size={24} weight="duotone" style={{ color: ACCENT }} /></div>
                    <span className="text-xs font-mono text-slate-600">{String(i + 1).padStart(2, "0")}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{service.name}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{service.description || ""}</p>
                  {service.price && <p className="text-sm font-semibold mt-3" style={{ color: ACCENT }}>{service.price}</p>}
                </div>
              </div>
            ); })}
          </div>
        </div>
      </section>

      {/* 4b. LICENSED & SAFE BADGES */}
      <section className="relative z-10 py-16 overflow-hidden border-y" style={{ borderColor: `${ACCENT}1a` }}>
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #1a1208 50%, #1a1a1a 100%)" }} />
        <ShieldPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {TRUST_BADGES.map((badge) => (
              <GlassCard key={badge.label} className="p-4 md:p-5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: ACCENT_GLOW, border: `1px solid ${ACCENT}33` }}>
                  <badge.icon size={20} weight="fill" style={{ color: ACCENT }} />
                </div>
                <span className="text-sm font-semibold text-white leading-tight">{badge.label}</span>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* 4c. PRICING */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #150e04 50%, #1a1a1a 100%)" }} />
        <BugBackground opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Pricing" title="Transparent Pest Control Pricing" subtitle="No hidden fees. Choose the plan that fits your needs." accent={ACCENT} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PRICING_TIERS.map((tier) => (
              <div key={tier.title} className={`relative rounded-2xl overflow-hidden ${tier.featured ? "" : ""}`}>
                {tier.featured ? (
                  <ShimmerBorder accent={ACCENT}>
                    <div className="p-7 md:p-8">
                      <div className="inline-block text-xs font-bold uppercase tracking-widest mb-3 px-3 py-1 rounded-full" style={{ background: `${ACCENT}22`, color: ACCENT }}>Most Popular</div>
                      <h3 className="text-xl font-bold text-white mb-1">{tier.title}</h3>
                      <div className="flex items-baseline gap-1 mb-6"><span className="text-4xl font-black text-white">{tier.price}</span><span className="text-slate-400 text-sm">{tier.period}</span></div>
                      <ul className="space-y-3 mb-8">{tier.features.map((f) => <li key={f} className="flex items-center gap-2 text-sm text-slate-300"><CheckCircle size={16} weight="fill" style={{ color: ACCENT }} />{f}</li>)}</ul>
                      <MagneticButton className="w-full py-3.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 cursor-pointer" style={{ background: ACCENT } as React.CSSProperties}>Get Started <ArrowRight size={16} weight="bold" /></MagneticButton>
                    </div>
                  </ShimmerBorder>
                ) : (
                  <GlassCard className="p-7 md:p-8 h-full flex flex-col">
                    <h3 className="text-xl font-bold text-white mb-1">{tier.title}</h3>
                    <div className="flex items-baseline gap-1 mb-6"><span className="text-4xl font-black text-white">{tier.price}</span><span className="text-slate-400 text-sm">{tier.period}</span></div>
                    <ul className="space-y-3 mb-8 flex-1">{tier.features.map((f) => <li key={f} className="flex items-center gap-2 text-sm text-slate-300"><CheckCircle size={16} weight="fill" style={{ color: `${ACCENT}80` }} />{f}</li>)}</ul>
                    <MagneticButton className="w-full py-3.5 rounded-xl text-sm font-semibold text-white border border-white/10 flex items-center justify-center gap-2 cursor-pointer">Learn More <ArrowRight size={16} weight="bold" /></MagneticButton>
                  </GlassCard>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. ABOUT */}
      <section id="about" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #150e04 50%, #1a1a1a 100%)" }} />
        <BugBackground opacity={0.02} accent={ACCENT} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[20%] left-[10%] w-[500px] h-[500px] rounded-full blur-[180px]" style={{ background: `${ACCENT}06` }} /></div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="relative">
              <div className="rounded-2xl overflow-hidden border border-white/10"><img src={aboutImage} alt={`${data.businessName} team`} className="w-full h-[400px] object-cover" /></div>
              <div className="absolute -bottom-4 -right-4 md:bottom-6 md:-right-6"><div className="px-5 py-3 rounded-xl backdrop-blur-md border text-white font-bold text-sm shadow-lg" style={{ background: `${ACCENT}e6`, borderColor: `${ACCENT}80` }}>{data.stats[0] ? `${data.stats[0].value} ${data.stats[0].label}` : "Pest-Free Guarantee"}</div></div>
            </div>
            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: ACCENT, borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}>Why Choose Us</span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6 text-white">Your Shield Against Pests</h2>
              <p className="text-slate-400 leading-relaxed mb-8">{data.about}</p>
              <div className="grid grid-cols-2 gap-4">
                {[{ icon: ShieldCheck, label: "Licensed & Certified" }, { icon: Leaf, label: "Eco-Safe Products" }, { icon: Star, label: "5-Star Rated" }, { icon: CheckCircle, label: "Satisfaction Guaranteed" }].map((badge) => (
                  <GlassCard key={badge.label} className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: ACCENT_GLOW }}><badge.icon size={20} weight="duotone" style={{ color: ACCENT }} /></div>
                    <span className="text-sm font-semibold text-white">{badge.label}</span>
                  </GlassCard>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5b. ECO-FRIENDLY */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0d1a0f 50%, #1a1a1a 100%)" }} />
        <ShieldPattern opacity={0.02} accent={ACCENT} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[30%] right-[15%] w-[400px] h-[400px] rounded-full blur-[160px]" style={{ background: "#22c55e08" }} /></div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Eco-Friendly" title="Safe for Your Family & Pets" subtitle="Modern pest control doesn't mean harsh chemicals. We use targeted, eco-conscious solutions that protect what matters most." accent={ACCENT} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ECO_FEATURES.map((feature) => (
              <GlassCard key={feature.title} className="p-6 md:p-7 flex items-start gap-5">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#22c55e15", border: "1px solid #22c55e33" }}>
                  <feature.icon size={24} weight="duotone" style={{ color: "#22c55e" }} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">{feature.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{feature.desc}</p>
                </div>
              </GlassCard>
            ))}
          </div>
          <div className="mt-8 text-center">
            <GlassCard className="inline-flex items-center gap-3 px-6 py-3">
              <Leaf size={20} weight="fill" style={{ color: "#22c55e" }} />
              <span className="text-sm font-semibold text-white">All products are EPA-registered and applied by certified technicians</span>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* 6. PROCESS */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #1a1208 50%, #1a1a1a 100%)" }} />
        <ShieldPattern opacity={0.025} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <AnimatedSection>          <SectionHeader badge="Our Process" title="How We Eliminate Pests" accent={ACCENT} /></AnimatedSection>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {processSteps.map((step, i) => (
              <div key={step.step} className="relative">
                {i < processSteps.length - 1 && <div className="hidden lg:block absolute top-10 left-[calc(50%+40px)] w-[calc(100%-80px)] h-px" style={{ background: `linear-gradient(to right, ${ACCENT}33, ${ACCENT}11)` }} />}
                <GlassCard className="p-6 text-center relative">
                  <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${ACCENT}22, ${ACCENT}0a)`, border: `1px solid ${ACCENT}33` }}>
                    <step.icon size={28} weight="duotone" style={{ color: ACCENT }} />
                  </div>
                  <span className="text-xs font-mono text-slate-600 block mb-2">Step {step.step}</span>
                  <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3><p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
                </GlassCard>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. RESULTS GALLERY */}
      <section id="results" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #150e04 50%, #1a1a1a 100%)" }} />
        <BugBackground opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <AnimatedSection>          <SectionHeader badge="Our Results" title="Pest-Free Properties" accent={ACCENT} /></AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projectImages.map((src, i) => { const titles = ["Termite Treatment", "Rodent Exclusion", "Bed Bug Elimination", "Commercial Fumigation"]; const descs = ["Complete termite barrier installation.", "Full rodent exclusion and sealing.", "Heat treatment bed bug elimination.", "Commercial-grade fumigation service."]; return (
              <div key={i} className="group relative rounded-2xl overflow-hidden border border-white/[0.06] hover:border-opacity-30 transition-all duration-500">
                <img src={src} alt={titles[i]} className="w-full h-64 object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6"><h3 className="text-lg font-bold text-white mb-1">{titles[i]}</h3><p className="text-sm text-slate-300">{descs[i]}</p></div>
              </div>
            ); })}
          </div>
        </div>
      </section>

      {/* 7b. VIDEO PLACEHOLDER */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #1a1208 50%, #1a1a1a 100%)" }} />
        <ShieldPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <SectionHeader badge="See Our Work" title="Watch Our Process" subtitle="See how we protect homes and businesses from pest infestations." accent={ACCENT} />
          <div className="relative rounded-2xl overflow-hidden border border-white/10 group cursor-pointer">
            <img src={projectImages[0] || heroImage} alt="Our pest control process" className="w-full h-[300px] md:h-[450px] object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-black/50 group-hover:bg-black/40 transition-colors duration-300" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              <div className="w-20 h-20 rounded-full flex items-center justify-center border-2 transition-transform duration-300 group-hover:scale-110" style={{ background: `${ACCENT}cc`, borderColor: `${ACCENT}` }}>
                <Play size={36} weight="fill" className="text-white ml-1" />
              </div>
              <p className="text-white font-semibold text-lg">See Our Process in Action</p>
            </div>
          </div>
        </div>
      </section>

      {/* 7c. COMPETITOR COMPARISON TABLE */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #150e04 50%, #1a1a1a 100%)" }} />
        <BugBackground opacity={0.02} accent={ACCENT} />
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Why Us" title={`${data.businessName} vs Average Exterminators`} accent={ACCENT} />
          <GlassCard className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left px-5 py-4 text-slate-400 font-medium">Feature</th>
                    <th className="text-center px-5 py-4 font-bold text-white">{data.businessName}</th>
                    <th className="text-center px-5 py-4 text-slate-400 font-medium">Others</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { feature: "Free Inspection", us: true, them: "Sometimes" },
                    { feature: "Same-Day Service", us: true, them: "No" },
                    { feature: "Eco-Friendly Options", us: true, them: "Rarely" },
                    { feature: "Satisfaction Guarantee", us: true, them: "Limited" },
                    { feature: "Weekend Hours", us: true, them: "No" },
                    { feature: "Transparent Pricing", us: true, them: "Sometimes" },
                    { feature: "Follow-Up Visits Included", us: true, them: "Extra Cost" },
                  ].map((row, i) => (
                    <tr key={row.feature} className={i % 2 === 0 ? "bg-white/[0.02]" : ""}>
                      <td className="px-5 py-3.5 text-slate-300 font-medium">{row.feature}</td>
                      <td className="px-5 py-3.5 text-center"><CheckCircle size={20} weight="fill" style={{ color: "#22c55e" }} className="inline-block" /></td>
                      <td className="px-5 py-3.5 text-center text-slate-500">{row.them}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* 8. TESTIMONIALS */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #1a1208 50%, #1a1a1a 100%)" }} />
        <ShieldPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <AnimatedSection>          <SectionHeader badge="Testimonials" title="What Our Clients Say" accent={ACCENT} /></AnimatedSection>
          {/* Google Reviews Header */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
            <div className="flex gap-0.5">{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={22} weight="fill" style={{ color: ACCENT }} />)}</div>
            <span className="text-white font-bold text-lg">{data.googleRating || "4.9"} out of 5</span>
            <span className="text-slate-400 text-sm">based on {data.reviewCount || "100+"} Google reviews</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <GlassCard key={i} className="p-6 h-full flex flex-col">
                <div className="flex gap-0.5 mb-4">{Array.from({ length: t.rating || 5 }).map((_, j) => <Star key={j} size={16} weight="fill" style={{ color: ACCENT }} />)}</div>
                <p className="text-slate-300 leading-relaxed flex-1 text-sm mb-4">&ldquo;{t.text}&rdquo;</p>
                <div className="pt-4 border-t border-white/5"><span className="text-sm font-semibold text-white">{t.name}</span></div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* 9. EMERGENCY CTA */}
      <section className="relative z-10 py-20 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT}cc, ${ACCENT})` }} />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='40' height='40' fill='none'/%3E%3Cpath d='M0 0L40 40M40 0L0 40' stroke='%23000' stroke-width='0.5'/%3E%3C/svg%3E\")" }} />
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <Warning size={48} weight="fill" className="mx-auto mb-6 text-white/70" />
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-4">Pest Emergency? Call Now!</h2>
          <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">Don&apos;t let pests take over your home. Our emergency response team is available 24/7 to handle urgent infestations fast.</p>
          <PhoneLink phone={data.phone} className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-black text-white font-bold text-lg hover:bg-black/80 transition-colors">
            <span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" /><span className="relative inline-flex rounded-full h-3 w-3 bg-red-600" /></span>{data.phone}
          </PhoneLink>
        </div>
      </section>

      {/* 10. COMMON PESTS WE TREAT (Enhanced) */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #150e04 50%, #1a1a1a 100%)" }} />
        <ShieldPattern opacity={0.02} accent={ACCENT} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute bottom-[10%] left-[10%] w-[500px] h-[500px] rounded-full blur-[180px]" style={{ background: `${ACCENT}06` }} /></div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Pests We Treat" title="Complete Pest Coverage" subtitle="From common household nuisances to serious infestations, we eliminate them all." accent={ACCENT} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {COMMON_PESTS.map((pest) => (
              <div key={pest.name} className="group relative p-6 rounded-2xl border border-white/[0.06] hover:border-opacity-30 transition-all duration-500 overflow-hidden bg-white/[0.02]">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: `radial-gradient(circle at 50% 0%, ${ACCENT}15, transparent 70%)` }} />
                <div className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `linear-gradient(to right, transparent, ${ACCENT}4d, transparent)` }} />
                <div className="relative z-10">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ background: ACCENT_GLOW, border: `1px solid ${ACCENT}33` }}>
                    <pest.icon size={22} weight="duotone" style={{ color: ACCENT }} />
                  </div>
                  <h3 className="text-base font-bold text-white mb-1.5">{pest.name}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{pest.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 11. SERVICE AREAS (Enhanced) */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #1a1208 50%, #1a1a1a 100%)" }} />
        <ShieldPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <AnimatedSection><SectionHeader badge="Coverage Area" title="Areas We Serve" accent={ACCENT} /></AnimatedSection>
          <div className="text-center mb-8"><GlassCard className="p-8 inline-block"><div className="flex items-center gap-3 text-lg"><MapPin size={24} weight="duotone" style={{ color: ACCENT }} /><MapLink address={data.address} className="text-white font-semibold" /></div><p className="text-slate-400 text-sm mt-2">&amp; Surrounding Areas</p></GlassCard></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto">
            {["Downtown", "Midtown", "Westside", "Eastside", "North End", "South End", "Suburbs", "Metro Area"].map((area) => (
              <div key={area} className="flex items-center gap-2 px-4 py-3 rounded-xl border border-white/5 bg-white/[0.03]">
                <CheckCircle size={14} weight="fill" style={{ color: ACCENT }} />
                <span className="text-sm text-slate-300">{area}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-4 mt-8">
            <div className="relative">
              <div className="w-2.5 h-2.5 rounded-full animate-ping absolute" style={{ background: "#22c55e" }} />
              <div className="w-2.5 h-2.5 rounded-full relative" style={{ background: "#22c55e" }} />
            </div>
            <span className="text-sm text-slate-400">Same-day service available in all coverage areas</span>
          </div>
        </div>
      </section>

      {/* 11b. CERTIFICATIONS ROW */}
      <section className="relative z-10 py-16 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #1a1208 100%)" }} />
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <div className="flex flex-wrap justify-center gap-4">
            {["EPA Registered", "State Licensed", "Pet & Child Safe", "BBB A+ Rated", "QualityPro Certified", "NPMA Member"].map((cert) => (
              <span key={cert} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium border" style={{ color: ACCENT, borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}>
                <ShieldCheck size={16} weight="fill" />{cert}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 12. HOURS */}
      {data.hours && (
        <section className="relative z-10 py-24 md:py-32 overflow-hidden">
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #150e04 50%, #1a1a1a 100%)" }} />
          <BugBackground opacity={0.02} accent={ACCENT} />
          <div className="max-w-3xl mx-auto px-6 relative z-10">
            <AnimatedSection>          <SectionHeader badge="Business Hours" title="When We're Available" accent={ACCENT} /></AnimatedSection>
            <div className="text-center"><ShimmerBorder accent={ACCENT}><div className="p-8"><Clock size={32} weight="duotone" style={{ color: ACCENT }} className="mx-auto mb-4" /><p className="text-slate-300 leading-relaxed whitespace-pre-line text-lg">{data.hours}</p><p className="text-sm mt-4 font-semibold" style={{ color: ACCENT }}>Emergency Service: 24/7/365</p></div></ShimmerBorder></div>
          </div>
        </section>
      )}

      {/* 12b. PEST IDENTIFICATION GUIDE */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #1a1208 50%, #1a1a1a 100%)" }} />
        <ShieldPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Identify" title="Common Pest Guide" subtitle="Recognize the signs of an infestation early. Here are the most common pests we treat." accent={ACCENT} />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { pest: "Ants", signs: "Trails along walls, small dirt mounds, food debris accumulation", danger: "Low", season: "Spring/Summer" },
              { pest: "Termites", signs: "Hollow wood, mud tubes, discarded wings, sagging floors", danger: "High", season: "Year-Round" },
              { pest: "Rodents", signs: "Droppings, gnaw marks, nesting materials, scratching sounds at night", danger: "High", season: "Fall/Winter" },
              { pest: "Cockroaches", signs: "Musty odor, droppings, egg casings, nighttime sightings", danger: "Medium", season: "Year-Round" },
              { pest: "Bed Bugs", signs: "Bite marks in rows, blood spots on sheets, tiny dark spots", danger: "Medium", season: "Year-Round" },
              { pest: "Spiders", signs: "Webs in corners, egg sacs, increased sightings", danger: "Low", season: "Fall" },
              { pest: "Wasps", signs: "Paper nests under eaves, aggressive behavior near food", danger: "Medium", season: "Summer" },
              { pest: "Mosquitoes", signs: "Standing water, itchy bites, buzzing at dusk", danger: "Medium", season: "Summer" },
            ].map((item) => (
              <GlassCard key={item.pest} className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-base font-bold text-white">{item.pest}</h4>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${item.danger === "High" ? "bg-red-500/20 text-red-400" : item.danger === "Medium" ? "bg-amber-500/20 text-amber-400" : "bg-green-500/20 text-green-400"}`}>
                    {item.danger} Risk
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-2">Peak: {item.season}</p>
                <p className="text-sm text-slate-400 leading-relaxed">{item.signs}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* 12c. SEASONAL PEST CALENDAR */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #14120a 50%, #1a1a1a 100%)" }} />
        <BugBackground opacity={0.02} accent={ACCENT} />
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Seasonal" title="Year-Round Protection Plan" subtitle="Different seasons bring different pests. We stay ahead of them all." accent={ACCENT} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { season: "Spring", color: "#22c55e", pests: ["Ants awaken", "Termite swarms", "Wasp nest building", "Spider emergence"] },
              { season: "Summer", color: "#f59e0b", pests: ["Mosquito peak", "Flea & tick season", "Wasp aggression", "Fly infestations"] },
              { season: "Fall", color: "#f97316", pests: ["Rodent entry", "Spider migration", "Stink bugs seek shelter", "Ladybug clusters"] },
              { season: "Winter", color: "#3b82f6", pests: ["Mice in walls", "Cockroach hiding", "Bed bug dormancy", "Overwintering pests"] },
            ].map((s) => (
              <GlassCard key={s.season} className="p-5">
                <h4 className="text-lg font-bold text-white mb-3" style={{ borderBottom: `2px solid ${s.color}`, paddingBottom: "8px" }}>{s.season}</h4>
                <ul className="space-y-2">
                  {s.pests.map((pest) => (
                    <li key={pest} className="flex items-start gap-2 text-sm text-slate-400">
                      <CheckCircle size={14} weight="fill" className="mt-0.5 shrink-0" style={{ color: s.color }} />
                      <span>{pest}</span>
                    </li>
                  ))}
                </ul>
              </GlassCard>
            ))}
          </div>
          <p className="text-center text-sm text-slate-500 mt-8">Our quarterly treatment plans adapt to seasonal pest patterns, keeping your home protected year-round.</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 max-w-3xl mx-auto">
            {[
              { label: "Quarterly Plans", value: "From $99/quarter" },
              { label: "One-Time Treatments", value: "From $149" },
              { label: "Monthly Service", value: "From $79/month" },
              { label: "Emergency Calls", value: "Same-day response" },
            ].map((item) => (
              <GlassCard key={item.label} className="p-3 text-center">
                <p className="text-xs text-slate-500">{item.label}</p>
                <p className="text-sm font-bold" style={{ color: ACCENT }}>{item.value}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* 12d. ECO-FRIENDLY METHODS EXPANDED */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #1a1208 50%, #1a1a1a 100%)" }} />
        <ShieldPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Green" title="Eco-Friendly Methods" subtitle="Effective pest control that is safe for your family, pets, and the environment." accent={ACCENT} />
          <GlassCard className="p-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold text-white mb-4">Our Approach</h3>
                <ul className="space-y-3">
                  {[
                    "EPA-registered products only",
                    "Targeted application minimizes chemical use",
                    "Integrated Pest Management (IPM) strategies",
                    "Baiting systems over broad spraying",
                    "Pet and child safe formulations",
                    "Exclusion and prevention first",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-slate-400">
                      <CheckCircle size={16} weight="fill" className="mt-0.5 shrink-0" style={{ color: "#22c55e" }} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-4">Prevention Tips</h3>
                <ul className="space-y-3">
                  {[
                    "Seal cracks and gaps around doors and windows",
                    "Keep food stored in airtight containers",
                    "Eliminate standing water sources",
                    "Keep landscaping trimmed away from the house",
                    "Store firewood at least 20 feet from home",
                    "Fix leaky pipes and faucets promptly",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-slate-400">
                      <ShieldCheck size={16} weight="duotone" className="mt-0.5 shrink-0" style={{ color: ACCENT }} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* 12e. MID-PAGE CTA */}
      <section className="relative z-10 py-16 overflow-hidden">
        <div className="absolute inset-0" style={{ background: ACCENT }} />
        <div className="absolute inset-0 bg-black/30" />
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">Take Back Your Home</h2>
          <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
            Free inspection and same-day treatment available.
            We guarantee results or we come back for free.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <PhoneLink phone={data.phone} className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-sm font-bold" style={{ color: ACCENT }}>
              <Phone size={18} weight="fill" /> Free Inspection
            </PhoneLink>
            <a href="#contact" className="inline-flex items-center gap-2 px-8 py-4 rounded-full border-2 border-white text-white text-sm font-bold hover:bg-white/10 transition-colors">
              Get a Quote <ArrowRight size={18} weight="bold" />
            </a>
          </div>
        </div>
      </section>

      {/* 13. FAQ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #1a1208 50%, #1a1a1a 100%)" }} />
        <BugBackground opacity={0.02} accent={ACCENT} />
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <AnimatedSection>          <SectionHeader badge="FAQ" title="Common Questions" accent={ACCENT} /></AnimatedSection>
          <div className="space-y-3">{faqs.map((faq, i) => <AccordionItem key={i} question={faq.q} answer={faq.a} isOpen={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} />)}</div>
        </div>
      </section>

      {/* 13b. PEST QUIZ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #1a1208 50%, #1a1a1a 100%)" }} />
        <ShieldPattern opacity={0.025} accent={ACCENT} />
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Quick Assessment" title="What Pest Are You Dealing With?" subtitle="Select below and we'll recommend the best course of action." accent={ACCENT} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {PEST_QUIZ_OPTIONS.map((option) => (
              <GlassCard key={option.label} className="p-5 md:p-6 flex items-start gap-4 cursor-pointer hover:border-white/20 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${option.color}15`, border: `1px solid ${option.color}33` }}>
                  <Bug size={22} weight="duotone" style={{ color: option.color }} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base font-bold text-white">{option.label}</h3>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ background: `${option.color}22`, color: option.color }}>{option.urgency}</span>
                  </div>
                  <p className="text-sm text-slate-400">{option.desc}</p>
                </div>
              </GlassCard>
            ))}
          </div>
          <div className="mt-8 text-center">
            <MagneticButton href={`tel:${data.phone.replace(/\D/g, "")}`} className="inline-flex items-center gap-3 px-8 py-4 rounded-full text-base font-semibold text-white cursor-pointer" style={{ background: ACCENT } as React.CSSProperties}>
              <Phone size={20} weight="fill" /> Call Now for Free Assessment
            </MagneticButton>
          </div>
        </div>
      </section>

      {/* 13c. WHY CHOOSE US */}
      <section className="relative z-10 py-20 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #1a1208 50%, #1a1a1a 100%)" }} />
        <ShieldPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Why Us" title="Why Homeowners Trust Us" accent={ACCENT} />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: ShieldCheck, title: "Licensed & Insured", desc: "Fully licensed, bonded, and insured for your protection." },
              { icon: Clock, title: "Same-Day Service", desc: "Emergency pest problems cannot wait. We respond fast." },
              { icon: Star, title: "Satisfaction Guarantee", desc: "Pests return? So do we. Free of charge. Period." },
              { icon: Users, title: "Family-Owned", desc: "We treat your home like our own. Local and accountable." },
            ].map((item) => (
              <GlassCard key={item.title} className="p-5 text-center">
                <item.icon size={28} weight="duotone" style={{ color: ACCENT }} className="mx-auto mb-3" />
                <h4 className="text-sm font-bold text-white mb-1">{item.title}</h4>
                <p className="text-xs text-slate-400">{item.desc}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* 13d. PEST-FREE GUARANTEE CTA */}
      <section className="relative z-10 py-20 md:py-24 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #150e04 50%, #1a1a1a 100%)" }} />
        <BugBackground opacity={0.02} accent={ACCENT} />
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <ShimmerBorder accent={ACCENT}>
            <div className="p-8 md:p-12 text-center">
              <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ background: `${ACCENT}22`, border: `2px solid ${ACCENT}44` }}>
                <ShieldCheck size={32} weight="fill" style={{ color: ACCENT }} />
              </div>
              <h2 className="text-2xl md:text-4xl font-black tracking-tight text-white mb-4">100% Satisfaction Guarantee</h2>
              <p className="text-lg text-slate-400 max-w-xl mx-auto mb-8">If pests come back, so do we. Free. No questions asked. That&apos;s our promise to every customer.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white flex items-center gap-2 cursor-pointer" style={{ background: ACCENT } as React.CSSProperties}>
                  Schedule Free Inspection <ArrowRight size={18} weight="bold" />
                </MagneticButton>
                <MagneticButton href={`tel:${data.phone.replace(/\D/g, "")}`} className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/10 flex items-center gap-2 cursor-pointer">
                  <Phone size={18} weight="duotone" /> <PhoneLink phone={data.phone} />
                </MagneticButton>
              </div>
            </div>
          </ShimmerBorder>
        </div>
      </section>

      {/* 14. CONTACT */}
      <section id="contact" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #150e04 50%, #1a1a1a 100%)" }} />
        <ShieldPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: ACCENT, borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}>Contact Us</span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6 text-white">Get a Free Inspection</h2>
              <p className="text-slate-400 leading-relaxed mb-8">Don&apos;t wait for pests to multiply. Contact {data.businessName} today for a free, no-obligation inspection.</p>
              <div className="space-y-5">
                <div className="flex items-start gap-4"><div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: ACCENT_GLOW }}><MapPin size={20} weight="duotone" style={{ color: ACCENT }} /></div><div><p className="text-sm font-semibold text-white">Address</p><MapLink address={data.address} className="text-sm text-slate-400" /></div></div>
                <div className="flex items-start gap-4"><div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: ACCENT_GLOW }}><Phone size={20} weight="duotone" style={{ color: ACCENT }} /></div><div><p className="text-sm font-semibold text-white">Phone</p><PhoneLink phone={data.phone} className="text-sm text-slate-400" /></div></div>
                <div className="flex items-start gap-4"><div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: ACCENT_GLOW }}><Warning size={20} weight="duotone" style={{ color: ACCENT }} /></div><div><p className="text-sm font-semibold text-white">Emergency</p><p className="text-sm text-slate-400">24/7 Emergency Pest Response</p></div></div>
                {data.hours && <div className="flex items-start gap-4"><div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: ACCENT_GLOW }}><Clock size={20} weight="duotone" style={{ color: ACCENT }} /></div><div><p className="text-sm font-semibold text-white">Hours</p><p className="text-sm text-slate-400 whitespace-pre-line">{data.hours}</p></div></div>}
              </div>
            </div>
            <GlassCard className="p-8">
              <h3 className="text-xl font-semibold text-white mb-6">Request Free Inspection</h3>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className="block text-sm text-slate-400 mb-1.5">First Name</label><input type="text" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none text-sm" placeholder="John" /></div>
                  <div><label className="block text-sm text-slate-400 mb-1.5">Last Name</label><input type="text" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none text-sm" placeholder="Doe" /></div>
                </div>
                <div><label className="block text-sm text-slate-400 mb-1.5">Phone</label><input type="tel" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none text-sm" placeholder="(555) 123-4567" /></div>
                <div><label className="block text-sm text-slate-400 mb-1.5">Pest Type</label>
                  <select className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none text-sm"><option value="" className="bg-neutral-900">Select pest type</option>{data.services.map((s) => <option key={s.name} value={s.name.toLowerCase().replace(/\s+/g, "-")} className="bg-neutral-900">{s.name}</option>)}</select>
                </div>
                <div><label className="block text-sm text-slate-400 mb-1.5">Message</label><textarea rows={4} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none text-sm resize-none" placeholder="Describe your pest problem..." /></div>
                <MagneticButton className="w-full py-4 rounded-xl text-base font-semibold text-white flex items-center justify-center gap-2 cursor-pointer" style={{ background: ACCENT } as React.CSSProperties}>Send Request <ArrowRight size={18} weight="bold" /></MagneticButton>
              </form>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* 15. FOOTER */}
      <footer className="relative z-10 border-t border-white/5 py-10 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #111 100%)" }} />
        <ShieldPattern opacity={0.015} accent={ACCENT} />
        <div className="mx-auto max-w-6xl px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div><div className="flex items-center gap-2 mb-3"><Shield size={22} weight="fill" style={{ color: ACCENT }} /><span className="text-lg font-bold text-white">{data.businessName}</span></div><p className="text-sm text-slate-500 leading-relaxed">{data.about.length > 120 ? data.about.slice(0, 120).trim() + "..." : data.about}</p></div>
            <div><h4 className="text-sm font-semibold text-white mb-3">Quick Links</h4><div className="space-y-2">{["Services", "About", "Results", "Contact"].map((link) => <a key={link} href={`#${link.toLowerCase()}`} className="block text-sm text-slate-500 hover:text-white transition-colors">{link}</a>)}</div></div>
            <div><h4 className="text-sm font-semibold text-white mb-3">Contact</h4><div className="space-y-2 text-sm text-slate-500"><p><PhoneLink phone={data.phone} /></p><p><MapLink address={data.address} /></p>{data.socialLinks && Object.entries(data.socialLinks).map(([platform, url]) => <a key={platform} href={url} target="_blank" rel="noopener noreferrer" className="block hover:text-white transition-colors capitalize">{platform}</a>)}</div></div>
          </div>
          <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-500"><Shield size={14} weight="fill" style={{ color: ACCENT }} /><span>{data.businessName} &copy; {new Date().getFullYear()}</span></div>
            <div className="flex items-center gap-2 text-xs text-slate-600"><BluejayLogo className="w-4 h-4" /><span>Created by <a href="https://bluejayportfolio.com" target="_blank" rel="noopener noreferrer" style={{textDecoration:"underline"}}>bluejayportfolio.com</a></span></div>
          </div>
        </div>
      </footer>

      <ClaimBanner businessName={data.businessName} accentColor={ACCENT} prospectId={data.id} />
      <div className="h-14 md:h-28" />
    </main>
  );
}
