"use client";

/* eslint-disable @next/next/no-img-element -- These static marketing and preview components intentionally use plain img tags to preserve existing markup and visual behavior during lint-only cleanup. */
/* eslint-disable react-hooks/purity -- Decorative particle values are intentionally randomized for static visual effects in these marketing pages and previews; this preserves existing appearance without changing business logic. */

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import {
  Tree,
  Leaf,
  Axe,
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
  Truck,
  Warning,
  HouseLine,
  Buildings,
  Wrench,
  SealCheck,
  Lightning,
  PlayCircle,
  Quotes,
  Certificate,
  Users,
} from "@phosphor-icons/react";
import type { GeneratedSiteData } from "@/lib/generator";
import BluejayLogo from "../BluejayLogo";
import { MapLink, PhoneLink } from "@/components/templates/MapLink";
import ClaimBanner from "@/components/ClaimBanner";
import { pickFromPool, pickGallery } from "@/lib/stock-image-picker";

/* â”€â”€â”€ CONSTANTS â”€â”€â”€ */
const spring = { type: "spring" as const, stiffness: 100, damping: 20 };
const springFast = { type: "spring" as const, stiffness: 200, damping: 25 };
const CHARCOAL = "#1a1a1a";
const DEFAULT_GREEN = "#15803d";
const GREEN_LIGHT = "#22c55e";
const BARK_ACCENT = "#854d0e";

function getAccent(accentColor?: string) {
  const c = accentColor || DEFAULT_GREEN;
  return { ACCENT: c, ACCENT_GLOW: `${c}26`, ACCENT_LIGHT: GREEN_LIGHT, BARK: BARK_ACCENT };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SERVICE_ICON_MAP: Record<string, any> = {
  trim: Axe, prune: Axe, remov: Axe, cut: Axe, stump: Axe, grind: Axe,
  emergency: Warning, storm: Warning, tree: Tree, plant: Tree,
  land: Leaf, clear: Leaf, mulch: Leaf, shrub: Leaf, hedge: Leaf,
  residential: HouseLine, commercial: Buildings, haul: Truck,
};
function getServiceIcon(serviceName: string) {
  const lower = serviceName.toLowerCase();
  for (const [key, Icon] of Object.entries(SERVICE_ICON_MAP)) { if (lower.includes(key)) return Icon; }
  return Tree;
}

const STOCK_HERO_POOL = [
  "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=1400&q=80",
  "https://images.unsplash.com/photo-1448375240586-882707db888b?w=1400&q=80",
];
const STOCK_ABOUT_POOL = [
  "https://images.unsplash.com/photo-1567337710282-00832b415979?w=600&q=80",
  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=80",
];
const STOCK_GALLERY = [
  "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&q=80",
  "https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=600&q=80",
  "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=600&q=80",
  "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&q=80",
  "https://images.unsplash.com/photo-1425913397330-cf8af2ff40a1?w=600&q=80",
  "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=600&q=80",
  "https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5?w=600&q=80",
  "https://images.unsplash.com/photo-1476231682828-37e571bc172f?w=600&q=80",
];

/* â”€â”€â”€ SERVICE TYPES â”€â”€â”€ */
const TREE_SERVICE_TYPES = [
  { name: "Tree Trimming", icon: Axe, desc: "Shaping and health cuts to promote strong growth." },
  { name: "Tree Removal", icon: Tree, desc: "Safe removal of hazardous or unwanted trees." },
  { name: "Stump Grinding", icon: Wrench, desc: "Below-grade stump removal for a clean yard." },
  { name: "Emergency Storm Damage", icon: Warning, desc: "24/7 response for fallen or damaged trees." },
  { name: "Tree Health Assessment", icon: Leaf, desc: "Certified arborist evaluation for disease and pest issues." },
  { name: "Land Clearing", icon: Buildings, desc: "Lot clearing for construction or landscaping projects." },
];

/* â”€â”€â”€ COMPARISON TABLE â”€â”€â”€ */
const COMPARISON_ROWS = [
  { feature: "Certified Arborist on Staff", us: true, them: "Rarely" },
  { feature: "Fully Licensed & Insured", us: true, them: "Varies" },
  { feature: "24/7 Storm Response", us: true, them: "No" },
  { feature: "Free On-Site Estimates", us: true, them: "Sometimes" },
  { feature: "Stump Grinding Included", us: true, them: "Extra Charge" },
  { feature: "Debris Cleanup & Hauling", us: true, them: "Extra Charge" },
  { feature: "Property Protection Guarantee", us: true, them: "No" },
];

/* â”€â”€â”€ PARTICLES â”€â”€â”€ */
function FloatingParticles({ accent }: { accent: string }) {
  const particles = Array.from({ length: 18 }, (_, i) => ({
    id: i, x: Math.random() * 100, delay: Math.random() * 8,
    duration: 6 + Math.random() * 7, size: 2 + Math.random() * 3,
    opacity: 0.12 + Math.random() * 0.25, isBark: Math.random() > 0.6,
  }));
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden hidden md:block">
      {particles.map((p) => (
        <motion.div key={p.id} className="absolute rounded-full" style={{ left: `${p.x}%`, width: p.size, height: p.size, background: p.isBark ? BARK_ACCENT : accent, willChange: "transform, opacity" }}
          animate={{ y: ["-10vh", "110vh"], opacity: [0, p.opacity, p.opacity, 0] }}
          transition={{ y: { duration: p.duration, repeat: Infinity, delay: p.delay, ease: "linear" }, opacity: { duration: p.duration, repeat: Infinity, delay: p.delay, times: [0, 0.1, 0.9, 1] } }} />
      ))}
    </div>
  );
}

function LeafPattern({ opacity = 0.03, accent }: { opacity?: number; accent: string }) {
  const patternId = `leafV2TS-${accent.replace("#", "")}`;
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }}>
      <defs>
        <pattern id={patternId} width="100" height="100" patternUnits="userSpaceOnUse">
          <path d="M30 70 Q50 30 70 70 Q50 60 30 70Z" fill={accent} opacity="0.2" />
          <path d="M50 30 L50 70" fill="none" stroke={accent} strokeWidth="0.5" />
          <path d="M10 20 Q20 10 30 20 Q20 18 10 20Z" fill={accent} opacity="0.15" />
          <circle cx="80" cy="40" r="2" fill={accent} opacity="0.2" />
          <circle cx="20" cy="80" r="1.5" fill={accent} opacity="0.15" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  );
}

function TreeBranchBackground({ opacity = 0.03, accent }: { opacity?: number; accent: string }) {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }} viewBox="0 0 1000 600" preserveAspectRatio="none">
      <path d="M500 600 L500 300 Q480 250 420 200 Q400 180 380 140" fill="none" stroke={BARK_ACCENT} strokeWidth="3" />
      <path d="M500 300 Q520 250 580 200 Q600 180 620 140" fill="none" stroke={BARK_ACCENT} strokeWidth="2.5" />
      <path d="M500 400 Q460 380 420 360" fill="none" stroke={BARK_ACCENT} strokeWidth="2" />
      <path d="M500 400 Q540 380 580 360" fill="none" stroke={BARK_ACCENT} strokeWidth="2" />
      <circle cx="380" cy="130" r="30" fill={accent} opacity="0.15" />
      <circle cx="620" cy="130" r="25" fill={accent} opacity="0.12" />
      <circle cx="420" cy="350" r="20" fill={accent} opacity="0.1" />
      <circle cx="580" cy="350" r="18" fill={accent} opacity="0.1" />
    </svg>
  );
}

/* â”€â”€â”€ SHARED UI â”€â”€â”€ */
function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-white/15 bg-white/[0.08] backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] ${className}`}>{children}</div>;
}

function MagneticButton({ children, className = "", onClick, style, href }: { children: React.ReactNode; className?: string; onClick?: () => void; style?: React.CSSProperties; href?: string }) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0); const y = useMotionValue(0);
  const springX = useSpring(x, springFast); const springY = useSpring(y, springFast);
  const isTD = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
  const mm = useCallback((e: React.MouseEvent) => { if (!ref.current || isTD) return; const r = ref.current.getBoundingClientRect(); x.set((e.clientX - (r.left + r.width / 2)) * 0.25); y.set((e.clientY - (r.top + r.height / 2)) * 0.25); }, [x, y, isTD]);
  const ml = useCallback(() => { x.set(0); y.set(0); }, [x, y]);
  if (href) return <motion.a href={href} ref={ref as unknown as React.Ref<HTMLAnchorElement>} style={{ x: springX, y: springY, willChange: "transform", ...style }} onMouseMove={mm as unknown as React.MouseEventHandler<HTMLAnchorElement>} onMouseLeave={ml} className={className} whileTap={{ scale: 0.97 }}>{children}</motion.a>;
  return <motion.button ref={ref} style={{ x: springX, y: springY, willChange: "transform", ...style }} onMouseMove={mm} onMouseLeave={ml} onClick={onClick} className={className} whileTap={{ scale: 0.97 }}>{children}</motion.button>;
}

function ShimmerBorder({ children, className = "", accent }: { children: React.ReactNode; className?: string; accent: string }) {
  return <div className={`relative rounded-2xl p-[1px] overflow-hidden ${className}`}><motion.div className="absolute inset-0 rounded-2xl" style={{ background: `conic-gradient(from 0deg, transparent, ${accent}, transparent, ${BARK_ACCENT}, transparent)`, willChange: "transform" }} animate={{ rotate: [0, 360] }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} /><div className="relative rounded-2xl bg-[#141414] z-10">{children}</div></div>;
}

function AccordionItem({ question, answer, isOpen, onToggle }: { question: string; answer: string; isOpen: boolean; onToggle: () => void }) {
  return (
    <GlassCard className="overflow-hidden">
      <button onClick={onToggle} className="w-full flex items-center justify-between p-5 md:p-6 text-left group cursor-pointer">
        <span className="text-lg font-semibold text-white pr-4">{question}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={spring}><CaretDown size={20} className="text-slate-400 shrink-0" /></motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={spring} className="overflow-hidden"><p className="px-5 pb-5 md:px-6 md:pb-6 text-slate-400 leading-relaxed">{answer}</p></motion.div>}
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

function AnimatedSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <motion.div initial={{ opacity: 1, scale: 0.92 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.5, ease: "easeOut" as const }} className={className}>{children}</motion.div>;
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   MAIN COMPONENT
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
export default function V2TreeServicePreview({ data }: { data: GeneratedSiteData }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [quizAnswer, setQuizAnswer] = useState<string | null>(null);
  const { ACCENT, ACCENT_GLOW } = getAccent(data.accentColor);
  const uniquePhotos = data.photos ? [...new Set(data.photos)] : [];
  const heroImage = uniquePhotos[0] || pickFromPool(STOCK_HERO_POOL, data.businessName);
  const heroCardImage = uniquePhotos[1] || pickFromPool(STOCK_ABOUT_POOL, data.businessName, 1);
  const aboutImage = uniquePhotos[2] || pickFromPool(STOCK_ABOUT_POOL, data.businessName, 2);
  const usedUrls = new Set([heroImage, heroCardImage, aboutImage].filter(Boolean));
  const galleryFromReal = uniquePhotos.slice(3).filter((u) => !usedUrls.has(u));
  const galleryImages =
    galleryFromReal.length >= 4
      ? galleryFromReal.slice(0, 4)
      : [
          ...galleryFromReal,
          ...pickGallery(STOCK_GALLERY, data.businessName).filter(
            (u) => !usedUrls.has(u) && !galleryFromReal.includes(u)
          ),
        ].slice(0, 4);
  const phoneDigits = data.phone.replace(/\D/g, "");

  const processSteps = [
    { step: "01", title: "Free Estimate", desc: "We inspect your trees on-site and provide a clear, written quote." },
    { step: "02", title: "Plan the Work", desc: "Our arborist plans the safest approach for your property." },
    { step: "03", title: "Expert Execution", desc: "Certified crew handles the job with professional equipment." },
    { step: "04", title: "Clean Finish", desc: "Full debris cleanup and haul-away â€” your property left pristine." },
  ];

  const faqs = [
    { q: `Does ${data.businessName} have certified arborists?`, a: `Yes! ${data.businessName} employs ISA Certified Arborists who evaluate every job for the safest, healthiest approach.` },
    { q: "Do you offer emergency storm damage service?", a: "Absolutely. We provide 24/7 emergency response for fallen trees, hanging limbs, and storm damage. Call any time." },
    { q: "Is stump grinding included?", a: "We offer stump grinding as part of our tree removal packages. Ask about bundled pricing for removal + grinding." },
    { q: "Are you fully insured?", a: `Yes. ${data.businessName} carries full liability insurance and workers' compensation. We can provide certificates on request.` },
    { q: "How do I know if a tree needs to be removed?", a: "Signs include significant lean, large dead branches, hollow trunk, root damage, or proximity to structures. Our arborist can assess for free." },
  ];

  const fallbackTestimonials = [
    { name: "Mike R.", text: "They removed a massive oak that was threatening our house. Fast, professional, and left the yard cleaner than they found it.", rating: 5 },
    { name: "Sandra L.", text: "The arborist saved our maple tree that another company wanted to remove. Trimming and treatment worked perfectly.", rating: 5 },
    { name: "James W.", text: "Storm took down three trees. They were out the next morning and had everything cleared by lunch. Incredible.", rating: 5 },
  ];
  const testimonials = data.testimonials?.length > 0 ? data.testimonials : fallbackTestimonials;

  const pricingTiers = [
    { name: "Tree Trimming", price: "$250", desc: "Standard tree trimming, up to 30 ft" },
    { name: "Tree Removal", price: "$800", desc: "Full removal with cleanup, up to 50 ft" },
    { name: "Stump Grinding", price: "$150", desc: "Below-grade grinding per stump" },
  ];

  const quizOptions = [
    { label: "Dead or dangerous tree", color: "#ef4444", urgency: "Urgent", rec: "Hazardous trees should be addressed immediately. Call for same-day assessment." },
    { label: "Overgrown or needs shaping", color: "#f59e0b", urgency: "Seasonal", rec: "Regular trimming keeps trees healthy and your property safe." },
    { label: "Storm damage cleanup", color: "#ef4444", urgency: "Emergency", rec: "We provide 24/7 storm response. Call now for immediate help." },
  ];

  const treeHealthSigns = [
    { sign: "Dead or Dying Branches", desc: "Large dead limbs can fall unexpectedly" },
    { sign: "Leaning Trunk", desc: "Sudden lean indicates root failure risk" },
    { sign: "Fungal Growth", desc: "Mushrooms at the base signal internal decay" },
    { sign: "Bark Splitting", desc: "Cracks may indicate disease or structural weakness" },
    { sign: "Root Damage", desc: "Construction or soil changes can destabilize trees" },
    { sign: "Canopy Thinning", desc: "Sparse leaves may indicate pest infestation" },
  ];

  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden" style={{ fontFamily: "Barlow, system-ui, sans-serif", background: CHARCOAL, color: "#f1f5f9" }}>
      <FloatingParticles accent={ACCENT} />

      {/* â”€â”€â”€ NAV â”€â”€â”€ */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-4">
          <GlassCard className="flex items-center justify-between px-4 md:px-6 py-3">
            <div className="flex items-center gap-2"><Tree size={24} weight="fill" style={{ color: ACCENT }} /><span className="text-lg font-bold tracking-tight text-white">{data.businessName}</span></div>
            <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
              <a href="#services" className="hover:text-white transition-colors">Services</a>
              <a href="#about" className="hover:text-white transition-colors">About</a>
              <a href="#health" className="hover:text-white transition-colors">Tree Health</a>
              <a href="#contact" className="hover:text-white transition-colors">Contact</a>
            </div>
            <div className="flex items-center gap-3">
              <MagneticButton className="px-4 md:px-5 py-2 rounded-full text-sm font-semibold text-white transition-colors cursor-pointer" style={{ background: ACCENT } as React.CSSProperties}>Free Estimate</MagneticButton>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors">{mobileMenuOpen ? <X size={24} /> : <List size={24} />}</button>
            </div>
          </GlassCard>
          <AnimatePresence>{mobileMenuOpen && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="md:hidden mt-2 overflow-hidden"><GlassCard className="flex flex-col gap-1 px-4 py-4">{["Services", "About", "Tree Health", "Contact"].map((l) => <a key={l} href={`#${l.toLowerCase().replace(" ", "-")}`} onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors">{l}</a>)}</GlassCard></motion.div>}</AnimatePresence>
        </div>
      </nav>

      {/* â”€â”€â”€ HERO â”€â”€â”€ */}
      <section className="relative min-h-[100dvh] flex items-center pt-24 z-10 overflow-hidden">
        <div className="absolute inset-0"><img src={heroImage} alt={data.businessName} className="w-full h-full object-cover object-center" /><div className="absolute inset-0 bg-black/70" /></div>
        <LeafPattern opacity={0.04} accent={ACCENT} />
        <TreeBranchBackground opacity={0.04} accent={ACCENT} />
        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          <div className="space-y-8">
            <div><p className="text-sm uppercase tracking-widest mb-4" style={{ color: GREEN_LIGHT }}>Certified Tree Care Professionals</p><h1 className="text-3xl md:text-6xl tracking-tighter leading-none font-bold text-white" style={{ textShadow: "0 2px 20px rgba(0,0,0,0.8), 0 4px 40px rgba(0,0,0,0.5)" }}>{data.tagline}</h1></div>
            <p className="text-lg text-white/80 max-w-md leading-relaxed" style={{ textShadow: "0 1px 8px rgba(0,0,0,0.6)" }}>{(() => { const t = data.about; if (t.length <= 180) return t; const dot = t.indexOf(".", 80); return dot > 0 && dot < 220 ? t.slice(0, dot + 1) : t.slice(0, 180).trim() + "..."; })()}</p>
            <div className="flex flex-wrap gap-3">
              {["ISA Certified", `${data.googleRating || "5.0"}-Star Rated`, "Free Estimates"].map((badge) => (
                <span key={badge} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border backdrop-blur-md" style={{ color: ACCENT, borderColor: `${ACCENT}4d`, background: "rgba(0,0,0,0.4)" }}><CheckCircle size={14} weight="fill" /> {badge}</span>
              ))}
            </div>
            <div className="flex flex-wrap gap-4">
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white flex items-center gap-2 cursor-pointer" style={{ background: ACCENT } as React.CSSProperties}>Get Free Estimate <ArrowRight size={18} weight="bold" /></MagneticButton>
              <MagneticButton href={`tel:${phoneDigits}`} className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/15 flex items-center gap-2 cursor-pointer"><Phone size={18} weight="duotone" /> <PhoneLink phone={data.phone} /></MagneticButton>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-slate-400">
              <span className="flex items-center gap-2"><MapPin size={16} weight="duotone" style={{ color: ACCENT }} /><MapLink address={data.address} /></span>
              <span className="flex items-center gap-2"><Clock size={16} weight="duotone" style={{ color: ACCENT }} />{data.hours || "Mon-Sat 7AM-6PM"}</span>
            </div>
            {/* Emergency badge */}
            <div className="inline-flex items-center gap-3 px-5 py-3 rounded-xl border" style={{ borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}>
              <motion.div className="w-3 h-3 rounded-full" style={{ background: "#ef4444" }} animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
              <div><p className="text-sm font-bold text-white">24/7 Emergency Storm Response</p><p className="text-xs text-slate-400">Same-day service for hazardous trees</p></div>
            </div>
          </div>
          <div className="hidden md:block relative">
            <div className="relative rounded-2xl overflow-hidden border border-white/15"><img src={heroCardImage} alt={data.businessName} className="w-full h-[500px] object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6"><div className="px-4 py-2 rounded-full backdrop-blur-md bg-black/50 border flex items-center gap-2" style={{ borderColor: `${ACCENT}4d` }}><Certificate size={18} weight="fill" style={{ color: GREEN_LIGHT }} /><span className="text-sm font-semibold text-white">ISA Certified Arborist</span></div></div>
            </div>
          </div>
        </div>
      </section>

      {/* â”€â”€â”€ STATS â”€â”€â”€ */}
      <section className="relative z-10 py-16 overflow-hidden border-y" style={{ borderColor: `${ACCENT}1a` }}>
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #0a1a0a 0%, #1a1a1a 100%)" }} />
        <LeafPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10"><div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {data.stats.map((stat, i) => { const icons = [Tree, CheckCircle, Star, ShieldCheck]; const Icon = icons[i % icons.length]; return <div key={stat.label} className="text-center"><div className="flex items-center justify-center gap-2 mb-2"><Icon size={22} weight="fill" style={{ color: ACCENT }} /><span className="text-3xl md:text-4xl font-extrabold text-white">{stat.value}</span></div><span className="text-slate-500 text-sm font-medium tracking-wide uppercase">{stat.label}</span></div>; })}
        </div></div>
      </section>

      {/* â”€â”€â”€ SERVICES â”€â”€â”€ */}
      <section id="services" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0a1a0a 50%, #1a1a1a 100%)" }} />
        <LeafPattern accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Our Services" title="Professional Tree Care" subtitle={`${data.businessName} provides expert tree services for residential and commercial properties.`} accent={ACCENT} />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.services.map((svc, i) => { const Icon = getServiceIcon(svc.name); return (
              <div key={svc.name} className="group relative p-7 rounded-2xl border border-white/[0.10] hover:border-opacity-30 transition-all duration-500 overflow-hidden bg-white/[0.07]">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: `radial-gradient(circle at 50% 0%, ${ACCENT}15, transparent 70%)` }} />
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-5"><div className="w-12 h-12 rounded-xl flex items-center justify-center border" style={{ background: ACCENT_GLOW, borderColor: `${ACCENT}33` }}><Icon size={24} weight="duotone" style={{ color: ACCENT }} /></div><span className="text-xs font-mono text-slate-600">{String(i + 1).padStart(2, "0")}</span></div>
                  <h3 className="text-lg font-bold text-white mb-2">{svc.name}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{svc.description || ""}</p>
                  {svc.price && <p className="text-sm font-semibold mt-3" style={{ color: ACCENT }}>{svc.price}</p>}
                </div>
              </div>
            ); })}
          </div>
        </div>
      </section>

      {/* â”€â”€â”€ SERVICE TYPES â”€â”€â”€ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0d1a0d 50%, #1a1a1a 100%)" }} />
        <TreeBranchBackground opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <AnimatedSection><SectionHeader badge="What We Do" title="Complete Tree Care Solutions" accent={ACCENT} /></AnimatedSection>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {TREE_SERVICE_TYPES.map((st) => (
              <GlassCard key={st.name} className="p-6 text-center">
                <div className="w-14 h-14 rounded-xl mx-auto mb-4 flex items-center justify-center" style={{ background: ACCENT_GLOW, border: `1px solid ${ACCENT}33` }}><st.icon size={28} weight="duotone" style={{ color: ACCENT }} /></div>
                <h3 className="text-base font-bold text-white mb-1">{st.name}</h3>
                <p className="text-xs text-slate-400">{st.desc}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* â”€â”€â”€ ABOUT â”€â”€â”€ */}
      <section id="about" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0a1a0a 50%, #1a1a1a 100%)" }} />
        <div className="max-w-6xl mx-auto px-6 relative z-10"><div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="relative"><div className="rounded-2xl overflow-hidden border border-white/15"><img src={aboutImage} alt={`${data.businessName} team`} className="w-full h-[400px] object-cover" /></div><div className="absolute -bottom-4 -right-4 md:bottom-6 md:-right-6"><div className="px-5 py-3 rounded-xl backdrop-blur-md border text-white font-bold text-sm shadow-lg" style={{ background: `${ACCENT}e6`, borderColor: `${ACCENT}80` }}>{data.stats[0] ? `${data.stats[0].value} ${data.stats[0].label}` : "Expert Care"}</div></div></div>
          <div>
            <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: ACCENT, borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}>About Us</span>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6 text-white">Your Trees, Our Expertise</h2>
            <p className="text-slate-400 leading-relaxed mb-8">{data.about}</p>
            <div className="grid grid-cols-2 gap-4">
              {[{ icon: Certificate, label: "ISA Certified" }, { icon: ShieldCheck, label: "Fully Insured" }, { icon: Star, label: "5-Star Rated" }, { icon: Warning, label: "24/7 Emergency" }].map((b) => (
                <GlassCard key={b.label} className="p-4 flex items-center gap-3"><div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: ACCENT_GLOW }}><b.icon size={20} weight="duotone" style={{ color: ACCENT }} /></div><span className="text-sm font-semibold text-white">{b.label}</span></GlassCard>
              ))}
            </div>
          </div>
        </div></div>
      </section>

      {/* â”€â”€â”€ TREE HEALTH ASSESSMENT â”€â”€â”€ */}
      <section id="health" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0d1a0d 50%, #1a1a1a 100%)" }} />
        <LeafPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <AnimatedSection><SectionHeader badge="Tree Health" title="Signs Your Tree Needs Attention" subtitle="Our certified arborist can assess these warning signs for free." accent={ACCENT} /></AnimatedSection>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {treeHealthSigns.map((item) => (
              <GlassCard key={item.sign} className="p-5 flex items-start gap-3">
                <Warning size={20} weight="fill" style={{ color: "#f59e0b" }} className="shrink-0 mt-0.5" />
                <div><h4 className="text-sm font-bold text-white mb-1">{item.sign}</h4><p className="text-xs text-slate-400">{item.desc}</p></div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* â”€â”€â”€ PROCESS â”€â”€â”€ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0a1a0a 50%, #1a1a1a 100%)" }} />
        <TreeBranchBackground opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <AnimatedSection><SectionHeader badge="Our Process" title="How We Work" accent={ACCENT} /></AnimatedSection>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {processSteps.map((step, i) => (
              <div key={step.step} className="relative">
                {i < processSteps.length - 1 && <div className="hidden lg:block absolute top-10 left-[calc(50%+40px)] w-[calc(100%-80px)] h-px" style={{ background: `linear-gradient(to right, ${ACCENT}33, ${ACCENT}11)` }} />}
                <GlassCard className="p-6 text-center relative"><div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-black" style={{ background: `linear-gradient(135deg, ${ACCENT}22, ${ACCENT}0a)`, color: ACCENT, border: `1px solid ${ACCENT}33` }}>{step.step}</div><h3 className="text-lg font-bold text-white mb-2">{step.title}</h3><p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p></GlassCard>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* â”€â”€â”€ PRICING â”€â”€â”€ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0d1a0d 50%, #1a1a1a 100%)" }} />
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <AnimatedSection><SectionHeader badge="Pricing" title="Transparent Pricing" subtitle="Free estimates for every job. No hidden fees." accent={ACCENT} /></AnimatedSection>
          <div className="grid md:grid-cols-3 gap-6">
            {pricingTiers.map((tier, i) => (
              <GlassCard key={tier.name} className={`p-8 text-center ${i === 1 ? "ring-2 ring-offset-2 ring-offset-[#1a1a1a]" : ""}`}>
                {i === 1 && <span className="inline-block text-xs font-bold uppercase tracking-wider mb-4 px-3 py-1 rounded-full text-white" style={{ background: ACCENT }}>Most Common</span>}
                <h3 className="text-lg font-bold text-white mb-2">{tier.name}</h3>
                <p className="text-4xl font-black mb-2" style={{ color: ACCENT }}>{tier.price}<span className="text-sm text-slate-400">+</span></p>
                <p className="text-sm text-slate-400 mb-6">{tier.desc}</p>
                <MagneticButton className="w-full py-3 rounded-full text-sm font-semibold text-white cursor-pointer" style={{ background: i === 1 ? ACCENT : `${ACCENT}33` } as React.CSSProperties}>Get Quote</MagneticButton>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* â”€â”€â”€ GALLERY â”€â”€â”€ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0a1a0a 50%, #1a1a1a 100%)" }} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <AnimatedSection><SectionHeader badge="Our Work" title="Recent Projects" accent={ACCENT} /></AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {galleryImages.map((src, i) => { const titles = ["Large Oak Removal", "Crown Thinning", "Storm Damage Cleanup", "Stump Grinding"]; return (
              <div key={i} className="group relative rounded-2xl overflow-hidden border border-white/[0.10]"><img src={src} alt={titles[i % titles.length]} className="w-full h-64 object-cover transition-transform duration-700 group-hover:scale-105" /><div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" /><div className="absolute bottom-0 left-0 right-0 p-6"><h3 className="text-lg font-bold text-white mb-1">{titles[i % titles.length]}</h3></div></div>
            ); })}
          </div>
        </div>
      </section>

      {/* â”€â”€â”€ COMPARISON TABLE â”€â”€â”€ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0d1a0d 50%, #1a1a1a 100%)" }} />
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <AnimatedSection><SectionHeader badge="Compare" title={`${data.businessName} vs. The Competition`} accent={ACCENT} /></AnimatedSection>
          <GlassCard className="overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-white/15"><th className="text-left p-4 text-slate-400 font-medium">Feature</th><th className="text-center p-4 font-bold text-white">{data.businessName}</th><th className="text-center p-4 text-slate-400 font-medium">Others</th></tr></thead><tbody>
            {COMPARISON_ROWS.map((row, i) => (<tr key={row.feature} className={i < COMPARISON_ROWS.length - 1 ? "border-b border-white/8" : ""}><td className="p-4 text-slate-300">{row.feature}</td><td className="p-4 text-center"><CheckCircle size={20} weight="fill" style={{ color: "#22c55e" }} className="mx-auto" /></td><td className="p-4 text-center text-slate-500">{row.them}</td></tr>))}
          </tbody></table></div></GlassCard>
        </div>
      </section>

      {/* â”€â”€â”€ VIDEO PLACEHOLDER â”€â”€â”€ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0a1a0a 50%, #1a1a1a 100%)" }} />
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <AnimatedSection><SectionHeader badge="See Our Work" title="Watch Our Crew in Action" accent={ACCENT} /></AnimatedSection>
          <div className="relative rounded-2xl overflow-hidden border border-white/15 group cursor-pointer"><img src={heroImage} alt="Watch our work" className="w-full h-[400px] object-cover" /><div className="absolute inset-0 bg-black/60 flex items-center justify-center group-hover:bg-black/50 transition-colors"><div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: `${ACCENT}cc` }}><PlayCircle size={48} weight="fill" className="text-white" /></div></div></div>
        </div>
      </section>

      {/* â”€â”€â”€ QUIZ â”€â”€â”€ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0d1a0d 50%, #1a1a1a 100%)" }} />
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <AnimatedSection><SectionHeader badge="Quick Check" title="What Does Your Tree Need?" accent={ACCENT} /></AnimatedSection>
          <div className="grid gap-4">
            {quizOptions.map((opt) => (
              <button key={opt.label} onClick={() => setQuizAnswer(opt.label)} className={`w-full text-left p-5 rounded-2xl border transition-all duration-300 cursor-pointer ${quizAnswer === opt.label ? "border-white/30 bg-white/[0.06]" : "border-white/15 bg-white/[0.07] hover:bg-white/[0.07]"}`}>
                <div className="flex items-center justify-between"><span className="text-white font-semibold">{opt.label}</span><span className="text-xs font-bold px-3 py-1 rounded-full" style={{ color: opt.color, background: `${opt.color}1a`, border: `1px solid ${opt.color}33` }}>{opt.urgency}</span></div>
                {quizAnswer === opt.label && <p className="text-sm text-slate-400 mt-3">{opt.rec}</p>}
              </button>
            ))}
          </div>
          {quizAnswer && <div className="mt-8 text-center"><MagneticButton href={`tel:${phoneDigits}`} className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-base font-semibold text-white cursor-pointer" style={{ background: ACCENT } as React.CSSProperties}><Phone size={18} weight="fill" /> Call for Free Assessment</MagneticButton></div>}
        </div>
      </section>

      {/* â”€â”€â”€ GOOGLE REVIEWS + TESTIMONIALS â”€â”€â”€ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0a1a0a 50%, #1a1a1a 100%)" }} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <AnimatedSection><SectionHeader badge="Reviews" title="What Our Clients Say" accent={ACCENT} /></AnimatedSection>
          <div className="text-center mb-12"><div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border" style={{ borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}><div className="flex gap-0.5">{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={18} weight="fill" style={{ color: "#f59e0b" }} />)}</div><span className="text-white font-bold">{data.googleRating || "5.0"}</span><span className="text-slate-400 text-sm">({data.reviewCount || "50"}+ reviews)</span></div></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <GlassCard key={i} className="p-6 h-full flex flex-col">
                <Quotes size={24} weight="fill" style={{ color: `${ACCENT}33` }} className="mb-3" />
                <div className="flex gap-0.5 mb-4">{Array.from({ length: t.rating || 5 }).map((_, j) => <Star key={j} size={16} weight="fill" style={{ color: "#f59e0b" }} />)}</div>
                <p className="text-slate-300 leading-relaxed flex-1 text-sm mb-4">&ldquo;{t.text}&rdquo;</p>
                <div className="pt-4 border-t border-white/8 flex items-center gap-2"><SealCheck size={16} weight="fill" style={{ color: "#22c55e" }} /><span className="text-sm font-semibold text-white">{t.name}</span><span className="text-xs text-slate-500">Verified</span></div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* â”€â”€â”€ SERVICE AREA â”€â”€â”€ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0d1a0d 50%, #1a1a1a 100%)" }} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <AnimatedSection><SectionHeader badge="Coverage" title="Service Area" accent={ACCENT} /></AnimatedSection>
          <div className="text-center"><GlassCard className="p-8 inline-block"><div className="flex items-center gap-3 text-lg mb-3"><MapPin size={24} weight="duotone" style={{ color: ACCENT }} /><MapLink address={data.address} className="text-white font-semibold" /></div><p className="text-slate-400 text-sm mb-4">& Surrounding Areas</p><div className="flex items-center justify-center gap-2"><motion.div className="w-2.5 h-2.5 rounded-full" style={{ background: "#22c55e" }} animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }} transition={{ duration: 2, repeat: Infinity }} /><span className="text-sm font-semibold" style={{ color: "#22c55e" }}>Crews Available Now</span></div></GlassCard></div>
        </div>
      </section>

      {/* â”€â”€â”€ CTA â”€â”€â”€ */}
      <section className="relative z-10 py-20 overflow-hidden"><div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT}cc)` }} /><div className="max-w-4xl mx-auto px-6 relative z-10 text-center"><Tree size={48} weight="fill" className="mx-auto mb-6 text-white/70" /><h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-4">Protect Your Property</h2><p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">Get a free, no-obligation tree assessment from our certified arborist.</p><PhoneLink phone={data.phone} className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-white text-black font-bold text-lg hover:bg-white/90 transition-colors"><Phone size={22} weight="fill" /> Call {data.phone}</PhoneLink></div></section>

      {/* â”€â”€â”€ FAQ â”€â”€â”€ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0a1a0a 50%, #1a1a1a 100%)" }} />
        <LeafPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <AnimatedSection><SectionHeader badge="FAQ" title="Common Questions" accent={ACCENT} /></AnimatedSection>
          <div className="space-y-3">{faqs.map((f, i) => <AccordionItem key={i} question={f.q} answer={f.a} isOpen={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} />)}</div>
        </div>
      </section>

      {/* â”€â”€â”€ CONTACT â”€â”€â”€ */}
      <section id="contact" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0a1a0a 50%, #1a1a1a 100%)" }}
        />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <span
                className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border"
                style={{ color: ACCENT, borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}
              >
                Contact Us
              </span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6 text-white">
                Get Your Free Estimate
              </h2>
              <p className="text-slate-400 leading-relaxed mb-8">
                Contact {data.businessName} for a free, on-site tree assessment and estimate.
              </p>
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: ACCENT_GLOW }}
                  >
                    <MapPin size={20} weight="duotone" style={{ color: ACCENT }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Address</p>
                    <MapLink address={data.address} className="text-sm text-slate-400" />
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: ACCENT_GLOW }}
                  >
                    <Phone size={20} weight="duotone" style={{ color: ACCENT }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Phone</p>
                    <PhoneLink phone={data.phone} className="text-sm text-slate-400" />
                  </div>
                </div>
                {data.hours && (
                  <div className="flex items-start gap-4">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: ACCENT_GLOW }}
                    >
                      <Clock size={20} weight="duotone" style={{ color: ACCENT }} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">Hours</p>
                      <p className="text-sm text-slate-400 whitespace-pre-line">{data.hours}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <GlassCard className="p-8">
              <h3 className="text-xl font-semibold text-white mb-6">Request Free Estimate</h3>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-1.5">First Name</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 focus:outline-none text-sm"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1.5">Last Name</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 focus:outline-none text-sm"
                      placeholder="Doe"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">Phone</label>
                  <input
                    type="tel"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 focus:outline-none text-sm"
                    placeholder="(206) 287-2304"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">Service Needed</label>
                  <select className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white focus:outline-none text-sm">
                    <option value="" className="bg-neutral-900">Select a service</option>
                    {data.services.map((s) => (
                      <option
                        key={s.name}
                        value={s.name.toLowerCase().replace(/\s+/g, "-")}
                        className="bg-neutral-900"
                      >
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">Details</label>
                  <textarea
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 focus:outline-none text-sm resize-none"
                    placeholder="Describe the tree work needed..."
                  />
                </div>
                <MagneticButton
                  className="w-full py-4 rounded-xl text-base font-semibold text-white flex items-center justify-center gap-2 cursor-pointer"
                  style={{ background: ACCENT } as React.CSSProperties}
                >
                  Send Request <ArrowRight size={18} weight="bold" />
                </MagneticButton>
              </form>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* â”€â”€â”€ SEASONAL TREE CARE â”€â”€â”€ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0d1a0d 50%, #1a1a1a 100%)" }}
        />
        <LeafPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <AnimatedSection>
            <SectionHeader
              badge="Seasonal"
              title="Year-Round Tree Care"
              subtitle="Different seasons require different tree care approaches."
              accent={ACCENT}
            />
          </AnimatedSection>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                season: "Spring",
                task: "Post-winter assessment and pruning for healthy new growth",
                icon: Leaf,
              },
              {
                season: "Summer",
                task: "Crown thinning for light and air, pest monitoring",
                icon: Tree,
              },
              {
                season: "Fall",
                task: "Deadwood removal before winter storms arrive",
                icon: Leaf,
              },
              {
                season: "Winter",
                task: "Structural pruning while dormant, storm damage response",
                icon: Warning,
              },
            ].map((item) => (
              <GlassCard key={item.season} className="p-6 flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: ACCENT_GLOW, border: `1px solid ${ACCENT}33` }}
                >
                  <item.icon size={24} weight="duotone" style={{ color: ACCENT }} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">{item.season}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{item.task}</p>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* â”€â”€â”€ EMERGENCY STORM DETAIL â”€â”€â”€ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #1a0a0a 50%, #1a1a1a 100%)" }}
        />
        <TreeBranchBackground opacity={0.02} accent={ACCENT} />
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <AnimatedSection>
            <SectionHeader
              badge="Emergency"
              title="24/7 Storm Damage Response"
              subtitle="When storms hit, we respond fast to protect your property."
              accent={ACCENT}
            />
          </AnimatedSection>
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              {[
                {
                  title: "Immediate Response",
                  desc: "Our emergency crew is dispatched within the hour, day or night.",
                },
                {
                  title: "Hazard Assessment",
                  desc: "We evaluate hanging limbs, leaning trees, and structural risks on arrival.",
                },
                {
                  title: "Safe Removal",
                  desc: "Professional equipment and techniques to clear debris without further damage.",
                },
                {
                  title: "Insurance Assistance",
                  desc: "We document damage and work directly with your insurance company.",
                },
              ].map((item, i) => (
                <div key={item.title} className="flex items-start gap-4">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-sm font-black"
                    style={{
                      background: `linear-gradient(135deg, #ef444422, #ef44440a)`,
                      color: "#ef4444",
                      border: "1px solid #ef444433",
                    }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white mb-1">{item.title}</h4>
                    <p className="text-sm text-slate-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center">
              <GlassCard className="p-8">
                <Warning size={48} weight="fill" style={{ color: "#ef4444" }} className="mx-auto mb-4" />
                <h3 className="text-2xl font-black text-white mb-2">Storm Emergency?</h3>
                <p className="text-slate-400 mb-6">
                  Call now for immediate response. Available 24 hours a day, 7 days a week.
                </p>
                <MagneticButton
                  href={`tel:${phoneDigits}`}
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-base font-semibold text-white cursor-pointer"
                  style={{ background: "#ef4444" } as React.CSSProperties}
                >
                  <Phone size={18} weight="fill" /> Emergency Line
                </MagneticButton>
              </GlassCard>
            </div>
          </div>
        </div>
      </section>

      {/* â”€â”€â”€ WHY HIRE AN ARBORIST â”€â”€â”€ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0a1a0a 50%, #1a1a1a 100%)" }}
        />
        <LeafPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <AnimatedSection>
            <SectionHeader
              badge="Why an Arborist?"
              title="The Difference a Certified Arborist Makes"
              accent={ACCENT}
            />
          </AnimatedSection>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Disease Diagnosis",
                desc: "Identify and treat tree diseases before they spread to healthy trees.",
              },
              {
                title: "Proper Pruning",
                desc: "Incorrect cuts can kill a tree. We follow ISA best practices.",
              },
              {
                title: "Risk Assessment",
                desc: "Evaluate hazard trees that could fall on your home or power lines.",
              },
              {
                title: "Preservation",
                desc: "Save trees that untrained crews would unnecessarily remove.",
              },
            ].map((item) => (
              <GlassCard key={item.title} className="p-6">
                <div
                  className="w-12 h-12 rounded-xl mb-4 flex items-center justify-center"
                  style={{
                    background: `${GREEN_LIGHT}1a`,
                    border: `1px solid ${GREEN_LIGHT}33`,
                  }}
                >
                  <Certificate size={24} weight="duotone" style={{ color: GREEN_LIGHT }} />
                </div>
                <h3 className="text-base font-bold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* â”€â”€â”€ CERTIFICATIONS â”€â”€â”€ */}
      <section className="relative z-10 py-16 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0d1a0d 50%, #1a1a1a 100%)" }} />
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <div className="flex flex-wrap justify-center gap-4">
            {["ISA Certified", "Fully Insured", "BBB Accredited", "Workers Comp", "24/7 Emergency", "Free Estimates"].map((cert) => (
              <span key={cert} className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border" style={{ color: ACCENT, borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}><SealCheck size={16} weight="fill" /> {cert}</span>
            ))}
          </div>
        </div>
      </section>

      {/* â”€â”€â”€ GUARANTEE â”€â”€â”€ */}
      <section className="relative z-10 py-16 overflow-hidden"><div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0a1a0a 100%)" }} /><div className="max-w-4xl mx-auto px-6 relative z-10 text-center"><ShimmerBorder accent={ACCENT}><div className="p-8 md:p-12"><ShieldCheck size={48} weight="fill" style={{ color: ACCENT }} className="mx-auto mb-4" /><h2 className="text-2xl md:text-4xl font-extrabold text-white mb-4">Our Property Protection Guarantee</h2><p className="text-slate-400 leading-relaxed max-w-2xl mx-auto text-lg">{data.businessName} guarantees your property is left clean and undamaged. Full liability insurance and workers comp on every job.</p><div className="flex flex-wrap justify-center gap-4 mt-8">{["Certified Arborist", "Fully Insured", "Free Estimates", "Property Protection"].map((item) => <span key={item} className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border" style={{ color: ACCENT, borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}><CheckCircle size={16} weight="fill" /> {item}</span>)}</div></div></ShimmerBorder></div></section>

      {/* â”€â”€â”€ TREE SPECIES GUIDE â”€â”€â”€ */}
      <section className="relative z-10 py-20 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #0a1a0a 0%, #1a1a1a 50%, #0a1a0a 100%)" }} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-12">
            <Leaf size={40} weight="duotone" style={{ color: ACCENT }} className="mx-auto mb-3" />
            <h2 className="text-3xl md:text-4xl font-extrabold text-white">Common Tree Species We Service</h2>
            <p className="text-slate-400 mt-3 max-w-xl mx-auto">Our certified arborists are experienced with all tree varieties in your area.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: "Oak", trait: "Large canopy, deep roots, prone to gall wasps" },
              { name: "Pine", trait: "Needle drop, pitch buildup, susceptible to bark beetles" },
              { name: "Maple", trait: "Dense shade, surface roots, fall color management" },
              { name: "Cedar", trait: "Evergreen, wind-resistant, cedar apple rust" },
              { name: "Birch", trait: "Peeling bark, shallow roots, bronze birch borer" },
              { name: "Elm", trait: "Vase-shaped, Dutch elm disease prevention" },
              { name: "Ash", trait: "Emerald ash borer monitoring, structural pruning" },
              { name: "Fir", trait: "Tall growth, needle cast treatment, crown thinning" },
            ].map((t) => (
              <div key={t.name} className="rounded-2xl border border-white/15 p-5 text-center" style={{ background: "rgba(255,255,255,0.06)" }}>
                <Tree size={24} weight="duotone" style={{ color: ACCENT }} className="mx-auto mb-2" />
                <h3 className="text-sm font-bold text-white mb-1">{t.name}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{t.trait}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* â”€â”€â”€ SEASONAL CARE â”€â”€â”€ */}
      <section className="relative z-10 py-20 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0a1a0a 100%)" }} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-12">
            <Certificate size={40} weight="duotone" style={{ color: ACCENT }} className="mx-auto mb-3" />
            <h2 className="text-3xl md:text-4xl font-extrabold text-white">Seasonal Tree Care Calendar</h2>
            <div className="w-16 h-1 mx-auto mt-3 rounded-full" style={{ background: ACCENT }} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { season: "Spring", tasks: "Inspect for winter damage, fertilize, apply pest preventatives, plant new trees" },
              { season: "Summer", tasks: "Deep watering during droughts, monitor for disease, structural pruning, mulching" },
              { season: "Autumn", tasks: "Fall cleanup, hazard assessment, crown reduction before storms, cabling weak limbs" },
              { season: "Winter", tasks: "Storm damage response, dormant pruning, remove deadwood, plan spring planting" },
            ].map((s) => (
              <div key={s.season} className="rounded-2xl border border-white/15 p-6" style={{ background: "rgba(255,255,255,0.06)" }}>
                <h3 className="text-lg font-bold text-white mb-2" style={{ color: ACCENT }}>{s.season}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{s.tasks}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* â”€â”€â”€ STORM DAMAGE CTA â”€â”€â”€ */}
      <section className="relative z-10 py-16 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${ACCENT}15 0%, #1a1a1a 50%, ${ACCENT}08 100%)` }} />
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <Warning size={44} weight="fill" style={{ color: ACCENT }} className="mx-auto mb-4" />
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">Storm Damage? We&apos;re Here Fast</h2>
          <p className="text-slate-400 max-w-2xl mx-auto mb-6 text-lg">
            When severe weather strikes, {data.businessName} provides emergency tree removal and storm cleanup. We respond quickly to fallen trees blocking roads, driveways, and structures.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {["24/7 Emergency Response", "Insurance Claims Help", "Crane Services", "Debris Hauling"].map((item) => (
              <span key={item} className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border" style={{ color: ACCENT, borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}>
                <CheckCircle size={16} weight="fill" /> {item}
              </span>
            ))}
          </div>
          <a href={`tel:${data.phone}`} className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-white font-bold text-lg transition-transform hover:scale-105" style={{ background: ACCENT }}>
            <Phone size={20} weight="fill" /> Emergency Tree Service
          </a>
        </div>
      </section>

      {/* â”€â”€â”€ WHY CHOOSE US â”€â”€â”€ */}
      <section className="relative z-10 py-20 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #0a1a0a 0%, #1a1a1a 100%)" }} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white">Why Choose <span style={{ color: ACCENT }}>{data.businessName}</span></h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[
              {
                title: "Certified Arborists",
                desc: "ISA-certified arborists who understand tree biology, health, and proper pruning techniques",
              },
              {
                title: "Full Insurance",
                desc: "Comprehensive liability and workers compensation coverage on every single job",
              },
              {
                title: "Clean Removal",
                desc: "We leave your property cleaner than we found it â€” all debris hauled and stumps ground",
              },
              {
                title: "Free Estimates",
                desc: "Detailed written estimates with no obligation. We explain every recommendation.",
              },
            ].map((card) => (
              <div key={card.title} className="rounded-2xl border border-white/15 p-6 text-center" style={{ background: "rgba(255,255,255,0.06)" }}>
                <CheckCircle size={28} weight="fill" style={{ color: ACCENT }} className="mx-auto mb-3" />
                <h3 className="text-lg font-bold text-white mb-2">{card.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* â”€â”€â”€ CERTIFICATIONS ROW â”€â”€â”€ */}
      <section className="relative z-10 py-16 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0a1a0a 100%)" }} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-8">
            <SealCheck size={36} weight="duotone" style={{ color: ACCENT }} className="mx-auto mb-3" />
            <h2 className="text-2xl md:text-3xl font-extrabold text-white">Industry Certifications</h2>
            <p className="text-slate-400 mt-2 max-w-lg mx-auto">
              {data.businessName} maintains the highest professional standards and industry certifications.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            {[
              "ISA Certified",
              "Fully Insured",
              "BBB Accredited",
              "Licensed & Bonded",
              "TCIA Member",
              "Free Estimates",
            ].map((badge) => (
              <div
                key={badge}
                className="flex items-center gap-2 px-5 py-3 rounded-full border border-white/15"
                style={{ background: "rgba(255,255,255,0.06)" }}
              >
                <SealCheck size={18} weight="fill" style={{ color: ACCENT }} />
                <span className="text-sm font-medium text-white">{badge}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* â”€â”€â”€ FOOTER â”€â”€â”€ */}
      <footer className="relative z-10 border-t border-white/8 py-10 overflow-hidden"><div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #111 100%)" }} /><div className="mx-auto max-w-6xl px-6 relative z-10"><div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8"><div><div className="flex items-center gap-2 mb-3"><Tree size={22} weight="fill" style={{ color: ACCENT }} /><span className="text-lg font-bold text-white">{data.businessName}</span></div><p className="text-sm text-slate-500 leading-relaxed">{data.about.length > 120 ? data.about.slice(0, 120).trim() + "..." : data.about}</p></div><div><h4 className="text-sm font-semibold text-white mb-3">Quick Links</h4><div className="space-y-2">{["Services", "About", "Tree Health", "Contact"].map((l) => <a key={l} href={`#${l.toLowerCase().replace(" ", "-")}`} className="block text-sm text-slate-500 hover:text-white transition-colors">{l}</a>)}</div></div><div><h4 className="text-sm font-semibold text-white mb-3">Contact</h4><div className="space-y-2 text-sm text-slate-500"><p><PhoneLink phone={data.phone} /></p><p><MapLink address={data.address} /></p>{data.socialLinks && Object.entries(data.socialLinks).map(([p, url]) => <a key={p} href={url} target="_blank" rel="noopener noreferrer" className="block hover:text-white transition-colors capitalize">{p}</a>)}</div></div></div><div className="border-t border-white/8 pt-6 flex flex-col md:flex-row items-center justify-between gap-4"><div className="flex items-center gap-2 text-sm text-slate-500"><Tree size={14} weight="fill" style={{ color: ACCENT }} /><span>{data.businessName} &copy; {new Date().getFullYear()}</span></div><div className="flex items-center gap-2 text-xs text-slate-600"><BluejayLogo className="w-4 h-4" /><span>Built by <a href="https://bluejayportfolio.com/audit" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "underline" }}>BlueJays</a> — get your free site audit</span></div></div></div></footer>

      <ClaimBanner businessName={data.businessName} accentColor={ACCENT} prospectId={data.id} />
      <div className="h-14 md:h-28" />
    </main>
  );
}
