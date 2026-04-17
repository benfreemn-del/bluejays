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
  FirstAid,
  Heartbeat,
  Stethoscope,
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
  Users,
  Syringe,
  Pill,
  Thermometer,
  UserCircle,
} from "@phosphor-icons/react";
import type { GeneratedSiteData } from "@/lib/generator";
import BluejayLogo from "../BluejayLogo";
import { pickFromPool, pickGallery } from "@/lib/stock-image-picker";
import { MapLink, PhoneLink } from "@/components/templates/MapLink";
import ClaimBanner from "@/components/ClaimBanner";

const spring = { type: "spring" as const, stiffness: 100, damping: 20 };
const springFast = { type: "spring" as const, stiffness: 200, damping: 25 };

const CHARCOAL = "#1a1a1a";
const DEFAULT_TEAL = "#0891b2";
const TEAL_LIGHT = "#22d3ee";
const MINT = "#34d399";

function getAccent(accentColor?: string) {
  const c = accentColor || DEFAULT_TEAL;
  return { ACCENT: c, ACCENT_GLOW: `${c}26`, ACCENT_LIGHT: TEAL_LIGHT, MINT };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SERVICE_ICON_MAP: Record<string, any> = {
  primary: FirstAid, family: Users, pediatric: UserCircle, emergency: FirstAid,
  cardio: Heartbeat, heart: Heartbeat, physical: Stethoscope, checkup: Stethoscope,
  vaccination: Syringe, vaccine: Syringe, injection: Syringe,
  prescription: Pill, pharmacy: Pill, medication: Pill,
  urgent: Thermometer, wellness: Heartbeat, diagnostic: Stethoscope,
};

function getServiceIcon(serviceName: string) {
  const lower = serviceName.toLowerCase();
  for (const [key, Icon] of Object.entries(SERVICE_ICON_MAP)) { if (lower.includes(key)) return Icon; }
  return FirstAid;
}

const STOCK_HERO_POOL = ["https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1400&q=80"];
const STOCK_ABOUT_POOL = ["https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&q=80"];
const STOCK_GALLERY = [
  "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=600&q=80",
  "https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?w=600&q=80",
  "https://images.unsplash.com/photo-1666214280557-f1b5022eb634?w=600&q=80",
  "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&q=80",
];

function FloatingParticles({ accent }: { accent: string }) {
  const particles = Array.from({ length: 18 }, (_, i) => ({
    id: i, x: Math.random() * 100, delay: Math.random() * 8, duration: 6 + Math.random() * 7,
    size: 2 + Math.random() * 3, opacity: 0.12 + Math.random() * 0.25, isMint: Math.random() > 0.6,
  }));
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden hidden md:block">
      {particles.map((p) => (
        <motion.div key={p.id} className="absolute rounded-full" style={{ left: `${p.x}%`, width: p.size, height: p.size, background: p.isMint ? MINT : accent, willChange: "transform, opacity" }}
          animate={{ y: ["-10vh", "110vh"], opacity: [0, p.opacity, p.opacity, 0] }}
          transition={{ y: { duration: p.duration, repeat: Infinity, delay: p.delay, ease: "linear" }, opacity: { duration: p.duration, repeat: Infinity, delay: p.delay, times: [0, 0.1, 0.9, 1] } }}
        />
      ))}
    </div>
  );
}

function MedicalCrossPattern({ opacity = 0.03, accent }: { opacity?: number; accent: string }) {
  const patternId = `medCrossV2-${accent.replace("#", "")}`;
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }}>
      <defs>
        <pattern id={patternId} width="80" height="80" patternUnits="userSpaceOnUse">
          <rect x="35" y="20" width="10" height="40" rx="2" fill={accent} opacity="0.3" />
          <rect x="20" y="35" width="40" height="10" rx="2" fill={accent} opacity="0.3" />
          <circle cx="10" cy="10" r="1.5" fill={accent} opacity="0.2" />
          <circle cx="70" cy="70" r="1.5" fill={accent} opacity="0.2" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  );
}

function PulseLineBackground({ opacity = 0.03, accent }: { opacity?: number; accent: string }) {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }} viewBox="0 0 1000 200" preserveAspectRatio="none">
      <motion.path d="M0 100 L200 100 L220 40 L240 160 L260 80 L280 120 L300 100 L1000 100" fill="none" stroke={accent} strokeWidth="2" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} />
      <motion.path d="M0 100 L500 100 L520 50 L540 150 L560 70 L580 130 L600 100 L1000 100" fill="none" stroke={MINT} strokeWidth="1" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1.5 }} />
    </svg>
  );
}

function HeroDecor({ accent }: { accent: string }) {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1200 800" preserveAspectRatio="none" style={{ opacity: 0.05 }}>
      <rect x="150" y="300" width="60" height="200" rx="8" fill="none" stroke={accent} strokeWidth="1" />
      <rect x="100" y="375" width="160" height="50" rx="8" fill="none" stroke={accent} strokeWidth="1" />
      <rect x="950" y="250" width="50" height="160" rx="8" fill="none" stroke={MINT} strokeWidth="0.8" />
      <rect x="910" y="310" width="130" height="40" rx="8" fill="none" stroke={MINT} strokeWidth="0.8" />
      <circle cx="600" cy="400" r="80" fill="none" stroke={accent} strokeWidth="0.5" strokeDasharray="5 5" />
    </svg>
  );
}

function GlassCard({ children, className = "", style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return <div className={`rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] ${className}`}>{children}</div>;
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
      <motion.div className="absolute inset-0 rounded-2xl" style={{ background: `conic-gradient(from 0deg, transparent, ${accent}, transparent, ${MINT}, transparent)`, willChange: "transform" }} animate={{ rotate: [0, 360] }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} />
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
      <AnimatePresence initial={false}>{isOpen && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={spring} className="overflow-hidden"><p className="px-5 pb-5 md:px-6 md:pb-6 text-slate-400 leading-relaxed">{answer}</p></motion.div>)}</AnimatePresence>
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
      initial={{ opacity: 1, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: "easeOut" as const }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function V2MedicalPreview({ data }: { data: GeneratedSiteData }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const { ACCENT, ACCENT_GLOW } = getAccent(data.accentColor);
  const uniquePhotos = data.photos ? [...new Set(data.photos)] : [];

  const heroImage = uniquePhotos[0] || pickFromPool(STOCK_HERO_POOL, data.businessName);

  const heroCardImage = uniquePhotos[1] || pickFromPool(STOCK_ABOUT_POOL, data.businessName, 1);

  const aboutImage = uniquePhotos[2] || pickFromPool(STOCK_ABOUT_POOL, data.businessName, 2);
  const galleryImages = data.photos?.length > 2 ? data.photos.slice(2, 6) : pickGallery(STOCK_GALLERY, data.businessName);
  const phoneDigits = data.phone.replace(/\D/g, "");

  const processSteps = [
    { step: "01", title: "Schedule Appointment", desc: "Call or book online. We offer same-day and next-day appointments for your convenience." },
    { step: "02", title: "Meet Your Doctor", desc: "Our caring physicians take the time to listen, examine, and understand your unique health needs." },
    { step: "03", title: "Personalized Treatment", desc: "Receive a customized treatment plan backed by the latest evidence-based medicine." },
    { step: "04", title: "Ongoing Care", desc: "We follow up to ensure your recovery and provide continuous preventive care for lasting health." },
  ];

  const faqs = [
    { q: `What services does ${data.businessName} offer?`, a: `We provide a comprehensive range of medical services including ${data.services.slice(0, 3).map(s => s.name).join(", ")}, and more. Contact us to learn about all our offerings.` },
    { q: "Do you accept insurance?", a: "Yes, we accept most major insurance plans. Please contact our office to verify your specific coverage before your visit." },
    { q: "How do I schedule an appointment?", a: `You can schedule an appointment by calling us directly or booking online through our website. ${data.businessName} offers same-day appointments for urgent needs.` },
    { q: "Are you accepting new patients?", a: `Absolutely! ${data.businessName} is currently accepting new patients of all ages. We look forward to becoming your trusted healthcare partner.` },
    { q: "Do you offer telehealth appointments?", a: "Yes, we offer secure HIPAA-compliant video visits for many types of appointments including follow-ups, medication management, and minor illness consultations." },
    { q: "What should I bring to my first visit?", a: "Please bring your insurance card, photo ID, a list of current medications, and any relevant medical records. Arrive 15 minutes early to complete paperwork." },
    { q: "Do you offer same-day appointments?", a: `Yes, ${data.businessName} reserves slots for same-day and urgent care needs. Call us in the morning for the best availability.` },
    { q: "What are your office hours?", a: data.hours ? `Our current hours are: ${data.hours}. We recommend calling ahead for holiday schedule changes.` : "Please call our office for current hours and availability." },
  ];

  /* Fallback testimonials */
  const fallbackTestimonials = [
    { name: "George T.", text: "Dr. actually listens and takes time with every visit. Rare to find that kind of care these days.", rating: 5 },
    { name: "Helen M.", text: "The whole staff is friendly and efficient. Never wait more than a few minutes for my appointment.", rating: 5 },
    { name: "Arthur S.", text: "They caught something my previous doctor missed. Thorough, caring, and truly dedicated.", rating: 5 }
  ];
  const testimonials = data.testimonials?.length > 0 ? data.testimonials : fallbackTestimonials;

  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden" style={{ fontFamily: "Open Sans, system-ui, sans-serif", background: CHARCOAL, color: "#f1f5f9" }}>
      <FloatingParticles accent={ACCENT} />

      {/* 1. NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-4">
          <GlassCard className="flex items-center justify-between px-4 md:px-6 py-3">
            <div className="flex items-center gap-2"><FirstAid size={24} weight="fill" style={{ color: ACCENT }} /><span className="text-lg font-bold tracking-tight text-white">{data.businessName}</span></div>
            <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
              <a href="#services" className="hover:text-white transition-colors">Services</a>
              <a href="#about" className="hover:text-white transition-colors">About</a>
              <a href="#team" className="hover:text-white transition-colors">Our Team</a>
              <a href="#contact" className="hover:text-white transition-colors">Contact</a>
            </div>
            <div className="flex items-center gap-3">
              <MagneticButton className="px-4 md:px-5 py-2 rounded-full text-sm font-semibold text-white transition-colors cursor-pointer" style={{ background: ACCENT } as React.CSSProperties}>Book Appointment</MagneticButton>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors">{mobileMenuOpen ? <X size={24} /> : <List size={24} />}</button>
            </div>
          </GlassCard>
          <AnimatePresence>{mobileMenuOpen && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3, ease: "easeInOut" }} className="md:hidden mt-2 overflow-hidden"><GlassCard className="flex flex-col gap-1 px-4 py-4">{[{ label: "Services", href: "#services" }, { label: "About", href: "#about" }, { label: "Our Team", href: "#team" }, { label: "Contact", href: "#contact" }].map((link) => <a key={link.label} href={link.href} onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors">{link.label}</a>)}</GlassCard></motion.div>)}</AnimatePresence>
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
          <div className="space-y-8 rounded-2xl bg-black/50 backdrop-blur-md p-6 md:p-8 border border-white/5">
            <div>
              <p className="text-sm uppercase tracking-widest mb-4" style={{ color: ACCENT }}>Compassionate Healthcare</p>
              <h1 className="text-3xl md:text-6xl tracking-tighter leading-none font-bold text-white" style={{ textShadow: "0 2px 20px rgba(0,0,0,0.8), 0 4px 40px rgba(0,0,0,0.5)" }}>{data.tagline}</h1>
            </div>
            <p className="text-lg text-slate-400 max-w-md leading-relaxed">{(() => { const t = data.about; if (t.length <= 180) return t; const dot = t.indexOf('.', 80); return dot > 0 && dot < 220 ? t.slice(0, dot + 1) : t.slice(0, 180).trim() + '...'; })()}</p>
            <div className="flex flex-wrap gap-4">
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white flex items-center gap-2 cursor-pointer" style={{ background: ACCENT } as React.CSSProperties}>Book Appointment <ArrowRight size={18} weight="bold" /></MagneticButton>
              <MagneticButton href={`tel:${phoneDigits}`} className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/10 flex items-center gap-2 cursor-pointer"><Phone size={18} weight="duotone" /> <PhoneLink phone={data.phone} /></MagneticButton>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-slate-400">
              <span className="flex items-center gap-2"><MapPin size={16} weight="duotone" style={{ color: ACCENT }} /><MapLink address={data.address} /></span>
              <span className="flex items-center gap-2"><Clock size={16} weight="duotone" style={{ color: ACCENT }} />Accepting New Patients</span>
            </div>
          </div>
          <div className="hidden md:block relative">
            <div className="relative rounded-2xl overflow-hidden border border-white/10">
              <img src={heroCardImage} alt={`${data.businessName} medical facility`} className="w-full h-[500px] object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-transparent to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#1a1a1a]/40 to-transparent" />
              <div className="absolute bottom-6 left-6 flex items-center gap-3">
                <div className="px-4 py-2 rounded-full backdrop-blur-md bg-black/50 border flex items-center gap-2" style={{ borderColor: `${ACCENT}4d` }}><ShieldCheck size={18} weight="fill" style={{ color: ACCENT }} /><span className="text-sm font-semibold text-white">Board Certified</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. STATS */}
      <section className="relative z-10 py-16 overflow-hidden border-y" style={{ borderColor: `${ACCENT}1a` }}>
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #0f1517 0%, #1a1a1a 100%)" }} />
        <MedicalCrossPattern opacity={0.02} accent={ACCENT} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] rounded-full blur-[180px]" style={{ background: `${ACCENT}08` }} /></div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {data.stats.map((stat, i) => { const statIcons = [Users, Heartbeat, ShieldCheck, Star]; const Icon = statIcons[i % statIcons.length]; return (<div key={stat.label} className="text-center"><div className="flex items-center justify-center gap-2 mb-2"><Icon size={22} weight="fill" style={{ color: ACCENT }} /><span className="text-3xl md:text-4xl font-extrabold text-white">{stat.value}</span></div><span className="text-slate-500 text-sm font-medium tracking-wide uppercase">{stat.label}</span></div>); })}
          </div>
        </div>
      </section>

      {/* 4. SERVICES */}
      <section id="services" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0f1517 50%, #1a1a1a 100%)" }} />
        <MedicalCrossPattern accent={ACCENT} />
        <PulseLineBackground opacity={0.025} accent={ACCENT} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[10%] right-[5%] w-[500px] h-[500px] rounded-full blur-[160px]" style={{ background: `${ACCENT}08` }} /><div className="absolute bottom-[10%] left-[5%] w-[400px] h-[400px] rounded-full blur-[140px]" style={{ background: `${MINT}05` }} /></div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Our Services" title="Comprehensive Medical Care" subtitle={`${data.businessName} provides trusted, patient-centered healthcare for the whole family.`} accent={ACCENT} />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.services.map((service, i) => { const Icon = getServiceIcon(service.name); return (
              <div key={service.name} className="group relative p-7 rounded-2xl border border-white/[0.06] hover:border-opacity-30 transition-all duration-500 overflow-hidden bg-white/[0.02]">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: `radial-gradient(circle at 50% 0%, ${ACCENT}15, transparent 70%)` }} />
                <div className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `linear-gradient(to right, transparent, ${ACCENT}4d, transparent)` }} />
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-5"><div className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 border" style={{ background: ACCENT_GLOW, borderColor: `${ACCENT}33` }}><Icon size={24} weight="duotone" style={{ color: ACCENT }} /></div><span className="text-xs font-mono text-slate-600">{String(i + 1).padStart(2, "0")}</span></div>
                  <h3 className="text-lg font-bold text-white mb-2">{service.name}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{service.description || ""}</p>
                  {service.price && <p className="text-sm font-semibold mt-3" style={{ color: ACCENT }}>{service.price}</p>}
                </div>
              </div>
            ); })}
          </div>
        </div>
      </section>

      {/* 4b. INSURANCE ACCEPTED BADGES */}
      <section className="relative z-10 py-16 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #141414 0%, #1a1a1a 100%)" }} />
        <MedicalCrossPattern opacity={0.015} accent={ACCENT} />
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <div className="text-center mb-10">
            <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-3 px-4 py-1.5 rounded-full border" style={{ color: ACCENT, borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}>Insurance</span>
            <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight text-white">Insurance We Accept</h2>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {["Most Major Insurance", "Medicare", "Medicaid", "Blue Cross", "Aetna", "Cigna", "United Healthcare", "Humana", "Payment Plans Available"].map((badge) => (
              <div key={badge} className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-sm text-sm font-medium text-white">
                <ShieldCheck size={18} weight="duotone" style={{ color: ACCENT }} />
                {badge}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4c. TELEHEALTH & PATIENT PORTAL */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0f1517 50%, #1a1a1a 100%)" }} />
        <PulseLineBackground opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Convenience" title="Modern Healthcare Access" accent={ACCENT} />
          <div className="grid md:grid-cols-2 gap-6">
            <GlassCard className="p-8">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-5" style={{ background: ACCENT_GLOW, border: `1px solid ${ACCENT}33` }}>
                <Stethoscope size={28} weight="duotone" style={{ color: ACCENT }} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Telehealth Available</h3>
              <p className="text-slate-400 leading-relaxed mb-4">See your doctor from the comfort of home. Virtual visits available for follow-ups, consultations, and minor health concerns.</p>
              <div className="flex flex-wrap gap-2">
                {["Video Visits", "Secure Platform", "Prescription Refills", "Follow-Up Care"].map((f) => (
                  <span key={f} className="text-xs px-3 py-1.5 rounded-full border border-white/10 text-slate-300">{f}</span>
                ))}
              </div>
            </GlassCard>
            <GlassCard className="p-8">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-5" style={{ background: `${MINT}26`, border: `1px solid ${MINT}33` }}>
                <UserCircle size={28} weight="duotone" style={{ color: MINT }} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Patient Portal</h3>
              <p className="text-slate-400 leading-relaxed mb-4">Access your medical records, lab results, and appointment scheduling online 24/7 through our secure patient portal.</p>
              <div className="flex flex-wrap gap-2">
                {["View Records", "Book Online", "Message Providers", "Pay Bills"].map((f) => (
                  <span key={f} className="text-xs px-3 py-1.5 rounded-full border border-white/10 text-slate-300">{f}</span>
                ))}
              </div>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* 5. ABOUT */}
      <section id="about" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0c1214 50%, #1a1a1a 100%)" }} />
        <PulseLineBackground opacity={0.02} accent={ACCENT} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[20%] left-[10%] w-[500px] h-[500px] rounded-full blur-[180px]" style={{ background: `${ACCENT}06` }} /></div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="relative">
              <div className="rounded-2xl overflow-hidden border border-white/10"><img src={aboutImage} alt={`${data.businessName} facility`} className="w-full h-[400px] object-cover" /></div>
              <div className="absolute -bottom-4 -right-4 md:bottom-6 md:-right-6"><div className="px-5 py-3 rounded-xl backdrop-blur-md border text-white font-bold text-sm shadow-lg" style={{ background: `${ACCENT}e6`, borderColor: `${ACCENT}80` }}>{data.stats[0] ? `${data.stats[0].value} ${data.stats[0].label}` : "Trusted Care"}</div></div>
            </div>
            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: ACCENT, borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}>About Us</span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6 text-white">Your Trusted Healthcare Partner</h2>
              <p className="text-slate-400 leading-relaxed mb-8">{data.about}</p>
              <div className="grid grid-cols-2 gap-4">
                {[{ icon: ShieldCheck, label: "Board Certified" }, { icon: Heartbeat, label: "Patient-Centered" }, { icon: Star, label: "Top Rated" }, { icon: Clock, label: "Same-Day Visits" }].map((badge) => (
                  <GlassCard key={badge.label} className="p-4 flex items-center gap-3"><div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: ACCENT_GLOW }}><badge.icon size={20} weight="duotone" style={{ color: ACCENT }} /></div><span className="text-sm font-semibold text-white">{badge.label}</span></GlassCard>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. PROCESS */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0f1517 50%, #1a1a1a 100%)" }} />
        <MedicalCrossPattern opacity={0.025} accent={ACCENT} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] rounded-full blur-[180px]" style={{ background: `${MINT}06` }} /></div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <AnimatedSection>          <SectionHeader badge="Your Visit" title="How It Works" accent={ACCENT} /></AnimatedSection>
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

      {/* 7. TEAM / GALLERY */}
      <section id="team" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0c1214 50%, #1a1a1a 100%)" }} />
        <PulseLineBackground opacity={0.02} accent={ACCENT} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[30%] left-[20%] w-[500px] h-[500px] rounded-full blur-[200px]" style={{ background: `${ACCENT}06` }} /></div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Our Facility" title="Modern Healthcare Environment" subtitle="State-of-the-art facilities designed for your comfort and care." accent={ACCENT} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {galleryImages.map((src, i) => { const titles = ["Modern Treatment Rooms", "Advanced Diagnostics", "Comfortable Waiting Area", "Expert Medical Team"]; return (
              <div key={i} className="group relative rounded-2xl overflow-hidden border border-white/[0.06] hover:border-opacity-30 transition-all duration-500">
                <img src={src} alt={titles[i] || `Facility ${i + 1}`} className="w-full h-64 object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6"><h3 className="text-lg font-bold text-white mb-1">{titles[i] || `Facility ${i + 1}`}</h3></div>
              </div>
            ); })}
          </div>
        </div>
      </section>

      {/* 8. TESTIMONIALS */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0f1517 50%, #1a1a1a 100%)" }} />
        <MedicalCrossPattern opacity={0.02} accent={ACCENT} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[20%] right-[15%] w-[400px] h-[400px] rounded-full blur-[160px]" style={{ background: `${ACCENT}06` }} /></div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          {(data.googleRating || data.reviewCount) && (
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm">
                <div className="flex gap-0.5">{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={18} weight="fill" style={{ color: ACCENT }} />)}</div>
                <span className="text-lg font-bold text-white">{data.googleRating || "5.0"}</span>
                {data.reviewCount && <span className="text-sm text-slate-400">({data.reviewCount} reviews)</span>}
              </div>
            </div>
          )}
          <AnimatedSection><SectionHeader badge="Patient Reviews" title="What Our Patients Say" accent={ACCENT} /></AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (<GlassCard key={i} className="p-6 h-full flex flex-col"><div className="flex gap-0.5 mb-4">{Array.from({ length: t.rating || 5 }).map((_, j) => <Star key={j} size={16} weight="fill" style={{ color: ACCENT }} />)}</div><p className="text-slate-300 leading-relaxed flex-1 text-sm mb-4">&ldquo;{t.text}&rdquo;</p><div className="pt-4 border-t border-white/5 flex items-center justify-between"><span className="text-sm font-semibold text-white">{t.name}</span></div></GlassCard>))}
          </div>
        </div>
      </section>

      {/* 8b. SPECIALTIES GRID */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0c1214 50%, #1a1a1a 100%)" }} />
        <MedicalCrossPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Specialties" title="Areas of Expertise" accent={ACCENT} />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: FirstAid, label: "Primary Care" },
              { icon: Heartbeat, label: "Cardiology" },
              { icon: Users, label: "Family Medicine" },
              { icon: UserCircle, label: "Pediatrics" },
              { icon: Syringe, label: "Vaccinations" },
              { icon: Stethoscope, label: "Physicals" },
              { icon: Pill, label: "Prescriptions" },
              { icon: Thermometer, label: "Urgent Care" },
            ].map((item) => (
              <GlassCard key={item.label} className="p-5 text-center">
                <div className="w-10 h-10 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ background: `${ACCENT}15`, border: `1px solid ${ACCENT}22` }}>
                  <item.icon size={20} weight="duotone" style={{ color: ACCENT }} />
                </div>
                <span className="text-sm font-semibold text-white">{item.label}</span>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* 8c. PRICING / NEW PATIENT */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0f1517 50%, #1a1a1a 100%)" }} />
        <PulseLineBackground opacity={0.02} accent={ACCENT} />
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Pricing" title="Transparent Healthcare" subtitle="We believe in upfront pricing. No surprise bills." accent={ACCENT} />
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "New Patient Visit", price: "$150", desc: "Comprehensive exam, health history review, personalized care plan", features: ["Full Physical Exam", "Lab Work Review", "Health Assessment", "Care Plan Creation"] },
              { name: "Follow-Up Visit", price: "$95", desc: "Review results, adjust treatments, ongoing health management", features: ["Progress Review", "Treatment Adjustment", "Prescription Refills", "Health Coaching"], popular: true },
              { name: "Telehealth Visit", price: "$75", desc: "Virtual consultation for follow-ups and minor health concerns", features: ["Video Consultation", "Prescription Refills", "Lab Orders", "Secure Messaging"] },
            ].map((tier) => (
              <GlassCard key={tier.name} className={`p-8 ${tier.popular ? "ring-1" : ""}`} style={tier.popular ? { borderColor: ACCENT } : undefined}>
                {tier.popular && <div className="text-center mb-4"><span className="px-4 py-1 rounded-full text-xs font-bold text-white" style={{ background: ACCENT }}>Most Common</span></div>}
                <h3 className="text-xl font-bold text-white mb-1">{tier.name}</h3>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-extrabold" style={{ color: ACCENT }}>{tier.price}</span>
                </div>
                <p className="text-sm text-slate-400 mb-6">{tier.desc}</p>
                <ul className="space-y-3 mb-8">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                      <CheckCircle size={16} weight="fill" style={{ color: ACCENT }} /> {f}
                    </li>
                  ))}
                </ul>
                <MagneticButton className={`w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer ${tier.popular ? "text-white" : "text-white border border-white/10"}`} style={tier.popular ? { background: ACCENT } as React.CSSProperties : undefined}>
                  Book Now <ArrowRight size={16} weight="bold" />
                </MagneticButton>
              </GlassCard>
            ))}
          </div>
          <p className="text-center text-xs text-slate-500 mt-6">Most insurance plans accepted. Self-pay rates shown above. Payment plans available.</p>
        </div>
      </section>

      {/* 8d. HEALTH QUIZ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0c1214 50%, #1a1a1a 100%)" }} />
        <MedicalCrossPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Get Started" title="When Was Your Last Checkup?" subtitle="Regular checkups prevent bigger health issues down the road." accent={ACCENT} />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "Less Than a Year", color: "#10b981", rec: "Great! Keep up with annual wellness visits." },
              { label: "1-3 Years Ago", color: "#f59e0b", rec: "Time for a checkup. Schedule your visit today." },
              { label: "3+ Years / Never", color: "#ef4444", rec: "Don't wait. Book a comprehensive exam now." },
            ].map((opt) => (
              <GlassCard key={opt.label} className="p-6 text-center hover:border-white/20 transition-all cursor-pointer">
                <div className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: `${opt.color}15`, border: `1px solid ${opt.color}33` }}>
                  <Heartbeat size={22} weight="duotone" style={{ color: opt.color }} />
                </div>
                <h4 className="text-sm font-bold text-white mb-2">{opt.label}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{opt.rec}</p>
              </GlassCard>
            ))}
          </div>
          <div className="text-center mt-8">
            <PhoneLink phone={data.phone} className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-white font-semibold" style={{ background: ACCENT }}>
              <Phone size={20} weight="fill" /> Schedule Your Checkup
            </PhoneLink>
          </div>
        </div>
      </section>

      {/* 9. CTA */}
      <section className="relative z-10 py-20 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT}cc, ${ACCENT})` }} />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='40' height='40' fill='none'/%3E%3Cpath d='M0 0L40 40M40 0L0 40' stroke='%23000' stroke-width='0.5'/%3E%3C/svg%3E\")" }} />
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <Heartbeat size={48} weight="fill" className="mx-auto mb-6 text-white/70" />
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-4">Your Health Is Our Priority</h2>
          <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">Schedule your appointment today. New patients welcome — experience the difference of personalized, compassionate care.</p>
          <PhoneLink phone={data.phone} className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-white text-black font-bold text-lg hover:bg-white/90 transition-colors"><Phone size={22} weight="fill" /> Call {data.phone}</PhoneLink>
        </div>
      </section>

      {/* 10. SERVICE AREAS */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0c1214 50%, #1a1a1a 100%)" }} />
        <MedicalCrossPattern opacity={0.02} accent={ACCENT} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[40%] right-[20%] w-[400px] h-[400px] rounded-full blur-[180px]" style={{ background: `${MINT}06` }} /></div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <AnimatedSection>          <SectionHeader badge="Location" title="Visit Our Office" accent={ACCENT} /></AnimatedSection>
          <div className="text-center mb-8"><GlassCard className="p-8 inline-block"><div className="flex items-center gap-3 text-lg"><MapPin size={24} weight="duotone" style={{ color: ACCENT }} /><MapLink address={data.address} className="text-white font-semibold" /></div><div className="flex items-center gap-2 mt-3 justify-center"><div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /><span className="text-sm text-emerald-400 font-medium">Accepting New Patients</span></div></GlassCard></div>
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {(data.serviceAreas || [data.address?.split(",")[0] || "Local Area"]).map((area: string) => (
              <span key={area} className="px-4 py-2 rounded-full text-xs font-medium border" style={{ color: ACCENT, borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}>
                {area}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
            <GlassCard className="p-4 text-center">
              <MapPin size={20} weight="duotone" style={{ color: ACCENT }} className="mx-auto mb-2" />
              <p className="text-sm font-semibold text-white">Convenient Location</p>
              <p className="text-xs text-slate-500">Free parking available</p>
            </GlassCard>
            <GlassCard className="p-4 text-center">
              <Clock size={20} weight="duotone" style={{ color: ACCENT }} className="mx-auto mb-2" />
              <p className="text-sm font-semibold text-white">Minimal Wait Times</p>
              <p className="text-xs text-slate-500">We respect your schedule</p>
            </GlassCard>
            <GlassCard className="p-4 text-center">
              <FirstAid size={20} weight="duotone" style={{ color: ACCENT }} className="mx-auto mb-2" />
              <p className="text-sm font-semibold text-white">Walk-Ins Welcome</p>
              <p className="text-xs text-slate-500">Same-day availability</p>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* 11. HOURS */}
      {data.hours && (
        <section className="relative z-10 py-24 md:py-32 overflow-hidden">
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0f1517 50%, #1a1a1a 100%)" }} />
          <PulseLineBackground opacity={0.02} accent={ACCENT} />
          <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[20%] left-[15%] w-[400px] h-[400px] rounded-full blur-[160px]" style={{ background: `${ACCENT}06` }} /></div>
          <div className="max-w-3xl mx-auto px-6 relative z-10">
            <AnimatedSection>          <SectionHeader badge="Office Hours" title="When We're Available" accent={ACCENT} /></AnimatedSection>
            <div className="text-center"><ShimmerBorder accent={ACCENT}><div className="p-8"><Clock size={32} weight="duotone" style={{ color: ACCENT }} className="mx-auto mb-4" /><p className="text-slate-300 leading-relaxed whitespace-pre-line text-lg">{data.hours}</p><p className="text-sm mt-4 font-semibold" style={{ color: ACCENT }}>Walk-ins Welcome</p></div></ShimmerBorder></div>
          </div>
        </section>
      )}

      {/* 11b. NEW PATIENT PROCESS */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0c1214 50%, #1a1a1a 100%)" }} />
        <MedicalCrossPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <SectionHeader badge="New Patients" title="Welcome to Our Practice" subtitle="We make your first visit easy and comfortable." accent={ACCENT} />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: "01", title: "Call or Book Online", desc: "Schedule your first appointment by phone or through our patient portal." },
              { step: "02", title: "Complete Paperwork", desc: "Fill out forms online before your visit to save time." },
              { step: "03", title: "Meet Your Provider", desc: "Your doctor will review your history and discuss your health goals." },
              { step: "04", title: "Begin Your Care", desc: "Receive a personalized care plan tailored to your needs." },
            ].map((step, i) => (
              <div key={step.step} className="relative">
                {i < 3 && <div className="hidden lg:block absolute top-10 left-[calc(50%+40px)] w-[calc(100%-80px)] h-px" style={{ background: `linear-gradient(to right, ${ACCENT}33, ${ACCENT}11)` }} />}
                <GlassCard className="p-6 text-center">
                  <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center text-xl font-black" style={{ background: `linear-gradient(135deg, ${ACCENT}22, ${ACCENT}0a)`, color: ACCENT, border: `1px solid ${ACCENT}33` }}>{step.step}</div>
                  <h3 className="text-base font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
                </GlassCard>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 11c. COMPETITOR COMPARISON */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0f1517 50%, #1a1a1a 100%)" }} />
        <PulseLineBackground opacity={0.02} accent={ACCENT} />
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Why Us" title={`${data.businessName} vs. Average Practice`} accent={ACCENT} />
          <GlassCard className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-4 font-semibold text-white">Feature</th>
                    <th className="text-center p-4 font-semibold" style={{ color: ACCENT }}>{data.businessName}</th>
                    <th className="text-center p-4 font-semibold text-slate-500">Others</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { feature: "Same-Day Appointments", us: true, them: "1-2 Weeks" },
                    { feature: "Telehealth Available", us: true, them: "No" },
                    { feature: "Patient Portal", us: true, them: "Limited" },
                    { feature: "Evening Hours", us: true, them: "No" },
                    { feature: "Most Insurance Accepted", us: true, them: "Select Plans" },
                    { feature: "Board-Certified Providers", us: true, them: "Varies" },
                    { feature: "New Patients Welcome", us: true, them: "Waitlist" },
                  ].map((row, i) => (
                    <tr key={row.feature} className={i % 2 === 0 ? "bg-white/[0.02]" : ""}>
                      <td className="p-4 text-slate-300 font-medium">{row.feature}</td>
                      <td className="p-4 text-center"><CheckCircle size={20} weight="fill" style={{ color: ACCENT }} className="mx-auto" /></td>
                      <td className="p-4 text-center text-slate-500">{row.them}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* 11d. VIDEO PLACEHOLDER */}
      <section className="relative z-10 py-20 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #141414 100%)" }} />
        <MedicalCrossPattern opacity={0.015} accent={ACCENT} />
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <div className="text-center mb-8">
            <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-3 px-4 py-1.5 rounded-full border" style={{ color: ACCENT, borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}>Tour</span>
            <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight text-white">Take a Virtual Tour</h2>
          </div>
          <div className="relative rounded-2xl overflow-hidden border border-white/10 aspect-video flex items-center justify-center" style={{ background: "rgba(0,0,0,0.3)" }}>
            <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20 cursor-pointer hover:bg-white/20 transition-colors">
              <div className="w-0 h-0 border-l-[18px] border-l-white border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent ml-1.5" />
            </div>
            <p className="absolute bottom-6 text-white/40 text-sm font-medium">Tour Our Modern Facility</p>
          </div>
        </div>
      </section>

      {/* 11e. URGENCY */}
      <section className="relative z-10 py-16 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #141414 0%, #1a1a1a 100%)" }} />
        <PulseLineBackground opacity={0.015} accent={ACCENT} />
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <GlassCard className="p-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="relative">
                <div className="w-3 h-3 rounded-full" style={{ background: "#10b981" }} />
                <div className="absolute inset-0 w-3 h-3 rounded-full animate-ping" style={{ background: "#10b981", opacity: 0.4 }} />
              </div>
              <span className="text-sm font-bold uppercase tracking-wider" style={{ color: "#10b981" }}>Accepting New Patients</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Same-Day Appointments Available</h3>
            <p className="text-slate-400 mb-6">Do not wait weeks to see a doctor. {data.businessName} offers same-day and next-day appointments for new and existing patients.</p>
            <PhoneLink phone={data.phone} className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-white font-semibold" style={{ background: ACCENT }}>
              <Phone size={20} weight="fill" /> Schedule Today
            </PhoneLink>
          </GlassCard>
        </div>
      </section>

      {/* 11f. WHY CHOOSE US */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0c1214 50%, #1a1a1a 100%)" }} />
        <PulseLineBackground opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Our Difference" title="Why Choose Us" accent={ACCENT} />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Heartbeat, title: "Patient-Centered", desc: "Your health goals drive every decision we make. We listen first, treat second." },
              { icon: Stethoscope, title: "Board Certified", desc: "Our providers hold the highest certifications and pursue ongoing education." },
              { icon: Clock, title: "Same-Day Visits", desc: "Urgent needs cannot wait. We keep slots open for same-day appointments." },
              { icon: ShieldCheck, title: "All Ages Welcome", desc: "From pediatric to geriatric care, we serve every member of your family." },
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

      {/* 11g. PATIENT RESOURCES */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0f1517 50%, #1a1a1a 100%)" }} />
        <MedicalCrossPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Resources" title="Patient Resources" subtitle="We believe informed patients make the best health decisions." accent={ACCENT} />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "New Patient Forms", desc: "Download and complete your paperwork before your visit to save time and get started faster.", icon: FirstAid },
              { title: "Insurance & Billing", desc: "We accept most major insurance plans and offer transparent billing with no surprises. Payment plans available.", icon: ShieldCheck },
              { title: "Prescription Refills", desc: "Request prescription refills easily through our patient portal or by calling our office during business hours.", icon: Pill },
              { title: "Lab Results", desc: "Access your lab results securely through our online patient portal. We will notify you when results are ready.", icon: Thermometer },
              { title: "Referral Requests", desc: "Need to see a specialist? We coordinate referrals and help you find the right provider for your needs.", icon: Users },
              { title: "Health Education", desc: "Browse our library of patient education materials covering prevention, wellness, and chronic condition management.", icon: Stethoscope },
            ].map((item) => (
              <GlassCard key={item.title} className="p-6">
                <div className="w-12 h-12 rounded-xl mb-4 flex items-center justify-center" style={{ background: `${ACCENT}15`, border: `1px solid ${ACCENT}22` }}>
                  <item.icon size={24} weight="duotone" style={{ color: ACCENT }} />
                </div>
                <h4 className="text-base font-bold text-white mb-2">{item.title}</h4>
                <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* 11g. INSURANCE DETAIL */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0c1214 50%, #1a1a1a 100%)" }} />
        <PulseLineBackground opacity={0.02} accent={ACCENT} />
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Coverage" title="Insurance & Payment Options" subtitle="We work with you to make healthcare affordable and accessible." accent={ACCENT} />
          <div className="grid md:grid-cols-2 gap-8">
            <GlassCard className="p-8">
              <h3 className="text-xl font-bold text-white mb-4">Accepted Insurance Plans</h3>
              <div className="flex flex-wrap gap-2 mb-6">
                {["Blue Cross", "Aetna", "Cigna", "United", "Medicare", "Medicaid", "Humana", "Kaiser"].map((plan) => (
                  <span key={plan} className="px-3 py-1.5 rounded-full text-xs font-medium border" style={{ color: ACCENT, borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}>
                    {plan}
                  </span>
                ))}
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">Do not see your plan? Contact us to verify your coverage. We accept most major insurance carriers and will help with claims processing.</p>
            </GlassCard>
            <GlassCard className="p-8">
              <h3 className="text-xl font-bold text-white mb-4">Payment Options</h3>
              <ul className="space-y-3">
                {[
                  "Cash, check, and all major credit cards",
                  "Flexible payment plans for larger procedures",
                  "CareCredit and medical financing accepted",
                  "Sliding scale fees for qualifying patients",
                  "No surprise billing — transparent cost estimates",
                  "Insurance claim filing assistance included",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-slate-400">
                    <CheckCircle size={16} weight="fill" className="mt-0.5 shrink-0" style={{ color: ACCENT }} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* 11h. TELEHEALTH DETAIL */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0f1517 50%, #1a1a1a 100%)" }} />
        <MedicalCrossPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Virtual Care" title="Telehealth Services" subtitle="Get the care you need from the comfort of your home." accent={ACCENT} />
          <GlassCard className="p-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold text-white mb-4">How Telehealth Works</h3>
                <div className="space-y-4">
                  {[
                    { step: "1", title: "Schedule Online", desc: "Book your virtual visit through our portal or call the office." },
                    { step: "2", title: "Connect Securely", desc: "Join your appointment via our HIPAA-compliant video platform." },
                    { step: "3", title: "Get Treated", desc: "Your provider examines, diagnoses, and prescribes as needed." },
                    { step: "4", title: "Follow Up", desc: "Receive visit notes and follow-up instructions electronically." },
                  ].map((item) => (
                    <div key={item.step} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold text-white" style={{ background: ACCENT }}>{item.step}</div>
                      <div>
                        <h4 className="text-sm font-bold text-white">{item.title}</h4>
                        <p className="text-xs text-slate-400">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-4">Available Virtually</h3>
                <ul className="space-y-3">
                  {[
                    "Follow-up appointments and check-ins",
                    "Medication management and refills",
                    "Cold, flu, and allergy treatment",
                    "Skin concerns and rash evaluation",
                    "Mental health and counseling sessions",
                    "Chronic disease management",
                    "Lab result reviews and consultations",
                    "Specialist referral discussions",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-slate-400">
                      <CheckCircle size={16} weight="fill" className="mt-0.5 shrink-0" style={{ color: ACCENT }} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* 11i. MID-PAGE CTA BANNER */}
      <section className="relative z-10 py-16 overflow-hidden">
        <div className="absolute inset-0" style={{ background: ACCENT }} />
        <div className="absolute inset-0 bg-black/20" />
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">Your Health Cannot Wait</h2>
          <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">Same-day appointments available. New patients welcome. Call now or book online.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <PhoneLink phone={data.phone} className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-sm font-bold" style={{ color: ACCENT }}>
              <Phone size={18} weight="fill" /> Call Now
            </PhoneLink>
            <a href="#contact" className="inline-flex items-center gap-2 px-8 py-4 rounded-full border-2 border-white text-white text-sm font-bold hover:bg-white/10 transition-colors">
              Book Online <ArrowRight size={18} weight="bold" />
            </a>
          </div>
        </div>
      </section>

      {/* 12. FAQ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0f1517 50%, #1a1a1a 100%)" }} />
        <PulseLineBackground opacity={0.02} accent={ACCENT} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[20%] left-[15%] w-[400px] h-[400px] rounded-full blur-[160px]" style={{ background: `${ACCENT}06` }} /></div>
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <AnimatedSection>          <SectionHeader badge="FAQ" title="Common Questions" accent={ACCENT} /></AnimatedSection>
          <div className="space-y-3">{faqs.map((faq, i) => <AccordionItem key={i} question={faq.q} answer={faq.a} isOpen={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} />)}</div>
        </div>
      </section>

      {/* 13. CONTACT */}
      <section id="contact" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0c1214 50%, #1a1a1a 100%)" }} />
        <MedicalCrossPattern opacity={0.02} accent={ACCENT} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] rounded-full blur-[180px]" style={{ background: `${ACCENT}06` }} /></div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: ACCENT, borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}>Contact Us</span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6 text-white">Schedule Your Visit</h2>
              <p className="text-slate-400 leading-relaxed mb-8">Contact {data.businessName} today. We are here to answer your questions and help you on the path to better health.</p>
              <div className="space-y-5">
                <div className="flex items-start gap-4"><div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: ACCENT_GLOW }}><MapPin size={20} weight="duotone" style={{ color: ACCENT }} /></div><div><p className="text-sm font-semibold text-white">Address</p><MapLink address={data.address} className="text-sm text-slate-400" /></div></div>
                <div className="flex items-start gap-4"><div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: ACCENT_GLOW }}><Phone size={20} weight="duotone" style={{ color: ACCENT }} /></div><div><p className="text-sm font-semibold text-white">Phone</p><PhoneLink phone={data.phone} className="text-sm text-slate-400" /></div></div>
                <div className="flex items-start gap-4"><div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: ACCENT_GLOW }}><FirstAid size={20} weight="duotone" style={{ color: ACCENT }} /></div><div><p className="text-sm font-semibold text-white">New Patients</p><p className="text-sm text-slate-400">Currently accepting new patients of all ages</p></div></div>
                {data.hours && <div className="flex items-start gap-4"><div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: ACCENT_GLOW }}><Clock size={20} weight="duotone" style={{ color: ACCENT }} /></div><div><p className="text-sm font-semibold text-white">Hours</p><p className="text-sm text-slate-400 whitespace-pre-line">{data.hours}</p></div></div>}
              </div>
            </div>
            <GlassCard className="p-8">
              <h3 className="text-xl font-semibold text-white mb-6">Request an Appointment</h3>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className="block text-sm text-slate-400 mb-1.5">First Name</label><input type="text" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none transition-colors text-sm" placeholder="John" /></div>
                  <div><label className="block text-sm text-slate-400 mb-1.5">Last Name</label><input type="text" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none transition-colors text-sm" placeholder="Doe" /></div>
                </div>
                <div><label className="block text-sm text-slate-400 mb-1.5">Phone</label><input type="tel" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none transition-colors text-sm" placeholder="(555) 123-4567" /></div>
                <div><label className="block text-sm text-slate-400 mb-1.5">Reason for Visit</label><select className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none transition-colors text-sm"><option value="" className="bg-neutral-900">Select a service</option>{data.services.map((s) => <option key={s.name} value={s.name.toLowerCase().replace(/\s+/g, "-")} className="bg-neutral-900">{s.name}</option>)}</select></div>
                <div><label className="block text-sm text-slate-400 mb-1.5">Additional Notes</label><textarea rows={3} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none transition-colors text-sm resize-none" placeholder="Describe your symptoms or questions..." /></div>
                <MagneticButton className="w-full py-4 rounded-xl text-base font-semibold text-white flex items-center justify-center gap-2 cursor-pointer" style={{ background: ACCENT } as React.CSSProperties}>Request Appointment <ArrowRight size={18} weight="bold" /></MagneticButton>
              </form>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* 13b. CERTIFICATIONS */}
      <section className="relative z-10 py-16 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0f1517 100%)" }} />
        <MedicalCrossPattern opacity={0.015} accent={ACCENT} />
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <div className="text-center mb-10">
            <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-3 px-4 py-1.5 rounded-full border" style={{ color: ACCENT, borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}>Credentials</span>
            <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight text-white">Board-Certified Providers</h2>
          </div>
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            {["Board Certified", "AMA Member", "State Licensed", "HIPAA Compliant", "Continuing Education", "Patient Safety Certified"].map((badge) => (
              <div key={badge} className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-sm text-sm font-medium text-white">
                <ShieldCheck size={18} weight="duotone" style={{ color: ACCENT }} />
                {badge}
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-slate-500 max-w-2xl mx-auto">
            Our providers maintain the highest standards of medical education and patient care.
            All physicians complete rigorous continuing education requirements annually.
            We are proud to serve our community with compassionate, evidence-based medicine.
          </p>
        </div>
      </section>

      {/* 14. GUARANTEE */}
      <section className="relative z-10 py-16 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0f1517 100%)" }} />
        <MedicalCrossPattern opacity={0.015} accent={ACCENT} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full blur-[180px]" style={{ background: `${ACCENT}06` }} /></div>
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <ShimmerBorder accent={ACCENT}><div className="p-8 md:p-12">
            <ShieldCheck size={48} weight="fill" style={{ color: ACCENT }} className="mx-auto mb-4" />
            <h2 className="text-2xl md:text-4xl font-extrabold text-white mb-4">Our Commitment to You</h2>
            <p className="text-slate-400 leading-relaxed max-w-2xl mx-auto text-lg">At {data.businessName}, your health and comfort come first. Our board-certified physicians, modern facilities, and compassionate staff ensure you receive the highest standard of care.</p>
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              {["Board Certified", "Insurance Accepted", "Same-Day Visits", "New Patients Welcome"].map((item) => <span key={item} className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border" style={{ color: ACCENT, borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}><CheckCircle size={16} weight="fill" /> {item}</span>)}
            </div>
          </div></ShimmerBorder>
        </div>
      </section>

      {/* 15. FOOTER */}
      <footer className="relative z-10 border-t border-white/5 py-10 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #111 100%)" }} />
        <MedicalCrossPattern opacity={0.015} accent={ACCENT} />
        <div className="mx-auto max-w-6xl px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div><div className="flex items-center gap-2 mb-3"><FirstAid size={22} weight="fill" style={{ color: ACCENT }} /><span className="text-lg font-bold text-white">{data.businessName}</span></div><p className="text-sm text-slate-500 leading-relaxed">{data.about.length > 120 ? data.about.slice(0, 120).trim() + "..." : data.about}</p></div>
            <div><h4 className="text-sm font-semibold text-white mb-3">Quick Links</h4><div className="space-y-2">{["Services", "About", "Our Team", "Contact"].map((link) => <a key={link} href={`#${link.toLowerCase().replace(/\s+/g, "-")}`} className="block text-sm text-slate-500 hover:text-white transition-colors">{link}</a>)}</div></div>
            <div><h4 className="text-sm font-semibold text-white mb-3">Contact</h4><div className="space-y-2 text-sm text-slate-500"><p><PhoneLink phone={data.phone} /></p><p><MapLink address={data.address} /></p>{data.socialLinks && Object.entries(data.socialLinks).map(([platform, url]) => <a key={platform} href={url} target="_blank" rel="noopener noreferrer" className="block hover:text-white transition-colors capitalize">{platform}</a>)}</div></div>
          </div>
          <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-500"><FirstAid size={14} weight="fill" style={{ color: ACCENT }} /><span>{data.businessName} &copy; {new Date().getFullYear()}</span></div>
            <div className="flex items-center gap-2 text-xs text-slate-600"><BluejayLogo className="w-4 h-4" /><span>Created by <a href="https://bluejayportfolio.com" target="_blank" rel="noopener noreferrer" style={{textDecoration:"underline"}}>bluejayportfolio.com</a></span></div>
          </div>
        </div>
      </footer>

      <ClaimBanner businessName={data.businessName} accentColor={ACCENT} prospectId={data.id} />
      <div className="h-14 md:h-28" />
    </main>
  );
}
