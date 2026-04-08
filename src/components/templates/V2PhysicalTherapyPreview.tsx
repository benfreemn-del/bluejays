"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import { Heart, FirstAid, Activity, Clock, Phone, MapPin, CaretDown, List, X, Star, ArrowRight, CheckCircle, ShieldCheck, UserCircle, Heartbeat } from "@phosphor-icons/react";
import type { GeneratedSiteData } from "@/lib/generator";
import BluejayLogo from "../BluejayLogo";
import { MapLink, PhoneLink } from "@/components/templates/MapLink";

const spring = { type: "spring" as const, stiffness: 100, damping: 20 };
const springFast = { type: "spring" as const, stiffness: 200, damping: 25 };
const BG = "#f8faff";
const BG_ALT = "#eef3fb";
const DEFAULT_ACCENT = "#2563eb";
const TEXT_PRIMARY = "#0f172a";
const TEXT_SECONDARY = "#475569";
const TEXT_MUTED = "#94a3b8";
const CARD_BORDER = "#dbeafe";

function getAccent(c?: string) { const a = c || DEFAULT_ACCENT; return { ACCENT: a, ACCENT_GLOW: `${a}15` }; }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ICON_MAP: Record<string, any> = { sport: Activity, ortho: FirstAid, spine: Heartbeat, back: Heartbeat, neck: Heartbeat, rehab: Heart, manual: UserCircle, balance: Activity, neuro: Heartbeat, post: FirstAid, pre: FirstAid, pain: Heart, aqua: Activity, dry: FirstAid };
function getServiceIcon(n: string) { const l = n.toLowerCase(); for (const [k, I] of Object.entries(ICON_MAP)) { if (l.includes(k)) return I; } return Heart; }

const STOCK_HERO = "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1400&q=80";
const STOCK_ABOUT = "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&q=80";
const STOCK_GALLERY = [
  "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&q=80",
  "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=600&q=80",
  "https://images.unsplash.com/photo-1540206395-68808572332f?w=600&q=80",
  "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&q=80",
];

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl border bg-white shadow-sm ${className}`} style={{ borderColor: CARD_BORDER }}>{children}</div>;
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

function ShimmerBorder({ children, accent }: { children: React.ReactNode; accent: string }) {
  return (
    <div className="relative rounded-2xl p-[1px] overflow-hidden">
      <motion.div className="absolute inset-0 rounded-2xl" style={{ background: `conic-gradient(from 0deg, transparent, ${accent}, transparent, #93c5fd, transparent)` }} animate={{ rotate: [0, 360] }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} />
      <div className="relative rounded-2xl bg-white z-10">{children}</div>
    </div>
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

function AccordionItem({ question, answer, isOpen, onToggle }: { question: string; answer: string; isOpen: boolean; onToggle: () => void }) {
  return (
    <Card className="overflow-hidden">
      <button onClick={onToggle} className="w-full flex items-center justify-between p-5 text-left cursor-pointer">
        <span className="text-base font-semibold pr-4" style={{ color: TEXT_PRIMARY }}>{question}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={spring}><CaretDown size={18} style={{ color: TEXT_MUTED }} /></motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={spring} className="overflow-hidden"><p className="px-5 pb-5 text-sm leading-relaxed" style={{ color: TEXT_SECONDARY }}>{answer}</p></motion.div>}
      </AnimatePresence>
    </Card>
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
        <p className="text-xs" style={{ color: TEXT_MUTED }}><span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-1.5 animate-pulse" />47 businesses in your area upgraded their website this month</p>
        {timeLeft && timeLeft !== "EXPIRED" && <p className="text-xs font-bold" style={{ color: accentColor }}>Preview expires in {timeLeft}</p>}
      </div>
      <div className="px-6 py-4 flex items-center justify-between gap-4" style={{ background: `linear-gradient(135deg, ${accentColor}15, ${accentColor}08)`, borderTop: `1px solid ${accentColor}30` }}>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate" style={{ color: TEXT_PRIMARY }}>This website was built for {businessName}</p>
          <p className="text-xs" style={{ color: TEXT_MUTED }}>Claim it before we offer it to a competitor</p>
        </div>
        <a href={`/claim/${prospectId}`} className="shrink-0 h-11 px-6 rounded-full text-white text-sm font-bold flex items-center gap-2 hover:shadow-lg transition-all" style={{ background: accentColor }}>Claim Your Website <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg></a>
      </div>
    </div>
  );
}

export default function V2PhysicalTherapyPreview({ data }: { data: GeneratedSiteData }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const { ACCENT, ACCENT_GLOW } = getAccent(data.accentColor);
  const heroImage = data.photos?.[0] || STOCK_HERO;
  const aboutImage = data.photos?.[1] || STOCK_ABOUT;
  const galleryImages = data.photos?.length > 2 ? data.photos.slice(2, 6) : STOCK_GALLERY;
  const phoneDigits = data.phone.replace(/\D/g, "");

  const processSteps = [
    { step: "01", title: "Initial Evaluation", desc: "A thorough assessment of your condition, medical history, and functional goals to create your personalized care plan." },
    { step: "02", title: "Custom Treatment Plan", desc: "We design a targeted program using evidence-based techniques tailored to your specific needs and recovery timeline." },
    { step: "03", title: "Hands-On Therapy", desc: "Our licensed therapists guide you through each session with manual therapy, therapeutic exercise, and modalities." },
    { step: "04", title: "Progress & Discharge", desc: "We track your progress, adjust your plan as needed, and prepare you for long-term independence and wellness." },
  ];

  const faqs = [
    { q: "Do I need a referral to start physical therapy?", a: `In most states, you can see a physical therapist directly without a physician referral. Contact ${data.businessName} and we will help verify your insurance benefits and get you scheduled quickly.` },
    { q: "How long does a typical PT session last?", a: "Most sessions are 45 to 60 minutes. Your first visit (evaluation) may take up to 90 minutes so we can thoroughly assess your condition and build your treatment plan." },
    { q: "How many sessions will I need?", a: "The number of sessions varies based on your diagnosis and goals. After your initial evaluation, your therapist will provide a recommended treatment frequency and estimated duration." },
    { q: "Does insurance cover physical therapy?", a: `${data.businessName} accepts most major insurance plans including Medicare. We recommend calling your insurance provider to verify your PT benefits before your first visit.` },
  ];

  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden" style={{ background: BG, color: TEXT_PRIMARY }}>
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between px-5 py-3 rounded-2xl bg-white/85 backdrop-blur-lg border shadow-sm" style={{ borderColor: CARD_BORDER }}>
            <div className="flex items-center gap-2"><Heart size={24} weight="fill" style={{ color: ACCENT }} /><span className="text-lg font-bold" style={{ color: TEXT_PRIMARY }}>{data.businessName}</span></div>
            <div className="hidden md:flex items-center gap-8 text-sm" style={{ color: TEXT_SECONDARY }}>
              {["Services", "About", "Gallery", "Contact"].map(l => <a key={l} href={`#${l.toLowerCase()}`} className="hover:text-blue-700 transition-colors">{l}</a>)}
            </div>
            <div className="flex items-center gap-3">
              <MagneticButton className="px-5 py-2 rounded-full text-sm font-semibold text-white cursor-pointer" style={{ background: ACCENT } as React.CSSProperties}>Book Appointment</MagneticButton>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-lg" style={{ color: TEXT_PRIMARY }}>{mobileMenuOpen ? <X size={22} /> : <List size={22} />}</button>
            </div>
          </div>
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="md:hidden mt-2 overflow-hidden">
                <div className="flex flex-col gap-1 px-4 py-4 rounded-2xl bg-white border shadow-sm" style={{ borderColor: CARD_BORDER }}>
                  {["Services", "About", "Gallery", "Contact"].map(l => <a key={l} href={`#${l.toLowerCase()}`} onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-lg text-sm hover:bg-slate-50" style={{ color: TEXT_SECONDARY }}>{l}</a>)}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      <section className="relative min-h-[100dvh] flex items-center pt-24 z-10 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #eff6ff 0%, #f8faff 50%, #eef3fb 100%)" }} />
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] rounded-full blur-[180px] pointer-events-none" style={{ background: `${ACCENT}08` }} />
        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div>
              <p className="text-sm uppercase tracking-widest mb-4 font-semibold" style={{ color: ACCENT }}>Licensed Physical Therapists</p>
              <h1 className="text-3xl md:text-6xl tracking-tighter leading-none font-bold" style={{ color: TEXT_PRIMARY }}>{data.tagline}</h1>
            </div>
            <p className="text-lg max-w-md leading-relaxed" style={{ color: TEXT_SECONDARY }}>{data.about.length > 160 ? data.about.slice(0, 160) + "..." : data.about}</p>
            <div className="flex flex-wrap gap-4">
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white flex items-center gap-2 cursor-pointer shadow-lg" style={{ background: ACCENT } as React.CSSProperties}>Schedule Evaluation <ArrowRight size={18} weight="bold" /></MagneticButton>
              <MagneticButton href={`tel:${phoneDigits}`} className="px-8 py-4 rounded-full text-base font-semibold border flex items-center gap-2 cursor-pointer" style={{ borderColor: CARD_BORDER, color: TEXT_PRIMARY }}><Phone size={18} weight="duotone" /> <PhoneLink phone={data.phone} /></MagneticButton>
            </div>
            <div className="flex flex-wrap gap-6 text-sm" style={{ color: TEXT_SECONDARY }}>
              <span className="flex items-center gap-2"><MapPin size={16} weight="duotone" style={{ color: ACCENT }} /><MapLink address={data.address} /></span>
              <span className="flex items-center gap-2"><ShieldCheck size={16} weight="duotone" style={{ color: ACCENT }} />Most Insurance Accepted</span>
            </div>
          </div>
          <div className="hidden md:block relative">
            <div className="rounded-2xl overflow-hidden border shadow-xl" style={{ borderColor: CARD_BORDER }}>
              <img src={heroImage} alt={data.businessName} className="w-full h-[500px] object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6">
                <div className="px-4 py-2 rounded-full backdrop-blur-md bg-white/90 border flex items-center gap-2 shadow-sm" style={{ borderColor: CARD_BORDER }}>
                  <Heart size={18} weight="fill" style={{ color: ACCENT }} />
                  <span className="text-sm font-semibold" style={{ color: TEXT_PRIMARY }}>Evidence-Based Care</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 py-16 border-y" style={{ borderColor: CARD_BORDER, background: "#ffffff" }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {data.stats.map((stat: { label: string; value: string }, i: number) => {
              const icons = [Heart, Activity, Star, ShieldCheck];
              const Icon = icons[i % icons.length];
              return (
                <div key={stat.label} className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2"><Icon size={22} weight="fill" style={{ color: ACCENT }} /><span className="text-3xl md:text-4xl font-extrabold" style={{ color: TEXT_PRIMARY }}>{stat.value}</span></div>
                  <span className="text-sm font-medium uppercase tracking-wide" style={{ color: TEXT_MUTED }}>{stat.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="services" className="relative z-10 py-24 md:py-32" style={{ background: BG }}>
        <div className="max-w-6xl mx-auto px-6">
          <SectionHeader badge="Our Specialties" title="Comprehensive PT Services" subtitle={`${data.businessName} offers evidence-based physical therapy for a wide range of conditions and injuries.`} accent={ACCENT} />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.services.map((svc: { name: string; description?: string; price?: string }, i: number) => {
              const Icon = getServiceIcon(svc.name);
              return (
                <Card key={svc.name} className="p-7 hover:shadow-md transition-all duration-300">
                  <div className="flex items-start justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center border" style={{ background: ACCENT_GLOW, borderColor: `${ACCENT}33` }}><Icon size={24} weight="duotone" style={{ color: ACCENT }} /></div>
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

      <section id="about" className="relative z-10 py-24 md:py-32" style={{ background: "#ffffff" }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="rounded-2xl overflow-hidden border shadow-lg" style={{ borderColor: CARD_BORDER }}>
                <img src={aboutImage} alt={`${data.businessName} clinic`} className="w-full h-[400px] object-cover" />
              </div>
              <div className="absolute -bottom-4 -right-4 md:bottom-6 md:-right-6">
                <div className="px-5 py-3 rounded-xl text-white font-bold text-sm shadow-lg" style={{ background: ACCENT }}>{data.stats[0] ? `${data.stats[0].value} ${data.stats[0].label}` : "Licensed Therapists"}</div>
              </div>
            </div>
            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: ACCENT, borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}>About Our Clinic</span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6" style={{ color: TEXT_PRIMARY }}>Your Recovery Is Our Priority</h2>
              <p className="leading-relaxed mb-8" style={{ color: TEXT_SECONDARY }}>{data.about}</p>
              <div className="grid grid-cols-2 gap-4">
                {[{ icon: ShieldCheck, label: "Licensed & Certified" }, { icon: Heart, label: "Patient-Centered Care" }, { icon: Star, label: "5-Star Reviews" }, { icon: Activity, label: "Evidence-Based" }].map(b => (
                  <Card key={b.label} className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: ACCENT_GLOW }}><b.icon size={20} weight="duotone" style={{ color: ACCENT }} /></div>
                    <span className="text-sm font-semibold" style={{ color: TEXT_PRIMARY }}>{b.label}</span>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 py-24 md:py-32" style={{ background: BG_ALT }}>
        <div className="max-w-6xl mx-auto px-6">
          <SectionHeader badge="Your Journey" title="How Treatment Works" accent={ACCENT} />
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

      <section id="gallery" className="relative z-10 py-24 md:py-32" style={{ background: "#ffffff" }}>
        <div className="max-w-6xl mx-auto px-6">
          <SectionHeader badge="Our Facility" title="State-of-the-Art Clinic" accent={ACCENT} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {galleryImages.map((src: string, i: number) => {
              const titles = ["Treatment Room", "Exercise Area", "Manual Therapy", "Recovery Space"];
              return (
                <div key={i} className="group relative rounded-2xl overflow-hidden border shadow-sm hover:shadow-lg transition-all duration-500" style={{ borderColor: CARD_BORDER }}>
                  <img src={src} alt={titles[i]} className="w-full h-64 object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6"><h3 className="text-lg font-bold text-white">{titles[i]}</h3></div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="relative z-10 py-24 md:py-32" style={{ background: BG }}>
        <div className="max-w-6xl mx-auto px-6">
          <SectionHeader badge="Patient Stories" title="Real Results, Real People" accent={ACCENT} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {data.testimonials.map((t: { rating?: number; text: string; name: string }, i: number) => (
              <Card key={i} className="p-6 flex flex-col">
                <div className="flex gap-0.5 mb-4">{Array.from({ length: t.rating || 5 }).map((_, j) => <Star key={j} size={16} weight="fill" style={{ color: "#f59e0b" }} />)}</div>
                <p className="text-sm leading-relaxed flex-1 mb-4" style={{ color: TEXT_SECONDARY }}>&ldquo;{t.text}&rdquo;</p>
                <div className="pt-4 border-t" style={{ borderColor: CARD_BORDER }}><span className="text-sm font-semibold" style={{ color: TEXT_PRIMARY }}>{t.name}</span></div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 py-20 overflow-hidden" style={{ background: ACCENT }}>
        <div className="max-w-4xl mx-auto px-6 text-center">
          <Heart size={48} weight="fill" className="mx-auto mb-6 text-white/80" />
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-4">Start Your Recovery Today</h2>
          <p className="text-lg text-white/90 mb-8 max-w-xl mx-auto">Do not let pain hold you back. Our expert therapists are ready to help you move better and live better.</p>
          <PhoneLink phone={data.phone} className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-white font-bold text-lg hover:bg-white/90 transition-colors" style={{ color: ACCENT }}><Phone size={22} weight="fill" /> {data.phone}</PhoneLink>
        </div>
      </section>

      <section className="relative z-10 py-24 md:py-32" style={{ background: BG_ALT }}>
        <div className="max-w-3xl mx-auto px-6">
          <SectionHeader badge="FAQ" title="Common Questions" accent={ACCENT} />
          <div className="space-y-3">
            {faqs.map((f, i) => <AccordionItem key={i} question={f.q} answer={f.a} isOpen={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} />)}
          </div>
        </div>
      </section>

      <section id="contact" className="relative z-10 py-24 md:py-32" style={{ background: "#ffffff" }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: ACCENT, borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}>Contact Us</span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6" style={{ color: TEXT_PRIMARY }}>Book Your Appointment</h2>
              <p className="leading-relaxed mb-8" style={{ color: TEXT_SECONDARY }}>Ready to start your recovery? Contact {data.businessName} to schedule your initial evaluation.</p>
              <div className="space-y-5">
                <div className="flex items-start gap-4"><div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: ACCENT_GLOW }}><MapPin size={20} weight="duotone" style={{ color: ACCENT }} /></div><div><p className="text-sm font-semibold" style={{ color: TEXT_PRIMARY }}>Address</p><MapLink address={data.address} className="text-sm" style={{ color: TEXT_SECONDARY }} /></div></div>
                <div className="flex items-start gap-4"><div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: ACCENT_GLOW }}><Phone size={20} weight="duotone" style={{ color: ACCENT }} /></div><div><p className="text-sm font-semibold" style={{ color: TEXT_PRIMARY }}>Phone</p><PhoneLink phone={data.phone} className="text-sm" style={{ color: TEXT_SECONDARY }} /></div></div>
                {data.hours && <div className="flex items-start gap-4"><div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: ACCENT_GLOW }}><Clock size={20} weight="duotone" style={{ color: ACCENT }} /></div><div><p className="text-sm font-semibold" style={{ color: TEXT_PRIMARY }}>Hours</p><p className="text-sm whitespace-pre-line" style={{ color: TEXT_SECONDARY }}>{data.hours}</p></div></div>}
              </div>
            </div>
            <Card className="p-8">
              <h3 className="text-xl font-semibold mb-6" style={{ color: TEXT_PRIMARY }}>Request an Appointment</h3>
              <form className="space-y-4" onSubmit={e => e.preventDefault()}>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm mb-1.5" style={{ color: TEXT_SECONDARY }}>First Name</label><input type="text" className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none" style={{ borderColor: CARD_BORDER }} placeholder="Jane" /></div>
                  <div><label className="block text-sm mb-1.5" style={{ color: TEXT_SECONDARY }}>Last Name</label><input type="text" className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none" style={{ borderColor: CARD_BORDER }} placeholder="Smith" /></div>
                </div>
                <div><label className="block text-sm mb-1.5" style={{ color: TEXT_SECONDARY }}>Phone</label><input type="tel" className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none" style={{ borderColor: CARD_BORDER }} placeholder="(555) 123-4567" /></div>
                <div><label className="block text-sm mb-1.5" style={{ color: TEXT_SECONDARY }}>Insurance Provider</label><input type="text" className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none" style={{ borderColor: CARD_BORDER }} placeholder="Blue Cross, Aetna, Medicare..." /></div>
                <div><label className="block text-sm mb-1.5" style={{ color: TEXT_SECONDARY }}>Reason for Visit</label>
                  <select className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none" style={{ borderColor: CARD_BORDER }}>
                    <option value="">Select a specialty</option>
                    {data.services.map((s: { name: string }) => <option key={s.name}>{s.name}</option>)}
                  </select>
                </div>
                <div><label className="block text-sm mb-1.5" style={{ color: TEXT_SECONDARY }}>Additional Notes</label><textarea rows={3} className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none resize-none" style={{ borderColor: CARD_BORDER }} placeholder="Describe your condition or injury..." /></div>
                <MagneticButton className="w-full py-4 rounded-xl text-base font-semibold text-white flex items-center justify-center gap-2 cursor-pointer" style={{ background: ACCENT } as React.CSSProperties}>Request Appointment <ArrowRight size={18} weight="bold" /></MagneticButton>
              </form>
            </Card>
          </div>
        </div>
      </section>

      <section className="relative z-10 py-16" style={{ background: BG }}>
        <div className="max-w-4xl mx-auto px-6 text-center">
          <ShimmerBorder accent={ACCENT}>
            <div className="p-8 md:p-12">
              <ShieldCheck size={48} weight="fill" style={{ color: ACCENT }} className="mx-auto mb-4" />
              <h2 className="text-2xl md:text-4xl font-extrabold mb-4" style={{ color: TEXT_PRIMARY }}>Our Commitment to You</h2>
              <p className="leading-relaxed max-w-2xl mx-auto text-lg" style={{ color: TEXT_SECONDARY }}>{data.businessName} is committed to providing compassionate, evidence-based care. Your recovery and satisfaction are our top priorities.</p>
              <div className="flex flex-wrap justify-center gap-4 mt-8">
                {["Licensed Therapists", "Insurance Accepted", "Personalized Plans", "Proven Results"].map(item => (
                  <span key={item} className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border" style={{ color: ACCENT, borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}><CheckCircle size={16} weight="fill" /> {item}</span>
                ))}
              </div>
            </div>
          </ShimmerBorder>
        </div>
      </section>

      <footer className="relative z-10 border-t py-10" style={{ borderColor: CARD_BORDER, background: "#ffffff" }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3"><Heart size={22} weight="fill" style={{ color: ACCENT }} /><span className="text-lg font-bold" style={{ color: TEXT_PRIMARY }}>{data.businessName}</span></div>
              <p className="text-sm leading-relaxed" style={{ color: TEXT_MUTED }}>{data.about.length > 120 ? data.about.slice(0, 120) + "..." : data.about}</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-3" style={{ color: TEXT_PRIMARY }}>Quick Links</h4>
              <div className="space-y-2">{["Services", "About", "Gallery", "Contact"].map(l => <a key={l} href={`#${l.toLowerCase()}`} className="block text-sm hover:text-blue-700 transition-colors" style={{ color: TEXT_MUTED }}>{l}</a>)}</div>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-3" style={{ color: TEXT_PRIMARY }}>Contact</h4>
              <div className="space-y-2 text-sm" style={{ color: TEXT_MUTED }}>
                <p><PhoneLink phone={data.phone} /></p>
                <p><MapLink address={data.address} /></p>
                {data.socialLinks && Object.entries(data.socialLinks).map(([p, u]) => <a key={p} href={u as string} target="_blank" rel="noopener noreferrer" className="block hover:text-blue-700 capitalize">{p}</a>)}
              </div>
            </div>
          </div>
          <div className="border-t pt-6 flex flex-col md:flex-row items-center justify-between gap-4" style={{ borderColor: CARD_BORDER }}>
            <div className="flex items-center gap-2 text-sm" style={{ color: TEXT_MUTED }}><Heart size={14} weight="fill" style={{ color: ACCENT }} /><span>{data.businessName} &copy; {new Date().getFullYear()}</span></div>
            <div className="flex items-center gap-2 text-xs" style={{ color: TEXT_MUTED }}><BluejayLogo className="w-4 h-4" /><span>Website created by Bluejay Business Solutions</span></div>
          </div>
        </div>
      </footer>

      <ClaimBanner businessName={data.businessName} accentColor={ACCENT} prospectId={data.id} />
      <div className="h-28" />
    </main>
  );
}
