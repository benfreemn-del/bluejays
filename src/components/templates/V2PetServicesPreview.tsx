"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import { PawPrint, Dog, Cat, Scissors, Heart, Star, ShieldCheck, Clock, Phone, MapPin, ArrowRight, CheckCircle, CaretDown, List, X, Users, Van } from "@phosphor-icons/react";
import type { GeneratedSiteData } from "@/lib/generator";
import BluejayLogo from "../BluejayLogo";
import { MapLink, PhoneLink } from "@/components/templates/MapLink";
import ClaimBanner from "@/components/ClaimBanner";

const spring = { type: "spring" as const, stiffness: 100, damping: 20 };
const springFast = { type: "spring" as const, stiffness: 200, damping: 25 };
const DEFAULT_ORANGE = "#f59e0b";
const SKY = "#0ea5e9";
const BG = "#0a1015";

function getAccent(c?: string) { const a = c || DEFAULT_ORANGE; return { ACCENT: a, ACCENT_GLOW: `${a}26` }; }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ICON_MAP: Record<string, any> = { groom: Scissors, board: Heart, daycare: Dog, train: Star, walk: PawPrint, taxi: Van, cat: Cat, bath: Scissors, sit: Heart };
function getServiceIcon(n: string) { const l = n.toLowerCase(); for (const [k, I] of Object.entries(ICON_MAP)) { if (l.includes(k)) return I; } return PawPrint; }

const STOCK_HERO = "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=1400&q=80";
const STOCK_ABOUT = "https://images.unsplash.com/photo-1535268647677-300dbf3d78d1?w=600&q=80";
const STOCK_GALLERY = ["https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=600&q=80","https://images.unsplash.com/photo-1535268647677-300dbf3d78d1?w=600&q=80","https://images.unsplash.com/photo-1596492784531-6e6eb5ea9993?w=600&q=80","https://images.unsplash.com/photo-1560807707-8cc77767d783?w=600&q=80","https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=600&q=80","https://images.unsplash.com/photo-1544568100-847a948585b9?w=600&q=80"];

function FloatingSparks({ accent }: { accent: string }) {
  const ps = Array.from({ length: 18 }, (_, i) => ({ id: i, x: Math.random() * 100, delay: Math.random() * 8, dur: 5 + Math.random() * 7, size: 2 + Math.random() * 3, op: 0.12 + Math.random() * 0.3, isSky: Math.random() > 0.5 }));
  return <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden hidden md:block">{ps.map((p) => <motion.div key={p.id} className="absolute rounded-full" style={{ left: `${p.x}%`, width: p.size, height: p.size, background: p.isSky ? SKY : accent, willChange: "transform, opacity" }} animate={{ y: ["-10vh", "110vh"], opacity: [0, p.op, p.op, 0] }} transition={{ y: { duration: p.dur, repeat: Infinity, delay: p.delay, ease: "linear" }, opacity: { duration: p.dur, repeat: Infinity, delay: p.delay, times: [0, 0.1, 0.9, 1] } }} />)}</div>;
}

function PawPattern({ opacity = 0.03, accent }: { opacity?: number; accent: string }) {
  const pid = `pawV2Prev-${accent.replace("#", "")}`;
  return <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }}><defs><pattern id={pid} width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="50" cy="35" r="8" fill={accent} opacity="0.3" /><circle cx="35" cy="22" r="4" fill={accent} opacity="0.2" /><circle cx="65" cy="22" r="4" fill={accent} opacity="0.2" /><circle cx="30" cy="35" r="4" fill={accent} opacity="0.2" /><circle cx="70" cy="35" r="4" fill={accent} opacity="0.2" /></pattern></defs><rect width="100%" height="100%" fill={`url(#${pid})`} /></svg>;
}

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) { return <div className={`rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] ${className}`}>{children}</div>; }

function MagneticButton({ children, className = "", onClick, style, href }: { children: React.ReactNode; className?: string; onClick?: () => void; style?: React.CSSProperties; href?: string }) {
  const ref = useRef<HTMLButtonElement>(null); const x = useMotionValue(0); const y = useMotionValue(0); const sx = useSpring(x, springFast); const sy = useSpring(y, springFast);
  const isTD = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
  const mm = useCallback((e: React.MouseEvent) => { if (!ref.current || isTD) return; const r = ref.current.getBoundingClientRect(); x.set((e.clientX - (r.left + r.width / 2)) * 0.25); y.set((e.clientY - (r.top + r.height / 2)) * 0.25); }, [x, y, isTD]);
  const ml = useCallback(() => { x.set(0); y.set(0); }, [x, y]);
  if (href) return <motion.a href={href} ref={ref as unknown as React.Ref<HTMLAnchorElement>} style={{ x: sx, y: sy, willChange: "transform", ...style }} onMouseMove={mm as unknown as React.MouseEventHandler<HTMLAnchorElement>} onMouseLeave={ml} className={className} whileTap={{ scale: 0.97 }}>{children}</motion.a>;
  return <motion.button ref={ref} style={{ x: sx, y: sy, willChange: "transform", ...style }} onMouseMove={mm} onMouseLeave={ml} onClick={onClick} className={className} whileTap={{ scale: 0.97 }}>{children}</motion.button>;
}

function ShimmerBorder({ children, className = "", accent }: { children: React.ReactNode; className?: string; accent: string }) {
  return <div className={`relative rounded-2xl p-[1px] overflow-hidden ${className}`}><motion.div className="absolute inset-0 rounded-2xl" style={{ background: `conic-gradient(from 0deg, transparent, ${accent}, transparent, ${SKY}, transparent)`, willChange: "transform" }} animate={{ rotate: [0, 360] }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} /><div className="relative rounded-2xl bg-[#0a1015] z-10">{children}</div></div>;
}

function SectionHeader({ badge, title, subtitle, accent }: { badge: string; title: string; subtitle?: string; accent: string }) {
  return <div className="text-center mb-16"><span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: accent, borderColor: `${accent}33`, background: `${accent}0d` }}>{badge}</span><h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white">{title}</h2><div className="h-0.5 w-16 mx-auto mt-4" style={{ background: `linear-gradient(to right, ${accent}, transparent)` }} />{subtitle && <p className="text-slate-400 mt-4 max-w-2xl text-lg leading-relaxed mx-auto">{subtitle}</p>}</div>;
}

function AccordionItem({ question, answer, isOpen, onToggle }: { question: string; answer: string; isOpen: boolean; onToggle: () => void }) {
  return <GlassCard className="overflow-hidden"><button onClick={onToggle} className="w-full flex items-center justify-between p-5 md:p-6 text-left group cursor-pointer"><span className="text-lg font-semibold text-white pr-4">{question}</span><motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={spring}><CaretDown size={20} className="text-slate-400 shrink-0" /></motion.div></button><AnimatePresence initial={false}>{isOpen && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={spring} className="overflow-hidden"><p className="px-5 pb-5 md:px-6 md:pb-6 text-slate-400 leading-relaxed">{answer}</p></motion.div>}</AnimatePresence></GlassCard>;
}

function ClaimBanner({ businessName, accentColor, prospectId }: { businessName: string; accentColor: string; prospectId: string }) {
  const [timeLeft, setTimeLeft] = useState("");
  useEffect(() => { const exp = new Date(); exp.setDate(exp.getDate() + 7); const tick = () => { const diff = exp.getTime() - Date.now(); if (diff <= 0) { setTimeLeft("EXPIRED"); return; } setTimeLeft(`${Math.floor(diff / 86400000)}d ${Math.floor((diff % 86400000) / 3600000)}h ${Math.floor((diff % 3600000) / 60000)}m`); }; tick(); const i = setInterval(tick, 60000); return () => clearInterval(i); }, []);
  return <div className="fixed bottom-0 left-0 right-0 z-50"><div className="bg-[#1a1a1a]/90 backdrop-blur-sm border-t border-white/10 px-4 py-2 flex items-center justify-center gap-4"><p className="text-xs text-slate-400"><span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1.5 animate-pulse" />Custom-built preview for this business</p>{timeLeft && timeLeft !== "EXPIRED" && <p className="text-xs font-bold" style={{ color: accentColor }}>Preview expires in {timeLeft}</p>}</div><div className="px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4" style={{ background: `linear-gradient(135deg, ${accentColor}20, ${accentColor}10)`, borderTop: `1px solid ${accentColor}30` }}><div className="flex-1 min-w-0"><p className="text-sm font-semibold text-white truncate">This website was built for {businessName}</p><p className="text-xs text-slate-400">Limited time — claim your free website today</p></div><a href={`/claim/${prospectId}`} className="shrink-0 min-h-[48px] px-5 sm:px-6 rounded-full text-white text-sm font-bold flex items-center gap-2 hover:shadow-lg transition-all duration-300 shadow-lg w-full sm:w-auto justify-center" style={{ background: accentColor }}>Claim This Website <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg></a></div></div>;
}

/* ───────────────────────── ANIMATED SECTION ───────────────────────── */
function AnimatedSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={ opacity: 0, scale: 0.92 }
      whileInView={ opacity: 1, scale: 1 }
      viewport={{ once: true, margin: "-80px" }}
      transition={ duration: 0.5, ease: "easeOut" as const }
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function V2PetServicesPreview({ data }: { data: GeneratedSiteData }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const { ACCENT, ACCENT_GLOW } = getAccent(data.accentColor);
  const heroImage = data.photos?.[0] || STOCK_HERO;
  const aboutImage = data.photos?.[1] || STOCK_ABOUT;
  const galleryImages = data.photos?.length > 2 ? data.photos.slice(2, 8) : STOCK_GALLERY;

  const faqs = [
    { q: `What services does ${data.businessName} offer?`, a: `We offer ${data.services.slice(0, 3).map(s => s.name).join(", ")}, and more. Contact us to learn about our full range of pet care services.` },
    { q: "What vaccinations are required?", a: "All pets must be current on rabies, distemper, and bordetella. We require proof of vaccination before the first visit." },
    { q: "Do you accept cats and other pets?", a: `Yes! While we specialize in dogs, ${data.businessName} also cares for cats and other small pets.` },
    { q: "What if my pet has special needs?", a: "We create customized care plans for every pet, including those with medical conditions, anxiety, or special dietary needs." },
  ];

  /* Fallback testimonials */
  const fallbackTestimonials = [
    { name: "Amy R.", text: "My dog comes home happy and exhausted every time. The staff clearly loves animals.", rating: 5 },
    { name: "Josh M.", text: "Best grooming our poodle has ever had. Patient, gentle, and the cut was perfect.", rating: 5 },
    { name: "Tina K.", text: "We board our cats here whenever we travel. They send us photo updates and the cats are always content.", rating: 5 }
  ];
  const testimonials = data.testimonials?.length > 0 ? data.testimonials : fallbackTestimonials;

  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden" style={{ background: BG, color: "#f1f5f9" }}>
      <FloatingSparks accent={ACCENT} />

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50"><div className="mx-auto max-w-7xl px-4 md:px-6 py-4"><GlassCard className="flex items-center justify-between px-4 md:px-6 py-3"><div className="flex items-center gap-2"><PawPrint size={24} weight="fill" style={{ color: ACCENT }} /><span className="text-lg font-bold tracking-tight text-white">{data.businessName}</span></div><div className="hidden md:flex items-center gap-8 text-sm text-slate-400"><a href="#services" className="hover:text-white transition-colors">Services</a><a href="#gallery" className="hover:text-white transition-colors">Gallery</a><a href="#about" className="hover:text-white transition-colors">About</a><a href="#contact" className="hover:text-white transition-colors">Contact</a></div><div className="flex items-center gap-3"><MagneticButton className="px-4 md:px-5 py-2 rounded-full text-sm font-semibold text-black transition-colors cursor-pointer" style={{ background: ACCENT } as React.CSSProperties}>Book Now</MagneticButton><button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors">{mobileMenuOpen ? <X size={24} /> : <List size={24} />}</button></div></GlassCard>
        <AnimatePresence>{mobileMenuOpen && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="md:hidden mt-2 overflow-hidden"><GlassCard className="flex flex-col gap-1 px-4 py-4">{["Services", "Gallery", "About", "Contact"].map((l) => <a key={l} href={`#${l.toLowerCase()}`} onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors">{l}</a>)}</GlassCard></motion.div>}</AnimatePresence>
      </div></nav>

      {/* HERO */}
      <section className="relative min-h-[100dvh] flex items-center pt-24 z-10 overflow-hidden">

        <div className="absolute inset-0">
          <img src={heroImage} alt={`${data.businessName}`} className="w-full h-full object-cover object-center" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/25 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        </div>
        <PawPattern opacity={0.05} accent={ACCENT} />
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full blur-[200px] pointer-events-none" style={{ background: `${ACCENT}0a` }} />
        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          <div className="space-y-8">
            <div><p className="text-sm uppercase tracking-widest mb-4" style={{ color: ACCENT }}>Professional Pet Care</p><h1 className="text-3xl md:text-6xl tracking-tighter leading-none font-bold text-white" style={{ textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>{data.tagline}</h1></div>
            <p className="text-lg text-slate-400 max-w-md leading-relaxed">{data.about.length > 160 ? data.about.slice(0, 160).trim() + "..." : data.about}</p>
            <div className="flex flex-wrap gap-4">
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-black flex items-center gap-2 cursor-pointer" style={{ background: ACCENT } as React.CSSProperties}>Book Appointment <ArrowRight size={18} weight="bold" /></MagneticButton>
              <MagneticButton href={`tel:${data.phone.replace(/\D/g, "")}`} className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/10 flex items-center gap-2 cursor-pointer"><Phone size={18} weight="duotone" /> <PhoneLink phone={data.phone} /></MagneticButton>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-slate-400"><span className="flex items-center gap-2"><MapPin size={16} weight="duotone" style={{ color: ACCENT }} /> <MapLink address={data.address} /></span><span className="flex items-center gap-2"><Clock size={16} weight="duotone" style={{ color: ACCENT }} /> {data.hours || "Open 7 Days"}</span></div>
          </div>
          <div className="hidden md:block relative"><div className="relative rounded-2xl overflow-hidden border border-white/10"><img src={heroImage} alt={`${data.businessName}`} className="w-full h-[500px] object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-[#0a1015] via-transparent to-transparent" /><div className="absolute bottom-6 left-6"><div className="px-4 py-2 rounded-full backdrop-blur-md bg-black/50 border flex items-center gap-2" style={{ borderColor: `${ACCENT}4d` }}><Heart size={18} weight="fill" style={{ color: ACCENT }} /><span className="text-sm font-semibold text-white">Trusted Pet Care</span></div></div></div></div>
        </div>
      </section>

      {/* STATS */}
      <section className="relative z-10 py-16 overflow-hidden border-y" style={{ borderColor: `${ACCENT}1a` }}>
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, #0c1218 0%, ${BG} 100%)` }} />
        <PawPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10"><div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {data.stats.map((stat, i) => { const icons = [PawPrint, Clock, ShieldCheck, Star]; const Icon = icons[i % icons.length]; return <div key={stat.label} className="text-center"><div className="flex items-center justify-center gap-2 mb-2"><Icon size={22} weight="fill" style={{ color: ACCENT }} /><span className="text-3xl md:text-4xl font-extrabold text-white">{stat.value}</span></div><span className="text-slate-500 text-sm font-medium tracking-wide uppercase">{stat.label}</span></div>; })}
        </div></div>
      </section>

      {/* SERVICES */}
      <section id="services" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #0c1218 50%, ${BG} 100%)` }} />
        <PawPattern accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Our Services" title="Everything Your Pet Needs" subtitle={`${data.businessName} provides professional care for your furry family members.`} accent={ACCENT} />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.services.map((svc, i) => { const Icon = getServiceIcon(svc.name); return (
              <div key={svc.name} className="group relative p-7 rounded-2xl border border-white/[0.06] hover:border-opacity-30 transition-all duration-500 overflow-hidden bg-white/[0.02]">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: `radial-gradient(circle at 50% 0%, ${ACCENT}15, transparent 70%)` }} />
                <div className="relative z-10"><div className="flex items-start justify-between mb-5"><div className="w-12 h-12 rounded-xl flex items-center justify-center border" style={{ background: ACCENT_GLOW, borderColor: `${ACCENT}33` }}><Icon size={24} weight="duotone" style={{ color: ACCENT }} /></div><span className="text-xs font-mono text-slate-600">{String(i + 1).padStart(2, "0")}</span></div><h3 className="text-lg font-bold text-white mb-2">{svc.name}</h3><p className="text-sm text-slate-400 leading-relaxed">{svc.description || ""}</p>{svc.price && <p className="text-sm font-semibold mt-3" style={{ color: ACCENT }}>{svc.price}</p>}</div>
              </div>
            ); })}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #0d1218 50%, ${BG} 100%)` }} />
        <div className="max-w-6xl mx-auto px-6 relative z-10"><div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="relative"><div className="rounded-2xl overflow-hidden border border-white/10"><img src={aboutImage} alt={`${data.businessName} team`} className="w-full h-[400px] object-cover" /></div><div className="absolute -bottom-4 -right-4 md:bottom-6 md:-right-6"><div className="px-5 py-3 rounded-xl backdrop-blur-md border text-black font-bold text-sm shadow-lg" style={{ background: `${ACCENT}e6`, borderColor: `${ACCENT}80` }}>{data.stats[0] ? `${data.stats[0].value} ${data.stats[0].label}` : "Trusted Care"}</div></div></div>
          <div><span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: ACCENT, borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}>About Us</span><h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6 text-white">We Love What We Do</h2><p className="text-slate-400 leading-relaxed mb-8">{data.about}</p>
            <div className="grid grid-cols-2 gap-4">{[{ icon: ShieldCheck, label: "Certified Staff" }, { icon: Heart, label: "Pet-First Approach" }, { icon: Star, label: "5-Star Rated" }, { icon: CheckCircle, label: "Fully Insured" }].map((b) => <GlassCard key={b.label} className="p-4 flex items-center gap-3"><div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: ACCENT_GLOW }}><b.icon size={20} weight="duotone" style={{ color: ACCENT }} /></div><span className="text-sm font-semibold text-white">{b.label}</span></GlassCard>)}</div>
          </div>
        </div></div>
      </section>

      {/* GALLERY */}
      <section id="gallery" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #0c1218 50%, ${BG} 100%)` }} />
        <PawPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <AnimatedSection>          <SectionHeader badge="Gallery" title="Our Happy Clients" accent={ACCENT} /></AnimatedSection>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">{galleryImages.map((src, i) => <div key={i} className="group relative rounded-2xl overflow-hidden border border-white/[0.06]"><img src={src} alt={`Happy pet ${i + 1}`} className="w-full h-48 md:h-56 object-cover transition-transform duration-700 group-hover:scale-105" /><div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" /></div>)}</div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #0d1218 50%, ${BG} 100%)` }} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <AnimatedSection>          <SectionHeader badge="Testimonials" title="Pet Parent Love" accent={ACCENT} /></AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">{testimonials.map((t, i) => <GlassCard key={i} className="p-6 h-full flex flex-col"><div className="flex gap-0.5 mb-4">{Array.from({ length: t.rating || 5 }).map((_, j) => <Star key={j} size={16} weight="fill" style={{ color: ACCENT }} />)}</div><p className="text-slate-300 leading-relaxed flex-1 text-sm mb-4">&ldquo;{t.text}&rdquo;</p><div className="pt-4 border-t border-white/5"><span className="text-sm font-semibold text-white">{t.name}</span></div></GlassCard>)}</div>
        </div>
      </section>

      {/* FAQ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #0c1218 50%, ${BG} 100%)` }} />
        <PawPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <AnimatedSection>          <SectionHeader badge="FAQ" title="Common Questions" accent={ACCENT} /></AnimatedSection>
          <div className="space-y-3">{faqs.map((faq, i) => <AccordionItem key={i} question={faq.q} answer={faq.a} isOpen={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} />)}</div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-20 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT}cc)` }} />
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <PawPrint size={48} weight="fill" className="mx-auto mb-6 text-black/60" />
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-black mb-4">New Client Special!</h2>
          <p className="text-lg text-black/70 mb-8 max-w-xl mx-auto">First-time visitors get a complimentary assessment. Your pet&apos;s happiness starts here.</p>
          <PhoneLink phone={data.phone} className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-black text-white font-bold text-lg hover:bg-black/80 transition-colors"><Phone size={20} weight="fill" /> {data.phone}</PhoneLink>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #0d1218 50%, ${BG} 100%)` }} />
        <PawPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10"><div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div><span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: ACCENT, borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}>Contact Us</span><h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6 text-white">Book Your Pet&apos;s Visit</h2><p className="text-slate-400 leading-relaxed mb-8">Contact {data.businessName} to schedule your pet&apos;s next visit.</p>
            <div className="space-y-5">
              <div className="flex items-start gap-4"><div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: ACCENT_GLOW }}><MapPin size={20} weight="duotone" style={{ color: ACCENT }} /></div><div><p className="text-sm font-semibold text-white">Address</p><MapLink address={data.address} className="text-sm text-slate-400" /></div></div>
              <div className="flex items-start gap-4"><div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: ACCENT_GLOW }}><Phone size={20} weight="duotone" style={{ color: ACCENT }} /></div><div><p className="text-sm font-semibold text-white">Phone</p><PhoneLink phone={data.phone} className="text-sm text-slate-400" /></div></div>
              {data.hours && <div className="flex items-start gap-4"><div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: ACCENT_GLOW }}><Clock size={20} weight="duotone" style={{ color: ACCENT }} /></div><div><p className="text-sm font-semibold text-white">Hours</p><p className="text-sm text-slate-400 whitespace-pre-line">{data.hours}</p></div></div>}
            </div>
          </div>
          <GlassCard className="p-8"><h3 className="text-xl font-semibold text-white mb-6">Book an Appointment</h3><form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><div><label className="block text-sm text-slate-400 mb-1.5">Your Name</label><input type="text" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none text-sm" placeholder="Your name" /></div><div><label className="block text-sm text-slate-400 mb-1.5">Pet&apos;s Name</label><input type="text" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none text-sm" placeholder="Pet's name" /></div></div>
            <div><label className="block text-sm text-slate-400 mb-1.5">Phone</label><input type="tel" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none text-sm" placeholder="(555) 123-4567" /></div>
            <div><label className="block text-sm text-slate-400 mb-1.5">Service</label><select className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none text-sm"><option value="" className="bg-neutral-900">Select a service</option>{data.services.map((s) => <option key={s.name} value={s.name.toLowerCase()} className="bg-neutral-900">{s.name}</option>)}</select></div>
            <MagneticButton className="w-full py-4 rounded-xl text-base font-semibold text-black flex items-center justify-center gap-2 cursor-pointer" style={{ background: ACCENT } as React.CSSProperties}>Book Now <ArrowRight size={18} weight="bold" /></MagneticButton>
          </form></GlassCard>
        </div></div>
      </section>

      {/* GUARANTEE */}
      <section className="relative z-10 py-16 overflow-hidden"><div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #0c1218 100%)` }} /><div className="max-w-4xl mx-auto px-6 relative z-10 text-center"><ShimmerBorder accent={ACCENT}><div className="p-8 md:p-12"><Heart size={48} weight="fill" style={{ color: ACCENT }} className="mx-auto mb-4" /><h2 className="text-2xl md:text-4xl font-extrabold text-white mb-4">Our Happy Pet Guarantee</h2><p className="text-slate-400 leading-relaxed max-w-2xl mx-auto text-lg">{data.businessName} guarantees a safe, fun, and loving experience for every pet.</p><div className="flex flex-wrap justify-center gap-4 mt-8">{["Certified Staff", "Pet First Aid", "Photo Updates", "Satisfaction Guaranteed"].map((item) => <span key={item} className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border" style={{ color: ACCENT, borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}><CheckCircle size={16} weight="fill" /> {item}</span>)}</div></div></ShimmerBorder></div></section>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-white/5 py-10 overflow-hidden"><div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #060a0f 100%)` }} /><div className="mx-auto max-w-6xl px-6 relative z-10"><div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8"><div><div className="flex items-center gap-2 mb-3"><PawPrint size={22} weight="fill" style={{ color: ACCENT }} /><span className="text-lg font-bold text-white">{data.businessName}</span></div><p className="text-sm text-slate-500 leading-relaxed">{data.about.length > 120 ? data.about.slice(0, 120).trim() + "..." : data.about}</p></div><div><h4 className="text-sm font-semibold text-white mb-3">Quick Links</h4><div className="space-y-2">{["Services", "Gallery", "About", "Contact"].map((l) => <a key={l} href={`#${l.toLowerCase()}`} className="block text-sm text-slate-500 hover:text-white transition-colors">{l}</a>)}</div></div><div><h4 className="text-sm font-semibold text-white mb-3">Contact</h4><div className="space-y-2 text-sm text-slate-500"><p><PhoneLink phone={data.phone} /></p><p><MapLink address={data.address} /></p>{data.socialLinks && Object.entries(data.socialLinks).map(([p, url]) => <a key={p} href={url} target="_blank" rel="noopener noreferrer" className="block hover:text-white transition-colors capitalize">{p}</a>)}</div></div></div><div className="border-t border-white/5 pt-6 flex flex-col md:flex-row items-center justify-between gap-4"><div className="flex items-center gap-2 text-sm text-slate-500"><PawPrint size={14} weight="fill" style={{ color: ACCENT }} /><span>{data.businessName} &copy; {new Date().getFullYear()}</span></div><div className="flex items-center gap-2 text-xs text-slate-600"><span>Created by <a href="https://bluejayportfolio.com" target="_blank" rel="noopener noreferrer" style={{textDecoration:"underline"}}>bluejayportfolio.com</a></span></div></div></div></footer>

      <ClaimBanner businessName={data.businessName} accentColor={ACCENT} prospectId={data.id} />
      <div className="h-14 md:h-28" />
    </main>
  );
}
