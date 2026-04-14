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
  Barbell,
  Heartbeat,
  Lightning,
  Users,
  Timer,
  ArrowRight,
  Phone,
  MapPin,
  Clock,
  Fire,
  PersonSimpleRun,
  Medal,
  Star,
  ShieldCheck,
  CheckCircle,
  CaretDown,
  X,
  List,
} from "@phosphor-icons/react";
import type { GeneratedSiteData } from "@/lib/generator";
import BluejayLogo from "../BluejayLogo";
import { MapLink, PhoneLink } from "@/components/templates/MapLink";
import ClaimBanner from "@/components/ClaimBanner";
import { pickFromPool, pickGallery } from "@/lib/stock-image-picker";

/* ───────────────────────── SPRING CONFIGS ───────────────────────── */
const spring = { type: "spring" as const, stiffness: 100, damping: 20 };
const springFast = { type: "spring" as const, stiffness: 200, damping: 25 };

/* ───────────────────────── COLORS ───────────────────────── */
const CHARCOAL = "#0a0a0a";
const DEFAULT_RED = "#dc2626";
const RED_LIGHT = "#ef4444";

function getAccent(accentColor?: string) {
  const c = accentColor || DEFAULT_RED;
  return { RED: c, RED_GLOW: `${c}26` };
}

/* ───────────────────────── SERVICE ICON MAP ───────────────────────── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SERVICE_ICON_MAP: Record<string, any> = {
  hiit: Lightning,
  cardio: Heartbeat,
  strength: Barbell,
  weight: Barbell,
  yoga: PersonSimpleRun,
  stretch: PersonSimpleRun,
  spin: Heartbeat,
  boot: Fire,
  circuit: Fire,
  crossfit: Lightning,
  personal: Users,
  training: Barbell,
  boxing: Fire,
  martial: Fire,
  swim: Heartbeat,
  class: Users,
  group: Users,
  nutrition: Medal,
};

function getServiceIcon(serviceName: string) {
  const lower = serviceName.toLowerCase();
  for (const [key, Icon] of Object.entries(SERVICE_ICON_MAP)) {
    if (lower.includes(key)) return Icon;
  }
  return Barbell;
}

/* ───────────────────────── STOCK FALLBACK IMAGES (UNIQUE TO FITNESS) ───────────────────────── */
const STOCK_HERO_POOL = ["https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1400&q=80"];
const STOCK_ABOUT_POOL = ["https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=600&q=80"];
const STOCK_GALLERY = [
  "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=600&q=80",
  "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&q=80",
  "https://images.unsplash.com/photo-1576678927484-cc907957088c?w=800&q=80",
  "https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=800&q=80",
];

/* ───────────────────────── ENERGY PARTICLES ───────────────────────── */
function EnergyParticles({ accent }: { accent: string }) {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 8,
    duration: 6 + Math.random() * 8,
    size: 1 + Math.random() * 2,
    opacity: 0.15 + Math.random() * 0.25,
  }));

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden hidden md:block">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{ left: `${p.x}%`, width: p.size, height: p.size, backgroundColor: accent, opacity: p.opacity }}
          animate={{ y: [800, -20] }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "linear" }}
        />
      ))}
    </div>
  );
}

/* ───────────────────────── HEARTBEAT LINE SVG ───────────────────────── */
function HeartbeatLine({ accent }: { accent: string }) {
  return (
    <div className="absolute inset-0 flex items-center pointer-events-none overflow-hidden opacity-20">
      <svg viewBox="0 0 1200 200" className="w-full h-32" preserveAspectRatio="none">
        <motion.path
          d="M0 100 L200 100 L230 100 L250 40 L270 160 L290 60 L310 140 L330 80 L350 100 L600 100 L630 100 L650 30 L670 170 L690 50 L710 150 L730 70 L750 100 L1000 100 L1030 100 L1050 40 L1070 160 L1090 60 L1110 140 L1130 80 L1150 100 L1200 100"
          fill="none"
          stroke={accent}
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />
      </svg>
    </div>
  );
}

/* ───────────────────────── FITNESS PATTERN ───────────────────────── */
function FitnessPattern({ opacity = 0.03, accent }: { opacity?: number; accent: string }) {
  const pid = `fitPatPrev-${accent.replace("#", "")}`;
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }}>
      <defs>
        <pattern id={pid} width="80" height="80" patternUnits="userSpaceOnUse">
          <line x1="0" y1="40" x2="80" y2="40" stroke={accent} strokeWidth="0.3" />
          <line x1="40" y1="0" x2="40" y2="80" stroke={accent} strokeWidth="0.3" />
          <circle cx="40" cy="40" r="3" fill="none" stroke={accent} strokeWidth="0.5" />
          <circle cx="40" cy="40" r="1" fill={accent} opacity="0.3" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${pid})`} />
    </svg>
  );
}

/* ───────────────────────── GLASS CARD ───────────────────────── */
function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] ${className}`}>
      {children}
    </div>
  );
}

/* ───────────────────────── MAGNETIC BUTTON ───────────────────────── */
function MagneticButton({ children, className = "", onClick, style, href }: {
  children: React.ReactNode; className?: string; onClick?: () => void; style?: React.CSSProperties; href?: string;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, springFast);
  const springY = useSpring(y, springFast);
  const isTouchDevice = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current || isTouchDevice) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left - rect.width / 2) * 0.25);
    y.set((e.clientY - rect.top - rect.height / 2) * 0.25);
  }, [x, y, isTouchDevice]);

  const handleMouseLeave = useCallback(() => { x.set(0); y.set(0); }, [x, y]);

  if (href) {
    return <motion.a href={href} ref={ref as unknown as React.Ref<HTMLAnchorElement>} style={{ x: springX, y: springY, willChange: "transform", ...style }} onMouseMove={handleMouseMove as unknown as React.MouseEventHandler<HTMLAnchorElement>} onMouseLeave={handleMouseLeave} className={className} whileTap={{ scale: 0.97 }}>{children}</motion.a>;
  }
  return <motion.button ref={ref} style={{ x: springX, y: springY, willChange: "transform", ...style }} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} onClick={onClick} className={className} whileTap={{ scale: 0.97 }}>{children}</motion.button>;
}

/* ───────────────────────── SHIMMER BORDER ───────────────────────── */
function ShimmerBorder({ children, className = "", accent }: { children: React.ReactNode; className?: string; accent: string }) {
  return (
    <div className={`relative rounded-2xl p-[1px] overflow-hidden ${className}`}>
      <motion.div className="absolute inset-0 rounded-2xl" style={{ background: `conic-gradient(from 0deg, transparent, ${accent}, transparent, ${RED_LIGHT}, transparent)`, willChange: "transform" }} animate={{ rotate: [0, 360] }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} />
      <div className="relative rounded-2xl bg-[#0a0a0a] z-10">{children}</div>
    </div>
  );
}

/* ───────────────────────── ACCORDION ITEM ───────────────────────── */
function AccordionItem({ question, answer, isOpen, onToggle }: { question: string; answer: string; isOpen: boolean; onToggle: () => void }) {
  return (
    <GlassCard className="overflow-hidden">
      <button onClick={onToggle} className="w-full flex items-center justify-between p-5 md:p-6 text-left group cursor-pointer">
        <span className="text-lg font-semibold text-white pr-4">{question}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={spring}><CaretDown size={20} className="text-zinc-400 shrink-0" /></motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={spring} className="overflow-hidden"><p className="px-5 pb-5 md:px-6 md:pb-6 text-zinc-400 leading-relaxed">{answer}</p></motion.div>)}
      </AnimatePresence>
    </GlassCard>
  );
}

/* ───────────────────────── SECTION HEADER ───────────────────────── */
function SectionHeader({ badge, title, subtitle, accent }: { badge: string; title: string; subtitle?: string; accent: string }) {
  return (
    <div className="text-center mb-16">
      <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: accent, borderColor: `${accent}33`, background: `${accent}0d` }}>{badge}</span>
      <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-white">{title}</h2>
      <div className="h-0.5 w-16 mx-auto mt-4" style={{ background: `linear-gradient(to right, ${accent}, transparent)` }} />
      {subtitle && <p className="text-zinc-400 mt-4 max-w-2xl text-lg leading-relaxed mx-auto">{subtitle}</p>}
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════════
   MAIN PREVIEW COMPONENT
   ═══════════════════════════════════════════════════════════════════ */
/* ───────────────────────── ANIMATED SECTION ───────────────────────── */
function AnimatedSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, ease: "easeOut" as const }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const COMPARISON_ROWS = [
  { feature: "Certified Personal Trainers", us: true, them: "Varies" },
  { feature: "Free Trial Available", us: true, them: "No" },
  { feature: "Custom Workout Plans", us: true, them: "Extra Cost" },
  { feature: "Nutrition Guidance", us: true, them: "No" },
  { feature: "Flexible Membership Plans", us: true, them: "Annual Lock-in" },
  { feature: "Group Classes Included", us: true, them: "Extra Cost" },
  { feature: "Open Early & Late Hours", us: true, them: "Limited" },
];

const PRICING_TIERS = [
  { title: "Basic", price: "$29", period: "/month", features: ["Full gym access", "Locker room", "Free WiFi", "Basic equipment"], featured: false },
  { title: "Premium", price: "$59", period: "/month", features: ["Everything in Basic", "All group classes", "Personal training intro", "Nutrition consult", "Guest passes"], featured: true },
  { title: "Elite", price: "$99", period: "/month", features: ["Everything in Premium", "Unlimited PT sessions", "Recovery zone access", "Priority booking", "Meal planning"], featured: false },
];

const FITNESS_QUIZ_OPTIONS = [
  { label: "Lose Weight", desc: "Burn fat, build lean muscle, and feel great.", color: "#22c55e" },
  { label: "Build Muscle", desc: "Strength training programs for all levels.", color: "#3b82f6" },
  { label: "Improve Endurance", desc: "Cardio, HIIT, and conditioning classes.", color: "#f59e0b" },
  { label: "Just Stay Active", desc: "Flexible workouts that fit your lifestyle.", color: "#a855f7" },
];

export default function V2FitnessPreview({ data }: { data: GeneratedSiteData }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);

  const { RED, RED_GLOW } = getAccent(data.accentColor);

  const uniquePhotos = data.photos ? [...new Set(data.photos)] : [];


  const heroImage = uniquePhotos[0] || pickFromPool(STOCK_HERO_POOL, data.businessName);


  const heroCardImage = uniquePhotos[1] || pickFromPool(STOCK_ABOUT_POOL, data.businessName, 1);


  const aboutImage = uniquePhotos[2] || pickFromPool(STOCK_ABOUT_POOL, data.businessName, 2);
  const galleryImages = data.photos?.length > 2 ? data.photos.slice(2, 6) : pickGallery(STOCK_GALLERY, data.businessName);
  const phoneDigits = data.phone.replace(/\D/g, "");

  const processSteps = [
    { step: "01", title: "Free Trial", desc: "Walk in or sign up online. Your first session is completely free, no commitment required." },
    { step: "02", title: "Fitness Assessment", desc: "Our trainers evaluate your current level, goals, and create a personalized roadmap." },
    { step: "03", title: "Start Training", desc: "Hit the floor with expert coaching, state-of-the-art equipment, and a motivated community." },
    { step: "04", title: "See Results", desc: "Track your progress, crush your goals, and unlock your full potential." },
  ];

  const faqs = [
    { q: `What programs does ${data.businessName} offer?`, a: `We offer a wide range of fitness programs including ${data.services.slice(0, 3).map(s => s.name).join(", ")}, and more. Contact us to find the right program for you.` },
    { q: "Do you offer personal training?", a: "Yes, we have certified personal trainers available for one-on-one sessions tailored to your specific goals and fitness level." },
    { q: "Is there a free trial?", a: `Absolutely. ${data.businessName} offers a complimentary first visit so you can experience our facility, equipment, and community before committing.` },
    { q: "What are the membership options?", a: "We offer flexible membership plans including monthly, quarterly, and annual options. Contact us for current pricing and any special promotions." },
  ];

  /* Fallback testimonials */
  const fallbackTestimonials = [
    { name: "Alex T.", text: "Lost 30 pounds in four months. The trainers here actually care about your progress.", rating: 5 },
    { name: "Megan R.", text: "Best gym I've ever been to. Clean equipment, great classes, and an incredibly supportive community.", rating: 5 },
    { name: "Jason K.", text: "The personal training program completely changed my life. I'm stronger and more confident than ever.", rating: 5 }
  ];
  const testimonials = data.testimonials?.length > 0 ? data.testimonials : fallbackTestimonials;

  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden" style={{ background: CHARCOAL, color: "#fff" }}>
      <EnergyParticles accent={RED} />

      {/* ══════════════════ 1. NAV ══════════════════ */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-4">
          <GlassCard className="flex items-center justify-between px-4 md:px-6 py-3">
            <div className="flex items-center gap-2">
              <Barbell size={24} weight="bold" style={{ color: RED }} />
              <span className="text-lg font-bold tracking-tight text-white">{data.businessName}</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm text-zinc-400">
              <a href="#programs" className="hover:text-white transition-colors">Programs</a>
              <a href="#about" className="hover:text-white transition-colors">About</a>
              <a href="#gallery" className="hover:text-white transition-colors">Gallery</a>
              <a href="#contact" className="hover:text-white transition-colors">Contact</a>
            </div>
            <div className="flex items-center gap-3">
              <MagneticButton className="px-4 md:px-5 py-2 rounded-full text-sm font-semibold text-white transition-colors cursor-pointer" style={{ background: RED } as React.CSSProperties}>
                Start Free Trial
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
                  {[{ label: "Programs", href: "#programs" }, { label: "About", href: "#about" }, { label: "Gallery", href: "#gallery" }, { label: "Contact", href: "#contact" }].map((link) => (
                    <a key={link.label} href={link.href} onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-lg text-sm text-zinc-300 hover:text-white hover:bg-white/5 transition-colors">{link.label}</a>
                  ))}
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* ══════════════════ 2. HERO ══════════════════ */}
      <section className="relative min-h-[100dvh] flex items-center pt-24 z-10 overflow-hidden">

        <div className="absolute inset-0">
          <img src={heroImage} alt={`${data.businessName}`} className="w-full h-full object-cover object-center" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        </div>
        <HeartbeatLine accent={RED} />

        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          <div className="space-y-8">
            <div>
              <p className="text-sm font-semibold tracking-[0.3em] uppercase mb-4" style={{ color: RED }}>{data.businessName}</p>
              <h1 className="text-3xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-none text-white">
                {data.tagline}
              </h1>
              <div className="h-1 w-24 rounded-full mt-4" style={{ backgroundColor: RED }} />
            </div>
            <p className="text-lg text-zinc-400 max-w-md leading-relaxed">
              {(() => { const t = data.about; if (t.length <= 180) return t; const dot = t.indexOf('.', 80); return dot > 0 && dot < 220 ? t.slice(0, dot + 1) : t.slice(0, 180).trim() + '...'; })()}
            </p>
            <div className="flex flex-wrap gap-4">
              <MagneticButton className="relative px-8 py-4 rounded-xl text-base font-bold text-white flex items-center gap-2 cursor-pointer overflow-hidden" style={{ background: RED } as React.CSSProperties}>
                <motion.span className="absolute inset-0 rounded-xl" style={{ boxShadow: `0 0 30px ${RED}` }} animate={{ opacity: [0.4, 0.8, 0.4] }} transition={{ duration: 2, repeat: Infinity }} />
                <span className="relative flex items-center gap-2">Get Started <ArrowRight size={18} weight="bold" /></span>
              </MagneticButton>
              <MagneticButton href={`tel:${phoneDigits}`} className="px-8 py-4 rounded-xl text-base font-bold text-zinc-300 border border-white/10 flex items-center gap-2 cursor-pointer hover:border-white/30 transition-colors">
                <Phone size={18} weight="bold" /> <PhoneLink phone={data.phone} />
              </MagneticButton>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-zinc-500">
              <span className="flex items-center gap-2"><MapPin size={16} /> <MapLink address={data.address} /></span>
              <span className="flex items-center gap-2"><Clock size={16} /> Open Early to Late</span>
            </div>
          </div>

          <div className="hidden md:block relative">
            <div className="relative rounded-2xl overflow-hidden border border-white/10">
              <img src={heroCardImage} alt={`${data.businessName} facility`} className="w-full h-[500px] object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 flex items-center gap-3">
                <div className="px-4 py-2 rounded-full backdrop-blur-md bg-black/50 border flex items-center gap-2" style={{ borderColor: `${RED}4d` }}>
                  <Fire size={18} weight="fill" style={{ color: RED }} />
                  <span className="text-sm font-semibold text-white">Now Open</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════ 3. STATS ══════════════════ */}
      <section className="relative z-10 py-16 overflow-hidden border-y" style={{ borderColor: `${RED}1a` }}>
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #080808 0%, #0a0a0a 100%)" }} />
        <FitnessPattern opacity={0.02} accent={RED} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] rounded-full blur-[180px]" style={{ background: `${RED}08` }} /></div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {data.stats.map((stat, i) => {
              const statIcons = [Users, Barbell, Fire, Star];
              const Icon = statIcons[i % statIcons.length];
              return (
                <div key={stat.label} className="text-center p-6 rounded-2xl backdrop-blur-md bg-white/[0.03] border border-white/[0.06]">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Icon size={22} weight="fill" style={{ color: RED }} />
                    <span className="text-3xl md:text-4xl font-black tracking-tighter text-white">{stat.value}</span>
                  </div>
                  <span className="text-zinc-500 text-sm font-medium tracking-wide uppercase">{stat.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════ 4. ABOUT ══════════════════ */}
      <section id="about" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #0a0a0a 0%, #080808 50%, #0a0a0a 100%)" }} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[20%] left-[10%] w-[500px] h-[500px] rounded-full blur-[180px]" style={{ background: `${RED}06` }} /></div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="relative">
              <div className="rounded-2xl overflow-hidden border border-white/10"><img src={aboutImage} alt={`${data.businessName} gym`} className="w-full h-[400px] object-cover" /></div>
              <div className="absolute -bottom-4 -right-4 md:bottom-6 md:-right-6">
                <div className="px-5 py-3 rounded-xl backdrop-blur-md border text-white font-bold text-sm shadow-lg" style={{ background: `${RED}e6`, borderColor: `${RED}80` }}>
                  {data.stats[0] ? `${data.stats[0].value} ${data.stats[0].label}` : "Results Driven"}
                </div>
              </div>
            </div>
            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: RED, borderColor: `${RED}33`, background: `${RED}0d` }}>About Us</span>
              <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-6 text-white">Your Coaches, Your Edge</h2>
              <p className="text-zinc-400 leading-relaxed mb-8">{data.about}</p>
              <div className="grid grid-cols-2 gap-4">
                {[{ icon: ShieldCheck, label: "Certified Trainers" }, { icon: Lightning, label: "Elite Equipment" }, { icon: Star, label: "Top Rated" }, { icon: Users, label: "Community Driven" }].map((badge) => (
                  <GlassCard key={badge.label} className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: RED_GLOW }}><badge.icon size={20} weight="bold" style={{ color: RED }} /></div>
                    <span className="text-sm font-semibold text-white">{badge.label}</span>
                  </GlassCard>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════ 5. PROGRAMS / SERVICES ══════════════════ */}
      <section id="programs" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #0a0a0a 0%, #080808 50%, #0a0a0a 100%)" }} />
        <FitnessPattern accent={RED} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[10%] right-[5%] w-[500px] h-[500px] rounded-full blur-[160px]" style={{ background: `${RED}08` }} /></div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Programs" title="Built to Break Your Limits" subtitle={`World-class programs designed to push you further. ${data.businessName} delivers results.`} accent={RED} />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.services.map((service, i) => {
              const Icon = getServiceIcon(service.name);
              return (
                <div key={service.name} className="group relative p-7 rounded-2xl border border-white/[0.06] hover:border-opacity-30 transition-all duration-500 overflow-hidden bg-white/[0.02]">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: `radial-gradient(circle at 50% 0%, ${RED}15, transparent 70%)` }} />
                  <div className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `linear-gradient(to right, transparent, ${RED}4d, transparent)` }} />
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-5">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 border" style={{ background: RED_GLOW, borderColor: `${RED}33` }}>
                        <Icon size={24} weight="bold" style={{ color: RED }} />
                      </div>
                      <span className="text-xs font-mono text-zinc-600">{String(i + 1).padStart(2, "0")}</span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{service.name}</h3>
                    <p className="text-sm text-zinc-500 leading-relaxed">{service.description || ""}</p>
                    {service.price && <p className="text-sm font-semibold mt-3" style={{ color: RED }}>{service.price}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════ 6. PROCESS ══════════════════ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #0a0a0a 0%, #080808 50%, #0a0a0a 100%)" }} />
        <FitnessPattern opacity={0.025} accent={RED} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <AnimatedSection>          <SectionHeader badge="Get Started" title="Your Journey Begins Here" accent={RED} /></AnimatedSection>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {processSteps.map((step, i) => (
              <div key={step.step} className="relative">
                {i < processSteps.length - 1 && <div className="hidden lg:block absolute top-10 left-[calc(50%+40px)] w-[calc(100%-80px)] h-px" style={{ background: `linear-gradient(to right, ${RED}33, ${RED}11)` }} />}
                <GlassCard className="p-6 text-center relative">
                  <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-black" style={{ background: `linear-gradient(135deg, ${RED}22, ${RED}0a)`, color: RED, border: `1px solid ${RED}33` }}>{step.step}</div>
                  <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">{step.desc}</p>
                </GlassCard>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ 7. GALLERY ══════════════════ */}
      <section id="gallery" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #0a0a0a 0%, #080808 50%, #0a0a0a 100%)" }} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[30%] left-[20%] w-[500px] h-[500px] rounded-full blur-[200px]" style={{ background: `${RED}06` }} /></div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <AnimatedSection>          <SectionHeader badge="Facility" title="Our Training Ground" accent={RED} /></AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {galleryImages.map((src, i) => {
              const titles = ["Strength Training Floor", "HIIT Studio", "Cardio Zone", "Recovery Area"];
              return (
                <div key={i} className="group relative rounded-2xl overflow-hidden border border-white/[0.06]">
                  <img src={src} alt={titles[i]} className="w-full h-64 object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6"><h3 className="text-lg font-bold text-white">{titles[i]}</h3></div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════ 8. COMPARISON TABLE ══════════════════ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #0a0a0a 0%, #080808 50%, #0a0a0a 100%)" }} />
        <FitnessPattern opacity={0.02} accent={RED} />
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <AnimatedSection><SectionHeader badge="Compare" title={`${data.businessName} vs. The Competition`} accent={RED} /></AnimatedSection>
          <GlassCard className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-6 py-4 text-sm font-semibold text-zinc-400">Feature</th>
                    <th className="px-6 py-4 text-sm font-semibold text-center" style={{ color: RED }}>{data.businessName}</th>
                    <th className="px-6 py-4 text-sm font-semibold text-center text-zinc-500">Other Gyms</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_ROWS.map((row, i) => (
                    <tr key={i} className="border-b border-white/5">
                      <td className="px-6 py-4 text-sm text-zinc-300">{row.feature}</td>
                      <td className="px-6 py-4 text-center">{row.us ? <CheckCircle size={20} weight="fill" className="inline" style={{ color: "#22c55e" }} /> : <span className="text-zinc-500 text-sm">{String(row.them)}</span>}</td>
                      <td className="px-6 py-4 text-center text-sm text-zinc-500">{row.them}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* ══════════════════ 8b. PRICING TIERS ══════════════════ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #080808 0%, #0a0a0a 50%, #080808 100%)" }} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <AnimatedSection><SectionHeader badge="Membership" title="Find Your Plan" subtitle="Flexible plans designed for every fitness level. No long-term contracts." accent={RED} /></AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PRICING_TIERS.map((tier) => (
              <GlassCard key={tier.title} className={`p-8 h-full flex flex-col ${tier.featured ? "ring-2" : ""}`} style={tier.featured ? { borderColor: RED, boxShadow: `0 0 30px ${RED}22` } as React.CSSProperties : undefined}>
                {tier.featured && <span className="inline-block self-start text-xs font-bold uppercase tracking-widest mb-4 px-3 py-1 rounded-full text-white" style={{ background: RED }}>Most Popular</span>}
                <h3 className="text-xl font-bold text-white mb-1">{tier.title}</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-black text-white">{tier.price}</span>
                  <span className="text-zinc-500 text-sm">{tier.period}</span>
                </div>
                <ul className="space-y-3 flex-1 mb-6">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-zinc-300"><CheckCircle size={16} weight="fill" style={{ color: RED }} />{f}</li>
                  ))}
                </ul>
                <PhoneLink phone={data.phone} className="block w-full py-3 rounded-xl text-center font-bold text-sm transition-all" style={tier.featured ? { background: RED, color: "#fff" } : { background: `${RED}15`, color: RED }}>
                  Get Started
                </PhoneLink>
              </GlassCard>
            ))}
          </div>
          <p className="text-center text-sm text-zinc-500 mt-8">Exact pricing may vary. Call for current rates and promotions.</p>
        </div>
      </section>

      {/* ══════════════════ 8c. FITNESS QUIZ ══════════════════ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #0a0a0a 0%, #080808 50%, #0a0a0a 100%)" }} />
        <FitnessPattern opacity={0.02} accent={RED} />
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <AnimatedSection><SectionHeader badge="Find Your Fit" title="What Is Your Fitness Goal?" accent={RED} /></AnimatedSection>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FITNESS_QUIZ_OPTIONS.map((opt, i) => (
              <button key={opt.label} onClick={() => setQuizAnswer(i)} className="text-left cursor-pointer">
                <GlassCard className={`p-6 h-full transition-all duration-300 ${quizAnswer === i ? "ring-2" : ""}`} style={quizAnswer === i ? { borderColor: opt.color, boxShadow: `0 0 20px ${opt.color}22` } as React.CSSProperties : undefined}>
                  <h4 className="text-lg font-bold text-white mb-1">{opt.label}</h4>
                  <p className="text-sm text-zinc-400">{opt.desc}</p>
                  {quizAnswer === i && (
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <PhoneLink phone={data.phone} className="inline-flex items-center gap-2 text-sm font-bold" style={{ color: opt.color }}>
                        <Phone size={16} weight="bold" /> Book a Free Consultation <ArrowRight size={14} />
                      </PhoneLink>
                    </div>
                  )}
                </GlassCard>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ 8d. VIDEO PLACEHOLDER ══════════════════ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #080808 0%, #0a0a0a 50%, #080808 100%)" }} />
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <AnimatedSection><SectionHeader badge="Virtual Tour" title="See Our Facility" accent={RED} /></AnimatedSection>
          <div className="relative rounded-2xl overflow-hidden border border-white/10 aspect-video">
            <img src={uniquePhotos[3] || pickFromPool(STOCK_GALLERY, data.businessName, 3)} alt={`${data.businessName} facility`} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform" style={{ background: `${RED}cc` }}>
                <svg viewBox="0 0 24 24" fill="white" className="w-8 h-8 ml-1"><polygon points="5,3 19,12 5,21" /></svg>
              </div>
            </div>
            <div className="absolute bottom-4 left-4 text-sm text-white/70">Take a virtual tour of {data.businessName}</div>
          </div>
        </div>
      </section>

      {/* ══════════════════ 8e. CERTIFICATIONS ROW ══════════════════ */}
      <section className="relative z-10 py-16 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #0a0a0a 0%, #080808 100%)" }} />
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <div className="flex flex-wrap justify-center gap-4">
            {["NASM Certified", "ACE Accredited", "CrossFit Affiliate", "CPR/AED Certified", "Nutrition Certified", "BBB A+ Rated"].map((cert) => (
              <span key={cert} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium border" style={{ color: RED, borderColor: `${RED}33`, background: `${RED}0d` }}>
                <ShieldCheck size={16} weight="fill" />{cert}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ 9. TESTIMONIALS ══════════════════ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #0a0a0a 0%, #080808 50%, #0a0a0a 100%)" }} />
        <FitnessPattern opacity={0.02} accent={RED} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          {/* Google Reviews Header */}
          <div className="flex flex-col items-center gap-2 mb-8">
            <div className="flex items-center gap-1">{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={22} weight="fill" style={{ color: "#facc15" }} />)}</div>
            <p className="text-white font-bold text-lg">{data.googleRating || "4.9"} out of 5</p>
            <span className="text-zinc-400 text-sm">based on {data.reviewCount || "100+"} Google reviews</span>
          </div>
          <AnimatedSection><SectionHeader badge="Results" title="Member Success Stories" accent={RED} /></AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <GlassCard key={i} className="p-6 h-full flex flex-col">
                <div className="flex gap-0.5 mb-4">{Array.from({ length: t.rating || 5 }).map((_, j) => <Star key={j} size={16} weight="fill" style={{ color: RED }} />)}</div>
                <p className="text-zinc-300 leading-relaxed flex-1 text-sm mb-4">&ldquo;{t.text}&rdquo;</p>
                <div className="pt-4 border-t border-white/5"><span className="text-sm font-semibold text-white">{t.name}</span></div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ 9. CTA ══════════════════ */}
      <section className="relative z-10 py-20 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${RED}, ${RED}cc, ${RED})` }} />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='40' height='40' fill='none'/%3E%3Cpath d='M0 0L40 40M40 0L0 40' stroke='%23000' stroke-width='0.5'/%3E%3C/svg%3E\")" }} />
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <Fire size={48} weight="fill" className="mx-auto mb-6 text-white/80" />
          <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-white mb-4">Ready to Transform?</h2>
          <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">Your first week is on us. No contracts, no pressure. Just results.</p>
          <PhoneLink phone={data.phone} className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-white font-bold text-lg hover:bg-white/90 transition-colors" style={{ color: RED }}>
            <Phone size={20} weight="bold" /> Claim Free Trial
          </PhoneLink>
        </div>
      </section>

      {/* ══════════════════ 10. LOCATION ══════════════════ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #0a0a0a 0%, #080808 50%, #0a0a0a 100%)" }} />
        <FitnessPattern opacity={0.02} accent={RED} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <AnimatedSection>          <SectionHeader badge="Location" title="Find Us" accent={RED} /></AnimatedSection>
          <div className="text-center"><GlassCard className="p-8 inline-block"><div className="flex items-center gap-3 text-lg"><MapPin size={24} weight="duotone" style={{ color: RED }} /><MapLink address={data.address} className="text-white font-semibold" /></div><p className="text-zinc-400 text-sm mt-2">Free parking available</p></GlassCard></div>
        </div>
      </section>

      {/* ══════════════════ 11. HOURS ══════════════════ */}
      {data.hours && (
        <section className="relative z-10 py-24 md:py-32 overflow-hidden">
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #0a0a0a 0%, #080808 50%, #0a0a0a 100%)" }} />
          <div className="max-w-3xl mx-auto px-6 relative z-10">
            <AnimatedSection>          <SectionHeader badge="Hours" title="When We Are Open" accent={RED} /></AnimatedSection>
            <div className="text-center"><ShimmerBorder accent={RED}><div className="p-8"><Clock size={32} weight="duotone" style={{ color: RED }} className="mx-auto mb-4" /><p className="text-zinc-300 leading-relaxed whitespace-pre-line text-lg">{data.hours}</p></div></ShimmerBorder></div>
          </div>
        </section>
      )}

      
      {/* ══════════════════ MID-PAGE CTA ══════════════════ */}
      <section className="relative z-10 py-12 sm:py-16 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${RED}15, ${RED}08)` }} />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: RED }}>
            Don&apos;t Miss Out
          </p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-3">
            Ready to Get Started?
          </h2>
          <p className="text-slate-400 mb-6 text-sm sm:text-base">
            Limited time — claim your free professional website today before it&apos;s offered to a competitor.
          </p>
          <a
            href={`/claim/${data.id}`}
            className="inline-flex items-center gap-2 min-h-[48px] px-8 py-3 rounded-full text-white font-bold text-base hover:shadow-lg transition-all duration-300"
            style={{ background: RED }}
          >
            Claim This Website
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </a>
        </div>
      </section>

      {/* ══════════════════ 12. FAQ ══════════════════ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #0a0a0a 0%, #080808 50%, #0a0a0a 100%)" }} />
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <AnimatedSection>          <SectionHeader badge="FAQ" title="Common Questions" accent={RED} /></AnimatedSection>
          <div className="space-y-3">{faqs.map((faq, i) => <AccordionItem key={i} question={faq.q} answer={faq.a} isOpen={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} />)}</div>
        </div>
      </section>

      {/* ══════════════════ 13. CONTACT ══════════════════ */}
      <section id="contact" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #0a0a0a 0%, #080808 50%, #0a0a0a 100%)" }} />
        <FitnessPattern opacity={0.02} accent={RED} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: RED, borderColor: `${RED}33`, background: `${RED}0d` }}>Contact</span>
              <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-6 text-white">Join the Movement</h2>
              <p className="text-zinc-400 leading-relaxed mb-8">Ready to start your fitness journey? Contact {data.businessName} today and take the first step.</p>
              <div className="space-y-5">
                <div className="flex items-start gap-4"><div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: RED_GLOW }}><MapPin size={20} weight="duotone" style={{ color: RED }} /></div><div><p className="text-sm font-semibold text-white">Location</p><MapLink address={data.address} className="text-sm text-zinc-400" /></div></div>
                <div className="flex items-start gap-4"><div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: RED_GLOW }}><Phone size={20} weight="bold" style={{ color: RED }} /></div><div><p className="text-sm font-semibold text-white">Phone</p><PhoneLink phone={data.phone} className="text-sm text-zinc-400" /></div></div>
                {data.hours && <div className="flex items-start gap-4"><div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: RED_GLOW }}><Clock size={20} weight="duotone" style={{ color: RED }} /></div><div><p className="text-sm font-semibold text-white">Hours</p><p className="text-sm text-zinc-400 whitespace-pre-line">{data.hours}</p></div></div>}
              </div>
            </div>
            <GlassCard className="p-8">
              <h3 className="text-xl font-semibold text-white mb-6">Start Your Free Trial</h3>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className="block text-sm text-zinc-400 mb-1.5">Name</label><input type="text" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none text-sm" placeholder="Your name" /></div>
                  <div><label className="block text-sm text-zinc-400 mb-1.5">Phone</label><input type="tel" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none text-sm" placeholder="(555) 123-4567" /></div>
                </div>
                <div><label className="block text-sm text-zinc-400 mb-1.5">Interest</label>
                  <select className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none text-sm">
                    <option value="" className="bg-neutral-900">Select a program</option>
                    {data.services.map((s) => <option key={s.name} value={s.name.toLowerCase().replace(/\s+/g, "-")} className="bg-neutral-900">{s.name}</option>)}
                  </select>
                </div>
                <div><label className="block text-sm text-zinc-400 mb-1.5">Message</label><textarea rows={3} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none text-sm resize-none" placeholder="Tell us about your fitness goals..." /></div>
                <MagneticButton className="w-full py-4 rounded-xl text-base font-bold text-white flex items-center justify-center gap-2 cursor-pointer" style={{ background: RED } as React.CSSProperties}>
                  Get Started <ArrowRight size={18} weight="bold" />
                </MagneticButton>
              </form>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* ══════════════════ 14. GUARANTEE ══════════════════ */}
      <section className="relative z-10 py-16 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #0a0a0a 0%, #080808 100%)" }} />
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <ShimmerBorder accent={RED}>
            <div className="p-8 md:p-12">
              <ShieldCheck size={48} weight="fill" style={{ color: RED }} className="mx-auto mb-4" />
              <h2 className="text-2xl md:text-4xl font-black text-white mb-4">Our Guarantee</h2>
              <p className="text-zinc-400 leading-relaxed max-w-2xl mx-auto text-lg">At {data.businessName}, we are committed to your transformation. Expert trainers, world-class equipment, and a community that pushes you to be your best.</p>
              <div className="flex flex-wrap justify-center gap-4 mt-8">
                {["Free Trial", "No Contracts", "Expert Trainers", "Results Guaranteed"].map((item) => (
                  <span key={item} className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border" style={{ color: RED, borderColor: `${RED}33`, background: `${RED}0d` }}><CheckCircle size={16} weight="fill" />{item}</span>
                ))}
              </div>
            </div>
          </ShimmerBorder>
        </div>
      </section>

      {/* ══════════════════ 15. FOOTER ══════════════════ */}
      <footer className="relative z-10 border-t border-white/5 py-10 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #0a0a0a 0%, #070707 100%)" }} />
        <div className="mx-auto max-w-6xl px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div><div className="flex items-center gap-2 mb-3"><Barbell size={22} weight="bold" style={{ color: RED }} /><span className="text-lg font-bold text-white">{data.businessName}</span></div><p className="text-sm text-zinc-500 leading-relaxed">{data.about.length > 120 ? data.about.slice(0, 120).trim() + "..." : data.about}</p></div>
            <div><h4 className="text-sm font-semibold text-white mb-3">Quick Links</h4><div className="space-y-2">{["Programs", "About", "Gallery", "Contact"].map((link) => <a key={link} href={`#${link.toLowerCase()}`} className="block text-sm text-zinc-500 hover:text-white transition-colors">{link}</a>)}</div></div>
            <div><h4 className="text-sm font-semibold text-white mb-3">Contact</h4><div className="space-y-2 text-sm text-zinc-500"><p><PhoneLink phone={data.phone} /></p><p><MapLink address={data.address} /></p>{data.socialLinks && Object.entries(data.socialLinks).map(([platform, url]) => <a key={platform} href={url} target="_blank" rel="noopener noreferrer" className="block hover:text-white transition-colors capitalize">{platform}</a>)}</div></div>
          </div>
          <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-zinc-500"><Barbell size={14} weight="bold" style={{ color: RED }} /><span>{data.businessName} &copy; {new Date().getFullYear()}</span></div>
            <div className="flex items-center gap-2 text-xs text-zinc-600"><BluejayLogo className="w-4 h-4" /><span>Created by <a href="https://bluejayportfolio.com" target="_blank" rel="noopener noreferrer" style={{textDecoration:"underline"}}>bluejayportfolio.com</a></span></div>
          </div>
        </div>
      </footer>

      <ClaimBanner businessName={data.businessName} accentColor={RED} prospectId={data.id} />
      <div className="h-14 md:h-28" />
    </main>
  );
}
