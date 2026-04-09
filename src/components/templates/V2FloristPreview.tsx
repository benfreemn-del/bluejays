"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import {
  Flower, ShieldCheck, Clock, Phone, MapPin, CaretDown, List, X,
  CheckCircle, ArrowRight, Star, Leaf, Heart, Truck, Gift, Palette,
} from "@phosphor-icons/react";
import type { GeneratedSiteData } from "@/lib/generator";
import BluejayLogo from "../BluejayLogo";
import { MapLink, PhoneLink } from "@/components/templates/MapLink";
import ClaimBanner from "@/components/ClaimBanner";

const spring = { type: "spring" as const, stiffness: 100, damping: 20 };
const springFast = { type: "spring" as const, stiffness: 200, damping: 25 };
const CHARCOAL = "#fdf9f7";
const DEFAULT_ROSE = "#e11d48";
const SAGE = "#6b8f71";
const ROSE_LIGHT = "#fb7185";

function getAccent(accentColor?: string) { const c = accentColor || DEFAULT_ROSE; return { ACCENT: c, ACCENT_GLOW: `${c}26`, SAGE, ROSE_LIGHT }; }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SERVICE_ICON_MAP: Record<string, any> = {
  wedding: Heart, bridal: Heart, bouquet: Flower, arrangement: Flower,
  delivery: Truck, event: Gift, sympathy: Flower, corporate: Gift,
  plant: Leaf, seasonal: Leaf, custom: Palette, gift: Gift,
};
function getServiceIcon(n: string) { const l = n.toLowerCase(); for (const [k, I] of Object.entries(SERVICE_ICON_MAP)) { if (l.includes(k)) return I; } return Flower; }

const STOCK_HERO = "https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=1400&q=80";
const STOCK_ABOUT = "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=600&q=80";
const STOCK_GALLERY = [
  "https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=600&q=80",
  "https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=600&q=80",
  "https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=600&q=80",
  "https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=600&q=80",
  "https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=600&q=80",
  "https://images.unsplash.com/photo-1469259943454-aa100abba749?w=600&q=80",
];

function FloatingPetals({ accent }: { accent: string }) {
  const particles = Array.from({ length: 22 }, (_, i) => ({ id: i, x: Math.random() * 100, delay: Math.random() * 8, duration: 6 + Math.random() * 8, size: 3 + Math.random() * 4, opacity: 0.12 + Math.random() * 0.3, isSage: Math.random() > 0.65 }));
  return (<div className="pointer-events-none fixed inset-0 z-0 overflow-hidden hidden md:block">{particles.map((p) => (<motion.div key={p.id} className="absolute rounded-full" style={{ left: `${p.x}%`, width: p.size, height: p.size, background: p.isSage ? SAGE : accent, willChange: "transform, opacity" }} animate={{ y: ["-10vh", "110vh"], x: [0, Math.random() * 30 - 15], opacity: [0, p.opacity, p.opacity, 0] }} transition={{ y: { duration: p.duration, repeat: Infinity, delay: p.delay, ease: "linear" }, x: { duration: p.duration * 0.5, repeat: Infinity, repeatType: "mirror", delay: p.delay }, opacity: { duration: p.duration, repeat: Infinity, delay: p.delay, times: [0, 0.1, 0.9, 1] } }} />))}</div>);
}

function PetalPattern({ opacity = 0.03, accent }: { opacity?: number; accent: string }) {
  const pid = `petalPat-${accent.replace("#", "")}`;
  return (<svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }}><defs><pattern id={pid} width="100" height="100" patternUnits="userSpaceOnUse"><path d="M20 20 Q25 10 30 20 Q25 30 20 20 Z" fill={accent} opacity="0.2" /><path d="M70 50 Q75 40 80 50 Q75 60 70 50 Z" fill={SAGE} opacity="0.15" /><path d="M40 80 Q45 70 50 80 Q45 90 40 80 Z" fill={accent} opacity="0.18" /><circle cx="90" cy="20" r="1.5" fill={SAGE} opacity="0.2" /><circle cx="10" cy="60" r="1" fill={accent} opacity="0.15" /></pattern></defs><rect width="100%" height="100%" fill={`url(#${pid})`} /></svg>);
}

function VineBackground({ opacity = 0.03, accent }: { opacity?: number; accent: string }) {
  return (<svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }} viewBox="0 0 1000 600" preserveAspectRatio="none"><path d="M0 300 Q200 250 400 300 Q600 350 800 280 Q900 260 1000 290" stroke={SAGE} strokeWidth="1.5" fill="none" /><path d="M0 400 Q150 380 300 420 Q500 450 700 390 Q850 370 1000 400" stroke={accent} strokeWidth="1" fill="none" /><circle cx="400" cy="300" r="4" fill={SAGE} opacity="0.3" /><circle cx="700" cy="390" r="3" fill={accent} opacity="0.25" /></svg>);
}

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) { return <div className={`rounded-2xl border border-gray-200 bg-white/70 backdrop-blur-xl shadow-sm ${className}`}>{children}</div>; }

function MagneticButton({ children, className = "", onClick, style, href }: { children: React.ReactNode; className?: string; onClick?: () => void; style?: React.CSSProperties; href?: string }) {
  const ref = useRef<HTMLButtonElement>(null); const x = useMotionValue(0); const y = useMotionValue(0); const springX = useSpring(x, springFast); const springY = useSpring(y, springFast);
  const isTouchDevice = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
  const handleMouseMove = useCallback((e: React.MouseEvent) => { if (!ref.current || isTouchDevice) return; const r = ref.current.getBoundingClientRect(); x.set((e.clientX - (r.left + r.width / 2)) * 0.25); y.set((e.clientY - (r.top + r.height / 2)) * 0.25); }, [x, y, isTouchDevice]);
  const handleMouseLeave = useCallback(() => { x.set(0); y.set(0); }, [x, y]);
  if (href) return <motion.a href={href} ref={ref as unknown as React.Ref<HTMLAnchorElement>} style={{ x: springX, y: springY, willChange: "transform", ...style }} onMouseMove={handleMouseMove as unknown as React.MouseEventHandler<HTMLAnchorElement>} onMouseLeave={handleMouseLeave} className={className} whileTap={{ scale: 0.97 }}>{children}</motion.a>;
  return <motion.button ref={ref} style={{ x: springX, y: springY, willChange: "transform", ...style }} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} onClick={onClick} className={className} whileTap={{ scale: 0.97 }}>{children}</motion.button>;
}

function ShimmerBorder({ children, className = "", accent }: { children: React.ReactNode; className?: string; accent: string }) { return (<div className={`relative rounded-2xl p-[1px] overflow-hidden ${className}`}><motion.div className="absolute inset-0 rounded-2xl" style={{ background: `conic-gradient(from 0deg, transparent, ${accent}, transparent, ${SAGE}, transparent)`, willChange: "transform" }} animate={{ rotate: [0, 360] }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} /><div className="relative rounded-2xl bg-white z-10">{children}</div></div>); }

function AccordionItem({ question, answer, isOpen, onToggle }: { question: string; answer: string; isOpen: boolean; onToggle: () => void }) { return (<GlassCard className="overflow-hidden"><button onClick={onToggle} className="w-full flex items-center justify-between p-5 md:p-6 text-left group cursor-pointer"><span className="text-lg font-semibold text-[#1c1917] pr-4">{question}</span><motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={spring}><CaretDown size={20} className="text-[#6b7280] shrink-0" /></motion.div></button><AnimatePresence initial={false}>{isOpen && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={spring} className="overflow-hidden"><p className="px-5 pb-5 md:px-6 md:pb-6 text-[#6b7280] leading-relaxed">{answer}</p></motion.div>)}</AnimatePresence></GlassCard>); }

function SectionHeader({ badge, title, subtitle, accent }: { badge: string; title: string; subtitle?: string; accent: string }) { return (<div className="text-center mb-16"><span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: accent, borderColor: `${accent}33`, background: `${accent}0d` }}>{badge}</span><h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-[#1c1917]">{title}</h2><div className="h-0.5 w-16 mx-auto mt-4" style={{ background: `linear-gradient(to right, ${accent}, transparent)` }} />{subtitle && <p className="text-[#6b7280] mt-4 max-w-2xl text-lg leading-relaxed mx-auto">{subtitle}</p>}</div>); }


/* ───────────────────────── ANIMATED SECTION ───────────────────────── */
function AnimatedSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: "easeOut" as const }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function V2FloristPreview({ data }: { data: GeneratedSiteData }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const { ACCENT, ACCENT_GLOW } = getAccent(data.accentColor);
  const heroImage = data.photos?.[0] || STOCK_HERO;
  const aboutImage = data.photos?.[1] || STOCK_ABOUT;
  const galleryImages = data.photos?.length > 2 ? data.photos.slice(2, 8) : STOCK_GALLERY;

  const faqs = [
    { q: `What floral services does ${data.businessName} offer?`, a: `We create ${data.services.slice(0, 3).map(s => s.name).join(", ")}, and much more. Every arrangement is handcrafted with the freshest seasonal blooms.` },
    { q: "Do you offer same-day delivery?", a: "Yes! We offer same-day delivery for orders placed before noon. We also offer next-day delivery and scheduled delivery for events and special occasions." },
    { q: "Can you do custom arrangements?", a: `Absolutely! Custom arrangements are our specialty at ${data.businessName}. Tell us your vision, colors, and occasion, and our designers will create something unique.` },
    { q: "Do you provide wedding flowers?", a: "Yes! We offer comprehensive wedding floral services including bridal bouquets, centerpieces, ceremony arrangements, and venue decoration. Book a consultation to plan your perfect day." },
  ];

  /* Fallback testimonials */
  const fallbackTestimonials = [
    { name: "Emma S.", text: "The wedding arrangements were breathtaking. Every bouquet was more beautiful than I imagined.", rating: 5 },
    { name: "Michael D.", text: "I send flowers from here every anniversary. Always fresh, always stunning, always on time.", rating: 5 },
    { name: "Claire W.", text: "They designed the most gorgeous centerpieces for our event. True artists with flowers.", rating: 5 }
  ];
  const testimonials = data.testimonials?.length > 0 ? data.testimonials : fallbackTestimonials;

  const occasions = ["Weddings", "Birthdays", "Anniversaries", "Sympathy", "Corporate", "Get Well", "Thank You", "Just Because"];

  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden" style={{ background: CHARCOAL, color: "#1c1917" }}>
      <FloatingPetals accent={ACCENT} />

      {/* 1. NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50"><div className="mx-auto max-w-7xl px-4 md:px-6 py-4"><GlassCard className="flex items-center justify-between px-4 md:px-6 py-3"><div className="flex items-center gap-2"><Flower size={24} weight="fill" style={{ color: ACCENT }} /><span className="text-lg font-bold tracking-tight text-[#1c1917]">{data.businessName}</span></div><div className="hidden md:flex items-center gap-8 text-sm text-[#6b7280]"><a href="#gallery" className="hover:text-[#1c1917] transition-colors">Gallery</a><a href="#services" className="hover:text-[#1c1917] transition-colors">Services</a><a href="#about" className="hover:text-[#1c1917] transition-colors">About</a><a href="#contact" className="hover:text-[#1c1917] transition-colors">Contact</a></div><div className="flex items-center gap-3"><MagneticButton className="px-4 md:px-5 py-2 rounded-full text-sm font-semibold text-[#1c1917] transition-colors cursor-pointer" style={{ background: ACCENT } as React.CSSProperties}>Order Now</MagneticButton><button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-lg text-[#1c1917] hover:bg-gray-100 transition-colors">{mobileMenuOpen ? <X size={24} /> : <List size={24} />}</button></div></GlassCard><AnimatePresence>{mobileMenuOpen && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }} className="md:hidden mt-2 overflow-hidden"><GlassCard className="flex flex-col gap-1 px-4 py-4">{[{ label: "Gallery", href: "#gallery" },{ label: "Services", href: "#services" },{ label: "About", href: "#about" },{ label: "Contact", href: "#contact" }].map((link) => <a key={link.label} href={link.href} onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-lg text-sm text-[#4b5563] hover:text-[#1c1917] hover:bg-gray-50 transition-colors">{link.label}</a>)}</GlassCard></motion.div>)}</AnimatePresence></div></nav>

      {/* 2. HERO */}
      <section className="relative min-h-[100dvh] flex items-center pt-24 z-10 overflow-hidden">

        <div className="absolute inset-0">
          <img src={heroImage} alt={`${data.businessName}`} className="w-full h-full object-cover object-center" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-black/10" />
          <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-transparent" />
        </div>
        <PetalPattern opacity={0.04} accent={ACCENT} /><VineBackground opacity={0.03} accent={ACCENT} />
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full blur-[200px] pointer-events-none" style={{ background: `${ACCENT}08` }} />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full blur-[160px] pointer-events-none" style={{ background: `${SAGE}06` }} />
        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          <div className="space-y-8">
            <div><p className="text-sm uppercase tracking-widest mb-4" style={{ color: ACCENT }}>Artisan Floral Design</p><h1 className="text-3xl md:text-6xl tracking-tighter leading-none font-bold text-[#1c1917]" style={{ textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>{data.tagline}</h1></div>
            <p className="text-lg text-[#6b7280] max-w-md leading-relaxed">{data.about.length > 160 ? data.about.slice(0, 160).trim() + "..." : data.about}</p>
            <div className="flex flex-wrap gap-4">
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-[#1c1917] flex items-center gap-2 cursor-pointer" style={{ background: ACCENT } as React.CSSProperties}>Order Flowers <ArrowRight size={18} weight="bold" /></MagneticButton>
              <MagneticButton href={`tel:${data.phone.replace(/\D/g, "")}`} className="px-8 py-4 rounded-full text-base font-semibold text-[#1c1917] border border-gray-200 flex items-center gap-2 cursor-pointer"><Phone size={18} weight="duotone" /><PhoneLink phone={data.phone} /></MagneticButton>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-[#6b7280]"><span className="flex items-center gap-2"><MapPin size={16} weight="duotone" style={{ color: ACCENT }} /><MapLink address={data.address} /></span><span className="flex items-center gap-2"><Truck size={16} weight="duotone" style={{ color: ACCENT }} />Same-Day Delivery</span></div>
          </div>
          <div className="hidden md:block relative"><div className="relative rounded-2xl overflow-hidden border border-gray-200"><img src={heroImage} alt={`${data.businessName} floral arrangements`} className="w-full h-[500px] object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-[#fdf9f7] via-transparent to-transparent" /><div className="absolute bottom-6 left-6"><div className="px-4 py-2 rounded-full backdrop-blur-md bg-black/50 border flex items-center gap-2" style={{ borderColor: `${ACCENT}4d` }}><Flower size={18} weight="fill" style={{ color: ACCENT }} /><span className="text-sm font-semibold text-[#1c1917]">Hand-Crafted Arrangements</span></div></div></div></div>
        </div>
      </section>

      {/* 3. STATS */}
      <section className="relative z-10 py-16 overflow-hidden border-y" style={{ borderColor: `${ACCENT}1a` }}>
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #f0f5f0 0%, #fdf9f7 100%)" }} /><PetalPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10"><div className="grid grid-cols-2 md:grid-cols-4 gap-8">{data.stats.map((stat, i) => { const icons = [Flower, Heart, Truck, Star]; const Icon = icons[i % icons.length]; return (<div key={stat.label} className="text-center"><div className="flex items-center justify-center gap-2 mb-2"><Icon size={22} weight="fill" style={{ color: ACCENT }} /><span className="text-3xl md:text-4xl font-extrabold text-[#1c1917]">{stat.value}</span></div><span className="text-[#9ca3af] text-sm font-medium tracking-wide uppercase">{stat.label}</span></div>); })}</div></div>
      </section>

      {/* 4. GALLERY (PRIMARY - GALLERY HEAVY) */}
      <section id="gallery" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #fdf9f7 0%, #fdf5f0 50%, #fdf9f7 100%)" }} /><PetalPattern accent={ACCENT} opacity={0.03} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[20%] left-[10%] w-[500px] h-[500px] rounded-full blur-[200px]" style={{ background: `${ACCENT}06` }} /></div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Our Creations" title="Floral Gallery" subtitle="Each arrangement is a unique work of art, designed with love and the freshest blooms." accent={ACCENT} />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {galleryImages.map((src, i) => (<div key={i} className="group relative rounded-2xl overflow-hidden border border-gray-200/60 hover:border-opacity-30 transition-all duration-500 aspect-square"><img src={src} alt={`Floral arrangement ${i + 1}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" /><div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" /><div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500"><span className="text-sm font-semibold text-[#1c1917]">View Details</span></div></div>))}
          </div>
        </div>
      </section>

      {/* 5. SERVICES */}
      <section id="services" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #fdf9f7 0%, #f0f5f0 50%, #fdf9f7 100%)" }} /><VineBackground opacity={0.025} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Our Services" title="Floral Services" subtitle={`From daily bouquets to grand wedding designs, ${data.businessName} creates beauty for every occasion.`} accent={ACCENT} />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.services.map((service, i) => { const Icon = getServiceIcon(service.name); return (
              <div key={service.name} className="group relative p-7 rounded-2xl border border-gray-200/60 hover:border-opacity-30 transition-all duration-500 overflow-hidden bg-white/60">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: `radial-gradient(circle at 50% 0%, ${ACCENT}15, transparent 70%)` }} />
                <div className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `linear-gradient(to right, transparent, ${ACCENT}4d, transparent)` }} />
                <div className="relative z-10"><div className="flex items-start justify-between mb-5"><div className="w-12 h-12 rounded-xl flex items-center justify-center border" style={{ background: ACCENT_GLOW, borderColor: `${ACCENT}33` }}><Icon size={24} weight="duotone" style={{ color: ACCENT }} /></div><span className="text-xs font-mono text-[#6b7280]">{String(i + 1).padStart(2, "0")}</span></div><h3 className="text-lg font-bold text-[#1c1917] mb-2">{service.name}</h3><p className="text-sm text-[#6b7280] leading-relaxed">{service.description || ""}</p>{service.price && <p className="text-sm font-semibold mt-3" style={{ color: ACCENT }}>{service.price}</p>}</div>
              </div>
            ); })}
          </div>
        </div>
      </section>

      {/* 6. ABOUT */}
      <section id="about" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #fdf9f7 0%, #fdf5f0 50%, #fdf9f7 100%)" }} /><PetalPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="relative"><div className="rounded-2xl overflow-hidden border border-gray-200"><img src={aboutImage} alt={`${data.businessName} studio`} className="w-full h-[400px] object-cover" /></div><div className="absolute -bottom-4 -right-4 md:bottom-6 md:-right-6"><div className="px-5 py-3 rounded-xl backdrop-blur-md border text-[#1c1917] font-bold text-sm shadow-lg" style={{ background: `${ACCENT}e6`, borderColor: `${ACCENT}80` }}>{data.stats[0] ? `${data.stats[0].value} ${data.stats[0].label}` : "Award-Winning Designs"}</div></div></div>
            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: ACCENT, borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}>Our Story</span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6 text-[#1c1917]">Where Beauty Blooms</h2>
              <p className="text-[#6b7280] leading-relaxed mb-8">{data.about}</p>
              <div className="grid grid-cols-2 gap-4">
                {[{ icon: Flower, label: "Fresh Daily" },{ icon: Truck, label: "Same-Day Delivery" },{ icon: Star, label: "5-Star Reviews" },{ icon: Heart, label: "Made With Love" }].map((badge) => (<GlassCard key={badge.label} className="p-4 flex items-center gap-3"><div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: ACCENT_GLOW }}><badge.icon size={20} weight="duotone" style={{ color: ACCENT }} /></div><span className="text-sm font-semibold text-[#1c1917]">{badge.label}</span></GlassCard>))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. OCCASIONS */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #fdf9f7 0%, #f0f5f0 50%, #fdf9f7 100%)" }} /><VineBackground opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <AnimatedSection>          <SectionHeader badge="Occasions" title="Flowers for Every Moment" accent={ACCENT} /></AnimatedSection>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{occasions.map((occ) => (<GlassCard key={occ} className="p-5 text-center group"><Flower size={24} weight="duotone" style={{ color: ACCENT }} className="mx-auto mb-3" /><span className="text-sm font-semibold text-[#1c1917]">{occ}</span></GlassCard>))}</div>
        </div>
      </section>

      {/* 8. TESTIMONIALS */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #fdf9f7 0%, #fdf5f0 50%, #fdf9f7 100%)" }} /><PetalPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <AnimatedSection>          <SectionHeader badge="Reviews" title="What Our Clients Say" accent={ACCENT} /></AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">{testimonials.map((t, i) => (<GlassCard key={i} className="p-6 h-full flex flex-col"><div className="flex gap-0.5 mb-4">{Array.from({ length: t.rating || 5 }).map((_, j) => <Star key={j} size={16} weight="fill" style={{ color: ACCENT }} />)}</div><p className="text-[#4b5563] leading-relaxed flex-1 text-sm mb-4">&ldquo;{t.text}&rdquo;</p><div className="pt-4 border-t border-gray-100"><span className="text-sm font-semibold text-[#1c1917]">{t.name}</span></div></GlassCard>))}</div>
        </div>
      </section>

      {/* 9. CTA */}
      <section className="relative z-10 py-20 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT}cc, ${ACCENT})` }} />
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <Heart size={48} weight="fill" className="mx-auto mb-6 text-white/70" />
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-[#1c1917] mb-4">Send Love in Every Petal</h2>
          <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">Order a stunning arrangement today. Same-day delivery available for orders before noon.</p>
          <PhoneLink phone={data.phone} className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-black text-[#1c1917] font-bold text-lg hover:bg-black/80 transition-colors"><Phone size={20} weight="fill" />{data.phone}</PhoneLink>
        </div>
      </section>

      {/* 10. PROCESS */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #fdf9f7 0%, #f0f5f0 50%, #fdf9f7 100%)" }} /><PetalPattern opacity={0.025} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <AnimatedSection>          <SectionHeader badge="How It Works" title="From Order to Doorstep" accent={ACCENT} /></AnimatedSection>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[{ step: "01", title: "Choose Your Style", desc: "Browse our gallery or describe your perfect arrangement." },{ step: "02", title: "Artisan Design", desc: "Our florists handcraft your arrangement with the freshest blooms." },{ step: "03", title: "Quality Check", desc: "Every arrangement is inspected for freshness and beauty." },{ step: "04", title: "Delivery", desc: "We deliver your flowers fresh to your doorstep or venue." }].map((step, i) => (
              <div key={step.step} className="relative">{i < 3 && <div className="hidden lg:block absolute top-10 left-[calc(50%+40px)] w-[calc(100%-80px)] h-px" style={{ background: `linear-gradient(to right, ${ACCENT}33, ${ACCENT}11)` }} />}<GlassCard className="p-6 text-center"><div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-black" style={{ background: `linear-gradient(135deg, ${ACCENT}22, ${ACCENT}0a)`, color: ACCENT, border: `1px solid ${ACCENT}33` }}>{step.step}</div><h3 className="text-lg font-bold text-[#1c1917] mb-2">{step.title}</h3><p className="text-sm text-[#6b7280] leading-relaxed">{step.desc}</p></GlassCard></div>
            ))}
          </div>
        </div>
      </section>

      {/* 11. SERVICE AREAS */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #fdf9f7 0%, #fdf5f0 50%, #fdf9f7 100%)" }} /><PetalPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10"><SectionHeader badge="Delivery Area" title="Where We Deliver" accent={ACCENT} /><div className="text-center"><GlassCard className="p-8 inline-block"><div className="flex items-center gap-3 text-lg"><MapPin size={24} weight="duotone" style={{ color: ACCENT }} /><MapLink address={data.address} className="text-[#1c1917] font-semibold" /></div><p className="text-[#6b7280] text-sm mt-2">&amp; Surrounding Areas</p></GlassCard></div></div>
      </section>

      {/* 12. HOURS */}
      {data.hours && (<section className="relative z-10 py-24 md:py-32 overflow-hidden"><div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #fdf9f7 0%, #f0f5f0 50%, #fdf9f7 100%)" }} /><VineBackground opacity={0.02} accent={ACCENT} /><div className="max-w-3xl mx-auto px-6 relative z-10"><SectionHeader badge="Shop Hours" title="When We're Open" accent={ACCENT} /><div className="text-center"><ShimmerBorder accent={ACCENT}><div className="p-8"><Clock size={32} weight="duotone" style={{ color: ACCENT }} className="mx-auto mb-4" /><p className="text-[#4b5563] leading-relaxed whitespace-pre-line text-lg">{data.hours}</p></div></ShimmerBorder></div></div></section>)}

      {/* 13. FAQ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden"><div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #fdf9f7 0%, #fdf5f0 50%, #fdf9f7 100%)" }} /><PetalPattern opacity={0.02} accent={ACCENT} /><div className="max-w-3xl mx-auto px-6 relative z-10"><SectionHeader badge="FAQ" title="Common Questions" accent={ACCENT} /><div className="space-y-3">{faqs.map((faq, i) => <AccordionItem key={i} question={faq.q} answer={faq.a} isOpen={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} />)}</div></div></section>

      {/* 14. CONTACT */}
      <section id="contact" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #fdf9f7 0%, #f0f5f0 50%, #fdf9f7 100%)" }} /><VineBackground opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: ACCENT, borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}>Contact Us</span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6 text-[#1c1917]">Order Beautiful Flowers</h2>
              <p className="text-[#6b7280] leading-relaxed mb-8">Ready to brighten someone&apos;s day? Contact {data.businessName} to order a custom arrangement or schedule a consultation.</p>
              <div className="space-y-5">
                <div className="flex items-start gap-4"><div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: ACCENT_GLOW }}><MapPin size={20} weight="duotone" style={{ color: ACCENT }} /></div><div><p className="text-sm font-semibold text-[#1c1917]">Shop</p><MapLink address={data.address} className="text-sm text-[#6b7280]" /></div></div>
                <div className="flex items-start gap-4"><div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: ACCENT_GLOW }}><Phone size={20} weight="duotone" style={{ color: ACCENT }} /></div><div><p className="text-sm font-semibold text-[#1c1917]">Phone</p><PhoneLink phone={data.phone} className="text-sm text-[#6b7280]" /></div></div>
                {data.hours && <div className="flex items-start gap-4"><div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: ACCENT_GLOW }}><Clock size={20} weight="duotone" style={{ color: ACCENT }} /></div><div><p className="text-sm font-semibold text-[#1c1917]">Hours</p><p className="text-sm text-[#6b7280] whitespace-pre-line">{data.hours}</p></div></div>}
              </div>
            </div>
            <GlassCard className="p-8">
              <h3 className="text-xl font-semibold text-[#1c1917] mb-6">Order Flowers</h3>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><div><label className="block text-sm text-[#6b7280] mb-1.5">Your Name</label><input type="text" className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-[#1c1917] placeholder-gray-400 focus:outline-none text-sm" placeholder="Jane Doe" /></div><div><label className="block text-sm text-[#6b7280] mb-1.5">Phone</label><input type="tel" className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-[#1c1917] placeholder-gray-400 focus:outline-none text-sm" placeholder="(555) 123-4567" /></div></div>
                <div><label className="block text-sm text-[#6b7280] mb-1.5">Occasion</label><select className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-[#1c1917] focus:outline-none text-sm"><option value="" className="bg-white">Select occasion</option>{occasions.map((o) => <option key={o} value={o.toLowerCase()} className="bg-white">{o}</option>)}</select></div>
                <div><label className="block text-sm text-[#6b7280] mb-1.5">Message</label><textarea rows={4} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-[#1c1917] placeholder-gray-400 focus:outline-none text-sm resize-none" placeholder="Describe what you're looking for..." /></div>
                <MagneticButton className="w-full py-4 rounded-xl text-base font-semibold text-[#1c1917] flex items-center justify-center gap-2 cursor-pointer" style={{ background: ACCENT } as React.CSSProperties}>Send Request <ArrowRight size={18} weight="bold" /></MagneticButton>
              </form>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* 15. FOOTER */}
      <footer className="relative z-10 border-t border-gray-100 py-10 overflow-hidden"><div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #fdf9f7 0%, #f5f3ef 100%)" }} /><PetalPattern opacity={0.015} accent={ACCENT} /><div className="mx-auto max-w-6xl px-6 relative z-10"><div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8"><div><div className="flex items-center gap-2 mb-3"><Flower size={22} weight="fill" style={{ color: ACCENT }} /><span className="text-lg font-bold text-[#1c1917]">{data.businessName}</span></div><p className="text-sm text-[#9ca3af] leading-relaxed">{data.about.length > 120 ? data.about.slice(0, 120).trim() + "..." : data.about}</p></div><div><h4 className="text-sm font-semibold text-[#1c1917] mb-3">Quick Links</h4><div className="space-y-2">{["Gallery","Services","About","Contact"].map((link) => <a key={link} href={`#${link.toLowerCase()}`} className="block text-sm text-[#9ca3af] hover:text-[#1c1917] transition-colors">{link}</a>)}</div></div><div><h4 className="text-sm font-semibold text-[#1c1917] mb-3">Contact</h4><div className="space-y-2 text-sm text-[#9ca3af]"><p><PhoneLink phone={data.phone} /></p><p><MapLink address={data.address} /></p>{data.socialLinks && Object.entries(data.socialLinks).map(([platform, url]) => <a key={platform} href={url} target="_blank" rel="noopener noreferrer" className="block hover:text-[#1c1917] transition-colors capitalize">{platform}</a>)}</div></div></div><div className="border-t border-gray-100 pt-6 flex flex-col md:flex-row items-center justify-between gap-4"><div className="flex items-center gap-2 text-sm text-[#9ca3af]"><Flower size={14} weight="fill" style={{ color: ACCENT }} /><span>{data.businessName} &copy; {new Date().getFullYear()}</span></div><div className="flex items-center gap-2 text-xs text-[#6b7280]"><BluejayLogo className="w-4 h-4" /><span>Created by <a href="https://bluejayportfolio.com" target="_blank" rel="noopener noreferrer" style={{textDecoration:"underline"}}>bluejayportfolio.com</a></span></div></div></div></footer>

      <ClaimBanner businessName={data.businessName} accentColor={ACCENT} prospectId={data.id} />
      <div className="h-14 md:h-28" />
    </main>
  );
}
