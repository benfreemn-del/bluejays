"use client";

/* eslint-disable @next/next/no-img-element -- These static marketing and preview components intentionally use plain img tags to preserve existing markup and visual behavior during lint-only cleanup. */
/* eslint-disable react-hooks/purity -- Decorative particle values are intentionally randomized for static visual effects in these marketing pages and previews; this preserves existing appearance without changing business logic. */

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import {
  PenNib, ShieldCheck, Clock, Phone, MapPin, CaretDown, List, X,
  CheckCircle, ArrowRight, Star, Drop, Skull, Palette, InstagramLogo,
  Flame, Heart,
} from "@phosphor-icons/react";
import type { GeneratedSiteData } from "@/lib/generator";
import BluejayLogo from "../BluejayLogo";
import { MapLink, PhoneLink } from "@/components/templates/MapLink";
import ClaimBanner from "@/components/ClaimBanner";
import { pickFromPool, pickGallery } from "@/lib/stock-image-picker";

const spring = { type: "spring" as const, stiffness: 100, damping: 20 };
const springFast = { type: "spring" as const, stiffness: 200, damping: 25 };
const CHARCOAL = "#1a1a1a";
const DEFAULT_CRIMSON = "#b91c1c";
const CRIMSON_LIGHT = "#ef4444";
const INK_BLACK = "#0a0a0a";

function getAccent(accentColor?: string) {
  const c = accentColor || DEFAULT_CRIMSON;
  return { ACCENT: c, ACCENT_GLOW: `${c}26`, CRIMSON_LIGHT, INK_BLACK };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SERVICE_ICON_MAP: Record<string, any> = {
  traditional: PenNib, custom: Palette, portrait: Heart, color: Palette,
  black: Drop, fine: PenNib, cover: Flame, geometric: PenNib,
  realism: Heart, tribal: Flame, japanese: Skull, lettering: PenNib,
  piercing: Drop,
};
function getServiceIcon(n: string) { const l = n.toLowerCase(); for (const [k, I] of Object.entries(SERVICE_ICON_MAP)) { if (l.includes(k)) return I; } return PenNib; }

const STOCK_HERO_POOL = ["https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?w=1400&q=80"];
const STOCK_ABOUT_POOL = ["https://images.unsplash.com/photo-1562962230-16e4623d36e6?w=600&q=80"];
const STOCK_GALLERY = [
  "https://images.unsplash.com/photo-1562962230-16e4623d36e6?w=600&q=80",
  "https://images.unsplash.com/photo-1542727313-4f3e99aa2568?w=600&q=80",
  "https://images.unsplash.com/photo-1542727313-4f3e99aa2568?w=600&q=80",
  "https://images.unsplash.com/photo-1542727313-4f3e99aa2568?w=600&q=80",
  "https://images.unsplash.com/photo-1562962230-16e4623d36e6?w=600&q=80",
  "https://images.unsplash.com/photo-1568515045052-f9a854d70bfd?w=600&q=80",
];

function FloatingInk({ accent }: { accent: string }) {
  const particles = Array.from({ length: 22 }, (_, i) => ({
    id: i, x: Math.random() * 100, delay: Math.random() * 8, duration: 5 + Math.random() * 7,
    size: 2 + Math.random() * 4, opacity: 0.12 + Math.random() * 0.3, isLight: Math.random() > 0.7,
  }));
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden hidden md:block">
      {particles.map((p) => (
        <motion.div key={p.id} className="absolute rounded-full"
          style={{ left: `${p.x}%`, width: p.size, height: p.size, background: p.isLight ? CRIMSON_LIGHT : accent, willChange: "transform, opacity" }}
          animate={{ y: ["-10vh", "110vh"], opacity: [0, p.opacity, p.opacity, 0] }}
          transition={{ y: { duration: p.duration, repeat: Infinity, delay: p.delay, ease: "linear" }, opacity: { duration: p.duration, repeat: Infinity, delay: p.delay, times: [0, 0.1, 0.9, 1] } }}
        />
      ))}
    </div>
  );
}

function InkSplatterPattern({ opacity = 0.03, accent }: { opacity?: number; accent: string }) {
  const pid = `inkSplat-${accent.replace("#", "")}`;
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }}>
      <defs>
        <pattern id={pid} width="120" height="120" patternUnits="userSpaceOnUse">
          <circle cx="20" cy="30" r="8" fill={accent} opacity="0.2" />
          <circle cx="22" cy="28" r="3" fill={accent} opacity="0.15" />
          <circle cx="80" cy="80" r="6" fill={accent} opacity="0.18" />
          <circle cx="85" cy="75" r="2" fill={accent} opacity="0.12" />
          <circle cx="50" cy="100" r="4" fill={CRIMSON_LIGHT} opacity="0.1" />
          <path d="M100 20 Q105 15 110 20 Q105 30 100 20 Z" fill={accent} opacity="0.15" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${pid})`} />
    </svg>
  );
}

function InkDripBackground({ opacity = 0.03, accent }: { opacity?: number; accent: string }) {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }} viewBox="0 0 1000 600" preserveAspectRatio="none">
      <path d="M100 0 Q95 100 100 200 Q105 250 98 300" stroke={accent} strokeWidth="2" fill="none" />
      <path d="M500 0 Q495 150 500 350 Q505 400 498 450" stroke={accent} strokeWidth="1.5" fill="none" />
      <path d="M850 0 Q845 80 850 250 Q855 300 848 400" stroke={CRIMSON_LIGHT} strokeWidth="1" fill="none" />
      <circle cx="100" cy="310" r="8" fill={accent} opacity="0.3" />
      <circle cx="500" cy="460" r="6" fill={accent} opacity="0.25" />
    </svg>
  );
}

function GlassCard({ children, className = "", style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
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
  return (<div className={`relative rounded-2xl p-[1px] overflow-hidden ${className}`}><motion.div className="absolute inset-0 rounded-2xl" style={{ background: `conic-gradient(from 0deg, transparent, ${accent}, transparent, ${CRIMSON_LIGHT}, transparent)`, willChange: "transform" }} animate={{ rotate: [0, 360] }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} /><div className="relative rounded-2xl bg-[#0a0a0a] z-10">{children}</div></div>);
}

function AccordionItem({ question, answer, isOpen, onToggle }: { question: string; answer: string; isOpen: boolean; onToggle: () => void }) {
  return (<GlassCard className="overflow-hidden"><button onClick={onToggle} className="w-full flex items-center justify-between p-5 md:p-6 text-left group cursor-pointer"><span className="text-lg font-semibold text-white pr-4">{question}</span><motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={spring}><CaretDown size={20} className="text-slate-400 shrink-0" /></motion.div></button><AnimatePresence initial={false}>{isOpen && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={spring} className="overflow-hidden"><p className="px-5 pb-5 md:px-6 md:pb-6 text-slate-400 leading-relaxed">{answer}</p></motion.div>)}</AnimatePresence></GlassCard>);
}

function SectionHeader({ badge, title, subtitle, accent }: { badge: string; title: string; subtitle?: string; accent: string }) {
  return (<div className="text-center mb-16"><span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: accent, borderColor: `${accent}33`, background: `${accent}0d` }}>{badge}</span><h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white">{title}</h2><div className="h-0.5 w-16 mx-auto mt-4" style={{ background: `linear-gradient(to right, ${accent}, transparent)` }} />{subtitle && <p className="text-slate-400 mt-4 max-w-2xl text-lg leading-relaxed mx-auto">{subtitle}</p>}</div>);
}


/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ ANIMATED SECTION â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function AnimatedSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 1, x: 50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: "easeOut" as const }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function V2TattooPreview({ data }: { data: GeneratedSiteData }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const { ACCENT, ACCENT_GLOW } = getAccent(data.accentColor);
  const PALETTE = ["#b91c1c", "#d97706", "#0a0a0a", "#b45309", "#6d28d9", "#78350f"];
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
    { q: `What tattoo styles does ${data.businessName} specialize in?`, a: `Our artists specialize in ${data.services.slice(0, 3).map(s => s.name).join(", ")}, and many more styles. Book a consultation to discuss your vision.` },
    { q: "How do I prepare for my tattoo appointment?", a: "Stay hydrated, eat well before your session, avoid alcohol for 24 hours prior, and wear comfortable clothing. We'll provide full aftercare instructions." },
    { q: "Do you do cover-ups?", a: `Yes! Our artists at ${data.businessName} are experienced in cover-up work. We can transform old or unwanted tattoos into beautiful new pieces.` },
    { q: "How much does a tattoo cost?", a: "Pricing varies based on size, detail, placement, and time required. We offer free consultations to provide accurate quotes for your specific design." },
    { q: "Does getting a tattoo hurt?", a: "Pain levels vary depending on placement and your personal tolerance. Areas over bone or thin skin tend to be more sensitive. Our artists work at a comfortable pace and can take breaks as needed." },
    { q: "How long does a tattoo take to heal?", a: "Initial surface healing takes 2-3 weeks. Full healing of deeper skin layers takes about 4-6 weeks. Follow our aftercare guide closely for the best results." },
    { q: "Can I bring my own design?", a: `Absolutely! Bring reference images, sketches, or ideas and our artists at ${data.businessName} will work with you to refine it into a tattoo-ready design during your consultation.` },
    { q: "What is your minimum age requirement?", a: "You must be 18 years or older with valid government-issued photo ID. We do not tattoo minors, even with parental consent." },
  ];

  /* Fallback testimonials */
  const fallbackTestimonials = [
    { name: "Jake R.", text: "Incredible artistry. My sleeve turned out better than I ever imagined. True talent here.", rating: 5 },
    { name: "Amber L.", text: "Super clean shop, friendly artists, and the design process was collaborative and fun.", rating: 5 },
    { name: "Marcus T.", text: "Got my first tattoo here and the experience was amazing. They made me feel completely comfortable.", rating: 5 }
  ];
  const testimonials = data.testimonials?.length > 0 ? data.testimonials : fallbackTestimonials;

  const styles = ["Custom Design", "Black & Grey", "Color Realism", "Traditional", "Japanese", "Geometric", "Watercolor", "Fine Line"];

  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden" style={{ fontFamily: "Archivo, system-ui, sans-serif", background: INK_BLACK, color: "#f1f5f9" }}>
      <FloatingInk accent={ACCENT} />

      {/* 1. NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-4">
          <GlassCard className="flex items-center justify-between px-4 md:px-6 py-3">
            <div className="flex items-center gap-2"><PenNib size={24} weight="fill" style={{ color: ACCENT }} /><span className="text-lg font-bold tracking-tight text-white">{data.businessName}</span></div>
            <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
              <a href="#gallery" className="hover:text-white transition-colors">Gallery</a><a href="#services" className="hover:text-white transition-colors">Services</a>
              <a href="#artists" className="hover:text-white transition-colors">Artists</a><a href="#contact" className="hover:text-white transition-colors">Contact</a>
            </div>
            <div className="flex items-center gap-3">
              <MagneticButton className="px-4 md:px-5 py-2 rounded-full text-sm font-semibold text-white transition-colors cursor-pointer" style={{ background: ACCENT } as React.CSSProperties}>Book Now</MagneticButton>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors">{mobileMenuOpen ? <X size={24} /> : <List size={24} />}</button>
            </div>
          </GlassCard>
          <AnimatePresence>{mobileMenuOpen && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }} className="md:hidden mt-2 overflow-hidden"><GlassCard className="flex flex-col gap-1 px-4 py-4">{[{ label: "Gallery", href: "#gallery" }, { label: "Services", href: "#services" }, { label: "Artists", href: "#artists" }, { label: "Contact", href: "#contact" }].map((link) => <a key={link.label} href={link.href} onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors">{link.label}</a>)}</GlassCard></motion.div>)}</AnimatePresence>
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
              <p className="text-sm uppercase tracking-widest mb-4" style={{ color: ACCENT }}>Custom Tattoo Studio</p>
              <h1 className="text-3xl md:text-6xl tracking-tighter leading-none font-bold text-white" style={{ textShadow: "0 2px 20px rgba(0,0,0,0.8), 0 4px 40px rgba(0,0,0,0.5)" }}>{data.tagline}</h1>
            </div>
            <p className="text-lg text-slate-400 max-w-md leading-relaxed">{(() => { const t = data.about; if (t.length <= 180) return t; const dot = t.indexOf('.', 80); return dot > 0 && dot < 220 ? t.slice(0, dot + 1) : t.slice(0, 180).trim() + '...'; })()}</p>
            <div className="flex flex-wrap gap-4">
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white flex items-center gap-2 cursor-pointer" style={{ background: ACCENT } as React.CSSProperties}>Book Consultation <ArrowRight size={18} weight="bold" /></MagneticButton>
              <MagneticButton href={`tel:${data.phone.replace(/\D/g, "")}`} className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/15 flex items-center gap-2 cursor-pointer"><Phone size={18} weight="duotone" /><PhoneLink phone={data.phone} /></MagneticButton>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-slate-400">
              <span className="flex items-center gap-2"><MapPin size={16} weight="duotone" style={{ color: ACCENT }} /><MapLink address={data.address} /></span>
              <span className="flex items-center gap-2"><InstagramLogo size={16} weight="duotone" style={{ color: ACCENT }} />Follow Our Work</span>
            </div>
          </div>
          <div className="hidden md:block relative">
            <div className="relative rounded-2xl overflow-hidden border border-white/15">
              <img src={heroCardImage} alt={`${data.businessName} tattoo art`} className="w-full h-[500px] object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6"><div className="px-4 py-2 rounded-full backdrop-blur-md bg-black/50 border flex items-center gap-2" style={{ borderColor: `${ACCENT}4d` }}><ShieldCheck size={18} weight="fill" style={{ color: ACCENT }} /><span className="text-sm font-semibold text-white">Health Certified Studio</span></div></div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. STATS */}
      <section className="relative z-10 py-16 overflow-hidden border-y" style={{ borderColor: `${ACCENT}1a` }}>
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #0f0505 0%, #0a0a0a 100%)" }} />
        <InkSplatterPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {data.stats.map((stat, i) => {
              const icons = [PenNib, Star, Clock, Heart];
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

      {/* 4. GALLERY (PRIMARY - GALLERY HEAVY) */}
      <section id="gallery" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #0a0a0a 0%, #1a0505 50%, #0a0a0a 100%)" }} />
        <InkSplatterPattern accent={ACCENT} opacity={0.03} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[20%] left-[10%] w-[500px] h-[500px] rounded-full blur-[200px]" style={{ background: `${ACCENT}06` }} /></div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Our Portfolio" title="Ink That Speaks" subtitle="Every piece tells a unique story. Browse our latest work." accent={ACCENT} />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {galleryImages.map((src, i) => (
              <div key={i} className="group relative rounded-2xl overflow-hidden border border-white/[0.10] hover:border-opacity-30 transition-all duration-500 aspect-square">
                <img src={src} alt={`Tattoo artwork ${i + 1}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <span className="text-sm font-semibold text-white">View Details</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. SERVICES */}
      <section id="services" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #0a0a0a 0%, #0f0505 50%, #0a0a0a 100%)" }} />
        <InkDripBackground opacity={0.025} accent={ACCENT} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[10%] right-[5%] w-[500px] h-[500px] rounded-full blur-[160px]" style={{ background: `${ACCENT}08` }} /></div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Our Services" title="What We Offer" subtitle={`From custom designs to cover-ups, ${data.businessName} brings your vision to life.`} accent={ACCENT} />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.services.map((service, i) => { const Icon = getServiceIcon(service.name); const tile = pickPaletteColor(i); return (
              <div key={service.name} className="group relative p-7 rounded-2xl border border-white/[0.10] hover:border-opacity-30 transition-all duration-500 overflow-hidden bg-white/[0.07]">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: `radial-gradient(circle at 50% 0%, ${ACCENT}15, transparent 70%)` }} />
                <div className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `linear-gradient(to right, transparent, ${ACCENT}4d, transparent)` }} />
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-5"><div className="w-12 h-12 rounded-xl flex items-center justify-center border" style={{ background: `${tile}22`, borderColor: `${tile}55` }}><Icon size={24} weight="duotone" style={{ color: tile }} /></div><span className="text-xs font-mono" style={{ color: `${tile}99` }}>{String(i + 1).padStart(2, "0")}</span></div>
                  <h3 className="text-lg font-bold text-white mb-2">{service.name}</h3><p className="text-sm text-slate-400 leading-relaxed">{service.description || ""}</p>
                  {service.price && <p className="text-sm font-semibold mt-3" style={{ color: ACCENT }}>{service.price}</p>}
                </div>
              </div>
            ); })}
          </div>
        </div>
      </section>

      {/* 6. ABOUT / ARTISTS */}
      <section id="artists" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #0a0a0a 0%, #1a0505 50%, #0a0a0a 100%)" }} />
        <InkSplatterPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="relative">
              <div className="rounded-2xl overflow-hidden border border-white/15"><img src={aboutImage} alt={`${data.businessName} artists`} className="w-full h-[400px] object-cover" /></div>
              <div className="absolute -bottom-4 -right-4 md:bottom-6 md:-right-6"><div className="px-5 py-3 rounded-xl backdrop-blur-md border text-white font-bold text-sm shadow-lg" style={{ background: `${ACCENT}e6`, borderColor: `${ACCENT}80` }}>{data.stats[0] ? `${data.stats[0].value} ${data.stats[0].label}` : "Award-Winning Artists"}</div></div>
            </div>
            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: ACCENT, borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}>Meet The Artists</span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6 text-white">Art Is Our Obsession</h2>
              <p className="text-slate-400 leading-relaxed mb-8">{data.about}</p>
              <div className="grid grid-cols-2 gap-4">
                {[{ icon: ShieldCheck, label: "Health Certified" }, { icon: Palette, label: "Custom Designs" }, { icon: Star, label: "5-Star Rated" }, { icon: CheckCircle, label: "Sterile Environment" }].map((badge) => (
                  <GlassCard key={badge.label} className="p-4 flex items-center gap-3"><div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: ACCENT_GLOW }}><badge.icon size={20} weight="duotone" style={{ color: ACCENT }} /></div><span className="text-sm font-semibold text-white">{badge.label}</span></GlassCard>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. TATTOO STYLES */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #0a0a0a 0%, #0f0505 50%, #0a0a0a 100%)" }} />
        <InkDripBackground opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <AnimatedSection>          <SectionHeader badge="Tattoo Styles" title="Styles We Master" accent={ACCENT} /></AnimatedSection>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {styles.map((st, i) => {
              const tile = pickPaletteColor(i + 2);
              return (
              <GlassCard key={st} className="p-5 text-center group hover:border-opacity-30 transition-all duration-300">
                <PenNib size={24} weight="duotone" style={{ color: tile }} className="mx-auto mb-3" />
                <span className="text-sm font-semibold text-white">{st}</span>
              </GlassCard>
              );
            })}
          </div>
        </div>
      </section>

      {/* 7b. ARTIST PROFILES */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #0a0a0a 0%, #1a0505 50%, #0a0a0a 100%)" }} />
        <InkSplatterPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Our Team" title="Meet the Artists" accent={ACCENT} />
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Lead Artist", specialty: "Realism & Portraits", exp: "10+ Years", styles: ["Black & Grey", "Color Realism", "Cover-Ups"] },
              { name: "Senior Artist", specialty: "Traditional & Neo-Trad", exp: "8+ Years", styles: ["American Trad", "Neo-Traditional", "Bold Lines"] },
              { name: "Specialist", specialty: "Fine Line & Minimalist", exp: "5+ Years", styles: ["Fine Line", "Geometric", "Script"] },
            ].map((artist) => (
              <GlassCard key={artist.name} className="p-6">
                <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: `${ACCENT}15`, border: `1px solid ${ACCENT}33` }}>
                  <PenNib size={28} weight="duotone" style={{ color: ACCENT }} />
                </div>
                <h3 className="text-lg font-bold text-white text-center mb-1">{artist.name}</h3>
                <p className="text-sm text-center mb-1" style={{ color: ACCENT }}>{artist.specialty}</p>
                <p className="text-xs text-center text-slate-500 mb-4">{artist.exp} Experience</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {artist.styles.map((s) => (
                    <span key={s} className="text-xs px-3 py-1 rounded-full border border-white/15 text-slate-300">{s}</span>
                  ))}
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* 7c. AFTERCARE GUIDE */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #0a0a0a 0%, #0f0505 50%, #0a0a0a 100%)" }} />
        <InkDripBackground opacity={0.02} accent={ACCENT} />
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Aftercare" title="Taking Care of Your New Tattoo" subtitle="Proper aftercare ensures your tattoo heals beautifully and lasts a lifetime." accent={ACCENT} />
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              { title: "First 24 Hours", desc: "Keep the bandage on for 2-4 hours. Wash gently with lukewarm water and fragrance-free soap." },
              { title: "Days 2-14", desc: "Apply a thin layer of unscented moisturizer 2-3 times daily. Do not pick or scratch." },
              { title: "Weeks 2-4", desc: "Continue moisturizing. Avoid swimming, hot tubs, and direct sunlight on the tattoo." },
              { title: "Long-Term", desc: "Always apply sunscreen over healed tattoos. Moisturize regularly to keep colors vibrant." },
            ].map((step, i) => (
              <GlassCard key={step.title} className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: `${ACCENT}22`, color: ACCENT, border: `1px solid ${ACCENT}33` }}>{i + 1}</div>
                  <h4 className="text-base font-bold text-white">{step.title}</h4>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* 7d. PRICING */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #0a0a0a 0%, #1a0505 50%, #0a0a0a 100%)" }} />
        <InkSplatterPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Investment" title="Tattoo Pricing" subtitle="Pricing depends on size, detail, and placement. All tattoos start with a free consultation." accent={ACCENT} />
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Small", price: "$100+", desc: "Wrist, ankle, finger â€” simple designs under 2 inches", features: ["Single Session", "Simple Design", "Quick Heal", "Includes Touch-Up"] },
              { name: "Medium", price: "$250+", desc: "Forearm, shoulder, calf â€” detailed work 3-6 inches", features: ["1-2 Sessions", "Custom Design", "Full Color Available", "Includes Touch-Up"], popular: true },
              { name: "Large", price: "$500+", desc: "Sleeve, back, chest â€” complex large-scale pieces", features: ["Multiple Sessions", "Full Custom Art", "Complex Detail", "Priority Booking"] },
            ].map((tier) => (
              <GlassCard key={tier.name} className={`p-8 ${tier.popular ? "ring-1" : ""}`} style={tier.popular ? { borderColor: ACCENT } : undefined}>
                {tier.popular && <div className="text-center mb-4"><span className="px-4 py-1 rounded-full text-xs font-bold text-white" style={{ background: ACCENT }}>Most Popular</span></div>}
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
                <MagneticButton className={`w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer ${tier.popular ? "text-white" : "text-white border border-white/15"}`} style={tier.popular ? { background: ACCENT } as React.CSSProperties : undefined}>
                  Book Consult <ArrowRight size={16} weight="bold" />
                </MagneticButton>
              </GlassCard>
            ))}
          </div>
          <p className="text-center text-xs text-slate-500 mt-6">$50 deposit required at booking, applied to final price. Custom quotes for complex work.</p>
        </div>
      </section>

      {/* 8. TESTIMONIALS */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #0a0a0a 0%, #1a0505 50%, #0a0a0a 100%)" }} />
        <InkSplatterPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          {(data.googleRating || data.reviewCount) && (
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full border border-white/15 bg-white/5 backdrop-blur-sm">
                <div className="flex gap-0.5">{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={18} weight="fill" style={{ color: ACCENT }} />)}</div>
                <span className="text-lg font-bold text-white">{data.googleRating || "5.0"}</span>
                {data.reviewCount && <span className="text-sm text-slate-400">({data.reviewCount} reviews)</span>}
              </div>
            </div>
          )}
          <AnimatedSection><SectionHeader badge="Reviews" title="Client Experiences" accent={ACCENT} /></AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <GlassCard key={i} className="p-6 h-full flex flex-col">
                <div className="text-4xl mb-3" style={{ color: `${ACCENT}33` }}>&ldquo;</div>
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.rating || 5 }).map((_, j) => (
                    <Star key={j} size={16} weight="fill" style={{ color: ACCENT }} />
                  ))}
                </div>
                <p className="text-slate-300 leading-relaxed flex-1 text-sm mb-4">{t.text}</p>
                <div className="pt-4 border-t border-white/8 flex items-center gap-2">
                  <CheckCircle size={14} weight="fill" style={{ color: ACCENT }} />
                  <span className="text-sm font-semibold text-white">{t.name}</span>
                  <span className="text-xs text-slate-500">Verified Client</span>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* 9. BOOK NOW CTA */}
      <section className="relative z-10 py-20 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT}cc, ${ACCENT})` }} />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='40' height='40' fill='none'/%3E%3Cpath d='M0 0L40 40M40 0L0 40' stroke='%23000' stroke-width='0.5'/%3E%3C/svg%3E\")" }} />
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <PenNib size={48} weight="fill" className="mx-auto mb-6 text-white/70" />
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-4">Ready to Get Inked?</h2>
          <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">Your next masterpiece starts with a consultation. Book your appointment and let our artists bring your vision to life.</p>
          <PhoneLink phone={data.phone} className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-black text-white font-bold text-lg hover:bg-black/80 transition-colors"><Phone size={20} weight="fill" />{data.phone}</PhoneLink>
        </div>
      </section>

      {/* 10. PROCESS */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #0a0a0a 0%, #0f0505 50%, #0a0a0a 100%)" }} />
        <InkSplatterPattern opacity={0.025} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <AnimatedSection>          <SectionHeader badge="The Process" title="From Concept to Ink" accent={ACCENT} /></AnimatedSection>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[{ step: "01", title: "Consultation", desc: "Discuss your ideas, placement, and style preferences with your artist." },
              { step: "02", title: "Custom Design", desc: "Your artist creates a unique design tailored to your vision." },
              { step: "03", title: "The Session", desc: "We bring the design to life in our sterile, comfortable studio." },
              { step: "04", title: "Aftercare", desc: "Full aftercare instructions and follow-up to ensure perfect healing." }].map((step, i) => (
              <div key={step.step} className="relative">
                {i < 3 && <div className="hidden lg:block absolute top-10 left-[calc(50%+40px)] w-[calc(100%-80px)] h-px" style={{ background: `linear-gradient(to right, ${ACCENT}33, ${ACCENT}11)` }} />}
                <GlassCard className="p-6 text-center"><div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-black" style={{ background: `linear-gradient(135deg, ${ACCENT}22, ${ACCENT}0a)`, color: ACCENT, border: `1px solid ${ACCENT}33` }}>{step.step}</div><h3 className="text-lg font-bold text-white mb-2">{step.title}</h3><p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p></GlassCard>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 11. SERVICE AREAS */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #0a0a0a 0%, #1a0505 50%, #0a0a0a 100%)" }} />
        <InkSplatterPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <AnimatedSection>          <SectionHeader badge="Location" title="Visit Our Studio" accent={ACCENT} /></AnimatedSection>
          <div className="text-center mb-8"><GlassCard className="p-8 inline-block"><div className="flex items-center gap-3 text-lg"><MapPin size={24} weight="duotone" style={{ color: ACCENT }} /><MapLink address={data.address} className="text-white font-semibold" /></div><div className="flex items-center gap-2 mt-3 justify-center"><div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /><span className="text-sm text-emerald-400 font-medium">Walk-ins Welcome</span></div></GlassCard></div>
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
              <p className="text-sm font-semibold text-white">Central Location</p>
              <p className="text-xs text-slate-500">Easy parking available</p>
            </GlassCard>
            <GlassCard className="p-4 text-center">
              <Star size={20} weight="duotone" style={{ color: ACCENT }} className="mx-auto mb-2" />
              <p className="text-sm font-semibold text-white">Clean & Private</p>
              <p className="text-xs text-slate-500">Individual artist stations</p>
            </GlassCard>
            <GlassCard className="p-4 text-center">
              <ShieldCheck size={20} weight="duotone" style={{ color: ACCENT }} className="mx-auto mb-2" />
              <p className="text-sm font-semibold text-white">Health Inspected</p>
              <p className="text-xs text-slate-500">Licensed and certified</p>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* 12. HOURS */}
      {data.hours && (
        <section className="relative z-10 py-24 md:py-32 overflow-hidden">
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #0a0a0a 0%, #0f0505 50%, #0a0a0a 100%)" }} />
          <InkDripBackground opacity={0.02} accent={ACCENT} />
          <div className="max-w-3xl mx-auto px-6 relative z-10">
            <AnimatedSection>          <SectionHeader badge="Studio Hours" title="When We're Open" accent={ACCENT} /></AnimatedSection>
            <div className="text-center"><ShimmerBorder accent={ACCENT}><div className="p-8"><Clock size={32} weight="duotone" style={{ color: ACCENT }} className="mx-auto mb-4" /><p className="text-slate-300 leading-relaxed whitespace-pre-line text-lg">{data.hours}</p></div></ShimmerBorder></div>
          </div>
        </section>
      )}

      {/* 12b. COMPETITOR COMPARISON */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #0a0a0a 0%, #0f0505 50%, #0a0a0a 100%)" }} />
        <InkSplatterPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Why Us" title={`${data.businessName} vs. Average Studios`} accent={ACCENT} />
          <GlassCard className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/15">
                    <th className="text-left p-4 font-semibold text-white">Feature</th>
                    <th className="text-center p-4 font-semibold" style={{ color: ACCENT }}>{data.businessName}</th>
                    <th className="text-center p-4 font-semibold text-slate-500">Others</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { feature: "Custom-Designed Art", us: true, them: "Flash Only" },
                    { feature: "Sterile Single-Use Equipment", us: true, them: "Varies" },
                    { feature: "Free Touch-Up Included", us: true, them: "Extra Cost" },
                    { feature: "Private Consultation", us: true, them: "No" },
                    { feature: "All Styles Available", us: true, them: "Limited" },
                    { feature: "Detailed Aftercare Kit", us: true, them: "Basic" },
                    { feature: "Portfolio Review Available", us: true, them: "No" },
                  ].map((row, i) => (
                    <tr key={row.feature} className={i % 2 === 0 ? "bg-white/[0.07]" : ""}>
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

      {/* 12c. VIDEO PLACEHOLDER */}
      <section className="relative z-10 py-20 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #0a0a0a 0%, #141010 100%)" }} />
        <InkDripBackground opacity={0.015} accent={ACCENT} />
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <div className="text-center mb-8">
            <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-3 px-4 py-1.5 rounded-full border" style={{ color: ACCENT, borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}>Watch</span>
            <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight text-white">See Our Artists at Work</h2>
          </div>
          <div className="relative rounded-2xl overflow-hidden border border-white/15 aspect-video flex items-center justify-center" style={{ background: "rgba(0,0,0,0.3)" }}>
            <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20 cursor-pointer hover:bg-white/20 transition-colors">
              <div className="w-0 h-0 border-l-[18px] border-l-white border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent ml-1.5" />
            </div>
            <p className="absolute bottom-6 text-white/40 text-sm font-medium">Watch the Tattooing Process</p>
          </div>
        </div>
      </section>

      {/* 12d. SAFETY CERTIFICATIONS */}
      <section className="relative z-10 py-16 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #141010 0%, #0a0a0a 100%)" }} />
        <InkSplatterPattern opacity={0.015} accent={ACCENT} />
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <div className="text-center mb-10">
            <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-3 px-4 py-1.5 rounded-full border" style={{ color: ACCENT, borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}>Safety</span>
            <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight text-white">Your Safety Is Non-Negotiable</h2>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {["Health Department Licensed", "Single-Use Needles", "Hospital-Grade Sterilization", "Bloodborne Pathogen Certified", "FDA-Approved Inks", "First Aid Trained"].map((badge) => (
              <div key={badge} className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-white/15 bg-white/[0.08] backdrop-blur-sm text-sm font-medium text-white">
                <ShieldCheck size={18} weight="duotone" style={{ color: ACCENT }} />
                {badge}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 12e. URGENCY */}
      <section className="relative z-10 py-16 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #0a0a0a 0%, #141010 100%)" }} />
        <InkDripBackground opacity={0.015} accent={ACCENT} />
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <GlassCard className="p-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="relative">
                <div className="w-3 h-3 rounded-full" style={{ background: ACCENT }} />
                <div className="absolute inset-0 w-3 h-3 rounded-full animate-ping" style={{ background: ACCENT, opacity: 0.4 }} />
              </div>
              <span className="text-sm font-bold uppercase tracking-wider" style={{ color: ACCENT }}>Now Booking</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Limited Availability This Month</h3>
            <p className="text-slate-400 mb-6">Our artists book up fast. Secure your consultation and session time now before spots fill up.</p>
            <PhoneLink phone={data.phone} className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-white font-semibold" style={{ background: ACCENT }}>
              <Phone size={20} weight="fill" /> Book Your Session
            </PhoneLink>
          </GlassCard>
        </div>
      </section>

      {/* 12b. ARTIST PORTFOLIO GALLERY */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #0a0a0a 0%, #0f0505 50%, #0a0a0a 100%)" }} />
        <InkDripBackground opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Portfolio" title="Artist Portfolio" subtitle="Browse recent work from our talented team of tattoo artists." accent={ACCENT} />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {galleryImages.slice(0, 6).map((img, i) => {
              const labels = ["Neo-Traditional Rose", "Geometric Mandala", "Black & Grey Portrait", "Fine Line Botanical", "Japanese Sleeve Detail", "Watercolor Abstract"];
              const artists = ["Lead Artist", "Guest Artist", "Senior Artist", "Apprentice", "Lead Artist", "Guest Artist"];
              return (
                <div key={i} className="group relative aspect-square rounded-2xl overflow-hidden border border-white/8">
                  <img src={img} alt={labels[i] || "Tattoo work"} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                    <span className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: ACCENT }}>{artists[i] || "Artist"}</span>
                    <span className="text-sm font-semibold text-white">{labels[i] || "Custom Piece"}</span>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="text-center mt-8">
            <p className="text-sm text-slate-500">Follow us on Instagram for daily uploads of fresh ink.</p>
            {data.socialLinks?.instagram && (
              <a href={data.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 mt-3 px-6 py-3 rounded-full text-sm font-semibold border transition-colors hover:bg-white/5" style={{ color: ACCENT, borderColor: `${ACCENT}33` }}>
                <InstagramLogo size={18} weight="fill" /> View Our Instagram
              </a>
            )}
          </div>
        </div>
      </section>

      {/* 12c. TATTOO STYLE GUIDE */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #0a0a0a 0%, #1a0505 50%, #0a0a0a 100%)" }} />
        <InkSplatterPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Styles" title="Tattoo Style Guide" subtitle="Not sure which style suits you? Here is a breakdown of what we specialize in." accent={ACCENT} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { style: "Traditional / Old School", desc: "Bold outlines, vibrant colors, and iconic imagery like anchors, roses, and eagles. Timeless designs that age well.", icon: Flame },
              { style: "Neo-Traditional", desc: "Modern take on traditional with more intricate detail, wider color palettes, and artistic flair. Eye-catching and expressive.", icon: Palette },
              { style: "Black & Grey Realism", desc: "Photorealistic portraits and scenes using only black ink in varying shades. Perfect for memorial pieces and fine detail.", icon: Heart },
              { style: "Fine Line / Minimalist", desc: "Delicate single-needle work with thin lines and minimal shading. Elegant and subtle â€” ideal for first tattoos.", icon: PenNib },
              { style: "Japanese / Irezumi", desc: "Large-scale work featuring koi, dragons, waves, and cherry blossoms. Rich in symbolism and flows with body contours.", icon: Skull },
              { style: "Geometric & Dotwork", desc: "Precise patterns built from shapes and dots. Mandalas, sacred geometry, and abstract compositions with stunning symmetry.", icon: Drop },
            ].map((item) => (
              <GlassCard key={item.style} className="p-6 flex gap-4 items-start">
                <div className="w-12 h-12 rounded-full shrink-0 flex items-center justify-center" style={{ background: `${ACCENT}15`, border: `1px solid ${ACCENT}22` }}>
                  <item.icon size={24} weight="duotone" style={{ color: ACCENT }} />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white mb-1">{item.style}</h4>
                  <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* 12d. AFTERCARE GUIDE */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #0a0a0a 0%, #0f0505 50%, #0a0a0a 100%)" }} />
        <InkDripBackground opacity={0.02} accent={ACCENT} />
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Aftercare" title="Tattoo Aftercare Guide" subtitle="Proper healing is just as important as great artistry. Follow these steps for the best results." accent={ACCENT} />
          <div className="space-y-4">
            {[
              { step: "Day 1-3", title: "Initial Healing", desc: "Keep the bandage on for 2-4 hours. Gently wash with lukewarm water and fragrance-free soap. Pat dry and apply a thin layer of recommended ointment." },
              { step: "Day 4-14", title: "Peeling & Itching", desc: "Your tattoo will start to peel and flake â€” this is normal. Do not pick or scratch. Continue moisturizing 2-3 times daily with unscented lotion." },
              { step: "Week 3-4", title: "Final Healing", desc: "The outer layers are healed but deeper skin is still recovering. Avoid direct sunlight and swimming. Keep moisturizing and stay patient." },
              { step: "Month 2+", title: "Long-Term Care", desc: "Your tattoo is fully healed. Apply SPF 30+ sunscreen to protect colors from fading. Moisturize regularly to keep the ink looking crisp." },
              { step: "Touch-Up", title: "Free Touch-Up Session", desc: "All tattoos from our studio include a complimentary touch-up within 6 months. If any lines or colors need refreshing, we have got you covered." },
            ].map((item, i) => (
              <GlassCard key={i} className="p-6 flex gap-4 items-start">
                <div className="w-16 h-10 rounded-lg shrink-0 flex items-center justify-center text-xs font-bold" style={{ background: `${ACCENT}15`, color: ACCENT, border: `1px solid ${ACCENT}22` }}>
                  {item.step}
                </div>
                <div>
                  <h4 className="text-base font-bold text-white mb-1">{item.title}</h4>
                  <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              </GlassCard>
            ))}
          </div>
          <div className="text-center mt-8">
            <p className="text-sm text-slate-500">Questions about healing? Call us anytime â€” we are here to help throughout your entire healing journey.</p>
          </div>
        </div>
      </section>

      {/* 12e. MID-PAGE CTA BANNER */}
      <section className="relative z-10 py-16 overflow-hidden">
        <div className="absolute inset-0" style={{ background: ACCENT }} />
        <div className="absolute inset-0 bg-black/30" />
        <InkSplatterPattern opacity={0.06} accent="#000000" />
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">Ready to Get Inked?</h2>
          <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">Book your free consultation today and let our artists bring your vision to life. Walk-ins welcome when available.</p>
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

      {/* 13. FAQ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #0a0a0a 0%, #1a0505 50%, #0a0a0a 100%)" }} />
        <InkSplatterPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <AnimatedSection>          <SectionHeader badge="FAQ" title="Common Questions" accent={ACCENT} /></AnimatedSection>
          <div className="space-y-3">{faqs.map((faq, i) => <AccordionItem key={i} question={faq.q} answer={faq.a} isOpen={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} />)}</div>
        </div>
      </section>

      {/* 13b. TATTOO QUIZ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #0a0a0a 0%, #1a0505 50%, #0a0a0a 100%)" }} />
        <InkSplatterPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Get Started" title="What Kind of Tattoo?" subtitle="Tell us about your idea and we will match you with the right artist." accent={ACCENT} />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "First Tattoo", color: "#10b981", rec: "We specialize in making first-timers comfortable. Book a free consultation." },
              { label: "Add to Collection", color: ACCENT, rec: "Expanding your art? Our artists love creating pieces that complement your existing work." },
              { label: "Cover-Up or Fix", color: "#f59e0b", rec: "Transform old or unwanted tattoos into stunning new artwork." },
            ].map((opt) => (
              <GlassCard key={opt.label} className="p-6 text-center hover:border-white/20 transition-all cursor-pointer">
                <div className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: `${opt.color}15`, border: `1px solid ${opt.color}33` }}>
                  <PenNib size={22} weight="duotone" style={{ color: opt.color }} />
                </div>
                <h4 className="text-sm font-bold text-white mb-2">{opt.label}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{opt.rec}</p>
              </GlassCard>
            ))}
          </div>
          <div className="text-center mt-8">
            <PhoneLink phone={data.phone} className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-white font-semibold" style={{ background: ACCENT }}>
              <Phone size={20} weight="fill" /> Book Free Consultation
            </PhoneLink>
          </div>
        </div>
      </section>

      {/* 13c. WHAT WE OFFER GRID */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #0a0a0a 0%, #0f0505 50%, #0a0a0a 100%)" }} />
        <InkDripBackground opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Studio" title="What Sets Us Apart" accent={ACCENT} />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: ShieldCheck, title: "Sterile Studio", desc: "Hospital-grade sterilization and single-use equipment" },
              { icon: Palette, title: "Custom Art Only", desc: "Every design is created specifically for you" },
              { icon: Star, title: "Award-Winning", desc: "Recognized artists with competition awards" },
              { icon: Heart, title: "Free Touch-Ups", desc: "All tattoos include a complimentary touch-up session" },
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

      {/* 14. CONTACT */}
      <section id="contact" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #0a0a0a 0%, #0f0505 50%, #0a0a0a 100%)" }} />
        <InkDripBackground opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: ACCENT, borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}>Book Now</span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6 text-white">Start Your Tattoo Journey</h2>
              <p className="text-slate-400 leading-relaxed mb-8">Ready for your next piece? Contact {data.businessName} to book a consultation and start bringing your vision to life.</p>
              <div className="space-y-5">
                <div className="flex items-start gap-4"><div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: ACCENT_GLOW }}><MapPin size={20} weight="duotone" style={{ color: ACCENT }} /></div><div><p className="text-sm font-semibold text-white">Studio</p><MapLink address={data.address} className="text-sm text-slate-400" /></div></div>
                <div className="flex items-start gap-4"><div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: ACCENT_GLOW }}><Phone size={20} weight="duotone" style={{ color: ACCENT }} /></div><div><p className="text-sm font-semibold text-white">Phone</p><PhoneLink phone={data.phone} className="text-sm text-slate-400" /></div></div>
                {data.hours && <div className="flex items-start gap-4"><div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: ACCENT_GLOW }}><Clock size={20} weight="duotone" style={{ color: ACCENT }} /></div><div><p className="text-sm font-semibold text-white">Hours</p><p className="text-sm text-slate-400 whitespace-pre-line">{data.hours}</p></div></div>}
              </div>
            </div>
            <GlassCard className="p-8">
              <h3 className="text-xl font-semibold text-white mb-6">Book a Consultation</h3>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className="block text-sm text-slate-400 mb-1.5">First Name</label><input type="text" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 focus:outline-none text-sm" placeholder="John" /></div>
                  <div><label className="block text-sm text-slate-400 mb-1.5">Last Name</label><input type="text" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 focus:outline-none text-sm" placeholder="Doe" /></div>
                </div>
                <div><label className="block text-sm text-slate-400 mb-1.5">Phone</label><input type="tel" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 focus:outline-none text-sm" placeholder="(206) 287-2304" /></div>
                <div><label className="block text-sm text-slate-400 mb-1.5">Tattoo Style</label><select className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white focus:outline-none text-sm"><option value="" className="bg-neutral-900">Select style</option>{data.services.map((s) => <option key={s.name} value={s.name.toLowerCase().replace(/\s+/g, "-")} className="bg-neutral-900">{s.name}</option>)}</select></div>
                <div><label className="block text-sm text-slate-400 mb-1.5">Describe Your Idea</label><textarea rows={4} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 focus:outline-none text-sm resize-none" placeholder="Tell us about your tattoo idea, placement, size..." /></div>
                <MagneticButton className="w-full py-4 rounded-xl text-base font-semibold text-white flex items-center justify-center gap-2 cursor-pointer" style={{ background: ACCENT } as React.CSSProperties}>Book Consultation <ArrowRight size={18} weight="bold" /></MagneticButton>
              </form>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* 14a-2. STUDIO HOURS & INK SAFETY */}
      {data.hours && (
        <section className="relative z-10 py-20 overflow-hidden">
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #0a0a0a 0%, #0f0505 50%, #0a0a0a 100%)" }} />
          <InkSplatterPattern opacity={0.02} accent={ACCENT} />
          <div className="max-w-5xl mx-auto px-6 relative z-10">
            <div className="grid md:grid-cols-2 gap-8">
              <GlassCard className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: `${ACCENT}15`, border: `1px solid ${ACCENT}22` }}>
                    <Clock size={20} weight="duotone" style={{ color: ACCENT }} />
                  </div>
                  <h3 className="text-xl font-bold text-white">Studio Hours</h3>
                </div>
                <div className="space-y-3 text-sm">
                  <p className="text-slate-400 whitespace-pre-line">{data.hours}</p>
                </div>
                <div className="mt-6 pt-4 border-t border-white/8">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-sm text-emerald-400 font-medium">Walk-ins welcome when available</span>
                  </div>
                </div>
              </GlassCard>
              <GlassCard className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: `${ACCENT}15`, border: `1px solid ${ACCENT}22` }}>
                    <ShieldCheck size={20} weight="duotone" style={{ color: ACCENT }} />
                  </div>
                  <h3 className="text-xl font-bold text-white">Ink & Safety Standards</h3>
                </div>
                <ul className="space-y-3">
                  {[
                    "FDA-approved, vegan-friendly inks",
                    "Hospital-grade autoclave sterilization",
                    "Single-use needles and disposable equipment",
                    "Licensed and health department inspected",
                    "Artist-to-client glove changes between stations",
                    "OSHA-compliant bloodborne pathogen protocols",
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
      )}

      {/* 14b. GUARANTEE */}
      <section className="relative z-10 py-16 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #0a0a0a 0%, #050505 100%)" }} />
        <InkSplatterPattern opacity={0.015} accent={ACCENT} />
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <ShimmerBorder accent={ACCENT}>
            <div className="p-8 md:p-12">
              <ShieldCheck size={48} weight="fill" style={{ color: ACCENT }} className="mx-auto mb-4" />
              <h2 className="text-2xl md:text-4xl font-extrabold text-white mb-4">Our Studio Promise</h2>
              <p className="text-slate-400 leading-relaxed max-w-2xl mx-auto text-lg">
                {data.businessName} is committed to delivering exceptional tattoo art in a safe, sterile, and welcoming environment. Every piece includes a complimentary touch-up session.
              </p>
              <div className="flex flex-wrap justify-center gap-4 mt-8">
                {["Custom Art Only", "Free Touch-Ups", "Sterile Environment", "Licensed Artists", "FDA-Approved Inks"].map((item) => (
                  <span key={item} className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border" style={{ color: ACCENT, borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}>
                    <CheckCircle size={16} weight="fill" /> {item}
                  </span>
                ))}
              </div>
            </div>
          </ShimmerBorder>
        </div>
      </section>

      {/* 14c. BOOKING INFO */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #050505 0%, #0a0a0a 50%, #050505 100%)" }} />
        <InkDripBackground opacity={0.02} accent={ACCENT} />
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Booking" title="How to Book Your Session" accent={ACCENT} />
          <GlassCard className="p-8">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: `${ACCENT}15`, border: `1px solid ${ACCENT}33` }}>
                  <Phone size={24} weight="duotone" style={{ color: ACCENT }} />
                </div>
                <h4 className="text-base font-bold text-white mb-2">1. Contact Us</h4>
                <p className="text-sm text-slate-400">Call, text, or DM us with your tattoo idea and preferred date.</p>
              </div>
              <div className="text-center">
                <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: `${ACCENT}15`, border: `1px solid ${ACCENT}33` }}>
                  <PenNib size={24} weight="duotone" style={{ color: ACCENT }} />
                </div>
                <h4 className="text-base font-bold text-white mb-2">2. Design Review</h4>
                <p className="text-sm text-slate-400">Your artist creates a custom design. We refine until it is perfect.</p>
              </div>
              <div className="text-center">
                <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: `${ACCENT}15`, border: `1px solid ${ACCENT}33` }}>
                  <CheckCircle size={24} weight="duotone" style={{ color: ACCENT }} />
                </div>
                <h4 className="text-base font-bold text-white mb-2">3. Secure Your Spot</h4>
                <p className="text-sm text-slate-400">A $50 non-refundable deposit holds your session. Applied to final price.</p>
              </div>
            </div>
            <div className="text-center mt-8 pt-6 border-t border-white/8">
              <p className="text-sm text-slate-500 mb-2">Walk-ins welcome when availability allows. Consultations are always free.</p>
              <p className="text-xs text-slate-600 mb-4">Must be 18+ with valid ID. Please arrive 15 minutes early for your first appointment.</p>
              <div className="flex flex-wrap justify-center gap-3 mb-4">
                {["Cash", "Venmo", "Zelle", "Credit Cards"].map((m) => (
                  <span key={m} className="text-xs text-slate-500 px-3 py-1 rounded-full border border-white/8">{m}</span>
                ))}
              </div>
              <PhoneLink phone={data.phone} className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-white font-semibold" style={{ background: ACCENT }}>
                <Phone size={20} weight="fill" /> Book Now
              </PhoneLink>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* 15. FOOTER */}
      <footer className="relative z-10 border-t border-white/8 py-10 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #0a0a0a 0%, #050505 100%)" }} />
        <InkSplatterPattern opacity={0.015} accent={ACCENT} />
        <div className="mx-auto max-w-6xl px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div><div className="flex items-center gap-2 mb-3"><PenNib size={22} weight="fill" style={{ color: ACCENT }} /><span className="text-lg font-bold text-white">{data.businessName}</span></div><p className="text-sm text-slate-500 leading-relaxed">{data.about.length > 120 ? data.about.slice(0, 120).trim() + "..." : data.about}</p></div>
            <div><h4 className="text-sm font-semibold text-white mb-3">Quick Links</h4><div className="space-y-2">{["Gallery", "Services", "Artists", "Contact"].map((link) => <a key={link} href={`#${link.toLowerCase()}`} className="block text-sm text-slate-500 hover:text-white transition-colors">{link}</a>)}</div></div>
            <div><h4 className="text-sm font-semibold text-white mb-3">Contact</h4><div className="space-y-2 text-sm text-slate-500"><p><PhoneLink phone={data.phone} /></p><p><MapLink address={data.address} /></p>{data.socialLinks && Object.entries(data.socialLinks).map(([platform, url]) => <a key={platform} href={url} target="_blank" rel="noopener noreferrer" className="block hover:text-white transition-colors capitalize">{platform}</a>)}</div></div>
          </div>
          <div className="border-t border-white/8 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-500"><PenNib size={14} weight="fill" style={{ color: ACCENT }} /><span>{data.businessName} &copy; {new Date().getFullYear()}</span></div>
            <div className="flex items-center gap-2 text-xs text-slate-600"><BluejayLogo className="w-4 h-4" /><span>Built by <a href="https://bluejayportfolio.com/audit" target="_blank" rel="noopener noreferrer" style={{textDecoration:"underline"}}>BlueJays</a> — get your free site audit</span></div>
          </div>
        </div>
      </footer>

      <ClaimBanner businessName={data.businessName} accentColor={ACCENT} prospectId={data.id} />
      <div className="h-14 md:h-28" />
    </main>
  );
}
