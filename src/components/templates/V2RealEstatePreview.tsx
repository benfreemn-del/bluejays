"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  AnimatePresence,
} from "framer-motion";
import {
  House,
  MapPin,
  Bed,
  Bathtub,
  ArrowsOutSimple,
  Phone,
  Envelope,
  ArrowRight,
  Buildings,
  ChartLineUp,
  CurrencyDollar,
  Star,
  Calendar,
  User,
  CheckCircle,
  ShieldCheck,
  CaretDown,
  Clock,
  X,
  List,
} from "@phosphor-icons/react";
import type { GeneratedSiteData } from "@/lib/generator";
import BluejayLogo from "../BluejayLogo";
import { MapLink, PhoneLink } from "@/components/templates/MapLink";
import ClaimBanner from "@/components/ClaimBanner";

/* ───────────────────────── SPRING CONFIGS ───────────────────────── */
const spring = { type: "spring" as const, stiffness: 100, damping: 20 };
const springFast = { type: "spring" as const, stiffness: 200, damping: 25 };

/* ───────────────────────── COLORS ───────────────────────── */
const BLACK = "#09090b";
const DEFAULT_GOLD = "#b8860b";
const GOLD_LIGHT = "#d4a017";

function getAccent(accentColor?: string) {
  const c = accentColor || DEFAULT_GOLD;
  return { GOLD: c, GOLD_GLOW: `${c}26` };
}

/* ───────────────────────── SERVICE ICON MAP ───────────────────────── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SERVICE_ICON_MAP: Record<string, any> = {
  buy: House,
  sell: CurrencyDollar,
  listing: House,
  market: ChartLineUp,
  invest: ChartLineUp,
  rental: Buildings,
  property: Buildings,
  commercial: Buildings,
  relocation: MapPin,
  staging: House,
  consult: User,
  apprais: CurrencyDollar,
  mortgage: CurrencyDollar,
};

function getServiceIcon(serviceName: string) {
  const lower = serviceName.toLowerCase();
  for (const [key, Icon] of Object.entries(SERVICE_ICON_MAP)) {
    if (lower.includes(key)) return Icon;
  }
  return House;
}

/* ───────────────────────── STOCK FALLBACK IMAGES (UNIQUE TO REAL ESTATE) ───────────────────────── */
const STOCK_HERO = "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1400&q=80";
const STOCK_ABOUT = "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&q=80";
const STOCK_GALLERY = [
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80",
  "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&q=80",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80",
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
];

/* ───────────────────────── GOLD PARTICLES ───────────────────────── */
function GoldParticles({ accent }: { accent: string }) {
  const particles = Array.from({ length: 25 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 10,
    duration: 8 + Math.random() * 10,
    size: 1 + Math.random() * 2,
    opacity: 0.1 + Math.random() * 0.2,
  }));

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden hidden md:block">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{ left: `${p.x}%`, width: p.size, height: p.size, backgroundColor: accent, opacity: p.opacity }}
          animate={{ y: [800, -20], x: [0, Math.sin(p.id) * 30, 0] }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "linear" }}
        />
      ))}
    </div>
  );
}

/* ───────────────────────── LUXURY PATTERN ───────────────────────── */
function LuxuryPattern({ opacity = 0.03, accent }: { opacity?: number; accent: string }) {
  const pid = `luxPatPrev-${accent.replace("#", "")}`;
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }}>
      <defs>
        <pattern id={pid} width="60" height="60" patternUnits="userSpaceOnUse">
          <rect x="10" y="10" width="40" height="40" fill="none" stroke={accent} strokeWidth="0.3" />
          <line x1="10" y1="10" x2="50" y2="50" stroke={accent} strokeWidth="0.2" />
          <line x1="50" y1="10" x2="10" y2="50" stroke={accent} strokeWidth="0.2" />
          <circle cx="30" cy="30" r="2" fill={accent} opacity="0.2" />
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
      <motion.div className="absolute inset-0 rounded-2xl" style={{ background: `conic-gradient(from 0deg, transparent, ${accent}, transparent, ${GOLD_LIGHT}, transparent)`, willChange: "transform" }} animate={{ rotate: [0, 360] }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} />
      <div className="relative rounded-2xl bg-[#09090b] z-10">{children}</div>
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

export default function V2RealEstatePreview({ data }: { data: GeneratedSiteData }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const { GOLD, GOLD_GLOW } = getAccent(data.accentColor);

  const heroImage = data.photos?.[0] || STOCK_HERO;
  const aboutImage = data.photos?.[1] || STOCK_ABOUT;
  const galleryImages = data.photos?.length > 2 ? data.photos.slice(2, 6) : STOCK_GALLERY;
  const phoneDigits = data.phone.replace(/\D/g, "");

  const processSteps = [
    { step: "01", title: "Consultation", desc: "We discuss your goals, timeline, and preferences to create a personalized strategy." },
    { step: "02", title: "Property Search", desc: "Our team curates a selection of properties that match your exact criteria." },
    { step: "03", title: "Expert Negotiation", desc: "We negotiate aggressively on your behalf to secure the best possible terms." },
    { step: "04", title: "Closing", desc: "We handle every detail through closing, ensuring a smooth and stress-free experience." },
  ];

  const faqs = [
    { q: `What services does ${data.businessName} offer?`, a: `We provide comprehensive real estate services including ${data.services.slice(0, 3).map(s => s.name).join(", ")}, and more. Contact us for a personalized consultation.` },
    { q: "Do you work with first-time buyers?", a: "Absolutely. We specialize in guiding first-time buyers through every step of the process, from pre-approval to closing." },
    { q: "How do you determine listing prices?", a: "We conduct thorough comparative market analysis using current sales data, market trends, and property condition to recommend an optimal listing price." },
    { q: "What areas do you serve?", a: `${data.businessName} serves ${data.address} and surrounding communities. Contact us to discuss your specific area.` },
  ];

  /* Fallback testimonials */
  const fallbackTestimonials = [
    { name: "Jennifer H.", text: "Found our dream home in just two weeks. The process was incredibly smooth and stress-free.", rating: 5 },
    { name: "Michael T.", text: "Sold above asking price in just ten days. Their market knowledge is unmatched.", rating: 5 },
    { name: "Amanda K.", text: "As first-time buyers, they guided us through everything. Patient, knowledgeable, and trustworthy.", rating: 5 }
  ];
  const testimonials = data.testimonials?.length > 0 ? data.testimonials : fallbackTestimonials;

  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden" style={{ background: BLACK, color: "#fff" }}>
      <GoldParticles accent={GOLD} />

      {/* ══════════════════ 1. NAV ══════════════════ */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-4">
          <GlassCard className="flex items-center justify-between px-4 md:px-6 py-3">
            <div className="flex items-center gap-2">
              <Buildings size={24} weight="bold" style={{ color: GOLD }} />
              <span className="text-lg font-bold tracking-tight text-white">{data.businessName}</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm text-zinc-400">
              <a href="#services" className="hover:text-white transition-colors">Services</a>
              <a href="#about" className="hover:text-white transition-colors">About</a>
              <a href="#gallery" className="hover:text-white transition-colors">Properties</a>
              <a href="#contact" className="hover:text-white transition-colors">Contact</a>
            </div>
            <div className="flex items-center gap-3">
              <MagneticButton className="px-4 md:px-5 py-2 rounded-full text-sm font-semibold text-black transition-colors cursor-pointer" style={{ background: GOLD } as React.CSSProperties}>
                Book Viewing
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
                  {[{ label: "Services", href: "#services" }, { label: "About", href: "#about" }, { label: "Properties", href: "#gallery" }, { label: "Contact", href: "#contact" }].map((link) => (
                    <a key={link.label} href={link.href} onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-lg text-sm text-zinc-300 hover:text-white hover:bg-white/5 transition-colors">{link.label}</a>
                  ))}
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* ══════════════════ 2. HERO — CINEMATIC ══════════════════ */}
      <section className="relative min-h-[100dvh] flex items-center pt-24 z-10 overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImage} alt="Luxury property" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#09090b] via-[#09090b]/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-transparent to-[#09090b]/40" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6 w-full">
          <div className="max-w-2xl space-y-8">
            <div>
              <p className="text-sm font-semibold tracking-[0.3em] uppercase mb-6" style={{ color: GOLD }}>{data.businessName}</p>
              <h1 className="text-3xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-none text-white" style={{ textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>
                {data.tagline}
              </h1>
              <div className="h-px w-24 mt-6" style={{ backgroundColor: GOLD }} />
            </div>
            <p className="text-lg text-zinc-400 leading-relaxed max-w-lg">
              {data.about.length > 160 ? data.about.slice(0, 160).trim() + "..." : data.about}
            </p>
            <div className="flex flex-wrap gap-4">
              <MagneticButton className="px-8 py-4 rounded-xl text-base font-bold text-black flex items-center gap-2 cursor-pointer" style={{ background: GOLD } as React.CSSProperties}>
                Explore Properties <ArrowRight size={18} weight="bold" />
              </MagneticButton>
              <MagneticButton href={`tel:${phoneDigits}`} className="px-8 py-4 rounded-xl text-base font-bold text-zinc-300 border border-white/10 flex items-center gap-2 cursor-pointer hover:border-white/20 transition-colors">
                <Phone size={18} weight="bold" /> <PhoneLink phone={data.phone} />
              </MagneticButton>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#09090b] to-transparent z-20" />
      </section>

      {/* ══════════════════ 3. STATS ══════════════════ */}
      <section className="relative z-10 py-16 overflow-hidden border-y" style={{ borderColor: `${GOLD}1a` }}>
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #070707 0%, #09090b 100%)" }} />
        <LuxuryPattern opacity={0.02} accent={GOLD} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] rounded-full blur-[180px]" style={{ background: `${GOLD}08` }} /></div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {data.stats.map((stat, i) => {
              const statIcons = [House, CurrencyDollar, Calendar, Star];
              const Icon = statIcons[i % statIcons.length];
              return (
                <div key={stat.label} className="text-center p-6 rounded-2xl backdrop-blur-md bg-white/[0.03] border border-white/[0.06]">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Icon size={22} weight="fill" style={{ color: GOLD }} />
                    <span className="text-3xl md:text-4xl font-black tracking-tighter" style={{ color: GOLD }}>{stat.value}</span>
                  </div>
                  <span className="text-zinc-500 text-sm font-medium tracking-wide uppercase">{stat.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════ 4. SERVICES ══════════════════ */}
      <section id="services" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #09090b 0%, #070707 50%, #09090b 100%)" }} />
        <LuxuryPattern accent={GOLD} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[10%] right-[5%] w-[500px] h-[500px] rounded-full blur-[160px]" style={{ background: `${GOLD}08` }} /></div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Services" title="How We Serve You" subtitle={`${data.businessName} provides comprehensive real estate expertise for buyers, sellers, and investors.`} accent={GOLD} />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.services.map((service, i) => {
              const Icon = getServiceIcon(service.name);
              return (
                <div key={service.name} className="group relative p-7 rounded-2xl border border-white/[0.06] hover:border-opacity-30 transition-all duration-500 overflow-hidden bg-white/[0.02]">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: `radial-gradient(circle at 50% 0%, ${GOLD}15, transparent 70%)` }} />
                  <div className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `linear-gradient(to right, transparent, ${GOLD}4d, transparent)` }} />
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-5">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 border" style={{ background: GOLD_GLOW, borderColor: `${GOLD}33` }}>
                        <Icon size={24} weight="duotone" style={{ color: GOLD }} />
                      </div>
                      <span className="text-xs font-mono text-zinc-600">{String(i + 1).padStart(2, "0")}</span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{service.name}</h3>
                    <p className="text-sm text-zinc-500 leading-relaxed">{service.description || ""}</p>
                    {service.price && <p className="text-sm font-semibold mt-3" style={{ color: GOLD }}>{service.price}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════ 5. ABOUT ══════════════════ */}
      <section id="about" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #09090b 0%, #070707 50%, #09090b 100%)" }} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[20%] left-[10%] w-[500px] h-[500px] rounded-full blur-[180px]" style={{ background: `${GOLD}06` }} /></div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
            <div className="lg:col-span-3 relative">
              <div className="rounded-2xl overflow-hidden border border-white/10 aspect-[4/3]"><img src={aboutImage} alt={`${data.businessName} agent`} className="w-full h-full object-cover" /></div>
              <div className="absolute -bottom-4 right-8 md:-bottom-6 md:right-8">
                <div className="px-6 py-4 rounded-xl backdrop-blur-xl bg-white/[0.05] border border-white/[0.08]">
                  <div className="flex items-center gap-3"><Star size={20} weight="fill" style={{ color: GOLD }} /><div><p className="font-bold text-sm">Top Agent</p><p className="text-xs text-zinc-500">In Your Area</p></div></div>
                </div>
              </div>
            </div>
            <div className="lg:col-span-2">
              <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: GOLD, borderColor: `${GOLD}33`, background: `${GOLD}0d` }}>Your Agent</span>
              <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-6 text-white">Expert Guidance</h2>
              <div className="h-px w-16 mb-6" style={{ backgroundColor: GOLD }} />
              <p className="text-zinc-400 leading-relaxed mb-6">{data.about}</p>
              <div className="flex flex-col gap-3 mb-8">
                {data.stats.slice(0, 3).map((stat, i) => {
                  const icons = [Calendar, CurrencyDollar, User];
                  const Icon = icons[i % icons.length];
                  return (
                    <div key={stat.label} className="flex items-center gap-3 text-sm text-zinc-500">
                      <Icon size={16} style={{ color: GOLD }} /><span>{stat.value} {stat.label}</span>
                    </div>
                  );
                })}
              </div>
              <MagneticButton className="px-6 py-3 rounded-xl text-black font-bold" style={{ background: GOLD } as React.CSSProperties}>
                <span className="flex items-center gap-2"><Phone size={16} weight="bold" /> Contact Agent</span>
              </MagneticButton>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════ 6. PROCESS ══════════════════ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #09090b 0%, #070707 50%, #09090b 100%)" }} />
        <LuxuryPattern opacity={0.025} accent={GOLD} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <AnimatedSection>          <SectionHeader badge="Our Process" title="How We Work for You" accent={GOLD} /></AnimatedSection>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {processSteps.map((step, i) => (
              <div key={step.step} className="relative">
                {i < processSteps.length - 1 && <div className="hidden lg:block absolute top-10 left-[calc(50%+40px)] w-[calc(100%-80px)] h-px" style={{ background: `linear-gradient(to right, ${GOLD}33, ${GOLD}11)` }} />}
                <GlassCard className="p-6 text-center relative">
                  <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-black" style={{ background: `linear-gradient(135deg, ${GOLD}22, ${GOLD}0a)`, color: GOLD, border: `1px solid ${GOLD}33` }}>{step.step}</div>
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
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #09090b 0%, #070707 50%, #09090b 100%)" }} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[30%] left-[20%] w-[500px] h-[500px] rounded-full blur-[200px]" style={{ background: `${GOLD}06` }} /></div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <AnimatedSection>          <SectionHeader badge="Portfolio" title="Featured Properties" accent={GOLD} /></AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {galleryImages.map((src, i) => {
              const titles = ["Modern Luxury Estate", "Waterfront Retreat", "Contemporary Villa", "Penthouse Living"];
              return (
                <div key={i} className="group relative rounded-2xl overflow-hidden border border-white/[0.06]">
                  <img src={src} alt={titles[i]} className="w-full h-64 object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#09090b]/80 via-black/20 to-transparent" />
                  <div className="absolute top-4 left-4"><span className="px-3 py-1 text-xs font-bold rounded-full text-black" style={{ backgroundColor: GOLD }}>Featured</span></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6"><h3 className="text-lg font-bold text-white">{titles[i]}</h3></div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════ 8. TESTIMONIALS ══════════════════ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #09090b 0%, #070707 50%, #09090b 100%)" }} />
        <LuxuryPattern opacity={0.02} accent={GOLD} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <AnimatedSection>          <SectionHeader badge="Testimonials" title="Client Success Stories" accent={GOLD} /></AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <GlassCard key={i} className="p-6 h-full flex flex-col">
                <div className="flex gap-0.5 mb-4">{Array.from({ length: t.rating || 5 }).map((_, j) => <Star key={j} size={16} weight="fill" style={{ color: GOLD }} />)}</div>
                <p className="text-zinc-300 leading-relaxed flex-1 text-sm mb-4">&ldquo;{t.text}&rdquo;</p>
                <div className="pt-4 border-t border-white/5"><span className="text-sm font-semibold text-white">{t.name}</span></div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ 9. CTA ══════════════════ */}
      <section className="relative z-10 py-20 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${GOLD}, ${GOLD}cc, ${GOLD})` }} />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='40' height='40' fill='none'/%3E%3Cpath d='M0 0L40 40M40 0L0 40' stroke='%23000' stroke-width='0.5'/%3E%3C/svg%3E\")" }} />
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <House size={48} weight="fill" className="mx-auto mb-6 text-black/60" />
          <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-black mb-4">Begin Your Journey</h2>
          <p className="text-lg text-black/70 mb-8 max-w-xl mx-auto">Whether buying or selling, {data.businessName} delivers an unparalleled real estate experience.</p>
          <PhoneLink phone={data.phone} className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-black text-white font-bold text-lg hover:bg-black/80 transition-colors">
            <Phone size={20} weight="bold" /> {data.phone}
          </PhoneLink>
        </div>
      </section>

      {/* ══════════════════ 10. LOCATION ══════════════════ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #09090b 0%, #070707 50%, #09090b 100%)" }} />
        <LuxuryPattern opacity={0.02} accent={GOLD} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <AnimatedSection>          <SectionHeader badge="Office" title="Visit Us" accent={GOLD} /></AnimatedSection>
          <div className="text-center"><GlassCard className="p-8 inline-block"><div className="flex items-center gap-3 text-lg"><MapPin size={24} weight="duotone" style={{ color: GOLD }} /><MapLink address={data.address} className="text-white font-semibold" /></div><p className="text-zinc-400 text-sm mt-2">Serving buyers and sellers across the region</p></GlassCard></div>
        </div>
      </section>

      {/* ══════════════════ 11. HOURS ══════════════════ */}
      {data.hours && (
        <section className="relative z-10 py-24 md:py-32 overflow-hidden">
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #09090b 0%, #070707 50%, #09090b 100%)" }} />
          <div className="max-w-3xl mx-auto px-6 relative z-10">
            <AnimatedSection>          <SectionHeader badge="Hours" title="Office Hours" accent={GOLD} /></AnimatedSection>
            <div className="text-center"><ShimmerBorder accent={GOLD}><div className="p-8"><Clock size={32} weight="duotone" style={{ color: GOLD }} className="mx-auto mb-4" /><p className="text-zinc-300 leading-relaxed whitespace-pre-line text-lg">{data.hours}</p><p className="text-sm mt-4 font-semibold" style={{ color: GOLD }}>Private viewings available by appointment</p></div></ShimmerBorder></div>
          </div>
        </section>
      )}

      
      {/* ══════════════════ MID-PAGE CTA ══════════════════ */}
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
            Limited time — claim your free professional website today before it&apos;s offered to a competitor.
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

      {/* ══════════════════ 12. FAQ ══════════════════ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #09090b 0%, #070707 50%, #09090b 100%)" }} />
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <AnimatedSection>          <SectionHeader badge="FAQ" title="Common Questions" accent={GOLD} /></AnimatedSection>
          <div className="space-y-3">{faqs.map((faq, i) => <AccordionItem key={i} question={faq.q} answer={faq.a} isOpen={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} />)}</div>
        </div>
      </section>

      {/* ══════════════════ 13. CONTACT ══════════════════ */}
      <section id="contact" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #09090b 0%, #070707 50%, #09090b 100%)" }} />
        <LuxuryPattern opacity={0.02} accent={GOLD} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: GOLD, borderColor: `${GOLD}33`, background: `${GOLD}0d` }}>Get in Touch</span>
              <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-6 text-white">Start Your Search</h2>
              <div className="h-px w-16 mb-6" style={{ backgroundColor: GOLD }} />
              <p className="text-zinc-400 leading-relaxed mb-8">Whether buying or selling, our team is ready to deliver an exceptional experience tailored to your vision.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/5"><Phone size={20} style={{ color: GOLD }} /><div><p className="text-xs text-zinc-600">Call</p><PhoneLink phone={data.phone} className="text-sm font-medium" /></div></div>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/5"><MapPin size={20} style={{ color: GOLD }} /><div><p className="text-xs text-zinc-600">Office</p><MapLink address={data.address} className="text-sm font-medium" /></div></div>
              </div>
            </div>
            <GlassCard className="p-8">
              <h3 className="text-xl font-semibold text-white mb-6">Schedule Consultation</h3>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className="block text-sm text-zinc-400 mb-1.5">Name</label><input type="text" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none text-sm" placeholder="Your name" /></div>
                  <div><label className="block text-sm text-zinc-400 mb-1.5">Phone</label><input type="tel" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none text-sm" placeholder="(555) 123-4567" /></div>
                </div>
                <div><label className="block text-sm text-zinc-400 mb-1.5">Interest</label>
                  <select className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none text-sm">
                    <option value="" className="bg-neutral-900">Buying or Selling?</option>
                    {data.services.map((s) => <option key={s.name} value={s.name.toLowerCase().replace(/\s+/g, "-")} className="bg-neutral-900">{s.name}</option>)}
                  </select>
                </div>
                <div><label className="block text-sm text-zinc-400 mb-1.5">Message</label><textarea rows={3} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none text-sm resize-none" placeholder="Tell us about your real estate needs..." /></div>
                <MagneticButton className="w-full py-4 rounded-xl text-base font-bold text-black flex items-center justify-center gap-2 cursor-pointer" style={{ background: GOLD } as React.CSSProperties}>
                  Schedule Consultation <ArrowRight size={18} weight="bold" />
                </MagneticButton>
              </form>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* ══════════════════ 14. TRUST ══════════════════ */}
      <section className="relative z-10 py-16 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #09090b 0%, #070707 100%)" }} />
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <ShimmerBorder accent={GOLD}>
            <div className="p-8 md:p-12">
              <ShieldCheck size={48} weight="fill" style={{ color: GOLD }} className="mx-auto mb-4" />
              <h2 className="text-2xl md:text-4xl font-black text-white mb-4">Our Commitment</h2>
              <p className="text-zinc-400 leading-relaxed max-w-2xl mx-auto text-lg">At {data.businessName}, we believe every client deserves exceptional service, transparent communication, and results that exceed expectations.</p>
              <div className="flex flex-wrap justify-center gap-4 mt-8">
                {["Expert Guidance", "Market Knowledge", "White-Glove Service", "Proven Results"].map((item) => (
                  <span key={item} className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border" style={{ color: GOLD, borderColor: `${GOLD}33`, background: `${GOLD}0d` }}><CheckCircle size={16} weight="fill" />{item}</span>
                ))}
              </div>
            </div>
          </ShimmerBorder>
        </div>
      </section>

      {/* ══════════════════ 15. FOOTER ══════════════════ */}
      <footer className="relative z-10 border-t border-white/5 py-10 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #09090b 0%, #060606 100%)" }} />
        <div className="mx-auto max-w-6xl px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div><div className="flex items-center gap-2 mb-3"><Buildings size={22} weight="bold" style={{ color: GOLD }} /><span className="text-lg font-bold text-white">{data.businessName}</span></div><p className="text-sm text-zinc-500 leading-relaxed">{data.about.length > 120 ? data.about.slice(0, 120).trim() + "..." : data.about}</p></div>
            <div><h4 className="text-sm font-semibold text-white mb-3">Quick Links</h4><div className="space-y-2">{["Services", "About", "Properties", "Contact"].map((link) => <a key={link} href={`#${link.toLowerCase()}`} className="block text-sm text-zinc-500 hover:text-white transition-colors">{link}</a>)}</div></div>
            <div><h4 className="text-sm font-semibold text-white mb-3">Contact</h4><div className="space-y-2 text-sm text-zinc-500"><p><PhoneLink phone={data.phone} /></p><p><MapLink address={data.address} /></p>{data.socialLinks && Object.entries(data.socialLinks).map(([platform, url]) => <a key={platform} href={url} target="_blank" rel="noopener noreferrer" className="block hover:text-white transition-colors capitalize">{platform}</a>)}</div></div>
          </div>
          <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-zinc-500"><Buildings size={14} weight="bold" style={{ color: GOLD }} /><span>{data.businessName} &copy; {new Date().getFullYear()}</span></div>
            <div className="flex items-center gap-2 text-xs text-zinc-600"><BluejayLogo className="w-4 h-4" /><span>Created by <a href="https://bluejayportfolio.com" target="_blank" rel="noopener noreferrer" style={{textDecoration:"underline"}}>bluejayportfolio.com</a></span></div>
          </div>
        </div>
      </footer>

      <ClaimBanner businessName={data.businessName} accentColor={GOLD} prospectId={data.id} />
      <div className="h-14 md:h-28" />
    </main>
  );
}
