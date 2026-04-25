"use client";

/* eslint-disable @next/next/no-img-element -- These static marketing and preview components intentionally use plain img tags to preserve existing markup and visual behavior during lint-only cleanup. */
/* eslint-disable react-hooks/purity -- Decorative particle values are intentionally randomized for static visual effects in these marketing pages and previews; this preserves existing appearance without changing business logic. */
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import {
  Truck,
  Car,
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
  Warning,
  Wrench,
  Path,
  Lightning,
  Siren,
  Users,
  PlayCircle,
  Quotes,
  SealCheck,
  Gauge,
} from "@phosphor-icons/react";
import type { GeneratedSiteData } from "@/lib/generator";
import BluejayLogo from "../BluejayLogo";
import { MapLink, PhoneLink } from "@/components/templates/MapLink";
import ClaimBanner from "@/components/ClaimBanner";
import { pickFromPool, pickGallery } from "@/lib/stock-image-picker";

/* ─── CONSTANTS ─── */
const spring = { type: "spring" as const, stiffness: 100, damping: 20 };
const springFast = { type: "spring" as const, stiffness: 200, damping: 25 };
const CHARCOAL = "#1a1a1a";
const DEFAULT_RED = "#ef4444";
const AMBER = "#f59e0b";
const DARK_RED = "#991b1b";

function getAccent(accentColor?: string) {
  const c = accentColor || DEFAULT_RED;
  return { ACCENT: c, ACCENT_GLOW: `${c}26`, AMBER, DARK: DARK_RED };
}

// Rotating palette so service/vehicle card tiles feel alive instead of
// monochrome. Brand ACCENT still drives headers, CTAs, borders.
const PALETTE = ["#ef4444", "#f59e0b", "#64748b", "#10b981", "#f97316", "#dc2626"];
const pickPaletteColor = (i: number) => PALETTE[i % PALETTE.length];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SERVICE_ICON_MAP: Record<string, any> = {
  tow: Truck, flatbed: Truck, heavy: Truck, roadside: Car, jump: Car,
  tire: Car, fuel: Car, lockout: Car, recovery: Truck, winch: Truck,
  accident: Warning, motorcycle: Car, long: Path, emergency: Siren,
};
function getServiceIcon(n: string) {
  const l = n.toLowerCase();
  for (const [k, I] of Object.entries(SERVICE_ICON_MAP)) { if (l.includes(k)) return I; }
  return Truck;
}

const STOCK_HERO_POOL = [
  "https://images.unsplash.com/photo-1580274455191-1c62238fa333?w=1400&q=80",
  "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=1400&q=80",
];
const STOCK_ABOUT_POOL = [
  "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&q=80",
  "https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=800&q=80",
];
const STOCK_GALLERY = [
  "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=600&q=80",
  "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600&q=80",
  "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&q=80",
  "https://images.unsplash.com/photo-1486006920555-c77dcf18193c?w=600&q=80",
  "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&q=80",
  "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=600&q=80",
  "https://images.unsplash.com/photo-1485463611174-f302f6a5c1c9?w=600&q=80",
  "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&q=80",
];

/* ─── VEHICLE TYPES ─── */
const VEHICLE_TYPES = [
  { name: "Sedans & Coupes", desc: "Standard flatbed or wheel-lift towing" },
  { name: "SUVs & Trucks", desc: "Full-size flatbed for heavier vehicles" },
  { name: "Motorcycles", desc: "Specialized strapping and flatbed transport" },
  { name: "Heavy Duty", desc: "Commercial trucks, RVs, and equipment" },
  { name: "Luxury & Exotic", desc: "Enclosed transport available on request" },
  { name: "Fleet Vehicles", desc: "Commercial accounts with priority dispatch" },
];

/* ─── ROADSIDE SERVICES ─── */
const ROADSIDE_SERVICES = [
  { name: "Jump Starts", icon: Lightning, desc: "Dead battery? We get you running in minutes." },
  { name: "Flat Tire Change", icon: Wrench, desc: "We swap your flat for the spare, roadside." },
  { name: "Fuel Delivery", icon: Gauge, desc: "Ran out of gas? We bring enough to reach a station." },
  { name: "Lockout Service", icon: Car, desc: "Locked keys in the car? We safely unlock your door." },
];

/* ─── COMPARISON TABLE ─── */
const COMPARISON_ROWS = [
  { feature: "24/7 Emergency Dispatch", us: true, them: "Limited Hours" },
  { feature: "Average Response Under 30 Min", us: true, them: "60+ Minutes" },
  { feature: "Flatbed Available", us: true, them: "Varies" },
  { feature: "No Hidden Fees", us: true, them: "Surprise Charges" },
  { feature: "Licensed & Insured", us: true, them: "Varies" },
  { feature: "Heavy Duty Capable", us: true, them: "Rarely" },
  { feature: "GPS-Tracked Fleet", us: true, them: "No" },
];

/* ─── PARTICLES ─── */
function FloatingParticles({ accent }: { accent: string }) {
  const particles = Array.from({ length: 18 }, (_, i) => ({
    id: i, x: Math.random() * 100, delay: Math.random() * 8,
    duration: 5 + Math.random() * 7, size: 2 + Math.random() * 3,
    opacity: 0.12 + Math.random() * 0.25, isAmber: Math.random() > 0.6,
  }));
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden hidden md:block">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{ left: `${p.x}%`, width: p.size, height: p.size, background: p.isAmber ? AMBER : accent, willChange: "transform, opacity" }}
          animate={{ y: ["-10vh", "110vh"], opacity: [0, p.opacity, p.opacity, 0] }}
          transition={{ y: { duration: p.duration, repeat: Infinity, delay: p.delay, ease: "linear" }, opacity: { duration: p.duration, repeat: Infinity, delay: p.delay, times: [0, 0.1, 0.9, 1] } }}
        />
      ))}
    </div>
  );
}

function EmergencyStripes({ opacity = 0.03, accent }: { opacity?: number; accent: string }) {
  const patternId = `emergStripesV2T-${accent.replace("#", "")}`;
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }}>
      <defs>
        <pattern id={patternId} width="80" height="80" patternUnits="userSpaceOnUse">
          <rect x="0" y="0" width="40" height="40" fill={accent} opacity="0.06" />
          <rect x="40" y="40" width="40" height="40" fill={accent} opacity="0.06" />
          <circle cx="40" cy="40" r="2" fill={AMBER} opacity="0.15" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  );
}

function RoadLineBg({ opacity = 0.03, accent }: { opacity?: number; accent: string }) {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }} viewBox="0 0 1000 600" preserveAspectRatio="none">
      <motion.path d="M500 0 L500 600" fill="none" stroke={accent} strokeWidth="3" strokeDasharray="30 20"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} />
      <motion.path d="M200 0 Q220 100 200 200 Q180 300 200 400 Q220 500 200 600" fill="none" stroke={AMBER} strokeWidth="1"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 4, repeat: Infinity, ease: "linear", delay: 0.5 }} />
      <motion.path d="M800 0 Q780 150 800 300 Q820 450 800 600" fill="none" stroke={accent} strokeWidth="1"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 3.5, repeat: Infinity, ease: "linear", delay: 1 }} />
    </svg>
  );
}

/* ─── SHARED UI ─── */
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
  return (
    <div className={`relative rounded-2xl p-[1px] overflow-hidden ${className}`}>
      <motion.div className="absolute inset-0 rounded-2xl" style={{ background: `conic-gradient(from 0deg, transparent, ${accent}, transparent, ${AMBER}, transparent)`, willChange: "transform" }} animate={{ rotate: [0, 360] }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} />
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

function AnimatedSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div initial={{ opacity: 1, scale: 0.92 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.5, ease: "easeOut" as const }} className={className}>
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════ */
export default function V2TowingPreview({ data }: { data: GeneratedSiteData }) {
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
    { step: "01", title: "Call Us", desc: "Reach our 24/7 dispatch and tell us your location and situation." },
    { step: "02", title: "Fast Dispatch", desc: "We send the nearest available truck to your location immediately." },
    { step: "03", title: "Safe Service", desc: "Our certified operators secure your vehicle with professional equipment." },
    { step: "04", title: "Delivered Safe", desc: "Your vehicle arrives at your chosen destination without a scratch." },
  ];

  const faqs = [
    { q: `Does ${data.businessName} operate 24/7?`, a: "Yes! Our dispatch center operates around the clock, 365 days a year. Whether it's 2 AM or a holiday, we're available when you need us." },
    { q: "How fast can you get to me?", a: `Our average response time is under 30 minutes in our primary service area. ${data.businessName} uses GPS-tracked fleet management for fastest dispatch.` },
    { q: "Do you tow all vehicle types?", a: "We tow everything from compact cars to heavy-duty trucks, motorcycles, and RVs. Our fleet includes flatbed, wheel-lift, and heavy-duty wreckers." },
    { q: "Are there hidden fees?", a: `Never. ${data.businessName} provides upfront pricing before any work begins. The price we quote is the price you pay.` },
    { q: "Do you work with insurance companies?", a: "Absolutely. We work directly with all major insurance carriers and can handle the paperwork for accident recovery situations." },
  ];

  const fallbackTestimonials = [
    { name: "Randy S.", text: "Broke down on the highway at night and they were there in 20 minutes. Professional and reassuring.", rating: 5 },
    { name: "Cheryl M.", text: "Fair prices and fast service. They towed my car without any damage. Highly recommend.", rating: 5 },
    { name: "Doug K.", text: "We use them for our dealership. Always reliable, always on time, always professional.", rating: 5 },
  ];
  const testimonials = data.testimonials?.length > 0 ? data.testimonials : fallbackTestimonials;

  const pricingTiers = [
    { name: "Local Tow", price: "$75", desc: "Up to 10 miles, standard vehicles" },
    { name: "Medium Distance", price: "$150", desc: "10-25 miles, all vehicle types" },
    { name: "Long Distance", price: "Custom", desc: "25+ miles, includes heavy duty" },
  ];

  const quizOptions = [
    { label: "Accident or collision", color: "#ef4444", urgency: "Emergency", rec: "Call now for immediate dispatch. We coordinate with police and insurance." },
    { label: "Breakdown or won't start", color: AMBER, urgency: "Urgent", rec: "We can tow or provide roadside assistance — jump start, fuel, or tire change." },
    { label: "Vehicle transport needed", color: "#22c55e", urgency: "Scheduled", rec: "We offer scheduled transport with upfront pricing. Call to arrange." },
  ];

  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden" style={{ fontFamily: "Nunito Sans, system-ui, sans-serif", background: CHARCOAL, color: "#f1f5f9" }}>
      <FloatingParticles accent={ACCENT} />

      {/* ─── EMERGENCY PULSING STRIP ─── */}
      <div className="fixed top-0 left-0 right-0 z-[60] bg-black/90 border-b border-white/15 py-2">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-center gap-3">
          <motion.div
            className="w-2.5 h-2.5 rounded-full"
            style={{ background: ACCENT }}
            animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <span className="text-sm font-semibold text-white">24/7 Emergency Towing</span>
          <span className="text-sm text-slate-400">|</span>
          <span className="text-sm font-bold" style={{ color: AMBER }}>Response Under 30 Min</span>
          <span className="text-sm text-slate-400 hidden md:inline">|</span>
          <PhoneLink phone={data.phone} className="hidden md:inline text-sm font-bold text-white hover:underline" />
        </div>
      </div>

      {/* ─── NAV ─── */}
      <nav className="fixed top-10 left-0 right-0 z-50">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-4">
          <GlassCard className="flex items-center justify-between px-4 md:px-6 py-3">
            <div className="flex items-center gap-2">
              <Truck size={24} weight="fill" style={{ color: ACCENT }} />
              <span className="text-lg font-bold tracking-tight text-white">{data.businessName}</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
              <a href="#services" className="hover:text-white transition-colors">Services</a>
              <a href="#vehicles" className="hover:text-white transition-colors">Vehicles</a>
              <a href="#about" className="hover:text-white transition-colors">About</a>
              <a href="#contact" className="hover:text-white transition-colors">Contact</a>
            </div>
            <div className="flex items-center gap-3">
              <MagneticButton href={`tel:${phoneDigits}`} className="px-4 md:px-5 py-2 rounded-full text-sm font-semibold text-white transition-colors cursor-pointer" style={{ background: ACCENT } as React.CSSProperties}>
                <Phone size={16} weight="fill" className="inline mr-1" /> Call Now
              </MagneticButton>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors">
                {mobileMenuOpen ? <X size={24} /> : <List size={24} />}
              </button>
            </div>
          </GlassCard>
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="md:hidden mt-2 overflow-hidden">
                <GlassCard className="flex flex-col gap-1 px-4 py-4">
                  {["Services", "Vehicles", "About", "Contact"].map((l) => (
                    <a key={l} href={`#${l.toLowerCase()}`} onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors">{l}</a>
                  ))}
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section className="relative min-h-[100dvh] flex items-center pt-32 z-10 overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImage} alt={data.businessName} className="w-full h-full object-cover object-center" />
          <div className="absolute inset-0 bg-black/70" />
        </div>
        <EmergencyStripes opacity={0.04} accent={ACCENT} />
        <RoadLineBg opacity={0.04} accent={ACCENT} />
        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          <div className="space-y-8">
            <div>
              <p className="text-sm uppercase tracking-widest mb-4" style={{ color: AMBER }}>24/7 Towing & Roadside Assistance</p>
              <h1 className="text-3xl md:text-6xl tracking-tighter leading-none font-bold text-white" style={{ textShadow: "0 2px 20px rgba(0,0,0,0.8), 0 4px 40px rgba(0,0,0,0.5)" }}>
                {data.tagline}
              </h1>
            </div>
            <p className="text-lg text-white/80 max-w-md leading-relaxed" style={{ textShadow: "0 1px 8px rgba(0,0,0,0.6)" }}>
              {(() => { const t = data.about; if (t.length <= 180) return t; const dot = t.indexOf(".", 80); return dot > 0 && dot < 220 ? t.slice(0, dot + 1) : t.slice(0, 180).trim() + "..."; })()}
            </p>
            {/* Trust badges */}
            <div className="flex flex-wrap gap-3">
              {["24/7 Dispatch", `${data.googleRating || "5.0"}-Star Rated`, "Licensed & Insured"].map((badge) => (
                <span key={badge} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border backdrop-blur-md" style={{ color: ACCENT, borderColor: `${ACCENT}4d`, background: "rgba(0,0,0,0.4)" }}>
                  <CheckCircle size={14} weight="fill" /> {badge}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap gap-4">
              <MagneticButton href={`tel:${phoneDigits}`} className="px-8 py-4 rounded-full text-base font-semibold text-white flex items-center gap-2 cursor-pointer" style={{ background: ACCENT } as React.CSSProperties}>
                <Phone size={18} weight="fill" /> Call Now <ArrowRight size={18} weight="bold" />
              </MagneticButton>
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/15 flex items-center gap-2 cursor-pointer">
                <MapPin size={18} weight="duotone" /> <MapLink address={data.address} />
              </MagneticButton>
            </div>
            {/* Response time badge */}
            <div className="inline-flex items-center gap-3 px-5 py-3 rounded-xl border" style={{ borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}>
              <motion.div className="w-3 h-3 rounded-full" style={{ background: "#22c55e" }} animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
              <div>
                <p className="text-sm font-bold text-white">Trucks Available Now</p>
                <p className="text-xs text-slate-400">Average response: under 30 minutes</p>
              </div>
            </div>
          </div>
          <div className="hidden md:block relative">
            <div className="relative rounded-2xl overflow-hidden border border-white/15">
              <img src={heroCardImage} alt={`${data.businessName} tow truck`} className="w-full h-[500px] object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6">
                <div className="px-4 py-2 rounded-full backdrop-blur-md bg-black/50 border flex items-center gap-2" style={{ borderColor: `${ACCENT}4d` }}>
                  <Truck size={18} weight="fill" style={{ color: ACCENT }} />
                  <span className="text-sm font-semibold text-white">Modern Fleet</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── STATS ─── */}
      <section className="relative z-10 py-16 overflow-hidden border-y" style={{ borderColor: `${ACCENT}1a` }}>
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #140a0a 0%, #1a1a1a 100%)" }} />
        <EmergencyStripes opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {data.stats.map((stat, i) => {
              const statIcons = [Truck, Clock, Star, ShieldCheck];
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

      {/* ─── SERVICES ─── */}
      <section id="services" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0a1218 50%, #1a1a1a 100%)" }} />
        <EmergencyStripes accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Our Services" title="Towing & Roadside Solutions" subtitle={`${data.businessName} provides professional towing and roadside assistance you can count on.`} accent={ACCENT} />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.services.map((service, i) => {
              const tile = pickPaletteColor(i);
              const Icon = getServiceIcon(service.name);
              return (
                <div key={service.name} className="group relative p-7 rounded-2xl border border-white/[0.10] hover:border-opacity-30 transition-all duration-500 overflow-hidden bg-white/[0.07]">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: `radial-gradient(circle at 50% 0%, ${ACCENT}15, transparent 70%)` }} />
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-5">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center border" style={{ background: `${tile}22`, borderColor: `${tile}55` }}>
                        <Icon size={24} weight="duotone" style={{ color: tile }} />
                      </div>
                      <span className="text-xs font-mono" style={{ color: `${tile}99` }}>{String(i + 1).padStart(2, "0")}</span>
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

      {/* ─── VEHICLE TYPES GRID ─── */}
      <section id="vehicles" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #120a0a 50%, #1a1a1a 100%)" }} />
        <RoadLineBg opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <AnimatedSection>
            <SectionHeader badge="What We Tow" title="Vehicle Types We Handle" accent={ACCENT} />
          </AnimatedSection>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {VEHICLE_TYPES.map((vt, i) => {
              const tile = pickPaletteColor(i + 2);
              return (
              <GlassCard key={vt.name} className="p-6">
                <div className="w-12 h-12 rounded-xl mb-4 flex items-center justify-center" style={{ background: `${tile}22`, border: `1px solid ${tile}55` }}>
                  <Truck size={24} weight="duotone" style={{ color: tile }} />
                </div>
                <h3 className="text-base font-bold text-white mb-1">{vt.name}</h3>
                <p className="text-sm text-slate-400">{vt.desc}</p>
              </GlassCard>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── ROADSIDE ASSISTANCE ─── */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0a1218 50%, #1a1a1a 100%)" }} />
        <EmergencyStripes opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <AnimatedSection>
            <SectionHeader badge="Roadside" title="Roadside Assistance" subtitle="Don't need a tow? We can help on the spot." accent={ACCENT} />
          </AnimatedSection>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {ROADSIDE_SERVICES.map((svc) => (
              <GlassCard key={svc.name} className="p-6 text-center">
                <div className="w-14 h-14 rounded-xl mx-auto mb-4 flex items-center justify-center" style={{ background: `${AMBER}1a`, border: `1px solid ${AMBER}33` }}>
                  <svc.icon size={28} weight="duotone" style={{ color: AMBER }} />
                </div>
                <h3 className="text-base font-bold text-white mb-2">{svc.name}</h3>
                <p className="text-sm text-slate-400">{svc.desc}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* ─── ABOUT ─── */}
      <section id="about" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #120a0a 50%, #1a1a1a 100%)" }} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="relative">
              <div className="rounded-2xl overflow-hidden border border-white/15">
                <img src={aboutImage} alt={`${data.businessName} team`} className="w-full h-[400px] object-cover" />
              </div>
              <div className="absolute -bottom-4 -right-4 md:bottom-6 md:-right-6">
                <div className="px-5 py-3 rounded-xl backdrop-blur-md border text-white font-bold text-sm shadow-lg" style={{ background: `${ACCENT}e6`, borderColor: `${ACCENT}80` }}>
                  {data.stats[0] ? `${data.stats[0].value} ${data.stats[0].label}` : "Fast & Reliable"}
                </div>
              </div>
            </div>
            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: ACCENT, borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}>About Us</span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6 text-white">Your Roadside Heroes</h2>
              <p className="text-slate-400 leading-relaxed mb-8">{data.about}</p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: ShieldCheck, label: "Licensed & Insured" },
                  { icon: Truck, label: "Modern Fleet" },
                  { icon: Star, label: "5-Star Rated" },
                  { icon: Clock, label: "24/7 Available" },
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

      {/* ─── PROCESS ─── */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0a1218 50%, #1a1a1a 100%)" }} />
        <RoadLineBg opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <AnimatedSection><SectionHeader badge="How It Works" title="From Call to Delivery" accent={ACCENT} /></AnimatedSection>
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

      {/* ─── PRICING ─── */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #120a0a 50%, #1a1a1a 100%)" }} />
        <EmergencyStripes opacity={0.02} accent={ACCENT} />
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <AnimatedSection>
            <SectionHeader badge="Pricing" title="Upfront & Honest Pricing" subtitle="No hidden fees. Know before we tow." accent={ACCENT} />
          </AnimatedSection>
          <div className="grid md:grid-cols-3 gap-6">
            {pricingTiers.map((tier, i) => (
              <GlassCard key={tier.name} className={`p-8 text-center ${i === 0 ? "ring-2 ring-offset-2 ring-offset-[#1a1a1a]" : ""}`}>
                {i === 0 && <span className="inline-block text-xs font-bold uppercase tracking-wider mb-4 px-3 py-1 rounded-full text-white" style={{ background: ACCENT }}>Most Common</span>}
                <h3 className="text-lg font-bold text-white mb-2">{tier.name}</h3>
                <p className="text-4xl font-black mb-2" style={{ color: ACCENT }}>{tier.price}</p>
                <p className="text-sm text-slate-400 mb-6">{tier.desc}</p>
                <MagneticButton href={`tel:${phoneDigits}`} className="w-full py-3 rounded-full text-sm font-semibold text-white cursor-pointer" style={{ background: i === 0 ? ACCENT : `${ACCENT}33` } as React.CSSProperties}>
                  Call for Quote
                </MagneticButton>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* ─── COMPARISON TABLE ─── */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0a1218 50%, #1a1a1a 100%)" }} />
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <AnimatedSection>
            <SectionHeader badge="Compare" title={`${data.businessName} vs. The Competition`} accent={ACCENT} />
          </AnimatedSection>
          <GlassCard className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/15">
                    <th className="text-left p-4 text-slate-400 font-medium">Feature</th>
                    <th className="text-center p-4 font-bold text-white">{data.businessName}</th>
                    <th className="text-center p-4 text-slate-400 font-medium">Others</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_ROWS.map((row, i) => (
                    <tr key={row.feature} className={i < COMPARISON_ROWS.length - 1 ? "border-b border-white/8" : ""}>
                      <td className="p-4 text-slate-300">{row.feature}</td>
                      <td className="p-4 text-center"><CheckCircle size={20} weight="fill" style={{ color: "#22c55e" }} className="mx-auto" /></td>
                      <td className="p-4 text-center text-slate-500">{row.them}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* ─── QUIZ ─── */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #120a0a 50%, #1a1a1a 100%)" }} />
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <AnimatedSection>
            <SectionHeader badge="Quick Help" title="What's Your Situation?" accent={ACCENT} />
          </AnimatedSection>
          <div className="grid gap-4">
            {quizOptions.map((opt) => (
              <button key={opt.label} onClick={() => setQuizAnswer(opt.label)} className={`w-full text-left p-5 rounded-2xl border transition-all duration-300 cursor-pointer ${quizAnswer === opt.label ? "border-white/30 bg-white/[0.06]" : "border-white/15 bg-white/[0.07] hover:bg-white/[0.07]"}`}>
                <div className="flex items-center justify-between">
                  <span className="text-white font-semibold">{opt.label}</span>
                  <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ color: opt.color, background: `${opt.color}1a`, border: `1px solid ${opt.color}33` }}>{opt.urgency}</span>
                </div>
                {quizAnswer === opt.label && <p className="text-sm text-slate-400 mt-3">{opt.rec}</p>}
              </button>
            ))}
          </div>
          {quizAnswer && (
            <div className="mt-8 text-center">
              <MagneticButton href={`tel:${phoneDigits}`} className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-base font-semibold text-white cursor-pointer" style={{ background: ACCENT } as React.CSSProperties}>
                <Phone size={18} weight="fill" /> Call Now — Help Is on the Way
              </MagneticButton>
            </div>
          )}
        </div>
      </section>

      {/* ─── VIDEO PLACEHOLDER ─── */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0a1218 50%, #1a1a1a 100%)" }} />
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <AnimatedSection><SectionHeader badge="See Us in Action" title="Watch Our Team Work" accent={ACCENT} /></AnimatedSection>
          <div className="relative rounded-2xl overflow-hidden border border-white/15 group cursor-pointer">
            <img src={heroImage} alt="Watch our work" className="w-full h-[400px] object-cover" />
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center group-hover:bg-black/50 transition-colors">
              <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: `${ACCENT}cc` }}>
                <PlayCircle size={48} weight="fill" className="text-white" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── GOOGLE REVIEWS + TESTIMONIALS ─── */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0a1218 50%, #1a1a1a 100%)" }} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <AnimatedSection><SectionHeader badge="Reviews" title="What Our Clients Say" accent={ACCENT} /></AnimatedSection>
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border" style={{ borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}>
              <div className="flex gap-0.5">{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={18} weight="fill" style={{ color: AMBER }} />)}</div>
              <span className="text-white font-bold">{data.googleRating || "5.0"}</span>
              <span className="text-slate-400 text-sm">({data.reviewCount || "50"}+ reviews)</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <GlassCard key={i} className="p-6 h-full flex flex-col">
                <Quotes size={24} weight="fill" style={{ color: `${ACCENT}33` }} className="mb-3" />
                <div className="flex gap-0.5 mb-4">{Array.from({ length: t.rating || 5 }).map((_, j) => <Star key={j} size={16} weight="fill" style={{ color: AMBER }} />)}</div>
                <p className="text-slate-300 leading-relaxed flex-1 text-sm mb-4">&ldquo;{t.text}&rdquo;</p>
                <div className="pt-4 border-t border-white/8 flex items-center gap-2">
                  <SealCheck size={16} weight="fill" style={{ color: "#22c55e" }} />
                  <span className="text-sm font-semibold text-white">{t.name}</span>
                  <span className="text-xs text-slate-500">Verified</span>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SERVICE AREA ─── */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #120a0a 50%, #1a1a1a 100%)" }} />
        <RoadLineBg opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <AnimatedSection><SectionHeader badge="Coverage" title="Service Area" accent={ACCENT} /></AnimatedSection>
          <div className="text-center">
            <GlassCard className="p-8 inline-block">
              <div className="flex items-center gap-3 text-lg mb-3">
                <MapPin size={24} weight="duotone" style={{ color: ACCENT }} />
                <MapLink address={data.address} className="text-white font-semibold" />
              </div>
              <p className="text-slate-400 text-sm mb-4">& Surrounding Areas</p>
              <div className="flex items-center justify-center gap-2">
                <motion.div className="w-2.5 h-2.5 rounded-full" style={{ background: "#22c55e" }} animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }} transition={{ duration: 2, repeat: Infinity }} />
                <span className="text-sm font-semibold" style={{ color: "#22c55e" }}>Trucks Dispatching Now</span>
              </div>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="relative z-10 py-20 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT}cc)` }} />
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <Truck size={48} weight="fill" className="mx-auto mb-6 text-white/70" />
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-4">Stranded? Call Now</h2>
          <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">Broken down, flat tire, or accident? Our 24/7 dispatch sends help fast.</p>
          <PhoneLink phone={data.phone} className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-white text-black font-bold text-lg hover:bg-white/90 transition-colors">
            <Phone size={22} weight="fill" /> Call {data.phone}
          </PhoneLink>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0a1218 50%, #1a1a1a 100%)" }} />
        <EmergencyStripes opacity={0.02} accent={ACCENT} />
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <AnimatedSection><SectionHeader badge="FAQ" title="Common Questions" accent={ACCENT} /></AnimatedSection>
          <div className="space-y-3">
            {faqs.map((faq, i) => <AccordionItem key={i} question={faq.q} answer={faq.a} isOpen={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} />)}
          </div>
        </div>
      </section>

      {/* ─── CONTACT ─── */}
      <section id="contact" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #120a0a 50%, #1a1a1a 100%)" }} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: ACCENT, borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}>Contact Us</span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6 text-white">Need a Tow?</h2>
              <p className="text-slate-400 leading-relaxed mb-8">Stranded or need a tow? Contact {data.businessName} for fast, reliable service.</p>
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: ACCENT_GLOW }}><MapPin size={20} weight="duotone" style={{ color: ACCENT }} /></div>
                  <div><p className="text-sm font-semibold text-white">Address</p><MapLink address={data.address} className="text-sm text-slate-400" /></div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: ACCENT_GLOW }}><Phone size={20} weight="duotone" style={{ color: ACCENT }} /></div>
                  <div><p className="text-sm font-semibold text-white">Phone</p><PhoneLink phone={data.phone} className="text-sm text-slate-400" /></div>
                </div>
                {data.hours && (
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: ACCENT_GLOW }}><Clock size={20} weight="duotone" style={{ color: ACCENT }} /></div>
                    <div><p className="text-sm font-semibold text-white">Hours</p><p className="text-sm text-slate-400 whitespace-pre-line">{data.hours}</p></div>
                  </div>
                )}
              </div>
            </div>
            <GlassCard className="p-8">
              <h3 className="text-xl font-semibold text-white mb-6">Request Service</h3>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className="block text-sm text-slate-400 mb-1.5">Name</label><input type="text" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 focus:outline-none text-sm" placeholder="Your name" /></div>
                  <div><label className="block text-sm text-slate-400 mb-1.5">Phone</label><input type="tel" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 focus:outline-none text-sm" placeholder="(555) 123-4567" /></div>
                </div>
                <div><label className="block text-sm text-slate-400 mb-1.5">Service Needed</label>
                  <select className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white focus:outline-none text-sm">
                    <option value="" className="bg-neutral-900">Select a service</option>
                    {data.services.map((s) => <option key={s.name} value={s.name.toLowerCase().replace(/\s+/g, "-")} className="bg-neutral-900">{s.name}</option>)}
                  </select>
                </div>
                <div><label className="block text-sm text-slate-400 mb-1.5">Location & Details</label>
                  <textarea rows={3} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 focus:outline-none text-sm resize-none" placeholder="Your location and vehicle details..." />
                </div>
                <MagneticButton className="w-full py-4 rounded-xl text-base font-semibold text-white flex items-center justify-center gap-2 cursor-pointer" style={{ background: ACCENT } as React.CSSProperties}>
                  Request Service <ArrowRight size={18} weight="bold" />
                </MagneticButton>
              </form>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* ─── CERTIFICATIONS ─── */}
      <section className="relative z-10 py-16 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #120a0a 50%, #1a1a1a 100%)" }} />
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <div className="flex flex-wrap justify-center gap-4">
            {["Licensed", "Insured", "BBB Accredited", "GPS Fleet Tracking", "Heavy Duty Certified", "24/7 Dispatch"].map((cert) => (
              <span key={cert} className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border" style={{ color: ACCENT, borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}>
                <SealCheck size={16} weight="fill" /> {cert}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── GUARANTEE ─── */}
      <section className="relative z-10 py-16 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0a1218 100%)" }} />
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <ShimmerBorder accent={ACCENT}>
            <div className="p-8 md:p-12">
              <ShieldCheck size={48} weight="fill" style={{ color: ACCENT }} className="mx-auto mb-4" />
              <h2 className="text-2xl md:text-4xl font-extrabold text-white mb-4">Our Promise</h2>
              <p className="text-slate-400 leading-relaxed max-w-2xl mx-auto text-lg">
                {data.businessName} treats every vehicle like our own. Fully insured, modern equipment, and guaranteed safe transport.
              </p>
              <div className="flex flex-wrap justify-center gap-4 mt-8">
                {["Modern Fleet", "Licensed & Insured", "No Hidden Fees", "Safe Transport"].map((item) => (
                  <span key={item} className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border" style={{ color: ACCENT, borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}>
                    <CheckCircle size={16} weight="fill" /> {item}
                  </span>
                ))}
              </div>
            </div>
          </ShimmerBorder>
        </div>
      </section>

      {/* ─── COVERAGE & FLEET ─── */}
      <section className="relative z-10 py-20 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #111 50%, #1a1a1a 100%)" }} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-12">
            <Path size={40} weight="duotone" style={{ color: ACCENT }} className="mx-auto mb-3" />
            <h2 className="text-3xl md:text-4xl font-extrabold text-white">Coverage Area & Fleet</h2>
            <p className="text-slate-400 mt-3 max-w-xl mx-auto">{data.businessName} covers a wide service area with a modern fleet ready to handle any situation.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="rounded-2xl border border-white/15 p-6" style={{ background: "rgba(255,255,255,0.06)" }}>
              <MapPin size={28} weight="fill" style={{ color: ACCENT }} className="mb-3" />
              <h3 className="text-xl font-bold text-white mb-3">Service Area</h3>
              <p className="text-slate-400 leading-relaxed mb-4">We provide towing and roadside assistance throughout the greater metro area and surrounding communities. Our dispatchers know every road, highway, and back street.</p>
              <div className="flex flex-wrap gap-2">
                {["Metro Area", "Highways", "Rural Roads", "Parking Garages"].map((area) => (
                  <span key={area} className="px-3 py-1 rounded-full text-xs font-medium border" style={{ color: ACCENT, borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}>{area}</span>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-white/15 p-6" style={{ background: "rgba(255,255,255,0.06)" }}>
              <Truck size={28} weight="fill" style={{ color: ACCENT }} className="mb-3" />
              <h3 className="text-xl font-bold text-white mb-3">Our Fleet</h3>
              <ul className="space-y-3">
                {[
                  { name: "Flatbed Carriers", desc: "For luxury, AWD, and damaged vehicles" },
                  { name: "Wheel-Lift Trucks", desc: "Quick hookup for standard tows" },
                  { name: "Heavy-Duty Wreckers", desc: "Commercial trucks, buses, and RVs" },
                  { name: "Service Vehicles", desc: "Jump starts, lockouts, and tire changes" },
                ].map((v) => (
                  <li key={v.name} className="flex items-start gap-3">
                    <CheckCircle size={18} weight="fill" style={{ color: ACCENT }} className="mt-0.5 shrink-0" />
                    <div><span className="text-white font-semibold text-sm">{v.name}</span><p className="text-xs text-slate-500">{v.desc}</p></div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ─── INSURANCE & AAA ─── */}
      <section className="relative z-10 py-20 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #111 0%, #1a1a1a 100%)" }} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-12">
            <ShieldCheck size={40} weight="duotone" style={{ color: ACCENT }} className="mx-auto mb-3" />
            <h2 className="text-3xl md:text-4xl font-extrabold text-white">Insurance & Roadside Programs</h2>
            <p className="text-slate-400 mt-3 max-w-xl mx-auto">We work directly with major insurance providers and roadside assistance programs to simplify your experience.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { title: "AAA Approved", desc: "Official AAA-contracted provider for your area" },
              { title: "Insurance Direct", desc: "We bill your insurance directly — less hassle for you" },
              { title: "Police Rotations", desc: "Trusted by local law enforcement for accident recovery" },
              { title: "Motor Club Partner", desc: "Accepted by all major motor club programs" },
            ].map((card) => (
              <div key={card.title} className="rounded-2xl border border-white/15 p-5 text-center" style={{ background: "rgba(255,255,255,0.06)" }}>
                <SealCheck size={28} weight="fill" style={{ color: ACCENT }} className="mx-auto mb-2" />
                <h3 className="text-sm font-bold text-white mb-1">{card.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── MID-PAGE CTA ─── */}
      <section className="relative z-10 py-16 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${ACCENT}15 0%, #1a1a1a 50%, ${ACCENT}08 100%)` }} />
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <Siren size={44} weight="fill" style={{ color: ACCENT }} className="mx-auto mb-4" />
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">Stranded? We&apos;re On Our Way</h2>
          <p className="text-slate-400 max-w-2xl mx-auto mb-6 text-lg">
            {data.businessName} dispatches the nearest available truck the moment you call. Average response time under 30 minutes.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {["24/7 Dispatch", "GPS Tracking", "ETA Updates", "No Hidden Fees"].map((item) => (
              <span key={item} className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border" style={{ color: ACCENT, borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}>
                <CheckCircle size={16} weight="fill" /> {item}
              </span>
            ))}
          </div>
          <a href={`tel:${data.phone}`} className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-white font-bold text-lg transition-transform hover:scale-105" style={{ background: ACCENT }}>
            <Phone size={20} weight="fill" /> Call Now for Help
          </a>
        </div>
      </section>

      {/* ─── WHY CHOOSE US ─── */}
      <section className="relative z-10 py-20 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #111 0%, #1a1a1a 100%)" }} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white">Why Choose <span style={{ color: ACCENT }}>{data.businessName}</span></h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { title: "Fast Response", desc: "Average arrival time under 30 minutes. GPS-dispatched trucks get to you quickly." },
              { title: "Fair Pricing", desc: "Upfront quotes with no surprise fees. The price we quote is the price you pay." },
              { title: "Fully Insured", desc: "Complete liability coverage protects your vehicle from hookup to drop-off." },
              { title: "24/7 Availability", desc: "Breakdowns don't wait for business hours. Neither do we. Call anytime." },
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

      {/* ─── ENHANCED CERTS ─── */}
      <section className="relative z-10 py-16 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #111 100%)" }} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-8">
            <SealCheck size={36} weight="duotone" style={{ color: ACCENT }} className="mx-auto mb-3" />
            <h2 className="text-2xl md:text-3xl font-extrabold text-white">Certifications & Trust</h2>
            <p className="text-slate-400 mt-2 max-w-lg mx-auto">
              {data.businessName} meets and exceeds all industry standards for safety, professionalism, and reliability.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            {[
              "Licensed & Bonded",
              "DOT Compliant",
              "AAA Approved",
              "BBB Accredited",
              "State Certified",
              "Fully Insured",
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

      {/* ─── FOOTER ─── */}
      <footer className="relative z-10 border-t border-white/8 py-10 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #111 100%)" }} />
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
                {["Services", "Vehicles", "About", "Contact"].map((link) => (
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
