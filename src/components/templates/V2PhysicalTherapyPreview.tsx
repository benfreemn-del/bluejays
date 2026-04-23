"use client";

/* eslint-disable @next/next/no-img-element -- These static marketing and preview components intentionally use plain img tags to preserve existing markup and visual behavior during lint-only cleanup. */
/* eslint-disable react-hooks/purity -- Decorative particle values are intentionally randomized for static visual effects in these marketing pages and previews; this preserves existing appearance without changing business logic. */

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import { Heartbeat, PersonSimpleRun, FirstAidKit, Barbell, Brain, HandHeart, Star, ShieldCheck, Clock, Phone, MapPin, ArrowRight, CheckCircle, CaretDown, List, X, Users, Certificate } from "@phosphor-icons/react";
import type { GeneratedSiteData } from "@/lib/generator";
import BluejayLogo from "../BluejayLogo";
import { MapLink, PhoneLink } from "@/components/templates/MapLink";
import ClaimBanner from "@/components/ClaimBanner";
import { pickFromPool, pickGallery } from "@/lib/stock-image-picker";

const spring = { type: "spring" as const, stiffness: 100, damping: 20 };
const springFast = { type: "spring" as const, stiffness: 200, damping: 25 };
const DEFAULT_BLUE = "#0369a1";
const GREEN = "#16a34a";
const BG = "#0a0f1a";

function getAccent(c?: string) { const a = c || DEFAULT_BLUE; return { ACCENT: a, ACCENT_GLOW: `${a}26` }; }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ICON_MAP: Record<string, any> = { sport: PersonSimpleRun, athlet: PersonSimpleRun, surger: FirstAidKit, post: FirstAidKit, pain: Heartbeat, chronic: Heartbeat, pediatr: HandHeart, child: HandHeart, geriatr: Users, senior: Users, manual: Brain, hands: Brain, strength: Barbell, rehab: Heartbeat };
function getServiceIcon(n: string) { const l = n.toLowerCase(); for (const [k, I] of Object.entries(ICON_MAP)) { if (l.includes(k)) return I; } return Heartbeat; }

const STOCK_HERO_POOL = ["https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1400&q=80"];
const STOCK_ABOUT_POOL = ["https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80"];

function FloatingSparks({ accent }: { accent: string }) {
  const ps = Array.from({ length: 18 }, (_, i) => ({ id: i, x: Math.random() * 100, delay: Math.random() * 8, dur: 5 + Math.random() * 7, size: 2 + Math.random() * 3, op: 0.12 + Math.random() * 0.3, isGreen: Math.random() > 0.5 }));
  return <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden hidden md:block">{ps.map((p) => <motion.div key={p.id} className="absolute rounded-full" style={{ left: `${p.x}%`, width: p.size, height: p.size, background: p.isGreen ? GREEN : accent, willChange: "transform, opacity" }} animate={{ y: ["-10vh", "110vh"], opacity: [0, p.op, p.op, 0] }} transition={{ y: { duration: p.dur, repeat: Infinity, delay: p.delay, ease: "linear" }, opacity: { duration: p.dur, repeat: Infinity, delay: p.delay, times: [0, 0.1, 0.9, 1] } }} />)}</div>;
}

function WavePattern({ opacity = 0.03, accent }: { opacity?: number; accent: string }) {
  return <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }} viewBox="0 0 1000 600" preserveAspectRatio="none"><path d="M0 300 Q250 200 500 300 T1000 300" stroke={accent} strokeWidth="1.5" fill="none" /><path d="M0 350 Q250 250 500 350 T1000 350" stroke={GREEN} strokeWidth="1" fill="none" /></svg>;
}

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) { return <div className={`rounded-2xl border border-white/15 bg-white/[0.08] backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] ${className}`}>{children}</div>; }

function MagneticButton({ children, className = "", onClick, style, href }: { children: React.ReactNode; className?: string; onClick?: () => void; style?: React.CSSProperties; href?: string }) {
  const ref = useRef<HTMLButtonElement>(null); const x = useMotionValue(0); const y = useMotionValue(0); const sx = useSpring(x, springFast); const sy = useSpring(y, springFast);
  const isTD = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
  const mm = useCallback((e: React.MouseEvent) => { if (!ref.current || isTD) return; const r = ref.current.getBoundingClientRect(); x.set((e.clientX - (r.left + r.width / 2)) * 0.25); y.set((e.clientY - (r.top + r.height / 2)) * 0.25); }, [x, y, isTD]);
  const ml = useCallback(() => { x.set(0); y.set(0); }, [x, y]);
  if (href) return <motion.a href={href} ref={ref as unknown as React.Ref<HTMLAnchorElement>} style={{ x: sx, y: sy, willChange: "transform", ...style }} onMouseMove={mm as unknown as React.MouseEventHandler<HTMLAnchorElement>} onMouseLeave={ml} className={className} whileTap={{ scale: 0.97 }}>{children}</motion.a>;
  return <motion.button ref={ref} style={{ x: sx, y: sy, willChange: "transform", ...style }} onMouseMove={mm} onMouseLeave={ml} onClick={onClick} className={className} whileTap={{ scale: 0.97 }}>{children}</motion.button>;
}

function ShimmerBorder({ children, className = "", accent }: { children: React.ReactNode; className?: string; accent: string }) { return <div className={`relative rounded-2xl p-[1px] overflow-hidden ${className}`}><motion.div className="absolute inset-0 rounded-2xl" style={{ background: `conic-gradient(from 0deg, transparent, ${accent}, transparent, ${GREEN}, transparent)`, willChange: "transform" }} animate={{ rotate: [0, 360] }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} /><div className="relative rounded-2xl bg-[#0a0f1a] z-10">{children}</div></div>; }
function SectionHeader({ badge, title, subtitle, accent }: { badge: string; title: string; subtitle?: string; accent: string }) { return <div className="text-center mb-16"><span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: accent, borderColor: `${accent}33`, background: `${accent}0d` }}>{badge}</span><h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white">{title}</h2><div className="h-0.5 w-16 mx-auto mt-4" style={{ background: `linear-gradient(to right, ${accent}, transparent)` }} />{subtitle && <p className="text-slate-400 mt-4 max-w-2xl text-lg leading-relaxed mx-auto">{subtitle}</p>}</div>; }
function AccordionItem({ question, answer, isOpen, onToggle }: { question: string; answer: string; isOpen: boolean; onToggle: () => void }) { return <GlassCard className="overflow-hidden"><button onClick={onToggle} className="w-full flex items-center justify-between p-5 md:p-6 text-left group cursor-pointer"><span className="text-lg font-semibold text-white pr-4">{question}</span><motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={spring}><CaretDown size={20} className="text-slate-400 shrink-0" /></motion.div></button><AnimatePresence initial={false}>{isOpen && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={spring} className="overflow-hidden"><p className="px-5 pb-5 md:px-6 md:pb-6 text-slate-400 leading-relaxed">{answer}</p></motion.div>}</AnimatePresence></GlassCard>; }


function AnimatedSection({ children, className = "" }: { children: React.ReactNode; className?: string }) { return <motion.div initial={{ opacity: 1, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.6, ease: "easeOut" as const }} className={className}>{children}</motion.div>; }

export default function V2PhysicalTherapyPreview({ data }: { data: GeneratedSiteData }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const { ACCENT, ACCENT_GLOW } = getAccent(data.accentColor);
  const uniquePhotos = data.photos ? [...new Set(data.photos)] : [];

  const heroImage = uniquePhotos[0] || pickFromPool(STOCK_HERO_POOL, data.businessName);

  const heroCardImage = uniquePhotos[1] || pickFromPool(STOCK_ABOUT_POOL, data.businessName, 1);

  const aboutImage = uniquePhotos[2] || pickFromPool(STOCK_ABOUT_POOL, data.businessName, 2);

  const conditions = ["Back & Neck Pain", "Sports Injuries", "Post-Surgery Recovery", "Joint Replacement", "Arthritis", "Balance Disorders", "Chronic Pain", "Sciatica"];

  const faqs = [
    { q: `What services does ${data.businessName} offer?`, a: `We offer ${data.services.slice(0, 3).map(s => s.name).join(", ")}, and more. Contact us to schedule your evaluation.` },
    { q: "Do I need a referral?", a: "In most states, you can see a physical therapist through Direct Access without a referral. Some insurance plans may require one — we can help you check." },
    { q: "How long are sessions?", a: "Initial evaluations are 60 minutes. Follow-up sessions are 45-60 minutes of one-on-one care." },
    { q: "What insurance do you accept?", a: `${data.businessName} is in-network with most major insurance providers. Contact us to verify your coverage.` },
    { q: "How many sessions will I need?", a: "Treatment plans vary based on your condition, but most patients see significant improvement within 6-12 sessions. We set clear goals and track progress at every visit." },
    { q: "What should I wear to my appointment?", a: "Wear comfortable, loose-fitting clothing that allows easy movement. Athletic wear works great. We provide any specialized equipment needed." },
    { q: "Do you treat post-surgical patients?", a: "Absolutely. Post-surgical rehabilitation is one of our specialties. We work closely with your surgeon to follow their protocols and accelerate your recovery safely." },
    { q: "Can I do exercises at home between visits?", a: `Yes! ${data.businessName} provides a customized home exercise program with detailed instructions and video guides to supplement your in-clinic treatment.` },
  ];

  const fallbackTestimonials = [{ name: "Richard H.", text: "After knee surgery, they got me back to running in three months. Incredible therapists.", rating: 5 }, { name: "Paula M.", text: "My chronic shoulder pain is finally gone. They created a personalized plan that actually worked.", rating: 5 }, { name: "Edward T.", text: "Patient, knowledgeable, and genuinely invested in my recovery. Best PT experience ever.", rating: 5 }];
  const testimonials = data.testimonials?.length > 0 ? data.testimonials : fallbackTestimonials;

  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden" style={{ fontFamily: "Lato, system-ui, sans-serif", background: BG, color: "#f1f5f9" }}>
      <FloatingSparks accent={ACCENT} />

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-4">
          <GlassCard className="flex items-center justify-between px-4 md:px-6 py-3">
            <div className="flex items-center gap-2">
              <Heartbeat size={24} weight="fill" style={{ color: ACCENT }} />
              <span className="text-lg font-bold tracking-tight text-white">
                {data.businessName}
              </span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
              <a href="#services" className="hover:text-white transition-colors">Services</a>
              <a href="#about" className="hover:text-white transition-colors">About</a>
              <a href="#conditions" className="hover:text-white transition-colors">Conditions</a>
              <a href="#contact" className="hover:text-white transition-colors">Contact</a>
            </div>
            <div className="flex items-center gap-3">
              <MagneticButton
                className="px-4 md:px-5 py-2 rounded-full text-sm font-semibold text-white transition-colors cursor-pointer"
                style={{ background: ACCENT } as React.CSSProperties}
              >
                Book Now
              </MagneticButton>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
              >
                {mobileMenuOpen ? <X size={24} /> : <List size={24} />}
              </button>
            </div>
          </GlassCard>
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden mt-2 overflow-hidden"
              >
                <GlassCard className="flex flex-col gap-1 px-4 py-4">
                  {["Services", "About", "Conditions", "Contact"].map((l) => (
                    <a
                      key={l}
                      href={`#${l.toLowerCase()}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-3 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      {l}
                    </a>
                  ))}
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative min-h-[100dvh] flex items-center pt-24 z-10 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt={data.businessName}
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-black/70" />
        </div>
        <WavePattern opacity={0.04} accent={ACCENT} />
        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          <div className="space-y-8">
            <div>
              <p className="text-sm uppercase tracking-widest mb-4" style={{ color: GREEN }}>
                Evidence-Based Physical Therapy
              </p>
              <h1
                className="text-3xl md:text-6xl tracking-tighter leading-none font-bold text-white"
                style={{
                  textShadow: "0 2px 20px rgba(0,0,0,0.8), 0 4px 40px rgba(0,0,0,0.5)",
                }}
              >
                {data.tagline}
              </h1>
            </div>
            <p
              className="text-lg text-white/80 max-w-md leading-relaxed"
              style={{ textShadow: "0 1px 8px rgba(0,0,0,0.6)" }}
            >
              {(() => {
                const t = data.about;
                if (t.length <= 180) return t;
                const dot = t.indexOf(".", 80);
                return dot > 0 && dot < 220
                  ? t.slice(0, dot + 1)
                  : t.slice(0, 180).trim() + "...";
              })()}
            </p>
            {/* Trust badges */}
            <div className="flex flex-wrap gap-3">
              {[
                "Board Certified",
                `${data.googleRating || "5.0"}-Star Rated`,
                "Direct Access",
              ].map((badge) => (
                <span
                  key={badge}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border backdrop-blur-md"
                  style={{
                    color: ACCENT,
                    borderColor: `${ACCENT}4d`,
                    background: "rgba(0,0,0,0.4)",
                  }}
                >
                  <CheckCircle size={14} weight="fill" /> {badge}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap gap-4">
              <MagneticButton
                className="px-8 py-4 rounded-full text-base font-semibold text-white flex items-center gap-2 cursor-pointer"
                style={{ background: ACCENT } as React.CSSProperties}
              >
                Schedule Evaluation <ArrowRight size={18} weight="bold" />
              </MagneticButton>
              <MagneticButton
                href={`tel:${data.phone.replace(/\D/g, "")}`}
                className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/15 flex items-center gap-2 cursor-pointer"
              >
                <Phone size={18} weight="duotone" /> <PhoneLink phone={data.phone} />
              </MagneticButton>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-slate-400">
              <span className="flex items-center gap-2">
                <MapPin size={16} weight="duotone" style={{ color: ACCENT }} />
                <MapLink address={data.address} />
              </span>
              <span className="flex items-center gap-2">
                <Clock size={16} weight="duotone" style={{ color: ACCENT }} />
                {data.hours || "Mon-Fri 7AM-7PM"}
              </span>
            </div>
            {/* Availability badge */}
            <div
              className="inline-flex items-center gap-3 px-5 py-3 rounded-xl border"
              style={{ borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}
            >
              <motion.div
                className="w-3 h-3 rounded-full"
                style={{ background: "#22c55e" }}
                animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <div>
                <p className="text-sm font-bold text-white">Same-Day Appointments</p>
                <p className="text-xs text-slate-400">No referral needed in most states</p>
              </div>
            </div>
          </div>
          <div className="hidden md:block relative">
            <div className="relative rounded-2xl overflow-hidden border border-white/15">
              <img
                src={heroCardImage}
                alt={data.businessName}
                className="w-full h-[500px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1a] via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6">
                <div
                  className="px-4 py-2 rounded-full backdrop-blur-md bg-black/50 border flex items-center gap-2"
                  style={{ borderColor: `${ACCENT}4d` }}
                >
                  <Certificate size={18} weight="fill" style={{ color: ACCENT }} />
                  <span className="text-sm font-semibold text-white">Board Certified</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="relative z-10 py-16 overflow-hidden border-y" style={{ borderColor: `${ACCENT}1a` }}>
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, #0c1220 0%, ${BG} 100%)` }} />
        <WavePattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10"><div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {data.stats.map((stat, i) => { const icons = [Heartbeat, Clock, CheckCircle, Star]; const Icon = icons[i % icons.length]; return <div key={stat.label} className="text-center"><div className="flex items-center justify-center gap-2 mb-2"><Icon size={22} weight="fill" style={{ color: ACCENT }} /><span className="text-3xl md:text-4xl font-extrabold text-white">{stat.value}</span></div><span className="text-slate-500 text-sm font-medium tracking-wide uppercase">{stat.label}</span></div>; })}
        </div></div>
      </section>

      {/* SERVICES */}
      <section id="services" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #0c1220 50%, ${BG} 100%)` }} />
        <WavePattern accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Our Services" title="Specialized Physical Therapy" subtitle={`${data.businessName} provides expert rehabilitation for a full range of conditions.`} accent={ACCENT} />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">{data.services.map((svc, i) => { const Icon = getServiceIcon(svc.name); return <div key={svc.name} className="group relative p-7 rounded-2xl border border-white/[0.10] hover:border-opacity-30 transition-all duration-500 overflow-hidden bg-white/[0.07]"><div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: `radial-gradient(circle at 50% 0%, ${ACCENT}15, transparent 70%)` }} /><div className="relative z-10"><div className="flex items-start justify-between mb-5"><div className="w-12 h-12 rounded-xl flex items-center justify-center border" style={{ background: ACCENT_GLOW, borderColor: `${ACCENT}33` }}><Icon size={24} weight="duotone" style={{ color: ACCENT }} /></div><span className="text-xs font-mono text-slate-600">{String(i + 1).padStart(2, "0")}</span></div><h3 className="text-lg font-bold text-white mb-2">{svc.name}</h3><p className="text-sm text-slate-400 leading-relaxed">{svc.description || ""}</p>{svc.price && <p className="text-sm font-semibold mt-3" style={{ color: ACCENT }}>{svc.price}</p>}</div></div>; })}</div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #0d1220 50%, ${BG} 100%)` }} />
        <div className="max-w-6xl mx-auto px-6 relative z-10"><div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="relative"><div className="rounded-2xl overflow-hidden border border-white/15"><img src={aboutImage} alt={`${data.businessName} clinic`} className="w-full h-[400px] object-cover" /></div><div className="absolute -bottom-4 -right-4 md:bottom-6 md:-right-6"><div className="px-5 py-3 rounded-xl backdrop-blur-md border text-white font-bold text-sm shadow-lg" style={{ background: `${ACCENT}e6`, borderColor: `${ACCENT}80` }}>{data.stats[0] ? `${data.stats[0].value} ${data.stats[0].label}` : "Expert Care"}</div></div></div>
          <div><span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: ACCENT, borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}>About Us</span><h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6 text-white">Your Recovery, Our Mission</h2><p className="text-slate-400 leading-relaxed mb-8">{data.about}</p>
            <div className="grid grid-cols-2 gap-4">{[{ icon: Certificate, label: "Board Certified" }, { icon: CheckCircle, label: "One-on-One Care" }, { icon: Star, label: "5-Star Rated" }, { icon: ShieldCheck, label: "In-Network" }].map((b) => <GlassCard key={b.label} className="p-4 flex items-center gap-3"><div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: ACCENT_GLOW }}><b.icon size={20} weight="duotone" style={{ color: ACCENT }} /></div><span className="text-sm font-semibold text-white">{b.label}</span></GlassCard>)}</div>
          </div>
        </div></div>
      </section>

      {/* CONDITIONS */}
      <section id="conditions" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #0c1220 50%, ${BG} 100%)` }} />
        <WavePattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <AnimatedSection><SectionHeader badge="Conditions" title="Conditions We Treat" accent={ACCENT} /></AnimatedSection>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">{conditions.map((c) => <GlassCard key={c} className="p-4 flex items-center gap-3"><CheckCircle size={18} weight="fill" style={{ color: GREEN }} /><span className="text-sm font-medium text-white">{c}</span></GlassCard>)}</div>
        </div>
      </section>

      {/* RECOVERY TIMELINE */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(180deg, ${BG} 0%, #0d1220 50%, ${BG} 100%)` }}
        />
        <WavePattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <AnimatedSection>
            <SectionHeader
              badge="Recovery"
              title="Your Path to Recovery"
              subtitle="A structured approach to getting you back to full function."
              accent={ACCENT}
            />
          </AnimatedSection>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                phase: "Phase 1",
                title: "Pain Relief",
                weeks: "Weeks 1-2",
                desc: "Reduce pain and inflammation. Restore basic range of motion through gentle manual therapy and modalities.",
                color: "#ef4444",
              },
              {
                phase: "Phase 2",
                title: "Strengthening",
                weeks: "Weeks 3-6",
                desc: "Progressive exercises to rebuild strength, stability, and confidence in movement.",
                color: "#f59e0b",
              },
              {
                phase: "Phase 3",
                title: "Return to Activity",
                weeks: "Weeks 6-12",
                desc: "Sport-specific or activity-specific training to get you back to doing what you love.",
                color: "#22c55e",
              },
            ].map((phase) => (
              <GlassCard key={phase.phase} className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span
                    className="text-xs font-bold px-3 py-1 rounded-full"
                    style={{
                      color: phase.color,
                      background: `${phase.color}1a`,
                      border: `1px solid ${phase.color}33`,
                    }}
                  >
                    {phase.phase}
                  </span>
                  <span className="text-xs text-slate-500">{phase.weeks}</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{phase.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{phase.desc}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* BODY AREA QUIZ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(180deg, ${BG} 0%, #0c1220 50%, ${BG} 100%)` }}
        />
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <AnimatedSection>
            <SectionHeader badge="Quick Assessment" title="Where Does It Hurt?" accent={ACCENT} />
          </AnimatedSection>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { area: "Back & Spine", rec: "Spinal mobilization, core strengthening, posture correction" },
              { area: "Neck & Shoulders", rec: "Manual therapy, ergonomic guidance, strengthening" },
              { area: "Knee & Hip", rec: "Joint mobilization, balance training, targeted exercises" },
              { area: "Ankle & Foot", rec: "Gait analysis, stability training, proprioception work" },
              { area: "Hand & Wrist", rec: "Fine motor rehab, splinting guidance, grip strengthening" },
              { area: "Post-Surgery", rec: "Protocol-based rehab, scar tissue management, range restoration" },
            ].map((item) => (
              <GlassCard
                key={item.area}
                className="p-5 cursor-pointer hover:border-white/20 transition-all duration-300"
              >
                <Heartbeat size={24} weight="duotone" style={{ color: ACCENT }} className="mb-3" />
                <h4 className="text-sm font-bold text-white mb-1">{item.area}</h4>
                <p className="text-xs text-slate-500">{item.rec}</p>
              </GlassCard>
            ))}
          </div>
          <div className="mt-8 text-center">
            <MagneticButton
              href={`tel:${data.phone.replace(/\D/g, "")}`}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-base font-semibold text-white cursor-pointer"
              style={{ background: ACCENT } as React.CSSProperties}
            >
              <Phone size={18} weight="fill" /> Schedule Your Evaluation
            </MagneticButton>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(180deg, ${BG} 0%, #0d1220 50%, ${BG} 100%)` }}
        />
        <WavePattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <AnimatedSection>
            <SectionHeader
              badge="Pricing"
              title="Session Options"
              subtitle="Most insurance accepted. Self-pay options available."
              accent={ACCENT}
            />
          </AnimatedSection>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Initial Evaluation", price: "$150", desc: "60-minute comprehensive assessment and treatment plan" },
              { name: "Follow-Up Session", price: "$95", desc: "45-60 minutes of one-on-one care", popular: true },
              { name: "Wellness Package", price: "$399", desc: "5 sessions with progress tracking and home program" },
            ].map((tier) => (
              <GlassCard
                key={tier.name}
                className={`p-8 text-center ${tier.popular ? "ring-2 ring-offset-2 ring-offset-[#0a0f1a]" : ""}`}
              >
                {tier.popular && (
                  <span
                    className="inline-block text-xs font-bold uppercase tracking-wider mb-4 px-3 py-1 rounded-full text-white"
                    style={{ background: ACCENT }}
                  >
                    Most Common
                  </span>
                )}
                <h3 className="text-lg font-bold text-white mb-2">{tier.name}</h3>
                <p className="text-4xl font-black mb-2" style={{ color: ACCENT }}>
                  {tier.price}
                </p>
                <p className="text-sm text-slate-400 mb-6">{tier.desc}</p>
                <MagneticButton
                  className="w-full py-3 rounded-full text-sm font-semibold text-white cursor-pointer"
                  style={{ background: tier.popular ? ACCENT : `${ACCENT}33` } as React.CSSProperties}
                >
                  Book Now
                </MagneticButton>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* INSURANCE BADGES */}
      <section className="relative z-10 py-16 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(180deg, ${BG} 0%, #0c1220 50%, ${BG} 100%)` }}
        />
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <AnimatedSection>
            <SectionHeader badge="Insurance" title="Insurance We Accept" accent={ACCENT} />
          </AnimatedSection>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              "Blue Cross Blue Shield",
              "Aetna",
              "UnitedHealthcare",
              "Cigna",
              "Medicare",
              "Workers Comp",
              "Auto Accident",
              "Self-Pay Welcome",
            ].map((ins) => (
              <span
                key={ins}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium border"
                style={{ color: ACCENT, borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}
              >
                <ShieldCheck size={16} weight="fill" /> {ins}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* COMPARISON TABLE */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(180deg, ${BG} 0%, #0c1220 50%, ${BG} 100%)` }}
        />
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <AnimatedSection>
            <SectionHeader
              badge="Compare"
              title={`${data.businessName} vs. The Alternatives`}
              accent={ACCENT}
            />
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
                  {[
                    { feature: "1-on-1 Care Every Session", them: "Shared Attention" },
                    { feature: "Board Certified Therapists", them: "Varies" },
                    { feature: "Direct Access (No Referral)", them: "Referral Required" },
                    { feature: "60-Minute Evaluations", them: "30 Minutes" },
                    { feature: "Customized Home Programs", them: "Generic Handouts" },
                    { feature: "Same-Day Appointments", them: "2-Week Wait" },
                    { feature: "Progress Reports to Physician", them: "On Request Only" },
                  ].map((row, i) => (
                    <tr key={row.feature} className={i < 6 ? "border-b border-white/8" : ""}>
                      <td className="p-4 text-slate-300">{row.feature}</td>
                      <td className="p-4 text-center">
                        <CheckCircle
                          size={20}
                          weight="fill"
                          style={{ color: "#22c55e" }}
                          className="mx-auto"
                        />
                      </td>
                      <td className="p-4 text-center text-slate-500">{row.them}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* VIDEO PLACEHOLDER */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(180deg, ${BG} 0%, #0d1220 50%, ${BG} 100%)` }}
        />
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <AnimatedSection>
            <SectionHeader badge="Inside Our Clinic" title="Take a Virtual Tour" accent={ACCENT} />
          </AnimatedSection>
          <div className="relative rounded-2xl overflow-hidden border border-white/15 group cursor-pointer">
            <img
              src={heroImage}
              alt="Virtual tour"
              className="w-full h-[400px] object-cover"
            />
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center group-hover:bg-black/50 transition-colors">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{ background: `${ACCENT}cc` }}
              >
                <Heartbeat size={40} weight="fill" className="text-white" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* GOOGLE REVIEWS + TESTIMONIALS */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(180deg, ${BG} 0%, #0d1220 50%, ${BG} 100%)` }}
        />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <AnimatedSection>
            <SectionHeader badge="Testimonials" title="Patient Success Stories" accent={ACCENT} />
          </AnimatedSection>
          {/* Google reviews summary */}
          <div className="text-center mb-12">
            <div
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border"
              style={{ borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}
            >
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={18} weight="fill" style={{ color: GREEN }} />
                ))}
              </div>
              <span className="text-white font-bold">{data.googleRating || "5.0"}</span>
              <span className="text-slate-400 text-sm">
                ({data.reviewCount || "50"}+ reviews)
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <GlassCard key={i} className="p-6 h-full flex flex-col">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.rating || 5 }).map((_, j) => (
                    <Star key={j} size={16} weight="fill" style={{ color: GREEN }} />
                  ))}
                </div>
                <p className="text-slate-300 leading-relaxed flex-1 text-sm mb-4">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="pt-4 border-t border-white/8 flex items-center gap-2">
                  <CheckCircle size={16} weight="fill" style={{ color: "#22c55e" }} />
                  <span className="text-sm font-semibold text-white">{t.name}</span>
                  <span className="text-xs text-slate-500">Verified</span>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICE AREA */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(180deg, ${BG} 0%, #0c1220 50%, ${BG} 100%)` }}
        />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <AnimatedSection>
            <SectionHeader badge="Location" title="Convenient Location" accent={ACCENT} />
          </AnimatedSection>
          <div className="text-center">
            <GlassCard className="p-8 inline-block">
              <div className="flex items-center gap-3 text-lg mb-3">
                <MapPin size={24} weight="duotone" style={{ color: ACCENT }} />
                <MapLink address={data.address} className="text-white font-semibold" />
              </div>
              <p className="text-slate-400 text-sm mb-4">
                {data.hours || "Mon-Fri 7AM-7PM"}
              </p>
              <div className="flex items-center justify-center gap-2">
                <motion.div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ background: "#22c55e" }}
                  animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <span className="text-sm font-semibold" style={{ color: "#22c55e" }}>
                  Same-Day Appointments Available
                </span>
              </div>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #0d1222 50%, ${BG} 100%)` }} />
        <WavePattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Difference" title="Why Choose Our Clinic" accent={ACCENT} />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Certificate, title: "Board Certified", desc: "Licensed physical therapists with advanced specialization certifications." },
              { icon: HandHeart, title: "One-on-One Care", desc: "Full attention every session. No rotating between patients." },
              { icon: Clock, title: "Flexible Hours", desc: "Early morning and evening appointments to fit your schedule." },
              { icon: ShieldCheck, title: "Direct Access", desc: "No referral needed in most cases. Start treatment sooner." },
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

      {/* HOME EXERCISE PROGRAM */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #0c1220 50%, ${BG} 100%)` }} />
        <WavePattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Home Program" title="Your Recovery Continues at Home" subtitle="Every patient receives a personalized home exercise program to accelerate results between visits." accent={ACCENT} />
          <GlassCard className="p-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold text-white mb-4">What You Receive</h3>
                <ul className="space-y-3">
                  {[
                    "Customized exercise program tailored to your condition",
                    "Video demonstrations for proper form and technique",
                    "Progressive difficulty as you improve",
                    "Pain management strategies for home use",
                    "Ergonomic recommendations for work and daily life",
                    "Regular program updates based on your progress",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-slate-400">
                      <CheckCircle size={16} weight="fill" className="mt-0.5 shrink-0" style={{ color: ACCENT }} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-4">Recovery Tips</h3>
                <ul className="space-y-3">
                  {[
                    "Consistency beats intensity — do your exercises daily",
                    "Use ice for 15-20 minutes after exercises if needed",
                    "Stay hydrated and get adequate sleep for healing",
                    "Track your pain levels to share with your therapist",
                    "Avoid pushing through sharp pain — listen to your body",
                    "Celebrate small wins — every improvement counts",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-slate-400">
                      <Star size={16} weight="duotone" className="mt-0.5 shrink-0" style={{ color: GREEN }} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* CONDITION GUIDE */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #0c1220 50%, ${BG} 100%)` }} />
        <WavePattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Conditions" title="Conditions We Treat" subtitle="From acute injuries to chronic pain, we develop personalized treatment plans for every condition." accent={ACCENT} />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { condition: "Back & Spine Pain", desc: "Herniated discs, sciatica, spinal stenosis, and chronic lower back issues", icon: Heartbeat },
              { condition: "Sports Injuries", desc: "ACL tears, rotator cuff, sprains, strains, and concussion recovery", icon: PersonSimpleRun },
              { condition: "Post-Surgical Rehab", desc: "Joint replacement, spinal fusion, arthroscopy, and reconstructive surgery", icon: FirstAidKit },
              { condition: "Neck & Shoulder", desc: "Whiplash, frozen shoulder, impingement, and cervical disc problems", icon: Brain },
              { condition: "Joint Pain", desc: "Arthritis, bursitis, tendinitis, and degenerative joint conditions", icon: Barbell },
              { condition: "Balance & Falls", desc: "Vestibular rehab, fall prevention, and gait training for seniors", icon: Users },
              { condition: "Hand & Wrist", desc: "Carpal tunnel, trigger finger, fracture recovery, and repetitive strain", icon: HandHeart },
              { condition: "Chronic Pain", desc: "Fibromyalgia, chronic fatigue, complex regional pain syndrome", icon: ShieldCheck },
            ].map((item) => (
              <GlassCard key={item.condition} className="p-5">
                <div className="w-10 h-10 rounded-full mb-3 flex items-center justify-center" style={{ background: `${ACCENT}15`, border: `1px solid ${ACCENT}22` }}>
                  <item.icon size={20} weight="duotone" style={{ color: ACCENT }} />
                </div>
                <h4 className="text-sm font-bold text-white mb-1">{item.condition}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* EQUIPMENT SECTION */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #0d1222 50%, ${BG} 100%)` }} />
        <WavePattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Facility" title="Our Treatment Equipment" subtitle="State-of-the-art equipment for faster, more effective rehabilitation." accent={ACCENT} />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { title: "Therapeutic Ultrasound", desc: "Deep tissue heating to reduce inflammation and accelerate healing" },
              { title: "Electrical Stimulation", desc: "TENS and NMES for pain management and muscle re-education" },
              { title: "Aquatic Therapy Pool", desc: "Warm water therapy reduces joint stress during recovery exercises" },
              { title: "Anti-Gravity Treadmill", desc: "AlterG unweighting allows pain-free walking and running rehab" },
              { title: "Dry Needling", desc: "Trigger point release for chronic muscle pain and tension" },
              { title: "Exercise Gym", desc: "Full rehabilitation gym with strength and flexibility equipment" },
            ].map((item) => (
              <GlassCard key={item.title} className="p-5 text-center">
                <h4 className="text-sm font-bold text-white mb-2">{item.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* RECOVERY STORIES */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #0c1220 50%, ${BG} 100%)` }} />
        <WavePattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Outcomes" title="Recovery Success Stories" subtitle="Real patients, real results. Every journey is unique, but the destination is the same: a better quality of life." accent={ACCENT} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { patient: "Former Marathon Runner", condition: "ACL Reconstruction", result: "Back to running in 6 months", timeline: "24 sessions over 6 months" },
              { patient: "Office Professional", condition: "Chronic Lower Back Pain", result: "Pain-free after 3 months", timeline: "12 sessions over 3 months" },
              { patient: "Retired Teacher", condition: "Total Knee Replacement", result: "Walking without assistance in 8 weeks", timeline: "16 sessions over 2 months" },
            ].map((story) => (
              <GlassCard key={story.patient} className="p-6">
                <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: ACCENT }}>{story.condition}</div>
                <h4 className="text-lg font-bold text-white mb-2">{story.result}</h4>
                <p className="text-sm text-slate-400 mb-3">{story.patient}</p>
                <div className="flex items-center gap-2 text-xs text-slate-500 pt-3 border-t border-white/8">
                  <Clock size={14} weight="duotone" style={{ color: ACCENT }} />
                  <span>{story.timeline}</span>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* MID-PAGE CTA */}
      <section className="relative z-10 py-16 overflow-hidden">
        <div className="absolute inset-0" style={{ background: ACCENT }} />
        <div className="absolute inset-0 bg-black/20" />
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
            Start Moving Better Today
          </h2>
          <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
            No referral needed in most cases. Schedule your evaluation and take the first step toward recovery.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <PhoneLink phone={data.phone} className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-sm font-bold" style={{ color: ACCENT }}>
              <Phone size={18} weight="fill" /> Schedule Evaluation
            </PhoneLink>
            <a href="#contact" className="inline-flex items-center gap-2 px-8 py-4 rounded-full border-2 border-white text-white text-sm font-bold hover:bg-white/10 transition-colors">
              Learn More <ArrowRight size={18} weight="bold" />
            </a>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #0c1220 50%, ${BG} 100%)` }} />
        <WavePattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <AnimatedSection><SectionHeader badge="FAQ" title="Common Questions" accent={ACCENT} /></AnimatedSection>
          <div className="space-y-3">{faqs.map((f, i) => <AccordionItem key={i} question={f.q} answer={f.a} isOpen={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} />)}</div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-20 overflow-hidden"><div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT}cc)` }} /><div className="max-w-4xl mx-auto px-6 relative z-10 text-center"><Heartbeat size={48} weight="fill" className="mx-auto mb-6 text-white/70" /><h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-4">Start Your Recovery Today</h2><p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">No referral needed in most cases. Schedule your evaluation today.</p><PhoneLink phone={data.phone} className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-white text-black font-bold text-lg hover:bg-white/90 transition-colors"><Phone size={20} weight="fill" /> {data.phone}</PhoneLink></div></section>

      {/* CONTACT */}
      <section id="contact" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(180deg, ${BG} 0%, #0d1220 50%, ${BG} 100%)` }}
        />
        <WavePattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <span
                className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border"
                style={{ color: ACCENT, borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}
              >
                Contact Us
              </span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6 text-white">
                Schedule Your Evaluation
              </h2>
              <p className="text-slate-400 leading-relaxed mb-8">
                Contact {data.businessName} to take the first step toward recovery.
              </p>
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: ACCENT_GLOW }}
                  >
                    <MapPin size={20} weight="duotone" style={{ color: ACCENT }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Address</p>
                    <MapLink address={data.address} className="text-sm text-slate-400" />
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: ACCENT_GLOW }}
                  >
                    <Phone size={20} weight="duotone" style={{ color: ACCENT }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Phone</p>
                    <PhoneLink phone={data.phone} className="text-sm text-slate-400" />
                  </div>
                </div>
                {data.hours && (
                  <div className="flex items-start gap-4">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: ACCENT_GLOW }}
                    >
                      <Clock size={20} weight="duotone" style={{ color: ACCENT }} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">Hours</p>
                      <p className="text-sm text-slate-400 whitespace-pre-line">{data.hours}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <GlassCard className="p-8">
              <h3 className="text-xl font-semibold text-white mb-6">Request an Appointment</h3>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-1.5">First Name</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 focus:outline-none text-sm"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1.5">Last Name</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 focus:outline-none text-sm"
                      placeholder="Doe"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">Phone</label>
                  <input
                    type="tel"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 focus:outline-none text-sm"
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">Condition</label>
                  <select className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white focus:outline-none text-sm">
                    <option value="" className="bg-neutral-900">Select condition</option>
                    {data.services.map((s) => (
                      <option key={s.name} value={s.name.toLowerCase()} className="bg-neutral-900">
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">Additional Details</label>
                  <textarea
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 focus:outline-none text-sm resize-none"
                    placeholder="Tell us about your condition or injury..."
                  />
                </div>
                <MagneticButton
                  className="w-full py-4 rounded-xl text-base font-semibold text-white flex items-center justify-center gap-2 cursor-pointer"
                  style={{ background: ACCENT } as React.CSSProperties}
                >
                  Request Appointment <ArrowRight size={18} weight="bold" />
                </MagneticButton>
              </form>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* CERTIFICATIONS */}
      <section className="relative z-10 py-16 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(180deg, ${BG} 0%, #0c1220 50%, ${BG} 100%)` }}
        />
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <div className="flex flex-wrap justify-center gap-4">
            {[
              "Board Certified",
              "Direct Access",
              "One-on-One Care",
              "Most Insurance Accepted",
              "Same-Day Available",
              "Evidence-Based",
            ].map((cert) => (
              <span
                key={cert}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border"
                style={{ color: ACCENT, borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}
              >
                <CheckCircle size={16} weight="fill" /> {cert}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* GUARANTEE */}
      <section className="relative z-10 py-16 overflow-hidden"><div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #0c1220 100%)` }} /><div className="max-w-4xl mx-auto px-6 relative z-10 text-center"><ShimmerBorder accent={ACCENT}><div className="p-8 md:p-12"><ShieldCheck size={48} weight="fill" style={{ color: ACCENT }} className="mx-auto mb-4" /><h2 className="text-2xl md:text-4xl font-extrabold text-white mb-4">Our Patient Promise</h2><p className="text-slate-400 leading-relaxed max-w-2xl mx-auto text-lg">One-on-one care with your therapist at every session. {data.businessName} is committed to your recovery.</p><div className="flex flex-wrap justify-center gap-4 mt-8">{["Board Certified", "Direct Access", "One-on-One Care", "Insurance Accepted"].map((item) => <span key={item} className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border" style={{ color: ACCENT, borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}><CheckCircle size={16} weight="fill" /> {item}</span>)}</div></div></ShimmerBorder></div></section>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-white/8 py-10 overflow-hidden"><div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #060a12 100%)` }} /><div className="mx-auto max-w-6xl px-6 relative z-10"><div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8"><div><div className="flex items-center gap-2 mb-3"><Heartbeat size={22} weight="fill" style={{ color: ACCENT }} /><span className="text-lg font-bold text-white">{data.businessName}</span></div><p className="text-sm text-slate-500 leading-relaxed">{data.about.length > 120 ? data.about.slice(0, 120).trim() + "..." : data.about}</p></div><div><h4 className="text-sm font-semibold text-white mb-3">Quick Links</h4><div className="space-y-2">{["Services", "About", "Conditions", "Contact"].map((l) => <a key={l} href={`#${l.toLowerCase()}`} className="block text-sm text-slate-500 hover:text-white transition-colors">{l}</a>)}</div></div><div><h4 className="text-sm font-semibold text-white mb-3">Contact</h4><div className="space-y-2 text-sm text-slate-500"><p><PhoneLink phone={data.phone} /></p><p><MapLink address={data.address} /></p>{data.socialLinks && Object.entries(data.socialLinks).map(([p, url]) => <a key={p} href={url} target="_blank" rel="noopener noreferrer" className="block hover:text-white transition-colors capitalize">{p}</a>)}</div></div></div><div className="border-t border-white/8 pt-6 flex flex-col md:flex-row items-center justify-between gap-4"><div className="flex items-center gap-2 text-sm text-slate-500"><Heartbeat size={14} weight="fill" style={{ color: ACCENT }} /><span>{data.businessName} &copy; {new Date().getFullYear()}</span></div><div className="flex items-center gap-2 text-xs text-slate-600"><BluejayLogo className="w-4 h-4" /><span>Created by <a href="https://bluejayportfolio.com" target="_blank" rel="noopener noreferrer" style={{textDecoration:"underline"}}>bluejayportfolio.com</a></span></div></div></div></footer>

      <ClaimBanner businessName={data.businessName} accentColor={ACCENT} prospectId={data.id} />
      <div className="h-14 md:h-28" />
    </main>
  );
}
