"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  AnimatePresence,
} from "framer-motion";
import {
  Key,
  Lock,
  LockOpen,
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
  HouseLine,
  Buildings,
  Car,
  Warning,
  Lightning,
} from "@phosphor-icons/react";
import type { GeneratedSiteData } from "@/lib/generator";
import BluejayLogo from "../BluejayLogo";
import { MapLink, PhoneLink } from "@/components/templates/MapLink";

const spring = { type: "spring" as const, stiffness: 100, damping: 20 };
const springFast = { type: "spring" as const, stiffness: 200, damping: 25 };

const BG = "#f8fafc";
const BG_ALT = "#f1f5f9";
const DEFAULT_ACCENT = "#1e40af";
const TEXT_PRIMARY = "#0f172a";
const TEXT_SECONDARY = "#475569";
const TEXT_MUTED = "#94a3b8";
const CARD_BORDER = "#e2e8f0";

function getAccent(c?: string) {
  const a = c || DEFAULT_ACCENT;
  return { ACCENT: a, ACCENT_GLOW: `${a}15` };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ICON_MAP: Record<string, any> = {
  lock: Lock, rekey: Key, key: Key, deadbolt: Lock, smart: Lightning,
  car: Car, auto: Car, vehicle: Car, emergency: Warning, commercial: Buildings,
  residential: HouseLine, safe: ShieldCheck, master: Key, access: LockOpen,
};
function getServiceIcon(n: string) {
  const l = n.toLowerCase();
  for (const [k, I] of Object.entries(ICON_MAP)) { if (l.includes(k)) return I; }
  return Key;
}

const STOCK_HERO = "https://images.unsplash.com/photo-1558002038-1055907df827?w=1400&q=80";
const STOCK_ABOUT = "https://images.unsplash.com/photo-1621274403997-37aace184f49?w=600&q=80";
const STOCK_GALLERY = [
  "https://images.unsplash.com/photo-1595079676339-1534801ad6cf?w=600&q=80",
  "https://images.unsplash.com/photo-1585153298856-89e0e1502d12?w=600&q=80",
  "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&q=80",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80",
];

function FloatingParticles({ accent }: { accent: string }) {
  const ps = Array.from({ length: 14 }, (_, i) => ({
    id: i, x: Math.random() * 100, delay: Math.random() * 8,
    dur: 8 + Math.random() * 8, size: 3 + Math.random() * 4, op: 0.06 + Math.random() * 0.1,
  }));
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden hidden md:block">
      {ps.map((p) => (
        <motion.div key={p.id} className="absolute rounded-full"
          style={{ left: `${p.x}%`, width: p.size, height: p.size, background: accent, willChange: "transform, opacity" }}
          animate={{ y: ["-10vh", "110vh"], opacity: [0, p.op, p.op, 0] }}
          transition={{ y: { duration: p.dur, repeat: Infinity, delay: p.delay, ease: "linear" }, opacity: { duration: p.dur, repeat: Infinity, delay: p.delay, times: [0, 0.1, 0.9, 1] } }}
        />
      ))}
    </div>
  );
}

function KeyPattern({ opacity = 0.04, accent }: { opacity?: number; accent: string }) {
  const pid = `keyPatV2-${accent.replace("#", "")}`;
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }}>
      <defs>
        <pattern id={pid} width="60" height="60" patternUnits="userSpaceOnUse">
          <circle cx="30" cy="15" r="6" fill="none" stroke={accent} strokeWidth="0.5" />
          <line x1="30" y1="21" x2="30" y2="50" stroke={accent} strokeWidth="0.5" />
          <line x1="30" y1="35" x2="38" y2="35" stroke={accent} strokeWidth="0.5" />
          <line x1="30" y1="43" x2="36" y2="43" stroke={accent} strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${pid})`} />
    </svg>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl border bg-white shadow-sm ${className}`} style={{ borderColor: CARD_BORDER }}>{children}</div>;
}

function MagneticButton({ children, className = "", onClick, style, href }: {
  children: React.ReactNode; className?: string; onClick?: () => void; style?: React.CSSProperties; href?: string;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0); const y = useMotionValue(0);
  const sx = useSpring(x, springFast); const sy = useSpring(y, springFast);
  const isTD = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
  const mm = useCallback((e: React.MouseEvent) => {
    if (!ref.current || isTD) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * 0.25);
    y.set((e.clientY - (r.top + r.height / 2)) * 0.25);
  }, [x, y, isTD]);
  const ml = useCallback(() => { x.set(0); y.set(0); }, [x, y]);
  if (href) return <motion.a href={href} ref={ref as unknown as React.Ref<HTMLAnchorElement>} style={{ x: sx, y: sy, willChange: "transform", ...style }} onMouseMove={mm as unknown as React.MouseEventHandler<HTMLAnchorElement>} onMouseLeave={ml} className={className} whileTap={{ scale: 0.97 }}>{children}</motion.a>;
  return <motion.button ref={ref} style={{ x: sx, y: sy, willChange: "transform", ...style }} onMouseMove={mm} onMouseLeave={ml} onClick={onClick} className={className} whileTap={{ scale: 0.97 }}>{children}</motion.button>;
}

function ShimmerBorder({ children, className = "", accent }: { children: React.ReactNode; className?: string; accent: string }) {
  return (
    <div className={`relative rounded-2xl p-[1px] overflow-hidden ${className}`}>
      <motion.div className="absolute inset-0 rounded-2xl" style={{ background: `conic-gradient(from 0deg, transparent, ${accent}, transparent, #93c5fd, transparent)`, willChange: "transform" }} animate={{ rotate: [0, 360] }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} />
      <div className="relative rounded-2xl bg-white z-10">{children}</div>
    </div>
  );
}

function AccordionItem({ question, answer, isOpen, onToggle }: { question: string; answer: string; isOpen: boolean; onToggle: () => void }) {
  return (
    <Card className="overflow-hidden">
      <button onClick={onToggle} className="w-full flex items-center justify-between p-5 md:p-6 text-left group cursor-pointer">
        <span className="text-lg font-semibold pr-4" style={{ color: TEXT_PRIMARY }}>{question}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={spring}><CaretDown size={20} className="shrink-0" style={{ color: TEXT_MUTED }} /></motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={spring} className="overflow-hidden">
            <p className="px-5 pb-5 md:px-6 md:pb-6 leading-relaxed" style={{ color: TEXT_SECONDARY }}>{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

function SectionHeader({ badge, title, subtitle, accent }: { badge: string; title: string; subtitle?: string; accent: string }) {
  return (
    <div className="text-center mb-16">
      <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: accent, borderColor: `${accent}33`, background: `${accent}0d` }}>{badge}</span>
      <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight" style={{ color: TEXT_PRIMARY }}>{title}</h2>
      <div className="h-0.5 w-16 mx-auto mt-4" style={{ background: `linear-gradient(to right, ${accent}, transparent)` }} />
      {subtitle && <p className="mt-4 max-w-2xl text-lg leading-relaxed mx-auto" style={{ color: TEXT_SECONDARY }}>{subtitle}</p>}
    </div>
  );
}

function ClaimBanner({ businessName, accentColor, prospectId }: { businessName: string; accentColor: string; prospectId: string }) {
  const [timeLeft, setTimeLeft] = useState("");
  useEffect(() => {
    const exp = new Date(); exp.setDate(exp.getDate() + 7);
    const tick = () => { const d = exp.getTime() - Date.now(); if (d <= 0) { setTimeLeft("EXPIRED"); return; } setTimeLeft(`${Math.floor(d / 86400000)}d ${Math.floor((d % 86400000) / 3600000)}h ${Math.floor((d % 3600000) / 60000)}m`); };
    tick(); const i = setInterval(tick, 60000); return () => clearInterval(i);
  }, []);
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="bg-white/90 backdrop-blur-sm border-t px-4 py-2 flex items-center justify-center gap-4" style={{ borderColor: CARD_BORDER }}>
        <p className="text-xs" style={{ color: TEXT_MUTED }}><span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1.5 animate-pulse" />47 businesses in your area upgraded their website this month</p>
        {timeLeft && timeLeft !== "EXPIRED" && <p className="text-xs font-bold" style={{ color: accentColor }}>Preview expires in {timeLeft}</p>}
      </div>
      <div className="px-6 py-4 flex items-center justify-between gap-4" style={{ background: `linear-gradient(135deg, ${accentColor}15, ${accentColor}08)`, borderTop: `1px solid ${accentColor}30` }}>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate" style={{ color: TEXT_PRIMARY }}>This website was built for {businessName}</p>
          <p className="text-xs" style={{ color: TEXT_MUTED }}>Claim it before we offer it to a competitor</p>
        </div>
        <a href={`/claim/${prospectId}`} className="shrink-0 h-11 px-6 rounded-full text-white text-sm font-bold flex items-center gap-2 hover:shadow-lg transition-all duration-300" style={{ background: accentColor }}>Claim Your Website <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg></a>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
export default function V2LocksmithPreview({ data }: { data: GeneratedSiteData }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const { ACCENT, ACCENT_GLOW } = getAccent(data.accentColor);
  const heroImage = data.photos?.[0] || STOCK_HERO;
  const aboutImage = data.photos?.[1] || STOCK_ABOUT;
  const galleryImages = data.photos?.length > 2 ? data.photos.slice(2, 6) : STOCK_GALLERY;
  const phoneDigits = data.phone.replace(/\D/g, "");

  const processSteps = [
    { step: "01", title: "Call Us 24/7", desc: `Locked out or need security help? Call ${data.businessName} anytime — we answer around the clock.` },
    { step: "02", title: "Fast Response", desc: "A licensed locksmith is dispatched immediately. We arrive in 15-30 minutes in most service areas." },
    { step: "03", title: "Expert Service", desc: "We diagnose the issue and provide upfront pricing before any work begins. No surprises." },
    { step: "04", title: "Secured & Done", desc: "Your locks are installed, repaired, or rekeyed. We test everything and ensure your complete satisfaction." },
  ];

  const faqs = [
    { q: `What locksmith services does ${data.businessName} provide?`, a: `We offer ${data.services.slice(0, 3).map(s => s.name).join(", ")}, and more. From emergency lockouts to complete security system installations, we handle it all.` },
    { q: "How fast can you respond to a lockout?", a: `${data.businessName} provides rapid response, typically arriving within 15-30 minutes. We operate 24/7 including holidays for emergency lockout situations.` },
    { q: "Can you rekey locks instead of replacing them?", a: "Absolutely! Rekeying is a cost-effective way to change who has access without replacing the entire lock. We can rekey most residential and commercial locks on the spot." },
    { q: "Do you install smart locks?", a: `Yes! ${data.businessName} installs and services all major smart lock brands. We can help you choose the right smart lock for your home or business and integrate it with your existing security.` },
  ];

  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden" style={{ background: BG, color: TEXT_PRIMARY }}>
      <FloatingParticles accent={ACCENT} />

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-4">
          <div className="flex items-center justify-between px-4 md:px-6 py-3 rounded-2xl bg-white/80 backdrop-blur-lg border shadow-sm" style={{ borderColor: CARD_BORDER }}>
            <div className="flex items-center gap-2">
              <Key size={24} weight="fill" style={{ color: ACCENT }} />
              <span className="text-lg font-bold tracking-tight" style={{ color: TEXT_PRIMARY }}>{data.businessName}</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm" style={{ color: TEXT_SECONDARY }}>
              <a href="#services" className="hover:text-blue-700 transition-colors">Services</a>
              <a href="#about" className="hover:text-blue-700 transition-colors">About</a>
              <a href="#projects" className="hover:text-blue-700 transition-colors">Gallery</a>
              <a href="#contact" className="hover:text-blue-700 transition-colors">Contact</a>
            </div>
            <div className="flex items-center gap-3">
              <MagneticButton className="px-4 md:px-5 py-2 rounded-full text-sm font-semibold text-white cursor-pointer" style={{ background: ACCENT } as React.CSSProperties}>Call Now</MagneticButton>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors" style={{ color: TEXT_PRIMARY }}>{mobileMenuOpen ? <X size={24} /> : <List size={24} />}</button>
            </div>
          </div>
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="md:hidden mt-2 overflow-hidden">
                <div className="flex flex-col gap-1 px-4 py-4 rounded-2xl bg-white border shadow-sm" style={{ borderColor: CARD_BORDER }}>
                  {["Services", "About", "Gallery", "Contact"].map((l) => (
                    <a key={l} href={`#${l.toLowerCase()}`} onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-lg text-sm hover:bg-slate-50 transition-colors" style={{ color: TEXT_SECONDARY }}>{l}</a>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative min-h-[100dvh] flex items-center pt-24 z-10 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, #eff6ff 0%, ${BG} 50%, #f1f5f9 100%)` }} />
        <KeyPattern opacity={0.03} accent={ACCENT} />
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full blur-[200px] pointer-events-none" style={{ background: `${ACCENT}08` }} />
        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          <div className="space-y-8">
            <div>
              <p className="text-sm uppercase tracking-widest mb-4 font-semibold" style={{ color: ACCENT }}>24/7 Emergency Locksmith</p>
              <h1 className="text-3xl md:text-6xl tracking-tighter leading-none font-bold" style={{ color: TEXT_PRIMARY }}>{data.tagline}</h1>
            </div>
            <p className="text-lg max-w-md leading-relaxed" style={{ color: TEXT_SECONDARY }}>{data.about.length > 160 ? data.about.slice(0, 160).trim() + "..." : data.about}</p>
            <div className="flex flex-wrap gap-4">
              <MagneticButton href={`tel:${phoneDigits}`} className="px-8 py-4 rounded-full text-base font-semibold text-white flex items-center gap-2 cursor-pointer shadow-lg" style={{ background: ACCENT } as React.CSSProperties}><Phone size={18} weight="bold" /> Call Now 24/7</MagneticButton>
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold border flex items-center gap-2 cursor-pointer" style={{ borderColor: CARD_BORDER, color: TEXT_PRIMARY }}>Get a Quote <ArrowRight size={18} weight="bold" /></MagneticButton>
            </div>
            <div className="flex flex-wrap gap-6 text-sm" style={{ color: TEXT_SECONDARY }}>
              <span className="flex items-center gap-2"><MapPin size={16} weight="duotone" style={{ color: ACCENT }} /> <MapLink address={data.address} /></span>
              <span className="flex items-center gap-2"><Lightning size={16} weight="duotone" style={{ color: ACCENT }} /> 15-30 Min Response</span>
            </div>
          </div>
          <div className="hidden md:block relative">
            <div className="relative rounded-2xl overflow-hidden border shadow-xl" style={{ borderColor: CARD_BORDER }}>
              <img src={heroImage} alt={`${data.businessName} locksmith`} className="w-full h-[500px] object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6">
                <div className="px-4 py-2 rounded-full backdrop-blur-md bg-white/90 border flex items-center gap-2 shadow-sm" style={{ borderColor: CARD_BORDER }}>
                  <ShieldCheck size={18} weight="fill" style={{ color: ACCENT }} />
                  <span className="text-sm font-semibold" style={{ color: TEXT_PRIMARY }}>Licensed &amp; Bonded</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="relative z-10 py-16 overflow-hidden border-y" style={{ borderColor: CARD_BORDER, background: "#ffffff" }}>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {data.stats.map((stat, i) => {
              const icons = [Key, Lock, Star, ShieldCheck];
              const Icon = icons[i % icons.length];
              return (
                <div key={stat.label} className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Icon size={22} weight="fill" style={{ color: ACCENT }} />
                    <span className="text-3xl md:text-4xl font-extrabold" style={{ color: TEXT_PRIMARY }}>{stat.value}</span>
                  </div>
                  <span className="text-sm font-medium tracking-wide uppercase" style={{ color: TEXT_MUTED }}>{stat.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="relative z-10 py-24 md:py-32 overflow-hidden" style={{ background: BG }}>
        <KeyPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Our Services" title="Locksmith Solutions" subtitle={`${data.businessName} provides fast, reliable locksmith services for homes, businesses, and vehicles.`} accent={ACCENT} />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.services.map((svc, i) => {
              const Icon = getServiceIcon(svc.name);
              return (
                <Card key={svc.name} className="group p-7 hover:shadow-md transition-all duration-500">
                  <div className="flex items-start justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center border" style={{ background: ACCENT_GLOW, borderColor: `${ACCENT}33` }}>
                      <Icon size={24} weight="duotone" style={{ color: ACCENT }} />
                    </div>
                    <span className="text-xs font-mono" style={{ color: TEXT_MUTED }}>{String(i + 1).padStart(2, "0")}</span>
                  </div>
                  <h3 className="text-lg font-bold mb-2" style={{ color: TEXT_PRIMARY }}>{svc.name}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: TEXT_SECONDARY }}>{svc.description || ""}</p>
                  {svc.price && <p className="text-sm font-semibold mt-3" style={{ color: ACCENT }}>{svc.price}</p>}
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="relative z-10 py-24 md:py-32 overflow-hidden" style={{ background: "#ffffff" }}>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="relative">
              <div className="rounded-2xl overflow-hidden border shadow-lg" style={{ borderColor: CARD_BORDER }}>
                <img src={aboutImage} alt={`${data.businessName} team`} className="w-full h-[400px] object-cover" />
              </div>
              <div className="absolute -bottom-4 -right-4 md:bottom-6 md:-right-6">
                <div className="px-5 py-3 rounded-xl text-white font-bold text-sm shadow-lg" style={{ background: ACCENT }}>
                  {data.stats[0] ? `${data.stats[0].value} ${data.stats[0].label}` : "24/7 Service"}
                </div>
              </div>
            </div>
            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: ACCENT, borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}>About Us</span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6" style={{ color: TEXT_PRIMARY }}>Your Trusted Security Experts</h2>
              <p className="leading-relaxed mb-8" style={{ color: TEXT_SECONDARY }}>{data.about}</p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: ShieldCheck, label: "Licensed & Bonded" },
                  { icon: Lightning, label: "Fast Response" },
                  { icon: Star, label: "5-Star Rated" },
                  { icon: Clock, label: "24/7 Available" },
                ].map((b) => (
                  <Card key={b.label} className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: ACCENT_GLOW }}>
                      <b.icon size={20} weight="duotone" style={{ color: ACCENT }} />
                    </div>
                    <span className="text-sm font-semibold" style={{ color: TEXT_PRIMARY }}>{b.label}</span>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden" style={{ background: BG_ALT }}>
        <KeyPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Our Process" title="How It Works" accent={ACCENT} />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {processSteps.map((s, i) => (
              <div key={s.step} className="relative">
                {i < processSteps.length - 1 && <div className="hidden lg:block absolute top-10 left-[calc(50%+40px)] w-[calc(100%-80px)] h-px" style={{ background: `linear-gradient(to right, ${ACCENT}33, ${ACCENT}11)` }} />}
                <Card className="p-6 text-center">
                  <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-black" style={{ background: `${ACCENT}10`, color: ACCENT, border: `2px solid ${ACCENT}33` }}>{s.step}</div>
                  <h3 className="text-lg font-bold mb-2" style={{ color: TEXT_PRIMARY }}>{s.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: TEXT_SECONDARY }}>{s.desc}</p>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GALLERY */}
      <section id="projects" className="relative z-10 py-24 md:py-32 overflow-hidden" style={{ background: "#ffffff" }}>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Our Work" title="Recent Projects" accent={ACCENT} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {galleryImages.map((src, i) => {
              const titles = ["Residential Rekey", "Commercial Lock Install", "Smart Lock Upgrade", "Emergency Lockout"];
              return (
                <div key={i} className="group relative rounded-2xl overflow-hidden border shadow-sm hover:shadow-lg transition-all duration-500" style={{ borderColor: CARD_BORDER }}>
                  <img src={src} alt={titles[i]} className="w-full h-64 object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6"><h3 className="text-lg font-bold text-white">{titles[i]}</h3></div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden" style={{ background: BG }}>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Reviews" title="What Our Customers Say" accent={ACCENT} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {data.testimonials.map((t, i) => (
              <Card key={i} className="p-6 h-full flex flex-col">
                <div className="flex gap-0.5 mb-4">{Array.from({ length: t.rating || 5 }).map((_, j) => <Star key={j} size={16} weight="fill" style={{ color: "#f59e0b" }} />)}</div>
                <p className="leading-relaxed flex-1 text-sm mb-4" style={{ color: TEXT_SECONDARY }}>&ldquo;{t.text}&rdquo;</p>
                <div className="pt-4 border-t" style={{ borderColor: CARD_BORDER }}><span className="text-sm font-semibold" style={{ color: TEXT_PRIMARY }}>{t.name}</span></div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-20 overflow-hidden" style={{ background: ACCENT }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='40' height='40' fill='none'/%3E%3Cpath d='M0 0L40 40M40 0L0 40' stroke='%23fff' stroke-width='0.5'/%3E%3C/svg%3E\")" }} />
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <Warning size={48} weight="fill" className="mx-auto mb-6 text-white/80" />
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-4">Locked Out? Call Now</h2>
          <p className="text-lg text-white/90 mb-8 max-w-xl mx-auto">Our emergency locksmiths respond fast, 24 hours a day, 7 days a week. We&apos;ll get you back in safely.</p>
          <PhoneLink phone={data.phone} className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-white font-bold text-lg hover:bg-white/90 transition-colors" style={{ color: ACCENT }}>
            <span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" /><span className="relative inline-flex rounded-full h-3 w-3 bg-red-600" /></span> {data.phone}
          </PhoneLink>
        </div>
      </section>

      {/* SERVICE AREAS */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden" style={{ background: BG }}>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Service Area" title="Areas We Serve" accent={ACCENT} />
          <div className="text-center">
            <Card className="p-8 inline-block">
              <div className="flex items-center gap-3 text-lg">
                <MapPin size={24} weight="duotone" style={{ color: ACCENT }} />
                <MapLink address={data.address} className="font-semibold" style={{ color: TEXT_PRIMARY }} />
              </div>
              <p className="text-sm mt-2" style={{ color: TEXT_MUTED }}>&amp; Surrounding Areas</p>
            </Card>
          </div>
        </div>
      </section>

      {/* HOURS */}
      {data.hours && (
        <section className="relative z-10 py-24 md:py-32 overflow-hidden" style={{ background: "#ffffff" }}>
          <div className="max-w-3xl mx-auto px-6 relative z-10">
            <SectionHeader badge="Hours" title="When We&apos;re Available" accent={ACCENT} />
            <div className="text-center">
              <ShimmerBorder accent={ACCENT}>
                <div className="p-8">
                  <Clock size={32} weight="duotone" style={{ color: ACCENT }} className="mx-auto mb-4" />
                  <p className="leading-relaxed whitespace-pre-line text-lg" style={{ color: TEXT_SECONDARY }}>{data.hours}</p>
                  <p className="mt-4 text-sm font-semibold" style={{ color: ACCENT }}>Emergency lockout service available 24/7</p>
                </div>
              </ShimmerBorder>
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden" style={{ background: BG_ALT }}>
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <SectionHeader badge="FAQ" title="Common Questions" accent={ACCENT} />
          <div className="space-y-3">
            {faqs.map((f, i) => <AccordionItem key={i} question={f.q} answer={f.a} isOpen={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} />)}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="relative z-10 py-24 md:py-32 overflow-hidden" style={{ background: "#ffffff" }}>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: ACCENT, borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}>Contact Us</span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6" style={{ color: TEXT_PRIMARY }}>Need a Locksmith?</h2>
              <p className="leading-relaxed mb-8" style={{ color: TEXT_SECONDARY }}>Contact {data.businessName} for fast, professional locksmith service. Available 24/7 for emergencies.</p>
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: ACCENT_GLOW }}><MapPin size={20} weight="duotone" style={{ color: ACCENT }} /></div>
                  <div><p className="text-sm font-semibold" style={{ color: TEXT_PRIMARY }}>Address</p><MapLink address={data.address} className="text-sm" style={{ color: TEXT_SECONDARY }} /></div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: ACCENT_GLOW }}><Phone size={20} weight="duotone" style={{ color: ACCENT }} /></div>
                  <div><p className="text-sm font-semibold" style={{ color: TEXT_PRIMARY }}>Phone</p><PhoneLink phone={data.phone} className="text-sm" style={{ color: TEXT_SECONDARY }} /></div>
                </div>
                {data.hours && (
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: ACCENT_GLOW }}><Clock size={20} weight="duotone" style={{ color: ACCENT }} /></div>
                    <div><p className="text-sm font-semibold" style={{ color: TEXT_PRIMARY }}>Hours</p><p className="text-sm whitespace-pre-line" style={{ color: TEXT_SECONDARY }}>{data.hours}</p></div>
                  </div>
                )}
              </div>
            </div>
            <Card className="p-8">
              <h3 className="text-xl font-semibold mb-6" style={{ color: TEXT_PRIMARY }}>Request Service</h3>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className="block text-sm mb-1.5" style={{ color: TEXT_SECONDARY }}>First Name</label><input type="text" className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2" style={{ borderColor: CARD_BORDER, color: TEXT_PRIMARY }} placeholder="John" /></div>
                  <div><label className="block text-sm mb-1.5" style={{ color: TEXT_SECONDARY }}>Last Name</label><input type="text" className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2" style={{ borderColor: CARD_BORDER, color: TEXT_PRIMARY }} placeholder="Doe" /></div>
                </div>
                <div><label className="block text-sm mb-1.5" style={{ color: TEXT_SECONDARY }}>Phone</label><input type="tel" className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2" style={{ borderColor: CARD_BORDER, color: TEXT_PRIMARY }} placeholder="(555) 123-4567" /></div>
                <div><label className="block text-sm mb-1.5" style={{ color: TEXT_SECONDARY }}>Service Needed</label>
                  <select className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2" style={{ borderColor: CARD_BORDER, color: TEXT_PRIMARY }}>
                    <option value="">Select a service</option>
                    {data.services.map((s) => <option key={s.name} value={s.name.toLowerCase().replace(/\s+/g, "-")}>{s.name}</option>)}
                  </select>
                </div>
                <div><label className="block text-sm mb-1.5" style={{ color: TEXT_SECONDARY }}>Details</label><textarea rows={4} className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 resize-none" style={{ borderColor: CARD_BORDER, color: TEXT_PRIMARY }} placeholder="Describe your lock or security needs..." /></div>
                <MagneticButton className="w-full py-4 rounded-xl text-base font-semibold text-white flex items-center justify-center gap-2 cursor-pointer" style={{ background: ACCENT } as React.CSSProperties}>Send Request <ArrowRight size={18} weight="bold" /></MagneticButton>
              </form>
            </Card>
          </div>
        </div>
      </section>

      {/* GUARANTEE */}
      <section className="relative z-10 py-16 overflow-hidden" style={{ background: BG }}>
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <ShimmerBorder accent={ACCENT}>
            <div className="p-8 md:p-12">
              <ShieldCheck size={48} weight="fill" style={{ color: ACCENT }} className="mx-auto mb-4" />
              <h2 className="text-2xl md:text-4xl font-extrabold mb-4" style={{ color: TEXT_PRIMARY }}>Our Security Guarantee</h2>
              <p className="leading-relaxed max-w-2xl mx-auto text-lg" style={{ color: TEXT_SECONDARY }}>{data.businessName} is fully licensed, bonded, and insured. We guarantee our workmanship and your complete satisfaction.</p>
              <div className="flex flex-wrap justify-center gap-4 mt-8">
                {["Licensed & Bonded", "Upfront Pricing", "24/7 Emergency", "Satisfaction Guaranteed"].map((item) => (
                  <span key={item} className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border" style={{ color: ACCENT, borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}><CheckCircle size={16} weight="fill" /> {item}</span>
                ))}
              </div>
            </div>
          </ShimmerBorder>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 border-t py-10 overflow-hidden" style={{ borderColor: CARD_BORDER, background: "#ffffff" }}>
        <div className="mx-auto max-w-6xl px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3"><Key size={22} weight="fill" style={{ color: ACCENT }} /><span className="text-lg font-bold" style={{ color: TEXT_PRIMARY }}>{data.businessName}</span></div>
              <p className="text-sm leading-relaxed" style={{ color: TEXT_MUTED }}>{data.about.length > 120 ? data.about.slice(0, 120).trim() + "..." : data.about}</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-3" style={{ color: TEXT_PRIMARY }}>Quick Links</h4>
              <div className="space-y-2">{["Services", "About", "Gallery", "Contact"].map((l) => <a key={l} href={`#${l.toLowerCase()}`} className="block text-sm hover:text-blue-700 transition-colors" style={{ color: TEXT_MUTED }}>{l}</a>)}</div>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-3" style={{ color: TEXT_PRIMARY }}>Contact</h4>
              <div className="space-y-2 text-sm" style={{ color: TEXT_MUTED }}>
                <p><PhoneLink phone={data.phone} /></p>
                <p><MapLink address={data.address} /></p>
                {data.socialLinks && Object.entries(data.socialLinks).map(([p, u]) => <a key={p} href={u} target="_blank" rel="noopener noreferrer" className="block hover:text-blue-700 transition-colors capitalize">{p}</a>)}
              </div>
            </div>
          </div>
          <div className="border-t pt-6 flex flex-col md:flex-row items-center justify-between gap-4" style={{ borderColor: CARD_BORDER }}>
            <div className="flex items-center gap-2 text-sm" style={{ color: TEXT_MUTED }}><Key size={14} weight="fill" style={{ color: ACCENT }} /><span>{data.businessName} &copy; {new Date().getFullYear()}</span></div>
            <div className="flex items-center gap-2 text-xs" style={{ color: TEXT_MUTED }}><BluejayLogo className="w-4 h-4" /><span>Website created by Bluejay Business Solutions</span></div>
          </div>
        </div>
      </footer>

      <ClaimBanner businessName={data.businessName} accentColor={ACCENT} prospectId={data.id} />
      <div className="h-28" />
    </main>
  );
}
