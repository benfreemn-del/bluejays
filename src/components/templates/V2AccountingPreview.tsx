"use client";

/* eslint-disable @next/next/no-img-element -- These static marketing and preview components intentionally use plain img tags to preserve existing markup and visual behavior during lint-only cleanup. */
/* eslint-disable react-hooks/purity -- Decorative particle values are intentionally randomized for static visual effects in these marketing pages and previews; this preserves existing appearance without changing business logic. */

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import {
  ChartLineUp, Calculator, ShieldCheck, Clock, Phone, MapPin, CaretDown, List, X,
  CurrencyDollar, FileText, Buildings, CheckCircle, ArrowRight, Star, Scales,
  ChartBar, Handshake, Medal, Play, Receipt, CalendarCheck,
} from "@phosphor-icons/react";
import type { GeneratedSiteData } from "@/lib/generator";
import BluejayLogo from "../BluejayLogo";
import { MapLink, PhoneLink } from "@/components/templates/MapLink";
import ClaimBanner from "@/components/ClaimBanner";
import { pickFromPool, pickGallery } from "@/lib/stock-image-picker";

const spring = { type: "spring" as const, stiffness: 100, damping: 20 };
const springFast = { type: "spring" as const, stiffness: 200, damping: 25 };
const CHARCOAL = "#1a1a1a";
const DEFAULT_NAVY = "#1e3a5f";
const GOLD = "#d4a853";
const GOLD_LIGHT = "#e8c46f";

function getAccent(accentColor?: string) {
  const c = accentColor || DEFAULT_NAVY;
  return { ACCENT: c, ACCENT_GLOW: `${c}26`, GOLD, GOLD_LIGHT };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SERVICE_ICON_MAP: Record<string, any> = {
  tax: FileText, bookkeep: Calculator, payroll: CurrencyDollar, audit: Scales,
  consult: Handshake, advisory: ChartLineUp, plan: ChartBar, business: Buildings,
  financial: ChartLineUp, account: Calculator, cfo: Medal,
};
function getServiceIcon(n: string) { const l = n.toLowerCase(); for (const [k, I] of Object.entries(SERVICE_ICON_MAP)) { if (l.includes(k)) return I; } return Calculator; }

const STOCK_HERO_POOL = ["https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1400&q=80"];
const STOCK_ABOUT_POOL = ["https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&q=80"];
const STOCK_PROJECTS = [
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80",
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80",
  "https://images.unsplash.com/photo-1591696205602-2f950c417cb9?w=800&q=80",
  "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80",
];

/* ───────────────────────── PREMIUM FEATURE DATA ───────────────────────── */

const SERVICE_TYPE_BADGES = [
  { label: "Tax Preparation", icon: FileText },
  { label: "Bookkeeping", icon: Calculator },
  { label: "Payroll", icon: CurrencyDollar },
  { label: "Business Advisory", icon: ChartLineUp },
  { label: "IRS Resolution", icon: ShieldCheck },
  { label: "Financial Planning", icon: ChartBar },
];

const TAX_SAVINGS_CARDS = [
  { title: "Individual Returns", price: "from $199", desc: "Personal tax preparation with maximum deduction discovery", icon: FileText },
  { title: "Business Returns", price: "from $499", desc: "Comprehensive business tax filing with strategic planning", icon: Buildings },
  { title: "Full-Service Bookkeeping", price: "from $299/mo", desc: "Year-round books management so you stay organized and compliant", icon: Calculator },
];

const TAX_PROCESS_STEPS = [
  { step: "01", title: "Free Consultation", desc: "Tell us about your financial situation and goals. No obligation, no pressure.", icon: Phone },
  { step: "02", title: "Document Collection", desc: "We provide a simple checklist and secure portal to upload your documents.", icon: Receipt },
  { step: "03", title: "Expert Preparation", desc: "Your dedicated CPA reviews every line for accuracy and maximum deductions.", icon: Calculator },
  { step: "04", title: "Maximum Refund", desc: "We file your return and ensure you keep every dollar you deserve.", icon: CurrencyDollar },
];

const CPA_PILLARS = [
  { title: "Licensed & Certified", desc: "State-licensed CPAs with ongoing education requirements", icon: Medal },
  { title: "IRS Representation", desc: "We speak directly to the IRS on your behalf if issues arise", icon: ShieldCheck },
  { title: "Year-Round Support", desc: "Not just tax season — we are available 365 days a year", icon: CalendarCheck },
  { title: "Audit Protection", desc: "Full audit defense and representation included with every return", icon: Scales },
];

const INDUSTRIES_SERVED = [
  { name: "Small Business", icon: Buildings },
  { name: "Real Estate", icon: ChartLineUp },
  { name: "Healthcare", icon: ShieldCheck },
  { name: "Restaurants", icon: Receipt },
  { name: "Construction", icon: Handshake },
  { name: "E-Commerce", icon: CurrencyDollar },
  { name: "Nonprofits", icon: Star },
  { name: "Freelancers", icon: FileText },
];

const COMPARISON_ROWS = [
  { feature: "CPA Review of Every Return", us: true, them: "No" },
  { feature: "IRS Representation", us: true, them: "Extra Cost" },
  { feature: "Audit Support & Defense", us: true, them: "No" },
  { feature: "Business Deductions Found", us: true, them: "Limited" },
  { feature: "Year-Round Tax Advice", us: true, them: "No" },
  { feature: "Multi-State Filing", us: true, them: "Extra Cost" },
  { feature: "Prior Year Amendments", us: true, them: "Extra Cost" },
];

const TAX_QUIZ_OPTIONS = [
  { label: "Personal Tax Return", desc: "Simple and stress-free filing", color: "#2563eb", icon: FileText },
  { label: "Business Taxes", desc: "Maximize every deduction", color: "#059669", icon: Buildings },
  { label: "Bookkeeping", desc: "Stay organized year-round", color: "#7c3aed", icon: Calculator },
  { label: "IRS Problem", desc: "We will handle it for you", color: "#dc2626", icon: ShieldCheck },
];

function FloatingCharts({ accent }: { accent: string }) {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i, x: Math.random() * 100, delay: Math.random() * 8, duration: 6 + Math.random() * 7,
    size: 2 + Math.random() * 3, opacity: 0.12 + Math.random() * 0.3, isGold: Math.random() > 0.6,
  }));
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden hidden md:block">
      {particles.map((p) => (
        <motion.div key={p.id} className="absolute rounded-full"
          style={{ left: `${p.x}%`, width: p.size, height: p.size, background: p.isGold ? GOLD : accent, willChange: "transform, opacity" }}
          animate={{ y: ["-10vh", "110vh"], opacity: [0, p.opacity, p.opacity, 0] }}
          transition={{ y: { duration: p.duration, repeat: Infinity, delay: p.delay, ease: "linear" }, opacity: { duration: p.duration, repeat: Infinity, delay: p.delay, times: [0, 0.1, 0.9, 1] } }}
        />
      ))}
    </div>
  );
}

function GraphPattern({ opacity = 0.03, accent }: { opacity?: number; accent: string }) {
  const pid = `graphPat-${accent.replace("#", "")}`;
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }}>
      <defs>
        <pattern id={pid} width="80" height="80" patternUnits="userSpaceOnUse">
          <line x1="0" y1="80" x2="80" y2="80" stroke={accent} strokeWidth="0.3" />
          <line x1="0" y1="60" x2="80" y2="60" stroke={accent} strokeWidth="0.2" opacity="0.5" />
          <line x1="0" y1="40" x2="80" y2="40" stroke={accent} strokeWidth="0.2" opacity="0.5" />
          <line x1="0" y1="20" x2="80" y2="20" stroke={accent} strokeWidth="0.2" opacity="0.5" />
          <polyline points="5,70 20,50 35,55 50,30 65,35 80,15" fill="none" stroke={GOLD} strokeWidth="0.8" opacity="0.4" />
          <circle cx="50" cy="30" r="2" fill={GOLD} opacity="0.3" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${pid})`} />
    </svg>
  );
}

function ChartBackground({ opacity = 0.03, accent }: { opacity?: number; accent: string }) {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }} viewBox="0 0 1000 600" preserveAspectRatio="none">
      <rect x="100" y="350" width="40" height="200" fill={accent} opacity="0.3" rx="4" />
      <rect x="200" y="250" width="40" height="300" fill={GOLD} opacity="0.2" rx="4" />
      <rect x="300" y="300" width="40" height="250" fill={accent} opacity="0.25" rx="4" />
      <rect x="700" y="200" width="40" height="350" fill={GOLD} opacity="0.2" rx="4" />
      <rect x="800" y="280" width="40" height="270" fill={accent} opacity="0.3" rx="4" />
      <polyline points="100,300 300,200 500,250 700,100 900,150" fill="none" stroke={GOLD} strokeWidth="2" opacity="0.15" />
    </svg>
  );
}

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-white/15 bg-white/[0.08] backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] ${className}`}>{children}</div>;
}

function MagneticButton({ children, className = "", onClick, style, href }: { children: React.ReactNode; className?: string; onClick?: () => void; style?: React.CSSProperties; href?: string }) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0); const y = useMotionValue(0);
  const springX = useSpring(x, springFast); const springY = useSpring(y, springFast);
  const isTouchDevice = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
  const handleMouseMove = useCallback((e: React.MouseEvent) => { if (!ref.current || isTouchDevice) return; const r = ref.current.getBoundingClientRect(); x.set((e.clientX - (r.left + r.width / 2)) * 0.25); y.set((e.clientY - (r.top + r.height / 2)) * 0.25); }, [x, y, isTouchDevice]);
  const handleMouseLeave = useCallback(() => { x.set(0); y.set(0); }, [x, y]);
  if (href) return <motion.a href={href} ref={ref as unknown as React.Ref<HTMLAnchorElement>} style={{ x: springX, y: springY, willChange: "transform", ...style }} onMouseMove={handleMouseMove as unknown as React.MouseEventHandler<HTMLAnchorElement>} onMouseLeave={handleMouseLeave} className={className} whileTap={{ scale: 0.97 }}>{children}</motion.a>;
  return <motion.button ref={ref} style={{ x: springX, y: springY, willChange: "transform", ...style }} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} onClick={onClick} className={className} whileTap={{ scale: 0.97 }}>{children}</motion.button>;
}

function ShimmerBorder({ children, className = "", accent }: { children: React.ReactNode; className?: string; accent: string }) {
  return (<div className={`relative rounded-2xl p-[1px] overflow-hidden ${className}`}><motion.div className="absolute inset-0 rounded-2xl" style={{ background: `conic-gradient(from 0deg, transparent, ${accent}, transparent, ${GOLD}, transparent)`, willChange: "transform" }} animate={{ rotate: [0, 360] }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} /><div className="relative rounded-2xl bg-[#141414] z-10">{children}</div></div>);
}

function AccordionItem({ question, answer, isOpen, onToggle }: { question: string; answer: string; isOpen: boolean; onToggle: () => void }) {
  return (<GlassCard className="overflow-hidden"><button onClick={onToggle} className="w-full flex items-center justify-between p-5 md:p-6 text-left group cursor-pointer"><span className="text-lg font-semibold text-white pr-4">{question}</span><motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={spring}><CaretDown size={20} className="text-slate-400 shrink-0" /></motion.div></button><AnimatePresence initial={false}>{isOpen && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={spring} className="overflow-hidden"><p className="px-5 pb-5 md:px-6 md:pb-6 text-slate-400 leading-relaxed">{answer}</p></motion.div>)}</AnimatePresence></GlassCard>);
}

function SectionHeader({ badge, title, subtitle, accent }: { badge: string; title: string; subtitle?: string; accent: string }) {
  return (<div className="text-center mb-16"><span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: GOLD, borderColor: `${GOLD}33`, background: `${GOLD}0d` }}>{badge}</span><h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white">{title}</h2><div className="h-0.5 w-16 mx-auto mt-4" style={{ background: `linear-gradient(to right, ${GOLD}, transparent)` }} />{subtitle && <p className="text-slate-400 mt-4 max-w-2xl text-lg leading-relaxed mx-auto">{subtitle}</p>}</div>);
}


/* ───────────────────────── ANIMATED SECTION ───────────────────────── */
function AnimatedSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: "easeOut" as const }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function V2AccountingPreview({ data }: { data: GeneratedSiteData }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const { ACCENT, ACCENT_GLOW } = getAccent(data.accentColor);

  const uniquePhotos = data.photos ? [...new Set(data.photos)] : [];


  const heroImage = uniquePhotos[0] || pickFromPool(STOCK_HERO_POOL, data.businessName);


  const heroCardImage = uniquePhotos[1] || pickFromPool(STOCK_ABOUT_POOL, data.businessName, 1);


  const aboutImage = uniquePhotos[2] || pickFromPool(STOCK_ABOUT_POOL, data.businessName, 2);
  const projectImages = data.photos?.length > 2 ? data.photos.slice(2, 6) : pickGallery(STOCK_PROJECTS, data.businessName);

  const processSteps = TAX_PROCESS_STEPS;

  const faqs = [
    { q: `What accounting services does ${data.businessName} offer?`, a: `We provide comprehensive services including ${data.services.slice(0, 3).map(s => s.name).join(", ")}, and more. Schedule a free consultation to discuss your needs.` },
    { q: "How can you save me money on taxes?", a: `Our CPAs at ${data.businessName} use proactive tax planning strategies to identify every legal deduction and credit available to you. Most clients save significantly more than our fees.` },
    { q: "Do you work with small businesses?", a: "Absolutely! We specialize in serving small and medium businesses as well as individuals. Our scalable services grow with your business needs." },
    { q: "Is my financial data secure?", a: "Yes. We use bank-level encryption and follow strict data security protocols. All your financial information is protected with the highest industry standards." },
    { q: "When is the best time to start tax planning?", a: "The best time is now! While most people wait until January, proactive year-round tax planning gives us the most flexibility to minimize your liability." },
    { q: "Can you represent me in an IRS audit?", a: `Absolutely. ${data.businessName} provides full audit representation. Our CPAs handle all IRS correspondence and meetings on your behalf.` },
    { q: "Do you offer bookkeeping services?", a: "Yes, we offer both monthly and quarterly bookkeeping packages. We reconcile accounts, manage payroll, and keep your books audit-ready year-round." },
    { q: "What are your fees?", a: "Our fees vary based on the complexity of your needs. We offer transparent pricing with no hidden charges. Schedule a free consultation for a custom quote." },
  ];

  /* Fallback testimonials */
  const fallbackTestimonials = [
    { name: "Sarah M.", text: "They saved us thousands on our tax return. Incredibly knowledgeable and always available when we have questions.", rating: 5 },
    { name: "David R.", text: "Finally found an accountant who explains things in plain English. Our books have never been cleaner.", rating: 5 },
    { name: "Jennifer L.", text: "Switched from a big firm and couldn't be happier. Personal attention and they actually care about our business.", rating: 5 }
  ];
  const testimonials = data.testimonials?.length > 0 ? data.testimonials : fallbackTestimonials;

  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden" style={{ background: CHARCOAL, color: "#f1f5f9" }}>
      <FloatingCharts accent={ACCENT} />

      {/* 1. NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-4">
          <GlassCard className="flex items-center justify-between px-4 md:px-6 py-3">
            <div className="flex items-center gap-2"><ChartLineUp size={24} weight="fill" style={{ color: GOLD }} /><span className="text-lg font-bold tracking-tight text-white">{data.businessName}</span></div>
            <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
              <a href="#services" className="hover:text-white transition-colors">Services</a><a href="#about" className="hover:text-white transition-colors">About</a>
              <a href="#results" className="hover:text-white transition-colors">Results</a><a href="#contact" className="hover:text-white transition-colors">Contact</a>
            </div>
            <div className="flex items-center gap-3">
              <MagneticButton className="px-4 md:px-5 py-2 rounded-full text-sm font-semibold text-black transition-colors cursor-pointer" style={{ background: GOLD } as React.CSSProperties}>Free Consultation</MagneticButton>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors">{mobileMenuOpen ? <X size={24} /> : <List size={24} />}</button>
            </div>
          </GlassCard>
          <AnimatePresence>{mobileMenuOpen && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }} className="md:hidden mt-2 overflow-hidden"><GlassCard className="flex flex-col gap-1 px-4 py-4">{[{ label: "Services", href: "#services" }, { label: "About", href: "#about" }, { label: "Results", href: "#results" }, { label: "Contact", href: "#contact" }].map((link) => <a key={link.label} href={link.href} onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors">{link.label}</a>)}</GlassCard></motion.div>)}</AnimatePresence>
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
          <div className="space-y-8 rounded-2xl bg-black/50 backdrop-blur-md p-6 md:p-8 border border-white/8">
            <div>
              <p className="text-sm uppercase tracking-widest mb-4" style={{ color: GOLD }}>Certified Public Accountants</p>
              <h1 className="text-3xl md:text-6xl tracking-tighter leading-none font-bold text-white" style={{ textShadow: "0 2px 20px rgba(0,0,0,0.8), 0 4px 40px rgba(0,0,0,0.5)" }}>{data.tagline}</h1>
            </div>
            <p className="text-lg text-white/80 max-w-md leading-relaxed" style={{ textShadow: "0 1px 8px rgba(0,0,0,0.6)" }}>{(() => { const t = data.about; if (t.length <= 180) return t; const dot = t.indexOf('.', 80); return dot > 0 && dot < 220 ? t.slice(0, dot + 1) : t.slice(0, 180).trim() + '...'; })()}</p>
            <div className="flex flex-wrap gap-4">
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-black flex items-center gap-2 cursor-pointer" style={{ background: GOLD } as React.CSSProperties}>Free Consultation <ArrowRight size={18} weight="bold" /></MagneticButton>
              <MagneticButton href={`tel:${data.phone.replace(/\D/g, "")}`} className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/15 flex items-center gap-2 cursor-pointer"><Phone size={18} weight="duotone" /><PhoneLink phone={data.phone} /></MagneticButton>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-white/80" style={{ textShadow: "0 1px 8px rgba(0,0,0,0.6)" }}>
              <span className="flex items-center gap-2"><MapPin size={16} weight="duotone" style={{ color: GOLD }} /><MapLink address={data.address} /></span>
              <span className="flex items-center gap-2"><ShieldCheck size={16} weight="duotone" style={{ color: GOLD }} />Licensed CPAs</span>
            </div>
          </div>
          <div className="hidden md:block relative">
            <div className="relative rounded-2xl overflow-hidden border border-white/15">
              <img src={heroCardImage} alt={`${data.businessName} accounting`} className="w-full h-[500px] object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-transparent to-transparent" /><div className="absolute inset-0 bg-gradient-to-r from-[#1a1a1a]/40 to-transparent" />
              <div className="absolute bottom-6 left-6"><div className="px-4 py-2 rounded-full backdrop-blur-md bg-black/50 border flex items-center gap-2" style={{ borderColor: `${GOLD}4d` }}><Medal size={18} weight="fill" style={{ color: GOLD }} /><span className="text-sm font-semibold text-white">CPA Certified</span></div></div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. STATS */}
      <section className="relative z-10 py-16 overflow-hidden border-y" style={{ borderColor: `${GOLD}1a` }}>
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${ACCENT}40, #1a1a1a 100%)` }} />
        <GraphPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {data.stats.map((stat, i) => { const icons = [ChartLineUp, CurrencyDollar, Clock, Star]; const Icon = icons[i % icons.length]; return (
              <div key={stat.label} className="text-center"><div className="flex items-center justify-center gap-2 mb-2"><Icon size={22} weight="fill" style={{ color: GOLD }} /><span className="text-3xl md:text-4xl font-extrabold text-white">{stat.value}</span></div><span className="text-slate-500 text-sm font-medium tracking-wide uppercase">{stat.label}</span></div>
            ); })}
          </div>
        </div>
      </section>

      {/* 3.5 SERVICE TYPE BADGES */}
      <section className="relative z-10 py-12 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, #1a1a1a 0%, ${ACCENT}20 50%, #1a1a1a 100%)` }} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="flex flex-wrap justify-center gap-3">
            {SERVICE_TYPE_BADGES.map((badge) => (
              <div key={badge.label} className="flex items-center gap-2 px-5 py-2.5 rounded-full border text-sm font-semibold transition-colors hover:bg-white/[0.07]" style={{ borderColor: `${GOLD}33`, color: GOLD, background: `${GOLD}0a` }}>
                <badge.icon size={18} weight="duotone" />
                <span>{badge.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. SERVICES */}
      <section id="services" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, #1a1a1a 0%, ${ACCENT}30 50%, #1a1a1a 100%)` }} />
        <GraphPattern accent={ACCENT} /><ChartBackground opacity={0.025} accent={ACCENT} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[10%] right-[5%] w-[500px] h-[500px] rounded-full blur-[160px]" style={{ background: `${GOLD}08` }} /></div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Our Services" title="Expert Financial Services" subtitle={`From tax preparation to strategic advisory, ${data.businessName} helps you maximize every dollar.`} accent={ACCENT} />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.services.map((service, i) => { const Icon = getServiceIcon(service.name); return (
              <div key={service.name} className="group relative p-7 rounded-2xl border border-white/[0.10] hover:border-opacity-30 transition-all duration-500 overflow-hidden bg-white/[0.07]">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: `radial-gradient(circle at 50% 0%, ${GOLD}15, transparent 70%)` }} />
                <div className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `linear-gradient(to right, transparent, ${GOLD}4d, transparent)` }} />
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-5"><div className="w-12 h-12 rounded-xl flex items-center justify-center border" style={{ background: ACCENT_GLOW, borderColor: `${GOLD}33` }}><Icon size={24} weight="duotone" style={{ color: GOLD }} /></div><span className="text-xs font-mono text-slate-600">{String(i + 1).padStart(2, "0")}</span></div>
                  <h3 className="text-lg font-bold text-white mb-2">{service.name}</h3><p className="text-sm text-slate-400 leading-relaxed">{service.description || ""}</p>
                  {service.price && <p className="text-sm font-semibold mt-3" style={{ color: GOLD }}>{service.price}</p>}
                </div>
              </div>
            ); })}
          </div>
        </div>
      </section>

      {/* 4.5 TAX SAVINGS */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, #1a1a1a 0%, ${ACCENT}25 50%, #1a1a1a 100%)` }} />
        <ChartBackground opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Pricing" title="How Much Could You Save?" subtitle="Transparent pricing with no hidden fees. Every dollar we save you is a dollar back in your pocket." accent={ACCENT} />
          <div className="grid md:grid-cols-3 gap-6">
            {TAX_SAVINGS_CARDS.map((card) => (
              <GlassCard key={card.title} className="p-7 text-center group hover:border-opacity-30 transition-all duration-500 relative overflow-hidden">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: `radial-gradient(circle at 50% 0%, ${GOLD}15, transparent 70%)` }} />
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-full mx-auto mb-5 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${GOLD}22, ${GOLD}0a)`, border: `1px solid ${GOLD}33` }}>
                    <card.icon size={26} weight="duotone" style={{ color: GOLD }} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">{card.title}</h3>
                  <p className="text-2xl font-extrabold mb-3" style={{ color: GOLD }}>{card.price}</p>
                  <p className="text-sm text-slate-400 leading-relaxed">{card.desc}</p>
                </div>
              </GlassCard>
            ))}
          </div>
          <p className="text-center text-sm text-slate-500 mt-8">Exact pricing depends on complexity. Schedule a free consultation for a custom quote.</p>
        </div>
      </section>

      {/* 5. ABOUT */}
      <section id="about" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, #1a1a1a 0%, ${ACCENT}20 50%, #1a1a1a 100%)` }} />
        <ChartBackground opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="relative">
              <div className="rounded-2xl overflow-hidden border border-white/15"><img src={aboutImage} alt={`${data.businessName} team`} className="w-full h-[400px] object-cover" /></div>
              <div className="absolute -bottom-4 -right-4 md:bottom-6 md:-right-6"><div className="px-5 py-3 rounded-xl backdrop-blur-md border text-black font-bold text-sm shadow-lg" style={{ background: `${GOLD}e6`, borderColor: `${GOLD}80` }}>{data.stats[0] ? `${data.stats[0].value} ${data.stats[0].label}` : "Trusted Advisors"}</div></div>
            </div>
            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: GOLD, borderColor: `${GOLD}33`, background: `${GOLD}0d` }}>Why Choose Us</span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6 text-white">Your Financial Growth Partners</h2>
              <p className="text-slate-400 leading-relaxed mb-8">{data.about}</p>
              <div className="grid grid-cols-2 gap-4">
                {[{ icon: Medal, label: "CPA Certified" }, { icon: ShieldCheck, label: "Fully Licensed" }, { icon: Star, label: "5-Star Reviews" }, { icon: CheckCircle, label: "Guaranteed Accuracy" }].map((badge) => (
                  <GlassCard key={badge.label} className="p-4 flex items-center gap-3"><div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: ACCENT_GLOW }}><badge.icon size={20} weight="duotone" style={{ color: GOLD }} /></div><span className="text-sm font-semibold text-white">{badge.label}</span></GlassCard>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. PROCESS */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, #1a1a1a 0%, ${ACCENT}30 50%, #1a1a1a 100%)` }} />
        <GraphPattern opacity={0.025} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <AnimatedSection>          <SectionHeader badge="The Tax Process" title="Simple. Thorough. Maximum Refund." subtitle="Four easy steps to peace of mind and more money in your pocket." accent={ACCENT} /></AnimatedSection>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {processSteps.map((step, i) => { const StepIcon = step.icon; return (
              <div key={step.step} className="relative">
                {i < processSteps.length - 1 && <div className="hidden lg:block absolute top-10 left-[calc(50%+40px)] w-[calc(100%-80px)] h-px" style={{ background: `linear-gradient(to right, ${GOLD}33, ${GOLD}11)` }} />}
                <GlassCard className="p-6 text-center relative">
                  <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${GOLD}22, ${GOLD}0a)`, border: `1px solid ${GOLD}33` }}>
                    <StepIcon size={28} weight="duotone" style={{ color: GOLD }} />
                  </div>
                  <span className="text-xs font-mono text-slate-600 mb-2 block">{step.step}</span>
                  <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
                </GlassCard>
              </div>
            ); })}
          </div>
        </div>
      </section>

      {/* 7. RESULTS */}
      <section id="results" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, #1a1a1a 0%, ${ACCENT}20 50%, #1a1a1a 100%)` }} />
        <ChartBackground opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <AnimatedSection>          <SectionHeader badge="Client Success" title="Proven Results" accent={ACCENT} /></AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projectImages.map((src, i) => { const titles = ["Tax Strategy Optimization", "Business Growth Advisory", "Financial Restructuring", "Startup CFO Services"]; const descs = ["Saved clients thousands through strategic tax planning.", "Helped businesses double revenue with financial guidance.", "Restructured finances for maximum efficiency.", "Full CFO services for fast-growing startups."]; return (
              <div key={i} className="group relative rounded-2xl overflow-hidden border border-white/[0.10] hover:border-opacity-30 transition-all duration-500">
                <img src={src} alt={titles[i]} className="w-full h-64 object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6"><h3 className="text-lg font-bold text-white mb-1">{titles[i]}</h3><p className="text-sm text-slate-300">{descs[i]}</p></div>
              </div>
            ); })}
          </div>
        </div>
      </section>

      {/* 7.5 WHY CHOOSE A CPA */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, #1a1a1a 0%, ${ACCENT}30 50%, #1a1a1a 100%)` }} />
        <GraphPattern opacity={0.025} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="CPA Advantage" title="Why Choose a CPA?" subtitle="A licensed CPA offers expertise and protection that DIY software simply cannot match." accent={ACCENT} />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {CPA_PILLARS.map((pillar) => (
              <GlassCard key={pillar.title} className="p-6 text-center group hover:border-opacity-30 transition-all duration-500 relative overflow-hidden">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: `radial-gradient(circle at 50% 0%, ${GOLD}15, transparent 70%)` }} />
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${GOLD}22, ${GOLD}0a)`, border: `1px solid ${GOLD}33` }}>
                    <pillar.icon size={26} weight="duotone" style={{ color: GOLD }} />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{pillar.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{pillar.desc}</p>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* 7.6 INDUSTRIES WE SERVE */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, #1a1a1a 0%, ${ACCENT}20 50%, #1a1a1a 100%)` }} />
        <ChartBackground opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Specializations" title="Industries We Serve" subtitle={`${data.businessName} has deep expertise across a wide range of industries.`} accent={ACCENT} />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {INDUSTRIES_SERVED.map((industry) => (
              <GlassCard key={industry.name} className="p-5 text-center group hover:border-opacity-30 transition-all duration-500 relative overflow-hidden cursor-default">
                <div className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `linear-gradient(to right, transparent, ${GOLD}4d, transparent)` }} />
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center" style={{ background: `${GOLD}12`, border: `1px solid ${GOLD}22` }}>
                    <industry.icon size={22} weight="duotone" style={{ color: GOLD }} />
                  </div>
                  <span className="text-sm font-semibold text-white">{industry.name}</span>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* 7.7 COMPETITOR COMPARISON TABLE */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, #1a1a1a 0%, ${ACCENT}30 50%, #1a1a1a 100%)` }} />
        <GraphPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Compare" title={`${data.businessName} vs DIY Tax Software`} subtitle="See why working with a licensed CPA delivers more value than going it alone." accent={ACCENT} />
          <GlassCard className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/15">
                    <th className="px-5 py-4 text-sm font-semibold text-slate-400">Feature</th>
                    <th className="px-5 py-4 text-sm font-semibold text-center" style={{ color: GOLD }}>{data.businessName}</th>
                    <th className="px-5 py-4 text-sm font-semibold text-slate-500 text-center">DIY Software</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_ROWS.map((row, i) => (
                    <tr key={row.feature} className={`border-b border-white/8 ${i % 2 === 0 ? "bg-white/[0.01]" : ""}`}>
                      <td className="px-5 py-4 text-sm text-slate-300 font-medium">{row.feature}</td>
                      <td className="px-5 py-4 text-center"><CheckCircle size={22} weight="fill" className="mx-auto" style={{ color: "#22c55e" }} /></td>
                      <td className="px-5 py-4 text-center text-sm text-slate-500 font-medium">{row.them}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* 7.8 VIDEO PLACEHOLDER */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, #1a1a1a 0%, ${ACCENT}20 50%, #1a1a1a 100%)` }} />
        <ChartBackground opacity={0.02} accent={ACCENT} />
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Get to Know Us" title="Meet Your CPA" subtitle="See the people behind the numbers and learn how we help clients achieve peace of mind." accent={ACCENT} />
          <div className="relative rounded-2xl overflow-hidden border border-white/15 group cursor-pointer">
            <img src={aboutImage} alt={`Meet the ${data.businessName} team`} className="w-full h-[300px] md:h-[420px] object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-black/50 group-hover:bg-black/40 transition-colors duration-300" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              <div className="w-20 h-20 rounded-full flex items-center justify-center border-2 transition-transform duration-300 group-hover:scale-110" style={{ borderColor: GOLD, background: `${GOLD}33` }}>
                <Play size={36} weight="fill" style={{ color: GOLD }} />
              </div>
              <span className="text-white font-semibold text-lg">Watch Our Story</span>
            </div>
          </div>
        </div>
      </section>

      {/* 7.9 TAX HELP QUIZ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, #1a1a1a 0%, ${ACCENT}30 50%, #1a1a1a 100%)` }} />
        <GraphPattern opacity={0.025} accent={ACCENT} />
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Get Started" title="What Tax Help Do You Need?" subtitle="Select your situation and we will match you with the right solution." accent={ACCENT} />
          <div className="grid md:grid-cols-2 gap-5">
            {TAX_QUIZ_OPTIONS.map((option) => (
              <div key={option.label} className="group relative p-6 rounded-2xl border border-white/[0.10] hover:border-opacity-40 transition-all duration-500 overflow-hidden bg-white/[0.07] cursor-pointer">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: `radial-gradient(circle at 50% 0%, ${option.color}20, transparent 70%)` }} />
                <div className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: option.color }} />
                <div className="relative z-10 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${option.color}1a`, border: `1px solid ${option.color}33` }}>
                    <option.icon size={24} weight="duotone" style={{ color: option.color }} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-1">{option.label}</h3>
                    <p className="text-sm text-slate-400">{option.desc}</p>
                  </div>
                  <ArrowRight size={20} className="text-slate-600 group-hover:text-white transition-colors mt-1 shrink-0" />
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-black inline-flex items-center gap-2 cursor-pointer" style={{ background: GOLD } as React.CSSProperties}>
              Schedule Free Consultation <ArrowRight size={18} weight="bold" />
            </MagneticButton>
          </div>
        </div>
      </section>

      {/* 8. TESTIMONIALS */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, #1a1a1a 0%, ${ACCENT}30 50%, #1a1a1a 100%)` }} />
        <GraphPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <AnimatedSection>          <SectionHeader badge="Testimonials" title="What Our Clients Say" accent={ACCENT} /></AnimatedSection>
          {/* Google Reviews Header */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={24} weight="fill" style={{ color: "#facc15" }} />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-extrabold text-white">{data.googleRating || "4.9"}</span>
              <span className="text-slate-400 text-sm font-medium">out of 5 based on</span>
              <span className="text-white font-semibold">{data.reviewCount || "100+"}</span>
              <span className="text-slate-400 text-sm font-medium">Google Reviews</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <GlassCard key={i} className="p-6 h-full flex flex-col"><div className="flex gap-0.5 mb-4">{Array.from({ length: t.rating || 5 }).map((_, j) => <Star key={j} size={16} weight="fill" style={{ color: GOLD }} />)}</div><p className="text-slate-300 leading-relaxed flex-1 text-sm mb-4">&ldquo;{t.text}&rdquo;</p><div className="pt-4 border-t border-white/8"><span className="text-sm font-semibold text-white">{t.name}</span></div></GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* 9. FREE CONSULTATION CTA */}
      <section className="relative z-10 py-20 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT}cc, ${ACCENT})` }} />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='40' height='40' fill='none'/%3E%3Cpath d='M0 0L40 40M40 0L0 40' stroke='%23000' stroke-width='0.5'/%3E%3C/svg%3E\")" }} />
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <ShimmerBorder accent={GOLD}>
            <div className="p-8 md:p-12">
              <CurrencyDollar size={48} weight="fill" className="mx-auto mb-6" style={{ color: GOLD }} />
              <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-4">Schedule Your Free Tax Consultation</h2>
              <p className="text-lg text-slate-300 mb-3 max-w-xl mx-auto">Find out what deductions you have been missing. Our CPAs will review your situation and build a strategy to maximize your refund.</p>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-8" style={{ color: GOLD, background: `${GOLD}15`, border: `1px solid ${GOLD}33` }}>
                <ChartLineUp size={16} weight="fill" />
                Average client saves $3,200
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-black flex items-center gap-2 cursor-pointer" style={{ background: GOLD } as React.CSSProperties}>
                  Book Free Consultation <ArrowRight size={18} weight="bold" />
                </MagneticButton>
                <PhoneLink phone={data.phone} className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-white/10 text-white font-bold text-base hover:bg-white/15 transition-colors border border-white/15">
                  <Phone size={20} weight="fill" />{data.phone}
                </PhoneLink>
              </div>
            </div>
          </ShimmerBorder>
        </div>
      </section>

      {/* 10. TAX DEADLINE URGENCY */}
      <section className="relative z-10 py-12 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, #7f1d1d 0%, #991b1b 50%, #7f1d1d 100%)` }} />
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-3 h-3 rounded-full bg-red-400 animate-ping absolute" />
                <div className="w-3 h-3 rounded-full bg-red-400 relative" />
              </div>
              <div>
                <p className="text-white font-bold text-lg">Tax Deadline Approaching</p>
                <p className="text-red-200 text-sm">Don&apos;t wait until the last minute. File early and maximize your refund.</p>
              </div>
            </div>
            <PhoneLink phone={data.phone} className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-red-900 font-bold text-sm hover:bg-red-50 transition-colors whitespace-nowrap">
              <Phone size={18} weight="bold" /> File Now &mdash; Beat the Rush
            </PhoneLink>
          </div>
        </div>
      </section>

      {/* 10b. CERTIFICATIONS ROW */}
      <section className="relative z-10 py-16 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, #1a1a1a 0%, ${ACCENT}15 50%, #1a1a1a 100%)` }} />
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <p className="text-center text-xs font-bold uppercase tracking-widest mb-6" style={{ color: GOLD }}>Certifications &amp; Affiliations</p>
          <div className="flex flex-wrap justify-center gap-4">
            {["Licensed CPA", "QuickBooks ProAdvisor", "IRS Enrolled Agent", "AICPA Member", "BBB A+ Rated", "State Board Certified"].map((cert) => (
              <span key={cert} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium border" style={{ color: GOLD, borderColor: `${GOLD}33`, background: `${GOLD}0d` }}>
                <ShieldCheck size={16} weight="fill" />{cert}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 10c. SERVICE AREAS (Enhanced) */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, #1a1a1a 0%, ${ACCENT}20 50%, #1a1a1a 100%)` }} />
        <GraphPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <AnimatedSection><SectionHeader badge="Coverage Area" title="Areas We Serve" accent={ACCENT} /></AnimatedSection>
          <div className="text-center mb-8"><GlassCard className="p-8 inline-block"><div className="flex items-center gap-3 text-lg"><MapPin size={24} weight="duotone" style={{ color: GOLD }} /><MapLink address={data.address} className="text-white font-semibold" /></div><p className="text-slate-400 text-sm mt-2">&amp; Surrounding Areas</p></GlassCard></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto">
            {["Downtown", "Midtown", "Westside", "Eastside", "North End", "South End", "Suburbs", "Metro Area"].map((area) => (
              <div key={area} className="flex items-center gap-2 px-4 py-3 rounded-xl border border-white/8 bg-white/[0.08]">
                <CheckCircle size={14} weight="fill" style={{ color: GOLD }} />
                <span className="text-sm text-slate-300">{area}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-4 mt-8">
            <div className="relative">
              <div className="w-2.5 h-2.5 rounded-full animate-ping absolute" style={{ background: "#22c55e" }} />
              <div className="w-2.5 h-2.5 rounded-full relative" style={{ background: "#22c55e" }} />
            </div>
            <span className="text-sm text-slate-400">Virtual appointments available &mdash; we serve clients nationwide</span>
          </div>
        </div>
      </section>

      {/* 11. HOURS */}
      {data.hours && (
        <section className="relative z-10 py-24 md:py-32 overflow-hidden">
          <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, #1a1a1a 0%, ${ACCENT}30 50%, #1a1a1a 100%)` }} />
          <ChartBackground opacity={0.02} accent={ACCENT} />
          <div className="max-w-3xl mx-auto px-6 relative z-10">
            <AnimatedSection>          <SectionHeader badge="Business Hours" title="When We're Available" accent={ACCENT} /></AnimatedSection>
            <div className="text-center"><ShimmerBorder accent={ACCENT}><div className="p-8"><Clock size={32} weight="duotone" style={{ color: GOLD }} className="mx-auto mb-4" /><p className="text-slate-300 leading-relaxed whitespace-pre-line text-lg">{data.hours}</p></div></ShimmerBorder></div>
          </div>
        </section>
      )}

      {/* 11b. DOCUMENT CHECKLIST */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, #1a1a1a 0%, ${ACCENT}25 50%, #1a1a1a 100%)` }} />
        <ChartBackground opacity={0.02} accent={ACCENT} />
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <AnimatedSection><SectionHeader badge="Get Ready" title="Tax Document Checklist" subtitle="Have these ready for your appointment so we can maximize every deduction." accent={ACCENT} /></AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              "W-2s from all employers",
              "1099 forms (freelance, investment, interest)",
              "Mortgage interest statement (1098)",
              "Property tax records",
              "Charitable donation receipts",
              "Business expense records",
              "Health insurance forms (1095)",
              "Previous year tax return",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 px-5 py-4 rounded-xl border border-white/8 bg-white/[0.08]">
                <CheckCircle size={18} weight="fill" style={{ color: GOLD }} />
                <span className="text-sm text-slate-300">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MID-PAGE CTA */}
      <section className="relative z-10 py-12 sm:py-16 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${ACCENT}15, ${ACCENT}08)` }} />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: ACCENT }}>
            Don&apos;t Miss Out
          </p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-3">
            Ready to Get Started?
          </h2>
          <p className="text-slate-400 mb-6 text-sm sm:text-base">
            Limited time &mdash; claim your free professional website today before it&apos;s offered to a competitor.
          </p>
          <a
            href={`/claim/${data.id}`}
            className="inline-flex items-center gap-2 min-h-[48px] px-8 py-3 rounded-full text-white font-bold text-base hover:shadow-lg transition-all duration-300"
            style={{ background: ACCENT }}
          >
            Claim This Website
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </a>
        </div>
      </section>

      {/* 11c-2. WHY CHOOSE US */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, #1a1a1a 0%, ${ACCENT}10 50%, #1a1a1a 100%)` }} />
        <ChartBackground opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Our Advantage" title="Why Clients Choose Us" accent={ACCENT} />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Scales, title: "Licensed CPAs", desc: "State-licensed Certified Public Accountants with years of experience." },
              { icon: ShieldCheck, title: "IRS Representation", desc: "We handle audits, notices, and negotiations on your behalf." },
              { icon: Handshake, title: "Year-Round Support", desc: "Not just at tax time. We are your financial partner every month." },
              { icon: Medal, title: "Proactive Planning", desc: "We find savings before tax season, not after the deadline." },
            ].map((item) => (
              <GlassCard key={item.title} className="p-6 text-center">
                <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: `${ACCENT}15`, border: `1px solid ${ACCENT}22` }}>
                  <item.icon size={28} weight="duotone" style={{ color: ACCENT }} />
                </div>
                <h3 className="text-base font-bold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* 11d. TAX TIPS SECTION */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, #1a1a1a 0%, ${ACCENT}15 50%, #1a1a1a 100%)` }} />
        <GraphPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Tax Tips" title="Smart Tax Strategies" subtitle="Expert advice to help you minimize your tax burden and maximize savings." accent={ACCENT} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { title: "Maximize Deductions", desc: "Track every business expense throughout the year. Home office, mileage, equipment, and professional development are commonly missed deductions worth thousands.", icon: Calculator },
              { title: "Quarterly Estimated Taxes", desc: "Self-employed? Pay quarterly to avoid penalties. We calculate your estimated payments so you are never surprised at tax time.", icon: CalendarCheck },
              { title: "Retirement Contributions", desc: "Maximize contributions to SEP-IRA, Solo 401(k), or traditional IRA accounts. These reduce taxable income while building your future.", icon: CurrencyDollar },
              { title: "Entity Structure Review", desc: "Is your business structured optimally? The difference between an LLC and S-Corp can mean thousands in self-employment tax savings.", icon: Buildings },
              { title: "Year-End Tax Planning", desc: "Start planning in October, not April. Accelerating deductions or deferring income can significantly impact your annual tax liability.", icon: ChartLineUp },
              { title: "Record Keeping", desc: "Maintain organized records year-round. Digital copies of receipts, bank statements, and invoices make tax preparation faster and cheaper.", icon: Receipt },
            ].map((tip) => (
              <GlassCard key={tip.title} className="p-6 flex gap-4 items-start">
                <div className="w-12 h-12 rounded-full shrink-0 flex items-center justify-center" style={{ background: `${ACCENT}15`, border: `1px solid ${ACCENT}22` }}>
                  <tip.icon size={24} weight="duotone" style={{ color: ACCENT }} />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white mb-1">{tip.title}</h4>
                  <p className="text-sm text-slate-400 leading-relaxed">{tip.desc}</p>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* 11e. DOCUMENT CHECKLIST EXPANDED */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, #1a1a1a 0%, ${ACCENT}10 50%, #1a1a1a 100%)` }} />
        <ChartBackground opacity={0.02} accent={ACCENT} />
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Preparation" title="Tax Season Checklist" subtitle="Gather these documents before your appointment to ensure a smooth and thorough filing." accent={ACCENT} />
          <div className="grid md:grid-cols-2 gap-8">
            <GlassCard className="p-8">
              <h3 className="text-xl font-bold text-white mb-4">Personal Tax Documents</h3>
              <ul className="space-y-3">
                {["W-2s from all employers", "1099s (freelance, interest, dividends)", "Social Security numbers for all dependents", "Previous year tax return", "Health insurance forms (1095-A/B/C)", "Mortgage interest statement (1098)", "Property tax records", "Charitable donation receipts"].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-slate-400">
                    <CheckCircle size={16} weight="fill" className="mt-0.5 shrink-0" style={{ color: ACCENT }} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </GlassCard>
            <GlassCard className="p-8">
              <h3 className="text-xl font-bold text-white mb-4">Business Tax Documents</h3>
              <ul className="space-y-3">
                {["Profit & loss statement", "Balance sheet", "Business expense receipts", "Vehicle mileage log", "Home office measurements", "1099-NEC forms issued", "Payroll records and W-2s issued", "Equipment purchase receipts"].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-slate-400">
                    <CheckCircle size={16} weight="fill" className="mt-0.5 shrink-0" style={{ color: GOLD }} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* 11f. INDUSTRY EXPERTISE EXPANDED */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, #1a1a1a 0%, ${ACCENT}15 50%, #1a1a1a 100%)` }} />
        <GraphPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            badge="Expertise"
            title="Industries We Specialize In"
            subtitle="Deep industry knowledge means better tax strategies and compliance for your specific business."
            accent={ACCENT}
          />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { title: "Healthcare", desc: "Medical practices, dental offices, and wellness providers" },
              { title: "Real Estate", desc: "Investors, agents, property managers, and developers" },
              { title: "Construction", desc: "Contractors, subcontractors, and trades businesses" },
              { title: "Restaurants", desc: "Food service, catering, and hospitality businesses" },
              { title: "E-Commerce", desc: "Online retailers, dropshipping, and digital products" },
              { title: "Professional Services", desc: "Law firms, consultants, and marketing agencies" },
              { title: "Non-Profits", desc: "501(c)(3) organizations and charitable foundations" },
              { title: "Startups", desc: "New ventures, tech companies, and venture-backed firms" },
            ].map((item) => (
              <GlassCard key={item.title} className="p-5 text-center">
                <h4 className="text-sm font-bold text-white mb-1">{item.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* 11g. TAX DEADLINE CALENDAR */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, #1a1a1a 0%, ${ACCENT}10 50%, #1a1a1a 100%)` }} />
        <GraphPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Deadlines" title="Important Tax Deadlines" subtitle="Never miss a filing date. We track all deadlines and send reminders proactively." accent={ACCENT} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { date: "Jan 15", title: "Q4 Estimated Tax", desc: "Fourth quarter estimated tax payment due for prior year" },
              { date: "Apr 15", title: "Tax Day", desc: "Individual and business tax returns due (or extension filed)" },
              { date: "Jun 15", title: "Q2 Estimated Tax", desc: "Second quarter estimated tax payment due for current year" },
              { date: "Oct 15", title: "Extended Returns", desc: "Final deadline for returns filed with extension" },
            ].map((item) => (
              <GlassCard key={item.date} className="p-5 text-center">
                <div className="text-2xl font-extrabold mb-2" style={{ color: GOLD }}>{item.date}</div>
                <h4 className="text-sm font-bold text-white mb-1">{item.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
              </GlassCard>
            ))}
          </div>
          <p className="text-center text-xs text-slate-500 mt-6">
            We handle all deadline tracking and send reminders well in advance. Never worry about a missed filing date again.
          </p>
        </div>
      </section>

      {/* 11h. MID-PAGE CTA */}
      <section className="relative z-10 py-16 overflow-hidden">
        <div className="absolute inset-0" style={{ background: ACCENT }} />
        <div className="absolute inset-0 bg-black/20" />
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
            Stop Overpaying on Taxes
          </h2>
          <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
            Schedule your free consultation and discover how much you could be saving.
            Most clients save $3,200+ in their first year working with us.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <PhoneLink phone={data.phone} className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-sm font-bold" style={{ color: ACCENT }}>
              <Phone size={18} weight="fill" /> Free Consultation
            </PhoneLink>
            <a href="#contact" className="inline-flex items-center gap-2 px-8 py-4 rounded-full border-2 border-white text-white text-sm font-bold hover:bg-white/10 transition-colors">
              Get Started <ArrowRight size={18} weight="bold" />
            </a>
          </div>
        </div>
      </section>

      {/* 12. FAQ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, #1a1a1a 0%, ${ACCENT}20 50%, #1a1a1a 100%)` }} />
        <ChartBackground opacity={0.02} accent={ACCENT} />
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <AnimatedSection>          <SectionHeader badge="FAQ" title="Common Questions" accent={ACCENT} /></AnimatedSection>
          <div className="space-y-3">{faqs.map((faq, i) => <AccordionItem key={i} question={faq.q} answer={faq.a} isOpen={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} />)}</div>
        </div>
      </section>

      {/* 13. GUARANTEE */}
      <section className="relative z-10 py-16 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, #1a1a1a 0%, ${ACCENT}30 100%)` }} />
        <GraphPattern opacity={0.015} accent={ACCENT} />
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <ShimmerBorder accent={ACCENT}><div className="p-8 md:p-12">
            <ShieldCheck size={48} weight="fill" style={{ color: GOLD }} className="mx-auto mb-4" />
            <h2 className="text-2xl md:text-4xl font-extrabold text-white mb-4">Our Accuracy Guarantee</h2>
            <p className="text-slate-400 leading-relaxed max-w-2xl mx-auto text-lg mb-2">Every return and financial statement from {data.businessName} is backed by our 100% accuracy guarantee. We pay penalties for any errors we make.</p>
            <p className="text-slate-500 text-sm max-w-xl mx-auto mb-6">
              We invest in continuous professional education, use the latest tax software,
              and perform multi-level quality reviews on every return before filing.
              Your peace of mind is our top priority.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {[
                "CPA Certified", "Free Consultation", "Accuracy Guaranteed",
                "Year-Round Support", "Audit Protection", "Penalty-Free Promise",
              ].map((item) => (
                <span key={item} className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border" style={{ color: GOLD, borderColor: `${GOLD}33`, background: `${GOLD}0d` }}><CheckCircle size={16} weight="fill" />{item}</span>
              ))}
            </div>
          </div></ShimmerBorder>
        </div>
      </section>

      {/* 14. CONTACT */}
      <section id="contact" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, #1a1a1a 0%, ${ACCENT}20 50%, #1a1a1a 100%)` }} />
        <GraphPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: GOLD, borderColor: `${GOLD}33`, background: `${GOLD}0d` }}>Contact Us</span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6 text-white">Schedule a Consultation</h2>
              <p className="text-slate-400 leading-relaxed mb-8">Ready to take control of your finances? Contact {data.businessName} for a free, no-obligation consultation.</p>
              <div className="space-y-5">
                <div className="flex items-start gap-4"><div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: ACCENT_GLOW }}><MapPin size={20} weight="duotone" style={{ color: GOLD }} /></div><div><p className="text-sm font-semibold text-white">Address</p><MapLink address={data.address} className="text-sm text-slate-400" /></div></div>
                <div className="flex items-start gap-4"><div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: ACCENT_GLOW }}><Phone size={20} weight="duotone" style={{ color: GOLD }} /></div><div><p className="text-sm font-semibold text-white">Phone</p><PhoneLink phone={data.phone} className="text-sm text-slate-400" /></div></div>
                {data.hours && <div className="flex items-start gap-4"><div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: ACCENT_GLOW }}><Clock size={20} weight="duotone" style={{ color: GOLD }} /></div><div><p className="text-sm font-semibold text-white">Hours</p><p className="text-sm text-slate-400 whitespace-pre-line">{data.hours}</p></div></div>}
              </div>
            </div>
            <GlassCard className="p-8">
              <h3 className="text-xl font-semibold text-white mb-6">Request Free Consultation</h3>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className="block text-sm text-slate-400 mb-1.5">First Name</label><input type="text" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 focus:outline-none text-sm" placeholder="John" /></div>
                  <div><label className="block text-sm text-slate-400 mb-1.5">Last Name</label><input type="text" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 focus:outline-none text-sm" placeholder="Doe" /></div>
                </div>
                <div><label className="block text-sm text-slate-400 mb-1.5">Phone</label><input type="tel" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 focus:outline-none text-sm" placeholder="(555) 123-4567" /></div>
                <div><label className="block text-sm text-slate-400 mb-1.5">Service Needed</label><select className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white focus:outline-none text-sm"><option value="" className="bg-neutral-900">Select a service</option>{data.services.map((s) => <option key={s.name} value={s.name.toLowerCase().replace(/\s+/g, "-")} className="bg-neutral-900">{s.name}</option>)}</select></div>
                <div><label className="block text-sm text-slate-400 mb-1.5">Message</label><textarea rows={4} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 focus:outline-none text-sm resize-none" placeholder="Tell us about your financial needs..." /></div>
                <MagneticButton className="w-full py-4 rounded-xl text-base font-semibold text-black flex items-center justify-center gap-2 cursor-pointer" style={{ background: GOLD } as React.CSSProperties}>Send Request <ArrowRight size={18} weight="bold" /></MagneticButton>
              </form>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* 15. FOOTER */}
      <footer className="relative z-10 border-t border-white/8 py-10 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #111 100%)" }} />
        <GraphPattern opacity={0.015} accent={ACCENT} />
        <div className="mx-auto max-w-6xl px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div><div className="flex items-center gap-2 mb-3"><ChartLineUp size={22} weight="fill" style={{ color: GOLD }} /><span className="text-lg font-bold text-white">{data.businessName}</span></div><p className="text-sm text-slate-500 leading-relaxed">{data.about.length > 120 ? data.about.slice(0, 120).trim() + "..." : data.about}</p></div>
            <div><h4 className="text-sm font-semibold text-white mb-3">Quick Links</h4><div className="space-y-2">{["Services", "About", "Results", "Contact"].map((link) => <a key={link} href={`#${link.toLowerCase()}`} className="block text-sm text-slate-500 hover:text-white transition-colors">{link}</a>)}</div></div>
            <div><h4 className="text-sm font-semibold text-white mb-3">Contact</h4><div className="space-y-2 text-sm text-slate-500"><p><PhoneLink phone={data.phone} /></p><p><MapLink address={data.address} /></p>{data.socialLinks && Object.entries(data.socialLinks).map(([platform, url]) => <a key={platform} href={url} target="_blank" rel="noopener noreferrer" className="block hover:text-white transition-colors capitalize">{platform}</a>)}</div></div>
          </div>
          <div className="border-t border-white/8 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-500"><ChartLineUp size={14} weight="fill" style={{ color: GOLD }} /><span>{data.businessName} &copy; {new Date().getFullYear()}</span></div>
            <div className="flex items-center gap-2 text-xs text-slate-600"><BluejayLogo className="w-4 h-4" /><span>Created by <a href="https://bluejayportfolio.com" target="_blank" rel="noopener noreferrer" style={{textDecoration:"underline"}}>bluejayportfolio.com</a></span></div>
          </div>
        </div>
      </footer>

      <ClaimBanner businessName={data.businessName} accentColor={GOLD} prospectId={data.id} />
      <div className="h-14 md:h-28" />
    </main>
  );
}
