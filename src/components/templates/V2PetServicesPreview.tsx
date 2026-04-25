"use client";

/* eslint-disable @next/next/no-img-element -- These static marketing and preview components intentionally use plain img tags to preserve existing markup and visual behavior during lint-only cleanup. */
/* eslint-disable react-hooks/purity -- Decorative particle values are intentionally randomized for static visual effects in these marketing pages and previews; this preserves existing appearance without changing business logic. */

import { useState, useRef, useCallback } from "react";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import { PawPrint, Dog, Cat, Scissors, Heart, Star, ShieldCheck, Clock, Phone, MapPin, ArrowRight, CheckCircle, CaretDown, List, X, FirstAid, SealCheck, HandHeart, CalendarBlank, Sun } from "@phosphor-icons/react";
import type { GeneratedSiteData } from "@/lib/generator";
import BluejayLogo from "../BluejayLogo";
import { MapLink, PhoneLink } from "@/components/templates/MapLink";
import ClaimBanner from "@/components/ClaimBanner";
import { pickFromPool, pickGallery } from "@/lib/stock-image-picker";

const spring = { type: "spring" as const, stiffness: 100, damping: 20 };
const springFast = { type: "spring" as const, stiffness: 200, damping: 25 };
const DEFAULT_ORANGE = "#f59e0b";
const SKY = "#0ea5e9";
const BG = "#0a1015";

function getAccent(c?: string) { const a = c || DEFAULT_ORANGE; return { ACCENT: a, ACCENT_GLOW: `${a}26` }; }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ICON_MAP: Record<string, any> = { groom: Scissors, board: Heart, daycare: Dog, train: Star, walk: PawPrint, taxi: PawPrint, cat: Cat, bath: Scissors, sit: Heart, pet: PawPrint };
function getServiceIcon(n: string) { const l = n.toLowerCase(); for (const [k, I] of Object.entries(ICON_MAP)) { if (l.includes(k)) return I; } return PawPrint; }

const STOCK_HERO_POOL = [
  "https://images.unsplash.com/photo-1558788353-f76d92427f16?w=1400&q=80",
  "https://images.unsplash.com/photo-1544568100-847a948585b9?w=1400&q=80",
];
const STOCK_ABOUT_POOL = [
  "https://images.unsplash.com/photo-1535268647677-300dbf3d78d1?w=600&q=80",
  "https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=600&q=80",
];
const STOCK_GALLERY = [
  "https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=600&q=80",
  "https://images.unsplash.com/photo-1535268647677-300dbf3d78d1?w=600&q=80",
  "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=600&q=80",
  "https://images.unsplash.com/photo-1568572933382-74d440642117?w=600&q=80",
  "https://images.unsplash.com/photo-1544568100-847a948585b9?w=600&q=80",
  "https://images.unsplash.com/photo-1519098901909-b1553a1190af?w=600&q=80",
  "https://images.unsplash.com/photo-1596854372407-baba7fef6e51?w=600&q=80",
  "https://images.unsplash.com/photo-1558788353-f76d92427f16?w=600&q=80",
];

/* ─── Decorative helpers ─── */

function FloatingSparks({ accent }: { accent: string }) {
  const ps = Array.from({ length: 18 }, (_, i) => ({ id: i, x: Math.random() * 100, delay: Math.random() * 8, dur: 5 + Math.random() * 7, size: 2 + Math.random() * 3, op: 0.12 + Math.random() * 0.3, isSky: Math.random() > 0.5 }));
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden hidden md:block">
      {ps.map((p) => (
        <motion.div key={p.id} className="absolute rounded-full" style={{ left: `${p.x}%`, width: p.size, height: p.size, background: p.isSky ? SKY : accent, willChange: "transform, opacity" }} animate={{ y: ["-10vh", "110vh"], opacity: [0, p.op, p.op, 0] }} transition={{ y: { duration: p.dur, repeat: Infinity, delay: p.delay, ease: "linear" }, opacity: { duration: p.dur, repeat: Infinity, delay: p.delay, times: [0, 0.1, 0.9, 1] } }} />
      ))}
    </div>
  );
}

function PawPattern({ opacity = 0.03, accent }: { opacity?: number; accent: string }) {
  const pid = `pawV2Prev-${accent.replace("#", "")}`;
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }}>
      <defs>
        <pattern id={pid} width="100" height="100" patternUnits="userSpaceOnUse">
          <circle cx="50" cy="35" r="8" fill={accent} opacity="0.3" />
          <circle cx="35" cy="22" r="4" fill={accent} opacity="0.2" />
          <circle cx="65" cy="22" r="4" fill={accent} opacity="0.2" />
          <circle cx="30" cy="35" r="4" fill={accent} opacity="0.2" />
          <circle cx="70" cy="35" r="4" fill={accent} opacity="0.2" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${pid})`} />
    </svg>
  );
}

/* ─── Shared UI components ─── */

function GlassCard({ children, className = "", style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return <div className={`rounded-2xl border border-white/15 bg-white/[0.08] backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] ${className}`}>{children}</div>;
}

function MagneticButton({ children, className = "", onClick, style, href }: { children: React.ReactNode; className?: string; onClick?: () => void; style?: React.CSSProperties; href?: string }) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0); const y = useMotionValue(0);
  const sx = useSpring(x, springFast); const sy = useSpring(y, springFast);
  const isTD = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
  const mm = useCallback((e: React.MouseEvent) => { if (!ref.current || isTD) return; const r = ref.current.getBoundingClientRect(); x.set((e.clientX - (r.left + r.width / 2)) * 0.25); y.set((e.clientY - (r.top + r.height / 2)) * 0.25); }, [x, y, isTD]);
  const ml = useCallback(() => { x.set(0); y.set(0); }, [x, y]);
  if (href) return <motion.a href={href} ref={ref as unknown as React.Ref<HTMLAnchorElement>} style={{ x: sx, y: sy, willChange: "transform", ...style }} onMouseMove={mm as unknown as React.MouseEventHandler<HTMLAnchorElement>} onMouseLeave={ml} className={className} whileTap={{ scale: 0.97 }}>{children}</motion.a>;
  return <motion.button ref={ref} style={{ x: sx, y: sy, willChange: "transform", ...style }} onMouseMove={mm} onMouseLeave={ml} onClick={onClick} className={className} whileTap={{ scale: 0.97 }}>{children}</motion.button>;
}

function ShimmerBorder({ children, className = "", accent }: { children: React.ReactNode; className?: string; accent: string }) {
  return (
    <div className={`relative rounded-2xl p-[1px] overflow-hidden ${className}`}>
      <motion.div className="absolute inset-0 rounded-2xl" style={{ background: `conic-gradient(from 0deg, transparent, ${accent}, transparent, ${SKY}, transparent)`, willChange: "transform" }} animate={{ rotate: [0, 360] }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} />
      <div className="relative rounded-2xl bg-[#0a1015] z-10">{children}</div>
    </div>
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

function AnimatedSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div initial={{ opacity: 1, scale: 0.92 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.5, ease: "easeOut" as const }} className={className}>
      {children}
    </motion.div>
  );
}

/* ─── Category-specific constants ─── */

const PET_TYPES = [
  { key: "dogs", label: "Dogs", icon: Dog, desc: "Boarding, daycare, grooming, training, and walking services tailored for dogs of all sizes and breeds." },
  { key: "cats", label: "Cats", icon: Cat, desc: "Boarding, grooming, and specialized care for feline friends in a calm, quiet environment." },
  { key: "exotics", label: "Small Pets", icon: PawPrint, desc: "Care for rabbits, guinea pigs, hamsters, birds, and other small animals with specialized housing." },
];

const SAFETY_BADGES = [
  { icon: ShieldCheck, label: "Background Checked", desc: "Every team member passes a comprehensive background check." },
  { icon: SealCheck, label: "Bonded & Insured", desc: "Fully bonded and insured for your complete peace of mind." },
  { icon: FirstAid, label: "Pet First Aid Certified", desc: "All staff are trained and certified in pet first aid and CPR." },
  { icon: HandHeart, label: "Fear-Free Certified", desc: "We use fear-free handling techniques to reduce stress." },
];

const DAILY_REPORT_ITEMS = [
  { label: "Meals & Water", emoji: "food", desc: "What they ate, how much, and hydration tracking" },
  { label: "Potty Breaks", emoji: "activity", desc: "Time, frequency, and any notes on digestive health" },
  { label: "Playtime & Activities", emoji: "play", desc: "Who they played with, toys used, energy level" },
  { label: "Nap & Rest", emoji: "rest", desc: "Sleep duration, comfort level, and behavior" },
  { label: "Mood & Behavior", emoji: "mood", desc: "Overall temperament, socialization, and happiness" },
  { label: "Photo Updates", emoji: "photo", desc: "Multiple photos and videos sent throughout the day" },
];

const PRICING_TIERS = [
  { name: "Dog Walking", price: "$25", per: "per walk", features: ["30-minute walk", "GPS tracking", "Photo updates", "Potty break included"], popular: false },
  { name: "Daycare", price: "$45", per: "per day", features: ["Full day of play", "Supervised groups", "Indoor & outdoor", "Daily report card", "Meals included"], popular: true },
  { name: "Boarding", price: "$65", per: "per night", features: ["Private suite", "Evening walks", "Bedtime snack", "Photo updates", "Cuddle time", "24/7 staff"], popular: false },
];

const COMPARISON_ROWS = [
  { feature: "Background-Checked Staff", us: true, them: "Sometimes" },
  { feature: "Pet First Aid Certified", us: true, them: "Rarely" },
  { feature: "Daily Report Cards", us: true, them: "No" },
  { feature: "Photo/Video Updates", us: true, them: "Sometimes" },
  { feature: "Bonded & Insured", us: true, them: "Varies" },
  { feature: "Fear-Free Handling", us: true, them: "No" },
  { feature: "Webcam Access", us: true, them: "Rarely" },
];

const QUIZ_OPTIONS = [
  { label: "Daycare & Play", icon: Sun, color: "#f59e0b", recommendation: "Our daycare program provides a full day of supervised fun with daily report cards." },
  { label: "Overnight Boarding", icon: Heart, color: "#0ea5e9", recommendation: "Private suites with 24/7 staff, evening walks, and lots of cuddle time." },
  { label: "Grooming & Spa", icon: Scissors, color: "#ec4899", recommendation: "Full grooming packages from bath to blow-dry with premium products." },
];

/* ─────────────────── MAIN COMPONENT ─────────────────── */

export default function V2PetServicesPreview({ data }: { data: GeneratedSiteData }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [activePetType, setActivePetType] = useState("dogs");
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const { ACCENT, ACCENT_GLOW } = getAccent(data.accentColor);
  const PALETTE = ["#f59e0b", "#0d9488", "#e11d48", "#d97706", "#10b981", "#fb7185"];
  const pickPaletteColor = (i: number) => PALETTE[i % PALETTE.length];
  const uniquePhotos = data.photos ? [...new Set(data.photos)] : [];

  const heroImage = uniquePhotos[0] || pickFromPool(STOCK_HERO_POOL, data.businessName);
  const heroCardImage = uniquePhotos[1] || pickFromPool(STOCK_ABOUT_POOL, data.businessName, 1);
  const aboutImage = uniquePhotos[2] || pickFromPool(STOCK_ABOUT_POOL, data.businessName, 2);
  const usedUrls = new Set([heroImage, heroCardImage, aboutImage].filter(Boolean));
  const galleryFromReal = uniquePhotos.slice(3).filter((u) => !usedUrls.has(u));
  const galleryImages =
    galleryFromReal.length >= 6
      ? galleryFromReal.slice(0, 6)
      : [
          ...galleryFromReal,
          ...pickGallery(STOCK_GALLERY, data.businessName).filter(
            (u) => !usedUrls.has(u) && !galleryFromReal.includes(u)
          ),
        ].slice(0, 6);

  const faqs = [
    { q: `What services does ${data.businessName} offer?`, a: `We offer ${data.services.slice(0, 3).map(s => s.name).join(", ")}, and more. Contact us to learn about our full range of pet care services.` },
    { q: "What vaccinations are required?", a: "All pets must be current on rabies, distemper, and bordetella. We require proof of vaccination before the first visit to ensure the safety of all our guests." },
    { q: "Do you accept cats and other pets?", a: `Yes! While we specialize in dogs, ${data.businessName} also cares for cats, rabbits, guinea pigs, and other small pets in separate, calm environments.` },
    { q: "What if my pet has special needs?", a: "We create customized care plans for every pet, including those with medical conditions, anxiety, or special dietary needs. Just let us know during booking." },
    { q: "How do I receive daily updates?", a: "Every pet parent receives a detailed daily report card via text or app, including photos, activity logs, meal tracking, and behavior notes." },
    { q: "What are your hours of operation?", a: data.hours ? `Our hours are: ${data.hours}. Early drop-off and late pickup options available.` : "Please call for our current hours. We offer flexible drop-off and pickup times." },
    { q: "Do you offer overnight boarding?", a: `Yes! ${data.businessName} provides overnight boarding with comfortable sleeping areas, evening walks, and bedtime routines. Webcam access available for pet parents.` },
    { q: "Is there a trial visit available?", a: "Absolutely! We offer a free meet and greet session so your pet can explore our facility and get comfortable with our team before their first official visit." },
  ];

  const fallbackTestimonials = [
    { name: "Amy R.", text: "My dog comes home happy and exhausted every time. The staff clearly loves animals. The daily report cards are the best part!", rating: 5 },
    { name: "Josh M.", text: "Best grooming our poodle has ever had. Patient, gentle, and the cut was perfect. We will never go anywhere else.", rating: 5 },
    { name: "Tina K.", text: "We board our cats here whenever we travel. They send us photo updates and the cats are always content when we pick them up.", rating: 5 },
  ];
  const testimonials = data.testimonials?.length > 0 ? data.testimonials : fallbackTestimonials;

  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden" style={{ fontFamily: "Nunito Sans, system-ui, sans-serif", background: BG, color: "#f1f5f9" }}>
      <FloatingSparks accent={ACCENT} />

      {/* ─── 1. NAV ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-4">
          <GlassCard className="flex items-center justify-between px-4 md:px-6 py-3">
            <div className="flex items-center gap-2">
              <PawPrint size={24} weight="fill" style={{ color: ACCENT }} />
              <span className="text-lg font-bold tracking-tight text-white">{data.businessName}</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
              <a href="#services" className="hover:text-white transition-colors">Services</a>
              <a href="#gallery" className="hover:text-white transition-colors">Gallery</a>
              <a href="#about" className="hover:text-white transition-colors">About</a>
              <a href="#contact" className="hover:text-white transition-colors">Contact</a>
            </div>
            <div className="flex items-center gap-3">
              <MagneticButton className="px-4 md:px-5 py-2 rounded-full text-sm font-semibold text-black transition-colors cursor-pointer" style={{ background: ACCENT } as React.CSSProperties}>Book Now</MagneticButton>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors">{mobileMenuOpen ? <X size={24} /> : <List size={24} />}</button>
            </div>
          </GlassCard>
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="md:hidden mt-2 overflow-hidden">
                <GlassCard className="flex flex-col gap-1 px-4 py-4">
                  {["Services", "Gallery", "About", "Contact"].map((l) => (
                    <a key={l} href={`#${l.toLowerCase()}`} onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors">{l}</a>
                  ))}
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* ─── 2. HERO ─── */}
      <section className="relative min-h-[100dvh] flex items-center pt-24 z-10 overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImage} alt={data.businessName} className="w-full h-full object-cover object-center" />
          <div className="absolute inset-0 bg-black/70" />
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          <div className="space-y-8">
            <div>
              <p className="text-sm uppercase tracking-widest mb-4" style={{ color: ACCENT }}>Professional Pet Care</p>
              <h1 className="text-3xl md:text-6xl tracking-tighter leading-none font-bold text-white" style={{ textShadow: "0 2px 20px rgba(0,0,0,0.8)" }}>{data.tagline}</h1>
            </div>
            <p className="text-lg text-white/80 max-w-md leading-relaxed" style={{ textShadow: "0 1px 8px rgba(0,0,0,0.6)" }}>{(() => { const t = data.about; if (t.length <= 180) return t; const dot = t.indexOf(".", 80); return dot > 0 && dot < 220 ? t.slice(0, dot + 1) : t.slice(0, 180).trim() + "..."; })()}</p>
            <div className="flex flex-wrap gap-4">
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-black flex items-center gap-2 cursor-pointer" style={{ background: ACCENT } as React.CSSProperties}>Book Appointment <ArrowRight size={18} weight="bold" /></MagneticButton>
              <MagneticButton href={`tel:${data.phone.replace(/\D/g, "")}`} className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/15 flex items-center gap-2 cursor-pointer"><Phone size={18} weight="duotone" /> <PhoneLink phone={data.phone} /></MagneticButton>
            </div>
            <div className="flex flex-wrap gap-3">
              {["Background Checked", "Bonded & Insured", "First Aid Certified"].map((badge) => (
                <span key={badge} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border backdrop-blur-sm" style={{ color: ACCENT, borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}>
                  <CheckCircle size={14} weight="fill" /> {badge}
                </span>
              ))}
            </div>
          </div>
          <div className="hidden md:block relative">
            <div className="relative rounded-2xl overflow-hidden border border-white/15">
              <img src={heroCardImage} alt={`${data.businessName} pets`} className="w-full h-[500px] object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a1015] via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6">
                <div className="px-4 py-2 rounded-full backdrop-blur-md bg-black/50 border flex items-center gap-2" style={{ borderColor: `${ACCENT}4d` }}>
                  <Heart size={18} weight="fill" style={{ color: ACCENT }} />
                  <span className="text-sm font-semibold text-white">Trusted Pet Care</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 3. STATS ─── */}
      <section className="relative z-10 py-16 overflow-hidden border-y" style={{ borderColor: `${ACCENT}1a` }}>
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, #0c1218 0%, ${BG} 100%)` }} />
        <PawPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {data.stats.map((stat, i) => {
              const icons = [PawPrint, Clock, ShieldCheck, Star];
              const Icon = icons[i % icons.length];
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

      {/* ─── 4. PET TYPE TABS ─── */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #0c1218 50%, ${BG} 100%)` }} />
        <PawPattern accent={ACCENT} />
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <SectionHeader badge="We Care For" title="All Types of Pets" subtitle="From dogs and cats to small animals, every pet gets the royal treatment." accent={ACCENT} />
          <div className="flex justify-center gap-2 mb-10">
            {PET_TYPES.map((pt) => (
              <button key={pt.key} onClick={() => setActivePetType(pt.key)} className="px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 cursor-pointer flex items-center gap-2" style={{ background: activePetType === pt.key ? ACCENT : "rgba(255,255,255,0.05)", color: activePetType === pt.key ? "#000" : "#94a3b8", border: `1px solid ${activePetType === pt.key ? ACCENT : "rgba(255,255,255,0.1)"}` }}>
                <pt.icon size={18} weight="bold" /> {pt.label}
              </button>
            ))}
          </div>
          <AnimatePresence mode="wait">
            {PET_TYPES.filter(pt => pt.key === activePetType).map((pt) => (
              <motion.div key={pt.key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
                <GlassCard className="p-8 md:p-10">
                  <div className="flex items-start gap-6">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 border" style={{ background: ACCENT_GLOW, borderColor: `${ACCENT}33` }}>
                      <pt.icon size={32} weight="duotone" style={{ color: ACCENT }} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-3">{pt.label} Care</h3>
                      <p className="text-slate-400 leading-relaxed text-lg">{pt.desc}</p>
                      <div className="flex flex-wrap gap-3 mt-6">
                        {["Boarding", "Daycare", "Grooming", "Training"].map((svc) => (
                          <span key={svc} className="px-4 py-2 rounded-full text-sm font-medium border" style={{ color: ACCENT, borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}>{svc}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </section>

      {/* ─── 5. SERVICES ─── */}
      <section id="services" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #0c1218 50%, ${BG} 100%)` }} />
        <PawPattern accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Our Services" title="Everything Your Pet Needs" subtitle={`${data.businessName} provides professional care for your furry family members.`} accent={ACCENT} />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.services.map((svc, i) => {
              const Icon = getServiceIcon(svc.name);
              const tile = pickPaletteColor(i);
              return (
                <div key={svc.name} className="group relative p-7 rounded-2xl border border-white/[0.10] hover:border-opacity-30 transition-all duration-500 overflow-hidden bg-white/[0.07]">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: `radial-gradient(circle at 50% 0%, ${ACCENT}15, transparent 70%)` }} />
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-5">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center border" style={{ background: `${tile}22`, borderColor: `${tile}55` }}>
                        <Icon size={24} weight="duotone" style={{ color: tile }} />
                      </div>
                      <span className="text-xs font-mono" style={{ color: `${tile}99` }}>{String(i + 1).padStart(2, "0")}</span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{svc.name}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{svc.description || ""}</p>
                    {svc.price && <p className="text-sm font-semibold mt-3" style={{ color: ACCENT }}>{svc.price}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── 6. DAILY REPORT CARD ─── */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #0d1218 50%, ${BG} 100%)` }} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[20%] right-[10%] w-[500px] h-[500px] rounded-full blur-[180px]" style={{ background: `${ACCENT}06` }} /></div>
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <AnimatedSection><SectionHeader badge="Transparency" title="Daily Report Card" subtitle="Every pet parent receives a detailed update on their pet's day, every single visit." accent={ACCENT} /></AnimatedSection>
          <ShimmerBorder accent={ACCENT}>
            <div className="p-8">
              <div className="flex items-center gap-3 mb-8">
                <CalendarBlank size={28} weight="duotone" style={{ color: ACCENT }} />
                <h3 className="text-xl font-bold text-white">Today&apos;s Report</h3>
                <span className="ml-auto text-sm text-slate-500">Sent via text & app</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {DAILY_REPORT_ITEMS.map((item) => (
                  <div key={item.label} className="p-4 rounded-xl border border-white/[0.10] bg-white/[0.07]">
                    <h4 className="text-sm font-bold text-white mb-1">{item.label}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </ShimmerBorder>
        </div>
      </section>

      {/* ─── 7. SAFETY BADGES ─── */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #0c1218 50%, ${BG} 100%)` }} />
        <PawPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <AnimatedSection><SectionHeader badge="Your Pet&apos;s Safety" title="Trust & Certification" subtitle="Your pet's safety is our highest priority. Here's how we ensure it." accent={ACCENT} /></AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {SAFETY_BADGES.map((badge) => (
              <GlassCard key={badge.label} className="p-7 flex items-start gap-5">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 border" style={{ background: ACCENT_GLOW, borderColor: `${ACCENT}33` }}>
                  <badge.icon size={28} weight="duotone" style={{ color: ACCENT }} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">{badge.label}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{badge.desc}</p>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 8. ABOUT ─── */}
      <section id="about" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #0d1218 50%, ${BG} 100%)` }} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="relative">
              <div className="rounded-2xl overflow-hidden border border-white/15"><img src={aboutImage} alt={`${data.businessName} team`} className="w-full h-[400px] object-cover" /></div>
              <div className="absolute -bottom-4 -right-4 md:bottom-6 md:-right-6">
                <div className="px-5 py-3 rounded-xl backdrop-blur-md border text-black font-bold text-sm shadow-lg" style={{ background: `${ACCENT}e6`, borderColor: `${ACCENT}80` }}>{data.stats[0] ? `${data.stats[0].value} ${data.stats[0].label}` : "Trusted Care"}</div>
              </div>
            </div>
            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: ACCENT, borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}>About Us</span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6 text-white">We Love What We Do</h2>
              <p className="text-slate-400 leading-relaxed mb-8">{data.about}</p>
              <div className="grid grid-cols-2 gap-4">
                {[{ icon: ShieldCheck, label: "Certified Staff" }, { icon: Heart, label: "Pet-First Approach" }, { icon: Star, label: "5-Star Rated" }, { icon: CheckCircle, label: "Fully Insured" }].map((b) => (
                  <GlassCard key={b.label} className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: ACCENT_GLOW }}><b.icon size={20} weight="duotone" style={{ color: ACCENT }} /></div>
                    <span className="text-sm font-semibold text-white">{b.label}</span>
                  </GlassCard>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 9. PRICING PER VISIT TYPE ─── */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #0c1218 50%, ${BG} 100%)` }} />
        <PawPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Transparent Pricing" title="Service Rates" subtitle="Clear, honest pricing with no hidden fees. Every pet deserves the best." accent={ACCENT} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PRICING_TIERS.map((tier) => (
              <div key={tier.name} className="relative">
                {tier.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 px-4 py-1 rounded-full text-xs font-bold" style={{ background: ACCENT, color: "#000" }}>Most Popular</div>}
                <ShimmerBorder accent={tier.popular ? ACCENT : SKY} className="h-full">
                  <div className="p-7 h-full flex flex-col">
                    <h3 className="text-xl font-bold text-white mb-1">{tier.name}</h3>
                    <div className="flex items-baseline gap-1 mb-6">
                      <span className="text-3xl font-extrabold text-white">{tier.price}</span>
                      <span className="text-sm text-slate-500">{tier.per}</span>
                    </div>
                    <ul className="space-y-3 flex-1">
                      {tier.features.map((feat) => (
                        <li key={feat} className="flex items-start gap-2 text-sm text-slate-400">
                          <CheckCircle size={16} weight="fill" style={{ color: ACCENT }} className="shrink-0 mt-0.5" /> {feat}
                        </li>
                      ))}
                    </ul>
                    <MagneticButton className="w-full mt-6 py-3 rounded-xl text-sm font-semibold text-black text-center cursor-pointer" style={{ background: tier.popular ? ACCENT : `${ACCENT}80` } as React.CSSProperties}>
                      Book Now
                    </MagneticButton>
                  </div>
                </ShimmerBorder>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 10. GALLERY ─── */}
      <section id="gallery" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #0c1218 50%, ${BG} 100%)` }} />
        <PawPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <AnimatedSection><SectionHeader badge="Gallery" title="Our Happy Clients" accent={ACCENT} /></AnimatedSection>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {galleryImages.map((src, i) => {
              const captions = ["Playtime Fun", "Grooming Day", "Best Friends", "Pool Party", "Cuddle Time", "Adventure Walk"];
              return (
                <div key={i} className="group relative rounded-2xl overflow-hidden border border-white/[0.10] hover:border-opacity-30 transition-all duration-500">
                  <img src={src} alt={captions[i] || `Happy pet ${i + 1}`} className="w-full h-48 md:h-56 object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <h3 className="text-sm font-bold text-white">{captions[i] || `Pet ${i + 1}`}</h3>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── 11. SERVICE QUIZ ─── */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #0d1218 50%, ${BG} 100%)` }} />
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <AnimatedSection><SectionHeader badge="Find Your Fit" title="What Does Your Pet Need?" subtitle="Select the service type that fits your pet's needs." accent={ACCENT} /></AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {QUIZ_OPTIONS.map((opt, i) => (
              <button key={opt.label} onClick={() => setQuizAnswer(i)} className="text-left cursor-pointer">
                <GlassCard className={`p-6 h-full transition-all duration-300 ${quizAnswer === i ? "ring-2" : ""}`} style={quizAnswer === i ? { borderColor: opt.color, boxShadow: `0 0 20px ${opt.color}22` } as React.CSSProperties : undefined}>
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 border" style={{ background: `${opt.color}15`, borderColor: `${opt.color}33` }}>
                    <opt.icon size={28} weight="duotone" style={{ color: opt.color }} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{opt.label}</h3>
                  <AnimatePresence>
                    {quizAnswer === i && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={spring}>
                        <p className="text-sm leading-relaxed mt-2 pb-1" style={{ color: opt.color }}>{opt.recommendation}</p>
                        <PhoneLink phone={data.phone} className="inline-flex items-center gap-2 mt-3 text-sm font-semibold text-white">
                          <Phone size={14} weight="fill" /> Book Now
                        </PhoneLink>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </GlassCard>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 12. COMPARISON TABLE ─── */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #0c1218 50%, ${BG} 100%)` }} />
        <PawPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <AnimatedSection><SectionHeader badge="Why Choose Us" title={`${data.businessName} vs. The Competition`} accent={ACCENT} /></AnimatedSection>
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
                  {COMPARISON_ROWS.map((row) => (
                    <tr key={row.feature} className="border-b border-white/8">
                      <td className="p-4 text-slate-300">{row.feature}</td>
                      <td className="p-4 text-center"><CheckCircle size={20} weight="fill" className="mx-auto" style={{ color: "#22c55e" }} /></td>
                      <td className="p-4 text-center text-slate-500">{row.them}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* ─── 13. GOOGLE REVIEWS + TESTIMONIALS ─── */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #0d1218 50%, ${BG} 100%)` }} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          {data.googleRating && (
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full border" style={{ borderColor: `${ACCENT}22`, background: `${ACCENT}08` }}>
                <div className="flex gap-0.5">{Array.from({ length: 5 }).map((_, j) => <Star key={j} size={18} weight="fill" style={{ color: j < Math.round(data.googleRating || 5) ? "#fbbf24" : "#334155" }} />)}</div>
                <span className="text-white font-bold">{data.googleRating}</span>
                {data.reviewCount && <span className="text-slate-400 text-sm">({data.reviewCount}+ reviews)</span>}
              </div>
            </div>
          )}
          <AnimatedSection><SectionHeader badge="Testimonials" title="Pet Parent Love" accent={ACCENT} /></AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <GlassCard key={i} className="p-6 h-full flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <PawPrint size={18} weight="fill" style={{ color: ACCENT }} />
                  <span className="text-sm font-semibold text-white">{t.name}</span>
                </div>
                <div className="flex gap-0.5 mb-4">{Array.from({ length: t.rating || 5 }).map((_, j) => <Star key={j} size={18} weight="fill" style={{ color: "#fbbf24" }} />)}</div>
                <p className="text-slate-300 leading-relaxed flex-1 text-sm mb-4">&ldquo;{t.text}&rdquo;</p>
                <div className="pt-4 border-t border-white/8 flex items-center gap-2">
                  <CheckCircle size={14} weight="fill" style={{ color: "#22c55e" }} />
                  <span className="text-xs text-slate-500">Verified Pet Parent</span>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 14. VIDEO PLACEHOLDER ─── */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #0c1218 50%, ${BG} 100%)` }} />
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <AnimatedSection><SectionHeader badge="See For Yourself" title="Tour Our Facility" accent={ACCENT} /></AnimatedSection>
          <div className="relative rounded-2xl overflow-hidden border border-white/15 aspect-video">
            <img src={galleryImages[0] || heroImage} alt="Facility tour" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full flex items-center justify-center border-2 border-white/30 backdrop-blur-md bg-white/10 cursor-pointer hover:bg-white/20 transition-colors">
                <div className="w-0 h-0 border-l-[16px] border-t-[10px] border-b-[10px] border-l-white border-t-transparent border-b-transparent ml-1" />
              </div>
            </div>
            <div className="absolute bottom-6 left-6 right-6 text-center">
              <p className="text-white font-semibold text-lg">Take a Virtual Tour</p>
              <p className="text-white/60 text-sm">See our play areas, suites, and grooming stations</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 15. CTA ─── */}
      <section className="relative z-10 py-20 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT}cc)` }} />
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <PawPrint size={48} weight="fill" className="mx-auto mb-6 text-black/60" />
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-black mb-4">New Client Special!</h2>
          <p className="text-lg text-black/70 mb-8 max-w-xl mx-auto">First-time visitors get a complimentary assessment. Your pet&apos;s happiness starts here.</p>
          <PhoneLink phone={data.phone} className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-black text-white font-bold text-lg hover:bg-black/80 transition-colors">
            <Phone size={20} weight="fill" /> {data.phone}
          </PhoneLink>
        </div>
      </section>

      {/* ─── 16. SERVICE AREA (Enhanced) ─── */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #0d1218 50%, ${BG} 100%)` }} />
        <PawPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Service Area" title="Where We Serve" accent={ACCENT} />
          <div className="text-center mb-8">
            <GlassCard className="p-8 inline-block">
              <div className="flex items-center gap-3 text-lg"><MapPin size={24} weight="duotone" style={{ color: ACCENT }} /><MapLink address={data.address} className="text-white font-semibold" /></div>
              <p className="text-slate-400 text-sm mt-2">&amp; Surrounding Areas</p>
              <div className="flex items-center justify-center gap-2 mt-4">
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#22c55e" }} />
                <span className="text-sm font-medium" style={{ color: "#22c55e" }}>Accepting New Clients</span>
              </div>
            </GlassCard>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto">
            {["Downtown", "Midtown", "Westside", "North End", "Eastside", "South End", "Suburbs", "Metro Area"].map((area) => (
              <div key={area} className="flex items-center gap-2 px-4 py-3 rounded-xl border border-white/8 bg-white/[0.08]">
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
            <span className="text-sm text-slate-400">In-home visits and pick-up/drop-off available in all areas</span>
          </div>
        </div>
      </section>

      {/* ─── 16a-2. HOURS & AVAILABILITY ─── */}
      {data.hours && (
        <section className="relative z-10 py-20 overflow-hidden">
          <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #0c1218 50%, ${BG} 100%)` }} />
          <PawPattern opacity={0.02} accent={ACCENT} />
          <div className="max-w-3xl mx-auto px-6 relative z-10">
            <SectionHeader badge="Hours" title="When We Are Open" accent={ACCENT} />
            <GlassCard className="p-8 text-center">
              <Clock size={32} weight="duotone" style={{ color: ACCENT }} className="mx-auto mb-4" />
              <p className="text-slate-300 leading-relaxed whitespace-pre-line text-lg mb-4">{data.hours}</p>
              <div className="flex flex-wrap justify-center gap-3">
                {["Early Drop-Off", "Late Pickup", "Holiday Boarding", "Weekend Hours"].map((item) => (
                  <span key={item} className="px-3 py-1.5 rounded-full text-xs font-medium border" style={{ color: ACCENT, borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}>
                    {item}
                  </span>
                ))}
              </div>
            </GlassCard>
          </div>
        </section>
      )}

      {/* ─── 16b. MID-PAGE CTA ─── */}
      <section className="relative z-10 py-12 sm:py-16 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${ACCENT}15, ${ACCENT}08)` }} />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: ACCENT }}>Don&apos;t Miss Out</p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-3">Ready to Get Started?</h2>
          <p className="text-slate-400 mb-6 text-sm sm:text-base">Limited time &mdash; claim your free professional website today before it&apos;s offered to a competitor.</p>
          <a href={`/claim/${data.id}`} className="inline-flex items-center gap-2 min-h-[48px] px-8 py-3 rounded-full text-white font-bold text-base hover:shadow-lg transition-all duration-300" style={{ background: ACCENT }}>
            Claim This Website
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
          </a>
        </div>
      </section>

      {/* ─── 16c. FACILITY AMENITIES ─── */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #0d1218 50%, ${BG} 100%)` }} />
        <PawPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Facility" title="Our Pet Paradise" subtitle="State-of-the-art amenities designed for your pet's comfort and safety." accent={ACCENT} />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { title: "Indoor Play Areas", desc: "Climate-controlled zones with soft flooring and toys", icon: Dog },
              { title: "Outdoor Yards", desc: "Secure fenced yards with shade structures and water stations", icon: Sun },
              { title: "Grooming Station", desc: "Professional grooming with premium pet-safe products", icon: Scissors },
              { title: "Nap Rooms", desc: "Quiet rest areas with cozy beds and calming music", icon: Heart },
              { title: "Splash Pool", desc: "Supervised water play for water-loving breeds", icon: PawPrint },
              { title: "Webcam Access", desc: "Watch your pet play live from anywhere on your phone", icon: Star },
            ].map((item, i) => {
              const tile = pickPaletteColor(i + 2);
              return (
              <GlassCard key={item.title} className="p-5 text-center">
                <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ background: `${tile}22`, border: `1px solid ${tile}55` }}>
                  <item.icon size={22} weight="duotone" style={{ color: tile }} />
                </div>
                <h4 className="text-sm font-bold text-white mb-1">{item.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
              </GlassCard>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── 16d. PET TRAINING TIPS ─── */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #0c1218 50%, ${BG} 100%)` }} />
        <PawPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Tips" title="Pet Care Tips" subtitle="Expert advice from our team to keep your pet happy and healthy." accent={ACCENT} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { icon: Dog, title: "Socialization Matters", desc: "Introduce your pet to new environments, people, and animals early. Positive social experiences reduce anxiety and improve behavior in group settings." },
              { icon: Heart, title: "Consistent Routine", desc: "Pets thrive on routine. Keep feeding, walking, and bedtime schedules consistent to reduce stress and build trust with your furry friend." },
              { icon: FirstAid, title: "Regular Health Checks", desc: "Annual vet visits catch health issues early. Keep vaccinations current and watch for changes in appetite, energy, or behavior." },
              { icon: PawPrint, title: "Mental Stimulation", desc: "Puzzle toys, training sessions, and interactive play prevent boredom and destructive behavior. A tired pet is a happy pet." },
              { icon: Sun, title: "Exercise Daily", desc: "Every dog needs daily exercise matched to their breed and age. Even senior pets benefit from gentle walks and light play sessions." },
              { icon: HandHeart, title: "Positive Reinforcement", desc: "Reward good behavior with treats and praise. Positive training methods build a stronger bond and produce longer-lasting results." },
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

      {/* ─── 16d. SEASONAL PET CARE CALENDAR ─── */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #0d1218 50%, ${BG} 100%)` }} />
        <PawPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Seasonal" title="Year-Round Pet Care" subtitle="Every season brings unique needs for your pet. Here is what to keep in mind." accent={ACCENT} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { season: "Spring", color: "#22c55e", items: ["Flea & tick prevention", "Allergy awareness", "Update vaccinations", "Spring grooming"] },
              { season: "Summer", color: "#f59e0b", items: ["Hydration & shade", "Paw pad protection", "Swimming safety", "Heat stroke awareness"] },
              { season: "Fall", color: "#f97316", items: ["Coat conditioning", "Indoor exercise plans", "Holiday safety tips", "Weight management"] },
              { season: "Winter", color: "#3b82f6", items: ["Cold weather gear", "Antifreeze safety", "Indoor enrichment", "Joint care for seniors"] },
            ].map((s) => (
              <GlassCard key={s.season} className="p-6">
                <div className="w-10 h-10 rounded-full mb-4 flex items-center justify-center" style={{ background: `${s.color}20`, border: `1px solid ${s.color}33` }}>
                  <CalendarBlank size={20} weight="duotone" style={{ color: s.color }} />
                </div>
                <h4 className="text-lg font-bold text-white mb-3">{s.season}</h4>
                <ul className="space-y-2">
                  {s.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-slate-400">
                      <CheckCircle size={14} weight="fill" className="mt-0.5 shrink-0" style={{ color: s.color }} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 16e. WHY CHOOSE US ─── */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #0c1218 50%, ${BG} 100%)` }} />
        <PawPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Our Promise" title="Why Pet Parents Choose Us" accent={ACCENT} />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: ShieldCheck, title: "Background Checked", desc: "Every team member passes comprehensive background checks and training." },
              { icon: FirstAid, title: "Pet First Aid", desc: "Staff certified in pet CPR and first aid for emergencies." },
              { icon: SealCheck, title: "Bonded & Insured", desc: "Full liability coverage for your peace of mind." },
              { icon: Heart, title: "Cage-Free Play", desc: "Open play areas supervised by trained handlers at all times." },
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

      {/* ─── 16f. BOARDING PACKAGES ─── */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #0c1218 50%, ${BG} 100%)` }} />
        <PawPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Packages" title="Boarding & Care Packages" subtitle="Flexible options for every pet and every schedule." accent={ACCENT} />
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Day Care", price: "$35/day", desc: "Full day of supervised play, socialization, and rest", features: ["8am-6pm", "Group play sessions", "Lunch included", "Daily report card"] },
              { name: "Overnight", price: "$55/night", desc: "Comfortable overnight stay with evening walks and bedtime routine", features: ["24-hour care", "Evening walk", "Cozy sleeping area", "Breakfast & dinner"], popular: true },
              { name: "Extended Stay", price: "$45/night", desc: "5+ night stays at a discounted rate with all premium amenities", features: ["Discounted rate", "All amenities", "Webcam access", "Weekly grooming"] },
            ].map((pkg) => (
              <GlassCard key={pkg.name} className={`p-6 ${pkg.popular ? "ring-1" : ""}`} style={pkg.popular ? { borderColor: ACCENT } : undefined}>
                {pkg.popular && <div className="text-center mb-3"><span className="px-3 py-1 rounded-full text-xs font-bold text-white" style={{ background: ACCENT }}>Most Popular</span></div>}
                <h3 className="text-lg font-bold text-white mb-1">{pkg.name}</h3>
                <div className="text-3xl font-extrabold mb-2" style={{ color: ACCENT }}>{pkg.price}</div>
                <p className="text-sm text-slate-400 mb-4">{pkg.desc}</p>
                <ul className="space-y-2">
                  {pkg.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                      <CheckCircle size={14} weight="fill" style={{ color: ACCENT }} /> {f}
                    </li>
                  ))}
                </ul>
              </GlassCard>
            ))}
          </div>
          <p className="text-center text-xs text-slate-500 mt-6">All prices are per pet. Multi-pet discounts available. Meet and greet required for first-time visitors.</p>
          <p className="text-center text-xs text-slate-600 mt-2">
            Holiday and peak season rates may apply. Ask about our loyalty rewards program for frequent visitors.
          </p>
        </div>
      </section>

      {/* ─── 16g. MID-PAGE CTA ─── */}
      <section className="relative z-10 py-16 overflow-hidden">
        <div className="absolute inset-0" style={{ background: ACCENT }} />
        <div className="absolute inset-0 bg-black/20" />
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">Your Pet Deserves the Best Care</h2>
          <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">Book a meet and greet today. We will get to know your pet and create a customized care plan just for them.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <PhoneLink phone={data.phone} className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-sm font-bold" style={{ color: ACCENT }}>
              <Phone size={18} weight="fill" /> Call Now
            </PhoneLink>
            <a href="#contact" className="inline-flex items-center gap-2 px-8 py-4 rounded-full border-2 border-white text-white text-sm font-bold hover:bg-white/10 transition-colors">
              Book a Visit <ArrowRight size={18} weight="bold" />
            </a>
          </div>
        </div>
      </section>

      {/* ─── 17. FAQ ─── */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #0c1218 50%, ${BG} 100%)` }} />
        <PawPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <AnimatedSection><SectionHeader badge="FAQ" title="Common Questions" accent={ACCENT} /></AnimatedSection>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} question={faq.q} answer={faq.a} isOpen={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── 18. CONTACT ─── */}
      <section id="contact" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #0d1218 50%, ${BG} 100%)` }} />
        <PawPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: ACCENT, borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}>Contact Us</span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6 text-white">Book Your Pet&apos;s Visit</h2>
              <p className="text-slate-400 leading-relaxed mb-8">Contact {data.businessName} to schedule your pet&apos;s next visit. First-time clients get a complimentary assessment.</p>
              <div className="space-y-5">
                <div className="flex items-start gap-4"><div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: ACCENT_GLOW }}><MapPin size={20} weight="duotone" style={{ color: ACCENT }} /></div><div><p className="text-sm font-semibold text-white">Address</p><MapLink address={data.address} className="text-sm text-slate-400" /></div></div>
                <div className="flex items-start gap-4"><div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: ACCENT_GLOW }}><Phone size={20} weight="duotone" style={{ color: ACCENT }} /></div><div><p className="text-sm font-semibold text-white">Phone</p><PhoneLink phone={data.phone} className="text-sm text-slate-400" /></div></div>
                {data.hours && <div className="flex items-start gap-4"><div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: ACCENT_GLOW }}><Clock size={20} weight="duotone" style={{ color: ACCENT }} /></div><div><p className="text-sm font-semibold text-white">Hours</p><p className="text-sm text-slate-400 whitespace-pre-line">{data.hours}</p></div></div>}
              </div>
            </div>
            <GlassCard className="p-8">
              <h3 className="text-xl font-semibold text-white mb-6">Book an Appointment</h3>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className="block text-sm text-slate-400 mb-1.5">Your Name</label><input type="text" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 focus:outline-none text-sm" placeholder="Your name" /></div>
                  <div><label className="block text-sm text-slate-400 mb-1.5">Pet&apos;s Name</label><input type="text" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 focus:outline-none text-sm" placeholder="Pet's name" /></div>
                </div>
                <div><label className="block text-sm text-slate-400 mb-1.5">Phone</label><input type="tel" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 focus:outline-none text-sm" placeholder="(555) 123-4567" /></div>
                <div><label className="block text-sm text-slate-400 mb-1.5">Pet Type</label>
                  <select className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white focus:outline-none text-sm">
                    <option value="" className="bg-neutral-900">Select pet type</option>
                    <option value="dog" className="bg-neutral-900">Dog</option>
                    <option value="cat" className="bg-neutral-900">Cat</option>
                    <option value="other" className="bg-neutral-900">Other</option>
                  </select>
                </div>
                <div><label className="block text-sm text-slate-400 mb-1.5">Service</label>
                  <select className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white focus:outline-none text-sm">
                    <option value="" className="bg-neutral-900">Select a service</option>
                    {data.services.map((s) => <option key={s.name} value={s.name.toLowerCase()} className="bg-neutral-900">{s.name}</option>)}
                  </select>
                </div>
                <MagneticButton className="w-full py-4 rounded-xl text-base font-semibold text-black flex items-center justify-center gap-2 cursor-pointer" style={{ background: ACCENT } as React.CSSProperties}>Book Now <ArrowRight size={18} weight="bold" /></MagneticButton>
              </form>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* ─── 19. GUARANTEE ─── */}
      <section className="relative z-10 py-16 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #0c1218 100%)` }} />
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <ShimmerBorder accent={ACCENT}>
            <div className="p-8 md:p-12">
              <Heart size={48} weight="fill" style={{ color: ACCENT }} className="mx-auto mb-4" />
              <h2 className="text-2xl md:text-4xl font-extrabold text-white mb-4">Our Happy Pet Guarantee</h2>
              <p className="text-slate-400 leading-relaxed max-w-2xl mx-auto text-lg mb-2">{data.businessName} guarantees a safe, fun, and loving experience for every pet. If your pet is not happy, we will make it right.</p>
              <p className="text-slate-500 text-sm max-w-xl mx-auto">
                Every member of our team is background-checked, pet first aid certified,
                and genuinely passionate about animal care. Your pet is family to us.
              </p>
              <div className="flex flex-wrap justify-center gap-4 mt-8">
                {["Certified Staff", "Pet First Aid", "Photo Updates", "Satisfaction Guaranteed", "Bonded & Insured", "Cage-Free Play", "Clean Facility"].map((item) => (
                  <span key={item} className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border" style={{ color: ACCENT, borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}>
                    <CheckCircle size={16} weight="fill" /> {item}
                  </span>
                ))}
              </div>
            </div>
          </ShimmerBorder>
        </div>
      </section>

      {/* ─── 20. FOOTER ─── */}
      <footer className="relative z-10 border-t border-white/8 py-10 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #060a0f 100%)` }} />
        <div className="mx-auto max-w-6xl px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3"><PawPrint size={22} weight="fill" style={{ color: ACCENT }} /><span className="text-lg font-bold text-white">{data.businessName}</span></div>
              <p className="text-sm text-slate-500 leading-relaxed">{data.about.length > 120 ? data.about.slice(0, 120).trim() + "..." : data.about}</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-3">Quick Links</h4>
              <div className="space-y-2">{["Services", "Gallery", "About", "Contact"].map((l) => <a key={l} href={`#${l.toLowerCase()}`} className="block text-sm text-slate-500 hover:text-white transition-colors">{l}</a>)}</div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-3">Contact</h4>
              <div className="space-y-2 text-sm text-slate-500">
                <p><PhoneLink phone={data.phone} /></p>
                <p><MapLink address={data.address} /></p>
                {data.socialLinks && Object.entries(data.socialLinks).map(([p, url]) => <a key={p} href={url} target="_blank" rel="noopener noreferrer" className="block hover:text-white transition-colors capitalize">{p}</a>)}
              </div>
            </div>
          </div>
          <div className="border-t border-white/8 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-500"><PawPrint size={14} weight="fill" style={{ color: ACCENT }} /><span>{data.businessName} &copy; {new Date().getFullYear()}</span></div>
            <div className="flex items-center gap-2 text-xs text-slate-600"><BluejayLogo className="w-4 h-4" /><span>Created by <a href="https://bluejayportfolio.com" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "underline" }}>bluejayportfolio.com</a></span></div>
          </div>
        </div>
      </footer>

      <ClaimBanner businessName={data.businessName} accentColor={ACCENT} prospectId={data.id} />
      <div className="h-14 md:h-28" />
    </main>
  );
}
